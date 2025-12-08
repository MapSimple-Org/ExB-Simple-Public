import {
  React,
  JimuFieldType,
  Immutable,
  DataSourceManager,
  DataSourceStatus,
  hooks,
  ReactRedux,
  DataSourceTypes,
  type ImmutableObject,
  type ImmutableArray,
  type IMFeatureLayerQueryParams,
  type FeatureLayerQueryParams,
  type DataSource,
  type IMFieldSchema,
  type StatisticDefinition,
  type QueriableDataSource,
  type QueryScope,
  type IMState,
  type FeatureLayerDataSource,
  type SceneLayerDataSource,
  type cancelablePromise
} from 'jimu-core'
import { utils } from 'jimu-theme'
import { GaugeDisplayValueField, SplitByOtherSeriesName, SplitByOtherSeriesValue } from '../../constants'
import { type CategoryFormatOptions, type DateTimeFormatOptions, getDefaultCategoryFormat, type WebChartLineChartSeries, getSplitByValue, getSeriesType, type WebChartPieChartSeries, getSplitByField, type WebChartBarChartSeries, type WebChartScatterplotSeries, type WebChartHistogramSeries, type WebChartGaugeSeries, type ChartTypes, type ISimpleLineSymbol, type ISimpleFillSymbol, type NumberFormatOptions, type WebChartTemporalBinning } from 'jimu-ui/advanced/chart'
import { type SeriesColorProps, SeriesColors, getColorInOrder, getDefaultBarChartSeries, getDefaultDateFormat, getDefaultHistogramSeries, getDefaultLineChartSeries, getDefaultPieChartSeries, getDefaultScatterPlotChartSeries, getNonRepeatingColor, isSerialSeries, getDefaultGaugeSeries, DefaultSplitByOtherSeriesColor } from '../default'
import { CategoryType, type IWebChart, type ChartStatisticType, type WebChartSeries, type ChartType, type TemplateType } from '../../config'

const cacheFieldSchema = {}
/**
 * Get the schema of a single field
 * @param jimuFieldName
 * @param dataSourceId
 */
export const getFieldSchema = (
  jimuFieldName: string,
  dataSourceId: string
): IMFieldSchema | undefined => {
  if (!dataSourceId) return
  if (cacheFieldSchema[jimuFieldName] != null) return cacheFieldSchema[jimuFieldName]
  const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
  const dsSchema = ds?.getSchema()
  const fieldSchema = dsSchema?.fields?.[jimuFieldName]
  cacheFieldSchema[jimuFieldName] = fieldSchema
  return fieldSchema
}

const cacheFieldsSchema = {}

/**
 * Get all the field schema in a data source
 * @param dataSourceId
 */
export const getFieldsSchema = (
  dataSourceId: string
): { [jimuName: string]: IMFieldSchema } | undefined => {
  if (cacheFieldsSchema[dataSourceId] != null) return cacheFieldsSchema[dataSourceId]
  const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
  const dsSchema = ds?.getSchema()
  const fieldsSchema = dsSchema?.fields
  cacheFieldsSchema[dataSourceId] = fieldsSchema
  return fieldsSchema
}

const cacheObjectIdField = {}
/**
 * get objectid
 * @param dataSourceId
 */
export const getObjectIdField = (dataSourceId: string): string | undefined => {
  if (cacheObjectIdField[dataSourceId] != null) return cacheObjectIdField[dataSourceId]
  const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
  if (ds == null) {
    console.error(`Invalid data source id: ${dataSourceId}`)
    return
  }
  const objectId = ds.getIdField()
  cacheObjectIdField[dataSourceId] = objectId
  return objectId
}

/**
 * Get the field alias.
 * @param jimuFieldName
 * @param dataSourceId
 */
export const getFieldAlias = (jimuFieldName: string, dataSourceId: string) => {
  const fieldSchema = getFieldSchema(jimuFieldName, dataSourceId)
  return fieldSchema?.alias || jimuFieldName
}

/**
 * Get the alias of a set of fields
 * @param jimuFieldNames
 * @param dataSourceId
 */
export const getFieldsAlias = (jimuFieldNames: string[] | ImmutableArray<string>, dataSourceId: string) => {
  return jimuFieldNames?.map((jimuFieldName) => getFieldAlias(jimuFieldName, dataSourceId))
}

/**
 * Get the field type.
 * @param jimuFieldName
 * @param dataSourceId
 */
export const getFieldType = (
  jimuFieldName: string,
  dataSourceId: string
): JimuFieldType => {
  const fieldSchema = getFieldSchema(jimuFieldName, dataSourceId)
  return fieldSchema?.type
}

/**
 * Get the template type of the current series.
 * @param series
 * @param fallbackType
 */
export const getTemplateType = (webChart: IWebChart | ImmutableObject<IWebChart>): [ChartType, TemplateType] => {
  const series = webChart?.series
  const seriesType = getSeriesType(series as any) ?? 'barSeries'

  const serie = series?.[0]
  let type: ChartType
  let subType: TemplateType
  if (!serie) return [] as any
  if (seriesType === 'barSeries') {
    const rotated = webChart?.rotated ?? false
    const suffix = rotated ? 'bar' : 'column'
    const prefix = webChart.stackedType === 'sideBySide' ? '' : webChart.stackedType
    type = suffix
    subType = (prefix ? `${prefix}-${suffix}` : suffix) as TemplateType
  } else if (seriesType === 'lineSeries') {
    const showArea = getSerialLineShowArea(series)
    const lineSmoothed = getSerialLineSmoothed(series)

    const suffix = showArea ? 'area' : 'line'
    let prefix = ''
    if (lineSmoothed) {
      prefix = 'smooth'
    }
    type = suffix
    subType = (prefix ? `${prefix}-${suffix}` : suffix) as TemplateType
  } else if (seriesType === 'pieSeries') {
    type = 'pie'
    const innerRadius = (serie as WebChartPieChartSeries)?.innerRadius ?? 0
    subType = innerRadius > 0 ? 'donut' : 'pie'
  } else if (seriesType === 'scatterSeries') {
    type = 'scatter'
    subType = 'scatter'
  } else if (seriesType === 'histogramSeries') {
    type = 'histogram'
    subType = 'histogram'
  } else if (seriesType === 'gaugeSeries') {
    type = 'gauge'
    subType = 'gauge'
  }

  return [type, subType]
}

