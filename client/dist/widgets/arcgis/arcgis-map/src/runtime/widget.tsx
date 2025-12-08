/** @jsx jsx */
import {
  React, ReactDOM, css, jsx, getAppStore, type AllWidgetProps, SessionManager, type DataRecordSet, TimezoneConfig, AppMode, type IMState,
  classNames, ReactResizeDetector, MutableStoreManager, type IMUrlParameters, type DataSource, ExBAddedJSAPIProperties, DataSourceManager,
  AppStateManager, UrlManager, ViewVisibilityContext, loadArcGISMapComponents, PageVisibilityContext, type FeatureDataRecord
} from 'jimu-core'
import type { IMConfig } from '../config'
import MultiSourceMap from './components/multisourcemap'
import DefaultMap from './components/default-map'
import { checkIsLive, isFullscreenEnabled, getFullscreenElement, requestFullscreen, exitFullscreen } from './utils'
import {
  type JimuMapViewGroup, type ShowOnMapDatas, type AddToMapDatas, type JimuMapView, type JimuLayerView,
  DataChangeStatus, loadArcGISJSAPIModules, MapViewManager, type MarkerGroup, type UnparsedMapUrlParams
} from 'jimu-arcgis'
import { ViewportVisibilityContext } from 'jimu-layouts/layout-runtime'
import { versionManager } from '../version-manager'
import { Loading, LoadingType, Icon, DataActionList, DataActionListStyle, Paper } from 'jimu-ui'
import type { ZoomToFeatureActionValue } from '../message-actions/zoom-to-feature-action'
import type { PanToActionValue } from '../message-actions/pan-to-action'
import defaultMessages from './translations/default'
import { Global } from 'jimu-theme'
import { mapCommonStyles } from 'jimu-ui/advanced/lib/map/styles/components/map-common'

export interface ActionRelatedProps {
  zoomToFeatureActionValue?: ZoomToFeatureActionValue
  panToActionValue?: PanToActionValue
  flashActionValue?: {
    layerDataSourceId: string
    querySQL: string
  }
  filterActionValue?: {
    layerDataSourceId: string
    querySQL: string
  }
  showOnMapDatas?: ShowOnMapDatas
  addToMapDatas?: AddToMapDatas
  addMarkerData?: MarkerGroup
}

interface ExtraMapWidgetProps {
  mutableStateProps?: ActionRelatedProps
  appMode: AppMode
  isPrintPreview: boolean
  queryObject: IMUrlParameters
  autoControlWidgetId: string
  isRunAppMode: boolean
  // persistent map state
  runtimePersistentMapState: UnparsedMapUrlParams
  // real url params
  realRuntimeUrlHashParams: UnparsedMapUrlParams
  // persistent map state or the real url params
  runtimeUrlHashParams: UnparsedMapUrlParams
  mapTimeZone: string
}

export type MapWidgetProps = AllWidgetProps<IMConfig> & ExtraMapWidgetProps

interface State {
  startLoadModules: boolean
  widthBreakpoint: string
  widgetHeight: number
  // true means map is in full screen mode, isFullScreen is recursively passed to fullscreen.tsx, used to control the icon of the fullscreen tool
  isFullScreen: boolean
  dataActionDataSet: DataRecordSet
  mapComponentsLoaded: boolean
}

// .map-component-container:fullscreen takes effect when map enters the real full screen mode.
// .fake-fullscreen-map takes effect when map enters the fake full screen mode.
// The global style of .fake-fullscreen-map is used to support the fake full screen for iPhone browsers.
// If the browser supports full screen API, we don't add the .fake-fullscreen-map class for this.container.
const fakeFullscreenClassName = 'fake-fullscreen-map'

export default class Widget extends React.PureComponent<MapWidgetProps, State> {
  parentContainer: HTMLElement
  container = React.createRef<HTMLDivElement>()
  containerClientRect: ClientRect | DOMRect
  multiSourceMapInstance: MultiSourceMap = null
  activeJimuMapView: JimuMapView = null
  watchSelectedFeatureHandle: __esri.WatchHandle = null
  dataActionListContainer: HTMLElement = null
  reactiveUtils: typeof __esri.reactiveUtils = null
  popupDomNodeObserver: MutationObserver = null
  readonly warningIcon: string
  readonly mapRootClassName: string

  constructor (props) {
    super(props)
    this.warningIcon = `<svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.09926 5.37004C7.04598 4.83729 7.46434 4.375 7.99975 4.375C8.53516 4.375 8.95353 4.83728 8.90025 5.37004L8.5495 8.87748C8.52126 9.15992 8.2836 9.375 7.99975 9.375C7.71591 9.375 7.47825 9.15992 7.45 8.87748L7.09926 5.37004Z" fill="#938500"/>
                        <path d="M7.99975 12.375C8.55204 12.375 8.99975 11.9273 8.99975 11.375C8.99975 10.8227 8.55204 10.375 7.99975 10.375C7.44747 10.375 6.99975 10.8227 6.99975 11.375C6.99975 11.9273 7.44747 12.375 7.99975 12.375Z" fill="#938500"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M1.66642 14.375C0.9115 14.375 0.428811 13.5705 0.784067 12.9044L7.1174 1.02941C7.49387 0.323529 8.50564 0.323529 8.88211 1.02941L15.2154 12.9044C15.5707 13.5705 15.088 14.375 14.3331 14.375H1.66642ZM1.66642 13.375L7.99975 1.5L14.3331 13.375H1.66642Z" fill="#938500"/>
                        </svg>`
    this.state = {
      startLoadModules: false,
      widthBreakpoint: null,
      widgetHeight: null,
      isFullScreen: false,
      dataActionDataSet: null,
      mapComponentsLoaded: false
    }

    this.mapRootClassName = `map-widget-root-${props.widgetId}`
    this.dataActionListContainer = document.createElement('div')
    this.dataActionListContainer.className = 'data-action-list-wrapper'

    this.loadReactiveUtils()
  }

