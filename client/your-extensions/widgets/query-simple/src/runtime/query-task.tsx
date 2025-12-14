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
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { generateQueryParams, executeQuery, executeCountQuery } from './query-utils'
import { mergeResultsIntoAccumulated, removeResultsFromAccumulated, removeRecordsFromOriginSelections } from './results-management-utils'
import { MenuOutlined } from 'jimu-icons/outlined/editor/menu'
import defaultMessage from './translations/default'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { LoadingResult } from './loading-result'
import { clearSelectionInDataSources, selectRecordsAndPublish, findClearResultsButton } from './selection-utils'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

export interface QueryTaskProps {
  widgetId: string
  index: number
  total: number
  queryItem: ImmutableObject<QueryItemType>
  defaultPageSize?: number
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
  const { queryItem, onNavBack, total, isInPopper = false, defaultPageSize = CONSTANTS.DEFAULT_QUERY_PAGE_SIZE, wrappedInPopper = false, className = '', index, initialInputValue, onHashParameterUsed, queryItems, selectedQueryIndex, onQueryChange, groups, ungrouped, groupOrder, selectedGroupId, selectedGroupQueryIndex, onGroupChange, onGroupQueryChange, onUngroupedChange, resultsMode, onResultsModeChange, accumulatedRecords, onAccumulatedRecordsChange, ...otherProps } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const [stage, setStage] = React.useState(0) // 0 = form, 1 = results, 2 = loading
  const [activeTab, setActiveTab] = React.useState<'query' | 'results'>('query')
  const [enabled, setEnabled] = React.useState(true)
  const [resultCount, setResultCount] = React.useState(0)
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
  const clearResult = React.useCallback(() => {
    recordsRef.current = null
    outputDS?.setStatus(DataSourceStatus.NotReady)
    setResultCount(0)
    
    // Clear selection directly from data source using utility function
    clearSelectionInDataSources(outputDS)
    
    // Clear widget-level accumulated records when clearing results
    if (onAccumulatedRecordsChange) {
      onAccumulatedRecordsChange([])
      debugLogger.log('RESULTS-MODE', {
        event: 'accumulated-records-cleared-on-clear-results',
        widgetId: props.widgetId
      })
    }
    
    publishDataClearedMsg()
    // Switch back to Query tab when clearing results
    setActiveTab('query')
    setStage(0)
    hasSelectedRecordsRef.current = false // Reset selection flag when clearing
    // Increment query execution key to force QueryTaskResult remount with fresh state
    queryExecutionKeyRef.current += 1
    // Clear error states when clearing results
    setSelectionError(null)
    setZoomError(null)
  }, [outputDS, publishDataClearedMsg, props.widgetId, queryItem.configId, onAccumulatedRecordsChange])

  /**
   * Handles data source creation when switching between query items.
   * When a new query item is selected (e.g., switching from Parcel to Major),
   * this clears old results by programmatically clicking the trash can button
   * to ensure all cleanup logic runs properly.
   * 
   * @param ds - The newly created data source for the selected query item
   */
  const handleDataSourceCreated = React.useCallback((ds: DataSource) => {
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
    
    // For "New" mode, clear old results as before
    let clearButton = clearResultBtnRef.current
    if (!clearButton) {
      clearButton = findClearResultsButton()
    }
    
    if (clearButton && resultCount > 0) {
      clearButton.click()
    } else {
      clearResult()
    }
    setDataSource(ds)
    updateDataSource(ds)
    setStage(0)
    setActiveTab('query') // Return to Query tab when switching queries
  }, [updateDataSource, clearResult, resultCount, resultsMode, accumulatedRecords, props.widgetId])

