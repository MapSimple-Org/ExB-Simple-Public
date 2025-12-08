/** @jsx jsx */
import { React, css, jsx, type AllWidgetProps, Immutable, type DataSourceStatus, type ImmutableArray, type UseUtility, UtilityManager, ViewVisibilityContext, type ViewVisibilityContextProps, hooks, defaultMessages as jimUiDefaultMessage, PageVisibilityContext } from 'jimu-core'
import { getMultipleDefaultGeocodeConfigInRuntime } from 'jimu-ui/basic/runtime-components'
import { type IMConfig, type SearchDataConfig, ArrangementStyle, type NewDatasourceConfigItem, type IMServiceList, type IMSearchResult, SearchServiceType, type IMSearchDataConfig, type IMSelectionList, type IMDatasourceCreatedStatus } from '../config'
import { Paper } from 'jimu-ui'
import SearchSetting from './component/search-setting'
import SearchInput from './component/search'
import CreateDatasource from './component/create-datasource'
import { versionManager } from '../version-manager'
import { getSearchStatusInUrl, createDsByDefaultGeocodeService } from './utils/utils'
import { getActiveDataSourceConfig } from '../utils/utils'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { SourceType, DEFAULT_GEOCODE_KEY } from '../config'
const { useEffect, useState, useRef } = React
type SearchProps = AllWidgetProps<IMConfig>

const STYLE = css`
  & {
    height: 32px;
    margin-top: 0;
    margin-left: 0;
  }
  &.search-con-in-controller {
    width: 300px !important;
  }
  &.search-con-Style3 {
    border-bottom: 1px solid var(--sys-color-divider-secondary);
  }
`