  getWidgetGlobalStyle () {
    const overrideMapStyles = mapCommonStyles(this.props.theme, this.mapRootClassName)

    // .map-component-container:fullscreen takes effect when map enters the real full screen mode.
    // .fake-fullscreen-map takes effect when map enters the fake full screen mode.
    // The global style of .fake-fullscreen-map is used to support the fake full screen for iPhone browsers.
    // If the browser supports full screen API, we don't add the .fake-fullscreen-map class for this.container.

    return css`
     ${overrideMapStyles}

    /*
      Position fixed doesn't work when using transform
      https://stackoverflow.com/questions/2637058/position-fixed-doesnt-work-when-using-webkit-transform
      Need to clear the transform of this.container's all ancestors.
      We also need  to make sure all ancestors have fixed position, otherwise strange behavior may occur on iPhone browsers of iOS 17.7.1.
    */
    *:has(.fake-fullscreen-map) {
      transform: none !important;
      position: fixed !important;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 1;
    }

    /*
      Put the map widget into a widget controller and open the map widget from widget controller on mobile devices, you can see the map widget is placed at a MobilePanel.
      After click the full screen map tool, you can see the close button of MobilePanel overlaps the map widget.
      To solve the above case, we need to update the z-index of widget-content.
    */
    .widget-renderer > .widget-content:has(.fake-fullscreen-map) {
      z-index: 1;
    }

    body.jimu-keyboard-nav .esri-view-surface:focus {
      outline-offset: -2px;
    }
    `
  }

  getWidgetStyle () {
    return css`
      /* overflow-hidden is needed, otherwise map canvas doesn't show round corder when widget uses border radius */
      overflow: hidden;

      /*
        If the initial zoom of map is small (e.g. zoom is 0), map tiles can't cover all the map widget.
        When the above map enter real full screen mode, the blank area of map shows black. So we need to update the map's background color for full screen mode.
        https://stackoverflow.com/questions/16163089/background-element-goes-black-when-entering-fullscreen-with-html5
      */
      .map-component-container:fullscreen {
        background: white;

        /*
          case1: When map is not in real full screen mode, document.fullscreenElement is null and popper is placed into document.body. So, the popper of map tool is above map popup as expected.
          case2: When map is in real full screen mode, document.fullscreenElement is this.container and popper is placed into this.container.
                 The default z-index of popper is 1, but z-index of .esri-popup is 9, so the popper of map tool is below .esri-popup. This is not expected.
          We need to add the following css to fix case2 for both pc layout tool (.map-tool-popper), mobile layout tool (.map-tool-mobile-panel) and other widget's Popper or MobilePanel (.popper[role="dialog"]).
          If fact, if we set .popper[role="dialog"], we don't need to set .map-tool-popper and .map-tool-mobile-panel, but we can still keep it here.
          The className of normal Popper is 'popper' and the className of MobilePanel is 'popper mobile-panel-popper'. The role attribute of both normal Popper and MobilePanel is 'dialog'.
        */
        .map-tool-popper, .map-tool-mobile-panel, .popper[role="dialog"], .popper.jimu-dropdown-menu {
          z-index: 9 !important;
        }
      }

      /*
        .fake-fullscreen-map is used to support the fake full screen for iPhone browsers.
      */
      .fake-fullscreen-map {
        position: fixed !important;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: white;
      }

      /*
        Put map widget2 into map widget1. Both map widgets enable full screen tool. After click the full screen tool of map widget2, you can see the map tools of map widget1 overlap map widget2.
        To solve the above case, we need to hide the map-tool-layout of map widget1.
      */
      .multi-source-map:has(.fake-fullscreen-map) > .map-tool-layout {
        display: none;
      }

      .map-loading-bar {
        z-index: 8;
      }

      .map-warning-bar {
        z-index: 8;
        position: absolute;
        bottom: 4px;
        left: 4px;
        right: 4px;
        height: 35px;
        background: #fffdeb;
        border: 1px solid #fff592;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .warning-icon {
          width: 14px;
          margin: 0 12px 0 12px;
        }
      }

      .map-fix-layout {
        position: absolute !important;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 7;
        pointer-events: none;
      }

      .hide-map-tools-layout .map-tool-layout{
        display: none;
      }

      /*
        API 4.31 original css for .esri-ui
        z-index: 0;
        container-name: none; // not set, use browser default value
        container-type: normal; // not set, use browser default value

        API 4.32 original css for .esri-ui
        z-index: 0;
        container-name: esri-view-canvas;
        container-type: size;
        contain: layout;
      */

      /* make sure only popup (exclude other components in esri-ui, like swipe) over map tools and other widgets */
      .esri-view-root > .esri-ui:has(.esri-popup) {
        /*
        In API 4.31 and earlier versions, contain has a default value of 'none', and .esri-ui .esri-popup { z-index: 9; } can make the popup appear above the widget and map tool.
        However, starting from API 4.32, the value of contain is set to 'layout' by API to improve the layout performance of .esri-ui,
        but this makes .esri-ui .esri-popup { z-index: 9; } invalid. In order to solve the popup z-index problem, we need to reset the value of contain to 'none' and set z-index to unset.
        Note, both z-index:unset and z-index:9 work, but z-index:9 causes the entire .esri-ui to overlap the map tools div, causing issue 27306. z-index:unset does not cause this issue.
        */
        contain: none;
        z-index: unset;

        /* In API 4.32, API adds css .esri-ui{ container: esri-view-canvas/size; }.
        This results in the .esri-ui .esri-popup { z-index: 9; } not taking effect on some old browsers (iPad 18.31 Safari/Chrome, Xiaomi browser, Android Chrome 105, etc.) and the above css (contain: none; z-index: unset;) doesn't work,
        causing the popup to be covered by map tools and widgets on these older browsers.
        In order to adapt to these old browsers, we must also need to reset container-name and container-type. */
        container-name: none;
        container-type: normal;
      }

      .esri-ui-manual-container .esri-swipe {
        z-index: 0;
      }

      /* make sure only popup (exclude other components in esri-ui, like swipe) over map tools and other widgets */
      .esri-ui .esri-popup {
        z-index: 9;
      }

      /* The z-index of inactive map is -1. So the inactive map is covered by Paper widget background color. In most cases, it works fine.
         But when enable Swipe widget between two webmaps, the inactive map is not visible. This is not expected.
         To solve this issue, we need to set widget background to transparent for this case.
       */
      :has(.jimu-widget-swipe-handle-container) {
        background: transparent;
      }

      .esri-features .esri-feature-content a[href] {
        text-decoration-line: underline;
      }

      .data-action-list-wrapper {
        margin: 3px;
      }
    `
  }

