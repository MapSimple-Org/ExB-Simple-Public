/** @jsx jsx */
import { jsx, React, hooks, appActions, Immutable, ReactRedux, DataSourceComponent, DataSourceStatus, getAppStore, DataSourceManager } from 'jimu-core'
import type { QueriableDataSource, DataSource, QueryParams, IMState, ImmutableArray, UseDataSource, IMDataSourceInfo, QueryRequiredInfo } from 'jimu-core'
import type { IMConfig } from '../../../config'
import { getQueryOptions, compareQueryOptionsExceptPaging, getOrderByFields, getDsRecords as getDsRecordsUtil } from '../../utils/list-service'
import { checkIsQueryCount } from '../../utils/utils'
import { useListRuntimeState, useListRuntimeDispatch } from '../../state'
const { useEffect, useState, useRef } = React
type DataRenderFunction = (ds: DataSource, info: IMDataSourceInfo, query: QueryParams) => React.ReactNode
interface Props {
  id: string
  useDataSources: ImmutableArray<UseDataSource>
  config: IMConfig
  activeSort: boolean
  showLoadingWhenConfirmSelectTemplate: boolean
  noLayoutEntry: boolean
  children?: DataRenderFunction | React.ReactNode
  updateQueryOptions: (query) => void
  scrollToSelectedItems: (dataSource: DataSource) => void
  updateCreateDataSourceFailed: (createDataSourceFailed: boolean) => void
  loadNextPageWhenListSizeOrTotalCountChange: () => void
  scrollToItemAfterLoadRecords: () => void
}
const DataCountComponent = (props: Props) => {
  const preQueryRef = useRef(null)
  const setPageTimeoutRef = useRef(null)
  const totalCountRef = useRef(0)
  const useDataSourcesRef = useRef(null)
  const pageRef = useRef(1)
  const pageSizeRef = useRef(1)
  const queryStatusRef = useRef(null as DataSourceStatus)
  const dataSourceRef = useRef(null)
  const hasDsLoadedRef = useRef(false)
  const configRef = useRef(null as IMConfig)
  const setRecordTimeoutRef = useRef(null)

  const { useDataSources, id, config, activeSort, showLoadingWhenConfirmSelectTemplate, noLayoutEntry } = props
  const { updateQueryOptions, loadNextPageWhenListSizeOrTotalCountChange, updateCreateDataSourceFailed, scrollToSelectedItems, scrollToItemAfterLoadRecords } = props
  const [query, setQuery] = useState({
    returnGeometry: true
  } as any)

  const { page, searchText, dataSource, showSelectionOnly, currentFilter, filterApplied, sortOptionName, pageSize, queryStatus, hasDsLoadedRecord, selectedRecordsId } = useListRuntimeState()
  const listRuntimeDispatch = useListRuntimeDispatch()
  const appMode = ReactRedux.useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)

  const handleUseDatasourcesChange = React.useCallback((useDataSources: ImmutableArray<UseDataSource>) => {
    const oldUseDataSources = useDataSourcesRef.current
    if (useDataSources && useDataSources[0]) {
      const oldUseDataSource = oldUseDataSources && oldUseDataSources[0]
      if (!oldUseDataSource || oldUseDataSource.dataSourceId !== useDataSources[0].dataSourceId) {
        // reset queryStart
        listRuntimeDispatch({ type: 'SET_PAGE', value: 1 })
      }
    } else {
      // remove ds maybe
      dataSourceRef.current = undefined
      listRuntimeDispatch({type: 'SET_DATA_SOURCE', value: undefined})
    }
  }, [listRuntimeDispatch])

  const getQuery = React.useCallback((options) => {
    let query = getQueryOptions(options)
    const queryOptionsNotChanged = compareQueryOptionsExceptPaging(query, preQueryRef.current, dataSourceRef.current as QueriableDataSource)
    if (!queryOptionsNotChanged && dataSourceRef.current) {
      const temp = query
      if (pageRef.current !== 1) {
        query = preQueryRef.current
        preQueryRef.current = temp
        listRuntimeDispatch({ type: 'SET_PAGE', value: 1 })
      } else {
        preQueryRef.current = temp
      }
    }

    updateQueryOptions(query)
    setQuery(query)
  }, [listRuntimeDispatch, updateQueryOptions])

  const getLoadingStatus = React.useCallback(() => {
    // loading
    let showLoading = false
    if (showLoadingWhenConfirmSelectTemplate || (window.jimuConfig.isInBuilder && noLayoutEntry) || (dataSourceRef.current && queryStatusRef.current === DataSourceStatus.Loading)) {
      showLoading = true
    }
    return showLoading
  }, [noLayoutEntry, showLoadingWhenConfirmSelectTemplate])

  const getDsRecords = React.useCallback((showSelectionOnly, appMode) => {
    const isOutputDs = dataSourceRef.current ? checkDsIsOutputDs(dataSourceRef.current?.id) : false
    if (!hasDsLoadedRef.current && dataSourceRef.current && !isOutputDs && configRef.current?.isItemStyleConfirm) {
      //When switching ds, if ds has not loaded record, during the period of ds loading record, list can not be blank. Except for output ds.
      //https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/23499#issuecomment-5443367
      return
    }
    const showLoading = getLoadingStatus()
    const option = {
      ds: dataSourceRef.current as QueriableDataSource,
      showLoading,
      showSelectionOnly,
      config: configRef.current,
      appMode,
      page: pageRef.current,
      recordSizePerPage: pageSizeRef.current
    }
    // get new records
    const records = getDsRecordsUtil(option)
    listRuntimeDispatch({type: 'SET_RECORDS', value: records})

    if (records.length === 0) {
      // when record.length == 0, should reset show selection button status in list top tools
      listRuntimeDispatch({type: 'SET_SHOW_SELECTION_ONLY', value: false})
    }

    //setTimeout ensures that the scrollToSelectedItems method can get the latest needScrollToSelectedItems
    clearTimeout(setRecordTimeoutRef.current)
    setRecordTimeoutRef.current = setTimeout(() => {
      scrollToItemAfterLoadRecords()
      dataSourceRef.current && scrollToSelectedItems(dataSourceRef.current)
    })
  }, [listRuntimeDispatch, getLoadingStatus, scrollToSelectedItems, scrollToItemAfterLoadRecords])

  const resetListWhenTotalCountChange = (queryStatus?: DataSourceStatus) => {
    const isQueryCount = checkIsQueryCount(config)
    if (!isQueryCount) return
    const count = dataSource?.count

    // total count
    if (queryStatus === DataSourceStatus.Loaded && count !== null) {
      if (totalCountRef.current !== count) {
        clearTimeout(setPageTimeoutRef.current)
        setPageTimeoutRef.current = setTimeout(() => {
          listRuntimeDispatch({ type: 'SET_PAGE', value: 1 })
        }, 1)
        loadNextPageWhenListSizeOrTotalCountChange()
      }
      totalCountRef.current = count
    }
  }

  const updateSortOptionName = (sortOptionName: string) => {
    listRuntimeDispatch({type: 'SET_SORT_OPTION_NAME', value: sortOptionName})
  }

  const updateShowSortString = (showSortString: boolean) => {
    listRuntimeDispatch({type: 'SET_SHOW_SORT_STRING', value: showSortString})
  }

  const checkIsSelectRecordsChange = React.useCallback((dataSource: DataSource) => {
    const selectedRecordIds = dataSource?.getSelectedRecordIds() || []
    const lastSelectedRecordIds = selectedRecordsId || []
    if (selectedRecordIds?.length !== lastSelectedRecordIds?.length) {
      return true
    } else {
      return selectedRecordIds?.filter(id => !lastSelectedRecordIds?.includes(id))?.length > 0
    }
  }, [selectedRecordsId])

  const onDsSelectionChange = React.useCallback((selection) => {
    if (dataSource) {
      getDsRecords(showSelectionOnly, appMode)
      const needScrollToSelectedItems = checkIsSelectRecordsChange(dataSource)
      needScrollToSelectedItems && listRuntimeDispatch({type: 'SET_NEED_SCROLL_TO_SELECTED_ITEM', value: needScrollToSelectedItems})

      const selectedRecordIds = dataSource?.getSelectedRecordIds() || []
      listRuntimeDispatch({type: 'SET_SELECTED_RECORDS_ID', value: selectedRecordIds})
    }
  }, [appMode, dataSource, showSelectionOnly, getDsRecords, listRuntimeDispatch, checkIsSelectRecordsChange])

  const onDSCreated = hooks.useEventCallback((ds: DataSource) => {
    listRuntimeDispatch({type: 'SET_DATA_SOURCE', value: ds})
    dataSourceRef.current = ds
    const status = ds.getInfo().status
    if (status === DataSourceStatus.Loaded || status === DataSourceStatus.LoadError) {
      updateHasDsLoadedRecord(true)
    } else {
      updateHasDsLoadedRecord(false)
    }
    updateCreateDataSourceFailed(false)
    getAppStore().dispatch(appActions.widgetStatePropChange(id, 'dsId', ds.id))
  })

  const onCreateDataSourceFailed = (err) => {
    updateCreateDataSourceFailed(true)
  }

  const checkIsOrderByFieldsChange = (orderByFields = [], preyOrderByFields = []) => {
    return JSON.stringify(orderByFields) !== JSON.stringify(preyOrderByFields)
  }

  const getAllFieldsOfOrderByFields = (info: IMDataSourceInfo): string[] => {
    if (!info) return []
    let orderByFields = []
    for (const id in info?.widgetQueries) {
      const orderByFieldsOfWidget = (info.widgetQueries[id] as any)?.orderByFields || []
      orderByFields = orderByFields.concat(orderByFieldsOfWidget)
    }
    return Array.from(new Set(orderByFields))
  }

  const onDataSourceInfoChange = hooks.useEventCallback((info: IMDataSourceInfo, preInfo?: IMDataSourceInfo) => {
    listRuntimeDispatch({type: 'SET_DS_INFO', value: info})
    getDsRecords(showSelectionOnly, appMode)
    resetListWhenTotalCountChange(info?.status)
    updateSortOption(info, preInfo)

    const lastDataLoadTime = dataSourceRef.current && dataSourceRef.current?.getLastDataLoadTime()
    const lastAutoRefreshCheckTime = info?.lastAutoRefreshCheckTime
    listRuntimeDispatch({type: 'LAST_REFRESH_TIME', value: getLastRefreshTime(lastDataLoadTime, lastAutoRefreshCheckTime) || null})
  })

  const getLastRefreshTime = (lastDataLoadTime: number, lastAutoRefreshCheckTime: number) => {
    if (!lastDataLoadTime || !lastAutoRefreshCheckTime) {
      return lastAutoRefreshCheckTime || lastDataLoadTime
    } else {
      return Math.max(lastDataLoadTime, lastAutoRefreshCheckTime)
    }
  }

  const updateSortOption = hooks.useEventCallback((info: IMDataSourceInfo, preInfo?: IMDataSourceInfo) => {
    if (!config?.sortOpen || activeSort || typeof activeSort !== 'boolean') return

    const orderByFields = getAllFieldsOfOrderByFields(info)
    const preyOrderByFields = getAllFieldsOfOrderByFields(preInfo)
    if (!checkIsOrderByFieldsChange(orderByFields, preyOrderByFields)) return

    const newOrderByFields = orderByFields.filter(item => !preyOrderByFields.includes(item))

    const currentSort = config.sorts.map(sort => {
      const orderByFieldsItem = getOrderByFields(config.sorts, true, sort.ruleOptionName, true)[0]
      return {
        ruleOptionName: sort.ruleOptionName,
        orderByFieldsItem: orderByFieldsItem
      }
    })
    const newOrderByFieldsOfCurrentWidget = currentSort.filter(sort => {
      return newOrderByFields.includes(sort.orderByFieldsItem)
    })

    if (newOrderByFieldsOfCurrentWidget?.length > 0) {
      updateSortOptionName(newOrderByFieldsOfCurrentWidget[0].ruleOptionName)
      updateShowSortString(false)
    } else {
      updateSortOptionName(null)
      updateShowSortString(true)
    }
  })

  const onDataSourceStatusChange = hooks.useEventCallback((status: DataSourceStatus, preStatus?: DataSourceStatus) => {
    if (status === DataSourceStatus.Loaded || status === DataSourceStatus.LoadError) {
      updateHasDsLoadedRecord(true)
    }
    listRuntimeDispatch({type: 'SET_QUERY_STATUS', value: status})
    queryStatusRef.current = status
  })

  const updateHasDsLoadedRecord = (hasDsLoadedRecord: boolean) => {
    hasDsLoadedRef.current = hasDsLoadedRecord
    listRuntimeDispatch({type: 'SET_HAS_DS_LOADED_RECORD', value: hasDsLoadedRecord})
  }

  const isDsConfigured = (useDataSources): boolean => {
    return !!useDataSources && !!useDataSources[0]
  }

  const checkDsIsOutputDs = (dataSourceId: string): boolean => {
    const dsM = DataSourceManager.getInstance()
    return dsM.getDataSource(dataSourceId)?.getDataSourceJson()?.isOutputFromWidget
  }

  const onQueryRequired = (queryRequiredInfo: QueryRequiredInfo, preQueryRequiredInfo?: QueryRequiredInfo) => {
    if (pageRef.current !== 1) {
      listRuntimeDispatch({ type: 'SET_PAGE', value: 1 })
    }
  }

  useEffect(() => {
    handleUseDatasourcesChange(useDataSources)
    useDataSourcesRef.current = useDataSources
  }, [useDataSources, handleUseDatasourcesChange])

  useEffect(()=> {
    pageRef.current = page
    pageSizeRef.current = pageSize
    configRef.current = config
    const options = {
      sortOptionName: sortOptionName,
      searchText: searchText,
      currentFilter: currentFilter,
      filterApplied: filterApplied,
      datasource: dataSourceRef.current,
      config: config,
      pageSize: pageSize,
      useDataSources: Immutable(useDataSources),
      page: page,
      activeSort: activeSort
    }
    getQuery(options)
  }, [useDataSources, id, page, sortOptionName, searchText, currentFilter, filterApplied, config, activeSort, pageSize, getQuery])

  useEffect(() => {
    getDsRecords(showSelectionOnly, appMode)
  }, [queryStatus, dataSource, page, showSelectionOnly, appMode, pageSize, hasDsLoadedRecord, getDsRecords])

  return (
    <React.Fragment>
      {isDsConfigured(useDataSources) && <DataSourceComponent
        query={query}
        useDataSource={useDataSources && useDataSources[0]}
        onDataSourceCreated={onDSCreated}
        onCreateDataSourceFailed={onCreateDataSourceFailed}
        widgetId={id}
        queryCount={checkIsQueryCount(config)}
        onDataSourceInfoChange={onDataSourceInfoChange}
        onSelectionChange={onDsSelectionChange}
        onDataSourceStatusChange={onDataSourceStatusChange}
        onQueryRequired={onQueryRequired}
      >
        {props.children}
      </DataSourceComponent>}
    </React.Fragment>
  )
}
export default DataCountComponent