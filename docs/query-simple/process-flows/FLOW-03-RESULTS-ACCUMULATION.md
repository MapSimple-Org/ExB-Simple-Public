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
      │                               ← query-execution-handler.ts:346-351
      │
      ├── NewSelection ──────────────────────────────┐
      │   recordsToDisplay = result.records          │
      │   (clearResult() was called before query)    │ ← query-execution-handler.ts:226-232
      │                                              │
      ├── AddToSelection ────────────────────────────┤
      │   │                                          │
      │   ▼                                          │
      │   mergeResultsIntoAccumulated(               │
      │     outputDS, newRecords, existingRecords)    │ ← query-execution-handler.ts:406
      │                ← results-management-utils.ts:120
      │   │                                          │
      │   ├── Build existing keys Set                │ :136-176
      │   │   ├── Check __queryConfigId attribute    │ :144
      │   │   ├── Look up origin DS via DSManager    │ :156-158
      │   │   └── Fallback: use outputDS             │ :174
      │   │                                          │
      │   ├── For each new record:                   │ :183-195
      │   │   ├── Generate key via getRecordKey()    │ :184
      │   │   ├── Key exists? → duplicateRecordIds   │ :187-189
      │   │   └── Key new? → uniqueNewRecords        │ :191-193
      │   │                                          │
      │   └── Return {                               │ :209-213
      │         mergedRecords: [...existing, ...new], │
      │         addedRecordIds,                      │
      │         duplicateRecordIds                   │
      │       }                                      │
      │   │                                          │
      │   ├── All duplicates? → show alert           │ ← query-execution-handler.ts:442
      │   └── recordsToDisplay = mergedRecords       │
      │                                              │
      ├── RemoveFromSelection ───────────────────────┤
      │   │                                          │
      │   ▼                                          │
      │   removeResultsFromAccumulated(              │
      │     outputDS, recordsToRemove, existing)     │
      │                ← results-management-utils.ts:229
      │   │                                          │
      │   ├── Empty existing? → return []            │ :235
      │   ├── Empty toRemove? → return existing      │ :244
      │   ├── Build removeKeys Set                   │ :254-256
      │   └── Filter: keep records not in removeKeys │ :262-271
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

`getRecordKey()` (results-management-utils.ts:21) creates a composite key:

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
paths controlled by `config.addResultsAsMapLayer`. The accumulation logic
(merge, dedup, remove) is identical in both paths -- only the graphics layer
type and persistence differ.

```
 recordsToDisplay (from merge/replace/filter above)
      |
      +-- addResultsAsMapLayer === true ----+    LAYERLIST PATH
      |   GroupLayer with child             |
      |   GraphicsLayer                     |
      |   +-- Visible in LayerList widget   |
      |   +-- Persistent across queries     |
      |   +-- createOrGetResultGroupLayer() |    <- graphics-layer-utils.ts:433
      |   +-- addHighlightGraphics(         |
      |       groupLayer, records, mapView) |
      |                                     |
      +-- addResultsAsMapLayer === false ---+    HIGHLIGHT-ONLY PATH
      |   Simple GraphicsLayer              |
      |   +-- NOT visible in LayerList      |
      |   +-- Temporary, destroyed on clear |
      |   +-- createOrGetGraphicsLayer()    |
      |   +-- addHighlightGraphics(         |
      |       graphicsLayer, records,       |
      |       mapView)                      |
      |                                     |
      +-------------------------------------+
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
 removeRecord(data)                          ← query-result.tsx:1038
      │   (thin wrapper → delegates to executeRemoveRecord)
      │                          ← record-removal-handler.ts (r024.131)
      │
      ▼
 removeRecordsFromOriginSelections(          ← results-management-utils.ts:305
   widgetId, recordsToRemove, outputDS,
   useGraphicsLayer?, graphicsLayer?, accumulatedRecords?)
      │
      ├── Remove from graphics layer (if using)  :331-352
      │   └── removeHighlightGraphics(layer, ids, records)
      │
      ├── Group records by origin DS             :354-421
      │   ├── Primary: __originDSId attribute → DSManager lookup  :366-370
      │   ├── Fallback: .dataSource property → getOriginDataSources  :373-378
      │   └── Final: outputDS.getOriginDataSources()  :382-384
      │
      ├── For each origin DS:                    :434-end
      │   ├── Get current IDs                    :440
      │   │   └── originDS.getSelectedRecordIds()
      │   │       (r027.010: ID-based — records not available in 1.20)
      │   ├── Build recordIdsToRemove Set        :443
      │   │   └── String(r.getId()) for type-safe comparison
      │   ├── Filter: keep IDs not in remove set :446
      │   │   └── currentSelectedIds.filter(id => !recordIdsToRemove.has(String(id)))
      │   ├── originDS.selectRecordsByIds(remainingIds, [])  :482
      │   │   (r027.010: empty records array — 1.20 only stores IDs)
      │   └── Publish DataRecordsSelectionChangeMessage
      │
      └── Done
```

---

## Test Coverage

`tests/results-management-utils.test.ts` — 12 tests:
- `getRecordKey`: origin DS key, fallback to outputDS
- `mergeResultsIntoAccumulated`: merge with dedup, empty new, empty existing, all duplicates
- `removeResultsFromAccumulated`: remove matching, empty existing, empty toRemove, remove all
- `removeRecordsFromOriginSelections`: group by origin + update, empty input

---

*Last updated: r027.017 (2026-04-06) — corrected line numbers for results-management-utils.ts and query-result.tsx*
