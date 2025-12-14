# The Small Feature That's a Big Deal: Query Display Order

**Status:** ✅ Complete  
**Date:** December 2025  
**Widget:** QuerySimple for ArcGIS Experience Builder  
**Version:** v1.19.0-r016.7

## The Problem: Managing Query Order at Scale

Imagine you have 15-20 queries configured in your QuerySimple widget. You've spent time setting up each one:
- Configuring data sources
- Setting up attribute filters
- Customizing labels and descriptions
- Setting up hash parameters (shortIds)
- Testing each query

Then you create a new query that you want to appear at the top of the list. What are your options?

### Option 1: Manual Config Editing
- Open the widget's config JSON
- Find the `queryItems` array
- Manually reorder the items
- Hope you don't break anything
- Risk: Easy to make mistakes, lose work, or break the widget

### Option 2: Recreate All Queries
- Delete all queries
- Recreate them in the desired order
- Reconfigure everything
- Retest everything
- Risk: Time-consuming, error-prone, frustrating

### Option 3: Live With It
- Just accept that your new query is at the bottom
- Users have to scroll through 15-20 queries to find it
- Risk: Poor user experience

**None of these options are good.**

## The Solution: Optional Display Order

We added a simple, optional `order` field to each query item. That's it. Just a number.

### How It Works

1. **Optional Field**: Each query can have an optional `order` number
2. **Lower Numbers First**: Queries with lower order values appear first
3. **Preserve Original Order**: Queries without an order maintain their original relative positions
4. **Smart Default Selection**: The widget automatically selects the query with the lowest order value

### Example

You have these queries:
- Parcels by PIN (no order)
- Parcels by Major (no order)
- Trails by Name (no order)
- Addresses by Street (no order)

You create a new query "Recent Sales" and want it at the top:
- Set `order: 1` for "Recent Sales"
- Done!

**Result:**
- Recent Sales (order: 1) ← appears first
- Parcels by PIN (no order)
- Parcels by Major (no order)
- Trails by Name (no order)
- Addresses by Street (no order)

### Multiple Ordered Queries

You can set orders for multiple queries:
- Recent Sales: `order: 1`
- Popular Trails: `order: 2`
- Parcels by PIN (no order)
- Parcels by Major (no order)

**Result:**
- Recent Sales (order: 1)
- Popular Trails (order: 2)
- Parcels by PIN (no order)
- Parcels by Major (no order)

## Implementation Details

### Config Structure

```typescript
export interface QueryItemType {
  configId: string
  name?: string
  // ... other fields ...
  order?: number  // Optional display order (lower numbers appear first)
}
```

### Sorting Logic

```typescript
function sortQueryItemsByOrder(queryItems: ImmutableArray<QueryItemType>): ImmutableArray<QueryItemType> {
  const itemsArray = (queryItems && typeof queryItems.toArray === 'function') 
    ? queryItems.toArray() 
    : (Array.isArray(queryItems) ? queryItems : [])
  
  const itemsWithIndex = itemsArray.map((item, index) => ({ item, originalIndex: index }))
  itemsWithIndex.sort((a, b) => {
    const orderA = a.item.order ?? Infinity
    const orderB = b.item.order ?? Infinity
    if (orderA !== orderB) {
      return orderA - orderB
    }
    // If order is equal, maintain original index order
    return a.originalIndex - b.originalIndex
  })
  return Immutable(itemsWithIndex.map(({ item }) => item))
}
```

**Key Points:**
- Queries with `order` values are sorted by order (lower numbers first)
- Queries without `order` (treated as `Infinity`) maintain their original relative positions
- If two queries have the same order, original index order is preserved

### Default Selection Logic

The widget also respects display order when selecting the default query:

```typescript
// Compare first ungrouped query vs first query in first group
const firstUngroupedOrder = ungrouped.length > 0 ? (ungrouped[0].item.order ?? Infinity) : Infinity
const firstGroupOrder = groupOrder.length > 0 && groups[groupOrder[0]]?.items?.length > 0
  ? (groups[groupOrder[0]].items[0].order ?? Infinity)
  : Infinity

// Select whichever has lower order (or first if equal)
if (firstUngroupedOrder < firstGroupOrder) {
  return { type: 'ungrouped', index: 0 }
} else if (firstGroupOrder < Infinity || groupOrder.length > 0) {
  return { type: 'group', groupId: groupOrder[0], index: 0 }
}
```

