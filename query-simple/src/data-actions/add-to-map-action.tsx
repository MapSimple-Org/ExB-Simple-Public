/**
 * Custom "Add to Map" data action for QuerySimple widget.
 * 
 * r023.0: This action now uses a dedicated, isolated selection function.
 * Selection in the widget ONLY happens via explicit user actions:
 * - Add to Map action (this file)
 * - Remove result (X button)
 * - Clear All
 * 
 * All automatic selection logic has been removed (query execution, query switching, Results tab).
 * This ensures predictable, user-driven selection behavior.
 */

import { type DataRecordSet, type DataAction, DataLevel, type IntlShape, type DataSource, MessageManager, DataRecordsSelectionChangeMessage, DataSourceManager, type ImmutableArray, type ImmutableObject } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()
import type { FeatureDataRecord } from 'jimu-core'
import type { QueryItemType } from '../config'

/**
 * r023.3: Dedicated selection function for Add to Map action WITH multi-layer support
 * 
 * This is isolated from the shared selection-utils to ensure Add to Map
 * continues working independently when we remove automatic selection logic.
 * 
 * Now interrogates graphics layer to determine which records belong to which layers,
 * using queryConfigId stored in graphic attributes.
 * 
 * Selection now ONLY happens via explicit user actions:
 * - Add to Map action (this function)
 * - Remove result (X button)
 * - Clear All
 * 
 * @param widgetId - Widget ID for message publishing
 * @param records - Records to select (from actionDataSets)
 * @param outputDS - Output data source (fallback for single-layer mode)
 * @param graphicsLayer - r023.3: Graphics layer to interrogate for record-to-layer mapping
 * @param queries - r023.3: All query configs to map queryConfigId to data sources
 */
