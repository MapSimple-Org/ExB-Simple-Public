import {
  type QueriableDataSource, type DataSource, dataSourceUtils, DataSourceManager, Immutable, type QueryParams, type FeatureLayerDataSource,
  DataSourceStatus, type FieldSchema, type SqlExpression, type ImmutableArray, ClauseLogic
} from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import type { IMConfig, Suggestion, IMSearchDataConfig, DatasourceListItem, RecordResultType, NewDatasourceConfigItem, IMDatasourceSQLList } from '../../config'
import { getDatasource, checkIsDsCreated, getLocalId } from './utils'
import { SourceType } from '../../config'

export interface QueryOption {
  returnGeometry?: boolean
  geometry?: any
  sortField?: string
  sortOrder?: string
  orderByFields?: string | string[]
  resultOffset?: number
  resultRecordCount?: number
  pageSize?: number
  page?: number
  where?: string
}

export async function fetchLayerSuggestion (
  searchText: string,
  config: IMConfig,
  serviceListItem: DatasourceListItem,
  datasourceConfig?: ImmutableArray<NewDatasourceConfigItem>,
  extent?: __esri.Extent
): Promise<Suggestion> {
  if (!checkIsDsCreated(serviceListItem?.useDataSource?.dataSourceId)) {
    return Promise.resolve({} as Suggestion)
  }
  const searchFields = serviceListItem?.searchFields || []
  const datasourceConfigItem = datasourceConfig?.filter(item => item?.configId === serviceListItem.configId)?.[0]
  return fetchSuggestionRecords(searchText, serviceListItem, datasourceConfigItem, searchFields, config?.maxSuggestions, extent)
}

/**
 * Query suggestion
*/
export async function fetchSuggestionRecords (
  searchText: string,
  datasourceListItem: DatasourceListItem,
  dsConfigItem: IMSearchDataConfig,
  searchFields: FieldSchema[],
  maxSuggestions: number,
  extent?: __esri.Extent
): Promise<Suggestion> {
  const { label, icon, configId } = dsConfigItem
  const useDatasourceId = datasourceListItem?.useDataSource?.dataSourceId
  const datasource = getDatasource(useDatasourceId)

  const option = {
    searchText,
    searchFields: searchFields.map(schema => schema.name),
    dataSource: datasource,
    maxSuggestions,
    extent
  }
  return dataSourceUtils.querySuggestions(option).then(suggest => {
    const searchSuggestion = suggest?.map(item => {
      return {
        ...item,
        configId: configId,
        isFromSuggestion: true
      }
    })
    const suggestion: Suggestion = {
      suggestionItem: searchSuggestion,
      layer: label,
      icon: icon
    }
    return Promise.resolve(suggestion)
  }).catch((error) => {
    return Promise.resolve({
      suggestionItem: [],
      layer: null,
      icon: null
    })
  })
}

/**
 * Get query SQL
*/
export function getSQL (
  searchText: string,
  searchFields: FieldSchema[],
  datasource: DataSource,
  searchExact: boolean
): SqlExpression {
  const searchFieldNames = searchFields.map(fieldSchema => fieldSchema.jimuName)
  return dataSourceUtils.getSQL(searchText, searchFieldNames, datasource, searchExact)
}

/**
 * Update datasource params
*/
export function updateDsQueryParams (serviceListItem: DatasourceListItem, id: string, searchText: string) {
  const useDataSourceId = serviceListItem?.useDataSource?.dataSourceId
  const useDataSource = getDatasource(useDataSourceId)
  const SQL = serviceListItem?.SQL
  const where = !searchText ? '1=1' : (SQL?.sql || '1=0')
  const sqlExpression = !searchText ? null : (SQL?.sql ? SQL : null)
  const outFields = getOutFields(serviceListItem.searchFields, serviceListItem.displayFields, useDataSourceId)
  const query: any = Immutable({
    outFields: outFields,
    where,
    sqlExpression,
    returnGeometry: true
  })

  //Update datasource query params
  useDataSource && (useDataSource as QueriableDataSource).updateQueryParams(query, id)
}

