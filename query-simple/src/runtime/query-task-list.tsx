/** @jsx jsx */
import { jsx, css, React, type ImmutableArray, Immutable, type ImmutableObject, hooks, type FeatureLayerDataSource, type FeatureDataRecord, type DataSource } from 'jimu-core'
import { Select } from 'jimu-ui'
import type { QueryItemType, SelectionType } from '../config'
import { QueryTask } from './query-task'
import { FOCUSABLE_CONTAINER_CLASS } from 'jimu-ui'
import defaultMessages from './translations/default'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'
import type { EventManager } from './hooks/use-event-handling'

const debugLogger = createQuerySimpleDebugLogger()

export interface QueryTaskListProps {
  widgetId: string
  queryItems: ImmutableArray<QueryItemType>
  isInPopper?: boolean
  defaultPageSize?: number
  className?: string
  initialQueryValue?: { shortId: string, value: string }
  shouldUseInitialQueryValueForSelection?: boolean
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
  activeTab?: 'query' | 'results'
  onTabChange?: (tab: 'query' | 'results') => void
  eventManager?: EventManager  // Chunk 7.1: Event Handling Manager
  // FIX (r018.96): Removed manuallyRemovedRecordIds and onManualRemoval - no longer needed
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
  const { queryItems, widgetId, defaultPageSize, isInPopper = false, className = '', initialQueryValue, shouldUseInitialQueryValueForSelection = false, onHashParameterUsed, resultsMode, onResultsModeChange, accumulatedRecords, onAccumulatedRecordsChange, useGraphicsLayerForHighlight, graphicsLayer, mapView, onInitializeGraphicsLayer, onClearGraphicsLayer, activeTab, onTabChange, eventManager } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  
  // Log when props are received
  React.useEffect(() => {
    debugLogger.log('HASH-EXEC', {
      event: 'querytasklist-props-received',
      widgetId,
      props: {
        hasInitialQueryValue: !!initialQueryValue,
        initialQueryValueShortId: initialQueryValue?.shortId,
        initialQueryValueValue: initialQueryValue?.value,
        shouldUseInitialQueryValueForSelection
      },
      timestamp: Date.now()
    })
    
    debugLogger.log('GROUP', {
      event: 'query-task-list-props-received',
      widgetId,
      hasInitialQueryValue: !!initialQueryValue,
      initialQueryValueShortId: initialQueryValue?.shortId,
      initialQueryValueValue: initialQueryValue?.value,
      shouldUseInitialQueryValueForSelection,
      timestamp: Date.now()
    })
  }, [initialQueryValue, shouldUseInitialQueryValueForSelection, widgetId])
  
  // Sort queries by display order before grouping
  // Handle case where queryItems might be undefined/null or not an ImmutableArray
  const sortedQueryItems = React.useMemo(() => {
    if (!queryItems) {
      return Immutable([])
    }
    return sortQueryItemsByOrder(queryItems)
  }, [queryItems])
  
  const { groups, ungrouped, groupOrder } = React.useMemo(() => groupQueries(sortedQueryItems), [sortedQueryItems])
  
  // Only use the prop initialQueryValue when HelperSimple explicitly opens the widget
  // QuerySimple should not autonomously react to initialQueryValue prop changes
  // HelperSimple is the orchestrator and sets shouldUseInitialQueryValueForSelection flag
  const effectiveInitialQueryValue = shouldUseInitialQueryValueForSelection ? initialQueryValue : undefined
  
