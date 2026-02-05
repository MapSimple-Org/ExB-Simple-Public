/**
 * Utility functions for managing graphics layer highlighting in QuerySimple widget.
 * Provides highlighting that works independently of layer visibility.
 */

import type { DataSource, FeatureLayerDataSource, FeatureDataRecord } from 'jimu-core'
import { DataSourceManager } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

// Global sequence counter for graphics operations to track timing across calls
let operationSequence = 0

/**
 * QuerySimple Widget Highlight Symbology Constants
 * 
 * These values are hardcoded to ensure consistent highlighting that is not affected
 * by external widgets (e.g., Draw widget) modifying mapView.highlightOptions.
 * 
 * r022.35: Hardcoded to prevent Advanced Draw widget from setting fillOpacity to 0,
 * which causes graphics to render with outline only (no fill).
 */
const QUERYSIMPLE_HIGHLIGHT_SYMBOLOGY = {
  // Base color: Cyan (matches ArcGIS default selection color)
  color: [0, 255, 255] as [number, number, number],
  
  // Fill opacity for polygons (25% transparent)
  fillOpacity: 0.25,
  
  // Outline/halo opacity (100% opaque)
  outlineOpacity: 1.0,
  
  // Line opacity (100% opaque for visibility)
  lineOpacity: 1.0,
  
  // Widths
  outlineWidth: 2,
  lineWidth: 4,
  
  // Point marker size
  markerSize: 12
} as const

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
 * r022.35: Uses hardcoded QuerySimple symbology constants instead of reading from
 * mapView.highlightOptions. This ensures consistent rendering that is not affected
 * by external widgets (e.g., Advanced Draw widget setting fillOpacity to 0).
 * 
 * @param geometryType - The geometry type ('point', 'polyline', 'polygon', etc.)
 * @returns Symbol configured with widget-specific highlighting
 */
function getDefaultHighlightSymbol(
  geometryType: string
): __esri.Symbol {
  // Use hardcoded QuerySimple symbology instead of reading from mapView.highlightOptions
  // This prevents external widgets from affecting our graphics rendering
  
  const { color, fillOpacity, outlineOpacity, lineOpacity, outlineWidth, lineWidth, markerSize } = QUERYSIMPLE_HIGHLIGHT_SYMBOLOGY
  
  // Build color arrays with appropriate opacity
  const fillColor = [...color, fillOpacity] as [number, number, number, number]
  const outlineColor = [...color, outlineOpacity] as [number, number, number, number]
  const lineColor = [...color, lineOpacity] as [number, number, number, number]
  
  // DIAGNOSTIC (r022.34): Log symbology being used
  debugLogger.log('GRAPHICS-LAYER', {
    event: 'symbology-calculation',
    geometryType,
    source: 'QUERYSIMPLE_HIGHLIGHT_SYMBOLOGY-constants',
    hardcodedValues: {
      baseColor: color,
      fillOpacity,
      fillColor,
      outlineOpacity,
      outlineColor,
      lineOpacity,
      lineColor
    },
    symbolToCreate: geometryType === 'polygon' ? {
      type: 'simple-fill',
      fillColor,
      outlineColor,
      outlineWidth
    } : geometryType === 'polyline' ? {
      type: 'simple-line',
      lineColor,
      width: lineWidth
    } : {
      type: 'simple-marker',
      color: outlineColor,
      size: markerSize
    },
    note: 'r022.35: Using hardcoded symbology - independent of mapView.highlightOptions',
    timestamp: Date.now()
  })
  
  switch (geometryType) {
    case 'point':
    case 'multipoint':
      return {
        type: 'simple-marker',
        color: outlineColor,
        outline: {
          color: outlineColor,
          width: outlineWidth
        },
        size: markerSize
      } as unknown as __esri.SimpleMarkerSymbol
      
    case 'polyline':
      return {
        type: 'simple-line',
        color: lineColor,
        width: lineWidth
      } as unknown as __esri.SimpleLineSymbol
      
    case 'polygon':
    case 'multipolygon':
      return {
        type: 'simple-fill',
        color: fillColor,
        outline: {
          color: outlineColor,
          width: outlineWidth
        }
      } as unknown as __esri.SimpleFillSymbol
      
    default:
      // Fallback to polygon symbol
      return {
        type: 'simple-fill',
        color: fillColor,
        outline: {
          color: outlineColor,
          width: outlineWidth
        }
      } as unknown as __esri.SimpleFillSymbol
  }
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
    
    // Add to map
    mapView.map.add(graphicsLayer)
    
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
 * Adds highlight graphics to the graphics layer using default map highlight color.
 * Note: This function should be called after GraphicsLayer module is loaded.
 */
export async function addHighlightGraphics(
  graphicsLayer: __esri.GraphicsLayer,
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

  // Log existing state BEFORE adding - verify assumption about duplicates
  const existingGraphicsCount = graphicsLayer.graphics.length
  const existingRecordIds: string[] = []
  const existingRecordIdSet = new Set<string>()
  
  graphicsLayer.graphics.forEach(graphic => {
    const recordId = graphic.attributes?.recordId
    if (recordId) {
      existingRecordIds.push(recordId)
      existingRecordIdSet.add(recordId)
    }
  })

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

      // Create symbol using widget-specific hardcoded symbology (r022.35)
      const symbol = getDefaultHighlightSymbol(geometryType)

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
          widgetId: graphicsLayer.id.replace('querysimple-highlight-', '')
        }
      })

      graphicsLayer.add(highlightGraphic)
      addedCount++
      addedRecordIds.push(recordId)
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
  const finalGraphicsCount = graphicsLayer.graphics.length
  const finalRecordIds: string[] = []
  graphicsLayer.graphics.forEach(graphic => {
    const recordId = graphic.attributes?.recordId
    if (recordId) {
      finalRecordIds.push(recordId)
    }
  })

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
}

