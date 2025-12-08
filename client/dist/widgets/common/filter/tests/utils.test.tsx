import { ClauseOperator, ClauseSourceType, createIntl, Immutable } from 'jimu-core'
import { getAllUsedFieldsByDataSourceId, getGroupOrCustomName, getUseDataSourcesByGroupFiltersChanged, getUseDataSourcesByRemovedAction } from '../src/setting/utils'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import defaultMessages from './../src/setting/translations/default'

import { FilterItemType } from '../src/config'
import { type FilterItemURLParamsArray, getUpdatedFilterItemsByURL, getCachedURLParamsByFilterItems } from '../src/runtime/utils'

const intl = createIntl({
  locale: 'en',
  defaultLocale: 'en',
  messages: Object.assign({}, defaultMessages, jimuUIMessages)
})

const i18nMessage = (id: string, values?: any) => {
  return intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }, values)
}

 const deepClone = (obj: any): any => {
  const isArray = Array.isArray(obj)
  const cloneObj = isArray ? [] : {}

  for (const key in obj) {
    const isObject = (typeof obj[key] === 'object' || typeof obj[key] === 'function') && obj[key] !== null
    cloneObj[key] = isObject ? deepClone(obj[key]) : obj[key]
  }
  return cloneObj
}

const widgetJson = Immutable({
  useDataSources: [
    { dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1', fields: ['f1', 'f3'] },
    { dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1', fields: ['f4', 'f5'] },
    { dataSourceId: 'ds1-9', mainDataSourceId: 'ds1-9', rootDataSourceId: 'ds1', fields: ['f9'] }
  ],
  config: {
    filterItems: [
      {
        type: FilterItemType.Single,
        sqlExprObj: {},
        useDataSources: [
          { dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1', fields: ['f3'] },
        ]
      },
      {
        type: FilterItemType.Single,
        sqlExprObj: {},
        useDataSources: [
          { dataSourceId: 'ds1-9', mainDataSourceId: 'ds1-9', rootDataSourceId: 'ds1', fields: ['f9'] }
        ]
      },
      {
        type: FilterItemType.Group,
        sqlExprObjForGroup: [
          { dataSourceId: 'ds1-1', fieldList: ['f1'], clause: {} },
          { dataSourceId: 'ds1-2', fieldList: ['f4', 'f5'], clause: {} }
        ],
        useDataSources: [
          { dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1', fields: ['f1'] },
          { dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1', fields: ['f4', 'f5'] },
        ]
      }
    ]
  }
})

describe('setting utils', function () {
  describe('getGroupOrCustomName', function () {
    it('use custom label if it exists.', function () {
      const fItems = [
        { type: FilterItemType.Group, name: 'Group 3' },
        { type: FilterItemType.Single, name: 'Group 7' },
        { type: FilterItemType.Custom, name: 'Custom filter 5' }
      ]
      const groupLabel = getGroupOrCustomName(fItems as any, { name: 'Group name' } as any, FilterItemType.Group, i18nMessage)
      expect(groupLabel).toEqual('Group name')
      const customLabel = getGroupOrCustomName(fItems as any, { name: 'Custom filter name' } as any, FilterItemType.Custom, i18nMessage)
      expect(customLabel).toEqual('Custom filter name')
    })
    it('get biggest num from group items, ignore single items.', function () {
      const fItems = [
        { type: FilterItemType.Group, name: 'Group 3' },
        { type: FilterItemType.Group, name: 'Group 4' },
        { type: FilterItemType.Custom, name: 'Custom filter 2' },
        { type: FilterItemType.Custom, name: 'Custom filter 6' },
        { type: FilterItemType.Single, name: 'Group 7' },
        { type: FilterItemType.Single, name: 'Group 9' }
      ]
      const groupLabel = getGroupOrCustomName(fItems as any, null, FilterItemType.Group, i18nMessage)
      expect(groupLabel).toEqual('Group 5')
      const customLabel = getGroupOrCustomName(fItems as any, null, FilterItemType.Custom, i18nMessage)
      expect(customLabel).toEqual('Custom filter 7')
    })
    it('get bigger num from group items, only when item prefix equals "Group" exactly.', function () {
      const fItems = [
        { type: FilterItemType.Group, name: 'Group abc 3' },
        { type: FilterItemType.Group, name: 'abc Group 4' },
        { type: FilterItemType.Group, name: 'Group 1' }
      ]
      const label = getGroupOrCustomName(fItems as any, null, FilterItemType.Group, i18nMessage)
      expect(label).toEqual('Group 2')
    })
  })

  describe('getAllUsedFieldsByDataSourceId', function () {
    it('ds1-1', function () {
      const fields = getAllUsedFieldsByDataSourceId(widgetJson.config.filterItems as any, 'ds1-1')
      expect(fields).toEqual(widgetJson.useDataSources[0].fields)
    })
    it('ds1-2', function () {
      const fields = getAllUsedFieldsByDataSourceId(widgetJson.config.filterItems as any, 'ds1-2')
      expect(fields).toEqual(widgetJson.useDataSources[1].fields)
    })
    it('ds1-9', function () {
      const fields = getAllUsedFieldsByDataSourceId(widgetJson.config.filterItems as any, 'ds1-9')
      expect(fields).toEqual(widgetJson.useDataSources[2].fields)
    })
  })

  describe('getUseDataSourcesByGroupFiltersChanged', function () {
    it('group sql expr is changed.', function () {
      const newFItemForGroupItem = {
        type: FilterItemType.Group,
        sqlExprObjForGroup: [
          { dataSourceId: 'ds1-1', fieldList: ['f2'], clause: {} },
          { dataSourceId: 'ds1-2', fieldList: ['f6', 'f7', 'f8'], clause: {} }
        ],
        useDataSources: [
          { dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1', fields: ['f2'] },
          { dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1', fields: ['f6', 'f7', 'f8'] },
        ]
      }
      const newFItems = [
        ...widgetJson.config.filterItems.slice(0, 2),
        newFItemForGroupItem
      ]
      // update group sql expr
      const newWidgetUseDss = getUseDataSourcesByGroupFiltersChanged(newFItems as any, newFItemForGroupItem.useDataSources as any, widgetJson.useDataSources)
      expect(newWidgetUseDss).toEqual([
        { dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1', fields: ['f2', 'f3'] },
        { dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1', fields: ['f6', 'f7', 'f8'] },
        { dataSourceId: 'ds1-9', mainDataSourceId: 'ds1-9', rootDataSourceId: 'ds1', fields: ['f9'] }
      ])
    })
    describe('remove ds1-1 from group item, main ds.', function () {
      const newFItemForGroupItem = {
        type: FilterItemType.Group,
        sqlExprObjForGroup: null,
        useDataSources: [
          { dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1'},
        ]
      }
      it('ds1-1 is not used by other item', function () {
        const newFItems = [
          ...widgetJson.config.filterItems.slice(1, 2), // remove single filter with ds1-1
          newFItemForGroupItem
        ]
        const newWidgetUseDss1 = getUseDataSourcesByGroupFiltersChanged(newFItems as any, newFItemForGroupItem.useDataSources as any, widgetJson.useDataSources)
        const newWidgetUseDss = getUseDataSourcesByRemovedAction(newFItems as any, [{ dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1'}] as any, newWidgetUseDss1)
        expect(newWidgetUseDss).toEqual([
          { dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1', fields: [] },
          { dataSourceId: 'ds1-9', mainDataSourceId: 'ds1-9', rootDataSourceId: 'ds1', fields: ['f9'] }
        ])
      })
      it('ds1-1 is used by other item', function () {
        const newFItems = [
          ...widgetJson.config.filterItems.slice(0, 2),
          newFItemForGroupItem
        ]
        const newWidgetUseDss1 = getUseDataSourcesByGroupFiltersChanged(newFItems as any, newFItemForGroupItem.useDataSources as any, widgetJson.useDataSources)
        const newWidgetUseDss = getUseDataSourcesByRemovedAction(newFItems as any, [{ dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1'}] as any, newWidgetUseDss1)
        expect(newWidgetUseDss).toEqual([
          { dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1', fields: ['f3'] },
          { dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1', fields: [] },
          { dataSourceId: 'ds1-9', mainDataSourceId: 'ds1-9', rootDataSourceId: 'ds1', fields: ['f9'] }
        ])
      })
    })
    describe('remove ds1-2 from group item, not main ds.', function () {
      const newFItemForGroupItem = {
        type: FilterItemType.Group,
        sqlExprObjForGroup: [
          { dataSourceId: 'ds1-1', fieldList: ['f1'], clause: {} }
        ],
        useDataSources: [
          { dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1', fields: ['f1'] }
        ]
      }
      let newFItems = [
        ...widgetJson.config.filterItems.slice(0, 2),
        newFItemForGroupItem
      ]
      it('ds1-2 is not used by other item.', function () {
        // update group sql expr
        const newWidgetUseDss1 = getUseDataSourcesByGroupFiltersChanged(newFItems as any, newFItemForGroupItem.useDataSources as any, widgetJson.useDataSources)
        const newWidgetUseDss = getUseDataSourcesByRemovedAction(newFItems as any, [{ dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1'}] as any, newWidgetUseDss1)
        expect(newWidgetUseDss).toEqual([
          { dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1', fields: ['f1', 'f3'] },
          { dataSourceId: 'ds1-9', mainDataSourceId: 'ds1-9', rootDataSourceId: 'ds1', fields: ['f9'] }
        ])
      })
      it('ds1-2 is used by other item.', function () {
        newFItems = [
          ...newFItems,
          {
            type: FilterItemType.Single,
            sqlExprObj: {},
            useDataSources: [
              { dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds2', fields: ['f4'] },
            ]
          }
        ]
        // update group sql expr
        const newWidgetUseDss1 = getUseDataSourcesByGroupFiltersChanged(newFItems as any, newFItemForGroupItem.useDataSources as any, widgetJson.useDataSources)
        const newWidgetUseDss = getUseDataSourcesByRemovedAction(newFItems as any, [{ dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1'}] as any, newWidgetUseDss1)
        expect(newWidgetUseDss).toEqual([
          { dataSourceId: 'ds1-1', mainDataSourceId: 'ds1-1', rootDataSourceId: 'ds1', fields: ['f1', 'f3'] },
          { dataSourceId: 'ds1-2', mainDataSourceId: 'ds1-2', rootDataSourceId: 'ds1', fields: ['f4'] },
          { dataSourceId: 'ds1-9', mainDataSourceId: 'ds1-9', rootDataSourceId: 'ds1', fields: ['f9'] }
        ])
      })
    })
  })

  describe('URL', function () {
    const filterItems: any[] = [
      {
        name: 'My item 1',
        type: FilterItemType.Single,
        autoApplyWhenWidgetOpen: false,
        sqlExprObj: {
          parts: [
            {
              type: 'SINGLE',
              displayType: 'UseLabel', // not affected by URL
              valueOptions: {
                value: [{ value: 11, label: '11' }]
              }
            },
            {
              type: 'SINGLE',
              valueOptions: {
                value: [{ value: 12, label: '12' }]
              }
            },
            {
              type: 'SINGLE',
              displayType: 'USE_ASK_FOR_VALUE',
              valueOptions: {
                value: [{ value: 13, label: '13' }]
              }
            },
            {
              type: 'SET',
              parts: [
                {
                  type: 'SINGLE',
                  valueOptions: {
                    value: [{ value: 141, label: '141' }]
                  }
                },
                {
                  type: 'SINGLE',
                  displayType: 'USE_ASK_FOR_VALUE',
                  valueOptions: {
                    value: [{ value: 142, label: '142' }]
                  }
                }
              ]
            }
          ]
        }
      },
      {
        name: 'My item 2',
        type: FilterItemType.Single,
        autoApplyWhenWidgetOpen: false,
        sqlExprObj: {
          parts: [
            {
              type: 'SINGLE',
              valueOptions: {
                value: [{ value: '21', label: '21' }]
              }
            }
          ]
        }
      },
      {
        name: 'My item 3',
        type: FilterItemType.Single,
        autoApplyWhenWidgetOpen: true,
        sqlExprObj: {
          parts: [
            {
              type: 'SINGLE',
              displayType: 'USE_ASK_FOR_VALUE',
              valueOptions: {
                value: [{ value: '311', label: '311' }, { value: '312', label: '312' }]
              }
            },
            {
              type: 'SINGLE',
              valueOptions: {
                value: [{ value: '32', label: '32' }]
              }
            }
          ]
        }
      }
    ]

    const filterItemsWithGroup: any[] = [
      {
        name: 'My item 1',
        type: FilterItemType.Group,
        autoApplyWhenWidgetOpen: false,
        sqlExprObjForGroup: [
          {
            dataSourceId: 'ds1',
            fieldList: ['field1'],
            clause: {
              type: 'SINGLE',
              displayType: 'USE_ASK_FOR_VALUE',
              valueOptions: {
                value: [{ value: 1, label: '1' }]
              }
            }
          },
          {
            dataSourceId: 'ds2',
            fieldList: ['fieldA', 'fieldB']
          }
        ]
      }
    ]

    describe('getUpdatedFilterItemsByURL', function () {
      it('three single filter items, two of them are in URL', function () {
        const urlParams: FilterItemURLParamsArray = [
          {
            name: 'My item 1',
            clauses: [
              {
                index: 1,
                values: 11000
              },
              {
                index: 3,
                values: 13000
              },
              {
                index: 4, // set
                clauses: [
                  {
                    index: 2,
                    values: 142000
                  }
                ]
              }
            ]
          },
          {
            name: 'My item 3',
            clauses: [
              {
                index: 1,
                values: ['311000', '312000']
              }
            ]
          }
        ]
        const expectedConfig = [
          {
            name: 'My item 1',
            type: FilterItemType.Single,
            autoApplyWhenWidgetOpen: true,
            sqlExprObj: {
              parts: [
                {
                  type: 'SINGLE',
                  displayType: 'UseLabel',
                  valueOptions: {
                    value: [{ value: 11, label: '11' }]
                  }
                },
                {
                  type: 'SINGLE',
                  valueOptions: {
                    value: [{ value: 12, label: '12' }]
                  }
                },
                {
                  type: 'SINGLE',
                  displayType: 'USE_ASK_FOR_VALUE',
                  valueOptions: {
                    value: [{ value: 13000, label: '13000' }]
                  }
                },
                {
                  type: 'SET',
                  parts: [
                    {
                      type: 'SINGLE',
                      valueOptions: {
                        value: [{ value: 141, label: '141' }]
                      }
                    },
                    {
                      type: 'SINGLE',
                      displayType: 'USE_ASK_FOR_VALUE',
                      valueOptions: {
                        value: [{ value: 142000, label: '142000' }]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            name: 'My item 2',
            type: FilterItemType.Single,
            autoApplyWhenWidgetOpen: false,
            sqlExprObj: {
              parts: [
                {
                  type: 'SINGLE',
                  valueOptions: {
                    value: [{ value: '21', label: '21' }]
                  }
                }
              ]
            }
          },
          {
            name: 'My item 3',
            type: FilterItemType.Single,
            autoApplyWhenWidgetOpen: true,
            sqlExprObj: {
              parts: [
                {
                  type: 'SINGLE',
                  displayType: 'USE_ASK_FOR_VALUE',
                  valueOptions: {
                    value: [{ value: '311000', label: '311000' }, { value: '312000', label: '312000' }]
                  }
                },
                {
                  type: 'SINGLE',
                  valueOptions: {
                    value: [{ value: '32', label: '32' }]
                  }
                }
              ]
            }
          }
        ]
        const configByByURL = getUpdatedFilterItemsByURL(Immutable(filterItems as any), urlParams)
        expect(expectedConfig).toEqual(configByByURL)
      })
      // special cases
      it('one clause with empty value, null, for three fields', function () {
        const filterItems: any[] = [{
          name: 'My item 1',
          type: FilterItemType.Single,
          autoApplyWhenWidgetOpen: true,
          sqlExprObj: {
            parts: [{
              type: 'SINGLE',
              displayType: 'USE_ASK_FOR_VALUE',
              valueOptions: { value: [{ value: 11, label: '11' }] }
            }]
          }
        }]
        const urlParams: FilterItemURLParamsArray = [{
          name: 'My item 1',
          clauses: [{ index: 1, values: null }]
        }]
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = null
        const configByByURL = getUpdatedFilterItemsByURL(Immutable(filterItems as any), urlParams)
        expect(updatedFilterItems).toEqual(configByByURL)
      })
      it('one clause with empty value, null, for date between operators', function () {
        const filterItems: any[] = [{
          name: 'My item 1',
          type: FilterItemType.Single,
          autoApplyWhenWidgetOpen: true,
          sqlExprObj: {
            parts: [{
              type: 'SINGLE',
              displayType: 'USE_ASK_FOR_VALUE',
              operator: ClauseOperator.DateOperatorIsBetween,
              valueOptions: { value: [{ value: 'YESTERDAY', label: 'Yesterday' }, { value: 12345, label: '12345' }] }
            }]
          }
        }]

        // one value is empty
        const urlParams: FilterItemURLParamsArray = [{
          name: 'My item 1',
          clauses: [{ index: 1, values: [null, 123] }]
        }]
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [null, { value: 123, label: '123' }]
        const configByByURL = getUpdatedFilterItemsByURL(Immutable(filterItems as any), urlParams)
        expect(updatedFilterItems).toEqual(configByByURL)

        // both are empty
        const urlParams2 = deepClone(urlParams)
        urlParams2[0].clauses[0].values = [null, null]
        const updatedFilterItems2 = deepClone(filterItems)
        updatedFilterItems2[0].sqlExprObj.parts[0].valueOptions.value = [null, null]
        const configByByURL2 = getUpdatedFilterItemsByURL(Immutable(filterItems as any), urlParams2)
        expect(updatedFilterItems2).toEqual(configByByURL2)
      })
      it('date field, is in the last/next, value + unit', function () {
        const filterItems: any[] = [{
          name: 'My item 1',
          type: FilterItemType.Single,
          autoApplyWhenWidgetOpen: true,
          sqlExprObj: {
            parts: [{
              type: 'SINGLE',
              displayType: 'USE_ASK_FOR_VALUE',
              operator: ClauseOperator.DateOperatorIsInTheLast,
              valueOptions: { value: [{ value: 10, label: 'WEEK' }] }
            }]
          }
        }]
        // empty value + unit
        const urlParams: FilterItemURLParamsArray = [{
          name: 'My item 1',
          clauses: [{ index: 1, values: [null, 'WEEK'] }]
        }]
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [{ value: null, label: 'WEEK' }]
        const configByByURL = getUpdatedFilterItemsByURL(Immutable(filterItems as any), urlParams)
        expect(updatedFilterItems).toEqual(configByByURL)

        // value + unit
        const urlParams2 = deepClone(urlParams)
        urlParams2[0].clauses[0].values = [20, 'MONTH']
        const updatedFilterItems2 = deepClone(filterItems)
        updatedFilterItems2[0].sqlExprObj.parts[0].valueOptions.value = [{ value: 20, label: 'MONTH' }]
        const configByByURL2 = getUpdatedFilterItemsByURL(Immutable(filterItems as any), urlParams2)
        expect(updatedFilterItems2).toEqual(configByByURL2)
      })

      it('group filter item', function () {
        const urlParams: FilterItemURLParamsArray = [
          {
            name: 'My item 1',
            clauses: [
              {
                index: 1,
                values: 1000
              }
            ]
          }
        ]
        const updatedFilterItems = deepClone(filterItemsWithGroup)
        updatedFilterItems[0].autoApplyWhenWidgetOpen = true
        updatedFilterItems[0].sqlExprObjForGroup[0].clause.valueOptions.value = [{ value: 1000, label: '1000' }]
        const configByByURL = getUpdatedFilterItemsByURL(Immutable(filterItemsWithGroup as any), urlParams)
        expect(updatedFilterItems).toEqual(configByByURL)
      })
      it('unique, handle URL label to valueOptions', function () {
        const filterItems: any[] = [{
          name: 'My item 1',
          type: FilterItemType.Single,
          autoApplyWhenWidgetOpen: true,
          sqlExprObj: {
            parts: [{
              displayType: 'USE_ASK_FOR_VALUE',
              valueOptions: {
                sourceType: ClauseSourceType.SingleSelectFromUnique,
                value: [{ value: 11, label: '11-label' }]
              }
            }]
          }
        }]
        const urlParams: FilterItemURLParamsArray = [{
          name: 'My item 1',
          clauses: [{ index: 1, values: 11000, label: '11000-label' }]
        }]
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [{ value: 11000, label: '11000-label' }]
        const configByByURL = getUpdatedFilterItemsByURL(Immutable(filterItems as any), urlParams)
        expect(updatedFilterItems).toEqual(configByByURL)
      })
      it('predefined unique, handle URL label to valueOptions', function () {
        const filterItems: any[] = [{
          name: 'My item 1',
          type: FilterItemType.Single,
          autoApplyWhenWidgetOpen: true,
          sqlExprObj: {
            parts: [{
              type: ClauseSourceType.SingleSelectFromPredefined,
              displayType: 'USE_ASK_FOR_VALUE',
              valueOptions: {
                sourceType: ClauseSourceType.SingleSelectFromPredefined,
                value: [
                  { value: 13, alias: '13-label', selected: true },
                  { value: 14, alias: '14-label', selected: false },
                  { value: 15, alias: '15-label', selected: false }
                ]
              }
            }]
          }
        }]
        const urlParams: FilterItemURLParamsArray = [{
          name: 'My item 1',
          clauses: [{ index: 1, values: 15, label: '15-label' }]
        }]
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [
          { value: 13, alias: '13-label', selected: false },
          { value: 14, alias: '14-label', selected: false },
          { value: 15, alias: '15-label', selected: true }
        ]
        const configByByURL = getUpdatedFilterItemsByURL(Immutable(filterItems as any), urlParams)
        expect(updatedFilterItems).toEqual(configByByURL)
      })
      it('predefined multiple', function () {
        const filterItems: any[] = [{
          name: 'My item 1',
          type: FilterItemType.Single,
          autoApplyWhenWidgetOpen: true,
          sqlExprObj: {
            parts: [{
              displayType: 'USE_ASK_FOR_VALUE',
              valueOptions: {
                sourceType: ClauseSourceType.MultipleSelectFromPredefined,
                value: [
                  { value: 13, alias: '13-label', selected: true },
                  { value: 14, alias: '14-label', selected: false },
                  { value: 15, alias: '15-label', selected: true }
                ]
              }
            }]
          }
        }]
        const urlParams: FilterItemURLParamsArray = [{
          name: 'My item 1',
          clauses: [{ index: 1, values: [14, 15] }]
        }]
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [
          { value: 13, alias: '13-label', selected: false },
          { value: 14, alias: '14-label', selected: true },
          { value: 15, alias: '15-label', selected: true }
        ]
        const configByByURL = getUpdatedFilterItemsByURL(Immutable(filterItems as any), urlParams)
        expect(updatedFilterItems).toEqual(configByByURL)
      })
    })

    describe('getCachedURLParamsByFilterItems', function () {
      it('unapplied to applied, no inside values are changed', function () {
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[0].autoApplyWhenWidgetOpen = true
        const expectedURL = {
          "My item 1": {name: "My item 1", clauses: []},
          "My item 3": {name: "My item 3", clauses: []}
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(filterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
      it('unapplied to applied, some inside values are changed', function () {
        // update to applied, and the value of one clause and one clause in a set
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[0].autoApplyWhenWidgetOpen = true
        updatedFilterItems[0].sqlExprObj.parts[2].valueOptions.value = [{ value: 13000, label: '13000' }]
        updatedFilterItems[0].sqlExprObj.parts[3].parts[1].valueOptions.value = [{ value: 142000, label: '142000' }, { value: 1420001, label: '1420001' }]
        const expectedURL = {
          "My item 1": {
            name: "My item 1",
            clauses:[
              {index: 3, values: 13000},
              {index: 4, clauses: [{ index: 2, values: [142000, 1420001] }]}
            ]
          },
          "My item 3": {name: "My item 3", clauses: []}
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(filterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
      it('unapplied to applied, some inside values are changed. Other applied filters also have values changed', function () {
        // update to applied, and the value of one clause and one clause in a set
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[0].autoApplyWhenWidgetOpen = true
        updatedFilterItems[0].sqlExprObj.parts[2].valueOptions.value = [{ value: 13000, label: '13000' }]
        updatedFilterItems[0].sqlExprObj.parts[3].parts[1].valueOptions.value = [{ value: 142000, label: '142000' }, { value: 1420001, label: '1420001' }]
        updatedFilterItems[2].sqlExprObj.parts[1].valueOptions.value = [{ value: '3944', label: '3944' }]
        const expectedURL = {
          "My item 1": {
            name: "My item 1",
            clauses:[
              {index: 3, values: 13000},
              {index: 4, clauses: [{ index: 2, values: [142000, 1420001] }]}
            ]
          },
          "My item 3": {
            name: "My item 3",
            clauses: [
              { index: 2, values: '3944' }
            ]
          }
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(filterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
      it('applied to unapplied, no inside values are changed', function () {
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[2].autoApplyWhenWidgetOpen = false
        const resultURL = getCachedURLParamsByFilterItems(2, Immutable(updatedFilterItems), Immutable(filterItems), {})
        expect({}).toEqual(resultURL)
      })
      it('applied to unapplied, some inside values are changed', function () {
        const updatedFilterItems = deepClone(filterItems)
        updatedFilterItems[2].autoApplyWhenWidgetOpen = false
        updatedFilterItems[2].sqlExprObj.parts[1].valueOptions.value = [{ value: '3944', label: '3944' }]
        const resultURL = getCachedURLParamsByFilterItems(2, Immutable(updatedFilterItems), Immutable(filterItems), {})
        expect({}).toEqual(resultURL)
      })
      it('applied to unapplied. Other applied filters without values changed should be kept.', function () {
        // config filter items
        const newFilterItems = deepClone(filterItems)
        newFilterItems[0].autoApplyWhenWidgetOpen = true
        // state filter items
        const updatedFilterItems = deepClone(newFilterItems)
        updatedFilterItems[2].autoApplyWhenWidgetOpen = false
        const expectedURL = {
          "My item 1": {name: "My item 1", clauses: []}
        }
        const resultURL = getCachedURLParamsByFilterItems(2, Immutable(updatedFilterItems), Immutable(newFilterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
      it('applied to unapplied. Other applied filters with values changed should be kept.', function () {
        // config filter items
        const newFilterItems = deepClone(filterItems)
        newFilterItems[0].autoApplyWhenWidgetOpen = true

        // state filter items
        const updatedFilterItems = deepClone(newFilterItems)
        updatedFilterItems[0].sqlExprObj.parts[2].valueOptions.value = [{ value: 13000, label: '13000' }]
        updatedFilterItems[2].autoApplyWhenWidgetOpen = false

        const expectedURL = {
          "My item 1": {
            name: "My item 1",
            clauses:[
              {index: 3, values: 13000}
            ]
          }
        }
        const resultURL = getCachedURLParamsByFilterItems(2, Immutable(updatedFilterItems), Immutable(newFilterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
      // special cases
      it('applied, clear selected values.', function () {
        // config filter items
        const newFilterItems: any[] = [{
          name: 'My item 1',
          type: FilterItemType.Single,
          autoApplyWhenWidgetOpen: true,
          sqlExprObj: {
            parts: [{
              type: 'SINGLE',
              displayType: 'USE_ASK_FOR_VALUE',
              valueOptions: { value: [{ value: 11, label: '11' }] }
            }]
          }
        }]

        // state filter items
        const updatedFilterItems = deepClone(newFilterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = null
        const expectedURL = {
          "My item 1": {
            name: "My item 1",
            clauses: [{ index: 1, values: null }]
          }
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(newFilterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
      it('applied, some of values are empty, date between operators.', function () {
        // config filter items
        const newFilterItems: any[] = [{
          name: 'My item 1',
          type: FilterItemType.Single,
          autoApplyWhenWidgetOpen: true,
          sqlExprObj: {
            parts: [{
              type: 'SINGLE',
              displayType: 'USE_ASK_FOR_VALUE',
              operator: ClauseOperator.DateOperatorIsBetween,
              valueOptions: { value: [{ value: 'YESTERDAY', label: 'Yesterday' }, { value: 12345, label: '12345' }] }
            }]
          }
        }]
        // state filter items - one value is empty
        const updatedFilterItems = deepClone(newFilterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [null, { value: 12345, label: '12345' }]
        const expectedURL = {
          "My item 1": {
            name: "My item 1",
            clauses: [{ index: 1, values: [null, 12345] }]
          }
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(newFilterItems), {})
        expect(expectedURL).toEqual(resultURL)

        // state filter items - both values are empty
        // const updatedFilterItems2 = deepClone(newFilterItems)
        // updatedFilterItems2[0].sqlExprObj.parts[0].valueOptions.value = [null, null]
        // const expectedURL2 = {
        //   "My item 1": {
        //     name: "My item 1",
        //     clauses: [{ index: 1, values: [null, null] }]
        //   }
        // }
        // const resultURL2 = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems2), Immutable(newFilterItems), {})
        // expect(expectedURL2).toEqual(resultURL2)
      })
      it('applied, clear selected values.', function () {
        // config filter items
        const newFilterItems: any[] = [{
          name: 'My item 1',
          type: FilterItemType.Single,
          autoApplyWhenWidgetOpen: true,
          sqlExprObj: {
            parts: [{
              type: 'SINGLE',
              operator: ClauseOperator.DateOperatorIsInTheLast,
              valueOptions: { value: [{ value: 10, label: 'WEEK' }] }
            }]
          }
        }]

        // state filter items - empty value + unit
        const updatedFilterItems = deepClone(newFilterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [{ value: null, label: 'MONTH' }]
        const expectedURL = {
          "My item 1": {
            name: "My item 1",
            clauses: [{ index: 1, values: [null, 'MONTH'] }]
          }
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(newFilterItems), {})
        expect(expectedURL).toEqual(resultURL)

        // state filter items - update value + unit
        const updatedFilterItems2 = deepClone(newFilterItems)
        updatedFilterItems2[0].sqlExprObj.parts[0].valueOptions.value = [{ value: 20, label: 'MONTH' }]
        const expectedURL2 = {
          "My item 1": {
            name: "My item 1",
            clauses: [{ index: 1, values: [20, 'MONTH'] }]
          }
        }
        const resultURL2 = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems2), Immutable(newFilterItems), {})
        expect(expectedURL2).toEqual(resultURL2)
      })
      it('group filter item', function () {
        // state filter items - update value
        const updatedFilterItems = deepClone(filterItemsWithGroup)
        updatedFilterItems[0].autoApplyWhenWidgetOpen = true
        updatedFilterItems[0].sqlExprObjForGroup[0].clause.valueOptions.value = [{ value: 1000, label: '1000' }]
        const expectedURL = {
          "My item 1": {
            name: "My item 1",
            clauses: [{ index: 1, values: 1000 }]
          }
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(filterItemsWithGroup), {})
        expect(expectedURL).toEqual(resultURL)
      })
      it('custom item, not saved to URL', function () {
        const customFilterItems: any[] = [
          {
            name: 'My custom item 1',
            type: FilterItemType.Custom,
            autoApplyWhenWidgetOpen: false,
          }
        ]
        // state filter items - update value
        const updatedFilterItems = deepClone(customFilterItems)
        updatedFilterItems[0].autoApplyWhenWidgetOpen = true
        updatedFilterItems[0].sqlExprObj = { // add clause to custom filter item
          parts: [{
            type: 'SINGLE',
            valueOptions: { value: [{ value: 1000, label: '1000' }] }
          }]
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(customFilterItems), {})
        expect({}).toEqual(resultURL)
      })
      it('selected value is 0, -1', function () {
        const newFilterItems = deepClone(filterItems)
        newFilterItems[0].sqlExprObj.parts[2].valueOptions.value = [{ value: 1, label: 'true' }]

        const updatedFilterItems = deepClone(newFilterItems)
        updatedFilterItems[0].autoApplyWhenWidgetOpen = true
        updatedFilterItems[0].sqlExprObj.parts[2].valueOptions.value = [{ value: 0, label: 'false' }]
        const expectedURL = {
          "My item 1": {name: "My item 1", clauses: [{index: 3, values: 0}]},
          "My item 3": {name: "My item 3", clauses: []}
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(newFilterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
      it('unique, save label to URL', function () {
        const uniqueFilterItems: any[] = [
          {
            name: 'My item 1',
            type: FilterItemType.Single,
            autoApplyWhenWidgetOpen: true,
            sqlExprObj: {
              parts: [
                {
                  type: 'SINGLE',
                  displayType: 'USE_ASK_FOR_VALUE',
                  valueOptions: {
                    sourceType: ClauseSourceType.SingleSelectFromUnique,
                    value: [{ value: 13, label: '13-label' }]
                  }
                }
              ]
            }
          }
        ]

        const updatedFilterItems = deepClone(uniqueFilterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [{ value: 15, label: '15-label' }]
        const expectedURL = {
          "My item 1": {name: "My item 1", clauses: [{index: 1, values: 15, label: '15-label'}]},
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(uniqueFilterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
      it('predefined unique, save label to URL', function () {
        const uniqueFilterItems: any[] = [
          {
            name: 'My item 1',
            type: FilterItemType.Single,
            autoApplyWhenWidgetOpen: true,
            sqlExprObj: {
              parts: [
                {
                  type: 'SINGLE',
                  displayType: 'USE_ASK_FOR_VALUE',
                  valueOptions: {
                    sourceType: ClauseSourceType.SingleSelectFromPredefined,
                    value: [
                      { value: 13, alias: '13-label', selected: true },
                      { value: 14, alias: '14-label', selected: false },
                      { value: 15, alias: '15-label', selected: false }
                    ]
                  }
                }
              ]
            }
          }
        ]

        const updatedFilterItems = deepClone(uniqueFilterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [
          { value: 13, alias: '13-label', selected: false },
          { value: 14, alias: '14-label', selected: false },
          { value: 15, alias: '15-label', selected: true }
        ]
        const expectedURL = {
          "My item 1": {name: "My item 1", clauses: [{index: 1, values: 15, label: '15-label'}]},
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(uniqueFilterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
      it('predefined multiple, no label to URL', function () {
        const uniqueFilterItems: any[] = [
          {
            name: 'My item 1',
            type: FilterItemType.Single,
            autoApplyWhenWidgetOpen: true,
            sqlExprObj: {
              parts: [
                {
                  type: 'SINGLE',
                  displayType: 'USE_ASK_FOR_VALUE',
                  valueOptions: {
                    sourceType: ClauseSourceType.MultipleSelectFromPredefined,
                    value: [
                      { value: 13, alias: '13-label', selected: true },
                      { value: 14, alias: '14-label', selected: true },
                      { value: 15, alias: '15-label', selected: false }
                    ]
                  }
                }
              ]
            }
          }
        ]

        const updatedFilterItems = deepClone(uniqueFilterItems)
        updatedFilterItems[0].sqlExprObj.parts[0].valueOptions.value = [
          { value: 13, alias: '13-label', selected: false },
          { value: 14, alias: '14-label', selected: true },
          { value: 15, alias: '15-label', selected: true }
        ]
        const expectedURL = {
          "My item 1": {name: "My item 1", clauses: [{index: 1, values: [14, 15]}]},
        }
        const resultURL = getCachedURLParamsByFilterItems(0, Immutable(updatedFilterItems), Immutable(uniqueFilterItems), {})
        expect(expectedURL).toEqual(resultURL)
      })
    })
  })
})
