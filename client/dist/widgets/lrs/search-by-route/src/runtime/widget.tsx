/** @jsx jsx */
import { React, jsx, type AllWidgetProps, DataSourceManager, type DataSource, Immutable, type ImmutableArray, getAppStore } from 'jimu-core'
import {
  isInWidgetController,
  isDefined,
  LrsLayerType,
  type LrsLayer,
  MapViewLoader,
  findFirstArcgisMapWidgetId,
  getModeType,
  getConfigValue,
  ModeType
} from 'widgets/shared-code/lrs'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import { defaultMessages as jimuUIDefaultMessages, Paper, WidgetPlaceholder } from 'jimu-ui'
import iconSBR from './../../icon.svg'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import { SearchByRouteTask } from './components/search-by-route-task'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import { constructSettingsPerView, setValuesForView } from '../common/utils'

export interface State {
  coordinateGraphic: GraphicsLayer
  jimuMapView: JimuMapView
  hideTitle: boolean
  activeMapViewId: string
  activeLrsLayers: ImmutableArray<LrsLayer>
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, State> {
  widgetOuterDivId: string
  constructor (props) {
    super(props)

    this.state = {
      coordinateGraphic: null,
      jimuMapView: undefined,
      hideTitle: false,
      activeMapViewId: '',
      activeLrsLayers: this.props.config.lrsLayers || Immutable([]) as ImmutableArray<LrsLayer>
    }
    this.widgetOuterDivId = 'widget-outer-div-' + this.props.id
  }

  supportedLrsLayerTypes: ImmutableArray<LrsLayerType> = Immutable([
    LrsLayerType.Network,
    LrsLayerType.Event,
    LrsLayerType.PointEvent,
    LrsLayerType.Intersection,
    LrsLayerType.Addressing,
    LrsLayerType.CalibrationPoint,
    LrsLayerType.NonLrs,
    LrsLayerType.NonLrsPoint
  ])

  componentDidMount (): void {
    const isInWdigetController = isInWidgetController(this.widgetOuterDivId)
    this.setState({ hideTitle: isInWdigetController })
  }

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
    if (isDefined(this.state.coordinateGraphic)) {
      this.state.coordinateGraphic.removeAll()
      this.state.coordinateGraphic.destroy()
      this.setState({ coordinateGraphic: null })
    }
  }

  createGraphicLayers (): void {
    if (isDefined(this.state.jimuMapView)) {
      this.removeGraphicLayers()
      const newCoordinateGraphicLayer = new GraphicsLayer({ listMode: 'hide' })
      this.state.jimuMapView?.view?.map.addMany([newCoordinateGraphicLayer])
      this.setState({ coordinateGraphic: newCoordinateGraphicLayer })
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

  handleLrsLayersChanged = (lrsLayers: ImmutableArray<LrsLayer>) => {
    this.setState({ activeLrsLayers: lrsLayers })
  }

  handleViewChange = (view: JimuMapView) => {
    if (view) {
      this.setState({ activeMapViewId: view.id })
    }
  }

  getI18nMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    return this.props.intl.formatMessage(
      { id: id, defaultMessage: messages[id] }, values
    )
  }


  private getConfigValues(config: IMConfig, settingPerView: any, activeMapViewId: string): { [key: string]: any } {
    const configKeys = {
      highlightStyle: settingPerView.highlightStyle,
      labelStyle: settingPerView.labelStyle,
      resultConfig: settingPerView.resultConfig,
      defaultNetwork: settingPerView.defaultNetwork,
      hideMethod: settingPerView.hideMethod,
      hideNetwork: settingPerView.hideNetwork,
      hideRoute: settingPerView.hideRoute
    }

    return Object.entries(configKeys).reduce<{ [key: string]: any }>((acc, [key, defaultValue]) => {
      acc[key] = getConfigValue(config, key, activeMapViewId, defaultValue)
      return acc
    }, {})
  }

  render () {
    const { config, id, intl } = this.props
    let { useMapWidgetIds } = this.props
    const { mapViewsConfig } = config

    // Get lrs layers and settings for current map view.
    const lrsLayers = !config.mode || config.mode === ModeType.Map ? this.state.activeLrsLayers : config.lrsLayers
    let settingPerView = config.settingsPerView?.[this.state.activeMapViewId] || constructSettingsPerView()
    if (lrsLayers && lrsLayers.length > 0) {
      settingPerView = setValuesForView(settingPerView)
    }

    const configValues = this.getConfigValues(config, settingPerView, this.state.activeMapViewId)
    const { highlightStyle, labelStyle, defaultNetwork, hideMethod, hideNetwork, hideRoute } = configValues
    let { resultConfig } = configValues

    const isMapMode = getModeType(config.mode, lrsLayers)
    const networkCount = lrsLayers?.filter(l => l.layerType === LrsLayerType.Network).length
    const hasConfig = lrsLayers?.length > 0 && networkCount > 0

    if (lrsLayers && lrsLayers.length > 0 && !resultConfig?.defaultReferentLayer) {
      const referentLayer = lrsLayers.find(item => item.isReferent)
      if (referentLayer) {
        resultConfig = { ...resultConfig, defaultReferentLayer: Immutable(referentLayer) }
      }
    }
    if (!useMapWidgetIds) {
      const appConfig = getAppStore()?.getState()?.appConfig
      useMapWidgetIds = findFirstArcgisMapWidgetId(appConfig)
    }

    return (
      <Paper variant='flat' shape="none" className='jimu-widget runtime-search-by-route surface-1 border-0'>
        <div id={this.widgetOuterDivId} className="widget-outer-div h-100 w-100 d-flex">
          <JimuMapViewComponent useMapWidgetId={useMapWidgetIds?.[0]} onActiveViewChange={this.onActiveViewChange}></JimuMapViewComponent>
          {isMapMode && (
            <MapViewLoader
              config={config}
              widgetId={id}
              supportedLrsLayerTypes={this.supportedLrsLayerTypes}
              useMapWidgetIds={useMapWidgetIds}
              mapViewsConfig={mapViewsConfig}
              jimuMapView={this.state.jimuMapView}
              outputDataSourceType='searchByRoute'
              onLrsLayersChanged={this.handleLrsLayersChanged}
              onViewChange={this.handleViewChange}
            />
          )}
          {hasConfig && (
            <SearchByRouteTask
              widgetId={id}
              jimuMapView={this.state.jimuMapView}
              lrsLayers={lrsLayers}
              defaultNetwork={defaultNetwork}
              hideMethod={hideMethod}
              hideNetwork={hideNetwork}
              hideRoute={hideRoute}
              highlightStyle={highlightStyle}
              labelStyle={labelStyle}
              resultConfig={resultConfig}
              intl={intl}
              hideTitle={this.state.hideTitle}
              coordinateGraphic={this.state.coordinateGraphic}
            />
          )}
          {!hasConfig && <WidgetPlaceholder icon={iconSBR} widgetId={id} message={this.getI18nMessage('_widgetLabel')} />}
        </div>
      </Paper>
    )
  }
}
