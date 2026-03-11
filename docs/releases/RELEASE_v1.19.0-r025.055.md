# Release v1.19.0-r025.055

**Release Date:** 2026-03-11
**Experience Builder Version:** 1.19.0+

## Highlights

This release delivers two major user-facing features — a **Spatial Tab** for geometry-based querying and **Typeahead Suggestions** for free-form text inputs — along with Remove mode parity across both tabs and shared component extraction. Seven new source files, three new process flow documents, and full builder settings UI.

---

## Spatial Tab (r025.000–r025.052)

A new tab in the widget provides spatial querying through two modes:

### Operations Mode

Use accumulated results from the Query tab as spatial input. Select a buffer distance, spatial relationship, and target layers, then execute.

| Component | Description |
|-----------|-------------|
| Source indicator | Shows feature count from Results with blue/neutral styling |
| Buffer preview | Real-time geodesic rendering on map via `useBufferPreview` hook |
| Relationship selector | Calcite combobox with context-aware warnings |
| Target layers | Derived from widget config, deduplicated by `mainDataSourceId` |

### Draw Mode

Draw shapes directly on the map using JimuDraw integration. Seven tools available: point, polyline, polygon, rectangle, circle, freehand line, freehand polygon. Supports continuous multi-shape drawing with geometry accumulation and rectangle-selection for editing drawn shapes.

### Spatial Query Engine

| File | Lines | Responsibility |
|------|-------|----------------|
| `SpatialTabContent.tsx` | 977 | Two-mode toggle, buffer/relationship/target UI, execute flow |
| `execute-spatial-query.ts` | 241 | Multi-layer spatial query with per-layer error handling |
| `use-buffer-preview.ts` | 363 | Geodesic buffer preview, SR-aware operators, client-side geometry |
| `ResultsModeControl.tsx` | 137 | Shared New/Add/Remove segmented control |

### Key Behaviors

- **Client-side buffer geometry**: Buffer polygon sent as `query.geometry` instead of server-side `distance/units` — ensures relationships evaluate against the visible buffer shape
- **Mixed geometry support**: Groups geometries by type before union to prevent `executeMany` crash on mixed types
- **Context-aware warnings**: Warns when spatial relationship + geometry combination will produce misleading results (e.g., "Within" with points, "Crosses" with same-dimension types)
- **Spatial result default template**: Per-layer config flag designates one query's rendering settings for spatial results. Shared `combineFields()` for smart outFields
- **Full pipeline**: Execute → mode logic → graphics → zoom → auto-tab-switch
- **Back-button navigation**: Results tab returns to whichever tab (Query or Spatial) initiated the query
- **Configurable colors**: Draw symbol and buffer preview colors configurable in builder settings
- **Auto-clear on success**: Drawn shapes clear from map after successful query; preserved on zero results for retry

---

## Typeahead Suggestions (r025.053–r025.055)

Real-time value suggestions for free-form text inputs (PIN, address, name).

### Architecture

| File | Lines | Responsibility |
|------|-------|----------------|
| `suggest-utils.ts` | 341 | Detection, fetch queries, value injection |
| `useSuggest.ts` | 508 | Hook with state machine, debounce, keyboard nav |
| `SuggestPopover.tsx` | 210 | Dropdown UI with prefix highlighting, ARIA listbox |

### Key Behaviors

- **Companion hook pattern**: `useSuggest` attaches to SqlExpressionRuntime's container via capture-phase event listeners — SqlExpressionRuntime stays completely unchanged
- **Multi-clause SQL support**: Scans all expression parts, targets the first free-form clause, passes fixed clauses as `additionalWhere` filter
- **Operator-aware LIKE patterns**: Matches the SQL operator from the free-form part — `contains` → `%VALUE%`, `starts_with` → `VALUE%`, `ends_with` → `%VALUE%`
- **Debounced fetching**: 300ms debounce with AbortController cancellation
- **Keyboard navigation**: ArrowUp/Down, Enter to select, Escape to dismiss
- **Builder settings UI**: Switch toggle + NumericInput for min chars (1–10) and max suggestions (1–50)
- **Guard suppression**: No interference during hash parameter injection or self-injection

### Configuration

```json
{
  "enableSuggest": true,
  "suggestMinChars": 2,
  "suggestLimit": 10
}
```

---

## Remove Mode Parity (r025.052)

Brought Spatial tab Remove mode to full parity with Query tab:

- Remove button disabled when no accumulated records
- Popup auto-close on Remove execute
- All-records-removed cleanup via shared `clearSelectionInDataSources` utility
- Auto-reset to "New" mode when accumulated records are cleared

---

## New Files

| File | Lines | Purpose |
|------|-------|---------|
| `SpatialTabContent.tsx` | 977 | Spatial tab component |
| `execute-spatial-query.ts` | 241 | Multi-layer spatial query engine |
| `use-buffer-preview.ts` | 363 | Geodesic buffer preview hook |
| `ResultsModeControl.tsx` | 137 | Shared results mode segmented control |
| `suggest-utils.ts` | 341 | Suggest detection, fetch, inject utilities |
| `useSuggest.ts` | 508 | Suggest hook with state machine |
| `SuggestPopover.tsx` | 210 | Suggest dropdown component |
| **Total** | **2,777** | |

## New Process Flow Docs

| Doc | Subject |
|-----|---------|
| FLOW-09 | Buffer preview end-to-end flow |
| FLOW-10 | Spatial query execution flow |
| FLOW-11 | Spatial draw mode lifecycle |

---

## What Changed

| File | Before | After | Δ |
|------|--------|-------|---|
| `query-task.tsx` | 1,620 | 1,883 | +16% (spatial query orchestration) |
| `widget.tsx` | ~1,350 | 1,443 | +7% (spatial tab routing) |
| `QueryTabContent.tsx` | ~560 | 480 | −14% (ResultsModeControl extraction) |
| `config.ts` | — | +15 lines | Suggest + spatial config fields |
| `setting.tsx` | — | +60 lines | Suggest + spatial settings UI |
| **New files** | — | 2,777 | 7 new source files |
| **New docs** | — | 3 | Process flow docs |

**Tests:** 259 across 16 suites — all passing

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

- All existing configurations work unchanged
- Suggest is opt-in (`enableSuggest` defaults to `false`)
- Spatial tab appears automatically but has no impact on existing Query tab behavior
- No migration required

## Debugging

New debug tags for this release:

| Tag | What it tracks |
|-----|----------------|
| `SPATIAL` | Spatial tab query execution, target layers, buffer, results |
| `SUGGEST` | Typeahead detection, fetch queries, inject events |

Enable via URL: `?debug=SPATIAL,SUGGEST`

## Documentation

- [README](../../README.md) - Installation and configuration
- [CHANGELOG](../../CHANGELOG.md) - Full change history
- [Configuration Guide](../user-guide/QUERYSIMPLE_CONFIGURATION_GUIDE.md) - Section 18: Typeahead Suggestions
- [Process Flows](../process-flows/README.md) - 11 end-to-end flow documents
