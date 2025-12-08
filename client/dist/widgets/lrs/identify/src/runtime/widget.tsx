/** @jsx jsx */
import { React, jsx, type AllWidgetProps, DataSourceManager, type DataSource, css, type ImmutableArray, Immutable, getAppStore } from 'jimu-core'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import { defaultMessages as jimuUIDefaultMessages, Paper, WidgetPlaceholder } from 'jimu-ui'
import iconSBR from './../../icon.svg'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import { IdentifyRoute } from './components/identify-route'
import { isDefined, type RouteInfo, getGeometryGraphic, getSimpleLineGraphic, getSimplePointGraphic, LrsLayerType, type LrsLayer, MapViewLoader, findFirstArcgisMapWidgetId, getModeType, getConfigValue, ModeType } from 'widgets/shared-code/lrs'
import { colorCyan, colorGreen } from './constants'
import { constructSettingsPerView, setValuesForView } from '../common/utils'

export interface State {
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  activeMapViewId: string
  activeLrsLayers: ImmutableArray<LrsLayer>
}

const getFormStyle = () => {
  return css`
    min-width: 32px;
    min-height: 32px;
  `
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, State> {
  constructor (props) {
    super(props)

    this.state = {
      jimuMapView: undefined,
      hoverGraphic: null,
      pickedGraphic: null,
      flashGraphic: null,
      activeMapViewId: '',
      activeLrsLayers: this.props.config.lrsLayers
    }
  }

  supportedLrsLayerTypes: ImmutableArray<LrsLayerType> = Immutable([
    LrsLayerType.Network,
    LrsLayerType.Event,
    LrsLayerType.LineEvent,
    LrsLayerType.PointEvent,
    LrsLayerType.Intersection,
  ])

  componentWillUnmount (): void {
    this.removeGraphicLayers()
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State): void {
    if (prevState.jimuMapView !== this.state.jimuMapView && isDefined(this.state.jimuMapView)) {
      // Remove any existing graphic layers.
      this.removeGraphicLayers()

      // Add new graphic layers.
      this.createGraphicLayers()
    }
  }

  removeGraphicLayers (): void {
    if (isDefined(this.state.hoverGraphic)) {
      this.state.hoverGraphic.removeAll()
      this.state.hoverGraphic.destroy()
      this.setState({ hoverGraphic: null })
    }
    if (isDefined(this.state.pickedGraphic)) {
      this.state.pickedGraphic.removeAll()
      this.state.pickedGraphic.destroy()
      this.setState({ pickedGraphic: null })
    }
    if (isDefined(this.state.flashGraphic)) {
      this.state.flashGraphic.removeAll()
      this.state.flashGraphic.destroy()
      this.setState({ flashGraphic: null })
    }
  }

  createGraphicLayers (): void {
    if (isDefined(this.state.jimuMapView)) {
      this.removeGraphicLayers()
      const newHoverGraphicLayer = new GraphicsLayer({ listMode: 'hide' })
      const newPickedGraphicLayer = new GraphicsLayer({ listMode: 'hide' })
      const newFlashGraphicLayer = new GraphicsLayer({ listMode: 'hide' })
      this.state.jimuMapView?.view?.map.addMany([newPickedGraphicLayer, newFlashGraphicLayer, newHoverGraphicLayer])
      this.setState({ hoverGraphic: newHoverGraphicLayer })
      this.setState({ pickedGraphic: newPickedGraphicLayer })
      this.setState({ flashGraphic: newFlashGraphicLayer })
    }
  }

  clearGraphics (): void {
    if (isDefined(this.state.hoverGraphic)) {
      this.state.hoverGraphic.removeAll()
    }
    if (isDefined(this.state.pickedGraphic)) {
      this.state.pickedGraphic.removeAll()
    }
    if (isDefined(this.state.flashGraphic)) {
      this.state.flashGraphic.removeAll()
    }
  }

  clearPickedGraphics = (): void => {
    if (isDefined(this.state.pickedGraphic)) {
      this.state.pickedGraphic.removeAll()
    }
  }

  clearFlashGraphic = (): void => {
    if (isDefined(this.state.flashGraphic)) {
      this.state.flashGraphic.removeAll()
    }
  }

  updatePickedGraphic = (graphic: __esri.Graphic) => {
    if (!isDefined(graphic)) {
      this.clearPickedGraphics()
    } else {
      this.state.pickedGraphic.removeAll()
      this.state.pickedGraphic.add(graphic)
    }
  }

  flashSelectedGeometry = (graphic: __esri.Graphic) => {
    // Flash 3x
    if (isDefined(graphic)) {
      this.state.flashGraphic.add(graphic)
      setTimeout(() => {
        this.state.flashGraphic.removeAll()
        setTimeout(() => {
          this.state.flashGraphic.add(graphic)
          setTimeout(() => {
            this.state.flashGraphic.removeAll()
            setTimeout(() => {
              this.state.flashGraphic.add(graphic)
              setTimeout(() => {
                this.state.flashGraphic.removeAll()
              }, 800)
            }, 800)
          }, 800)
        }, 800)
      }, 800)
    }
  }

  updateGraphics = async (routeInfo: RouteInfo, flash: boolean) => {
    if (isDefined(routeInfo.selectedPolyline) && flash) {
      this.flashSelectedGeometry(await getGeometryGraphic(await getSimpleLineGraphic(routeInfo.selectedPolyline), colorCyan))
    }
    if (isDefined(routeInfo.selectedPoint)) {
      this.updatePickedGraphic(await getGeometryGraphic(await getSimplePointGraphic(routeInfo.selectedPoint), colorGreen))
    } else {
      this.clearPickedGraphics()
    }
  }

  onActiveViewChange = (activeJimuMapView: JimuMapView) => {
    if (!(activeJimuMapView && activeJimuMapView.view)) {
      return
    }
    this.waitForChildDataSourcesReady(activeJimuMapView).finally(() => {
      this.setState({ jimuMapView: activeJimuMapView })
    })
  }

  waitForChildDataSourcesReady = async (jmv: JimuMapView): Promise<DataSource> => {
    await jmv?.whenAllJimuLayerViewLoaded()
    const ds = DataSourceManager.getInstance().getDataSource(jmv?.dataSourceId)
    if (ds?.isDataSourceSet() && !ds.areChildDataSourcesCreated()) {
      return ds.childDataSourcesReady().then(() => ds).catch(err => ds)
    }
    return Promise.resolve(ds)
  }

  getI18nMessage = (id: string, values?: { [key: string]: any }) => {
    // Function for handling I18n
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    return this.props.intl.formatMessage(
      { id: id, defaultMessage: messages[id] }, values
    )
  }

  handleLrsLayersChanged = (lrsLayers: ImmutableArray<LrsLayer>) => {
    this.setState({ activeLrsLayers: lrsLayers })
  }

  handleViewChange = (view: JimuMapView) => {
    if (view) {
      this.setState({ activeMapViewId: view.id })
    }
  }

  private getConfigValues(config: IMConfig, settingPerView: any, activeMapViewId: string): { [key: string]: any } {
    const configKeys = {
      networkLayers: settingPerView.networkLayers,
      eventLayers: settingPerView.eventLayers,
      intersectionLayers: settingPerView.intersectionLayers,
      defaultEvent: settingPerView.defaultEvent,
      highlightStyle: settingPerView.highlightStyle,
      defaultPointAttributeSet: settingPerView.defaultPointAttributeSet,
      defaultLineAttributeSet: settingPerView.defaultLineAttributeSet,
      attributeSets: settingPerView.attributeSets,
      lineEventToggle: settingPerView.lineEventToggle,
      pointEventToggle: settingPerView.pointEventToggle,
      defaultNetwork: settingPerView.defaultNetwork,
    }

    return Object.entries(configKeys).reduce<{ [key: string]: any }>((acc, [key, defaultValue]) => {
      acc[key] = getConfigValue(config, key, activeMapViewId, defaultValue)
      return acc
    }, {})
  }

  getToggledFromController = (): string => {
    return this.props.mutableStateProps?.active || ''
  }

  render () {
    const { config, id } = this.props
    let { useMapWidgetIds } = this.props
    const { mapViewsConfig } = config

    // Get lrs layers and settings for current map view.
    const lrsLayers = !config.mode || config.mode === ModeType.Map ? this.state.activeLrsLayers : config.lrsLayers
    const hasSettingPerView = isDefined(config.settingsPerView) && isDefined(config.settingsPerView[this.state.activeMapViewId])
    let settingPerView = config.settingsPerView?.[this.state.activeMapViewId] || constructSettingsPerView()
    if (!hasSettingPerView && lrsLayers.length > 0) {
      settingPerView = setValuesForView(settingPerView, lrsLayers, true)
    }

    const configValues = this.getConfigValues(config, settingPerView, this.state.activeMapViewId)

    // destructure config values.
    const { networkLayers, defaultNetwork, highlightStyle, defaultPointAttributeSet, defaultLineAttributeSet, attributeSets, lineEventToggle, pointEventToggle } = configValues
    const isMapMode = getModeType(config.mode, lrsLayers)
    const { jimuMapView } = this.state

    const hasConfig = networkLayers && networkLayers.length > 0
    const lrsControllerToggled = this.getToggledFromController()

    if (!useMapWidgetIds) {
      const appConfig = getAppStore()?.getState()?.appConfig
      useMapWidgetIds = findFirstArcgisMapWidgetId(appConfig)
    }

    return (
      <Paper variant='flat' shape="none" css={getFormStyle()}>
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds?.[0]}
          onActiveViewChange={this.onActiveViewChange}
        />
        {isMapMode && (
          <MapViewLoader
            config={config}
            widgetId={id}
            supportedLrsLayerTypes={this.supportedLrsLayerTypes}
            useMapWidgetIds={useMapWidgetIds}
            mapViewsConfig={mapViewsConfig}
            jimuMapView={jimuMapView}
            outputDataSourceType='identify'
            onLrsLayersChanged={this.handleLrsLayersChanged}
            onViewChange={this.handleViewChange}
          />
        )}
        {hasConfig && (
          <IdentifyRoute
            intl={this.props.intl}
            widgetId={id}
            lrsLayers={lrsLayers}
            highlightStyle={highlightStyle}
            defaultPointAttributeSet={defaultPointAttributeSet}
            defaultLineAttributeSet={defaultLineAttributeSet}
            attributeSets={attributeSets}
            lineEventToggle={lineEventToggle}
            pointEventToggle={pointEventToggle}
            JimuMapView={jimuMapView}
            hoverGraphic={this.state.hoverGraphic}
            defaultNetwork={defaultNetwork}
            lrsControllerToggled={lrsControllerToggled}
            onClearPickedGraphics={this.clearPickedGraphics.bind(this)}
            onClearFlashGraphics={this.clearFlashGraphic.bind(this)}
            onUpdateGraphics={this.updatePickedGraphic.bind(this)}
            flashSelectedGeometry={this.flashSelectedGeometry.bind(this)}
            defaultShowPp={jimuMapView?.view?.popupEnabled}
          />
        )}
        {!hasConfig && <WidgetPlaceholder icon={iconSBR} widgetId={id} message={this.getI18nMessage('_widgetLabel')} />}
      </Paper>
    )
  }
}
