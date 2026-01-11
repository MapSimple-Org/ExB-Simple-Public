# Known Bugs

**Last Updated:** 2026-01-08 (Release 018.110)

---

## Bug Categories

- **HASH-PARAM**: Hash parameter processing issues
- **GRAPHICS**: Graphics layer and highlighting issues
- **SELECTION**: Selection and restoration issues
- **QUERY-EXEC**: Query execution and timing issues

---

## Open Bugs

### HASH-PARAM-004: Intermittent First-Load Hash Execution Failure ✅ **RESOLVED** (r018.110)

**Status:** ✅ **RESOLVED**  
**Severity:** High  
**Category:** HASH-PARAM, QUERY-EXEC  
**First Reported:** 2026-01-08  
**Resolved:** 2026-01-08 (r018.110)

**Description:**
Hash parameters would intermittently populate the form on first page load but fail to execute. The query would not run, no spinner appeared, and the Apply button remained disabled. This was a race condition where the hash value was set before all required conditions for execution were met.

**Root Cause:**
The hash value setting logic waited for `datasourceReady` and `sqlExprObj` to be ready, but not for `outputDS`. When the useEffect ran:
1. `datasourceReady` became `true` first
2. `outputDS` was still `null/undefined`
3. Hash value was set in the form
4. `hashTriggeredRef` was set to `true`
5. SqlExpressionRuntime converted string → array
6. Execution check failed because `outputDS` was `null`
7. No error shown - query silently failed to execute

Additionally, the useEffect did not have `outputDS` in its dependency array, so even when `outputDS` became available later, the effect wouldn't re-run to set the hash value.

**Technical Details:**
- `shouldSetValue` condition at line ~353 checked: `datasourceReady && initialInputValue && sqlExprObj?.parts?.length > 0`
- Missing `outputDS` check, but execution required: `hashTriggeredRef && datasourceReady && outputDS` (line ~1006)
- useEffect dependency array at line ~650 did not include `outputDS`
- Race condition window: ~300-500ms between `datasourceReady=true` and `outputDS` becoming available

**Expected Behavior:**
- Hash parameters should only be set when ALL execution conditions are ready
- If conditions aren't met, useEffect should re-run when missing conditions become available
- Hash queries should execute reliably on first page load

**Solution:**
1. **r018.109:** Added `outputDS` check to `shouldSetValue` condition:
   ```typescript
   const shouldSetValue = datasourceReady && 
                         outputDS &&  // ADDED
                         initialInputValue && 
                         sqlExprObj?.parts?.length > 0 &&
                         (initialValueSetRef.current !== configId || valueChanged)
   ```

2. **r018.110:** Added `outputDS` to useEffect dependency array:
   ```typescript
   }, [sqlExprObj, initialInputValue, datasourceReady, outputDS, ...])
   ```

Now the hash value is only set when all three required conditions exist, and the effect re-runs when `outputDS` becomes available.

**Files Modified:**
- `query-simple/src/runtime/query-task-form.tsx` (r018.109, r018.110)
  - Added `outputDS` check to `shouldSetValue` condition
  - Added `outputDS` to useEffect dependency array
  - Updated diagnostic logging to include `hasOutputDS`

**Related Bugs:**
- HASH-PARAM-001: Hash queries not executing when Query tab not active (different root cause)
- HASH-PARAM-002: Hash parameters re-executing when switching queries (different root cause)

**Investigation Tools:**
- Added `HASH-FIRST-LOAD` debug tag (r018.105) with comprehensive logging:
  - Condition state tracking in `query-task-list.tsx`
  - Execution path tracking in `query-task-form.tsx`
  - Decision point logging showing which conditions were met/failed
  
**Target Resolution:** r018.110 ✅ **RESOLVED**

---

### HASH-PARAM-005: Hash Parameters Not Re-Executing ✅ **RESOLVED** (r018.102)

**Status:** ✅ **RESOLVED**  
**Severity:** Medium  
**Category:** HASH-PARAM  
**First Reported:** 2026-01-08  
**Resolved:** 2026-01-08 (r018.102)

**Description:**
When loading a page with a hash parameter (e.g., `pin=2223059013`), the query would execute successfully. However, if the hash was changed (e.g., to `major=222306`) and then changed back to the original (`pin=2223059013`), the query would not re-execute. The widget would open, populate the value, but never submit the query.

