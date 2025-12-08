import type { SearchMethod, LrsLayer, AttributeSets, MapViewConfig, ModeType } from 'widgets/shared-code/lrs'
import type { ImmutableObject } from 'seamless-immutable'

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
  defaultFromMethod?: SearchMethod
  defaultToMethod?: SearchMethod
  defaultType?: OperationType
  hideMethod?: boolean
  hideEvent?: boolean
  hideNetwork?: boolean
  hideType?: boolean
  hideAttributeSet?: boolean
  hideMeasures?: boolean
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
  defaultFromMethod?: SearchMethod
  defaultToMethod?: SearchMethod
  defaultType?: OperationType
  hideMethod?: boolean
  hideEvent?: boolean
  hideNetwork?: boolean
  hideType?: boolean
  hideAttributeSet?: boolean
  hideMeasures?: boolean
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
