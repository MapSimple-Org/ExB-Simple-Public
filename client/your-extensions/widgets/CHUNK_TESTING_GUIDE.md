# Chunk Testing Guide

**Created:** 2025-12-23  
**Purpose:** Comprehensive testing guide for each chunk during migration

**Note:** Temporary debug switches (`CHUNK-X-COMPARE`, etc.) will be removed after migration is complete.

---

## Overview

This guide provides **specific testing instructions** for each chunk during the migration process. Each chunk has unique test scenarios and debug switches to verify correctness.

**Key Principle:** Test incrementally, verify via logging, don't assume correctness.

---

## Debug Switches Reference

### Temporary Migration Debug Features

**These switches are temporary and will be removed after migration:**

- ~~**`CHUNK-1-COMPARE`**~~ - ✅ Removed (r018.10)
- ~~**`CHUNK-2-COMPARE`**~~ - ✅ Removed (r018.13)
- ~~**`CHUNK-3-COMPARE`**~~ - ✅ Removed (r019.8 - Section 3.1 only)
- **`CHUNK-3-DECISION`** - Chunk 3 decision point logs (for Sections 3.2-3.3)
- **`CHUNK-3-FALLBACK`** - Chunk 3 fallback logic logs (for Sections 3.2-3.3)
- ~~**`CHUNK-4-COMPARE`**~~ - ✅ Removed (r018.25)
- ~~**`CHUNK-5-COMPARE`**~~ - ✅ Removed (r018.58)
- ~~**`CHUNK-6-COMPARE`**~~ - ✅ Removed (r018.18)
- ~~**`CHUNK-7-COMPARE`**~~ - ✅ Removed (r018.111)

### Permanent Debug Features

- **`HASH`** - Hash parameter processing (Chunk 1)
- **`WIDGET-STATE`** - Widget lifecycle events (Chunk 2)
- **`SELECTION`** - Selection detection (Chunk 3)
- **`RESTORE`** - Selection restoration (Chunk 3)
- **`GRAPHICS-LAYER`** - Graphics layer highlighting (Chunk 4)
- **`RESULTS-MODE`** - Results management mode (Chunk 5)
- **`MAP-EXTENT`**, **`ZOOM`** - Map view management (Chunk 6)
- **`all`** - Enable all features (use for comprehensive testing)

---

## Chunk 1: URL Parameter Consumption

**Status:** ✅ **COMPLETE** (r018.10)

### Debug Switches

**For Production Testing:**
```
?debug=HASH
```

**Why:** 
- `HASH` shows hash parameter processing logs from the manager implementation
- Comparison logs (`CHUNK-1-COMPARE`) were removed after verification (r018.8)

**Note:** Chunk 1 migration is complete. The old `checkQueryStringForShortIds()` method has been removed and replaced with `UrlConsumptionManager`.

### What to Test

**Note:** These tests were used during migration (r018.2-r018.7) to verify correctness. Chunk 1 is now complete and using only the manager implementation.

#### Test 1: Hash Parameter Detection (`#shortId=value`)

**Steps:**
1. Open widget with hash parameter: `#pin=123` (or your configured shortId)
2. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-HASH]` - `url-param-detected` with `foundIn: 'hash'`
- `[QUERYSIMPLE-HASH]` - `url-param-detected` with `foundIn: 'manager'`

**What to Verify:**
- ✅ Widget opens automatically
- ✅ Correct query is selected
- ✅ Input field is populated with value
- ✅ Query executes automatically (with proper React state synchronization)
- ✅ No empty queries (race condition fixed in r018.9)

#### Test 2: Query String Parameter Detection (`?shortId=value`)

**Steps:**
1. Open widget with query string: `?pin=123` (or your configured shortId)
2. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-HASH]` - `url-param-detected` with `foundIn: 'query'`
- `[QUERYSIMPLE-HASH]` - `url-param-detected` with `foundIn: 'manager'`

**What to Verify:**
- ✅ Widget opens and executes query
- ✅ Query string parameters are detected correctly
- ✅ No empty queries (race condition fixed in r018.9)

#### Test 3: Hash Priority Over Query String

**Steps:**
1. Open widget with both: `#pin=123&?pin=456`
2. Check browser console for logs

**Expected Logs:**
- Both implementations should detect `pin=123` (hash value)
- Both implementations should ignore `pin=456` (query string value)
- `CHUNK-1-COMPARE` with `match: true`
- **NO** logs with `match: false`

