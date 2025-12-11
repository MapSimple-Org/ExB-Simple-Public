/**
 * Utility functions for managing results accumulation in QuerySimple widget.
 * Handles "Add to" and "Remove from" modes for accumulating query results.
 */

import type { FeatureLayerDataSource, FeatureDataRecord, DataRecord } from 'jimu-core'
import { DataSourceManager, DataSourceStatus, MessageManager, DataRecordSetChangeMessage, RecordSetChangeType } from 'jimu-core'
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
 * Removes matching records from existing records in an output data source.
 * Matches records using composite keys (originDSId_objectId).
 * 
 * @param outputDS - The output data source containing existing records
 * @param recordsToRemove - Records to remove
 * @returns Array of remaining records after removal
 */
export function removeResultsFromAccumulated(
  outputDS: FeatureLayerDataSource,
  recordsToRemove: FeatureDataRecord[]
): FeatureDataRecord[] {
  debugLogger.log('RESULTS-MODE', {
    event: 'removing-results-start',
    outputDSId: outputDS.id,
    recordsToRemoveCount: recordsToRemove.length
  })
  
  // Get existing records from output DS
  const existingRecords = (outputDS.getAllLoadedRecords() || []) as FeatureDataRecord[]
  
  // Build Set of keys to remove for fast lookup
  const removeKeys = new Set(
    recordsToRemove.map(record => getRecordKey(record, outputDS))
  )
  
  debugLogger.log('RESULTS-MODE', {
    event: 'remove-keys-built',
    existingRecordsCount: existingRecords.length,
    removeKeysCount: removeKeys.size
  })
  
  // Filter out records that match keys to remove
  const remainingRecords = existingRecords.filter(record => {
    const key = getRecordKey(record, outputDS)
    const shouldRemove = removeKeys.has(key)
    
    if (shouldRemove) {
      debugLogger.log('RESULTS-MODE', {
        event: 'record-removed',
        key,
        objectId: record.getId()
      })
    }
    
    return !shouldRemove
  })
  
  debugLogger.log('RESULTS-MODE', {
    event: 'removal-complete',
    recordsRemoved: existingRecords.length - remainingRecords.length,
    remainingRecordsCount: remainingRecords.length
  })
  
  return remainingRecords
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

