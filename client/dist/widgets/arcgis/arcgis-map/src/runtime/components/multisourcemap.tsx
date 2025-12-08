import {
  React, classNames, MessageManager, type ImmutableArray, Immutable, observeStore, ReactResizeDetector,
  getAppStore, appActions, MutableStoreManager, type ExtentChangeMessage, type UseDataSource, WIDGET_PREFIX_FOR_A11Y_SKIP
} from 'jimu-core'
import MapBase, { MapLoadStatus } from './mapbase'
import { MultiSourceMapContext } from './multisourcemap-context'
import type { MapWidgetProps } from '../widget'
import { MapViewManager, type JimuMapView, type JimuMapViewGroup, JimuMapViewComponent, type DefaultMapInfo } from 'jimu-arcgis'
import MapFixedLayout from '../layout/map-fixed-layout'
import MapToolLayout, { type ActiveToolInfo } from '../layout/layout'
import pcLayoutJsons from '../layout/pc-layout-json'
import mobileLayoutJsons from '../layout/mobile-layout-json'
import { getJimuMapViewId, updateViewUrlParamsForActiveJimuMapView, updatePersistentMapStateForActiveJimuMapView, getViewSurfaceDom } from '../utils'
import type { LayoutJson } from '../layout/config'

interface Props {
  baseWidgetProps: MapWidgetProps
  startLoadModules: boolean
  fullScreenMap: () => void

  isDefaultMap?: boolean

  // TODO: maybe the following JimuMapView event callbacks should be replaced by JimuMapViewComponent
  onViewGroupCreate: (viewGroup: JimuMapViewGroup) => void
  onJimuMapViewCreated: (jimuMapView: JimuMapView) => void
  onActiveJimuMapViewChange: (jimuMapView: JimuMapView) => void

  widthBreakpoint: string
  widgetHeight: number

  isFullScreen: boolean
  isMapInVisibleArea: boolean
  defaultMapInfo?: DefaultMapInfo

  children?: React.ReactNode

  autoControlWidgetId: string

  mapComponentsLoaded: boolean
  mapRootClassName: string
}

interface MapContainerStyle {
  opacity: number
  zIndex: number | string
}

interface State {
  currentMapIndex?: 0 | 1
  multiMapStyle?: MapContainerStyle[]
  // this.firstMapInstance always binds to firstMapDsId and this.secondMapInstance always binds to secondMapDsId
  // firstMapDsId and secondMapDsId are decided once in componentDidMount(), firstMapDsId is initialized as initialMapDataSourceID,
  // and secondMapDsId is initialized not the initialMapDataSourceID.
  // Calling switchMap() method will not change firstMapDsId and secondMapDsId.
  firstMapDsId?: string
  secondMapDsId?: string
  // If useAnimation is true, means we enable switching opacity animation when call switchMap() method
  // by adding classNames multisourcemap-item-appear and multisourcemap-item-disappear.
  useAnimation: boolean

  useDataSources?: ImmutableArray<UseDataSource>
  currentJimuMapViewId?: string
  mobilePanelContent: React.JSX.Element
  mobilePanelContainer: HTMLDivElement
  activeToolInfo: ActiveToolInfo
  // showOnMapDatasKey: string[]
}

const VisibleStyles = {
  firstMapVisible: [{
    zIndex: 'unset',
    opacity: 1
  }, {
    zIndex: -1,
    opacity: 0
  }],
  secondMapVisible: [{
    zIndex: -1,
    opacity: 0
  }, {
    zIndex: 'unset',
    opacity: 1
  }]
}

export default class MultiSourceMap extends React.PureComponent<Props, State> {
  isReIniting: boolean
  mutableStatePropsMap: { [propKey: string]: string[] } = {}
  useMapWidgetIds: ImmutableArray<string>
  __unmount = false
  domRef: React.RefObject<HTMLDivElement>
  firstMapInstance: React.RefObject<MapBase>
  secondMapInstance: React.RefObject<MapBase>
  // Record the MultiSourceMap inited count for the specific mapWidgetId at runtime, the key is map widget id, the value is the MultiSourceMap inited count.
  // We use runtimeInitedMapWidgets to identify whether the MultiSourceMap is initialized for the first time,
  // and replace config.initialMapDataSourceID with activeDataSourceId in the url hash during the first initialization.
  static runtimeInitedMapWidgets: { [mapWidgetId: string]: number } = {}

  dateOfMouseOverPopper: Date = null
  dateOfMouseOutPopper: Date = null

