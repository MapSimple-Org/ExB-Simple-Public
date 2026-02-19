/**
 * GlobalHandleManager - Centralized tracking and cleanup of ESRI handles/watchers
 * 
 * r024.31: Created to address memory leaks from ESRI ObservationHandle accumulation.
 * 
 * Purpose:
 * - Track all ESRI handles (watch, on, reactiveUtils) by widget ID
 * - Provide purgeAll() for complete cleanup on Clear/New Query
 * - Enable individual handle removal when items are destroyed one-by-one
 * 
 * Usage:
 * - import { globalHandleManager } from 'widgets/shared-code/mapsimple-common'
 * - globalHandleManager.track(widgetId, handle, 'descriptive-category')
 * - globalHandleManager.purgeAll(widgetId) // On clear/new query
 * - globalHandleManager.remove(widgetId, 'specific-handle-id') // Individual cleanup
 */

type HandleType = 'watch' | 'on' | 'event' | 'removal-listener' | 'legend-visibility' | 'feature-widget' | 'other'

interface TrackedHandle {
  id: string
  handle: __esri.Handle | __esri.WatchHandle | { remove: () => void }
  type: HandleType
  description?: string
  createdAt: number
}

interface WidgetHandles {
  handles: Map<string, TrackedHandle>
  createdAt: number
}

class GlobalHandleManager {
  private widgetHandles: Map<string, WidgetHandles> = new Map()
  private handleIdCounter: number = 0
  private debugEnabled: boolean = false

