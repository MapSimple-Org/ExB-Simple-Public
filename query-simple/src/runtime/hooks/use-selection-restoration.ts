import React from 'react'
import { SelectionType } from '../../config'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Interface for widget state that relates to selection and restoration.
 * r022.2: lastSelection removed - accumulatedRecords is universal source of truth
 */
export interface SelectionRestorationState {
  hasSelection: boolean
  selectionRecordCount: number
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
 * Dependencies needed for panel restoration methods.
 * These are typically passed at runtime when calling addSelectionToMap/clearSelectionFromMap.
 */
export interface RestorationDependencies {
  graphicsLayerRef: { current: __esri.GraphicsLayer | null }
  mapViewRef: { current: __esri.MapView | null }
  graphicsLayerManager: {
    clearGraphics: (widgetId: string, config: any) => void
  }
  config: Record<string, any>
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
   * 4. Updates widget state: hasSelection, selectionRecordCount
   * 5. Resets mode to NewSelection if selection is cleared in Remove mode
   * 
   * r022.2: lastSelection removed from state updates
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
      accumulatedRecordsCount?: number
    }>

    // Get current state
    const state = this.stateGetter()

    // ========================================================================
    // 1. Only track if this is for our widget
    // ========================================================================
    if (customEvent.detail.widgetId !== this.widgetId) {
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
      return
    }

