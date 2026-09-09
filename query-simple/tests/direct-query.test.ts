// Mock shared-code/mapsimple-common
const mockDebugLogger = { log: jest.fn() }
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => mockDebugLogger
}))

// Mock query-utils (combineFields is used by resolveOutFields)
jest.mock('../src/runtime/query-utils', () => ({
  combineFields: jest.fn((...args: any[]) => {
    // Simplified version: collect unique fields from all args
    const fields = new Set<string>()
    if (Array.isArray(args[0])) args[0].forEach((f: string) => fields.add(f))
    if (typeof args[1] === 'string') {
      const matches = args[1].match(/\{\w+\}/g)
      matches?.forEach((m: string) => fields.add(m.slice(1, -1)))
    }
    if (args[2]) fields.add(args[2])
    if (typeof args[3] === 'string') {
      const matches = args[3].match(/\{\w+\}/g)
      matches?.forEach((m: string) => fields.add(m.slice(1, -1)))
    }
    return Array.from(fields)
  })
}))

// Mock jimu-core
jest.mock('jimu-core', () => ({
  Immutable: jest.fn((obj: any) => obj)
}))

import { executeDirectQuery } from '../src/runtime/direct-query'
import { combineFields } from '../src/runtime/query-utils'

// --- Helpers ---

function createMockFeatureLayer (overrides: any = {}): any {
  const fields = overrides.fields || [
    { name: 'OBJECTID', type: 'oid' },
    { name: 'NAME', type: 'string' },
    { name: 'ADDRESS', type: 'string' }
  ]
  const mockQuery: any = {}
  return {
    objectIdField: overrides.objectIdField || 'OBJECTID',
    fields,
    title: overrides.title || 'TestLayer',
    url: overrides.url || 'https://services.example.com/FeatureServer/0',
    layerId: overrides.layerId || 0,
    popupTemplate: overrides.popupTemplate || null,
    defaultPopupTemplate: overrides.defaultPopupTemplate || null,
    load: jest.fn().mockResolvedValue(undefined),
    createQuery: jest.fn().mockReturnValue(mockQuery),
    queryFeatures: jest.fn().mockResolvedValue({
      features: overrides.features || [],
      geometryType: overrides.geometryType || 'esriGeometryPoint',
      exceededTransferLimit: overrides.exceededTransferLimit ?? false
    }),
    // r028.122: count-only verification for the truncation guard
    queryFeatureCount: jest.fn().mockImplementation(() =>
      overrides.countThrows
        ? Promise.reject(new Error('count failed'))
        : Promise.resolve(overrides.trueCount ?? (overrides.features || []).length)
    ),
    _mockQuery: mockQuery // expose for assertions
  }
}

function createMockOutputDS (featureLayer: any, overrides: any = {}): any {
  const originDS = {
    createJSAPILayerByDataSource: jest.fn().mockResolvedValue(featureLayer),
    getPopupInfo: jest.fn().mockReturnValue(overrides.popupInfo || null)
  }
  return {
    buildRecord: jest.fn().mockImplementation((graphic: any) => ({
      _graphic: graphic,
      getId: () => graphic.attributes?.OBJECTID?.toString() || '0',
      getDataSource: () => ({ getOriginDataSources: () => [originDS] })
    })),
    getOriginDataSources: jest.fn().mockReturnValue([originDS]),
    getPopupInfo: jest.fn().mockReturnValue(overrides.popupInfo || null)
  }
}

function createMockQueryItem (overrides: any = {}): any {
  return {
    resultFieldsType: overrides.resultFieldsType || 'SelectAttributes',
    resultDisplayFields: overrides.resultDisplayFields || ['NAME'],
    resultTitleExpression: overrides.resultTitleExpression || '',
    resultContentExpression: overrides.resultContentExpression || '',
    ...overrides
  }
}

// --- Tests ---

