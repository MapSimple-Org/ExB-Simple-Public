import { DataSourceManager, CONSTANTS, type ImmutableArray, type FeatureLayerDataSource, type DataSource } from 'jimu-core'
import type { WebChartOrderOptions, WebChartSeries } from '../../../../../../../config'
import { type WebChartTemporalBinningUnits, getSeriesType } from 'jimu-ui/advanced/chart'
import { UnitSelectorDateWeekUnits, UnitSelectorTimeUnits } from 'jimu-ui/advanced/style-setting-components'
import { DateTimeUnitsMap, DefaultOrderValue } from '../../../components'

const getClosestDistance = (a, b, c) => {
  const distanceToA = Math.abs(c - a)
  const distanceToB = Math.abs(c - b)

  if (distanceToA < distanceToB) {
    return distanceToA
  } else {
    return distanceToB
  }
}

/**
 * Get appropriate time unit for time binning.
 */
export const getAppropriateTimeUnit = (startTime: number, endTime: number, minPeriod = 3, maxPeriod = 50): WebChartTemporalBinningUnits => {
  const units = [...UnitSelectorDateWeekUnits, ...UnitSelectorTimeUnits]
  const valuesInSeconds = [31536000, 2592000, 604800, 86400, 3600, 60, 1]

  const durationInSeconds = (endTime - startTime) / 1000

  const candidates = []

  for (let i = 0; i < units.length; i++) {
    const count = Math.floor(durationInSeconds / valuesInSeconds[i])
    candidates.push({
      unit: units[i],
      count: count
    })
  }

  if (candidates.length === 0) {
    candidates.push({
      unit: 'second',
      count: Math.floor(durationInSeconds)
    })
  }

  candidates.sort((c1, c2) => getClosestDistance(minPeriod, maxPeriod, c1.count) - getClosestDistance(minPeriod, maxPeriod, c2.count))

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]
    if (candidate.count >= minPeriod && candidate.count <= maxPeriod) {
      return DateTimeUnitsMap[candidate.unit] as WebChartTemporalBinningUnits
    }
  }

  return DateTimeUnitsMap[candidates[0].unit] as WebChartTemporalBinningUnits
}

export const fetchFieldRange = async (field: string, dataSourceId: string): Promise<[number, number, number]> => {
  return new Promise((resolve, reject) => {
    const dataSource = DataSourceManager.getInstance().getDataSource(
      dataSourceId
    ) as FeatureLayerDataSource
    if (!dataSource || !field) reject(new Error('No required field or dataSource'))
    const idField = dataSource.getIdField()
    const query = {
      outStatistics: [
        {
          onStatisticField: field,
          outStatisticFieldName: 'min_value',
          statisticType: 'min'
        },
        {
          onStatisticField: field,
          outStatisticFieldName: 'max_value',
          statisticType: 'max'
        },
        {
          onStatisticField: idField,
          outStatisticFieldName: 'count_value',
          statisticType: 'count'
        }
      ] as any,
      returnGeometry: false
    }
    dataSource.query(query).then((res) => {
      const attributes = res?.records?.[0].getData()
      const min = attributes?.min_value ?? attributes?.MIN_VALUE
      const max = attributes?.max_value ?? attributes?.MAX_VALUE
      const count = attributes?.count_value ?? attributes?.COUNT_VALUE
      resolve([min, max, count])
    }).catch((error) => {
      reject(new Error(error))
    })
  })
}

const isDataSourceSupportSplitBy = (dataSource: DataSource) => {
  if (!dataSource) return false
  const isOutput = dataSource.getDataSourceJson().isOutputFromWidget
  const isSelectDs = dataSource.dataViewId === CONSTANTS.SELECTION_DATA_VIEW_ID
  return !isOutput && !isSelectDs
}

export const isSupportSplitBy = (dataSourceId: string, series: ImmutableArray<WebChartSeries>) => {
  const dataSource = DataSourceManager.getInstance().getDataSource(dataSourceId)
  const dsSupported = isDataSourceSupportSplitBy(dataSource)
  const seriesType = getSeriesType(series as any)
  return dsSupported && seriesType !== 'pieSeries'
}

export const getDefaultOrderOptions = (orderField: string, useSplitBy: boolean) => {
  let orderOptions: WebChartOrderOptions = { data: DefaultOrderValue }
  if (!useSplitBy) {
    const orderByFields = [`${orderField} ${DefaultOrderValue.orderBy}`]
    orderOptions = { orderByFields, ...orderOptions }
  }
  return orderOptions
}
