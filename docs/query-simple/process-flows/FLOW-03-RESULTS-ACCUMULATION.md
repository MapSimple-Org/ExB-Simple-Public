# FLOW-03: Results Accumulation

## Overview

Manages how query results are combined across multiple queries. Three modes
determine whether new results replace, add to, or subtract from existing results.

**Key files:**
- `query-simple/src/runtime/results-management-utils.ts` — merge/remove/key logic
- `query-simple/src/runtime/query-execution-handler.ts` — results mode orchestration (r024.128, extracted from query-task.tsx)
- `query-simple/src/runtime/record-removal-handler.ts` — individual X-button removal (r024.131, extracted from query-result.tsx)
- `query-simple/src/config.ts` — `SelectionType` enum

---

## Results Modes

| Mode | Enum | Behavior |
|------|------|----------|
| New Selection | `NewSelection` | Replace all existing results with new query results |
| Add to Selection | `AddToSelection` | Merge new results into existing, deduplicate by key |
| Remove from Selection | `RemoveFromSelection` | Remove matching results from existing accumulation |

---

## Consumers

| Consumer | Location | Notes |
|----------|----------|-------|
| Query execution | `query-execution-handler.ts` | Standard attribute/spatial queries via configured outputDS |
| Spatial query execution | `handleExecuteSpatialQuery` in `query-task.tsx` | Spatial queries against target layers; records stamped with `__queryConfigId = 'spatial'` and `__spatialLayerTitle` |

Both consumers use `mergeResultsIntoAccumulated` and `removeResultsFromAccumulated`
identically. Results mode (New/Add/Remove) works the same for spatial results.

---

## Flow Diagram

```
 Query completes with result.records
      │                               ← query-execution-handler.ts:355-356
      │
      ├── NewSelection ──────────────────────────────┐
      │   recordsToDisplay = result.records          │
      │   (clearResult() was called before query)    │ ← query-execution-handler.ts:232-239
      │                                              │
      ├── AddToSelection ────────────────────────────┤
      │   │                                          │
      │   ▼                                          │
      │   mergeResultsIntoAccumulated(               │
      │     outputDS, newRecords, existingRecords)    │ ← query-execution-handler.ts:437
      │                ← results-management-utils.ts:121
      │   │                                          │
      │   ├── Build existing keys Set                │ :137-177
      │   │   ├── Check __queryConfigId attribute    │ :145
      │   │   ├── Look up origin DS via DSManager    │ :158
      │   │   └── Fallback: use outputDS             │ :175
      │   │                                          │
      │   ├── For each new record:                   │ :184-196
      │   │   ├── Generate key via getRecordKey()    │ :185
      │   │   ├── Key exists? → duplicateRecordIds   │ :188-190
      │   │   └── Key new? → uniqueNewRecords        │ :192-194
      │   │                                          │
      │   └── Return {                               │ :210-214
      │         mergedRecords: [...existing, ...new], │
      │         addedRecordIds,                      │
      │         duplicateRecordIds                   │
      │       }                                      │
      │   │                                          │
      │   ├── All duplicates? → show alert           │ ← query-execution-handler.ts:474-475
      │   └── recordsToDisplay = mergedRecords       │
      │                                              │
      ├── RemoveFromSelection ───────────────────────┤
      │   │                                          │
      │   ▼                                          │
      │   removeResultsFromAccumulated(              │
      │     outputDS, recordsToRemove, existing)     │
      │                ← results-management-utils.ts:230
      │   │                                          │
      │   ├── Empty existing? → return []            │ :236
      │   ├── Empty toRemove? → return existing      │ :245
      │   ├── Build removeKeys Set                   │ :255-257
      │   └── Filter: keep records not in removeKeys │ :263-272
      │                                              │
      └─────────────────────────────────────────────-┘
      │
      ▼
 Update widget state with recordsToDisplay
 dispatch(SET_RESULT_COUNT) → dispatch(SET_STAGE, 1) → auto-zoom
      │
      ▼
 See FLOW-04-ZOOM.md
```

---

## Record Key Generation

`getRecordKey()` (results-management-utils.ts:22) creates a composite key:

```
key = "${originDSId}_${objectId}"
```

This ensures uniqueness across layers. Two records with objectId `2` from
different layers produce different keys (`trails_ds_2` vs `parcels_ds_2`).

**Origin DS resolution priority:**
1. `outputDS.getOriginDataSources()[0].id` — primary
2. `outputDS.id` — fallback when no origin DS

---

## Cross-Layer Deduplication (r021.87)

When records come from different queries (different origin data sources),
`mergeResultsIntoAccumulated` uses `__queryConfigId` attributes stamped on
records to look up the correct origin DS:

```
Record attributes:
  __queryConfigId = "config_abc"  → look up queryConfig → get useDataSource → get DS
  __originDSId = "origin_ds_123"  → look up DS directly via DataSourceManager
```

This prevents false duplicates when different layers share objectId values.

---

## Two Parallel Visualization Paths

