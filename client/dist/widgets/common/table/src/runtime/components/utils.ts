import {
  esri, privilegeUtils, ServiceManager, SessionManager, dataSourceUtils,
  type DataSource, type FeatureLayerDataSource, type UseDataSource, type ImmutableArray,
  type TimezoneAPI, Immutable, DataSourceManager, type ClauseValuePair, MutableStoreManager
} from 'jimu-core'
import type { IItem } from '@esri/arcgis-rest-portal'
import { LayerHonorModeType, type MapViewConfig, ResponsiveType, SelectionModeType, type LayersConfig, type Suggestion, AlignModeType, type TableFieldsSchema, LocationType } from '../../config'
import { getHonorWebmapUsedFields, isSupportedJimuLayerView, minusArray, type SupportedDataSource } from '../../utils'
import TableTemplate from 'esri/widgets/FeatureTable/support/TableTemplate'
import type { JimuMapView } from 'jimu-arcgis'

const dsManager = DataSourceManager.getInstance()

/**
 * Function to get suggestion list.
 * @param {string} searchText the search text
 * @param {LayersConfig} config active layer config
 * @param {DataSource} dataSource dataSource used
 * @returns {Promise<Suggestion[]>} Suggestion list
 */
export async function fetchSuggestionRecords (
  searchText: string,
  config: LayersConfig,
  dataSource: DataSource
): Promise<Suggestion[]> {
  const option = {
    searchText,
    searchFields: config?.searchFields || [],
    dataSource,
    exact: config?.searchExact
  }
  return dataSourceUtils.querySuggestions(option)
}

/**
 * Function to get timezone for api.
 * @param {any} dataSource dataSource used
 * @returns {TimezoneAPI} timezone for api
 */
export function getTimezone (dataSource): TimezoneAPI {
  return dataSourceUtils.getTimezoneAPIFromRuntime(dataSource.getTimezone())
}


export const getDsAccessibleInfo = async (url: string) => {
  if (!url) return false
  const request = esri.restRequest.request
  try {
    const info = await request(`${url}?f=json`)
    if (Object.keys(info).includes('error')) {
      return false
    } else {
      return true
    }
  } catch (err) {
    return false
  }
}

export const getIsAdvancedPermission = async (dataSource: SupportedDataSource): Promise<boolean> => {
  if (!dataSource) return false
  const layerItemInfo = await dataSource?.fetchItemInfo().then((info: IItem) => {
    return info
  }).catch(err => {
    console.error(err)
  })
  if (!layerItemInfo || !layerItemInfo.url) return false
  // user is admin/owner, or user and item are in the same update org
  // If there is no portalUrl, it means it's non-hosted (sampleServer6)
  // const portalUrl = ServiceManager.getInstance().getServerInfoByServiceUrl(layerItemInfo.url)?.owningSystemUrl
  const portalUrl = (await ServiceManager.getInstance().fetchArcGISServerInfo(layerItemInfo.url))?.owningSystemUrl
  if (!portalUrl) return false
  const sessionForItem = SessionManager.getInstance().getSessionByUrl(portalUrl)
  // If there is no session, it means there was no pop-up login
  if (!sessionForItem) return false
  const user = await sessionForItem.getUser()
  // portal:admin:updateItems: users with advanced editing privileges but without normal editing privilege
  const isAdmin = user?.role === 'org_admin'
  const isOrgItem = layerItemInfo?.isOrgItem
  const hasUpdateItems = (user?.privileges || []).includes('portal:admin:updateItems')
  const allowAdminEdit = isAdmin && isOrgItem && hasUpdateItems
  const isOwner = layerItemInfo.owner === user?.username
  const isInUpdatedGroup = await privilegeUtils.isItemInTheUpdatedGroup(layerItemInfo.id, sessionForItem)
  return allowAdminEdit || isOwner || isInUpdatedGroup
}

export const getFieldEditable = (layerDefinition, jimuName: string) => {
  const fieldsConfig = layerDefinition?.fields || []
  const orgField = fieldsConfig.find(config => config.name === jimuName)
  const fieldEditable = orgField ? orgField?.editable : true
  return fieldEditable
}

