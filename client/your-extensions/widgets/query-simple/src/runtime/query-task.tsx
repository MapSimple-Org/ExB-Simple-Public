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
import { Button, Tooltip, FOCUSABLE_CONTAINER_CLASS, Tabs, Tab, Select } from 'jimu-ui'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { PagingType, type QueryItemType, type SpatialFilterObj, SelectionType } from '../config'
import { QueryTaskForm } from './query-task-form'
import { QueryTaskResult } from './query-result'
import { DataSourceTip, useDataSourceExists, ErrorMessage } from 'widgets/shared-code/common'
import { QueryTaskLabel } from './query-task-label'
import { useZoomToRecords } from './hooks/use-zoom-to-records'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { generateQueryParams, executeQuery, executeCountQuery } from './query-utils'
import { mergeResultsIntoAccumulated, removeResultsFromAccumulated, removeRecordsFromOriginSelections } from './results-management-utils'
import { MenuOutlined } from 'jimu-icons/outlined/editor/menu'
import defaultMessage from './translations/default'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { LoadingResult } from './loading-result'
import { clearSelectionInDataSources, selectRecordsAndPublish, findClearResultsButton, dispatchSelectionEvent } from './selection-utils'
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
  useGraphicsLayerForHighlight?: boolean
  graphicsLayer?: __esri.GraphicsLayer
  mapView?: __esri.MapView | __esri.SceneView
  onInitializeGraphicsLayer?: (outputDS: DataSource) => Promise<void>
  onClearGraphicsLayer?: () => void
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
  const { queryItem, onNavBack, total, isInPopper = false, wrappedInPopper = false, className = '', index, initialInputValue, onHashParameterUsed, queryItems, selectedQueryIndex, onQueryChange, groups, ungrouped, groupOrder, selectedGroupId, selectedGroupQueryIndex, onGroupChange, onGroupQueryChange, onUngroupedChange, resultsMode, onResultsModeChange, accumulatedRecords, onAccumulatedRecordsChange, useGraphicsLayerForHighlight, graphicsLayer, mapView, onInitializeGraphicsLayer, onClearGraphicsLayer, activeTab: propActiveTab, onTabChange: propOnTabChange, eventManager, ...otherProps } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const zoomToRecords = useZoomToRecords(mapView)
  const [stage, setStage] = React.useState(0) // 0 = form, 1 = results, 2 = loading
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
      timestamp: Date.now()
    })
  }, [props.initialInputValue, props.widgetId, props.queryItem.configId, props.queryItemShortId])
  
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
  // Track if we've already selected records for the current query results
  const hasSelectedRecordsRef = React.useRef(false)
  // Track query execution count to force QueryTaskResult remount on new queries
  const queryExecutionKeyRef = React.useRef(0)
  const queryParamRef = React.useRef<QueryParams>(null)
  const recordsRef = React.useRef<DataRecord[]>(null)
  const [outputDS, setOutputDS] = React.useState<DataSource>(null)
  const [dataSource, setDataSource] = React.useState<DataSource>(null)
  const [spatialFilterEnabled, setSpatialFilterEnabled] = React.useState(true)
  const attributeFilterSqlExprObj = React.useRef<IMSqlExpression>(queryItem.sqlExprObj)
  const spatialFilterObj = React.useRef(null)
  const backBtnRef = React.useRef<HTMLButtonElement>(undefined)
  const clearResultBtnRef = React.useRef<HTMLButtonElement>(undefined)
  const [dataActionFilter, setDataActionFilter] = React.useState(null)
  const previousConfigIdRef = React.useRef<string>(queryItem.configId)
  // Track manual tab switches to prevent auto-switch useEffect from interfering
  const manualTabSwitchRef = React.useRef(false)
  // Track when a query was just executed - only auto-switch after query execution completes
  const queryJustExecutedRef = React.useRef(false)
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
        queryJustExecutedRef: queryJustExecutedRef.current,
        timestamp: Date.now()
      })
      return
    }
    
    // FORCED: Always use SimpleList - we're done with lazy loading issues
    // Records are available immediately, so we can switch as soon as resultCount > 0
    const isSimpleList = true
    
    // ONLY auto-switch when:
    // 1. A query was just executed (queryJustExecutedRef.current === true)
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
      queryJustExecutedRef: queryJustExecutedRef.current,
      isSimpleList,
      pagingTypeInConfig,
      hasRecords,
      recordsRefLength: recordsRef.current?.length || 0,
      manualTabSwitchRef: manualTabSwitchRef.current,
      willAutoSwitch: queryJustExecutedRef.current && resultCount > 0 && hasRecords && activeTab === 'query',
      timestamp: Date.now()
    })
    
    if (queryJustExecutedRef.current && 
        resultCount > 0 && 
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
      queryJustExecutedRef.current = false // Reset after switching
      debugLogger.log('TASK', {
        event: 'auto-switch-completed',
        widgetId: props.widgetId,
        queryItemConfigId: queryItem.configId,
        queryJustExecutedRefReset: queryJustExecutedRef.current,
        timestamp: Date.now()
      })
    }
  }, [resultCount, activeTab, pagingTypeInConfig])

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

    recordsRef.current = null
    outputDS?.setStatus(DataSourceStatus.NotReady)
    setResultCount(0)
    
    // NOTE: Graphics layer clearing is now handled inside clearSelectionInDataSources
    // called below. We ensure this is awaited to prevent race conditions.
    
    // Clear selection directly from data source using utility function
    try {
      await clearSelectionInDataSources(props.widgetId, outputDS, useGraphicsLayerForHighlight, graphicsLayer)
      debugLogger.log('TASK', {
        event: 'clearResult-selection-cleared',
        widgetId: props.widgetId,
        timestamp: Date.now()
      })
    } catch (error) {
      debugLogger.log('TASK', {
        event: 'clearResult-selection-clear-failed',
        widgetId: props.widgetId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      })
    }
    
    // Clear widget-level accumulated records when clearing results
    if (onAccumulatedRecordsChange) {
      onAccumulatedRecordsChange([])
      debugLogger.log('RESULTS-MODE', {
        event: 'accumulated-records-cleared-on-clear-results',
        widgetId: props.widgetId
      })
    }
    
    await publishDataClearedMsg()
    // Switch back to Query tab when clearing results
    setActiveTab('query')
    setStage(0)
    hasSelectedRecordsRef.current = false // Reset selection flag when clearing
    // Increment query execution key to force QueryTaskResult remount with fresh state
    queryExecutionKeyRef.current += 1
    // Clear error states when clearing results
    setSelectionError(null)
    setZoomError(null)

    debugLogger.log('TASK', {
      event: 'clearResult-complete',
      widgetId: props.widgetId,
      timestamp: Date.now()
    })
  }, [outputDS, publishDataClearedMsg, props.widgetId, queryItem.configId, onAccumulatedRecordsChange, useGraphicsLayerForHighlight, graphicsLayer])

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
        useGraphicsLayerForHighlight,
        hasOnClearGraphicsLayer: !!onClearGraphicsLayer,
        isQuerySwitchFlagSet: isQuerySwitchInProgressRef.current,
        timestamp: Date.now()
      })
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
    
    // Initialize graphics layer lazily if enabled and not already initialized
    if (useGraphicsLayerForHighlight && onInitializeGraphicsLayer) {
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
      if (useGraphicsLayerForHighlight && graphicsLayer && onClearGraphicsLayer) {
        debugLogger.log('RESULTS-MODE', {
          event: 'clearing-graphics-layer-before-reselection-on-query-switch',
          widgetId: props.widgetId,
          resultsMode,
          accumulatedRecordsCount: accumulatedRecords.length,
          graphicsCountBeforeClear,
          timestamp: Date.now()
        })
        onClearGraphicsLayer()
        
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
          reason: !useGraphicsLayerForHighlight ? 'useGraphicsLayerForHighlight-false' : 
                  !graphicsLayer ? 'no-graphicsLayer' : 
                  !onClearGraphicsLayer ? 'no-onClearGraphicsLayer' : 'unknown',
          graphicsCountBeforeClear,
          timestamp: Date.now()
        })
      }
      
      // Use a delay to ensure the DS is fully ready and graphics layer props are updated after widget re-render
      // If graphics layer was just initialized, wait a bit longer for props to update
      const delay = (useGraphicsLayerForHighlight && onInitializeGraphicsLayer) ? 200 : 100
      setTimeout(() => {
        const featureDS = ds as FeatureLayerDataSource
        if (featureDS && accumulatedRecords && accumulatedRecords.length > 0) {
          // FIX (r018.96): No filtering needed - accumulatedRecords is already the source of truth
          // Duplicate detection in mergeResultsIntoAccumulated prevents duplicates
          const recordsToReselect = accumulatedRecords
          
          // VERIFICATION LOGGING: Show records being reselected
          debugLogger.log('RESULTS-MODE', {
            event: 'query-switch-reselecting-accumulated-records',
            widgetId: props.widgetId,
            accumulatedRecordsCount: accumulatedRecords.length,
            recordsToReselectCount: recordsToReselect.length,
            recordsToReselectIds: recordsToReselect.map(r => r.getId()).slice(0, 10),
            note: 'r018.96: Using accumulatedRecords directly - no manual removal tracking',
            timestamp: Date.now()
          })
          
          // Update accumulatedRecords if filtering removed any records
          if (recordsToReselect.length !== accumulatedRecords.length && onAccumulatedRecordsChange) {
            debugLogger.log('RESULTS-MODE', {
              event: 'syncing-accumulated-records-after-filtering-manually-removed',
              widgetId: props.widgetId,
              accumulatedRecordsCountBefore: accumulatedRecords.length,
              accumulatedRecordsCountAfter: recordsToReselect.length,
              recordsRemoved: accumulatedRecords.length - recordsToReselect.length,
              note: 'Updating accumulatedRecords to exclude manually removed records',
              timestamp: Date.now()
            })
            onAccumulatedRecordsChange(recordsToReselect)
          }
          
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
            
            // Use the same selectRecordsAndPublish that's used after query completion
            // This will select records on the map and trigger handleDataSourceInfoChange
            // in query-result.tsx to update selectedRecords state for the Results tab
            // Use graphics layer if enabled (props should be updated after widget re-render)
            ;(async () => {
              try {
                  await selectRecordsAndPublish(
                    props.widgetId,
                    featureDS,
                    recordIds,
                    recordsToReselect,
                    false,
                    useGraphicsLayerForHighlight,
                    graphicsLayer,
                    mapView
                  )
                
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
                
                  // Update recordsRef so results tab shows accumulated records
                  recordsRef.current = recordsToReselect
                  setResultCount(recordsToReselect.length)
                  
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
            // No records to re-select - all were removed
            recordsRef.current = []
            setResultCount(0)
            
            debugLogger.log('RESULTS-MODE', {
              event: 'no-records-to-reselect-all-removed',
              widgetId: props.widgetId,
              outputDSId: featureDS.id,
              accumulatedRecordsCountBefore: accumulatedRecords.length,
              note: 'all-records-were-removed-no-reselection-needed',
              timestamp: Date.now()
            })
          }
        }
      }, 100)
    }
  }, [resultsMode, accumulatedRecords, props.widgetId, useGraphicsLayerForHighlight, onInitializeGraphicsLayer, graphicsLayer, onClearGraphicsLayer, mapView, queryItem.configId, onAccumulatedRecordsChange])

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
              note: 'immediate-sync-before-query-switch',
              timestamp: Date.now()
            })
            
            // Update accumulatedRecords to match reality (immediate sync, not lazy)
            onAccumulatedRecordsChange(syncedRecords)
            
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
    // Don't allow switching to results if there are no results
    if (tab === 'results' && resultCount === 0) {
      debugLogger.log('TASK', {
        event: 'tab-change-blocked',
        reason: 'no-results',
        tab,
        resultCount
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

        let recordsToDisplay = result.records || []
        let dsToUse = outputDS
        
        // Handle "Add to" mode: merge new results with widget-level accumulated records
        if (resultsMode === SelectionType.AddToSelection && result.records && result.records.length > 0) {
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

            // Merge new query results with widget-level accumulated records
            // mergeResultsIntoAccumulated uses composite keys to prevent duplicates
            const mergedRecords = mergeResultsIntoAccumulated(
              outputDS as FeatureLayerDataSource, // Use outputDS for key generation
              result.records as FeatureDataRecord[],
              existingRecordsForMerge // Use consistently captured records
            )
            
            recordsToDisplay = mergedRecords

            // DIAGNOSTIC LOGGING: Records being added to accumulatedRecords
            const existingIds = existingRecordsForMerge.map(r => r.getId())
            const newRecordIds = result.records.map(r => r.getId())
            const mergedIds = mergedRecords.map(r => r.getId())
            const addedIds = mergedIds.filter(id => !existingIds.includes(id))
            const duplicateIds = newRecordIds.filter(id => existingIds.includes(id))
            
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
              note: 'r018.96: No manual removal filtering - mergeResultsIntoAccumulated handles duplicates',
              timestamp: Date.now()
            })
            
            // Update widget-level accumulated records so they persist across query switches
            if (onAccumulatedRecordsChange) {
              onAccumulatedRecordsChange(mergedRecords)
            }
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
        } else if (resultsMode === SelectionType.RemoveFromSelection) {
          // Handle "Remove from" mode: remove matching records from widget-level accumulated records
          try {
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
              removeRecordsFromOriginSelections(
                props.widgetId,
                result.records as FeatureDataRecord[],
                outputDS as FeatureLayerDataSource
                // NOT passing useGraphicsLayerForHighlight or graphicsLayer
                // Graphics will be synced through normal selection flow
              )
              
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
                expected: 'Graphics should NOT change here (no graphics layer params passed)',
                timestamp: Date.now()
              })
              
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-complete',
                widgetId: props.widgetId,
                existingAccumulatedRecordsCount: existingRecordsForMerge.length,
                queryRecordsCount: result.records.length,
                remainingRecordsCount: remainingRecords.length,
                recordsRemoved: existingRecordsForMerge.length - remainingRecords.length,
                outputDSId: outputDS.id,
                widgetLevelRecordsUpdated: true,
                originSelectionsUpdated: true
              })
              
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
          } else if (onAccumulatedRecordsChange) {
            // No results - clear accumulatedRecords
            onAccumulatedRecordsChange([])
          }
        }
        
        recordsRef.current = recordsToDisplay
        // Reset selection flag for new query results
        hasSelectedRecordsRef.current = false
        
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
            // For "Add to" and "New" modes, select records normally
            setSelectionError(null) // Clear previous errors
            ;(async () => {
              try {
                await selectRecordsAndPublish(
                  props.widgetId,
                  dsToUse,
                  recordIdsToSelect,
                  recordsToDisplay as FeatureDataRecord[],
                  false,
                  useGraphicsLayerForHighlight,
                  graphicsLayer,
                  mapView
                )
                hasSelectedRecordsRef.current = true // Mark as selected
                
                // Dispatch custom selection event so Widget state is updated immediately
                // This is crucial for hash-based execution where QueryTask handles selection
                dispatchSelectionEvent(props.widgetId, recordIdsToSelect, dsToUse, queryItem.configId, eventManager)
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
              await clearSelectionInDataSources(props.widgetId, dsToUse, useGraphicsLayerForHighlight, graphicsLayer)
              hasSelectedRecordsRef.current = false
              
              // Notify Widget that selection is cleared
              dispatchSelectionEvent(props.widgetId, [], dsToUse, queryItem.configId, eventManager)
              
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
        
        // Mark that query just executed BEFORE updating resultCount
        // This ensures the auto-switch useEffect sees queryJustExecutedRef.current === true
        queryJustExecutedRef.current = true
        debugLogger.log('TASK', {
          event: 'query-executed-flag-set',
          widgetId: props.widgetId,
          queryItemConfigId: queryItem.configId,
          resultsMode,
          recordsToDisplayCount: recordsToDisplay.length,
          queryResultCount,
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
          // BUG-GRAPHICS-001: Zoom operations fail when graphics layer is disabled
          if (!mapView && !useGraphicsLayerForHighlight) {
            debugLogger.log('BUG', {
              bugId: 'BUG-GRAPHICS-001',
              category: 'GRAPHICS',
              event: 'zoom-operation-failed-graphics-layer-disabled',
              widgetId: props.widgetId,
              operation: 'query-result-zoom',
              recordsCount: recordsForZoom.length,
              description: 'Zoom operation attempted but mapView is unavailable because useGraphicsLayerForHighlight is disabled',
              workaround: 'Enable useGraphicsLayerForHighlight in widget settings',
              targetResolution: 'r019.0'
            })
          }
          
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
            if (process.env.NODE_ENV === 'development') {
              console.error('Error executing zoomToRecords', error)
            }
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
        setStage(1) // Return to results or form stage even on error
      })
      .finally(() => {
        if (spatialFilter?.layer && spatialFilter?.clearAfterApply) {
          spatialFilter.layer.removeAll()
        }
        // setStage(1) // Removed from here; now called in the main chain before background actions
      })
  }, [currentItem, queryItem, props.widgetId, outputDS, publishDataClearedMsg, clearResult, resultsMode, accumulatedRecords, onAccumulatedRecordsChange, onClearGraphicsLayer, mapView, useGraphicsLayerForHighlight, zoomToRecords])

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
      timestamp: Date.now()
    })
    
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
  }, [props.widgetId, initialInputValue, handleFormSubmitInternal])

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
      <DataSourceComponent useDataSource={useOutputDs} onDataSourceCreated={handleOutputDataSourceCreated} onDataSourceInfoChange={handleOutputDataSourceInfoChange}/>
      
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
                    ref={clearResultBtnRef}
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
            
            {/* Results Mode Button Group - Always show, regardless of query count */}
            <div css={css`
                    padding: 8px 16px;
                    flex-shrink: 0;
                  `}>
                    <div className="d-flex align-items-center" css={css`
                      gap: 0.5rem;
                      flex-wrap: nowrap;
                    `}>
                      {/* Results label and info button */}
                      <div className="title2" css={css`
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: var(--sys-color-text-primary);
                        white-space: nowrap;
                        flex-shrink: 0;
                      `}>
                        {getI18nMessage('results')}:
                      </div>
                      <Tooltip placement='bottom' css={css`white-space: pre-line;`} title={getI18nMessage('resultsModeDesc')}>
                        <Button size='sm' icon type='tertiary' aria-label={getI18nMessage('resultsModeDesc')} css={css`flex-shrink: 0;`}>
                          <InfoOutlined color='var(--sys-color-primary-main)' size='s'/>
                        </Button>
                      </Tooltip>
                      
                      {/* Mode buttons */}
                      <div 
                        role="radiogroup"
                        aria-label={getI18nMessage('resultsMode')}
                        css={css`
                          display: flex;
                          gap: 4px;
                          align-items: stretch;
                          flex: 1;
                          min-width: 0;
                        `}
                      >
                      <Button
                        size="sm"
                        variant={resultsMode === SelectionType.NewSelection ? 'contained' : 'outlined'}
                        color={resultsMode === SelectionType.NewSelection ? 'primary' : 'default'}
                        onClick={() => {
                          const newMode = SelectionType.NewSelection
                          debugLogger.log('RESULTS-MODE', {
                            event: 'button-mode-changed',
                            widgetId: props.widgetId,
                            queryItemConfigId: queryItem.configId,
                            previousMode: resultsMode || SelectionType.NewSelection,
                            newMode,
                            timestamp: new Date().toISOString()
                          })
                          if (onResultsModeChange) {
                            onResultsModeChange(newMode)
                          }
                        }}
                        aria-pressed={resultsMode === SelectionType.NewSelection}
                        aria-label={`${getI18nMessage('createNewResults')}: ${getI18nMessage('resultsModeDesc').split('\n')[1]?.trim() || ''}`}
                        title={getI18nMessage('createNewResults')}
                        css={css`
                          flex: 1;
                          font-size: 0.75rem;
                          padding: 4px 8px;
                          min-height: 28px;
                          white-space: nowrap;
                          text-overflow: ellipsis;
                          overflow: hidden;
                        `}
                      >
                        {getI18nMessage('resultsModeNew')}
                      </Button>
                      <Button
                        size="sm"
                        variant={resultsMode === SelectionType.AddToSelection ? 'contained' : 'outlined'}
                        color={resultsMode === SelectionType.AddToSelection ? 'primary' : 'default'}
                        onClick={() => {
                          const newMode = SelectionType.AddToSelection
                          const previousMode = resultsMode || SelectionType.NewSelection
                          
                          debugLogger.log('RESULTS-MODE', {
                            event: 'button-mode-changed',
                            widgetId: props.widgetId,
                            queryItemConfigId: queryItem.configId,
                            previousMode,
                            newMode,
                            timestamp: new Date().toISOString()
                          })
                          
                          // If switching FROM "New" TO "Add to" mode and we have current results,
                          // merge them with existing accumulated records before changing mode
                          //
                          // SOURCE OF TRUTH ARCHITECTURE (r018.65):
                          // - outputDS.getSelectedRecords() is the SINGLE SOURCE OF TRUTH for current selection
                          //   It correctly filters out removed records and stays in sync with user actions
                          // - effectiveRecords (from recordsRef.current) contains stale query results that may
                          //   include removed records, so it should only be used as a fallback when outputDS
                          //   has no selection (e.g., during query execution before selection is applied)
                          // - This ensures removed records are never accidentally included in accumulatedRecords
                          
                          // DEBUG: Log state before capture to verify assumptions
                          const effectiveRecordsCount = effectiveRecords?.length || 0
                          const outputDSSelectedRecords = outputDS?.getSelectedRecords() as FeatureDataRecord[] || []
                          const outputDSSelectedCount = outputDSSelectedRecords.length
                          const accumulatedRecordsCount = accumulatedRecords?.length || 0
                          
                          debugLogger.log('RESULTS-MODE', {
                            event: 'mode-switch-debug-before-capture',
                            widgetId: props.widgetId,
                            previousMode,
                            newMode,
                            effectiveRecordsCount,
                            outputDSSelectedCount,
                            accumulatedRecordsCount,
                            outputDSId: outputDS?.id,
                            hasEffectiveRecords: effectiveRecords && effectiveRecords.length > 0,
                            hasOutputDSSelected: outputDSSelectedRecords.length > 0,
                            timestamp: Date.now()
                          })
                          
                          // FIX (r018.65): Use outputDS.getSelectedRecords() as source of truth for mode switching
                          // This correctly filters out removed records, unlike effectiveRecords which contains stale data
                          // outputDS.getSelectedRecords() is the single source of truth that stays in sync with removals
                          const recordsToCapture = outputDSSelectedRecords.length > 0
                            ? outputDSSelectedRecords
                            : (effectiveRecords && effectiveRecords.length > 0 
                                ? (effectiveRecords as FeatureDataRecord[])
                                : [])
                          
                          // DEBUG: Log which source was used
                          debugLogger.log('RESULTS-MODE', {
                            event: 'mode-switch-debug-after-capture',
                            widgetId: props.widgetId,
                            recordsToCaptureCount: recordsToCapture.length,
                            source: outputDSSelectedRecords.length > 0 ? 'outputDS.getSelectedRecords()' : (effectiveRecords && effectiveRecords.length > 0 ? 'effectiveRecords' : 'none'),
                            effectiveRecordsCount,
                            outputDSSelectedCount,
                            timestamp: Date.now()
                          })

                          // DIAGNOSTIC: Check each condition individually (r018.78)
                          const conditionCheck = {
                            previousModeIsNew: previousMode === SelectionType.NewSelection,
                            newModeIsAdd: newMode === SelectionType.AddToSelection,
                            hasRecordsToCapture: recordsToCapture.length > 0,
                            hasOutputDS: !!outputDS,
                            hasOnAccumulatedRecordsChange: !!onAccumulatedRecordsChange,
                            previousMode: previousMode,
                            newMode: newMode,
                            recordsToCaptureLength: recordsToCapture.length
                          }
                          
                          debugLogger.log('RESULTS-MODE', {
                            event: 'mode-switch-condition-check',
                            widgetId: props.widgetId,
                            conditions: conditionCheck,
                            allConditionsMet: conditionCheck.previousModeIsNew && 
                                            conditionCheck.newModeIsAdd && 
                                            conditionCheck.hasRecordsToCapture && 
                                            conditionCheck.hasOutputDS && 
                                            conditionCheck.hasOnAccumulatedRecordsChange,
                            timestamp: Date.now()
                          })

                          if (previousMode === SelectionType.NewSelection && 
                              newMode === SelectionType.AddToSelection &&
                              recordsToCapture.length > 0 &&
                              outputDS &&
                              onAccumulatedRecordsChange) {
                            const existingAccumulated = accumulatedRecords || []
                            
                            // Merge current results with existing accumulated records
                            const mergedRecords = mergeResultsIntoAccumulated(
                              outputDS as FeatureLayerDataSource,
                              recordsToCapture,
                              existingAccumulated
                            )
                            
                            const existingIds = existingAccumulated.map(r => r.getId())
                            const capturedIds = recordsToCapture.map(r => r.getId())
                            const mergedIds = mergedRecords.map(r => r.getId())
                            const addedIds = mergedIds.filter(id => !existingIds.includes(id))
                            const duplicateIds = capturedIds.filter(id => existingIds.includes(id))
                            
                            debugLogger.log('RESULTS-MODE', {
                              event: 'capturing-current-results-on-mode-switch',
                              widgetId: props.widgetId,
                              previousMode,
                              newMode,
                              capturedRecordsCount: recordsToCapture.length,
                              capturedIds: capturedIds,
                              effectiveRecordsCount,
                              outputDSSelectedCount,
                              existingAccumulatedCount: existingAccumulated.length,
                              existingIds: existingIds,
                              mergedRecordsCount: mergedRecords.length,
                              mergedIds: mergedIds,
                              addedIds: addedIds,
                              duplicateIds: duplicateIds,
                              duplicatesFiltered: duplicateIds.length,
                              sourceUsed: outputDSSelectedRecords.length > 0 ? 'outputDS.getSelectedRecords()' : (effectiveRecords && effectiveRecords.length > 0 ? 'effectiveRecords' : 'none'),
                              note: 'outputDS.getSelectedRecords()-is-source-of-truth-filters-removed-records'
                            })
                            
                            onAccumulatedRecordsChange(mergedRecords)
                          } else {
                            debugLogger.log('RESULTS-MODE', {
                              event: 'mode-switch-merge-skipped',
                              widgetId: props.widgetId,
                              reason: 'condition-check-failed',
                              conditions: conditionCheck,
                              timestamp: Date.now()
                            })
                          }
                          
                          if (onResultsModeChange) {
                            onResultsModeChange(newMode)
                          }
                        }}
                        aria-pressed={resultsMode === SelectionType.AddToSelection}
                        aria-label={`${getI18nMessage('addToCurrentResults')}: ${getI18nMessage('resultsModeDesc').split('\n')[2]?.trim() || ''}`}
                        title={getI18nMessage('addToCurrentResults')}
                        css={css`
                          flex: 1;
                          font-size: 0.75rem;
                          padding: 4px 8px;
                          min-height: 28px;
                          white-space: nowrap;
                          text-overflow: ellipsis;
                          overflow: hidden;
                        `}
                      >
                        {getI18nMessage('resultsModeAdd')}
                      </Button>
                      <Button
                        size="sm"
                        variant={resultsMode === SelectionType.RemoveFromSelection ? 'contained' : 'outlined'}
                        color={resultsMode === SelectionType.RemoveFromSelection ? 'primary' : 'default'}
                        disabled={!accumulatedRecords || accumulatedRecords.length === 0}
                        onClick={() => {
                          const newMode = SelectionType.RemoveFromSelection
                          const previousMode = resultsMode || SelectionType.NewSelection
                          
                          debugLogger.log('RESULTS-MODE', {
                            event: 'button-mode-changed',
                            widgetId: props.widgetId,
                            queryItemConfigId: queryItem.configId,
                            previousMode,
                            newMode,
                            accumulatedRecordsCount: accumulatedRecords?.length || 0,
                            timestamp: new Date().toISOString()
                          })
                          
                          // If switching FROM "New" TO "Remove from" mode and we have current results,
                          // merge them with existing accumulated records before changing mode
                          // (same pattern as "Add to" mode)
                          //
                          // SOURCE OF TRUTH ARCHITECTURE (r018.65):
                          // - outputDS.getSelectedRecords() is the SINGLE SOURCE OF TRUTH for current selection
                          //   It correctly filters out removed records and stays in sync with user actions
                          // - effectiveRecords (from recordsRef.current) contains stale query results that may
                          //   include removed records, so it should only be used as a fallback when outputDS
                          //   has no selection (e.g., during query execution before selection is applied)
                          // - This ensures removed records are never accidentally included in accumulatedRecords
                          
                          // DEBUG: Log state before capture to verify assumptions
                          const effectiveRecordsCountForRemove = effectiveRecords?.length || 0
                          const outputDSSelectedRecordsForRemove = outputDS?.getSelectedRecords() as FeatureDataRecord[] || []
                          const outputDSSelectedCountForRemove = outputDSSelectedRecordsForRemove.length
                          const accumulatedRecordsCountForRemove = accumulatedRecords?.length || 0
                          
                          debugLogger.log('RESULTS-MODE', {
                            event: 'mode-switch-debug-before-capture-remove',
                            widgetId: props.widgetId,
                            previousMode,
                            newMode,
                            effectiveRecordsCount: effectiveRecordsCountForRemove,
                            outputDSSelectedCount: outputDSSelectedCountForRemove,
                            accumulatedRecordsCount: accumulatedRecordsCountForRemove,
                            outputDSId: outputDS?.id,
                            hasEffectiveRecords: effectiveRecords && effectiveRecords.length > 0,
                            hasOutputDSSelected: outputDSSelectedRecordsForRemove.length > 0,
                            timestamp: Date.now()
                          })
                          
                          // FIX (r018.65): Use outputDS.getSelectedRecords() as source of truth for mode switching
                          // This correctly filters out removed records, unlike effectiveRecords which contains stale data
                          // outputDS.getSelectedRecords() is the single source of truth that stays in sync with removals
                          const recordsToCaptureForRemove = outputDSSelectedRecordsForRemove.length > 0
                            ? outputDSSelectedRecordsForRemove
                            : (effectiveRecords && effectiveRecords.length > 0 
                                ? (effectiveRecords as FeatureDataRecord[])
                                : [])
                          
                          // DEBUG: Log which source was used
                          debugLogger.log('RESULTS-MODE', {
                            event: 'mode-switch-debug-after-capture-remove',
                            widgetId: props.widgetId,
                            recordsToCaptureCount: recordsToCaptureForRemove.length,
                            source: outputDSSelectedRecordsForRemove.length > 0 ? 'outputDS.getSelectedRecords()' : (effectiveRecords && effectiveRecords.length > 0 ? 'effectiveRecords' : 'none'),
                            effectiveRecordsCount: effectiveRecordsCountForRemove,
                            outputDSSelectedCount: outputDSSelectedCountForRemove,
                            timestamp: Date.now()
                          })

                          // DIAGNOSTIC: Check each condition individually (r018.78)
                          const conditionCheckRemove = {
                            previousModeIsNew: previousMode === SelectionType.NewSelection,
                            newModeIsRemove: newMode === SelectionType.RemoveFromSelection,
                            hasRecordsToCapture: recordsToCaptureForRemove.length > 0,
                            hasOutputDS: !!outputDS,
                            hasOnAccumulatedRecordsChange: !!onAccumulatedRecordsChange,
                            previousMode: previousMode,
                            newMode: newMode,
                            recordsToCaptureLength: recordsToCaptureForRemove.length
                          }
                          
                          debugLogger.log('RESULTS-MODE', {
                            event: 'mode-switch-condition-check-remove',
                            widgetId: props.widgetId,
                            conditions: conditionCheckRemove,
                            allConditionsMet: conditionCheckRemove.previousModeIsNew && 
                                            conditionCheckRemove.newModeIsRemove && 
                                            conditionCheckRemove.hasRecordsToCapture && 
                                            conditionCheckRemove.hasOutputDS && 
                                            conditionCheckRemove.hasOnAccumulatedRecordsChange,
                            timestamp: Date.now()
                          })

                          if (previousMode === SelectionType.NewSelection && 
                              newMode === SelectionType.RemoveFromSelection &&
                              recordsToCaptureForRemove.length > 0 &&
                              outputDS &&
                              onAccumulatedRecordsChange) {
                            const existingAccumulated = accumulatedRecords || []
                            
                            // Merge current results with existing accumulated records
                            const mergedRecords = mergeResultsIntoAccumulated(
                              outputDS as FeatureLayerDataSource,
                              recordsToCaptureForRemove,
                              existingAccumulated
                            )
                            
                            debugLogger.log('RESULTS-MODE', {
                              event: 'capturing-current-results-on-mode-switch-to-remove',
                              widgetId: props.widgetId,
                              previousMode,
                              newMode,
                              capturedRecordsCount: recordsToCaptureForRemove.length,
                              effectiveRecordsCount: effectiveRecordsCountForRemove,
                              outputDSSelectedCount: outputDSSelectedCountForRemove,
                              existingAccumulatedCount: existingAccumulated.length,
                              mergedRecordsCount: mergedRecords.length,
                              sourceUsed: outputDSSelectedRecordsForRemove.length > 0 ? 'outputDS.getSelectedRecords()' : (effectiveRecords && effectiveRecords.length > 0 ? 'effectiveRecords' : 'none'),
                              note: 'outputDS.getSelectedRecords()-is-source-of-truth-filters-removed-records'
                            })
                            
                            onAccumulatedRecordsChange(mergedRecords)
                          } else {
                            debugLogger.log('RESULTS-MODE', {
                              event: 'mode-switch-merge-skipped-remove',
                              widgetId: props.widgetId,
                              reason: 'condition-check-failed',
                              conditions: conditionCheckRemove,
                              timestamp: Date.now()
                            })
                          }
                          
                          if (onResultsModeChange) {
                            onResultsModeChange(newMode)
                          }
                        }}
                        aria-pressed={resultsMode === SelectionType.RemoveFromSelection}
                        aria-label={`${getI18nMessage('removeFromCurrentResults')}: ${getI18nMessage('resultsModeDesc').split('\n')[3]?.trim() || ''}`}
                        title={(!accumulatedRecords || accumulatedRecords.length === 0) 
                          ? getI18nMessage('resultsModeDisabledRemove')
                          : getI18nMessage('removeFromCurrentResults')}
                        css={css`
                          flex: 1;
                          font-size: 0.75rem;
                          padding: 4px 8px;
                          min-height: 28px;
                          white-space: nowrap;
                          text-overflow: ellipsis;
                          overflow: hidden;
                        `}
                      >
                        {getI18nMessage('resultsModeRemove')}
                      </Button>
                      </div>
                    </div>
                    <div 
                      id={`results-mode-description-${props.widgetId}`}
                      className="sr-only"
                      aria-live="polite"
                      role="status"
                    >
                      {resultsMode === SelectionType.NewSelection 
                        ? getI18nMessage('createNewResults')
                        : resultsMode === SelectionType.AddToSelection
                        ? getI18nMessage('addToCurrentResults')
                        : getI18nMessage('removeFromCurrentResults')
                      }
                    </div>
                  </div>
            <div css={css`
              flex: 1;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              min-height: 0;
            `}>
              {enabled && dsExists && (
                <div css={css`
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  min-height: 0;
                  overflow: hidden;
                `}>
                  <QueryTaskForm
                    key={queryItem.configId}
                    {...otherProps}
                    configId={queryItem.configId}
                    outputDS={outputDS}
                    datasourceReady={dataSource != null}
                    spatialFilterEnabled={spatialFilterEnabled}
                    dataActionFilter = {dataActionFilter}
                    onFormSubmit={handleFormSubmit}
                    initialInputValue={initialInputValue}
                    onHashParameterUsed={onHashParameterUsed}
                    queryItemShortId={queryItem.shortId}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>
              )}
              <DataSourceTip
                widgetId={props.widgetId}
                useDataSource={queryItem.useDataSource}
                showMessage={true}
                onStatusChange={handleStatusChange}
                onDataSourceCreated={handleDataSourceCreated}
              />
            </div>
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
                useGraphicsLayerForHighlight={useGraphicsLayerForHighlight}
                graphicsLayer={graphicsLayer}
                mapView={mapView}
                accumulatedRecords={accumulatedRecords}
                onAccumulatedRecordsChange={onAccumulatedRecordsChange}
                eventManager={eventManager}
                isQuerySwitchInProgressRef={isQuerySwitchInProgressRef}
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
    </div>
  )
}
