/**
 * Utility functions for managing feature selection in QuerySimple widget.
 * Consolidates repeated selection logic to follow DRY principles.
 */

import type { DataSource, FeatureLayerDataSource, FeatureDataRecord } from 'jimu-core'
import { MessageManager, DataRecordsSelectionChangeMessage, DataSourceManager, DataRecordSetChangeMessage, RecordSetChangeType } from 'jimu-core'
import { addHighlightGraphics as addGraphicsLayerGraphics, clearGraphicsLayer, createOrGetGraphicsLayer, cleanupGraphicsLayer } from './graphics-layer-utils'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import type { EventManager } from './hooks/use-event-handling'

const debugLogger = createQuerySimpleDebugLogger()

// r021.93: Track pending graphics operations to prevent async overlap
let pendingGraphicsOperation: Promise<void> | null = null

/**
 * Custom event name for QuerySimple to notify Widget of selection changes.
 */
export const QUERYSIMPLE_SELECTION_EVENT = 'querysimple-selection-changed'

/**
 * Dispatches a custom selection event to the window so the main Widget can track state.
 * BUG-STALE-COUNT-001 fix: Pass accumulatedRecordsCount so handler does not read stale state.
 *
 * @param widgetId - The widget ID
 * @param recordIds - Array of selected record IDs
 * @param outputDS - The output data source
 * @param queryItemConfigId - The config ID of the query that produced these results
 * @param eventManager - Optional EventManager instance
 * @param accumulatedRecordsCount - Current accumulated records count at dispatch time (pass 0 when clearing)
 */
export function dispatchSelectionEvent(
  widgetId: string,
  recordIds: string[],
  outputDS: DataSource,
  queryItemConfigId: string,
  eventManager?: EventManager,
  accumulatedRecordsCount?: number
): void {
  const originDS = getOriginDataSource(outputDS)
  const dataSourceId = originDS?.id

  debugLogger.log('TASK', {
    event: 'dispatchSelectionEvent',
    widgetId,
    recordCount: recordIds.length,
    accumulatedRecordsCount,
    outputDsId: outputDS.id,
    queryItemConfigId
  })

  if (eventManager) {
    eventManager.dispatchSelectionEvent(widgetId, recordIds, dataSourceId, outputDS.id, queryItemConfigId, accumulatedRecordsCount)
  }
}

/**
 * Gets the origin data source from an output data source.
 * @param outputDS - The output data source
 * @returns The origin data source, or null if not available
 */
export function getOriginDataSource(
  outputDS: DataSource | null | undefined
): FeatureLayerDataSource | null {
  if (!outputDS) return null
  
  // Try to get origin data sources
  const originDataSources = typeof outputDS.getOriginDataSources === 'function' 
    ? outputDS.getOriginDataSources() 
    : []
    
  if (originDataSources && originDataSources.length > 0) {
    return originDataSources[0] as FeatureLayerDataSource
  }
  
  // If it doesn't have origin data sources, it might already be an origin data source
  // FeatureLayerDataSource should have a 'layer' property or 'getLayer' method
  if ((outputDS as any).layer || (outputDS as any).getLayer || (outputDS as any).type === 'FeatureLayer') {
    return outputDS as FeatureLayerDataSource
  }
  
  return null
}

/**
 * Selects records in both the origin data source and output data source.
 * This is the standard pattern used throughout the widget for selection.
 * Optionally uses graphics layer for highlighting (independent of layer visibility).
 * 
 * @param outputDS - The output data source
 * @param recordIds - Array of record IDs to select
 * @param records - Optional array of FeatureDataRecord objects for proper highlighting
 * @param useGraphicsLayer - Whether to use graphics layer for highlighting (default: false)
 * @param graphicsLayer - Graphics layer instance (required if useGraphicsLayer is true)
 * @param mapView - Map view instance (required if useGraphicsLayer is true)
 * @param skipOriginDSSelection - Skip origin DS selection but still do graphics (default: false)
 */
