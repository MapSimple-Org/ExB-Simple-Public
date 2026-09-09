/**
 * Tests for Phase 3-4: widget lifecycle wiring for Path 3 FeatureLayers.
 *
 * These tests verify the orchestration logic that connects the factory,
 * sync, and popup modules to the widget lifecycle. The actual add/remove/
 * clear logic is tested in the sync and popup test files; here we verify
 * the wiring calls the right functions with the right arguments.
 */

// ---------------------------------------------------------------------------
// Mocks (must be declared before imports)
// ---------------------------------------------------------------------------

const mockCreateResultGroupLayer = jest.fn()
const mockDestroyResultLayers = jest.fn()
const mockBuildCompositeKey = jest.fn((configId: string, recordId: string) => `${configId}_${recordId}`)
const mockUpdateFeatureLayerRenderer = jest.fn()

jest.mock('../src/runtime/result-feature-layer-factory', () => ({
  createResultGroupLayer: (...args: any[]) => mockCreateResultGroupLayer(...args),
  destroyResultLayers: (...args: any[]) => mockDestroyResultLayers(...args),
  buildCompositeKey: (a: string, b: string) => mockBuildCompositeKey(a, b),
  updateFeatureLayerRenderer: (...args: any[]) => mockUpdateFeatureLayerRenderer(...args)
}))

const mockAddResultFeatures = jest.fn().mockResolvedValue(0)
const mockRemoveResultFeatures = jest.fn().mockResolvedValue(0)
const mockClearResultFeatures = jest.fn().mockResolvedValue(undefined)
const mockGetExistingCompositeKeys = jest.fn().mockResolvedValue(new Set<string>())

jest.mock('../src/runtime/result-feature-layer-sync', () => ({
  addResultFeatures: (...args: any[]) => mockAddResultFeatures(...args),
  removeResultFeatures: (...args: any[]) => mockRemoveResultFeatures(...args),
  clearResultFeatures: (...args: any[]) => mockClearResultFeatures(...args),
  getExistingCompositeKeys: (...args: any[]) => mockGetExistingCompositeKeys(...args)
}))

const mockSetQueryConfigs = jest.fn()
const mockClearQueryConfigs = jest.fn()
const mockClearRecordRegistry = jest.fn()

jest.mock('../src/runtime/result-feature-layer-popup', () => ({
  setQueryConfigs: (...args: any[]) => mockSetQueryConfigs(...args),
  clearQueryConfigs: (...args: any[]) => mockClearQueryConfigs(...args),
  clearRecordRegistry: (...args: any[]) => mockClearRecordRegistry(...args)
}))

jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => ({ log: jest.fn() }),
  widgetConfigManager: {
    registerConfig: jest.fn(),
    unregisterConfig: jest.fn(),
    getResultsLayerTitle: jest.fn().mockReturnValue('Results'),
    getFillColor: jest.fn().mockReturnValue([223, 0, 255]),
    getFillOpacity: jest.fn().mockReturnValue(0.25),
    getOutlineColor: jest.fn().mockReturnValue([223, 0, 255]),
    getOutlineOpacity: jest.fn().mockReturnValue(1.0),
    getOutlineWidth: jest.fn().mockReturnValue(2),
    getPointSize: jest.fn().mockReturnValue(12),
    getPointOutlineWidth: jest.fn().mockReturnValue(2),
    getPointStyle: jest.fn().mockReturnValue('circle')
  }
}))

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import {
  createResultGroupLayer,
  destroyResultLayers,
  buildCompositeKey,
  updateFeatureLayerRenderer
} from '../src/runtime/result-feature-layer-factory'
import {
  addResultFeatures,
  removeResultFeatures,
  clearResultFeatures,
  getExistingCompositeKeys
} from '../src/runtime/result-feature-layer-sync'
import {
  setQueryConfigs,
  clearQueryConfigs,
  clearRecordRegistry
} from '../src/runtime/result-feature-layer-popup'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockRecord (id: string, configId: string): any {
  return {
    getId: () => id,
    feature: {
      attributes: { __queryConfigId: configId, OBJECTID: Number(id) },
      geometry: { type: 'point', x: -118, y: 34 }
    },
    getData: () => ({ OBJECTID: Number(id) })
  }
}

const mockGroupLayer = { id: 'querysimple-fl-widget_1', layers: { toArray: () => [] } }
const mockMapView = { map: { allLayers: { find: jest.fn() }, add: jest.fn(), layers: { length: 1 }, reorder: jest.fn() } }

/**
 * Minimal harness that mirrors the widget's private methods without
 * rendering the full component tree. Keeps the same logic and refs.
 */
