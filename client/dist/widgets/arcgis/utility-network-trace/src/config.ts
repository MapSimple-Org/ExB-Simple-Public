import type { JimuMapView } from 'jimu-arcgis'
import type { ImmutableObject } from 'jimu-core'

export interface Config {
  configInfo: ConfigInfo
}

export interface ConfigInfo {
  [dataSourceId: string]: TraceSettings
}

export interface TraceSettings {
  traceResultAreaSettings: TraceResultAreaSettings
}

export interface TraceResultAreaSettings {
  enableResultArea: boolean
  resultAreaProperties: __esri.ResultAreaPropertiesExtend
}

export interface MapConfig {
  isValid: boolean
  label: string
  dataSource: JimuMapView
}

export type IMConfig = ImmutableObject<Config>
