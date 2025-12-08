import type { StatisticDefinition, FeatureLayerQueryParams, ImmutableObject, SqlExpression } from 'jimu-core'
import type {
  WebChart as _WebChart,
  WebGaugeChart,
  WebChartSeries as _WebChartSeries,
  WebChartGaugeAxis,
  WebChartAxis,
  WebChartOrderSeriesBy,
  WebChartDirectionalDataOrder,
  WebChartPredefinedLabelsDataOrder
} from 'jimu-ui/advanced/chart'

export type WebChartSeries = Omit<_WebChartSeries, 'query'> & {
  query?: FeatureLayerQueryParams
  //add for custom added split-by series, will be removed at runtime
  deletable?: boolean
}

export type HistogramOverlaysType = 'mean' | 'median' | 'standardDeviation' | 'comparisonDistribution'

export interface ChartDataSource {
  query: FeatureLayerQueryParams
}

interface WebChart extends Omit<_WebChart, 'axes'>, Omit<WebGaugeChart, 'axes'> {
  axes?: [WebChartAxis, WebChartAxis?] | [WebChartGaugeAxis]
}

export interface ChartComponentOptions {
  /**
    * When `true`, the series is hidden in the legend if it doesn't have data (i.e. empty). For eg. after applying a filter by attribute or geometry (as when using the filter by extent)
    * @default false
    */
  hideEmptySeries?: boolean
}

export interface WebChartOrderOptions {
  /**
   * How series should be ordered and displayed in a multi-series chart.
   * If not provided the series will be displayed as they are ordered in the config.
   */
  series?: WebChartOrderSeriesBy
  /**
   * How data for a chart should be ordered. It is recommended to use this property over its sibling `orderByFields` to order the chart data.
   *
   * If not provided, the data will be displayed as it was retrieved from the server. No additional ordering will be applied.
   */
  data?: WebChartDirectionalDataOrder | WebChartPredefinedLabelsDataOrder
  /**
   * The orderByFields to be sent with the query when retrieving data for the chart.
   *
   * Use this property for unique cases such as to order data by multiple fields.
   * In case both this property and its sibling `data` object are provided, the `data` property will be used.
   */
  orderByFields?: string[]
}

export interface IWebChart extends Omit<WebChart, 'background' | 'series'> {
  dataSource: ChartDataSource
  background?: string
  series: WebChartSeries[]
}

export enum CategoryType {
  ByGroup = 'BYGROUP',
  ByField = 'BYFIELD'
}

export interface ChartTools {
  filter?: SqlExpression
  cursorEnable?: boolean
}

export interface ChartMessages {
  noDataMessage?: string
}

export type ChartType = 'column' | 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'histogram' | 'gauge'

export type TemplateType = 'bar' | 'stacked-bar' | 'stacked100-bar'
| 'column' | 'stacked-column' | 'stacked100-column'
| 'line' | 'smooth-line'
| 'area' | 'smooth-area'
| 'pie' | 'donut'
| 'scatter'
| 'histogram'
| 'gauge'

export interface Config {
  //It is only used when configuring the app template
  _templateType?: TemplateType
  template: string
  webChart: IWebChart
  tools?: ChartTools
  options?: ChartComponentOptions
  messages?: ChartMessages
}

export type IMConfig = ImmutableObject<Config>

export type ChartStatisticType = Omit<StatisticDefinition['statisticType'], 'stddev' | 'var' | 'percentile_cont' | 'percentile_disc'> | 'percentile-continuous' | 'no_aggregation'
