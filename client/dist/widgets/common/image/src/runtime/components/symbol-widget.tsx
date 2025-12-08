import { React, css, type DataRecord } from 'jimu-core'
import { SymbolComponent } from './symbol-component'

interface SymbolWidgetProps {
  record: DataRecord
  toolTip: string
  altText: string
  symbolScale: number
}

const getStyle = (symbolScale: number) => {
  return css`
    .image-symbol {
      display: grid;
      place-items: center;
      svg, img {
        transform: scale(${symbolScale});
      }
    }
  `
}

const SymbolWidget = React.memo((props: SymbolWidgetProps) => {
  const { record, toolTip, altText, symbolScale = 1 } = props
  const symbolElementRef = React.useRef<HTMLDivElement>(null)

  const onSymbolElementChange = React.useCallback((symbolElement: HTMLElement) => {
    const svgOrImg = ['IMG', 'SVG'].includes(symbolElement?.tagName) ? symbolElement : symbolElement?.querySelector?.('svg,img')
    if (svgOrImg) {
      svgOrImg.setAttribute('alt', altText)
    }
    if (symbolElementRef.current) {
      symbolElementRef.current.innerHTML = ''
      symbolElement && symbolElementRef.current.appendChild(symbolElement.cloneNode(true))
    }
  }, [altText])

  const unmountSymbolElementChange = React.useCallback(() => {
    if (symbolElementRef.current) {
      symbolElementRef.current.innerHTML = ''
    }
  }, [])

  return <React.Fragment>
      <div className='w-100 h-100' css={getStyle(symbolScale)}>
        <div ref={symbolElementRef} className='w-100 h-100 image-symbol' title={toolTip} />
      </div>
      <SymbolComponent
        record={record}
        unmountSymbolElementChange={unmountSymbolElementChange}
        onChange={onSymbolElementChange}
      />
  </React.Fragment>
})

export default SymbolWidget
