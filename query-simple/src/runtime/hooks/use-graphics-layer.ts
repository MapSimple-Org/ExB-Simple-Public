import React from 'react'
import { type AllWidgetProps, type DataSource } from 'jimu-core'
import { type IMConfig } from '../../config'
import { createOrGetGraphicsLayer, cleanupGraphicsLayer } from '../graphics-layer-utils'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

interface GraphicsLayerCallbacks {
  onGraphicsLayerInitialized?: (graphicsLayer: __esri.GraphicsLayer) => void
  onGraphicsLayerCleaned?: () => void
}

/**
 * Utility to manage graphics layer initialization and cleanup.
 * 
 * Centralizes graphics layer management logic for the widget.
 * Handles graphics layer creation, initialization, and cleanup.
 * 
 * Part of Chunk 4: Graphics Layer Management extraction.
 * 
 * Note: This is a utility class (not a hook) to work with class components.
 */
export class GraphicsLayerManager {
  private graphicsLayerRef: React.RefObject<__esri.GraphicsLayer | null>
  private mapViewRef: React.RefObject<__esri.MapView | __esri.SceneView | null>

  constructor(
    graphicsLayerRef: React.RefObject<__esri.GraphicsLayer | null>,
    mapViewRef: React.RefObject<__esri.MapView | __esri.SceneView | null>
  ) {
    this.graphicsLayerRef = graphicsLayerRef
    this.mapViewRef = mapViewRef
  }

  /**
   * Initializes the graphics layer for map highlighting.
   * 
   * Creates or retrieves a graphics layer and adds it to the map view.
   * 
   * @param widgetId - Widget ID for graphics layer naming
   * @param mapView - The ArcGIS MapView or SceneView instance
   * @param callbacks - Optional callbacks for initialization events
   * 
   * @returns Promise resolving to the graphics layer, or null if initialization failed
   */
  async initialize(
    widgetId: string,
    mapView: __esri.MapView | __esri.SceneView,
    callbacks?: GraphicsLayerCallbacks
  ): Promise<__esri.GraphicsLayer | null> {
    // Chunk 4: Comparison logging - new implementation
    const newStateBefore = {
      hasGraphicsLayer: !!this.graphicsLayerRef.current,
      graphicsLayerId: this.graphicsLayerRef.current?.id || null,
      hasMapView: !!this.mapViewRef.current,
      viewType: this.mapViewRef.current?.type || null
    }
    
    debugLogger.log('CHUNK-4-COMPARE', {
      event: 'new-implementation-initializeGraphicsLayer-before',
      widgetId,
      newImplementation: {
        stateBefore: newStateBefore,
        mapViewType: mapView.type || 'unknown',
        timestamp: Date.now()
      }
    })
    
    try {
      // Create or get graphics layer
      const graphicsLayer = await createOrGetGraphicsLayer(widgetId, mapView)
      if (!graphicsLayer) {
        debugLogger.log('CHUNK-4-COMPARE', {
          event: 'new-implementation-initializeGraphicsLayer-failed',
          widgetId,
          newImplementation: {
            stateBefore: newStateBefore,
            result: 'failed',
            reason: 'graphics-layer-creation-failed',
            timestamp: Date.now()
          }
        })
        return null
      }

      // Store references
      this.mapViewRef.current = mapView
      this.graphicsLayerRef.current = graphicsLayer

      const newStateAfter = {
        hasGraphicsLayer: !!this.graphicsLayerRef.current,
        graphicsLayerId: this.graphicsLayerRef.current?.id || null,
        hasMapView: !!this.mapViewRef.current,
        viewType: this.mapViewRef.current?.type || null
      }

      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-initializeGraphicsLayer-success',
        widgetId,
        newImplementation: {
          stateBefore: newStateBefore,
          stateAfter: newStateAfter,
          result: 'success',
          graphicsLayerId: graphicsLayer.id,
          viewType: mapView.type || 'unknown',
          timestamp: Date.now()
        }
      })

      // Call callback if provided
      if (callbacks?.onGraphicsLayerInitialized) {
        callbacks.onGraphicsLayerInitialized(graphicsLayer)
      }