  constructor (props) {
    super(props)

    this.domRef = React.createRef<HTMLDivElement>()
    this.firstMapInstance = React.createRef<MapBase>()
    this.secondMapInstance = React.createRef<MapBase>()

    const mapWidgetId = this.props.baseWidgetProps.id

    if (typeof MultiSourceMap.runtimeInitedMapWidgets[mapWidgetId] === 'number') {
      // MultiSourceMap is inited multiple times for mapWidgetId
      MultiSourceMap.runtimeInitedMapWidgets[mapWidgetId] += 1
    } else {
      // MultiSourceMap is inited firstly for mapWidgetId
      MultiSourceMap.runtimeInitedMapWidgets[mapWidgetId] = 1
    }

    const restoreData = MutableStoreManager.getInstance().getStateValue([this.props.baseWidgetProps.id, 'restoreData',
      `${this.props.baseWidgetProps.id}-restoreData-multimap`])
    if (restoreData) {
      const mobilePanelContainer = document.createElement('div')
      mobilePanelContainer.id = `${this.props.baseWidgetProps.id}-bottom-panel`
      mobilePanelContainer.className = 'w-100 h-100'
      restoreData.mobilePanelContainer = mobilePanelContainer

      this.reInitWidgetInstance(restoreData)

      MutableStoreManager.getInstance().updateStateValue(this.props.baseWidgetProps.id,
        `restoreData.${this.props.baseWidgetProps.id}-restoreData-multimap`, null)
    } else {
      const mobilePanelContainer = document.createElement('div')
      mobilePanelContainer.id = `${this.props.baseWidgetProps.id}-bottom-panel`
      mobilePanelContainer.className = 'w-100 h-100'

      // The workflow to show top map and bottom map:
      // 1. this.state.multiMapStyle is set to VisibleStyles.firstMapVisible, this leads to getCurrentVisibleDsId() returning this.state.firstMapDsId.
      // 2. In componentDidMount, this.state.firstMapDsId is set to initialMapDataSourceID.
      // 3. When JimuMapView created, handleJimuMapViewCreated is called, then handleJimuMapViewCreated calls confirmJimuMapViewIsActive.
      // 4. In confirmJimuMapViewIsActive, it calls this.getCurrentVisibleDsId() as currentDataSourceId, currentDataSourceId is this.state.firstMapDsId due to step1.
      //    And because of step2, this.state.firstMapDsId is initialMapDataSourceID, so the currentDataSourceId is initialMapDataSourceID.
      //    Then call JimuMapView.setIsActive(isActive), isActive is true if jimuMapView.dataSourceId equals currentDataSourceId, otherwise isActive is false.

      this.state = {
        // show useDataSources[0] on the top by default
        currentMapIndex: 0,
        multiMapStyle: VisibleStyles.firstMapVisible,
        firstMapDsId: null,
        secondMapDsId: null,
        useAnimation: false,
        useDataSources: null,
        // Note, the initial currentJimuMapViewId is empty, it is not empty after called this.confirmJimuMapViewIsActive() method.
        currentJimuMapViewId: null,
        mobilePanelContent: null,
        mobilePanelContainer: mobilePanelContainer,
        activeToolInfo: null
        // showOnMapDatasKey: null
      }
    }

    this.mutableStatePropsMap = {}
    this.useMapWidgetIds = this.props.baseWidgetProps.id ? Immutable([this.props.baseWidgetProps.id]) : Immutable([])

    observeStore(this.onPageChange, ['appRuntimeInfo', 'currentPageId'])
  }

  onPageChange = (prePageId, currentPageId) => {
    // close active tool
    if (prePageId && currentPageId && prePageId !== currentPageId) {
      this.setState({
        activeToolInfo: null
      })
    }
  }

  onResize = ({ width, height }) => {
    // Variable isPopperChanged is used to the following case:
    // 1. Map widget is placed at Column widget.
    // 2. And add some widgets into the Column widget to make sure widgets' height > Column widget height.
    // 3. Normally, browser should show the vertical scrollbar for the Column widget, but the Column widget overrides the css for scroll bar.
    // 4. When hovering the Column widget, it shows the scroll bar, then the map resizes and triggers the onResize callback.
    //    When not hovering the Column widget, it doesn't show the scroll bar, then the map resizes and triggers the onResize callback.
    // 5. If user clicks the map tool icon, map shows the popper and the popper is placed at document.body. When hovering the popper, the Column widget gets unhovered.
    //    So the Column widget hide the scroll bar, then the map resizes and triggers the onResize callback.
    //    Then popper is closed by this.setState({activeToolInfo: null}) in the onResize callback. We need to use variable isPopperChanged to avoid closing popper for the above case.
    let isPopperChanged = false

    const currTime = Date.now()
    // In practice, the real threshold time is between 6ms and 97ms.
    const thresholdTime = 100

    if (this.dateOfMouseOverPopper) {
      const deltaTime = currTime - this.dateOfMouseOverPopper.getTime()

      if (deltaTime <= thresholdTime) {
        isPopperChanged = true
      }
    }

    if (this.dateOfMouseOutPopper) {
      const deltaTime = currTime - this.dateOfMouseOutPopper.getTime()

      if (deltaTime <= thresholdTime) {
        isPopperChanged = true
      }
    }

    if (isPopperChanged && width > 0 && height > 0) {
      return
    }

    // close active tool
    this.setState({
      activeToolInfo: null
    })
  }

  onMouseOverPopper = (): void => {
    this.dateOfMouseOverPopper = new Date()
  }

