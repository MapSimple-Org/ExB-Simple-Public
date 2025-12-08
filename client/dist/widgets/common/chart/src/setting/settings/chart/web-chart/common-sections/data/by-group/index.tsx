import { React, type ImmutableArray, type UseDataSource, Immutable, type ImmutableObject, hooks, JimuFieldType } from 'jimu-core'
import { CollapsableToggle, defaultMessages as jimUiDefaultMessage, LoadingType, Select } from 'jimu-ui'
import type { ChartStatisticType, ChartDataSource, WebChartSeries, WebChartOrderOptions } from '../../../../../../../config'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { FieldSelector, Loading, type OrderValue, SortSetting, StatisticsSelector } from '../../../components'
import defaultMessages from '../../../../../../translations/default'
import { fetchFieldRange, getAppropriateTimeUnit, getDefaultOrderOptions, isSupportSplitBy } from './utils'
import { getSeriesType, type WebChartNullPolicyTypes, type ChartTypes, type WebChartLineChartSeries, type WebChartTemporalBinningUnits, type WebChartTimeAggregationTypes, getSplitByField, type WebChartBarChartSeries, type CategoryFormatOptions, type NumberFormatOptions, type DateTimeFormatOptions, type WebChartTemporalBinning } from 'jimu-ui/advanced/chart'
import { isSerialSeries } from '../../../../../../../utils/default'
import { createByGroupQuery, createByGroupSeries, getDefaultValueFormat, getSplitByFieldValues, getStatisticsType, getFieldType, getObjectIdField, DefaultTemporalBinning } from '../../../../../../../utils/common'
import { TimeBinning } from './time-binning'
import type { SeriesRelatedProps } from '../type'
import { SplitByField } from './split-by-field'

export interface ByGroupDataProps {
  type: ChartTypes
  orderOptions?: ImmutableObject<WebChartOrderOptions>
  series: ImmutableArray<WebChartSeries>
  chartDataSource: ImmutableObject<ChartDataSource>
  useDataSources: ImmutableArray<UseDataSource>
  supportPercentile?: boolean
  valueFormat?: CategoryFormatOptions | NumberFormatOptions | DateTimeFormatOptions
  onChange?: (series: ImmutableArray<WebChartSeries>, seriesRelatedProps: SeriesRelatedProps) => void
}

const defaultChartDataSource = Immutable({}) as ImmutableObject<ChartDataSource>

