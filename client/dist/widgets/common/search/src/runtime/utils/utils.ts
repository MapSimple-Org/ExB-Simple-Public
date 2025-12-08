import { type DataSource, DataSourceManager, DataSourceStatus, loadArcGISJSAPIModules, type DataSourceConstructorOptions, type DataSourceJson, type ImmutableArray, type QueriableDataSource, dataSourceUtils, MessageManager, getAppStore, DataRecordSetChangeMessage, RecordSetChangeType, urlUtils, utils, Immutable, UrlManager } from 'jimu-core'
import {
  RECENT_SEARCHES_KEY, SourceType, type IMConfig, type SearchDataConfig, type SuggestionItem, type ServiceList, type SearchStatus, type DatasourceSQLList,
  SearchServiceType, type Suggestion, SearchResultView, type RecordResultType, type IMDatasourceListItem, type NewDatasourceConfigItem, type IMDatasourceCreatedStatus
} from '../../config'
import type { FeatureLayerDataSourceConstructorOptions } from 'jimu-data-source'
import { fetchGeocodeSuggestions, loadGeocodeRecords, loadGeocodeOutputRecords } from './locator-service'
import { getOutputDsJson } from 'jimu-ui/basic/runtime-components'
import { fetchLayerSuggestion, loadDsRecords, updateAllMainDsQueryParams, getOutFields } from './search-service'
import type { JimuMapView } from 'jimu-arcgis'
// only used as type
import type { IFeatureSet, ILayerDefinition } from '@esri/arcgis-rest-feature-service'
export interface SetRecentSearchOptions {
  searchText: string
  id: string
  recentSearchesMaxNumber: number
  isShowRecentSearches: boolean
}
export interface UpdateQueryParamsOption {
  serviceList: ServiceList
  searchText: string
  searchResultView: SearchResultView
  id: string
  jimuMapView: JimuMapView
  sourceType: SourceType
}

export interface LayerInFeatureCollection {
  layerDefinition: ILayerDefinition
  featureSet: IFeatureSet
}

export interface DataOptions {
  dataSourceJson: DataSourceJson
  // order of the added data.
  order: number
  // Uploaded file will be saved to it.
  restLayer?: LayerInFeatureCollection
}

interface GetSuggestionsOptionType {
  searchText: string
  serviceList: ServiceList
  config: IMConfig
  datasourceConfig?: ImmutableArray<NewDatasourceConfigItem>
  jimuMapView?: JimuMapView
}

/**
 * Get all suggestion
*/
export const getSuggestions = (option: GetSuggestionsOptionType): Promise<Suggestion[]> => {
  const { searchText, serviceList, config, datasourceConfig, jimuMapView} = option
  const suggestionPromiseList = []
  for (const configId in serviceList) {
    const serviceItem = serviceList[configId]
    serviceItem.maxSuggestions = config.maxSuggestions
    let suggestionPromise
    const extent = getMapExtentForSearchQuery(config.sourceType, serviceItem?.searchInCurrentMapExtent, jimuMapView)

    if (serviceItem.searchServiceType === SearchServiceType.FeatureService) {
      suggestionPromise = fetchLayerSuggestion(searchText, config, serviceItem, datasourceConfig, extent)
    } else {
      suggestionPromise = fetchGeocodeSuggestions(searchText, serviceItem, extent, jimuMapView)
    }
    suggestionPromiseList.push(suggestionPromise)
  }
  return Promise.all(suggestionPromiseList)
}

export const getMapExtentForSearchQuery = (sourceType: SourceType, searchInCurrentMapExtent: boolean, jimuMapView: JimuMapView): __esri.Extent => {
  let extent
  if (sourceType === SourceType.MapCentric && searchInCurrentMapExtent && jimuMapView) {
    extent = jimuMapView.view?.extent
  }
  return extent
}

/**
 * Update records of output dataSource
*/
export const updateRecordsOfOutputDs = (option: UpdateQueryParamsOption) => {
  const { serviceList, searchText, searchResultView, sourceType, jimuMapView, id } = option

  const geocodeFetchPromiseList = []
  for (const configId in serviceList) {
    const serviceItem = serviceList[configId]
    const { searchServiceType, resultMaxNumber } = serviceItem
    if (searchServiceType === SearchServiceType.GeocodeService) {
      //Update records of output dataSource
      const maxResultNumber = searchResultView === SearchResultView.ResultPanel ? resultMaxNumber : null
      const extent = getMapExtentForSearchQuery(sourceType, serviceItem?.searchInCurrentMapExtent, jimuMapView)
      const option = {
        address: searchText,
        maxResultNumber: maxResultNumber,
        geocodeItem: serviceItem,
        searchResultView: searchResultView,
        extent: extent,
        jimuMapView: jimuMapView,
        id
      }
      const loadGeocodeRecordPromise = loadGeocodeRecords(option)
      geocodeFetchPromiseList.push(loadGeocodeRecordPromise)
    }
  }
  return Promise.all(geocodeFetchPromiseList)
}

