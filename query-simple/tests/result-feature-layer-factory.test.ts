// Mock shared-code/mapsimple-common
const mockDebugLogger = { log: jest.fn() }
const mockWidgetConfigManager = {
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
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => mockDebugLogger,
  widgetConfigManager: mockWidgetConfigManager
}))

// Mock popup module (consumed by factory for PopupTemplate creation)
const mockPopupTemplate = { type: 'popup-template', title: 'mock' }
jest.mock('../src/runtime/result-feature-layer-popup', () => ({
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
    applyEdits: jest.fn()
  }
  mockFeatureLayerInstances.push(instance)
  return instance
})

const mockGroupLayerInstances: any[] = []
const MockGroupLayer = jest.fn().mockImplementation((props: any) => {
  const children: any[] = []
  // r028.082: watch() now used to set up popup-close-on-visibility-toggle
  // handler. Return a stub IHandle so production code can store/remove it.
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

jest.mock('jimu-arcgis', () => ({
  loadArcGISJSAPIModules: jest.fn().mockImplementation((modules: string[]) => {
    const result = modules.map((m: string) => {
      if (m === 'esri/layers/FeatureLayer') return MockFeatureLayer
      if (m === 'esri/layers/GroupLayer') return MockGroupLayer
      return jest.fn()
    })
    return Promise.resolve(result)
  })
}))

import {
  normalizeGeometryType,
  buildCompositeKey,
  getGroupLayerId,
  getFeatureLayerId,
  getOrCreateFeatureLayer,
  updateFeatureLayerRenderer,
  destroyResultLayers,
  createResultGroupLayer,
  buildRendererForGeometryType,
  RESULT_FIELDS
} from '../src/runtime/result-feature-layer-factory'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockMapView (existingLayers: any[] = []): any {
  return {
    map: {
      layers: {
        get length () { return existingLayers.length },
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('result-feature-layer-factory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFeatureLayerInstances.length = 0
    mockGroupLayerInstances.length = 0
  })

  // -------------------------------------------------------------------------
  // normalizeGeometryType
  // -------------------------------------------------------------------------

  describe('normalizeGeometryType', () => {
    it('should normalize point', () => {
      expect(normalizeGeometryType('point')).toBe('point')
    })

    it('should normalize multipoint to point', () => {
      expect(normalizeGeometryType('multipoint')).toBe('point')
    })

    it('should normalize polyline', () => {
      expect(normalizeGeometryType('polyline')).toBe('polyline')
    })

    it('should normalize polygon', () => {
      expect(normalizeGeometryType('polygon')).toBe('polygon')
    })

    it('should default unknown types to polygon', () => {
      expect(normalizeGeometryType('multipolygon')).toBe('polygon')
      expect(normalizeGeometryType('mesh')).toBe('polygon')
      expect(normalizeGeometryType('')).toBe('polygon')
    })
  })

  // -------------------------------------------------------------------------
  // buildCompositeKey
  // -------------------------------------------------------------------------

  describe('buildCompositeKey', () => {
    it('should combine queryConfigId and recordId', () => {
      expect(buildCompositeKey('config_1', '42')).toBe('config_1_42')
    })

    it('should handle empty strings', () => {
      expect(buildCompositeKey('', '42')).toBe('_42')
      expect(buildCompositeKey('config_1', '')).toBe('config_1_')
    })
  })

  // -------------------------------------------------------------------------
  // Layer ID helpers
  // -------------------------------------------------------------------------

  describe('layer ID helpers', () => {
    it('should generate GroupLayer ID with prefix', () => {
      expect(getGroupLayerId('widget_1')).toBe('querysimple-fl-widget_1')
    })

    it('should generate FeatureLayer ID with geometry type suffix', () => {
      expect(getFeatureLayerId('widget_1', 'point')).toBe('querysimple-fl-widget_1-point')
      expect(getFeatureLayerId('widget_1', 'polyline')).toBe('querysimple-fl-widget_1-polyline')
      expect(getFeatureLayerId('widget_1', 'polygon')).toBe('querysimple-fl-widget_1-polygon')
    })

    it('should produce IDs distinct from Path 2 prefix', () => {
      const path3Id = getGroupLayerId('widget_1')
      expect(path3Id).not.toContain('querysimple-results-')
      expect(path3Id).toContain('querysimple-fl-')
    })
  })

  // -------------------------------------------------------------------------
  // RESULT_FIELDS schema
  // -------------------------------------------------------------------------

  describe('RESULT_FIELDS', () => {
    it('should have exactly 4 fields', () => {
      expect(RESULT_FIELDS).toHaveLength(4)
    })

    it('should have OBJECTID as oid type', () => {
      const oid = RESULT_FIELDS.find(f => f.name === 'OBJECTID')
      expect(oid).toBeDefined()
      expect(oid!.type).toBe('oid')
    })

    it('should have RECORD_ID as string', () => {
      const field = RESULT_FIELDS.find(f => f.name === 'RECORD_ID')
      expect(field).toBeDefined()
      expect(field!.type).toBe('string')
    })

    it('should have QUERY_CONFIG_ID as string', () => {
      const field = RESULT_FIELDS.find(f => f.name === 'QUERY_CONFIG_ID')
      expect(field).toBeDefined()
      expect(field!.type).toBe('string')
    })

    it('should have COMPOSITE_KEY as string', () => {
      const field = RESULT_FIELDS.find(f => f.name === 'COMPOSITE_KEY')
      expect(field).toBeDefined()
      expect(field!.type).toBe('string')
    })
  })

  // -------------------------------------------------------------------------
  // buildRendererForGeometryType
  // -------------------------------------------------------------------------

  describe('buildRendererForGeometryType', () => {
    it('should build SimpleRenderer with SimpleMarkerSymbol for point', () => {
      const renderer = buildRendererForGeometryType('point', 'widget_1')
      expect(renderer.type).toBe('simple')
      expect(renderer.symbol.type).toBe('simple-marker')
      expect(renderer.symbol.style).toBe('circle')
      expect(renderer.symbol.size).toBe(12)
    })

    it('should build SimpleRenderer with SimpleLineSymbol for polyline', () => {
      const renderer = buildRendererForGeometryType('polyline', 'widget_1')
      expect(renderer.type).toBe('simple')
      expect(renderer.symbol.type).toBe('simple-line')
      expect(renderer.symbol.width).toBe(2)
    })

    it('should build SimpleRenderer with SimpleFillSymbol for polygon', () => {
      const renderer = buildRendererForGeometryType('polygon', 'widget_1')
      expect(renderer.type).toBe('simple')
      expect(renderer.symbol.type).toBe('simple-fill')
      expect(renderer.symbol.outline).toBeDefined()
      expect(renderer.symbol.outline.width).toBe(2)
    })

    it('should read symbology from widgetConfigManager', () => {
      mockWidgetConfigManager.getPointSize.mockReturnValueOnce(20)
      mockWidgetConfigManager.getPointStyle.mockReturnValueOnce('diamond')

      const renderer = buildRendererForGeometryType('point', 'widget_1')
      expect(renderer.symbol.size).toBe(20)
      expect(renderer.symbol.style).toBe('diamond')
    })

    it('should include fill opacity in color array for polygon', () => {
      mockWidgetConfigManager.getFillColor.mockReturnValueOnce([255, 0, 0])
      mockWidgetConfigManager.getFillOpacity.mockReturnValueOnce(0.5)

      const renderer = buildRendererForGeometryType('polygon', 'widget_1')
      expect(renderer.symbol.color).toEqual([255, 0, 0, 0.5])
    })

    it('should include outline opacity in outline color for polygon', () => {
      mockWidgetConfigManager.getOutlineColor.mockReturnValueOnce([0, 255, 0])
      mockWidgetConfigManager.getOutlineOpacity.mockReturnValueOnce(0.8)

      const renderer = buildRendererForGeometryType('polygon', 'widget_1')
      expect(renderer.symbol.outline.color).toEqual([0, 255, 0, 0.8])
    })
  })

  // -------------------------------------------------------------------------
  // createResultGroupLayer
  // -------------------------------------------------------------------------

  describe('createResultGroupLayer', () => {
    it('should create a new GroupLayer and add to map', async () => {
      const mapView = createMockMapView()

      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      expect(MockGroupLayer).toHaveBeenCalledTimes(1)
      expect(mapView.map.add).toHaveBeenCalledWith(groupLayer)
      expect(groupLayer.id).toBe('querysimple-fl-widget_1')
      expect(groupLayer.listMode).toBe('show')
      expect(groupLayer.visible).toBe(true)
      expect(groupLayer.visibilityMode).toBe('inherited')
    })

    it('should use title from widgetConfigManager', async () => {
      mockWidgetConfigManager.getResultsLayerTitle.mockReturnValueOnce('My Results')
      const mapView = createMockMapView()

      const groupLayer = await createResultGroupLayer('widget_1', mapView)
      expect(groupLayer.title).toBe('My Results')
    })

    it('should reuse existing GroupLayer on remount', async () => {
      const existingGroup = { id: 'querysimple-fl-widget_1', layers: { toArray: jest.fn(() => []) } }
      const mapView = createMockMapView([existingGroup])

      const result = await createResultGroupLayer('widget_1', mapView)

      expect(result).toBe(existingGroup)
      expect(MockGroupLayer).not.toHaveBeenCalled()
      expect(mapView.map.add).not.toHaveBeenCalled()
    })

    it('should set __exb_layer_from_runtime to false', async () => {
      const mapView = createMockMapView()

      const groupLayer = await createResultGroupLayer('widget_1', mapView)
      expect((groupLayer as any).__exb_layer_from_runtime).toBe(false)
    })

    it('should reorder GroupLayer to top of map', async () => {
      const existingLayers = [{ id: 'other-layer' }]
      const mapView = createMockMapView(existingLayers)

      await createResultGroupLayer('widget_1', mapView)

      expect(mapView.map.reorder).toHaveBeenCalled()
    })
  })

  // -------------------------------------------------------------------------
  // getOrCreateFeatureLayer
  // -------------------------------------------------------------------------

  describe('getOrCreateFeatureLayer', () => {
    it('should create a new FeatureLayer and add to GroupLayer', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const fl = await getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')

      expect(MockFeatureLayer).toHaveBeenCalledTimes(1)
      expect(fl.id).toBe('querysimple-fl-widget_1-polygon')
      expect(fl.geometryType).toBe('polygon')
      expect(fl.objectIdField).toBe('OBJECTID')
      expect(fl.popupEnabled).toBe(true)
      expect(fl.legendEnabled).toBe(true)
      expect(groupLayer.layers.add).toHaveBeenCalledWith(fl)
    })

    it('should return existing FeatureLayer if already in GroupLayer', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const fl1 = await getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')
      const fl2 = await getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')

      // Second call should find the existing layer, not create a new one
      expect(fl2).toBe(fl1)
      expect(MockFeatureLayer).toHaveBeenCalledTimes(1)
    })

    it('should create separate FeatureLayers for different geometry types', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      const pointFL = await getOrCreateFeatureLayer(groupLayer, 'point', 'widget_1')
      const polyFL = await getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')

      expect(pointFL.id).toBe('querysimple-fl-widget_1-point')
      expect(polyFL.id).toBe('querysimple-fl-widget_1-polygon')
      expect(MockFeatureLayer).toHaveBeenCalledTimes(2)
    })

    it('should pass the correct renderer for each geometry type', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await getOrCreateFeatureLayer(groupLayer, 'point', 'widget_1')
      await getOrCreateFeatureLayer(groupLayer, 'polyline', 'widget_1')
      await getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')

      const calls = MockFeatureLayer.mock.calls
      expect(calls[0][0].renderer.symbol.type).toBe('simple-marker')
      expect(calls[1][0].renderer.symbol.type).toBe('simple-line')
      expect(calls[2][0].renderer.symbol.type).toBe('simple-fill')
    })

    it('should use source: [] for empty initial state', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await getOrCreateFeatureLayer(groupLayer, 'point', 'widget_1')

      const ctorArgs = MockFeatureLayer.mock.calls[0][0]
      expect(ctorArgs.source).toEqual([])
    })

    it('should include all 4 lean schema fields', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      await getOrCreateFeatureLayer(groupLayer, 'point', 'widget_1')

      const ctorArgs = MockFeatureLayer.mock.calls[0][0]
      const fieldNames = ctorArgs.fields.map((f: any) => f.name)
      expect(fieldNames).toEqual(['OBJECTID', 'RECORD_ID', 'QUERY_CONFIG_ID', 'COMPOSITE_KEY'])
    })

    // r028.084: Creation lock — prevents duplicate FeatureLayer construction
    // when two concurrent calls race for the same widgetId + geometryType.
    it('should serialize concurrent creations for the same key (no duplicate construction)', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // Make the popup template build pause until we manually resolve it.
      // This widens the race window so two concurrent callers both pass the
      // existing-layer check and reach the creation gate.
      const popupMod = require('../src/runtime/result-feature-layer-popup')
      let resolvePopup!: (v: any) => void
      const deferred = new Promise(resolve => { resolvePopup = resolve })
      popupMod.buildResultPopupTemplate.mockImplementationOnce(() => deferred)

      // Fire two concurrent calls for the same key BEFORE either completes
      const callA = getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')
      const callB = getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')

      // Let the second call register against the in-flight Promise
      await Promise.resolve()
      await Promise.resolve()

      // Now resolve the deferred popup template; both callers settle
      resolvePopup({ type: 'popup-template', title: 'mock' })

      const [layerA, layerB] = await Promise.all([callA, callB])

      // Both callers got the SAME layer reference
      expect(layerA).toBe(layerB)

      // Construction happened exactly once (no duplicate FeatureLayer build)
      expect(MockFeatureLayer).toHaveBeenCalledTimes(1)

      // groupLayer.layers.add was called exactly once (no duplicate add)
      expect(groupLayer.layers.add).toHaveBeenCalledTimes(1)
    })

    it('should still create a new layer on a subsequent call after the lock cleared', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)

      // First call (uses the default already-resolved mock)
      const fl1 = await getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')

      // Second call for a DIFFERENT geometry type — different key, so creates new
      const fl2 = await getOrCreateFeatureLayer(groupLayer, 'point', 'widget_1')

      expect(fl1).not.toBe(fl2)
      expect(MockFeatureLayer).toHaveBeenCalledTimes(2)
    })
  })

  // -------------------------------------------------------------------------
  // updateFeatureLayerRenderer
  // -------------------------------------------------------------------------

  describe('updateFeatureLayerRenderer', () => {
    it('should replace the renderer on an existing layer', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)
      const fl = await getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')

      mockWidgetConfigManager.getFillColor.mockReturnValueOnce([0, 128, 255])
      updateFeatureLayerRenderer(fl, 'polygon', 'widget_1')

      expect(fl.renderer).toBeDefined()
      expect((fl as any).renderer.type).toBe('simple')
      expect((fl as any).renderer.symbol.type).toBe('simple-fill')
    })
  })

  // -------------------------------------------------------------------------
  // destroyResultLayers
  // -------------------------------------------------------------------------

  describe('destroyResultLayers', () => {
    it('should remove and destroy GroupLayer and all children', async () => {
      const mapView = createMockMapView()
      const groupLayer = await createResultGroupLayer('widget_1', mapView)
      const fl = await getOrCreateFeatureLayer(groupLayer, 'polygon', 'widget_1')

      await destroyResultLayers('widget_1', mapView)

      expect(fl.destroy).toHaveBeenCalled()
      expect(groupLayer.destroy).toHaveBeenCalled()
      expect(mapView.map.remove).toHaveBeenCalledWith(groupLayer)
    })

    it('should be a no-op if GroupLayer does not exist', async () => {
      const mapView = createMockMapView()

      // Should not throw
      await destroyResultLayers('widget_1', mapView)
      expect(mapView.map.remove).not.toHaveBeenCalled()
    })
  })
})
