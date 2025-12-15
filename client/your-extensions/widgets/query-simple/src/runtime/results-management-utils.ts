/**
 * Utility functions for managing results accumulation in QuerySimple widget.
 * Handles "Add to" and "Remove from" modes for accumulating query results.
 */

import type { FeatureLayerDataSource, FeatureDataRecord, DataRecord } from 'jimu-core'
import { DataSourceManager, DataSourceStatus, MessageManager, DataRecordSetChangeMessage, RecordSetChangeType, DataRecordsSelectionChangeMessage } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

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
 * This function merges new records with existing records that were captured
 * before the query executed. The caller is responsible for storing the merged
 * records (typically in recordsRef or state).
 * 
 * @param outputDS - The output data source (used for key generation)
 * @param newRecords - New records to merge in
 * @param existingRecords - Existing records captured before query execution (optional, defaults to empty array)
 * @returns Array of all merged records (existing + new unique records)
 */
export function mergeResultsIntoAccumulated(
  outputDS: FeatureLayerDataSource,
  newRecords: FeatureDataRecord[],
  existingRecords: FeatureDataRecord[] = []
): FeatureDataRecord[] {
  debugLogger.log('RESULTS-MODE', {
    event: 'merging-results-start',
    outputDSId: outputDS.id,
    existingRecordsCount: existingRecords.length,
    newRecordsCount: newRecords.length
  })
  
  // Build Set of existing record keys for fast lookup
  const existingKeys = new Set(
    existingRecords.map(record => getRecordKey(record, outputDS))
  )
  
  debugLogger.log('RESULTS-MODE', {
    event: 'existing-records-check',
    existingRecordsCount: existingRecords.length,
    existingKeysCount: existingKeys.size
  })
  
  // Filter new records to only include those not already in output DS
  const uniqueNewRecords = newRecords.filter(record => {
    const key = getRecordKey(record, outputDS)
    const isDuplicate = existingKeys.has(key)
    
    if (isDuplicate) {
      debugLogger.log('RESULTS-MODE', {
        event: 'duplicate-record-skipped',
        key,
        objectId: record.getId()
      })
    }
    
    return !isDuplicate
  })
  
  debugLogger.log('RESULTS-MODE', {
    event: 'deduplication-complete',
    newRecordsCount: newRecords.length,
    uniqueNewRecordsCount: uniqueNewRecords.length,
    duplicatesSkipped: newRecords.length - uniqueNewRecords.length
  })
  
  // Merge records
  const mergedRecords = [...existingRecords, ...uniqueNewRecords]
  
  debugLogger.log('RESULTS-MODE', {
    event: 'merge-complete',
    totalRecordsAfterMerge: mergedRecords.length,
    existingCount: existingRecords.length,
    newUniqueCount: uniqueNewRecords.length
  })
  
  return mergedRecords
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
 * 
 * @param widgetId - The widget ID for publishing messages
 * @param recordsToRemove - Records to remove from selection
 * @param outputDS - The output data source (used for key generation)
 */
export function removeRecordsFromOriginSelections(
  widgetId: string,
  recordsToRemove: FeatureDataRecord[],
  outputDS: FeatureLayerDataSource
): void {
  debugLogger.log('RESULTS-MODE', {
    event: 'removing-records-from-origin-selections-start',
    widgetId,
    recordsToRemoveCount: recordsToRemove.length,
    outputDSId: outputDS.id
  })
  
  if (recordsToRemove.length === 0) {
    debugLogger.log('RESULTS-MODE', {
      event: 'no-records-to-remove-from-selection',
      widgetId
    })
    return
  }
  
  // Group records by their origin data source
  const recordsByOriginDS = new Map<FeatureLayerDataSource, FeatureDataRecord[]>()
  
  recordsToRemove.forEach(record => {
    const recordDS = record.getDataSource?.() as FeatureLayerDataSource
    let originDS: FeatureLayerDataSource | null = null
    
    if (recordDS) {
      originDS = recordDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || recordDS
    } else {
      // Fallback: try to get origin from outputDS
      originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || null
    }
    
    if (originDS) {
      if (!recordsByOriginDS.has(originDS)) {
        recordsByOriginDS.set(originDS, [])
      }
      recordsByOriginDS.get(originDS)!.push(record)
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
      
      debugLogger.log('RESULTS-MODE', {
        event: 'processing-origin-ds-removal',
        widgetId,
        originDSId: originDS.id,
        currentSelectedCount: currentSelectedRecords.length,
        recordsToRemoveCount: recordsToRemoveForOrigin.length
      })
      
      // Build Set of IDs to remove for fast lookup
      const idsToRemove = new Set(
        recordsToRemoveForOrigin.map(record => record.getId())
      )
      
      // Filter out records that match IDs to remove
      const remainingRecords = currentSelectedRecords.filter(record => {
        const recordId = record.getId()
        return !idsToRemove.has(recordId)
      })
      
      const remainingIds = remainingRecords.map(record => record.getId())
      
      debugLogger.log('RESULTS-MODE', {
        event: 'origin-ds-removal-filtered',
        widgetId,
        originDSId: originDS.id,
        removedCount: currentSelectedRecords.length - remainingRecords.length,
        remainingCount: remainingRecords.length
      })
      
      // Update selection in origin DS
      if (typeof originDS.selectRecordsByIds === 'function') {
        originDS.selectRecordsByIds(remainingIds, remainingRecords as FeatureDataRecord[])
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

