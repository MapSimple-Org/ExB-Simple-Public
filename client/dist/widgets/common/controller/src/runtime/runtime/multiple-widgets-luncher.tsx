import { React, Immutable, type IMRuntimeInfos, type IMState, ReactRedux, hooks, AppMode } from 'jimu-core'
import { type IMSizeMap, DisplayType } from '../../config'
import { type ControlPosition, FloatingPanel, type Size } from 'jimu-ui'
import { WidgetRenderer } from './widget-renderer'
import { DEFAULT_PANEL_SIZE, MIN_PANEL_SIZE } from '../../common/consts'
import { ResizerTooltip } from './utils'
import { getLayoutItemId, isWidgetOpening } from '../common/layout-utils'
import type { FloatingLauncherProps } from './widgets-launcher'

export interface MultipleWidgetsLuncherProps extends FloatingLauncherProps {
  rootVisible: boolean
  mode: DisplayType
  start: ControlPosition
  spaceX: number
  spaceY: number
}

const getSizes = (widgets: IMRuntimeInfos, sizeMap: IMSizeMap) => {
  let sizes = Immutable({}) as IMSizeMap
  Object.keys(widgets).forEach((id) => {
    sizes = sizes.set(id, sizeMap[id] || DEFAULT_PANEL_SIZE)
  })
  return sizes
}

const getBodyRect = (): Partial<DOMRectReadOnly> => {
  return document.body.getBoundingClientRect()
}

/**
 * Layout multiple floating panels
 * @param mode
 * @param sizes
 * @param start
 * @param spaceX
 * @param spaceY
 */
