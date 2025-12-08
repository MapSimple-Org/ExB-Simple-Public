import type { UseUtility } from 'jimu-core'
import type { SearchDataConfig, SearchSuggestionConfig } from 'jimu-ui/advanced/setting-components'
import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  routeConfig?: RouteConfig
  searchConfig?: SearchConfig
  showRuntimeLayers?: boolean
  unit?: UnitOption
  enableRouteSaving?: boolean
}

export enum UnitOption {
  Imperial = 'imperial',
  Metric = 'metric'
}

export type IMConfig = ImmutableObject<Config>

export interface RouteConfig {
  useUtility?: UseUtility
  barrierLayers?: BarrierLayers
  presetStart?: PresetPoint
  presetEnd?: PresetPoint
}

export interface PresetPoint {
  geometry: __esri.Geometry
  name: string
}
export interface BarrierLayers {
  [jmvId: string]: string[]
}

export type IMRouteConfig = ImmutableObject<RouteConfig>

export interface SearchConfig {
  dataConfig?: SearchDataConfig[]
  generalConfig?: SearchGeneralConfig
  suggestionConfig?: SearchSuggestionConfig
}
export type IMSearchConfig = ImmutableObject<SearchConfig>

interface SearchGeneralConfig {
  hint: string
}
