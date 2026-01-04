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
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()
import { ErrorMessage } from 'widgets/shared-code/common'
const { iconMap } = getWidgetRuntimeDataMap()

/**
 * Custom event name for requesting restoration when identify popup closes.
 */
const RESTORE_ON_IDENTIFY_CLOSE_EVENT = 'querysimple-restore-on-identify-close'

/**
 * Detects if an identify popup is currently visible in the DOM.
 * Uses verified selectors based on Experience Builder's identify popup structure.
 * 
 * @returns true if identify popup is detected and visible, false otherwise
 */
function isIdentifyPopupOpen(): boolean {
  // Primary selector: .esri-popup with role="dialog"
  const popup = document.querySelector('.esri-popup[role="dialog"]')
  
  if (!popup) {
    return false
  }
  
  // Verify it's visible (not hidden)
  const ariaHidden = popup.getAttribute('aria-hidden')
  if (ariaHidden === 'true') {
    return false
  }
  
  // Additional check: verify computed style shows it's visible
  const style = window.getComputedStyle(popup)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }
  
  // Verify it contains esri-features (identify popup structure)
  const hasFeatures = popup.querySelector('.esri-features')
  if (!hasFeatures) {
    return false
  }
  
  return true
}

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
  useGraphicsLayerForHighlight?: boolean
  graphicsLayer?: __esri.GraphicsLayer
  mapView?: __esri.MapView | __esri.SceneView
  resultsMode?: SelectionType
  accumulatedRecords?: FeatureDataRecord[]
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
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
  const { queryItem, queryParams, resultCount, maxPerPage, records, widgetId, outputDS, runtimeZoomToSelected, onNavBack, resultsMode, accumulatedRecords, onAccumulatedRecordsChange, useGraphicsLayerForHighlight, graphicsLayer, mapView } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const intl = useIntl()
  const zoomToRecords = useZoomToRecords(mapView)
  const [queryData, setQueryData] = React.useState(null)
  const [selectedRecords, setSelectedRecords] = React.useState<DataRecord[]>([])
  const [removedRecordIds, setRemovedRecordIds] = React.useState<Set<string>>(new Set())
  
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const [expandAll, setExpandAll] = React.useState(currentItem.resultExpandByDefault ?? false)
  // Track individual item expansion states to maintain state when items are removed
  const [itemExpandStates, setItemExpandStates] = React.useState<Map<string, boolean>>(new Map())
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
  // Ref to track removedRecordIds for use in callbacks (avoids stale closure issues)
  const removedRecordIdsRef = React.useRef<Set<string>>(new Set())
  
  // Sync ref whenever removedRecordIds state changes
  React.useEffect(() => {
    removedRecordIdsRef.current = removedRecordIds
  }, [removedRecordIds])
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

  // Memoize filtered records to prevent unnecessary re-renders that reset scroll position
  // This ensures the records prop only changes when the actual data changes, not just the array reference
  const filteredRecordsForList = React.useMemo(() => {
    return queryData?.records?.filter((record: DataRecord) => !removedRecordIds.has(record.getId())) || 
           (records?.filter(record => !removedRecordIds.has(record.getId())) || [])
  }, [queryData?.records, records, removedRecordIds])

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
    
    // Debug: Log when records prop changes
    debugLogger.log('RESULTS-MODE', {
      event: 'records-prop-changed',
      widgetId: widgetId,
      recordsCount: records?.length || 0,
      willSetQueryData: records && records.length > 0,
      removedRecordIdsCount: removedRecordIds.size,
      hasSelectedRef: hasSelectedRef.current,
      recordsChanged: recordsChanged,
      lastQueryRecordIdsCount: lastQueryRecordIdsRef.current.length,
      currentRecordIdsCount: currentRecordIds.length
    })
    
    // IMPORTANT: Only reset removed records if this is truly a NEW query with different records
    // Don't reset if records are the same (just a re-render or lazy load)
    if (recordsChanged) {
      debugLogger.log('RESULTS-MODE', {
        event: 'records-truly-changed-resetting-removed',
        widgetId: widgetId,
        oldRecordIdsCount: lastQueryRecordIdsRef.current.length,
        newRecordIdsCount: currentRecordIds.length
      })
      setRemovedRecordIds(new Set())
      // Update the original query record IDs ref
      lastQueryRecordIdsRef.current = currentRecordIds
    } else {
      debugLogger.log('RESULTS-MODE', {
        event: 'records-not-changed-preserving-removed',
        widgetId: widgetId,
        recordIdsCount: currentRecordIds.length,
        removedRecordIdsCount: removedRecordIds.size
      })
    }
    
    // NOTE: Don't reset expandAll here - it's handled by the queryItem-change useEffect
    // Resetting it here causes the Expand/Collapse button to flip back when records are removed
    setQueryData({
      records,
      page: 1
    })
    
    // Only auto-select records if:
    // 1. We have records and outputDS
    // 2. We haven't already selected these records (hasSelectedRef is false)
    // 3. OR the records have actually changed (new query results)
    // 4. AND we don't have any removed records (to prevent re-selecting removed ones)
    if (records && records.length > 0 && outputDS && 
        (!hasSelectedRef.current || recordsChanged) && 
        removedRecordIds.size === 0) {
      const recordIds = records.map(record => record.getId())
      const fdr = records as FeatureDataRecord[]
      
      // Select records and publish selection message using utility function
      // Use async IIFE since useEffect can't be async
      ;(async () => {
        try {
          setSelectionError(null) // Clear previous errors
          await selectRecordsAndPublish(
            widgetId, 
            outputDS, 
            recordIds, 
            fdr, 
            false, 
            useGraphicsLayerForHighlight, 
            graphicsLayer, 
            mapView
          )
          hasSelectedRef.current = true // Mark as selected
          lastSelectedRecordsRef.current = recordIds // Store the IDs we selected
          lastSelectedFeatureRecordsRef.current = fdr // Store the full records for potential restoration
          
          // Notify Widget and HelperSimple of selection change
          dispatchSelectionEvent(widgetId, recordIds, outputDS, queryItem.configId)
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
    } else if (removedRecordIds.size > 0) {
      debugLogger.log('RESULTS-MODE', {
        event: 'skipping-reselection-due-to-removed-records',
        widgetId: widgetId,
        removedRecordIdsCount: removedRecordIds.size,
        recordsCount: records?.length || 0,
        hasSelectedRef: hasSelectedRef.current,
        recordsChanged: recordsChanged
      })
    }
  }, [records, outputDS, widgetId, queryItem.configId, queryItem.resultExpandByDefault, removedRecordIds])

  React.useEffect(() => {
    // clear selection when resultSelectMode changed
    if (outputDS) {
      clearSelectionInDataSources(outputDS, useGraphicsLayerForHighlight, graphicsLayer)
      publishSelectionMessage(widgetId, [], outputDS, true)
    }
  }, [queryItem.resultSelectMode, outputDS, widgetId, useGraphicsLayerForHighlight, graphicsLayer])

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
    // Reset individual expansion states when query changes
    setItemExpandStates(new Map())
  }, [queryItem.configId])

  /**
   * Monitor origin data source selection changes to detect when other widgets (like map identify)
   * clear our selections. Enhanced with identify popup detection for testing scenarios.
   * Watches the origin data source's selection state directly via polling.
   */
  React.useEffect(() => {
    if (!outputDS) return

    const originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource
    if (!originDS) return

    const originDSId = originDS.id
    let previousSelectedIds: string[] = []
    let identifyPopupWasOpen = false
    let lastLogTime = 0
    const LOG_THROTTLE_MS = 1000 // Throttle logs to once per second
    
    // Initial check
    previousSelectedIds = originDS.getSelectedRecordIds() || []
    identifyPopupWasOpen = isIdentifyPopupOpen()

    // Watch for selection changes on the origin data source
    const checkSelection = () => {
      const currentSelectedIds = originDS.getSelectedRecordIds() || []
      const ourExpectedIds = lastSelectedRecordsRef.current
      const hasOurSelection = ourExpectedIds.length > 0
      const identifyPopupIsOpen = isIdentifyPopupOpen()
      
      // Detect if selection was cleared or changed externally
      const wasCleared = previousSelectedIds.length > 0 && currentSelectedIds.length === 0
      const wasChanged = previousSelectedIds.length > 0 && 
        (currentSelectedIds.length !== previousSelectedIds.length ||
         !currentSelectedIds.every(id => previousSelectedIds.includes(id)))
      
      // NEW: Detect if selection was added (went from empty to having records)
      const wasAdded = previousSelectedIds.length === 0 && currentSelectedIds.length > 0
      
      // Track identify popup state changes
      const identifyPopupJustOpened = !identifyPopupWasOpen && identifyPopupIsOpen
      const identifyPopupJustClosed = identifyPopupWasOpen && !identifyPopupIsOpen
      const identifyPopupStillOpen = identifyPopupWasOpen && identifyPopupIsOpen
      
      // Log identify popup state changes
      const now = Date.now()
      if (identifyPopupJustOpened || identifyPopupJustClosed) {
        debugLogger.log('SELECTION', {
          event: identifyPopupJustOpened ? 'identify-popup-opened' : 'identify-popup-closed',
          originDSId,
          ourSelectionCount: ourExpectedIds.length,
          currentSelectionCount: currentSelectedIds.length,
          timestamp: new Date().toISOString()
        })
        
        // If identify popup just closed and selection was cleared, dispatch restore event
        if (identifyPopupJustClosed && wasCleared && hasOurSelection && ourExpectedIds.length > 0) {
          const restoreEvent = new CustomEvent(RESTORE_ON_IDENTIFY_CLOSE_EVENT, {
            detail: {
              widgetId,
              recordIds: ourExpectedIds,
              outputDsId: outputDS.id,
              queryItemConfigId: queryItem.configId
            },
            bubbles: true,
            cancelable: true
          })
          window.dispatchEvent(restoreEvent)
          
          debugLogger.log('SELECTION', {
            event: 'identify-popup-closed-restore-requested',
            widgetId,
            recordCount: ourExpectedIds.length,
            outputDsId: outputDS.id,
            queryItemConfigId: queryItem.configId
          })
        }
      }
      
      // Log ALL selection changes (not just when we have our own selection)
      if (wasCleared || wasChanged || wasAdded) {
        // Check if this matches our expected selection
        const matchesOurSelection = hasOurSelection && 
          ourExpectedIds.length === currentSelectedIds.length &&
          ourExpectedIds.every(id => currentSelectedIds.includes(id))
        
        // Determine what would happen (for testing/logging)
        const wouldRestore = wasCleared && identifyPopupIsOpen && hasOurSelection && ourExpectedIds.length > 0
        
        // Determine scenario
        let scenario = 'Unknown'
        if (wasAdded && !hasOurSelection) {
          scenario = 'TEST SCENARIO 4: Another widget selected records (we have no selection)'
        } else if (wasChanged && !matchesOurSelection && !hasOurSelection) {
          scenario = 'TEST SCENARIO 5: Another widget changed selection (we have no selection)'
        } else if (wasChanged && !matchesOurSelection && hasOurSelection) {
          scenario = identifyPopupIsOpen
            ? 'TEST SCENARIO 2: Query → Identify (selection changed, not cleared) → Would NOT restore'
            : 'TEST SCENARIO 3: Query → Another QuerySimple widget → Would NOT restore'
        } else if (wasCleared && hasOurSelection) {
          scenario = identifyPopupIsOpen
            ? 'TEST SCENARIO 1: Query → Identify → Would restore'
            : 'TEST SCENARIO 3: Query → Another QuerySimple widget (cleared) → Would NOT restore'
        } else if (wasAdded && hasOurSelection) {
          scenario = matchesOurSelection
            ? 'Our widget selected records'
            : 'Another widget selected different records'
        }
        
        // Log detection with identify popup state (throttled)
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
            identifyPopupIsOpen,
            identifyPopupJustOpened,
            identifyPopupStillOpen,
            identifyPopupJustClosed,
            wouldRestore,
            ourExpectedIds: ourExpectedIds.slice(0, 5),
            previousSelectedIds: previousSelectedIds.slice(0, 5),
            currentSelectedIds: currentSelectedIds.slice(0, 5),
            timestamp: new Date().toISOString(),
            note: wouldRestore 
              ? 'Would restore selection (cleared + identify popup open)'
              : identifyPopupIsOpen && wasChanged
                ? 'Identify popup open but selection changed (not cleared) - would not restore'
                : wasCleared && !identifyPopupIsOpen
                  ? 'Selection cleared, checking if identify popup opens...'
                  : wasAdded
                    ? hasOurSelection && matchesOurSelection
                      ? 'Our widget selected records'
                      : hasOurSelection && !matchesOurSelection
                        ? 'Another widget selected different records'
                        : 'Selection added (by another widget or external source)'
                    : 'No identify popup detected - would not restore'
          })
          
          lastLogTime = now
        }
      }
      
      previousSelectedIds = [...currentSelectedIds]
      identifyPopupWasOpen = identifyPopupIsOpen
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
    
    // Reset local selection flags
    hasSelectedRef.current = false
    lastSelectedRecordsRef.current = []
    // Reset local query data state
    setQueryData(null)
    setRemovedRecordIds(new Set())
    // Clear error state when clearing results
    setSelectionError(null)
    // Delegate to parent's clearResult method (via onNavBack) which handles
    // clearing selection from map, publishing messages, etc.
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

  const handleRenderDone = React.useCallback(({ dataItems, pageSize, page }) => {
    debugLogger.log('RESULTS-MODE', {
      event: 'handleRenderDone-called',
      widgetId,
      queryItemConfigId: queryItem.configId,
      dataItemsCount: dataItems?.length || 0,
      pageSize,
      page,
      timestamp: Date.now()
    })
    
    // Use ref to get latest removedRecordIds (avoids stale closure issues with lazy loading)
    const currentRemovedIds = removedRecordIdsRef.current
    
    // Filter out removed records FIRST - before any selection logic
    // This ensures removed records stay removed even during lazy loading
    const filteredItems = dataItems?.filter(item => !currentRemovedIds.has(item.getId())) || []
    
    // Check if queryData has actually changed before updating state
    // This prevents unnecessary re-renders that reset scroll position
    const currentRecords = queryData?.records || []
    const currentRecordIds = currentRecords.map(r => r.getId()).sort()
    const newRecordIds = filteredItems.map(r => r.getId()).sort()
    const dataChanged = currentRecordIds.length !== newRecordIds.length ||
      !currentRecordIds.every((id, idx) => id === newRecordIds[idx]) ||
      queryData?.pageSize !== pageSize ||
      queryData?.page !== page
    
    // Only update state if data has actually changed
    if (dataChanged) {
      setQueryData({
        records: filteredItems,
        pageSize,
        page
      })
    }
    
    // Only select records that are NOT removed
    // IMPORTANT: Only re-select if the selection has actually changed to avoid resetting scroll position
    if (filteredItems && filteredItems.length > 0 && outputDS) {
      const recordIds = filteredItems.map(record => record.getId())
      const fdr = filteredItems as FeatureDataRecord[]
      
      // Check what's currently selected to avoid unnecessary re-selection (which resets scroll)
      const currentlySelectedIds = outputDS.getSelectedRecordIds() || []
      const selectionChanged = currentlySelectedIds.length !== recordIds.length ||
        !recordIds.every(id => currentlySelectedIds.includes(id))
      
      // Only select if the selection has actually changed
      if (selectionChanged) {
        try {
          setSelectionError(null) // Clear previous errors
          selectRecordsAndPublish(widgetId, outputDS, recordIds, fdr)
          
          debugLogger.log('RESULTS-MODE', {
            event: 'handleRenderDone-selecting-filtered-records',
            widgetId: widgetId,
            dataItemsCount: dataItems?.length || 0,
            filteredItemsCount: filteredItems.length,
            removedRecordIdsCount: currentRemovedIds.size,
            selectionChanged: true,
            currentlySelectedCount: currentlySelectedIds.length,
            newSelectionCount: recordIds.length
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to select query results'
          setSelectionError(errorMessage)
          debugLogger.log('TASK', {
            event: 'selection-failed-handleRenderDone',
            error: errorMessage,
            errorStack: error instanceof Error ? error.stack : undefined,
            recordCount: recordIds.length
          })
        }
      } else {
        debugLogger.log('RESULTS-MODE', {
          event: 'handleRenderDone-skipping-reselection',
          widgetId: widgetId,
          dataItemsCount: dataItems?.length || 0,
          filteredItemsCount: filteredItems.length,
          removedRecordIdsCount: currentRemovedIds.size,
          reason: 'selection-unchanged',
          currentlySelectedCount: currentlySelectedIds.length
        })
      }
    }
  }, [outputDS, widgetId, queryData])

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
      removedRecordIdsCount: removedRecordIds.size,
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
    
    // IMPORTANT: Filter out removed records from DS selection before comparing/syncing
    // This prevents removed records from being re-added when scrolling triggers this callback
    const filteredDsRecords = dsRecords?.filter((record: DataRecord) => !removedRecordIds.has(record.getId())) ?? []
    const filteredSelectedIds = selectedIds.filter(id => !removedRecordIds.has(id))
    
    // If DS has more selected than our state, but the difference is entirely removed records, don't sync
    if (filteredSelectedIds.length === (selectedRecords?.length || 0) && selectedIds.length > filteredSelectedIds.length) {
      debugLogger.log('RESULTS-MODE', {
        event: 'handleDataSourceInfoChange-skipping-sync-due-to-removed-records',
        widgetId: widgetId,
        reason: 'ds-selection-includes-removed-records',
        dsSelectedCount: selectedIds.length,
        filteredCount: filteredSelectedIds.length,
        componentStateCount: selectedRecords?.length || 0,
        removedRecordIdsCount: removedRecordIds.size
      })
      return // Skip syncing - the mismatch is due to removed records
    }
    
    let shouldUpdate = false
    if (filteredSelectedIds.length !== selectedRecords?.length) {
      shouldUpdate = true
    } else { // equal length
      shouldUpdate = filteredSelectedIds.some(id => {
        const target = selectedRecords.find((item) => item.getId() === id)
        return target == null
      })
    }
    if (shouldUpdate) {
      debugLogger.log('RESULTS-MODE', {
        event: 'handleDataSourceInfoChange-updating-selectedRecords',
        widgetId: widgetId,
        oldCount: selectedRecords?.length || 0,
        newCount: filteredDsRecords.length,
        note: 'filtered-out-removed-records'
      })
      debugLogger.log('RESULTS-MODE', {
        event: 'handleDataSourceInfoChange-updating-selectedRecords',
        widgetId: widgetId,
        oldCount: selectedRecords?.length || 0,
        newCount: filteredDsRecords.length,
        oldSelectedIds: (selectedRecords || []).map(r => r.getId()).slice(0, 5),
        newSelectedIds: filteredSelectedIds.slice(0, 5),
        note: 'filtered-out-removed-records',
        timestamp: Date.now()
      })
      setSelectedRecords(filteredDsRecords)
    } else {
      debugLogger.log('RESULTS-MODE', {
        event: 'handleDataSourceInfoChange-skipping-update',
        widgetId: widgetId,
        reason: 'no-change-detected',
        timestamp: Date.now()
      })
    }
  }, [outputDS?.id, selectedRecords, widgetId, records, removedRecordIds])

  /**
   * Generates the tip message showing how many features are displayed.
   * Filters out removed records to show accurate counts.
   * 
   * @returns Formatted string like "Features displayed: 118 / 121"
   */
  const getTipMessage = () => {
    if (queryData && queryData.records) {
      // Filter out removed records for display count
      const displayedRecords = queryData.records.filter((record: DataRecord) => !removedRecordIds.has(record.getId()))
      const displayedCount = displayedRecords.length
      
      // FORCED: Always SimpleList, so always use simple display format
      return `${getI18nMessage('featuresDisplayed')}: ${displayedCount} / ${resultCount}`
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
        timestamp: Date.now()
      })
      
      // Update all current items in the map with the new expansion state
      setItemExpandStates(prevMap => {
        const newMap = new Map(prevMap)
        // Get all current record IDs from filtered records
        const allRecordIds = filteredRecordsForList.map(r => r.getId())
        allRecordIds.forEach(id => {
          newMap.set(id, newValue)
        })
        debugLogger.log('EXPAND-COLLAPSE', {
          event: 'itemExpandStates-updated',
          widgetId,
          newValue,
          updatedCount: allRecordIds.length,
          recordIds: allRecordIds.slice(0, 10), // Log first 10 IDs
          timestamp: Date.now()
        })
        return newMap
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
      selectRecordsAndPublish(widgetId, outputDS, recordIds, updatedSelectedDatas as FeatureDataRecord[], true)
    }
    
    // Zoom to the clicked record with padding (always enabled - user wants to keep this behavior)
    // BUG-GRAPHICS-001: Zoom operations fail when graphics layer is disabled
    if (!mapView && !useGraphicsLayerForHighlight) {
      debugLogger.log('BUG', {
        bugId: 'BUG-GRAPHICS-001',
        category: 'GRAPHICS',
        event: 'zoom-operation-failed-graphics-layer-disabled',
        widgetId,
        operation: 'result-item-click-zoom',
        recordId: data.getId(),
        description: 'Zoom operation attempted on result item click but mapView is unavailable because useGraphicsLayerForHighlight is disabled',
        workaround: 'Enable useGraphicsLayerForHighlight in widget settings',
        targetResolution: 'r019.0'
      })
    }
    
    zoomToRecords([data]).catch(error => {
      // Silently handle errors - zoom is non-critical
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
    
    // Remove from expansion states map
    setItemExpandStates(prevMap => {
      const newMap = new Map(prevMap)
      newMap.delete(dataId)
      debugLogger.log('EXPAND-COLLAPSE', {
        event: 'itemExpandStates-cleaned-up',
        widgetId,
        removedRecordId: dataId,
        remainingCount: newMap.size,
        timestamp: Date.now()
      })
      return newMap
    })
    
    // Add to removed records set
    setRemovedRecordIds(prev => {
      const newSet = new Set(prev).add(dataId)
      
      // If all records are now removed, clear everything by calling trash can logic
      // IMPORTANT: Compare against actual displayed records count, not resultCount
      // resultCount only reflects the latest query, but in "Add to" mode we display accumulated records
      // Use queryData.records.length (before filtering) as the source of truth for displayed records
      // Fall back to accumulatedRecords.length if in accumulation mode, or resultCount as last resort
      let currentDisplayedCount = queryData?.records?.length || 0
      if (currentDisplayedCount === 0) {
        // If queryData doesn't have records yet, check if we're in accumulation mode
        const isAccumulationMode = resultsMode === SelectionType.AddToSelection || 
                                   resultsMode === SelectionType.RemoveFromSelection
        if (isAccumulationMode && accumulatedRecords && accumulatedRecords.length > 0) {
          currentDisplayedCount = accumulatedRecords.length
        } else {
          // Last resort: use resultCount (but this might be incorrect in accumulation mode)
          currentDisplayedCount = resultCount
        }
      }
      
      debugLogger.log('RESULTS-MODE', {
        event: 'removeRecord-checking-all-removed',
        widgetId,
        removedRecordIdsSize: newSet.size,
        currentDisplayedCount,
        resultCount,
        queryDataRecordsCount: queryData?.records?.length || 0,
        accumulatedRecordsCount: accumulatedRecords?.length || 0,
        resultsMode,
        willNavigateBack: newSet.size === currentDisplayedCount && currentDisplayedCount > 0,
        timestamp: Date.now()
      })
      
      if (newSet.size === currentDisplayedCount && currentDisplayedCount > 0) {
        // All displayed records removed - clear everything (same as clicking trash can button)
        onNavBack(true)
        return newSet
      }
      
      return newSet
    })
    
    // Update queryData to filter out the removed record
    setQueryData(prevData => {
      if (!prevData) return prevData
      const filteredRecords = prevData.records.filter((record: DataRecord) => record.getId() !== dataId)
      return {
        ...prevData,
        records: filteredRecords
      }
    })
    
    // ALWAYS remove from origin data source selections (same as Remove mode)
    // This properly removes records from the map selection, handling single or multiple origin sources
    // Also removes graphics from graphics layer if using graphics layer highlighting
    removeRecordsFromOriginSelections(
      widgetId, 
      [data], 
      outputDS as FeatureLayerDataSource,
      useGraphicsLayerForHighlight,
      graphicsLayer
    )
    
    // Update outputDS selection
    const selectedDatas = outputDS.getSelectedRecords() ?? []
    const updatedSelectedDatas = selectedDatas.filter(record => record.getId() !== dataId)
    const recordIds = updatedSelectedDatas.map(record => record.getId())
    
    // Update outputDS selection
    if (typeof outputDS.selectRecordsByIds === 'function') {
      outputDS.selectRecordsByIds(recordIds, updatedSelectedDatas as FeatureDataRecord[])
    }
    
    // IMPORTANT: Publish custom event so widget can update lastSelection state
    // This ensures restoration restores the correct (updated) count
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
    
    // If in accumulation mode, also remove from accumulated records
    const isAccumulationMode = resultsMode === SelectionType.AddToSelection || 
                               resultsMode === SelectionType.RemoveFromSelection
    if (isAccumulationMode && onAccumulatedRecordsChange && accumulatedRecords && accumulatedRecords.length > 0) {
      const remainingRecords = removeResultsFromAccumulated(
        outputDS as FeatureLayerDataSource,
        [data],
        accumulatedRecords
      )
      
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removed-from-accumulated',
        widgetId,
        removedRecordId: dataId,
        accumulatedRecordsCountBefore: accumulatedRecords.length,
        remainingRecordsCount: remainingRecords.length,
        wasRemoved: remainingRecords.length < accumulatedRecords.length
      })
      
      onAccumulatedRecordsChange(remainingRecords)
    }
    
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
        {/* FORCED: Always SimpleList - LazyLoad and MultiPage removed */}
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
            itemExpandStates={itemExpandStates}
            removedRecordIds={removedRecordIds}
            onRenderDone={handleRenderDone}
          />
        )}
      </div>
    </div>
  )
}
