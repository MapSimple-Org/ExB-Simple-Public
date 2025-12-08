import {
  type FeatureLayerDataSource, Immutable, DataSourceTypes, type SceneLayerDataSource,
  type BuildingComponentSubLayerDataSource, type OrientedImageryLayerDataSource, type SubtypeSublayerDataSource,
  DataSourceManager, JSAPILayerTypes
} from 'jimu-core'
import type { ILayerDefinition } from '@esri/arcgis-rest-feature-service'
import { LayerHonorModeType, type LayersConfig } from '../config'


// These fields comes from FeatureTableViewModel's doc:
// https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-FeatureTable-FeatureTableViewModel.html#columns
export const INVISIBLE_FIELD = [
  'CreationDate',
  'Creator',
  'EditDate',
  'Editor',
  'GlobalID'
]

export const SUPPORTED_JIMU_LAYER_TYPES = [
  JSAPILayerTypes.FeatureLayer,
  JSAPILayerTypes.SceneLayer,
  JSAPILayerTypes.BuildingComponentSublayer,
  JSAPILayerTypes.OrientedImageryLayer,
  JSAPILayerTypes.SubtypeSublayer
]

export type SupportedLayer =
  __esri.FeatureLayer |
  __esri.SceneLayer |
  __esri.BuildingComponentSublayer |
  __esri.OrientedImageryLayer |
  __esri.SubtypeSublayer

export const supportedDsTypes = Immutable([
  DataSourceTypes.FeatureLayer,
  DataSourceTypes.SceneLayer,
  DataSourceTypes.BuildingComponentSubLayer,
  DataSourceTypes.OrientedImageryLayer,
  DataSourceTypes.SubtypeSublayer
])

export type SupportedDataSource =
  FeatureLayerDataSource |
  SceneLayerDataSource |
  BuildingComponentSubLayerDataSource |
  OrientedImageryLayerDataSource |
  SubtypeSublayerDataSource

/**
 * Function to check if ds have a specified capability.
 * @param {string | string[]} capabilities ds's capabilities
 * @param {string} capType capability to be checked
 * @returns {boolean}
 */
export const getDsCap = (capabilities: string | string[], capType: string): boolean => {
  if (capabilities) {
    return Array.isArray(capabilities)
      ? capabilities?.join().toLowerCase().includes(capType)
      : capabilities?.toLowerCase().includes(capType)
  } else {
    return false
  }
}

export const getDsPrivileges = (layerDefinition: ILayerDefinition) => {
  const allowGeometryUpdates = layerDefinition?.allowGeometryUpdates
  const capabilities = layerDefinition?.capabilities
  const create = getDsCap(capabilities, 'create')
  const update = getDsCap(capabilities, 'update')
  const deletable = getDsCap(capabilities, 'delete')
  return { allowGeometryUpdates, create, update, deletable }
}

/**
 * Gets the names of the fields which are used for tracking edits.
 *
 * @ignore
 */
export function getEditHiddenFields(layerDefinition: ILayerDefinition): string[] {
  if (!layerDefinition) {
    return []
  }
  const objectIdField = layerDefinition.objectIdField
  const { creationDateField, creatorField, editDateField, editorField } = layerDefinition.editFieldsInfo || {}
  // REST API does not expose the `geometryProperties`
  // While Map SDK uses this to hide the st_length(shape) and st_area(shape) fields
  const { shapeAreaFieldName, shapeLengthFieldName } = (layerDefinition as any).geometryProperties || {}
  return [objectIdField, creationDateField, creatorField, editDateField, editorField, shapeAreaFieldName, shapeLengthFieldName].filter(Boolean)
}

export type NonGroupElement = __esri.AttachmentElement
  | __esri.FieldElement
  | __esri.RelationshipElement
  | __esri.TextElement
  | __esri.UtilityNetworkAssociationsElement

export const getFlatFormElements = (formElements: __esri.FormTemplate['elements']): NonGroupElement[] => {
  const flatElements: NonGroupElement[] = []
  formElements?.forEach(ele => {
    if (ele.type === 'group') {
      flatElements.push(...getFlatFormElements(ele.elements))
    } else {
      flatElements.push(ele)
    }
  })
  return flatElements
}

export const constructConfig = (ds: SupportedDataSource, layer: __esri.FeatureLayer | __esri.SubtypeSublayer) => {
  // Init capabilities
  const layerDefinition = ds.getLayerDefinition()
  const {allowGeometryUpdates, create, update, deletable} = getDsPrivileges(layerDefinition)
  // Fields operation
  const fields = ds.getSchema()?.fields?.asMutable?.({ deep: true }) || {}
  let showFields = Object.values(fields)
  // According to the API, these five items do not displayed in the Editor by default
  showFields = showFields.filter(
    item => !getEditHiddenFields(layerDefinition).includes(item.name)
  )
  // Popup Setting is initially selected by default if the map has popup setting
  const formElements = layer.formTemplate?.elements
  if (formElements) {
    const formFieldNames = getFlatFormElements(formElements).filter(ele => ele.type === 'field').map(ele => ele.fieldName)
    showFields = showFields.filter(f => formFieldNames.includes(f.name))
  }
  // If there are too many columns, only the first 50 columns will be displayed by default
  if (showFields?.length > 50) {
    showFields = showFields.slice(0, 50)
  }
  // Field editing is enabled by default
  const fieldsConfig = layerDefinition?.fields || []
  const groupedFields = showFields.map(item => {
    const orgField = fieldsConfig.find(field => field.name === item.jimuName)
    const defaultAuthority = orgField?.editable
    return {
      ...item,
      editAuthority: defaultAuthority,
      subDescription: item?.description || '',
      editable: defaultAuthority
    }
  })
  const useDataSources = {
    dataSourceId: ds.id,
    mainDataSourceId: ds.id,
    dataViewId: ds.dataViewId,
    rootDataSourceId: ds.getRootDataSource()?.id
  }
  const layerConfig: LayersConfig = {
    id: ds.id,
    name: ds.getLabel(),
    useDataSource: Immutable(useDataSources),
    addRecords: create,
    deleteRecords: deletable,
    updateRecords: update,
    updateAttributes: update,
    updateGeometries: allowGeometryUpdates && update,
    showFields,
    groupedFields,
    layerHonorMode: LayerHonorModeType.Webmap
  }
  return layerConfig
}

export const getDataSourceById = (dsId: string) => {
  return DataSourceManager.getInstance().getDataSource(dsId) as SupportedDataSource
}

export const getEditDataSource = (ds: SupportedDataSource) => {
  const isSceneLayer = ds?.type === DataSourceTypes.SceneLayer || ds?.type === DataSourceTypes.BuildingComponentSubLayer
  const isOrientedImagery = ds?.type === DataSourceTypes.OrientedImageryLayer
  let dataSource: FeatureLayerDataSource | SubtypeSublayerDataSource
  if (isSceneLayer) {
    dataSource = ds.getAssociatedDataSource()
  } else if (isOrientedImagery) {
    // OrientedImageryLayer extends FeatureLayer, so we can use it as a FeatureLayer
    dataSource = ds as unknown as FeatureLayerDataSource
  } else {
    dataSource = ds
  }
  return dataSource
}
