import type { ImmutableObject } from 'seamless-immutable'
import type { FeatureLayerDataSource, DataSource } from 'jimu-core'
import type { AttributeSet, AttributeSets, DefaultInfo, LrsLayer, MapViewConfig, ModeType } from 'widgets/shared-code/lrs'

export interface LocationInfo {
  ds: DataSource
  records?: any
  featureDS: FeatureLayerDataSource
  routeId: string
  objectIdFieldName?: string
  routeIdFieldName: string
  routeName: string
  routeNameFieldName: string
  lineIdFieldName?: string
  lineOrderFieldName?: string
  fromDate: Date
  toDate: Date
  supportsLines?: boolean
  selectedPoint?: __esri.Point
  selectedPolyline?: __esri.Polyline
  validRoute?: boolean
  attributes?: any[]
  configFields?: []
  measureUnit?: string
  timeDependedInfo?: TimeInfo[]
  fieldInfos: __esri.Field[]
}

export interface TimeInfo {
  objectId: string
  fromDate?: Date | number
  toDate?: Date | number
  fromMeasure?: number
  toMeasure?: number
  selectedMeasures?: any[]
  attributes?: { [key: string]: string | number | Date }
  measureUnit?: string
}

export interface SettingsPerView {
  networkLayers: string[]
  eventLayers: string[]
  intersectionLayers: string[]
  defaultEvent?: DefaultInfo
  highlightStyle?: HighlightStyle
  defaultPointAttributeSet: string
  defaultLineAttributeSet: string
  attributeSets?: AttributeSets
  lineEventToggle: boolean
  pointEventToggle: boolean
  defaultNetwork?: DefaultInfo
}

export interface Config {
  lrsLayers: LrsLayer[]
  networkLayers: string[]
  eventLayers: string[]
  intersectionLayers: string[]
  defaultEvent?: DefaultInfo
  highlightStyle?: HighlightStyle
  defaultPointAttributeSet: string
  defaultLineAttributeSet: string
  attributeSets?: AttributeSet[]
  lineEventToggle: boolean
  pointEventToggle: boolean
  defaultNetwork?: DefaultInfo
  mode?: ModeType
  mapViewsConfig?: {
    [jimuMapViewId: string]: ImmutableObject<MapViewConfig>
  }
  settingsPerView?: {
    [jimuMapViewId: string]: ImmutableObject<SettingsPerView>
  }
}

export interface HighlightStyle {
  routeColor: string
  width: number
}

export type IMConfig = ImmutableObject<Config>
