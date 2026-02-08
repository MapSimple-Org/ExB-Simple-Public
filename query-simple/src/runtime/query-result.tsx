/** @jsx jsx */
import {
  React,
  jsx,
  css,
  ReactRedux,
  type IMState,
  type DataSource,
  type ImmutableObject,
  type DataRecord,
  type QueryParams,
  DataSourceComponent,
  DataSourceManager,
  Immutable,
  hooks,
  MessageManager,
  DataRecordsSelectionChangeMessage,
  type FeatureDataRecord,
  type DataRecordSet,
  type FeatureLayerDataSource,
  focusElementInKeyboardMode,
  DataActionManager,
  DataLevel,
  useIntl
} from 'jimu-core'
import { Button, Icon, Tooltip, DataActionList, DataActionListStyle } from 'jimu-ui'
import { getWidgetRuntimeDataMap } from './widget-config'
import { type QueryItemType, FieldsType, PagingType, ListDirection, ResultSelectMode, SelectionType } from '../config'
import defaultMessage from './translations/default'
import { useZoomToRecords } from './hooks/use-zoom-to-records'
// FORCED: Always SimpleList - LazyList and PagingList removed
import { SimpleList } from './simple-list'
import { combineFields } from './query-utils'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { ExpandAllOutlined } from 'jimu-icons/outlined/directional/expand-all'
import { CollapseAllOutlined } from 'jimu-icons/outlined/directional/collapse-all'
import { getExtraActions } from '../data-actions'
import { 
  selectRecordsInDataSources, 
  clearSelectionInDataSources, 
  selectRecordsAndPublish,
  publishSelectionMessage,
  dispatchSelectionEvent 
} from './selection-utils'
import { removeResultsFromAccumulated, removeRecordsFromOriginSelections } from './results-management-utils'
import { removeHighlightGraphics } from './graphics-layer-utils'
import { createQuerySimpleDebugLogger, ErrorMessage } from 'widgets/shared-code/mapsimple-common'
import * as labelPointOperator from '@arcgis/core/geometry/operators/labelPointOperator.js'

const debugLogger = createQuerySimpleDebugLogger()
const { iconMap } = getWidgetRuntimeDataMap()

// r022.42: REMOVED - HelperSimple now handles global identify popup detection and event dispatch
// Old per-layer event dispatch logic was flawed (only detected when THIS layer's selection was cleared)
// const RESTORE_ON_IDENTIFY_CLOSE_EVENT = 'querysimple-restore-on-identify-close'
// function isIdentifyPopupOpen(): boolean { ... }

export interface QueryTaskResultProps {
  widgetId: string
  resultCount: number
  maxPerPage: number
  queryParams: QueryParams
  outputDS: DataSource
  queryItem: ImmutableObject<QueryItemType>
  records: DataRecord[]
  runtimeZoomToSelected?: boolean
  onNavBack: (clearResults?: boolean) => Promise<void> | void
  graphicsLayer?: __esri.GraphicsLayer
  mapView?: __esri.MapView | __esri.SceneView
  resultsMode?: SelectionType
  accumulatedRecords?: FeatureDataRecord[]
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
  eventManager?: import('./hooks/use-event-handling').EventManager  // Chunk 7.1: Event Handling Manager
  // FIX (r018.96): Removed onManualRemoval - no longer needed
  // FIX (r018.92): Flag to track when query switch is in progress
  isQuerySwitchInProgressRef?: React.MutableRefObject<boolean>
  // r021.75: IDs of records from current query (for proper formatting in ADD mode)
  currentQueryRecordIds?: string[]
  // r021.87: Queries array for looking up config by __queryConfigId
  queries?: ImmutableArray<ImmutableObject<QueryItemType>>
  // r022.15: No-removal alert for Remove mode when query finds records but none match
  noRemovalAlert?: {
    show: boolean
    recordsFound: number
    queryValue: string
    timestamp?: number
  } | null
  onDismissNoRemovalAlert?: () => void
  // r022.21: All-duplicates alert for Add mode when all found records are already in Results
  allDuplicatesAlert?: {
    show: boolean
    recordsFound: number
    queryValue: string
    timestamp?: number
  } | null
  onDismissAllDuplicatesAlert?: () => void
}

const resultStyle = css`
  display: flex;
  flex-direction: column;

  .query-result__header {
    color: var(--sys-color-surface-paper-text);
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5;
    border-bottom: 1px solid var(--sys-color-divider-secondary);
    margin-bottom: 6px;
    padding-bottom: 8px;
  }

  .query-result-container {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    overflow: auto;
    min-height: 0;
  }

  .query-result-info {
    height: 18px;
  }
`

