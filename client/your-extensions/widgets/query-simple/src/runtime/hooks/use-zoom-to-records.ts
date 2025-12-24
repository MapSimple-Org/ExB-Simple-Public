/**
 * Hook for zooming to feature records with padding.
 * 
 * Wraps the shared zoomToRecords utility function in a React hook.
 */

import React from 'react'
import type { FeatureDataRecord } from 'jimu-core'
import { zoomToRecords, type ZoomToRecordsOptions } from '../zoom-utils'

/**
 * Custom hook that returns a function to zoom to records with padding.
 * 
 * @param mapView - The map view to zoom
 * @returns A function that takes records and optional padding, and zooms to them
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

