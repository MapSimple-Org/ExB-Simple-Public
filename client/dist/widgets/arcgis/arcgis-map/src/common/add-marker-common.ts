import { Immutable, type ImmutableObject } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'

const defaultMarkerIcon = require('../assets/marker.png')

export type MarkerSymbolJson = __esri.SimpleMarkerSymbolProperties | __esri.PictureMarkerSymbolProperties

export type MarkerSymbol = __esri.SimpleMarkerSymbol | __esri.PictureMarkerSymbol

export interface AddMarkerConfig {
  symbol?: MarkerSymbolJson
}

export type IMAddMarkerConfig = ImmutableObject<AddMarkerConfig>

export function getDefaultMarkerSymbolJson(): __esri.PictureMarkerSymbolProperties {
  return {
    // @ts-expect-error
    type: "esriPMS",
    height: 24,
    width: 24,
    angle: 0,
    xoffset: 0,
    yoffset: 12,
    url: defaultMarkerIcon
  }
}

export async function getDefaultMarkerSymbol(): Promise<__esri.SymbolUnion> {
  const modules = await loadArcGISJSAPIModules(['esri/symbols/support/jsonUtils'])
  const symbolsSupportJsonUtils = modules[0] as typeof __esri.symbolsSupportJsonUtils
  const defaultSymbolJson = getDefaultMarkerSymbolJson()
  const symbol = symbolsSupportJsonUtils.fromJSON(defaultSymbolJson)
  return symbol
}

export function getDefaultIMAddMarkerConfig(): IMAddMarkerConfig {
  const symbolJson = getDefaultMarkerSymbolJson()
  const config: AddMarkerConfig = {
    symbol: symbolJson
  }
  return Immutable(config)
}

export function getFinalIMAddMarkerConfig(config: IMAddMarkerConfig): IMAddMarkerConfig {
  if (!config || !config.symbol) {
    config = getDefaultIMAddMarkerConfig()
  }

  return config
}

export function getFinalAddMarkerSymbolInstance(finalConfig: IMAddMarkerConfig, symbolsSupportJsonUtils: typeof __esri.symbolsSupportJsonUtils): MarkerSymbol {
  let result: MarkerSymbol = null

  const symbolJson = finalConfig?.symbol

  if (symbolJson && symbolsSupportJsonUtils) {
    try {
      result = symbolsSupportJsonUtils.fromJSON(symbolJson) as any
    } catch {
      result = null
    }
  }

  return result
}

export async function asyncGetFinalAddMarkerSymbolInstance(config: IMAddMarkerConfig): Promise<MarkerSymbol> {
  const modules = await loadArcGISJSAPIModules(['esri/symbols/support/jsonUtils'])
  const symbolsSupportJsonUtils = modules[0] as typeof __esri.symbolsSupportJsonUtils
  const finalConfig = getFinalIMAddMarkerConfig(config)
  const result = getFinalAddMarkerSymbolInstance(finalConfig, symbolsSupportJsonUtils)
  return result
}