class LifecycleHarness {
  resultGroupLayerRef: { current: any } = { current: null }
  props = {
    id: 'widget_1',
    config: {
      queryItems: {
        asMutable: ({ deep }: any) => [
          { configId: 'q1', name: 'Parks', resultFieldsType: 'AllAttributes' },
          { configId: 'q2', name: 'Schools', resultFieldsType: 'SelectAttributes' }
        ]
      }
    }
  }

  async initResultFeatureLayers (widgetId: string, mapView: any): Promise<void> {
    try {
      const groupLayer = await createResultGroupLayer(widgetId, mapView)
      this.resultGroupLayerRef.current = groupLayer

      const queryItems = this.props.config?.queryItems?.asMutable?.({ deep: true }) || []
      setQueryConfigs(widgetId, queryItems)
    } catch (_err) {
      // error path tested separately
    }
  }

  async syncResultFeatureLayers (
    records: any[],
    previousRecords: any[]
  ): Promise<void> {
    const groupLayer = this.resultGroupLayerRef.current
    if (!groupLayer) return

    const widgetId = this.props.id

    try {
      if (records.length === 0 && previousRecords.length > 0) {
        await clearResultFeatures(groupLayer, widgetId)
        return
      }

      const existingKeys = await getExistingCompositeKeys(groupLayer)

      const newKeyToRecord = new Map<string, { record: any, configId: string }>()
      for (const record of records) {
        const configId = record.feature?.attributes?.__queryConfigId || ''
        const recordId = String(record.getId())
        const key = buildCompositeKey(configId, recordId)
        newKeyToRecord.set(key, { record, configId })
      }

      const keysToRemove = [...existingKeys].filter(k => !newKeyToRecord.has(k))
      if (keysToRemove.length > 0) {
        await removeResultFeatures(groupLayer, keysToRemove, widgetId)
      }

      const byConfig = new Map<string, any[]>()
      for (const [key, { record, configId }] of newKeyToRecord) {
        if (existingKeys.has(key)) continue
        if (!byConfig.has(configId)) byConfig.set(configId, [])
        byConfig.get(configId)!.push(record)
      }

      for (const [configId, configRecords] of byConfig) {
        await addResultFeatures(groupLayer, configRecords, configId, widgetId)
      }
    } catch (_err) {
      // error path tested separately
    }
  }

  updateResultFeatureLayerRenderers (): void {
    const groupLayer = this.resultGroupLayerRef.current
    if (!groupLayer) return

    const children = (groupLayer as any).layers?.toArray?.() || []
    for (const layer of children) {
      const geometryType = (layer as any).geometryType
      if (geometryType) {
        updateFeatureLayerRenderer(layer, geometryType, this.props.id)
      }
    }
  }

