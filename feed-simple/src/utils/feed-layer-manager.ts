/**
 * Feed Layer Manager for FeedSimple.
 *
 * Creates and manages a client-side FeatureLayer from feed item coordinates.
 * Points appear on the map and in the LayerList widget automatically.
 * Updates efficiently via applyEdits() on each poll cycle.
 *
 * @module feed-layer-manager
 */

import FeatureLayer from 'esri/layers/FeatureLayer'
import Graphic from 'esri/Graphic'
import Point from 'esri/geometry/Point'
import Popup from 'esri/widgets/Popup'
import PopupTemplate from 'esri/PopupTemplate'
import CustomContent from 'esri/popup/content/CustomContent'
import type { FeedSimpleConfig } from '../config'
import type { FeedItem } from './parsers/interface'
import { substituteTokens, type FilterContext } from './token-renderer'
import { convertTemplateToHtml } from './markdown-template-utils'
import { createFeedSimpleDebugLogger } from './debug-logger'

const debugLogger = createFeedSimpleDebugLogger()

/** Prefix for the generated layer ID */
const LAYER_ID_PREFIX = 'feedsimple-points-'

// ── Field Name Sanitization ──────────────────────────────────────
// JSAPI FeatureLayer field names cannot contain dots or @.
// The flattener produces keys like `origin.latitude.value` and `@publicID`.
// We sanitize to underscores and maintain a bidirectional mapping.

/**
 * Convert a dot-path field name to a JSAPI-safe field name.
 * `origin.latitude.value` → `origin_latitude_value`
 * `@publicID` → `_at_publicID`
 */
export function sanitizeFieldName (fieldName: string): string {
  return fieldName
    .replace(/@/g, '_at_')
    .replace(/\./g, '_')
    .replace(/\[/g, '_')
    .replace(/\]/g, '')
}

/**
 * Build bidirectional mapping between original field names and sanitized names.
 */
export function buildFieldMapping (fieldNames: string[]): {
  toSanitized: Map<string, string>
  toOriginal: Map<string, string>
} {
  const toSanitized = new Map<string, string>()
  const toOriginal = new Map<string, string>()
  for (const name of fieldNames) {
    const sanitized = sanitizeFieldName(name)
    toSanitized.set(name, sanitized)
    toOriginal.set(sanitized, name)
  }
  return { toSanitized, toOriginal }
}

// ── Config Check ─────────────────────────────────────────────────

/**
 * Whether feed map layer is fully configured.
 */
export function isFeedMapLayerConfigured (config: FeedSimpleConfig): boolean {
  return !!(
    config.enableFeedMapLayer &&
    config.latitudeField &&
    config.longitudeField &&
    config.mapWidgetId
  )
}

// ── Layer Creation ───────────────────────────────────────────────

/**
 * Create the client-side FeatureLayer with empty source.
 * Call once when mapView becomes available and config is ready.
 */
export function createFeedFeatureLayer (
  widgetId: string,
  config: FeedSimpleConfig,
  fieldNames: string[]
): __esri.FeatureLayer {
  const layerId = LAYER_ID_PREFIX + widgetId

  const fieldMapping = buildFieldMapping(fieldNames)

  // Define fields from discovered feed field names
  const fields: __esri.FieldProperties[] = [
    { name: 'OBJECTID', type: 'oid' },
    { name: 'FEED_ITEM_ID', type: 'string', alias: 'Feed Item ID' },
    ...fieldNames.map(name => ({
      name: fieldMapping.toSanitized.get(name) || sanitizeFieldName(name),
      type: 'string' as const,
      alias: name
    }))
  ]

  // Build renderer
  const renderer = buildRenderer(config)

  const layer = new FeatureLayer({
    id: layerId,
    title: config.feedMapLayerTitle || 'Feed Items',
    source: [],
    objectIdField: 'OBJECTID',
    fields,
    geometryType: 'point',
    spatialReference: { wkid: 4326 },
    renderer,
    popupEnabled: true,
    listMode: 'show', // Appear in LayerList
    visible: true
  })

  debugLogger.log('FEED-LAYER', {
    action: 'layer-created',
    layerId,
    fieldCount: fieldNames.length,
    title: config.feedMapLayerTitle || 'Feed Items'
  })

  return layer
}

/**
 * Build the popup template for the feed layer.
 * Uses CustomContent with an explicit creator function so JSAPI
 * correctly renders popups for both native map clicks and programmatic opens.
 */
