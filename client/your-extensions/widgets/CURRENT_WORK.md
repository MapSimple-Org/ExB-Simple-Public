# Current Work Status

**Last Updated:** 2025-12-20 (Release 017.41 - Sticky State & URL Param Fixes)  
**Branch:** `feature/results-management-modes`  
**Developer:** Adam Cabrera  
**Current Version:** v1.19.0-r017.41

## Active Work

### Current Task
- **What:** Sticky State & URL Parameter Support - Fixed "persistence traps" during rapid hash switching and added `?query` parameter support.
- **Why:** Switching between searches via URL hash was leaving the form and expansion icons in a "dirty" state from the previous query.
- **Status:** ✅ **COMPLETE** - All state-flushing bugs resolved. HS now supports `#` and `?` parameters.
- **Files Modified:**
  - `query-simple/src/runtime/query-result.tsx` - Fixed expansion state resetting
  - `query-simple/src/runtime/query-task-form.tsx` - Forced form flushing via unique keys
  - `query-simple/src/runtime/query-task-list.tsx` - Added `?query` support and listener logic
  - `helper-simple/src/runtime/widget.tsx` - Updated HS to detect both parameter types
  - `query-simple/src/version.ts` - Incremented to r017.41

### Previous Task (Complete)
- **What:** The Performance Breakthrough - 93% Latency Reduction
- **Why:** Parcel and Major queries were taking 21+ seconds due to non-SARGable SQL and field bloat.
- **Status:** ✅ **COMPLETE** - Queries reduced to 1.4s.
- **Key Solutions:** Universal SQL Optimizer, Attribute Stripping, Geometry Generalization.

## 🔬 Post-Mortem: What Worked, What Didn't, and Why

### 1. The Performance Engine (SQL Optimizer)
- **What Worked:** Surgically "unwrapping" the database field from `LOWER()` and manually uppercasing the search input.
- **The "Why":** Standard framework queries use `LOWER(PIN) = '123'`, which prevents the database from using its attribute index (causing a "Full Table Scan"). By using `PIN = '123'`, the database uses its B-Tree index instantly.
- **The Lesson:** Case-insensitivity should be handled by normalizing input, not by modifying the database column in the query.

### 2. The "Sticky State" Trap
- **What Didn't Work:** Using standard `useState` initialization for expansion and form values.
- **The "Why":** React re-uses component instances during rapid hash switching to save memory. Without an explicit `useEffect` watching the `configId` or a unique `key` on the form, state from the *previous* query persists into the *next* query.
- **The Lesson:** Always use unique React `keys` based on the query's ID to force a clean slate during transitions.

### 3. The "Construction Worker" Mistake
- **What Didn't Work:** Using `git reset --hard` to revert code experiments.
- **The "Why":** Experience Builder's local portal configuration (`config.json`) and sign-in info are often untracked. A hard reset destroys the local development environment, not just the code.
- **The Lesson:** Use the "Scalpel Rule"—`git checkout path/to/file` is safe; `reset --hard` is a hammer.

### 4. Single-Trip vs. Lazy Loading
- **What Worked:** Fetching all results in one trip and using a simple list.
- **The "Why":** With Attribute Stripping (fetching only 3 fields vs 50), the payload size is so small that the overhead of pagination (stuttering, state management) becomes a net negative. Single-trip is faster and more reliable.

---

## Recent Context

### What We Just Completed
- ✅ Results mode UI buttons (New/Add/Remove) added to query form
- ✅ State management for `resultsMode` in widget.tsx
- ✅ Props passing through QueryTaskList → QueryTask
- ✅ Translations for mode labels and descriptions
- ✅ Debug logging infrastructure for RESULTS-MODE

### What We Just Completed
- ✅ **"Add to" mode:** Fully implemented and tested
  - Widget-level accumulated records state management
  - Merge logic with deduplication using composite keys
  - Preserves accumulated records when switching queries
  - Re-selects records on map after query switches
  - Groups records by origin data source for DataActionList
- ✅ **"Remove from" mode:** Fully implemented and tested
  - Remove logic using composite key matching
  - Removes records from origin data source selections
  - Auto-clears when all records removed
  - Preserves remaining records when switching queries