This ensures that if you set a query's order to 1, it will not only appear first in the list but also be selected by default when the widget loads.

## User Interface

The display order field appears in the query item settings panel:

- **Location**: After "Search Alias" section
- **Type**: Number input
- **Optional**: Leave empty to maintain default order
- **Description**: "Lower numbers appear first. Leave empty to maintain default order."

## Real-World Impact

### Before Display Order

**Scenario:** You have 20 queries and want to add a new "Featured Search" at the top.

**Time Required:**
- Manual config editing: 10-15 minutes (risky)
- Recreating queries: 30-60 minutes (tedious)
- Or: Live with poor UX

**Risk:** High chance of breaking something or losing configuration

### After Display Order

**Scenario:** Same - you have 20 queries and want to add a new "Featured Search" at the top.

**Time Required:**
- Set `order: 1` on new query: 10 seconds
- Done!

**Risk:** None - it's just a number field

## Why This Matters

This feature seems small, but it solves a real pain point:

1. **Scalability**: As you add more queries, managing order becomes critical
2. **Time Savings**: Saves hours of manual work
3. **Risk Reduction**: No need to manually edit config or recreate queries
4. **User Experience**: Important queries can be prioritized without technical knowledge
5. **Flexibility**: You can reorder anytime without affecting other queries

## Related Features

### Hash Parameter Info Button

We also added an info button next to layer titles that shows hash parameter search options. This makes the deep linking capability discoverable to end users:

- **Location**: Next to layer title (e.g., "King County Parcels")
- **Trigger**: Only appears when queries from that layer have shortIds configured
- **Content**: Lists all available shortIds with usage examples
- **Format**: "This layer can be searched using the shortIds pin and major using #shortId=value in the URL"

**Example Tooltip:**
```
This layer can be searched using the shortIds pin and major using #shortId=value in the URL.

Parcel number: #pin=value
Major number: #major=value
```

This complements the display order feature by making hash parameter search discoverable, which is especially useful when you've prioritized certain queries with display order.

## Code Pattern

Here's the complete pattern for implementing display order:

```typescript
// 1. Add order field to config
export interface QueryItemType {
  // ... other fields ...
  order?: number
}

// 2. Sort queries before displaying
const sortedQueryItems = React.useMemo(() => {
  if (!queryItems) return Immutable([])
  return sortQueryItemsByOrder(queryItems)
}, [queryItems])

// 3. Use sorted queries for grouping and display
const { groups, ungrouped, groupOrder } = React.useMemo(() => 
  groupQueries(sortedQueryItems), 
  [sortedQueryItems]
)

// 4. Respect order in default selection
const getDefaultSelection = React.useMemo(() => {
  const firstUngroupedOrder = ungrouped.length > 0 
    ? (ungrouped[0].item.order ?? Infinity) 
    : Infinity
  const firstGroupOrder = groupOrder.length > 0 && groups[groupOrder[0]]?.items?.length > 0
    ? (groups[groupOrder[0]].items[0].order ?? Infinity)
    : Infinity
  
  if (firstUngroupedOrder < firstGroupOrder) {
    return { type: 'ungrouped', index: 0 }
  } else if (firstGroupOrder < Infinity || groupOrder.length > 0) {
    return { type: 'group', groupId: groupOrder[0], index: 0 }
  }
  return null
}, [ungrouped, groups, groupOrder])
```

## Key Learnings

1. **Small Features Can Have Big Impact**: A simple number field saves hours of manual work
2. **Optional is Better**: Making it optional means no breaking changes and backward compatibility
3. **Preserve Original Order**: Queries without order maintain their positions, so existing configs work unchanged
4. **Think About Defaults**: Default selection should also respect order for best UX
5. **User Discovery**: Info buttons help users discover features (like hash parameter search)

## Conclusion

Display order might seem like a small feature, but when you're managing 15-20+ queries, it's a game-changer. Instead of diving into config editing or recreating queries, you simply set a number. That's it.

Combined with the hash parameter info button, users can now:
- Prioritize important queries with display order
- Discover hash parameter search capabilities
- Have a better overall experience

Sometimes the smallest features make the biggest difference.

## Related Files

- `query-simple/src/config.ts` - Added `order?: number` to `QueryItemType`
- `query-simple/src/setting/query-item-main-mode.tsx` - Display order UI control
- `query-simple/src/runtime/query-task-list.tsx` - Sorting and default selection logic
- `query-simple/src/runtime/query-task.tsx` - Hash parameter info button