**Root Cause:**
Redundant hash tracking in multiple locations:
1. **HelperSimple**: `lastExecutedHash` stored the entire hash string and blocked re-execution
2. **QuerySimple UrlConsumptionManager**: `lastProcessedHash` stored the entire hash string
3. **QuerySimple widget.tsx**: `processedHashParamsRef` Set stored all `shortId:value` combinations

When the same hash parameter was used again, all three blockers prevented re-execution.

**Technical Details:**
- HelperSimple's `lastExecutedHash` compared full hash strings (lines 340-359 in helper-simple/widget.tsx)
- UrlConsumptionManager's `lastProcessedHash` compared full hash strings
- widget.tsx's `processedHashParamsRef` tracked `shortId:value` in a Set and never cleared
- All three checks had to pass for a query to execute

**Expected Behavior:**
- Hash parameters should re-execute when user navigates away and back
- Previous execution should not block future execution of the same query
- System should allow re-running the same search with the same parameters

**Solution:**
1. **r018.98:** Added `HASH-EXEC` debug feature to HelperSimple's logger
2. **r018.99-100:** Added `HASH-EXEC` logging to UrlConsumptionManager and QuerySimple's logger
3. **r018.101:** Modified UrlConsumptionManager to track only `shortId=value` portion of hash (not entire hash)
4. **r018.102:** Removed `processedHashParamsRef` and all associated blocking logic from widget.tsx

**Files Modified:**
- `helper-simple/src/runtime/widget.tsx` (r018.98)
- `query-simple/src/runtime/hooks/use-url-consumption.ts` (r018.99, r018.101)
- `query-simple/src/runtime/widget.tsx` (r018.102)
- `shared-code/common/debug-logger.ts` (r018.98, r018.100)

**Investigation Notes:**
- Required enabling `HASH-EXEC` logging in both widgets to identify all blocking checks
- Issue was caused by over-aggressive caching/memoization
- Solution removes unnecessary redundant tracking while keeping HelperSimple's tracking for UX purposes

**Target Resolution:** r018.102 ✅ **RESOLVED**

---

### HASH-PARAM-001: Hash Queries Not Executing When Query Tab Not Active ✅ **RESOLVED** (r018.39)

**Status:** ✅ **RESOLVED**  
**Severity:** Medium  
**Category:** HASH-PARAM  
**First Reported:** 2026-01-06  
**Resolved:** 2026-01-06 (r018.39)

**Description:**
When a hash parameter changes while the Results tab is active, the query does not execute. The hash value is set in React state, but `SqlExpressionRuntime` does not fire `onChange` because the input element is not visible/focused when the Query tab is inactive.

**Root Cause:**
The DOM manipulation that triggers `SqlExpressionRuntime`'s `onChange` only works when the Query tab is active and the input element is visible. When the Results tab is active, the input is hidden, so the simulated events don't trigger `SqlExpressionRuntime` to process the value conversion.

**Solution:**
Ensure the Query tab is active before setting hash values. When a hash value needs to be set:
1. Check if `activeTab !== 'query'`
2. If not active, switch to Query tab via `onTabChange('query')`
3. Return early - the `useEffect` will re-run when `activeTab` becomes `'query'`
4. Set the hash value with `SqlExpressionRuntime` visible and ready to process it

**Files Modified:**
- `query-simple/src/runtime/query-task-form.tsx` - Added tab check before setting hash value
- `query-simple/src/runtime/query-task.tsx` - Pass `activeTab` and `onTabChange` props to `QueryTaskForm`

**Workaround:**
None needed - fix ensures Query tab is active before processing hash values.

**Target Resolution:** r018.39 ✅ **RESOLVED**

---

### BUG-GRAPHICS-001: Zoom Operations Fail When Graphics Layer Disabled

**Status:** ⚠️ **DEFERRED** (r019.0)  
**Severity:** Medium  
**Category:** GRAPHICS  
**First Reported:** 2026-01-05  
**Target Resolution:** r019.0

**Description:**
Zoom operations (Zoom to Selection, Zoom to Selected in panel, hash-triggered zoom) fail when `useGraphicsLayerForHighlight` is disabled because `mapView` is not available in those contexts.

**Root Cause:**
When `useGraphicsLayerForHighlight` is `false`, the widget does not initialize a graphics layer and does not maintain a `mapView` reference. Zoom operations require `mapView` to function.

**Workaround:**
Enable `useGraphicsLayerForHighlight` in widget configuration. Graphics layer is now required (breaking change in r018.25).

