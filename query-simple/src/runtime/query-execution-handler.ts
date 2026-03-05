/**
 * Query Execution Handler
 *
 * Extracted from query-task.tsx handleFormSubmitInternal (~905 lines).
 * Uses typed parameter object pattern (QueryExecutionContext) instead of
 * closure variables, enabling independent testing and reducing query-task.tsx
 * complexity.
 *
 * Pattern: useReducer + typed parameter objects (see SINGLETON_EXTRACTION_RESEARCH.md)
 *
 * @version r024.128
 */
import {
  React,
  type ImmutableObject,
  type ImmutableArray,
  type IMSqlExpression,
  type DataSource,
  type DataRecord,
  type QueryParams,
  DataSourceStatus,
  type FeatureLayerDataSource,
  type FeatureDataRecord
} from 'jimu-core'
import { type QueryItemType, type SpatialFilterObj, SelectionType } from '../config'
import { type QueryTaskAction } from './query-task-reducer'
import { generateQueryParams, executeQuery } from './query-utils'
import { executeDirectQuery } from './direct-query'
import { mergeResultsIntoAccumulated, removeResultsFromAccumulated, removeRecordsFromOriginSelections } from './results-management-utils'
import { removeHighlightGraphics } from './graphics-layer-utils'
import { clearSelectionInDataSources, dispatchSelectionEvent } from './selection-utils'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import type { EventManager } from './managers/event-manager'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Direct JS API Query Bypass Toggle (r024.50, re-enabled r024.57)
 *
 * When true, bypasses ExB's outputDS.load() and uses FeatureLayer.queryFeatures()
 * directly. Uses outputDS.buildRecord() to wrap raw Graphics into real
 * FeatureDataRecord objects with full coded domain formatting.
 *
 * STATUS: ENABLED (r024.57) - See docs/development/DIRECT_QUERY_BYPASS.md
 * MEMORY IMPACT: 89-99% reduction in per-query memory growth.
 */
const USE_DIRECT_QUERY = true

// Event fired when a hash-triggered query execution completes successfully
// This allows HelperSimple to track which hash parameters have been executed
const QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT = 'querysimple-hash-query-executed'

// ---------------------------------------------------------------------------
// Context interface
// ---------------------------------------------------------------------------

/**
 * Typed parameter object for executeQueryInternal.
 * Replaces ~26 closure variables from the original handleFormSubmitInternal.
 *
 * Grouped by source:
 * - dispatch/state: from useReducer
 * - refs: React.MutableRefObject instances
 * - props: values from QueryTaskProps
 * - callbacks: internal functions from the component
 */
export interface QueryExecutionContext {
  // Dispatch (from useReducer)
  dispatch: React.Dispatch<QueryTaskAction>

  // State (from useReducer)
  outputDS: DataSource | null

  // Refs
  queryExecutionKeyRef: React.MutableRefObject<number>
  pendingQueryAfterClearRef: React.MutableRefObject<{
    sqlExpr: IMSqlExpression
    spatialFilter: SpatialFilterObj
    runtimeZoomToSelected?: boolean
  } | null>
  lastRuntimeZoomToSelectedRef: React.MutableRefObject<boolean | undefined>
  attributeFilterSqlExprObj: React.MutableRefObject<IMSqlExpression>
  spatialFilterObj: React.MutableRefObject<any>
  currentQueryRecordIdsRef: React.MutableRefObject<string[]>
  hasSelectedRecordsRef: React.MutableRefObject<boolean>
  recordsRef: React.MutableRefObject<DataRecord[]>
  lastQueryResultCountRef: React.MutableRefObject<number>
  queryParamRef: React.MutableRefObject<QueryParams>

  // Props
  widgetId: string
  queryItem: ImmutableObject<QueryItemType>
  queryItems?: ImmutableArray<QueryItemType>
  currentItem: QueryItemType
  resultsMode?: SelectionType
  accumulatedRecords?: FeatureDataRecord[]
  graphicsLayer?: __esri.GraphicsLayer
  mapView?: __esri.MapView | __esri.SceneView
  eventManager?: EventManager
  initialInputValue?: string
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
  onHashParameterUsed?: (shortId: string) => void

  // Internal callbacks
  clearResult: (reason?: string) => Promise<void>
  zoomToRecords: (records: FeatureDataRecord[]) => Promise<void>
}

// ---------------------------------------------------------------------------
// Core query execution function
// ---------------------------------------------------------------------------

