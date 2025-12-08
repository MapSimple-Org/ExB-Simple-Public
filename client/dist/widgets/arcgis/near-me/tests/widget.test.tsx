import { appActions, getAppStore, Immutable, type ImmutableArray, type IMThemeVariables, React } from 'jimu-core'
import { wrapWidget, widgetRender, mockTheme, getInitState, getDefaultAppConfig, mockSystemJs } from 'jimu-for-test'
import '@testing-library/jest-dom'
import NearMeWidget from '../src/runtime/widget'
import { waitFor } from '@testing-library/dom'
import LocateIncident from '../src/runtime/components/locate-incident'
// Mock WebAssembly to prevent WASM loading issues
Object.defineProperty(globalThis, 'WebAssembly', {
  value: {
    instantiate: jest.fn().mockResolvedValue({
      instance: {
        exports: {}
      }
    }),
    compile: jest.fn().mockResolvedValue({}),
    Module: jest.fn(),
    RuntimeError: Error
  },
  writable: true
})

beforeAll(() => {
  jest.clearAllMocks()

  // Update your jimu-arcgis mock to include the missing method
jest.mock('jimu-arcgis', () => ({
  geometryUtils: {
    projectToSpatialReference: jest.fn((geometry, targetSpatialReference) => { return Promise.resolve(geometry) }),
    // Mock other geometry utility functions
    createBuffer: jest.fn((geometry, distance, unit) => Promise.resolve({
      type: 'polygon',
      rings: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      spatialReference: geometry.spatialReference || { wkid: 4326 }
    })),
  },
  // Data source utilities
  DataSourceManager: {
    getInstance: jest.fn(() => ({
      getDataSource: jest.fn((id) => ({
        id: id,
        type: 'feature-layer',
        layer: {
          id: id,
          title: `Mock Layer ${id}`,
          url: `https://mock.arcgis.com/rest/services/layer/${id}`,
          queryFeatures: jest.fn().mockResolvedValue({
            features: [],
            fields: []
          })
        },
        getLayerDefinition: jest.fn().mockResolvedValue({
          name: `Mock Layer ${id}`,
          fields: [],
          geometryType: 'esriGeometryPoint'
        })
      })),
      getDataSources: jest.fn(() => []),
      createDataSourceByWidgetConfig: jest.fn(),
    }))
  },

  // Map view utilities - Updated with missing methods
  JimuMapViewComponent: jest.fn().mockImplementation(({ onActiveViewChange, children }) => {
    const mockMapView = {
      view: {
        type: 'map-view',
        map: {
          layers: {
            add: jest.fn(),
            remove: jest.fn(),
            removeAll: jest.fn(),
            items: []
          }
        },
        graphics: {
          add: jest.fn(),
          remove: jest.fn(),
          removeAll: jest.fn(),
          items: []
        },
        goTo: jest.fn().mockResolvedValue(true),
        when: jest.fn().mockResolvedValue(true),
        on: jest.fn(() => ({ remove: jest.fn() })),
        center: { longitude: 0, latitude: 0 },
        zoom: 10,
        scale: 100000,
        extent: {
          xmin: -1, ymin: -1, xmax: 1, ymax: 1,
          spatialReference: { wkid: 4326 }
        }
      },
      jimuMapView: {
        id: 'mock-map-view',
        view: {}, // Same as above view
        isActive: true,
        status: 'LOADED',
        // Add the missing method
        getAllJimuLayerViews: jest.fn(() => [
          {
            id: 'mock-layer-view-1',
            layer: {
              id: 'mock-layer-1',
              title: 'Mock Layer 1',
              type: 'feature'
            },
            view: {
              layer: {
                id: 'mock-layer-1',
                title: 'Mock Layer 1'
              }
            }
          }
        ]),
        getJimuLayerViewByAPILayer: jest.fn((layer) => ({
          id: `mock-layer-view-${layer.id}`,
          layer: layer,
          view: { layer: layer }
        })),
        addLayer: jest.fn(),
        removeLayer: jest.fn(),
        whenJimuLayerViewLoaded: jest.fn().mockResolvedValue({
          id: 'mock-layer-view',
          layer: { id: 'mock-layer', title: 'Mock Layer' }
        })
      }
    }

    // Simulate calling onActiveViewChange when component mounts
    React.useEffect(() => {
      if (onActiveViewChange) {
        onActiveViewChange(mockMapView.jimuMapView)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onActiveViewChange])
    return React.createElement('div', { 'data-testid': 'jimu-map-view' }, children)
  }),

  // Map view context - Updated with missing methods
  MapViewManager: {
    getInstance: jest.fn(() => ({
      getJimuMapViewById: jest.fn((id) => ({
        id: id,
        view: {
          type: 'map-view',
          map: {
            layers: { add: jest.fn(), remove: jest.fn(), items: [] }
          },
          graphics: { add: jest.fn(), remove: jest.fn(), items: [] },
          goTo: jest.fn().mockResolvedValue(true)
        },
        isActive: true,
        status: 'LOADED',
        // Add the missing method here too
        getAllJimuLayerViews: jest.fn(() => [
          {
            id: 'mock-layer-view-1',
            layer: {
              id: 'mock-layer-1',
              title: 'Mock Layer 1',
              type: 'feature'
            },
            view: {
              layer: {
                id: 'mock-layer-1',
                title: 'Mock Layer 1'
              }
            }
          }
        ]),
        getJimuLayerViewByAPILayer: jest.fn((layer) => ({
          id: `mock-layer-view-${layer.id}`,
          layer: layer,
          view: { layer: layer }
        })),
        addLayer: jest.fn(),
        removeLayer: jest.fn(),
        whenJimuLayerViewLoaded: jest.fn().mockResolvedValue({
          id: 'mock-layer-view',
          layer: { id: 'mock-layer', title: 'Mock Layer' }
        })
      })),
      getAllJimuMapViews: jest.fn(() => []),
      publishJimuMapView: jest.fn()
    }))
  },

  // Rest of your existing mocks...
  // FeatureLayerDataSource, geometryUtils, etc.
}), { virtual: true })
})

// Mock ArcGIS core workers and WASM modules
jest.mock('esri/core/workers/workers', () => ({}), { virtual: true })

jest.mock('@arcgis/core/chunks/pe-wasm.js', () => ({
  __esModule: true,
  default: {},
  load: jest.fn().mockResolvedValue(true)
}), { virtual: true })

jest.mock('esri/geometry/operators/unionOperator', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockReturnValue({}),
    isLoaded: jest.fn().mockReturnValue(true),
    load: jest.fn().mockResolvedValue(true)
  },
  execute: jest.fn().mockReturnValue({}),
  isLoaded: jest.fn().mockReturnValue(true),
  load: jest.fn().mockResolvedValue(true)
}), { virtual: true })

