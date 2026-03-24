/**
 * Hook for zooming to feature records with extent expansion.
 *
 * Wraps zoomToRecords from zoom-utils. Pass options.expansionFactor to control
 * how much the extent is expanded (default 1.2 = 20%). See docs/technical/ZOOM_EXTENT_EXPANSION.md.
 *
 * r025.059: Added widgetId param to auto-inject pointZoomBufferFeet from
 * HighlightConfigManager when no explicit zeroAreaBufferFeet override is passed.
 */

import React from 'react'
import type { FeatureDataRecord } from 'jimu-core'
import { zoomToRecords, panToRecords, type ZoomToRecordsOptions } from '../zoom-utils'
import { highlightConfigManager } from 'widgets/shared-code/mapsimple-common'

/**
 * Returns a function that zooms the map to the given records.
 * Options (e.g. expansionFactor) are passed through to zoomToRecords.
 *
 * When widgetId is provided, the configured pointZoomBufferFeet is automatically
 * injected as zeroAreaBufferFeet (unless explicitly overridden in options).
 */
export function useZoomToRecords(
  mapView?: __esri.MapView | __esri.SceneView,
  widgetId?: string
): (records: FeatureDataRecord[], options?: ZoomToRecordsOptions) => Promise<void> {

  return React.useCallback(async (
    records: FeatureDataRecord[],
    options?: ZoomToRecordsOptions
  ): Promise<void> => {
    if (!mapView) {
      return
    }
    // r025.059: Auto-inject point zoom buffer from widget config
    // r025.068: Auto-inject zoom expansion factor from widget config
    const mergedOptions = { ...options }
    if (widgetId && mergedOptions.zeroAreaBufferFeet === undefined) {
      mergedOptions.zeroAreaBufferFeet = highlightConfigManager.getPointZoomBufferFeet(widgetId)
    }
    if (widgetId && mergedOptions.expansionFactor === undefined) {
      mergedOptions.expansionFactor = highlightConfigManager.getZoomExpansionFactor(widgetId)
    }
    await zoomToRecords(mapView, records, mergedOptions)
  }, [mapView, widgetId])
}

/**
 * r026.009: Hook for panning (centering) to feature records without changing zoom.
 * Mirrors useZoomToRecords pattern but calls panToRecords instead.
 */
export function usePanToRecords(
  mapView?: __esri.MapView | __esri.SceneView
): (records: FeatureDataRecord[]) => Promise<void> {

  return React.useCallback(async (
    records: FeatureDataRecord[]
  ): Promise<void> => {
    if (!mapView) return
    await panToRecords(mapView, records)
  }, [mapView])
}

// Re-export types for convenience
export type { ZoomToRecordsOptions } from '../zoom-utils'
