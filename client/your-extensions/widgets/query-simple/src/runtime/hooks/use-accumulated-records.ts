import { type FeatureDataRecord } from 'jimu-core'
import { SelectionType } from '../../config'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

interface AccumulatedRecordsCallbacks {
  onModeChange?: (mode: SelectionType) => void
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
}

/**
 * Utility to manage accumulated records and results mode state.
 * 
 * Centralizes accumulated records management logic for the widget.
 * Handles results mode changes, accumulated records updates, and mode reset logic.
 * 
 * Part of Chunk 5: Accumulated Records Management extraction.
 * 
 * Note: This is a utility class (not a hook) to work with class components.
 */
export class AccumulatedRecordsManager {
  private resultsMode: SelectionType = SelectionType.NewSelection
  private accumulatedRecords: FeatureDataRecord[] = []
  private callbacks?: AccumulatedRecordsCallbacks

  /**
   * Sets callbacks for mode change and accumulated records change events.
   * 
   * @param callbacks - Callbacks for mode change and accumulated records change
   */
  setCallbacks(callbacks: AccumulatedRecordsCallbacks): void {
    this.callbacks = callbacks
  }

  /**
   * Gets the current results mode.
   * 
   * @returns Current results mode
   */
  getResultsMode(): SelectionType {
    return this.resultsMode
  }

  /**
   * Gets the current accumulated records.
   * 
   * @returns Current accumulated records array
   */
  getAccumulatedRecords(): FeatureDataRecord[] {
    return this.accumulatedRecords
  }

  /**
   * Gets the count of accumulated records.
   * 
   * @returns Number of accumulated records
   */
  getAccumulatedRecordsCount(): number {
    return this.accumulatedRecords.length
  }

  /**
   * Checks if the widget is in accumulation mode (Add to or Remove from).
   * 
   * @returns True if in accumulation mode, false otherwise
   */
  isAccumulationMode(): boolean {
    return this.resultsMode === SelectionType.AddToSelection || 
           this.resultsMode === SelectionType.RemoveFromSelection
  }

  /**
   * Checks if there are accumulated records.
   * 
   * @returns True if accumulated records exist, false otherwise
   */
  hasAccumulatedRecords(): boolean {
    return this.accumulatedRecords.length > 0
  }

  /**
   * Handles results mode change.
   * 
   * Updates the results mode and optionally clears accumulated records when switching
   * to "New" mode. Also handles hash parameter consumption when switching to accumulation modes.
   * 
   * @param widgetId - Widget ID for logging
   * @param mode - New results mode
   * @param shouldConsumeHash - Whether to consume hash parameter (for deep linking)
   * @param hashShortId - Optional shortId to consume from hash
   * @param removeHashParameter - Optional callback to remove hash parameter
   */
  handleResultsModeChange(
    widgetId: string,
    mode: SelectionType,
    shouldConsumeHash: boolean = false,
    hashShortId?: string,
    removeHashParameter?: (shortId: string) => void
  ): { resultsMode: SelectionType, accumulatedRecords: FeatureDataRecord[] } {
    const previousMode = this.resultsMode
    const currentAccumulatedCount = this.accumulatedRecords.length

    debugLogger.log('RESULTS-MODE', {
      event: 'handleResultsModeChange-triggered',
      widgetId,
      previousMode,
      newMode: mode,
      currentAccumulatedCount,
      timestamp: Date.now()
    })

    // Consume deep link when switching to accumulation modes
    if (shouldConsumeHash && (mode === SelectionType.AddToSelection || mode === SelectionType.RemoveFromSelection)) {
      if (hashShortId && removeHashParameter) {
        debugLogger.log('HASH', {
          event: 'consuming-hash-on-mode-switch',
          widgetId,
          mode,
          shortId: hashShortId
        })
        removeHashParameter(hashShortId)
      }
    }

    // If switching to "New" mode, clear accumulated records
    if (mode === SelectionType.NewSelection) {
      debugLogger.log('RESULTS-MODE', {
        event: 'clearing-accumulated-records-on-mode-switch',
        widgetId,
        previousMode
      })
      this.resultsMode = mode
      this.accumulatedRecords = []
    } else {
      this.resultsMode = mode
    }

    // Trigger callback
    if (this.callbacks?.onModeChange) {
      this.callbacks.onModeChange(this.resultsMode)
    }

    return {
      resultsMode: this.resultsMode,
      accumulatedRecords: this.accumulatedRecords
    }
  }

  /**
   * Handles accumulated records change.
   * 
   * Updates the accumulated records array.
   * 
   * @param widgetId - Widget ID for logging
   * @param records - New accumulated records array
   */
  handleAccumulatedRecordsChange(widgetId: string, records: FeatureDataRecord[]): void {
    const previousCount = this.accumulatedRecords.length
    const newCount = records.length

    debugLogger.log('RESULTS-MODE', {
      event: 'handleAccumulatedRecordsChange-triggered',
      widgetId,
      previousCount,
      newCount,
      timestamp: Date.now()
    })

    this.accumulatedRecords = records

    // Trigger callback
    if (this.callbacks?.onAccumulatedRecordsChange) {
      this.callbacks.onAccumulatedRecordsChange(this.accumulatedRecords)
    }
  }

  /**
   * Resets mode to "New Selection" and clears accumulated records.
   * 
   * Called when hash parameters are detected to reset the widget to a clean state.
   * 
   * @param widgetId - Widget ID for logging
   * @param currentMode - Current mode before reset
   */
  resetModeOnHashDetection(widgetId: string, currentMode: SelectionType): { resultsMode: SelectionType, accumulatedRecords: FeatureDataRecord[] } {
    if (currentMode !== SelectionType.NewSelection) {
      debugLogger.log('HASH', {
        event: 'mode-reset-needed-on-hash-detection',
        widgetId,
        currentMode,
        timestamp: Date.now()
      })
      this.resultsMode = SelectionType.NewSelection
      this.accumulatedRecords = []
    }

    return {
      resultsMode: this.resultsMode,
      accumulatedRecords: this.accumulatedRecords
    }
  }

  /**
   * Cleans up the manager.
   * 
   * Resets state to initial values.
   */
  cleanup(): void {
    this.resultsMode = SelectionType.NewSelection
    this.accumulatedRecords = []
    this.callbacks = undefined
  }
}


