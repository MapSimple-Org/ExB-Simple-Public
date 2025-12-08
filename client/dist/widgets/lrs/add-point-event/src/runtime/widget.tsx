/** @jsx jsx */
import { React, jsx, type AllWidgetProps, DataSourceManager, type DataSource, type IMState, getAppStore, WidgetState, type ImmutableArray, Immutable, type ImmutableObject } from 'jimu-core'
import { type IMConfig, OperationType, type SettingsPerView } from '../config'
import defaultMessages from './translations/default'
import { defaultMessages as jimuUIDefaultMessages, Paper, WidgetPlaceholder } from 'jimu-ui'
import iconSBR from './../../icon.svg'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import { AddSinglePointEvent } from './components/add-single-point-event'
import { AddMultiplePointEvents } from './components/add-multiple-point-events'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import { checkConflictPrevention, findFirstArcgisMapWidgetId, getConfigValue, getModeType, isDefined, isInWidgetController, type LrsLayer, LrsLayerType, MapViewLoader, ModeType, type RouteInfo } from 'widgets/shared-code/lrs'
import { constructSettingsPerView, setValuesForView } from '../common/utils'
import { getAppConfigAction } from 'jimu-for-builder'

interface ExtraProps {
  selectedRouteInfo: RouteInfo
  selectedNetworkDataSource: DataSource
}