  onMouseOutPopper = (): void => {
    this.dateOfMouseOutPopper = new Date()
  }

  reInitWidgetInstance = (restoreData) => {
    this.state = restoreData as State
    this.isReIniting = true
  }

  componentDidMount () {
    if (getAppStore().getState().mapWidgetsInfo) {
      if (!getAppStore().getState().mapWidgetsInfo[this.props.baseWidgetProps.id]) {
        getAppStore().dispatch(appActions.MapWidgetInfoAdded(this.props.baseWidgetProps.id, Immutable({ mapWidgetId: this.props.baseWidgetProps.id })))
      }
    }

    this.__unmount = false

    if (this.isReIniting) {
      // this.isReIniting is true means MultiSourceMap is restored.
      return
    }

    const useDataSources = this.props.baseWidgetProps.useDataSources

    if (useDataSources) {
      // initialMapDataSourceID maybe config.initialMapDataSourceID or url hash param active_datasource_id
      let initialMapDataSourceID = this.props.baseWidgetProps.config.initialMapDataSourceID

      // If url hash param active_datasource_id is set and this is the first time MultiSourceMap inited,
      // then we use active_datasource_id override config.initialMapDataSourceID.
      if (this.props.baseWidgetProps.isRunAppMode) {
        const mapWidgetId = this.props.baseWidgetProps.id
        const firstTimeInited = MultiSourceMap.runtimeInitedMapWidgets[mapWidgetId] === 1

        if (firstTimeInited) {
          // MultiSourceMap is inited firstly for mapWidgetId.
          const runtimeUrlHashParams = this.props.baseWidgetProps.runtimeUrlHashParams

          if (runtimeUrlHashParams && runtimeUrlHashParams.active_datasource_id) {
            const allDataSourceIds = useDataSources.map(item => item.dataSourceId)

            if (allDataSourceIds.includes(runtimeUrlHashParams.active_datasource_id)) {
              initialMapDataSourceID = runtimeUrlHashParams.active_datasource_id
            }
          }
        }
      }

      // the following code make sure firstMapDsId points to the above initialMapDataSourceID

      if (!initialMapDataSourceID) {
        this.setState({
          firstMapDsId: useDataSources[0] && useDataSources[0].dataSourceId,
          secondMapDsId: useDataSources[1] && useDataSources[1].dataSourceId
        })
      } else {
        if (initialMapDataSourceID === (useDataSources[0] && useDataSources[0].dataSourceId)) {
          this.setState({
            firstMapDsId: useDataSources[0] && useDataSources[0].dataSourceId,
            secondMapDsId: useDataSources[1] && useDataSources[1].dataSourceId
          })
        } else if (initialMapDataSourceID === (useDataSources[1] && useDataSources[1].dataSourceId)) {
          this.setState({
            firstMapDsId: useDataSources[1] && useDataSources[1].dataSourceId,
            secondMapDsId: useDataSources[0] && useDataSources[0].dataSourceId
          })
        } else {
          this.setState({
            firstMapDsId: useDataSources[0] && useDataSources[0].dataSourceId,
            secondMapDsId: useDataSources[1] && useDataSources[1].dataSourceId
          })
        }
      }
    }
  }

  componentWillUnmount () {
    this.__unmount = true
    const widgets = getAppStore().getState().appConfig.widgets

    if (widgets[this.props.baseWidgetProps.id] && widgets[this.props.baseWidgetProps.id].useDataSources === this.props.baseWidgetProps.useDataSources) {
      const restoreData = {
        currentMapIndex: this.state.currentMapIndex,
        multiMapStyle: this.state.multiMapStyle,
        firstMapDsId: this.state.firstMapDsId,
        secondMapDsId: this.state.secondMapDsId,
        useAnimation: this.state.useAnimation,
        currentJimuMapViewId: this.state.currentJimuMapViewId
      }
      MutableStoreManager.getInstance().updateStateValue(this.props.baseWidgetProps.id,
        `restoreData.${this.props.baseWidgetProps.id}-restoreData-multimap`, restoreData)
    }

    if (!widgets[this.props.baseWidgetProps.id]) {
      getAppStore().dispatch(appActions.MapWidgetInfoRemoved(this.props.baseWidgetProps.id))
    }
  }

