/**
 * Shared zoom utilities for QuerySimple widget.
 * 
 * Provides pure functions for zooming to feature records that can be used
 * by both React hooks and data actions.
 */

import type { FeatureDataRecord } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

export interface ZoomToRecordsOptions {
  padding?: {
    left: number
    right: number
    top: number
    bottom: number
  }
}

const DEFAULT_PADDING = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 50
}

/**
 * Pure function to zoom to feature records with padding.
 * 
 * Extracts geometries from records, calculates extent, and zooms the map view
 * using mapView.goTo() with configurable padding. Handles both single and
 * multiple geometries by calculating union extent when needed.
 * 
 * @param mapView - The map view to zoom
 * @param records - Array of feature data records to zoom to
 * @param options - Optional zoom options including padding
 * @returns Promise that resolves when zoom completes
 */
export async function zoomToRecords(
  mapView: __esri.MapView | __esri.SceneView,
  records: FeatureDataRecord[],
  options?: ZoomToRecordsOptions
): Promise<void> {
  if (!mapView || !records || records.length === 0) {
    return
  }

  const padding = options?.padding || DEFAULT_PADDING

  try {
    // Extract geometries from records
    const geometries = records
      .map(record => record.getJSAPIGeometry())
      .filter(geom => geom != null)
    
    if (geometries.length === 0) {
      return
    }

    let extent: __esri.Extent | null = null
    
    if (geometries.length === 1) {
      // Single geometry - get its extent
      extent = geometries[0].extent || (geometries[0] as any).getExtent?.()
    } else {
      // Multiple geometries - calculate union extent
      const extents = geometries
        .map(geom => geom.extent || (geom as any).getExtent?.())
        .filter(e => e != null)
      
      if (extents.length > 0) {
        extent = extents[0].clone()
        for (let i = 1; i < extents.length; i++) {
          extent = extent.union(extents[i])
        }
      }
    }
    
    if (extent) {
      await mapView.goTo(extent, { padding })
    }
  } catch (error) {
    debugLogger.log('ZOOM', {
      event: 'zoom-goTo-error',
      error: error instanceof Error ? error.message : String(error),
      recordsCount: records.length
    })
    throw error
  }
}





