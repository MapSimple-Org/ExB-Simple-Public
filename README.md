# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition. Built for performance, deep-linking, and advanced result management.

**Current Version**: QS `1.20.0-r028.127` | FS `1.20.0-r005.020`
**Latest Update**: Hover feature highlight, "Search by" rename, and a LayerList remove-button fix (June 4, 2026)

## Key Differentiators (Why QuerySimple?)

QuerySimple is designed to solve the common pain points of the standard Experience Builder query widget:

- **93% Latency Reduction**: Powered by a **Universal SQL Optimizer** that automatically rewrites expensive queries to use database indexes, plus **Attribute Stripping** to minimize network payloads.
- **Dual-Mode Deep Linking**: Support for both Hash Fragments (`#shortId=val`) and Query Strings (`?shortId=val`).
- **Results Accumulation**: Unlike the standard widget which clears results on every search, QuerySimple allows you to "Add to" or "Remove from" a selection set across multiple different queries.
- **Discoverable Automation**: An interactive "Info Button" automatically appears to show users exactly how to deep-link to the current layer.
- **Persistence & Restoration**: Selections are maintained even when the identify tool is used, ensuring users never lose their search context.

---

## What's New (r028.127, June 4, 2026)

> Full release notes: [RELEASE_QS-r028.127_FS-r005.020](docs/releases/RELEASE_QS-r028.127_FS-r005.020.md)

A focused follow-up to the r028.122 release below.

### Hover Feature Highlight

Hovering a result already drops a preview pin on the map. Now it can also highlight the feature's geometry, so the hovered feature stands out from its neighbors. Especially handy for lines and polygons, where a pin alone does not tell you which feature you are on.

- Pin and highlight both run on hover, each with its own on/off toggle (use one, the other, or both).
- Configurable highlight color (defaults to the pin's red).
- On by default, so existing apps get it with no config change.

Thanks to James Kellough in the Esri Community for the request and the use case.

### "Search alias" renamed to "Search by"

On grouped queries, the "Search alias" label (runtime dropdown and settings) now reads "Search by". Cosmetic only.

### Fix: results layer was removable from the LayerList

Being upfront: we introduced this one. The flag that hides the LayerList "Remove" button on the results layer was being set just before the layer was added to the map, and Experience Builder re-stamps that flag during the add, so it got overwritten and the Remove button reappeared. Fixed by setting the flag right after the add. The results layer is no longer user-removable.

---

## What's New in r028.122 (June 2, 2026)

> Full release notes: [RELEASE_QS-r028.122_FS-r005.018](docs/releases/RELEASE_QS-r028.122_FS-r005.018.md)

The r028 line is built on one change: query results now live in real client-side FeatureLayers. That single shift unlocks native map popups, map-to-card identify, and a unified renderer shared by the result card and the popup. It runs on the same Experience Builder 1.20 / JSAPI 5.0.4 stack as r027 (no framework version change).

### Native Map Identify (Results Become Real Features)

Visually, nothing changes. Functionally, everything does. Query results used to be plain graphics drawn on the map: a colored shape and nothing more. In r028 they are stored as real features in client-side FeatureLayers, so they behave like any other layer instead of inert decoration.

- **Click to identify.** Click any result on the map and its popup opens, using the configured template. The old graphics could not be clicked; these respond.
- **Map-to-card flash.** Clicking a result on the map scrolls its card into view and flashes it, keeping the map and the list in sync. New `flashOnMapIdentify` setting (default on) toggles it.
- **Native legend and LayerList.** Result layers appear and behave like real layers.
- **Leaner memory.** A slim popup registry and popup-only field fetching shed retained geometry on polygon-heavy datasets.

### Unified Field-Table Renderer (Card == Popup)

The result card, the map-feature popup, and the card-click popup now render through one shared engine, so they match exactly: alias labels, formatted dates and numbers, decoded coded-value domains, and the same striped table.

- **Per-field display labels**: rename any field for SelectAttributes mode in settings without touching the underlying schema. Labels survive a layer rebind.
- **Title fixes**: double-brace `{{Field}}` titles render correctly on the card (they used to collapse to a stray `}`), and single- and double-brace token styles resolve identically.

### Spatial Mixed-Geometry Fix (re-run affected queries)

Before r028, an un-buffered spatial query with mixed input shapes (for example a polygon and a line) kept only the highest-dimension shape and silently dropped the rest, while the source indicator listed both shapes as if both were used. Results were incomplete with no warning. Buffered queries were unaffected, since the buffer unions every shape into one polygon first. r028 queries every input shape and de-dupes the matches. If you relied on un-buffered mixed-geometry spatial queries, re-run them: earlier results may have been short.

### Spatial Tab Overhaul

- **Drawn shapes persist** across Draw and Operations mode switches — no more vanished line with a phantom buffer left behind.
- **"Also include current results"**: a Draw-mode opt-in that folds the current result set into the draw input, so a drawn shape and already-selected results buffer and query together. Appears once a shape is drawn and results exist; default off.
- **Deterministic target-layer labels**: the Target-layers picker shows the admin-configured label, not whatever the live service happens to advertise.
- **Single-select relationship hardening**: the relationship dropdown can no longer desync into a multi-selected state.

### Know When Results Are Capped

Feature services return up to a maximum record count per query (often 1000 or 2000). Until now, a query that hit that ceiling looked identical to one that returned everything, so you could be missing records and never know.

- **Amber notice on the results panel** when a query is truncated.
- **Names the real total.** A lightweight count-only query reports the actual number of matching records ("matched N, showing M"), so you know exactly how much you are not seeing.
- **No false alarms.** Some older ArcGIS Server layers flag truncation on multipart query geometries even when nothing was dropped; the count check suppresses the notice in that case.

Knowing the true total is also the foundation for fetching beyond the first page in a future release.

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

- **Unit tests:** 751/751 passing
- **E2E tests:** 35 passed, 4 skipped, 2 flaky, 0 failed (Playwright v2 suite)
- **TypeScript errors:** 0

---

(c) 2026 MapSimple Organization.
