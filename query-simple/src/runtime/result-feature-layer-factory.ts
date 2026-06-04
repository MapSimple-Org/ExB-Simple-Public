/**
 * Factory for creating client-side FeatureLayers that hold query results.
 *
 * Path 3 (v28): Results are stored as real features in per-geometry-type
 * FeatureLayers inside a GroupLayer. This gives us popup/identify, native
 * legend, and LayerList integration without touching the existing
 * GraphicsLayer code (Paths 1 and 2).
 *
 * Each FeatureLayer uses a lean 4-field schema. Full attribute data lives
 * in accumulated records and is joined back at popup render time via
 * COMPOSITE_KEY.
 */

import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger, widgetConfigManager } from 'widgets/shared-code/mapsimple-common'
import { buildResultPopupTemplate } from './result-feature-layer-popup'
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import type GroupLayer from '@arcgis/core/layers/GroupLayer'
import type MapView from '@arcgis/core/views/MapView'

const debugLogger = createQuerySimpleDebugLogger()

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Layer ID prefix for Path 3 GroupLayer. Distinct from Path 2's 'querysimple-results-'. */
const GROUP_LAYER_ID_PREFIX = 'querysimple-fl-'

/**
 * r028.082: Per-widget visibility watch handles for popup-close-on-toggle behavior.
 * Set in createResultGroupLayer, removed in destroyResultLayers.
 * Mirrors Path 2's mapView watcher (graphics-layer-utils.ts:435-462, r024.59).
 */
const _visibilityWatchHandles = new Map<string, { remove: () => void }>()

/**
 * r028.084: In-flight FeatureLayer creation Promises, keyed by full layer ID
 * (widgetId + geometryType). When two concurrent calls race for the same
 * key, the second awaits the first's Promise instead of starting a duplicate
 * creation. Cleaned up via try/finally after the Promise settles.
 * Mirrors Path 2's graphicsStateManager.setGraphicsLayerCreation pattern (r024.17).
 */
const _creationsInFlight = new Map<string, Promise<FeatureLayer>>()

/** Geometry type buckets. JSAPI FeatureLayer accepts exactly one geometryType. */
export type NormalizedGeometryType = 'point' | 'polyline' | 'polygon'

/** The lean field schema shared by every result FeatureLayer. */
const RESULT_FIELDS = [
  { name: 'OBJECTID', type: 'oid' as const },
  { name: 'RECORD_ID', type: 'string' as const, alias: 'Record ID' },
  { name: 'QUERY_CONFIG_ID', type: 'string' as const, alias: 'Query Config ID' },
  { name: 'COMPOSITE_KEY', type: 'string' as const, alias: 'Composite Key' }
]

// Module caches (loaded once via loadArcGISJSAPIModules)
let _FeatureLayerCtor: any = null
let _GroupLayerCtor: any = null

// ---------------------------------------------------------------------------
// Geometry normalization
// ---------------------------------------------------------------------------

/**
 * Collapse JSAPI geometry types into our three FeatureLayer buckets.
 * multipoint -> point, everything else that isn't polyline -> polygon.
 */
export function normalizeGeometryType (geometryType: string): NormalizedGeometryType {
  if (geometryType === 'point' || geometryType === 'multipoint') return 'point'
  if (geometryType === 'polyline') return 'polyline'
  return 'polygon'
}

// ---------------------------------------------------------------------------
// Layer ID helpers
// ---------------------------------------------------------------------------

/** Build the GroupLayer ID for a widget (e.g., 'querysimple-fl-widget_1'). */
export function getGroupLayerId (widgetId: string): string {
  return `${GROUP_LAYER_ID_PREFIX}${widgetId}`
}

/** Build the FeatureLayer ID for a widget + geometry type (e.g., 'querysimple-fl-widget_1-polygon'). */
export function getFeatureLayerId (widgetId: string, geometryType: NormalizedGeometryType): string {
  return `${GROUP_LAYER_ID_PREFIX}${widgetId}-${geometryType}`
}

