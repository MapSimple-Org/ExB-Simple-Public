# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition (1.19.0+). Built for performance, deep-linking, and advanced result management.

**Current Version**: `1.19.0-r022.77`  
**Latest Update**: Minimize bug fix, cross-layer selection fix, Remove mode enhancements (Feb 5, 2026)

---

## What's New: r022.26 → r022.77 (Feb 5, 2026)

### 🎯 Critical Fixes

#### Widget Minimize vs Close Detection (r022.77)

**Fixed widget minimize incorrectly clearing selections.** Minimizing the widget was triggering the close logic, which cleared selections from the map. Users expected minimize to preserve selections (like a visual collapse).

**Root Cause:**  
Widget used DOM visibility detection (IntersectionObserver) which couldn't distinguish between minimize (widget hidden) and close (widget closed). Both made the DOM element hidden → both triggered clear-selections logic.

**Solution:**
- **Close detection:** Now uses `props.state` property from Experience Builder (`'OPENED'` → `'CLOSED'`)
- **Minimize handling:** When widget is minimized, `props.state` stays `'OPENED'` → no state change → no action → selections preserved
- **Open detection:** IntersectionObserver still handles open (works correctly)

**Impact:**
- ✅ Minimize preserves selections (bug fixed)
- ✅ Maximize shows selections still there
- ✅ Close still clears selections correctly
- ✅ Open still restores selections correctly
- ✅ HelperSimple receives accurate widget state events

#### Cross-Layer Selection Count (r022.71-74)

**Resolved a high-priority bug** where adding records from multiple layers showed incorrect selection counts on the map (e.g., 6 selected instead of 4, or 5 instead of 3).

**Root Cause:**  
When accumulating records from different layers (Parcels + Address Points), all record IDs were being selected on the current query's single origin data source. This caused cross-layer selection pollution where Parcel IDs were attempted on Address Points layers.

**Solution:**
- **Intelligent Selection Check**: useEffect now detects when records are already correctly selected, preventing redundant operations
- **Cross-Layer Grouping**: Records are grouped by their `__queryConfigId` and selected on their correct origin data sources
- **Remove Mode Fix**: Composite key matching now looks up `__queryConfigId` from accumulated records (not query results)

**Impact:**
- ✅ Selection counts now accurate across all layer combinations
- ✅ Graphics display correctly
- ✅ Remove mode works properly (via query execution or X button)
- ✅ All 8 edge cases tested and passing
- ✅ Widget close/reopen restoration unaffected
- ✅ Hash URL queries work correctly

**Fixed widget minimize incorrectly clearing selections.** Minimizing the widget was triggering the close logic, which cleared selections from the map. Users expected minimize to preserve selections (like a visual collapse).

**Root Cause:**  
Widget used DOM visibility detection (IntersectionObserver) which couldn't distinguish between minimize (widget hidden) and close (widget closed). Both made the DOM element hidden → both triggered clear-selections logic.

**Solution:**
- **Close detection:** Now uses `props.state` property from Experience Builder (`'OPENED'` → `'CLOSED'`)
- **Minimize handling:** When widget is minimized, `props.state` stays `'OPENED'` → no state change → no action → selections preserved
- **Open detection:** IntersectionObserver still handles open (works correctly)

**Impact:**
- ✅ Minimize preserves selections (bug fixed)
- ✅ Maximize shows selections still there
- ✅ Close still clears selections correctly
- ✅ Open still restores selections correctly
- ✅ HelperSimple receives accurate widget state events

---

## Previous Updates: r021.112 → r022.26 (Jan 30, 2026)

### 🎯 Major Improvements

Since the r021.112 release (format preservation & composite keys), we've made significant enhancements focused on **architecture**, **user feedback**, and **stability**:

#### 1. Tab-Level Component Extraction (r022.0)