export function buildPopupTemplate (
  config: FeedSimpleConfig,
  fieldNames: string[],
  filterContext: FilterContext,
  fieldMapping: { toOriginal: Map<string, string> }
): __esri.PopupTemplate {
  const template = config.feedMapLayerPopupTemplate || config.cardTemplate
  const title = config.feedMapLayerTitle || 'Feed Item'

  if (!template) {
    // No template — show field list via native JSAPI fields content
    return new PopupTemplate({
      title,
      content: [{
        type: 'fields',
        fieldInfos: fieldNames.slice(0, 20).map(name => ({
          fieldName: sanitizeFieldName(name),
          label: name
        }))
      }]
    })
  }

  // Use CustomContent to render card template HTML from feature attributes
  const customContent = new CustomContent({
    outFields: ['*'],
    creator: (event: any) => {
      try {
        const graphic = event?.graphic
        if (!graphic?.attributes) {
          debugLogger.log('FEED-LAYER', { action: 'popup-no-attributes' })
          return document.createElement('div')
        }

        const item = reconstructFeedItem(graphic.attributes, fieldMapping.toOriginal)
        const substituted = substituteTokens(template, item, filterContext)
        const html = convertTemplateToHtml(substituted)

        const div = document.createElement('div')
        div.innerHTML = html
        div.style.fontSize = '0.85rem'
        div.style.lineHeight = '1.4'
        div.style.color = '#333'
        // Style links and paragraphs
        const style = document.createElement('style')
        style.textContent = 'p{margin:0 0 4px}a{color:#0079c1;text-decoration:none}a:hover{text-decoration:underline}hr{margin:6px 0;border:none;border-top:1px solid #ddd}'
        div.prepend(style)

        return div
      } catch (err) {
        debugLogger.log('FEED-LAYER', {
          action: 'popup-render-error',
          error: err instanceof Error ? err.message : 'Unknown'
        })
        return document.createElement('div')
      }
    }
  })

  return new PopupTemplate({
    title,
    outFields: ['*'],
    content: [customContent]
  })
}

/**
 * Reconstruct a FeedItem from sanitized JSAPI attributes.
 */
function reconstructFeedItem (
  attributes: Record<string, any>,
  toOriginal: Map<string, string>
): FeedItem {
  const item: FeedItem = {}
  for (const [sanitized, value] of Object.entries(attributes)) {
    if (sanitized === 'OBJECTID' || sanitized === 'FEED_ITEM_ID') continue
    const original = toOriginal.get(sanitized) || sanitized
    item[original] = value != null ? String(value) : ''
  }
  return item
}

// ── Layer Sync (Poll Cycle) ──────────────────────────────────────

/**
 * Sync feed items to the FeatureLayer via applyEdits (full replace).
 * Skips items with missing or invalid coordinates.
 */
export async function syncFeedItemsToLayer (
  layer: __esri.FeatureLayer,
  items: FeedItem[],
  config: FeedSimpleConfig,
  fieldNames: string[],
  getItemId: (item: FeedItem) => string
): Promise<number> {
  const fieldMapping = buildFieldMapping(fieldNames)

  // 1. Delete all existing features
  try {
    const existing = await layer.queryFeatures({ where: '1=1', outFields: ['OBJECTID'] })
    if (existing.features.length > 0) {
      await layer.applyEdits({ deleteFeatures: existing.features })
    }
  } catch (err) {
    debugLogger.log('FEED-LAYER', {
      action: 'sync-delete-error',
      error: err instanceof Error ? err.message : 'Unknown'
    })
  }

  // 2. Build new graphics from items
  let skippedCount = 0
  const graphics: __esri.Graphic[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const latStr = item[config.latitudeField]
    const lonStr = item[config.longitudeField]

    if (!latStr || !lonStr) {
      skippedCount++
      continue
    }

    const lat = parseFloat(latStr)
    const lon = parseFloat(lonStr)

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      skippedCount++
      continue
    }

    // Build sanitized attributes
    const attributes: Record<string, any> = {
      OBJECTID: i + 1,
      FEED_ITEM_ID: getItemId(item)
    }
    for (const fieldName of fieldNames) {
      const sanitized = fieldMapping.toSanitized.get(fieldName) || sanitizeFieldName(fieldName)
      attributes[sanitized] = item[fieldName] ?? ''
    }

    graphics.push(new Graphic({
      geometry: new Point({
        longitude: lon,
        latitude: lat,
        spatialReference: { wkid: 4326 }
      }),
      attributes
    }))
  }

  // 3. Add new features
  if (graphics.length > 0) {
    // Batch in groups of 500 for large feeds
    const BATCH_SIZE = 500
    for (let start = 0; start < graphics.length; start += BATCH_SIZE) {
      const batch = graphics.slice(start, start + BATCH_SIZE)
      await layer.applyEdits({ addFeatures: batch })
    }
  }

  debugLogger.log('FEED-LAYER', {
    action: 'sync-complete',
    totalItems: items.length,
    pointsAdded: graphics.length,
    skipped: skippedCount
  })

  return graphics.length
}

// ── Layer Destruction ────────────────────────────────────────────

