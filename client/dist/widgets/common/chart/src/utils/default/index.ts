import { Immutable, type ImmutableObject, JimuFieldType, utils, type IMFieldSchema, type ImmutableArray } from 'jimu-core'
import {
  getDefaultCategoryFormat,
  getSeriesType,
  type WebChartTypes,
  type RESTSimpleLineSymbolStyle,
  type WebChartDataTransformations,
  type WebChartAxis,
  type WebChartOverlay,
  type WebChartText,
  type WebChartLegend,
  type ScatterplotOverlays,
  type ChartTypes,
  type HistogramOverlays,
  type WebChartGuide,
  type NumberFormatOptions,
  type DateTimeFormatOptions,
  type WebChartPieChartLegend,
  type WebChartGaugeSeries,
  type WebChartGaugeAxis,
  type WebChartNeedle,
  type WebChartGaugeAxisTick,
  type WebChartAxisScrollBar,
  type ISimpleMarkerSymbol,
  type IFont,
  type ITextSymbol,
  type ISimpleLineSymbol,
  type ISimpleFillSymbol
} from 'jimu-ui/advanced/chart'

import type { ChartTools, HistogramOverlaysType, WebChartSeries } from '../../config'
import { PieSliceGroupingSliceId } from '../../constants'

export const DefaultColor = '#5E8FD0'
export const DefaultBgColor = 'var(--sys-color-surface-paper)'
export const DefaultTextColor = 'var(--sys-color-surface-paper-text)'
export const DefaultLineColor = 'var(--sys-color-divider-secondary)'
// eslint-disable-next-line jimu-theme/no-improperly-color
export const DefaultFillColor = 'var(--sys-color-primary-main)'
export const DefaultTextSize = 14
export const DefaultCircleMarkerSize = 10
export const DefaultFontWeight = 400

// title
export const DefaultTitleColor = 'var(--sys-color-surface-paper-text)'
export const DefaultTitleWeight = 500
export const DefaultTitleSize = 16

// footer
export const DefaultFooterSize = 12
export const DefaultFooterColor = 'var(--sys-color-surface-paper-hint)'

// series
export const DefaultSeriesLabelSize = 10
export const DefaultValueLabelColor = 'var(--sys-color-surface-paper-hint)'

export const SeriesColors = [
  '#5E8FD0',
  '#77B484',
  '#DF6B35',
  '#DBCF4E',
  '#41546D',
  '#8257C2',
  '#D6558B'
]

export const DefaultSeriesOutlineColor = 'var(--sys-color-divider-secondary)'
export const DefaultPieSeriesOutlineColor = 'var(--sys-color-divider-secondary)'
export const DefaultScatterPlotTrendLineColor = SeriesColors[2]

// axes
export const DefaultAxisColor = 'var(--sys-color-divider-primary)'
export const DefaultAxisLabelColor = 'var(--sys-color-surface-paper-hint)'
export const DefaultAxisTitleColor = 'var(--sys-color-surface-paper-text)'
export const DefaultAxisTitleSize = 14
export const DefaultAxisLabelSize = 12
export const DefaultAxisScrollbarColor = 'var(--sys-color-divider-primary)'
export const DefaultAxisScrollbarWidth = 10
export const DefaultAxisScrollbarGridSize = 20
export const DefaultAxisScrollbarMargin = 20

// guide
export const DefaultGuideFillColor = '#67b7dc'
export const DefaultGuideLineColor = '#67b7dc'
export const DefaultGuideLabelSize = 12

// legend
export const DefaultLegendTitleSize = 14
export const DefaultLegendLabelSize = 12
export const DefaultLegendTitleColor = 'var(--sys-color-surface-paper-text)'
export const DefaultLegendLabelColor = 'var(--sys-color-surface-paper-text)'
export const DefaultPieLegendLabelMaxWidth = 200
// grid
export const DefaultGridColor = 'var(--sys-color-divider-tertiary)'
// color by slices
export const DefaultColorBySlicesOtherColor = '#D6D6D6'

// scatter-plot marker symbol
export const DefaultMarkerSize = 7
export const DefaultMarkerOutlineColor = 'rgba(255,255,255,0.5)'

export const DefaultSplitByOtherSeriesColor = '#D6D6D6'

