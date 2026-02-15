/**
 * HighlightConfigManager
 * 
 * Centralized manager for widget highlight/graphics configuration.
 * Provides a single source of truth for graphics symbology settings across all QuerySimple widgets.
 * 
 * Features:
 * - Singleton pattern (one instance for entire app)
 * - Per-widget configuration storage (keyed by widgetId)
 * - Fallback defaults for all symbology properties
 * - Type-safe configuration access
 * 
 * Usage:
 * ```typescript
 * import { highlightConfigManager } from 'widgets/shared-code/mapsimple-common'
 * 
 * // Register widget config on mount
 * highlightConfigManager.registerConfig(widgetId, config)
 * 
 * // Get symbology values
 * const fillColor = highlightConfigManager.getFillColor(widgetId)
 * const pointSize = highlightConfigManager.getPointSize(widgetId)
 * 
 * // Unregister on unmount
 * highlightConfigManager.unregisterConfig(widgetId)
 * ```
 */

import { type IMConfig as QuerySimpleConfig } from '../../query-simple/src/config'

class HighlightConfigManager {
  private static instance: HighlightConfigManager
  private configCache: Map<string, QuerySimpleConfig> = new Map()

  private constructor() {
    // Private constructor enforces singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): HighlightConfigManager {
    if (!HighlightConfigManager.instance) {
      HighlightConfigManager.instance = new HighlightConfigManager()
    }
    return HighlightConfigManager.instance
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
 */
export const highlightConfigManager = HighlightConfigManager.getInstance()
