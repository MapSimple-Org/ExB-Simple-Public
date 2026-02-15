/**
 * Utility functions for managing results accumulation in QuerySimple widget.
 * Handles "Add to" and "Remove from" modes for accumulating query results.
 */

import type { FeatureLayerDataSource, FeatureDataRecord, DataRecord } from 'jimu-core'
import { DataSourceManager, DataSourceStatus, MessageManager, DataRecordSetChangeMessage, RecordSetChangeType, DataRecordsSelectionChangeMessage } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import { removeHighlightGraphics, getGraphicsCountFromLayer, forEachGraphicInLayer } from './graphics-layer-utils'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Generates a composite key for a record that includes both origin data source ID and objectId.
 * This ensures uniqueness across different layers that may have the same objectId.
 * 
 * @param record - The feature data record
 * @param outputDS - The output data source containing the record
 * @returns Composite key string: `${originDSId}_${objectId}`
 */
export function getRecordKey(
  record: FeatureDataRecord,
  outputDS: FeatureLayerDataSource
): string {
  const originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource
  const originDSId = originDS?.id || outputDS.id // Fallback to outputDS if no origin
  const objectId = record.getId()
  const key = `${originDSId}_${objectId}`
  
  debugLogger.log('RESULTS-MODE', {
    event: 'record-key-generated',
    originDSId,
    objectId,
    key,
    hasOriginDS: !!originDS
  })
  
  return key
}

/**
 * Creates an accumulated results data source for storing merged query results.
 * This data source is widget-level and persists across multiple queries.
 * 
 * @param widgetId - The widget ID
 * @param originDS - The origin data source to use as the base
 * @returns The created accumulated results data source
 */
export async function createAccumulatedResultsDataSource(
  widgetId: string,
  originDS: FeatureLayerDataSource
): Promise<FeatureLayerDataSource> {
  const accumulatedDSId = `${widgetId}_accumulated_results`
  
  debugLogger.log('RESULTS-MODE', {
    event: 'creating-accumulated-ds',
    widgetId,
    accumulatedDSId,
    originDSId: originDS.id
  })
  
  // Check if data source already exists
  const dsManager = DataSourceManager.getInstance()
  let accumulatedDS = dsManager.getDataSource(accumulatedDSId) as FeatureLayerDataSource
  
  if (accumulatedDS) {
    debugLogger.log('RESULTS-MODE', {
      event: 'accumulated-ds-already-exists',
      accumulatedDSId
    })
    return accumulatedDS
  }
  
  // Get origin data source JSON to create output data source
  const originDataSourceJson = originDS.getDataSourceJson()
  
  // Create output data source JSON similar to how query items create output DS
  const outputDataSourceJson = {
    id: accumulatedDSId,
    label: 'Accumulated Results',
    type: originDataSourceJson?.type,
    geometryType: originDataSourceJson?.geometryType,
    url: originDataSourceJson?.url,
    itemId: originDataSourceJson?.itemId,
    portalUrl: originDataSourceJson?.portalUrl,
    originDataSources: [{
      dataSourceId: originDS.id,
      mainDataSourceId: originDS.id,
      rootDataSourceId: originDS.id
    }],
    layerId: originDataSourceJson?.layerId,
    isDataInDataSourceInstance: originDataSourceJson?.isDataInDataSourceInstance,
    isOutputFromWidget: true
  }
  
  // Create the data source using DataSourceManager
  // Note: This follows the pattern from setting.tsx for creating output data sources
  accumulatedDS = dsManager.createDataSourceByDataSourceJson(outputDataSourceJson) as FeatureLayerDataSource
  
  // Set initial status
  accumulatedDS.setStatus(DataSourceStatus.NotReady)
  accumulatedDS.setCountStatus(DataSourceStatus.NotReady)
  
  debugLogger.log('RESULTS-MODE', {
    event: 'accumulated-ds-created',
    accumulatedDSId,
    originDSId: originDS.id,
    status: accumulatedDS.getStatus()
  })
  
  return accumulatedDS
}

