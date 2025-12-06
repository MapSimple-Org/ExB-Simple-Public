/** @jsx jsx */
import { jsx, css, React, type ImmutableArray, Immutable, type ImmutableObject, hooks } from 'jimu-core'
import { Select } from 'jimu-ui'
import type { QueryItemType } from '../config'
import { QueryTask } from './query-task'
import { FOCUSABLE_CONTAINER_CLASS } from 'jimu-ui'
import defaultMessages from './translations/default'

export interface QueryTaskListProps {
  widgetId: string
  queryItems: ImmutableArray<QueryItemType>
  isInPopper?: boolean
  defaultPageSize?: number
  className?: string
  initialQueryValue?: { shortId: string, value: string }
  onHashParameterUsed?: (shortId: string) => void
}

interface GroupedQueries {
  groups: { [groupId: string]: { items: ImmutableArray<QueryItemType>, displayName: string, icon?: any } }
  ungrouped: Array<{ item: ImmutableObject<QueryItemType>, index: number }>
  groupOrder: string[]
}

// Helper function to group queries by groupId
const groupQueries = (queryItems: ImmutableArray<QueryItemType>): GroupedQueries => {
  const groups: { [groupId: string]: { items: ImmutableArray<QueryItemType>, displayName: string, icon?: any } } = {}
  const ungrouped: Array<{ item: ImmutableObject<QueryItemType>, index: number }> = []
  const groupOrder: string[] = []
  const groupIndexMap: { [groupId: string]: number } = {}
  
  // First pass: collect items in regular arrays
  const groupItemsMap: { [groupId: string]: QueryItemType[] } = {}

  queryItems.forEach((item, index) => {
    if (item.groupId) {
      if (!groupItemsMap[item.groupId]) {
        groupItemsMap[item.groupId] = []
        groups[item.groupId] = {
          items: Immutable([]),
          displayName: item.groupDisplayName || item.name || `Group ${item.groupId}`,
          icon: item.icon
        }
        groupIndexMap[item.groupId] = index
        groupOrder.push(item.groupId)
      }
      groupItemsMap[item.groupId].push(item)
    } else {
      ungrouped.push({ item, index })
    }
  })

  // Second pass: convert regular arrays to ImmutableArrays
  Object.keys(groupItemsMap).forEach(groupId => {
    groups[groupId].items = Immutable(groupItemsMap[groupId])
  })

  return { groups, ungrouped, groupOrder }
}

