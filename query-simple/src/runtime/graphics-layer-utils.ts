/**
 * Utility functions for managing graphics layer highlighting in QuerySimple widget.
 * Provides highlighting that works independently of layer visibility.
 */

import type { DataSource, FeatureDataRecord } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger, widgetConfigManager, globalHandleManager } from 'widgets/shared-code/mapsimple-common'
import { graphicsStateManager } from './graphics-state-manager'
import type Graphic from '@arcgis/core/Graphic'
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'
import type SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol'
import type SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol'
import type SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol'
import type Symbol from '@arcgis/core/symbols/Symbol'

const debugLogger = createQuerySimpleDebugLogger()

// r028.097 (Chunk C of Path 2 Removal): removed the `FeatureLayerModule` cache —
// it was used only by the deleted `createLegendFeatureLayer` (Path 2 empty-FL proxy).

/**
 * Gets the default highlight symbol based on geometry type.
 * 
 * r022.92: Uses HighlightConfigManager to get widget-specific symbology configuration.
 * Falls back to hardcoded defaults if config not available.
 * 
 * @param geometryType - The geometry type ('point', 'polyline', 'polygon', etc.)
 * @param widgetId - The widget ID to retrieve config for
 * @returns Symbol configured with widget-specific highlighting
 */
function getDefaultHighlightSymbol(
  geometryType: string,
  widgetId: string
): Symbol {
  // r022.92: Get symbology from HighlightConfigManager (per-widget config)
  const fillColorRGB = widgetConfigManager.getFillColor(widgetId)
  const fillOpacity = widgetConfigManager.getFillOpacity(widgetId)
  const outlineColorRGB = widgetConfigManager.getOutlineColor(widgetId)
  const outlineOpacity = widgetConfigManager.getOutlineOpacity(widgetId)
  const outlineWidth = widgetConfigManager.getOutlineWidth(widgetId)
  const pointSize = widgetConfigManager.getPointSize(widgetId)
  const pointOutlineWidth = widgetConfigManager.getPointOutlineWidth(widgetId)
  const pointStyle = widgetConfigManager.getPointStyle(widgetId)

  // r028.060: SETTINGS log for graphics symbology
  debugLogger.log('SETTINGS', {
    event: 'singletonConfigRead',
    source: 'graphics-layer-utils',
    widgetId,
    geometryType,
    fillColor: fillColorRGB,
    fillOpacity,
    outlineColor: outlineColorRGB,
    outlineOpacity,
    outlineWidth,
    pointSize,
    pointOutlineWidth,
    pointStyle
  })

  // Build color arrays with appropriate opacity
  const fillColorWithAlpha = [...fillColorRGB, fillOpacity] as [number, number, number, number]
  const outlineColorWithAlpha = [...outlineColorRGB, outlineOpacity] as [number, number, number, number]
  const lineColorWithAlpha = [...outlineColorRGB, outlineOpacity] as [number, number, number, number]
  
  // DIAGNOSTIC: Log symbology being used (r022.92: now from HighlightConfigManager)
  debugLogger.log('GRAPHICS-LAYER', {
    event: 'symbology-calculation',
    geometryType,
    widgetId,
    source: 'HighlightConfigManager',
    configValues: {
      fillColorRGB,
      fillOpacity,
      fillColorWithAlpha,
      outlineColorRGB,
      outlineOpacity,
      outlineColorWithAlpha,
      outlineWidth,
      pointSize,
      pointOutlineWidth,
      pointStyle
    },
    symbolToCreate: geometryType === 'polygon' ? {
      type: 'simple-fill',
      fillColor: fillColorWithAlpha,
      outlineColor: outlineColorWithAlpha,
      outlineWidth
    } : geometryType === 'polyline' ? {
      type: 'simple-line',
      lineColor: lineColorWithAlpha,
      width: outlineWidth
    } : {
      type: 'simple-marker',
      color: outlineColorWithAlpha,
      size: pointSize,
      style: pointStyle,
      outlineWidth: pointOutlineWidth
    },
    note: 'r022.92: Using HighlightConfigManager for per-widget configuration',
    timestamp: Date.now()
  })
  
  switch (geometryType) {
    case 'point':
    case 'multipoint':
      return {
        type: 'simple-marker',
        style: pointStyle,
        color: fillColorWithAlpha, // Fill color for marker interior
        outline: {
          color: outlineColorWithAlpha,
          width: pointOutlineWidth
        },
        size: pointSize
      } as unknown as SimpleMarkerSymbol
      
    case 'polyline':
      return {
        type: 'simple-line',
        color: lineColorWithAlpha,
        width: outlineWidth
      } as unknown as SimpleLineSymbol
      
    case 'polygon':
    case 'multipolygon':
      return {
        type: 'simple-fill',
        color: fillColorWithAlpha,
        outline: {
          color: outlineColorWithAlpha,
          width: outlineWidth
        }
      } as unknown as SimpleFillSymbol
      
    default:
      // Fallback to polygon symbol
      return {
        type: 'simple-fill',
        color: fillColorWithAlpha,
        outline: {
          color: outlineColorWithAlpha,
          width: outlineWidth
        }
      } as unknown as SimpleFillSymbol
  }
}

