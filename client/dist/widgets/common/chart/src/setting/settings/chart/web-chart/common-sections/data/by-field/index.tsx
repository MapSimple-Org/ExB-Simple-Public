import { React, type ImmutableArray, type UseDataSource, Immutable, type ImmutableObject, hooks } from 'jimu-core'
import { defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import type { WebChartOrderOptions, ChartDataSource, WebChartSeries } from '../../../../../../../config'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { FieldSelector, SortSetting, StatisticsSelector, type OrderValue } from '../../../components'
import { ByFieldSeriesName, ByFieldSeriesX, ByFieldSeriesY } from '../../../../../../../constants'
import { createByFieldQuery, createByFieldSeries } from '../../../../../../../utils/common'
import type { SeriesRelatedProps } from '../type'
import defaultMessages from '../../../../../../translations/default'

export interface ByFieldDataProps {
  orderOptions?: ImmutableObject<WebChartOrderOptions>
  series: ImmutableArray<WebChartSeries>
  chartDataSource: ImmutableObject<ChartDataSource>
  useDataSources: ImmutableArray<UseDataSource>
  supportPercentile?: boolean
  onChange?: (series: ImmutableArray<WebChartSeries>, seriesRelatedProps: SeriesRelatedProps) => void
}

const defaultChartDataSource = Immutable({}) as ImmutableObject<ChartDataSource>

export const ByFieldData = (props: ByFieldDataProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)
  const {
    chartDataSource: propChartDataSource = defaultChartDataSource,
    orderOptions,
    useDataSources,
    series: propSeries,
    supportPercentile,
    onChange
  } = props

  const x = ByFieldSeriesX
  const y = ByFieldSeriesY

  const query = propChartDataSource.query
  const outStatistics = query?.outStatistics
  const numericFields = React.useMemo(() => {
    const nFields = outStatistics?.map((outStatistic) => outStatistic.onStatisticField).filter(field => !!field)
    return nFields || Immutable([])
  }, [outStatistics])

  const statisticType: any = outStatistics?.[0]?.statisticType ?? 'sum'

  const handleStatisticTypeChange = (statisticType): void => {
    const series = createByFieldSeries({ x, y, name: ByFieldSeriesName, propSeries })
    const query = createByFieldQuery({ statisticType, numericFields })
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(Immutable(series), { chartDataSource, query: chartDataSource.query })
  }

  const handleNumericFieldsChange = (numericFields: string[]): void => {
    const series = createByFieldSeries({ x, y, name: ByFieldSeriesName, propSeries })
    const query = createByFieldQuery({ statisticType, numericFields })
    const chartDataSource = propChartDataSource.set('query', query)
    onChange(Immutable(series), { chartDataSource, query: chartDataSource.query, colorMatch: false })
  }

  const handleOrderChanged = (value: OrderValue): void => {
    if (query) {
      onChange(propSeries, { chartDataSource: propChartDataSource, orderOptions: { data: value } })
    }
  }

  return (
    <>
      <SettingRow label={translate('statistics')} flow='wrap'>
        <StatisticsSelector
          aria-label={translate('statistics')}
          hideCount={true}
          hideNoAggregation={true}
          hidePercentileCount={!supportPercentile}
          value={statisticType}
          onChange={handleStatisticTypeChange}
          disabled={!numericFields?.length}
        />
      </SettingRow>

      <SettingRow label={translate('numberFields')} flow='wrap'>
        <FieldSelector
          aria-label={translate('numberFields')}
          className='numeric-fields-selector'
          type='numeric'
          isMultiple={true}
          hideIdField={true}
          useDataSources={useDataSources}
          defaultFields={numericFields}
          debounce={true}
          onChange={handleNumericFieldsChange}
        />
      </SettingRow>

      <SettingRow label={translate('sortBy')} flow='wrap'>
        <SortSetting
          aria-label={translate('sortBy')}
          value={orderOptions?.data as OrderValue}
          onChange={handleOrderChanged}
        />
      </SettingRow>
    </>
  )
}