export const clearFilterOfDeletedDs = (serviceList: IMDatasourceListItem, widgetId: string, configId: string, enableFiltering: boolean) => {
  const useDataSourceId = serviceList?.useDataSource?.dataSourceId
  const localId = getLocalId(configId, widgetId)
  const useDataSource = getDatasource(useDataSourceId)
  const localDataSource = localId && getDatasource(useDataSourceId, localId)
  if (enableFiltering && useDataSource) {
    if (useDataSource) {
      (useDataSource as QueriableDataSource).updateQueryParams({}, widgetId)
    }
  } else if (!enableFiltering) {
    if (!localDataSource || !(localDataSource as QueriableDataSource)?.updateQueryParams) return
    localDataSource && (localDataSource as QueriableDataSource).updateQueryParams({}, localId)
  }
}

export const loadAllDsRecord = (serviceList: ServiceList, resultMaxNumber: number, id: string, enableFiltering = false, isPublishRecordCreateAction: boolean = false): Promise<RecordResultType[]> => {
  const suggestionPromiseList = []
  for (const configId in serviceList) {
    const serviceItem = serviceList[configId]
    let suggestionPromise
    if (serviceItem.searchServiceType === SearchServiceType.FeatureService) {
      suggestionPromise = loadDsRecords(serviceItem, resultMaxNumber, id, enableFiltering)
    } else {
      suggestionPromise = loadGeocodeOutputRecords(serviceItem, resultMaxNumber, id, isPublishRecordCreateAction)
    }
    suggestionPromiseList.push(suggestionPromise)
  }
  return Promise.all(suggestionPromiseList)
}

export function updateAllLayerServiceDsQueryParams (option: UpdateQueryParamsOption) {
  const { serviceList, searchText, id } = option
  const datasourceSqlList = {} as DatasourceSQLList
  for (const configId in serviceList) {
    const serviceItem = serviceList[configId]
    const { searchServiceType, useDataSource } = serviceItem
    if (searchServiceType === SearchServiceType.FeatureService && useDataSource?.dataSourceId) {
      const dsId = useDataSource?.dataSourceId
      let newSqlList = datasourceSqlList?.[dsId]?.sqlExpression || null
      let outFields = datasourceSqlList[dsId]?.outFields || []
      const outFieldsOfServiceItem = getOutFields(serviceItem.searchFields, serviceItem.displayFields, dsId) || []
      if (!datasourceSqlList[dsId]) {
        newSqlList = serviceItem?.SQL ? [serviceItem?.SQL as any] : null
        outFields = outFieldsOfServiceItem as any
        datasourceSqlList[dsId] = {} as any
      } else {
        serviceItem?.SQL && newSqlList.push(serviceItem?.SQL as any)
        outFields = Array.from(new Set(outFields.concat(outFieldsOfServiceItem)))
      }
      datasourceSqlList[dsId].sqlExpression = newSqlList
      datasourceSqlList[dsId].outFields = outFields
    }
  }
  updateAllMainDsQueryParams(Immutable(datasourceSqlList), id, searchText)
}

/**
 * Get datasource by datasourceId
*/
export const getDatasource = (dsId: string, localeId?: string): DataSource => {
  if (!dsId) return null
  if (!localeId) {
    const dsManager = DataSourceManager.getInstance()
    return dsManager.getDataSource(dsId)
  } else {
    const dsManager = DataSourceManager.getInstance()
    const localDsId = dsManager.getLocalDataSourceId(dsId, localeId)
    return dsManager.getDataSource(localDsId)
  }
}

/**
 * De-duplicate for object or Array
*/
export const uniqueJson = (jsonArr, key) => {
  const result = jsonArr[0] ? [jsonArr[0]] : []
  for (let i = 1; i < jsonArr.length; i++) {
    const item = jsonArr[i]
    let repeat = false
    for (let j = 0; j < result.length; j++) {
      if (item[key] === result[j][key]) {
        repeat = true
        break
      }
    }
    if (!repeat) {
      result.push(item)
    }
  }
  return result
}

