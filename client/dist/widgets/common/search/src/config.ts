import type { UseDataSource, SqlResult, FieldSchema, ImmutableObject, DataRecord, ImmutableArray, SqlExpression, DataSourceStatus, UseUtility, IMLinkParam } from 'jimu-core'
import type { SearchSuggestionConfig, SearchGeocodeDataConfig, SearchLayerDataConfig, SearchDataConfig, DataSourceConfigWithMapCentric, PropsForDataSourceSelector } from 'jimu-ui/advanced/setting-components'
export { type SearchGeocodeDataConfig, type SearchLayerDataConfig, type IMSearchGeocodeDataConfig, type SearchDataConfig, type IMSearchDataConfig, type AddressFields, type DataSourceConfigWithMapCentric } from 'jimu-ui/advanced/setting-components'
export { type ISpatialReference } from '@esri/arcgis-rest-feature-service'
export const RECENT_SEARCHES_KEY = 'recent_searches'
export const DEFAULT_MAX_RESULT = 6
export const MAX_RESULT = 1000
export const DEFAULT_POPPER_OFFSET: [number, number] = [0, 3]
export const DEFAULT_GEOCODE_KEY = 'default_geocode'

export const MAX_SUGGESTION = 1000
export const MAX_RECENT_SEARCHES = 6
export const DEFAULT_SPATIAL_REFERENCE = {
  wkid: 4326
}

export enum SearchServiceType {
  GeocodeService = 'GeocodeService',
  FeatureService = 'FeatureService'
}

export interface InitResultServiceListOption {
  configId?: string
  magicKey?: string
  isFromSuggestion?: boolean
}

export enum SearchResultView {
  ResultPanel = 'Result_Panel',
  OtherWidgets = 'Other_Widgets'
}

export enum ArrangementStyle {
  Style1 = 'Style1',
  Style2 = 'Style2',
  Style3 = 'Style3'
}

export enum SearchResultStyle {
  Classic = 'Classic',
  Compact = 'Compact'
}

export enum EntityStatusType {
  None = '',
  Init = 'init',
  Loading = 'loading',
  Loaded = 'loaded',
  Warning = 'warning',
  Error = 'error',
}

export enum SourceType {
  CustomSearchSources = 'CustomSearchSources',
  MapCentric = 'MapCentric',
}

export interface SearchStatus {
  enabledList?: string[]
  text?: string
  status?: InitResultServiceListOption
}

export interface SearchFieldData {
  [key: string]: {
    searchFields: FieldSchema[]
    displayFields: FieldSchema[]
  }
}

export interface DatasourceCreatedStatus {
  [key: string]: DataSourceStatus
}

export type IMDatasourceCreatedStatus = ImmutableObject<DatasourceCreatedStatus>

export interface NewLayerConfigItemSetting extends SearchLayerDataConfig {
  enable: boolean
}

export interface NewGeocodeItemSetting extends SearchGeocodeDataConfig {
  enable: boolean
}

export interface NewDatasourceConfigItem extends SearchDataConfig {
  enable: boolean
  geocodeURL?: string
}

export interface AllPropsForDataSourceSelector {
  [viewId: string]: PropsForDataSourceSelector
}

export type IMNewLayerConfigItemSetting = ImmutableObject<NewLayerConfigItemSetting>

export type IMNewGeocodeItemSetting = ImmutableObject<NewGeocodeItemSetting>

export type IMNewDatasourceConfigItem = ImmutableObject<NewDatasourceConfigItem>

export type IMSearchFieldData = ImmutableObject<SearchFieldData>

export interface RecordResultType {
  records: DataRecord[]
  configId: string
  dsId: string
  localDsId?: string
  layerDsIdActuallyUsed?: string
  isGeocodeRecords: boolean
  displayFields?: FieldSchema[]
  zoomScale?: number
}

export interface SearchResult {
  [key: string]: string[]
}

export type IMRecordResultType = ImmutableObject<RecordResultType>
export type IMSearchResult = ImmutableObject<SearchResult>

export interface SelectionList {
  [key: string]: ImmutableArray<string>
}

export type IMSelectionList = ImmutableObject<SelectionList>

export interface SuggestionItem {
  suggestionHtml: string | Element
  suggestion: string
  isRecentSearch?: boolean
  configId?: string
  isFromSuggestion?: boolean
  magicKey?: string
}

export interface Suggestion {
  suggestionItem: SuggestionItem[]
  layer: string
  icon?: any
  err?: any
}

export type IMSuggestion = ImmutableObject<Suggestion>

export interface DatasourceList {
  [key: string]: DatasourceListItem
}

export interface GeocodeList {
  [key: string]: GeocodeListItem
}

export type ServiceList = DatasourceList & GeocodeList

export type ServiceListItem = DatasourceListItem & GeocodeListItem

export type IMServiceListItem = ImmutableObject<ServiceListItem>

export interface DatasourceSQLListItem {
  sqlExpression: SqlExpression[]
  outFields: string[]
}

export interface DatasourceSQLList {
  [key: string]: DatasourceSQLListItem
}
export type IMDatasourceSQLList = ImmutableObject<DatasourceSQLList>

export interface DatasourceListItem {
  searchServiceType: SearchServiceType
  maxSuggestions: number
  resultMaxNumber: number
  useDataSource: UseDataSource
  displayFields?: FieldSchema[]
  searchFields?: FieldSchema[]
  SQL?: SqlResult
  SuggestionSQL?: SqlResult
  searchExact?: boolean
  hint?: string
  isFromSuggestion?: boolean
  configId: string
  searchText?: string
  searchExtent?: any
  useUtility?: UseUtility
  searchInCurrentMapExtent?: boolean
}

export interface GeocodeListItem {
  searchServiceType: SearchServiceType
  maxSuggestions: number
  resultMaxNumber: number
  label: string
  geocodeURL: string
  outputDataSourceId: string
  hint?: string
  icon?: any
  magicKey?: string
  configId: string
  singleLineFieldName?: string
  displayFields?: FieldSchema[]
  defaultAddressFieldName?: string
  addressFields?: FieldSchema[]
  isSupportSuggest?: boolean
  searchText?: string
  useUtility?: UseUtility
  spatialReference?: { wkid: number, latestWkid?: number }
  countryCode?: string
  enableLocalSearch?: boolean,
  minScale?: number
  zoomScale?: number
}

export type IMDatasourceList = ImmutableObject<DatasourceList>
export type IMGeocodeList = ImmutableObject<GeocodeList>
export type IMServiceList = ImmutableObject<ServiceList>
export type IMDatasourceListItem = ImmutableObject<DatasourceListItem>

export type IMDataSourceConfigWithMapCentric = ImmutableObject<DataSourceConfigWithMapCentric>

export interface config extends SearchSuggestionConfig {
  synchronizeSettings?: boolean
  sourceType?: SourceType
  dataSourceConfigWithMapCentric?: DataSourceConfigWithMapCentric
  datasourceConfig?: SearchDataConfig[]
  hint: string
  searchResultView: SearchResultView
  arrangementStyle: ArrangementStyle
  searchResultStyle: SearchResultStyle
  resultMaxNumber: number
  isAutoSelectFirstResult: boolean
  // link
  linkParam?: IMLinkParam
}

export type IMConfig = ImmutableObject<config>
