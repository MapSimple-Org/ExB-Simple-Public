# FLOW-08: Data Sources & Layer Lifecycle

## Overview

Describes the data source chain from configuration through query execution to
result display. Documents two parallel paths for results visualization:
the **LayerList path** (persistent GroupLayer) and the **highlight-only path**
(temporary GraphicsLayer).

**Key files:**
- `query-simple/src/config.ts` -- QueryItemType, UseDataSource, config shape
- `query-simple/src/runtime/query-task.tsx` -- DataSourceComponent usage, output DS lifecycle
- `query-simple/src/runtime/direct-query.ts` -- direct JS API query bypass
- `query-simple/src/runtime/selection-utils.ts` -- origin DS resolution
- `query-simple/src/runtime/graphics-layer-utils.ts` -- GroupLayer / GraphicsLayer creation/add (re-exports cleanup functions)
- `query-simple/src/runtime/graphics-cleanup-utils.ts` -- clear/cleanup functions for graphics layers
- `query-simple/src/setting/query-item-main-mode.tsx` -- DS configuration in settings

---

## Data Source Chain

```
 [Settings Panel]
      |
      v
 UseDataSource (config)
      |  (FeatureLayer reference from portal/server)
      |
      v
 DataSourceComponent                 <- query-task.tsx:1363
      |  key={dsRecreationKey}       (r021.51: forced remount pattern)  :1364
      |  useDataSource={useOutputDs}
      |
      +-- onDataSourceCreated        <- :632 (handleOutputDataSourceCreated)
      |   +-- dispatch(SET_OUTPUT_DS, ds)  (r024.127: useState→useReducer)  :633
      |   +-- Execute pending query if queued
      |
      v
 Output DataSource
      |  ID pattern: {widgetId}_output_{configId}
      |  Generated: query-item-main-mode.tsx:65
      |
      +-- getOriginDataSource()      <- selection-utils.ts:71
      |   +-- Calls outputDS.getOriginDataSources() internally
      |   +-- Typically one FeatureLayerDataSource
      |
      v
 Origin DataSource (FeatureLayerDataSource)
      |
      +-- createJSAPILayerByDataSource()  <- direct-query.ts:107
      |   +-- Creates __esri.FeatureLayer instance
      |
      v
 FeatureLayer (JS API)
      |
      +-- queryFeatures(query)           <- direct-query.ts:142
      |   +-- Returns FeatureSet with graphics
      |
      +-- outputDS.buildRecord(graphic)  <- direct-query.ts:158
      |   +-- Wraps graphic as FeatureDataRecord
      |   +-- Preserves coded domain formatting
      |
      v
 FeatureDataRecord[]
```

---

## Two Parallel Paths: FeatureLayer (LayerList) and Highlight-Only

