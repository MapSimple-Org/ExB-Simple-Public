/** @jsx jsx */
import {
  React,
  jsx,
  css,
  type ImmutableObject,
  type ImmutableArray,
  type IMSqlExpression,
  DataSourceComponent,
  type DataSource,
  type UseDataSource,
  Immutable,
  type FeatureLayerDataSource,
  classNames,
  CONSTANTS,
  type DataRecord,
  type DataRecordSet,
  type QueryParams,
  DataSourceStatus,
  DataRecordSetChangeMessage,
  DataRecordsSelectionChangeMessage,
  RecordSetChangeType,
  MessageManager,
  MutableStoreManager,
  DataActionManager,
  DataLevel,
  type QueriableDataSource,
  type FeatureLayerQueryParams,
  hooks,
  lodash,
  DataSourceManager,
  focusElementInKeyboardMode,
  ReactRedux,
  type IMState,
  type FeatureDataRecord
} from 'jimu-core'
import { Button, Tooltip, FOCUSABLE_CONTAINER_CLASS, Tabs, Tab, Select, Loading, LoadingType } from 'jimu-ui'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { PagingType, type QueryItemType, type SpatialFilterObj, SelectionType } from '../config'
import { type JimuMapView } from 'jimu-arcgis'
import { QueryTabContent } from './tabs/QueryTabContent'
import { SpatialTabContent } from './tabs/SpatialTabContent'
import { QueryTaskForm } from './query-task-form'
import { QueryTaskResult } from './query-result'
import { DataSourceTip, useDataSourceExists, ErrorMessage } from 'widgets/shared-code/mapsimple-common'
import { QueryTaskLabel } from './query-task-label'
import { useZoomToRecords } from './managers/use-zoom-to-records'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { executeQueryInternal } from './query-execution-handler'
import { executeClearResult } from './query-clear-handler'
import { executeFormSubmit } from './query-submit-handler'
import { executeSpatialQuery, type SpatialQueryResult, convertSpatialResultsToRecords } from './execute-spatial-query'
import { mergeResultsIntoAccumulated, removeResultsFromAccumulated } from './results-management-utils'

import { cleanupGraphicsLayer, cleanupAnyResultLayer, clearAnyResultLayerContents } from './graphics-layer-utils'
import { MenuOutlined } from 'jimu-icons/outlined/editor/menu'
import defaultMessage from './translations/default'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { LoadingResult } from './loading-result'
import { clearSelectionInDataSources, selectRecordsAndPublish, findClearResultsButton, dispatchSelectionEvent, getOriginDataSource, clearAllSelectionsForWidget } from './selection-utils'
import { createQuerySimpleDebugLogger, globalHandleManager } from 'widgets/shared-code/mapsimple-common'
import { queryTaskReducer, INITIAL_STATE } from './query-task-reducer'

const debugLogger = createQuerySimpleDebugLogger()

// Event fired when SqlExpressionRuntime converts hash value from string to array format
const QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT = 'querysimple-hash-value-converted'

export interface QueryTaskProps {
  widgetId: string
  index: number
  total: number
  queryItem: ImmutableObject<QueryItemType>
  wrappedInPopper?: boolean
  hoverPinColor?: string // r022.106: Configurable hover pin color
  className?: string
  isInPopper?: boolean
  onNavBack?: () => void
  initialInputValue?: string
  onHashParameterUsed?: (shortId: string) => void
  queryItemShortId?: string
  // Props for Search Layer dropdown (when multiple queries)
  queryItems?: ImmutableArray<QueryItemType>
  selectedQueryIndex?: number
  onQueryChange?: (index: number) => void
  // Grouping props
  groups?: { [groupId: string]: { items: ImmutableArray<QueryItemType>, displayName: string, icon?: any } }
  ungrouped?: Array<{ item: ImmutableObject<QueryItemType>, index: number }>
  groupOrder?: string[]
  selectedGroupId?: string | null
  selectedGroupQueryIndex?: number
  onGroupChange?: (groupId: string | null) => void
  onGroupQueryChange?: (index: number) => void
  onUngroupedChange?: (index: number) => void
  // Results mode props
  resultsMode?: SelectionType
  onResultsModeChange?: (mode: SelectionType) => void
  accumulatedRecords?: FeatureDataRecord[]
  resultsExtent?: __esri.Extent | null  // r024.74: Cached extent for zoom/pan actions
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
  // Graphics layer props
  graphicsLayer?: __esri.GraphicsLayer
  mapView?: __esri.MapView | __esri.SceneView
  onInitializeGraphicsLayer?: (outputDS: DataSource) => Promise<void>
  onClearGraphicsLayer?: () => void
  onDestroyGraphicsLayer?: () => void // r021.17: Clear refs after destroying layer
  activeTab?: 'query' | 'spatial' | 'results'
  onTabChange?: (tab: 'query' | 'spatial' | 'results') => void
  eventManager?: import('./managers/event-manager').EventManager  // Chunk 7.1: Event Handling Manager
  // r022.105: Configurable zoom on result click
  zoomOnResultClick?: boolean
  // r026.009: Configurable pan on result click
  panOnResultClick?: boolean
  isPanelVisible?: boolean  // r025.013: Buffer preview clear/restore on panel close/open
  jimuMapView?: JimuMapView | null  // r025.041: JimuMapView for JimuDraw in Spatial tab Draw mode
}

// Helper function to get display name for query in dropdown
// Uses: searchAlias || jimuFieldName || item.name || fallback
const getQueryDisplayName = (item: ImmutableObject<QueryItemType>): string => {
  // First priority: searchAlias if set
  if (item.searchAlias) {
    return item.searchAlias
  }
  
  // Second priority: field name from SQL expression
  const jimuFieldName = item.sqlExprObj?.parts?.[0]?.jimuFieldName
  if (jimuFieldName) {
    return jimuFieldName
  }
  
  // Third priority: item name
  if (item.name) {
    return item.name
  }
  
  // Fallback
  return 'Query'
}

const style = css`
  &.wrapped .query-form {
    height: 100%;
  }
  .query-task__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 8px;
    &:has(> .query-form__header > div:not(.d-none)), &:has(> .query-result) {
      padding-top: 16px;
    }
  }
  .query-form__header {
    display: flex;
    &.has-content {
      border-bottom: 1px solid var(--sys-color-divider-secondary);
      margin-bottom: 6px;
      padding-bottom: 8px;
    }
    .nav-action {
      flex: 1 1 0;
      overflow: hidden;
      display: flex;
      .jimu-btn {
        min-width: 26px;
      }
    }
    .result-menu {
      display: flex;
    }
  }
`

