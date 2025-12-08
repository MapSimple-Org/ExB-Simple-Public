/**
 * Utility functions for managing feature selection in QuerySimple widget.
 * Consolidates repeated selection logic to follow DRY principles.
 */

import type { DataSource, FeatureLayerDataSource, FeatureDataRecord } from 'jimu-core'
import { MessageManager, DataRecordsSelectionChangeMessage } from 'jimu-core'

/**
 * Gets the origin data source from an output data source.
 * @param outputDS - The output data source
 * @returns The origin data source, or null if not available
 */
export function getOriginDataSource(
  outputDS: DataSource | null | undefined
): FeatureLayerDataSource | null {
  if (!outputDS) return null
  const originDataSources = outputDS.getOriginDataSources()
  return originDataSources?.[0] as FeatureLayerDataSource || null
}

/**
 * Selects records in both the origin data source and output data source.
 * This is the standard pattern used throughout the widget for selection.
 * 
 * @param outputDS - The output data source
 * @param recordIds - Array of record IDs to select
 * @param records - Optional array of FeatureDataRecord objects for proper highlighting
 */
export function selectRecordsInDataSources(
  outputDS: DataSource | null | undefined,
  recordIds: string[],
  records?: FeatureDataRecord[]
): void {
  if (!outputDS) return
  
  const originDS = getOriginDataSource(outputDS)
  
  // Select in origin data source (the actual layer)
  if (originDS && typeof originDS.selectRecordsByIds === 'function') {
    originDS.selectRecordsByIds(recordIds, records)
  }
  
  // Also select in outputDS for widget's internal state
  if (typeof outputDS.selectRecordsByIds === 'function') {
    outputDS.selectRecordsByIds(recordIds, records)
  }
}

/**
 * Clears selection in both the origin data source and output data source.
 * 
 * @param outputDS - The output data source
 */
export function clearSelectionInDataSources(
  outputDS: DataSource | null | undefined
): void {
  selectRecordsInDataSources(outputDS, [])
}

/**
 * Publishes a selection change message for the given records and data sources.
 * 
 * @param widgetId - The widget ID
 * @param records - Array of FeatureDataRecord objects (empty array to clear)
 * @param outputDS - The output data source
 * @param alsoPublishToOutputDS - Whether to also publish a message for outputDS (default: false)
 */
export function publishSelectionMessage(
  widgetId: string,
  records: FeatureDataRecord[],
  outputDS: DataSource | null | undefined,
  alsoPublishToOutputDS: boolean = false
): void {
  if (!outputDS) return
  
  const originDS = getOriginDataSource(outputDS)
  
  if (originDS) {
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(widgetId, records, [originDS.id])
    )
  } else if (alsoPublishToOutputDS) {
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(widgetId, records, [outputDS.id])
    )
  }
  
  // Optionally publish to outputDS as well (for some edge cases)
  if (alsoPublishToOutputDS && originDS) {
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(widgetId, records, [outputDS.id])
    )
  }
}

/**
 * Selects records and publishes the selection message in one call.
 * This is the most common pattern - selecting records and notifying the map.
 * 
 * @param widgetId - The widget ID
 * @param outputDS - The output data source
 * @param recordIds - Array of record IDs to select
 * @param records - Array of FeatureDataRecord objects for proper highlighting
 * @param alsoPublishToOutputDS - Whether to also publish a message for outputDS (default: false)
 */
export function selectRecordsAndPublish(
  widgetId: string,
  outputDS: DataSource | null | undefined,
  recordIds: string[],
  records: FeatureDataRecord[],
  alsoPublishToOutputDS: boolean = false
): void {
  selectRecordsInDataSources(outputDS, recordIds, records)
  publishSelectionMessage(widgetId, records, outputDS, alsoPublishToOutputDS)
}

/**
 * Finds the "Clear results" button in the DOM.
 * Used when programmatically triggering the clear action.
 * 
 * @returns The clear button element, or null if not found
 */
export function findClearResultsButton(): HTMLButtonElement | null {
  return document.querySelector('button[aria-label="Clear results"]') as HTMLButtonElement | null
}