// ---------------------------------------------------------------------------
// Composite key
// ---------------------------------------------------------------------------

/** Build the composite key used to uniquely identify a feature across all queries. */
export function buildCompositeKey (queryConfigId: string, recordId: string): string {
  return `${queryConfigId}_${recordId}`
}

// ---------------------------------------------------------------------------
// Renderer construction
// ---------------------------------------------------------------------------

/**
 * Build a SimpleRenderer for the given geometry type using the widget's
 * symbology config. Same source config as the existing getDefaultHighlightSymbol()
 * in graphics-layer-utils.ts, but wrapped in a renderer instead of applied
 * per-graphic.
 */
function buildRendererForGeometryType (
  geometryType: NormalizedGeometryType,
  widgetId: string
): any {
  const fillRGB = widgetConfigManager.getFillColor(widgetId)
  const fillOpacity = widgetConfigManager.getFillOpacity(widgetId)
  const outlineRGB = widgetConfigManager.getOutlineColor(widgetId)
  const outlineOpacity = widgetConfigManager.getOutlineOpacity(widgetId)
  const outlineWidth = widgetConfigManager.getOutlineWidth(widgetId)
  const pointSize = widgetConfigManager.getPointSize(widgetId)
  const pointOutlineWidth = widgetConfigManager.getPointOutlineWidth(widgetId)
  const pointStyle = widgetConfigManager.getPointStyle(widgetId)

  // r028.085: SETTINGS log for renderer symbology read.
  // Mirrors Path 2's instrumentation (graphics-layer-utils.ts:52-65, r028.060)
  // so symbology audits via the SETTINGS feature flag cover both paths.
  debugLogger.log('SETTINGS', {
    event: 'singletonConfigRead',
    source: 'result-feature-layer-factory',
    widgetId,
    geometryType,
    fillColor: fillRGB,
    fillOpacity,
    outlineColor: outlineRGB,
    outlineOpacity,
    outlineWidth,
    pointSize,
    pointOutlineWidth,
    pointStyle
  })

  const fillColor = [...fillRGB, fillOpacity]
  const outlineColor = [...outlineRGB, outlineOpacity]

  let symbol: any

  switch (geometryType) {
    case 'point':
      symbol = {
        type: 'simple-marker',
        style: pointStyle,
        color: fillColor,
        outline: { color: outlineColor, width: pointOutlineWidth },
        size: pointSize
      }
      break

    case 'polyline':
      symbol = {
        type: 'simple-line',
        color: outlineColor,
        width: outlineWidth
      }
      break

    case 'polygon':
      symbol = {
        type: 'simple-fill',
        color: fillColor,
        outline: { color: outlineColor, width: outlineWidth }
      }
      break
  }

  return { type: 'simple', symbol }
}

// ---------------------------------------------------------------------------
// FeatureLayer creation
// ---------------------------------------------------------------------------

/**
 * Create a single client-side FeatureLayer for one geometry type.
 * Starts with `source: []` — features are added via applyEdits() in the sync module.
 */
async function createResultFeatureLayer (
  geometryType: NormalizedGeometryType,
  widgetId: string
): Promise<FeatureLayer> {
  if (!_FeatureLayerCtor) {
    const [FL] = await loadArcGISJSAPIModules(['esri/layers/FeatureLayer'])
    _FeatureLayerCtor = FL
  }

  const layerId = getFeatureLayerId(widgetId, geometryType)
  const renderer = buildRendererForGeometryType(geometryType, widgetId)

  const popupTemplate = await buildResultPopupTemplate(widgetId)

  const layer = new _FeatureLayerCtor({
    id: layerId,
    title: `Results (${geometryType})`,
    source: [],
    objectIdField: 'OBJECTID',
    fields: [...RESULT_FIELDS],
    geometryType,
    spatialReference: { wkid: 102100 },
    renderer,
    popupEnabled: true,
    popupTemplate,
    listMode: 'hide',
    legendEnabled: true,
    visible: true
  })

  debugLogger.log('FEATURE-LAYER', {
    event: 'createResultFeatureLayer',
    geometryType,
    layerId,
    widgetId,
    hasPopupTemplate: true
  })

  return layer as FeatureLayer
}

