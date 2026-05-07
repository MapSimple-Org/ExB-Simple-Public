# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition. Built for performance, deep-linking, and advanced result management.

**Current Version**: QS `1.20.0-r027.097` | FS `1.20.0-r005.016`
**Latest Update**: ExB 1.20 upgrade, security hardening, Select on Map fix (May 6, 2026)

## Key Differentiators (Why QuerySimple?)

QuerySimple is designed to solve the common pain points of the standard Experience Builder query widget:

- **93% Latency Reduction**: Powered by a **Universal SQL Optimizer** that automatically rewrites expensive queries to use database indexes, plus **Attribute Stripping** to minimize network payloads.
- **Dual-Mode Deep Linking**: Support for both Hash Fragments (`#shortId=val`) and Query Strings (`?shortId=val`).
- **Results Accumulation**: Unlike the standard widget which clears results on every search, QuerySimple allows you to "Add to" or "Remove from" a selection set across multiple different queries.
- **Discoverable Automation**: An interactive "Info Button" automatically appears to show users exactly how to deep-link to the current layer.
- **Persistence & Restoration**: Selections are maintained even when the identify tool is used, ensuring users never lose their search context.

---

## What's New (May 2026)

> **Breaking Change:** This release targets **Experience Builder 1.20.0** with **ArcGIS Maps SDK for JavaScript 5.0.4** (Calcite 5.0). It is **not backward-compatible** with ExB 1.19. If you are still on ExB 1.19, use the previous release ([QS-r026.025 + FS-r004.005](docs/releases/RELEASE_QS-r026.025_FS-r004.005.md)).

> Full release notes: [RELEASE_QS-r027.097_FS-r005.016](docs/releases/RELEASE_QS-r027.097_FS-r005.016.md)

### ExB 1.20 / ArcGIS Maps SDK for JavaScript 5.0 Migration

This release is built on a ground-up migration to Experience Builder 1.20, which ships ArcGIS Maps SDK for JavaScript 5.0.4, Calcite Design System 5.0.2, and runs on Node 24. This was not a version bump. It was a deep audit and rewrite of every integration point between our widgets and the Esri framework.

**`DataRecord.getId()` type change.** JSAPI 5.0 changed the return type of `DataRecord.getId()` from `string` to `number`. Every location where record IDs are compared, stored in Redux, passed to selection APIs, or used as Map keys was traced and coerced with `String()`. 12+ files across QuerySimple and HelperSimple were affected. Without this fix, selections silently fail: `Set<string>.has(numericId)` returns `false`, record removal compares mismatched types, and card highlight borders disappear because Redux `selectedIds` (strings from initial selection) never match `getId()` results (now numbers).

**`__esri.*` namespace removal.** The ambient `__esri` type namespace (e.g., `__esri.Graphic`, `__esri.MapView`) is deprecated in JSAPI 5.0 and scheduled for removal in 6.0. All 419 references across 44 files were replaced with explicit ESM type imports from `@arcgis/core` in a 17-pass migration, executed file-by-file with per-file test, type-check, and build validation at every step. New imports cover `Extent`, `FeatureLayer`, `Graphic`, `GraphicsLayer`, `GroupLayer`, `MapView`, `Point`, `Polygon`, `PopupTemplate`, `SimpleFillSymbol`, and 20+ additional types.

**Calcite 5.0 compatibility.** Calcite Design System 5.0 introduced breaking changes to its web component API. Event property casing changed from camelCase to lowercase (`onCalcitePopoverClose` to `oncalcitePopoverClose`), and without the fix, popover close handlers silently stop firing. `type='number'` is no longer valid on `calcite-input` (replaced with `inputMode='numeric'`). `NumericInput.onAcceptValue` widened from `number` to `string | number`, requiring explicit `Number()` coercion at every consumption site.

**JSAPI 5.0 API replacements.** `geometryEngine.union()` was replaced with `unionOperator.executeMany()`. The `defaultPopupTemplate` property was removed in favor of `createPopupTemplate()`. `Graphic.sourceLayer` and `FeatureLayer.associatedLayer` were removed entirely (5 source sites and 2 test fixtures updated).

**TypeScript errors: 221 to 0.** Every type error surfaced by the 1.20 type system was resolved through type-only fixes: casts, local type aliases, import path corrections, interface completions, and JSX pragma additions. Zero runtime behavior changes. The widget suite compiles cleanly against the 1.20 toolchain.

**Manual smoke test passed** on April 30, 2026. All three widgets (QuerySimple, HelperSimple, FeedSimple) functional end-to-end against ExB 1.20, JSAPI 5.0.4, Calcite 5.0.2, and Node 24.

