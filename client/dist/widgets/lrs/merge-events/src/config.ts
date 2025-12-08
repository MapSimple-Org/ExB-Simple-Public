import type { LrsLayer, DefaultInfo, ModeType, MapViewConfig } from 'widgets/shared-code/lrs'
import type { ImmutableObject } from 'seamless-immutable'

export interface DisplayConfig {
  hideEvent: boolean
}

export interface SettingsPerView {
  networkLayers: string[]
  eventLayers: string[]
  intersectionLayers: string[]
  defaultEvent?: DefaultInfo
  displayConfig?: DisplayConfig
}

export interface Config {
  lrsLayers: LrsLayer[]
  networkLayers: string[]
  eventLayers: string[]
  intersectionLayers: string[]
  defaultEvent?: DefaultInfo
  displayConfig?: DisplayConfig
  mode?: ModeType
  mapViewsConfig?: {
    [jimuMapViewId: string]: ImmutableObject<MapViewConfig>
  }
  settingsPerView?: {
    [jimuMapViewId: string]: ImmutableObject<SettingsPerView>
  }
}

export type IMConfig = ImmutableObject<Config>
