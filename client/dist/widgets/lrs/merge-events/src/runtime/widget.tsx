/** @jsx jsx */
import {
  React,
  jsx,
  type AllWidgetProps,
  DataSourceManager,
  type DataSource,
  type ImmutableObject,
  type FeatureDataRecord,
  type FeatureLayerDataSource,
  type IMState,
  getAppStore,
  WidgetState,
  DataSourceSelectionMode,
  SupportedJSAPILayerTypes,
  type ImmutableArray,
  Immutable
} from 'jimu-core'
import {
  type LrsLayer,
  type RouteInfo,
  isDefined,
  queryRouteId,
  queryEventsByEventObjectIds,
  getDateWithTZOffset,
  isInWidgetController,
  LrsLayerType,
  MapViewLoader,
  findFirstArcgisMapWidgetId,
  getModeType,
  getConfigValue,
  ModeType,
  checkConflictPrevention
} from 'widgets/shared-code/lrs'
import { areEventsOnSameLineOrRoute } from './utils'
import type { IMConfig, SettingsPerView } from '../config'
import defaultMessages from './translations/default'
import { defaultMessages as jimuUIDefaultMessages, Paper, WidgetPlaceholder } from 'jimu-ui'
import iconSBR from './../../icon.svg'
import { loadArcGISJSAPIModules, type JimuMapView, JimuMapViewComponent, type JimuFeatureLayerView, type JimuSceneLayerView } from 'jimu-arcgis'
import { MergeEvents } from './components/merge-events'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel'
import Graphic from 'esri/Graphic'
import type { AlertType } from 'jimu-ui/lib/components/alert/type'
import { constructSettingsPerView, setValuesForView } from '../common/utils'
import { getAppConfigAction } from 'jimu-for-builder'

interface ExtraProps {
  selectedEventLyr: ImmutableObject<LrsLayer>
}

export interface State {
  hideTitle: boolean
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  initialStage: boolean
  resultStage: boolean
  selectModeActive: boolean
  addToSelectionTool: boolean
  drawModeActive: boolean
  onDrawingComplete: boolean
  currentSketchVM: SketchViewModel
  noFeaturesError: boolean
  noGraphicAfterFirstSelection: boolean
  onWidgetLoadShowLoadingIndicator: boolean
  loadingIndicator: boolean
  nextPossibleloadingIndicator: boolean
  selectedFeatureRecord: any
  selectedEventLayer: ImmutableObject<LrsLayer>
  selectedNetworkLayer: ImmutableObject<LrsLayer>
  eventFeatures: any[]
  preservedEventIndex: number
  routeInfo: RouteInfo
  eventDS: DataSource
  networkDS: DataSource
  isEventPickerActive: boolean
  featuresByLayer: any
  toastOpen: boolean
  toastMsgType: AlertType
  toastMsg: string
  stopQuery: boolean
  resetForDataAction: boolean
  activeMapViewId: string
  activeLrsLayers: ImmutableArray<LrsLayer>
  settingPerView?: ImmutableObject<SettingsPerView>
  isConflictPreventionEnabled: boolean
}