### Security Hardening

A three-group security pass protects the template rendering engine and query pipeline against XSS injection and URL scheme attacks via compromised data sources or feed content.

**Group A: XSS Prevention.** `escapeHtml()` is applied to every substituted field value inside `substituteTokens()`, the shared function powering both QuerySimple and FeedSimple template rendering. HTML entity encoding for `& < > " '` runs before pipe filters execute, so admin-authored markdown syntax (bold, italic, links, tables) is unaffected. Only the raw field data from the data source is escaped. Seven inline legacy regex blocks in QuerySimple were consolidated into a single shared `substituteLegacyTokens()` export, ensuring consistent handling across both old `{field}` and new `{{field}}` token formats.

**Group B: Dangerous URL Blocking.** A new `isDangerousUrl()` guard blocks `javascript:`, `data:`, and `vbscript:` URL schemes in markdown links, markdown images, and the external link URL resolver. A markdown link like `[click me](javascript:alert(1))` renders as plain text instead of a clickable link. A markdown image pointing to a `data:` URI renders as alt text instead of loading the payload. The check is case-insensitive with whitespace stripping, preventing bypass attempts.

**Group C: SQL Field Validation.** `isValidFieldName()` applies a regex guard to validate SQL identifiers before WHERE clause interpolation in the typeahead/suggest feature. This is a fourth defense-in-depth layer behind the Esri field dropdown, config.json access control, and ArcGIS Server's own query validation.

**45 new security tests** across 3 test files cover all three groups, validating both legitimate content pass-through and malicious content blocking.

### Select on Map Fix

Select on Map (blue outline highlighting via the results menu) stopped working after a common layer migration: moving from a map-image service to a hosted feature layer. The root cause was the ExB framework's indirect highlight chain, which routes through MessageManager and DataSourceManager and is unreliable across layer types and ExB versions.

The fix bypasses the framework entirely. `layerView.highlight()` is called directly via `MapViewManager` using numeric feature IDs. A cleanup function is called on Clear All and record removal to properly remove blue outlines. When the origin layer lacks a `FeatureLayerView` (map-image sublayers), a `console.warn` is emitted automatically with the bug ID `BUG-SELECT-MAP-IMAGE-001`, always visible without `?debug=` parameters. This tells developers they have hit a known limitation rather than a configuration error.

### Shared Template Engine and Markdown Tables

For users upgrading from versions prior to March 2026, this distribution includes the shared markdown template engine that shipped in QS r026 / FS r004:

**Unified `{{field | filter}}` syntax.** Both QuerySimple and FeedSimple share the same double-brace token syntax with chainable pipe filters. 16 filters are available for date formatting (`{{field | date:MM/DD/YYYY}}`), math operations (`{{field | multiply:100 | round:2}}`), text transformation (`{{field | uppercase}}`, `{{field | truncate:50}}`), and link generation (`{{field | autolink}}`). The rendering engine, token substitution logic, and all pipe filters live in `shared-code/mapsimple-common/` as a single source of truth for both widgets. QuerySimple's settings panel includes a one-click migration button that detects old `{FIELD}` tokens and converts them to `{{FIELD}}` format with a before/after preview.

**Markdown tables.** Card and popup templates support pipe-delimited markdown tables rendered as styled HTML `<table>` elements with borders, header row styling, and configurable text alignment (`:---` left, `:---:` center, `---:` right). A visual **Table Builder** in the settings panel lets you design tables in an inline grid editor (2 to 6 columns, 1 to 10 rows) and insert the generated markdown at your cursor position.

**Markdown formatting.** The shared engine supports headings (h1 through h6), bold, italic, inline code, links, images, horizontal rules, blockquotes, and ordered/unordered lists. All formatting is processed after token substitution, so field values flow into the template structure naturally.

**Data Source Rebinding Tool.** When a layer is replaced in the web map, the rebinding tool in QuerySimple's settings panel lets you rebind all affected queries without reconfiguring each one manually. Auto-heal mode handles identical field names in one click. Field mapping mode provides an interactive remapping table when field names differ, with auto-matching for identical names, dropdown selectors for the rest, and a "leave unmapped fields as-is" option for partial rebinding. Covers all field reference types: SQL expressions, title and content templates (both `{{field}}` and legacy `{field}` syntax with pipe filter preservation), display fields, sort options, and title fields. 48 unit tests cover the rebinding pipeline.