/**
 * Update main datasource params
 * If a `datasource` is added multiple times in the same search widget, the `SQL` between them needs to bespliced width `OR`
*/
export function updateAllMainDsQueryParams (datasourceSQLList: IMDatasourceSQLList, id: string, searchText: string) {
  for (const dsId in datasourceSQLList?.asMutable({ deep: true })) {
    const sqlItem = datasourceSQLList?.[dsId]?.sqlExpression
    const outputFields = datasourceSQLList?.[dsId]?.outFields
    const useDataSource = getDatasource(dsId)
    let where
    let sqlExpression
    if (!searchText) {
      where = '1=1'
      sqlExpression = null
    } else {
      if (!sqlItem) {
        where = '1=0'
        sqlExpression = null
      } else {
        sqlExpression = dataSourceUtils.getMergedSQLExpressions(sqlItem?.asMutable({ deep: true }), useDataSource, ClauseLogic.Or)
        where = sqlExpression.sql
      }
    }
    const query: any = Immutable({
      outFields: outputFields,
      where,
      sqlExpression,
      returnGeometry: true
    })
    //Update datasource query params
    useDataSource && (useDataSource as QueriableDataSource).updateQueryParams(query, id)
  }
}

export function getOutFields (searchFields: FieldSchema[], displayFields: FieldSchema[], dsId: string): string[] | string {
  const searchFieldsNames = searchFields?.map(fieldSchema => fieldSchema.jimuName) || []
  const displayFieldsNames = displayFields?.map(fieldSchema => fieldSchema.jimuName) || []
  const useDataSource = getDatasource(dsId)
  const allUsedFields = useDataSource?.getAllUsedFields() || []
  if (allUsedFields === '*') {
    return '*'
  } else {
    return Array.from(new Set(searchFieldsNames.concat(displayFieldsNames).concat(allUsedFields)))
  }
}

interface GetQueryOptions {
  serviceListItem: DatasourceListItem
  searchTextForConfirmSearch: string
  jimuMapView?: JimuMapView
  sourceType?: SourceType
  searchInCurrentMapExtent?: boolean
  enableFiltering?: boolean
}
export function getQueryByServiceListItem (options: GetQueryOptions): QueryParams {
  const { serviceListItem, searchTextForConfirmSearch, jimuMapView, sourceType, searchInCurrentMapExtent, enableFiltering } = options
  const { useDataSource } = serviceListItem
  const clearFilter = !searchTextForConfirmSearch && enableFiltering
  const SQL = serviceListItem?.SQL
  const where = clearFilter ? '1=1' : (SQL?.sql || '1=0')
  const sqlExpression = clearFilter ? null : (SQL?.sql ? SQL : null)
  const outFields = getOutFields(serviceListItem.searchFields, serviceListItem.displayFields, useDataSource?.dataSourceId)
  let query: any = Immutable({
    outFields: outFields,
    where,
    sqlExpression,
    returnGeometry: true
  })

  if (sourceType === SourceType.MapCentric && searchInCurrentMapExtent) {
    const extent = jimuMapView?.view.extent
    const tempGeometry = extent ? extent.toJSON() : {}
    query = query.set('geometry', tempGeometry)
  }
  return query
}

/**
 * Load records by outputDatasources
*/
export const loadDsRecords = (serviceListItem: DatasourceListItem, resultMaxNumber: number, id: string, enableFiltering = false): Promise<RecordResultType> => {
  const dsId = serviceListItem?.useDataSource?.dataSourceId
  const localId = getLocalId(serviceListItem.configId, id)
  if (!checkIsDsCreated(dsId, localId)) return Promise.resolve({} as RecordResultType)
  const dataSource = getDatasource(dsId, localId) as QueriableDataSource
  const dsManager = DataSourceManager.getInstance()
  const localDsId = localId ? dsManager.getLocalDataSourceId(dsId, localId): null
  const records = dataSource?.getRecordsByPage && dataSource?.getRecordsByPage(1, resultMaxNumber)
  return Promise.resolve({
    records: records,
    configId: serviceListItem.configId,
    dsId: dsId,
    localDsId: localDsId,
    layerDsIdActuallyUsed: localDsId,
    isGeocodeRecords: false
  })
}

export async function executeCountQuery (
  widgetId: string,
  outputDS: FeatureLayerDataSource,
  queryParams: QueryParams
): Promise<number> {
  outputDS.setCountStatus(DataSourceStatus.Unloaded)
  return outputDS.loadCount(queryParams, { widgetId, refresh: true })
}

export function initOutputDatasource (datasourceConfig) {
  datasourceConfig?.forEach(datasourceConfigItem => {
    const outputDs = datasourceConfigItem?.outputDataSourceId
    const outputDatasource = getDatasource(outputDs)
    outputDatasource && outputDatasource.setCountStatus(DataSourceStatus.Loaded)
  })
}
