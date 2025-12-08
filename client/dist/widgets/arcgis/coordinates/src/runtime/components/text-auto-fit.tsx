/** @jsx jsx */
import { React, css, jsx } from 'jimu-core'
import type { WidgetRect } from '../../config'
const { useEffect, useRef } = React

interface Props {
  text: string
  className?: string
  widgetRect?: WidgetRect
  domChange?: boolean
}

const getStyle = () => {
  return css`
    width: 100%;
    height: 100%;
    font-size: 20px;
    overflow: hidden;
    .text {
      display: inline-block;
      white-space: nowrap;
      transform-origin: left top;
    }
  `
}

export const TextAutoFit = React.memo((props: Props) => {
  const { text, className, widgetRect, domChange } = props
  const outerContainerDom = useRef(null)
  const textDom = useRef(null)

  useEffect(() => {
    updateText()
  }, [text, widgetRect, outerContainerDom.current?.clientWidth, outerContainerDom.current?.clientHeight, domChange])

  const updateText = () => {
    const outerWidth = outerContainerDom.current?.clientWidth
    const outerHeight = outerContainerDom.current?.clientHeight
    const textWidth = textDom.current?.clientWidth
    const textHeight = textDom.current?.clientHeight
    if (!outerWidth || !textWidth || !outerHeight || !textHeight) return
    if (textWidth !== outerWidth || textHeight !== outerHeight) {
      const widthRate = outerWidth / textWidth
      const heightRate = outerHeight / textHeight
      textDom.current.style.transform = `scale(${Math.min(widthRate, heightRate)})`
    } else {
      textDom.current.style.transform = 'none'
    }
  }

  return <div ref={outerContainerDom} css={getStyle()} className={className}>
    <div className='text' ref={textDom}>{text}</div>
  </div>
})
