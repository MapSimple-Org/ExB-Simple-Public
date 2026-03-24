# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition (1.19.0+). Built for performance, deep-linking, and advanced result management.

**Current Version**: QS `1.19.0-r026.025` | FS `1.19.0-r004.005`
**Latest Update**: Unified Template Engine, Markdown Tables, Data Source Rebind Tool (Mar 24, 2026)

## Key Differentiators (Why QuerySimple?)

QuerySimple is designed to solve the common pain points of the standard Experience Builder query widget:

- **93% Latency Reduction**: Powered by a **Universal SQL Optimizer** that automatically rewrites expensive queries to use database indexes, plus **Attribute Stripping** to minimize network payloads.
- **Dual-Mode Deep Linking**: Support for both Hash Fragments (`#shortId=val`) and Query Strings (`?shortId=val`).
- **Results Accumulation**: Unlike the standard widget which clears results on every search, QuerySimple allows you to "Add to" or "Remove from" a selection set across multiple different queries.
- **Discoverable Automation**: An interactive "Info Button" (ℹ️) automatically appears to show users exactly how to deep-link to the current layer.
- **Persistence & Restoration**: Selections are maintained even when the identify tool is used, ensuring users never lose their search context.

---

## What's New (Mar 24, 2026)

### QuerySimple r026.025 (Major Release)

- **Unified Template Engine**: QS now uses the same `{{field | filter}}` syntax as FeedSimple with 16 pipe filters (date, math, string, link). Old `{field}` syntax still works via legacy fallback. One-click migration button in settings.
- **Markdown Tables**: Pipe-delimited table syntax renders as styled HTML. Inline Table Builder tool in settings generates tables visually.
- **Per-Result Pan To**: New pan button on each result card. Optional pan-on-click behavior (mutually exclusive with zoom).
- **Data Source Rebind Tool**: When a layer is replaced in the web map, rebind all affected queries to the new data source from the settings panel. Auto-heal mode for matching fields, interactive mapping for mismatched fields. Automatic orphan cleanup.

### FeedSimple r004.005 (Major Release)

- **Markdown Tables**: Table rendering in card and popup templates. Table Builder tool in settings panel.
- **Shared Markdown Engine**: Core markdown converter extracted to `shared-code/`. No behavioral changes for existing users.

