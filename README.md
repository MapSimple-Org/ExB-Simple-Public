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

## What's New (May 6, 2026)

> **Breaking Change:** This release targets **Experience Builder 1.20.0** with **ArcGIS Maps SDK for JavaScript 5.0.4** (Calcite 5.0). It is **not backward-compatible** with ExB 1.19. If you are still on ExB 1.19, use the previous release ([QS-r026.025 + FS-r004.005](docs/releases/RELEASE_QS-r026.025_FS-r004.005.md)).

### QuerySimple r027.097 (Major Update)

- **ExB 1.20 / JSAPI 5.0 Upgrade**: Deep migration covering `DataRecord.getId()` coercion (string to number), `__esri` namespace removal (419 refs across 44 files), Calcite 5.0 compatibility, and JSAPI 5.0 API changes. TypeScript errors went from 221 to 0. Full manual smoke test passed.
- **Security Hardening**: Three-group pass protecting against XSS and injection via compromised data sources.
  - XSS prevention: `escapeHtml()` on all substituted field values in templates
  - Dangerous URL blocking: `javascript:`, `data:`, `vbscript:` schemes blocked in markdown links, images, and external link URLs
  - SQL field validation: Regex guard on field names before WHERE clause interpolation
  - 45 new security tests across both widgets
- **Select on Map Fix**: Direct `layerView.highlight()` bypass for hosted feature layers. Non-HFL layers guarded with automatic `console.warn`.
- **E2E Test Suite v2**: Fresh Playwright suite with 35 passed, 4 skipped, 0 failed across 8 spec files.
- **DS Conflict Detection**: When two QS widgets share output data source IDs (from copy-pasted configs), a red banner appears with a one-click fix button.

### FeedSimple r005.016 (Major Update)

- **ExB 1.20 / JSAPI 5.0 Upgrade**: `getId()` coercion, `__esri` namespace migration, Calcite 5.0 NumericInput value widening, TypeScript error cleanup to 0.
- **Security Hardening**: Inherits `escapeHtml()` (XSS prevention) and `isDangerousUrl()` (dangerous URL blocking) from shared-code. 14 new security tests.

### Previous: QuerySimple r026.025 + FeedSimple r004.005

See [RELEASE_QS-r026.025_FS-r004.005](docs/releases/RELEASE_QS-r026.025_FS-r004.005.md) for details.

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
- **Markdown Templates**: `{{field | filter}}` token syntax with 16 pipe filters. Markdown tables, inline table builder.
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