export const ByGroupData = (props: ByGroupDataProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)
  const {
    chartDataSource: propChartDataSource = defaultChartDataSource,
    type = 'barSeries',
    orderOptions,
    useDataSources,
    series: propSeries,
    supportPercentile,
    valueFormat,
    onChange
  } = props

  const [loadingDate, setLoadingDate] = React.useState(false)
  const dataSourceId = useDataSources?.[0]?.dataSourceId
  const objectidField = React.useMemo(() => getObjectIdField(dataSourceId), [dataSourceId])
  const seriesType = getSeriesType(propSeries as any)
  const propQuery = propChartDataSource.query
  const categoryField = propQuery?.groupByFieldsForStatistics?.[0] ?? ''
  const categoryFieldType: JimuFieldType = getFieldType(categoryField, dataSourceId)
  const continuous = valueFormat?.type === 'number'
  const statisticType = getStatisticsType(propQuery) ?? 'count'
  const outStatistics = propQuery?.outStatistics
  const outFields = propQuery?.outFields
  const where = propQuery?.where
  const splitByField = getSplitByField(where)
  const splitByFieldType = React.useMemo(() => getFieldType(splitByField, dataSourceId), [dataSourceId, splitByField])
  const splitByFieldValues = React.useMemo(() => splitByField ? getSplitByFieldValues(propSeries) : [], [propSeries, splitByField])

  const supportTemporalData = categoryFieldType === JimuFieldType.Date && (seriesType === 'barSeries' || seriesType === 'lineSeries') && statisticType !== 'no_aggregation'
  const supportContinuousNumericAxis = categoryFieldType === JimuFieldType.Number && seriesType === 'lineSeries'
  const temporalBinning = (propSeries?.[0] as unknown as WebChartLineChartSeries)?.temporalBinning
  const temporalBinningSize = temporalBinning?.size
  const temporalBinningUnit = temporalBinning?.unit
  const timeAggregationType = temporalBinning?.timeAggregationType
  const nullPolicy = temporalBinning?.nullPolicy
  const trimIncompleteTimeInterval = temporalBinning?.trimIncompleteTimeInterval
  const propTemporalBinning = temporalBinningSize ? temporalBinning : null
  const propsBinTemporalData = (propSeries?.[0] as unknown as WebChartLineChartSeries)?.binTemporalData ?? !!propTemporalBinning

  const categoryFields = React.useMemo(() => {
    return categoryField ? Immutable([categoryField]) : Immutable([])
  }, [categoryField])

  const numericFields = React.useMemo(() => {
    const oFields = outFields || outStatistics?.map((outStatistic) => outStatistic.onStatisticField)?.filter(field => !!field)
    let fields = oFields?.asMutable({ deep: true })
    if (!fields?.length && !categoryField) {
      fields = [objectidField]
    }
    return fields || []
  }, [categoryField, objectidField, outFields, outStatistics])

  const yOrderByField = React.useMemo(() => outFields?.[0] ?? outStatistics?.[0]?.outStatisticFieldName, [outFields, outStatistics])

  const defaultNumericFields = React.useMemo(() => Immutable(numericFields), [numericFields])

  const pageSize = !propsBinTemporalData ? propQuery?.pageSize : undefined

  const hideNumericFields = numericFields?.length === 1 && statisticType === 'count'
  const isNumericFieldsMultiple = isSerialSeries(type)

  const supportSplitBy = React.useMemo(() => isSupportSplitBy(dataSourceId, propSeries), [dataSourceId, propSeries])

  const handleCategoryFieldChange = (fields: string[]) => {
    const categoryField = fields?.[0]
    const categoryFieldType: JimuFieldType = getFieldType(categoryField, dataSourceId)
    const binTemporalData = false
    const orderOptions = getDefaultOrderOptions(categoryField, !!splitByField)
    const series = createByGroupSeries({ categoryField, statisticType, numericFields, propSeries: propSeries.asMutable({ deep: true }), binTemporalData }, dataSourceId)
    const query = createByGroupQuery({ categoryField, statisticType, numericFields }, pageSize)
    const valueFormat = getDefaultValueFormat(categoryFieldType, true)
    const chartDataSource = propChartDataSource.set('query', query)
    const colorMatch = series.length === 1 || !!splitByField
    onChange(Immutable(series), { chartDataSource, orderOptions, query: chartDataSource.query, valueFormat, colorMatch })
  }

  const handleBinTemporalDataChange = async (binTemporalData: boolean): Promise<void> => {
    if (binTemporalData) {
      try {
        setLoadingDate(true)
        const [startTime, endTime] = await fetchFieldRange(categoryField, dataSourceId)
        setLoadingDate(false)
        const unit = getAppropriateTimeUnit(startTime, endTime)
        const nullPolicy = seriesType === 'barSeries' ? 'null' : 'interpolate'
        const temporalBinning: WebChartTemporalBinning = { ...DefaultTemporalBinning, unit, nullPolicy }
        const series = createByGroupSeries({ splitByField, splitByFieldType, splitByFieldValues, categoryField, statisticType, numericFields, propSeries: propSeries.asMutable({ deep: true }), binTemporalData, temporalBinning }, dataSourceId)
        onChange(Immutable(series), { chartDataSource: propChartDataSource })
      } catch (error) {
        setLoadingDate(false)
        console.error(error)
      }
    } else {
      const series = propSeries.map((serie) =>
        (serie as ImmutableObject<WebChartBarChartSeries>).set('binTemporalData', binTemporalData).without('temporalBinning')
      ) as unknown as ImmutableArray<WebChartSeries>
      onChange(series, { chartDataSource: propChartDataSource })
    }
  }

  const handleParseNumericCategoryChange = (evt: React.MouseEvent<HTMLSelectElement>) => {
    const continuous = evt.currentTarget.value === 'continuous'
    const valueFormat = getDefaultValueFormat(continuous ? JimuFieldType.Number : JimuFieldType.String)
    onChange(propSeries, { chartDataSource: propChartDataSource, valueFormat })
  }

  const handleStatisticTypeChange = (statisticType: ChartStatisticType) => {
    let _numericFields = numericFields
    if (statisticType === 'count') {
      _numericFields = [objectidField]
    } else {
      if (numericFields?.[0] === objectidField) {
        _numericFields = []
      }
    }
    const orderOptions = getDefaultOrderOptions(categoryField, !!splitByField)
    const binTemporalData = statisticType === 'no_aggregation' ? false : propsBinTemporalData
    const temporalBinning = binTemporalData ? propTemporalBinning : null
    const series = createByGroupSeries({ splitByField, splitByFieldType, splitByFieldValues, categoryField, statisticType, numericFields: _numericFields, propSeries: propSeries.asMutable({ deep: true }), binTemporalData, temporalBinning }, dataSourceId)
    const query = createByGroupQuery({ categoryField, splitByField, statisticType, numericFields: _numericFields }, pageSize)
    if (!series?.length) return
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(Immutable(series), { chartDataSource, orderOptions, query: chartDataSource.query })
  }

  const handleNumericFieldsChange = (fields: string[]) => {
    const numericFields = fields.filter((field) => field !== objectidField)
    const _splitByField = numericFields?.length !== 1 ? '' : splitByField
    const orderOptions = getDefaultOrderOptions(categoryField, !!_splitByField)
    const series = createByGroupSeries({ splitByField: _splitByField, splitByFieldType, splitByFieldValues, categoryField, statisticType, numericFields, propSeries: propSeries.asMutable({ deep: true }), binTemporalData: propsBinTemporalData, temporalBinning: propTemporalBinning }, dataSourceId)
    const query = createByGroupQuery({ categoryField, splitByField: _splitByField, statisticType, numericFields }, pageSize)
    if (!series?.length) return
    const chartDataSource = propChartDataSource.set('query', query)
    const colorMatch = series.length === 1 || !!splitByField
    onChange(Immutable(series), { chartDataSource, orderOptions, query: chartDataSource.query, colorMatch })
  }

  const handleSplitByFieldChange = (splitByField: string, values: Array<number | string>, splitByFieldType: JimuFieldType) => {
    const orderOptions = getDefaultOrderOptions(categoryField, !!splitByField)
    const series = createByGroupSeries({ splitByField, splitByFieldType, splitByFieldValues: values, categoryField, statisticType, numericFields, propSeries: propSeries.asMutable({ deep: true }), binTemporalData: propsBinTemporalData, temporalBinning: propTemporalBinning }, dataSourceId)
    const query = createByGroupQuery({ categoryField, splitByField, statisticType, numericFields }, pageSize)
    if (!series?.length) return
    const chartDataSource = propChartDataSource.set('query', query)
    const colorMatch = series.length === 1 || !!splitByField
    onChange(Immutable(series), { chartDataSource, orderOptions, query: chartDataSource.query, colorMatch })
  }

  const handleTimeIntervalChange = (size: number, unit: WebChartTemporalBinningUnits) => {
    const series = propSeries.map((serie) => {
      return serie.setIn(['temporalBinning', 'size'], size).setIn(['temporalBinning', 'unit'], unit)
    }) as unknown as ImmutableArray<WebChartSeries>
    onChange(series, { chartDataSource: propChartDataSource })
  }

  const handleTimeAggregationTypeChange = (value: WebChartTimeAggregationTypes) => {
    const series = propSeries.map((serie) => {
      return serie.setIn(['temporalBinning', 'timeAggregationType'], value)
    }) as unknown as ImmutableArray<WebChartSeries>
    onChange(series, { chartDataSource: propChartDataSource })
  }

  const handleNullPolicyChange = (value: WebChartNullPolicyTypes) => {
    const series = propSeries.map((serie) => {
      return serie.setIn(['temporalBinning', 'nullPolicy'], value)
    }) as unknown as ImmutableArray<WebChartSeries>
    onChange(series, { chartDataSource: propChartDataSource })
  }

  const handleTrimIncompleteTimeIntervalChange = (value: boolean) => {
    const series = propSeries.map((serie) => {
      return serie.setIn(['temporalBinning', 'trimIncompleteTimeInterval'], value)
    }) as unknown as ImmutableArray<WebChartSeries>
    onChange(series, { chartDataSource: propChartDataSource })
  }

  const handleOrderChanged = (value: OrderValue): void => {
    if (propQuery && yOrderByField) {
      let orderOptions: WebChartOrderOptions = { data: value }
      if (!splitByField) {
        const orderByField = value.orderType === 'arcgis-charts-y-value' ? yOrderByField : categoryField
        const orderBy = value.orderBy
        const orderByFields = [`${orderByField} ${orderBy}`]
        orderOptions = { orderByFields, ...orderOptions }
      }
      onChange(propSeries, { chartDataSource: propChartDataSource, orderOptions })
    }
  }

  return (
    <>
      <SettingRow level={2} label={translate('categoryField')} flow='wrap'>
        <FieldSelector
          className='category-field-selector'
          type='category'
          hideDateField={seriesType === 'pieSeries'}
          aria-label={translate('categoryField')}
          useDataSources={useDataSources}
          isMultiple={false}
          fields={categoryFields}
          onChange={handleCategoryFieldChange}
        />
      </SettingRow>
      {supportContinuousNumericAxis && <SettingRow level={2} label={translate('parseNumericCategory')} flow='wrap'>
        <Select
          size='sm'
          value={continuous ? 'continuous' : 'discrete'}
          aria-label={translate('parseNumericCategory')}
          onChange={handleParseNumericCategoryChange}
        >
          <option value='discrete'>
            {translate('discrete')}
          </option>
          <option value='continuous'>
            {translate('continuous')}
          </option>
        </Select>
      </SettingRow>}
      {
        supportTemporalData && (
          <CollapsableToggle
            role='group'
            level={2}
            className='mt-4 position-relative'
            disabled={!supportTemporalData}
            isOpen={propsBinTemporalData}
            label={translate('parseTimeCategory')}
            aria-label={translate('parseTimeCategory')}
            onRequestOpen={() => { handleBinTemporalDataChange(true) }}
            onRequestClose={() => { handleBinTemporalDataChange(false) }}>
            <TimeBinning
              className='mt-2'
              seriesType={seriesType}
              size={temporalBinningSize}
              unit={temporalBinningUnit}
              timeAggregationType={timeAggregationType}
              nullPolicy={nullPolicy}
              trimIncompleteTimeInterval={trimIncompleteTimeInterval}
              onTimeIntervalChange={handleTimeIntervalChange}
              onTimeAggregationTypeChange={handleTimeAggregationTypeChange}
              onNullPolicyChange={handleNullPolicyChange}
              onTrimIncompleteTimeIntervalChange={handleTrimIncompleteTimeIntervalChange}
            />
            {loadingDate && <Loading type={LoadingType.Donut} />}
          </CollapsableToggle>
        )
      }
      <SettingRow level={2} label={translate('statistics')} flow='wrap' className='mt-4'>
        <StatisticsSelector
          hideCount={false}
          disabled={!categoryField}
          hideNoAggregation={seriesType === 'pieSeries'}
          hidePercentileCount={!supportPercentile}
          value={statisticType}
          aria-label={translate('statistics')}
          onChange={handleStatisticTypeChange}
        />
      </SettingRow>
      {!hideNumericFields &&
        <>
          <SettingRow level={2} label={translate('numberFields')} flow='no-wrap'></SettingRow>
          <FieldSelector
            hideIdField={true}
            disabled={!categoryField}
            className='numeric-fields-selector mt-2 mb-4'
            type='numeric'
            aria-label={translate('numberFields')}
            isMultiple={isNumericFieldsMultiple}
            useDataSources={useDataSources}
            defaultFields={defaultNumericFields}
            debounce={true}
            onChange={handleNumericFieldsChange}
          />
        </>}
      {
        supportSplitBy && <>
          <SettingRow level={2} label={translate('splitByField')} flow='wrap'>
            <SplitByField
              disabled={numericFields?.length !== 1}
              aria-label={translate('splitByField')}
              useDataSources={useDataSources}
              splitByField={splitByField}
              onChange={handleSplitByFieldChange}
            />
          </SettingRow>
        </>
      }
      {!propsBinTemporalData && <SettingRow className='mt-4' level={2} label={translate('sortBy')} flow='wrap'>
        <SortSetting
          aria-label={translate('sortBy')}
          value={orderOptions?.data as OrderValue}
          disabled={!categoryField}
          onChange={handleOrderChanged}
        />
      </SettingRow>}
    </>
  )
}
