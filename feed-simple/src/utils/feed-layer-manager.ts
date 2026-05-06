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
import ClassBreaksRenderer from 'esri/renderers/ClassBreaksRenderer'
import type { FeedSimpleConfig, IMConfig, RangeColorBreak } from '../config'
import type { FeedItem } from './parsers/interface'
import { substituteTokens, type FilterContext } from './token-renderer'
import { convertTemplateToHtml } from './markdown-template-utils'
import { debugLogger } from './debug-logger'
import { MOBILE_BREAKPOINT_PX } from '../constants'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'
import type Renderer from '@arcgis/core/renderers/Renderer'

/** Field definition shape — JSAPI 5.0 exports FieldProperties, 4.x puts it in __esri. */
type FieldProperties = __esri.FieldProperties

/** Minimal popup.open() options — JSAPI 5.0 exports PopupOpenOptions, 4.x does not. */
type PopupOpenOptions = { features?: any[]; location?: any; collapsed?: boolean }

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

/** Cached field mapping — avoids rebuilding Maps when fieldNames haven't changed */
let cachedFieldNames: string[] | null = null
let cachedFieldMapping: { toSanitized: Map<string, string>; toOriginal: Map<string, string> } | null = null

/**
 * Build bidirectional mapping between original field names and sanitized names.
 * Caches the result — returns the same Maps if fieldNames reference is unchanged.
 */
export function buildFieldMapping (fieldNames: string[]): {
  toSanitized: Map<string, string>
  toOriginal: Map<string, string>
} {
  if (cachedFieldMapping && cachedFieldNames === fieldNames) {
    return cachedFieldMapping
  }

  const toSanitized = new Map<string, string>()
  const toOriginal = new Map<string, string>()
  for (const name of fieldNames) {
    const sanitized = sanitizeFieldName(name)
    toSanitized.set(name, sanitized)
    toOriginal.set(sanitized, name)
  }
  cachedFieldNames = fieldNames
  cachedFieldMapping = { toSanitized, toOriginal }
  return cachedFieldMapping
}

// ── Config Check ─────────────────────────────────────────────────

/**
 * Whether feed map layer is fully configured.
 */
