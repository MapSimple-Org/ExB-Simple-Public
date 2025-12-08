import {
  type FeatureLayerDataSource, type DataSource, type UseDataSource, Immutable, DataSourceTypes, DataSourceManager,
  type SceneLayerDataSource, type BuildingComponentSubLayerDataSource, type OrientedImageryLayerDataSource,
  type SubtypeSublayerDataSource, type ImageryLayerDataSource, type ImmutableArray, type ImmutableObject,
  JSAPILayerTypes, dataSourceUtils
} from 'jimu-core'
import { AlignModeType, LayerHonorModeType, ResponsiveType, SelectionModeType, type LayersConfig } from '../config'
import type { JimuLayerView } from 'jimu-arcgis'

export interface HonorWebmapUsedFields {
  hasPopup: boolean
  honorUsedFields: any[]
  honorHiddenFields: string[]
}

export const INVISIBLE_FIELD = [
  'CreationDate',
  'Creator',
  'EditDate',
  'Editor',
  'GlobalID'
]

export const supportedDsTypes = Immutable([
  DataSourceTypes.FeatureLayer,
  DataSourceTypes.SceneLayer,
  DataSourceTypes.BuildingComponentSubLayer,
  DataSourceTypes.OrientedImageryLayer,
  DataSourceTypes.ImageryLayer,
  DataSourceTypes.SubtypeSublayer
])

export const batchDsTypes = Immutable([
  DataSourceTypes.WebMap, DataSourceTypes.WebScene, DataSourceTypes.MapService,
  DataSourceTypes.FeatureService, DataSourceTypes.SceneService, DataSourceTypes.GroupLayer,
  DataSourceTypes.BuildingGroupSubLayer, DataSourceTypes.BuildingSceneLayer, DataSourceTypes.SubtypeGroupLayer
])

export type SupportedDataSource =
  FeatureLayerDataSource |
  SceneLayerDataSource |
  BuildingComponentSubLayerDataSource |
  OrientedImageryLayerDataSource |
  ImageryLayerDataSource |
  SubtypeSublayerDataSource

export const getArrayMaxId = (layersConfigs: ImmutableArray<LayersConfig>): number => {
  const numbers = layersConfigs.map(layersConfig => {
    return layersConfig.id.split('-').reverse()[0]
  })
  return numbers.length > 0 ? Math.max.apply(null, numbers) : 0
}

/**
 * Function to construct layer config from dataSource.
 * @param {DataSource} currentDs used dataSource
 * @param {boolean} isMapMode table widget is map mode
 * @param {(dsId: string) => string} getNewConfigId method to get config id in layer mode
 * @returns {LayersConfig} layer config
 */
export const constructConfig = (currentDs: DataSource, isMapMode?: boolean, getNewConfigId?: (dsId: string) => string, originalDs?: SupportedDataSource): LayersConfig => {
  const allFields = currentDs.getSchema()
  const layerDefinition = (currentDs as FeatureLayerDataSource)?.getLayerDefinition()
  const allFieldsDetails = allFields?.fields ? Object.values(allFields?.fields) : []
  const fieldsConfig = layerDefinition?.fields || []
  // In the previous code, because the api hidden the five fields of INVISIBLE_FIELD by default.
  // Currently, in the new logic, these fields will not be hidden. Instead, their Settings will be honored.
  // Initially, they are hidden by default, but they can be displayed through the setting change
  let initTableFields = allFieldsDetails.map(item => {
    const orgField = fieldsConfig.find(field => field.name === item.jimuName)
    const defaultAuthority = orgField?.editable
    return { ...item, editAuthority: defaultAuthority, editable: defaultAuthority, visible: true }
  })
  // Field-maps setting is initially selected by default if the map has field-maps setting
  const popupSetting = (currentDs as FeatureLayerDataSource)?.getPopupInfo()?.fieldInfos
  // const popupSetting = (selectedDs as FeatureLayerDataSource)?.layer?.formTemplate?.elements
  if (currentDs.dataViewId !== 'output' && popupSetting && popupSetting?.length > 0) {
    const popupVisibleFieldNames = []
    popupSetting.forEach(item => {
      if (item?.visible) {
        popupVisibleFieldNames.push(item.fieldName)
      }
    })
    initTableFields = initTableFields.filter(
      item => popupVisibleFieldNames.includes(item.name)
    )
  }
  // If there are too many columns, only the first 50 columns will be displayed by default
  if (initTableFields?.length > 50) {
    initTableFields = initTableFields.slice(0, 50)
  }
  // save the fields they used in its `useDataSource.fields`
  const useDs = originalDs || currentDs
  const useDataSource = {
    dataSourceId: useDs.id,
    mainDataSourceId: useDs.getMainDataSource()?.id,
    dataViewId: useDs.dataViewId,
    rootDataSourceId: useDs.getRootDataSource()?.id
  } as UseDataSource
  const currentIMUseDs = Immutable(useDataSource)
  const usedFields = initTableFields.map(f => f.jimuName)
  const curIMUseDsWithFields = currentIMUseDs.set('fields', usedFields)
  const configId = isMapMode ? currentDs.id : (getNewConfigId ? getNewConfigId(currentDs.id) : currentDs.id)
  const layerItem: LayersConfig = {
    id: configId,
    name: currentDs.getLabel(),
    useDataSource: curIMUseDsWithFields.asMutable({ deep: true }),
    allFields: allFieldsDetails,
    tableFields: initTableFields,
    overrideGeneralSettings: false,
    enableAttachments: false,
    enableEdit: false,
    allowCsv: false,
    enableSearch: false,
    searchFields: [],
    enableRefresh: true,
    enableShowHideColumn: true,
    enableSelect: true,
    enableDelete: false,
    selectMode: SelectionModeType.Single,
    showCount: true,
    headerFontSetting: {
      backgroundColor: '',
      fontSize: 14,
      bold: false,
      color: ''
    },
    columnSetting: {
      responsiveType: ResponsiveType.Fixed,
      columnWidth: 200,
      wrapText: false,
      textAlign: AlignModeType.Start
    },
    layerHonorMode: LayerHonorModeType.Webmap
  }
  return layerItem
}

