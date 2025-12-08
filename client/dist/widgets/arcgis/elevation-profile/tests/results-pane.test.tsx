import * as React from 'react'
import { createIntl, DataSourceManager } from 'jimu-core'
import ResultPane from '../src/runtime/components/results-pane'
import { mockTheme, wrapWidget, widgetRender } from 'jimu-for-test'
import { fireEvent } from '@testing-library/react'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import { JimuMapView } from 'jimu-arcgis'
import defaultMessages from '../src/setting/translations/default'
import '@testing-library/jest-dom'
import { getUniqueElevationLayersId } from '../src/common/utils'
import ProfileStatistics from '../src/runtime/components/chart-statistics'
jest.mock('esri/intl', () => { return {} }, { virtual: true })
jest.mock('esri/core/lang', () => {
  return {
    clone: (ele) => { return ele }
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
jest.mock('esri/geometry/Point', () => { return { } }, { virtual: true })
jest.mock('esri/geometry/Polyline', () => { return { } }, { virtual: true })
jest.mock('esri/geometry/SpatialReference', () => { return { } }, { virtual: true })
jest.mock('esri/core/unitUtils', () => { return { } }, { virtual: true })
jest.mock('esri/Graphic', () => { return { } }, { virtual: true })
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
jest.mock('esri/layers/FeatureLayer', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        removeAll: () => (null),
        destroy: () => (null)
      }
    })
  }
}, { virtual: true })

let render = null
beforeAll(() => {
  render = widgetRender(true, mockTheme as any)
})
afterAll(() => {
  render = null
})

const defaultElevationLayerSettings = {
  id: '',
  useDataSource: null,
  label: '',
  elevationLayerUrl: '',
  style: {
    lineType: 'solid-line',
    lineColor: '#808080',
    lineThickness: 3
  },
  displayStatistics: true,
  selectedStatistics: []
}

const volumetricObjId = getUniqueElevationLayersId()