export function QueryTaskList (props: QueryTaskListProps) {
  const { queryItems, widgetId, defaultPageSize, isInPopper = false, className = '', initialQueryValue, onHashParameterUsed } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  
  const { groups, ungrouped, groupOrder } = React.useMemo(() => groupQueries(queryItems), [queryItems])
  
  // Find the query item matching the initialQueryValue shortId from URL hash
  const matchingQueryIndex = React.useMemo(() => {
    if (!initialQueryValue?.shortId) {
      return -1
    }
    return queryItems.findIndex(item => item.shortId === initialQueryValue.shortId)
  }, [queryItems, initialQueryValue])
  
  // Determine which group/ungrouped index the matching query is at
  // NOTE: Temporarily simplified for non-grouped mode - when re-enabling grouping, restore original logic
  const getQuerySelection = React.useMemo(() => {
    if (matchingQueryIndex < 0) return null
    
    // TEMPORARILY DISABLED: Group selection logic
    // Original code checked item.groupId and returned group vs ungrouped selection
    // For now, always return the direct index from queryItems array
    return { type: 'ungrouped' as const, index: matchingQueryIndex >= 0 ? matchingQueryIndex : 0 }
    
    // DISABLED CODE - restore when re-enabling grouping:
    // const item = queryItems[matchingQueryIndex]
    // if (item.groupId) {
    //   const groupItems = groups[item.groupId]?.items || Immutable([])
    //   const indexInGroup = groupItems.findIndex(q => q.configId === item.configId)
    //   return { type: 'group' as const, groupId: item.groupId, index: indexInGroup >= 0 ? indexInGroup : 0 }
    // } else {
    //   const indexInUngrouped = ungrouped.findIndex(({ item: q }) => q.configId === item.configId)
    //   return { type: 'ungrouped' as const, index: indexInUngrouped >= 0 ? indexInUngrouped : 0 }
    // }
  }, [matchingQueryIndex, queryItems])
  
  // Track selected query - initialize with matching query if found from URL hash
  // NOTE: Group-related state variables are kept for future use but not actively used
  // When re-enabling grouping, restore the original initialization logic
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>(() => {
    // TEMPORARILY DISABLED: Group initialization
    // Original code checked getQuerySelection?.type === 'group' and returned groupId
    // For now, always return null since grouping is disabled
    return null
  })
  const [selectedGroupQueryIndex, setSelectedGroupQueryIndex] = React.useState(() => {
    // TEMPORARILY DISABLED: Group query index initialization
    // Original code checked getQuerySelection?.type === 'group'
    // Kept for future use when grouping is re-enabled
    return 0
  })
  const [selectedUngroupedIndex, setSelectedUngroupedIndex] = React.useState(() => {
    // ACTIVE: Initialize with matching query index from URL hash, or 0
    // Note: This now works with all queries, not just ungrouped ones
    if (getQuerySelection?.type === 'ungrouped') {
      return getQuerySelection.index
    }
    return 0
  })
  
  // Update selection when initialQueryValue changes (e.g., when URL hash is detected)
  // NOTE: Temporarily simplified for non-grouped mode
  React.useEffect(() => {
    if (getQuerySelection) {
      // TEMPORARILY DISABLED: Group selection logic
      // Original code checked getQuerySelection.type === 'group' and updated group state
      // For now, only update the ungrouped index (which now represents all queries)
      setSelectedUngroupedIndex(getQuerySelection.index)
      
      // DISABLED CODE - restore when re-enabling grouping:
      // if (getQuerySelection.type === 'group') {
      //   setSelectedGroupId(getQuerySelection.groupId)
      //   setSelectedGroupQueryIndex(getQuerySelection.index)
      // } else {
      //   setSelectedGroupId(null)
      //   setSelectedUngroupedIndex(getQuerySelection.index)
      // }
    }
  }, [getQuerySelection])
  
  // Get the currently selected query item
  // NOTE: Grouping functionality temporarily disabled - see comments in render section below
  // When re-enabling grouping, restore the original logic that checks selectedGroupId and groups
  const getSelectedQueryItem = (): ImmutableObject<QueryItemType> => {
    // TEMPORARILY DISABLED: Group selection logic
    // Original code checked selectedGroupId and groups[selectedGroupId] to return grouped queries
    // For now, always use simple index-based selection from all queryItems
    
    // Simple selection: use selectedUngroupedIndex to select from all queries
    // Note: selectedUngroupedIndex is now used for all queries, not just ungrouped ones
    if (queryItems.length > 0) {
      const idx = selectedUngroupedIndex < queryItems.length ? selectedUngroupedIndex : 0
      return queryItems[idx]
    }
    // Fallback to first query item
    return queryItems[0]
  }
  
  const selectedQueryItem = getSelectedQueryItem()
  const selectedQueryRealIndex = React.useMemo(() => {
    return queryItems.findIndex(q => q.configId === selectedQueryItem.configId)
  }, [queryItems, selectedQueryItem])
  
  // If only one query total, don't show dropdown
  // NOTE: Temporarily removed groupOrder.length > 0 check since grouping is disabled
  // When re-enabling grouping, restore: queryItems.length > 1 || groupOrder.length > 0
  const showDropdown = queryItems.length > 1
  
  return (
    <div className={`runtime-query__query-list h-100 ${className}`} css={css`
      display: flex;
      flex-direction: column;
      .query-selector {
        padding: 16px;
        border-bottom: 1px solid var(--sys-color-divider-secondary);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .query-selector-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--sys-color-text-primary);
        margin-bottom: 4px;
      }
      .query-selector select {
        width: 100%;
      }
      .query-task-container {
        flex: 1;
        overflow: auto;
      }
    `}>
      {showDropdown && (
        <div className="query-selector">
          <label className="query-selector-label">
            {getI18nMessage('searchLayer')}
          </label>
          
          {/* ====================================================================
              TEMPORARILY DISABLED: Grouping UI Functionality
              ====================================================================
              
              REASON FOR DISABLING:
              The grouping functionality was partially implemented but not working correctly.
              When groupId was set, it was showing two dropdowns - one with queries and one 
              with a grouped option, causing confusion. The grouping logic needs to be 
              completed before it can be used.
              
              WHAT WAS DISABLED:
              - Group dropdown that shows when groupOrder.length > 0
              - Second dropdown for selecting queries within a group
              - Logic to separate grouped vs ungrouped queries in the UI
              
              WHAT STILL WORKS:
              - groupQueries() function still processes queries and groups them
              - groupId field in config is still available and can be set
              - All grouping state variables are still initialized (for future use)
              
              TO RE-ENABLE GROUPING:
              1. Change the condition below from `false &&` to just check `groupOrder.length > 0`
              2. Restore the original getSelectedQueryItem() logic that checks selectedGroupId
              3. Update selectedUngroupedIndex initialization to work with grouped queries
              4. Test the grouping UI thoroughly, especially:
                 - Single group scenario (should show only one dropdown)
                 - Multiple groups scenario
                 - Mixed grouped/ungrouped queries
                 - Hash parameter handling with grouped queries
              
              RELATED TODO:
              See TODO.md - "grouping-simplify-single-group-ui" for desired behavior
              ==================================================================== */}
          
          {false && groupOrder.length > 0 ? (
            // DISABLED: Group dropdown UI - see comment block above
            // This code is preserved for when grouping is re-enabled
            <>
              <Select 
                size="sm"
                value={selectedGroupId || ''} 
                onChange={(e) => {
                  const groupId = e.target.value || null
                  setSelectedGroupId(groupId)
                  if (groupId) {
                    setSelectedGroupQueryIndex(0)
                  }
                }}
              >
                {groupOrder.map(groupId => (
                  <option key={groupId} value={groupId}>
                    {groups[groupId].displayName}
                  </option>
                ))}
                {ungrouped.length > 0 && (
                  <option value="">--- Ungrouped Queries ---</option>
                )}
              </Select>
              
              {selectedGroupId && groups[selectedGroupId] && groups[selectedGroupId].items.length > 1 && (
                <Select 
                  size="sm"
                  value={selectedGroupQueryIndex} 
                  onChange={(e) => {
                    setSelectedGroupQueryIndex(parseInt(e.target.value))
                  }}
                >
                  {groups[selectedGroupId].items.map((item, idx) => (
                    <option key={item.configId} value={idx}>
                      {item.searchAlias || item.name || `Option ${idx + 1}`}
                    </option>
                  ))}
                </Select>
              )}
              
              {!selectedGroupId && ungrouped.length > 0 && (
                <Select 
                  size="sm"
                  value={selectedUngroupedIndex} 
                  onChange={(e) => {
                    setSelectedUngroupedIndex(parseInt(e.target.value))
                  }}
                >
                  {ungrouped.map(({ item }, idx) => (
                    <option key={item.configId} value={idx}>
                      {item.name || `Query ${idx + 1}`}
                    </option>
                  ))}
                </Select>
              )}
            </>
          ) : (
            // ACTIVE: Simple single dropdown showing all queries
            // This is the current active code path - shows all queries in a single dropdown
            // Note: Using queryItems directly instead of ungrouped so all queries appear
            <Select 
              size="sm"
              value={selectedUngroupedIndex} 
              onChange={(e) => {
                setSelectedUngroupedIndex(parseInt(e.target.value))
              }}
            >
              {queryItems.map((item, idx) => (
                <option key={item.configId} value={idx}>
                  {item.name || `Query ${idx + 1}`}
                </option>
              ))}
            </Select>
          )}
        </div>
      )}
      
      {/* Show selected query form directly below */}
      {selectedQueryItem && (
        <div className={`query-task-container ${isInPopper ? FOCUSABLE_CONTAINER_CLASS : ''}`}>
          <QueryTask
            widgetId={widgetId}
            index={selectedQueryRealIndex >= 0 ? selectedQueryRealIndex : 0}
            total={queryItems.length}
            queryItem={selectedQueryItem}
            defaultPageSize={defaultPageSize}
            isInPopper={isInPopper}
            initialInputValue={selectedQueryItem.shortId === initialQueryValue?.shortId ? initialQueryValue?.value : undefined}
            onHashParameterUsed={onHashParameterUsed}
            // No onNavBack - no navigation needed
          />
        </div>
      )}
    </div>
  )
}



