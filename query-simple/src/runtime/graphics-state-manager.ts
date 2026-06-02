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

// r028.098 (Chunk D of Path 2 Removal): deleted all Path-2-only state from this
// manager — the MapView cache (`_mapViewCache` + get/set/deleteMapView), the
// GroupLayer creation-lock (`_groupLayerCreation` + get/set/delete/hasGroupLayerCreation),
// and the legend-FL visibility handles (`_legendVisibilityHandles` /
// `_legendVisibilityHandleIds` + their 6 accessors). All were caller-less after
// Chunk C. Dropped the now-unused `GroupLayer` / `MapView` / `SceneView` imports, the
// `WatchHandle` type, and the `debugLogger` (its only uses were the PATH-2
// instrumentation logs inside the deleted methods). Remaining state is Path-1/Path-3
// shared: the GraphicsLayer creation-lock and lastBufferGraphic.
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type Graphic from '@arcgis/core/Graphic'

class GraphicsStateManager {
  private static instance: GraphicsStateManager

  // Global sequence counter for graphics operations to track timing across calls
  private _operationSequence: number = 0

  // r024.61: Track in-progress GraphicsLayer creation to prevent race condition duplicates.
  // Without this, concurrent calls both pass the "does it exist?" check before either adds
  // to the map, creating two layers with the same ID.
  private _graphicsLayerCreation = new Map<string, Promise<GraphicsLayer | null>>()

  // r025.015: Buffer visibility watcher removed — buffer layer is now added
  // INSIDE the GroupLayer, so visibilityMode:'inherited' handles visibility
  // automatically. No watcher handle storage needed.

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
