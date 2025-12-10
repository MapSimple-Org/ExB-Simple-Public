# Results Management Modes - Implementation Plan

## Overview

This document outlines the implementation plan for adding three results management modes to the QuerySimple widget:
1. **Create new results** (default) - Current behavior
2. **Add to current results** - Accumulate results across multiple queries
3. **Remove from current results** - Remove matching records from accumulated results

## Use Case

Users want to build up a collection of parcels from multiple searches (e.g., multiple PIN searches + a Major number search) and then export or perform actions on the combined set. The mode persists across queries until explicitly changed by the user.

## Requirements

### Functional Requirements

1. **Mode Selection**
   - Dropdown always visible for all queries
   - Three options: "Create new results", "Add to current results", "Remove from current results"
   - Mode persists across queries (does not reset when switching queries)
   - Mode persists when clearing results (does not reset)
   - Default mode: "Create new results"

2. **Create New Results Mode** (Default)
   - Current behavior: Each query replaces previous results
   - Uses query item's individual output data source
   - Clears accumulated results if they exist
   - Displays query item's results in Results tab

3. **Add to Current Results Mode**
   - Execute query normally (get results from query item's outputDS)
   - Merge new results into accumulated results data source
   - Deduplicate by record ID (objectId) to avoid duplicates
   - Update accumulated results data source
   - Display accumulated results in Results tab
   - Show total count of accumulated results

4. **Remove from Current Results Mode**
   - Execute query normally (get results from query item's outputDS)
   - Remove matching records from accumulated results (by objectId)
   - Update accumulated results data source
   - Display accumulated results in Results tab
   - Show total count of remaining accumulated results

5. **Widget Lifecycle**
   - Widget close: Clear selection from map (same as current behavior)
   - Widget open: Restore accumulated results to map if mode is Add/Remove and has records
   - Accumulated results persist across widget close/open cycles

6. **Clear Results**
   - Clears accumulated results data source
   - Clears query item's outputDS (current behavior)
   - Clears selection from map
   - **Does NOT reset mode** (mode persists)

### Technical Requirements

1. **Data Source Management**
   - Create widget-level accumulated results data source on widget mount
   - Use same origin data source as queries (all queries share same origin layer)
   - Manage accumulated results data source lifecycle
   - Handle data source creation/updates properly

2. **Record Management**
   - Merge records by unique ID (objectId) when adding
   - Remove records by unique ID (objectId) when removing
   - Maintain record references for selection/highlighting
   - Handle record deduplication correctly

3. **State Management**
   - Store mode in widget state (persists across queries)
   - Store accumulated results data source ID
   - Store accumulated origin data source ID
   - Track accumulated records for restoration

4. **UI Updates**
   - Add mode dropdown to query form (always visible)
   - Update Results tab to show accumulated results when in Add/Remove mode
   - Update result count display
   - Show appropriate messaging for accumulated vs. individual results

## Architecture

### Current Architecture

```
Widget (widget.tsx)
  └── QueryTaskList (query-task-list.tsx)
      └── QueryTask (query-task.tsx)
          ├── QueryTaskForm (query-task-form.tsx) - Query input
          └── QueryTaskResult (query-result.tsx) - Results display
              └── Uses queryItem.outputDataSourceId (per query item)
```

**Current Flow:**
1. User executes query
2. Query executes against origin data source
3. Results stored in query item's output data source (`widget_XX_output_YYYY`)
4. Results displayed in Results tab
5. Each query replaces previous results

### New Architecture

```
Widget (widget.tsx)
  ├── State: resultsMode, accumulatedResultsDSId, accumulatedOriginDSId
  ├── Accumulated Results Data Source (widget_XX_accumulated_results)
  └── QueryTaskList (query-task-list.tsx)
      └── QueryTask (query-task.tsx)
          ├── QueryTaskForm (query-task-form.tsx)
          │   └── Mode Dropdown (NEW)
          └── QueryTaskResult (query-result.tsx)
              └── Uses accumulatedResultsDSId OR queryItem.outputDataSourceId
                  (depending on mode)
```

**New Flow:**
1. User selects mode (persists across queries)
2. User executes query
3. Query executes against origin data source
4. **If "Create new":** Results stored in query item's outputDS (current behavior)
5. **If "Add to":** Results merged into accumulated results DS
6. **If "Remove from":** Records removed from accumulated results DS
7. Results displayed in Results tab (accumulated or individual based on mode)

## Data Source Strategy

### Accumulated Results Data Source

**Creation:**
- Create on widget mount: `widget_XX_accumulated_results`
- Use same origin data source as queries (all queries share same origin layer)
- Initialize empty
- Store DS ID in widget state

**Lifecycle:**
- Created: Widget mount
- Updated: When mode is "Add to" or "Remove from"
- Cleared: When mode is "Create new" or user clicks "Clear results"
- Destroyed: Widget unmount (handled by framework)

**Origin Data Source:**
- All queries in widget share same origin layer (e.g., King County Parcels)
- Use `outputDS.getOriginDataSources()[0]` to get origin DS
- Store origin DS ID in widget state for accumulated results
- Verify all queries use same origin DS (warn if different)

## Implementation Steps

### Phase 1: State Management & Data Source Setup

**Files: `widget.tsx`**

1. Add state properties:
   ```typescript
   state: {
     // ... existing state ...
     resultsMode: SelectionType = SelectionType.NewSelection,
     accumulatedResultsDSId?: string,
     accumulatedOriginDSId?: string,
   }
   ```

2. Create accumulated results data source on mount:
   - Generate unique DS ID: `${widgetId}_accumulated_results`
   - Create output data source using DataSourceManager
   - Store DS ID in state
   - Get origin DS ID from first query item's outputDS
   - Store origin DS ID in state

3. Clean up accumulated results DS on unmount:
   - Clear records
   - Let framework handle DS destruction

### Phase 2: UI - Mode Dropdown

**Files: `query-task-form.tsx`**

1. Add mode dropdown component:
   - Position: Next to "Search alias" input (as shown in user's image)
   - Options:
     - "Create new results" (icon: document)
     - "Add to current results" (icon: document + plus)
     - "Remove from current results" (icon: document + X)
   - Default: "Create new results"

2. Connect to widget state:
   - Read mode from widget state (via props or context)
   - Update mode in widget state on change
   - Persist mode across query switches

3. Visual indicators:
   - Show current mode selection
   - Disable "Remove from" if no accumulated results exist
   - Show accumulated results count when in Add/Remove mode

### Phase 3: Query Execution Logic

**Files: `query-task.tsx`**

1. Modify `handleFormSubmit`:
   - Check current mode from widget state
   - Branch based on mode:
     - **"Create new":** Current behavior (use query item's outputDS)
     - **"Add to":** Execute query, then merge into accumulated DS
     - **"Remove from":** Execute query, then remove from accumulated DS

2. Add helper functions:
   - `mergeResultsIntoAccumulated()` - Merge new results into accumulated DS
   - `removeResultsFromAccumulated()` - Remove records from accumulated DS
   - `clearAccumulatedResults()` - Clear accumulated DS

3. Update `clearResult()`:
   - Clear accumulated results DS
   - Keep current behavior for query item's outputDS
   - **Do NOT reset mode**

### Phase 4: Results Display

**Files: `query-result.tsx`**

1. Modify results source:
   - If mode is "Create new": Use query item's outputDS (current behavior)
   - If mode is "Add to" or "Remove from": Use accumulated results DS

2. Update result count:
   - Show accumulated results count when in Add/Remove mode
   - Show query item's count when in "Create new" mode

3. Update records display:
   - Display accumulated records when in Add/Remove mode
   - Display query item's records when in "Create new" mode

### Phase 5: Record Merging/Removal Logic

**Files: `query-utils.ts` (or new `results-management-utils.ts`)**

1. `mergeResultsIntoAccumulated()`:
   ```typescript
   function mergeResultsIntoAccumulated(
     accumulatedDS: FeatureLayerDataSource,
     newRecords: DataRecord[]
   ): DataRecord[] {
     const existingRecords = accumulatedDS.getAllLoadedRecords() || []
     const existingIds = new Set(existingRecords.map(r => r.getId()))
     const uniqueNewRecords = newRecords.filter(r => !existingIds.has(r.getId()))
     const mergedRecords = [...existingRecords, ...uniqueNewRecords]
     
     // Update accumulated DS with merged records
     // Use outputDS.load() or similar to update records
     
     return mergedRecords
   }
   ```

2. `removeResultsFromAccumulated()`:
   ```typescript
   function removeResultsFromAccumulated(
     accumulatedDS: FeatureLayerDataSource,
     recordsToRemove: DataRecord[]
   ): DataRecord[] {
     const existingRecords = accumulatedDS.getAllLoadedRecords() || []
     const removeIds = new Set(recordsToRemove.map(r => r.getId()))
     const remainingRecords = existingRecords.filter(r => !removeIds.has(r.getId()))
     
     // Update accumulated DS with remaining records
     
     return remainingRecords
   }
   ```

3. Handle data source updates:
   - Use `outputDS.load()` or `outputDS.updateQueryParams()` to update records
   - Publish `DataRecordSetChangeMessage` to notify other widgets
   - Update selection state if needed

### Phase 6: Widget Lifecycle Integration

**Files: `widget.tsx`**

1. Update `addSelectionToMap()`:
   - Check if mode is Add/Remove and has accumulated results
   - Use accumulated results DS for restoration if applicable
   - Otherwise use current behavior

2. Update `clearSelectionFromMap()`:
   - Clear selection from accumulated results DS if in Add/Remove mode
   - Otherwise use current behavior

3. Track accumulated results for restoration:
   - Store accumulated records in widget state
   - Restore accumulated results on widget open if mode is Add/Remove

### Phase 7: Edge Cases & Error Handling

1. **Different Origin Data Sources:**
   - Verify all queries use same origin DS
   - Warn if different origin DS detected
   - Handle gracefully (maybe disable Add/Remove mode)

2. **Empty Results:**
   - Handle "Remove from" when no accumulated results exist
   - Disable "Remove from" option if no accumulated results
   - Show appropriate messaging

3. **Mode Switching:**
   - When switching from Add/Remove to "Create new": Clear accumulated results
   - When switching to Add/Remove: Initialize accumulated results if needed

4. **Data Source Errors:**
   - Handle DS creation failures
   - Handle DS update failures
   - Show user-friendly error messages

## Testing Plan

### Unit Tests

1. **Record Merging:**
   - Test merging records with duplicates (should deduplicate)
   - Test merging empty results
   - Test merging large result sets

2. **Record Removal:**
   - Test removing all records
   - Test removing non-existent records
   - Test removing partial matches

3. **Mode Persistence:**
   - Test mode persists across query switches
   - Test mode persists after clearing results
   - Test mode resets on widget remount (expected behavior)

### Integration Tests

1. **Query Execution:**
   - Execute query in "Create new" mode
   - Execute query in "Add to" mode
   - Execute query in "Remove from" mode
   - Switch modes and verify behavior

2. **Results Display:**
   - Verify accumulated results display correctly
   - Verify individual results display correctly
   - Verify result counts are accurate

3. **Widget Lifecycle:**
   - Close widget with accumulated results
   - Reopen widget and verify restoration
   - Clear results and verify mode persists

### E2E Tests

1. **Use Case Flow:**
   - Switch to "Add to" mode
   - Execute PIN query
   - Execute Major query
   - Verify accumulated results contain both sets
   - Export accumulated results
   - Clear results and verify mode persists

2. **Mode Switching:**
   - Start in "Create new" mode
   - Execute query
   - Switch to "Add to" mode
   - Execute another query
   - Verify results accumulated
   - Switch back to "Create new"
   - Verify accumulated results cleared

## Configuration

### Config Updates

**Files: `config.ts`**

- `SelectionType` enum already exists (verify it has all needed values)
- No new config properties needed (mode is runtime state)

### Translations

**Files: `translations/default.ts`**

Add new translation keys:
- `resultsMode`: "Results mode"
- `createNewResults`: "Create new results"
- `addToCurrentResults`: "Add to current results"
- `removeFromCurrentResults`: "Remove from current results"
- `accumulatedResultsCount`: "Accumulated results: {count}"
- `noAccumulatedResults`: "No accumulated results"

## Debug Logging

**Debug Tag: `RESULTS-MODE`**

Add logging for:
- Mode changes
- Record merging operations
- Record removal operations
- Accumulated results updates
- Data source operations

Example log events:
- `mode-changed`: Mode selection changed
- `results-merged`: Records merged into accumulated results
- `results-removed`: Records removed from accumulated results
- `accumulated-ds-created`: Accumulated results DS created
- `accumulated-ds-cleared`: Accumulated results DS cleared

## Migration Considerations

- No migration needed (new feature, backward compatible)
- Default mode is "Create new" (current behavior)
- Existing queries continue to work as before

## Open Questions

1. **Different Origin Data Sources:**
   - What if queries use different origin layers?
   - Should we support cross-layer accumulation?
   - Or disable Add/Remove mode if origins differ?

2. **Selection Behavior:**
   - When in Add/Remove mode, should selection work on accumulated results?
   - How should "Add to Map" action work with accumulated results?

3. **Export/Data Actions:**
   - Should data actions work on accumulated results?
   - How should export handle accumulated results?

4. **Performance:**
   - What's the expected maximum accumulated results count?
   - Should we add pagination for accumulated results?
   - Should we limit accumulated results size?

## Success Criteria

1. ✅ Mode dropdown visible for all queries
2. ✅ Mode persists across queries and clear operations
3. ✅ "Add to" mode accumulates results correctly
4. ✅ "Remove from" mode removes records correctly
5. ✅ Results display correctly based on mode
6. ✅ Widget close/open behavior works with accumulated results
7. ✅ Clear results does not reset mode
8. ✅ No regressions in existing functionality

## Timeline Estimate

- **Phase 1:** State Management & Data Source Setup - 2-3 hours
- **Phase 2:** UI - Mode Dropdown - 2-3 hours
- **Phase 3:** Query Execution Logic - 3-4 hours
- **Phase 4:** Results Display - 2-3 hours
- **Phase 5:** Record Merging/Removal Logic - 3-4 hours
- **Phase 6:** Widget Lifecycle Integration - 2-3 hours
- **Phase 7:** Edge Cases & Error Handling - 2-3 hours
- **Testing:** 4-6 hours

**Total Estimate:** 20-29 hours

## Next Steps

1. Review and approve this plan
2. Address open questions
3. Create detailed technical design for data source management
4. Begin implementation with Phase 1
5. Test incrementally after each phase

