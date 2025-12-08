/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps, getAppStore, type IMState, WidgetManager, appActions } from 'jimu-core'
import { type IMConfig } from '../config'
import { versionManager } from '../version-manager'

/**
 * Custom event name for notifying managed widgets to process hash parameters.
 * This event is dispatched after a widget is opened in a controller.
 */
const OPEN_WIDGET_EVENT = 'helpersimple-open-widget'

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

  componentDidMount() {
    // Listen for hash changes to detect when URL hash parameters are updated
    window.addEventListener('hashchange', this.handleHashChange)
    // Check hash on initial mount
    this.checkHash()
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange)
  }

  componentDidUpdate(prevProps: AllWidgetProps<IMConfig>) {
    // Re-check hash if managed widget configuration changed
    if (prevProps.config.managedWidgetId !== this.props.config.managedWidgetId) {
      this.checkHash()
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
    
    this.loadWidgetClass(widgetId)
      .then(() => {
        getAppStore().dispatch(openAction)
      })
      .then(() => {
        // Give the widget a moment to mount, then notify it to process hash parameters
        setTimeout(() => {
          const event = new CustomEvent(OPEN_WIDGET_EVENT, {
            detail: { widgetId },
            bubbles: true,
            cancelable: true
          })
          window.dispatchEvent(event)
        }, 500)
      })
      .catch((error) => {
        // ERROR HANDLING: This helper widget uses console.error directly (not debugLogger)
        // because it's a utility widget that operates silently. This is acceptable because:
        // 1. HelperSimple is designed to fail silently - widget may already be open or
        //    not exist, which is not a user-facing error
        // 2. The error is gated by debug parameter check (only logs if debug !== 'false')
        // 3. No user-facing UI to display errors in this minimal helper widget
        //
        // FUTURE IMPROVEMENT: Consider migrating to debugLogger for consistency:
        //   - Import debugLogger from query-simple or create shared instance
        //   - Use debugLogger.log('HELPER', { error: ... }) instead of console.error
        //   - This would provide better consistency and centralized debug control
        //
        // Log for debugging but don't show to user (expected in some scenarios)
        // Widget may already be open or not in a controller
        const errorMessage = error instanceof Error ? error.message : String(error)
        // Only log if debug is enabled (not explicitly disabled)
        const urlParams = new URLSearchParams(window.location.search)
        const debugValue = urlParams.get('debug')
        if (debugValue !== 'false') {
          console.error('[HelperSimple] Error opening widget:', {
            widgetId,
            error: errorMessage,
            errorStack: error instanceof Error ? error.stack : undefined,
            note: 'Widget may already be open or not in a controller'
          })
        }
        // Don't set error state - this is expected in some scenarios
      })
  }

  /**
   * Checks URL hash parameters for shortIds that match the managed widget.
   * 
   * If a match is found, opens the widget using the Experience Builder API.
   * Hash format: #shortId=value (e.g., #pin=2223059013)
   * 
   * Special parameter: #qsopen=true
   * Forces widget to open without requiring a query parameter match.
   * Useful for testing (e.g., Playwright E2E tests) or when you need the widget
   * open but don't have a query parameter to trigger it.
   * Can be combined with query parameters: #qsopen=true&pin=2223059013
   */
  checkHash = () => {
    const { config } = this.props
    
    if (!config.managedWidgetId) {
      return
    }

    // Parse URL hash fragment
    const hash = window.location.hash.substring(1)
    
    if (!hash) {
      return
    }
    
    const urlParams = new URLSearchParams(hash)
    
    // Check for special qsopen parameter (forces widget to open)
    // This is useful for Playwright tests that need the widget open
    // but don't necessarily need to execute a query
    if (urlParams.get('qsopen') === 'true') {
      this.openWidget(config.managedWidgetId)
      return // Open widget and return early (don't need to check shortIds)
    }

    // Get all shortIds from the managed widget
    const shortIds = this.getWidgetShortIds(config.managedWidgetId)
    
    if (shortIds.length === 0) {
      return
    }
    
    // Check if any shortId matches a hash parameter key
    shortIds.forEach(shortId => {
      if (urlParams.has(shortId)) {
        // Open the widget using the proper API
        this.openWidget(config.managedWidgetId)
      }
    })
  }

  /**
   * Handles hash change events from the browser.
   * Re-checks hash parameters when the URL hash changes.
   */
  handleHashChange = () => {
    this.checkHash()
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