jest.mock('esri/geometry/operators/equalsOperator', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockReturnValue(true),
    isLoaded: jest.fn().mockReturnValue(true),
    load: jest.fn().mockResolvedValue(true)
  },
  execute: jest.fn().mockReturnValue(true),
  isLoaded: jest.fn().mockReturnValue(true),
  load: jest.fn().mockResolvedValue(true)
}), { virtual: true })

jest.mock('esri/geometry/operators/intersectionOperator', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockReturnValue({}),
    isLoaded: jest.fn().mockReturnValue(true),
    load: jest.fn().mockResolvedValue(true)
  },
  execute: jest.fn().mockReturnValue({}),
  isLoaded: jest.fn().mockReturnValue(true),
  load: jest.fn().mockResolvedValue(true)
}), { virtual: true })

jest.mock('esri/geometry/operators/geodeticAreaOperator', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockReturnValue(1000),
    isLoaded: jest.fn().mockReturnValue(true),
    load: jest.fn().mockResolvedValue(true)
  },
  execute: jest.fn().mockReturnValue(1000),
  isLoaded: jest.fn().mockReturnValue(true),
  load: jest.fn().mockResolvedValue(true)
}), { virtual: true })

jest.mock('esri/geometry/operators/areaOperator', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockReturnValue(1000),
    isLoaded: jest.fn().mockReturnValue(true),
    load: jest.fn().mockResolvedValue(true)
  },
  execute: jest.fn().mockReturnValue(1000),
  isLoaded: jest.fn().mockReturnValue(true),
  load: jest.fn().mockResolvedValue(true)
}), { virtual: true })