/**
 * Capitalize the first letter of a string.
 * @param str
 * @returns {string}
 */
export const capitalizeString = (str: string) => {
  if (typeof str === 'string') {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  return null
}

/**
 * Check whether a data source instance is valid (whether the corresponding data source is deleted)
 * @param dataSource
 */
export const isDataSourceValid = (dataSource: DataSource): boolean => {
  if (!dataSource) return false
  const info = dataSource.getInfo()
  return info && Object.keys(info).length > 0
}

/**
 * Check whether a data source instance can be used to load data
 * @param dataSource
 */
export const isDataSourceReady = (dataSource: DataSource): boolean => {
  if (!isDataSourceValid(dataSource)) return false
  const status = dataSource.getStatus()
  //The data source is ready to use
  return status && status !== DataSourceStatus.NotReady
}

/**
 * Indicates whether a string field is empty (different from undefined, null and empty string).
 * The value is stringified before being trimmed to debunk edge cases like when the value is a numeric value.
 * @param value The value to test
 * @returns `true` if empty, `false` otherwise
 */
export function isEmptyStringField (value: string | undefined | null): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-template-expression
  return value === undefined || value === null || `${value}`.trim() === ''
}

/**
 * Get category type from chart query.
 * @param query
 */
export const getCategoryType = (
  query: IMFeatureLayerQueryParams
): CategoryType => {
  if (query?.groupByFieldsForStatistics != null) {
    return CategoryType.ByGroup
  } else if (query?.outStatistics != null) {
    return CategoryType.ByField
  }
}

/**
 * Get statistic type from chart query.
 * @param query
 */
export const getStatisticsType = (query: IMFeatureLayerQueryParams): ChartStatisticType => {
  if (query?.outFields?.length) {
    return 'no_aggregation'
  } else {
    return query?.outStatistics?.[0]?.statisticType
  }
}

/**
 * Get category field from chart query.
 * @param query
 */
export const getCategoryField = (
  query: IMFeatureLayerQueryParams
): string => {
  return query?.groupByFieldsForStatistics?.[0]
}

/**
 * Get number field from chart query.
 * @param query
 */
export const getNumberFields = (
  query: IMFeatureLayerQueryParams
): ImmutableArray<string> | undefined => {
  if (query?.outFields) {
    return query.outFields
  } else if (query?.outStatistics) {
    return query.outStatistics.map((outStatistic) => outStatistic?.onStatisticField).filter((field) => !!field)
  }
}

/**
 * Get category field type from chart query.
 * @param query
 */
export const getCategoryFieldType = (
  query: IMFeatureLayerQueryParams,
  dataSourceId: string
): JimuFieldType => {
  const categoryField = query?.groupByFieldsForStatistics?.[0]
  const fieldType = getFieldType(categoryField, dataSourceId)
  return fieldType
}

export const getSerialLineSmoothed = (
  series: WebChartSeries[] | ImmutableArray<WebChartSeries>
): boolean => {
  return (series?.[0] as WebChartLineChartSeries).lineSmoothed
}

export const getSerialLineShowArea = (
  series: WebChartSeries[] | ImmutableArray<WebChartSeries>
): boolean => {
  return (series?.[0] as WebChartLineChartSeries).showArea
}

//Using these special symbols as `outStatisticName` will cause some service statistics to fail.
const SpecialSymbolRegexp = /\(|\)|\[|\]|\%/gm

/**
 * Generate the `outStatisticName` for `query`, and it's always equal to `serie.y`
 * @param numericField
 * @param statisticType
 */
export const getOutStatisticName = (numericField: string, statisticType: ChartStatisticType) => {
  if (numericField?.match(SpecialSymbolRegexp)) {
    numericField = numericField.replace(SpecialSymbolRegexp, '__')
  }
  if (statisticType !== 'no_aggregation') {
    return `${statisticType === 'percentile-continuous' ? 'percentile_cont' : statisticType}_of_${numericField}`
  } else {
    return numericField
  }
}

export const getOutStatisticAlias = (numericFieldAlias: string, statisticType: ChartStatisticType) => {
  if (statisticType !== 'no_aggregation') {
    const type = statisticType === 'percentile-continuous' ? 'median' : statisticType
    return `${utils.uppercaseFirstLetter(type)} of ${numericFieldAlias}`
  } else {
    return numericFieldAlias
  }
}

const StatisticsTranslations = {
  sum: 'sumOfField',
  avg: 'meanOfField',
  min: 'minOfField',
  max: 'maxOfField',
  count: 'count',
  'percentile-continuous': 'medianOfField'
}

/**
 * Normalize the label of statistic type.
 * @param field
 * @param statisticType
 * @param translate
 */
export const normalizeStatisticFieldLabel = (statisticType, field, translate) => {
  const normalized = translate(StatisticsTranslations[statisticType], { field })
  return normalized
}

/**
 * Get default value format based on field type.
 * Note: For numeric fields, the category type of axis is used by default.
 * @param fieldType
 */
export const getDefaultValueFormat = (fieldType: JimuFieldType, discreteForNumeric: boolean = false): CategoryFormatOptions | NumberFormatOptions | DateTimeFormatOptions => {
  if (fieldType === JimuFieldType.Date) {
    return getDefaultDateFormat()
  } else if (fieldType === JimuFieldType.Number) {
    return discreteForNumeric
      ? getDefaultCategoryFormat()
      : {
          type: 'number',
          intlOptions: {
            style: 'decimal',
            useGrouping: false,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }
        }
  } else {
    return getDefaultCategoryFormat()
  }
}

