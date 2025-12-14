# Opting for Simple over Lazy: Why We Switched from Lazy Loading to Simple List Rendering

**Status:** ✅ Complete  
**Date:** December 2025  
**Widget:** QuerySimple for ArcGIS Experience Builder  
**Version:** v1.19.0-r016

## The Journey: From Lazy Loading to Simple Rendering

This blog post documents our journey from trying to fix lazy loading issues to ultimately deciding that **simple is better**. We started by attempting to preserve scroll position in lazy-loaded lists, but after encountering numerous edge cases and complexity, we made the pragmatic decision to switch to rendering all records at once - a much simpler and more reliable approach.

## The Original Problem

When users removed records from the middle of a lazy-loaded results list, the scroll position would reset to the top. This was a frustrating UX issue - users would scroll down, remove a record, and suddenly find themselves back at the top of the list, losing their place.

### The Symptoms

- User scrolls down to record #50 in a list of 121 results
- User removes record #25 (from the middle)
- Scroll position jumps back to the top (record #1)
- User has to scroll back down to find their place

This happened consistently when:
- Removing records using the "X" button in the Results tab
- Records were filtered out (removed from display)
- The list was using lazy loading (loading records as user scrolls)

## Root Cause Analysis

The issue stemmed from how React handles re-renders and how browsers manage scroll position:

1. **State Updates Trigger Re-renders**: When a record was removed, `removedRecordIds` state updated, causing `filteredRecordsForList` to recalculate
2. **New Array Reference**: Even though the content was memoized, filtering created a new array reference
3. **LazyList Receives New Props**: The `records` prop changed, triggering `useEffect` hooks
4. **Scroll Reset Logic**: The `useEffect` that handled `records` changes was resetting scroll position unconditionally

### The Original Code

```typescript
// This useEffect ran whenever records changed
React.useEffect(() => {
  setDataItems(records)
  // Scroll was being reset here or in another effect
}, [records])
```

The problem: This effect ran on **every** records change, including when records were filtered/removed, not just on new queries.

## The Solution: Separate Concerns

The key insight: **Scroll should only reset on a new query, not when records are filtered or removed.**

### Step 1: Separate Scroll Reset Logic

We split the `useEffect` hooks into two distinct concerns:

1. **Update data items** when records change (filtering, removal, etc.) - **preserve scroll**
2. **Reset scroll** only when `resultCount` changes (new query)

```typescript
// Update dataItems when records change (filtering, etc.) - Preserve scroll position
React.useEffect(() => {
  // Check if records have actually changed by comparing IDs
  const currentRecordIds = records?.map(r => r.getId()) || []
  const previousRecordIds = previousRecordIdsRef.current || []
  const recordsChanged = currentRecordIds.length !== previousRecordIds.length ||
    currentRecordIds.some((id, index) => id !== previousRecordIds[index])
  
  if (recordsChanged) {
    // Capture current scroll position before updating
    scrollPosRef.current = resultContainerRef.current?.scrollTop || 0
    setDataItems(records)
    previousRecordIdsRef.current = currentRecordIds
  }
}, [records])

// Only reset scroll when resultCount changes (new query)
React.useEffect(() => {
  pageRef.current = 1
  if (resultContainerRef.current) {
    resultContainerRef.current.scrollTop = 0
  }
  // Reset previous record IDs when resultCount changes (new query)
  previousRecordIdsRef.current = []
  scrollPosRef.current = 0
}, [resultCount])
```

### Step 2: Restore Scroll Position Synchronously

We used `useLayoutEffect` to restore scroll position **synchronously** after DOM updates but **before** the browser paints:

```typescript
// Restore scroll position synchronously after DOM updates but before paint
React.useLayoutEffect(() => {
  if (scrollPosRef.current > 0 && resultContainerRef.current) {
    const container = resultContainerRef.current
    const maxScroll = container.scrollHeight - container.clientHeight
    // Clamp scroll position to valid range to prevent browser from resetting
    const clampedScroll = Math.min(scrollPosRef.current, Math.max(0, maxScroll))
    container.scrollTop = clampedScroll
    scrollPosRef.current = 0 // Reset after restoring
  }
})
```

### Why `useLayoutEffect`?

- **`useEffect`**: Runs **after** paint - too late, browser may have already adjusted scroll
- **`useLayoutEffect`**: Runs **synchronously** after DOM mutations but **before** paint - perfect timing for scroll restoration

### Why Clamp Scroll Position?

When a record is removed from the middle:
- Content height decreases
- The old scroll position might exceed the new maximum scroll height
- Browser may reset scroll to top if position is invalid

**Solution:** Clamp scroll position to valid range:
```typescript
const maxScroll = container.scrollHeight - container.clientHeight
const clampedScroll = Math.min(scrollPosRef.current, Math.max(0, maxScroll))
```

This ensures we never try to scroll past the end of the content.

## Implementation Details

### Tracking Record Changes

We track record changes by comparing IDs, not array references:

```typescript
const previousRecordIdsRef = useRef<string[]>([])

// Check if records have actually changed by comparing IDs
const currentRecordIds = records?.map(r => r.getId()) || []
const previousRecordIds = previousRecordIdsRef.current || []
const recordsChanged = currentRecordIds.length !== previousRecordIds.length ||
  currentRecordIds.some((id, index) => id !== previousRecordIds[index])
```

This prevents unnecessary updates when the array reference changes but content is the same.

### Scroll Position Capture and Restoration

```typescript
const scrollPosRef = useRef<number>(0)

// Capture scroll position before updating
scrollPosRef.current = resultContainerRef.current?.scrollTop || 0

// Restore scroll position synchronously
React.useLayoutEffect(() => {
  if (scrollPosRef.current > 0 && resultContainerRef.current) {
    // ... restore logic
  }
})
```

## What Didn't Work

### Attempt 1: `requestAnimationFrame` in `useEffect`

**Problem:** `requestAnimationFrame` runs after paint, so browser may have already reset scroll.

**Why it failed:** Too late in the render cycle.

### Attempt 2: Restoring Scroll in Same `useEffect`

**Problem:** React batches state updates, so scroll restoration happened before DOM was updated.

**Why it failed:** DOM wasn't ready when we tried to restore scroll.

### Attempt 3: Not Clamping Scroll Position

**Problem:** When content height changed, old scroll position could be invalid.

**Why it failed:** Browser would reset scroll to top if position exceeded maximum.

## Key Learnings

1. **Separate Concerns**: Scroll reset logic should be separate from data update logic
2. **Use `useLayoutEffect` for DOM Synchronization**: When you need to read/write DOM synchronously before paint
3. **Clamp Values**: Always validate scroll positions against actual content dimensions
4. **Track Changes by Content, Not References**: Compare IDs/values, not array references
5. **Only Reset on Intentional Changes**: Reset scroll on new queries, preserve on filtering/removal

## The Result

Users can now:
- ✅ Scroll down to any position in the results list
- ✅ Remove records from anywhere (beginning, middle, end)
- ✅ Maintain their scroll position
- ✅ Continue working without losing their place

## Code Pattern

Here's the complete pattern for preserving scroll position in dynamic lists:

```typescript
const previousRecordIdsRef = useRef<string[]>([])
const scrollPosRef = useRef<number>(0)

// Update dataItems when records change (filtering, etc.) - Preserve scroll position
React.useEffect(() => {
  const currentRecordIds = records?.map(r => r.getId()) || []
  const previousRecordIds = previousRecordIdsRef.current || []
  const recordsChanged = currentRecordIds.length !== previousRecordIds.length ||
    currentRecordIds.some((id, index) => id !== previousRecordIds[index])
  
  if (recordsChanged) {
    // Capture current scroll position before updating
    scrollPosRef.current = resultContainerRef.current?.scrollTop || 0
    setDataItems(records)
    previousRecordIdsRef.current = currentRecordIds
  }
}, [records])

// Restore scroll position synchronously after DOM updates but before paint
React.useLayoutEffect(() => {
  if (scrollPosRef.current > 0 && resultContainerRef.current) {
    const container = resultContainerRef.current
    const maxScroll = container.scrollHeight - container.clientHeight
    const clampedScroll = Math.min(scrollPosRef.current, Math.max(0, maxScroll))
    container.scrollTop = clampedScroll
    scrollPosRef.current = 0
  }
})

// Only reset scroll when resultCount changes (new query)
React.useEffect(() => {
  pageRef.current = 1
  if (resultContainerRef.current) {
    resultContainerRef.current.scrollTop = 0
  }
  previousRecordIdsRef.current = []
  scrollPosRef.current = 0
}, [resultCount])
```

## The Pivot: Why We Switched to SimpleList

After implementing scroll preservation fixes for lazy loading, we continued to encounter edge cases and complexity:

- Scroll position would still reset occasionally ("every now and then")
- Expand/collapse state management was complex with lazy loading
- Record removal required careful state synchronization
- Multiple data sources in accumulation mode added complexity
- The "spinny thing" (loading indicator) appeared unnecessarily when scrolling

### The Decision: Simple Over Lazy

We made the pragmatic decision: **Force SimpleList everywhere and remove lazy loading entirely.**

**Why SimpleList is Better:**
- ✅ **Simpler code**: No complex scroll preservation logic needed
- ✅ **Fewer bugs**: No edge cases with scroll position, expand/collapse, or record removal
- ✅ **Better UX**: No loading indicators, instant rendering, predictable behavior
- ✅ **Easier to maintain**: Less state management, fewer moving parts
- ✅ **Works reliably**: No race conditions or timing issues

**Trade-offs:**
- ⚠️ **Performance**: Renders all records at once (but modern browsers handle 1000+ records easily)
- ⚠️ **Memory**: All records in DOM (but acceptable for typical use cases)

### Implementation

We forced `PagingType.Simple` in the runtime code, ignoring widget configuration:

```typescript
// FORCE SimpleList - ignore config, we're done with lazy loading issues
const pagingType = PagingType.Simple
```

We also updated query execution to fetch all records (up to maxRecordCount) instead of just a page:

```typescript
// Fetch ALL records, not just a page
const maxRecordCount = (featureDS as any).getMaxRecordCount?.() ?? 10000
let pageSize = maxRecordCount
```

**Result:** Way fewer issues. Way easier to deal with. Much more stable.

## Related Files

- `query-simple/src/runtime/simple-list.tsx` - Simple list component (renders all records)
- `query-simple/src/runtime/query-result.tsx` - Results display component (forces SimpleList)
- `query-simple/src/runtime/query-task.tsx` - Query execution (fetches all records)

## Conclusion

While we initially tried to fix lazy loading scroll issues with complex scroll preservation logic, we ultimately realized that **simple is better**. By switching to SimpleList and rendering all records at once, we eliminated countless edge cases and complexity, resulting in a much more stable and maintainable solution.

**Key Takeaway:** Sometimes the best solution is to simplify, not to add more complexity. Lazy loading seemed like a good idea for performance, but the complexity it introduced wasn't worth it. SimpleList is easier to deal with, has way fewer issues, and provides a better user experience.

The lesson: **Don't optimize prematurely.** Simple solutions are often better than complex ones, especially when the complexity introduces more problems than it solves.

