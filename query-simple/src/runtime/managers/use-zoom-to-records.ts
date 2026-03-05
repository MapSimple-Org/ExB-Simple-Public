/**
 * Hook for zooming to feature records with extent expansion.
 *
 * Wraps zoomToRecords from zoom-utils. Pass options.expansionFactor to control
 * how much the extent is expanded (default 1.2 = 20%). See docs/technical/ZOOM_EXTENT_EXPANSION.md.
 */

import React from 'react'
import type { FeatureDataRecord } from 'jimu-core'
import { zoomToRecords, type ZoomToRecordsOptions } from '../zoom-utils'

/**
 * Returns a function that zooms the map to the given records.
 * Options (e.g. expansionFactor) are passed through to zoomToRecords.
 */
export function useZoomToRecords(
  mapView?: __esri.MapView | __esri.SceneView
): (records: FeatureDataRecord[], options?: ZoomToRecordsOptions) => Promise<void> {
  
  return React.useCallback(async (
    records: FeatureDataRecord[],
    options?: ZoomToRecordsOptions
  ): Promise<void> => {
    if (!mapView) {
      return
    }
    await zoomToRecords(mapView, records, options)
  }, [mapView])
}

// Re-export types for convenience
export type { ZoomToRecordsOptions } from '../zoom-utils'

