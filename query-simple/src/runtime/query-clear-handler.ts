/**
 * Query Clear Handler
 *
 * Extracted from query-task.tsx clearResult (~233 lines).
 * Uses typed parameter object pattern (ClearResultContext) instead of
 * closure variables.
 *
 * Pattern: useReducer + typed parameter objects (see SINGLETON_EXTRACTION_RESEARCH.md)
 *
 * @version r024.129
 */
import {
  React,
  type DataSource,
  type DataRecord,
  DataSourceStatus,
  type FeatureDataRecord
} from 'jimu-core'
import { type QueryTaskAction } from './query-task-reducer'
import { clearAnyResultLayerContents } from './graphics-layer-utils'
import { clearAllSelectionsForWidget } from './selection-utils'
import { createQuerySimpleDebugLogger, globalHandleManager } from 'widgets/shared-code/mapsimple-common'
import type { EventManager } from './managers/event-manager'
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type GroupLayer from '@arcgis/core/layers/GroupLayer'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'

const debugLogger = createQuerySimpleDebugLogger()

// ---------------------------------------------------------------------------
// Context interface
// ---------------------------------------------------------------------------

/**
 * Typed parameter object for executeClearResult.
 * Replaces ~16 closure variables from the original clearResult.
 *
 * Grouped by source:
 * - dispatch/state: from useReducer
 * - refs: React.MutableRefObject instances
 * - props: values from QueryTaskProps
 * - callbacks: internal functions from the component
 */
export interface ClearResultContext {
  // Dispatch (from useReducer)
  dispatch: React.Dispatch<QueryTaskAction>

  // State (from useReducer)
  outputDS: DataSource | null

  // Refs
  queryExecutionKeyRef: React.MutableRefObject<number>
  recordsRef: React.MutableRefObject<DataRecord[]>
  hasSelectedRecordsRef: React.MutableRefObject<boolean>
  currentQueryRecordIdsRef: React.MutableRefObject<string[]>
  lastQueryResultCountRef: React.MutableRefObject<number>

  // Props
  widgetId: string
  queryItemConfigId: string
  accumulatedRecords?: FeatureDataRecord[]
  graphicsLayer?: GraphicsLayer | GroupLayer
  mapView?: MapView | SceneView
  eventManager?: EventManager
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
  onDestroyGraphicsLayer?: () => void

  // Internal callbacks
  setActiveTab: (tab: 'query' | 'spatial' | 'results') => void
  /** Tab to navigate to after clearing. Defaults to 'query'. */
  returnTab?: 'query' | 'spatial' | 'results'
}

// ---------------------------------------------------------------------------
// Core clear function
// ---------------------------------------------------------------------------

/**
 * Clears all query results from the UI and map.
 * Single source of truth for clearing results.
 *
 * Handles: isClearing flag for child unmount, Sovereign Reset (handle purge,
 * graphics clear, key increment), data release, rAF yield for closure cleanup,
 * layer cleanup, selection clearing, and DS destruction.
 *
 * @param ctx - Typed context with all required dependencies
 * @param reason - Why clearResult was called (for diagnostic logging)
 */