**Architectural foundation for future spatial features.** The Query tab logic has been extracted into a separate component (`QueryTabContent.tsx`), reducing the main orchestrator file from 3456 → 2982 lines (13.7% reduction). This modular architecture prepares the widget for the upcoming **Spatial tab** (drawing tools, buffers, and spatial queries).

**Benefits:**
- ✅ Each tab is independently testable
- ✅ Simpler maintenance and debugging
- ✅ Room to grow: Spatial tab can be added cleanly
- ✅ No functional changes - purely architectural

#### 2. UX Feedback Popovers (r022.3-r022.26)

**Clear visual feedback for edge cases.** Users now receive immediate, dismissible feedback when their queries don't produce expected results:

**Scenario 1: Query Returns No Results**
- **When:** Query executes but finds 0 records
- **Feedback:** Popover appears below the query form
- **Message:** "No records found. Try adjusting your search criteria."

**Scenario 2: Remove Mode - Nothing to Remove**
- **When:** Query finds records, but none are in the current Results panel
- **Feedback:** Popover appears at bottom of Results panel
- **Message:** "Query found X record(s), but none were in your Results."

**Scenario 3: Add Mode - All Duplicates**
- **When:** Query finds records, but all are already in Results
- **Feedback:** Popover appears at bottom of Results panel
- **Message:** "Query found X record(s), but all were already in your Results."

**Implementation:**
- Built with Esri's Calcite Popover component
- Dismissible via X button or click outside
- Reappears on each occurrence (not sticky)
- Light yellow background for visibility
- Fully internationalized (i18n ready)

#### 3. Critical Bug Fix: Zombie Graphics (r022.1)

**Removed records now stay removed.** Fixed a bug where records removed via the X button would reappear as graphics on the map after closing and reopening the widget. The issue was caused by stale restoration logic that didn't reflect removals.

**Impact:**
- ✅ Removed records stay removed across widget close/reopen
- ✅ Graphics layer correctly reflects current Results panel state
- ✅ Works in all modes (NEW, ADD, REMOVE)

#### 4. Code Cleanup: Dead Code Removal (r022.2)

**Simpler, more maintainable codebase.** Removed 126+ lines of unused `lastSelection` fallback code that was documented as removed in r021.110 but never actually deleted from source. The widget now uses `accumulatedRecords` as the single source of truth for all restoration scenarios.

**Impact:**
- ✅ Widget bundle size reduced: 2.31 MiB → 2.29 MiB
- ✅ One source of truth (no risky fallbacks)
- ✅ Zero functional changes (already fixed in r022.1)

#### 5. Tab Auto-Switch Bug Fix (r022.22)

**Query tab no longer switches incorrectly.** Fixed a bug in Add mode where the widget would switch to the Results tab even when a query returned 0 results (but existing accumulated records were present). The tab now only switches when the **current query** returns results, not when **any results exist**.

**Impact:**
- ✅ Tab switching behavior is now correct in all modes
- ✅ No false switches when queries fail
- ✅ Improved user experience for multi-query workflows

---

### 🔄 Previous Release: r021.112 (Jan 19-27, 2026)

**Format Preservation & Multi-Source Duplicates**

The r021.112 release was a major architectural improvement focused on:
- **Format preservation** when adding from different sources (fields no longer swap)
- **Composite keys** for handling duplicate ObjectIDs from different layers
- **Architectural simplification** with `accumulatedRecords` as single source of truth
- **Bug fixes** for graphics doubling, ghost records, and mode switching

For complete details on r021.112, see previous release notes and CHANGELOG.md.

---

## Key Differentiators (Why QuerySimple?)

QuerySimple is designed to solve the common pain points of the standard Experience Builder query widget:

