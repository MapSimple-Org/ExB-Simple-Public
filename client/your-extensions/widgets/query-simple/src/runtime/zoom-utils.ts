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
  /** 
   * Buffer distance in feet for zero-area extents (default: 300).
   * Applied when zooming to single points or overlapping points.
   * 
   * FUTURE: This will become configurable via widget settings to allow
   * authors to customize the zoom level for point features. See TODO.md
   * section "Configurable Point Zoom Buffer" for implementation plan.
   */
  zeroAreaBufferFeet?: number
}

const DEFAULT_PADDING = {
  left: 50,
  right: 50,
  top: 50,
  bottom: 50
}

/** 
 * Default buffer for single points or overlapping points (in feet).
 * This creates a 600ft x 600ft extent around point features.
 * 
 * RATIONALE: 300ft radius provides good context for parcels, addresses,
 * and similar point features without zooming too close or too far.
 */
const DEFAULT_ZERO_AREA_BUFFER_FEET = 300

/** Conversion factor: feet to meters */
const FEET_TO_METERS = 0.3048

/**
 * Determines if the spatial reference uses meters (Web Mercator or other metric systems).
 * 
 * This is critical for applying the correct buffer distance to zero-area extents.
 * Different coordinate systems use different units:
 * - Web Mercator (3857, 102100): Meters
 * - WGS84 Geographic (4326): Degrees (treated as metric for buffer calculation)
 * - State Plane zones (2225-2284): Feet
 * 
 * @param spatialReference - The spatial reference to check
 * @returns true if the spatial reference uses meters, false if feet-based
 */
function isMetricSpatialReference(spatialReference: __esri.SpatialReference): boolean {
  // Web Mercator (most common): 3857 or 102100
  if (spatialReference.wkid === 3857 || spatialReference.wkid === 102100) {
    return true
  }
  
  // WGS84 Geographic (degrees, but treat as metric for buffer calculation)
  if (spatialReference.wkid === 4326) {
    return true
  }
  
  // For other spatial references, check the unit property if available
  // Most State Plane zones use feet (WKID 2227-2284, 2285-2287, etc.)
  // But this is a heuristic - ideally we'd check the actual unit
  const wkid = spatialReference.wkid
  
  // Common US State Plane zones in feet (partial list)
  // California zones: 2225-2235 (feet), 2229 (feet)
  // This is not exhaustive, but covers common cases
  if (wkid >= 2225 && wkid <= 2284) {
    return false // Likely feet-based State Plane
  }
  
  // Default to metric if uncertain
  return true
}

/**
 * Expands a zero-area extent by a buffer distance.
 * Creates a new extent with the center point buffered by the specified distance.
 * 
 * This handles the case where:
 * - A single point feature is selected (extent.width = 0, extent.height = 0)
 * - Multiple overlapping points are selected (union extent still has zero area)
 * 
 * Without this expansion, mapView.goTo() would zoom to an unusable scale.
 * 
 * @param extent - The zero-area extent to expand
 * @param bufferDistance - The distance to buffer in the spatial reference's units
 * @returns A new extent expanded by the buffer distance in all directions
 */
function expandZeroAreaExtent(extent: __esri.Extent, bufferDistance: number): __esri.Extent {
  const centerX = (extent.xmin + extent.xmax) / 2
  const centerY = (extent.ymin + extent.ymax) / 2
  
  return extent.clone().set({
    xmin: centerX - bufferDistance,
    xmax: centerX + bufferDistance,
    ymin: centerY - bufferDistance,
    ymax: centerY + bufferDistance
  })
}

/**
 * Pure function to zoom to feature records with padding.
 * 
 * Extracts geometries from records, calculates extent, and zooms the map view
 * using mapView.goTo() with configurable padding. Handles both single and
 * multiple geometries by calculating union extent when needed.
 * 
 * ZERO-AREA EXTENT HANDLING (r019.23):
 * When zooming to single points or overlapping points, the calculated extent
 * will have zero width/height. This function detects this condition and
 * expands the extent by 300 feet (default) in all directions to provide
 * useful context. The buffer distance is automatically converted to the
 * correct units based on the map's spatial reference:
 * - Web Mercator (3857/102100): Converts 300 feet → ~91.44 meters
 * - State Plane (feet-based): Uses 300 feet directly
 * 
 * This approach maintains the extent-based zoom strategy, ensuring the
 * padding from ZoomToRecordsOptions is still respected during mapView.goTo().
 * 
 * @param mapView - The map view to zoom
 * @param records - Array of feature data records to zoom to
 * @param options - Optional zoom options including padding and zero-area buffer
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
  const zeroAreaBufferFeet = options?.zeroAreaBufferFeet || DEFAULT_ZERO_AREA_BUFFER_FEET

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
      // Note: Point geometries will have zero-area extents (width=0, height=0)
      // which will be expanded by the zero-area detection logic below
      extent = geometries[0].extent || (geometries[0] as any).getExtent?.()
    } else {
      // Multiple geometries - calculate union extent
      // Note: Overlapping points will produce a zero-area extent
      // which will be expanded by the zero-area detection logic below
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
      // Check for zero-area extent (single point or overlapping points)
      // This condition triggers when extent.width === 0 OR extent.height === 0
      const isZeroArea = extent.width === 0 || extent.height === 0
      
      if (isZeroArea) {
        // Determine buffer distance based on spatial reference
        // Web Mercator uses meters, State Plane typically uses feet
        const isMetric = isMetricSpatialReference(mapView.spatialReference)
        const bufferDistance = isMetric 
          ? zeroAreaBufferFeet * FEET_TO_METERS  // Convert feet to meters (~91.44m for 300ft)
          : zeroAreaBufferFeet                    // Use feet directly
        
        // Expand the extent by the buffer distance in all directions
        // This creates a square extent centered on the point(s)
        extent = expandZeroAreaExtent(extent, bufferDistance)
        
        debugLogger.log('ZOOM', {
          event: 'zero-area-extent-expanded',
          recordsCount: records.length,
          bufferFeet: zeroAreaBufferFeet,
          bufferDistance: bufferDistance,
          spatialReferenceWkid: mapView.spatialReference.wkid,
          isMetric: isMetric,
          expandedExtent: {
            xmin: extent.xmin,
            xmax: extent.xmax,
            ymin: extent.ymin,
            ymax: extent.ymax,
            width: extent.width,
            height: extent.height
          }
        })
      }
      
      // Zoom to the extent with padding
      // The padding from options is applied here, in addition to any zero-area expansion
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





