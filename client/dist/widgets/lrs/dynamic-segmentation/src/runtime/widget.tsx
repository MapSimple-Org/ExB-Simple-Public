/** @jsx jsx */
import { React, jsx, type AllWidgetProps, DataSourceManager, type DataSource, type IMState, getAppStore, WidgetState, type ImmutableArray, Immutable, type ImmutableObject } from 'jimu-core'
import type { RouteInfoFromDataAction, IMConfig, SettingsPerView } from '../config'
import defaultMessages from './translations/default'
import { defaultMessages as jimuUIDefaultMessages, Paper, WidgetPlaceholder } from 'jimu-ui'
import iconSBR from './../../icon.svg'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import { checkConflictPrevention, findFirstArcgisMapWidgetId, getConfigValue, getModeType, isDefined, isInWidgetController, LrsLayerType, MapViewLoader, ModeType, type LrsLayer } from 'widgets/shared-code/lrs'
import { DynSegRuntimeStateProvider } from './state'
import { DynamicSegmentation } from './components/dynamic-segmentation'
import { getStyle } from './lib/style'
import { constructSettingsPerView, setValuesForView } from '../common/utils'
import { getAppConfigAction } from 'jimu-for-builder'

interface ExtraProps {
  routeLocationParams: RouteInfoFromDataAction
  selectedNetworkDataSource: DataSource
}