export const getSplitOutStatisticName = (numericField: string, statisticType: ChartStatisticType, splitByValue: string | number) => {
  let outStatisticName = getOutStatisticName(numericField, statisticType)
  outStatisticName = `${outStatisticName}_of_${splitByValue}`
  return outStatisticName
}

export const getSplitOutStatisticAlias = (numericFieldAlias: string, statisticType: ChartStatisticType, splitByValue: string | number) => {
  let outStatisticAlias = getOutStatisticAlias(numericFieldAlias, statisticType)
  outStatisticAlias = `${outStatisticAlias} of ${splitByValue}`
  return outStatisticAlias
}

export const getSplitByFieldValues = (propSeries: ImmutableArray<WebChartSeries> | WebChartSeries[]): Array<number | string> => {
  if (!propSeries?.length) return []
  const series: WebChartSeries[] = (propSeries as ImmutableArray<WebChartSeries>).asMutable ? (propSeries as ImmutableArray<WebChartSeries>).asMutable({ deep: true }) : propSeries as WebChartSeries[]
  const values = series.map((serie) => {
    const where = serie.query.where
    const value = getSplitByValue({ where, normalize: true })
    return value
  })
  return values
}

export const getFieldUniqueValuesParams = (field: string, pageSize?: number): FeatureLayerQueryParams => {
  const outFields = [field]
  const nullFilter = `${field} IS NOT NULL`
  const orderByFields = !isEmptyStringField(field) ? [`${field} ASC`] : []
  const params: FeatureLayerQueryParams = {
    where: nullFilter,
    orderByFields,
    outFields,
    returnDistinctValues: true,
    returnGeometry: false,
    pageSize
  }
  return params
}

export const queryFieldUniqueValues = async (dataSource: QueriableDataSource, field: string, MaxCount = 101, scope?: QueryScope): Promise<Array<number | string>> => {
  const params = getFieldUniqueValuesParams(field, MaxCount)
  const options = scope ? { scope } : null
  const result = await dataSource.query(params, options)
  let values: Array<number | string> = result.records
    .map((record): string | number => record.getFieldValue(field))
    .filter((value) => value !== undefined)
  // For services with a typeIdField, the distinct values returned might be duplicated, manual deduplication is required.
  values = [...new Set(values)]
  return values
}

/**
 * Create the default by category type.
 * @param categoryType
 */
export const createDefaultQuery = (categoryType = CategoryType.ByGroup): FeatureLayerQueryParams => {
  if (categoryType === CategoryType.ByGroup) {
    return {
      groupByFieldsForStatistics: [],
      outStatistics: []
    }
  } else if (categoryType === CategoryType.ByField) {
    return {
      outStatistics: []
    }
  }
}

export const DefaultTemporalBinning: WebChartTemporalBinning = {
  size: 1,
  unit: 'months',
  timeAggregationType: 'equalIntervalsFromStartTime',
  trimIncompleteTimeInterval: false,
  nullPolicy: 'interpolate'
}

/**
 * Create a default series based on the series properties.
 * @param seriesProps
 * @param index
 */
export const createDefaultSerie = (seriesProps: WebChartSeries, index = 0, colorProps?: SeriesColorProps): WebChartSeries => {
  if (!seriesProps) return null
  const { type = 'lineSeries', dataLabels, dataTooltipVisible } = seriesProps

  let serie = null
  if (type === 'barSeries') {
    const { fillSymbol, hideOversizedStackedLabels = false, binTemporalData = false } = seriesProps as WebChartBarChartSeries
    serie = getDefaultBarChartSeries(index, colorProps)
    serie.binTemporalData = binTemporalData
    serie.hideOversizedStackedLabels = hideOversizedStackedLabels

    if (fillSymbol) {
      if (!colorProps?.color && colorProps?.preSerieColor) {
        const color = getNonRepeatingColor(colorProps?.colors ?? SeriesColors, index, colorProps.preSerieColor)
        serie.fillSymbol = { ...fillSymbol, color }
      } else {
        serie.fillSymbol = fillSymbol
      }
    }
  } else if (type === 'lineSeries') {
    const {
      lineSmoothed = false,
      showArea = false,
      markerVisible = false,
      binTemporalData = false,
      lineSymbol,
      markerSymbol
    } = seriesProps as WebChartLineChartSeries

    serie = getDefaultLineChartSeries(index, colorProps)
    serie.binTemporalData = binTemporalData
    serie.lineSmoothed = lineSmoothed
    serie.showArea = showArea
    serie.markerVisible = markerVisible

    if (!colorProps?.color && colorProps?.preSerieColor) {
      const color = getNonRepeatingColor(colorProps?.colors ?? SeriesColors, index, colorProps.preSerieColor)
      if (lineSymbol) {
        serie.lineSymbol = { ...lineSymbol, color }
      }
      if (markerSymbol) {
        serie.markerSymbol = { ...markerSymbol, color }
      }
    } else {
      if (lineSymbol) {
        serie.lineSymbol = lineSymbol
      }
      if (markerSymbol) {
        serie.markerSymbol = markerSymbol
      }
    }
  } else if (type === 'pieSeries') {
    const { innerRadius = 0, startAngle = 0, endAngle = 360 } = seriesProps as WebChartPieChartSeries
    serie = getDefaultPieChartSeries()
    serie.innerRadius = innerRadius
    serie.startAngle = startAngle
    serie.endAngle = endAngle
  } else if (type === 'scatterSeries') {
    const { markerSymbol, overlays } = seriesProps as WebChartScatterplotSeries
    serie = getDefaultScatterPlotChartSeries()
    if (markerSymbol) {
      serie.markerSymbol = markerSymbol
    }
    if (overlays) {
      serie.overlays = overlays
    }
  } else if (type === 'histogramSeries') {
    const { fillSymbol, binCount, overlays, dataTransformationType } = seriesProps as WebChartHistogramSeries
    serie = getDefaultHistogramSeries()
    serie.binCount = binCount
    if (overlays) {
      serie.overlays = overlays
    }
    if (fillSymbol) {
      serie.fillSymbol = fillSymbol
    }
    if (dataTransformationType) {
      serie.dataTransformationType = dataTransformationType
    }
  } else if (type === 'gaugeSeries') {
    const { valueConversion, featureIndex = 0 } = seriesProps as WebChartGaugeSeries
    serie = getDefaultGaugeSeries()
    serie.valueConversion = valueConversion
    serie.featureIndex = featureIndex
  }

  if (dataLabels && type !== 'gaugeSeries') {
    serie.dataLabels = dataLabels
  }

  if (dataTooltipVisible != null) {
    serie.dataTooltipVisible = dataTooltipVisible
  }

  return serie
}