  static getChangedState = (firstMapDsId, secondMapDsId, useDataSources): State => {
    const changedState = {} as State

    if (useDataSources && useDataSources[0]) {
      const newDataSourceArr = []
      const repeatDataSourceArr = []
      for (let i = 0; i < useDataSources.length; i++) {
        if (firstMapDsId !== useDataSources[i].dataSourceId) {
          newDataSourceArr.push(useDataSources[i].dataSourceId)
        } else {
          repeatDataSourceArr.push(useDataSources[i].dataSourceId)
        }
      }
      if (repeatDataSourceArr.length > 0) {
        changedState.firstMapDsId = firstMapDsId
        changedState.secondMapDsId = newDataSourceArr[0]
      } else if (repeatDataSourceArr.length === 0) {
        if (newDataSourceArr.includes(secondMapDsId)) {
          newDataSourceArr.splice(newDataSourceArr.indexOf(secondMapDsId), 1)
          changedState.firstMapDsId = newDataSourceArr[0]
          changedState.secondMapDsId = secondMapDsId
        } else {
          changedState.firstMapDsId = newDataSourceArr[0]
          changedState.secondMapDsId = newDataSourceArr[1]
        }
      }
    } else {
      changedState.firstMapDsId = null
      changedState.secondMapDsId = null
    }

    if (changedState.firstMapDsId !== firstMapDsId) {
      if (changedState.firstMapDsId) {
        changedState.multiMapStyle = VisibleStyles.firstMapVisible
        changedState.currentMapIndex = 0
      } else if (changedState.secondMapDsId) {
        changedState.multiMapStyle = VisibleStyles.secondMapVisible
        changedState.currentMapIndex = 1
      } else {
        changedState.multiMapStyle = VisibleStyles.firstMapVisible
        changedState.currentMapIndex = 0
      }
    } else {
      if (!changedState.secondMapDsId) {
        changedState.multiMapStyle = VisibleStyles.firstMapVisible
        changedState.currentMapIndex = 0
      } else if (changedState.secondMapDsId !== secondMapDsId) {
        changedState.multiMapStyle = VisibleStyles.secondMapVisible
        changedState.currentMapIndex = 1
      }
    }
    return changedState
  }

  static getDerivedStateFromProps (newProps: Props, prevState: State) {
    if (newProps.baseWidgetProps.useDataSources !== prevState.useDataSources) {
      const newState = MultiSourceMap.getChangedState(prevState.firstMapDsId, prevState.secondMapDsId, newProps.baseWidgetProps.useDataSources)
      return newState
    } else {
      return null
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.baseWidgetProps.stateProps && this.props.baseWidgetProps.stateProps.initialMapDataSourceID) {
      // mapWidget.props.stateProps.initialMapDataSourceID is a temporary variable to let map setting and map runtime communicate with each other.
      // If we change the initialMapDataSourceID by clicking ds thumbnail in map setting,
      // then map setting will call builderAppSync.publishChangeWidgetStatePropToApp() to update mapWidget.props.stateProps.initialMapDataSourceID.
      // Once we check mapWidget.props.stateProps.initialMapDataSourceID is not empty in MultiSourceMap, means we changed the initialMapDataSourceID,
      // then we make sure the initialMapbase go to the initial extent.
      // At last, we will reset mapWidget.props.stateProps.initialMapDataSourceID to empty.

      const initialMapDataSourceID = this.props.baseWidgetProps.stateProps.initialMapDataSourceID

      if (this.state.firstMapDsId === initialMapDataSourceID) {
        const firstMapInstance = this.firstMapInstance?.current

        if (firstMapInstance) {
          firstMapInstance.goHome(false)
        }
      }

      if (this.state.secondMapDsId === initialMapDataSourceID) {
        const secondMapInstance = this.secondMapInstance?.current

        if (secondMapInstance) {
          secondMapInstance.goHome(false)
        }
      }

      this.props.baseWidgetProps.dispatch(appActions.widgetStatePropChange(this.props.baseWidgetProps.id, 'initialMapDataSourceID', null))
    }

    if (this.isReIniting) {
      this.isReIniting = false
      return
    }

    if (this.props.baseWidgetProps.config.initialMapDataSourceID !== prevProps.baseWidgetProps.config.initialMapDataSourceID) {
      // User clicks the map thumbnail in map setting page and change the config.initialMapDataSourceID.
      this.changeInitialMapDataSourceID(this.props.baseWidgetProps.config.initialMapDataSourceID, this.confirmJimuMapViewIsActive)
    }

    if (this.props.baseWidgetProps.useDataSources !== prevProps.baseWidgetProps.useDataSources) {
      this.confirmJimuMapViewIsActive()
    }
  }

  /**
   * This method is called when user clicks the map thumbnail in map setting page and change the config.initialMapDataSourceID.
   * @param dataSourceId
   * @param callBack
   */
  changeInitialMapDataSourceID = (dataSourceId: string, callBack?: any) => {
    if (this.props.baseWidgetProps.useDataSources && this.props.baseWidgetProps.useDataSources.length > 1) {
      const firstMapInstance = this.firstMapInstance?.current
      const secondMapInstance = this.secondMapInstance?.current

      if (!firstMapInstance || !secondMapInstance) {
        // Make sure both firstMapInstance and secondMapInstance exist, otherwise we don't need to call this method.
        if (callBack) {
          callBack()
        }
        return
      }

      if (!this.state.currentMapIndex) {
        if (this.state.secondMapDsId && this.state.secondMapDsId === dataSourceId) {
          this.startChangeInitialMapAnimation(callBack)
          secondMapInstance.goHome(false)
        } else {
          firstMapInstance.goHome(false)
        }
      } else {
        if (this.state.firstMapDsId && this.state.firstMapDsId === dataSourceId) {
          this.startChangeInitialMapAnimation(callBack)
          firstMapInstance.goHome(false)
        } else {
          secondMapInstance.goHome(false)
        }
      }
    }
  }

