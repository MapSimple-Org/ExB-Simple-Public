# Release v1.19.0-r024.62

**Release Date:** 2026-02-19  
**Experience Builder Version:** 1.19.0+

## Highlights

### Service Error Feedback (r024.62)

**Query failures from service outages now surface user-facing messages.** When the backing ArcGIS map service is down or returns an unexpected response, users previously saw silent failures: the spinner disappeared and the form returned with no feedback.

**What Changed:**
- Added `queryErrorAlert` state (same pattern as zero-results feedback from r022.3)
- On query chain failure, a red-themed `calcite-popover` appears anchored below the form
- Message: "Search could not be completed. The map service may be temporarily unavailable."
- Popover is closable, auto-closes, and clears on the next query execution

**Technical Details:**
- The ArcGIS JS API's PBF parser throws when the service returns an error page or empty body instead of valid PBF data
- Error is caught in the query chain's `.catch` handler and surfaced via the popover
- i18n strings added for internationalization support

### Clear-All Graphics Race Condition Fix (r024.61)

**Fixed: "Remove all" (trash button) now properly clears graphics on first query in multi-widget apps.**

**Symptoms:**
- Graphics remained on the map after clicking "Remove all" when the non-LayerList widget was the first to run a query
- Subsequent clear-all operations worked correctly
- If the LayerList widget ran a query first, the bug did not manifest

**Root Cause:**
- `createOrGetGraphicsLayer` had no concurrency guard
- During widget init, two concurrent calls (from `handleDataSourceCreated` and `initializeGraphicsLayerFromOutputDS`) both passed the "does it exist?" check before either added to the map
- This created two `GraphicsLayer` objects with the same ID but different internal UIDs
- The map kept one layer, the widget ref held the other
- Graphics were added to the ref's layer, but `clearAnyResultLayerContents` found the map's layer (empty) by ID lookup

**Fix:**
- Added `graphicsLayerCreationInProgress` lock (same pattern as `createOrGetResultGroupLayer` from r024.17)
- Second concurrent caller now awaits the first caller's promise
- Added double-check after async module load

### Popup Behavior Fixes (r024.58-59)

**r024.59 - Popup Closes on Layer Toggle-Off:**
- In LayerList mode, when the user toggles the result layer OFF via the LayerList, the graphics disappear but the popup was staying open pointing at nothing
- Added a module-level `mapViewCache` to cache the mapView per widgetId
- The existing legend-layer visibility watcher now closes the popup when `visible` flips to `false`

**r024.58 - Popup Persists in LayerList Mode:**
- In LayerList mode, graphics persist on the map after the widget panel closes, so popup content remains valid
- Added `isLayerListMode` check: only close popup on panel close in non-LayerList (graphics layer) mode
- Previously, closing the panel would always close the popup, even when the underlying graphics were still visible

## Files Modified

### r024.62
- `query-simple/src/runtime/query-task.tsx` - `queryErrorAlert` state, set in `.catch`, cleared in `clearResult`, passed to `QueryTabContent`
- `query-simple/src/runtime/tabs/QueryTabContent.tsx` - New props, red popover with warning icon
- `query-simple/src/runtime/translations/default.ts` - Three new i18n strings
- `query-simple/src/version.ts` - Increment to r024.62

### r024.61
- `query-simple/src/runtime/graphics-layer-utils.ts` - Creation lock, internal factory function, lock cleanup in `cleanupGraphicsLayer`, UID tracking

### r024.59
- `query-simple/src/runtime/graphics-layer-utils.ts` - mapView cache, popup close in watcher, cache cleanup

### r024.58
- `query-simple/src/runtime/widget.tsx` - Conditional popup close in `handleVisibilityChange`

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

- All fixes are backward compatible
- No configuration changes required
- No migration needed

## Documentation

- [README](../../README.md) - Installation and configuration
- [CHANGELOG](../../CHANGELOG.md) - Full change history
- [Previous Release: r024.18](RELEASE_v1.19.0-r024.18.md) - LayerList Persistent Results
