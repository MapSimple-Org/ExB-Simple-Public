import { EsriFieldType, type FieldFormatSchema, type FieldSchema, JimuFieldType, type IMFeatureLayerQueryParams, type ImmutableArray, Immutable, type ImmutableObject, type IMFieldSchema, StatisticType, type DataSourceSchema, type DataSource } from 'jimu-core'
import { ByFieldSeriesX, ByFieldSeriesXAlias, ByFieldSeriesY, ByFieldSeriesYAlias, GaugeDisplayValueField, GaugeDisplayValueFieldAlias, GaugeMaxValueField, GaugeMaxValueFieldAlias, GaugeMinValueField, GaugeMinValueFieldAlias, HistogramCountField, HistogramCountFieldAlias, HistogramMaxValueField, HistogramMaxValueFieldAlias, HistogramMinValueField, HistogramMinValueFieldAlias, SplitByOtherSeriesValue } from '../../constants'
import { getSplitByField, type ChartTypes } from 'jimu-ui/advanced/chart'
import { isSerialSeries } from '../default'
import { getFieldSchema, getOutStatisticAlias, getSplitByFieldValues, getSplitOutStatisticAlias, getSplitOutStatisticName, isValidQuery } from './series'
import type { WebChartSeries } from '../../config'

const getCleanFieldSchema = (field: string, type: JimuFieldType, alias?: string, originFields?: string[]): FieldSchema => {
  const jimuName = field
  const name = field
  alias = alias ?? field

  let esriType = EsriFieldType.String
  let format: FieldFormatSchema = null
  if (type === JimuFieldType.Number) {
    format = {
      digitSeparator: true,
      places: 3
    }
    esriType = EsriFieldType.Double
  }
  const schema: FieldSchema = { jimuName, type, esriType, name, alias, format }
  if (originFields) {
    schema.originFields = originFields
  }
  return schema
}

const completeStatisticsFormat = (inputFormat: ImmutableObject<FieldFormatSchema>, statisticType) => {
  // defining formats for the schema of output data source https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder/issues/8902
  let format = inputFormat
  if (statisticType === StatisticType.Count) {
    format = format || Immutable({})
    format = format.set('places', 0)
  } else if (statisticType === StatisticType.Avg) {
    if (!format?.places) {
      format = format || Immutable({})
      format = format.set('places', 3)
    }
  }
  return format
}

export const getGaugeFields = (query: IMFeatureLayerQueryParams, dataSourceId: string) => {
  let fields = Immutable({}) as ImmutableObject<{ [jimuName: string]: FieldSchema }>
  const valid = isValidQuery('gaugeSeries', query)
  if (valid) {
    const fieldInfos = [{
      name: GaugeDisplayValueField,
      alias: GaugeDisplayValueFieldAlias
    }, {
      name: GaugeMinValueField,
      alias: GaugeMinValueFieldAlias
    }, {
      name: GaugeMaxValueField,
      alias: GaugeMaxValueFieldAlias
    }]
    const outStatistics = query.outStatistics
    const valueField = outStatistics[0].onStatisticField
    fieldInfos.forEach(({ name, alias }, index) => {
      const statistic = outStatistics[index]
      const originField = statistic?.onStatisticField || valueField
      const statisticType = statistic?.statisticType ?? 'count'
      let schema = getJimuFieldSchema(originField, dataSourceId, name)
      if (schema) {
        schema = schema.set('alias', alias)
        if (statisticType === StatisticType.Count) {
          schema = schema.set('esriType', EsriFieldType.Integer)
        }
        const format = completeStatisticsFormat(schema.format, statisticType)
        if (format) {
          schema = schema.set('format', format)
        }
      }
      fields = fields.set(name, schema)
    })
  }
  return fields
}

export const getHistogramFields = (query: IMFeatureLayerQueryParams, dataSourceId: string): ImmutableObject<{ [jimuName: string]: FieldSchema }> => {
  let fields = Immutable({}) as ImmutableObject<{ [jimuName: string]: FieldSchema }>

  const originField = query?.outFields?.[0]

  if (originField) {
    const fieldInfos = [{
      name: HistogramMinValueField,
      alias: HistogramMinValueFieldAlias
    }, {
      name: HistogramMaxValueField,
      alias: HistogramMaxValueFieldAlias
    }, {
      name: HistogramCountField,
      alias: HistogramCountFieldAlias
    }]
    fieldInfos.forEach(({ name, alias }) => {
      const jimuName = name
      const originFields = [originField]
      const type = JimuFieldType.Number
      const esriType = name === HistogramCountField ? EsriFieldType.Integer : EsriFieldType.Double
      const originFieldSchema = getFieldSchema(originField, dataSourceId)
      const digitSeparator = originFieldSchema?.format?.digitSeparator ?? true
      const places = name === HistogramCountField ? 0 : 3
      const format = { ...originFieldSchema?.format, digitSeparator, places }
      const fieldSchema = { jimuName, type, esriType, name, alias, originFields, format }
      fields = fields.set(name, fieldSchema)
    })
  }

  return fields
}

