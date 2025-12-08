/** @jsx jsx */
import {
  React, css, ReactRedux, type IMState, jsx, polished, Immutable, type LinkResult, type LinkTo, DataSourceStatus, type QueriableDataSource, lodash, type ImmutableArray,
  AppMode, RecordSetChangeType, MessageManager, DataRecordsSelectionChangeMessage, DataSourceFilterChangeMessage, hooks, DataRecordSetChangeMessage, classNames,
  focusElementInKeyboardMode, type LinkTarget
} from 'jimu-core'
import { TextInput, Button, Link, Loading, defaultMessages as jimuiDefaultMessage, LoadingType } from 'jimu-ui'
import { type IMConfig, type Suggestion, type RecordResultType, SearchResultView, type IMDatasourceCreatedStatus, SourceType, type ServiceList, type NewDatasourceConfigItem, type InitResultServiceListOption, SearchServiceType, type IMServiceList, type IMSearchResult, type IMSelectionList, ArrangementStyle } from '../../config'
import { getSQL } from '../utils/search-service'
import {
  getDatasource, setRecentSearches, getRecentSearches, clearFilterOfDeletedDs, clearRecentSearches, getJsonLength, changeDsStatus, checkIsDsCreated, getSuggestions, loadAllDsRecord,
  publishRecordCreatedMessageAction, updateRecordsOfOutputDs, checkIsAllRecordLoaded, checkIsAllDsCreated, getSearchStatusInUrl, handleSearchWidgetUrlParamsChange,
  loadEsriModulesForZoomTo, updateAllLayerServiceDsQueryParams
} from '../utils/utils'
import type { JimuMapView } from 'jimu-arcgis'
import SuggestionList from './suggestion-list'
import LocationAndRecentSearch from './location-and-recent-searches'
import ResultList from './result-list'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import defaultMessage from '../translations/default'
import { useTheme } from 'jimu-theme'
const { useSelector } = ReactRedux
const { useState, useEffect, useRef, useMemo } = React
interface SearchSettingProps {
  config: IMConfig
  reference: any
  id: string
  className?: string
  isShowSearchInput: boolean
  isInCurrentView: boolean
  isWidgetInCurrentPage: boolean
  searchResult: IMSearchResult
  serviceList: IMServiceList
  selectionList: IMSelectionList
  jimuMapView: JimuMapView
  showSearchSetting?: boolean
  loadingServiceList?: boolean
  dsStatus?: IMDatasourceCreatedStatus
  datasourceConfig: ImmutableArray<NewDatasourceConfigItem>
  onShowSearchInputChange: (isShow: boolean) => void
  handleServiceListChange: (serviceList: IMServiceList) => void
  handleSearchTextForConfirmSearchChange: (searchText: string) => void
}

