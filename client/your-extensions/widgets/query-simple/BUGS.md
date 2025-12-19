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

**Status:** ✅ RESOLVED (r017.29)  
**Priority:** Medium  
**Version:** r017.29  
**Date Updated:** 2025-12-18

### Description
URL hash parameters (like `#pin=...`) were causing the widget to reset to the first query in the display order as soon as the parameter was removed from the URL, even if the results were still active. Additionally, hash parameters were sometimes not being cleaned up correctly.

### Solution (r017.29)
Modified `QueryTaskList.tsx` to make the selection "sticky." The widget now uses the hash to *set* the active query but no longer resets to the default order when the hash is cleared. This ensures the correct query remains active for restoration when the panel is closed and reopened. The cleanup of the hash itself was also verified and improved by standardizing the selection event lifecycle.

---

## Performance Issue #1: Query Execution Speed

**Status:** 🟡 INVESTIGATION NEEDED  
**Priority:** Medium  
**Version:** r017.22  
**Date Reported:** 2025-01-19

### Description
Query execution seems slow. Need to investigate whether the slowness is:
1. In our code (widget logic, data processing, graphics layer operations)
2. In Experience Builder framework (data source queries, SQL generation)
3. In the SQL query itself (server-side performance)

### Potential Bottlenecks

1. **SQL Query Generation (Black Box)**
   - Experience Builder's SQL expression builder is a "black box"
   - May be generating inefficient SQL
   - No direct control over SQL optimization

2. **Our Code Performance**
   - Graphics layer operations (adding 121 graphics)
   - Record processing and selection
   - Data source operations
   - Multiple re-renders or unnecessary work

3. **Data Source Operations**
   - `executeQuery` and `executeCountQuery` calls
   - Data source status updates
   - Selection operations

### Next Steps to Explore

1. **Add performance timing logs**
   - Add timestamps at key points:
     - Start of `handleFormSubmit`
     - After SQL generation
     - After count query
     - After main query execution
     - After graphics layer operations
     - After selection operations
   - Calculate time spent in each phase

2. **Profile graphics layer operations**
   - Time how long it takes to:
     - Clear graphics layer
     - Add 121 graphics to layer
     - Check for duplicates
   - See if graphics operations are the bottleneck

3. **Profile data source operations**
   - Time `executeQuery` vs `executeCountQuery`
   - Check if count query is necessary or can be optimized
   - See if we can parallelize operations

4. **Check for unnecessary re-renders**
   - Use React DevTools Profiler
   - Identify components re-rendering unnecessarily
   - Optimize with React.memo, useMemo, useCallback where needed

5. **Investigate SQL query performance**
   - If possible, log the actual SQL being generated
   - Check if indexes exist on queried fields
   - See if we can optimize the query structure

6. **Batch operations where possible**
   - Graphics layer: Add all graphics at once instead of one-by-one
   - Selection: Batch selection operations
   - Data source updates: Minimize status changes

### Related Files
- `client/your-extensions/widgets/query-simple/src/runtime/query-task.tsx` - `handleFormSubmit`, query execution
- `client/your-extensions/widgets/query-simple/src/runtime/query-utils.ts` - `executeQuery`, `executeCountQuery`
- `client/your-extensions/widgets/query-simple/src/runtime/graphics-layer-utils.ts` - Graphics operations
- `client/your-extensions/widgets/query-simple/src/runtime/selection-utils.ts` - Selection operations

---

## Notes

- All bugs/issues should be tested with graphics layer highlighting enabled
- Logs are available via `createQuerySimpleDebugLogger()` - check browser console
- Version tracking: See `src/version.ts` for current version
- When fixing bugs, remember to increment minor version and rebuild (see `DEVELOPMENT_GUIDE.md`)
