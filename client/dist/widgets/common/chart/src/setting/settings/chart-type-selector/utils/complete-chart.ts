import { Immutable, type ImmutableObject } from 'jimu-core'
import { getSeriesType } from 'jimu-ui/advanced/chart'
import type { IWebChart } from '../../../../config'
import {
  DefaultBgColor,
  getLineSymbol,
  DefaultGridColor,
  getChartText,
  DefaultTitleSize,
  DefaultTitleColor,
  DefaultFooterSize,
  DefaultFooterColor,
  getDefaultPieChartSeries,
  getDefaultScatterPlotChartSeries,
  getDefaultHistogramSeries,
  getDefaultLegend,
  getDefaultBarChartSeries,
  getDefaultLineChartSeries,
  getDefaultAxes,
  isXYChart,
  getDefaultGaugeSeries,
  isGaugeChart
} from '../../../../utils/default'
import { colorUtils } from 'jimu-theme'
import { WebChartCurrentVersion } from '../../../../constants'

const completeVersion = (webChart: ImmutableObject<IWebChart>): ImmutableObject<IWebChart> => {
  if (!webChart.version) {
    webChart = webChart.set('version', WebChartCurrentVersion)
  }
  return webChart
}

const completeBackgroundColor = (webChart: ImmutableObject<IWebChart>): ImmutableObject<IWebChart> => {
  let background = webChart.background || DefaultBgColor
  background = colorUtils.convertJsAPISymbolColorToStringColor(background as any)
  webChart = webChart.set('background', background)
  return webChart
}

const DefaultGrid = getLineSymbol(
  0,
  DefaultGridColor,
  'esriSLSDash'
)

const completeAxes = (webChart: ImmutableObject<IWebChart>): ImmutableObject<IWebChart> => {
  if (!isXYChart(webChart?.series) && !isGaugeChart(webChart?.series)) { return webChart }
  const seriesType = getSeriesType(webChart.series as any)
  let axes = webChart.axes || Immutable(getDefaultAxes(seriesType as any))
  if (!isGaugeChart(webChart?.series)) {
    axes = webChart.axes.map((axis) => {
      return axis.grid == null ? axis.set('grid', DefaultGrid) : axis
    }) as any
  }
  webChart = webChart.set('axes', axes)
  return webChart
}

const completeSeries = (webChart: ImmutableObject<IWebChart>): ImmutableObject<IWebChart> => {
  if (webChart.series) { return webChart }
  const seriesType = getSeriesType(webChart.series as any) ?? 'barSeries'
  let series = null
  switch (seriesType) {
    case 'barSeries':
      series = getDefaultBarChartSeries()
      break
    case 'lineSeries':
      series = getDefaultLineChartSeries()
      break
    case 'pieSeries':
      series = getDefaultPieChartSeries()
      break
    case 'scatterSeries':
      series = getDefaultScatterPlotChartSeries()
      break
    case 'histogramSeries':
      series = getDefaultHistogramSeries()
      break
    case 'gaugeSeries':
      series = getDefaultGaugeSeries()
      break
    default:
      break
  }
  webChart = webChart.set('series', [series])
  return webChart
}

const completeTitle = (webChart: ImmutableObject<IWebChart>): ImmutableObject<IWebChart> => {
  if (webChart.title == null) {
    const title = getChartText('', true, DefaultTitleSize, DefaultTitleColor)
    webChart = webChart.set('title', title)
  }
  return webChart
}

const completeFooter = (webChart: ImmutableObject<IWebChart>): ImmutableObject<IWebChart> => {
  if (webChart.footer == null) {
    const footer = getChartText('', true, DefaultFooterSize, DefaultFooterColor)
    webChart = webChart.set('footer', footer)
  }
  return webChart
}

const completeLegend = (webChart: ImmutableObject<IWebChart>): ImmutableObject<IWebChart> => {
  const isGauge = isGaugeChart(webChart?.series)
  if (webChart.legend == null && !isGauge) {
    const seriesType = getSeriesType(webChart?.series as any)
    const legend = getDefaultLegend(true, seriesType === 'pieSeries')
    webChart = webChart.set('legend', legend)
  }
  return webChart
}

/**
 * Completing the chart configuration.
 * @param propWebChart
 * @returns {IWebChart}
 */
const completeChart = (propWebChart: IWebChart): ImmutableObject<IWebChart> => {
  let webChart = Immutable(propWebChart)
  webChart = completeVersion(webChart)
  webChart = completeBackgroundColor(webChart)
  webChart = completeSeries(webChart)
  webChart = completeAxes(webChart)
  webChart = completeTitle(webChart)
  webChart = completeFooter(webChart)
  webChart = completeLegend(webChart)
  return webChart
}

export default completeChart