**What to Verify:**
- ✅ Hash parameter (`123`) is used, not query string (`456`)
- ✅ Both implementations agree on priority
- ✅ Comparison logs show `match: true`

#### Test 4: Hash Parameter Removal

**Steps:**
1. Open widget with hash parameter: `#pin=123`
2. Switch to "Add to Selection" mode
3. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-HASH]` - `removeHashParameter` (old implementation)
- `[QUERYSIMPLE-HASH]` - `removeHashParameter` (new implementation)
- Hash should be removed from URL

**What to Verify:**
- ✅ Hash parameter is removed from URL when switching to accumulation mode
- ✅ Both implementations remove the hash
- ✅ URL is clean after removal

#### Test 5: Mode Reset on Hash Detection

**Steps:**
1. Switch to "Add to Selection" mode
2. Add some records
3. Navigate to URL with hash parameter: `#pin=123`
4. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-HASH]` - `mode-reset-needed-on-hash-detection` (both implementations)
- `[QUERYSIMPLE-CHUNK-1-COMPARE]` - `mode-reset-comparison` with both detecting reset

**What to Verify:**
- ✅ Mode resets to "New Selection" when hash parameter detected
- ✅ Accumulated records are cleared
- ✅ Both implementations detect mode reset need
- ✅ Comparison logs show agreement

#### Test 6: Query Items Change (componentDidUpdate)

**Steps:**
1. Open widget
2. Change query configuration in builder (add/remove query items)
3. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-CHUNK-1-COMPARE]` - `url-param-detection-comparison-didUpdate`
- Both implementations should re-check URL parameters
- **NO** logs with `match: false`

**What to Verify:**
- ✅ Both implementations re-check when query items change
- ✅ Comparison logs show `match: true`
- ✅ No mismatches

### Success Criteria for Chunk 1

**Step 1.2 (Parallel Execution) Success:**
- ✅ All comparison logs show `match: true`
- ✅ **NO** logs with `match: false` or mismatch warnings
- ✅ Existing functionality unchanged (old code still handles state)
- ✅ Both implementations detect same parameters
- ✅ Both implementations agree on priority (hash > query)
- ✅ Both implementations remove hash parameters correctly
- ✅ Both implementations detect mode reset need

**If Mismatches Occur:**
1. **STOP** - Do not proceed to Step 1.3
2. Review `CHUNK-1-COMPARE` logs with `match: false`
3. Compare old vs new values in logs
4. Investigate root cause
5. Fix manager implementation
6. Re-test before proceeding

---

## Chunk 2: Widget Visibility Engine

### Debug Switches

**For Step 2.2 (Parallel Execution):**
```
?debug=CHUNK-2-COMPARE,WIDGET-STATE
```

### What to Test

#### Test 1: Panel Open Detection

**Steps:**
1. Close widget panel
2. Open widget panel
3. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-WIDGET-STATE]` - `panel-opened` (old implementation)
- `[QUERYSIMPLE-WIDGET-STATE]` - `panel-opened` (new implementation)
- `[QUERYSIMPLE-CHUNK-2-COMPARE]` with `match: true` for visibility state

**What to Verify:**
- ✅ Both implementations detect panel open
- ✅ Comparison logs show `match: true`
- ✅ Selection restores (if applicable)

#### Test 2: Panel Close Detection

**Steps:**
1. Open widget panel
2. Close widget panel
3. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-WIDGET-STATE]` - `panel-closed` (old implementation)
- `[QUERYSIMPLE-WIDGET-STATE]` - `panel-closed` (new implementation)
- `[QUERYSIMPLE-CHUNK-2-COMPARE]` with `match: true` for visibility state

**What to Verify:**
- ✅ Both implementations detect panel close
- ✅ Comparison logs show `match: true`
- ✅ Selection clears (if applicable)

#### Test 3: HelperSimple Notification

**Steps:**
1. Open/close widget panel multiple times
2. Check browser console for logs

**Expected Logs:**
- Custom events dispatched: `querysimple-widget-state-changed`
- Both implementations should dispatch events

**What to Verify:**
- ✅ HelperSimple receives widget state changes
- ✅ Events dispatched correctly

### Success Criteria for Chunk 2

- ✅ All comparison logs show `match: true`
- ✅ **NO** logs with `match: false`
- ✅ Panel open/close detection works correctly
- ✅ HelperSimple notifications work correctly

---

## Chunk 4: Graphics Layer Management

**Status:** ✅ **COMPLETE** (r018.25)