/**
 * Remove the feed layer from the map and destroy it.
 */
export function destroyFeedFeatureLayer (
  mapView: __esri.MapView | __esri.SceneView,
  widgetId: string
): void {
  const layerId = LAYER_ID_PREFIX + widgetId
  const layer = mapView.map.allLayers.find(l => l.id === layerId)
  if (layer) {
    mapView.map.remove(layer)
    layer.destroy()
    debugLogger.log('FEED-LAYER', { action: 'layer-destroyed', layerId })
  }
}

// ── Renderer ─────────────────────────────────────────────────────

/**
 * Build a SimpleRenderer from config.
 */
function buildRenderer (config: FeedSimpleConfig): __esri.RendererProperties {
  return {
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      style: config.feedMapLayerMarkerStyle || 'circle',
      color: config.feedMapLayerColor || '#FF4500',
      size: config.feedMapLayerSize || 8,
      outline: {
        color: '#FFFFFF',
        width: 1
      }
    }
  } as any
}

// ── Zoom + Popup for Feed Layer Points ───────────────────────────

/**
 * Navigate to a feed item's point on the map and open its popup.
 * When skipZoom is true, only the popup/identify is performed (no goTo).
 */
export async function zoomToFeedPoint (
  mapView: __esri.MapView | __esri.SceneView,
  item: FeedItem,
  config: FeedSimpleConfig,
  options?: { skipZoom?: boolean }
): Promise<boolean> {
  const latStr = item[config.latitudeField]
  const lonStr = item[config.longitudeField]
  if (!latStr || !lonStr) return false

  const lat = parseFloat(latStr)
  const lon = parseFloat(lonStr)
  if (isNaN(lat) || isNaN(lon)) return false

  const point = new Point({
    longitude: lon,
    latitude: lat,
    spatialReference: { wkid: 4326 }
  })

  try {
    // Zoom to point (unless zoom is disabled)
    if (!options?.skipZoom) {
      const zoom = config.zoomFactorPoint || 15
      await mapView.goTo({ target: point, zoom }, { animate: true, duration: 800 })
    }

    // Open popup at the point location
    if (!mapView.popup || typeof mapView.popup.open !== 'function') {
      mapView.popup = new Popup({ view: mapView })
    }

    // Find the feature on the feed layer and open its popup
    const feedLayer = mapView.map.allLayers.find(
      l => l.id.startsWith(LAYER_ID_PREFIX)
    ) as __esri.FeatureLayer | undefined

    if (feedLayer) {
      const result = await feedLayer.queryFeatures({
        geometry: point,
        distance: 100,
        units: 'meters',
        outFields: ['*'],
        returnGeometry: true
      })

      if (result.features.length > 0) {
        mapView.popup.open({
          features: result.features,
          location: point
        })
      }
    }
    return true
  } catch (err) {
    debugLogger.log('FEED-LAYER', {
      action: 'zoom-error',
      error: err instanceof Error ? err.message : 'Unknown'
    })
    return false
  }
}

/**
 * Pan (center) to a feed item's point on the map without changing zoom.
 * Opens popup at the point location.
 */
export async function panToFeedPoint (
  mapView: __esri.MapView | __esri.SceneView,
  item: FeedItem,
  config: FeedSimpleConfig
): Promise<boolean> {
  const latStr = item[config.latitudeField]
  const lonStr = item[config.longitudeField]
  if (!latStr || !lonStr) return false

  const lat = parseFloat(latStr)
  const lon = parseFloat(lonStr)
  if (isNaN(lat) || isNaN(lon)) return false

  const point = new Point({
    longitude: lon,
    latitude: lat,
    spatialReference: { wkid: 4326 }
  })

  try {
    // Pan without changing zoom — only center changes
    await mapView.goTo({ center: point }, { animate: true, duration: 800 })

    // Open popup at the point location
    if (!mapView.popup || typeof mapView.popup.open !== 'function') {
      mapView.popup = new Popup({ view: mapView })
    }

    const feedLayer = mapView.map.allLayers.find(
      l => l.id.startsWith(LAYER_ID_PREFIX)
    ) as __esri.FeatureLayer | undefined

    if (feedLayer) {
      const result = await feedLayer.queryFeatures({
        geometry: point,
        distance: 100,
        units: 'meters',
        outFields: ['*'],
        returnGeometry: true
      })

      if (result.features.length > 0) {
        mapView.popup.open({
          features: result.features,
          location: point
        })
      }
    }
    return true
  } catch (err) {
    debugLogger.log('FEED-LAYER', {
      action: 'pan-error',
      error: err instanceof Error ? err.message : 'Unknown'
    })
    return false
  }
}

/**
 * Get the layer ID for a given widget.
 */
export function getFeedLayerId (widgetId: string): string {
  return LAYER_ID_PREFIX + widgetId
}
