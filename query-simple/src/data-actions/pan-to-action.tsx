/**
 * Custom "Pan To" data action for QuerySimple widget.
 * 
 * @deprecated r024.75: This module is deprecated. Pan to functionality now uses
 * the cached resultsExtent from widget state (calculated in handleAccumulatedRecordsChange).
 * 
 * The ResultsMenu component pans directly using:
 *   mapView.goTo({ center: resultsExtent.center })
 * 
 * The extent calculation has moved to zoom-utils.ts:
 *   - calculateRecordsExtent(records) - calculates union extent
 *   - expandExtentByFactor(extent, factor) - expands for zoom
 * 
 * These functions are kept for backwards compatibility but should not be used
 * for new code. Use the cached resultsExtent pattern instead.
 */

import { type DataRecordSet, DataLevel, type IntlShape } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import type { FeatureDataRecord } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Calculates the combined extent center of all records.
 */
async function getRecordsCenter(
  records: FeatureDataRecord[]
): Promise<__esri.Point | null> {
  if (!records || records.length === 0) return null
  
  const [geometryEngine, Point] = await loadArcGISJSAPIModules([
    'esri/geometry/geometryEngine',
    'esri/geometry/Point'
  ]) as [typeof __esri.geometryEngine, typeof __esri.Point]
  
  const geometries: __esri.Geometry[] = []
  
  for (const record of records) {
    const geometry = record.getGeometry()
    if (geometry) {
      geometries.push(geometry)
    }
  }
  
  if (geometries.length === 0) return null
  
  // Union all geometries and get center of the combined extent
  const unionedGeometry = geometryEngine.union(geometries)
  if (!unionedGeometry) return null
  
  const extent = unionedGeometry.extent
  if (!extent) {
    // Single point geometry
    if (unionedGeometry.type === 'point') {
      return unionedGeometry as __esri.Point
    }
    return null
  }
  
  return extent.center
}

/**
 * Pans the map to the center of the given records.
 * @deprecated Use cached resultsExtent.center instead - see module comment.
 */
export async function panToRecords(
  mapView: __esri.MapView | __esri.SceneView,
  records: FeatureDataRecord[]
): Promise<void> {
  const center = await getRecordsCenter(records)
  
  if (!center) {
    debugLogger.log('DATA-ACTION', {
      action: 'panTo-noCenter',
      message: 'Could not calculate center from records'
    })
    return
  }
  
  debugLogger.log('DATA-ACTION', {
    action: 'panTo-executing',
    center: { x: center.x, y: center.y },
    recordsCount: records.length
  })
  
  // Pan to center without changing zoom
  await mapView.goTo({
    center: center
  }, {
    animate: true,
    duration: 500
  })
}

/**
 * Handler function for pan to action - can be called directly from menu.
 * @deprecated Use cached resultsExtent.center instead - see module comment.
 */
export async function handlePanTo(
  mapView: __esri.MapView | __esri.SceneView | undefined,
  dataSets: DataRecordSet[]
): Promise<boolean> {
  if (!mapView) {
    debugLogger.log('DATA-ACTION', {
      action: 'panTo-handlePanTo',
      result: false,
      reason: 'No mapView'
    })
    return false
  }
  
  // Collect all records from all data sets
  const allRecords: FeatureDataRecord[] = []
  dataSets.forEach(dataSet => {
    if (dataSet.records && dataSet.records.length > 0) {
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
      action: 'panTo-handlePanTo',
      result: false,
      reason: 'No feature records found'
    })
    return false
  }
  
  try {
    await panToRecords(mapView, allRecords)
    
    debugLogger.log('DATA-ACTION', {
      action: 'panTo-handlePanTo',
      result: true,
      message: 'Successfully panned to features',
      recordsCount: allRecords.length
    })
    
    return true
  } catch (error) {
    debugLogger.log('DATA-ACTION', {
      action: 'panTo-handlePanTo',
      result: false,
      error: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}