/**
 * Get the used series by series id or index.
 * @param propSeries
 * @param id
 * @param index
 */
export const getUsedSeriesProps = (propSeries: WebChartSeries[], id: string, index: number = 0, colorProps?: SeriesColorProps): WebChartSeries => {
  let defaultSerie = propSeries.find((propSerie) => propSerie.id === id) as unknown as WebChartSeries
  if (!defaultSerie) {
    const template = propSeries[index] ?? propSeries[0]
    const { type, dataLabels, dataTooltipVisible } = template
    const { hideOversizedStackedLabels, binTemporalData } = template as WebChartBarChartSeries
    const { lineSmoothed, showArea, markerVisible, markerSymbol } = template as WebChartLineChartSeries
    const { innerRadius, startAngle, endAngle } = template as WebChartPieChartSeries
    defaultSerie = {
      type,
      dataLabels,
      binTemporalData,
      dataTooltipVisible,
      hideOversizedStackedLabels,
      lineSmoothed,
      showArea,
      markerVisible,
      markerSymbol,
      innerRadius,
      startAngle,
      endAngle
    } as unknown as WebChartSeries
  }
  const seriesProps = createDefaultSerie(defaultSerie, index, colorProps)
  return seriesProps
}

const getSeriesProps = (serie: ImmutableObject<WebChartSeries>, query: IMFeatureLayerQueryParams) => {
  const categoryField = query?.groupByFieldsForStatistics?.[0] ?? ''
  const outStatistics = query?.outStatistics
  const outFields = query?.outFields
  const where = query?.where
  const splitByField = getSplitByField(where, true)
  const statisticType = getStatisticsType(query) ?? 'count'

  const binTemporalData = (serie as unknown as WebChartLineChartSeries)?.binTemporalData
  const temporalBinning = (serie as unknown as WebChartLineChartSeries)?.temporalBinning

  const numericFields = outFields || outStatistics?.map((outStatistic) => outStatistic.onStatisticField)?.filter(field => !!field)

  return { splitByField, categoryField, numericFields, statisticType, binTemporalData, temporalBinning }
}

export interface SplitBySerieProps {
  propSeries: any
  name?: string
  categoryField: string
  numberField: string
  splitByField: string
  splitByFieldType: JimuFieldType
  splitByValue: string | number
  binTemporalData?: boolean
  temporalBinning: WebChartTemporalBinning
}

export const createSplitBySerie = (props: SplitBySerieProps, index: number, colorProps?: SeriesColorProps) => {
  const { propSeries, name, categoryField, numberField, binTemporalData, temporalBinning, splitByField, splitByFieldType, splitByValue } = props
  let serie = getUsedSeriesProps(propSeries, splitByValue as string, index, colorProps)
  const idAndName = `${splitByValue}`
  const y = numberField
  serie.id = idAndName
  serie.x = categoryField
  ; (serie as any).y = y
  ; (serie as any).binTemporalData = binTemporalData
  serie.name = name || idAndName
  if (binTemporalData && temporalBinning) {
    serie = {
      ...serie,
      temporalBinning: {
        ...DefaultTemporalBinning,
        ...temporalBinning
      }

    } as any
  }
  const where = `${splitByField}=${splitByFieldType === JimuFieldType.String ? `'${splitByValue}'` : splitByValue
    }`
  const query = { where }
  serie.query = query
  return serie
}

interface SeriesStyleProps extends SeriesColorProps {
  symbol?: ISimpleFillSymbol | ISimpleLineSymbol
}

export const createSplitBySerieFromSeries = (
  propSeries: ImmutableArray<WebChartSeries>,
  propQuery: IMFeatureLayerQueryParams,
  splitByFieldType: JimuFieldType,
  splitByValues: Array<string | number>,
  deletable: boolean = false,
  colorProps?: SeriesStyleProps
): ImmutableArray<WebChartSeries> => {
  const seriesProps = getSeriesProps(propSeries[0], propQuery)
  const { splitByField, categoryField, numericFields, binTemporalData, temporalBinning } =
    seriesProps
  const numberField = numericFields[0]
  let preSerieColor = colorProps?.preSerieColor ?? ''
  const seriesValues = splitByValues.map((splitByValue, index) => {
    let serie = propSeries.find((serie) => {
      const seriesSplitByValue = getSplitByValue({ where: serie.query.where, normalize: false })
      const rawSplitByValue = splitByFieldType === JimuFieldType.String ? `'${splitByValue}'` : splitByValue
      return seriesSplitByValue === rawSplitByValue
    })
    if (!serie) {
      let splitByProps = {
        propSeries,
        categoryField,
        numberField,
        splitByField,
        splitByFieldType,
        splitByValue,
        binTemporalData,
        temporalBinning: null
      }
      if (binTemporalData && temporalBinning) {
        splitByProps = {
          ...splitByProps,
          temporalBinning: {
            ...DefaultTemporalBinning,
            ...temporalBinning
          }
        }
      }
      serie = createSplitBySerie(splitByProps, index, { ...colorProps, preSerieColor })
      serie.deletable = deletable
      preSerieColor =
        (serie as any).fillSymbol?.color ?? (serie as any).lineSymbol?.color
      if (colorProps.symbol) {
        if (serie.type === 'barSeries') {
          (serie as WebChartBarChartSeries).fillSymbol = colorProps.symbol as ISimpleFillSymbol
        } else if (serie.type === 'lineSeries') {
          (serie as WebChartLineChartSeries).lineSymbol = colorProps.symbol as ISimpleLineSymbol
        }
      }
    }
    return serie
  })
  const series = Immutable(seriesValues)
  return series
}

