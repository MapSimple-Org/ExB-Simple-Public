/**
 * Sync module for managing features on Path 3 result FeatureLayers.
 *
 * All mutations go through JSAPI's applyEdits() API. Features carry only
 * the lean 4-field schema (OBJECTID, RECORD_ID, QUERY_CONFIG_ID,
 * COMPOSITE_KEY). Full attribute data is joined back from accumulated
 * records at popup render time.
 *
 * r028.042 (P2): Composite keys are tracked in a module-level Set per
 * widget, kept in sync with applyEdits() mutations. This eliminates
 * queryFeatures({ where: '1=1' }) calls for key-diff and count
 * operations on every sync cycle.
 *
 * This module does NOT touch any GraphicsLayer code. It is a parallel
 * implementation for Path 3 only.
 */

import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import {
  normalizeGeometryType,
  getOrCreateFeatureLayer,
  buildCompositeKey,
  type NormalizedGeometryType
} from './result-feature-layer-factory'
import {
  registerRecords,
  unregisterRecords,
  clearRecordRegistry
} from './result-feature-layer-popup'
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import type Graphic from '@arcgis/core/Graphic'
import type GroupLayer from '@arcgis/core/layers/GroupLayer'
import type { FeatureDataRecord } from 'jimu-core'

const debugLogger = createQuerySimpleDebugLogger()

// Module caches
let _GraphicCtor: any = null

/**
 * Maximum features per applyEdits batch. Matches FeedSimple's BATCH_SIZE.
 * JSAPI can handle larger batches, but 500 keeps individual edit calls
 * fast and avoids blocking the UI thread for too long.
 */
const BATCH_SIZE = 500

// ---------------------------------------------------------------------------
// ObjectId counter
// ---------------------------------------------------------------------------

const _nextObjectId: Map<string, number> = new Map()

/** Return the next sequential ObjectID for this widget, starting at 1. */
function getNextObjectId (widgetId: string): number {
  const current = _nextObjectId.get(widgetId) || 0
  const next = current + 1
  _nextObjectId.set(widgetId, next)
  return next
}

/** Reset counter on full clear. */
export function resetObjectIdCounter (widgetId: string): void {
  _nextObjectId.delete(widgetId)
}

// ---------------------------------------------------------------------------
// Composite key tracking (P2)
// ---------------------------------------------------------------------------

/**
 * r028.042 (P2): Module-level tracking of composite keys per widget.
 * Eliminates queryFeatures({ where: '1=1' }) on every sync cycle.
 * Stays in sync with applyEdits() mutations in add/remove/clear.
 */
const _keysByWidget: Map<string, Set<string>> = new Map()

/** Get or create the key set for a widget. */
function getKeySet (widgetId: string): Set<string> {
  if (!_keysByWidget.has(widgetId)) {
    _keysByWidget.set(widgetId, new Set())
  }
  return _keysByWidget.get(widgetId)!
}

/** Reset key tracking on full clear or widget unmount. */
export function resetKeyTracking (widgetId: string): void {
  _keysByWidget.delete(widgetId)
}

// ---------------------------------------------------------------------------
// Graphic construction
// ---------------------------------------------------------------------------

/** Lazy-load the Graphic constructor via JSAPI module loader (cached after first call). */
async function ensureGraphicCtor (): Promise<any> {
  if (!_GraphicCtor) {
    const [G] = await loadArcGISJSAPIModules(['esri/Graphic'])
    _GraphicCtor = G
  }
  return _GraphicCtor
}

/**
 * Build a Graphic from a FeatureDataRecord for insertion into a result
 * FeatureLayer. Carries only the lean 4-field schema plus the original
 * geometry.
 */
function buildResultGraphic (
  GraphicCtor: any,
  record: FeatureDataRecord,
  queryConfigId: string,
  widgetId: string
): { graphic: Graphic, geometryType: NormalizedGeometryType } | null {
  const feature = (record as any).feature
  if (!feature?.geometry) return null

  const geometry = feature.geometry
  const geometryType = normalizeGeometryType(geometry.type)
  const recordId = String(record.getId())
  const compositeKey = buildCompositeKey(queryConfigId, recordId)

  const graphic = new GraphicCtor({
    geometry,
    attributes: {
      OBJECTID: getNextObjectId(widgetId),
      RECORD_ID: recordId,
      QUERY_CONFIG_ID: queryConfigId,
      COMPOSITE_KEY: compositeKey
    }
  })

  return { graphic: graphic as Graphic, geometryType }
}

