/**
 * Configurable debug logging utility for Experience Builder widgets
 * 
 * Usage:
 * - Add ?debug=all to URL to see all debug logs
 * - Add ?debug=HASH,FORM to see specific feature logs
 * - Add ?debug=false to disable all debug logs
 * 
 * Features (QuerySimple):
 * - BUG: Known bugs/issues (always logs, even if debug=false) - Use format: bugId, category, description
 * - HASH: Hash parameter processing
 * - FORM: Query form interactions
 * - TASK: Query task management
 * - ZOOM: Zoom behavior
 * - MAP-EXTENT: Map extent changes
 * - DATA-ACTION: Data action execution (Add to Map, etc.)
 * - GROUP: Query grouping and dropdown selection
 * - SELECTION: Selection detection and identify popup tracking
 * - WIDGET-STATE: Widget lifecycle events (open/close handshake)
 * - RESTORE: Selection restoration when widget opens
 * - RESULTS-MODE: Results management mode selection (Create new, Add to, Remove from)
 * - EXPAND-COLLAPSE: Expand/collapse state management for result items
 * - GRAPHICS-LAYER: Graphics layer highlighting (independent of layer visibility)
 * - EVENTS: Event listener setup/cleanup and custom event dispatching
 * 
 * Temporary Migration Features (will be removed after migration complete):
 * - CHUNK-1-COMPARE: Chunk 1 (URL Parameter) comparison logs
 * - CHUNK-1-MISMATCH: Chunk 1 mismatch warnings
 * - CHUNK-2-COMPARE: Chunk 2 (Visibility) comparison logs
 * - CHUNK-2-MISMATCH: Chunk 2 mismatch warnings
 * - CHUNK-3-COMPARE: Chunk 3 (Selection/Restoration) comparison logs
 * - CHUNK-3-DECISION: Chunk 3 decision point logs
 * - CHUNK-3-FALLBACK: Chunk 3 fallback logic logs
 * - CHUNK-4-COMPARE: Chunk 4 (Graphics Layer) comparison logs
 * - CHUNK-5-COMPARE: Chunk 5 (Accumulated Records) comparison logs
 * - CHUNK-6-COMPARE: Chunk 6 (Map View) comparison logs
 * - CHUNK-6-MISMATCH: Chunk 6 mismatch warnings
 * - CHUNK-7-COMPARE: Chunk 7 (Events) comparison logs
 * 
 * Features (HelperSimple):
 * - HASH: Hash parameter monitoring and widget opening
 * - SELECTION: Selection tracking from QuerySimple
 * - WIDGET-STATE: Widget state handshake (open/close events)
 * - RESTORE: Selection restoration attempts and results
 */

type DebugFeature = 'BUG' | 'HASH' | 'HASH-EXEC' | 'FORM' | 'TASK' | 'ZOOM' | 'MAP-EXTENT' | 'DATA-ACTION' | 'GROUP' | 'SELECTION' | 'WIDGET-STATE' | 'RESTORE' | 'RESULTS-MODE' | 'EXPAND-COLLAPSE' | 'GRAPHICS-LAYER' | 'EVENTS' | 'CHUNK-1-COMPARE' | 'CHUNK-1-MISMATCH' | 'CHUNK-2-COMPARE' | 'CHUNK-2-MISMATCH' | 'CHUNK-3-COMPARE' | 'CHUNK-3-DECISION' | 'CHUNK-3-FALLBACK' | 'CHUNK-4-COMPARE' | 'CHUNK-5-COMPARE' | 'CHUNK-6-COMPARE' | 'CHUNK-6-MISMATCH' | 'CHUNK-7-COMPARE' | 'all' | 'false'

interface DebugLoggerOptions {
  widgetName: string
  features: DebugFeature[]
}

class DebugLogger {
  private enabledFeatures: Set<DebugFeature> = new Set()
  private initialized = false
  private widgetName: string
  private features: DebugFeature[]

  constructor(options: DebugLoggerOptions) {
    this.widgetName = options.widgetName
    this.features = options.features
  }

