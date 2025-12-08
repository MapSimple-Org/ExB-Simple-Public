import type { DataSource, FeatureLayerQueryParams, FieldSchema, ImmutableObject } from 'jimu-core'
import { getSeriesType, getSplitByField, type LimitBehavior, type ChartElementLimit, type ChartTypes } from 'jimu-ui/advanced/chart'
import { isSerialSeries } from '../../../../utils/default'

/**
 * Convert the matching coded label into coded value
 */
export const matchCodedValueLabel = (data: { [key: string]: any }) => {
  const domainFieldName = data.arcgis_charts_type_domain_field_name
  if (typeof domainFieldName !== 'string') return data
  const domainFieldValue = data.arcgis_charts_type_domain_id_value
  if (data[domainFieldName] && domainFieldValue) {
    data.arcgis_charts_type_domain_id_label = data[domainFieldName]
    data[domainFieldName] = domainFieldValue
  }
  return data
}

const NoAggregationSplitByFieldNameRegexp = /(?<!^)_(of)_(?!$)/
const isNoAggregationSplitByFieldName = (fieldName: string) => {
  return NoAggregationSplitByFieldNameRegexp.test(fieldName)
}
/**
 * The schema field of split-by with no-aggregation is in the format of `{NumberField}_of_{SplitByFieldValue}`,
 * the data returned from the chart component is in the format of `{NumberField}_{SplitByFieldValue}`, this function
 * converts the data to the schema format.
 */
export const convertSplitByNoAggregationDataToSchemaFormat = (data: any[], fields: ImmutableObject<{ [jimuName: string]: FieldSchema }>) => {
  if (!fields) return data
  const fieldMap = {}
  for (const [fieldName, fieldInfo] of Object.entries(fields)) {
    if (fieldInfo.originFields?.length === 2 && isNoAggregationSplitByFieldName(fieldName)) {
      const dataFieldName = fieldName.replace('_of_', '_')
      fieldMap[dataFieldName] = fieldName
    }
  }

  return data.map(item => {
    const newItem = {}
    for (const [key, value] of Object.entries(item)) {
      if (fieldMap[key]) {
        newItem[fieldMap[key]] = value
      } else {
        newItem[key] = value
      }
    }
    return newItem
  })
}


export const createRecordsFromChartData = (data = [], dataSource: DataSource, isSplitByNoAggregation?: boolean) => {
  const idField = dataSource.getIdField()
  if (isSplitByNoAggregation) {
    data = convertSplitByNoAggregationDataToSchemaFormat(data, dataSource.getSchema()?.fields)
  }
  const records = data?.map((item, i) => {
    const feature = { attributes: null }
    let data = { ...item }
    data[idField] = i
    data = matchCodedValueLabel(data)
    feature.attributes = data
    return dataSource.buildRecord(feature)
  })

  return records
}

export const getDataItemsFromChartPayloadData = (type: ChartTypes, detail) => {
  let dataItems = []
  if (isSerialSeries(type) || type === 'pieSeries' || type === 'scatterSeries' || type === 'gaugeSeries') {
    dataItems = detail?.dataItems
  } else if (type === 'histogramSeries') {
    dataItems = detail?.bins
  }
  return dataItems
}

export const getMinSafeValue = (v1, v2) => {
  if (v1 == null && v2 == null) return
  if (v1 == null && v2 != null) return v2
  if (v1 != null && v2 == null) return v1
  return Math.min(v1, v2)
}


export const getDataItemsWithMixedValue = (dataItems, mixedValue: { [key: string]: any }) => {
  if (!mixedValue || !dataItems) return dataItems
  return dataItems.map((item) => {
    return { ...item, ...mixedValue }
  })
}

export const getChartLimits = (series: any, defaultChartLimits: Partial<ChartElementLimit>, num?: number) => {
  const chartLimits: Partial<ChartElementLimit> = {}
  const seriesLength = series?.length
  if (!seriesLength) return defaultChartLimits
  const seriesType = getSeriesType(series)

  let behaviorAfterLimit: LimitBehavior = 'reject'

  if (seriesType === 'scatterSeries') {
    chartLimits.maxScatterPointsBeforeAggregation = defaultChartLimits.maxScatterPointsBeforeAggregation
    chartLimits.maxScatterPointsAfterAggregation = defaultChartLimits.maxScatterPointsAfterAggregation
  }

  let limitKey = ''
  let limitNum = -1

  if (seriesType === 'barSeries') {
    chartLimits.maxBarChartSeriesCount = defaultChartLimits.maxBarChartSeriesCount
    if (series.length === 1) {
      limitKey = 'maxBarUniqueSeriesCountTotal'
    } else if (series.length === 2) {
      chartLimits.maxBarTwoSeriesCountTotal = defaultChartLimits.maxBarTwoSeriesCountTotal
      limitKey = 'maxBarTwoSeriesCountPerSeries'
    } else if (series.length > 2) {
      chartLimits.maxBarThreePlusSeriesCountTotal = defaultChartLimits.maxBarThreePlusSeriesCountTotal
      limitKey = 'maxBarThreePlusSeriesCountPerSeries'
    }
  } else if (seriesType === 'lineSeries') {
    chartLimits.maxLineChartSeriesCount = defaultChartLimits.maxLineChartSeriesCount
    if (series.length === 1) {
      limitKey = 'maxLineUniqueSeriesCountTotal'
    } else if (series.length === 2) {
      chartLimits.maxLineTwoSeriesCountTotal = defaultChartLimits.maxLineTwoSeriesCountTotal
      limitKey = 'maxLineTwoSeriesCountPerSeries'
    } else if (series.length > 2) {
      chartLimits.maxLineThreePlusSeriesCountTotal = defaultChartLimits.maxLineThreePlusSeriesCountTotal
      limitKey = 'maxLineThreePlusSeriesCountPerSeries'
    }
  } else if (seriesType === 'pieSeries') {
    limitKey = 'maxPieChartSliceCountTotal'
  }
  const defaultLimitNum = defaultChartLimits[limitKey]
  if (num && num <= defaultLimitNum) {
    limitNum = num
    behaviorAfterLimit = 'renderUpToTheLimit'
  } else {
    limitNum = defaultLimitNum
  }
  if (limitKey) {
    chartLimits[limitKey] = limitNum
  }
  chartLimits.behaviorAfterLimit = behaviorAfterLimit
  return chartLimits
}

export const isSplitByNoAggregationChart = (query: ImmutableObject<FeatureLayerQueryParams>) => {
  const splitByField = getSplitByField(query?.where, true)
  const NoAggregation = query?.outFields?.length > 0 && !query?.outStatistics?.length
  return splitByField && NoAggregation
}

export { useChartRenderState } from './use-render-state'
export { useSelection } from './use-selection'
export { normalizeAxes } from './normalize-axes'
export { normalizeSeries } from './normalize-series'
