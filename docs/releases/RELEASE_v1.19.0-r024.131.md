# Release v1.19.0-r024.132

**Release Date:** 2026-03-05
**Experience Builder Version:** 1.19.0+

## Highlights

This release focuses on codebase simplification, maintainability, and UI polish. The two largest widget files have been significantly reduced through systematic extraction of complex functions into focused handler modules, while preserving all existing behavior and passing all 164 tests.

---

## Codebase Simplification (r024.112-131)

### Major Extractions

**query-task.tsx: 2,950 → 1,620 lines (−45%)**

The query execution pipeline was extracted from a single monolithic component into focused handler files:

| Handler | Lines | Responsibility |
|---------|-------|----------------|
| `query-task-reducer.ts` | 197 | State management: 12 useState → single useReducer |
| `query-execution-handler.ts` | 1,044 | Full query pipeline: params, fork, results processing, zoom |
| `query-clear-handler.ts` | 328 | Sovereign Reset: graphics cleanup, DS destruction |
| `query-submit-handler.ts` | 348 | Form submit: DS destroy/recreate, hash wait, retry guard |

**query-result.tsx: 1,741 → 1,253 lines (−28%)**

| Handler | Lines | Responsibility |
|---------|-------|----------------|
| `record-removal-handler.ts` | 567 | X-button removal: composite-key matching, origin DS deselection |

All original functions remain as thin wrappers (10-16 lines) in their source components, preserving the existing API surface.

### Infrastructure Improvements

- **GraphicsStateManager singleton** (r024.120-121): 6 module-level Maps migrated to centralized state manager; 7 cleanup functions extracted to `graphics-cleanup-utils.ts`
- **Dead code deletion** (r024.112, r024.119): ~583 lines removed including dead `getMapViewFromDataSource()` (283 lines)
- **Logging prune** (r024.115): ~61 verbose log calls removed across 8 files
- **Directory rename** (r024.117): `hooks/` → `managers/` to reflect actual class-based pattern
- **Hash utilities** (r024.118): Consolidated hash URL manipulation into `hash-utils.ts`
- **Type safety** (r024.123): 7 `any` props → proper types in QueryTabContent

### View in Table Improvements

- **Tab-switch approach** (r024.113): Eliminates priming-tab memory leak in most scenarios
- **Duplicate tab reuse** (r024.114): Reuses existing tabs when data unchanged
- **Default hover pin color** (r024.116): Changed from yellow to Google Maps red

### Process Flow Documentation

8 end-to-end flow documents created/updated with ASCII diagrams and file:line references covering initialization, query execution, results accumulation, zoom, selection, URL hash, settings, and data sources.

---

## What Changed

| File | Before | After | Δ |
|------|--------|-------|---|
| `query-task.tsx` | 2,950 | 1,620 | −45% |
| `query-result.tsx` | 1,741 | 1,253 | −28% |
| `graphics-layer-utils.ts` | 1,741 | 1,032 | −41% |
| **New handler files** | — | 2,484 | — |
| **New utility files** | — | 578 | — |

**Tests:** 164 across 13 suites — all passing

---

## Installation

Copy the widget folders to your Experience Builder installation:

```
your-extensions/widgets/
  query-simple/
  helper-simple/
  shared-code/
```

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Backward Compatibility

- All changes are internal refactoring — no API or behavior changes
- No migration required
- All existing configurations work unchanged

## Documentation

- [README](../README.md) - Installation and configuration
- [CHANGELOG](../CHANGELOG.md) - Full change history
- [Process Flows](../docs/process-flows/README.md) - 8 end-to-end flow documents
