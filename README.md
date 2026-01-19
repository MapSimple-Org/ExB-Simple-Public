# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition (1.19.0+). Built for performance, deep-linking, and advanced result management.

**Current Version**: `1.19.0-r021.46`  
**Latest Update**: Major memory optimization and performance improvements (Jan 16-19, 2026)

## Key Differentiators (Why QuerySimple?)

QuerySimple is designed to solve the common pain points of the standard Experience Builder query widget:

- **93% Latency Reduction**: Powered by a **Universal SQL Optimizer** that automatically rewrites expensive queries to use database indexes, plus **Attribute Stripping** to minimize network payloads.
- **Dual-Mode Deep Linking**: Support for both Hash Fragments (`#shortId=val`) and Query Strings (`?shortId=val`).
- **Results Accumulation**: Unlike the standard widget which clears results on every search, QuerySimple allows you to "Add to" or "Remove from" a selection set across multiple different queries.
- **Discoverable Automation**: An interactive "Info Button" (ℹ️) automatically appears to show users exactly how to deep-link to the current layer.
- **Persistence & Restoration**: Selections are maintained even when the identify tool is used, ensuring users never lose their search context.

---

## What's New: r021.11 → r021.46 (Jan 16-19, 2026)

### 🎉 Major Achievements

Four-day intensive memory leak investigation resulting in **93% memory reduction** for New Selection mode and comprehensive optimizations across the board.

#### Performance Improvements

**New Selection Mode:**
- **Before**: 25.89 MB per query
- **After**: 1.76 MB per query  
- **Result**: 93% reduction ✅

**Add to Selection Mode:**
- **Before**: ~27 MB baseline drift per cycle
- **After**: ~25 MB baseline drift per cycle
- **Note**: Remaining 25 MB is ESRI JSAPI internal memory (beyond widget control)

#### Key Fixes (r021.15 - r021.46)

1. **Grouped Result Sets** (r021.15-r021.19)
   - Multi-query result accumulation with group-level management
   - Display all accumulated queries with their result counts
   - Remove individual query results from accumulated set

2. **Geometry Reference Leak** (r021.36) 🎯
   - **Impact**: Reduced memory from 11.21 MB/query → 1.76 MB/query (84% improvement)
   - **Fix**: Modified zoom-utils to store extent objects only, not full geometry objects
   - **Breakthrough**: This was the single biggest memory win

3. **ESRI Observer Cleanup Order** (r021.39)
   - **Impact**: Fixed orphaned ESRI observers (87K `TrackingTarget`, 56K `ObservationHandle` accumulating)
   - **Fix**: Reordered cleanup to clear selection BEFORE destroying OutputDataSource
   - **Insight**: Destroying DS before clearing selection left observers orphaned

4. **Multi-Source Clearing** (r021.43)
   - **Impact**: 80% reduction in TrackingTarget accumulation
   - **Fix**: Clear selection on ALL origin DataSources (not just current one) in Add mode
   - **Why**: Multiple queries accumulate from different layers, each with its own observers

5. **Icon Component Duplication** (r021.44, r021.46)
   - **Impact**: Eliminated 1,200 React component instances (600 trash icons + 600 expand/collapse arrows)
   - **Fix**: Replaced React components with CSS background-images using SVG data-uris
   - **Savings**: ~3-4 MB component/DOM overhead per 600 results

6. **ESRI Limitations Documented** (r021.46)
   - **Finding**: Allocation sampling revealed 95% of remaining memory leak is ESRI JSAPI internals
   - **Source**: `onTrackingEnd`, `e.reactionDeferred`, `_watchMeshGeometryChanges` in `init.js:5`
   - **Conclusion**: No public API to control these internal structures
   - **Action**: Documented limitations for future reference

#### Technical Deep-Dive

For complete technical details and version history, see:
- **CHANGELOG.md** - Detailed version-by-version changes (r021.11 through r021.46)

---

## Widgets in this Suite

### 🔍 QuerySimple (`query-simple/`)
A high-performance search engine for Experience Builder.

**Advanced Features:**
- **Duplicate Query Button**: Clone any query instantly with all settings preserved - a massive time-saver when configuring multiple similar searches.
- **SQL Optimizer**: Automatically unwraps `LOWER()` from search fields to ensure database index usage.
- **Query Grouping**: Organize dozens of searches into a clean two-dropdown hierarchy.
- **Display Order**: Control search prioritization via the `order` property (no need to manually reorder config).
- **Spatial Power**: Integrated buffer, draw, and extent filtering.
- **Unified Testing**: Verified by a "Mega-Journey" E2E suite that simulates real user sessions.

### 🛠️ HelperSimple (`helper-simple/`)
The "Orchestrator" widget that handles the background logic.

**Features:**
- **URL Monitor**: Listens for hash and query string changes to trigger QuerySimple automation.
- **Selection Guard**: Restores QuerySimple results after the map identify popup is closed.
- **Handshake Logic**: Manages the "open/close" state between widgets to ensure a clean UI.

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

## Installation

1. Copy `query-simple`, `helper-simple`, and `shared-code` into your `client/your-extensions/widgets` folder.
2. Run `npm run build` from the `client` directory.
3. Restart your Experience Builder server.

---

© 2025 MapSimple Organization
