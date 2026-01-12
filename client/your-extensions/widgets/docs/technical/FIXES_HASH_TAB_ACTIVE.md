# Fix: Hash Queries Not Executing When Query Tab Not Active

**Date:** 2026-01-06  
**Version:** r018.39  
**Chunk:** Chunk 5 (Accumulated Records Management) - Blocking Bug Fix  
**Status:** ✅ **RESOLVED**

---

## Problem

When a hash parameter changed while the Results tab was active, the query did not execute. The hash value was correctly set in React state, but `SqlExpressionRuntime` did not fire `onChange` because the input element was not visible/focused when the Query tab was inactive.

### Symptoms

- Hash queries executed correctly when Query tab was active
- Hash queries did NOT execute when Results tab was active
- Value appeared in form when switching back to Query tab manually
- No `handleSqlExprObjChange-called` logs when Results tab was active

### Root Cause

The DOM manipulation that triggers `SqlExpressionRuntime`'s `onChange` only works when:
1. The Query tab is active
2. The input element is visible in the DOM
3. The input element can receive focus and events

When the Results tab is active, the input is hidden (via CSS `display: none` or similar), so:
- Simulated `input` and `change` events don't trigger `SqlExpressionRuntime`
- `SqlExpressionRuntime` doesn't process the value conversion (string → array)
- Conversion event never fires
- Query never executes

---

## Solution

**Approach:** Ensure the Query tab is active before setting hash values.

### Implementation

1. **Pass tab state to form component:**
   - Added `activeTab` and `onTabChange` props to `QueryTaskItemProps` interface
   - Passed these props from `QueryTask` to `QueryTaskForm`

2. **Check tab state before setting hash value:**
   - In the `useEffect` that sets hash values, check if `activeTab !== 'query'`
   - If not active, switch to Query tab via `onTabChange('query')`
   - Return early - the `useEffect` will re-run when `activeTab` becomes `'query'`
   - Set the hash value with `SqlExpressionRuntime` visible and ready to process it

3. **Add tab state to dependency array:**
   - Added `activeTab` and `onTabChange` to the `useEffect` dependency array
   - Ensures the effect re-runs when tab changes

### Code Changes

**`query-simple/src/runtime/query-task-form.tsx`:**
- Added `activeTab` and `onTabChange` to props interface
- Added tab check before setting hash value:
  ```typescript
  if (activeTab !== 'query' && onTabChange) {
    onTabChange('query')
    return // useEffect will re-run when tab becomes 'query'
  }
  ```
- Added `activeTab` and `onTabChange` to `useEffect` dependency array

**`query-simple/src/runtime/query-task.tsx`:**
- Passed `activeTab={activeTab}` and `onTabChange={setActiveTab}` to `QueryTaskForm`

---

## Testing

### Test Scenarios

1. **Hash query with Query tab active:**
   - ✅ Query executes immediately
   - ✅ Conversion event fires
   - ✅ Results displayed

2. **Hash query with Results tab active:**
   - ✅ Tab switches to Query tab automatically
   - ✅ Query executes after tab switch
   - ✅ Conversion event fires
   - ✅ Results displayed

3. **Hash query changes for same configId:**
   - ✅ Tab switches to Query tab if needed
   - ✅ New hash value processed correctly
   - ✅ Query executes with new value

4. **Hash query changes for different configId:**
   - ✅ Tab switches to Query tab if needed
   - ✅ Query switches correctly
   - ✅ New hash value processed correctly

### Verification Logs

Look for these log events:
- `hash-value-setting-switching-to-query-tab` - When tab switch is needed
- `hash-value-setting-start` - When hash value setting begins (after tab is active)
- `hash-value-converted-event-dispatched` - When conversion completes
- `hash-value-converted-executing-query-directly` - When query executes

---

## Impact

### Benefits

- ✅ Hash queries work regardless of active tab
- ✅ No timeouts or fallback logic needed
- ✅ Clean, deterministic execution path
- ✅ Better user experience - queries execute automatically

### Breaking Changes

None - this is a bug fix, not a breaking change.

### Performance

No performance impact - tab switching is instant, and the `useEffect` re-run is minimal overhead.

---

## Related Issues

- **Chunk 5 Migration:** This fix unblocks Chunk 5 testing, allowing hash queries to execute correctly during parallel execution verification
- **Bug Tracking:** Documented in `query-simple/BUGS.md` as `HASH-PARAM-001`

---

## Lessons Learned

1. **Component Visibility Matters:** Hidden components (via CSS or tab switching) may not respond to DOM events as expected
2. **State Before Events:** Ensure component state (like tab visibility) is correct before attempting to trigger events
3. **No Timeouts Needed:** When you control the execution path (like tab switching), you don't need timeouts or fallbacks - just ensure prerequisites are met

---

## Files Modified

- `query-simple/src/runtime/query-task-form.tsx` - Added tab check before setting hash value
- `query-simple/src/runtime/query-task.tsx` - Pass tab state props to form
- `query-simple/src/version.ts` - Incremented to r018.39
- `query-simple/BUGS.md` - Documented fix
- `COMPLETE_MIGRATION_PLAN.md` - Updated Chunk 5 status
- `CURRENT_WORK.md` - Updated current work status