export async function executeClearResult (
  ctx: ClearResultContext,
  reason: string = 'unknown'
): Promise<void> {
  // Destructure context — same variable names as original closure in query-task.tsx
  const {
    dispatch, outputDS, queryExecutionKeyRef, recordsRef,
    hasSelectedRecordsRef, currentQueryRecordIdsRef, lastQueryResultCountRef,
    widgetId, queryItemConfigId, accumulatedRecords, graphicsLayer, mapView,
    eventManager, onAccumulatedRecordsChange, onDestroyGraphicsLayer,
    setActiveTab, returnTab
  } = ctx

  debugLogger.log('TASK', {
    event: 'clearResult-called',
    widgetId,
    hasOutputDS: !!outputDS,
    reason,
    timestamp: Date.now()
  })

  // ============================================================================
  // r021.45 / r024.19: Delay Parent Array Clearing Until After React Unmounts
  //
  // THE CLOSURE PROBLEM:
  // 1. Results panel renders 600 QueryResultItem components
  // 2. Each component's onClick handler captures its `record` object in closure
  // 3. If we clear parent array BEFORE React unmounts children, closures still hold refs
  // 4. Result: Detached DOM can't be GC'd (84K+ Comment nodes, 31K+ divs accumulating)
  //
  // SOLUTION (IMPLEMENTED r024.19):
  // Use isClearing state flag to force effectiveRecords=[] IMMEDIATELY:
  // 1. setIsClearing(true) - makes effectiveRecords=[] in next render
  // 2. React sees empty list and unmounts all QueryResultItem children
  // 3. await requestAnimationFrame + setTimeout(0) - ensures:
  //    - rAF fires after React commits DOM update (paint complete)
  //    - setTimeout(0) gives extra tick for cleanup effects to run
  // 4. Children unmounted, closures released, refs can be GC'd
  // 5. NOW safe to call onAccumulatedRecordsChange([]) - no orphaned refs
  // 6. setIsClearing(false) - ready for new results
  // ============================================================================

  // STEP 1: Set clearing flag FIRST to force effectiveRecords = []
  // This triggers React to immediately re-render with empty list, unmounting children
  debugLogger.log('TASK', {
    event: 'clearResult-setting-isClearing-true',
    widgetId,
    reason,
    currentAccumulatedCount: accumulatedRecords?.length || 0,
    note: 'r024.19: Force effectiveRecords=[] to trigger child unmount',
    timestamp: Date.now()
  })
  dispatch({ type: 'SET_CLEARING', payload: true })

  // ============================================================================
  // SOVEREIGN RESET - Atomic Transaction (r024.40)
  // Order is CRITICAL - this is a single transaction to prevent memory leaks
  // ============================================================================

  // 1. ABLUTION: Kill the ghosts (55k+ ObservationHandles)
  // Must happen BEFORE React unmounts components that created them
  const purgeStats = globalHandleManager.purgeAll(widgetId)
  debugLogger.log('TASK', {
    event: 'clearResult-ablution-purge',
    widgetId,
    reason,
    purgeStats,
    note: 'r024.40: Sovereign Reset - killed ESRI handles before UI unmount',
    timestamp: Date.now()
  })

  // 2. r027.084: REMOVED — `mapView.graphics.removeAll()` block.
  //
  // r027.091: Hover pins are back on mapView.graphics (always-on-top overlay).
  // Cross-widget safety is maintained because removeAll() is never called.
  // Per-card unmount handlers in query-result-item.tsx clean up each widget's
  // hover pins via mapView.graphics.remove(specificGraphicRef) on unmount.
  // See docs/bugs/HOVER-PIN-CROSS-WIDGET-BUG.md for full history.

  // 3. FORCE UI UNMOUNT: Increment key to trigger React full tree destruction
  queryExecutionKeyRef.current += 1

  // 4. CLEAR THE DATA: Release references
  recordsRef.current = null              // Release child's reference to records
  outputDS?.setStatus(DataSourceStatus.NotReady)
  dispatch({ type: 'SET_RESULT_COUNT', payload: 0 })  // Clear count
  setActiveTab(returnTab ?? 'query')      // Navigate to originating tab
  hasSelectedRecordsRef.current = false
  dispatch({ type: 'SET_SELECTION_ERROR', payload: null })
  dispatch({ type: 'SET_ZOOM_ERROR', payload: null })

  // r021.87: Clear record tracking (formatting is stamped on records)
  currentQueryRecordIdsRef.current = []

  // r022.22: Clear last query result count
  lastQueryResultCountRef.current = 0

  // r022.25: Clear all alert/popover states
  dispatch({ type: 'SET_NO_RESULTS_ALERT', payload: null })
  dispatch({ type: 'SET_NO_REMOVAL_ALERT', payload: null })
  dispatch({ type: 'SET_ALL_DUPLICATES_ALERT', payload: null })
  dispatch({ type: 'SET_QUERY_ERROR_ALERT', payload: null })

  // r024.19: YIELD to let React unmount children
  // The isClearing=true above makes effectiveRecords=[] which triggers React to
  // unmount QueryResultItem components. We yield to let this complete so closures
  // holding FeatureDataRecord references are released before we clear parent data.
  //
  // Use requestAnimationFrame + setTimeout pattern to ensure:
  // 1. React has committed the DOM update (rAF fires after paint)
  // 2. Cleanup effects have run (another tick)
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      // After paint - DOM is updated, children should be unmounted
      setTimeout(() => {
        // Extra tick for cleanup effects
        resolve()
      }, 0)
    })
  })

  // NOW safe to clear parent array - children are unmounted, closures released
  debugLogger.log('TASK', {
    event: 'clearResult-yield-complete',
    widgetId,
    reason,
    note: 'r024.19: rAF+setTimeout complete - children should be unmounted now',
    timestamp: Date.now()
  })

  // r024.28: REMOVED aggressive record nulling (was r024.23)
  // The nulling corrupted records still held by widget.tsx state, causing getId() to fail
  // Memory cleanup will happen naturally when array references are released

  if (onAccumulatedRecordsChange) {
    onAccumulatedRecordsChange([])
  }

  debugLogger.log('TASK', {
    event: 'clearResult-parent-array-cleared-after-unmount',
    widgetId,
    reason,
    note: 'r024.19: Children unmounted via isClearing flag before clearing parent array',
    timestamp: Date.now()
  })

  // STEP 2: The Purge - Do all cleanup using unified clearing function
  // Unified clearing ensures both Query tab and Results tab clear paths do the same thing:
  // - Multi-source clearing (all origin DataSources)
  // - Graphics layer clearing
  // - Popup closing
  // - Hash clearing (via clearSelectionInDataSources)
  // - Event dispatching
  // - Message publishing
  // - Optional DataSource destruction

  // r024.26: ALWAYS clean up graphics layers regardless of outputDS state
  // The layers exist on the map with a specific ID - they must be cleaned even if outputDS is null
  if (mapView) {
    try {
      // r024.53: Lightweight clear - preserves GroupLayer on map to avoid +58 MB destroy/recreate
      const cleanupResult = clearAnyResultLayerContents(widgetId, mapView)
      debugLogger.log('TASK', {
        event: 'clearResult-direct-layer-cleanup',
        widgetId,
        reason,
        clearedGraphicsLayer: cleanupResult.clearedGraphicsLayer,
        clearedGroupLayer: cleanupResult.clearedGroupLayer,
        hasOutputDS: !!outputDS,
        timestamp: Date.now()
      })
      onDestroyGraphicsLayer?.()
    } catch (error) {
      debugLogger.log('ERROR', {
        event: 'clearResult-direct-layer-cleanup-failed',
        widgetId,
        reason,
        error: error instanceof Error ? error.message : String(error)
      })
    }

    // Close popup
    if (mapView.popup?.visible) {
      mapView.popup.close()
    }
  }

  if (outputDS) {
    const shouldDestroyDSs = reason === 'query-item-switch-new-mode' || reason === 'user-trash-click' || reason === 'navToForm-clearResults'

    try {
      await clearAllSelectionsForWidget({
        widgetId,
        outputDS,
        useGraphicsLayer: false, // r024.26: Layer already cleaned above, skip duplicate cleanup
        graphicsLayer,
        mapView,
        eventManager,
        queryItemConfigId,
        onDestroyGraphicsLayer: undefined, // Already called above
        destroyOutputDataSources: shouldDestroyDSs
      })
      if (shouldDestroyDSs && (reason === 'user-trash-click' || reason === 'navToForm-clearResults')) {
        dispatch({ type: 'SET_OUTPUT_DS', payload: null })
        dispatch({ type: 'INCREMENT_DS_RECREATION_KEY' })
        debugLogger.log('TASK', {
          event: 'clearResult-clear-tab-pattern',
          widgetId,
          reason,
          note: 'DS destroyed; nulled outputDS and incremented dsRecreationKey (same pattern as memory workflow)',
          timestamp: Date.now()
        })
      }
    } catch (error) {
      debugLogger.log('ERROR', {
        event: 'clearResult-unified-clear-failed',
        widgetId,
        reason,
        shouldDestroyDSs,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // STEP 3: The Reset - Back to Stage 0
  // This final state change "kicks" React one last time after all cleanup is done
  dispatch({ type: 'SET_STAGE', payload: 0 })

  // r024.19: Reset clearing flag - unmount complete, safe to render new results
  dispatch({ type: 'SET_CLEARING', payload: false })

  debugLogger.log('TASK', {
    event: 'clearResult-complete',
    widgetId,
    reason,
    note: 'Stage 0 reset - React will recreate DS on next query',
    timestamp: Date.now()
  })
}
