# Singleton Migration Plan (r028.049-058)

Migrate 10 config properties from Redux selectors / prop-drilling to `widgetConfigManager` singleton getters.

**Branch:** `feature/v28-featurelayer-migration`
**Rule:** CLAUDE.md "Widget Config Access (The Singleton Rule)"
**Getters added:** r028.049 in `shared-code/mapsimple-common/widget-config-manager.ts`
**Debug tag:** `SETTINGS` (added r028.050, use `?debug=SETTINGS` to trace)
**Status:** Complete. All phases done, all tests passing (373/373).

---

## Phase 1: Stand up getters (DONE r028.049)

All 12 new getters added to `WidgetConfigManager`:

| Getter | Default | Section |
|--------|---------|---------|
| `getZoomOnResultClick(widgetId)` | `false` | Result Click Behavior |
| `getPanOnResultClick(widgetId)` | `false` | Result Click Behavior |
| `getHoverPinColor(widgetId)` | `'#EA4335'` | Hover Preview |
| `getResultListDirection(widgetId)` | `'Vertical'` | Result Display |
| `getResultPagingStyle(widgetId)` | `'Simple'` | Result Display |
| `getDefaultPageSize(widgetId)` | `10` | Result Display |
| `getLazyLoadInitialPageSize(widgetId)` | `20` | Result Display |
| `getMobilePopupCollapsed(widgetId)` | `false` | Mobile Popup Behavior |
| `getMobilePopupDockPosition(widgetId)` | `''` | Mobile Popup Behavior |
| `getMobilePopupHideDockButton(widgetId)` | `false` | Mobile Popup Behavior |
| `getMobilePopupHideActionBar(widgetId)` | `false` | Mobile Popup Behavior |
| `getQueryItems(widgetId)` | `[]` | Query Items |
| `getQueryItemByConfigId(widgetId, configId)` | `undefined` | Query Items |

---

## Phase 2: Redux selector migrations (DONE r028.050-054)

Each step: replace Redux selector with singleton call, add SETTINGS debug log, test, move to next.

### Step 1: `query-result.tsx` -- resultPagingStyle (DONE r028.050)

- **Replaced:** `ReactRedux.useSelector` reading `config.resultPagingStyle`
- **With:** `widgetConfigManager.getResultPagingStyle(widgetId)`
- **SETTINGS log:** `source: 'query-result'`, includes `resultPagingStyle`
- **Verified:** `"resultPagingStyle": "MultiPage"` in debug output

### Step 2: `query-result.tsx` -- resultListDirection (DONE r028.050)

- **Replaced:** `ReactRedux.useSelector` reading `config.resultListDirection`
- **With:** `widgetConfigManager.getResultListDirection(widgetId)`
- **SETTINGS log:** `source: 'query-result'`, includes `resultListDirection`
- **Verified:** `"resultListDirection": "Vertical"` in debug output

### Step 3: `query-result.tsx` -- mobile popup config (DONE r028.051)

- **Replaced:** `ReactRedux.useSelector` reading 4 mobile popup properties
- **With:** `React.useMemo` wrapping 4 singleton calls, preserving `MobilePopupParams` shape for `applyMobilePopupBehavior` and `getPopupCollapsedOption`
- **SETTINGS log:** `source: 'query-result'`, includes all 4 mobile keys
- **Verified:** `"mobilePopupCollapsed": true`, `"mobilePopupHideDockButton": true`, `"mobilePopupHideActionBar": true` in debug output

### Step 4: `query-result-item.tsx` -- resultListDirection (DONE r028.052)

- **Replaced:** `ReactRedux.useSelector` reading `config.resultListDirection`
- **With:** `widgetConfigManager.getResultListDirection(widgetId)` compared against `ListDirection.Horizontal`
- **SETTINGS log:** `source: 'query-result-item'`, includes `resultListDirection` and derived `isVerticalAlign`
- **Verified:** `"resultListDirection": "Vertical"`, `"isVerticalAlign": true` in debug output

### Step 5: `query-task.tsx` -- resultPagingStyle + lazyLoadInitialPageSize (DONE r028.053)

- **Replaced:** Two `ReactRedux.useSelector` calls
- **With:** `widgetConfigManager.getResultPagingStyle(widgetId)` and `widgetConfigManager.getLazyLoadInitialPageSize(widgetId)`
- **SETTINGS log:** `source: 'query-task'`, includes `resultPagingStyle` and `lazyLoadInitialPageSize`
- **Verified:** `"resultPagingStyle": "MultiPage"`, `"lazyLoadInitialPageSize": 20` in debug output

### Step 6: `query-task-form.tsx` -- queryItems lookup (DONE r028.054)

- **Replaced:** `ReactRedux.useSelector` reading `config.queryItems.find(...)` by configId
- **With:** `widgetConfigManager.getQueryItemByConfigId(widgetId, configId)`
- **SETTINGS log:** `source: 'query-task-form'`, includes `configId` and `queryItemFound`
- **Verified:** `"configId": "06367134367377913"`, `"queryItemFound": true` in debug output

---

## SETTINGS Debug Tag Reference

Added r028.050. Activate with `?debug=SETTINGS` in the app URL. Source label consistency fix in r028.058. Full coverage in r028.060.

