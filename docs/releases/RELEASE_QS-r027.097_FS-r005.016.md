# Release QS-r027.097 + FS-r005.016

**Release Date:** 2026-05-06
**Experience Builder Version:** 1.20.0+
**Previous Release:** [QS-r026.025 + FS-r004.005](RELEASE_QS-r026.025_FS-r004.005.md)

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r027.097 | Major update |
| **FeedSimple** | 1.20.0-r005.016 | Major update |
| **shared-code** | Required by both | Updated (security) |

> **Breaking Change (ExB Version):** This release targets **Experience Builder 1.20.0** with **ArcGIS Maps SDK for JavaScript 5.0.4** (Calcite 5.0). It is not backward-compatible with ExB 1.19. If you are still on ExB 1.19, use the previous release ([QS-r026.025 + FS-r004.005](RELEASE_QS-r026.025_FS-r004.005.md)).

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`. You must copy both `feed-simple/` and `shared-code/` into your widgets folder. Previous standalone releases remain available on the [Releases](https://github.com/MapSimple-Org/ExB-Simple-Public/releases) page.

---

## What's New

### ExB 1.20 / JSAPI 5.0 Upgrade (r027.019-039)

The entire widget suite has been upgraded to run natively on Experience Builder 1.20 with ArcGIS Maps SDK for JavaScript 5.0.4. This was a deep migration touching framework APIs, type systems, and runtime behavior.

**Key changes:**
- **`DataRecord.getId()` returns `number` instead of `string`** in JSAPI 5.0. All ID consumption sites coerced to `String()` across 12+ files.
- **`__esri.*` namespace fully migrated**: 419 references across 44 files replaced with explicit ESM type imports from `@arcgis/core`. The ambient `__esri` namespace is deprecated in JSAPI 5.0.
- **Calcite 5.0 compatibility**: Event prop casing (`onCalcitePopoverClose` -> `oncalcitePopoverClose`), `type='number'` replaced with `inputMode='numeric'`, NumericInput value type widened from `number` to `string | number`.
- **JSAPI 5.0 API changes**: `geometryEngine.union()` replaced with `unionOperator.executeMany()`, `defaultPopupTemplate` replaced with `createPopupTemplate()`, `getDataSource()` -> `.dataSource` property, `PopupTemplate.title` type widened.
- **TypeScript errors: 221 -> 0** across all widgets. All type-only fixes, no runtime behavior changes.
- **Manual smoke test passed** (2026-04-30) with all three widgets functional end-to-end.

### Security Hardening (r027.092-095, FS r005.014-016)

Three-group security pass protecting against XSS and injection via compromised data sources or feed content.

- **Group A (XSS prevention):** `escapeHtml()` applied to every substituted field value in `substituteTokens()`. HTML entity encoding for `& < > " '` runs before pipe filters, so admin-authored markdown syntax is unaffected. 7 inline legacy regex blocks collapsed into a single shared `substituteLegacyTokens()` export.
- **Group B (Dangerous URL blocking):** `isDangerousUrl()` blocks `javascript:`, `data:`, and `vbscript:` schemes in markdown links, images, and `resolveExternalLinkUrl()`. Case-insensitive with whitespace stripping. Dangerous links render as plain text; dangerous images render as alt text.
- **Group C (SQL field validation):** `isValidFieldName()` regex guard validates SQL identifiers before WHERE clause interpolation in typeahead/suggest. Fourth defense-in-depth layer behind Esri dropdown, config.json access control, and ArcGIS Server validation.
- **45 new security tests** across 3 test files covering all three groups.

### Select on Map Fix (r027.096-097)

Select on Map (blue outline highlighting) stopped working after the parcels layer migrated from a map-image service to a hosted feature layer. Root cause: the framework's indirect highlight chain is unreliable across layer types and ExB versions.

