// Mock shared-code/mapsimple-common
const mockDebugLogger = { log: jest.fn() }
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => mockDebugLogger,
  widgetConfigManager: {
    getFillColor: jest.fn().mockReturnValue([223, 0, 255]),
    getFillOpacity: jest.fn().mockReturnValue(0.25),
    getOutlineColor: jest.fn().mockReturnValue([223, 0, 255]),
    getOutlineOpacity: jest.fn().mockReturnValue(1.0),
    getOutlineWidth: jest.fn().mockReturnValue(2),
    getPointSize: jest.fn().mockReturnValue(12),
    getPointOutlineWidth: jest.fn().mockReturnValue(2),
    getPointStyle: jest.fn().mockReturnValue('circle'),
    getResultsLayerTitle: jest.fn().mockReturnValue('QuerySimple Results')
  }
}))

// Mock popup module (consumed by both sync and factory)
const mockRegisterRecords = jest.fn()
const mockUnregisterRecords = jest.fn()
const mockClearRecordRegistry = jest.fn()
const mockPopupTemplate = { type: 'popup-template', title: 'mock' }
jest.mock('../src/runtime/result-feature-layer-popup', () => ({
  registerRecords: (...args: any[]) => mockRegisterRecords(...args),
  unregisterRecords: (...args: any[]) => mockUnregisterRecords(...args),
  clearRecordRegistry: (...args: any[]) => mockClearRecordRegistry(...args),
  buildResultPopupTemplate: jest.fn().mockResolvedValue(mockPopupTemplate)
}))

// Mock jimu-arcgis loadArcGISJSAPIModules
const mockFeatureLayerInstances: any[] = []
const MockFeatureLayer = jest.fn().mockImplementation((props: any) => {
  const instance = {
    ...props,
    destroy: jest.fn(),
    queryFeatures: jest.fn(),
    queryFeatureCount: jest.fn(),
    applyEdits: jest.fn().mockResolvedValue({})
  }
  mockFeatureLayerInstances.push(instance)
  return instance
})

const mockGroupLayerInstances: any[] = []
const MockGroupLayer = jest.fn().mockImplementation((props: any) => {
  const children: any[] = []
  // r028.082: watch() used by factory for popup-close-on-visibility-toggle.
  const watchHandlers: Array<{ prop: string, cb: (v: any) => void }> = []
  const instance = {
    ...props,
    layers: {
      add: jest.fn((layer: any) => children.push(layer)),
      remove: jest.fn((layer: any) => {
        const idx = children.indexOf(layer)
        if (idx >= 0) children.splice(idx, 1)
      }),
      find: jest.fn((fn: (l: any) => boolean) => children.find(fn)),
      toArray: jest.fn(() => [...children]),
      get length () { return children.length }
    },
    watch: jest.fn((prop: string, cb: (v: any) => void) => {
      watchHandlers.push({ prop, cb })
      return { remove: jest.fn(() => {
        const idx = watchHandlers.findIndex(h => h.prop === prop && h.cb === cb)
        if (idx >= 0) watchHandlers.splice(idx, 1)
      }) }
    }),
    __watchHandlers: watchHandlers,
    destroy: jest.fn()
  }
  mockGroupLayerInstances.push(instance)
  return instance
})

let graphicIdCounter = 0
const MockGraphic = jest.fn().mockImplementation((props: any) => {
  graphicIdCounter++
  return {
    ...props,
    _mockId: graphicIdCounter
  }
})

jest.mock('jimu-arcgis', () => ({
  loadArcGISJSAPIModules: jest.fn().mockImplementation((modules: string[]) => {
    const result = modules.map((m: string) => {
      if (m === 'esri/layers/FeatureLayer') return MockFeatureLayer
      if (m === 'esri/layers/GroupLayer') return MockGroupLayer
      if (m === 'esri/Graphic') return MockGraphic
      return jest.fn()
    })
    return Promise.resolve(result)
  })
}))

import {
  addResultFeatures,
  removeResultFeatures,
  clearResultFeatures,
  getExistingCompositeKeys,
  getResultFeatureCount,
  resetObjectIdCounter,
  resetKeyTracking
} from '../src/runtime/result-feature-layer-sync'

