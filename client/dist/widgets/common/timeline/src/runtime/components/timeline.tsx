/** @jsx jsx */
import {
  React, jsx, classNames, useIntl, defaultMessages as jimuCoreMessages,
  ReactRedux,
  type IMState,
  AppMode,
  lodash,
  getAppStore,
  hooks,
  focusElementInKeyboardMode
} from 'jimu-core'
import {
  Button, Dropdown, DropdownButton, DropdownMenu, DropdownItem, defaultMessages as jimuUIMessages,
  Tooltip, Icon, Popper, Switch, Label, Typography
} from 'jimu-ui'
import type { DateTimeUnits, DateUnitInputValue } from 'jimu-ui/advanced/style-setting-components'
import {
  getValueTickPairs, getStepEndTimeForTarget, bindResizeHandler, bindDragHandler, type resizeHandlerProps,
  getValueTickInfoForYear, getValueTickInfoForMonth, getValueTickInfoForDay, getValueTickInfoForHour, getValueTickInfoForMinute,
  getTickSizes, getWidthByZoomLevel, getMaxWidthAndZoomLevel, getMultipleByZoomLevel, getNewValueByAccuracy, getValueTickInfoForSecond,
  type TimelineDetails, type ValueTickInfoProps, type TickSizeProps, type DragHandlerProps
} from './utils'
import { interact } from 'jimu-core/dnd'

import defaultMessages from './../translations/default'

import { PlusCircleOutlined } from 'jimu-icons/outlined/editor/plus-circle'
import { MinusCircleOutlined } from 'jimu-icons/outlined/editor/minus-circle'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { PlayOutlined } from 'jimu-icons/outlined/editor/play'
import { PauseOutlined } from 'jimu-icons/outlined/editor/pause'
import { PreviousOutlined } from 'jimu-icons/outlined/editor/previous'
import { NextOutlined } from 'jimu-icons/outlined/editor/next'
import { SpeedOutlined } from 'jimu-icons/outlined/application/speed'
import { TimeDisplayStrategy, TimeSpeed, TimeStyle } from '../../config'
import { getTimelineStyles } from './style'
import { SPEED_VALUE_PAIR } from '../../utils/utils'

const arrowIcon = require('./assets/icons/arrow.svg')
const allDefaultMessages = Object.assign({}, defaultMessages, jimuCoreMessages, jimuUIMessages)

/**
 * Timeline Props
 */
export interface TimelineProps {
  width?: number
  height?: number
  applied?: boolean
  timeStyle?: TimeStyle
  foregroundColor?: any
  backgroundColor?: any
  sliderColor?: any
  theme?: any

  startTime: number
  endTime: number
  accuracy?: DateTimeUnits
  stepLength?: DateUnitInputValue
  dividedCount?: number
  displayStrategy?: TimeDisplayStrategy
  enablePlayControl?: boolean
  speed?: TimeSpeed
  autoPlay?: boolean
  dateTimePattern?: any
  updating?: boolean

  onTimeChanged?: (startTime: number, endTime: number) => void
  onApplyStateChanged?: (applied: boolean) => void
}