/**
 * Save the current search to localStorage after the text of search input changes
*/
export const setRecentSearches = (options: SetRecentSearchOptions) => {
  const { searchText, id, recentSearchesMaxNumber, isShowRecentSearches } = options
  const appId = urlUtils.getAppIdPageIdFromUrl().appId
  const recentSearchKey = getRecentSearchesKey(appId, id)
  if (!isShowRecentSearches || !searchText) return false
  let recentSearches = getRecentSearches(id)
  if (!recentSearches.includes(searchText)) {
    recentSearches.unshift(searchText)
    recentSearches = recentSearches.splice(0, recentSearchesMaxNumber || 10)
    utils.setLocalStorage(recentSearchKey, escape(recentSearches.join('/@/')))
  }
}

/**
 * Get recent searches from localStorage
*/
export const getRecentSearches = (id: string): string[] => {
  const appId = urlUtils.getAppIdPageIdFromUrl().appId
  const recentSearchKey = getRecentSearchesKey(appId, id)
  let recentSearchInLocal = utils.readLocalStorage(recentSearchKey)
  if (recentSearchInLocal) {
    recentSearchInLocal = unescape(recentSearchInLocal)
  }
  const recentSearches = recentSearchInLocal ? recentSearchInLocal?.split('/@/') : []
  return recentSearches
}

/**
 * Delete recent suggestion by index
*/
export const deleteRecentSearches = (index: number, id: string) => {
  const appId = urlUtils.getAppIdPageIdFromUrl().appId
  const recentSearchKey = getRecentSearchesKey(appId, id)
  if (!index && index !== 0) return false
  const recentSearches = getRecentSearches(id)
  recentSearches.splice(index, 1)
  const localRecentSearches = recentSearches?.length > 0 ? escape(recentSearches.join('/@/')) : ''
  utils.setLocalStorage(recentSearchKey, localRecentSearches)
}

const getRecentSearchesKey = (appId: string, id: string) => {
  return `exb-${appId}-${id}_${RECENT_SEARCHES_KEY}`
}

/**
 * Clear all current searches
*/
export const clearRecentSearches = (id: string) => {
  const appId = urlUtils.getAppIdPageIdFromUrl().appId
  const recentSearchKey = getRecentSearchesKey(appId, id)
  utils.setLocalStorage(recentSearchKey, '')
}

/**
 * Get datasource config item form config by configId
*/
export const getDatasourceConfigItemByConfigId = (datasourceConfig, configId: string): SearchDataConfig => {
  return datasourceConfig?.filter(item => item.configId === configId)?.[0]
}

export const getJsonLength = (json): number => {
  let length = 0
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  for (const key in json) {
    length++
  }
  return length
}

/**
 * Check whether the suggestion is repeated
*/
export function checkIsSuggestionRepeat (searchSuggestion: SuggestionItem[], suggestionRecord: string): boolean {
  return searchSuggestion.filter(suggestion => {
    return suggestionRecord === suggestion?.suggestion
  }).length > 0
}

/**
 * Init suggestion list item (Bold search text)
*/
export function getSuggestionItem (suggestion: string, searchText: string): string {
  if (!searchText) return suggestion
  const searchReg = dataSourceUtils.getRegOfSearchText(searchText)
  return suggestion.match(searchReg) ? suggestion.replace(searchReg, '<strong >$1</strong>') : suggestion
}

export function escapeRegex (string) {
  return string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&')
}

/**
 * Change datasource status
*/
export function changeDsStatus (ds: QueriableDataSource, status: DataSourceStatus) {
  ds?.setStatus(status)
  ds?.setCountStatus(status)
}

/**
 * Check is datasource created
*/
export function checkIsDsCreated (dsId: string, localeId?: string): boolean {
  if (!dsId) return false
  return !!getDatasource(dsId, localeId)
}

export function getResultPopperOffset (isMultipleService: boolean): number[] {
  return isMultipleService ? [-32, 3] : [0, 3]
}

interface PublishRecordCreatedMessageActionOptions {
  widgetId: string
  recordsArr: RecordResultType[]
  recordSetChangeType?: RecordSetChangeType
  extent?: __esri.Extent
  zoomScale?: number
  Polygon?: typeof __esri.Polygon
  Graphic?: typeof __esri.Graphic
  scaleExtent?: (extent: __esri.Extent, view?: any, scale?: number) => __esri.Extent
}
/**
 * Publish message action after records update
*/
export const publishRecordCreatedMessageAction = (options: PublishRecordCreatedMessageActionOptions) => {
  const { widgetId, recordsArr, recordSetChangeType = RecordSetChangeType.CreateUpdate } = options
  const extent = options.extent as __esri.Extent | ((jimuMapView: JimuMapView) => Promise<__esri.Extent | __esri.Graphic>)
  const outputRecordResult = []
  recordsArr?.forEach(item => {
    if (item?.isGeocodeRecords) {
      const ds = getDatasource(item.dsId) as QueriableDataSource
      const fields = item?.displayFields?.map((fieldInfo) => fieldInfo.jimuName)
      const dataSourceJson = ds?.getDataSourceJson()
      const outputRecordItem = {
        records: item.records,
        fields: fields,
        dataSource: ds,
        name: ds.id,
        label: dataSourceJson?.label
      }
      outputRecordResult.push(outputRecordItem)
    }
  })
  const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(widgetId, recordSetChangeType, outputRecordResult)
  if (extent) {
    dataRecordSetChangeMessage.extent = extent
  }
  MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
}