**Target Resolution:** r019.0 (Graphics layer is now required, so this bug will be resolved when non-graphics layer implementation is fully removed)

---

### HASH-PARAM-002: Hash Parameters Re-Execute When Switching Queries ✅ **RESOLVED** (r018.53)

**Status:** ✅ **RESOLVED**  
**Severity:** High  
**Category:** HASH-PARAM  
**First Reported:** 2026-01-06  
**Resolved:** 2026-01-07 (r018.53)  
**Introduced:** Likely r018.8 (Chunk 1: URL Parameter Consumption Manager)

**Description:**
When switching between queries (e.g., from "major" query to "parcel" query), if there is a hash parameter in the URL from a previously executed query, that hash value re-pops into the form and re-executes the query. This should only happen when a new hash parameter is entered by a human, not when switching queries.

**Root Cause:**
Multi-part issue requiring iterative fixes:
1. **Part 1 (r018.43):** `shouldUseInitialQueryValueForSelectionRef` was implemented as a React ref instead of state. When `handleHashParameterUsed` sets the ref's `.current` value to `false`, React doesn't trigger a re-render because refs don't cause re-renders. This means `query-task-list.tsx` never sees the flag change from `true` to `false`.
2. **Part 2 (r018.46):** `onHashParameterUsed` callback was never being called after hash queries executed successfully, so `handleHashParameterUsed` never ran, and the flag never cleared.
3. **Part 3 (r018.47):** When `onHashParameterUsed` was added in r018.46, it was called too early (before `setResultCount` and `setStage(1)`), causing the parent re-render to interrupt the promise chain, preventing zoom and results display.
4. **Part 4 (r018.52):** `shouldUseInitialQueryValueForSelection` and `initialQueryValue` were not being cleared atomically, and `queryItemShortId` was undefined, preventing `onHashParameterUsed` from being called.
5. **Part 5 (r018.53):** Fixed `queryItemShortId` undefined issue by using `queryItem.shortId` instead.

**Technical Details:**
- `shouldUseInitialQueryValueForSelectionRef` was a `React.createRef<boolean>(false)` (fixed in r018.43)
- `onHashParameterUsed` was never called after successful hash query execution (fixed in r018.46)
- `onHashParameterUsed` was called before UI updates completed, causing re-render to interrupt promise chain (fixed in r018.47)
- Hash state was not cleared atomically, causing race conditions (fixed in r018.52)
- `queryItemShortId` variable was undefined, preventing callback from firing (fixed in r018.53)

