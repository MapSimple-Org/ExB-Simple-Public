/**
 * Configurable debug logging utility for QuerySimple widget
 * 
 * Usage:
 * - Add ?debug=all to URL to see all debug logs
 * - Add ?debug=HASH,FORM to see specific feature logs
 * - Add ?debug=false to disable all debug logs
 * 
 * Features:
 * - HASH: Hash parameter processing
 * - FORM: Query form interactions
 * - TASK: Query task management
 * - ZOOM: Zoom behavior
 * - MAP-EXTENT: Map extent changes
 * - DATA-ACTION: Data action execution (Add to Map, etc.)
 * - GROUP: Query grouping and dropdown selection
 */

type DebugFeature = 'HASH' | 'FORM' | 'TASK' | 'ZOOM' | 'MAP-EXTENT' | 'DATA-ACTION' | 'GROUP' | 'all' | 'false'

class DebugLogger {
  private enabledFeatures: Set<DebugFeature> = new Set()
  private initialized = false

  private initialize(): void {
    if (this.initialized) return

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const debugValue = urlParams.get('debug')

    if (debugValue === 'false') {
      // Explicitly disabled
      this.initialized = true
      return
    }

    if (debugValue === 'all') {
      // Enable all features only if explicitly set to 'all'
      this.enabledFeatures.add('HASH')
      this.enabledFeatures.add('FORM')
      this.enabledFeatures.add('TASK')
      this.enabledFeatures.add('ZOOM')
      this.enabledFeatures.add('MAP-EXTENT')
      this.enabledFeatures.add('DATA-ACTION')
      this.enabledFeatures.add('GROUP')
    } else if (debugValue !== null) {
      // Parse comma-separated feature list
      const features = debugValue.split(',').map(f => f.trim().toUpperCase() as DebugFeature)
      features.forEach(feature => {
        if (feature === 'ALL') {
          this.enabledFeatures.add('HASH')
          this.enabledFeatures.add('FORM')
          this.enabledFeatures.add('TASK')
          this.enabledFeatures.add('ZOOM')
          this.enabledFeatures.add('MAP-EXTENT')
          this.enabledFeatures.add('DATA-ACTION')
          this.enabledFeatures.add('GROUP')
        } else if (['HASH', 'FORM', 'TASK', 'ZOOM', 'MAP-EXTENT', 'DATA-ACTION', 'GROUP'].includes(feature)) {
          this.enabledFeatures.add(feature)
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