- ✅ **Selection restoration:** Fixed for accumulated records
  - Restores accumulated records when widget opens
  - Clears accumulated records when widget closes
  - Handles multiple origin data sources correctly
- ✅ **Hash parameter handling:** Resets to "New" mode when hash parameter detected
  - Prevents bugs when hash parameters entered in accumulation modes
  - Clears accumulated records automatically

### What We Just Completed
- ✅ **Scroll Position Preservation Fix:** Fixed scroll position resetting when removing records from lazy-loaded results
  - Separated scroll reset logic: only resets on new query (resultCount change)
  - Preserves scroll position when records are filtered/removed
  - Uses useLayoutEffect for synchronous scroll restoration before paint
  - Clamps scroll position to valid range to prevent browser resets
  - Release number incremented to r012

### Latest Changes (Release 016.7)

**Status:** ✅ **COMPLETE** - Build is stable and ready for testing

#### Display Order Feature (Release 016.6-016.7)
- ✅ **Optional display order field** - Allows prioritizing queries without recreating them
  - Added `order?: number` field to `QueryItemType` config
  - Number input in query item settings (optional field)
  - Lower numbers appear first (e.g., order: 1, 2, 3...)
  - Queries without order maintain their original relative positions
  - Sorting applied before grouping and display
  - Default selection respects display order (selects query with lowest order value)
  - **Use Case:** When you have 15-20 queries and create a new one you want at the top, you can simply set its order to 1 instead of manually reordering in config or recreating all queries
  - **Impact:** Small feature, big time-saver for managing many queries

#### Hash Parameter Info Button (Release 016.5-016.6)
- ✅ **Info button next to layer title** - Shows hash parameter search information
  - Appears when queries from the same layer have shortIds configured
  - Tooltip displays all available shortIds for that layer with usage examples
  - Format: "This layer can be searched using the shortIds pin and major using #shortId=value in the URL"
  - Lists each query with its shortId: "Parcel number: #pin=value"
  - Only shows for layers with queries that have shortIds
  - Uses same InfoOutlined icon pattern as other info buttons
  - **User Benefit:** Exposes hash parameter search capability to end users, making deep linking discoverable

### Previous Changes (Release 016.4)

**Status:** ✅ **COMPLETE** - Build is stable and ready for testing

#### SimpleList Implementation (Release 016)
- ✅ **Forced SimpleList everywhere** - Removed lazy loading complexity
  - Runtime code forces `PagingType.Simple` regardless of config
  - Removed LazyLoad and MultiPage rendering blocks
  - Removed unused imports (`LazyList`, `PagingList`)
  - Query execution fetches all records (up to maxRecordCount) instead of paginated
  - **Result:** Way fewer issues, way easier to deal with, much more stable

#### UI Improvements (Release 016.2-016.4)
- ✅ **Larger remove button** - Changed from X icon (20x20px) to trash icon (32x32px)
  - Better touch targets for mobile devices
  - Larger icon (18px instead of 14px)
  - More padding (6px instead of 4px)
- ✅ **Larger expand/collapse button** - Increased from default small to 32x32px
  - Better touch targets
  - Larger icon (size 'm' instead of 's')
  - More padding for easier clicking
- ✅ **Reduced padding** - Changed feature-info component from `p-2` (8px) to `p-1` (4px)
  - More compact vertical spacing
  - Better use of screen real estate

#### Bug Fixes (Release 016.1)
- ✅ **Race condition fix** - Added null check in `feature-info.tsx` to prevent errors when component unmounts during async module loading
  - Prevents `Cannot read properties of null (reading 'appendChild')` errors
  - Component checks if still mounted before appending DOM elements

#### Current State
- **Version:** v1.19.0-r016.4
- **Build Status:** ✅ Stable and ready for testing
- **Key Features:**
  - SimpleList rendering (no lazy loading)
  - Results Management Modes (New/Add/Remove) fully working
  - Improved UI with larger, more touch-friendly buttons
  - All records properly selected when adding from multiple sources
  - Expand/collapse state persistence working
  - Selection restoration working correctly

