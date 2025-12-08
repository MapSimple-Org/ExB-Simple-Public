/** @jsx jsx */
import {
  type IMState,
  classNames,
  React,
  jsx,
  type AllWidgetProps,
  defaultMessages as jimuCoreMessages,
  AppMode,
  type ImmutableArray,
  type ImmutableObject,
  utils,
  type IMAppConfig,
  appActions,
  TransitionContainer,
  getAppStore,
  BrowserSizeMode,
  indexedDBUtils,
  ReactResizeDetector,
  ViewVisibilityContext,
  type ViewVisibilityContextProps,
  lodash,
  css
} from 'jimu-core'
import {
  Button,
  Image,
  NavButtonGroup,
  Select,
  ImageFillMode,
  defaultMessages as jimuUIDefaultMessages,
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  Paper
} from 'jimu-ui'
import {
  type IMConfig,
  type Bookmark,
  TemplateType,
  PageStyle,
  DirectionType,
  DisplayType,
  Status,
  ImgSourceType
} from '../config'
import { applyTimeExtent, getBookmarkListFromCache, getKey, getTotalBookmarks } from './utils/utils'
import defaultMessages from './translations/default'
import { Fragment } from 'react'
import {
  JimuMapViewComponent,
  type JimuMapView,
  loadArcGISJSAPIModules,
  type JimuMapViewGroup
} from 'jimu-arcgis'
import { LayoutEntry } from 'jimu-layouts/layout-runtime'
import { GalleryExample } from './components/gallery/gallery-example'
import { GalleryList } from './components/gallery/gallery-list'
import { versionManager } from '../version-manager'
import { TextDotsOutlined } from 'jimu-icons/outlined/editor/text-dots'
import { PlayCircleFilled } from 'jimu-icons/filled/editor/play-circle'
import { PauseOutlined } from 'jimu-icons/outlined/editor/pause'
import { PinOutlined } from 'jimu-icons/outlined/application/pin'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import NavButtons from './components/nav-buttons'
import { getDefaultConfig, getLayersConfig, shouldChangeLayerVisibility, showLayersConfig } from '../utils'
import { getStyle } from './style'
import { CardList } from './components/card/card-list'
import { CardExample } from './components/card/card-example'
import { ListItem } from './components/list/list-item'
const AUTOPLAY_DURATION = 1000

interface Props {
  appMode: AppMode
  appConfig: IMAppConfig
  layouts: any
  selectionIsSelf: boolean
  selectionIsInSelf: boolean
  autoplayActiveId: string
  mapWidgetId: string
  browserSizeMode: BrowserSizeMode
  isPrintPreview: boolean
}

interface States {
  jimuMapView: JimuMapView
  widgetRect: {
    width: number
    height: number
  }
  apiLoaded: boolean
  viewGroup: JimuMapViewGroup
  bookmarkOnViewId: number | string
  autoPlayStart: boolean
  runtimeBmArray: string[]
  runtimeBmItemsInfo: { [itemId: string]: Bookmark }
  runtimeSnaps: { [key: string]: string }
  playTimer: any
  isSetLayout: boolean
  isSuspendMode: boolean
  // the index of the bookmark item(added from setting or added from runtime) that is need highlight in the bookmark widget
  highLightIndex: number
  runtimeHighLightIndex: number
  showInView: boolean
}