export const applySeriesColors = (propSeries: ImmutableArray<WebChartSeries>, colors: string[]): ImmutableArray<WebChartSeries> => {
  if (!colors) return
  const slices = propSeries?.map((serie, index) => {
    const color = getColorInOrder(colors, index)
    const type = serie.type
    if (type === 'barSeries') {
      serie = serie.setIn(['fillSymbol', 'color'], color)
    } else if (type === 'lineSeries') {
      serie = serie.setIn(['lineSymbol', 'color'], color)
    }
    return serie as any
  })
  return slices
}

export const createRuntimeSplitBySeries = (
  propSeries: ImmutableArray<WebChartSeries>,
  propQuery: IMFeatureLayerQueryParams,
  splitByFieldType: JimuFieldType,
  splitByValues: Array<string | number>
): ImmutableArray<WebChartSeries> => {
  const otherSerie = propSeries.find(serie => serie.id === SplitByOtherSeriesValue)
  const symbol = otherSerie.type === 'barSeries' ? (otherSerie as WebChartBarChartSeries).fillSymbol : (otherSerie as WebChartLineChartSeries).lineSymbol
  let series = createSplitBySerieFromSeries(propSeries, propQuery, splitByFieldType, splitByValues, false, { symbol })
  series = series.map((serie) => {
    if (serie.deletable) {
      serie = serie.without('deletable')
    }
    return serie as unknown as WebChartSeries
  })
  return series
}

export const normalizeRuntimeSplitBySeries = (propSeries: ImmutableArray<WebChartSeries>): ImmutableArray<WebChartSeries> => {
  const series = propSeries?.filter((serie) => {
    return !serie.deletable && serie.id !== SplitByOtherSeriesValue
  })
  return series
}

interface SeriesProps {
  categoryField: string
  statisticType: ChartStatisticType
  numericFields: string[]
  propSeries?: WebChartSeries[]
  binTemporalData?: boolean
  temporalBinning?: WebChartTemporalBinning
  splitByField?: string
  splitByFieldType?: JimuFieldType
  splitByFieldValues?: Array<number | string>
}

export const createByGroupSeries = (props: SeriesProps, dataSourceId?: string): WebChartSeries[] => {
  const { splitByField, splitByFieldType, splitByFieldValues, categoryField, numericFields, statisticType, propSeries, binTemporalData, temporalBinning } = props

  let series: WebChartSeries[] = []
  if (splitByField && splitByFieldValues.length) {
    let preSerieColor = ''
    const numberField = numericFields[0]
    const seriesValues = splitByFieldValues.map((splitByValue, index) => {
      const splitByProps = { propSeries, categoryField, numberField, binTemporalData, temporalBinning, splitByField, splitByFieldType, splitByValue }
      const serie = createSplitBySerie(splitByProps, index, { preSerieColor })
      preSerieColor = (serie as any).fillSymbol?.color ?? (serie as any).lineSymbol?.color
      return serie
    })
    const otherSplitByProps = { propSeries, name: SplitByOtherSeriesName, categoryField, numberField, binTemporalData, temporalBinning, splitByField, splitByFieldType, splitByValue: SplitByOtherSeriesValue }
    const otherSerie = createSplitBySerie(otherSplitByProps, 0, { color: DefaultSplitByOtherSeriesColor })
    series = seriesValues.concat(otherSerie)
  } else {
    const numberFields = numericFields?.length ? numericFields : ['']
    let preSerieColor = ''
    series = numberFields.map((numericField, index) => {
      let serie = getUsedSeriesProps(propSeries, numericField, index, { preSerieColor })
      preSerieColor = (serie as any).fillSymbol?.color ?? (serie as any).lineSymbol?.color
      const y = numericField ? getOutStatisticName(numericField, statisticType) : ''
      const name = numericField ? (getFieldSchema(numericField, dataSourceId)?.alias || numericField) : ''
      serie.id = numericField
      serie.x = categoryField
      serie.name = name
      ; (serie as any).y = y
      ; (serie as any).binTemporalData = binTemporalData
      if (binTemporalData && temporalBinning) {
        serie = {
          ...serie,
          temporalBinning: {
            ...DefaultTemporalBinning,
            ...temporalBinning
          }
        } as any
      }
      return serie
    })
  }
  return series
}

export const createByGroupQuery = ({ categoryField, splitByField, statisticType, numericFields }: SeriesProps, pageSize?: number): FeatureLayerQueryParams => {
  const groupByFieldsForStatistics = [categoryField]
  let where = ''
  if (splitByField) {
    where = `${splitByField}={value}`
  }
  if (statisticType === 'no_aggregation') {
    let outFields = numericFields as unknown as string[]
    if (!outFields.length) {
      outFields = ['']
    }
    const query: FeatureLayerQueryParams = { groupByFieldsForStatistics, outFields }
    if (pageSize) {
      query.pageSize = pageSize
    }
    if (where) {
      query.where = where
    }
    return query
  } else {
    let outStatistics = numericFields.map((numericField) => {
      const outStatisticFieldName = getOutStatisticName(numericField, statisticType)

      const statistic: any = {
        statisticType,
        onStatisticField: numericField,
        outStatisticFieldName
      }
      if (statisticType === 'percentile-continuous') {
        const statisticParameters = {
          value: 0.5
        }
        statistic.statisticParameters = statisticParameters
      }
      return statistic
    }) as unknown as any[]

    if (!outStatistics.length) {
      outStatistics = [{
        statisticType: statisticType ?? 'sum',
        onStatisticField: '',
        outStatisticFieldName: ''
      }]
    }
    const query: FeatureLayerQueryParams = { groupByFieldsForStatistics, outStatistics }
    if (pageSize) {
      query.pageSize = pageSize
    }
    if (where) {
      query.where = where
    }
    return query
  }
}

