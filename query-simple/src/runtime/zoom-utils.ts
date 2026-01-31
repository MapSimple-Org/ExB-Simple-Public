/**
 * Shared zoom utilities for QuerySimple widget.
 *
 * Zooms to feature records by expanding the record extent by a factor in map
 * coordinates, then calling mapView.goTo(extent). No pixel padding is used.
 *
 * Key concepts:
 * - Expansion factor (default 1.2): multiplies half-width and half-height from
 *   the extent center, so 1.2 = 20% larger extent (10% on each side).
 * - Zero-area extents (points): expanded by a fixed buffer (e.g. 300 ft) first,
 *   then the same factor is applied.
 *
 * Full design and math: docs/technical/ZOOM_EXTENT_EXPANSION.md
 */

import type { FeatureDataRecord } from 'jimu-core'
import Extent from 'esri/geometry/Extent'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

export interface ZoomToRecordsOptions {
  /** 
   * Expansion factor for extent (default: 1.2 = 20% expansion).
   * Expands the extent by this factor in all directions before zooming.
   * More predictable than padding because it's independent of viewport size.
   * Example: 1.2 expands extent by 20% (10% on each side).
   */
  expansionFactor?: number
  /** 
   * Buffer distance in feet for zero-area extents (default: 300).
   * Applied when zooming to single points or overlapping points.
   * 
   * FUTURE: This will become configurable via widget settings to allow
   * authors to customize the zoom level for point features. See TODO.md
   * section "Configurable Point Zoom Buffer" for implementation plan.
   */
  zeroAreaBufferFeet?: number
  /** 
   * @deprecated Use expansionFactor instead. Padding is viewport-dependent and less predictable.
   */
  padding?: {
    left: number
    right: number
    top: number
    bottom: number
  }
}