// All other shared state (creationInProgress, graphicsLayerCreationInProgress,
// legendVisibilityHandles, legendVisibilityHandleIds, mapViewCache) is now
// centralized in GraphicsStateManager singleton (r024.120).

/**
 * r024.9: Gets total graphics count from a GraphicsLayer.
 * r028.104: GroupLayer branch removed with Path 2 (TODO #24) — only Path 1's
 * GraphicsLayer reaches this now.
 */
export function getGraphicsCountFromLayer(layer: GraphicsLayer | null | undefined): number {
  if (!layer) return 0
  return layer.graphics?.length || 0
}

/**
 * r024.9: Iterates graphics in a GraphicsLayer.
 * r028.104: GroupLayer branch removed with Path 2 (TODO #24).
 */
export function forEachGraphicInLayer(
  layer: GraphicsLayer | null | undefined,
  callback: (graphic: Graphic) => void
): void {
  if (!layer) return
  layer.graphics?.forEach(callback)
}

/**
 * Creates or gets an existing graphics layer for the widget.
 * Uses a unique ID based on widget ID to ensure one layer per widget.
 *
 * r024.61: Uses creation lock to prevent duplicate layers from race conditions.
 * Without this, concurrent calls (e.g. from handleDataSourceCreated + initializeGraphicsLayer)
 * both pass the "does it exist?" check before either adds to the map, creating two layers
 * with the same ID. The widget ref ends up pointing at the wrong one.
 */
export async function createOrGetGraphicsLayer(
  widgetId: string,
  mapView: MapView | SceneView
): Promise<GraphicsLayer | null> {
  const seq = graphicsStateManager.nextSequence()
  const layerId = `querysimple-highlight-${widgetId}`

  // r024.61: If creation is already in progress, wait for it instead of creating a duplicate
  if (graphicsStateManager.hasGraphicsLayerCreation(layerId)) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetGraphicsLayer-waiting-for-in-progress',
      seq,
      widgetId,
      layerId,
      timestamp: Date.now()
    })
    return graphicsStateManager.getGraphicsLayerCreation(layerId)!
  }

  // Check for existing layer first (fast path)
  const existingLayer = mapView.map.layers.find(layer => layer.id === layerId) as GraphicsLayer
  if (existingLayer) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetGraphicsLayer-found-existing',
      seq,
      widgetId,
      layerId,
      layerUid: (existingLayer as any).uid,
      graphicsCount: existingLayer.graphics?.length ?? 'N/A',
      timestamp: Date.now()
    })
    return existingLayer
  }

  // r024.61: Lock creation and delegate to internal function
  const creationPromise = createGraphicsLayerInternal(widgetId, mapView, layerId, seq)
  graphicsStateManager.setGraphicsLayerCreation(layerId, creationPromise)

  try {
    return await creationPromise
  } finally {
    graphicsStateManager.deleteGraphicsLayerCreation(layerId)
  }
}

/**
 * r024.61: Internal function that actually creates the GraphicsLayer.
 * Separated to allow the creation lock to work properly.
 */
