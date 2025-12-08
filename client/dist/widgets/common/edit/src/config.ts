import type {
  ImmutableObject,
  UseDataSource,
  FieldSchema
} from 'jimu-core'

export enum EditModeType {
  Attribute = 'ATTRIBUTE',
  Geometry = 'GEOMETRY'
}

export enum LayerHonorModeType {
  Webmap = 'WEBMAP',
  Custom = 'CUSTOM'
}

export enum ImportHintType {
  NoMap = 'NOMAP',
  NoLayer = 'NOEDITABLE'
}

export enum SnapSettingMode {
  Prescriptive = 'PRESCRIPTIVE',
  Flexible = 'FLEXIBLE'
}

export interface TreeFields extends FieldSchema {
  children?: TreeFields[]
  groupKey?: number
  editAuthority?: boolean
  subDescription?: string
  editable?: boolean
}

export interface LayersConfig {
  id: string
  name: string
  useDataSource: UseDataSource
  addRecords?: boolean
  deleteRecords?: boolean
  updateRecords?: boolean
  updateAttributes?: boolean
  updateGeometries?: boolean
  showFields: FieldSchema[]
  groupedFields: TreeFields[]
  layerHonorMode: LayerHonorModeType
}

export interface MapViewConfig {
  customizeLayers: boolean
  customJimuLayerViewIds?: string[]
  layersConfig?: LayersConfig[]
}

export interface MapViewsConfig {
  [jimuMapViewId: string]: MapViewConfig
}

export interface Config {
  layersConfig?: LayersConfig[] // feature form
  mapViewsConfig?: MapViewsConfig
  editMode: EditModeType // common
  gridSnapping?: boolean
  selfSnapping?: boolean
  featureSnapping?: boolean
  defaultGridEnabled?: boolean
  defaultSelfEnabled?: boolean
  defaultFeatureEnabled?: boolean
  defaultSnapLayers?: string[]
  description: string // feature form
  noDataMessage: string // feature form
  snapSettingMode: SnapSettingMode
  tooltip?: boolean
  defaultTooltipEnabled?: boolean
  segmentLabel?: boolean
  defaultSegmentLabelEnabled?: boolean
  templateFilter?: boolean
  relatedRecords?: boolean
  liveDataEditing?: boolean
  initialReshapeMode?: boolean
  batchEditing?: boolean
}

export type IMConfig = ImmutableObject<Config>