  // Log when effectiveInitialQueryValue is calculated
  React.useEffect(() => {
    debugLogger.log('HASH-EXEC', {
      event: 'querytasklist-effectiveinitialqueryvalue-calculated',
      widgetId,
      calculation: {
        shouldUseInitialQueryValueForSelection,
        hasInitialQueryValue: !!initialQueryValue,
        effectiveResult: effectiveInitialQueryValue ? 'USE_INITIAL_QUERY_VALUE' : 'UNDEFINED',
        effectiveShortId: effectiveInitialQueryValue?.shortId,
        effectiveValue: effectiveInitialQueryValue?.value
      },
      timestamp: Date.now()
    })
    
    debugLogger.log('GROUP', {
      event: 'effectiveInitialQueryValue-calculated',
      widgetId,
      shouldUseInitialQueryValueForSelection,
      hasInitialQueryValue: !!initialQueryValue,
      hasEffectiveInitialQueryValue: !!effectiveInitialQueryValue,
      effectiveShortId: effectiveInitialQueryValue?.shortId,
      effectiveValue: effectiveInitialQueryValue?.value,
      timestamp: Date.now()
    })
  }, [effectiveInitialQueryValue, shouldUseInitialQueryValueForSelection, initialQueryValue, widgetId])

  // Find the query item matching the shortId from URL hash
  const matchingQueryIndex = React.useMemo(() => {
    const shortId = effectiveInitialQueryValue?.shortId
    
    debugLogger.log('HASH-FIRST-LOAD', {
      event: 'matchingQueryIndex-calculation-start',
      widgetId,
      hasEffectiveInitialQueryValue: !!effectiveInitialQueryValue,
      shortIdToMatch: shortId,
      sortedQueryItemsCount: sortedQueryItems?.length || 0,
      sortedQueryItemsShortIds: sortedQueryItems ? [...sortedQueryItems.map(item => item.shortId)] : [],
      timestamp: Date.now()
    })
    
    if (!shortId) {
      debugLogger.log('HASH-FIRST-LOAD', {
        event: 'matchingQueryIndex-no-shortid',
        widgetId,
        result: -1,
        reason: 'No shortId in effectiveInitialQueryValue',
        timestamp: Date.now()
      })
      return -1
    }
    
    const foundIndex = sortedQueryItems.findIndex(item => item.shortId === shortId)
    
    debugLogger.log('HASH-FIRST-LOAD', {
      event: 'matchingQueryIndex-calculation-complete',
      widgetId,
      shortIdToMatch: shortId,
      foundIndex,
      matchFound: foundIndex >= 0,
      matchedItem: foundIndex >= 0 ? {
        configId: sortedQueryItems[foundIndex].configId,
        shortId: sortedQueryItems[foundIndex].shortId,
        label: sortedQueryItems[foundIndex].label
      } : null,
      timestamp: Date.now()
    })
    
    return foundIndex
  }, [sortedQueryItems, effectiveInitialQueryValue, widgetId])
  
  // Determine which group/ungrouped index the matching query is at
  const getQuerySelection = React.useMemo(() => {
    debugLogger.log('HASH-FIRST-LOAD', {
      event: 'getQuerySelection-calculation-start',
      widgetId,
      matchingQueryIndex,
      hasMatch: matchingQueryIndex >= 0,
      timestamp: Date.now()
    })
    
    if (matchingQueryIndex < 0) {
      debugLogger.log('HASH-FIRST-LOAD', {
        event: 'getQuerySelection-no-match',
        widgetId,
        result: null,
        reason: 'matchingQueryIndex is negative',
        timestamp: Date.now()
      })
      return null
    }
    
    const item = sortedQueryItems[matchingQueryIndex]
    
    debugLogger.log('HASH-FIRST-LOAD', {
      event: 'getQuerySelection-matched-item',
      widgetId,
      matchedItem: {
        configId: item.configId,
        shortId: item.shortId,
        label: item.label,
        groupId: item.groupId,
        hasGroup: !!item.groupId
      },
      timestamp: Date.now()
    })
    if (item.groupId) {
      const groupItems = groups[item.groupId]?.items || Immutable([])
      const indexInGroup = groupItems.findIndex(q => q.configId === item.configId)
      const result = { type: 'group' as const, groupId: item.groupId, index: indexInGroup >= 0 ? indexInGroup : 0 }
      
      debugLogger.log('GROUP', {
        event: 'hash-query-found-in-group',
        groupId: item.groupId,
        indexInGroup: indexInGroup >= 0 ? indexInGroup : 0,
        queryItemConfigId: item.configId,
        queryItemShortId: item.shortId
      })
      
      debugLogger.log('HASH-FIRST-LOAD', {
        event: 'getQuerySelection-returning-group',
        widgetId,
        result,
        timestamp: Date.now()
      })
      
      return result
    } else {
      // Ungrouped query
      const indexInUngrouped = ungrouped.findIndex(({ item: q }) => q.configId === item.configId)
      const result = { type: 'ungrouped' as const, index: indexInUngrouped >= 0 ? indexInUngrouped : 0 }
      
      debugLogger.log('GROUP', {
        event: 'hash-query-found-ungrouped',
        indexInUngrouped: indexInUngrouped >= 0 ? indexInUngrouped : 0,
        queryItemConfigId: item.configId,
        queryItemShortId: item.shortId
      })
      
      debugLogger.log('HASH-FIRST-LOAD', {
        event: 'getQuerySelection-returning-ungrouped',
        widgetId,
        result,
        timestamp: Date.now()
      })
      
      return result
    }
  }, [matchingQueryIndex, sortedQueryItems, groups, ungrouped, widgetId])
  
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
  
