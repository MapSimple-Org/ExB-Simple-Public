import type { IMFeatureLayerQueryParams, ImmutableObject } from 'jimu-core'
import type { NumberFormatOptions, DateTimeFormatOptions, CategoryFormatOptions } from 'jimu-ui/advanced/chart'
import type { WebChartOrderOptions, ChartDataSource } from '../../../../../../config'

export interface SeriesRelatedProps {
  query?: IMFeatureLayerQueryParams
  orderOptions?: WebChartOrderOptions
  chartDataSource: ImmutableObject<ChartDataSource>
  colorMatch?: boolean
  valueFormat?: NumberFormatOptions | DateTimeFormatOptions | CategoryFormatOptions
}
