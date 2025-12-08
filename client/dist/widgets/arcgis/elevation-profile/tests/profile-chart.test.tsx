import { React, createIntl } from 'jimu-core'
import { mockTheme, widgetRender, wrapWidget } from 'jimu-for-test'
import Chart from '../src/runtime/components/profile-chart'
import type Graphic from 'esri/Graphic'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import { unitOptions } from '../src/runtime/constants'
import { getUniqueElevationLayersId } from '../src/common/utils'
import defaultMessages from '../src/setting/translations/default'
class SVGPathElement extends SVGElement {}
// @ts-expect-error
window.SVGPathElement = SVGPathElement

let render = null
beforeAll(() => {
  render = widgetRender(true, mockTheme as any)
})
afterAll(() => {
  render = null
})

jest.mock('esri/intl', () => { return {} }, { virtual: true })
jest.mock('esri/core/lang', () => {
  return {
    clone: (ele) => { return ele }
  }
}, { virtual: true })
jest.mock('esri/geometry/Polyline', () => { return {} }, { virtual: true })
jest.mock('esri/geometry/Point', () => { return {} }, { virtual: true })
jest.mock('esri/geometry/SpatialReference', () => { return {} }, { virtual: true })
jest.mock('esri/core/unitUtils', () => { return {} }, { virtual: true })
jest.mock('esri/Graphic', () => { return { attributes: { MyLength: 100 } } }, { virtual: true })
jest.mock('esri/layers/GraphicsLayer', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        removeAll: () => (null),
        destroy: () => (null)
      }
    })
  }
}, { virtual: true })
jest.mock('esri/geometry/operators/lengthOperator', () => {
  return {
    execute: (geom) => { return 2 }
  }
}, { virtual: true })
jest.mock('esri/geometry/operators/proximityOperator', () => {
  return {
    getNearestCoordinate: (geom, point) => { return point }
  }
}, { virtual: true })
jest.mock('esri/geometry/operators/geodeticLengthOperator', () => {
  return {
    isLoaded: () => (null),
    load: () => (null),
    execute: (geom) => { return 2 }
  }
}, { virtual: true })
jest.mock('esri/geometry/operators/intersectsOperator', () => {
  return {
    execute: (geom1, geom2) => { return true }
  }
}, { virtual: true })

const mockGeneralSettings = {
  allowExport: true,
  isSelectToolActive: true,
  isDrawToolActive: false,
  showGridAxis: true,
  showAxisTitles: true,
  showLegend: true,
  buttonStyle: 'ICONTEXT'
}

const mockProfileResult = {
  effectiveUnits: {
    distance: 'miles',
    elevation: 'feet'
  },
  lines: [
    {
      id: '4d5d129d-fde8-482d-9e9e-df38c277499d',
      type: 'query',
      color: [
        181,
        73,
        0,
        255
      ],
      samples: [
        {
          x: -13311524.802220447,
          y: 4544544.071686943,
          z: 1664.0834970808673,
          distance: 0,
          elevation: 5459.591525855863
        },
        {
          x: -13311522.662993962,
          y: 4544546.2109256,
          z: 1666.1297140855365,
          distance: 7.8412073490813645,
          elevation: 5466.304836238636
        },
        {
          x: -13311520.523766598,
          y: 4544548.350164248,
          z: 1668.0704203527498,
          distance: 15.682414698162729,
          elevation: 5472.671982784612
        },
        {
          x: -13311518.384538362,
          y: 4544550.489402889,
          z: 1669.9476548645944,
          distance: 23.523622047244093,
          elevation: 5478.830888663367
        },
        {
          x: -13311516.24530925,
          y: 4544552.628641522,
          z: 1671.7449492817398,
          distance: 31.364829396325458,
          elevation: 5484.727523890222
        },
        {
          x: -13311514.106079267,
          y: 4544554.767880147,
          z: 1673.4092881745376,
          distance: 39.20603674540683,
          elevation: 5490.187953328535
        },
        {
          x: -13311511.966848405,
          y: 4544556.907118767,
          z: 1675.0187716533378,
          distance: 47.04724409448819,
          elevation: 5495.468410936147
        }
      ],
      progress: 1,
      chartFillEnabled: true,
      chartStrokeWidth: 1.5,
      chartStrokeOffsetY: 0,
      viewVisualizationEnabled: true
    },
    {
      id: '61634379482195741732252289877',
      type: 'query',
      color: [
        181,
        73,
        0,
        255
      ],
      samples: [
        {
          x: -13311524.802220447,
          y: 4544544.071686943,
          z: 1664.0834970808673,
          distance: 0,
          elevation: 5459.591525855863
        },
        {
          x: -13311522.662993962,
          y: 4544546.2109256,
          z: 1666.1297140855365,
          distance: 7.8412073490813645,
          elevation: 5466.304836238636
        },
        {
          x: -13311520.523766598,
          y: 4544548.350164248,
          z: 1668.0704203527498,
          distance: 15.682414698162729,
          elevation: 5472.671982784612
        },
        {
          x: -13311518.384538362,
          y: 4544550.489402889,
          z: 1669.9476548645944,
          distance: 23.523622047244093,
          elevation: 5478.830888663367
        },
        {
          x: -13311516.24530925,
          y: 4544552.628641522,
          z: 1671.7449492817398,
          distance: 31.364829396325458,
          elevation: 5484.727523890222
        },
        {
          x: -13311514.106079267,
          y: 4544554.767880147,
          z: 1673.4092881745376,
          distance: 39.20603674540683,
          elevation: 5490.187953328535
        },
        {
          x: -13311511.966848405,
          y: 4544556.907118767,
          z: 1675.0187716533378,
          distance: 47.04724409448819,
          elevation: 5495.468410936147
        }
      ],
      progress: 1,
      chartFillEnabled: true,
      chartStrokeWidth: 1.5,
      chartStrokeOffsetY: 0,
      viewVisualizationEnabled: true
    }
  ]
}