/**
 * Merges new query results with existing records.
 * Deduplicates records using composite keys (originDSId_objectId).
 * 
 * r021.87: Read __queryConfigId from record attributes (stamped when added)
 * to get each record's original datasource for accurate deduplication.
 * Without this, records with same ID from different datasources
 * (e.g., Trail "2" and Arlington "2") are incorrectly treated as duplicates.
 * 
 * This function merges new records with existing records that were captured
 * before the query executed. The caller is responsible for storing the merged
 * records (typically in recordsRef or state).
 * 
 * @param outputDS - The output data source for NEW records
 * @param newRecords - New records to merge in
 * @param existingRecords - Existing records captured before query execution (optional, defaults to empty array)
 * @param queries - Array of query configs to look up originDS by __queryConfigId (optional)
 * @returns Object with mergedRecords, addedRecordIds, and duplicateRecordIds
 */
export function mergeResultsIntoAccumulated(
  outputDS: FeatureLayerDataSource,
  newRecords: FeatureDataRecord[],
  existingRecords: FeatureDataRecord[] = [],
  queries?: Array<any>
): { mergedRecords: FeatureDataRecord[]; addedRecordIds: string[]; duplicateRecordIds: string[] } {
  debugLogger.log('RESULTS-MODE', {
    event: 'merging-results-start',
    outputDSId: outputDS.id,
    existingRecordsCount: existingRecords.length,
    newRecordsCount: newRecords.length,
    hasQueries: !!queries,
    queriesCount: queries?.length || 0
  })
  
  // r021.82: Build Set of existing record keys using EACH RECORD'S ORIGINAL DATASOURCE
  const existingKeys = new Set<string>()
  const dsManager = DataSourceManager.getInstance()
  
  existingRecords.forEach(record => {
    const recordId = record.getId()
    
    // r021.87: Read queryConfigId from record attributes (stamped when added)
    const recordQueryConfigId = (record as any).feature?.attributes?.__queryConfigId
    let useDataSource: any = null
    
    if (recordQueryConfigId && queries) {
      const queryConfig = queries.find(q => q.configId === recordQueryConfigId)
      useDataSource = queryConfig?.useDataSource
      
      // r021.83: Extract dataSourceId STRING from useDataSource object
      const dataSourceId = typeof useDataSource === 'string' 
        ? useDataSource 
        : useDataSource?.dataSourceId
      
      debugLogger.log('RESULTS-MODE', {
        event: 'building-existing-key-with-map',
        recordId,
        hasQueryConfig: !!queryConfig,
        dataSourceId: dataSourceId || 'missing',
        queryConfigId: queryConfig?.configId || 'missing'
      })
      
      if (dataSourceId) {
        const recordDS = dsManager.getDataSource(dataSourceId) as FeatureLayerDataSource
        if (recordDS) {
          const key = getRecordKey(record, recordDS)
          existingKeys.add(key)
          debugLogger.log('RESULTS-MODE', {
            event: 'existing-key-used-record-ds',
            recordId,
            dataSourceId,
            key
          })
          return
        } else {
          debugLogger.log('RESULTS-MODE', {
            event: 'existing-key-ds-lookup-failed',
            recordId,
            dataSourceId,
            note: 'DataSource not found in DataSourceManager - using fallback'
          })
        }
      }
    }
    
    // Fallback: use outputDS (may cause false duplicates)
    const key = getRecordKey(record, outputDS)
    existingKeys.add(key)
    debugLogger.log('RESULTS-MODE', {
      event: 'existing-key-used-fallback-outputds',
      recordId,
      outputDSId: outputDS.id,
      key,
      reason: queries ? 'config-lookup-failed' : 'no-queries-provided'
    })
  })
  
  debugLogger.log('RESULTS-MODE', {
    event: 'existing-records-check',
    existingRecordsCount: existingRecords.length,
    existingKeysCount: existingKeys.size,
    hasQueries: !!queries
  })
  
  // r021.84: Filter new records and track which were added vs duplicates
  const uniqueNewRecords: FeatureDataRecord[] = []
  const addedRecordIds: string[] = []
  const duplicateRecordIds: string[] = []
  
  newRecords.forEach(record => {
    const key = getRecordKey(record, outputDS)
    const isDuplicate = existingKeys.has(key)
    
    if (isDuplicate) {
      duplicateRecordIds.push(record.getId())
      debugLogger.log('RESULTS-MODE', {
        event: 'duplicate-record-skipped',
        key,
        objectId: record.getId()
      })
    } else {
      uniqueNewRecords.push(record)
      addedRecordIds.push(record.getId())
    }
  })
  
  debugLogger.log('RESULTS-MODE', {
    event: 'deduplication-complete',
    newRecordsCount: newRecords.length,
    uniqueNewRecordsCount: uniqueNewRecords.length,
    duplicatesSkipped: duplicateRecordIds.length
  })
  
  // Merge records
  const mergedRecords = [...existingRecords, ...uniqueNewRecords]
  
  debugLogger.log('RESULTS-MODE', {
    event: 'merge-complete',
    totalRecordsAfterMerge: mergedRecords.length,
    existingCount: existingRecords.length,
    newUniqueCount: uniqueNewRecords.length
  })
  
  return {
    mergedRecords,
    addedRecordIds,
    duplicateRecordIds
  }
}