// gauge
export const DefaultGaugeAxisLabelSize = 12
export const DefaultGaugeAxisInnerLabelSize = 18
export const DefaultGaugeAxisColor = 'var(--sys-color-divider-primary)'
export const DefaultGaugeAxisInnerLabelColor = 'var(--sys-color-surface-paper-text)'
// eslint-disable-next-line jimu-theme/no-improperly-color
export const DefaultGaugeNeedleColor = 'var(--sys-color-primary-main)'
export const DefaultGaugeNeedleOutlineColor = 'var(--sys-color-divider-secondary)'

export const getDefaultColor = (): string => {
  return DefaultColor
}

export const getDefaultTextColor = (): string => {
  return DefaultTextColor
}

export const getDefaultTitleColor = (): string => {
  return DefaultTitleColor
}

export const getDefaultFooterColor = (): string => {
  return DefaultFooterColor
}

export const getDefaultAxisLabelColor = (): string => {
  return DefaultAxisLabelColor
}

export const getDefaultAxisTitleColor = (): string => {
  return DefaultAxisTitleColor
}

export const getDefaultLegendTitleColor = (): string => {
  return DefaultAxisTitleColor
}

export const getDefaultLegendLabelColor = (): string => {
  return DefaultAxisTitleColor
}

export const getDefaultValueLabelColor = (): string => {
  return DefaultValueLabelColor
}

export const getDefaultGaugeValueLabelColor = (): string => {
  return DefaultValueLabelColor
}

export const getDefaultLineColor = () => {
  return DefaultLineColor
}

export const getDefaultAxisColor = (): string => {
  return DefaultAxisColor
}

export const getDefaultGridColor = (): string => {
  return DefaultGridColor
}

const defaultHistogramMeanColor = '#A6CEE3'
const defaultHistogramMedianColor = '#33A02C'
const defaultHistogramStdColor = '#B2DF8A'
const defaultHistogramCodColor = '#E31A1C'

export const getDefaultHistogramOverlayColor = (type: HistogramOverlaysType) => {
  if (type === 'mean') {
    return defaultHistogramMeanColor
  } else if (type === 'median') {
    return defaultHistogramMedianColor
  } else if (type === 'standardDeviation') {
    return defaultHistogramStdColor
  } else if (type === 'comparisonDistribution') {
    return defaultHistogramCodColor
  }
}

export const getDefaultSeriesOutlineColor = (type: ChartTypes = 'barSeries') => {
  if (isXYChart(type)) {
    return DefaultSeriesOutlineColor
  } else if (type === 'pieSeries') {
    return DefaultPieSeriesOutlineColor
  } else {
    return DefaultSeriesOutlineColor
  }
}

export const getDefaultSeriesFillColor = (): string => {
  return SeriesColors[0]
}

export const getDefaultNumberFormat = (): NumberFormatOptions => {
  return {
    type: 'number',
    intlOptions: {
      style: 'decimal',
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }
  }
}

export const getDefaultPercentNumberFormat = (): NumberFormatOptions => {
  return {
    type: 'number',
    intlOptions: {
      style: 'percent',
      notation: 'standard',
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }
  }
}

export const getDefaultDateFormat = (): DateTimeFormatOptions => {
  return {
    type: 'date',
    intlOptions: {}
  }
}

/**
 * Get colors in order
 */
export const getColorInOrder = (colors: string[], index: number = 0): string => {
  const length = colors?.length ?? 0
  if (length < 0) return
  index = index % length
  if (index < 0) index = 0
  return colors[index]
}

/**
 * Get color in order, but not repeat the previous one.
 * @param index
 * @param preSerieColor
 * @returns
 */
export const getNonRepeatingColor = (colors: string[], index: number = 0, preSerieColor: string): string => {
  let color = getColorInOrder(colors, index)
  if (color === preSerieColor) {
    color = getColorInOrder(colors, index + 1)
  }
  return color
}

/**
 * Get series fill colors in order
 */
export const getSeriesFillColor = (index: number = 0): string => {
  return getColorInOrder(SeriesColors, index)
}

/**
 * Get series fill colors in order, but not repeat the previous one.
 * @param index
 * @param preSerieColor
 * @returns
 */
