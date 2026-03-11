/**
 * Utility functions for managing graphics layer highlighting in QuerySimple widget.
 * Provides highlighting that works independently of layer visibility.
 */

import type { DataSource, FeatureDataRecord } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger, highlightConfigManager, globalHandleManager } from 'widgets/shared-code/mapsimple-common'
import { graphicsStateManager } from './graphics-state-manager'

const debugLogger = createQuerySimpleDebugLogger()

// FeatureLayer module cache — stays module-level (only used by create-side functions)
let FeatureLayerModule: any = null

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
): __esri.Symbol {
  // r022.92: Get symbology from HighlightConfigManager (per-widget config)
  const fillColorRGB = highlightConfigManager.getFillColor(widgetId)
  const fillOpacity = highlightConfigManager.getFillOpacity(widgetId)
  const outlineColorRGB = highlightConfigManager.getOutlineColor(widgetId)
  const outlineOpacity = highlightConfigManager.getOutlineOpacity(widgetId)
  const outlineWidth = highlightConfigManager.getOutlineWidth(widgetId)
  const pointSize = highlightConfigManager.getPointSize(widgetId)
  const pointOutlineWidth = highlightConfigManager.getPointOutlineWidth(widgetId)
  const pointStyle = highlightConfigManager.getPointStyle(widgetId)
  
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
      } as unknown as __esri.SimpleMarkerSymbol
      
    case 'polyline':
      return {
        type: 'simple-line',
        color: lineColorWithAlpha,
        width: outlineWidth
      } as unknown as __esri.SimpleLineSymbol
      
    case 'polygon':
    case 'multipolygon':
      return {
        type: 'simple-fill',
        color: fillColorWithAlpha,
        outline: {
          color: outlineColorWithAlpha,
          width: outlineWidth
        }
      } as unknown as __esri.SimpleFillSymbol
      
    default:
      // Fallback to polygon symbol
      return {
        type: 'simple-fill',
        color: fillColorWithAlpha,
        outline: {
          color: outlineColorWithAlpha,
          width: outlineWidth
        }
      } as unknown as __esri.SimpleFillSymbol
  }
}

// All other shared state (creationInProgress, graphicsLayerCreationInProgress,
// legendVisibilityHandles, legendVisibilityHandleIds, mapViewCache) is now
// centralized in GraphicsStateManager singleton (r024.120).

/**
 * r024.9: Creates or gets existing result GroupLayer for LayerList integration.
 *
 * r024.52: Simplified to single hidden GraphicsLayer. All graphics go into one layer
 * regardless of geometry type. Sublayers are hidden from LayerList (listMode: 'hide')
 * so users cannot remove them individually. GroupLayer is the single toggle.
 * Legend FeatureLayers (hidden, per-geometry-type) are created dynamically for Legend display.
 *
 * r024.56: Remove action disabled by clearing ExB's __exb_layer_from_runtime flag
 * on the GroupLayer after map.add(). ExB's map-layers widget only shows the Remove
 * button for layers with this flag set to true (see map-layers/actions/remove.tsx).
 * This replaces the r024.16 after-remove watcher pattern, eliminating one persistent
 * listener per widget and preventing the +58 MB destroy/recreate cost if a user
 * managed to trigger removal.
 *
 * r024.17: Uses creation lock to prevent duplicate layers from race conditions.
 */
export async function createOrGetResultGroupLayer(
  widgetId: string,
  mapView: __esri.MapView | __esri.SceneView
): Promise<__esri.GroupLayer | null> {
  const seq = graphicsStateManager.nextSequence()
  const layerId = `querysimple-results-${widgetId}`

  // r024.17: Check if creation is already in progress for this layer
  if (graphicsStateManager.hasGroupLayerCreation(layerId)) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetResultGroupLayer-waiting-for-in-progress',
      seq,
      widgetId,
      layerId,
      timestamp: Date.now()
    })
    return graphicsStateManager.getGroupLayerCreation(layerId)!
  }

  // Check for existing layer first (fast path)
  const existingLayer = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GroupLayer
  if (existingLayer) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetResultGroupLayer-found-existing',
      seq,
      widgetId,
      layerId,
      timestamp: Date.now()
    })
    return existingLayer
  }

  // r024.17: Create a promise for this creation and store it
  const creationPromise = createGroupLayerInternal(widgetId, mapView, layerId, seq)
  graphicsStateManager.setGroupLayerCreation(layerId, creationPromise)

  try {
    const result = await creationPromise
    return result
  } finally {
    // Clean up the in-progress tracker
    graphicsStateManager.deleteGroupLayerCreation(layerId)
  }
}