### Debug Switches

**For Production Testing:**
```
?debug=GRAPHICS-LAYER
```

**Why:** 
- `GRAPHICS-LAYER` shows graphics layer initialization and cleanup logs from the manager implementation
- Comparison logs (`CHUNK-4-COMPARE`) were removed after verification (r018.25)

**Note:** Chunk 4 migration is complete. The old `initializeGraphicsLayer()` and `cleanupGraphicsLayer()` methods have been removed and replaced with `GraphicsLayerManager`. The non-graphics layer implementation has been removed entirely - graphics layer is now required when map widget is configured.

### What to Test

**Note:** These tests were used during migration (r018.20-r018.24) to verify correctness. Chunk 4 is now complete and using only the manager implementation.

#### Test 1: Graphics Layer Initialization

**Steps:**
1. Open widget with map widget configured
2. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-GRAPHICS-LAYER]` - `createOrGetGraphicsLayer-created`
- `[QUERYSIMPLE-GRAPHICS-LAYER]` - `initializeGraphicsLayer-success`

**What to Verify:**
- ✅ Graphics layer is created when map view is available
- ✅ Graphics layer ID is set correctly
- ✅ Graphics layer is added to map view

#### Test 2: Graphics Layer Cleanup

**Steps:**
1. Open widget with graphics layer initialized
2. Close widget panel or unmount widget
3. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-GRAPHICS-LAYER]` - `cleanupGraphicsLayer-complete`

**What to Verify:**
- ✅ Graphics layer is removed from map view on cleanup
- ✅ Graphics layer reference is cleared

#### Test 3: Initialize from Output Data Source

**Steps:**
1. Execute a query that returns results
2. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-GRAPHICS-LAYER]` - Graphics layer initialization logs

**What to Verify:**
- ✅ Graphics layer initializes correctly when output data source is created
- ✅ Graphics layer is ready for highlighting

### Success Criteria for Chunk 4

**Step 4.2 (Parallel Execution) Success:**
- ✅ All comparison logs showed `match: true`
- ✅ **NO** logs with `match: false` or mismatch warnings
- ✅ Both implementations initialized graphics layer identically
- ✅ Both implementations cleaned up graphics layer identically

**Step 4.3 (Switch to Manager) Success:**
- ✅ Graphics layer management works correctly
- ✅ All old code removed
- ✅ Non-graphics layer implementation removed
- ✅ Config change handling removed

**If Mismatches Occur:**
1. **STOP** - Do not proceed to Step 4.3
2. Review `CHUNK-4-COMPARE` logs with `match: false`
3. Compare old vs new values in logs
4. Investigate root cause
5. Fix manager implementation
6. Re-test before proceeding

---

## Chunk 5: Accumulated Records Management

**Status:** ✅ **COMPLETE** (r018.58)

### Debug Switches

**For Production Testing:**
```
?debug=RESULTS-MODE,FORM
```

**Individual Switches:**
- **`RESULTS-MODE`** - Results mode state change logs (permanent)
- **`FORM`** - Form value setting logs (for hash parameter testing)

**Note:** Chunk 5 migration is complete. The old implementation has been removed and replaced with `AccumulatedRecordsManager`. Comparison logs (`CHUNK-5-COMPARE`) were removed after verification (r018.58).

### What to Test

#### Test 1: Accumulated Records Mode Changes

**Steps:**
1. Execute a query in "New Selection" mode
2. Switch to "Add to Selection" mode
3. Execute another query
4. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-RESULTS-MODE]` - `handleResultsModeChange-triggered`

**What to Verify:**
- ✅ Mode change detected correctly
- ✅ Accumulated records update correctly
- ✅ State synchronized with manager

#### Test 2: Accumulated Records Changes

