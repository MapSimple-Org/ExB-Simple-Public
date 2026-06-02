/**
 * Graphics Cleanup Utilities
 *
 * Clear and cleanup functions for graphics layers. Extracted from
 * graphics-layer-utils.ts (Phase 7) to reduce file size and improve
 * separation of concerns.
 *
 * "Clear" functions preserve layers on the map (for clearing results).
 * "Cleanup" functions destroy layers entirely (for widget unmount).
 *
 * All shared state is accessed via GraphicsStateManager singleton —
 * no module-level mutable variables needed.
 *
 * @since 1.19.0-r024.121
 */

// r028.097 (Chunk C of Path 2 Removal): dropped `globalHandleManager` (used only by
// the deleted `cleanupGroupLayer` legend-handle teardown), the
// `getLegendLayerId`/`getGraphicsSublayer` import (those functions were deleted from
// graphics-layer-utils.ts in Chunk C), and the now-unused `Layer` / `FeatureLayer`
// type imports.
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import { graphicsStateManager } from './graphics-state-manager'
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'
import type Graphic from '@arcgis/core/Graphic'

const debugLogger = createQuerySimpleDebugLogger()

// ---------------------------------------------------------------------------
// Clear functions (preserve layers on map)
// ---------------------------------------------------------------------------

/**
 * Clears all highlight graphics from the graphics layer.
 */
export function clearGraphicsLayer(graphicsLayer: GraphicsLayer): void {
  const seq = graphicsStateManager.nextSequence()
  if (!graphicsLayer) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'clearGraphicsLayer-skipped',
      seq,
      reason: 'no-graphics-layer',
      timestamp: Date.now()
    })
    return
  }

  const graphicsCount = graphicsLayer.graphics.length
  graphicsLayer.removeAll()

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'clearGraphicsLayer-complete',
    seq,
    graphicsLayerId: graphicsLayer.id,
    graphicsRemoved: graphicsCount,
    timestamp: Date.now()
  })
}

/**
 * r024.2: Clears all graphics from a GraphicsLayer.
 * r028.104: GroupLayer handling removed with Path 2 (TODO #24). The name is kept
 * for call-site compatibility, but the function now only takes a GraphicsLayer.
 */
export function clearGraphicsLayerOrGroupLayer(
  layer: GraphicsLayer | null | undefined
): void {
  if (!layer) return
  clearGraphicsLayer(layer)
}

/**
 * r024.53: Lightweight unified clear that preserves layers on the map.
 * For GroupLayer: clears graphics and Legend layers but keeps GroupLayer alive.
 * For GraphicsLayer (non-LayerList): clears graphics only.
 *
 * Use this for all "clear results" actions. Reserve cleanupAnyResultLayer()
 * for widget unmount only.
 */
export function clearAnyResultLayerContents(
  widgetId: string,
  mapView: MapView | SceneView
): { clearedGraphicsLayer: boolean } {
  const seq = graphicsStateManager.nextSequence()
  const result = { clearedGraphicsLayer: false }

  // r028.096 (Chunk B of Path 2 Removal): the Path 2 GroupLayer-lookup branch
  // was here. It searched for `querysimple-results-${widgetId}` and called
  // `clearGroupLayerContents` when found. Both are gone — Path 2 no longer
  // creates that GroupLayer, and `clearGroupLayerContents` was deleted in
  // Chunk C. r028.099 (Phase 4): the always-false `clearedGroupLayer` return
  // field is now dropped along with the two callers that logged it.

  // Check for GraphicsLayer (regular mode)
  const graphicsLayerId = `querysimple-highlight-${widgetId}`
  const graphicsLayer = mapView.map.layers.find(layer => layer.id === graphicsLayerId) as GraphicsLayer
  if (graphicsLayer) {
    clearGraphicsLayerOrGroupLayer(graphicsLayer)
    result.clearedGraphicsLayer = true
  }

  // r025.016: Also clear buffer preview graphics on explicit clear (not destroy — just removeAll).
  // r028.096 (Chunk B of Path 2 Removal): the `if (!result.clearedGroupLayer)` gate was here.
  // Pre-Phase-1 it skipped this block when Path 2's GroupLayer cleanup had already
  // cleared the buffer as a child of that group. Path 2 cleanup never runs anymore,
  // so the gate was always-true; removed for clarity. Path 3 buffer lives inside
  // `querysimple-fl-*` GroupLayer and is cleared by Path 3's own logic; the
  // `findLayerById` lookup below targets the standalone `querysimple-buffer-*`
  // layer used by Path 1, returns undefined under Path 3, no-ops.
  // Note: Panel close/reopen is handled separately by selection-restoration-manager (r025.020).
  const bufferLayerId = `querysimple-buffer-${widgetId}`
  const bufferLayer = mapView.map.findLayerById(bufferLayerId) as GraphicsLayer
  if (bufferLayer) {
    const bufferGraphicsCount = bufferLayer.graphics?.length || 0
    bufferLayer.removeAll()

    if (bufferGraphicsCount > 0) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'buffer-preview-cleared-on-explicit-clear',
        seq,
        widgetId,
        bufferLayerId,
        graphicsCleared: bufferGraphicsCount,
        timestamp: Date.now()
      })
    }
  }

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'clearAnyResultLayerContents-complete',
    seq,
    widgetId,
    clearedGraphicsLayer: result.clearedGraphicsLayer,
    timestamp: Date.now()
  })

  return result
}

