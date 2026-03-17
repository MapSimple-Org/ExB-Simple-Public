/**
 * Configurable debug logging utility for FeedSimple widget
 *
 * Usage:
 * - Add ?debug=all to URL to see all debug logs
 * - Add ?debug=FETCH,POLL to see specific feature logs
 * - Add ?debug=false to disable all debug logs
 *
 * Features:
 * - BUG: Known bugs/issues (always logs, even if debug=false)
 * - FETCH: Feed fetch requests and responses
 * - PARSE: XML parsing and item extraction
 * - RENDER: Card rendering and template substitution
 * - POLL: Polling lifecycle (interval, pause, resume, backoff)
 * - JOIN: Feature service spatial join (Mode B)
 * - FEED-LAYER: Feed map layer creation, sync, renderer, popups (Mode C)
 * - TEMPLATE: Token substitution and filter pipeline
 * - SETTINGS: Settings panel field discovery and configuration
 * - EXPORT: CSV export operations
 * - SEARCH: Search bar filtering
 * - SORT: Runtime sort operations
 * - FEATURE-EFFECT: Joined layer dimming during search/filter
 */

type DebugFeature = 'BUG' | 'FETCH' | 'PARSE' | 'RENDER' | 'POLL' | 'JOIN' | 'FEED-LAYER' | 'TEMPLATE' | 'SETTINGS' | 'EXPORT' | 'SEARCH' | 'SORT' | 'FEATURE-EFFECT' | 'all' | 'false'

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

    let urlParams = new URLSearchParams(window.location.search)
    let debugValue = urlParams.get('debug')

    // Check parent window for ExB iframe context
    if (debugValue === null && window.parent !== window) {
      try {
        urlParams = new URLSearchParams(window.parent.location.search)
        debugValue = urlParams.get('debug')
      } catch (e) {
        // Cross-origin restriction
      }
    }

    if (debugValue === 'false') {
      this.initialized = true
      return
    }

    if (debugValue === 'all') {
      this.features.forEach(feature => {
        if (feature !== 'all' && feature !== 'false') {
          this.enabledFeatures.add(feature)
        }
      })
      console.log(`[${this.widgetName}-DEBUG] Enabled ALL features:`, Array.from(this.enabledFeatures))
    } else if (debugValue !== null) {
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
      })
    }

    this.initialized = true
  }

  private isEnabled(feature: DebugFeature): boolean {
    this.initialize()

    // BUG level always enabled
    if (feature === 'BUG') {
      return true
    }

    if (this.enabledFeatures.has('all')) {
      return true
    }

    return this.enabledFeatures.has(feature)
  }

  log(feature: DebugFeature, data: any): void {
    if (feature === 'BUG') {
      const logData = {
        feature: 'BUG',
        bugId: data.bugId || 'UNKNOWN',
        category: data.category || 'GENERAL',
        timestamp: new Date().toISOString(),
        ...data
      }
      console.warn(`[${this.widgetName.toUpperCase()} BUG]`, JSON.stringify(logData, null, 2))
      return
    }

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
 * Shared singleton debug logger for the FeedSimple widget.
 * Import this directly instead of creating per-module instances.
 */
export const debugLogger = new DebugLogger({
  widgetName: 'FEEDSIMPLE',
  features: ['FETCH', 'PARSE', 'RENDER', 'POLL', 'JOIN', 'FEED-LAYER', 'TEMPLATE', 'SETTINGS', 'EXPORT', 'SEARCH', 'SORT', 'FEATURE-EFFECT']
})

