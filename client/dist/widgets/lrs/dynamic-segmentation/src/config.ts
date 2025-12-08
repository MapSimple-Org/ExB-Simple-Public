import type { ImmutableObject } from 'seamless-immutable'
import type { NetworkInfo, AttributeSets, LrsLayer, MapViewConfig, ModeType } from 'widgets/shared-code/lrs'

export type FieldType = 'subtype' | 'domain' | 'range' | 'date' | 'text' | 'number'

export enum DisplayType {
  Table = 'Table',
  Diagram = 'Diagram'
}

export enum AttributeInputType {
  LineOnly = 'LineOnly',
  LineAndPoint = 'LineAndPoint'
}

export enum EventType {
  Point = 'Point',
  Line = 'Line',
  Undefined = 'Undefined'
}

export interface Track {
  index: number
  layerId: string
  layerName: string
  eventType: EventType
  records: TrackRecord[]
  visible?: boolean
  isActive: boolean
}

export interface TrackRecord {
  index: number
  objectId: number
  fromMeasure: number
  toMeasure: number
  attributes: Map<string, string | number | Date>
  geometry: __esri.Geometry
  selected: boolean
  hasValue: boolean
  isPoint: boolean
  displayField: string
  fieldInfos: DynSegFieldInfo[]
  attributeBackgrounds?: Map<string, string>
}

export interface MeasureRange {
  from: number
  to: number
}

export interface MessageProp {
  title: string
  body: string
  details?: string
  type: 'brand' | 'success' | 'danger' | 'warning'
  time?: number
}

export interface SubtypeLayers {
  id: string
  subtypes: __esri.Subtype[]
  subtypeField: string
}

export interface DynSegFieldInfo {
  index: number
  featureFieldName: string
  featureFieldAlias: string
  originalFieldName: string
  originalFieldAlias: string
  eventName: string
  eventAlias: string
  eventLayerId: string
  visible: boolean
  exclude: boolean
  editable: boolean
  EventType: EventType
  isSubtypeField: boolean
  isEventIdField: boolean
  isOidField: boolean
  displayField: string
}

export interface TableEdits {
  layerId: string
  attributes: Map<string, string | number | Date>
}

export interface QueryAttributeSetResults {
  displayFieldName: string
  fieldAliases: { [key: string]: string }
  fields: __esri.Field[]
  features: __esri.Graphic[]
  geometryType: string
  spatialReference: __esri.SpatialReference
}

export interface RouteInfoFromDataAction {
  networkInfo: ImmutableObject<NetworkInfo>
  routeId?: string
  routeName?: string
  fromMeasure?: number
  toMeasure?: number
}

export interface LocationParam {
  routeId: string
  fromMeasure?: number
  toMeasure?: number
}

export interface AttributeSetParam {
  layerId: string
  fields: string[]
}

export interface SettingsPerView {
  defaultDisplayType: DisplayType
  attributeInputType: AttributeInputType
  attributeSets?: AttributeSets
  defaultPointAttributeSet: string
  defaultLineAttributeSet: string
  mapHighlightColor: string
  tableHighlightColor: string
  defaultDiagramScale: number
  allowEditing: boolean
  allowMerge: boolean
  showEventStatistics: boolean
  defaultNetwork: string
}

export interface Config {
  lrsLayers: LrsLayer[]
  defaultDisplayType: DisplayType
  attributeInputType: AttributeInputType
  attributeSets?: AttributeSets
  defaultPointAttributeSet: string
  defaultLineAttributeSet: string
  mapHighlightColor: string
  tableHighlightColor: string
  defaultDiagramScale: number
  allowEditing: boolean
  allowMerge: boolean
  showEventStatistics: boolean
  mode?: ModeType
  mapViewsConfig?: {
    [jimuMapViewId: string]: ImmutableObject<MapViewConfig>
  }
  settingsPerView?: {
    [jimuMapViewId: string]: ImmutableObject<SettingsPerView>
  }
}

export type IMConfig = ImmutableObject<Config>