// Default extent expansion factor (percentage to expand extent in all directions)
// TODO: Make this configurable per query item in widget settings
// Expansion factor: 1.2 = expand by 20% in all directions (10% on each side)
// This is more predictable than padding because it's independent of viewport size and zoom level
const DEFAULT_EXTENT_EXPANSION_FACTOR = 1.2  // 20% expansion (can be calibrated via testing)

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
 * Pure function to zoom to feature records with extent expansion.
 * 
 * Extracts geometries from records, calculates extent, expands it by a factor,
 * and zooms the map view using mapView.goTo(). Handles both single and
 * multiple geometries by calculating union extent when needed.
 * 
 * EXTENT EXPANSION (r021.124):
 * Instead of using viewport-dependent padding, the extent is expanded by a
 * percentage factor (e.g., 1.2 = 20% expansion). This is more predictable
 * because it's independent of viewport size and zoom level.
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
 * DIAGNOSTIC LOGGING (r019.24):
 * Comprehensive logging throughout operation exposes geometry types, extent
 * calculations, zero-area detection, expansion math, and final goTo parameters.
 * Filter console by [QUERYSIMPLE-ZOOM] to see complete trace.
 * 
 * @param mapView - The map view to zoom (2D or 3D)
 * @param records - Array of feature data records to zoom to
 * @param options - Optional zoom options including expansion factor and zero-area buffer distance
 * @returns Promise that resolves when zoom completes
 * 
 * @example
 * // Zoom to single point with default 300ft buffer and 20% expansion
 * await zoomToRecords(mapView, [pointRecord])
 * 
 * @example
 * // Zoom to polygon with custom expansion factor (30% expansion)
 * await zoomToRecords(mapView, [polygonRecord], {
 *   expansionFactor: 1.3
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

  const expansionFactor = options?.expansionFactor ?? DEFAULT_EXTENT_EXPANSION_FACTOR
  const zeroAreaBufferFeet = options?.zeroAreaBufferFeet || DEFAULT_ZERO_AREA_BUFFER_FEET
  // Support legacy padding option for backwards compatibility, but prefer expansionFactor
  const legacyPadding = options?.padding

  debugLogger.log('ZOOM', {
    event: 'zoom-start',
    recordsCount: records.length,
    expansionFactor,
    zeroAreaBufferFeet,
    hasLegacyPadding: !!legacyPadding,
    mapViewType: mapView.type,
    spatialReferenceWkid: mapView.spatialReference?.wkid
  })

  try {
    // r021.36: Extract ONLY extents from records, not full geometries
    // MEMORY FIX: Previously we stored both geometry + extent for each record (121-163 objects)
    // But we only ever use the extent for zoom calculation - the geometry refs were wasted memory
    // Now we only extract and store extents, letting geometry objects be GC'd immediately
    const extents = records
      .map(record => {
        const geom = record.getJSAPIGeometry()
        if (!geom) return null
        
        // For points without extent, create a zero-area extent on-the-fly
        if (geom.type === 'point' && !geom.extent) {
          const pt = geom as __esri.Point
          return new Extent({
            xmin: pt.x,
            xmax: pt.x,
            ymin: pt.y,
            ymax: pt.y,
            spatialReference: pt.spatialReference
          })
        }
        
        // For other geometry types, use existing extent
        return geom.extent || (geom as any).getExtent?.()
      })
      .filter(ext => ext != null)
    
    debugLogger.log('ZOOM', {
      event: 'extents-extracted',
      recordsCount: records.length,
      extentsCount: extents.length,
      note: 'r021.36: Only storing extents, not full geometries (memory optimization)'
    })
    
    if (extents.length === 0) {
      debugLogger.log('ZOOM', {
        event: 'zoom-early-exit',
        reason: 'no-extents',
        recordsCount: records.length
      })
      return
    }

    let extent: __esri.Extent | null = null
    
    if (extents.length === 1) {
      // Single extent - use it directly
      extent = extents[0]
      
      debugLogger.log('ZOOM', {
        event: 'extent-calculated-single',
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
      // Multiple extents - calculate union extent
      // Note: Overlapping points will produce a zero-area extent
      // which will be expanded by the zero-area detection logic below
      extent = extents[0].clone()
      for (let i = 1; i < extents.length; i++) {
        extent = extent.union(extents[i])
      }
      
      debugLogger.log('ZOOM', {
        event: 'extent-calculated-union',
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
      // Store the original extent before any expansion (for logging and calibration tool)
      const originalExtentBeforeExpansion = extent.clone()
      
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
            xmin: originalExtentBeforeExpansion.xmin,
            xmax: originalExtentBeforeExpansion.xmax,
            ymin: originalExtentBeforeExpansion.ymin,
            ymax: originalExtentBeforeExpansion.ymax,
            width: originalExtentBeforeExpansion.width,
            height: originalExtentBeforeExpansion.height
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
      
      // Extent expansion by factor (r021.124). See docs/technical/ZOOM_EXTENT_EXPANSION.md.
      // Math: new half-size = old half-size * expansionFactor; then extent = center ± new half-size.
      // Factor 1.2 = 20% larger extent (10% on each side); independent of viewport and zoom level.
      const originalExtentBeforeFactorExpansion = extent.clone()
      const centerX = (extent.xmin + extent.xmax) / 2
      const centerY = (extent.ymin + extent.ymax) / 2
      const halfWidth = extent.width / 2
      const halfHeight = extent.height / 2
      const expandedHalfWidth = halfWidth * expansionFactor
      const expandedHalfHeight = halfHeight * expansionFactor
      extent = extent.clone().set({
        xmin: centerX - expandedHalfWidth,
        xmax: centerX + expandedHalfWidth,
        ymin: centerY - expandedHalfHeight,
        ymax: centerY + expandedHalfHeight
      })
      
      debugLogger.log('ZOOM', {
        event: 'extent-expanded-by-factor',
        expansionFactor,
        originalExtent: {
          xmin: originalExtentBeforeFactorExpansion.xmin,
          xmax: originalExtentBeforeFactorExpansion.xmax,
          ymin: originalExtentBeforeFactorExpansion.ymin,
          ymax: originalExtentBeforeFactorExpansion.ymax,
          width: originalExtentBeforeFactorExpansion.width,
          height: originalExtentBeforeFactorExpansion.height
        },
        expandedExtent: {
          xmin: extent.xmin,
          xmax: extent.xmax,
          ymin: extent.ymin,
          ymax: extent.ymax,
          width: extent.width,
          height: extent.height
        },
        expansion: {
          widthExpansion: extent.width - originalExtentBeforeFactorExpansion.width,
          heightExpansion: extent.height - originalExtentBeforeFactorExpansion.height,
          widthExpansionPercent: ((extent.width / originalExtentBeforeFactorExpansion.width) - 1) * 100,
          heightExpansionPercent: ((extent.height / originalExtentBeforeFactorExpansion.height) - 1) * 100
        }
      })
      
      // Log extent coordinates before zoom (for debugging/calibration)
      debugLogger.log('ZOOM', {
        event: 'extent-coordinates-before-zoom',
        extent: {
          xmin: extent.xmin,
          xmax: extent.xmax,
          ymin: extent.ymin,
          ymax: extent.ymax,
          width: extent.width,
          height: extent.height,
          centerX: (extent.xmin + extent.xmax) / 2,
          centerY: (extent.ymin + extent.ymax) / 2,
          spatialReference: extent.spatialReference?.wkid
        },
        expansionFactor,
        note: 'Use window.__querySimpleCaptureAdjustedExtent() after manually adjusting zoom to calculate optimal expansion factor'
      })
      
      // Zoom to the expanded extent (no padding needed - extent is already expanded)
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
        expansionFactor,
        note: 'Extent expanded by factor, no padding applied'
      })
      
      const goToResult = await mapView.goTo(extent)
      
      // Log extent coordinates after zoom completes
      const finalExtent = mapView.extent
      debugLogger.log('ZOOM', {
        event: 'extent-coordinates-after-zoom',
        extent: {
          xmin: finalExtent.xmin,
          xmax: finalExtent.xmax,
          ymin: finalExtent.ymin,
          ymax: finalExtent.ymax,
          width: finalExtent.width,
          height: finalExtent.height,
          centerX: (finalExtent.xmin + finalExtent.xmax) / 2,
          centerY: (finalExtent.ymin + finalExtent.ymax) / 2,
          spatialReference: finalExtent.spatialReference?.wkid
        },
        originalExtent: {
          xmin: originalExtentBeforeExpansion.xmin,
          xmax: originalExtentBeforeExpansion.xmax,
          ymin: originalExtentBeforeExpansion.ymin,
          ymax: originalExtentBeforeExpansion.ymax,
          width: originalExtentBeforeExpansion.width,
          height: originalExtentBeforeExpansion.height
        },
        expansionFactor,
        goToResult: goToResult ? 'returned-value' : 'no-return-value',
        note: 'r021.36: Geometry refs were not stored, only extents - memory optimized'
      })
      
      // Store original extent (before any expansion) and expansion factor on window for calibration tool
      if (typeof window !== 'undefined') {
        (window as any).__querySimpleLastZoomExtent = originalExtentBeforeExpansion.clone()
        ;(window as any).__querySimpleLastZoomExpansionFactor = expansionFactor
        ;(window as any).__querySimpleLastZoomMapView = mapView
      }
      
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

/**
 * Debug/Calibration Tool: Captures current map extent and calculates optimal expansion factor.
 * 
 * Use this after manually adjusting the zoom to find the perfect extent, then calculate
 * what expansion factor would produce that extent.
 * 
 * Usage:
 * 1. Run a query that triggers auto-zoom
 * 2. Manually adjust the map zoom to your preferred extent
 * 3. In browser console, run: window.__querySimpleCaptureAdjustedExtent()
 * 4. Console will show:
 *    - Current map extent (your adjusted extent)
 *    - Original extent (before expansion was applied)
 *    - Calculated expansion factor that would produce your adjusted extent
 * 
 * @returns Object with adjusted extent, original extent, and calculated expansion factor
 */
export function captureAdjustedExtent(): {
  adjustedExtent: __esri.Extent | null
  originalExtent: __esri.Extent | null
  calculatedExpansionFactor: number | null
  error?: string
} {
  if (typeof window === 'undefined') {
    return {
      adjustedExtent: null,
      originalExtent: null,
      calculatedExpansionFactor: null,
      error: 'Window object not available'
    }
  }

  const win = window as any
  const mapView = win.__querySimpleLastZoomMapView as __esri.MapView | __esri.SceneView | undefined
  const originalExtent = win.__querySimpleLastZoomExtent as __esri.Extent | undefined
  const originalExpansionFactor = win.__querySimpleLastZoomExpansionFactor as number | undefined

  if (!mapView) {
    return {
      adjustedExtent: null,
      originalExtent: null,
      calculatedExpansionFactor: null,
      error: 'No map view found. Run a query with zoom first.'
    }
  }

  if (!originalExtent) {
    return {
      adjustedExtent: null,
      originalExtent: null,
      calculatedExpansionFactor: null,
      error: 'No original extent found. Run a query with zoom first.'
    }
  }

  const adjustedExtent = mapView.extent

  // Calculate expansion factor by comparing original extent to adjusted extent
  // Expansion factor = adjusted width / original width (or height, use average for consistency)
  const widthExpansionFactor = adjustedExtent.width / originalExtent.width
  const heightExpansionFactor = adjustedExtent.height / originalExtent.height
  const averageExpansionFactor = (widthExpansionFactor + heightExpansionFactor) / 2

  // Check if extent was expanded (factor > 1) or contracted (factor < 1)
  const wasExpanded = averageExpansionFactor > 1
  const wasContracted = averageExpansionFactor < 1

  const result = {
    adjustedExtent: {
      xmin: adjustedExtent.xmin,
      xmax: adjustedExtent.xmax,
      ymin: adjustedExtent.ymin,
      ymax: adjustedExtent.ymax,
      width: adjustedExtent.width,
      height: adjustedExtent.height,
      centerX: (adjustedExtent.xmin + adjustedExtent.xmax) / 2,
      centerY: (adjustedExtent.ymin + adjustedExtent.ymax) / 2,
      spatialReference: adjustedExtent.spatialReference?.wkid
    },
    originalExtent: {
      xmin: originalExtent.xmin,
      xmax: originalExtent.xmax,
      ymin: originalExtent.ymin,
      ymax: originalExtent.ymax,
      width: originalExtent.width,
      height: originalExtent.height,
      centerX: (originalExtent.xmin + originalExtent.xmax) / 2,
      centerY: (originalExtent.ymin + originalExtent.ymax) / 2,
      spatialReference: originalExtent.spatialReference?.wkid
    },
    originalExpansionFactor: originalExpansionFactor || null,
    calculatedExpansionFactor: wasExpanded ? averageExpansionFactor : null,
        expansion: {
          widthFactor: widthExpansionFactor,
          heightFactor: heightExpansionFactor,
          averageFactor: averageExpansionFactor,
          widthExpansion: adjustedExtent.width - originalExtent.width,
          heightExpansion: adjustedExtent.height - originalExtent.height,
          widthExpansionPercent: ((widthExpansionFactor - 1) * 100).toFixed(1) + '%',
          heightExpansionPercent: ((heightExpansionFactor - 1) * 100).toFixed(1) + '%'
        },
    warning: wasContracted 
      ? 'Adjusted extent is smaller than original - you may have zoomed in. Expansion factor calculation not meaningful.'
      : Math.abs(widthExpansionFactor - heightExpansionFactor) > 0.1
        ? 'Width and height expansion factors differ significantly - extent may not be uniformly expanded. Using average factor.'
        : null
  }

  // Log to console for easy copy-paste
  console.log('📐 QuerySimple Zoom Calibration Results:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Original Extent (before expansion):')
  console.log(`  xmin: ${originalExtent.xmin}`)
  console.log(`  xmax: ${originalExtent.xmax}`)
  console.log(`  ymin: ${originalExtent.ymin}`)
  console.log(`  ymax: ${originalExtent.ymax}`)
  console.log(`  width: ${originalExtent.width}`)
  console.log(`  height: ${originalExtent.height}`)
  console.log('')
  console.log('Adjusted Extent (your preferred zoom):')
  console.log(`  xmin: ${adjustedExtent.xmin}`)
  console.log(`  xmax: ${adjustedExtent.xmax}`)
  console.log(`  ymin: ${adjustedExtent.ymin}`)
  console.log(`  ymax: ${adjustedExtent.ymax}`)
  console.log(`  width: ${adjustedExtent.width}`)
  console.log(`  height: ${adjustedExtent.height}`)
  console.log('')
  if (calculatedExpansionFactor) {
    console.log('Calculated Expansion Factor:')
    console.log(`  width factor: ${widthExpansionFactor.toFixed(3)} (${((widthExpansionFactor - 1) * 100).toFixed(1)}% expansion)`)
    console.log(`  height factor: ${heightExpansionFactor.toFixed(3)} (${((heightExpansionFactor - 1) * 100).toFixed(1)}% expansion)`)
    console.log(`  average factor: ${averageExpansionFactor.toFixed(3)} (${((averageExpansionFactor - 1) * 100).toFixed(1)}% expansion)`)
    console.log('')
    console.log(`💡 Recommended expansion factor: ${averageExpansionFactor.toFixed(3)}`)
    if (result.warning) {
      console.log(`⚠️  ${result.warning}`)
    }
  } else {
    console.log('⚠️  Could not calculate expansion factor - adjusted extent is smaller than original')
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return result
}

// Expose calibration function to window for console access
if (typeof window !== 'undefined') {
  (window as any).__querySimpleCaptureAdjustedExtent = captureAdjustedExtent
}


