# Process Flow Documentation

End-to-end reference for the 14 major functions of the QuerySimple and
HelperSimple widgets. Each document includes ASCII flow diagrams, file:line
references, decision points, and test coverage notes.

## Flow Index

| Flow | Document | Summary |
|------|----------|---------|
| 01 | [FLOW-01-INITIALIZATION](FLOW-01-INITIALIZATION.md) | Widget startup sequence, manager pattern, component hierarchy |
| 02 | [FLOW-02-QUERY-EXECUTION](FLOW-02-QUERY-EXECUTION.md) | Query pipeline: form submit, Field Shredder, SQL Optimizer, direct vs ExB path |
| 03 | [FLOW-03-RESULTS-ACCUMULATION](FLOW-03-RESULTS-ACCUMULATION.md) | Results modes (New/Add/Remove), merge/dedup, LayerList vs highlight-only paths |
| 04 | [FLOW-04-ZOOM](FLOW-04-ZOOM.md) | Zoom-to-results: extent calculation, SR validation, zero-area buffering |
| 05 | [FLOW-05-SELECTION](FLOW-05-SELECTION.md) | Selection propagation: origin/output DS, graphics layer, message publishing |
| 06 | [FLOW-06-URL-HASH](FLOW-06-URL-HASH.md) | Deep linking: HelperSimple hash monitoring, widget opening, re-execution prevention |
| 07 | [FLOW-07-SETTINGS](FLOW-07-SETTINGS.md) | Settings panel: multi-stage wizard, config options, data source configuration |
| 08 | [FLOW-08-DATA-SOURCES](FLOW-08-DATA-SOURCES.md) | DS lifecycle: input/output/origin chain, LayerList vs highlight-only paths |
| 09 | [FLOW-09-BUFFER-PREVIEW](FLOW-09-BUFFER-PREVIEW.md) | Spatial tab real-time buffer preview: layer lifecycle, SR-aware operator selection, client-side geometry for spatial queries |
| 10 | [FLOW-10-SPATIAL-QUERY-EXECUTION](FLOW-10-SPATIAL-QUERY-EXECUTION.md) | Spatial query pipeline: two input modes (Operations/Draw), buffer decision, per-layer JSAPI execution, results mode merge |
| 11 | [FLOW-11-SPATIAL-DRAW-MODE](FLOW-11-SPATIAL-DRAW-MODE.md) | Spatial tab Draw mode: JimuDraw integration, module lazy loading, multi-shape geometry accumulation, mode switching, smart defaults |
| 12 | [FLOW-12-DATA-SOURCE-REBINDING](FLOW-12-DATA-SOURCE-REBINDING.md) | Rebind tool workflow for remapping query items when a layer is replaced in the web map. Covers broken DS detection, auto-heal vs field mapping, and orphan cleanup |
| 13 | [FLOW-13-POPUP-RENDERING](FLOW-13-POPUP-RENDERING.md) | Shared popup rendering across on-screen click, result-list click, and Results Panel card. ConfigId fallback fix, rendering mode detection |
| 14 | [FLOW-14-TYPEAHEAD-SUGGEST](FLOW-14-TYPEAHEAD-SUGGEST.md) | Typeahead dropdown: useSuggest state machine, suggest-utils fetch/cache, dual-path rendering (desktop fixed, mobile Popper) |

## Key Architectural Patterns

- **Manager & Shell**: Widget class delegates complex logic to 7 manager classes
- **Direct Query Bypass**: `USE_DIRECT_QUERY = true` skips ExB's DataSource.load() for memory efficiency
- **Field Shredder**: Only request minimum required fields from the service
- **SR Validation Guard**: Detects mixed spatial references before extent union operations
- **Event-Driven Orchestration**: HelperSimple and QuerySimple coordinate via window CustomEvents

## Two Parallel Visualization Paths

Results accumulation supports two visualization paths (documented in FLOW-03 and FLOW-08).
The old Path 2 (empty-FL-proxy GroupLayer) was removed in r028.096; the LayerList path is
now Path 3 (real FeatureLayers in a GroupLayer container, with popup/identify and native legend):

| Path | Config | Layer | LayerList | Persistence |
|------|--------|-------|-----------|-------------|
| LayerList (Path 3) | `addResultsAsMapLayer = true` | FeatureLayers in a GroupLayer | Visible | Persistent |
| Highlight-only (Path 1) | `addResultsAsMapLayer = false` | GraphicsLayer | Hidden | Temporary |

Both paths share: accumulation logic, selection propagation, zoom behavior, and export.

## Maintenance Rules

These flow documents are **living documentation**. They MUST be kept in sync with the code.

### When to Update Existing Flows

- **Code changes**: If a change affects any documented flow, update the corresponding
  FLOW-XX document. This includes new logic, removed logic, renamed functions, or
  changed file locations.
- **Line number shifts**: After refactors that move code, update file:line references
  in the affected flow doc so they stay accurate.
- **Test changes**: When adding or removing tests, update the flow doc's test coverage
  section and this README's test summary table.

### When to Create New Flows

