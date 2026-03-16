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

  // When using ClassBreaksRenderer, the status field must be numeric (double)
  const useClassBreaks = config.colorMode === 'range' &&
    config.rangeColorBreaks && (config.rangeColorBreaks as any).length > 0 &&
    config.statusField
  const numericStatusField = useClassBreaks ? sanitizeFieldName(config.statusField) : ''

  // Define fields from discovered feed field names
  const fields: __esri.FieldProperties[] = [
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
  config: FeedSimpleConfig,
  fieldNames: string[],
  filterContext: FilterContext,
  fieldMapping: { toOriginal: Map<string, string> }
): __esri.PopupTemplate {
  const template = config.feedMapLayerPopupTemplate || config.cardTemplate
  const staticTitle = config.feedMapLayerTitle || 'Feed Item'
  const popupTitleTemplate = (config as any).feedMapLayerPopupTitle as string | undefined

  // Build title: dynamic function when popupTitle template is set, static string otherwise
  const title: string | ((feature: any) => string) = popupTitleTemplate
    ? (feature: any) => {
        try {
          const attrs = feature?.graphic?.attributes
          if (!attrs) return staticTitle
          const item = reconstructFeedItem(attrs, fieldMapping.toOriginal)
          return substituteTokens(popupTitleTemplate, item, filterContext)
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
    || (config as any).cardTemplateMobile
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
          style.textContent = `${baseStyles}.feed-popup-mobile{display:none}@media(max-width:600px){.feed-popup-desktop{display:none}.feed-popup-mobile{display:block}}`
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

  // Determine if the status field should be stored as a number (for ClassBreaksRenderer)
  const useClassBreaks = config.colorMode === 'range' &&
    config.rangeColorBreaks && (config.rangeColorBreaks as any).length > 0 &&
    config.statusField
  const numericStatusField = useClassBreaks ? sanitizeFieldName(config.statusField) : ''

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
      const rawValue = item[fieldName] ?? ''
      // Store numeric status field as a number so ClassBreaksRenderer can match
      if (sanitized === numericStatusField && rawValue !== '') {
        const num = parseFloat(rawValue)
        attributes[sanitized] = isNaN(num) ? null : num
      } else {
        attributes[sanitized] = rawValue
      }
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
    // Log numeric status field values for ClassBreaksRenderer debugging
    if (numericStatusField && graphics.length > 0) {
      const samples = graphics.slice(0, 3)
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

  // 3. Add new features
  let addedTotal = 0
  let addErrors = 0
  if (graphics.length > 0) {
    // Batch in groups of 500 for large feeds
    const BATCH_SIZE = 500
    for (let start = 0; start < graphics.length; start += BATCH_SIZE) {
      const batch = graphics.slice(start, start + BATCH_SIZE)
      try {
        const result = await layer.applyEdits({ addFeatures: batch })
        const addResults = (result as any).addFeatureResults || []
        const succeeded = addResults.filter((r: any) => !r.error).length
        const failed = addResults.filter((r: any) => r.error).length
        addedTotal += succeeded
        addErrors += failed
        if (failed > 0) {
          debugLogger.log('FEED-LAYER', {
            action: 'applyEdits-partial-failure',
            batchStart: start,
            batchSize: batch.length,
            succeeded,
            failed,
            firstError: addResults.find((r: any) => r.error)?.error?.message || 'Unknown'
          })
        }
      } catch (err) {
        addErrors += batch.length
        debugLogger.log('FEED-LAYER', {
          action: 'applyEdits-error',
          batchStart: start,
          batchSize: batch.length,
          error: err instanceof Error ? err.message : 'Unknown'
        })
      }
    }
  }

  // Verify features actually exist on layer after sync
  try {
    const verify = await layer.queryFeatureCount({ where: '1=1' })
    debugLogger.log('FEED-LAYER', {
      action: 'sync-verify',
      expectedCount: graphics.length,
      actualCount: verify,
      match: verify === graphics.length
    })
  } catch (err) {
    debugLogger.log('FEED-LAYER', {
      action: 'sync-verify-error',
      error: err instanceof Error ? err.message : 'Unknown'
    })
  }

  debugLogger.log('FEED-LAYER', {
    action: 'sync-complete',
    totalItems: items.length,
    pointsAdded: addedTotal,
    addErrors,
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
function buildRenderer (config: FeedSimpleConfig): __esri.Renderer {
  const globalColor = config.feedMapLayerColor || '#FF4500'
  const globalSize = config.feedMapLayerSize || 8
  const globalStyle = config.feedMapLayerMarkerStyle || 'circle'
  const outlineColor = config.feedMapLayerOutlineColor ?? '#FFFFFF'
  const outlineWidth = config.feedMapLayerOutlineWidth ?? 1

  // ClassBreaksRenderer: when range mode is active with breaks and a status field
  const breaks = config.rangeColorBreaks as any as Array<{ min: number | null, max: number | null, color: string, label: string, mapColor?: string, size?: number, markerStyle?: string }> | undefined
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

/**
 * Apply mobile-specific popup behavior when viewport ≤ 600px.
 * Sets dockEnabled / dockOptions on the Popup instance.
 * Restores JSAPI defaults on desktop-width viewports.
 */
export function applyMobilePopupBehavior (
  mapView: __esri.MapView | __esri.SceneView,
  config: FeedSimpleConfig
): void {
  if (!mapView?.popup) return
  const isMobile = mapView.width <= 600

  if (isMobile && config.mobilePopupDockPosition) {
    mapView.popup.dockEnabled = true
    mapView.popup.dockOptions = {
      position: config.mobilePopupDockPosition,
      buttonEnabled: !config.mobilePopupHideDockButton
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
  if (isMobile && (config as any).mobilePopupHideActionBar) {
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
  features: __esri.Graphic[],
  location: __esri.Point,
  config: FeedSimpleConfig,
  mapView: __esri.MapView | __esri.SceneView
): __esri.PopupOpenOptions {
  const options: any = { features, location }
  if (config.mobilePopupCollapsed && mapView.width <= 600) {
    options.collapsed = true
  }
  return options
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
        applyMobilePopupBehavior(mapView, config)
        mapView.popup.open(buildPopupOpenOptions(result.features, point, config, mapView))
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
        applyMobilePopupBehavior(mapView, config)
        mapView.popup.open(buildPopupOpenOptions(result.features, point, config, mapView))
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
