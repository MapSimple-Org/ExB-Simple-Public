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
import { Button, Icon, Tooltip } from 'jimu-ui'
import { ResultsMenu } from './results-menu'
import { getWidgetRuntimeDataMap } from './widget-config'
import { type QueryItemType, FieldsType, PagingType, ListDirection, ResultSelectMode, SelectionType } from '../config'
import defaultMessage from './translations/default'
import { useZoomToRecords, usePanToRecords } from './managers/use-zoom-to-records'
import { expandExtentByFactor, DEFAULT_EXTENT_EXPANSION_FACTOR } from './zoom-utils'
// FORCED: Always SimpleList - LazyList and PagingList removed
import { SimpleList } from './simple-list'
import { combineFields, resolvePopupInfoWithInheritance } from './query-utils'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { ExpandAllOutlined } from 'jimu-icons/outlined/directional/expand-all'
import { CollapseAllOutlined } from 'jimu-icons/outlined/directional/collapse-all'
// r024: Removed getExtraActions - now using ResultsMenu with direct action handlers
// Import zoom icon for direct action button
const zoomToIcon = require('./assets/icons/zoom-to.svg')
import { 
  selectRecordsInDataSources, 
  clearSelectionInDataSources, 
  selectRecordsAndPublish,
  dispatchSelectionEvent 
} from './selection-utils'
import { executeRemoveRecord } from './record-removal-handler'
import { createQuerySimpleDebugLogger, ErrorMessage, substituteTokens, convertTemplateToHtml } from 'widgets/shared-code/mapsimple-common'
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
  hoverPinColor?: string // r022.106: Configurable hover pin color
  queryItem: ImmutableObject<QueryItemType>
  records: DataRecord[]
  runtimeZoomToSelected?: boolean
  onNavBack: (clearResults?: boolean) => Promise<void> | void
  graphicsLayer?: __esri.GraphicsLayer | __esri.GroupLayer
  mapView?: __esri.MapView | __esri.SceneView
  resultsMode?: SelectionType
  accumulatedRecords?: FeatureDataRecord[]
  resultsExtent?: __esri.Extent | null  // r024.74: Cached extent for zoom/pan actions
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
  eventManager?: import('./managers/event-manager').EventManager  // Chunk 7.1: Event Handling Manager
  // FIX (r018.96): Removed onManualRemoval - no longer needed
  // FIX (r018.92): Flag to track when query switch is in progress
  isQuerySwitchInProgressRef?: React.MutableRefObject<boolean>
  /** r024.33: Session key to force DOM reset on Clear/New Query */
  listResetKey?: number
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
  // r022.105: Configurable zoom on result click
  zoomOnResultClick?: boolean
  panOnResultClick?: boolean
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
  const { queryItem, queryParams, resultCount, maxPerPage, records, widgetId, outputDS, runtimeZoomToSelected, onNavBack, resultsMode, accumulatedRecords, resultsExtent, onAccumulatedRecordsChange, graphicsLayer, mapView, eventManager, isQuerySwitchInProgressRef, currentQueryRecordIds, queries, noRemovalAlert, onDismissNoRemovalAlert, allDuplicatesAlert, onDismissAllDuplicatesAlert, zoomOnResultClick, panOnResultClick, hoverPinColor, listResetKey } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const intl = useIntl()
  const zoomToRecords = useZoomToRecords(mapView, widgetId)
  const panToRecordsHook = usePanToRecords(mapView)
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
  
  // r024.38: Stable callback refs to prevent closure capture of record arrays
  // These refs always hold the latest callback implementation
  const removeRecordRef = React.useRef<((data: FeatureDataRecord) => void) | null>(null)
  const toggleSelectionRef = React.useRef<((data: FeatureDataRecord) => void) | null>(null)
  const handleZoomToRecordRef = React.useRef<((data: FeatureDataRecord) => Promise<void>) | null>(null)
  const handlePanToRecordRef = React.useRef<((data: FeatureDataRecord) => Promise<void>) | null>(null)
  
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

  // r024: Removed extraActions - now using ResultsMenu with direct action handlers

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
      return [emptyDataSet]
    }
    
    // Group records by their origin data source
    // r024.76: Use stamped __originDSId attribute for multi-source accumulation support
    const recordsByOriginDS = new Map<FeatureLayerDataSource, FeatureDataRecord[]>()
    
    recordsToUse.forEach(record => {
      const featureRecord = record as FeatureDataRecord
      let originDS: FeatureLayerDataSource | null = null
      let lookupMethod = 'none'
      
      // Priority 1: Use stamped __originDSId attribute (set when records are accumulated)
      const stampedOriginId = featureRecord.feature?.attributes?.__originDSId
      if (stampedOriginId) {
        const dsManager = DataSourceManager.getInstance()
        originDS = dsManager.getDataSource(stampedOriginId) as FeatureLayerDataSource
        lookupMethod = 'stamped-originDSId'
      }
      
      // Priority 2: Try record.getDataSource() and get its origin
      if (!originDS) {
        const recordDS = featureRecord.getDataSource?.() as FeatureLayerDataSource
        if (recordDS) {
          originDS = recordDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || recordDS
          lookupMethod = 'record-getDataSource'
        }
      }
      
      // Priority 3: Fallback to outputDS's origin
      if (!originDS && outputDS) {
        originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || outputDS as FeatureLayerDataSource
        lookupMethod = 'outputDS-fallback'
      }
      
      if (originDS) {
        if (!recordsByOriginDS.has(originDS)) {
          recordsByOriginDS.set(originDS, [])
        }
        recordsByOriginDS.get(originDS).push(featureRecord)
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
      
      // r024.83: Look up original query config by __queryConfigId from first record
      // This ensures each dataSet gets the correct searchAlias/name from the query that produced it,
      // not from currentItem which changes when user switches queries
      const firstRecord = originRecords[0] as FeatureDataRecord
      const queryConfigId = firstRecord?.feature?.attributes?.__queryConfigId
      const originalQueryItem = queryConfigId ? queries?.find(q => q.configId === queryConfigId) : null
      
      // Attach query metadata to dataSet for downstream use (table naming, etc.)
      ;(dataSet as any).searchAlias = originalQueryItem?.searchAlias
      ;(dataSet as any).queryName = originalQueryItem?.name
      
      // r024.84: Use originalQueryItem for field settings (falls back to currentItem if not found)
      // This ensures each dataSet gets the correct display fields from the query that produced it
      const queryItemForFields = originalQueryItem || currentItem
      
      // Add fields based on the original query's field settings
      if (queryItemForFields.resultFieldsType === FieldsType.CustomTemplate) {
        // Custom Template mode - extract fields from content expression
        dataSet.fields = combineFields(null, queryItemForFields.resultTitleExpression, undefined, (queryItemForFields as any).resultContentExpression)
      } else if (queryItemForFields.resultFieldsType === FieldsType.SelectAttributes && queryItemForFields.resultDisplayFields != null) {
        dataSet.fields = combineFields(queryItemForFields.resultDisplayFields, queryItemForFields.resultTitleExpression)
      } else if (originDS && 'getPopupInfo' in originDS) {
        // Fallback: use fields in popup template from origin DS
        // r025.066: Use inheritance-aware resolution so GL children pick up
        // the parent group layer's popup field config for table display
        const popupInfo = resolvePopupInfoWithInheritance(originDS as FeatureLayerDataSource)
        
        // r024.87: Extract fields from popupDescription/popupTitle if they use custom HTML
        // The fieldInfos.visible flags may not match what's actually displayed
        const extractFieldsFromTemplate = (template: string): string[] => {
          if (!template) return []
          const matches = template.match(/\{(\w+)\}/g) || []
          return matches.map(m => m.substring(1, m.length - 1))
        }
        
        const titleFields = extractFieldsFromTemplate(popupInfo?.title)
        const descFields = extractFieldsFromTemplate(popupInfo?.description)
        const templateFields = [...new Set([...titleFields, ...descFields])]

        // r025.066: Combine template fields AND visible fieldInfos — the table should
        // show everything the popup displays, not just what's in the title/description.
        // Previously used either/or logic which missed fieldInfos when a title template existed.
        const visibleFieldInfoFields = popupInfo?.fieldInfos
          ?.filter((fieldInfo) => fieldInfo.visible !== false)
          ?.map((fieldInfo) => fieldInfo.fieldName) || []

        const allPopupFields = [...new Set([...templateFields, ...visibleFieldInfoFields])]

        if (allPopupFields.length > 0) {
          dataSet.fields = allPopupFields
        }
      }
      
      return dataSet
    })
    
    debugLogger.log('RESULTS-MODE', {
      event: 'actionDataSets-summary',
      widgetId: widgetId,
      dataSetsCount: dataSets.length,
      totalRecords: recordsToUse.length,
      dataSets: dataSets.map(ds => ({
        originDSId: ds.dataSource?.id,
        records: ds.records?.length || 0,
        fields: ds.fields?.length || 0
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
  }, [selectedRecords, outputDS, queryData, currentItem, records, widgetId, queries])

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
            true // r023.5: ALWAYS skip origin DS selection (no automatic blue outlines)
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

  // r023.28: REMOVED - This useEffect was dead code that caused URL flash
  // It was intended to clear selection when resultSelectMode (Single/Multiple) changed,
  // but since r023.5-12 we don't use native selection, only graphics layer.
  // Also had incorrect function arguments (outputDS where widgetId was expected).

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

  // r024.112: Removed 500ms selection polling (was logging-only since r022.42).
  // Selection restoration is handled by HelperSimple via RESTORE_ON_IDENTIFY_CLOSE_EVENT.

  /**
   * Zooms to all records in the results using the cached resultsExtent.
   * r024.74: Uses pre-calculated extent instead of computing on every click.
   */
  const zoomToAllResults = React.useCallback(async () => {
    if (!resultsExtent || !mapView) {
      debugLogger.log('TASK', {
        event: 'zoom-to-all-results-skipped',
        widgetId,
        hasExtent: !!resultsExtent,
        hasMapView: !!mapView,
        timestamp: Date.now()
      })
      return
    }
    
    try {
      // Apply expansion factor to the cached extent
      const expandedExtent = expandExtentByFactor(
        resultsExtent, 
        DEFAULT_EXTENT_EXPANSION_FACTOR,
        mapView.spatialReference
      )
      
      debugLogger.log('TASK', {
        event: 'zoom-to-all-results-using-cached-extent',
        widgetId,
        recordCount: accumulatedRecords?.length || 0,
        originalExtent: {
          xmin: resultsExtent.xmin,
          xmax: resultsExtent.xmax,
          width: resultsExtent.width,
          height: resultsExtent.height
        },
        expandedExtent: {
          xmin: expandedExtent.xmin,
          xmax: expandedExtent.xmax,
          width: expandedExtent.width,
          height: expandedExtent.height
        },
        expansionFactor: DEFAULT_EXTENT_EXPANSION_FACTOR,
        timestamp: Date.now()
      })
      
      await mapView.goTo(expandedExtent)
      
      debugLogger.log('TASK', {
        event: 'zoom-to-all-results-complete',
        widgetId,
        timestamp: Date.now()
      })
    } catch (error) {
      debugLogger.log('TASK', {
        event: 'zoom-to-all-results-error',
        widgetId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      })
    }
  }, [resultsExtent, mapView, widgetId, accumulatedRecords?.length])

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
  // r022.105: Helper function to open popup for a record
  const openPopupForRecord = React.useCallback((data: FeatureDataRecord) => {
    const dataId = data.getId()
    const clickedFeature = (data as any).feature || data.getData?.() || null
    
    if (!mapView || !clickedFeature) {
      debugLogger.log('POPUP', {
        event: 'popup-open-skipped',
        recordId: dataId,
        reason: !mapView ? 'no-mapview' : 'no-feature',
        timestamp: Date.now()
      })
      return
    }
    
    const geometry = data.getJSAPIGeometry()
    
    if (!geometry) {
      debugLogger.log('POPUP', {
        event: 'popup-open-skipped',
        recordId: dataId,
        reason: 'no-geometry',
        timestamp: Date.now()
      })
      return
    }
    
    // r021.11: Calculate popup location using labelPointOperator
    const calcStartTime = Date.now()
    let popupLocation: any
    let calculationMethod = 'labelPointOperator'
    let calculationDetails: any = {}
    
    try {
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
      popupLocationCoords: popupLocation ? { x: popupLocation.x, y: popupLocation.y } : null,
      timestamp: Date.now()
    })
    
    if (popupLocation) {
      // r026.007: For CustomTemplate queries, build a CustomContent popup on the fly
      // so it renders with markdown formatting instead of the layer's default field table.
      const recordConfigId = clickedFeature?.attributes?.__queryConfigId
      const recordConfig = recordConfigId && queries?.find(q => q.configId === recordConfigId)
      if (recordConfig && (recordConfig as any).resultFieldsType === 'CustomTemplate') {
        const contentTemplate = (recordConfig as any).resultContentExpression || ''
        const titleTemplate = (recordConfig as any).resultTitleExpression || ''
        if (contentTemplate) {
          const attributes = clickedFeature.attributes || {}
          // Build resolved HTML using our shared pipeline
          let substituted = substituteTokens(contentTemplate, attributes)
          substituted = substituted.replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_m, field) => {
            const val = attributes[field]
            return val != null ? String(val) : ''
          })
          const html = convertTemplateToHtml(substituted)
          // Resolve title
          let title = substituteTokens(titleTemplate, attributes)
          title = title.replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_m, field) => {
            const val = attributes[field]
            return val != null ? String(val) : ''
          })
          // Create a simple popup with resolved HTML content
          const contentDiv = document.createElement('div')
          contentDiv.style.fontSize = '0.875rem'
          contentDiv.style.lineHeight = '1.4'
          contentDiv.style.color = 'var(--sys-color-surface-paper-text, #333)'
          const style = document.createElement('style')
          style.textContent = 'p{margin:0 0 4px}a{color:var(--sys-color-primary-main, #0079c1);text-decoration:none}a:hover{text-decoration:underline}strong{font-weight:700}em{font-style:italic}h3,h4,h5,h6{font-style:normal;font-weight:600;margin:0 0 4px}'
          contentDiv.appendChild(style)
          contentDiv.innerHTML += html
          mapView.openPopup({
            title,
            content: contentDiv,
            location: popupLocation,
            shouldFocus: false
          })
          debugLogger.log('POPUP', {
            event: 'popup-opened-custom-template',
            recordId: dataId,
            location: { x: popupLocation.x, y: popupLocation.y },
            timestamp: Date.now()
          })
          return
        }
      }
      // Default: let Esri use the layer's popup
      mapView.openPopup({
        features: [clickedFeature],
        location: popupLocation,
        shouldFocus: false // r022.98
      })
      
      debugLogger.log('POPUP', {
        event: 'popup-opened',
        recordId: dataId,
        location: { x: popupLocation.x, y: popupLocation.y },
        calculationMethod,
        calculationDurationMs: calcDuration,
        note: 'r022.98: shouldFocus=false to prevent Features widget warning',
        timestamp: Date.now()
      })
    }
  }, [mapView, queries])

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
    
    // r026.009: Determine click behavior — zoom, pan, or popup-only
    const shouldZoom = zoomOnResultClick === true
    const shouldPan = panOnResultClick === true
    const clickMode = shouldPan ? 'pan' : (shouldZoom ? 'zoom' : 'popup-only')

    debugLogger.log('POPUP', {
      event: 'result-clicked',
      recordId: dataId,
      clickMode,
      timestamp: Date.now()
    })

    if (shouldZoom) {
      const zoomPromise = zoomToRecords([data])
      zoomPromise.then(() => {
        openPopupForRecord(data)
      })
      .catch(() => {
        openPopupForRecord(data)
      })
    } else if (shouldPan) {
      // r026.009: Pan first, then open popup
      const panPromise = panToRecordsHook([data])
      panPromise.then(() => {
        openPopupForRecord(data)
      })
      .catch(() => {
        openPopupForRecord(data)
      })
    } else {
      // Popup only (no zoom or pan)
      debugLogger.log('POPUP', {
        event: 'result-clicked-NO-navigation',
        recordId: dataId,
        timestamp: Date.now()
      })
      
      // Open popup immediately without zooming
      openPopupForRecord(data)
    }
  }, [outputDS, widgetId, zoomToRecords, panToRecordsHook, zoomOnResultClick, panOnResultClick, openPopupForRecord])

  /**
   * Zooms the map to a single record. Used by result row "Zoom to" (menu when collapsed, inline icon when expanded).
   */
  const handleZoomToRecord = React.useCallback(async (data: FeatureDataRecord) => {
    if (zoomToRecords) {
      await zoomToRecords([data])
    }
  }, [zoomToRecords])

  // r026.009: Pan to single record (center without zoom change)
  const handlePanToRecord = React.useCallback(async (data: FeatureDataRecord) => {
    if (panToRecordsHook) {
      await panToRecordsHook([data])
    }
  }, [panToRecordsHook])

  /**
   * Removes a record from the results and selection.
   * Delegates to executeRemoveRecord in record-removal-handler.ts (r024.131).
   */
  const removeRecord = React.useCallback((data: FeatureDataRecord) => {
    executeRemoveRecord({
      outputDS, widgetId, queryItemConfigId: queryItem.configId,
      resultsMode, records, mapView, graphicsLayer,
      accumulatedRecords, onAccumulatedRecordsChange,
      onNavBack, expandAll, queryData,
      isRemovalInProgressRef, setQueryData
    }, data)
  }, [outputDS, widgetId, resultCount, onNavBack, resultsMode, accumulatedRecords, onAccumulatedRecordsChange, queryItem.configId, expandAll])

  // r024.39: Direct ref assignment (no useEffect overhead)
  // Update refs synchronously during render - they're current before DOM commit
  // Safe because: stable wrappers capture the ref OBJECT, read .current at CALL time
  removeRecordRef.current = removeRecord
  toggleSelectionRef.current = toggleSelection
  handleZoomToRecordRef.current = handleZoomToRecord
  handlePanToRecordRef.current = handlePanToRecord
  
  // r024.38: Stable callback wrappers - these NEVER change identity
  // They call through refs, so items always invoke the latest logic
  // without capturing the record arrays in their own closures
  const stableRemoveRecord = React.useCallback((data: FeatureDataRecord) => {
    removeRecordRef.current?.(data)
  }, []) // Empty deps = stable identity forever
  
  const stableToggleSelection = React.useCallback((data: FeatureDataRecord) => {
    toggleSelectionRef.current?.(data)
  }, [])
  
  const stableHandleZoomToRecord = React.useCallback(async (data: FeatureDataRecord) => {
    await handleZoomToRecordRef.current?.(data)
  }, [])

  const stableHandlePanToRecord = React.useCallback(async (data: FeatureDataRecord) => {
    await handlePanToRecordRef.current?.(data)
  }, [])

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
              <Button 
                className='ml-auto' 
                icon 
                size='sm' 
                variant='text' 
                color='inherit' 
                onClick={clearResults} 
                aria-label={getI18nMessage('clearResult')}
                css={css`min-width: 36px; min-height: 36px;`}
              >
                <Icon icon={iconMap.toolDelete} />
              </Button>
            </Tooltip>
            {/* Zoom to results button - 36x36px touch target */}
            {/* r024.74: Uses cached resultsExtent instead of computing on click */}
            {resultsExtent && mapView && (
              <Tooltip title={getI18nMessage('zoomToSelected')} placement='bottom'>
                <Button 
                  icon 
                  size='sm' 
                  variant='text' 
                  color='inherit' 
                  onClick={zoomToAllResults} 
                  aria-label={getI18nMessage('zoomToSelected')}
                  css={css`min-width: 36px; min-height: 36px;`}
                >
                  <Icon icon={zoomToIcon} />
                </Button>
              </Tooltip>
            )}
            {/* r024: Custom hamburger menu with curated actions:
                Pan to, View in table, Export (submenu), Zoom to selected, Select on map */}
            {enableDataAction && outputDS && (
              <React.Fragment>
                <div css={css`width: 1px; height: 16px; background-color: var(--sys-color-divider-input);`}></div>
                <ResultsMenu
                  widgetId={widgetId}
                  dataSets={actionDataSets}
                  outputDS={outputDS}
                  mapView={mapView}
                  resultsExtent={resultsExtent}
                  intl={intl}
                  queryItem={queryItem}
                  graphicsLayer={graphicsLayer}
                  queries={queries}
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
        {/* r024.33: Dynamic key forces complete DOM reset on Clear/New Query */}
        {resultCount > 0 && (
          <SimpleList
            key={`simple-${listResetKey || 0}`}
            widgetId={widgetId}
            queryItem={queryItem}
            outputDS={outputDS as any}
            records={filteredRecordsForList}
            direction={direction}
            onEscape={handleEscape}
            onSelectChange={stableToggleSelection}
            onRemove={stableRemoveRecord}
            onZoomTo={stableHandleZoomToRecord}
            onPanTo={stableHandlePanToRecord}
            zoomOnResultClick={zoomOnResultClick}
            panOnResultClick={panOnResultClick}
            expandByDefault={expandAll}
            queries={queries}
            mapView={mapView}
            hoverPinColor={hoverPinColor}
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