/**
 * r024.17: Internal function that actually creates the GroupLayer.
 * Separated to allow the creation lock to work properly.
 */
async function createGroupLayerInternal(
  widgetId: string,
  mapView: __esri.MapView | __esri.SceneView,
  layerId: string,
  seq: number
): Promise<__esri.GroupLayer | null> {
  try {
    // Double-check for existing layer (in case it was added while we waited)
    const existingLayer = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GroupLayer
    if (existingLayer) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'createOrGetResultGroupLayer-found-existing-after-lock',
        seq,
        widgetId,
        layerId,
        timestamp: Date.now()
      })
      return existingLayer
    }

    const [GroupLayer, GraphicsLayer] = await loadArcGISJSAPIModules([
      'esri/layers/GroupLayer',
      'esri/layers/GraphicsLayer'
    ])
    const title = highlightConfigManager.getResultsLayerTitle(widgetId)

    // r024.52: Single hidden GraphicsLayer for all geometry types
    const graphicsLayer = new GraphicsLayer({
      id: `${layerId}-graphics`,
      title: 'Graphics',
      listMode: 'hide',
      visible: true
    })

    // Legend FeatureLayers are created dynamically in addHighlightGraphics
    // when graphics of each geometry type are first added

    const groupLayer = new GroupLayer({
      id: layerId,
      title,
      listMode: 'show',
      visible: true,
      visibilityMode: 'inherited',
      layers: [graphicsLayer]
    })

    // Final check before adding - another call might have snuck in
    const finalCheck = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GroupLayer
    if (finalCheck) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'createOrGetResultGroupLayer-found-existing-before-add',
        seq,
        widgetId,
        layerId,
        note: 'Another call added the layer, discarding this one',
        timestamp: Date.now()
      })
      groupLayer.destroy()
      return finalCheck
    }

    const currentLayerCount = mapView.map.layers.length
    mapView.map.add(groupLayer, currentLayerCount)

    // r024.56: Disable the Remove action in ExB's map-layers (LayerList) widget.
    // ExB stamps __exb_layer_from_runtime on runtime-added layers; the map-layers
    // Remove action checks this flag via isValid(). Clearing it hides the button,
    // which is cheaper and safer than the old after-remove watcher pattern.
    ;(groupLayer as any).__exb_layer_from_runtime = false

    // r025.015: Buffer visibility sync removed — buffer layer is now added
    // INSIDE the GroupLayer by useBufferPreview, so visibilityMode:'inherited'
    // handles LayerList toggle automatically. No external watcher needed.

    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetResultGroupLayer-created',
      seq,
      widgetId,
      layerId,
      title,
      sublayerCount: 1,
      removeActionDisabled: true,
      timestamp: Date.now()
    })

    return groupLayer
  } catch (error) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetResultGroupLayer-error',
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

/**
 * r024.15: Gets the Legend FeatureLayer ID for a geometry type.
 */
export function getLegendLayerId(layerId: string, geometryType: string): string {
  const normalizedType = normalizeGeometryType(geometryType)
  return `${layerId}-${normalizedType}-legend`
}

/**
 * r024.15: Normalizes geometry type to one of: point, polyline, polygon
 */
function normalizeGeometryType(geometryType: string): string {
  if (geometryType === 'point' || geometryType === 'multipoint') return 'point'
  if (geometryType === 'polyline') return 'polyline'
  return 'polygon' // polygon, multipolygon, or default
}

/**
 * r024.15: Creates a Legend FeatureLayer for any geometry type.
 * Called dynamically when the first graphic of that type is added.
 */