> **Installation Change:** FeedSimple now requires `shared-code/`. See Installation section below. Previous standalone releases remain available on the [Releases](https://github.com/MapSimple-Org/ExB-Simple-Public/releases) page.

See [RELEASE_QS-r026.025_FS-r004.005](docs/releases/RELEASE_QS-r026.025_FS-r004.005.md) for full details.

### Previous: QuerySimple r025.073 + FeedSimple r003.010

See [RELEASE_QS-r025.073_FS-r003.010](docs/releases/RELEASE_QS-r025.073_FS-r003.010.md) for details.

---

## Widgets in this Suite

### 🔍 QuerySimple (`query-simple/` + `helper-simple/` + `shared-code/`)
A high-performance search engine for Experience Builder.

**Advanced Features:**
- **Duplicate Query Button**: Clone any query instantly with all settings preserved - a massive time-saver when configuring multiple similar searches.
- **SQL Optimizer**: Automatically unwraps `LOWER()` from search fields to ensure database index usage.
- **Query Grouping**: Organize dozens of searches into a clean two-dropdown hierarchy.
- **Display Order**: Control search prioritization via the `order` property (no need to manually reorder config).
- **Spatial Power**: Integrated buffer, draw, and extent filtering.
- **Unified Testing**: Verified by a "Mega-Journey" E2E suite that simulates real user sessions.

### 🛠️ HelperSimple (`helper-simple/`)
The "Orchestrator" widget that handles the background logic. Installed alongside QuerySimple.

**Features:**
- **URL Monitor**: Listens for hash and query string changes to trigger QuerySimple automation.
- **Selection Guard**: Restores QuerySimple results after the map identify popup is closed.
- **Handshake Logic**: Manages the "open/close" state between widgets to ensure a clean UI.

### 📡 FeedSimple (`feed-simple/` + `shared-code/`)
An XML feed consumer widget. Does **not** depend on QuerySimple or HelperSimple. Requires `shared-code/` (shared markdown engine, starting with r004).

**Features:**
- **Universal XML parsing**: Flat XML, nested (QuakeML), RSS 2.0, ATOM, GeoRSS — one parser handles all
- **Markdown card templates**: Token substitution (`{{field}}`) with chainable filters (date, math, text, autolink)
- **Color coding**: Exact match or numeric range modes with per-range map symbol overrides (ClassBreaksRenderer)
- **Color legend**: Collapsible color key bar so users understand what each color means
- **Search & sort**: Debounced search bar with configurable search fields, runtime sort dropdown with configurable sort fields
- **Show-more pagination**: Configurable "Show more" / "Show all" with custom item count labels
- **Configurable polling**: Automatic refresh with new-item highlighting and "Last updated" timestamp
- **Feed Map Layer**: Client-side FeatureLayer from feed coordinates with configurable marker style, size, color, and outline
- **Bidirectional card-map sync**: Click a card to zoom/pan on map, click a map point to highlight its card
- **Map popup templates**: Separate desktop/mobile popup templates with configurable dock position and collapsed mode
- **Spatial join**: Runtime join to existing FeatureLayer with click-to-zoom and popup
- **Card action toolbar**: Per-card Zoom, Pan, Link, and Expand buttons with configurable position (bottom, right, menu)
- **External links**: URL template with token substitution, or per-item link field for "open in external app"
- **Source attribution**: Optional source label and URL displayed as a footer below the card list
- **Status filtering**: Hide items by exact status value or numeric min/max range
- **Responsive design**: Separate mobile card/popup templates, mobile toolbar position override, iOS auto-zoom prevention
- **Debug logging**: `?debug=FETCH,POLL,JOIN,FEED-LAYER` URL parameters

---

## Configuration & Enhancements

### Duplicate Query Button (NEW in r020.0)

**The #1 time-saver for power users configuring multiple similar queries.**

When you have dozens of queries against the same layer (e.g., different parcel search fields), the duplicate button eliminates repetitive configuration work.

**How it works:**
1. Configure your first query with all the settings (layer, filters, display format, spatial tools, grouping, etc.)
2. Click the **duplicate icon** (📋) next to the query in the settings panel
3. A perfect clone appears instantly with "(Copy)" appended to the name
4. Change only what's different (e.g., switch from "Parcel Number" field to "Owner Name" field)
5. Done! All other settings are preserved.

**What gets cloned:**
- ✅ Layer and data source configuration
- ✅ Attribute filters and SQL expressions
- ✅ Spatial filters, buffers, and geometry tools
- ✅ Display format and field configuration
- ✅ Sorting, pagination, and result styling
- ✅ Grouping settings and display order
- ✅ Hash parameters (with "_copy" appended to prevent collisions)

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

**Important:** Known bugs are logged automatically, even when `?debug=false`. These appear as warnings in the console with the format `[QUERYSIMPLE ⚠️ BUG]` to help developers understand when they encounter a known issue rather than something they've done wrong.

Each bug log includes:
- **Bug ID**: Unique identifier (e.g., `BUG-GRAPHICS-001`)
- **Category**: Bug type (SELECTION, UI, URL, DATA, GRAPHICS, PERFORMANCE, GENERAL)
- **Description**: What the bug is and why it's happening
- **Workaround**: How to avoid or work around the issue
- **Target Resolution**: When the bug will be fixed (e.g., `r019.0`)

See [`docs/bugs/BUGS.md`](docs/bugs/BUGS.md) for a complete list of known bugs and their status.

---

## Documentation

All development documentation has been organized into a centralized [`docs/`](docs/) directory for easy navigation:

- **[`docs/development/`](docs/)** - Development guides, testing, standards (start with [`DEVELOPMENT_GUIDE.md`](docs/development/DEVELOPMENT_GUIDE.md))
- **[`docs/architecture/`](docs/)** - Design patterns, migration plans, refactoring strategies
- **[`docs/technical/`](docs/)** - Deep dives into specific technical challenges
- **[`docs/features/`](docs/)** - Feature specifications and integration guides
- **[`docs/bugs/`](docs/)** - Bug reports and resolution documentation
- **[`docs/blog/`](docs/)** - Development insights and lessons learned

**Quick Links:**
- 📖 **New Developers:** Start with [`docs/development/DEVELOPMENT_GUIDE.md`](docs/development/DEVELOPMENT_GUIDE.md)
- 🧪 **Testing:** See [`docs/development/TESTING_WALKTHROUGH.md`](docs/development/TESTING_WALKTHROUGH.md)
- 🏗️ **Architecture:** See [`docs/architecture/COMPLETE_MIGRATION_PLAN.md`](docs/architecture/COMPLETE_MIGRATION_PLAN.md)
- 📋 **Full Index:** See [`docs/README.md`](docs/README.md)

---

## Quality Assurance

We use a **Unified Testing Strategy**. Instead of dozens of small tests that might miss state leaks, we run a single **"Mega-Journey"** that simulates a 5-minute user session across both widgets.

### Running the Suite:
```bash
# 1. Manual Auth (Do this once a day)
npm run test:e2e:auth-setup

# 2. Run the Mega-Journey
npx playwright test tests/e2e/query-simple/session.spec.ts --project=chromium --headed
```

---

## Verified Compatibility

### Development Environment

| Component | Version |
|-----------|---------|
| Experience Builder | 1.19 |
| ArcGIS Maps SDK for JavaScript | 4.34 |
| React | 19 |
| Node.js | 22 |
| Calcite Design System | 3.3.3 |
| TypeScript | Bundled with ExB |

Official reference: https://developers.arcgis.com/experience-builder/guide/release-versions/

### Enterprise Deployment

When deploying to ArcGIS Enterprise, the Enterprise version determines the ExB version:

| Enterprise Version | ExB Version | JSAPI Version | React Version |
|-------------------|-------------|---------------|---------------|
| 11.4 | 1.14 | 4.28 | 17 |
| 11.5 | 1.17 | 4.32 | 18 |
| 12.0 | 1.18 | 4.33 | 18 |

Set `exbVersion` in `manifest.json` to match or be LESS than Enterprise's ExB version. Example: if building with ExB Dev 1.19 but deploying to Enterprise 11.5 (ExB 1.17), set `"exbVersion": "1.17.0"`.

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

---

© 2026 MapSimple Organization.
