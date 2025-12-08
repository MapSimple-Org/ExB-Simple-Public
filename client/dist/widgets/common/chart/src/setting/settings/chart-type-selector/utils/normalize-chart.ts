import type { FeatureLayerQueryParams } from 'jimu-core'
import { getSeriesType, type WebChart, type WebChartScatterplotSeries, type WebChartSeries } from 'jimu-ui/advanced/chart'
import type { IWebChart } from '../../../../config'
import { getOutStatisticName } from '../../../../utils/common'
import { isSerialSeries } from '../../../../utils/default'

/**
 * Normalize the statistic type `percentile-continuous`, inject `statisticParameters` into `outStatistics`.
 * @param query
 */
const normalizePercentileCont = (query?: FeatureLayerQueryParams): FeatureLayerQueryParams => {
  if (!query?.outStatistics) return query
  query.outStatistics = query.outStatistics.map((outStatistic) => {
    if ((outStatistic.statisticType as any) === 'percentile-continuous') {
      return {
        ...outStatistic,
        statisticParameters: { value: 0.5 }
      }
    } else {
      return outStatistic
    }
  })
  return query
}

/**
 * Function merging multiple `outStatistics` properties.
 * @param uniqueQuery
 * @param series
 */
const mergeOutStatistics = (uniqueQuery: FeatureLayerQueryParams, series: WebChartSeries[]): FeatureLayerQueryParams => {
  series.slice(1).forEach((serie) => {
    const outStatistics = (uniqueQuery.outStatistics ?? []).concat((serie.query?.outStatistics ?? []) as any)
    uniqueQuery = { ...uniqueQuery, outStatistics }
  })
  return normalizePercentileCont(uniqueQuery)
}

/**
 * Function building a unique query based on the chart series config.
 * Note: all queries have the same `groupByFieldsForStatistics`, so they can be combined into one query.
 */
const buildGroupStatUniqueQuery = (series: WebChartSeries[]): FeatureLayerQueryParams => {
  if (!series?.length) return null
  let uniqueQuery: FeatureLayerQueryParams = series[0].query as FeatureLayerQueryParams
  if (uniqueQuery.outStatistics?.length) {
    if (uniqueQuery?.groupByFieldsForStatistics?.length) {
      uniqueQuery = mergeOutStatistics(uniqueQuery, series)
    }
  } else {
    // For no-aggregation, set `outFields` to query.
    if (uniqueQuery?.groupByFieldsForStatistics?.length) {
      const outFields = buildOutFieldsQuery(series)
      uniqueQuery = { ...uniqueQuery, ...outFields }
    }
  }
  return uniqueQuery
}

/**
 * Function merging `outFields` to a unique query based on the chart series config.
 */
const buildOutFieldsQuery = (series: WebChartSeries[]): FeatureLayerQueryParams => {
  const outFields = []
  const x = series[0].x
  const y = (series[0] as any).y
  outFields.push(x)
  if (y) {
    outFields.push(y)
  }
  return { outFields }
}

/**
 * Ensure that the `outStatisticFieldName  is consistent with the `y` of the series.
 * @param series
 */
const normalizeGroupStateSeriesQuery = (series: WebChartSeries[]) => {
  return series.map((serie) => {
    const hasStatistics = serie.query?.outStatistics?.length
    if (!hasStatistics) return serie
    const y = (serie as any).y
    let query = serie.query
    const outStatistics = query?.outStatistics.map((outStatistic) => {
      return {
        ...outStatistic,
        outStatisticFieldName: y
      }
    })

    query = {
      ...query,
      outStatistics
    }

    serie = { ...serie, query }
    return serie
  })
}

/**
 * Ensure that the `id` and `y` of the series are consistent with the `onStatisticField` of the `query`.
 * @param series
 */
const normalizeGroupStateSeriesY = (series: WebChartSeries[]): WebChartSeries[] => {
  return series?.map((serie) => {
    const hasStatistics = serie.query?.outStatistics?.length
    if (!hasStatistics) return serie
    const numericField = serie.query?.outStatistics?.[0]?.onStatisticField
    const statisticType = serie.query?.outStatistics?.[0]?.statisticType as any
    const id = serie.id
    if (numericField && numericField !== id) {
      serie = { ...serie, id: numericField }
    }
    const y = getOutStatisticName(numericField, statisticType)
    if (y && y !== (serie as any).y) {
      serie = { ...serie, y } as any
    }
    return serie
  })
}

/**
 * Ensure that the `id` of the series are consistent with the `y` of the series for non-grouped statistics.
 * @param series
 */
const normalizeOutFieldsSeriesY = (series: WebChartSeries[]): WebChartSeries[] => {
  return series?.map((serie) => {
    const numericField = (serie as any).y
    if (!numericField) return serie

    const id = serie.id
    if (numericField && numericField !== id) {
      serie = { ...serie, id: numericField }
    }
    if (numericField && numericField !== (serie as any).y) {
      serie = { ...serie, y: numericField } as any
    }
    return serie
  })
}

/**
 * Normalize the `series` from map-viewer to the chart widget.
 * @param series
 * @returns
 */
const normalizeSeries = (series: WebChartSeries[]): [WebChartSeries[], FeatureLayerQueryParams] => {
  const seriesType = getSeriesType(series)
  let query = null
  if (isSerialSeries(seriesType) || seriesType === 'pieSeries') {
    series = normalizeGroupStateSeriesY(series)
    series = normalizeGroupStateSeriesQuery(series)
    query = buildGroupStatUniqueQuery(series)
  } else if (seriesType === 'scatterSeries') {
    series = normalizeOutFieldsSeriesY(series)
    query = buildOutFieldsQuery(series as WebChartScatterplotSeries[])
  }

  series = series.map((serie) => {
    delete serie.query
    return serie
  })

  return [series, query]
}

/**
 * Normalize the webChart from map-viewer to the chart widget.
 * @param webChart
 * @returns {IWebChart}
 */
const normalizeChart = (webChart: WebChart): IWebChart => {
  const [series, query] = normalizeSeries(webChart.series)
  const dataSource = { query } as any

  return {
    ...webChart,
    series: series as any,
    dataSource
  } as unknown as IWebChart
}

export default normalizeChart