export async function selectRecordsInDataSources(
  outputDS: DataSource | null | undefined,
  recordIds: string[],
  records?: FeatureDataRecord[],
  useGraphicsLayer: boolean = false,
  graphicsLayer?: __esri.GraphicsLayer,
  mapView?: __esri.MapView | __esri.SceneView,
  skipOriginDSSelection: boolean = false
): Promise<void> {
  if (!outputDS) return
  
  const originDS = getOriginDataSource(outputDS)
  
  // If using graphics layer, add graphics for highlighting
  if (useGraphicsLayer && mapView && records && records.length > 0 && graphicsLayer) {
    // r021.93: Wait for any pending graphics operation to complete before starting new one
    if (pendingGraphicsOperation) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'selectRecordsInDataSources-waiting-for-pending-operation',
        recordIdsCount: recordIds.length,
        graphicsLayerId: graphicsLayer.id,
        timestamp: Date.now()
      })
      await pendingGraphicsOperation
    }

    debugLogger.log('GRAPHICS-LAYER', {
      event: 'selectRecordsInDataSources-using-graphics-layer',
      recordIdsCount: recordIds.length,
      recordsCount: records.length,
      graphicsLayerId: graphicsLayer.id,
      timestamp: Date.now()
    })
    
    // r021.93: Track this operation as pending
    pendingGraphicsOperation = (async () => {
      // r021.90: Clear graphics layer before re-adding to ensure we have the correct set
      // This handles multiple render cycles where the full accumulated list is passed each time
      clearGraphicsLayer(graphicsLayer)
      
      await addGraphicsLayerGraphics(graphicsLayer, records, mapView)
    })()

    await pendingGraphicsOperation
    pendingGraphicsOperation = null
    
    // r022.72: Skip origin DS selection if already handled elsewhere (e.g., by query-task.tsx grouping logic)
    // Still select in data source for state management (but layer selection won't show if layer is off)
    if (!skipOriginDSSelection && originDS && typeof originDS.selectRecordsByIds === 'function') {
      originDS.selectRecordsByIds(recordIds, records)
      debugLogger.log('SELECTION-STATE-AUDIT', {
        event: 'r022-72-origin-ds-selected-from-selectRecordsInDataSources',
        originDSId: originDS.id,
        recordCount: recordIds.length,
        timestamp: Date.now()
      })
    } else if (skipOriginDSSelection) {
      debugLogger.log('SELECTION-STATE-AUDIT', {
        event: 'r022-72-origin-ds-selection-skipped',
        reason: 'skipOriginDSSelection-flag-true',
        originDSId: originDS?.id,
        recordCount: recordIds.length,
        note: 'Graphics handled, but origin DS selection skipped (already correct)',
        timestamp: Date.now()
      })
    }
  } else {
    // Original behavior: use layer selection
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'selectRecordsInDataSources-using-layer-selection',
      recordIdsCount: recordIds.length,
      useGraphicsLayer,
      hasGraphicsLayer: !!graphicsLayer,
      hasMapView: !!mapView,
      skipOriginDSSelection,
      timestamp: Date.now()
    })
    
    // r023.5: Respect skipOriginDSSelection in BOTH branches (not just graphics layer branch)
    if (!skipOriginDSSelection && originDS && typeof originDS.selectRecordsByIds === 'function') {
      // Log layer state right before selection to see what's available when selection works
      const layer = (originDS as any).layer || (originDS as any).getLayer?.()
      if (layer) {
        debugLogger.log('GRAPHICS-LAYER', {
          event: 'selectRecordsByIds-layer-state',
          originDSId: originDS.id,
          layerId: layer.id,
          hasLayerMap: !!(layer as any).map,
          hasLayerView: !!(layer as any).view,
          hasLayerParent: !!(layer as any).parent,
          parentType: (layer as any).parent?.type || 'none',
          parentHasMap: !!(layer as any).parent?.map,
          parentHasView: !!(layer as any).parent?.view,
          parentHasViews: !!(layer as any).parent?.views,
          timestamp: Date.now()
        })
      }
      
      originDS.selectRecordsByIds(recordIds, records)
    } else if (skipOriginDSSelection) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'r023-5-origin-ds-selection-skipped-layer-branch',
        reason: 'skipOriginDSSelection-flag-true',
        originDSId: originDS?.id,
        recordCount: recordIds.length,
        timestamp: Date.now()
      })
    }
  }
  
  // Always update outputDS for widget's internal state
  if (typeof outputDS.selectRecordsByIds === 'function') {
    outputDS.selectRecordsByIds(recordIds, records)
  }
}

/**
 * Clears the `data_s` parameter from the URL hash.
 * Experience Builder automatically adds `data_s` when selections are made,
 * but doesn't remove it when selections are cleared, causing "dirty hash" issues.
 * 
 * This function ensures the hash is clean when selections are cleared.
 */
export function clearDataSParameterFromHash(): void {
  const hash = window.location.hash.substring(1)
  if (!hash) return
  
  const urlParams = new URLSearchParams(hash)
  
  if (urlParams.has('data_s')) {
    urlParams.delete('data_s')
    const newHash = urlParams.toString()
    
    debugLogger.log('HASH', {
      event: 'clearDataSParameterFromHash',
      hadDataS: true,
      newHash: newHash ? `#${newHash}` : '(empty)',
      timestamp: Date.now()
    })
    
    // Update the URL without triggering a reload
    // Always preserve pathname and query string, only update hash
    window.history.replaceState(null, '', 
      window.location.pathname + window.location.search + (newHash ? `#${newHash}` : '')
    )
  }
}