// ---------------------------------------------------------------------------
// Batched applyEdits
// ---------------------------------------------------------------------------

/**
 * Apply edits in batches to stay within JSAPI limits.
 * Processes deletes first, then adds (same order as FeedSimple).
 */
async function batchApplyEdits (
  layer: FeatureLayer,
  addFeatures: Graphic[],
  deleteFeatures: Graphic[]
): Promise<void> {
  // Deletes first
  for (let i = 0; i < deleteFeatures.length; i += BATCH_SIZE) {
    const batch = deleteFeatures.slice(i, i + BATCH_SIZE)
    await (layer as any).applyEdits({ deleteFeatures: batch })
  }

  // Then adds
  for (let i = 0; i < addFeatures.length; i += BATCH_SIZE) {
    const batch = addFeatures.slice(i, i + BATCH_SIZE)
    await (layer as any).applyEdits({ addFeatures: batch })
  }
}

/**
 * r028.086: Hide Legend entry for a child FL when it has zero features.
 * Mirrors Path 2's removeEmptyLegendFeatureLayers (graphics-layer-utils.ts:562-589, r024.54).
 * Uses legendEnabled=false (not destroy) so ESRI's reactive infrastructure stays
 * intact for reuse when features are re-added (legend is re-enabled in addResultFeatures).
 */
async function disableLegendIfEmpty (layer: FeatureLayer, widgetId: string): Promise<void> {
  if (!(layer as any).queryFeatureCount || !layer.legendEnabled) return
  const remaining = await (layer as any).queryFeatureCount({ where: '1=1' })
  if (remaining === 0) {
    layer.legendEnabled = false
    debugLogger.log('FEATURE-LAYER', {
      event: 'disableLegendIfEmpty-hidden',
      layerId: layer.id,
      widgetId,
      reason: 'no-features-remaining',
      timestamp: Date.now()
    })
  }
}

// ---------------------------------------------------------------------------
// Add features
// ---------------------------------------------------------------------------

/**
 * Add result records as features to the appropriate per-geometry-type
 * FeatureLayers. Creates FeatureLayers on demand if they don't exist yet.
 *
 * @returns Count of features successfully added.
 */
export async function addResultFeatures (
  groupLayer: GroupLayer,
  records: FeatureDataRecord[],
  queryConfigId: string,
  widgetId: string
): Promise<number> {
  if (!records.length) return 0

  const GraphicCtor = await ensureGraphicCtor()

  // Group graphics by geometry type + collect registry entries
  const byType = new Map<NormalizedGeometryType, Graphic[]>()
  const registryEntries: Array<{ compositeKey: string, record: FeatureDataRecord }> = []

  for (const record of records) {
    const result = buildResultGraphic(GraphicCtor, record, queryConfigId, widgetId)
    if (!result) continue

    const { graphic, geometryType } = result
    if (!byType.has(geometryType)) {
      byType.set(geometryType, [])
    }
    byType.get(geometryType)!.push(graphic)

    // Collect for popup registry (same compositeKey the graphic carries)
    const compositeKey = graphic.attributes?.COMPOSITE_KEY
    if (compositeKey) {
      registryEntries.push({ compositeKey, record })
    }
  }

  // Register records for popup join-back before adding to map
  if (registryEntries.length > 0) {
    registerRecords(widgetId, registryEntries)
  }

  // Apply edits per geometry type
  let totalAdded = 0

  for (const [geometryType, graphics] of byType) {
    const layer = await getOrCreateFeatureLayer(groupLayer, geometryType, widgetId)
    await batchApplyEdits(layer, graphics, [])
    totalAdded += graphics.length

    // P2: Track composite keys locally after successful applyEdits
    const trackedKeys = getKeySet(widgetId)
    for (const g of graphics) {
      const ck = (g as any).attributes?.COMPOSITE_KEY
      if (ck) trackedKeys.add(ck)
    }

    // r028.086: Re-enable Legend entry if it was hidden by a prior empty state.
    // Inverse of disableLegendIfEmpty. Mirrors Path 2 (graphics-layer-utils.ts:497-501).
    if (!layer.legendEnabled) {
      layer.legendEnabled = true
      debugLogger.log('FEATURE-LAYER', {
        event: 'addResultFeatures-re-enabled-legend',
        layerId: layer.id,
        widgetId,
        timestamp: Date.now()
      })
    }

    debugLogger.log('FEATURE-LAYER', {
      event: 'addResultFeatures',
      geometryType,
      count: graphics.length,
      layerId: layer.id,
      widgetId
    })
  }

  // r028.081: Auto-enable layer visibility when adding features.
  // Mirrors Path 2 behavior (graphics-layer-utils.ts:948-959, r024.18):
  // if user toggled the layer off in LayerList and runs a new query,
  // they expect to see results, so re-enable the GroupLayer.
  // visibilityMode is 'inherited', so toggling the GroupLayer cascades to children.
  if (totalAdded > 0 && !groupLayer.visible) {
    groupLayer.visible = true
    debugLogger.log('FEATURE-LAYER', {
      event: 'addResultFeatures-auto-enabled-visibility',
      groupLayerId: groupLayer.id,
      widgetId,
      reason: 'layer-was-hidden-but-features-added',
      timestamp: Date.now()
    })
  }

  return totalAdded
}

