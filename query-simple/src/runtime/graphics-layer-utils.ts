/**
 * Utility functions for managing graphics layer highlighting in QuerySimple widget.
 * Provides highlighting that works independently of layer visibility.
 */

import type { DataSource, FeatureLayerDataSource, FeatureDataRecord } from 'jimu-core'
import { DataSourceManager } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger, highlightConfigManager } from 'widgets/shared-code/mapsimple-common'

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

// r024.16: Track removal listeners to prevent duplicates
const removalListenerHandles = new Map<string, __esri.Handle>()

// r024.17: Track in-progress GroupLayer creation to prevent race condition duplicates
const creationInProgress = new Map<string, Promise<__esri.GroupLayer | null>>()

/**
 * r024.9: Creates or gets existing result GroupLayer for LayerList integration.
 *
 * Points/Lines/Polygons architecture - each sublayer visible in LayerList.
 * visibilityMode: 'inherited' so toggling GroupLayer toggles all sublayers.
 * LayerList natively handles visibility for layers with listMode: 'show'.
 *
 * r024.15: Legend FeatureLayers are now created dynamically when graphics are added,
 * not statically at GroupLayer creation time.
 *
 * r024.16: Listens for layer removal and re-adds if user tries to remove from LayerList.
 *
 * r024.17: Uses creation lock to prevent duplicate layers from race conditions
 * (e.g., hash query load triggering multiple concurrent calls).
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

    const pointsLayer = new GraphicsLayer({
      id: `${layerId}-points`,
      title: 'Points',
      listMode: 'show',
      visible: true
    })
    const linesLayer = new GraphicsLayer({
      id: `${layerId}-lines`,
      title: 'Lines',
      listMode: 'show',
      visible: true
    })
    const polygonsLayer = new GraphicsLayer({
      id: `${layerId}-polygons`,
      title: 'Polygons',
      listMode: 'show',
      visible: true
    })

    // r024.15: Legend FeatureLayers are created dynamically in addHighlightGraphics
    // when graphics of each geometry type are first added

    const groupLayer = new GroupLayer({
      id: layerId,
      title,
      listMode: 'show',
      visible: true,
      visibilityMode: 'inherited',
      layers: [pointsLayer, linesLayer, polygonsLayer]
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

    // r024.16: Listen for removal and re-add if user tries to remove from LayerList
    setupRemovalProtection(mapView, groupLayer, widgetId)

    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetResultGroupLayer-created',
      seq,
      widgetId,
      layerId,
      title,
      sublayerCount: 3,
      hasRemovalProtection: true,
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
 * r024.16: Sets up a listener to prevent user from removing the GroupLayer.
 * If they remove it from LayerList, we immediately re-add it.
 */
function setupRemovalProtection(
  mapView: __esri.MapView | __esri.SceneView,
  groupLayer: __esri.GroupLayer,
  widgetId: string
): void {
  const layerId = groupLayer.id

  // Remove existing listener if any (prevents duplicates)
  if (removalListenerHandles.has(layerId)) {
    removalListenerHandles.get(layerId)?.remove()
    removalListenerHandles.delete(layerId)
  }

  // Listen for layer removal
  const handle = mapView.map.layers.on('after-remove', (event: any) => {
    const removedLayer = event.item as __esri.Layer
    if (removedLayer?.id === layerId) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'removal-protection-triggered',
        widgetId,
        layerId,
        action: 're-adding-layer',
        timestamp: Date.now()
      })

      // Re-add the layer at the top
      const currentLayerCount = mapView.map.layers.length
      mapView.map.add(groupLayer, currentLayerCount)
    }
  })

  removalListenerHandles.set(layerId, handle)
}

/**
 * r024.16: Removes the removal protection listener.
 * Called when we intentionally want to remove the layer (cleanup).
 */
function removeRemovalProtection(layerId: string): void {
  if (removalListenerHandles.has(layerId)) {
    removalListenerHandles.get(layerId)?.remove()
    removalListenerHandles.delete(layerId)
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'removal-protection-removed',
      layerId,
      timestamp: Date.now()
    })
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
 * r024.15: Gets the GraphicsLayer sublayer index for a geometry type.
 * Order: [0]=Points, [1]=Lines, [2]=Polygons
 */
