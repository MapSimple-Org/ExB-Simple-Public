/** @jsx jsx */
import { jsx, css, React, type ImmutableArray, Immutable, type ImmutableObject, hooks, type FeatureLayerDataSource, type FeatureDataRecord } from 'jimu-core'
import { Select } from 'jimu-ui'
import type { QueryItemType, SelectionType } from '../config'
import { QueryTask } from './query-task'
import { FOCUSABLE_CONTAINER_CLASS } from 'jimu-ui'
import defaultMessages from './translations/default'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

export interface QueryTaskListProps {
  widgetId: string
  queryItems: ImmutableArray<QueryItemType>
  isInPopper?: boolean
  defaultPageSize?: number
  className?: string
  initialQueryValue?: { shortId: string, value: string }
  onHashParameterUsed?: (shortId: string) => void
  resultsMode?: SelectionType
  onResultsModeChange?: (mode: SelectionType) => void
  accumulatedRecords?: FeatureDataRecord[]
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
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

// Helper function to get display name for query in dropdown
// Uses: searchAlias || jimuFieldName || item.name || fallback
const getQueryDisplayName = (item: ImmutableObject<QueryItemType>): string => {
  // First priority: searchAlias if set
  if (item.searchAlias) {
    return item.searchAlias
  }
  
  // Second priority: field name from SQL expression
  const jimuFieldName = item.sqlExprObj?.parts?.[0]?.jimuFieldName
  if (jimuFieldName) {
    return jimuFieldName
  }
  
  // Third priority: item name
  if (item.name) {
    return item.name
  }
  
  // Fallback
  return 'Query'
}

export function QueryTaskList (props: QueryTaskListProps) {
  const { queryItems, widgetId, defaultPageSize, isInPopper = false, className = '', initialQueryValue, onHashParameterUsed, resultsMode, onResultsModeChange, accumulatedRecords, onAccumulatedRecordsChange } = props
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
  const getQuerySelection = React.useMemo(() => {
    if (matchingQueryIndex < 0) return null
    
    const item = queryItems[matchingQueryIndex]
    if (item.groupId) {
      const groupItems = groups[item.groupId]?.items || Immutable([])
      const indexInGroup = groupItems.findIndex(q => q.configId === item.configId)
      debugLogger.log('GROUP', {
        event: 'hash-query-found-in-group',
        groupId: item.groupId,
        indexInGroup: indexInGroup >= 0 ? indexInGroup : 0,
        queryItemConfigId: item.configId,
        queryItemShortId: item.shortId
      })
      return { type: 'group' as const, groupId: item.groupId, index: indexInGroup >= 0 ? indexInGroup : 0 }
    } else {
      // Ungrouped query
      const indexInUngrouped = ungrouped.findIndex(({ item: q }) => q.configId === item.configId)
      debugLogger.log('GROUP', {
        event: 'hash-query-found-ungrouped',
        indexInUngrouped: indexInUngrouped >= 0 ? indexInUngrouped : 0,
        queryItemConfigId: item.configId,
        queryItemShortId: item.shortId
      })
      return { type: 'ungrouped' as const, index: indexInUngrouped >= 0 ? indexInUngrouped : 0 }
    }
  }, [matchingQueryIndex, queryItems, groups, ungrouped])
  
  // Track selected query - initialize with matching query if found from URL hash
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | null>(() => {
    if (getQuerySelection?.type === 'group') {
      debugLogger.log('GROUP', {
        event: 'initial-group-selection',
        groupId: getQuerySelection.groupId
      })
      return getQuerySelection.groupId
    }
    // Default to first group if groups exist and no hash parameter
    if (groupOrder.length > 0) {
      debugLogger.log('GROUP', {
        event: 'initial-group-selection-default',
        groupId: groupOrder[0],
        note: 'No hash parameter, defaulting to first group'
      })
      return groupOrder[0]
    }
    return null
  })
  const [selectedGroupQueryIndex, setSelectedGroupQueryIndex] = React.useState(() => {
    if (getQuerySelection?.type === 'group') {
      debugLogger.log('GROUP', {
        event: 'initial-group-query-index',
        index: getQuerySelection.index
      })
      return getQuerySelection.index
    }
    return 0
  })
  const [selectedUngroupedIndex, setSelectedUngroupedIndex] = React.useState(() => {
    if (getQuerySelection?.type === 'ungrouped') {
      debugLogger.log('GROUP', {
        event: 'initial-ungrouped-index',
        index: getQuerySelection.index
      })
      return getQuerySelection.index
    }
    return 0
  })
  
  // Update selection when initialQueryValue changes (e.g., when URL hash is detected)
  React.useEffect(() => {
    if (getQuerySelection) {
      if (getQuerySelection.type === 'group') {
        debugLogger.log('GROUP', {
          event: 'selection-changed-to-group',
          groupId: getQuerySelection.groupId,
          index: getQuerySelection.index
        })
        setSelectedGroupId(getQuerySelection.groupId)
        setSelectedGroupQueryIndex(getQuerySelection.index)
      } else {
        debugLogger.log('GROUP', {
          event: 'selection-changed-to-ungrouped',
          index: getQuerySelection.index
        })
        setSelectedGroupId(null)
        setSelectedUngroupedIndex(getQuerySelection.index)
      }
    } else {
      // No hash parameter - ensure we have a default selection
      // If groups exist, default to first group (already handled in useState initializer)
      // But if no groups and we have ungrouped, ensure selectedUngroupedIndex is set
      if (groupOrder.length === 0 && ungrouped.length > 0) {
        debugLogger.log('GROUP', {
          event: 'no-hash-parameter-default-ungrouped',
          defaultIndex: 0
        })
        setSelectedUngroupedIndex(0)
      }
    }
  }, [getQuerySelection, groupOrder.length, ungrouped.length])
  
  // Get the currently selected query item
  const getSelectedQueryItem = (): ImmutableObject<QueryItemType> => {
    // PRIORITY 1: If hash parameter matches a query, use that directly
    // This ensures we always use the hash-matched query, regardless of state timing
    // This is critical for grouped queries where dropdowns need to be synchronized
    if (getQuerySelection && matchingQueryIndex >= 0) {
      const hashMatchedItem = queryItems[matchingQueryIndex]
      debugLogger.log('GROUP', {
        event: 'getSelectedQueryItem-hash-match',
        shortId: hashMatchedItem.shortId,
        groupId: hashMatchedItem.groupId,
        configId: hashMatchedItem.configId,
        isGrouped: !!hashMatchedItem.groupId,
        matchingQueryIndex,
        note: 'Using hash-matched query (highest priority)'
      })
      return hashMatchedItem
    }
    
    // PRIORITY 2: Otherwise use current state selection
    debugLogger.log('GROUP', {
      event: 'getSelectedQueryItem-state-selection',
      selectedGroupId,
      hasSelectedGroup: selectedGroupId && groups[selectedGroupId],
      selectedGroupQueryIndex,
      selectedUngroupedIndex,
      ungroupedLength: ungrouped.length,
      groupOrderLength: groupOrder.length,
      note: 'No hash parameter, using state selection'
    })
    
    // If a group is selected, get query from that group
    if (selectedGroupId && groups[selectedGroupId]) {
      const groupItems = groups[selectedGroupId].items
      if (groupItems.length > 0) {
        const idx = selectedGroupQueryIndex < groupItems.length ? selectedGroupQueryIndex : 0
        const selectedItem = groupItems[idx]
        debugLogger.log('GROUP', {
          event: 'selected-query-from-group',
          groupId: selectedGroupId,
          groupQueryIndex: idx,
          queryItemConfigId: selectedItem.configId,
          queryDisplayName: getQueryDisplayName(selectedItem)
        })
        return selectedItem
      }
    }
    
    // Otherwise, get from ungrouped queries
    if (ungrouped.length > 0) {
      const idx = selectedUngroupedIndex < ungrouped.length ? selectedUngroupedIndex : 0
      const selectedItem = ungrouped[idx].item
      debugLogger.log('GROUP', {
        event: 'selected-query-from-ungrouped',
        ungroupedIndex: idx,
        queryItemConfigId: selectedItem.configId,
        queryDisplayName: getQueryDisplayName(selectedItem)
      })
      return selectedItem
    }
    
    // Fallback to first query item
    debugLogger.log('GROUP', {
      event: 'selected-query-fallback',
      note: 'No groups or ungrouped queries, using first item'
    })
    return queryItems[0]
  }
  
  const selectedQueryItem = getSelectedQueryItem()
  const selectedQueryRealIndex = React.useMemo(() => {
    return queryItems.findIndex(q => q.configId === selectedQueryItem.configId)
  }, [queryItems, selectedQueryItem])
  
  // If only one query total, don't show dropdown
  const showDropdown = queryItems.length > 1 || groupOrder.length > 0
  
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
      {/* Search Layer dropdown moved to QueryTask Query tab content */}
      
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
            queryItems={queryItems}
            selectedQueryIndex={selectedUngroupedIndex}
            onQueryChange={(index) => setSelectedUngroupedIndex(index)}
            // Grouping props
            groups={groups}
            ungrouped={ungrouped}
            groupOrder={groupOrder}
            selectedGroupId={selectedGroupId}
            selectedGroupQueryIndex={selectedGroupQueryIndex}
            onGroupChange={(groupId) => setSelectedGroupId(groupId)}
            onGroupQueryChange={(index) => setSelectedGroupQueryIndex(index)}
            onUngroupedChange={(index) => setSelectedUngroupedIndex(index)}
            resultsMode={resultsMode}
            onResultsModeChange={onResultsModeChange}
            accumulatedRecords={accumulatedRecords}
            onAccumulatedRecordsChange={onAccumulatedRecordsChange}
            // No onNavBack - no navigation needed
          />
        </div>
      )}
    </div>
  )
}