  constructor() {
    // Check URL for debug flag
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search)
        const debug = params.get('debug')
        this.debugEnabled = debug === 'all' || debug?.includes('HANDLES') || false
      } catch (e) {
        // Ignore URL parsing errors
      }
    }
  }

  /**
   * Generates a unique handle ID
   */
  private generateId(type: HandleType, description?: string): string {
    return `${type}-${++this.handleIdCounter}-${description || 'anon'}-${Date.now()}`
  }

  /**
   * Log a message if debug is enabled
   */
  private log(event: string, data: Record<string, any>): void {
    if (this.debugEnabled) {
      console.log(`[HANDLE-MANAGER-${event}]`, JSON.stringify({ ...data, timestamp: Date.now() }, null, 2))
    }
  }

  /**
   * Ensures the widget has a handle container
   */
  private ensureWidgetContainer(widgetId: string): WidgetHandles {
    if (!this.widgetHandles.has(widgetId)) {
      this.widgetHandles.set(widgetId, {
        handles: new Map(),
        createdAt: Date.now()
      })
    }
    return this.widgetHandles.get(widgetId)!
  }

  /**
   * Track a handle for a widget
   * @param widgetId - Widget ID that owns this handle
   * @param handle - The ESRI handle/watcher to track
   * @param type - Category of handle for debugging
   * @param description - Optional description for debugging
   * @returns The handle ID for later individual removal
   */
  track(
    widgetId: string,
    handle: __esri.Handle | __esri.WatchHandle | { remove: () => void },
    type: HandleType = 'other',
    description?: string
  ): string {
    const container = this.ensureWidgetContainer(widgetId)
    const id = this.generateId(type, description)
    
    container.handles.set(id, {
      id,
      handle,
      type,
      description,
      createdAt: Date.now()
    })

    this.log('TRACK', {
      widgetId,
      handleId: id,
      type,
      description,
      totalHandlesForWidget: container.handles.size
    })

    return id
  }

  /**
   * Remove a specific handle by ID
   * @param widgetId - Widget ID
   * @param handleId - The handle ID returned from track()
   * @returns true if handle was found and removed
   */
  remove(widgetId: string, handleId: string): boolean {
    const container = this.widgetHandles.get(widgetId)
    if (!container) {
      this.log('REMOVE-WIDGET-NOT-FOUND', { widgetId, handleId })
      return false
    }

    const tracked = container.handles.get(handleId)
    if (!tracked) {
      this.log('REMOVE-HANDLE-NOT-FOUND', { widgetId, handleId })
      return false
    }

    try {
      tracked.handle.remove()
    } catch (e) {
      this.log('REMOVE-ERROR', {
        widgetId,
        handleId,
        error: e instanceof Error ? e.message : String(e)
      })
    }

    container.handles.delete(handleId)
    
    this.log('REMOVE-SUCCESS', {
      widgetId,
      handleId,
      type: tracked.type,
      description: tracked.description,
      remainingHandles: container.handles.size
    })

    return true
  }

  /**
   * Remove all handles of a specific type for a widget
   * @param widgetId - Widget ID
   * @param type - Handle type to remove
   * @returns Number of handles removed
   */
  removeByType(widgetId: string, type: HandleType): number {
    const container = this.widgetHandles.get(widgetId)
    if (!container) return 0

    let removedCount = 0
    const toRemove: string[] = []

    container.handles.forEach((tracked, id) => {
      if (tracked.type === type) {
        toRemove.push(id)
      }
    })

    toRemove.forEach(id => {
      const tracked = container.handles.get(id)
      if (tracked) {
        try {
          tracked.handle.remove()
          removedCount++
        } catch (e) {
          this.log('REMOVE-BY-TYPE-ERROR', {
            widgetId,
            handleId: id,
            type,
            error: e instanceof Error ? e.message : String(e)
          })
        }
        container.handles.delete(id)
      }
    })

    this.log('REMOVE-BY-TYPE', {
      widgetId,
      type,
      removedCount,
      remainingHandles: container.handles.size
    })

    return removedCount
  }

  /**
   * Purge all handles for a widget (on Clear All / New Query)
   * @param widgetId - Widget ID
   * @returns Object with count of purged handles and any errors
   */
  purgeAll(widgetId: string): { purged: number; errors: number } {
    const container = this.widgetHandles.get(widgetId)
    if (!container) {
      this.log('PURGE-WIDGET-NOT-FOUND', { widgetId })
      return { purged: 0, errors: 0 }
    }

    let purged = 0
    let errors = 0
    const handleTypes: Record<string, number> = {}

    container.handles.forEach((tracked, id) => {
      handleTypes[tracked.type] = (handleTypes[tracked.type] || 0) + 1
      try {
        tracked.handle.remove()
        purged++
      } catch (e) {
        errors++
        this.log('PURGE-HANDLE-ERROR', {
          widgetId,
          handleId: id,
          type: tracked.type,
          description: tracked.description,
          error: e instanceof Error ? e.message : String(e)
        })
      }
    })

    container.handles.clear()

    this.log('PURGE-ALL', {
      widgetId,
      purged,
      errors,
      handleTypeBreakdown: handleTypes
    })

    return { purged, errors }
  }

  /**
   * Get stats for a widget's tracked handles
   * @param widgetId - Widget ID
   * @returns Stats object or null if widget not tracked
   */
  getStats(widgetId: string): { total: number; byType: Record<string, number> } | null {
    const container = this.widgetHandles.get(widgetId)
    if (!container) return null

    const byType: Record<string, number> = {}
    container.handles.forEach(tracked => {
      byType[tracked.type] = (byType[tracked.type] || 0) + 1
    })

    return {
      total: container.handles.size,
      byType
    }
  }

  /**
   * Get global stats across all widgets
   */
  getGlobalStats(): { totalWidgets: number; totalHandles: number; byWidget: Record<string, number> } {
    const byWidget: Record<string, number> = {}
    let totalHandles = 0

    this.widgetHandles.forEach((container, widgetId) => {
      byWidget[widgetId] = container.handles.size
      totalHandles += container.handles.size
    })

    return {
      totalWidgets: this.widgetHandles.size,
      totalHandles,
      byWidget
    }
  }

  /**
   * Destroy all tracking for a widget (widget unmount)
   * Same as purgeAll but also removes the widget container
   */
  destroy(widgetId: string): { purged: number; errors: number } {
    const result = this.purgeAll(widgetId)
    this.widgetHandles.delete(widgetId)
    
    this.log('DESTROY', {
      widgetId,
      ...result
    })
    
    return result
  }
}

// Singleton instance
export const globalHandleManager = new GlobalHandleManager()
