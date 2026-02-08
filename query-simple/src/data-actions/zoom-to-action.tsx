/**
 * Custom "Zoom To" data action for QuerySimple widget.
 * 
 * This action replaces the framework's "Zoom To" action with a custom
 * implementation that uses QuerySimple's zoom logic (mapView.goTo with padding).
 * This ensures consistent zoom behavior with proper padding.
 */

import { type DataRecordSet, type DataAction, DataLevel, type IntlShape } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import { zoomToRecords } from '../runtime/zoom-utils'
import type { FeatureDataRecord } from 'jimu-core'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Creates a custom "Zoom To" data action that uses QuerySimple's zoom logic.
 * 
 * This action replaces the framework's "Zoom To" action and ensures consistent
 * zoom behavior with padding using mapView.goTo().
 * 
 * @param widgetId - The widget ID that provides this action
 * @param mapView - The map view to zoom (MapView or SceneView)
 * @param intl - The Intl object for internationalization
 * @returns A DataAction object that can be used by DataActionList
 */
export function createZoomToAction(
  widgetId: string,
  mapView: __esri.MapView | __esri.SceneView | undefined,
  intl: IntlShape
): DataAction {
  return {
    id: `${widgetId}-zoomTo`,
    name: 'querySimpleZoomTo', // Use unique name to avoid conflict with framework action
    label: intl.formatMessage({ id: 'zoomToSelected', defaultMessage: 'Zoom to selected' }),
    // Use the same icon as the framework's zoom action (from ExB configuration page)
    icon: require('../runtime/assets/icons/zoom-to.svg').default || require('../runtime/assets/icons/zoom-to.svg'),
    index: -90, // Position before Add to Map (-100)
    widgetId,
    intl,
    supportProviderWidget: true,
    
    /**
     * Determines if this action can process the given data sets.
     * Supports Records level actions with feature data records.
     */
    isSupported: async (dataSets: DataRecordSet[], dataLevel: DataLevel, actionWidgetId: string): Promise<boolean> => {
      debugLogger.log('DATA-ACTION', {
        action: 'zoomTo-isSupported',
        widgetId,
        actionWidgetId,
        dataLevel,
        dataSetsCount: dataSets?.length || 0,
        hasMapView: !!mapView
      })
      
      // Only support Records level actions
      if (dataLevel !== DataLevel.Records) {
        debugLogger.log('DATA-ACTION', {
          action: 'zoomTo-isSupported',
          result: false,
          reason: 'Not Records level'
        })
        return false
      }
      
      // Need at least one data set with records and a map view
      if (!dataSets || dataSets.length === 0 || !mapView) {
        debugLogger.log('DATA-ACTION', {
          action: 'zoomTo-isSupported',
          result: false,
          reason: !dataSets || dataSets.length === 0 ? 'No data sets' : 'No mapView'
        })
        return false
      }
      
      // Check if we have records
      const hasRecords = dataSets.some(ds => ds.records && ds.records.length > 0)
      
      debugLogger.log('DATA-ACTION', {
        action: 'zoomTo-isSupported',
        result: hasRecords,
        recordsCount: dataSets.reduce((sum, ds) => sum + (ds.records?.length || 0), 0)
      })
      
      return hasRecords
    },
    
    /**
     * Executes the action by zooming to records using the shared zoom utility.
     */
    onExecute: async (dataSets: DataRecordSet[], dataLevel: DataLevel, actionWidgetId: string): Promise<boolean> => {
      debugLogger.log('DATA-ACTION', {
        action: 'zoomTo-onExecute',
        widgetId,
        actionWidgetId,
        dataLevel,
        dataSetsCount: dataSets?.length || 0,
        hasMapView: !!mapView
      })
      
      if (!mapView || dataLevel !== DataLevel.Records) {
        debugLogger.log('DATA-ACTION', {
          action: 'zoomTo-onExecute',
          result: false,
          reason: !mapView ? 'No mapView' : 'Not Records level'
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
          action: 'zoomTo-onExecute',
          result: false,
          reason: 'No feature records found'
        })
        return false
      }
      
      try {
        // Use the shared zoom utility function
        await zoomToRecords(mapView, allRecords)
        
        debugLogger.log('DATA-ACTION', {
          action: 'zoomTo-onExecute',
          result: true,
          message: 'Successfully zoomed to features',
          recordsCount: allRecords.length
        })
        
        return true
      } catch (error) {
        debugLogger.log('DATA-ACTION', {
          action: 'zoomTo-onExecute',
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