export interface State {
  hideTitle: boolean
  jimuMapView: JimuMapView
  operationType: OperationType
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  routeInfoFromDataAction: RouteInfo
  networkDataSourceFromDataAction: DataSource
  activeMapViewId: string
  activeLrsLayers: ImmutableArray<LrsLayer>
  settingPerView?: ImmutableObject<SettingsPerView>
  isConflictPreventionEnabled: boolean
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig> & ExtraProps, State> {
  static mapExtraStateProps = (state: IMState,
    props: AllWidgetProps<IMConfig>): ExtraProps => {
    return {
      selectedRouteInfo: props?.mutableStateProps?.selectedRouteInfo,
      selectedNetworkDataSource: props?.mutableStateProps?.selectedNetworkDataSource
    }
  }

  widgetOuterDivId: string

  constructor (props) {
    super(props)

    this.state = {
      hideTitle: false,
      jimuMapView: undefined,
      operationType: OperationType.single,
      hoverGraphic: null,
      pickedGraphic: null,
      flashGraphic: null,
      routeInfoFromDataAction: null,
      networkDataSourceFromDataAction: null,
      activeMapViewId: '',
      activeLrsLayers: this.props.config.lrsLayers,
      settingPerView: constructSettingsPerView(),
      isConflictPreventionEnabled: false
    }
    this.widgetOuterDivId = 'widget-outer-div-' + this.props.id
  }

  supportedLrsLayerTypes: ImmutableArray<LrsLayerType> = Immutable([
    LrsLayerType.Network,
    LrsLayerType.Event,
    LrsLayerType.PointEvent,
    LrsLayerType.Intersection
  ])

  componentDidMount (): void {
    if (this.props.mutableStatePropsVersion?.selectedDataSource) {
      this.setState({
        networkDataSourceFromDataAction: this.props.selectedNetworkDataSource
      })
    } else if (this.props.mutableStatePropsVersion?.selectedRouteInfo) {
      this.setState({
        routeInfoFromDataAction: this.props.selectedRouteInfo
      })
    }

    const isInWdigetController = isInWidgetController(this.widgetOuterDivId)
    this.setState({ hideTitle: isInWdigetController })
    this.setState({ operationType: this.props.config.defaultType || OperationType.single })
    this.setSettingsPerView()
  }

  componentWillUnmount (): void {
    this.removeGraphicLayers()
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State): void {
    if (prevState.jimuMapView !== this.state.jimuMapView && isDefined(this.state.jimuMapView)) {
      // Remove any exisiting graphic layers.
      this.removeGraphicLayers()

      // Add new graphic layers.
      this.createGraphicLayers()
    }
    const currentWidgetState = getAppStore()?.getState()?.widgetsRuntimeInfo[this.props.id]?.state
    if (currentWidgetState === WidgetState.Opened || !currentWidgetState) {
      if (this.props?.selectedNetworkDataSource) {
        if ((!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedNetworkDataSource ||
          prevProps?.mutableStatePropsVersion?.selectedNetworkDataSource !== this.props.mutableStatePropsVersion?.selectedNetworkDataSource)) {
          this.setState({
            networkDataSourceFromDataAction: this.props.selectedNetworkDataSource
          })
        }
      }
      // if featureRecord found and prev selected record is not matching with the current then only load the RouteInfo for selected feature
      if (this.props?.selectedRouteInfo) {
        const rteInfo: any = this.props?.selectedRouteInfo
        if (rteInfo && (!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedRouteInfo ||
          prevProps?.mutableStatePropsVersion?.selectedRouteInfo !== this.props.mutableStatePropsVersion?.selectedRouteInfo)) {
          this.setState({
            routeInfoFromDataAction: this.props.selectedRouteInfo
          })
        }
      }
    }

    if (this.state.activeLrsLayers !== prevState.activeLrsLayers) {
      // If the active LRS layers have changed, we need to update the graphic layers.
      const operationType = getConfigValue(this.props.config, 'defaultType', this.state.activeMapViewId, OperationType.single)
      this.setState({ operationType: operationType })
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
    const lrsLayers = !config.mode || config.mode === ModeType.Map ? this.state.activeLrsLayers : config.lrsLayers
    const isRuntime = !isDefined(config.settingsPerView?.[this.state.activeMapViewId])
    let settingPerView = config.settingsPerView?.[this.state.activeMapViewId] || constructSettingsPerView()
    if (lrsLayers && lrsLayers.length > 0) {
      settingPerView = await setValuesForView(settingPerView, lrsLayers, true, isRuntime)
      this.setState({ settingPerView })
      const newConfig = config.setIn(['settingsPerView', this.state.activeMapViewId], settingPerView)
      getAppConfigAction().editWidgetConfig(this.props.id, newConfig).exec()
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

  resetDataAction (): void {
    this.setState({ routeInfoFromDataAction: null })
    this.setState({ networkDataSourceFromDataAction: null })
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

  handleOperationTypeChange = (value: OperationType) => {
    this.setState({ operationType: value })
    this.clearGraphics()
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
    const operationType = getConfigValue(this.props.config, 'defaultType', this.state.activeMapViewId, OperationType.single)
    this.setState({ operationType: operationType })
  }

  private getConfigValues(config: IMConfig, settingPerView: any, activeMapViewId: string): { [key: string]: any } {
    const configKeys = {
      networkLayers: settingPerView.networkLayers,
      eventLayers: settingPerView.eventLayers,
      intersectionLayers: settingPerView.intersectionLayers,
      defaultEvent: settingPerView.defaultEvent,
      defaultNetwork: settingPerView.defaultNetwork,
      defaultMethod: settingPerView.defaultMethod,
      defaultAttributeSet: settingPerView.defaultAttributeSet,
      attributeSets: settingPerView.attributeSets,
      hideEvent: settingPerView.hideEvent,
      hideNetwork: settingPerView.hideNetwork,
      hideType: settingPerView.hideType,
      hideMethod: settingPerView.hideMethod,
      hideAttributeSet: settingPerView.hideAttributeSet,
      hideMeasures: settingPerView.hideMeasures,
      hideDates: settingPerView.hideDates,
      useRouteStartEndDate: settingPerView.useRouteStartEndDate,
      hideAddToDominantRouteOption: settingPerView.hideAddToDominantRouteOption,
      enableAddToDominantRouteOption: settingPerView.enableAddToDominantRouteOption,
      notAllowOverrideEventReplacement: settingPerView.notAllowOverrideEventReplacement
    }

    return Object.entries(configKeys).reduce<{ [key: string]: any }>((acc, [key, defaultValue]) => {
      acc[key] = getConfigValue(config, key, activeMapViewId, defaultValue)
      return acc
    }, {})
  }

  render() {
    const { config, id, intl } = this.props
    let { useMapWidgetIds } = this.props
    const { mapViewsConfig } = config

    const lrsLayers = !config.mode || config.mode === ModeType.Map ? this.state.activeLrsLayers : config.lrsLayers
    const configValues = this.getConfigValues(config, this.state.settingPerView, this.state.activeMapViewId)

    // destructure config values.
    const {
      networkLayers,
      eventLayers,
      intersectionLayers,
      defaultEvent,
      defaultNetwork,
      defaultMethod,
      defaultAttributeSet,
      attributeSets,
      hideEvent,
      hideNetwork,
      hideType,
      hideMethod,
      hideAttributeSet,
      hideDates,
      useRouteStartEndDate,
      hideAddToDominantRouteOption,
      enableAddToDominantRouteOption,
      notAllowOverrideEventReplacement
    } = configValues


    const isMapMode = getModeType(config.mode, lrsLayers)
    const { jimuMapView, operationType } = this.state
    const hasConfig = networkLayers && networkLayers.length > 0 && eventLayers && eventLayers.length > 0

    if (!useMapWidgetIds) {
      const appConfig = getAppStore()?.getState()?.appConfig
      useMapWidgetIds = findFirstArcgisMapWidgetId(appConfig)
    }

    return (
      <Paper variant='flat' shape="none" className="jimu-widget runtime-add-point-event surface-1 border-0">
        <div id={this.widgetOuterDivId} className="widget-outer-div h-100 w-100 d-flex">
          <JimuMapViewComponent useMapWidgetId={useMapWidgetIds?.[0]} onActiveViewChange={this.onActiveViewChange} />
          {isMapMode && (
            <MapViewLoader
              config={config}
              widgetId={id}
              supportedLrsLayerTypes={this.supportedLrsLayerTypes}
              useMapWidgetIds={useMapWidgetIds}
              mapViewsConfig={mapViewsConfig}
              jimuMapView={jimuMapView}
              outputDataSourceType='none'
              onLrsLayersChanged={this.handleLrsLayersChanged}
              onViewChange={this.handleViewChange}
            />
          )}
          {operationType === OperationType.single && hasConfig && (
            <AddSinglePointEvent
              intl={intl}
              widgetId={id}
              lrsLayers={lrsLayers}
              JimuMapView={jimuMapView}
              operationType={operationType}
              onOperationTypeChanged={this.handleOperationTypeChange}
              eventLayers={eventLayers}
              networkLayers={networkLayers}
              instersectionLayers={intersectionLayers}
              defaultEvent={defaultEvent}
              defaultMethod={defaultMethod}
              hoverGraphic={this.state.hoverGraphic}
              pickedGraphic={this.state.pickedGraphic}
              flashGraphic={this.state.flashGraphic}
              conflictPreventionEnabled={this.state.isConflictPreventionEnabled}
              hideEvent={hideEvent}
              hideNetwork={hideNetwork}
              hideType={hideType}
              hideMethod={hideMethod}
              hideDates={hideDates}
              hideTitle={this.state.hideTitle}
              useRouteStartEndDate={useRouteStartEndDate}
              networkDataSourceFromDataAction={this.state.networkDataSourceFromDataAction}
              routeInfoFromDataAction={this.state.routeInfoFromDataAction}
              onResetDataAction={this.resetDataAction.bind(this)}
              onClearGraphic={this.clearGraphics.bind(this)}
              hideAddToDominantRouteOption={hideAddToDominantRouteOption}
              enableAddToDominantRouteOption={enableAddToDominantRouteOption}
              notAllowOverrideEventReplacement={notAllowOverrideEventReplacement}
            />
          )}
          {operationType === OperationType.multiple && hasConfig && (
            <AddMultiplePointEvents
              intl={intl}
              widgetId={id}
              lrsLayers={lrsLayers}
              jimuMapView={this.state.jimuMapView}
              operationType={operationType}
              onOperationTypeChanged={this.handleOperationTypeChange}
              networkLayers={networkLayers}
              defaultNetwork={defaultNetwork}
              defaultMethod={defaultMethod}
              defaultAttributeSet={defaultAttributeSet}
              attributeSets={attributeSets}
              hoverGraphic={this.state.hoverGraphic}
              pickedGraphic={this.state.pickedGraphic}
              flashGraphic={this.state.flashGraphic}
              conflictPreventionEnabled={this.state.isConflictPreventionEnabled}
              hideNetwork={hideNetwork}
              hideMethod={hideMethod}
              hideType={hideType}
              hideAttributeSet={hideAttributeSet}
              hideDates={hideDates}
              hideTitle={this.state.hideTitle}
              useRouteStartEndDate={useRouteStartEndDate}
              networkDataSourceFromDataAction={this.state.networkDataSourceFromDataAction}
              routeInfoFromDataAction={this.state.routeInfoFromDataAction}
              onResetDataAction={this.resetDataAction.bind(this)}
              onClearGraphic={this.clearGraphics.bind(this)}
              hideAddToDominantRouteOption={hideAddToDominantRouteOption}
              enableAddToDominantRouteOption={enableAddToDominantRouteOption}
              notAllowOverrideEventReplacement={notAllowOverrideEventReplacement}
            />
          )}
          {!hasConfig && <WidgetPlaceholder icon={iconSBR} widgetId={id} message={this.getI18nMessage('_widgetLabel')} />}
        </div>
      </Paper>
    )
  }
}