function createLegendFeatureLayer(
  FeatureLayer: any,
  widgetId: string,
  layerId: string,
  geometryType: string,
  graphicsLayer: __esri.GraphicsLayer
): __esri.FeatureLayer {
  const normalized = normalizeGeometryType(geometryType)
  const legendLayerId = getLegendLayerId(layerId, geometryType)
  
  // Get symbology from config
  const fillColorRGB = highlightConfigManager.getFillColor(widgetId)
  const fillOpacity = highlightConfigManager.getFillOpacity(widgetId)
  const outlineColorRGB = highlightConfigManager.getOutlineColor(widgetId)
  const outlineOpacity = highlightConfigManager.getOutlineOpacity(widgetId)
  const outlineWidth = highlightConfigManager.getOutlineWidth(widgetId)
  const pointSize = highlightConfigManager.getPointSize(widgetId)
  const pointOutlineWidth = highlightConfigManager.getPointOutlineWidth(widgetId)
  const pointStyle = highlightConfigManager.getPointStyle(widgetId)

  const fillColorWithAlpha = [...fillColorRGB, fillOpacity] as [number, number, number, number]
  const outlineColorWithAlpha = [...outlineColorRGB, outlineOpacity] as [number, number, number, number]

  // Create renderer based on geometry type
  let renderer: any
  let esriGeometryType: string
  let title: string

  if (normalized === 'point') {
    esriGeometryType = 'point'
    title = 'Points'
    renderer = {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        style: pointStyle,
        color: fillColorWithAlpha,
        outline: {
          color: outlineColorWithAlpha,
          width: pointOutlineWidth
        },
        size: pointSize
      }
    }
  } else if (normalized === 'polyline') {
    esriGeometryType = 'polyline'
    title = 'Lines'
    renderer = {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        color: outlineColorWithAlpha,
        width: outlineWidth
      }
    }
  } else {
    esriGeometryType = 'polygon'
    title = 'Polygons'
    renderer = {
      type: 'simple',
      symbol: {
        type: 'simple-fill',
        color: fillColorWithAlpha,
        outline: {
          color: outlineColorWithAlpha,
          width: outlineWidth
        }
      }
    }
  }

  // Create empty FeatureLayer (no features, just renderer for Legend)
  const legendLayer = new FeatureLayer({
    id: legendLayerId,
    title,
    source: [],
    objectIdField: 'OBJECTID',
    fields: [{ name: 'OBJECTID', type: 'oid' }],
    geometryType: esriGeometryType,
    spatialReference: { wkid: 4326 },
    renderer,
    listMode: 'hide', // Hide from LayerList, show in Legend
    legendEnabled: true,
    visible: true
  })

  // r024.22: Watch visibility changes and sync with corresponding GraphicsLayer
  // IMPORTANT: Store the handle for cleanup to prevent memory leaks
  // r024.31: Now also tracked in globalHandleManager
  const watchHandle = legendLayer.watch('visible', (visible: boolean) => {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'legend-layer-visibility-changed',
      widgetId,
      layerId: legendLayer.id,
      geometryType: normalized,
      visible,
      syncingTo: graphicsLayer.id,
      timestamp: Date.now()
    })
    graphicsLayer.visible = visible

    // r024.59: When user toggles layer OFF in Layer List, close the popup.
    // Graphics disappear but the popup would otherwise stay orphaned.
    if (!visible) {
      const cachedView = graphicsStateManager.getMapView(widgetId)
      if (cachedView?.popup?.visible) {
        cachedView.popup.close()
        debugLogger.log('POPUP', {
          event: 'popup-closed-on-layer-toggle-off',
          widgetId,
          layerId: legendLayer.id,
          reason: 'Layer toggled off in Layer List',
          timestamp: Date.now()
        })
      }
    }
  })
  
  // Store handle for cleanup when legend layer is destroyed
  graphicsStateManager.setLegendVisibilityHandle(legendLayerId, watchHandle)
  
  // r024.31: Register with globalHandleManager for centralized cleanup
  const handleId = globalHandleManager.track(widgetId, watchHandle, 'legend-visibility', `legend-${legendLayerId}`)
  graphicsStateManager.setLegendVisibilityHandleId(legendLayerId, handleId)

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'createLegendFeatureLayer-created',
    widgetId,
    layerId: legendLayerId,
    geometryType: normalized,
    title,
    watchHandleStored: true,
    timestamp: Date.now()
  })

  return legendLayer
}

/**
 * r024.15: Ensures a Legend FeatureLayer exists for the given geometry type.
 * Creates one if it doesn't exist and the corresponding GraphicsLayer has graphics.
 */
