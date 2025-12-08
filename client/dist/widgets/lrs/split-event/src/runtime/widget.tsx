/** @jsx jsx */
import {
  React,
  jsx,
  type AllWidgetProps,
  DataSourceManager,
  type DataSource,
  type IMState,
  getAppStore,
  WidgetState,
  type ImmutableObject,
  Immutable,
  type ImmutableArray
} from 'jimu-core'
import {
  isDefined,
  type LrsLayer,
  type RouteInfo,
  setRouteInfoByRouteIdOrName,
  queryRouteIdOrName,
  getInitialRouteInfoState,
  isInWidgetController,
  LrsLayerType,
  MapViewLoader,
  findFirstArcgisMapWidgetId,
  getModeType,
  getConfigValue,
  ModeType,
  checkConflictPrevention
} from 'widgets/shared-code/lrs'
import type { IMConfig, SettingsPerView } from '../config'
import defaultMessages from './translations/default'
import { defaultMessages as jimuUIDefaultMessages, Paper, WidgetPlaceholder } from 'jimu-ui'
import iconSBR from './../../icon.svg'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import { SplitEvent } from './components/split-event'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import { constructSettingsPerView, setValuesForView } from '../common/utils'
import { getAppConfigAction } from 'jimu-for-builder'

interface ExtraProps {
  selectedEventLyr: ImmutableObject<LrsLayer>
  selectedEventObjectId: number
  selectedEventRouteId: string
  selectedEventFromDate: Date
}

export interface State {
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  selectedEventLyr: ImmutableObject<LrsLayer>
  selectedEventObjectId: number
  selectedEventRouteId: string
  selectedEventFromDate: Date
  hideTitle: boolean
  routeInfoFromDataAction: RouteInfo
  networkDataSourceFromDataAction: DataSource
  activeMapViewId: string
  activeLrsLayers: ImmutableArray<LrsLayer>
  settingPerView?: ImmutableObject<SettingsPerView>
  isConflictPreventionEnabled: boolean
}

