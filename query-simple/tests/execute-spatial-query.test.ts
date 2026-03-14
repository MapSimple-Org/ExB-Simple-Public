// Mock shared-code/mapsimple-common
const mockDebugLogger = { log: jest.fn() }
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => mockDebugLogger
}))

// Mock jimu-core
const mockGetDataSource = jest.fn()
jest.mock('jimu-core', () => ({
  DataSourceManager: {
    getInstance: jest.fn().mockReturnValue({
      getDataSource: mockGetDataSource
    })
  },
  Immutable: jest.fn((v: any) => v)
}))

// Mock config
jest.mock('../src/config', () => ({
  FieldsType: {
    PopupSetting: 'PopupSetting',
    SelectAttributes: 'SelectAttributes',
    CustomTemplate: 'CustomTemplate'
  }
}))

// Mock query-utils
jest.mock('../src/runtime/query-utils', () => ({
  combineFields: jest.fn(),
  resolvePopupOutFields: jest.fn()
}))

import { convertSpatialResultsToRecords, type SpatialQueryResult } from '../src/runtime/execute-spatial-query'

// --- Helpers ---

function createMockGraphic (attributes: Record<string, any> = {}): any {
  return {
    attributes,
    sourceLayer: undefined,
    layer: undefined
  }
}

function createMockDataSource (id: string, overrides: any = {}): any {
  const associatedLayer = overrides.associatedLayer || null
  return {
    id,
    layer: {
      associatedLayer,
      title: overrides.layerTitle || 'MockLayer',
      ...overrides.layerProps
    },
    buildRecord: jest.fn().mockImplementation((graphic: any) => ({
      feature: {
        attributes: { ...graphic.attributes }
      }
    }))
  }
}

function createMockSpatialResult (layerResults: any[] = [], errors: any[] = []): SpatialQueryResult {
  const totalFeatureCount = layerResults.reduce((sum: number, lr: any) => sum + lr.featureCount, 0)
  return {
    layerResults,
    totalFeatureCount,
    totalTimeMs: 100,
    errors
  }
}

function createMockLayerResult (overrides: any = {}): any {
  const features = overrides.features || []
  return {
    layerId: overrides.layerId || 'layer_1',
    layerTitle: overrides.layerTitle || 'Test Layer',
    featureCount: overrides.featureCount ?? features.length,
    featureSet: {
      features,
      geometryType: overrides.geometryType || 'esriGeometryPoint',
      exceededTransferLimit: overrides.exceededTransferLimit ?? false
    },
    queryTimeMs: overrides.queryTimeMs || 50,
    exceededTransferLimit: overrides.exceededTransferLimit ?? false
  }
}

// --- Tests ---