- **93% Latency Reduction**: Powered by a **Universal SQL Optimizer** that automatically rewrites expensive queries to use database indexes, plus **Attribute Stripping** to minimize network payloads.
- **Dual-Mode Deep Linking**: Support for both Hash Fragments (`#shortId=val`) and Query Strings (`?shortId=val`).
- **Results Accumulation**: Unlike the standard widget which clears results on every search, QuerySimple allows you to "Add to" or "Remove from" a selection set across multiple different queries.
- **Discoverable Automation**: An interactive "Info Button" (ℹ️) automatically appears to show users exactly how to deep-link to the current layer.
- **Persistence & Restoration**: Selections are maintained even when the identify tool is used, ensuring users never lose their search context.
- **Clear User Feedback**: Visual popovers provide immediate feedback for edge cases (no results, nothing to remove, all duplicates).

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
- **Tab Architecture**: Modular design with separate components for Query, Results, and future Spatial features.

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

| Format       | Example                   | Best Use Case                                                   |
| ------------ | ------------------------- | --------------------------------------------------------------- |
| **Hash (#)** | index.html#pin=123        | **Interactive UX.** Snappy, no page reload, private to browser. |
| **Query (?)** | index.html?pin=123       | **External Linking.** Standard for CRM/Email integrations.      |

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

| Switch                 | What it tracks                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| all                    | Enable every single log (Warning: High volume).                  |
| HASH                   | Deep link consumption and URL parameter parsing.                 |
| TASK                   | Query execution, performance metrics, and data source status.    |
| RESULTS-MODE           | Transitions between New, Add, and Remove selection modes.        |
| EXPAND-COLLAPSE        | State management for result item details.                        |
| SELECTION              | Identify popup tracking and map selection sync.                  |
| SELECTION-STATE-AUDIT  | Detailed selection state auditing (cross-layer grouping, intelligent checks). |
| RESTORE                | Logic used to rebuild the map selection after an identify event. |
| WIDGET-STATE           | The handshake between HelperSimple and QuerySimple.              |
| GRAPHICS-LAYER         | Highlighting logic for graphics-enabled widgets.                 |

### Known Bugs (Always Visible)

**Important:** Known bugs are logged automatically, even when `?debug=false`. These appear as warnings in the console with the format `[QUERYSIMPLE ⚠️ BUG]` to help developers understand when they encounter a known issue rather than something they've done wrong.

Each bug log includes:
- **Bug ID**: Unique identifier (e.g., `BUG-GRAPHICS-001`)
- **Category**: Bug type (SELECTION, UI, URL, DATA, GRAPHICS, PERFORMANCE, GENERAL)
- **Description**: What the bug is and why it's happening
- **Workaround**: How to avoid or work around the issue
- **Target Resolution**: When the bug will be fixed (e.g., `r023.0`)

See CHANGELOG.md for a complete list of changes and bug fixes.

---

## Documentation

All development documentation has been organized into a centralized docs/ directory for easy navigation:

- **docs/development/** - Development guides, testing, standards (start with DEVELOPMENT_GUIDE.md)
- **docs/architecture/** - Design patterns, migration plans, refactoring strategies
- **docs/technical/** - Deep dives into specific technical challenges
- **docs/features/** - Feature specifications and integration guides
- **docs/bugs/** - Bug reports and resolution documentation
- **docs/blog/** - Development insights and lessons learned

**Quick Links:**
- 📖 **New Developers:** Start with docs/development/DEVELOPMENT_GUIDE.md
- 🧪 **Testing:** See docs/development/TESTING_WALKTHROUGH.md
- 🏗️ **Architecture:** See docs/architecture/COMPLETE_MIGRATION_PLAN.md
- 📋 **Full Index:** See docs/README.md

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

## Coming Soon: Spatial Tab

The r022.0 tab extraction work prepares the foundation for the **Spatial tab** - an upcoming feature that will provide:
- **Drawing tools** for creating shapes on the map (point, line, polygon, circle, rectangle)
- **Buffer options** with customizable distance and units
- **Spatial relationships** (intersects, contains, within, touches, crosses, overlaps)
- **Unified workflow** combining the best of WAB's "By Shape" and "By Spatial" tabs

Target release: r023.0+

---

© 2025-2026 MapSimple Organization
