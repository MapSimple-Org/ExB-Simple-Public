import React from 'react'
import { type AllWidgetProps, type DataSource } from 'jimu-core'
import { type IMConfig } from '../../config'
// r028.096 (Chunk B of Path 2 Removal): dropped imports for `createOrGetResultGroupLayer`,
// `cleanupGroupLayer` (slated for deletion in Chunk C) along with `GroupLayer` and `Layer`
// type imports (no longer referenced after the manager collapsed to Path-1-only).
import { createOrGetGraphicsLayer, cleanupGraphicsLayer, clearGraphicsLayerOrGroupLayer } from '../graphics-layer-utils'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'

const debugLogger = createQuerySimpleDebugLogger()

interface GraphicsLayerCallbacks {
  onGraphicsLayerInitialized?: (graphicsLayer: GraphicsLayer) => void
  onGraphicsLayerCleaned?: () => void
}

/**
 * Utility to manage graphics layer initialization and cleanup.
 *
 * r028.096 (Chunk B of Path 2 Removal): manager collapsed to Path-1-only. The
 * pre-collapse version dispatched between Path 2's empty-FL-proxy GroupLayer and
 * a plain Path 1 GraphicsLayer based on `addResultsAsMapLayer`. Post-Phase-1,
 * that flag means "use Path 3" (which has its own factory) and never routes
 * through this manager — so the manager only ever creates Path 1 layers now.
 * The `groupLayer` field, `getGroupLayer()` accessor, `useGroupLayer` branches,
 * and `getResultsLayer()` dispatch are all gone.
 *
 * Note: This is a utility class (not a hook) to work with class components.
 */
export class GraphicsLayerManager {
  private graphicsLayerRef: React.RefObject<GraphicsLayer | null>
  private mapViewRef: React.RefObject<MapView | SceneView | null>

  constructor(
    graphicsLayerRef: React.RefObject<GraphicsLayer | null>,
    mapViewRef: React.RefObject<MapView | SceneView | null>
  ) {
    this.graphicsLayerRef = graphicsLayerRef
    this.mapViewRef = mapViewRef
  }

  /**
   * r027.086 (original) / r028.096 (Chunk B): Returns the "results layer" — the
   * layer that consumers pass to `addHighlightGraphics` / `removeHighlightGraphics`.
   * Post-Chunk-B this is always the inner GraphicsLayer (the `groupLayer` parent
   * is gone). The accessor is kept as a thin passthrough so callers in widget.tsx
   * don't need to change. Eligible for inlining + deletion in Phase 4 cleanup.
   */
  public getResultsLayer (): GraphicsLayer | null {
    return this.graphicsLayerRef.current
  }

  /**
   * Initializes the graphics layer for map highlighting.
   * r024.2: Conditionally creates GroupLayer or GraphicsLayer based on config.
   * 
   * Creates or retrieves a graphics layer and adds it to the map view.
   * 
   * @param widgetId - Widget ID for graphics layer naming
   * @param mapView - The ArcGIS MapView or SceneView instance
   * @param callbacks - Optional callbacks for initialization events
   * 
   * @returns Promise resolving to the graphics layer or group layer, or null if initialization failed
   */
  async initialize(
    widgetId: string,
    mapView: MapView | SceneView,
    callbacks?: GraphicsLayerCallbacks
  ): Promise<GraphicsLayer | null> {
    // r028.096 (Chunk B of Path 2 Removal): collapsed to Path-1-only. The
    // `useGroupLayer` branch (which created Path 2's GroupLayer + extracted inner
    // GraphicsLayer by id) is gone along with the `groupLayer` field and the
    // PATH-2 instrumentation. All call sites in widget.tsx are gated on
    // `addResultsAsMapLayer !== true`, so this manager is only entered for Path 1.

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
          layerId: graphicsLayer.id,
          layerType: 'graphics',
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
    mapView: MapView | SceneView | null,
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
   * Cleans up the graphics layer or group layer.
   * r024.2: Conditionally calls cleanupGroupLayer or cleanupGraphicsLayer.
   * 
   * Removes the layer from the map view and clears internal references.
   * 
   * @param widgetId - Widget ID
   * @param callbacks - Optional callbacks
   */
  cleanup(
    widgetId: string,
    callbacks?: GraphicsLayerCallbacks
  ): void {
    // r028.096 (Chunk B of Path 2 Removal): the `isGroupLayer` dispatch (which chose
    // between `cleanupGroupLayer` and `cleanupGraphicsLayer`) is gone. Manager
    // only manages a Path 1 GraphicsLayer; cleanup always calls
    // `cleanupGraphicsLayer`. `this.groupLayer` field also gone.

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
   * Clears all graphics from the graphics layer or group layer if it exists.
   * r024.2: Uses clearGraphicsLayerOrGroupLayer to handle both types.
   * 
   * @param widgetId - Widget ID for logging
   * @param config - Widget configuration
   */
  clearGraphics(widgetId: string, config: IMConfig): void {
    // r028.096 (Chunk B of Path 2 Removal): collapsed. Pre-Phase-1 this method
    // chose between clearing Path 2's parent GroupLayer (so legend sublayers
    // also got cleared) and clearing the Path 1 GraphicsLayer alone. Path 2 is
    // gone; only the GraphicsLayer is left to clear.
    const graphicsLayer = this.graphicsLayerRef.current
    const graphicsCount = graphicsLayer?.graphics?.length || 0

    const newStateBefore = {
      hasGraphicsLayer: !!graphicsLayer,
      graphicsLayerId: graphicsLayer?.id || null,
      graphicsCount
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
      clearGraphicsLayerOrGroupLayer(graphicsLayer)

      const newStateAfter = {
        hasGraphicsLayer: !!this.graphicsLayerRef.current,
        graphicsLayerId: this.graphicsLayerRef.current?.id || null,
        graphicsCount: 0
      }

      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-clearGraphicsLayerIfExists-complete',
        widgetId,
        newImplementation: {
          stateBefore: newStateBefore,
          stateAfter: newStateAfter,
          result: 'complete',
          layerId: graphicsLayer.id,
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
   * Gets the inner GraphicsLayer (the one graphics are drawn into).
   */
  getGraphicsLayer(): GraphicsLayer | null {
    return this.graphicsLayerRef.current
  }

  // r028.096 (Chunk B of Path 2 Removal): `getGroupLayer()` was here. It returned
  // the Path 2 parent GroupLayer for LayerList/legend operations. Zero external
  // callers (audit confirmed); deleted along with the `groupLayer` field.

  /**
   * Checks if graphics layer should be initialized based on config and current state.
   * 
   * @param config - Widget configuration
   * @param mapView - Map view to check
   * @returns true if graphics layer should be initialized
   */
  shouldInitialize(
    config: IMConfig,
    mapView: MapView | SceneView | null
  ): boolean {
    return !!(mapView && !this.graphicsLayerRef.current)
  }
}

