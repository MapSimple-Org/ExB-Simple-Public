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
  Simple = 'Simple', // Render all records at once, no lazy loading or pagination
}

export enum FieldsType {
  PopupSetting = 'PopupSetting',
  SelectAttributes = 'SelectAttributes',
  CustomTemplate = 'CustomTemplate', // r023.18: Markdown template with {fieldName} substitution
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
  resultContentExpression?: string // r023.18: Markdown template for CustomTemplate mode
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
  // Grouping fields
  groupId?: string
  groupDisplayName?: string
  searchAlias?: string
  shortId?: string
  zoomToSelected?: boolean
  // Display order (lower numbers appear first, optional)
  order?: number
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
  lazyLoadInitialPageSize?: number
  highlightMapWidgetId?: string // Map widget ID to use for graphics layer highlighting
  // Graphics Layer Symbology Configuration
  highlightFillColor?: string         // Hex color (e.g., '#DF00FF' - magenta)
  highlightFillOpacity?: number       // 0-1 (default: 0.25)
  highlightOutlineColor?: string      // Hex color (e.g., '#DF00FF' - magenta)
  highlightOutlineOpacity?: number    // 0-1 (default: 1.0)
  highlightOutlineWidth?: number      // pixels (default: 2)
  highlightPointSize?: number         // pixels (default: 12)
  highlightPointOutlineWidth?: number // pixels (default: 2) - separate from polygon outline
  highlightPointStyle?: 'circle' | 'square' | 'cross' | 'x' | 'diamond'  // default: 'circle'
  // Hover Preview Pin Configuration
  hoverPinColor?: string              // Hex color (e.g., '#FFC107' - yellow) - default: '#FFC107'
  // Result Click Behavior
  /** r023.31: Default false. When true, clicking a result zooms to it. When false, use "Zoom to" from result menu. */
  zoomOnResultClick?: boolean
  // r024.0: LayerList Integration - Persistent Result Layers
  /** Default false. When true, results render as GroupLayer in LayerList; layer persists when widget closes. */
  addResultsAsMapLayer?: boolean
  /** Custom title for the results layer in LayerList. Default: 'QuerySimple Results'. */
  resultsLayerTitle?: string
  sizeMap?: {
    arrangementIconPopper?: SizeMap
  }
}

export type IMConfig = ImmutableObject<SettingConfig>


