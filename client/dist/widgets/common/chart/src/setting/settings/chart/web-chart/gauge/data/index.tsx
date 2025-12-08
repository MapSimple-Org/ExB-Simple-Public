import type { ChartDataSource, WebChartSeries } from '../../../../../../config'
import { React, Immutable, type ImmutableArray, type ImmutableObject, type UseDataSource, hooks, type StatisticDefinition } from 'jimu-core'
import { defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import defaultMessages from '../../../../../translations/default'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { createGaugeQuery, createGaugeSeries } from '../../../../../../utils/common'
import { StatisticDefinitionSetting } from './statistic'
import { RangeSetting } from './range-setting'
import type { WebChartGaugeAxis } from 'jimu-ui/advanced/chart'

export interface GaugeDataProps {
  axes: ImmutableArray<WebChartGaugeAxis>
  series: ImmutableArray<WebChartSeries>
  chartDataSource: ImmutableObject<ChartDataSource>
  useDataSources: ImmutableArray<UseDataSource>
  onAxesChange?: (axes: ImmutableArray<WebChartGaugeAxis>) => void
  onSeriesChange?: (series: ImmutableArray<WebChartSeries>, chartDataSource: ImmutableObject<ChartDataSource>) => void
}

const defaultChartDataSource = Immutable({}) as ImmutableObject<ChartDataSource>

export const GaugeData = (props: GaugeDataProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)
  const {
    chartDataSource: propChartDataSource = defaultChartDataSource,
    useDataSources,
    series: propSeries,
    axes: propAxes,
    onAxesChange,
    onSeriesChange
  } = props

  const dataSourceId = useDataSources?.[0]?.dataSourceId
  const query = propChartDataSource.query
  const valueStatistic = query?.outStatistics?.[0]
  const minimumStatistic = query?.outStatistics?.[1]
  const maximumStatistic = query?.outStatistics?.[2]

  const minimum = propAxes?.[0]?.minimum
  const maximum = propAxes?.[0]?.maximum

  const handleValueStatisticChange = (value: StatisticDefinition) => {
    const numericField = value.onStatisticField
    const series = createGaugeSeries({ numericField, propSeries }, dataSourceId)
    const query = createGaugeQuery(value, minimumStatistic, maximumStatistic)
    const chartDataSource = propChartDataSource.set('query', query)
    onSeriesChange(Immutable(series), chartDataSource)
  }

  const handleAxesRangeChange = (property: string, value: number) => {
    const axes = Immutable.setIn(propAxes, ['0', property], value)
    onAxesChange(axes)
  }

  const handleMinimumStatisticChange = (value: StatisticDefinition) => {
    const query = createGaugeQuery(valueStatistic, value, maximumStatistic)
    const chartDataSource = propChartDataSource.set('query', query)
    onSeriesChange(propSeries, chartDataSource)
  }

  const handleMaximumStatisticChange = (value: StatisticDefinition) => {
    const query = createGaugeQuery(valueStatistic, minimumStatistic, value)
    const chartDataSource = propChartDataSource.set('query', query)
    onSeriesChange(propSeries, chartDataSource)
  }

  return (<>
  <SettingRow className='mt-2' label={translate('displayValue')} level={2} flow='no-wrap'></SettingRow>
   <StatisticDefinitionSetting useDataSources={useDataSources} value={valueStatistic} onChange={handleValueStatisticChange} />
    <SettingRow level={2} label={translate('minimumValue')} flow='wrap'>
      <RangeSetting
        useDataSources={useDataSources}
        aria-label={translate('minimumValue')}
        numberValue={minimum}
        statisticValue={minimumStatistic}
        onStatisticChange={handleMinimumStatisticChange}
        onNumberChange={(value) => { handleAxesRangeChange('minimum', value) }}
       />
    </SettingRow>
    <SettingRow level={2} label={translate('maximumValue')} flow='wrap'>
      <RangeSetting
        useDataSources={useDataSources}
        aria-label={translate('maximumValue')}
        numberValue={maximum}
        statisticValue={maximumStatistic}
        onStatisticChange={handleMaximumStatisticChange}
        onNumberChange={(value) => { handleAxesRangeChange('maximum', value) }}
       />
    </SettingRow>
  </>)
}
