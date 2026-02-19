# Release v1.19.0-r024.63

**Release Date:** 2026-02-19  
**Experience Builder Version:** 1.19.0+

## Highlights

This release includes a major performance overhaul (memory leak investigation and direct query bypass), architectural cleanup, and improved user feedback for service outages.

---

## Error Feedback Refinement (r024.63)

**The service error popover now only appears for actual service/network failures.**

### The Problem (r024.62)

The error popover introduced in r024.62 was too aggressive. It caught ANY error in the query chain and displayed the "service unavailable" message, even for transient JavaScript errors or processing issues unrelated to service availability.

### Solution (r024.63)

The error handler now filters by error message patterns before showing the popover:

- `Unable to complete operation` - ArcGIS Server errors
- `Failed to fetch` / `NetworkError` - Browser network failures
- `featureResult` / `PBF` - Parser errors from invalid service responses
- `timeout` / `ETIMEDOUT` / `ECONNREFUSED` - Network timeouts
- HTTP status codes `500`, `502`, `503`, `404`

Processing errors in the chain are still logged via `debugLogger` but no longer trigger the user-facing popover.

---

## Memory Leak Investigation & Query Engine Overhaul (r024.48-r024.57)

**Major performance improvement: 99% memory reduction per query cycle.**

### The Problem

Each query execution was leaking memory. Heap snapshots showed +127 MB/query at steady state (r024.39 baseline). After 10-15 queries, browser tabs became sluggish or crashed.

### Root Cause Analysis

Systematic investigation identified multiple leak sources:

1. **ExB's `outputDS.load()` method** - Primary leak source. Each call accumulated internal state that was never released.
2. **Esri Feature widget wrapper** - The `jimu-arcgis` wrapper prevented ESRI's core from cleaning up ObservationHandles (50K+ leaked per cycle).
3. **GroupLayer recreation** - Destroying and recreating the GroupLayer on each clear added ~32 MB overhead.
4. **Legend FeatureLayer recreation** - Creating new Legend FLs instead of reusing added additional overhead.

### Solutions Implemented

#### Direct Query Bypass (r024.50, r024.57)

**Bypasses ExB's `outputDS.load()` entirely** - the primary memory leak source.

```
Query Execution Flow:
├── OLD: queryTask.execute() → outputDS.load() → LEAK
└── NEW: queryTask.execute() → outputDS.buildRecord() → NO LEAK
```

**Key insight:** `outputDS.buildRecord()` is ExB's own method that "builds a data record only - does not add the record into data source." This gives us real `FeatureDataRecord` objects with full functionality (coded domain formatting, `getFormattedFieldValue()`, `clone()`, attachment support) while bypassing the leak.

**Debug logging added:**
- `QUERY-PATH` - Logs which fork is taken (DIRECT vs EXB legacy)
- `DIRECT-QUERY` - Logs execution details (timing, record count, geometry)
- Enable via `?debug=QUERY-PATH,DIRECT-QUERY`

#### Direct Feature Import (r024.48/51)

Changed `feature-info.tsx` to import `Feature` directly from `@arcgis/core/widgets/Feature` instead of the `jimu-arcgis` wrapper.

**Result:** ESRI's core can now delete its own ObservationHandles between queries (50K+ deleted per cycle vs ~0 through the wrapper).

#### Persistent GroupLayer Architecture (r024.52-54)

**Before:** GroupLayer destroyed and recreated on each "Clear All"  
**After:** GroupLayer persists on map; only contents cleared

- `clearGroupLayerContents()` preserves the GroupLayer
- `cleanupGroupLayer()` reserved exclusively for widget unmount
- Legend FeatureLayers reused via `legendEnabled` toggle instead of destroy/create

### Performance Results

| Query | Memory | Growth | Records |
|---|---|---|---|
| Base | 175 MB | -- | -- |
| Q1 + clear | 257 MB | +82 MB | 1 |
| Q2 + clear | 319 MB | +62 MB | 1 |
| Q3 + clear | 320 MB | **+1 MB** | 1 |
| Q4 + clear | 321 MB | **+1 MB** | 1 |
| Q5 + clear | 335 MB | **+14 MB** | 160 |

**99% reduction** (single record) and **89% reduction** (160 records) vs r024.39 baseline of 127 MB/query.

---

## FeatureInfo Detached DOM Leak Fix (r023.19-21)

**Fixed a memory leak where every result clear, query switch, or record removal leaked Esri Feature widget DOM nodes.**

### The Problem

Heap snapshots showed +6,641 detached `<div>` elements per heavy cycle before the fix.

### Root Cause