const commonProps = {
  theme: mockTheme,
  intl: createIntl({ locale: 'en' }),
  widgetId: 'widget_2',
  chartRender: false,
  displayLoadingIndicator: false,
  groundLayerLabel: 'Terrain3D',
  onDrawingComplete: false,
  selectMode: false,
  drawMode: true,
  isNewSegmentsForSelection: false,
  noGraphicAfterFirstSelection: false,
  noFeaturesFoundError: false,
  viewModelErrorState: true,
  defaultConfig: {
    elevationLayersSettings: {
      addedElevationLayers: [defaultElevationLayerSettings],
      groundLayerId: '',
      linearUnit: '',
      elevationUnit: '',
      showVolumetricObjLineInGraph: false,
      volumetricObjSettingsOptions: {
        id: volumetricObjId,
        style: {
          lineType: 'solid-line',
          lineColor: '#cf4ccf',
          lineThickness: 3
        },
        volumetricObjLabel: defaultMessages.volumetricObjectsLabel,
        displayStatistics: true,
        selectedStatistics: []
      }
    }
  },
  profileResult: {
    lines: []
  },
  visibleGroundProfileStats: {},
  profileErrorMsg: '',
  jimuMapview: JimuMapView,
  drawingLayer: new GraphicsLayer(),
  intersectionHighlightLayer: new GraphicsLayer(),
  commonDsGeneralSettings: {
    allowExport: true,
    isSelectToolActive: true,
    isDrawToolActive: false,
    showGridAxis: true,
    showAxisTitles: false,
    showLegend: true,
    buttonStyle: 'ICONTEXT'
  },
  activeDatasourceConfig: {
    elevationLayersSettings: {
      addedElevationLayers: [defaultElevationLayerSettings],
      groundLayerId: '',
      linearUnit: 'meters',
      elevationUnit: 'kilometers',
      showVolumetricObjLineInGraph: false,
      volumetricObjSettingsOptions: {
        id: volumetricObjId,
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
      isProfileSettingsEnabled: true,
      isCustomizeOptionEnabled: true,
      layers: []
    },
    assetSettings: {
      isAssetSettingsEnabled: false,
      layers: [],
      assetIntersectingBuffer: {
        enabled: false,
        bufferDistance: 10,
        bufferUnits: '',
        bufferSymbol: {
          type: 'esriSFS',
          color: [239, 132, 38, 128],
          outline: {
            type: 'esriSLS',
            color: [184, 115, 59, 255],
            width: 1.5,
            style: 'esriSLSSolid'
          },
          style: 'esriSFSSolid'
        }
      }
    }
  },
  intersectionResult: [],
  selectableLayersRuntime: jest.fn(),
  intersectingLayersRuntime: jest.fn(),
  doneClick: jest.fn(),
  onNavBack: jest.fn(),
  activateDrawSelectToolForNewProfile: jest.fn(),
  hideChartPosition: jest.fn(),
  chartPosition: jest.fn(),
  buildOutputStatistics: jest.fn(),
  intersectingBufferRuntime: jest.fn(),
  activeDataSource: 'default',
  addedElelvationProfileLayers: [defaultElevationLayerSettings]
}

//Test cases depends on the props value which are passed through the widget
describe('Validate message states to display the appropriate alerts', function () {
  it('Should prompt the user to select or draw on the map or scene if they click Done without having drawn or selected.', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = { ...commonProps }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByTitle, getByText } = render(<Widget widgetId='resultspane' {...props} />)
    fireEvent.click(getByTitle((ref.current as any).nls('doneButtonLabel')))
    expect(getByText((ref.current as any).nls('drawUserInfo'))).toBeInTheDocument()
    expect(getByText((ref.current as any).nls('emptyDrawStateWarning'))).toBeInTheDocument()
  })

  it('Should show a message when no further line features can be selected.', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      chartRender: true,
      onDrawingComplete: true,
      selectMode: true,
      drawMode: false,
      isNewSegmentsForSelection: false,
      noGraphicAfterFirstSelection: false,
      noFeaturesFoundError: false,
      viewModelErrorState: false
    }
    //There are no additional connected lines to select. - Msg should be shown
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByText } = render(<Widget widgetId='resultsPane' {...props} />)
    expect(getByText((ref.current as any).nls('addToSelectionWarning'))).toBeInTheDocument()
  })

  it('Should show message info if there is a new segment selectable for the selected line features.', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      chartRender: true,
      onDrawingComplete: false,
      selectMode: true,
      drawMode: false,
      isNewSegmentsForSelection: true,
      noGraphicAfterFirstSelection: true,
      viewModelErrorState: false,
      noFeaturesFoundError: false
    }
    //'Select a connected line or click Done to finish.' Msg should be shown
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByText } = render(<Widget widgetId='resultsPane' {...props} />)
    expect(getByText((ref.current as any).nls('infoMsgWhileSelecting'))).toBeInTheDocument()
  })

  it('Should return an error if polylines are drawn or selected where no elevation ground layer exists.', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      viewModelErrorState: true,
      chartRender: false,
      onDrawingComplete: false,
      selectMode: true,
      drawMode: false,
      isNewSegmentsForSelection: false,
      noGraphicAfterFirstSelection: false,
      noFeaturesFoundError: false,
      profileErrorMsg: 'No elevation information is available for this location.'
    }
    //'No elevation information is available for this location.' Msg Should be shown
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByText } = render(<Widget widgetId='resultspane' {...props} />);
    (ref.current as any).state.viewModelErrorMsg = props.profileErrorMsg
    expect(getByText((ref.current as any).state.viewModelErrorMsg)).toBeInTheDocument()
  })
})

describe('Validate button states at runtime', function () {
  it('Should have the ability to load the widget with either the draw or the select tool active.', () => {
    //In this case we are making Draw tool active from config and checking the msg shown once draw tool is activated at runtime
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      chartRender: false,
      drawMode: true,
      selectMode: false,
      noFeaturesFoundError: false,
      viewModelErrorState: false,
      commonDsGeneralSettings: {
        allowExport: true,
        isSelectToolActive: false,
        isDrawToolActive: true,
        showGridAxis: true,
        showAxisTitles: false,
        showLegend: true,
        buttonStyle: 'ICONTEXT'
      }
    }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByText } = render(<Widget widgetId='resultpane' {...props} />)
    expect(getByText((ref.current as any).nls('drawUserInfo'))).toBeInTheDocument()
  })

  it('Should display the clear button when the chart is rendered', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      chartRender: true,
      onDrawingComplete: true,
      selectMode: true,
      isNewSegmentsForSelection: false,
      noGraphicAfterFirstSelection: false,
      noFeaturesFoundError: false,
      viewModelErrorState: false
    }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByTitle } = render(<Widget widgetId='resultspane' {...props} />)
    expect(getByTitle((ref.current as any).nls('clearButtonLabel'))).toBeInTheDocument()
  })

  it('Should display flip and statistics button when the chart is rendered', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      chartRender: true,
      onDrawingComplete: false,
      selectMode: true,
      isNewSegmentsForSelection: false,
      noGraphicAfterFirstSelection: false,
      noFeaturesFoundError: false,
      viewModelErrorState: false
    }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByTitle } = render(<Widget widgetId='resultspane' {...props} />)
    expect(getByTitle((ref.current as any).nls('chartStatistics'))).toBeInTheDocument()
    expect(getByTitle((ref.current as any).nls('chartFlip'))).toBeInTheDocument()
  })

  it('When the chart is rendered, on click Done button should hide the clear and Done button and show the New Profile button', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      chartRender: true,
      onDrawingComplete: true
    }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByTitle } = render(<Widget widgetId='resultspane' {...props} />)
    fireEvent.click(getByTitle((ref.current as any).nls('doneButtonLabel')))
    expect(getByTitle((ref.current as any).nls('clearButtonLabel'))).toHaveClass('hidden')
    expect(getByTitle((ref.current as any).nls('doneButtonLabel'))).toHaveClass('hidden')
    expect(getByTitle((ref.current as any).nls('newProfileButtonLabel'))).toBeInTheDocument()
  })
})

