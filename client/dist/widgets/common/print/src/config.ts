import type { ImmutableObject, ImmutableArray, UseUtility, UseDataSource } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
export const FORMAT_ITEM: FormatType[] = ['pdf', 'png32', 'png8', 'jpg', 'gif', 'eps', 'svg', 'svgz']
export const LAYOUT_ITEM: LayoutType[] = ['map-only', 'a3-landscape', 'a3-portrait', 'a4-landscape', 'a4-portrait', 'letter-ansi-a-landscape', 'letter-ansi-a-portrait', 'tabloid-ansi-b-landscape', 'tabloid-ansi-b-portrait']
export const SCALEBAR_UNIT: ScalebarUnitType[] = ['Miles', 'Kilometers', 'Meters', 'Feet']
export const DEFAULT_MAP_WIDTH = 800
export const DEFAULT_MAP_HEIGHT = 1100
export const DEFAULT_DPI = 96
export const WKID_LINK = 'https://developers.arcgis.com/rest/services-reference/enterprise/using-spatial-references.htm'
export const CIMMarkerNorthArrow = 'CIMMarkerNorthArrow'
export const MAX_PREVIEW_OPACITY = 0.6
export const DEFAULT_PREVIEW_OPACITY = 0.3
export const DEFAULT_PREVIEW_BACKGROUND = 'rgba(0,216,237,0.3)'
export const PREVIEW_BACKGROUND = 'rgba(0,216,237,1)'
export const DEFAULT_OUTLINE = {
  color: '#000',
  size: '4px'
}

export enum PrintServiceTaskType {
  ExportWebMap = 'ExportWebMap',
  GetLayoutTemplatesInfo = 'GetLayoutTemplatesInfo',
  GetReportTemplatesInfo = 'GetReportTemplatesInfo',
}

export interface ElementOverrides {
  [key: string]: MapSurroundInfo
}

export type MapSurroundInfoItemType = "CIMMarkerNorthArrow" | "CIMScaleLine" | "CIMLegend" | "CIMGroupElement" | "CIMGraphicElement" | "CIMTableFrame" | "CIMChartFrame"
export interface MapSurroundInfo {
  name: string;
  type: MapSurroundInfoItemType
  visible: boolean;
  exbDataSource?: UseDataSource[]
  isDsOutputDs?: boolean
  elements?: Array<Omit<MapSurroundInfo, 'elements'>>;
  dynamicTextElements?: Array<Omit<MapSurroundInfo, "elements">>;
  sourceLayerId?: string
  filterType?: 'all' | 'visible' | 'selected'
}

export interface ElementOverrideOptions {
  northArrow: MapSurroundInfo[]
  scaleBar: MapSurroundInfo[]
  legend: MapSurroundInfo[]
  dynamicText: MapSurroundInfo[]
  table: MapSurroundInfo[]
  chart: MapSurroundInfo[]
}

export interface ActiveItem {
  id: string
  title?: string
}

export interface OutputDataSourceWarningOption {
  label: string
  widgets: string
}

export enum PrintExtentType {
  CurrentMapExtent = 'CURRENT MAP EXTENT',
  CurrentMapScale = 'CURRENT MAP SCALE',
  SetMapScale = 'SET MAP SCALE'
}

export enum MapFrameUnit {
  Point = 'POINT',
  Inch = 'INCH',
  Centimeter = 'CENTIMETER',
  Millimeter = 'MILLIMETER'
}

export interface WebMapFrameSize {
  width: number
  height: number
}

interface CustomTextElementEnable {
  [key: string]: boolean
}

export const DEFAULT_LAYOUT_OPTIONS = {
  customTextElements: [],
  hasAuthorText: true,
  hasCopyrightText: true,
  hasLegend: true,
  hasTitleText: true
}

export const DEFAULT_TEMPLATE_INFO = {
  layoutOptions: DEFAULT_LAYOUT_OPTIONS,
  mapSurroundInfos: [],
  pageSize: null,
  pageUnits: null,
  webMapFrameSize: null
}

export const DEFAULT_COMMON_SETTING = {
  scalePreserved: false,
  outScale: 36978595.474472,
  layoutOptions: {
    titleText: 'ArcGIS Web Map'
  },
  exportOptions: {
    dpi: DEFAULT_DPI
  },
  printExtentType: PrintExtentType.CurrentMapExtent,
  attributionVisible: false,
  forceFeatureAttributes: true,
  wkid: null,
  wkidLabel: null,
  enableTitle: true,
  legendEnabled: true,
  enableMapPrintExtents: true,
  enableOutputSpatialReference: true,
  enableQuality: true,
  enableFeatureAttribution: true,
  enableMapSize: true,
  overrideCommonSetting: false,
  enableAuthor: true,
  enableCopyright: true,
  enableLegend: true,
  enableScalebarUnit: true,
  enableCustomTextElements: true
}

export enum ItemInfoType {
  LayoutTemplate = 'Layout Template',
  ReportTemplate = 'Report Template'
}

export enum ModeType {
  Classic = 'CLASSIC',
  Compact = 'COMPACT'
}

export enum PrintServiceType {
  OrganizationService = 'ORGANIZATION SERVICE',
  Customize = 'CUSTOMIZE'
}