- **Direct highlight bypass:** `layerView.highlight()` called directly via `MapViewManager` -> `getJimuLayerViewByDataSourceId` -> `jimuLayerView.view.highlight(numericIds)`. Framework-independent.
- **Highlight handle cleanup:** `clearSelectOnMapHighlight()` called on Clear All / Remove to properly remove blue outlines.
- **Non-HFL guard:** When the origin layer lacks a `FeatureLayerView` (e.g., map-image layers), the `BUG` debug logger emits a `console.warn` with `BUG-SELECT-MAP-IMAGE-001`. Always visible, no `?debug=` parameter needed.

### Hover Pin Z-Order Fix (r027.091)

Hover preview pins were rendering behind results graphics. Moved hover pins back to `mapView.graphics` (map-level overlay), which always renders above `mapView.map.layers` per JSAPI behavior. Removed ~190 lines of hover layer management code.

### GraphicsLayer Architecture Cleanup (r027.033-034, r027.086-089)

- Graphics layer manager now always exposes the inner `GraphicsLayer` and tracks the parent `GroupLayer` separately.
- `getResultsLayer()` accessor returns the correct layer shape for all consumers.
- Prop chain widened to `GraphicsLayer | GroupLayer` across 11 files so terminal utilities can branch on layer kind.
- Eliminated a legend regression caused by storing the wrong layer shape after config switches.

### E2E Test Suite v2 (2026-04-25)

Fresh Playwright test suite built from video captures. Replaces legacy specs.

- **Category 1** (Query Execution Extended): 8 tests
- **Category 3** (Results Interaction): 6 tests
- **Category 4** (Accumulation Modes): 7 tests
- **Category 5** (Spatial Operations Mode): 6 tests
- **Category 6** (Spatial Draw Mode): 4 tests
- **Final run:** 35 passed, 4 skipped, 2 flaky, 0 failed across 8 spec files.

### Settings Improvements (r027.022-023)

- **DS conflict detection and one-click fix:** When two QS widgets share output data source IDs (from copy-pasted configs), a red banner appears with a "Fix: Regenerate IDs" button. Bidirectional detection also shows an amber banner on the affected "victim" widget pointing to the offender.

### Popover Visibility Fix (r027.024-025)

No-results and error popovers on both the Query and Spatial tabs now `scrollIntoView()` when triggered, preventing the popover from rendering off-screen on smaller viewports.

### Stability & Selection Fixes (r027.010, r027.016, r027.019)

Three interrelated fixes addressing selection state management under ExB 1.20's changed runtime behavior.

- **Selection loss on record removal** (r027.010): Removing a single result from the results list cleared all remaining selection highlights. Two root causes: `outputDS.getSelectedRecords()` returns `[]` in ExB 1.20 (records not stored by `selectRecordsByIds()`), and origin DS filtering compared numeric IDs against string IDs due to `getId()` returning `number`. Fixed by switching to `accumulatedRecords` as the source of truth and applying `String()` coercion on all IDs passed to `selectRecordsByIds()`.
- **Selection loss when switching between QS widgets** (r027.016): When two QS widgets share the same origin data source, opening the second widget cleared the first widget's card highlights. Same `getSelectedRecords()` root cause. Fixed with ID-based detection via `getSelectedRecordIds()` and automatic re-selection from accumulated records.
- **Cross-widget output DS crash** (r027.019): When two QS widgets share output DS IDs (from copy-pasted configs) and one destroys its output data source, the other widget's `handleDataSourceInfoChange` crashed on `selectRecordsByIds()`. Added null guard with diagnostic logging.

### Configuration Enhancements (r027.013-014)

- **Configurable widget header** (r027.013): New `showHeader` toggle in the Display section of settings. When disabled, the widget header bar is hidden, providing more vertical space for results.
- **Configurable spatial relationships** (r027.014): New `spatialTabRelationships` setting lets admins choose which spatial operations appear in the Spatial tab dropdown. Checkbox list in settings. Default: show all.
- **`WidgetConfigManager`** (r027.014): Former `HighlightConfigManager` renamed to reflect its broader role. New getters: `getShowHeader()`, `getSpatialTabRelationships()`.