export function isFeedMapLayerConfigured (config: IMConfig): boolean {
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
  config: IMConfig,
  fieldNames: string[]
): FeatureLayer {
  const layerId = LAYER_ID_PREFIX + widgetId

  const fieldMapping = buildFieldMapping(fieldNames)

  // When using ClassBreaksRenderer, the status field must be numeric (double)
  const useClassBreaks = config.colorMode === 'range' &&
    config.rangeColorBreaks && config.rangeColorBreaks.length > 0 &&
    config.statusField
  const numericStatusField = useClassBreaks ? sanitizeFieldName(config.statusField) : ''

  // Define fields from discovered feed field names
  const fields: FieldProperties[] = [
    { name: 'OBJECTID', type: 'oid' },
    { name: 'FEED_ITEM_ID', type: 'string', alias: 'Feed Item ID' },
    ...fieldNames.map(name => {
      const sanitized = fieldMapping.toSanitized.get(name) || sanitizeFieldName(name)
      return {
        name: sanitized,
        type: (sanitized === numericStatusField ? 'double' : 'string') as any,
        alias: name
      }
    })
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
  config: IMConfig,
  fieldNames: string[],
  filterContext: FilterContext,
  fieldMapping: { toOriginal: Map<string, string> }
): PopupTemplate {
  const template = config.feedMapLayerPopupTemplate || config.cardTemplate
  const staticTitle = config.feedMapLayerTitle || 'Feed Item'
  const popupTitleTemplate = config.feedMapLayerPopupTitle || ''
  const popupTitleTemplateMobile = config.feedMapLayerPopupTitleMobile || ''

  // Build title: dynamic function when popupTitle template is set, static string otherwise
  // When a mobile title is configured, use mapView width to pick the right template
  const title: string | ((feature: any) => string) = popupTitleTemplate || popupTitleTemplateMobile
    ? (feature: any) => {
        try {
          const attrs = feature?.graphic?.attributes
          if (!attrs) return staticTitle
          const item = reconstructFeedItem(attrs, fieldMapping.toOriginal)
          // Pick the right title template based on viewport width
          const mapView = feature?.graphic?.layer?.parent // mapView is the layer's parent
          const isMobile = mapView?.width ? mapView.width <= MOBILE_BREAKPOINT_PX : false
          const activeTemplate = (isMobile && popupTitleTemplateMobile)
            ? popupTitleTemplateMobile
            : (popupTitleTemplate || staticTitle)
          return typeof activeTemplate === 'string' && activeTemplate.includes('{{')
            ? substituteTokens(activeTemplate, item, filterContext)
            : activeTemplate
        } catch {
          return staticTitle
        }
      }
    : staticTitle

  if (!template) {
    // No template — show field list via native JSAPI fields content
    return new PopupTemplate({
      title: title as any,
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
  // Mobile popup cascade: explicit mobile popup → mobile card template → desktop popup
  const mobileTemplate = config.feedMapLayerPopupTemplateMobile
    || config.cardTemplateMobile
    || ''
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
        div.style.fontSize = '0.85rem'
        div.style.lineHeight = '1.4'
        div.style.color = '#333'

        // Base styles for links and paragraphs
        const baseStyles = 'p{margin:0 0 4px}a{color:#0079c1;text-decoration:none}a:hover{text-decoration:underline}hr{margin:6px 0;border:none;border-top:1px solid #ddd}'

        if (mobileTemplate && mobileTemplate !== template) {
          // Responsive: render both desktop and mobile templates with media query toggle
          const mobileSubstituted = substituteTokens(mobileTemplate, item, filterContext)
          const mobileHtml = convertTemplateToHtml(mobileSubstituted)

          const style = document.createElement('style')
          style.textContent = `${baseStyles}.feed-popup-mobile{display:none}@media(max-width:${MOBILE_BREAKPOINT_PX}px){.feed-popup-desktop{display:none}.feed-popup-mobile{display:block}}`
          div.appendChild(style)
          div.innerHTML += `<div class="feed-popup-desktop">${html}</div><div class="feed-popup-mobile">${mobileHtml}</div>`
        } else {
          // Single template — no wrapper needed
          const style = document.createElement('style')
          style.textContent = baseStyles
          div.appendChild(style)
          div.innerHTML += html
        }

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
    title: title as any,
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
 * Build a Graphic from a feed item with sanitized attributes and Point geometry.
 * Returns null if the item has missing or invalid coordinates.
 */
function buildGraphicFromItem (
  item: FeedItem,
  index: number,
  config: IMConfig,
  fieldNames: string[],
  fieldMapping: { toSanitized: Map<string, string> },
  numericStatusField: string,
  itemId: string
): Graphic | null {
  const latStr = item[config.latitudeField]
  const lonStr = item[config.longitudeField]
  if (!latStr || !lonStr) return null

  const lat = parseFloat(latStr)
  const lon = parseFloat(lonStr)
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null

  const attributes: Record<string, any> = {
    OBJECTID: index + 1,
    FEED_ITEM_ID: itemId
  }
  for (const fieldName of fieldNames) {
    const sanitized = fieldMapping.toSanitized.get(fieldName) || sanitizeFieldName(fieldName)
    const rawValue = item[fieldName] ?? ''
    if (sanitized === numericStatusField && rawValue !== '') {
      const num = parseFloat(rawValue)
      attributes[sanitized] = isNaN(num) ? null : num
    } else {
      attributes[sanitized] = rawValue
    }
  }

  return new Graphic({
    geometry: new Point({
      longitude: lon,
      latitude: lat,
      spatialReference: { wkid: 4326 }
    }),
    attributes
  })
}

/**
 * Apply batched applyEdits to the layer. Returns counts of succeeded and failed.
 */
async function batchApplyEdits (
  layer: FeatureLayer,
  edits: { addFeatures?: Graphic[]; deleteFeatures?: Graphic[]; updateFeatures?: Graphic[] },
  logAction: string
): Promise<{ succeeded: number; failed: number }> {
  // Determine which array to batch
  const features = edits.addFeatures || edits.deleteFeatures || edits.updateFeatures || []
  const editKey = edits.addFeatures ? 'addFeatures' : edits.deleteFeatures ? 'deleteFeatures' : 'updateFeatures'
  const resultKey = edits.addFeatures ? 'addFeatureResults' : edits.deleteFeatures ? 'deleteFeatureResults' : 'updateFeatureResults'

  let totalSucceeded = 0
  let totalFailed = 0
  const BATCH_SIZE = 500

  for (let start = 0; start < features.length; start += BATCH_SIZE) {
    const batch = features.slice(start, start + BATCH_SIZE)
    try {
      const result = await layer.applyEdits({ [editKey]: batch })
      const results = (result as any)[resultKey] || []
      const succeeded = results.filter((r: any) => !r.error).length
      const failed = results.filter((r: any) => r.error).length
      totalSucceeded += succeeded
      totalFailed += failed
      if (failed > 0) {
        debugLogger.log('FEED-LAYER', {
          action: `${logAction}-partial-failure`,
          batchStart: start,
          batchSize: batch.length,
          succeeded,
          failed,
          firstError: results.find((r: any) => r.error)?.error?.message || 'Unknown'
        })
      }
    } catch (err) {
      totalFailed += batch.length
      debugLogger.log('FEED-LAYER', {
        action: `${logAction}-error`,
        batchStart: start,
        batchSize: batch.length,
        error: err instanceof Error ? err.message : 'Unknown'
      })
    }
  }

  return { succeeded: totalSucceeded, failed: totalFailed }
}

/**
 * Sync feed items to the FeatureLayer via diff-based applyEdits.
 * Compares item IDs to determine adds, deletes, and updates instead of
 * replacing all features on every cycle. Skips items with invalid coordinates.
 */
export async function syncFeedItemsToLayer (
  layer: FeatureLayer,
  items: FeedItem[],
  config: IMConfig,
  fieldNames: string[],
  getItemId: (item: FeedItem) => string
): Promise<number> {
  const fieldMapping = buildFieldMapping(fieldNames)

  // Determine if the status field should be stored as a number (for ClassBreaksRenderer)
  const useClassBreaks = config.colorMode === 'range' &&
    config.rangeColorBreaks && config.rangeColorBreaks.length > 0 &&
    config.statusField
  const numericStatusField = useClassBreaks ? sanitizeFieldName(config.statusField) : ''

  // Build new graphics from incoming items
  let skippedCount = 0
  const newGraphics: Graphic[] = []
  const newIdSet = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    const itemId = getItemId(items[i])
    const graphic = buildGraphicFromItem(
      items[i], i, config, fieldNames, fieldMapping, numericStatusField, itemId
    )
    if (graphic) {
      newGraphics.push(graphic)
      newIdSet.add(itemId)
    } else {
      skippedCount++
    }
  }

  // Log coordinate extraction for first 3 items to help debug missing points
  if (items.length > 0) {
    const sampleCount = Math.min(3, items.length)
    for (let s = 0; s < sampleCount; s++) {
      const sItem = items[s]
      debugLogger.log('FEED-LAYER', {
        action: 'coord-sample',
        index: s,
        latField: config.latitudeField,
        lonField: config.longitudeField,
        latValue: sItem[config.latitudeField] ?? '(missing)',
        lonValue: sItem[config.longitudeField] ?? '(missing)'
      })
    }
    if (numericStatusField && newGraphics.length > 0) {
      const samples = newGraphics.slice(0, 3)
      debugLogger.log('FEED-LAYER', {
        action: 'class-breaks-values',
        numericField: numericStatusField,
        sampleValues: samples.map(g => ({
          value: g.attributes[numericStatusField],
          type: typeof g.attributes[numericStatusField]
        }))
      })
    }
  }

  // Query existing features for diff
  let existingFeatures: Graphic[] = []
  try {
    const existing = await layer.queryFeatures({ where: '1=1', outFields: ['OBJECTID', 'FEED_ITEM_ID'] })
    existingFeatures = existing.features
  } catch (err) {
    debugLogger.log('FEED-LAYER', {
      action: 'sync-query-error',
      error: err instanceof Error ? err.message : 'Unknown'
    })
    // Fall through — treat as empty layer, will add all
  }

  // Build map of existing FEED_ITEM_ID → OBJECTID for diff
  const existingIdMap = new Map<string, number>()
  for (const f of existingFeatures) {
    const fid = f.attributes.FEED_ITEM_ID as string
    const oid = f.attributes.OBJECTID as number
    if (fid) existingIdMap.set(fid, oid)
  }

  // Diff: determine adds, updates, deletes
  const toAdd: Graphic[] = []
  const toUpdate: Graphic[] = []
  for (const g of newGraphics) {
    const feedId = g.attributes.FEED_ITEM_ID as string
    const existingOid = existingIdMap.get(feedId)
    if (existingOid !== undefined) {
      // Existing feature — update with current attributes and the existing OBJECTID
      g.attributes.OBJECTID = existingOid
      toUpdate.push(g)
    } else {
      // New feature — add
      toAdd.push(g)
    }
  }

  // Features to delete: existing IDs not in the new set
  const toDelete: Graphic[] = []
  for (const f of existingFeatures) {
    const fid = f.attributes.FEED_ITEM_ID as string
    if (fid && !newIdSet.has(fid)) {
      toDelete.push(f)
    }
  }

  debugLogger.log('FEED-LAYER', {
    action: 'sync-diff',
    existing: existingFeatures.length,
    incoming: newGraphics.length,
    toAdd: toAdd.length,
    toUpdate: toUpdate.length,
    toDelete: toDelete.length
  })

  // Apply edits — only the operations that have features
  let addResult = { succeeded: 0, failed: 0 }
  let updateResult = { succeeded: 0, failed: 0 }
  let deleteResult = { succeeded: 0, failed: 0 }

  if (toDelete.length > 0) {
    deleteResult = await batchApplyEdits(layer, { deleteFeatures: toDelete }, 'sync-delete')
  }
  if (toUpdate.length > 0) {
    updateResult = await batchApplyEdits(layer, { updateFeatures: toUpdate }, 'sync-update')
  }
  if (toAdd.length > 0) {
    addResult = await batchApplyEdits(layer, { addFeatures: toAdd }, 'sync-add')
  }

  // Verify features actually exist on layer after sync (debug only)
  debugLogger.log('FEED-LAYER', {
    action: 'sync-complete',
    totalItems: items.length,
    pointsOnLayer: newGraphics.length,
    added: addResult.succeeded,
    updated: updateResult.succeeded,
    deleted: deleteResult.succeeded,
    errors: addResult.failed + updateResult.failed + deleteResult.failed,
    skippedCoords: skippedCount
  })

  return newGraphics.length
}

// ── Layer Destruction ────────────────────────────────────────────

/**
 * Remove the feed layer from the map and destroy it.
 */
export function destroyFeedFeatureLayer (
  mapView: MapView | SceneView,
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
 * Build a plain marker symbol object for autocast.
 * JSAPI ClassBreakInfo rejects pre-constructed SimpleMarkerSymbol instances
 * due to module context issues — plain objects with `type` autocast correctly.
 */
function buildMarkerSymbol (
  color: string,
  size: number,
  style: string,
  outlineColor: string,
  outlineWidth: number
): any {
  const sym: any = {
    type: 'simple-marker',
    style: style || 'circle',
    color,
    size
  }
  // Explicitly set outline: width 0 + transparent color suppresses JSAPI's default outline
  if (outlineWidth > 0 && outlineColor) {
    sym.outline = { color: outlineColor, width: outlineWidth }
  } else {
    sym.outline = { color: [0, 0, 0, 0], width: 0 }
  }
  return sym
}

/**
 * Build a renderer from config.
 *
 * When colorMode is 'range' with breaks and a statusField, produces a
 * ClassBreaksRenderer so each numeric range gets its own color, size,
 * and marker style. Otherwise falls back to a SimpleRenderer.
 *
 * ClassBreaksRenderer is explicitly constructed to ensure JSAPI processes
 * classBreakInfos correctly. Symbols are plain objects (autocast) because
 * ClassBreakInfo's internal setter rejects pre-constructed symbol instances.
 */
function buildRenderer (config: IMConfig): Renderer {
  const globalColor = config.feedMapLayerColor || '#FF4500'
  const globalSize = config.feedMapLayerSize || 8
  const globalStyle = config.feedMapLayerMarkerStyle || 'circle'
  const outlineColor = config.feedMapLayerOutlineColor ?? '#FFFFFF'
  const outlineWidth = config.feedMapLayerOutlineWidth ?? 1

  // ClassBreaksRenderer: when range mode is active with breaks and a status field
  const breaks = config.rangeColorBreaks as unknown as RangeColorBreak[] | undefined
  if (
    config.colorMode === 'range' &&
    breaks && breaks.length > 0 &&
    config.statusField
  ) {
    const sanitizedField = sanitizeFieldName(config.statusField)
    debugLogger.log('FEED-LAYER', {
      action: 'class-breaks-renderer',
      field: config.statusField,
      sanitizedField,
      breakCount: breaks.length,
      breaks: breaks.map(b => ({ min: b.min, max: b.max, color: b.color, mapColor: b.mapColor, size: b.size, style: b.markerStyle, label: b.label }))
    })

    const renderer = new ClassBreaksRenderer({
      field: sanitizedField,
      defaultSymbol: buildMarkerSymbol(globalColor, globalSize, globalStyle, outlineColor, outlineWidth),
      defaultLabel: 'Other'
    } as any)

    // Add class break infos after construction to avoid ClassBreakInfo
    // constructor symbol casting issues
    for (const brk of breaks) {
      renderer.addClassBreakInfo(
        brk.min ?? -1e38,
        brk.max ?? 1e38,
        buildMarkerSymbol(
          brk.mapColor || brk.color || globalColor,
          brk.size || globalSize,
          brk.markerStyle || globalStyle,
          outlineColor,
          outlineWidth
        )
      )
    }

    // Set labels after adding breaks
    renderer.classBreakInfos.forEach((info: any, idx: number) => {
      info.label = breaks[idx]?.label || ''
    })

    return renderer
  }

  // SimpleRenderer: flat styling (default)
  return {
    type: 'simple',
    symbol: buildMarkerSymbol(globalColor, globalSize, globalStyle, outlineColor, outlineWidth)
  } as any
}

// ── Mobile Popup Behavior ────────────────────────────────────────

/** Popup behavior params — extracted from config so callers don't need IMConfig */
export interface MobilePopupParams {
  mobilePopupDockPosition?: string
  mobilePopupHideDockButton?: boolean
  mobilePopupHideActionBar?: boolean
  mobilePopupCollapsed?: boolean
}

/**
 * Apply mobile-specific popup behavior when viewport ≤ 600px.
 * Sets dockEnabled / dockOptions on the Popup instance.
 * Restores JSAPI defaults on desktop-width viewports.
 *
 * Accepts either an IMConfig or a plain MobilePopupParams object,
 * so both feed-layer-manager and map-interaction can share this logic.
 */
export function applyMobilePopupBehavior (
  mapView: MapView | SceneView,
  params: MobilePopupParams
): void {
  if (!mapView?.popup) return
  const isMobile = mapView.width <= MOBILE_BREAKPOINT_PX

  if (isMobile && params.mobilePopupDockPosition) {
    mapView.popup.dockEnabled = true
    mapView.popup.dockOptions = {
      position: params.mobilePopupDockPosition,
      buttonEnabled: !params.mobilePopupHideDockButton
    } as any
  } else if (!isMobile) {
    // Restore JSAPI defaults for desktop
    mapView.popup.dockEnabled = false
    mapView.popup.dockOptions = {
      buttonEnabled: true,
      position: 'auto'
    } as any
  }

  // Hide action bar (zoom-to, etc.) on mobile if configured
  if (isMobile && params.mobilePopupHideActionBar) {
    mapView.popup.visibleElements = {
      ...mapView.popup.visibleElements as any,
      actionBar: false
    } as any
  } else if (!isMobile) {
    mapView.popup.visibleElements = {
      ...mapView.popup.visibleElements as any,
      actionBar: true
    } as any
  }
}

/**
 * Build popup.open() options, adding collapsed flag on mobile if configured.
 */
function buildPopupOpenOptions (
  features: Graphic[],
  location: Point,
  config: IMConfig,
  mapView: MapView | SceneView
): PopupOpenOptions {
  const options: any = { features, location }
  if (config.mobilePopupCollapsed && mapView.width <= MOBILE_BREAKPOINT_PX) {
    options.collapsed = true
  }
  return options
}

// ── Zoom + Popup for Feed Layer Points ───────────────────────────

/**
 * Navigate to a feed item's point on the map and open its popup.
 * When skipZoom is true, only the popup/identify is performed (no goTo).
 */
/**
 * Navigate to a feed item's point on the map (zoom or pan) and open its popup.
 * Consolidates the shared logic from the former zoomToFeedPoint / panToFeedPoint.
 *
 * @param mode  'zoom' zooms to point at configured zoom level,
 *              'pan' centers without changing zoom,
 *              'select' skips navigation entirely (just opens popup at location)
 */
export async function navigateToFeedPoint (
  mapView: MapView | SceneView,
  item: FeedItem,
  config: IMConfig,
  mode: 'zoom' | 'pan' | 'select' = 'zoom'
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
    // Navigate based on mode
    if (mode === 'zoom') {
      const zoom = config.zoomFactorPoint || 15
      await mapView.goTo({ target: point, zoom }, { animate: true, duration: 800 })
    } else if (mode === 'pan') {
      await mapView.goTo({ center: point }, { animate: true, duration: 800 })
    }
    // mode === 'select' — skip navigation, just open popup

    // Open popup at the point location
    if (!mapView.popup || typeof mapView.popup.open !== 'function') {
      mapView.popup = new Popup({ view: mapView })
    }

    // Find the feature on the feed layer and open its popup
    const feedLayer = mapView.map.allLayers.find(
      l => l.id.startsWith(LAYER_ID_PREFIX)
    ) as FeatureLayer | undefined

    if (feedLayer) {
      const result = await feedLayer.queryFeatures({
        geometry: point,
        distance: 100,
        units: 'meters',
        outFields: ['*'],
        returnGeometry: true
      })

      if (result.features.length > 0) {
        applyMobilePopupBehavior(mapView, config)
        mapView.popup.open(buildPopupOpenOptions(result.features, point, config, mapView))
      }
    }
    return true
  } catch (err) {
    debugLogger.log('FEED-LAYER', {
      action: `${mode}-error`,
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
