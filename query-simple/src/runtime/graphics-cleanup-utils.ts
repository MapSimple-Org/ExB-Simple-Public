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

import { createQuerySimpleDebugLogger, globalHandleManager } from 'widgets/shared-code/mapsimple-common'
import { graphicsStateManager } from './graphics-state-manager'
import { getLegendLayerId, getGraphicsSublayer } from './graphics-layer-utils'

const debugLogger = createQuerySimpleDebugLogger()

// ---------------------------------------------------------------------------
// Clear functions (preserve layers on map)
// ---------------------------------------------------------------------------

/**
 * Clears all highlight graphics from the graphics layer.
 */
export function clearGraphicsLayer(graphicsLayer: __esri.GraphicsLayer): void {
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
 * r024.2: Clears all graphics from a GraphicsLayer or GroupLayer.
 * For GroupLayer, clears each sublayer.
 * r024.15: Also removes all Legend FeatureLayers when clearing a GroupLayer.
 */
export function clearGraphicsLayerOrGroupLayer(
  layer: __esri.GraphicsLayer | __esri.GroupLayer | null | undefined
): void {
  if (!layer) return
  if ((layer as __esri.Layer).type === 'group') {
    const gl = layer as __esri.GroupLayer
    let totalRemoved = 0

    // r024.15: Find and remove Legend FeatureLayers first
    const legendLayersToRemove: __esri.Layer[] = []
    gl.layers.forEach((sublayer: __esri.Layer) => {
      if (sublayer.id.endsWith('-legend')) {
        legendLayersToRemove.push(sublayer)
      }
    })
    legendLayersToRemove.forEach(legendLayer => {
      gl.layers.remove(legendLayer)
      legendLayer.destroy()
    })

    // Clear graphics from GraphicsLayer sublayers
    gl.layers.forEach((sublayer: __esri.Layer) => {
      const glSub = sublayer as __esri.GraphicsLayer
      if (glSub.graphics) {
        totalRemoved += glSub.graphics.length
        glSub.removeAll()
      }
    })

    debugLogger.log('GRAPHICS-LAYER', {
      event: 'clearGraphicsLayerOrGroupLayer-complete',
      graphicsLayerId: layer.id,
      layerType: 'group',
      graphicsRemoved: totalRemoved,
      legendLayersRemoved: legendLayersToRemove.length,
      timestamp: Date.now()
    })
  } else {
    clearGraphicsLayer(layer as __esri.GraphicsLayer)
  }
}

/**
 * r024.53: Lightweight clear that preserves the GroupLayer on the map.
 * r024.54: Also preserves Legend FeatureLayers (hides them via legendEnabled = false
 * instead of destroying). Destroying Legend FLs orphans ESRI reactive DOM trees.
 *
 * Clears graphics from the GraphicsLayer sublayer and hides Legend FLs from
 * the legend display. Does NOT remove or destroy any layers.
 *
 * Use this for all "clear results" actions. Reserve cleanupGroupLayer()
 * for widget unmount only.
 */
export function clearGroupLayerContents(
  widgetId: string,
  mapView: __esri.MapView | __esri.SceneView
): boolean {
  const seq = graphicsStateManager.nextSequence()
  const layerId = `querysimple-results-${widgetId}`

  const groupLayer = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GroupLayer
  if (!groupLayer) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'clearGroupLayerContents-not-found',
      seq,
      widgetId,
      layerId,
      timestamp: Date.now()
    })
    return false
  }

  // r024.54: Hide Legend FeatureLayers instead of destroying them.
  // Destroying triggers ESRI reactive teardown that creates orphaned DOM trees.
  // Keep them alive so ESRI can reuse its internal infrastructure on the next query.
  const geometryTypes = ['point', 'polyline', 'polygon']
  let legendLayersHidden = 0
  geometryTypes.forEach(geoType => {
    const legendLayerId = getLegendLayerId(layerId, geoType)
    const legendLayer = groupLayer.layers.find(l => l.id === legendLayerId) as __esri.FeatureLayer
    if (legendLayer) {
      legendLayer.legendEnabled = false
      legendLayersHidden++
    }
  })

  // Clear graphics from the single GraphicsLayer sublayer
  let graphicsCleared = 0
  const gfxLayer = getGraphicsSublayer(groupLayer)
  if (gfxLayer && gfxLayer.graphics) {
    graphicsCleared = gfxLayer.graphics.length
    gfxLayer.removeAll()
  }

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'clearGroupLayerContents-complete',
    seq,
    widgetId,
    layerId,
    graphicsCleared,
    legendLayersHidden,
    groupLayerPreserved: true,
    legendLayersPreserved: true,
    timestamp: Date.now()
  })

  return true
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
  mapView: __esri.MapView | __esri.SceneView
): { clearedGraphicsLayer: boolean; clearedGroupLayer: boolean } {
  const seq = graphicsStateManager.nextSequence()
  const result = { clearedGraphicsLayer: false, clearedGroupLayer: false }

  // Check for GroupLayer (LayerList mode)
  const groupLayerId = `querysimple-results-${widgetId}`
  const groupLayer = mapView.map.layers.find(layer => layer.id === groupLayerId) as __esri.GroupLayer
  if (groupLayer) {
    result.clearedGroupLayer = clearGroupLayerContents(widgetId, mapView)
  }

  // Check for GraphicsLayer (regular mode)
  const graphicsLayerId = `querysimple-highlight-${widgetId}`
  const graphicsLayer = mapView.map.layers.find(layer => layer.id === graphicsLayerId) as __esri.GraphicsLayer
  if (graphicsLayer) {
    clearGraphicsLayerOrGroupLayer(graphicsLayer)
    result.clearedGraphicsLayer = true
  }

  // r025.016: Also clear buffer preview graphics on explicit clear (not destroy — just removeAll).
  // In GroupLayer mode the buffer is a child of the GroupLayer, so
  // clearGroupLayerContents already handled it. In GraphicsLayer mode
  // the buffer is standalone on the map and needs explicit clearing.
  // Note: Panel close/reopen is handled separately by selection-restoration-manager (r025.020).
  if (!result.clearedGroupLayer) {
    const bufferLayerId = `querysimple-buffer-${widgetId}`
    const bufferLayer = mapView.map.findLayerById(bufferLayerId) as __esri.GraphicsLayer
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
  }

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'clearAnyResultLayerContents-complete',
    seq,
    widgetId,
    clearedGraphicsLayer: result.clearedGraphicsLayer,
    clearedGroupLayer: result.clearedGroupLayer,
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
  mapView: __esri.MapView | __esri.SceneView
): void {
  const seq = graphicsStateManager.nextSequence()
  const layerId = `querysimple-highlight-${widgetId}`

  try {
    const graphicsLayer = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GraphicsLayer
    if (graphicsLayer) {
      const graphicsCount = graphicsLayer.graphics.length

      // r024.35: Null graphic properties before removal to break circular references
      graphicsLayer.graphics.forEach((graphic: __esri.Graphic) => {
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
    const bufferLayer = mapView.map.findLayerById(bufferLayerId) as __esri.GraphicsLayer
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

    // r024.59: Clear cached mapView reference for this widget
    graphicsStateManager.deleteMapView(widgetId)

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
 * r024.2: Removes the GroupLayer (LayerList results) from the map.
 * r024.22: Cleans up Legend FeatureLayer visibility watch handles.
 * r024.56: Removal protection listener deleted; Remove action is now disabled
 * at the source via __exb_layer_from_runtime = false.
 *
 * r024.53: Now reserved for WIDGET UNMOUNT only. For clearing results,
 * use clearGroupLayerContents() instead to avoid the +58 MB destroy/recreate cost.
 */
export function cleanupGroupLayer(
  widgetId: string,
  mapView: __esri.MapView | __esri.SceneView
): void {
  const seq = graphicsStateManager.nextSequence()
  const layerId = `querysimple-results-${widgetId}`

  try {
    // r024.22: Clean up all legend visibility watch handles for this GroupLayer
    // r024.31: Also remove from globalHandleManager
    const geometryTypes = ['point', 'polyline', 'polygon']
    let watchHandlesCleaned = 0
    let globalHandlesRemoved = 0
    geometryTypes.forEach(geoType => {
      const legendLayerId = getLegendLayerId(layerId, geoType)
      const watchHandle = graphicsStateManager.getLegendVisibilityHandle(legendLayerId)
      if (watchHandle) {
        watchHandle.remove()
        graphicsStateManager.deleteLegendVisibilityHandle(legendLayerId)
        watchHandlesCleaned++
      }

      // r024.31: Also remove from globalHandleManager
      const handleId = graphicsStateManager.getLegendVisibilityHandleId(legendLayerId)
      if (handleId) {
        globalHandleManager.remove(widgetId, handleId)
        graphicsStateManager.deleteLegendVisibilityHandleId(legendLayerId)
        globalHandlesRemoved++
      }
    })

    // r025.015: Buffer visibility watcher removed — buffer layer is now INSIDE
    // the GroupLayer, so groupLayer.destroy() below destroys it automatically.
    // No explicit buffer cleanup needed in this path.

    const groupLayer = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GroupLayer
    if (groupLayer) {
      let graphicsCount = 0
      // r024.35: Null graphic properties before removal to break circular references
      groupLayer.layers.forEach((sublayer: __esri.Layer) => {
        const glSub = sublayer as __esri.GraphicsLayer
        if (glSub.graphics) {
          glSub.graphics.forEach((graphic: __esri.Graphic) => {
            graphicsCount++
            // Break potential circular references that prevent GC
            try {
              graphic.popupTemplate = null
              graphic.symbol = null
              graphic.geometry = null
            } catch (e) { /* Ignore - some properties may be read-only */ }
          })
          glSub.removeAll()
        }
      })
      mapView.map.remove(groupLayer)
      groupLayer.destroy()

      debugLogger.log('GRAPHICS-LAYER', {
        event: 'cleanupGroupLayer-complete',
        seq,
        widgetId,
        layerId,
        graphicsCountBeforeCleanup: graphicsCount,
        watchHandlesCleaned,
        globalHandlesRemoved,
        destroyed: true,
        timestamp: Date.now()
      })
    } else {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'cleanupGroupLayer-not-found',
        seq,
        widgetId,
        layerId,
        watchHandlesCleaned,
        globalHandlesRemoved,
        timestamp: Date.now()
      })
    }
  } catch (error) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'cleanupGroupLayer-error',
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
  mapView: __esri.MapView | __esri.SceneView
): { cleanedGraphicsLayer: boolean; cleanedGroupLayer: boolean } {
  const seq = graphicsStateManager.nextSequence()
  const result = { cleanedGraphicsLayer: false, cleanedGroupLayer: false }

  // Check for GroupLayer (LayerList mode)
  const groupLayerId = `querysimple-results-${widgetId}`
  const groupLayer = mapView.map.layers.find(layer => layer.id === groupLayerId) as __esri.GroupLayer
  if (groupLayer) {
    cleanupGroupLayer(widgetId, mapView)
    result.cleanedGroupLayer = true
  }

  // Check for GraphicsLayer (regular mode)
  // r024.43: FIX - ID was wrong (querysimple-graphics- vs querysimple-highlight-)
  const graphicsLayerId = `querysimple-highlight-${widgetId}`
  const graphicsLayer = mapView.map.layers.find(layer => layer.id === graphicsLayerId) as __esri.GraphicsLayer
  if (graphicsLayer) {
    cleanupGraphicsLayer(widgetId, mapView)
    result.cleanedGraphicsLayer = true
  }

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'cleanupAnyResultLayer-complete',
    seq,
    widgetId,
    cleanedGraphicsLayer: result.cleanedGraphicsLayer,
    cleanedGroupLayer: result.cleanedGroupLayer,
    timestamp: Date.now()
  })

  return result
}
