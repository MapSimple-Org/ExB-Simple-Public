import React from 'react'
import { type AllWidgetProps, type DataSource } from 'jimu-core'
import { type IMConfig } from '../../config'
import { createOrGetGraphicsLayer, createOrGetResultGroupLayer, cleanupGraphicsLayer, cleanupGroupLayer, clearGraphicsLayerOrGroupLayer } from '../graphics-layer-utils'
import { createQuerySimpleDebugLogger, widgetConfigManager } from 'widgets/shared-code/mapsimple-common'
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type GroupLayer from '@arcgis/core/layers/GroupLayer'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'
import type Layer from '@arcgis/core/layers/Layer'

const debugLogger = createQuerySimpleDebugLogger()

interface GraphicsLayerCallbacks {
  onGraphicsLayerInitialized?: (graphicsLayer: GraphicsLayer) => void
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
  private graphicsLayerRef: React.RefObject<GraphicsLayer | null>
  private mapViewRef: React.RefObject<MapView | SceneView | null>
  // r027.033: When useGroupLayer is true the GraphicsLayer is wrapped in a
  // GroupLayer. Track the parent here so cleanup/clear can target it without
  // exposing it to consumers (who only need the inner GraphicsLayer).
  private groupLayer: GroupLayer | null = null

  constructor(
    graphicsLayerRef: React.RefObject<GraphicsLayer | null>,
    mapViewRef: React.RefObject<MapView | SceneView | null>
  ) {
    this.graphicsLayerRef = graphicsLayerRef
    this.mapViewRef = mapViewRef
  }

