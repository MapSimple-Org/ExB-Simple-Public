/**
 * DebugLogger — URL-activated, feature-scoped debug logging for ExB custom widgets.
 *
 * A portable, zero-overhead logging utility that activates via URL parameters.
 * No code changes needed to toggle logging in dev, test, or production.
 *
 * SETUP:
 *   1. Copy this file into your widget (e.g., src/utils/debug-logger.ts)
 *   2. Edit the bottom of this file to set your widget name and tags
 *   3. Import and use: debugLogger.log('TAG', { key: 'value' })
 *   4. Activate in browser: add ?debug=TAG to your ExB URL
 *
 * URL ACTIVATION:
 *   ?debug=all           — Enable all registered tags
 *   ?debug=FETCH,RENDER  — Enable specific tags (comma-separated, case-insensitive)
 *   ?debug=false         — Explicitly disable all logging
 *   (no param)           — Logging disabled (zero overhead)
 *
 * FEATURES:
 *   - URL-driven: No code changes to toggle. Works in dev, test, prod.
 *   - Feature-scoped: Each tag isolates a subsystem. No firehose.
 *   - BUG level: Always logs via console.warn, even when debug=false.
 *   - ExB iframe-aware: Checks parent window for ?debug param.
 *   - Zero overhead: isEnabled() returns false immediately when no ?debug param.
 *   - Lazy init: URL params not parsed until first log() call.
 *   - No dependencies: Pure TypeScript, no npm packages.
 *
 * Full documentation: https://github.com/MapSimple-Org/ExB-Simple-Public
 * See DEBUG_LOGGER_GUIDE.md for detailed implementation guide.
 */

// ── Types ────────────────────────────────────────────────────────

/** Feature tag type — any uppercase string is valid */
export type DebugFeature = string

export interface DebugLoggerOptions {
  /** Display name for log prefixes (e.g., 'MYWIDGET') */
  widgetName: string
  /** Registered feature tags — used for ?debug=all enumeration */
  features: string[]
}

// ── DebugLogger Class ────────────────────────────────────────────

export class DebugLogger {
  private enabledFeatures: Set<DebugFeature> = new Set()
  private initialized = false
  private widgetName: string
  private features: DebugFeature[]

  constructor (options: DebugLoggerOptions) {
    this.widgetName = options.widgetName
    this.features = options.features
  }

  /**
   * Parse ?debug= from the URL on first use.
   * Checks both the current window and the parent window (for ExB iframes).
   */
  private initialize (): void {
    if (this.initialized) return

    // Check URL parameters (both current window and parent for iframes)
    let urlParams = new URLSearchParams(window.location.search)
    let debugValue = urlParams.get('debug')

    // If not found in current window, check parent (needed for ExB iframes).
    // ExB renders widgets inside iframes, so ?debug= is on the parent URL.
    if (debugValue === null && window.parent !== window) {
      try {
        urlParams = new URLSearchParams(window.parent.location.search)
        debugValue = urlParams.get('debug')
      } catch (e) {
        // Cross-origin restriction may prevent access to parent location.
        // This is normal when the ExB host and widget preview are on different origins.
      }
    }

    if (debugValue === 'false') {
      // Explicitly disabled
      this.initialized = true
      return
    }

    if (debugValue === 'all') {
      // Enable all registered features
      this.features.forEach(feature => {
        if (feature !== 'all' && feature !== 'false') {
          this.enabledFeatures.add(feature)
        }
      })
      console.log(`[${this.widgetName}-DEBUG] Enabled ALL features:`, Array.from(this.enabledFeatures))
    } else if (debugValue !== null) {
      // Parse comma-separated feature list (case-insensitive)
      const requestedFeatures = debugValue.split(',').map(f => f.trim().toUpperCase() as DebugFeature)
      requestedFeatures.forEach(feature => {
        if (feature.toUpperCase() === 'ALL') {
          this.features.forEach(f => {
            if (f !== 'all' && f !== 'false') {
              this.enabledFeatures.add(f)
            }
          })
        } else if (this.features.includes(feature)) {
          this.enabledFeatures.add(feature)
        }
        // Note: tags NOT in the features array are silently ignored.
        // If you see no output, verify the tag is registered in your features array.
      })
    }

    this.initialized = true
  }

  /**
   * Check if a feature tag is currently enabled.
   * BUG level always returns true, regardless of URL params.
   */
  private isEnabled (feature: DebugFeature): boolean {
    this.initialize()

    // BUG level always enabled — bypasses all debug switches
    if (feature === 'BUG') {
      return true
    }

    if (this.enabledFeatures.has('all')) {
      return true
    }

    return this.enabledFeatures.has(feature)
  }

  /**
   * Log structured data if the feature tag is enabled.
   *
   * @param feature - Tag name (must be registered in features array, or 'BUG')
   * @param data - Any data to log (serialized as JSON)
   *
   * BUG level: Always logs via console.warn, even with ?debug=false.
   * Use for known issues that should always surface. Include bugId, category,
   * and description fields for consistency.
   */
  log (feature: DebugFeature, data: any): void {
    // BUG level always logs, even if debug=false
    if (feature === 'BUG') {
      const logData = {
        feature: 'BUG',
        bugId: data.bugId || 'UNKNOWN',
        category: data.category || 'GENERAL',
        timestamp: new Date().toISOString(),
        ...data
      }

      console.warn(`[${this.widgetName.toUpperCase()} \u26A0\uFE0F BUG]`, JSON.stringify(logData, null, 2))
      return
    }

    // Regular feature logging — only logs when tag is enabled via ?debug=
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

  /**
   * Returns the current debug configuration.
   * Useful for diagnostic output or status displays.
   *
   * @returns enabledFeatures (active tags) and debugValue (raw URL param, or null)
   */
  getConfig (): { enabledFeatures: string[], debugValue: string | null } {
    this.initialize()

    const urlParams = new URLSearchParams(window.location.search)
    const debugValue = urlParams.get('debug')

    return {
      enabledFeatures: Array.from(this.enabledFeatures),
      debugValue
    }
  }
}

// ── Factory Function ─────────────────────────────────────────────

/**
 * Creates a DebugLogger instance for any custom widget.
 *
 * @param widgetName - Display name for log prefixes (e.g., 'MYWIDGET')
 * @param features - Array of feature tags to register
 * @returns A configured DebugLogger instance
 *
 * @example
 * const debugLogger = createDebugLogger('MYWIDGET', ['FETCH', 'RENDER', 'CONFIG'])
 * debugLogger.log('FETCH', { action: 'start', url: '...' })
 */
export function createDebugLogger (widgetName: string, features: string[]): DebugLogger {
  return new DebugLogger({ widgetName, features })
}

// ══════════════════════════════════════════════════════════════════
// YOUR WIDGET CONFIGURATION — Edit the section below
// ══════════════════════════════════════════════════════════════════

/**
 * Create your widget's logger instance here.
 * Replace 'MYWIDGET' with your widget name and update the tags array
 * with the subsystems you want to debug.
 *
 * Then import this in any file:
 *   import { debugLogger } from '../utils/debug-logger'
 *   debugLogger.log('FETCH', { action: 'request', url })
 */
export const debugLogger = createDebugLogger('MYWIDGET', [
  'FETCH',      // API/network calls
  'RENDER',     // UI rendering, template processing
  'CONFIG',     // Settings load, config validation
  'MAP',        // Map view interactions, layer operations
  'SELECTION',  // Record selection, highlighting
  'LIFECYCLE'   // Widget open/close, visibility changes
  // Add your own tags here — they appear in the URL as ?debug=TAG
])
