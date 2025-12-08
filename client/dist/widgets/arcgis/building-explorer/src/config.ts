import type { ImmutableObject, ImmutableArray } from 'seamless-immutable'

export interface NumericRange {
  min?: number
  max?: number
  allowedValuesLimit?: number[]
  defaultValue?: number | ''
  allowedValues?: number[]
}
export interface ViewModelResult {
  level: NumericRange
  phase: NumericRange
}

export enum LayerMode {
  Single = 'SINGLE',
  //Multiple = 'MULTIPLE'
}

// 1 maps
export interface MapsSettings {
  [key: string]: MapSetting // <jimumapViewId, MapSetting>
}
export interface MapSetting {
  layerMode?: LayerMode
  layersOnLoad?: ImmutableArray<string>
  enableLevel?: boolean
  //level?: NumericRange
  enablePhase?: boolean
  //phase?: NumericRange
  enableCtegories?: boolean
}
// 2 general
export interface GeneralConfig {
  zoomToLayer: boolean
  applyFilterOnDs: boolean
}

export interface config {
  mapSettings: MapsSettings
  general: GeneralConfig
}
export type IMConfig = ImmutableObject<config>