// ---------------------------------------------------------------------------
// Remove features
// ---------------------------------------------------------------------------

/**
 * Remove specific features by composite key. Queries each FeatureLayer to
 * find matching features, then deletes them via applyEdits.
 *
 * @returns Count of features removed.
 */
export async function removeResultFeatures (
  groupLayer: GroupLayer,
  compositeKeys: string[],
  widgetId: string
): Promise<number> {
  if (!compositeKeys.length) return 0

  // Unregister from popup registry before removing from map
  unregisterRecords(widgetId, compositeKeys)

  const keySet = new Set(compositeKeys)
  let totalRemoved = 0

  const layers = (groupLayer as any).layers?.toArray() || []

  for (const layer of layers) {
    if (!(layer as any).queryFeatures) continue

    // Query all features to find matches by COMPOSITE_KEY
    const featureSet = await (layer as any).queryFeatures({
      where: '1=1',
      outFields: ['OBJECTID', 'COMPOSITE_KEY'],
      returnGeometry: false
    })

    const toDelete: Graphic[] = []
    for (const feature of featureSet.features || []) {
      const key = feature.attributes?.COMPOSITE_KEY
      if (key && keySet.has(key)) {
        toDelete.push(feature)
      }
    }

    if (toDelete.length > 0) {
      await batchApplyEdits(layer as FeatureLayer, [], toDelete)
      totalRemoved += toDelete.length

      // P2: Remove from local key tracking after successful applyEdits
      const trackedKeys = getKeySet(widgetId)
      for (const f of toDelete) {
        const ck = f.attributes?.COMPOSITE_KEY
        if (ck) trackedKeys.delete(ck)
      }

      // r028.086: Hide Legend entry if this layer just went empty
      await disableLegendIfEmpty(layer as FeatureLayer, widgetId)

      debugLogger.log('FEATURE-LAYER', {
        event: 'removeResultFeatures',
        layerId: layer.id,
        removedCount: toDelete.length,
        remainingKeys: compositeKeys.length - totalRemoved
      })
    }
  }

  return totalRemoved
}

// ---------------------------------------------------------------------------
// Clear all features
// ---------------------------------------------------------------------------

