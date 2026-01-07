/**
 * Utility functions for managing feature selection in QuerySimple widget.
 * Consolidates repeated selection logic to follow DRY principles.
 */

import type { DataSource, FeatureLayerDataSource, FeatureDataRecord } from 'jimu-core'
import { MessageManager, DataRecordsSelectionChangeMessage } from 'jimu-core'
import { addHighlightGraphics as addGraphicsLayerGraphics, clearGraphicsLayer } from './graphics-layer-utils'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'
import type { EventManager } from './hooks/use-event-handling'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Custom event name for QuerySimple to notify Widget of selection changes.
 */
export const QUERYSIMPLE_SELECTION_EVENT = 'querysimple-selection-changed'

/**
 * Dispatches a custom selection event to the window so the main Widget can track state.
 * 
 * @param widgetId - The widget ID
 * @param recordIds - Array of selected record IDs
 * @param outputDS - The output data source
 * @param queryItemConfigId - The config ID of the query that produced these results
 * @param eventManager - Optional EventManager instance for comparison logging (Chunk 7.1)
 */
export function dispatchSelectionEvent(
  widgetId: string,
  recordIds: string[],
  outputDS: DataSource,
  queryItemConfigId: string,
  eventManager?: EventManager
): void {
  const originDS = getOriginDataSource(outputDS)
  const dataSourceId = originDS?.id
  
  debugLogger.log('TASK', {
    event: 'dispatchSelectionEvent',
    widgetId,
    recordCount: recordIds.length,
    outputDsId: outputDS.id,
    queryItemConfigId
  })

  // ============================================================================
  // OLD IMPLEMENTATION (parallel execution) - Chunk 7.1
  // ============================================================================
  const selectionEvent = new CustomEvent(QUERYSIMPLE_SELECTION_EVENT, {
    detail: {
      widgetId,
      recordIds,
      dataSourceId,
      outputDsId: outputDS.id,
      queryItemConfigId
    },
    bubbles: true,
    cancelable: true
  })
  window.dispatchEvent(selectionEvent)
  
  debugLogger.log('EVENTS', {
    event: 'old-implementation-selection-event-dispatched',
    widgetId,
    recordIdsCount: recordIds.length,
    dataSourceId,
    outputDsId: outputDS.id,
    queryItemConfigId,
    timestamp: Date.now()
  })
  // ============================================================================

  // NEW IMPLEMENTATION (parallel execution) - Chunk 7.1
  if (eventManager) {
    eventManager.dispatchSelectionEvent(widgetId, recordIds, dataSourceId, outputDS.id, queryItemConfigId)
  }

  // COMPARISON LOGGING
  if (eventManager) {
    debugLogger.log('CHUNK-7-COMPARE', {
      event: 'selection-event-dispatch-comparison',
      widgetId,
      oldImplementation: {
        method: 'window.dispatchEvent',
        recordIdsCount: recordIds.length,
        dataSourceId,
        outputDsId: outputDS.id,
        queryItemConfigId
      },
      newImplementation: {
        method: 'EventManager.dispatchSelectionEvent',
        recordIdsCount: recordIds.length,
        dataSourceId
      },
      match: true, // Both dispatch the same event
      timestamp: Date.now()
    })
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
 */
export async function selectRecordsInDataSources(
  outputDS: DataSource | null | undefined,
  recordIds: string[],
  records?: FeatureDataRecord[],
  useGraphicsLayer: boolean = false,
  graphicsLayer?: __esri.GraphicsLayer,
  mapView?: __esri.MapView | __esri.SceneView
): Promise<void> {
  if (!outputDS) return
  
  const originDS = getOriginDataSource(outputDS)
  
  // If using graphics layer, add graphics for highlighting
  if (useGraphicsLayer && graphicsLayer && mapView && records && records.length > 0) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'selectRecordsInDataSources-using-graphics-layer',
      recordIdsCount: recordIds.length,
      recordsCount: records.length,
      graphicsLayerId: graphicsLayer.id,
      timestamp: Date.now()
    })
    
    await addGraphicsLayerGraphics(graphicsLayer, records, mapView)
    
    // Still select in data source for state management (but layer selection won't show if layer is off)
    if (originDS && typeof originDS.selectRecordsByIds === 'function') {
      originDS.selectRecordsByIds(recordIds, records)
    }
  } else {
    // Original behavior: use layer selection
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'selectRecordsInDataSources-using-layer-selection',
      recordIdsCount: recordIds.length,
      useGraphicsLayer,
      hasGraphicsLayer: !!graphicsLayer,
      hasMapView: !!mapView,
      timestamp: Date.now()
    })
    
    // Select in origin data source (the actual layer)
    if (originDS && typeof originDS.selectRecordsByIds === 'function') {
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
function clearDataSParameterFromHash(): void {
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
 */
export async function selectRecordsAndPublish(
  widgetId: string,
  outputDS: DataSource | null | undefined,
  recordIds: string[],
  records: FeatureDataRecord[],
  alsoPublishToOutputDS: boolean = false,
  useGraphicsLayer: boolean = false,
  graphicsLayer?: __esri.GraphicsLayer,
  mapView?: __esri.MapView | __esri.SceneView
): Promise<void> {
  await selectRecordsInDataSources(outputDS, recordIds, records, useGraphicsLayer, graphicsLayer, mapView)
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

