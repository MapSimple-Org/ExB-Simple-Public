import { ChartLimits } from '../../src/constants'
import { convertSplitByNoAggregationDataToSchemaFormat, createRecordsFromChartData, getChartLimits, matchCodedValueLabel } from '../../src/runtime/chart/web-chart/utils'

jest.mock('@arcgis/charts-components', () => jest.fn())
jest.mock('@arcgis/charts-components-react', () => jest.fn())
describe('src/runtime/chart/utils/index.ts', () => {
  describe('getChartLimits', () => {
    it('should work well when no `num`', () => {
      let series = [{
        type: 'barSeries'
      }]
      let res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarUniqueSeriesCountTotal: 10000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarTwoSeriesCountPerSeries: 1000,
        maxBarTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarThreePlusSeriesCountPerSeries: 100,
        maxBarThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineUniqueSeriesCountTotal: 10000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineTwoSeriesCountPerSeries: 1000,
        maxLineTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineThreePlusSeriesCountPerSeries: 100,
        maxLineThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'pieSeries'
      }]
      res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxPieChartSliceCountTotal: 300
      })
    })

    it('should work well when `num` less than default limit', () => {
      let series = [{
        type: 'barSeries'
      }]
      let res = getChartLimits(series, ChartLimits, 10)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxBarChartSeriesCount: 100,
        maxBarUniqueSeriesCountTotal: 10
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits, 10)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxBarChartSeriesCount: 100,
        maxBarTwoSeriesCountPerSeries: 10,
        maxBarTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits, 10)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxBarChartSeriesCount: 100,
        maxBarThreePlusSeriesCountPerSeries: 10,
        maxBarThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 100)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxLineChartSeriesCount: 100,
        maxLineUniqueSeriesCountTotal: 100
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 100)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxLineChartSeriesCount: 100,
        maxLineTwoSeriesCountPerSeries: 100,
        maxLineTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 100)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxLineChartSeriesCount: 100,
        maxLineThreePlusSeriesCountPerSeries: 100,
        maxLineThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'pieSeries'
      }]
      res = getChartLimits(series, ChartLimits, 100)
      expect(res).toEqual({
        behaviorAfterLimit: 'renderUpToTheLimit',
        maxPieChartSliceCountTotal: 100
      })
    })

    it('should work well when `num` more than default limit', () => {
      let series = [{
        type: 'barSeries'
      }]
      let res = getChartLimits(series, ChartLimits, 11000)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarUniqueSeriesCountTotal: 10000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits, 1100)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarTwoSeriesCountPerSeries: 1000,
        maxBarTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }, {
        type: 'barSeries'
      }]
      res = getChartLimits(series, ChartLimits, 200)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxBarChartSeriesCount: 100,
        maxBarThreePlusSeriesCountPerSeries: 100,
        maxBarThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 11000)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineUniqueSeriesCountTotal: 10000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 5100)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineTwoSeriesCountPerSeries: 1000,
        maxLineTwoSeriesCountTotal: 2000
      })

      series = [{
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }, {
        type: 'lineSeries'
      }]
      res = getChartLimits(series, ChartLimits, 3500)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxLineChartSeriesCount: 100,
        maxLineThreePlusSeriesCountPerSeries: 100,
        maxLineThreePlusSeriesCountTotal: 2000
      })

      series = [{
        type: 'pieSeries'
      }]
      res = getChartLimits(series, ChartLimits, 330)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxPieChartSliceCountTotal: 300
      })
    })

    it('should work well for scatter-plot', () => {
      const series = [{
        type: 'scatterSeries'
      }]
      const res = getChartLimits(series, ChartLimits)
      expect(res).toEqual({
        behaviorAfterLimit: 'reject',
        maxScatterPointsBeforeAggregation: 10000,
        maxScatterPointsAfterAggregation: 10000
      })
    })
  })
  describe('matchCodedValueLabel', () => {
    it('matchCodedValueLabel', () => {
      let dataItem: { [key: string]: any } = {
        OBJECTID_count: 2,
        MISMATCH: 'matching fields one'
      }
      expect(matchCodedValueLabel(dataItem)).toEqual({
        OBJECTID_count: 2,
        MISMATCH: 'matching fields one'
      })
      dataItem = {
        OBJECTID_count: 2,
        MISMATCH: 'matching fields one',
        arcgis_charts_type_domain_field_name: 'MISMATCH',
        arcgis_charts_type_domain_id_value: 'one'
      }
      expect(matchCodedValueLabel(dataItem)).toEqual({
        OBJECTID_count: 2,
        MISMATCH: 'one',
        arcgis_charts_type_domain_field_name: 'MISMATCH',
        arcgis_charts_type_domain_id_value: 'one',
        arcgis_charts_type_domain_id_label: 'matching fields one'
      })
    })
  })

  describe('createRecordsFromChartData', () => {
    it('createRecordsFromChartData', () => {
      const dataSource = {
        getIdField: () => 'objectid',
        buildRecord: (feature) => feature.attributes
      } as any

      let dataItems: Array<{ [key: string]: any }> = [
        {
          OBJECTID_count: 2,
          MISMATCH: 'matching fields one'
        },
        {
          OBJECTID_count: 1,
          MISMATCH: 'matching fields three'
        },
        {
          OBJECTID_count: 1,
          MISMATCH: 'matching fields two'
        }
      ]

      expect(createRecordsFromChartData(dataItems, dataSource)).toEqual([
        {
          objectid: 0,
          OBJECTID_count: 2,
          MISMATCH: 'matching fields one'
        },
        {
          objectid: 1,
          OBJECTID_count: 1,
          MISMATCH: 'matching fields three'
        },
        {
          objectid: 2,
          OBJECTID_count: 1,
          MISMATCH: 'matching fields two'
        }
      ])

      dataItems = [
        {
          OBJECTID_count: 2,
          MISMATCH: 'matching fields one',
          arcgis_charts_type_domain_field_name: 'MISMATCH',
          arcgis_charts_type_domain_id_value: 'one'
        },
        {
          OBJECTID_count: 1,
          MISMATCH: 'matching fields three',
          arcgis_charts_type_domain_field_name: 'MISMATCH',
          arcgis_charts_type_domain_id_value: 'three'
        },
        {
          OBJECTID_count: 1,
          MISMATCH: 'matching fields two',
          arcgis_charts_type_domain_field_name: 'MISMATCH',
          arcgis_charts_type_domain_id_value: 'two'
        }
      ]
      expect(createRecordsFromChartData(dataItems, dataSource)).toEqual([
        {
          objectid: 0,
          OBJECTID_count: 2,
          MISMATCH: 'one',
          arcgis_charts_type_domain_field_name: 'MISMATCH',
          arcgis_charts_type_domain_id_value: 'one',
          arcgis_charts_type_domain_id_label: 'matching fields one'
        },
        {
          objectid: 1,
          OBJECTID_count: 1,
          MISMATCH: 'three',
          arcgis_charts_type_domain_field_name: 'MISMATCH',
          arcgis_charts_type_domain_id_value: 'three',
          arcgis_charts_type_domain_id_label: 'matching fields three'
        },
        {
          objectid: 2,
          OBJECTID_count: 1,
          MISMATCH: 'two',
          arcgis_charts_type_domain_field_name: 'MISMATCH',
          arcgis_charts_type_domain_id_value: 'two',
          arcgis_charts_type_domain_id_label: 'matching fields two'
        }
      ])
    })
  })

  describe('convertSplitByNoAggregationDataToSchemaFormat', () => {
    it('should return the original data when fields are null or undefined', () => {
      const data = [
        { field1: 'value1', field2: 'value2', field3: 'value3' },
        { field1: 'value4', field2: 'value5', field3: 'value6' }
      ]

      const result = convertSplitByNoAggregationDataToSchemaFormat(data, null)
      expect(result).toEqual(data)

      const resultUndefined = convertSplitByNoAggregationDataToSchemaFormat(data, undefined)
      expect(resultUndefined).toEqual(data)
    })

    it('should map fields correctly when fields contain valid mappings', () => {
      let data = [
        { field1_field2: 'value1', field3: 'value2', field4_field5: 'value3' },
        { field1_field2: 'value4', field3: 'value5', field4_field5: 'value6' }
      ]

      let fields = {
        field1_of_field2: {
          jimuName: 'field1_of_field2',
          name: 'field1_of_field2',
          originFields: ['field1', 'field2']
        },
        field3: {
          jimuName: 'field3',
          name: 'field3'
        },
        field4_of_field5: {
          jimuName: 'field4_of_field5',
          name: 'field4_of_field5',
          originFields: ['field4', 'field5']
        }
      } as any

      let result = convertSplitByNoAggregationDataToSchemaFormat(data, fields)
      expect(result).toEqual([
        { field1_of_field2: 'value1', field3: 'value2', field4_of_field5: 'value3' },
        { field1_of_field2: 'value4', field3: 'value5', field4_of_field5: 'value6' }
      ])

      data = [
        {
          __outputid__: 107,
          Primary_Ty: "ROBBERY",
          Year: 2010,
          Beat_ROBBERY: 333
        },
        {
          __outputid__: 61,
          Primary_Ty: "ASSAULT",
          Year: 2012,
          Beat_ASSAULT: 735
        },
        {
          __outputid__: 42,
          Primary_Ty: "BATTERY",
          Year: 2013,
          Beat_BATTERY: 334
        }
      ] as any
      fields = {
        __outputid__: {
          jimuName: "__outputid__",
          alias: "OBJECTID",
          type: "NUMBER",
          esriType: "esriFieldTypeOID",
          name: "__outputid__"
        },
        Year: {
          jimuName: "Year",
          name: "Year",
          type: "NUMBER",
          esriType: "esriFieldTypeInteger",
          alias: "Year Alias",
          format: {
        digitSeparator: true,
        places: 0
          },
          originFields: ["Year"]
        },
        Beat_of_ASSAULT: {
          jimuName: "Beat_of_ASSAULT",
          originFields: ["Beat", "Primary_Ty"],
          alias: "Beat of ASSAULT"
        },
        Beat_of_BATTERY: {
          jimuName: "Beat_of_BATTERY",
          originFields: ["Beat", "Primary_Ty"],
          alias: "Beat of BATTERY"
        },
        Beat_of_ROBBERY: {
          jimuName: "Beat_of_ROBBERY",
          originFields: ["Beat", "Primary_Ty"],
          alias: "Beat of ROBBERY"
        }
      }
      result = convertSplitByNoAggregationDataToSchemaFormat(data, fields)
      expect(result).toEqual([
        {
          __outputid__: 107,
          Primary_Ty: "ROBBERY",
          Year: 2010,
          Beat_of_ROBBERY: 333
        },
        {
          __outputid__: 61,
          Primary_Ty: "ASSAULT",
          Year: 2012,
          Beat_of_ASSAULT: 735
        },
        {
          __outputid__: 42,
          Primary_Ty: "BATTERY",
          Year: 2013,
          Beat_of_BATTERY: 334
        }
      ])
    })

    it('should return the original data when fields contain no mappings', () => {
      const data = [
        { field1: 'value1', field2: 'value2', field3: 'value3' },
        { field1: 'value4', field2: 'value5', field3: 'value6' }
      ]

      const fields = {
        field6: {
          jimuName: 'field6',
          name: 'field6'
        }
      } as any

      const result = convertSplitByNoAggregationDataToSchemaFormat(data, fields)
      expect(result).toEqual(data)
    })

    it('should handle empty data correctly', () => {
      const data: any[] = []
      const fields = {
        field1_of_field2: {
          jimuName: 'field1_of_field2',
          name: 'field1_of_field2',
          originFields: ['field1', 'field2']
        },
        field4_of_field5: {
          jimuName: 'field4_of_field5',
          name: 'field4_of_field5',
          originFields: ['field4', 'field5']
        }
      } as any

      const result = convertSplitByNoAggregationDataToSchemaFormat(data, fields)
      expect(result).toEqual([])
    })

    it('should handle empty fields correctly', () => {
      const data = [
        { field1: 'value1', field2: 'value2', field3: 'value3' },
        { field1: 'value4', field2: 'value5', field3: 'value6' }
      ]

      const fields = {} as any

      const result = convertSplitByNoAggregationDataToSchemaFormat(data, fields)
      expect(result).toEqual(data)
    })
  })

})