async function createGraphicsLayerInternal(
  widgetId: string,
  mapView: MapView | SceneView,
  layerId: string,
  seq: number
): Promise<GraphicsLayer | null> {
  try {
    // Load GraphicsLayer module
    const [GraphicsLayer] = await loadArcGISJSAPIModules(['esri/layers/GraphicsLayer'])

    // Double-check after async load (another call may have completed while we awaited)
    const existingLayer = mapView.map.layers.find(layer => layer.id === layerId) as GraphicsLayer
    if (existingLayer) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'createOrGetGraphicsLayer-found-existing-after-lock',
        seq,
        widgetId,
        layerId,
        layerUid: (existingLayer as any).uid,
        timestamp: Date.now()
      })
      return existingLayer
    }

    const graphicsLayer = new GraphicsLayer({
      id: layerId,
      title: `QuerySimple Highlights (${widgetId})`,
      listMode: 'hide',
      visible: true
    })

    const currentLayerCount = mapView.map.layers.length
    mapView.map.add(graphicsLayer, currentLayerCount)

    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetGraphicsLayer-created',
      seq,
      widgetId,
      layerId,
      layerUid: (graphicsLayer as any).uid,
      timestamp: Date.now()
    })

    return graphicsLayer
  } catch (error) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetGraphicsLayer-error',
      seq,
      widgetId,
      layerId,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now()
    })
    return null
  }
}

// r027.091: createOrGetHoverLayer and createHoverLayerInternal removed.
// Hover pins moved back to mapView.graphics (always-on-top overlay) to fix
// z-order issues where results layers landed above the per-widget hover layer.
// Cross-widget safety is maintained by scoped per-graphic cleanup (never
// removeAll). See docs/bugs/HOVER-PIN-CROSS-WIDGET-BUG.md.

/**
 * Adds highlight graphics to the graphics layer or GroupLayer sublayers.
 * r024.0: When layer is GroupLayer, routes each graphic to Points/Lines/Polygons sublayer by geometry type.
 */
