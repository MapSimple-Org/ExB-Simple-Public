import React from 'react'
import { type AllWidgetProps } from 'jimu-core'
import { type IMConfig } from '../../config'
import { type JimuMapView } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

interface MapViewCallbacks {
  onMapViewChange?: (jimuMapView: JimuMapView | null) => void
}

/**
 * Utility to manage map view ref and view change handlers.
 * 
 * Centralizes map view management logic for the widget.
 * Handles JimuMapView changes and maintains refs for map view access.
 * 
 * Part of Chunk 6: Map View Management extraction.
 * 
 * Note: This is a utility class (not a hook) to work with class components.
 */
export class MapViewManager {
  private mapViewRef: React.RefObject<__esri.MapView | __esri.SceneView | null>
  private jimuMapView: JimuMapView | null = null

  constructor(mapViewRef: React.RefObject<__esri.MapView | __esri.SceneView | null>) {
    this.mapViewRef = mapViewRef
  }

  /**
   * Handles JimuMapView change from JimuMapViewComponent.
   * Updates internal state and calls callbacks.
   */
  handleJimuMapViewChanged(
    jimuMapView: JimuMapView | null,
    props: AllWidgetProps<IMConfig>,
    callbacks: MapViewCallbacks
  ): void {
    const { id } = props
    
    debugLogger.log('MAP-EXTENT', {
      event: 'handleJimuMapViewChanged',
      widgetId: id,
      hasJimuMapView: !!jimuMapView,
      hasView: !!(jimuMapView?.view),
      viewType: jimuMapView?.view?.type || 'none',
      timestamp: Date.now()
    })
    
    // Store JimuMapView internally
    this.jimuMapView = jimuMapView
    
    // Update map view ref if view is available
    if (jimuMapView?.view) {
      this.mapViewRef.current = jimuMapView.view
    } else {
      this.mapViewRef.current = null
    }
    
    // Call callback to update widget state
    if (callbacks.onMapViewChange) {
      callbacks.onMapViewChange(jimuMapView)
    }
  }

  /**
   * Gets the current JimuMapView.
   */
  getJimuMapView(): JimuMapView | null {
    return this.jimuMapView
  }

  /**
   * Gets the current map view from ref.
   */
  getMapView(): __esri.MapView | __esri.SceneView | null {
    return this.mapViewRef.current
  }

  /**
   * Cleans up map view references.
   */
  cleanup(): void {
    this.mapViewRef.current = null
    this.jimuMapView = null
  }
}

