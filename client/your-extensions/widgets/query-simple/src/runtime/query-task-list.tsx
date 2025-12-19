/** @jsx jsx */
import { jsx, css, React, type ImmutableArray, Immutable, type ImmutableObject, hooks, type FeatureLayerDataSource, type FeatureDataRecord, type DataSource } from 'jimu-core'
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
  useGraphicsLayerForHighlight?: boolean
  graphicsLayer?: __esri.GraphicsLayer
  mapView?: __esri.MapView | __esri.SceneView
  onInitializeGraphicsLayer?: (outputDS: DataSource) => Promise<void>
  onClearGraphicsLayer?: () => void
}

interface GroupedQueries {
  groups: { [groupId: string]: { items: ImmutableArray<QueryItemType>, displayName: string, icon?: any } }
  ungrouped: Array<{ item: ImmutableObject<QueryItemType>, index: number }>
  groupOrder: string[]
}

// Helper function to sort queries by display order (lower numbers appear first)
// Queries without order maintain their original relative positions
function sortQueryItemsByOrder(queryItems: ImmutableArray<QueryItemType>): ImmutableArray<QueryItemType> {
  // Handle null/undefined/empty cases
  if (!queryItems || queryItems.length === 0) {
    return queryItems || Immutable([])
  }
  
  // Safely convert to regular array for sorting
  // Handle both ImmutableArray (has toArray method) and regular arrays
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
    // If order is equal (both Infinity or same number), maintain original index order
    return a.originalIndex - b.originalIndex
  })
  return Immutable(itemsWithIndex.map(({ item }) => item))
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
  const { queryItems, widgetId, defaultPageSize, isInPopper = false, className = '', initialQueryValue, onHashParameterUsed, resultsMode, onResultsModeChange, accumulatedRecords, onAccumulatedRecordsChange, useGraphicsLayerForHighlight, graphicsLayer, mapView, onInitializeGraphicsLayer, onClearGraphicsLayer } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  
  // Sort queries by display order before grouping
  // Handle case where queryItems might be undefined/null or not an ImmutableArray
  const sortedQueryItems = React.useMemo(() => {
    if (!queryItems) {
      return Immutable([])
    }
    return sortQueryItemsByOrder(queryItems)
  }, [queryItems])
  
  const { groups, ungrouped, groupOrder } = React.useMemo(() => groupQueries(sortedQueryItems), [sortedQueryItems])
  
  // Find the query item matching the initialQueryValue shortId from URL hash
  // Use sortedQueryItems to ensure we find the item in the sorted order
  const matchingQueryIndex = React.useMemo(() => {
    if (!initialQueryValue?.shortId) {
      return -1
    }
    return sortedQueryItems.findIndex(item => item.shortId === initialQueryValue.shortId)
  }, [sortedQueryItems, initialQueryValue])
  
  // Determine which group/ungrouped index the matching query is at
  const getQuerySelection = React.useMemo(() => {
    if (matchingQueryIndex < 0) return null
    
    const item = sortedQueryItems[matchingQueryIndex]
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
  }, [matchingQueryIndex, sortedQueryItems, groups, ungrouped])
  
  // Helper to determine default selection based on display order
  const getDefaultSelection = React.useMemo(() => {
    if (getQuerySelection) {
      return getQuerySelection
    }
    
    // No hash parameter - determine default based on display order
    // Compare first ungrouped query vs first query in first group
    const firstUngroupedOrder = ungrouped.length > 0 ? (ungrouped[0].item.order ?? Infinity) : Infinity
    const firstGroupOrder = groupOrder.length > 0 && groups[groupOrder[0]]?.items?.length > 0
      ? (groups[groupOrder[0]].items[0].order ?? Infinity)
      : Infinity
    
    // Select whichever has lower order (or first if equal)
    if (firstUngroupedOrder < firstGroupOrder) {
      return { type: 'ungrouped' as const, index: 0 }
    } else if (firstGroupOrder < Infinity || groupOrder.length > 0) {
      return { type: 'group' as const, groupId: groupOrder[0], index: 0 }
    } else if (ungrouped.length > 0) {
      return { type: 'ungrouped' as const, index: 0 }
    }
    return null
  }, [getQuerySelection, ungrouped, groups, groupOrder])
  
  // Track selected query - initialize with matching query if found from URL hash, or default based on display order
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | null>(() => {
    if (getDefaultSelection?.type === 'group') {
      debugLogger.log('GROUP', {
        event: 'initial-group-selection',
        groupId: getDefaultSelection.groupId,
        note: getQuerySelection ? 'Hash-matched' : 'Default based on display order'
      })
      return getDefaultSelection.groupId
    }
    return null
  })
  const [selectedGroupQueryIndex, setSelectedGroupQueryIndex] = React.useState(() => {
    if (getDefaultSelection?.type === 'group') {
      debugLogger.log('GROUP', {
        event: 'initial-group-query-index',
        index: getDefaultSelection.index,
        note: getQuerySelection ? 'Hash-matched' : 'Default based on display order'
      })
      return getDefaultSelection.index
    }
    return 0
  })
  const [selectedUngroupedIndex, setSelectedUngroupedIndex] = React.useState(() => {
    if (getDefaultSelection?.type === 'ungrouped') {
      debugLogger.log('GROUP', {
        event: 'initial-ungrouped-index',
        index: getDefaultSelection.index,
        note: getQuerySelection ? 'Hash-matched' : 'Default based on display order'
      })
      return getDefaultSelection.index
    }
    return 0
  })
  
  // Update selection when initialQueryValue changes (e.g., when URL hash is detected)
  // We only want to update based on the hash if one is PRESENT.
  // If the hash is removed (initialQueryValue becomes null), we DON'T want to reset to default.
  React.useEffect(() => {
    if (getQuerySelection) {
      // Hash parameter matched - use that selection and STAY THERE
      if (getQuerySelection.type === 'group') {
        debugLogger.log('GROUP', {
          event: 'selection-changed-to-group-from-hash',
          groupId: getQuerySelection.groupId,
          index: getQuerySelection.index,
          note: 'Sticky selection from hash parameter'
        })
        setSelectedGroupId(getQuerySelection.groupId)
        setSelectedGroupQueryIndex(getQuerySelection.index)
      } else {
        debugLogger.log('GROUP', {
          event: 'selection-changed-to-ungrouped-from-hash',
          index: getQuerySelection.index,
          note: 'Sticky selection from hash parameter'
        })
        setSelectedGroupId(null)
        setSelectedUngroupedIndex(getQuerySelection.index)
      }
    }
  }, [getQuerySelection])
  
  // Get the currently selected query item
  const getSelectedQueryItem = (): ImmutableObject<QueryItemType> => {
    // PRIORITY 1: Use current state selection
    // The state is initialized with the hash match (if present) or default order,
    // and updated via useEffect if the hash changes later.
    debugLogger.log('GROUP', {
      event: 'getSelectedQueryItem-state-selection',
      selectedGroupId,
      hasSelectedGroup: selectedGroupId && groups[selectedGroupId],
      selectedGroupQueryIndex,
      selectedUngroupedIndex,
      ungroupedLength: ungrouped.length,
      groupOrderLength: groupOrder.length,
      note: 'Using state selection (hash-aware)'
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
    return sortedQueryItems[0]
  }
  
  const selectedQueryItem = getSelectedQueryItem()
  const selectedQueryRealIndex = React.useMemo(() => {
    return sortedQueryItems.findIndex(q => q.configId === selectedQueryItem.configId)
  }, [sortedQueryItems, selectedQueryItem])
  
  // If only one query total, don't show dropdown
  const showDropdown = sortedQueryItems.length > 1 || groupOrder.length > 0
  
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
            total={sortedQueryItems.length}
            queryItem={selectedQueryItem}
            isInPopper={isInPopper}
            initialInputValue={selectedQueryItem.shortId === initialQueryValue?.shortId ? initialQueryValue?.value : undefined}
            onHashParameterUsed={onHashParameterUsed}
            queryItems={sortedQueryItems}
            selectedQueryIndex={selectedUngroupedIndex}
            onQueryChange={(index) => setSelectedUngroupedIndex(index)}
            // Grouping props
            groups={groups}
            ungrouped={ungrouped}
            // Graphics layer props
            useGraphicsLayerForHighlight={useGraphicsLayerForHighlight}
            graphicsLayer={graphicsLayer}
            mapView={mapView}
            onInitializeGraphicsLayer={onInitializeGraphicsLayer}
            onClearGraphicsLayer={onClearGraphicsLayer}
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