  // Update selection when HelperSimple explicitly opens widget with hash parameter
  // Only react when shouldUseInitialQueryValueForSelection is true (set by HelperSimple)
  // This prevents autonomous query selection when switching queries
  React.useEffect(() => {
    debugLogger.log('HASH-FIRST-LOAD', {
      event: 'EXECUTION-USEEFFECT-TRIGGERED',
      widgetId,
      criticalConditions: {
        shouldUseInitialQueryValueForSelection,
        hasGetQuerySelection: !!getQuerySelection,
        getQuerySelectionValue: getQuerySelection,
        hasEffectiveInitialQueryValue: !!effectiveInitialQueryValue,
        effectiveInitialQueryValue,
        matchingQueryIndex,
        conditionsMet: shouldUseInitialQueryValueForSelection && !!getQuerySelection,
        WILL_EXECUTE_QUERY: shouldUseInitialQueryValueForSelection && !!getQuerySelection
      },
      timestamp: Date.now()
    })
    
    debugLogger.log('HASH-EXEC', {
      event: 'querytasklist-selection-useeffect-check',
      widgetId,
      check: {
        shouldUseInitialQueryValueForSelection,
        hasGetQuerySelection: !!getQuerySelection,
        getQuerySelectionType: getQuerySelection?.type,
        willUpdateSelection: shouldUseInitialQueryValueForSelection && !!getQuerySelection
      },
      timestamp: Date.now()
    })
    
    debugLogger.log('GROUP', {
      event: 'query-selection-useeffect-check',
      widgetId,
      shouldUseInitialQueryValueForSelection,
      hasGetQuerySelection: !!getQuerySelection,
      getQuerySelectionType: getQuerySelection?.type,
      willUpdateSelection: shouldUseInitialQueryValueForSelection && !!getQuerySelection,
      timestamp: Date.now()
    })
    
    if (shouldUseInitialQueryValueForSelection && getQuerySelection) {
      // Hash parameter matched - HelperSimple explicitly opened us with this hash
      debugLogger.log('HASH-EXEC', {
        event: 'querytasklist-selection-useeffect-updating',
        widgetId,
        selectionType: getQuerySelection.type,
        selectionDetails: getQuerySelection.type === 'group' 
          ? { groupId: getQuerySelection.groupId, index: getQuerySelection.index }
          : { index: getQuerySelection.index },
        timestamp: Date.now()
      })
      
      if (getQuerySelection.type === 'group') {
        debugLogger.log('GROUP', {
          event: 'selection-changed-to-group-from-hash',
          groupId: getQuerySelection.groupId,
          index: getQuerySelection.index,
          note: 'HelperSimple explicitly opened widget with hash parameter'
        })
        setSelectedGroupId(getQuerySelection.groupId)
        setSelectedGroupQueryIndex(getQuerySelection.index)
      } else {
        debugLogger.log('GROUP', {
          event: 'selection-changed-to-ungrouped-from-hash',
          index: getQuerySelection.index,
          note: 'HelperSimple explicitly opened widget with hash parameter'
        })
        setSelectedGroupId(null)
        setSelectedUngroupedIndex(getQuerySelection.index)
      }
    } else {
      debugLogger.log('HASH-FIRST-LOAD', {
        event: 'EXECUTION-SKIPPED',
        widgetId,
        reason: !shouldUseInitialQueryValueForSelection ? 'FLAG_IS_FALSE' : 'NO_QUERY_SELECTION',
        detailedDiagnostic: {
          shouldUseInitialQueryValueForSelection,
          hasGetQuerySelection: !!getQuerySelection,
          getQuerySelectionValue: getQuerySelection,
          hasEffectiveInitialQueryValue: !!effectiveInitialQueryValue,
          effectiveInitialQueryValue,
          matchingQueryIndex,
          sortedQueryItemsCount: sortedQueryItems?.length || 0,
          possibleCauses: !shouldUseInitialQueryValueForSelection 
            ? ['HelperSimple did not set the flag', 'Widget opened without hash parameter']
            : ['matchingQueryIndex returned -1', 'shortId did not match any query', 'queryItems not loaded yet']
        },
        timestamp: Date.now()
      })
      
      debugLogger.log('HASH-EXEC', {
        event: 'querytasklist-selection-useeffect-skipped',
        widgetId,
        reason: !shouldUseInitialQueryValueForSelection ? 'flag-is-false' : 'no-query-selection',
        check: {
          shouldUseInitialQueryValueForSelection,
          hasGetQuerySelection: !!getQuerySelection
        },
        timestamp: Date.now()
      })
      
      debugLogger.log('GROUP', {
        event: 'query-selection-useeffect-skipped',
        widgetId,
        reason: !shouldUseInitialQueryValueForSelection ? 'flag-is-false' : 'no-query-selection',
        shouldUseInitialQueryValueForSelection,
        hasGetQuerySelection: !!getQuerySelection,
        timestamp: Date.now()
      })
    }
  }, [shouldUseInitialQueryValueForSelection, getQuerySelection, widgetId, effectiveInitialQueryValue, matchingQueryIndex, sortedQueryItems])
  
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
      {selectedQueryItem && (() => {
        const willPassInitialInputValue = selectedQueryItem.shortId === effectiveInitialQueryValue?.shortId
        const initialInputValueToPass = willPassInitialInputValue ? effectiveInitialQueryValue?.value : undefined
        
        debugLogger.log('GROUP', {
          event: 'initialInputValue-being-passed-to-querytask',
          widgetId,
          selectedQueryItemShortId: selectedQueryItem.shortId,
          selectedQueryItemConfigId: selectedQueryItem.configId,
          effectiveInitialQueryValueShortId: effectiveInitialQueryValue?.shortId,
          willPassInitialInputValue,
          initialInputValue: initialInputValueToPass,
          timestamp: Date.now()
        })
        
        return (
          <div className={`query-task-container ${isInPopper ? FOCUSABLE_CONTAINER_CLASS : ''}`}>
            <QueryTask
              widgetId={widgetId}
              index={selectedQueryRealIndex >= 0 ? selectedQueryRealIndex : 0}
              total={sortedQueryItems.length}
              queryItem={selectedQueryItem}
              isInPopper={isInPopper}
              initialInputValue={initialInputValueToPass}
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
            activeTab={activeTab}
            onTabChange={onTabChange}
            eventManager={eventManager}
              // No onNavBack - no navigation needed
            />
          </div>
        )
      })()}
    </div>
  )
}



