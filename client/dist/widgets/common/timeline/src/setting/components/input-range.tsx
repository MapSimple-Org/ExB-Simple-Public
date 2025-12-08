/** @jsx jsx */
import { React, jsx, css, lodash, type IntlShape, dateUtils } from 'jimu-core'
import { interact } from 'jimu-core/dnd'
import { Tooltip } from 'jimu-ui'
import { DATE_PATTERN, TIME_PATTERN } from '../../utils/utils'
import { bindResizeHandler, getLineInfo, getRangeByPixel, type ResizeHandlerProps } from './utils'
import { hooks } from 'jimu-core'

interface TimeSpanProps {
  theme: any
  width: number
  isRTL: boolean
  intl: IntlShape
  shadowHeight: number
  /**
   * The whole extent of the time span by layers.
   */
  extent: number[]
  /**
   * StartValue of selected range.
   */
  startValue?: number
  /**
   * EndValue of selected range.
   */
  endValue?: number
  onChange: (startValue?: number, endValue?: number) => void
}

const InputRange = function (props: TimeSpanProps) {
  const { width, isRTL, shadowHeight, extent, intl, onChange, ...others } = props
  const { startValue, endValue } = others
  const [range, setRange] = React.useState([startValue, endValue])

  const [interactable, setIteractable] = React.useState(null)
  const resizeRef = React.useRef<HTMLDivElement>(null)
  const startRef = React.useRef<HTMLButtonElement>(null)
  const endRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const debounceFunc = lodash.debounce(() => {
      if (interactable) {
        interactable.unset()
      }
      if (resizeRef.current) {
        const handlerProps: ResizeHandlerProps = {
          interact: interact,
          resizeRef: resizeRef.current,
          startValue: range[0],
          endValue: range[1],
          extent,
          width,
          setRange: setRange,
          onChange: onChange
        }
        setIteractable(bindResizeHandler(handlerProps))
      }
    }, 50)
    debounceFunc()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extent])

  React.useEffect(() => {
    startRef.current.addEventListener('keyup', startArrowEvent, true)
    endRef.current.addEventListener('keyup', endArrowEvent, true)
    function startArrowEvent (evt) {
      evt.edges = { left: true }
      updateValuesByArrowKey(evt)
    }
    function endArrowEvent (evt) {
      evt.edges = { right: true }
      updateValuesByArrowKey(evt)
    }
    return () => {
      if (startRef.current && endRef.current) {
        startRef.current.removeEventListener('keyup', startArrowEvent, true)
        endRef.current.removeEventListener('keyup', endArrowEvent, true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateValuesByArrowKey = hooks.useEventCallback((evt) => {
    if (evt.key.includes('Arrow')) {
      let dw = (evt.key === 'ArrowLeft' || evt.key === 'ArrowTop') ? 5 : -5
      if (evt.edges.right) {
        dw = -dw
      }
      const newRange = getRangeByPixel(startValue, endValue, extent, width, dw, evt)
      onChange(newRange.newStart, newRange.newEnd)
    }
  })

  React.useEffect(() => {
    setRange([startValue, endValue])
  }, [startValue, endValue])

  const lineInfo = React.useMemo(() => {
    return getLineInfo(width, extent, range[0], range[1])
  }, [width, extent, range])

  const startLabel = React.useMemo(() => {
    return dateUtils.formatDateValue(range[0], intl, DATE_PATTERN, TIME_PATTERN)
  }, [intl, range])

  const endLabel = React.useMemo(() => {
    return dateUtils.formatDateValue(range[1], intl, DATE_PATTERN, TIME_PATTERN)
  }, [intl, range])

  return (
    <React.Fragment>
      <span
        className='range-shadow'
        css={css`
          left: ${isRTL ? 'unset' : lineInfo.marginLeft};
          right: ${isRTL ? lineInfo.marginLeft : 'unset'};
          width: ${lineInfo.width};
          height: ${shadowHeight + 'px'};
        `}
      />
      <div className='layer-line extent-line' style={{ width: width }}>
        <div className='resize-handlers' ref={el => { resizeRef.current = el }} style={lineInfo}>
          <Tooltip placement='bottom' offsetOptions={10} title={startLabel}>
            <button className='resize-handler resize-left' ref={ref => { startRef.current = ref }} />
          </Tooltip>
          <Tooltip placement='bottom' offsetOptions={10} title={endLabel}>
            <button className='resize-handler resize-right' ref={ref => { endRef.current = ref }} />
          </Tooltip>
        </div>
      </div>
    </React.Fragment>
  )
}

export default InputRange