/**
 * Removes highlight graphics from the graphics layer by record IDs.
 */
export function removeHighlightGraphics(
  graphicsLayer: __esri.GraphicsLayer,
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

  let removedCount = 0

  // r021.93: Build composite key set if records are provided (for accurate matching)
  if (records && records.length > 0) {
    const compositeKeys = records.map(record => {
      const recordId = record.getId()
      const queryConfigId = record.feature?.attributes?.__queryConfigId || ''
      return { recordId, queryConfigId, compositeKey: `${recordId}__${queryConfigId}` }
    })
    const compositeKeySet = new Set(compositeKeys.map(k => k.compositeKey))

    debugLogger.log('GRAPHICS-LAYER', {
      event: 'removeHighlightGraphics-composite-keys',
      seq,
      graphicsLayerId: graphicsLayer.id,
      compositeKeys: compositeKeys,
      graphicsCount: graphicsLayer.graphics.length,
      graphicsKeys: graphicsLayer.graphics.map(g => ({
        recordId: g.attributes?.recordId,
        queryConfigId: g.attributes?.queryConfigId || '',
        compositeKey: `${g.attributes?.recordId}__${g.attributes?.queryConfigId || ''}`
      })).slice(0, 10),
      timestamp: Date.now()
    })

    // Find and remove graphics matching composite keys (recordId + queryConfigId)
    const graphicsToRemove: __esri.Graphic[] = []
    graphicsLayer.graphics.forEach(graphic => {
      const recordId = graphic.attributes?.recordId
      const queryConfigId = graphic.attributes?.queryConfigId || ''
      if (recordId) {
        const compositeKey = `${recordId}__${queryConfigId}`
        if (compositeKeySet.has(compositeKey)) {
          graphicsToRemove.push(graphic)
        }
      }
    })

    graphicsToRemove.forEach(graphic => {
      graphicsLayer.remove(graphic)
      removedCount++
    })
  } else {
    // Fallback: use simple recordId matching (for backwards compatibility)
    const recordIdSet = new Set(recordIds)
    const graphicsToRemove: __esri.Graphic[] = []
    graphicsLayer.graphics.forEach(graphic => {
      const recordId = graphic.attributes?.recordId
      if (recordId && recordIdSet.has(recordId)) {
        graphicsToRemove.push(graphic)
      }
    })

    graphicsToRemove.forEach(graphic => {
      graphicsLayer.remove(graphic)
      removedCount++
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