/**
 * Remove all features from all FeatureLayers in the GroupLayer.
 *
 * r028.088: Reimplemented as destroy + lazy-recreate. The prior
 * implementation called `queryFeatures` then `applyEdits({deleteFeatures})`
 * per child FL. For large result sets (~400+ features) this was visibly
 * slow — JSAPI iterates the viewport features one by one updating spatial
 * indexes and the renderer, taking multiple seconds during which the user
 * could pan/zoom and see stale features. Heap-dump comparison also showed
 * a ~36 MB per-cycle accumulation (current applyEdits-delete path leaks
 * residue across cycles).
 *
 * New approach:
 *   1. Synchronously remove each child FL from the GroupLayer → map paints
 *      immediately without those features.
 *   2. Reset our own tracking state (ObjectId counter, key Set, popup registry).
 *   3. Destroy the layers off the critical path (microtask) so JSAPI can
 *      reclaim memory without blocking the UI.
 *   4. The next add lazily recreates the per-geometry FL via
 *      `getOrCreateFeatureLayer` (already the lazy-init pattern).
 *
 * Tradeoff: one popup-template build per geometry type on the first add
 * after a clear (~30 ms, mostly async). Vs the prior behavior's multi-second
 * visible lag, this is a clear win.
 */
export function clearResultFeatures (
  groupLayer: GroupLayer,
  widgetId: string
): Promise<void> {
  // r028.091: Filter to only the result FeatureLayers. The Path 3 GroupLayer
  // can have non-result children parented to it (currently: the buffer-preview
  // layer added by use-buffer-preview r028.083 for inherited visibility).
  // The prior r028.088 implementation destroyed ALL children indiscriminately,
  // which killed the buffer layer. The buffer hook's `bufferLayerRef.current`
  // still pointed at the destroyed layer; in-memory `removeAll()` / `add()`
  // calls don't throw on a destroyed JSAPI layer (they operate on the source
  // array), so the buffer hook silently no-op'd every subsequent attempt with
  // a false-positive `buffer-preview-updated` log. User-visible: buffer never
  // renders again until page reload. Filter by ID prefix to keep this clear
  // scoped to result FLs only.
  const allChildren = (groupLayer as any).layers?.toArray() || []
  const layers = allChildren.filter((layer: any) => {
    const id = layer?.id ?? ''
    return id.startsWith(`querysimple-fl-${widgetId}-`)
  })
  const layerCount = layers.length

  // Step 1: Synchronously detach from the group — map updates immediately.
  for (const layer of layers) {
    try {
      (groupLayer as any).layers.remove(layer)
    } catch (err) {
      debugLogger.log('FEATURE-LAYER', {
        event: 'clearResultFeatures-remove-warn',
        layerId: (layer as any)?.id,
        error: err instanceof Error ? err.message : String(err),
        timestamp: Date.now()
      })
    }
  }

  // Step 2: Reset our own state.
  resetObjectIdCounter(widgetId)
  resetKeyTracking(widgetId)
  clearRecordRegistry(widgetId)

  // Step 3: Destroy off the critical path so JSAPI can reclaim memory
  // without blocking the UI. Errors swallowed — best-effort cleanup.
  void Promise.resolve().then(() => {
    for (const layer of layers) {
      try {
        (layer as FeatureLayer).destroy()
      } catch { /* layer may already be destroyed */ }
    }
    debugLogger.log('FEATURE-LAYER', {
      event: 'clearResultFeatures-async-destroyed',
      layerCount,
      widgetId,
      timestamp: Date.now()
    })
  })

  debugLogger.log('FEATURE-LAYER', {
    event: 'clearResultFeatures',
    layerCount,
    widgetId,
    method: 'destroy-and-recreate',
    timestamp: Date.now()
  })

  return Promise.resolve()

  // P2: Clear local key tracking
  resetKeyTracking(widgetId)

  // Clear popup record registry
  clearRecordRegistry(widgetId)
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Get all composite keys currently on the map for a widget's result layers.
 * Useful for diffing accumulated records against what's already displayed.
 *
 * r028.042 (P2): Reads from module-level key tracking instead of querying
 * the MemorySource worker. Synchronous, no round-trip.
 */
export function getExistingCompositeKeys (
  widgetId: string
): Set<string> {
  return new Set(getKeySet(widgetId))
}

/**
 * Get the total feature count across all FeatureLayers in the GroupLayer.
 *
 * r028.042 (P2): Uses local key tracking size instead of querying
 * the MemorySource worker. Synchronous, no round-trip.
 */
export function getResultFeatureCount (
  widgetId: string
): number {
  return getKeySet(widgetId).size
}
