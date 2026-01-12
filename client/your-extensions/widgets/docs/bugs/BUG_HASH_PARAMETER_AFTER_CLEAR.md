# Bug: Hash Parameter Query Returns Empty Records After Clearing Results

> **Note:** This bug investigation would make an excellent blog post once resolved. It demonstrates:
> - Deep debugging of ArcGIS Experience Builder data source lifecycle
> - Multiple attempted solutions with detailed analysis
> - Working with framework APIs vs. fighting against them
> - The importance of understanding asynchronous component creation patterns

## Status
**Status:** ✅ RESOLVED  
**Priority:** High  
**Date Reported:** 2025-12-06  
**Date Resolved:** 2025-12-06  
**Resolution:** 
1. Removed manual data source destruction effect - DataSourceComponent handles lifecycle automatically
2. Fixed race condition when hash parameter detected while on Results tab - added tab switch callback and manualTabSwitchRef flag

## Problem Description

When clearing query results and then changing hash parameter to trigger a different query item, the query executes but returns empty records even though count query succeeds (count = 1, records = 0). Manual query switching works fine - only hash-triggered queries after clearing have this issue.

### Reproduction Steps
1. Load page with no hash params
2. Enter hash `#major=222305` and submit (works fine)
3. Clear results (switches to Query tab)
4. Change hash to `#pin=2223059013`
5. Query executes, count = 1, but records = 0
6. Tab doesn't switch, nothing displays, no features selected

### Symptoms
- `query-count-received`: count = 1 ✓
- `query-records-received`: recordsCount = 0 ✗
- `featureDSStatus: "NOT_READY"` when `load()` is called
- `recordsRef.current.length = 0` (empty array)
- Auto-switch fails because `hasRecords: false`

### Key Difference
- **Manual query switching:** Works fine
- **Hash-triggered after clearing:** Fails
- **Hash-triggered without clearing:** Works fine

## Root Cause Analysis

