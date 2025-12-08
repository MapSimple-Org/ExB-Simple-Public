import type { SpatialRelationship, Units } from '@esri/arcgis-rest-feature-service'
import type { ImmutableObject, ImmutableArray, SqlExpression, UseDataSource, IconResult, OrderByOption } from 'jimu-core'
import type { Size } from 'jimu-ui'

export enum CreateToolType {
  Point = 'Point',
  Polyline = 'Polyline',
  Polygon = 'Polygon',
  Rectangle = 'Rectangle',
  Circle = 'Circle'
}

export enum SelectionType {
  NewSelection = 'NEW_SELECTION',
  AddToSelection = 'ADD_TO_CURRENT_SELECTION',
  RemoveFromSelection = 'REMOVE_FROM_CURRENT_SELECTION',
  SubsetSelection = 'SUBSET_FROM_CURRENT_SELECTION',
  SwitchSelection = 'SWITCH_CURRENT_SELECTION',
}

export interface Field {
  name: string
  alias?: string
  label?: string
}

export enum QueryArrangeType {
  Block = 'BLOCK',
  Inline = 'INLINE',
  Popper = 'POPPER',
}

export enum SpatialFilterType {
  CurrentMapExtent = 'CurrentMapExtent',
  InteractiveDrawMode = 'InteractiveDrawMode',
  None = ''
}

export enum SpatialRelation {
  Intersect = 'intersects',
  Contain = 'contains',
  Cross = 'crosses',
  EnvelopeIntersect = 'envelope-intersects',
  IndexIntersect = 'index-intersects',
  Overlap = 'overlaps',
  Touch = 'touches',
  Within = 'within',
}

export interface SpatialFilterObj {
  geometry: any
  graphic?: __esri.Graphic
  layer?: __esri.GraphicsLayer
  clearAfterApply?: boolean
  relation?: SpatialRelation
  buffer?: { distance: number, unit: UnitType }
}

export const mapJSAPISpatialRelToDsSpatialRel: { [key: string]: SpatialRelationship } = {
  [SpatialRelation.Intersect]: 'esriSpatialRelIntersects',
  [SpatialRelation.Contain]: 'esriSpatialRelContains',
  [SpatialRelation.Cross]: 'esriSpatialRelCrosses',
  [SpatialRelation.EnvelopeIntersect]: 'esriSpatialRelEnvelopeIntersects',
  [SpatialRelation.IndexIntersect]: 'esriSpatialRelIndexIntersects',
  [SpatialRelation.Overlap]: 'esriSpatialRelOverlaps',
  [SpatialRelation.Touch]: 'esriSpatialRelTouches',
  [SpatialRelation.Within]: 'esriSpatialRelWithin'
}

export enum UnitType {
  Miles = 'Miles',
  Kilometers = 'Kilometers',
  Feet = 'Feet',
  Meters = 'Meters',
  NauticalMiles = 'NauticalMiles',
}

export const mapJSAPIUnitToDsUnit: { [key: string]: Units } = {
  [UnitType.Miles]: 'esriSRUnit_StatuteMile',
  [UnitType.Kilometers]: 'esriSRUnit_Kilometer',
  [UnitType.Feet]: 'esriSRUnit_Foot',
  [UnitType.Meters]: 'esriSRUnit_Meter',
  [UnitType.NauticalMiles]: 'esriSRUnit_NauticalMile'
}

export enum ListDirection {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

export enum PagingType {
  MultiPage = 'MultiPage',
  LazyLoad = 'LazyLoad',
}

export enum FieldsType {
  PopupSetting = 'PopupSetting',
  SelectAttributes = 'SelectAttributes',
}

export enum SortDirection {
  Asc = 'Asc',
  Desc = 'Desc',
}

export enum ResultSelectMode {
  Single = 'Single',
  Multiple = 'Multiple',
}

export interface SortOption {
  name: string
  direction: SortDirection
}

export enum SymbolType {
  DefaultSymbol = 'DefaultSymbol',
  CustomSymbol = 'CustomSymbol',
}

export interface QueryItemType {
  configId: string
  icon?: IconResult
  name?: string
  displayLabel?: boolean
  useDataSource?: UseDataSource
  outputDataSourceId?: string
  useAttributeFilter?: boolean
  useSpatialFilter?: boolean
  attributeFilterLabel?: string
  spatialFilterLabel?: string
  attributeFilterDesc?: string
  spatialFilterDesc?: string
  resultsLabel?: string
  sqlExprObj?: SqlExpression
  spatialMapWidgetIds?: string[]
  spatialFilterTypes?: SpatialFilterType[]
  spatialInteractiveCreateToolTypes?: CreateToolType[]
  spatialInteractiveEnableBuffer?: boolean
  spatialInteractiveBufferDistance?: number
  spatialInteractiveBufferUnit?: UnitType
  spatialRelations?: SpatialRelation[]
  spatialRelationUseDataSources?: UseDataSource[]
  spatialRelationEnableSelectTool?: boolean
  spatialRelationEnableBuffer?: boolean
  spatialRelationBufferDistance?: number
  spatialRelationBufferUnit?: UnitType
  spatialIncludeRuntimeData?: boolean
  resultListDirection?: ListDirection
  resultPagingStyle?: PagingType
  resultFieldsType?: FieldsType
  resultTitleFields?: string[]
  resultTitleExpression?: string
  resultDisplayFields?: string[]
  resultSymbolType?: SymbolType
  resultCustomSymbol?: any
  resultAllowChangeSymbol?: boolean
  resultExpandByDefault?: boolean
  resultSelectMode?: ResultSelectMode
  allowExport?: boolean
  sortOptions?: OrderByOption[]
  itemSizeMap?: {
    arrangementHorizontalPopper?: SizeMap
  }
}

export interface SizeMap {
  minSize?: Size
  defaultSize?: Size
}

export interface SettingConfig {
  queryItems?: ImmutableArray<QueryItemType>
  arrangeType: QueryArrangeType
  arrangeWrap?: boolean
  resultListDirection?: ListDirection
  resultPagingStyle?: PagingType
  defaultPageSize?: number
  sizeMap?: {
    arrangementIconPopper?: SizeMap
  }
}

export type IMConfig = ImmutableObject<SettingConfig>