export const idsArrayEquals = (selection: ImmutableArray<string> | string[], preSelection: ImmutableArray<string> | string[]) => {
  return Array.isArray(selection) &&
    Array.isArray(preSelection) &&
    selection.length === preSelection.length &&
    selection.every((v, i) => preSelection[i] === v)
}

// https://devtopia.esri.com/WebGIS/arcgis-js-api/blob/4master/esri/intl/date.ts#L241
const dateFormatJSONMap = {
  shortDate: 'short-date',
  shortDateShortTime: 'short-date-short-time',
  shortDateShortTime24: 'short-date-short-time-24',
  shortDateLongTime: 'short-date-long-time',
  shortDateLongTime24: 'short-date-long-time-24',
  shortDateLE: 'short-date-le',
  shortDateLEShortTime: 'short-date-le-short-time',
  shortDateLEShortTime24: 'short-date-le-short-time-24',
  shortDateLELongTime: 'short-date-le-long-time',
  shortDateLELongTime24: 'short-date-le-long-time-24',
  longMonthDayYear: 'long-month-day-year',
  longMonthDayYearShortTime: 'long-month-day-year-short-time',
  longMonthDayYearShortTime24: 'long-month-day-year-short-time-24',
  longMonthDayYearLongTime: 'long-month-day-year-long-time',
  longMonthDayYearLongTime24: 'long-month-day-year-long-time-24',
  dayShortMonthYear: 'day-short-month-year',
  dayShortMonthYearShortTime: 'day-short-month-year-short-time',
  dayShortMonthYearShortTime24: 'day-short-month-year-short-time-24',
  dayShortMonthYearLongTime: 'day-short-month-year-long-time',
  dayShortMonthYearLongTime24: 'day-short-month-year-long-time-24',
  longDate: 'long-date',
  longDateShortTime: 'long-date-short-time',
  longDateShortTime24: 'long-date-short-time-24',
  longDateLongTime: 'long-date-long-time',
  longDateLongTime24: 'long-date-long-time-24',
  longMonthYear: 'long-month-year',
  shortMonthYear: 'short-month-year',
  year: 'year'
}

const camelToSnake = (str: string) => {
  return dateFormatJSONMap[str] || str
}

