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

- **`CHUNK-1-COMPARE`** - Chunk 1 (URL Parameter) comparison logs
- **`CHUNK-2-COMPARE`** - Chunk 2 (Visibility) comparison logs
- **`CHUNK-3-COMPARE`** - Chunk 3 (Selection/Restoration) comparison logs
- **`CHUNK-3-DECISION`** - Chunk 3 decision point logs
- **`CHUNK-3-FALLBACK`** - Chunk 3 fallback logic logs
- **`CHUNK-4-COMPARE`** - Chunk 4 (Graphics Layer) comparison logs
- **`CHUNK-5-COMPARE`** - Chunk 5 (Accumulated Records) comparison logs
- **`CHUNK-6-COMPARE`** - Chunk 6 (Map View) comparison logs
- **`CHUNK-7-COMPARE`** - Chunk 7 (Events) comparison logs

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

### Debug Switches

**For Step 1.2 (Parallel Execution):**
```
?debug=CHUNK-1-COMPARE,HASH
```

**Why:** 
- `CHUNK-1-COMPARE` shows comparison logs between old/new implementations
- `HASH` shows hash parameter processing logs from both implementations

### What to Test

#### Test 1: Hash Parameter Detection (`#shortId=value`)

**Steps:**
1. Open widget with hash parameter: `#pin=123` (or your configured shortId)
2. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-HASH]` - `url-param-check` (old implementation)
- `[QUERYSIMPLE-HASH]` - `url-param-detected` (old implementation)
- `[QUERYSIMPLE-HASH]` - `url-param-detected` (new implementation)
- `[QUERYSIMPLE-CHUNK-1-COMPARE]` - `url-param-detection-comparison` with `match: true`
- **NO** logs with `match: false` or `warning: 'IMPLEMENTATIONS DO NOT MATCH'`

**What to Verify:**
- ✅ Widget opens automatically
- ✅ Correct query is selected
- ✅ Input field is populated with value
- ✅ Query executes automatically
- ✅ Both implementations detect the same parameter
- ✅ Comparison logs show `match: true`

#### Test 2: Query String Parameter Detection (`?shortId=value`)

**Steps:**
1. Open widget with query string: `?pin=123` (or your configured shortId)
2. Check browser console for logs

**Expected Logs:**
- `[QUERYSIMPLE-HASH]` - `url-param-detected` with `foundIn: 'query'` (both implementations)
- `[QUERYSIMPLE-CHUNK-1-COMPARE]` - `url-param-detection-comparison` with `match: true`
- **NO** logs with `match: false`

**What to Verify:**
- ✅ Widget opens and executes query
- ✅ Both implementations agree
- ✅ Comparison logs show `match: true`

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

## Chunk 3: Selection & Restoration ⚠️ **CRITICAL**

### Debug Switches

**For Step 3.6 (Parallel Execution):**
```
?debug=CHUNK-3-COMPARE,CHUNK-3-DECISION,CHUNK-3-FALLBACK,SELECTION,RESTORE,GRAPHICS-LAYER
```

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
- ✅ Fallback logic works for records without `getDataSource()`

**If Any Test Fails:**
1. **STOP IMMEDIATELY** - Do not proceed
2. Review all `CHUNK-3-DECISION` logs
3. Review all `CHUNK-3-FALLBACK` logs
4. Review `CHUNK-3-COMPARE` logs with `match: false`
5. Investigate root cause
6. Fix manager implementation
7. Re-test thoroughly before proceeding

---

## Chunk 4: Graphics Layer Management

### Debug Switches

```
?debug=CHUNK-4-COMPARE,GRAPHICS-LAYER
```

### What to Test

- Graphics layer initialization when map view available
- Graphics layer cleanup on unmount
- Graphics layer cleanup when disabled in config

---

## Chunk 5: Accumulated Records Management

### Debug Switches

```
?debug=CHUNK-5-COMPARE,RESULTS-MODE
```

### What to Test

- Records accumulate correctly in "Add to Selection" mode
- Records remove correctly in "Remove from Selection" mode
- Mode reset clears accumulated records
- Accumulated records persist when switching queries

---

## Chunk 6: Map View Management

### Debug Switches

```
?debug=CHUNK-6-COMPARE,MAP-EXTENT,ZOOM
```

### What to Test

- Map view ref updates correctly
- View change handlers work correctly
- Zoom functionality works correctly

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

