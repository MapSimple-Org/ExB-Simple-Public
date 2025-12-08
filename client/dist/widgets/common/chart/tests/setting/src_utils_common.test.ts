import { appActions, DataSourceManager, getAppStore, type IMFeatureLayerQueryParams, Immutable } from 'jimu-core'
import { getInitState } from 'jimu-for-test'
import { CategoryType } from '../../src/config'
import { getFieldSchema, getFieldsSchema } from '../../src/utils/common'
import { getCategoryType } from '../../src/utils/common/series'

jest.mock('@arcgis/charts-components', () => jest.fn())
jest.mock('@arcgis/charts-components-react', () => jest.fn())

const state = getInitState()

getAppStore().dispatch(appActions.updateStoreState(state))

describe('src/utils/common', () => {
  describe('getFieldSchema and getFieldsSchema', () => {
    let dss = null
    let mockFn = null
    beforeAll(() => {
      dss = {
        ds1: {
          getSchema: () => ({
            fields: {
              field1: {
                name: 'field1',
                alias: 'Field1'
              },
              field2: {
                name: 'field2',
                alias: 'Field2'
              }
            }
          })
        },
        ds2: {
          getSchema: () => ({
            fields: {
              field3: {
                name: 'field3',
                alias: 'Field3'
              }
            }
          })
        }
      }
      mockFn = jest.fn().mockImplementation(dsId => {
        return dss[dsId] == null ? dss.ds1 : dss[dsId]
      })
      DataSourceManager.getInstance().getDataSource = mockFn
    })

    afterEach(() => {
      mockFn.mockClear()
    })

    afterAll(() => {
      mockFn.mockRestore()
    })
    it('getFieldSchema', () => {
      expect(getFieldSchema('field1', 'ds1')).toEqual({
        name: 'field1',
        alias: 'Field1'
      })
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(getFieldSchema('field1', 'ds1')).toEqual({
        name: 'field1',
        alias: 'Field1'
      })
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(getFieldSchema('field2', 'ds1')).toEqual({
        name: 'field2',
        alias: 'Field2'
      })
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('getFieldsSchema', () => {
      expect(getFieldsSchema('ds1')).toEqual({
        field1: {
          name: 'field1',
          alias: 'Field1'
        },
        field2: {
          name: 'field2',
          alias: 'Field2'
        }
      })
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(getFieldsSchema('ds1')).toEqual({
        field1: {
          name: 'field1',
          alias: 'Field1'
        },
        field2: {
          name: 'field2',
          alias: 'Field2'
        }
      })
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(getFieldsSchema('ds2')).toEqual({
        field3: {
          name: 'field3',
          alias: 'Field3'
        }
      })
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('test some series utils', () => {
    it('getCategoryTypeFromQuery', () => {
      const groupByFieldsForStatistics = ['category0']
      const outStatistics = [
        {
          statisticType: 'sum',
          onStatisticField: 'numericField0',
          outStatisticFieldName: 'numericField0_0'
        }
      ]

      let query = Immutable({
        groupByFieldsForStatistics,
        outStatistics
      }) as IMFeatureLayerQueryParams

      expect(getCategoryType(query)).toBe(CategoryType.ByGroup)

      query = Immutable({ outStatistics }) as IMFeatureLayerQueryParams

      expect(getCategoryType(query)).toBe(CategoryType.ByField)
    })
  })
})
