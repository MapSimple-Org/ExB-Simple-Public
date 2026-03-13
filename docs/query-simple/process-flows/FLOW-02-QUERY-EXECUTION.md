# FLOW-02: Query Execution

## Overview

Executes feature queries against ArcGIS Feature Services. Supports two code paths:
a direct JS API path (default, via `executeDirectQuery`) and the ExB DataSource
path (via `outputDS.load`). Results are processed, merged (in accumulation mode),
and optionally trigger auto-zoom.

**Key files:**
- `query-simple/src/runtime/query-task.tsx` — orchestration (form submit → thin wrapper)
- `query-simple/src/runtime/query-submit-handler.ts` — form submit orchestration: DS destroy/recreate, hash wait (r024.130, extracted from query-task.tsx)
- `query-simple/src/runtime/query-execution-handler.ts` — core query pipeline (r024.128, extracted from query-task.tsx)
- `query-simple/src/runtime/query-utils.ts` — query parameter generation, SQL optimization
- `query-simple/src/runtime/direct-query.ts` — direct JS API query bypass
- `query-simple/src/config.ts` — FieldsType enum, QueryItemType interface

---

## Entry Points

| Trigger | Location | Description |
|---------|----------|-------------|
| User clicks Search | `query-task.tsx:1458` | `QueryTaskForm.handleFormSubmit` prop |
| URL hash auto-execute | `query-task.tsx:942` | HelperSimple dispatches event → auto-submit |
| Data action | `query-task.tsx:1458` | External widget triggers query |

---

## Flow Diagram

```
 User clicks Search / Hash auto-execute
      │
      ▼
 handleFormSubmit(sqlExpr, spatialFilter, runtimeZoomToSelected?)
      │   (thin wrapper → delegates to executeFormSubmit)
      │                          ← query-submit-handler.ts (r024.130)
      │
      ├── Check conversion status (DOM workaround)
      │   └── Wait up to 500ms if converting
      │
      ▼
 handleFormSubmitInternal(sqlExpr, spatialFilter)     ← query-task.tsx:928
      │   (thin wrapper → delegates to executeQueryInternal)
      │                          ← query-execution-handler.ts
      │
      ├── Guard: no outputDS → exit
      │
      ├── Capture existing records (for Add mode)    ← query-execution-handler.ts:176-221
      │   └── Snapshot accumulatedRecords before query
      │
      ├── New mode? → clearResult()                  ← query-execution-handler.ts:226-232
      │
      ├── dispatch(SET_STAGE, 2) → show "Retrieving..."  ← query-execution-handler.ts:236
      │   (r024.126: useState→useReducer)
      │
      ├── generateQueryParams(...)                   ← query-execution-handler.ts:242
      │   │                          ← query-utils.ts:258
      │   ├── Determine outFields by FieldsType:
      │   │   ├── CustomTemplate → combineFields(null, title, id, content)
      │   │   ├── SelectAttributes → combineFields(displayFields, title, id)
      │   │   └── PopupSetting → visible popup fieldInfos + id
      │   │
      │   ├── Build WHERE clause                     ← query-utils.ts:301
      │   │   └── SQL Optimizer: unwrap LOWER() → UPPER value  ← query-utils.ts:311-315
      │   │
      │   └── Set pageSize (default 1000)            ← query-utils.ts:338
      │
      ├── Query Fork (USE_DIRECT_QUERY toggle)
      │   │                          ← query-execution-handler.ts
      │   │
      │   ├── TRUE (default) ─────────────────────────┐
      │   │   executeDirectQuery(...)                  │ ← direct-query.ts:95
      │   │   ├── Get FeatureLayer from DS             │ :116-118
      │   │   ├── resolveOutFields(queryItem, layer)   │ :49-85
      │   │   ├── featureLayer.createQuery()           │ :135
      │   │   ├── Set query.outSpatialReference        │ :148 (r024.111)
      │   │   ├── featureLayer.queryFeatures(query)    │ :152
      │   │   ├── Set sourceLayer on each graphic      │ :156-159
      │   │   └── outputDS.buildRecord(graphic)        │ :165
      │   │       → FeatureDataRecord with domains     │
      │   │                                            │
      │   ├── FALSE (ExB path) ───────────────────────┐│
      │   │   executeQuery(widgetId, item, ds, params) ││ ← query-utils.ts
      │   │   └── outputDS.load(params)                ││
      │   │       ⚠ No outSpatialReference fix         ││
      │   │       ⚠ ~115 MB/query memory leak          ││
      │   │                                            ││
      │   └── .catch → service/network error handling  ← query-execution-handler.ts:305-334
      │
      ▼
 queryPromise.then(result)                           ← query-execution-handler.ts:346-351
      │
      ├── Zero results? → show alert                 ← query-execution-handler.ts:363-382
      │
      ├── Results Mode Processing                    ← query-execution-handler.ts:384-710
      │   │
      │   ├── NewSelection → recordsToDisplay = result.records
      │   │
      │   ├── AddToSelection                         ← query-execution-handler.ts:388
      │   │   └── mergeResultsIntoAccumulated(...)    ← query-execution-handler.ts:406
      │   │       → { mergedRecords, addedRecordIds, duplicateRecordIds }
      │   │       └── All duplicates? → show alert   ← query-execution-handler.ts:442
      │   │
      │   └── RemoveFromSelection                    (similar pattern)
      │       └── removeResultsFromAccumulated(...)
      │
      ├── Update popup templates                     (various lines)
      │
      ├── dispatch(SET_RESULT_COUNT) → update widget state
      │   (r024.126: useState→useReducer)             ← query-execution-handler.ts:914
      │
      ├── dispatch(SET_STAGE, 1) → show results list ← query-execution-handler.ts:920
      │   (Spinner Bypass: UI updates before zoom)
      │
      └── Auto-zoom                                  ← query-execution-handler.ts:932-944
          ├── shouldZoom = runtime || config setting  ← query-execution-handler.ts:934-936
          └── zoomToRecords(recordsForZoom)           ← query-execution-handler.ts:944
              → See FLOW-04-ZOOM.md
```

