import React from 'react'
import { SelectionType } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Interface for widget state that relates to selection and restoration.
 */
export interface SelectionRestorationState {
  hasSelection: boolean
  selectionRecordCount: number
  lastSelection?: {
    recordIds: string[]
    outputDsId: string
    queryItemConfigId: string
  }
  resultsMode: SelectionType
  accumulatedRecords?: Array<{
    configId: string
    record: any // FeatureDataRecord
  }>
  isPanelVisible: boolean
}

/**
 * Interface for callbacks to update widget state.
 */
export interface SelectionRestorationCallbacks {
  onStateUpdate: (newState: Partial<SelectionRestorationState>) => void
}

/**
 * Manager class for handling selection state tracking and restoration logic.
 * 
 * This class centralizes the logic for:
 * - Section 3.1: Selection State Tracking (handleSelectionChange)
 * - Section 3.2: Panel Open/Close Restoration (addSelectionToMap, clearSelectionFromMap)
 * - Section 3.3: Map Identify Restoration (handleRestoreOnIdentifyClose)
 * 
 * Part of Chunk 3: Selection & Restoration extraction.
 * 
 * Note: This is a utility class (not a hook) to work with class components.
 */
export class SelectionRestorationManager {
  private widgetId: string = ''
  private stateGetter: () => SelectionRestorationState
  private callbacks: SelectionRestorationCallbacks

  constructor(
    stateGetter: () => SelectionRestorationState,
    callbacks: SelectionRestorationCallbacks
  ) {
    this.stateGetter = stateGetter
    this.callbacks = callbacks
  }

  /**
   * Sets the widget ID. Should be called once in componentDidMount.
   * @param widgetId - The widget ID
   */
  setWidgetId(widgetId: string): void {
    this.widgetId = widgetId
  }

  // ============================================================================
  // Section 3.1: Selection State Tracking
  // ============================================================================