jest.mock('esri/geometry/operators/geodeticLengthOperator', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockReturnValue(100),
    isLoaded: jest.fn().mockReturnValue(true),
    load: jest.fn().mockResolvedValue(true)
  },
  execute: jest.fn().mockReturnValue(100),
  isLoaded: jest.fn().mockReturnValue(true),
  load: jest.fn().mockResolvedValue(true)
}), { virtual: true })

jest.mock('esri/geometry/operators/geodesicProximityOperator', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockReturnValue([100]),
    isLoaded: jest.fn().mockReturnValue(true),
    load: jest.fn().mockResolvedValue(true)
  },
  execute: jest.fn().mockReturnValue([100]),
  isLoaded: jest.fn().mockReturnValue(true),
  load: jest.fn().mockResolvedValue(true)
}), { virtual: true })

jest.mock('esri/geometry/operators/lengthOperator', () => ({
  __esModule: true,
  default: {
    execute: jest.fn().mockReturnValue(100),
    isLoaded: jest.fn().mockReturnValue(true),
    load: jest.fn().mockResolvedValue(true)
  },
  execute: jest.fn().mockReturnValue(100),
  isLoaded: jest.fn().mockReturnValue(true),
  load: jest.fn().mockResolvedValue(true)
}), { virtual: true })

// Mock other ArcGIS modules that might cause WASM issues
jest.mock('esri/geometry/projection', () => ({
  load: jest.fn().mockResolvedValue(true),
  project: jest.fn().mockReturnValue({})
}), { virtual: true })

// Mock geometry engine to prevent WASM issues
jest.mock('esri/geometry/geometryEngine', () => ({
  buffer: jest.fn().mockReturnValue({}),
  intersects: jest.fn().mockReturnValue(true),
  distance: jest.fn().mockReturnValue(100),
  geodesicBuffer: jest.fn().mockReturnValue({})
}), { virtual: true })


jest.mock('esri/widgets/Sketch/SketchViewModel', () => ({
  default: jest.fn().mockImplementation((options = {}) => ({
    view: options.view || null,
    layer: options.layer || null,
    pointSymbol: options.pointSymbol || null,
    polylineSymbol: options.polylineSymbol || null,
    polygonSymbol: options.polygonSymbol || null,
    activeTool: null,
    state: 'ready',

    // Methods
    create: jest.fn(function (tool) {
      this.activeTool = tool
      this.state = 'active'
    }),
    complete: jest.fn(function () {
      this.state = 'complete'
    }),
    cancel: jest.fn(function () {
      this.state = 'ready'
      this.activeTool = null
    }),
    reset: jest.fn(function () {
      this.state = 'ready'
      this.activeTool = null
    }),

    // Event handling
    on: jest.fn((eventName, callback) => ({
      remove: jest.fn()
    })),

    // Properties that can be set
    set: jest.fn(function (property, value) {
      this[property] = value
    }),

    destroyed: false,
    destroy: jest.fn(function () {
      this.destroyed = true
    })
  }))
}), { virtual: true })