    // ========================================================================
    // 3. Calculate selection count
    // ========================================================================
    const isAccumulationMode = state.resultsMode === SelectionType.AddToSelection ||
                               state.resultsMode === SelectionType.RemoveFromSelection
    const stateAccumulatedCount = state.accumulatedRecords?.length ?? 0
    const eventAccumulatedCount = customEvent.detail.accumulatedRecordsCount ?? 0
    // r022.43: FIX - Use stateAccumulatedCount (widget source of truth) not eventAccumulatedCount (stale hashEntry)
    // When switching layers in Add mode, HelperSimple hashEntry is stale (old layer count), but state is correct
    const selectionCount = isAccumulationMode && stateAccumulatedCount > 0
      ? stateAccumulatedCount
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
    // r022.2: lastSelection removed - accumulatedRecords is universal source of truth
    const newState: Partial<SelectionRestorationState> = {
      hasSelection: selectionCount > 0,
      selectionRecordCount: selectionCount
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
      eventAccumulatedCount,
      stateAccumulatedCount,
      calculatedSelectionCount: selectionCount,
      'will-set-hasSelection': selectionCount > 0,
      'will-reset-mode': shouldResetMode,
      decisionLogic: {
        isAccumulationMode,
        'stateAccumulatedCount > 0': stateAccumulatedCount > 0,
        'use-state-accumulated-count': isAccumulationMode && stateAccumulatedCount > 0,
        'should-reset-mode': shouldResetMode,
        note: 'r022.43: Using stateAccumulatedCount (widget state) not eventAccumulatedCount (stale hashEntry)'
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
      'mode-reset': shouldResetMode,
      'new-mode': shouldResetMode ? SelectionType.NewSelection : state.resultsMode,
      note: shouldResetMode 
        ? 'Mode reset to NewSelection because selection was cleared in Remove mode'
        : 'r022.2: lastSelection removed - accumulatedRecords is universal source'
    })
  }

  // ============================================================================
  // Section 3.2: Panel Open/Close Restoration
  // ============================================================================

  /**
   * Restores selection to the map when the widget panel opens.
   * 
   * This method:
   * 1. Checks if accumulated records exist (ALL modes)
   * 2. Groups accumulated records by origin data source
   * 3. Calls selectRecordsAndPublish for each origin DS
   * 
   * r022.2: lastSelection fallback removed - accumulatedRecords is universal source
   * r022.41: Added manageGraphicsLayer parameter for shared restoration path
   * 
   * @param deps - Runtime dependencies (graphics layer, map view, config)
   * @param manageGraphicsLayer - If true (default), clears and re-adds graphics layer.
   *                              If false, skips graphics operations (e.g., for Identify popup restore)
   */
  async addSelectionToMap(deps: RestorationDependencies, manageGraphicsLayer: boolean = true): Promise<void> {
    const state = this.stateGetter()
    const { accumulatedRecords, resultsMode } = state

    debugLogger.log('RESTORE', {
      event: 'addSelectionToMap-called',
      widgetId: this.widgetId,
      resultsMode,
      hasAccumulatedRecords: !!(accumulatedRecords && accumulatedRecords.length > 0),
      accumulatedRecordsCount: accumulatedRecords?.length || 0,
      note: 'r022.2: lastSelection removed - accumulatedRecords is universal source of truth'
    })

    // r022.1/r022.2: Use accumulatedRecords for ALL modes (reflects removals)
    // accumulatedRecords is universal source of truth across New/Add/Remove modes
    if (accumulatedRecords && accumulatedRecords.length > 0) {
      debugLogger.log('RESTORE', {
        event: 'addSelectionToMap-found-accumulated-records',
        widgetId: this.widgetId,
        resultsMode,
        accumulatedRecordsCount: accumulatedRecords.length,
        manageGraphicsLayer
      })
      
      await this.restoreAccumulatedRecords(accumulatedRecords, deps, manageGraphicsLayer)
    } else {
      debugLogger.log('RESTORE', {
        event: 'addSelectionToMap-no-selection-to-restore',
        widgetId: this.widgetId,
        resultsMode,
        note: 'r022.2: No accumulated records - nothing to restore'
      })
    }
  }

  /**
   * Helper: Restore accumulated records (grouped by origin DS)
   * r022.41: Added manageGraphicsLayer parameter
   */
  private async restoreAccumulatedRecords(
    accumulatedRecords: Array<{ configId: string, record: any }>,
    deps: RestorationDependencies,
    manageGraphicsLayer: boolean
  ): Promise<void> {
    // Lazy-load dependencies
    const { DataSourceManager } = await import('jimu-core')
    const { selectRecordsAndPublish } = await import('../selection-utils')

    const recordsByOriginDS = new Map<any, any[]>() // Map<FeatureLayerDataSource, FeatureDataRecord[]>
    const dsManager = DataSourceManager.getInstance()

    // Group records by origin DS
    accumulatedRecords.forEach((record, index) => {
      const recordId = record.getId()
      let originDS: any | null = null

      // Method 1: Try to get from record.getDataSource()
      const recordDS = record.getDataSource?.()
      if (recordDS) {
        originDS = recordDS.getOriginDataSources?.()?.[0] || recordDS

        debugLogger.log('RESTORE', {
          event: 'found-origin-ds-from-record-ds',
          widgetId: this.widgetId,
          recordIndex: index,
          recordId,
          originDSId: originDS?.id || 'null',
          method: 'record.getDataSource()'
        })
      }

      // Method 2: If that failed, search all data sources for a record with matching ID
      if (!originDS) {
        const dsMap = dsManager.getDataSources()
        const allDataSources = Object.values(dsMap)

        for (const ds of allDataSources) {
          // Check if this is a FeatureLayerDataSource
          if (ds && typeof (ds as any).getAllLoadedRecords === 'function') {
            try {
              const allRecords = (ds as any).getAllLoadedRecords() || []
              const matchingRecord = allRecords.find((r: any) => r.getId() === recordId)

              if (matchingRecord) {
                originDS = (ds as any).getOriginDataSources?.()?.[0] || ds

                debugLogger.log('RESTORE', {
                  event: 'found-origin-ds-via-search',
                  widgetId: this.widgetId,
                  recordIndex: index,
                  recordId,
                  originDSId: originDS.id,
                  method: 'searched-all-data-sources',
                  searchedDSId: ds.id
                })
                break
              }
            } catch (error) {
              // Continue searching
            }
          }
        }
      }

      if (originDS) {
        if (!recordsByOriginDS.has(originDS)) {
          recordsByOriginDS.set(originDS, [])
        }
        recordsByOriginDS.get(originDS)!.push(record)
      } else {
        debugLogger.log('RESTORE', {
          event: 'could-not-find-origin-ds-for-record',
          widgetId: this.widgetId,
          recordIndex: index,
          recordId,
          warning: 'record-will-be-skipped'
        })
      }
    })

    debugLogger.log('RESTORE', {
      event: 'panel-opened-restoring-accumulated-records',
      widgetId: this.widgetId,
      resultsMode: this.stateGetter().resultsMode,
      accumulatedRecordsCount: accumulatedRecords.length,
      originDSCount: recordsByOriginDS.size
    })

    // Restore selection for each origin data source
    const graphicsLayer = deps.graphicsLayerRef.current || undefined
    const mapView = deps.mapViewRef.current || undefined

    // r022.41: Conditionally manage graphics layer based on caller context
    // Widget close/open: manageGraphicsLayer=true (clears and re-adds graphics)
    // Identify popup restore: manageGraphicsLayer=false (graphics already visible, just restore DS selection)
    if (manageGraphicsLayer && graphicsLayer && mapView) {
      const { clearGraphicsLayer: clearGL, addHighlightGraphics } = await import('../graphics-layer-utils')
      
      debugLogger.log('RESTORE', {
        event: 'clearing-graphics-before-restore',
        widgetId: this.widgetId,
        graphicsLayerId: graphicsLayer.id,
        graphicsCountBefore: graphicsLayer.graphics.length,
        manageGraphicsLayer,
        accumulatedRecordsStructure: accumulatedRecords.map((item, i) => ({
          index: i,
          hasConfigId: !!item.configId,
          hasRecord: !!item.record,
          configId: item.configId,
          recordId: item.record?.getId?.() || 'no-getId',
          itemKeys: Object.keys(item)
        })).slice(0, 5),
        timestamp: Date.now()
      })
      
      clearGL(graphicsLayer)
      
      // r021.93: accumulatedRecords are the raw FeatureDataRecord objects, not wrapped
      // Filter out any null/undefined entries
      const validRecords = accumulatedRecords.filter(record => record != null)
      
      await addHighlightGraphics(graphicsLayer, validRecords, mapView)
      
      debugLogger.log('RESTORE', {
        event: 'graphics-restored-in-batch',
        widgetId: this.widgetId,
        graphicsLayerId: graphicsLayer.id,
        accumulatedRecordsCount: accumulatedRecords.length,
        validRecordsCount: validRecords.length,
        finalGraphicsCount: graphicsLayer.graphics.length,
        manageGraphicsLayer,
        timestamp: Date.now()
      })
    } else if (!manageGraphicsLayer) {
      debugLogger.log('RESTORE', {
        event: 'graphics-management-skipped',
        widgetId: this.widgetId,
        manageGraphicsLayer,
        reason: 'caller-requested-skip-graphics-layer',
        note: 'r022.41: Used for Identify popup restore where graphics already visible',
        timestamp: Date.now()
      })
    }

    // Now restore selection in each origin DS (without graphics, since we already added them above)
    for (const [originDS, records] of recordsByOriginDS.entries()) {
      const recordIds = records.map(r => r.getId())
      try {
        await selectRecordsAndPublish(
          this.widgetId,
          originDS,
          recordIds,
          records,
          true, // alsoPublishToOutputDS
          false, // useGraphicsLayer - FALSE to prevent clearing/re-adding
          undefined, // graphicsLayer - don't pass it
          undefined // mapView - don't pass it
        )

        debugLogger.log('RESTORE', {
          event: 'panel-opened-restored-origin-ds',
          widgetId: this.widgetId,
          originDSId: originDS.id,
          recordCount: records.length,
          zoomExecuted: false
        })
      } catch (error) {
        debugLogger.log('RESTORE', {
          event: 'panel-opened-restore-origin-ds-failed',
          widgetId: this.widgetId,
          originDSId: originDS.id,
          error: error.message
        })
      }
    }
  }

  // r022.2: restoreLastSelection() method removed - dead code after r022.1 fix
  // r022.1 made accumulatedRecords the universal restoration source for ALL modes

  /**
   * Clears selection from the map when the widget panel closes.
   * 
   * This method:
   * 1. Clears graphics layer (if enabled)
   * 2. Groups accumulated records by origin DS (if they exist)
   * 3. Clears selection from each origin DS
   * 
   * r022.2: lastSelection fallback removed - accumulatedRecords is universal source
   * 
   * @param deps - Runtime dependencies (graphics layer, map view, config)
   */
  async clearSelectionFromMap(deps: RestorationDependencies): Promise<void> {
    const state = this.stateGetter()
    const { accumulatedRecords, resultsMode } = state

    debugLogger.log('RESTORE', {
      event: 'clearSelectionFromMap-called',
      widgetId: this.widgetId,
      resultsMode,
      hasAccumulatedRecords: !!(accumulatedRecords && accumulatedRecords.length > 0),
      accumulatedRecordsCount: accumulatedRecords?.length || 0,
      note: 'r022.2: lastSelection removed - using accumulatedRecords only'
    })

    // Always clear graphics layer first when panel closes
    if (deps.graphicsLayerRef.current) {
      deps.graphicsLayerManager.clearGraphics(this.widgetId, deps.config)
      debugLogger.log('RESTORE', {
        event: 'panel-closed-graphics-layer-cleared',
        widgetId: this.widgetId,
        graphicsLayerId: deps.graphicsLayerRef.current.id
      })
    }

    // r022.2: Always use accumulated records - single source of truth
    if (accumulatedRecords && accumulatedRecords.length > 0) {
      await this.clearAccumulatedRecords(accumulatedRecords, deps)
    } else {
      debugLogger.log('RESTORE', {
        event: 'clearSelectionFromMap-no-selection-to-clear',
        widgetId: this.widgetId,
        note: 'r022.2: No accumulated records to clear'
      })
    }
  }

  /**
   * Helper: Clear accumulated records (grouped by origin DS)
   */
  private async clearAccumulatedRecords(
    accumulatedRecords: Array<{ configId: string, record: any }>,
    deps: RestorationDependencies
  ): Promise<void> {
    // Lazy-load dependencies
    const { DataSourceManager } = await import('jimu-core')
    const { clearSelectionInDataSources } = await import('../selection-utils')

    const recordsByOriginDS = new Map<any, any[]>()
    const dsManager = DataSourceManager.getInstance()

    // Group records by origin DS (same logic as addSelectionToMap)
    accumulatedRecords.forEach((record, index) => {
      const recordId = record.getId()
      let originDS: any | null = null

      // Method 1: Try to get from record.getDataSource()
      const recordDS = record.getDataSource?.()
      if (recordDS) {
        originDS = recordDS.getOriginDataSources?.()?.[0] || recordDS

        debugLogger.log('RESTORE', {
          event: 'clear-found-origin-ds-from-record-ds',
          widgetId: this.widgetId,
          recordIndex: index,
          recordId,
          originDSId: originDS?.id || 'null'
        })
      }

      // Method 2: Search all data sources
      if (!originDS) {
        const dsMap = dsManager.getDataSources()
        const allDataSources = Object.values(dsMap)

        for (const ds of allDataSources) {
          if (ds && typeof (ds as any).getAllLoadedRecords === 'function') {
            try {
              const allRecords = (ds as any).getAllLoadedRecords() || []
              const matchingRecord = allRecords.find((r: any) => r.getId() === recordId)

              if (matchingRecord) {
                originDS = (ds as any).getOriginDataSources?.()?.[0] || ds

                debugLogger.log('RESTORE', {
                  event: 'clear-found-origin-ds-via-search',
                  widgetId: this.widgetId,
                  recordIndex: index,
                  recordId,
                  originDSId: originDS.id
                })
                break
              }
            } catch (error) {
              // Continue searching
            }
          }
        }
      }

      if (originDS) {
        if (!recordsByOriginDS.has(originDS)) {
          recordsByOriginDS.set(originDS, [])
        }
        recordsByOriginDS.get(originDS)!.push(record)
      }
    })

    debugLogger.log('RESTORE', {
      event: 'panel-closed-clearing-accumulated-records',
      widgetId: this.widgetId,
      accumulatedRecordsCount: accumulatedRecords.length,
      originDSCount: recordsByOriginDS.size
    })

    // Clear selection from each origin DS
    const graphicsLayer = deps.graphicsLayerRef.current || undefined

    for (const [originDS, records] of recordsByOriginDS.entries()) {
      try {
        // Use clearSelectionInDataSources to properly publish empty selection message
        // This clears the #data_s=... hash parameter
        await clearSelectionInDataSources(
          this.widgetId,
          originDS,
          true, // Always use graphics layer
          graphicsLayer
        )

        debugLogger.log('RESTORE', {
          event: 'panel-closed-cleared-origin-ds',
          widgetId: this.widgetId,
          originDSId: originDS.id,
          recordCount: records.length
        })
      } catch (error) {
        debugLogger.log('RESTORE', {
          event: 'panel-closed-clear-origin-ds-failed',
          widgetId: this.widgetId,
          originDSId: originDS.id,
          error: error.message
        })
      }
    }
  }

  // r022.2: clearLastSelection() method removed - dead code after r022.1 fix
  // r022.1 made accumulatedRecords the universal clearing source for ALL modes

  // ============================================================================
  // Section 3.3: Map Identify Restoration
  // ============================================================================
  // TODO: Implement handleRestoreOnIdentifyClose()
}