### Next Up
- More testing with edge cases
- Update settings UI to show Simple/MultiPage options (TODO #6)
- Final code review

## Rolled Back Changes (2025-12-12)

### SimpleList Component
- **Status:** Rolled back - documented for future implementation
- **Reason:** Need to stabilize current implementation first
- **Documentation:** See TODO.md entry #7 for details
- **What Was Removed:**
  - `query-simple/src/runtime/simple-list.tsx` (deleted)
  - `PagingType.Simple` enum value from `config.ts`
  - SimpleList rendering logic from `query-result.tsx`
  - Default changed back to `PagingType.LazyLoad`

### Refresh Button
- **Status:** Rolled back - documented for future consideration
- **Reason:** May not be needed with expand/collapse state persistence fix
- **Documentation:** See TODO.md entry #8 for details
- **What Was Removed:**
  - `refreshKey` state and `handleRefresh` function from `query-result.tsx`
  - Refresh button UI (RefreshOutlined icon and button)
  - `refreshKey` from component keys (LazyList, PagingList)
  - `refreshResults` translation

### Expand/Collapse State Persistence
- **Status:** ✅ **KEPT** - Working well
- **Implementation:** Uses `itemExpandStates` Map to track individual item expansion states
- **Files:** `query-result.tsx`, `lazy-list.tsx`, `paging-list.tsx`
- **How It Works:**
  - `itemExpandStates` Map tracks expansion state per record ID
  - `toggleExpandAll` updates all current items in the map
  - `removeRecord` cleans up removed items from the map
  - `LazyList` and `PagingList` use individual states from map, falling back to `expandByDefault`
  - Prevents state loss when items are removed or components remount

## Important Decisions Made
- **Mode Persistence:** Mode persists across queries and clear operations (does NOT reset)
- **Data Source Strategy:** Create widget-level accumulated results data source (`widget_XX_accumulated_results`)
- **Deduplication:** Use composite key `${originDSId}_${objectId}` for record uniqueness (objectId alone is not globally unique - different layers can have same objectId)
- **Code Organization:** Extract all shared logic into reusable utility functions - no code duplication (DRY principle)
- **UI Location:** Mode buttons placed in Query tab, below Search Layer dropdowns
- **Default Mode:** "Create new results" (current behavior) - no changes needed, already works correctly

## Blockers / Questions
- ~~**RESOLVED:** Cannot create new data sources at runtime - `createDataSourceByDataSourceJson()` doesn't exist in runtime context~~
- **Solution:** Use existing output DS and merge records into it instead of creating new DS

## What Didn't Work

### Attempt 1: Create Accumulated Results Data Source at Runtime
**Problem:** Tried to create a new data source (`widget_XX_accumulated_results`) at runtime using `DataSourceManager.createDataSourceByDataSourceJson()`.

**Error:** `dsManager.createDataSourceByDataSourceJson is not a function`

**Root Cause:** Output data sources are created in the **setting phase** and added to app config. At runtime, we can only:
- Get existing data sources via `getDataSource()`
- Use `createDataSourceByUseDataSource()` (but this creates origin DS, not output DS)
- Cannot create new output data sources programmatically at runtime

**Lesson Learned:** Experience Builder's data source architecture separates configuration-time (setting) from runtime. Output data sources must be defined in app config.

### Attempt 2: Load Accumulated Records into OutputDS When Switching Queries
**Problem:** When switching queries in "Add to" mode, accumulated records are selected on the map but `DataActionList` doesn't recognize them. Tried to load accumulated records into the new outputDS.

**Why This Won't Work:**
- Would require querying the server to load records (slow)
- Doesn't work when records come from different origin data sources
- Creates inconsistency: records scattered across multiple outputDS instances
- Each query switch would accumulate more records in different outputDS instances, making it messy

**Lesson Learned:** Can't load records directly into outputDS without querying. Need a different approach.

### Attempt 3: Use OutputDS in actionDataSet with Accumulated Records
**Problem:** `DataActionList` receives `actionDataSet` with `outputDS` as dataSource but records from different origin data sources. DataActionList doesn't recognize records that don't match the dataSource's origin.

**Why This Doesn't Work:**
- DataActionList validates records against the dataSource
- Accumulated records may come from different origin data sources than current outputDS
- Records are selected in origin data sources, not loaded in outputDS
- DataActionList needs records to match the dataSource's origin

**Current Status:** Implementing grouping by origin data source (see below)

## Current Approach

### Using Existing Output Data Source
Instead of creating a new data source, we'll:
1. **Use the existing output DS** that's already created for each query item
2. **Before clearing** (in "Add to" mode): Get existing records via `getAllLoadedRecords()`
3. **Execute query** normally to get new records
4. **Merge records** in memory using `mergeResultsIntoAccumulated()` utility
5. **Store merged records** in `recordsRef.current` for display
6. **Update selection** to use merged records

**Benefits:**
- No need to create new data sources
- Works with existing ExB patterns
- Simpler implementation
- Records are managed in memory/refs

**Trade-offs:**
- Accumulated records are stored in component state/refs, not persisted in DS
- Need to handle record merging on each query execution
- Clear results will clear accumulated records (expected behavior)

### Current Issue: DataActionList Not Recognizing Accumulated Records

**Problem:** When switching queries in "Add to" mode, accumulated records are selected on the map and visible in Results tab, but `DataActionList` only shows custom "Add to Map" action, not other data actions.

**Root Cause:** 
- `actionDataSet` uses current `outputDS` as dataSource
- Accumulated records come from different origin data sources (or same origin but different query)
- Records are selected in origin data sources, not loaded in outputDS
- `DataActionList` validates records against the dataSource and doesn't recognize mismatched records

**Current Solution Being Tried: Group Records by Origin Data Source**
- Group accumulated records by their origin data source
- Create multiple `DataRecordSet`s (one per origin data source)
- Pass all `DataRecordSet`s to `DataActionList` (it accepts an array)
- Use origin data sources in `DataRecordSet`s, not outputDS

**Why This Should Work:**
- Records stay selected in their origin data sources (map highlighting works)
- Each `DataRecordSet` matches its records' origin data source
- No need to load records into outputDS
- Works when records come from different origin data sources
- Avoids scattering records across multiple outputDS instances
- Display (Results tab) unchanged - still shows all accumulated records

**Rollback Plan:**
- If this doesn't work, revert `actionDataSets` back to single `actionDataSet` with outputDS
- File: `query-simple/src/runtime/query-result.tsx`
- Change: Replace `actionDataSets: DataRecordSet[]` with `actionDataSet: DataRecordSet` (single, not array)
- Change: Update `DataActionList` to use `dataSets={[actionDataSet]}` instead of `dataSets={actionDataSets}`
- Document findings about DataActionList behavior
- Consider alternative: disable DataActionList when in "Add to" mode with mixed origins

**Implementation Date:** 2025-12-10
**Status:** ✅ Working - grouping records by origin data source for DataActionList (pending more testing)

---

## "Remove from" Mode Strategy

**Status:** ✅ **COMPLETE** - Fully implemented and working

### Core Approach
Mirror "Add to" mode but remove instead of merge:
1. Execute query normally (get results)
2. Remove matching records from widget-level accumulated records (using composite key)
3. Update widget-level accumulated records
4. Update selection on origin data sources (remove from map)
5. Update display (recordsRef, resultCount)

### Key Issues to Address

#### 1. Utility Function Update Needed
**Current Problem:** `removeResultsFromAccumulated()` tries to get records from `outputDS.getAllLoadedRecords()` - but accumulated records aren't loaded in outputDS, they're in widget-level state.

**Fix Needed:** Update function signature to take widget-level accumulated records as input:
```typescript
export function removeResultsFromAccumulated(
  outputDS: FeatureLayerDataSource, // For key generation only
  recordsToRemove: FeatureDataRecord[],
  existingAccumulatedRecords: FeatureDataRecord[] = [] // Widget-level records
): FeatureDataRecord[]
```

#### 2. Selection Management Complexity
**Challenge:** Records may come from multiple origin data sources. Need to:
- Identify which origin DS each removed record belongs to
- Get current selection for each origin DS
- Remove matching records from each origin DS's selection
- Publish selection change messages for each origin DS

**Approach:**
- Group removed records by their origin data source
- For each origin DS:
  - Get current selected records from that origin DS
  - Filter out removed records
  - Call `selectRecordsAndPublish` with remaining records
- This ensures map selection is updated correctly for each origin layer

#### 3. Edge Cases to Handle
- **No accumulated records:** No-op (or disable "Remove from" button)
- **Query results don't match any accumulated records:** No-op, log for debugging
- **Removing all records:** Should we auto-clear (like Clear Results) or keep empty state?
- **Switching queries in "Remove from" mode:** Preserve remaining accumulated records (same as "Add to")

#### 4. Query Execution Flow
Similar to "Add to" mode:
1. Capture existing accumulated records before query (for merge comparison)
2. Execute query normally
3. Remove matching records from accumulated records using composite key
4. Update widget-level `accumulatedRecords` state
5. Update selection: remove from origin data sources (group by origin DS)
6. Update display: `recordsRef.current` and `resultCount`
7. If all records removed, consider auto-clearing (see Questions below)

### Implementation Plan

**Step 1: Update Utility Function**
- Modify `removeResultsFromAccumulated()` in `results-management-utils.ts`
- Change signature to accept `existingAccumulatedRecords` parameter
- Remove dependency on `outputDS.getAllLoadedRecords()`
- Use composite key matching (same as merge function)

**Step 2: Add Selection Removal Logic**
- Create helper function to remove records from origin data source selections
- Group removed records by origin DS
- Update each origin DS's selection separately
- Publish selection change messages

**Step 3: Integrate into Query Execution**
- Add "Remove from" mode handling in `handleFormSubmit` (query-task.tsx)
- Similar pattern to "Add to" mode
- Handle edge cases (no matches, all removed, etc.)

**Step 4: Handle Query Switching**
- Preserve remaining accumulated records when switching queries (same as "Add to")
- Re-select remaining records on map after query switch
- Update `handleOutputDataSourceCreated` to handle "Remove from" mode

**Step 5: UI Considerations**
- Disable "Remove from" button when `accumulatedRecords.length === 0`?
- Show feedback when query results don't match any accumulated records?

### Questions to Resolve

1. **Auto-clear behavior:** If removing all records, should we auto-clear everything (same as clicking "Clear Results") or keep empty accumulated state?
   - **Recommendation:** Auto-clear (consistent with user expectation)

2. **Button state:** Should "Remove from" button be disabled when `accumulatedRecords.length === 0`?
   - **Recommendation:** Yes, disable button (prevents confusion)

3. **Query switching:** When switching queries in "Remove from" mode, preserve remaining accumulated records (same as "Add to")?
   - **Recommendation:** Yes, preserve remaining records (consistent behavior)

4. **No matches feedback:** Should we show user feedback when query results don't match any accumulated records?
   - **Recommendation:** Log for debugging, but no user-facing message (silent no-op)

### What We've Learned from "Add to" Mode

**Patterns to Reuse:**
- Widget-level accumulated records state management
- Composite key for deduplication (`${originDSId}_${objectId}`)
- Preserving accumulated records when switching queries
- Re-selecting records after query switch
- Grouping records by origin data source for DataActionList

**Things to Avoid:**
- Don't try to load records into outputDS (slow, messy, doesn't work with different origins)
- Don't use outputDS in DataRecordSet when records come from different origins
- Don't clear accumulated records when switching queries in accumulation modes

