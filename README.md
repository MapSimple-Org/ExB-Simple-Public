# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition. Built for performance, deep-linking, and advanced result management.

**Current Version**: QS `1.20.0-r028.122` | FS `1.20.0-r005.018`
**Latest Update**: Native map popups & map-to-card identify, unified field-table renderer, spatial tab overhaul, truncation alerts (June 2, 2026)

## Key Differentiators (Why QuerySimple?)

QuerySimple is designed to solve the common pain points of the standard Experience Builder query widget:

- **93% Latency Reduction**: Powered by a **Universal SQL Optimizer** that automatically rewrites expensive queries to use database indexes, plus **Attribute Stripping** to minimize network payloads.
- **Dual-Mode Deep Linking**: Support for both Hash Fragments (`#shortId=val`) and Query Strings (`?shortId=val`).
- **Results Accumulation**: Unlike the standard widget which clears results on every search, QuerySimple allows you to "Add to" or "Remove from" a selection set across multiple different queries.
- **Discoverable Automation**: An interactive "Info Button" automatically appears to show users exactly how to deep-link to the current layer.
- **Persistence & Restoration**: Selections are maintained even when the identify tool is used, ensuring users never lose their search context.

---

## What's New (June 2026)

> Full release notes: [RELEASE_QS-r028.122_FS-r005.018](docs/releases/RELEASE_QS-r028.122_FS-r005.018.md)

The r028 line is built on one change: query results now live in real client-side FeatureLayers. That single shift unlocks native map popups, map-to-card identify, and a unified renderer shared by the result card and the popup. It runs on the same Experience Builder 1.20 / JSAPI 5.0.4 stack as r027 (no framework version change).

### Native Map Popups & Map-to-Card Identify

Query results are stored as real features in per-geometry-type FeatureLayers instead of plain graphics. That is what powers the rest of this release:

- **Native popups & identify** on result features, using the configured template — no custom click plumbing
- **Map-to-card flash**: clicking a result feature on the map scrolls its result card into view and flashes it, so map and list stay in sync. New `flashOnMapIdentify` setting (default on) toggles it; the option appears only when FeatureLayer results are enabled.
- **Native legend & LayerList** participation for result layers
- **Leaner memory**: a slim popup registry keeps only the attributes and template it needs, and PopupSetting queries fetch only the fields the popup references. Polygon-heavy datasets shed megabytes of retained geometry.

### Unified Field-Table Renderer (Card == Popup)

The result card, the map-feature popup, and the card-click popup now render through one shared engine, so they match exactly: alias labels, formatted dates and numbers, decoded coded-value domains, and the same striped table.

- **Per-field display labels**: rename any field for SelectAttributes mode in settings without touching the underlying schema. Labels survive a layer rebind.
- **Title fixes**: double-brace `{{Field}}` titles render correctly on the card (they used to collapse to a stray `}`), and single- and double-brace token styles resolve identically.

### Spatial Tab Overhaul

- **Mixed-geometry queries**: a spatial query with mixed input shapes (e.g. a drawn polygon plus a line) now queries every shape and combines and de-dupes the matches, instead of silently keeping only the highest-dimension shape.
- **Drawn shapes persist** across Draw and Operations mode switches — no more vanished line with a phantom buffer left behind.
- **"Also include current results"**: a Draw-mode opt-in that folds the current result set into the draw input, so a drawn shape and already-selected results buffer and query together. Appears once a shape is drawn and results exist; default off.
- **Deterministic target-layer labels**: the Target-layers picker shows the admin-configured label, not whatever the live service happens to advertise.
- **Single-select relationship hardening**: the relationship dropdown can no longer desync into a multi-selected state.

### Result-Set Truncation Alert

Queries fetch up to the layer's max transfer count (commonly 1000/2000). A query that hit that cap used to look identical to a complete one.

- **Amber warning popover** on the Results panel when a query is truncated, following the same pattern as the no-results and query-error alerts
- **Names the real total**: when the service flags truncation, a cheap count-only query reports the actual number of matching records ("matched N records but only M are shown"), not just the limit
- **Guards against false alarms**: some older ArcGIS Server layers flag truncation on multipart query geometries even when nothing was dropped; the count check suppresses the alert in that case

### Internal Architecture

- **Single rendering path**: the older dual GraphicsLayer path was removed end to end once FeatureLayer results became the default, simplifying the result pipeline
- **Singleton config**: runtime config reads now go through a `widgetConfigManager` singleton instead of Redux selectors and prop-drilling chains

### Removed: Select on Map

The "Select on map" result action has been retired. Its blue-outline highlight relied on a framework path that could not be made reliable for map-image sublayers under ExB 1.20 (BUG-SELECT-MAP-IMAGE-001); rather than carry broken behavior forward, the feature was removed. Zoom To, Pan To, View in Table, and Export are unaffected.

### FeedSimple (r005.017–018)

No user-facing changes. FeedSimple moves with the suite for shared-code alignment: mobile popup behavior was lifted into `shared-code/` (r005.017, shared with QuerySimple), and r005.018 is a passthrough version bump from the shared logger cleanup.

### Previous Releases

- [QS-r027.099 + FS-r005.016](docs/releases/RELEASE_QS-r027.099_FS-r005.016.md) (May 7, 2026) — ExB 1.20 upgrade, unified markdown engine, security hardening
- [QS-r026.025 + FS-r004.005](docs/releases/RELEASE_QS-r026.025_FS-r004.005.md) (March 2026) — last ExB 1.19 release

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

Per-widget zip downloads are available in the [`dist/`](dist/) folder. Each zip contains the widget folders and `shared-code/`, ready to extract into `your-extensions/widgets/`.

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

- **Unit tests:** 739/739 passing
- **E2E tests:** 35 passed, 4 skipped, 2 flaky, 0 failed (Playwright v2 suite)
- **TypeScript errors:** 0

---

(c) 2026 MapSimple Organization.