  getInnerContentStyle () {
    const theme = this.props.theme

    return css`
      position: relative;

      .map-is-live-mode {
        .exbmap-ui {
          pointer-events: auto !important;
        }

        .is-widget {
          pointer-events: auto !important;
        }
      }

      .widget-map-usemask {
        pointer-events: auto !important;
      }

      .map-is-design-mode {
        .exbmap-ui,
        .exbmap-ui-tool {
          pointer-events: none !important;
        }

        .is-widget {
          pointer-events: auto !important;
        }
      }

      .widget-map{
        padding: 0;
        margin: 0;
        height: 100%;
        width: 100%;
        z-index: -1;
        .overview-container{
          position: absolute;
          top: 12px;
          right: 12px;
          width: 300px;
          height: 200px;
          border: 1px solid black;
          z-index: 1;
        }

        .extent-container{
          background-color: rgba(0, 0, 0, 0.5);
          position: absolute;
          z-index: 2;
        }

        .extent-btn-container{
          button{
            outline: none;
          }
          .previous-extent-btn{
            color: #111;
          }
          .next-extent-btn{
            color: #222;
          }
        }
      }

      .mapswitch-container {
        position: absolute;
        z-index: 7;
        width: 32px;
        height: 32px;
        bottom: 10px;
        left: 10px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3)
      }

      .mapswitch-icon {
        fill: black;
        left: 8px;
        top: 8px;
        position: absolute;
        display: block;
      }

      .widget-map-background {
        background-color: ${theme.sys.color.surface.paper};
        position: absolute;
        z-index: 1;
      }

      @keyframes appear {
        0%{opacity:0}
        25%{opacity:.25}
        50%{opacity:.5;}
        75%{opacity:.75}
        100%{opacity:1;}
      }

      @keyframes disappear {
        0%{opacity:1}
        25%{opacity:.75}
        50%{opacity:.5;}
        75%{opacity:.25}
        100%{opacity:0;}
      }

      .multisourcemap-item-appear {
        animation: appear 300ms;
        -webkit-animation: appear 300ms;
        -moz-animation: appear 300ms;
        animation-fill-mode: forwards;
        -webkit-animation-fill-mode: forwards;
        -moz-animation-fill-mode: forwards;
        animation-timing-function: ease-in;
        -webkit-animation-timing-function: ease-in;
        -moz-animation-timing-function: ease-in;
      }

      .multisourcemap-item-disappear {
        animation: disappear 300ms;
        -webkit-animation: disappear 300ms;
        -moz-animation: disappear 300ms;
        animation-fill-mode: forwards;
        -webkit-animation-fill-mode: forwards;
        -moz-animation-fill-mode: forwards;
        animation-timing-function: ease-in;
        -webkit-animation-timing-function: ease-in;
        -moz-animation-timing-function: ease-in;
      }

      .multisourcemap-item-appear-noanimate {
        opacity: 1;
      }

      .multisourcemap-item-disappear-noanimate {
        opacity: 0;
      }
      `
  }

  static versionManager = versionManager

  static cachedInitPersistentMapStates: { [mapWidgetId: string]: UnparsedMapUrlParams } = {}

