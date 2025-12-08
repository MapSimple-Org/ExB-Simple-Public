/** @jsx jsx */
import { jsx, React, hooks, DataSourceStatus, classNames, getAppStore, ReactRedux, LayoutItemType, MessageManager, DataSourceFilterChangeMessage, defaultMessages as jimuCoreDefaultMessage, AppMode } from 'jimu-core'
import type { DataSource, DataRecord, UseDataSource, IMState, FeatureLayerDataSource, IMSqlExpression, ImmutableArray } from 'jimu-core'
import { Button, DataActionListStyle, DataActionList, Popper, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { useTheme } from 'jimu-theme'
import defaultMessage from '../../translations/default'
import { LIST_TOOL_MIN_SIZE_NO_DATA_ACTION, LIST_TOOL_MIN_SIZE_DATA_ACTION, LIST_CARD_MIN_SIZE } from '../../../config'
import type { IMConfig, Suggestion } from '../../../config'
import { searchUtils } from 'jimu-layouts/layout-runtime'
import { getToolsPopperStyle, getSearchToolStyle, getTopToolStyle } from '../../styles/style'
import { checkIsShowDataAction, showSearch, checkIsShowListToolsOnly, showSort, showFilter, showDisplaySelectedOnly, showClearSelected } from '../../utils/utils'
import { fetchSuggestionRecords } from '../../utils/list-service'
import SearchBox from './search-box'
import SortSelect from './sort-select'
import FilterPicker from './filter-picker'
import { useListRuntimeState, useListRuntimeDispatch } from '../../state'

import { MenuOutlined } from 'jimu-icons/outlined/editor/menu'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import { ShowSelectionOutlined } from 'jimu-icons/outlined/editor/show-selection'
import { ClearSelectionGeneralOutlined } from 'jimu-icons/outlined/editor/clear-selection-general'
import { MoreHorizontalOutlined } from 'jimu-icons/outlined/application/more-horizontal'
import { RefreshOutlined } from 'jimu-icons/outlined/editor/refresh'

const { useState, useRef, useEffect } = React

interface Props {
  id: string
  selectRecords?: DataRecord[]
  useDataSources: ImmutableArray<UseDataSource>
  config: IMConfig
  isEditing: boolean
  handleRefreshList: (ds: FeatureLayerDataSource) => void
  selectRecordsAndPublishMessageAction: (records: DataRecord[]) => void
  scrollToIndex: (index: number) => void
  updateTopToolsContainer: (ref) => void
}

const TopTools = (props: Props) => {
  const moreButtonRef = useRef(null)
  const listTopRightToolsDivRef = useRef(null)
  const showPopperTimeOutRef = useRef(null)
  const suggestionsQueryTimeoutRef = useRef(null)
  const configRef = useRef(null as IMConfig)
  const theme = useTheme()
  const listRuntimeDispatch = useListRuntimeDispatch()
  const nls = hooks.useTranslation(defaultMessage, jimuUiDefaultMessage, jimuCoreDefaultMessage)

  const listRunTimeState = useListRuntimeState()
  const { searchText, dataSource, showSelectionOnly, widgetRect, queryStatus, filterApplied, currentFilter, showSortString, sortOptionName, showLoading } = useListRuntimeState()
  const browserSizeMode = ReactRedux.useSelector((state: IMState) => state?.browserSizeMode)
  const appMode = ReactRedux.useSelector((state: IMState) => state?.appRuntimeInfo?.appMode)
  const enableDataAction = ReactRedux.useSelector((state: IMState) => state?.appConfig.widgets?.[props.id]?.enableDataAction)

  const { selectRecords, id, config, useDataSources } = props
  const { isEditing, scrollToIndex, handleRefreshList, selectRecordsAndPublishMessageAction, updateTopToolsContainer } = props

  const [listWidth, setListWidth] = useState(null as number)
  const [dataName, setDataName] = useState(null as string)
  const [listToolsMinSize, setListToolsMinSize] = useState(null as number)
  const [searchSuggestion, setSearchSuggestion] = useState([] as Suggestion[])

  const [showToolsWithoutDataAction, setShowToolsWithoutDataAction] = useState(false)
  const [isSearchBoxVisible, setIsSearchBoxVisible] = useState(false)
  const [isOpenTopToolsPopper, setsOpenTopToolsPopper] = useState(false)
  const [isShowDataAction, setIsShowDataAction] = useState(false)

  useEffect(() => {
    listRuntimeDispatch({type: 'SET_SORT_OPTION_NAME', value: config?.sorts?.[0]?.ruleOptionName})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const dataName = nls('listDataActionLabel', { layer: dataSource?.getLabel() || '' })
    setDataName(dataName)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource])

  useEffect(() => {
    const showDataAction = checkIsShowDataAction(id, config, useDataSources?.asMutable({ deep: true }))
    setIsShowDataAction(showDataAction)
  }, [id, config, useDataSources, enableDataAction])

  useEffect(() => {
    setShowToolsWithoutDataAction(checkIsShowListToolsOnly(config))
    updateFilterWhenConfigChange(config)
    updateSortWhenConfigChange(config)
    configRef.current = config
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  useEffect(() => {
    const LIST_TOOL_MIN_SIZE = isShowDataAction ? LIST_TOOL_MIN_SIZE_DATA_ACTION : LIST_TOOL_MIN_SIZE_NO_DATA_ACTION
    setListToolsMinSize(LIST_TOOL_MIN_SIZE)
  }, [isShowDataAction])

  useEffect(() => {
    setListWidth(widgetRect?.width || 620)
  }, [widgetRect])

  useEffect(() => {
    if (appMode !== AppMode.Design) {
      listRuntimeDispatch({type: 'SET_SEARCH_TEXT', value: undefined})
      listRuntimeDispatch({type: 'SET_FILTER_APPLIED', value: undefined})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode])

  const updateFilterWhenConfigChange = (config: IMConfig) => {
    if (config.filterOpen) {
      const filter = config.filter
      const oldFilter = configRef.current?.filter
      if (filter !== oldFilter) {
        listRuntimeDispatch({type: 'SET_FILTER_APPLIED', value: false})
        listRuntimeDispatch({type: 'SET_CURRENT_FILTRE', value: undefined})
      }
    }
  }

  const updateSortWhenConfigChange = (config: IMConfig) => {
    if (config.sortOpen) {
      const sorts = config.sorts
      const oldSorts = configRef.current?.sorts
      if (sorts !== oldSorts) {
        listRuntimeDispatch({type: 'showSortString', value: false})
        listRuntimeDispatch({type: 'SET_SORT_OPTION_NAME', value: undefined})
      }
    }
  }

  const handleShowSelectionClick = hooks.useEventCallback(() => {
    listRuntimeDispatch({type: 'SET_SHOW_SELECTION_ONLY', value: !showSelectionOnly})
  })

  const handleClearSelectionClick = () => {
    listRuntimeDispatch({type: 'SET_SHOW_SELECTION_ONLY', value: false})
    selectRecordsAndPublishMessageAction([])
  }

  const handleSortOptionChange = hooks.useEventCallback((label: string) => {
    const newListRunTimeState = {
      ...listRunTimeState,
      sortOptionName: label,
      showSortString: false,
      page: 1,
      scrollStatus: 'start'
    }
    listRuntimeDispatch({ type: 'SET_LIST_RUNTIME_STATE', value: newListRunTimeState })
    scrollToIndex(0)
  })

  const getAllFieldsOfListAndChildrenWidget = (): string[] => {
    const appConfig = getAppStore().getState()?.appConfig

    const allLayoutsOfCurrentWidget = appConfig?.widgets?.[id]?.layouts || {}
    let layoutIds = Object.keys(allLayoutsOfCurrentWidget).map(key => {
      return allLayoutsOfCurrentWidget[key][browserSizeMode]
    }) || []
    layoutIds = Array.from(new Set(layoutIds))

    let widgetList = []
    layoutIds.forEach(layoutId => {
      const widgets = searchUtils.getContentsInLayoutWithRecursiveLayouts(appConfig, layoutId, LayoutItemType.Widget, browserSizeMode) || []
      widgetList = widgetList.concat(widgets)
    })
    widgetList = Array.from(new Set(widgetList))

    let useFields = []
    widgetList.forEach(widgetId => {
      const fields = appConfig.widgets[widgetId]?.useDataSources?.[0]?.fields || []
      useFields = useFields.concat(fields)
    })

    return Array.from(new Set(useFields))
  }

  const toggleSearchBoxVisible = (isVisible = false) => {
    setIsSearchBoxVisible(isVisible)
    const LIST_TOOL_MIN_SIZE = isShowDataAction ? LIST_TOOL_MIN_SIZE_DATA_ACTION : LIST_TOOL_MIN_SIZE_NO_DATA_ACTION
    if (listWidth < LIST_TOOL_MIN_SIZE) {
      clearTimeout(showPopperTimeOutRef.current)
      showPopperTimeOutRef.current = setTimeout(() => {
        setsOpenTopToolsPopper(true)
      })
    }
  }

  const handleSearchTextChange = searchText => {
    if (searchText === '' || !searchText) {
      handleSearchSubmit(undefined, false)
    }
    setSearchSuggestion([])
    clearTimeout(suggestionsQueryTimeoutRef.current)
    suggestionsQueryTimeoutRef.current = setTimeout(() => {
      getSearchSuggestions(searchText)
    }, 200)
  }

  const getSearchSuggestions = searchText => {
    if (searchText?.length < 3) {
      return false
    }
    fetchSuggestionRecords(searchText, config, dataSource).then(searchSuggestion => {
      setSearchSuggestion(searchSuggestion)
    })
  }

  const handleSearchSubmit = (newSearchText: string, isEnter = false) => {
    const oldSearchText = searchText
    if (oldSearchText === newSearchText && !isEnter) {
      return
    }
    listRuntimeDispatch({ type: 'SET_PAGE', value: 1 })
    listRuntimeDispatch({ type: 'SET_SEARCH_TEXT', value: newSearchText })
    MessageManager.getInstance().publishMessage(new DataSourceFilterChangeMessage(id, [dataSource.id]))
  }

  const getClassNameListToolsWithoutSearchTools = (): string => {
    const listWidth = (widgetRect && widgetRect.width) || LIST_CARD_MIN_SIZE
    if (listWidth > 580) {
      return 'top-right-tools-size-3'
    } else if (listWidth > 480) {
      return 'top-right-tools-size-2'
    } else if (listWidth > 370) {
      return 'top-right-tools-size-1'
    } else {
      return 'top-right-tools-size-0'
    }
  }

  const handleFilterChange = (sqlExprObj: IMSqlExpression) => {
    listRuntimeDispatch({type: 'SET_CURRENT_FILTRE', value: sqlExprObj})
    listRuntimeDispatch({ type: 'SET_PAGE', value: 1 })
    MessageManager.getInstance().publishMessage(new DataSourceFilterChangeMessage(id, [dataSource.id]))
  }

  const handleFilterApplyChange = (applied: boolean) => {
    listRuntimeDispatch({type: 'SET_FILTER_APPLIED', value: applied})
    MessageManager.getInstance().publishMessage(new DataSourceFilterChangeMessage(id, [dataSource.id]))
  }

  const renderListToolsWithoutSearchTools = (ds: DataSource, queryStatus?: DataSourceStatus) => {
    const selectedRecords = ds && ds.getSelectedRecords()
    const hasSelection = selectedRecords && selectedRecords.length > 0
    return (
      <div
        className={classNames('d-flex align-items-center mr-1', getClassNameListToolsWithoutSearchTools())}
        ref={ref => { listTopRightToolsDivRef.current = ref; updateTopToolsContainer(ref) }}
      >
        {showSort(config) && (
          <SortSelect
            sortOptionName={sortOptionName}
            dataSource={ds}
            sorts={config.sorts}
            handleSortOptionChange={handleSortOptionChange}
            id={id}
            showSortString={showSortString}
          />
        )}
        <div className='flex-grow-1 d-flex align-items-center'>
          {showFilter(config) && (
            <FilterPicker
              filter={currentFilter || config.filter}
              filterInConfig={config.filter}
              appMode={appMode}
              applied={filterApplied}
              title={nls('filter')}
              selectedDs={ds}
              handleFilterChange={handleFilterChange}
              handleFilterApplyChange={handleFilterApplyChange}
              formatMessage={nls}
              theme={theme}
              widgetId={id}
            />
          )}
          {
            config?.showRefresh && <Button
              type='tertiary'
              title={nls('refresh')}
              icon
              size='sm'
              className='color-inherit'
              onClick={() => { handleRefreshList(ds as FeatureLayerDataSource) }}
            >
              <RefreshOutlined size={16}/>
            </Button>
          }
          {showDisplaySelectedOnly(config) && (
            <Button
              disabled={!hasSelection}
              type='tertiary'
              title={ showSelectionOnly ? nls('showAll') : nls('showSelection') }
              icon
              size='sm'
              className='color-inherit'
              onClick={handleShowSelectionClick}
            >
              <MenuOutlined className={classNames({'sr-only': !showSelectionOnly})} size={16}/>
              <ShowSelectionOutlined className={classNames({'sr-only': showSelectionOnly})} size={16}/>
            </Button>
          )}
          {showClearSelected(config) && (
            <Button
              disabled={!hasSelection}
              type='tertiary'
              title={nls('clearSelection')}
              icon
              size='sm'
              className='color-inherit'
              onClick={handleClearSelectionClick}
            >
              <ClearSelectionGeneralOutlined size={16}/>
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderSearchTools = (ds: DataSource, queryStatus?: DataSourceStatus) => {
    const toolsDisabled = isEditing || !ds || queryStatus !== DataSourceStatus.Loaded
    const toolLineClassName = listWidth < 360 ? 'ds-tools-line-blue' : ''
    const placeholder = config?.searchHint || nls('search')
    const isShowBackButton = listWidth < 360 && isSearchBoxVisible
    return (
      <div
        className='list-search-div flex-grow-1 h-100'
        css={getSearchToolStyle(theme)}
      >
        {showSearch(config) && (
          <div className='d-flex search-box-content'>
            {(listWidth >= 360 || isSearchBoxVisible) && (
              <div className='flex-grow-1 w-100'>
                <SearchBox
                  theme={theme}
                  placeholder={placeholder}
                  searchText={searchText}
                  onSearchTextChange={handleSearchTextChange}
                  onSubmit={handleSearchSubmit as any}
                  disabled={toolsDisabled}
                  searchSuggestion={searchSuggestion}
                  suggestionWidth={listWidth}
                  showLoading={showLoading}
                  formatMessage={nls}
                  isShowBackButton={isShowBackButton}
                  toggleSearchBoxVisible={toggleSearchBoxVisible}
                  className='list-search'
                  appMode={appMode}
                />
                <div
                  className={classNames('ds-tools-line', toolLineClassName)}
                />
              </div>
            )}
            {listWidth < 360 && !isSearchBoxVisible && (
              <Button
                type='tertiary'
                icon
                size='sm'
                onClick={evt => { toggleSearchBoxVisible(true) }}
                className='color-inherit'
                title={nls('search')}
                aria-label={nls('search')}
              >
                <SearchOutlined size={16}/>
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderListTopToolsInPopper = (
    ds: DataSource,
    queryStatus?: DataSourceStatus
  ) => {
    const toolsDisabled = isEditing
    const listWidth = widgetRect?.width || 620
    const LIST_TOOL_MIN_SIZE = isShowDataAction ? LIST_TOOL_MIN_SIZE_DATA_ACTION : LIST_TOOL_MIN_SIZE_NO_DATA_ACTION
    const isOpen = listWidth < LIST_TOOL_MIN_SIZE && isOpenTopToolsPopper && !toolsDisabled
    return (
      <div>
        <Popper
          placement='bottom-start'
          reference={moreButtonRef.current}
          offsetOptions={[-10, 0]}
          open={isOpen}
          arrowOptions
          hideOptions={false}
          toggle={e => {
            setsOpenTopToolsPopper(!isOpen)
          }}
        >
          <div
            className='tool-row row1 d-flex align-items-center justify-content-between'
            css={getToolsPopperStyle(theme)}
          >
            {renderSearchTools(ds, queryStatus)}
            {!isSearchBoxVisible && renderListToolsWithoutSearchTools(ds, queryStatus)}
          </div>
        </Popper>
      </div>
    )
  }

  const showDataAction = dataSource && isShowDataAction
  return (
    <div className='datasource-tools w-100' css={getTopToolStyle(showToolsWithoutDataAction, theme, (listTopRightToolsDivRef.current?.clientWidth || 0), showDataAction)}>
      <div className="d-flex align-items-center">
        <div className="flex-grow-1 tool-row tools-con-max-size">
          {showToolsWithoutDataAction && <div className='w-100'>
            {listWidth >= listToolsMinSize && (
              <div className='tool-row row1 d-flex w-100 align-items-center justify-content-between'>
                {renderSearchTools(dataSource, queryStatus)}
                {(!isSearchBoxVisible || listWidth >= 360) && renderListToolsWithoutSearchTools(dataSource, queryStatus)}
              </div>
            )}
            {listWidth < listToolsMinSize && (
              <div className='float-right' ref={ref => { moreButtonRef.current = ref }}>
                <Button
                  type='tertiary'
                  icon
                  size='sm'
                  className='tools-menu color-inherit'
                  title={nls('guideStep9Title')}
                  onClick={evt => { setsOpenTopToolsPopper(!isOpenTopToolsPopper) }}
                >
                  <MoreHorizontalOutlined size={16}/>
                </Button>
                {renderListTopToolsInPopper(dataSource, queryStatus)}
              </div>
            )}
          </div>}
        </div>
        {showDataAction && <div className={classNames('list-data-action position-relative', { 'm-left': listWidth < listToolsMinSize })} data-testid="data-action">
          <DataActionList
            widgetId={id}
            dataSets={[{ dataSource: dataSource, records: selectRecords || [], name: dataName, type: 'selected', fields: getAllFieldsOfListAndChildrenWidget() }]}
            listStyle={DataActionListStyle.Dropdown}
            buttonType='tertiary'
            buttonSize='sm'
          />
        </div>}
      </div>
    </div>
  )
}

export default TopTools