**Steps:**
1. Execute queries in "Add to Selection" mode
2. Add multiple sets of records
3. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-RESULTS-MODE]` - `handleAccumulatedRecordsChange-triggered`

**What to Verify:**
- ✅ Accumulated records tracked correctly
- ✅ Records accumulate correctly
- ✅ State synchronized with manager

#### Test 3: Hash Parameter Processing (Recent Fixes)

**Steps:**
1. Navigate to URL with hash: `#pin=2223059013`
2. Verify query executes
3. Switch to different query (e.g., "major")
4. Switch back to original query ("pin")
5. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-HASH-EXEC]` - `querysimple-handleopenwidgetevent-called`
- `[QUERYSIMPLE-HASH-EXEC]` - `querysimple-oninitialvaluefound-called`
- `[QUERYSIMPLE-FORM]` - `hash-value-setting-start`
- `[QUERYSIMPLE-HASH-EXEC]` - `querysimple-handlehashparameterused-state-cleared`
- When switching back: `[QUERYSIMPLE-HASH-EXEC]` - `querysimple-oninitialvaluefound-already-processed` OR no re-execution

**What to Verify:**
- ✅ Hash query executes on initial load
- ✅ Hash does NOT re-execute when switching queries
- ✅ Input value persists as visual record after execution
- ✅ State is cleared atomically after execution

#### Test 4: Input Value Persistence (Recent Fix)

**Steps:**
1. Execute a hash query (e.g., `#pin=2223059013`)
2. Return to Query tab
3. Verify input field still shows value
4. Execute a user-entered query
5. Return to Query tab
6. Verify input field still shows value

**Expected Behavior:**
- ✅ Input value persists after hash query execution
- ✅ Input value persists after user-entered query execution
- ✅ Value only cleared by: Reset button, query switch, or manual clearing

**Expected Logs:**
- `[QUERYSIMPLE-FORM]` - `sqlExprObj-skipped-ref-update` with `reason: 'value-already-set-preserving-as-visual-record'`

#### Test 5: Remove Mode Reset (Recent Fix)

**Steps:**
1. Add some records using "Add to Selection" mode
2. Switch to "Remove from Selection" mode
3. Remove a few records manually
4. Clear all results (trash can button)
5. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-RESULTS-MODE]` - `handleAccumulatedRecordsChange-triggered` with `newCount: 0`
- `[QUERYSIMPLE-RESULTS-MODE]` - `mode-reset-on-accumulated-records-cleared`
- Mode should reset to "New Selection"

**What to Verify:**
- ✅ Remove button is disabled when no records (UI working)
- ✅ Mode resets to "New Selection" when all records cleared
- ✅ Mode state reflects current capability

### Success Criteria for Chunk 5

- ✅ Accumulated records accumulate correctly
- ✅ Accumulated records remove correctly
- ✅ Hash parameters don't re-execute when switching queries
- ✅ Input values persist as visual records
- ✅ Remove mode resets when all records cleared
- ✅ Mode state reflects current capability
- ✅ Manager implementation handles all state changes correctly

### Recent Fixes Verified

- ✅ **Hash Re-execution Prevention (r018.43-r018.53):** Hash parameters don't re-execute when switching queries
- ✅ **Input Value Persistence (r018.54-r018.55):** Input values persist after execution as visual records
- ✅ **Remove Mode Reset (r018.56):** Mode resets to NewSelection when all records cleared
- ✅ **Hash Tab Active Fix (r018.39):** Hash queries execute correctly regardless of active tab

---

## Chunk 6: Map View Management

### Debug Switches

**For Step 6.2 (Parallel Execution):**
```
?debug=CHUNK-6-COMPARE,MAP-EXTENT,GRAPHICS-LAYER
```

### When Map View Changes Occur

**Map view state changes are relatively infrequent:**
- **On Widget Mount**: When widget first loads and `JimuMapViewComponent` provides the map view (most common - happens once per widget load)
- **On Map Widget Change**: If multiple map widgets are configured and user switches between them (rare)
- **On View Change**: If the map's active view changes (very rare)

**Note:** Unlike visibility (Chunk 2) which changes frequently, map view changes are typically a **one-time event** when the widget loads. You'll see comparison logs **once** when you first open the widget.

### What to Test

#### Test 1: Initial Map View Detection (Most Common - Primary Test)

**Steps:**
1. Open Experience Builder app with QuerySimple widget configured
2. Ensure graphics layer highlighting is enabled and map widget is configured
3. Open QuerySimple widget panel
4. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-GRAPHICS-LAYER]` - `handleJimuMapViewChanged` (old implementation)
- `[QUERYSIMPLE-MAP-EXTENT]` - `handleJimuMapViewChanged` (new implementation)
- `[QUERYSIMPLE-CHUNK-6-COMPARE]` - `old-implementation-map-view-change`
- `[QUERYSIMPLE-CHUNK-6-COMPARE]` - `new-implementation-map-view-change`
- `[QUERYSIMPLE-CHUNK-6-COMPARE]` - `map-view-change-comparison` with `match: true`, `jimuMapViewMatch: true`, `mapViewMatch: true`
- `[QUERYSIMPLE-GRAPHICS-LAYER]` - Graphics layer initialization (if enabled)