export const getNonRepeatingSeriesFillColor = (index: number = 0, preSerieColor: string): string => {
  return getNonRepeatingColor(SeriesColors, index, preSerieColor)
}

export const DefaultFont: IFont = {
  family: 'inherit',
  size: DefaultTextSize,
  style: 'normal',
  weight: 'normal',
  decoration: 'none'
}

export const DefaultTextSymbol: ITextSymbol = {
  type: 'esriTS',
  color: DefaultTextColor as any,
  font: DefaultFont,
  horizontalAlignment: 'center'
}

export const DefaultLineSymbol: ISimpleLineSymbol = {
  type: 'esriSLS',
  style: 'esriSLSSolid',
  color: DefaultLineColor as any,
  width: 1
}

export const DefaultFillSymbol: ISimpleFillSymbol = {
  type: 'esriSFS',
  style: 'esriSFSSolid',
  color: DefaultFillColor as any,
  outline: DefaultLineSymbol
}

export const DefaultCircleMarkerSymbol: ISimpleMarkerSymbol = {
  type: 'esriSMS',
  style: 'esriSMSCircle',
  color: DefaultFillColor as any,
  size: DefaultCircleMarkerSize,
  outline: DefaultLineSymbol
}

export const getFont = (size = DefaultTextSize): IFont => {
  return {
    ...DefaultFont,
    size
  }
}

/**
 * Get the default text symbol
 * @param text
 * @param size
 */
export const getTextSymbol = (
  text = '',
  size = DefaultTextSize,
  color = DefaultTextColor as any
): ITextSymbol => {
  return {
    ...DefaultTextSymbol,
    text,
    color,
    font: getFont(size)
  }
}

/**
 * Get the default line symbol
 * @param useRandomColor Whether to randomly generate colors
 * @param width
 */
export const getLineSymbol = (
  width: number = 1,
  color = DefaultLineColor as any,
  style: RESTSimpleLineSymbolStyle = 'esriSLSSolid'
): ISimpleLineSymbol => {
  return {
    ...DefaultLineSymbol,
    width,
    color,
    style
  }
}

/**
 * Get the default fill symbol.
 */
export const getFillSymbol = (
  color: string = DefaultColor,
  outlineWidth: number = 1,
  outlineColor = DefaultLineColor
): ISimpleFillSymbol => {
  return {
    ...DefaultFillSymbol,
    color: color as any,
    outline: getLineSymbol(outlineWidth, outlineColor)
  }
}

/**
 * Get the default circle marker symbol
 */
export const getCircleMarkerSymbol = (
  color: any = DefaultFillColor,
  outlineWidth: number = 0,
  outlineColor: string = DefaultLineColor,
  markerSize: number = DefaultCircleMarkerSize
): ISimpleMarkerSymbol => {
  return {
    ...DefaultCircleMarkerSymbol,
    color,
    size: markerSize,
    outline: getLineSymbol(outlineWidth, outlineColor)
  }
}

export function getDefaultGuide (name: string, label: string = '', isHorizontal?: boolean): WebChartGuide {
  const horizontalAlignment = isHorizontal ? 'center' : 'right'
  const verticalAlignment = isHorizontal ? 'top' : 'middle'
  const labelText = getTextSymbol(label, DefaultGuideLabelSize, DefaultTextColor as any)
  labelText.horizontalAlignment = horizontalAlignment
  labelText.verticalAlignment = verticalAlignment

  return {
    type: 'chartGuide',
    start: undefined,
    style: getLineSymbol(2, DefaultGuideLineColor as any),
    name,
    label: labelText,
    visible: true,
    above: false
  }
}

export function getDefaultOverlay (color?: string): WebChartOverlay {
  return {
    type: 'chartOverlay',
    visible: false,
    created: false,
    symbol: getLineSymbol(1, color)
  }
}

export function getScatterPlotOverlays (
  color: any = SeriesColors[2],
  width: number = 3
): ScatterplotOverlays {
  return {
    type: 'chartOverlays',
    trendLine: {
      type: 'chartOverlay',
      created: true,
      visible: true,
      symbol: {
        type: 'esriSLS',
        color,
        width
      }
    }
  }
}

/**
 * Generate a default chart text
 * @param visible
 */
