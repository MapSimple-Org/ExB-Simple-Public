/** @jsx jsx */
import { React, css, jsx } from 'jimu-core'
import type { WidgetRect } from '../../config'
const { useEffect, useRef } = React

interface ElevEyeProps {
  elevNum: number
  elevText: string
  eyeNum: number
  eyeAltText: string
  widgetSizeAuto: boolean
  widgetRect?: WidgetRect
}

const getStyle = () => {
  return css`
    height: 50%;
    .three-d-container {
      width: calc(50% - 8px);
      margin-right: 8px;
      height: 100%;
      float: left;
      &:last-of-type{
        margin-right: unset !important;
        margin-left: 8px;
        float: right !important;
      }
      .coordinates-card-text {
        width: 100%;
        height: 100%;
        font-size: 20px;
        overflow: hidden;
        .text {
          display: inline-block;
          white-space: nowrap;
          transform-origin: left top;
        }
      }
    }

  `
}

const ElevEye = (props: ElevEyeProps) => {
  const { elevNum, elevText, eyeNum, eyeAltText, widgetSizeAuto, widgetRect } = props
  const elevContainerDom = useRef(null)
  const eyeContainerDom = useRef(null)
  const elevTextDom = useRef(null)
  const eyeTextDom = useRef(null)

  const updateUsedTextStyle = React.useCallback(() => {
    const elevScale = getTextScale(elevContainerDom, elevTextDom)
    const eyeScale = getTextScale(eyeContainerDom, eyeTextDom)
    const usedScale = Math.min(elevScale, eyeScale)
    if (elevTextDom.current) elevTextDom.current.style.transform = `scale(${usedScale})`
    if (eyeTextDom.current) eyeTextDom.current.style.transform = `scale(${usedScale})`
  }, [elevContainerDom, elevTextDom, eyeContainerDom, eyeTextDom])

  useEffect(() => {
    updateUsedTextStyle()
  }, [widgetRect, elevNum, eyeNum, elevContainerDom.current?.clientWidth, elevContainerDom.current?.clientHeight,
    eyeContainerDom.current?.clientWidth, eyeContainerDom.current?.clientHeight, updateUsedTextStyle
  ])

  const getTextScale = (outerContainerDom, textDom) => {
    let scale: number = 1
    const outerWidth = outerContainerDom.current?.clientWidth
    const outerHeight = outerContainerDom.current?.clientHeight
    const textWidth = textDom.current?.clientWidth
    const textHeight = textDom.current?.clientHeight
    if (!outerWidth || !textWidth || !outerHeight || !textHeight) return scale
    if (textWidth !== outerWidth || textHeight !== outerHeight) {
      const widthRate = outerWidth / textWidth
      const heightRate = outerHeight / textHeight
      scale = Math.min(widthRate, heightRate)
    }
    return scale
  }

  return <div className='h-50' css={getStyle()}>
    <div className='three-d-container'>
      {elevNum !== null
        ? (widgetSizeAuto
            ? <div className='coordinates-card-text-fixed'>{elevNum}</div>
            : <div ref={elevContainerDom} className='coordinates-card-text'>
              <div className='text' ref={elevTextDom}>{elevNum}</div>
            </div>
          )
        : <div className='coordinates-card-text-empty'>--</div>
      }
      <div className='info-unit truncate-two' title={elevText}>{elevText}</div>
    </div>
    <div className='three-d-container'>
      {eyeNum !== null
        ? (widgetSizeAuto
            ? <div className='coordinates-card-text-fixed'>{eyeNum}</div>
            : <div ref={eyeContainerDom} className='coordinates-card-text'>
              <div className='text' ref={eyeTextDom}>{eyeNum}</div>
            </div>
          )
        : <div className='coordinates-card-text-empty'>--</div>
      }
      <div className='info-unit truncate-two' title={eyeAltText}>{eyeAltText}</div>
    </div>
  </div>
}

export default ElevEye