export const sameOriginUpdateConfig = (currentDs: DataSource, oldLayerConfig: ImmutableObject<LayersConfig>,
  getNewConfigId?: (dsId: string) => string, originalDs?: SupportedDataSource
): LayersConfig => {
  // save the fields they used in its `useDataSource.fields`
  const useDs = originalDs || currentDs
  const useDataSource = {
    dataSourceId: useDs.id,
    mainDataSourceId: useDs.getMainDataSource()?.id,
    dataViewId: useDs.dataViewId,
    rootDataSourceId: useDs.getRootDataSource()?.id
  } as UseDataSource
  const currentIMUseDs = Immutable(useDataSource)
  const usedFields = oldLayerConfig.tableFields.map(f => f.jimuName)
  const curIMUseDsWithFields = currentIMUseDs.set('fields', usedFields)
  const configId = getNewConfigId ? getNewConfigId(currentDs.id) : currentDs.id
  const layerItem: LayersConfig = {
    ...oldLayerConfig.asMutable({ deep: true }),
    id: configId,
    name: currentDs.getLabel(),
    useDataSource: curIMUseDsWithFields.asMutable({ deep: true })
  }
  return layerItem
}

export const SUPPORTED_JIMU_LAYER_TYPES: string[] = [
  JSAPILayerTypes.FeatureLayer,
  JSAPILayerTypes.SceneLayer,
  JSAPILayerTypes.BuildingComponentSublayer,
  JSAPILayerTypes.OrientedImageryLayer,
  JSAPILayerTypes.ImageryLayer,
  JSAPILayerTypes.SubtypeSublayer
]

export function isSupportedJimuLayerView (jimuLayerView: JimuLayerView): boolean {
  if (!jimuLayerView || !jimuLayerView.type) {
      return false
    }
    const viewType = jimuLayerView.type
    // Some BuildingComponentSublayer doesn't have layer view, so need to check jimuLayerView.view here.
    const isViewPass = (viewType !== JSAPILayerTypes.BuildingComponentSublayer) || (viewType === JSAPILayerTypes.BuildingComponentSublayer && jimuLayerView.view)
    const isSupported = SUPPORTED_JIMU_LAYER_TYPES.includes(viewType)
    return isViewPass && isSupported
}

export const getDataSourceById = (dsId: string) => {
  return DataSourceManager.getInstance().getDataSource(dsId) as SupportedDataSource
}

export const getTableDataSource = (ds: SupportedDataSource) => {
  const isSceneLayer = ds?.type === DataSourceTypes.SceneLayer || ds?.type === DataSourceTypes.BuildingComponentSubLayer
  const isOrientedImagery = ds?.type === DataSourceTypes.OrientedImageryLayer
  const isImagery = ds?.type === DataSourceTypes.ImageryLayer
  let dataSource: FeatureLayerDataSource | SubtypeSublayerDataSource | ImageryLayerDataSource
  if (isSceneLayer) {
    dataSource = ds.getAssociatedDataSource()
  } else if (isOrientedImagery || isImagery) {
    // OrientedImageryLayer/Imagery extends FeatureLayer, so we can use it as a FeatureLayer
    dataSource = ds as unknown as FeatureLayerDataSource
  } else {
    dataSource = ds
  }
  return dataSource
}