export const createByFieldSeries = ({ x, y, name, propSeries }): WebChartSeries[] => {
  const seriesProps = propSeries[0]
  const serie = createDefaultSerie(seriesProps, 0)
  serie.x = x
  ;(serie as any).y = y
  serie.name = name
  serie.id = y
  return [serie]
}

export const createByFieldQuery = ({ statisticType, numericFields }): FeatureLayerQueryParams => {
  const outStatistics = numericFields.map((numericField) => {
    const statistic: any = {
      statisticType,
      onStatisticField: numericField,
      outStatisticFieldName: numericField
    }
    if (statisticType === 'percentile-continuous') {
      const statisticParameters = {
        value: 0.5
      }
      statistic.statisticParameters = statisticParameters
    }
    return statistic
  })

  return { outStatistics }
}

export const createGaugeSeries = ({ numericField, propSeries }, dataSourceId): WebChartSeries[] => {
  const seriesProps = propSeries[0]
  const serie = createDefaultSerie(seriesProps, 0)
  const statName = GaugeDisplayValueField
  const name = numericField ? (getFieldSchema(numericField, dataSourceId)?.alias || numericField) : ''
  serie.id = numericField
  serie.x = statName
  serie.name = name
  return [serie]
}

export const createHistogramSeries = (x, propSeries, dataSourceId?: string): WebChartSeries[] => {
  const seriesProps = propSeries[0]
  const serie = createDefaultSerie(seriesProps, 0)
  serie.x = x
  const name = getFieldSchema(x, dataSourceId)?.alias || x
  serie.name = name
  serie.id = x
  return [serie]
}

export const createHistogramQuery = (x, pageSize?: number): FeatureLayerQueryParams => {
  const outFields = []
  if (x) {
    outFields[0] = x
  }
  const query: FeatureLayerQueryParams = { outFields }
  if (pageSize) {
    query.pageSize = pageSize
  }
  return query
}

export const createScatterPlotSeries = ({ x, y, propSeries }, dataSourceId?: string): WebChartSeries[] => {
  const seriesProps = propSeries[0]
  const serie = createDefaultSerie(seriesProps, 0)
  serie.x = x
  ;(serie as any).y = y
  const name = getFieldSchema(y, dataSourceId)?.alias || y
  serie.name = name
  serie.id = y
  return [serie]
}

export const createScatterPlotQuery = ({ x, y }, pageSize?: number): FeatureLayerQueryParams => {
  const outFields = []
  if (x) {
    outFields[0] = x
  }
  if (y) {
    outFields[1] = y
  }
  const query: FeatureLayerQueryParams = { outFields }
  if (pageSize) {
    query.pageSize = pageSize
  }
  return query
}

/**
 * Check whether the query in chart data source is valid.
 * @param dataSource
 */
export const isValidQuery = (
  type: ChartTypes,
  query: IMFeatureLayerQueryParams
): boolean => {
  if (isSerialSeries(type) || type === 'pieSeries') {
    if (query.outFields) {
      return !!(query?.outFields?.[0] && query?.groupByFieldsForStatistics?.[0])
    } else {
      if (query?.groupByFieldsForStatistics) {
        return (
          !!query?.groupByFieldsForStatistics?.[0] &&
          !!query?.outStatistics?.[0]?.onStatisticField
        )
      } else {
        return !!query?.outStatistics?.[0]?.onStatisticField
      }
    }
  } else if (type === 'scatterSeries') {
    return !!query?.outFields?.[1]
  } else if (type === 'histogramSeries') {
    return !!query?.outFields?.[0]
  } else if (type === 'gaugeSeries') {
    if (!query?.outStatistics?.[0]) return false
    return query.outStatistics.every((outStatistic, index: number) => {
      if (index !== 0 && !outStatistic) return true
      return !!outStatistic?.onStatisticField
    })
  }
}

export const createGaugeOutStatisticDefinition = ({ statisticType, numericField }): StatisticDefinition => {
  const outStatisticFieldName = GaugeDisplayValueField

  const statistic: StatisticDefinition = {
    statisticType,
    onStatisticField: numericField,
    outStatisticFieldName
  }
  if (statisticType === 'percentile-continuous') {
    const statisticParameters = {
      value: 0.5
    }
    statistic.statisticParameters = statisticParameters
  }

  return statistic
}

export const createGaugeQuery = (valueStatistic, minimumStatistic, maximumStatistic): FeatureLayerQueryParams => {
  const outStatistics = [valueStatistic]
  if (minimumStatistic) {
    outStatistics[1] = minimumStatistic
  }
  if (maximumStatistic) {
    outStatistics[2] = maximumStatistic
  }
  return { outStatistics }
}

const truncateString = (str: string, maxLen = 60): string => {
  if (str.length > maxLen) {
    return str.slice(0, maxLen) + '...'
  }
  return str
}

const convertArrayToLimitedString = (input: string[] | ImmutableArray<string>) => {
  if (!input.length) return ''
  if (input.length === 1) return input[0]
  return truncateString(input.join(', '))
}

const getStatisticsTypeTranslation = (statisticsType) => {
  if (statisticsType === 'avg') {
    return 'mean'
  } else if (statisticsType === 'percentile-continuous') {
    return 'median'
  } else if (statisticsType === 'no_aggregation') {
    return 'noAggregation'
  }
  return statisticsType
}

/**
 * Gets the proper chart title from the web-chart config.
 * @param webChart
 * @param dataSourceId
 * @param translate
 */
