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
 DataSourceComponent                 <- query-task.tsx:1102
      |  key={dsRecreationKey}       (r021.51: forced remount pattern)
      |  useDataSource={useOutputDs}
      |
      +-- onDataSourceCreated        <- :593 (handleOutputDataSourceCreated)
      |   +-- dispatch(SET_OUTPUT_DS, ds)  (r024.127: useState→useReducer)
      |   +-- Execute pending query if queued
      |
      v
 Output DataSource
      |  ID pattern: {widgetId}_output_{configId}
      |  Generated: query-item-main-mode.tsx:65
      |
      +-- getOriginDataSources()     <- selection-utils.ts:63
      |   +-- Returns array of origin data sources
      |   +-- Typically one FeatureLayerDataSource
      |
      v
 Origin DataSource (FeatureLayerDataSource)
      |
      +-- createJSAPILayerByDataSource()  <- direct-query.ts:117
      |   +-- Creates __esri.FeatureLayer instance
      |
      v
 FeatureLayer (JS API)
      |
      +-- queryFeatures(query)           <- direct-query.ts:152
      |   +-- Returns FeatureSet with graphics
      |
      +-- outputDS.buildRecord(graphic)  <- direct-query.ts:165
      |   +-- Wraps graphic as FeatureDataRecord
      |   +-- Preserves coded domain formatting
      |
      v
 FeatureDataRecord[]
```

---

## Two Parallel Paths: LayerList vs Highlight-Only

After query results are obtained, the widget supports two visualization paths
controlled by `config.addResultsAsMapLayer`:

```
 Query results (FeatureDataRecord[])
      |
      +-- addResultsAsMapLayer === true ----+    <- LAYERLIST PATH
      |                                     |
      |   createOrGetResultGroupLayer()     |    <- graphics-layer-utils.ts:433
      |   +-- Find or create GroupLayer     |
      |   +-- GroupLayer visible in         |
      |   |   LayerList widget              |
      |   +-- Persistent across queries     |
      |   |   (survives clear/re-query)     |
      |   +-- resultsLayerTitle from config |
      |   |                                 |
      |   addHighlightGraphics(             |
      |     groupLayer, records, mapView)   |
      |   +-- Build graphics with           |
      |   |   highlight symbology           |
      |   +-- Add to child GraphicsLayer    |
      |   |   inside the GroupLayer         |
      |                                     |
      +-- addResultsAsMapLayer === false ---+    <- HIGHLIGHT-ONLY PATH
      |                                     |
      |   createOrGetGraphicsLayer()        |    <- graphics-layer-utils.ts
      |   +-- Simple GraphicsLayer          |
      |   +-- NOT visible in LayerList      |
      |   +-- Temporary (destroyed on       |
      |   |   widget close/clear)           |
      |                                     |
      |   addHighlightGraphics(             |
      |     graphicsLayer, records, mapView) |
      |   +-- Same symbology logic          |
      |   +-- Add directly to layer         |
      |                                     |
      +------------------------------------+
      |
      v
 [Shared path continues]
      |
      +-- selectRecordsInDataSources()     <- selection-utils.ts:99
      |   +-- originDS.selectRecordsByIds()
      |   +-- outputDS.selectRecordsByIds()
      |
      +-- publishSelectionMessage()         <- selection-utils.ts:468
      |   +-- DataRecordsSelectionChangeMessage
      |
      +-- dispatchSelectionEvent()
```

### Path Comparison

| Aspect | LayerList Path | Highlight-Only Path |
|--------|---------------|---------------------|
| Config flag | `addResultsAsMapLayer = true` | `addResultsAsMapLayer = false` (default) |
| Layer type | GroupLayer with child GraphicsLayer | Simple GraphicsLayer |
| LayerList visibility | Visible, titled | Not visible |
| Persistence | Survives clear/re-query | Destroyed on clear |
| Layer title | `config.resultsLayerTitle` | N/A |
| Create function | `createOrGetResultGroupLayer()` | `createOrGetGraphicsLayer()` |
| Cleanup | `cleanupAnyResultLayer()` | `cleanupGraphicsLayer()` |

### Shared Behavior (Both Paths)

Both paths share these operations:
- `addHighlightGraphics()` -- same symbology and graphic building logic
- Selection propagation to origin/output data sources
- MessageManager selection change messages
- Zoom-to-results behavior
- Results accumulation (merge/dedup/remove)
- Export functionality

---

## Origin DS Resolution

`getOriginDataSource()` (selection-utils.ts:63) resolves the origin data source:

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
| DS created | DataSourceComponent mounts | query-task.tsx:593 (handleOutputDataSourceCreated) |
| DS destroyed | Widget unmounts or DS recreation | query-task.tsx:1102 (key change) |
| DS recreation | Config change or error recovery | dsRecreationKey state update |
| Selection change | Query results processed | selection-utils.ts:511 |
| Selection clear | Clear results or widget close | selection-utils.ts:293 |

---

*Last updated: r024.131 (2026-03-05) — corrected stale file:line references after r024.128-131 extractions*