export const constructTableTemplate = (dataSource, curLayerConfig, usedConfig, tableShowColumns, configChange?: boolean) => {
  const allFieldsSchema = dataSource?.getSchema()
  const allFields = allFieldsSchema?.fields ? Object.values(allFieldsSchema?.fields) : []
  const layerDefinition = (dataSource as FeatureLayerDataSource)?.getLayerDefinition()
  const { columnSetting } = usedConfig || {}
  const { layerHonorMode, isFreezeFields, frozenFields, freezeLocation } = curLayerConfig
  const fieldColumnAttr = columnSetting?.responsiveType === ResponsiveType.Fit
    ? { autoWidth: true, textAlign: columnSetting?.textAlign ?? AlignModeType.Start, textWrap: columnSetting?.wrapText ?? false }
    : { autoWidth: false, width: columnSetting?.columnWidth || 200,
      textWrap: columnSetting?.wrapText ?? false, textAlign: columnSetting?.textAlign ?? AlignModeType.Start
    }
  const curColumns = tableShowColumns ? tableShowColumns.map(col => { return { jimuName: col.value } }) : curLayerConfig.tableFields.filter(item => item.visible)
  const invisibleColumns = minusArray(allFields, curColumns).map(item => {
    return item.jimuName
  })
  // sort fields
  const queryParams = dataSource?.getCurrentQueryParams()
  const sortFieldsArray = queryParams?.orderByFields || []
  const sortFields = {}
  sortFieldsArray.forEach((item, index) => {
    const fieldSort = item.split(' ')
    sortFields[fieldSort[0]] = { direction: fieldSort[1]?.toLowerCase(), initialSortPriority: index }
  })
  // For dataview, need to merge its sorting information into default
  let tableTemplate: __esri.TableTemplate
  const isHonorWebmap = layerHonorMode === LayerHonorModeType.Webmap
  const newColumnTemplates = []
  let freezeColumnTemplate
  if (isHonorWebmap) {
    const { hasPopup, honorUsedFields } = getHonorWebmapUsedFields(dataSource)
    if (hasPopup) {
      honorUsedFields.forEach(item => {
        const itemKey = item.fieldName
        const isFrozen = isFreezeFields && frozenFields?.includes(itemKey)
        const freezeBegin = !freezeLocation || freezeLocation === LocationType.Beginning
        const columnTemplate = {
          ...item,
          ...fieldColumnAttr,
          type: 'field',
          editable: item.isEditable ?? false,
          format: item.format
            ? {
              ...item.format,
              ...(item.format?.dateFormat ? { dateFormat: camelToSnake(item.format.dateFormat) } : {})
            }
            : null,
          ...(sortFields[itemKey] ? sortFields[itemKey] : {}),
          ...(isFrozen ? (freezeBegin ? { frozen: true } : { frozenToEnd: true }) : {})
        }
        if (isFrozen) {
          freezeColumnTemplate = columnTemplate
        } else {
          newColumnTemplates.push(columnTemplate)
        }
      })
      if (freezeColumnTemplate) {
        const freezeColIsBeginning = !freezeLocation || freezeLocation === LocationType.Beginning
        freezeColIsBeginning ? newColumnTemplates.unshift(freezeColumnTemplate) : newColumnTemplates.push(freezeColumnTemplate)
      }
    } else {
      honorUsedFields.forEach(item => {
        const itemKey = item.jimuName || item.name
        const isFrozen = isFreezeFields && frozenFields?.includes(itemKey)
        const freezeBegin = !freezeLocation || freezeLocation === LocationType.Beginning
        const columnTemplate = {
          ...item,
          ...fieldColumnAttr,
          type: 'field',
          fieldName: itemKey,
          label: item.alias || item.name,
          editable: getFieldEditable(layerDefinition, itemKey),
          visible: true,
          format: item.format
            ? {
              ...item.format,
              ...(item.format?.dateFormat ? { dateFormat: camelToSnake(item.format.dateFormat) } : {})
            }
            : null,
          ...(sortFields[itemKey] ? sortFields[itemKey] : {}),
          ...(isFrozen ? (freezeBegin ? { frozen: true } : { frozenToEnd: true }) : {})
        }
        if (isFrozen) {
          freezeColumnTemplate = columnTemplate
        } else {
          newColumnTemplates.push(columnTemplate)
        }
      })
      if (freezeColumnTemplate) {
        const freezeColIsBeginning = !freezeLocation || freezeLocation === LocationType.Beginning
        freezeColIsBeginning ? newColumnTemplates.unshift(freezeColumnTemplate) : newColumnTemplates.push(freezeColumnTemplate)
      }
    }
    tableTemplate = new TableTemplate({
      columnTemplates: newColumnTemplates
    })
  } else if (!isHonorWebmap) {
    curLayerConfig.tableFields.forEach(item => {
      const itemKey = item.jimuName || item.name
      const newItem = allFieldsSchema?.fields?.[itemKey]
      const isFrozen = isFreezeFields && frozenFields?.includes(itemKey)
      const freezeBegin = !freezeLocation || freezeLocation === LocationType.Beginning
      const columnTemplate = {
        format: newItem?.format
          ? {
            ...item.format,
            ...(item.format?.dateFormat ? { dateFormat: camelToSnake(item.format.dateFormat) } : {})
          }
          : null,
        type: 'field',
        ...fieldColumnAttr,
        fieldName: itemKey,
        label: newItem?.alias,
        editable: getFieldEditable(layerDefinition, itemKey) && item?.editAuthority,
        visible: configChange ? item.visible : invisibleColumns.indexOf(itemKey) < 0,
        ...(sortFields[itemKey] ? sortFields[itemKey] : {}),
        ...(isFrozen ? (freezeBegin ? { frozen: true } : { frozenToEnd: true }) : {})
      }
      if (isFrozen) {
        freezeColumnTemplate = columnTemplate
      } else {
        newColumnTemplates.push(columnTemplate)
      }
    })
    if (freezeColumnTemplate) {
      const freezeColIsBeginning = !freezeLocation || freezeLocation === LocationType.Beginning
      freezeColIsBeginning ? newColumnTemplates.unshift(freezeColumnTemplate) : newColumnTemplates.push(freezeColumnTemplate)
    }
    tableTemplate = new TableTemplate({
      columnTemplates: newColumnTemplates
    })
  }
  return tableTemplate
}

