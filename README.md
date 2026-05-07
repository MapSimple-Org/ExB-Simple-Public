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

### Unified Markdown Template Engine

Both QuerySimple and FeedSimple now share a single rendering engine in `shared-code/` with a unified `{{field | filter}}` token syntax. This was a major architectural merge: the template engine, token substitution, pipe filters, and markdown converter were extracted into shared code and are now identical across both widgets.

- **16 chainable pipe filters** for date formatting (`{{field | date:MM/DD/YYYY}}`), math (`{{field | multiply:100 | round:2}}`), text styling (`{{field | uppercase}}`, `{{field | truncate:50}}`), and link generation (`{{field | autolink}}`)
- **Markdown formatting**: headings (h1 through h6), **bold**, *italic*, `inline code`, links, images, blockquotes, ordered/unordered lists, horizontal rules
- **Markdown tables**: pipe-delimited tables with header styling and column alignment (`:---` left, `:---:` center, `---:` right)
- **Table Builder**: visual grid editor in settings (2-6 columns, 1-10 rows) that generates table markdown and inserts at cursor position
- **Template migration**: one-click button in QS settings detects old `{FIELD}` tokens and converts to `{{FIELD}}` with before/after preview
- **Syntax reference panel**: expandable inline reference in the settings template editor showing all available formatting, filters, and table syntax

### ExB 1.20 / JSAPI 5.0 Migration

Ground-up migration to Experience Builder 1.20 (JSAPI 5.0.4, Calcite 5.0.2, Node 24). Full manual smoke test passed April 30 with all three widgets functional end-to-end.

- **`DataRecord.getId()` returns `number`** in JSAPI 5.0 (was `string`). All ID comparison, Redux selection, and Map key sites coerced with `String()` across 12+ files. Without this, selections silently fail.
- **`__esri.*` namespace removed**: 419 references across 44 files replaced with ESM type imports from `@arcgis/core` in a 17-pass, per-file validated migration. Deprecated in 5.0, removed in 6.0.
- **Calcite 5.0 compat**: event prop casing (`onCalcitePopoverClose` to lowercase), `inputMode='numeric'` replacing `type='number'`, `NumericInput` value type widening
- **JSAPI 5.0 API changes**: `geometryEngine.union()` to `unionOperator.executeMany()`, `defaultPopupTemplate` to `createPopupTemplate()`, removed `sourceLayer`/`associatedLayer`
- **TypeScript errors: 221 to 0** across all widgets, all type-only fixes, zero runtime changes

### Security Hardening

Three-group pass protecting the shared template engine and query pipeline. 45 new tests across 3 test files.

- **Group A (XSS)**: `escapeHtml()` on all substituted field values before pipe filters run. Markdown syntax unaffected, only raw data is escaped.
- **Group B (URLs)**: `isDangerousUrl()` blocks `javascript:`, `data:`, `vbscript:` schemes in markdown links, images, and external link URLs. Dangerous content renders as plain text.
- **Group C (SQL)**: `isValidFieldName()` regex guard on field names before WHERE clause interpolation in typeahead/suggest.

### Select on Map Fix

Select on Map stopped working when layers migrated from map-image services to hosted feature layers. The fix bypasses the framework's unreliable highlight chain and calls `layerView.highlight()` directly. Non-HFL layers emit `console.warn` with bug ID `BUG-SELECT-MAP-IMAGE-001` automatically.

### Builder and Settings

- **DS conflict detection**: when two QS widgets share output DS IDs (from copy-paste), red banner on the offender with one-click "Regenerate IDs" fix, amber banner on the victim
- **Data source rebinding**: rebind all queries when a layer is replaced in the web map (auto-heal for identical fields, interactive mapping table for changed fields)
- **Per-result Pan To**: hand icon on each card centers the map without changing zoom. `panOnResultClick` toggle makes it the default click behavior.
- **Configurable widget header**: `showHeader` toggle hides the header bar for more vertical space
- **Configurable spatial relationships**: admin-selectable subset of operations in the Spatial tab dropdown

### Stability Fixes

- **Selection loss on record removal** (r027.010): `getSelectedRecords()` returns `[]` in ExB 1.20. Fixed with ID-based selection from accumulated records.
- **Selection loss between QS widgets** (r027.016): switching widgets cleared shared DS highlights. Fixed with `getSelectedRecordIds()` and auto re-selection.
- **Cross-widget DS crash** (r027.019): null guard when shared output DS is destroyed by another widget.
- **Hover pin z-order** (r027.091): pins rendering behind result graphics. Moved to `mapView.graphics`. Removed ~190 lines.
- **Popover visibility** (r027.024-025): `scrollIntoView()` on no-results and error popovers for smaller viewports.
- **GraphicsLayer architecture** (r027.033-034): separated inner `GraphicsLayer` from parent `GroupLayer`, fixed legend regression, widened prop chain across 11 files.

### E2E Test Suite v2

Fresh Playwright suite built from video captures of real user sessions.

| Category | Tests | Coverage |
|----------|-------|----------|
| **1: Query Execution Extended** | 8 | Query execution, URL parameters, result display |
| **3: Results Interaction** | 6 | Card expansion, popup, zoom, Remove mode |
| **4: Accumulation Modes** | 7 | New/Add/Remove transitions, cross-query accumulation |
| **5: Spatial Operations** | 6 | Buffer config, target layers, spatial query execution |
| **6: Spatial Draw Mode** | 4 | Draw tools, geometry drawing, spatial query from shapes |

**Final run:** 35 passed, 4 skipped, 2 flaky, 0 failed across 8 spec files.

### FeedSimple r005.016

- **ExB 1.20**: `getId()` coercion, `__esri` migration (26 refs / 3 files), Calcite `NumericInput` widening, `ImmutableArray` prop widening (19 errors cleared), TS errors to 0
- **Security**: inherits `escapeHtml()` and `isDangerousUrl()` from shared-code automatically. 14 new tests.

### Resolved: BUG-GRAPHICS-PROD-001

Polygon fill missing in production builds (minification race condition hypothesis). Structurally eliminated by r024 graphics rewrite. All symbol creation uses inline object literals. Never reproduced on 1.20.

### Previous Release

[QS-r026.025 + FS-r004.005](docs/releases/RELEASE_QS-r026.025_FS-r004.005.md) (March 2026)

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