After accumulation logic completes, results are visualized through one of two
paths, selected by `config.addResultsAsMapLayer`:

- **Path 3 (FeatureLayer)** when `addResultsAsMapLayer === true`: a GroupLayer of
  per-geometry FeatureLayers, visible in the LayerList with native popup/identify.
- **Path 1 (highlight-only)** when `addResultsAsMapLayer === false` (default):
  ephemeral highlight graphics on a GraphicsLayer, not in the LayerList.

The accumulation logic (merge, dedup, remove) is identical across both paths; only
the layer type, persistence, and capabilities differ. (Path 2, a GraphicsLayer plus
LayerList-proxy FeatureLayer, was removed in the Path 2 Removal effort, TODO #24.)

```
 recordsToDisplay (from merge/replace/filter above)
      |
      +-- addResultsAsMapLayer === true ----------------+    PATH 3 — FEATURE LAYER (in LayerList)
      |   GroupLayer with per-geometry-type             |
      |   client-side FeatureLayer children             |
      |   (one each for point / polyline / polygon)     |
      |   +-- Visible in LayerList widget               |
      |   +-- Native popup/identify via FeatureLayerView|
      |   +-- Persistent across queries; features added |
      |       via applyEdits() in batches               |
      |   +-- createResultGroupLayer() / getOrCreate-   |    <- result-feature-layer-factory.ts
      |       FeatureLayer()                            |
      |   +-- syncResultFeatureLayers() diffs records   |    <- widget.tsx, serialized via
      |       and applies adds/removes                  |       async-serializer (r028.087)
      |   +-- Empty per-geometry FL has legendEnabled   |
      |       toggled to false; re-enabled on add       |       (r028.086)
      |   +-- GroupLayer auto-enabled to true if user   |
      |       toggled it off and runs a new query       |       (r028.081)
      |   +-- Popup auto-closed when user toggles       |
      |       GroupLayer off in LayerList               |       (r028.082)
      |                                                 |
      +-- addResultsAsMapLayer === false (default) -----+    PATH 1 — HIGHLIGHT-ONLY (ephemeral)
      |   Simple GraphicsLayer                          |
      |   +-- NOT visible in LayerList                  |
      |   +-- Temporary, destroyed on clear             |
      |   +-- createOrGetGraphicsLayer()                |
      |   +-- addHighlightGraphics(                     |
      |       graphicsLayer, records,                   |
      |       mapView)                                  |
      |                                                 |
      +-------------------------------------------------+
      |
      v
 selectRecordsInDataSources()  [shared]
      +-- originDS.selectRecordsByIds()
      +-- outputDS.selectRecordsByIds()
      +-- publishSelectionMessage()
```

See FLOW-08-DATA-SOURCES.md for the full comparison table.

---

## Individual Record Removal

When a user clicks the X button on a result row:

```
 X button click
      │
      ▼
 removeRecord(data)                          ← query-result.tsx:1113
      │   (thin wrapper → delegates to executeRemoveRecord)
      │                          ← record-removal-handler.ts (r024.131)
      │
      ▼
 removeRecordsFromOriginSelections(          ← results-management-utils.ts:306
   widgetId, recordsToRemove, outputDS,
   useGraphicsLayer?, graphicsLayer?, accumulatedRecords?)
      │
      ├── Remove from graphics layer (if using)  :332-353
      │   └── removeHighlightGraphics(layer, ids, records)
      │
      ├── Group records by origin DS             :356-422
      │   ├── Primary: __originDSId attribute → DSManager lookup  :367-371
      │   ├── Fallback: .dataSource property → getOriginDataSources  :374-380
      │   └── Final: outputDS.getOriginDataSources()  :383-402
      │
      ├── For each origin DS:                    :435-end
      │   ├── Get current IDs                    :441
      │   │   └── originDS.getSelectedRecordIds()
      │   │       (r027.010: ID-based — records not available in 1.20)
      │   ├── Build recordIdsToRemove Set        :444
      │   │   └── String(r.getId()) for type-safe comparison
      │   ├── Filter: keep IDs not in remove set :447
      │   │   └── currentSelectedIds.filter(id => !recordIdsToRemove.has(String(id)))
      │   ├── originDS.selectRecordsByIds(remainingIds, [])  :483
      │   │   (r027.010: empty records array — 1.20 only stores IDs)
      │   └── Publish DataRecordsSelectionChangeMessage
      │
      └── Done
```

---

## Test Coverage

`tests/results-management-utils.test.ts` — 17 tests:
- `getRecordKey` (7): origin DS key, fallback to outputDS, plus __originDSId-preference cases (r025)
- `mergeResultsIntoAccumulated` (4): merge with dedup, empty new, empty existing, all duplicates
- `removeResultsFromAccumulated` (4): remove matching, empty existing, empty toRemove, remove all
- `removeRecordsFromOriginSelections` (2): group by origin + update, empty input

---

*Last updated: r028.118 (2026-06-02) — line-ref accuracy audit: resynced results-management-utils.ts / query-execution-handler.ts / query-result.tsx line numbers and test counts to current code*
