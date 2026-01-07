/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps, getAppStore, type IMState, WidgetManager, appActions, DataSourceManager, type DataSource, type FeatureLayerDataSource } from 'jimu-core'
import { type IMConfig } from '../config'
import { versionManager } from '../version-manager'
import { createHelperSimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createHelperSimpleDebugLogger()

/**
 * Custom event name for notifying managed widgets to process hash parameters.
 * This event is dispatched after a widget is opened in a controller.
 */
const OPEN_WIDGET_EVENT = 'helpersimple-open-widget'

/**
 * Custom event name for QuerySimple to notify HelperSimple of selection changes.
 */
const QUERYSIMPLE_SELECTION_EVENT = 'querysimple-selection-changed'

/**
 * Custom event name for QuerySimple to notify HelperSimple of widget open/close state.
 */
const QUERYSIMPLE_WIDGET_STATE_EVENT = 'querysimple-widget-state-changed'

/**
 * Custom event name for QuerySimple to notify HelperSimple that a hash-triggered query has completed execution.
 * This allows HelperSimple to track which hash parameters have been executed to prevent re-execution.
 */
const QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT = 'querysimple-hash-query-executed'

/**
 * Detects if an identify popup is currently visible in the DOM.
 * Uses verified selectors based on Experience Builder's identify popup structure.
 * 
 * @returns true if identify popup is detected and visible, false otherwise
 */
function isIdentifyPopupOpen(): boolean {
  // Primary selector: .esri-popup with role="dialog"
  const popup = document.querySelector('.esri-popup[role="dialog"]')
  
  if (!popup) {
    return false
  }
  
  // Verify it's visible (not hidden)
  const ariaHidden = popup.getAttribute('aria-hidden')
  if (ariaHidden === 'true') {
    return false
  }
  
  // Additional check: verify computed style shows it's visible
  const style = window.getComputedStyle(popup)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }
  
  // Verify it contains esri-features (identify popup structure)
  const hasFeatures = popup.querySelector('.esri-features')
  if (!hasFeatures) {
    return false
  }
  
  return true
}

/**
 * HelperSimple Widget
 * 
 * A helper widget that monitors URL hash parameters and automatically opens
 * managed widgets in controllers when matching shortIds are detected.
 * 
 * This widget is always mounted but invisible, allowing it to listen for hash
 * changes even when other widgets are closed in controllers.
 * 
 * @see https://developers.arcgis.com/experience-builder/sample-code/widgets/control-the-widget-state/
 */
