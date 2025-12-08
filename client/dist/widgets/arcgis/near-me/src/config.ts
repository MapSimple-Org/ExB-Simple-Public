import type { UseDataSource, Expression, ImmutableObject } from 'jimu-core'
import type { FontFamilyValue } from 'jimu-ui'

export interface Config {
  generalSettings: GeneralSettings
  configInfo: any
}

export interface ConfigInfo {
  [dataSourceId: string]: IndividualConfigInfo
}

interface IndividualConfigInfo {
  analysisSettings: AnalysisSettings
  searchSettings: SearchSettings
}

export interface GeneralSettings {
  highlightColor: string
  searchAreaSymbol: any
  keepResultsWhenClosed: boolean
  noResultsFoundText: string
  noResultMsgStyleSettings: FontStyleSettings
  promptTextMessage: string
  promptTextMsgStyleSettings: FontStyleSettings
}

export interface FontStyleSettings {
  fontFamily: FontFamilyValue
  fontBold: boolean
  fontItalic: boolean
  fontUnderline: boolean
  fontStrike: boolean
  fontColor: string
  fontSize: string
}

export interface SketchTools {
  showPoint: boolean
  showPolyline: boolean
  showPolygon: boolean
}

export interface SearchSettings {
  headingLabel: string
  bufferDistance: number
  distanceUnits: string
  showDistanceSettings: boolean
  sketchTools: SketchTools
  activeToolWhenWidgetOpens: string
  searchByActiveMapArea: boolean
  includeFeaturesOutsideMapArea: boolean
  headingLabelStyle: FontStyleSettings
  showInputAddress: boolean
}

export interface AnalysisSettings {
  layersInfo: LayersInfo[]
  displayAnalysisIcon: boolean
  displayMapSymbols: boolean
  showDistFromInputLocation: boolean
  onlyShowLayersResult: boolean
  displayAllLayersResult: boolean
  enableProximitySearch: boolean
  saveFeatures: SaveFeatures
}

export interface SaveFeatures {
  saveInputLocation: boolean
  pointFeature: SaveFeatureSetting
  polylineFeature: SaveFeatureSetting
  polygonFeature: SaveFeatureSetting
  searchAreaFeature: SaveFeatureSetting
}

export interface SaveFeatureSetting {
  enabled: boolean
  useDataSource: UseDataSource
}

export interface LayersInfo {
  useDataSource: UseDataSource
  label: string
  analysisInfo: ClosestAnalysis | ProximityAnalysis | SummaryAnalysis
}

export interface ClosestAnalysis {
  analysisId: string
  analysisType: string
  highlightResultsOnMap: boolean
  highlightColorOnMap: string
  expandOnOpen: boolean
  returnIntersectedPolygons: boolean
  fieldsToExport: string[]
  includeApproxDistance: boolean
  displayFeatureCount: boolean
}

export interface ProximityAnalysis {
  analysisId: string
  analysisType: string
  displayField: string
  sortFeaturesByDistance: boolean
  sortFeatures: SortFeatures
  groupFeaturesEnabled: boolean
  groupFeatures: GroupFeatures
  subGroupFeatures: SubGroupFeatures
  highlightResultsOnMap: boolean
  highlightColorOnMap: string
  expandOnOpen: boolean
  expandFeatureDetails: boolean
  returnIntersectedPolygons: boolean
  clipFeatures: boolean
  fieldsToExport: string[]
  includeApproxDistance: boolean
  displayFeatureCount: boolean
}

export interface SortFeatures {
  sortFeaturesByField: string
  sortFeaturesOrder: string
}

export interface GroupFeatures {
  groupFeaturesByField: string
  groupFeaturesOrder: string
  sortGroupsByCount: boolean
  noValueGroupLabel: string
}

export interface SubGroupFeatures {
  subGroupFeaturesByField: string
  subGroupFeaturesOrder: string
  sortSubGroupsByCount: boolean
  noValueSubGroupLabel: string
}

export interface SummaryAnalysis {
  analysisId: string
  analysisType: string
  isSingleColorMode: boolean
  singleFieldColor: string
  selectedColorStrip: string[]
  summaryFields: SummaryFieldsInfo[]
  highlightResultsOnMap: boolean
  highlightColorOnMap: string
  expandOnOpen: boolean
  fieldsToExport: string[]
  displayFeatureCount: boolean
}

export interface SummaryFieldsInfo {
  fieldLabel: string
  fieldColor: string
  summaryFieldInfo: SumOfAreaLengthParam & Expression
}

export interface SumOfAreaLengthParam {
  summaryBy: string
  showSeparator: boolean
  numberFormattingOption: string
  significantDigits: number
}

export interface SelectedExpressionInfo {
  fieldLabel: string
  selectedExpression: Expression
}

export interface SummaryExpressionFieldInfo {
  fieldLabel: string
  fieldColor: string
  summaryFieldInfo: Expression
}

export interface CurrentLayer {
  layerDsId: string
  analysisType: string
}

export interface ColorUpdate {
  _fieldLabel: string
  _fillColor: string
}

export interface ColorMatchUpdate {
  [value: string]: ColorUpdate
}

export interface ColorMatch {
  _fillColor: string
}

export interface ColorMatches {
  [value: string]: ColorMatch
}

export interface SelectedLayers {
  label: string
  layer: LayerDsId
}

export interface LayerDsId {
  layerDsId: string
}

export interface FontSize {
  distance: number
  unit: string
}

export interface DataSourceOptions {
  label: string
  value: string
  isValid: boolean
  availableLayers: LayerDsId[]
}

export const enum AnalysisTypeName {
  Closest = 'closest',
  Proximity = 'proximity',
  Summary = 'summary'
}

export interface SummaryAttributes {
  [key: string]: any
}

export type IMConfig = ImmutableObject<Config>
