import { type IMFeatureLayerQueryParams, Immutable, type ImmutableArray } from 'jimu-core'
import { getHistogramFields, getScatterPlotFields, getSerialFields, getSerialSplitByFields } from '../../src/utils/common/schema'
import type { WebChartSeries } from '../../src/config'
import { HistogramCountField, HistogramCountFieldAlias, HistogramMaxValueField, HistogramMaxValueFieldAlias, HistogramMinValueField, HistogramMinValueFieldAlias } from '../../src/constants'

jest.mock('@arcgis/charts-components', () => jest.fn())
jest.mock('@arcgis/charts-components-react', () => jest.fn())

jest.mock('../../src/utils/common/series', () => {
  return {
    ...jest.requireActual<{ [key: string]: any }>('../../src/utils/common/series'),
    getFieldSchema: field => {
      return Immutable({ name: field })
    }
  }
})
describe('src/utils/common/schema.ts', () => {
  describe('getSerialSplitByFields', () => {
    it('should work well for by group', () => {
      const query = Immutable({
        groupByFieldsForStatistics: ['Year'],
        outStatistics: [
          {
            statisticType: 'sum',
            onStatisticField: 'Beat',
            outStatisticFieldName: 'sum_of_Beat'
          }
        ],
        where: 'Primary_Ty={value}'
      }) as IMFeatureLayerQueryParams
      const series = Immutable([
        {
          query: {
            where: "Primary_Ty='ASSAULT'"
          }
        },
        {
          query: {
            where: "Primary_Ty='BATTERY'"
          }
        },
        {
          query: {
            where: "Primary_Ty='ROBBERY'"
          }
        }
      ]) as ImmutableArray<WebChartSeries>

      const res = getSerialSplitByFields(query, 'dataSourceId', series)
      expect(res).toEqual({
        Year: { jimuName: 'Year', name: 'Year', originFields: ['Year'] },
        sum_of_Beat_of_ASSAULT: { jimuName: 'sum_of_Beat_of_ASSAULT', name: 'sum_of_Beat_of_ASSAULT', alias: 'Sum of Beat of ASSAULT', originFields: ['Beat', 'Primary_Ty'] },
        sum_of_Beat_of_BATTERY: { jimuName: 'sum_of_Beat_of_BATTERY', name: 'sum_of_Beat_of_BATTERY', alias: 'Sum of Beat of BATTERY', originFields: ['Beat', 'Primary_Ty'] },
        sum_of_Beat_of_ROBBERY: { jimuName: 'sum_of_Beat_of_ROBBERY', name: 'sum_of_Beat_of_ROBBERY', alias: 'Sum of Beat of ROBBERY', originFields: ['Beat', 'Primary_Ty'] }
      })
    })
    it('should work well for by group for statistic count', () => {
      const query = Immutable({
        groupByFieldsForStatistics: ['Year'],
        outStatistics: [
          {
            statisticType: 'count',
            onStatisticField: 'FID',
            outStatisticFieldName: 'count_of_FID'
          }
        ],
        where: 'Primary_Ty={value}'
      }) as IMFeatureLayerQueryParams
      const series = Immutable([
        {
          query: {
            where: "Primary_Ty='ASSAULT'"
          }
        },
        {
          query: {
            where: "Primary_Ty='BATTERY'"
          }
        },
        {
          query: {
            where: "Primary_Ty='ROBBERY'"
          }
        }
      ]) as ImmutableArray<WebChartSeries>

      const res = getSerialSplitByFields(query, 'dataSourceId', series)
      expect(res).toEqual({
        Year: { jimuName: 'Year', name: 'Year', originFields: ['Year'] },
        count_of_FID_of_ASSAULT: { jimuName: 'count_of_FID_of_ASSAULT', name: 'count_of_FID_of_ASSAULT', alias: 'Count of FID of ASSAULT', originFields: ['FID', 'Primary_Ty'], esriType: 'esriFieldTypeInteger', format: { places: 0 } },
        count_of_FID_of_BATTERY: { jimuName: 'count_of_FID_of_BATTERY', name: 'count_of_FID_of_BATTERY', alias: 'Count of FID of BATTERY', originFields: ['FID', 'Primary_Ty'], esriType: 'esriFieldTypeInteger', format: { places: 0 } },
        count_of_FID_of_ROBBERY: { jimuName: 'count_of_FID_of_ROBBERY', name: 'count_of_FID_of_ROBBERY', alias: 'Count of FID of ROBBERY', originFields: ['FID', 'Primary_Ty'], esriType: 'esriFieldTypeInteger', format: { places: 0 } }
      })
    })
    it('should work well for no aggregation', () => {
      const query = Immutable({
        groupByFieldsForStatistics: ['Year'],
        outFields: ['Beat'],
        where: 'Primary_Ty={value}'
      }) as IMFeatureLayerQueryParams
      const series = Immutable([
        {
          query: {
            where: "Primary_Ty='ASSAULT'"
          }
        },
        {
          query: {
            where: "Primary_Ty='BATTERY'"
          }
        },
        {
          query: {
            where: "Primary_Ty='ROBBERY'"
          }
        }
      ]) as ImmutableArray<WebChartSeries>

      const res = getSerialSplitByFields(query, 'dataSourceId', series)
      expect(res).toEqual({
        Year: { jimuName: 'Year', name: 'Year', originFields: ['Year'] },
        Beat_of_ASSAULT: { jimuName: 'Beat_of_ASSAULT', name: 'Beat_of_ASSAULT', alias: 'Beat of ASSAULT', originFields: ['Beat', 'Primary_Ty'] },
        Beat_of_BATTERY: { jimuName: 'Beat_of_BATTERY', name: 'Beat_of_BATTERY', alias: 'Beat of BATTERY', originFields: ['Beat', 'Primary_Ty'] },
        Beat_of_ROBBERY: { jimuName: 'Beat_of_ROBBERY', name: 'Beat_of_ROBBERY', alias: 'Beat of ROBBERY', originFields: ['Beat', 'Primary_Ty'] }
      })
    })
    it('should work well for split values of by group', () => {
      const query = Immutable({
        groupByFieldsForStatistics: ['Year'],
        outStatistics: [
          {
            statisticType: 'sum',
            onStatisticField: 'Beat',
            outStatisticFieldName: 'sum_of_Beat'
          }
        ],
        where: 'Primary_Ty={value}'
      }) as IMFeatureLayerQueryParams
      const series = Immutable([
        {
          query: {
            where: "Primary_Ty='ASSAULT'"
          }
        },
        {
          query: {
            where: "Primary_Ty='BATTERY'"
          }
        },
        {
          query: {
            where: "Primary_Ty='ROBBERY'"
          }
        }
      ]) as ImmutableArray<WebChartSeries>

      const splitValues = ['ASSAULT', 'STEAL', 'FRAUD']

      const res = getSerialSplitByFields(query, 'dataSourceId', series, splitValues)
      expect(res).toEqual({
        Year: { jimuName: 'Year', name: 'Year', originFields: ['Year'] },
        sum_of_Beat_of_ASSAULT: { jimuName: 'sum_of_Beat_of_ASSAULT', name: 'sum_of_Beat_of_ASSAULT', alias: 'Sum of Beat of ASSAULT', originFields: ['Beat', 'Primary_Ty'] },
        sum_of_Beat_of_BATTERY: { jimuName: 'sum_of_Beat_of_BATTERY', name: 'sum_of_Beat_of_BATTERY', alias: 'Sum of Beat of BATTERY', originFields: ['Beat', 'Primary_Ty'] },
        sum_of_Beat_of_ROBBERY: { jimuName: 'sum_of_Beat_of_ROBBERY', name: 'sum_of_Beat_of_ROBBERY', alias: 'Sum of Beat of ROBBERY', originFields: ['Beat', 'Primary_Ty'] },
        sum_of_Beat_of_STEAL: { jimuName: 'sum_of_Beat_of_STEAL', name: 'sum_of_Beat_of_STEAL', alias: 'Sum of Beat of STEAL', originFields: ['Beat', 'Primary_Ty'] },
        sum_of_Beat_of_FRAUD: { jimuName: 'sum_of_Beat_of_FRAUD', name: 'sum_of_Beat_of_FRAUD', alias: 'Sum of Beat of FRAUD', originFields: ['Beat', 'Primary_Ty'] }
      })
    })
    it('should work well for split values of no aggregation', () => {
      const query = Immutable({
        groupByFieldsForStatistics: ['Year'],
        outFields: ['Beat'],
        where: 'Primary_Ty={value}'
      }) as IMFeatureLayerQueryParams
      const series = Immutable([
        {
          query: {
            where: "Primary_Ty='ASSAULT'"
          }
        },
        {
          query: {
            where: "Primary_Ty='BATTERY'"
          }
        },
        {
          query: {
            where: "Primary_Ty='ROBBERY'"
          }
        }
      ]) as ImmutableArray<WebChartSeries>

      const splitValues = ['ASSAULT', 'STEAL', 'FRAUD']

      const res = getSerialSplitByFields(query, 'dataSourceId', series, splitValues)
      expect(res).toEqual({
        Year: { jimuName: 'Year', name: 'Year', originFields: ['Year'] },
        Beat_of_ASSAULT: { jimuName: 'Beat_of_ASSAULT', name: 'Beat_of_ASSAULT', alias: 'Beat of ASSAULT', originFields: ['Beat', 'Primary_Ty'] },
        Beat_of_BATTERY: { jimuName: 'Beat_of_BATTERY', name: 'Beat_of_BATTERY', alias: 'Beat of BATTERY', originFields: ['Beat', 'Primary_Ty'] },
        Beat_of_ROBBERY: { jimuName: 'Beat_of_ROBBERY', name: 'Beat_of_ROBBERY', alias: 'Beat of ROBBERY', originFields: ['Beat', 'Primary_Ty'] },
        Beat_of_STEAL: { jimuName: 'Beat_of_STEAL', name: 'Beat_of_STEAL', alias: 'Beat of STEAL', originFields: ['Beat', 'Primary_Ty'] },
        Beat_of_FRAUD: { jimuName: 'Beat_of_FRAUD', name: 'Beat_of_FRAUD', alias: 'Beat of FRAUD', originFields: ['Beat', 'Primary_Ty'] }
      })
    })
  })
  describe('getSerialFields', () => {
    it('should work well for by group', () => {
      const query = Immutable({
        groupByFieldsForStatistics: ['Year'],
        outStatistics: [
          {
            statisticType: 'sum',
            onStatisticField: 'Beat',
            outStatisticFieldName: 'sum_of_Beat'
          },
          {
            statisticType: 'sum',
            onStatisticField: 'District',
            outStatisticFieldName: 'sum_of_District'
          }
        ],
      }) as IMFeatureLayerQueryParams

      const res = getSerialFields(query, 'dataSourceId')
      expect(res).toEqual({
        Year: { jimuName: 'Year', name: 'Year', originFields: ['Year'] },
        sum_of_Beat: { jimuName: 'sum_of_Beat', name: 'sum_of_Beat', alias: 'Sum of Beat', originFields: ['Beat'] },
        sum_of_District: { jimuName: 'sum_of_District', name: 'sum_of_District', alias: 'Sum of District', originFields: ['District'] }
      })
    })
    it('should work well for by group for statistic count', () => {
      const query = Immutable({
        groupByFieldsForStatistics: ['Year'],
        outStatistics: [
          {
            statisticType: 'count',
            onStatisticField: 'FID',
            outStatisticFieldName: 'count_of_FID'
          }
        ],
      }) as IMFeatureLayerQueryParams

      const res = getSerialFields(query, 'dataSourceId')
      expect(res).toEqual({
        Year: { jimuName: 'Year', name: 'Year', originFields: ['Year'] },
        count_of_FID: { jimuName: 'count_of_FID', name: 'count_of_FID', alias: 'Count of FID', esriType: 'esriFieldTypeInteger', originFields: ['FID'], format: { places: 0 } }
      })
    })
    it('should work well for no aggregation', () => {
      const query = Immutable({
        groupByFieldsForStatistics: ['Year'],
        outFields: ['Beat', 'District'],
      }) as IMFeatureLayerQueryParams

      const res = getSerialFields(query, 'dataSourceId')
      expect(res).toEqual({
        Year: { jimuName: 'Year', name: 'Year', originFields: ['Year'] },
        Beat: { jimuName: 'Beat', name: 'Beat', originFields: ['Beat'] },
        District: { jimuName: 'District', name: 'District', originFields: ['District'] }
      })
    })
  })
  describe('getHistogramFields', () => {
    it('should work well', () => {
      const query = Immutable({
        outFields: ['Beat']
      }) as IMFeatureLayerQueryParams
      const res = getHistogramFields(query, 'dataSourceId')
      expect(res).toEqual({
        [HistogramMinValueField]: {
          jimuName: HistogramMinValueField,
          name: HistogramMinValueField,
          alias: HistogramMinValueFieldAlias,
          originFields: ['Beat'],
          type: 'NUMBER',
          esriType: 'esriFieldTypeDouble',
          format: { digitSeparator: true, places: 3 }
        },
        [HistogramMaxValueField]: {
          jimuName: HistogramMaxValueField,
          name: HistogramMaxValueField,
          alias: HistogramMaxValueFieldAlias,
          originFields: ['Beat'],
          type: 'NUMBER',
          esriType: 'esriFieldTypeDouble',
          format: { digitSeparator: true, places: 3 }
        },
        [HistogramCountField]: {
          jimuName: HistogramCountField,
          name: HistogramCountField,
          alias: HistogramCountFieldAlias,
          originFields: ['Beat'],
          type: 'NUMBER',
          esriType: 'esriFieldTypeInteger',
          format: { digitSeparator: true, places: 0 }
        }
      })
    })
  })

  describe('getScatterPlotFields', () => {
    it('should work well', () => {
      const query = Immutable({
        outFields: ['District', 'Ward']
      }) as IMFeatureLayerQueryParams
      const res = getScatterPlotFields(query, 'dataSourceId')
      expect(res).toEqual({
        District: { jimuName: 'District', name: 'District', originFields: ['District'] },
        Ward: { jimuName: 'Ward', name: 'Ward', originFields: ['Ward'] }
      })
    })
  })
})