If a new feature introduces a distinct end-to-end flow that doesn't fit into an
existing document, create a new FLOW-XX document following this format:

1. **Overview** with key files list
2. **Flow diagram** using ASCII art with file:line references
3. **Decision points** and configuration options
4. **Test coverage** section listing relevant test files
5. **Last updated** footer with version and date

Add the new flow to the Flow Index table above.

### Document Format Convention

- Use `file.ts:LINE` format for line references (e.g., `query-task.tsx:1419`)
- Use ASCII flow diagrams with `|`, `+--`, `v`, and `-->` connectors
- Keep diagrams readable at 80 columns
- Include the version tag (`rXXX.YYY`) when referencing when behavior was introduced

---

## Test Coverage Summary

| Test File | Tests | Module |
|-----------|-------|--------|
| `query-simple/tests/widget.test.tsx` | 5 | Widget lifecycle, rendering |
| `query-simple/tests/zoom-utils.test.ts` | 18 | Extent calc, expansion, SR validation |
| `query-simple/tests/direct-query.test.ts` | 10 | Query execution, SR propagation |
| `query-simple/tests/query-utils.test.ts` | 38 | Field shredding, SQL optimizer, sanitization, popup outFields, combineFields single-brace tokens |
| `query-simple/tests/results-management-utils.test.ts` | 17 | Merge, remove, dedup, record keys |
| `query-simple/tests/selection-utils.test.ts` | 21 | Origin DS, selection publish, hash cleanup |
| `query-simple/tests/export-utils.test.ts` | 34 | CSV/GeoJSON/JSON export, filename sanitization |
| `query-simple/tests/query-result.test.tsx` | 1 | Sticky expansion regression |
| `query-simple/tests/execute-spatial-query.test.ts` | 19 | Spatial query execution, buffer, multi-layer, multi-geometry dedupe (r028.101) |
| `query-simple/tests/suggest-utils.test.ts` | 19 | Typeahead suggest, debounce, field resolution |
| `query-simple/tests/rebind-utils.test.ts` | 49 | DS rebinding, field mapping, auto-heal, alias-map key remap (r028.117) |
| `query-simple/tests/result-feature-layer-factory.test.ts` | 37 | FeatureLayer factory, schema, GroupLayer |
| `query-simple/tests/value-formatter.test.ts` | 22 | Field-table value formatting: domain decode, date/number via Esri intl, meta mapping (r028.109) |
| `query-simple/tests/result-feature-layer-sync.test.ts` | 39 | applyEdits sync, batching, key tracking |
| `query-simple/tests/result-feature-layer-popup.test.ts` | 40 | Popup creator, title, configId fallback, registries, field-table aliases/formatting/escaping (r028.110) |
| `query-simple/tests/popup-render-utils.test.ts` | 11 | renderPopupContent/resolvePopupTitle: brace-style titles, alias labels, value formatting, cell escaping (r028.111), per-field alias override (r028.117) |
| `query-simple/tests/result-feature-layer-lifecycle.test.ts` | 29 | Layer lifecycle, cleanup, unmount |
| `query-simple/tests/results-mode-control.test.tsx` | 13 | Results mode switching, state transitions |
| `query-simple/tests/widget-visibility-manager.test.ts` | 3 | Observer self-disconnect, mount/unmount events |
| `query-simple/tests/async-serializer.test.ts` | 5 | Async operation serializer, queue ordering |
| `query-simple/tests/query-task-reducer.test.ts` | 5 | Alert state machine; truncation alert set/clear, RESET_FOR_CLEAR (r028.114) |
| `helper-simple/tests/widget.test.tsx` | 20 | Hash parsing, lifecycle, event handlers |
| `shared-code/mapsimple-common/tests/utils.test.ts` | 6 | Toggle array, popup field extraction |
| `shared-code/mapsimple-common/tests/markdown-template-utils.test.ts` | 79 | Markdown to HTML, token rendering |
| `shared-code/mapsimple-common/tests/widget-config-manager.test.ts` | 62 | Config persistence, validation |
| `shared-code/mapsimple-common/tests/status-indicator.test.tsx` | 3 | Status component rendering |
| `shared-code/mapsimple-common/tests/data-source-tip.test.tsx` | 3 | Data source tip rendering |
| `feed-simple/tests/token-renderer.test.ts` | 50 | Feed token substitution |
| `feed-simple/tests/feed-pipeline.test.ts` | 37 | Feed fetch, parse, transform pipeline |
| `feed-simple/tests/custom-xml-parser.test.ts` | 22 | XML/RSS/Atom parsing |
| `feed-simple/tests/markdown-template-utils.test.ts` | 12 | Feed markdown rendering |
| **Total** | **729** | |

---

*Last updated: r028.118 (2026-06-02) -- flow-currency pass: the Spatial Draw include-results feature (FLOW-09/10/11) and the field-table Customize settings/rebind/render docs (FLOW-07/12/13) were brought current. No tests changed; Table Total is still 729 (our four widgets). Jest's full-suite total is 730; the extra 1 is the excluded `simple` sample widget, which is not part of this project.*
