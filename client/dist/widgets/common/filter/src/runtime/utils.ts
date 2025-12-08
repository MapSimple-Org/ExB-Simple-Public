import type { FlipOptions } from 'jimu-ui'
import { FilterItemType, type filterItemConfig } from '../config'
import { ClauseDisplayType, ClauseOperator, ClauseSourceType, ClauseType, type ImmutableArray, utils as jimuCoreUtils } from 'jimu-core'

export const FallbackFlipOptions: FlipOptions = {
  fallbackPlacements: ['bottom-start', 'bottom-end', 'top', 'left', 'right'],
  fallbackStrategy: 'bestFit'
}

interface ClauseURLParams {
  index: number,
  // for single clause:
  // use `null` when no value selected.
  values?: string | number | string[] | number[]
  // for cases like unique, predefined(unique), etc. Not considerate the field is codedvalue or not.
  label?: string
  // for set:
  clauses?: ClauseURLParams[]
}

export interface FilterItemURLParams {
  // filter item name
  name: string
  // clause list, including single and set
  clauses?: ClauseURLParams[]
}

export type FilterItemURLParamsArray = FilterItemURLParams[]

export interface CachedFilterURLParams {
  [itemName: string]: FilterItemURLParams
}

/**
 * Get new filterItems config by merging urlParams into filterItems
 * @param filterItems
 * @param urlParams
 * @returns
 */
export const getUpdatedFilterItemsByURL = (filterItems: ImmutableArray<filterItemConfig>, urlParams: FilterItemURLParamsArray): filterItemConfig[] => {
  return filterItems.asMutable({ deep: true }).map(fItem => {
    const itemURLParams = urlParams.find(p => p.name === fItem.name)
    if (!itemURLParams) {
      return fItem
    }

    const sqlProps: any = {}
    if (fItem.type === FilterItemType.Single) {
      sqlProps.sqlExprObj = {
        ...fItem.sqlExprObj,
        parts: getClausesByURL(fItem.sqlExprObj.parts, itemURLParams.clauses)
      }
    } else { // group
      sqlProps.sqlExprObjForGroup = [
        {
          ...fItem.sqlExprObjForGroup[0],
          clause: getClausesByURL([fItem.sqlExprObjForGroup[0].clause], itemURLParams.clauses)[0]
        },
        ...fItem.sqlExprObjForGroup.slice(1)
      ]
    }

    return {
      ...fItem,
      autoApplyWhenWidgetOpen: true, // always true when set by URL
      ...sqlProps
    }
  })
}

/**
 * Get new clauses config by merging urlParams
 * @param parts from config
 * @param clauses from URL
 * @returns
 */
const getClausesByURL = (parts, clauses) => {
  return parts.map((part, idx) => {
    const clause = clauses.find(c => c.index === idx + 1)
    if (!clause) {
      return part
    } else if (clause.clauses) { // set
      return {
        ...part,
        parts: getClausesByURL(part.parts, clause.clauses)
      }
    } else { // single clause
      if (part.displayType !== ClauseDisplayType.UseAskForValue) { // only askForValue clause can be set by URL
        return part
      } else {
        let newValue = null
        const sourceType = part.valueOptions?.sourceType
        if (sourceType === ClauseSourceType.SingleSelectFromPredefined) {
          newValue = part.valueOptions?.value?.map(v => Object.assign({}, v, { selected: v.value === clause.values }))
        } else if (sourceType === ClauseSourceType.MultipleSelectFromPredefined) {
          newValue = part.valueOptions?.value?.map(v => Object.assign({}, v, { selected: clause.values.includes(v.value) }))
        } else if (clause.values || typeof clause.values === 'number') { // one or more values are selected
          if (Array.isArray(clause.values)) { // multiple values
            if (isDateInOrNotTheLastOrNextOperator(part.operator)) {
              newValue = [{ value: clause.values[0], label: clause.values[1] }]
            } else {
              newValue = clause.values.map(v => {
                if (isDateBetweenOrNotBetweenOperator(part.operator)) {
                  return v ? { value: v, label: v + '' } : null
                } else {
                  return { value: v, label: v + '' }
                }
              })
            }
          } else { // single value
            newValue = [{ value: clause.values, label: clause.label || clause.values + '' }]
          }
        }
        return {
          ...part,
          valueOptions: {
            ...part.valueOptions,
            value: newValue
          }
        }
      }
    }
  })
}


/**
 * Get updated URL value by filterItems.
 * Rules:
 * All applied filter items with the updated/empty clauses should be added to URL when the widget URL is enabled.
 * Three cases:
 * 1. A filter item is changed to applied.
 *    > Only add the updated clauses to the item of URL, ignoring the same values as config.
 * 2. A filter item is changed to unapplied.
 *    > Remove the whole item from URL.
 * 3. A filter item is applied, and the inside clause(value) is changed.
 *    > Update the clause value to the item of URL, remove it when it's the same values as config.
 *
 * @param index the current filter item index which is changed
 * @param stateFilterItems the latest filter items in state
 * @param configFilterItems the original filter items in config, or generated by the URL when widget is initialized.
 * @returns string
 */
