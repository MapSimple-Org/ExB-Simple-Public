/**
 * GraphicsStateManager
 *
 * Centralized manager for graphics layer shared state. Owns the module-level
 * Maps that were previously scattered as variables in graphics-layer-utils.ts.
 *
 * Follows the HighlightConfigManager singleton pattern so both
 * graphics-layer-utils.ts (create/add) and graphics-cleanup-utils.ts
 * (clear/cleanup) access the same state without exported mutable variables.
 *
 * @since 1.19.0-r024.120
 */

import type GroupLayer from '@arcgis/core/layers/GroupLayer'
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'
import type Graphic from '@arcgis/core/Graphic'
/** Minimal handle type — JSAPI 5.0 exports ResourceHandle, 4.x does not. */
type WatchHandle = { remove(): void }

class GraphicsStateManager {
  private static instance: GraphicsStateManager

  // Global sequence counter for graphics operations to track timing across calls
  private _operationSequence: number = 0

  // r024.17: Track in-progress GroupLayer creation to prevent race condition duplicates
  private _groupLayerCreation = new Map<string, Promise<GroupLayer | null>>()

  // r024.61: Track in-progress GraphicsLayer creation to prevent race condition duplicates.
  // Without this, concurrent calls both pass the "does it exist?" check before either adds
  // to the map, creating two layers with the same ID.
  private _graphicsLayerCreation = new Map<string, Promise<GraphicsLayer | null>>()

  // r024.19: Track Legend FeatureLayer visibility watch handles for cleanup
  // r024.31: Now also tracked in globalHandleManager for centralized cleanup
  private _legendVisibilityHandles = new Map<string, WatchHandle>()
  private _legendVisibilityHandleIds = new Map<string, string>() // legendLayerId -> globalHandleManager handleId

  // r025.015: Buffer visibility watcher removed — buffer layer is now added
  // INSIDE the GroupLayer, so visibilityMode:'inherited' handles visibility
  // automatically. No watcher handle storage needed.

  // r024.59: Cache mapView per widgetId so the legend-layer visibility watcher
  // can close the popup when the user toggles the layer off in the Layer List.
  private _mapViewCache = new Map<string, MapView | SceneView>()

  // r025.020: Store last buffer graphic per widget for imperative restore on panel reopen.
  // Effects are unreliable for panel close/reopen — imperative clear/restore is symmetric
  // with how highlight graphics are handled (clearSelectionFromMap / addSelectionToMap).
  private _lastBufferGraphic = new Map<string, Graphic>()

  private constructor() {
    // Private constructor enforces singleton pattern
  }

  public static getInstance(): GraphicsStateManager {
    if (!GraphicsStateManager.instance) {
      GraphicsStateManager.instance = new GraphicsStateManager()
    }
    return GraphicsStateManager.instance
  }

  // ---------------------------------------------------------------------------
  // Operation sequence
  // ---------------------------------------------------------------------------

  /** Atomic increment-and-return for operation tracking. */
  public nextSequence(): number {
    return ++this._operationSequence
  }

  // ---------------------------------------------------------------------------
  // GroupLayer creation lock
  // ---------------------------------------------------------------------------

  public getGroupLayerCreation(layerId: string): Promise<GroupLayer | null> | undefined {
    return this._groupLayerCreation.get(layerId)
  }

  public setGroupLayerCreation(layerId: string, promise: Promise<GroupLayer | null>): void {
    this._groupLayerCreation.set(layerId, promise)
  }

  public deleteGroupLayerCreation(layerId: string): boolean {
    return this._groupLayerCreation.delete(layerId)
  }

  public hasGroupLayerCreation(layerId: string): boolean {
    return this._groupLayerCreation.has(layerId)
  }

  // ---------------------------------------------------------------------------
  // GraphicsLayer creation lock
  // ---------------------------------------------------------------------------

  public getGraphicsLayerCreation(layerId: string): Promise<GraphicsLayer | null> | undefined {
    return this._graphicsLayerCreation.get(layerId)
  }

  public setGraphicsLayerCreation(layerId: string, promise: Promise<GraphicsLayer | null>): void {
    this._graphicsLayerCreation.set(layerId, promise)
  }

  public deleteGraphicsLayerCreation(layerId: string): boolean {
    return this._graphicsLayerCreation.delete(layerId)
  }

  public hasGraphicsLayerCreation(layerId: string): boolean {
    return this._graphicsLayerCreation.has(layerId)
  }

  // ---------------------------------------------------------------------------
  // Legend visibility watch handles
  // ---------------------------------------------------------------------------

  public getLegendVisibilityHandle(legendLayerId: string): WatchHandle | undefined {
    return this._legendVisibilityHandles.get(legendLayerId)
  }

  public setLegendVisibilityHandle(legendLayerId: string, handle: WatchHandle): void {
    this._legendVisibilityHandles.set(legendLayerId, handle)
  }

  public deleteLegendVisibilityHandle(legendLayerId: string): boolean {
    return this._legendVisibilityHandles.delete(legendLayerId)
  }

  // ---------------------------------------------------------------------------
  // Legend visibility handle IDs (for globalHandleManager cleanup)
  // ---------------------------------------------------------------------------

  public getLegendVisibilityHandleId(legendLayerId: string): string | undefined {
    return this._legendVisibilityHandleIds.get(legendLayerId)
  }

  public setLegendVisibilityHandleId(legendLayerId: string, handleId: string): void {
    this._legendVisibilityHandleIds.set(legendLayerId, handleId)
  }

  public deleteLegendVisibilityHandleId(legendLayerId: string): boolean {
    return this._legendVisibilityHandleIds.delete(legendLayerId)
  }

  // ---------------------------------------------------------------------------
  // MapView cache
  // ---------------------------------------------------------------------------

  public getMapView(widgetId: string): MapView | SceneView | undefined {
    return this._mapViewCache.get(widgetId)
  }

  public setMapView(widgetId: string, mapView: MapView | SceneView): void {
    this._mapViewCache.set(widgetId, mapView)
  }

  public deleteMapView(widgetId: string): boolean {
    return this._mapViewCache.delete(widgetId)
  }

  // ---------------------------------------------------------------------------
  // Last buffer graphic (for imperative restore on panel reopen)
  // ---------------------------------------------------------------------------

  public getLastBufferGraphic(widgetId: string): Graphic | undefined {
    return this._lastBufferGraphic.get(widgetId)
  }

  public setLastBufferGraphic(widgetId: string, graphic: Graphic): void {
    this._lastBufferGraphic.set(widgetId, graphic)
  }

  public deleteLastBufferGraphic(widgetId: string): boolean {
    return this._lastBufferGraphic.delete(widgetId)
  }
}

/**
 * Export singleton instance
 */
export const graphicsStateManager = GraphicsStateManager.getInstance()