  startChangeInitialMapAnimation = (callBack?: any) => {
    const firstMapInstance = this.firstMapInstance?.current
    const secondMapInstance = this.secondMapInstance?.current

    if (!firstMapInstance || !secondMapInstance) {
      // Make sure both firstMapInstance and secondMapInstance exist, otherwise we don't need to call this method.
      if (callBack) {
        callBack()
      }
      return
    }

    const tempState = Object.assign({}, this.state) as State

    if (!this.state.currentMapIndex) {
      // currentMapIndex: 0 -> 1
      // first map visible -> second map visible
      tempState.currentMapIndex = 1
      tempState.multiMapStyle = VisibleStyles.secondMapVisible

      const viewPoint = firstMapInstance.getViewPoint()

      if (viewPoint) {
        secondMapInstance.setViewPoint(viewPoint)
      }

      this.setState(tempState, () => { callBack && callBack() })
    } else {
      // currentMapIndex: 1 -> 0
      // second map visible -> first map visible
      tempState.currentMapIndex = 0
      tempState.multiMapStyle = VisibleStyles.firstMapVisible

      const viewPoint = secondMapInstance.getViewPoint()

      if (viewPoint) {
        firstMapInstance.setViewPoint(viewPoint)
      }

      this.setState(tempState, () => { callBack && callBack() })
    }
  }

  /**
   * This method is called when user clicks the switch tool at the left bottom of map widget.
   */
  switchMap = async (ignoreSwitchAnimation = false): Promise<any> => {
    if (!this.props.baseWidgetProps.useDataSources || this.props.baseWidgetProps.useDataSources.length < 2) {
      await Promise.resolve()
      return
    }

    const firstMapInstance = this.firstMapInstance?.current
    const secondMapInstance = this.secondMapInstance?.current

    if (!firstMapInstance || !secondMapInstance) {
      // Make sure both firstMapInstance and secondMapInstance exist, otherwise we don't need to call this method.
      return
    }

    const tempState = Object.assign({}, this.state) as State
    // By default, we enable switching opacity animation.
    tempState.useAnimation = !ignoreSwitchAnimation

    if (!this.state.currentMapIndex) {
      // currentMapIndex: 0 -> 1
      // first map visible -> second map visible
      tempState.currentMapIndex = 1
      tempState.multiMapStyle = VisibleStyles.secondMapVisible

      const viewPoint = firstMapInstance.getViewPoint()

      if (viewPoint) {
        secondMapInstance.setViewPoint(viewPoint)
      }
    } else {
      // currentMapIndex: 1 -> 0
      // second map visible -> first map visible
      tempState.currentMapIndex = 0
      tempState.multiMapStyle = VisibleStyles.firstMapVisible

      const viewPoint = secondMapInstance.getViewPoint()

      if (viewPoint) {
        firstMapInstance.setViewPoint(viewPoint)
      }
    }

    return new Promise((resolve, reject) => {
      this.setState(tempState, () => {
        const mapViewManager = MapViewManager.getInstance()
        const mapWidgetId = this.props.baseWidgetProps?.widgetId
        const jimuMapViewGroup = mapWidgetId && mapViewManager.getJimuMapViewGroup(mapWidgetId)
        const oldActiveJimuMapView = (jimuMapViewGroup && jimuMapViewGroup.getActiveJimuMapView()) || null

        // update jimuMapView.isActive
        this.confirmJimuMapViewIsActive()

        const newActiveJimuMapView = (jimuMapViewGroup && jimuMapViewGroup.getActiveJimuMapView()) || null

        if (newActiveJimuMapView && newActiveJimuMapView !== oldActiveJimuMapView) {
          // active JimuMapView changed
          updatePersistentMapStateForActiveJimuMapView(newActiveJimuMapView)
        }

        setTimeout(() => {
          this.setState({
            useAnimation: false
          }, () => {
            resolve(null)
          })
        }, 500)
      })
    })
  }

  handleMutableStatePropsChanged = (dataSourceId: string, propKey: string, value?: any) => {
    if (!this.mutableStatePropsMap[propKey]) {
      this.mutableStatePropsMap[propKey] = [dataSourceId]
    } else {
      if (!this.mutableStatePropsMap[propKey].includes(dataSourceId)) {
        this.mutableStatePropsMap[propKey].push(dataSourceId)
      }
    }

    const multiMapDsIds = []
    const firstMapInstance = this.firstMapInstance?.current
    const secondMapInstance = this.secondMapInstance?.current

    if (firstMapInstance && firstMapInstance.getViewType()) {
      multiMapDsIds.push(this.state.firstMapDsId)
    }

    if (secondMapInstance && secondMapInstance.getViewType()) {
      multiMapDsIds.push(this.state.secondMapDsId)
    }

    let isAllMatched = true
    for (let i = 0; i < multiMapDsIds.length; i++) {
      if (!this.mutableStatePropsMap[propKey].includes(multiMapDsIds[i])) {
        isAllMatched = false
        break
      }
    }

    if (isAllMatched) {
      delete this.mutableStatePropsMap[propKey]
      MutableStoreManager.getInstance().updateStateValue(this.props.baseWidgetProps.id, propKey, value)
    }
  }

