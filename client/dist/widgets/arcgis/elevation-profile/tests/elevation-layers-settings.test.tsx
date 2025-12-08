import { DataSourceManager, JimuMapViewStatus, React, createIntl } from 'jimu-core'
import { mockTheme, widgetRender, wrapWidget, initGlobal } from 'jimu-for-test'
import '@testing-library/jest-dom'
import { waitFor } from '@testing-library/react'
import ElevationLayersSettings from '../src/setting/components/elevation-layers-settings'
import ElevationLayerPopper from '../src/setting/components/elevation-layer-popper'
import SidepopperBackArrow from '../src/setting/components/sidepopper-back-arrow'
import { type JimuMapView, MapViewManager } from 'jimu-arcgis'

window.locale = 'en'
const render = widgetRender(true, mockTheme as any)

beforeAll(() => {
  const dss = {
    id: 'dataSource_1',
    type: 'ELEVATION_LAYER',
    layer: {
      id: 'dataSource_1',
      title: 'Test',
      getLayerDefinition: jest.fn().mockReturnValue({
        geometryType: 'esriGeometryLine'
      }),
      type: 'elevation'
    }
  }
  const mockFnGetDataSource = jest.fn().mockImplementation(() => {
    return dss
  })
  DataSourceManager.getInstance().getDataSource = mockFnGetDataSource

  const mockMv: JimuMapView = {
    id: 'map1-ds1',
    mapWidgetId: 'widget_1',
    isActive: true,
    dataSourceId: 'ds1',
    status: JimuMapViewStatus.Loaded,
    view: {
      type: '3d'
    },
    jimuMapViewGroups: {
      widget_1: {
        jimuMapViews: {
          map1: {
            dataSourceId: 'ds1'
          }
        }
      }
    },
    destroy: jest.fn()
  } as any
  MapViewManager.getInstance().setJimuMapView(mockMv)
})

jest.mock('esri/intl', () => { return {} }, { virtual: true })
initGlobal()

const mockElevationLayersSettingConfig = {
  addedElevationLayers: [{
    id: '85734379482195741732252283682',
    useDataSource: null,
    label: 'option1',
    elevationLayerUrl: '',
    style: {
      lineType: 'solid-line',
      lineColor: '#b54900',
      lineThickness: 2
    },
    displayStatistics: false,
    selectedStatistics: []
  }
  ],
  elevationUnit: '',
  groundLayerId: '85734379482195741732252283682',
  linearUnit: '',
  showVolumetricObjLineInGraph: true,
  volumetricObjSettingsOptions: {
    displayStatistics: true,
    id: ''
  }
}

const elevationLayerSettingsProps = {
  widgetId: 'widget_2',
  availableStats: [],
  theme: mockTheme,
  intl: createIntl({ locale: 'en' }),
  isRTL: false,
  config: mockElevationLayersSettingConfig,
  currentDs: 'ds1',
  mapWidgetId: 'widget_1',
  onElevationLayersSettingsUpdated: jest.fn()
}