export const getCachedURLParamsByFilterItems = (index: number, stateFilterItems: ImmutableArray<filterItemConfig>, configFilterItems: ImmutableArray<filterItemConfig>, cachedURLParams: CachedFilterURLParams): CachedFilterURLParams => {
  stateFilterItems.forEach((fItem, i) => {
    if (cachedURLParams[fItem.name] && i !== index) {
      return // keep the cached applied items
    }

    let item = null
    if (i === index) {
      item = getURLParamsByFilterItem(stateFilterItems[i], configFilterItems[i], stateFilterItems[i].autoApplyWhenWidgetOpen)
    } else if (fItem.autoApplyWhenWidgetOpen) { // not in cached but applied in initial load.
      item = getURLParamsByFilterItem(stateFilterItems[i], configFilterItems[i], true)
    }

    if (item) { // on
      cachedURLParams[fItem.name] = item
    } else { // off
      delete cachedURLParams[fItem.name]
    }
  })
  return cachedURLParams
}

/**
 * Get URL params for one filter item by comparing stateItem with configItem
 */
const getURLParamsByFilterItem = (stateItem, configItem, forceRefresh = false): FilterItemURLParams => {
  if (stateItem.type === FilterItemType.Custom) {
    return null
  }
  // off to on, on & values changed
  if ((!configItem.autoApplyWhenWidgetOpen && stateItem.autoApplyWhenWidgetOpen) || forceRefresh) {
    let stateClauseList
    let configClauseList
    if (stateItem.type === FilterItemType.Single) {
      stateClauseList = stateItem.sqlExprObj.parts
      configClauseList = configItem.sqlExprObj.parts
    } else { // group
      stateClauseList = [stateItem.sqlExprObjForGroup[0].clause]
      configClauseList = [configItem.sqlExprObjForGroup[0].clause]
    }
    return {
      name: stateItem.name,
      clauses: stateClauseList.map((statePart, index) => {
        const configPart = configClauseList[index]
        if (statePart.type === ClauseType.Set) {
          const clauses = statePart.parts.map((sPart, sIndex) => getURLParamsByClause(sPart, configPart.parts[sIndex], sIndex)).filter(c => c !== null)
          return clauses.length > 0 ? { index: index + 1, clauses: clauses } : null
        } else {
          return getURLParamsByClause(statePart, configPart, index)
        }
      }).filter(c => c !== null)
    }
  } else {
    return null
  }
}

const getValidValues = (valuePairs) => {
  return valuePairs?.map(v => {
    // predefined clause has selected value.
    if (v?.selected !== false) {
      // v might be `null` for date & between operators, v.value might be 0 or negative numbers.
      return v?.value ?? null
    } else {
      return null
    }
  })
}

/**
 * Get URL params for one clause by comparing statePart with configPart
 */
const getURLParamsByClause = (statePart, configPart, index): ClauseURLParams => {
  const stateValues = getValidValues(statePart.valueOptions?.value)
  const configValues = getValidValues(configPart.valueOptions?.value)
  const { isEqual } = jimuCoreUtils.diffArrays(true, stateValues, configValues)
  if (isEqual) {
    return null // same values
  } else {
    let newValuses = stateValues
    if (!newValuses || newValuses.length === 0) { // no values selected
      newValuses = null
    } else if (newValuses.length === 1) { // only one value, remove array format
      newValuses = newValuses[0]
    }

    if (isDateInOrNotTheLastOrNextOperator(statePart.operator)) {
      newValuses = [newValuses, statePart.valueOptions?.value?.[0]?.label]
    }
    const item: ClauseURLParams = { index: index + 1, values: newValuses }
    // add label for single select cases
    if (statePart.valueOptions?.sourceType === ClauseSourceType.SingleSelectFromUnique) {
      item.label = statePart.valueOptions?.value?.find(v => v.value === newValuses)?.label
    } else if (statePart.valueOptions?.sourceType === ClauseSourceType.SingleSelectFromPredefined) {
      item.values = newValuses.filter(v => v !== null)[0]
      item.label = statePart.valueOptions?.value?.find(v => v.value === item.values)?.alias
    } else if (statePart.valueOptions?.sourceType === ClauseSourceType.MultipleSelectFromPredefined) {
      item.values = newValuses.filter(v => v !== null)
    }
    return item
  }
}

// for these 4 date operators, value is number, label is unit.
const isDateInOrNotTheLastOrNextOperator = (operator: ClauseOperator): boolean => {
  return operator === ClauseOperator.DateOperatorIsInTheLast || operator === ClauseOperator.DateOperatorIsNotInTheLast ||
    operator === ClauseOperator.DateOperatorIsInTheNext || operator === ClauseOperator.DateOperatorIsNotInTheNext
}

const isDateBetweenOrNotBetweenOperator = (operator: ClauseOperator): boolean => {
  return operator === ClauseOperator.DateOperatorIsBetween || operator === ClauseOperator.DateOperatorIsNotBetween
}

/**
 * Get URL string by urlParams
 * @param urlParams
 * @returns
 */
export const getURLStringByUrlParams = (urlParams?: FilterItemURLParamsArray): string => {
  return urlParams.length > 0 ? JSON.stringify(urlParams) : null
}

