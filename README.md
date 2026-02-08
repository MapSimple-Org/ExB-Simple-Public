# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition (1.19.0+). Built for performance, deep-linking, and advanced result management.

**Current Version**: `1.19.0-r022.103`  
**Latest Update**: Graphics Symbology v2 + UX Improvements (Feb 8, 2026)

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

## What's New: r022.97 → r022.103 (Feb 8, 2026)

### 🎨 Graphics Symbology v2

**Fully configurable graphics layer styling** - customize colors, opacity, and sizing for both fill and outline.

**New Features:**
- **Settings UI Controls**: Color pickers, opacity sliders, and size controls for fill and outline
- **Centralized Configuration**: `HighlightConfigManager` singleton manages all graphics symbology
- **Per-Widget Customization**: Each QuerySimple widget can have its own color scheme
- **New Default Color**: Magenta (#DF00FF) - brighter and more visible than the old purple

**Configuration Options:**
- Fill Color (hex color picker)
- Fill Opacity (0-1 slider)
- Outline Color (hex color picker)
- Outline Width (1-5px)
- Point Marker Size (8-24px)

### 🎯 UX Improvements

**Zoom to Results Button** - Moved from hidden Actions menu to prominent Results tab header
- **Why**: Users requested more discoverable placement
- **Location**: Right of the Clear (trash) button
- **Size**: 36x36px touch-friendly target (WCAG/Apple HIG compliant)

### 🐛 Critical Fixes

**Selection Count Bug Resolved** - Fixed "3 selections with 2 results" issue
- **Root Cause**: Faulty optimization was forcing duplicate selection calls
- **Solution**: Removed the problematic r022.96 "fix" that was causing the bug
- **Result**: Selection counts now accurate in all modes (New/Add/Remove)

**Popup Multi-Click Issue Fixed** - Popups now open on first click
- **Bug**: `[esri.widgets.Features]` warning caused popup issues
- **Solution**: Set `shouldFocus: false` in `mapView.openPopup()`
- **Impact**: Consistent popup behavior across all interactions

**Graphics Z-Order Optimization** - Purple graphics now consistently render on top of native blue selection
- **Implementation**: Graphics layer repositioned to end of layer stack on each render
- **Result**: Both colors visible (purple fill + blue outline)

---

## Previous Updates: r022.87 (Feb 7, 2026)

### 🚀 Infrastructure: Namespace Migration

**Renamed shared utilities from `common` to `mapsimple-common`** to prevent module conflicts in multi-vendor deployments.

**Why**: Experience Builder loads all custom widgets into a shared runtime. Generic `common` namespace risked collision with other developers' widgets.

**Impact**:
- ✅ Collision-proof namespace for safe deployment
- ✅ No breaking changes (handled internally)
- ✅ 47 files migrated across 8 groups with zero regressions

---

## Previous Updates: r022.77 (Feb 5, 2026)

### 🎯 Critical Fixes

**Widget Minimize vs Close Detection** - Fixed widget minimize incorrectly clearing selections
- **Bug**: Minimizing triggered close logic, clearing map selections
- **Solution**: Uses `props.state` from Experience Builder to distinguish minimize from close
- **Result**: Minimize preserves selections; close clears them (as expected)

**Cross-Layer Selection Count** - Fixed incorrect selection counts when accumulating from multiple layers
- **Bug**: 6 selected instead of 4 when mixing Parcels + Address Points
- **Solution**: Records grouped by `__queryConfigId` and selected on correct origin data sources
- **Result**: Accurate selection counts across all layer combinations

---

## Key Features

### Why QuerySimple?

QuerySimple solves the common pain points of the standard Experience Builder query widget:

- **93% Latency Reduction**: Universal SQL Optimizer + Attribute Stripping minimize network payloads
- **Dual-Mode Deep Linking**: Hash Fragments (`#shortId=val`) and Query Strings (`?shortId=val`)
- **Results Accumulation**: "Add to" or "Remove from" selections across multiple queries
- **Discoverable Automation**: Interactive Info Button (ℹ️) shows users how to deep-link
- **Persistence**: Selections maintained even when identify tool is used

### Advanced Features

- **Duplicate Query Button**: Clone any query instantly with all settings preserved
- **Query Grouping**: Organize dozens of searches into clean two-dropdown hierarchy
- **SQL Optimizer**: Automatically unwraps `LOWER()` to ensure database index usage
- **Display Order Control**: Prioritize searches via `order` property
- **Configurable Graphics**: Custom colors, opacity, and sizing for highlights

---

## Widgets in this Suite

### 🔍 QuerySimple (`query-simple/`)
High-performance search engine for Experience Builder.

### 🛠️ HelperSimple (`helper-simple/`)
Background orchestrator that handles:
- **URL Monitor**: Triggers QuerySimple automation from hash/query strings
- **Selection Guard**: Restores results after map identify popup closes
- **Handshake Logic**: Manages open/close state between widgets

### 📦 Shared Code (`shared-code/`)
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

Known bugs are logged automatically with format `[QUERYSIMPLE ⚠️ BUG]` including:
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

© 2025 MapSimple Organization.