import {
  createResultGroupLayer,
  getOrCreateFeatureLayer
} from '../src/runtime/result-feature-layer-factory'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockMapView (existingLayers: any[] = []): any {
  return {
    map: {
      layers: {
        length: existingLayers.length,
        find: jest.fn((fn: any) => existingLayers.find(fn))
      },
      allLayers: {
        find: jest.fn((fn: any) => existingLayers.find(fn))
      },
      add: jest.fn((layer: any) => existingLayers.push(layer)),
      remove: jest.fn((layer: any) => {
        const idx = existingLayers.indexOf(layer)
        if (idx >= 0) existingLayers.splice(idx, 1)
      }),
      reorder: jest.fn()
    }
  }
}

function createMockRecord (id: string, geometryType: string = 'polygon'): any {
  return {
    getId: jest.fn().mockReturnValue(id),
    feature: {
      geometry: {
        type: geometryType,
        rings: geometryType === 'polygon' ? [[[0, 0], [1, 0], [1, 1], [0, 0]]] : undefined,
        paths: geometryType === 'polyline' ? [[[0, 0], [1, 1]]] : undefined,
        x: geometryType === 'point' ? 0 : undefined,
        y: geometryType === 'point' ? 0 : undefined
      }
    }
  }
}

function createMockRecordNoGeometry (id: string): any {
  return {
    getId: jest.fn().mockReturnValue(id),
    feature: { geometry: null }
  }
}