async function ensureLegendFeatureLayer(
  groupLayer: __esri.GroupLayer,
  geometryType: string,
  widgetId: string
): Promise<void> {
  const layerId = groupLayer.id
  const legendLayerId = getLegendLayerId(layerId, geometryType)
  
  // r024.54: If Legend layer already exists, re-enable it and return.
  // It may have been hidden by clearGroupLayerContents() or removeEmptyLegendFeatureLayers().
  const existingLegend = groupLayer.layers.find(l => l.id === legendLayerId) as __esri.FeatureLayer
  if (existingLegend) {
    if (!existingLegend.legendEnabled) {
      existingLegend.legendEnabled = true
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'ensureLegendFeatureLayer-re-enabled',
        widgetId,
        layerId: legendLayerId,
        geometryType: normalizeGeometryType(geometryType),
        timestamp: Date.now()
      })
    }
    return
  }

  // r024.52: Get the single GraphicsLayer
  const graphicsLayer = getGraphicsSublayer(groupLayer)
  
  // Only create if there are graphics of this geometry type
  if (!graphicsLayer || !graphicsLayer.graphics || graphicsLayer.graphics.length === 0) {
    return
  }
  
  // Check that at least one graphic has the target geometry type
  const normalizedGeoType = normalizeGeometryType(geometryType)
  const hasGeometryType = graphicsLayer.graphics.some(g => {
    return g.geometry && normalizeGeometryType(g.geometry.type) === normalizedGeoType
  })
  if (!hasGeometryType) {
    return
  }

  // Load FeatureLayer module if not cached
  if (!FeatureLayerModule) {
    const [FL] = await loadArcGISJSAPIModules(['esri/layers/FeatureLayer'])
    FeatureLayerModule = FL
  }

  // Create and add the Legend FeatureLayer
  const legendLayer = createLegendFeatureLayer(
    FeatureLayerModule,
    widgetId,
    layerId,
    geometryType,
    graphicsLayer
  )
  
  groupLayer.layers.add(legendLayer)
  
  debugLogger.log('GRAPHICS-LAYER', {
    event: 'ensureLegendFeatureLayer-added',
    widgetId,
    layerId: legendLayerId,
    geometryType: normalizeGeometryType(geometryType),
    graphicsCount: graphicsLayer.graphics.length,
    timestamp: Date.now()
  })
}

/**
 * r024.15: Hides Legend FeatureLayers for geometry types with no remaining graphics.
 * r024.54: No longer destroys Legend FeatureLayers. Hides them via legendEnabled = false
 * so ESRI can maintain its internal reactive infrastructure for reuse.
 */
function removeEmptyLegendFeatureLayers(groupLayer: __esri.GroupLayer, widgetId: string): void {
  const layerId = groupLayer.id
  const geometryTypes = ['point', 'polyline', 'polygon']
  const graphicsLayer = getGraphicsSublayer(groupLayer)
  
  geometryTypes.forEach((geoType) => {
    const legendLayerId = getLegendLayerId(layerId, geoType)
    const legendLayer = groupLayer.layers.find(l => l.id === legendLayerId) as __esri.FeatureLayer
    
    if (!legendLayer) return
    
    const hasGraphicsOfType = graphicsLayer?.graphics?.some(g =>
      g.geometry && normalizeGeometryType(g.geometry.type) === geoType
    ) ?? false

    if (!hasGraphicsOfType && legendLayer.legendEnabled) {
      legendLayer.legendEnabled = false
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'removeEmptyLegendFeatureLayers-hidden',
        widgetId,
        layerId: legendLayerId,
        geometryType: geoType,
        reason: 'no-graphics-of-type',
        timestamp: Date.now()
      })
    }
  })
}

/**
 * r024.9: Gets total graphics count from GraphicsLayer or GroupLayer (sum of sublayers).
 */
export function getGraphicsCountFromLayer(layer: __esri.GraphicsLayer | __esri.GroupLayer | null | undefined): number {
  if (!layer) return 0
  if ((layer as __esri.Layer).type === 'group') {
    const gl = layer as __esri.GroupLayer
    return gl.layers.toArray().reduce((sum, sub) => sum + ((sub as __esri.GraphicsLayer).graphics?.length || 0), 0)
  }
  return (layer as __esri.GraphicsLayer).graphics?.length || 0
}

/**
 * r024.9: Iterates graphics from GraphicsLayer or GroupLayer sublayers.
 */
export function forEachGraphicInLayer(
  layer: __esri.GraphicsLayer | __esri.GroupLayer | null | undefined,
  callback: (graphic: __esri.Graphic) => void
): void {
  if (!layer) return
  if ((layer as __esri.Layer).type === 'group') {
    const gl = layer as __esri.GroupLayer
    gl.layers.forEach((sub: __esri.Layer) => {
      const glSub = sub as __esri.GraphicsLayer
      glSub.graphics?.forEach(callback)
    })
  } else {
    (layer as __esri.GraphicsLayer).graphics?.forEach(callback)
  }
}

/**
 * r024.52: Gets the single GraphicsLayer sublayer from a GroupLayer.
 * All geometry types go into the same layer.
 */