export const useFigureOutLayouts = (mode: DisplayType, sizes: IMSizeMap, start: ControlPosition, spaceX: number, spaceY: number): ControlPosition[] => {
  const [boundary, setBoundary] = React.useState<Partial<DOMRectReadOnly>>(() => getBodyRect())
  const [anchors, setAnchors] = React.useState<ControlPosition[]>([start])
  const callbackNumRef = React.useRef(0)

  React.useEffect(() => {
    const handleResize = () => {
      const rect = getBodyRect()
      setBoundary(rect)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const isHorizontalOutBoundary = (rect: Partial<DOMRectReadOnly>, boundary: Partial<DOMRectReadOnly>) => {
    return rect.right >= boundary.right ||
      rect.left <= boundary.left
  }

  const isVerticalOutBoundary = (rect: Partial<DOMRectReadOnly>, boundary: Partial<DOMRectReadOnly>) => {
    return rect.bottom >= boundary.bottom ||
      rect.top <= boundary.top
  }

  /**
   * Check if a rect is out of boundary rect
   * @param rect
   * @param boundary
   */
  const isOutBoundary = (rect: Partial<DOMRectReadOnly>, boundary: Partial<DOMRectReadOnly>) => {
    if (!rect || !boundary) return false
    return isHorizontalOutBoundary(rect, boundary) || isVerticalOutBoundary(rect, boundary)
  }
  //The maximum number to recursively prevent intersect or cross boundary
  const MaxNumberOfCallbacks = 7
  //prevent intersect or cross boundary
  const determineRect = hooks.useEventCallback((undetermine: Partial<DOMRectReadOnly>): Partial<DOMRectReadOnly> => {
    callbackNumRef.current++
    if (callbackNumRef.current > MaxNumberOfCallbacks) {
      console.warn(`Number of cycles: ${callbackNumRef.current}.You may have opened too many panels, and now there is not enough space for them to be placed without overstepping and blocking`)
      return undetermine
    }
    // const intersect = isIntersect(undetermine, forbidden);
    const outBoundary = isOutBoundary(undetermine, boundary)
    if (!outBoundary) {
      return undetermine
    }
    const { width, height } = undetermine
    let { left, top, right, bottom } = undetermine
    // if (intersect) {
    //   left = forbidden.right + spaceX;
    //   right = left + width;
    // }
    if (outBoundary) {
      const horOutBoundary = isHorizontalOutBoundary({ left, top, right, bottom, width, height }, boundary)
      const verOutBoundary = isVerticalOutBoundary({ left, top, right, bottom, width, height }, boundary)
      if (horOutBoundary) {
        left = mode === DisplayType.SideBySide ? start.x : boundary.right - width
      }
      if (!verOutBoundary && mode === DisplayType.SideBySide) {
        top += spaceY
      }
      right = left + width
      bottom = top + height
    }
    return determineRect({ left, top, right, bottom, width, height })
  })

  React.useEffect(() => {
    const anchors = []
    let prevSize: Size = { width: 0, height: 0 }

    Object.keys(sizes).forEach((id, idx) => {
      const size = sizes[id]
      const anchor = idx !== 0 ? anchors[idx - 1] : start
      let { x, y } = anchor
      if (mode === DisplayType.SideBySide) {
        const { width } = prevSize
        x += (spaceX > 0 ? width : -width)
        x += idx !== 0 ? spaceX : 0
      } else if (mode === DisplayType.Stack) {
        x += idx !== 0 ? spaceX : 0
        y += idx !== 0 ? spaceY : 0
      }

      const rect = { left: x, top: y, right: x + size.width, bottom: y + size.height, width: size.width, height: size.height }
      const { left, top } = determineRect(rect)
      if (callbackNumRef.current > MaxNumberOfCallbacks) {
        x = anchor.x
        y = anchor.y
      } else {
        x = left
        y = top
      }
      callbackNumRef.current = 0
      anchors.push({ x, y })
      prevSize = size
    })

    setAnchors(anchors)
  }, [mode, start, spaceX, spaceY, boundary.width, boundary.height, determineRect, sizes])

  return anchors
}

const DefaultWidgets = Immutable({}) as IMRuntimeInfos
export const MultipleWidgetsLuncher = (props: MultipleWidgetsLuncherProps) => {
  const { rootVisible, mode, start, spaceX, spaceY, sizes: propSizes, widgets = DefaultWidgets, layout, autoFocus, onResizeStop, onClick, onClose } = props

  const widgetsJson = ReactRedux.useSelector((state: IMState) => state.appConfig.widgets)
  const [sizeMap, setSizeMap] = React.useState<IMSizeMap>(propSizes)
  const sizes = React.useMemo(() => getSizes(widgets, sizeMap), [sizeMap, widgets])

  const [isResizing, setIsResizing] = React.useState(false)
  const handleResize = (widgetId: string, size: Size) => {
    setSizeMap(sizeMap.set(widgetId, size))
    setIsResizing(true)
  }
  const handleResizeStop = (widgetId: string, size: Size) => {
    onResizeStop?.(widgetId, size)
    setIsResizing(false)
  }

  const anchors = useFigureOutLayouts(mode, sizes, start, spaceX, spaceY)
  const isRuntime = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode === AppMode.Run)
  const resizeHandle = <ResizerTooltip isRuntime={isRuntime} isResizing={isResizing} />

  return <React.Fragment>
    {Object.entries(widgets).map(([id, runtimeInfo], idx) => {
      const opened = runtimeInfo.state !== undefined
      if (!opened) return null
      const opening = isWidgetOpening(runtimeInfo)
      const anchor = anchors[idx]
      if (!anchor) return null
      const size = sizes[id]
      const title = widgetsJson?.[id]?.label
      const layoutId = layout?.id
      const layoutItemId = getLayoutItemId(layout, id)

      return <FloatingPanel
        key={id}
        style={{ maxWidth: '100vw', position: 'fixed', backgroundColor: 'var(--sys-color-surface-paper)' }}
        headerTitle={title}
        defaultPosition={anchor}
        defaultSize={size}
        open={opening && rootVisible}
        keepMount={true}
        className='multiple-widget-launcher'
        showHeaderClose={true}
        showHeaderCollapse={true}
        activateOnlyForHeader={true}
        autoFocus={opening && autoFocus}
        minSize={MIN_PANEL_SIZE}
        dragBounds='body'
        resizeHandle={resizeHandle}
        onClick={(evt) => { onClick(evt, id) }}
        onResize={(size) => { handleResize(id, size) }}
        onResizeStop={(size) => { handleResizeStop(id, size) }}
        onHeaderClose={(evt) => { onClose(evt, id) }}>
        <WidgetRenderer widgetId={id} layoutId={layoutId} layoutItemId={layoutItemId}></WidgetRenderer>
      </FloatingPanel>
    })}
  </React.Fragment>
}