export const getChartText = (
  text = '',
  visible: boolean = true,
  size?: number,
  color = DefaultTextColor as any
): WebChartText => {
  return {
    type: 'chartText',
    visible,
    content: getTextSymbol(text, size, color)
  }
}

export const getAxisScrollbar = (
  visible: boolean = false,
  color = DefaultAxisScrollbarColor as any
): WebChartAxisScrollBar => {
  return {
    visible,
    width: DefaultAxisScrollbarWidth,
    color,
    gripSize: DefaultAxisScrollbarGridSize,
    margin: DefaultAxisScrollbarMargin
  }
}

export const getCategoryAxis = (text = '', showLabels = false): WebChartAxis => {
  const title = getChartText(text, false, DefaultAxisTitleSize, DefaultAxisTitleColor)
  title.content.horizontalAlignment = 'center'
  return {
    type: 'chartAxis',
    visible: true,
    title,
    labels: getChartText('', showLabels, DefaultAxisLabelSize, DefaultAxisLabelColor),
    valueFormat: getDefaultCategoryFormat(),
    lineSymbol: getLineSymbol(1, DefaultAxisColor)
  }
}

export const getValueAxis = (
  text = '',
  isYAxis?: boolean,
  showLabels = false,
  labelSize = DefaultAxisLabelSize,
  axisColor = DefaultAxisColor
): WebChartAxis => {
  const title = getChartText(text, false, DefaultAxisTitleSize, DefaultAxisTitleColor)
  if (isYAxis) {
    title.content.horizontalAlignment = undefined
    title.content.verticalAlignment = 'middle'
    title.content.angle = 270
  } else {
    title.content.horizontalAlignment = 'center'
  }
  return {
    type: 'chartAxis',
    visible: true,
    title,
    labels: getChartText('', showLabels, labelSize, DefaultAxisLabelColor),
    valueFormat: getDefaultNumberFormat(),
    lineSymbol: getLineSymbol(1, axisColor)
  }
}

function getGaugeNeedle (color = DefaultGaugeNeedleColor): WebChartNeedle {
  return {
    type: 'gaugeNeedle',
    visible: true,
    startWidth: 20,
    endWidth: 2,
    innerRadius: 25,
    displayPin: false,
    symbol: {
      type: 'esriSFS',
      color: color as any,
      outline: {
        type: 'esriSLS',
        style: 'esriSLSSolid',
        color: DefaultGaugeNeedleOutlineColor as any,
        width: 0
      }
    }
  }
}

function getGaugeTikes (): WebChartGaugeAxisTick {
  return {
    type: 'gaugeAxisTick',
    visible: true
  }
}

/**
 * Returns the gauge axis
 */
export function getGaugeAxis (showLabels: boolean = false): WebChartGaugeAxis {
  let axis = getValueAxis('', false, showLabels, DefaultGaugeAxisLabelSize, DefaultGaugeAxisColor) as WebChartGaugeAxis

  const innerLabel = getChartText('', false, DefaultGaugeAxisInnerLabelSize, DefaultGaugeAxisInnerLabelColor)
  innerLabel.content.verticalAlignment = 'bottom'
  const needle = getGaugeNeedle()
  const ticks = getGaugeTikes()
  axis = {
    ...axis,
    innerLabel,
    needle,
    ticks
  }
  return axis
}

/**
 * Returns default axes based on chart type as per the WebChart Specification
 * @param chartType The type of WebChart which is of type WebChartTypes.BarSeries | WebChartTypes.HistogramSeries | WebChartTypes.ScatterSeries
 *
 */