export function getGraphicsSublayer(groupLayer: __esri.GroupLayer): __esri.GraphicsLayer | null {
  const graphicsLayerId = `${groupLayer.id}-graphics`
  const layer = groupLayer.layers.find(l => l.id === graphicsLayerId) as __esri.GraphicsLayer
  return layer || null
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
  mapView: __esri.MapView | __esri.SceneView
): Promise<__esri.GraphicsLayer | null> {
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
  const existingLayer = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GraphicsLayer
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
  mapView: __esri.MapView | __esri.SceneView,
  layerId: string,
  seq: number
): Promise<__esri.GraphicsLayer | null> {
  try {
    // Load GraphicsLayer module
    const [GraphicsLayer] = await loadArcGISJSAPIModules(['esri/layers/GraphicsLayer'])

    // Double-check after async load (another call may have completed while we awaited)
    const existingLayer = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GraphicsLayer
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

/**
 * Adds highlight graphics to the graphics layer or GroupLayer sublayers.
 * r024.0: When layer is GroupLayer, routes each graphic to Points/Lines/Polygons sublayer by geometry type.
 */
export async function addHighlightGraphics(
  graphicsLayer: __esri.GraphicsLayer | __esri.GroupLayer,
  records: FeatureDataRecord[],
  mapView: __esri.MapView | __esri.SceneView
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

  const isGroupLayer = (graphicsLayer as __esri.Layer).type === 'group'
  const layerToReorder = graphicsLayer

  // r022.102: Move graphics layer (or GroupLayer) to absolute end AFTER native selection creates highlight layers
  const allLayers = mapView.map.layers.toArray()
  const currentIndex = allLayers.findIndex(l => l.id === layerToReorder.id)
  const targetIndex = allLayers.length - 1

  if (currentIndex !== -1 && currentIndex < targetIndex) {
    mapView.map.reorder(layerToReorder, targetIndex)
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'r022-102-moved-to-top',
      seq,
      graphicsLayerId: graphicsLayer.id,
      oldIndex: currentIndex,
      newIndex: targetIndex,
      note: 'Moved graphics layer to absolute end so purple renders on top of native selection',
      timestamp: Date.now()
    })
  }

  let existingGraphicsCount = 0
  const existingRecordIds: string[] = []
  const existingRecordIdSet = new Set<string>()

  if (isGroupLayer) {
    const gl = graphicsLayer as __esri.GroupLayer
    gl.layers.forEach((sublayer: __esri.Layer) => {
      const glSub = sublayer as __esri.GraphicsLayer
      if (glSub.graphics) {
        glSub.graphics.forEach((graphic: __esri.Graphic) => {
          existingGraphicsCount++
          const recordId = graphic.attributes?.recordId
          if (recordId) {
            existingRecordIds.push(recordId)
            existingRecordIdSet.add(recordId)
          }
        })
      }
    })
  } else {
    const gl = graphicsLayer as __esri.GraphicsLayer
    existingGraphicsCount = gl.graphics.length
    gl.graphics.forEach((graphic: __esri.Graphic) => {
      const recordId = graphic.attributes?.recordId
      if (recordId) {
        existingRecordIds.push(recordId)
        existingRecordIdSet.add(recordId)
      }
    })
  }

  // Load Graphic module
  const [Graphic] = await loadArcGISJSAPIModules(['esri/Graphic'])

  let addedCount = 0
  let skippedCount = 0
  let duplicateCount = 0
  const addedRecordIds: string[] = []
  const skippedRecordIds: string[] = []
  const duplicateRecordIds: string[] = []

  // Extract widgetId from graphics layer ID (querysimple-highlight-{id} or querysimple-results-{id})
  const widgetId = graphicsLayer.id.replace(/^querysimple-(?:highlight|results)-/, '')

  // r024.59: Cache mapView so the legend-layer visibility watcher can close
  // the popup when the user toggles the layer off in the Layer List
  graphicsStateManager.setMapView(widgetId, mapView)
  
  // r021.90: No duplicate checking - caller clears the layer before calling this function
  // This ensures we always add the exact set of records provided
  records.forEach(record => {
    try {
      const recordId = record.getId()
      
      const graphic = record.feature as __esri.Graphic
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

      const targetLayer = isGroupLayer
        ? getGraphicsSublayer(graphicsLayer as __esri.GroupLayer)
        : (graphicsLayer as __esri.GraphicsLayer)
      if (targetLayer) {
        targetLayer.add(highlightGraphic)
        addedCount++
        addedRecordIds.push(recordId)
      } else {
        skippedCount++
        skippedRecordIds.push(recordId)
      }
    } catch (error) {
      skippedCount++
      skippedRecordIds.push(record.getId())
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'addHighlightGraphics-record-error',
        seq,
        recordId: record.getId(),
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      })
    }
  })

  // Log final state AFTER adding
  let finalGraphicsCount = 0
  const finalRecordIds: string[] = []
  if (isGroupLayer) {
    const gl = graphicsLayer as __esri.GroupLayer
    gl.layers.forEach((sublayer: __esri.Layer) => {
      const glSub = sublayer as __esri.GraphicsLayer
      if (glSub.graphics) {
        glSub.graphics.forEach((g: __esri.Graphic) => {
          finalGraphicsCount++
          const recordId = g.attributes?.recordId
          if (recordId) finalRecordIds.push(recordId)
        })
      }
    })
  } else {
    const gl = graphicsLayer as __esri.GraphicsLayer
    finalGraphicsCount = gl.graphics.length
    gl.graphics.forEach((g: __esri.Graphic) => {
      const recordId = g.attributes?.recordId
      if (recordId) finalRecordIds.push(recordId)
    })
  }

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'addHighlightGraphics-complete',
    seq,
    graphicsLayerId: graphicsLayer.id,
    graphicsLayerUid: (graphicsLayer as any).uid,
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
  if (addedCount > 0 && !graphicsLayer.visible) {
    graphicsLayer.visible = true
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'addHighlightGraphics-auto-enabled-visibility',
      seq,
      graphicsLayerId: graphicsLayer.id,
      reason: 'layer-was-hidden-but-graphics-added',
      timestamp: Date.now()
    })
  }

  // r024.15: Ensure Legend FeatureLayers exist for geometry types that now have graphics
  if (isGroupLayer && addedCount > 0) {
    const geometryTypesAdded = new Set<string>()
    records.forEach(record => {
      const graphic = record.feature as __esri.Graphic
      if (graphic?.geometry?.type) {
        geometryTypesAdded.add(graphic.geometry.type)
      }
    })
    
    // Create Legend layers for each geometry type that was added
    for (const geoType of geometryTypesAdded) {
      await ensureLegendFeatureLayer(graphicsLayer as __esri.GroupLayer, geoType, widgetId)
    }
  }
}

