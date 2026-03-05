/**
 * record-removal-handler.ts
 * Extracted from query-result.tsx (r024.131)
 *
 * Handles individual record removal from results — the "X button" flow.
 * Manages: hash cleanup, queryData update, origin DS deselection,
 * graphics removal, outputDS selection update, accumulatedRecords sync,
 * and composite-key matching for cross-query removal in accumulation modes.
 */

import {
  React,
  type DataSource,
  type DataRecord,
  type FeatureDataRecord,
  type FeatureLayerDataSource
} from 'jimu-core'
import { type SelectionType } from '../config'
import { removeRecordsFromOriginSelections } from './results-management-utils'
import { removeHighlightGraphics, getGraphicsCountFromLayer } from './graphics-layer-utils'
import { removeRecordIdFromHashParams, removeRecordIdFromDataS } from './hash-utils'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

// ─────────────────────────────────────────────────────────────
// Context interface — typed parameter object for all closure variables
// ─────────────────────────────────────────────────────────────

export interface RemoveRecordContext {
  // DataSource
  outputDS: DataSource

  // Props
  widgetId: string
  queryItemConfigId: string
  resultsMode: SelectionType
  records: DataRecord[]  // props.records — used in diagnostic logging

  // Map references
  mapView: __esri.MapView | __esri.SceneView
  graphicsLayer: __esri.GraphicsLayer | __esri.GroupLayer

  // Accumulated records
  accumulatedRecords: FeatureDataRecord[]
  onAccumulatedRecordsChange: (records: FeatureDataRecord[]) => void

  // Navigation
  onNavBack: (clearResults?: boolean) => Promise<void> | void

  // State
  expandAll: boolean
  queryData: any  // useState value — used only for diagnostic logging
  isRemovalInProgressRef: React.MutableRefObject<boolean>
  setQueryData: React.Dispatch<React.SetStateAction<any>>
}

// ─────────────────────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────────────────────

/**
 * Removes a record from the results and selection.
 * If removing the last record, automatically clears all results
 * by calling the trash can logic (same as clicking Clear button).
 * This ensures the UI doesn't show "Features displayed: 0 / 1" when all results are removed.
 *
 * @param ctx - Typed parameter object with all closure variables
 * @param data - The feature data record to remove
 */
