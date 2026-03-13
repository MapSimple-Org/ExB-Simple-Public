/**
 * useBufferPreview — Real-time geodesic buffer preview on the map.
 *
 * r025.009: Created for Spatial tab buffer distance preview.
 * r025.015: Buffer layer added INSIDE GroupLayer (when available) for inherited
 *           visibility on LayerList toggle. Falls back to map-level for highlight mode.
 * r025.020: Panel close/reopen handled imperatively via GraphicsStateManager
 *           (clearSelectionFromMap clears, addSelectionToMap restores stored graphic).
 *           React effects handle initial compute, input changes, and unmount only.
 *
 * Creates a dedicated GraphicsLayer (`querysimple-buffer-{widgetId}`) that
 * renders a semi-transparent buffer polygon around the input geometry.
 * Updates in real-time (debounced 300ms) as the user changes distance or unit.
 *
 * Buffer operator selection follows the same three-case pattern as
 * geometry-from-draw.tsx:63-129:
 *   - WGS84/WebMercator → geodesicBufferOperator
 *   - Geographic non-WGS84 → geometryService (server-side)
 *   - Other projections → bufferOperator
 *
 * Related:
 *   - Requirements: docs/development/SPATIAL_TAB_REQUIREMENTS.md (Buffer Preview section)
 *   - Flow: docs/process-flows/FLOW-09-BUFFER-PREVIEW.md
 *   - Precedent: geometry-from-draw.tsx (applyBufferEffect)
 */
import { React, lodash, loadArcGISJSAPIModule, utils } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger, highlightConfigManager } from 'widgets/shared-code/mapsimple-common'
import { graphicsStateManager } from '../graphics-state-manager'

const debugLogger = createQuerySimpleDebugLogger()

export interface UseBufferPreviewOptions {
  mapView?: __esri.MapView | __esri.SceneView
  widgetId: string
  /** r025.041: Changed from single geometry to array to support mixed geometry types.
   *  Each geometry is buffered individually; results are unioned into a single polygon. */
  inputGeometries: __esri.Geometry[]
  bufferDistance: number
  bufferUnit: string
  enabled: boolean
}

// r025.051: Buffer symbol built dynamically from configurable color (via singleton)
function buildBufferSymbol (widgetId: string) {
  const rgb = highlightConfigManager.getBufferColor(widgetId)
  return {
    type: 'simple-fill' as const,
    color: [...rgb, 0.25],
    style: 'solid' as const,
    outline: {
      color: [...rgb, 0.8],
      width: 1.5
    }
  }
}

const LAYER_ID_PREFIX = 'querysimple-buffer-'