  static mapExtraStateProps = (state: IMState, props: AllWidgetProps<IMConfig>): ExtraMapWidgetProps => {
    let autoControlWidgetId = ''

    const mapWidgetId = props.id

    if (state.mapWidgetsInfo && mapWidgetId) {
      autoControlWidgetId = state.mapWidgetsInfo[mapWidgetId]?.autoControlWidgetId || ''
    }

    const appMode = state && state.appRuntimeInfo && state.appRuntimeInfo.appMode
    const isRunAppMode = appMode === AppMode.Run

    // calculate realRuntimeUrlHashParams
    let realRuntimeUrlHashParams: UnparsedMapUrlParams = null

    if (isRunAppMode && state.urlHashObject) {
      realRuntimeUrlHashParams = state.urlHashObject[mapWidgetId]
    }

    // calculate runtimePersistentMapState
    // Use this.persistentMapStates to cache persistentMapState to make sure persistentMapState never change
    if (!this.cachedInitPersistentMapStates) {
      this.cachedInitPersistentMapStates = {}
    }

    if (!(mapWidgetId in this.cachedInitPersistentMapStates)) {
      let persistentMapState: UnparsedMapUrlParams = null
      const appStateManager = AppStateManager.getInstance()

      if (isRunAppMode && appStateManager.isLocalStateRestored()) {
        persistentMapState = appStateManager.getLastLocalState(mapWidgetId) || null
      }

      this.cachedInitPersistentMapStates[mapWidgetId] = persistentMapState
    }

    const runtimePersistentMapState = this.cachedInitPersistentMapStates[mapWidgetId] || null

    // PersistentMapState has higher priority than Url params.
    const runtimeUrlHashParams = runtimePersistentMapState || realRuntimeUrlHashParams

    // MapView.timeZone
    let mapTimeZone: string = ''

    const timeZoneInfo = state.appConfig?.attributes?.timezone

    if (timeZoneInfo) {
      // user sets timeZone info in ExB
      if (timeZoneInfo.type === TimezoneConfig.Device) {
        mapTimeZone = 'system'
      } else if (timeZoneInfo.type === TimezoneConfig.Specific) {
        mapTimeZone = timeZoneInfo.value
      } else if (timeZoneInfo.type === TimezoneConfig.Data) {
        // set mapTimeZone to empty, means we need to uses MapViewer's timeZone
        mapTimeZone = ''
      }
    } else {
      // if user doesn't set timeZone info in ExB, we should use 'system' for compatibility
      mapTimeZone = 'system'
    }

    return {
      appMode: appMode,
      isPrintPreview: state.appRuntimeInfo.isPrintPreview,
      queryObject: state.queryObject,
      autoControlWidgetId,
      isRunAppMode,
      runtimePersistentMapState,
      realRuntimeUrlHashParams,
      runtimeUrlHashParams,
      mapTimeZone
    }
  }

  startRenderMap = () => {
    setTimeout(() => {
      this.setState({
        startLoadModules: true
      })
    }, 100)
  }

  componentDidMount () {
    if (!this.state.startLoadModules) {
      if (window.jimuConfig.isInBuilder || !this.props.config.canPlaceHolder) {
        this.startRenderMap()
      }
    }

    // iPhone doesn't support fullscreenchange event. iPad only supports webkitfullscreenchange event.
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChangeHandler) // for iPad
    document.addEventListener('fullscreenchange', this.onFullscreenChangeHandler)

    setTimeout(() => {
      // If runtimePersistentMapState is not empty, it means that map is initialized by persistent map state, so need to update url params by it.
      const runtimePersistentMapState = this.props?.runtimePersistentMapState
      const mapWidgetId = this.props?.id

      if (runtimePersistentMapState && mapWidgetId) {
        const urlManager = UrlManager.getInstance()
        urlManager.setWidgetUrlParams(mapWidgetId, runtimePersistentMapState)
      }
    }, 10)

