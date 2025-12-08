import type { ImmutableObject } from 'jimu-core'
import type { JimuMapConfig } from 'jimu-ui/advanced/map'

export enum SceneQualityMode {
  auto = 'auto',
  low = 'low',
  medium = 'medium',
  high = 'high'
}

export interface ScaleRange {
  minScale?: number
  maxScale?: number
}

export interface CustomLODs {
  lods?: __esri.LODProperties[]
}

export type ScalebarStyle = 'line' | 'ruler' | 'number'

export type ScalebarUnit = 'metric' | 'imperial' | 'dual'

export interface ScalebarOptions {
  style: ScalebarStyle
  // when style is line, valid units: metric, imperial and dual
  // when style is ruler, valid units: metric and imperial
  // when style is number, unit is null
  unit: ScalebarUnit
  decimalPlace: number
  thousandSeparator: boolean
}

export type IMScalebarOptions = ImmutableObject<ScalebarOptions>

export interface ToolOptions {
  // null/undefined means automatic
  ScaleBar: ScalebarOptions
}

export type IMToolOptions = ImmutableObject<ToolOptions>

export interface Config extends JimuMapConfig {
  isUseCustomMapState: boolean
  popupDockPosition?: 'auto' | 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  sceneQualityMode: SceneQualityMode
  // webmap/webscene data source ids that enables client query
  clientQueryDataSourceIds?: string[]
  // customLODs and scaleRange mutually-exclusive
  // 1. If the 'Scale range' option turns off, both customLODs and scaleRange are empty.
  // 2. If the 'Scale range' option turns on,
  //    2.1 If radio 'Customize scale list' is checked, customLODs is not empty and scaleRange is empty. The default value of customLODs is empty object {}.
  //        2.1.1 If 'lods' is not in customLODs, means user doesn't customize LODs yet. This is the default value.
  //        2.1.2 If customLODs.lods is a not-empty array, means user already customizes LODs.
  //    2.2 If radio 'Adjust scale range' is checked, customLODs is empty and scaleRange is not empty. The default value of scaleRange is empty object {}.
  customLODs?: CustomLODs
  scaleRange?: ScaleRange
  toolOptions?: ToolOptions
}

export type IMConfig = ImmutableObject<Config>

export interface ToolConfig { [key: string]: boolean }