export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>> {
  static versionManager = versionManager

  // Selection tracking for logging/debugging purposes (not used for restoration)
  private querySimpleSelection: { recordIds: string[], dataSourceId?: string } | null = null
  private previousHashEntry: { outputDsId: string, recordIds: string[] } | null = null
  private querySimpleWidgetIsOpen: boolean = false
  private previousWidgetState: boolean | null = null
  
  // Track last executed hash parameter to prevent re-execution when switching queries
  // Format: "shortId=value" (e.g., "pin=2223059013")
  private lastExecutedHash: string | null = null
  
  // Identify popup detection for logging (no restoration)
  private identifyPopupObserver: MutationObserver | null = null
  private identifyPopupWasOpen: boolean = false

  componentDidMount() {
    // Listen for hash changes to detect when URL hash parameters are updated
    window.addEventListener('hashchange', this.handleHashChange)
    // Check hash on initial mount
    this.checkUrlParameters()
    
    // Listen for QuerySimple selection changes (for logging/debugging)
    window.addEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleQuerySimpleSelectionChange)
    
    // Listen for QuerySimple widget state changes (open/close)
    window.addEventListener(QUERYSIMPLE_WIDGET_STATE_EVENT, this.handleQuerySimpleWidgetStateChange)
    
    // Listen for QuerySimple hash query execution completion
    window.addEventListener(QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT, this.handleHashQueryExecuted)
    
    // Initialize hash entry tracking for logging/debugging
    if (this.props.config.managedWidgetId) {
      this.previousHashEntry = this.parseHashForWidgetSelection(this.props.config.managedWidgetId)
      // Start watching for identify popup (logging only, no restoration)
      this.startIdentifyPopupWatching()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange)
    window.removeEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleQuerySimpleSelectionChange)
    window.removeEventListener(QUERYSIMPLE_WIDGET_STATE_EVENT, this.handleQuerySimpleWidgetStateChange)
    window.removeEventListener(QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT, this.handleHashQueryExecuted)
    this.stopIdentifyPopupWatching()
  }

  componentDidUpdate(prevProps: AllWidgetProps<IMConfig>) {
    // Re-check parameters if managed widget configuration changed
    if (prevProps.config.managedWidgetId !== this.props.config.managedWidgetId) {
      this.checkUrlParameters()
    }
    
    // Re-initialize hash entry tracking and identify popup watching if config changed
    if (prevProps.config.managedWidgetId !== this.props.config.managedWidgetId) {
      this.stopIdentifyPopupWatching()
      if (this.props.config.managedWidgetId) {
        this.previousHashEntry = this.parseHashForWidgetSelection(this.props.config.managedWidgetId)
        this.startIdentifyPopupWatching()
      } else {
        this.previousHashEntry = null
        this.querySimpleSelection = null
      }
    }
  }

  /**
   * Extracts all shortIds from the managed widget's query items.
   * 
   * @param widgetId - The ID of the widget to extract shortIds from
   * @returns Array of shortId strings found in the widget's query items
   */
  getWidgetShortIds = (widgetId: string): string[] => {
    const state: IMState = getAppStore().getState()
    const appConfig = window.jimuConfig?.isBuilder 
      ? state.appStateInBuilder?.appConfig 
      : state.appConfig
    
    if (!appConfig?.widgets?.[widgetId]) {
      return []
    }
    
    if (!appConfig.widgets[widgetId].config?.queryItems) {
      return []
    }

    const queryItems = appConfig.widgets[widgetId].config.queryItems
    const shortIds: string[] = []
    
    queryItems.forEach((item: any) => {
      if (item.shortId && item.shortId.trim() !== '') {
        shortIds.push(item.shortId)
      }
    })
    
    return shortIds
  }

  /**
   * Loads the widget class prior to executing the open action.
   * This is required by the Experience Builder API before opening widgets.
   * 
   * @param widgetId - The ID of the widget to load
   * @returns Promise that resolves with the widget class component
   * 
   * @see https://developers.arcgis.com/experience-builder/sample-code/widgets/control-the-widget-state/
   */
  loadWidgetClass = (widgetId: string): Promise<React.ComponentType<any>> => {
    if (!widgetId) {
      return Promise.resolve(null)
    }
    
    const isClassLoaded = getAppStore().getState().widgetsRuntimeInfo?.[widgetId]?.isClassLoaded
    
    if (!isClassLoaded) {
      return WidgetManager.getInstance().loadWidgetClass(widgetId)
    } else {
      return Promise.resolve(WidgetManager.getInstance().getWidgetClass(widgetId))
    }
  }

  /**
   * Opens a widget in a controller using the Experience Builder API.
   * 
   * This method:
   * 1. Loads the widget class if not already loaded
   * 2. Dispatches the openWidget action via Redux
   * 3. Notifies the widget to process hash parameters after opening
   * 
   * @param widgetId - The ID of the widget to open
   * 
   * @see https://developers.arcgis.com/experience-builder/sample-code/widgets/control-the-widget-state/
   */
  openWidget = (widgetId: string): void => {
    const openAction = appActions.openWidget(widgetId)
    
    debugLogger.log('HASH-EXEC', {
      event: 'helpersimple-openwidget-starting',
      widgetId,
      timestamp: Date.now()
    })
    
    this.loadWidgetClass(widgetId)
      .then(() => {
        getAppStore().dispatch(openAction)
        debugLogger.log('HASH-EXEC', {
          event: 'helpersimple-openwidget-action-dispatched',
          widgetId,
          timestamp: Date.now()
        })
      })
      .then(() => {
        // Give the widget a moment to mount, then notify it to process hash parameters
        setTimeout(() => {
          debugLogger.log('HASH-EXEC', {
            event: 'helpersimple-openwidget-dispatching-event',
            widgetId,
            timestamp: Date.now()
          })
          const event = new CustomEvent(OPEN_WIDGET_EVENT, {
            detail: { widgetId },
            bubbles: true,
            cancelable: true
          })
          window.dispatchEvent(event)
          debugLogger.log('HASH-EXEC', {
            event: 'helpersimple-openwidget-event-dispatched',
            widgetId,
            timestamp: Date.now()
          })
        }, 500)
      })
      .catch((error) => {
        debugLogger.log('HASH-EXEC', {
          event: 'helpersimple-openwidget-error',
          widgetId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        })
        // Silently handle errors - widget may already be open or not in a controller
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') {
          console.error('[HelperSimple] Error opening widget:', error)
        }
      })
  }

  /**
   * Checks URL hash and query string parameters for shortIds that match the managed widget.
   * 
   * If a match is found, opens the widget using the Experience Builder API.
   * Hash format: #shortId=value (e.g., #pin=2223059013)
   * Query format: ?shortId=value (e.g., ?pin=2223059013)
   * 
   * Special parameter: #qsopen=true or ?qsopen=true
   * Forces widget to open without requiring a query parameter match.
   */
  checkUrlParameters = () => {
    const { config } = this.props
    
    if (!config.managedWidgetId) {
      return
    }

    // Parse URL hash fragment and query string
    const hash = window.location.hash.substring(1)
    const query = window.location.search.substring(1)
    
    debugLogger.log('HASH-EXEC', {
      event: 'helpersimple-checkurlparameters-called',
      widgetId: config.managedWidgetId,
      currentUrlHash: hash,
      currentUrlQuery: query,
      hasHash: !!hash,
      hasQuery: !!query,
      timestamp: Date.now()
    })
    
    if (!hash && !query) {
      return
    }
    
    const hashParams = new URLSearchParams(hash)
    const queryParams = new URLSearchParams(query)
    
    // Check for special qsopen parameter (forces widget to open)
    if (hashParams.get('qsopen') === 'true' || queryParams.get('qsopen') === 'true') {
      debugLogger.log('HASH-EXEC', {
        event: 'helpersimple-checkurl-opening-widget-qsopen',
        widgetId: config.managedWidgetId,
        timestamp: Date.now()
      })
      this.openWidget(config.managedWidgetId)
      return 
    }

    // Get all shortIds from the managed widget
    const shortIds = this.getWidgetShortIds(config.managedWidgetId)
    
    if (shortIds.length === 0) {
      return
    }
    
    // Check if any shortId matches in either hash or query string
    shortIds.forEach(shortId => {
      const hashValue = hashParams.get(shortId) || queryParams.get(shortId)
      
      if (hashValue) {
        const currentHash = `${shortId}=${hashValue}`
        
        debugLogger.log('HASH-EXEC', {
          event: 'helpersimple-checkurl-shortid-match-detected',
          widgetId: config.managedWidgetId,
          shortId,
          hashValue,
          currentHash,
          lastExecutedHash: this.lastExecutedHash,
          willOpenWidget: currentHash !== this.lastExecutedHash,
          timestamp: Date.now()
        })
        
        // Only open widget if hash has changed (not already executed)
        if (currentHash !== this.lastExecutedHash) {
          debugLogger.log('HASH-EXEC', {
            event: 'helpersimple-checkurl-opening-widget-shortid-match',
            widgetId: config.managedWidgetId,
            shortId,
            hashValue,
            timestamp: Date.now()
          })
          // Open the widget using the proper API
          this.openWidget(config.managedWidgetId)
        } else {
          debugLogger.log('HASH-EXEC', {
            event: 'helpersimple-checkurl-skipping-already-executed-hash',
            widgetId: config.managedWidgetId,
            shortId,
            hashValue,
            lastExecutedHash: this.lastExecutedHash,
            timestamp: Date.now()
          })
        }
      }
    })
  }

  /**
   * Handles hash change events from the browser.
   * Re-checks parameters when the URL hash changes.
   */
  handleHashChange = () => {
    const hash = window.location.hash.substring(1)
    const query = window.location.search.substring(1)
    
    debugLogger.log('HASH-EXEC', {
      event: 'helpersimple-handlehashchange-fired',
      widgetId: this.props.config.managedWidgetId,
      currentUrlHash: hash,
      currentUrlQuery: query,
      lastExecutedHash: this.lastExecutedHash,
      timestamp: Date.now()
    })
    
    // Check parameters for widget opening
    this.checkUrlParameters()
    
    // Update hash entry tracking for logging/debugging
    const { config } = this.props
    if (config.managedWidgetId) {
      this.previousHashEntry = this.parseHashForWidgetSelection(config.managedWidgetId)
    }
  }

  /**
   * Handles QuerySimple selection change events.
   * Stores the selection state and hash entry immediately (event-driven).
   */
  handleQuerySimpleSelectionChange = (event: CustomEvent<{ widgetId: string, recordIds: string[], dataSourceId?: string }>) => {
    const { config } = this.props
    
    // Only track if this is our managed widget
    if (event.detail.widgetId === config.managedWidgetId) {
      this.querySimpleSelection = {
        recordIds: event.detail.recordIds,
        dataSourceId: event.detail.dataSourceId
      }
      
      // Immediately check hash to get output DS ID (event-driven, no polling)
      const hashEntry = this.parseHashForWidgetSelection(config.managedWidgetId)
      if (hashEntry) {
        this.previousHashEntry = hashEntry
      }
      
      debugLogger.log('SELECTION', {
        event: 'selection-tracked-from-querysimple',
        widgetId: event.detail.widgetId,
        recordCount: event.detail.recordIds.length,
        dataSourceId: event.detail.dataSourceId,
        hashEntry: this.previousHashEntry ? {
          outputDsId: this.previousHashEntry.outputDsId,
          recordCount: this.previousHashEntry.recordIds.length
        } : null
      })
    }
  }

  /**
   * Handles QuerySimple widget state changes (open/close).
   */
  handleQuerySimpleWidgetStateChange = (event: CustomEvent<{ widgetId: string, isOpen: boolean }>) => {
    const { config } = this.props
    
    // Only track if this is our managed widget
    if (event.detail.widgetId === config.managedWidgetId) {
      const wasOpen = this.querySimpleWidgetIsOpen
      const isNowOpen = event.detail.isOpen
      
      this.querySimpleWidgetIsOpen = isNowOpen
      
      debugLogger.log('WIDGET-STATE', {
        event: 'querysimple-widget-state-changed',
        widgetId: event.detail.widgetId,
        isOpen: event.detail.isOpen,
        wasOpen,
        transition: wasOpen !== isNowOpen ? (isNowOpen ? 'closed-to-open' : 'open-to-closed') : 'no-change'
      })
      
      this.previousWidgetState = isNowOpen
    }
  }

  /**
   * Handles QuerySimple hash query execution completion event.
   * Tracks the last executed hash parameter to prevent re-execution when switching queries.
   */
  handleHashQueryExecuted = (event: CustomEvent<{ widgetId: string, shortId: string, value: string, hashParam: string }>) => {
    const { widgetId, shortId, value, hashParam } = event.detail || {}
    const { config } = this.props
    
    // Only track if this is for our managed widget
    if (widgetId !== config.managedWidgetId) {
      debugLogger.log('HASH-EXEC', {
        event: 'helpersimple-hash-query-executed-ignored-wrong-widget',
        eventWidgetId: widgetId,
        managedWidgetId: config.managedWidgetId,
        timestamp: Date.now()
      })
      return
    }
    
    debugLogger.log('HASH-EXEC', {
      event: 'helpersimple-hash-query-executed-received',
      widgetId,
      shortId,
      value,
      hashParam,
      previousLastExecutedHash: this.lastExecutedHash,
      timestamp: Date.now()
    })
    
    // Track the last executed hash parameter
    // Format: "shortId=value" (e.g., "pin=2223059013")
    this.lastExecutedHash = hashParam
    
    debugLogger.log('HASH-EXEC', {
      event: 'helpersimple-last-executed-hash-updated',
      widgetId,
      lastExecutedHash: this.lastExecutedHash,
      timestamp: Date.now()
    })
  }


  /**
   * REMOVED: Polling-based selection tracking.
   * Now using event-driven approach via hashchange and QUERYSIMPLE_SELECTION_EVENT.
   */

  /**
   * Parses the `data_s` parameter from the URL hash and extracts widget output data source IDs.
   * 
   * Hash format: #data_s=id:widget_12_output_28628683957324497:451204+451205+...,id:...
   * OR: #data_s=id:dataSource_1-KingCo_PropertyInfo_6386_5375-2~widget_15_output_4504440367870579:451317
   * 
   * @param widgetId - The widget ID to match (e.g., "widget_12")
   * @returns Object with outputDsId and recordIds, or null if not found
   */
  parseHashForWidgetSelection = (widgetId: string): { outputDsId: string, recordIds: string[] } | null => {
    const hash = window.location.hash.substring(1)
    if (!hash) {
      return null
    }

    const urlParams = new URLSearchParams(hash)
    const dataS = urlParams.get('data_s')
    if (!dataS) {
      return null
    }

    // URL decode the data_s parameter
    const decodedDataS = decodeURIComponent(dataS)
    
    // Split by comma to get individual selections
    const selections = decodedDataS.split(',')
    
    // Pattern to match: widget_XX_output_* (where XX is the widget ID number)
    // Extract widget number from widgetId (e.g., "widget_12" -> "12")
    const widgetMatch = widgetId.match(/widget_(\d+)/)
    if (!widgetMatch) {
      return null
    }
    const widgetNumber = widgetMatch[1]
    const widgetPattern = new RegExp(`widget_${widgetNumber}_output_\\d+`)

    for (const selection of selections) {
      // Format: id:WIDGET_OUTPUT_DS_ID:RECORD_IDS
      // OR: id:DATA_SOURCE_ID~WIDGET_OUTPUT_DS_ID:RECORD_IDS
      if (!selection.startsWith('id:')) {
        continue
      }

      const idPart = selection.substring(3) // Remove "id:"
      const colonIndex = idPart.lastIndexOf(':')
      if (colonIndex === -1) {
        continue
      }

      const dsIdPart = idPart.substring(0, colonIndex)
      const recordIdsPart = idPart.substring(colonIndex + 1)

      // Check if this matches our widget's output DS pattern
      // Handle both formats: widget_XX_output_* or dataSource_*~widget_XX_output_*
      // IMPORTANT: Check for compound format FIRST (contains ~)
      // Otherwise the regex will match the pattern within the compound string
      let outputDsId: string | null = null
      if (dsIdPart.includes('~')) {
        // Compound format: dataSource_*~widget_XX_output_*
        const parts = dsIdPart.split('~')
        debugLogger.log('HASH', {
          event: 'parsing-compound-hash-format',
          widgetId,
          dsIdPart,
          parts,
          widgetPattern: widgetPattern.toString()
        })
        for (const part of parts) {
          if (part.match(widgetPattern)) {
            outputDsId = part
            debugLogger.log('HASH', {
              event: 'found-matching-widget-output-ds-id-compound-format',
              widgetId,
              outputDsId,
              part,
              allParts: parts
            })
            break
          }
        }
        if (!outputDsId) {
          debugLogger.log('HASH', {
            event: 'no-matching-widget-output-ds-id-compound-format',
            widgetId,
            dsIdPart,
            parts,
            widgetPattern: widgetPattern.toString()
          })
        }
      } else if (dsIdPart.match(widgetPattern)) {
        // Direct format: widget_XX_output_* (no ~ separator)
        outputDsId = dsIdPart
        debugLogger.log('HASH', {
          event: 'found-direct-format-widget-output-ds-id',
          widgetId,
          dsIdPart,
          outputDsId
        })
      }

      if (outputDsId) {
        // Parse record IDs (separated by +)
        const recordIds = recordIdsPart.split('+').filter(id => id.length > 0)
        debugLogger.log('HASH', {
          event: 'parsed-hash-entry-successfully',
          widgetId,
          outputDsId,
          recordCount: recordIds.length,
          recordIds: recordIds.slice(0, 5)
        })
        return { outputDsId, recordIds }
      } else {
        debugLogger.log('HASH', {
          event: 'no-widget-output-ds-id-found-in-hash',
          widgetId,
          dsIdPart,
          widgetPattern: widgetPattern.toString()
        })
      }
    }

    return null
  }

  /**
   * Starts watching for identify popup opening/closing using MutationObserver.
   * Logs popup state changes for debugging (no restoration logic).
   */
  startIdentifyPopupWatching = () => {
    if (this.identifyPopupObserver) {
      return // Already watching
    }

    const { config } = this.props
    if (!config.managedWidgetId) {
      return
    }

    // Watch for identify popup appearing/disappearing
    this.identifyPopupObserver = new MutationObserver(() => {
      const identifyPopupIsOpen = isIdentifyPopupOpen()
      const identifyPopupJustOpened = !this.identifyPopupWasOpen && identifyPopupIsOpen
      const identifyPopupJustClosed = this.identifyPopupWasOpen && !identifyPopupIsOpen

      if (identifyPopupJustOpened) {
        // Get current selection state at moment popup opens
        const originDSId = this.querySimpleSelection?.dataSourceId
        let currentSelectionAtOpen: { count: number, ids: string[] } | null = null
        if (originDSId) {
          const dsManager = DataSourceManager.getInstance()
          const originDS = dsManager.getDataSource(originDSId) as FeatureLayerDataSource
          if (originDS) {
            const selectedIds = originDS.getSelectedRecordIds() || []
            currentSelectionAtOpen = {
              count: selectedIds.length,
              ids: selectedIds.slice(0, 5)
            }
          }
        }

        debugLogger.log('SELECTION', {
          event: 'identify-popup-opened',
          widgetId: config.managedWidgetId,
          hasQuerySimpleSelection: !!this.querySimpleSelection,
          ourTrackedRecordCount: this.querySimpleSelection?.recordIds.length || 0,
          ourTrackedRecordIds: this.querySimpleSelection?.recordIds.slice(0, 5) || [],
          hasPreviousHashEntry: !!this.previousHashEntry,
          previousHashEntryOutputDsId: this.previousHashEntry?.outputDsId || null,
          currentSelectionAtOpen
        })
      }

      if (identifyPopupJustClosed) {
        // Get current selection state at moment popup closes
        const originDSId = this.querySimpleSelection?.dataSourceId
        let currentSelectionAtClose: { count: number, ids: string[] } | null = null
        if (originDSId) {
          const dsManager = DataSourceManager.getInstance()
          const originDS = dsManager.getDataSource(originDSId) as FeatureLayerDataSource
          if (originDS) {
            const selectedIds = originDS.getSelectedRecordIds() || []
            currentSelectionAtClose = {
              count: selectedIds.length,
              ids: selectedIds.slice(0, 5)
            }
          }
        }

        debugLogger.log('SELECTION', {
          event: 'identify-popup-closed',
          widgetId: config.managedWidgetId,
          hasQuerySimpleSelection: !!this.querySimpleSelection,
          ourTrackedRecordCount: this.querySimpleSelection?.recordIds.length || 0,
          ourTrackedRecordIds: this.querySimpleSelection?.recordIds.slice(0, 5) || [],
          hasPreviousHashEntry: !!this.previousHashEntry,
          previousHashEntryOutputDsId: this.previousHashEntry?.outputDsId || null,
          currentSelectionAtClose
        })
      }

      this.identifyPopupWasOpen = identifyPopupIsOpen
    })

    // Observe the document body for changes to identify popup
    this.identifyPopupObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden', 'style']
    })

    // Initial check
    this.identifyPopupWasOpen = isIdentifyPopupOpen()
    
    debugLogger.log('SELECTION', {
      event: 'identify-popup-watching-started',
      widgetId: config.managedWidgetId,
      initialPopupState: this.identifyPopupWasOpen
    })
  }

  /**
   * Stops watching for identify popup opening/closing.
   */
  stopIdentifyPopupWatching = () => {
    if (this.identifyPopupObserver) {
      this.identifyPopupObserver.disconnect()
      this.identifyPopupObserver = null
    }
    this.identifyPopupWasOpen = false
    
    const { config } = this.props
    if (config.managedWidgetId) {
      debugLogger.log('SELECTION', {
        event: 'identify-popup-watching-stopped',
        widgetId: config.managedWidgetId
      })
    }
  }

  render() {
    // Render nothing visible - this widget is always mounted but invisible
    return (
      <div 
        css={css`
          display: none;
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
        `}
        aria-hidden="true"
      />
    )
  }
}