// ---------------------------------------------------------------------------
// GroupLayer creation
// ---------------------------------------------------------------------------

/**
 * Create the Path 3 GroupLayer container. FeatureLayers are added to it
 * lazily as results of each geometry type arrive.
 */
async function createResultGroupLayer (
  widgetId: string,
  mapView: MapView
): Promise<GroupLayer> {
  if (!_GroupLayerCtor) {
    const [GL] = await loadArcGISJSAPIModules(['esri/layers/GroupLayer'])
    _GroupLayerCtor = GL
  }

  const layerId = getGroupLayerId(widgetId)

  // Reuse existing if already on the map (widget remount scenario)
  const existing = mapView.map.allLayers.find(l => l.id === layerId)
  if (existing) {
    debugLogger.log('FEATURE-LAYER', {
      event: 'createResultGroupLayer-reuse-existing',
      layerId,
      widgetId
    })
    return existing as GroupLayer
  }

  const title = widgetConfigManager.getResultsLayerTitle(widgetId)

  const groupLayer = new _GroupLayerCtor({
    id: layerId,
    title,
    listMode: 'show',
    visible: true,
    visibilityMode: 'inherited',
    layers: []
  })

  mapView.map.add(groupLayer)

  // r028.127: Prevent the ExB LayerList "Remove" button on this runtime-created layer.
  // Must run AFTER map.add(): the framework's before-add listener force-sets
  // __exb_layer_from_runtime = true during the add, so a pre-add write gets clobbered back
  // to true (which is why Remove reappeared). The original r024.56 design set the flag
  // post-add; the Path 2 -> Path 3 move accidentally moved it before the add.
  ;(groupLayer as any).__exb_layer_from_runtime = false

  // Push results above operational layers
  const topIndex = mapView.map.layers.length - 1
  if (topIndex > 0) {
    mapView.map.reorder(groupLayer, topIndex)
  }

  // r028.082: Watch GroupLayer visibility — close any open popup when user
  // toggles the layer off in LayerList. Mirrors Path 2 behavior
  // (graphics-layer-utils.ts:435-462, r024.59). visibilityMode: 'inherited'
  // already cascades the visual hide to child FeatureLayers; this watcher
  // only handles the popup side effect so a popup doesn't sit orphaned
  // over the now-invisible map area.
  const watchHandle = groupLayer.watch('visible', (visible: boolean) => {
    if (!visible && mapView.popup?.visible) {
      mapView.popup.close()
      debugLogger.log('FEATURE-LAYER', {
        event: 'groupLayer-visibility-watcher-closed-popup',
        groupLayerId: layerId,
        widgetId,
        timestamp: Date.now()
      })
    }
  })
  _visibilityWatchHandles.set(widgetId, watchHandle)

  debugLogger.log('FEATURE-LAYER', {
    event: 'createResultGroupLayer-created',
    layerId,
    title,
    widgetId
  })

  return groupLayer as GroupLayer
}

// ---------------------------------------------------------------------------
// Lazy per-geometry-type FeatureLayer accessor
// ---------------------------------------------------------------------------

/**
 * Get or create a FeatureLayer for the given geometry type inside the
 * GroupLayer. This is the primary entry point for the sync module.
 *
 * r028.084: Concurrent-safe. A module-level in-flight Map tracks pending
 * creations; the second of two racing calls awaits the first's Promise
 * rather than starting a duplicate creation + add.
 */