function createMockRecordNoFeature (id: string): any {
  return {
    getId: jest.fn().mockReturnValue(id),
    feature: null
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('result-feature-layer-sync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFeatureLayerInstances.length = 0
    mockGroupLayerInstances.length = 0
    graphicIdCounter = 0
    resetObjectIdCounter('widget_1')
    resetKeyTracking('widget_1')
  })

  // -------------------------------------------------------------------------
  // resetObjectIdCounter
  // -------------------------------------------------------------------------

  describe('resetObjectIdCounter', () => {
    it('should not throw when resetting a counter that was never set', () => {
      expect(() => resetObjectIdCounter('nonexistent')).not.toThrow()
    })
  })

  // -------------------------------------------------------------------------
  // addResultFeatures
  // -------------------------------------------------------------------------

  describe('addResultFeatures', () => {
    it('should return 0 for empty records array', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const count = await addResultFeatures(groupLayer, [], 'config_1', 'widget_1')
      expect(count).toBe(0)
    })

    it('should add polygon features to a polygon FeatureLayer', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const records = [
        createMockRecord('rec_1', 'polygon'),
        createMockRecord('rec_2', 'polygon')
      ]

      const count = await addResultFeatures(groupLayer, records, 'config_1', 'widget_1')

      expect(count).toBe(2)
      // A polygon FeatureLayer should have been created
      expect(MockFeatureLayer).toHaveBeenCalledTimes(1)
      expect(mockFeatureLayerInstances[0].geometryType).toBe('polygon')
    })

    it('should create separate FeatureLayers for mixed geometry types', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const records = [
        createMockRecord('rec_1', 'polygon'),
        createMockRecord('rec_2', 'point'),
        createMockRecord('rec_3', 'polyline')
      ]

      const count = await addResultFeatures(groupLayer, records, 'config_1', 'widget_1')

      expect(count).toBe(3)
      // Three FeatureLayers: polygon, point, polyline
      expect(MockFeatureLayer).toHaveBeenCalledTimes(3)
    })

    it('should skip records without geometry', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const records = [
        createMockRecord('rec_1', 'polygon'),
        createMockRecordNoGeometry('rec_2'),
        createMockRecordNoFeature('rec_3')
      ]

      const count = await addResultFeatures(groupLayer, records, 'config_1', 'widget_1')

      expect(count).toBe(1)
    })

    it('should create Graphics with lean 4-field attributes', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const records = [createMockRecord('rec_1', 'polygon')]
      await addResultFeatures(groupLayer, records, 'config_1', 'widget_1')

      // MockGraphic should have been called with the lean schema
      expect(MockGraphic).toHaveBeenCalledTimes(1)
      const graphicArgs = MockGraphic.mock.calls[0][0]
      expect(graphicArgs.attributes).toEqual({
        OBJECTID: 1,
        RECORD_ID: 'rec_1',
        QUERY_CONFIG_ID: 'config_1',
        COMPOSITE_KEY: 'config_1_rec_1'
      })
    })

    it('should assign sequential ObjectIDs', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const records = [
        createMockRecord('rec_1', 'polygon'),
        createMockRecord('rec_2', 'polygon'),
        createMockRecord('rec_3', 'polygon')
      ]

      await addResultFeatures(groupLayer, records, 'config_1', 'widget_1')

      const objectIds = MockGraphic.mock.calls.map((call: any[]) => call[0].attributes.OBJECTID)
      expect(objectIds).toEqual([1, 2, 3])
    })

    it('should call applyEdits with addFeatures', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const records = [createMockRecord('rec_1', 'polygon')]
      await addResultFeatures(groupLayer, records, 'config_1', 'widget_1')

      // The FeatureLayer's applyEdits should have been called
      const fl = mockFeatureLayerInstances[0]
      expect(fl.applyEdits).toHaveBeenCalledWith({
        addFeatures: expect.arrayContaining([
          expect.objectContaining({
            attributes: expect.objectContaining({
              COMPOSITE_KEY: 'config_1_rec_1'
            })
          })
        ])
      })
    })

    it('should normalize multipoint to point FeatureLayer', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const records = [createMockRecord('rec_1', 'multipoint')]
      await addResultFeatures(groupLayer, records, 'config_1', 'widget_1')

      // Should create a point FeatureLayer (multipoint normalizes to point)
      expect(MockFeatureLayer).toHaveBeenCalledTimes(1)
      expect(mockFeatureLayerInstances[0].geometryType).toBe('point')
    })

    it('should continue ObjectID sequence across multiple add calls', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // First batch
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      // Second batch
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_2', 'polygon')],
        'config_1',
        'widget_1'
      )

      const firstId = MockGraphic.mock.calls[0][0].attributes.OBJECTID
      const secondId = MockGraphic.mock.calls[1][0].attributes.OBJECTID
      expect(firstId).toBe(1)
      expect(secondId).toBe(2)
    })

    it('should log add events via debugLogger', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'FEATURE-LAYER',
        expect.objectContaining({
          event: 'addResultFeatures',
          geometryType: 'polygon',
          count: 1
        })
      )
    })

    it('should register records in popup registry after adding', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const records = [
        createMockRecord('rec_1', 'polygon'),
        createMockRecord('rec_2', 'polygon')
      ]

      await addResultFeatures(groupLayer, records, 'config_1', 'widget_1')

      expect(mockRegisterRecords).toHaveBeenCalledTimes(1)
      expect(mockRegisterRecords).toHaveBeenCalledWith(
        'widget_1',
        expect.arrayContaining([
          expect.objectContaining({ compositeKey: 'config_1_rec_1' }),
          expect.objectContaining({ compositeKey: 'config_1_rec_2' })
        ])
      )
    })

    it('should not register records when no features have geometry', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const records = [
        createMockRecordNoGeometry('rec_1'),
        createMockRecordNoFeature('rec_2')
      ]

      await addResultFeatures(groupLayer, records, 'config_1', 'widget_1')

      expect(mockRegisterRecords).not.toHaveBeenCalled()
    })

    // r028.086: Legend cleanup — re-enable when adding to a previously-emptied layer.
    it('should re-enable legendEnabled when adding features to a layer that was hidden', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // First add creates the layer with legendEnabled=true
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]
      // Simulate the layer having been emptied + legend hidden
      fl.legendEnabled = false

      // Adding new features should flip legendEnabled back to true
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_2', 'polygon')],
        'config_1',
        'widget_1'
      )

      expect(fl.legendEnabled).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // removeResultFeatures
  // -------------------------------------------------------------------------

  describe('removeResultFeatures', () => {
    it('should return 0 for empty composite keys array', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const count = await removeResultFeatures(groupLayer, [], 'widget_1')
      expect(count).toBe(0)
    })

    it('should query FeatureLayers and delete matching features', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // Add features first
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon'), createMockRecord('rec_2', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]

      // Mock queryFeatures to return features with matching keys
      fl.queryFeatures.mockResolvedValue({
        features: [
          { attributes: { OBJECTID: 1, COMPOSITE_KEY: 'config_1_rec_1' } },
          { attributes: { OBJECTID: 2, COMPOSITE_KEY: 'config_1_rec_2' } }
        ]
      })

      // Remove only rec_1
      const count = await removeResultFeatures(groupLayer, ['config_1_rec_1'], 'widget_1')

      expect(count).toBe(1)
      expect(fl.applyEdits).toHaveBeenCalledWith({
        deleteFeatures: [
          expect.objectContaining({
            attributes: expect.objectContaining({
              COMPOSITE_KEY: 'config_1_rec_1'
            })
          })
        ]
      })
    })

    it('should handle no matching features gracefully', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // Create a FeatureLayer but with no matching features
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]
      fl.queryFeatures.mockResolvedValue({
        features: [
          { attributes: { OBJECTID: 1, COMPOSITE_KEY: 'config_1_rec_1' } }
        ]
      })

      // Try to remove a key that does not exist
      const count = await removeResultFeatures(groupLayer, ['config_1_rec_999'], 'widget_1')

      expect(count).toBe(0)
    })

    it('should search across all FeatureLayers in the GroupLayer', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // Add features of different geometry types
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon'), createMockRecord('rec_2', 'point')],
        'config_1',
        'widget_1'
      )

      // Both FLs should be queried
      const polygonFL = mockFeatureLayerInstances[0]
      const pointFL = mockFeatureLayerInstances[1]

      polygonFL.queryFeatures.mockResolvedValue({
        features: [{ attributes: { OBJECTID: 1, COMPOSITE_KEY: 'config_1_rec_1' } }]
      })
      pointFL.queryFeatures.mockResolvedValue({
        features: [{ attributes: { OBJECTID: 2, COMPOSITE_KEY: 'config_1_rec_2' } }]
      })

      const count = await removeResultFeatures(
        groupLayer,
        ['config_1_rec_1', 'config_1_rec_2'],
        'widget_1'
      )

      expect(count).toBe(2)
      expect(polygonFL.queryFeatures).toHaveBeenCalled()
      expect(pointFL.queryFeatures).toHaveBeenCalled()
    })

    it('should log remove events via debugLogger', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]
      fl.queryFeatures.mockResolvedValue({
        features: [{ attributes: { OBJECTID: 1, COMPOSITE_KEY: 'config_1_rec_1' } }]
      })

      await removeResultFeatures(groupLayer, ['config_1_rec_1'], 'widget_1')

      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'FEATURE-LAYER',
        expect.objectContaining({
          event: 'removeResultFeatures',
          removedCount: 1
        })
      )
    })

    it('should unregister records from popup registry before removing', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]
      fl.queryFeatures.mockResolvedValue({
        features: [{ attributes: { OBJECTID: 1, COMPOSITE_KEY: 'config_1_rec_1' } }]
      })

      await removeResultFeatures(groupLayer, ['config_1_rec_1', 'config_1_rec_2'], 'widget_1')

      expect(mockUnregisterRecords).toHaveBeenCalledWith(
        'widget_1',
        ['config_1_rec_1', 'config_1_rec_2']
      )
    })

    // r028.086: Legend cleanup — empty-bucket Legend entries hidden after removal.
    it('should disable legendEnabled when removing the last feature from a layer', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // Add one feature, then arrange to remove it
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]
      // legendEnabled starts true (factory default)
      expect(fl.legendEnabled).toBe(true)

      // Arrange the feature to be found during the delete query
      fl.queryFeatures.mockResolvedValue({
        features: [{ attributes: { OBJECTID: 1, COMPOSITE_KEY: 'config_1_rec_1' } }]
      })
      // After delete, queryFeatureCount returns 0 (layer is now empty)
      fl.queryFeatureCount.mockResolvedValue(0)

      await removeResultFeatures(groupLayer, ['config_1_rec_1'], 'widget_1')

      expect(fl.legendEnabled).toBe(false)
    })

    it('should leave legendEnabled true when other features remain after removal', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon'), createMockRecord('rec_2', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]
      fl.queryFeatures.mockResolvedValue({
        features: [
          { attributes: { OBJECTID: 1, COMPOSITE_KEY: 'config_1_rec_1' } },
          { attributes: { OBJECTID: 2, COMPOSITE_KEY: 'config_1_rec_2' } }
        ]
      })
      // After deleting rec_1, one feature remains
      fl.queryFeatureCount.mockResolvedValue(1)

      await removeResultFeatures(groupLayer, ['config_1_rec_1'], 'widget_1')

      expect(fl.legendEnabled).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // clearResultFeatures
  // -------------------------------------------------------------------------

  describe('clearResultFeatures', () => {
    // r028.088: Reimplemented as destroy-and-recreate. The clear no longer
    // calls queryFeatures or applyEdits — it synchronously removes child
    // FLs from the GroupLayer and destroys them asynchronously.

    it('should synchronously remove all FLs from the GroupLayer', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon'), createMockRecord('rec_2', 'point')],
        'config_1',
        'widget_1'
      )

      const polygonFL = mockFeatureLayerInstances[0]
      const pointFL = mockFeatureLayerInstances[1]
      const removeCalls = (groupLayer.layers.remove as jest.Mock).mock.calls.length

      await clearResultFeatures(groupLayer, 'widget_1')

      // Two new remove() calls (one per child FL)
      expect((groupLayer.layers.remove as jest.Mock).mock.calls.length - removeCalls).toBe(2)
      expect(groupLayer.layers.remove).toHaveBeenCalledWith(polygonFL)
      expect(groupLayer.layers.remove).toHaveBeenCalledWith(pointFL)
    })

    it('should destroy detached FLs asynchronously (off the critical path)', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]

      await clearResultFeatures(groupLayer, 'widget_1')

      // Destroy is scheduled via microtask — flush a few to let it fire
      for (let i = 0; i < 5; i++) await Promise.resolve()

      expect(fl.destroy).toHaveBeenCalledTimes(1)
    })

    it('should NOT call applyEdits or queryFeatures (no per-feature work)', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon'), createMockRecord('rec_2', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]
      fl.applyEdits.mockClear()
      fl.queryFeatures.mockClear()

      await clearResultFeatures(groupLayer, 'widget_1')

      expect(fl.applyEdits).not.toHaveBeenCalled()
      expect(fl.queryFeatures).not.toHaveBeenCalled()
    })

    it('should reset ObjectId counter after clearing', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // Add features (OIDs 1, 2)
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon'), createMockRecord('rec_2', 'polygon')],
        'config_1',
        'widget_1'
      )

      // Clear
      await clearResultFeatures(groupLayer, 'widget_1')

      // Add again (OIDs should restart from 1 since clear resets the counter
      // AND the destroyed FL is recreated fresh)
      MockGraphic.mockClear()
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_3', 'polygon')],
        'config_1',
        'widget_1'
      )

      const newOid = MockGraphic.mock.calls[0][0].attributes.OBJECTID
      expect(newOid).toBe(1)
    })

    it('should handle empty GroupLayer gracefully', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)
      // GroupLayer has no child FLs yet — nothing has been added.

      // Should not throw
      await expect(clearResultFeatures(groupLayer, 'widget_1')).resolves.toBeUndefined()
    })

    it('should log the clear event via debugLogger', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      await clearResultFeatures(groupLayer, 'widget_1')

      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'FEATURE-LAYER',
        expect.objectContaining({
          event: 'clearResultFeatures',
          layerCount: 1,
          widgetId: 'widget_1',
          method: 'destroy-and-recreate'
        })
      )
    })

    it('should clear popup record registry', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      await clearResultFeatures(groupLayer, 'widget_1')

      expect(mockClearRecordRegistry).toHaveBeenCalledWith('widget_1')
    })

    // r028.091: bug fix. Path 3 GroupLayer can have non-result children
    // (e.g. the buffer-preview layer parented for inherited visibility).
    // clearResultFeatures must NOT destroy those — only its own result FLs.
    it('should NOT destroy non-result-FL children of the GroupLayer', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // Add a result FL (will be destroyed)
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )
      const resultFL = mockFeatureLayerInstances[0]

      // Inject a fake buffer-like layer parented to the same GroupLayer.
      // Mirrors the use-buffer-preview r028.083 pattern.
      const fakeBufferLayer: any = {
        id: 'querysimple-buffer-widget_1',
        destroy: jest.fn(),
        type: 'graphics'
      }
      ;(groupLayer.layers as any).add(fakeBufferLayer)

      await clearResultFeatures(groupLayer, 'widget_1')

      // Flush microtasks so the async destroy step runs
      for (let i = 0; i < 5; i++) await Promise.resolve()

      // Result FL destroyed
      expect(resultFL.destroy).toHaveBeenCalledTimes(1)
      // Buffer-like layer NOT destroyed
      expect(fakeBufferLayer.destroy).not.toHaveBeenCalled()
      // Buffer-like layer NOT removed from the group either
      expect((groupLayer.layers as any).remove).not.toHaveBeenCalledWith(fakeBufferLayer)
    })
  })

  // -------------------------------------------------------------------------
  // getExistingCompositeKeys
  // -------------------------------------------------------------------------

  describe('getExistingCompositeKeys', () => {
    it('should return empty set when no features have been added', () => {
      const keys = getExistingCompositeKeys('widget_1')
      expect(keys.size).toBe(0)
    })

    it('should return all composite keys tracked by addResultFeatures', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // Add features of two geometry types
      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon'), createMockRecord('rec_2', 'point')],
        'config_1',
        'widget_1'
      )

      // P2: Keys come from local tracking, not queryFeatures
      const keys = getExistingCompositeKeys('widget_1')

      expect(keys.size).toBe(2)
      expect(keys.has('config_1_rec_1')).toBe(true)
      expect(keys.has('config_1_rec_2')).toBe(true)
    })

    it('should return a defensive copy (mutations do not affect tracking)', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      const keys = getExistingCompositeKeys('widget_1')
      keys.delete('config_1_rec_1') // Mutate the returned copy

      // Internal tracking should be unaffected
      const keysAgain = getExistingCompositeKeys('widget_1')
      expect(keysAgain.has('config_1_rec_1')).toBe(true)
    })

    it('should reflect removals after removeResultFeatures', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon'), createMockRecord('rec_2', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]
      fl.queryFeatures.mockResolvedValue({
        features: [
          { attributes: { OBJECTID: 1, COMPOSITE_KEY: 'config_1_rec_1' } },
          { attributes: { OBJECTID: 2, COMPOSITE_KEY: 'config_1_rec_2' } }
        ]
      })

      await removeResultFeatures(groupLayer, ['config_1_rec_1'], 'widget_1')

      const keys = getExistingCompositeKeys('widget_1')
      expect(keys.size).toBe(1)
      expect(keys.has('config_1_rec_1')).toBe(false)
      expect(keys.has('config_1_rec_2')).toBe(true)
    })

    it('should be empty after clearResultFeatures', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      const fl = mockFeatureLayerInstances[0]
      fl.queryFeatures.mockResolvedValue({
        features: [{ attributes: { OBJECTID: 1 } }]
      })

      await clearResultFeatures(groupLayer, 'widget_1')

      const keys = getExistingCompositeKeys('widget_1')
      expect(keys.size).toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // getResultFeatureCount
  // -------------------------------------------------------------------------

  describe('getResultFeatureCount', () => {
    it('should return 0 when no features have been added', () => {
      const count = getResultFeatureCount('widget_1')
      expect(count).toBe(0)
    })

    it('should return total count across all geometry types', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // Add features of mixed geometry types
      await addResultFeatures(
        groupLayer,
        [
          createMockRecord('rec_1', 'polygon'),
          createMockRecord('rec_2', 'polygon'),
          createMockRecord('rec_3', 'point')
        ],
        'config_1',
        'widget_1'
      )

      // P2: Count comes from local key tracking, not queryFeatureCount
      const count = getResultFeatureCount('widget_1')
      expect(count).toBe(3)
    })

    it('should decrease after removeResultFeatures', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon'), createMockRecord('rec_2', 'polygon')],
        'config_1',
        'widget_1'
      )

      expect(getResultFeatureCount('widget_1')).toBe(2)

      const fl = mockFeatureLayerInstances[0]
      fl.queryFeatures.mockResolvedValue({
        features: [
          { attributes: { OBJECTID: 1, COMPOSITE_KEY: 'config_1_rec_1' } },
          { attributes: { OBJECTID: 2, COMPOSITE_KEY: 'config_1_rec_2' } }
        ]
      })

      await removeResultFeatures(groupLayer, ['config_1_rec_1'], 'widget_1')

      expect(getResultFeatureCount('widget_1')).toBe(1)
    })

    it('should return 0 after clearResultFeatures', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await addResultFeatures(
        groupLayer,
        [createMockRecord('rec_1', 'polygon')],
        'config_1',
        'widget_1'
      )

      expect(getResultFeatureCount('widget_1')).toBe(1)

      const fl = mockFeatureLayerInstances[0]
      fl.queryFeatures.mockResolvedValue({
        features: [{ attributes: { OBJECTID: 1 } }]
      })

      await clearResultFeatures(groupLayer, 'widget_1')

      expect(getResultFeatureCount('widget_1')).toBe(0)
    })
  })
})