### What We Know
1. When switching query items via hash parameters after clearing results, a new data source is created asynchronously by `DataSourceComponent`
2. The data source exists in state but is `NOT_READY` when the query executes
3. When `load()` is called with `NOT_READY` status, it returns 0 records even though count query succeeded
4. The data source stays `NOT_READY` for an extended period (doesn't transition to ready state)

### Timing Issue
From logs:
- `00:33:51.120Z` - `outputDS-created` for pin query item
- `00:33:51.832Z` - `handleFormSubmit-called` - data source exists but is `NOT_READY`
- `00:33:51.848Z` - Status set to `UNLOADED`
- `00:33:51.861Z` - `outputDS-created` AGAIN - new data source created after query started
- `00:33:52.145Z` - `load()` called, status still `NOT_READY`, returns 0 records

The data source is being recreated after we've already started the query execution, resetting it back to `NOT_READY`.

## Attempted Solutions

### Solution 1: Reset manualTabSwitchRef
**Approach:** Reset `manualTabSwitchRef.current = false` in `clearResult()` to allow auto-switch after hash-triggered queries.

**Result:** ❌ Didn't fix - issue was not with tab switching, but with data source readiness.

### Solution 2: Always fetch from DataSourceManager
**Approach:** Always fetch data source from `DataSourceManager` instead of relying on state, and wait 300ms if not found.

**Result:** ❌ Didn't fix - data source exists but is `NOT_READY`.

### Solution 3: Wait for data source creation
**Approach:** Poll `DataSourceManager` for up to 3 seconds waiting for data source to be created before proceeding.

**Result:** ❌ Didn't fix - data source exists but is `NOT_READY` even after creation.

### Solution 4: Poll for NotReady status to change
**Approach:** Poll for up to 2 seconds waiting for status to change from `NOT_READY` before proceeding.

**Result:** ❌ Didn't fix - status stays `NOT_READY` even after polling.

### Solution 5: Wait before setting to Unloaded
**Approach:** Wait up to 5 seconds for data source to be ready before setting to `UNLOADED`, only set to `UNLOADED` if ready.

**Result:** ❌ Didn't fix - status never becomes ready, and introduced unacceptable UX delay (5+ seconds of waiting).

**UX Impact:** Users see 5+ second delay before query executes, which is unacceptable.

## Current State

All polling/delay techniques have been rolled back due to:
1. Not solving the problem
2. Poor UX (unacceptable delays)
3. Breaking first hash query execution

The code now uses the original approach without delays.

## Potential Root Causes (Hypotheses)

1. **Data Source Lifecycle Issue:** When clearing results, the old data source is set to `NOT_READY`. When switching query items, `DataSourceComponent` creates a new data source, but it starts as `NOT_READY` and never transitions to ready state in time.

2. **Race Condition:** The hash-triggered query executes before the data source finishes initializing. Setting it to `UNLOADED` while it's `NOT_READY` might trigger a recreation.

3. **Framework Behavior:** Experience Builder's `DataSourceComponent` might have specific requirements for when a data source can be used that we're not meeting.

4. **Status Management:** The data source status might need to be managed differently when switching query items vs. initial creation.

## Alternative Solutions to Investigate

### Option 1: Use DataSourceComponent query prop
**Approach:** According to [Esri documentation](https://developers.arcgis.com/experience-builder/guide/use-data-source-in-widget/), "If your widget must load data, pass in the `query` and `widgetId` props." Currently we're manually calling `load()` instead of using the `query` prop.

**Pros:** Framework-managed lifecycle, might handle status automatically  
**Cons:** For OUTPUT data sources, we might need manual control - need to test if `query` prop works for output data sources

**Reference:** Documentation states: "If the widget loads data, the recommended way is to use the `DataSourceComponent` like: `<DataSourceComponent useDataSource={} widgetId={} query={}>`"

### Option 2: Listen for Status Changes in onDataSourceInfoChange
**Approach:** The `onDataSourceInfoChange` callback fires when data source info changes. Currently we only check for filter changes. Maybe we should also check for status changes and wait for ready state.

**Pros:** Event-driven, no polling  
**Cons:** Need to understand what info is available in the callback

**Reference:** Documentation mentions: "If your widget needs to listen to the data source filter change, you can use `onQueryRequired` callback to update the data."

### Option 3: Pre-create Data Sources
**Approach:** Pre-create all query item data sources when widget mounts, so they're always ready.

**Pros:** No waiting, data sources always available  
**Cons:** Might have performance impact, need to manage lifecycle

### Option 4: Retry Query on Empty Results
**Approach:** If `load()` returns 0 records but count > 0, retry the query after a short delay.

**Pros:** Simple, handles transient issues  
**Cons:** Still has delay, might mask other issues

### Option 5: Don't Set to Unloaded
**Approach:** Don't set data source status to `UNLOADED` before query - let it handle its own state.

**Pros:** Avoids interfering with initialization  
**Cons:** Might break existing query logic

## Esri Documentation Findings

### Key Documentation Reference
[Use data source in widget](https://developers.arcgis.com/experience-builder/guide/use-data-source-in-widget/)

### Relevant Findings

1. **DataSourceComponent Usage:**
   - Documentation states: "If your widget must load data, pass in the `query` and `widgetId` props."
   - We're using `DataSourceComponent` but NOT passing the `query` prop - we're manually calling `load()` instead
   - Documentation notes: "you can use `dataSource.load()` to load and filter the data as well" - so both approaches are valid
   - However, using the `query` prop might be more reliable for framework-managed lifecycle

2. **onDataSourceInfoChange Callback:**
   - Documentation mentions: "If your widget needs to listen to the data source filter change, you can use `onQueryRequired` callback to update the data."
   - We're using `onDataSourceInfoChange` but maybe we should also listen for status changes?

3. **Output Data Sources:**
   - Our widget creates OUTPUT data sources (not input data sources)
   - The documentation focuses on using input data sources
   - Output data sources might have different lifecycle requirements

4. **Data Source Status - CRITICAL FINDING:**
   - [DataSourceStatus API Reference](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/DataSourceStatus/) states:
     - **"NotReady is for widget output data source only."**
     - **"When output data source instance is created, the data is not ready for use."**
     - **"Widget should dispatch an action (DataSourceStatusChanged) to make the data source ready for use."**
     - **"If a data source status is not ready, the query should return an empty result."**
     - **"When widgets are ready to generate data, widgets will change the status from `NotReady` to `Unloaded`."**

### ROOT CAUSE IDENTIFIED! 🎯

**We're calling `setStatus()` directly, but we should be DISPATCHING A DATA SOURCE STATUS CHANGED ACTION!**

According to the API reference:
- Output data sources start as `NOT_READY`
- Widgets must dispatch `DataSourceStatusChanged` action to change status from `NotReady` to `Unloaded`
- We're currently calling `featureDS.setStatus(DataSourceStatus.Unloaded)` directly
- This might not properly notify the framework, causing the data source to stay `NOT_READY`

**The Fix:** We need to dispatch a `DataSourceStatusChanged` action instead of calling `setStatus()` directly.

### Solution Implementation

**Found:** `appActions.dataSourceStatusChanged(dataSourceId: string, status: DataSourceStatus)` function exists in `jimu-core/lib/app-actions.d.ts`

**Current Code (WRONG):**
```typescript
featureDS.setStatus(DataSourceStatus.Unloaded)
featureDS.setCountStatus(DataSourceStatus.Unloaded)
```

**Correct Code:**
```typescript
import { appActions } from 'jimu-core'
import { getAppStore } from 'jimu-core'

const store = getAppStore()
store.dispatch(appActions.dataSourceStatusChanged(featureDS.id, DataSourceStatus.Unloaded))
```

**Where to Apply:**
- In `handleFormSubmit()` when setting data source to `Unloaded` before query execution
- When switching query items and need to reset data source status

**Reference:** 
- [DataSourceStatus API Reference](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/DataSourceStatus/)
- `jimu-core/lib/app-actions.d.ts` line 630: `export declare function dataSourceStatusChanged(dataSourceId: string, status: DataSourceStatus): DataSourceStatusChangeAction;`

## Implementation

**Status:** ✅ Implemented

**Changes Made:**
1. Added `appActions` and `getAppStore` imports to `query-task.tsx`
2. Replaced all 3 direct `setStatus()` calls with action dispatches:
   - `clearResult()` function (line ~293): Changed `NotReady` status
   - Query item switch handler (line ~428-429): Changed `Unloaded` status
   - `handleFormSubmit()` function (line ~650-651): Changed `Unloaded` status before query execution

**Code Pattern Used:**
```typescript
const store = getAppStore()
store.dispatch(appActions.dataSourceStatusChanged(dataSourceId, DataSourceStatus.Unloaded))
store.dispatch(appActions.dataSourceCountStatusChanged(dataSourceId, DataSourceStatus.Unloaded))
```

**Issue Found:** The data source is being RECREATED after we set the status. When `DataSourceComponent` creates a new instance (due to `useDataSource` prop change), it starts as `NOT_READY`, overwriting our status change.

**Latest Fix Attempt:** Wait for data source creation to complete before setting status, and skip status change if data source is `NOT_READY` to avoid triggering recreation.

**Files Modified:**
- `query-simple/src/runtime/query-task.tsx`

**Testing Required:**
- [ ] Primary bug scenario: Hash-triggered query after clearing results
- [ ] Manual query execution (regression test)
- [ ] Hash-triggered query without clearing (regression test)
- [ ] Multiple hash parameter changes in sequence
- [ ] Clear results functionality (regression test)
- [ ] Query item switching via dropdown (regression test)

## Esri Documentation Search Terms

For searching Esri Experience Builder documentation:

1. **"DataSourceComponent"** - How data sources are created and managed
2. **"DataSourceStatus NotReady"** - What causes NotReady status and how to handle it
3. **"output data source widget"** - Best practices for widget output data sources
4. **"data source lifecycle"** - Understanding data source creation and initialization
5. **"switching query items"** - How to properly switch between query configurations
6. **"hash parameters widget"** - Using URL hash parameters with widgets
7. **"FeatureLayerDataSource load NotReady"** - Why load() returns empty records when NotReady
8. **"DataSourceComponent query prop"** - Using query prop vs manual load() call
9. **"onDataSourceInfoChange"** - Listening for data source status changes

## Related Files

- `query-simple/src/runtime/query-task.tsx` - Main query execution logic
- `query-simple/src/runtime/query-utils.ts` - Query execution utilities
- `query-simple/src/runtime/widget.tsx` - Hash parameter detection
- `query-simple/src/runtime/query-task-form.tsx` - Form submission handling

## Logs Reference

See logs from 2025-12-06 testing sessions for detailed timing and status information.

## Latest Test Results (2025-12-06 - Final Attempt)

### Test Results
**Status:** Partial Progress - First hash works, second hash after clear still fails

**What Works:**
- ✅ First hash query (`#major=222305`) works perfectly:
  - Status changes to `UNLOADED` via action dispatch
  - Count query succeeds (121 records)
  - Records query succeeds (121 records)
  - Tab switches correctly
  - Features selected on map

**What Still Fails:**
- ❌ Hash-triggered query after clearing results:
  - Count query succeeds (count = 1) ✓
  - Status set to `UNLOADED` via action dispatch ✓
  - **BUT:** Data source is RECREATED 10ms after status change (`outputDS-created` event)
  - New data source instance starts as `NOT_READY`, overwriting our status change
  - `load()` called with `NOT_READY` status → returns 0 records ✗
  - Tab doesn't switch (because `hasRecords: false`)
  - No features selected

### Critical Finding from Logs

**Timeline from latest test (`#pin=2223059013` after clearing):**
```
01:01:04.985Z - outputDS-before-unloaded-set (status: UNLOADED from previous query)
01:01:04.986Z - outputDS-after-unloaded-set (status changed to UNLOADED via action dispatch)
01:01:04.996Z - outputDS-created (NEW data source created - 10ms AFTER status change!)
01:01:05.312Z - outputDS-before-load-call (status: NOT_READY - overwritten by new instance!)
01:01:05.340Z - outputDS-after-load-call (status: NOT_READY, recordsReturned: 0)
```

**Root Cause:** `DataSourceComponent` creates a NEW data source instance when `useDataSource` prop changes (when switching query items). The new instance starts as `NOT_READY`, overwriting our status change that happened just milliseconds before.

**The Problem:** We're setting status on the OLD data source instance, but `DataSourceComponent` creates a NEW instance AFTER we've already set the status. The new instance starts as `NOT_READY`, so our status change is lost.

## Current Implementation State

**Status:** ⚠️ Partial Implementation - First hash works, second hash fails

**Current Code Pattern:**
```typescript
// In handleFormSubmit() around line 658-725
if (featureDS.getStatus() === DataSourceStatus.NotReady) {
  // Wait up to 1 second for data source creation
  // ... polling logic ...
}

// Set status to UNLOADED if not already UNLOADED
if (featureDS.getStatus() !== DataSourceStatus.Unloaded) {
  const store = getAppStore()
  store.dispatch(appActions.dataSourceStatusChanged(featureDS.id, DataSourceStatus.Unloaded))
  store.dispatch(appActions.dataSourceCountStatusChanged(featureDS.id, DataSourceStatus.Unloaded))
}
```

**Files Modified:**
- `query-simple/src/runtime/query-task.tsx`:
  - Added `appActions` and `getAppStore` imports (lines 35-36)
  - Modified `clearResult()` to use action dispatch (line ~293)
  - Modified query item switch handler to use action dispatch (lines ~428-429)
  - Modified `handleFormSubmit()` with wait logic and action dispatch (lines ~658-725)

## Rollback Instructions

### Option 1: Git Revert (Recommended)
If changes are committed:
```bash
# Find the commit hash that introduced these changes
git log --oneline --grep="hash.*parameter\|dataSourceStatusChanged\|appActions"

# Revert the specific commit(s)
git revert <commit-hash>

# Or revert multiple commits
git revert <commit-hash-1> <commit-hash-2>
```

### Option 2: Manual Revert
If changes are not committed or you want to manually revert:

**File:** `query-simple/src/runtime/query-task.tsx`

1. **Remove imports** (lines 35-36):
   ```typescript
   // REMOVE these lines:
   appActions,
   getAppStore
   ```

2. **Revert clearResult()** (around line 293):
   ```typescript
   // CHANGE FROM:
   if (outputDS) {
     const store = getAppStore()
     store.dispatch(appActions.dataSourceStatusChanged(outputDS.id, DataSourceStatus.NotReady))
   }
   
   // CHANGE TO:
   outputDS?.setStatus(DataSourceStatus.NotReady)
   ```

3. **Revert query item switch handler** (around lines 428-429):
   ```typescript
   // CHANGE FROM:
   const store = getAppStore()
   store.dispatch(appActions.dataSourceStatusChanged(outputDS.id, DataSourceStatus.Unloaded))
   store.dispatch(appActions.dataSourceCountStatusChanged(outputDS.id, DataSourceStatus.Unloaded))
   
   // CHANGE TO:
   outputDS.setStatus(DataSourceStatus.Unloaded)
   outputDS.setCountStatus(DataSourceStatus.Unloaded)
   ```

4. **Revert handleFormSubmit()** (around lines 658-725):
   ```typescript
   // REMOVE the entire wait loop and conditional status change
   // CHANGE FROM:
   if (featureDS.getStatus() === DataSourceStatus.NotReady) {
     // ... wait logic ...
   }
   if (featureDS.getStatus() !== DataSourceStatus.Unloaded) {
     const store = getAppStore()
     store.dispatch(appActions.dataSourceStatusChanged(...))
     store.dispatch(appActions.dataSourceCountStatusChanged(...))
   }
   
   // CHANGE TO:
   featureDS.setStatus(DataSourceStatus.Unloaded)
   featureDS.setCountStatus(DataSourceStatus.Unloaded)
   ```

### Option 3: Checkout Previous Version
If you have a backup or know the previous commit:
```bash
# Find the commit before changes
git log --oneline

# Checkout the file from before changes
git checkout <previous-commit-hash> -- query-simple/src/runtime/query-task.tsx
```

## Next Steps for Future Investigation

### Priority 1: Set Status AFTER Data Source Creation
**Hypothesis:** We need to set the status AFTER `DataSourceComponent` creates the new instance, not before.

**Approach:**
1. Listen for `onDataSourceCreated` callback
2. When a new data source is created (especially when switching query items), set its status to `UNLOADED` immediately
3. Only proceed with query execution after status is set

**Implementation Idea:**
```typescript
const handleOutputDataSourceCreated = React.useCallback((ds: DataSource) => {
  // Set status immediately when data source is created
  if (ds && ds.getStatus() === DataSourceStatus.NotReady) {
    const store = getAppStore()
    store.dispatch(appActions.dataSourceStatusChanged(ds.id, DataSourceStatus.Unloaded))
    store.dispatch(appActions.dataSourceCountStatusChanged(ds.id, DataSourceStatus.Unloaded))
  }
  setOutputDS(ds)
}, [queryItem.configId, queryItem.outputDataSourceId])
```

### Priority 2: Use onDataSourceInfoChange to Detect Status Changes
**Hypothesis:** We can listen for status changes in `onDataSourceInfoChange` and react accordingly.

**Approach:**
1. Check if status changes from `NOT_READY` to `UNLOADED` in `onDataSourceInfoChange`
2. If status becomes `UNLOADED` and we have a pending query, execute it

### Priority 3: Investigate DataSourceComponent Lifecycle
**Hypothesis:** There might be a prop or callback we're missing that controls when data sources are created/destroyed.

**Research Needed:**
- Check `DataSourceComponent` props documentation
- Look for lifecycle callbacks we're not using
- Check if there's a way to prevent recreation when switching query items

### Priority 4: Alternative: Pre-create All Data Sources
**Hypothesis:** If we pre-create all query item data sources at widget mount, they'll always be ready.

**Approach:**
1. On widget mount, create all output data sources for all query items
2. Set their status to `UNLOADED` immediately
3. When switching query items, use the pre-created data source instead of letting `DataSourceComponent` create a new one

**Pros:** No race conditions, data sources always ready  
**Cons:** Performance impact, need to manage lifecycle of unused data sources

## Key Learnings

1. **Framework Patterns Exist for a Reason:** `DataSourceComponent` automatically manages data source lifecycle - don't fight against it
2. **False Assumptions Can Cause Bugs:** We assumed manual cleanup was needed, but it was causing the problem
3. **Comprehensive Logging is Essential:** Without detailed diagnostic logging, we wouldn't have identified the double creation issue
4. **Timing Matters:** Async component creation requires understanding the framework's lifecycle, not working around it
5. **Read Framework Behavior:** Understanding how `DataSourceComponent` works was key to solving this
6. **Action Dispatch is Correct:** Using `appActions.dataSourceStatusChanged()` is the right approach per API documentation (though not the root cause here)
7. **First Hash Works:** The first hash query works because the data source isn't being recreated (it's the initial creation)
8. **Second Hash Failed:** After clearing and switching query items, manual destruction caused double creation and timing issues

