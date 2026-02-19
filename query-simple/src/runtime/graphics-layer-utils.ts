/**
 * Utility functions for managing graphics layer highlighting in QuerySimple widget.
 * Provides highlighting that works independently of layer visibility.
 */

import type { DataSource, FeatureLayerDataSource, FeatureDataRecord } from 'jimu-core'
import { DataSourceManager } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger, highlightConfigManager, globalHandleManager } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

// Global sequence counter for graphics operations to track timing across calls
let operationSequence = 0

/**
 * Gets the map view from a data source's origin layer.
 * Accesses the view through the FeatureLayer's view property.
 * @param outputDS - The output data source (or any data source)
 * @returns Promise resolving to MapView or SceneView, or null if not available
 */
export async function getMapViewFromDataSource(
  outputDS: DataSource | null | undefined
): Promise<__esri.MapView | __esri.SceneView | null> {
  const seq = ++operationSequence
  if (!outputDS) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'getMapViewFromDataSource-no-outputDS',
      seq,
      timestamp: Date.now()
    })
    return null
  }

  try {
    // Get origin data source to access the layer
    const originDataSources = outputDS.getOriginDataSources()
    const originDS = originDataSources?.[0] as FeatureLayerDataSource
    
    if (!originDS) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'getMapViewFromDataSource-no-originDS',
        outputDSId: outputDS.id,
        timestamp: Date.now()
      })
      return null
    }

    // Access the FeatureLayer from the data source
    const layer = (originDS as any).layer || (originDS as any).getLayer?.()
    if (!layer) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'getMapViewFromDataSource-no-layer',
        originDSId: originDS.id,
        timestamp: Date.now()
      })
      return null
    }

    // Log layer properties to understand structure
    const layerKeys = Object.keys(layer).filter(key => 
      !key.startsWith('_') && 
      typeof (layer as any)[key] !== 'function'
    ).slice(0, 20) // Limit to first 20 properties
    
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'getMapViewFromDataSource-layer-inspection',
      originDSId: originDS.id,
      layerId: layer.id,
      layerType: layer.type || 'unknown',
      layerKeys: layerKeys,
      hasLayerMap: !!(layer as any).map,
      hasLayerView: !!(layer as any).view,
      hasLayerParent: !!(layer as any).parent,
      layerMapType: (layer as any).map ? typeof (layer as any).map : 'none',
      timestamp: Date.now()
    })

    // Check layer.parent for map/view access (since hasLayerParent is true)
    const parent = (layer as any).parent
    if (parent) {
      // Log parent properties
      const parentKeys = Object.keys(parent).filter(key => 
        !key.startsWith('_') && 
        typeof (parent as any)[key] !== 'function'
      ).slice(0, 20)
      
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'getMapViewFromDataSource-layer-parent-inspection',
        originDSId: originDS.id,
        layerId: layer.id,
        parentType: parent.type || 'unknown',
        parentKeys: parentKeys,
        hasParentMap: !!(parent as any).map,
        hasParentView: !!(parent as any).view,
        hasParentViews: !!(parent as any).views,
        parentViewsLength: (parent as any).views?.length || 0,
        hasParentExtent: !!(parent as any).extent,
        timestamp: Date.now()
      })
      
      // Try to get view from parent
      if ((parent as any).view) {
        const view = (parent as any).view as __esri.MapView | __esri.SceneView
        debugLogger.log('GRAPHICS-LAYER', {
          event: 'getMapViewFromDataSource-success-via-layer-parent-view',
          originDSId: originDS.id,
          layerId: layer.id,
          viewType: view.type || 'unknown',
          timestamp: Date.now()
        })
        return view
      }
      
      // Try to get map from parent and then view
      const parentMap = (parent as any).map
      if (parentMap) {
        const view = parentMap.view || 
                     (parentMap.views?.getItemAt?.(0)) ||
                     (parentMap.views?.length > 0 ? parentMap.views[0] : null)
        if (view) {
          debugLogger.log('GRAPHICS-LAYER', {
            event: 'getMapViewFromDataSource-success-via-layer-parent-map',
            originDSId: originDS.id,
            layerId: layer.id,
            viewType: view.type || 'unknown',
            timestamp: Date.now()
          })
          return view as __esri.MapView | __esri.SceneView
        }
      }
      
      // Parent might BE the view (check if it has view-like properties)
      if (parent.type === 'map' || parent.type === 'scene' || (parent as any).extent) {
        debugLogger.log('GRAPHICS-LAYER', {
          event: 'getMapViewFromDataSource-success-via-layer-parent-is-view',
          originDSId: originDS.id,
          layerId: layer.id,
          viewType: parent.type || 'unknown',
          timestamp: Date.now()
        })
        return parent as __esri.MapView | __esri.SceneView
      }
    }

    // Try multiple approaches to get the view:
    // 1. Layer might have a direct view property
    if ((layer as any).view) {
      const view = (layer as any).view as __esri.MapView | __esri.SceneView
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'getMapViewFromDataSource-success-via-layer-view',
        originDSId: originDS.id,
        layerId: layer.id,
        viewType: view.type || 'unknown',
        timestamp: Date.now()
      })
      return view
    }

    // 2. Try to get map from layer and then view from map
    const map = (layer as any).map || 
                (layer as any).parent?.map ||
                (layer as any).__map ||
                (layer as any)._map
    
    if (map) {
      // Log map properties
      const mapKeys = Object.keys(map).filter(key => 
        !key.startsWith('_') && 
        typeof (map as any)[key] !== 'function'
      ).slice(0, 20)
      
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'getMapViewFromDataSource-map-found',
        originDSId: originDS.id,
        layerId: layer.id,
        mapId: map.id || 'unknown',
        mapKeys: mapKeys,
        hasMapView: !!map.view,
        hasMapViews: !!(map.views),
        mapViewsLength: map.views?.length || 0,
        timestamp: Date.now()
      })
      
      const view = map.view || 
                   (map.views?.getItemAt?.(0)) ||
                   (map.views?.length > 0 ? map.views[0] : null) ||
                   (map.views && map.views.length > 0 ? map.views.getItemAt(0) : null)
      
      if (view) {
        debugLogger.log('GRAPHICS-LAYER', {
          event: 'getMapViewFromDataSource-success-via-layer-map',
          originDSId: originDS.id,
          layerId: layer.id,
          viewType: view.type || 'unknown',
          timestamp: Date.now()
        })
        return view as __esri.MapView | __esri.SceneView
      }
    }

    // 3. Try to get root data source and access map from there
    const rootDS = originDS.getRootDataSource()
    if (rootDS) {
      const rootMap = (rootDS as any).getMap?.() || 
                      (rootDS as any).map ||
                      (rootDS as any).__map ||
                      (rootDS as any)._map
      
      if (rootMap) {
        // Log root map properties
        const rootMapKeys = Object.keys(rootMap).filter(key => 
          !key.startsWith('_') && 
          typeof (rootMap as any)[key] !== 'function'
        ).slice(0, 20)
        
        debugLogger.log('GRAPHICS-LAYER', {
          event: 'getMapViewFromDataSource-root-map-found',
          originDSId: originDS.id,
          rootDSId: rootDS.id,
          rootDSType: rootDS.type,
          rootMapId: rootMap.id || 'unknown',
          rootMapKeys: rootMapKeys,
          hasRootMapView: !!rootMap.view,
          hasRootMapViews: !!(rootMap.views),
          rootMapViewsLength: rootMap.views?.length || 0,
          timestamp: Date.now()
        })
        
        const view = rootMap.view || 
                     (rootMap.views?.getItemAt?.(0)) ||
                     (rootMap.views?.length > 0 ? rootMap.views[0] : null) ||
                     (rootMap.views && rootMap.views.length > 0 ? rootMap.views.getItemAt(0) : null)
        
        if (view) {
          debugLogger.log('GRAPHICS-LAYER', {
            event: 'getMapViewFromDataSource-success-via-rootDS',
            originDSId: originDS.id,
            rootDSId: rootDS.id,
            viewType: view.type || 'unknown',
            timestamp: Date.now()
          })
          return view as __esri.MapView | __esri.SceneView
        }
      } else {
        // Log root DS properties to see what's available
        const rootDSKeys = Object.keys(rootDS).filter(key => 
          !key.startsWith('_') && 
          typeof (rootDS as any)[key] !== 'function'
        ).slice(0, 20)
        
        debugLogger.log('GRAPHICS-LAYER', {
          event: 'getMapViewFromDataSource-root-ds-inspection',
          originDSId: originDS.id,
          rootDSId: rootDS.id,
          rootDSType: rootDS.type,
          rootDSKeys: rootDSKeys,
          hasGetMap: typeof (rootDS as any).getMap === 'function',
          hasMap: !!(rootDS as any).map,
          timestamp: Date.now()
        })
      }
    }

    debugLogger.log('GRAPHICS-LAYER', {
      event: 'getMapViewFromDataSource-no-view',
      originDSId: originDS.id,
      layerId: layer.id,
      hasLayerMap: !!map,
      hasRootDS: !!rootDS,
      timestamp: Date.now()
    })
    return null
  } catch (error) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'getMapViewFromDataSource-error',
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now()
    })
    return null
  }
}

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