export enum PrintTemplateType {
  OrganizationTemplate = 'ORGANIZATION TEMPLATE',
  Customize = 'CUSTOMIZE'
}

export enum PrintResultState {
  Loading = 'LOADING',
  Success = 'SUCCESS',
  Error = 'ERROR'
}

export enum Views {
  PrintTemplate = 'PRINT TEMPLATE',
  PrintResult = 'PRINT RESULT'
}

export interface PrintResultListItemType {
  resultId: string
  url: string
  title: string
  state: PrintResultState
}

export interface JimuMapViews { [viewId: string]: JimuMapView }
export type IMJimuMapViews = ImmutableObject<JimuMapViews>

export type IMPrintResultListItemType = ImmutableObject<PrintResultListItemType>

export type PrintResultList = PrintResultListItemType[]
export type IMPrintResultList = ImmutableArray<PrintResultListItemType>
/**
 * The output format for the printed map.
 *
 * [Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-support-PrintTemplate.html#format)
 */
export type FormatType = 'pdf' | 'png32' | 'png8' | 'jpg' | 'gif' | 'eps' | 'svg' | 'svgz' | 'tiff' | 'aix'

/**
* The layout used for the print output.
*
* [Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-support-PrintTemplate.html#layout)
*/
// export type LayoutType = 'map-only'
// | 'a3-landscape'
// | 'a3-portrait'
// | 'a4-landscape'
// | 'a4-portrait'
// | 'letter-ansi-a-landscape'
// | 'letter-ansi-a-portrait'
// | 'tabloid-ansi-b-landscape'
// | 'tabloid-ansi-b-portrait'
export type LayoutType = string

export type ScalebarUnitType = 'Miles' | 'Kilometers' | 'Meters' | 'Feet'

export interface LayoutInfo {
  layoutTemplate: LayoutType
  pageSize?: number[]
  mapFrameSize?: number[]
  mapFrameUnit?: MapFrameUnit
  hasAuthorText?: boolean
  hasCopyrightText?: boolean
  hasLegend?: boolean
  hasTitleText?: boolean
  enableAuthor?: boolean
  enableCopyright?: boolean
  enableLegend?: boolean
  enableScalebarUnit?: boolean
  enableCustomTextElements?: boolean
  customTextElementEnableList?: CustomTextElementEnable[]
  enableNorthArrow?: boolean
  layout: LayoutType
  layoutOptions: {
    hasAuthorText?: boolean
    hasCopyrightText?: boolean
    hasLegend?: boolean
    hasTitleText?: boolean
    customTextElements?: any[]
  }
}

export interface PreviewOutLine {
  color?: string
  size?: string | number
}

export enum LayoutTypes {
  ServiceLayout = 'Service Layout',
  CustomLayout = 'Custom Layout'
}

export enum ReportTemplateTypes {
  RPTT = 'RPTT',
  RPTX = 'RPTX'
}

export enum ReportTypes {
  ServiceReport = 'Service Report',
  CustomReport = 'Custom Report'
}

export type PrintParameters = __esri.PrintParameters
export type MapView = __esri.MapView

export interface PrintTemplateProperties extends __esri.PrintTemplateProperties {
  templateId?: string
  printExtentType?: PrintExtentType
  wkid?: number | string
  label?: string
  legendEnabled?: boolean

  //Size of map in template
  mapFrameSize?: number[]
  mapFrameUnit?: MapFrameUnit

  overrideCommonSetting?: boolean
  enableTitle?: boolean
  enableMapPrintExtents?: boolean
  enableOutputSpatialReference?: boolean
  enableQuality?: boolean
  enableMapSize?: boolean
  enableFeatureAttribution?: boolean
  enableAuthor?: boolean
  enableCopyright?: boolean
  enableLegend?: boolean
  enableScalebarUnit?: boolean
  enableMapAttribution?: boolean
  enableCustomTextElements?: boolean
  customTextElementEnableList?: CustomTextElementEnable[]
  enableNorthArrow?: boolean

  layoutTypes?: LayoutTypes
  reportTypes?: ReportTypes
  customLayoutItem?: ActiveItem
  customReportItem?: ActiveItem

  hasAuthorText?: boolean
  hasCopyrightText?: boolean
  hasLegend?: boolean
  hasTitleText?: boolean
  selectedFormatList?: FormatType[]

  wkidLabel?: string
}

export type IMPrintTemplateProperties = ImmutableObject<PrintTemplateProperties>
export interface config {
  modeType: ModeType
  printServiceType: PrintServiceType
  printTemplateType: PrintTemplateType
  useUtility?: UseUtility
  printCustomTemplate?: PrintTemplateProperties[]
  printOrgTemplate?: PrintTemplateProperties[]
  commonSetting?: PrintTemplateProperties
  formatList?: FormatType[]
  hasInitBorder?: boolean
  previewBackgroundColor: string
  enablePreview: boolean
  previewOutLine: PreviewOutLine

  supportCustomLayout?: boolean
  supportReport?: boolean
  supportCustomReport?: boolean

  defaultFormat?: FormatType
  defaultReportTemplate?: string
  defaultCustomReportItem?: ActiveItem
  defaultCustomLayoutItem?: ActiveItem
  defaultLayout?: string

  reportTemplateChoiceList?: any[]
  layoutChoiceList?: LayoutInfo[]
}

export type IMConfig = ImmutableObject<config>
