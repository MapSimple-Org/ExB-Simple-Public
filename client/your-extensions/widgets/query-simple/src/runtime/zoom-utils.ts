/**
 * Shared zoom utilities for QuerySimple widget.
 * 
 * Provides pure functions for zooming to feature records that can be used
 * by both React hooks and data actions.
 */

import type { FeatureDataRecord } from 'jimu-core'
import Extent from 'esri/geometry/Extent'
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
 * GEOMETRY NORMALIZATION (r019.28):
 * Point geometries are normalized upstream (in query-task.tsx) to include
 * .extent property. This ensures all geometry types (points, multipoints,
 * polygons, polylines) have a consistent interface.
 * 
 * ZERO-AREA EXTENT HANDLING (r019.23-r019.28):
 * When zooming to single points or overlapping points, the calculated extent
 * will have zero width/height. This function detects this condition and
 * expands the extent by 300 feet (default) in all directions to provide
 * useful context. The buffer distance is automatically converted to the
 * correct units based on the map's spatial reference:
 * - Web Mercator (3857/102100): Converts 300 feet → ~91.44 meters
 * - State Plane (feet-based): Uses 300 feet directly
 * 
 * GEOMETRY TYPE SUPPORT:
 * - Single Points (point): Uses normalized .extent → Zero-area expansion applied
 * - Multipoints (multipoint): Uses native .extent → Zero-area expansion if overlapping
 * - Polygons/Polylines: Uses native .extent → Expansion only if degenerate
 * 
 * This approach maintains the extent-based zoom strategy, ensuring the
 * padding from ZoomToRecordsOptions is still respected during mapView.goTo().
 * 
 * DIAGNOSTIC LOGGING (r019.24):
 * Comprehensive logging throughout operation exposes geometry types, extent
 * calculations, zero-area detection, expansion math, and final goTo parameters.
 * Filter console by [QUERYSIMPLE-ZOOM] to see complete trace.
 * 
 * @param mapView - The map view to zoom (2D or 3D)
 * @param records - Array of feature data records to zoom to
 * @param options - Optional zoom options including padding and zero-area buffer distance
 * @returns Promise that resolves when zoom completes
 * 
 * @example
 * // Zoom to single point with default 300ft buffer
 * await zoomToRecords(mapView, [pointRecord])
 * 
 * @example
 * // Zoom to polygon with custom padding
 * await zoomToRecords(mapView, [polygonRecord], {
 *   padding: { left: 100, right: 100, top: 100, bottom: 100 }
 * })
 * 
 * @example
 * // Zoom to point with custom buffer (500ft instead of 300ft)
 * await zoomToRecords(mapView, [pointRecord], {
 *   zeroAreaBufferFeet: 500
 * })
 */