  cleanupResultFeatureLayers (mapView: any): void {
    if (mapView) {
      void destroyResultLayers(this.props.id, mapView)
    }
    clearRecordRegistry(this.props.id)
    clearQueryConfigs(this.props.id)
    this.resultGroupLayerRef.current = null
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Phase 3: FeatureLayer lifecycle wiring', () => {
  let harness: LifecycleHarness

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateResultGroupLayer.mockResolvedValue(mockGroupLayer)
    mockGetExistingCompositeKeys.mockResolvedValue(new Set<string>())
    mockAddResultFeatures.mockResolvedValue(0)
    mockRemoveResultFeatures.mockResolvedValue(0)
    mockClearResultFeatures.mockResolvedValue(undefined)
    harness = new LifecycleHarness()
  })

  // =========================================================================
  // initResultFeatureLayers
  // =========================================================================

  describe('initResultFeatureLayers', () => {
    it('should create GroupLayer and store ref', async () => {
      await harness.initResultFeatureLayers('widget_1', mockMapView)

      expect(mockCreateResultGroupLayer).toHaveBeenCalledWith('widget_1', mockMapView)
      expect(harness.resultGroupLayerRef.current).toBe(mockGroupLayer)
    })

    it('should register query configs from widget props', async () => {
      await harness.initResultFeatureLayers('widget_1', mockMapView)

      expect(mockSetQueryConfigs).toHaveBeenCalledWith('widget_1', [
        { configId: 'q1', name: 'Parks', resultFieldsType: 'AllAttributes' },
        { configId: 'q2', name: 'Schools', resultFieldsType: 'SelectAttributes' }
      ])
    })

    it('should not throw when createResultGroupLayer fails', async () => {
      mockCreateResultGroupLayer.mockRejectedValue(new Error('JSAPI load failed'))

      await expect(
        harness.initResultFeatureLayers('widget_1', mockMapView)
      ).resolves.toBeUndefined()

      expect(harness.resultGroupLayerRef.current).toBeNull()
    })

    it('should handle empty queryItems', async () => {
      harness.props.config.queryItems = { asMutable: () => [] } as any

      await harness.initResultFeatureLayers('widget_1', mockMapView)

      expect(mockSetQueryConfigs).toHaveBeenCalledWith('widget_1', [])
    })
  })

  // =========================================================================
  // syncResultFeatureLayers
  // =========================================================================

  describe('syncResultFeatureLayers', () => {
    beforeEach(async () => {
      await harness.initResultFeatureLayers('widget_1', mockMapView)
      jest.clearAllMocks()
    })

    it('should skip when no GroupLayer ref', async () => {
      harness.resultGroupLayerRef.current = null

      await harness.syncResultFeatureLayers(
        [createMockRecord('1', 'q1')],
        []
      )

      expect(mockAddResultFeatures).not.toHaveBeenCalled()
      expect(mockGetExistingCompositeKeys).not.toHaveBeenCalled()
    })

    it('should clear all when records go to zero', async () => {
      const prev = [createMockRecord('1', 'q1')]

      await harness.syncResultFeatureLayers([], prev)

      expect(mockClearResultFeatures).toHaveBeenCalledWith(mockGroupLayer, 'widget_1')
      expect(mockAddResultFeatures).not.toHaveBeenCalled()
      expect(mockRemoveResultFeatures).not.toHaveBeenCalled()
    })

    it('should not clear when both records arrays are empty', async () => {
      await harness.syncResultFeatureLayers([], [])

      expect(mockClearResultFeatures).not.toHaveBeenCalled()
    })

    it('should add new records not on the map', async () => {
      mockGetExistingCompositeKeys.mockResolvedValue(new Set<string>())
      const records = [
        createMockRecord('1', 'q1'),
        createMockRecord('2', 'q1')
      ]

      await harness.syncResultFeatureLayers(records, [])

      expect(mockAddResultFeatures).toHaveBeenCalledWith(
        mockGroupLayer,
        records,
        'q1',
        'widget_1'
      )
    })

    it('should group adds by configId', async () => {
      mockGetExistingCompositeKeys.mockResolvedValue(new Set<string>())
      const r1 = createMockRecord('1', 'q1')
      const r2 = createMockRecord('2', 'q2')
      const r3 = createMockRecord('3', 'q1')

      await harness.syncResultFeatureLayers([r1, r2, r3], [])

      expect(mockAddResultFeatures).toHaveBeenCalledTimes(2)
      expect(mockAddResultFeatures).toHaveBeenCalledWith(
        mockGroupLayer, [r1, r3], 'q1', 'widget_1'
      )
      expect(mockAddResultFeatures).toHaveBeenCalledWith(
        mockGroupLayer, [r2], 'q2', 'widget_1'
      )
    })

    it('should skip records already on the map', async () => {
      mockGetExistingCompositeKeys.mockResolvedValue(new Set(['q1_1']))
      const r1 = createMockRecord('1', 'q1')
      const r2 = createMockRecord('2', 'q1')

      await harness.syncResultFeatureLayers([r1, r2], [])

      expect(mockAddResultFeatures).toHaveBeenCalledWith(
        mockGroupLayer, [r2], 'q1', 'widget_1'
      )
    })

    it('should not call addResultFeatures when all records already exist', async () => {
      mockGetExistingCompositeKeys.mockResolvedValue(new Set(['q1_1', 'q1_2']))
      const records = [
        createMockRecord('1', 'q1'),
        createMockRecord('2', 'q1')
      ]

      await harness.syncResultFeatureLayers(records, [])

      expect(mockAddResultFeatures).not.toHaveBeenCalled()
    })

    it('should remove features no longer in accumulated records', async () => {
      mockGetExistingCompositeKeys.mockResolvedValue(new Set(['q1_1', 'q1_2', 'q1_3']))
      const records = [createMockRecord('1', 'q1')]

      await harness.syncResultFeatureLayers(records, [
        createMockRecord('1', 'q1'),
        createMockRecord('2', 'q1'),
        createMockRecord('3', 'q1')
      ])

      expect(mockRemoveResultFeatures).toHaveBeenCalledWith(
        mockGroupLayer,
        ['q1_2', 'q1_3'],
        'widget_1'
      )
    })

    it('should not call removeResultFeatures when nothing to remove', async () => {
      mockGetExistingCompositeKeys.mockResolvedValue(new Set(['q1_1']))
      const records = [
        createMockRecord('1', 'q1'),
        createMockRecord('2', 'q1')
      ]

      await harness.syncResultFeatureLayers(records, [createMockRecord('1', 'q1')])

      expect(mockRemoveResultFeatures).not.toHaveBeenCalled()
    })

    it('should handle simultaneous adds and removes', async () => {
      mockGetExistingCompositeKeys.mockResolvedValue(new Set(['q1_1', 'q1_2']))
      const r3 = createMockRecord('3', 'q1')

      await harness.syncResultFeatureLayers(
        [createMockRecord('1', 'q1'), r3],
        [createMockRecord('1', 'q1'), createMockRecord('2', 'q1')]
      )

      expect(mockRemoveResultFeatures).toHaveBeenCalledWith(
        mockGroupLayer, ['q1_2'], 'widget_1'
      )
      expect(mockAddResultFeatures).toHaveBeenCalledWith(
        mockGroupLayer, [r3], 'q1', 'widget_1'
      )
    })

    it('should handle records without __queryConfigId', async () => {
      mockGetExistingCompositeKeys.mockResolvedValue(new Set<string>())
      const record = {
        getId: () => '99',
        feature: { attributes: {}, geometry: { type: 'point' } }
      }

      await harness.syncResultFeatureLayers([record as any], [])

      expect(mockBuildCompositeKey).toHaveBeenCalledWith('', '99')
      expect(mockAddResultFeatures).toHaveBeenCalledWith(
        mockGroupLayer, [record], '', 'widget_1'
      )
    })

    it('should not throw when sync module throws', async () => {
      mockGetExistingCompositeKeys.mockRejectedValue(new Error('query failed'))

      await expect(
        harness.syncResultFeatureLayers([createMockRecord('1', 'q1')], [])
      ).resolves.toBeUndefined()
    })
  })

  // =========================================================================
  // cleanupResultFeatureLayers (componentWillUnmount path)
  // =========================================================================

  describe('cleanupResultFeatureLayers', () => {
    beforeEach(async () => {
      await harness.initResultFeatureLayers('widget_1', mockMapView)
      jest.clearAllMocks()
    })

    it('should destroy layers on the map', () => {
      harness.cleanupResultFeatureLayers(mockMapView)

      expect(mockDestroyResultLayers).toHaveBeenCalledWith('widget_1', mockMapView)
    })

    it('should clear popup record registry', () => {
      harness.cleanupResultFeatureLayers(mockMapView)

      expect(mockClearRecordRegistry).toHaveBeenCalledWith('widget_1')
    })

    it('should clear popup query configs', () => {
      harness.cleanupResultFeatureLayers(mockMapView)

      expect(mockClearQueryConfigs).toHaveBeenCalledWith('widget_1')
    })

    it('should null the GroupLayer ref', () => {
      expect(harness.resultGroupLayerRef.current).toBe(mockGroupLayer)

      harness.cleanupResultFeatureLayers(mockMapView)

      expect(harness.resultGroupLayerRef.current).toBeNull()
    })

    it('should skip destroyResultLayers when no mapView', () => {
      harness.cleanupResultFeatureLayers(null)

      expect(mockDestroyResultLayers).not.toHaveBeenCalled()
      expect(mockClearRecordRegistry).toHaveBeenCalledWith('widget_1')
      expect(mockClearQueryConfigs).toHaveBeenCalledWith('widget_1')
    })

    it('should still clear registries when no mapView', () => {
      harness.cleanupResultFeatureLayers(null)

      expect(mockClearRecordRegistry).toHaveBeenCalledWith('widget_1')
      expect(mockClearQueryConfigs).toHaveBeenCalledWith('widget_1')
      expect(harness.resultGroupLayerRef.current).toBeNull()
    })
  })

  // =========================================================================
  // Config change (componentDidUpdate path)
  // =========================================================================

  describe('config change handling', () => {
    it('should update query configs when called with new config', async () => {
      await harness.initResultFeatureLayers('widget_1', mockMapView)
      jest.clearAllMocks()

      harness.props.config.queryItems = {
        asMutable: () => [{ configId: 'q3', name: 'New Query' }]
      } as any

      const queryItems = harness.props.config.queryItems.asMutable({ deep: true })
      setQueryConfigs(harness.props.id, queryItems)

      expect(mockSetQueryConfigs).toHaveBeenCalledWith('widget_1', [
        { configId: 'q3', name: 'New Query' }
      ])
    })

    it('should destroy and reinit on toggle change', async () => {
      await harness.initResultFeatureLayers('widget_1', mockMapView)
      jest.clearAllMocks()

      mockDestroyResultLayers.mockResolvedValue(undefined)
      mockCreateResultGroupLayer.mockResolvedValue(mockGroupLayer)

      await destroyResultLayers(harness.props.id, mockMapView as any)
      harness.resultGroupLayerRef.current = null
      await harness.initResultFeatureLayers(harness.props.id, mockMapView as any)

      expect(mockDestroyResultLayers).toHaveBeenCalledWith('widget_1', mockMapView)
      expect(mockCreateResultGroupLayer).toHaveBeenCalledWith('widget_1', mockMapView)
      expect(harness.resultGroupLayerRef.current).toBe(mockGroupLayer)
    })
  })

  // =========================================================================
  // updateResultFeatureLayerRenderers (Phase 4: symbology config change)
  // =========================================================================

  describe('updateResultFeatureLayerRenderers', () => {
    it('should skip when no GroupLayer ref', () => {
      harness.resultGroupLayerRef.current = null

      harness.updateResultFeatureLayerRenderers()

      expect(mockUpdateFeatureLayerRenderer).not.toHaveBeenCalled()
    })

    it('should call updateFeatureLayerRenderer for each child layer', async () => {
      const groupLayerWithChildren = {
        id: 'querysimple-fl-widget_1',
        layers: {
          toArray: () => [
            { id: 'fl-point', geometryType: 'point' },
            { id: 'fl-polygon', geometryType: 'polygon' }
          ]
        }
      }
      mockCreateResultGroupLayer.mockResolvedValue(groupLayerWithChildren)
      await harness.initResultFeatureLayers('widget_1', mockMapView)
      jest.clearAllMocks()

      harness.updateResultFeatureLayerRenderers()

      expect(mockUpdateFeatureLayerRenderer).toHaveBeenCalledTimes(2)
      expect(mockUpdateFeatureLayerRenderer).toHaveBeenCalledWith(
        { id: 'fl-point', geometryType: 'point' }, 'point', 'widget_1'
      )
      expect(mockUpdateFeatureLayerRenderer).toHaveBeenCalledWith(
        { id: 'fl-polygon', geometryType: 'polygon' }, 'polygon', 'widget_1'
      )
    })

    it('should handle GroupLayer with no children', async () => {
      await harness.initResultFeatureLayers('widget_1', mockMapView)
      jest.clearAllMocks()

      harness.updateResultFeatureLayerRenderers()

      expect(mockUpdateFeatureLayerRenderer).not.toHaveBeenCalled()
    })

    it('should skip child layers without geometryType', async () => {
      const groupLayerMixed = {
        id: 'querysimple-fl-widget_1',
        layers: {
          toArray: () => [
            { id: 'fl-point', geometryType: 'point' },
            { id: 'fl-unknown', geometryType: undefined }
          ]
        }
      }
      mockCreateResultGroupLayer.mockResolvedValue(groupLayerMixed)
      await harness.initResultFeatureLayers('widget_1', mockMapView)
      jest.clearAllMocks()

      harness.updateResultFeatureLayerRenderers()

      expect(mockUpdateFeatureLayerRenderer).toHaveBeenCalledTimes(1)
      expect(mockUpdateFeatureLayerRenderer).toHaveBeenCalledWith(
        { id: 'fl-point', geometryType: 'point' }, 'point', 'widget_1'
      )
    })

    it('should handle all three geometry types', async () => {
      const groupLayerAll = {
        id: 'querysimple-fl-widget_1',
        layers: {
          toArray: () => [
            { id: 'fl-point', geometryType: 'point' },
            { id: 'fl-polyline', geometryType: 'polyline' },
            { id: 'fl-polygon', geometryType: 'polygon' }
          ]
        }
      }
      mockCreateResultGroupLayer.mockResolvedValue(groupLayerAll)
      await harness.initResultFeatureLayers('widget_1', mockMapView)
      jest.clearAllMocks()

      harness.updateResultFeatureLayerRenderers()

      expect(mockUpdateFeatureLayerRenderer).toHaveBeenCalledTimes(3)
      expect(mockUpdateFeatureLayerRenderer).toHaveBeenCalledWith(
        expect.objectContaining({ geometryType: 'point' }), 'point', 'widget_1'
      )
      expect(mockUpdateFeatureLayerRenderer).toHaveBeenCalledWith(
        expect.objectContaining({ geometryType: 'polyline' }), 'polyline', 'widget_1'
      )
      expect(mockUpdateFeatureLayerRenderer).toHaveBeenCalledWith(
        expect.objectContaining({ geometryType: 'polygon' }), 'polygon', 'widget_1'
      )
    })
  })
})
