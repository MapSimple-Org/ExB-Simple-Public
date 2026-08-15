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
| User clicks Search | `query-task.tsx:1050` | `handleFormSubmit` callback, passed to `QueryTaskForm` at `query-task.tsx:1721`. r028.143: the click first passes `handleSearchClick` (query-task-form.tsx), the user-activation wrapper - if blocked (`getQueryFormBlockReason`: datasource-loading / input-invalid) it shows the refusal popover + live-region announce + FORM `search-refused` log and never reaches `applyQuery`. Enter routes through the same wrapper (the old silent Enter swallow is gone). Search/Reset are aria-disabled (focusable, WCAG-contrast blocked look), never natively disabled. |
| URL hash auto-execute | `query-task.tsx:1023` | Hash-value-converted listener calls `handleFormSubmitInternal`. r028.143: deliberately UNGUARDED - calls `applyQuery` directly, never refused (brief P1.9; validity state can lag on this path). |
| Data action | `query-task.tsx:1050` | External widget triggers query via `handleFormSubmit`. r028.143: also unguarded by design, same as the hash path. |

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
 handleFormSubmitInternal(sqlExpr, spatialFilter)     ← query-task.tsx:968
      │   (thin wrapper → delegates to executeQueryInternal)
      │                          ← query-execution-handler.ts
      │
      ├── Guard: no outputDS → exit
      │
      ├── Capture existing records (for Add mode)    ← query-execution-handler.ts:182-228
      │   └── Snapshot accumulatedRecords before query
      │
      ├── New mode? → clearResult()                  ← query-execution-handler.ts:232-239
      │
      ├── dispatch(SET_STAGE, 2) → show "Retrieving..."  ← query-execution-handler.ts:242
      │   (r024.126: useState→useReducer)
      │
      ├── generateQueryParams(...)                   ← query-execution-handler.ts:248
      │   │                          ← query-utils.ts:531
      │   ├── Determine outFields by FieldsType:
      │   │   ├── CustomTemplate → combineFields(null, title, id, content)
      │   │   ├── SelectAttributes → combineFields(displayFields, title, id)
      │   │   └── PopupSetting → visible popup fieldInfos, or text {FIELD} tokens + id
      │   │
      │   ├── Build WHERE clause                     ← query-utils.ts:582
      │   │   └── SQL Optimizer: unwrap LOWER() → UPPER value  ← query-utils.ts:593-608
      │   │
      │   └── Set pageSize (default 1000)            ← query-utils.ts:625
      │
      ├── Query Fork (USE_DIRECT_QUERY toggle)
      │   │                          ← query-execution-handler.ts
      │   │
      │   ├── TRUE (default) ─────────────────────────┐
      │   │   executeDirectQuery(...)                  │ ← direct-query.ts:85
      │   │   ├── Get FeatureLayer from DS             │ :106-108
      │   │   ├── resolveOutFields(queryItem, layer)   │ :52-75
      │   │   ├── featureLayer.createQuery()           │ :125
      │   │   ├── Set query.outSpatialReference        │ :137-140 (r024.111)
      │   │   ├── featureLayer.queryFeatures(query)    │ :142
      │   │   ├── Set graphic.layer on each graphic    │ :150-152
      │   │   └── outputDS.buildRecord(graphic)        │ :158
      │   │       → FeatureDataRecord with domains     │
      │   │                                            │
      │   ├── FALSE (ExB path) ───────────────────────┐│
      │   │   executeQuery(widgetId, item, ds, params) ││ ← query-utils.ts:674
      │   │   └── outputDS.load(params)                ││ ← query-utils.ts:709
      │   │       ⚠ No outSpatialReference fix         ││
      │   │       ⚠ ~115 MB/query memory leak          ││
      │   │                                            ││
      │   └── .catch → service/network error handling  ← query-execution-handler.ts:314-353
      │
      ▼
 queryPromise.then(result)                           ← query-execution-handler.ts:355-356
      │
      ├── Zero results? → show alert                 ← query-execution-handler.ts:373-391
      │
      ├── exceededTransferLimit? → truncation alert  ← query-execution-handler.ts:397-413 (r028.114)
      │   (forwarded out of executeDirectQuery's .then as _directExceededTransferLimit;
      │    New-mode clearResult ran before query exec here, so the dispatch survives)
      │   r028.122: when the service flags truncation, direct-query.ts verifies with a
      │   count-only query (queryFeatureCount). The flag is suppressed if the true total
      │   equals what was returned (spurious); otherwise the EXACT true total is forwarded
      │   as _directTrueCount and the alert shows "matched {total} ... {shown} shown".
      │
      ├── Results Mode Processing                    ← query-execution-handler.ts:415-784
      │   │
      │   ├── NewSelection → recordsToDisplay = result.records
      │   │
      │   ├── AddToSelection                         ← query-execution-handler.ts:419
      │   │   └── mergeResultsIntoAccumulated(...)    ← query-execution-handler.ts:437
      │   │       → { mergedRecords, addedRecordIds, duplicateRecordIds }
      │   │       └── All duplicates? → show alert   ← query-execution-handler.ts:474-475
      │   │
      │   └── RemoveFromSelection                    (similar pattern)
      │       └── removeResultsFromAccumulated(...)
      │
      ├── Update popup templates                     (various lines)
      │
      ├── dispatch(SET_RESULT_COUNT) → update widget state
      │   (r024.126: useState→useReducer)             ← query-execution-handler.ts:960
      │
      ├── dispatch(SET_STAGE, 1) → show results list ← query-execution-handler.ts:966
      │   (Spinner Bypass: UI updates before zoom)
      │
      └── Auto-zoom                                  ← query-execution-handler.ts:980-990
          ├── shouldZoom = runtime || config setting  ← query-execution-handler.ts:980-982
          └── zoomToRecords(recordsForZoom)           ← query-execution-handler.ts:990
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
| `PopupSetting` | Visible popup fieldInfos, or text content `{FIELD}` tokens + objectId | Origin DS popup info |