export const getLocalId = (configId: string, widgetId: string): string => {
  return `${widgetId}_${configId}_useDataSource`
}

export async function loadEsriModulesForZoomTo () {
  return loadArcGISJSAPIModules(['esri/geometry/support/geometryUtils', 'esri/geometry/Polygon', 'esri/Graphic'])
}

//Check whether all records are loaded after update ds query params
export const checkIsAllRecordLoaded = (serviceList: ServiceList, id: string) => {
  let isAllRecordLoaded = true
  for (const configId in serviceList) {
    const serviceListItem = serviceList[configId]
    let ds
    if (serviceListItem.searchServiceType === SearchServiceType.FeatureService) {
      const dsId = serviceListItem?.useDataSource?.dataSourceId
      const localId = getLocalId(serviceListItem.configId, id)
      ds = getDatasource(dsId, localId) as QueriableDataSource
    } else {
      const dsId = serviceListItem?.outputDataSourceId
      ds = getDatasource(dsId) as QueriableDataSource
    }

    const status = ds?.getStatus()
    if (status === DataSourceStatus.Loading || status === DataSourceStatus.Unloaded) {
      isAllRecordLoaded = false
    }
  }
  return isAllRecordLoaded
}

export const checkIsAllRecordLoadedWithDsStatus = (serviceList: ServiceList, dsStatus: IMDatasourceCreatedStatus) => {
  let isAllRecordLoaded = true
  for (const configId in serviceList) {
    const status = dsStatus?.[configId]
    if (status === DataSourceStatus.Loading || status === DataSourceStatus.Unloaded) {
      isAllRecordLoaded = false
    }
  }
  return isAllRecordLoaded
}

export const checkIsAllDsCreated = (serviceList: ServiceList, id: string) => {
  let isAllDsCreated = true
  for (const configId in serviceList) {
    const serviceListItem = serviceList[configId]
    let ds
    if (serviceListItem.searchServiceType === SearchServiceType.FeatureService) {
      const dsId = serviceListItem?.useDataSource?.dataSourceId
      const localId = getLocalId(serviceListItem.configId, id)
      const isDsCreated = checkIsDsCreated(dsId, localId)
      if (!isDsCreated) {
        isAllDsCreated = false
      }
    } else {
      const dsId = serviceListItem?.outputDataSourceId
      ds = getDatasource(dsId) as QueriableDataSource
      if (!ds) {
        isAllDsCreated = false
      }
    }
  }
  return isAllDsCreated
}

export const getSearchStatusInUrl = (widgetId: string): SearchStatus => {
  if (!widgetId) return
  const state = getAppStore().getState()
  //urlHashObjectOfSearchWidget: {search_status: '{"key1":"value1", "key2":"value2"}'} or {"key1":"value1"}
  const urlHashObjectOfSearchWidget = state.asMutable({ deep: true })?.urlHashObject?.[widgetId]
  let status = {} as SearchStatus
  if (urlHashObjectOfSearchWidget?.search_status) {
    status = initSearchStatus(JSON.parse(urlHashObjectOfSearchWidget.search_status))
  } else {
    status = initSearchStatus(urlHashObjectOfSearchWidget)
  }

  //The 'serviceEnabledList' is updated to 'enabledList', the 'searchText' is updated to 'text'
  // we needs to be compatible with the old key
  if ((status as any)?.serviceEnabledList) {
    status.enabledList = (status as any).serviceEnabledList
  }
  if ((status as any)?.searchText) {
    status.text = (status as any).searchText
  }
  return status
}