  const handleOutputDataSourceCreated = React.useCallback((ds: DataSource) => {
    setOutputDS(ds)
    
    // If in "Add to" or "Remove from" mode and we have accumulated records, re-select them
    // This uses the same logic as after query completion - selectRecordsAndPublish
    // This ensures records are selected both on the map and in the Results tab
    if ((resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection) 
        && accumulatedRecords && accumulatedRecords.length > 0) {
      // Use a small delay to ensure the DS is fully ready
      setTimeout(() => {
        const featureDS = ds as FeatureLayerDataSource
        if (featureDS && accumulatedRecords && accumulatedRecords.length > 0) {
          const recordIds = accumulatedRecords.map(record => record.getId())
          try {
            // Use the same selectRecordsAndPublish that's used after query completion
            // This will select records on the map and trigger handleDataSourceInfoChange
            // in query-result.tsx to update selectedRecords state for the Results tab
            selectRecordsAndPublish(
              props.widgetId,
              featureDS,
              recordIds,
              accumulatedRecords
            )
            
            // Update recordsRef so results tab shows accumulated records
            recordsRef.current = accumulatedRecords
            setResultCount(accumulatedRecords.length)
            
            debugLogger.log('RESULTS-MODE', {
              event: 're-selected-accumulated-records-after-query-switch',
              widgetId: props.widgetId,
              outputDSId: featureDS.id,
              recordsCount: accumulatedRecords.length
            })
            
            // Verify what's actually selected in the DS after a delay
            setTimeout(() => {
              const ds = DataSourceManager.getInstance().getDataSource(featureDS.id)
              const selectedInDS = ds?.getSelectedRecords()
              const selectedIdsInDS = ds?.getSelectedRecordIds() ?? []
              
              debugLogger.log('RESULTS-MODE', {
                event: 'verify-records-after-reselection',
                widgetId: props.widgetId,
                outputDSId: featureDS.id,
                expectedCount: accumulatedRecords.length,
                actualSelectedInDS: selectedInDS?.length || 0,
                selectedIdsInDS: selectedIdsInDS.length,
                recordsMatch: selectedInDS?.length === accumulatedRecords.length
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
        }
      }, 100)
    }
  }, [resultsMode, accumulatedRecords, props.widgetId])

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
        clearResult()
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
      // Just update the ref - don't clear results if in "Add to" or "Remove from" mode or no results
      previousConfigIdRef.current = queryItem.configId
      
      if (resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection) {
        debugLogger.log('RESULTS-MODE', {
          event: 'preserving-accumulated-records-on-query-switch',
          widgetId: props.widgetId,
          resultsMode,
          oldConfigId: previousConfigIdRef.current,
          newConfigId: queryItem.configId,
          accumulatedRecordsCount: accumulatedRecords?.length || 0
        })
      }
    }
  }, [queryItem.configId, clearResult, resultCount, resultsMode, accumulatedRecords, props.widgetId])

  const navToForm = React.useCallback((clearResults = false) => {
    if (clearResults) {
      // Use the centralized clearResult method instead of duplicating logic
      clearResult()
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
   * Handles form submission when user clicks "Apply" button.
   * Clears old results (if any) by programmatically clicking the trash can button,
   * then executes the query with the provided SQL expression and spatial filter.
   * 
   * @param sqlExpr - The SQL expression for attribute filtering
   * @param spatialFilter - The spatial filter object
   * @param runtimeZoomToSelected - Optional runtime override for zoom-to-selected behavior
   */
  const handleFormSubmit = React.useCallback(async (sqlExpr: IMSqlExpression, spatialFilter: SpatialFilterObj, runtimeZoomToSelected?: boolean) => {
    // Clear previous errors when starting a new query
    setSelectionError(null)
    setZoomError(null)
    
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
      existingRecordsForMerge = accumulatedRecords || []
      debugLogger.log('RESULTS-MODE', {
        event: 'using-widget-level-accumulated-records',
        widgetId: props.widgetId,
        resultsMode,
        existingRecordsCount: existingRecordsForMerge.length,
        outputDSId: outputDS.id
      })
    }
    
    // For "New" mode, clear old results by programmatically clicking the trash can button
    // For "Add to" and "Remove from" modes, we keep accumulated results, so skip clearing
    if (resultsMode === SelectionType.NewSelection && clearResultBtnRef.current) {
      clearResultBtnRef.current.click()
      // Small delay to ensure the click handler completes before proceeding
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    
    // Set loading stage
    setStage(2)
    
    // For "New" mode, clear data cleared message
    // For "Add to" and "Remove from" modes, skip clearing to preserve existing records
    if (resultsMode === SelectionType.NewSelection) {
      await publishDataClearedMsg()
    }
    
    // FORCED: Always use SimpleList - fetch ALL records, not just a page
    // Use data source's max record count, or fall back to a large number (10000)
    const maxRecordCount = (featureDS as any).getMaxRecordCount?.() ?? 10000
    let pageSize = maxRecordCount
    const queryParams = generateQueryParams(featureDS, sqlExpr, spatialFilter, currentItem, 1, pageSize)
    queryParamRef.current = queryParams
    // Change output ds status to unloaded before use it to load count/records.
    featureDS.setStatus(DataSourceStatus.Unloaded)
    featureDS.setCountStatus(DataSourceStatus.Unloaded)
    let queryResultCount = 0 // Capture count from promise chain to use in finally block
    executeCountQuery(props.widgetId, featureDS, queryParams)
      .then((count) => {
        queryResultCount = count // Store count for use in finally block
        // Don't set resultCount here - wait until query completes and queryJustExecutedRef is set
        // This ensures auto-switch useEffect runs with queryJustExecutedRef.current === true
        // update ds in order to execute query
        featureDS.updateQueryParams(queryParamRef.current, props.widgetId)
        return executeQuery(props.widgetId, queryItem, featureDS, queryParamRef.current)
      })
      .then(async (result) => {
        let recordsToDisplay = result.records
        let dsToUse = outputDS
        
        // Handle "Add to" mode: merge new results with widget-level accumulated records
        if (resultsMode === SelectionType.AddToSelection && result.records && result.records.length > 0) {
          try {
            // Merge new query results with widget-level accumulated records
            const mergedRecords = mergeResultsIntoAccumulated(
              outputDS, // Use outputDS for key generation
              result.records as FeatureDataRecord[],
              existingRecordsForMerge // Widget-level accumulated records
            )
            
            recordsToDisplay = mergedRecords
            
            // Update widget-level accumulated records so they persist across query switches
            if (onAccumulatedRecordsChange) {
              onAccumulatedRecordsChange(mergedRecords)
            }
            
            debugLogger.log('RESULTS-MODE', {
              event: 'add-mode-merge-complete',
              widgetId: props.widgetId,
              existingRecordsCount: existingRecordsForMerge.length,
              newRecordsCount: result.records.length,
              mergedRecordsCount: mergedRecords.length,
              outputDSId: outputDS.id,
              widgetLevelRecordsUpdated: true
            })
          } catch (error) {
            debugLogger.log('RESULTS-MODE', {
              event: 'add-mode-error',
              widgetId: props.widgetId,
              error: error instanceof Error ? error.message : 'Unknown error',
              errorStack: error instanceof Error ? error.stack : undefined
            })
            // Fall back to normal behavior on error
            recordsToDisplay = result.records
          }
        } else if (resultsMode === SelectionType.RemoveFromSelection) {
          // Handle "Remove from" mode: remove matching records from widget-level accumulated records
          try {
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
                outputDS, // Use outputDS for key generation
                result.records as FeatureDataRecord[],
                existingRecordsForMerge // Widget-level accumulated records
              )
              
              recordsToDisplay = remainingRecords
              
              // Update widget-level accumulated records
              if (onAccumulatedRecordsChange) {
                onAccumulatedRecordsChange(remainingRecords)
              }
              
              // Remove records from origin data source selections (map highlighting)
              removeRecordsFromOriginSelections(
                props.widgetId,
                result.records as FeatureDataRecord[],
                outputDS
              )
              
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
            console.error('Error in remove mode:', error)
          }
        } else if (resultsMode === SelectionType.NewSelection) {
          // For "New" mode, clear widget-level accumulated records
          if (onAccumulatedRecordsChange) {
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
            try {
              setSelectionError(null) // Clear previous errors
              selectRecordsAndPublish(
                props.widgetId,
                dsToUse,
                recordIdsToSelect,
                recordsToDisplay as FeatureDataRecord[]
              )
              hasSelectedRecordsRef.current = true // Mark as selected
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to select query results'
              setSelectionError(errorMessage)
              debugLogger.log('TASK', {
                event: 'selection-failed',
                error: errorMessage,
                errorStack: error instanceof Error ? error.stack : undefined,
                recordCount: recordIdsToSelect.length
              })
              console.error('Error publishing selection message', error)
            }
          }
        } else if (resultsMode === SelectionType.RemoveFromSelection && recordsToDisplay.length === 0) {
          // All records removed - clear selection
          try {
            clearSelectionInDataSources(dsToUse)
            hasSelectedRecordsRef.current = false
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
        
        // Update result count
        // For "Add to" and "Remove from" modes, use accumulated/remaining count
        // For "New" mode, use query count
        const newResultCount = resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection
          ? recordsToDisplay.length
          : queryResultCount
        
        setResultCount(newResultCount)
        debugLogger.log('TASK', {
          event: 'result-count-set',
          widgetId: props.widgetId,
          queryItemConfigId: queryItem.configId,
          newResultCount,
          resultsMode,
          timestamp: Date.now()
        })

        // Trigger the existing zoomToFeature data action (same as clicking "Zoom To" in the menu)
        // Use runtime preference if provided, otherwise fall back to config setting (defaults to true)
        const shouldZoom = runtimeZoomToSelected !== undefined 
          ? runtimeZoomToSelected 
          : (queryItem.zoomToSelected !== false)
        
        // Use the output DS and merged records
        const recordsForZoom = recordsToDisplay || result.records
        const dsForZoom = dsToUse || outputDS
        
        if (recordsForZoom && recordsForZoom.length > 0 && dsForZoom && shouldZoom) {
          // Create a data set from the appropriate data source and records
          const dataSet: DataRecordSet = {
            dataSource: dsForZoom,
            records: recordsForZoom,
            name: dsForZoom.getLabel()
          }

          // Get available data actions and find the zoomToFeature action
          return DataActionManager.getInstance().getSupportedActions(props.widgetId, [dataSet], DataLevel.Records)
            .then(actionCategories => {
              // Look for zoomToFeature action in any category
              let zoomAction: any = null
              for (const category in actionCategories) {
                const actions = actionCategories[category]
                zoomAction = actions.find((action: any) => action.name === 'zoomToFeature' || action.id === 'zoomToFeature')
                if (zoomAction) break
              }

              if (zoomAction) {
                // Execute the same zoom action that works when clicked manually
                return DataActionManager.getInstance().executeDataAction(zoomAction, [dataSet], DataLevel.Records, props.widgetId)
              } else {
                return Promise.resolve(false)
              }
            })
            .catch(error => {
              const errorMessage = error instanceof Error ? error.message : 'Failed to zoom to features'
              setZoomError(errorMessage)
              debugLogger.log('ZOOM', {
                event: 'zoom-action-failed',
                error: errorMessage,
                errorStack: error instanceof Error ? error.stack : undefined
              })
              if (process.env.NODE_ENV === 'development') {
                console.error('Error executing zoomToFeature data action', error)
              }
              return Promise.resolve(false)
            })
        }
        return Promise.resolve(true)
      })
      .finally(() => {
        if (spatialFilter?.layer && spatialFilter?.clearAfterApply) {
          spatialFilter.layer.removeAll()
        }
        setStage(1)
        // queryJustExecutedRef.current is now set BEFORE setResultCount (moved up)
        // Tab switching is now handled by useEffect that watches for queryJustExecutedRef and results
        // This matches the behavior of manual input where results are rendered before tab switch
      })
  }, [currentItem, queryItem, props.widgetId, outputDS, defaultPageSize, pagingTypeInConfig, lazyLoadInitialPageSize, publishDataClearedMsg, clearResult, resultsMode, accumulatedRecords, onAccumulatedRecordsChange])

  const { useAttributeFilter, sqlExprObj, useSpatialFilter, spatialFilterTypes, spatialIncludeRuntimeData, spatialRelationUseDataSources} = currentItem
  const showAttributeFilter = useAttributeFilter && sqlExprObj != null
  const showSpatialFilter = spatialFilterEnabled && useSpatialFilter && (spatialFilterTypes.length > 0 || spatialIncludeRuntimeData || spatialRelationUseDataSources?.length > 0)

  return (
    <div className={classNames('query-task h-100', className, { wrapped: wrappedInPopper })} css={css`
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
              <div className={classNames('nav-action align-items-center', { 'd-none': wrappedInPopper })}>
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
              </div>
              {resultCount > 0 && (
                <Tooltip title={getI18nMessage('clearResult')} placement='bottom'>
                  <Button
                    ref={clearResultBtnRef}
                    size='sm'
                    type='tertiary'
                    aria-label={getI18nMessage('clearResult')}
                    icon
                    className='ml-auto py-0'
                    onClick={clearResult}
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
                <>
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
                      onChange={(e) => {
                        const optionIndex = parseInt(e.target.value)
                        const selectedOption = queryOptions[optionIndex]
                        
                        debugLogger.log('GROUP', {
                          event: 'query-option-selected',
                          optionIndex,
                          selectedOption,
                          isGrouped: selectedOption.groupId !== null
                        })
                        
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
                        onChange={(e) => {
                          const newIndex = parseInt(e.target.value)
                          debugLogger.log('GROUP', {
                            event: 'group-query-selected',
                            groupId: currentQueryGroupId,
                            groupQueryIndex: newIndex,
                            queryItemConfigId: groups[currentQueryGroupId].items[newIndex]?.configId,
                            queryDisplayName: getQueryDisplayName(groups[currentQueryGroupId].items[newIndex])
                          })
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
                </>
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
                          if (previousMode === SelectionType.NewSelection && 
                              newMode === SelectionType.AddToSelection &&
                              recordsRef.current && 
                              recordsRef.current.length > 0 &&
                              outputDS &&
                              onAccumulatedRecordsChange) {
                            const currentRecords = recordsRef.current as FeatureDataRecord[]
                            const existingAccumulated = accumulatedRecords || []
                            
                            // Merge current results with existing accumulated records
                            const mergedRecords = mergeResultsIntoAccumulated(
                              outputDS as FeatureLayerDataSource,
                              currentRecords,
                              existingAccumulated
                            )
                            
                            debugLogger.log('RESULTS-MODE', {
                              event: 'capturing-current-results-on-mode-switch',
                              widgetId: props.widgetId,
                              previousMode,
                              newMode,
                              currentRecordsCount: currentRecords.length,
                              existingAccumulatedCount: existingAccumulated.length,
                              mergedRecordsCount: mergedRecords.length
                            })
                            
                            onAccumulatedRecordsChange(mergedRecords)
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
                          if (previousMode === SelectionType.NewSelection && 
                              newMode === SelectionType.RemoveFromSelection &&
                              recordsRef.current && 
                              recordsRef.current.length > 0 &&
                              outputDS &&
                              onAccumulatedRecordsChange) {
                            const currentRecords = recordsRef.current as FeatureDataRecord[]
                            const existingAccumulated = accumulatedRecords || []
                            
                            // Merge current results with existing accumulated records
                            const mergedRecords = mergeResultsIntoAccumulated(
                              outputDS as FeatureLayerDataSource,
                              currentRecords,
                              existingAccumulated
                            )
                            
                            debugLogger.log('RESULTS-MODE', {
                              event: 'capturing-current-results-on-mode-switch-to-remove',
                              widgetId: props.widgetId,
                              previousMode,
                              newMode,
                              currentRecordsCount: currentRecords.length,
                              existingAccumulatedCount: existingAccumulated.length,
                              mergedRecordsCount: mergedRecords.length
                            })
                            
                            onAccumulatedRecordsChange(mergedRecords)
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
              {resultCount > 0 && (
                <span css={css`
                  margin-left: 6px;
                  font-size: 0.75rem;
                  opacity: 0.7;
                `}>
                  ({resultCount})
                </span>
              )}
            </span>
          }
          disabled={resultCount === 0}
        >
          {resultCount > 0 && (
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
                resultCount={resultCount}
                maxPerPage={(dataSource as QueriableDataSource)?.getMaxRecordCount?.()}
                records={recordsRef.current}
                defaultPageSize={defaultPageSize}
                outputDS={outputDS}
                runtimeZoomToSelected={lastRuntimeZoomToSelectedRef.current}
                resultsMode={resultsMode}
                accumulatedRecords={accumulatedRecords}
                onAccumulatedRecordsChange={onAccumulatedRecordsChange}
                onNavBack={(clearResults = false) => {
                  // Handle navigation from QueryTaskResult
                  // If clearResults is true, clear everything and go to query tab
                  // If false, just switch to query tab without clearing
                  if (clearResults) {
                    hasSelectedRecordsRef.current = false // Reset flag when clearing
                    navToForm(true)
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
