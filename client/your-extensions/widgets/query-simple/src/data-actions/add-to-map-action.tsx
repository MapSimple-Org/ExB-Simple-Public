/**
 * Custom "Add to Map" data action for QuerySimple widget.
 * 
 * This action replaces the framework's "Show on Map" action with a custom
 * implementation that uses QuerySimple's selection process (selectRecordsAndPublish).
 * This ensures consistent behavior with query results and proper integration
 * with the widget's "Clear results" functionality.
 */

import { type DataRecordSet, type DataAction, DataLevel, type IntlShape, DataActionManager, type DataSource } from 'jimu-core'
import { selectRecordsAndPublish } from '../runtime/selection-utils'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()
import type { FeatureDataRecord } from 'jimu-core'
import type { QueryItemType } from '../config'

/**
 * Creates a custom "Add to Map" data action that uses QuerySimple's selection process.
 * 
 * This action replaces the framework's "Show on Map" action and ensures consistent
 * behavior with QuerySimple's query results by using the same selection mechanism.
 * 
 * @param widgetId - The widget ID that provides this action
 * @param outputDS - The output data source (used for selection on the origin layer)
 * @param intl - The Intl object for internationalization
 * @param queryItem - Optional query item configuration (for zoomToSelected setting)
 * @param runtimeZoomToSelected - Optional runtime zoom override from the query form
 * @returns A DataAction object that can be used by DataActionList
 */
export function createAddToMapAction(
  widgetId: string,
  outputDS: DataSource,
  intl: IntlShape,
  queryItem?: QueryItemType,
  runtimeZoomToSelected?: boolean
): DataAction {
  return {
    id: `${widgetId}-addToMap`,
    name: 'addToMap',
    label: intl.formatMessage({ id: 'addToMap', defaultMessage: 'Add to map' }),
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
        action: 'addToMap-onExecute',
        widgetId,
        actionWidgetId,
        dataLevel,
        dataSetsCount: dataSets?.length || 0,
        hasOutputDS: !!outputDS
      })
      
      if (!outputDS || dataLevel !== DataLevel.Records) {
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-onExecute',
          result: false,
          reason: !outputDS ? 'No outputDS' : 'Not Records level'
        })
        return false
      }
      
      // Collect all records from all data sets
      const allRecords: FeatureDataRecord[] = []
      dataSets.forEach(dataSet => {
        if (dataSet.records && dataSet.records.length > 0) {
          // Filter to only FeatureDataRecord types
          const featureRecords = dataSet.records.filter(
            (record): record is FeatureDataRecord => {
              return record && typeof (record as FeatureDataRecord).getGeometry === 'function'
            }
          )
          allRecords.push(...featureRecords)
        }
      })
      
      if (allRecords.length === 0) {
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-onExecute',
          result: false,
          reason: 'No feature records found'
        })
        return false
      }
      
      // Get record IDs
      const recordIds = allRecords.map(record => record.getId())
      
      debugLogger.log('DATA-ACTION', {
        action: 'addToMap-onExecute',
        recordsCount: allRecords.length,
        recordIds: recordIds.slice(0, 10), // Log first 10 IDs
        outputDSId: outputDS.id
      })
      
      // Use QuerySimple's selection process - selects on origin layer and publishes selection messages
      // This ensures consistent behavior with query results and proper integration with "Clear results"
      try {
        selectRecordsAndPublish(widgetId, outputDS, recordIds, allRecords, true)
        
        // Determine zoom behavior: runtime override takes precedence, then queryItem config, defaults to true
        const shouldZoom = runtimeZoomToSelected !== undefined 
          ? runtimeZoomToSelected 
          : (queryItem?.zoomToSelected !== false)
        
        if (shouldZoom && allRecords.length > 0) {
          const zoomDataSet: DataRecordSet = {
            dataSource: outputDS,
            records: allRecords,
            name: outputDS.getLabel()
          }
          
          // Find and execute the zoomToFeature action from available framework actions
          DataActionManager.getInstance().getSupportedActions(widgetId, [zoomDataSet], DataLevel.Records)
            .then(actionCategories => {
              // Search through all action categories to find zoomToFeature action
              let zoomAction: DataAction | null = null
              for (const category in actionCategories) {
                const actions = actionCategories[category]
                zoomAction = actions.find((action: DataAction) => 
                  action.name === 'zoomToFeature' || action.id === 'zoomToFeature'
                ) || null
                if (zoomAction) break
              }
              
              if (zoomAction) {
                return DataActionManager.getInstance().executeDataAction(zoomAction, [zoomDataSet], DataLevel.Records, widgetId)
              }
            })
            .catch(error => {
              debugLogger.log('DATA-ACTION', {
                action: 'addToMap-onExecute-zoom',
                error: error instanceof Error ? error.message : String(error)
              })
            })
        }
        
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-onExecute',
          result: true,
          message: 'Successfully selected records and published selection message',
          zoomExecuted: shouldZoom
        })
        
        return true
      } catch (error) {
        debugLogger.log('DATA-ACTION', {
          action: 'addToMap-onExecute',
          result: false,
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined
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

