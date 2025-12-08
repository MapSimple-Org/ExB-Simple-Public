/** @jsx jsx */
import { jsx } from 'jimu-core'
import React from 'react'
import { getTheme } from 'jimu-theme'
import { round } from 'lodash-es'
import { RULER_FONT, RULER_LONG_LINE, RULER_MAIN_LINE, RULER_PRECISION, RULER_SEGMENT_COUNT, RULER_SHORT_LINE, RULER_TEXT_BACKGROUND, SLD_TRACK_HEIGHT } from '../../../../constants'

export interface RulerProps {
  width?: number
  zoom?: number
  range?: [number, number]
  scrollPosition?: number
  onClickOrHover?: (e: any, clicked: boolean, hover: boolean) => void
  onDoubleClick?: (e: any) => void
}

export function Ruler (props: RulerProps) {
  const theme = getTheme()
  const {
    width = 0,
    zoom = 1,
    range = [-Infinity, Infinity],
    scrollPosition = 0,
    onClickOrHover
  } = props
  const canvasElement = React.useRef(null)
  const [isClickActive, setIsClickActive] = React.useState<boolean>(false)
  const [isHover, setIsHover] = React.useState<boolean>(false)

  React.useEffect(() => {
    function handleLostFocus (event: MouseEvent) {
      if (canvasElement.current && !canvasElement.current.contains(event.target as Node)) {
        setIsClickActive(false)
        setIsHover(false)
        onClickOrHover(null, false, false)
      }
    }

    // Add event listener to handle lost focus
    document.addEventListener('click', handleLostFocus)
    return () => {
      // Clean up to remove listener
      document.removeEventListener('click', handleLostFocus)
    }
  }, [canvasElement, onClickOrHover])

  React.useEffect(() => {
    draw(scrollPosition, zoom)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollPosition, zoom, width])

  const getVarColor = (str) => {
    // Canvas doesn't support variables when setting colors (e.g. 'var(--color)')
    // So we need to create a temp div and get the computed color
    const elem = document.createElement('div')
    elem.style.display = 'none'
    elem.style.color = str
    document.body.appendChild(elem)
    return window.getComputedStyle(elem, null).getPropertyValue('color')
  }

  const isNegative = React.useMemo(() => range[0] < 0, [range])
  const backgroundColor = React.useMemo(() => getVarColor(theme.sys.color.surface.background), [theme])
  const color = React.useMemo(() => getVarColor(theme.sys.color.surface.backgroundHint), [theme])


  const draw = (scrollPosition: number, zoom: number) => {
    const canvas = canvasElement.current
    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    // Clear Canvas
    context.rect(0, 0, width, SLD_TRACK_HEIGHT)
    context.fillStyle = backgroundColor
    context.fill()

    context.save()
    context.scale(1, 1)
    context.strokeStyle = color
    context.lineWidth = 1
    context.font = RULER_FONT
    context.fillStyle = color
    context.textAlign = 'left'
    context.textBaseline = 'bottom'
    context.translate(0.5, 0)
    context.beginPath()

    const scale = range[1] - range[0]
    const zoomUnit = zoom * (width / scale)
    const scrollPos = scrollPosition / zoom === 0 ? Number.MIN_VALUE : scrollPosition / zoom
    const minRangeRaw = scrollPos * zoom / zoomUnit
    const maxRangeRaw = (scrollPos * zoom + width) / zoomUnit
    let minRange = Math.floor(minRangeRaw)
    const rawLength = maxRangeRaw - minRangeRaw
    let length
    if (rawLength < 1) {
      length = rawLength
    } else {
      length = round(rawLength, 0)
    }

    const lengthRatio = Math.ceil(length / 10)
    if (minRange % lengthRatio !== 0) {
      const offset = minRange % lengthRatio
      minRange -= offset
      length += offset
    }

    const alignOffset = Math.max(['left', 'center', 'right'].indexOf('left') - 1, -1)
    const barSize = SLD_TRACK_HEIGHT
    const values: Array<{
      color: string
      backgroundColor?: string
      value: number
      text: string
      textSize: number
      isLast: boolean
    }> = []

    for (let i = 0; i <= length; ++i) {
      if (i % lengthRatio !== 0) {
        continue
      }

      const value = (i + minRange) * (width / scale)
      const text = `${round(((scale / width) * value + range[0]), RULER_PRECISION)}`
      const textSize = context.measureText(text).width

      values.push({
        color: color,
        backgroundColor: RULER_TEXT_BACKGROUND,
        value,
        text,
        textSize: textSize,
        isLast: false
      })
    }

    // Render Segments First
    for (let i = 0; i <= length; ++i) {
      const value = i + minRange

      if (!isNegative && value < 0) {
        continue
      }

      const startValue = value * (width / scale)
      const startPos = (startValue - scrollPos) * zoom

      if (length >= 10) {
        const eighth = lengthRatio / RULER_SEGMENT_COUNT

        if (i % lengthRatio !== 0) {
          continue
        }

        for (let j = 0; j < RULER_SEGMENT_COUNT; ++j) {
          const pos = startPos + (j * eighth) * zoomUnit

          if (pos < 0 || pos >= width) {
            continue
          }

          let lineSize = RULER_MAIN_LINE

          if (j === 0) {
            lineSize = RULER_MAIN_LINE
          } else if (j % 5 === 0) {
            lineSize = RULER_LONG_LINE
          } else {
            lineSize = RULER_SHORT_LINE
          }

          const origin = barSize - lineSize
          const [x1, y1] = [pos, origin]
          const [x2, y2] = [x1, y1 + lineSize]

          context.moveTo(x1, y1)
          context.lineTo(x2, y2)
        }
      } else if (length < 1) {
        values.length = 0
        const tickStep = (range[1] - range[0]) / (RULER_SEGMENT_COUNT - 1)
        for (let j = 0; j < RULER_SEGMENT_COUNT; ++j) {
          const tickValue = round(range[0] + j * tickStep, RULER_PRECISION)
          const pos = (j / (RULER_SEGMENT_COUNT - 1)) * (zoom * width) - scrollPosition

          if (pos < 0 || pos > width) {
            continue
          }

          let lineSize = RULER_MAIN_LINE
          if (j === 0) {
            lineSize = RULER_MAIN_LINE
          } else if (j % 5 === 0) {
            lineSize = RULER_LONG_LINE
          } else {
            lineSize = RULER_SHORT_LINE
          }

          const origin = barSize - lineSize
          const [x1, y1] = [pos, origin]
          const [x2, y2] = [x1, y1 + lineSize]

          context.moveTo(x1, y1)
          context.lineTo(x2, y2)

          // Calculate tick value for label
          const text = tickValue.toString()
          const textSize = context.measureText(text).width

          values.push({
            color: color,
            backgroundColor: RULER_TEXT_BACKGROUND,
            value: pos,
            text,
            textSize,
            isLast: j === RULER_SEGMENT_COUNT
          })
        }
      } else {
        for (let j = 0; j < RULER_SEGMENT_COUNT; ++j) {
          const pos = startPos + j / RULER_SEGMENT_COUNT * zoomUnit

          if (pos < 0 || pos >= width) {
            continue
          }

          let lineSize = RULER_MAIN_LINE

          if (j === 0 && i % lengthRatio === 0) {
            lineSize = RULER_MAIN_LINE
          } else if (j % 5 === 0) {
            lineSize = RULER_LONG_LINE
          } else {
            lineSize = RULER_SHORT_LINE
          }

          const origin = barSize - lineSize
          const [x1, y1] = [pos, origin]
          const [x2, y2] = [x1, y1 + lineSize]

          context.moveTo(x1, y1)
          context.lineTo(x2, y2)
        }
      }
    }
    context.stroke()
    context.beginPath()

    if (values.length === 0) {
      // Calculate visible start and end values based on scrollPosition and zoom
      const visibleStartValue = round(range[0] + (scrollPosition / (zoom * width)) * (range[1] - range[0]), RULER_PRECISION)
      const visibleEndValue = round(range[0] + ((scrollPosition + width) / (zoom * width)) * (range[1] - range[0]), RULER_PRECISION)

      // Start label at position 0
      values.push({
        color: color,
        backgroundColor: RULER_TEXT_BACKGROUND,
        value: 0,
        text: visibleStartValue.toString(),
        textSize: context.measureText(visibleStartValue.toString()).width,
        isLast: false
      })

      // End label at position width
      values.push({
        color: color,
        backgroundColor: RULER_TEXT_BACKGROUND,
        value: width,
        text: visibleEndValue.toString(),
        textSize: context.measureText(visibleEndValue.toString()).width,
        isLast: true
      })
    } else if (values.length === 1) {
      // Calculate visible start and end values based on scrollPosition and zoom
      const visibleStartValue = round(range[0] + (scrollPosition / (zoom * width)) * (range[1] - range[0]), RULER_PRECISION)
      const visibleEndValue = round(range[0] + ((scrollPosition + width) / (zoom * width)) * (range[1] - range[0]), RULER_PRECISION)

      // If the existing label is closer to the start, add a label at the end
      if (Math.abs(values[0].value - 0) < Math.abs(values[0].value - width)) {
        values.push({
          color: color,
          backgroundColor: RULER_TEXT_BACKGROUND,
          value: width,
          text: visibleEndValue.toString(),
          textSize: context.measureText(visibleEndValue.toString()).width,
          isLast: true
        })
      } else {
        // Otherwise, add a label at the start
        values.push({
          color: color,
          backgroundColor: RULER_TEXT_BACKGROUND,
          value: 0,
          text: visibleStartValue.toString(),
          textSize: context.measureText(visibleStartValue.toString()).width,
          isLast: false
        })
      }
    }

    // Render Labels
    values.forEach(({ value, backgroundColor, color, text, textSize, isLast }) => {
      if (!isNegative && value < 0) {
        return
      }

      let startPos
      if (length < 1) {
        startPos = value
      } else {
        startPos = (value - scrollPos) * zoom
      }

      if (startPos < -zoomUnit || startPos >= width + (width / scale) * zoom) {
        return
      }

      const origin = isLast ? 17 : barSize - 16
      const offset = isLast ? textSize / 2 : alignOffset

      const [startX, startY] = [startPos + offset * -3, origin]

      if (backgroundColor) {
        let backgroundOffset = 0
        if (isLast) {
          backgroundOffset = -textSize
        } else {
          backgroundOffset = 0
        }
        context.save()
        context.fillStyle = backgroundColor
        context.fillRect(startX + backgroundOffset, 0, textSize, RULER_MAIN_LINE)
        context.restore()
      }

      context.save()
      context.fillStyle = color
      context.fillText(text, startX, startY)
      context.restore()
    })

    context.restore()
  }

  const onMouseDown = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isHover) {
      setIsClickActive(!isClickActive)
      onClickOrHover(e, !isClickActive, isHover)
    }
  }, [isHover, isClickActive, onClickOrHover])

  const onMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isHover) {
      onClickOrHover(e, isClickActive, isHover)
    }
  }, [isHover, isClickActive, onClickOrHover])

  const onMouseEnter = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsHover(true)
  }, [])

  const onMouseLeave = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsHover(false)
    onClickOrHover(e, isClickActive, false)
  }, [isClickActive, onClickOrHover])

  const onDoubleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    props.onDoubleClick?.(e)
  }, [props])

  return (
  <div
    className="dyn-seg-ruler"
    style={{ width: width }}
    onMouseDown={onMouseDown}
    onMouseMove={onMouseMove}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onDoubleClick={onDoubleClick}
    >
    <canvas
      ref={canvasElement}
      width={width}
      height={SLD_TRACK_HEIGHT}/>
  </div>
  )
}
