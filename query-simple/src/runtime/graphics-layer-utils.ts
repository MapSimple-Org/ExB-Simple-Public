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
 * Uses the map's actual highlight color from highlightOptions to match standard selection appearance.
 */
function getDefaultHighlightSymbol(
  geometryType: string,
  mapView: __esri.MapView | __esri.SceneView
): __esri.Symbol {
  // Get default highlight color from view's highlightOptions
  const highlightOptions = (mapView.highlightOptions || {}) as __esri.HighlightOptions
  
  // Extract color - could be array [R,G,B,A] or Color object
  let highlightColor: number[] | null = null
  
  if (highlightOptions.color) {
    // If it's a Color object, convert to array
    if (typeof highlightOptions.color === 'object' && 'toRgba' in highlightOptions.color) {
      highlightColor = (highlightOptions.color as any).toRgba()
    } 
    // If it's already an array
    else if (Array.isArray(highlightOptions.color)) {
      highlightColor = highlightOptions.color
    }
  }
  
  // If no color in highlightOptions, use the ArcGIS documented default: cyan [0, 255, 255]
  if (!highlightColor) {
    highlightColor = [0, 255, 255, 1.0] // Full opacity default
  }
  
  // Ensure we have 4 elements [R, G, B, A]
  const baseColor = highlightColor.slice(0, 3)
  const baseAlpha = highlightColor.length >= 4 ? highlightColor[3] : 1.0
  
  // Get fill opacity from highlightOptions or use default
  const fillOpacity = highlightOptions.fillOpacity !== undefined 
    ? highlightOptions.fillOpacity 
    : 0.25 // Default 25% opacity for fill
  const fillColor = [...baseColor, fillOpacity]
  
  // Get halo opacity or use default - for outlines and lines
  const haloOpacity = highlightOptions.haloOpacity !== undefined
    ? highlightOptions.haloOpacity
    : baseAlpha // Use the color's alpha if available, otherwise 1.0
  const outlineColor = [...baseColor, haloOpacity]
  
  // For lines, use full opacity to ensure visibility
  const lineOpacity = highlightOptions.haloOpacity !== undefined
    ? Math.max(highlightOptions.haloOpacity, 0.8) // At least 80% opacity
    : baseAlpha // Use the color's alpha, or default to 1.0
  const lineColor = [...baseColor, lineOpacity]
  
  switch (geometryType) {
    case 'point':
    case 'multipoint':
      return {
        type: 'simple-marker',
        color: outlineColor,
        outline: {
          color: outlineColor,
          width: 2
        },
        size: 12
      } as unknown as __esri.SimpleMarkerSymbol
      
    case 'polyline':
      return {
        type: 'simple-line',
        color: lineColor, // Use lineColor with proper opacity
        width: 4 // Increased width for visibility
      } as unknown as __esri.SimpleLineSymbol
      
    case 'polygon':
    case 'multipolygon':
      return {
        type: 'simple-fill',
        color: fillColor,
        outline: {
          color: outlineColor,
          width: 2
        }
      } as unknown as __esri.SimpleFillSymbol
      
    default:
      // Fallback to polygon symbol
      return {
        type: 'simple-fill',
        color: fillColor,
        outline: {
          color: outlineColor,
          width: 2
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

  records.forEach(record => {
    try {
      const recordId = record.getId()
      
      // Check if this record ID already exists in graphics layer
      if (existingRecordIdSet.has(recordId)) {
        duplicateCount++
        duplicateRecordIds.push(recordId)
        debugLogger.log('GRAPHICS-LAYER', {
          event: 'addHighlightGraphics-duplicate-detected',
          seq,
          recordId,
          graphicsLayerId: graphicsLayer.id,
          timestamp: Date.now()
        })
        return // Skip adding duplicate
      }

      const graphic = record.feature as __esri.Graphic
      if (!graphic || !graphic.geometry) {
        skippedCount++
        skippedRecordIds.push(recordId)
        return
      }

      // Get geometry type from graphic
      const geometryType = graphic.geometry.type

      // Create symbol using default highlight color
      const symbol = getDefaultHighlightSymbol(geometryType, mapView)

      // Create new graphic with highlight symbol
      const highlightGraphic = new Graphic({
        geometry: graphic.geometry,
        symbol: symbol,
        attributes: {
          recordId: recordId,
          source: 'querysimple-highlight',
          widgetId: graphicsLayer.id.replace('querysimple-highlight-', '')
        }
      })

      graphicsLayer.add(highlightGraphic)
      addedCount++
      addedRecordIds.push(recordId)
      
      // Add to tracking set to prevent duplicates within this batch
      existingRecordIdSet.add(recordId)
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
  recordIds: string[]
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

  const recordIdSet = new Set(recordIds)
  let removedCount = 0

  // Find and remove graphics matching record IDs
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
      // Clear all graphics first
      graphicsLayer.removeAll()
      
      // Remove layer from map
      mapView.map.remove(graphicsLayer)
      
      debugLogger.log('GRAPHICS-LAYER', {
        event: 'cleanupGraphicsLayer-complete',
        seq,
        widgetId,
        layerId,
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

