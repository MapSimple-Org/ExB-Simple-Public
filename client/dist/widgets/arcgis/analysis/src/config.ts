import type { AnalysisHistoryItem, AnalysisGPJobStatus, SerializedHistoryItem as ComponentSerializedHistoryItem } from '@arcgis/analysis-shared-utils'
import type { AnalysisToolParam, AnalysisToolData, AnalysisToolDataItem, AnalysisToolInfo, AnalysisEngine } from '@arcgis/analysis-ui-schema'
import type { UseUtility, DataSource, ImmutableObject } from 'jimu-core'

export enum ToolType {
  Standard = 'standard',
  Custom = 'custom',
  RasterFunction = 'rfx'
}

export interface Config {
  toolList: ToolConfig[]
  displayToolHistoryFromMap?: boolean
  historyResourceItemsFromMap?: ComponentSerializedHistoryItem[]
}

export interface ToolConfig {
  id: string
  type: ToolType
  toolName: string
  analysisEngine: AnalysisEngine
  config: StandardToolConfig | CustomToolConfig
}

export interface StandardToolConfig {
  input: StandardToolInput
  output: StandardToolOutput
  option: StandardToolOption
}

export interface StandardToolInput {
  selectFromMapLayer: boolean
  allowBrowserLayers: boolean
  allowDrawingOnTheMap: boolean
  allowLocalFileUpload: boolean
  allowServiceUrl: boolean
  selectFromOtherWidget: boolean
}

export interface StandardToolOutput {
  addResultLayersToMapAuto: boolean
  allowExportResults: boolean
}

export interface StandardToolOption {
  presetFromMapHistoryId?: string
}

export interface CustomToolOutput {
  ignoreResultMapServer?: boolean
  ignored: { [key: string]: boolean }
  allowExport: { [key: string]: boolean }
  decimalPlace: { [key: string]: number }
  dateFormat: { [key: string]: string }
  timeFormat: { [key: string]: string }
  addResultLayersToMapAuto: { [key: string]: boolean }
  symbol?: { [key: string]: any }
}

export interface CustomToolOption {
  showHelpLink: boolean
  link: string
  messageLevel?: MessageLevel
  toolDisplayName?: string
}

export interface CustomToolConfig {
  toolInfo: AnalysisToolInfo
  utility?: UseUtility
  toolUrl: string
  output: CustomToolOutput
  option: CustomToolOption
}

export type IMConfig = ImmutableObject<Config>

export type SubmissionData = AnalysisGPJobStatus['submissionData']

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type CombinedHistoryParameter = AnalysisToolData | AnalysisToolDataItem

export interface FailedLayer {
  layerName: string
  reasonForFailure: string
}

export interface HistoryItemWithDs extends Omit<AnalysisHistoryItem, 'results'> {
  results: __esri.ParameterValue[]
  isImportedFromMap?: boolean
  toolId: string
  /**
   * All data source of results in history will store in dsMap,
   * the key of the map will be: `${resultIndex}-${valueItemIndex}-...`
   *
   * eg:
   *
   * - If only have one result with a GPFeatureRecordSetLayer value like: [{ dataType: 'feature-record-set-layer', paramName: 'Output_Feature_Class', value: { url: 'xxxx } }]
   *
   * The dsMap will be: new Map([['0', dataSourceInstance]])
   *
   * - If have two results with a GPFeatureRecordSetLayer value like: [{ dataType: 'feature-record-set-layer', paramName: 'Output_Feature_Class', value: { url: 'xxxx } }, { dataType: 'feature-record-set-layer', paramName: 'Output_Feature_Class', value: { url: 'xxxx } }]
   *
   * The dsMap will be: new Map([['0', dataSourceInstance], ['1', dataSourceInstance]])
   *
   * - If only have one result with a GPMultiValue:GPFeatureRecordSetLayer value like: [{ dataType: 'multi-value-feature-record-set-layer', paramName: 'Output_Feature_Class', value: [{ url: 'xxxx }, { url: 'xxxx }] }]
   *
   * The dsMap will be: new Map([['0-0', dataSourceInstance], ['0-1', dataSourceInstance]])
   *
   * - If only have one result with a GPValueTable value like: [{ dataType: 'GPValueTable', paramName: 'Output_Feature_Class', value: [['abc', { url: 'xxxx }], ['def', 1, { url: 'xxxx }]] }]
   *
   * The dsMap will be: new Map([['0-0-1', dataSourceInstance], ['0-1-2', dataSourceInstance]])
   */
  dsMap?: Map<string, DataSource>
  dsCreateError?: Map<string, FailedLayer>
  id: string
}

// TODO replace this with SerializedHistoryItem in component once they support other result type
export interface SerializedHistoryItem extends Omit<AnalysisHistoryItem, 'jobInfo' | 'results'> {
  jobInfo: string
  results: __esri.ParameterValue[]
}

export interface CustomToolParam extends AnalysisToolParam {
  selectFromMapLayer?: boolean // for analysis-layer-input mapLayers param
  hideBrowseButton?: boolean // for analysis-layer-input hideBrowseButton param
  enableSketch?: boolean // for analysis-layer-input enableSketch param
  hideUpload?: boolean // for analysis-data-file-input hideUpload param
  /**
   * for input param's visibility setting, undefined and false means visible, true means hidden
   */
  invisible?: boolean
  useFeatureCollection?: boolean
}

export interface AnalysisGPJobSubmitted extends AnalysisGPJobStatus {
  toolId: string
}

export interface SynchronousJobExecuteResult {
  messages: __esri.GPMessage[]
  results: __esri.ParameterValue[]
}

export interface CustomToolAdded {
  toolInfo: AnalysisToolInfo
  utility?: UseUtility
  toolUrl: string
}

export enum MessageLevel {
  None = 'NONE',
  Error = 'ERROR',
  Warning = 'WARNING',
  Info = 'INFO'
}