/**
 * Clears selection in both the origin data source and output data source.
 * Optionally clears graphics layer if using graphics layer mode.
 * Also clears the `data_s` parameter from the URL hash to prevent "dirty hash" issues.
 * 
 * @param widgetId - The widget ID (needed to publish message)
 * @param outputDS - The output data source
 * @param useGraphicsLayer - Whether to clear graphics layer (default: false)
 * @param graphicsLayer - Graphics layer instance (required if useGraphicsLayer is true)
 */
export async function clearSelectionInDataSources (
  widgetId: string,
  outputDS: DataSource | null | undefined,
  useGraphicsLayer: boolean = false,
  graphicsLayer?: __esri.GraphicsLayer
): Promise<void> {
  // Clear graphics layer if using graphics layer mode
  if (useGraphicsLayer && graphicsLayer) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'clearSelectionInDataSources-clearing-graphics-layer',
      graphicsLayerId: graphicsLayer.id,
      timestamp: Date.now()
    })
    clearGraphicsLayer(graphicsLayer)
  }

  // Clear data source selection for state management
  await selectRecordsInDataSources(outputDS, [], undefined, false)

  // Publish the empty selection message so the Map selection (blue boxes) clears
  if (outputDS) {
    publishSelectionMessage(widgetId, [], outputDS, true)
  }
  
  // Clear data_s parameter from hash to prevent dirty hash
  // Experience Builder adds data_s when selections are made but doesn't remove it when cleared
  clearDataSParameterFromHash()
}

/**
 * Unified function to clear all selections for a widget.
 * Handles multi-source clearing, graphics layer, popup, hash clearing, events, and messages.
 * This is the single source of truth for clearing operations - both Query tab and Results tab use this.
 * 
 * @param options - Configuration options for clearing
 */
export async function clearAllSelectionsForWidget(options: {
  widgetId: string
  outputDS: DataSource | null | undefined
  useGraphicsLayer: boolean
  graphicsLayer?: __esri.GraphicsLayer
  mapView?: __esri.MapView | __esri.SceneView
  eventManager?: EventManager
  queryItemConfigId?: string
  onDestroyGraphicsLayer?: () => void
  destroyOutputDataSources?: boolean
}): Promise<void> {
  const {
    widgetId,
    outputDS,
    useGraphicsLayer,
    graphicsLayer,
    mapView,
    eventManager,
    queryItemConfigId,
    onDestroyGraphicsLayer,
    destroyOutputDataSources = false
  } = options

  if (!outputDS) {
    debugLogger.log('TASK', {
      event: 'clearAllSelectionsForWidget-skipped-no-outputDS',
      widgetId,
      timestamp: Date.now()
    })
    return
  }

  try {
    const dsManager = DataSourceManager.getInstance()
    const allDataSources = dsManager.getDataSources()
    const originDataSourcesToClear = new Map<string, DataSource>()

    // Find ALL OutputDataSources for this widget and collect their origin DataSources
    Object.keys(allDataSources).forEach(dsId => {
      if (dsId.startsWith(`${widgetId}_output_`)) {
        const ds = allDataSources[dsId]
        const originDS = getOriginDataSource(ds)
        if (originDS && !originDataSourcesToClear.has(originDS.id)) {
          originDataSourcesToClear.set(originDS.id, originDS)
        }
      }
    })

    debugLogger.log('TASK', {
      event: 'clearAllSelectionsForWidget-multi-source-clearing',
      widgetId,
      originDataSourceCount: originDataSourcesToClear.size,
      originDSIds: Array.from(originDataSourcesToClear.keys()),
      destroyOutputDataSources,
      timestamp: Date.now()
    })

    // Clear selection on EACH unique origin DataSource
    for (const [originDSId, originDS] of originDataSourcesToClear) {
      try {
        if (typeof (originDS as any).selectRecordsByIds === 'function') {
          (originDS as any).selectRecordsByIds([])
          debugLogger.log('TASK', {
            event: 'clearAllSelectionsForWidget-origin-ds-cleared',
            widgetId,
            originDSId,
            timestamp: Date.now()
          })
        }
      } catch (error) {
        debugLogger.log('TASK', {
          event: 'clearAllSelectionsForWidget-origin-ds-clear-failed',
          widgetId,
          originDSId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        })
      }
    }

    // Clear graphics layer
    if (useGraphicsLayer && graphicsLayer && mapView) {
      try {
        cleanupGraphicsLayer(widgetId, mapView)
        onDestroyGraphicsLayer?.()
      } catch (error) {
        debugLogger.log('ERROR', {
          event: 'clearAllSelectionsForWidget-graphics-layer-destroy-failed',
          widgetId,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    // Close popup
    if (mapView?.popup?.visible) {
      mapView.popup.close()
    }

    // Clear selection in outputDS (this also clears the hash via clearSelectionInDataSources)
    await clearSelectionInDataSources(widgetId, outputDS, useGraphicsLayer, graphicsLayer)

    // Dispatch empty selection event (pass 0 so handler does not read stale accumulated count)
    if (eventManager && queryItemConfigId) {
      dispatchSelectionEvent(widgetId, [], outputDS, queryItemConfigId, eventManager, 0)
    }

    // Publish data cleared message
    const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(widgetId, RecordSetChangeType.Remove, [outputDS.id])
    MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
    await MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(widgetId, [], [outputDS.id]))

    // Optionally destroy ALL OutputDataSources (observers already cleared from origin DSs)
    if (destroyOutputDataSources) {
      const outputDataSourceIds: string[] = []
      Object.keys(allDataSources).forEach(dsId => {
        if (dsId.startsWith(`${widgetId}_output_`)) {
          outputDataSourceIds.push(dsId)
        }
      })

      let destroyedCount = 0
      for (const dsId of outputDataSourceIds) {
        try {
          dsManager.destroyDataSource(dsId)
          destroyedCount++
        } catch (err) {
          // Ignore - already destroyed
        }
      }

      debugLogger.log('TASK', {
        event: 'clearAllSelectionsForWidget-all-datasources-destroyed',
        widgetId,
        destroyedCount,
        timestamp: Date.now()
      })
    } else {
      // If not destroying, clear source records on outputDS
      outputDS.clearSourceRecords()
    }

    debugLogger.log('TASK', {
      event: 'clearAllSelectionsForWidget-complete',
      widgetId,
      destroyOutputDataSources,
      timestamp: Date.now()
    })

  } catch (error) {
    debugLogger.log('ERROR', {
      event: 'clearAllSelectionsForWidget-failed',
      widgetId,
      error: error instanceof Error ? error.message : String(error)
    })
    throw error
  }
}

/**
 * Publishes a selection change message for the given records and data sources.
 * 
 * @param widgetId - The widget ID
 * @param records - Array of FeatureDataRecord objects (empty array to clear)
 * @param outputDS - The output data source
 * @param alsoPublishToOutputDS - Whether to also publish a message for outputDS (default: false)
 */
export function publishSelectionMessage(
  widgetId: string,
  records: FeatureDataRecord[],
  outputDS: DataSource | null | undefined,
  alsoPublishToOutputDS: boolean = false
): void {
  if (!outputDS) return
  
  const originDS = getOriginDataSource(outputDS)
  
  if (originDS) {
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(widgetId, records, [originDS.id])
    )
  } else if (alsoPublishToOutputDS) {
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(widgetId, records, [outputDS.id])
    )
  }
  
  // Optionally publish to outputDS as well (for some edge cases)
  if (alsoPublishToOutputDS && originDS) {
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(widgetId, records, [outputDS.id])
    )
  }
}

