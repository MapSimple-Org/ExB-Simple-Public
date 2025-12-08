import type { ImmutableObject } from 'seamless-immutable'
import type { LrsLayer, SearchMethod, AttributeSets, ModeType, MapViewConfig } from 'widgets/shared-code/lrs'

export enum OperationType {
  single = 'SINGLE',
  multiple = 'MULTIPLE'
}

export interface DefaultInfo {
  index: number
  name: string
}

export interface SettingsPerView {
  networkLayers: string[]
  eventLayers: string[]
  intersectionLayers: string[]
  attributeSets?: AttributeSets
  defaultAttributeSet: string
  defaultEvent?: DefaultInfo
  defaultNetwork?: DefaultInfo
  defaultMethod?: SearchMethod
  defaultType?: OperationType
  hideMethod?: boolean
  hideEvent?: boolean
  hideNetwork?: boolean
  hideType?: boolean
  hideAttributeSet?: boolean
  hideDates?: boolean
  useRouteStartEndDate?: boolean
  hideAddToDominantRouteOption?: boolean
  enableAddToDominantRouteOption?: boolean
  notAllowOverrideEventReplacement?: boolean
}

export interface Config {
  lrsLayers: LrsLayer[]
  networkLayers: string[]
  eventLayers: string[]
  intersectionLayers: string[]
  attributeSets?: AttributeSets
  defaultAttributeSet: string
  defaultEvent?: DefaultInfo
  defaultNetwork?: DefaultInfo
  defaultMethod?: SearchMethod
  defaultType?: OperationType
  hideMethod?: boolean
  hideEvent?: boolean
  hideNetwork?: boolean
  hideType?: boolean
  hideAttributeSet?: boolean
  hideDates?: boolean
  useRouteStartEndDate?: boolean
  hideAddToDominantRouteOption?: boolean
  enableAddToDominantRouteOption?: boolean
  notAllowOverrideEventReplacement?: boolean
  mode?: ModeType
  mapViewsConfig?: {
    [jimuMapViewId: string]: ImmutableObject<MapViewConfig>
  }
  settingsPerView?: {
    [jimuMapViewId: string]: ImmutableObject<SettingsPerView>
  }
}

export type IMConfig = ImmutableObject<Config>