export const getChartTitle = (webChart: ImmutableObject<IWebChart>, dataSourceId: string, translate: (id: string, values?: any) => string): string => {
  let title = ''
  const query = webChart.dataSource?.query
  const seriesType = getSeriesType(webChart.series as any)
  if (!isValidQuery(seriesType, query)) return title
  if (isSerialSeries(seriesType) || seriesType === 'pieSeries') {
    const numberFields = getNumberFields(query)
    const numberFieldsLabels = getFieldsAlias(numberFields, dataSourceId)
    const statistic = getStatisticsType(query)
    const statisticTranslation = getStatisticsTypeTranslation(statistic)
    const statisticLabel = statistic === 'no_aggregation' ? statistic : translate(statisticTranslation)
    const categoryType = getCategoryType(query)
    if (categoryType === CategoryType.ByGroup) {
      const categoryField = getCategoryField(query)
      const categoryFieldLabel = getFieldAlias(categoryField, dataSourceId)
      const splitByField = getSplitByField(query.where)
      const splitByFieldLabel = getFieldAlias(splitByField, dataSourceId)
      if (splitByField) {
        if (statistic === 'no_aggregation') {
          title = translate('numberFieldByCategoryFieldBySplitByField', { numberField: numberFieldsLabels[0], categoryField: categoryFieldLabel, splitByField: splitByFieldLabel })
        } else {
          if (statistic === 'count') {
            title = translate('countByCategoryFieldBySplitByField', { categoryField: categoryFieldLabel, splitByField: splitByFieldLabel })
          } else {
            title = translate('statisticOfNumberFieldByCategoryFieldBySplitByField', { statistic: statisticLabel, numberField: numberFieldsLabels[0], categoryField: categoryFieldLabel, splitByField: splitByFieldLabel })
          }
        }
      } else {
        if (statistic === 'no_aggregation') {
          title = translate('numberFieldByCategoryField', { numberField: convertArrayToLimitedString(numberFieldsLabels), categoryField: categoryFieldLabel })
        } else {
          if (statistic === 'count') {
            title = translate('countByCategoryField', { categoryField: categoryFieldLabel, splitByField: splitByFieldLabel })
          } else {
            title = translate('statisticOfNumberFieldByCategoryField', { statistic: statisticLabel, numberField: convertArrayToLimitedString(numberFieldsLabels), categoryField: categoryFieldLabel })
          }
        }
      }
    } else if (categoryType === CategoryType.ByField) {
      title = translate('statisticOfNumberField', { statistic: statisticLabel, numberField: convertArrayToLimitedString(numberFieldsLabels) })
    }
  } else if (seriesType === 'scatterSeries') {
    const numberFields = query.outFields
    const numberFieldsLabels = getFieldsAlias(numberFields, dataSourceId)
    title = translate('xFieldAndyField', { xField: numberFieldsLabels[0], yField: numberFieldsLabels[1] })
  } else if (seriesType === 'histogramSeries') {
    const numberFields = query.outFields
    const numberFieldsLabels = getFieldsAlias(numberFields, dataSourceId)
    title = translate('distributionOfNumberField', { numberField: numberFieldsLabels[0] })
  }
  return title
}

/**
 * Gets the proper label of x-axis from the web-chart config.
 * @param webChart
 * @param dataSourceId
 * @param translate
 */
export const getChartXLabel = (webChart: ImmutableObject<IWebChart>, dataSourceId: string, translate: (id: string, values?: any) => string): string => {
  let label = ''
  const query = webChart.dataSource?.query
  const seriesType = getSeriesType(webChart.series as any)
  if (!isValidQuery(seriesType, query)) return label
  if (isSerialSeries(seriesType) || seriesType === 'pieSeries') {
    const categoryType = getCategoryType(query)
    if (categoryType === CategoryType.ByGroup) {
      const categoryField = getCategoryField(query)
      label = getFieldAlias(categoryField, dataSourceId)
    } else if (categoryType === CategoryType.ByField) {
      label = translate('fields')
    }
  } else if (seriesType === 'scatterSeries') {
    label = getFieldAlias(query.outFields[0], dataSourceId)
  } else if (seriesType === 'histogramSeries') {
    label = getFieldAlias(query.outFields[0], dataSourceId)
  }
  return label
}

/**
 * Gets the proper label of x-axis from the web-chart config.
 * @param webChart
 * @param dataSourceId
 * @param translate
 */
export const getChartYLabel = (webChart: ImmutableObject<IWebChart>, dataSourceId: string, translate: (id: string, values?: any) => string): string => {
  let label = ''
  const query = webChart.dataSource?.query
  const seriesType = getSeriesType(webChart.series as any)
  if (!isValidQuery(seriesType, query)) return label
  if (isSerialSeries(seriesType) || seriesType === 'pieSeries') {
    const categoryType = getCategoryType(query)
    const numberFields = getNumberFields(query)
    const numberFieldsLabels = getFieldsAlias(numberFields, dataSourceId)
    const statistic = getStatisticsType(query)
    const statisticTranslation = getStatisticsTypeTranslation(statistic)
    const statisticLabel = statistic === 'no_aggregation' ? statistic : translate(statisticTranslation)
    if (categoryType === CategoryType.ByGroup) {
      if (statistic === 'no_aggregation') {
        label = numberFieldsLabels?.length === 1 ? numberFieldsLabels[0] : translate('values')
      } else {
        if (statistic === 'count') {
          label = translate('count')
        } else {
          label = numberFieldsLabels?.length === 1 ? translate('statisticOfNumberField', { statistic: statisticLabel, numberField: numberFieldsLabels[0] }) : translate('statisticOfValues', { statistic: statisticLabel })
        }
      }
    } else if (categoryType === CategoryType.ByField) {
      label = translate('statisticOfValues', { statistic: statisticLabel })
    }
  } else if (seriesType === 'scatterSeries') {
    label = getFieldAlias(query.outFields[1], dataSourceId)
  } else if (seriesType === 'histogramSeries') {
    label = translate('count')
  }
  return label
}

