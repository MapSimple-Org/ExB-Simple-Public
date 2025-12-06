/**
 * Configurable debug logging utility for QuerySimple widget
 * 
 * Usage:
 * - No debug parameter: All debug logging DISABLED (default for production)
 * - Add ?debug=all to URL to see all debug logs
 * - Add ?debug=HASH,FORM to see specific feature logs
 * - Add ?debug=false to explicitly disable all debug logs (same as no parameter)
 * 
 * Features:
 * - HASH: Hash parameter processing
 * - FORM: Query form interactions
 * - TASK: Query task management
 * - ZOOM: Zoom behavior
 * - MAP-EXTENT: Map extent changes
 * - DATA-ACTION: Data action execution (Add to Map, etc.)
 * - UI: UI interactions (tab switching, etc.)
 * - ERROR: Error logging (console.error/warn calls)
 * 
 * IMPORTANT: All console.log/error/warn calls must respect debug=false.
 * Use debugLogger.log() for feature-specific logs, or check debugLogger.isDebugEnabled()
 * before using console.error/warn for errors.
 * 
 * Default Behavior: Debug logging is DISABLED by default (no parameter = no logging).
 * This ensures production deployments don't have console noise.
 */

type DebugFeature = 'HASH' | 'FORM' | 'TASK' | 'ZOOM' | 'MAP-EXTENT' | 'DATA-ACTION' | 'UI' | 'ERROR' | 'all' | 'false'

class DebugLogger {
  private enabledFeatures: Set<DebugFeature> = new Set()
  private initialized = false

  private initialize(): void {
    if (this.initialized) return

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const debugValue = urlParams.get('debug')

    // Default behavior: No parameter = disabled (production-safe)
    if (debugValue === null || debugValue === 'false') {
      // Explicitly disabled or no parameter (default)
      this.initialized = true
      return
    }

    if (debugValue === 'all') {
      // Enable all features if debug=all
      this.enabledFeatures.add('HASH')
      this.enabledFeatures.add('FORM')
      this.enabledFeatures.add('TASK')
      this.enabledFeatures.add('ZOOM')
      this.enabledFeatures.add('MAP-EXTENT')
      this.enabledFeatures.add('DATA-ACTION')
      this.enabledFeatures.add('UI')
      this.enabledFeatures.add('ERROR')
    } else {
      // Parse comma-separated feature list
      const features = debugValue.split(',').map(f => f.trim().toUpperCase())
      features.forEach(feature => {
        if (feature === 'ALL') {
          // Enable all features
          this.enabledFeatures.add('HASH')
          this.enabledFeatures.add('FORM')
          this.enabledFeatures.add('TASK')
          this.enabledFeatures.add('ZOOM')
          this.enabledFeatures.add('MAP-EXTENT')
          this.enabledFeatures.add('DATA-ACTION')
          this.enabledFeatures.add('UI')
          this.enabledFeatures.add('ERROR')
        } else if (['HASH', 'FORM', 'TASK', 'ZOOM', 'MAP-EXTENT', 'DATA-ACTION', 'UI', 'ERROR'].includes(feature)) {
          this.enabledFeatures.add(feature as DebugFeature)
        }
      })
    }

    this.initialized = true
  }

  private isEnabled(feature: DebugFeature): boolean {
    this.initialize()
    
    if (this.enabledFeatures.has('all')) {
      return true
    }
    
    return this.enabledFeatures.has(feature)
  }

  log(feature: DebugFeature, data: any): void {
    if (!this.isEnabled(feature)) {
      return
    }

    const logData = {
      feature,
      timestamp: new Date().toISOString(),
      ...data
    }

    console.log(`[QUERYSIMPLE-${feature}]`, JSON.stringify(logData, null, 2))
  }

  /**
   * Check if debug logging is enabled (any feature enabled, not explicitly disabled)
   */
  isDebugEnabled(): boolean {
    this.initialize()
    return this.enabledFeatures.size > 0
  }

  /**
   * Check if a specific debug feature is enabled
   */
  isFeatureEnabled(feature: DebugFeature): boolean {
    return this.isEnabled(feature)
  }

  getConfig(): { enabledFeatures: string[], debugValue: string | null } {
    this.initialize()
    
    const urlParams = new URLSearchParams(window.location.search)
    const debugValue = urlParams.get('debug')
    
    return {
      enabledFeatures: Array.from(this.enabledFeatures),
      debugValue
    }
  }
}

export const debugLogger = new DebugLogger()




