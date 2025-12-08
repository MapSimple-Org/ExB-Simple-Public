import { Immutable, type ImmutableArray, type UseDataSource, type IMUseDataSource, type ImmutableObject, appConfigUtils, ClauseDisplayType, dataSourceUtils } from 'jimu-core'
import { type filterConfig, FilterItemType, type filterItemConfig } from '../config'
import { getShownClauseNumberByExpression } from 'jimu-ui/basic/sql-expression-runtime'

/**
 * The turnOffAll is supported when at least one filter item is custom type, or it has activation style.
 */
export const isTurnOffAllSupported = (config: filterConfig): boolean => {
  const { omitInternalStyle, filterItems } = config
  if (!omitInternalStyle || filterItems.length === 0) {
    return true
  }
  let isSupported = false
  filterItems.some(item => {
    if (item.type === FilterItemType.Custom) {
      isSupported = true
    } else if (item.type === FilterItemType.Single) {
      isSupported = !item.sqlExprObj || getShownClauseNumberByExpression(item.sqlExprObj) !== 1
    } else {
      isSupported = !item.sqlExprObjForGroup || item.sqlExprObjForGroup[0].clause.displayType === ClauseDisplayType.None
    }
    return isSupported
  })
  return isSupported
}

export const getGroupOrCustomName = (
  fItems: ImmutableArray<filterItemConfig>,
  currentFI: ImmutableObject<filterItemConfig>,
  itemType: FilterItemType,
  i18nMessage: any
): string => {
  let label
  if (currentFI) {
    label = currentFI.name
  } else {
    let index = 1
    const typeKey = itemType === FilterItemType.Group ? 'groupName' : 'customFilterName'
    if (fItems) {
      const indexList = []
      fItems.filter(item => item.type === itemType).forEach(item => {
        const groupPrefix = i18nMessage(typeKey, { num: '' }).trim()
        const [itemPrefix, num] = appConfigUtils.parseUniqueLabel(item.name)
        if (groupPrefix === itemPrefix && num) {
          indexList.push(num)
        }
      })
      if (indexList.length) {
        index = Math.max(...indexList) + 1
      }
    }
    label = i18nMessage(typeKey, { num: index })
  }
  return label
}

/**
 * Get updated used fields for the new added ds for the group filter item.
 * Rules: main ds fields > first checked ds fields > null
 */
export const getUsedFieldsFromMainDsOrFirstCheckedDsView = (useDataSources, mainUseDs, newAddedUseDs): string[] => {
  if (!mainUseDs) {
    return null
  }

  let usedFields
  if (newAddedUseDs.mainDataSourceId === mainUseDs.mainDataSourceId) { // Use fields from main ds when they are from the same ds.
    usedFields = mainUseDs.fields
  } else { // use first checked ds if it exists
    const firstCheckedDsView = getFirstCheckedDsView(useDataSources, newAddedUseDs)
    usedFields = firstCheckedDsView?.fields || null
  }
  return usedFields
}

export const getFirstCheckedDsView = (useDataSources, currentDs) => {
    let firstCheckedView = null
    const views = dataSourceUtils.getSortedDataViewIds(currentDs.mainDataSourceId)
    views.some(view => {
      return useDataSources.some(useDs => {
        if (useDs.dataSourceId === view && useDs.dataSourceId !== currentDs.dataSourceId) {
          firstCheckedView = useDs
          return true
        } else {
          return false
        }
      })
    })
    return firstCheckedView
  }

// Get useDataSources when filters of single item are changed.
// Note: need to update ds list and related use fields.
export const getUseDataSourcesBySingleFiltersChanged = (
  fItems: filterItemConfig[],
  dataSourceId: string,
  useDataSources: ImmutableArray<UseDataSource>
): ImmutableArray<UseDataSource> => {
  let newUseDss = useDataSources
  const newFields = getAllUsedFieldsByDataSourceId(fItems, dataSourceId)
  const isChanged = areUsedFieldsChanged(newFields, dataSourceId, useDataSources)
  if (isChanged) { // get latest useDss by update fields
    useDataSources.some((ds, index) => {
      if (ds.dataSourceId === dataSourceId) {
        newUseDss = (useDataSources as any).set(index, Immutable(ds).set('fields', newFields))
        return true
      }
      return false
    })
  }
  return newUseDss
}

/**
 * Get widget useDataSources when filters of group item are changed.
 * It contains two cases for current item: GroupSqlExpr is changed, or one ds is removed.
 * @param fItems latest filter items
 * @param itemUseDataSources related useDataSources of current item
 * @param useDataSources widget's useDataSources
 * @returns
 */
