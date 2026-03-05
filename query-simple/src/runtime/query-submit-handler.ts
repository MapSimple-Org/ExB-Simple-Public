/**
 * Query Submit Handler
 *
 * Extracted from query-task.tsx handleFormSubmit (~228 lines).
 * Uses typed parameter object pattern (SubmitContext) instead of
 * closure variables.
 *
 * Handles the DS destroy/recreate memory workflow for New mode and
 * the hash value conversion wait pattern.
 *
 * Pattern: useReducer + typed parameter objects (see SINGLETON_EXTRACTION_RESEARCH.md)
 *
 * @version r024.130
 */
import {
  React,
  type IMSqlExpression,
  type DataSource,
  type DataRecord,
  DataSourceStatus,
  DataSourceManager,
  type FeatureDataRecord
} from 'jimu-core'
import { type SpatialFilterObj, SelectionType } from '../config'
import { type QueryTaskAction } from './query-task-reducer'
import { clearAnyResultLayerContents } from './graphics-layer-utils'
import { clearSelectionInDataSources, dispatchSelectionEvent } from './selection-utils'
import { createQuerySimpleDebugLogger, globalHandleManager } from 'widgets/shared-code/mapsimple-common'
import type { EventManager } from './managers/event-manager'

const debugLogger = createQuerySimpleDebugLogger()

// ---------------------------------------------------------------------------
// Context interface
// ---------------------------------------------------------------------------

/**
 * Typed parameter object for executeFormSubmit.
 * Replaces ~20 closure variables from the original handleFormSubmit.
 *
 * Grouped by source:
 * - dispatch/state: from useReducer
 * - refs: React.MutableRefObject instances
 * - props: values from QueryTaskProps
 * - callbacks: internal functions from the component
 */
export interface SubmitContext {
  // Dispatch (from useReducer)
  dispatch: React.Dispatch<QueryTaskAction>

  // State (from useReducer)
  outputDS: DataSource | null
  dsRecreationKey: number

  // Refs
  isRetryAfterClearRef: React.MutableRefObject<boolean>
  pendingQueryAfterClearRef: React.MutableRefObject<{
    sqlExpr: IMSqlExpression
    spatialFilter: SpatialFilterObj
    runtimeZoomToSelected?: boolean
  } | null>
  pendingHashQueryRef: React.MutableRefObject<{
    sqlExpr: IMSqlExpression
    spatialFilter: SpatialFilterObj
    runtimeZoomToSelected?: boolean
  } | null>
  recordsRef: React.MutableRefObject<DataRecord[]>
  hasSelectedRecordsRef: React.MutableRefObject<boolean>
  queryExecutionKeyRef: React.MutableRefObject<number>

  // Props
  widgetId: string
  queryItemConfigId: string
  resultsMode?: SelectionType
  initialInputValue?: string
  graphicsLayer?: __esri.GraphicsLayer
  mapView?: __esri.MapView | __esri.SceneView
  eventManager?: EventManager
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
  onDestroyGraphicsLayer?: () => void

  // Internal callbacks
  publishDataClearedMsg: () => Promise<void>
  handleFormSubmitInternal: (sqlExpr: IMSqlExpression, spatialFilter: SpatialFilterObj, runtimeZoomToSelected?: boolean) => Promise<void>
}

// ---------------------------------------------------------------------------
// Core submit function
// ---------------------------------------------------------------------------

/**
 * Handles form submission when user clicks "Apply" button.
 *
 * Two main paths:
 * 1. Memory workflow (New mode with existing results): destroy DS, increment key,
 *    let handleOutputDataSourceCreated fire pending query
 * 2. Direct execution: check hash value conversion status, then delegate to
 *    handleFormSubmitInternal
 *
 * @param ctx - Typed context with all required dependencies
 * @param sqlExpr - SQL expression for attribute filtering
 * @param spatialFilter - Spatial filter object
 * @param runtimeZoomToSelected - Optional runtime override for zoom-to-selected behavior
 */
