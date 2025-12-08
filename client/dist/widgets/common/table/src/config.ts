import type {
  ImmutableObject,
  ImmutableArray,
  IMFieldSchema,
  DataSource,
  UseDataSource
} from 'jimu-core'

export enum TableModeType {
  Layer = 'LAYER',
  Map = 'MAP'
}

export enum TableArrangeType {
  Dropdown = 'DROPDOWN',
  Tabs = 'TABS'
}

export enum LocationType {
  Beginning = 'beginning',
  End = 'end'
}

export enum AlignModeType {
  Start = 'start',
  Center = 'center',
  End = 'end'
}

export enum SelectionModeType {
  Single = 'SINGLE',
  Multiple = 'MULTIPLE'
}

export enum LayerHonorModeType {
  Webmap = 'WEBMAP',
  Custom = 'CUSTOM'
}

export interface Suggestion {
  suggestionHtml: string | Element
  suggestion: string
}

export interface TableFieldsSchema extends IMFieldSchema {
  editAuthority?: boolean
  editable?: boolean
  visible?: boolean
}

export enum ResponsiveType {
  Fit = 'FIT',
  Fixed = 'FIXED'
}

export enum PagingType {
  Scroll = 'SCROLL',
  Multiple = 'MULTIPLE'
}

export interface ColumnSizing {
  responsiveType: ResponsiveType
  columnWidth: number
  wrapText: boolean
  textAlign: AlignModeType
}

export interface HeaderAttrs {
  backgroundColor: string
  fontSize: number
  bold: boolean
  color: string
}

export enum TableDataActionType {
  View = 'VIEW',
  Add = 'ADD'
}

export interface LayersConfig {
  id: string
  name: string
  useDataSource?: UseDataSource
  allFields: IMFieldSchema[]
  tableFields?: TableFieldsSchema[]
  enableSearch: boolean
  searchFields?: string[]
  searchExact?: boolean
  searchHint?: string
  enableEdit: boolean
  overrideGeneralSettings?: boolean

  columnSetting?: ColumnSizing
  enableRelatedRecords?: boolean
  enableAttachments: boolean
  headerFontSetting?: HeaderAttrs
  enableSelect: boolean
  selectMode: SelectionModeType
  enableDelete: boolean
  enableRefresh: boolean
  enableShowHideColumn: boolean
  showCount?: boolean

  updateText?: boolean
  allowCsv: boolean
  dataActionObject?: any
  dataActionType?: TableDataActionType
  dataActionDataSource?: DataSource
  layerHonorMode?: LayerHonorModeType
  isFreezeFields?: boolean
  frozenFields?: string[]
  freezeLocation?: LocationType
  parentViewId?: string
  dataActionWidgetId?: string
}

export interface MapViewConfig {
  customizeLayers: boolean
  customJimuLayerViewIds?: string[]
  layersConfig?: ImmutableArray<LayersConfig>
  displayRuntimeLayers?: boolean
}

export interface MapViewsConfig {
  [jimuMapViewId: string]: MapViewConfig
}

export interface Config {
  tableMode: TableModeType
  layersConfig?: ImmutableArray<LayersConfig>
  mapViewsConfig?: MapViewsConfig
  enableMapExtentFilter?: boolean
  enableHighlightOnHover?: boolean
  defaultExtentFilterEnabled?: boolean
  respectMapRange?: boolean
  arrangeType: TableArrangeType
  pagingStyle: PagingType
  pageSize?: number
  // general settings
  enableRelatedRecords?: boolean
  enableAttachments?: boolean
  columnSetting?: ColumnSizing
  headerFontSetting?: HeaderAttrs
  enableSelect: boolean
  selectMode?: SelectionModeType
  showCount?: boolean
  enableRefresh: boolean
  enableDelete: boolean
  enableShowHideColumn: boolean
}

export type IMConfig = ImmutableObject<Config>