**Per-Result Pan To.** Each result card has a Pan To button (hand icon) that centers the map on the feature without changing zoom level. A `panOnResultClick` config toggle makes pan the default click behavior, mutually exclusive with zoom-on-click.

### Builder and Settings Improvements

**Data Source Conflict Detection and One-Click Fix.** When a widget config is copy-pasted in the Experience Builder designer, the framework can silently carry over output data source IDs from the original widget. Two widgets sharing the same output DS IDs crash at runtime. This release adds bidirectional detection: the offending widget shows a red banner identifying the conflict with a "Fix: Regenerate IDs" button. The affected "victim" widget shows an amber banner pointing to the offender by name. After the fix, save the app and the banners disappear on reload.

**Configurable Widget Header.** New `showHeader` toggle in the Display section of settings. Hides the widget header bar when you need more vertical space for results.

**Configurable Spatial Relationships.** New `spatialTabRelationships` setting lets admins choose which spatial operations appear in the Spatial tab dropdown. If your users only need Intersects and Within, hide the other five relationships to simplify the interface.

### Stability Fixes

- **Selection loss on record removal** (r027.010): Removing one result cleared all remaining highlights. Root cause: `getSelectedRecords()` returns an empty array in ExB 1.20 and origin DS ID comparison failed on numeric/string type mismatch. Fixed with ID-based selection from accumulated records.
- **Selection loss between QS widgets** (r027.016): Switching between two QS widgets sharing the same origin data source cleared the first widget's highlights. Same `getSelectedRecords()` root cause. Fixed with `getSelectedRecordIds()` and automatic re-selection.
- **Cross-widget output DS crash** (r027.019): Sharing output DS IDs between widgets caused a crash when one destroyed its data source. Added null guard with diagnostic logging.
- **Hover pin z-order** (r027.091): Hover preview pins rendering behind results graphics. Moved to `mapView.graphics` (always renders above layer graphics per JSAPI stacking order). Removed ~190 lines of hover layer management code.
- **Popover visibility** (r027.024-025): No-results and error popovers on both the Query and Spatial tabs now `scrollIntoView()` when triggered, preventing off-screen rendering on smaller viewports.

### GraphicsLayer Architecture Cleanup

The graphics layer manager was refactored to cleanly separate the inner `GraphicsLayer` (which holds feature graphics) from the parent `GroupLayer` (which organizes it in the layer list). Previously, some consumers received the wrong layer type, causing property access errors and a legend regression when switching configurations. The prop chain was widened across 11 files so utilities can branch on layer kind where needed.

### E2E Test Suite v2

A fresh Playwright test suite built from video captures of real user sessions replaces the legacy specs.

| Category | Tests | Coverage |
|----------|-------|----------|
| **1: Query Execution Extended** | 8 | Query execution, URL parameters, result display |
| **3: Results Interaction** | 6 | Card expansion, popup, zoom, Remove mode |
| **4: Accumulation Modes** | 7 | New/Add/Remove transitions, cross-query accumulation |
| **5: Spatial Operations** | 6 | Buffer config, target layers, spatial query execution |
| **6: Spatial Draw Mode** | 4 | Draw tools, geometry drawing, spatial query from shapes |

**Final run:** 35 passed, 4 skipped, 2 flaky, 0 failed across 8 spec files.

### FeedSimple r005.016

FeedSimple's changes in this release center on ExB 1.20 compatibility and inherited security protections:

- **ExB 1.20 compatibility**: `getId()` coercion, `__esri` namespace migration (26 references across 3 FS-specific files), Calcite 5.0 `NumericInput` value widening (`number` to `string | number` in `onAcceptValue` callbacks), `ImmutableArray<UseDataSource>` prop widening for ExB's immutable state system (19 type errors cleared across 3 files), TypeScript error cleanup to 0 across all FeedSimple source.
- **Security hardening**: FeedSimple automatically inherits Group A (`escapeHtml()`) and Group B (`isDangerousUrl()`) from the shared template engine in `shared-code/`. No FS-specific code changes were needed for these protections. 14 new security tests in FeedSimple's own test suite validate the protections flow through correctly.

### Resolved: BUG-GRAPHICS-PROD-001

A long-standing intermittent bug where polygons rendered outline-only (no fill) in production builds has been structurally eliminated. The hypothesized root cause was a minification-induced race condition in post-construction symbol property assignment. The r024 graphics rewrite replaced every symbol creation site with inline object literals or constructor-with-properties patterns. Zero post-construction property assignments remain anywhere in the codebase. The bug was never reproduced on ExB 1.20.

### Previous Release: QS r026.025 + FS r004.005 (March 2026)