  private initialize(): void {
    if (this.initialized) return

    // Check URL parameters (both current window and parent for iframes)
    let urlParams = new URLSearchParams(window.location.search)
    let debugValue = urlParams.get('debug')

    // If not found in current window, check parent (needed for ExB iframes)
    if (debugValue === null && window.parent !== window) {
      try {
        urlParams = new URLSearchParams(window.parent.location.search)
        debugValue = urlParams.get('debug')
      } catch (e) {
        // Cross-origin restriction might prevent access to parent location
      }
    }

    if (debugValue === 'false') {
      // Explicitly disabled
      this.initialized = true
      return
    }

    if (debugValue === 'all') {
      // Enable all features only if explicitly set to 'all'
      this.features.forEach(feature => {
        if (feature !== 'all' && feature !== 'false') {
          this.enabledFeatures.add(feature)
        }
      })
      console.log(`[${this.widgetName}-DEBUG] Enabled ALL features:`, Array.from(this.enabledFeatures))
    } else if (debugValue !== null) {
      // Parse comma-separated feature list
      const requestedFeatures = debugValue.split(',').map(f => f.trim().toUpperCase() as DebugFeature)
      requestedFeatures.forEach(feature => {
        if (feature.toUpperCase() === 'ALL') {
          // Enable all features for this widget
          this.features.forEach(f => {
            if (f !== 'all' && f !== 'false') {
              this.enabledFeatures.add(f)
            }
          })
        } else if (this.features.includes(feature)) {
          this.enabledFeatures.add(feature)
        }
      })
    }

    this.initialized = true
  }

  private isEnabled(feature: DebugFeature): boolean {
    this.initialize()
    
    // BUG level always enabled, regardless of debug switches (even if debug=false)
    if (feature === 'BUG') {
      return true
    }
    
    if (this.enabledFeatures.has('all')) {
      return true
    }
    
    return this.enabledFeatures.has(feature)
  }

  log(feature: DebugFeature, data: any): void {
    // BUG level always logs, even if debug=false
    if (feature === 'BUG') {
      const logData = {
        feature: 'BUG',
        bugId: data.bugId || 'UNKNOWN',
        category: data.category || 'GENERAL',
        timestamp: new Date().toISOString(),
        ...data
      }
      
      // Use console.warn with emoji format to make bugs stand out
      console.warn(`[${this.widgetName.toUpperCase()} ⚠️ BUG]`, JSON.stringify(logData, null, 2))
      return
    }
    
    // Regular feature logging (existing behavior)
    if (!this.isEnabled(feature)) {
      return
    }

    const logData = {
      feature,
      timestamp: new Date().toISOString(),
      ...data
    }

    console.log(`[${this.widgetName.toUpperCase()}-${feature}]`, JSON.stringify(logData, null, 2))
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

/**
 * Creates a debug logger instance for QuerySimple widget
 */
export function createQuerySimpleDebugLogger() {
  return new DebugLogger({
    widgetName: 'QUERYSIMPLE',
    features: [
      'HASH', 'HASH-EXEC', 'HASH-FIRST-LOAD', 'FORM', 'TASK', 'ZOOM', 'MAP-EXTENT', 'DATA-ACTION', 'GROUP', 
      'SELECTION', 'WIDGET-STATE', 'RESTORE', 'RESULTS-MODE', 'EXPAND-COLLAPSE', 'GRAPHICS-LAYER', 'EVENTS',
      // Temporary migration features (will be removed after migration complete)
      'CHUNK-1-COMPARE', 'CHUNK-1-MISMATCH', 'CHUNK-2-COMPARE', 'CHUNK-2-MISMATCH', 'CHUNK-3-COMPARE', 'CHUNK-3-DECISION', 'CHUNK-3-FALLBACK',
      'CHUNK-4-COMPARE', 'CHUNK-5-COMPARE', 'CHUNK-6-COMPARE', 'CHUNK-6-MISMATCH', 'CHUNK-7-COMPARE'
    ]
  })
}

/**
 * Creates a debug logger instance for HelperSimple widget
 */
export function createHelperSimpleDebugLogger() {
  return new DebugLogger({
    widgetName: 'HELPERSIMPLE',
    features: ['HASH', 'HASH-EXEC', 'SELECTION', 'WIDGET-STATE', 'RESTORE']
  })
}