### Related Files
- `query-simple/src/runtime/results-management-utils.ts` - Update `removeResultsFromAccumulated()`
- `query-simple/src/runtime/query-task.tsx` - Add "Remove from" handling in `handleFormSubmit`
- `query-simple/src/runtime/selection-utils.ts` - May need helper for removing from selection
- `query-simple/src/runtime/query-task.tsx` - Update `handleOutputDataSourceCreated` for "Remove from" mode

## Related Documentation
- `query-simple/RESULTS_MANAGEMENT_MODES_PLAN.md` - Detailed implementation plan
- `DEVELOPMENT_GUIDE.md` - Development patterns and best practices
- `TODO.md` - Other pending tasks

---

## Quick Reference

**Branch:** `feature/results-management-modes`  
**Last Commit:** Added results mode UI and state management  
**Current Focus:** Implementing "Add to current results" mode - merging query results into accumulated data source

## Implementation Notes

### Current Architecture
- Widget state: `resultsMode: SelectionType` (defaults to `NewSelection`)
- Mode buttons in QueryTask component (lines ~952-1094 in query-task.tsx)
- State flows: `widget.tsx` → `query-task-list.tsx` → `query-task.tsx`

### Design Decisions

#### 1. Composite Key for Record Deduplication
**Problem:** ObjectID is only unique within a layer, not globally. Different layers can have the same ObjectID.