function getSublayerIndexForGeometryType(geometryType: string): number {
  const normalized = normalizeGeometryType(geometryType)
  if (normalized === 'point') return 0
  if (normalized === 'polyline') return 1
  return 2
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

  // Watch visibility changes and sync with corresponding GraphicsLayer
  legendLayer.watch('visible', (visible: boolean) => {
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
  })

  debugLogger.log('GRAPHICS-LAYER', {
    event: 'createLegendFeatureLayer-created',
    widgetId,
    layerId: legendLayerId,
    geometryType: normalized,
    title,
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
  
  // Check if Legend layer already exists
  const existingLegend = groupLayer.layers.find(l => l.id === legendLayerId)
  if (existingLegend) {
    return // Already exists
  }

  // Get the corresponding GraphicsLayer
  const sublayerIndex = getSublayerIndexForGeometryType(geometryType)
  const graphicsLayer = groupLayer.layers.getItemAt(sublayerIndex) as __esri.GraphicsLayer
  
  // Only create if there are graphics
  if (!graphicsLayer || !graphicsLayer.graphics || graphicsLayer.graphics.length === 0) {
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
 * r024.15: Removes Legend FeatureLayers for empty GraphicsLayer sublayers.
 * Called after removing graphics to clean up Legend entries for empty geometry types.
 */
function removeEmptyLegendFeatureLayers(groupLayer: __esri.GroupLayer, widgetId: string): void {
  const layerId = groupLayer.id
  const geometryTypes = ['point', 'polyline', 'polygon']
  
  geometryTypes.forEach((geoType, index) => {
    const legendLayerId = getLegendLayerId(layerId, geoType)
    const legendLayer = groupLayer.layers.find(l => l.id === legendLayerId)
    
    if (!legendLayer) return // No legend layer for this type
    
    // Check if the corresponding GraphicsLayer is empty
    const graphicsLayer = groupLayer.layers.getItemAt(index) as __esri.GraphicsLayer
    if (graphicsLayer && graphicsLayer.graphics && graphicsLayer.graphics.length === 0) {
      groupLayer.layers.remove(legendLayer)
      legendLayer.destroy()
      
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'removeEmptyLegendFeatureLayers-removed',
        widgetId,
        layerId: legendLayerId,
        geometryType: geoType,
        reason: 'graphics-layer-empty',
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
 * Gets the target sublayer for a geometry type from a GroupLayer.
 * Order: [0]=Points, [1]=Lines, [2]=Polygons
 */
function getSublayerForGeometryType(groupLayer: __esri.GroupLayer, geometryType: string): __esri.GraphicsLayer | null {
  const layers = groupLayer.layers
  if (!layers || layers.length < 3) return null
  if (geometryType === 'point' || geometryType === 'multipoint') return layers.getItemAt(0) as __esri.GraphicsLayer
  if (geometryType === 'polyline') return layers.getItemAt(1) as __esri.GraphicsLayer
  if (geometryType === 'polygon' || geometryType === 'multipolygon') return layers.getItemAt(2) as __esri.GraphicsLayer
  return layers.getItemAt(2) as __esri.GraphicsLayer
}

/**
 * Creates or gets an existing graphics layer for the widget.
 * Uses a unique ID based on widget ID to ensure one layer per widget.
 */
export async function createOrGetGraphicsLayer(
  widgetId: string,
  mapView: __esri.MapView | __esri.SceneView
): Promise<__esri.GraphicsLayer | null> {
  const seq = ++operationSequence
  const layerId = `querysimple-highlight-${widgetId}`
  
  try {
    // Check if layer already exists
    const existingLayer = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GraphicsLayer
    if (existingLayer) {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'createOrGetGraphicsLayer-found-existing',
        seq,
        widgetId,
        layerId,
        timestamp: Date.now()
      })
      return existingLayer
    }

    // Load GraphicsLayer module
    const [GraphicsLayer] = await loadArcGISJSAPIModules(['esri/layers/GraphicsLayer'])
    
    // Create new graphics layer
    const graphicsLayer = new GraphicsLayer({
      id: layerId,
      title: `QuerySimple Highlights (${widgetId})`,
      listMode: 'hide', // Hide from layer list
      visible: true
    })
    
    // r022.100: Add to the very end so purple graphics draw on top
    // Get current layer count and add 1 to ensure we're after everything including highlight layers
    const currentLayerCount = mapView.map.layers.length
    mapView.map.add(graphicsLayer, currentLayerCount)
    
    debugLogger.log('GRAPHICS-LAYER', {
      event: 'createOrGetGraphicsLayer-created',
      seq,
      widgetId,
      layerId,
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
        ? getSublayerForGeometryType(graphicsLayer as __esri.GroupLayer, geometryType)
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
      
      // Clear all graphics first
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
 * r024.16: Removes removal protection listener before removing.
 */
export function cleanupGroupLayer(
  widgetId: string,
  mapView: __esri.MapView | __esri.SceneView
): void {
  const seq = ++operationSequence
  const layerId = `querysimple-results-${widgetId}`

  try {
    // r024.16: Remove protection listener first so we can actually remove the layer
    removeRemovalProtection(layerId)

    const groupLayer = mapView.map.layers.find(layer => layer.id === layerId) as __esri.GroupLayer
    if (groupLayer) {
      let graphicsCount = 0
      groupLayer.layers.forEach((sublayer: __esri.Layer) => {
        const glSub = sublayer as __esri.GraphicsLayer
        if (glSub.graphics) {
          graphicsCount += glSub.graphics.length
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
        destroyed: true,
        timestamp: Date.now()
      })
    } else {
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'cleanupGroupLayer-not-found',
        seq,
        widgetId,
        layerId,
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