export function getDefaultAxes (
  chartType:
    typeof WebChartTypes.BarSeries
  | typeof WebChartTypes.LineSeries
  | typeof WebChartTypes.HistogramSeries
  | typeof WebChartTypes.ScatterSeries
  | typeof WebChartTypes.GaugeSeries,
  showLabels?: boolean
): WebChartAxis[] {
  const defaultAxes: WebChartAxis[] = []
  const xAxisTitle = ''
  const yAxisTitle = ''
  const yAxis = getValueAxis(yAxisTitle, true, showLabels)
  const defaultGridLine = getLineSymbol(
    1,
    DefaultGridColor,
    'esriSLSDash'
  )
  switch (chartType) {
    case 'barSeries': {
      // Setting Bar Chart baseline to 0.
      yAxis.minimum = 0
      yAxis.grid = defaultGridLine
      defaultAxes.push(getCategoryAxis(xAxisTitle, showLabels), yAxis)
      break
    }
    case 'lineSeries': {
      // Setting Line Chart baseline to 0.
      yAxis.minimum = 0
      yAxis.grid = defaultGridLine
      defaultAxes.push(getCategoryAxis(xAxisTitle, showLabels), yAxis)
      break
    }
    case 'scatterSeries': {
      const xAxis = getValueAxis(xAxisTitle, false, showLabels, DefaultAxisLabelSize, DefaultAxisColor)
      xAxis.grid = defaultGridLine
      yAxis.grid = defaultGridLine
      defaultAxes.push(xAxis, yAxis)
      break
    }
    case 'histogramSeries': {
      yAxis.grid = defaultGridLine
      defaultAxes.push(getValueAxis(xAxisTitle, false, showLabels), yAxis)
      break
    }
    case 'gaugeSeries': {
      defaultAxes.push(getGaugeAxis(showLabels))
      break
    }
  }
  return defaultAxes
}

export interface SeriesColorProps {
  color?: string
  preSerieColor?: string
  colors?: string[]
}

/**
 * Returns a default BarChartSeries object as per the WebChart Specification
 */
export function getDefaultBarChartSeries (index: number = 0, colorProps?: SeriesColorProps): WebChartSeries {
  const color = !colorProps?.color ? getNonRepeatingColor(colorProps?.colors ?? SeriesColors, index, colorProps?.preSerieColor) : colorProps?.color
  return {
    type: 'barSeries',
    id: '',
    name: '',
    x: '',
    y: '',
    fillSymbol: getFillSymbol(color, 0),
    dataLabels: getChartText('', false, DefaultSeriesLabelSize, DefaultValueLabelColor)
  } as WebChartSeries
}

/**
 * Returns a default LineChartSeries object as per the WebChart Specification
 */
export function getDefaultLineChartSeries (index: number = 0, colorProps?: SeriesColorProps): WebChartSeries {
  const color = !colorProps?.color ? getNonRepeatingColor(colorProps?.colors ?? SeriesColors, index, colorProps?.preSerieColor) : colorProps?.color
  return {
    type: 'lineSeries',
    id: '',
    name: '',
    x: '',
    y: '',
    lineSymbol: getLineSymbol(2, color),
    dataLabels: getChartText('', false, DefaultSeriesLabelSize, DefaultValueLabelColor)
  } as WebChartSeries
}

/**
 * Returns a default PieChartSeries object as per the WebChart Specification
 */
export function getDefaultPieChartSeries (innerRadius: number = 0): WebChartSeries {
  const color = getSeriesFillColor(0)
  return {
    type: 'pieSeries',
    id: '',
    name: '',
    x: '',
    y: '',
    innerRadius,
    startAngle: 0,
    endAngle: 360,
    displayNumericValueOnDataLabel: true,
    displayPercentageOnDataLabel: false,
    displayNumericValueOnTooltip: true,
    displayPercentageOnTooltip: true,
    dataLabelsOffset: 0,
    sliceGrouping: {
      sliceId: PieSliceGroupingSliceId,
      percentageThreshold: 0,
      label: 'Other'
    },
    numericValueFormat: getDefaultNumberFormat(),
    percentValueFormat: getDefaultPercentNumberFormat(),
    fillSymbol: getFillSymbol(color, 1, DefaultPieSeriesOutlineColor),
    dataLabels: getChartText('', false, DefaultSeriesLabelSize, DefaultValueLabelColor)
  } as WebChartSeries
}

/**
 * Returns a default ScatterPlotChartSeries object as per the WebChart Specification
 */
export function getDefaultScatterPlotChartSeries (): WebChartSeries {
  const color = getSeriesFillColor(0)
  return {
    type: 'scatterSeries',
    id: '',
    name: '',
    x: '',
    y: '',
    markerSymbol: getCircleMarkerSymbol(color, 1, DefaultMarkerOutlineColor, DefaultMarkerSize),
    overlays: getScatterPlotOverlays()
  } as WebChartSeries
}