export async function addHighlightGraphics(
  graphicsLayer: GraphicsLayer,
  records: FeatureDataRecord[],
  mapView: MapView | SceneView
): Promise<void> {
  const seq = graphicsStateManager.nextSequence()
  if (!graphicsLayer || !records || records.length === 0) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'addHighlightGraphics-skipped',
      seq,
      reason: !graphicsLayer ? 'no-graphics-layer' : 'no-records',
      recordsCount: records?.length || 0,
      timestamp: Date.now()
    })
    return
  }

  // r028.096 (Chunk B of Path 2 Removal): the Path 2 GroupLayer branch (walking
  // sublayers, routing graphics by geometry type) is gone; only Path 1's plain
  // GraphicsLayer reaches this. r028.104: signature narrowed to GraphicsLayer.
  const gl = graphicsLayer

  // r022.102: Move graphics layer to absolute end AFTER native selection creates highlight layers
  const allLayers = mapView.map.layers.toArray()
  const currentIndex = allLayers.findIndex(l => l.id === gl.id)
  const targetIndex = allLayers.length - 1

  if (currentIndex !== -1 && currentIndex < targetIndex) {
    mapView.map.reorder(gl, targetIndex)
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'r022-102-moved-to-top',
      seq,
      graphicsLayerId: gl.id,
      oldIndex: currentIndex,
      newIndex: targetIndex,
      note: 'Moved graphics layer to absolute end so purple renders on top of native selection',
      timestamp: Date.now()
    })
  }

  let existingGraphicsCount = 0
  const existingRecordIds: string[] = []
  const existingRecordIdSet = new Set<string>()

  existingGraphicsCount = gl.graphics.length
  gl.graphics.forEach((graphic: Graphic) => {
    const recordId = graphic.attributes?.recordId
    if (recordId) {
      existingRecordIds.push(recordId)
      existingRecordIdSet.add(recordId)
    }
  })

  // Load Graphic module
  const [Graphic] = await loadArcGISJSAPIModules(['esri/Graphic'])

  let addedCount = 0
  let skippedCount = 0
  let duplicateCount = 0
  const addedRecordIds: string[] = []
  const skippedRecordIds: string[] = []
  const duplicateRecordIds: string[] = []

  // Extract widgetId from graphics layer ID. r028.096 (Chunk B of Path 2 Removal):
  // simplified regex from `^querysimple-(?:highlight|results)-` to Path-1-only.
  // The `|results-` alternative matched Path 2's GroupLayer ID prefix; no Path 2
  // GroupLayer ever flows through here anymore.
  const widgetId = gl.id.replace(/^querysimple-highlight-/, '')

  // r028.095 (Chunk A of Path 2 Removal): removed the `graphicsStateManager.setMapView(widgetId, mapView)`
  // call that lived here. Its sole purpose was to feed the Path 2 legend-FL
  // visibility watcher (r024.59) so it could close the popup when a user
  // toggled the empty-FL legend layer off in the LayerList. That watcher is
  // Path 2 infrastructure being deleted in Chunk B/C. Stripping the call now
  // unblocks the Chunk D deletion of `_mapViewCache` itself by removing the
  // last Path-1 caller. Path 1 highlighting does not need the cached mapView.

  // r021.90: No duplicate checking - caller clears the layer before calling this function
  // This ensures we always add the exact set of records provided
  records.forEach(record => {
    try {
      // r027.000: ExB 1.20 — coerce getId() to string (now returns string | number)
      const recordId = String(record.getId())

      const graphic = record.feature as Graphic
      if (!graphic || !graphic.geometry) {
        skippedCount++
        skippedRecordIds.push(recordId)
        return
      }

      // Get geometry type from graphic
      const geometryType = graphic.geometry.type

      // Create symbol using HighlightConfigManager (r022.92)
      const symbol = getDefaultHighlightSymbol(geometryType, widgetId)

      // r021.90: Store queryConfigId to distinguish between records with same ID from different queries
      const queryConfigId = record.feature?.attributes?.__queryConfigId || ''

      // Create new graphic with highlight symbol
      const highlightGraphic = new Graphic({
        geometry: graphic.geometry,
        symbol: symbol,
        attributes: {
          recordId: recordId,
          queryConfigId: queryConfigId,
          source: 'querysimple-highlight',
          widgetId
        }
      })

      // r028.096 (Chunk B): collapsed from `isGroupLayer ? getGraphicsSublayer(...) : graphicsLayer`
      // to a direct GraphicsLayer add. Path 2's geometry-routing sublayers are gone.
      gl.add(highlightGraphic)
      addedCount++
      addedRecordIds.push(recordId)
    } catch (error) {
      skippedCount++
      skippedRecordIds.push(String(record.getId()))
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'addHighlightGraphics-record-error',
        seq,
        // r027.000: ExB 1.20 — coerce getId() to string (now returns string | number)
        recordId: String(record.getId()),
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      })
    }
  })

  // Log final state AFTER adding. r028.096 (Chunk B): collapsed `if (isGroupLayer) {...} else {...}`
  // to a direct GraphicsLayer walk.
  const finalGraphicsCount = gl.graphics.length
  const finalRecordIds: string[] = []
  gl.graphics.forEach((g: Graphic) => {
    const recordId = g.attributes?.recordId
    if (recordId) finalRecordIds.push(recordId)
  })

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'addHighlightGraphics-complete',
    seq,
    graphicsLayerId: gl.id,
    graphicsLayerUid: (gl as any).uid,
    recordsCount: records.length,
    addedCount,
    skippedCount,
    duplicateCount,
    addedRecordIds: addedRecordIds.slice(0, 20), // Limit to first 20
    skippedRecordIds: skippedRecordIds.slice(0, 20),
    duplicateRecordIds: duplicateRecordIds.slice(0, 20),
    existingGraphicsCount,
    finalGraphicsCount,
    expectedFinalCount: existingGraphicsCount + addedCount,
    finalRecordIds: finalRecordIds.slice(0, 20), // Limit to first 20
    finalRecordIdsCount: finalRecordIds.length,
    timestamp: Date.now()
  })

  // r024.18: Auto-enable layer visibility when adding graphics
  // If user toggled layer off and runs a new query, they expect to see results
  if (addedCount > 0 && !gl.visible) {
    gl.visible = true
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'addHighlightGraphics-auto-enabled-visibility',
      seq,
      graphicsLayerId: gl.id,
      reason: 'layer-was-hidden-but-graphics-added',
      timestamp: Date.now()
    })
  }

  // r028.096 (Chunk B of Path 2 Removal): the `if (isGroupLayer && addedCount > 0)`
  // block that created Legend FeatureLayers per geometry type was here. It existed
  // solely to populate the Path 2 empty-FL legend proxy. `ensureLegendFeatureLayer`
  // itself is deleted in Chunk C (Path-2-exclusive).
}