async function selectRecordsForAddToMap(
  widgetId: string,
  records: FeatureDataRecord[],
  outputDS: DataSource,
  graphicsLayer?: __esri.GraphicsLayer,
  queries?: ImmutableArray<ImmutableObject<QueryItemType>>
): Promise<void> {
  debugLogger.log('DATA-ACTION', {
    event: 'selectRecordsForAddToMap-ENTRY',
    widgetId,
    recordsCount: records?.length || 0,
    hasRecords: !!(records && records.length > 0),
    hasOutputDS: !!outputDS,
    outputDSId: outputDS?.id,
    hasGraphicsLayer: !!graphicsLayer,
    graphicsCount: graphicsLayer?.graphics?.length || 0,
    hasQueries: !!(queries && queries.length > 0),
    queriesCount: queries?.length || 0,
    note: 'r023.3: Entering dedicated selection function - will interrogate graphics layer',
    timestamp: Date.now()
  })
  
  if (!records || records.length === 0) {
    debugLogger.log('DATA-ACTION', {
      event: 'selectRecordsForAddToMap-NO-RECORDS',
      widgetId,
      note: 'Early return - no records to select',
      timestamp: Date.now()
    })
    return
  }
  
  const recordIds = records.map(r => r.getId())
  const recordIdSet = new Set(recordIds)
  
  debugLogger.log('DATA-ACTION', {
    event: 'selectRecordsForAddToMap-START',
    widgetId,
    recordsCount: records.length,
    recordIds: recordIds.slice(0, 20),
    note: 'r023.3: Interrogating graphics layer for multi-layer selection',
    timestamp: Date.now()
  })
  
  // r023.3: Interrogate graphics layer to map record IDs to their query configs (and thus their layers)
  const recordIdToQueryConfigId = new Map<string, string>()
  const recordsByOriginDS = new Map<DataSource, { records: FeatureDataRecord[], ids: string[] }>()
  const dsManager = DataSourceManager.getInstance()
  
  if (graphicsLayer && graphicsLayer.graphics && graphicsLayer.graphics.length > 0 && queries && queries.length > 0) {
    debugLogger.log('DATA-ACTION', {
      event: 'selectRecordsForAddToMap-interrogating-graphics',
      widgetId,
      graphicsCount: graphicsLayer.graphics.length,
      queriesCount: queries.length,
      recordIdsToSelect: recordIds.slice(0, 10),
      timestamp: Date.now()
    })
    
    // Step 1: Build map of record ID -> queryConfigId from graphics
    graphicsLayer.graphics.forEach(graphic => {
      const graphicRecordId = graphic.attributes?.recordId
      const graphicQueryConfigId = graphic.attributes?.queryConfigId
      
      if (graphicRecordId && graphicQueryConfigId) {
        recordIdToQueryConfigId.set(graphicRecordId, graphicQueryConfigId)
      }
    })
    
    debugLogger.log('DATA-ACTION', {
      event: 'selectRecordsForAddToMap-built-recordId-to-queryConfigId-map',
      widgetId,
      mappedRecordsCount: recordIdToQueryConfigId.size,
      sampleMappings: Array.from(recordIdToQueryConfigId.entries()).slice(0, 5),
      timestamp: Date.now()
    })
    
    // Step 2: Group records by their origin data source using queryConfigId
    records.forEach((record, index) => {
      const recordId = record.getId()
      const queryConfigId = recordIdToQueryConfigId.get(recordId)
      
      if (!queryConfigId) {
        debugLogger.log('DATA-ACTION', {
          event: 'selectRecordsForAddToMap-record-no-queryConfigId',
          widgetId,
          recordIndex: index,
          recordId,
          note: 'Record not found in graphics layer',
          timestamp: Date.now()
        })
        return
      }
      
      // Find query config matching this queryConfigId
      const queryConfig = queries.find(q => q.configId === queryConfigId)
      if (!queryConfig?.useDataSource) {
        debugLogger.log('DATA-ACTION', {
          event: 'selectRecordsForAddToMap-no-queryConfig',
          widgetId,
          recordId,
          queryConfigId,
          note: 'No query config found for this queryConfigId',
          timestamp: Date.now()
        })
        return
      }
      
      // Get data source ID from query config
      const dataSourceId = typeof queryConfig.useDataSource === 'string' 
        ? queryConfig.useDataSource 
        : queryConfig.useDataSource?.dataSourceId
      
      if (!dataSourceId) {
        debugLogger.log('DATA-ACTION', {
          event: 'selectRecordsForAddToMap-no-dataSourceId',
          widgetId,
          recordId,
          queryConfigId,
          note: 'No dataSourceId in query config',
          timestamp: Date.now()
        })
        return
      }
      
      // Get the data source and its origin
      const recordOutputDS = dsManager.getDataSource(dataSourceId)
      const recordOriginDS = recordOutputDS?.getOriginDataSources?.()?.[0] || recordOutputDS
      
      if (!recordOriginDS) {
        debugLogger.log('DATA-ACTION', {
          event: 'selectRecordsForAddToMap-no-origin-ds',
          widgetId,
          recordId,
          dataSourceId,
          note: 'Could not get origin DS from data source manager',
          timestamp: Date.now()
        })
        return
      }
      
      // Add to the group for this origin DS
      if (!recordsByOriginDS.has(recordOriginDS)) {
        recordsByOriginDS.set(recordOriginDS, { records: [], ids: [] })
      }
      recordsByOriginDS.get(recordOriginDS).records.push(record)
      recordsByOriginDS.get(recordOriginDS).ids.push(recordId)
    })
    
    debugLogger.log('DATA-ACTION', {
      event: 'selectRecordsForAddToMap-grouped-by-layer-via-graphics',
      widgetId,
      uniqueOriginDSCount: recordsByOriginDS.size,
      originDSIds: Array.from(recordsByOriginDS.keys()).map(ds => ds.id),
      recordsByLayer: Array.from(recordsByOriginDS.entries()).map(([ds, data]) => ({
        originDSId: ds.id,
        recordsCount: data.records.length,
        recordIds: data.ids.slice(0, 5)
      })),
      note: 'r023.3: Successfully grouped records by interrogating graphics layer',
      timestamp: Date.now()
    })
  } else {
    // Fallback: use outputDS origin (single layer only)
    const originDS = (outputDS as any).getOriginDataSources?.()?.[0] || outputDS
    
    debugLogger.log('DATA-ACTION', {
      event: 'selectRecordsForAddToMap-fallback-single-layer',
      widgetId,
      outputDSId: outputDS.id,
      originDSId: originDS?.id,
      hasGraphicsLayer: !!graphicsLayer,
      hasQueries: !!(queries && queries.length > 0),
      note: 'r023.3: No graphics or queries - using single-layer fallback',
      timestamp: Date.now()
    })
    
    if (originDS) {
      recordsByOriginDS.set(originDS, { records, ids: recordIds })
    }
  }
  
  // Step 1: Select in each origin DS (native layer selection for blue outline on map)
  for (const [originDataSource, data] of recordsByOriginDS.entries()) {
    debugLogger.log('DATA-ACTION', {
      event: 'selectRecordsForAddToMap-selecting-in-layer',
      widgetId,
      originDSId: originDataSource.id,
      recordsCount: data.records.length,
      recordIds: data.ids.slice(0, 10),
      timestamp: Date.now()
    })
    
    if (originDataSource && typeof originDataSource.selectRecordsByIds === 'function') {
      originDataSource.selectRecordsByIds(data.ids, data.records)
      
      debugLogger.log('DATA-ACTION', {
        event: 'selectRecordsForAddToMap-layer-selected',
        widgetId,
        originDSId: originDataSource.id,
        recordsCount: data.records.length,
        note: 'r023.3: Native layer selection (blue outline on map)',
        timestamp: Date.now()
      })
    }
  }
  
  // Step 2: Update output DS (for Results tab highlighting)
  debugLogger.log('DATA-ACTION', {
    event: 'selectRecordsForAddToMap-updating-output-ds',
    widgetId,
    outputDSId: outputDS.id,
    hasSelectFunction: typeof outputDS.selectRecordsByIds === 'function',
    recordsCount: records.length,
    timestamp: Date.now()
  })
  
  if (outputDS && typeof outputDS.selectRecordsByIds === 'function') {
    outputDS.selectRecordsByIds(recordIds, records)
    
    debugLogger.log('DATA-ACTION', {
      event: 'selectRecordsForAddToMap-output-ds-updated',
      widgetId,
      outputDSId: outputDS.id,
      recordsCount: records.length,
      note: 'Output DS updated (Results tab highlighting)',
      timestamp: Date.now()
    })
  }
  
  // Step 3: Publish selection message (for widget communication with HelperSimple)
  // r023.3: Publish for all origin layers (multi-layer support)
  const originDSIds = Array.from(recordsByOriginDS.keys()).map(ds => ds.id)
  
  debugLogger.log('DATA-ACTION', {
    event: 'selectRecordsForAddToMap-publishing-message',
    widgetId,
    layersCount: originDSIds.length,
    originDSIds,
    recordsCount: records.length,
    note: 'r023.3: Publishing for all origin layers',
    timestamp: Date.now()
  })
  
  if (originDSIds.length > 0) {
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(widgetId, records, originDSIds)
    )
    
    debugLogger.log('DATA-ACTION', {
      event: 'selectRecordsForAddToMap-message-published',
      widgetId,
      recordsCount: records.length,
      layersCount: originDSIds.length,
      originDSIds,
      note: 'r023.3: Selection message published (multi-layer support)',
      timestamp: Date.now()
    })
  }
  
  debugLogger.log('DATA-ACTION', {
    event: 'selectRecordsForAddToMap-COMPLETE',
    widgetId,
    recordsCount: records.length,
    layersCount: recordsByOriginDS.size,
    layerIds: Array.from(recordsByOriginDS.keys()).map(ds => ds.id),
    note: 'r023.3: Dedicated selection function completed (multi-layer via graphics interrogation)',
    timestamp: Date.now()
  })
}