**What to Verify:**
- ✅ Both implementations detect map view
- ✅ Comparison logs show `jimuMapViewMatch: true` and `mapViewMatch: true`
- ✅ `mapViewRef.current` is set correctly
- ✅ Graphics layer initializes (if enabled)
- ✅ **NO** `CHUNK-6-MISMATCH` logs

#### Test 2: Graphics Layer Disabled (Secondary Test)

**Steps:**
1. Disable graphics layer highlighting in widget config
2. Open QuerySimple widget panel
3. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-CHUNK-6-COMPARE]` logs still appear
- Comparison logs show `match: true`
- **NO** graphics layer initialization logs

**What to Verify:**
- ✅ Map view management works even when graphics layer is disabled
- ✅ Comparison logs show `match: true`
- ✅ `mapViewRef.current` is still set correctly (needed for zoom)

#### Test 3: Map View Available Before Widget Opens (Edge Case)

**Steps:**
1. Open Experience Builder app (map view loads)
2. Wait a few seconds for map to fully load
3. Open QuerySimple widget panel
4. Check browser console for logs

**Expected Logs:**
- Same as Test 1, but map view may already be available when widget opens

**What to Verify:**
- ✅ Both implementations handle already-available map view
- ✅ Comparison logs show `match: true`
- ✅ No timing issues

### Success Criteria for Chunk 6

- ✅ Both implementations detect map view correctly
- ✅ Comparison logs show `jimuMapViewMatch: true` and `mapViewMatch: true`
- ✅ `mapViewRef.current` is set correctly in both implementations
- ✅ Graphics layer initializes correctly (if enabled)
- ✅ **NO** logs with `match: false`
- ✅ **NO** `CHUNK-6-MISMATCH` logs

### Testing Tips

**Since map view changes are infrequent:**
- **Primary Test**: Widget mount/initial load (Test 1) - this is the most common scenario
- **Secondary Test**: Graphics layer disabled (Test 2) - verifies mapViewRef is set even without graphics layer
- **Edge Case**: Map view available before widget opens (Test 3) - verifies timing handling

**What to Watch For:**
- Comparison logs should appear **once** when widget first loads (or when map view changes)
- If you see multiple comparison logs, that's fine (map view changed multiple times)
- The key is that **every** comparison log shows `match: true`
- Unlike Chunk 2 (visibility), you won't see frequent comparison logs - map view is stable

---

## Chunk 7: Event Handling

### Debug Switches

```
?debug=CHUNK-7-COMPARE
```

### What to Test

- Event listeners set up correctly
- Event listeners cleaned up correctly
- Custom events dispatched correctly

---

## Chunk 3: Selection & Restoration (Sectioned Approach)

**Status:** 🏗️ **IN PROGRESS** - Section 3.1 Complete (r019.8)

**Strategy:** Breaking Chunk 3 into 3 sections, completing each fully (tests, implementation, cleanup) before proceeding:
- ✅ **Section 3.1:** Selection State Tracking (r019.8) - COMPLETE
- 🔜 **Section 3.2:** Panel Open/Close Restoration - Pending
- 🔜 **Section 3.3:** Map Identify Restoration - Pending

### Section 3.1: Selection State Tracking ✅ **COMPLETE** (r019.8)

**Implementation:** `SelectionRestorationManager.handleSelectionChange()`  
**Test File:** `tests/e2e/query-simple/selection-restoration.spec.ts`  
**E2E Tests:** 6/6 passing (2.0 minutes)

**Debug Switches:**
```
?debug=RESTORE
```

**Note:** `CHUNK-3-COMPARE` debug feature was removed in r019.8 after verification complete.

### What to Test

#### Test 1: Selection with Graphics Layer Enabled

**Steps:**
1. Enable graphics layer highlighting in config
2. Execute a query
3. Click "Add to Map" action
4. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-CHUNK-3-DECISION]` - Every decision point in selection logic
- `[QUERYSIMPLE-CHUNK-3-FALLBACK]` - Fallback logic execution (if needed)
- `[QUERYSIMPLE-CHUNK-3-COMPARE]` - Comparison between old/new selection results
- **NO** logs with `match: false`

**What to Verify:**
- ✅ Records select in data source (not just graphics layer)
- ✅ Graphics layer highlights appear
- ✅ Both implementations produce same selection
- ✅ Comparison logs show `match: true`
- ✅ Fallback logic executes if `r.getDataSource()` returns null