function initSearchStatus(searchStatus: SearchStatus) {
  if (!searchStatus) return {}
  if (typeof searchStatus === 'string') {
    return {
      text: searchStatus
    }
  } else {
    const status = Object.keys(searchStatus).reduce((acc, key) => {
      let value
      if (key === 'text' || key === 'searchText') {
        value = searchStatus[key]
        acc[key] = value
      } else if (key === 'enabledList' || key ==='status') {
        value = typeof searchStatus[key] === 'object' ? searchStatus[key] : JSON.parse(searchStatus[key])
        acc[key] = value
      } else {
        delete acc[key]
      }
      return acc
    }, {})
    return status
  }
}

export const handleSearchWidgetUrlParamsChange = (widgetId: string, searchStatus: SearchStatus) => {
  if (!widgetId) return
  updateSearchWidgetUrlParams(widgetId, searchStatus)
}

export const handleSearchWidgetUrlParamsItemChange = (widgetId: string, key: string, value: any) => {
  if (!key || !widgetId) return
  const searchStatus = getSearchStatusInUrl(widgetId)
  const newSearchStatus = searchStatus || {} as any
  newSearchStatus[key] = value
  updateSearchWidgetUrlParams(widgetId, newSearchStatus)
}

function updateSearchWidgetUrlParams (widgetId: string, searchStatus: SearchStatus) {
  if (!widgetId) return
  let urlParams = null
  if (searchStatus) {
    UrlManager.getInstance().setWidgetUrlParams(widgetId, null)
    searchStatus = Object.keys(searchStatus).reduce((acc: SearchStatus, key) => {
      if (searchStatus[key] !== undefined && searchStatus[key] !== null && searchStatus[key] !== '') {
        const value = typeof searchStatus[key] === 'object' ? JSON.stringify(searchStatus[key]) : searchStatus[key]
        if (key === 'searchText') {
          acc.text = value
        } else if (key === 'serviceEnabledList') {
          acc.enabledList = value
        } else {
          acc[key] = value
        }
      }
      return acc
    }, {})

    if (Object.keys(searchStatus).length === 1 && searchStatus.text) {
      urlParams = {...searchStatus, search_status: null}
    } else {
      const searchStatusString = searchStatus ? JSON.stringify(searchStatus) : null
      urlParams = {
        search_status: searchStatusString,
        status: null,
        enabledList: null,
        text: null,
        //Old key
        serviceEnabledList: null,
        searchText: null,
      }
    }
  }
  UrlManager.getInstance().setWidgetUrlParams(widgetId, urlParams)
}

export async function createDsByDefaultGeocodeService (defaultGeocodeConfig: NewDatasourceConfigItem[], widgetId: string) {
  defaultGeocodeConfig = defaultGeocodeConfig?.filter(item => {
    const dsId = item?.outputDataSourceId
    const ds = getDatasource(dsId)
    return !ds
  })
  const multiDataOptions = defaultGeocodeConfig?.map((item, index) => {
    const dataSourceJson = getOutputDsJson(item, true)
    return {
      dataSourceJson: dataSourceJson,
      order: index
    } as DataOptions
  })
  return createDataSourcesByDataOptions(multiDataOptions, widgetId)
}

export async function createDataSourcesByDataOptions (multiDataOptions: DataOptions[], widgetId: string): Promise<DataSource[]> {
  if (!multiDataOptions || multiDataOptions.length === 0) {
    return Promise.resolve([])
  }

  const dataSourceConstructorOptions: DataSourceConstructorOptions[] = multiDataOptions.map(o => {
    return {
      id: o.dataSourceJson.id,
      dataSourceJson: Immutable(o.dataSourceJson)
    } as DataSourceConstructorOptions
  })

  // Capabilities of the client-side layer will be changed after load. Need to set it back.
  await Promise.allSettled(dataSourceConstructorOptions.filter((o: FeatureLayerDataSourceConstructorOptions) => o.layer).map(async (o: FeatureLayerDataSourceConstructorOptions) => {
    const capabilitiesBeforeLoad = (o.layer as __esri.FeatureLayer).sourceJSON?.capabilities
    if (capabilitiesBeforeLoad) {
      await o.layer.load()
      ;(o.layer as __esri.FeatureLayer).sourceJSON.capabilities = capabilitiesBeforeLoad
    }
  }))

  return Promise.allSettled(dataSourceConstructorOptions.map(o => DataSourceManager.getInstance().createDataSource(o).then(ds => ds.isDataSourceSet() && !ds.areChildDataSourcesCreated() ? ds.childDataSourcesReady().then(() => ds) : ds)))
    .then(res => res.filter(r => r.status === 'fulfilled').map(r => (r as unknown as PromiseFulfilledResult<DataSource>).value))
    .then(dataSources => {
      if (dataSources.length < multiDataOptions.length) {
        return Promise.reject(new Error('Failed to create some data source.'))
      }

      return dataSources
    })
}