const SearchInput = (props: SearchSettingProps) => {
  const theme = useTheme()
  const nls = hooks.useTranslation(defaultMessage, jimuiDefaultMessage)
  const queryObject = useSelector((state: IMState) => state?.queryObject)
  const appMode = useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)
  const debounceQuerySuggestionRef = useRef((searchText: string) => undefined)
  const linkRef = useRef<HTMLButtonElement>(null)
  const clearSearchValueTimeoutRef = useRef(null)
  const outputDsIdsRef = useRef([] as string[])

  const resultFirstItem = useRef(null)
  const resultServiceListRef = useRef<ServiceList>(null)

  const serviceListRef = useRef<IMServiceList>(null)
  const hasSetServiceList = useRef<boolean>(false)
  const preEnableFiltering = useRef<boolean>(false)
  const didMount = useRef<boolean>(false)
  const newServiceListRef = useRef<IMServiceList>(null)
  const checkIsToOtherWidgetTimeoutRef = useRef<any>(null)
  const checkIsAllDsStatusLoadedTimeoutRef = useRef<any>(null)
  const isHasConfirmSearchRef = useRef<boolean>(false)

  const isHasConfirmSearchByUrlParamsRef = useRef<boolean>(false)

  const esriGeometryUtilsRef = useRef(null)
  const PolygonClassRef = useRef(null)
  const GraphicClassRef = useRef(null)
  //Input Ref
  const searchValueRef = useRef(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const inputBlurTimeoutRef = useRef(null)

  //Result list/Suggestion/Recent searches ref
  const perLocationLoading = useRef<boolean>(false)
  const confirmSearchByInUrlSearchTextTimeout = useRef(null)
  const preIsOpenResultPopperRef = useRef(false)
  const suggestionFirstItem = useRef(null)
  const recentSearchFirstItem = useRef(null)
  const isFocusSuggestion = useRef<boolean>(false)
  const isFocusLocationAndRecentSearch = useRef<boolean>(false)
  const locationLoadingRef = useRef<boolean>(false)

  const { config, dsStatus, className, reference, id, isShowSearchInput, isInCurrentView, isWidgetInCurrentPage, serviceList, searchResult, selectionList, datasourceConfig, loadingServiceList, showSearchSetting, jimuMapView } = props
  const { handleServiceListChange, handleSearchTextForConfirmSearchChange } = props
  const { isShowRecentSearches, recentSearchesMaxNumber, linkParam, searchResultView, resultMaxNumber } = config

  //suggestion
  const [searchValue, setSearchValue] = useState(null)
  const [isShowLoading, setIsShowLoading] = useState(false)
  const [isOpenSuggestion, setIsOpenSuggestion] = useState(false)
  const [isHasServiceSupportSuggest, setIsHasServiceSupportSuggest] = useState(false)
  const [searchSuggestion, setSearchSuggestion] = useState([] as Suggestion[])

  //Result list
  const [resultServiceList, setResultServiceList] = useState({} as ServiceList)
  const [isOpenResultPopper, setIsOpenResultPopper] = useState(false)
  const [isToOtherWidget, setIsToOtherWidget] = useState(false)
  const [isOpenResultListDefault, setIsOpenResultListDefault] = useState(false)

  const [searchPlaceholder, setSearchPlaceholder] = useState(null)

  //Location or recent searches
  const [locationLoading, setLocationLoading] = useState(false)
  const [openLocationOrRecentSearches, setOpenLocationOrRecentSearches] = useState(false)
  const [recentSearchesData, setRecentSearchesData] = useState([] as Suggestion[])
  const [isGetLocationError, setIsGetLocationError] = useState(false)

  //This dsId is just the id of the dataSource where the record selected by the current search is located
  const [dsIdOfSelectedResultItem, setDsIdOfSelectedResultItem] = useState(null)

  //Utility error remind
  const [openUtilityErrRemindInSuggestion, setOpenUtilityErrRemindInSuggestion] = useState(false)
  const [openUtilityErrRemindInResult, setOpenUtilityErrRemindInResult] = useState(false)

  const STYLE = css`
    .input-wrapper {
      height: 100% !important;
    }
    input::-webkit-contacts-auto-fill-button{
      opacity: 0 !important;
      visibility: hidden;
    }
    .loading-con {
      left: 0;
      top: 0;
      right: var(--sys-shape-2);
      height: 2px;
    }
    .hide-loading {
      opacity: 0;
      visibility: hidden;
    }
    .search-button {
      width: 32px;
      border-radius: 0;
    }
    .search-input-con input{
      width: 100%;
    }
    .search-link-con {
      width: 0;
      height: 0;
      overflow: hidden;
    }
    &.arrangement-Style1 {
      .search-button {
        border-radius: 0 var(--sys-shape-2) var(--sys-shape-2) 0;
      }
      .input-wrapper {
        border-radius: var(--sys-shape-2) 0 0 var(--sys-shape-2);
      }
      .no-border-left .input-wrapper{
        border-radius: 0;
        border-left: none;
      }
    }
    &.arrangement-Style2 {
      & {
        padding-right: 1px;
      }
      .input-prefix-icon {
        color: var(--sys-color-action-disabled-text);
      }
      .input-wrapper {
        border-radius: ${polished.rem(32)} !important;
      }
    }
    &.arrangement-Style3 {
      .input-wrapper {
        background: none;
        border: none;
      }
      .search-button {
        background: none;
        color: inherit !important;
      }
    }
    //https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/26291#issuecomment-5527033
    //Because after the theme is updated, the color of the input placeholder is set, which causes a regression issue.
    //In order to deal with this regression issue, special processing is required under the dark theme.
    .in-dark-theme input::placeholder {
      color: #868686 !important;
    }
  `

  //After switching the page or view, judge whether to open the result panel according to the open situation of the previous result panel
  useEffect(() => {
    //If the search is in the page or the current view, judge whether to open the result panel according to the previous open state of the result panel
    if (preIsOpenResultPopperRef.current && isInCurrentView && isWidgetInCurrentPage) {
      setIsOpenResultListDefault(false)
      lodash.defer(() => {
        toggleResultPopper(true)
      })
    } else {
      setIsOpenResultListDefault(true)
    }
    //If Search widget is not in the current page or current view, close the result panel
    if (!isInCurrentView || !isWidgetInCurrentPage) {
      closeResultPopper()
    }
  }, [isInCurrentView, isWidgetInCurrentPage])

  useEffect(() => {
    const isLocationLoaded = !locationLoading && perLocationLoading.current
    if (isLocationLoaded) {
      toggleLocationOrRecentSearches(true, false)
    }
    perLocationLoading.current = locationLoading
  }, [isOpenResultPopper, locationLoading])

  useEffect(() => {
    if (isOpenResultPopper && appMode === AppMode.Design) {
      closeResultPopper()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode])

  useEffect(() => {
    debounceQuerySuggestionRef.current = lodash.debounce(querySuggestion, 400)
    getPlaceholder(serviceList, config?.hint)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  useEffect(() => {
    if (hasSetServiceList.current) {
      clearDsFilterAfterDeleteOrAddDs(serviceList)
      clearDsFilterAfterEnableFilteringChange(serviceList, preEnableFiltering.current)
      clearDataRecordSetChangeMessageWhenOutputDsChange(serviceList)
    }
    const outputDsIds = getAllOutputDsIdsFromServiceList(serviceList)
    outputDsIdsRef.current = outputDsIds
    preEnableFiltering.current = config?.enableFiltering
    didMount.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceList, config.enableFiltering])

  useEffect(() => {
    /**
     * Check is has service support suggest
    */

    serviceListRef.current = serviceList
    serviceList && (hasSetServiceList.current = true)

    const isLoadedAllServiceWhenSyncWithMap = config?.sourceType === SourceType.MapCentric ? !loadingServiceList : true
    getPlaceholder(serviceList, config?.hint)
    checkIsAllLocatorSupportSuggest(serviceList)
    if (!isHasConfirmSearchByUrlParamsRef.current && serviceList && isLoadedAllServiceWhenSyncWithMap) {
      confirmSearchBySearchTextInUrlHashObject(serviceList)
      isHasConfirmSearchByUrlParamsRef.current = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceList, loadingServiceList])

  const confirmSearchBySearchTextInUrlHashObject = hooks.useEventCallback((serviceList) => {
    const searchStatusInUrlHashObject = getSearchStatusInUrl(id)
    const { text: searchText, status } = searchStatusInUrlHashObject

    if (status) {
      status.isFromSuggestion = true
    }

    if (!searchText) return
    if (!serviceList || Object.keys(serviceList)?.length === 0) {
      updateSearchValue(searchText, status)
      confirmSearch(searchText, false, status)
    }
    clearTimeout(confirmSearchByInUrlSearchTextTimeout.current)
    confirmSearchByInUrlSearchTextTimeout.current = setTimeout(() => {
      if (checkIsAllDsCreated(serviceList?.asMutable({ deep: true }), id) && getCanUseDsLength() > 0) {
        updateSearchValue(searchText, status)
        confirmSearch(searchText, false, status)
      } else {
        confirmSearchBySearchTextInUrlHashObject(serviceList)
      }
    }, 300)
  })

  const toggleLocationOrRecentSearches = (isOpen = false, isInitGetLocationStatus = true) => {
    if (isInitGetLocationStatus) {
      setIsGetLocationError(false)
    }
    if (!isOpen) {
      isFocusLocationAndRecentSearch.current = false
    }
    setOpenLocationOrRecentSearches(isOpen)
  }

  const clearDsFilterAfterEnableFilteringChange = (serviceList: IMServiceList, preEnableFiltering: boolean) => {
    if (!didMount.current) return false
    const isEnableFilteringChange = preEnableFiltering !== config?.enableFiltering

    if (isEnableFilteringChange) {
      clearTimeout(clearSearchValueTimeoutRef.current)
      clearSearchValueTimeoutRef.current = setTimeout(() => {
        searchValueRef.current && clearSearchValue(false)
        for (const configId in serviceList) {
          const isItemFeatureService = serviceList[configId]?.searchServiceType === SearchServiceType.FeatureService
          if (isItemFeatureService) {
            clearFilterOfDeletedDs(serviceList[configId], id, configId, preEnableFiltering)
          }
        }
      })
    }
  }

  const clearDsFilterAfterDeleteOrAddDs = (serviceList: IMServiceList) => {
    if (!didMount.current || !searchValueRef.current) return false
    const preService = serviceListRef.current || {}
    const configIds = getServiceConfigId(serviceList)
    const preConfigIds = getServiceConfigId(serviceListRef.current)
    const deleteConfigIds = preConfigIds?.filter(id => !configIds?.includes(id)) || []
    const serviceLengthChange = Object.keys(serviceList || {}).length !== Object.keys(preService || {}).length

    if (serviceLengthChange && searchValueRef.current) {
      clearTimeout(clearSearchValueTimeoutRef.current)
      clearSearchValueTimeoutRef.current = setTimeout(() => {
        clearSearchValue(false)
        deleteConfigIds?.forEach(configId => {
          const isItemFeatureService = preService[configId]?.searchServiceType === SearchServiceType.FeatureService
          if (isItemFeatureService) {
            clearFilterOfDeletedDs(preService[configId], id, configId, config?.enableFiltering)
          } else {
            initOutputDsItemStatus(preService[configId]?.outputDataSourceId)
          }
        })
      })
    }
  }

  const getServiceConfigId = (serviceList: IMServiceList): string[] => {
    if (!serviceList) {
      return []
    } else {
      return Object.keys(serviceList).map(id => id)
    }
  }

  const toggleSuggestionUtilityError = (open = false) => {
    setOpenUtilityErrRemindInSuggestion(open)
  }

  const toggleResultUtilityError = (open = false) => {
    setOpenUtilityErrRemindInResult(open)
  }

  /**
  * Query suggestion
  */
  const querySuggestion = hooks.useEventCallback((starchText: string) => {
    if (config?.maxSuggestions === 0) {
      setIsShowLoading(false)
      return
    }
    !isShowLoading && setIsShowLoading(true)

    const getSuggestionsOption = {
      searchText: starchText,
      serviceList: newServiceListRef?.current?.asMutable({ deep: true }),
      config,
      datasourceConfig: datasourceConfig,
      jimuMapView: jimuMapView
    }
    const serviceSuggestion = getSuggestions(getSuggestionsOption)

    Promise.all([serviceSuggestion]).then(allSuggestion => {
      const suggestion = allSuggestion?.[0]

      const isShowUtilityError = suggestion?.filter(item => item?.err)?.length > 0
      if (isShowUtilityError) {
        toggleSuggestionUtilityError(true)
      }

      setIsShowLoading(false)
      if (suggestion) {
        setSearchSuggestion(suggestion)
      }
      if (!isHasConfirmSearchRef.current) {
        searchValueRef.current && setIsOpenSuggestion(true)
      }
      isHasConfirmSearchRef.current = false
    }).catch((error) => {
      setIsShowLoading(false)
    })
  })

  const checkIsAllLocatorSupportSuggest = hooks.useEventCallback((newServiceList: IMServiceList) => {
    if (!didMount.current) return false
    let hasServiceSupportSuggest = false
    for (const key in newServiceList) {
      const serviceItem = newServiceList[key]
      if (serviceItem?.searchServiceType === SearchServiceType.FeatureService) {
        hasServiceSupportSuggest = true
      } else {
        if (serviceItem?.isSupportSuggest) {
          hasServiceSupportSuggest = true
        }
      }
    }
    setIsHasServiceSupportSuggest(hasServiceSupportSuggest)
  })

  /**
   * Fire callback when the text of search input changes
  */
  const onChange = (e) => {
    const value = e?.target?.value
    const isShowSuggestion = value?.length > 2
    updateSearchValue(value)
    if (isOpenResultPopper) {
      confirmSearch('', true)
    }
    toggleResultPopper(false)
    if (!isShowSuggestion || !isHasServiceSupportSuggest) {
      setIsOpenSuggestion(false)
      if (value?.length === 0) {
        confirmSearch('', true)
      }
      return false
    }
    debounceQuerySuggestionRef.current(value)
  }

  const initResultServiceList = (newServiceList: ServiceList, initResultServiceListOption?: InitResultServiceListOption) => {
    const { configId, magicKey, isFromSuggestion } = initResultServiceListOption || {}
    let newResultServiceList = Immutable(newServiceList)
    const suggestionServiceList = {} as any
    for (const id in newResultServiceList) {
      if (id === configId && (magicKey || isFromSuggestion)) {
        magicKey && (newResultServiceList = newResultServiceList.setIn([configId, 'magicKey'], magicKey || null))
        isFromSuggestion && (newResultServiceList = newResultServiceList.setIn([configId, 'isFromSuggestion'], isFromSuggestion || null))
        suggestionServiceList[configId] = newResultServiceList[configId]
      }
    }

    if (magicKey || isFromSuggestion) {
      const isServiceItemExist = Object.keys(newServiceList).includes(configId)
      isServiceItemExist && (newResultServiceList = Immutable(suggestionServiceList))
    }

    resultServiceListRef.current = newResultServiceList?.asMutable({ deep: true })
    setResultServiceList(newResultServiceList?.asMutable({ deep: true }))
  }

  /**
   * Fire callback when clear search input
  */
  const clearSearchValue = (isFocusInput = true) => {
    updateSearchValue('', null, true)

    setIsShowLoading(false)
    toggleResultPopper(false)

    confirmSearch('', true)

    clearTimeout(inputBlurTimeoutRef.current)
    isFocusInput && focusElementInKeyboardMode(searchInputRef.current)
  }

  /**
   * Set outputDs status to NotReady after clear search input
  */
  const initOutputDsStatus = hooks.useEventCallback(() => {
    for (const configId in serviceList) {
      if (serviceList[configId]?.searchServiceType === SearchServiceType.GeocodeService) {
        const outputDsId = serviceList[configId]?.outputDataSourceId
        initOutputDsItemStatus(outputDsId)
      }
    }
  })

  /**
   * When switching 'Customize search sources' or search source, the dsId generated by the geocode service may change.
   * In this case, we need to use the old 'outputDsId' to clear the 'DataRecordSetChangeMessage'
  */
  const clearDataRecordSetChangeMessageWhenOutputDsChange = (newServiceList: IMServiceList) => {
    let isOutputDsChanged = false
    const newOutputDsIds = getAllOutputDsIdsFromServiceList(newServiceList)
    if (newOutputDsIds?.length !== outputDsIdsRef.current.length || newOutputDsIds?.filter(id => !outputDsIdsRef.current.includes(id))?.length > 0) {
      isOutputDsChanged = true
    }
    if (isOutputDsChanged) {
      const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(id, RecordSetChangeType.Remove, outputDsIdsRef.current)
      MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
    }
  }

  const clearDataRecordSetChangeMessage = hooks.useEventCallback(() => {
    const outputDsIds = getAllOutputDsIdsFromServiceList(serviceList)
    const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(id, RecordSetChangeType.Remove, outputDsIds)
    MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
  })

  const getAllOutputDsIdsFromServiceList = (serviceList: IMServiceList) => {
    const outputDsIds = []
    for (const configId in serviceList) {
      if (serviceList[configId]?.searchServiceType === SearchServiceType.GeocodeService) {
        const outputDsId = serviceList[configId]?.outputDataSourceId
        outputDsIds.push(outputDsId)
      }
    }
    return outputDsIds
  }

  const initOutputDsItemStatus = (outputDsId: string) => {
    const outPutDs = getDatasource(outputDsId)
    outPutDs?.selectRecordsByIds([])
    changeDsStatus(outPutDs as QueriableDataSource, DataSourceStatus.NotReady)
  }

  /**
   * Fire callback when search input focus
  */
  const onSearchInputFocus = (e) => {
    if (isFocusSuggestion.current || isFocusLocationAndRecentSearch.current) {
      isFocusLocationAndRecentSearch.current = false
      isFocusSuggestion.current = false
      return false
    }
    showRecentSearches(searchValueRef.current)
    showUseCurrentLocation(searchValueRef.current)
  }

  /**
   * Toggle result list popper
  */
  const toggleResultPopper = (isOpen: boolean) => {
    preIsOpenResultPopperRef.current = isOpen
    if (!isOpen) {
      setIsOpenResultListDefault(true)
    }
    setIsOpenResultPopper(isOpen)
    setIsToOtherWidget(isOpen)
  }

  const closeResultPopper = () => {
    setIsOpenResultPopper(false)
  }

  /**
   * Fire callback when search input key up
  */
  const onKeyUp = e => {
    if (!e || !e.target) return
    const searchText = e?.target?.value
    //Click suggestion to get the result, then click Enter again and no longer reload
    if (e.keyCode === 13 && checkIsReloadRecords()) {
      updateSearchValue(searchText)
      confirmSearch(searchText)
    }
    checkAndFocusPopper(e)
  }

  const checkIsReloadRecords = () => {
    let isReload = true
    if (!resultServiceListRef.current) return isReload
    const currentResultServiceList = resultServiceListRef.current
    for (const configId in currentResultServiceList) {
      const serviceItem = currentResultServiceList[configId]
      isReload = !(serviceItem?.magicKey || serviceItem?.isFromSuggestion)
      if (!isReload) break
    }
    return isReload
  }

  /**
   * Fire callback when the suggestion list item is clicked.
  */
  const onSuggestionItemClick = (searchText: string, initResultServiceListOption?: InitResultServiceListOption, isUseLocationError?: boolean) => {
    if (isUseLocationError) {
      loadLocationError()
      return false
    }

    setWidgetUrlParams(searchText, initResultServiceListOption)

    updateSearchValue(searchText, initResultServiceListOption)
    confirmSearch(searchText, false, initResultServiceListOption)
    focusElementInKeyboardMode(searchInputRef.current)
  }

  const setWidgetUrlParams = (searchText: string, initResultServiceListOption?: InitResultServiceListOption) => {
    const searchStatus = getSearchStatusInUrl(id) || {}
    if (searchText) {
      searchStatus.text = searchText
      if (initResultServiceListOption) {
        const status = {
          configId: initResultServiceListOption?.configId
        } as any
        initResultServiceListOption?.magicKey && (status.magicKey = initResultServiceListOption?.magicKey)
        searchStatus.status = status
      } else {
        if (searchStatus?.status) {
          delete searchStatus.status
        }
      }
      handleSearchWidgetUrlParamsChange(id, searchStatus)
    } else {
      if (!searchStatus?.enabledList) {
        handleSearchWidgetUrlParamsChange(id, null)
      } else {
        const newSearchStatus = {
          enabledList: searchStatus?.enabledList
        }
        handleSearchWidgetUrlParamsChange(id, newSearchStatus)
      }
    }
  }

  const loadLocationError = () => {
    focusElementInKeyboardMode(searchInputRef.current)
    setIsGetLocationError(true)
    toggleLocationOrRecentSearches(true, false)
  }
  /**
   * Confirm search
  */
  const confirmSearch = hooks.useEventCallback((searchText: string, isClearSearch: boolean = false, initResultServiceListOption?: InitResultServiceListOption) => {
    if (isOpenResultPopper && !isClearSearch) return
    searchText = searchText?.trim()
    updateRecentSearches(searchText)
    setIsOpenSuggestion(false)
    toggleLocationOrRecentSearches(false)
    clearSelectRecordAndAction()

    handleSearchTextForConfirmSearchChange(searchText)
    handleServiceListChange(newServiceListRef.current)


    isHasConfirmSearchRef.current = true

    const updateParamsOption = {
      serviceList: resultServiceListRef.current,
      searchText: searchText,
      searchResultView: searchResultView,
      id: id,
      sourceType: config?.sourceType,
      jimuMapView: jimuMapView
    }

    if (config?.enableFiltering) {
      updateAllLayerServiceDsQueryParams(updateParamsOption)
      publishDataFilterAction()
    }

    setWidgetUrlParams(searchText, initResultServiceListOption)

    setIsShowLoading(true)
    updateRecordsOfOutputDs(updateParamsOption).then(res => {
      setIsShowLoading(false)
      if (res?.filter(item => typeof item === 'boolean')?.length > 0) {
        toggleResultUtilityError(true)
      }

      isHasConfirmSearchRef.current = false

      searchText && showResult(searchText)
    }, err => {
      setIsShowLoading(false)
    })
  })

  /**
   * Clear the selected records and message actions of current search before re-searching
  */
  const clearSelectRecordAndAction = () => {
    const datasourceIds = []
    for (const key in newServiceListRef.current) {
      const item = newServiceListRef.current[key]
      const dsId = item.searchServiceType === SearchServiceType.FeatureService ? item?.useDataSource?.dataSourceId : item?.outputDataSourceId
      datasourceIds.push(dsId)
    }

    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(id, [], datasourceIds)
    )
    if (dsIdOfSelectedResultItem) {
      const ds = getDatasource(dsIdOfSelectedResultItem) as QueriableDataSource
      ds?.selectRecordsByIds([])
      handleDsIdOfSelectedResultItemChange(null)
    }

    clearDataRecordSetChangeMessage()
    initOutputDsStatus()
  }

  const handleDsIdOfSelectedResultItemChange = (dsId: string) => {
    setDsIdOfSelectedResultItem(dsId)
  }

  const publishDataFilterAction = hooks.useEventCallback(() => {
    const datasourceIds: string[] = []
    for (const configId in resultServiceList) {
      const service = resultServiceList[configId]
      let dsId: string
      if (service?.searchServiceType === SearchServiceType.FeatureService) {
        dsId = service?.useDataSource?.dataSourceId
        datasourceIds.push(dsId)
      } else {
        service?.outputDataSourceId && datasourceIds.push(service?.outputDataSourceId)
      }
    }
    MessageManager.getInstance().publishMessage(new DataSourceFilterChangeMessage(id, datasourceIds))
  })

  const showResult = (searchText: string) => {
    //Show result
    if (searchResultView === SearchResultView.OtherWidgets) {
      if (searchText) {
        if (checkIsHasSuggestion()) {
          toOtherWidget()
        } else {
          //Load records and check is has records before jump page, if not, show no result panel
          loadRecordAndCheckIsToOtherWidget()
        }
      }
    } else {
      showResultPanel()
    }
  }

  /**
  * Load records and check is has records before jump page, if not, show no result panel
  */
  const loadRecordAndCheckIsToOtherWidget = () => {
    if (!checkIsAllRecordLoaded(resultServiceListRef.current, id)) {
      clearTimeout(checkIsToOtherWidgetTimeoutRef.current)
      checkIsToOtherWidgetTimeoutRef.current = setTimeout(() => {
        loadRecordAndCheckIsToOtherWidget()
      }, 200)
      return false
    }
    const serviceRecords = loadAllDsRecord(resultServiceListRef.current, resultMaxNumber, id, config?.enableFiltering)
    Promise.all([serviceRecords]).then(res => {
      let allResponse = []
      let allRecords = []
      res?.forEach(resItem => {
        allResponse = allResponse.concat(resItem)
      })
      allResponse.forEach(dsResult => {
        const records = dsResult?.records || []
        allRecords = allRecords.concat(records)
      })
      if (allRecords?.length > 0) {
        toOtherWidget()
      } else {
        //Show no result
        showResultPanel()
      }
    })
  }

  const showResultPanel = () => {
    publishRecordCreateAction()
    toggleResultPopper(true)
  }

  const checkIsHasSuggestion = () => {
    let suggestion = []
    searchSuggestion.forEach(item => {
      suggestion = suggestion.concat(item?.suggestionItem)
    })
    return suggestion.length > 0
  }

  /**
   * Update Recent searches
  */
  const updateRecentSearches = (searchText: string) => {
    //Save recent search
    const recentSearchOption = {
      searchText: searchText,
      id: id,
      recentSearchesMaxNumber: recentSearchesMaxNumber,
      isShowRecentSearches: isShowRecentSearches
    }
    setRecentSearches(recentSearchOption)
  }

  /**
   * Show result in other widget
  */
  const toOtherWidget = () => {
    if (!linkRef?.current) {
      return false
    }
    publishRecordCreateAction()
    setIsToOtherWidget(true)
    linkRef?.current?.click()
  }

  /**
   * Load geocode records and publish records created message action
  */
  const publishRecordCreateAction = async () => {
    if (!checkIsAllRecordLoaded(resultServiceListRef.current, id)) {
      clearTimeout(checkIsAllDsStatusLoadedTimeoutRef.current)
      checkIsAllDsStatusLoadedTimeoutRef.current = setTimeout(() => {
        publishRecordCreateAction()
      }, 200)
      return false
    }
    const maxRecordNumber = searchResultView === SearchResultView.ResultPanel ? resultMaxNumber : 100
    const geocodeRecords = loadAllDsRecord(resultServiceListRef.current, maxRecordNumber, id, config?.enableFiltering, true)
    if (!esriGeometryUtilsRef.current || !PolygonClassRef.current || !GraphicClassRef.current) {
      const esriModules = await loadEsriModulesForZoomTo()
      esriGeometryUtilsRef.current = esriModules[0]
      PolygonClassRef.current = esriModules[1]
      GraphicClassRef.current = esriModules[2]
    }
    Promise.all([geocodeRecords]).then(res => {
      let allResponse: RecordResultType[] = []
      res?.forEach(resItem => {
        allResponse = allResponse.concat(resItem)
      })

      let allRecords = []
      let zoomScale
      allResponse?.forEach(res => {
        const records = res?.records || []
        if (records?.length > 0 && res?.zoomScale) {
          zoomScale = res?.zoomScale
        }
        allRecords = allRecords.concat(records)
      })

      let extent
      if (allRecords?.length === 1) {
        extent = allRecords[0]?.__extent
      }
      publishRecordCreatedMessageAction({
        widgetId: id,
        recordsArr: allResponse,
        recordSetChangeType: RecordSetChangeType.CreateUpdate,
        extent: extent,
        zoomScale: zoomScale,
        scaleExtent: esriGeometryUtilsRef.current?.scaleExtent,
        Polygon: PolygonClassRef.current,
        Graphic: GraphicClassRef.current
      })
    })
  }

  const getLinkToOption = (linkParam) => {
    let target: LinkTarget
    let linkTo: LinkTo
    if (linkParam?.linkType) {
      target = linkParam?.openType
      linkTo = {
        linkType: linkParam?.linkType
      } as LinkResult

      linkTo.value = linkParam?.value
    }
    return {
      linkTo: linkTo,
      target: target
    }
  }

  const linkToOption = useMemo(() => getLinkToOption(linkParam), [linkParam])

  /**
   * Clear Recent search
  */
  const clearRecentSearch = () => {
    clearRecentSearches(id)
    setRecentSearchesData([])
    setOpenLocationOrRecentSearches(false)
  }

  /**
   * Fire callback when the text of search input changes
  */
  const updateSearchValue = (searchText: string, initResultServiceListOption?: InitResultServiceListOption, alwaysUpdateQuerySQL?: boolean) => {
    setSearchSuggestion([])
    setSearchValue(searchText)
    searchValueRef.current = searchText
    if(!searchText && !config?.enableFiltering && !alwaysUpdateQuerySQL) {
      return
    }
    setQuerySQL(searchText, initResultServiceListOption)
  }
  /**
    * Set query SQL according to search text
  */
  const setQuerySQL = hooks.useEventCallback((searchText: string, initResultServiceListOption?: InitResultServiceListOption) => {
    const currentServiceList = serviceListRef.current
    let newServiceList = serviceListRef.current
    searchText = searchText?.trim()
    const searchExtent = config.sourceType === SourceType.MapCentric ? jimuMapView?.view?.extent : null
    for (const configId in currentServiceList) {
      const dsId = currentServiceList[configId]?.useDataSource?.dataSourceId
      if (currentServiceList[configId].searchServiceType === SearchServiceType.GeocodeService || !checkIsDsCreated(dsId)) continue
      const ds = getDatasource(dsId)
      const searchFields = currentServiceList[configId].searchFields?.asMutable({ deep: true }) || []
      const searchExact = currentServiceList[configId].searchExact || false
      const SQL = getSQL(searchText, searchFields, ds, searchExact)
      const SuggestionSQL = getSQL(searchText, searchFields, ds, false)
      newServiceList = newServiceList
        .setIn([configId, 'SQL'], SQL)
        .setIn([configId, 'SuggestionSQL'], SuggestionSQL)
        .setIn([configId, 'searchText'], searchText)
      if (searchExtent) {
        const tempGeometry = searchExtent?.toJSON ? searchExtent?.toJSON() : {}
        newServiceList = newServiceList
          .setIn([configId, 'searchExtent'], tempGeometry)
      }
    }
    newServiceListRef.current = newServiceList
    initResultServiceList(newServiceList?.asMutable({ deep: true }), initResultServiceListOption)
  })

  /**
   * Check is show recent searches
  */
  const showRecentSearches = (searchText?: string) => {
    if (!searchText && isShowRecentSearches) {
      const recentSearches = getRecentSearches(id)
      const recentSearchesItem = recentSearches.map((searchValue) => {
        return {
          suggestionHtml: searchValue,
          suggestion: searchValue,
          isRecentSearch: true
        }
      })
      setRecentSearchesData([{
        suggestionItem: recentSearchesItem,
        layer: null,
        icon: null
      }])
      toggleLocationOrRecentSearches(true)
    }
  }

  const showUseCurrentLocation = (searchText?: string) => {
    if (!searchText && config?.isUseCurrentLoation) {
      toggleLocationOrRecentSearches(true)
      if (!config?.isShowRecentSearches) {
        setRecentSearchesData([{
          suggestionItem: [],
          layer: null,
          icon: null
        }])
      }
    }
  }

  const renderLoading = (isShowLoading: boolean, locationLoading: boolean) => {
    const showLoading = isShowLoading || locationLoading
    if (!showLoading) return null
    return <div className={classNames('position-absolute loading-con', { 'hide-loading': !showLoading })}>
      <Loading className='w-100' type={LoadingType.Bar} />
    </div>
  }

  const prefix = () => {
    return config.arrangementStyle === ArrangementStyle.Style2 ? <SearchOutlined className='input-prefix-icon'/> : null
  }

  /**
   * Get placeholder of search input
  */
  const getPlaceholder = hooks.useEventCallback((newServiceList: IMServiceList, inCommonHint?: string) => {
    if (!newServiceList) return
    let servicePlaceholder
    const canUseDsLength = getCanUseDsLength(newServiceList)
    for (const configId in newServiceList) {
      servicePlaceholder = newServiceList?.[configId]?.hint && newServiceList?.[configId]?.hint
    }

    const multipleSearchPlaceholder = inCommonHint || config?.hint || nls('findAddressOrPlace')
    servicePlaceholder = servicePlaceholder || nls('findAddressOrPlace')
    const newPlaceholder = (canUseDsLength !== 1) ? multipleSearchPlaceholder : servicePlaceholder
    setSearchPlaceholder(newPlaceholder)
  })

  const getCanUseDsLength = hooks.useEventCallback((newServiceList?: IMServiceList) => {
    newServiceList = newServiceList || serviceList
    return getJsonLength(newServiceList)
  })

  const onSearchButtonClick = (searchValue: string) => {
    checkIsReloadRecords() && confirmSearch(searchValue)
  }

  const setSuggestionFirstItem = (ref: any) => {
    suggestionFirstItem.current = ref
  }

  const setRecentSearchFirstItem = (ref: any) => {
    recentSearchFirstItem.current = ref
  }

  const setResultFirstItem = (ref: any) => {
    resultFirstItem.current = ref
  }

  const checkAndFocusPopper = (e) => {
    if (e.keyCode === 40 && suggestionFirstItem) {
      if (isOpenSuggestion) {
        focusElementInKeyboardMode(suggestionFirstItem?.current, true)
      } else if (isOpenResultPopper) {
        focusElementInKeyboardMode(resultFirstItem?.current, true)
      } else if (openLocationOrRecentSearches) {
        focusElementInKeyboardMode(recentSearchFirstItem?.current, true)
        isFocusLocationAndRecentSearch.current = true
      }
    }
  }

  const inputConKeyup = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const isSuggestionOpen = checkIsOpenSuggestionPopper()
      isFocusSuggestion.current = isSuggestionOpen
      isFocusLocationAndRecentSearch.current = openLocationOrRecentSearches
    }
    if (e.key === 'ArrowDown') {
      //Prevent the container's scrolling when the down arrow is clicked
      e.preventDefault()
    }
    checkAndFocusPopper(e)
  }

  const checkIsOpenSuggestionPopper = () => {
    if (locationLoading) return true
    if (isShowLoading || isOpenResultPopper) return false
    let isOpen = false
    if (config?.maxSuggestions > 0) {
      isOpen = isOpenSuggestion && isHasServiceSupportSuggest
    }

    if (!isOpen) {
      isFocusSuggestion.current = false
    }
    return isOpen
  }

  const handleInputBlur = (e) => {
    inputBlurTimeoutRef.current = setTimeout(() => {
      if (!isFocusSuggestion.current) {
        setIsOpenSuggestion(false)
      }
      if (!locationLoadingRef.current && !isFocusLocationAndRecentSearch.current) {
        toggleLocationOrRecentSearches(false)
      }
    }, 200)
  }

  const toggleSuggestion = () => {
    setIsOpenSuggestion(false)
  }

  const handleLocationLoadingChange = (loading: boolean) => {
    if (!loading) {
      setTimeout(() => {
        setLocationLoading(loading)
        locationLoadingRef.current = loading
      }, 300)
    } else {
      setLocationLoading(loading)
      locationLoadingRef.current = loading
    }
  }

  const checkIsShowLocationOrRecentSearch = React.useCallback(() => {
    if (searchValue) return false

    if (config?.isShowRecentSearches && recentSearchesData && recentSearchesData[0]?.suggestionItem?.length > 0) {
      return true
    }

    if (config?.isUseCurrentLoation) {
      return !locationLoading
    }
    return false
  }, [config, locationLoading, recentSearchesData, searchValue])

  return (
    <div className={`h-100 align-items-center position-relative d-flex flex-grow-1 ${className || ''} arrangement-${config.arrangementStyle}`} css={STYLE}>
      <div className='h-100 flex-grow-1 search-input-con'>
        <div className='h-100 w-100' onKeyDown={inputConKeyup}>
          {isShowSearchInput && <TextInput
            value={searchValue || ''}
            onChange={onChange}
            onFocus={onSearchInputFocus}
            onPressEnter={onKeyUp}
            onBlur={handleInputBlur}
            className={classNames('h-100 w-100', { 'no-border-left': showSearchSetting, 'in-dark-theme': theme?.uri === 'themes/dark/' })}
            allowClear
            prefix={prefix()}
            placeholder={searchPlaceholder}
            title={searchValue || searchPlaceholder}
            ref={searchInputRef}
            aria-label={searchValue || searchPlaceholder}
            autoComplete = 'off'
          />}
        </div>
        {searchValue && <SuggestionList
          canUseOutputDsLength={getCanUseDsLength()}
          isOpen={checkIsOpenSuggestionPopper()}
          reference={reference}
          searchText={searchValue}
          searchSuggestion={searchSuggestion}
          toggle={toggleSuggestion}
          onRecordItemClick={onSuggestionItemClick}
          setSuggestionFirstItem={setSuggestionFirstItem}
          id={id}
          config={config}
          toggleSuggestionUtilityError={toggleSuggestionUtilityError}
          openUtilityErrRemindInSuggestion={openUtilityErrRemindInSuggestion}
          searchInputRef={searchInputRef}
          serviceList={serviceList}
        />}
        {checkIsShowLocationOrRecentSearch() && <LocationAndRecentSearch
          serviceList={getJsonLength(resultServiceList) > 0 ? Immutable(resultServiceList) : serviceList }
          isOpen={openLocationOrRecentSearches || locationLoading}
          reference={reference}
          isGetLocationError={isGetLocationError}
          recentSearchesData={recentSearchesData}
          toggle={toggleSuggestion}
          onRecordItemClick={onSuggestionItemClick}
          clearSearches={clearRecentSearch}
          setSuggestionFirstItem={setRecentSearchFirstItem}
          id={id}
          config={config}
          searchInputRef={searchInputRef}
          locationLoading={locationLoading}
          jimuMapView={jimuMapView}
          handleLocationLoadingChange={handleLocationLoadingChange}
        />}
        <ResultList
          isOpenResultPopper={isOpenResultPopper}
          isToOtherWidget={isToOtherWidget}
          serviceList={Immutable(resultServiceList)}
          config={config}
          dsStatus={dsStatus}
          reference={reference}
          searchText={searchValue}
          id={id}
          setResultFirstItem={setResultFirstItem}
          isOpenResultListDefault={isOpenResultListDefault}
          searchInputRef={searchInputRef}
          searchResult={searchResult}
          selectionList={selectionList}
          openUtilityErrRemindInResult={openUtilityErrRemindInResult}
          handleDsIdOfSelectedResultItemChange={handleDsIdOfSelectedResultItemChange}
          toggleResultUtilityError={toggleResultUtilityError}
          datasourceConfig={datasourceConfig}
          scaleExtent={esriGeometryUtilsRef.current?.scaleExtent}
          Polygon={PolygonClassRef.current}
          Graphic={GraphicClassRef.current}
        />
      </div>

      {renderLoading(isShowLoading, locationLoading)}

      {config.arrangementStyle !== ArrangementStyle.Style2 && <Button
        className='search-button h-100'
        type={config.arrangementStyle === ArrangementStyle.Style3 ? 'tertiary' : 'primary'}
        icon
        aria-label={nls('SearchLabel')}
        onClick={() => { onSearchButtonClick(searchValue) }} title={nls('SearchLabel')}
      >
        <SearchOutlined/>
      </Button>}

      {searchResultView === SearchResultView.OtherWidgets && <div className='search-link-con'>
        <Link
          ref={linkRef}
          to={linkToOption?.linkTo}
          target={linkToOption?.target}
          queryObject={queryObject}
        />
      </div>}
    </div>
  )
}

export default SearchInput