export async function getOrCreateFeatureLayer (
  groupLayer: GroupLayer,
  geometryType: NormalizedGeometryType,
  widgetId: string
): Promise<FeatureLayer> {
  const layerId = getFeatureLayerId(widgetId, geometryType)

  // Fast path: layer already exists in the GroupLayer
  const existing = (groupLayer as any).layers?.find((l: any) => l.id === layerId)
  if (existing) {
    return existing as FeatureLayer
  }

  // r028.084: Creation lock. If another caller is already creating this layer,
  // await its Promise instead of starting a duplicate creation. This prevents
  // duplicate construction + groupLayer.layers.add() races that Path 2 hit at r024.17.
  const inFlight = _creationsInFlight.get(layerId)
  if (inFlight) {
    debugLogger.log('FEATURE-LAYER', {
      event: 'getOrCreateFeatureLayer-awaiting-in-flight',
      geometryType,
      layerId,
      widgetId
    })
    return inFlight
  }

  // Create + add. Store the Promise BEFORE the first await so concurrent callers
  // see it. try/finally guarantees cleanup even if creation throws.
  const creationPromise = (async () => {
    const layer = await createResultFeatureLayer(geometryType, widgetId)
    ;(groupLayer as any).layers.add(layer)
    debugLogger.log('FEATURE-LAYER', {
      event: 'getOrCreateFeatureLayer-added-to-group',
      geometryType,
      layerId,
      groupLayerChildCount: (groupLayer as any).layers?.length
    })
    return layer
  })()
  _creationsInFlight.set(layerId, creationPromise)

  try {
    return await creationPromise
  } finally {
    _creationsInFlight.delete(layerId)
  }
}

// ---------------------------------------------------------------------------
// Renderer update (config change in builder)
// ---------------------------------------------------------------------------

/**
 * Update the renderer on an existing FeatureLayer when symbology config
 * changes in the builder. No need to recreate features.
 */
export function updateFeatureLayerRenderer (
  layer: FeatureLayer,
  geometryType: NormalizedGeometryType,
  widgetId: string
): void {
  const renderer = buildRendererForGeometryType(geometryType, widgetId)
  ;(layer as any).renderer = renderer

  debugLogger.log('FEATURE-LAYER', {
    event: 'updateFeatureLayerRenderer',
    geometryType,
    layerId: layer.id
  })
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

/**
 * Remove and destroy all Path 3 layers for a widget.
 * Called on widget unmount or when switching away from Path 3.
 */
export async function destroyResultLayers (
  widgetId: string,
  mapView: MapView
): Promise<void> {
  const groupLayerId = getGroupLayerId(widgetId)
  const groupLayer = mapView.map.allLayers.find(l => l.id === groupLayerId) as GroupLayer

  if (!groupLayer) return

  // r028.044 (P3): Null geometry refs on source graphics before destroy,
  // matching Path 2's cleanup in graphics-cleanup-utils.ts (r024.35).
  // Breaks circular references so GC can collect geometry buffers.
  const children = (groupLayer as any).layers?.toArray() || []
  let graphicsNulled = 0

  for (const child of children) {
    const source = (child as any).source
    if (source?.forEach) {
      source.forEach((graphic: any) => {
        try {
          graphic.geometry = null
          graphic.attributes = null
          graphicsNulled++
        } catch (e) { /* Ignore — some properties may be read-only */ }
      })
    }
    // Null the PopupTemplate reference on the layer itself
    try { (child as any).popupTemplate = null } catch (e) { /* */ }
    (groupLayer as any).layers.remove(child)
    child.destroy()
  }

  // r028.082: Clean up visibility watcher set up in createResultGroupLayer
  const watchHandle = _visibilityWatchHandles.get(widgetId)
  if (watchHandle) {
    watchHandle.remove()
    _visibilityWatchHandles.delete(widgetId)
  }

  // Remove and destroy the GroupLayer
  mapView.map.remove(groupLayer)
  groupLayer.destroy()

  debugLogger.log('FEATURE-LAYER', {
    event: 'destroyResultLayers',
    groupLayerId,
    childrenDestroyed: children.length,
    graphicsNulled,
    watchHandleRemoved: !!watchHandle,
    widgetId
  })
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  RESULT_FIELDS,
  GROUP_LAYER_ID_PREFIX,
  createResultGroupLayer,
  buildRendererForGeometryType
}