const defaultElevationLayerSettings = {
  id: '4d5d129d-fde8-482d-9e9e-df38c277499d',
  useDataSource: null,
  label: 'Test1',
  elevationLayerUrl: '',
  style: {
    lineType: 'solid-line',
    lineColor: '#808080',
    lineThickness: 3
  },
  displayStatistics: false,
  selectedStatistics: []
}

const elevationLayerSettings = {
  id: '61634379482195741732252289877',
  useDataSource: null,
  label: 'Test2',
  elevationLayerUrl: '',
  style: {
    lineType: 'solid-line',
    lineColor: '#808080',
    lineThickness: 3
  },
  displayStatistics: false,
  selectedStatistics: []
}

const mockCurrentConfig = {
  elevationLayersSettings: {
    addedElevationLayers: [defaultElevationLayerSettings],
    groundLayerId: '',
    linearUnit: '',
    elevationUnit: '',
    showVolumetricObjLineInGraph: false,
    volumetricObjSettingsOptions: {
      id: getUniqueElevationLayersId(),
      style: {
        lineType: 'solid-line',
        lineColor: '#cf4ccf',
        lineThickness: 3
      },
      volumetricObjLabel: defaultMessages.volumetricObjectsLabel,
      displayStatistics: true,
      selectedStatistics: []
    }
  },
  profileSettings: {
    isProfileSettingsEnabled: false,
    isCustomizeOptionEnabled: false,
    layers: [
      {
        layerId: 'dataSource_1-EP_base_2249',
        elevationSettings: {
          type: 'one',
          unit: 'feet',
          field1: '',
          field2: ''
        },
        distanceSettings: {
          type: 'map',
          unit: 'feet',
          field: ''
        },
        style: {
          lineType: 'solid-line',
          lineColor: '#049546',
          lineThickness: 3
        }
      }
    ],
    graphicsHighlightColor: '#00ffff',
    nextSelectableLineOptions: {
      displayNextSelectableLine: true,
      style: {
        lineType: 'dotted-line',
        lineColor: '#fcfc03',
        lineThickness: 3
      }
    }
  }
}

const props = {
  intl: createIntl({ locale: 'en' }),
  isExportEnable: true,
  parentWidgetId: 'widget_1',
  commonGeneralSettings: mockGeneralSettings,
  activeDs: 'datasource_1',
  currentConfig: mockCurrentConfig,
  theme: mockTheme,
  selectedLinearUnit: 'meters',
  selectedElevationUnit: 'miles',
  profileResult: mockProfileResult,
  unitOptions,
  groundLayerLabel: 'Terrain3D',
  isFlip: false,
  isUniformChartScalingEnable: false,
  mapView: {
    view: {
      type: '2d'
    }
  },
  drawingLayer: new GraphicsLayer(),
  intersectionHighlightLayer: new GraphicsLayer(),
  showVolumetricObj: false,
  volumetricObjLineStyle: {
    lineType: 'solid-line',
    lineColor: '#cf4ccf',
    lineThickness: 3
  },
  volumetricObjLabel: 'Volumetric objects',
  assetIntersectionResult: null,
  isCustomIntervalEnabled: true,
  customDistanceInterval: 0.004,
  chartDataUpdateTime: 0,
  addedElelvationProfileLayers: [defaultElevationLayerSettings, elevationLayerSettings],
  highlightChartPositionOnMap: jest.fn(),
  hideChartPosition: jest.fn(),
  chartInfo: jest.fn(),
  toggleLegendSeriesState: jest.fn(),
  setExportButton: jest.fn()
}