  // callback of view.extent change
  onMapbaseExtentChanged = (dataSourceId: string, message: ExtentChangeMessage) => {
    const currentVisibleDsId = this.getCurrentVisibleDsId()

    if (currentVisibleDsId === dataSourceId) {
      const clonedViewpoint = message.viewpoint.clone()
      MessageManager.getInstance().publishMessage(message)

      // sync viewpoint of hidden mapbase
      let hiddenMapBase: MapBase = null

      if (this.state.firstMapDsId && this.state.firstMapDsId !== dataSourceId) {
        hiddenMapBase = this.firstMapInstance?.current
      } else if (this.state.secondMapDsId && this.state.secondMapDsId !== dataSourceId) {
        hiddenMapBase = this.secondMapInstance?.current
      }

      if (hiddenMapBase) {
        hiddenMapBase.setViewPoint(clonedViewpoint)
      }
    }
  }

  handleMapLoaded = (dataSourceId: string, mapLoadStatus: MapLoadStatus) => {
    this.forceUpdate()
  }

  handleJimuMapViewCreated = (jimuMapView: JimuMapView) => {
    if (this.props.onJimuMapViewCreated) {
      this.props.onJimuMapViewCreated(jimuMapView)
    }

    if (this.__unmount) {
      return
    }

    this.confirmJimuMapViewIsActive()
  }

