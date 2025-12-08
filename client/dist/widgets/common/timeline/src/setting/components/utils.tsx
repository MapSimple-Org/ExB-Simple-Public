import type { InteractStatic } from '@interactjs/core/InteractStatic'
import { MAX_DATE_TIME, MIN_DATE_TIME } from '../../utils/utils'

export function getLineInfo (width, extent, startValue, endValue) {
  let marginLeft = 0
  if (extent[0] !== startValue) {
    marginLeft = width / ((extent[1] - extent[0]) / (startValue - extent[0]))
    if (marginLeft < 0) {
      marginLeft = 0
    }
  }

  let lineWidth = width / ((extent[1] - extent[0]) / (endValue - startValue))
  if (lineWidth <= 2) {
    lineWidth = 2
  }

  return {
    marginLeft: marginLeft + 'px',
    width: lineWidth + 'px'
  }
}

const DRAG_PADDING = 20
export interface ResizeHandlerProps {
  interact: InteractStatic
  resizeRef: any
  startValue: number
  endValue: number
  extent: any[]
  width: number
  setRange: (range: number[]) => void
  onChange: (startValue?: number, endValue?: number) => void
}
export function bindResizeHandler (props): Interact.Interactable {
  const {
    interact, resizeRef, startValue, endValue, extent, width, setRange, onChange
  } = props
  let dw
  let initWidth
  let initMarginLeft

  const edges = {
    left: '.resize-left',
    right: '.resize-right'
  }

  const originW = endValue - startValue
  return interact(resizeRef)
    .resizable({
      edges: edges
    })
    .on('resizestart', event => {
      event.stopPropagation()
      dw = 0
      const size = resizeRef.getBoundingClientRect()
      initWidth = size.width
      initMarginLeft = parseFloat(resizeRef.style.marginLeft.split('px')[0])
      resizeRef.style.minWidth = '0px'
    })
    .on('resizemove', event => {
      event.stopPropagation()
      const deltaRect = event.deltaRect
      dw += deltaRect.width

      // limit dragging area inside the container
      if (event.edges.left) {
        if (dw > 0) {
          if (startValue <= MIN_DATE_TIME) {
            dw = initMarginLeft
          }
          dw = Math.min(initMarginLeft + DRAG_PADDING, dw)
        } else {
          dw = Math.max(-initWidth + DRAG_PADDING, dw)
        }
      } else if (event.edges.right) {
        if (dw > 0) {
          if (endValue >= MAX_DATE_TIME) {
            dw = width - initMarginLeft - initWidth
          }
          dw = Math.min(width - initMarginLeft - initWidth + DRAG_PADDING, dw)
        } else {
          dw = Math.max(-initWidth + DRAG_PADDING, dw)
        }
      }

      const w = originW && (initWidth + dw)
      if (event.edges.left) {
        resizeRef.style.marginLeft = initMarginLeft - dw + 'px'
      }
      resizeRef.style.width = w + 'px'
      const newRange = getRangeByPixel(startValue, endValue, extent, width, dw, event)
      setRange([newRange.newStart, newRange.newEnd])
    })
    .on('resizeend', event => {
      event.stopPropagation()
      const newRange = getRangeByPixel(startValue, endValue, extent, width, dw, event)
      onChange(newRange.newStart, newRange.newEnd)
    })
}

export function getRangeByPixel (startValue, endValue, extent, width, dw, event) {
  // get real value by pixel.
  let newStart = startValue
  let newEnd = endValue
  const valueForDw = (extent[1] - extent[0]) / width * dw
  if (event.edges.left) {
    newStart = startValue - valueForDw
    newStart = Math.max(MIN_DATE_TIME, newStart)
  } else {
    newEnd = endValue + valueForDw
    newEnd = Math.min(MAX_DATE_TIME, newEnd)
  }
  return { newStart, newEnd }
}