export default class Widget extends React.PureComponent<
AllWidgetProps<IMConfig> & ExtraProps, State> {
  widgetOuterDivId: string
  static mapExtraStateProps = (state: IMState,
    props: AllWidgetProps<IMConfig>): ExtraProps => {
    return {
      selectedEventLyr: props?.mutableStateProps?.selectedEventLyr,
      selectedEventObjectId: props?.mutableStateProps?.selectedEventObjectId,
      selectedEventRouteId: props?.mutableStateProps?.selectedEventRouteId,
      selectedEventFromDate: props?.mutableStateProps?.selectedEventFromDate
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      hideTitle: false,
      jimuMapView: undefined,
      hoverGraphic: null,
      pickedGraphic: null,
      flashGraphic: null,
      selectedEventLyr: null,
      selectedEventObjectId: null,
      selectedEventRouteId: null,
      selectedEventFromDate: null,
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
    LrsLayerType.LineEvent
  ])

  componentWillUnmount (): void {
    this.removeGraphicLayers()
  }

  componentDidMount = () => {
    if (this.props.mutableStatePropsVersion?.selectedEventLyr) {
      this.setState({
        selectedEventLyr: this.props.selectedEventLyr
      })
    }
    if (this.props.mutableStatePropsVersion?.selectedEventObjectId) {
      this.setState({
        selectedEventObjectId: this.props.selectedEventObjectId
      })
    }
    if (this.props.mutableStatePropsVersion?.selectedEventRouteId) {
      this.setState({
        selectedEventRouteId: this.props.selectedEventRouteId
      })
    }
    if (this.props.mutableStatePropsVersion?.selectedEventFromDate) {
      this.setState({
        selectedEventFromDate: this.props.selectedEventFromDate
      })
    }
    const isInWdigetController = isInWidgetController(this.widgetOuterDivId)
    this.setState({ hideTitle: isInWdigetController })
    this.setSettingsPerView()
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State): void {
    if (prevState.jimuMapView !== this.state.jimuMapView && isDefined(this.state.jimuMapView)) {
      // Remove any existing graphic layers.
      this.removeGraphicLayers()

      // Add new graphic layers.
      this.createGraphicLayers()
    }

    const currentWidgetState = getAppStore()?.getState()?.widgetsRuntimeInfo[this.props.id]?.state
    if (currentWidgetState === WidgetState.Opened || !currentWidgetState) {
      let hasChanged = false
      if (this.props?.selectedEventLyr) {
        if ((!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedEventLyr ||
          prevProps?.mutableStatePropsVersion?.selectedEventLyr !== this.props.mutableStatePropsVersion?.selectedEventLyr)) {
          this.setState({
            selectedEventLyr: this.props.selectedEventLyr
          })
          hasChanged = true
        }
      }
      if (this.props?.selectedEventObjectId) {
        if ((!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedEventObjectId ||
          prevProps?.mutableStatePropsVersion?.selectedEventObjectId !== this.props.mutableStatePropsVersion?.selectedEventObjectId)) {
          this.setState({
            selectedEventObjectId: this.props.selectedEventObjectId
          })
          hasChanged = true
        }
      }
      if (this.props?.selectedEventRouteId) {
        if ((!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedEventRouteId ||
          prevProps?.mutableStatePropsVersion?.selectedEventRouteId !== this.props.mutableStatePropsVersion?.selectedEventRouteId)) {
          this.setState({
            selectedEventRouteId: this.props.selectedEventRouteId
          })
          hasChanged = true
        }
      }
      if (this.props?.selectedEventFromDate) {
        if ((!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedEventFromDate ||
          prevProps?.mutableStatePropsVersion?.selectedEventRouteId !== this.props.mutableStatePropsVersion?.selectedEventRouteId)) {
          this.setState({
            selectedEventFromDate: this.props.selectedEventFromDate
          })
          hasChanged = true
        }
      }

      if (hasChanged) {
        this.setRouteInfoFromDataAction(this.props.selectedEventLyr, this.props.selectedEventRouteId, this.props.selectedEventFromDate)
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

  setSettingsPerView = () => {
      // Get lrs layers and settings for current map view.
      const { config } = this.props
      const lrsLayers = !config.mode || config.mode === ModeType.Map ? this.state.activeLrsLayers : config.lrsLayers
      let settingPerView = config.settingsPerView?.[this.state.activeMapViewId] || constructSettingsPerView()
      if (lrsLayers && lrsLayers.length > 0) {
        settingPerView = setValuesForView(settingPerView, lrsLayers, true)
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

  resetDataAction (): void {
    this.setState({
      selectedEventLyr: null,
      selectedEventObjectId: null,
      selectedEventRouteId: null,
      selectedEventFromDate: null,
      routeInfoFromDataAction: null
    })
  }

  setRouteInfoFromDataAction (selectedEventLyr, selectedEventRouteId, selectedEventFromDate): void {
    if (isDefined(selectedEventLyr) && isDefined(selectedEventRouteId) && isDefined(selectedEventFromDate)) {
      let networkLayer
      if (isDefined(this.props.config.lrsLayers) && this.props.config.lrsLayers.length > 0) {
        networkLayer = this.props.config.lrsLayers.find(item => isDefined(item.networkInfo) && item.networkInfo.lrsNetworkId === selectedEventLyr.eventInfo.parentNetworkId)
      } else if (isDefined(this.state.activeLrsLayers) && this.state.activeLrsLayers.length > 0) {
        networkLayer = this.state.activeLrsLayers.find(item => isDefined(item.networkInfo) && item.networkInfo.lrsNetworkId === selectedEventLyr.eventInfo.parentNetworkId)
      }

      if (networkLayer && networkLayer.layerType === LrsLayerType.Network) {
        queryRouteIdOrName(selectedEventRouteId.trim(), Immutable(networkLayer.networkInfo), this.state.networkDataSourceFromDataAction, false, true, '', selectedEventFromDate, true)
          .then(async (results) => {
            if (isDefined(results)) {
              await Promise.all(results.features.map(async (feature) => {
                const routeInfo = getInitialRouteInfoState()
                const updatedRouteInfo = await setRouteInfoByRouteIdOrName(routeInfo, networkLayer.networkInfo, this.state.networkDataSourceFromDataAction, feature)
                this.setState({ routeInfoFromDataAction: updatedRouteInfo })
              }))
            }
          })
      }
    }
  }

  onUpdateNetworkDS (ds: DataSource): void {
    this.setState({ networkDataSourceFromDataAction: ds })
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
      defaultEvent: settingPerView.defaultEvent,
      hideEvent: settingPerView.hideEvent,
      hideNetwork: settingPerView.hideNetwork,
      hideDate: settingPerView.hideDate,
      useRouteStartDate: settingPerView.useRouteStartDate
    }

    return Object.entries(configKeys).reduce<{ [key: string]: any }>((acc, [key, defaultValue]) => {
      acc[key] = getConfigValue(config, key, activeMapViewId, defaultValue)
      return acc
    }, {})
  }

  render () {
    const { config, id } = this.props
    let { useMapWidgetIds } = this.props
    const { mapViewsConfig } = config

    // Get lrs layers and settings for current map view.
    const lrsLayers = !config.mode || config.mode === ModeType.Map ? this.state.activeLrsLayers : config.lrsLayers
    const configValues = this.getConfigValues(config, this.state.settingPerView, this.state.activeMapViewId)
    const { networkLayers, eventLayers, defaultEvent, hideEvent, hideNetwork, hideDate, useRouteStartDate } = configValues

    const isMapMode = getModeType(config.mode, lrsLayers)
    const { jimuMapView } = this.state
    const hasConfig = networkLayers?.length > 0 && eventLayers?.length > 0

    if (!useMapWidgetIds) {
      const appConfig = getAppStore()?.getState()?.appConfig
      useMapWidgetIds = findFirstArcgisMapWidgetId(appConfig)
    }

    return (
      <Paper variant='flat' shape="none" className='jimu-widget runtime-split-event surface-1 border-0'>
        <div id={this.widgetOuterDivId} className="widget-outer-div h-100 w-100 d-flex">
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
              outputDataSourceType='none'
              onLrsLayersChanged={this.handleLrsLayersChanged}
              onViewChange={this.handleViewChange}
            />
          )}
          {hasConfig && (
            <SplitEvent
              widgetId={id}
              hideTitle={this.state.hideTitle}
              lrsLayers={lrsLayers}
              JimuMapView={jimuMapView}
              eventLayers={eventLayers}
              networkLayers={networkLayers}
              defaultEvent={defaultEvent}
              hoverGraphic={this.state.hoverGraphic}
              pickedGraphic={this.state.pickedGraphic}
              flashGraphic={this.state.flashGraphic}
              conflictPreventionEnabled={this.state.isConflictPreventionEnabled}
              onClearGraphic={this.clearGraphics.bind(this)}
              hideEvent={hideEvent}
              hideNetwork={hideNetwork}
              hideDate={hideDate}
              useRouteStartDate={useRouteStartDate}
              intl={this.props.intl}
              selectedEventLyr={this.state.selectedEventLyr}
              selectedEventObjectId={this.state.selectedEventObjectId}
              selectedEventRouteId={this.state.selectedEventRouteId}
              selectedEventFromDate={this.state.selectedEventFromDate}
              networkDataSourceFromDataAction={this.state.networkDataSourceFromDataAction}
              routeInfoFromDataAction={this.state.routeInfoFromDataAction}
              onResetDataAction={this.resetDataAction.bind(this)}
              onUpdateNetworkDS={this.onUpdateNetworkDS.bind(this)}
            />
            )}
            {!hasConfig && <WidgetPlaceholder icon={iconSBR} widgetId={id} message={this.getI18nMessage('_widgetLabel')} />}
          </div>
      </Paper>
    )
  }
}