const Widget = (props: SearchProps) => {
  const configRef = useRef(null as IMConfig)
  const jimuMapViewRef = useRef(null as JimuMapView)
  const defaultGeocodeConfigRef = useRef(null as NewDatasourceConfigItem[])
  const { config, id, useDataSources, useMapWidgetIds } = props
  const { resultMaxNumber } = config
  const searchConRef = useRef<HTMLDivElement>(null)
  const selectionListRef = useRef<IMSelectionList>(Immutable({}) as IMSelectionList)
  const jimuMapViewChangedRef= useRef(false)
  const dsStatusRef = useRef(Immutable({}) as IMDatasourceCreatedStatus)

  const nls = hooks.useTranslation(jimUiDefaultMessage)

  const [dataSourceConfig, setDataSourceConfig] = useState(Immutable([]) as ImmutableArray<NewDatasourceConfigItem>)
  const [isShowSearchInput, setIsShowSearchInput] = useState(false)
  const [serviceList, setServiceList] = useState(null as IMServiceList)
  const [searchResult, setSearchResult] = useState(Immutable({}) as IMSearchResult)
  const [selectionList, setSelectionList] = useState(Immutable({}) as IMSelectionList)
  const [dsStatus, setDsStatus] = useState(Immutable({}) as IMDatasourceCreatedStatus)
  const [jimuMapView, setJimuMapView] = useState(null as JimuMapView)
  const [defaultGeocodeConfig, setDefaultGeocodeConfig] = useState(null as NewDatasourceConfigItem[])
  const [showLoading, setShowLoading] = useState(false)
  const [searchTextForConfirmSearch, setSearchTextForConfirmSearch] = useState(null)

  useEffect(() => {
    const hasUseMap = useMapWidgetIds && useMapWidgetIds?.length > 0
    if (config?.sourceType !== SourceType.MapCentric) {
      setJimuMapView(null)
      jimuMapViewRef.current = null
    }

    if (config?.sourceType === SourceType.MapCentric && hasUseMap) {
      setShowLoading(true)
    }
    if (config?.sourceType === SourceType.MapCentric && jimuMapViewRef.current) {
      if (hasUseMap) {
        initDSConfigWithMapCentric(config, jimuMapViewRef.current)
      } else {
        setDataSourceConfig(Immutable([]))
        setServiceList(null as IMServiceList)
        setShowLoading(false)
      }
    } else {
      !hasUseMap && setShowLoading(false)
      initDatasourceConfig(config?.datasourceConfig)
    }

    configRef.current = config
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, jimuMapView, useMapWidgetIds])

  const getDefaultGeocodeDataConfig = async (customKeys?: string) => {
    if (defaultGeocodeConfigRef.current) {
      return Promise.resolve(defaultGeocodeConfig)
    } else {
      const option = {
        nls: nls,
        id,
        createOutputDs: true,
        viewId: `${DEFAULT_GEOCODE_KEY}_custom`,
        isSingle: false,
        notAddNewUtility: true
      }
      return getMultipleDefaultGeocodeConfigInRuntime(option).then(res => {
        setDefaultGeocodeConfig(res as any)
        defaultGeocodeConfigRef.current = res as any
        return Promise.resolve(res)
      }, err => {
        return Promise.resolve([])
      })
    }
  }

  const initDSConfigWithMapCentric = async (config: IMConfig, jimuMapView: JimuMapView) => {
    setShowLoading(true)
    const viewId = jimuMapView?.id
    const dataSourceConfigWithMapCentricChanged = config?.dataSourceConfigWithMapCentric !== configRef.current?.dataSourceConfigWithMapCentric || config?.allowSearchSourceSelection !== configRef.current?.allowSearchSourceSelection
    let defaultGeocodeDataConfigs = []
    const dataSourceConfigItemWithMapCentric = config?.dataSourceConfigWithMapCentric?.[viewId]
    if (dataSourceConfigItemWithMapCentric?.synchronizeSettings as any !== false) {
      defaultGeocodeDataConfigs = await getDefaultGeocodeDataConfig()
      await createDsByDefaultGeocodeService(defaultGeocodeDataConfigs, id)
    }
    getActiveDataSourceConfig(jimuMapView, config, defaultGeocodeDataConfigs).then(async newDataSourceConfig => {
      if (jimuMapViewChangedRef.current || dataSourceConfigWithMapCentricChanged) {
        await initDatasourceConfig(newDataSourceConfig)
        jimuMapViewChangedRef.current = false
      }
      setShowLoading(false)
    }, err => {
      setShowLoading(false)
    })
  }

  const onDatasourceConfigChange = (newDatasourceConfig: ImmutableArray<NewDatasourceConfigItem>) => {
    newDatasourceConfig && setDataSourceConfig(newDatasourceConfig)
    initServiceList(newDatasourceConfig)
  }

  const initDatasourceConfig = async (dataSourceConfig: ImmutableArray<SearchDataConfig>) => {
    const dsConfig = dataSourceConfig || Immutable([]) as ImmutableArray<SearchDataConfig>
    const newDsPromise = dsConfig.map(async configItem => {
      const enable = config?.allowSearchSourceSelection as any === false ? true : getDsConfigItemEnableStatus(configItem)
      let newConfigItem = configItem?.setIn(['enable'], enable)
      if (configItem?.useUtility) {
        await getGeocodeUrl(configItem).then(geocodeUrl => {
          newConfigItem = newConfigItem.setIn(['geocodeURL'], geocodeUrl)
        })
      }
      return Promise.resolve(newConfigItem?.asMutable({ deep: true }))
    })
    await Promise.all(newDsPromise).then(newDsConfig => {
      setDataSourceConfig(Immutable(newDsConfig as NewDatasourceConfigItem[]))
      initServiceList(Immutable(newDsConfig as NewDatasourceConfigItem[]))
    })
  }

  const getGeocodeUrl = async (dataSourceConfigItem: IMSearchDataConfig) => {
    if (dataSourceConfigItem?.useUtility?.utilityId) {
      return getUrlOfUseUtility(dataSourceConfigItem?.useUtility)
    } else if ((dataSourceConfigItem as any)?.geocodeURL) {
      return Promise.resolve((dataSourceConfigItem as any)?.geocodeURL)
    }
  }

  const getDsConfigItemEnableStatus = (configItem: IMSearchDataConfig) => {
    if (!dataSourceConfig || dataSourceConfig?.length === 0) {
      const searchStatus = getSearchStatusInUrl(id)
      const activeServiceConfigIdList = searchStatus?.enabledList
      if (activeServiceConfigIdList) {
        return activeServiceConfigIdList.includes(configItem?.configId)
      } else {
        return true
      }
    } else {
      let enable = true
      dataSourceConfig?.forEach(preItem => {
        if (configItem?.configId === preItem?.configId) {
          enable = !!preItem?.enable
        }
      })
      return enable
    }
  }

  const getUrlOfUseUtility = async (useUtility: UseUtility): Promise<string> => {
    return UtilityManager.getInstance().getUrlOfUseUtility(useUtility)
      .then((url) => {
        return Promise.resolve(url)
      })
  }

  const handleServiceListChange = (serviceList: IMServiceList) => {
    setServiceList(serviceList)
  }

  const handleSearchTextForConfirmSearchChange = (searchText: string) => {
    setSearchTextForConfirmSearch(searchText)
  }

  const checkIsShowSearchInput = () => {
    if (config?.arrangementStyle === ArrangementStyle.Style1 || config?.arrangementStyle === ArrangementStyle.Style2 || config?.arrangementStyle === ArrangementStyle.Style3) {
      return true
    } else {
      return isShowSearchInput
    }
  }

  const onShowSearchInputChange = (isShow: boolean) => {
    setIsShowSearchInput(isShow)
  }

  const initServiceList = (newDatasourceConfig: ImmutableArray<NewDatasourceConfigItem>) => {
    let newServiceList = Immutable({})
    newDatasourceConfig?.asMutable({ deep: true })?.forEach(configItem => {
      if (!configItem?.enable) return false
      const { configId } = configItem
      let newDatasourceListItem
      if (configItem?.searchServiceType === SearchServiceType.GeocodeService) {
        newDatasourceListItem = initGeocodeList(configItem)
      } else {
        newDatasourceListItem = initDatasourceList(configItem)
      }
      newServiceList = newServiceList.setIn([configId], newDatasourceListItem)
    })
    setServiceList(newServiceList as IMServiceList)
  }

  /**
   * Init dataSource list by enable config item
  */
  const initDatasourceList = hooks.useEventCallback((configItem: NewDatasourceConfigItem) => {
    if (!configItem?.enable || configItem?.searchServiceType === SearchServiceType.GeocodeService) return false
    const { configId, useDataSource, displayFields, searchFields, searchExact, hint, searchServiceType, searchInCurrentMapExtent } = configItem
    const dataSourceListItem = serviceList?.[configId]?.asMutable({ deep: true }) || {}
    const updateItem = {
      useDataSource: useDataSource,
      displayFields: displayFields,
      searchFields: searchFields,
      searchExact: searchExact,
      resultMaxNumber: resultMaxNumber,
      hint: hint,
      searchServiceType: searchServiceType,
      configId: configId,
      searchInCurrentMapExtent: searchInCurrentMapExtent
    }
    const newDatasourceListItem = Object.assign(dataSourceListItem, updateItem)
    return newDatasourceListItem
  })

  /**
   * Init geocode list by enable config item
  */
  const initGeocodeList = (configItem: NewDatasourceConfigItem) => {
    if (!configItem?.enable || configItem?.searchServiceType === SearchServiceType.FeatureService) return false
    const { countryCode, configId, hint, zoomScale, geocodeURL, outputDataSourceId, label, searchInCurrentMapExtent, enableLocalSearch, minScale, searchServiceType, spatialReference, singleLineFieldName, displayFields, defaultAddressFieldName, addressFields, isSupportSuggest, useUtility } = configItem
    const dataSourceListItem = serviceList?.[configId]?.asMutable({ deep: true }) || {}
    const updateItem = {
      hint: hint,
      geocodeURL: geocodeURL,
      outputDataSourceId: outputDataSourceId,
      icon: configItem?.icon,
      resultMaxNumber: resultMaxNumber,
      label: label,
      searchServiceType: searchServiceType,
      configId: configId,
      singleLineFieldName: singleLineFieldName || '',
      displayFields: displayFields,
      defaultAddressFieldName: defaultAddressFieldName,
      addressFields: addressFields || [],
      isSupportSuggest: isSupportSuggest,
      useUtility: useUtility,
      spatialReference: spatialReference,
      countryCode: countryCode,
      searchInCurrentMapExtent: searchInCurrentMapExtent,
      enableLocalSearch: enableLocalSearch,
      minScale: minScale,
      zoomScale: zoomScale,
    }
    const newDatasourceListItem = Object.assign(dataSourceListItem, updateItem)
    return newDatasourceListItem
  }

  const handleSearchResultChange = React.useCallback((configId: string, newRecords: string[]) => {
    const preRecords = searchResult?.[configId] || []
    if (preRecords.join(',') !== (newRecords || [])?.join(',')) {
      const newSearchResult = searchResult.set(configId, newRecords)
      setSearchResult(Immutable(newSearchResult))
    }
  }, [searchResult])

  const clearSearchResult = React.useCallback(() => {
    setSearchResult(Immutable({}) as IMSearchResult)
  }, [])

  const handleSelectionListChange = hooks.useEventCallback((selection: ImmutableArray<string>, configId: string) => {
    const newSelectionList = selectionListRef.current.setIn([configId], selection)
    setSelectionList(newSelectionList)
    selectionListRef.current = newSelectionList
  })

  const handleDsStatusChange = (configId: string, status: DataSourceStatus) => {
    const newDsStatus = dsStatusRef.current.set(configId, status)
    setDsStatus(newDsStatus)
    dsStatusRef.current = newDsStatus
  }

  const handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    jimuMapViewChangedRef.current = jimuMapViewRef.current?.id !== jimuMapView?.id
    jimuMapViewRef.current = jimuMapView
    setJimuMapView(jimuMapView)
  }

  // Render map content
  const renderMapContent = () => {
    return (
      <JimuMapViewComponent
        useMapWidgetId={useMapWidgetIds?.[0]}
        onActiveViewChange={handleActiveViewChange}
      />
    )
  }

  const checkIsShowSearchSetting = hooks.useEventCallback((showLoading, dataSourceConfig, allowSearchSourceSelection: boolean) => {
    if (allowSearchSourceSelection as any === false) {
      return false
    }
    if (showLoading) {
      return showLoading
    } else {
      return (dataSourceConfig?.length > 1 && checkIsShowSearchInput())
    }
  })

  return (
    <ViewVisibilityContext.Consumer>
      {({ isInView, isInCurrentView }: ViewVisibilityContextProps) => {
        const isSearchInCurrentView = isInView ? isInCurrentView : true
        return (
          <PageVisibilityContext.Consumer>
            {(isWidgetInCurrentPage) => {
              return (
                <Paper transparent className='widget-search jimu-widget'>
                  <div className={`d-flex w-100 align-items-center search-con-${config.arrangementStyle}`} css={STYLE} ref={searchConRef}>
                    <div>
                      {checkIsShowSearchSetting(showLoading, dataSourceConfig, config?.allowSearchSourceSelection) && <SearchSetting
                        showLoading={showLoading}
                        className='h-100'
                        config={config}
                        dsStatus={dsStatus}
                        datasourceConfig={dataSourceConfig}
                        id={id}
                        useDataSources={useDataSources}
                        onDatasourceConfigChange={onDatasourceConfigChange}
                        synchronizeSettings={config?.dataSourceConfigWithMapCentric?.[jimuMapView?.id]?.synchronizeSettings}
                      />}
                    </div>
                    <SearchInput
                      showSearchSetting={checkIsShowSearchSetting(showLoading, dataSourceConfig, config?.allowSearchSourceSelection)}
                      id={id}
                      className='flex-grow-1 h-100'
                      reference={searchConRef}
                      config={config}
                      dsStatus={dsStatus}
                      isShowSearchInput={checkIsShowSearchInput()}
                      onShowSearchInputChange={onShowSearchInputChange}
                      isInCurrentView={isSearchInCurrentView}
                      isWidgetInCurrentPage={isWidgetInCurrentPage}
                      handleServiceListChange={handleServiceListChange}
                      handleSearchTextForConfirmSearchChange={handleSearchTextForConfirmSearchChange}
                      searchResult={searchResult}
                      serviceList={serviceList}
                      selectionList={selectionList}
                      jimuMapView={jimuMapView}
                      datasourceConfig={dataSourceConfig}
                      loadingServiceList={showLoading}
                    />
                    <CreateDatasource
                      id={id}
                      config={config}
                      serviceList={serviceList}
                      dsStatus={dsStatus}
                      jimuMapView={jimuMapView}
                      searchTextForConfirmSearch={searchTextForConfirmSearch}
                      handleSearchResultChange={handleSearchResultChange}
                      handleSelectionListChange={handleSelectionListChange}
                      handleDsStatusChange={handleDsStatusChange}
                      clearSearchResult={clearSearchResult}
                      synchronizeSettings={config?.dataSourceConfigWithMapCentric?.[jimuMapView?.id]?.synchronizeSettings}
                    />
                    {config?.sourceType === SourceType.MapCentric && renderMapContent()}
                  </div>
                </Paper>
              )
            }}
          </PageVisibilityContext.Consumer>
        )
      }}
    </ViewVisibilityContext.Consumer>
  )
}
Widget.versionManager = versionManager
export default Widget
