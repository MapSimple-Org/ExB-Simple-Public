/** @jsx jsx */
import {
  type UseDataSource,
  React,
  jsx,
  type ImmutableArray,
  APP_FRAME_NAME_IN_BUILDER,
  Immutable,
  lodash,
  type IMThemeVariables,
  css,
  polished,
  getAppStore,
  type ImmutableObject,
  type LayoutType,
  ResourceType,
  focusElementInKeyboardMode
} from 'jimu-core'
import { Button, FloatingPanel, ImageFillMode, Popper, type TargetType } from 'jimu-ui'
import {
  type JimuMapView,
  loadArcGISJSAPIModules,
  type JimuMapViewGroup
} from 'jimu-arcgis'
import { JimuMap, JimuDraw, type JimuDrawCreatedDescriptor, type DrawingUpdatedDescriptor } from 'jimu-ui/advanced/map'
import {
  type IMConfig,
  type Bookmark,
  TemplateType,
  Status,
  ImgSourceType
} from '../../config'
import { AppResourceManager, type ResourceItemInfo, getAppConfigAction } from 'jimu-for-builder'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { LeftOutlined } from 'jimu-icons/outlined/directional/left'
import { DrawOutlined } from 'jimu-icons/outlined/editor/draw'
import { viewChangeBufferCompare } from '../utils'
import { getLayersConfig, showLayersConfig } from '../../utils'

interface Props {
  theme: IMThemeVariables
  useMapWidgetIds?: ImmutableArray<string>
  useDataSources?: ImmutableArray<UseDataSource>
  jimuMapConfig?: IMConfig
  buttonLabel?: string
  title?: string
  id?: string
  isUseWidgetSize?: boolean
  className?: string
  style?: React.CSSProperties
  maxBookmarkId: number
  activeBookmarkId: number | string
  tempLayoutType: LayoutType

  onConfigChanged?: (config: IMConfig) => void
  onBookmarkUpdated: (bookmark: Bookmark) => void
  onShowBookmarkConfig: (ref) => void
  onAddNewBookmark: (bookmark: Bookmark) => void
  onClose: (isBookmarkDeleted?: boolean) => void
  formatMessage: (id: string, values?: any) => string
  duplicateNewLayouts: (
    originLayoutId: string,
    widgetId: string,
    layoutName: string,
    layoutLabel: string,
    layoutType?: LayoutType
  ) => string
}

interface SizeObj {
  width: number
  height: number
}

interface States {
  apiLoaded: boolean
  isShowDialog: boolean
  isChanged: boolean
  isSwitching: boolean
  currentSketch: __esri.Sketch
  currentJimuMapView: JimuMapView
  viewEditable: boolean
  graphics?: __esri.Graphic[]
  viewGroup: JimuMapViewGroup
  currentBookmark?: ImmutableObject<Bookmark>
  closeConfirmOpen: boolean
  mapSize: SizeObj
  mapRatio: number
  isDrawToolsOpen: boolean
  newFlag: boolean
  completeOperation: () => Promise<void>
  enableSymbolSelector: (enableFlag: boolean) => void
}

type MapTask = (...args: any[]) => any

const DEFAULT_WIDTH = 840

export class MarkPopper extends React.PureComponent<Props, States> {
  bookmarkId: number
  reference: HTMLDivElement
  popperRef: TargetType
  isSaving: boolean
  _uiOptions: any
  _drawingOptions: any
  Graphic: typeof __esri.Graphic = null
  GraphicsLayer: typeof __esri.GraphicsLayer = null
  LayerList: typeof __esri.LayerList = null
  Extent: typeof __esri.Extent = null
  Viewpoint: typeof __esri.Viewpoint = null
  reactiveUtils: typeof __esri.reactiveUtils = null
  addTemplateButtonRef: React.RefObject<HTMLButtonElement>
  floatingPanelCloseButton: HTMLButtonElement
  mapTaskQueue: MapTask[] = []
  watchLayerViewVisibleChangeHandles: __esri.WatchHandle[] = []

  constructor (props: Props) {
    super(props)
    const { jimuMapConfig, activeBookmarkId } = props
    const currentBookmark = jimuMapConfig?.bookmarks?.[activeBookmarkId] || null
    this.state = {
      apiLoaded: false,
      isShowDialog: false,
      isChanged: false,
      isSwitching: false,
      currentJimuMapView: null,
      viewGroup: undefined,
      currentSketch: null,
      graphics: [],
      currentBookmark,
      closeConfirmOpen: false,
      mapSize: this.getDefaultSize().innerSize,
      mapRatio: this.getMapRatio(),
      isDrawToolsOpen: true,
      viewEditable: true,
      newFlag: false,
      completeOperation: undefined,
      enableSymbolSelector: null
    }
    // If the parent component sends the method, the method is called to pass the child component this pointer
    if (props.onShowBookmarkConfig) {
      props.onShowBookmarkConfig(this)
    }
    this.bookmarkId = props.maxBookmarkId
    this.addTemplateButtonRef = React.createRef<HTMLButtonElement>()
    this.isSaving = false
    this._uiOptions = {
      isHideBgColor: true,
      isHideBorder: true
    }
    this._drawingOptions = {
      drawingElevationMode3D: 'relative-to-scene',
      visibleElements: {
        createTools: {
          customText: 'text'
        }
      }
    }
  }