/**
 * Function to construct layer config from dataSource.
 * @param {DataSource} currentDs used dataSource
 * @param {boolean} isMapMode table widget is map mode
 * @param {(dsId: string) => string} getNewConfigId method to get config id in layer mode
 * @returns {LayersConfig} layer config
 */
export const constructConfig = (currentDs: DataSource, isMapMode?: boolean,
  getNewConfigId?: (dsId: string) => string, parentViewId?: string
): LayersConfig => {
  const allFields = currentDs.getSchema()
  const layerDefinition = (currentDs as FeatureLayerDataSource)?.getLayerDefinition()
  const allFieldsDetails = allFields?.fields ? Object.values(allFields?.fields) : []
  const fieldsConfig = layerDefinition?.fields || []
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
  const useDataSource = {
    dataSourceId: currentDs.id,
    mainDataSourceId: currentDs.getMainDataSource()?.id,
    dataViewId: currentDs.dataViewId,
    rootDataSourceId: currentDs.getRootDataSource()?.id
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
    layerHonorMode: LayerHonorModeType.Webmap,
    parentViewId
  }
  return layerItem
}

export const getAllMapLayersConfig = async (mapViewConfig: MapViewConfig, jimuMapView: JimuMapView, widgetId: string) => {
  if (!jimuMapView) return []
  const mapLayersConfig = []
  // ensure we can get jimuTables
  await jimuMapView.whenJimuMapViewLoaded()
  const jimuLayerViews = jimuMapView.getAllJimuLayerViews()
  const jimuTables = jimuMapView.getJimuTables()
  const { layersConfig = [], customJimuLayerViewIds = [], customizeLayers, displayRuntimeLayers = true } = mapViewConfig || {}
  // layerViewId is like 'widget_8-dataSource_1-18cae7226c6-layer-6'
  // layerConfig id is like 'dataSource_1-18cae7226c6-layer-6'
  const runtimeTableObj = {}
  for (const jimuLayerView of jimuLayerViews) {
    const layerViewId = jimuLayerView.id
    const layerInvalid = !isSupportedJimuLayerView(jimuLayerView)
    if (layerInvalid) continue
    const { layerDataSourceId } = jimuLayerView
    // sync: Use layer's visible; not sync: Judging by the whitelist
    const isFromRunTime = jimuLayerView?.fromRuntime
    const isLayerVisible = jimuLayerView.isLayerVisible()
    const needToShowInRuntime = displayRuntimeLayers && isFromRunTime && isLayerVisible
    // save runtime layer config to runtimeTableObj
    if (needToShowInRuntime) {
      let layerDs = jimuLayerView?.getLayerDataSource() || dsManager.getDataSource(layerDataSourceId)
      if (!layerDs) {
        try {
          layerDs = await jimuLayerView.createLayerDataSource()
        } catch (error) {
          continue
        }
      }
      // imagery layer with no field information
      const allFieldsSchema = layerDs?.getSchema()
      if (!layerDs || !allFieldsSchema?.fields) continue
      const newRuntimeLayerConfigItem = constructConfig(layerDs, true, undefined, jimuLayerView.jimuMapViewId)
      runtimeTableObj[newRuntimeLayerConfigItem.id] = newRuntimeLayerConfigItem
      continue
    }
    const shouldShow = customizeLayers ? customJimuLayerViewIds.includes(layerViewId) : isLayerVisible
    if (!shouldShow) continue
    const prefixIndex = layerViewId.indexOf('-')
    const layerViewConfigId = layerViewId.substring(prefixIndex + 1)
    const haveLayerConfig = layersConfig.find(item => item.id === layerViewConfigId)
    // When the setting config is available, use the runtime field information and other config.
    // When there is no setting config, use the ds of runtime to create a new config directly.
    let layerDs = jimuLayerView?.getLayerDataSource() || dsManager.getDataSource(layerDataSourceId)
    if (!layerDs) {
      try {
        layerDs = await jimuLayerView.createLayerDataSource()
      } catch (error) {
        continue
      }
    }
    // imagery layer with no field information
    const allFieldsSchema = layerDs?.getSchema()
    if (!layerDs || !allFieldsSchema?.fields) continue
    // const isShowOrAddToMap = layerViewId.includes(SHOW_ON_MAP_DATA_ID_PREFIX) || layerViewId.includes(ADD_TO_MAP_DATA_ID_PREFIX)
    const newLayerConfigItem = constructConfig(layerDs, true, undefined, jimuLayerView.jimuMapViewId)
    if (haveLayerConfig) {
      // If the information related to ds changes, the latest config is used.
      const diffArray = minusArray(newLayerConfigItem.allFields, haveLayerConfig.allFields)
      if (diffArray.length !== 0) {
        const newLayerConfig = {
          ...haveLayerConfig,
          name: newLayerConfigItem.name,
          useDataSource: newLayerConfigItem.useDataSource,
          allFields: newLayerConfigItem.allFields,
          tableFields: newLayerConfigItem.tableFields
        }
        mapLayersConfig.push(newLayerConfig)
      } else {
        mapLayersConfig.push(haveLayerConfig)
      }
    } else {
      // no 'haveLayerConfig', indicate it’s a new config from runtime
      mapLayersConfig.push(newLayerConfigItem)
    }
  }
  MutableStoreManager.getInstance().updateStateValue(widgetId, 'runtimeTableObj', runtimeTableObj)
  // jimu tables
  for (const jimuTable of jimuTables) {
    const oriTable = jimuTable.table
    const tableLayerId = jimuTable.jimuTableId
    const { visible: originalLayerVisible } = oriTable
    const layerDataSourceId = jimuMapView.getDataSourceIdByAPILayer(oriTable)
    // sync: Use layer's visible; not sync: Judging by the whitelist
    const shouldShow = customizeLayers ? customJimuLayerViewIds.includes(tableLayerId) : originalLayerVisible
    if (!shouldShow) continue
    const prefixIndex = tableLayerId.indexOf('-')
    const tableLayerConfigId = tableLayerId.substring(prefixIndex + 1)
    const haveLayerConfig = layersConfig.find(item => item.id === tableLayerConfigId)
    const tableDs = dsManager.getDataSource(layerDataSourceId)
    const mapDs = jimuMapView.getMapDataSource()
    let layerDs = tableDs
    if (!tableDs && mapDs) {
      try {
        layerDs = await mapDs.createDataSourceByLayer(oriTable)
      } catch (error) {
        continue
      }
    }
    if (!layerDs) continue
    const newLayerConfigItem = constructConfig(layerDs, true)
    if (haveLayerConfig) {
      // If the information related to ds changes, the latest config is used.
      const diffArray = minusArray(newLayerConfigItem.allFields, haveLayerConfig.allFields)
      if (diffArray.length !== 0) {
        const newLayerConfig = {
          ...haveLayerConfig,
          name: newLayerConfigItem.name,
          useDataSource: newLayerConfigItem.useDataSource,
          allFields: newLayerConfigItem.allFields,
          tableFields: newLayerConfigItem.tableFields
        }
        mapLayersConfig.push(newLayerConfig)
      } else {
        mapLayersConfig.push(haveLayerConfig)
      }
    } else {
      // no 'haveLayerConfig', indicate it’s a new config from runtime
      mapLayersConfig.push(newLayerConfigItem)
    }
  }
  // sort layers by setting order
  if (layersConfig?.length > 0) {
    const layerIds = layersConfig.map(item => item.id)
    mapLayersConfig.sort((a, b) => {
      const aIndex = layerIds.indexOf(a.id)
      const bIndex = layerIds.indexOf(b.id)
      return aIndex - bIndex
    })
  }
  return mapLayersConfig
}

export const getTableColumnsFields = (usedColumns: any[], tableFields?: TableFieldsSchema[]): { columnsAllFields: ClauseValuePair[], columnsVisibleFields: ClauseValuePair[] } => {
  const columnsAllFields: ClauseValuePair[] = []
  const columnsVisibleFields: ClauseValuePair[] = []
  usedColumns?.forEach(item => {
    const columnValue = item.name || item.fieldName
    const columnLabel = item.effectiveLabel || item.alias || item.fieldName
    columnsAllFields.push({
      value: columnValue,
      label: columnLabel
    })
    const tableField = tableFields?.find(field => field.jimuName === columnValue || field.name === columnValue)
    const isVisible = tableField ? tableField.visible : !item.hidden
    if (isVisible) {
      columnsVisibleFields.push({
        value: columnValue,
        label: columnLabel
      })
    }
  })
  return { columnsAllFields, columnsVisibleFields }
}
