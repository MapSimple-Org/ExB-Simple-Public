import { type AllWidgetProps } from 'jimu-core'
import { type IMConfig, SelectionType } from '../../config'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

interface UrlConsumptionCallbacks {
  onInitialValueFound: (value: { shortId: string, value: string } | undefined) => void
  onModeResetNeeded?: () => void
}

/**
 * Utility to manage URL parameter consumption and deep linking.
 * 
 * Handles both Hash fragments (#) and Query Strings (?), with Hash taking priority.
 * Implements atomic consumption to prevent infinite loops.
 * 
 * Part of Chunk 1: URL Parameter Consumption extraction.
 * 
 * Note: This is a utility class (not a hook) to work with class components.
 */
export class UrlConsumptionManager {
  private lastProcessedHash: string = ''
  private isProcessing: boolean = false
  private hashChangeHandler: (() => void) | null = null

  /**
   * Checks URL for hash and query string parameters matching configured shortIds.
   * Hash parameters take priority over query string parameters.
   */
  checkUrlParameters(
    props: AllWidgetProps<IMConfig>,
    resultsMode: SelectionType,
    callbacks: UrlConsumptionCallbacks
  ): void {
    const { config, id } = props
    const { onInitialValueFound, onModeResetNeeded } = callbacks

    if (!config.queryItems?.length) {
      return
    }

    // Prevent concurrent processing
    if (this.isProcessing) {
      return
    }

    const shortIds = config.queryItems
      .map(item => item.shortId)
      .filter(sid => sid != null && sid.trim() !== '')

    if (shortIds.length === 0) {
      return
    }

    const hash = window.location.hash.substring(1)
    const query = window.location.search.substring(1)
    
    // Skip if we've already processed this exact hash fragment
    if (this.lastProcessedHash === hash) {
      return
    }
    
    this.isProcessing = true
    this.lastProcessedHash = hash

    const hashParams = new URLSearchParams(hash)
    const queryParams = new URLSearchParams(query)

    let foundShortId: string | null = null
    let foundValue: string | null = null
    let foundIn: 'hash' | 'query' | null = null

    // PRIORITY 1: Hash fragments (always win)
    for (const sid of shortIds) {
      if (hashParams.has(sid)) {
        foundShortId = sid
        foundValue = hashParams.get(sid)
        foundIn = 'hash'
        break
      }
    }

    // PRIORITY 2: Query string (if no hash match)
    if (!foundShortId) {
      for (const sid of shortIds) {
        if (queryParams.has(sid)) {
          foundShortId = sid
          foundValue = queryParams.get(sid)
          foundIn = 'query'
          break
        }
      }
    }

    if (foundShortId && foundValue !== null) {
      debugLogger.log('HASH', {
        event: 'url-param-detected',
        widgetId: id,
        shortId: foundShortId,
        value: foundValue,
        foundIn,
        timestamp: Date.now()
      })
      
      // Reset to New mode when hash parameter is detected to avoid bugs with accumulation modes
      if (resultsMode !== SelectionType.NewSelection && onModeResetNeeded) {
        debugLogger.log('HASH', {
          event: 'mode-reset-needed-on-hash-detection',
          widgetId: id,
          currentMode: resultsMode,
          timestamp: Date.now()
        })
        onModeResetNeeded()
      }
      
      onInitialValueFound({ shortId: foundShortId, value: foundValue })
    } else {
      // No matching parameters found - clear state
      onInitialValueFound(undefined)
    }
    
    this.isProcessing = false
  }

  /**
   * Removes a hash parameter from the URL.
   * Used when switching to accumulation modes to consume the deep link.
   */
  removeHashParameter(shortId: string, widgetId: string): void {
    if (!shortId) return
    
    const hash = window.location.hash.substring(1)
    const urlParams = new URLSearchParams(hash)
    
    if (urlParams.has(shortId)) {
      urlParams.delete(shortId)
      const newHash = urlParams.toString()
      
      debugLogger.log('HASH', {
        event: 'removeHashParameter',
        widgetId,
        shortId,
        newHash: newHash ? `#${newHash}` : '(empty)',
        timestamp: Date.now()
      })
      
      // Update the URL without triggering a reload
      window.history.replaceState(null, '', 
        newHash ? `#${newHash}` : window.location.pathname + window.location.search
      )
      
      // Reset tracking so it can be processed again if needed
      this.lastProcessedHash = ''
    }
  }

  /**
   * Sets up hash change listener.
   */
  setup(
    props: AllWidgetProps<IMConfig>,
    resultsMode: SelectionType,
    callbacks: UrlConsumptionCallbacks
  ): void {
    // Create bound handler
    this.hashChangeHandler = () => {
      this.checkUrlParameters(props, resultsMode, callbacks)
    }
    
    // Initial check
    this.checkUrlParameters(props, resultsMode, callbacks)
    
    // Listen for hash changes
    window.addEventListener('hashchange', this.hashChangeHandler)
    
    // Also check after a short delay to catch cases where hash was already present
    setTimeout(() => {
      this.checkUrlParameters(props, resultsMode, callbacks)
    }, 100)
  }

  /**
   * Cleans up hash change listener.
   */
  cleanup(): void {
    if (this.hashChangeHandler) {
      window.removeEventListener('hashchange', this.hashChangeHandler)
      this.hashChangeHandler = null
    }
  }
}
