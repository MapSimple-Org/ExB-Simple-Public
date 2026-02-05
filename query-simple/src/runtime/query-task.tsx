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
import { QueryTabContent } from './tabs/QueryTabContent'
import { QueryTaskForm } from './query-task-form'
import { QueryTaskResult } from './query-result'
import { DataSourceTip, useDataSourceExists, ErrorMessage } from 'widgets/shared-code/common'
import { QueryTaskLabel } from './query-task-label'
import { useZoomToRecords } from './hooks/use-zoom-to-records'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { generateQueryParams, executeQuery, executeCountQuery } from './query-utils'
import { mergeResultsIntoAccumulated, removeResultsFromAccumulated, removeRecordsFromOriginSelections } from './results-management-utils'
import { removeHighlightGraphics, cleanupGraphicsLayer } from './graphics-layer-utils'
import { MenuOutlined } from 'jimu-icons/outlined/editor/menu'
import defaultMessage from './translations/default'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { LoadingResult } from './loading-result'
import { clearSelectionInDataSources, selectRecordsAndPublish, findClearResultsButton, dispatchSelectionEvent, getOriginDataSource, clearAllSelectionsForWidget } from './selection-utils'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

// Event fired when SqlExpressionRuntime converts hash value from string to array format
const QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT = 'querysimple-hash-value-converted'

// Event fired when a hash-triggered query execution completes successfully
// This allows HelperSimple to track which hash parameters have been executed
const QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT = 'querysimple-hash-query-executed'

export interface QueryTaskProps {
  widgetId: string
  index: number
  total: number
  queryItem: ImmutableObject<QueryItemType>
  wrappedInPopper?: boolean
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
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
  // Graphics layer props
  graphicsLayer?: __esri.GraphicsLayer
  mapView?: __esri.MapView | __esri.SceneView
  onInitializeGraphicsLayer?: (outputDS: DataSource) => Promise<void>
  onClearGraphicsLayer?: () => void
  onDestroyGraphicsLayer?: () => void // r021.17: Clear refs after destroying layer
  activeTab?: 'query' | 'results'
  onTabChange?: (tab: 'query' | 'results') => void
  eventManager?: import('./hooks/use-event-handling').EventManager  // Chunk 7.1: Event Handling Manager
  // FIX (r018.96): Removed manuallyRemovedRecordIds and onManualRemoval - no longer needed
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
  const { queryItem, onNavBack, total, isInPopper = false, wrappedInPopper = false, className = '', index, initialInputValue, onHashParameterUsed, queryItems, selectedQueryIndex, onQueryChange, groups, ungrouped, groupOrder, selectedGroupId, selectedGroupQueryIndex, onGroupChange, onGroupQueryChange, onUngroupedChange, resultsMode, onResultsModeChange, accumulatedRecords, onAccumulatedRecordsChange, graphicsLayer, mapView, onInitializeGraphicsLayer, onClearGraphicsLayer, onDestroyGraphicsLayer, activeTab: propActiveTab, onTabChange: propOnTabChange, eventManager, ...otherProps } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const zoomToRecords = useZoomToRecords(mapView)
  const [stage, setStage] = React.useState(0) // 0 = form, 1 = results, 2 = loading, 3 = clearing
  const [internalActiveTab, setInternalActiveTab] = React.useState<'query' | 'results'>('query')
  
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
  const setActiveTab = React.useCallback((tab: 'query' | 'results') => {
    if (propOnTabChange) {
      propOnTabChange(tab)
    } else {
      setInternalActiveTab(tab)
    }
  }, [propOnTabChange])
  const [enabled, setEnabled] = React.useState(true)
  const [resultCount, setResultCount] = React.useState(0)
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
  const [outputDS, setOutputDS] = React.useState<DataSource>(null)
  const [dataSource, setDataSource] = React.useState<DataSource>(null)
  const [spatialFilterEnabled, setSpatialFilterEnabled] = React.useState(true)
  
  // r022.3: Alert state for query feedback (zero results, remove mode no matches, etc.)
  const [noResultsAlert, setNoResultsAlert] = React.useState<{
    show: boolean
    recordsRequested: number // How many records were expected/requested
    queryValue: string // The search value used
    timestamp?: number // r022.8: Unique timestamp forces React to re-render on each new query
  } | null>(null)
  
  // r022.15: Alert state for Remove mode when query finds records but none match accumulated results
  const [noRemovalAlert, setNoRemovalAlert] = React.useState<{
    show: boolean
    recordsFound: number // How many records the query found
    queryValue: string // The search value used
    timestamp?: number // Unique timestamp for React remount
  } | null>(null)
  
  // r022.21: Alert state for Add mode when all found records are duplicates
  const [allDuplicatesAlert, setAllDuplicatesAlert] = React.useState<{
    show: boolean
    recordsFound: number // How many records the query found (all duplicates)
    queryValue: string // The search value used
    timestamp?: number // Unique timestamp for React remount
  } | null>(null)
  const attributeFilterSqlExprObj = React.useRef<IMSqlExpression>(queryItem.sqlExprObj)
  const spatialFilterObj = React.useRef(null)
  const backBtnRef = React.useRef<HTMLButtonElement>(undefined)
  
  // r022.22: Track the count from the MOST RECENT query execution (not accumulated count)
  // This allows auto-tab-switch to distinguish between "query returned 0" vs "accumulated records exist"
  const lastQueryResultCountRef = React.useRef<number>(0)
  
  // r021.51: Key prop pattern to force DataSourceComponent remount
  // Incrementing this key forces React to unmount/remount DataSourceComponent, which triggers
  // natural DS recreation. Replaces programmatic button click anti-pattern with idiomatic React.
  const [dsRecreationKey, setDsRecreationKey] = React.useState(0)
  