  private getJimuMapViewByDataSourceId (dsId: string): JimuMapView {
    const jimuMapViewId = getJimuMapViewId(this.props.baseWidgetProps.id, dsId)
    const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapViewId)
    return jimuMapView
  }

  /**
   * Update this.state.currentJimuMapViewId by this.state.multiMapStyle and update JimuMapView.isActive by calling jimuMapView.setIsActive(isActive).
   */
  confirmJimuMapViewIsActive = () => {
    if (this.props.isDefaultMap) {
      const jimuMapView = this.getJimuMapViewByDataSourceId(null)
      if (jimuMapView) {
        this.setActiveJimuMapView(jimuMapView, true)
      }
      return
    }

    const allDatasourceIds = []
    this.state.firstMapDsId && allDatasourceIds.push(this.state.firstMapDsId)
    this.state.secondMapDsId && allDatasourceIds.push(this.state.secondMapDsId)
    const currentDataSourceId = this.getCurrentVisibleDsId()

    for (let i = 0; i < allDatasourceIds.length; i++) {
      const jimuMapView = this.getJimuMapViewByDataSourceId(allDatasourceIds[i])
      if (jimuMapView) {
        if (allDatasourceIds[i] === currentDataSourceId) {
          this.setActiveJimuMapView(jimuMapView, true)
        } else {
          this.setActiveJimuMapView(jimuMapView, false)
        }
      }
    }
  }

  setActiveJimuMapView (jimuMapView: JimuMapView, isActive: boolean) {
    if (isActive) {
      // jimuMapView is active
      jimuMapView.setIsActive(isActive)
      this.setState({
        currentJimuMapViewId: jimuMapView.id
      })

      if (this.props.onActiveJimuMapViewChange) {
        this.props.onActiveJimuMapViewChange(jimuMapView)
      }

      const baseWidgetProps = this.props?.baseWidgetProps

      if (baseWidgetProps) {
        // If current url active_datasource_id is empty, we should treat it as initialMapDataSourceID.
        let urlActiveDsId = baseWidgetProps.runtimeUrlHashParams?.active_datasource_id || baseWidgetProps.config.initialMapDataSourceID

        // initialMapDataSourceID only exists when useDataSources.length === 2, so initialMapDataSourceID maybe null.
        if (!urlActiveDsId) {
          // means runtimeUrlHashParams.active_datasource_id and config.initialMapDataSourceID are null
          const useDataSources = baseWidgetProps.useDataSources

          if (useDataSources && useDataSources.length === 1) {
            urlActiveDsId = useDataSources[0].dataSourceId
          }
        }

        if (!urlActiveDsId) {
          urlActiveDsId = ''
        }

        const newActiveDsId = jimuMapView.dataSourceId || ''

        if (newActiveDsId !== urlActiveDsId) {
          // active map changed
          // This is only used to determine whether to update the URL, and the persistent map state should not be updated here.
          updateViewUrlParamsForActiveJimuMapView(jimuMapView)
        }
      }
    } else {
      // jimuMapView is not active
      jimuMapView.setIsActive(isActive)
    }

    const surfaceDom = getViewSurfaceDom(jimuMapView?.view)

    if (surfaceDom) {
      const tabIndex = isActive ? '0' : '-1'
      surfaceDom.setAttribute('tabindex', tabIndex)

      if (isActive) {
        const a11yId = `${WIDGET_PREFIX_FOR_A11Y_SKIP}${this.props.baseWidgetProps.widgetId}`
        surfaceDom.setAttribute('id', a11yId)
      } else {
        surfaceDom.removeAttribute('id')
      }
    }
  }

  isShowMapSwitchBtn = (): boolean => {
    const firstMapInstance = this.firstMapInstance?.current
    const secondMapInstance = this.secondMapInstance?.current
    if (firstMapInstance && secondMapInstance) {
      if (firstMapInstance.getMapLoadStatus() !== MapLoadStatus.Loading && secondMapInstance.getMapLoadStatus() !== MapLoadStatus.Loading) {
        return true
      }
    } else {
      return false
    }
  }

  getCurrentVisibleDsId = () => {
    if (this.state.multiMapStyle[0].opacity === 1) {
      return this.state.firstMapDsId
    } else {
      return this.state.secondMapDsId
    }
  }

  handleViewGroupCreate = (viewGroup: JimuMapViewGroup) => {
    if (this.props.onViewGroupCreate) {
      this.props.onViewGroupCreate(viewGroup)
    }
  }

  handleMobilePanelContentChange = (mobilePanelContent: React.JSX.Element) => {
    this.setState({
      mobilePanelContent: mobilePanelContent
    })
  }

  handleActiveToolInfoChange = (activeToolInfo: ActiveToolInfo) => {
    this.setState({
      activeToolInfo: activeToolInfo
    })
  }

  getLayoutConfig (): LayoutJson {
    if (this.props.widthBreakpoint === 'xsmall') {
      return mobileLayoutJsons[0]
    } else {
      return this.props.baseWidgetProps.config.layoutIndex ? pcLayoutJsons[this.props.baseWidgetProps.config.layoutIndex] : pcLayoutJsons[0]
    }
  }

  render () {
    const mutiSourceMapDom = this.domRef.current
    const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(this.state.currentJimuMapViewId)

    return (
      <MultiSourceMapContext.Provider value={{
        mapWidgetId: this.props.baseWidgetProps.id,
        mapWidgetHeight: this.props.widgetHeight,
        isShowMapSwitchBtn: this.props.baseWidgetProps.useDataSources && this.props.baseWidgetProps.useDataSources.length > 1 && this.isShowMapSwitchBtn(),
        dataSourceIds: [this.state.firstMapDsId, this.state.secondMapDsId],
        activeDataSourceId: this.getCurrentVisibleDsId(),
        switchMap: this.switchMap,
        fullScreenMap: this.props.fullScreenMap,
        isFullScreen: this.props.isFullScreen,
        mobilePanelContainer: this.state.mobilePanelContainer,
        onMobilePanelContentChange: this.handleMobilePanelContentChange,
        initialMapState: this.props.baseWidgetProps.config && this.props.baseWidgetProps.config.initialMapState,
        theme: this.props.baseWidgetProps.theme
      }}
      >
        <div ref={this.domRef} className='w-100 h-100 multi-source-map'>
          {!this.props.isDefaultMap && <div className='w-100 h-100 multi-map-container' style={{ position: 'relative' }}>
            <div
              className={classNames('w-100 h-100 map1', {
                'multisourcemap-item-appear': this.state.useAnimation && this.state.multiMapStyle[0].opacity,
                'multisourcemap-item-disappear': this.state.useAnimation && !(this.state.multiMapStyle[0].opacity),
                'multisourcemap-item-appear-noanimate': this.state.multiMapStyle[0].opacity,
                'multisourcemap-item-disappear-noanimate': !(this.state.multiMapStyle[0].opacity)
              })}
              style={{ position: 'absolute', zIndex: this.state.multiMapStyle[0].zIndex }}
            >
              {
                this.state.firstMapDsId && this.props.isMapInVisibleArea &&
                <MapBase
                  ref={this.firstMapInstance}
                  baseWidgetProps={this.props.baseWidgetProps}
                  onMapLoaded={this.handleMapLoaded}
                  onMutableStatePropsChanged={this.handleMutableStatePropsChanged}
                  onExtentChanged={this.onMapbaseExtentChanged}
                  onJimuMapViewCreated={this.handleJimuMapViewCreated}
                  onActiveToolInfoChange={this.handleActiveToolInfoChange}
                  // onShowOnMapDataChanged={this.handleShowOnMapDataChange}
                  startLoadModules={this.props.startLoadModules}
                  dataSourceId={this.state.firstMapDsId}
                  widthBreakpoint={this.props.widthBreakpoint}
                  isMapInVisibleArea={this.props.isMapInVisibleArea}
                  multiSourceMapDom={mutiSourceMapDom}
                />
              }
            </div>
            <div
              className={classNames('w-100 h-100 map2', {
                'multisourcemap-item-appear': this.state.useAnimation && this.state.multiMapStyle[1].opacity,
                'multisourcemap-item-disappear': this.state.useAnimation && !(this.state.multiMapStyle[1].opacity),
                'multisourcemap-item-appear-noanimate': this.state.multiMapStyle[1].opacity,
                'multisourcemap-item-disappear-noanimate': !(this.state.multiMapStyle[1].opacity)
              })}
              style={{ position: 'absolute', zIndex: this.state.multiMapStyle[1].zIndex }}
            >
              {
                this.state.secondMapDsId && this.props.isMapInVisibleArea &&
                <MapBase
                  ref={this.secondMapInstance}
                  baseWidgetProps={this.props.baseWidgetProps}
                  onMapLoaded={this.handleMapLoaded}
                  onMutableStatePropsChanged={this.handleMutableStatePropsChanged}
                  onExtentChanged={this.onMapbaseExtentChanged}
                  onJimuMapViewCreated={this.handleJimuMapViewCreated}
                  onActiveToolInfoChange={this.handleActiveToolInfoChange}
                  startLoadModules={this.props.startLoadModules}
                  dataSourceId={this.state.secondMapDsId}
                  widthBreakpoint={this.props.widthBreakpoint}
                  isMapInVisibleArea={this.props.isMapInVisibleArea}
                  multiSourceMapDom={mutiSourceMapDom}
                />
              }
            </div>
          </div>}

          {this.props.isDefaultMap && <div className='w-100 h-100 default-map-container' style={{ position: 'relative' }}>
            <div
              className={classNames('w-100 h-100 multisourcemap-item-appear-noanimate default-map-mapbase-container')}
              style={{ position: 'absolute', zIndex: 'unset' }}
            >
              {
                this.props.isMapInVisibleArea &&
                <MapBase
                  ref={this.firstMapInstance}
                  isDefaultMap={this.props.isDefaultMap}
                  baseWidgetProps={this.props.baseWidgetProps}
                  onMapLoaded={this.handleMapLoaded}
                  onMutableStatePropsChanged={this.handleMutableStatePropsChanged}
                  dataSourceId={null}
                  onExtentChanged={this.onMapbaseExtentChanged}
                  onJimuMapViewCreated={this.handleJimuMapViewCreated}
                  onActiveToolInfoChange={this.handleActiveToolInfoChange}
                  startLoadModules={this.props.startLoadModules}
                  widthBreakpoint={this.props.widthBreakpoint}
                  isMapInVisibleArea={this.props.isMapInVisibleArea}
                  defaultMapInfo={this.props.defaultMapInfo}
                  multiSourceMapDom={mutiSourceMapDom}
                />
              }
            </div>
          </div>}

          {
            this.state.currentJimuMapViewId &&
            <MapFixedLayout
              jimuMapView={jimuMapView}
              appMode={this.props.baseWidgetProps.appMode}
              layouts={this.props.baseWidgetProps.layouts}
              LayoutEntry={this.props.baseWidgetProps.builderSupportModules && this.props.baseWidgetProps.builderSupportModules.LayoutEntry}
              widgetManifestName={this.props.baseWidgetProps.manifest.name}
            />
          }

          {/* We only render MapToolLayout when jimuMapView is not empty, so map tool doesn't need to check props.jimuMapView is empty or not. */}
          {
            this.state.currentJimuMapViewId && jimuMapView &&
            <MapToolLayout
              mapWidgetId={this.props.baseWidgetProps.id}
              isMobile={this.props.widthBreakpoint === 'xsmall'}
              jimuMapView={jimuMapView}
              appMode={this.props.baseWidgetProps.appMode}
              layouts={this.props.baseWidgetProps.layouts}
              intl={this.props.baseWidgetProps.intl}
              LayoutEntry={this.props.baseWidgetProps.builderSupportModules && this.props.baseWidgetProps.builderSupportModules.LayoutEntry}
              layoutConfig={this.getLayoutConfig()}
              toolConfig={this.props.baseWidgetProps.config.toolConfig ? this.props.baseWidgetProps.config.toolConfig : {}}
              toolOptions={this.props.baseWidgetProps.config.toolOptions}
              activeToolInfo={this.state.activeToolInfo}
              onActiveToolInfoChange={this.handleActiveToolInfoChange} theme={this.props.baseWidgetProps.theme}
              widgetManifestName={this.props.baseWidgetProps.manifest.name}
              widgetHeight={this.props.widthBreakpoint === 'xsmall' ? null : this.props.widgetHeight}
              autoControlWidgetId={this.props.autoControlWidgetId}
              mapComponentsLoaded={this.props.mapComponentsLoaded}
              mapRootClassName={this.props.mapRootClassName}
              onMouseOverPopper={this.onMouseOverPopper}
              onMouseOutPopper={this.onMouseOutPopper}
            />
          }

          <JimuMapViewComponent useMapWidgetId={this.useMapWidgetIds?.[0]} onViewGroupCreate={this.handleViewGroupCreate} />
          <ReactResizeDetector targetRef={this.domRef} handleHeight handleWidth onResize={this.onResize} />
        </div>
      </MultiSourceMapContext.Provider>
    )
  }
}