export class Widget extends React.PureComponent<
AllWidgetProps<IMConfig> & Props,
States
> {
  graphicsLayerCreated: {
    [viewId: string]: boolean
  }

  graphicsPainted: {
    [viewId: string]: {
      [bookmarkId: number]: boolean
    }
  }

  graphicsLayerId: {
    [viewId: string]: string
  }

  runtimeReference: HTMLDivElement
  containerRef: any
  rtBookmarkId: number
  alreadyActiveLoading: boolean
  mapOpacity: number
  readonly isRTL: boolean
  runtimeSnapCache: indexedDBUtils.IndexedDBCache
  Graphic: typeof __esri.Graphic = null
  GraphicsLayer: typeof __esri.GraphicsLayer = null
  Extent: typeof __esri.Extent = null
  Viewpoint: typeof __esri.Viewpoint = null
  Basemap: typeof __esri.Basemap = null
  intersectionObserver: IntersectionObserver
  isUseCache: boolean
  resizeConRef = React.createRef<HTMLDivElement>()
  debounceOnResize: ({ width, height }) => void

  static mapExtraStateProps = (
    state: IMState,
    props: AllWidgetProps<IMConfig>
  ): Props => {
    const appConfig = state?.appConfig
    const {
      layouts,
      layoutId,
      layoutItemId,
      builderSupportModules,
      id,
      useMapWidgetIds
    } = props
    const selection = state?.appRuntimeInfo?.selection
    const selectionIsInSelf =
      selection &&
      builderSupportModules &&
      builderSupportModules.widgetModules &&
      builderSupportModules.widgetModules.selectionInBookmark(
        selection,
        id,
        appConfig,
        false
      )
    const mapWidgetsInfo = state?.mapWidgetsInfo
    const mapWidgetId =
      useMapWidgetIds && useMapWidgetIds.length !== 0
        ? useMapWidgetIds[0]
        : undefined
    const browserSizeMode = state?.browserSizeMode || BrowserSizeMode.Large
    return {
      appMode: state?.appRuntimeInfo?.appMode,
      appConfig,
      layouts,
      selectionIsSelf:
        selection &&
        selection.layoutId === layoutId &&
        selection.layoutItemId === layoutItemId,
      selectionIsInSelf,
      autoplayActiveId: mapWidgetId
        ? mapWidgetsInfo[mapWidgetId]?.autoControlWidgetId
        : undefined,
      mapWidgetId,
      browserSizeMode,
      isPrintPreview: state?.appRuntimeInfo?.isPrintPreview ?? false
    }
  }

  static getFullConfig = (config) => {
    return getDefaultConfig().merge(config, { deep: true })
  }

  constructor (props) {
    super(props)
    this.isUseCache = !window.jimuConfig.isInBuilder
    const appState = getAppStore().getState()
    const runtimeBmArray = this.isUseCache ? getBookmarkListFromCache(this.props.id, this.props.mapWidgetId) : []
    const getRuntimeBmItemsInfo = (runtimeBmArray: string[]): { [itemId: string]: Bookmark } => {
      const info: { [itemId: string]: Bookmark } = {}
      runtimeBmArray.forEach((itemId) => {
        const itemInfo = utils.readLocalStorage(itemId)
        info[itemId] = JSON.parse(itemInfo)
      })
      return info
    }
    const runtimeBmItemsInfo = this.isUseCache ? getRuntimeBmItemsInfo(runtimeBmArray) : {}
    const stateObj: States = {
      jimuMapView: undefined,
      widgetRect: {
        width: 516,
        height: 210
      },
      apiLoaded: false,
      viewGroup: undefined,
      bookmarkOnViewId: 1,
      autoPlayStart: false,
      runtimeBmArray,
      runtimeBmItemsInfo: runtimeBmItemsInfo,
      runtimeSnaps: {},
      playTimer: undefined,
      isSetLayout: false,
      isSuspendMode: false,
      highLightIndex: -1,
      runtimeHighLightIndex: -1,
      showInView: true
    }

    let rtId = 0
    if (runtimeBmArray.length > 0) {
      const lastId = runtimeBmArray[runtimeBmArray.length - 1]
      const { title: lastItem } = JSON.parse(utils.readLocalStorage(lastId))
      const strIndex = lastItem.lastIndexOf('-')
      rtId = parseInt(lastItem.substring(strIndex + 1))
    }
    this.state = stateObj
    this.graphicsLayerCreated = {}
    this.graphicsPainted = {}
    this.graphicsLayerId = {}
    this.runtimeReference = undefined
    this.containerRef = React.createRef()
    this.rtBookmarkId = rtId
    this.alreadyActiveLoading = false
    this.mapOpacity = 1
    this.isRTL = appState?.appContext?.isRTL
    this.runtimeSnapCache = new indexedDBUtils.IndexedDBCache(props.id, 'bookmark', 'runtime-snap')
    this.intersectionObserver = null
    this.onResize = this.onResize.bind(this)
    this.debounceOnResize = lodash.debounce(
      ({ width, height }) => { this.onResize(width, height) },
      100
    )
  }

  getLayoutEntry () {
    if (window.jimuConfig.isInBuilder && this.props.appMode === AppMode.Design) {
      return this.props.builderSupportModules.LayoutEntry
    } else {
      return LayoutEntry as any
    }
  }

  async initRuntimeSnaps () {
    try {
      if (!this.runtimeSnapCache.initialized()) {
        await this.runtimeSnapCache.init()
      }
      const allKeys = await this.runtimeSnapCache.getAllKeys()
      const allValues = await this.runtimeSnapCache.getAll()
      const runtimeSnapsObj = {}
      allKeys.forEach((key, index) => {
        runtimeSnapsObj[key] = allValues[index]
      })
      this.setState({ runtimeSnaps: runtimeSnapsObj })
    } catch (e) {
      console.error(e)
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (
      !nextProps ||
      Object.keys(nextProps).length === 0 ||
      !prevState ||
      Object.keys(prevState).length === 0
    ) {
      return null
    }
    const { autoPlayStart, playTimer } = prevState
    if (nextProps.autoplayActiveId !== nextProps.id) {
      if (autoPlayStart && playTimer) clearInterval(playTimer)
      return {
        autoPlayStart: false,
        playTimer: undefined
      }
    }
    return null
  }

  static versionManager = versionManager

  componentDidMount () {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules([
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/Viewpoint',
        'esri/Basemap'
      ]).then(modules => {
        ;[
          this.Graphic,
          this.GraphicsLayer,
          this.Viewpoint,
          this.Basemap
        ] = modules
        this.setState({
          apiLoaded: true
        })
      })
    }
    if (this.isUseCache) { this.initRuntimeSnaps() }
  }

  componentDidUpdate (prevProps) {
    // config setting widget synchronous switch
    const { config, appMode, id, autoplayActiveId, isPrintPreview } = this.props
    const { autoPlayStart, playTimer, jimuMapView, isSuspendMode, showInView } = this.state
    const activeBookmarkId = this.props?.stateProps?.activeBookmarkId || 0
    // Clear the previous widget's drawing when the widget that controls the Map changes
    if (autoplayActiveId && jimuMapView && id !== autoplayActiveId) {
      const toClearLayerId = this.graphicsLayerId[jimuMapView.id]
      if (!toClearLayerId) return
      const toClearLayer = jimuMapView.view.map.findLayerById(
        toClearLayerId
      ) as __esri.GraphicsLayer
      toClearLayer && toClearLayer.removeAll()
      this.graphicsPainted[jimuMapView.id] = {}
    }
    // Handle manually opening Live view (active on loading)
    if (prevProps.appMode === AppMode.Design && appMode === AppMode.Run) {
      if (jimuMapView && config.initBookmark) {
        const mapBookmarks = this.getMapBookmarks(jimuMapView) || []
        const bookmarks = getTotalBookmarks(config, mapBookmarks)
        if (bookmarks.length > 0 && showInView) {
          jimuMapView.view.when(() => {
            this.setState({
              bookmarkOnViewId: bookmarks[0].id
            })
            this.onViewBookmark(bookmarks[0])
          })
        }
      }
    }
    // Turn off live view,change paging style to 'scroll',sizeMode change and uncheck auto play need to turn off the autoplay
    if (this.autoOffCondition(prevProps)) {
      if (autoPlayStart) {
        if (playTimer) clearInterval(playTimer)
        this.setState({
          autoPlayStart: false,
          playTimer: undefined
        })
        return
      }
    }
    // PrintPreview mode
    if (prevProps.isPrintPreview !== isPrintPreview) {
      if (autoPlayStart) {
        this.setState({ isSuspendMode: true })
        this.handleAutoPlay()
      } else if (isSuspendMode && !autoPlayStart) {
        this.setState({ isSuspendMode: false })
        this.handleAutoPlay()
      }
    }
    // This indicates that the activeId change is caused by setting
    const settingChangeBookmark =
      this.props?.stateProps?.settingChangeBookmark || false
    if (settingChangeBookmark && activeBookmarkId) {
      // && (activeBookmarkId !== bookmarkOnViewId)
      const current =
        config.bookmarks.findIndex(x => x.id === activeBookmarkId) > -1
          ? config.bookmarks.findIndex(x => x.id === activeBookmarkId)
          : 0
      this.setState({ bookmarkOnViewId: activeBookmarkId })
      this.props.dispatch(
        appActions.widgetStatePropChange(id, 'settingChangeBookmark', false)
      )
      if (appMode === AppMode.Run || appMode === AppMode.Express) { this.onViewBookmark(config.bookmarks[current], false, current) }
    }
    // Delete the last bookmark need to clear the layer in map widget
    const lastFlag = this.props?.stateProps?.lastFlag || false
    if (lastFlag) {
      this.props.dispatch(
        appActions.widgetStatePropChange(id, 'lastFlag', false)
      )
      const bookmarkLayer = jimuMapView.view.map.findLayerById(
        this.graphicsLayerId[jimuMapView.id]
      ) as __esri.GraphicsLayer
      bookmarkLayer && bookmarkLayer.removeAll()
    }
    this.settingLayout()
  }

  autoOffCondition = prevProps => {
    const { config, appMode, browserSizeMode } = this.props
    const { pageStyle, autoPlayAllow, autoInterval, autoLoopAllow } = config
    const sizeModeChange = browserSizeMode !== prevProps.browserSizeMode
    const autoSettingChange =
      autoInterval !== prevProps.config?.autoInterval ||
      autoLoopAllow !== prevProps.config?.autoLoopAllow
    return (
      appMode === AppMode.Design ||
      pageStyle === PageStyle.Scroll ||
      !autoPlayAllow ||
      autoSettingChange ||
      sizeModeChange
    )
  }

  componentWillUnmount () {
    // Delete the widget need to clear the layer in map widget
    const { jimuMapView } = this.state
    const widgets = getAppStore().getState().appConfig.widgets
    if (!widgets[this.props.id] && jimuMapView) {
      // Note that the view does not exist when uninstalling the map and bookmark at the same time
      const bookmarkLayer = jimuMapView?.view?.map?.findLayerById(
        this.graphicsLayerId[jimuMapView.id]
      ) as __esri.GraphicsLayer
      bookmarkLayer && bookmarkLayer.removeAll()
    }
    if (this.intersectionObserver) this.intersectionObserver.disconnect()
  }

  settingLayout = () => {
    const { layoutId, layoutItemId, id, selectionIsSelf } = this.props
    const { isSetLayout } = this.state
    if (layoutId && id && layoutItemId && !isSetLayout && selectionIsSelf) {
      this.props.dispatch(
        appActions.widgetStatePropChange(id, 'layoutInfo', {
          layoutId,
          layoutItemId
        })
      )
      this.setState({ isSetLayout: true })
    }
  }

  formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign(
      {},
      defaultMessages,
      jimuUIDefaultMessages,
      jimuCoreMessages
    )
    return this.props.intl.formatMessage(
      { id: id, defaultMessage: messages[id] },
      values
    )
  }

  onResize = (width, height) => {
    const { id, dispatch } = this.props
    const newWidgetRect = {
      width,
      height
    }
    this.setState({ widgetRect: newWidgetRect })
    dispatch(appActions.widgetStatePropChange(id, 'widgetRect', newWidgetRect))
  }

  isEditing = (): boolean => {
    const { appMode, config, selectionIsSelf, selectionIsInSelf } = this.props
    if (!window.jimuConfig.isInBuilder) return false
    return (
      (selectionIsSelf || selectionIsInSelf) &&
      window.jimuConfig.isInBuilder &&
      appMode !== AppMode.Run &&
      config.isTemplateConfirm
    )
  }

  handleRuntimeAdd = async () => {
    this.rtBookmarkId++
    const { jimuMapView } = this.state
    if (!jimuMapView) return
    const view = jimuMapView.view
    const { id } = this.props
    const layersArray = view.map.layers.toArray()
    const layersConfig = getLayersConfig(layersArray)
    let newBookmarkId = this.rtBookmarkId.toString()
    const { dataUrl } = await view.takeScreenshot({ width: 148, height: 120 })
    if (this.isUseCache) {
      const localAppKey = utils.getLocalStorageAppKey()
      newBookmarkId = `${localAppKey}-bookmark-${id}-bookmark-${utils.getUUID()}`
    }
    const bookmark: Bookmark = {
      id: newBookmarkId,
      name: `${this.formatMessage('_widgetLabel')}(${this.rtBookmarkId})`,
      title: `${this.formatMessage('_widgetLabel')}-${this.rtBookmarkId}`,
      type: view.type,
      imgSourceType: ImgSourceType.Snapshot,
      extent: view.extent.toJSON(),
      viewpoint: view.viewpoint.toJSON(),
      showFlag: true,
      runTimeFlag: true,
      mapDataSourceId: jimuMapView.dataSourceId,
      layersConfig
    }
    if (view.type === '3d') {
      bookmark.environment = JSON.parse(JSON.stringify(view.environment))
    }
    if (this.isUseCache) {
      const runtimeBmId = getKey(this.props.id, this.props.mapWidgetId)
      utils.setLocalStorage(
        runtimeBmId,
        JSON.stringify(this.state.runtimeBmArray.concat(newBookmarkId))
      )
      utils.setLocalStorage(newBookmarkId, JSON.stringify(bookmark))
      this.runtimeSnapCache.put(newBookmarkId, dataUrl)
    }
    this.setState({
      runtimeBmArray: this.state.runtimeBmArray.concat(newBookmarkId),
      runtimeBmItemsInfo: {
        ...this.state.runtimeBmItemsInfo,
        [newBookmarkId]: bookmark
      },
      runtimeSnaps: {
        ...this.state.runtimeSnaps,
        [newBookmarkId]: dataUrl
      }
    })
  }

  flatVisibleLayers = (visibleLayers: ImmutableArray<any>) => {
    let layerIds = []
    for (let i=0; i<visibleLayers.length; i++) {
      const item = visibleLayers[i]
      if (item.id) {
        layerIds.push(item.id)
      }
      if (item.subLayerIds) {
        layerIds = layerIds.concat(item.subLayerIds.asMutable())
      }
    }
    return layerIds
  }

  showMapOriginLayer = (layersArray, visibleLayers: ImmutableArray<any>) => {
    const visibleArray = this.flatVisibleLayers(visibleLayers)
    const recursion = (array, visibleArray) => {
      array.forEach(layer => {
        if (shouldChangeLayerVisibility(layer)) {
          layer.visible = false
          if (visibleArray?.includes(layer.id)) {
            layer.visible = true
          }
        }
        if (layer.layers && layer.layers.length > 0) {
          recursion(layer.layers.toArray(), visibleArray)
        } else if (layer.sublayers && layer.sublayers.length > 0) {
          recursion(layer.sublayers.toArray(), visibleArray)
        }
      })
    }
    recursion(layersArray, visibleArray)
  }

  onViewBookmark = (item: ImmutableObject<Bookmark>, isRuntime?: boolean, index?: number) => {
    if (!item) return
    const { jimuMapView, viewGroup } = this.state
    const { id, useMapWidgetIds } = this.props
    const activeBookmarkId = this.props?.stateProps?.activeBookmarkId || 0

    if (isRuntime) { //bookmark item is added from runtime
      this.setState({ highLightIndex: -1, runtimeHighLightIndex: index })
    } else if (isRuntime !== undefined) { //isRuntime is false, means bookmark item is added from setting
      this.setState({ highLightIndex: index, runtimeHighLightIndex: -1 })
    }

    //Cancel the highlight of the other bookmark widgets(which connected to the same map widget) when clicking a bookmark widget, make sure there is only one bookmark widget with the highlight.
    const BookmarkNodeList = document.querySelectorAll(`.widget-bookmark.useMapWidgetId-${useMapWidgetIds?.[0]}`)
    const currentBookmarkId = `bookmark-widget-${id}`
    BookmarkNodeList.forEach(node => {
      if (!node.classList.contains(currentBookmarkId)) {
        const activeNode = node.querySelector<HTMLElement>('.bookmark-container .active-bookmark-item')
        activeNode?.classList.remove('active-bookmark-item')
      }
    })

    //If click back the save index of before bookmark widget from another bookmark widget, need to add the class of active-bookmark-item manually. (It will render again but won't add the class, so need manually add it.)
    if (!isRuntime && index === this.state.highLightIndex) {
      BookmarkNodeList.forEach(node => {
        if (node.classList.contains(currentBookmarkId)) {
          const currentBookmarkNodes = node.querySelectorAll('.bookmark-container .bookmark-pointer,.bookmark-custom-pointer')
          currentBookmarkNodes[index].classList.add('active-bookmark-item')
        }
      })
    }
    if (isRuntime && index === this.state.runtimeHighLightIndex) {
      BookmarkNodeList.forEach(node => {
        if (node.classList.contains(currentBookmarkId)) {
          const currentBookmarkNodes = node.querySelectorAll('.bookmark-container .bookmark-pointer.runtime-bookmark')
          currentBookmarkNodes[index].classList.add('active-bookmark-item')
        }
      })
    }

    if (item && !item.runTimeFlag && activeBookmarkId !== item.id) {
      this.props.dispatch(
        appActions.widgetStatePropChange(id, 'activeBookmarkId', item.id)
      )
    }
    // Apply for control of the Map, to turn off other widget's control
    if (useMapWidgetIds && useMapWidgetIds.length !== 0) {
      getAppStore().dispatch(
        appActions.requestAutoControlMapWidget(useMapWidgetIds[0], id)
      )
    }
    // Either go directly to view or view after the switch of the map
    if (jimuMapView) {
      if (item && jimuMapView.dataSourceId !== item.mapDataSourceId) {
        viewGroup &&
          viewGroup.switchMap().then(() => {
            this.viewBookmark(item)
          })
      } else {
        this.viewBookmark(item)
      }
    }
  }

  isNumber = (n: any): boolean => {
    return !isNaN(parseFloat(n)) && isFinite(n) && Object.prototype.toString.call(n) === '[object Number]'
  }

  viewBookmark = (item: ImmutableObject<Bookmark>) => {
    const { id, appMode, config } = this.props
    const { jimuMapView } = this.state
    const { viewpoint } = item
    const gotoOpts = { duration: AUTOPLAY_DURATION }

    if (appMode === AppMode.Run || appMode === AppMode.Express) {
      if (jimuMapView && jimuMapView.view) {
        jimuMapView.view.goTo(
          this.Viewpoint.fromJSON(viewpoint),
          gotoOpts
        )
        if (item.baseMap) {
          const baseMapJson = item.baseMap.asMutable ? item.baseMap.asMutable({ deep: true }) : item.baseMap
          // @ts-expect-error
          jimuMapView.view.map.basemap = this.Basemap.fromJSON(baseMapJson, { origin: 'web-scene' })
        }
        if (item.timeExtent) {
          const timeExtent = item.timeExtent.asMutable({ deep: true })
          applyTimeExtent(jimuMapView, timeExtent)
        }
        // map ground transparency
        const itemTransparency = item?.ground?.transparency
        if (item?.ground && this.isNumber(itemTransparency)) {
          jimuMapView.view.map.ground.opacity = ((100 - itemTransparency) / 100)
        } else {
          jimuMapView.view.map.ground.opacity = this.mapOpacity
        }
        const layersArray = jimuMapView.view.map.layers.toArray()

        //sceneView environment lighting
        const itemLighting = item?.environment?.lighting.asMutable({ deep: true }) as any
        if (item?.environment && itemLighting) {
          const view = jimuMapView.view as __esri.SceneView
          view.environment.lighting = {
            type: itemLighting.type,
            date: itemLighting.datetime,
            directShadowsEnabled: itemLighting.directShadows,
            displayUTCOffset: itemLighting.displayUTCOffset
          } as unknown as __esri.SunLighting
        }

        //sceneView environment weather
        const itemWeather = item?.environment?.weather
        if (item?.environment && itemWeather) {
          const view = jimuMapView.view as __esri.SceneView
          view.environment.weather = itemWeather.asMutable({ deep: true })
        }

        // This variable indicates whether the current map is the map for which the bookmark corresponds.
        // If it is not, the variable is true, need to keep the layer attribute of the map itself.
        const mapDsChange = jimuMapView.dataSourceId !== item.mapDataSourceId
        if (!config.ignoreLayerVisibility) {
          if (item.mapOriginFlag) {
            //Only the bookmarks created by scene viewer has visibleLayers property. The bookmarks created by map viewer don't change the map layers visibility.
            if (jimuMapView.view.type === '3d') {
              const allLayersArray = layersArray.concat(jimuMapView.view.map.ground.layers.toArray())
              this.showMapOriginLayer(allLayersArray, item.visibleLayers)
            }
          } else {
            showLayersConfig(layersArray, item.layersConfig, mapDsChange)
          }
        }
        // repaint graphics to map widget
        const graphicsExist = item.graphics && item.graphics.length > 0
        if (!this.graphicsLayerCreated[jimuMapView.id]) {
          const timeStamp = (new Date().getTime())
          const bookmarkGraphicsLayerId = `bookmark-layer-${id}-${jimuMapView.id}-${timeStamp}`
          const layer = new this.GraphicsLayer({
            id: bookmarkGraphicsLayerId,
            listMode: 'hide',
            title: this.formatMessage('graphicLayer'),
            elevationInfo: { mode: 'relative-to-scene' }
          })
          if (graphicsExist) {
            item.graphics.forEach(graphic => {
              layer.graphics.push(this.Graphic.fromJSON(graphic))
            })
          }
          jimuMapView.view.map.add(layer)
          this.graphicsPainted[jimuMapView.id] = {}
          this.graphicsPainted[jimuMapView.id][item.id] = true
          this.graphicsLayerId[jimuMapView.id] = layer.id
          this.graphicsLayerCreated[jimuMapView.id] = true
        } else {
          const graphicsLayer = jimuMapView.view.map.findLayerById(
            this.graphicsLayerId[jimuMapView.id]
          ) as __esri.GraphicsLayer
          if (config.displayType === DisplayType.Selected) {
            // Only selected
            graphicsLayer?.removeAll()
            if (graphicsExist && graphicsLayer) {
              item.graphics.forEach(graphic => {
                graphicsLayer.graphics.push(this.Graphic.fromJSON(graphic))
              })
            }
          } else {
            // See all (Note: Already drew repaint after edit)
            if (!this.graphicsPainted[jimuMapView.id][item.id]) {
              if (graphicsExist) {
                item.graphics.forEach(graphic => {
                  graphicsLayer.graphics.push(this.Graphic.fromJSON(graphic))
                })
              }
              this.graphicsPainted[jimuMapView.id][item.id] = true
            } else {
              // remove already drew and repaint after edit
              if (graphicsExist) {
                item.graphics.forEach(toMoveGraphic => {
                  const toRemoveGraphic = graphicsLayer.graphics.find(oldGraphic =>
                    oldGraphic.attributes.jimuDrawId === toMoveGraphic.attributes.jimuDrawId
                  )
                  graphicsLayer.remove(toRemoveGraphic)
                })
                item.graphics.forEach(graphic => {
                  graphicsLayer.graphics.push(this.Graphic.fromJSON(graphic))
                })
              }
            }
          }
        }
      }
    }
  }

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    const { appMode, config } = this.props
    this.setState({ jimuMapView })
    // map default opacity
    this.mapOpacity = jimuMapView?.view?.map?.ground?.opacity || 1
    if (
      jimuMapView &&
      (appMode === AppMode.Run || appMode === AppMode.Express) &&
      config.initBookmark &&
      !this.alreadyActiveLoading
    ) {
      const mapBookmarks = this.getMapBookmarks(jimuMapView) || []
      const bookmarks = getTotalBookmarks(config, mapBookmarks)
      if (bookmarks.length > 0) {
        this.alreadyActiveLoading = true
        jimuMapView.view.when(() => {
          this.setState({
            bookmarkOnViewId: bookmarks[0].id
          })
          // execute after snapToZoom is set to false
          setTimeout(() => { this.onViewBookmark(bookmarks[0]) }, 0)
        })
      }
    }
  }

  handleViewGroupCreate = (viewGroup: JimuMapViewGroup) => {
    this.setState({ viewGroup })
  }

  typedImgExist = bookmark => {
    return bookmark.imgSourceType === ImgSourceType.Snapshot
      ? bookmark.snapParam?.url
      : bookmark.imgParam?.url
  }

  renderSlideViewTop = item => {
    const typeSnap = item.imgSourceType === ImgSourceType.Snapshot
    const imageSrc = typeSnap ? item.snapParam?.url : item.imgParam?.url
    const { displayName } = this.props.config
    return (
      <div
        className='w-100 h-100 bookmark-pointer border-0 bookmark-slide-outline jimu-outline-inside'
        onClick={() => { this.onViewBookmark(item) }}
        key={item.id || `webmap-${item.name}`}
        role='listitem'
        tabIndex={0}
        aria-label={this.formatMessage('_widgetLabel')}
        onKeyDown={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault()
            evt.stopPropagation()
          }
        }}
        onKeyUp={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.stopPropagation()
            this.onViewBookmark(item)
          }
        }}
      >
        <div className={classNames('bookmark-slide', { 'd-none': !displayName && !item.description })}>
          <div className={classNames('bookmark-slide-title', { 'd-none': !displayName })}>{item.name}</div>
          <div className='bookmark-slide-description'>{item.description}</div>
        </div>
        {imageSrc
          ? <Image
              src={imageSrc}
              alt=''
              fadeInOnLoad
              imageFillMode={item.imagePosition}
            />
          : <div className='default-img'>
            <div className='default-img-svg'></div>
          </div>
        }
      </div>
    )
  }

  renderSlideViewText = item => {
    const typeSnap = item.imgSourceType === ImgSourceType.Snapshot
    const imageSrc = typeSnap ? item.snapParam?.url : item.imgParam?.url
    const { displayName } = this.props.config
    return (
      <div
        className='w-100 h-100 bookmark-pointer jimu-outline-inside border-0'
        onClick={() => { this.onViewBookmark(item) }}
        key={item.id || `webmap-${item.name}`}
        role='listitem'
        tabIndex={0}
        onKeyDown={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault()
            evt.stopPropagation()
          }
        }}
        onKeyUp={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.stopPropagation()
            this.onViewBookmark(item)
          }
        }}
      >
        <div className='w-100' style={{ height: '40%' }}>
          {imageSrc
            ? <Image
              src={imageSrc}
              alt=''
              fadeInOnLoad
              imageFillMode={item.imagePosition}
            />
            : <div className='default-img'>
              <div className='default-img-svg'></div>
            </div>
          }
        </div>
        <div className={classNames('bookmark-slide2', { 'd-none': !displayName && !item.description })}>
          <div className={classNames('bookmark-slide2-title', { 'd-none': !displayName })}>{item.name}</div>
          <div className='bookmark-slide2-description'>{item.description}</div>
        </div>
      </div>
    )
  }

  renderSlideViewBottom = item => {
    const typeSnap = item.imgSourceType === ImgSourceType.Snapshot
    const imageSrc = typeSnap ? item.snapParam?.url : item.imgParam?.url
    const { displayName } = this.props.config
    return (
      <div
        className='w-100 h-100 bookmark-pointer border-0 bookmark-slide-outline jimu-outline-inside'
        onClick={() => { this.onViewBookmark(item) }}
        key={item.id || `webmap-${item.name}`}
        role='listitem'
        aria-label={this.formatMessage('_widgetLabel')}
        tabIndex={0}
      >
        {imageSrc
          ? <Image
            src={imageSrc}
            alt=''
            fadeInOnLoad
            imageFillMode={item.imagePosition}
          />
          : <div className='default-img'>
            <div className='default-img-svg'></div>
          </div>
        }
        <div className={classNames('bookmark-slide', { 'd-none': !displayName && !item.description })}>
          <div className={classNames('bookmark-slide-title', { 'd-none': !displayName })}>{item.name}</div>
          <div className='bookmark-slide-description'>{item.description}</div>
        </div>
      </div>
    )
  }

  renderCustomContents = item => {
    const LayoutEntry = this.getLayoutEntry()
    const { layouts } = this.props
    if (!layouts || !item.layoutName) return (<div key={item.id}></div>)
    return (
      <div
        className='w-100 h-100 bookmark-custom-contents bookmark-pointer border-0 jimu-outline-inside'
        onClick={() => { this.onViewBookmark(item) }}
        key={item.id}
        role='listitem'
        tabIndex={0}
        onKeyUp={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.stopPropagation()
            this.onViewBookmark(item)
          }
        }}
      >
        <LayoutEntry
          isRepeat
          layouts={layouts[item.layoutName]}
          isInWidget
          className='layout-height'
        />
      </div>
    )
  }

  renderCustomExample = () => {
    const LayoutEntry = this.getLayoutEntry()
    const { layouts } = this.props
    if (!layouts?.[Status.Default]) return
    return (
      <div className='w-100 h-100 bookmark-custom-contents bookmark-pointer border-0'>
        <LayoutEntry
          isRepeat
          layouts={layouts[Status.Default]}
          isInWidget
          className='layout-height'
        />
      </div>
    )
  }

  handleArrowChange = (previous: boolean) => {
    const { config } = this.props
    const { jimuMapView } = this.state
    const mapBookmarks = this.getMapBookmarks(jimuMapView) || []
    const bookmarks = getTotalBookmarks(config, mapBookmarks)
    const bookmarkCount = bookmarks.length
    if (bookmarkCount === 0) return
    const { bookmarkOnViewId } = this.state
    let current =
      bookmarks.findIndex(x => x.id === bookmarkOnViewId) > -1
        ? bookmarks.findIndex(x => x.id === bookmarkOnViewId)
        : 0
    if (current === bookmarkCount - 1 && !previous) {
      // the last one, click next
      current = 0
    } else if (current === 0 && previous) {
      // the first one, click previous
      current = bookmarkCount - 1
    } else if (previous && current > 0) {
      current--
    } else if (!previous) {
      current++
    }
    this.setState({ bookmarkOnViewId: bookmarks[current].id })
    this.onViewBookmark(bookmarks[current])
  }

  handleOnViewChange = value => {
    const { config } = this.props
    const { jimuMapView } = this.state
    const mapBookmarks = this.getMapBookmarks(jimuMapView) || []
    const bookmarks = getTotalBookmarks(config, mapBookmarks)
    const current =
      bookmarks.findIndex(x => x.id === value) > -1
        ? bookmarks.findIndex(x => x.id === value)
        : 0
    this.setState({ bookmarkOnViewId: value })
    this.onViewBookmark(bookmarks[current])
  }

  getBookmarksOptions = (bookmarks): React.JSX.Element[] => {
    const optionsArray = []
    bookmarks.forEach(item => {
      optionsArray.push(
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      )
    })
    return optionsArray
  }

  getBookmarksDropdownItems = (bookmarks): React.JSX.Element[] => {
    const { bookmarkOnViewId } = this.state
    const optionsArray = []
    bookmarks.forEach(item => {
      optionsArray.push(
        <DropdownItem key={item.id} active={item.id === bookmarkOnViewId}>
          {item.name}
        </DropdownItem>
      )
    })
    return optionsArray
  }

  handleAutoPlay = () => {
    const { config, useMapWidgetIds, id } = this.props
    const {
      bookmarkOnViewId,
      autoPlayStart,
      playTimer,
      jimuMapView
    } = this.state
    const mapBookmarks = this.getMapBookmarks(jimuMapView) || []
    const bookmarks = getTotalBookmarks(config, mapBookmarks)
    if (bookmarks.length === 0) return
    // turn off the autoplay
    if (autoPlayStart) {
      if (playTimer) clearInterval(playTimer)
      this.setState({
        autoPlayStart: false,
        playTimer: undefined
      })
      return
    }
    // Apply for control of the Map, to turn off other widget's control
    if (useMapWidgetIds && useMapWidgetIds.length !== 0) {
      getAppStore().dispatch(
        appActions.requestAutoControlMapWidget(useMapWidgetIds[0], id)
      )
    }
    // this.props.dispatch(appActions.autoplayActiveIdChanged(id));
    const { autoInterval, autoLoopAllow } = config
    let index = bookmarks.findIndex(x => x.id === bookmarkOnViewId)
    // Other bookmarks change the bookmarkOnViewId, and then click directly on the autoplay of another bookmark.
    // And when the current is the last, click play, start play form the first one
    if (index === -1 || index === bookmarks.length - 1) index = 0
    this.setState({ bookmarkOnViewId: bookmarks[index].id })
    this.onViewBookmark(bookmarks[index])
    const autoplayTimer = setInterval(() => {
      index++
      if (autoLoopAllow) {
        if (index >= bookmarks.length) index = 0
      } else {
        if (index >= bookmarks.length) {
          clearInterval(autoplayTimer)
          if (playTimer) clearInterval(playTimer)
          this.setState({
            autoPlayStart: false,
            playTimer: undefined
          })
          return
        }
      }
      this.setState({ bookmarkOnViewId: bookmarks[index].id })
      this.onViewBookmark(bookmarks[index])
    }, autoInterval * 1000 + AUTOPLAY_DURATION)
    this.setState({
      autoPlayStart: true,
      playTimer: autoplayTimer
    })
  }

  renderBottomTools = (example?: boolean) => {
    const { config } = this.props
    const { jimuMapView } = this.state
    const mapBookmarks = this.getMapBookmarks(jimuMapView) || []
    const bookmarks = getTotalBookmarks(config, mapBookmarks)
    const totalCount = bookmarks.length
    const { bookmarkOnViewId, autoPlayStart } = this.state
    let current = 1
    if (example) {
      current = 0
    } else {
      current =
        bookmarks.findIndex(x => x.id === bookmarkOnViewId) > -1
          ? bookmarks.findIndex(x => x.id === bookmarkOnViewId) + 1
          : 1
    }

    const typedNavBtnGroup = (tempType: TemplateType) => {
      let navBtnGroup
      switch (tempType) {
        case TemplateType.Slide1:
          navBtnGroup = (
            <div className='suspension-tools-bottom align-items-center justify-content-around'>
              {bookmarks.length > 1
                ? (
                  <Dropdown size='sm' activeIcon menuRole='listbox'>
                    <DropdownButton
                      arrow={false}
                      icon
                      size='sm'
                      type='default'
                      className='suspension-drop-btn'
                      title={this.formatMessage('bookmarkList')}
                    >
                      <TextDotsOutlined autoFlip className='suspension-drop-btn' />
                    </DropdownButton>
                    <DropdownMenu>
                      {bookmarks.map(item => {
                        const isActive = item.id === bookmarkOnViewId
                        return (
                          <DropdownItem key={item.id} active={isActive} onClick={() => { this.handleOnViewChange(item.id) }}>
                            {item.name}
                          </DropdownItem>
                        )
                      })}
                    </DropdownMenu>
                  </Dropdown>
                  )
                : (
                  <div className='suspension-drop-placeholder' />
                  )}
              {bookmarks.length > 1
                ? (
                  <NavButtonGroup
                    type='tertiary'
                    vertical={false}
                    onChange={this.handleArrowChange}
                    className='nav-btn-bottom'
                    previousAriaLabel={`${current}/${totalCount}. ` + this.formatMessage('previousBookmark')}
                    nextAriaLabel={`${current}/${totalCount}. ` + this.formatMessage('nextBookmark')}
                    previousTitle={this.formatMessage('previousBookmark')}
                    nextTitle={this.formatMessage('nextBookmark')}
                  >
                    <div className='bookmark-btn-container'>
                      {config.autoPlayAllow && (
                        <Button
                          icon
                          className='bookmark-btn'
                          type='link'
                          onClick={this.handleAutoPlay}
                          title={autoPlayStart ? this.formatMessage('pause') : this.formatMessage('play')}
                          aria-label={autoPlayStart ? this.formatMessage('pause') : this.formatMessage('play')}
                          data-testid='triggerAuto'
                        >
                          {autoPlayStart ? <PauseOutlined className='mr-1' size='l' /> : <PlayCircleFilled className='mr-1' size='l' />}
                        </Button>
                      )}
                    </div>
                  </NavButtonGroup>
                  )
                : (
                  <div className='suspension-nav-placeholder1' />
                  )}
              <span className='number-count'>
                {this.isRTL ? `${totalCount}/${current}` : `${current}/${totalCount}`}
              </span>
            </div>
          )
          break
        case TemplateType.Slide2:
        case TemplateType.Custom1:
        case TemplateType.Custom2:
          navBtnGroup =
            bookmarks.length > 1
              ? (
                <div className='suspension-tools-text align-items-center justify-content-around'>
                  <Dropdown size='sm' activeIcon>
                    <DropdownButton
                      arrow={false}
                      icon
                      size='sm'
                      type='default'
                      className='suspension-drop-btn'
                      title={this.formatMessage('bookmarkList')}
                    >
                      <TextDotsOutlined autoFlip className='suspension-drop-btn' />
                    </DropdownButton>
                    <DropdownMenu>
                      {bookmarks.map(item => {
                        const isActive = item.id === bookmarkOnViewId
                        return (
                          <DropdownItem key={item.id} active={isActive} onClick={() => { this.handleOnViewChange(item.id) }}>
                            {item.name}
                          </DropdownItem>
                        )
                      })}
                    </DropdownMenu>
                  </Dropdown>
                  <NavButtonGroup
                    type='tertiary'
                    vertical={false}
                    onChange={this.handleArrowChange}
                    className='nav-btn-text'
                    previousAriaLabel={`${current}/${totalCount}. ` + this.formatMessage('previousBookmark')}
                    nextAriaLabel={`${current}/${totalCount}. ` + this.formatMessage('nextBookmark')}
                    previousTitle={this.formatMessage('previousBookmark')}
                    nextTitle={this.formatMessage('nextBookmark')}
                  >
                    <span>
                      {current}/{totalCount}
                    </span>
                  </NavButtonGroup>
                  <div className='bookmark-btn-container'>
                    {config.autoPlayAllow && (
                      <Button
                        icon
                        className='bookmark-btn'
                        type='link'
                        onClick={this.handleAutoPlay}
                        title={autoPlayStart ? this.formatMessage('pause') : this.formatMessage('play')}
                        aria-label={autoPlayStart ? this.formatMessage('pause') : this.formatMessage('play')}
                      >
                        {autoPlayStart ? <PauseOutlined className='mr-1' size='l' /> : <PlayCircleFilled className='mr-1' size='l' />}
                      </Button>
                    )}
                  </div>
                </div>
                )
              : (
                <div className='align-items-center' />
                )
          break
        case TemplateType.Slide3:
          navBtnGroup = (
            <Fragment>
              <div className='suspension-tools-top align-items-center justify-content-around'>
                {bookmarks.length > 1
                  ? (
                    <Dropdown size='sm' activeIcon>
                      <DropdownButton
                        arrow={false}
                        icon
                        size='sm'
                        type='default'
                        className='suspension-drop-btn'
                        title={this.formatMessage('bookmarkList')}
                      >
                        <TextDotsOutlined autoFlip className='suspension-drop-btn' />
                      </DropdownButton>
                      <DropdownMenu>
                        {bookmarks.map(item => {
                          const isActive = item.id === bookmarkOnViewId
                          return (
                            <DropdownItem key={item.id} active={isActive} onClick={() => { this.handleOnViewChange(item.id) }}>
                              {item.name}
                            </DropdownItem>
                          )
                        })}
                      </DropdownMenu>
                    </Dropdown>
                    )
                  : (
                    <div className='suspension-drop-placeholder' />
                    )}
              </div>
              <span className='suspension-top-number'>
                {current}/{totalCount}
              </span>
              <div className='suspension-tools-middle'>
                {bookmarks.length > 1 && (
                  <NavButtonGroup
                    type='tertiary'
                    vertical={false}
                    onChange={this.handleArrowChange}
                    className='middle-nav-group'
                    previousAriaLabel={`${current}/${totalCount}. ` + this.formatMessage('previousBookmark')}
                    nextAriaLabel={`${current}/${totalCount}. ` + this.formatMessage('nextBookmark')}
                    previousTitle={this.formatMessage('previousBookmark')}
                    nextTitle={this.formatMessage('nextBookmark')}
                  />
                )}
              </div>
              {config.autoPlayAllow && (
                <div className='suspension-middle-play'>
                  <Button
                    icon
                    className='bookmark-btn'
                    type='link'
                    onClick={this.handleAutoPlay}
                    title={autoPlayStart ? this.formatMessage('pause') : this.formatMessage('play')}
                    aria-label={autoPlayStart ? this.formatMessage('pause') : this.formatMessage('play')}
                  >
                    {autoPlayStart ? <PauseOutlined className='mr-1' size={30} /> : <PlayCircleFilled className='mr-1' size={30} />}
                  </Button>
                </div>
              )}
            </Fragment>
          )
          break
        default:
      }
      return navBtnGroup
    }
    return typedNavBtnGroup(config.templateType)
  }

  renderSlideScroll = (bookmarks: ImmutableArray<Bookmark>) => {
    const bookmarkGalleryList = bookmarks.map((item, index) => {
      const typeSnap = item.imgSourceType === ImgSourceType.Snapshot
      const imageSrc = typeSnap ? item.snapParam?.url : item.imgParam?.url
      const isBookmarkItemActive = index === this.state.highLightIndex
      const { displayName } = this.props.config
      return (
        <div className='gallery-slide-card' key={index}>
          <div
            className={classNames('w-100 h-100 bookmark-pointer gallery-slide-inner border-0', { 'active-bookmark-item': isBookmarkItemActive })}
            onClick={() => { this.onViewBookmark(item, false, index) }}
            role='listitem'
            aria-selected={isBookmarkItemActive}
            tabIndex={0}
            onKeyDown={evt => {
              if (evt.key === 'Enter' || evt.key === ' ') {
                evt.preventDefault()
                evt.stopPropagation()
              }
            }}
            onKeyUp={evt => {
              if (evt.key === 'Enter' || evt.key === ' ') {
                evt.stopPropagation()
                this.onViewBookmark(item)
              }
            }}
          >
            <div className={classNames('bookmark-slide-gallery', { 'd-none': !displayName && !item.description })}>
              <div className={classNames('bookmark-slide-title', { 'd-none': !displayName })}>{item.name}</div>
              <div className='bookmark-slide-description'>
                {item.description}
              </div>
            </div>
            {imageSrc
              ? <Image
                src={imageSrc}
                alt=''
                fadeInOnLoad
                imageFillMode={item.imagePosition}
              />
              : <div className='default-img'>
                <div className='default-img-svg'></div>
              </div>
            }
          </div>
        </div>
      )
    })
    const lastItem = <div className='gallery-slide-lastItem' key='last' />
    const scrollGalleryList = bookmarkGalleryList
      .asMutable({ deep: true })
      .concat(lastItem)
    return scrollGalleryList
  }

  renderCustomScroll = (bookmarks: ImmutableArray<Bookmark>) => {
    const LayoutEntry = this.getLayoutEntry()
    const { layouts } = this.props
    const bookmarkCustomList = bookmarks.map((item, index) => {
      const isBookmarkItemActive = index === this.state.highLightIndex
      return (
        <div className='gallery-slide-card' key={index}>
          <div
            className={classNames('w-100 h-100 bookmark-custom-pointer border-0', { 'active-bookmark-item': isBookmarkItemActive })}
            onClick={() => { this.onViewBookmark(item, false, index) }}
            role='listitem'
            aria-selected={isBookmarkItemActive}
            tabIndex={0}
          >
            <LayoutEntry
              isRepeat
              layouts={layouts[item.layoutName]}
              isInWidget
              className='layout-height'
            />
          </div>
        </div>
      )
    })
    const lastItem = <div className='gallery-slide-lastItem' key='last' />
    const scrollCustomList = bookmarkCustomList
      .asMutable({ deep: true })
      .concat(lastItem)
    return scrollCustomList
  }

  getMapBookmarks = (jimuMapView: JimuMapView) => {
    if (jimuMapView && jimuMapView?.dataSourceId) {
      const view = jimuMapView.view
      // del the map
      if (!view) return
      const mapSource = jimuMapView.view?.map as any
      // extra bookmark from map
      let extraBookmarks = []
      if (view.type === '3d') {
        let mpSourceJson
        try {
          mpSourceJson = mapSource.toJSON()
        } catch (error) {
          console.log(error)
        }
        extraBookmarks = mpSourceJson?.presentation?.slides
          ? JSON.parse(JSON.stringify(mpSourceJson?.presentation.slides))
          : []
      } else if (view.type === '2d') {
        extraBookmarks = mapSource?.bookmarks
          ? JSON.parse(JSON.stringify(mapSource.bookmarks))
          : []
      }
      return extraBookmarks.map((item, index) => {
        item.id = `mapOrigin-${index}`
        item.runTimeFlag = true
        item.mapOriginFlag = true
        item.mapDataSourceId = jimuMapView.dataSourceId
        if (item.thumbnail?.url) {
          item.imgParam = { url: item.thumbnail.url }
        } else {
          item.imgParam = {}
        }
        if (item.title?.text) {
          item.name = item.title.text
        }
        item.imagePosition = ImageFillMode.Fill
        return item
      })
    }
  }

  renderBookmarkList = (bookmarks: ImmutableArray<Bookmark>) => {
    const { appMode, config, selectionIsSelf, selectionIsInSelf } = this.props
    const { transitionInfo } = config
    const { bookmarkOnViewId, autoPlayStart, jimuMapView } = this.state
    const isWebMap = jimuMapView?.view?.type !== '3d'
    // get ds bookmark
    const mapBookmarks = this.getMapBookmarks(jimuMapView) || []
    const advancedTemplates = [TemplateType.Custom1, TemplateType.Custom2]
    if (!advancedTemplates.includes(config.templateType) && config.displayFromWeb) {
      bookmarks = bookmarks.concat(mapBookmarks)
    }
    const currentIndex =
      bookmarks.findIndex(x => x.id === bookmarkOnViewId) > -1
        ? bookmarks.findIndex(x => x.id === bookmarkOnViewId)
        : 0
    const previousIndex = currentIndex === 0 ? 1 : Math.max(0, currentIndex - 1)
    const directionIsHorizon = config.direction === DirectionType.Horizon
    const slideType = [
      TemplateType.Slide1,
      TemplateType.Slide2,
      TemplateType.Slide3,
      TemplateType.Custom1,
      TemplateType.Custom2
    ]
    const usePreviewId = (selectionIsSelf || selectionIsInSelf) ? transitionInfo?.previewId : null
    const previewId = usePreviewId || null
    const typedBookmarkList = (tempType: TemplateType) => {
      let bookmarkList
      switch (tempType) {
        case TemplateType.Card:
          bookmarkList = <CardList
          config={this.props.config}
          bookmarks = {bookmarks}
          runtimeBookmarkArray = {this.state.runtimeBmArray}
          runtimeBmItemsInfo = {this.state.runtimeBmItemsInfo}
          runtimeSnaps = {this.state.runtimeSnaps}
          highLightIndex = {this.state.highLightIndex}
          runtimeHighLightIndex = {this.state.runtimeHighLightIndex}
          onViewBookmark = {this.onViewBookmark}
          handleRuntimeTitleChange = {this.handleRuntimeTitleChange}
          onRuntimeBookmarkNameChange = {this.onRuntimeBookmarkNameChange}
          onRuntimeDelete = {this.handleRuntimeDelete}
          onRuntimeAdd = {this.handleRuntimeAdd}
          />
          break
        case TemplateType.List:
          bookmarkList = <ListItem
            config={this.props.config}
            bookmarks = {bookmarks}
            runtimeBookmarkArray = {this.state.runtimeBmArray}
            runtimeBmItemsInfo = {this.state.runtimeBmItemsInfo}
            highLightIndex = {this.state.highLightIndex}
            runtimeHighLightIndex = {this.state.runtimeHighLightIndex}
            onViewBookmark = {this.onViewBookmark}
            handleRuntimeTitleChange = {this.handleRuntimeTitleChange}
            onRuntimeBookmarkNameChange = {this.onRuntimeBookmarkNameChange}
            onRuntimeDelete = {this.handleRuntimeDelete}
            onRuntimeAdd = {this.handleRuntimeAdd}
          />
          break
        case TemplateType.Slide1:
          const viewTopContents = bookmarks.map(item =>
            this.renderSlideViewTop(item)
          )
          return (
            <Fragment>
              {config.pageStyle === PageStyle.Paging
                ? (
                  <TransitionContainer
                    previousIndex={previousIndex}
                    currentIndex={currentIndex}
                    transitionType={
                      transitionInfo?.transition?.type
                    }
                    direction={
                      transitionInfo?.transition?.direction
                    }
                    playId={previewId}
                  >
                    {viewTopContents}
                  </TransitionContainer>
                  )
                : (
                    this.renderSlideScroll(bookmarks)
                  )}
              {config.pageStyle === PageStyle.Scroll &&
                <NavButtons config={config} />
              }
              {config.pageStyle === PageStyle.Paging &&
                this.renderBottomTools()}
            </Fragment>
          )
        case TemplateType.Slide2:
          const viewTextContents = bookmarks.map(item =>
            this.renderSlideViewText(item)
          )
          return (
            <Fragment>
              {config.pageStyle === PageStyle.Paging
                ? (
                  <TransitionContainer
                    previousIndex={previousIndex}
                    currentIndex={currentIndex}
                    transitionType={
                      transitionInfo?.transition?.type
                    }
                    direction={
                      transitionInfo?.transition?.direction
                    }
                    playId={previewId}
                  >
                    {viewTextContents}
                  </TransitionContainer>
                  )
                : (
                    this.renderSlideScroll(bookmarks)
                  )}
              {config.pageStyle === PageStyle.Scroll &&
                <NavButtons config={config} />
              }
              {config.pageStyle === PageStyle.Paging &&
                this.renderBottomTools()}
            </Fragment>
          )
        case TemplateType.Slide3:
          const viewContents = bookmarks.map(item =>
            this.renderSlideViewBottom(item)
          )
          return (
            <Fragment>
              {config.pageStyle === PageStyle.Paging
                ? (
                  <TransitionContainer
                    previousIndex={previousIndex}
                    currentIndex={currentIndex}
                    transitionType={
                      transitionInfo?.transition?.type
                    }
                    direction={
                      transitionInfo?.transition?.direction
                    }
                    playId={previewId}
                  >
                    {viewContents}
                  </TransitionContainer>
                  )
                : (
                    this.renderSlideScroll(bookmarks)
                  )}
              {config.pageStyle === PageStyle.Scroll &&
                <NavButtons config={config} />
              }
              {config.pageStyle === PageStyle.Paging &&
                this.renderBottomTools()}
            </Fragment>
          )
        case TemplateType.Gallery:
          bookmarkList = <GalleryList
            config={this.props.config}
            bookmarks = {bookmarks}
            runtimeBookmarkArray = {this.state.runtimeBmArray}
            runtimeBmItemsInfo = {this.state.runtimeBmItemsInfo}
            runtimeSnaps = {this.state.runtimeSnaps}
            highLightIndex = {this.state.highLightIndex}
            runtimeHighLightIndex = {this.state.runtimeHighLightIndex}
            onViewBookmark = {this.onViewBookmark}
            handleRuntimeTitleChange = {this.handleRuntimeTitleChange}
            onRuntimeBookmarkNameChange = {this.onRuntimeBookmarkNameChange}
            onRuntimeDelete = {this.handleRuntimeDelete}
            onRuntimeAdd = {this.handleRuntimeAdd}
            isWebMap={isWebMap}
            widgetRect={this.state.widgetRect}
          />
          break
        case TemplateType.Navigator:
          const totalCount = config.bookmarks.length
          const current =
            config.bookmarks.findIndex(x => x.id === bookmarkOnViewId) > -1
              ? config.bookmarks.findIndex(x => x.id === bookmarkOnViewId) + 1
              : 1
          return (
            <div className='nav-bar d-flex align-items-center justify-content-around'>
              <Select
                size='sm'
                value={bookmarkOnViewId}
                onChange={this.handleOnViewChange}
                style={{ width: 32 }}
              >
                {this.getBookmarksOptions(bookmarks)}
              </Select>
              <Button
                icon
                className='bookmark-btn'
                type='tertiary'
                onClick={this.handleRuntimeAdd}
              >
                <PlusOutlined className='mr-1' size='l' />
              </Button>
              <NavButtonGroup
                type='tertiary'
                circle
                vertical={false}
                onChange={this.handleArrowChange}
                className='nav-btn'
              >
                <span>
                  {current}/{totalCount}
                </span>
              </NavButtonGroup>
              <Button
                icon
                className='bookmark-btn'
                type='tertiary'
                onClick={this.handleAutoPlay}
                title={autoPlayStart ? this.formatMessage('pause') : this.formatMessage('play')}
                aria-label={autoPlayStart ? this.formatMessage('pause') : this.formatMessage('play')}
                disabled={!config.autoPlayAllow}
              >
                {autoPlayStart ? <PauseOutlined className='mr-1' size='l' /> : <PlayCircleFilled className='mr-1' size='l' />}
              </Button>
            </div>
          )
        case TemplateType.Custom1:
        case TemplateType.Custom2:
          const isEditing = this.isEditing()
          const customContents = bookmarks.map(item =>
            this.renderCustomContents(item)
          )
          return (
            <Fragment>
              {config.pageStyle === PageStyle.Paging
                ? (
                  <TransitionContainer
                    previousIndex={previousIndex}
                    currentIndex={currentIndex}
                    transitionType={
                      transitionInfo?.transition?.type
                    }
                    direction={
                      transitionInfo?.transition?.direction
                    }
                    playId={previewId}
                  >
                    {customContents}
                  </TransitionContainer>
                  )
                : (
                    this.renderCustomScroll(bookmarks)
                  )}
              {config.pageStyle === PageStyle.Scroll &&
                <NavButtons config={config} />
              }
              {config.pageStyle === PageStyle.Paging &&
                this.renderBottomTools()}
              {!isEditing &&
                config.pageStyle === PageStyle.Paging &&
                appMode === AppMode.Design && (
                <div className='edit-mask position-absolute w-100' />
              )}
            </Fragment>
          )
      }
      return bookmarkList
    }
    const showGallery =
      config.templateType === TemplateType.Gallery ||
      (slideType.includes(config.templateType) &&
        config.pageStyle === PageStyle.Scroll)
    return (
      <div
        className={`bookmark-container ${
          showGallery
            ? directionIsHorizon
              ? 'gallery-container'
              : 'gallery-container-ver'
            : ''
        }`}
        ref={this.containerRef}
        role='list'
      >
        {typedBookmarkList(config.templateType)}
      </div>
    )
  }

  renderExampleSlideScroll = (bookmark: Bookmark) => {
    return (
      <div className='gallery-slide-card'>
        <div className='w-100 h-100 bookmark-pointer border-0'>
          <div className='bookmark-slide-gallery'>
            <div className='bookmark-slide-title'>{bookmark.title}</div>
            <div className='bookmark-slide-description'>
              {bookmark.description}
            </div>
          </div>
          <div className='default-img'>
            <div className='default-img-svg'></div>
          </div>
        </div>
      </div>
    )
  }

  renderBookmarkExample = (bookmark: Bookmark) => {
    const { appMode, config } = this.props
    const { jimuMapView } = this.state
    const directionIsHorizon = config.direction === DirectionType.Horizon
    const isWebMap = jimuMapView?.view?.type !== '3d'
    const typedBookmarkExampleList = (tempType: TemplateType) => {
      let bookmarkExample
      switch (tempType) {
        case TemplateType.Card:
          bookmarkExample = <CardExample
          config = {this.props.config}
          bookmarkName = {bookmark.name}
        />
          break
        case TemplateType.List:
          bookmarkExample = new Array(3).fill(1).map((item, index) => {
            return (
              <Paper className='d-flex bookmark-list-col bookmark-pointer' key={index}>
                {!config.hideIcon && <PinOutlined className='ml-4 bookmark-list-icon' />}
                <div className='ml-2 bookmark-list-title'>{bookmark.name}</div>
              </Paper>
            )
          })
          break
        case TemplateType.Slide1:
          bookmarkExample = (
            <Fragment>
              {config.pageStyle === PageStyle.Paging
                ? (
                  <TransitionContainer
                    previousIndex={1}
                    currentIndex={0}
                    transitionType={config.transition}
                    direction={config.transitionDirection}
                  >
                    <div className='w-100 h-100 bookmark-pointer border-0'>
                      <div className='bookmark-slide'>
                        <div className='bookmark-slide-title'>
                          {bookmark.title}
                        </div>
                        <div className='bookmark-slide-description'>
                          {bookmark.description}
                        </div>
                      </div>
                      <div className='default-img'>
                        <div className='default-img-svg'></div>
                      </div>
                    </div>
                  </TransitionContainer>
                  )
                : (
                    this.renderExampleSlideScroll(bookmark)
                  )}
              {config.pageStyle === PageStyle.Scroll &&
                <NavButtons config={config} />
              }
              {config.pageStyle === PageStyle.Paging &&
                this.renderBottomTools(true)}
            </Fragment>
          )
          break
        case TemplateType.Slide2:
          bookmarkExample = (
            <Fragment>
              {config.pageStyle === PageStyle.Paging
                ? (
                  <TransitionContainer
                    previousIndex={1}
                    currentIndex={0}
                    transitionType={config.transition}
                    direction={config.transitionDirection}
                  >
                    <div className='w-100 h-100 bookmark-pointer border-0'>
                      <div className='w-100' style={{ height: '40%' }}>
                        <div className='default-img'>
                          <div className='default-img-svg'></div>
                        </div>
                      </div>
                      <div className='bookmark-slide2'>
                        <div className='bookmark-slide2-title'>
                          {bookmark.title}
                        </div>
                        <div className='bookmark-slide2-description'>
                          {bookmark.description}
                        </div>
                      </div>
                    </div>
                  </TransitionContainer>
                  )
                : (
                    this.renderExampleSlideScroll(bookmark)
                  )}
              {config.pageStyle === PageStyle.Scroll &&
                <NavButtons config={config} />}
              {config.pageStyle === PageStyle.Paging &&
                this.renderBottomTools(true)}
            </Fragment>
          )
          break
        case TemplateType.Slide3:
          bookmarkExample = (
            <Fragment>
              {config.pageStyle === PageStyle.Paging
                ? (
                  <TransitionContainer
                    previousIndex={1}
                    currentIndex={0}
                    transitionType={config.transition}
                    direction={config.transitionDirection}
                  >
                    <div className='w-100 h-100 bookmark-pointer border-0'>
                      <div className='default-img'>
                        <div className='default-img-svg'></div>
                      </div>
                      <div className='bookmark-slide'>
                        <div className='bookmark-slide-title'>
                          {bookmark.title}
                        </div>
                        <div className='bookmark-slide-description'>
                          {bookmark.description}
                        </div>
                      </div>
                    </div>
                  </TransitionContainer>
                  )
                : (
                    this.renderExampleSlideScroll(bookmark)
                  )}
              {config.pageStyle === PageStyle.Scroll &&
                <NavButtons config={config} />
              }
              {config.pageStyle === PageStyle.Paging &&
                this.renderBottomTools(true)}
            </Fragment>
          )
          break
        case TemplateType.Gallery:
          bookmarkExample = <GalleryExample
            config = {this.props.config}
            bookmarkName = {bookmark.name}
            isWebMap={isWebMap}
            widgetRect={this.state.widgetRect}
          />
          break
        case TemplateType.Custom1:
        case TemplateType.Custom2:
          const isEditing = this.isEditing()
          const customExample = this.renderCustomExample()
          bookmarkExample = (
            <Fragment>
              {config.pageStyle === PageStyle.Paging
                ? (
                  <TransitionContainer
                    previousIndex={1}
                    currentIndex={0}
                    transitionType={config.transition}
                    direction={config.transitionDirection}
                  >
                    {customExample}
                  </TransitionContainer>
                  )
                : (
                  <div className='gallery-slide-card'>{customExample}</div>
                  )}
              {config.pageStyle === PageStyle.Scroll &&
                <NavButtons config={config} />
              }
              {config.pageStyle === PageStyle.Paging &&
                this.renderBottomTools(true)}
              {!isEditing &&
                config.pageStyle === PageStyle.Paging &&
                appMode === AppMode.Design && (
                <div className='edit-mask position-absolute w-100 h-100' />
              )}
            </Fragment>
          )
          break
        default:
      }
      return bookmarkExample
    }
    const showGallery = config.templateType === TemplateType.Gallery
    return (
      <div
        className={`bookmark-container ${
          showGallery
            ? directionIsHorizon
              ? 'gallery-container'
              : 'gallery-container-ver'
            : ''
        }`}
        ref={this.containerRef}
      >
        {typedBookmarkExampleList(config.templateType)}
      </div>
    )
  }

  onRuntimeBookmarkNameChange = (rbmId: string, newName: string) => {
    this.setState(prevState => {
      const updatedItem = {
        ...prevState.runtimeBmItemsInfo[rbmId],
        name: newName
      }

      const updatedRuntimeBmItemsInfo = {
        ...prevState.runtimeBmItemsInfo,
        [rbmId]: updatedItem
      }

      // update localStorage
      if (this.isUseCache) {
        utils.setLocalStorage(rbmId, JSON.stringify(updatedItem))
      }

      return {
        runtimeBmItemsInfo: updatedRuntimeBmItemsInfo
      }
    })
  }

  handleRuntimeTitleChange = (rbmId: string, event) => {
    const title = event.target.value
    this.setState(prevState => {
      const updatedItem = {
        ...prevState.runtimeBmItemsInfo[rbmId],
        name: title
      }

      const updatedRuntimeBmItemsInfo = {
        ...prevState.runtimeBmItemsInfo,
        [rbmId]: updatedItem
      }

      return {
        runtimeBmItemsInfo: updatedRuntimeBmItemsInfo
      }
    })
  }

  handleKeydown = (e: any, ref) => {
    if (e.key === 'Enter') {
      ref.current.blur()
    }
  }

  handleRuntimeDelete = (evt: React.MouseEvent<HTMLButtonElement>, rbmId: string) => {
    evt.stopPropagation()
    const runtimeBookmarkArray = this.state.runtimeBmArray.filter(id => id !== rbmId)
    if (this.isUseCache) {
      const runtimeBmId = getKey(this.props.id, this.props.mapWidgetId)
      utils.setLocalStorage(runtimeBmId, JSON.stringify(runtimeBookmarkArray))
      utils.removeFromLocalStorage(rbmId)
      this.runtimeSnapCache.delete(rbmId)
    }
    const { rmbId: rmbId1, ...newRuntimeSnaps } = this.state.runtimeSnaps
    const { rmbId: rmbId2, ...newRuntimeBmItemsInfo } = this.state.runtimeBmItemsInfo
    this.setState({
      runtimeBmArray: runtimeBookmarkArray,
      runtimeSnaps: newRuntimeSnaps,
      runtimeBmItemsInfo: newRuntimeBmItemsInfo
    })
  }

  // a bookmark loads JimuMapViewComponent only when more than 50% of itself is in viewport
  // this is mainly for multiple bookmarks connecting to one map in a scrolling page, e.g Flyer group screen
  rootRefCallback (rootRef: HTMLDivElement) {
    if (!rootRef) return
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }
    const handler = (entries: IntersectionObserverEntry[]) => {
      const intersectionRatio = entries[0]?.intersectionRatio
      const showInView = intersectionRatio > 0.5
      if (showInView) this.alreadyActiveLoading = false
      this.setState({ showInView })
    }
    this.intersectionObserver = new IntersectionObserver(handler, {
      threshold: [0, 0.5, 1]
    })
    this.intersectionObserver.observe(rootRef)
  }

  render () {
    const { config, id, useMapWidgetIds, theme, isPrintPreview, appMode } = this.props
    const { jimuMapView, apiLoaded, showInView } = this.state
    const { runtimeAddAllow } = config
    const classes = classNames(
      'jimu-widget',
      'widget-bookmark',
      'bookmark-widget-' + id,
      'useMapWidgetId-' + useMapWidgetIds?.[0]
    )
    const mapBookmarks = this.getMapBookmarks(jimuMapView) || []
    const bookmarks = getTotalBookmarks(config, mapBookmarks)
    const configLength = bookmarks.length
    const runtimeLength = this.state.runtimeBmArray.length
    const egBookmark: Bookmark = {
      id: 99999,
      name: this.formatMessage('_widgetLabel'),
      title: this.formatMessage('_widgetLabel'),
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      type: '2d',
      mapDataSourceId: 'dataSource_eg'
    }
    const isWebMap = jimuMapView?.view?.type !== '3d'

    return (
      <ViewVisibilityContext.Consumer>
        {({ isInView, isInCurrentView }: ViewVisibilityContextProps) => {
          let embedLoad = true
          embedLoad = isInView ? isInCurrentView : true
          if (!embedLoad) this.alreadyActiveLoading = false
          const widgetRect = this.state.widgetRect
          return (
            <Fragment>
              {embedLoad && (
                <div ref={this.rootRefCallback.bind(this)} className={classes} css={getStyle({ theme, config, id, appMode, widgetRect: widgetRect, configBookmarkNum: configLength, runtimeBookmarkNum: this.state.runtimeBmArray?.length, isWebMap })}>
                  <Fragment>
                    {(isPrintPreview || showInView) && apiLoaded && <JimuMapViewComponent
                      useMapWidgetId={useMapWidgetIds?.[0]}
                      onActiveViewChange={this.onActiveViewChange}
                      onViewGroupCreate={this.handleViewGroupCreate}
                    />}
                    {((runtimeAddAllow ||
                    runtimeLength !== 0 ||
                    configLength !== 0) && (useMapWidgetIds?.[0]))
                      ? <div className='h-100 d-flex flex-wrap bookmark-view-auto'>
                        {this.renderBookmarkList(config.bookmarks)}
                      </div>
                      : <div className='h-100 d-flex flex-wrap bookmark-view-auto'>
                        {this.renderBookmarkExample(egBookmark)}
                      </div>
                    }
                    {(config.templateType === TemplateType.Card || config.templateType === TemplateType.Gallery) && <ReactResizeDetector
                      targetRef={this.resizeConRef}
                      handleWidth
                      handleHeight
                      onResize={this.debounceOnResize}
                    />}
                    <div css={css`
                      position: absolute;
                      left: 0;
                      right: 0;
                      top: 0;
                      bottom: 0;
                      background: transparent;
                      pointer-events: none;
                    `} ref={this.resizeConRef}/>
                  </Fragment>
                </div>
              )}
            </Fragment>
          )
        }}
      </ViewVisibilityContext.Consumer>
    )
  }
}

export default Widget