describe('Validate statistics button visibility at runtime', function () {
  it('Should display statistics button when Profile statistics option is turned on from config', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      chartRender: true
    }
    props.activeDatasourceConfig.elevationLayersSettings.addedElevationLayers[0].displayStatistics = true
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByTitle } = render(<Widget widgetId='resultspane' {...props} />)
    expect(getByTitle((ref.current as any).nls('chartStatistics'))).toBeInTheDocument()
  })

  it('Should not display statistics button when Profile statistics option is turned off from config', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      chartRender: true
    }
    props.activeDatasourceConfig.elevationLayersSettings.addedElevationLayers[0].displayStatistics = false
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { queryByText } = render(<Widget widgetId='resultspane' {...props} />)
    const element = queryByText((ref.current as any).nls('chartStatistics'))
    expect(element).toBeNull()
  })
})

describe('Validate that the widget properly checks that the selectable line layers are', function () {
  let mockFn = null
  let dss = null
  let mockFnGetDataSource = null
  beforeAll(() => {
    //mock the datasource with its child datasources including id, layerDefinition, type and schema
    mockFn = jest.fn().mockImplementation(() => {
      return [
        {
          id: 'lineLayer',
          getLayerDefinition: jest.fn().mockReturnValue({
            geometryType: 'esriGeometryPolyline'
          }),
          type: 'FEATURE_LAYER',
          getSchema: jest.fn().mockReturnValue({
            label: 'Line Layer'
          }),
          isDataSourceSet: () => false
        },
        {
          id: 'pointLayer',
          getLayerDefinition: jest.fn().mockReturnValue({
            geometryType: 'esriGeometryPoint'
          }),
          type: 'FEATURE_LAYER',
          getSchema: jest.fn().mockReturnValue({
            label: 'Point Layer'
          }),
          isDataSourceSet: () => false
        },
        {
          id: 'polygonLayer',
          getLayerDefinition: jest.fn().mockReturnValue({
            geometryType: 'esriGeometryPolygon'
          }),
          type: 'FEATURE_LAYER',
          getSchema: jest.fn().mockReturnValue({
            label: 'Polygon Layer'
          }),
          isDataSourceSet: () => false
        }
      ]
    })

    dss = {
      dataSource_1: {
        getChildDataSources: mockFn,
        isDataSourceSet: () => true
      },
      dataSource_2: {
        getChildDataSources: jest.fn().mockImplementation(() => {
          return [
            {
              id: 'pointLayer',
              getLayerDefinition: jest.fn().mockReturnValue({
                geometryType: 'esriGeometryPoint'
              }),
              type: 'FEATURE_LAYER',
              getSchema: jest.fn().mockReturnValue({
                label: 'Point Layer'
              }),
              isDataSourceSet: () => false
            },
            {
              id: 'polygonLayer',
              getLayerDefinition: jest.fn().mockReturnValue({
                geometryType: 'esriGeometryPolygon'
              }),
              type: 'FEATURE_LAYER',
              getSchema: jest.fn().mockReturnValue({
                label: 'Polygon Layer'
              }),
              isDataSourceSet: () => false
            }
          ]
        }),
        isDataSourceSet: () => true
      }
    }
    mockFnGetDataSource = jest.fn().mockImplementation(dsId => {
      return dss[dsId] == null ? dss.ds1 : dss[dsId]
    })
    DataSourceManager.getInstance().getDataSource = mockFnGetDataSource
  })

  it('Available in the map/scene', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      activeDatasourceConfig: {
        elevationLayersSettings: {
          addedElevationLayers: [defaultElevationLayerSettings],
          groundLayerId: '',
          linearUnit: '',
          elevationUnit: '',
          showVolumetricObjLineInGraph: false,
          volumetricObjSettingsOptions: {
            id: volumetricObjId,
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
          isProfileSettingsEnabled: true,
          isCustomizeOptionEnabled: true,
          layers: [{
            layerId: 'lineLayer',
            elevationSettings: {
              type: 'z',
              unit: 'feet',
              field1: '',
              field2: ''
            },
            distanceSettings: {
              type: 'map',
              field: 'Shape__Length',
              unit: 'miles'
            },
            style: {
              lineType: 'solid-line',
              lineColor: '#ce0f3e',
              lineThickness: 3
            }
          }],
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
      },
      activeDataSource: 'dataSource_1'
    }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='resultspane' {...props} />)
    expect((ref.current as any).state.selectedLayers).toHaveLength(1)
    expect((ref.current as any).state.isAnyProfileLineLayers).toEqual(true)
  })

  it('Not available in the map/scene', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      activeDataSource: 'dataSource_2'
    }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='resultspane' {...props} />)
    expect((ref.current as any).state.selectedLayers).toHaveLength(0)
    expect((ref.current as any).state.isAnyProfileLineLayers).toEqual(false)
  })

  it('Validate geometry for generating the chart  - Point & Polygon should not be selectable', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      activeDataSource: 'dataSource_2'
    }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='resultspane' {...props} />)
    //since in data source 2- we have only point and polygon layers the selected layers array will not have any line layer
    expect((ref.current as any).state.selectedLayers).toHaveLength(0)
    expect((ref.current as any).state.isAnyProfileLineLayers).toEqual(false)
  })
})