export async function executeFormSubmit (
  ctx: SubmitContext,
  sqlExpr: IMSqlExpression,
  spatialFilter: SpatialFilterObj,
  runtimeZoomToSelected?: boolean
): Promise<void> {
  // Destructure context — same variable names as original closure in query-task.tsx
  const {
    dispatch, outputDS, dsRecreationKey,
    isRetryAfterClearRef, pendingQueryAfterClearRef, pendingHashQueryRef,
    recordsRef, hasSelectedRecordsRef, queryExecutionKeyRef,
    widgetId, queryItemConfigId, resultsMode, initialInputValue,
    graphicsLayer, mapView, eventManager,
    onAccumulatedRecordsChange, onDestroyGraphicsLayer,
    publishDataClearedMsg, handleFormSubmitInternal
  } = ctx

  // LOG AT THE VERY START - before any checks
  debugLogger.log('TASK', {
    event: 'handleFormSubmit-called',
    widgetId,
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
  // DO NOT REMOVE: The programmatic button click is required. React doesn't detect
  // DataSource destruction through state updates alone. Direct cleanup attempts cause
  // double-click bugs. See OUTPUTDATASOURCE_MEMORY_LEAK_INVESTIGATION.md for details.
  // ============================================================================

  const hasExistingRecords = outputDS?.getSourceRecords()?.length > 0 || recordsRef.current?.length > 0
  const needsClear = resultsMode === SelectionType.NewSelection && hasExistingRecords && !isRetryAfterClearRef.current

  if (needsClear) {
    debugLogger.log('TASK', {
      event: 'memory-workflow-start',
      widgetId,
      outputDSRecords: outputDS?.getSourceRecords()?.length || 0,
      recordsRefCount: recordsRef.current?.length || 0,
      timestamp: Date.now()
    })

    isRetryAfterClearRef.current = true
    dispatch({ type: 'SET_STAGE', payload: 2 })

    // Store pending query for execution after DS recreation
    pendingQueryAfterClearRef.current = {
      sqlExpr,
      spatialFilter,
      runtimeZoomToSelected
    }

    // ============================================================================
    // SOVEREIGN RESET - Atomic Transaction (r024.40)
    // Must purge ESRI handles BEFORE destroying components that created them
    // ============================================================================

    // 1. ABLUTION: Kill the ghosts (ObservationHandles)
    const purgeStats = globalHandleManager.purgeAll(widgetId)
    debugLogger.log('TASK', {
      event: 'memory-workflow-ablution-purge',
      widgetId,
      purgeStats,
      note: 'r024.40: Sovereign Reset - killed ESRI handles before DS destruction',
      timestamp: Date.now()
    })

    // Manual cleanup: refs, graphics, selection
    debugLogger.log('TASK', {
      event: 'memory-cleanup-start',
      widgetId,
      timestamp: Date.now()
    })

    recordsRef.current = null
    outputDS?.setStatus(DataSourceStatus.NotReady)
    dispatch({ type: 'SET_RESULT_COUNT', payload: 0 })

    try {
      await clearSelectionInDataSources(widgetId, outputDS, true, graphicsLayer)
    } catch (error) {
      debugLogger.log('ERROR', { event: 'selection-clear-failed', error: error.message })
    }

    // r024.53: Lightweight clear - preserves layers on map
    if (mapView) {
      try{
        clearAnyResultLayerContents(widgetId, mapView)
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

    if (eventManager && outputDS) {
      dispatchSelectionEvent(widgetId, [], outputDS, queryItemConfigId, eventManager, 0)
    }

    await publishDataClearedMsg()

    hasSelectedRecordsRef.current = false
    queryExecutionKeyRef.current += 1
    dispatch({ type: 'SET_SELECTION_ERROR', payload: null })
    dispatch({ type: 'SET_ZOOM_ERROR', payload: null })

    // Destroy DataSource (frees ESRI observers and memory)
    if (outputDS) {
      try {
        const dsId = outputDS.id
        DataSourceManager.getInstance().destroyDataSource(dsId)
        debugLogger.log('TASK', {
          event: 'datasource-destroyed',
          widgetId,
          outputDSId: dsId,
          timestamp: Date.now()
        })
      } catch (error) {
        debugLogger.log('ERROR', {
          event: 'datasource-destroy-failed',
          widgetId,
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

    dispatch({ type: 'INCREMENT_DS_RECREATION_KEY' })

    debugLogger.log('TASK', {
      event: 'ds-recreation-key-incremented',
      widgetId,
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
    widgetId,
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
      widgetId,
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
          widgetId,
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
    widgetId,
    reason: isStringValue ? 'not-hash-triggered' : (isArrayValue ? 'already-converted' : 'no-value'),
    valueType: typeof value,
    isStringValue,
    isArrayValue,
    timestamp: Date.now()
  })

  // Value is already converted or not hash-triggered, execute immediately
  handleFormSubmitInternal(sqlExpr, spatialFilter, runtimeZoomToSelected)
}
