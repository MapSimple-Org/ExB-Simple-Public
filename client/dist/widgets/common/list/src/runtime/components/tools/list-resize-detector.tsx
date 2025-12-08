/** @jsx jsx */
import { jsx, React, hooks, ReactResizeDetector, appActions, lodash, ReactRedux, getAppStore } from 'jimu-core'
import type { IMState } from 'jimu-core'
import { ListLayoutType, LIST_CARD_MIN_SIZE } from '../../../config'
import type { ElementSize, IMConfig, WidgetRect, Status } from '../../../config'
import { isEqualNumber, getListHeight, getBottomToolH, getCardSizeNumberInConfig as getCardSizeNumberInConfigUtil } from '../../utils/utils'
import { useListRuntimeState, useListRuntimeDispatch } from '../../state'
const { useEffect, useRef } = React
interface Props {
  id: string
  showTopTools: boolean
  showBottomTools: boolean
  targetRef: any
  paginatorDiv: any
  config: IMConfig
  builderStatus: Status
  isScrollEnd: boolean
  isCurrentPageLastPage: boolean
  resetListElement: () => void
  loadNextPageWhenListSizeOrTotalCountChange: () => void
  updateCardToolPosition: () => void
  setListDivSize: () => void
  handleResizeCard: (newCardSize, resizeEnd: boolean, isTop?: boolean, isLeft?: boolean, isReplace?: boolean) => void
  updateHasGetListSizeByResizeDetector: (hasGetListSizeByResizeDetector: boolean) => void
}
const ListResizeDetector = (props: Props) => {
  const debounceOnResizeRef = useRef(null)
  const resizeTimeoutRef = useRef(null)
  const needRefreshListRef = useRef(null)
  const isHasInitCurrentCardSizeRef = useRef(false)
  const listRuntimeDispatch = useListRuntimeDispatch()

  const { isResizingCard, currentCardSize, widgetRect } = useListRuntimeState()
  const browserSizeMode = ReactRedux.useSelector((state: IMState) => state?.browserSizeMode)

  const { id, showTopTools, showBottomTools, targetRef, paginatorDiv, config, isScrollEnd, isCurrentPageLastPage, builderStatus } = props
  const { loadNextPageWhenListSizeOrTotalCountChange, resetListElement, updateCardToolPosition, setListDivSize, handleResizeCard, updateHasGetListSizeByResizeDetector } = props

  const onResize = hooks.useEventCallback((width, height) => {
    updateHasGetListSizeByResizeDetector(true)

    const newWidgetRect = { width, height }
    if (isResizingCard) {
      return
    }

    const cardSize = getNewCardSize(width, height)
    const notResetCardSize = cardSize.width < LIST_CARD_MIN_SIZE || cardSize.height < LIST_CARD_MIN_SIZE
    const isWidgetSizeChange = (newWidgetRect.width !== widgetRect.width || newWidgetRect.height !== widgetRect.height) && newWidgetRect.width !== 0 && newWidgetRect.height !== 0
    if (notResetCardSize && !isWidgetSizeChange) {
      return
    }

    updateCurrentCardSize(cardSize)
    updateWidgetRect(newWidgetRect)
    editListSizeInRunTime(newWidgetRect)
    isHasInitCurrentCardSizeRef.current = true
    if (needRefreshListRef.current) {
      resetListElement()
    }

    if (config.lockItemRatio) {
      clearTimeout(resizeTimeoutRef.current)
      resizeTimeoutRef.current = setTimeout(() => {
        handleResizeCard(cardSize, true, false, false, true)
      }, 500)
    }

    updateCardToolPosition()
    setListDivSize()

    if (!isCurrentPageLastPage && isScrollEnd) {
      loadNextPageWhenListSizeOrTotalCountChange()
    }
  })

  useEffect(() => {
    debounceOnResizeRef.current = lodash.debounce(
      ({ width, height }) => { onResize(width, height) },
      100
    )
  }, [onResize])

  const getNewCardSize = hooks.useEventCallback((width, height) => {
    const newWidgetRect = {
      width,
      height
    }
    const bottomToolH = getBottomToolH(paginatorDiv, showBottomTools)
    const listH = getListHeight(newWidgetRect, bottomToolH, showTopTools)
    const oldCardSize = getOldCardSizeWhenResize(newWidgetRect)
    const newDefaultCardSize = config.layoutType === ListLayoutType.GRID ? getCardSizeNumberInConfig(newWidgetRect) : currentCardSize

    const cardSize = {
      width: newDefaultCardSize.width,
      height: newDefaultCardSize.height
    }

    needRefreshListRef.current = !isEqualNumber(currentCardSize?.width, newDefaultCardSize?.width) || !isEqualNumber(currentCardSize?.height, newDefaultCardSize?.height)

    if (config.lockItemRatio && config.layoutType !== ListLayoutType.GRID) {
      const ratio = cardSize.width / cardSize.height
      switch (config?.layoutType) {
        case ListLayoutType.Column:
          cardSize.height = listH
          cardSize.width = listH * ratio
          if (!isEqualNumber(cardSize.width, oldCardSize.width)) {
            needRefreshListRef.current = true
          }
          break
        case ListLayoutType.Row:
          cardSize.height = width / ratio
          cardSize.width = width
          if (!isEqualNumber(cardSize.height, oldCardSize.height)) {
            needRefreshListRef.current = true
          }
          break
      }
    } else {
      switch (config?.layoutType) {
        case ListLayoutType.Column:
          cardSize.height = listH
          break
        case ListLayoutType.Row:
          cardSize.width = width
          break
        default:
          break
      }
    }
    return cardSize
  })

  const updateCurrentCardSize = (currentCardSize: ElementSize) => {
    listRuntimeDispatch({type: 'SET_CURRENT_CARD_SIZE', value: currentCardSize})
    resetListElement()
  }

  const updateWidgetRect= (size: ElementSize) => {
    listRuntimeDispatch({type: 'SET_WIDGET_RECT', value: size})
  }

  const editListSizeInRunTime = (widgetRect: ElementSize) => {
    getAppStore().dispatch(appActions.widgetStatePropChange(id, 'widgetRect', widgetRect))
  }

  const getCardSizeNumberInConfig = hooks.useEventCallback((widgetRect?: WidgetRect) => {
    return getCardSizeNumberInConfigUtil(config, builderStatus, browserSizeMode, widgetRect)
  })

  const getOldCardSizeWhenResize = hooks.useEventCallback((newWidgetRect): ElementSize => {
    //When the width and height are percentages, the Onresize method will be automatically called once when the List is loaded. At this time, the current List size should be used to obtain the oldCardSize
    if (!isHasInitCurrentCardSizeRef.current) {
      return getCardSizeNumberInConfig(newWidgetRect)
    } else {
      return currentCardSize
    }
  })

  return (
    <ReactResizeDetector
      targetRef={targetRef}
      handleWidth
      handleHeight
      onResize={debounceOnResizeRef.current}
    />
  )
}
export default ListResizeDetector