  const [dataActionFilter, setDataActionFilter] = React.useState(null)
  const previousConfigIdRef = React.useRef<string>(queryItem.configId)
  // Track manual tab switches to prevent auto-switch useEffect from interfering
  const manualTabSwitchRef = React.useRef(false)
  // Track when a query was just executed - only auto-switch after query execution completes
  const [queryJustExecuted, setQueryJustExecuted] = React.useState(false)
  // Store the last runtime zoom override value from the form for use by Add to Map action
  const lastRuntimeZoomToSelectedRef = React.useRef<boolean | undefined>(undefined)
  // Error states for user-facing errors
  const [selectionError, setSelectionError] = React.useState<string>(null)
  const [zoomError, setZoomError] = React.useState<string>(null)
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
      willAutoSwitch: queryJustExecuted && lastQueryResultCountRef.current > 0 && hasRecords && activeTab === 'query',
      timestamp: Date.now()
    })
    
    // r022.22: Check lastQueryResultCountRef (current query's results) not resultCount (accumulated)
    // This prevents auto-switch when query returns 0 but accumulated records exist (Add mode bug)
    if (queryJustExecuted && 
        lastQueryResultCountRef.current > 0 && 
        hasRecords && 
        activeTab === 'query') {
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
      setQueryJustExecuted(false) // Reset after switching
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
   * This is the single source of truth for clearing results.
   * It clears the records, resets the result count, clears selection from the map,
   * publishes a cleared message to the map, switches back to the Query tab,
   * and increments the query execution key to force QueryTaskResult to remount with fresh state.
   */
  const clearResult = React.useCallback(async (reason: string = 'unknown') => {
    debugLogger.log('TASK', {
      event: 'clearResult-called',
      widgetId: props.widgetId,
      hasOutputDS: !!outputDS,
      reason,
      timestamp: Date.now()
    })

    // ============================================================================
    // r021.45: Delay Parent Array Clearing Until After React Unmounts
    //
    // KEY INSIGHT FROM r021.44 TESTING:
    // After implementing CSS background-image for trash icons, we still see massive
    // detached DOM accumulation (+722 detached buttons, +2,878 divs) between Clear 1
    // and Clear 2. This means closures in child components are holding references
    // even after React unmounts them.
    //
    // THE CLOSURE PROBLEM:
    // 1. Results panel renders 600 QueryResultItem components
    // 2. Each component's onClick handler captures its `record` object in closure
    // 3. We call onAccumulatedRecordsChange([]) BEFORE React unmounts children
    // 4. Parent array is cleared, but children are still mounted with closures intact
    // 5. When React finally unmounts them, those closures still reference records
    // 6. Result: Detached DOM can't be GC'd
    //
    // SOLUTION:
    // Wait for React to physically unmount children BEFORE clearing parent array:
    // - recordsRef.current = null (break child's direct reference)
    // - setStage(2) (trigger React unmount)
    // - await setTimeout(0) (yield - let React complete unmount & release closures)
    // - onAccumulatedRecordsChange([]) (NOW safe to clear parent array)
    // - destroy OutputDataSource (DS's reference)
    // ============================================================================
    
    // STEP 1: Enter Clearing State & Clear Local References
    recordsRef.current = null              // Release child's reference to records
    outputDS?.setStatus(DataSourceStatus.NotReady)
    setResultCount(0)                      // Clear count, trigger React updates
    setActiveTab('query')                  // Hide Results tab
    hasSelectedRecordsRef.current = false
    queryExecutionKeyRef.current += 1
    setSelectionError(null)
    setZoomError(null)
    
    // r021.87: Clear record tracking (formatting is stamped on records)
    currentQueryRecordIdsRef.current = []
    
    // r022.22: Clear last query result count
    lastQueryResultCountRef.current = 0
    
    // r022.25: Clear all alert/popover states
    setNoResultsAlert(null)
    setNoRemovalAlert(null)
    setAllDuplicatesAlert(null)
    
    // Clear parent array IMMEDIATELY
    if (onAccumulatedRecordsChange) {
      onAccumulatedRecordsChange([])
    }
    
    // STEP 2: The Purge - Do all cleanup using unified clearing function
    // Unified clearing ensures both Query tab and Results tab clear paths do the same thing:
    // - Multi-source clearing (all origin DataSources)
    // - Graphics layer clearing
    // - Popup closing
    // - Hash clearing (via clearSelectionInDataSources)
    // - Event dispatching
    // - Message publishing
    // - Optional DataSource destruction
    
    if (outputDS) {
      const shouldDestroyDSs = reason === 'query-item-switch-new-mode' || reason === 'user-trash-click' || reason === 'navToForm-clearResults'
      
      try {
        await clearAllSelectionsForWidget({
          widgetId: props.widgetId,
          outputDS,
          useGraphicsLayer: true,
          graphicsLayer,
          mapView,
          eventManager: props.eventManager,
          queryItemConfigId: queryItem.configId,
          onDestroyGraphicsLayer,
          destroyOutputDataSources: shouldDestroyDSs
        })
        if (shouldDestroyDSs && (reason === 'user-trash-click' || reason === 'navToForm-clearResults')) {
          setOutputDS(null)
          setDsRecreationKey(k => k + 1)
          debugLogger.log('TASK', {
            event: 'clearResult-clear-tab-pattern',
            widgetId: props.widgetId,
            reason,
            note: 'DS destroyed; nulled outputDS and incremented dsRecreationKey (same pattern as memory workflow)',
            timestamp: Date.now()
          })
        }
      } catch (error) {
        debugLogger.log('ERROR', {
          event: 'clearResult-unified-clear-failed',
          widgetId: props.widgetId,
          reason,
          shouldDestroyDSs,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    // STEP 3: The Reset - Back to Stage 0
    // This final state change "kicks" React one last time after all cleanup is done
    setStage(0)
    
    debugLogger.log('TASK', {
      event: 'clearResult-complete',
      widgetId: props.widgetId,
      reason,
      note: 'Stage 0 reset - React will recreate DS on next query',
      timestamp: Date.now()
    })
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
      setStage(0)
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
    setStage(0)
    setActiveTab('query') // Return to Query tab when switching queries
  }, [updateDataSource, clearResult, resultCount, resultsMode, accumulatedRecords, props.widgetId])

  const handleOutputDataSourceCreated = React.useCallback(async (ds: DataSource) => {
    setOutputDS(ds)
    
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
    
    // VERIFICATION LOGGING: Track graphics layer state when switching queries
    if (isSwitchingQueries && (resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection)) {
      const graphicsCountBefore = graphicsLayer?.graphics?.length || 0
      debugLogger.log('RESULTS-MODE', {
        event: 'handleOutputDataSourceCreated-query-switch-detected',
        widgetId: props.widgetId,
        oldConfigId,
        newConfigId: queryItem.configId,
        resultsMode,
        hasGraphicsLayer: !!graphicsLayer,
        graphicsCountBefore,
        hasAccumulatedRecords: !!(accumulatedRecords && accumulatedRecords.length > 0),
        accumulatedRecordsCount: accumulatedRecords?.length || 0,
        hasOnClearGraphicsLayer: !!onClearGraphicsLayer,
        isQuerySwitchFlagSet: isQuerySwitchInProgressRef.current,
        timestamp: Date.now()
      })
      
      // r021.87: BUG-ADD-MODE-001 FIXED - per-record formatting preserved via __queryConfigId on records
    }
    
    // CHECK rootDataSource.map to see how framework accesses map view
    try {
      const originDataSources = ds.getOriginDataSources()
      const originDS = originDataSources?.[0]
      if (originDS) {
        const rootDS = originDS.getRootDataSource()
        if (rootDS) {
          // Expose rootDS to window for console inspection
          ;(window as any).__querySimpleRootDS = rootDS
          ;(window as any).__querySimpleRootDSMap = (rootDS as any).map
          ;(window as any).__querySimpleOriginDS = originDS
          
          debugLogger.log('GRAPHICS-LAYER', {
            event: 'check-root-datasource-map',
            widgetId: props.widgetId,
            outputDSId: ds.id,
            originDSId: originDS.id,
            rootDSId: rootDS.id,
            rootDSType: rootDS.type,
            hasRootDSMap: !!(rootDS as any).map,
            rootDSMapType: (rootDS as any).map ? typeof (rootDS as any).map : 'none',
            rootDSMapId: (rootDS as any).map?.id || 'none',
            hasRootDSMapView: !!(rootDS as any).map?.view,
            hasRootDSMapViews: !!(rootDS as any).map?.views,
            rootDSMapViewsLength: (rootDS as any).map?.views?.length || 0,
            // Log some map properties if it exists
            rootDSMapKeys: (rootDS as any).map ? Object.keys((rootDS as any).map).filter(key => 
              !key.startsWith('_') && 
              typeof (rootDS as any).map[key] !== 'function'
            ).slice(0, 20) : [],
            // Log that objects are available on window for console inspection
            consoleInspection: 'Check window.__querySimpleRootDS, window.__querySimpleRootDSMap, window.__querySimpleOriginDS',
            timestamp: Date.now()
          })
          
          // If map exists, check its view
          const rootMap = (rootDS as any).map
          if (rootMap) {
            const view = rootMap.view || 
                         (rootMap.views?.getItemAt?.(0)) ||
                         (rootMap.views?.length > 0 ? rootMap.views[0] : null)
            
            debugLogger.log('GRAPHICS-LAYER', {
              event: 'check-root-datasource-map-view',
              widgetId: props.widgetId,
              hasView: !!view,
              viewType: view?.type || 'none',
              viewId: view?.id || 'none',
              timestamp: Date.now()
            })
          }
        }
      }
    } catch (error) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'check-root-datasource-map-error',
        widgetId: props.widgetId,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: Date.now()
      })
    }
    
    // Initialize graphics layer lazily if not already initialized
    if (onInitializeGraphicsLayer) {
      await onInitializeGraphicsLayer(ds)
      // After initialization, graphicsLayer and mapView props should be updated
      // But since props come from refs, we need to wait for widget re-render
      // For now, use the props that will be updated on next render
    }
    
    // If in "Add to" or "Remove from" mode and we have accumulated records, re-select them
    // This uses the same logic as after query completion - selectRecordsAndPublish
    // This ensures records are selected both on the map and in the Results tab
    if ((resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection) 
        && accumulatedRecords && accumulatedRecords.length > 0) {
      
      // FIX (r018.93): Flag is now set earlier (at query switch detection) to prevent timing issues
      // Verify that the flag is already set
      debugLogger.log('RESULTS-MODE', {
        event: 'query-switch-reselection-starting',
        widgetId: props.widgetId,
        resultsMode,
        accumulatedRecordsCount: accumulatedRecords.length,
        isQuerySwitchFlagSet: isQuerySwitchInProgressRef.current,
        note: 'Flag should already be set from query switch detection',
        timestamp: Date.now()
      })
      
      // VERIFICATION LOGGING: Graphics count before clearing
      const graphicsCountBeforeClear = graphicsLayer?.graphics?.length || 0
      
      // FIX (r018.67): Clear graphics layer when switching queries to prevent stale graphics
      // from previous queries from persisting in the shared graphics layer
      if (graphicsLayer && onClearGraphicsLayer) {
        debugLogger.log('RESULTS-MODE', {
          event: 'clearing-graphics-layer-before-reselection-on-query-switch',
          widgetId: props.widgetId,
          resultsMode,
          accumulatedRecordsCount: accumulatedRecords.length,
          graphicsCountBeforeClear,
          timestamp: Date.now()
        })
        
        // FIX (r022.29): Skip clearing graphics layer in Add/Remove mode
        // Graphics are already correct and match accumulatedRecords
        // Clearing here causes unnecessary flash
        
        // VERIFICATION LOGGING: Graphics count after clearing
        const graphicsCountAfterClear = graphicsLayer?.graphics?.length || 0
        debugLogger.log('RESULTS-MODE', {
          event: 'graphics-layer-cleared-on-query-switch',
          widgetId: props.widgetId,
          graphicsCountBeforeClear,
          graphicsCountAfterClear,
          cleared: graphicsCountAfterClear === 0,
          timestamp: Date.now()
        })
      } else {
        debugLogger.log('RESULTS-MODE', {
          event: 'skipping-graphics-layer-clear-on-query-switch',
          widgetId: props.widgetId,
          reason: !graphicsLayer ? 'no-graphicsLayer' : 
                  !onClearGraphicsLayer ? 'no-onClearGraphicsLayer' : 'unknown',
          graphicsCountBeforeClear,
          timestamp: Date.now()
        })
      }
      
      // Use a delay to ensure the DS is fully ready and graphics layer props are updated after widget re-render
      // If graphics layer was just initialized, wait a bit longer for props to update
      const delay = onInitializeGraphicsLayer ? 200 : 100
      setTimeout(() => {
        const featureDS = ds as FeatureLayerDataSource
        if (featureDS && accumulatedRecords && accumulatedRecords.length > 0) {
          // r022.38: Filter accumulated records to only include records from the new query's origin layer
          // This prevents ghost selections when switching between queries with different origin layers
          const newQueryOriginDS = featureDS.getOriginDataSources?.()?.[0] || featureDS
          const newQueryOriginDSId = newQueryOriginDS.id
          
          const recordsFromNewLayer = accumulatedRecords.filter(record => {
            // Get the record's origin DS
            const recordDS = (record as any).dataSource || record.getDataSource?.()
            if (!recordDS) return false
            
            const recordOriginDS = recordDS.getOriginDataSources?.()?.[0] || recordDS
            const recordOriginDSId = recordOriginDS.id
            
            return recordOriginDSId === newQueryOriginDSId
          })
          
          debugLogger.log('RESULTS-MODE', {
            event: 'query-switch-filtering-records-by-origin-layer',
            widgetId: props.widgetId,
            totalAccumulatedCount: accumulatedRecords.length,
            newQueryOriginDSId,
            recordsFromNewLayerCount: recordsFromNewLayer.length,
            recordsFromOtherLayersCount: accumulatedRecords.length - recordsFromNewLayer.length,
            allRecordIds: accumulatedRecords.map(r => r.getId()),
            recordsFromNewLayerIds: recordsFromNewLayer.map(r => r.getId()),
            note: 'r022.38: Only reselect records that belong to the new query origin layer',
            timestamp: Date.now()
          })
          
          // Use filtered records for reselection on the new output DS
          const recordsToReselect = recordsFromNewLayer
          
          // VERIFICATION LOGGING: Show records being reselected
          debugLogger.log('RESULTS-MODE', {
            event: 'query-switch-reselecting-accumulated-records',
            widgetId: props.widgetId,
            accumulatedRecordsCount: accumulatedRecords.length,
            recordsToReselectCount: recordsToReselect.length,
            recordsToReselectIds: recordsToReselect.map(r => r.getId()).slice(0, 10),
            note: 'r022.38: Only reselecting records from new query origin layer',
            timestamp: Date.now()
          })
          
          // Only re-select if we have records to re-select
          if (recordsToReselect.length > 0) {
            const recordIds = recordsToReselect.map(record => record.getId())
            
            // DIAGNOSTIC LOGGING: What we're about to re-select
            debugLogger.log('RESULTS-MODE', {
              event: 'query-switch-before-reselection',
              widgetId: props.widgetId,
              recordsToReselectCount: recordsToReselect.length,
              recordsToReselectIds: recordIds,
              outputDSId: featureDS.id,
              graphicsLayerCountBefore: graphicsLayer?.graphics?.length || 0,
              timestamp: Date.now()
            })
            
            // Update output DS selection to keep Results tab in sync with accumulated records
            // FIX (r022.29): Pass false for useGraphicsLayer to skip graphics operations
            // Graphics are already correct and match accumulatedRecords - no need to clear/re-add
            ;(async () => {
              try {
                  await selectRecordsAndPublish(
                    props.widgetId,
                    featureDS,
                    recordIds,
                    recordsToReselect,
                    false,
                    false, // Skip graphics layer operations (no clear/re-add, eliminates flash)
                    graphicsLayer,
                    mapView
                  )
                  
                  debugLogger.log('RESULTS-MODE', {
                    event: 'query-switch-updated-output-DS-only',
                    widgetId: props.widgetId,
                    recordsReselectedCount: recordsToReselect.length,
                    graphicsCount: graphicsLayer?.graphics?.length || 0,
                    note: 'Updated output DS selection without touching graphics',
                    timestamp: Date.now()
                  })
                
                  // FIX (r018.92): Clear the query switch flag after re-selection completes
                  isQuerySwitchInProgressRef.current = false
                  
                  debugLogger.log('RESULTS-MODE', {
                    event: 'query-switch-completed-clearing-in-progress-flag',
                    widgetId: props.widgetId,
                    recordsReselected: recordIds.length,
                    timestamp: Date.now()
                  })
                  
                  // FIX (r018.86): Clean up duplicate widget output entries in data_s hash
                  // When switching queries, Experience Builder creates a new output DS with a new ID
                  // We need to remove all old widget output entries to prevent duplicates
                  const currentOutputDSId = featureDS.id
                  const hash = window.location.hash.substring(1)
                  const urlParams = new URLSearchParams(hash)
                  
                  if (urlParams.has('data_s')) {
                    const dataS = urlParams.get('data_s') || ''
                    const decodedDataS = decodeURIComponent(dataS)
                    const selections = decodedDataS.split(',')
                    
                    // Extract widget number from widgetId (e.g., "widget_12" -> "12")
                    const widgetMatch = props.widgetId.match(/widget_(\d+)/)
                    if (widgetMatch) {
                      const widgetNumber = widgetMatch[1]
                      const widgetPattern = new RegExp(`widget_${widgetNumber}_output_(\\d+)`)
                      
                      // Find all widget output entries for this widget
                      const widgetOutputEntries: Array<{selection: string, outputId: string, recordCount: number}> = []
                      selections.forEach(selection => {
                        if (selection.startsWith('id:')) {
                          const idPart = selection.substring(3)
                          const colonIndex = idPart.lastIndexOf(':')
                          if (colonIndex !== -1) {
                            const dsIdPart = idPart.substring(0, colonIndex)
                            const recordIdsPart = idPart.substring(colonIndex + 1)
                            const recordCount = recordIdsPart ? recordIdsPart.split(/[,+]/).filter(id => id).length : 0
                            
                            // Check if this matches our widget's output DS pattern
                            let outputIdMatch: RegExpMatchArray | null = null
                            if (dsIdPart.includes('~')) {
                              // Compound format: dataSource_*~widget_XX_output_*
                              const parts = dsIdPart.split('~')
                              for (const part of parts) {
                                const match = part.match(widgetPattern)
                                if (match) {
                                  outputIdMatch = match
                                  break
                                }
                              }
                            } else {
                              // Simple format: widget_XX_output_*
                              outputIdMatch = dsIdPart.match(widgetPattern)
                            }
                            
                            if (outputIdMatch) {
                              const fullOutputId = outputIdMatch[0] // e.g., "widget_12_output_28628683957324497"
                              widgetOutputEntries.push({ selection, outputId: fullOutputId, recordCount })
                            }
                          }
                        }
                      })
                      
                      // If we have multiple entries for this widget, keep only the current one
                      if (widgetOutputEntries.length > 1) {
                        const currentOutputIdShort = currentOutputDSId.split('-').pop() // Extract the numeric part
                        
                        debugLogger.log('HASH', {
                          event: 'query-switch-multiple-widget-outputs-detected',
                          widgetId: props.widgetId,
                          totalWidgetOutputs: widgetOutputEntries.length,
                          widgetOutputs: widgetOutputEntries.map(e => ({ outputId: e.outputId, recordCount: e.recordCount })),
                          currentOutputDSId,
                          currentOutputIdShort,
                          timestamp: Date.now()
                        })
                        
                        // Filter out all old widget output entries
                        const updatedSelections = selections.filter(selection => {
                          const matchingEntry = widgetOutputEntries.find(e => e.selection === selection)
                          if (matchingEntry) {
                            // Keep only the entry matching the current output DS
                            const keepEntry = matchingEntry.outputId.includes(currentOutputIdShort || '')
                            if (!keepEntry) {
                              debugLogger.log('HASH', {
                                event: 'query-switch-removing-old-widget-output',
                                widgetId: props.widgetId,
                                removedOutputId: matchingEntry.outputId,
                                removedRecordCount: matchingEntry.recordCount,
                                currentOutputDSId,
                                timestamp: Date.now()
                              })
                            }
                            return keepEntry
                          }
                          return true
                        })
                        
                        if (updatedSelections.length !== selections.length) {
                          if (updatedSelections.length > 0) {
                            urlParams.set('data_s', encodeURIComponent(updatedSelections.join(',')))
                          } else {
                            urlParams.delete('data_s')
                          }
                          window.location.hash = urlParams.toString()
                          
                          debugLogger.log('HASH', {
                            event: 'query-switch-cleaned-duplicate-widget-outputs',
                            widgetId: props.widgetId,
                            originalSelectionCount: selections.length,
                            newSelectionCount: updatedSelections.length,
                            entriesRemoved: selections.length - updatedSelections.length,
                            keptOutputDSId: currentOutputDSId,
                            keptRecordCount: recordsToReselect.length,
                            timestamp: Date.now()
                          })
                        }
                      } else if (widgetOutputEntries.length === 1) {
                        debugLogger.log('HASH', {
                          event: 'query-switch-single-widget-output-found',
                          widgetId: props.widgetId,
                          outputId: widgetOutputEntries[0].outputId,
                          recordCount: widgetOutputEntries[0].recordCount,
                          expectedRecordCount: recordsToReselect.length,
                          recordCountsMatch: widgetOutputEntries[0].recordCount === recordsToReselect.length,
                          timestamp: Date.now()
                        })
                      }
                    }
                  }
                
                  // r022.39: Update recordsRef to show ALL accumulated records (not just filtered subset)
                  // The Results tab should display records from all layers, not just the current query's layer
                  recordsRef.current = accumulatedRecords
                  setResultCount(accumulatedRecords.length)
                  
                  // VERIFICATION LOGGING: Graphics count after re-selection
                  const graphicsCountAfterReselection = graphicsLayer?.graphics?.length || 0
                  
                  debugLogger.log('RESULTS-MODE', {
                    event: 're-selected-accumulated-records-after-query-switch',
                    widgetId: props.widgetId,
                    outputDSId: featureDS.id,
                    recordsCount: recordsToReselect.length,
                    graphicsCountAfterReselection,
                    expectedGraphicsCount: recordsToReselect.length,
                    graphicsMatch: graphicsCountAfterReselection === recordsToReselect.length,
                    timestamp: Date.now()
                  })
                  
                  // Verify what's actually selected in the DS after a delay
                  setTimeout(() => {
                    const ds = DataSourceManager.getInstance().getDataSource(featureDS.id)
                    const selectedInDS = ds?.getSelectedRecords()
                    const selectedIdsInDS = ds?.getSelectedRecordIds() ?? []
                    const finalGraphicsCount = graphicsLayer?.graphics?.length || 0
                    // r018.78: Use 'recordId' attribute (not OBJECTID/id/FID) - that's how graphics-layer-utils stores them
                    const finalGraphicsIds = graphicsLayer?.graphics?.map(g => g.attributes?.recordId) || []
                    
                    debugLogger.log('RESULTS-MODE', {
                      event: 'query-switch-after-reselection-full-state',
                      widgetId: props.widgetId,
                      outputDSId: featureDS.id,
                      expectedCount: recordsToReselect.length,
                      expectedIds: recordIds,
                      actualSelectedInDS: selectedInDS?.length || 0,
                      actualSelectedIdsInDS: selectedIdsInDS,
                      finalGraphicsCount,
                      finalGraphicsIds,
                      allSourcesMatch: selectedIdsInDS.length === recordsToReselect.length &&
                                       finalGraphicsCount === recordsToReselect.length &&
                                       JSON.stringify(selectedIdsInDS.sort()) === JSON.stringify(recordIds.sort()),
                      timestamp: Date.now()
                    })
                  }, 200)
                } catch (error) {
                  debugLogger.log('RESULTS-MODE', {
                    event: 're-selection-failed-after-switch',
                    widgetId: props.widgetId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    errorStack: error instanceof Error ? error.stack : undefined
                  })
                }
              })()
          } else {
            // r022.52: No records from new layer, but still need to update output DS selection
            // for Results tab highlighting. Update ONLY output DS (not origin DS to avoid cross-layer collision)
            recordsRef.current = accumulatedRecords
            setResultCount(accumulatedRecords.length)
            
            debugLogger.log('RESULTS-MODE', {
              event: 'no-records-from-new-layer-updating-output-ds-only',
              widgetId: props.widgetId,
              outputDSId: featureDS.id,
              newLayerOriginDSId: newQueryOriginDSId,
              accumulatedRecordsCount: accumulatedRecords.length,
              recordsFromNewLayerCount: 0,
              note: 'r022.52: Updating output DS selection for Results tab highlighting',
              timestamp: Date.now()
            })
            
            // Update output DS selection (for Results tab highlighting) without touching origin DS
            if (featureDS && typeof featureDS.selectRecordsByIds === 'function') {
              const allRecordIds = accumulatedRecords.map(r => r.getId())
              featureDS.selectRecordsByIds(allRecordIds, accumulatedRecords)
              
              debugLogger.log('RESULTS-MODE', {
                event: 'output-ds-selection-updated-for-cross-layer-display',
                widgetId: props.widgetId,
                outputDSId: featureDS.id,
                recordIdsCount: allRecordIds.length,
                recordIds: allRecordIds,
                note: 'r022.52: Output DS now has all accumulated records selected for Results tab',
                timestamp: Date.now()
              })
            }
            
            // Clear the query switch flag
            isQuerySwitchInProgressRef.current = false
          }
        }
      }, 100)
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
      
      // FIX (r018.70): Only sync accumulatedRecords when there are actually selected records that are a subset
      // This prevents clearing accumulatedRecords when switching to empty data sources during query switches
      // Only sync if records were manually removed (actuallySelected < accumulated), not during empty DS switches
      if (resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection) {
        if (outputDS && accumulatedRecords && accumulatedRecords.length > 0 && onAccumulatedRecordsChange) {
          const actuallySelectedRecords = outputDS.getSelectedRecords() as FeatureDataRecord[] || []
          
          if (actuallySelectedRecords.length > 0 && actuallySelectedRecords.length < accumulatedRecords.length) {
            // Build a Set of actually selected IDs for fast lookup
            const actuallySelectedIdsSet = new Set(actuallySelectedRecords.map(r => r.getId()))
            
            // Filter accumulatedRecords to only include records that are actually selected
            const syncedRecords = accumulatedRecords.filter(record => 
              actuallySelectedIdsSet.has(record.getId())
            )
            
            const accumulatedIds = accumulatedRecords.map(r => r.getId())
            const actuallySelectedIds = actuallySelectedRecords.map(r => r.getId())
            const syncedIds = syncedRecords.map(r => r.getId())
            const removedIds = accumulatedIds.filter(id => !syncedIds.includes(id))
            
            debugLogger.log('RESULTS-MODE', {
              event: 'syncing-accumulated-records-before-query-switch',
              widgetId: props.widgetId,
              oldConfigId,
              newConfigId: queryItem.configId,
              accumulatedRecordsCountBefore: accumulatedRecords.length,
              accumulatedIdsBefore: accumulatedIds,
              actuallySelectedCount: actuallySelectedRecords.length,
              actuallySelectedIds: actuallySelectedIds,
              syncedRecordsCount: syncedRecords.length,
              syncedIds: syncedIds,
              recordsRemoved: accumulatedRecords.length - syncedRecords.length,
              removedIds: removedIds,
              note: 'FIX r022.29: Sync skipped during query switch - only needed for manual deletions',
              timestamp: Date.now()
            })
            
            // FIX (r022.29): Skip sync during query switch to prevent incorrect purging
            // This sync is only for manual deletions (X button clicks), not query switching
            // During query switch, output DS is temporarily out of sync until selectRecordsAndPublish completes
            
            // DIAGNOSTIC LOGGING: Full state AFTER sync
            debugLogger.log('RESULTS-MODE', {
              event: 'query-switch-after-sync-full-state',
              widgetId: props.widgetId,
              oldConfigId,
              newConfigId: queryItem.configId,
              accumulatedRecordsCountAfter: syncedRecords.length,
              accumulatedIdsAfter: syncedIds,
              outputDSSelectedCount: actuallySelectedRecords.length,
              outputDSSelectedIds: actuallySelectedIds,
              timestamp: Date.now()
            })
          } else {
            debugLogger.log('RESULTS-MODE', {
              event: 'accumulated-records-already-in-sync-before-query-switch',
              widgetId: props.widgetId,
              oldConfigId,
              newConfigId: queryItem.configId,
              accumulatedRecordsCount: accumulatedRecords.length,
              timestamp: Date.now()
            })
          }
        }
        
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
    // Switch to query tab but don't clear results unless explicitly requested
    // Mark as manual switch to prevent auto-switch useEffect from interfering
    manualTabSwitchRef.current = true
    setActiveTab('query')
    // Reset the flag after a short delay
    setTimeout(() => {
      manualTabSwitchRef.current = false
    }, 100)
    // Only change stage if we're clearing results
    // Otherwise, keep stage at 1 (results available) so results persist
    if (!clearResults && resultCount > 0) {
      setStage(1) // Keep results available
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
   * @param tab - The tab to switch to ('query' | 'results')
   * @param event - Optional mouse event to prevent default behavior
   */
  const handleTabChange = React.useCallback((tab: 'query' | 'results', event?: React.MouseEvent) => {
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
   * Internal implementation of handleFormSubmit (without waiting logic)
   * This is called either directly or after hash value conversion
   * 
   * @param sqlExpr - The SQL expression for attribute filtering
   * @param spatialFilter - The spatial filter object
   * @param runtimeZoomToSelected - Optional runtime override for zoom-to-selected behavior
   */
  const handleFormSubmitInternal = React.useCallback(async (sqlExpr: IMSqlExpression, spatialFilter: SpatialFilterObj, runtimeZoomToSelected?: boolean) => {
    // Clear previous errors when starting a new query
    setSelectionError(null)
    setZoomError(null)
    
    debugLogger.log('TASK', {
      event: 'handleFormSubmitInternal-executing',
      widgetId: props.widgetId,
      resultsMode,
      timestamp: Date.now()
    })

    // Check outputDS exists before proceeding
    if (!outputDS) {
      pendingQueryAfterClearRef.current = { sqlExpr, spatialFilter, runtimeZoomToSelected }
      debugLogger.log('TASK', {
        event: 'handleFormSubmitInternal-no-outputDS',
        widgetId: props.widgetId,
        note: 'OutputDS null (e.g. Query-tab clear); stored pending query, will run when handleOutputDataSourceCreated fires',
        timestamp: Date.now()
      })
      setStage(0)
      return
    }

    // Store the runtime zoom override for use by Add to Map action
    lastRuntimeZoomToSelectedRef.current = runtimeZoomToSelected
    
    attributeFilterSqlExprObj.current = sqlExpr
    spatialFilterObj.current = spatialFilter
    // Load the first page
    const featureDS = outputDS as FeatureLayerDataSource
    
    // For "Add to" and "Remove from" modes, use widget-level accumulated records
    // These persist across query switches, unlike query-item-level records
    let existingRecordsForMerge: FeatureDataRecord[] = []
    if (resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection) {
      // Robust capture strategy:
      // 1. Try records from props (already merged by parent)
      // 2. Fallback to currently selected records in DS (captured during mode switch)
      const fromProp = accumulatedRecords || []
      const fromDS = outputDS?.getSelectedRecords() as FeatureDataRecord[] || []
      
      // Diagnostic: Capture existing records from both sources
      debugLogger.log('RESULTS-MODE', {
        event: 'capture-existing-records-detailed',
        widgetId: props.widgetId,
        queryItemId: props.queryItem?.id,
        fromPropCount: fromProp.length,
        fromPropIds: fromProp.map(r => r.getId?.()).slice(0, 5),
        fromDSCount: fromDS.length,
        fromDSIds: fromDS.map(r => r.getId?.()).slice(0, 5),
        outputDSId: outputDS?.id,
        resultsMode,
        timestamp: Date.now()
      })
      
      existingRecordsForMerge = fromProp.length > 0 ? fromProp : fromDS
      
      // Diagnostic: Final existing records selected
      debugLogger.log('RESULTS-MODE', {
        event: 'final-existing-records-selected',
        widgetId: props.widgetId,
        finalCount: existingRecordsForMerge.length,
        finalIds: existingRecordsForMerge.map(r => r.getId?.()).slice(0, 5),
        source: fromProp.length > 0 ? 'accumulatedRecords-prop' : 'outputDS-getSelectedRecords',
        timestamp: Date.now()
      })
      
      debugLogger.log('RESULTS-MODE', {
        event: 'captured-existing-records-diagnostic',
        widgetId: props.widgetId,
        resultsMode,
        fromPropCount: fromProp.length,
        fromDSCount: fromDS.length,
        finalCapturedCount: existingRecordsForMerge.length,
        firstRecordId: existingRecordsForMerge[0]?.getId?.() || 'none',
        allRecordIds: existingRecordsForMerge.map(r => r.getId?.()).slice(0, 10),
        outputDSId: outputDS.id,
        timestamp: Date.now()
      })
    }
    
    // For "New" mode, clear old results and graphics layer
    // We call clearResult() directly and AWAIT it to ensure it's finished before query execution starts
    if (resultsMode === SelectionType.NewSelection) {
      debugLogger.log('TASK', {
        event: 'handleFormSubmit-clearing-results-for-new-mode',
        widgetId: props.widgetId,
        timestamp: Date.now()
      })
      await clearResult('handleFormSubmit-new-mode')
    }
    
    // Set loading stage
    setStage(2)
    
    // FORCED: Always use SimpleList - fetch ALL records, not just a page
    // Use data source's max record count, or fall back to a large number (10000)
    const maxRecordCount = (featureDS as any).getMaxRecordCount?.() ?? 10000
    let pageSize = maxRecordCount
    const queryParams = generateQueryParams(featureDS, sqlExpr, spatialFilter, currentItem, 1, pageSize)
    queryParamRef.current = queryParams
    
    debugLogger.log('TASK', {
      event: 'handleFormSubmit-executing-query',
      widgetId: props.widgetId,
      where: queryParams.where,
      resultsMode,
      timestamp: Date.now()
    })
    // Change output ds status to unloaded before use it to load count/records.
    featureDS.setStatus(DataSourceStatus.Unloaded)
    featureDS.setCountStatus(DataSourceStatus.Unloaded)
    let queryResultCount = 0 // Capture count from records to use in finally block
    const startTime = performance.now()
    
    debugLogger.log('TASK', {
      event: 'perf-query-chain-start',
      widgetId: props.widgetId,
      resultsMode,
      where: queryParams.where,
      timestamp: Date.now()
    })

    // PERFORMANCE OPTIMIZATION: Removed redundant executeCountQuery() round-trip.
    // Since we fetch ALL records (pageSize = maxRecordCount), we can just use records.length.
    featureDS.updateQueryParams(queryParamRef.current, props.widgetId)
    
    const fetchStartTime = performance.now()
    executeQuery(props.widgetId, queryItem, featureDS, queryParamRef.current)
      .then(async (result) => {
        const fetchDurationMs = Math.round(performance.now() - fetchStartTime)
        const processingStartTime = performance.now()
        
        queryResultCount = result.records?.length || 0
        
        debugLogger.log('RESULTS-MODE', {
          event: 'query-execution-complete',
          widgetId: props.widgetId,
          resultsMode,
          recordsReturned: queryResultCount,
          fetchDurationMs,
          existingCapturedCount: existingRecordsForMerge.length,
          timestamp: Date.now()
        })
        
        // r022.8: Detect zero results and show alert (force new state each time)
        if (queryResultCount === 0) {
          setNoResultsAlert({
            show: true,
            recordsRequested: queryResultCount,
            queryValue: queryParamRef.current?.where || '',
            timestamp: Date.now() // r022.8: Unique timestamp forces React to recognize as new state
          })
          
          debugLogger.log('RESULTS-MODE', {
            event: 'no-results-alert-triggered',
            widgetId: props.widgetId,
            resultsMode,
            queryValue: queryParamRef.current?.where || '',
            timestamp: Date.now()
          })
        } else {
          // Clear any existing alert when query succeeds
          setNoResultsAlert(null)
        }

        let recordsToDisplay = result.records || []
        let dsToUse = outputDS
        
        // Handle "Add to" mode: merge new results with widget-level accumulated records
        if (resultsMode === SelectionType.AddToSelection) {
          if (result.records && result.records.length > 0) {
            try {
              // FIX (r018.96): No manual removal filtering needed
              // Duplicate detection in mergeResultsIntoAccumulated handles preventing duplicates
              debugLogger.log('RESULTS-MODE', {
                event: 'add-mode-starting-merge',
                widgetId: props.widgetId,
                existingCount: existingRecordsForMerge.length,
                existingIds: existingRecordsForMerge.map(r => r.getId?.()).slice(0, 5),
                newRecordsCount: result.records.length,
                newRecordIds: result.records?.slice(0, 5).map((r: any) => r.getId?.()),
                note: 'r018.96: No manual removal filtering - duplicate detection handles this',
                timestamp: Date.now()
              })

              // r021.87: Merge function reads __queryConfigId from record attributes
              // This keeps duplicate detection logic in ONE place (results-management-utils.ts)
              const mergeResult = mergeResultsIntoAccumulated(
                outputDS as FeatureLayerDataSource, // Use outputDS for NEW records
                result.records as FeatureDataRecord[],
                existingRecordsForMerge, // Use consistently captured records
                queryItems // For looking up originDS by __queryConfigId
              )
              
              const mergedRecords = mergeResult.mergedRecords
              const addedIds = mergeResult.addedRecordIds
              const duplicateIds = mergeResult.duplicateRecordIds
              
              recordsToDisplay = mergedRecords

              // For diagnostic logging only
              const existingIds = existingRecordsForMerge.map(r => r.getId())
              const newRecordIds = result.records.map(r => r.getId())
              const mergedIds = mergedRecords.map(r => r.getId())
              
              debugLogger.log('RESULTS-MODE', {
                event: 'add-mode-merge-complete',
                widgetId: props.widgetId,
                existingCount: existingRecordsForMerge.length,
                existingIds: existingIds.slice(0, 10),
                newRecordsCount: result.records.length,
                newRecordIds: newRecordIds.slice(0, 10),
                mergedRecordsCount: mergedRecords.length,
                mergedIds: mergedIds.slice(0, 10),
                addedIds: addedIds.slice(0, 10),
                duplicateIds: duplicateIds.slice(0, 10),
                duplicatesSkipped: duplicateIds.length,
                recordsAdded: addedIds.length,
                note: 'r021.84: Duplicate detection logic is now in ONE place (results-management-utils)',
                timestamp: Date.now()
              })
              
              // r022.21: Detect Add mode when all records are duplicates (none added)
              if (result.records.length > 0 && addedIds.length === 0 && duplicateIds.length === result.records.length) {
                setAllDuplicatesAlert({
                  show: true,
                  recordsFound: result.records.length,
                  queryValue: queryParamRef.current?.where || '',
                  timestamp: Date.now()
                })
                
                debugLogger.log('RESULTS-MODE', {
                  event: 'all-duplicates-alert-triggered',
                  widgetId: props.widgetId,
                  recordsFound: result.records.length,
                  duplicatesSkipped: duplicateIds.length,
                  queryValue: queryParamRef.current?.where || '',
                  note: 'Query found records but all were already in Results',
                  timestamp: Date.now()
                })
              } else {
                // Clear any existing alert when records are successfully added
                setAllDuplicatesAlert(null)
              }
              
              // Update widget-level accumulated records so they persist across query switches
              if (onAccumulatedRecordsChange) {
                onAccumulatedRecordsChange(mergedRecords)
              }
              
              // r021.87: Store queryConfigId directly on record when added - no map needed
              currentQueryRecordIdsRef.current = addedIds
              
              result.records.forEach(record => {
                const recordId = record.getId()
                // Only stamp records that were actually added (not duplicates)
                if (addedIds.includes(recordId)) {
                  // Store queryConfigId directly on the record
                  if (record.feature && record.feature.attributes) {
                    record.feature.attributes.__queryConfigId = queryItem.configId
                  }
                  
                  debugLogger.log('RESULTS-MODE', {
                    event: 'queryConfigId-stamped-on-record',
                    widgetId: props.widgetId,
                    recordId,
                    queryConfigId: queryItem.configId,
                    storedOnRecord: !!record.feature?.attributes,
                    timestamp: Date.now()
                  })
                }
              })
            } catch (error) {
              debugLogger.log('RESULTS-MODE', {
                event: 'add-mode-error',
                widgetId: props.widgetId,
                error: error instanceof Error ? error.message : 'Unknown error',
                errorStack: error instanceof Error ? error.stack : undefined,
                note: 'r018.96: Falling back to existing records on error',
                timestamp: Date.now()
              })
              // Fall back to existing records on error
              recordsToDisplay = existingRecordsForMerge
            }
          } else {
            // Query returned 0 results - preserve existing accumulated records
            debugLogger.log('RESULTS-MODE', {
              event: 'add-mode-zero-results',
              widgetId: props.widgetId,
              existingCount: existingRecordsForMerge.length,
              note: 'Query returned 0 results - preserving existing accumulated records',
              timestamp: Date.now()
            })
            recordsToDisplay = existingRecordsForMerge
          }
        } else if (resultsMode === SelectionType.RemoveFromSelection) {
          // Handle "Remove from" mode: remove matching records from widget-level accumulated records
          try {
            // r022.73: DIAGNOSTIC - Check if accumulated records have __queryConfigId
            debugLogger.log('RESULTS-MODE', {
              event: 'remove-mode-accumulated-records-audit',
              widgetId: props.widgetId,
              existingCount: existingRecordsForMerge.length,
              recordsWithConfigId: existingRecordsForMerge.filter(r => r.feature?.attributes?.__queryConfigId).length,
              sampleRecords: existingRecordsForMerge.slice(0, 3).map(r => ({
                recordId: r.getId(),
                hasConfigId: !!r.feature?.attributes?.__queryConfigId,
                queryConfigId: r.feature?.attributes?.__queryConfigId || 'MISSING'
              })),
              timestamp: Date.now()
            })
            
            debugLogger.log('RESULTS-MODE', {
              event: 'remove-mode-starting-merge',
              widgetId: props.widgetId,
              existingCount: existingRecordsForMerge.length,
              removeCount: result.records?.length || 0
            })
            // Check if we have accumulated records to remove from
            if (existingRecordsForMerge.length === 0) {
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-no-accumulated-records',
                widgetId: props.widgetId,
                queryRecordsCount: result.records?.length || 0,
                note: 'No accumulated records to remove from - no-op'
              })
              // No accumulated records, so nothing to remove - show empty results
              recordsToDisplay = []
            } else if (result.records && result.records.length > 0) {
              // Remove matching records from accumulated records
              const remainingRecords = removeResultsFromAccumulated(
                outputDS as FeatureLayerDataSource, // Use outputDS for key generation
                result.records as FeatureDataRecord[],
                existingRecordsForMerge // Use consistently captured records
              )
              
              recordsToDisplay = remainingRecords
              
              // Update widget-level accumulated records
              if (onAccumulatedRecordsChange) {
                onAccumulatedRecordsChange(remainingRecords)
              }
              
              // FIX (r018.86): DIAGNOSTIC - Graphics count BEFORE removeRecordsFromOriginSelections
              const graphicsCountBeforeRemoveMode = graphicsLayer?.graphics?.length || 0
              const graphicsIdsBeforeRemoveMode = graphicsLayer?.graphics?.map(g => g.attributes?.recordId).slice(0, 10) || []
              
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-BEFORE-removeRecordsFromOriginSelections',
                widgetId: props.widgetId,
                recordsToRemoveCount: result.records.length,
                recordsToRemoveIds: result.records.map(r => r.getId()).slice(0, 10),
                graphicsCountBefore: graphicsCountBeforeRemoveMode,
                graphicsIdsBefore: graphicsIdsBeforeRemoveMode,
                timestamp: Date.now()
              })
              
              // Remove records from origin data source selections (map highlighting)
              // FIX (r018.86): DON'T pass graphics layer parameters here - let graphics be managed by selection sync
              // This matches the fix for X button removal (r018.85)
              // Graphics will be synced through the normal selection flow after this operation
              // r022.73: Pass accumulated records so removal can look up __queryConfigId for composite keys
              removeRecordsFromOriginSelections(
                props.widgetId,
                result.records as FeatureDataRecord[],
                outputDS as FeatureLayerDataSource,
                undefined, // useGraphicsLayer
                undefined, // graphicsLayer
                existingRecordsForMerge // r022.73: Pass accumulated records for queryConfigId lookup
              )
              
              // FIX (r018.104): Manually remove graphics from graphics layer
              // Similar to X button removal fix (r018.90), we need to explicitly remove graphics
              // since removeRecordsFromOriginSelections doesn't receive graphics layer params
              // r021.91: Pass records for composite key matching
              if (graphicsLayer && result.records && result.records.length > 0) {
                const removedRecordIds = result.records.map(r => r.getId())
                removeHighlightGraphics(graphicsLayer, removedRecordIds, result.records as FeatureDataRecord[])
                
                debugLogger.log('RESULTS-MODE', {
                  event: 'remove-mode-manual-graphics-removal',
                  widgetId: props.widgetId,
                  graphicsCountBefore: graphicsCountBeforeRemoveMode,
                  graphicsCountAfter: graphicsLayer?.graphics?.length || 0,
                  removedRecordIdsCount: removedRecordIds.length,
                  removedRecordIds: removedRecordIds.slice(0, 10),
                  timestamp: Date.now()
                })
              }
              
              // r021.5 FIX: Close popup when executing Remove mode query
              if (mapView?.popup?.visible) {
                mapView.popup.close()
                debugLogger.log('POPUP', {
                  event: 'popup-closed-on-remove-mode-query',
                  widgetId: props.widgetId,
                  removedRecordsCount: result.records.length,
                  reason: 'Remove mode query executed',
                  timestamp: Date.now()
                })
              }
              
              // FIX (r018.86): DIAGNOSTIC - Graphics count AFTER removeRecordsFromOriginSelections
              const graphicsCountAfterRemoveMode = graphicsLayer?.graphics?.length || 0
              const graphicsIdsAfterRemoveMode = graphicsLayer?.graphics?.map(g => g.attributes?.recordId).slice(0, 10) || []
              
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-AFTER-removeRecordsFromOriginSelections',
                widgetId: props.widgetId,
                graphicsCountBefore: graphicsCountBeforeRemoveMode,
                graphicsCountAfter: graphicsCountAfterRemoveMode,
                graphicsIdsAfter: graphicsIdsAfterRemoveMode,
                graphicsChanged: graphicsCountAfterRemoveMode !== graphicsCountBeforeRemoveMode,
                graphicsChangedBy: graphicsCountAfterRemoveMode - graphicsCountBeforeRemoveMode,
                expected: 'Graphics SHOULD NOW be removed (r018.104 fix)',
                timestamp: Date.now()
              })
              
              const actualRemovalCount = existingRecordsForMerge.length - remainingRecords.length
              
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-complete',
                widgetId: props.widgetId,
                existingAccumulatedRecordsCount: existingRecordsForMerge.length,
                queryRecordsCount: result.records.length,
                remainingRecordsCount: remainingRecords.length,
                recordsRemoved: actualRemovalCount,
                outputDSId: outputDS.id,
                widgetLevelRecordsUpdated: true,
                originSelectionsUpdated: true
              })
              
              // r022.15: Detect Remove mode with no actual removals (query found records but none matched)
              if (result.records.length > 0 && actualRemovalCount === 0) {
                setNoRemovalAlert({
                  show: true,
                  recordsFound: result.records.length,
                  queryValue: queryParamRef.current?.where || '',
                  timestamp: Date.now()
                })
                
                debugLogger.log('RESULTS-MODE', {
                  event: 'no-removal-alert-triggered',
                  widgetId: props.widgetId,
                  recordsFound: result.records.length,
                  queryValue: queryParamRef.current?.where || '',
                  note: 'Query found records but none were in accumulated results to remove',
                  timestamp: Date.now()
                })
              } else {
                // Clear any existing alert when removal succeeds
                setNoRemovalAlert(null)
              }
              
              // If all records removed, auto-clear (consistent with user expectation)
              if (remainingRecords.length === 0) {
                debugLogger.log('RESULTS-MODE', {
                  event: 'remove-mode-all-records-removed',
                  widgetId: props.widgetId,
                  note: 'All accumulated records removed - auto-clearing'
                })
                // Clear widget-level accumulated records
                if (onAccumulatedRecordsChange) {
                  onAccumulatedRecordsChange([])
                }
              }
            } else {
              // Query returned no results - nothing to remove
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-no-query-results',
                widgetId: props.widgetId,
                existingAccumulatedRecordsCount: existingRecordsForMerge.length,
                note: 'Query returned no results - no records to remove'
              })
              // Keep existing accumulated records displayed
              recordsToDisplay = existingRecordsForMerge
            }
          } catch (error) {
            debugLogger.log('RESULTS-MODE', {
              event: 'remove-mode-error',
              widgetId: props.widgetId,
              error: error instanceof Error ? error.message : 'Unknown error',
              errorStack: error instanceof Error ? error.stack : undefined
            })
            // Fall back to showing query results on error
            recordsToDisplay = result.records || []
          }
        } else if (resultsMode === SelectionType.NewSelection) {
          // FIX (r018.97): For "New" mode, populate accumulatedRecords with query results
          // This ensures tab count updates correctly when records are removed in New mode
          if (onAccumulatedRecordsChange && recordsToDisplay && recordsToDisplay.length > 0) {
            onAccumulatedRecordsChange(recordsToDisplay as FeatureDataRecord[])
            debugLogger.log('RESULTS-MODE', {
              event: 'new-mode-populating-accumulated-records',
              widgetId: props.widgetId,
              recordsCount: recordsToDisplay.length,
              note: 'r018.97: Populate accumulatedRecords in New mode for universal tab count',
              timestamp: Date.now()
            })
            
            // r021.87: In NEW mode, stamp queryConfigId on all records
            currentQueryRecordIdsRef.current = (recordsToDisplay as FeatureDataRecord[]).map(r => r.getId());
            
            (recordsToDisplay as FeatureDataRecord[]).forEach(record => {
              if (record.feature && record.feature.attributes) {
                record.feature.attributes.__queryConfigId = queryItem.configId
              }
            })
          } else if (onAccumulatedRecordsChange) {
            // No results - clear accumulatedRecords
            onAccumulatedRecordsChange([])
          }
        }
        
        recordsRef.current = recordsToDisplay
        // Reset selection flag for new query results
        hasSelectedRecordsRef.current = false
        
        // r022.44: DIAGNOSTIC - Log state BEFORE selection condition check
        debugLogger.log('SELECTION-STATE-AUDIT', {
          event: 'before-selection-condition-check',
          widgetId: props.widgetId,
          resultsMode,
          hasRecordsToDisplay: !!recordsToDisplay,
          recordsToDisplayLength: recordsToDisplay?.length || 0,
          hasDsToUse: !!dsToUse,
          conditionWillPass: !!(recordsToDisplay && recordsToDisplay.length > 0 && dsToUse),
          timestamp: Date.now()
        })
        
        // Select records in the output DS
        // For "Add to" mode, select merged records
        // For "Remove from" mode, select remaining records (already updated via removeRecordsFromOriginSelections)
        // For "New" mode, select query results
        if (recordsToDisplay && recordsToDisplay.length > 0 && dsToUse) {
          const recordIdsToSelect = recordsToDisplay.map(record => record.getId())
          
          // For "Remove from" mode, selection was already updated via removeRecordsFromOriginSelections
          // But we still need to select in the outputDS for widget state consistency
          if (resultsMode === SelectionType.RemoveFromSelection) {
            // Selection was already updated in origin DSs via removeRecordsFromOriginSelections
            // Just update outputDS selection for widget state consistency
            try {
              if (typeof dsToUse.selectRecordsByIds === 'function') {
                dsToUse.selectRecordsByIds(recordIdsToSelect, recordsToDisplay as FeatureDataRecord[])
              }
              hasSelectedRecordsRef.current = true
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-output-ds-selection-updated',
                widgetId: props.widgetId,
                recordCount: recordsToDisplay.length
              })
            } catch (error) {
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-output-ds-selection-error',
                widgetId: props.widgetId,
                error: error instanceof Error ? error.message : 'Unknown error'
              })
            }
          } else {
            // For "Add to" and "New" modes, select records with cross-layer grouping
            setSelectionError(null)
            ;(async () => {
              try {
                // r022.73: Group records by __queryConfigId to prevent cross-layer selection pollution
                // This ensures each layer only gets its own record IDs selected
                debugLogger.log('SELECTION-STATE-AUDIT', {
                  event: 'r022-73-grouping-starting',
                  widgetId: props.widgetId,
                  recordsToDisplayCount: recordsToDisplay.length,
                  timestamp: Date.now()
                })
                
                const { DataSourceManager } = await import('jimu-core')
                const dsManager = DataSourceManager.getInstance()
                const recordsByOriginDS = new Map<DataSource, FeatureDataRecord[]>()
                
                for (const record of recordsToDisplay as FeatureDataRecord[]) {
                  const queryConfigId = record.feature?.attributes?.__queryConfigId
                  
                  debugLogger.log('SELECTION-STATE-AUDIT', {
                    event: 'r022-73-checking-record',
                    recordId: record.getId(),
                    hasQueryConfigId: !!queryConfigId,
                    queryConfigId,
                    timestamp: Date.now()
                  })
                  
                  if (!queryConfigId) continue
                  
                  const matchingQueryItem = props.queryItems?.find(qi => qi.configId === queryConfigId)
                  if (!matchingQueryItem?.useDataSource) continue
                  
                  const outputDS = dsManager.getDataSource(matchingQueryItem.useDataSource.dataSourceId)
                  const originDS = outputDS?.getOriginDataSources?.()?.[0] || outputDS
                  if (!originDS) continue
                  
                  if (!recordsByOriginDS.has(originDS)) {
                    recordsByOriginDS.set(originDS, [])
                  }
                  recordsByOriginDS.get(originDS).push(record)
                }
                
                debugLogger.log('SELECTION-STATE-AUDIT', {
                  event: 'r022-73-grouping-complete',
                  widgetId: props.widgetId,
                  originDSCount: recordsByOriginDS.size,
                  groups: Array.from(recordsByOriginDS.entries()).map(([ds, records]) => ({
                    originDSId: ds.id,
                    recordCount: records.length,
                    recordIds: records.map(r => r.getId())
                  })),
                  timestamp: Date.now()
                })
                
                // r022.73: Clear all origin DS selections first
                for (const [originDS, records] of recordsByOriginDS.entries()) {
                  if (typeof originDS.selectRecordsByIds === 'function') {
                    originDS.selectRecordsByIds([], [])
                  }
                }
                
                // r022.73: Select each origin DS group with its correct records (NO GRAPHICS)
                for (const [originDS, records] of recordsByOriginDS.entries()) {
                  const recordIds = records.map(r => r.getId())
                  
                  if (typeof originDS.selectRecordsByIds === 'function') {
                    originDS.selectRecordsByIds(recordIds, records)
                    debugLogger.log('SELECTION-STATE-AUDIT', {
                      event: 'r022-73-origin-ds-selected',
                      originDSId: originDS.id,
                      recordCount: recordIds.length,
                      recordIds: recordIds,
                      timestamp: Date.now()
                    })
                  }
                }
                
                // r022.73: Update outputDS for Results tab with ALL records (cross-layer display)
                if (typeof dsToUse.selectRecordsByIds === 'function') {
                  dsToUse.selectRecordsByIds(recordIdsToSelect, recordsToDisplay as FeatureDataRecord[])
                }
                
                // Dispatch custom selection event so Widget state is updated immediately
                dispatchSelectionEvent(props.widgetId, recordIdsToSelect, dsToUse, queryItem.configId, eventManager, accumulatedRecords?.length)
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to select query results'
                setSelectionError(errorMessage)
                debugLogger.log('TASK', {
                  event: 'selection-failed',
                  error: errorMessage,
                  errorStack: error instanceof Error ? error.stack : undefined,
                  recordCount: recordIdsToSelect.length
                })
              }
            })()
          }
        } else if (resultsMode === SelectionType.RemoveFromSelection && recordsToDisplay.length === 0) {
          // All records removed - clear selection
          ;(async () => {
              try {
              await clearSelectionInDataSources(props.widgetId, dsToUse, true, graphicsLayer)
              hasSelectedRecordsRef.current = false
              
              // Notify Widget that selection is cleared (pass 0 so handler does not read stale count)
              dispatchSelectionEvent(props.widgetId, [], dsToUse, queryItem.configId, eventManager, 0)
              
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-all-records-removed-selection-cleared',
                widgetId: props.widgetId
              })
            } catch (error) {
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-clear-selection-error',
                widgetId: props.widgetId,
                error: error instanceof Error ? error.message : 'Unknown error'
              })
            }
          })()
        }
        
        // r022.22: Store the CURRENT query's result count (not accumulated count)
        // This allows auto-tab-switch to check if THIS query returned results
        lastQueryResultCountRef.current = queryResultCount
        
        // Mark that query just executed BEFORE updating resultCount
        // This ensures the auto-switch useEffect sees queryJustExecuted === true
        setQueryJustExecuted(true)
        debugLogger.log('TASK', {
          event: 'query-executed-flag-set',
          widgetId: props.widgetId,
          queryItemConfigId: queryItem.configId,
          resultsMode,
          recordsToDisplayCount: recordsToDisplay.length,
          queryResultCount,
          lastQueryResultCountRef: lastQueryResultCountRef.current,
          timestamp: Date.now()
        })
        
        // Update result count FIRST (before any parent callbacks that might cause re-renders)
        // For "Add to" and "Remove from" modes, use accumulated/remaining count
        // For "New" mode, use query count
        const newResultCount = resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection
          ? recordsToDisplay.length
          : queryResultCount
        
        setResultCount(newResultCount)
        
        // INSTANT UI FIX (The "Spinner Bypass"): 
        // Decouple the "Retrieving results..." spinner from asynchronous actions like zooming. 
        // By calling setStage(1) now, the user sees the result list immediately while 
        // the map animation continues in the background.
        setStage(1) 
        
        debugLogger.log('TASK', {
          event: 'perf-processing-complete',
          widgetId: props.widgetId,
          processingDurationMs: Math.round(performance.now() - processingStartTime),
          totalChainDurationMs: Math.round(performance.now() - startTime),
          newResultCount,
          resultsMode,
          timestamp: Date.now()
        })

        // Zoom to records using shared zoom utility (consistent padding behavior)
        // Use runtime preference if provided, otherwise fall back to config setting (defaults to true)
        const shouldZoom = runtimeZoomToSelected !== undefined 
          ? runtimeZoomToSelected 
          : (queryItem.zoomToSelected !== false)
        
        // Use the output DS and merged records
        const recordsForZoom = recordsToDisplay || result.records
        const dsForZoom = dsToUse || outputDS
        
        if (recordsForZoom && recordsForZoom.length > 0 && dsForZoom && shouldZoom) {
          try {
            await zoomToRecords(recordsForZoom as FeatureDataRecord[])
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to zoom to features'
            setZoomError(errorMessage)
            debugLogger.log('ZOOM', {
              event: 'zoom-goTo-error-query',
              error: errorMessage,
              errorStack: error instanceof Error ? error.stack : undefined
            })
            debugLogger.log('ZOOM', {
              event: 'zoom-to-records-error',
              widgetId: props.widgetId,
              error: error instanceof Error ? error.message : String(error),
              errorStack: error instanceof Error ? error.stack : undefined,
              timestamp: Date.now()
            })
          }
        }
        
        // NOW call onHashParameterUsed AFTER all UI updates and zoom operations complete
        // This prevents the parent re-render from interrupting the promise chain
        // This prevents hash parameters from re-executing when switching queries
        if (initialInputValue && queryItem.shortId && onHashParameterUsed) {
          debugLogger.log('HASH-EXEC', {
            event: 'querytask-calling-onhashparameterused',
            widgetId: props.widgetId,
            queryItemConfigId: props.queryItem.configId,
            queryItemShortId: queryItem.shortId,
            initialInputValue,
            timestamp: Date.now()
          })
          
          debugLogger.log('TASK', {
            event: 'hash-query-executed-notifying-parent',
            widgetId: props.widgetId,
            queryItemConfigId: queryItem.configId,
            queryItemShortId: queryItem.shortId,
            initialInputValue,
            timestamp: Date.now()
          })
          onHashParameterUsed(queryItem.shortId)
          
          debugLogger.log('HASH-EXEC', {
            event: 'querytask-onhashparameterused-called',
            widgetId: props.widgetId,
            queryItemConfigId: props.queryItem.configId,
            queryItemShortId: queryItem.shortId,
            timestamp: Date.now()
          })
          
          // Fire event to notify HelperSimple that hash query execution is complete
          // This allows HelperSimple to track which hash parameters have been executed
          // to prevent re-execution when switching queries
          const hashParam = `${queryItem.shortId}=${initialInputValue}`
          const executedEvent = new CustomEvent(QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT, {
            detail: {
              widgetId: props.widgetId,
              shortId: queryItem.shortId,
              value: initialInputValue,
              hashParam
            },
            bubbles: true,
            cancelable: true
          })
          window.dispatchEvent(executedEvent)
          
          debugLogger.log('HASH-EXEC', {
            event: 'querytask-hash-query-executed-event-dispatched',
            widgetId: props.widgetId,
            queryItemConfigId: queryItem.configId,
            queryItemShortId: queryItem.shortId,
            initialInputValue,
            hashParam,
            timestamp: Date.now()
          })
        }
        
        return Promise.resolve(true)
      })
      .catch(error => {
        debugLogger.log('TASK', {
          event: 'query-chain-failed-diagnostic',
          widgetId: props.widgetId,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          timestamp: Date.now()
        })
        setStage(0) // Return control to user - exit Stage 2 on error
      })
      .finally(() => {
        if (spatialFilter?.layer && spatialFilter?.clearAfterApply) {
          spatialFilter.layer.removeAll()
        }
        // setStage(1) // Removed from here; now called in the main chain before background actions
      })
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
   * Checks if hash value needs conversion and waits for event if needed.
   * 
   * @param sqlExpr - The SQL expression for attribute filtering
   * @param spatialFilter - The spatial filter object
   * @param runtimeZoomToSelected - Optional runtime override for zoom-to-selected behavior
   */
  const handleFormSubmit = React.useCallback(async (sqlExpr: IMSqlExpression, spatialFilter: SpatialFilterObj, runtimeZoomToSelected?: boolean) => {
    // LOG AT THE VERY START - before any checks
    debugLogger.log('TASK', {
      event: 'handleFormSubmit-called',
      widgetId: props.widgetId,
      sqlExprExists: !!sqlExpr,
      firstPartExists: !!sqlExpr?.parts?.[0],
      isRetry: isRetryAfterClearRef.current,
      timestamp: Date.now()
    })
    
    // ============================================================================
    // r021.35/36: Memory Fix - Manual Cleanup + DS Destroy + Programmatic Clear
    // ============================================================================
    // In NEW mode with existing results: Clean refs/graphics → Destroy OutputDataSource → 
    // Click Clear button (triggers React to recreate DS) → Execute query via callback.
    //
    // ⚠️ DO NOT REMOVE: The programmatic button click is required. React doesn't detect 
    // DataSource destruction through state updates alone. Direct cleanup attempts cause 
    // double-click bugs. See OUTPUTDATASOURCE_MEMORY_LEAK_INVESTIGATION.md for details.
    // ============================================================================
    
    const hasExistingRecords = outputDS?.getSourceRecords()?.length > 0 || recordsRef.current?.length > 0
    const needsClear = resultsMode === SelectionType.NewSelection && hasExistingRecords && !isRetryAfterClearRef.current
    
    if (needsClear) {
      debugLogger.log('TASK', {
        event: 'memory-workflow-start',
        widgetId: props.widgetId,
        outputDSRecords: outputDS?.getSourceRecords()?.length || 0,
        recordsRefCount: recordsRef.current?.length || 0,
        timestamp: Date.now()
      })
      
      isRetryAfterClearRef.current = true
      setStage(2)
      
      // Store pending query for execution after DS recreation
      pendingQueryAfterClearRef.current = {
        sqlExpr,
        spatialFilter,
        runtimeZoomToSelected
      }
      
      // Manual cleanup: refs, graphics, selection
      debugLogger.log('TASK', {
        event: 'memory-cleanup-start',
        widgetId: props.widgetId,
        timestamp: Date.now()
      })
      
      recordsRef.current = null
      outputDS?.setStatus(DataSourceStatus.NotReady)
      setResultCount(0)
      
      try {
        await clearSelectionInDataSources(props.widgetId, outputDS, true, graphicsLayer)
      } catch (error) {
        debugLogger.log('ERROR', { event: 'selection-clear-failed', error: error.message })
      }
      
      if (graphicsLayer && mapView) {
        try{
          cleanupGraphicsLayer(props.widgetId, mapView)
          onDestroyGraphicsLayer?.()
        } catch (error) {
          debugLogger.log('ERROR', { event: 'graphics-cleanup-failed', error: error.message })
        }
      }
      
      if (mapView?.popup?.visible) {
        mapView.popup.close()
      }
      
      if (onAccumulatedRecordsChange) {
        onAccumulatedRecordsChange([])
      }
      
      if (props.eventManager && outputDS) {
        dispatchSelectionEvent(props.widgetId, [], outputDS, queryItem.configId, props.eventManager, 0)
      }
      
      await publishDataClearedMsg()
      
      hasSelectedRecordsRef.current = false
      queryExecutionKeyRef.current += 1
      setSelectionError(null)
      setZoomError(null)
      
      // Destroy DataSource (frees ESRI observers and memory)
      if (outputDS) {
        try {
          const dsId = outputDS.id
          DataSourceManager.getInstance().destroyDataSource(dsId)
          debugLogger.log('TASK', {
            event: 'datasource-destroyed',
            widgetId: props.widgetId,
            outputDSId: dsId,
            timestamp: Date.now()
          })
        } catch (error) {
          debugLogger.log('ERROR', {
            event: 'datasource-destroy-failed',
            widgetId: props.widgetId,
            error: error.message,
            timestamp: Date.now()
          })
        }
      }
      
      // ============================================================================
      // r021.51: KEY PROP PATTERN - Force DataSourceComponent Remount
      // ============================================================================
      // Increment the key prop on DataSourceComponent to force React to unmount/remount it.
      // When the key changes, React treats it as a new component instance and creates a fresh
      // DataSource, which triggers handleOutputDataSourceCreated callback naturally.
      //
      // This replaces the previous programmatic button click anti-pattern (r021.31-50) with
      // idiomatic React. Memory testing shows equivalent performance (18.67 vs 18.83 MB/query).
      //
      // WHY THIS WORKS:
      // - React unmounts old DataSourceComponent (releases all hooks/effects)
      // - React mounts new DataSourceComponent (fresh lifecycle)
      // - New component creates OutputDataSource via ESRI's normal flow
      // - handleOutputDataSourceCreated callback fires with new DS instance
      // - Pending query executes after 300ms settle time
      //
      // See: OUTPUTDATASOURCE_MEMORY_LEAK_INVESTIGATION.md (r021.51 section)
      // ============================================================================
      
      setDsRecreationKey(prev => prev + 1)
      
      debugLogger.log('TASK', {
        event: 'ds-recreation-key-incremented',
        widgetId: props.widgetId,
        newKey: dsRecreationKey + 1,
        note: 'Key prop pattern - DataSourceComponent will remount and recreate DS',
        timestamp: Date.now()
      })
      
      return
    }
    
    // Check if this is a hash-triggered query with unconverted value (string format)
    const firstPart = sqlExpr?.parts?.[0]
    const value = firstPart?.type === 'SINGLE' ? (firstPart as any).valueOptions?.value : null
    const isStringValue = typeof value === 'string' && value.length > 0
    const isArrayValue = Array.isArray(value) && value.length > 0
    
    debugLogger.log('TASK', {
      event: 'handleFormSubmit-checking-conversion',
      widgetId: props.widgetId,
      initialInputValue,
      valueType: typeof value,
      isStringValue,
      isArrayValue,
      value: Array.isArray(value) ? value : value,
      willCheckWaitCondition: isStringValue && !isArrayValue && initialInputValue && value === initialInputValue,
      timestamp: Date.now()
    })
    
    // If value is string (not converted to array yet), wait for conversion event
    // This happens when hash value changes for same configId
    if (isStringValue && !isArrayValue && initialInputValue && value === initialInputValue) {
      debugLogger.log('TASK', {
        event: 'handleFormSubmit-waiting-for-conversion',
        widgetId: props.widgetId,
        currentValue: value,
        initialInputValue,
        timestamp: Date.now()
      })
      
      // Store pending query
      pendingHashQueryRef.current = {
        sqlExpr,
        spatialFilter,
        runtimeZoomToSelected
      }
      
      // Set a timeout to prevent infinite waiting (fallback after 2 seconds)
      setTimeout(() => {
        if (pendingHashQueryRef.current) {
          debugLogger.log('TASK', {
            event: 'handleFormSubmit-conversion-timeout-executing-anyway',
            widgetId: props.widgetId,
            timestamp: Date.now()
          })
          
          const { sqlExpr, spatialFilter, runtimeZoomToSelected } = pendingHashQueryRef.current
          pendingHashQueryRef.current = null
          
          // Execute anyway (fallback)
          handleFormSubmitInternal(sqlExpr, spatialFilter, runtimeZoomToSelected)
        }
      }, 2000)
      
      return // Exit early, will execute when event fires
    }
    
    debugLogger.log('TASK', {
      event: 'handleFormSubmit-executing-immediately',
      widgetId: props.widgetId,
      reason: isStringValue ? 'not-hash-triggered' : (isArrayValue ? 'already-converted' : 'no-value'),
      valueType: typeof value,
      isStringValue,
      isArrayValue,
      timestamp: Date.now()
    })
    
    // Value is already converted or not hash-triggered, execute immediately
    handleFormSubmitInternal(sqlExpr, spatialFilter, runtimeZoomToSelected)
  }, [props.widgetId, initialInputValue, handleFormSubmitInternal, resultsMode, outputDS, clearResult])

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
  const effectiveRecords = isVirtualClearActive ? [] : 
                          (accumulatedRecords && accumulatedRecords.length > 0) ? accumulatedRecords :
                          (recordsRef.current || [])
  
  // FIX (r018.95): Use effectiveRecords.length to reflect real-time count updates when records are removed
  const effectiveResultCount = isVirtualClearActive ? 0 : effectiveRecords.length
  
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
        onChange={(id) => handleTabChange(id as 'query' | 'results')}
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
                        Search Alias
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
              onDismissNoResultsAlert={() => setNoResultsAlert(null)}
              otherProps={otherProps}
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
              <QueryTaskResult
                key={resultsMode === SelectionType.NewSelection 
                  ? `${queryItem.configId}-${queryExecutionKeyRef.current}`
                  : `stable-${queryExecutionKeyRef.current}`}
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
                onAccumulatedRecordsChange={onAccumulatedRecordsChange}
                eventManager={eventManager}
                isQuerySwitchInProgressRef={isQuerySwitchInProgressRef}
                queries={queryItems}
                noRemovalAlert={noRemovalAlert}
                onDismissNoRemovalAlert={() => setNoRemovalAlert(null)}
                allDuplicatesAlert={allDuplicatesAlert}
                onDismissAllDuplicatesAlert={() => setAllDuplicatesAlert(null)}
                onNavBack={async (clearResults = false) => {
                  // Handle navigation from QueryTaskResult
                  // If clearResults is true, clear everything and go to query tab
                  // If false, just switch to query tab without clearing
                  if (clearResults) {
                    hasSelectedRecordsRef.current = false // Reset flag when clearing
                    await navToForm(true)
                  } else {
                    // Just switch tabs, don't clear results
                    // Mark as manual switch to prevent auto-switch useEffect from interfering
                    manualTabSwitchRef.current = true
                    setActiveTab('query')
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
              onDismiss={() => setSelectionError(null)}
            />
          )}
          {zoomError && (
            <ErrorMessage 
              error={zoomError} 
              onDismiss={() => setZoomError(null)}
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