  /**
   * Handles selection change events from queries.
   * 
   * This method:
   * 1. Ignores events not for this widget
   * 2. Ignores empty selections when panel is closed (to prevent state wipe)
   * 3. Calculates selection count (uses accumulated records in Add/Remove modes)
   * 4. Updates widget state: hasSelection, selectionRecordCount, lastSelection
   * 5. Resets mode to NewSelection if selection is cleared in Remove mode
   * 
   * @param event - The selection change event
   */
  handleSelectionChange(event: Event): void {
    const customEvent = event as CustomEvent<{ 
      widgetId: string
      recordIds: string[]
      dataSourceId?: string
      outputDsId?: string
      queryItemConfigId?: string 
    }>

    // Get current state
    const state = this.stateGetter()

    // ========================================================================
    // CHUNK-3-COMPARE: Log state BEFORE processing
    // ========================================================================
    const stateBefore = {
      hasSelection: state.hasSelection,
      selectionRecordCount: state.selectionRecordCount,
      lastSelection: state.lastSelection,
      resultsMode: state.resultsMode,
      accumulatedRecordsCount: state.accumulatedRecords?.length || 0,
      isPanelVisible: state.isPanelVisible
    }

    debugLogger.log('CHUNK-3-COMPARE', {
      event: 'new-implementation-handleSelectionChange-before',
      widgetId: this.widgetId,
      newImplementation: {
        stateBefore,
        eventWidgetId: customEvent.detail.widgetId,
        eventRecordIdsCount: customEvent.detail.recordIds.length,
        eventHasOutputDsId: !!customEvent.detail.outputDsId,
        eventHasQueryItemConfigId: !!customEvent.detail.queryItemConfigId,
        timestamp: Date.now()
      }
    })

    // ========================================================================
    // 1. Only track if this is for our widget
    // ========================================================================
    if (customEvent.detail.widgetId !== this.widgetId) {
      debugLogger.log('CHUNK-3-COMPARE', {
        event: 'new-implementation-handleSelectionChange-ignoring-other-widget',
        widgetId: this.widgetId,
        newImplementation: {
          stateBefore,
          eventWidgetId: customEvent.detail.widgetId,
          reason: 'event-for-different-widget',
          timestamp: Date.now()
        }
      })
      return
    }

    // ========================================================================
    // 2. Ignore empty selections when panel is closed
    // ========================================================================
    const hasSelection = customEvent.detail.recordIds && customEvent.detail.recordIds.length > 0

    if (!state.isPanelVisible && !hasSelection) {
      debugLogger.log('RESTORE', {
        event: 'handleSelectionChange-ignoring-empty-selection-while-panel-closed',
        widgetId: this.widgetId,
        timestamp: Date.now()
      })
      
      debugLogger.log('CHUNK-3-COMPARE', {
        event: 'new-implementation-handleSelectionChange-ignoring-empty-while-closed',
        widgetId: this.widgetId,
        newImplementation: {
          stateBefore,
          eventRecordIdsCount: customEvent.detail.recordIds.length,
          isPanelVisible: state.isPanelVisible,
          hasSelection,
          reason: 'panel-closed-and-empty-selection',
          timestamp: Date.now()
        }
      })
      return
    }

    // ========================================================================
    // 3. Calculate selection count
    // ========================================================================
    // In "Add to" or "Remove from" mode, use accumulated records count
    const isAccumulationMode = state.resultsMode === SelectionType.AddToSelection || 
                               state.resultsMode === SelectionType.RemoveFromSelection
    const accumulatedRecordsCount = state.accumulatedRecords?.length || 0
    const selectionCount = isAccumulationMode && accumulatedRecordsCount > 0
      ? accumulatedRecordsCount
      : (hasSelection ? customEvent.detail.recordIds.length : 0)

    // ========================================================================
    // 4. Determine if mode should reset
    // ========================================================================
    // If selection is cleared in Remove mode, reset to NewSelection
    const shouldResetMode = !hasSelection && 
                            selectionCount === 0 && 
                            state.resultsMode === SelectionType.RemoveFromSelection

    // ========================================================================
    // 5. Build new state
    // ========================================================================
    const newState: Partial<SelectionRestorationState> = {
      hasSelection: selectionCount > 0,
      selectionRecordCount: selectionCount,
      // Store lastSelection for compatibility
      lastSelection: hasSelection && customEvent.detail.outputDsId && customEvent.detail.queryItemConfigId
        ? {
            recordIds: customEvent.detail.recordIds,
            outputDsId: customEvent.detail.outputDsId,
            queryItemConfigId: customEvent.detail.queryItemConfigId
          }
        : undefined
    }

    // Reset mode if needed
    if (shouldResetMode) {
      newState.resultsMode = SelectionType.NewSelection
      newState.accumulatedRecords = [] // Also clear accumulated records
    }

    // ========================================================================
    // 6. Log decision logic
    // ========================================================================
    debugLogger.log('RESTORE', {
      event: 'handleSelectionChange-updating-state',
      widgetId: this.widgetId,
      resultsMode: state.resultsMode,
      isAccumulationMode,
      eventRecordIdsCount: customEvent.detail.recordIds.length,
      hasSelectionFromEvent: hasSelection,
      accumulatedRecordsCountBefore: accumulatedRecordsCount,
      calculatedSelectionCount: selectionCount,
      'will-set-hasSelection': selectionCount > 0,
      'will-set-lastSelection': hasSelection && !!customEvent.detail.outputDsId && !!customEvent.detail.queryItemConfigId,
      'will-reset-mode': shouldResetMode,
      decisionLogic: {
        'isAccumulationMode': isAccumulationMode,
        'accumulatedRecordsCount > 0': accumulatedRecordsCount > 0,
        'use-accumulated-count': isAccumulationMode && accumulatedRecordsCount > 0,
        'use-event-count': !(isAccumulationMode && accumulatedRecordsCount > 0),
        'should-reset-mode': shouldResetMode
      }
    })

    // ========================================================================
    // 7. Update state via callback
    // ========================================================================
    this.callbacks.onStateUpdate(newState)

    // ========================================================================
    // 8. Log state AFTER update
    // ========================================================================
    debugLogger.log('RESTORE', {
      event: 'handleSelectionChange-state-updated',
      widgetId: this.widgetId,
      'new-hasSelection': selectionCount > 0,
      'new-selectionRecordCount': selectionCount,
      'new-lastSelection-recordIds-count': hasSelection && customEvent.detail.outputDsId && customEvent.detail.queryItemConfigId
        ? customEvent.detail.recordIds.length
        : 0,
      'mode-reset': shouldResetMode,
      'new-mode': shouldResetMode ? SelectionType.NewSelection : state.resultsMode,
      'note': shouldResetMode 
        ? 'Mode reset to NewSelection because selection was cleared in Remove mode'
        : 'lastSelection-only-contains-current-query-records-not-all-accumulated-records'
    })

    debugLogger.log('CHUNK-3-COMPARE', {
      event: 'new-implementation-handleSelectionChange-after',
      widgetId: this.widgetId,
      newImplementation: {
        stateBefore,
        stateAfter: {
          hasSelection: newState.hasSelection,
          selectionRecordCount: newState.selectionRecordCount,
          lastSelectionRecordIdsCount: newState.lastSelection?.recordIds.length || 0,
          resultsMode: newState.resultsMode || state.resultsMode,
          accumulatedRecordsCount: newState.accumulatedRecords?.length ?? state.accumulatedRecords?.length ?? 0
        },
        decisionLogic: {
          isAccumulationMode,
          accumulatedRecordsCount,
          selectionCount,
          shouldResetMode
        },
        result: 'success',
        timestamp: Date.now()
      }
    })
  }

  // ============================================================================
  // Section 3.2: Panel Open/Close Restoration
  // ============================================================================
  // TODO: Implement addSelectionToMap() and clearSelectionFromMap()

  // ============================================================================
  // Section 3.3: Map Identify Restoration
  // ============================================================================
  // TODO: Implement handleRestoreOnIdentifyClose()
}