jest.mock('esri/Color', () => ({
  default: jest.fn().mockImplementation((color = '#000000') => {
    // Handle different color input formats
    let r = 0; let g = 0; let b = 0; let a = 1
    if (typeof color === 'string') {
      // Handle hex colors
      if (color.startsWith('#')) {
        const hex = color.slice(1)
        r = parseInt(hex.substr(0, 2), 16) || 0
        g = parseInt(hex.substr(2, 2), 16) || 0
        b = parseInt(hex.substr(4, 2), 16) || 0
        a = hex.length > 6 ? parseInt(hex.substr(6, 2), 16) / 255 : 1
      }
    } else if (Array.isArray(color)) {
      // Handle [r, g, b, a] format
      r = color[0] || 0
      g = color[1] || 0
      b = color[2] || 0
      a = color[3] !== undefined ? color[3] / 255 : 1
    }
    return {
      r,
      g,
      b,
      a,
      toHex: jest.fn(() => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`),
      toRgb: jest.fn(() => `rgb(${r}, ${g}, ${b})`),
      toRgba: jest.fn(() => `rgba(${r}, ${g}, ${b}, ${a})`),
      // eslint-disable-next-line new-cap
      clone: jest.fn(() => new (jest.requireMock('esri/Color').default)([r, g, b, a * 255])),
      setColor: jest.fn(function (newColor) {
        // eslint-disable-next-line new-cap
        const newColorObj = new (jest.requireMock('esri/Color').default)(newColor)
        this.r = newColorObj.r
        this.g = newColorObj.g
        this.b = newColorObj.b
        this.a = newColorObj.a
      })
    }
  })
}), { virtual: true })

jest.mock('esri/symbols/support/jsonUtils', () => ({
  fromJSON: jest.fn((symbolJson) => {
    if (!symbolJson) return null
    // Return a mock symbol object based on the JSON
    return {
      type: symbolJson.type || 'simple-marker',
      color: symbolJson.color || [0, 0, 0, 255],
      outline: symbolJson.outline || { color: [0, 0, 0, 255], width: 1 },
      size: symbolJson.size || 12,
      style: symbolJson.style || 'solid',
      width: symbolJson.width || 1,
      clone: jest.fn().mockReturnThis(),
      toJSON: jest.fn().mockReturnValue(symbolJson)
    }
  }),
  toJSON: jest.fn((symbol) => {
    if (!symbol) return null
    return {
      type: symbol.type || 'simple-marker',
      color: symbol.color || [0, 0, 0, 255],
      outline: symbol.outline,
      size: symbol.size,
      style: symbol.style,
      width: symbol.width
    }
  })
}), { virtual: true })
jest.mock('esri/geometry/operators/simplifyOperator', () => {
  return {
    isSimple: (geom) => { return true },
    execute: (geom) => { return geom }
  }
}, { virtual: true })
jest.mock('esri/geometry/operators/intersectionOperator', () => {
  return {
    isSimple: (geom) => { return true },
    execute: (geom1, geom2) => { return geom1 },
    executeMany: ([geom], geom1) => { return [geom] }
  }
}, { virtual: true })

jest.mock('esri/layers/GraphicsLayer', () => ({
  default: jest.fn().mockImplementation(() => ({
    graphics: {
      add: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn(),
      items: [],
      length: 0
    },
    removeAll: jest.fn(),
    destroy: jest.fn(),
    add: jest.fn(),
    visible: true,
    opacity: 1
  }))
}), { virtual: true })


jest.mock('esri/geometry/SpatialReference', () => ({
  default: jest.fn().mockImplementation((options = {}) => ({
    wkid: options.wkid || 4326,
    wkt: options.wkt || null,
    latestWkid: options.latestWkid || options.wkid || 4326,
    isWGS84: options.wkid === 4326 || options.latestWkid === 4326,
    isWebMercator: options.wkid === 3857 || options.latestWkid === 3857,
    isGeographic: options.wkid === 4326 || options.latestWkid === 4326,
    unit: options.unit || 'meter',
    clone: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnValue(true),
    toJSON: jest.fn().mockReturnValue({
      wkid: options.wkid || 4326,
      latestWkid: options.latestWkid || options.wkid || 4326
    })
  }))
}), { virtual: true })

jest.mock('esri/rest/locator', () => ({
  locationToAddress: jest.fn().mockResolvedValue({
    address: '123 Main St, City, State 12345',
    attributes: {},
    location: {
      type: 'point',
      x: -118.2437,
      y: 34.0522,
      spatialReference: { wkid: 4326 }
    },
    score: 100
  }),
  addressToLocations: jest.fn().mockResolvedValue([{
    address: '123 Main St, City, State 12345',
    attributes: {},
    extent: {
      xmin: -118.2447,
      ymin: 34.0512,
      xmax: -118.2427,
      ymax: 34.0532,
      spatialReference: { wkid: 4326 }
    },
    location: {
      type: 'point',
      x: -118.2437,
      y: 34.0522,
      spatialReference: { wkid: 4326 }
    },
    score: 100
  }]),
  suggest: jest.fn().mockResolvedValue([{
    text: 'Suggested Address',
    magicKey: 'mock-magic-key',
    isCollection: false
  }])
}), { virtual: true })

jest.mock('esri/widgets/Features', () => ({
  default: jest.fn().mockImplementation(() => ({
    features: [],
    selectedFeatureIndex: 0,
    viewModel: {
      features: [],
      selectedFeatureIndex: 0
    },
    open: jest.fn(function (options) {
      this.features = options?.features || []
      this.selectedFeatureIndex = 0
      return Promise.resolve()
    }),
    close: jest.fn(),
    destroy: jest.fn(),
    when: jest.fn().mockResolvedValue(true)
  }))
}), { virtual: true })
jest.mock('esri/geometry/Polygon', () => ({
  default: jest.fn().mockImplementation((options) => ({
    type: 'polygon',
    rings: options?.rings || [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
    spatialReference: options?.spatialReference || { wkid: 4326 },
    hasZ: options?.hasZ || false,
    hasM: options?.hasM || false,
    cache: {},
    extent: {
      xmin: 0,
      ymin: 0,
      xmax: 1,
      ymax: 1,
      spatialReference: { wkid: 4326 }
    },
    // Common polygon methods
    clone: jest.fn().mockReturnValue({
      type: 'polygon',
      rings: options?.rings || [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      spatialReference: options?.spatialReference || { wkid: 4326 },
      hasZ: options?.hasZ || false,
      hasM: options?.hasM || false
    }),
    toJSON: jest.fn().mockReturnValue({
      rings: options?.rings || [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      spatialReference: options?.spatialReference || { wkid: 4326 }
    }),
    addRing: jest.fn(),
    removeRing: jest.fn(),
    insertRing: jest.fn(),
    getPoint: jest.fn().mockReturnValue({
      type: 'point',
      x: 0.5,
      y: 0.5,
      spatialReference: { wkid: 4326 }
    }),
    setPoint: jest.fn(),
    getCentroid: jest.fn().mockReturnValue({
      type: 'point',
      x: 0.5,
      y: 0.5,
      spatialReference: { wkid: 4326 }
    })
  }))
}), { virtual: true })
jest.mock('esri/Graphic', () => ({
  default: jest.fn().mockImplementation((options) => ({
    geometry: options?.geometry || {
      type: 'point',
      x: 0,
      y: 0,
      spatialReference: { wkid: 4326 }
    },
    attributes: options?.attributes || {},
    symbol: options?.symbol || null,
    popupTemplate: options?.popupTemplate || null
  }))
}), { virtual: true })

jest.mock('esri/core/reactiveUtils', () => ({
  watch: jest.fn((target, properties, callback) => ({
    remove: jest.fn()
  })),
  on: jest.fn((target, event, callback) => ({
    remove: jest.fn()
  })),
  when: jest.fn().mockResolvedValue(true)
}), { virtual: true })

jest.mock('esri/layers/FeatureLayer', () => ({
  default: jest.fn().mockImplementation(() => ({
    id: 'mock-feature-layer',
    title: 'Mock Feature Layer',
    visible: true,
    opacity: 1,
    removeAll: jest.fn(),
    destroy: jest.fn(),
    queryFeatures: jest.fn().mockResolvedValue({
      features: [],
      fields: []
    }),
    getFieldDomain: jest.fn().mockReturnValue(null),
    getField: jest.fn().mockReturnValue(null)
  }))
}), { virtual: true })

jest.mock('esri/widgets/FeatureForm', () => ({
  default: jest.fn().mockImplementation(() => ({
    feature: null,
    viewModel: {
      feature: null,
      layer: null
    },
    on: jest.fn(),
    destroy: jest.fn(),
    submit: jest.fn().mockResolvedValue(true)
  }))
}), { virtual: true })
// Rest of your existing mocks...
mockSystemJs()
getAppStore().dispatch(appActions.updateStoreState(getInitState().merge({ appConfig: getDefaultAppConfig() })))

// Mock ResizeObserver
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock fetch for any external resource loading
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
  })
) as jest.Mock

const searchSetting = {
  activeToolWhenWidgetOpens: 'none',
  bufferDistance: 1,
  distanceUnits: 'Miles',
  headingLabel: 'Location',
  headingLabelStyle: {
    fontFamily: 'Avenir Next',
    fontBold: false,
    fontItalic: false,
    fontUnderline: false,
    fontStrike: false,
    fontColor: 'var(--ref-palette-black)',
    fontSize: '13px'
  },
  includeFeaturesOutsideMapArea: false,
  searchByLocation: true,
  searchByActiveMapArea: false,
  showDistanceSettings: true,
  showInputAddress: true,
  sketchTools: {
    showPoint: true,
    showPolyline: true,
    showPolygon: true
  }
}

const layerInfo = {
  useDataSource: {
    dataSourceId: "dataSource_1",
    mainDataSourceId: "dataSource_1",
    rootDataSourceId: "dataSource_1"
  },
  label: "Layer",
  analysisInfo: {
    analysisId: "3750024023465498",
    analysisType: "proximity",
    highlightResultsOnMap: true,
    highlightColorOnMap: "#f507f5",
    expandOnOpen: true,
    returnIntersectedPolygons: false,
    clipFeatures: false,
    fieldsToExport: [
      "OBJECTID",
      "GlobalID",
    ],
    includeApproxDistance: false,
    displayFeatureCount: true
  }
}


const configInfo = {
  dataSource_1: {
    analysisSettings: {
      displayAllLayersResult: false,
      displayAnalysisIcon: true,
      displayMapSymbols: false,
      enableProximitySearch: false,
      layersInfo: [layerInfo],
      onlyShowLayersResult: false,
      saveFeatures: {},
      showDistFromInputLocation: true
    },
    searchSettings: searchSetting
  }
}

const fontStyles = {
  fontBold: false,
  fontColor: 'black',
  fontFamily: 'Avenir Next',
  fontItalic: false,
  fontSize: '12px',
  fontStrike: false,
  fontUnderline: false
}

const generalSettings = {
  highlightColor: '#004ca3',
  keepResultsWhenClosed: true,
  noResultMsgStyleSettings: fontStyles,
  noResultsFoundText: 'No results found.',
  promptTextMessage: '',
  promptTextMsgStyleSettings: fontStyles,
  searchAreaSymbol: {
    color: 'blue',
    outline: 'black',
    type: 'esriSLS',
    width: 1.5
  }
}

const commonConfig = {
  useMapWidget: false,
  configInfo: configInfo,
  generalSettings: generalSettings
}

const theme = {
  ...mockTheme,
  surfaces: [{ bg: '#fff' }, { bg: '#fff' }]
} as unknown as IMThemeVariables

const render = widgetRender()

describe('Validate that the widget is connected or not to a map widget', () => {
  it('Should show Widget Place Holder when map is not configured', () => {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    const { queryByTestId } = render(<Widget theme={theme} config={commonConfig} />)
    expect(queryByTestId('widgetPlaceholder')).toBeInTheDocument()
  })

  it('Should show message - Please wait while the map is loading', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    const { queryByTestId } = render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} layouts={{} as any} />)
    expect(queryByTestId('mapLoadingMsg')).toBeInTheDocument()
  })
})

describe('Validate Runtime State', () => {
  it('Should clear all results and reset widget state on delete button click', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
      ; (ref.current as any).onResetButtonClick()
    expect((ref.current as any).state.displayLayerAccordion.length).toBe(0)
  })

  // it('Should show info message indicating no analysis configured when no analysis is configured', async () => { //TODO
  //   const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
  //   const ref: { current: HTMLElement } = { current: null }
  //   const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
  //   const { queryByTestId } = render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
  //     ; (ref.current as any).isValidLayerConfigured()
  //   await waitFor(() => {
  //     expect(queryByTestId('noAnalysisLayerMsg')).toBeInTheDocument()
  //   }, { timeout: 100 })
  // })

  // it('Save icon should be shown when it is enabled and valid layer has been selected', () => { //TODO
  //   const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
  //   const ref: { current: HTMLElement } = { current: null }
  //   const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
  //   const { queryByTestId } = render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
  // })

  // it('Should show export icon if datasource supports', () => { //TODO
  //   const { getByTestId } = render(<Widget theme={theme} config={commonConfig} />)
  //   expect(getByTestId('exportIcon')).toBeInTheDocument()
  // })
})

describe('Validate specify a location', () => {
 beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })
  it('Should show point drawing tool when enabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(LocateIncident as any, { theme: mockTheme, ref } as any)
    const { queryByTestId } = render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={searchSetting} />)
    expect(queryByTestId('pointButton')).toBeInTheDocument()
  })

  it('Should show polyline drawing tool when enabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(LocateIncident as any, { theme: mockTheme, ref } as any)
    const { queryByTestId } = render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={searchSetting} />)
    expect(queryByTestId('polylineButton')).toBeInTheDocument()
  })

  it('Should show polygon drawing tool when enabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(LocateIncident as any, { theme: mockTheme, ref } as any)
    const { queryByTestId } = render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={searchSetting} />)
    expect(queryByTestId('polygonButton')).toBeInTheDocument()
  })

  it('Should show Distance settings when enabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.searchSettings.showDistanceSettings).toBe(true)
    }, { timeout: 100 })
  })

  it('Should hide Distance settings when disabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    const modifiedConfig = {
      ...commonConfig
    }
    modifiedConfig.configInfo.dataSource_1.searchSettings.showDistanceSettings = false
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={modifiedConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.searchSettings.showDistanceSettings).toBe(false)
    }, { timeout: 100 })
  })


  // it('Should show address input when enabled from config', () => { //TODO
  //   const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
  //     const ref: { current: HTMLElement } = { current: null }
  //     const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
  //     render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
  //     waitFor(() => {
  //       expect((ref.current as any).state.showInputAddress).toBe(true)
  //     }, { timeout: 100 })
  // })


  // it('Should generate a buffer when valid buffer distance is provided', async () => { //TODO
  //    const mockMv: JimuMapView = {
  //       id: 'map1-ds1',
  //       dataSourceId: 'dataSource_1',
  //       view: {
  //        spatialReference: {
  //           latestWkid: 3857,
  //           wkid: 102100,
  //           isGeographic: false,
  //           isWGS84: false,
  //           isWebMercator: true
  //         }
  //       }, // Same as above view
  //       isActive: true,
  //       status: 'LOADED',
  //       // Add the missing method
  //       getAllJimuLayerViews: jest.fn(() => [
  //         {
  //           id: 'mock-layer-view-1',
  //           layer: {
  //             id: 'mock-layer-1',
  //             title: 'Mock Layer 1',
  //             type: 'feature'
  //           },
  //           view: {
  //             layer: {
  //               id: 'mock-layer-1',
  //               title: 'Mock Layer 1'
  //             }
  //           }
  //         }
  //       ]),
  //     getJimuLayerViewByAPILayer: jest.fn((layer) => ({
  //       id: `mock-layer-view-${layer.id}`,
  //       layer: layer,
  //       view: { layer: layer }
  //     })),
  //     addLayer: jest.fn(),
  //     removeLayer: jest.fn(),
  //     whenJimuLayerViewLoaded: jest.fn().mockResolvedValue({
  //       id: 'mock-layer-view',
  //       layer: { id: 'mock-layer', title: 'Mock Layer' }
  //     })
  //   } as any

  //   //set input location
  //   const inputGeometry = {
  //     type: 'polyline',
  //     paths: [
  //       [[8155703.266454776, 2159222.1716818446], [8156030.25691993, 2159355.037278883]]
  //     ],
  //     spatialReference: {
  //       latestWkid: 3857,
  //       wkid: 102100,
  //       isGeographic: false,
  //       isWGS84: false,
  //       isWebMercator: true
  //     }
  //   }
  //   const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
  //   const ref: { current: HTMLElement } = { current: null }
  //   const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
  //   render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
  //   await (ref.current as any).onActiveViewChange(mockMv)
  //   waitFor(() => {
  //     ; (ref.current as any).recordSelectedFromAction(inputGeometry)
  //   }, { timeout: 100 })

  //   waitFor(() => {
  //     // (ref.current as any).setConfigForDataSources()
  //     expect((ref.current as any).onAoiComplete).toHaveBeenCalled()
  //   }, { timeout: 200 })
  // })
})

// describe('Validate current map area', () => { //TODO
// it('Should display “Update results” button when result are generated', () => {
// })
// })

describe('Validate analysis output', () => {
  it('Should display icon for each analysis type when enabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.analysisSettings?.displayAnalysisIcon).toBe(true)
    }, { timeout: 100 })
  })

  it('Should hide icons for each analysis type when disabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
     const modifiedConfig = {
      ...commonConfig
    }
    modifiedConfig.configInfo.dataSource_1.analysisSettings.displayAnalysisIcon = false
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={modifiedConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.analysisSettings?.displayAnalysisIcon).toBe(false)
    }, { timeout: 100 })
  })

  it('Should show feature count if enabled from the config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.analysisSettings?.layersInfo[0].analysisInfo.displayFeatureCount).toBe(true)
    }, { timeout: 100 })
  })

  it('In case of summary analysis toggle icon should shown when expression is configured', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const modifiedLayerInfo = {
      ...layerInfo,
      analysisInfo: {
        ...layerInfo.analysisInfo,
        analysisType: 'summary',
        summaryExpression: [{
          name: "Count",
          expression: "Count",
          outputName: "Count"
        }]
      }
    }
    const modifiedConfig = {
      ...commonConfig
    }
    modifiedConfig.configInfo.dataSource_1.analysisSettings.layersInfo[0] = modifiedLayerInfo
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={modifiedConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.analysisSettings?.layersInfo[0].analysisInfo.analysisType).toBe('summary')
      expect((ref.current as any).state.analysisSettings?.layersInfo[0].analysisInfo.summaryExpression.length).toBe(1)
    }, { timeout: 100 })
  })

  it('Should show summary info if enabled from the config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.analysisSettings?.layersInfo[0].analysisInfo.fieldsToExport.length).toBe(2)
    }, { timeout: 100 })
  })

  it('Should expand the details if on result generated if enabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.analysisSettings?.layersInfo[0].analysisInfo.expandOnOpen).toBe(true)
    }, { timeout: 100 })
  })

  // it('Should display no result found message when no features are found for the analysis', () => { //TODO
  // })
})

describe('Validate output analysis', () => { // when results are expanded
  it('Features should be highglighted when Highlight results on map is enabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={commonConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.analysisSettings?.layersInfo[0].analysisInfo.highlightResultsOnMap).toBe(true)
    }, { timeout: 100 })
  })

  it('Should not highlight features when Highlight results on map is disabled from config', () => {
    const useMapWidgetId: ImmutableArray<string> = Immutable(['widget_1'])
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(NearMeWidget as any, { theme: mockTheme, ref } as any)
    const modifiedConfig = {
      ...commonConfig
    }
    modifiedConfig.configInfo.dataSource_1.analysisSettings.layersInfo[0].analysisInfo.highlightResultsOnMap = false
    render(<Widget useMapWidgetIds={useMapWidgetId} theme={theme} config={modifiedConfig} />)
    waitFor(() => {
      expect((ref.current as any).state.analysisSettings?.layersInfo[0].analysisInfo.highlightResultsOnMap).toBe(false)
    }, { timeout: 100 })
  })
})