**Expected Behavior:**
- Hash parameters should only trigger queries when explicitly entered by a human (via HelperSimple's `OPEN_WIDGET_EVENT`)
- Switching queries should not re-trigger hash parameters that were already executed
- `initialQueryValue` should be cleared after a query executes
- Hash queries should execute, zoom, and display results correctly

**Solution:**
1. **r018.43:** Convert `shouldUseInitialQueryValueForSelectionRef` from a React ref to a state variable
2. **r018.46:** Call `onHashParameterUsed` after successful hash query execution
3. **r018.47:** Move `onHashParameterUsed` call to AFTER `setResultCount`, `setStage(1)`, and zoom operations complete
4. **r018.52:** Clear both `shouldUseInitialQueryValueForSelection` and `initialQueryValue` atomically in single `setState` call
5. **r018.53:** Fix `queryItemShortId` undefined by using `queryItem.shortId` directly

**Files Modified:**
- `query-simple/src/runtime/widget.tsx` (r018.43, r018.52) - State management fixes
- `query-simple/src/runtime/query-task.tsx` (r018.46, r018.47, r018.53) - Callback timing and variable fixes
- `helper-simple/src/runtime/widget.tsx` (r018.51) - Added `lastExecutedHash` tracking

**Investigation Notes:**
- Issue required multiple iterative fixes due to complex state management and timing issues
- Each fix addressed a different aspect of the problem
- Final fix (r018.53) resolved the undefined variable issue that prevented state clearing

**Target Resolution:** r018.53 ✅ **RESOLVED**

---

### HASH-PARAM-003: Input Value Cleared After Query Execution ✅ **RESOLVED** (r018.55)

**Status:** ✅ **RESOLVED**  
**Severity:** Medium  
**Category:** HASH-PARAM  
**First Reported:** 2026-01-07  
**Resolved:** 2026-01-07 (r018.55)

**Description:**
After a hash query or user-entered query executes, when returning to the Query tab, the input field value is cleared. The value should persist as a visual record of the search. It should only be cleared by: Reset button, query switch, or manual clearing.

**Root Cause:**
In `query-task-form.tsx`, when `sqlExprObj` prop changed, the condition `initialValueSetRef.current !== configId || !initialInputValue` would reset `attributeFilterSqlExprObj` to the base `sqlExprObj` when `initialInputValue` became `undefined` (after hash execution). This cleared user-entered values as well as hash values.

**Technical Details:**
- The `useEffect` watching `sqlExprObj` had condition: `if (initialValueSetRef.current !== configId || !initialInputValue)`
- When `initialInputValue` became `undefined` after execution, `!initialInputValue` became `true`
- This caused form to reset to base `sqlExprObj`, clearing the input value
- Affected both hash-triggered and user-entered queries

**Expected Behavior:**
- Input value should persist after query execution (visual record)
- Value should only be cleared by: Reset button, query switch (`configId` changes), or manual clearing
- Value should NOT be cleared when `initialInputValue` prop becomes `undefined`

**Solution:**
1. **r018.54:** Removed `|| !initialInputValue` condition - only update if `initialValueSetRef.current !== configId`
2. **r018.55:** Added `previousConfigIdRef` to track configId changes, check if value already set before updating
3. Only update `attributeFilterSqlExprObj` if:
   - No value is set yet (initializing), OR
   - `configId` changed (switching queries - reset to base)

**Files Modified:**
- `query-simple/src/runtime/query-task-form.tsx` (r018.54, r018.55)
  - Removed `|| !initialInputValue` condition from update check
  - Added `previousConfigIdRef` to track configId changes
  - Added check for existing value before updating

**Investigation Notes:**
- Initial fix (r018.54) only addressed hash values, but user-entered values were also being cleared
- Second fix (r018.55) added proper value preservation logic for both hash and user-entered values

**Target Resolution:** r018.55 ✅ **RESOLVED**

---

### RESULTS-MODE-001: Remove Mode Not Resetting When All Records Cleared ✅ **RESOLVED** (r018.56)

**Status:** ✅ **RESOLVED**  
**Severity:** Medium  
**Category:** RESULTS-MODE  
**First Reported:** 2026-01-07  
**Resolved:** 2026-01-07 (r018.56)

**Description:**
When in "Remove from" mode, if all accumulated records are cleared (either manually or via Clear Results button), the mode stays on "Remove" even though the Remove button is disabled. The mode should automatically reset to "New Selection" since Remove mode requires accumulated records to function.

**Root Cause:**
`handleAccumulatedRecordsChange` in `widget.tsx` updated accumulated records state but didn't check if the mode should reset when records are cleared in Remove mode. The mode reset logic existed in `handleSelectionChange` but wasn't triggered when accumulated records were cleared directly.

**Technical Details:**
- Remove mode requires accumulated records to function (nothing to remove if no records)
- When all records cleared, Remove button correctly disables (UI working)
- But mode state remained `RemoveFromSelection`, causing confusion
- Mode should reflect current capability - Remove mode is useless without records

**Expected Behavior:**
- When all accumulated records cleared in Remove mode, mode should reset to NewSelection
- Mode state should always reflect current functionality
- Remove button should be disabled when no records (already working)

**Solution:**
Added mode reset logic to `handleAccumulatedRecordsChange`:
1. Check if `records.length === 0` and `resultsMode === SelectionType.RemoveFromSelection`
2. If both true, reset mode to `NewSelection` atomically with records update
3. Added logging to track when mode reset occurs

**Files Modified:**
- `query-simple/src/runtime/widget.tsx` (r018.56)
  - Added mode reset check in `handleAccumulatedRecordsChange`
  - Reset mode to `NewSelection` when all records cleared in Remove mode
  - Added logging for mode reset events

**Investigation Notes:**
- Mode reset logic existed in `handleSelectionChange` but wasn't triggered for direct accumulated records clearing
- Fix ensures mode state always reflects current capability

**Target Resolution:** r018.56 ✅ **RESOLVED**

---

### GRAPHICS-002: Stale Graphics Persist When Switching Queries ✅ **RESOLVED** (r018.66)

**Status:** ✅ **RESOLVED**  
**Severity:** Medium  
**Category:** GRAPHICS  
**First Reported:** 2026-01-07  
**Resolved:** 2026-01-07 (r018.66)

**Description:**
When switching queries (e.g., from "Major" to "Parcel") in "Add to Selection" or "Remove from Selection" mode, previously removed records temporarily reappear in the graphics layer but not in the selection or results list. After closing and reopening the widget, the graphics disappear again.

**Root Cause:**
The graphics layer is shared across all queries for the same widget. When switching queries in accumulation modes, `handleOutputDataSourceCreated` re-selects accumulated records without first clearing the graphics layer. This causes:
1. Stale graphics from the previous query to persist in the shared graphics layer
2. New graphics to be added on top of stale graphics
3. Graphics for manually removed records to reappear because they're still in `accumulatedRecords` but not in the actual selection

**Technical Details:**
- Graphics layer is shared across queries (one layer per widget)
- When switching queries in accumulation modes, accumulated records are preserved
- `handleOutputDataSourceCreated` re-selects ALL accumulated records without clearing graphics first
- Stale graphics from previous query remain visible
- Graphics for removed records reappear because `accumulatedRecords` contains stale data

**Expected Behavior:**
- Graphics layer should be cleared when switching queries, even in accumulation modes
- Only valid, currently selected records should have graphics
- Graphics should match the selection state exactly

**Solution:**
Clear the graphics layer before re-selecting accumulated records when switching queries:
1. Check if graphics layer is enabled and callback is available
2. Call `onClearGraphicsLayer()` before re-selecting accumulated records
3. This ensures stale graphics from previous query are removed before new graphics are added

**Files Modified:**
- `query-simple/src/runtime/query-task.tsx` (r018.66)
  - Added graphics layer clearing before re-selecting accumulated records in `handleOutputDataSourceCreated`
  - Added logging to track graphics layer clearing on query switch
  - Updated dependency array to include `graphicsLayer` and `onClearGraphicsLayer`

**Investigation Notes:**
- Issue was specific to query switching in accumulation modes
- Graphics layer clearing was already happening in "New Selection" mode via `clearResult`
- Accumulation modes preserve records, so graphics clearing was skipped
- Fix ensures graphics layer is cleared even when preserving accumulated records

**Target Resolution:** r018.66 ✅ **RESOLVED**

---

## Resolved Bugs

### HASH-PARAM-003: Input Value Cleared After Query Execution ✅ **RESOLVED** (r018.55)
- **Resolved:** 2026-01-07
- **Fix:** 
  - r018.54: Removed `|| !initialInputValue` condition that caused form reset
  - r018.55: Added `previousConfigIdRef` to track configId changes, preserve existing values
- **Version:** r018.55
- **Root Cause:** Form was resetting to base `sqlExprObj` when `initialInputValue` became `undefined` after execution

### RESULTS-MODE-001: Remove Mode Not Resetting When All Records Cleared ✅ **RESOLVED** (r018.56)
- **Resolved:** 2026-01-07
- **Fix:** Added mode reset logic to `handleAccumulatedRecordsChange` - reset to NewSelection when all records cleared in Remove mode
- **Version:** r018.56
- **Root Cause:** Mode reset logic only existed in `handleSelectionChange`, not triggered for direct accumulated records clearing

### HASH-PARAM-002: Hash Parameters Re-Execute When Switching Queries ✅ **RESOLVED** (r018.53)
- **Resolved:** 2026-01-07
- **Fix:** 
  - r018.43: Convert `shouldUseInitialQueryValueForSelectionRef` from React ref to state variable
  - r018.46: Call `onHashParameterUsed` after successful hash query execution
  - r018.47: Move `onHashParameterUsed` call to after UI updates and zoom complete
  - r018.52: Clear hash state atomically in single `setState` call
  - r018.53: Fix `queryItemShortId` undefined by using `queryItem.shortId`
- **Version:** r018.53
- **Root Cause:** Multiple issues: React refs don't trigger re-renders, callback never called, callback called too early, state not cleared atomically, undefined variable

### GRAPHICS-002: Stale Graphics Persist When Switching Queries ✅ **RESOLVED** (r018.66)
- **Resolved:** 2026-01-07
- **Fix:** Clear graphics layer before re-selecting accumulated records when switching queries
- **Version:** r018.66
- **Root Cause:** Graphics layer not cleared when switching queries in accumulation modes, causing stale graphics to persist

### HASH-PARAM-001: Hash Queries Not Executing When Query Tab Not Active ✅ **RESOLVED** (r018.39)
- **Resolved:** 2026-01-06
- **Fix:** Ensure Query tab is active before setting hash values
- **Version:** r018.39
