/**
 * Popup integration for Path 3 result FeatureLayers.
 *
 * FeatureLayers carry only a lean 4-field schema (OBJECTID, RECORD_ID,
 * QUERY_CONFIG_ID, COMPOSITE_KEY). When a user clicks a feature on the
 * map (identify), the PopupTemplate's CustomContent creator joins back
 * to accumulated records via COMPOSITE_KEY to render full content.
 *
 * Two registries (records + query configs) are module-level Maps that
 * the creator closure captures by reference. Updates to either registry
 * are visible on the next popup open without rebuilding the template.
 */

import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import type { FeatureDataRecord } from 'jimu-core'
import { QUERYSIMPLE_POPUP_FEATURE_IDENTIFIED } from './managers/event-manager'
import {
  renderPopupContent,
  resolvePopupTitle,
  createPopupContentDiv
} from './popup-render-utils'
import { buildFieldMetaMap, type FieldMeta } from './value-formatter'

const debugLogger = createQuerySimpleDebugLogger()

// Module caches (loaded once via loadArcGISJSAPIModules)
let _PopupTemplateCtor: any = null
let _CustomContentCtor: any = null

// ---------------------------------------------------------------------------
// Record registry: widgetId -> (compositeKey -> SlimPopupRecord)
//
// P1 (r028.047): Stores only attributes + sourcePopupTemplate instead of
// the full FeatureDataRecord. Lets GC collect the heavy JSAPI Graphic
// (geometry, symbol, layer ref) after sync completes.
// ---------------------------------------------------------------------------

interface SlimPopupRecord {
  attributes: Record<string, any>
  sourcePopupTemplate: any | null
  // r028.110: Per-field metadata (alias, type, coded-value domain) captured from
  // the source layer's schema at register time, so the popup field table can
  // show aliases and format values the same way the result card will. The live
  // layer reference is dropped after this — only the lean meta map is kept.
  fieldMeta: Record<string, FieldMeta>
}

const _recordsByWidget: Map<string, Map<string, SlimPopupRecord>> = new Map()

function getWidgetRecords (widgetId: string): Map<string, SlimPopupRecord> {
  if (!_recordsByWidget.has(widgetId)) {
    _recordsByWidget.set(widgetId, new Map())
  }
  return _recordsByWidget.get(widgetId)!
}

/**
 * Register records for popup join-back. Called by sync module after
 * addResultFeatures() adds features to the FeatureLayer.
 */
export function registerRecords (
  widgetId: string,
  entries: Array<{ compositeKey: string, record: FeatureDataRecord }>
): void {
  const map = getWidgetRecords(widgetId)
  for (const { compositeKey, record } of entries) {
    // P1 (r028.047): Extract only what the popup creator needs, drop the
    // heavy JSAPI Graphic (geometry, symbol, layer ref).
    const feature = (record as any).feature
    const attributes = feature?.attributes || record.getData?.() || {}
    const sourcePopupTemplate = feature?.layer?.popupTemplate || null
    // r028.110: Capture field metadata (alias/type/domain) from the source
    // layer's schema now, while the live layer is still reachable. The popup
    // creator runs later (outside React, after GC) so it can't read the layer.
    const fieldMeta = buildFieldMetaMap(feature?.layer?.fields)
    map.set(compositeKey, { attributes, sourcePopupTemplate, fieldMeta })
  }

  debugLogger.log('POPUP', {
    event: 'registerRecords',
    widgetId,
    added: entries.length,
    registrySize: map.size
  })
}

/**
 * Unregister records removed from the map. Called by sync module
 * after removeResultFeatures() deletes features.
 */
export function unregisterRecords (
  widgetId: string,
  compositeKeys: string[]
): void {
  const map = _recordsByWidget.get(widgetId)
  if (!map) return

  for (const key of compositeKeys) {
    map.delete(key)
  }

  debugLogger.log('POPUP', {
    event: 'unregisterRecords',
    widgetId,
    removed: compositeKeys.length,
    registrySize: map.size
  })
}

/**
 * Clear all records for a widget. Called by sync module after
 * clearResultFeatures().
 */
export function clearRecordRegistry (widgetId: string): void {
  const size = _recordsByWidget.get(widgetId)?.size || 0
  _recordsByWidget.delete(widgetId)

  debugLogger.log('POPUP', {
    event: 'clearRecordRegistry',
    widgetId,
    cleared: size
  })
}

// ---------------------------------------------------------------------------
// Query config registry: widgetId -> query configs array
// ---------------------------------------------------------------------------

const _queryConfigsByWidget: Map<string, any[]> = new Map()

/**
 * Store query configs for popup rendering. Called from the React
 * component when queries are available or change.
 */
export function setQueryConfigs (widgetId: string, queries: any[]): void {
  _queryConfigsByWidget.set(widgetId, queries)
}

/** Clear query configs on widget unmount. */
export function clearQueryConfigs (widgetId: string): void {
  _queryConfigsByWidget.delete(widgetId)
}

// ---------------------------------------------------------------------------
// Popup template builder
// ---------------------------------------------------------------------------

/**
 * Build a PopupTemplate with CustomContent for a Path 3 FeatureLayer.
 *
 * The creator closure captures the mutable registries by reference,
 * so it always reads the latest records and configs on each popup open.
 * One PopupTemplate instance per FeatureLayer (not shared across layers).
 */