// r024.17: Track in-progress GroupLayer creation to prevent race condition duplicates
const creationInProgress = new Map<string, Promise<__esri.GroupLayer | null>>()

// r024.61: Track in-progress GraphicsLayer creation to prevent race condition duplicates
// Without this, concurrent calls both pass the "does it exist?" check before either adds
// to the map, creating two layers with the same ID. The widget ref ends up pointing at
// the wrong one, so clear-all finds an empty layer while the graphic renders from the other.
const graphicsLayerCreationInProgress = new Map<string, Promise<__esri.GraphicsLayer | null>>()

// r024.19: Track Legend FeatureLayer visibility watch handles for cleanup
// r024.31: Now also tracked in globalHandleManager for centralized cleanup
const legendVisibilityHandles = new Map<string, __esri.WatchHandle>()
const legendVisibilityHandleIds = new Map<string, string>() // Maps legendLayerId -> globalHandleManager handleId

// r024.59: Cache mapView per widgetId so the legend-layer visibility watcher
// can close the popup when the user toggles the layer off in the Layer List.
// Set in addHighlightGraphics(), cleared in cleanupGraphicsLayer().
const mapViewCache = new Map<string, __esri.MapView | __esri.SceneView>()

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
  const seq = ++operationSequence
  const layerId = `querysimple-results-${widgetId}`

  // r024.17: Check if creation is already in progress for this layer
  if (creationInProgress.has(layerId)) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetResultGroupLayer-waiting-for-in-progress',
      seq,
      widgetId,
      layerId,
      timestamp: Date.now()
    })
    return creationInProgress.get(layerId)!
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
  creationInProgress.set(layerId, creationPromise)

  try {
    const result = await creationPromise
    return result
  } finally {
    // Clean up the in-progress tracker
    creationInProgress.delete(layerId)
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

// Cache for FeatureLayer module to avoid repeated async loads
let FeatureLayerModule: any = null

/**
 * r024.15: Gets the Legend FeatureLayer ID for a geometry type.
 */
function getLegendLayerId(layerId: string, geometryType: string): string {
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
      const cachedView = mapViewCache.get(widgetId)
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
  legendVisibilityHandles.set(legendLayerId, watchHandle)
  
  // r024.31: Register with globalHandleManager for centralized cleanup
  const handleId = globalHandleManager.track(widgetId, watchHandle, 'legend-visibility', `legend-${legendLayerId}`)
  legendVisibilityHandleIds.set(legendLayerId, handleId)

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
function getGraphicsSublayer(groupLayer: __esri.GroupLayer): __esri.GraphicsLayer | null {
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
  const seq = ++operationSequence
  const layerId = `querysimple-highlight-${widgetId}`

  // r024.61: If creation is already in progress, wait for it instead of creating a duplicate
  if (graphicsLayerCreationInProgress.has(layerId)) {
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetGraphicsLayer-waiting-for-in-progress',
      seq,
      widgetId,
      layerId,
      timestamp: Date.now()
    })
    return graphicsLayerCreationInProgress.get(layerId)!
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
  graphicsLayerCreationInProgress.set(layerId, creationPromise)

  try {
    return await creationPromise
  } finally {
    graphicsLayerCreationInProgress.delete(layerId)
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
  const seq = ++operationSequence
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

  // Log what we're trying to add
  const incomingRecordIds = records.map(r => r.getId())

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'addHighlightGraphics-before-add',
    seq,
    graphicsLayerId: graphicsLayer.id,
    existingGraphicsCount,
    existingRecordIds: existingRecordIds.slice(0, 20), // Limit to first 20 for readability
    existingRecordIdsCount: existingRecordIds.length,
    incomingRecordIds: incomingRecordIds.slice(0, 20), // Limit to first 20
    incomingRecordIdsCount: incomingRecordIds.length,
    duplicateRecordIds: incomingRecordIds.filter(id => existingRecordIdSet.has(id)).slice(0, 20),
    duplicateCount: incomingRecordIds.filter(id => existingRecordIdSet.has(id)).length,
    timestamp: Date.now()
  })

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
  mapViewCache.set(widgetId, mapView)
  
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
  const seq = ++operationSequence
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

/**
 * Clears all highlight graphics from the graphics layer.
 */
export function clearGraphicsLayer(graphicsLayer: __esri.GraphicsLayer): void {
  const seq = ++operationSequence
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
 * Removes the graphics layer from the map and cleans up references.
 * r021.16: Now calls destroy() to free internal buffers and prevent memory leaks.
 */
export function cleanupGraphicsLayer(
  widgetId: string,
  mapView: __esri.MapView | __esri.SceneView
): void {
  const seq = ++operationSequence
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

    // r024.59: Clear cached mapView reference for this widget
    mapViewCache.delete(widgetId)

    // r024.61: Clear creation lock so next createOrGetGraphicsLayer starts fresh
    graphicsLayerCreationInProgress.delete(layerId)
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
  const seq = ++operationSequence
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
  const seq = ++operationSequence
  const layerId = `querysimple-results-${widgetId}`

  try {
    // r024.22: Clean up all legend visibility watch handles for this GroupLayer
    // r024.31: Also remove from globalHandleManager
    const geometryTypes = ['point', 'polyline', 'polygon']
    let watchHandlesCleaned = 0
    let globalHandlesRemoved = 0
    geometryTypes.forEach(geoType => {
      const legendLayerId = getLegendLayerId(layerId, geoType)
      const watchHandle = legendVisibilityHandles.get(legendLayerId)
      if (watchHandle) {
        watchHandle.remove()
        legendVisibilityHandles.delete(legendLayerId)
        watchHandlesCleaned++
      }
      
      // r024.31: Also remove from globalHandleManager
      const handleId = legendVisibilityHandleIds.get(legendLayerId)
      if (handleId) {
        globalHandleManager.remove(widgetId, handleId)
        legendVisibilityHandleIds.delete(legendLayerId)
        globalHandlesRemoved++
      }
    })

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
  const seq = ++operationSequence
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
  const seq = ++operationSequence
  const result = { cleanedGraphicsLayer: false, cleanedGroupLayer: false }
  
  debugLogger.log('GRAPHICS-LAYER', {
    event: 'cleanupAnyResultLayer-start',
    seq,
    widgetId,
    timestamp: Date.now()
  })
  
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

/**
 * r024.20: Destroy and recreate the GroupLayer for memory cleanup.
 * This is the recommended pattern for clearing results with LayerList mode.
 * Destroys the layer to free ArcGIS internal buffers, then recreates fresh.
 * 
 * @param widgetId - Widget ID
 * @param mapView - Map view instance
 * @returns Promise resolving to the new GroupLayer
 */
export async function destroyAndRecreateGroupLayer(
  widgetId: string,
  mapView: __esri.MapView | __esri.SceneView
): Promise<__esri.GroupLayer | null> {
  const seq = ++operationSequence
  
  debugLogger.log('GRAPHICS-LAYER', {
    event: 'destroyAndRecreateGroupLayer-start',
    seq,
    widgetId,
    timestamp: Date.now()
  })
  
  // Step 1: Destroy existing
  cleanupGroupLayer(widgetId, mapView)
  
  // Step 2: Clear creation lock (the layer was destroyed, so lock should be cleared)
  const layerId = `querysimple-results-${widgetId}`
  creationInProgress.delete(layerId)
  
  // Step 3: Recreate fresh
  const newGroupLayer = await createOrGetResultGroupLayer(widgetId, mapView)
  
  debugLogger.log('GRAPHICS-LAYER', {
    event: 'destroyAndRecreateGroupLayer-complete',
    seq,
    widgetId,
    newLayerCreated: !!newGroupLayer,
    newLayerId: newGroupLayer?.id || null,
    timestamp: Date.now()
  })
  
  return newGroupLayer
}