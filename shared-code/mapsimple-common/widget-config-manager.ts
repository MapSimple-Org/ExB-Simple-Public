/**
 * WidgetConfigManager
 *
 * Centralized singleton for widget configuration.
 * Provides a single source of truth for all config settings across QuerySimple widgets,
 * eliminating prop-drilling for config values that are static for the widget lifetime.
 *
 * Features:
 * - Singleton pattern (one instance for entire app)
 * - Per-widget configuration storage (keyed by widgetId)
 * - Fallback defaults for all properties
 * - Type-safe configuration access
 *
 * Usage:
 * ```typescript
 * import { widgetConfigManager } from 'widgets/shared-code/mapsimple-common'
 *
 * // Register widget config on mount
 * widgetConfigManager.registerConfig(widgetId, config)
 *
 * // Get config values from any component
 * const showHeader = widgetConfigManager.getShowHeader(widgetId)
 * const fillColor = widgetConfigManager.getFillColor(widgetId)
 *
 * // Unregister on unmount
 * widgetConfigManager.unregisterConfig(widgetId)
 * ```
 *
 * History:
 * - Originally named HighlightConfigManager (graphics symbology only)
 * - r027.014: Renamed to WidgetConfigManager to reflect broader config scope
 */

import { type IMConfig as QuerySimpleConfig } from '../../query-simple/src/config'

class WidgetConfigManager {
  private static instance: WidgetConfigManager
  private configCache: Map<string, QuerySimpleConfig> = new Map()

  private constructor() {
    // Private constructor enforces singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): WidgetConfigManager {
    if (!WidgetConfigManager.instance) {
      WidgetConfigManager.instance = new WidgetConfigManager()
    }
    return WidgetConfigManager.instance
  }

  /**
   * Register widget configuration
   * Call this when widget mounts or config changes
   */
  public registerConfig(widgetId: string, config: QuerySimpleConfig): void {
    this.configCache.set(widgetId, config)
  }

  /**
   * Unregister widget configuration
   * Call this when widget unmounts
   */
  public unregisterConfig(widgetId: string): void {
    this.configCache.delete(widgetId)
  }

  // ─── Display ───────────────────────────────────────────────────────

  /**
   * r027.013: Whether to show the widget header label (default: true)
   */
  public getShowHeader(widgetId: string): boolean {
    const config = this.configCache.get(widgetId)
    return config?.showHeader !== false
  }

  // ─── Spatial Tab ───────────────────────────────────────────────────

  /**
   * r027.014: Allowed spatial relationship IDs for the Spatial tab combobox.
   * When undefined/empty, all relationships are shown (default behavior).
   */
  public getSpatialTabRelationships(widgetId: string): string[] | undefined {
    const config = this.configCache.get(widgetId)
    const relationships = config?.spatialTabRelationships
    // Return undefined if empty array (show all)
    if (!relationships || (Array.isArray(relationships) && relationships.length === 0)) {
      return undefined
    }
    // ImmutableArray → plain array
    return Array.isArray(relationships) ? relationships : Array.from(relationships as any)
  }

  // ─── Graphics Layer Symbology ──────────────────────────────────────

  /**
   * Get fill color for widget (with fallback)
   */
  public getFillColor(widgetId: string): [number, number, number] {
    const config = this.configCache.get(widgetId)
    const hex = config?.highlightFillColor || '#DF00FF' // Magenta default
    return this.hexToRgb(hex)
  }

  /**
   * Get fill opacity for widget (with fallback)
   */
  public getFillOpacity(widgetId: string): number {
    const config = this.configCache.get(widgetId)
    return config?.highlightFillOpacity ?? 0.25
  }

  /**
   * Get outline color for widget (with fallback)
   */
  public getOutlineColor(widgetId: string): [number, number, number] {
    const config = this.configCache.get(widgetId)
    const hex = config?.highlightOutlineColor || '#DF00FF' // Magenta default
    return this.hexToRgb(hex)
  }

  /**
   * Get outline opacity for widget (with fallback)
   */
  public getOutlineOpacity(widgetId: string): number {
    const config = this.configCache.get(widgetId)
    return config?.highlightOutlineOpacity ?? 1.0
  }

  /**
   * Get outline width for widget (with fallback)
   */
  public getOutlineWidth(widgetId: string): number {
    const config = this.configCache.get(widgetId)
    return config?.highlightOutlineWidth ?? 2
  }

  /**
   * Get point size for widget (with fallback)
   */
  public getPointSize(widgetId: string): number {
    const config = this.configCache.get(widgetId)
    return config?.highlightPointSize ?? 12
  }

  /**
   * Get point outline width for widget (with fallback)
   */
  public getPointOutlineWidth(widgetId: string): number {
    const config = this.configCache.get(widgetId)
    return config?.highlightPointOutlineWidth ?? 2
  }

  /**
   * Get point style for widget (with fallback)
   */
  public getPointStyle(widgetId: string): string {
    const config = this.configCache.get(widgetId)
    return config?.highlightPointStyle || 'circle'
  }

  // ─── Map Layer Integration ─────────────────────────────────────────

  /**
   * r024.0: Whether to show results as GroupLayer in LayerList (default: false)
   */
  public getAddResultsAsMapLayer(widgetId: string): boolean {
    const config = this.configCache.get(widgetId)
    return config?.addResultsAsMapLayer === true
  }

  /**
   * r024.0: Custom title for results layer in LayerList (default: 'QuerySimple Results')
   */
  public getResultsLayerTitle(widgetId: string): string {
    const config = this.configCache.get(widgetId)
    const title = config?.resultsLayerTitle
    return (typeof title === 'string' && title.trim() !== '') ? title.trim() : 'QuerySimple Results'
  }

  // ─── Spatial Draw Colors ───────────────────────────────────────────

  /**
   * r025.051: Get draw symbol color for Spatial tab (with fallback)
   */
  public getDrawColor(widgetId: string): [number, number, number] {
    const config = this.configCache.get(widgetId)
    const hex = config?.drawColor || '#32FF00' // Lime green default
    return this.hexToRgb(hex)
  }

  /**
   * r025.051: Get buffer preview color for Spatial tab (with fallback)
   */
  public getBufferColor(widgetId: string): [number, number, number] {
    const config = this.configCache.get(widgetId)
    const hex = config?.bufferColor || '#FFA500' // Orange default
    return this.hexToRgb(hex)
  }

  // ─── Zoom Behavior ─────────────────────────────────────────────────

  /**
   * r025.059: Get point zoom buffer distance in feet (with fallback)
   * Applied when zooming to single points or overlapping points (zero-area extents).
   */
  public getPointZoomBufferFeet(widgetId: string): number {
    const config = this.configCache.get(widgetId)
    return config?.pointZoomBufferFeet ?? 300
  }

  /**
   * r025.068: Get zoom expansion factor (with fallback)
   * Applied when zooming to lines, polygons, and multi-record extents.
   */
  public getZoomExpansionFactor(widgetId: string): number {
    const config = this.configCache.get(widgetId)
    return config?.zoomExpansionFactor ?? 1.2
  }

  // ─── Private Helpers ───────────────────────────────────────────────

  /**
   * Convert hex color to RGB array
   * @private
   */
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) {
      return [223, 0, 255] // Magenta fallback (#DF00FF)
    }
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ]
  }
}

/**
 * Export singleton instance
 *
 * Legacy alias: highlightConfigManager is kept for backward compatibility
 * during the transition period. New code should use widgetConfigManager.
 */
export const widgetConfigManager = WidgetConfigManager.getInstance()
export const highlightConfigManager = widgetConfigManager