/**
 * Creates a custom "Add to Map" data action that uses QuerySimple's selection process.
 * 
 * This action replaces the framework's "Show on Map" action and ensures consistent
 * behavior with QuerySimple's query results by using the same selection mechanism.
 * 
 * r023.3: Now accepts graphics layer and queries to interrogate graphics for proper multi-layer selection.
 * 
 * @param widgetId - The widget ID that provides this action
 * @param outputDS - The output data source (used for selection on the origin layer)
 * @param intl - The Intl object for internationalization
 * @param queryItem - Optional query item configuration (for zoomToSelected setting)
 * @param runtimeZoomToSelected - Optional runtime zoom override from the query form
 * @param graphicsLayer - r023.3: Graphics layer to interrogate for record-to-layer mapping
 * @param queries - r023.3: All query configs to map queryConfigId to data sources
 * @returns A DataAction object that can be used by DataActionList
 */
export function createAddToMapAction(
  widgetId: string,
  outputDS: DataSource,
  intl: IntlShape,
  queryItem?: QueryItemType,
  runtimeZoomToSelected?: boolean,
  graphicsLayer?: __esri.GraphicsLayer,
  queries?: ImmutableArray<ImmutableObject<QueryItemType>>
): DataAction {
  return {
    id: `${widgetId}-addToMap`,
    name: 'addToMap',
    label: intl.formatMessage({ id: 'addToMap', defaultMessage: 'Select on map' }),
    // Icon matches the framework's "Show on Map" action for consistency
    icon: require('../runtime/assets/icons/show-on-map.svg').default || require('../runtime/assets/icons/show-on-map.svg'),
    // Note: Index may not control position if extraActions are always appended after framework actions
    index: -100,
    widgetId,
    intl,
    supportProviderWidget: true,
    
    /**
     * Determines if this action can process the given data sets.
     * Supports Records level actions with feature data records.
     */
    isSupported: async (dataSets: DataRecordSet[], dataLevel: DataLevel, actionWidgetId: string): Promise<boolean> => {
      debugLogger.log('DATA-ACTION', {
        action: 'addToMap-isSupported',
        widgetId,
        actionWidgetId,
        dataLevel,
        dataSetsCount: dataSets?.length || 0,
        hasOutputDS: !!outputDS
      })
      
      // Only support Records level actions
      if (dataLevel !== DataLevel.Records) {
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-isSupported',
          result: false,
          reason: 'Not Records level'
        })
        return false
      }
      
      // Need at least one data set with records
      if (!dataSets || dataSets.length === 0) {
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-isSupported',
          result: false,
          reason: 'No data sets'
        })
        return false
      }
      
      // Check if we have records and output data source
      const hasRecords = dataSets.some(ds => ds.records && ds.records.length > 0)
      const supported = hasRecords && !!outputDS
      
      debugLogger.log('DATA-ACTION', {
        action: 'addToMap-isSupported',
        result: supported,
        hasRecords,
        recordsCount: dataSets.reduce((sum, ds) => sum + (ds.records?.length || 0), 0)
      })
      
      return supported
    },
    
    /**
     * Executes the action by selecting records using QuerySimple's selection process.
     */
    onExecute: async (dataSets: DataRecordSet[], dataLevel: DataLevel, actionWidgetId: string): Promise<boolean> => {
      debugLogger.log('DATA-ACTION', {
        action: 'addToMap-onExecute-ENTRY',
        widgetId,
        actionWidgetId,
        dataLevel,
        dataSetsCount: dataSets?.length || 0,
        hasOutputDS: !!outputDS,
        outputDSId: outputDS?.id,
        note: 'r023.0: Entering Add to Map action',
        timestamp: Date.now()
      })
      
      if (!outputDS || dataLevel !== DataLevel.Records) {
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-onExecute-EARLY-EXIT',
          result: false,
          reason: !outputDS ? 'No outputDS' : 'Not Records level',
          hasOutputDS: !!outputDS,
          dataLevel,
          timestamp: Date.now()
        })
        return false
      }
      
      // Collect all records from all data sets
      const allRecords: FeatureDataRecord[] = []
      dataSets.forEach((dataSet, index) => {
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-processing-dataset',
          dataSetIndex: index,
          hasRecords: !!(dataSet.records && dataSet.records.length > 0),
          recordsCount: dataSet.records?.length || 0,
          timestamp: Date.now()
        })
        
        if (dataSet.records && dataSet.records.length > 0) {
          // Filter to only FeatureDataRecord types
          const featureRecords = dataSet.records.filter(
            (record): record is FeatureDataRecord => {
              return record && typeof (record as FeatureDataRecord).getGeometry === 'function'
            }
          )
          
          debugLogger.log('DATA-ACTION', {
            action: 'addToMap-filtered-feature-records',
            dataSetIndex: index,
            originalCount: dataSet.records.length,
            featureRecordsCount: featureRecords.length,
            timestamp: Date.now()
          })
          
          allRecords.push(...featureRecords)
        }
      })
      
      if (allRecords.length === 0) {
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-onExecute-NO-RECORDS',
          result: false,
          reason: 'No feature records found',
          dataSetsCount: dataSets?.length || 0,
          timestamp: Date.now()
        })
        return false
      }
      
      // Get record IDs
      const recordIds = allRecords.map(record => record.getId())
      
      debugLogger.log('DATA-ACTION', {
        action: 'addToMap-onExecute-BEFORE-SELECTION',
        recordsCount: allRecords.length,
        recordIds: recordIds.slice(0, 20), // Log first 20 IDs
        outputDSId: outputDS.id,
        note: 'About to call selectRecordsForAddToMap',
        timestamp: Date.now()
      })
      
      // r023.3: Use dedicated selection function - interrogate graphics layer for multi-layer support
      // Graphics layer has queryConfigId in attributes, allowing us to map records to their layers
      try {
        await selectRecordsForAddToMap(widgetId, allRecords, outputDS, graphicsLayer, queries)
        
        // Note: Zoom is now handled by the separate "Zoom To" action in the DataActionList
        // Users can click "Zoom To" from the action menu if they want to zoom to selected records
        
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-onExecute-SUCCESS',
          result: true,
          message: 'r023.3: Successfully selected records via dedicated Add to Map function (multi-layer via graphics)',
          recordsCount: allRecords.length,
          hasGraphicsLayer: !!graphicsLayer,
          graphicsCount: graphicsLayer?.graphics?.length || 0,
          hasQueries: !!(queries && queries.length > 0),
          queriesCount: queries?.length || 0,
          timestamp: Date.now()
        })
        
        return true
      } catch (error) {
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-onExecute-ERROR',
          result: false,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          timestamp: Date.now()
        })
        return false
      }
    },
    
    /**
     * Cleanup method (required by DataAction interface)
     */
    destroy: (): void => {
      // No cleanup needed
    }
  }
}