describe('Validate profile results can be exported to CSV', function () {
  it('Should display export button when the chart is rendered', function () {
    const ref: { current: HTMLElement } = { current: null }
    const props = {
      ...commonProps,
      chartRender: true,
      drawMode: true,
      onDrawingComplete: true,
      selectMode: true,
      isNewSegmentsForSelection: false,
      noGraphicAfterFirstSelection: false,
      noFeaturesFoundError: false,
      viewModelErrorState: false
    }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    const { getByTitle } = render(<Widget widgetId='resultspane' {...props} />)
    expect(getByTitle((ref.current as any).nls('chartExport'))).toBeInTheDocument()
  })
})

describe('Validate the elevation layers displayed on the chart', function () {
  it('Should hide the statistics button if none of the elevation layers Show statistics option is disabled in config', function () {
    const defaultElevationLayerSettings = {
      id: '',
      useDataSource: null,
      label: '',
      elevationLayerUrl: '',
      style: {
        lineType: 'solid-line',
        lineColor: '#808080',
        lineThickness: 3
      },
      displayStatistics: false,
      selectedStatistics: []
    }
    const props = {
      ...commonProps,
      chartRender: true,
      drawMode: true,
      onDrawingComplete: true,
      selectMode: true,
      isNewSegmentsForSelection: false,
      noGraphicAfterFirstSelection: false,
      noFeaturesFoundError: false,
      viewModelErrorState: false,
      defaultConfig: {
        elevationLayersSettings: {
          addedElevationLayers: [defaultElevationLayerSettings],
          showVolumetricObjLineInGraph: false
        }
      }
    }
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(ResultPane as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='resultspane' {...props} />)
    expect((ref.current as any).state.displayStats).toEqual(false)
  })

  it('Should be expanded the first added elevation layer statistics in the profile statistics window', function () {
    const activeDsConfig = {
      elevationLayersSettings: {
        addedElevationLayers: [defaultElevationLayerSettings],
        groundLayerId: '',
        linearUnit: '',
        elevationUnit: '',
        showVolumetricObjLineInGraph: false,
        volumetricObjSettingsOptions: {
          id: volumetricObjId,
          style: {
            lineType: 'solid-line',
            lineColor: '#cf4ccf',
            lineThickness: 3
          },
          volumetricObjLabel: defaultMessages.volumetricObjectsLabel,
          displayStatistics: true,
          selectedStatistics: []
        }
      }
    }

    const profileStatisticsProps = {
      theme: mockTheme,
      intl: createIntl({ locale: 'en' }),
      parentWidgetId: 'widget_1',
      index: 0,
      isShowViewLineInGraph: false,
      legendName: 'default',
      activeDsConfig: activeDsConfig,
      selectedElevationUnit: 'feet',
      selectedLinearUnit: 'miles',
      statsLineColor: '#b54900',
      seriesId: '123',
      renderSeries: true,
      toggledSeriesId: '',
      isFlip: false,
      chartDataUpdateTime: 1234
    }
    const ref: { current: HTMLElement } = { current: null }
    const Widget = wrapWidget(ProfileStatistics as any, { theme: mockTheme, ref } as any)
    render(<Widget widgetId='profileStatistics' {...profileStatisticsProps} />)
    expect((ref.current as any).state.legendExpanded).toEqual(true)
  })
})
