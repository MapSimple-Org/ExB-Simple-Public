import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Event name constants for QuerySimple widget events.
 */
export const QUERYSIMPLE_SELECTION_EVENT = 'querysimple-selection-changed'
export const RESTORE_ON_IDENTIFY_CLOSE_EVENT = 'querysimple-restore-on-identify-close'
export const OPEN_WIDGET_EVENT = 'helpersimple-open-widget'

/**
 * Event handler callbacks for EventManager.
 */
export interface EventHandlers {
  onOpenWidgetEvent?: (event: CustomEvent) => void
  onSelectionChange?: (event: Event) => void
  onRestoreOnIdentifyClose?: (event: Event) => void
}

/**
 * Utility to manage event listeners and custom event dispatching.
 * 
 * Centralizes event handling logic for the widget, including:
 * - Event listener setup/cleanup
 * - Custom event dispatching
 * - Event handler registration
 * 
 * Part of Chunk 7: Event Handling extraction.
 * 
 * Note: This is a utility class (not a hook) to work with class components.
 */
export class EventManager {
  private handlers?: EventHandlers
  private listenersSetup: boolean = false

  /**
   * Sets event handler callbacks.
   * 
   * @param handlers - Event handler callbacks
   */
  setHandlers(handlers: EventHandlers): void {
    this.handlers = handlers
  }

  /**
   * Sets up all event listeners.
   * 
   * Registers listeners for:
   * - OPEN_WIDGET_EVENT: HelperSimple orchestration
   * - QUERYSIMPLE_SELECTION_EVENT: Selection changes from QueryTaskResult
   * - RESTORE_ON_IDENTIFY_CLOSE_EVENT: Restore selection after identify popup closes
   * 
   * @param widgetId - Widget ID for logging
   */
  setup(widgetId: string): void {
    if (this.listenersSetup) {
      debugLogger.log('EVENTS', {
        event: 'event-manager-setup-already-setup',
        widgetId,
        timestamp: Date.now()
      })
      return
    }

    debugLogger.log('EVENTS', {
      event: 'event-manager-setup-start',
      widgetId,
      timestamp: Date.now()
    })

    // Listen for HelperSimple orchestration events
    window.addEventListener(OPEN_WIDGET_EVENT, this.handleOpenWidgetEventBound)
    
    // Listen for selection changes from query-result
    window.addEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleSelectionChangeBound)
    
    // Listen for restore requests when identify popup closes
    window.addEventListener(RESTORE_ON_IDENTIFY_CLOSE_EVENT, this.handleRestoreOnIdentifyCloseBound)

    this.listenersSetup = true

    debugLogger.log('EVENTS', {
      event: 'event-manager-setup-complete',
      widgetId,
      listenersRegistered: 3,
      timestamp: Date.now()
    })
  }

  /**
   * Cleans up all event listeners.
   * 
   * @param widgetId - Widget ID for logging
   */
  cleanup(widgetId: string): void {
    if (!this.listenersSetup) {
      debugLogger.log('EVENTS', {
        event: 'event-manager-cleanup-not-setup',
        widgetId,
        timestamp: Date.now()
      })
      return
    }

    debugLogger.log('EVENTS', {
      event: 'event-manager-cleanup-start',
      widgetId,
      timestamp: Date.now()
    })

    window.removeEventListener(OPEN_WIDGET_EVENT, this.handleOpenWidgetEventBound)
    window.removeEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleSelectionChangeBound)
    window.removeEventListener(RESTORE_ON_IDENTIFY_CLOSE_EVENT, this.handleRestoreOnIdentifyCloseBound)

    this.listenersSetup = false
    this.handlers = undefined

    debugLogger.log('EVENTS', {
      event: 'event-manager-cleanup-complete',
      widgetId,
      timestamp: Date.now()
    })
  }

  /**
   * Dispatches a custom event to notify Widget/HelperSimple of selection changes.
   * BUG-STALE-COUNT-001: accumulatedRecordsCount in detail so handler does not read stale state.
   *
   * @param widgetId - Widget ID
   * @param recordIds - Array of selected record IDs
   * @param dataSourceId - Optional data source ID
   * @param outputDsId - Output data source ID
   * @param queryItemConfigId - Query item config ID
   * @param accumulatedRecordsCount - Current accumulated count at dispatch time (pass 0 when clearing)
   * 
   * r022.2: outputDsId/queryItemConfigId still used for event detail but not for lastSelection (removed)
   */
  dispatchSelectionEvent(
    widgetId: string,
    recordIds: string[],
    dataSourceId?: string,
    outputDsId?: string,
    queryItemConfigId?: string,
    accumulatedRecordsCount?: number
  ): void {
    debugLogger.log('EVENTS', {
      event: 'event-manager-dispatch-selection-event',
      widgetId,
      recordIdsCount: recordIds.length,
      accumulatedRecordsCount,
      dataSourceId,
      outputDsId,
      queryItemConfigId,
      timestamp: Date.now()
    })

    const event = new CustomEvent(QUERYSIMPLE_SELECTION_EVENT, {
      detail: {
        widgetId,
        recordIds,
        dataSourceId,
        outputDsId,
        queryItemConfigId,
        accumulatedRecordsCount
      },
      bubbles: true,
      cancelable: true
    })

    window.dispatchEvent(event)

    debugLogger.log('EVENTS', {
      event: 'event-manager-selection-event-dispatched',
      widgetId,
      recordIdsCount: recordIds.length,
      accumulatedRecordsCount,
      timestamp: Date.now()
    })
  }

  /**
   * Checks if event listeners are currently set up.
   * 
   * @returns True if listeners are set up, false otherwise
   */
  isSetup(): boolean {
    return this.listenersSetup
  }

  /**
   * Bound event handler for OPEN_WIDGET_EVENT.
   */
  private handleOpenWidgetEventBound = (event: Event) => {
    if (this.handlers?.onOpenWidgetEvent) {
      this.handlers.onOpenWidgetEvent(event as CustomEvent)
    }
  }

  /**
   * Bound event handler for QUERYSIMPLE_SELECTION_EVENT.
   */
  private handleSelectionChangeBound = (event: Event) => {
    if (this.handlers?.onSelectionChange) {
      this.handlers.onSelectionChange(event)
    }
  }

  /**
   * Bound event handler for RESTORE_ON_IDENTIFY_CLOSE_EVENT.
   */
  private handleRestoreOnIdentifyCloseBound = (event: Event) => {
    if (this.handlers?.onRestoreOnIdentifyClose) {
      this.handlers.onRestoreOnIdentifyClose(event)
    }
  }
}

