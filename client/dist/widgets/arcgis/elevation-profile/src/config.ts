import type { UseDataSource, DataRecord, ImmutableObject } from 'jimu-core'
import type { JimuPolygonSymbol } from 'jimu-ui/advanced/map'

export interface Config {
  useMapWidget: boolean
  activeDataSource: string
  generalSettings: GeneralSetting
  configInfo: any
}

export interface ElevationLayers {
  addedElevationLayers: ElevationLayersInfo[]
  groundLayerId: string
  linearUnit: string
  elevationUnit: string
  showVolumetricObjLineInGraph: boolean
  volumetricObjSettingsOptions: VolumetricObjOptions
}

export interface ElevationLayersInfo {
  id: string
  useDataSource: UseDataSource
  label: string
  elevationLayerUrl: string
  style: ProfileStyle
  displayStatistics: boolean
  selectedStatistics: Statistics[]
}

export interface ProfileSettings {
  isProfileSettingsEnabled: boolean
  isCustomizeOptionEnabled: boolean
  layers: ProfileLayersSettings[]
  selectionModeOptions: SelectionModeOptions
  supportAddedLayers: boolean
}

export interface AssetSettings {
  isAssetSettingsEnabled: boolean
  layers: AssetLayersSettings[]
  assetIntersectingBuffer: AssetBufferIntersection
}

export interface GeneralSetting {
  allowExport: boolean
  keepResultsWhenClosed: boolean
  isSelectToolActive: boolean
  isDrawToolActive: boolean
  showGridAxis: boolean
  showAxisTitles: boolean
  showLegend: boolean
  buttonStyle: string
}

export interface SelectionModeOptions {
  selectionMode: string
  style: ProfileStyle
}

export interface VolumetricObjOptions {
  id: string
  style: ProfileStyle
  volumetricObjLabel: string
  displayStatistics: boolean
  selectedStatistics: Statistics[]
}

export interface Statistics {
  enabled: boolean
  name: string
  label: string
}

export interface ProfileLayersSettings {
  layerId: string
  elevationSettings: ElevationSettings
  distanceSettings: {
    type: string
    field: string
    unit: string
  }
  style: ProfileStyle
}

interface ElevationSettings {
  type: string
  unit: string
  field1: string
  field2: string
}

export interface AssetLayersSettings {
  layerId: string
  elevationSettings: ElevationSettings
  displayField: string
  style: AssetStyle
}

export interface AssetBufferIntersection {
  enabled: boolean
  bufferDistance: number
  bufferUnits: string
  bufferSymbol: JimuPolygonSymbol
}

export enum ButtonTriggerType {
  IconText = 'ICONTEXT'
}

export interface ProfileStyle {
  lineType: string
  lineColor: string
  lineThickness: number
}

export interface AssetStyle {
  type: string
  intersectingAssetShape: string
  intersectingAssetSize: number
  intersectingAssetColor: string
}

export interface ElevationType {
  value: string
  name: string
}

export interface LayerIntersectionInfo {
  title: string
  intersectionResult: IntersectionResult []
  inputGeometry: __esri.Geometry
  settings: AssetLayersSettings
}
export interface IntersectionResult {
  record: DataRecord
  intersectingFeature: __esri.Graphic
  disconnectedFeatureForProfiling: __esri.Point[]
  connectedFeatureForProfiling: __esri.Geometry[]
}

export interface StatisticsAttributes {
  [key: string]: any
}

export type IMConfig = ImmutableObject<Config>