      return graphicsLayer
    } catch (error) {
      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-initializeGraphicsLayer-error',
        widgetId,
        newImplementation: {
          stateBefore: newStateBefore,
          result: 'error',
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        }
      })
      return null
    }
  }

  /**
   * Initializes graphics layer lazily when output data source becomes available.
   * 
   * @param widgetId - Widget ID
   * @param config - Widget configuration
   * @param outputDS - The output data source that was created
   * @param mapView - Optional map view (if not provided, uses mapViewRef)
   * @param callbacks - Optional callbacks
   */
  async initializeFromOutputDS(
    widgetId: string,
    config: IMConfig,
    outputDS: DataSource,
    mapView: __esri.MapView | __esri.SceneView | null,
    callbacks?: GraphicsLayerCallbacks
  ): Promise<void> {
    // Chunk 4: Comparison logging - new implementation
    const newStateBefore = {
      hasGraphicsLayer: !!this.graphicsLayerRef.current,
      graphicsLayerId: this.graphicsLayerRef.current?.id || null,
      hasMapView: !!this.mapViewRef.current,
      outputDSId: outputDS.id
    }
    
    debugLogger.log('CHUNK-4-COMPARE', {
      event: 'new-implementation-initializeGraphicsLayerFromOutputDS-before',
      widgetId,
      newImplementation: {
        stateBefore: newStateBefore,
        timestamp: Date.now()
      }
    })
    
    // Only initialize if not already initialized
    if (this.graphicsLayerRef.current) {
      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-initializeGraphicsLayerFromOutputDS-skipped',
        widgetId,
        newImplementation: {
          stateBefore: newStateBefore,
          result: 'skipped',
          reason: 'already-initialized',
          timestamp: Date.now()
        }
      })
      return
    }

    // Use provided map view or get from ref
    const mapViewToUse = mapView || this.mapViewRef.current
    if (!mapViewToUse) {
      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-initializeGraphicsLayerFromOutputDS-skipped',
        widgetId,
        newImplementation: {
          stateBefore: newStateBefore,
          result: 'skipped',
          reason: 'map-view-not-available-yet',
          timestamp: Date.now()
        }
      })
      return
    }

    // Initialize graphics layer
    await this.initialize(widgetId, mapViewToUse, callbacks)
  }

  /**
   * Cleans up the graphics layer.
   * 
   * Removes the graphics layer from the map view and clears internal references.
   * 
   * @param widgetId - Widget ID
   * @param callbacks - Optional callbacks
   */
  cleanup(
    widgetId: string,
    callbacks?: GraphicsLayerCallbacks
  ): void {
    // Chunk 4: Comparison logging - new implementation
    const newStateBefore = {
      hasGraphicsLayer: !!this.graphicsLayerRef.current,
      graphicsLayerId: this.graphicsLayerRef.current?.id || null,
      hasMapView: !!this.mapViewRef.current,
      viewType: this.mapViewRef.current?.type || null
    }
    
    debugLogger.log('CHUNK-4-COMPARE', {
      event: 'new-implementation-cleanupGraphicsLayer-before',
      widgetId,
      newImplementation: {
        stateBefore: newStateBefore,
        timestamp: Date.now()
      }
    })

    const mapView = this.mapViewRef.current
    if (mapView) {
      cleanupGraphicsLayer(widgetId, mapView)
      this.mapViewRef.current = null
      this.graphicsLayerRef.current = null

      const newStateAfter = {
        hasGraphicsLayer: !!this.graphicsLayerRef.current,
        graphicsLayerId: this.graphicsLayerRef.current?.id || null,
        hasMapView: !!this.mapViewRef.current,
        viewType: this.mapViewRef.current?.type || null
      }

      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-cleanupGraphicsLayer-complete',
        widgetId,
        newImplementation: {
          stateBefore: newStateBefore,
          stateAfter: newStateAfter,
          result: 'complete',
          timestamp: Date.now()
        }
      })

      // Call callback if provided
      if (callbacks?.onGraphicsLayerCleaned) {
        callbacks.onGraphicsLayerCleaned()
      }
    } else {
      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-cleanupGraphicsLayer-skipped',
        widgetId,
        newImplementation: {
          stateBefore: newStateBefore,
          result: 'skipped',
          reason: 'no-map-view',
          timestamp: Date.now()
        }
      })
    }
  }

  /**
   * Clears all graphics from the graphics layer if it exists.
   * 
   * @param widgetId - Widget ID for logging
   * @param config - Widget configuration
   */
  clearGraphics(widgetId: string, config: IMConfig): void {
    // Chunk 4: Comparison logging - new implementation
    const graphicsLayer = this.graphicsLayerRef.current
    const newStateBefore = {
      hasGraphicsLayer: !!graphicsLayer,
      graphicsLayerId: graphicsLayer?.id || null,
      graphicsCount: graphicsLayer?.graphics.length || 0
    }
    
    debugLogger.log('CHUNK-4-COMPARE', {
      event: 'new-implementation-clearGraphicsLayerIfExists-before',
      widgetId,
      newImplementation: {
        stateBefore: newStateBefore,
        timestamp: Date.now()
      }
    })
    
    if (graphicsLayer) {
      const { clearGraphicsLayer } = require('../graphics-layer-utils')
      clearGraphicsLayer(graphicsLayer)
      
      const newStateAfter = {
        hasGraphicsLayer: !!this.graphicsLayerRef.current,
        graphicsLayerId: this.graphicsLayerRef.current?.id || null,
        graphicsCount: this.graphicsLayerRef.current?.graphics.length || 0
      }
      
      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-clearGraphicsLayerIfExists-complete',
        widgetId,
        newImplementation: {
          stateBefore: newStateBefore,
          stateAfter: newStateAfter,
          result: 'complete',
          graphicsLayerId: graphicsLayer.id,
          timestamp: Date.now()
        }
      })
    } else {
      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-clearGraphicsLayerIfExists-skipped',
        widgetId,
        newImplementation: {
          stateBefore: newStateBefore,
          result: 'skipped',
          reason: 'no-graphics-layer',
          timestamp: Date.now()
        }
      })
    }
  }

  /**
   * Gets the current graphics layer.
   */
  getGraphicsLayer(): __esri.GraphicsLayer | null {
    return this.graphicsLayerRef.current
  }

  /**
   * Checks if graphics layer should be initialized based on config and current state.
   * 
   * @param config - Widget configuration
   * @param mapView - Map view to check
   * @returns true if graphics layer should be initialized
   */
  shouldInitialize(
    config: IMConfig,
    mapView: __esri.MapView | __esri.SceneView | null
  ): boolean {
    return !!(mapView && !this.graphicsLayerRef.current)
  }
}