See [RELEASE_QS-r026.025_FS-r004.005](docs/releases/RELEASE_QS-r026.025_FS-r004.005.md) for the full release notes covering the shared markdown engine extraction, table support, data source rebinding tool, and per-result Pan To.

---

## Widgets in this Suite

### QuerySimple (`query-simple/` + `helper-simple/` + `shared-code/`)
A high-performance search engine for Experience Builder.

**Advanced Features:**
- **Duplicate Query Button**: Clone any query instantly with all settings preserved.
- **SQL Optimizer**: Automatically unwraps `LOWER()` from search fields to ensure database index usage.
- **Query Grouping**: Organize dozens of searches into a clean two-dropdown hierarchy.
- **Display Order**: Control search prioritization via the `order` property.
- **Spatial Power**: Integrated buffer, draw, and extent filtering.
- **Markdown Templates**: `{{field | filter}}` token syntax with 16 chainable pipe filters covering date formatting, math operations, text transformation, and link generation. Pipe-delimited markdown tables with configurable column alignment. Visual Table Builder in settings for inline table design. Template migration button for one-click conversion from legacy `{FIELD}` syntax. Shared rendering engine between QuerySimple and FeedSimple.
- **Data Source Rebind**: When a layer is replaced in the web map, rebind all affected queries from the settings panel.

### HelperSimple (`helper-simple/`)
The "Orchestrator" widget that handles the background logic. Installed alongside QuerySimple.

**Features:**
- **URL Monitor**: Listens for hash and query string changes to trigger QuerySimple automation.
- **Selection Guard**: Restores QuerySimple results after the map identify popup is closed.
- **Handshake Logic**: Manages the "open/close" state between widgets to ensure a clean UI.

### FeedSimple (`feed-simple/` + `shared-code/`)
An XML feed consumer widget. Does **not** depend on QuerySimple or HelperSimple. Requires `shared-code/` (since r004).

**Features:**
- **Universal XML parsing**: Flat XML, nested (QuakeML), RSS 2.0, ATOM, GeoRSS
- **Markdown card templates**: Token substitution (`{{field}}`) with chainable filters (date, math, text, autolink)
- **Color coding**: Exact match or numeric range modes with per-range map symbol overrides
- **Color legend**: Collapsible color key bar
- **Search & sort**: Debounced search bar, runtime sort dropdown
- **Show-more pagination**: Configurable "Show more" / "Show all" with custom item count labels
- **Configurable polling**: Automatic refresh with new-item highlighting
- **Feed Map Layer**: Client-side FeatureLayer from feed coordinates with configurable marker style
- **Bidirectional card-map sync**: Click a card to zoom/pan on map, click a map point to highlight its card
- **Map popup templates**: Separate desktop/mobile popup templates
- **Spatial join**: Runtime join to existing FeatureLayer with click-to-zoom and popup
- **Card action toolbar**: Per-card Zoom, Pan, Link, and Expand buttons
- **External links**: URL template with token substitution
- **Status filtering**: Hide items by exact status value or numeric min/max range
- **Responsive design**: Separate mobile card/popup templates, iOS auto-zoom prevention
- **Debug logging**: `?debug=FETCH,POLL,JOIN,FEED-LAYER` URL parameters

---

## Configuration & Enhancements

### Duplicate Query Button

**The #1 time-saver for power users configuring multiple similar queries.**

When you have dozens of queries against the same layer (e.g., different parcel search fields), the duplicate button eliminates repetitive configuration work.

**How it works:**
1. Configure your first query with all the settings (layer, filters, display format, spatial tools, grouping, etc.)
2. Click the **duplicate icon** next to the query in the settings panel
3. A perfect clone appears instantly with "(Copy)" appended to the name
4. Change only what's different (e.g., switch from "Parcel Number" field to "Owner Name" field)
5. Done! All other settings are preserved.

**What gets cloned:**
- Layer and data source configuration
- Attribute filters and SQL expressions
- Spatial filters, buffers, and geometry tools
- Display format and field configuration
- Sorting, pagination, and result styling
- Grouping settings and display order
- Hash parameters (with "_copy" appended to prevent collisions)

**Unique IDs auto-generated:**
- New `configId` and `outputDataSourceId` are created automatically
- Hash parameters (`shortId`, `searchAlias`) are made unique with "_copy" suffix
- No risk of ID collisions or configuration conflicts

**Real-world example:**
If you're building a parcel search with 10 different search fields (PIN, Major/Minor, Owner Name, Address, etc.), you can:
1. Configure the first query completely (~5 minutes)
2. Duplicate it 9 times (~30 seconds)
3. Update just the field name in each copy (~2 minutes total)