**Solution:** Use composite key: `${originDSId}_${objectId}`

**Implementation:**
- Create `getRecordKey(record, outputDS)` utility function
- Returns: `${originDSId}_${objectId}` where originDSId comes from `outputDS.getOriginDataSources()[0].id`
- This ensures records from different layers are treated as unique even if they share ObjectIDs

**Example:**
- `layer01` with `objectId=123` → key: `"layer01_123"`
- `layer02` with `objectId=123` → key: `"layer02_123"`
- These are correctly treated as different records

#### 2. Code Organization - DRY Principle
**Critical:** No code duplication. Extract reusable functions.

**Utility Functions to Create:**

**In `query-utils.ts` (or new `results-management-utils.ts`):**
- `getRecordKey(record, outputDS)` - Generate composite key for record
- `mergeResultsIntoAccumulated(accumulatedDS, newRecords, newOutputDS)` - Merge new records into accumulated DS, deduplicate by composite key
- `removeResultsFromAccumulated(accumulatedDS, recordsToRemove, removeOutputDS)` - Remove matching records from accumulated DS using composite key
- `createAccumulatedResultsDataSource(widgetId, originDS)` - Create widget-level accumulated results DS
- `clearAccumulatedResults(accumulatedDS)` - Clear all records from accumulated DS