describe('direct-query unit tests', () => {
  beforeEach(() => {
    mockDebugLogger.log.mockClear()
    ;(combineFields as jest.Mock).mockClear()
  })

  describe('executeDirectQuery', () => {
    it('should execute query and return records', async () => {
      const graphic1 = { attributes: { OBJECTID: 1, NAME: 'Test' } }
      const graphic2 = { attributes: { OBJECTID: 2, NAME: 'Test2' } }
      const featureLayer = createMockFeatureLayer({
        features: [graphic1, graphic2]
      })
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()

      const result = await executeDirectQuery(outputDS, queryItem, "NAME = 'Test'")

      expect(result.records.length).toBe(2)
      expect(result.exceededTransferLimit).toBe(false)
      expect(featureLayer.load).toHaveBeenCalled()
      expect(featureLayer.queryFeatures).toHaveBeenCalled()
    })

    it('should return empty records for no results', async () => {
      const featureLayer = createMockFeatureLayer({ features: [] })
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()

      const result = await executeDirectQuery(outputDS, queryItem, '1=0')

      expect(result.records.length).toBe(0)
      expect(result.exceededTransferLimit).toBe(false)
    })

    it('should pass outSpatialReference to query (r024.111)', async () => {
      const featureLayer = createMockFeatureLayer()
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()
      const sr = { wkid: 3857 } as any

      await executeDirectQuery(outputDS, queryItem, '1=1', {
        outSpatialReference: sr
      })

      const query = featureLayer._mockQuery
      expect(query.outSpatialReference).toBe(sr)
    })

    it('should not set outSpatialReference when not provided', async () => {
      const featureLayer = createMockFeatureLayer()
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()

      await executeDirectQuery(outputDS, queryItem, '1=1')

      const query = featureLayer._mockQuery
      expect(query.outSpatialReference).toBeUndefined()
    })

    it('should report exceededTransferLimit when genuinely truncated', async () => {
      // r028.122: the flag now reflects ACTUAL truncation — the service flag plus a true
      // total that exceeds what was returned (verified by the count-only guard).
      const featureLayer = createMockFeatureLayer({
        features: [{ attributes: { OBJECTID: 1 } }],
        exceededTransferLimit: true,
        trueCount: 500 // returned 1, but 500 match -> genuinely truncated
      })
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()

      const result = await executeDirectQuery(outputDS, queryItem, '1=1')

      expect(result.exceededTransferLimit).toBe(true)
      expect(result.trueMatchCount).toBe(500)
    })

    it('should set layer on each graphic', async () => {
      const graphic1 = { attributes: { OBJECTID: 1 } }
      const featureLayer = createMockFeatureLayer({ features: [graphic1] })
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()

      await executeDirectQuery(outputDS, queryItem, '1=1')

      // JSAPI 5.0 removed Graphic.sourceLayer; .layer is what downstream
      // popup-render-pool and feature-info read.
      expect((graphic1 as any).layer).toBe(featureLayer)
    })

    it('should use buildRecord to wrap graphics', async () => {
      const graphic1 = { attributes: { OBJECTID: 1 } }
      const featureLayer = createMockFeatureLayer({ features: [graphic1] })
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()

      await executeDirectQuery(outputDS, queryItem, '1=1')

      expect(outputDS.buildRecord).toHaveBeenCalledWith(graphic1)
    })

    it('should pass pageSize and orderByFields when provided', async () => {
      const featureLayer = createMockFeatureLayer()
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()

      await executeDirectQuery(outputDS, queryItem, '1=1', {
        pageSize: 50,
        orderByFields: ['NAME ASC']
      })

      const query = featureLayer._mockQuery
      expect(query.num).toBe(50)
      expect(query.orderByFields).toEqual(['NAME ASC'])
    })

    it('should return popupTemplate from feature layer', async () => {
      const popupTemplate = { title: 'Test: {NAME}' }
      const featureLayer = createMockFeatureLayer({ popupTemplate })
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()

      const result = await executeDirectQuery(outputDS, queryItem, '1=1')

      expect(result.popupTemplate).toBe(popupTemplate)
    })

    it('should log executing and complete events', async () => {
      const featureLayer = createMockFeatureLayer()
      const outputDS = createMockOutputDS(featureLayer)
      const queryItem = createMockQueryItem()

      await executeDirectQuery(outputDS, queryItem, '1=1')

      expect(mockDebugLogger.log).toHaveBeenCalledWith('DIRECT-QUERY', expect.objectContaining({
        event: 'executing'
      }))
      expect(mockDebugLogger.log).toHaveBeenCalledWith('DIRECT-QUERY', expect.objectContaining({
        event: 'complete'
      }))
    })
  })

  describe('executeDirectQuery -- truncation guard + true count (r028.122)', () => {
    const twoFeatures = [{ attributes: { OBJECTID: 1 } }, { attributes: { OBJECTID: 2 } }]

    it('does not run a count-only query when the service did not flag truncation', async () => {
      const featureLayer = createMockFeatureLayer({ features: twoFeatures, exceededTransferLimit: false })
      const result = await executeDirectQuery(createMockOutputDS(featureLayer), createMockQueryItem(), '1=1')

      expect(featureLayer.queryFeatureCount).not.toHaveBeenCalled()
      expect(result.exceededTransferLimit).toBe(false)
      expect(result.trueMatchCount).toBeUndefined()
    })

    it('suppresses truncation when the flag is spurious (true total === returned)', async () => {
      const featureLayer = createMockFeatureLayer({ features: twoFeatures, exceededTransferLimit: true, trueCount: 2 })
      const result = await executeDirectQuery(createMockOutputDS(featureLayer), createMockQueryItem(), '1=1')

      expect(featureLayer.queryFeatureCount).toHaveBeenCalledTimes(1)
      expect(result.exceededTransferLimit).toBe(false)
      expect(result.trueMatchCount).toBeUndefined()
    })

    it('surfaces truncation with the exact true total when genuinely capped', async () => {
      const featureLayer = createMockFeatureLayer({ features: twoFeatures, exceededTransferLimit: true, trueCount: 1000 })
      const result = await executeDirectQuery(createMockOutputDS(featureLayer), createMockQueryItem(), '1=1')

      expect(result.exceededTransferLimit).toBe(true)
      expect(result.trueMatchCount).toBe(1000)
    })

    it('falls back to the service flag when the count-only query fails', async () => {
      const featureLayer = createMockFeatureLayer({ features: twoFeatures, exceededTransferLimit: true, countThrows: true })
      const result = await executeDirectQuery(createMockOutputDS(featureLayer), createMockQueryItem(), '1=1')

      expect(result.exceededTransferLimit).toBe(true) // trust the flag; never hide a real truncation
      expect(result.trueMatchCount).toBeUndefined()
    })
  })
})