### Dark Mode Detection (r027.001)

Theme mode detection (`theme.sys.color.mode`) wired into both QS (via `useTheme()`) and FS (via `this.props.theme`). New `DARK-MODE` debug logger tag. Logs initial mode on mount and mode changes on toggle. Foundation for future dark mode styling work.

### SqlClause Type Safety (r027.059-061)

New `sql-clause-utils.ts` module provides type guards and safe accessors for the jimu-core `SqlClause | SqlClauseSet` union. Type guards (`isSqlClause`, `isSqlClauseSet`) and safe accessors (`getClauseValue`, `getClauseFieldName`) replace unsafe property access across 21 consumption sites. 30 TypeScript errors cleared.

---

## FeedSimple Changes (r004.005 -> r005.016)

### Recap: Shared Code Dependency (r004, previous release)

Starting with r004 (shipped in the previous release), FeedSimple depends on `shared-code/`. This was a major architectural change: the markdown template engine, token substitution with pipe filters, and table rendering were extracted from FS into `shared-code/mapsimple-common/` and are now shared with QuerySimple. FeedSimple is no longer a single standalone folder. Previous standalone releases remain available for users who don't need the shared features.

### New in This Release (r005)

- **ExB 1.20 compatibility:** `getId()` coercion, `__esri` namespace migration (26 refs across 3 FS files), Calcite 5.0 NumericInput value widening (`number` -> `string | number`), ImmutableArray prop widening for ExB's immutable state, TS error cleanup to 0.
- **Security hardening:** Inherits Group A (`escapeHtml()` on all substituted field values) and Group B (`isDangerousUrl()` blocking dangerous URL schemes) automatically from shared-code. 14 new security tests in `token-renderer.test.ts` covering both XSS prevention and URL scheme blocking.

---

## Known Bugs

| Bug ID | Severity | Description |
|--------|----------|-------------|
| BUG-SELECT-MAP-IMAGE-001 | Medium | Select on Map cannot highlight map-image sublayers (no client-side `FeatureLayerView`). Selection data is applied to Redux but no blue outline appears. Guard emits `console.warn` automatically. |

> **Resolved in this release:** BUG-GRAPHICS-PROD-001 (polygon fill missing in production builds) — structurally eliminated. The r024 graphics architecture rewrite replaced all post-construction symbol property assignments with inline object literals. The hypothesized minification race condition is no longer possible. Never reproduced on ExB 1.20.

---

## Installation

### QuerySimple + HelperSimple

```bash
cp -r query-simple helper-simple shared-code /path/to/ExB-1.20/client/your-extensions/widgets/
```

### FeedSimple

```bash
# shared-code is required (since r004)
cp -r feed-simple shared-code /path/to/ExB-1.20/client/your-extensions/widgets/
```

> **Note:** If you are installing both QS and FS, you only need one copy of `shared-code/`.

## Compatibility

- **ArcGIS Experience Builder 1.20.0** or later
- **ArcGIS Maps SDK for JavaScript 5.0.4**
- Tested with ArcGIS Online and ArcGIS Enterprise
- **Not compatible with ExB 1.19** (use previous release for 1.19)

## Test Results

- **Unit tests:** 535/535 passing
- **E2E tests:** 35 passed, 4 skipped, 2 flaky, 0 failed
- **TypeScript errors:** 0

## Documentation

- `docs/query-simple/` -- Architecture, changelog, and process flow documents (12 flows)
- `docs/feed-simple/` -- Architecture, changelog, and configuration guide
- `docs/development/DEVELOPMENT_GUIDE.md` -- Updated with security section
- `docs/testing/EXB_1_20_JSAPI_5_MANUAL_SMOKE.md` -- 1.20 manual smoke test checklist
- `docs/releases/` -- All release notes
