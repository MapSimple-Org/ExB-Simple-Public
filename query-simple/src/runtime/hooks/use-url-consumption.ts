import { type AllWidgetProps } from 'jimu-core'
import { type IMConfig, SelectionType } from '../../config'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

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

    debugLogger.log('HASH-EXEC', {
      event: 'urlconsumption-checkurlparameters-entry',
      widgetId: id,
      hasQueryItems: !!config.queryItems?.length,
      isProcessing: this.isProcessing,
      lastProcessedHash: this.lastProcessedHash,
      currentHash: window.location.hash.substring(1),
      timestamp: Date.now()
    })

    if (!config.queryItems?.length) {
      debugLogger.log('HASH-EXEC', {
        event: 'urlconsumption-exit-no-query-items',
        widgetId: id,
        timestamp: Date.now()
      })
      return
    }

    // Prevent concurrent processing
    if (this.isProcessing) {
      debugLogger.log('HASH-EXEC', {
        event: 'urlconsumption-exit-already-processing',
        widgetId: id,
        timestamp: Date.now()
      })
      return
    }

    const shortIds = config.queryItems
      .map(item => item.shortId)
      .filter(sid => sid != null && sid.trim() !== '')

    if (shortIds.length === 0) {
      debugLogger.log('HASH-EXEC', {
        event: 'urlconsumption-exit-no-shortids',
        widgetId: id,
        timestamp: Date.now()
      })
      return
    }

    const hash = window.location.hash.substring(1)
    const query = window.location.search.substring(1)
    
    this.isProcessing = true

    debugLogger.log('HASH-EXEC', {
      event: 'urlconsumption-parsing-params',
      widgetId: id,
      hash,
      query,
      shortIds,
      timestamp: Date.now()
    })

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

    debugLogger.log('HASH-EXEC', {
      event: 'urlconsumption-search-complete',
      widgetId: id,
      foundShortId,
      foundValue,
      foundIn,
      hasMatch: !!(foundShortId && foundValue !== null),
      timestamp: Date.now()
    })

    if (foundShortId && foundValue !== null) {
      // Track only the specific shortId parameter (e.g., "pin=2223059013")
      // NOT the entire hash string with data_s and other parameters
      const currentShortIdParam = `${foundShortId}=${foundValue}`
      
      debugLogger.log('HASH-EXEC', {
        event: 'urlconsumption-checking-lastprocessedhash',
        widgetId: id,
        currentShortIdParam,
        lastProcessedHash: this.lastProcessedHash,
        willSkip: this.lastProcessedHash === currentShortIdParam,
        timestamp: Date.now()
      })
      
      // Skip if we've already processed this exact shortId parameter
      if (this.lastProcessedHash === currentShortIdParam) {
        debugLogger.log('HASH-EXEC', {
          event: 'urlconsumption-exit-hash-already-processed',
          widgetId: id,
          currentShortIdParam,
          lastProcessedHash: this.lastProcessedHash,
          timestamp: Date.now()
        })
        this.isProcessing = false
        return
      }
      
      // Update lastProcessedHash to track this specific shortId parameter
      this.lastProcessedHash = currentShortIdParam
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
      
      debugLogger.log('HASH-EXEC', {
        event: 'urlconsumption-calling-oninitialvaluefound',
        widgetId: id,
        shortId: foundShortId,
        value: foundValue,
        timestamp: Date.now()
      })
      
      onInitialValueFound({ shortId: foundShortId, value: foundValue })
      
      debugLogger.log('HASH-EXEC', {
        event: 'urlconsumption-oninitialvaluefound-returned',
        widgetId: id,
        timestamp: Date.now()
      })
    } else {
      debugLogger.log('HASH-EXEC', {
        event: 'urlconsumption-no-match-calling-oninitialvaluefound-undefined',
        widgetId: id,
        timestamp: Date.now()
      })
      // No matching parameters found - clear state
      onInitialValueFound(undefined)
    }
    
    this.isProcessing = false
    
    debugLogger.log('HASH-EXEC', {
      event: 'urlconsumption-checkurlparameters-exit',
      widgetId: id,
      timestamp: Date.now()
    })
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
      // Always preserve pathname and query string, only update hash
      window.history.replaceState(null, '', 
        window.location.pathname + window.location.search + (newHash ? `#${newHash}` : '')
      )
      
      // Reset tracking so it can be processed again if needed
      this.lastProcessedHash = ''
    }
  }

  /**
   * Sets up the manager (no autonomous URL checking).
   * QuerySimple should only process hash parameters when HelperSimple explicitly triggers it
   * via OPEN_WIDGET_EVENT. This ensures HelperSimple remains the orchestrator.
   */
  setup(
    props: AllWidgetProps<IMConfig>,
    resultsMode: SelectionType,
    callbacks: UrlConsumptionCallbacks
  ): void {
    // Do NOT automatically check URL parameters
    // Do NOT set up hashchange listener
    // QuerySimple will only process hash when HelperSimple explicitly opens the widget
    // This ensures HelperSimple remains the orchestrator
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