/**
 * Removes matching records from widget-level accumulated records.
 * Matches records using composite keys (originDSId_objectId).
 * 
 * This function removes records from existing accumulated records that were captured
 * before the query executed. The caller is responsible for storing the remaining
 * records (typically in recordsRef or state).
 * 
 * @param outputDS - The output data source (used for key generation)
 * @param recordsToRemove - Records to remove (from query results)
 * @param existingAccumulatedRecords - Existing accumulated records captured before query execution (optional, defaults to empty array)
 * @returns Array of remaining records after removal
 */
export function removeResultsFromAccumulated(
  outputDS: FeatureLayerDataSource,
  recordsToRemove: FeatureDataRecord[],
  existingAccumulatedRecords: FeatureDataRecord[] = []
): FeatureDataRecord[] {
  debugLogger.log('RESULTS-MODE', {
    event: 'removing-results-start',
    outputDSId: outputDS.id,
    recordsToRemoveCount: recordsToRemove.length,
    existingAccumulatedRecordsCount: existingAccumulatedRecords.length
  })
  
  // If no accumulated records, nothing to remove
  if (existingAccumulatedRecords.length === 0) {
    debugLogger.log('RESULTS-MODE', {
      event: 'no-accumulated-records-to-remove',
      outputDSId: outputDS.id
    })
    return []
  }
  
  // If no records to remove, return existing records unchanged
  if (recordsToRemove.length === 0) {
    debugLogger.log('RESULTS-MODE', {
      event: 'no-records-to-remove',
      outputDSId: outputDS.id,
      existingAccumulatedRecordsCount: existingAccumulatedRecords.length
    })
    return existingAccumulatedRecords
  }
  
  // Build Set of keys to remove for fast lookup
  const removeKeys = new Set(
    recordsToRemove.map(record => getRecordKey(record, outputDS))
  )
  
  debugLogger.log('RESULTS-MODE', {
    event: 'remove-keys-built',
    existingAccumulatedRecordsCount: existingAccumulatedRecords.length,
    removeKeysCount: removeKeys.size
  })
  
  // Filter out records that match keys to remove
  const remainingRecords: FeatureDataRecord[] = []
  const removedRecords: FeatureDataRecord[] = []
  
  existingAccumulatedRecords.forEach(record => {
    const key = getRecordKey(record, outputDS)
    const shouldRemove = removeKeys.has(key)
    
    if (shouldRemove) {
      removedRecords.push(record)
      debugLogger.log('RESULTS-MODE', {
        event: 'record-marked-for-removal',
        key,
        objectId: record.getId(),
        originDSId: (record.getDataSource?.() as FeatureLayerDataSource)?.getOriginDataSources()?.[0]?.id || 'unknown'
      })
    } else {
      remainingRecords.push(record)
    }
  })
  
  debugLogger.log('RESULTS-MODE', {
    event: 'removal-complete',
    recordsRemoved: removedRecords.length,
    remainingRecordsCount: remainingRecords.length,
    recordsToRemoveCount: recordsToRemove.length,
    matchedRecordsCount: removedRecords.length,
    unmatchedRecordsCount: recordsToRemove.length - removedRecords.length
  })
  
  return remainingRecords
}