export const getJimuFieldSchema = (field: string, dataSourceId: string, jimuName?: string): IMFieldSchema => {
  let schema = getFieldSchema(field, dataSourceId)
  if (!schema) return
  jimuName = jimuName || field
  schema = schema.set('jimuName', jimuName).set('name', jimuName)
  schema = schema.set('originFields', [field])
  return schema
}

const getSchemaForHistogram = (query: IMFeatureLayerQueryParams, dataSourceId: string) => {
  const fields = getHistogramFields(query, dataSourceId)

  const schema = {
    fields: fields.asMutable({ deep: true })
  } as unknown as DataSourceSchema

  return schema
}

export const getScatterPlotFields = (query: IMFeatureLayerQueryParams, dataSourceId: string) => {
  let fields = Immutable({}) as ImmutableObject<{ [jimuName: string]: FieldSchema }>
  const outFields = query?.outFields

  if (outFields) {
    outFields.forEach((outField) => {
      const schema = getJimuFieldSchema(outField, dataSourceId)
      if (schema) {
        fields = fields.set(outField, schema)
      }
    })
  }

  return fields
}

const getSchemaForScatterPlot = (query: IMFeatureLayerQueryParams, dataSourceId: string) => {
  const fields = getScatterPlotFields(query, dataSourceId)

  const schema = {
    fields: fields.asMutable({ deep: true })
  } as unknown as DataSourceSchema

  return schema
}

const getSchemaForGauge = (query: IMFeatureLayerQueryParams, dataSourceId: string) => {
  const fields = getGaugeFields(query, dataSourceId)

  const schema = {
    fields: fields.asMutable({ deep: true })
  } as unknown as DataSourceSchema

  return schema
}

export const getSerialSplitByFields = (query: IMFeatureLayerQueryParams, dataSourceId: string, series: ImmutableArray<WebChartSeries>, splitByValues?: Array<number | string>): ImmutableObject<{ [jimuName: string]: FieldSchema }> => {
  let fields = Immutable({}) as ImmutableObject<{ [jimuName: string]: FieldSchema }>
  const groupByFieldsForStatistics = query?.groupByFieldsForStatistics

  groupByFieldsForStatistics.forEach((field) => {
    if (field) {
      const schema = getJimuFieldSchema(field, dataSourceId)
      if (schema) {
        fields = fields.set(field, schema)
      }
    }
  })

  const outFields = query?.outFields
  const outStatistics = query?.outStatistics
  const splitByField = getSplitByField(query?.where, true)

  const seriesSplitByValues = getSplitByFieldValues(series)
  const uniqueSplitByValues = Array.from(new Set(seriesSplitByValues.concat(splitByValues ?? [])))

  let onStatisticField = ''
  let statisticType = 'no_aggregation'
  if (groupByFieldsForStatistics && outFields) { //no aggregation
    onStatisticField = outFields[0]
  } else if (groupByFieldsForStatistics && outStatistics) { //by group
    onStatisticField = outStatistics[0]?.onStatisticField
    statisticType = outStatistics[0]?.statisticType
  }
  const onStatisticFieldAlias = getFieldSchema(onStatisticField, dataSourceId)?.alias ?? onStatisticField
  uniqueSplitByValues.forEach((splitByValue) => {
    const jimuFieldName = getSplitOutStatisticName(onStatisticField, statisticType, splitByValue)
    const jimuFieldAlias = getSplitOutStatisticAlias(onStatisticFieldAlias, statisticType, splitByValue)
    const originField = onStatisticField
    if (originField) {
      let schema = getJimuFieldSchema(originField, dataSourceId, jimuFieldName)
      if (schema) {
        schema = schema.set('alias', jimuFieldAlias)
        schema = schema.set('originFields', schema.originFields.concat(splitByField))
        if (statisticType === StatisticType.Count) {
          schema = schema.set('esriType', EsriFieldType.Integer)
        }
        const format = completeStatisticsFormat(schema.format, statisticType)
        if (format) {
          schema = schema.set('format', format)
        }
      }
      fields = fields.set(jimuFieldName, schema)
    }
  })
  return fields
}

