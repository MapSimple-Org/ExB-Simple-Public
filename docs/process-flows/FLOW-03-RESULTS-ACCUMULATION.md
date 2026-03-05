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
      │                ← results-management-utils.ts:117
      │   │                                          │
      │   ├── Build existing keys Set                │ :132-172
      │   │   ├── Check __queryConfigId attribute    │ :140
      │   │   ├── Look up origin DS via DSManager    │ :152-154
      │   │   └── Fallback: use outputDS             │ :170
      │   │                                          │
      │   ├── For each new record:                   │ :179-189
      │   │   ├── Generate key via getRecordKey()    │ :180
      │   │   ├── Key exists? → duplicateRecordIds   │ :183-184
      │   │   └── Key new? → uniqueNewRecords        │ :186-187
      │   │                                          │
      │   └── Return {                               │ :203-207
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
      │                ← results-management-utils.ts:223
      │   │                                          │
      │   ├── Empty existing? → return []            │ :229
      │   ├── Empty toRemove? → return existing      │ :238
      │   ├── Build removeKeys Set                   │ :248-250
      │   └── Filter: keep records not in removeKeys │ :256-265
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
 removeRecord(data)                          ← query-result.tsx:1023
      │   (thin wrapper → delegates to executeRemoveRecord)
      │                          ← record-removal-handler.ts (r024.131)
      │
      ▼
 removeRecordsFromOriginSelections(          ← results-management-utils.ts:299
   widgetId, recordsToRemove, outputDS,
   useGraphicsLayer?, graphicsLayer?, accumulatedRecords?)
      │
      ├── Remove from graphics layer (if using)  :324-345
      │   └── removeHighlightGraphics(layer, ids, records)
      │
      ├── Group records by origin DS             :347-414
      │   ├── Primary: __originDSId attribute → DSManager lookup  :358-362
      │   ├── Fallback: .dataSource property → getOriginDataSources  :367-371
      │   └── Final: outputDS.getOriginDataSources()  :374-377
      │
      ├── For each origin DS:                    :427-596
      │   ├── Get current selection              :430-431
      │   ├── Build composite keys to remove     :460-468
      │   │   key = "${recordId}__${queryConfigId}"
      │   ├── Filter: keep non-matching          :474-479
      │   ├── Fallback: simple recordId match    :484-499
      │   │   (for records without __queryConfigId)
      │   ├── originDS.selectRecordsByIds(remaining)  :538-539
      │   └── Publish DataRecordsSelectionChangeMessage  :576-578
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

*Last updated: r024.131 (2026-03-05) — corrected stale file:line references after r024.128-131 extractions*