function TimeLine (props: TimelineProps) {
  const {
    width: _width,
    height: _height,
    applied,
    timeStyle = TimeStyle.Classic, foregroundColor, backgroundColor, sliderColor, theme,
    startTime, endTime, accuracy = 'year', stepLength, dividedCount, displayStrategy = TimeDisplayStrategy.current,
    enablePlayControl = false, speed: _speed = TimeSpeed.Medium, autoPlay: _autoPlay, dateTimePattern, updating = false, onTimeChanged, onApplyStateChanged
  } = props

  const [width, setWidth] = React.useState(_width) // the width of the visible ruler
  const [height, setHeight] = React.useState(_height)
  React.useEffect(() => {
    setWidth(_width - (timeStyle === TimeStyle.Classic ? 64 : 80))
    setHeight(timeStyle === TimeStyle.Classic ? 52 : 80)
  }, [_width, _height, timeStyle])

  const [zoomLevel, setZoomLevel] = React.useState(0)
  const [maxWidthAndZoomLevel, setMaxWidthAndZoomLevel] = React.useState(null)

  const intl = useIntl()
  const messages = useFormatMessage()
  const speedItems = React.useMemo(() => [
    { value: TimeSpeed.Slowest, label: messages('slowest') },
    { value: TimeSpeed.Slow, label: messages('slow') },
    { value: TimeSpeed.Medium, label: messages('medium') },
    { value: TimeSpeed.Fast, label: messages('fast') },
    { value: TimeSpeed.Fastest, label: messages('fastest') }
  ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [])

  const [speed, setSpeed] = React.useState(_speed)
  React.useEffect(() => {
    setSpeed(_speed)
  }, [_speed])

  const marginForLR = 7

  const [autoPlay, setAutoPlay] = React.useState(_autoPlay || false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const containerDragPos = React.useRef(null)

  const [tsDetails, setTsDetails] = React.useState<TimelineDetails>(null)

  // The start position of the whole timeSlider on current container.
  const [leftPosition, setLeftPosition] = React.useState(0) // update when zoomLevel is changed, or timeline is dragged.
  const [startTimeForStep, setStartTimeForStep] = React.useState(startTime)
  const [endTimeForStep, setEndTimeForStep] = React.useState(null)
  const [endTimeForTempStep, setEndTimeForTempStep] = React.useState(null) // only for last step

  const [startTimeForStepByDragging, setStartTimeForStepByDragging] = React.useState(null)
  const [endTimeForStepByDragging, setEndTimeForStepByDragging] = React.useState(null)

  // interactive range
  const [interactableForResize, setInteractableForResize] = React.useState(null)
  const [interactableForDrag, setInteractableForDrag] = React.useState(null)
  const resizeRef = React.useRef<HTMLDivElement>(null)
  const instantRef = React.useRef<HTMLButtonElement>(null)
  const startRef = React.useRef<HTMLButtonElement>(null)
  const endRef = React.useRef<HTMLButtonElement>(null)

  const playRef = React.useRef(null)

  const infoIconRef = React.useRef<HTMLButtonElement>(null)
  const [showInfoPopper, setShowInfoPopper] = React.useState(false)

  const arrowAction = React.useRef<boolean>(false)
  const preventTouchMove = (evt) => {
    if (window.jimuConfig.isInBuilder && arrowAction.current && (evt.key.includes('Arrow'))) {
      evt.preventDefault()
    }
  }

  React.useEffect(() => {
    containerRef.current.addEventListener('mousedown', mouseDownHandler)
    // bind keyup events for startRef, endRef and instantRef for a11y purpose
    if (instantRef.current) {
      instantRef.current.addEventListener('keyup', startArrowEvent, true)
      instantRef.current.addEventListener('focus', arrowFocusEvent, true)
      instantRef.current.addEventListener('blur', arrowBlurEvent, true)
    } else {
      startRef.current.addEventListener('keyup', startArrowEvent, true)
      endRef.current.addEventListener('keyup', endArrowEvent, true)
      startRef.current.addEventListener('focus', arrowFocusEvent, true)
      startRef.current.addEventListener('blur', arrowBlurEvent, true)
      endRef.current.addEventListener('focus', arrowFocusEvent, true)
      endRef.current.addEventListener('blur', arrowBlurEvent, true)
    }
    document.body.addEventListener('keydown', preventTouchMove, {
      passive: false
    })
    function arrowFocusEvent (evt) {
      arrowAction.current = true
    }
    function arrowBlurEvent (evt) {
      arrowAction.current = false
    }
    function startArrowEvent (evt) {
      evt.edges = { left: true }
      updateValuesByArrowKey(evt)
    }
    function endArrowEvent (evt) {
      evt.edges = { right: true }
      updateValuesByArrowKey(evt)
    }
    return () => {
      containerRef.current?.removeEventListener('mousedown', mouseDownHandler)
      interactableForResize?.unset()
      interactableForDrag?.unset()

      if (instantRef.current) {
        instantRef.current.removeEventListener('keyup', startArrowEvent, true)
        instantRef.current.removeEventListener('focus', arrowFocusEvent, true)
        instantRef.current.removeEventListener('blur', arrowBlurEvent, true)
      } else if (startRef.current && endRef.current) {
        startRef.current.removeEventListener('keyup', startArrowEvent, true)
        endRef.current.removeEventListener('keyup', endArrowEvent, true)
        startRef.current.removeEventListener('focus', arrowFocusEvent, true)
        startRef.current.removeEventListener('blur', arrowBlurEvent, true)
        endRef.current.removeEventListener('focus', arrowFocusEvent, true)
        endRef.current.removeEventListener('blur', arrowBlurEvent, true)
      }
      document.body.removeEventListener('keydown', preventTouchMove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateValuesByArrowKey = hooks.useEventCallback((evt) => {
    if (evt.key.includes('Arrow')) {
      evt.preventDefault()
      const diff = (evt.key === 'ArrowLeft' || evt.key === 'ArrowTop') ? -1 : 1
      const resizeProps = getResizeProps()
      let newStart = resizeProps.startValue
      let newEnd = resizeProps.endValue
      if (stepLength) {
        if (evt.edges.left) {
          newStart = getNewValueByAccuracy(stepLength.unit, new Date(resizeProps.startValue), diff * stepLength.val)
        } else {
          newEnd = getNewValueByAccuracy(stepLength.unit, new Date(resizeProps.endValue), diff * stepLength.val)
        }
      } else { // divided
        const _accuracy = (resizeProps.extent[1] - resizeProps.extent[0]) / dividedCount
        if (evt.edges.left) {
          newStart = newStart + diff * _accuracy
        } else {
          newEnd = newEnd + diff * _accuracy
        }
      }

      if (evt.edges.left) {
        newStart = Math.max(resizeProps.extent[0], newStart)
        newStart = Math.min(newStart, newEnd)
      } else {
        newEnd = Math.min(resizeProps.extent[1], newEnd)
        newEnd = Math.max(newStart, newEnd)
      }
      resizeHandlerDragging(newStart, newEnd)
    }
  })

  React.useEffect(() => {
    if (resizeRef.current) {
      setInteractableForResize(bindResizeHandler(interact, resizeRef.current, getResizeProps, resizeHandlerDragging, resizeHandlerDragend))
      const dragHandlerProps: DragHandlerProps = {
        interact,
        dragRef: resizeRef.current,
        getDragProps,
        resizeHandlerDragging,
        resizeHandlerDragend
      }
      setInteractableForDrag(bindDragHandler(dragHandlerProps))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeStyle])

  // Reset render states when anything is changed.
  React.useEffect(() => {
    containerDragPos.current = { left: 0, x: 0 }
    setShowInfoPopper(false)
    setLeftPosition(0)
    setZoomLevel(0)
    setAutoPlay(_autoPlay)
    setEndTimeForTempStep(null)
    setStartTimeForStep(startTime)
    const _endTime = displayStrategy === TimeDisplayStrategy.current ? getStepEndTimeForTarget(startTime, endTime, startTime, stepLength, dividedCount) : startTime
    setEndTimeForStep(_endTime)

    onTimeChanged(startTime, _endTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_autoPlay, enablePlayControl, startTime, displayStrategy, endTime, accuracy, stepLength, dividedCount])

  React.useEffect(() => {
    // get initialize details of timeline
    const timelineProps = {
      width: getWidthByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel),
      startTime: startTime,
      endTime: endTime,
      accuracy
    }
    const details = getValueTickPairs(timelineProps)
    setTsDetails(details)
  }, [width, startTime, endTime, accuracy, zoomLevel, maxWidthAndZoomLevel])

  React.useEffect(() => {
    const maxLevel = getMaxWidthAndZoomLevel(width, startTime, endTime, accuracy)
    setMaxWidthAndZoomLevel(maxLevel)
  }, [width, startTime, endTime, accuracy])

  /**
   * Play and Stop animation
   */
  const isAutoplaySuspendMode = ReactRedux.useSelector((state: IMState) => {
    if (!autoPlay) {
      return null
    }
    return state.appRuntimeInfo?.appMode === AppMode.Design || state.appRuntimeInfo?.isPrintPreview
  })
  const modeRef = React.useRef(isAutoplaySuspendMode)

  const getResizeProps = hooks.useEventCallback(() => {
    const resizeProps: resizeHandlerProps = {
      startValue: startTimeForStepByDragging || startTimeForStep,
      endValue: endTimeForStepByDragging || endTimeForTempStep || endTimeForStep,
      extent: [startTime, endTime],
      width: getWidthByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel),
      accuracy,
      stepLength,
      dividedCount
    }
    return resizeProps
  })

  const getDragProps = hooks.useEventCallback(() => {
    const resizeProps: resizeHandlerProps = {
      startValue: startTimeForStepByDragging || startTimeForStep,
      endValue: endTimeForStepByDragging || endTimeForStep,
      extent: [startTime, endTime],
      width: getWidthByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel),
      accuracy,
      stepLength,
      dividedCount
    }
    return resizeProps
  })

  const mouseMoveHandler = hooks.useEventCallback(e => {
    const debounceFunc = lodash.debounce(() => {
      if (startTimeForStepByDragging) { // skip the case: moving the whole slider
        return
      }
      const multiple = getMultipleByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel)
      const dx = e.clientX - containerDragPos.current.x // How far the mouse has been moved.
      let _leftPosition = containerDragPos.current.left - dx / (multiple * width) * 100
      _leftPosition = Math.min(_leftPosition / 100, (multiple - 1) / multiple)
      _leftPosition = _leftPosition < 0 ? 0 : _leftPosition
      setLeftPosition(_leftPosition * 100)
    }, 50)
    debounceFunc()
  })

  const mouseUpHandler = hooks.useEventCallback(() => {
    containerRef.current.style.cursor = 'grab'
    containerRef.current.style.removeProperty('user-select')
    document.removeEventListener('mousemove', mouseMoveHandler)
    document.removeEventListener('mouseup', mouseUpHandler)
  })

  const mouseDownHandler = hooks.useEventCallback(e => {
    // Skip for level = 1, and step resize buttons
    if (zoomLevel === 0 || e.target.tagName === 'BUTTON') {
      return
    }
    containerRef.current.style.cursor = 'grabbing'
    containerRef.current.style.userSelect = 'none'
    containerDragPos.current = {
      left: leftPosition,
      x: e.clientX // Get the current mouse position
    }
    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', mouseUpHandler)
  })

  /**
   * Update leftPosition by Play control.
   */
  const updateLeftPositionByPlay = React.useCallback((newSTime = startTimeForStep, newETime = endTimeForStep, isNext: boolean) => {
    if (newSTime <= startTime) {
      setLeftPosition(0)
      return
    }
    const extent = endTime - startTime
    const multiple = getMultipleByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel)
    const currentExtent = extent / multiple
    const currentExtentStart = startTime + leftPosition / 100 * extent
    const currentExtentEnd = currentExtentStart + currentExtent
    let _calcStartTime
    // move current step at left position, right position, or keep it.
    if (isNext && (newETime <= currentExtentStart || newSTime >= currentExtentEnd)) {
      _calcStartTime = Math.min(newSTime, endTime - currentExtent)
    } else if (!isNext && (newSTime >= currentExtentEnd || newETime <= currentExtentStart)) {
      _calcStartTime = Math.max(startTime, newETime - currentExtent)
    } else {
      return
    }
    const _leftPosition = (_calcStartTime - startTime) / (endTime - startTime) * 100
    setLeftPosition(_leftPosition)
  }, [zoomLevel, startTime, endTime, leftPosition, startTimeForStep, endTimeForStep, width, maxWidthAndZoomLevel])

  /**
   * Update leftPosition by Zoom control.
   */
  const updateLeftPositionByZoom = React.useCallback((zoomIn: boolean) => {
    const nextZoomLevel = zoomLevel + (zoomIn ? 1 : -1)
    if (nextZoomLevel === 0) {
      setLeftPosition(0)
      return
    }
    const extent = endTime - startTime
    const multiple = getMultipleByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel)
    const multipleNext = getMultipleByZoomLevel(width, nextZoomLevel, maxWidthAndZoomLevel)
    const currentExtent = extent / multiple
    const currentExtentStart = startTime + leftPosition / 100 * extent
    const currentExtentEnd = currentExtentStart + currentExtent

    let position = leftPosition
    // Anchor to tail, when:
    // the end of the slider is at the End-time point,
    // or only the tail end is within the container, zoom should anchor to its tail
    const currentEndTimeForStep = endTimeForTempStep || endTimeForStep
    if (currentEndTimeForStep === endTime && currentEndTimeForStep === currentExtentEnd) {
      position = (multipleNext - 1) / multipleNext * 100
    } else if (startTimeForStep < currentExtentStart && currentEndTimeForStep > currentExtentStart && currentEndTimeForStep < currentExtentEnd) {
      position = (currentEndTimeForStep - (currentEndTimeForStep - currentExtentStart) / (multipleNext / multiple) - startTime) / (endTime - startTime) * 100
    } else {
      // Anchor to middle point, when:
      // the slider is entirely out of range, or takes up the entire container
      const isOutContainer = startTimeForStep >= currentExtentEnd || (endTimeForStep <= currentExtentStart && startTimeForStep !== endTimeForStep) // Note a Special case: start=end, and it's at left position
      const takesUpContainer = startTimeForStep < currentExtentStart && endTimeForStep > currentExtentEnd
      if (isOutContainer || takesUpContainer) {
        position = (startTimeForStep + (endTimeForStep - startTimeForStep) / 2 - currentExtent * multiple / multipleNext / 2 - startTime) / (endTime - startTime) * 100
      } else {
        // Anchor to head, when:
        // Whenever the head of the slider is within the container
        const startPosition = (startTimeForStep - startTime) / (endTime - startTime) * 100
        const diff = startPosition - leftPosition
        if (zoomIn) {
          position = leftPosition + diff / 2
        } else {
          position = leftPosition - diff
        }
      }
    }

    // Must be in extent of timeline
    position = Math.max(0, position)
    position = Math.min(position, (multipleNext - 1) / multipleNext * 100)
    setLeftPosition(position)
  }, [zoomLevel, startTime, endTime, leftPosition, width, startTimeForStep, endTimeForStep, endTimeForTempStep, maxWidthAndZoomLevel])

  const onPreviousOrNextClick = React.useCallback((isNext) => {
    const nextEndETime = getStepEndTimeForTarget(startTime, endTime, endTimeForStep, stepLength, dividedCount, isNext)
    let newSTime = startTime
    let newETime = endTime
    if (displayStrategy === TimeDisplayStrategy.instant) { // TODO: extent
      // Limit it in current extent.
      // isNext: back to the start position.
      // !isNext: keep the current start position.
      if ((isNext && nextEndETime > endTime) || (!isNext && nextEndETime < startTime)) {
        newSTime = startTime
        newETime = startTime
      } else {
        newSTime = nextEndETime
        newETime = nextEndETime
      }
      setStartTimeForStep(newSTime)
    } else if (displayStrategy === TimeDisplayStrategy.cumulatively) {
      // rtl or ltr
      // const keepPartOutOfRight = isNext && endTimeForStep < endTime && nextEndETime > endTime
      const keepPartOutOfRight = isNext && nextEndETime > endTime
      const goToFirstFromLast = isNext && endTimeForStep >= endTime
      const stopAtStartPosition = !isNext && startTime === endTimeForStep
      if (keepPartOutOfRight) {
        if ((endTimeForTempStep || dividedCount) && isNext) {
          newETime = startTime
          setEndTimeForTempStep(null)
        } else {
          newETime = nextEndETime
          setEndTimeForTempStep(endTime)
        }
      } else {
        if (stopAtStartPosition) {
          return
        } else if (goToFirstFromLast) {
          newETime = startTime
        } else { //LTR or RTL: normal cases
          newETime = nextEndETime
        }
        setEndTimeForTempStep(null)
      }
    } else {
      const nextStartTime = getStepEndTimeForTarget(startTime, endTime, startTimeForStep, stepLength, dividedCount, isNext)
      //Only display part of current step.
      const keepPartOutOfRight = nextStartTime < endTime && nextEndETime > endTime
      //RTL-case 1 : Keep it when clicking previous-btn and focusing on the first step.
      const stopAtStartPosition = !isNext && startTime === startTimeForStep
      //RTL-case 2 : Back to start position
      const goToFirstFromCurrent = !isNext && nextStartTime < startTime
      //LTR-case 1: Click next-btn to go back to first position when focusing on the last step.
      const goToFirstFromLast = isNext && nextStartTime >= endTime

      if (keepPartOutOfRight) {
        if ((endTimeForTempStep || dividedCount) && isNext) {
          newSTime = startTime
          newETime = startTime + endTimeForStep - startTimeForStep
          setEndTimeForTempStep(null)
        } else {
          newSTime = nextStartTime
          newETime = nextEndETime //Keep it to use for prev/next play
          setEndTimeForTempStep(endTime)
        }
      } else {
        if (stopAtStartPosition) {
          return
        } else if (goToFirstFromCurrent || goToFirstFromLast) {
          newSTime = startTime
          newETime = startTime + endTimeForStep - startTimeForStep
        } else { //LTR or RTL: normal cases
          newSTime = nextStartTime
          newETime = nextEndETime
        }
        setEndTimeForTempStep(null)
      }
      setStartTimeForStep(newSTime)
    }
    setEndTimeForStep(newETime)

    // update left position, except first level
    if (zoomLevel !== 0) {
      updateLeftPositionByPlay(newSTime, newETime, isNext)
    }

    onTimeChanged(newSTime, newETime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dividedCount, endTime, endTimeForStep, startTime, startTimeForStep, stepLength, displayStrategy, onTimeChanged, updateLeftPositionByPlay])

  const stopPlay = React.useCallback(() => { // no hooks variable used
    if (playRef.current) {
      clearInterval(playRef.current)
      playRef.current = null
    }
  }, [])

  const startPlay = React.useCallback(() => {
    stopPlay() // stop previous autoPlay
    playRef.current = setInterval(() => {
      if (updating) { // prevent next step when updating is true
        return
      }
      onPreviousOrNextClick(true) // always loop.
    }, SPEED_VALUE_PAIR[speed.toLowerCase()])
  }, [speed, stopPlay, updating, onPreviousOrNextClick])

  React.useEffect(() => {
    if (!playRef.current) {
      if (isAutoplaySuspendMode || !autoPlay || updating) {
        stopPlay()
        return
      }
      startPlay()
    }
    return () => {
      stopPlay()
    }
  }, [autoPlay, updating, isAutoplaySuspendMode, stopPlay, startPlay])

  // isDesignMode change affects
  React.useEffect(() => {
    if (modeRef.current !== isAutoplaySuspendMode && isAutoplaySuspendMode !== null) {
      modeRef.current = isAutoplaySuspendMode
      if (isAutoplaySuspendMode) {
        stopPlay()
        return
      }
      if (autoPlay && !updating) {
        startPlay()
      }
    }
  }, [isAutoplaySuspendMode, startPlay, stopPlay, autoPlay, updating])

  // Temp position when dragging
  const resizeHandlerDragging = (startT: number, endT: number) => {
    // const debounceFunc = lodash.debounce(() => {
    setStartTimeForStepByDragging(startT)
    setEndTimeForStepByDragging(endT)
    // }, 10)
    // debounceFunc()
  }

  // Final position when drag-end
  const resizeHandlerDragend = (startT, endT, tempEndT) => {
    resizeHandlerDragging(null, null)
    setStartTimeForStep(startT)
    setEndTimeForStep(endT)
    setEndTimeForTempStep(tempEndT) // only for dragging slider as a whole
    onTimeChanged(startT, tempEndT || endT)
  }

  /**
   * Render ticks for stepLength case
   */
  const timelineRulerByDIV = React.useMemo(() => {
    if (!tsDetails) {
      return null
    }

    // Ruler ticks
    const fullWidth = getWidthByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel) // the width of the full ruler (the ruler's real width)

    // we use leftPosition and endPosition to define the visible part of the ruler
    const endPosition = width / fullWidth * 100 + leftPosition
    const scale = fullWidth / width

    const valueTickProps: ValueTickInfoProps = {
      details: tsDetails,
      width: fullWidth,
      localStartTime: startTime,
      localEndTime: endTime,
      leftPosition,
      endPosition,
      scale,
      intl
    }

    const years = getValueTickInfoForYear(valueTickProps)
    const months = getValueTickInfoForMonth(valueTickProps)
    const days = getValueTickInfoForDay(valueTickProps)
    const hours = getValueTickInfoForHour(valueTickProps)
    const minutes = getValueTickInfoForMinute(valueTickProps)
    const seconds = getValueTickInfoForSecond(valueTickProps)
    const tsProps: TickSizeProps = { tsDetails, years, months, days, hours, minutes, seconds }
    const tickSizes = getTickSizes(tsProps)
    const units = ['year', 'month', 'day', 'hour', 'minute', 'second']

    return <div className='timeline-ticks' >
      {
        [years, months, days, hours, minutes, seconds].map((items, unitIndex) => {
          return items.map((item, index) => {
            const position = item.position
            const unit = units[unitIndex]
            return <div key={`item-${unitIndex}-${index}`} className='timeline-tick-container' data-unit={unit} style={{ left: position }}>
              {
                item.label &&
                <div className={`timeline-tick_label ${tickSizes.labels[unit]}-label ${(unit === 'year' && index === 0 && leftPosition === 0) ? 'timeline-first_label' : ''}`}>
                  {item.label}
                </div>
              }
              <div key={index} className={classNames(`timeline-tick ${tickSizes.ticks[unit]}-tick`, item.label ? 'has-label' : 'no-label')}></div>
            </div>
          })
        })
      }
    </div>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tsDetails, zoomLevel, leftPosition])

  const timeStyles = React.useMemo(() => {
    return getTimelineStyles(theme, marginForLR, foregroundColor, backgroundColor, sliderColor)
  }, [theme, marginForLR, foregroundColor, backgroundColor, sliderColor])

  const zoomButtons = React.useMemo(() => {
    const zoomOutButton = <Button icon type='tertiary' size='sm' disabled={zoomLevel === 0}
      onClick={() => {
        updateLeftPositionByZoom(false)
        setZoomLevel(Math.max(0, zoomLevel - 1))
      }}
    >
      <MinusCircleOutlined />
    </Button>
    const zoomInButton = <Button icon type='tertiary' size='sm' disabled={zoomLevel === maxWidthAndZoomLevel?.zoomLevel}
      onClick={() => {
        updateLeftPositionByZoom(true)
        setZoomLevel(Math.min(maxWidthAndZoomLevel?.zoomLevel, zoomLevel + 1))
      }}
    >
      <PlusCircleOutlined />
    </Button>
    return <div className='zoom-container'>
      {
        zoomLevel === 0
          ? zoomOutButton
          : <Tooltip title={messages('zoomOut')} placement='bottom'>{zoomOutButton}</Tooltip>
      }
      {
        zoomLevel === maxWidthAndZoomLevel?.zoomLevel
          ? zoomInButton
          : <Tooltip title={messages('zoomIn')} placement='bottom'>{zoomInButton}</Tooltip>
      }
    </div>
  }, [zoomLevel, messages, maxWidthAndZoomLevel, updateLeftPositionByZoom])

  const playButton = React.useMemo(() => {
    if (!enablePlayControl) {
      return null
    }
    return <Tooltip title={messages(autoPlay ? 'pause' : 'play')} placement='bottom'>
      <Button icon type='tertiary' size='sm' className='play-btn' onClick={() => { setAutoPlay(!autoPlay) }}>
        {autoPlay ? <PauseOutlined /> : <PlayOutlined />}
      </Button>
    </Tooltip>
  }, [enablePlayControl, autoPlay, messages])

  const preButton = React.useMemo(() => {
    return <Tooltip title={messages('previous')} placement='bottom'>
      <Button icon type='tertiary' size='sm' onClick={e => { onPreviousOrNextClick(false) }}>
        <PreviousOutlined />
      </Button>
    </Tooltip>
  }, [messages, onPreviousOrNextClick])

  const nextButton = React.useMemo(() => {
    return <Tooltip title={messages('next')} placement='bottom'>
      <Button icon type='tertiary' size='sm' className='next-btn' onClick={e => { onPreviousOrNextClick(true) }}>
        <NextOutlined />
      </Button>
    </Tooltip>
  }, [messages, onPreviousOrNextClick])

  const InfoButton = React.useMemo(() => {
    const startLabel = intl.formatDate(startTime, dateTimePattern)
    const endLabel = intl.formatDate(endTime, dateTimePattern)
    return <React.Fragment>
      <Button
        icon type='tertiary'
        ref={ref => { infoIconRef.current = ref }}
        aria-label={messages('moreInfo')}
        aria-haspopup='true'
        aria-expanded={showInfoPopper}
        onClick={evt => { setShowInfoPopper(!showInfoPopper) }}
      >
        <InfoOutlined />
      </Button>
      <Popper
        open={showInfoPopper}
        keepMount
        arrowOptions
        reference={infoIconRef}
        toggle={evt => {
          setShowInfoPopper(false)
          if ((evt as any)?.key === 'Escape') {
            lodash.defer(() => {
              focusElementInKeyboardMode(infoIconRef.current)
            })
          }
        }}>
        <div className='p-4'>
          <Typography className='mb-2' variant='title2'>{messages('overallTimeExtent')}</Typography>
          <div className='mb-4'>{`${startLabel} - ${endLabel}`}</div>
          <Label check className='d-flex align-items-center'>
            <Typography className='flex-grow-1 mb-0 mr-1' variant='title3'>{messages('filteringApplied')}</Typography>
            <Switch checked={applied} onChange={(evt, checked) => {
              onApplyStateChanged(checked)
            }} />
          </Label>
        </div>
      </Popper>

      </React.Fragment>
  }, [messages, startTime, endTime, intl, showInfoPopper, applied, dateTimePattern, onApplyStateChanged])

  const SpeedDropdown = React.useMemo(() => {
    return <Dropdown menuRole='listbox' activeIcon className={timeStyle === TimeStyle.Classic ? '' : 'justify-content-center'} aria-label={messages('speed')}>
      <Tooltip
        placement='bottom'
        title={messages('speed')}
        // eslint-disable-next-line @typescript-eslint/prefer-find
        a11y-description={speedItems.filter(item => item.value === speed)[0].label}
      >
        <DropdownButton icon type='tertiary' arrow={false}>
          <SpeedOutlined />
        </DropdownButton>
      </Tooltip>
      <DropdownMenu>
        {
          speedItems.map(item => {
            return <DropdownItem
              key={item.value}
              active={item.value === speed}
              onClick={() => { setSpeed(item.value) }}
            >
              {item.label}
            </DropdownItem>
          })
        }
      </DropdownMenu>
    </Dropdown>
  }, [speedItems, speed, timeStyle, messages])

  const changeNextScreen = hooks.useEventCallback((isNext: boolean) => {
    const extent = endTime - startTime
    const multiple = getMultipleByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel)
    const currentExtent = extent / multiple
    const currentExtentStart = startTime + leftPosition / 100 * extent
    const nextExtentStart = currentExtentStart + (isNext ? 1 : -1) * currentExtent
    let _leftPosition = (nextExtentStart - startTime) / (endTime - startTime) * 100
    // Must in extent of timeline
    _leftPosition = Math.max(0, _leftPosition)
    _leftPosition = Math.min(_leftPosition, (multiple - 1) / multiple * 100)
    setLeftPosition(_leftPosition)
  })

  const getMarginLeftRight = (_startTimeForStep, _endTimeForStep) => {
    let startPositionForStep: any = (_startTimeForStep - startTime) / (endTime - startTime)
    let widthForStep = (_endTimeForStep - startTime) / (endTime - startTime) - startPositionForStep
    if (_startTimeForStep === endTime) {
      startPositionForStep = timeStyle === TimeStyle.Classic ? 'calc(100% - 16px)' : 'calc(100% - 8px)'
      widthForStep = 0
    } else {
      startPositionForStep = startPositionForStep * 100 + '%'
    }
    return { startPositionForStep, widthForStep }
  }

  const wMultiple = getMultipleByZoomLevel(width, zoomLevel, maxWidthAndZoomLevel)
  const isRTL = getAppStore().getState().appContext.isRTL
  const _startTimeForStep = startTimeForStepByDragging || startTimeForStep
  const _endTimeForStep = endTimeForStepByDragging || endTimeForTempStep || endTimeForStep
  // step position and width
  const { startPositionForStep, widthForStep } = getMarginLeftRight(_startTimeForStep, _endTimeForStep)
  // Labels
  const startLabelForStep = intl.formatDate(_startTimeForStep, dateTimePattern)
  const endLabelForStep = intl.formatDate(_endTimeForStep, dateTimePattern)
  // arrows
  const showLeftArrow = leftPosition !== 0
  const showRightArrow = 100 - leftPosition - 1 / wMultiple * 100 > 0.00000000001
  const isInstantMode = displayStrategy === TimeDisplayStrategy.instant
  // header label
  const headerLabel = startLabelForStep + (isInstantMode ? '' : ' - ' + endLabelForStep)
  return (
    <div css={timeStyles} dir='ltr' className={classNames('timeline w-100', {
      'timeline-classic': timeStyle === TimeStyle.Classic,
      'timeline-modern': timeStyle === TimeStyle.Modern
    })}
    >
      {
        timeStyle === TimeStyle.Classic
          ? <React.Fragment>
            <div className='timeline-header'>
              <div className='range-label' dir={isRTL ? 'rtl' : 'ltr'}>
                <div className='range-label-badge'></div>
                <div className='range-label-context'>{headerLabel}</div>
              </div>
              {zoomButtons}
            </div>
            <div className='timeline-content'>
              <div className='timeline-content-inside' >
                <div className='timeline-whole' ref={el => { containerRef.current = el }} style={{ width: wMultiple * 100 + '%', height: height + 'px', marginLeft: -(leftPosition * wMultiple) + '%' }}>
                  {timelineRulerByDIV}
                  {
                    showLeftArrow && <Tooltip title={messages('slideBackward')} placement='bottom'>
                      <Button icon type='tertiary' size='sm' className='timeline-arrow left-arrow'
                        onClick={evt => changeNextScreen(false)}
                      >
                        <Icon width={4} height={16} icon={arrowIcon} />
                      </Button>
                    </Tooltip>
                  }
                  {
                    showRightArrow && <Tooltip title={messages('slideForward')} placement='bottom'>
                      <Button icon type='tertiary' size='sm' className='timeline-arrow right-arrow'
                        onClick={evt => changeNextScreen(true)}
                      >
                        <Icon width={4} height={16} icon={arrowIcon} />
                      </Button>
                    </Tooltip>
                  }
                </div>
                <div className='timeline-range-container' style={{ width: wMultiple * 100 + '%', marginLeft: -(leftPosition * wMultiple) + '%' }}>
                  <div className='resize-handlers' ref={el => { resizeRef.current = el }} style={{ marginLeft: startPositionForStep, width: isInstantMode ? 'fit-content' : widthForStep * 100 + '%' }}>
                    {
                      isInstantMode
                        ? <button className='resize-handler resize-instant' ref={ref => { instantRef.current = ref }} title={startLabelForStep} aria-label={startLabelForStep} />
                        : <React.Fragment>
                          <button className='resize-handler resize-left' ref={ref => { startRef.current = ref }} title={startLabelForStep} aria-label={startLabelForStep} />
                          <button className='resize-handler resize-right' ref={ref => { endRef.current = ref }} title={endLabelForStep} aria-label={endLabelForStep} />
                        </React.Fragment>
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className='timeline-footer'>
              {InfoButton}
              <div className='play-container'>
                {preButton}
                {playButton}
                {nextButton}
              </div>
              {enablePlayControl ? SpeedDropdown : <div></div>}
            </div>
          </React.Fragment>
          : <React.Fragment>
            <div className={classNames('timeline-header', { 'no-play-container': !enablePlayControl })}>
              {InfoButton}
              <div className='range-label' dir={isRTL ? 'rtl' : 'ltr'}>
                <div className='range-label-badge'></div>{headerLabel}
              </div>
              {zoomButtons}
            </div>
            <div className='timeline-content'>
              <div className='timeline-left'>
                <div className='play-container'>
                  {nextButton}
                  {preButton}
                </div>
              </div>
              <div className='timeline-middle'>
                {
                  showLeftArrow && <Tooltip title={messages('slideBackward')} placement='bottom'>
                    <Button icon type='tertiary' size='sm' className={classNames('timeline-arrow left-arrow', { 'no-play-container': !enablePlayControl })}
                      onClick={evt => changeNextScreen(false)}
                    >
                      <Icon width={4} height={16} icon={arrowIcon} />
                    </Button>
                  </Tooltip>
                }
                <div className='timeline-content-inside' >
                  <div className='timeline-whole' ref={el => { containerRef.current = el }} style={{ width: wMultiple * 100 + '%', height: height + 'px', marginLeft: -(leftPosition * wMultiple) + '%' }}>
                    <div style={{ height: (height - 32) + 'px' }}></div>
                    {timelineRulerByDIV}
                    <div className='timeline-range-container' style={{ height: height + 'px', marginTop: -(height - 32) + 'px' }}>
                      <div className='resize-handlers' ref={el => { resizeRef.current = el }} style={{ marginLeft: startPositionForStep, width: isInstantMode ? 'fit-content' : widthForStep * 100 + '%' }}>
                        {
                          isInstantMode
                            ? <button className='resize-handler resize-instant' ref={ref => { instantRef.current = ref }} title={startLabelForStep} aria-label={startLabelForStep} />
                            : <React.Fragment>
                                <button className={`resize-handler resize-left ${_startTimeForStep === _endTimeForStep ? 'show-bg' : ''}`} ref={ref => { startRef.current = ref }} title={startLabelForStep} aria-label={startLabelForStep} />
                                <button className={`resize-handler resize-right ${_startTimeForStep === _endTimeForStep ? 'show-bg' : ''}`} ref={ref => { endRef.current = ref }} title={endLabelForStep} aria-label={endLabelForStep} />
                              </React.Fragment>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                {
                  showRightArrow && <Tooltip title={messages('slideForward')} placement='bottom'>
                    <Button icon type='tertiary' size='sm' className={classNames('timeline-arrow right-arrow', { 'no-play-container': !enablePlayControl })}
                      onClick={evt => changeNextScreen(true)}
                    >
                      <Icon width={4} height={16} icon={arrowIcon} />
                    </Button>
                  </Tooltip>
                }
              </div>
              <div className='timeline-right'>
                  <div className='play-container'>
                    {enablePlayControl && SpeedDropdown}
                    {playButton}
                  </div>
              </div>
            </div>
          </React.Fragment>
      }
    </div>
  )
}

const useFormatMessage = () => {
  const intl = useIntl()
  return React.useCallback((id: string, values?: any) => {
    return intl.formatMessage({ id: id, defaultMessage: allDefaultMessages[id] }, values)
  }, [intl])
}

export default TimeLine