---

## Field Selection Strategy ("Field Shredder")

Only the minimum required fields are requested from the service. This avoids
fetching entire rows (which can include 50+ columns) for display of 3-5 fields.

| FieldsType | Fields Requested | Source |
|------------|-----------------|--------|
| `SelectAttributes` | displayFields + titleExpression tokens + objectId | `combineFields(displayFields, title, id)` |
| `CustomTemplate` | titleExpression tokens + contentExpression tokens + objectId | `combineFields(null, title, id, content)` |
| `PopupSetting` | Visible popup fieldInfos + objectId | Origin DS popup info |

All field extraction uses `combineFields()` (query-utils.ts:21) which deduplicates
and always includes the objectId field.

---

## SQL Optimization

The "Universal SQL Optimizer" (query-utils.ts:311) converts:
```sql
LOWER(FIELDNAME) = 'value'  →  FIELDNAME = 'VALUE'
LOWER(FIELDNAME) LIKE '%v%' →  FIELDNAME LIKE '%V%'
```
This enables SARGable queries that use database indexes instead of full table scans.

---

## Direct Query vs ExB Path

| Aspect | Direct (default) | ExB DataSource |
|--------|------------------|----------------|
| Toggle | `USE_DIRECT_QUERY = true` | Set to `false` |
| API | `FeatureLayer.queryFeatures()` | `outputDS.load()` |
| Memory | +1-14 MB/query | +115 MB/query (leak) |
| SR fix | `outSpatialReference` set (r024.111) | Not set (BUG-EXTENT-CACHE-001) |
| Records | `outputDS.buildRecord(graphic)` | Native DataSource records |
| Domains | Full coded domain formatting | Full coded domain formatting |

**WARNING:** Disabling direct query removes the outSpatialReference fix. See
the toggle comment at query-execution-handler.ts:47.

---

## Error Handling

Service/network errors (query-execution-handler.ts:305-334) are detected by pattern
matching on error messages (fetch failures, timeouts, HTTP 4xx/5xx). These show a
user-facing alert. Processing errors propagate up the chain.

---

## Test Coverage

- `tests/direct-query.test.ts` — 10 tests: query execution, empty results, outSpatialReference, exceededTransferLimit, buildRecord wrapping, options passing, popup templates, logging
- `tests/query-utils.test.ts` — 28 tests: combineFields (6 including CustomTemplate), sanitizeQueryInput (3), isQueryInputValid (6), sanitizeSqlExpression (2), SQL optimizer (5), Field Shredder (2), PopupSetting mode (2), CustomTemplate mode (1)

---

*Last updated: r024.131 (2026-03-05) — corrected stale file:line references after r024.128-131 extractions*
