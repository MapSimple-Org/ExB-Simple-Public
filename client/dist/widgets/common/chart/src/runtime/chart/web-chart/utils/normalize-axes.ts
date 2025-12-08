import type { FeatureLayerQueryParams, ImmutableArray, ImmutableObject } from 'jimu-core'
import { getSeriesType, type WebChartAxis, type WebChartGaugeAxis } from 'jimu-ui/advanced/chart'
import type { WebChartSeries } from '../../../../config'

export const normalizeAxes = (
  series: ImmutableArray<WebChartSeries>,
  axes: ImmutableArray<WebChartGaugeAxis> | ImmutableArray<WebChartAxis>,
  query: ImmutableObject<FeatureLayerQueryParams>
): ImmutableArray<WebChartGaugeAxis> | ImmutableArray<WebChartAxis> => {
  const type = getSeriesType(series as any)

  if (type === 'gaugeSeries') {
    const minimumStatistic = query?.outStatistics?.[1]
    const maximumStatistic = query?.outStatistics?.[2]
    if (minimumStatistic || maximumStatistic) {
      return axes?.map((propAxis: ImmutableObject<WebChartGaugeAxis>) => {
        let axis = propAxis
        if (minimumStatistic) {
          axis = axis.set('minimumFromField', minimumStatistic)
        }
        if (maximumStatistic) {
          axis = axis.set('maximumFromField', maximumStatistic)
        }
        return axis as unknown as WebChartGaugeAxis
      })
    }
  }
  return axes
}
