/** @jsx jsx */
import {
  React,
  jsx,
  css,
  type ImmutableObject,
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
import { Button, Tooltip, FOCUSABLE_CONTAINER_CLASS, Tabs, Tab } from 'jimu-ui'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { PagingType, type QueryItemType, type SpatialFilterObj } from '../config'
import { QueryTaskForm } from './query-task-form'
import { QueryTaskResult } from './query-result'
import { DataSourceTip, useDataSourceExists, ErrorMessage } from 'widgets/shared-code/common'
import { QueryTaskLabel } from './query-task-label'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { generateQueryParams, executeQuery, executeCountQuery } from './query-utils'
import { MenuOutlined } from 'jimu-icons/outlined/editor/menu'
import defaultMessage from './translations/default'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { LoadingResult } from './loading-result'
import { clearSelectionInDataSources, selectRecordsAndPublish, findClearResultsButton } from './selection-utils'
import { debugLogger } from './debug-logger'

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
  const { queryItem, onNavBack, total, isInPopper = false, defaultPageSize = CONSTANTS.DEFAULT_QUERY_PAGE_SIZE, wrappedInPopper = false, className = '', index, initialInputValue, onHashParameterUsed, ...otherProps } = props
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
  // Store the last runtime zoom override value from the form for use by Add to Map action
  const lastRuntimeZoomToSelectedRef = React.useRef<boolean | undefined>(undefined)
  // Error states for user-facing errors
  const [selectionError, setSelectionError] = React.useState<string>(null)
  const [zoomError, setZoomError] = React.useState<string>(null)

  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const { icon, name, displayLabel } = currentItem
  const dsExists: boolean = useDataSourceExists({ widgetId: props.widgetId, useDataSourceId: currentItem.useDataSource?.dataSourceId })

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


  React.useEffect(() => {
    if (queryItem.useDataSource?.dataSourceId) {
      DataSourceManager.getInstance().destroyDataSource(queryItem.outputDataSourceId)
    }
  }, [queryItem.useDataSource?.dataSourceId, queryItem.outputDataSourceId])

  // Watch for when results are ready and switch to Results tab
  // This ensures we wait for React to render results, not just for the query to complete
  // This approach matches the behavior of manual input where results are rendered before tab switch
  React.useEffect(() => {
    // Don't auto-switch if user manually switched tabs
    if (manualTabSwitchRef.current) {
      return
    }
    
    // Only switch tabs if:
    // 1. We have results (resultCount > 0)
    // 2. Records are actually loaded (recordsRef.current has data)
    // 3. We're in results stage (stage === 1)
    // 4. We're currently on the query tab (don't switch if already on results)
    if (resultCount > 0 && recordsRef.current && recordsRef.current.length > 0 && stage === 1 && activeTab === 'query') {
      setActiveTab('results')
    }
  }, [resultCount, stage, activeTab])

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
  }, [outputDS, publishDataClearedMsg, props.widgetId, queryItem.configId])

  /**
   * Handles data source creation when switching between query items.
   * When a new query item is selected (e.g., switching from Parcel to Major),
   * this clears old results by programmatically clicking the trash can button
   * to ensure all cleanup logic runs properly.
   * 
   * @param ds - The newly created data source for the selected query item
   */
  const handleDataSourceCreated = React.useCallback((ds: DataSource) => {
    // Clear old results by programmatically clicking the trash can button when switching query items
    // Try ref first, then fall back to utility function if ref isn't set yet
    let clearButton = clearResultBtnRef.current
    if (!clearButton) {
      // Try to find the button using utility function
      clearButton = findClearResultsButton()
    }
    
    // Click the button if it exists and there are results to clear
    // Otherwise, call clearResult() directly
    if (clearButton && resultCount > 0) {
      clearButton.click()
    } else {
      clearResult()
    }
    setDataSource(ds)
    updateDataSource(ds)
    setStage(0)
    setActiveTab('query') // Return to Query tab when switching queries
  }, [updateDataSource, clearResult, resultCount])

  const handleOutputDataSourceCreated = React.useCallback((ds: DataSource) => {
    setOutputDS(ds)
  }, [])

  // Clear results when query item changes (e.g., when new hash parameter triggers different query)
  React.useEffect(() => {
    // Only clear if we're actually switching to a different query (not just re-rendering)
    const isSwitchingQueries = previousConfigIdRef.current !== queryItem.configId
    
    if (isSwitchingQueries && resultCount > 0) {
      // Store the old configId before updating
      const oldConfigId = previousConfigIdRef.current
      // Update the ref to track the new query
      previousConfigIdRef.current = queryItem.configId
      
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
      // Update ref even if no results to clear
      previousConfigIdRef.current = queryItem.configId
    }
  }, [queryItem.configId, clearResult, resultCount])

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
    console.log('[TAB-SWITCH] handleTabChange called', { tab, currentTab: activeTab, resultCount, event: event?.type })
    
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    // Don't allow switching to results if there are no results
    if (tab === 'results' && resultCount === 0) {
      console.log('[TAB-SWITCH] Blocked - no results')
      return
    }
    
    // Mark this as a manual switch to prevent auto-switch useEffect from interfering
    manualTabSwitchRef.current = true
    console.log('[TAB-SWITCH] Setting activeTab to', tab)
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
    
    // Clear old results by programmatically clicking the trash can button when starting a new query
    // If the button exists, it means there are results to clear
    // This ensures we use the exact same logic without code duplication
    if (clearResultBtnRef.current) {
      clearResultBtnRef.current.click()
      // Small delay to ensure the click handler completes before proceeding
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    
    // Set loading stage
    setStage(2)
    
    await publishDataClearedMsg()
    
    // Determine page size based on pagination style
    // For single-page (LazyLoad) mode, use the configured initial page size (defaults to 100)
    // For multi-page mode, use the default page size from props
    let pageSize = defaultPageSize
    if (pagingTypeInConfig === PagingType.LazyLoad) {
      // Use configured lazy load initial page size, falling back to 100 if not set
      pageSize = lazyLoadInitialPageSize ?? 100
    }
    const queryParams = generateQueryParams(featureDS, sqlExpr, spatialFilter, currentItem, 1, pageSize)
    queryParamRef.current = queryParams
    // Change output ds status to unloaded before use it to load count/records.
    featureDS.setStatus(DataSourceStatus.Unloaded)
    featureDS.setCountStatus(DataSourceStatus.Unloaded)
    let queryResultCount = 0 // Capture count from promise chain to use in finally block
    executeCountQuery(props.widgetId, featureDS, queryParams)
      .then((count) => {
        queryResultCount = count // Store count for use in finally block
        setResultCount(count)
        // update ds in order to execute query
        featureDS.updateQueryParams(queryParamRef.current, props.widgetId)
        return executeQuery(props.widgetId, queryItem, featureDS, queryParamRef.current)
      })
      .then((result) => {
        recordsRef.current = result.records
        // Reset selection flag for new query results
        hasSelectedRecordsRef.current = false
        
        // Select query results in output data source - this tells the map to highlight features
        // This must happen BEFORE zoom to ensure selection is visible
        // Selection happens once when results first come back - not on every tab switch
        // This prevents duplicate selections and ensures features are only added to
        // the map's selection set once per query execution
        
        // Select records directly on the origin layer (parcel layer)
        if (result.records && result.records.length > 0 && outputDS) {
          const recordIds = result.records.map(record => record.getId())
          
          // Select records and publish selection message using utility function
          try {
            setSelectionError(null) // Clear previous errors
            selectRecordsAndPublish(
              props.widgetId,
              outputDS,
              recordIds,
              result.records as FeatureDataRecord[]
            )
            hasSelectedRecordsRef.current = true // Mark as selected
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to select query results'
            setSelectionError(errorMessage)
            debugLogger.log('TASK', {
              event: 'selection-failed',
              error: errorMessage,
              errorStack: error instanceof Error ? error.stack : undefined,
              recordCount: recordIds.length
            })
            console.error('Error publishing selection message', error)
          }
        }

        // Trigger the existing zoomToFeature data action (same as clicking "Zoom To" in the menu)
        // Use runtime preference if provided, otherwise fall back to config setting (defaults to true)
        const shouldZoom = runtimeZoomToSelected !== undefined 
          ? runtimeZoomToSelected 
          : (queryItem.zoomToSelected !== false)
        
        if (result.records && result.records.length > 0 && outputDS && shouldZoom) {
          // Create a data set from the output data source and selected records
          const dataSet: DataRecordSet = {
            dataSource: outputDS,
            records: result.records,
            name: outputDS.getLabel()
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
        // Tab switching is now handled by useEffect that watches for resultCount, recordsRef.current, and stage
        // This ensures we wait for React to actually render results before switching tabs
        // This matches the behavior of manual input where results are rendered before tab switch
      })
  }, [currentItem, queryItem, props.widgetId, outputDS, defaultPageSize, pagingTypeInConfig, lazyLoadInitialPageSize, publishDataClearedMsg, clearResult])

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
          flex-shrink: 0;
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
            `}
          >
            {/* Header with back button and query label - Query tab only */}
            <div className={classNames('query-form__header mx-4 align-items-center', { 'in-popper': isInPopper })} css={css`
              display: flex;
              padding: 8px 0;
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
            {enabled && dsExists && (
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
            )}
            <DataSourceTip
              widgetId={props.widgetId}
              useDataSource={queryItem.useDataSource}
              showMessage={true}
              onStatusChange={handleStatusChange}
              onDataSourceCreated={handleDataSourceCreated}
            />
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
                overflow: hidden;
                min-height: 0;
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
