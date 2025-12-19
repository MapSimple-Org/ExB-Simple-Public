# QuerySimple Widget - Bug Tracking and Performance Issues

## Status: Open Issues

---

## Bug #1: Graphics Layer Not Clearing When Switching Queries in "New" Mode

**Status:** ✅ RESOLVED (r017.29)  
**Priority:** High  
**Version:** r017.29  
**Date Updated:** 2025-12-18

### Description
When switching queries in "New" mode, the graphics layer retained graphics from the previous query. This was due to a race condition where the native selection sync was fighting with our clearing logic.

### Solution (r017.29)
1.  **Centralized Selection Dispatch**: Created `dispatchSelectionEvent` in `selection-utils.ts` to ensure all components notify the main widget of selection changes simultaneously.
2.  **Virtual Clear**: Implemented "effective" values in `QueryTask.tsx` to immediately hide old results in the UI during a switch, even if the data source takes a moment to clear.
3.  **Sticky Selection**: Modified `QueryTaskList.tsx` to prevent resetting to the default query when a hash parameter is removed from the URL.
4.  **Native Sync**: Ensured `publishSelectionMessage` is called with empty arrays during clearing to force the Map's blue highlight boxes to vanish.

## Bug #2: Hash Parameters Not Being Cleaned Up Properly / Resetting Selection

**Status:** ✅ RESOLVED (r017.30)  
**Priority:** Medium  
**Version:** r017.30  
**Date Updated:** 2025-12-19

### Description
URL hash parameters (like `#pin=...`) were causing the widget to reset to the first query in the display order as soon as the parameter was removed from the URL, even if the results were still active. Additionally, hash parameters were sometimes re-triggering "New Mode" resets when the user tried to switch to "Add" or "Remove" modes, because the hash remained in the URL and triggered the initialization logic again.

### Solution (r017.30)
1.  **Deep Link Consumption**: Modified `widget.tsx` to automatically clear hash parameters from the URL when the user switches to **"Add"** or **"Remove"** results management modes. This signals that the deep link has been "consumed" and prevents the widget from re-initializing and resetting the mode during re-renders.
2.  **Sticky Selection**: Improved `QueryTaskList.tsx` to make the selection "sticky" so it doesn't reset when the hash is removed.

## Bug #3: Record Capture Failure when Switching to "Add" Mode

**Status:** ✅ RESOLVED (r017.31)  
**Priority:** High  
**Version:** r017.31  
**Date Updated:** 2025-12-19

### Description
When a user had results visible in "New" mode and clicked the "Add" button, the existing results were sometimes lost. This happened because the capture logic was only looking at the React `records` prop, which might be empty during a render transition.

### Solution (r017.31)
1.  **Dual-Source Capture Strategy**: Modified `QueryTask.tsx` to check both the internal `effectiveRecords` state AND the current `outputDS.getSelectedRecords()`.
2.  **Strict Record Preference**: Updated `query-result.tsx` to strictly prefer the `records` prop (the accumulated set) when in accumulation modes (Add/Remove). This ensures the UI remains consistent even if the underlying data source's selection briefly fluctuates during query execution.
3.  **Humanized Testing**: Added 1-second "breathing room" delays to Playwright tests to better simulate human interaction speed and allow React state updates to complete.

---

## Performance Issue #1: Query Execution Speed

**Status:** ✅ RESOLVED (r017.39)  
**Priority:** High  
**Version:** r017.39  
**Date Updated:** 2025-12-19

### Description
Query execution was significantly slower than the same queries in Web AppBuilder (WAB). For some datasets, like Major Number searches, fetch times were exceeding 20 seconds.

### Solution (r017.39)
We identified and "killed" four major bottlenecks:
1.  **Universal SQL Optimizer**: Automatically detects and "unwraps" the framework's `LOWER()` function from database fields in the `WHERE` clause. This restores the database's ability to use attribute indexes (SARGable queries). It simultaneously normalizes the user's input to uppercase to maintain case-insensitivity.
2.  **Attribute Stripping**: Forced the widget to request only the specific fields needed for the Result Title and List. This eliminated "Field Bloat" where the framework was requesting `*` (all fields), causing massive server-side overhead.
3.  **Geometry Generalization**: Forced `maxAllowableOffset: 0.1` for all display queries. This reduces the network payload by simplifying complex polygon geometries (like parcels) for faster transfer.
4.  **Instant UI (Spinner Bypass)**: Decoupled the "Retrieving results..." spinner from the map zoom animation. The spinner now hides the microsecond data arrives, allowing user interaction while the map zooms in the background.
5.  **Round-Trip Reduction**: Eliminated the separate `executeCountQuery` call, deriving the record count directly from the main `executeQuery` result.

**Result**: Fetch times dropped from **21.3s** to **1.4s** for the same 121-record query.

---

## Notes

- All bugs/issues should be tested with graphics layer highlighting enabled
- Logs are available via `createQuerySimpleDebugLogger()` - check browser console
- Version tracking: See `src/version.ts` for current version
- When fixing bugs, remember to increment minor version and rebuild (see `DEVELOPMENT_GUIDE.md`)