export default class Widget extends React.PureComponent<
AllWidgetProps<IMConfig> & ExtraProps, State> {
  static mapExtraStateProps = (state: IMState,
    props: AllWidgetProps<IMConfig>): ExtraProps => {
    return {
      selectedEventLyr: props?.mutableStateProps?.selectedEventLyr
    }
  }

  widgetOuterDivId: string
  constructor (props) {
    super(props)

    this.state = {
      hideTitle: false,
      jimuMapView: undefined,
      hoverGraphic: null,
      pickedGraphic: null,
      flashGraphic: null,
      initialStage: true,
      resultStage: false,
      selectModeActive: true,
      addToSelectionTool: false,
      drawModeActive: false,
      onDrawingComplete: false,
      currentSketchVM: null,
      noFeaturesError: false,
      noGraphicAfterFirstSelection: false,
      onWidgetLoadShowLoadingIndicator: true,
      loadingIndicator: false,
      nextPossibleloadingIndicator: false,
      selectedFeatureRecord: null,
      selectedEventLayer: null,
      selectedNetworkLayer: null,
      eventFeatures: [],
      preservedEventIndex: -1,
      routeInfo: this.getInitialRouteInfoState(),
      eventDS: null,
      networkDS: null,
      isEventPickerActive: false,
      featuresByLayer: null,
      toastOpen: false,
      toastMsgType: 'info',
      toastMsg: '',
      stopQuery: false,
      resetForDataAction: false,
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
    LrsLayerType.LineEvent,
    LrsLayerType.Intersection
  ])

  getInitialRouteInfoState (): RouteInfo {
    const routeInfo: RouteInfo = {
      routeId: '',
      routeName: '',
      fromMeasure: NaN,
      toMeasure: NaN,
      fromDate: null,
      toDate: null,
      selectedMeasure: NaN,
      selectedFromDate: new Date(Date.now()),
      selectedToDate: null
    }
    return routeInfo
  }

  componentWillUnmount (): void {
    this.removeGraphicLayers()
  }

  componentDidMount = () => {
    if (this.props.mutableStatePropsVersion?.selectedEventLyr) {
      this.setState({
        selectedEventLayer: this.props.selectedEventLyr,
        resetForDataAction: true
      })
    }
    const isInWdigetController = isInWidgetController(this.widgetOuterDivId)
    this.setState({ hideTitle: isInWdigetController })
    this.setSettingsPerView()
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State): void {
    if (prevState.jimuMapView !== this.state.jimuMapView && isDefined(this.state.jimuMapView)) {
      // Remove any exisiting graphic layers.
      this.removeGraphicLayers()

      // Add new graphic layers.
      this.createGraphicLayers()

      this.createApiWidget(this.state.jimuMapView)
    }

    const currentWidgetState = getAppStore()?.getState()?.widgetsRuntimeInfo[this.props.id]?.state
    if (currentWidgetState === WidgetState.Opened || !currentWidgetState) {
      if (this.props?.selectedEventLyr) {
        if ((!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedEventLyr ||
          prevProps?.mutableStatePropsVersion?.selectedEventLyr !== this.props.mutableStatePropsVersion?.selectedEventLyr)) {
          this.setState({
            selectedEventLayer: this.props.selectedEventLyr,
            resetForDataAction: true
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

  queryForNewSelection (featuresByLayer, selectedUsingEPSelectTool: boolean): void {
    this.setState({ featuresByLayer: featuresByLayer })
    let newSelectedFeature: Graphic = null
    if (featuresByLayer.length > 0) {
      featuresByLayer.forEach(features => {
        if (features.length > 0) {
          if (features[0].geometry?.type === 'polyline' && features[0].layer.layerId === this.state.selectedEventLayer.serviceId) {
            this.setState({ isEventPickerActive: false })
            const objectIdFieldName = this.state.eventDS.getSchema()?.idField
            const objectIds = []
            features.forEach(feature => {
              objectIds.push(feature.attributes[objectIdFieldName])
            })

            this.queryEvents(objectIds)

            newSelectedFeature = new Graphic(
              {
                geometry: features[0]?.geometry,
                attributes: features[0]?.attributes ? features[0]?.attributes : {}
              }
            )
            return true
          }
        }
      })
    }
    if (!newSelectedFeature) {
      //reactivate sketch view model to select another point
      if (this.state.selectModeActive) {
        this.state.currentSketchVM.create('rectangle')
      }
    }
  }

  createApiWidget (jmv): void {
    // Create a new instance of sketchViewModel
    const sketchVM = new SketchViewModel({
      view: jmv ? jmv.view : null,
      layer: new GraphicsLayer(),
      updateOnGraphicClick: false,
      defaultCreateOptions: {
        mode: 'hybrid',
        hasZ: jmv?.view?.type === '3d'
      },
      polylineSymbol: {
        type: 'simple-line',
        width: 5
      },
      defaultUpdateOptions: {
        toggleToolOnClick: false
      }
    })

    sketchVM.on('create', event => {
      if (event.state === 'start') {
        const polylineSymbol = {
          type: 'simple-line',
          width: 5
        }
        this.state.currentSketchVM.set('polylineSymbol', polylineSymbol)
      } else if (event.state === 'complete') {
        this.setState({
          noFeaturesError: false
        })
        if (this.state.selectModeActive) {
          this.setState({
            loadingIndicator: true
          })

          this.selectFeaturesByGraphic(event.graphic, 'intersects', DataSourceSelectionMode.New).then((featuresByLayer) => {
            this.queryForNewSelection(featuresByLayer, true)
          })
        }
      }
    })

    this.setState({
      currentSketchVM: sketchVM
    })
  }

  /**
   * Select features in the selected event layer in the map by a graphic.
   * @param graphic This is the [ArcGIS Maps SDK for JavaScript `Graphic`](https://developers.arcgis.com/javascript/latest/api-reference/esri-Graphic.html).
   * @param spatialRelationship This parameter defines the spatial relationship to query features in the layer, see details [here](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-support-Query.html#spatialRelationship).
   * @param selectionMode This parameter is to indicate how the new select operation affects the original selection. It can only be the following enumeration values: `New`, `AddToCurrent`, `RemoveFromCurrent`, or `SelectFromCurrent`.
   **/
  selectFeaturesByGraphic = async (graphic: __esri.Graphic, spatialRelationship: string, selectionMode: DataSourceSelectionMode, outputAllFields = false): Promise<any> => {
    return loadArcGISJSAPIModules([
      'esri/geometry/operators/bufferOperator'
    ]).then(async modules => {
      const bufferOperator: __esri.bufferOperator = modules[0]
      let geometry = graphic.geometry
      if ((geometry.type === 'point' || geometry.type === 'polyline')) {
        const resolution = this.state.jimuMapView.view.scale * 2.54 / 9600
        geometry = bufferOperator.execute(geometry as __esri.geometryGeometry, 10 * resolution, {unit: 'meters'}) as any
      }

      const query = {
        geometry: geometry,
        spatialRelationship: spatialRelationship,
        returnGeometry: true,
        returnZ: true
      } as any

      if (outputAllFields) {
        query.outFields = ['*']
      }

      const jimuLayerViews = this.state.jimuMapView.jimuLayerViews
      const jimuLayerViewKeys = Object.keys(jimuLayerViews)
      const allSelectPromises = []

      for (let i = 0; i < jimuLayerViewKeys.length; i++) {
        const tempJimuLayerView = jimuLayerViews[jimuLayerViewKeys[i]] as (JimuFeatureLayerView | JimuSceneLayerView)

        if (tempJimuLayerView.type === SupportedJSAPILayerTypes.FeatureLayer || tempJimuLayerView.type === SupportedJSAPILayerTypes.SceneLayer) {
          if (tempJimuLayerView.layer.title === this.state.selectedEventLayer.name && tempJimuLayerView.selectFeaturesByQuery) {
            const tempSelectPromise = tempJimuLayerView.selectFeaturesByQuery(query, selectionMode)
            allSelectPromises.push(tempSelectPromise)
          }
        }
      }

      this.state.jimuMapView.onSelectByQueryProgressChange()

      return Promise.all(allSelectPromises)
    })
  }

  onUpdateStopQuery = (stopQuery: boolean) => {
    this.setState({ stopQuery: stopQuery })
  }

  onJimuLayerViewSelectedFeaturesChange = (jimuLayerView: JimuFeatureLayerView | JimuSceneLayerView) => {
    if (this.state.stopQuery) return
    if (jimuLayerView.layer.title === this.state.selectedEventLayer.name) {
      setTimeout(() => {
        this.querySelectedFeatures(this.state.jimuMapView)
      }, 100)
    }
  }


  onActiveViewChange = (activeJimuMapView: JimuMapView) => {
    if (!(activeJimuMapView && activeJimuMapView.view)) {
      return
    }
    this.waitForChildDataSourcesReady(activeJimuMapView).finally(() => {
      if (this.state.jimuMapView) {
        this.state.jimuMapView.removeJimuLayerViewSelectedFeaturesChangeListener(this.onJimuLayerViewSelectedFeaturesChange)
      }
      this.setState({ jimuMapView: activeJimuMapView })
      if (activeJimuMapView) {
        activeJimuMapView.addJimuLayerViewSelectedFeaturesChangeListener(this.onJimuLayerViewSelectedFeaturesChange)
      }
      setTimeout(() => {
        this.querySelectedFeatures(activeJimuMapView)
      }, 100)
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

  handleSelectedEventLayerUpdate = (newEventLayer: ImmutableObject<LrsLayer>) => {
    this.setState({ selectedEventLayer: newEventLayer })
  }

  handleSelectedNetworkLayerUpdate = (newNetworkLayer: ImmutableObject<LrsLayer>) => {
    this.setState({ selectedNetworkLayer: newNetworkLayer })
  }

  removeEvent = async (removedIndex: number) => {
    this.state.flashGraphic.removeAll()
    const features: any[] = []
    const oids: any[] = []
    const objectIdFieldName = this.state.eventDS.getSchema()?.idField
    this.state.eventFeatures.forEach((feature, index) => {
      if (index !== removedIndex) {
        features.push(feature)
        oids.push(feature.attributes[objectIdFieldName])
      }
    })

    // Set preserved index to be -1 first so removing an event would update attributes
    this.setState({ preservedEventIndex: -1, routeInfo: this.getInitialRouteInfoState() })

    const jimuLayerViews = this.state.jimuMapView.jimuLayerViews
    const jimuLayerViewKeys = Object.keys(jimuLayerViews)

    for (let i = 0; i < jimuLayerViewKeys.length; i++) {
      const tempJimuLayerView = jimuLayerViews[jimuLayerViewKeys[i]]

      if (tempJimuLayerView.layer.title === this.state.selectedEventLayer.name) {
        const numSelectedIds = oids.map(id => Number(id))

        if (numSelectedIds.length > 0) {
          if (this.state.eventDS) {
            const queryResult = await (this.state.eventDS as FeatureLayerDataSource).query({
              objectIds: numSelectedIds.slice().map(id => id + ''),
              returnGeometry: true,
              returnZ: true
            })

            const records = queryResult.records as FeatureDataRecord[]

            if (records && records.length > 0) {
              (tempJimuLayerView as JimuFeatureLayerView | JimuSceneLayerView).selectFeaturesByIds(numSelectedIds, records)
            }
          }
        } else {
          (tempJimuLayerView as JimuFeatureLayerView | JimuSceneLayerView).selectFeaturesByIds([])
        }
      }
    }
  }

  onUpdateEventFeatures = (features: any[]) => {
    this.setState({ eventFeatures: features })
  }

  onPreservedEventIndexChanged = (index: number) => {
    this.setState({ preservedEventIndex: index })
  }

  onUpdateRouteInfo = (info: RouteInfo) => {
    this.setState({ routeInfo: info })
  }

  queryEvents = (objectIds) => {
    const featureLayerDS = this.state.eventDS as FeatureLayerDataSource
    queryEventsByEventObjectIds(featureLayerDS, objectIds).then(async (events) => {
      this.state.flashGraphic.removeAll()
      await areEventsOnSameLineOrRoute(
        true,
        events,
        this.getI18nMessage,
        this.state.selectedEventLayer,
        this.state.selectedNetworkLayer,
        this.state.networkDS,
        this.state.toastMsgType,
        this.onUpdateToastMsgType,
        this.onUpdateToastMsg,
        this.onUpdateToastOpen)

      if (events.length > 0) {
        this.setState({ preservedEventIndex: 0, eventFeatures: events })
        const routeId = events[0].attributes[this.state.selectedEventLayer.eventInfo.routeIdFieldName]
        queryRouteId(routeId.trim(), this.state.selectedNetworkLayer.networkInfo, this.state.networkDS)
          .then((results) => {
            if (isDefined(results)) {

              results.features.map((feature) => {
                const routeIdValue = feature.attributes[this.state.selectedNetworkLayer.networkInfo.routeIdFieldSchema.name]
                const routeFromDateValue = feature.attributes[this.state.selectedNetworkLayer.networkInfo.fromDateFieldSchema.name]
                const routeToDateValue = feature.attributes[this.state.selectedNetworkLayer.networkInfo.toDateFieldSchema.name]
                const routeNameValue = this.state.selectedNetworkLayer.networkInfo.useRouteName
                  ? feature.attributes[this.state.selectedNetworkLayer.networkInfo.routeNameFieldSchema.name]
                  : ''
                const lineIdValue = this.state.selectedNetworkLayer.networkInfo.supportsLines
                  ? feature.attributes[this.state.selectedNetworkLayer.networkInfo.lineIdFieldSchema.name]
                  : ''
                const lineNameValue = this.state.selectedNetworkLayer.networkInfo.supportsLines
                  ? feature.attributes[this.state.selectedNetworkLayer.networkInfo.lineNameFieldSchema.name]
                  : ''

                let defaultFromSelectedDate = new Date(Date.now())
                if (isDefined(routeToDateValue) && defaultFromSelectedDate > routeToDateValue) {
                  defaultFromSelectedDate = getDateWithTZOffset(routeFromDateValue, this.state.networkDS)
                } else {
                  defaultFromSelectedDate.setHours(0, 0, 0, 0)
                }
                let defaultToSelectedDate = new Date(Date.now())
                if (isDefined(routeToDateValue) && defaultToSelectedDate > routeToDateValue) {
                  defaultToSelectedDate = getDateWithTZOffset(routeToDateValue, this.state.networkDS)
                } else {
                  defaultToSelectedDate.setHours(0, 0, 0, 0)
                }
                if (!isDefined(routeToDateValue)) {
                  defaultToSelectedDate = null
                }
                const route: RouteInfo = {
                  routeId: routeIdValue,
                  fromDate: isDefined(routeFromDateValue) ? getDateWithTZOffset(routeFromDateValue, this.state.networkDS) : null,
                  toDate: isDefined(routeToDateValue) ? getDateWithTZOffset(routeToDateValue, this.state.networkDS) : null,
                  selectedFromDate: defaultFromSelectedDate,
                  selectedToDate: defaultToSelectedDate,
                  routeName: routeNameValue,
                  fromMeasure: NaN,
                  toMeasure: NaN,
                  selectedMeasure: NaN,
                  lineId: lineIdValue,
                  lineName: lineNameValue
                }
                this.setState({ routeInfo: route })
                return feature
              })
            }
          })
      } else {
        this.setState({ eventFeatures: [] })
      }
    })
  }

  querySelectedFeatures = async (activeJimuMapView: JimuMapView) => {
    const view = activeJimuMapView?.view

    if (view) {
      // Set preserved index to be -1 first so making a new event selection would update attributes
      this.setState({ preservedEventIndex: -1, routeInfo: this.getInitialRouteInfoState() })
      const graphics = await this.getSelectedGraphics(activeJimuMapView)
      if (graphics.length > 0) {
        const objectIds = []
        const objectIdFieldName = this.state.eventDS.getSchema()?.idField
        graphics.forEach(graphic => {
          if (graphic.geometry?.type === 'polyline' && graphic.layer?.layerId === this.state.selectedEventLayer.serviceId) {
            objectIds.push(graphic.attributes[objectIdFieldName])
          }
        })
        this.queryEvents(objectIds)
      } else {
        if (this.state.toastMsgType === 'error') {
          this.onUpdateToastOpen(false)
        }
        this.setState({ eventFeatures: [] })
      }
    }
  }

  async getSelectedGraphics (activeJimuMapView: JimuMapView) {
    let selectedGraphics = []

    if (activeJimuMapView) {
      selectedGraphics = await activeJimuMapView.getSelectedFeatures()
    }

    return selectedGraphics
  }

  onUpdateEventDS = (ds: DataSource) => {
    this.setState({ eventDS: ds, preservedEventIndex: -1, eventFeatures: [], routeInfo: this.getInitialRouteInfoState() })
    this.querySelectedFeatures(this.state.jimuMapView)
  }

  onUpdateNetworkDS = (ds: DataSource) => {
    this.setState({ networkDS: ds })
  }

  onUpdateIsEventPickerActive = (isActive: boolean) => {
    if (!isActive) {
      this.state.currentSketchVM.cancel()
    }
    this.setState({ isEventPickerActive: isActive })
  }

  onUpdateToastMsgType = (type: AlertType) => {
    this.setState({ toastMsgType: type })
  }

  onUpdateToastMsg = (msg: string) => {
    this.setState({ toastMsg: msg })
  }

  onUpdateToastOpen = (isOpen: boolean) => {
    this.setState({ toastOpen: isOpen })
  }

  onUpdateResetForDataAction = (reset: boolean) => {
    this.setState({ resetForDataAction: reset })
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
      displayConfig: settingPerView.displayConfig
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
    const { networkLayers, eventLayers, intersectionLayers, defaultEvent, displayConfig } = configValues

    const isMapMode = getModeType(config.mode, lrsLayers)
    const { jimuMapView } = this.state
    const hasConfig = networkLayers?.length > 0 && eventLayers?.length > 0

    if (!useMapWidgetIds) {
      const appConfig = getAppStore()?.getState()?.appConfig
      useMapWidgetIds = findFirstArcgisMapWidgetId(appConfig)
    }

    return (
      <Paper variant='flat' shape="none" className='jimu-widget runtime-merge-events surface-1 border-0'>
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
            <MergeEvents
              widgetId={id}
              intl={this.props.intl}
              hideTitle={this.state.hideTitle}
              lrsLayers={lrsLayers}
              JimuMapView={jimuMapView}
              eventLayers={eventLayers}
              networkLayers={networkLayers}
              instersectionLayers={intersectionLayers}
              defaultEvent={defaultEvent}
              hoverGraphic={this.state.hoverGraphic}
              pickedGraphic={this.state.pickedGraphic}
              flashGraphic={this.state.flashGraphic}
              conflictPreventionEnabled={this.state.isConflictPreventionEnabled}
              onClearGraphic={this.clearGraphics.bind(this)}
              displayConfig={displayConfig}
              currentSketchVM={this.state.currentSketchVM}
              onUpdateSelectedEventLayer={this.handleSelectedEventLayerUpdate}
              onUpdateSelectedNetworkLayer={this.handleSelectedNetworkLayerUpdate}
              eventFeatures={this.state.eventFeatures}
              preservedEventIndex={this.state.preservedEventIndex}
              onEventRemoved={this.removeEvent}
              onPreservedEventIndexChanged={this.onPreservedEventIndexChanged}
              onUpdateEventFeatures={this.onUpdateEventFeatures}
              routeInfo={this.state.routeInfo}
              onUpdateRouteInfo={this.onUpdateRouteInfo}
              eventDS={this.state.eventDS}
              eventLayer={this.state.selectedEventLayer}
              networkDS={this.state.networkDS}
              onUpdateEventDS={this.onUpdateEventDS}
              onUpdateNetworkDS={this.onUpdateNetworkDS}
              isEventPickerActive={this.state.isEventPickerActive}
              onUpdateIsEventPickerActive={this.onUpdateIsEventPickerActive}
              onUpdateToastMsgType={this.onUpdateToastMsgType}
              onUpdateToastMsg={this.onUpdateToastMsg}
              onUpdateToastOpen={this.onUpdateToastOpen}
              toastMsgType={this.state.toastMsgType}
              toastMsg={this.state.toastMsg}
              toastOpen={this.state.toastOpen}
              onUpdateStopQuery={this.onUpdateStopQuery}
              resetForDataAction={this.state.resetForDataAction}
              onUpdateResetForDataAction={this.onUpdateResetForDataAction}
            />
          )}
          {!hasConfig && <WidgetPlaceholder icon={iconSBR} widgetId={id} message={this.getI18nMessage('_widgetLabel')} />}
        </div>
      </Paper>
    )
  }
}