export const getUseDataSourcesByGroupFiltersChanged = (
  fItems: filterItemConfig[],
  itemUseDataSources: ImmutableArray<IMUseDataSource>,
  useDataSources: ImmutableArray<UseDataSource>
): ImmutableArray<UseDataSource> => {
  let newUseDssForWidget = useDataSources
  itemUseDataSources.forEach(useDs => {
    const newUseDs = getUseDataSourcesBySingleFiltersChanged(fItems, useDs.dataSourceId, newUseDssForWidget)
    if (newUseDs) {
      newUseDssForWidget = newUseDs
    }
  })
  return newUseDssForWidget
}

// Get useDss by remove action.
// Note: fItems doesn't include deleted item, or deleted ds.
export const getUseDataSourcesByRemovedAction = (
  fItems: filterItemConfig[],
  itemUseDataSources: ImmutableArray<IMUseDataSource>,
  useDataSources: ImmutableArray<UseDataSource>
) => {
  let wJsonUseDss = useDataSources
  itemUseDataSources.forEach(useDs => {
    const useDSs = getUseDataSourcesByRemovedDsId(fItems, useDs.dataSourceId, wJsonUseDss)
    if (useDSs) {
      wJsonUseDss = useDSs
    }
  })
  return wJsonUseDss
}

// Save new useDs to props.useDataSource if it's not existed.

export const getUseDataSourcesByDssAdded = (
  fItems: filterItemConfig[],
  addedUseDataSources: UseDataSource[],
  useDataSources: ImmutableArray<UseDataSource>,
  // previousDsId?: string
  previousFItem?: ImmutableObject<filterItemConfig>
): ImmutableArray<UseDataSource> => {
  let useDss = useDataSources || Immutable([])

  // Remove previous ds & fields for single filter, remove previous dss' fields for group item.
  // For case: change ds for single filter item, add ds for group item.
  if (previousFItem) {
    if (previousFItem.type === FilterItemType.Group) { // TODO: For group, it might need to keep fields when dss are changed.
      previousFItem.useDataSources.forEach(useDs => {
        useDss = getUseDataSourcesBySingleFiltersChanged(fItems, useDs.dataSourceId, useDss)
      })
    } else { // remove previous useDs
      const dsId = previousFItem.useDataSources[0].dataSourceId
      useDss = getUseDataSourcesByRemovedDsId(fItems, dsId, useDataSources)
    }
  }

  addedUseDataSources.forEach(addedUseDs => {
    // check if the dss of current item is in useDss
    const isInUseDss = useDss.filter(useDs => addedUseDs.dataSourceId === useDs.dataSourceId).length > 0
    if (!isInUseDss) {
      useDss = useDss.concat(addedUseDs)
    }
  })
  return useDss
}

// Get all used fields of current ds from latest fItems
export const getAllUsedFieldsByDataSourceId = (
  fItems: filterItemConfig[],
  dataSourceId: string
): string[] => {
  let fields = []
  fItems.forEach(item => {
    item.useDataSources.some(ds => {
      if (ds.dataSourceId === dataSourceId && ds.fields) {
        fields = fields.concat(ds.fields)
        return true
      }
      return false
    })
  })
  fields = Array.from(new Set(fields)).sort()
  return fields
}

// Check if a dataSource's used fields are changed by comparing sorted fields.
const areUsedFieldsChanged = (
  fields: string[],
  dataSourceId: string,
  useDataSources: ImmutableArray<UseDataSource>
): boolean => {
  // useDs could be undefined when ds is invalid.
  const previousFields = useDataSources.filter(useDs => dataSourceId === useDs.dataSourceId)[0]?.fields?.asMutable({ deep: true }) || []
  const isFieldsChanged = JSON.stringify(fields) !== JSON.stringify(previousFields)
  return isFieldsChanged
}

// Get useDss by removed ds id.
const getUseDataSourcesByRemovedDsId = (
  fItems: filterItemConfig[],
  dataSourceId: string,
  useDataSources: ImmutableArray<UseDataSource>
) => {
  if (isDsShared(fItems, dataSourceId)) {
    return getUseDataSourcesBySingleFiltersChanged(fItems, dataSourceId, useDataSources)
  } else { // Remove useDs
    return useDataSources.filter(useDs => useDs.dataSourceId !== dataSourceId)
  }
}

// Check if current ds is shared with other filter items.
const isDsShared = (
  fItems: filterItemConfig[],
  dataSourceId: string
) => {
  let isShared = false
  fItems.some(item => {
    if (item.useDataSources.filter(ds => ds.dataSourceId === dataSourceId).length > 0) {
      isShared = true
      return true
    }
    return false
  })
  return isShared
}