/**
 * Removes highlight graphics from the graphics layer or GroupLayer sublayers by record IDs.
 * r024.9: When GroupLayer, searches all Points/Lines/Polygons sublayers.
 */
export function removeHighlightGraphics(
  graphicsLayer: __esri.GraphicsLayer | __esri.GroupLayer,
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

  const isGroupLayer = (graphicsLayer as __esri.Layer).type === 'group'
  const layersToSearch: __esri.GraphicsLayer[] = isGroupLayer
    ? (graphicsLayer as __esri.GroupLayer).layers.toArray().filter((l): l is __esri.GraphicsLayer => (l as __esri.GraphicsLayer).graphics != null)
    : [graphicsLayer as __esri.GraphicsLayer]

  let removedCount = 0

  const removeFromLayer = (layer: __esri.GraphicsLayer, graphicsToRemove: __esri.Graphic[]) => {
    graphicsToRemove.forEach(graphic => {
      layer.remove(graphic)
      removedCount++
    })
  }

  if (records && records.length > 0) {
    const compositeKeySet = new Set(
      records.map(r => `${r.getId()}__${r.feature?.attributes?.__queryConfigId || ''}`)
    )
    layersToSearch.forEach(layer => {
      const graphicsToRemove: __esri.Graphic[] = []
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
      const graphicsToRemove: __esri.Graphic[] = []
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
    isGroupLayer,
    timestamp: Date.now()
  })

  // r024.15: Remove Legend FeatureLayers for any now-empty sublayers
  if (isGroupLayer && removedCount > 0) {
    const widgetId = graphicsLayer.id.replace(/^querysimple-results-/, '')
    removeEmptyLegendFeatureLayers(graphicsLayer as __esri.GroupLayer, widgetId)
  }
}

// ---------------------------------------------------------------------------
// Re-exports from graphics-cleanup-utils.ts (r024.121)
// Backward compatibility — consumers continue importing from this file.
// ---------------------------------------------------------------------------
export {
  clearGraphicsLayer,
  clearGraphicsLayerOrGroupLayer,
  cleanupGraphicsLayer,
  clearGroupLayerContents,
  cleanupGroupLayer,
  clearAnyResultLayerContents,
  cleanupAnyResultLayer
} from './graphics-cleanup-utils'