    loadArcGISMapComponents().then(() => {
      this.setState({
        mapComponentsLoaded: true
      })
    }).catch((err) => {
      console.error('loadArcGISMapComponents error', err)
      this.setState({
        mapComponentsLoaded: false
      })
    })
  }

  componentDidUpdate (prevProps: MapWidgetProps, prevState: State) {
    // check if props.state changed or not
    const preWidgetState = prevProps.state
    const currWidgetState = this.props.state
    if (preWidgetState !== currWidgetState) {
      const jimuMapViews = this.getJimuMapViews()
      jimuMapViews.forEach((jimuMapView) => {
        jimuMapView.setMapWidgetState(currWidgetState)
      })
    }

    // check if props.config.showPopupUponSelection changed or not
    const preShowPopupUponSelection = !!(prevProps?.config?.showPopupUponSelection)
    const curShowPopupUponSelection = !!(this.props?.config?.showPopupUponSelection)

    if (preShowPopupUponSelection !== curShowPopupUponSelection) {
      const jimuMapViews = this.getJimuMapViews()
      jimuMapViews.forEach((jimuMapView) => {
        this.setShowPopupUponSelectionForJimuMapView(jimuMapView)
      })
    }

    // check if props.enableDataAction changed or not
    const preEnableDataAction = prevProps?.enableDataAction
    const currEnableDataAction = this.props.enableDataAction

    if (preEnableDataAction !== currEnableDataAction) {
      // console.log('enableDataAction changed')
      this.handleDataActionWhenPopupSelectedFeatureChange(this.activeJimuMapView)
    }
  }

  componentWillUnmount () {
    // iPhone doesn't support fullscreenchange event. iPad only supports webkitfullscreenchange event.
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChangeHandler) // for iPad
    document.removeEventListener('fullscreenchange', this.onFullscreenChangeHandler)

    const widgets = getAppStore().getState().appConfig.widgets

    if (!widgets[this.props.id]) {
      MutableStoreManager.getInstance().updateStateValue(this.props.id, 'restoreData', null)
    }
  }

  getJimuMapViews (): JimuMapView[] {
    let jimuMapViews: JimuMapView[] = []

    const jimuMapViewGroup = MapViewManager.getInstance().getJimuMapViewGroup(this.props.id)

    if (jimuMapViewGroup) {
      jimuMapViews = jimuMapViewGroup.getAllJimuMapViews()
    }

    return jimuMapViews
  }

  getPlaceHolderImage = () => {
    let placeHolderImage = this.props.config.placeholderImage
    const session = SessionManager.getInstance().getMainSession()
    if (placeHolderImage) {
      const isPortalThumbExp = new RegExp('^(.)+/sharing/rest/content/items/(.)+/info/(.)+')

      if (isPortalThumbExp.test(placeHolderImage)) {
        if (session) {
          placeHolderImage = placeHolderImage + `?token=${session.token}`
        } else {
          // eslint-disable-next-line no-self-assign
          placeHolderImage = placeHolderImage
        }
      }
    }

    return placeHolderImage
  }

  onFullscreenChangeHandler = (event) => {
    const fullscreenElement = getFullscreenElement()

    const isCurrentMapFullScreen = fullscreenElement && fullscreenElement === this.container.current

    this.setState({
      isFullScreen: isCurrentMapFullScreen
    })
  }

  // toggle map full screen mode
  fullScreenMap = () => {
    const fullscreenEnabled = isFullscreenEnabled()

    if (fullscreenEnabled) {
      // The browser supports full screen API.
      const fullscreenElement = getFullscreenElement()

      if (fullscreenElement === this.container.current) {
        // Don't need to call this.setState({isFullScreen: false}) here, because we will do it in this.onFullscreenChangeHandler.

        // Currently, map is in full screen mode. Map will exit full screen mode.
        exitFullscreen()
      } else {
        // Don't need to call this.setState({isFullScreen: true}) here, because we will do it in this.onFullscreenChangeHandler.

        // Currently, map is not in full screen mode. Map will enter full screen mode.
        requestFullscreen(this.container.current)
      }
    } else {
      // The browser doesn't support full screen API, the typical cases is iPhone.
      // All browsers on iPhone doesn't support fullscreen API, so need to support fullscreen for iPhone by hacking.

      if (this.container.current.classList.contains(fakeFullscreenClassName)) {
        // Currently, map is in full screen mode. Map will exit full screen mode.
        this.container.current.classList.remove(fakeFullscreenClassName)

        this.setState({
          isFullScreen: false
        })
      } else {
        // Currently, map is not in full screen mode. Map will enter full screen mode.
        this.container.current.classList.add(fakeFullscreenClassName)

        this.setState({
          isFullScreen: true
        })
      }
    }
  }

  handleViewGroupCreate = (viewGroup: JimuMapViewGroup) => {
    if (viewGroup) {
      viewGroup.setMapWidgetInstance(this)
    }
  }

  onJimuMapViewCreated = (jimuMapView: JimuMapView) => {
    jimuMapView.setMapWidgetState(this.props.state)
    this.setShowPopupUponSelectionForJimuMapView(jimuMapView)
  }

  onActiveJimuMapViewChange = (jimuMapView: JimuMapView) => {
    this.activeJimuMapView = jimuMapView
    this.watchPopupSelectedFeatureChange()
  }

  setShowPopupUponSelectionForJimuMapView (jimuMapView: JimuMapView) {
    if (jimuMapView) {
      jimuMapView.setShowPopupUponSelection(!!this.props.config.showPopupUponSelection)
    }
  }

  switchMap = async (ignoreSwitchAnimation = false): Promise<any> => {
    if (this.multiSourceMapInstance) {
      return await this.multiSourceMapInstance.switchMap(ignoreSwitchAnimation)
    } else {
      await Promise.resolve()
    }
  }

  setMultiSourceMapInstance = (instance: MultiSourceMap) => {
    this.multiSourceMapInstance = instance
  }

  onResize = ({ width, height }) => {
    if (!width || !height) {
      return
    }

    if (width <= 545 && width > 0) {
      this.setState({
        widthBreakpoint: 'xsmall',
        widgetHeight: height
      })
    } else {
      this.setState({
        widthBreakpoint: 'other',
        widgetHeight: height
      })
    }
  }

  isLoadingDisplayed = () => {
    const addToMapDatas: AddToMapDatas = this.props.mutableStateProps?.addToMapDatas || {}
    return Object.values(addToMapDatas).some(value => value?.dataChangeStatus === DataChangeStatus.Pending)
  }

  isWarningDisplayed = () => {
    const addToMapDatas: AddToMapDatas = this.props.mutableStateProps?.addToMapDatas || {}
    return Object.values(addToMapDatas).some(value => value?.dataChangeStatus === DataChangeStatus.Rejected)
  }

  getInnerContent = (isMapInVisibleArea: boolean) => {
    if (!this.state.startLoadModules) {
      return (
        <div css={this.getInnerContentStyle()} className='w-100 h-100'>
          <div className='widget-map w-100 h-100'>
            <div style={{ position: 'absolute', left: '50%', top: '50%' }} className='jimu-secondary-loading' />
          </div>
        </div>
      )
    } else {
      if (!(this.props.useDataSources && this.props.useDataSources[0] && this.props.useDataSources[0].dataSourceId)) {
        return (
          <div className='w-100 h-100' ref={ref => { this.parentContainer = ref }}>
            <div
              css={this.getInnerContentStyle()} className='w-100 h-100 map-component-container'
              ref={this.container}
            >
              <div className={classNames('w-100 h-100', { 'map-is-design-mode': !checkIsLive(this.props.appMode) })}>
                <DefaultMap
                  fullScreenMap={this.fullScreenMap}
                  baseWidgetProps={this.props}
                  startLoadModules={this.state.startLoadModules}
                  isDefaultMap
                  setMultiSourceMapInstance={this.setMultiSourceMapInstance}
                  onViewGroupCreate={this.handleViewGroupCreate}
                  onJimuMapViewCreated={this.onJimuMapViewCreated}
                  onActiveJimuMapViewChange={this.onActiveJimuMapViewChange}
                  widgetHeight={this.state.widgetHeight}
                  widthBreakpoint={this.state.widthBreakpoint}
                  isFullScreen={this.state.isFullScreen}
                  isMapInVisibleArea={isMapInVisibleArea}
                  autoControlWidgetId={this.props.autoControlWidgetId}
                  mapComponentsLoaded={this.state.mapComponentsLoaded}
                  mapRootClassName={this.mapRootClassName}
                >
                </DefaultMap>
              </div>
              <ReactResizeDetector targetRef={this.container} handleWidth handleHeight onResize={this.onResize} />
            </div>
          </div>
        )
      } else {
        return (
          <div className='w-100 h-100' ref={ref => { this.parentContainer = ref }}>
            <div
              css={this.getInnerContentStyle()} className='w-100 h-100 map-component-container'
              ref={this.container}
            >
              <div className={classNames('w-100 h-100', { 'map-is-design-mode': !checkIsLive(this.props.appMode) })}>
                {this.props.useDataSources.length >= 1 &&
                  <MultiSourceMap
                    key={1}
                    fullScreenMap={this.fullScreenMap}
                    baseWidgetProps={this.props}
                    startLoadModules={this.state.startLoadModules}
                    ref={this.setMultiSourceMapInstance}
                    onViewGroupCreate={this.handleViewGroupCreate}
                    onJimuMapViewCreated={this.onJimuMapViewCreated}
                    onActiveJimuMapViewChange={this.onActiveJimuMapViewChange}
                    widgetHeight={this.state.widgetHeight}
                    widthBreakpoint={this.state.widthBreakpoint}
                    isFullScreen={this.state.isFullScreen}
                    isMapInVisibleArea={isMapInVisibleArea}
                    autoControlWidgetId={this.props.autoControlWidgetId}
                    mapComponentsLoaded={this.state.mapComponentsLoaded}
                    mapRootClassName={this.mapRootClassName}
                  />}
              </div>
              <ReactResizeDetector targetRef={this.container} handleWidth handleHeight onResize={this.onResize} />
            </div>
          </div>
        )
      }
    }
  }

  getCurrentPopupSelectedFeature (): __esri.Graphic {
    return this.activeJimuMapView?.view?.popup?.selectedFeature
  }

  async loadReactiveUtils () {
    [this.reactiveUtils] = await loadArcGISJSAPIModules(['esri/core/reactiveUtils']) as [typeof __esri.reactiveUtils]
    this.watchPopupSelectedFeatureChange()
  }

  watchPopupSelectedFeatureChange () {
    if (this.watchSelectedFeatureHandle) {
      this.watchSelectedFeatureHandle.remove()
      this.watchSelectedFeatureHandle = null
    }

    const activeJimuMapView = this.activeJimuMapView

    if (!activeJimuMapView || !this.reactiveUtils) {
      return
    }

    if (this.getCurrentPopupSelectedFeature()) {
      this.handleDataActionWhenPopupSelectedFeatureChange(activeJimuMapView)
    }

    this.watchSelectedFeatureHandle = this.reactiveUtils.watch(() => activeJimuMapView?.view?.popup?.selectedFeature, () => {
      this.handleDataActionWhenPopupSelectedFeatureChange(activeJimuMapView)
    })
  }

  async handleDataActionWhenPopupSelectedFeatureChange (activeJimuMapView: JimuMapView) {
    const popup = activeJimuMapView?.view?.popup
    const originalSelectedFeature = popup?.selectedFeature

    // firstly, we need to remove dataActionListContainer from popup domNode,
    // when state.dataActionDataSet is ready, we can add dataActionListContainer to popup domNode
    if (this.dataActionListContainer.parentNode) {
      this.dataActionListContainer.parentNode.removeChild(this.dataActionListContainer)
    }

    this.releasePopupDomNodeObserver()

    await this.updateDataActionDataSet(null)

    const isDataActionEnabled = this.isDataActionEnabled()

    if (isDataActionEnabled && originalSelectedFeature) {
      const dataActionDataSet = await this.getDataActionDataSet(activeJimuMapView, originalSelectedFeature)

      // getDataActionDataSet may take a long time, so we need to check should we go on or not
      if (this.getCurrentPopupSelectedFeature() !== originalSelectedFeature) {
        return
      }

      await this.updateDataActionDataSet(dataActionDataSet)

      if (this.getCurrentPopupSelectedFeature() !== originalSelectedFeature) {
        return
      }

      this.watchPopupDomNodeChange(popup)
    }
  }

  updateDataActionDataSet (dataActionDataSet: DataRecordSet): Promise<void> {
    return new Promise((resolve) => {
      this.setState({
        dataActionDataSet
      }, () => {
        resolve()
      })
    })
  }

  releasePopupDomNodeObserver () {
    if (this.popupDomNodeObserver) {
      this.popupDomNodeObserver.disconnect()
      this.popupDomNodeObserver = null
    }
  }

  watchPopupDomNodeChange (popup: __esri.Popup) {
    this.releasePopupDomNodeObserver()

    const popupDomNode = ((popup as any).domNode || (popup as any).container) as HTMLElement

    this.tryAppendDataActionListDomNodeToPopup(popupDomNode)

    const config = {
      childList: true,
      subtree: true
    }

    const callback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          this.tryAppendDataActionListDomNodeToPopup(popupDomNode)
        }
      }
    }

    const observer = new MutationObserver(callback)
    observer.observe(popupDomNode, config)
    this.popupDomNodeObserver = observer
  }

  tryAppendDataActionListDomNodeToPopup (popupDomNode: HTMLElement) {
    const selector = 'calcite-action-bar[slot="action-bar"]'
    const popupActionsContainer = popupDomNode.querySelector(selector)

    if (popupActionsContainer && !popupActionsContainer.contains(this.dataActionListContainer)) {
      // this.dataActionListContainer is not in popup
      if (this.state.dataActionDataSet) {
        // DataActionList domNode is ready, we can add it to popup domNode now
        if (this.dataActionListContainer.parentNode) {
          this.dataActionListContainer.parentNode.removeChild(this.dataActionListContainer)
        }

        // append this.dataActionListContainer into popupActionsContainer as the first child
        if (popupActionsContainer.firstChild) {
          popupActionsContainer.insertBefore(this.dataActionListContainer, popupActionsContainer.firstChild)
        } else {
          popupActionsContainer.appendChild(this.dataActionListContainer)
        }
      }
    }
  }

  async getDataActionDataSet (jimuMapView: JimuMapView, selectedFeature: __esri.Graphic) {
    let layerDataSource: DataSource = null

    // Before API 4.33, when a feature in a SceneLayer is selected by clicking in the Map, view.popup.selectedFeature.geometry is null.
    // However, in API 4.33, view.popup.selectedFeature.geometry is no longer null, but a Mesh.
    // Currently, data actions do not support processing Mesh. In order to avoid regression issues, we need to reset geometry to null here.
    if (selectedFeature?.geometry?.declaredClass === 'esri.geometry.Mesh') {
      const originalSelectedFeature = selectedFeature
      selectedFeature = originalSelectedFeature.clone()
      selectedFeature.geometry = null
      selectedFeature.layer = originalSelectedFeature.layer
      ;(selectedFeature as any).sourceLayer = (originalSelectedFeature as any).sourceLayer
    }

    try {
      layerDataSource = await this.getLayerDataSourceBySelectedFeature(jimuMapView, selectedFeature)
    } catch (err) {
      layerDataSource = null
      console.error('getLayerDataSourceBySelectedFeature error', err)
    }

    if (!layerDataSource) {
      const layer = selectedFeature.layer

      if (layer) {
        layerDataSource = layer[ExBAddedJSAPIProperties.EXB_DATA_SOURCE]
      }
    }

    if (layerDataSource) {
      const sourceLabel = layerDataSource.getLabel() || ''
      const stringKey = 'mapCurrentRecord'
      const dataSetName = this.props.intl.formatMessage({ id: stringKey, defaultMessage: defaultMessages[stringKey] }, { layerName: sourceLabel })
      const record = layerDataSource.buildRecord(selectedFeature) as FeatureDataRecord
      // popup.selectedFeature.geometry is quantized
      record.hasFullGeometry = false
      const dataSet: DataRecordSet = {
        dataSource: layerDataSource,
        name: dataSetName,
        type: 'current',
        records: [record]
      }

      return dataSet
    }

    return null
  }

  async getLayerDataSourceBySelectedFeature (jimuMapView: JimuMapView, selectedFeature: __esri.Graphic): Promise<DataSource> {
    let layerDataSource: DataSource = null

    if (selectedFeature) {
      const dataSourceId = selectedFeature[ExBAddedJSAPIProperties.EXB_DATA_SOURCE_ID]

      if (dataSourceId) {
        layerDataSource = DataSourceManager.getInstance().getDataSource(dataSourceId)
      }

      if (!layerDataSource) {
        const jimuLayerView = this.getJimuLayerViewBySelectedFeature(jimuMapView, selectedFeature)

        if (jimuLayerView) {
          layerDataSource = jimuLayerView.getLayerDataSource()

          if (!layerDataSource) {
            layerDataSource = await jimuLayerView.createLayerDataSource()
          }
        }
      }
    }

    return layerDataSource
  }

  getJimuLayerViewBySelectedFeature (jimuMapView: JimuMapView, selectedFeature: __esri.Graphic): JimuLayerView {
    let jimuLayerView: JimuLayerView = null

    // If the selectedFeature is from JimuLayerView selection, we can get the jimuLayerViewId.
    // See JimuFeatureLayerView.getSelectedFeatures() for more details.
    const jimuLayerViewId = (selectedFeature as any).jimuLayerViewId

    if (jimuLayerViewId) {
      jimuLayerView = jimuMapView.jimuLayerViews[jimuLayerViewId]
    }

    // If jimuLayerView is still null, means the selectedFeature comes from clicking map, we can try to find the jimuLayerView by layer.
    if (!jimuLayerView) {
      const allJimuLayerViews = Object.values(jimuMapView.jimuLayerViews)

      // In most cases, we should get jimuLayerView by selectedFeature.layer, but there is an exception.
      // If selectedFeature is a feature of BuildingComponentSublayer, then selectedFeature.layer is BuildingSceneLayer and selectedFeature.sourceLayer is BuildingComponentSublayer.
      // For this case, we should get jimuLayerView by selectedFeature.sourceLayer, not selectedFeature.layer.
      if (selectedFeature.layer && selectedFeature.layer.declaredClass !== 'esri.layers.BuildingSceneLayer') {
        jimuLayerView = allJimuLayerViews.find(item => item.layer === selectedFeature.layer)
      }

      if (!jimuLayerView) {
        // If the selected feature comes from esri.layers.support.Sublayer, then the selectedFeature.layer is null and selectedFeature.sourceLayer is not null.
        const sourceLayer = (selectedFeature as any).sourceLayer

        if (sourceLayer) {
          jimuLayerView = allJimuLayerViews.find(item => item.layer === sourceLayer)
        }
      }
    }

    return jimuLayerView
  }

  isDataActionEnabled () {
    // By default, this.props.enableDataAction is undefined, which means enabled.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
    return this.props.enableDataAction !== false
  }

  renderDataActionList () {
    const isDataActionEnabled = this.isDataActionEnabled()

    if (isDataActionEnabled && this.state.dataActionDataSet) {
      // render the DataActionList into this.dataActionListContainer, so we can append it to popup domNode
      return ReactDOM.createPortal(
        <DataActionList widgetId={this.props.id} dataSets={[this.state.dataActionDataSet]} buttonType='tertiary'
          disableDataSourceLevelActions={true} listStyle={DataActionListStyle.Dropdown} hideGroupTitle={true}
        />,
        this.dataActionListContainer
      )
    }

    return null
  }

  render () {
    const dataActionList = this.renderDataActionList()
    const className = `jimu-widget arcgis-map ${this.mapRootClassName}`

    return (
      <Paper shape='none' className={className} css={this.getWidgetStyle()}>
        <Global styles={this.getWidgetGlobalStyle()} />
        {this.isLoadingDisplayed() && <Loading className='map-loading-bar' type={LoadingType.Bar}/>}
        {this.isWarningDisplayed() && <div className='map-warning-bar'>
          <Icon className='warning-icon' icon={this.warningIcon} size={26} currentColor={false} />
          <span>{this.props.intl.formatMessage({ id: 'failToAddTheDataOnMap', defaultMessage: 'Fail to add the data.' })}</span>
        </div>}
        { dataActionList }
        <PageVisibilityContext.Consumer>
          {(isPageVisible) => {
            return (
              <ViewportVisibilityContext.Consumer>
                {(isVisibleInViewPort) => {
                  return (
                    <ViewVisibilityContext.Consumer>
                      {(viewVisibilityContextProps) => {
                        // isPageVisible:
                        // App can have page1, page2, isPageVisible is used to judge whether the current page is visible.

                        // isVisibleInViewPort:
                        // When scrolling the scroll page, the widget may be scrolled out of the current viewport,
                        // isVisibleInViewPort is used to determine whether the current widget is in the viewport of the browser.

                        // isPrintPreview
                        // isPrintPreview is used to determine whether it is currently in browser printing mode.

                        // isVisibleInView:
                        // The widget is ultimately placed in a view in a layout. It is possible that we have a section with multiple views in it, similar to tabs.
                        // isVisibleInView is used to determine whether the widget is in the currently visible view.

                        const isVisibleInView = viewVisibilityContextProps.isInView ? viewVisibilityContextProps.isInCurrentView : true

                        // isMapInVisibleArea:
                        // isMapInVisibleArea is used to finally determine whether the dom of the map is visible to the user.

                        // Here we use (isVisibleInViewPort || this.props.isPrintPreview), not only isVisibleInViewPort, consider the following case.
                        // Case:
                        // We create a scroll page with map. We scroll the page and the map is not visible for user.
                        // User wants to print the scroll page, including the map (even the map is not visible).
                        // Then the user enables print view mode by a button. Now, isVisibleInViewPort is false and this.props.isPrintPreview is true.
                        // We need to make sure the map widget is visible (let isMapInVisibleArea be true) when in print view mode, otherwise the print result will lose map.
                        // So we use (isVisibleInViewPort || this.props.isPrintPreview), instead of this.props.isPrintPreview.
                        const isMapInVisibleArea = isPageVisible && (isVisibleInViewPort || this.props.isPrintPreview) && isVisibleInView

                        return this.getInnerContent(isMapInVisibleArea)
                      }}
                    </ViewVisibilityContext.Consumer>

                  )
                }}
              </ViewportVisibilityContext.Consumer>
            )
          }}
        </PageVisibilityContext.Consumer>
      </Paper>
    )
  }
}
