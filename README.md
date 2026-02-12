# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition (1.19.0+). Built for performance, deep-linking, and advanced result management.

**Current Version**: `1.19.0-r023.23`  
**Latest Update**: Results Mode UX Overhaul + FeatureInfo DOM Leak Fix (Feb 12, 2026)

---

## Quick Start

### Installation

1. **Copy widgets to your ExB installation:**
   ```bash
   # Copy all three folders to your-extensions/widgets/
   cp -r query-simple helper-simple shared-code /path/to/ExB/client/your-extensions/widgets/
   ```

2. **Build the widgets:**
   ```bash
   cd /path/to/ExB/client
   npm run build
   ```

3. **Restart Experience Builder** and add QuerySimple + HelperSimple to your app

---

## What's New: r023.14-23 (Feb 12, 2026)

### Results Mode UX Overhaul (r023.22-23)

**The New/Add/Remove mode selector has been redesigned** to make it clear these are modes, not action buttons. Users previously confused "Remove" for an action that should do something immediately.

**What Changed:**
- **Segmented control**: Buttons sit inside a unified tray instead of floating separately
- **Per-mode colors**: New (blue), Add (green), Remove (muted red) for instant visual identity
- **Per-mode icons**: Star, plus, and minus reinforce each mode at a glance
- **Logic summary bar**: A colored banner below the buttons confirms the active mode in plain language (e.g., "Each query replaces previous results.")
- **"Results Mode" label**: Replaces the ambiguous "Results:" label
- **Theme-proof colors**: Mode colors are hardcoded so they maintain semantic meaning regardless of ExB theme configuration

### FeatureInfo Detached DOM Leak Fix (r023.19-21)

**Fixed a memory leak where every result clear, query switch, or record removal leaked Esri Feature widget DOM nodes.** Heap snapshots showed +6,641 detached `<div>` elements per heavy cycle before the fix.