#### Test 2: Selection Restoration on Panel Open

**Steps:**
1. Execute query and select records
2. Close widget panel
3. Open widget panel
4. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-CHUNK-3-DECISION]` - Restoration decision points
- `[QUERYSIMPLE-CHUNK-3-COMPARE]` - Comparison of restoration results
- `[QUERYSIMPLE-RESTORE]` - Restoration execution logs

**What to Verify:**
- ✅ Selection restores on panel open
- ✅ Both implementations restore same selection
- ✅ Comparison logs show `match: true`

#### Test 3: Selection Clear on Panel Close

**Steps:**
1. Execute query and select records
2. Close widget panel
3. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-CHUNK-3-DECISION]` - Clear decision points
- `[QUERYSIMPLE-CHUNK-3-COMPARE]` - Comparison of clear results

**What to Verify:**
- ✅ Selection clears on panel close
- ✅ Both implementations clear same selection
- ✅ Comparison logs show `match: true`

#### Test 4: Identify Popup Restoration

**Steps:**
1. Execute query and select records
2. Use map identify tool
3. Close identify popup
4. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-CHUNK-3-DECISION]` - Identify popup restoration decision
- `[QUERYSIMPLE-RESTORE]` - Restoration execution logs

**What to Verify:**
- ✅ Selection restores after identify popup closes
- ✅ Both implementations restore correctly

### Success Criteria for Chunk 3

**CRITICAL - Must Pass All:**
- ✅ Records select in data source (not just graphics layer)
- ✅ "Add to Map" action selects records
- ✅ Selection restores on panel open
- ✅ Selection clears on panel close
- ✅ Identify popup restoration works
- ✅ All comparison logs show `match: true`
- ✅ **NO** logs with `match: false`

---

## General Testing Principles

### For Each Step

1. **Enable Appropriate Debug Switches** - Use the switches listed for each chunk
2. **Watch Comparison Logs** - Look for `CHUNK-X-COMPARE` logs
3. **Watch for Mismatches** - **STOP** if you see logs with `match: false`
4. **Verify Functionality** - Ensure existing functionality still works
5. **Test Edge Cases** - Test boundary conditions and error scenarios

### Comparison Log Interpretation

**Good Signs:**
- `match: true` in comparison logs
- No logs with `match: false`
- Both implementations produce identical results

**Bad Signs:**
- `match: false` in comparison logs
- Warning messages about mismatches
- Different results between implementations

### When to Proceed

**Only proceed to next step when:**
- ✅ All comparison logs show `match: true`
- ✅ **NO** logs with `match: false` appear
- ✅ All test scenarios pass
- ✅ Existing functionality unchanged
- ✅ You've verified via logging (don't assume)

---

## Quick Reference: Debug Switches by Chunk

| Chunk | Step | Debug Switches | Key Logs to Watch |
|-------|------|----------------|-------------------|
| Chunk 1 | 1.2 | `?debug=CHUNK-1-COMPARE,HASH` | `CHUNK-1-COMPARE` with `match: true/false` |
| Chunk 2 | 2.2 | `?debug=CHUNK-2-COMPARE,WIDGET-STATE` | `CHUNK-2-COMPARE` with `match: true/false` |
| Chunk 3 | 3.6 | `?debug=CHUNK-3-COMPARE,CHUNK-3-DECISION,CHUNK-3-FALLBACK,SELECTION,RESTORE` | `CHUNK-3-COMPARE`, `CHUNK-3-DECISION`, `CHUNK-3-FALLBACK` |
| Chunk 4 | 4.2 | `?debug=CHUNK-4-COMPARE,GRAPHICS-LAYER` | `CHUNK-4-COMPARE` |
| Chunk 5 | 5.2 | `?debug=CHUNK-5-COMPARE,RESULTS-MODE` | `CHUNK-5-COMPARE` |
| Chunk 6 | 6.2 | `?debug=CHUNK-6-COMPARE,MAP-EXTENT,ZOOM` | `CHUNK-6-COMPARE` |
| Chunk 7 | 7.2 | `?debug=CHUNK-7-COMPARE` | `CHUNK-7-COMPARE` |

---

## Cleanup After Migration

**After all chunks are complete:**
1. Remove temporary debug features from `debug-logger.ts`
2. Remove comparison logging code from widget files
3. Remove temporary debug switches from this guide
4. Keep only essential permanent logging

---

**End of Testing Guide**

