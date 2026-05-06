/**
 * DebugLogger — URL-activated, feature-scoped debug logging for ExB custom widgets.
 *
 * A portable, zero-overhead logging utility that activates via URL parameters.
 * No code changes needed to toggle logging in dev, test, or production.
 *
 * ## Quick Start (any custom widget)
 *
 * ```ts
 * import { createDebugLogger } from 'widgets/shared-code/mapsimple-common'
 *
 * const debugLogger = createDebugLogger('MYWIDGET', ['FETCH', 'RENDER', 'AUTH'])
 * debugLogger.log('FETCH', { url: '...', status: 200 })
 * debugLogger.log('BUG', { bugId: 'BUG-001', category: 'RENDER', description: 'Card height wrong' })
 * ```
 *
 * ## URL Activation
 *
 * - `?debug=all`           — Enable all registered tags
 * - `?debug=FETCH,RENDER`  — Enable specific tags (comma-separated, case-insensitive)
 * - `?debug=false`         — Explicitly disable all logging
 * - (no param)             — Logging disabled (zero overhead)
 *
 * ## Features
 *
 * - **URL-driven**: No code changes to toggle. Works in dev, test, prod.
 * - **Feature-scoped**: Each tag isolates a subsystem. No firehose.
 * - **BUG level**: Always logs via console.warn, even when debug=false.
 * - **ExB iframe-aware**: Checks parent window for ?debug param.
 * - **Zero overhead**: isEnabled() returns false immediately when no ?debug param.
 * - **Lazy init**: URL params not parsed until first log() call.
 * - **Portable**: DebugLogger class + createDebugLogger() factory work with any widget.
 *
 * ## MapSimple Widget Tags
 *
 * See createQuerySimpleDebugLogger(), createHelperSimpleDebugLogger(),
 * and createFeedSimpleDebugLogger() below for widget-specific tag registrations.
 *
 * ## Documentation
 *
 * See docs/development/DEBUG_LOGGER_GUIDE.md for full implementation guide.
 */

/**
 * Feature tag type — any uppercase string is valid.
 * Widget-specific factories define the known tags; the class accepts any string
 * so third-party widgets can define their own without modifying this file.
 */
export type DebugFeature = string

export interface DebugLoggerOptions {
  /** Display name for log prefixes, e.g., 'QUERYSIMPLE', 'FEEDSIMPLE', 'MYWIDGET' */
  widgetName: string
  /** Registered feature tags for this widget (used for ?debug=all enumeration) */
  features: string[]
}

export class DebugLogger {
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
        if (feature === 'ALL') {
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

    // Check current window first, then parent (same iframe logic as initialize())
    let debugValue = new URLSearchParams(window.location.search).get('debug')
    if (debugValue === null && window.parent !== window) {
      try {
        debugValue = new URLSearchParams(window.parent.location.search).get('debug')
      } catch (e) {
        // Cross-origin — parent not accessible
      }
    }

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
      'SELECTION', 'SELECTION-STATE-AUDIT', 'WIDGET-STATE', 'RESTORE', 'RESULTS-MODE', 'EXPAND-COLLAPSE', 'GRAPHICS-LAYER', 'EVENTS', 'POPUP',
      'QUERY', 'QUERY-PATH', 'DIRECT-QUERY', 'SPATIAL', 'CSV', 'VIEW-TABLE', 'SUGGEST', 'DARK-MODE', 'REBIND',
      // r027.080: HOVER-PREVIEW, ERROR, QUERY were used in code (query-result-item.tsx,
      // query-clear-handler.ts, selection-utils.ts, query-submit-handler.ts, query-utils.ts)
      // but never registered here. The factory's `features.includes(feature)` gate at
      // debug-logger.ts:111 silently dropped them from any URL filter — making them
      // invisible to ?debug= unless ?debug=all was used. Registering closes that gap.
      'HOVER-PREVIEW', 'ERROR',
      // Temporary migration features (will be removed after migration complete)
      'CHUNK-1-COMPARE', 'CHUNK-1-MISMATCH', 'CHUNK-2-COMPARE', 'CHUNK-2-MISMATCH', 'CHUNK-3-COMPARE', 'CHUNK-3-DECISION', 'CHUNK-3-FALLBACK',
      'CHUNK-4-COMPARE', 'CHUNK-5-COMPARE', 'CHUNK-6-COMPARE', 'CHUNK-6-MISMATCH'
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

/**
 * Creates a debug logger instance for FeedSimple widget
 */
export function createFeedSimpleDebugLogger() {
  return new DebugLogger({
    widgetName: 'FEEDSIMPLE',
    features: [
      'FETCH', 'PARSE', 'RENDER', 'POLL', 'JOIN', 'FEED-LAYER',
      'TEMPLATE', 'SETTINGS', 'EXPORT', 'SEARCH', 'SORT',
      'FEATURE-EFFECT', 'DARK-MODE'
    ]
  })
}

/**
 * Creates a debug logger instance for any custom widget.
 * Use this if your widget is not part of the MapSimple family.
 *
 * @example
 * ```ts
 * import { createDebugLogger } from 'widgets/shared-code/mapsimple-common'
 *
 * const debugLogger = createDebugLogger('MYWIDGET', ['FETCH', 'RENDER', 'AUTH'])
 * debugLogger.log('FETCH', { url: '...', status: 200 })
 * ```
 *
 * Activate in browser: `?debug=FETCH,RENDER` or `?debug=all`
 */
export function createDebugLogger(widgetName: string, features: string[]) {
  return new DebugLogger({ widgetName, features })
}