// ---------------------------------------------------------------------------
// Cleanup functions (destroy layers — widget unmount only)
// ---------------------------------------------------------------------------

/**
 * Removes the graphics layer from the map and cleans up references.
 * r021.16: Now calls destroy() to free internal buffers and prevent memory leaks.
 */
export function cleanupGraphicsLayer(
  widgetId: string,
  mapView: MapView | SceneView
): void {
  const seq = graphicsStateManager.nextSequence()
  const layerId = `querysimple-highlight-${widgetId}`

  try {
    const graphicsLayer = mapView.map.layers.find(layer => layer.id === layerId) as GraphicsLayer
    if (graphicsLayer) {
      const graphicsCount = graphicsLayer.graphics.length

      // r024.35: Null graphic properties before removal to break circular references
      graphicsLayer.graphics.forEach((graphic: Graphic) => {
        try {
          graphic.popupTemplate = null
          graphic.symbol = null
          graphic.geometry = null
        } catch (e) { /* Ignore - some properties may be read-only */ }
      })

      // Clear all graphics
      graphicsLayer.removeAll()

      // Remove layer from map
      mapView.map.remove(graphicsLayer)

      // r021.16: Destroy the layer to free internal buffers (JSArrayBufferData)
      // This prevents memory leaks from geometry buffers accumulating with each query
      graphicsLayer.destroy()

      debugLogger.log('GRAPHICS-LAYER', {
        event: 'cleanupGraphicsLayer-complete',
        seq,
        widgetId,
        layerId,
        graphicsCountBeforeCleanup: graphicsCount,
        graphicPropertiesNulled: true,
        destroyed: true,
        timestamp: Date.now()
      })
    } else {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'cleanupGraphicsLayer-not-found',
        seq,
        widgetId,
        layerId,
        timestamp: Date.now()
      })
    }

    // r025.013: Clean up buffer preview layer (no watch handle in highlight-only mode)
    const bufferLayerId = `querysimple-buffer-${widgetId}`
    const bufferLayer = mapView.map.findLayerById(bufferLayerId) as GraphicsLayer
    if (bufferLayer) {
      bufferLayer.removeAll()
      mapView.map.remove(bufferLayer)
      bufferLayer.destroy()

      debugLogger.log('GRAPHICS-LAYER', {
        event: 'buffer-preview-layer-cleaned',
        seq,
        widgetId,
        bufferLayerId,
        timestamp: Date.now()
      })
    }

    // r028.095 (Chunk A of Path 2 Removal): removed the
    // `graphicsStateManager.deleteMapView(widgetId)` call. This was the
    // companion teardown for the `setMapView` call in addHighlightGraphics
    // (also removed in Chunk A). Both existed solely to feed Path 2's legend-FL
    // visibility watcher (r024.59). With that watcher dying in Chunk B/C,
    // these calls are pre-emptively orphaned so `_mapViewCache` can be
    // deleted cleanly in Chunk D.

    // r024.61: Clear creation lock so next createOrGetGraphicsLayer starts fresh
    graphicsStateManager.deleteGraphicsLayerCreation(layerId)
  } catch (error) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'cleanupGraphicsLayer-error',
      seq,
      widgetId,
      layerId,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now()
    })
  }
}

/**
 * r024.20: Unified cleanup that handles both GraphicsLayer and GroupLayer.
 * Checks for existence of each layer type and destroys whichever exists.
 *
 * r024.53: Now reserved for WIDGET UNMOUNT only. For clearing results,
 * use clearAnyResultLayerContents() instead.
 *
 * @param widgetId - Widget ID
 * @param mapView - Map view instance
 * @returns Object indicating which layer type was cleaned up
 */
export function cleanupAnyResultLayer(
  widgetId: string,
  mapView: MapView | SceneView
): { cleanedGraphicsLayer: boolean } {
  const seq = graphicsStateManager.nextSequence()
  const result = { cleanedGraphicsLayer: false }

  // r028.096 (Chunk B of Path 2 Removal): the Path 2 GroupLayer-lookup branch
  // was here. It looked for `querysimple-results-${widgetId}` and called
  // `cleanupGroupLayer` when found. Path 2 no longer creates that GroupLayer
  // and `cleanupGroupLayer` itself was deleted in Chunk C. r028.099 (Phase 4):
  // the always-false `cleanedGroupLayer` return field is now dropped (it had no
  // external readers).

  // Check for GraphicsLayer (regular mode)
  // r024.43: FIX - ID was wrong (querysimple-graphics- vs querysimple-highlight-)
  const graphicsLayerId = `querysimple-highlight-${widgetId}`
  const graphicsLayer = mapView.map.layers.find(layer => layer.id === graphicsLayerId) as GraphicsLayer
  if (graphicsLayer) {
    cleanupGraphicsLayer(widgetId, mapView)
    result.cleanedGraphicsLayer = true
  }

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'cleanupAnyResultLayer-complete',
    seq,
    widgetId,
    cleanedGraphicsLayer: result.cleanedGraphicsLayer,
    timestamp: Date.now()
  })

  return result
}