describe('Validate the elevation layer settings', function () {
  it('By default there should be at least one elevation layer in the config', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayersSettings as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='elevationLayersSettings' {...elevationLayerSettingsProps} />)
    expect((ref.current as any).state.addedElevationLayers).toHaveLength(1)
  })

  it('Should not display the delete button on elevation layer other than the reference layer in the list', async function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayersSettings as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='elevationLayersSettings' {...elevationLayerSettingsProps} />)
    const item = {
      label: 'option1',
      id: '85123434379482195741732252283682',
      elevationLayerUrl: ''
    }
    await waitFor(() => {
      (ref.current as any).createElevationLayerItem(item, 0)
    }, { timeout: 100 })
    expect(getByTestId('groundLayerInfoIcon')).toBeInTheDocument()
  })

  it('Should display "reference layer" text for the ground layer in the list', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayersSettings as any, { theme: mockTheme, ref } as any)
    const { getByTitle } = render(<WidgetSettings widgetId='elevationLayersSettings' {...elevationLayerSettingsProps} />)
    expect(getByTitle((ref.current as any).nls('groundLayer'))).toBeInTheDocument()
  })

  it('Should remove the elevation layer which is deleted from the list', async function () {
    const e = { stopPropagation: jest.fn() }
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayersSettings as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='elevationLayersSettings' {...elevationLayerSettingsProps} />)
    const prevLength = (ref.current as any).state.addedElevationLayers.length
    await waitFor(() => {
      (ref.current as any).onDeleteLayer(e, 'https://tiles.arcgis.com', 0)
    }, { timeout: 100 })
    expect((ref.current as any).state.addedElevationLayers.length).toEqual(prevLength - 1)
  })

  it('Should display the elevation layer as a reference in the list after setting the reference layer', async function () {
    const customConfig = {
      addedElevationLayers: [{
        id: '85734379482195741732252283682',
        useDataSource: null,
        label: 'option1',
        elevationLayerUrl: '',
        style: {
          lineType: 'solid-line',
          lineColor: '#b54900',
          lineThickness: 2
        },
        displayStatistics: false,
        selectedStatistics: []
      },
      {
        id: '61634379482195741732252289877',
        useDataSource: null,
        label: 'option2',
        elevationLayerUrl: '',
        style: {
          lineType: 'solid-line',
          lineColor: '#fcfc03',
          lineThickness: 2
        },
        displayStatistics: false,
        selectedStatistics: []
      }
      ],
      elevationUnit: '',
      groundLayerId: '61634379482195741732252289877',
      linearUnit: '',
      showVolumetricObjLineInGraph: false,
      volumetricObjSettingsOptions: {
        displayStatistics: true,
        id: ''
      }
    }
    const customElevationLayerSettingsProps = {
      ...{elevationLayerSettingsProps},
      config: customConfig,
      onElevationLayersSettingsUpdated: jest.fn()
    }
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayersSettings as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='elevationLayersSettings' config={customConfig} {...customElevationLayerSettingsProps} />)
    const evt = { target: { value: '61634379482195741732252289877' } }
    await waitFor(() => {
      (ref.current as any).onGroundLayerChange(evt)
    }, { timeout: 100 })
    expect((ref.current as any).props.config.groundLayerId).toEqual(evt.target.value)
  })

  it('The next elevation layer added should be assigned with random colors', async function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayersSettings as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='elevationLayersSettings' {...elevationLayerSettingsProps} />)
    await waitFor(() => {
      (ref.current as any).onNewLayerButtonClick()
    }, { timeout: 100 })
    const defaultElevationColor = (ref.current as any).props.config.addedElevationLayers[0].style.lineColor
    expect((ref.current as any).state.addedElevationLayers[1].style.lineColor).not.toEqual(defaultElevationColor)
  })

  it('Should display the volumetric object option only in case of webscene', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayersSettings as any, { theme: mockTheme, ref } as any)
    const { getByText } = render(<WidgetSettings widgetId='elevationLayersSettings' {...elevationLayerSettingsProps} />)
    expect(getByText((ref.current as any).nls('volumetricObjectsLabel'))).toBeInTheDocument()
  })

  it('By default volumetric object option should be checked', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayersSettings as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='elevationLayersSettings' {...elevationLayerSettingsProps} />)
    expect((getByTestId('volumetricObject') as any).checked).toEqual(true)
  })

  const style = {
    lineType: 'solid-line',
    lineColor: '#b54900',
    lineThickness: 2
  }

  const elevationLayersInfo = [{
    id: '65027677800814351732268552413',
    useDataSource: { dataSourceId: 'dataSource_4', mainDataSourceId: 'dataSource_4' },
    label: 'test1',
    elevationLayerUrl: 'https://tiles.arcgis.com/tiles/6j1KwZfY2fZrfNMR/arcgis/rest/services/DTM_2010_5m_WEL/ImageServer',
    style: style,
    displayStatistics: false,
    selectedStatistics: []
  }]

  const volumetricObjOptions = {
    id: '',
    style: style,
    volumetricObjLabel: '',
    displayStatistics: false,
    selectedStatistics: []
  }

  const elevationLayerPopperProps = {
    intl: createIntl({ locale: 'es' }),
    theme: mockTheme,
    widgetId: 'widget_2',
    layerIndex: 1,
    editCurrentLayer: '',
    isNewLayerAdded: true,
    elevationLayersList: elevationLayersInfo,
    availableStats: [],
    isVolumetricObjSettings: true,
    volumetricObjOptionsConfig: volumetricObjOptions,
    onLayersUpdate: jest.fn(),
    onVolumetricSettingsUpdated: jest.fn(),
    disableOkButton: jest.fn()
  }

  it('The default reference elevation layer color should be same as previous (1.15) ground color', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayerPopper as any, { theme: mockTheme, ref } as any)
    render(<WidgetSettings widgetId='elevationLayerPopper' {...elevationLayerPopperProps} />)
    const defaultElevationColor = (ref.current as any).props.elevationLayersList[0].style.lineColor
    expect((ref.current as any).state.style.lineColor).toEqual(defaultElevationColor)
  })

  it('When elevation layer is selected, should display elevation layers title in the label textinupt', async function () {
    const useDataSources = [{ dataSourceId: 'dataSource_4', mainDataSourceId: 'dataSource_4' }]
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayerPopper as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='elevationLayerPopper' {...elevationLayerPopperProps} />)
    await waitFor(() => {
      (ref.current as any).onElevationLayerSelect(useDataSources)
      expect(getByTestId('layerLabel').title).toEqual('Test')
    }, { timeout: 100 })
  })

  it('By default Show profile statistics option should be disabled', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(ElevationLayerPopper as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='elevationLayerPopper' {...elevationLayerPopperProps} />)
    expect((getByTestId('profileStatsSwitch') as any).checked).toEqual(false)
  })

  const sidePopperBackArrowConfig = {
    intl: createIntl({ locale: 'en' }),
    title: 'OK',
    showCloseIcon: true,
    hideBackArrow: false,
    theme: mockTheme,
    showOkButton: true,
    disableOkButton: true,
    onBack: jest.fn(),
    onOkButtonClicked: jest.fn()
  }

  it('Should disable the elevation layer settings OK button if no elevation layer is selected', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SidepopperBackArrow as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='sidepopperBackArrow' {...sidePopperBackArrowConfig} />)
    expect((getByTestId('commonModalOk') as any).disabled).toEqual(true)
  })

  it('Should disable the elevation layer settings OK button if label is not set for elevation layer', function () {
    const ref: { current: HTMLElement } = { current: null }
    const WidgetSettings = wrapWidget(SidepopperBackArrow as any, { theme: mockTheme, ref } as any)
    const { getByTestId } = render(<WidgetSettings widgetId='sidepopperBackArrow' {...sidePopperBackArrowConfig} />)
    expect((getByTestId('commonModalOk') as any).disabled).toEqual(true)
  })
})