export async function buildResultPopupTemplate (widgetId: string): Promise<any> {
  if (!_PopupTemplateCtor || !_CustomContentCtor) {
    const [PT, CC] = await loadArcGISJSAPIModules([
      'esri/PopupTemplate',
      'esri/popup/content/CustomContent'
    ])
    _PopupTemplateCtor = PT
    _CustomContentCtor = CC
  }

  debugLogger.log('POPUP', {
    event: 'buildResultPopupTemplate',
    widgetId
  })

  const customContent = new _CustomContentCtor({
    outFields: ['*'],
    creator: (event: any) => {
      try {
        const graphic = event?.graphic
        if (!graphic?.attributes) {
          debugLogger.log('POPUP', {
            event: 'popup-content-no-attrs',
            widgetId
          })
          return createFallbackDiv('No attributes available')
        }

        const compositeKey: string = graphic.attributes.COMPOSITE_KEY
        const graphicConfigId: string = graphic.attributes.QUERY_CONFIG_ID

        // Join back to accumulated record via COMPOSITE_KEY
        const widgetRecords = _recordsByWidget.get(widgetId)
        const record = widgetRecords?.get(compositeKey)

        if (!record) {
          debugLogger.log('POPUP', {
            event: 'popup-record-not-found',
            compositeKey,
            queryConfigId: graphicConfigId,
            registrySize: widgetRecords?.size || 0,
            widgetId
          })
          return createFallbackDiv('Record no longer available')
        }

        // r028.033: Notify results panel so it can scroll/flash the matching card
        window.dispatchEvent(new CustomEvent(QUERYSIMPLE_POPUP_FEATURE_IDENTIFIED, {
          detail: { widgetId, compositeKey }
        }))

        // P1 (r028.047): Read directly from slim record (attributes + sourcePopupTemplate)
        // r028.110: fieldMeta drives alias labels + value formatting in the table.
        const { attributes, sourcePopupTemplate, fieldMeta } = record

        // r028.043: Fall back to record attributes for configId when the lean
        // graphic's QUERY_CONFIG_ID is empty (can happen when __queryConfigId
        // was not stamped on the record at query time).
        const effectiveConfigId = graphicConfigId || attributes.__queryConfigId || ''

        // Look up query config for template settings
        const queries = _queryConfigsByWidget.get(widgetId) || []
        const queryConfig = queries.find((q: any) => q.configId === effectiveConfigId)

        // r028.043: Shared rendering function (single source of truth)
        // r028.110: pass fieldMeta so the field table shows aliases + formatted values.
        const result = renderPopupContent(attributes, queryConfig, sourcePopupTemplate, fieldMeta)

        debugLogger.log('POPUP', {
          event: 'popup-content-rendered',
          mode: result.mode,
          compositeKey,
          queryConfigId: effectiveConfigId,
          graphicConfigId,
          attributeKeys: Object.keys(attributes),
          widgetId
        })

        return createPopupContentDiv(result.contentHtml)
      } catch (err) {
        debugLogger.log('POPUP', {
          event: 'popup-creator-error',
          error: err instanceof Error ? err.message : 'Unknown',
          widgetId
        })
        return createFallbackDiv('Error rendering popup')
      }
    }
  })

  // Dynamic title: resolves per feature using the record's query config.
  // r028.043: Uses shared resolvePopupTitle() for consistent title rendering.
  const titleFn = (feature: any): string => {
    try {
      const attrs = feature?.graphic?.attributes
      if (!attrs) {
        debugLogger.log('POPUP', {
          event: 'popup-title-no-attrs',
          widgetId
        })
        return 'Query Result'
      }

      const graphicConfigId = attrs.QUERY_CONFIG_ID
      const compositeKey = attrs.COMPOSITE_KEY

      // P1 (r028.047): Join back to slim record (attributes + sourcePopupTemplate)
      const widgetRecords = _recordsByWidget.get(widgetId)
      const record = widgetRecords?.get(compositeKey)
      const recAttrs = record?.attributes || {}
      const sourcePopupTemplate = record?.sourcePopupTemplate || null

      // r028.043: Fall back to record attributes for configId
      const effectiveConfigId = graphicConfigId || recAttrs.__queryConfigId || ''

      const queries = _queryConfigsByWidget.get(widgetId) || []
      const queryConfig = queries.find((q: any) => q.configId === effectiveConfigId)

      const resolved = resolvePopupTitle(recAttrs, queryConfig, sourcePopupTemplate)

      debugLogger.log('POPUP', {
        event: 'popup-title-rendered',
        compositeKey,
        queryConfigId: effectiveConfigId,
        resolvedTitle: resolved,
        widgetId
      })

      return resolved
    } catch (err) {
      debugLogger.log('POPUP', {
        event: 'popup-title-error',
        error: err instanceof Error ? err.message : 'Unknown',
        widgetId
      })
      return 'Query Result'
    }
  }

  return new _PopupTemplateCtor({
    title: titleFn as any,
    outFields: ['*'],
    content: [customContent]
  })
}

// ---------------------------------------------------------------------------
// Render helpers removed in r028.043 — all rendering logic now lives in
// popup-render-utils.ts (renderPopupContent / resolvePopupTitle /
// createPopupContentDiv). This file retains only createFallbackDiv for
// error/empty states in the creator closure.
// ---------------------------------------------------------------------------

/** Create a fallback div for error/empty states. */
function createFallbackDiv (message: string): HTMLDivElement {
  const div = document.createElement('div')
  div.style.fontSize = '0.875rem'
  div.style.color = '#999'
  div.style.fontStyle = 'italic'
  div.textContent = message
  return div
}