/**
 * Returns a default HistogramChartSeries object as per the WebChart Specification
 */
export function getDefaultHistogramSeries (dataTransformationType: WebChartDataTransformations = 'none'): WebChartSeries {
  const color = getSeriesFillColor(0)
  return {
    type: 'histogramSeries',
    id: '',
    name: '',
    x: '',
    binCount: 15,
    overlays: getDefaultHistogramOverlays(),
    dataTransformationType,
    fillSymbol: getFillSymbol(color, 1, DefaultSeriesOutlineColor),
    dataLabels: getChartText('', false, DefaultSeriesLabelSize, DefaultValueLabelColor)
  } as WebChartSeries
}

/**
 * Returns a default GaugeSeries object as per the WebChart Specification
 */
export function getDefaultGaugeSeries (): WebChartGaugeSeries {
  return {
    type: 'gaugeSeries',
    id: '',
    name: '',
    x: ''
  }
}

export function getDefaultHistogramOverlays (): HistogramOverlays {
  return {
    type: 'chartOverlays',
    mean: getDefaultOverlay(getDefaultHistogramOverlayColor('mean')),
    median: getDefaultOverlay(getDefaultHistogramOverlayColor('median')),
    standardDeviation: getDefaultOverlay(getDefaultHistogramOverlayColor('standardDeviation')),
    comparisonDistribution: getDefaultOverlay(getDefaultHistogramOverlayColor('comparisonDistribution'))
  }
}

export const getDefaultLegend = (visible = true, isPie: boolean = false): WebChartLegend => {
  let legend: WebChartLegend = {
    type: 'chartLegend',
    visible,
    title: getChartText('', true, DefaultLegendTitleSize, DefaultLegendTitleColor),
    body: getTextSymbol('', DefaultLegendLabelSize, DefaultLegendLabelColor),
    position: isPie ? 'right' : 'bottom'
  }
  if (isPie) {
    legend = {
      ...legend,
      labelMaxWidth: DefaultPieLegendLabelMaxWidth
    } as WebChartPieChartLegend
  }
  return legend
}

/**
 * Generate a `FormatOptions` of ac-spec by a field schema
 * @param fieldSchema
 * @param characterLimit
 */
export const getValueFormat = (
  fieldSchema: IMFieldSchema,
  characterLimit: number = 11
): any => {
  if (fieldSchema.type === JimuFieldType.Date) {
    const intlOptions = utils.getIntlOption(fieldSchema) ?? {}
    return {
      type: 'date',
      intlOptions
    }
  } else if (fieldSchema.type === JimuFieldType.String) {
    return {
      type: 'category',
      characterLimit
    }
  } else if (fieldSchema.type === JimuFieldType.Number) {
    const intlOptions = utils.getIntlOption(fieldSchema) ?? {}
    return {
      type: 'number',
      intlOptions
    }
  }
}

export const isSerialSeries = (
  value?: string | WebChartSeries[] | ImmutableArray<WebChartSeries>
): boolean => {
  if (value == null || (value as string) === '') return
  const seriesType = typeof value === 'string' ? value as ChartTypes : getSeriesType(value as any) as string
  return seriesType === 'barSeries' || seriesType === 'lineSeries'
}

/**
 * Check if the chart is a XY chart.
 * @param series
 * @returns {boolean}
 */
export const isXYChart = (value: string | WebChartSeries[] | ImmutableArray<WebChartSeries>): boolean => {
  if (value == null || (value as string) === '') return false
  const seriesType = typeof value === 'string' ? value : getSeriesType(value as any) as string
  return seriesType === 'barSeries' || seriesType === 'lineSeries' ||
    seriesType === 'scatterSeries' || seriesType === 'histogramSeries'
}

export const isGaugeChart = (value: string | WebChartSeries[] | ImmutableArray<WebChartSeries>): boolean => {
  if (value == null || (value as string) === '') return false
  const seriesType = typeof value === 'string' ? value : getSeriesType(value as any) as string
  return seriesType === 'gaugeSeries'
}

export const getDefaultTools = (type?: string): ImmutableObject<ChartTools> => {
  const cursorEnable = !isGaugeChart(type)
  return Immutable({ cursorEnable })
}
