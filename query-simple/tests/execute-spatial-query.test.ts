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

import { convertSpatialResultsToRecords, executeSpatialQuery, type SpatialQueryResult } from '../src/runtime/execute-spatial-query'
import { resolvePopupOutFields } from '../src/runtime/query-utils'

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

function createMockGeometry (type: string): any {
  return { type }
}

// Builds a DataSource whose .layer is a queryable mock FeatureLayer.
// `queryResults` is one feature array per queryFeatures() call, in order.
function createQueryableLayerDS (opts: {
  id: string
  objectIdField?: string
  title?: string
  queryResults: any[][]
}): any {
  let call = 0
  const layer = {
    objectIdField: opts.objectIdField || 'OBJECTID',
    title: opts.title || 'Test Layer',
    load: jest.fn().mockResolvedValue(undefined),
    createQuery: jest.fn().mockImplementation(() => ({})),
    queryFeatures: jest.fn().mockImplementation(() => {
      const features = opts.queryResults[call] || []
      call++
      return Promise.resolve({
        features,
        geometryType: 'esriGeometryPolygon',
        exceededTransferLimit: false
      })
    })
  }
  return { id: opts.id, layer }
}

// Builds a DS whose single queryFeatures() call returns a featureSet with a controllable
// exceededTransferLimit flag, plus a queryFeatureCount() mock for the truncation guard.
function createTruncatableLayerDS (opts: {
  id?: string
  features: any[]
  exceededTransferLimit: boolean
  trueCount?: number
  countThrows?: boolean
}): any {
  const layer: any = {
    objectIdField: 'OBJECTID',
    title: 'Test Layer',
    load: jest.fn().mockResolvedValue(undefined),
    createQuery: jest.fn().mockImplementation(() => ({})),
    queryFeatures: jest.fn().mockResolvedValue({
      features: opts.features,
      geometryType: 'esriGeometryPolygon',
      exceededTransferLimit: opts.exceededTransferLimit
    }),
    queryFeatureCount: jest.fn().mockImplementation(() =>
      opts.countThrows
        ? Promise.reject(new Error('count failed'))
        : Promise.resolve(opts.trueCount ?? opts.features.length)
    )
  }
  return { id: opts.id || 'layer_1', layer }
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

    it('should set layer on each graphic', () => {
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

      // JSAPI 5.0 removed Graphic.sourceLayer and FeatureLayer.associatedLayer.
      // Each graphic should have .layer stamped to the featureLayer it came from
      // so popup-render-pool and feature-info can resolve it downstream.
      expect(graphic1.layer).toBe(mockDS.layer)
      expect(graphic2.layer).toBe(mockDS.layer)
    })

    it('should stamp graphic.layer to ds.layer regardless of associatedLayer', () => {
      // JSAPI 5.0 removed FeatureLayer.associatedLayer. The production code
      // now always stamps graphic.layer = ds.layer. This test verifies that
      // the stamped layer is the DS's own layer object, not a nested property.
      const graphic = createMockGraphic({ OBJECTID: 1 })
      const layerResult = createMockLayerResult({
        layerId: 'layer_1',
        features: [graphic]
      })
      const result = createMockSpatialResult([layerResult])
      const mockDS = createMockDataSource('layer_1', {
        associatedLayer: { id: 'associated_layer', title: 'Associated' }
      })
      mockGetDataSource.mockReturnValue(mockDS)

      convertSpatialResultsToRecords(result, 'widget_1')

      // graphic.layer should be the DS's layer object (which contains
      // the associatedLayer prop), not the associatedLayer itself
      expect(graphic.layer).toBe(mockDS.layer)
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

  describe('executeSpatialQuery -- multi-geometry input (r028.101)', () => {
    beforeEach(() => {
      ;(resolvePopupOutFields as jest.Mock).mockReturnValue(['OBJECTID'])
    })

    it('runs the query once per input geometry and dedupes matches by objectId', async () => {
      const f1 = createMockGraphic({ OBJECTID: 1 })
      const f2 = createMockGraphic({ OBJECTID: 2 })
      const f3 = createMockGraphic({ OBJECTID: 3 })
      // First geometry (polygon) matches f1+f2; second (line) matches f2+f3.
      // f2 is hit by both inputs and must be counted once.
      const ds = createQueryableLayerDS({ id: 'layer_1', queryResults: [[f1, f2], [f2, f3]] })
      mockGetDataSource.mockReturnValue(ds)

      const result = await executeSpatialQuery({
        inputGeometries: [createMockGeometry('polygon'), createMockGeometry('polyline')],
        spatialRelationship: 'intersects',
        targetLayerIds: ['layer_1'],
        widgetId: 'widget_1'
      })

      expect(ds.layer.queryFeatures).toHaveBeenCalledTimes(2)
      expect(result.layerResults.length).toBe(1)
      expect(result.layerResults[0].featureCount).toBe(3)
      expect(result.layerResults[0].featureSet.features).toHaveLength(3)
      expect(result.totalFeatureCount).toBe(3)
    })

    it('runs a single query when given one input geometry', async () => {
      const f1 = createMockGraphic({ OBJECTID: 1 })
      const ds = createQueryableLayerDS({ id: 'layer_1', queryResults: [[f1]] })
      mockGetDataSource.mockReturnValue(ds)

      const result = await executeSpatialQuery({
        inputGeometries: [createMockGeometry('polygon')],
        spatialRelationship: 'intersects',
        targetLayerIds: ['layer_1'],
        widgetId: 'widget_1'
      })

      expect(ds.layer.queryFeatures).toHaveBeenCalledTimes(1)
      expect(result.layerResults[0].featureCount).toBe(1)
      expect(result.totalFeatureCount).toBe(1)
    })

    it('passes the buffer distance and unit through to each per-geometry query', async () => {
      const captured: any[] = []
      const f1 = createMockGraphic({ OBJECTID: 1 })
      const ds = createQueryableLayerDS({ id: 'layer_1', queryResults: [[f1], [f1]] })
      ;(ds.layer.queryFeatures as jest.Mock).mockImplementation((q: any) => {
        captured.push(q)
        return Promise.resolve({ features: [f1], geometryType: 'esriGeometryPolygon', exceededTransferLimit: false })
      })
      mockGetDataSource.mockReturnValue(ds)

      await executeSpatialQuery({
        inputGeometries: [createMockGeometry('polygon'), createMockGeometry('polyline')],
        spatialRelationship: 'intersects',
        targetLayerIds: ['layer_1'],
        bufferDistance: 500,
        bufferUnit: 'feet',
        widgetId: 'widget_1'
      })

      expect(captured).toHaveLength(2)
      captured.forEach(q => {
        expect(q.distance).toBe(500)
        expect(q.units).toBe('feet')
      })
    })
  })

  describe('executeSpatialQuery -- truncation alert guard (r028.121)', () => {
    beforeEach(() => {
      ;(resolvePopupOutFields as jest.Mock).mockReturnValue(['OBJECTID'])
    })

    it('suppresses truncation when the service flag is spurious (trueCount === returnedCount)', async () => {
      // Mirrors the real bug: a MapServer returns every match (2) on a multipoint sub-query
      // but still sets exceededTransferLimit. The count check proves nothing was missed.
      const features = [createMockGraphic({ OBJECTID: 1 }), createMockGraphic({ OBJECTID: 2 })]
      const ds = createTruncatableLayerDS({ features, exceededTransferLimit: true, trueCount: 2 })
      mockGetDataSource.mockReturnValue(ds)

      const result = await executeSpatialQuery({
        inputGeometries: [createMockGeometry('multipoint')],
        spatialRelationship: 'intersects',
        targetLayerIds: ['layer_1'],
        widgetId: 'widget_1'
      })

      expect(ds.layer.queryFeatureCount).toHaveBeenCalledTimes(1)
      expect(result.layerResults[0].exceededTransferLimit).toBe(false)
      // not truncated -> no true total surfaced
      expect(result.layerResults[0].trueMatchCount).toBeUndefined()
    })

    it('surfaces truncation and the exact true total when genuinely capped (one geometry)', async () => {
      const features = [createMockGraphic({ OBJECTID: 1 })]
      const ds = createTruncatableLayerDS({ features, exceededTransferLimit: true, trueCount: 50 })
      mockGetDataSource.mockReturnValue(ds)

      const result = await executeSpatialQuery({
        inputGeometries: [createMockGeometry('polygon')],
        spatialRelationship: 'intersects',
        targetLayerIds: ['layer_1'],
        widgetId: 'widget_1'
      })

      expect(ds.layer.queryFeatureCount).toHaveBeenCalledTimes(1)
      expect(result.layerResults[0].exceededTransferLimit).toBe(true)
      expect(result.layerResults[0].trueMatchCount).toBe(50)
    })

    it('reports the largest sub-query true count as the layer total for multi-geometry input', async () => {
      // Two geometries, both genuinely truncated with different true totals.
      const layer: any = {
        objectIdField: 'OBJECTID',
        title: 'Test Layer',
        load: jest.fn().mockResolvedValue(undefined),
        createQuery: jest.fn().mockImplementation(() => ({})),
        queryFeatures: jest.fn()
          .mockResolvedValueOnce({ features: [createMockGraphic({ OBJECTID: 1 })], geometryType: 'esriGeometryPolygon', exceededTransferLimit: true })
          .mockResolvedValueOnce({ features: [createMockGraphic({ OBJECTID: 2 })], geometryType: 'esriGeometryPolygon', exceededTransferLimit: true }),
        queryFeatureCount: jest.fn().mockResolvedValueOnce(40).mockResolvedValueOnce(90)
      }
      mockGetDataSource.mockReturnValue({ id: 'layer_1', layer })

      const result = await executeSpatialQuery({
        inputGeometries: [createMockGeometry('polygon'), createMockGeometry('polyline')],
        spatialRelationship: 'intersects',
        targetLayerIds: ['layer_1'],
        widgetId: 'widget_1'
      })

      expect(result.layerResults[0].exceededTransferLimit).toBe(true)
      expect(result.layerResults[0].trueMatchCount).toBe(90) // the larger of 40 and 90
    })

    it('falls back to the service flag when the count-only query fails', async () => {
      const features = [createMockGraphic({ OBJECTID: 1 })]
      const ds = createTruncatableLayerDS({ features, exceededTransferLimit: true, countThrows: true })
      mockGetDataSource.mockReturnValue(ds)

      const result = await executeSpatialQuery({
        inputGeometries: [createMockGeometry('polygon')],
        spatialRelationship: 'intersects',
        targetLayerIds: ['layer_1'],
        widgetId: 'widget_1'
      })

      // Couldn't verify -> trust the flag so a real truncation is never hidden.
      expect(result.layerResults[0].exceededTransferLimit).toBe(true)
    })

    it('does not run a count-only query when the service did not flag truncation', async () => {
      const features = [createMockGraphic({ OBJECTID: 1 })]
      const ds = createTruncatableLayerDS({ features, exceededTransferLimit: false })
      mockGetDataSource.mockReturnValue(ds)

      const result = await executeSpatialQuery({
        inputGeometries: [createMockGeometry('polygon')],
        spatialRelationship: 'intersects',
        targetLayerIds: ['layer_1'],
        widgetId: 'widget_1'
      })

      expect(ds.layer.queryFeatureCount).not.toHaveBeenCalled()
      expect(result.layerResults[0].exceededTransferLimit).toBe(false)
    })
  })
})