describe('execute-spatial-query unit tests', () => {
  beforeEach(() => {
    mockDebugLogger.log.mockClear()
    mockGetDataSource.mockReset()
  })

  describe('convertSpatialResultsToRecords', () => {
    it('should return empty array when result has no layerResults', () => {
      const result = createMockSpatialResult([])

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      expect(records).toEqual([])
    })

    it('should skip layers with featureCount === 0', () => {
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        featureCount: 0,
        features: []
      })
      const result = createMockSpatialResult([layerResult])

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      expect(records).toEqual([])
      // DataSourceManager should never be called for skipped layers
      expect(mockGetDataSource).not.toHaveBeenCalled()
    })

    it('should skip layers where DataSource is not found and log warning', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'missing_layer',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])
      mockGetDataSource.mockReturnValue(null)

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      expect(records).toEqual([])
      expect(mockDebugLogger.log).toHaveBeenCalledWith('SPATIAL', expect.objectContaining({
        event: 'convert-records-ds-not-found',
        layerId: 'missing_layer',
        widgetId: 'widget_1'
      }))
    })

    it('should build records correctly for a single layer with features', () => {
      const graphic1 = createMockGraphic({ OBJECTID: 1, NAME: 'Feature A' })
      const graphic2 = createMockGraphic({ OBJECTID: 2, NAME: 'Feature B' })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        layerTitle: 'Parks',
        features: [graphic1, graphic2]
      })
      const result = createMockSpatialResult([layerResult])
      const mockDS = createMockDataSource('layer_1')
      mockGetDataSource.mockReturnValue(mockDS)

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      expect(records.length).toBe(2)
      expect(mockDS.buildRecord).toHaveBeenCalledTimes(2)
      expect(mockDS.buildRecord).toHaveBeenCalledWith(graphic1)
      expect(mockDS.buildRecord).toHaveBeenCalledWith(graphic2)
    })

    it('should stamp __queryConfigId from layerDefaultConfigIds when provided', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])
      const mockDS = createMockDataSource('layer_1')
      mockGetDataSource.mockReturnValue(mockDS)

      const configIds = { layer_1: 'config_parks' }
      const records = convertSpatialResultsToRecords(result, 'widget_1', configIds)

      expect(records[0].feature.attributes.__queryConfigId).toBe('config_parks')
    })

    it('should stamp __queryConfigId as "spatial" when no layerDefaultConfigIds entry', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])
      const mockDS = createMockDataSource('layer_1')
      mockGetDataSource.mockReturnValue(mockDS)

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      expect(records[0].feature.attributes.__queryConfigId).toBe('spatial')
    })

    it('should stamp __queryConfigId as "spatial" when layerDefaultConfigIds has no matching key', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])
      const mockDS = createMockDataSource('layer_1')
      mockGetDataSource.mockReturnValue(mockDS)

      const configIds = { other_layer: 'config_other' }
      const records = convertSpatialResultsToRecords(result, 'widget_1', configIds)

      expect(records[0].feature.attributes.__queryConfigId).toBe('spatial')
    })

    it('should stamp __originDSId with the DataSource id', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])
      const mockDS = createMockDataSource('ds_parks_123')
      mockGetDataSource.mockReturnValue(mockDS)

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      expect(records[0].feature.attributes.__originDSId).toBe('ds_parks_123')
    })

    it('should stamp __spatialLayerTitle with the layer title', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        layerTitle: 'City Parks',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])
      const mockDS = createMockDataSource('layer_1')
      mockGetDataSource.mockReturnValue(mockDS)

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      expect(records[0].feature.attributes.__spatialLayerTitle).toBe('City Parks')
    })

    it('should set sourceLayer and layer on each graphic', () => {
      const graphic1 = createMockGraphic({ OBJECTID: 1 })
      const graphic2 = createMockGraphic({ OBJECTID: 2 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        features: [graphic1, graphic2]
      })
      const result = createMockSpatialResult([layerResult])
      const mockDS = createMockDataSource('layer_1')
      mockGetDataSource.mockReturnValue(mockDS)

      convertSpatialResultsToRecords(result, 'widget_1')

      // When no associatedLayer, sourceLayer should be the featureLayer itself
      expect(graphic1.sourceLayer).toBe(mockDS.layer)
      expect(graphic1.layer).toBe(mockDS.layer)
      expect(graphic2.sourceLayer).toBe(mockDS.layer)
      expect(graphic2.layer).toBe(mockDS.layer)
    })

    it('should prefer associatedLayer for sourceLayer when available', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])
      const associatedLayer = { id: 'associated_layer', title: 'Associated' }
      const mockDS = createMockDataSource('layer_1', { associatedLayer })
      mockGetDataSource.mockReturnValue(mockDS)

      convertSpatialResultsToRecords(result, 'widget_1')

      expect(graphic.sourceLayer).toBe(associatedLayer)
      expect(graphic.layer).toBe(associatedLayer)
    })

    it('should handle multiple layers and aggregate all records', () => {
      const graphic1 = createMockGraphic({ OBJECTID: 1, NAME: 'Park A' })
      const graphic2 = createMockGraphic({ OBJECTID: 2, NAME: 'Park B' })
      const graphic3 = createMockGraphic({ OBJECTID: 10, NAME: 'School A' })

      const layerResult1 = createMockLayerResult({
        layerId: 'parks_layer',
        layerTitle: 'Parks',
        features: [graphic1, graphic2]
      })
      const layerResult2 = createMockLayerResult({
        layerId: 'schools_layer',
        layerTitle: 'Schools',
        features: [graphic3]
      })
      const result = createMockSpatialResult([layerResult1, layerResult2])

      const mockDSParks = createMockDataSource('parks_layer')
      const mockDSSchools = createMockDataSource('schools_layer')
      mockGetDataSource.mockImplementation((layerId: string) => {
        if (layerId === 'parks_layer') return mockDSParks
        if (layerId === 'schools_layer') return mockDSSchools
        return null
      })

      const configIds = { parks_layer: 'config_parks', schools_layer: 'config_schools' }
      const records = convertSpatialResultsToRecords(result, 'widget_1', configIds)

      expect(records.length).toBe(3)
      expect(records[0].feature.attributes.__spatialLayerTitle).toBe('Parks')
      expect(records[0].feature.attributes.__queryConfigId).toBe('config_parks')
      expect(records[1].feature.attributes.__spatialLayerTitle).toBe('Parks')
      expect(records[2].feature.attributes.__spatialLayerTitle).toBe('Schools')
      expect(records[2].feature.attributes.__queryConfigId).toBe('config_schools')
    })

    it('should handle records where feature.attributes is null (defensive)', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])

      // Return a record with null attributes from buildRecord
      const mockDS = createMockDataSource('layer_1')
      mockDS.buildRecord.mockImplementation(() => ({
        feature: { attributes: null }
      }))
      mockGetDataSource.mockReturnValue(mockDS)

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      // Should not throw, record should still be returned
      expect(records.length).toBe(1)
      expect(records[0].feature.attributes).toBeNull()
    })

    it('should handle records where feature is undefined (defensive)', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])

      const mockDS = createMockDataSource('layer_1')
      mockDS.buildRecord.mockImplementation(() => ({
        feature: undefined
      }))
      mockGetDataSource.mockReturnValue(mockDS)

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      // Should not throw, record should still be returned
      expect(records.length).toBe(1)
      expect(records[0].feature).toBeUndefined()
    })

    it('should log convert-records-layer-complete for each processed layer', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        layerTitle: 'Parks',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])
      const mockDS = createMockDataSource('layer_1')
      mockGetDataSource.mockReturnValue(mockDS)

      convertSpatialResultsToRecords(result, 'widget_1')

      expect(mockDebugLogger.log).toHaveBeenCalledWith('SPATIAL', expect.objectContaining({
        event: 'convert-records-layer-complete',
        widgetId: 'widget_1',
        layerId: 'layer_1',
        layerTitle: 'Parks',
        recordsBuilt: 1
      }))
    })

    it('should skip zero-count layers but still process subsequent layers', () => {
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const emptyLayerResult = createMockLayerResult({
        layerId: 'empty_layer',
        featureCount: 0,
        features: []
      })
      const populatedLayerResult = createMockLayerResult({
        layerId: 'populated_layer',
        layerTitle: 'Populated',
        features: [graphic]
      })
      const result = createMockSpatialResult([emptyLayerResult, populatedLayerResult])

      const mockDS = createMockDataSource('populated_layer')
      mockGetDataSource.mockImplementation((layerId: string) => {
        if (layerId === 'populated_layer') return mockDS
        return null
      })

      const records = convertSpatialResultsToRecords(result, 'widget_1')

      expect(records.length).toBe(1)
      expect(records[0].feature.attributes.__spatialLayerTitle).toBe('Populated')
      // getDataSource should only be called for the populated layer
      expect(mockGetDataSource).toHaveBeenCalledTimes(1)
      expect(mockGetDataSource).toHaveBeenCalledWith('populated_layer')
    })
  })
})
