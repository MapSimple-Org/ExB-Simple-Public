import Graphic from 'esri/Graphic'
import { highlightColor } from 'widgets/shared-code/lrs'

export const getHighLightSymbol = (graphic: __esri.Graphic, width: number, color?: string): __esri.Graphic => {
  if (!color) {
    color = highlightColor
  }
  switch (graphic?.geometry?.type) {
    case 'point':
      return getPointSymbol(graphic, color, width)
    case 'polyline':
      return getPolyLineSymbol(graphic, color, width)
    default:
      return null
  }
}

const getPointSymbol = (graphic: __esri.Graphic, color: string, width: number): __esri.Graphic => {
  const symbol = {
    type: 'simple-marker',
    style: 'circle',
    width: width,
    color: color || highlightColor,
    outline: {
      color: color || highlightColor,
      width: 1
    }
  }
  const graphics = new Graphic({
    geometry: graphic.geometry,
    symbol: symbol as unknown as __esri.SymbolUnion,
    attributes: graphic.attributes
  })
  return graphics
}

const getPolyLineSymbol = (graphic: __esri.Graphic, color: string, symbolWidth: number): __esri.Graphic => {
  const symbolLine = {
    type: 'simple-line',
    color: color || highlightColor,
    width: symbolWidth,
    style: 'solid',
    outline: {
      color: color || highlightColor,
      width: 1
    }
  }
  const graphics = new Graphic({
    geometry: graphic.geometry,
    symbol: symbolLine as unknown as __esri.SymbolUnion,
    attributes: graphic.attributes
  })
  return graphics
}