All field extraction uses `combineFields()` (query-utils.ts:25) which deduplicates
and always includes the objectId field.

**r028.037 PopupSetting optimization:** When the popup uses text content (not a fields
table), `fieldInfos` visible filtering yields nothing (all fields marked non-visible).
`resolvePopupOutFields()` now parses the popup's title, description, and
`popupElements` text entries for `{FIELD}` tokens as a middle step before falling back
to all fields. This drops queries like Parcels from 70+ fields to ~5.

---

## SQL Optimization

The "Universal SQL Optimizer" (query-utils.ts:593) converts:
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
the `USE_DIRECT_QUERY` toggle at query-execution-handler.ts:50.

---

## Error Handling

Service/network errors (query-execution-handler.ts:314-353) are detected by pattern
matching on error messages (fetch failures, timeouts, HTTP 4xx/5xx). These show a
user-facing alert. Processing errors propagate up the chain.

---

## Test Coverage

- `tests/direct-query.test.ts` — 14 tests: query execution, empty results, outSpatialReference, exceededTransferLimit, buildRecord wrapping, options passing, popup templates, logging, and the r028.122 truncation guard + true-count (spurious suppressed, genuine surfaced with exact count, count-error fallback, no-count-when-clean)
- `tests/query-utils.test.ts` — 38 tests: combineFields (8 including CustomTemplate), sanitizeQueryInput (3), isQueryInputValid (7), sanitizeSqlExpression (2), SQL optimizer (5), Field Shredder (2), PopupSetting mode (2), CustomTemplate mode (1), resolvePopupOutFields (8)

---

*Last updated: r028.143 (2026-08-14) — user-activation refusal wrapper documented in Entry Points (blocked click/Enter show a refusal, hash/dataAction paths deliberately unguarded). Prior: r028.118 (2026-06-02) — line-ref accuracy audit: resynced query-execution-handler.ts / query-utils.ts / direct-query.ts / query-task.tsx line numbers, entry points, and test counts to current code*