export function executeRemoveRecord (ctx: RemoveRecordContext, data: FeatureDataRecord): void {
  const {
    outputDS, widgetId, queryItemConfigId, resultsMode, records,
    mapView, graphicsLayer, accumulatedRecords, onAccumulatedRecordsChange,
    onNavBack, expandAll, queryData, isRemovalInProgressRef, setQueryData
  } = ctx

  const dataId = data.getId()
  const currentExpandAll = expandAll

  // r021.98: Mark removal in progress to prevent useEffect from re-adding graphics
  isRemovalInProgressRef.current = true

  // r021.5 Chunk 2b: Close popup when removing individual record
  if (mapView?.popup?.visible) {
    mapView.popup.close()
    debugLogger.log('POPUP', {
      event: 'popup-closed-on-remove-record',
      widgetId,
      removedRecordId: dataId,
      reason: 'User removed individual record',
      timestamp: Date.now()
    })
  }

  debugLogger.log('EXPAND-COLLAPSE', {
    event: 'removeRecord-started',
    widgetId,
    removedRecordId: dataId,
    currentExpandAll,
    timestamp: Date.now()
  })

  // Surgically remove this record's ID from hash parameters (r018.84)
  removeRecordIdFromHashParams(dataId)
  removeRecordIdFromDataS(dataId, widgetId)

  // FIX (r018.96): Removed manual removal tracking - no longer needed
  debugLogger.log('RESULTS-MODE', {
    event: 'x-button-removal-updating-accumulated-records',
    widgetId,
    removedRecordId: dataId,
    note: 'r018.96: No manual removal tracking - duplicate detection handles this',
    timestamp: Date.now()
  })

  // r021.93: Capture queryConfigId BEFORE cleanup (needed for composite key matching)
  const capturedQueryConfigId = data.feature?.attributes?.__queryConfigId || ''

  // DIAGNOSTIC (r022.31): Cross-layer removal detection
  const currentQueryOriginDS = (outputDS as FeatureLayerDataSource)?.getOriginDataSources?.()?.[0] as FeatureLayerDataSource || outputDS as FeatureLayerDataSource
  const recordOriginDS = data.dataSource?.getRootDataSource() || data.dataSource

  debugLogger.log('RESULTS-MODE', {
    event: 'x-button-removal-origin-ds-detection',
    widgetId,
    removedRecordId: dataId,
    recordQueryConfigId: capturedQueryConfigId || 'MISSING',
    currentQueryConfigId: queryItemConfigId,
    isCrossLayerRemoval: !!capturedQueryConfigId && capturedQueryConfigId !== queryItemConfigId,
    recordOriginDSId: recordOriginDS?.id || 'unknown',
    recordOriginDSLabel: recordOriginDS?.getLabel?.() || 'unknown',
    currentQueryOriginDSId: currentQueryOriginDS?.id || 'unknown',
    currentQueryOriginDSLabel: currentQueryOriginDS?.getLabel?.() || 'unknown',
    isCrossOriginDSRemoval: recordOriginDS?.id !== currentQueryOriginDS?.id,
    accumulatedRecordsLayerCount: new Set(records?.map(r => (r as FeatureDataRecord).dataSource?.getRootDataSource()?.id)).size,
    allAccumulatedLayers: [...new Set(records?.map(r => (r as FeatureDataRecord).dataSource?.getRootDataSource()?.id))],
    timestamp: Date.now()
  })

  // r021.93: DELAY cleanup until AFTER graphics removal (so removeHighlightGraphics can use it)

  // FIX (r018.94): Removed removedRecordIds tracking - queryData now updated directly
  // Update queryData to filter out the removed record
  // r021.92: Check both recordId AND queryConfigId for accurate matching
  setQueryData(prevData => {
    if (!prevData) return prevData
    const filteredRecords = prevData.records.filter((record: DataRecord) => {
      const recordId = record.getId()
      const recordQueryConfigId = (record as FeatureDataRecord).feature?.attributes?.__queryConfigId || ''
      // Only remove if BOTH ID and queryConfigId match
      return !(recordId === dataId && recordQueryConfigId === capturedQueryConfigId)
    })

    debugLogger.log('RESULTS-MODE', {
      event: 'queryData-updated-after-removal',
      widgetId,
      removedRecordId: dataId,
      recordsCountBefore: prevData.records.length,
      recordsCountAfter: filteredRecords.length,
      timestamp: Date.now()
    })

    // FIX (r018.94): Check if this was the last record - if so, navigate back
    if (filteredRecords.length === 0 && prevData.records.length > 0) {
      debugLogger.log('RESULTS-MODE', {
        event: 'last-record-removed-navigating-back',
        widgetId,
        removedRecordId: dataId,
        timestamp: Date.now()
      })

      // r021.87: No cleanup needed - queryConfigId removed from individual record attributes
      // Note: currentQueryRecordIds is managed by parent, not cleaned here

      // Use setTimeout to avoid setState during render
      setTimeout(() => onNavBack(true), 0)
    }

    return {
      ...prevData,
      records: filteredRecords
    }
  })

  // FIX (r018.85): DIAGNOSTIC - Graphics count BEFORE removeRecordsFromOriginSelections
  const graphicsCountBeforeOriginRemoval = graphicsLayer?.graphics?.length || 0
  const graphicsIdsBeforeOriginRemoval = graphicsLayer?.graphics?.map(g => g.attributes?.recordId).slice(0, 10) || []

  debugLogger.log('RESULTS-MODE', {
    event: 'x-button-removal-BEFORE-removeRecordsFromOriginSelections',
    widgetId,
    removedRecordId: dataId,
    graphicsCountBefore: graphicsCountBeforeOriginRemoval,
    graphicsIdsBefore: graphicsIdsBeforeOriginRemoval,
    willPassGraphicsLayer: false, // FIX: Changed to false to prevent graphics manipulation here
    timestamp: Date.now()
  })

  // ALWAYS remove from origin data source selections (same as Remove mode)
  // This properly removes records from the map selection, handling single or multiple origin sources
  // FIX (r018.85): DON'T pass graphics layer parameters here - let graphics be managed by selection sync
  // The previous behavior (passing graphicsLayer) was causing the count to jump from 124 to 136
  // because graphics were being removed here, then re-added during selection synchronization
  // r022.73: Pass accumulated records so removal can look up __queryConfigId for composite keys
  removeRecordsFromOriginSelections(
    widgetId,
    [data],
    outputDS as FeatureLayerDataSource,
    undefined, // useGraphicsLayer
    undefined, // graphicsLayer
    accumulatedRecords // r022.73: Pass for queryConfigId lookup
  )

  // FIX (r018.85): DIAGNOSTIC - Graphics count AFTER removeRecordsFromOriginSelections
  const graphicsCountAfterOriginRemoval = graphicsLayer?.graphics?.length || 0
  const graphicsIdsAfterOriginRemoval = graphicsLayer?.graphics?.map(g => g.attributes?.recordId).slice(0, 10) || []

  debugLogger.log('RESULTS-MODE', {
    event: 'x-button-removal-AFTER-removeRecordsFromOriginSelections',
    widgetId,
    removedRecordId: dataId,
    graphicsCountBefore: graphicsCountBeforeOriginRemoval,
    graphicsCountAfter: graphicsCountAfterOriginRemoval,
    graphicsIdsAfter: graphicsIdsAfterOriginRemoval,
    graphicsChanged: graphicsCountAfterOriginRemoval !== graphicsCountBeforeOriginRemoval,
    graphicsChangedBy: graphicsCountAfterOriginRemoval - graphicsCountBeforeOriginRemoval,
    expected: 'Graphics should NOT change here (no graphics layer params passed)',
    timestamp: Date.now()
  })

  // DIAGNOSTIC (r022.31): Aggregate selection state across all layers after removal
  // Use setTimeout to allow all DS updates to complete
  setTimeout(() => {
    const layerSelectionStates: Record<string, any> = {}

    // Get unique origin DSs from all accumulated records
    const uniqueOriginDSIds = new Set(
      records?.map(r => (r as FeatureDataRecord).dataSource?.getRootDataSource()?.id).filter(Boolean)
    )

    uniqueOriginDSIds.forEach(dsId => {
      try {
        const ds = (window as any).jimuConfig?.appConfig?.dataSources?.[dsId]
        if (ds && typeof ds.getSelectedRecords === 'function') {
          const selected = ds.getSelectedRecords() || []
          const selectedIds = ds.getSelectedRecordIds() || []
          layerSelectionStates[dsId] = {
            label: ds.getLabel?.() || 'unknown',
            count: selected.length,
            ids: selectedIds.slice(0, 10)
          }
        }
      } catch (err) {
        layerSelectionStates[dsId] = { error: err.message }
      }
    })

    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-aggregate-selection-state',
      widgetId,
      removedRecordId: dataId,
      timing: 'after-removal-100ms',
      accumulatedRecordsCount: records?.length || 0,
      uniqueLayersInAccumulated: uniqueOriginDSIds.size,
      layerSelectionStates,
      outputDSId: outputDS?.id,
      outputDSSelectedCount: outputDS?.getSelectedRecords()?.length || 0,
      graphicsLayerCount: graphicsCountAfterOriginRemoval,
      expectedLayerWithRemoval: data.dataSource?.getRootDataSource()?.id || 'unknown',
      note: 'Checking if selection was cleared in correct origin layer',
      timestamp: Date.now()
    })
  }, 100)

  // FIX (r018.91): DIAGNOSTIC - Check why manual graphics removal condition isn't met
  debugLogger.log('RESULTS-MODE', {
    event: 'x-button-removal-checking-manual-graphics-removal-condition',
    widgetId,
    removedRecordId: dataId,
    hasGraphicsLayer: !!graphicsLayer,
    graphicsLayerId: graphicsLayer?.id,
    graphicsLayerGraphicsCount: graphicsLayer?.graphics?.length || 0,
    conditionWillPass: !!graphicsLayer,
    timestamp: Date.now()
  })

  // FIX (r018.90): Manually remove graphics from layer after removeRecordsFromOriginSelections
  // Since we don't pass graphics layer params to removeRecordsFromOriginSelections (to avoid
  // the 136 duplicate issue), we need to manually remove the graphic here
  // This is safe now because r018.89 fixed the query switch re-selection issue
  // r021.91: Pass data record for composite key matching
  if (graphicsLayer) {
    const graphicsCountBeforeManualRemoval = getGraphicsCountFromLayer(graphicsLayer)

    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-manual-graphics-sync-start',
      widgetId,
      removedRecordId: dataId,
      graphicsCountBefore: graphicsCountBeforeManualRemoval,
      timestamp: Date.now()
    })

    removeHighlightGraphics(graphicsLayer, [dataId], [data])

    const graphicsCountAfterManualRemoval = getGraphicsCountFromLayer(graphicsLayer)

    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-manual-graphics-sync-complete',
      widgetId,
      removedRecordId: dataId,
      graphicsCountBefore: graphicsCountBeforeManualRemoval,
      graphicsCountAfter: graphicsCountAfterManualRemoval,
      graphicsRemoved: graphicsCountBeforeManualRemoval - graphicsCountAfterManualRemoval,
      expectedRemoved: 1,
      removalMatches: (graphicsCountBeforeManualRemoval - graphicsCountAfterManualRemoval) === 1,
      timestamp: Date.now()
    })
  } else {
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-manual-graphics-removal-SKIPPED',
      widgetId,
      removedRecordId: dataId,
      reason: 'graphicsLayer is null/undefined',
      hasGraphicsLayer: false,
      timestamp: Date.now()
    })
  }

  // r021.93: NOW cleanup queryConfigId from record (AFTER graphics removal used it)
  if (data.feature?.attributes?.__queryConfigId) {
    delete data.feature.attributes.__queryConfigId
    debugLogger.log('RESULTS-MODE', {
      event: 'queryConfigId-cleaned-up-on-remove',
      widgetId,
      removedRecordId: dataId,
      capturedQueryConfigId: capturedQueryConfigId,
      cleanedAfterGraphicsRemoval: true,
      timestamp: Date.now()
    })
  }

  // DIAGNOSTIC LOGGING: Full state BEFORE removal
  const outputDSSelectedBefore = outputDS.getSelectedRecords() as FeatureDataRecord[] || []
  const outputDSSelectedIdsBefore = outputDSSelectedBefore.map(r => r.getId())
  const accumulatedRecordsIdsBefore = accumulatedRecords?.map(r => r.getId()) || []

  // FIX (r018.81): Detailed graphics attribute inspection to understand why IDs are null
  const graphicsLayerIdsBefore: (string | null)[] = []
  const firstFewGraphicsAttrs: any[] = []
  graphicsLayer?.graphics?.forEach((g, index) => {
    if (index < 3) {
      // Log first 3 graphics' full attributes for diagnosis
      firstFewGraphicsAttrs.push({
        index,
        hasAttributes: !!g.attributes,
        attributes: g.attributes,
        attributeKeys: g.attributes ? Object.keys(g.attributes) : []
      })
    }
    graphicsLayerIdsBefore.push(g.attributes?.recordId || null)
  })

  debugLogger.log('RESULTS-MODE', {
    event: 'x-button-removal-before-state',
    widgetId,
    removedRecordId: dataId,
    outputDSSelectedCount: outputDSSelectedBefore.length,
    outputDSSelectedIds: outputDSSelectedIdsBefore,
    accumulatedRecordsCount: accumulatedRecords?.length || 0,
    accumulatedRecordsIds: accumulatedRecordsIdsBefore,
    graphicsLayerCount: graphicsLayer?.graphics?.length || 0,
    graphicsLayerIds: graphicsLayerIdsBefore.slice(0, 110),
    firstFewGraphicsAttrs, // NEW: inspect what attributes are actually there
    allSourcesMatch: outputDSSelectedIdsBefore.length === accumulatedRecordsIdsBefore.length &&
                     outputDSSelectedIdsBefore.length === graphicsLayerIdsBefore.length &&
                     JSON.stringify(outputDSSelectedIdsBefore.sort()) === JSON.stringify(accumulatedRecordsIdsBefore.sort()),
    timestamp: Date.now()
  })

  // Update outputDS selection
  // r023.14: Use flexible matching (same pattern as accumulatedRecords filter at line ~1569)
  // Previous logic (r021.92) required BOTH recordId AND __queryConfigId to match, but
  // cross-query records placed in the output DS via the reselection block may not have
  // __queryConfigId accessible via getSelectedRecords(). This caused zombie records:
  // X-button removal updated accumulatedRecords but not the output DS, and on mode switch
  // to New, handleDataSourceInfoChange repopulated from the stale output DS.
  const selectedDatas = outputDS.getSelectedRecords() ?? []
  const updatedSelectedDatas = selectedDatas.filter(record => {
    const recordId = record.getId()
    if (recordId !== dataId) {
      return true // Keep - different record ID
    }
    // Record IDs match - check if we need composite key matching
    const recordQueryConfigId = (record as FeatureDataRecord).feature?.attributes?.__queryConfigId || ''
    if (capturedQueryConfigId && recordQueryConfigId) {
      return recordQueryConfigId !== capturedQueryConfigId // Keep if queryConfigIds differ
    }
    return false // Remove - recordIds match and no queryConfigId disambiguation needed
  })
  const recordIds = updatedSelectedDatas.map(record => record.getId())

  // DEBUG: Log state after removal
  debugLogger.log('RESULTS-MODE', {
    event: 'removeRecord-state-after-removal',
    widgetId,
    removedRecordId: dataId,
    outputDSSelectedBeforeRemoval: selectedDatas.length,
    outputDSSelectedAfterRemoval: updatedSelectedDatas.length,
    recordsPropCount: records?.length || 0,
    queryDataRecordsCount: queryData?.records?.length || 0,
    accumulatedRecordsCount: accumulatedRecords?.length || 0,
    resultsMode,
    note: 'r018.94: Records stay in sync - no removedRecordIds tracking',
    timestamp: Date.now()
  })

  // Update outputDS selection
  if (typeof outputDS.selectRecordsByIds === 'function') {
    outputDS.selectRecordsByIds(recordIds, updatedSelectedDatas as FeatureDataRecord[])
  }

  // IMPORTANT: Publish custom event so widget can update state
  // This ensures restoration restores the correct (updated) count
  // r021.110: lastSelection removed, now only updates accumulatedRecords
  const originDS = (outputDS as FeatureLayerDataSource).getOriginDataSources()?.[0] as FeatureLayerDataSource
  const dataSourceId = originDS?.id
  const selectionEvent = new CustomEvent('querysimple-selection-changed', {
    detail: {
      widgetId,
      recordIds, // Updated record IDs (with removed record excluded)
      dataSourceId,
      outputDsId: outputDS.id,
      queryItemConfigId
    },
    bubbles: true,
    cancelable: true
  })
  window.dispatchEvent(selectionEvent)

  // DIAGNOSTIC LOGGING: Full state AFTER removal (before sync)
  const outputDSSelectedAfter = outputDS.getSelectedRecords() as FeatureDataRecord[] || []
  const outputDSSelectedIdsAfter = outputDSSelectedAfter.map(r => r.getId())

  // FIX (r018.81): Detailed graphics attribute inspection to understand why IDs are null
  const graphicsLayerIdsAfter: (string | null)[] = []
  const firstFewGraphicsAttrsAfter: any[] = []
  graphicsLayer?.graphics?.forEach((g, index) => {
    if (index < 3) {
      // Log first 3 graphics' full attributes for diagnosis
      firstFewGraphicsAttrsAfter.push({
        index,
        hasAttributes: !!g.attributes,
        attributes: g.attributes,
        attributeKeys: g.attributes ? Object.keys(g.attributes) : []
      })
    }
    graphicsLayerIdsAfter.push(g.attributes?.recordId || null)
  })

  debugLogger.log('RESULTS-MODE', {
    event: 'x-button-removal-after-state-before-sync',
    widgetId,
    removedRecordId: dataId,
    outputDSSelectedCount: outputDSSelectedAfter.length,
    outputDSSelectedIds: outputDSSelectedIdsAfter,
    graphicsLayerCount: graphicsLayer?.graphics?.length || 0,
    graphicsLayerIds: graphicsLayerIdsAfter.slice(0, 110),
    firstFewGraphicsAttrsAfter, // NEW: inspect what attributes are actually there
    removedFromOutputDS: outputDSSelectedIdsAfter.length < outputDSSelectedIdsBefore.length,
    removedFromGraphics: graphicsLayerIdsAfter.length < graphicsLayerIdsBefore.length,
    timestamp: Date.now()
  })

  // FIX (r021.97): Direct filter of accumulatedRecords - no outputDS read
  // The previous approach (r018.97) read from outputDS.getSelectedRecords() after selectRecordsByIds(),
  // but selectRecordsByIds() is async, so getSelectedRecords() returned stale data (race condition).
  // This caused the two-click removal bug: first click updated queryData correctly, but stale
  // accumulatedRecords caused the useEffect to overwrite queryData back to the old count.
  // FIX: Directly filter accumulatedRecords by the known record being removed - no async dependency.
  if (onAccumulatedRecordsChange && accumulatedRecords && accumulatedRecords.length > 0) {
    // Direct filter: remove the specific record we know is being deleted
    // r021.97: Use flexible matching - composite key when both have queryConfigId, otherwise just recordId
    // In New mode, __queryConfigId may not be consistently set on accumulatedRecords vs the clicked record
    const syncedRecords = accumulatedRecords.filter(record => {
      const recordId = record.getId()
      if (recordId !== dataId) {
        return true // Keep - different record ID
      }
      // Record IDs match - check if we need composite key matching
      const recordQueryConfigId = record.feature?.attributes?.__queryConfigId || ''
      // If BOTH have queryConfigId values, require both to match (accumulation mode safety)
      // If EITHER is empty, just matching recordId is sufficient (New mode compatibility)
      if (capturedQueryConfigId && recordQueryConfigId) {
        return recordQueryConfigId !== capturedQueryConfigId // Keep if queryConfigIds differ
      }
      return false // Remove - recordIds match and no queryConfigId disambiguation needed
    })

    // Update accumulatedRecords with the filtered result
    onAccumulatedRecordsChange(syncedRecords)
  }

  // FIX (r018.96): Removed manual modification flag - no longer needed
  debugLogger.log('RESULTS-MODE', {
    event: 'x-button-removal-complete',
    widgetId,
    removedRecordId: dataId,
    note: 'r018.96: No manual removal tracking needed',
    timestamp: Date.now()
  })

  // FIX (r018.85): FINAL DIAGNOSTIC - Graphics count after entire removal flow
  // This happens AFTER all sync logic, so we can see the final state
  setTimeout(() => {
    const finalGraphicsCount = graphicsLayer?.graphics?.length || 0
    const finalGraphicsIds = graphicsLayer?.graphics?.map(g => g.attributes?.recordId) || []
    const finalGraphicsIdsSample = finalGraphicsIds.slice(0, 10)

    // Count duplicates in final graphics
    const graphicsIdCounts = new Map<string, number>()
    finalGraphicsIds.forEach(id => {
      if (id) {
        graphicsIdCounts.set(id, (graphicsIdCounts.get(id) || 0) + 1)
      }
    })
    const duplicateIds = Array.from(graphicsIdCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([id, count]) => ({ id, count }))

    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-FINAL-graphics-state',
      widgetId,
      removedRecordId: dataId,
      graphicsCountBeforeEntireFlow: graphicsCountBeforeOriginRemoval,
      graphicsCountAfterEntireFlow: finalGraphicsCount,
      graphicsIdsSample: finalGraphicsIdsSample,
      graphicsChanged: finalGraphicsCount !== graphicsCountBeforeOriginRemoval,
      graphicsChangedBy: finalGraphicsCount - graphicsCountBeforeOriginRemoval,
      expectedChange: -1, // Should remove 1 graphic
      actualChange: finalGraphicsCount - graphicsCountBeforeOriginRemoval,
      changeMatches: (finalGraphicsCount - graphicsCountBeforeOriginRemoval) === -1,
      duplicateGraphicsDetected: duplicateIds.length > 0,
      duplicateGraphics: duplicateIds.slice(0, 5),
      totalDuplicates: duplicateIds.reduce((sum, { count }) => sum + (count - 1), 0),
      note: 'Final state after all removal and sync logic completes',
      timestamp: Date.now()
    })
  }, 100) // Small delay to ensure all async operations complete

  // Note: Hash parameters are preserved but hash-triggered queries are blocked
  // when manual modifications exist (handled in widget's handleOpenWidgetEvent)

  // Log after removeRecord completes to check if expandAll changed
  setTimeout(() => {
    debugLogger.log('RESULTS-MODE', {
      event: 'removeRecord-completed',
      widgetId,
      removedRecordId: dataId,
      expandAllBefore: currentExpandAll,
      expandAllAfter: expandAll,
      expandAllChanged: currentExpandAll !== expandAll,
      expandByDefaultProp: expandAll, // What will be passed to SimpleList
      timestamp: Date.now()
    })
  }, 0)
}