/**
 * Removes highlight graphics from the graphics layer or GroupLayer sublayers by record IDs.
 * r024.9: When GroupLayer, searches all Points/Lines/Polygons sublayers.
 */
export function removeHighlightGraphics(
  graphicsLayer: GraphicsLayer,
  recordIds: string[],
  records?: FeatureDataRecord[]
): void {
  const seq = graphicsStateManager.nextSequence()
  if (!graphicsLayer || !recordIds || recordIds.length === 0) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'removeHighlightGraphics-skipped',
      seq,
      reason: !graphicsLayer ? 'no-graphics-layer' : 'no-record-ids',
      recordIdsCount: recordIds?.length || 0,
      timestamp: Date.now()
    })
    return
  }

  // r028.096 (Chunk B of Path 2 Removal): collapsed from a GroupLayer-or-GraphicsLayer
  // branch (which walked the group's sublayers under Path 2) to a single-layer search
  // on the Path 1 GraphicsLayer. r028.104: signature narrowed to GraphicsLayer.
  const layersToSearch: GraphicsLayer[] = [graphicsLayer]

  let removedCount = 0

  const removeFromLayer = (layer: GraphicsLayer, graphicsToRemove: Graphic[]) => {
    graphicsToRemove.forEach(graphic => {
      layer.remove(graphic)
      removedCount++
    })
  }

  if (records && records.length > 0) {
    const compositeKeySet = new Set(
      // r027.000: ExB 1.20 — coerce getId() to string (now returns string | number)
      records.map(r => `${String(r.getId())}__${r.feature?.attributes?.__queryConfigId || ''}`)
    )
    layersToSearch.forEach(layer => {
      const graphicsToRemove: Graphic[] = []
      layer.graphics.forEach(graphic => {
        const recordId = graphic.attributes?.recordId
        const queryConfigId = graphic.attributes?.queryConfigId || ''
        if (recordId && compositeKeySet.has(`${recordId}__${queryConfigId}`)) {
          graphicsToRemove.push(graphic)
        }
      })
      removeFromLayer(layer, graphicsToRemove)
    })
  } else {
    const recordIdSet = new Set(recordIds)
    layersToSearch.forEach(layer => {
      const graphicsToRemove: Graphic[] = []
      layer.graphics.forEach(graphic => {
        const recordId = graphic.attributes?.recordId
        if (recordId && recordIdSet.has(recordId)) {
          graphicsToRemove.push(graphic)
        }
      })
      removeFromLayer(layer, graphicsToRemove)
    })
  }

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'removeHighlightGraphics-complete',
    seq,
    graphicsLayerId: graphicsLayer.id,
    recordIdsCount: recordIds.length,
    removedCount,
    timestamp: Date.now()
  })

  // r028.096 (Chunk B of Path 2 Removal): the `if (isGroupLayer && removedCount > 0)`
  // block calling `removeEmptyLegendFeatureLayers` was here. Path 2 empty-FL legend
  // pruning is gone; the helper itself is deleted in Chunk C.
}

// ---------------------------------------------------------------------------
// Re-exports from graphics-cleanup-utils.ts (r024.121)
// Backward compatibility — consumers continue importing from this file.
// ---------------------------------------------------------------------------
export {
  clearGraphicsLayer,
  clearGraphicsLayerOrGroupLayer,
  cleanupGraphicsLayer,
  clearAnyResultLayerContents,
  cleanupAnyResultLayer
} from './graphics-cleanup-utils'