/**
 * Selects records and publishes the selection message in one call.
 * This is the most common pattern - selecting records and notifying the map.
 * Optionally uses graphics layer for highlighting (independent of layer visibility).
 * 
 * @param widgetId - The widget ID
 * @param outputDS - The output data source
 * @param recordIds - Array of record IDs to select
 * @param records - Array of FeatureDataRecord objects for proper highlighting
 * @param alsoPublishToOutputDS - Whether to also publish a message for outputDS (default: false)
 * @param useGraphicsLayer - Whether to use graphics layer for highlighting (default: false)
 * @param graphicsLayer - Graphics layer instance (required if useGraphicsLayer is true)
 * @param mapView - Map view instance (required if useGraphicsLayer is true)
 * @param skipOriginDSSelection - Skip origin DS selection but still do graphics (default: false)
 */
export async function selectRecordsAndPublish(
  widgetId: string,
  outputDS: DataSource | null | undefined,
  recordIds: string[],
  records: FeatureDataRecord[],
  alsoPublishToOutputDS: boolean = false,
  useGraphicsLayer: boolean = false,
  graphicsLayer?: __esri.GraphicsLayer,
  mapView?: __esri.MapView | __esri.SceneView,
  skipOriginDSSelection: boolean = false
): Promise<void> {
  await selectRecordsInDataSources(outputDS, recordIds, records, useGraphicsLayer, graphicsLayer, mapView, skipOriginDSSelection)
  publishSelectionMessage(widgetId, records, outputDS, alsoPublishToOutputDS)
}

/**
 * Finds the "Clear results" button in the DOM.
 * Used when programmatically triggering the clear action.
 * 
 * @returns The clear button element, or null if not found
 */
export function findClearResultsButton(): HTMLButtonElement | null {
  // Hardened: Prioritize the one in the results header, fallback to any
  return (document.querySelector('.query-result__header button[aria-label="Clear results"]') || 
          document.querySelector('button[aria-label="Clear results"]')) as HTMLButtonElement | null
}