**Pattern:**
- `handleFormSubmit` orchestrates - calls utilities based on mode
- All query execution logic extracted to utilities
- No duplication between "New", "Add", "Remove" modes

#### 3. Data Source Strategy
- **Accumulated Results DS:** `widget_XX_accumulated_results`
- Created on widget mount in `widget.tsx`
- Uses same origin data source as first query (or detects if queries use different origins)
- Stored in widget state: `accumulatedResultsDSId`, `accumulatedOriginDSId`

#### 4. Mode Behavior

**"New" Mode (Current Behavior):**
- Clears previous results (existing logic)
- Executes query
- Stores results in query item's outputDS
- No changes needed - this is already working correctly

**"Add to" Mode:**
- Execute query normally (get results from query item's outputDS)
- Merge new results into accumulated DS using `mergeResultsIntoAccumulated()`
- Deduplicate by composite key (`originDSId_objectId`)
- Display accumulated results in Results tab
- Update selection to show accumulated results on map

**"Remove from" Mode:**
- Execute query normally (get results from query item's outputDS)
- Remove matching records from accumulated DS using `removeResultsFromAccumulated()`
- Match by composite key
- Display remaining accumulated results
- Update selection to show remaining accumulated results on map

#### 5. Results Display Logic
- **"New" Mode:** Use query item's outputDS (current behavior)
- **"Add to" / "Remove from" Mode:** Use accumulated results DS
- `query-result.tsx` checks `resultsMode` to determine which DS to use

### Implementation Steps for "Add to" Mode

1. **Create Utility Functions** (`results-management-utils.ts`):
   - `getRecordKey()` - Composite key generation
   - `mergeResultsIntoAccumulated()` - Merge with deduplication
   - `createAccumulatedResultsDataSource()` - DS creation helper

2. **Widget State Management** (`widget.tsx`):
   - Create accumulated results DS on mount
   - Store `accumulatedResultsDSId` and `accumulatedOriginDSId` in state
   - Clean up on unmount

3. **Query Execution** (`query-task.tsx`):
   - Modify `handleFormSubmit` to check `resultsMode`
   - If "New": keep current behavior (no changes)
   - If "Add to": execute query, then call `mergeResultsIntoAccumulated()`
   - Extract shared query execution logic to utility function

4. **Results Display** (`query-result.tsx`):
   - Check `resultsMode` prop
   - Use accumulated DS when in Add/Remove mode
   - Use query item's outputDS when in New mode

5. **Widget Lifecycle** (`widget.tsx`):
   - Clear accumulated results when widget closes (if needed)
   - Restore accumulated results when widget opens (if in Add/Remove mode)

### Code Structure to Review
- `query-task.tsx` - `handleFormSubmit` method (line ~528) - where query executes
- `query-result.tsx` - Results display component
- `query-utils.ts` - Query execution utilities
- `selection-utils.ts` - Selection management utilities
- **NEW:** `results-management-utils.ts` - Results mode utilities (to be created)