  /**
   * r027.086: Returns the "results layer" — the layer that consumers should
   * pass to `addHighlightGraphics`, `removeHighlightGraphics`, and
   * `ensureLegendFeatureLayer`.
   *
   * In GroupLayer mode (`addResultsAsMapLayer: true`), that's the parent
   * GroupLayer — those utility functions discriminate at runtime via
   * `type === 'group'` and walk the GroupLayer's sublayers to find or
   * maintain the legend FeatureLayer. In flat mode, it's the inner
   * GraphicsLayer (same as `graphicsLayerRef.current`).
   *
   * `graphicsLayerRef.current` always holds the inner GraphicsLayer (the
   * manager's invariant since r027.033). This accessor returns the parent
   * GroupLayer when one exists, falling back to the inner GraphicsLayer
   * otherwise. Use this instead of reading `graphicsLayerRef.current`
   * directly anywhere the legend semantics matter.
   */
  public getResultsLayer (): GraphicsLayer | GroupLayer | null {
    return this.groupLayer ?? this.graphicsLayerRef.current
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
    // r024.2: Check if LayerList mode is enabled
    const useGroupLayer = widgetConfigManager.getAddResultsAsMapLayer(widgetId)
    
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
      useGroupLayer,
      newImplementation: {
        stateBefore: newStateBefore,
        mapViewType: mapView.type || 'unknown',
        timestamp: Date.now()
      }
    })
    
    try {
      // r024.2: Create GroupLayer or GraphicsLayer based on config
      // r027.033: When useGroupLayer, the actual GraphicsLayer lives inside the
      // GroupLayer. Resolve it by predictable child id and store the parent
      // separately so consumers always see a real GraphicsLayer.
      const layer = useGroupLayer
        ? await createOrGetResultGroupLayer(widgetId, mapView)
        : await createOrGetGraphicsLayer(widgetId, mapView)
      if (!layer) {
        debugLogger.log('CHUNK-4-COMPARE', {
          event: 'new-implementation-initializeGraphicsLayer-failed',
          widgetId,
          useGroupLayer,
          newImplementation: {
            stateBefore: newStateBefore,
            result: 'failed',
            reason: useGroupLayer ? 'group-layer-creation-failed' : 'graphics-layer-creation-failed',
            timestamp: Date.now()
          }
        })
        return null
      }

      let graphicsLayer: GraphicsLayer
      if (useGroupLayer) {
        const groupLayer = layer as GroupLayer
        // Inner id pattern set by createGroupLayerInternal: `${groupLayer.id}-graphics`
        const innerId = `${groupLayer.id}-graphics`
        const inner = groupLayer.layers.find(l => l.id === innerId) as GraphicsLayer | undefined
        if (!inner) {
          debugLogger.log('CHUNK-4-COMPARE', {
            event: 'new-implementation-initializeGraphicsLayer-failed',
            widgetId,
            useGroupLayer,
            newImplementation: {
              stateBefore: newStateBefore,
              result: 'failed',
              reason: 'inner-graphics-layer-not-found',
              groupLayerId: groupLayer.id,
              expectedInnerId: innerId,
              timestamp: Date.now()
            }
          })
          return null
        }
        this.groupLayer = groupLayer
        graphicsLayer = inner
      } else {
        this.groupLayer = null
        graphicsLayer = layer as GraphicsLayer
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
        useGroupLayer,
        newImplementation: {
          stateBefore: newStateBefore,
          stateAfter: newStateAfter,
          result: 'success',
          layerId: graphicsLayer.id,
          layerType: useGroupLayer ? 'group' : 'graphics',
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
    // r027.033: groupLayer ref tells us which cleanup path to use without
    // having to introspect a runtime type on a now-narrowed graphicsLayerRef.
    const isGroupLayer = !!this.groupLayer
    
    // Chunk 4: Comparison logging - new implementation
    const newStateBefore = {
      hasGraphicsLayer: !!this.graphicsLayerRef.current,
      graphicsLayerId: this.graphicsLayerRef.current?.id || null,
      hasMapView: !!this.mapViewRef.current,
      viewType: this.mapViewRef.current?.type || null,
      isGroupLayer
    }
    
    debugLogger.log('CHUNK-4-COMPARE', {
      event: 'new-implementation-cleanupGraphicsLayer-before',
      widgetId,
      isGroupLayer,
      newImplementation: {
        stateBefore: newStateBefore,
        timestamp: Date.now()
      }
    })

    const mapView = this.mapViewRef.current
    if (mapView) {
      // r024.2: Use appropriate cleanup based on layer type
      if (isGroupLayer) {
        cleanupGroupLayer(widgetId, mapView)
      } else {
        cleanupGraphicsLayer(widgetId, mapView)
      }
      this.mapViewRef.current = null
      this.graphicsLayerRef.current = null
      this.groupLayer = null

      const newStateAfter = {
        hasGraphicsLayer: !!this.graphicsLayerRef.current,
        graphicsLayerId: this.graphicsLayerRef.current?.id || null,
        hasMapView: !!this.mapViewRef.current,
        viewType: this.mapViewRef.current?.type || null
      }

      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-cleanupGraphicsLayer-complete',
        widgetId,
        isGroupLayer,
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
    // r027.033: Read group via dedicated ref, not by introspecting graphicsLayerRef.
    const graphicsLayer = this.graphicsLayerRef.current
    const isGroupLayer = !!this.groupLayer

    // r024.2: Get graphics count based on layer type
    let graphicsCount = 0
    if (this.groupLayer) {
      this.groupLayer.layers.forEach((sublayer: Layer) => {
        const glSub = sublayer as GraphicsLayer
        if (glSub.graphics) graphicsCount += glSub.graphics.length
      })
    } else if (graphicsLayer) {
      graphicsCount = graphicsLayer.graphics?.length || 0
    }

    const newStateBefore = {
      hasGraphicsLayer: !!graphicsLayer,
      graphicsLayerId: graphicsLayer?.id || null,
      graphicsCount,
      isGroupLayer
    }
    
    debugLogger.log('CHUNK-4-COMPARE', {
      event: 'new-implementation-clearGraphicsLayerIfExists-before',
      widgetId,
      isGroupLayer,
      newImplementation: {
        stateBefore: newStateBefore,
        timestamp: Date.now()
      }
    })
    
    // r027.033: Clear the parent group when present so legend sub-layers are
    // also cleared; otherwise just the standalone GraphicsLayer.
    const targetForClear = this.groupLayer || graphicsLayer
    if (targetForClear) {
      // r024.2: Use unified clear function
      clearGraphicsLayerOrGroupLayer(targetForClear)

      const newStateAfter = {
        hasGraphicsLayer: !!this.graphicsLayerRef.current,
        graphicsLayerId: this.graphicsLayerRef.current?.id || null,
        graphicsCount: 0
      }

      debugLogger.log('CHUNK-4-COMPARE', {
        event: 'new-implementation-clearGraphicsLayerIfExists-complete',
        widgetId,
        isGroupLayer,
        newImplementation: {
          stateBefore: newStateBefore,
          stateAfter: newStateAfter,
          result: 'complete',
          layerId: targetForClear.id,
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
   * Always a GraphicsLayer or null — never the outer GroupLayer.
   */
  getGraphicsLayer(): GraphicsLayer | null {
    return this.graphicsLayerRef.current
  }

  /**
   * r027.033: Returns the parent GroupLayer when useGroupLayer mode is active,
   * else null. For parent-only ops (LayerList visibility, sibling legend
   * layers). For graphics manipulation use getGraphicsLayer().
   */
  getGroupLayer(): GroupLayer | null {
    return this.groupLayer
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
    mapView: MapView | SceneView | null
  ): boolean {
    return !!(mapView && !this.graphicsLayerRef.current)
  }
}