export function QueryTask (props: QueryTaskProps) {
  const { queryItem, onNavBack, total, isInPopper = false, wrappedInPopper = false, className = '', index, initialInputValue, onHashParameterUsed, queryItems, selectedQueryIndex, onQueryChange, groups, ungrouped, groupOrder, selectedGroupId, selectedGroupQueryIndex, onGroupChange, onGroupQueryChange, onUngroupedChange, resultsMode, onResultsModeChange, accumulatedRecords, resultsExtent, onAccumulatedRecordsChange, graphicsLayer, mapView, onInitializeGraphicsLayer, onClearGraphicsLayer, onDestroyGraphicsLayer, activeTab: propActiveTab, onTabChange: propOnTabChange, eventManager, zoomOnResultClick, panOnResultClick, hoverPinColor, jimuMapView, ...otherProps } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const zoomToRecords = useZoomToRecords(mapView, props.widgetId)
  // stage now in useReducer (r024.126 — A2b)
  const [internalActiveTab, setInternalActiveTab] = React.useState<'query' | 'spatial' | 'results'>('query')
  // isClearing now in useReducer (r024.127 — A2c)

  // r025.007: Derive unique target layers from configured queryItems for the Spatial tab.
  // Deduplicates by mainDataSourceId (multiple queries can target the same layer).
  const targetLayerOptions = React.useMemo(() => {
    if (!queryItems || queryItems.length === 0) return []

    const seen = new Set<string>()
    const options: Array<{ value: string; label: string }> = []

    queryItems.forEach(item => {
      // Use dataSourceId (registered in DataSourceManager), not mainDataSourceId
      // (group layer children only register under dataSourceId)
      const dsId = item.useDataSource?.dataSourceId
      if (!dsId || seen.has(dsId)) return
      seen.add(dsId)

      const ds = DataSourceManager.getInstance().getDataSource(dsId) as FeatureLayerDataSource
      const label = ds?.layer?.title || ds?.getLabel() || item.name || dsId
      options.push({ value: dsId, label })
    })

    return options
  }, [queryItems])

  // Log when initialInputValue prop is received
  React.useEffect(() => {
    debugLogger.log('HASH-EXEC', {
      event: 'querytask-initialinputvalue-prop-received',
      widgetId: props.widgetId,
      queryItemConfigId: props.queryItem.configId,
      queryItemShortId: props.queryItemShortId,
      hasInitialInputValue: !!props.initialInputValue,
      initialInputValue: props.initialInputValue,
      lastTabSwitchHash: lastTabSwitchHashRef.current,
      timestamp: Date.now()
    })
    
    // FIX (r018.128): Only switch tab ONCE per unique hash value
    // This prevents continuous re-switching that blocks auto-switch to Results tab
    if (props.initialInputValue && lastTabSwitchHashRef.current !== props.initialInputValue) {
      lastTabSwitchHashRef.current = props.initialInputValue
      
      debugLogger.log('HASH-EXEC', {
        event: 'querytask-switching-to-query-tab-for-hash',
        widgetId: props.widgetId,
        initialInputValue: props.initialInputValue,
        currentActiveTab: propActiveTab || internalActiveTab,
        note: 'First time seeing this hash value - switching to Query tab',
        timestamp: Date.now()
      })
      
      if (propOnTabChange) {
        propOnTabChange('query')
      } else {
        setInternalActiveTab('query')
      }
    } else if (!props.initialInputValue && lastTabSwitchHashRef.current !== null) {
      // Reset ref when hash is cleared (allows same hash to trigger again later)
      debugLogger.log('HASH-EXEC', {
        event: 'querytask-resetting-tab-switch-tracking',
        widgetId: props.widgetId,
        previousHash: lastTabSwitchHashRef.current,
        note: 'Hash cleared - resetting tracking so same hash can trigger again',
        timestamp: Date.now()
      })
      lastTabSwitchHashRef.current = null
    }
  }, [props.initialInputValue, props.widgetId, props.queryItem.configId, props.queryItemShortId, propOnTabChange, propActiveTab, internalActiveTab])
  
  // Controlled tab state: use prop if provided, otherwise internal state
  const activeTab = propActiveTab || internalActiveTab
  const setActiveTab = React.useCallback((tab: 'query' | 'spatial' | 'results') => {
    if (propOnTabChange) {
      propOnTabChange(tab)
    } else {
      setInternalActiveTab(tab)
    }
  }, [propOnTabChange])
  const [enabled, setEnabled] = React.useState(true)
  // resultCount now in useReducer (r024.126 — A2b)
  // FIX (r018.92): Track when a query switch is in progress to prevent handleRenderDone interference
  const isQuerySwitchInProgressRef = React.useRef(false)
  // r021.75: Track IDs of records from current query (for proper formatting in ADD mode)
  const currentQueryRecordIdsRef = React.useRef<string[]>([])
  // Track if we've already selected records for the current query results
  const hasSelectedRecordsRef = React.useRef(false)
  // FIX (r018.128): Track which hash value we last switched tabs for to prevent continuous re-switching
  const lastTabSwitchHashRef = React.useRef<string | null>(null)
  // Track query execution count to force QueryTaskResult remount on new queries
  const queryExecutionKeyRef = React.useRef(0)
  const queryParamRef = React.useRef<QueryParams>(null)
  const recordsRef = React.useRef<DataRecord[]>(null)
  // outputDS now in useReducer (r024.127 — A2c)
  const [dataSource, setDataSource] = React.useState<DataSource>(null)
  const [spatialFilterEnabled, setSpatialFilterEnabled] = React.useState(true)
  
  // r024.125-127: Consolidated state via useReducer (query-task-reducer.ts)
  // A2a: selectionError, zoomError, queryErrorAlert, noResultsAlert, allDuplicatesAlert, noRemovalAlert
  // A2b: stage, resultCount, queryJustExecuted
  // A2c: isClearing, outputDS, dsRecreationKey
  const [state, dispatch] = React.useReducer(queryTaskReducer, INITIAL_STATE)
  const { selectionError, zoomError, queryErrorAlert, noResultsAlert, allDuplicatesAlert, noRemovalAlert, stage, resultCount, queryJustExecuted, isClearing, outputDS, dsRecreationKey } = state
  const attributeFilterSqlExprObj = React.useRef<IMSqlExpression>(queryItem.sqlExprObj)
  const spatialFilterObj = React.useRef(null)
  const backBtnRef = React.useRef<HTMLButtonElement>(undefined)
  
  // r022.22: Track the count from the MOST RECENT query execution (not accumulated count)
  // This allows auto-tab-switch to distinguish between "query returned 0" vs "accumulated records exist"
  const lastQueryResultCountRef = React.useRef<number>(0)
  
  // dsRecreationKey now in useReducer (r024.127 — A2c)
  
  const [dataActionFilter, setDataActionFilter] = React.useState(null)
  const previousConfigIdRef = React.useRef<string>(queryItem.configId)
  // Track manual tab switches to prevent auto-switch useEffect from interfering
  const manualTabSwitchRef = React.useRef(false)
  // r025.031: Track which tab ('query' | 'spatial') initiated the last query for Results back button
  const lastQueryOriginTabRef = React.useRef<'query' | 'spatial'>('query')
  // queryJustExecuted now in useReducer (r024.126 — A2b)
  // Store the last runtime zoom override value from the form for use by Add to Map action
  const lastRuntimeZoomToSelectedRef = React.useRef<boolean | undefined>(undefined)
  // selectionError and zoomError now in useReducer (r024.125)
  // Store pending query when waiting for hash value conversion
  const pendingHashQueryRef = React.useRef<{
    sqlExpr: IMSqlExpression
    spatialFilter: SpatialFilterObj
    runtimeZoomToSelected?: boolean
  } | null>(null)
  
  // r021.31: Store pending query when waiting for DS recreation after Clear button click
  // Part of destroy-click-callback pattern (DO NOT REMOVE - see line ~2150 for full docs)
  // Stores query parameters in handleFormSubmit, executed by handleOutputDataSourceCreated callback
  const pendingQueryAfterClearRef = React.useRef<{
    sqlExpr: IMSqlExpression
    spatialFilter: SpatialFilterObj
    runtimeZoomToSelected?: boolean
  } | null>(null)
  
  // r021.31: Prevent infinite loops when programmatically clicking Clear button
  // Part of destroy-click-callback pattern (DO NOT REMOVE - see line ~2150 for full docs)
  // Set to true when entering workflow, prevents re-triggering if callback calls handleFormSubmit again
  const isRetryAfterClearRef = React.useRef<boolean>(false)

  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const { icon, name, displayLabel } = currentItem
  const dsExists: boolean = useDataSourceExists({ widgetId: props.widgetId, useDataSourceId: currentItem.useDataSource?.dataSourceId })

  // Debug logging for tab content rendering
  React.useEffect(() => {
    debugLogger.log('TASK', {
      event: 'query-tab-content-render',
      activeTab,
      enabled,
      dsExists,
      dataSource: dataSource ? 'exists' : 'null',
      queryItemConfigId: queryItem.configId,
      note: 'Query tab content state check'
    })
  }, [activeTab, enabled, dsExists, dataSource, queryItem.configId])

  // Debug logging for Tab children rendering
  React.useEffect(() => {
    if (activeTab === 'query') {
      debugLogger.log('TASK', {
        event: 'query-tab-children-render',
        activeTab,
        queryItemConfigId: queryItem.configId,
        note: 'Query Tab children should be rendering'
      })
    }
  }, [activeTab, queryItem.configId])

  hooks.useEffectOnce(() => {
    // focus the back button when it is rendered
    focusElementInKeyboardMode(backBtnRef.current)
  })

  // Get the pagination style from widget config (MultiPage or LazyLoad/Single-page)
  const pagingTypeInConfig = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[props.widgetId]
    return widgetJson.config.resultPagingStyle
  })

  // Get the initial page size for single-page (LazyLoad) results
  // This allows users to configure how many records are loaded initially when using single-page mode
  // Defaults to 100 if not configured
  const lazyLoadInitialPageSize = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[props.widgetId]
    return widgetJson.config.lazyLoadInitialPageSize
  })


  // Watch for when results are ready and switch to Results tab
  // ONLY auto-switch when a query was just executed and results are loaded
  React.useEffect(() => {
    // Don't auto-switch if user manually switched tabs
    if (manualTabSwitchRef.current) {
      debugLogger.log('TASK', {
        event: 'auto-switch-skipped',
        reason: 'manual-tab-switch-flag-set',
        widgetId: props.widgetId,
        queryItemConfigId: queryItem.configId,
        activeTab,
        resultCount,
        queryJustExecuted,
        timestamp: Date.now()
      })
      return
    }
    
    // FORCED: Always use SimpleList - we're done with lazy loading issues
    // Records are available immediately, so we can switch as soon as resultCount > 0
    const isSimpleList = true
    
    // ONLY auto-switch when:
    // 1. A query was just executed (queryJustExecuted === true)
    // 2. We have results (resultCount > 0)
    // 3. Records are actually loaded:
    //    - For SimpleList: resultCount > 0 is sufficient (records available immediately)
    //    - For LazyLoad: recordsRef.current must have data (wait for lazy loading)
    // 4. We're currently on the query tab (don't switch if already on results)
    const hasRecords = isSimpleList 
      ? resultCount > 0 
      : (recordsRef.current && recordsRef.current.length > 0)
    
    debugLogger.log('TASK', {
      event: 'auto-switch-check',
      widgetId: props.widgetId,
      queryItemConfigId: queryItem.configId,
      activeTab,
      resultCount,
      lastQueryResultCount: lastQueryResultCountRef.current,
      queryJustExecuted,
      isSimpleList,
      pagingTypeInConfig,
      hasRecords,
      recordsRefLength: recordsRef.current?.length || 0,
      manualTabSwitchRef: manualTabSwitchRef.current,
      willAutoSwitch: queryJustExecuted && lastQueryResultCountRef.current > 0 && hasRecords && (activeTab === 'query' || activeTab === 'spatial'),
      timestamp: Date.now()
    })

    // r022.22: Check lastQueryResultCountRef (current query's results) not resultCount (accumulated)
    // This prevents auto-switch when query returns 0 but accumulated records exist (Add mode bug)
    // r025.031: Also auto-switch from spatial tab after spatial query execution
    if (queryJustExecuted &&
        lastQueryResultCountRef.current > 0 &&
        hasRecords &&
        (activeTab === 'query' || activeTab === 'spatial')) {
      debugLogger.log('TASK', {
        event: 'auto-switch-triggered',
        widgetId: props.widgetId,
        queryItemConfigId: queryItem.configId,
        fromTab: activeTab,
        toTab: 'results',
        resultCount,
        timestamp: Date.now()
      })
      setActiveTab('results')
      dispatch({ type: 'SET_QUERY_EXECUTED', payload: false }) // Reset after switching
      debugLogger.log('TASK', {
        event: 'auto-switch-completed',
        widgetId: props.widgetId,
        queryItemConfigId: queryItem.configId,
        queryJustExecutedReset: false,
        timestamp: Date.now()
      })
    }
  }, [resultCount, activeTab, pagingTypeInConfig, queryJustExecuted])

  // Verify dropdowns are synchronized with hash parameter when present
  // This is especially important for grouped queries where dropdowns need to be synchronized
  React.useEffect(() => {
    // Only verify if we have a hash parameter
    if (!initialInputValue || !queryItem.shortId) {
      return
    }
    
    // Verify the current queryItem matches what we expect from hash parameter
    const expectedShortId = queryItem.shortId
    const isGroupedQuery = queryItem.groupId !== null && queryItem.groupId !== undefined
    
    // Check if dropdowns are correctly set for grouped queries
    if (isGroupedQuery) {
      const expectedGroupId = queryItem.groupId
      const actualGroupId = selectedGroupId
      const expectedQueryIndex = selectedGroupQueryIndex
      
      if (expectedGroupId !== actualGroupId) {
        debugLogger.log('GROUP', {
          event: 'dropdown-group-mismatch',
          expectedGroupId,
          actualGroupId,
          queryItemShortId: expectedShortId,
          warning: 'First dropdown may not be synchronized with hash parameter'
        })
      } else if (expectedQueryIndex !== undefined) {
        // Verify the query index within the group matches
        const groupItems = groups?.[expectedGroupId]?.items
        if (groupItems && groupItems.length > expectedQueryIndex) {
          const expectedQueryConfigId = groupItems[expectedQueryIndex]?.configId
          const actualQueryConfigId = queryItem.configId
          if (expectedQueryConfigId !== actualQueryConfigId) {
            debugLogger.log('GROUP', {
              event: 'dropdown-query-index-mismatch',
              expectedQueryConfigId,
              actualQueryConfigId,
              expectedQueryIndex,
              queryItemShortId: expectedShortId,
              warning: 'Second dropdown may not be synchronized with hash parameter'
            })
          } else {
            debugLogger.log('GROUP', {
              event: 'dropdowns-synchronized',
              queryItemShortId: expectedShortId,
              groupId: expectedGroupId,
              selectedGroupQueryIndex: expectedQueryIndex,
              note: 'Dropdowns synchronized with hash parameter'
            })
          }
        }
      }
    } else {
      // Ungrouped query - verify it's selected
      debugLogger.log('GROUP', {
        event: 'dropdowns-synchronized-ungrouped',
        queryItemShortId: expectedShortId,
        note: 'Ungrouped query dropdown synchronized with hash parameter'
      })
    }
  }, [initialInputValue, queryItem.shortId, queryItem.groupId, queryItem.configId, selectedGroupId, selectedGroupQueryIndex, groups])

  const useOutputDs: ImmutableObject<UseDataSource> = React.useMemo(
    () =>
      Immutable({
        dataSourceId: queryItem.outputDataSourceId,
        mainDataSourceId: queryItem.outputDataSourceId
      }),
    [queryItem.outputDataSourceId]
  )

  const updateDataSource = React.useCallback((ds?: DataSource) => {
    const currentDs = ds ?? dataSource
    // should disable spatial filter if the dataSource is an output ds and it already has spatial filter
    if (currentDs?.getDataSourceJson()?.isOutputFromWidget) {
      const qDs: QueriableDataSource = currentDs as QueriableDataSource
      const qParams = qDs.getCurrentQueryParams?.() as FeatureLayerQueryParams
      if (qParams.geometry != null) {
        setSpatialFilterEnabled(false)
      } else {
        setSpatialFilterEnabled(true)
      }
    }
  }, [dataSource])

  const handleStatusChange = React.useCallback((enabled: boolean) => {
    setEnabled(enabled)
    updateDataSource()
  }, [updateDataSource])

  const handleOutputDataSourceInfoChange = React.useCallback((info, preInfo) => {
    const outputId = queryItem.outputDataSourceId
    const filter = info?.widgetQueries ? info.widgetQueries[`setFilter-${outputId}`] : null
    if (filter == null) { // filter is null means there are incomplete queries, ignore this change
      return
    }
    const preFilter = preInfo?.widgetQueries ? preInfo.widgetQueries[`setFilter-${outputId}`] : null
    if (filter?.where !== preFilter?.where) {
      setDataActionFilter(filter)
    }
  }, [queryItem.outputDataSourceId])

  const publishDataClearedMsg = React.useCallback(async () => {
    if (!outputDS) return
    const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(props.widgetId, RecordSetChangeType.Remove, [outputDS.id])
    MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
    await MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(props.widgetId, [], [outputDS.id]))
  }, [props.widgetId, outputDS])

  /**
   * Clears all query results from the UI and map.
   * Delegates to executeClearResult (query-clear-handler.ts).
   */
  const clearResult = React.useCallback(async (reason: string = 'unknown', returnTab?: 'query' | 'spatial' | 'results') => {
    await executeClearResult({
      dispatch, outputDS, queryExecutionKeyRef, recordsRef,
      hasSelectedRecordsRef, currentQueryRecordIdsRef, lastQueryResultCountRef,
      widgetId: props.widgetId,
      queryItemConfigId: queryItem.configId,
      accumulatedRecords, graphicsLayer, mapView,
      eventManager: props.eventManager,
      onAccumulatedRecordsChange, onDestroyGraphicsLayer,
      setActiveTab, returnTab
    }, reason)
  }, [outputDS, publishDataClearedMsg, props.widgetId, queryItem.configId, onAccumulatedRecordsChange, graphicsLayer, mapView, props.eventManager])

  /**
   * Handles data source creation when switching between query items.
   * When a new query item is selected (e.g., switching from Parcel to Major),
   * this clears old results to ensure all cleanup logic runs properly.
   * 
   * @param ds - The newly created data source for the selected query item
   */
  const handleDataSourceCreated = React.useCallback(async (ds: DataSource) => {
    debugLogger.log('TASK', {
      event: 'handleDataSourceCreated-start',
      widgetId: props.widgetId,
      resultsMode,
      timestamp: Date.now()
    })

    // In "Add to" and "Remove from" modes, preserve accumulated records and selection - don't clear
    if ((resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection) 
        && accumulatedRecords && accumulatedRecords.length > 0) {
      debugLogger.log('RESULTS-MODE', {
        event: 'preserving-selection-on-query-switch-handleDataSourceCreated',
        widgetId: props.widgetId,
        resultsMode,
        accumulatedRecordsCount: accumulatedRecords.length
      })
      
      setDataSource(ds)
      updateDataSource(ds)
      dispatch({ type: 'SET_STAGE', payload: 0 })
      setActiveTab('query')
      return // Skip clearing - preserve selection
    }
    
    // For "New" mode, clear old results
    debugLogger.log('TASK', {
      event: 'handleDataSourceCreated-clearing-results-for-new-mode',
      widgetId: props.widgetId,
      timestamp: Date.now()
    })
    await clearResult('handleDataSourceCreated-new-mode')

    setDataSource(ds)
    updateDataSource(ds)
    dispatch({ type: 'SET_STAGE', payload: 0 })
    setActiveTab('query') // Return to Query tab when switching queries
  }, [updateDataSource, clearResult, resultCount, resultsMode, accumulatedRecords, props.widgetId])

  const handleOutputDataSourceCreated = React.useCallback(async (ds: DataSource) => {
    dispatch({ type: 'SET_OUTPUT_DS', payload: ds })

    // ============================================================================
    // r021.51: EXECUTE PENDING QUERY AFTER DS RECREATION (Part 2 of 2)
    // ============================================================================
    //
    // This callback executes the pending query that was stored in handleFormSubmit.
    // It fires after DataSourceComponent remounts due to key prop change (r021.51).
    //
    // FLOW:
    //   1. User clicks Apply in handleFormSubmit with existing results
    //   2. Query stored in pendingQueryAfterClearRef
    //   3. DS destroyed manually
    //   4. dsRecreationKey incremented → forces DataSourceComponent remount (r021.51)
    //   5. React unmounts old DataSourceComponent → mounts new one
    //   6. New DataSourceComponent creates fresh OutputDataSource
    //   7. **THIS CALLBACK FIRES** ← You are here
    //   8. setTimeout waits 300ms for React/ESRI to fully stabilize
    //   9. Pending query executes with fresh DS
    //
    // WHY SETTIMEOUT IS REQUIRED:
    //   - DataSourceComponent just created the DS, but React may still be processing updates
    //   - ESRI may still be initializing internal observers and caches
    //   - Executing query IMMEDIATELY can cause timing issues and incomplete cleanup
    //   - 300ms allows both React and ESRI to fully settle before query execution
    //
    // 300MS DELAY TIMING RATIONALE (from systematic testing r021.31-35):
    //   - 100ms: 22.46 MB/query (62% variance) - Too erratic, React not fully settled
    //   - 200ms: 22.13 MB/query (14% variance) - Better but still some instability
    //   - 300ms: 18.92 MB/query (9% variance) - OPTIMAL ✅ Best performance + consistency
    //   - 400ms: 19.68 MB/query (11% variance) - Slightly worse, no benefit
    //   - 500ms: 19.13 MB/query (4% variance) - Most stable but worse performance
    //   - 1000ms: 19.27 MB/query (7% variance) - Diminishing returns, poor UX
    //
    // DO NOT REMOVE SETTIMEOUT:
    //   - Without it, query executes before React finishes state propagation
    //   - Results in orphaned references and memory accumulation
    //   - Tested extensively - this is the optimal balance
    //
    // DO NOT CHANGE DELAY WITHOUT TESTING:
    //   - Must test with memory-leak-same-query.spec.ts (multiple runs)
    //   - Must test with HUMAN INTERACTION (Playwright can mask timing issues)
    //   - Must verify no double-click bug
    //   - Must verify memory performance vs baseline (25.89 MB/query)
    //
    // ============================================================================
    
    if (pendingQueryAfterClearRef.current) {
      const { sqlExpr, spatialFilter, runtimeZoomToSelected } = pendingQueryAfterClearRef.current
      pendingQueryAfterClearRef.current = null // Clear pending query immediately to prevent re-execution
      
      debugLogger.log('TASK', {
        event: 'r021.51-executing-pending-query-after-ds-recreation',
        widgetId: props.widgetId,
        newDSId: ds.id,
        note: 'DS recreated via key prop remount (r021.51), executing stored query after 300ms settle time',
        timestamp: Date.now()
      })
      
      // Reset retry flag so future queries can trigger this workflow again
      isRetryAfterClearRef.current = false
      
      // ⚠️ CRITICAL: setTimeout with 300ms delay
      // DO NOT execute query immediately - React and ESRI need time to stabilize
      // DO NOT reduce delay below 300ms - causes erratic memory behavior
      // DO NOT remove setTimeout - causes orphaned references and memory leaks
      setTimeout(() => {
        debugLogger.log('TASK', {
          event: 'r021.51-executing-query-after-settle-period',
          widgetId: props.widgetId,
          newDSId: ds.id,
          settleTimeMs: 300,
          note: 'React and ESRI settled (r021.51 key prop remount), executing query with fresh DS',
          timestamp: Date.now()
        })
        handleFormSubmit(sqlExpr, spatialFilter, runtimeZoomToSelected)
      }, 300)
      
      return // Exit callback - setTimeout will execute query asynchronously
    }
    
    // ============================================================================
    // END OF r021.31 PENDING QUERY EXECUTION
    // ============================================================================
    
    // Detect query switch for logging
    const isSwitchingQueries = previousConfigIdRef.current !== queryItem.configId
    const oldConfigId = previousConfigIdRef.current
    
    // FIX (r018.93): Set query switch flag IMMEDIATELY when query switch is detected
    // This prevents handleRenderDone from running before the query switch re-selection logic
    // The flag must be set BEFORE any rendering happens that could trigger handleRenderDone
    if (isSwitchingQueries && (resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection)) {
      if (accumulatedRecords && accumulatedRecords.length > 0) {
        isQuerySwitchInProgressRef.current = true
        
        debugLogger.log('RESULTS-MODE', {
          event: 'query-switch-detected-setting-flag-early',
          widgetId: props.widgetId,
          oldConfigId,
          newConfigId: queryItem.configId,
          resultsMode,
          accumulatedRecordsCount: accumulatedRecords.length,
          flagSet: true,
          timestamp: Date.now()
        })
      }
    }
    
    // r023.9: Removed verbose query-switch verification logging and rootDataSource map inspection
    // These were diagnostic tools from earlier debugging sessions, no longer needed
    
    // Initialize graphics layer lazily if not already initialized
    if (onInitializeGraphicsLayer) {
      await onInitializeGraphicsLayer(ds)
      // After initialization, graphicsLayer and mapView props should be updated
      // But since props come from refs, we need to wait for widget re-render
      // For now, use the props that will be updated on next render
    }
    
    // r023.9: SIMPLIFIED query switch reselection block
    // Previously 372 lines. Reduced to essentials: update output DS, records ref, and clear flag.
    // Removed: graphics clearing (neutered), origin layer filtering (not needed for output DS),
    // selectRecordsAndPublish (overkill with both skip flags), URL hash cleanup, verification logging.
    if ((resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection) 
        && accumulatedRecords && accumulatedRecords.length > 0) {
      
      // Delay to ensure the new output DS is fully ready after widget re-render
      const delay = onInitializeGraphicsLayer ? 200 : 100
      setTimeout(() => {
        const featureDS = ds as FeatureLayerDataSource
        if (featureDS && accumulatedRecords && accumulatedRecords.length > 0) {
          const allRecordIds = accumulatedRecords.map(r => r.getId())
          
          // Update output DS with ALL accumulated records (cross-layer) for Results tab borders
          if (typeof featureDS.selectRecordsByIds === 'function') {
            featureDS.selectRecordsByIds(allRecordIds, accumulatedRecords)
          }
          
          // Update Results tab display
          recordsRef.current = accumulatedRecords
          dispatch({ type: 'SET_RESULT_COUNT', payload: accumulatedRecords.length })
          
          // Clear the query switch flag so handleDataSourceInfoChange resumes normal operation
          isQuerySwitchInProgressRef.current = false
          
          debugLogger.log('RESULTS-MODE', {
            event: 'query-switch-output-ds-updated',
            widgetId: props.widgetId,
            outputDSId: featureDS.id,
            recordCount: allRecordIds.length,
            graphicsCount: graphicsLayer?.graphics?.length || 0,
            timestamp: Date.now()
          })
        }
      }, delay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultsMode, accumulatedRecords, props.widgetId, onInitializeGraphicsLayer, graphicsLayer, onClearGraphicsLayer, mapView, queryItem.configId, onAccumulatedRecordsChange])
  // Note: handleFormSubmit is called via setTimeout from pending query execution but not included in deps
  // to avoid circular dependency (handleFormSubmit is defined after this callback)

  // Clear results when query item changes (e.g., when new hash parameter triggers different query)
  React.useEffect(() => {
    // Only clear if we're actually switching to a different query (not just re-rendering)
    const isSwitchingQueries = previousConfigIdRef.current !== queryItem.configId
    
    // Only clear results when switching queries if we're in "New" mode
    // In "Add to" and "Remove from" modes, we want to preserve accumulated records across query switches
    if (isSwitchingQueries && resultCount > 0 && resultsMode === SelectionType.NewSelection) {
      // Store the old configId before updating
      const oldConfigId = previousConfigIdRef.current
      // Update the ref to track the new query
      previousConfigIdRef.current = queryItem.configId
      
      debugLogger.log('RESULTS-MODE', {
        event: 'clearing-results-on-query-switch-new-mode',
        widgetId: props.widgetId,
        oldConfigId,
        newConfigId: queryItem.configId,
        resultsMode
      })
      
      // Clear immediately when switching queries, but wrap in try-catch to handle
      // race conditions with feature info windows that might be rendering
      try {
        clearResult('query-item-switch-new-mode')
      } catch (error) {
        // Log for debugging but don't show to user (framework race condition)
        // The error is in framework code (feature-info.tsx), not our code
        // This can happen if feature-info.tsx is trying to appendChild to a DOM element
        // that gets removed when we clear selection
        debugLogger.log('TASK', {
          event: 'clear-result-race-condition',
          error: error instanceof Error ? error.message : String(error),
          note: 'Likely race condition with feature-info.tsx'
        })
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error clearing results (likely race condition with feature info):', error)
        }
        // Don't set error state - this is expected in some scenarios
      }
    } else if (isSwitchingQueries) {
      // Store the old configId BEFORE updating the ref
      const oldConfigId = previousConfigIdRef.current
      
      // DIAGNOSTIC LOGGING: Full state BEFORE sync
      if (resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection) {
        if (outputDS && accumulatedRecords && accumulatedRecords.length > 0) {
          const actuallySelectedRecordsBeforeSync = outputDS.getSelectedRecords() as FeatureDataRecord[] || []
          const accumulatedIds = accumulatedRecords.map(r => r.getId())
          const actuallySelectedIdsBeforeSync = actuallySelectedRecordsBeforeSync.map(r => r.getId())
          // r018.78: Use 'recordId' attribute - that's how graphics-layer-utils stores them
          const graphicsLayerIds = graphicsLayer?.graphics?.map(g => g.attributes?.recordId) || []
          
          debugLogger.log('RESULTS-MODE', {
            event: 'query-switch-before-sync-full-state',
            widgetId: props.widgetId,
            oldConfigId,
            newConfigId: queryItem.configId,
            accumulatedRecordsCount: accumulatedRecords.length,
            accumulatedIds: accumulatedIds,
            outputDSSelectedCount: actuallySelectedRecordsBeforeSync.length,
            outputDSSelectedIds: actuallySelectedIdsBeforeSync,
            graphicsLayerCount: graphicsLayer?.graphics?.length || 0,
            graphicsLayerIds: graphicsLayerIds,
            recordsOutOfSync: accumulatedIds.length !== actuallySelectedIdsBeforeSync.length,
            idsMatch: JSON.stringify(accumulatedIds.sort()) === JSON.stringify(actuallySelectedIdsBeforeSync.sort()),
            timestamp: Date.now()
          })
        }
      }
      
      // r023.8: REMOVED destructive sync block (lines 1379-1442)
      // This block computed syncedRecords but never called onAccumulatedRecordsChange(syncedRecords)
      // It was neutered in r022.29 to fix query switch purging, leaving only diagnostic logs
      // With automatic selection removed, this entire block is dead code
      
      if (resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection) {
        debugLogger.log('RESULTS-MODE', {
          event: 'preserving-accumulated-records-on-query-switch',
          widgetId: props.widgetId,
          resultsMode,
          oldConfigId,
          newConfigId: queryItem.configId,
          accumulatedRecordsCount: accumulatedRecords?.length || 0
        })
      }
      
      // Update the ref AFTER syncing
      previousConfigIdRef.current = queryItem.configId
    }
  }, [queryItem.configId, clearResult, resultCount, resultsMode, accumulatedRecords, props.widgetId, outputDS, onAccumulatedRecordsChange])

  const navToForm = React.useCallback(async (clearResults = false) => {
    if (clearResults) {
      // Use the centralized clearResult method instead of duplicating logic
      await clearResult('navToForm-clearResults')
      return
    }
    // Switch to origin tab (query or spatial) but don't clear results unless explicitly requested
    // Mark as manual switch to prevent auto-switch useEffect from interfering
    manualTabSwitchRef.current = true
    setActiveTab(lastQueryOriginTabRef.current)
    // Reset the flag after a short delay
    setTimeout(() => {
      manualTabSwitchRef.current = false
    }, 100)
    // Only change stage if we're clearing results
    // Otherwise, keep stage at 1 (results available) so results persist
    if (!clearResults && resultCount > 0) {
      dispatch({ type: 'SET_STAGE', payload: 1 }) // Keep results available
    }
    lodash.defer(() => {
      focusElementInKeyboardMode(backBtnRef.current)
    })
  }, [clearResult, resultCount])

  /**
   * Handles tab switching between Query and Results tabs.
   * Tab switching preserves results state - results remain visible and selected
   * when switching between tabs. Results are only cleared when explicitly
   * clicking the trash can button or when starting a new query.
   * 
   * @param tab - The tab to switch to ('query' | 'spatial' | 'results')
   * @param event - Optional mouse event to prevent default behavior
   */
  const handleTabChange = React.useCallback((tab: 'query' | 'spatial' | 'results', event?: React.MouseEvent) => {
    debugLogger.log('TASK', {
      event: 'tab-change',
      tab,
      currentTab: activeTab,
      resultCount,
      eventType: event?.type
    })
    
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    // Don't allow switching to results if there are no results AND no accumulated records
    if (tab === 'results' && resultCount === 0 && (!accumulatedRecords || accumulatedRecords.length === 0)) {
      debugLogger.log('TASK', {
        event: 'tab-change-blocked',
        reason: 'no-results-and-no-accumulated',
        tab,
        resultCount,
        accumulatedRecordsCount: accumulatedRecords?.length || 0
      })
      return
    }
    
    // Mark this as a manual switch to prevent auto-switch useEffect from interfering
    manualTabSwitchRef.current = true
    setActiveTab(tab)
    
    // Reset the flag after a short delay to allow the state update to complete
    // This prevents the auto-switch useEffect from immediately switching back
    setTimeout(() => {
      manualTabSwitchRef.current = false
    }, 100)
    
    // Don't change stage here - just switch the view
    // Stage should remain at 1 (results available) when switching between tabs
  }, [resultCount, activeTab])

  /**
   * Internal implementation of handleFormSubmit.
   * Delegates to executeQueryInternal (query-execution-handler.ts).
   *
   * @param sqlExpr - The SQL expression for attribute filtering
   * @param spatialFilter - The spatial filter object
   * @param runtimeZoomToSelected - Optional runtime override for zoom-to-selected behavior
   */
  const handleFormSubmitInternal = React.useCallback(async (sqlExpr: IMSqlExpression, spatialFilter: SpatialFilterObj, runtimeZoomToSelected?: boolean) => {
    // r025.031: Track origin tab for Results back button
    lastQueryOriginTabRef.current = 'query'
    await executeQueryInternal({
      dispatch, outputDS, queryExecutionKeyRef, pendingQueryAfterClearRef,
      lastRuntimeZoomToSelectedRef, attributeFilterSqlExprObj, spatialFilterObj,
      currentQueryRecordIdsRef, hasSelectedRecordsRef, recordsRef,
      lastQueryResultCountRef, queryParamRef,
      widgetId: props.widgetId,
      queryItem, queryItems, currentItem, resultsMode, accumulatedRecords,
      graphicsLayer, mapView, eventManager, initialInputValue,
      onAccumulatedRecordsChange, onHashParameterUsed,
      clearResult, zoomToRecords
    }, sqlExpr, spatialFilter, runtimeZoomToSelected)
  }, [currentItem, queryItem, props.widgetId, outputDS, publishDataClearedMsg, clearResult, resultsMode, accumulatedRecords, onAccumulatedRecordsChange, onClearGraphicsLayer, mapView, zoomToRecords])

  // Listen for hash value conversion event and execute pending query
  React.useEffect(() => {
    const handleHashValueConverted = (event: CustomEvent) => {
      debugLogger.log('TASK', {
        event: 'hash-value-converted-event-received',
        widgetId: props.widgetId,
        eventWidgetId: event.detail?.widgetId,
        eventConfigId: event.detail?.configId,
        matchesWidget: event.detail?.widgetId === props.widgetId,
        hasPendingQuery: !!pendingHashQueryRef.current,
        timestamp: Date.now()
      })
      
      // Only process events for this widget
      if (event.detail?.widgetId !== props.widgetId) {
        debugLogger.log('TASK', {
          event: 'hash-value-converted-event-ignored-wrong-widget',
          widgetId: props.widgetId,
          eventWidgetId: event.detail?.widgetId,
          timestamp: Date.now()
        })
        return
      }
      
      if (pendingHashQueryRef.current) {
        debugLogger.log('TASK', {
          event: 'hash-value-converted-executing-pending-query',
          widgetId: props.widgetId,
          configId: event.detail.configId,
          initialInputValue: event.detail.initialInputValue,
          timestamp: Date.now()
        })
        
        const { sqlExpr, spatialFilter, runtimeZoomToSelected } = pendingHashQueryRef.current
        pendingHashQueryRef.current = null
        
        // Execute the pending query now that value is converted
        // Use setTimeout to ensure this happens after the current event loop
        setTimeout(() => {
          handleFormSubmitInternal(sqlExpr, spatialFilter, runtimeZoomToSelected)
        }, 0)
      } else {
        // Conversion happened before handleFormSubmit was called
        // applyQuery() is called directly from handleSqlExprObjChange in query-task-form.tsx
        debugLogger.log('TASK', {
          event: 'hash-value-converted-event-received-no-pending-query',
          widgetId: props.widgetId,
          configId: event.detail?.configId,
          initialInputValue: event.detail?.initialInputValue,
          note: 'Conversion happened before handleFormSubmit - applyQuery() called directly from form component',
          timestamp: Date.now()
        })
      }
    }
    
    document.addEventListener(QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT, handleHashValueConverted as EventListener)
    
    return () => {
      document.removeEventListener(QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT, handleHashValueConverted as EventListener)
    }
  }, [props.widgetId, handleFormSubmitInternal])

  /**
   * Handles form submission when user clicks "Apply" button.
   * Delegates to executeFormSubmit (query-submit-handler.ts).
   */
  const handleFormSubmit = React.useCallback(async (sqlExpr: IMSqlExpression, spatialFilter: SpatialFilterObj, runtimeZoomToSelected?: boolean) => {
    await executeFormSubmit({
      dispatch, outputDS, dsRecreationKey,
      isRetryAfterClearRef, pendingQueryAfterClearRef, pendingHashQueryRef,
      recordsRef, hasSelectedRecordsRef, queryExecutionKeyRef,
      widgetId: props.widgetId,
      queryItemConfigId: queryItem.configId,
      resultsMode, initialInputValue,
      graphicsLayer, mapView,
      eventManager: props.eventManager,
      onAccumulatedRecordsChange, onDestroyGraphicsLayer,
      publishDataClearedMsg, handleFormSubmitInternal
    }, sqlExpr, spatialFilter, runtimeZoomToSelected)
  }, [props.widgetId, initialInputValue, handleFormSubmitInternal, resultsMode, outputDS, clearResult])

  // ─── Spatial Query Execution ────────────────────────────────────────
  // r025.031: Full pipeline — execute spatial query, convert to records, apply mode, graphics, zoom
  const handleExecuteSpatialQuery = React.useCallback(async (params: {
    inputGeometry: __esri.Geometry
    selectedRelationship: string
    selectedLayers: Array<{ value: string | number; label: string }>
    bufferDistance: number
    bufferUnit: string
    resultsMode: string
  }): Promise<boolean> => {
    // Track origin tab for Results back button
    lastQueryOriginTabRef.current = 'spatial'

    // Show loading state
    dispatch({ type: 'SET_STAGE', payload: 2 })

    const targetLayerIds = params.selectedLayers.map(l => String(l.value))

    // Build useDataSource map for lazy DS creation (group layer children need rootDataSourceId)
    const targetUseDataSources: Record<string, any> = {}
    queryItems?.forEach(item => {
      const dsId = item.useDataSource?.dataSourceId
      if (dsId && targetLayerIds.includes(dsId)) {
        targetUseDataSources[dsId] = item.useDataSource
      }
    })

    // Build per-layer spatial default maps for field resolution and configId stamping
    const layerDefaultConfigs: Record<string, any> = {}
    const layerDefaultConfigIds: Record<string, string> = {}
    queryItems?.forEach(item => {
      if (item.isSpatialResultDefault && item.useDataSource?.dataSourceId) {
        const dsId = item.useDataSource.dataSourceId
        if (targetLayerIds.includes(dsId)) {
          layerDefaultConfigs[dsId] = item
          layerDefaultConfigIds[dsId] = item.configId
        }
      }
    })

    // 1. Execute the spatial query
    const result: SpatialQueryResult = await executeSpatialQuery({
      inputGeometry: params.inputGeometry,
      spatialRelationship: params.selectedRelationship,
      targetLayerIds,
      targetUseDataSources,
      bufferDistance: params.bufferDistance,
      bufferUnit: params.bufferUnit,
      widgetId: props.widgetId,
      layerDefaultConfigs
    })

    debugLogger.log('SPATIAL', {
      event: 'spatial-query-results-summary',
      widgetId: props.widgetId,
      totalFeatureCount: result.totalFeatureCount,
      totalTimeMs: result.totalTimeMs,
      layerResults: result.layerResults.map(r => ({
        layer: r.layerTitle,
        count: r.featureCount,
        queryTimeMs: r.queryTimeMs,
        exceededTransferLimit: r.exceededTransferLimit
      })),
      errors: result.errors.length > 0 ? result.errors : undefined,
      resultsMode: params.resultsMode,
      bufferDistance: params.bufferDistance,
      bufferUnit: params.bufferUnit,
      spatialRelationship: params.selectedRelationship
    })

    // If ALL layers failed, show error alert (same pattern as Query tab) and throw
    // Throwing ensures SpatialTabContent's catch runs → buffer distance is preserved
    if (result.layerResults.length === 0 && result.errors.length > 0) {
      dispatch({ type: 'SET_STAGE', payload: 1 })
      dispatch({ type: 'SET_QUERY_ERROR_ALERT', payload: {
        show: true,
        errorMessage: result.errors.map(e => e.error).join('; '),
        timestamp: Date.now()
      }})
      throw new Error('spatial-query-failed')
    }

    // 2. Convert FeatureSets → FeatureDataRecords via each target layer's DataSource
    // Pass layerDefaultConfigIds so records are stamped with real configId for popup template resolution
    const newRecords = convertSpatialResultsToRecords(result, props.widgetId, layerDefaultConfigIds)

    // 3. Handle zero results — return false so buffer is preserved
    if (newRecords.length === 0) {
      dispatch({ type: 'SET_NO_RESULTS_ALERT', payload: { show: true, recordsRequested: 0, queryValue: 'spatial query', timestamp: Date.now() } })
      dispatch({ type: 'SET_STAGE', payload: 1 })
      return false
    }

    // 4. Apply ResultsMode (New / Add / Remove)
    let recordsToDisplay: FeatureDataRecord[]
    const existingRecords = accumulatedRecords || []
    const outputDSAsFL = outputDS as FeatureLayerDataSource

    // Map ResultsModeValue ('new'/'add'/'remove') to match check
    const isNewMode = params.resultsMode === 'new' || params.resultsMode === SelectionType.NewSelection
    const isAddMode = params.resultsMode === 'add' || params.resultsMode === SelectionType.AddToSelection
    const isRemoveMode = params.resultsMode === 'remove' || params.resultsMode === SelectionType.RemoveFromSelection

    if (isNewMode) {
      // New mode: clear old results, use only new records
      if (existingRecords.length > 0) {
        await clearResult('spatial-new-mode', 'spatial')
      }
      recordsToDisplay = newRecords
    } else if (isAddMode) {
      // Add mode: merge new records into existing accumulated records
      const { mergedRecords, duplicateRecordIds } = mergeResultsIntoAccumulated(
        outputDSAsFL, newRecords, existingRecords
      )
      recordsToDisplay = mergedRecords

      if (duplicateRecordIds.length > 0 && duplicateRecordIds.length === newRecords.length) {
        dispatch({ type: 'SET_ALL_DUPLICATES_ALERT', payload: { show: true, recordsFound: newRecords.length, queryValue: 'spatial query' } })
      }
    } else if (isRemoveMode) {
      // Remove mode: remove matching records from accumulated (same smarts as Query tab)
      if (existingRecords.length === 0) {
        recordsToDisplay = []
      } else {
        recordsToDisplay = removeResultsFromAccumulated(outputDSAsFL, newRecords, existingRecords)

        if (recordsToDisplay.length === existingRecords.length) {
          dispatch({ type: 'SET_NO_REMOVAL_ALERT', payload: { show: true, recordsFound: newRecords.length, queryValue: 'spatial query' } })
        }
      }

      // r025.052: Close popup on Remove (matches Query tab behavior)
      if (mapView?.popup?.visible) {
        mapView.popup.close()
      }
    } else {
      recordsToDisplay = newRecords
    }

    // 5. Update parent state
    onAccumulatedRecordsChange(recordsToDisplay)
    recordsRef.current = recordsToDisplay

    // 6. Graphics on map via selectRecordsAndPublish
    if (recordsToDisplay.length > 0 && graphicsLayer && mapView) {
      const recordIds = recordsToDisplay.map(r => r.getId())
      await selectRecordsAndPublish(
        props.widgetId,
        outputDS,
        recordIds,
        recordsToDisplay,
        false,           // alsoPublishToOutputDS
        true,            // useGraphicsLayer
        graphicsLayer,
        mapView,
        true             // skipOriginDSSelection — records are from target layers, not outputDS origin
      )
      hasSelectedRecordsRef.current = true
    } else if (isRemoveMode && recordsToDisplay.length === 0) {
      // r025.052: All records removed — clear selection (same pattern as Query tab)
      await clearSelectionInDataSources(props.widgetId, outputDS, true, graphicsLayer)
      hasSelectedRecordsRef.current = false

      debugLogger.log('RESULTS-MODE', {
        event: 'spatial-remove-mode-all-records-removed-selection-cleared',
        widgetId: props.widgetId
      })
    }

    // 7. Update outputDS selection for Results tab display
    if (outputDS && typeof (outputDS as any).selectRecordsByIds === 'function') {
      const recordIds = recordsToDisplay.map(r => r.getId())
      ;(outputDS as any).selectRecordsByIds(recordIds, recordsToDisplay)
    }

    // 8. Dispatch state updates
    queryExecutionKeyRef.current += 1
    lastQueryResultCountRef.current = newRecords.length
    dispatch({ type: 'SET_RESULT_COUNT', payload: recordsToDisplay.length })
    dispatch({ type: 'SET_STAGE', payload: 1 })
    dispatch({ type: 'SET_QUERY_EXECUTED', payload: true })

    // 9. Zoom to results
    if (recordsToDisplay.length > 0) {
      zoomToRecords(recordsToDisplay)
    }

    debugLogger.log('SPATIAL', {
      event: 'spatial-pipeline-complete',
      widgetId: props.widgetId,
      mode: params.resultsMode,
      newRecordCount: newRecords.length,
      displayRecordCount: recordsToDisplay.length,
      totalTimeMs: result.totalTimeMs
    })

    return true
  }, [props.widgetId, queryItems, outputDS, accumulatedRecords, graphicsLayer, mapView, onAccumulatedRecordsChange, clearResult, zoomToRecords])

  const { useAttributeFilter, sqlExprObj, useSpatialFilter, spatialFilterTypes, spatialIncludeRuntimeData, spatialRelationUseDataSources} = currentItem
  const showAttributeFilter = useAttributeFilter && sqlExprObj != null
  const showSpatialFilter = spatialFilterEnabled && useSpatialFilter && (spatialFilterTypes.length > 0 || spatialIncludeRuntimeData || spatialRelationUseDataSources?.length > 0)

  // DETECT SWITCH IN RENDER
  const isSwitchingQueries = previousConfigIdRef.current !== queryItem.configId
  const isVirtualClearActive = isSwitchingQueries && resultsMode === SelectionType.NewSelection
  
  // FIX (r018.97): Use accumulatedRecords as universal source of truth across ALL modes
  // This ensures tab count updates correctly when records are removed in ANY mode (New, Add, Remove)
  // accumulatedRecords is now synced in all modes (see query-result.tsx r018.97 fix)
  const isAccumulationMode = resultsMode === SelectionType.AddToSelection || 
                             resultsMode === SelectionType.RemoveFromSelection
  
  // Use these "effective" values for the UI
  // Prefer accumulatedRecords when available (synced in all modes), fallback to recordsRef for initial query results
  // r024.19: When isClearing is true, force empty array to trigger React unmount BEFORE clearing parent data
  const effectiveRecords = (isClearing || isVirtualClearActive) ? [] : 
                          (accumulatedRecords && accumulatedRecords.length > 0) ? accumulatedRecords :
                          (recordsRef.current || [])
  
  // FIX (r018.95): Use effectiveRecords.length to reflect real-time count updates when records are removed
  const effectiveResultCount = (isClearing || isVirtualClearActive) ? 0 : effectiveRecords.length
  
  // r023.15: Keep recordsRef in sync with accumulatedRecords when records are removed.
  // The reselection block (line ~867) sets recordsRef.current = accumulatedRecords during query
  // switches in Add mode. If the user then removes records via X-button, accumulatedRecords is
  // updated but recordsRef stays stale. When switching to New mode, accumulatedRecords clears
  // to [] and effectiveRecords falls through to the stale recordsRef, resurrecting zombies.
  // This effect keeps recordsRef in sync so the fallback always has the correct (reduced) set.
  React.useEffect(() => {
    if (accumulatedRecords && accumulatedRecords.length > 0 && recordsRef.current && recordsRef.current.length > 0) {
      // Only sync if accumulated has fewer records (removal happened)
      // Don't sync on additions - recordsRef tracks the current query's raw results
      if (accumulatedRecords.length < recordsRef.current.length) {
        recordsRef.current = accumulatedRecords
      }
    }
  }, [accumulatedRecords])

  // DIAGNOSTIC: Log when we're using accumulatedRecords vs raw records
  React.useEffect(() => {
    if (effectiveRecords.length > 0 || effectiveResultCount > 0) {
      const usingAccumulated = accumulatedRecords && accumulatedRecords.length > 0
      debugLogger.log('RESULTS-MODE', {
        event: 'effectiveRecords-calculation',
        widgetId: props.widgetId,
        resultsMode,
        isAccumulationMode,
        usingAccumulated,
        effectiveRecordsCount: effectiveRecords.length,
        effectiveResultCount,
        rawRecordsCount: recordsRef.current?.length || 0,
        accumulatedRecordsCount: accumulatedRecords?.length || 0,
        tabCountWillShow: effectiveResultCount,
        note: usingAccumulated ? 'r018.97: Using accumulatedRecords (universal source of truth)' : 'Using raw query records (initial load)',
        timestamp: Date.now()
      })
    }
  }, [effectiveRecords, effectiveResultCount, isAccumulationMode, accumulatedRecords, resultsMode, props.widgetId])

  // Create a unique key for the current query result set to help E2E tests detect fresh data
  const resultQueryKey = React.useMemo(() => {
    return `${queryItem.configId}_${Date.now()}`
  }, [queryItem.configId, resultCount])

  return (
    <div className={classNames('query-task h-100', className, { wrapped: wrappedInPopper })} 
      data-result-query-key={resultQueryKey}
      css={css`
      ${style}
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `}>
      {/* r021.51: Key prop forces remount when DS is destroyed. Changing this key tells React
          to treat DataSourceComponent as a new instance, triggering full unmount/remount cycle
          and natural DS recreation. This is the proper React pattern for forced remounting. */}
      <DataSourceComponent 
        key={dsRecreationKey}
        useDataSource={useOutputDs} 
        onDataSourceCreated={handleOutputDataSourceCreated} 
        onDataSourceInfoChange={handleOutputDataSourceInfoChange}
      />
      
      {/* Tab Navigation - Moved to top */}
      <Tabs
        value={activeTab}
        onChange={(id) => handleTabChange(id as 'query' | 'spatial' | 'results')}
        fill={true}
        type='underline'
        keepMount={true}
        css={css`
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        `}
      >
        <Tab
          id='query'
          title={getI18nMessage('queryTab')}
        >
          <div 
            className={classNames('query-task__content', {
              [FOCUSABLE_CONTAINER_CLASS]: isInPopper && activeTab === 'query'
            })} 
            css={css`
              flex: 1;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              min-height: 0;
              padding-top: 0 !important;
            `}
          >
            {/* Header with back button and query label - Query tab only */}
            <div className={classNames('query-form__header mx-4 align-items-center', { 'in-popper': isInPopper })} css={css`
              display: flex;
              padding: 6px 0;
              padding-top: 8px;
              border-bottom: 1px solid var(--sys-color-divider-secondary);
              flex-shrink: 0;
            `}>
              <div className={classNames('nav-action align-items-center', { 'd-none': wrappedInPopper })} css={css`
                flex: 1 1 0;
                overflow: hidden;
                display: flex;
                align-items: center;
                gap: 4px;
                .jimu-btn {
                  min-width: 26px;
                }
              `}>
                <Button
                  className={classNames('p-0 mr-2', { 'd-none': total === 1 || !onNavBack })}
                  size='sm'
                  type='tertiary'
                  icon
                  onClick={onNavBack}
                  aria-label={getI18nMessage('back')}
                  ref={backBtnRef}
                >
                  <ArrowLeftOutlined autoFlip/>
                </Button>
                <QueryTaskLabel icon={icon} name={displayLabel ? name : ''} />
                {/* Hash parameter info button - shows queries from same layer with shortIds */}
                {(() => {
                  if (!queryItems || queryItems.length <= 1) return null
                  
                  // Get current query's origin data source ID
                  const currentOriginDSId = queryItem.useDataSource?.dataSourceId
                  
                  if (!currentOriginDSId) return null
                  
                  // Find all queries from the same origin data source that have shortIds
                  const sameLayerQueries = queryItems.filter(item => 
                    item.useDataSource?.dataSourceId === currentOriginDSId && 
                    item.shortId && 
                    item.shortId.trim() !== ''
                  )
                  
                  // Only show info button if there are queries with shortIds
                  if (sameLayerQueries.length === 0) return null
                  
                  // Build tooltip content
                  const queryLines = sameLayerQueries.map(item => {
                    const queryName = getQueryDisplayName(item)
                    return `${queryName}: #${item.shortId}=value or ?${item.shortId}=value`
                  })
                  
                  const tooltipTitle = `This layer can be searched using the shortIds ${sameLayerQueries.map(q => q.shortId).join(' and ')} using #shortId=value or ?shortId=value in the URL.\n\n${queryLines.join('\n')}`
                  
                  return (
                    <Tooltip 
                      placement='bottom' 
                      css={css`white-space: pre-line;`} 
                      title={tooltipTitle}
                    >
                      <Button 
                        size='sm' 
                        icon 
                        type='tertiary' 
                        aria-label='Hash parameter search information'
                        css={css`
                          flex-shrink: 0;
                        `}
                      >
                        <InfoOutlined color='var(--sys-color-primary-main)' size='s'/>
                      </Button>
                    </Tooltip>
                  )
                })()}
              </div>
              {effectiveResultCount > 0 && (
                <Tooltip title={getI18nMessage('clearResult')} placement='bottom'>
                  <Button
                    size='sm'
                    type='tertiary'
                    aria-label={getI18nMessage('clearResult')}
                    icon
                    className='ml-auto py-0'
                    onClick={() => { clearResult('user-trash-click') }}
                  >
                    <TrashOutlined />
                  </Button>
                </Tooltip>
              )}
            </div>
            {/* Search Layer / Group dropdowns - show based on grouping */}
            {(() => {
              // Only show dropdowns if multiple queries exist
              if (!queryItems || queryItems.length <= 1) {
                return null
              }
              
              // Build flat list of all queries with their display info
              // For grouped queries, use group display name (only show once per group)
              const queryOptions: Array<{
                configId: string
                displayName: string
                groupId: string | null
                index: number
              }> = []
              
              // Track which groups we've already added to avoid duplicates
              const addedGroups = new Set<string>()
              
              queryItems.forEach((item, idx) => {
                // r025.060: Skip spatial-only layers — they participate in Spatial tab only
                if (item.spatialOnly) return
                if (item.groupId) {
                  // For grouped queries, use group display name (only add once per group)
                  if (!addedGroups.has(item.groupId)) {
                    addedGroups.add(item.groupId)
                    const groupDisplayName = groups?.[item.groupId]?.displayName || 
                                           groups?.[item.groupId]?.items[0]?.name || 
                                           item.name || 
                                           `Group ${item.groupId}`
                    queryOptions.push({
                      configId: item.configId,
                      displayName: groupDisplayName,
                      groupId: item.groupId,
                      index: idx
                    })
                  }
                } else {
                  // Ungrouped query - use item.name for first dropdown (not searchAlias/jimuFieldName)
                  queryOptions.push({
                    configId: item.configId,
                    displayName: item.name || getQueryDisplayName(item),
                    groupId: null,
                    index: idx
                  })
                }
              })
              
              // Determine currently selected query
              const currentQueryItem = queryItem
              const currentQueryGroupId = currentQueryItem.groupId || null
              const isGroupedQuery = currentQueryGroupId !== null
              
              // Find the option index for the current query
              const currentOptionIndex = queryOptions.findIndex(opt => {
                if (isGroupedQuery) {
                  return opt.groupId === currentQueryGroupId
                } else {
                  return opt.configId === currentQueryItem.configId
                }
              })
              
              debugLogger.log('GROUP', {
                event: 'rendering-dropdowns',
                totalQueries: queryItems.length,
                queryOptionsCount: queryOptions.length,
                currentQueryGroupId,
                isGroupedQuery,
                currentOptionIndex,
                selectedGroupId,
                selectedGroupQueryIndex,
                currentQueryConfigId: currentQueryItem.configId
              })
              
              return (
                <React.Fragment>
                  {/* First Dropdown: All queries */}
                  <div css={css`
                    padding: 4px 16px;
                    flex-shrink: 0;
                  `}>
                    <label css={css`
                      font-size: 0.875rem;
                      font-weight: 500;
                      color: var(--sys-color-text-primary);
                      margin-bottom: 4px;
                      display: block;
                    `}>
                      {getI18nMessage('searchLayer')}
                    </label>
                    <Select 
                      size="sm"
                      value={currentOptionIndex >= 0 ? currentOptionIndex : 0}
                      onChange={async (e) => {
                        const optionIndex = parseInt(e.target.value)
                        const selectedOption = queryOptions[optionIndex]
                        
                        debugLogger.log('GROUP', {
                          event: 'query-option-selected',
                          optionIndex,
                          selectedOption,
                          isGrouped: selectedOption.groupId !== null
                        })

                        // START CLEARING IMMEDIATELY IF SWITCHING
                        if (resultsMode === SelectionType.NewSelection) {
                          await clearResult('dropdown-layer-switch-new-mode')
                        }
                        
                        if (selectedOption.groupId) {
                          // Grouped query selected - set group and first query in group
                          if (onGroupChange) {
                            onGroupChange(selectedOption.groupId)
                          }
                          if (onGroupQueryChange) {
                            onGroupQueryChange(0)
                          }
                        } else {
                          // Ungrouped query selected - clear group selection
                          if (onGroupChange) {
                            onGroupChange(null)
                          }
                          if (onUngroupedChange) {
                            // Find the ungrouped index
                            const ungroupedIndex = ungrouped?.findIndex(({ item }) => 
                              item.configId === selectedOption.configId
                            ) ?? -1
                            if (ungroupedIndex >= 0) {
                              onUngroupedChange(ungroupedIndex)
                            } else {
                              // Fallback: use the index from queryItems
                              debugLogger.log('GROUP', {
                                event: 'ungrouped-fallback-to-index',
                                selectedOptionIndex: selectedOption.index
                              })
                              if (onQueryChange) {
                                onQueryChange(selectedOption.index)
                              }
                            }
                          }
                        }
                      }}
                    >
                      {queryOptions.map((option, idx) => {
                        debugLogger.log('GROUP', {
                          event: 'rendering-query-option',
                          index: idx,
                          configId: option.configId,
                          displayName: option.displayName,
                          groupId: option.groupId
                        })
                        return (
                          <option key={option.configId} value={idx}>
                            {option.displayName}
                          </option>
                        )
                      })}
                    </Select>
                  </div>
                  
                  {/* Second Dropdown: Queries within selected group (only if grouped query selected) */}
                  {isGroupedQuery && currentQueryGroupId && groups && groups[currentQueryGroupId] && (
                    <div css={css`
                      padding: 4px 16px;
                      flex-shrink: 0;
                    `}>
                      <label css={css`
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: var(--sys-color-text-primary);
                        margin-bottom: 4px;
                        display: block;
                      `}>
                        Search alias
                      </label>
                      <Select 
                        size="sm"
                        value={selectedGroupQueryIndex !== undefined ? selectedGroupQueryIndex : 0}
                        onChange={async (e) => {
                          const newIndex = parseInt(e.target.value)
                          debugLogger.log('GROUP', {
                            event: 'group-query-selected',
                            groupId: currentQueryGroupId,
                            groupQueryIndex: newIndex,
                            queryItemConfigId: groups[currentQueryGroupId].items[newIndex]?.configId,
                            queryDisplayName: getQueryDisplayName(groups[currentQueryGroupId].items[newIndex])
                          })

                          // START CLEARING IMMEDIATELY IF SWITCHING
                          if (resultsMode === SelectionType.NewSelection) {
                            await clearResult('dropdown-alias-switch-new-mode')
                          }

                          if (onGroupQueryChange) {
                            onGroupQueryChange(newIndex)
                          }
                        }}
                      >
                        {groups[currentQueryGroupId].items.map((item, idx) => (
                          <option key={item.configId} value={idx}>
                            {getQueryDisplayName(item)}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}
                </React.Fragment>
              )
            })()}
            
            <QueryTabContent
              widgetId={props.widgetId}
              queryItem={queryItem}
              queryItems={queryItems}
              resultsMode={resultsMode}
              onResultsModeChange={onResultsModeChange}
              accumulatedRecords={accumulatedRecords}
              onAccumulatedRecordsChange={onAccumulatedRecordsChange}
              outputDS={outputDS}
              dataSource={dataSource}
              effectiveRecords={effectiveRecords}
              enabled={enabled}
              dsExists={dsExists}
              spatialFilterEnabled={spatialFilterEnabled}
              dataActionFilter={dataActionFilter}
              initialInputValue={initialInputValue}
              handleFormSubmit={handleFormSubmit}
              onHashParameterUsed={onHashParameterUsed}
              handleStatusChange={handleStatusChange}
              handleDataSourceCreated={handleDataSourceCreated}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              noResultsAlert={noResultsAlert}
              onDismissNoResultsAlert={() => dispatch({ type: 'SET_NO_RESULTS_ALERT', payload: null })}
              queryErrorAlert={queryErrorAlert}
              onDismissQueryErrorAlert={() => dispatch({ type: 'SET_QUERY_ERROR_ALERT', payload: null })}
              otherProps={otherProps}
            />
          </div>
        </Tab>
        <Tab
          id='spatial'
          title={getI18nMessage('spatialTab')}
        >
          <div
            className={classNames('query-task__content', {
              [FOCUSABLE_CONTAINER_CLASS]: isInPopper && activeTab === 'spatial'
            })}
            css={css`
              flex: 1;
              display: flex;
              flex-direction: column;
              min-height: 0;
              height: 100%;
              padding-top: 0 !important;
            `}
          >
            <SpatialTabContent
              activeTab={activeTab}
              accumulatedRecords={accumulatedRecords}
              onClearResults={() => { clearResult('spatial-trash-click', 'spatial') }}
              mapView={mapView}
              jimuMapView={jimuMapView}
              widgetId={props.widgetId}
              isPanelVisible={props.isPanelVisible}
              targetLayerOptions={targetLayerOptions}
              onExecuteSpatialQuery={handleExecuteSpatialQuery}
              queryErrorAlert={queryErrorAlert}
              onDismissQueryErrorAlert={() => dispatch({ type: 'SET_QUERY_ERROR_ALERT', payload: null })}
              noResultsAlert={noResultsAlert}
              onDismissNoResultsAlert={() => dispatch({ type: 'SET_NO_RESULTS_ALERT', payload: null })}
            />
          </div>
        </Tab>
        <Tab
          id='results'
          title={
            <span>
              {getI18nMessage('resultsTab')}
              {effectiveResultCount > 0 && (
                <span css={css`
                  margin-left: 6px;
                  font-size: 0.75rem;
                  opacity: 0.7;
                `}>
                  ({effectiveResultCount})
                </span>
              )}
            </span>
          }
          disabled={effectiveResultCount === 0}
        >
          {effectiveResultCount > 0 && (
            <div 
              className={classNames('query-task__content', {
                [FOCUSABLE_CONTAINER_CLASS]: isInPopper && activeTab === 'results'
              })} 
              css={css`
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 0;
                height: 100%;
                padding-top: 0 !important;
              `}
              onClick={(e) => {
                // Prevent clicks from bubbling up when Results tab is active
                if (activeTab === 'results') {
                  e.stopPropagation()
                }
              }}
            >
              {/* r023.29: Stable key - only remount on new query execution, not mode switches */}
              <QueryTaskResult
                key={`${queryItem.configId}-${queryExecutionKeyRef.current}`}
                widgetId={props.widgetId}
                queryItem={queryItem}
                queryParams={queryParamRef.current}
                resultCount={effectiveResultCount}
                maxPerPage={(dataSource as QueriableDataSource)?.getMaxRecordCount?.()}
                records={effectiveRecords}
                outputDS={outputDS}
                runtimeZoomToSelected={lastRuntimeZoomToSelectedRef.current}
                resultsMode={resultsMode}
                graphicsLayer={graphicsLayer}
                mapView={mapView}
                accumulatedRecords={accumulatedRecords}
                resultsExtent={resultsExtent}
                onAccumulatedRecordsChange={onAccumulatedRecordsChange}
                eventManager={eventManager}
                isQuerySwitchInProgressRef={isQuerySwitchInProgressRef}
                queries={queryItems}
                zoomOnResultClick={zoomOnResultClick}
                panOnResultClick={panOnResultClick}
                hoverPinColor={hoverPinColor}
                listResetKey={queryExecutionKeyRef.current}
                noRemovalAlert={noRemovalAlert}
                onDismissNoRemovalAlert={() => dispatch({ type: 'SET_NO_REMOVAL_ALERT', payload: null })}
                allDuplicatesAlert={allDuplicatesAlert}
                onDismissAllDuplicatesAlert={() => dispatch({ type: 'SET_ALL_DUPLICATES_ALERT', payload: null })}
                onNavBack={async (clearResults = false) => {
                  // Handle navigation from QueryTaskResult
                  // r025.031: Navigate back to whichever tab initiated the query (query or spatial)
                  if (clearResults) {
                    hasSelectedRecordsRef.current = false // Reset flag when clearing
                    await navToForm(true)
                  } else {
                    // Just switch tabs, don't clear results
                    // Mark as manual switch to prevent auto-switch useEffect from interfering
                    manualTabSwitchRef.current = true
                    setActiveTab(lastQueryOriginTabRef.current)
                    // Reset the flag after a short delay
                    setTimeout(() => {
                      manualTabSwitchRef.current = false
                    }, 100)
                  }
                }}
              />
            </div>
          )}
        </Tab>
      </Tabs>

      {/* Error Messages */}
      {(selectionError || zoomError) && (
        <div css={css`
          padding: 0 16px;
          margin-top: 8px;
        `}>
          {selectionError && (
            <ErrorMessage
              error={selectionError}
              onDismiss={() => dispatch({ type: 'SET_SELECTION_ERROR', payload: null })}
            />
          )}
          {zoomError && (
            <ErrorMessage
              error={zoomError}
              onDismiss={() => dispatch({ type: 'SET_ZOOM_ERROR', payload: null })}
            />
          )}
        </div>
      )}

      {/* Loading Indicator - overlays on top of tabs */}
      {stage === 2 && (
        <div css={css`
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        `}>
          <LoadingResult />
        </div>
      )}
      
      {/* Clearing Indicator - just spinner, no text */}
      {stage === 3 && (
        <div css={css`
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        `}>
          <Loading type={LoadingType.Donut}/>
        </div>
      )}
    </div>
  )
}