export function useBufferPreview (options: UseBufferPreviewOptions): __esri.Geometry | null {
  const { mapView, widgetId, inputGeometries, bufferDistance, bufferUnit, enabled } = options

  // Refs for lazy-loaded modules (same pattern as geometry-from-draw.tsx:29-31)
  const bufferLayerRef = React.useRef<__esri.GraphicsLayer | null>(null)
  const graphicRef = React.useRef<__esri.Graphic | null>(null)
  const bufferOperatorRef = React.useRef<__esri.bufferOperator | null>(null)
  const geodesicBufferOperatorRef = React.useRef<__esri.geodesicBufferOperator | null>(null)
  const geometryServiceRef = React.useRef<{
    geometryService: __esri.geometryService
    bufferParameters: typeof __esri.BufferParameters
  } | null>(null)
  const GraphicClassRef = React.useRef<typeof __esri.Graphic | null>(null)

  // r025.035: Expose buffered geometry for spatial queries to use as query.geometry
  const [bufferedGeometry, setBufferedGeometry] = React.useState<__esri.Geometry | null>(null)

  // ── Layer lifecycle: create on first enable, destroy on unmount ──

  React.useEffect(() => {
    if (!mapView || !enabled) return

    let cancelled = false

    const initLayer = async () => {
      if (bufferLayerRef.current) return // Already created

      const [GraphicsLayer, Graphic] = await loadArcGISJSAPIModules([
        'esri/layers/GraphicsLayer',
        'esri/Graphic'
      ])

      if (cancelled) return

      GraphicClassRef.current = Graphic
      const layerId = `${LAYER_ID_PREFIX}${widgetId}`

      // Check if layer already exists (e.g., fast remount)
      const existing = mapView.map.findLayerById(layerId) as __esri.GraphicsLayer
      if (existing) {
        bufferLayerRef.current = existing
        return
      }

      const layer = new GraphicsLayer({
        id: layerId,
        title: 'Buffer Preview',
        listMode: 'hide',
        visible: true
      })

      // r025.015: Add buffer layer INSIDE GroupLayer when available.
      // With visibilityMode:'inherited', toggling the GroupLayer in LayerList
      // automatically hides/shows the buffer — no external watcher needed.
      // Falls back to map-level for GraphicsLayer (highlight) mode.
      const groupLayerId = `querysimple-results-${widgetId}`
      const groupLayer = mapView.map.findLayerById(groupLayerId) as __esri.GroupLayer
      let addedToGroupLayer = false

      if (groupLayer && groupLayer.type === 'group') {
        groupLayer.add(layer)
        addedToGroupLayer = true
      } else {
        mapView.map.add(layer)
      }

      bufferLayerRef.current = layer

      debugLogger.log('TASK', {
        event: 'buffer-preview-layer-created',
        layerId,
        widgetId,
        addedToGroupLayer,
        parentLayerId: addedToGroupLayer ? groupLayerId : 'map'
      })
    }

    initLayer()

    return () => {
      cancelled = true
    }
  }, [mapView, widgetId, enabled])

  // ── Debounced buffer calculation ──

  // r025.041: Buffer a single geometry using the appropriate operator for its SR
  const bufferSingle = React.useCallback(async (
    geometry: __esri.Geometry,
    distance: number,
    unit: string
  ): Promise<__esri.Polygon | null> => {
    const kebabUnit = lodash.kebabCase(unit) as any
    const sr = geometry.spatialReference

    if (sr?.isGeographic && !sr.isWGS84) {
      // Case 1: Geographic non-WGS84 → server-side geometry service
      const serviceUrl = utils.getGeometryService()
      if (!geometryServiceRef.current) {
        const modules = await loadArcGISJSAPIModules([
          'esri/rest/geometryService',
          'esri/rest/support/BufferParameters'
        ])
        geometryServiceRef.current = {
          geometryService: modules[0],
          bufferParameters: modules[1]
        }
      }
      const { geometryService, bufferParameters: BufferParameters } = geometryServiceRef.current
      const polygons = await geometryService.buffer(serviceUrl, new BufferParameters({
        distances: [distance],
        unit: kebabUnit,
        geodesic: true,
        bufferSpatialReference: sr,
        outSpatialReference: sr,
        geometries: [geometry]
      }))
      return polygons[0] as __esri.Polygon
    } else if (sr?.isWGS84 || sr?.isWebMercator) {
      // Case 2: WGS84/WebMercator → geodesicBufferOperator
      if (!geodesicBufferOperatorRef.current) {
        geodesicBufferOperatorRef.current = await loadArcGISJSAPIModule(
          'esri/geometry/operators/geodesicBufferOperator'
        )
      }
      if (!geodesicBufferOperatorRef.current.isLoaded()) {
        await geodesicBufferOperatorRef.current.load()
      }
      return geodesicBufferOperatorRef.current.execute(
        geometry as __esri.GeometryUnion,
        distance,
        { unit: kebabUnit }
      ) as __esri.Polygon
    } else {
      // Case 3: Other projections → bufferOperator
      if (!bufferOperatorRef.current) {
        bufferOperatorRef.current = await loadArcGISJSAPIModule(
          'esri/geometry/operators/bufferOperator'
        )
      }
      return bufferOperatorRef.current.execute(
        geometry as __esri.GeometryUnion,
        distance,
        { unit: kebabUnit }
      ) as __esri.Polygon
    }
  }, [])

  // r025.041: Lazy-load union operator ref (for combining buffer polygons from mixed types)
  const unionOperatorRef = React.useRef<__esri.unionOperator | null>(null)

  const computeBuffer = React.useCallback(async (
    geometries: __esri.Geometry[],
    distance: number,
    unit: string
  ) => {
    if (!bufferLayerRef.current || !GraphicClassRef.current) return

    const layer = bufferLayerRef.current
    const Graphic = GraphicClassRef.current

    // Clear previous buffer
    layer.removeAll()
    graphicRef.current = null

    if (!geometries || geometries.length === 0 || distance === 0) return

    try {
      // r025.041: Buffer each geometry individually to support mixed types
      const bufferPolygons: __esri.Polygon[] = []
      for (const geometry of geometries) {
        const buffered = await bufferSingle(geometry, distance, unit)
        if (buffered) bufferPolygons.push(buffered)
      }

      if (bufferPolygons.length === 0 || !bufferLayerRef.current) return

      // Combine buffer polygons: single → use directly, multiple → union (all polygons, safe)
      let combinedBuffer: __esri.Polygon
      if (bufferPolygons.length === 1) {
        combinedBuffer = bufferPolygons[0]
      } else {
        if (!unionOperatorRef.current) {
          unionOperatorRef.current = await loadArcGISJSAPIModule(
            'esri/geometry/operators/unionOperator'
          )
        }
        combinedBuffer = unionOperatorRef.current.executeMany(bufferPolygons) as __esri.Polygon
      }

      const graphic = new Graphic({
        geometry: combinedBuffer,
        symbol: buildBufferSymbol(widgetId)
      })

      layer.removeAll() // Clear any stale graphics from race conditions
      layer.add(graphic)
      graphicRef.current = graphic
      graphicsStateManager.setLastBufferGraphic(widgetId, graphic)
      setBufferedGeometry(combinedBuffer)

      // r025.066: Auto-enable parent GroupLayer visibility when buffer is drawn
      // Matches addHighlightGraphics pattern (graphics-layer-utils.ts r024.18)
      const parentLayer = layer.parent as __esri.GroupLayer
      if (parentLayer && parentLayer.type === 'group' && !parentLayer.visible) {
        parentLayer.visible = true
        debugLogger.log('TASK', {
          event: 'buffer-preview-auto-enabled-parent',
          widgetId,
          groupLayerId: parentLayer.id,
          reason: 'parent-was-hidden-but-buffer-drawn'
        })
      }

      const geomTypes = [...new Set(geometries.map(g => g.type))]
      debugLogger.log('TASK', {
        event: 'buffer-preview-updated',
        distance,
        unit,
        geometryCount: geometries.length,
        geometryTypes: geomTypes,
        mixedTypes: geomTypes.length > 1,
        srCase: geometries[0].spatialReference?.isWGS84 || geometries[0].spatialReference?.isWebMercator
          ? 'geodesic'
          : geometries[0].spatialReference?.isGeographic ? 'geometry-service' : 'planar'
      })
    } catch (error) {
      debugLogger.log('TASK', {
        event: 'buffer-preview-error',
        error: error?.toString(),
        distance,
        unit,
        geometryCount: geometries?.length,
        geometryTypes: geometries?.map(g => g?.type)
      })
    }
  }, [bufferSingle])

  // Debounced version (300ms)
  const debouncedComputeBuffer = React.useMemo(
    () => lodash.debounce(
      (geometries: __esri.Geometry[], distance: number, unit: string) => {
        computeBuffer(geometries, distance, unit)
      },
      300
    ),
    [computeBuffer]
  )

  // Cancel debounce on unmount
  React.useEffect(() => {
    return () => { debouncedComputeBuffer.cancel() }
  }, [debouncedComputeBuffer])

  // ── Unmount-only cleanup: destroy buffer layer as safety net ──
  // r025.015: When the component fully unmounts, remove and destroy the buffer
  // layer regardless of whether the cleanup utilities have already handled it.
  // Guards against double-destroy with the `destroyed` check.
  React.useEffect(() => {
    return () => {
      if (bufferLayerRef.current && !(bufferLayerRef.current as any).destroyed) {
        const layer = bufferLayerRef.current
        const layerId = layer.id

        layer.removeAll()

        // Remove from parent (GroupLayer or Map)
        const parent = layer.parent as any
        if (parent && typeof parent.remove === 'function') {
          parent.remove(layer)
        }

        layer.destroy()
        bufferLayerRef.current = null
        graphicRef.current = null
        // r025.057: Clear stored graphic on unmount too
        graphicsStateManager.deleteLastBufferGraphic(widgetId)

        debugLogger.log('TASK', {
          event: 'buffer-preview-layer-unmount-cleanup',
          layerId,
          widgetId,
          timestamp: Date.now()
        })
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- unmount-only

  // ── Trigger buffer update on input changes ──

  React.useEffect(() => {
    if (!enabled || !inputGeometries || inputGeometries.length === 0 || bufferDistance === 0) {
      // Clear buffer if disabled or no valid input
      setBufferedGeometry(null)
      // r025.057: Clear stored buffer graphic so selection-restoration-manager
      // doesn't restore a stale buffer on widget close/reopen
      graphicsStateManager.deleteLastBufferGraphic(widgetId)
      if (bufferLayerRef.current) {
        const hadGraphics = bufferLayerRef.current.graphics?.length > 0
        bufferLayerRef.current.removeAll()
        graphicRef.current = null

        if (hadGraphics) {
          debugLogger.log('TASK', {
            event: 'buffer-preview-cleared',
            widgetId,
            reason: !enabled ? 'disabled' : (!inputGeometries || inputGeometries.length === 0) ? 'no-geometry' : 'distance-zero',
            enabled,
            geometryCount: inputGeometries?.length || 0,
            bufferDistance,
            timestamp: Date.now()
          })
        }
      }
      return
    }

    debouncedComputeBuffer(inputGeometries, bufferDistance, bufferUnit)
  }, [enabled, inputGeometries, bufferDistance, bufferUnit, debouncedComputeBuffer])

  return bufferedGeometry
}
