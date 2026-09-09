# FLOW-16: View in Table (data delivery + reveal)

The results-menu "View in Table" action delivers the current result set to ExB's Table widget as a
data-action tab AND reveals the table's pane (r028.157, TODO #44 - before that, data loaded into a
collapsed sidebar and nothing visibly happened; Esri KB 000038171 documents that the framework only
auto-opens Widget-Controller placements, which our apps do not use).

## Entry Points

| Trigger | Location | Description |
|---------|----------|-------------|
| Results menu "View in Table" | `runtime/results-menu.tsx:158` | `handleViewInTableClick` → `handleViewInTable(widgetId, dataSets)` |
| (gate) | `results-menu.tsx:74` | menu item only renders when `isTableWidgetAvailable()` (app config has a `widgets/common/table/` widget) |

## Flow Diagram

```
 User clicks "View in Table"            <- results-menu.tsx:158
      |
      v
 handleViewInTable(widgetId, dataSets)  <- data-actions/view-in-table-action.tsx:422
      |
      +-- findTableWidgetId()           first widgets/common/table/ instance in app config
      |
      +-- Reuse check per dataSet (r024.114): matching existing tab?
      |     |
      |     +-- ALL reusable -> activate last reused tab
      |     |        (widgetStatePropChange 'dataActionActiveObj')
      |     |     -> revealTableWidget(tableWidgetId)        <- r028.157, P2: reused path reveals too
      |     |     -> return
      |     |
      |     +-- else: build JSAPI FeatureLayer per dataSet
      |            (createJSAPIFeatureLayerByRecords), runtime DataSource,
      |            LayersConfig tab; deliver via MutableStoreManager
      |            'viewInTableObj' + widgetStatePropChange tab choreography
      |            ('settingChangeTab'/'activeTabId', r024.113 switch trick)
      |
      +-- Final 'dataActionActiveObj' dispatch
      |
      +-- revealTableWidget(tableWidgetId)                   <- r028.157, AFTER data delivery
      |     |                                                   (ordering gate-verified r028.156)
      |     +-- resolveRevealSteps(appConfig, tableId)       <- runtime/table-reveal-utils.ts, PURE
      |     |     walks widget/section/view layout maps per browser size mode
      |     |     (LARGE/MEDIUM/SMALL); emits steps:
      |     |       sidebar-expand   ONLY if the table's chain enters through that
      |     |                        sidebar's collapseSide (P9 - app 7's toolbox/nav
      |     |                        sidebars are non-concealing and get NOTHING)
      |     |       controller-open  ancestor is a Widget Controller
      |     |       section-nav      chain crosses a section view (r028.140 pattern)
      |     |     unknown/absent placements -> [] (honest no-op, never a throw)
      |     |
      |     +-- executeRevealSteps(steps)
      |           sidebar-expand   -> widgetStatePropChange(id, 'collapse', true)
      |                               (NOTE: collapse:true means EXPANDED - the same
      |                               dispatch the sidebar's own toggle makes)
      |           controller-open  -> appActions.openWidget(id)
      |           section-nav      -> click Navigator tab [aria-controls="{sec}_{view}"]
      |                               (visible instance; skips already-selected)
      |
      +-- debugLogger VIEW-TABLE 'table-reveal': steps, per-step outcomes,
          or 'no-op-nothing-conceals-the-table'
```

## Notes

- **No config toggle by ruling** (Adam, 2026-08-14): the reveal is a bug fix - the behavior users
  always expected. r028.137 no-config precedent. A toggle can be added later backward-compatibly.
- **The side check is the load-bearing subtlety.** A sidebar ancestor whose collapse side does NOT
  hold the table chain must get no dispatch: expanding it would reopen unrelated panes (app 7's
  toolbox/nav) that a user may have deliberately closed. The r028.156 probe blasted all 9 sidebar
  ancestors and looked fine only because those panes default open; the walker dispatches exactly 3
  (live-verified from the `table-reveal` log).
- **Repeat click re-reveals** (P10): the collapse state prop is stateless-dispatch friendly - a
  fresh `collapse: true` always wins over a user's manual collapse.
- **Resolver is pure and cold-room tested** (20 tests, `tests/table-reveal-utils.test.ts`) against
  structural projections of two real app configs, shipped at `tests/fixtures/table-reveal/`
  (r028.159; originally read the full app configs, which exist only in the private repo). App 7 is
  the discriminating one.
- Accepted limitations: first table-uri widget wins if an app has several tables; every QS widget
  reveals the same shared table.
- Debug: `?debug=VIEW-TABLE` (tag registered in shared-code debug-logger; also carries the tab
  delivery events).

## Test Coverage

| File | Tests | Covers |
|------|-------|--------|
| `query-simple/tests/table-reveal-utils.test.ts` | 20 | chain resolution both real apps, P9 exclusions by id, absence/degenerate configs, sizeModes dedupe, determinism, totality |

---
*Last updated: r028.157 (2026-08-14) - created with the reveal feature (TODO #44).*