| Source | File | Properties logged |
|--------|------|-------------------|
| `widget` | `widget.tsx` | `showHeader`, `addResultsAsMapLayer`, `resultsLayerTitle` |
| `query-result` | `query-result.tsx` | `resultPagingStyle`, `resultListDirection`, `mobilePopupCollapsed`, `mobilePopupDockPosition`, `mobilePopupHideDockButton`, `mobilePopupHideActionBar`, `zoomOnResultClick`, `panOnResultClick`, `flashOnMapIdentify` |
| `query-result-item` | `query-result-item.tsx` | `resultListDirection`, `isVerticalAlign`, `hoverPinColor`, `zoomOnResultClick`, `panOnResultClick` |
| `query-task` | `query-task.tsx` | `resultPagingStyle`, `lazyLoadInitialPageSize` |
| `query-task-form` | `query-task-form.tsx` | `configId`, `queryItemFound` |
| `graphics-layer-utils` | `graphics-layer-utils.ts` | `fillColor`, `fillOpacity`, `outlineColor`, `outlineOpacity`, `outlineWidth`, `pointSize`, `pointOutlineWidth`, `pointStyle` |
| `use-zoom-to-records` | `use-zoom-to-records.ts` | `pointZoomBufferFeet`, `zoomExpansionFactor` |
| `spatial-tab` | `SpatialTabContent.tsx` | `spatialTabRelationships`, `drawColor`, `bufferColor` |

**Not logged (by design):**
- `getDefaultPageSize` — dead prop, never consumed at runtime
- `getQueryItems` — full array is too verbose for console; individual lookups logged via `query-task-form`

---

## Phase 3: Prop-drilling removal (DONE r028.055-058)

Each step: remove prop from chain, read from singleton at consumption point, remove prop declarations from intermediate components. Done easiest-to-hardest.

### Step 10: `defaultPageSize` (DONE r028.055)

- **Chain:** widget.tsx -> query-task-list -> query-task-list-inline
- **Result:** Dead prop. Never consumed at any level (was passed through but unused). Removed from `widget.tsx` (3 JSX attributes), `query-task-list.tsx` (interface + destructuring + pass-through), `query-task-list-inline.tsx` (interface + destructuring + 2 pass-throughs).
- **Verified:** No behavioral change, 373/373 tests passing.

### Step 9: `hoverPinColor` (DONE r028.056)

- **Chain:** widget.tsx -> query-task-list -> query-task -> query-result -> simple-list -> query-result-item
- **Consumer:** `query-result-item.tsx` (hover pin creation, `memoizedSymbolData` useMemo)
- **Replaced with:** `widgetConfigManager.getHoverPinColor(widgetId)` at consumer
- **Removed from:** `widget.tsx` (2 JSX), `query-task-list.tsx`, `query-task.tsx`, `query-result.tsx`, `simple-list.tsx` (interface + destructuring + pass-through at each)
- **SETTINGS log:** `source: 'query-result-item'`, includes `hoverPinColor`
- **Verified:** `"hoverPinColor": "#EA4335"` in debug output. Hover pin displays correctly.
- **Bug fix:** Singleton read initially placed below `useMemo` that referenced it, causing `ReferenceError: Cannot access 'hoverPinColor' before initialization`. Moved all singleton reads above the `useMemo`.

### Step 7: `zoomOnResultClick` (DONE r028.057)

- **Chain:** widget.tsx -> query-task-list -> query-task -> query-result -> simple-list -> query-result-item
- **Consumers:** `query-result.tsx` (controls zoom button hide logic) and `query-result-item.tsx` (menu visibility)
- **Replaced with:** `widgetConfigManager.getZoomOnResultClick(widgetId)` at both consumers
- **Removed from:** `widget.tsx` (2 JSX), `query-task-list.tsx`, `query-task.tsx`, `query-result.tsx`, `simple-list.tsx` (interface + destructuring + pass-through at each)
- **SETTINGS log:** Both `source: 'query-result'` and `source: 'query-result-item'` include `zoomOnResultClick`
- **Verified:** Per-widget isolation confirmed (widget_66: `true`, widget_68: `false`)

### Step 8: `panOnResultClick` (DONE r028.057)

- **Same chain and consumers as Step 7**
- **Replaced with:** `widgetConfigManager.getPanOnResultClick(widgetId)` at both consumers
- **Removed from:** same 6 files as Step 7 (combined removal)
- **SETTINGS log:** Both sources include `panOnResultClick`
- **Verified:** Per-widget isolation confirmed (widget_66: `false`, widget_68: `true`)

### Step 11: `queryItems` (Kept as prop)

- **Chain:** widget.tsx -> query-task-list -> query-task -> simple-list
- **Decision:** Keep. The full `queryItems` array is genuinely needed at every level for rendering query lists, template cache lookups, and cross-query record resolution. The Redux selector in `query-task-form.tsx` was migrated in Step 6 (single-item lookup by configId), which was the appropriate migration target.

### r028.058: Source label consistency fix

- **Issue:** `query-result.tsx` SETTINGS log was missing `source: 'query-result'` field, making it harder to identify in console filtering. All other sources had the field.
- **Fix:** Added `source: 'query-result'` to the log call.

---

## Testing Protocol

After each step:
1. Run `npx jest --testPathPatterns "query-simple/tests/"` -- all 373+ must pass
2. Append `?debug=SETTINGS` to app URL -- verify singleton reads in console
3. Manual test the specific behavior listed for that step
4. Confirm no regressions in adjacent features

---

## Completion Criteria

- [x] All 12 getters in WidgetConfigManager (Phase 1, r028.049)
- [x] Steps 1-6: Zero Redux selectors for SettingConfig in runtime (Phase 2, r028.050-054)
- [x] Steps 7-10: Four prop chains eliminated (Phase 3, r028.055-058)
- [x] Step 11: queryItems prop chain evaluated, kept by design (full array needed at every level)
- [x] All tests passing (373/373)
- [x] CHANGELOG entry
- [x] Version bump (r028.058)
- [x] Commit and push

---

*Created: r028.049 (2026-05-15)*
*Phase 2 complete: r028.054 (2026-05-15)*
*Phase 3 complete: r028.058 (2026-05-15)*