**Total time: ~8 minutes instead of ~50 minutes!**

---

### URL Parameters (Deep Linking)
Configure a `shortId` for any query to enable instant automation.

| Format | Example | Best Use Case |
| :--- | :--- | :--- |
| **Hash (#)** | `index.html#pin=123` | **Interactive UX.** Snappy, no page reload, private to browser. |
| **Query (?)** | `index.html?pin=123` | **External Linking.** Standard for CRM/Email integrations. |

### Display Order & Grouping
Manage complex search requirements with ease:
- **`groupId`**: Clusters related searches (e.g., "Parcels") into a group.
- **`searchAlias`**: The label shown inside the group (e.g., "Search by PIN").
- **`order`**: A numeric value (1, 2, 3...) that forces a search to the top of the list, regardless of when it was added to the config.

---

## Troubleshooting & Debugging

The suite includes a production-safe **Debug System**. No logs are shown in the console unless explicitly requested via the URL.

### How to use:
Add `?debug=FEATURE` to your URL (e.g., `?debug=HASH,TASK`).

### Available Switches:
| Switch | What it tracks |
| :--- | :--- |
| `all` | Enable every single log (Warning: High volume). |
| `HASH` | Deep link consumption and URL parameter parsing. |
| `TASK` | Query execution, performance metrics, and data source status. |
| `RESULTS-MODE` | Transitions between New, Add, and Remove selection modes. |
| `EXPAND-COLLAPSE` | State management for result item details. |
| `SELECTION` | Identify popup tracking and map selection sync. |
| `RESTORE` | Logic used to rebuild the map selection after an identify event. |
| `WIDGET-STATE` | The handshake between HelperSimple and QuerySimple. |
| `GRAPHICS-LAYER` | Highlighting logic for graphics-enabled widgets. |

### Known Bugs (Always Visible)

Known bugs are logged automatically, even when `?debug=false`. These appear as warnings in the console with the format `[QUERYSIMPLE BUG]` to help developers understand when they encounter a known issue rather than something they've done wrong.

---

## Documentation

- **[`docs/query-simple/`](docs/query-simple/)** - QuerySimple architecture, changelog, and process flows
- **[`docs/feed-simple/`](docs/feed-simple/)** - FeedSimple architecture, changelog, and configuration guide
- **[`docs/releases/`](docs/releases/)** - Release notes

---

## Verified Compatibility

### Development Environment

| Component | Version |
|-----------|---------|
| Experience Builder | 1.20 |
| ArcGIS Maps SDK for JavaScript | 5.0.4 |
| React | 19 |
| Node.js | 24 |
| Calcite Design System | 5.0.2 |
| TypeScript | Bundled with ExB |

Official reference: https://developers.arcgis.com/experience-builder/guide/release-versions/

### Enterprise Deployment

When deploying to ArcGIS Enterprise, the Enterprise version determines the ExB version:

| Enterprise Version | ExB Version | JSAPI Version | React Version |
|-------------------|-------------|---------------|---------------|
| 11.4 | 1.14 | 4.28 | 17 |
| 11.5 | 1.17 | 4.32 | 18 |
| 12.0 | 1.18 | 4.33 | 18 |

Set `exbVersion` in `manifest.json` to match or be LESS than Enterprise's ExB version. Example: if building with ExB Dev 1.20 but deploying to Enterprise 12.0 (ExB 1.18), set `"exbVersion": "1.18.0"`.

---

## Installation

### QuerySimple + HelperSimple
1. Copy `query-simple`, `helper-simple`, and `shared-code` into your `client/your-extensions/widgets` folder.
2. Run `npm run build` from the `client` directory.
3. Restart your Experience Builder server.

### FeedSimple
1. Copy `feed-simple` and `shared-code` into your `client/your-extensions/widgets` folder.
2. Run `npm run build` from the `client` directory.
3. Restart your Experience Builder server.

> **Note:** If you are installing both QS and FS, you only need one copy of `shared-code/`.

> **Upgrading from ExB 1.19:** This release is not backward-compatible with ExB 1.19. Previous releases for ExB 1.19 remain available on the [Releases](https://github.com/MapSimple-Org/ExB-Simple-Public/releases) page.

---

## Test Results

- **Unit tests:** 535/535 passing
- **E2E tests:** 35 passed, 4 skipped, 2 flaky, 0 failed
- **TypeScript errors:** 0

---

(c) 2026 MapSimple Organization.