export interface State {
  hideTitle: boolean
  jimuMapView: JimuMapView
  highlightGraphicLayer: GraphicsLayer
  locationInfoFromDataAction: RouteInfoFromDataAction
  networkDataSourceFromDataAction: DataSource
  activeMapViewId: string
  activeLrsLayers: ImmutableArray<LrsLayer>
  settingPerView?: ImmutableObject<SettingsPerView>
  isConflictPreventionEnabled: boolean
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig> & ExtraProps, State> {
  static mapExtraStateProps = (state: IMState, props: AllWidgetProps<IMConfig>): ExtraProps => {
    return {
      routeLocationParams: props?.mutableStateProps?.routeLocationParams,
      selectedNetworkDataSource: props?.mutableStateProps?.selectedNetworkDataSource
    }
  }

  // Todo: add intersections, centerlines, un, and addressing when supported
  supportedLrsLayerTypes: ImmutableArray<LrsLayerType> = Immutable([
    LrsLayerType.Network,
    LrsLayerType.Event,
    LrsLayerType.LineEvent,
    LrsLayerType.PointEvent
  ])

  widgetOuterDivId: string

  constructor(props) {
    super(props)

    this.state = {
      hideTitle: false,
      jimuMapView: undefined,
      highlightGraphicLayer: null,
      locationInfoFromDataAction: null,
      networkDataSourceFromDataAction: null,
      activeMapViewId: '',
      activeLrsLayers: props?.config.lrsLayers,
      settingPerView: constructSettingsPerView(),
      isConflictPreventionEnabled: false
    }
    this.widgetOuterDivId = 'widget-outer-div-' + this.props.id
  }

  //#region Lifecycle
  componentDidMount (): void {
    if (this.props.mutableStatePropsVersion?.selectedDataSource) {
      this.setState({
        networkDataSourceFromDataAction: this.props.selectedNetworkDataSource
      })
    } else if (this.props.mutableStatePropsVersion?.routeLocationParams) {
      this.setState({
        locationInfoFromDataAction: this.props.routeLocationParams
      })
    }

    const inWidgetController = isInWidgetController(this.widgetOuterDivId)
    this.setState({ hideTitle: inWidgetController })
    this.setSettingsPerView()
    this.setZIndex("21")
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State) {
    if (prevState.jimuMapView !== this.state.jimuMapView && this.state.jimuMapView) {
      this.removeGraphicLayer()
      this.createGraphicLayer()
    }

    const currentWidgetState = getAppStore()?.getState()?.widgetsRuntimeInfo[this.props.id]?.state
    if (currentWidgetState === WidgetState.Opened || !currentWidgetState) {
      if (this.props?.selectedNetworkDataSource) {
        if (!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedNetworkDataSource ||
          prevProps?.mutableStatePropsVersion?.selectedNetworkDataSource !== this.props.mutableStatePropsVersion?.selectedNetworkDataSource) {
          this.setState({
            networkDataSourceFromDataAction: this.props.selectedNetworkDataSource
          })
        }
      }
      if (this.props?.routeLocationParams) {
        const rteInfo: any = this.props?.routeLocationParams
        if (rteInfo && (!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.routeLocationParams ||
          prevProps?.mutableStatePropsVersion?.routeLocationParams !== this.props.mutableStatePropsVersion?.routeLocationParams)) {
          this.setState({
            locationInfoFromDataAction: this.props.routeLocationParams
          })
        }
      }
    }

    if (this.state.activeLrsLayers !== prevState.activeLrsLayers) {
      this.setSettingsPerView()
    }

    const { config } = this.props
    const lrsLayers = !config.mode || config.mode === ModeType.Map ? this.state.activeLrsLayers : config.lrsLayers
    if (lrsLayers.length > 0) {
      checkConflictPrevention(lrsLayers[0].lrsUrl).then((isEnabled) => {
        const newValue = isEnabled === null ? false : isEnabled
        if (this.state.isConflictPreventionEnabled !== newValue) {
          this.setState({ isConflictPreventionEnabled: newValue })
        }
      })
    }
  }

  setSettingsPerView = async () => {
    // Get lrs layers and settings for current map view.
    const { config } = this.props
    const isRuntime = !isDefined(config.settingsPerView?.[this.state.activeMapViewId])
    let settingPerView = config.settingsPerView?.[this.state.activeMapViewId] || constructSettingsPerView()
    if (this.state.activeLrsLayers && this.state.activeLrsLayers.length > 0) {
      settingPerView = await setValuesForView(settingPerView, this.state.activeLrsLayers, isRuntime)
      this.setState({ settingPerView })
      const newConfig = config.setIn(['settingsPerView', this.state.activeMapViewId], settingPerView)
      getAppConfigAction().editWidgetConfig(this.props.id, newConfig).exec()
    }
  }

  resetDataAction (): void {
    this.setState({ networkDataSourceFromDataAction: null })
    this.setState({ locationInfoFromDataAction: null })
  }

  componentWillUnmount (): void {
    this.removeGraphicLayer()
    this.setZIndex()
  }

  setZIndex (value: string = ''): void {
    // Set z-index on parent .widget-renderer. Ensures popups appear
    // above layout widgets such as grid.
    const widgetDiv = document.getElementById(this.widgetOuterDivId)
    if (widgetDiv) {
      const parent = widgetDiv.closest('.widget-renderer')
      if (parent) {
        (parent as HTMLElement).style.zIndex = value
      }
    }
  }

  removeGraphicLayer (): void {
    if (isDefined(this.state.highlightGraphicLayer)) {
      this.state.highlightGraphicLayer.removeAll()
      this.state.highlightGraphicLayer.destroy()
      this.setState({ highlightGraphicLayer: null })
    }
  }

  createGraphicLayer (): void {
    if (isDefined(this.state.jimuMapView)) {
      this.removeGraphicLayer()
      const newGraphicLayer = new GraphicsLayer({ listMode: 'hide' })
      this.state.jimuMapView.view?.map.add(newGraphicLayer)
      this.setState({ highlightGraphicLayer: newGraphicLayer })
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
      return ds.childDataSourcesReady().then(() => ds).catch((err) => ds)
    }
    return Promise.resolve(ds)
  }

  getI18nMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    return this.props.intl.formatMessage(
      { id: id, defaultMessage: messages[id] }, values)
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
    defaultDisplayType: settingPerView.defaultDisplayType,
    attributeInputType: settingPerView.attributeInputType,
    defaultPointAttributeSet: settingPerView.defaultPointAttributeSet,
    defaultLineAttributeSet: settingPerView.defaultLineAttributeSet,
    attributeSets: settingPerView.attributeSets,
    mapHighlightColor: settingPerView.mapHighlightColor,
    tableHighlightColor: settingPerView.tableHighlightColor,
    defaultDiagramScale: settingPerView.defaultDiagramScale,
    showEventStatistics: settingPerView.showEventStatistics,
    allowEditing: settingPerView.allowEditing,
    allowMerge: settingPerView.allowMerge,
    defaultNetwork: settingPerView.defaultNetwork
    }