  formatMessage = (id: string, values?) => {
    return this.props.formatMessage(id, values)
  }

  componentDidMount () {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules([
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/widgets/LayerList',
        'esri/Viewpoint',
        'esri/core/reactiveUtils'
      ]).then(modules => {
        ;[
          this.Graphic,
          this.GraphicsLayer,
          this.LayerList,
          this.Viewpoint,
          this.reactiveUtils
        ] = modules

        this.setState({
          apiLoaded: true
        })
      })
    }
  }

  componentDidUpdate (preProps, preStates) {
    const { currentSketch, graphics, currentJimuMapView } = this.state
    const { currentSketch: preCurrentSketch, graphics: preGraphics } = preStates
    const { activeBookmarkId, jimuMapConfig, onClose } = this.props

    const isBookmarkDeleted = activeBookmarkId !== 0 && jimuMapConfig && !jimuMapConfig.bookmarks.some(
      x => x.id === activeBookmarkId)
    if (isBookmarkDeleted) {
      onClose?.(true)
      this.setState({
        isShowDialog: false,
        viewEditable: true
      })
    }

    const layerChange = currentSketch?.layer && currentSketch.layer?.id !== preCurrentSketch?.layer?.id
    const graphicsChange = currentSketch?.layer && graphics !== preGraphics
    // repaint layer
    if (layerChange || graphicsChange) {
      this.changeLayerWithGraphics()
    }
    if (currentJimuMapView && currentJimuMapView.view) {
      while (this.mapTaskQueue.length > 0) {
        const mapTask = this.mapTaskQueue.shift()
        if (typeof mapTask === 'function') {
          mapTask()
        }
      }
    }
  }

  whenMapViewReady (mapTask: MapTask) {
    const { currentJimuMapView } = this.state
    if (currentJimuMapView && currentJimuMapView.view) {
      mapTask()
    } else {
      this.mapTaskQueue.push(mapTask)
    }
  }

  componentWillUnmount (): void {
    const { currentSketch, completeOperation } = this.state
    if (completeOperation) completeOperation()
    currentSketch?.destroy()
    if (this.watchLayerViewVisibleChangeHandles) {
      this.watchLayerViewVisibleChangeHandles.forEach(handle => {
        handle?.remove()
        handle = null
      })
    }
  }

  changeLayerWithGraphics = (reset?: boolean) => {
    const { graphics, currentSketch, currentBookmark } = this.state
    const currentLayer = currentSketch?.layer as __esri.GraphicsLayer
    const orgConfig = currentBookmark?.asMutable({ deep: true })
    const useGraphics = reset ? orgConfig?.graphics : graphics
    if (reset) {
      this.setState({ graphics: useGraphics })
    }
    const graphicsExist = useGraphics?.length > 0
    currentLayer?.removeAll()
    if (graphicsExist) {
      useGraphics &&
        useGraphics.forEach(graphic => {
          const tempGraphic = this.Graphic.fromJSON(graphic)
          tempGraphic.layer = currentLayer
          currentLayer?.add(tempGraphic)
        })
    }
  }

  checkChange (checkLayersConfig = false) {
    const { currentBookmark } = this.state
    if (!currentBookmark) return
    const bookmark = currentBookmark?.asMutable({ deep: true })
    const graphicsChanged = this.isGraphicsChanged(bookmark)
    const extentViewpointChanged = this.isExtentViewpointChanged(bookmark)
    const dataSourceIdChanged = this.isDataSourceIdChanged(bookmark)
    const layersConfigChanged = checkLayersConfig && this.isLayersConfigChanged(bookmark)
    this.setState({ isChanged: graphicsChanged || extentViewpointChanged || dataSourceIdChanged || layersConfigChanged })
  }

  isGraphicsChanged = (bookmark: Bookmark) => {
    const { graphics } = this.state
    return bookmark && !lodash.isDeepEqual(bookmark.graphics, graphics)
  }

  isExtentViewpointChanged (bookmark: Bookmark) {
    const { currentJimuMapView } = this.state
    if (!currentJimuMapView || !currentJimuMapView.view) return false
    let originExtentOrViewpoint: any
    let curExtentOrViewpoint: __esri.Extent | __esri.Viewpoint
    const view = currentJimuMapView.view
    if (bookmark.type === '2d') {
      originExtentOrViewpoint = bookmark?.extent && JSON.parse(JSON.stringify(bookmark.extent))
      curExtentOrViewpoint = view?.extent && JSON.parse(JSON.stringify(view.extent.toJSON()))
    }
    if (bookmark.type === '3d') {
      originExtentOrViewpoint = bookmark?.viewpoint && JSON.parse(JSON.stringify(bookmark.viewpoint))
      curExtentOrViewpoint = view?.viewpoint && JSON.parse(JSON.stringify(view.viewpoint.toJSON()))
    }
    return !viewChangeBufferCompare(originExtentOrViewpoint, curExtentOrViewpoint, bookmark.type)
  }

  isDataSourceIdChanged (bookmark: Bookmark) {
    const { currentJimuMapView } = this.state
    if (!currentJimuMapView || !currentJimuMapView.view) return false
    return currentJimuMapView.dataSourceId !== bookmark.mapDataSourceId
  }

  isLayersConfigChanged (bookmark: Bookmark) {
    const { currentJimuMapView } = this.state
    if (!currentJimuMapView || !currentJimuMapView.view) return false
    const allLayers = currentJimuMapView.view.map.layers.toArray()
    const layersConfig = getLayersConfig(allLayers)
    return layersConfig && !lodash.isDeepEqual(bookmark.layersConfig, layersConfig)
  }

  locateAndSetLayersConfig = () => {
    const { currentJimuMapView } = this.state
    if (!currentJimuMapView || !currentJimuMapView.view) return
    const { currentBookmark } = this.state
    const config = currentBookmark.asMutable({ deep: true })
    const { viewpoint } = config
    // location
    currentJimuMapView.view.goTo(this.Viewpoint.fromJSON(viewpoint))
    // layers visibility
    const layersArray = currentJimuMapView.view.map.layers.toArray()
    // This variable indicates whether the current map is the map for which the bookmark corresponds.
    // If it is not, the variable is true, need to keep the layer attribute of the map itself.
    const mapDsChange = currentJimuMapView.dataSourceId !== config.mapDataSourceId
    showLayersConfig(
      layersArray,
      config.layersConfig,
      mapDsChange
    )
  }

  // turn base64 to file
  dataURLtoFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  uploadSnapFile = (dataUrl: string, activeBookmarkId: number | string, callback: (snapshot: ResourceItemInfo) => void) => {
    const { id } = this.props
    const timestamp = new Date().getTime()
    const snapFile = this.dataURLtoFile(
      dataUrl,
      `${id}-snap${activeBookmarkId}-${timestamp}`
    )
    const timeString = new Date().getTime().toString()
    const fileName = snapFile.name
    const portalFileName = `${fileName}.jpg`
    const fileSize = snapFile.size
    const fileFormat = snapFile.type
    const resourceItemInfo: ResourceItemInfo = {
      file: snapFile,
      fileName: portalFileName,
      originalName: fileName,
      type: ResourceType.Image,
      widgetId: id ? id.replace(/\./g, '_').replace(/\-/g, '_') : null
    }

    let resourceInfo: ResourceItemInfo
    AppResourceManager.assignBlobUrlToResourceItem(resourceItemInfo)
      .then(
        newResourceItemInfo => {
          AppResourceManager.getInstance().uploadAppResource(newResourceItemInfo)
          resourceInfo = {
            fileName: portalFileName,
            originalName: fileName,
            url: newResourceItemInfo.blobUrl,
            type: ResourceType.Image,
            size: fileSize,
            created: Number(timeString),
            resourcesPrefix: newResourceItemInfo.resourcesPrefix,
            fileFormat: fileFormat
          }
          callback(resourceInfo)
        },
        error => {
          console.error(error)
        }
      )
  }

  // Get focus after clicking save & reset button for 508.
  focusOnCloseButton = () => {
    if (!this.floatingPanelCloseButton) {
      this.floatingPanelCloseButton = document.querySelector<HTMLButtonElement>('div[role="dialog"] .bookmark-panel-header button.action-close')
    }
    focusElementInKeyboardMode(this.floatingPanelCloseButton)
  }

  handleClickUpdate = () => {
    const { currentSketch, completeOperation } = this.state
    this.isSaving = true
    this.focusOnCloseButton()
    if (currentSketch) {
      //When the user clicks the save button, cancel the current sketch drawing process so that the screenshot won't take the mouse pointer.
      currentSketch.cancel()

      completeOperation().then(() => {
        this.isSaving = false
        const { currentJimuMapView, graphics } = this.state
        const { activeBookmarkId, jimuMapConfig } = this.props
        const toEditBookmarkConfig = jimuMapConfig.bookmarks.find(
          x => x.id === activeBookmarkId
        )
        const customType = [TemplateType.Custom1, TemplateType.Custom2]
        this.setState({
          isShowDialog: true,
          isChanged: false
        })
        const view = currentJimuMapView.view
        const allLayers = view.map.layers.toArray()
        const layersConfig = getLayersConfig(allLayers)
        const imgShot = toEditBookmarkConfig.snapParam
        const updateBookmark = (snapShot?: ResourceItemInfo) => {
          const bookmark: Bookmark = {
            id: activeBookmarkId,
            name: toEditBookmarkConfig.name,
            title: toEditBookmarkConfig.title,
            description: toEditBookmarkConfig.description,
            type: view.type,
            imgParam: toEditBookmarkConfig.imgParam,
            snapParam: snapShot || imgShot,
            imagePosition: toEditBookmarkConfig.imagePosition,
            imgSourceType: toEditBookmarkConfig.imgSourceType,
            extent: view.extent.toJSON(),
            viewpoint: view.viewpoint.toJSON(),
            graphics,
            showFlag: true,
            mapDataSourceId: currentJimuMapView.dataSourceId,
            layersConfig
          }
          if (customType.includes(jimuMapConfig.templateType)) {
            bookmark.layoutId = toEditBookmarkConfig.layoutId
            bookmark.layoutName = toEditBookmarkConfig.layoutName
          }
          this.setState({ currentBookmark: Immutable(bookmark) })
          this.props.onBookmarkUpdated(bookmark)
        }
        const isSnapshot =
          toEditBookmarkConfig.imgSourceType === ImgSourceType.Snapshot
        if (isSnapshot) {
          view.takeScreenshot().then(screenshot => {
            if (screenshot.dataUrl) {
              this.uploadSnapFile(
                screenshot.dataUrl,
                activeBookmarkId,
                updateBookmark
              )
            }
          })
        } else {
          updateBookmark()
        }
      })
    }
  }

  handleClickClose = (evt, delLastFlag?: boolean) => {
    const boundingClientRect = evt?.target?.getBoundingClientRect()
    this.popperRef = {
      getBoundingClientRect: () => boundingClientRect
    }
    const { isChanged } = this.state
    if (isChanged && !delLastFlag) {
      this.setState({ closeConfirmOpen: true })
    } else {
      // After closing the window and opening it again, the jimuMapView refreshes to a new view without layers
      this.setState({
        isShowDialog: false,
        viewEditable: true
      })
      focusElementInKeyboardMode(this.addTemplateButtonRef.current)
      this.props.onClose?.()
    }
  }

  handleClickReset = () => {
    this.focusOnCloseButton()
    this.changeLayerWithGraphics(true)
    this.locateAndSetLayersConfig()
  }

  addNewShowConfig = async () => {
    const { currentJimuMapView } = this.state
    if (!currentJimuMapView || !currentJimuMapView.view) return
    const view = currentJimuMapView.view
    // new a bookmark with default snapshot
    const newBookmark = (snapShot: ResourceItemInfo) => {
      this.bookmarkId++
      const allLayers = view.map.layers.toArray()
      const layersConfig = getLayersConfig(allLayers)
      const bookmark: Bookmark = {
        id: this.bookmarkId,
        name: `${this.formatMessage('bookmarkName')}-${this.bookmarkId}`,
        title: `${this.formatMessage('bookmarkName')}-${this.bookmarkId}`,
        type: view.type,
        imgParam: {},
        snapParam: snapShot || {},
        imagePosition: ImageFillMode.Fill,
        imgSourceType: ImgSourceType.Snapshot,
        extent: view.extent.toJSON(),
        viewpoint: view.viewpoint.toJSON(),
        graphics: [],
        showFlag: true,
        mapDataSourceId: currentJimuMapView?.dataSourceId ? currentJimuMapView?.dataSourceId : currentJimuMapView?.dataSourceId,
        layersConfig
      }
      const { jimuMapConfig, id, tempLayoutType } = this.props
      const customType = [TemplateType.Custom1, TemplateType.Custom2]
      if (customType.includes(jimuMapConfig.templateType)) {
        let originLayoutId: string
        // get origin layoutId from last one or from temp
        if (jimuMapConfig.bookmarks && jimuMapConfig.bookmarks.length > 0) {
          const mutableBookmark = jimuMapConfig.bookmarks.asMutable()
          originLayoutId = mutableBookmark[mutableBookmark.length - 1].layoutId
        } else {
          const appStateInBuilder = getAppStore().getState().appStateInBuilder
          const appConfig = appStateInBuilder.appConfig
          originLayoutId =
            appConfig.widgets[id].layouts[Status.Default][
              appStateInBuilder.browserSizeMode || appConfig.mainSizeMode
            ]
        }
        const newLayoutId = this.props.duplicateNewLayouts(
          originLayoutId,
          id,
          `Bookmark-${this.bookmarkId}`,
          `Bookmark-${this.bookmarkId}-label`,
          tempLayoutType
        )
        bookmark.layoutName = `Bookmark-${this.bookmarkId}`
        bookmark.layoutId = newLayoutId

        //When adding the first bookmark item, delete the default layout
        if (jimuMapConfig.bookmarks.length === 0) {
          const appConfig = getAppStore().getState().appStateInBuilder.appConfig
          const appConfigAction = getAppConfigAction(appConfig)
          appConfigAction.removeLayoutFromWidget(id, 'DEFAULT')
          const newConfig = appConfigAction.appConfig
          appConfigAction.editWidgetProperty(id, 'config', newConfig).exec()
        }
      }
      this.setState({
        graphics: [],
        isChanged: false,
        viewEditable: true,
        currentBookmark: Immutable(bookmark)
      }, () => {
        this.locateAndSetLayersConfig()
      })
      this.props.onAddNewBookmark(bookmark)
    }
    // There is an additional delay because of JSAPI
    await Promise.race([
      this.reactiveUtils.whenOnce(() => !view.updating),
      new Promise((resolve) => setTimeout(resolve, 3000)) // Set 3s timeout, if the map still not finish loading, take the screenshot directly.
    ])
    const screenshot = await view.takeScreenshot()
    if (screenshot.dataUrl) {
      this.uploadSnapFile(
        screenshot.dataUrl,
        this.bookmarkId + 1,
        newBookmark
      )
    }
  }

  showDialogAndEdit = async () => {
    const { activeBookmarkId, jimuMapConfig } = this.props
    const { currentBookmark, viewGroup, currentJimuMapView } = this.state
    const config = currentBookmark.asMutable({ deep: true })
    const activeBookmarkConfig = jimuMapConfig.bookmarks.find(x => x.id === activeBookmarkId)
    const dataSourceGroup = viewGroup?.jimuMapViews ? Object.keys(viewGroup.jimuMapViews).map(id => viewGroup.jimuMapViews[id].dataSourceId) : []
    const isOriginBookmarkInDSGroup = dataSourceGroup.findIndex(x => x === activeBookmarkConfig?.mapDataSourceId) > -1
    // This situation need to determine whether to switchMap
    const activeViewDsId = viewGroup?.getActiveJimuMapView()?.dataSourceId
    if (isOriginBookmarkInDSGroup && config && activeViewDsId && activeViewDsId !== config.mapDataSourceId) {
      viewGroup?.switchMap()
    }
    const view = currentJimuMapView.view
    await this.reactiveUtils.whenOnce(() => !view.updating)
    this.changeLayerWithGraphics()
    this.locateAndSetLayersConfig()
    this.setState({
      viewEditable: true
    })
  }

  handleActiveViewChange = (jimuMapView: JimuMapView) => {
    const { currentJimuMapView } = this.state
    // Switching map: Resolve draw component's current support for hybrid maps
    if (currentJimuMapView && (currentJimuMapView.id !== jimuMapView.id)) {
      this.setState({ isSwitching: true }, () => {
        this.setState({ isSwitching: false })
      })
    }
    this.setState({
      currentJimuMapView: jimuMapView
    }, () => {
      this.checkChange()
    })
  }

  handleEditWhenOpen = (bookmark: ImmutableObject<Bookmark>) => {
    const { isShowDialog } = this.state
    if (isShowDialog) this.handleNewOrEdit(bookmark)
  }

  getDialogStatus = () => {
    const { isShowDialog } = this.state
    return isShowDialog
  }

  handleNewOrEdit = (config?: ImmutableObject<Bookmark>) => {
    const { viewEditable, currentSketch } = this.state
    // Continuous clicking only triggers one new addition
    if (!viewEditable) return
    if (currentSketch) currentSketch.cancel()
    this.setState({
      isShowDialog: true,
      viewEditable: false,
      currentBookmark: config,
      graphics: config?.asMutable({ deep: true })?.graphics || [],
      newFlag: !config
    }, () => {
      this.whenMapViewReady(() => {
        if (config) {
          this.showDialogAndEdit()
        } else {
          this.addNewShowConfig()
        }
      })
    })
  }

  handleViewGroupCreate = (viewGroup: JimuMapViewGroup) => {
    this.setState({ viewGroup })
  }

  handleJimuMapViewCreated = (jimuMapView: JimuMapView) => {
    const view = jimuMapView.view
    const layers = view.map.layers
    const recursiveWatchLayer = (layers) => {
      layers.forEach(layer => {
        this.watchLayerViewVisibleChangeHandles.push(this.reactiveUtils.watch(() => layer.visible, (newValue, oldValue) => {
          if (newValue !== oldValue) {
            this.checkChange(true)
          }
        }))
        const children = layer?.layers || layer.sublayers || layer.allSublayers
        if (children && children.length > 0) recursiveWatchLayer(children.toArray())
      })
    }
    recursiveWatchLayer(layers)
  }

  querySelector (selector: string): HTMLElement {
    const appFrame: HTMLIFrameElement = document.querySelector(
      `iframe[name="${APP_FRAME_NAME_IN_BUILDER}"]`
    )
    if (appFrame) {
      const appFrameDoc =
        appFrame.contentDocument || appFrame.contentWindow.document
      return appFrameDoc.querySelector(selector)
    }
    return null
  }

  getDefaultSize = () => {
    const layoutElem = this.querySelector(
      `div.widget-renderer[data-widgetid="${this.props.useMapWidgetIds[0]}"]`
    )
    const maxHeight = document.querySelector('#default')
      ? document.querySelector('#default').clientHeight - 20
      : 1080
    let innerSize = { width: DEFAULT_WIDTH, height: 850 }
    let innerMapSize = { width: DEFAULT_WIDTH, height: DEFAULT_WIDTH }
    if (layoutElem) {
      const clientRect = layoutElem.getBoundingClientRect()
      const ratio = clientRect.width / clientRect.height || 1
      let defaultExpandWidth = clientRect.width * 1.1
      let defaultExpandHeight = clientRect.height * 1.1 + 111
      let defaultMapWidth = clientRect.width * 1.1
      let defaultMapHeight = clientRect.height * 1.1
      // width
      if (defaultExpandWidth < DEFAULT_WIDTH) {
        defaultExpandWidth = DEFAULT_WIDTH
        defaultExpandHeight = DEFAULT_WIDTH / ratio + 111
        defaultMapWidth = DEFAULT_WIDTH
        defaultMapHeight = DEFAULT_WIDTH / ratio
      } else if (defaultExpandWidth > 1080) {
        defaultExpandWidth = 1080
        defaultExpandHeight = 1080 / ratio + 111
        defaultMapWidth = 1080
        defaultMapHeight = 1080 / ratio
      }
      // height
      if (defaultExpandHeight > maxHeight) {
        defaultExpandHeight = maxHeight
        defaultExpandWidth =
          (maxHeight - 111) * ratio > DEFAULT_WIDTH ? (maxHeight - 111) * ratio : DEFAULT_WIDTH
      }
      if (defaultMapHeight > maxHeight - 111) {
        defaultMapHeight = maxHeight - 111
        defaultMapWidth = (maxHeight - 111) * ratio
      }
      innerSize = {
        width: defaultExpandWidth,
        height: defaultExpandHeight
      }
      innerMapSize = {
        width: defaultMapWidth - 2,
        height: defaultMapHeight
      }
    }
    return { innerSize, innerMapSize }
  }

  getMapRatio = () => {
    const layoutElem = this.querySelector(
      `div.widget-renderer[data-widgetid="${this.props.useMapWidgetIds[0]}"]`
    )
    let ratio = 1
    if (layoutElem) {
      const clientRect = layoutElem.getBoundingClientRect()
      ratio = clientRect.width / clientRect.height || 1
    }
    return ratio
  }

  getWidgetPosition = () => {
    const isRTL = getAppStore().getState().appStateInBuilder.appContext.isRTL
    let pos = { x: 500, y: 50 }
    const { innerSize } = this.getDefaultSize()
    const width = isRTL
      ? 260
      : document.body.clientWidth - innerSize.width - 260
    pos = { x: width, y: 50 }
    return pos
  }

  onDrawCreatedCallback = (jimuDrawCompleteDescriptor: JimuDrawCreatedDescriptor) => {
    const { sketch, completeOperation, enableSymbolSelector } = jimuDrawCompleteDescriptor
    this.setState({ currentSketch: sketch, completeOperation, enableSymbolSelector })
  }

  toggleDrawTools = () => {
    const { isDrawToolsOpen, enableSymbolSelector } = this.state

    if (!isDrawToolsOpen) {
      enableSymbolSelector(false)
    } else {
      enableSymbolSelector(true)
    }

    this.setState({ isDrawToolsOpen: !isDrawToolsOpen })
  }

  onDrawEndCallback = (newGraphic: __esri.Graphic) => {
    const { graphics } = this.state
    const newGraphicJson = newGraphic.toJSON()
    // use id to edit and delete graphics, id is now already produce by Draw
    this.setState({
      graphics: graphics.concat(newGraphicJson)
    }, () => {
      this.checkChange()
    })
  }

  onDrawUpdatedCallback = ({ type, graphics }: DrawingUpdatedDescriptor): void => {
    const { graphics: originGraphics } = this.state
    let noChangeCount = 0
    graphics.forEach(graphic => {
      const jsonGraphic = graphic.toJSON()
      const updateIndex = originGraphics.findIndex(
        item => item.attributes.jimuDrawId === jsonGraphic.attributes.jimuDrawId
      )
      // Handle the problem of triggering a callback function when clicked
      const orgGraphicGeo =
        updateIndex > -1 ? originGraphics[updateIndex].geometry : {}
      const newGraphicGeo = jsonGraphic.geometry
      const orgGraphicSym =
        updateIndex > -1 ? originGraphics[updateIndex].symbol : {}
      const newGraphicSym = jsonGraphic.symbol
      // when click save button trigger the editCallback
      if (this.isSaving) {
        if (
          lodash.isDeepEqual(orgGraphicGeo, newGraphicGeo) &&
          lodash.isDeepEqual(orgGraphicSym, newGraphicSym)
        ) {
          noChangeCount++
          return
        }
      } else {
        if (
          lodash.isDeepEqual(orgGraphicGeo, newGraphicGeo) &&
          type === 'complete'
        ) {
          noChangeCount++
          return
        }
      }
      if (type === 'deleted') {
        if (updateIndex > -1) originGraphics.splice(updateIndex, 1)
      } else if (type === 'complete') {
        if (updateIndex > -1) {
          const temp = originGraphics[updateIndex]
          originGraphics[updateIndex] = jsonGraphic
          originGraphics[updateIndex].symbol = temp.symbol
        }
      }
    })
    if (noChangeCount !== graphics.length) {
      this.setState({
        graphics: originGraphics
      }, () => {
        this.checkChange()
      })
    }
  }

  onDrawClearedCallback = () => {
    this.setState({
      graphics: []
    }, () => {
      this.checkChange()
    })
  }

  handleCloseOk = () => {
    const { currentSketch, completeOperation } = this.state
    if (completeOperation) completeOperation()
    currentSketch?.destroy()
    focusElementInKeyboardMode(this.addTemplateButtonRef.current)

    this.setState({
      isShowDialog: false,
      closeConfirmOpen: false,
      viewEditable: true
    })
    this.props.onClose?.()
  }

  handleCloseBtn = () => {
    this.setState({ closeConfirmOpen: false })
  }

  getPopperStyle = (theme: IMThemeVariables) => {
    return css`
      .popper-content {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .popper-header {
          width: 100%;
          flex-shrink: 0;
          flex-grow: 0;
          cursor: move;
        }
        .map-container {
          width: 100%;
          height: 100%;
          background-color: gray;
          display: contents;
        }
        .popper-footer {
          background: ${theme.ref.palette.neutral[400]};
          color: ${theme.ref.palette.neutral[1000]};
          padding: ${theme.sys.spacing(2)} ${theme.sys.spacing(3)};
          .left-btn {
            position: absolute;
            margin: 6px;
          }
          .left-tool {
            position: absolute;
            left: 55px;
            z-index: 10;
            min-width: 440px;
          }
          .hidden-tool {
            display: none;
          }
          .right-btn {
            height: 45px;
            padding: 6px 2px;
            .btn {
              min-width: 80px;
            }
          }
          /* TODO hack API v4.32, /Beijing-R-D-Center/ExperienceBuilder/issues/23070 */
          .esri-sketch {
            background-color: var(--sys-color-secondary-dark) !important;
          }
        }
      }
    `
  }

  resizeRatio = size => {
    const maxElem = this.querySelector('body')
    const maxClientRect = maxElem.getBoundingClientRect()
    const { mapRatio } = this.state
    let { width } = size
    if (width > 1080) width = 1080
    let height = width / mapRatio + 111
    if (height > maxClientRect.height) {
      height = maxClientRect.height
      width = (maxClientRect.height - 111) * mapRatio
    }
    this.setState({ mapSize: { width, height } })
  }

  render () {
    const {
      currentJimuMapView,
      isShowDialog,
      isSwitching,
      isChanged,
      closeConfirmOpen,
      isDrawToolsOpen,
      viewEditable,
      newFlag
    } = this.state
    const { title, theme } = this.props
    const useMapWidget =
      this.props.useMapWidgetIds && this.props.useMapWidgetIds[0]
    const config = getAppStore().getState().appStateInBuilder.appConfig
    const isRTL = getAppStore().getState().appStateInBuilder.appContext.isRTL
    if (!config.widgets[useMapWidget]) return null
    let useDataSource = config.widgets[useMapWidget].useDataSources
    // use the current view of Map widget
    if (newFlag) {
      const initialMapDataSourceID =
        config.widgets[useMapWidget].config?.initialMapDataSourceID
      const needToReverse = () => {
        return (
          useDataSource &&
          useDataSource.length > 1 &&
          initialMapDataSourceID &&
          useDataSource[0].dataSourceId !== initialMapDataSourceID
        )
      }
      if (needToReverse()) {
        useDataSource = Immutable(
          useDataSource.asMutable({ deep: true }).reverse()
        )
      }
    }
    const toolConfig = {
      canZoom: true,
      canHome: true,
      canSearch: true,
      canCompass: true,
      canNavigation: true,
      canLayers: true
    }
    const jimuMapConfig = this.props.jimuMapConfig
      ? this.props.jimuMapConfig.set('toolConfig', toolConfig)
      : Immutable({} as any)
    const panelHeader = css`
      .panel-header {
        background: ${theme.ref.palette.neutral[400]};
        color: ${theme.ref.palette.neutral[1000]};
        height: 50px;
        flex-shrink: 0;
        font-size: 1rem;
        font-weight: 500;
        .jimu-btn {
          color: ${theme.ref.palette.neutral[1000]} !important;
        }
        & >.actions >.jimu-btn.action-close :hover {
          color: ${theme.ref.palette.black};
        }
      }
    `
    const { innerMapSize, innerSize } = this.getDefaultSize()

    const confirmPopper = (
      <Popper open={closeConfirmOpen} reference={this.popperRef} placement='top'>
        <div
          css={css`
            position: absolute;
            z-index: 11;
            top: -16px;
            left: -${innerSize.width - 27}px;
            background-color: ${polished.rgba(
            theme.sys.color.secondary.main,
            0.65
          )};
            width: ${innerSize.width}px;
            height: ${innerSize.height}px;
            .real-container {
              background-color: ${theme.ref.palette.neutral[400]};
              border: 1px solid ${theme.ref.palette.neutral[700]};
              background-clip: padding-box;
              width: 400px;
              position: relative;
              top: 50%;
              margin: -60px auto 0;
              padding: 30px;
            }
            .confirm-context {
              .title-icon{
                padding: 0 6px;
              }
              .title-label{
                font-size: 1rem;
              }
            }
            .confirm-footer {
              display: flex;
              justify-content: flex-end;
              margin-top: 30px;
              button {
                cursor: pointer;
                margin-left: 10px;
                min-width: 80px;
              }
            }
        `}
        >
          <div className='real-container'>
            <div className='confirm-context d-flex align-items-start'>
              <div className='title-icon'>
                <WarningOutlined size={24} color={'var(--sys-color-warning-main)'} />
              </div>
              <div className='title-label' role='alert' aria-live='polite'>
                {this.formatMessage('confirmUnsave')}
              </div>
            </div>
            <div className='confirm-footer'>
              <Button type='primary' onClick={this.handleCloseOk}>
                {this.formatMessage('yes')}
              </Button>
              <Button onClick={this.handleCloseBtn}>
                {this.formatMessage('cancel')}
              </Button>
            </div>
          </div>
        </div>
      </Popper>
    )

    const floatingPanel = (
      <FloatingPanel
        onHeaderClose={(evt) => { this.handleClickClose(evt) }}
        defaultPosition={this.getWidgetPosition()}
        headerTitle={title}
        size={innerSize}
        minSize={{ width: DEFAULT_WIDTH, height: 850 }}
        disableResize
        css={panelHeader}
        headerClassName='bookmark-panel-header'
        className='surface-2'
        disableActivateOverlay
        dragBounds='body'
      >
        <div
          className='rounded-1 w-100 h-100'
          css={this.getPopperStyle(theme)}
          ref={ref => { this.reference = ref }}
        >
          <div className='popper-content'>
            <div
              style={{
                width: `${innerMapSize.width}px`,
                height: `${innerMapSize.height}px`,
                margin: '0 auto'
              }}
            >
              <div className='map-container'>
                <JimuMap
                  id={`${this.props.id}editor`}
                  useDataSources={useDataSource}
                  jimuMapConfig={jimuMapConfig}
                  onActiveViewChange={this.handleActiveViewChange}
                  onExtentChanged={() => { this.checkChange() }}
                  onViewPointChanged={() => { this.checkChange() }}
                  onViewGroupCreate={this.handleViewGroupCreate}
                  onJimuMapViewCreated={this.handleJimuMapViewCreated}
                />
                {confirmPopper}
              </div>
            </div>
            <div className='popper-footer'>
              <div className='left-btn'>
                <Button icon type='tertiary' onClick={this.toggleDrawTools}>
                  {isDrawToolsOpen
                    ? <LeftOutlined className='mr-1' css={css`${isRTL && 'transform: scaleX(-1);'}`} />
                    : <DrawOutlined className='mr-1' css={css`${isRTL && 'transform: scaleX(-1);'}`} />
                  }
                </Button>
              </div>
              <div className={`left-tool ${isDrawToolsOpen ? '' : 'hidden-tool'}`}>
                {currentJimuMapView &&
                  currentJimuMapView.view &&
                  !isSwitching && (
                  <JimuDraw
                    jimuMapView={currentJimuMapView}
                    operatorWidgetId={this.props.id}
                    drawingOptions={this._drawingOptions}
                    uiOptions={this._uiOptions}
                    onJimuDrawCreated={this.onDrawCreatedCallback}
                    onDrawingFinished={this.onDrawEndCallback}
                    onDrawingUpdated={this.onDrawUpdatedCallback}
                    onDrawingCleared={this.onDrawClearedCallback}
                  />
                )}
              </div>
              <div className='float-right right-btn'>
                <Button
                  className='mr-2'
                  type='primary'
                  onClick={this.handleClickUpdate}
                  disabled={!isChanged}
                  data-testid='popperSaveBtn'
                >
                  {isChanged
                    ? this.formatMessage('save')
                    : this.formatMessage('saved')}
                </Button>
                <Button
                  className='mr-1'
                  onClick={this.handleClickReset}
                  disabled={!isChanged}
                >
                  {this.formatMessage('reset')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FloatingPanel>
    )

    return (
      <div className='w-100'>
        <Button
          className='w-100 text-default map-popper-btn'
          type='primary'
          disabled={!viewEditable}
          onClick={() => { this.handleNewOrEdit() }}
          ref={this.addTemplateButtonRef}
        >
          {this.props.buttonLabel}
        </Button>
        {isShowDialog && floatingPanel}
      </div>
    )
  }
}