export const getSerialFields = (query: IMFeatureLayerQueryParams, dataSourceId: string) => {
  const groupByFieldsForStatistics = query?.groupByFieldsForStatistics
  const outFields = query?.outFields
  const outStatistics = query?.outStatistics

  let fields = Immutable({}) as ImmutableObject<{ [jimuName: string]: FieldSchema }>

  if (groupByFieldsForStatistics && outFields) { //no aggregation
    groupByFieldsForStatistics.concat(outFields).forEach((outField) => {
      if (outField) {
        const schema = getJimuFieldSchema(outField, dataSourceId)
        if (schema) {
          fields = fields.set(outField, schema)
        }
      }
    })
  } else if (groupByFieldsForStatistics && outStatistics) { //by group
    const categoryField = groupByFieldsForStatistics[0]
    if (categoryField) {
      const schema = getJimuFieldSchema(categoryField, dataSourceId)
      if (schema) {
        fields = fields.set(categoryField, schema)
      }
    }
    outStatistics.forEach((statistic) => {
      const originField = statistic.onStatisticField
      if (originField) {
        const statisticType = statistic.statisticType
        const jimuFieldName = statistic.outStatisticFieldName
        const fieldAlias = getFieldSchema(originField, dataSourceId)?.alias ?? originField
        const jimuFieldAlias = getOutStatisticAlias(fieldAlias, statisticType)
        let schema = getJimuFieldSchema(originField, dataSourceId, jimuFieldName)
        if (schema) {
          schema = schema.set('alias', jimuFieldAlias)
          if(statisticType === StatisticType.Count) {
            schema = schema.set('esriType', EsriFieldType.Integer)
          } else if (statisticType === StatisticType.Avg) {
            schema = schema.set('esriType', EsriFieldType.Double)
          }
          const format = completeStatisticsFormat(schema.format, statisticType)
          if (format) {
            schema = schema.set('format', format)
          }
        }
        fields = fields.set(jimuFieldName, schema)
      }
    })
  } else if (!groupByFieldsForStatistics && outStatistics) { //by field
    const originFields = outStatistics.map((outStatistic) => outStatistic.onStatisticField).asMutable({ deep: true })
    const xField = ByFieldSeriesX
    const yField = ByFieldSeriesY
    const xFieldSchema = getCleanFieldSchema(xField, JimuFieldType.String, ByFieldSeriesXAlias, originFields)
    const yFieldSchema = getCleanFieldSchema(yField, JimuFieldType.Number, ByFieldSeriesYAlias, originFields)
    fields = fields.set(xField, xFieldSchema)
    fields = fields.set(yField, yFieldSchema)
  }
  return fields
}

const getSchemaForSerial = (query: IMFeatureLayerQueryParams, dataSourceId: string): DataSourceSchema => {
  const fields = getSerialFields(query, dataSourceId)

  const schema = {
    fields: fields.asMutable({ deep: true })
  } as unknown as DataSourceSchema

  return schema
}

const getIdSchema = (dataSource: DataSource) => {
  const idField = dataSource.getIdField()
  let idFieldSchema = dataSource.getDataSourceJson().schema.fields[idField]
  if(!idFieldSchema.esriType) {
    idFieldSchema = idFieldSchema.set('esriType', EsriFieldType.OID)
  }
  return idFieldSchema?.asMutable({ deep: true })
}

export const getDataSourceSchema = (
  dataSource: DataSource,
  originalDsId: string,
  query: IMFeatureLayerQueryParams,
  seriesType: ChartTypes
): DataSourceSchema => {
  const idFieldSchema = getIdSchema(dataSource)
  let schema: DataSourceSchema = null
  if (seriesType === 'histogramSeries') {
    schema = getSchemaForHistogram(query, originalDsId)
  } else if (seriesType === 'gaugeSeries') {
    schema = getSchemaForGauge(query, originalDsId)
  } else if (isSerialSeries(seriesType) || seriesType === 'pieSeries') {
    schema = getSchemaForSerial(query, originalDsId)
  } else if (seriesType === 'scatterSeries') {
    schema = getSchemaForScatterPlot(query, originalDsId)
  }
  schema = {
    idField: idFieldSchema.jimuName,
    label: dataSource.getLabel(),
    fields: {
      [idFieldSchema.jimuName]: idFieldSchema,
      ...(schema && schema.fields)
    }
  }
  return schema
}

export const getDataSourceSchemaForSplitBy = (
  dataSource: DataSource,
  originalDsId: string,
  query: IMFeatureLayerQueryParams,
  propSeries: ImmutableArray<WebChartSeries>,
  splitByValues?: Array<number | string>
): DataSourceSchema => {
  const idFieldSchema = getIdSchema(dataSource)
  const series = propSeries.filter(
    (serie) => serie.id !== SplitByOtherSeriesValue
  )
  const fields = getSerialSplitByFields(
    query,
    originalDsId,
    series,
    splitByValues
  )
  const schema = {
    idField: idFieldSchema.jimuName,
    label: dataSource.getLabel(),
    fields: {
      [idFieldSchema.jimuName]: idFieldSchema,
      ...fields.asMutable({ deep: true })
    }
  } as unknown as DataSourceSchema

  return schema
}