/**
 * Core query execution logic extracted from handleFormSubmitInternal.
 *
 * Handles: query execution (direct JSAPI or ExB DataSource), results accumulation
 * (New/Add/Remove modes), selection propagation, zoom, and hash parameter tracking.
 *
 * @param ctx - Typed context with all required dependencies
 * @param sqlExpr - SQL expression for attribute filtering
 * @param spatialFilter - Spatial filter object
 * @param runtimeZoomToSelected - Optional runtime override for zoom-to-selected behavior
 */
export async function executeQueryInternal (
  ctx: QueryExecutionContext,
  sqlExpr: IMSqlExpression,
  spatialFilter: SpatialFilterObj,
  runtimeZoomToSelected?: boolean
): Promise<void> {
  // Destructure context — same variable names as original closure in query-task.tsx
  const {
    dispatch, outputDS, queryExecutionKeyRef, pendingQueryAfterClearRef,
    lastRuntimeZoomToSelectedRef, attributeFilterSqlExprObj, spatialFilterObj,
    currentQueryRecordIdsRef, hasSelectedRecordsRef, recordsRef,
    lastQueryResultCountRef, queryParamRef, widgetId, queryItem, queryItems,
    currentItem, resultsMode, accumulatedRecords, graphicsLayer, mapView,
    eventManager, initialInputValue, onAccumulatedRecordsChange,
    onHashParameterUsed, clearResult, zoomToRecords
  } = ctx

  // Clear previous errors when starting a new query
  dispatch({ type: 'SET_SELECTION_ERROR', payload: null })
  dispatch({ type: 'SET_ZOOM_ERROR', payload: null })

  debugLogger.log('TASK', {
    event: 'handleFormSubmitInternal-executing',
    widgetId,
    resultsMode,
    queryExecutionKey: queryExecutionKeyRef.current,
    timestamp: Date.now()
  })

  // Check outputDS exists before proceeding
  if (!outputDS) {
    pendingQueryAfterClearRef.current = { sqlExpr, spatialFilter, runtimeZoomToSelected }
    debugLogger.log('TASK', {
      event: 'handleFormSubmitInternal-no-outputDS',
      widgetId,
      note: 'OutputDS null (e.g. Query-tab clear); stored pending query, will run when handleOutputDataSourceCreated fires',
      timestamp: Date.now()
    })
    dispatch({ type: 'SET_STAGE', payload: 0 })
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
      widgetId,
      queryItemId: queryItem?.id,
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
      widgetId,
      finalCount: existingRecordsForMerge.length,
      finalIds: existingRecordsForMerge.map(r => r.getId?.()).slice(0, 5),
      source: fromProp.length > 0 ? 'accumulatedRecords-prop' : 'outputDS-getSelectedRecords',
      timestamp: Date.now()
    })

    debugLogger.log('RESULTS-MODE', {
      event: 'captured-existing-records-diagnostic',
      widgetId,
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
      widgetId,
      timestamp: Date.now()
    })
    await clearResult('handleFormSubmit-new-mode')
  }

  // Set loading stage
  dispatch({ type: 'SET_STAGE', payload: 2 })

  // FORCED: Always use SimpleList - fetch ALL records, not just a page
  // Use data source's max record count, or fall back to a large number (10000)
  const maxRecordCount = (featureDS as any).getMaxRecordCount?.() ?? 10000
  const pageSize = maxRecordCount
  const queryParams = generateQueryParams(featureDS, sqlExpr, spatialFilter, currentItem, 1, pageSize)
  queryParamRef.current = queryParams

  debugLogger.log('TASK', {
    event: 'handleFormSubmit-executing-query',
    widgetId,
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
    widgetId,
    resultsMode,
    where: queryParams.where,
    timestamp: Date.now()
  })

  // PERFORMANCE OPTIMIZATION: Removed redundant executeCountQuery() round-trip.
  // Since we fetch ALL records (pageSize = maxRecordCount), we can just use records.length.
  featureDS.updateQueryParams(queryParamRef.current, widgetId)

  const fetchStartTime = performance.now()

  // Direct Query Bypass (r024.50, re-enabled r024.57 with buildRecord)
  // Bypasses ExB's outputDS.load() and its ~115 MB/query memory leak.
  // Uses outputDS.buildRecord() for real FeatureDataRecord objects.
  debugLogger.log('QUERY-PATH', {
    event: 'query-fork',
    path: USE_DIRECT_QUERY ? 'DIRECT (buildRecord)' : 'EXB (outputDS.load)',
    toggle: USE_DIRECT_QUERY,
    widgetId,
    where: queryParams.where,
    timestamp: Date.now()
  })

  // r024.63: Wrap query execution in its own error handler for service/network errors
  // This is separate from the chain's .catch() which handles processing errors
  const queryPromise = (USE_DIRECT_QUERY
    ? executeDirectQuery(
        featureDS,
        queryItem,
        queryParams.where || '1=1',
        {
          returnGeometry: true,
          maxAllowableOffset: 0.1,
          pageSize: queryParams.pageSize as number,
          orderByFields: queryParams.orderByFields as string[],
          outSpatialReference: mapView?.spatialReference
        }
      ).then(directResult => ({
        records: directResult.records as DataRecord[],
        fields: directResult.fields,
        _directPopupTemplate: directResult.popupTemplate,
        _directDefaultPopupTemplate: directResult.defaultPopupTemplate
      }))
    : executeQuery(widgetId, queryItem, featureDS, queryParamRef.current)
  ).catch(error => {
    // r024.63: Only show user-facing error for actual service/network failures
    // These are errors from featureLayer.load(), featureLayer.queryFeatures(), or outputDS.load()
    const rawMessage = error instanceof Error ? error.message : String(error)

    // Check if this looks like a service/network error vs a processing error
    const isServiceError =
      rawMessage.includes('Unable to complete operation') ||
      rawMessage.includes('Failed to fetch') ||
      rawMessage.includes('NetworkError') ||
      rawMessage.includes('featureResult') ||
      rawMessage.includes('PBF') ||
      rawMessage.includes('timeout') ||
      rawMessage.includes('ETIMEDOUT') ||
      rawMessage.includes('ECONNREFUSED') ||
      rawMessage.includes('503') ||
      rawMessage.includes('502') ||
      rawMessage.includes('500') ||
      rawMessage.includes('404')

    debugLogger.log('TASK', {
      event: 'query-execution-error',
      widgetId,
      error: rawMessage,
      isServiceError,
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now()
    })

    if (isServiceError) {
      dispatch({ type: 'SET_QUERY_ERROR_ALERT', payload: {
        show: true,
        errorMessage: rawMessage,
        timestamp: Date.now()
      } })
    }

    // Re-throw so the chain knows the query failed
    throw error
  })

  queryPromise
    .then(async (result) => {
      const fetchDurationMs = Math.round(performance.now() - fetchStartTime)
      const processingStartTime = performance.now()

      queryResultCount = result.records?.length || 0

      debugLogger.log('RESULTS-MODE', {
        event: 'query-execution-complete',
        widgetId,
        resultsMode,
        recordsReturned: queryResultCount,
        fetchDurationMs,
        existingCapturedCount: existingRecordsForMerge.length,
        timestamp: Date.now()
      })

      // r022.8: Detect zero results and show alert (force new state each time)
      if (queryResultCount === 0) {
        dispatch({ type: 'SET_NO_RESULTS_ALERT', payload: {
          show: true,
          recordsRequested: queryResultCount,
          queryValue: queryParamRef.current?.where || '',
          timestamp: Date.now() // r022.8: Unique timestamp forces React to recognize as new state
        } })

        debugLogger.log('RESULTS-MODE', {
          event: 'no-results-alert-triggered',
          widgetId,
          resultsMode,
          queryValue: queryParamRef.current?.where || '',
          timestamp: Date.now()
        })
      } else {
        // Clear any existing alert when query succeeds
        dispatch({ type: 'SET_NO_RESULTS_ALERT', payload: null })
      }

      let recordsToDisplay = result.records || []
      const dsToUse = outputDS

      // Handle "Add to" mode: merge new results with widget-level accumulated records
      if (resultsMode === SelectionType.AddToSelection) {
        if (result.records && result.records.length > 0) {
          try {
            // FIX (r018.96): No manual removal filtering needed
            // Duplicate detection in mergeResultsIntoAccumulated handles preventing duplicates
            debugLogger.log('RESULTS-MODE', {
              event: 'add-mode-starting-merge',
              widgetId,
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
              widgetId,
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
              dispatch({ type: 'SET_ALL_DUPLICATES_ALERT', payload: {
                show: true,
                recordsFound: result.records.length,
                queryValue: queryParamRef.current?.where || '',
                timestamp: Date.now()
              } })

              debugLogger.log('RESULTS-MODE', {
                event: 'all-duplicates-alert-triggered',
                widgetId,
                recordsFound: result.records.length,
                duplicatesSkipped: duplicateIds.length,
                queryValue: queryParamRef.current?.where || '',
                note: 'Query found records but all were already in Results',
                timestamp: Date.now()
              })
            } else {
              // Clear any existing alert when records are successfully added
              dispatch({ type: 'SET_ALL_DUPLICATES_ALERT', payload: null })
            }

            // Update widget-level accumulated records so they persist across query switches
            if (onAccumulatedRecordsChange) {
              onAccumulatedRecordsChange(mergedRecords)
            }

            // r021.87: Store queryConfigId directly on record when added - no map needed
            currentQueryRecordIdsRef.current = addedIds

            // r023.30: Get origin DS ID for cross-layer removal support
            const originDSId = featureDS.getOriginDataSources()?.[0]?.id || featureDS.id

            result.records.forEach(record => {
              const recordId = record.getId()
              // Only stamp records that were actually added (not duplicates)
              if (addedIds.includes(recordId)) {
                // Store queryConfigId and originDSId directly on the record
                if (record.feature && record.feature.attributes) {
                  record.feature.attributes.__queryConfigId = queryItem.configId
                  record.feature.attributes.__originDSId = originDSId
                }

                debugLogger.log('RESULTS-MODE', {
                  event: 'record-stamped-with-ids',
                  widgetId,
                  recordId,
                  queryConfigId: queryItem.configId,
                  originDSId,
                  storedOnRecord: !!record.feature?.attributes,
                  timestamp: Date.now()
                })
              }
            })
          } catch (error) {
            debugLogger.log('RESULTS-MODE', {
              event: 'add-mode-error',
              widgetId,
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
            widgetId,
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
            widgetId,
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
            widgetId,
            existingCount: existingRecordsForMerge.length,
            removeCount: result.records?.length || 0
          })
          // Check if we have accumulated records to remove from
          if (existingRecordsForMerge.length === 0) {
            debugLogger.log('RESULTS-MODE', {
              event: 'remove-mode-no-accumulated-records',
              widgetId,
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
              widgetId,
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
              widgetId,
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
                widgetId,
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
                widgetId,
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
              widgetId,
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
              widgetId,
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
              dispatch({ type: 'SET_NO_REMOVAL_ALERT', payload: {
                show: true,
                recordsFound: result.records.length,
                queryValue: queryParamRef.current?.where || '',
                timestamp: Date.now()
              } })

              debugLogger.log('RESULTS-MODE', {
                event: 'no-removal-alert-triggered',
                widgetId,
                recordsFound: result.records.length,
                queryValue: queryParamRef.current?.where || '',
                note: 'Query found records but none were in accumulated results to remove',
                timestamp: Date.now()
              })
            } else {
              // Clear any existing alert when removal succeeds
              dispatch({ type: 'SET_NO_REMOVAL_ALERT', payload: null })
            }

            // If all records removed, auto-clear (consistent with user expectation)
            if (remainingRecords.length === 0) {
              debugLogger.log('RESULTS-MODE', {
                event: 'remove-mode-all-records-removed',
                widgetId,
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
              widgetId,
              existingAccumulatedRecordsCount: existingRecordsForMerge.length,
              note: 'Query returned no results - no records to remove'
            })
            // Keep existing accumulated records displayed
            recordsToDisplay = existingRecordsForMerge
          }
        } catch (error) {
          debugLogger.log('RESULTS-MODE', {
            event: 'remove-mode-error',
            widgetId,
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
            widgetId,
            recordsCount: recordsToDisplay.length,
            note: 'r018.97: Populate accumulatedRecords in New mode for universal tab count',
            timestamp: Date.now()
          })

          // r021.87: In NEW mode, stamp queryConfigId on all records
          // r023.30: Also stamp originDSId for cross-layer removal support
          currentQueryRecordIdsRef.current = (recordsToDisplay as FeatureDataRecord[]).map(r => r.getId());
          const originDSIdForNew = featureDS.getOriginDataSources()?.[0]?.id || featureDS.id

          ;(recordsToDisplay as FeatureDataRecord[]).forEach(record => {
            if (record.feature && record.feature.attributes) {
              record.feature.attributes.__queryConfigId = queryItem.configId
              record.feature.attributes.__originDSId = originDSIdForNew
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
        widgetId,
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
              widgetId,
              recordCount: recordsToDisplay.length
            })
          } catch (error) {
            debugLogger.log('RESULTS-MODE', {
              event: 'remove-mode-output-ds-selection-error',
              widgetId,
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        } else {
          // For "Add to" and "New" modes, select records with cross-layer grouping
          dispatch({ type: 'SET_SELECTION_ERROR', payload: null })
          ;(async () => {
            try {
              // r022.73: Group records by __queryConfigId to prevent cross-layer selection pollution
              // This ensures each layer only gets its own record IDs selected
              debugLogger.log('SELECTION-STATE-AUDIT', {
                event: 'r022-73-grouping-starting',
                widgetId,
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

                const matchingQueryItem = queryItems?.find(qi => qi.configId === queryConfigId)
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
                widgetId,
                originDSCount: recordsByOriginDS.size,
                groups: Array.from(recordsByOriginDS.entries()).map(([ds, records]) => ({
                  originDSId: ds.id,
                  recordCount: records.length,
                  recordIds: records.map(r => r.getId())
                })),
                timestamp: Date.now()
              })

              // r023.5: REMOVED origin DS selection (blue outlines) - only "Add to Map" creates blue outlines
              // Previously: Clear then re-select each origin DS
              // Now: Skip origin DS entirely, only update output DS for Results tab

              // r022.73: Update outputDS for Results tab with ALL records (cross-layer display)
              if (typeof dsToUse.selectRecordsByIds === 'function') {
                dsToUse.selectRecordsByIds(recordIdsToSelect, recordsToDisplay as FeatureDataRecord[])
              }

              // Dispatch custom selection event so Widget state is updated immediately
              dispatchSelectionEvent(widgetId, recordIdsToSelect, dsToUse, queryItem.configId, eventManager, accumulatedRecords?.length)
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to select query results'
              dispatch({ type: 'SET_SELECTION_ERROR', payload: errorMessage })
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
            await clearSelectionInDataSources(widgetId, dsToUse, true, graphicsLayer)
            hasSelectedRecordsRef.current = false

            // Notify Widget that selection is cleared (pass 0 so handler does not read stale count)
            dispatchSelectionEvent(widgetId, [], dsToUse, queryItem.configId, eventManager, 0)

            debugLogger.log('RESULTS-MODE', {
              event: 'remove-mode-all-records-removed-selection-cleared',
              widgetId
            })
          } catch (error) {
            debugLogger.log('RESULTS-MODE', {
              event: 'remove-mode-clear-selection-error',
              widgetId,
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
      dispatch({ type: 'SET_QUERY_EXECUTED', payload: true })
      debugLogger.log('TASK', {
        event: 'query-executed-flag-set',
        widgetId,
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

      dispatch({ type: 'SET_RESULT_COUNT', payload: newResultCount })

      // INSTANT UI FIX (The "Spinner Bypass"):
      // Decouple the "Retrieving results..." spinner from asynchronous actions like zooming.
      // By calling dispatch now, the user sees the result list immediately while
      // the map animation continues in the background.
      dispatch({ type: 'SET_STAGE', payload: 1 })

      debugLogger.log('TASK', {
        event: 'perf-processing-complete',
        widgetId,
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
          dispatch({ type: 'SET_ZOOM_ERROR', payload: errorMessage })
          debugLogger.log('ZOOM', {
            event: 'zoom-goTo-error-query',
            error: errorMessage,
            errorStack: error instanceof Error ? error.stack : undefined
          })
          debugLogger.log('ZOOM', {
            event: 'zoom-to-records-error',
            widgetId,
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
          widgetId,
          queryItemConfigId: queryItem.configId,
          queryItemShortId: queryItem.shortId,
          initialInputValue,
          timestamp: Date.now()
        })

        debugLogger.log('TASK', {
          event: 'hash-query-executed-notifying-parent',
          widgetId,
          queryItemConfigId: queryItem.configId,
          queryItemShortId: queryItem.shortId,
          initialInputValue,
          timestamp: Date.now()
        })
        onHashParameterUsed(queryItem.shortId)

        debugLogger.log('HASH-EXEC', {
          event: 'querytask-onhashparameterused-called',
          widgetId,
          queryItemConfigId: queryItem.configId,
          queryItemShortId: queryItem.shortId,
          timestamp: Date.now()
        })

        // Fire event to notify HelperSimple that hash query execution is complete
        // This allows HelperSimple to track which hash parameters have been executed
        // to prevent re-execution when switching queries
        const hashParam = `${queryItem.shortId}=${initialInputValue}`
        const executedEvent = new CustomEvent(QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT, {
          detail: {
            widgetId,
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
          widgetId,
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
      // r024.63: This catch handles errors in the processing chain AFTER query execution
      // Service/network errors are already handled in the query promise wrapper above
      // We only log here, don't show popover (user already saw it if it was a service error)
      const rawMessage = error instanceof Error ? error.message : String(error)
      debugLogger.log('TASK', {
        event: 'query-chain-failed-diagnostic',
        widgetId,
        error: rawMessage,
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: Date.now()
      })

      dispatch({ type: 'SET_STAGE', payload: 0 }) // Return control to user - exit Stage 2 on error
    })
    .finally(() => {
      if (spatialFilter?.layer && spatialFilter?.clearAfterApply) {
        spatialFilter.layer.removeAll()
      }
      // setStage(1) // Removed from here; now called in the main chain before background actions
    })
}
