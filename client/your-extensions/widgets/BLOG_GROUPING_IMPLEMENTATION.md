# Implementing Query Grouping in ArcGIS Experience Builder: A Two-Dropdown Approach

## Overview

This article documents the implementation of query grouping in the QuerySimple widget for ArcGIS Experience Builder. The feature allows users to organize multiple queries into logical groups, presenting them through an intuitive two-dropdown interface that simplifies navigation while maintaining flexibility for both grouped and ungrouped queries.

## The Challenge

When building a query widget that supports multiple queries, we needed a way to:
1. **Organize related queries** - Group queries that share a common theme (e.g., "King County Parcels" queries)
2. **Maintain simplicity** - Keep the UI clean and intuitive for end users
3. **Support both grouped and ungrouped queries** - Allow queries to exist independently or within groups
4. **Preserve hash parameter functionality** - Ensure deep linking works seamlessly regardless of grouping structure
5. **Handle state synchronization** - Keep dropdowns synchronized when hash parameters trigger queries

## The Solution: Two-Dropdown Architecture

We implemented a two-dropdown system where:
- **First dropdown**: Shows all queries, grouped by display name (for grouped queries) or item name (for ungrouped queries)
- **Second dropdown**: Only appears when a grouped query is selected, showing the individual queries within that group

This approach provides a clear hierarchy while keeping ungrouped queries simple (single dropdown only).

## Implementation Details

### Data Structure

Each query item can have optional grouping properties:

```typescript
interface QueryItemType {
  configId: string
  name: string
  groupId?: string              // Optional: Groups queries together
  groupDisplayName?: string    // Optional: Display name for the group
  searchAlias?: string          // Optional: Display name for individual query in group
  shortId: string              // Required: Hash parameter identifier
  // ... other properties
}
```

### Grouping Logic

The grouping system processes queries into two categories:

1. **Grouped queries**: Queries with a `groupId` are organized by `groupDisplayName`
2. **Ungrouped queries**: Queries without a `groupId` are displayed individually

```typescript
// Group queries by groupId
const groups: Record<string, GroupInfo> = {}
const ungrouped: Array<{ item: QueryItemType, index: number }> = []

queryItems.forEach((item, index) => {
  if (item.groupId) {
    if (!groups[item.groupId]) {
      groups[item.groupId] = {
        displayName: item.groupDisplayName || item.groupId,
        items: []
      }
    }
    groups[item.groupId].items.push(item)
  } else {
    ungrouped.push({ item, index })
  }
})
```

### First Dropdown: All Queries

The first dropdown displays:
- **Grouped queries**: One option per group, showing the `groupDisplayName`
- **Ungrouped queries**: One option per query, showing the `item.name`

```typescript
const queryOptions: Array<{
  configId: string
  displayName: string
  groupId: string | null
  index: number
}> = []

// Add grouped queries (one option per group)
Object.entries(groups).forEach(([groupId, groupInfo]) => {
  queryOptions.push({
    configId: groupInfo.items[0].configId, // Use first item's configId
    displayName: groupInfo.displayName,
    groupId,
    index: -1 // Group index
  })
})

// Add ungrouped queries (one option per query)
ungrouped.forEach(({ item, index }) => {
  queryOptions.push({
    configId: item.configId,
    displayName: item.name, // Use item.name, not searchAlias
    groupId: null,
    index
  })
})
```

**Key Design Decision**: For ungrouped queries, we use `item.name` instead of `getQueryDisplayName(item)` (which prioritizes `searchAlias` or `jimuFieldName`). This ensures consistency and clarity in the first dropdown.

### Second Dropdown: Group Queries

The second dropdown only appears when a grouped query is selected in the first dropdown. It shows all queries within that group, using `searchAlias` if available, otherwise falling back to `jimuFieldName`:

```typescript
{isGroupedQuery && currentQueryGroupId && groups && groups[currentQueryGroupId] && (
  <Select 
    value={selectedGroupQueryIndex !== undefined ? selectedGroupQueryIndex : 0}
    onChange={(e) => {
      const newIndex = parseInt(e.target.value)
      if (onGroupQueryChange) {
        onGroupQueryChange(newIndex)
      }
    }}
  >
    {groups[currentQueryGroupId].items.map((item, idx) => (
      <option key={item.configId} value={idx}>
        {getQueryDisplayName(item)} {/* Uses searchAlias or jimuFieldName */}
      </option>
    ))}
  </Select>
)}
```

The `getQueryDisplayName()` helper function prioritizes display names:

```typescript
function getQueryDisplayName(item: QueryItemType): string {
  // Priority: searchAlias > jimuFieldName > fallback
  if (item.searchAlias) {
    return item.searchAlias
  }
  
  const jimuFieldName = item.sqlExprObj?.parts?.[0]?.jimuFieldName
  if (jimuFieldName) {
    return jimuFieldName
  }
  
  return item.name || 'Query'
}
```

### State Management

The component manages several pieces of state:

```typescript
const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
const [selectedGroupQueryIndex, setSelectedGroupQueryIndex] = useState<number>(0)
const [selectedUngroupedIndex, setSelectedUngroupedIndex] = useState<number>(0)
```

**State Selection Logic**: The `getSelectedQueryItem()` function determines which query is currently selected, with priority given to hash-matched queries:

```typescript
const getSelectedQueryItem = (): ImmutableObject<QueryItemType> => {
  // PRIORITY 1: If hash parameter matches a query, use that directly
  // This ensures we always use the hash-matched query, regardless of state
  if (getQuerySelection && matchingQueryIndex >= 0) {
    const hashMatchedItem = queryItems[matchingQueryIndex]
    return hashMatchedItem
  }
  
  // PRIORITY 2: Otherwise use current state selection
  if (selectedGroupId && groups[selectedGroupId]) {
    const groupItems = groups[selectedGroupId].items
    const idx = selectedGroupQueryIndex < groupItems.length ? selectedGroupQueryIndex : 0
    return groupItems[idx]
  }
  
  // Otherwise, get from ungrouped queries
  if (ungrouped.length > 0) {
    const idx = selectedUngroupedIndex < ungrouped.length ? selectedUngroupedIndex : 0
    return ungrouped[idx].item
  }
  
  // Fallback to first query item
  return queryItems[0]
}
```

### Hash Parameter Integration

Hash parameters work seamlessly with grouping. When a hash parameter like `#pin=2223059013` is detected:

1. **Query Matching**: The system finds the query with matching `shortId`
2. **State Synchronization**: If the query is grouped, both dropdowns are set correctly:
   - First dropdown: Set to the group containing the query
   - Second dropdown: Set to the specific query within the group
3. **Query Execution**: The query executes with the correct data source and parameters

```typescript
// Hash parameter detection prioritizes matching query
const matchingQueryIndex = queryItems.findIndex(item => 
  item.shortId === initialQueryValue?.shortId
)

if (matchingQueryIndex >= 0) {
  const matchedItem = queryItems[matchingQueryIndex]
  
  if (matchedItem.groupId) {
    // Set group selection
    setSelectedGroupId(matchedItem.groupId)
    // Find index within group
    const groupItems = groups[matchedItem.groupId].items
    const groupIndex = groupItems.findIndex(item => 
      item.configId === matchedItem.configId
    )
    setSelectedGroupQueryIndex(groupIndex >= 0 ? groupIndex : 0)
  } else {
    // Set ungrouped selection
    setSelectedGroupId(null)
    const ungroupedIndex = ungrouped.findIndex(({ item }) => 
      item.configId === matchedItem.configId
    )
    setSelectedUngroupedIndex(ungroupedIndex >= 0 ? ungroupedIndex : 0)
  }
}
```

### Dropdown Synchronization Verification

To ensure dropdowns stay synchronized with hash parameters, we added verification logging:

```typescript
React.useEffect(() => {
  // Only verify if we have a hash parameter
  if (!initialInputValue || !queryItem.shortId) {
    return
  }
  
  // Verify the current queryItem matches the hash parameter's shortId
  if (queryItem.shortId !== queryItemShortId) {
    debugLogger.log('GROUP', {
      event: 'dropdown-verification-failed',
      expectedShortId: queryItemShortId,
      actualShortId: queryItem.shortId,
      warning: 'Dropdowns may not be synchronized with hash parameter'
    })
  }
}, [initialInputValue, queryItemShortId, queryItem.shortId])
```

## User Experience

### Ungrouped Queries

For ungrouped queries, users see a single dropdown:
- **Label**: "Search Layer"
- **Options**: List of all ungrouped queries by name
- **Behavior**: Selecting a query immediately switches to it

### Grouped Queries

For grouped queries, users see two dropdowns:
- **First Dropdown** (Label: "Search Layer"):
  - Shows group display name (e.g., "King County Parcels")
  - Selecting a group reveals the second dropdown
  
- **Second Dropdown** (Label: "Search Alias"):
  - Shows individual queries within the selected group
  - Uses `searchAlias` if available, otherwise `jimuFieldName`
  - Selecting a query switches to that specific query

### Visual Hierarchy

The UI maintains clear visual hierarchy:
- Dropdowns are separated with borders
- Consistent padding and spacing
- Labels clearly indicate the purpose of each dropdown
- Second dropdown only appears when relevant (grouped query selected)

## Code Examples

### Rendering the Dropdowns

