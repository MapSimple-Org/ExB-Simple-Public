import type { LrsLayer, DefaultInfo, ModeType, MapViewConfig } from 'widgets/shared-code/lrs'
import type { ImmutableObject } from 'seamless-immutable'

export interface SettingsPerView {
  networkLayers: string[]
  eventLayers: string[]
  defaultEvent?: DefaultInfo
  hideEvent?: boolean
  hideNetwork?: boolean
  hideDate?: boolean
  useRouteStartDate?: boolean
}

export interface Config {
  lrsLayers: LrsLayer[]
  networkLayers: string[]
  eventLayers: string[]
  defaultEvent?: DefaultInfo
  hideEvent?: boolean
  hideNetwork?: boolean
  hideDate?: boolean
  useRouteStartDate?: boolean
  mode?: ModeType
  mapViewsConfig?: {
    [jimuMapViewId: string]: ImmutableObject<MapViewConfig>
  }
  settingsPerView?: {
    [jimuMapViewId: string]: ImmutableObject<SettingsPerView>
  }
}

export type IMConfig = ImmutableObject<Config>
