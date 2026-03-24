# Process Flow Documentation

End-to-end reference for the 12 major functions of the QuerySimple and
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

## Key Architectural Patterns

- **Manager & Shell**: Widget class delegates complex logic to 7 manager classes
- **Direct Query Bypass**: `USE_DIRECT_QUERY = true` skips ExB's DataSource.load() for memory efficiency
- **Field Shredder**: Only request minimum required fields from the service
- **SR Validation Guard**: Detects mixed spatial references before extent union operations
- **Event-Driven Orchestration**: HelperSimple and QuerySimple coordinate via window CustomEvents

## Two Parallel Visualization Paths

Results accumulation supports two visualization paths (documented in FLOW-03 and FLOW-08):

| Path | Config | Layer | LayerList | Persistence |
|------|--------|-------|-----------|-------------|
| LayerList | `addResultsAsMapLayer = true` | GroupLayer | Visible | Persistent |
| Highlight-only | `addResultsAsMapLayer = false` | GraphicsLayer | Hidden | Temporary |

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
| `query-simple/tests/query-utils.test.ts` | 28 | Field shredding, SQL optimizer, sanitization |
| `query-simple/tests/results-management-utils.test.ts` | 12 | Merge, remove, dedup, record keys |
| `query-simple/tests/selection-utils.test.ts` | 21 | Origin DS, selection publish, hash cleanup |
| `query-simple/tests/export-utils.test.ts` | 34 | CSV/GeoJSON/JSON export, filename sanitization |
| `query-simple/tests/query-result.test.tsx` | 1 | Sticky expansion regression |
| `helper-simple/tests/widget.test.tsx` | 20 | Hash parsing, lifecycle, event handlers |
| `query-simple/tests/widget-visibility-manager.test.ts` | 3 | Observer self-disconnect, mount/unmount events |
| `shared-code/tests/utils.test.ts` | 6 | Toggle array, popup field extraction |
| `shared-code/tests/status-indicator.test.tsx` | 3 | Status component rendering |
| `shared-code/tests/data-source-tip.test.tsx` | 3 | Data source tip rendering |
| **Total** | **164** | |

---

*Last updated: r025.072 (2026-03-15)*