describe.skip('Profile chart test cases', () => {
  it('Display the chart legend', function () {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(Chart as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='chart' {...props} />)
    expect((ref.current as any).state.showLegend).toBe(mockGeneralSettings.showLegend)
  })

  it('Validate the distance and elevation values for ground elevation and profile line are converted', function () {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(Chart as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='chart' {...props} />)
    const selectedGraphic = { attributes: { MyLength: 10 } }
    const configuredSettings = { field: 'MyLength', unit: 'kilometers' }
    const value = (ref.current as any).getDistanceAsPerConfiguredFieldAndUnits(configuredSettings, selectedGraphic as Graphic)
    expect(value).toEqual(10000)
  })

  it('Validate that the chart object is made when a segment is drawn or selected', async function () {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(Chart as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='chart' {...props} />)
    //we will validate this by check if the charDefination is not null
    ;(ref.current as any).createOrUpdateChartDefinition()
    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })
    expect((ref.current as any).state.chartDefinition).not.toBeNull()
  })

  it('Validate profile results interval is used', function async () {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(Chart as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='chart' {...props} />)
    const mockChartData = [
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156712.881538049,
        x: 0,
        y: 34.34727898863898,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 0
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156710.3392752316,
        x: 0.001485077149447228,
        y: 33.9108016706882,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 1
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156707.797003822,
        x: 0.002970154298894456,
        y: 33.554988851988995,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 2
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156705.254737195,
        x: 0.0044552314483416846,
        y: 33.29310196631967,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 3
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156702.712470893,
        x: 0.005940308597788912,
        y: 33.03121511408491,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 4
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156700.170204914,
        x: 0.007425385747236142,
        y: 32.769328295188764,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 5
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156697.6279392596,
        x: 0.00891046289668337,
        y: 32.50744150967919,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 6
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156695.0856739306,
        x: 0.010395540046130596,
        y: 32.24555475770013,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 7
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156692.5434089242,
        x: 0.011880617195577824,
        y: 31.98366803896374,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 8
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156690.001144242,
        x: 0.013365694345025053,
        y: 31.721781353613938,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 9
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156687.458879885,
        x: 0.014850771494472285,
        y: 31.529727388579815,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 10
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156686.4654098274,
        x: 0.015431112291072123,
        y: 31.45625218524149,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 11
      }
    ]

    const mockUpdatedChartData = [
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156712.881538049,
        x: 0,
        y: 34.34727898863898,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 0
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156705.254737195,
        x: 0.0044552314483416846,
        y: 33.29310196631967,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 3
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156697.6279392596,
        x: 0.00891046289668337,
        y: 32.50744150967919,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 6
      },
      {
        xCoordinate: 8113825.831028993,
        yCoordinate: 2156690.001144242,
        x: 0.013365694345025053,
        y: 31.721781353613938,
        esriCTViewY: null,
        pathIdx: 0,
        pointIdx: 9
      }
    ]
    const updatedData = (ref.current as any).applyCustomizeInterval(mockChartData, [])
    expect(updatedData).toStrictEqual(mockUpdatedChartData)
  })

  it('Validate display field alias to display in the csv', function () {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(Chart as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='chart' {...props} />)
    const displayField = (ref.current as any).getDisplayFieldAlias('dataSource_3-17921ae6bce-layer-50', 'Name')
    expect('Name').toEqual(displayField)
  })
})

describe('Profile chart elevation layers test cases', () => {

  it('Should define the order of the display of the layers in the chart legend and statistics as the order set for the elevation layers in the configuration', async function () {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(Chart as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='chart' {...props} />)
    await (ref.current as any).createOrUpdateChartDefinition()
    const mockedElevtionLayers = (ref.current as any).props.addedElelvationProfileLayers
    expect((ref.current as any)._elevationLayersOutput[0].id).toEqual(mockedElevtionLayers[0].id)
    expect((ref.current as any)._elevationLayersOutput[1].id).toEqual(mockedElevtionLayers[1].id)
  })

  it('Configured elevation layers on the chart should be displayed with configured elevation layer settings', async function () {
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(Chart as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='chart' {...props} />)
    await (ref.current as any).createOrUpdateChartDefinition()
    const mockedElevtionLayers = (ref.current as any).props.addedElelvationProfileLayers
    expect((ref.current as any)._elevationLayersOutput[0].profileStyles.label).toEqual(mockedElevtionLayers[0].label)
    expect((ref.current as any)._elevationLayersOutput[1].profileStyles.label).toEqual(mockedElevtionLayers[1].label)
    expect((ref.current as any)._elevationLayersOutput[0].profileStyles.style).toEqual(mockedElevtionLayers[0].style)
    expect((ref.current as any)._elevationLayersOutput[1].profileStyles.style).toEqual(mockedElevtionLayers[1].style)
  })
})