export async function zoomToRecords(
  mapView: __esri.MapView | __esri.SceneView,
  records: FeatureDataRecord[],
  options?: ZoomToRecordsOptions
): Promise<void> {
  if (!mapView || !records || records.length === 0) {
    debugLogger.log('ZOOM', {
      event: 'zoom-early-exit',
      reason: !mapView ? 'no-mapView' : 'no-records',
      recordsCount: records?.length || 0
    })
    return
  }

  const padding = options?.padding || DEFAULT_PADDING
  const zeroAreaBufferFeet = options?.zeroAreaBufferFeet || DEFAULT_ZERO_AREA_BUFFER_FEET

  debugLogger.log('ZOOM', {
    event: 'zoom-start',
    recordsCount: records.length,
    padding,
    zeroAreaBufferFeet,
    mapViewType: mapView.type,
    spatialReferenceWkid: mapView.spatialReference?.wkid
  })

  try {
    // Extract geometries from records and calculate extents on-the-fly
    // Note: Point geometries in ArcGIS JS API have read-only .extent property (always null)
    // We create extent objects on-the-fly for points to avoid mutation errors
    const geometryData = records
      .map(record => {
        const geom = record.getJSAPIGeometry()
        if (!geom) return null
        
        // For points without extent, create a zero-area extent on-the-fly
        if (geom.type === 'point' && !geom.extent) {
          const pt = geom as __esri.Point
          return {
            geometry: geom,
            extent: new Extent({
              xmin: pt.x,
              xmax: pt.x,
              ymin: pt.y,
              ymax: pt.y,
              spatialReference: pt.spatialReference
            })
          }
        }
        
        // For other geometry types, use existing extent
        return {
          geometry: geom,
          extent: geom.extent || (geom as any).getExtent?.()
        }
      })
      .filter(item => item != null)
    
    debugLogger.log('ZOOM', {
      event: 'geometries-extracted',
      recordsCount: records.length,
      geometriesCount: geometryData.length,
      geometryTypes: geometryData.map(item => item.geometry.type)
    })
    
    if (geometryData.length === 0) {
      debugLogger.log('ZOOM', {
        event: 'zoom-early-exit',
        reason: 'no-geometries',
        recordsCount: records.length
      })
      return
    }

    let extent: __esri.Extent | null = null
    
    if (geometryData.length === 1) {
      // Single geometry - use the calculated extent
      const item = geometryData[0]
      extent = item.extent
      
      debugLogger.log('ZOOM', {
        event: 'extent-calculated-single',
        geometryType: item.geometry.type,
        originalExtent: extent ? {
          xmin: extent.xmin,
          xmax: extent.xmax,
          ymin: extent.ymin,
          ymax: extent.ymax,
          width: extent.width,
          height: extent.height,
          spatialReference: extent.spatialReference?.wkid
        } : null
      })
    } else {
      // Multiple geometries - calculate union extent
      // Note: Overlapping points will produce a zero-area extent
      // which will be expanded by the zero-area detection logic below
      const extents = geometryData
        .map(item => item.extent)
        .filter(e => e != null)
      
      if (extents.length > 0) {
        extent = extents[0].clone()
        for (let i = 1; i < extents.length; i++) {
          extent = extent.union(extents[i])
        }
      }
      
      debugLogger.log('ZOOM', {
        event: 'extent-calculated-union',
        geometriesCount: geometryData.length,
        extentsCount: extents.length,
        originalExtent: extent ? {
          xmin: extent.xmin,
          xmax: extent.xmax,
          ymin: extent.ymin,
          ymax: extent.ymax,
          width: extent.width,
          height: extent.height,
          spatialReference: extent.spatialReference?.wkid
        } : null
      })
    }
    
    if (extent) {
      // Check for zero-area extent (single point or overlapping points)
      // This condition triggers when extent.width === 0 OR extent.height === 0
      const isZeroArea = extent.width === 0 || extent.height === 0
      
      debugLogger.log('ZOOM', {
        event: 'zero-area-check',
        isZeroArea,
        extentWidth: extent.width,
        extentHeight: extent.height
      })
      
      if (isZeroArea) {
        // Determine buffer distance based on spatial reference
        // Web Mercator uses meters, State Plane typically uses feet
        const isMetric = isMetricSpatialReference(mapView.spatialReference)
        const bufferDistance = isMetric 
          ? zeroAreaBufferFeet * FEET_TO_METERS  // Convert feet to meters (~91.44m for 300ft)
          : zeroAreaBufferFeet                    // Use feet directly
        
        const originalExtent = extent.clone()
        
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
          originalExtent: {
            xmin: originalExtent.xmin,
            xmax: originalExtent.xmax,
            ymin: originalExtent.ymin,
            ymax: originalExtent.ymax,
            width: originalExtent.width,
            height: originalExtent.height
          },
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
      debugLogger.log('ZOOM', {
        event: 'calling-mapView-goTo',
        finalExtent: {
          xmin: extent.xmin,
          xmax: extent.xmax,
          ymin: extent.ymin,
          ymax: extent.ymax,
          width: extent.width,
          height: extent.height,
          spatialReference: extent.spatialReference?.wkid
        },
        padding
      })
      
      const goToResult = await mapView.goTo(extent, { padding })
      
      debugLogger.log('ZOOM', {
        event: 'mapView-goTo-complete',
        success: true,
        goToResult: goToResult ? 'returned-value' : 'no-return-value'
      })
    } else {
      debugLogger.log('ZOOM', {
        event: 'zoom-skipped',
        reason: 'no-extent-calculated'
      })
    }
  } catch (error) {
    debugLogger.log('ZOOM', {
      event: 'zoom-goTo-error',
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      recordsCount: records.length
    })
    throw error
  }
}