const useSelector = (fn: (state: IMState) => any) => {
  return ReactRedux.useSelector((state: IMState) => {
    state = window.jimuConfig.isBuilder ? state.appStateInBuilder : state
    return fn(state)
  })
}

/**
 * Create and return the corresponding feature layer according to the input data source id.
 * @param dataSourceId
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const useDataSourceFeatureLayer = <T = any>(dataSourceId: string): T => {
  const cancelable = hooks.useCancelablePromiseMaker()
  const pendingPromise = React.useRef<cancelablePromise.CancelablePromise>(null)
  const [layer, setLayer] = React.useState<T>(null)
  const sourceStatus = useSelector((state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.instanceStatus)

  const mainDataSourceId = DataSourceManager.getInstance().getDataSource(dataSourceId)?.getMainDataSource().id ?? dataSourceId
  const mainSourceVersion = useSelector((state: IMState) => state.dataSourcesInfo?.[mainDataSourceId]?.sourceVersion)
  const sourceVersion = useSelector((state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.sourceVersion)
  const needRefresh = useSelector((state: IMState) => state.dataSourcesInfo?.[dataSourceId]?.needRefresh)

  const prevNeedRefreshRef = React.useRef(needRefresh)
  React.useEffect(() => {
    if (sourceStatus !== DataSourceStatus.Created) return
    let dataSource = DataSourceManager.getInstance().getDataSource(dataSourceId) as FeatureLayerDataSource
    if (!dataSource) {
      console.error(`No data source founded for id: ${dataSourceId}`)
      return
    }
    const prevNeedRefresh = prevNeedRefreshRef.current
    prevNeedRefreshRef.current = needRefresh
    if (prevNeedRefresh === true && needRefresh === false) return

    if ((dataSource as DataSource).type === DataSourceTypes.SceneLayer || (dataSource as DataSource).type === DataSourceTypes.BuildingComponentSubLayer) {
      dataSource = (dataSource as unknown as SceneLayerDataSource).getAssociatedDataSource()
    }
    if(pendingPromise.current) {
      pendingPromise.current.cancel()
      pendingPromise.current = null
    }
    pendingPromise.current = cancelable(dataSource.createJSAPILayerByDataSource()).then((layer: any) => {
      if (layer.type === 'feature') {
        layer.definitionExpression = ''
      }
      pendingPromise.current = null
      setLayer(layer)
    }).catch((error) => {
      pendingPromise.current = null
      console.error('Error creating layer from data source', error)
    })
  }, [cancelable, dataSourceId, sourceStatus, mainSourceVersion, sourceVersion, needRefresh])

  return layer
}

/**
 * Determines if a Set of series type matches a combo bar-line chart
 * @param uniqueTypes The set of unique series types
 */
function isComboLineAndBarChart (uniqueTypes: Set<string>): boolean | undefined {
  return (
    uniqueTypes.size === 2 &&
    uniqueTypes.has('lineSeries') &&
    uniqueTypes.has('barSeries')
  )
}

/**
 * Determines if a Set of series type matches a box plot
 * @param uniqueTypes The set of unique series types
 */
function isBoxPlotChart (uniqueTypes: Set<string>): boolean {
  return (
    (uniqueTypes.size === 2 &&
      uniqueTypes.has('lineSeries') &&
      uniqueTypes.has('boxPlotSeries')) ||
    (uniqueTypes.size === 1 && uniqueTypes.has('boxPlotSeries'))
  )
}

/**
 * Getting the type of a chart or series. If the input parameters are incorrect (empty array of series, or a mix of unknown/un-allowed series types) the function returns `undefined`.
 * To get the series type, a valid seriesIndex is required. Otherwise, the type of a chart is determined and returned.
 * @param chartSeries The array of chart's series
 * @param seriesIndex An index to get a specific series' type.  A valid index is required if the goal is to get the type of the series.
 */
export function getChartOrSeriesType (
  chartSeries: WebChartSeries[] | ImmutableArray<WebChartSeries> | undefined,
  seriesIndex?: number
): ChartTypes | undefined {
  let seriesType: ChartTypes | undefined

  if (chartSeries !== undefined && chartSeries.length > 0) {
    // get the series type for a specific series based on the index
    if (
      seriesIndex !== undefined &&
      seriesIndex >= 0 &&
      seriesIndex < chartSeries.length
    ) {
      seriesType = chartSeries[seriesIndex].type as ChartTypes
    } else {
      const uniqueTypes = new Set<string>(chartSeries.map((s) => s.type))

      const isBarLineCombo = isComboLineAndBarChart(uniqueTypes)
      const isBoxPlot = isBoxPlotChart(uniqueTypes)

      if (isBarLineCombo) {
        seriesType = 'comboLineAndBarSeries'
      } else if (isBoxPlot) {
        seriesType = 'boxPlotSeries'
      } else if (uniqueTypes.size >= 2) {
        // if the series array still has multiple types of series, we return `undefined`
        seriesType = undefined
      } else {
        seriesType = chartSeries[0].type as ChartTypes
      }
    }
  }
  return seriesType
}

/**
 * Get the series to use as a reference for the chart. That's the one containing important common information like the query,
 * the split-by field, etc.
 * For box plot we need to handle the specific case of the mean line series.
 * @param chartConfig The chart config
 */
export function getSeriesReference (
  series: ImmutableArray<WebChartSeries>,
  showMean: boolean = false
): ImmutableObject<WebChartSeries> {
  // in mean lines mode for box plot (showMean: true), the first series doesn't always contain the expected information.
  // In that case we look for the first line series instead
  let seriesReference =
    showMean
      ? series.find((s) => s.type === 'lineSeries') as unknown as ImmutableObject<WebChartSeries>
      : series[0]

  seriesReference ??= series[0]

  return seriesReference
}