    return Object.entries(configKeys).reduce<{ [key: string]: any }>((acc, [key, defaultValue]) => {
      acc[key] = getConfigValue(config, key, activeMapViewId, defaultValue)
      return acc
    }, {})
  }

  render() {

    const { config, id, routeLocationParams, selectedNetworkDataSource, outputDataSources } = this.props
    let useMapWidgetIds = this.props.useMapWidgetIds
    const { mapViewsConfig } = config

    // Get lrs layers and settings for current map view.
    const lrsLayers = !config.mode || config.mode === ModeType.Map ? this.state.activeLrsLayers : config.lrsLayers
    const configValues = this.getConfigValues(config, this.state.settingPerView, this.state.activeMapViewId)
    const { defaultDisplayType, allowEditing, attributeInputType, defaultPointAttributeSet, defaultLineAttributeSet, attributeSets, mapHighlightColor, defaultDiagramScale, showEventStatistics, allowMerge, defaultNetwork } = configValues
    const { highlightGraphicLayer, jimuMapView } = this.state
    const theme = this.props.theme

    const isMapMode = getModeType(config.mode, lrsLayers)
    const networkCount = lrsLayers?.filter(l => l.layerType === LrsLayerType.Network).length
    const eventCount = lrsLayers?.filter(l => l.layerType === LrsLayerType.Event).length
    const hasConfig = lrsLayers?.length > 0 && networkCount > 0 && eventCount > 0

    if (!useMapWidgetIds) {
      const appConfig = getAppStore()?.getState()?.appConfig
      useMapWidgetIds = findFirstArcgisMapWidgetId(appConfig)
    }

    return (

      <DynSegRuntimeStateProvider>
        <Paper variant='flat' shape="none" className='jimu-widget runtime-dynamic-segmentation surface-1 border-0 d-flex' css={getStyle(theme, config.tableHighlightColor)}>
          <div id={this.widgetOuterDivId} className='table-indent'>
            <JimuMapViewComponent useMapWidgetId={useMapWidgetIds?.[0]} onActiveViewChange={this.onActiveViewChange} />
            {isMapMode && (
              <MapViewLoader
                config={config}
                widgetId={id}
                supportedLrsLayerTypes={this.supportedLrsLayerTypes}
                useMapWidgetIds={useMapWidgetIds}
                mapViewsConfig={mapViewsConfig}
                jimuMapView={jimuMapView}
                outputDataSourceType='sld'
                onLrsLayersChanged={this.handleLrsLayersChanged}
                onViewChange={this.handleViewChange}
              />
            )}
            {hasConfig && (
              <DynamicSegmentation
                widgetId={id}
                allowMerge={allowMerge}
                allowEditing={allowEditing}
                conflictPreventionEnabled={this.state.isConflictPreventionEnabled}
                intl={this.props.intl}
                selectedNetworkDataSource={selectedNetworkDataSource}
                routeInfo={routeLocationParams}
                lrsLayers={lrsLayers}
                defaultNetwork={defaultNetwork}
                attributeSets={attributeSets}
                defaultPointAttributeSet={defaultPointAttributeSet}
                defaultLineAttributeSet={defaultLineAttributeSet}
                attributeInputType={attributeInputType}
                mapHighlightColor={mapHighlightColor}
                graphicsLayer={highlightGraphicLayer}
                defaultDisplayType={defaultDisplayType}
                defaultDiagramScale={defaultDiagramScale}
                jimuMapView={jimuMapView}
                outputDataSources={outputDataSources}
                showEventStatistics={showEventStatistics}
                useMapWidgetIds={this.props.useMapWidgetIds}
                onResetDataAction={this.resetDataAction.bind(this)}
              />
            )}
            {!hasConfig && <WidgetPlaceholder icon={iconSBR} widgetId={id} message={this.getI18nMessage('_widgetLabel')} />}
          </div>
        </Paper>
      </DynSegRuntimeStateProvider>
    )
  }
}
