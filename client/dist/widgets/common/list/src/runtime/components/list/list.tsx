/** @jsx jsx */
import { jsx, React, classNames, AppMode, hooks, ReactRedux, defaultMessages as jimuCoreDefaultMessage } from 'jimu-core'
import type { DataRecord, UseDataSource, ImmutableArray, IMState } from 'jimu-core'
import { DistanceUnits, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { ListLayoutType, Status, SelectionModeType } from '../../../config'
import type { ListProps, ElementSize } from '../../../config'
import { getItemRowCount, getItemColumnCount, gridItemIndex, getItemSize } from '../../utils/list-element-util'
import { checkIsEditing, getCardSizeWidthUnitInConfig, intersectionObserver } from '../../utils/utils'
import { VariableSizeList as List, VariableSizeGrid as Grid } from 'react-window'
import { useTheme } from 'jimu-theme'
import defaultMessages from '../../translations/default'
import ListItem from './list-item'
import { LinkContainer } from 'jimu-ui/advanced/link-container'
import { useListRuntimeDispatch, useListRuntimeState } from '../../state'

const { useRef, forwardRef, useEffect, useState, Fragment } = React

interface OnItemsRenderedType {
  overscanStartIndex: number
  overscanStopIndex: number
  visibleStartIndex: number
  visibleStopIndex: number
  visibleColumnStartIndex: number
  visibleColumnStopIndex: number
  visibleRowStartIndex: number
  visibleRowStopIndex: number
}

interface Props {
  listProps: ListProps
  useDataSources: ImmutableArray<UseDataSource>
  LayoutEntry: any
  hideCardTool: boolean
  toggleCardTool: (hide?: boolean) => void
  handleListScroll: (scrollDirection, scrollOffset, scrollTop, scrollUpdateWasRequested) => void
  setListOutDivRef: (ref: any) => void
  handleResizeCard: (newCardSize, resizeEnd?: boolean, isTop?: boolean, isLeft?: boolean, isReplace?: boolean) => void
  onItemsRendered: (option: OnItemsRenderedType) => void
  setListRef: (ref) => void
  scrollToEndCallback: (isScrollEnd: boolean) => void
  selectRecordsAndPublishMessageAction: (records: DataRecord[]) => void
  getListSize: () => ElementSize
  resetListElement: (shouldForceUpdate?: boolean) => void
  handleListKeyUp: (e) => void
}

const ListComponent = (props: Props) => {
  const theme = useTheme()
  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage, jimuCoreDefaultMessage)
  const lastSpaceRef = useRef(null as number)
  const listOutDivRef = useRef<HTMLDivElement>(null)
  const canClickLinkRef = useRef(true)
  const resetListElementTimeoutRef = useRef(null)
  const browserSizeModeRef = useRef(null)
  const appModeRef = useRef(null)
  const isScrollEndRef = useRef(false)

  const listRuntimeDispatch = useListRuntimeDispatch()
  const { dataSource, records, currentCardSize, widgetRect, pageSize, showLoading, isShowEditingMask } = useListRuntimeState()

  const browserSizeMode = ReactRedux.useSelector((state: IMState) => state?.browserSizeMode)
  const queryObject = ReactRedux.useSelector((state: IMState) => state?.queryObject)
  const appMode = ReactRedux.useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)
  const isRTL = ReactRedux.useSelector((state: IMState) => state.appContext.isRTL)

  browserSizeModeRef.current = browserSizeMode
  appModeRef.current = appMode

  const { useDataSources, listProps, hideCardTool, LayoutEntry } = props
  const { id, config, selectionIsInSelf, builderStatus, builderSupportModules } = listProps
  const { handleListScroll, handleResizeCard, handleListKeyUp, selectRecordsAndPublishMessageAction, resetListElement, toggleCardTool, setListOutDivRef, onItemsRendered, setListRef, scrollToEndCallback, getListSize } = props

  const [hoverIndex, setHoverIndex] = useState(-1)

  useEffect(() => {
    clearTimeout(resetListElementTimeoutRef.current)
    resetListElementTimeoutRef.current = setTimeout(() => {
      resetListElement(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCardSize, widgetRect, theme])

  useEffect(() => {
    setHoverIndex(-1)
  }, [appMode])

  useEffect(() => {
    addBottomBoundary()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records])

  const handleItemChange = React.useCallback((itemRecord: DataRecord) => {
    if (!dataSource || !itemRecord || !itemRecord?.getId) return

    let selectedRecords = dataSource.getSelectedRecords() || []
    if (
      config.cardConfigs[Status.Selected].selectionMode &&
      config.cardConfigs[Status.Selected].selectionMode !==
      SelectionModeType.None
    ) {
      const recordId = itemRecord?.getId()
      const record = selectedRecords.find(record => record.getId() === recordId)
      if (config.cardConfigs[Status.Selected].selectionMode === SelectionModeType.Single) {
        if (record) {
          selectRecordsAndPublishMessageAction([])
          listRuntimeDispatch({type: 'SET_SHOW_SELECTION_ONLY', value: false})
        } else {
          selectRecordsAndPublishMessageAction([itemRecord])
        }
      } else {
        if (record) {
          selectedRecords = selectedRecords.filter(
            record => record.getId() !== recordId
          )
        } else {
          selectedRecords = selectedRecords.concat([itemRecord])
        }
        selectRecordsAndPublishMessageAction(selectedRecords)
      }
    }
  }, [config, dataSource, listRuntimeDispatch, selectRecordsAndPublishMessageAction])

  const updateCanClickLinkWhenClickItem = React.useCallback((itemRecord: DataRecord) => {
    if (!dataSource || !itemRecord || !itemRecord?.getId) return
    const selectedRecords = dataSource.getSelectedRecords() || []
    if (config.cardConfigs[Status.Selected].selectionMode && config.cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None) {
      const recordId = itemRecord?.getId()
      const recordHasBeenSelected = selectedRecords.find(record => record.getId() === recordId)
      if (recordHasBeenSelected) {
        canClickLinkRef.current = false
      } else {
        canClickLinkRef.current = true
      }
    }
  }, [dataSource, config])


  const isEditing = React.useCallback((listProps: ListProps): boolean => {
    const { config, selectionIsInSelf, selectionIsSelf } = listProps
    return checkIsEditing(appMode, config, selectionIsSelf, selectionIsInSelf)
  }, [appMode])

  const handleListMouseLeave = React.useCallback(() => {
    if (isEditing(listProps)) return
    setHoverIndex(-1)
  }, [isEditing, listProps])

  const handleListMouseMove = hooks.useEventCallback((itemIndex: number) => {
    if (isEditing(listProps)) return
    if (itemIndex === hoverIndex) return
    setHoverIndex(itemIndex)
  })

  const getOverscanCount = () => {
    const isDesign = (window.jimuConfig.isInBuilder && appMode === AppMode.Design)
    const overscanCount = isDesign ? 0 : pageSize
    return overscanCount
  }

  const getCardSizeWidthUnitByConfig = React.useCallback(() => {
    return getCardSizeWidthUnitInConfig(config, builderStatus, browserSizeMode)
  }, [config, builderStatus, browserSizeMode])

  const selectSelf = React.useCallback(() => {
    window.jimuConfig.isInBuilder && builderSupportModules.widgetModules.selectSelf(id)
  }, [builderSupportModules, id])

  const selectCard = React.useCallback(() => {
    if (selectionIsInSelf) {
      selectSelf()
    }
  }, [selectSelf, selectionIsInSelf])

  const getOtherProps = React.useCallback((listProps: ListProps) => {
    const { id, config, builderSupportModules, layouts } = listProps
    const isWidthPercentage = getCardSizeWidthUnitByConfig()?.width?.unit === DistanceUnits.PERCENTAGE
    return {
      id: id,
      widgetId: id,
      config: config,
      recordLength: records?.length || 0,
      widgetRect: widgetRect,
      currentCardSize: currentCardSize,
      useDataSources: useDataSources,
      handleListMouseMove: handleListMouseMove,
      handleListMouseLeave: handleListMouseLeave,

      browserSizeMode: browserSizeModeRef.current,
      isRTL: isRTL,
      builderSupportModules: builderSupportModules,
      interact: window.jimuConfig.isInBuilder && builderSupportModules?.widgetModules?.interact,
      appMode: appModeRef.current,
      theme: theme,
      LayoutEntry: LayoutEntry,
      layouts: layouts,
      datasourceId: dataSource?.id,
      isWidthPercentage: isWidthPercentage,
      formatMessage: nls,
      selectCard: selectCard,
      handleResizeCard: handleResizeCard,
      onChange: handleItemChange,
      updateCanClickLinkWhenClickItem: updateCanClickLinkWhenClickItem,
      toggleCardTool: toggleCardTool
    }
  }, [LayoutEntry, currentCardSize, dataSource?.id, getCardSizeWidthUnitByConfig, handleItemChange, handleListMouseLeave, handleListMouseMove, handleResizeCard, isRTL, nls, records?.length, selectCard, theme, toggleCardTool, updateCanClickLinkWhenClickItem, useDataSources, widgetRect])


  const columnWidth = React.useCallback((index: number): number => {
    const space = config?.horizontalSpace || 0
    const cardWidth = currentCardSize?.width || 0
    const size = cardWidth + space
    return size
  }, [currentCardSize, config])

  const rowHeight = (rowIndex: number, cardHeight: number, space: number = 0): number => {
    //Prevents pixel differences when browsers render sizes less than 1 px
    return Math.floor(cardHeight) + space
  }

  const itemKey = index => {
    const item = records[index]
    return `${(item?.getId && item?.getId()) || index}`
  }

  const scrollToEndCallbackFn = React.useCallback((isScrollEnd: boolean) => {
    if (!isScrollEnd) {
      setTimeout(() => {
        isScrollEndRef.current = isScrollEnd
      }, 1000)
    } else {
      isScrollEndRef.current = isScrollEnd
    }
    scrollToEndCallback(isScrollEnd)
  }, [scrollToEndCallback])

  const addBottomBoundary = React.useCallback(() => {
    const bottomBoundaryId = `bottomBoundary${id}`
    if (!listOutDivRef.current || document.getElementById(bottomBoundaryId)) return
    const bottomBoundary = document.createElement('div')
    bottomBoundary.id = bottomBoundaryId
    bottomBoundary.className = 'bottom-boundary'
    bottomBoundary.setAttribute('data-testid', 'bottom-boundary')
    const listScrollContent = listOutDivRef.current.getElementsByTagName('div')[0]

    listScrollContent.appendChild(bottomBoundary)
    intersectionObserver(
      document.getElementById(bottomBoundaryId),
      listOutDivRef.current,
      scrollToEndCallbackFn
    )
  }, [id, scrollToEndCallbackFn])

  const setOuterRef = (ref) => {
    setListOutDivRef(ref)
    listOutDivRef.current = ref
    addBottomBoundary()
  }

  const changeIsCanClickLink = (): boolean => {
    return canClickLinkRef.current
  }

  const changeIsResizingCard = React.useCallback((isResizingCard: boolean) => {
    listRuntimeDispatch({type: 'SET_IS_RESIZING_CARD', value: isResizingCard})
  }, [listRuntimeDispatch])

  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'ArrowDown' && (isScrollEndRef.current || showLoading)) {
      e.preventDefault()
    }
  }, [showLoading])

  const getItemsByRecords = React.useCallback((records, listProps, hoverIndex: number, hideCardTool: boolean) => {
    const { config, selectionIsInSelf, selectionIsSelf, builderStatus } = listProps
    const selectedRecords = (!dataSource || !config.isItemStyleConfirm) ? [] : dataSource.getSelectedRecordIds()
    const selectedRecordIds = selectedRecords.map(v => v + '')
    return (
      records && records.map((record, index) => {
        const editProps = {
          hideCardTool: hideCardTool,
          selectionIsList: selectionIsSelf,
          selectionIsInList: selectionIsInSelf,
          isEditing: isEditing(listProps),
          builderStatus: builderStatus,
          lockItemRatio: config.lockItemRatio,
          changeIsResizingCard: changeIsResizingCard
        }
        return {
          index,
          isHover: hoverIndex === index,
          record: config.isItemStyleConfirm ? record : undefined,
          ...getOtherProps(listProps),
          active:
            !record.fake &&
            config.isItemStyleConfirm &&
            dataSource &&
            selectedRecordIds.includes(record.getId()),
          ...editProps
        }
      })
    )
  }, [changeIsResizingCard, dataSource, getOtherProps, isEditing])

  const getListInnerElementType = () => {
    const space = config?.layoutType === ListLayoutType.GRID ? config?.verticalSpace : config?.space
    if (lastSpaceRef.current !== space) {
      lastSpaceRef.current = space
      return forwardRef(({ style, ...rest }: any, ref: any) => (
        <div
          ref={ref}
          style={{
            ...style,
            height: `${parseFloat(style.height) - (config.layoutType === ListLayoutType.Column ? 0 : space)}px`,
            width: `${parseFloat(style.width) - (config.layoutType !== ListLayoutType.Column ? 0 : space)}px`
          }}
          {...rest}
        />
      ))
    }
  }

  return (<Fragment>
    <div className='widget-list-link-con position-relative' data-testid='listContainer' onKeyDown={handleKeyDown} onKeyUp={handleListKeyUp}>
      <LinkContainer
        widgetId={id}
        appMode={appMode}
        linkParam={config.linkParam}
        queryObject={queryObject}
        useDataSources={useDataSources}
        changeIsCanClickLink={changeIsCanClickLink}
        role='listbox'
        aria-label={nls('listArea')}
      >

        {/* render Grid list */}
        {(config?.layoutType === ListLayoutType.GRID) && <Grid
          className={classNames('widget-list-list', { 'hide-list': !records || records?.length === 0, 'hide-will-change': isShowEditingMask })}
          ref={setListRef}
          useIsScrolling
          outerRef={setOuterRef}
          direction={isRTL ? 'rtl' : 'ltr'}
          itemCount={records.length}
          overscanCount={getOverscanCount()}
          itemKey={indexOption => gridItemIndex(indexOption, records, config, widgetRect, currentCardSize)}
          columnCount={getItemColumnCount(config, widgetRect, currentCardSize)}
          columnWidth={columnWidth}
          rowCount={getItemRowCount(records.length, config, widgetRect, currentCardSize)}
          rowHeight={index => rowHeight(index, currentCardSize.height, config?.verticalSpace)}
          width={getListSize().width}
          height={getListSize().height}
          onItemsRendered={onItemsRendered}
          itemData={getItemsByRecords(records, listProps, hoverIndex, hideCardTool)}
          innerElementType={getListInnerElementType()}
          onScroll={handleListScroll}
        >
          {ListItem}
        </Grid>}

        {/* render Row/column list */}
        {(config?.layoutType !== ListLayoutType.GRID) && <List
          className={classNames('widget-list-list', { 'hide-list': !records || records?.length === 0, 'hide-will-change': isShowEditingMask })}
          ref={setListRef}
          useIsScrolling
          outerRef={setOuterRef}
          direction={isRTL ? 'rtl' : 'ltr'}
          role='listbox'
          layout={config.layoutType === ListLayoutType.Column ? 'horizontal' : 'vertical'}
          itemCount={records.length}
          overscanCount={getOverscanCount()}
          itemKey={itemKey}
          width={getListSize().width}
          height={getListSize().height}
          onItemsRendered={onItemsRendered}
          itemData={getItemsByRecords(records, listProps, hoverIndex, hideCardTool)}
          innerElementType={getListInnerElementType()}
          itemSize={index => getItemSize(config, currentCardSize)}
          onScroll={handleListScroll}
        >
          {ListItem}
        </List>}
      </LinkContainer>
    </div>
  </Fragment>)
}

export default ListComponent