/**
 * Compares two arrays of objects, with key as the unique id, and returns the difference between the arrays
 * @param {any[]} array1 An array for comparison
 * @param {any[]} array2 An array for comparison
 * @param {string} key A unique id for array comparison
 * @returns {any[]} Array difference
 */
export function minusArray (array1, array2, key?: string) {
  const keyField = key || 'jimuName'
  const lengthFlag = array1.length > array2.length
  const arr1 = lengthFlag ? array1 : array2
  const arr2 = lengthFlag ? array2 : array1
  return arr1.filter(item => {
    const hasField = arr2.some(ele => {
      return ele?.[keyField] === item?.[keyField]
    })
    return !hasField
  })
}

export const getQueryOptions = (curLayer: LayersConfig, searchText: string, dataSource) => {
  let where = '1=1'
  let sqlExpression = null
  const dsNotExist = !dataSource
  if (dsNotExist) return null
  // not queriable data source, return
  if (!(dataSource).query) {
    return null
  }
  if (searchText && curLayer.enableSearch && curLayer.searchFields) {
    const result = dataSourceUtils.getSQL(searchText, curLayer.searchFields, dataSource, curLayer?.searchExact)
    where = result.sql
    sqlExpression = result
  }
  return { where, sqlExpression }
}

export const getFilteredUseFields = (schemaFields, definitionFields) => {
  let filteredUseFields = []
  const schemaFieldsKeys = Object.keys(schemaFields || {})
  // use layer definition fields
  if (definitionFields?.length >= schemaFieldsKeys?.length) {
    filteredUseFields = definitionFields.filter(item => schemaFieldsKeys.includes(item.name || item.alias)).map(field => {
      return {
        ...field,
        format: schemaFields?.[field.name]?.format
      }
    })
  } else {
    schemaFieldsKeys.forEach(key => {
      const currentField = schemaFields[key]
      const hasDefinitionField = definitionFields.find(field => field.name === key)
      // some definition has domain info, if exist, need to merge this info into schemaFields
      filteredUseFields.push({
        ...currentField,
        ...hasDefinitionField
      })
    })
  }
  return filteredUseFields
}

export const getHonorWebmapUsedFields = (dataSource: SupportedDataSource): HonorWebmapUsedFields => {
  const allFieldsSchema = dataSource?.getSchema()
  const allFields = allFieldsSchema?.fields ? Object.values(allFieldsSchema?.fields) : []
  const layerDefinition = dataSource?.getLayerDefinition()
  const useFields = layerDefinition?.fields?.length > 0 ? layerDefinition.fields : allFields
  const popupInfo = dataSource?.getPopupInfo?.()
  const popupAllFieldInfos = popupInfo?.fieldInfos || []
  // use schemaFields to filter used fields, some field is special and invisible in schema
  const schemaFieldsKeys = Object.keys(allFieldsSchema?.fields || {})
  const filteredPopupFieldInfos = popupAllFieldInfos.filter(item => {
    return schemaFieldsKeys.includes(item.fieldName)
  })
  const filteredUseFields = getFilteredUseFields(allFieldsSchema?.fields, useFields)
  const hasPopup = popupInfo?.fieldInfos?.length > 0
  // get hidden fields for setting
  const popupHiddenFields = []
  schemaFieldsKeys.forEach(fieldKey => {
    if (hasPopup) {
      const curFieldInfo = filteredPopupFieldInfos.find(item => item.fieldName === fieldKey)
      const notInPopup = !curFieldInfo
      // invisible fields can be freeze
      // const invisibleField = !curFieldInfo?.visible
      // if (notInPopup || invisibleField) popupHiddenFields.push(fieldKey)
      if (notInPopup) popupHiddenFields.push(fieldKey)
    } else {
      const curFieldInfo = filteredUseFields.find(item => (item.name || item.alias) === fieldKey)
      const notInUsed = !curFieldInfo
      if (notInUsed) popupHiddenFields.push(fieldKey)
    }
  })

  return {
    hasPopup,
    honorUsedFields: hasPopup ? filteredPopupFieldInfos : filteredUseFields,
    honorHiddenFields: popupHiddenFields
  }
}
