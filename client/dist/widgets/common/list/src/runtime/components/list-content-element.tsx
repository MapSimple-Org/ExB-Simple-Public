/** @jsx jsx */
import { React, jsx, DataSourceStatus, AppMode, MessageManager, DataRecordsSelectionChangeMessage, defaultMessages as jimuCoreDefaultMessage, focusElementInKeyboardMode } from 'jimu-core'
import type { DataRecord, QueriableDataSource, DataSource, FeatureLayerDataSource, } from 'jimu-core'
import { getFocusableElements, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { Status, LIST_CARD_MIN_SIZE, PageStyle, DS_TOOL_H, ListLayoutType } from '../../config'
import type { ListDivSize, ElementSize, WidgetRect, ListProps } from '../../config'
import { LayoutEntry } from 'jimu-layouts/layout-runtime'
import { getListContentLeftPadding, getItemColumnCount, initNewCardSize, getListVisibleStartIndex } from '../utils/list-element-util'
import { getListMaxSize, checkIsLastPage } from '../utils/utils'
import { listStyle } from '../styles/style'
import defaultMessages from '../translations/default'
import * as listUtils from '../utils/utils'
import { ListContainerContext } from '../state'
import TopTools from './tools/top-tools'
import { ListBottomTools } from './tools/bottom-tools'
import ListComponent from './list/list'
import DataCountComponent from './data-source/data-count'
import RecordLoadStatusA11y from './list-status-component/record-load-status-a11y'
import LoadingComponent from './list-status-component/loading-component'
import DataSourceComponent from './data-source/data-source-component'
import ListResizeDetector from './tools/list-resize-detector'
import EmptyAndNotReadyTipsElement from './list-status-component/empty-and-not-ready-tips'
import WidgetLoadingAndWidgetPlaceholder from './list-status-component/widget-loading-widget-placeholder'
import MaskOfList from './list-status-component/mask'

const MESSAGES = Object.assign({}, defaultMessages, jimuUIDefaultMessages, jimuCoreDefaultMessage)

interface BodySize {
  scrollWidth: number
  scrollHeight: number
  clientWidth: number
  clientHeight: number
}

interface Props {
  isEditing: boolean
  showTopTools: boolean
  showBottomTools: boolean
  listWidgetConRef: any
  setPaginatorDivRef: (ref) => void
  paginatorDiv: any
}

export interface ListStates {
  LayoutEntry: any
  showList: boolean
  hideCardTool: boolean
  showLoading: boolean
  listDivSize: ListDivSize
  isScrollEnd: boolean
  isMount: boolean
  createDataSourceFailed: boolean
}

export class Widget extends React.PureComponent<ListProps & Props, ListStates> {
  listRef: any = React.createRef()
  listOutDivRef: HTMLDivElement
  totalCount: number
  isSwitchPage: boolean
  needScroll: boolean
  needRefreshListOnListRendered: boolean
  listVisibleStartIndex: number
  listVisibleStopIndex: number
  setPageTimeout: any
  onItemsRenderedTimeout: any
  isHasScrolled: boolean = false /* Whether the List has scrolled */
  bodySize: BodySize
  isHasRenderList: boolean = false
  pageSize: number
  needAutoScrollToSelectedItemWhenLoadPage: boolean = false
  autoScrollIndex: number = null
  isScrollToNextStep: boolean = false
  jumpOutNodeOfListInBottom: HTMLDivElement
  jumpOutNodeOfListInTop: HTMLDivElement
  topToolsContainer: HTMLDivElement
  bottomToolsContainer: HTMLDivElement
  isScrollEnd: boolean = false
  loadMoreDataTimeout = null
  queryOptions = null
  hasGetListSizeByResizeDetector = false
  isCurrentPageLastPage = false
  preDataSource: DataSource
  hideCardTool = false
  selectRecordTimeout = null

  needScrollToItemsIndexAfterLoadRecords = null

  static contextType = ListContainerContext
  declare context: React.ContextType<typeof ListContainerContext>

  constructor (props) {
    super(props)
    const stateObj: ListStates = {
      LayoutEntry: null,
      showList: true,
      hideCardTool: false,
      showLoading: false,
      listDivSize: {
        clientWidth: null,
        clientHeight: null
      },
      isScrollEnd: false,
      isMount: false,
      createDataSourceFailed: false
    }

    if (window.jimuConfig.isInBuilder) {
      stateObj.LayoutEntry = this.props.builderSupportModules.LayoutEntry
    } else {
      stateObj.LayoutEntry = LayoutEntry
    }
    this.state = stateObj

    this.handleResizeCard = this.handleResizeCard.bind(this)
  }

  componentDidMount () {
    this.setState({
      isMount: true
    })
  }

  componentWillUnmount () {
    clearTimeout(this.updateCardToolTimeout)
    clearTimeout(this.setPageTimeout)
    clearTimeout(this.onItemsRenderedTimeout)
  }

  componentDidUpdate (preProps, preState) {
    const { dataSource } = this.context.state
    // update card size and position of card tools in builder
    this.updateSizeAndCardPositionWhenPropsChangeInBuilder(preProps, preState)

    // listen appMode change
    this.appModeChange(preProps)

    //Update widget state when widget config change
    this.selectRecordsWhenConfigChange(preProps)
    this.preDataSource = dataSource
  }

  updateSizeAndCardPositionWhenPropsChangeInBuilder = (preProps, preState) => {
    if (!window.jimuConfig.isInBuilder) return

    // listen layout properties change and then update list
    this.updateScrollContentSize(preProps.config)

    let needUpdateCardToolPosition = this.layoutPropertiesChange(preProps, preState)
    // listening listDiv size's change
    needUpdateCardToolPosition = this.listDivSizeChange(preProps, preState, needUpdateCardToolPosition)
    if (needUpdateCardToolPosition) {
      this.updateCardToolPosition()
    }
  }

  selectRecordsWhenConfigChange = (preProps) => {
    const { config } = this.props
    const isSelectionModeChange = config.cardConfigs[Status.Selected].selectionMode !== preProps.config.cardConfigs[Status.Selected].selectionMode
    if (isSelectionModeChange) {
      this.selectRecordsAndPublishMessageAction([])
    }
  }

  updateCurrentCardSize = (currentCardSize: ElementSize) => {
    this.context.dispatch({type: 'SET_CURRENT_CARD_SIZE', value: currentCardSize})
    this.resetListElement()
  }

  layoutPropertiesChange = (preProps, preState): boolean => {
    const { config, top, left } = this.props
    let needUpdateCardToolPosition = false
    if (!window.jimuConfig.isInBuilder) return false

    let refreshList: boolean = false
    // listen layout properties change and then update list
    const currentCardSize = this.getCardSizeNumberInConfig()
    const oldCardSize = this.getCardSizeNumberInConfig(preState?.widgetRect, preProps)

    this.updateScrollContentSize(preProps.config)

    const isWidgetPositionChange = top !== preProps.top || left !== preProps.left
    const isListLayoutChange = config?.layoutType !== preProps.config.layoutType
    const isEqualCardSizeByListLayout = !listUtils.isEqualCardSizeByListLayout(oldCardSize, currentCardSize, config.layoutType) // for change template

    if (isListLayoutChange || isEqualCardSizeByListLayout || isWidgetPositionChange) {
      needUpdateCardToolPosition = true
      if (isEqualCardSizeByListLayout) {
        refreshList = true
        this.updateCurrentCardSize(currentCardSize)
        this.resetListElement()
      } else if (isListLayoutChange) {
        this.handleResizeCard(this.context.state.currentCardSize, true, false, false, true)
      }
    }

    if (!refreshList) {
      const isSpaceNotChange = config?.layoutType === ListLayoutType.GRID
        ? listUtils.isEqualNumber(config?.horizontalSpace, preProps.config?.horizontalSpace) && listUtils.isEqualNumber(config?.verticalSpace, preProps.config?.verticalSpace)
        : listUtils.isEqualNumber(config.space, preProps.config.space)
      if (!isSpaceNotChange || config.layoutType !== preProps.config.layoutType) {
        refreshList = true
        this.resetListElement()
      }
    }
    return needUpdateCardToolPosition
  }

  getCardSizeNumberInConfig = (widgetRect?: WidgetRect, props?: ListProps) => {
    props = props || this.props
    widgetRect = widgetRect || this.context.state.widgetRect
    const { browserSizeMode, builderStatus, config } = props
    return listUtils.getCardSizeNumberInConfig(config, builderStatus, browserSizeMode, widgetRect)
  }

  listDivSizeChange = (preProps, preState, needUpdateCardToolPosition: boolean): boolean => {
    const { config, isHeightAuto, showBottomTools, showTopTools, paginatorDiv } = this.props
    const { listDivSize, createDataSourceFailed } = this.state
    const { dataSource } = this.context.state
    const currentCardSize = this.getCardSizeNumberInConfig()
    const showLoading = !this.isHasRenderList && !createDataSourceFailed
    if (showLoading || (dataSource && !this.preDataSource)) {
      return needUpdateCardToolPosition
    }
    const oldShowBottomTools = preProps?.showBottomTools
    const oldShowTopTools = preProps?.showTopTools

    const showBottomToolsChanged = showBottomTools !== oldShowBottomTools
    const showTopToolsChanged = showTopTools !== oldShowTopTools
    if (showBottomToolsChanged || showTopToolsChanged) {
      if (!isHeightAuto) {
        if (config.layoutType === ListLayoutType.Column) {
          let cardH = this.context.state.widgetRect?.height || listDivSize?.clientHeight
          cardH -= listUtils.getBottomToolH(paginatorDiv, showBottomTools) + (showTopTools ? 1 : 0) * DS_TOOL_H

          if (cardH < LIST_CARD_MIN_SIZE) return
          const cardSize = {
            height: cardH,
            width: currentCardSize.width
          }
          this.handleResizeCard(cardSize, true, false, false, true)
        }
      } else {
        needUpdateCardToolPosition = true
      }
    }
    return needUpdateCardToolPosition
  }

  appModeChange = preProps => {
    const { appMode } = this.props
    if (preProps.appMode !== appMode && appMode === AppMode.Design) {
      this.scrollToIndex(0)
    }
  }

  updateScrollContentSize = preConfig => {
    const { config } = this.props
    const isSpaceNotChange = config?.layoutType === ListLayoutType.GRID
      ? listUtils.isEqualNumber(config?.horizontalSpace, preConfig?.horizontalSpace) && listUtils.isEqualNumber(config?.verticalSpace, preConfig?.verticalSpace)
      : listUtils.isEqualNumber(config.space, preConfig.space)
    if (config.layoutType !== preConfig.layoutType || !isSpaceNotChange) {
      this.setScrollContentSize()
    }
  }

  getNewAddedSelectedRecordsId = (datasource: DataSource) => {
    const lastSelectedRecordIds = this.context.state.selectedRecordsId || []
    const selectedRecordIds = datasource.getSelectedRecordIds() || []
    const newAddedSelectedRecords = selectedRecordIds?.filter(id => {
      return !lastSelectedRecordIds?.includes(id)
    })
    return newAddedSelectedRecords
  }

  updateCreateDataSourceFailed = (createDataSourceFailed: boolean) => {
    this.setState({
      createDataSourceFailed: createDataSourceFailed
    })
  }

  updateHasGetListSizeByResizeDetector = (hasGetListSizeByResizeDetector: boolean) => {
    this.hasGetListSizeByResizeDetector = hasGetListSizeByResizeDetector
  }

  updateCardToolTimeout
  private readonly updateCardToolPosition = () => {
    const { selectionIsSelf } = this.props
    if (!selectionIsSelf || this.hideCardTool) return
    this.setState({
      hideCardTool: true
    })
    this.hideCardTool = true
    clearTimeout(this.updateCardToolTimeout)
    this.updateCardToolTimeout = setTimeout(() => {
      this.hideCardTool = false
      this.setState({
        hideCardTool: false
      })
    }, 500)
  }

  private readonly resetListElement = (shouldForceUpdate: boolean = true) => {
    if (this.listRef.current) {
      if (this.props.config?.layoutType === ListLayoutType.GRID) {
        //VariableSizeGrid caches offsets and measurements for each item for performance purposes.
        //This method clears that cached data for all items after (and including) the specified indices. It should be called whenever an items size changes.
        //https://react-window.vercel.app/#/api/VariableSizeGrid
        this.resetAfterIndices()
      } else {
        //VariableSizeList caches offsets and measurements for each index for performance purposes.
        //This method clears that cached data for all items after (and including) the specified index. It should be called whenever a item's size changes.
        this.listRef?.current?.resetAfterIndex && this.listRef?.current?.resetAfterIndex(0, shouldForceUpdate)
      }
    }
  }

  toggleCardTool = (hideCardTool = false) => {
    this.hideCardTool = hideCardTool
    this.setState({
      hideCardTool: hideCardTool
    })
  }

  resetAfterIndices = (shouldForceUpdate: boolean = true) => {
    this.listRef?.current?.resetAfterIndices && this.listRef?.current?.resetAfterIndices({
      columnIndex: 0,
      rowIndex: 0,
      shouldForceUpdate: shouldForceUpdate
    })
  }

  private readonly selectRecordsAndPublishMessageAction = (records: DataRecord[]) => {
    const { dataSource } = this.context.state
    if (dataSource) {
      MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(this.props.id, records, [dataSource.id]))
      if (records) {
        const selectedRecordsId = records?.map(record => record.getId()) || []
        this.context.dispatch({ type: 'SET_SELECTED_RECORDS_ID', value: selectedRecordsId })

        //Use timeout to wait for the latest selectedRecordsId to be synchronized to list/data-source-component
        clearTimeout(this.selectRecordTimeout)
        this.selectRecordTimeout = setTimeout(() => {
          dataSource.selectRecordsByIds(records.map(record => record.getId()))
        })
      }
    }
  }

  formatMessage = (id: string, values?: { [key: string]: any }) => {
    return this.props.intl.formatMessage({ id: id, defaultMessage: MESSAGES[id] }, values)
  }

  scrollToIndex = (index: number, type: string = 'start') => {
    const { config } = this.props
    if (this.listRef.current) {
      if (config?.layoutType === ListLayoutType.GRID) {
        const columnCount = this.getItemColumnCount()
        const rowIndex = Math.floor(index / columnCount)
        this.listRef.current.scrollToItem({
          columnIndex: index - rowIndex * columnCount,
          rowIndex: rowIndex,
          align: type
        })
      } else {
        this.listRef.current.scrollToItem(index, type)
      }
    }
  }

  scrollToSelectedItems = (datasource: DataSource) => {
    const selectedRecordIds = datasource.getSelectedRecordIds()
    if (selectedRecordIds && selectedRecordIds.length > 0 && this.context.state.needScrollToSelectedItems) {
      if (this.context.state.needScrollToSelectedItems || this.needScroll) {
        const newAddedSelectedRecordsId = this.getNewAddedSelectedRecordsId(datasource)
        const newScrollToSelectedRecordsId = newAddedSelectedRecordsId?.length > 0 ? newAddedSelectedRecordsId : selectedRecordIds

        let indexOfNeedScrollToItem = -1
        //Find index of need scroll to item index in current records
        this.context.state.records?.forEach((record, i) => {
          const recordId = record?.getId?.()
          if (newScrollToSelectedRecordsId?.includes(recordId)) {
            indexOfNeedScrollToItem = i
          }
        })

        if (indexOfNeedScrollToItem === -1) {
          // Can't find it, need to search in all records again
          const records = datasource.getRecords()
          records && records.forEach((record, i) => {
            if (record.getId?.() === selectedRecordIds[0]) {
              indexOfNeedScrollToItem = i
            }
          })

          if (indexOfNeedScrollToItem > -1) {
            const newPage = Math.ceil((indexOfNeedScrollToItem + 1) / this.context.state.pageSize)
            this.needScroll = true
            this.updatePage(newPage)
          }
        } else {
          //Scroll to selected item
          this.scrollToIndex(indexOfNeedScrollToItem)
          this.needScroll = false
          //loadMore may be triggered during scrollToItem, and the scrollToIndex logic in handleScrollDown will be triggered at this time,
          //but this logic is not needed when automatically jumping to the currently selected records
          this.autoScrollIndex = indexOfNeedScrollToItem
          this.needAutoScrollToSelectedItemWhenLoadPage = true
          this.context.dispatch({ type: 'SET_NEED_SCROLL_TO_SELECTED_ITEM', value: false })
        }
      }
    }
  }

  handleScrollUp = e => {
    const { lastScrollOffset } = this
    const { config } = this.props
    const { currentCardSize } = this.context.state
    const columnCount = this.getItemColumnCount()
    if (e) {
      this.isScrollToNextStep = true
    }
    const scrollStep = this.getScrollStep()
    const listVisibleStartIndex = getListVisibleStartIndex({lastScrollOffset, config, currentCardSize, columnCount})
    let toIndex = listVisibleStartIndex - scrollStep
    if (toIndex < 0) {
      toIndex = 0
    }
    this.scrollToIndex(toIndex, 'start')
    this.isScrollToNextStep = false
  }

  handleScrollDown = e => {
    const { lastScrollOffset } = this
    const { config } = this.props
    const { currentCardSize } = this.context.state
    const columnCount = this.getItemColumnCount()
    const listVisibleStartIndex = getListVisibleStartIndex({lastScrollOffset, config, currentCardSize, columnCount})
    if (e) {
      this.isScrollToNextStep = true
    }
    const scrollStep = this.getScrollStep()
    const { listVisibleStopIndex } = this
    const scrollToNextPage = listVisibleStopIndex + scrollStep >= this.context.state.records.length - 1 && !this.isCurrentPageLastPage
    if (scrollToNextPage) {
      if (e) {
        this.needScrollToItemsIndexAfterLoadRecords = (listVisibleStartIndex + scrollStep)
      }
      this.isSwitchPage = true
      this.updatePage(this.context.state.page + 1)
    } else {
      if (this.needAutoScrollToSelectedItemWhenLoadPage) {
        this.scrollToIndex(this.autoScrollIndex)
      } else {
        this.scrollToIndex(listVisibleStartIndex + scrollStep, 'start')
      }
    }
  }

  scrollToItemAfterLoadRecords = () => {
    //Scroll to item after load records
    if (this.needScrollToItemsIndexAfterLoadRecords) {
      this.scrollToIndex(this.needScrollToItemsIndexAfterLoadRecords, 'start')
      this.needScrollToItemsIndexAfterLoadRecords = null
    }
  }

  getScrollStep = () => {
    const { scrollStep, layoutType } = this.props.config
    const step = this.isScrollToNextStep ? scrollStep : 0
    const columnCount = this.getItemColumnCount()
    return layoutType === ListLayoutType.GRID ? step * columnCount : step
  }

  updatePage = (pageNum: number, setIsSwitchPage?: boolean) => {
    if (pageNum !== this.context.state.page) {
      setIsSwitchPage && (this.isSwitchPage = true)
      this.context.dispatch({ type: 'SET_PAGE', value: pageNum })
    }
  }

  lastScrollOffset = 0
  handleListScroll = ({
    scrollDirection,
    scrollOffset,
    scrollTop,
    scrollUpdateWasRequested
  }) => {
    const { appMode, config } = this.props
    const listDiv = this.listOutDivRef
    const { scrollStatus, dataSource } = this.context.state
    this.lastScrollOffset = config?.layoutType === ListLayoutType.GRID ? scrollTop : scrollOffset
    if (!listDiv || (this.context.state.records?.length ?? 0) < 1) return

    const pageStyleIsScrollAndNotLoading = config.pageStyle === PageStyle.Scroll && this.context.state.queryStatus !== DataSourceStatus.Loading
    const notDesignMode = !window.jimuConfig.isInBuilder || appMode !== AppMode.Design
    if (pageStyleIsScrollAndNotLoading && dataSource && notDesignMode) {
      this.isHasScrolled = true
      if (listUtils.hasScrollToStartItem(listDiv, this.lastScrollOffset)) {
        if (scrollStatus !== 'start') {
          this.updateScrollStatus('start')
        }
      } else {
        if (scrollStatus !== 'mid') {
          this.updateScrollStatus('mid')
        }
      }
    }

    this.updateFirstItemIndexInViewport()
  }

  updateFirstItemIndexInViewport = () => {
    const { lastScrollOffset } = this
    const { config } = this.props
    const { currentCardSize } = this.context.state
    const columnCount = this.getItemColumnCount()
    const startIndex = getListVisibleStartIndex({lastScrollOffset, config, currentCardSize, columnCount, completelyVisibleItem: true})
    this.context.dispatch({type: 'SET_FIRST_ITEM_INDEX_IN_VIEWPORT', value: startIndex || 0})
  }

  updateScrollStatus = (scrollStatus: "start" | "end" | "mid") => {
    this.context.dispatch({type: 'SET_SCROLL_STATUS', value: scrollStatus})
  }

  handleResizeCard = (
    newCardSize,
    resizeEnd: boolean = false,
    isTop?: boolean,
    isLeft?: boolean,
    isReplace: boolean = false
  ) => {
    if (resizeEnd) {
      const cardSize = this.initNewCardSize(newCardSize)
      const { id, browserSizeMode, config } = this.props
      const resizeOption = {
        widgetId: id,
        browserSizeMode: browserSizeMode,
        newCardSize: cardSize,
        widgetConfig: config
      }
      window.jimuConfig.isInBuilder && this.props.builderSupportModules.widgetModules.handleResizeCard(resizeOption, isReplace)
    } else {
      this.updateCurrentCardSize(newCardSize)
      this.resetListElement(false)
    }
  }

  initNewCardSize = (newCardSize: ElementSize) => {
    //If the original width and height are percentages, px will be converted to percentages during resize, and then set to config
    const { config, browserSizeMode, builderStatus } = this.props
    const { widgetRect } = this.context.state
    return initNewCardSize(newCardSize, config, builderStatus, browserSizeMode, widgetRect)
  }

  handleRefreshList = (ds: FeatureLayerDataSource) => {
    const { id, config } = this.props
    ds.load(this.queryOptions, { widgetId: id, refresh: true })
    if (config.showRecordCount) {
      ds.loadCount(this.queryOptions, { widgetId: id, refresh: true })
    }
  }

  getListSize = () => {
    const { widgetRect } = this.context.state
    const { id, config, useDataSources, paginatorDiv } = this.props
    const { dataSource } = this.context.state
    return listUtils.getSizeOfListWidget({
      id,
      datasource: dataSource,
      widgetRect,
      config,
      useDataSources: useDataSources?.asMutable({ deep: true }),
      paginatorDiv: paginatorDiv
    })
  }

  setListRef = (ref) => {
    this.listRef.current = ref
  }

  handleListKeyUp = (e) => {
    if (e.key === 'Escape') {
      this.focusInteractiveNode(false)
    }
  }

  focusInteractiveNode = (toTop = false) => {
    const { showBottomTools, showTopTools, paginatorDiv } = this.props
    const showTools = toTop ? showTopTools : showBottomTools
    const jumpOutNodeOfList = toTop ? this.jumpOutNodeOfListInTop : this.jumpOutNodeOfListInBottom
    if (showTools) {
      const interactiveNodeCon = toTop ? this.topToolsContainer : paginatorDiv
      const firstInteractiveNode = getFocusableElements(interactiveNodeCon)?.filter(element => !(element as any)?.disabled)
      if (firstInteractiveNode?.length > 0) {
        focusElementInKeyboardMode(firstInteractiveNode[0] as any)
      } else {
        focusElementInKeyboardMode(jumpOutNodeOfList)
      }
    } else {
      focusElementInKeyboardMode(jumpOutNodeOfList)
    }
  }

  loadNextPageWhenListSizeOrTotalCountChange = () => {
    const { config } = this.props
    if (config.pageStyle === PageStyle.Scroll) {
      //When the list is initialized for the first time, this.totalCount cannot be obtained in the intersectionObserverCallback method,
      //so when the totalCount changes, you need to manually trigger the intersectionObserverCallback.
      //https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/17865
      clearTimeout(this.loadMoreDataTimeout)
      this.loadMoreDataTimeout = setTimeout(() => {
        if (this.isScrollEnd) {
          this.isHasScrolled = true
          this.scrollToEndCallback(true)
        }
      }, 500)
    }
  }

  setListOutDivRef = current => {
    if (!current) return
    this.listOutDivRef = current
    this.setListDivSize()
    this.setScrollContentSize()
  }

  getDsSelectRecords = () => {
    const ds = this.context.state.dataSource
    const { config } = this.props
    // get select records
    let selectRecords
    if (ds && config.isItemStyleConfirm) {
      selectRecords = ds.getSelectedRecords()
    }
    return selectRecords
  }

  getListStyle = () => {
    const { config, appMode, theme, isHeightAuto, isWidthAuto, showBottomTools, showTopTools, paginatorDiv } = this.props
    const { currentCardSize, widgetRect }= this.context.state

    const bottomToolH = listUtils.getBottomToolH(paginatorDiv, showBottomTools)
    const listTemplateDefaultCardSize = this.getCardSizeNumberInConfig()
    const listStyleOption = {
      pageStyle: config?.pageStyle,
      scrollBarOpen: config?.scrollBarOpen,
      direction: config?.direction,
      appMode: appMode,
      theme: theme,
      isHeightAuto: isHeightAuto,
      isWidthAuto: isWidthAuto,
      listTemplateDefaultCardSize: listTemplateDefaultCardSize,
      showTopTools: showTopTools,
      bottomToolH: bottomToolH,
      mexSize: this.getListMaxSize(),
      layoutType: config?.layoutType,
      listLeftPadding: getListContentLeftPadding(config, widgetRect, currentCardSize)
    }
    return listStyle(listStyleOption)
  }

  setScrollContentSize = () => {
    if (!this.listOutDivRef) return
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { layoutType } = this.props?.config
    const listScrollContent = this.listOutDivRef.getElementsByTagName('div')[0]

    if (layoutType === ListLayoutType.Column) {
      listScrollContent.style.height = '100%'
    } else {
      listScrollContent.style.width = '100%'
    }
  }

  scrollToEndCallback = (isScrollEnd: boolean) => {
    const { appMode, config } = this.props
    const listDiv = this.listOutDivRef
    const { dataSource } = this.context.state
    this.setState({
      isScrollEnd: isScrollEnd
    })
    this.isScrollEnd = isScrollEnd
    if (!listDiv || (this.context.state.records?.length ?? 0) < 1) return
    const pageStyleIsScroll = config.pageStyle === PageStyle.Scroll
    const dsNotLoading = this.context.state.queryStatus !== DataSourceStatus.Loading
    const notDesignMode = (!window.jimuConfig.isInBuilder || (appMode !== AppMode.Design && isScrollEnd))
    if (pageStyleIsScroll && dsNotLoading && dataSource && notDesignMode && this.isHasScrolled) {
      if (!this.isCurrentPageLastPage) {
        this.updatePage(this.context.state.page + 1)
        this.isSwitchPage = true
      } else {
        if (isScrollEnd) {
          this.updateScrollStatus('end')
        }
      }
    }
  }

  setListDivSize = () => {
    const listDiv = this.listOutDivRef
    const clientWidth = listDiv?.clientWidth || null
    const clientHeight = listDiv?.clientHeight || null
    this.setState({
      listDivSize: {
        clientWidth: clientWidth,
        clientHeight: clientHeight
      }
    })
  }

  getListMaxSize = () => {
    const { boundingBox, heightLayoutItemSizeModes, layoutId, appMode, pageMode, browserSizeMode } = this.props
    const option = {
      boundingBox,
      heightLayoutItemSizeModes,
      layoutId,
      appMode,
      pageMode,
      browserSizeMode
    }
    return getListMaxSize(option)
  }

  onItemsRendered = ({
    overscanStartIndex,
    overscanStopIndex,
    visibleStartIndex,
    visibleStopIndex,
    visibleColumnStartIndex,
    visibleColumnStopIndex,
    visibleRowStartIndex,
    visibleRowStopIndex
  }) => {
    const { config } = this.props
    // All index params are numbers.
    this.listVisibleStartIndex = config?.layoutType === ListLayoutType.GRID ? this.getItemIndexByRowAndColumnIndex(visibleRowStartIndex, visibleColumnStartIndex) : visibleStartIndex
    this.listVisibleStopIndex = config?.layoutType === ListLayoutType.GRID ? this.getItemIndexByRowAndColumnIndex(visibleRowStopIndex, visibleColumnStopIndex) : visibleStopIndex
    if (this.needRefreshListOnListRendered) {
      this.needRefreshListOnListRendered = false
      this.resetListElement()
    }

    if (this.isSwitchPage) return
    if (config.pageStyle === PageStyle.Scroll) {
      if (this.context.state.records.length > this.listVisibleStopIndex + 1) {
        this.isSwitchPage = false
        this.onItemsRenderedTimeout = setTimeout(() => {
          this.handleScrollDown(null)
          if (this.isScrollToNextStep) {
            this.isScrollToNextStep = false
          }
        }, 500)
      }
    } else {
      this.isSwitchPage = false
    }
  }

  getItemIndexByRowAndColumnIndex = (rowIndex, columnIndex) => {
    const columnCount = this.getItemColumnCount()
    return rowIndex * columnCount + columnIndex
  }

  getItemColumnCount = () => {
    const { config } = this.props
    const { currentCardSize, widgetRect } = this.context.state
    return getItemColumnCount(config, widgetRect, currentCardSize)
  }

  onListContainerMouseMove = () => {
    if (this.needAutoScrollToSelectedItemWhenLoadPage && this.context.state.records) {
      this.needAutoScrollToSelectedItemWhenLoadPage = false
    }
  }

  updateQueryOptions = (query) => {
    this.queryOptions = query
  }

  updateTopToolsContainer = (ref) => {
    this.topToolsContainer = ref
  }

  updateBottomToolsContainer = (ref) => {
    this.bottomToolsContainer = ref
  }

  renderContentOfListWidget = () => {
    const { LayoutEntry, isScrollEnd } = this.state
    const { config, useDataSources, id, selectionIsInSelf, selectionIsSelf, appMode, builderStatus, builderSupportModules, layouts, isEditing, showBottomTools, showTopTools, paginatorDiv, setPaginatorDivRef} = this.props
    const { dataSource, page, records, pageSize } = this.context.state
    const listProps = { id, config, selectionIsInSelf, selectionIsSelf, builderStatus, builderSupportModules, layouts }
    this.isHasRenderList = true
    this.isCurrentPageLastPage = checkIsLastPage(dataSource as QueriableDataSource, page, pageSize, records?.length)

    return (
      <div
        className='list-container animation'
        css={this.getListStyle()}
      >
        <div className='sr-only' tabIndex={-1} ref={ref => { this.jumpOutNodeOfListInTop = ref }}>{this.formatMessage('pressTabToContinue')}</div>
        {/* Top tool */}
        {showTopTools && <TopTools
          id={id}
          useDataSources={useDataSources}
          config={config}
          isEditing={isEditing}
          selectRecords={this.getDsSelectRecords()}
          scrollToIndex={this.scrollToIndex}
          handleRefreshList={this.handleRefreshList}
          selectRecordsAndPublishMessageAction={this.selectRecordsAndPublishMessageAction}
          updateTopToolsContainer={this.updateTopToolsContainer}
        />}

        {/* List element */}
        <ListComponent
          listProps={listProps as any}
          LayoutEntry={LayoutEntry}
          hideCardTool={this.hideCardTool}
          useDataSources={useDataSources}
          getListSize={this.getListSize}
          toggleCardTool={this.toggleCardTool}
          handleListScroll={this.handleListScroll}
          setListOutDivRef={this.setListOutDivRef}
          handleResizeCard={this.handleResizeCard}
          onItemsRendered={this.onItemsRendered}
          setListRef={this.setListRef}
          scrollToEndCallback={this.scrollToEndCallback}
          resetListElement={this.resetListElement}
          selectRecordsAndPublishMessageAction={this.selectRecordsAndPublishMessageAction}
          handleListKeyUp={this.handleListKeyUp}
        />

        {/* Bottom tools */}
        {showBottomTools && <div ref={ref => { setPaginatorDivRef(ref) }}>
          <ListBottomTools
            isScrollEnd={isScrollEnd}
            config={config}
            hidePageTotal={config?.hidePageTotal}
            handleScrollUp={this.handleScrollUp}
            handleScrollDown={this.handleScrollDown}
            updatePage={this.updatePage}
          />
        </div>}

        {/* Mask of list widget */}
        <MaskOfList
          isEditing={listUtils.checkIsEditing(appMode, config, selectionIsSelf, selectionIsInSelf)}
          config={config}
          showTopTools={showTopTools}
          showBottomTools={showBottomTools}
          bottomCon={paginatorDiv}
        />
        {/* Not ready tips and empty element */}
        <EmptyAndNotReadyTipsElement config={config} useDataSources={useDataSources?.asMutable({ deep: true })}/>

        {/* Loading */}
        <LoadingComponent
          config={config}
          appMode={this.props.appMode}
          LayoutEntry={LayoutEntry}
          showLoadingWhenConfirmSelectTemplate={this.props.showLoadingWhenConfirmSelectTemplate}
        />

        {/* render data count */}
        {config.showRecordCount && <DataCountComponent/>}
        <RecordLoadStatusA11y showRecordCount={config.showRecordCount} noDataMessage={config?.noDataMessage}/>

        <div id='describeByMessage' className='sr-only'>{this.formatMessage('describeMessage')}</div>
        <div className='sr-only' tabIndex={-1} ref={ref => { this.jumpOutNodeOfListInBottom = ref }}>{this.formatMessage('pressTabToContinue')}</div>
      </div>
    )
  }

  render () {
    const { config, id, useDataSources, activeSort, builderStatus, showTopTools, showBottomTools, paginatorDiv, showLoadingWhenConfirmSelectTemplate } = this.props
    const { createDataSourceFailed, isMount, LayoutEntry } = this.state
    return (
      <React.Fragment>
        <div className='widget-list d-flex' onMouseMove={this.onListContainerMouseMove}>
          {/* Render list element */}
          {(isMount && this.hasGetListSizeByResizeDetector && !this.context.state.showWidgetLoading) && this.renderContentOfListWidget()}
          {/* Render loading and WidgetPlaceholder */}
          <WidgetLoadingAndWidgetPlaceholder id={id} useDataSources={useDataSources} createDataSourceFailed={createDataSourceFailed}/>
        </div>

        <ListResizeDetector
          targetRef={this.props.listWidgetConRef}
          id={id}
          showTopTools={showTopTools}
          showBottomTools={showBottomTools}
          paginatorDiv={paginatorDiv}
          config={config}
          builderStatus={builderStatus}
          isScrollEnd={this.isScrollEnd}
          isCurrentPageLastPage={this.isCurrentPageLastPage}
          resetListElement={this.resetListElement}
          loadNextPageWhenListSizeOrTotalCountChange={this.loadNextPageWhenListSizeOrTotalCountChange}
          updateCardToolPosition={this.updateCardToolPosition}
          setListDivSize={this.setListDivSize}
          handleResizeCard={this.handleResizeCard}
          updateHasGetListSizeByResizeDetector={this.updateHasGetListSizeByResizeDetector}
        />

        <DataSourceComponent
          id={id}
          useDataSources={useDataSources}
          config={config}
          activeSort={activeSort}
          noLayoutEntry={!LayoutEntry}
          showLoadingWhenConfirmSelectTemplate={showLoadingWhenConfirmSelectTemplate}
          updateQueryOptions={this.updateQueryOptions}
          scrollToSelectedItems={this.scrollToSelectedItems}
          updateCreateDataSourceFailed={this.updateCreateDataSourceFailed}
          loadNextPageWhenListSizeOrTotalCountChange={this.loadNextPageWhenListSizeOrTotalCountChange}
          scrollToItemAfterLoadRecords={this.scrollToItemAfterLoadRecords}
        />
      </React.Fragment>
    )
  }
}
export default Widget