**Root cause:** The `FeatureInfo` component (originally from Esri's stock query widget) was missing two cleanup paths:
1. No `componentWillUnmount` lifecycle method. Esri Feature widget and its container were never cleaned up on unmount.
2. Incomplete `destroyFeature()` that left orphaned container elements on prop updates.

**Results (heap snapshot comparison):**
- Detached `<div>`: 6,641/cycle reduced to 1,183/cycle (82% reduction)
- Detached `<button>`: 1,142/cycle eliminated from top entries
- Remaining detached DOM is Esri SDK internal and not addressable from application code

### Custom Template Mode (r023.18)

**New "Custom Template" result display option.** A third choice alongside "Popup setting" and "Select attributes" in the Results configuration. Users author a Markdown template with `{fieldName}` tokens that gets converted to styled HTML at runtime.

**Supported Markdown syntax:**
- `**bold**`, `*italic*`, headings (`#`, `##`, `###`)
- Lists (`- item`), horizontal rules (`---`), links (`[text](url)`)
- Leading spaces for indentation, line breaks, and paragraph spacing

**Settings UI includes:**
- Monospace content editor with field picker button
- `(?)` hover tooltip with full syntax cheat sheet
- Live preview panel with badge-styled field tokens

### Bug Fixes (r023.14-17)

**Zombie records reappearing after X-button removal.** Records removed via the X-button would reappear when switching from Add mode to New mode. Fixed by syncing `recordsRef` with `accumulatedRecords` when removals are detected.

**Cross-query popup template using wrong origin data source.** Parcel records lost their formatting when accumulated with park records in Add mode. Fixed by adding conditional `__queryConfigId` stamping and per-record origin data source resolution.

---

## Previous Updates: r023.5-13 (Jan 25, 2026)

### Selection Architecture Overhaul

**Automatic blue map outlines removed from query execution.** Query results now only show purple/magenta highlight graphics. Blue selection outlines appear only when the user explicitly clicks "Select on Map."

**What Changed:**
- Query execution, query switching, panel reopen, and popup close no longer trigger automatic blue outlines
- "Add to map" renamed to "Select on Map" to reflect the new explicit behavior
- Explicit user actions (Select on Map, record click, Remove, Clear All) work exactly as before
- "Select on Map" blue outlines now persist through panel close/reopen

**Bug Fixes:**
- Fixed blue outlines appearing on widget panel reopen and identify popup close
- Fixed URL hash (`data_s`) not being cleaned after widget panel close
- Simplified query switch reselection block from 372 lines to ~30 lines

**Settings Validation:**
- Red warning appears in widget settings when no map widget is selected (required for highlights to display)

---

## Previous Updates: r022.108-109 (Feb 9, 2026)

### Animated Spring Drop for Hover Preview Pin

Google Maps-style drop-and-bounce animation when pins appear. Spring physics with stiffness `0.15` and damping `0.8`, smooth `requestAnimationFrame` loop, and proper cleanup on mouse leave/click/unmount.

---

## Previous Updates: r022.107 (Feb 9, 2026)

### Configurable Hover Preview Pin Color

New "Hover Preview Pin" section in widget settings with color picker. Default yellow (#FFC107), auto-generated lighter center circle, and dynamic CIM symbol color application.

---

## Previous Updates: r022.97-103 (Feb 8, 2026)

### Graphics Symbology v2

**Fully configurable graphics layer styling** with color pickers, opacity sliders, and size controls.

- Centralized Configuration: `HighlightConfigManager` singleton
- Per-Widget Customization: Each QuerySimple widget can have its own color scheme
- Default Color: Magenta (#DF00FF)

### UX Improvements

- **Zoom to Results Button**: Moved from hidden Actions menu to prominent Results tab header
- **Touch Target Optimization**: 36x36px buttons (WCAG/Apple HIG compliant)

### Critical Fixes

- **Selection Count Bug**: Fixed "3 selections with 2 results" issue
- **Popup Multi-Click Issue**: Popups now open on first click
- **Graphics Z-Order**: Purple graphics consistently render on top of native selection

---

## Key Features

### Why QuerySimple?

QuerySimple solves the common pain points of the standard Experience Builder query widget:

- **93% Latency Reduction**: Universal SQL Optimizer + Attribute Stripping minimize network payloads
- **Dual-Mode Deep Linking**: Hash Fragments (`#shortId=val`) and Query Strings (`?shortId=val`)
- **Results Accumulation**: "Add to" or "Remove from" selections across multiple queries
- **Discoverable Automation**: Interactive Info Button shows users how to deep-link
- **Persistence**: Selections maintained even when identify tool is used

### Advanced Features

- **Custom Template Mode**: Markdown-based result display with field tokens and live preview
- **Duplicate Query Button**: Clone any query instantly with all settings preserved
- **Query Grouping**: Organize dozens of searches into clean two-dropdown hierarchy
- **SQL Optimizer**: Automatically unwraps `LOWER()` to ensure database index usage
- **Display Order Control**: Prioritize searches via `order` property
- **Configurable Graphics**: Custom colors, opacity, and sizing for highlights

---

## Widgets in this Suite

### QuerySimple (`query-simple/`)
High-performance search engine for Experience Builder.

### HelperSimple (`helper-simple/`)
Background orchestrator that handles:
- **URL Monitor**: Triggers QuerySimple automation from hash/query strings
- **Selection Guard**: Restores results after map identify popup closes
- **Handshake Logic**: Manages open/close state between widgets

### Shared Code (`shared-code/`)
Common utilities shared between widgets:
- Debug logger (`mapsimple-common/debug-logger.ts`)
- Data source utilities (`mapsimple-common/use-ds-exists.tsx`)
- UI components (`mapsimple-common/common-components.tsx`)
- Graphics configuration (`mapsimple-common/highlight-config-manager.ts`)

---

## Configuration

### URL Parameters (Deep Linking)

Configure a `shortId` for any query to enable instant automation:

| Format | Example | Best Use Case |
| :--- | :--- | :--- |
| **Hash (#)** | `index.html#pin=123` | **Interactive UX.** Snappy, no page reload |
| **Query (?)** | `index.html?pin=123` | **External Linking.** CRM/Email integrations |

### Display Order & Grouping

- **`groupId`**: Clusters related searches (e.g., "Parcels")
- **`searchAlias`**: Label shown inside the group (e.g., "Search by PIN")
- **`order`**: Numeric value (1, 2, 3...) forces search to top of list

### Graphics Symbology

Configure in widget settings:
- **Fill Color**: Hex color picker (default: #DF00FF magenta)
- **Fill Opacity**: 0-1 (default: 0.25)
- **Outline Color**: Hex color picker (default: #DF00FF magenta)
- **Outline Width**: 1-5px (default: 2px)
- **Point Size**: 8-24px (default: 12px)

---

## Troubleshooting

### Debug System

Production-safe debugging via URL parameter: `?debug=FEATURE`

**Available switches:**
- `all` - Enable all logs (high volume)
- `HASH` - URL parameter parsing and consumption
- `TASK` - Query execution and performance
- `RESULTS-MODE` - New/Add/Remove mode transitions
- `SELECTION` - Map selection sync
- `RESTORE` - Selection restoration logic
- `GRAPHICS-LAYER` - Highlighting logic
- `WIDGET-STATE` - Widget handshake events

**Example:** `index.html?debug=HASH,TASK`

### Known Bugs

Known bugs are logged automatically with format `[QUERYSIMPLE BUG]` including:
- Bug ID and category
- Description and workaround
- Target resolution version

---

## Testing

Verified by a **"Mega-Journey" E2E suite** that simulates 5-minute user sessions.

```bash
# 1. Manual Auth (once per day)
npm run test:e2e:auth-setup

# 2. Run the Mega-Journey
npx playwright test tests/e2e/query-simple/session.spec.ts --project=chromium --headed
```

---

## Requirements

- ArcGIS Experience Builder Developer Edition **1.19.0+**
- Node.js (version matching your ExB installation)

---

## Support & Documentation

- **Issues**: [Report bugs on GitHub](https://github.com/MapSimple-Org/ExB-Simple-Public/issues)
- **Changelog**: See [CHANGELOG.md](CHANGELOG.md) for complete version history
- **License**: MIT - see [LICENSE](LICENSE)

---

© 2026 MapSimple Organization.