/**
 * Removes records from origin data source selections.
 * Groups records by their origin data source and updates each origin DS's selection separately.
 * This ensures map selection is updated correctly when records come from multiple origin layers.
 * Also removes graphics from graphics layer if using graphics layer highlighting.
 * 
 * r023.30: Uses __originDSId attribute on records to look up origin DS via DataSourceManager.
 * This enables correct removal for cross-layer accumulated results where records come from
 * different origin data sources. Falls back to .dataSource property then outputDS origin.
 * 
 * r023.28: Falls back to simple recordId matching if composite key matching fails.
 * This handles cases where origin DS records don't have __queryConfigId (e.g., "Select on Map").
 * 
 * @param widgetId - The widget ID for publishing messages
 * @param recordsToRemove - Records to remove from selection (should have __originDSId attribute)
 * @param outputDS - The output data source (fallback for origin DS lookup)
 * @param useGraphicsLayer - Whether to remove graphics from graphics layer (default: false)
 * @param graphicsLayer - Graphics layer instance (required if useGraphicsLayer is true)
 * @param accumulatedRecords - Accumulated records with __queryConfigId (for composite key lookup)
 */
export function removeRecordsFromOriginSelections(
  widgetId: string,
  recordsToRemove: FeatureDataRecord[],
  outputDS: FeatureLayerDataSource,
  useGraphicsLayer?: boolean,
  graphicsLayer?: __esri.GraphicsLayer | __esri.GroupLayer,
  accumulatedRecords?: FeatureDataRecord[]
): void {
  debugLogger.log('RESULTS-MODE', {
    event: 'removing-records-from-origin-selections-start',
    widgetId,
    recordsToRemoveCount: recordsToRemove.length,
    outputDSId: outputDS.id,
    useGraphicsLayer: !!useGraphicsLayer,
    hasGraphicsLayer: !!graphicsLayer
  })
  
  if (recordsToRemove.length === 0) {
    debugLogger.log('RESULTS-MODE', {
      event: 'no-records-to-remove-from-selection',
      widgetId
    })
    return
  }
  
  // Remove from graphics layer if using graphics layer highlighting
  if (useGraphicsLayer && graphicsLayer) {
    const recordIdsToRemove = recordsToRemove.map(record => record.getId())
    
    // FIX (r018.82): Capture TRUE "before" state BEFORE removing graphics
    const graphicsBeforeRemoval: (string | null)[] = []
    const firstFewGraphicsAttrs: any[] = []
    let index = 0
    forEachGraphicInLayer(graphicsLayer, (g) => {
      if (index < 3) {
        firstFewGraphicsAttrs.push({
          index,
          hasAttributes: !!g.attributes,
          attributes: g.attributes,
          attributeKeys: g.attributes ? Object.keys(g.attributes) : []
        })
      }
      graphicsBeforeRemoval.push(g.attributes?.recordId || null)
      index++
    })
    
    debugLogger.log('RESULTS-MODE', {
      event: 'removing-graphics-TRUE-BEFORE-state',
      widgetId,
      recordIdsToRemove,
      graphicsLayerCountBefore: getGraphicsCountFromLayer(graphicsLayer),
      graphicsLayerIdsBefore: graphicsBeforeRemoval.slice(0, 110),
      firstFewGraphicsAttrs,
      timestamp: Date.now()
    })
    
    // r021.90: Pass records to removeHighlightGraphics for composite key matching
    removeHighlightGraphics(graphicsLayer, recordIdsToRemove, recordsToRemove as FeatureDataRecord[])
    
    // FIX (r018.82): Capture TRUE "after" state AFTER removing graphics
    const graphicsAfterRemoval: (string | null)[] = []
    forEachGraphicInLayer(graphicsLayer, (g) => {
      graphicsAfterRemoval.push(g.attributes?.recordId || null)
    })
    
    debugLogger.log('RESULTS-MODE', {
      event: 'removing-graphics-TRUE-AFTER-state',
      widgetId,
      graphicsLayerCountAfter: getGraphicsCountFromLayer(graphicsLayer),
      graphicsLayerIdsAfter: graphicsAfterRemoval.slice(0, 110),
      actuallyRemoved: graphicsBeforeRemoval.length - graphicsAfterRemoval.length,
      expectedToRemove: recordIdsToRemove.length,
      removalMatches: (graphicsBeforeRemoval.length - graphicsAfterRemoval.length) === recordIdsToRemove.length,
      timestamp: Date.now()
    })
  }
  
  // Group records by their origin data source
  const recordsByOriginDS = new Map<FeatureLayerDataSource, FeatureDataRecord[]>()
  
  recordsToRemove.forEach((record, recordIndex) => {
    const recordQueryConfigId = record.feature?.attributes?.__queryConfigId || ''
    // r023.30: Use __originDSId attribute for cross-layer support
    const recordOriginDSId = record.feature?.attributes?.__originDSId || ''
    
    // DIAGNOSTIC: Log the origin DS lookup process
    debugLogger.log('RESULTS-MODE', {
      event: 'x-button-removal-record-origin-ds-lookup-start',
      widgetId,
      recordIndex,
      recordId: record.getId(),
      recordQueryConfigId: recordQueryConfigId || 'MISSING',
      recordOriginDSId: recordOriginDSId || 'MISSING',
      outputDSId: outputDS.id,
      lookupMethod: 'originDSId-attribute',
      note: 'r023.30: Using __originDSId attribute for cross-layer removal',
      timestamp: Date.now()
    })
    
    let originDS: FeatureLayerDataSource | null = null
    let lookupMethod = 'unknown'
    
    // r023.30: Primary lookup via __originDSId attribute (supports cross-layer)
    if (recordOriginDSId) {
      const dsManager = DataSourceManager.getInstance()
      originDS = dsManager.getDataSource(recordOriginDSId) as FeatureLayerDataSource || null
      lookupMethod = originDS ? 'originDSId-attribute-lookup' : 'originDSId-attribute-lookup-failed'
      
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removal-origin-ds-from-attribute',
        widgetId,
        recordIndex,
        recordId: record.getId(),
        recordOriginDSId,
        originDSFound: !!originDS,
        originDSId: originDS?.id || 'null',
        originDSLabel: originDS?.getLabel?.() || 'null',
        lookupMethod,
        timestamp: Date.now()
      })
    }
    
    // Fallback: try .dataSource property (legacy support)
    if (!originDS) {
      const recordDS = (record as any).dataSource as FeatureLayerDataSource
      if (recordDS) {
        originDS = recordDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || recordDS
        lookupMethod = 'dataSource-property-fallback'
        
        debugLogger.log('RESULTS-MODE', {
          event: 'x-button-removal-origin-ds-from-recordDS-fallback',
          widgetId,
          recordIndex,
          recordId: record.getId(),
          recordDSId: recordDS.id,
          originDSId: originDS?.id || 'null',
          lookupMethod,
          timestamp: Date.now()
        })
      }
    }
    
    // Final fallback: use outputDS origin (may be incorrect for cross-layer)
    if (!originDS) {
      originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || null
      lookupMethod = 'outputDS-fallback'
      
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removal-origin-ds-from-outputDS-fallback',
        widgetId,
        recordIndex,
        recordId: record.getId(),
        recordQueryConfigId: recordQueryConfigId || 'MISSING',
        recordOriginDSId: recordOriginDSId || 'MISSING',
        reason: 'no-originDSId-attribute-and-no-dataSource-property',
        outputDSId: outputDS.id,
        originDSId: originDS?.id || 'null',
        originDSLabel: originDS?.getLabel?.() || 'null',
        lookupMethod,
        warning: 'Using current query origin DS - may be incorrect for cross-layer records',
        timestamp: Date.now()
      })
    }
    
    if (originDS) {
      if (!recordsByOriginDS.has(originDS)) {
        recordsByOriginDS.set(originDS, [])
      }
      recordsByOriginDS.get(originDS)!.push(record)
      
      // DIAGNOSTIC (r022.31): Log final resolution
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removal-origin-ds-resolved',
        widgetId,
        recordIndex,
        recordId: record.getId(),
        recordQueryConfigId: recordQueryConfigId || 'MISSING',
        resolvedOriginDSId: originDS.id,
        resolvedOriginDSType: originDS.type,
        resolvedOriginDSLabel: originDS.getLabel?.() || 'unknown',
        lookupMethod,
        timestamp: Date.now()
      })
    } else {
      // DIAGNOSTIC (r022.31): Log lookup failure
      debugLogger.log('RESULTS-MODE', {
        event: 'x-button-removal-origin-ds-lookup-failed',
        widgetId,
        recordIndex,
        recordId: record.getId(),
        recordQueryConfigId: recordQueryConfigId || 'MISSING',
        reason: 'no-origin-ds-found',
        lookupMethod,
        timestamp: Date.now()
      })
    }
  })
  
  debugLogger.log('RESULTS-MODE', {
    event: 'records-grouped-by-origin',
    widgetId,
    originDSCount: recordsByOriginDS.size,
    recordsByOriginDS: Array.from(recordsByOriginDS.entries()).map(([ds, records]) => ({
      originDSId: ds.id,
      recordCount: records.length
    }))
  })
  
  // For each origin DS, get current selection and remove matching records
  recordsByOriginDS.forEach((recordsToRemoveForOrigin, originDS) => {
    try {
      // Get current selected records from this origin DS
      const currentSelectedRecords = originDS.getSelectedRecords() || []
      const currentSelectedIds = originDS.getSelectedRecordIds() || []
      
      // DIAGNOSTIC (r022.31): Per-layer selection state BEFORE removal
      debugLogger.log('RESULTS-MODE', {
        event: 'processing-origin-ds-removal',
        widgetId,
        originDSId: originDS.id,
        originDSType: originDS.type,
        originDSLabel: originDS.getLabel?.() || 'unknown',
        currentSelectedCount: currentSelectedRecords.length,
        currentSelectedIds: currentSelectedIds.slice(0, 20),
        recordsToRemoveCount: recordsToRemoveForOrigin.length,
        recordsToRemoveIds: recordsToRemoveForOrigin.map(r => r.getId()),
        recordsToRemoveQueryConfigs: recordsToRemoveForOrigin.map(r => r.feature?.attributes?.__queryConfigId || 'MISSING'),
        timestamp: Date.now()
      })
      
      // r022.73: Build composite keys (recordId + queryConfigId) to remove for accurate matching
      // FIX: Query results don't have __queryConfigId, but accumulated records do
      // Build lookup map from accumulated records first
      const accumulatedLookup = new Map<string, string>()
      if (accumulatedRecords) {
        accumulatedRecords.forEach(accRec => {
          const accRecId = accRec.getId()
          const accQueryConfigId = accRec.feature?.attributes?.__queryConfigId || ''
          accumulatedLookup.set(accRecId, accQueryConfigId)
        })
      }
      
      const compositeKeysToRemove = new Set(
        recordsToRemoveForOrigin.map(record => {
          const recordId = record.getId()
          // r022.73: Use queryConfigId from accumulated records, not from query results
          const queryConfigId = accumulatedLookup.get(recordId) || record.feature?.attributes?.__queryConfigId || ''
          
          debugLogger.log('RESULTS-MODE', {
            event: 'r022-73-removal-composite-key-built',
            recordId,
            queryConfigIdFromAccumulated: accumulatedLookup.get(recordId) || 'NOT_FOUND',
            queryConfigIdFromRecord: record.feature?.attributes?.__queryConfigId || 'MISSING',
            finalQueryConfigId: queryConfigId,
            compositeKey: `${recordId}__${queryConfigId}`,
            timestamp: Date.now()
          })
          
          return `${recordId}__${queryConfigId}`
        })
      )
      
      // r023.28: Also build simple recordId set for fallback matching
      const recordIdsToRemove = new Set(recordsToRemoveForOrigin.map(r => r.getId()))
      
      // Filter out records that match composite keys (ID + queryConfigId) to remove
      let remainingRecords = currentSelectedRecords.filter(record => {
        const recordId = record.getId()
        const queryConfigId = record.feature?.attributes?.__queryConfigId || ''
        const compositeKey = `${recordId}__${queryConfigId}`
        return !compositeKeysToRemove.has(compositeKey)
      })
      
      // r023.28: If composite key matching didn't remove anything, fall back to simple recordId matching
      // This handles cases where origin DS records don't have __queryConfigId (e.g., "Select on Map" selections)
      const compositeRemovalCount = currentSelectedRecords.length - remainingRecords.length
      if (compositeRemovalCount === 0 && recordsToRemoveForOrigin.length > 0) {
        debugLogger.log('RESULTS-MODE', {
          event: 'r023-28-composite-key-fallback-to-recordId',
          widgetId,
          originDSId: originDS.id,
          reason: 'composite-key-matching-removed-nothing',
          recordIdsToRemove: Array.from(recordIdsToRemove),
          note: 'Falling back to simple recordId matching (origin DS records may lack __queryConfigId)',
          timestamp: Date.now()
        })
        
        remainingRecords = currentSelectedRecords.filter(record => {
          const recordId = record.getId()
          return !recordIdsToRemove.has(recordId)
        })
      }
      
      const remainingIds = remainingRecords.map(record => record.getId())
      
      // r023.28: Determine which matching method was used
      const usedFallbackMatching = compositeRemovalCount === 0 && recordsToRemoveForOrigin.length > 0
      const finalRemovalCount = currentSelectedRecords.length - remainingRecords.length
      
      // DIAGNOSTIC (r022.31, r023.28): Log removal details including which method was used
      debugLogger.log('RESULTS-MODE', {
        event: 'origin-ds-removal-filtered',
        widgetId,
        originDSId: originDS.id,
        originDSLabel: originDS.getLabel?.() || 'unknown',
        matchingMethod: usedFallbackMatching ? 'recordId-fallback' : 'composite-key',
        selectionBeforeRemoval: {
          count: currentSelectedRecords.length,
          ids: currentSelectedIds.slice(0, 20),
          compositeKeys: currentSelectedRecords.slice(0, 5).map(r => ({
            recordId: r.getId(),
            queryConfigId: r.feature?.attributes?.__queryConfigId || 'MISSING'
          }))
        },
        removalDetails: {
          compositeKeysToRemove: Array.from(compositeKeysToRemove),
          recordIdsToRemove: Array.from(recordIdsToRemove),
          expectedRemovedCount: recordsToRemoveForOrigin.length,
          compositeMatchRemoved: compositeRemovalCount,
          finalRemovedCount: finalRemovalCount,
          removalSuccessful: finalRemovalCount === recordsToRemoveForOrigin.length
        },
        remainingAfterFilter: {
          count: remainingRecords.length,
          ids: remainingIds.slice(0, 20)
        },
        timestamp: Date.now()
      })
      
      // Update selection in origin DS
      if (typeof originDS.selectRecordsByIds === 'function') {
        originDS.selectRecordsByIds(remainingIds, remainingRecords as FeatureDataRecord[])
        
        // DIAGNOSTIC (r022.31): Verify selection state AFTER update
        // Use setTimeout to allow DS to process the selection change
        setTimeout(() => {
          const actualSelectedAfter = originDS.getSelectedRecords() || []
          const actualSelectedIdsAfter = originDS.getSelectedRecordIds() || []
          
          debugLogger.log('RESULTS-MODE', {
            event: 'origin-ds-removal-complete-verified',
            widgetId,
            originDSId: originDS.id,
            originDSLabel: originDS.getLabel?.() || 'unknown',
            selectionAfterUpdate: {
              count: actualSelectedAfter.length,
              ids: actualSelectedIdsAfter.slice(0, 20)
            },
            expectedCount: remainingRecords.length,
            actualCount: actualSelectedAfter.length,
            countsMatch: actualSelectedAfter.length === remainingRecords.length,
            expectedRemovedCount: recordsToRemoveForOrigin.length,
            actualRemovedCount: currentSelectedRecords.length - actualSelectedAfter.length,
            removalSuccessful: (currentSelectedRecords.length - actualSelectedAfter.length) === recordsToRemoveForOrigin.length,
            timestamp: Date.now()
          })
        }, 100)
      } else {
        debugLogger.log('RESULTS-MODE', {
          event: 'origin-ds-removal-skipped',
          widgetId,
          originDSId: originDS.id,
          reason: 'selectRecordsByIds-not-available',
          timestamp: Date.now()
        })
      }
      
      // Publish selection change message for this origin DS
      MessageManager.getInstance().publishMessage(
        new DataRecordsSelectionChangeMessage(widgetId, remainingRecords as FeatureDataRecord[], [originDS.id])
      )
      
      debugLogger.log('RESULTS-MODE', {
        event: 'origin-ds-selection-updated',
        widgetId,
        originDSId: originDS.id,
        remainingRecordsCount: remainingRecords.length,
        messagePublished: true
      })
    } catch (error) {
      debugLogger.log('RESULTS-MODE', {
        event: 'origin-ds-removal-error',
        widgetId,
        originDSId: originDS.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      })
    }
  })
  
  debugLogger.log('RESULTS-MODE', {
    event: 'removing-records-from-origin-selections-complete',
    widgetId,
    originDSCount: recordsByOriginDS.size,
    totalRecordsRemoved: recordsToRemove.length
  })
}

/**
 * Clears all records from the accumulated results data source.
 * 
 * @param accumulatedDS - The accumulated results data source to clear
 */
export function clearAccumulatedResults(
  accumulatedDS: FeatureLayerDataSource
): void {
  debugLogger.log('RESULTS-MODE', {
    event: 'clearing-accumulated-results',
    accumulatedDSId: accumulatedDS.id
  })
  
  // Set status to NotReady to clear records
  accumulatedDS.setStatus(DataSourceStatus.NotReady)
  accumulatedDS.setCountStatus(DataSourceStatus.NotReady)
  
  // Clear any loaded records if possible
  // Note: May need to use DataSourceManager methods depending on ExB API
  
  debugLogger.log('RESULTS-MODE', {
    event: 'accumulated-results-cleared',
    accumulatedDSId: accumulatedDS.id
  })
}