The `FeatureInfo` component (originally from Esri's stock query widget) was missing two cleanup paths:

1. **No `componentWillUnmount` lifecycle method** - Esri Feature widget and its container were never cleaned up on unmount.
2. **Incomplete `destroyFeature()`** - Only called `this.feature.destroy()` without removing the container div or nulling the reference.

### Results

| Metric | Before | After | Reduction |
|---|---|---|---|
| Detached `<div>` | +6,641/cycle | +1,183/cycle | **82%** |
| Detached `<button>` | +1,142/cycle | Eliminated | **100%** |

Remaining detached DOM is Esri SDK internal and not addressable from application code.

---

## Service Error Feedback (r024.62)

**Query failures from service outages now surface user-facing messages.**

### The Problem

When the backing ArcGIS map service is down or returns an unexpected response, users previously saw silent failures: the spinner disappeared and the form returned with no feedback.

### Solution

On query chain failure, a red-themed `calcite-popover` appears anchored below the form:

- **Title:** "Search could not be completed"
- **Message:** "The map service may be temporarily unavailable. Please try again in a few minutes."
- Popover is closable, auto-closes, and clears on the next query execution
- i18n strings added for internationalization support

### Technical Details

The ArcGIS JS API's PBF parser throws when the service returns an error page or empty body instead of valid PBF data. The error is caught in the query chain's `.catch` handler and surfaced via the popover.

---

## Graphics Race Condition Fix (r024.61)

**Fixed: "Remove all" (trash button) now properly clears graphics on first query in multi-widget apps.**

### Symptoms

- Graphics remained on the map after clicking "Remove all" when the non-LayerList widget was the first to run a query
- Subsequent clear-all operations worked correctly
- If the LayerList widget ran a query first, the bug did not manifest

### Root Cause

`createOrGetGraphicsLayer` had no concurrency guard. During widget init, two concurrent calls both passed the "does it exist?" check before either added to the map. This created two `GraphicsLayer` objects with the same ID but different internal UIDs. The map kept one layer, the widget ref held the other.

### Solution

Added `graphicsLayerCreationInProgress` lock (same pattern as `createOrGetResultGroupLayer` from r024.17). Second concurrent caller now awaits the first caller's promise.

---

## Popup Behavior Fixes (r024.58-59)

### r024.59 - Popup Closes on Layer Toggle-Off

In LayerList mode, when the user toggles the result layer OFF via the LayerList, the graphics disappear but the popup was staying open pointing at nothing.

**Fix:** Added a module-level `mapViewCache` to cache the mapView per widgetId. The existing legend-layer visibility watcher now closes the popup when `visible` flips to `false`.

### r024.58 - Popup Persists in LayerList Mode

In LayerList mode, graphics persist on the map after the widget panel closes, so popup content remains valid.

**Fix:** Added `isLayerListMode` check: only close popup on panel close in non-LayerList (graphics layer) mode.

---

## LayerList Remove Action Disabled (r024.56)

**Users can no longer accidentally remove the GroupLayer via LayerList's "Remove" action.**

### Previous Approach (r024.16)

Layer automatically re-added itself if removed. This worked but created a +58 MB destroy/recreate cycle.

### New Approach (r024.56)

After `mapView.map.add(groupLayer)`, the ExB-stamped `__exb_layer_from_runtime` flag is set to `false`. ExB's map-layers widget only shows the Remove (trash) button for layers where this flag is truthy.

**Result:** Remove button doesn't appear at all. No destroy/recreate cycle possible.

---

## Selection Architecture Overhaul (r023.5-13)

**Automatic blue map outlines removed from query execution.**

### What Changed

Query results now only show purple/magenta highlight graphics. Blue selection outlines appear only when the user explicitly clicks "Select on Map."

| Path | Before | After |
|---|---|---|
| Query execution | Blue outlines auto-created | Purple graphics only |
| Query switching | Blue outlines auto-created | Purple graphics only |
| Panel reopen | Blue outlines auto-created | Purple graphics only |
| "Select on Map" button | Blue outlines | Blue outlines (unchanged) |

### Why This Matters

- **User control:** Users choose when to create native selections
- **Performance:** Fewer selection operations per query
- **Cleaner UX:** No unexpected blue outlines cluttering the map

### Code Cleanup

The reselection block that ran during query switches was reduced from 372 lines to ~30 lines. Dead code paths for automatic selection were removed.

---

## Results Mode UX Overhaul (r023.22-26)

**The New/Add/Remove mode selector has been redesigned** to make it clear these are modes, not action buttons.

### What Changed

- **Segmented control:** Buttons sit inside a unified tray instead of floating separately
- **Per-mode colors:** New (blue), Add (green), Remove (muted red) for instant visual identity
- **Per-mode icons:** Star, plus, and minus reinforce each mode at a glance
- **Logic summary bar:** A colored banner below the buttons confirms the active mode in plain language
- **Theme-proof colors:** Mode colors are hardcoded so they maintain semantic meaning regardless of ExB theme

---

## Custom Template Mode (r023.18)

**New "Custom Template" result display option.**

A third choice alongside "Popup setting" and "Select attributes" in the Results configuration. Users author a Markdown template with `{fieldName}` tokens that gets converted to styled HTML at runtime.

### Supported Markdown Syntax

- `**bold**`, `*italic*`, headings (`#`, `##`, `###`)
- Lists (`- item`), horizontal rules (`---`), links (`[text](url)`)
- Leading spaces for indentation, line breaks, and paragraph spacing

### Settings UI

- Monospace content editor with field picker button
- `(?)` hover tooltip with full syntax cheat sheet
- Live preview panel with badge-styled field tokens

---

## Cross-Layer Selection Fixes (r023.28-30)

### r023.28 - Native Selection Clearing on Single-Item Removal

When removing a record via the X button after using "Select on Map", the blue outline now clears correctly.

### r023.29 - Expand/Collapse State Preservation

Expand/collapse state no longer resets when switching between New/Add/Remove modes.

### r023.30 - Cross-Layer Removal for Accumulated Results

Native selection now clears correctly when removing records from non-current layers. Records are stamped with `__originDSId` attribute for proper cross-layer lookup.

---

## Installation

Copy the widget folders to your Experience Builder installation:

```
your-extensions/widgets/
  query-simple/
  helper-simple/
  shared-code/
```

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Backward Compatibility

- All changes are backward compatible
- No migration required
- Default behaviors unchanged unless explicitly configured

## Documentation

- [README](../README.md) - Installation and configuration
- [CHANGELOG](../CHANGELOG.md) - Full change history