export function QueryTaskResult (props: QueryTaskResultProps) {
  const { queryItem, queryParams, resultCount, maxPerPage, records, widgetId, outputDS, runtimeZoomToSelected, onNavBack, resultsMode, accumulatedRecords, onAccumulatedRecordsChange, graphicsLayer, mapView, eventManager, isQuerySwitchInProgressRef, currentQueryRecordIds, queries, noRemovalAlert, onDismissNoRemovalAlert, allDuplicatesAlert, onDismissAllDuplicatesAlert } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const intl = useIntl()
  const zoomToRecords = useZoomToRecords(mapView)
  const [queryData, setQueryData] = React.useState(null)
  const [selectedRecords, setSelectedRecords] = React.useState<DataRecord[]>([])
  // FIX (r018.94): Removed removedRecordIds state - no longer needed since records stay in sync
  
  // r021.75: In ADD mode, only records from current query need current queryItem for rendering
  // Existing records already in DOM keep their original formatting
  React.useEffect(() => {
    if (currentQueryRecordIds && currentQueryRecordIds.length > 0) {
      debugLogger.log('RESULTS-MODE', {
        event: 'current-query-records-received',
        widgetId,
        currentQueryRecordIds,
        currentQueryRecordCount: currentQueryRecordIds.length,
        queryConfigId: queryItem.configId,
        resultsMode,
        timestamp: Date.now()
      })
    }
  }, [currentQueryRecordIds, widgetId, queryItem.configId, resultsMode])
  
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const [expandAll, setExpandAll] = React.useState(currentItem.resultExpandByDefault ?? false)
  // r021.77: itemExpandStates removed - doesn't persist with no-rerender approach (formatting trade-off)
  const backBtnRef = React.useRef<HTMLButtonElement>(undefined)
  
  // Track expandAll changes for debugging
  React.useEffect(() => {
    debugLogger.log('RESULTS-MODE', {
      event: 'expandAll-state-changed',
      widgetId,
      expandAll,
      queryItemConfigId: queryItem.configId,
      timestamp: Date.now()
    })
  }, [expandAll, widgetId, queryItem.configId])
  // Track if we've already selected these records to prevent re-selection when switching tabs
  const hasSelectedRef = React.useRef(false)
  // Track the last records we selected to detect when new records come in
  const lastSelectedRecordsRef = React.useRef<string[]>([])
  // Track the original query record IDs (not selected IDs) to detect when query results change
  const lastQueryRecordIdsRef = React.useRef<string[]>([])
  // Track the last selected FeatureDataRecords for restoration (if needed)
  const lastSelectedFeatureRecordsRef = React.useRef<FeatureDataRecord[]>([])
  // r021.98: Track when removal is in progress to prevent useEffect from re-adding graphics
  const isRemovalInProgressRef = React.useRef(false)
  // FIX (r018.94): Removed removedRecordIds ref - no longer needed
  
  // r021.15: Cleanup refs on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      // Clear all refs holding FeatureDataRecord arrays to allow garbage collection
      // These arrays can hold hundreds of records with circular references to DOM nodes
      lastSelectedRecordsRef.current = []
      lastQueryRecordIdsRef.current = []
      lastSelectedFeatureRecordsRef.current = []
      hasSelectedRef.current = false
      
      debugLogger.log('TASK', {
        event: 'memory-cleanup-query-result-refs',
        widgetId,
        note: 'Cleared refs on QueryTaskResult unmount to free memory',
        timestamp: Date.now()
      })
    }
  }, [widgetId])
  
  // Error state for user-facing errors
  const [selectionError, setSelectionError] = React.useState<string>(null)

  const extraActions = React.useMemo(() => {
    return getExtraActions(widgetId, outputDS, mapView, intl, queryItem, runtimeZoomToSelected)
  }, [widgetId, outputDS, mapView, intl, queryItem, runtimeZoomToSelected])

  const enableDataAction = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.enableDataAction ?? true
  })

  const pagingTypeInConfig = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.resultPagingStyle
  })
  const directionTypeInConfig = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.resultListDirection
  })
  // FORCE SimpleList - ignore config, we're done with lazy loading issues
  const pagingType = PagingType.Simple
  const direction = directionTypeInConfig ?? ListDirection.Vertical

  // Group records by origin data source for DataActionList
  // This ensures DataActionList recognizes records even when they come from different queries/origins
  const actionDataSets: DataRecordSet[] = React.useMemo(() => {
    // Debug: Log what records are available
    debugLogger.log('RESULTS-MODE', {
      event: 'actionDataSets-calculation-start',
      widgetId: widgetId,
      selectedRecordsCount: selectedRecords?.length || 0,
      queryDataRecordsCount: queryData?.records?.length || 0,
      recordsPropCount: records?.length || 0,
      outputDSId: outputDS?.id,
      hasSelectedRecords: selectedRecords?.length > 0,
      hasQueryDataRecords: queryData?.records?.length > 0,
      hasRecordsProp: records?.length > 0
    })
    
    const isAccumulationMode = resultsMode === SelectionType.AddToSelection || resultsMode === SelectionType.RemoveFromSelection
    
    // In accumulation modes (Add/Remove), prefer the 'records' prop (the accumulated set)
    // because outputDS.getSelectedRecords() will only return records that match the current query's where clause.
    const recordsToUse = isAccumulationMode
      ? (records || [])
      : (selectedRecords?.length > 0 ? selectedRecords : (queryData?.records?.length > 0 ? queryData.records : (records || [])))
    
    // If no records, return single DataRecordSet with empty records using outputDS
    if (!recordsToUse || recordsToUse.length === 0) {
      const emptyDataSet: DataRecordSet = {
        dataSource: outputDS,
        type: 'loaded',
        records: [],
        name: outputDS?.id,
        label: outputDS?.getLabel()
      }
      debugLogger.log('RESULTS-MODE', {
        event: 'actionDataSets-empty-records',
        widgetId: widgetId,
        dataSetDataSourceId: emptyDataSet.dataSource?.id
      })
      return [emptyDataSet]
    }
    
    // Group records by their origin data source
    const recordsByOriginDS = new Map<FeatureLayerDataSource, FeatureDataRecord[]>()
    
    recordsToUse.forEach(record => {
      const recordDS = (record as FeatureDataRecord).getDataSource?.() as FeatureLayerDataSource
      let originDS: FeatureLayerDataSource | null = null
      
      if (recordDS) {
        originDS = recordDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || recordDS
      } else if (outputDS) {
        // Fallback: use outputDS's origin if record doesn't have dataSource
        originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || outputDS as FeatureLayerDataSource
      }
      
      if (originDS) {
        if (!recordsByOriginDS.has(originDS)) {
          recordsByOriginDS.set(originDS, [])
        }
        recordsByOriginDS.get(originDS).push(record as FeatureDataRecord)
      }
    })
    
    // Create a DataRecordSet for each origin data source
    const dataSets: DataRecordSet[] = Array.from(recordsByOriginDS.entries()).map(([originDS, originRecords]) => {
      const dataSet: DataRecordSet = {
        dataSource: originDS, // Use origin DS, not outputDS
        type: 'selected',
        records: originRecords,
        name: originDS.id,
        label: originDS.getLabel()
      }
      
      // Add fields if needed (use currentItem's field settings)
      if (currentItem.resultFieldsType === FieldsType.SelectAttributes && currentItem.resultDisplayFields != null) {
        dataSet.fields = combineFields(currentItem.resultDisplayFields, currentItem.resultTitleExpression)
      } else if (originDS && 'getPopupInfo' in originDS) {
        // use fields in popup template from origin DS
        const popupInfo = originDS.getPopupInfo()
        if (popupInfo?.fieldInfos) {
          dataSet.fields = popupInfo.fieldInfos.filter((fieldInfo) => fieldInfo.visible).map((fieldInfo) => fieldInfo.fieldName)
        }
      }
      
      return dataSet
    })
    
    // Debug: Log what the final dataSets contain
    debugLogger.log('RESULTS-MODE', {
      event: 'actionDataSets-final',
      widgetId: widgetId,
      dataSetsCount: dataSets.length,
      totalRecordsCount: recordsToUse.length,
      dataSetsByOrigin: dataSets.map(ds => ({
        originDSId: ds.dataSource?.id,
        recordsCount: ds.records?.length || 0,
        type: ds.type
      }))
    })
    
    // If we couldn't group by origin (shouldn't happen), fallback to single DataRecordSet with outputDS
    if (dataSets.length === 0 && outputDS) {
      debugLogger.log('RESULTS-MODE', {
        event: 'actionDataSets-fallback-to-outputDS',
        widgetId: widgetId,
        reason: 'could-not-determine-origin-ds'
      })
      return [{
        dataSource: outputDS,
        type: recordsToUse.length > 0 ? 'selected' : 'loaded',
        records: recordsToUse,
        name: outputDS.id,
        label: outputDS.getLabel()
      }]
    }
    
    return dataSets
  }, [selectedRecords, outputDS, queryData, currentItem, records, widgetId])

  // FIX (r018.94): Simplified - no filtering needed since records are kept in sync
  // Memoize records to prevent unnecessary re-renders that reset scroll position
  // This ensures the records prop only changes when the actual data changes, not just the array reference
  const filteredRecordsForList = React.useMemo(() => {
    const result = queryData?.records || records || []
    return result
  }, [queryData?.records, records])

  hooks.useEffectOnce(() => {
    // focus the back button when it is rendered
    focusElementInKeyboardMode(backBtnRef.current)
  })

  /**
   * Effect hook that runs when new query results arrive.
   * Resets removed records, expand state, and query data for the new results.
   * Also handles auto-selection of records when they first arrive.
   */
  React.useEffect(() => {
    // Check if these are new records (different from what we last queried)
    // IMPORTANT: Compare against original query results, not selected results
    // This prevents removedRecordIds from being reset when records are removed
    const currentRecordIds = records?.map(record => record.getId()) || []
    const recordsChanged = currentRecordIds.length !== lastQueryRecordIdsRef.current.length ||
      currentRecordIds.some((id, index) => id !== lastQueryRecordIdsRef.current[index])
    
    // FIX (r018.94): Simplified - no removedRecordIds tracking needed
    debugLogger.log('RESULTS-MODE', {
      event: 'records-prop-changed',
      widgetId: widgetId,
      recordsCount: records?.length || 0,
      willSetQueryData: records && records.length > 0,
      hasSelectedRef: hasSelectedRef.current,
      recordsChanged: recordsChanged,
      lastQueryRecordIdsCount: lastQueryRecordIdsRef.current.length,
      currentRecordIdsCount: currentRecordIds.length,
      note: 'r018.94: Records stay in sync - no filtering needed',
      timestamp: Date.now()
    })
    
    // Update the original query record IDs ref
    if (recordsChanged) {
      lastQueryRecordIdsRef.current = currentRecordIds
      debugLogger.log('RESULTS-MODE', {
        event: 'records-changed-ref-updated',
        widgetId: widgetId,
        newRecordIdsCount: currentRecordIds.length,
        timestamp: Date.now()
      })
    }
    
    // NOTE: Don't reset expandAll here - it's handled by the queryItem-change useEffect
    // Resetting it here causes the Expand/Collapse button to flip back when records are removed
    setQueryData({
      records,
      page: 1
    })
    
    // FIX (r018.94): Simplified - no removedRecordIds check needed
    // Only auto-select records if:
    // 1. We have records and outputDS
    // 2. We haven't already selected these records (hasSelectedRef is false)
    // 3. OR the records have actually changed (new query results)
    // r021.98: Skip re-selection if removal just happened - removal already handled graphics
    if (isRemovalInProgressRef.current) {
      isRemovalInProgressRef.current = false // Clear flag after checking
      // Also update the ref so subsequent renders don't see recordsChanged as true
      if (recordsChanged) {
        lastQueryRecordIdsRef.current = currentRecordIds
      }
    } else if (records && records.length > 0 && outputDS && 
        (!hasSelectedRef.current || recordsChanged)) {
      const recordIds = records.map(record => record.getId())
      const fdr = records as FeatureDataRecord[]
      
      // r022.71: Intelligent check - are these records already selected in outputDS?
      const currentSelectedIds = outputDS.getSelectedRecordIds() || []
      const recordIdsSet = new Set(recordIds)
      const currentSelectedIdsSet = new Set(currentSelectedIds)
      
      const alreadySelected = 
        recordIds.length === currentSelectedIds.length &&
        recordIds.every(id => currentSelectedIdsSet.has(id))
      
      debugLogger.log('SELECTION-STATE-AUDIT', {
        event: 'r022-71-useEffect-selection-check',
        widgetId,
        recordsToSelectCount: recordIds.length,
        currentSelectedCount: currentSelectedIds.length,
        recordsToSelect: recordIds.slice(0, 5), // First 5 IDs
        currentSelected: currentSelectedIds.slice(0, 5), // First 5 IDs
        alreadySelected,
        hasSelectedRef: hasSelectedRef.current,
        recordsChanged,
        willSkipSelection: alreadySelected,
        timestamp: Date.now()
      })
      
      // Select records and publish selection message using utility function
      // Use async IIFE since useEffect can't be async
      ;(async () => {
        try {
          setSelectionError(null) // Clear previous errors
          debugLogger.log('GRAPHICS-LAYER', {
            event: 'CALL-SITE-records-useEffect',
            source: 'query-result.tsx line ~470',
            widgetId,
            recordIdsCount: recordIds.length,
            hasSelectedRef: hasSelectedRef.current,
            recordsChanged,
            alreadySelected,
            note: 'r022.72: Calling selectRecordsAndPublish, may skip origin DS selection if alreadySelected',
            timestamp: Date.now()
          })
          await selectRecordsAndPublish(
            widgetId, 
            outputDS, 
            recordIds, 
            fdr, 
            false, 
            true, // Always use graphics layer
            graphicsLayer, 
            mapView,
            alreadySelected // r022.72: Skip origin DS selection if already selected, but still do graphics
          )
          hasSelectedRef.current = true // Mark as selected
          lastSelectedRecordsRef.current = recordIds // Store the IDs we selected
          lastSelectedFeatureRecordsRef.current = fdr // Store the full records for potential restoration
          
          // Notify Widget and HelperSimple of selection change (BUG-STALE-COUNT-001: pass count)
          dispatchSelectionEvent(widgetId, recordIds, outputDS, queryItem.configId, eventManager, accumulatedRecords?.length)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to select query results'
          setSelectionError(errorMessage)
          debugLogger.log('TASK', {
            event: 'selection-failed-query-result',
            error: errorMessage,
            errorStack: error instanceof Error ? error.stack : undefined,
            recordCount: recordIds.length
          })
        }
      })()
    } else if (recordsChanged && records && records.length === 0) {
      // If records were cleared, reset the selection flag
      hasSelectedRef.current = false
      lastSelectedRecordsRef.current = []
      setSelectionError(null) // Clear errors when clearing records
    } else {
      debugLogger.log('RESULTS-MODE', {
        event: 'auto-selection-skipped',
        widgetId: widgetId,
        recordsCount: records?.length || 0,
        hasRecords: !!(records && records.length > 0),
        hasOutputDS: !!outputDS,
        hasSelectedRef: hasSelectedRef.current,
        recordsChanged: recordsChanged,
        timestamp: Date.now()
      })
    }
  }, [records, outputDS, widgetId, queryItem.configId, queryItem.resultExpandByDefault])

  React.useEffect(() => {
    // clear selection when resultSelectMode changed
    if (outputDS) {
      clearSelectionInDataSources(outputDS, true, graphicsLayer) // Always use graphics layer
      publishSelectionMessage(widgetId, [], outputDS, true)
    }
  }, [queryItem.resultSelectMode, outputDS, widgetId, graphicsLayer])

  // Update expandAll when queryItem changes (e.g., switching between queries)
  React.useEffect(() => {
    const newExpandAll = queryItem.resultExpandByDefault ?? false
    debugLogger.log('RESULTS-MODE', {
      event: 'expandAll-reset-by-queryItem-change',
      widgetId,
      queryItemConfigId: queryItem.configId,
      resultExpandByDefault: queryItem.resultExpandByDefault,
      newExpandAll,
      timestamp: Date.now()
    })
    setExpandAll(newExpandAll)
    // r021.77: itemExpandStates removed - doesn't persist with no-rerender approach
  }, [queryItem.configId])

  /**
   * Monitor origin data source selection changes to detect when other widgets (like map identify)
   * clear our selections. Watches the origin data source's selection state directly via polling.
   * 
   * r022.42: Identify popup tracking removed (now handled globally by HelperSimple)
   */
  React.useEffect(() => {
    if (!outputDS) return

    const originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource
    if (!originDS) return

    const originDSId = originDS.id
    let previousSelectedIds: string[] = []
    let lastLogTime = 0
    const LOG_THROTTLE_MS = 1000 // Throttle logs to once per second
    
    // Initial check
    previousSelectedIds = originDS.getSelectedRecordIds() || []

    // r022.42: Removed identify popup tracking (now handled globally by HelperSimple)
    // Watch for selection changes on the origin data source
    const checkSelection = () => {
      const currentSelectedIds = originDS.getSelectedRecordIds() || []
      const ourExpectedIds = lastSelectedRecordsRef.current
      const hasOurSelection = ourExpectedIds.length > 0
      
      // Detect if selection was cleared or changed externally
      const wasCleared = previousSelectedIds.length > 0 && currentSelectedIds.length === 0
      const wasChanged = previousSelectedIds.length > 0 && 
        (currentSelectedIds.length !== previousSelectedIds.length ||
         !currentSelectedIds.every(id => previousSelectedIds.includes(id)))
      
      // NEW: Detect if selection was added (went from empty to having records)
      const wasAdded = previousSelectedIds.length === 0 && currentSelectedIds.length > 0
      
      const now = Date.now()
      
      // r022.42: Simplified logging - removed identify popup state tracking (HelperSimple handles globally)
      // Log ALL selection changes (not just when we have our own selection)
      if (wasCleared || wasChanged || wasAdded) {
        // Check if this matches our expected selection
        const matchesOurSelection = hasOurSelection && 
          ourExpectedIds.length === currentSelectedIds.length &&
          ourExpectedIds.every(id => currentSelectedIds.includes(id))
        
        // Log detection (throttled)
        if (now - lastLogTime > LOG_THROTTLE_MS) {
          debugLogger.log('SELECTION', {
            event: wasCleared ? 'selection-cleared' : wasChanged ? 'selection-changed' : 'selection-added',
            originDSId,
            ourExpectedCount: ourExpectedIds.length,
            previousSelectedCount: previousSelectedIds.length,
            currentSelectedCount: currentSelectedIds.length,
            wasCleared,
            wasChanged,
            wasAdded,
            hasOurSelection,
            matchesOurSelection,
            ourExpectedIds: ourExpectedIds.slice(0, 5),
            previousSelectedIds: previousSelectedIds.slice(0, 5),
            currentSelectedIds: currentSelectedIds.slice(0, 5),
            timestamp: new Date().toISOString(),
            note: 'r022.42: Restoration now handled globally by HelperSimple'
          })
          
          lastLogTime = now
        }
      }
      
      previousSelectedIds = [...currentSelectedIds]
    }

    // Check periodically (every 500ms)
    const intervalId = setInterval(checkSelection, 500)
    
    return () => {
      clearInterval(intervalId)
    }
  }, [outputDS])

  /**
   * Clears all results. Resets local state and delegates to parent's clearResult method.
   */
  const clearResults = async () => {
    // Log hash state before clearing
    const hashBefore = window.location.hash.substring(1)
    const urlParamsBefore = new URLSearchParams(hashBefore)
    const hashParamsBefore: { [key: string]: string } = {}
    urlParamsBefore.forEach((value, key) => {
      hashParamsBefore[key] = value
    })
    
    debugLogger.log('HASH', {
      event: 'clearResults-called',
      widgetId,
      hashBefore: hashBefore,
      hashParamsBefore: hashParamsBefore,
      hashParamsCount: Object.keys(hashParamsBefore).length,
      timestamp: Date.now()
    })
    
    // FIX (r018.97): Simplified - just delegate to parent's clearResult
    // Parent handles all cleanup: records, selection, graphics, hash, messages, etc.
    // Local state will be reset when component remounts with fresh results
    await onNavBack(true)
    
    // Log hash state after clearing (with delay to catch async updates)
    setTimeout(() => {
      const hashAfter = window.location.hash.substring(1)
      const urlParamsAfter = new URLSearchParams(hashAfter)
      const hashParamsAfter: { [key: string]: string } = {}
      urlParamsAfter.forEach((value, key) => {
        hashParamsAfter[key] = value
      })
      
      debugLogger.log('HASH', {
        event: 'clearResults-completed',
        widgetId,
        hashBefore: hashBefore,
        hashAfter: hashAfter,
        hashParamsBefore: hashParamsBefore,
        hashParamsAfter: hashParamsAfter,
        hashParamsRemoved: Object.keys(hashParamsBefore).length - Object.keys(hashParamsAfter).length,
        hashParamsCountBefore: Object.keys(hashParamsBefore).length,
        hashParamsCountAfter: Object.keys(hashParamsAfter).length,
        stillHasHashParams: Object.keys(hashParamsAfter).length > 0,
        timestamp: Date.now()
      })
    }, 100)
  }

  // r021.106: Removed handleRenderDone - was causing triple-call race after removals
  // The records-watching useEffect already handles selection updates, making this redundant

  const handleDataSourceInfoChange = React.useCallback(() => {
    const ds = DataSourceManager.getInstance().getDataSource(outputDS?.id)
    const dsRecords = ds?.getSelectedRecords()
    const selectedIds = ds?.getSelectedRecordIds() ?? []
    
    // Capture records prop before using it (to avoid shadowing)
    const recordsProp = records
    
    // Debug: Log what handleDataSourceInfoChange sees
    debugLogger.log('RESULTS-MODE', {
      event: 'handleDataSourceInfoChange-fired',
      widgetId: widgetId,
      outputDSId: outputDS?.id,
      dsId: ds?.id,
      selectedRecordsFromDS: dsRecords?.length || 0,
      selectedIdsFromDS: selectedIds.length,
      currentSelectedRecordsState: selectedRecords?.length || 0,
      recordsPropCount: recordsProp?.length || 0,
      note: 'r018.94: No removedRecordIds tracking',
      timestamp: Date.now()
    })
    
    // If we have records in the prop (accumulated records) but DS shows 0 selected,
    // and we currently have selectedRecords, this is likely a query switch in "Add to" mode
    // where re-selection hasn't happened yet. Don't clear selectedRecords - wait for re-selection.
    if (recordsProp && recordsProp.length > 0 && selectedIds.length === 0 && selectedRecords && selectedRecords.length > 0) {
      debugLogger.log('RESULTS-MODE', {
        event: 'handleDataSourceInfoChange-skipping-clear-during-query-switch',
        widgetId: widgetId,
        reason: 'waiting-for-reselection',
        recordsPropCount: recordsProp.length,
        currentSelectedRecordsCount: selectedRecords.length
      })
      return // Skip updating - re-selection is coming
    }
    
    // FIX (r018.94): Simplified - no removedRecordIds filtering needed
    // Records prop is already filtered in Add/Remove mode
    let shouldUpdate = false
    if (selectedIds.length !== selectedRecords?.length) {
      shouldUpdate = true
    } else { // equal length
      shouldUpdate = selectedIds.some(id => {
        const target = selectedRecords.find((item) => item.getId() === id)
        return target == null
      })
    }
    if (shouldUpdate) {
      debugLogger.log('RESULTS-MODE', {
        event: 'handleDataSourceInfoChange-updating-selectedRecords',
        widgetId: widgetId,
        oldCount: selectedRecords?.length || 0,
        newCount: dsRecords?.length || 0,
        oldSelectedIds: (selectedRecords || []).map(r => r.getId()).slice(0, 5),
        newSelectedIds: selectedIds.slice(0, 5),
        note: 'r018.94: No removedRecordIds filtering',
        timestamp: Date.now()
      })
      setSelectedRecords(dsRecords || [])
    } else {
      debugLogger.log('RESULTS-MODE', {
        event: 'handleDataSourceInfoChange-skipping-update',
        widgetId: widgetId,
        reason: 'no-change-detected',
        timestamp: Date.now()
      })
    }
  }, [outputDS?.id, selectedRecords, widgetId, records])

  /**
   * Generates the tip message showing how many features are displayed.
   * FIX (r018.94): Simplified - no filtering needed since records stay in sync
   * 
   * @returns Formatted string like "Features displayed: 118 / 118"
   */
  const getTipMessage = () => {
    if (queryData && queryData.records) {
      // FIX (r018.94): No filtering needed - queryData.records is already filtered
      const displayedCount = queryData.records.length
      
      // FIX (r018.83): Use displayedCount for both numerator and denominator
      // This ensures the count shows "118 / 118" after removing records, not "118 / 121"
      return `${getI18nMessage('featuresDisplayed')}: ${displayedCount} / ${displayedCount}`
      const { page = 1, pageSize = defaultPageSize } = queryData
      const from = (page - 1) * pageSize + 1
      const to = from + pageSize - 1
      if (resultCount > 0) {
        return `${getI18nMessage('featuresDisplayed')}: ${from} - ${Math.min(to, displayedCount)} / ${resultCount}`
      }
      return `${getI18nMessage('featuresDisplayed')}: 0 - 0 / 0`
    }
    return ''
  }

  /**
   * Toggles expand/collapse state for all result items.
   * When toggled, all result items will be expanded or collapsed together.
   * Updates individual item expansion states in the map to maintain state when items are removed.
   */
  const toggleExpandAll = React.useCallback(() => {
    setExpandAll(prev => {
      const newValue = !prev
      debugLogger.log('EXPAND-COLLAPSE', {
        event: 'toggleExpandAll-clicked',
        widgetId,
        previousValue: prev,
        newValue,
        note: 'r021.77: itemExpandStates removed - expand state now applies immediately, no persistence',
        timestamp: Date.now()
      })
      
      return newValue
    })
  }, [widgetId, filteredRecordsForList])

  const resultUseOutputDataSource = React.useMemo(() => {
    return Immutable({
      dataSourceId: queryItem.outputDataSourceId,
      mainDataSourceId: queryItem.outputDataSourceId
    })
  }, [queryItem?.outputDataSourceId])

  const handleEscape = React.useCallback(() => {
    focusElementInKeyboardMode(backBtnRef.current)
  }, [])

  // Keep records selected and zoom to clicked record
  // Records remain selected as long as they're in the results
  // Clicking a record always zooms to it on the map (this behavior is always enabled)
  /**
   * Handles clicking a result item to select it, zoom to it, and open a popup.
   * 
   * **Popup Feature (r021.3, r021.11):**
   * - Opens ArcGIS Maps SDK popup after zoom completes
   * - Uses `labelPointOperator.execute()` for optimal location calculation (r021.11):
   *   - Points: Returns the point itself
   *   - Polylines: Returns vertex near middle of longest segment
   *   - Polygons: Returns point near centroid (GUARANTEED interior!)
   * - Performance: < 1ms calculation time
   * - API: https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-operators-labelPointOperator.html
   * 
   * **Cleanup (r021.4-r021.7):**
   * - Popup closes when results are cleared
   * - Popup closes when individual record is removed
   * - Popup closes when widget panel closes
   * - Popup closes in Remove mode query execution
   */
  const toggleSelection = React.useCallback((data: FeatureDataRecord) => {
    // Ensure the clicked record is selected (it should already be, but ensure it)
    const selectedDatas = outputDS.getSelectedRecords() ?? []
    const selectedIds = outputDS.getSelectedRecordIds() ?? []
    const dataId = data.getId()
    
    // If this record isn't already selected, add it to the selection
    if (!selectedIds.includes(dataId)) {
      const updatedSelectedDatas = [...selectedDatas, data]
      const recordIds = updatedSelectedDatas.map(record => record.getId())
      
      // Select records and publish selection message using utility function
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'CALL-SITE-handleRecordClick',
        source: 'query-result.tsx line ~1046',
        widgetId,
        recordIdsCount: recordIds.length,
        clickedRecordId: dataId,
        note: 'r021.105: Calling from handleRecordClick',
        timestamp: Date.now()
      })
      selectRecordsAndPublish(widgetId, outputDS, recordIds, updatedSelectedDatas as FeatureDataRecord[], true)
    }
    
    // Zoom to the clicked record with padding (always enabled - user wants to keep this behavior)
    
    // r021.0 Chunk 1: Get feature from data (FeatureDataRecord)
    const clickedFeature = (data as any).feature || data.getData?.() || null
    
    // r021.0 Chunk 1: Log BEFORE zoom to verify function is called
    debugLogger.log('POPUP', {
      event: 'result-clicked-BEFORE-zoom',
      recordId: dataId,
      hasMapView: !!mapView,
      hasFeature: !!clickedFeature,
      hasZoomFunction: !!zoomToRecords,
      note: 'If you see this, toggleSelection is being called',
      timestamp: Date.now()
    })
    
    // Zoom to record, then log popup data (Chunk 1: r021.0)
    const zoomPromise = zoomToRecords([data])
    
    debugLogger.log('POPUP', {
      event: 'zoom-promise-created',
      recordId: dataId,
      isPromise: zoomPromise && typeof zoomPromise.then === 'function',
      promiseType: typeof zoomPromise,
      note: 'Checking if zoomToRecords returns a promise',
      timestamp: Date.now()
    })
    
    zoomPromise
      .then(() => {
        // r021.0 Chunk 1: Log AFTER zoom to verify promise resolved
        debugLogger.log('POPUP', {
          event: 'result-clicked-AFTER-zoom',
          recordId: dataId,
          hasMapView: !!mapView,
          hasFeature: !!clickedFeature,
          note: 'If you see this, zoom promise resolved',
          timestamp: Date.now()
        })
        
        // r021.9: Calculate popup location AFTER zoom completes (for polylines, find closest point to map center)
        if (mapView && clickedFeature) {
          const geometry = data.getJSAPIGeometry()
          
          if (geometry) {
            // r021.11: Calculate popup location using labelPointOperator
            // This ensures the popup is always on the interior of the geometry
            const calcStartTime = Date.now()
            let popupLocation: any
            let calculationMethod = 'labelPointOperator'
            let calculationDetails: any = {}
            
            try {
              // Use labelPointOperator for all geometry types
              // - Point: Returns the point itself
              // - Polyline: Returns vertex near middle of longest segment
              // - Polygon: Returns point near centroid (GUARANTEED interior!)
              popupLocation = labelPointOperator.execute(geometry)
              
              calculationDetails = {
                geometryType: geometry.type,
                method: 'labelPointOperator.execute',
                note: geometry.type === 'polygon' 
                  ? 'Guaranteed interior point' 
                  : geometry.type === 'polyline'
                  ? 'Vertex near middle of longest segment'
                  : 'Point itself'
              }
            } catch (error) {
              // Fallback to centroid/extent center if labelPointOperator fails
              debugLogger.log('POPUP', {
                event: 'labelPointOperator-error',
                error: error?.toString(),
                geometryType: geometry.type,
                fallback: 'centroid-or-extent',
                timestamp: Date.now()
              })
              
              popupLocation = (geometry as any).centroid || geometry.extent?.center
              calculationMethod = 'fallback-centroid'
              calculationDetails = { error: error?.toString() }
            }
            
            const calcEndTime = Date.now()
            const calcDuration = calcEndTime - calcStartTime
            
            debugLogger.log('POPUP', {
              event: 'popup-location-calculated',
              recordId: dataId,
              geometryType: geometry.type,
              calculationMethod,
              calculationDurationMs: calcDuration,
              calculationDetails,
              hasPopupLocation: !!popupLocation,
              popupLocationCoords: popupLocation ? {
                x: popupLocation.x,
                y: popupLocation.y,
                spatialReference: popupLocation.spatialReference?.wkid
              } : null,
              timestamp: Date.now()
            })
            
            // r021.3 Chunk 2: Open the popup (NO CLEANUP YET)
            try {
              // Temporarily toggle popupEnabled to allow programmatic control
              const originalPopupEnabled = mapView.popupEnabled
              mapView.popupEnabled = false
              
              debugLogger.log('POPUP', {
                event: 'popup-opening',
                recordId: dataId,
                originalPopupEnabled,
                note: 'About to call mapView.openPopup()',
                timestamp: Date.now()
              })
              
              // Open popup using mapView.openPopup() for proper initialization
              mapView.openPopup({
                features: [clickedFeature],
                location: popupLocation,
                shouldFocus: true
              })
              
              // Restore original popupEnabled state
              mapView.popupEnabled = originalPopupEnabled
              
              debugLogger.log('POPUP', {
                event: 'popup-opened',
                recordId: dataId,
                popupVisible: mapView.popup?.visible,
                note: 'Popup opened successfully',
                timestamp: Date.now()
              })
            } catch (error) {
              debugLogger.log('POPUP', {
                event: 'popup-open-failed',
                recordId: dataId,
                error: error instanceof Error ? error.message : String(error),
                note: 'Failed to open popup',
                timestamp: Date.now()
              })
            }
          } else {
            debugLogger.log('POPUP', {
              event: 'result-clicked-no-geometry',
              recordId: dataId,
              hasFeature: !!clickedFeature,
              warning: 'No geometry available for popup',
              timestamp: Date.now()
            })
          }
        } else {
          debugLogger.log('POPUP', {
            event: 'result-clicked-missing-dependencies',
            recordId: dataId,
            hasMapView: !!mapView,
            hasFeature: !!clickedFeature,
            warning: 'Cannot prepare popup data - missing mapView or feature',
            timestamp: Date.now()
          })
        }
      })
      .catch(error => {
        // Log zoom errors so we know if .then() didn't fire
        debugLogger.log('POPUP', {
          event: 'zoom-promise-rejected',
          recordId: dataId,
          error: error instanceof Error ? error.message : String(error),
          note: 'Zoom failed, so .then() callback did not fire',
          timestamp: Date.now()
        })
      })
  }, [outputDS, widgetId, zoomToRecords])

  /**
   * Removes a record from the results and selection.
   * If removing the last record, automatically clears all results
   * by calling the trash can logic (same as clicking Clear button).
   * This ensures the UI doesn't show "Features displayed: 0 / 1" when all results are removed.
   * 
   * @param data - The feature data record to remove
   */
  const removeRecord = React.useCallback((data: FeatureDataRecord) => {
    const dataId = data.getId()
    const currentExpandAll = expandAll
    
    // r021.98: Mark removal in progress to prevent useEffect from re-adding graphics
    isRemovalInProgressRef.current = true
    
    // r021.5 Chunk 2b: Close popup when removing individual record
    if (mapView?.popup?.visible) {
      mapView.popup.close()
      debugLogger.log('POPUP', {
        event: 'popup-closed-on-remove-record',
        widgetId,
        removedRecordId: dataId,
        reason: 'User removed individual record',
        timestamp: Date.now()
      })
    }
    
    // Log hash state when removing individual record
    const hash = window.location.hash.substring(1)
    const urlParams = new URLSearchParams(hash)
    const hashParams: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      hashParams[key] = value
    })
    
    debugLogger.log('EXPAND-COLLAPSE', {
      event: 'removeRecord-started',
      widgetId,
      removedRecordId: dataId,
      currentExpandAll,
      timestamp: Date.now()
    })
    
    debugLogger.log('HASH', {
      event: 'removeRecord-called',
      widgetId,
      removedRecordId: dataId,
      hash: hash,
      hashParams: hashParams,
      hashParamsCount: Object.keys(hashParams).length,
      timestamp: Date.now()
    })

    // SURGICAL HASH MODIFICATION: Remove the record ID from hash parameters
    // This makes the hash a precise representation of what should be selected
    const idParamKeys = ['id', 'pin', 'major', 'parcel', 'shortId'] // Common ID parameter names
    let hashModified = false

    idParamKeys.forEach(paramKey => {
      if (urlParams.has(paramKey)) {
        const currentValue = urlParams.get(paramKey) || ''
        const ids = currentValue.split(',').map(id => id.trim()).filter(id => id)

        // Remove the specific record ID from this parameter
        const filteredIds = ids.filter(id => id !== dataId)

        if (filteredIds.length !== ids.length) {
          // IDs were removed, update the parameter
          if (filteredIds.length > 0) {
            urlParams.set(paramKey, filteredIds.join(','))
          } else {
            // No IDs left, remove the parameter entirely
            urlParams.delete(paramKey)
          }
          hashModified = true
        }
      }
    })

    // FIX (r018.84): SURGICAL HASH MODIFICATION FOR data_s PARAMETER
    // Experience Builder creates a new widget output ID instead of updating the existing one
    // We need to manually update the existing entry to prevent duplication
    if (urlParams.has('data_s')) {
      const dataS = urlParams.get('data_s') || ''
      const decodedDataS = decodeURIComponent(dataS)
      const selections = decodedDataS.split(',')
      
      // Extract widget number from widgetId (e.g., "widget_12" -> "12")
      const widgetMatch = widgetId.match(/widget_(\d+)/)
      if (widgetMatch) {
        const widgetNumber = widgetMatch[1]
        const widgetPattern = new RegExp(`widget_${widgetNumber}_output_\\d+`)
        
        // Find and update the selection entry for this widget
        let dataSModified = false
        const updatedSelections = selections.map(selection => {
          if (!selection.startsWith('id:')) {
            return selection
          }
          
          const idPart = selection.substring(3) // Remove "id:"
          const colonIndex = idPart.lastIndexOf(':')
          if (colonIndex === -1) {
            return selection
          }
          
          const dsIdPart = idPart.substring(0, colonIndex)
          const recordIdsPart = idPart.substring(colonIndex + 1)
          
          // Check if this matches our widget's output DS pattern
          let matchesWidget = false
          if (dsIdPart.includes('~')) {
            // Compound format: dataSource_*~widget_XX_output_*
            const parts = dsIdPart.split('~')
            matchesWidget = parts.some(part => part.match(widgetPattern))
          } else {
            // Simple format: widget_XX_output_*
            matchesWidget = dsIdPart.match(widgetPattern) !== null
          }
          
          if (matchesWidget) {
            // Remove the specific record ID from this entry
            const recordIds = recordIdsPart.split(',').map(id => id.trim()).filter(id => id)
            const filteredRecordIds = recordIds.filter(id => id !== dataId)
            
            if (filteredRecordIds.length !== recordIds.length) {
              dataSModified = true
              debugLogger.log('HASH', {
                event: 'data_s-record-removed',
                widgetId,
                removedRecordId: dataId,
                originalRecordCount: recordIds.length,
                newRecordCount: filteredRecordIds.length,
                dsIdPart,
                timestamp: Date.now()
              })
              
              // If no records remain, return empty string (will be filtered out)
              if (filteredRecordIds.length === 0) {
                return ''
              }
              
              // Reconstruct the selection with updated record IDs
              return `id:${dsIdPart}:${filteredRecordIds.join(',')}`
            }
          }
          
          return selection
        }).filter(s => s) // Remove empty strings
        
        if (dataSModified) {
          if (updatedSelections.length > 0) {
            urlParams.set('data_s', encodeURIComponent(updatedSelections.join(',')))
          } else {
            // No selections remain, remove data_s entirely
            urlParams.delete('data_s')
          }
          hashModified = true
          
          debugLogger.log('HASH', {
            event: 'data_s-surgically-modified',
            widgetId,
            removedRecordId: dataId,
            originalSelectionCount: selections.length,
            newSelectionCount: updatedSelections.length,
            timestamp: Date.now()
          })
        }
      }
    }

    if (hashModified) {
      // Update hash surgically
      const newHash = urlParams.toString()
      window.history.replaceState(null, '', `#${newHash}`)

      debugLogger.log('HASH', {
        event: 'hash-surgically-modified-id-removed',
        widgetId,
        removedRecordId: dataId,
        originalHash: hash,
        newHash: newHash,
        timestamp: Date.now()
      })
    }

    // FIX (r018.96): Removed manual removal tracking - no longer needed
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-updating-accumulated-records',
      widgetId,
      removedRecordId: dataId,
      note: 'r018.96: No manual removal tracking - duplicate detection handles this',
      timestamp: Date.now()
    })

    // r021.93: Capture queryConfigId BEFORE cleanup (needed for composite key matching)
    const capturedQueryConfigId = data.feature?.attributes?.__queryConfigId || ''
    
    // DIAGNOSTIC (r022.31): Cross-layer removal detection
    const currentQueryOriginDS = (outputDS as FeatureLayerDataSource)?.getOriginDataSources?.()?.[0] as FeatureLayerDataSource || outputDS as FeatureLayerDataSource
    const recordOriginDS = data.dataSource?.getRootDataSource() || data.dataSource
    
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-origin-ds-detection',
      widgetId,
      removedRecordId: dataId,
      recordQueryConfigId: capturedQueryConfigId || 'MISSING',
      currentQueryConfigId: queryItem.configId,
      isCrossLayerRemoval: !!capturedQueryConfigId && capturedQueryConfigId !== queryItem.configId,
      recordOriginDSId: recordOriginDS?.id || 'unknown',
      recordOriginDSLabel: recordOriginDS?.getLabel?.() || 'unknown',
      currentQueryOriginDSId: currentQueryOriginDS?.id || 'unknown',
      currentQueryOriginDSLabel: currentQueryOriginDS?.getLabel?.() || 'unknown',
      isCrossOriginDSRemoval: recordOriginDS?.id !== currentQueryOriginDS?.id,
      accumulatedRecordsLayerCount: new Set(props.records?.map(r => (r as FeatureDataRecord).dataSource?.getRootDataSource()?.id)).size,
      allAccumulatedLayers: [...new Set(props.records?.map(r => (r as FeatureDataRecord).dataSource?.getRootDataSource()?.id))],
      timestamp: Date.now()
    })
    
    // r021.93: DELAY cleanup until AFTER graphics removal (so removeHighlightGraphics can use it)
    
    // FIX (r018.94): Removed removedRecordIds tracking - queryData now updated directly
    // Update queryData to filter out the removed record
    // r021.92: Check both recordId AND queryConfigId for accurate matching
    setQueryData(prevData => {
      if (!prevData) return prevData
      const filteredRecords = prevData.records.filter((record: DataRecord) => {
        const recordId = record.getId()
        const recordQueryConfigId = (record as FeatureDataRecord).feature?.attributes?.__queryConfigId || ''
        // Only remove if BOTH ID and queryConfigId match
        return !(recordId === dataId && recordQueryConfigId === capturedQueryConfigId)
      })
      
      debugLogger.log('RESULTS-MODE', {
        event: 'queryData-updated-after-removal',
        widgetId,
        removedRecordId: dataId,
        recordsCountBefore: prevData.records.length,
        recordsCountAfter: filteredRecords.length,
        timestamp: Date.now()
      })
      
      // FIX (r018.94): Check if this was the last record - if so, navigate back
      if (filteredRecords.length === 0 && prevData.records.length > 0) {
        debugLogger.log('RESULTS-MODE', {
          event: 'last-record-removed-navigating-back',
          widgetId,
          removedRecordId: dataId,
          timestamp: Date.now()
        })
        
        // r021.87: No cleanup needed - queryConfigId removed from individual record attributes
        // Note: currentQueryRecordIds is managed by parent, not cleaned here
        
        // Use setTimeout to avoid setState during render
        setTimeout(() => onNavBack(true), 0)
      }
      
      return {
        ...prevData,
        records: filteredRecords
      }
    })
    
    // FIX (r018.85): DIAGNOSTIC - Graphics count BEFORE removeRecordsFromOriginSelections
    const graphicsCountBeforeOriginRemoval = graphicsLayer?.graphics?.length || 0
    const graphicsIdsBeforeOriginRemoval = graphicsLayer?.graphics?.map(g => g.attributes?.recordId).slice(0, 10) || []
    
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-BEFORE-removeRecordsFromOriginSelections',
      widgetId,
      removedRecordId: dataId,
      graphicsCountBefore: graphicsCountBeforeOriginRemoval,
      graphicsIdsBefore: graphicsIdsBeforeOriginRemoval,
      willPassGraphicsLayer: false, // FIX: Changed to false to prevent graphics manipulation here
      timestamp: Date.now()
    })
    
    // ALWAYS remove from origin data source selections (same as Remove mode)
    // This properly removes records from the map selection, handling single or multiple origin sources
    // FIX (r018.85): DON'T pass graphics layer parameters here - let graphics be managed by selection sync
    // The previous behavior (passing graphicsLayer) was causing the count to jump from 124 to 136
    // because graphics were being removed here, then re-added during selection synchronization
    // r022.73: Pass accumulated records so removal can look up __queryConfigId for composite keys
    removeRecordsFromOriginSelections(
      widgetId, 
      [data], 
      outputDS as FeatureLayerDataSource,
      undefined, // useGraphicsLayer
      undefined, // graphicsLayer
      accumulatedRecords // r022.73: Pass for queryConfigId lookup
    )
    
    // FIX (r018.85): DIAGNOSTIC - Graphics count AFTER removeRecordsFromOriginSelections
    const graphicsCountAfterOriginRemoval = graphicsLayer?.graphics?.length || 0
    const graphicsIdsAfterOriginRemoval = graphicsLayer?.graphics?.map(g => g.attributes?.recordId).slice(0, 10) || []
    
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-AFTER-removeRecordsFromOriginSelections',
      widgetId,
      removedRecordId: dataId,
      graphicsCountBefore: graphicsCountBeforeOriginRemoval,
      graphicsCountAfter: graphicsCountAfterOriginRemoval,
      graphicsIdsAfter: graphicsIdsAfterOriginRemoval,
      graphicsChanged: graphicsCountAfterOriginRemoval !== graphicsCountBeforeOriginRemoval,
      graphicsChangedBy: graphicsCountAfterOriginRemoval - graphicsCountBeforeOriginRemoval,
      expected: 'Graphics should NOT change here (no graphics layer params passed)',
      timestamp: Date.now()
    })
    
    // DIAGNOSTIC (r022.31): Aggregate selection state across all layers after removal
    // Use setTimeout to allow all DS updates to complete
    setTimeout(() => {
      const layerSelectionStates: Record<string, any> = {}
      
      // Get unique origin DSs from all accumulated records
      const uniqueOriginDSIds = new Set(
        props.records?.map(r => (r as FeatureDataRecord).dataSource?.getRootDataSource()?.id).filter(Boolean)
      )
      
      uniqueOriginDSIds.forEach(dsId => {
        try {
          const ds = (window as any).jimuConfig?.appConfig?.dataSources?.[dsId]
          if (ds && typeof ds.getSelectedRecords === 'function') {
            const selected = ds.getSelectedRecords() || []
            const selectedIds = ds.getSelectedRecordIds() || []
            layerSelectionStates[dsId] = {
              label: ds.getLabel?.() || 'unknown',
              count: selected.length,
              ids: selectedIds.slice(0, 10)
            }
          }
        } catch (err) {
          layerSelectionStates[dsId] = { error: err.message }
        }
      })
      
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removal-aggregate-selection-state',
        widgetId,
        removedRecordId: dataId,
        timing: 'after-removal-100ms',
        accumulatedRecordsCount: props.records?.length || 0,
        uniqueLayersInAccumulated: uniqueOriginDSIds.size,
        layerSelectionStates,
        outputDSId: outputDS?.id,
        outputDSSelectedCount: outputDS?.getSelectedRecords()?.length || 0,
        graphicsLayerCount: graphicsCountAfterOriginRemoval,
        expectedLayerWithRemoval: data.dataSource?.getRootDataSource()?.id || 'unknown',
        note: 'Checking if selection was cleared in correct origin layer',
        timestamp: Date.now()
      })
    }, 100)
    
    // FIX (r018.91): DIAGNOSTIC - Check why manual graphics removal condition isn't met
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-checking-manual-graphics-removal-condition',
      widgetId,
      removedRecordId: dataId,
      hasGraphicsLayer: !!graphicsLayer,
      graphicsLayerId: graphicsLayer?.id,
      graphicsLayerGraphicsCount: graphicsLayer?.graphics?.length || 0,
      conditionWillPass: !!graphicsLayer,
      timestamp: Date.now()
    })
    
    // FIX (r018.90): Manually remove graphics from layer after removeRecordsFromOriginSelections
    // Since we don't pass graphics layer params to removeRecordsFromOriginSelections (to avoid 
    // the 136 duplicate issue), we need to manually remove the graphic here
    // This is safe now because r018.89 fixed the query switch re-selection issue
    // r021.91: Pass data record for composite key matching
    if (graphicsLayer) {
      const graphicsCountBeforeManualRemoval = graphicsLayer.graphics.length
      
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removal-manual-graphics-sync-start',
        widgetId,
        removedRecordId: dataId,
        graphicsCountBefore: graphicsCountBeforeManualRemoval,
        timestamp: Date.now()
      })
      
      removeHighlightGraphics(graphicsLayer, [dataId], [data])
      
      const graphicsCountAfterManualRemoval = graphicsLayer.graphics.length
      
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removal-manual-graphics-sync-complete',
        widgetId,
        removedRecordId: dataId,
        graphicsCountBefore: graphicsCountBeforeManualRemoval,
        graphicsCountAfter: graphicsCountAfterManualRemoval,
        graphicsRemoved: graphicsCountBeforeManualRemoval - graphicsCountAfterManualRemoval,
        expectedRemoved: 1,
        removalMatches: (graphicsCountBeforeManualRemoval - graphicsCountAfterManualRemoval) === 1,
        timestamp: Date.now()
      })
    } else {
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removal-manual-graphics-removal-SKIPPED',
        widgetId,
        removedRecordId: dataId,
        reason: 'graphicsLayer is null/undefined',
        hasGraphicsLayer: false,
        timestamp: Date.now()
      })
    }

    // r021.93: NOW cleanup queryConfigId from record (AFTER graphics removal used it)
    if (data.feature?.attributes?.__queryConfigId) {
      delete data.feature.attributes.__queryConfigId
      debugLogger.log('RESULTS-MODE', {
        event: 'queryConfigId-cleaned-up-on-remove',
        widgetId,
        removedRecordId: dataId,
        capturedQueryConfigId: capturedQueryConfigId,
        cleanedAfterGraphicsRemoval: true,
        timestamp: Date.now()
      })
    }
    
    // DIAGNOSTIC LOGGING: Full state BEFORE removal
    const outputDSSelectedBefore = outputDS.getSelectedRecords() as FeatureDataRecord[] || []
    const outputDSSelectedIdsBefore = outputDSSelectedBefore.map(r => r.getId())
    const accumulatedRecordsIdsBefore = accumulatedRecords?.map(r => r.getId()) || []
    
    // FIX (r018.81): Detailed graphics attribute inspection to understand why IDs are null
    const graphicsLayerIdsBefore: (string | null)[] = []
    const firstFewGraphicsAttrs: any[] = []
    graphicsLayer?.graphics?.forEach((g, index) => {
      if (index < 3) {
        // Log first 3 graphics' full attributes for diagnosis
        firstFewGraphicsAttrs.push({
          index,
          hasAttributes: !!g.attributes,
          attributes: g.attributes,
          attributeKeys: g.attributes ? Object.keys(g.attributes) : []
        })
      }
      graphicsLayerIdsBefore.push(g.attributes?.recordId || null)
    })
    
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-before-state',
      widgetId,
      removedRecordId: dataId,
      outputDSSelectedCount: outputDSSelectedBefore.length,
      outputDSSelectedIds: outputDSSelectedIdsBefore,
      accumulatedRecordsCount: accumulatedRecords?.length || 0,
      accumulatedRecordsIds: accumulatedRecordsIdsBefore,
      graphicsLayerCount: graphicsLayer?.graphics?.length || 0,
      graphicsLayerIds: graphicsLayerIdsBefore.slice(0, 110),
      firstFewGraphicsAttrs, // NEW: inspect what attributes are actually there
      allSourcesMatch: outputDSSelectedIdsBefore.length === accumulatedRecordsIdsBefore.length && 
                       outputDSSelectedIdsBefore.length === graphicsLayerIdsBefore.length &&
                       JSON.stringify(outputDSSelectedIdsBefore.sort()) === JSON.stringify(accumulatedRecordsIdsBefore.sort()),
      timestamp: Date.now()
    })
    
    // Update outputDS selection
    // r021.92: Check both recordId AND queryConfigId for accurate matching
    // r021.94: Use capturedQueryConfigId (already captured above) for consistency
    const selectedDatas = outputDS.getSelectedRecords() ?? []
    const updatedSelectedDatas = selectedDatas.filter(record => {
      const recordId = record.getId()
      const recordQueryConfigId = (record as FeatureDataRecord).feature?.attributes?.__queryConfigId || ''
      // Only remove if BOTH ID and queryConfigId match
      return !(recordId === dataId && recordQueryConfigId === capturedQueryConfigId)
    })
    const recordIds = updatedSelectedDatas.map(record => record.getId())
    
    // DEBUG: Log state after removal
    debugLogger.log('RESULTS-MODE', {
      event: 'removeRecord-state-after-removal',
      widgetId,
      removedRecordId: dataId,
      outputDSSelectedBeforeRemoval: selectedDatas.length,
      outputDSSelectedAfterRemoval: updatedSelectedDatas.length,
      recordsPropCount: records?.length || 0,
      queryDataRecordsCount: queryData?.records?.length || 0,
      accumulatedRecordsCount: accumulatedRecords?.length || 0,
      resultsMode,
      note: 'r018.94: Records stay in sync - no removedRecordIds tracking',
      timestamp: Date.now()
    })
    
    // Update outputDS selection
    if (typeof outputDS.selectRecordsByIds === 'function') {
      outputDS.selectRecordsByIds(recordIds, updatedSelectedDatas as FeatureDataRecord[])
    }
    
    // IMPORTANT: Publish custom event so widget can update state
    // This ensures restoration restores the correct (updated) count
    // r021.110: lastSelection removed, now only updates accumulatedRecords
    const originDS = (outputDS as FeatureLayerDataSource).getOriginDataSources()?.[0] as FeatureLayerDataSource
    const dataSourceId = originDS?.id
    const selectionEvent = new CustomEvent('querysimple-selection-changed', {
      detail: {
        widgetId,
        recordIds, // Updated record IDs (with removed record excluded)
        dataSourceId,
        outputDsId: outputDS.id,
        queryItemConfigId: queryItem.configId
      },
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(selectionEvent)
    
    // DIAGNOSTIC LOGGING: Full state AFTER removal (before sync)
    const outputDSSelectedAfter = outputDS.getSelectedRecords() as FeatureDataRecord[] || []
    const outputDSSelectedIdsAfter = outputDSSelectedAfter.map(r => r.getId())
    
    // FIX (r018.81): Detailed graphics attribute inspection to understand why IDs are null
    const graphicsLayerIdsAfter: (string | null)[] = []
    const firstFewGraphicsAttrsAfter: any[] = []
    graphicsLayer?.graphics?.forEach((g, index) => {
      if (index < 3) {
        // Log first 3 graphics' full attributes for diagnosis
        firstFewGraphicsAttrsAfter.push({
          index,
          hasAttributes: !!g.attributes,
          attributes: g.attributes,
          attributeKeys: g.attributes ? Object.keys(g.attributes) : []
        })
      }
      graphicsLayerIdsAfter.push(g.attributes?.recordId || null)
    })
    
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-after-state-before-sync',
      widgetId,
      removedRecordId: dataId,
      outputDSSelectedCount: outputDSSelectedAfter.length,
      outputDSSelectedIds: outputDSSelectedIdsAfter,
      graphicsLayerCount: graphicsLayer?.graphics?.length || 0,
      graphicsLayerIds: graphicsLayerIdsAfter.slice(0, 110),
      firstFewGraphicsAttrsAfter, // NEW: inspect what attributes are actually there
      removedFromOutputDS: outputDSSelectedIdsAfter.length < outputDSSelectedIdsBefore.length,
      removedFromGraphics: graphicsLayerIdsAfter.length < graphicsLayerIdsBefore.length,
      timestamp: Date.now()
    })
    
    // FIX (r021.97): Direct filter of accumulatedRecords - no outputDS read
    // The previous approach (r018.97) read from outputDS.getSelectedRecords() after selectRecordsByIds(),
    // but selectRecordsByIds() is async, so getSelectedRecords() returned stale data (race condition).
    // This caused the two-click removal bug: first click updated queryData correctly, but stale
    // accumulatedRecords caused the useEffect to overwrite queryData back to the old count.
    // FIX: Directly filter accumulatedRecords by the known record being removed - no async dependency.
    if (onAccumulatedRecordsChange && accumulatedRecords && accumulatedRecords.length > 0) {
      // Direct filter: remove the specific record we know is being deleted
      // r021.97: Use flexible matching - composite key when both have queryConfigId, otherwise just recordId
      // In New mode, __queryConfigId may not be consistently set on accumulatedRecords vs the clicked record
      const syncedRecords = accumulatedRecords.filter(record => {
        const recordId = record.getId()
        if (recordId !== dataId) {
          return true // Keep - different record ID
        }
        // Record IDs match - check if we need composite key matching
        const recordQueryConfigId = record.feature?.attributes?.__queryConfigId || ''
        // If BOTH have queryConfigId values, require both to match (accumulation mode safety)
        // If EITHER is empty, just matching recordId is sufficient (New mode compatibility)
        if (capturedQueryConfigId && recordQueryConfigId) {
          return recordQueryConfigId !== capturedQueryConfigId // Keep if queryConfigIds differ
        }
        return false // Remove - recordIds match and no queryConfigId disambiguation needed
      })
      
      // Update accumulatedRecords with the filtered result
      onAccumulatedRecordsChange(syncedRecords)
    }
    
    // FIX (r018.96): Removed manual modification flag - no longer needed
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-complete',
      widgetId,
      removedRecordId: dataId,
      note: 'r018.96: No manual removal tracking needed',
      timestamp: Date.now()
    })
    
    // FIX (r018.85): FINAL DIAGNOSTIC - Graphics count after entire removal flow
    // This happens AFTER all sync logic, so we can see the final state
    setTimeout(() => {
      const finalGraphicsCount = graphicsLayer?.graphics?.length || 0
      const finalGraphicsIds = graphicsLayer?.graphics?.map(g => g.attributes?.recordId) || []
      const finalGraphicsIdsSample = finalGraphicsIds.slice(0, 10)
      
      // Count duplicates in final graphics
      const graphicsIdCounts = new Map<string, number>()
      finalGraphicsIds.forEach(id => {
        if (id) {
          graphicsIdCounts.set(id, (graphicsIdCounts.get(id) || 0) + 1)
        }
      })
      const duplicateIds = Array.from(graphicsIdCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([id, count]) => ({ id, count }))
      
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removal-FINAL-graphics-state',
        widgetId,
        removedRecordId: dataId,
        graphicsCountBeforeEntireFlow: graphicsCountBeforeOriginRemoval,
        graphicsCountAfterEntireFlow: finalGraphicsCount,
        graphicsIdsSample: finalGraphicsIdsSample,
        graphicsChanged: finalGraphicsCount !== graphicsCountBeforeOriginRemoval,
        graphicsChangedBy: finalGraphicsCount - graphicsCountBeforeOriginRemoval,
        expectedChange: -1, // Should remove 1 graphic
        actualChange: finalGraphicsCount - graphicsCountBeforeOriginRemoval,
        changeMatches: (finalGraphicsCount - graphicsCountBeforeOriginRemoval) === -1,
        duplicateGraphicsDetected: duplicateIds.length > 0,
        duplicateGraphics: duplicateIds.slice(0, 5),
        totalDuplicates: duplicateIds.reduce((sum, { count }) => sum + (count - 1), 0),
        note: 'Final state after all removal and sync logic completes',
        timestamp: Date.now()
      })
    }, 100) // Small delay to ensure all async operations complete

    // Note: Hash parameters are preserved but hash-triggered queries are blocked
    // when manual modifications exist (handled in widget's handleOpenWidgetEvent)

    // Log after removeRecord completes to check if expandAll changed
    setTimeout(() => {
      debugLogger.log('RESULTS-MODE', {
        event: 'removeRecord-completed',
        widgetId,
        removedRecordId: dataId,
        expandAllBefore: currentExpandAll,
        expandAllAfter: expandAll,
        expandAllChanged: currentExpandAll !== expandAll,
        expandByDefaultProp: expandAll, // What will be passed to SimpleList
        timestamp: Date.now()
      })
    }, 0)
  }, [outputDS, widgetId, resultCount, onNavBack, resultsMode, accumulatedRecords, onAccumulatedRecordsChange, queryItem.configId, expandAll])

  return (
    <div className='query-result h-100' css={resultStyle} role='listbox' aria-label={getI18nMessage('results')}>
      <DataSourceComponent useDataSource={resultUseOutputDataSource} onDataSourceInfoChange={handleDataSourceInfoChange} />
      
      {/* Error Message */}
      {selectionError && (
        <div css={css`padding: 0 16px; margin-top: 8px;`}>
          <ErrorMessage 
            error={selectionError} 
            onDismiss={() => setSelectionError(null)}
          />
        </div>
      )}
      
      <div className='query-result__header d-flex align-items-center mx-4'>
        <Button aria-label={getI18nMessage('back')} ref={backBtnRef} className='p-0 mr-2' size='sm' variant='text' color='inherit' icon onClick={() => { onNavBack() }}>
          <ArrowLeftOutlined autoFlip/>
        </Button>
        {currentItem.resultsLabel ?? getI18nMessage('results')}
        {(
          <React.Fragment>
            <Tooltip title={getI18nMessage('clearResult')} placement='bottom'>
              <Button className='ml-auto' icon size='sm' variant='text' color='inherit' onClick={clearResults} aria-label={getI18nMessage('clearResult')}>
                <Icon icon={iconMap.toolDelete} />
              </Button>
            </Tooltip>
            {/* Data actions filtered via manifest.json excludeDataActions - Show on Map, Select Loaded, and Clear Selection are excluded.
                Custom "Add to Map" action is provided via extraActions and uses QuerySimple's selection process. */}
            {enableDataAction && outputDS && (
              <React.Fragment>
                <div css={css`width: 1px; height: 16px; background-color: var(--sys-color-divider-input);`}></div>
                <DataActionList
                  widgetId={widgetId}
                  dataSets={actionDataSets}
                  listStyle={DataActionListStyle.Dropdown}
                  buttonSize='sm'
                  buttonType='tertiary'
                  extraActions={extraActions}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </div>
      <div className='query-result-container mt-1'>
        <div className='query-result-info mb-2 px-4 d-flex align-items-center justify-content-between' role='alert' aria-live='polite'>
          <span>{getTipMessage()}</span>
          <div className='d-flex align-items-center'>
            <Tooltip title={expandAll ? getI18nMessage('collapseAll') : getI18nMessage('expandAll')} placement='top'>
              <Button
                size='sm'
                type='tertiary'
                icon
                onClick={toggleExpandAll}
                aria-label={expandAll ? getI18nMessage('collapseAll') : getI18nMessage('expandAll')}
              >
                {expandAll ? <CollapseAllOutlined /> : <ExpandAllOutlined />}
              </Button>
            </Tooltip>
          </div>
        </div>
        {/* r021.87: SimpleList reads queryConfigId from record attributes */}
        {resultCount > 0 && (
          <SimpleList
            key='simple'
            widgetId={widgetId}
            queryItem={queryItem}
            outputDS={outputDS as any}
            records={filteredRecordsForList}
            direction={direction}
            onEscape={handleEscape}
            onSelectChange={toggleSelection}
            onRemove={removeRecord}
            expandByDefault={expandAll}
            queries={queries}
          />
        )}
      </div>
      
      {/* r022.15: Anchor for Remove-mode no-removal popover */}
      <div 
        id="remove-feedback-anchor"
        css={css`
          height: 1px;
          width: 100%;
          position: relative;
          padding: 0;
          pointer-events: none;
        `}
      />
      
      {/* r022.15: Calcite Popover for Remove mode feedback (query found records but none matched) */}
      {noRemovalAlert?.show && (
        <calcite-popover 
          key={`no-removal-${noRemovalAlert.timestamp}`}
          referenceElement="remove-feedback-anchor"
          placement="top"
          flipDisabled={true}
          overlayPositioning="fixed"
          triggerDisabled={true}
          autoClose
          closable
          label={getI18nMessage('noRemovalAlertLabel')}
          open={noRemovalAlert.show}
          onCalcitePopoverClose={() => {
            if (onDismissNoRemovalAlert) {
              onDismissNoRemovalAlert()
            }
          }}
          style={{
            '--calcite-popover-max-size-x': '320px',
            maxWidth: '320px',
            width: '100%',
            '--calcite-color-foreground-1': 'lightyellow'
          } as React.CSSProperties}
        >
          <div style={{ padding: '12px', maxWidth: '320px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: '#151515' }}>
              {getI18nMessage('noRemovalAlertTitle')}
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#2b2b2b' }}>
              {getI18nMessage('noRemovalAlertMessage', { recordsFound: noRemovalAlert.recordsFound })}
            </div>
          </div>
        </calcite-popover>
      )}
      
      {/* r022.21: Calcite Popover for Add mode feedback (all records are duplicates) */}
      {allDuplicatesAlert?.show && (
        <calcite-popover 
          key={`all-duplicates-${allDuplicatesAlert.timestamp}`}
          referenceElement="remove-feedback-anchor"
          placement="top"
          flipDisabled={true}
          overlayPositioning="fixed"
          triggerDisabled={true}
          autoClose
          closable
          label={getI18nMessage('allDuplicatesAlertLabel')}
          open={allDuplicatesAlert.show}
          onCalcitePopoverClose={() => {
            if (onDismissAllDuplicatesAlert) {
              onDismissAllDuplicatesAlert()
            }
          }}
          style={{
            '--calcite-popover-max-size-x': '320px',
            maxWidth: '320px',
            width: '100%',
            '--calcite-color-foreground-1': 'lightyellow'
          } as React.CSSProperties}
        >
          <div style={{ padding: '12px', maxWidth: '320px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: '#151515' }}>
              {getI18nMessage('allDuplicatesAlertTitle')}
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#2b2b2b' }}>
              {getI18nMessage('allDuplicatesAlertMessage', { recordsFound: allDuplicatesAlert.recordsFound })}
            </div>
          </div>
        </calcite-popover>
      )}
    </div>
  )
}