After query results are obtained, the widget supports two visualization paths,
selected by `config.addResultsAsMapLayer`: Path 3 (FeatureLayer, in LayerList)
when `true`, and Path 1 (highlight-only) when `false` (default). Path 2, a
GraphicsLayer plus LayerList-proxy FeatureLayer, was removed in the Path 2
Removal effort (TODO #24).

```
 Query results (FeatureDataRecord[])
      |
      +-- addResultsAsMapLayer === true ----------------+    <- PATH 3 — FEATURE LAYER (in LayerList)
      |                                                 |
      |   createResultGroupLayer()                      |    <- result-feature-layer-factory.ts
      |   +-- GroupLayer (querysimple-fl-{widgetId})    |
      |   +-- Visible in LayerList widget               |
      |   +-- Native popup/identify via FeatureLayerView|
      |   +-- visibilityMode: 'inherited' cascades      |
      |   |   visibility to per-geometry children       |
      |   +-- title from widgetConfigManager            |
      |                                                 |
      |   getOrCreateFeatureLayer(geomType)             |
      |   +-- Lazy per-geometry FL (point / polyline /  |
      |   |   polygon)                                  |
      |   +-- listMode: 'hide' (only GroupLayer shown   |
      |   |   in LayerList)                             |
      |   +-- legendEnabled: true (toggled false when   |
      |   |   bucket goes empty, r028.086)              |
      |   +-- Concurrent-safe creation lock (r028.084)  |
      |                                                 |
      |   addResultFeatures(groupLayer, records,        |
      |     queryConfigId, widgetId)                    |    <- result-feature-layer-sync.ts
      |   +-- Group records by geometry type            |
      |   +-- applyEdits({addFeatures}) per bucket      |
      |   +-- Auto-enables GroupLayer.visible if user   |
      |   |   toggled it off (r028.081)                 |
      |   +-- Re-enables legendEnabled if hidden        |
      |                                                 |
      |   syncResultFeatureLayers() (widget.tsx)        |
      |   +-- Diffs accumulated records vs FL state     |
      |   +-- Serialized via async-serializer to        |
      |   |   prevent concurrent interleaving (r028.087)|
      |                                                 |
      +-- addResultsAsMapLayer === false (default) -----+    <- PATH 1 — HIGHLIGHT-ONLY (ephemeral)
      |                                                 |
      |   createOrGetGraphicsLayer()                    |    <- graphics-layer-utils.ts
      |   +-- Simple GraphicsLayer                      |
      |   +-- NOT visible in LayerList                  |
      |   +-- Temporary (destroyed on                   |
      |   |   widget close/clear)                       |
      |                                                 |
      |   addHighlightGraphics(                         |
      |     graphicsLayer, records, mapView)            |
      |   +-- Same symbology logic                      |
      |   +-- Add directly to layer                     |
      |                                                 |
      +------------------------------------------------+
      |
      v
 [Shared path continues]
      |
      +-- selectRecordsInDataSources()     <- selection-utils.ts:107
      |   +-- originDS.selectRecordsByIds()
      |   +-- outputDS.selectRecordsByIds()
      |
      +-- publishSelectionMessage()         <- selection-utils.ts:452
      |   +-- DataRecordsSelectionChangeMessage
      |
      +-- dispatchSelectionEvent()
```

### Path Comparison

| Aspect | Path 3 — FeatureLayer | Path 1 — Highlight-Only |
|--------|----------------------|------------------------|
| Config flag | `addResultsAsMapLayer = true` | `addResultsAsMapLayer = false` (default) |
| Layer type | GroupLayer with per-geometry FeatureLayers | Simple GraphicsLayer |
| LayerList visibility | GroupLayer visible; children hidden | Not visible |
| Native popup/identify | Yes (via FeatureLayerView) | No |
| Persistence | Survives clear/re-query | Destroyed on clear |
| Layer title | From `widgetConfigManager` | N/A |
| Create function | `createResultGroupLayer()` / `getOrCreateFeatureLayer()` | `createOrGetGraphicsLayer()` |
| Cleanup | `destroyResultLayers()` | `cleanupGraphicsLayer()` |

### Shared Behavior (All Paths)

All paths share these operations:
- Selection propagation to origin/output data sources via `selectRecordsInDataSources()`
- MessageManager selection change messages
- Zoom-to-results behavior
- Results accumulation (merge/dedup/remove)
- Export functionality

Path 1 uses `addHighlightGraphics()` (graphics-layer-utils.ts) for symbology and
graphic building. Path 3 has its own renderer-based symbology
(`buildRendererForGeometryType` in `result-feature-layer-factory.ts`) reading
the same `widgetConfigManager` config values.

---

## Origin DS Resolution

`getOriginDataSource()` (selection-utils.ts:71) resolves the origin data source:

```
 outputDS
      |
      +-- Has getOriginDataSources method?
      |   +-- YES: originDS = getOriginDataSources()[0]
      |   |   +-- Array not empty? -> return originDS
      |   |   +-- Empty array? -> check fallbacks
      |   +-- NO: check fallbacks
      |
      +-- Fallback 1: outputDS.layer exists?
      |   +-- YES -> return outputDS (already origin)
      |
      +-- Fallback 2: outputDS.type === 'FeatureLayer'?
      |   +-- YES -> return outputDS (already origin)
      |
      +-- All failed -> return null
```

---

## Query Path Comparison

| Aspect | Direct (USE_DIRECT_QUERY=true) | ExB DataSource |
|--------|-------------------------------|----------------|
| API | `featureLayer.queryFeatures()` | `outputDS.load()` |
| SR fix | `outSpatialReference` set (r024.111) | Not set |
| Memory | +1-14 MB/query | +115 MB/query (leak) |
| Records | `outputDS.buildRecord(graphic)` | Native DS records |
| Default | YES | NO |

See FLOW-02-QUERY-EXECUTION.md for full query path documentation.

---

## Record Key Generation

Records are keyed by composite ID for cross-layer deduplication:

```
key = "${originDSId}_${objectId}"
```

When records span multiple origin data sources (multi-query accumulation),
`__queryConfigId` and `__originDSId` attributes are used to look up the
correct origin DS via DataSourceManager:

```
Record attributes (stamped on creation):
  __queryConfigId = "config_abc"   -> look up queryConfig -> get useDataSource -> get DS
  __originDSId = "origin_ds_123"   -> look up DS directly via DataSourceManager
```

See FLOW-03-RESULTS-ACCUMULATION.md for full accumulation flow.

---

## DS Lifecycle Events

| Event | Trigger | Location |
|-------|---------|----------|
| DS created | DataSourceComponent mounts | query-task.tsx:632 (handleOutputDataSourceCreated) |
| DS destroyed | Widget unmounts or DS recreation | query-task.tsx:1363 (key change) |
| DS recreation | Config change or error recovery | dsRecreationKey state update |
| Selection change | Query results processed | selection-utils.ts:495 (selectRecordsAndPublish) |
| Selection clear | Clear results or widget close | selection-utils.ts:242 (clearSelectionInDataSources) |

---

*Last updated: r028.118 (2026-06-02) — line-ref accuracy audit*
