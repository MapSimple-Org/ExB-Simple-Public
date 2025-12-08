// default symbol mechanism for config storage optimization ,#6174
// if use default symbols, set Graphic.symbols = null

import { loadArcGISJSAPIModules } from 'jimu-arcgis'
export default class DefaultSymbols {
  symbolJsonUtils: typeof __esri.symbolsSupportJsonUtils = null

  async setup (): Promise<DefaultSymbols> {
    await loadArcGISJSAPIModules([
      'esri/symbols/support/jsonUtils'
    ]).then((modules) => {
      [this.symbolJsonUtils] = modules
    })
    return this
  }

  getDefaultPointSymbol = (color): __esri.PointSymbol3D => {
    const pt = this.symbolJsonUtils.fromJSON({
      type: 'PointSymbol3D',
      symbolLayers: [{
        type: 'Icon',
        material: { color: color },
        size: 12,
        outline: { color: [255, 255, 255], size: 0.75 }
      }],
      verticalOffset: {
        screenLength: 5,
        minWorldLength: 5,
        maxWorldLength: 10
      },
      callout: {
        type: 'line',
        color: [255, 255, 255],
        size: 2,
        border: { color: [50, 50, 50] }
      }
    }) as __esri.PointSymbol3D
    return pt
  }

  getDefaultLineSymbol = (color): __esri.LineSymbol3D => {
    const line = this.symbolJsonUtils.fromJSON({
      type: 'LineSymbol3D',
      symbolLayers: [{
        type: 'Line',
        material: {
          color: color, // [13,137,255]
          transparency: 50
        },
        join: 'round',
        cap: 'round',
        size: 2.25
      }]
    }) as __esri.LineSymbol3D
    return line
  }
}