```typescript
<>
  {/* First Dropdown: All queries */}
  <div css={css`
    padding: 16px;
    border-bottom: 1px solid var(--sys-color-divider-secondary);
    flex-shrink: 0;
  `}>
    <label>Search Layer</label>
    <Select 
      value={currentOptionIndex >= 0 ? currentOptionIndex : 0}
      onChange={(e) => {
        const optionIndex = parseInt(e.target.value)
        const selectedOption = queryOptions[optionIndex]
        
        if (selectedOption.groupId) {
          // Grouped query selected
          onGroupChange(selectedOption.groupId)
          onGroupQueryChange(0) // Reset to first query in group
        } else {
          // Ungrouped query selected
          onGroupChange(null)
          onUngroupedChange(selectedOption.index)
        }
      }}
    >
      {queryOptions.map((option, idx) => (
        <option key={option.configId} value={idx}>
          {option.displayName}
        </option>
      ))}
    </Select>
  </div>
  
  {/* Second Dropdown: Queries within selected group */}
  {isGroupedQuery && currentQueryGroupId && groups[currentQueryGroupId] && (
    <div css={css`
      padding: 16px;
      border-bottom: 1px solid var(--sys-color-divider-secondary);
      flex-shrink: 0;
    `}>
      <label>Search Alias</label>
      <Select 
        value={selectedGroupQueryIndex !== undefined ? selectedGroupQueryIndex : 0}
        onChange={(e) => {
          const newIndex = parseInt(e.target.value)
          onGroupQueryChange(newIndex)
        }}
      >
        {groups[currentQueryGroupId].items.map((item, idx) => (
          <option key={item.configId} value={idx}>
            {getQueryDisplayName(item)}
          </option>
        ))}
      </Select>
    </div>
  )}
</>
```

## Key Design Decisions

### 1. Two-Dropdown Approach

**Why**: Provides clear hierarchy and reduces cognitive load compared to a single flat list or nested menus.

**Alternative Considered**: Single dropdown with indentation or separators. Rejected because it's harder to scan and doesn't scale well.

### 2. Group Display Name Priority

**Why**: Groups represent logical collections, so the group name should be prominent in the first dropdown.

**Implementation**: Use `groupDisplayName` for groups, `item.name` for ungrouped queries.

### 3. Search Alias for Second Dropdown

**Why**: Within a group, queries are differentiated by their search field, so `searchAlias` (or `jimuFieldName`) is more meaningful than the item name.

**Implementation**: `getQueryDisplayName()` prioritizes `searchAlias` > `jimuFieldName` > `item.name`.

### 4. Hash Parameter Priority

**Why**: Hash parameters represent user intent (deep linking), so they should override UI state.

**Implementation**: `getSelectedQueryItem()` checks hash-matched queries first, then falls back to state.

### 5. Conditional Second Dropdown

**Why**: Ungrouped queries don't need a second dropdown, keeping the UI simple.

**Implementation**: Second dropdown only renders when `isGroupedQuery && currentQueryGroupId` is true.

## Testing Considerations

When implementing grouping, test:

1. **Hash Parameter Scenarios**:
   - Hash parameter for grouped query
   - Hash parameter for ungrouped query
   - Switching between hash parameters
   - Hash parameter after clearing results

2. **Dropdown Interactions**:
   - Selecting group in first dropdown
   - Selecting query in second dropdown
   - Switching from grouped to ungrouped query
   - Switching from ungrouped to grouped query

3. **State Synchronization**:
   - Dropdowns match selected query
   - Dropdowns match hash parameter
   - State persists when switching tabs
   - State resets correctly when clearing results

4. **Edge Cases**:
   - All queries grouped
   - All queries ungrouped
   - Mixed grouped and ungrouped queries
   - Single query in a group
   - Missing `groupDisplayName` or `searchAlias`

## Lessons Learned

1. **State Management Complexity**: Managing multiple dropdown states requires careful coordination. Using a priority-based selection function (`getSelectedQueryItem()`) helps ensure consistency.

2. **Hash Parameter Integration**: Hash parameters must work seamlessly with grouping. Prioritizing hash-matched queries ensures deep linking works correctly.

3. **Display Name Strategy**: Different contexts need different display names. Groups use `groupDisplayName`, ungrouped queries use `item.name`, and grouped query items use `searchAlias`.

4. **User Experience**: Conditional rendering (showing second dropdown only when needed) keeps the UI clean and intuitive.

5. **Verification Logging**: Adding verification checks helps diagnose synchronization issues during development and testing.

## Future Enhancements

Potential improvements to consider:

1. **Nested Groups**: Support for groups within groups (requires more complex UI)
2. **Group Icons**: Visual indicators for groups in the dropdown
3. **Group Descriptions**: Tooltips or descriptions for groups
4. **Keyboard Navigation**: Improved keyboard support for dropdown navigation
5. **Search/Filter**: Ability to search queries within groups
6. **Drag-and-Drop Reordering**: Allow users to reorder queries within groups

## Conclusion

The two-dropdown grouping implementation provides a clean, intuitive way to organize queries while maintaining simplicity for ungrouped queries. By prioritizing hash parameters and carefully managing state synchronization, we ensure that deep linking works seamlessly regardless of grouping structure.

The implementation demonstrates:
- **Clear separation of concerns**: Grouping logic separated from UI rendering
- **Flexible data model**: Supports both grouped and ungrouped queries
- **User-centric design**: Conditional UI reduces complexity when not needed
- **Robust state management**: Priority-based selection ensures consistency

This pattern can be adapted for other widgets that need to organize and present hierarchical data in a user-friendly way.

---

*Last Updated: January 2025*  
*Based on QuerySimple widget implementation for ArcGIS Experience Builder*

