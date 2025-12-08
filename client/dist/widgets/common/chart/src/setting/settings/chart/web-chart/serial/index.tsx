import { React, type ImmutableArray, type UseDataSource, type ImmutableObject, type IMFeatureLayerQueryParams, hooks } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { ChartComponentOptions, ChartMessages, IWebChart, WebChartSeries } from '../../../../../config'
import { StatisticsDataSetting } from '../common-sections/data'
import { defaultMessages as jimUiDefaultMessage, CollapsablePanel } from 'jimu-ui'
import { defaultMessages as jimuBuilderDefaultMessage } from 'jimu-for-builder'
import type { WebChartLabelBehavior, WebChartStackedKinds, ChartTypes, WebChartAxis } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../translations/default'
import { ChartSettingSection } from '../../type'
import { AppearanceSetting } from '../common-sections/appearance'
import { AxesSetting } from '../common-sections/axes'
import { XYGeneralSetting } from '../common-sections/general'
import { SerialSeriesSetting } from '../common-sections/series'
import type { SeriesRelatedProps } from '../common-sections/data'
import { getChartTitle } from '../../../../../utils/common'

export interface SerialSettingProps {
  type: ChartTypes
  colorMatchingApplied?: boolean
  section: ChartSettingSection
  webChart: ImmutableObject<IWebChart>
  messages: ImmutableObject<ChartMessages>
  options: ImmutableObject<ChartComponentOptions>
  useDataSources: ImmutableArray<UseDataSource>
  onOptionsChange: (options: ImmutableObject<ChartComponentOptions>) => void
  onSectionChange: (section: ChartSettingSection) => void
  onMessagesChange: (messages: ImmutableObject<ChartMessages>) => void
  onWebChartChange: (webChart: ImmutableObject<IWebChart>, query?: IMFeatureLayerQueryParams) => void
}

const SerialSetting = (props: SerialSettingProps): React.ReactElement => {
  const {
    type,
    section,
    options,
    messages,
    useDataSources,
    colorMatchingApplied,
    webChart: propWebChart,
    onSectionChange,
    onWebChartChange,
    onMessagesChange,
    onOptionsChange
  } = props

  const colorMatch = propWebChart?.colorMatch ?? false
  const rotated = propWebChart?.rotated ?? false
  const stackedType = propWebChart?.stackedType ?? 'sideBySide'
  const orderOptions = propWebChart?.orderOptions
  const legendValid = propWebChart?.series != null && propWebChart?.series?.length > 1
  const valueFormat = propWebChart?.axes?.[0]?.valueFormat
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage, jimuBuilderDefaultMessage)
  const dataSourceId = useDataSources?.[0]?.dataSourceId
  const horizontalAxisLabelsBehavior = propWebChart?.horizontalAxisLabelsBehavior
  const verticalAxisLabelsBehavior = propWebChart?.verticalAxisLabelsBehavior

  const handleSeriesStatisticsChange = (series: ImmutableArray<WebChartSeries>, seriesRelatedProps: SeriesRelatedProps) => {
    const chartDataSource = seriesRelatedProps.chartDataSource
    const orderOptions = seriesRelatedProps.orderOptions
    const query = seriesRelatedProps.query
    const valueFormat = seriesRelatedProps.valueFormat
    const colorMatch = seriesRelatedProps?.colorMatch
    let webChart = propWebChart.set('series', series).set('dataSource', chartDataSource)
    if (valueFormat) {
      webChart = webChart.setIn(['axes', '0', 'valueFormat'], valueFormat)
    }
    if (orderOptions) {
      webChart = webChart.set('orderOptions', orderOptions)
    }
    if (colorMatch != null) {
      webChart = webChart.set('colorMatch', colorMatch)
    }
    const title = getChartTitle(webChart, dataSourceId, translate)
    if (title) {
      webChart = webChart.setIn(['title', 'content', 'text'], title).setIn(['title', 'visible'], true)
    }
    onWebChartChange?.(webChart, query)
  }

  const handleSeriesChange = (series: ImmutableArray<WebChartSeries>, seriesRelatedProps?: { valueFormat?: any, colorMatch?: boolean }) => {
    const valueFormat = seriesRelatedProps?.valueFormat
    const colorMatch = seriesRelatedProps?.colorMatch
    let webChart = propWebChart.set('series', series)
    if (valueFormat) {
      webChart = webChart.setIn(['axes', '0', 'valueFormat'], valueFormat)
    }
    if (colorMatch != null) {
      webChart = webChart.set('colorMatch', colorMatch)
    }
    onWebChartChange?.(webChart)
  }

  const handleStackedTypeChange = (stackedType: WebChartStackedKinds) => {
    onWebChartChange?.(propWebChart.set('stackedType', stackedType))
  }

  const handleAxesChange = (axes: ImmutableArray<WebChartAxis>): void => {
    onWebChartChange?.(propWebChart.set('axes', axes))
  }

  const handleHorizontalAxisLabelsBehaviorChange = (value: WebChartLabelBehavior): void => {
    onWebChartChange?.(propWebChart.set('horizontalAxisLabelsBehavior', value))
  }

  const handleVerticalAxisLabelsBehaviorChange = (value: WebChartLabelBehavior): void => {
    onWebChartChange?.(propWebChart.set('verticalAxisLabelsBehavior', value))
  }

  return (
    <>
      <SettingSection>
        <CollapsablePanel
          label={translate('data')}
          aria-label={translate('data')}
          isOpen={section === ChartSettingSection.Data}
          onRequestOpen={() => { onSectionChange(ChartSettingSection.Data) }}
          onRequestClose={() => { onSectionChange(ChartSettingSection.None) }}
        >
          <SettingRow flow='wrap' aria-label={translate('data')} role='group'>
            <StatisticsDataSetting
              type={type}
              valueFormat={valueFormat}
              orderOptions={orderOptions}
              chartDataSource={propWebChart?.dataSource}
              useDataSources={useDataSources}
              series={propWebChart?.series}
              onChange={handleSeriesStatisticsChange}
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
      <SettingSection>
        <CollapsablePanel
          aria-label={translate('series')}
          label={translate('series')}
          isOpen={section === ChartSettingSection.Series}
          onRequestOpen={() => { onSectionChange(ChartSettingSection.Series) }}
          onRequestClose={() => { onSectionChange(ChartSettingSection.None) }}
        >
          <SettingRow flow='wrap'>
            <SerialSeriesSetting
              rotated={rotated}
              stackedType={stackedType}
              colorMatch={colorMatch}
              colorMatchingApplied={colorMatchingApplied}
              series={propWebChart?.series}
              useDataSources={useDataSources}
              options={options}
              query={propWebChart?.dataSource?.query}
              onChange={handleSeriesChange}
              onOptionsChange={onOptionsChange}
              onStackedTypeChange={handleStackedTypeChange}
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
      <SettingSection>
        <CollapsablePanel
          label={translate('axes')}
          aria-label={translate('axes')}
          isOpen={section === ChartSettingSection.Axes}
          onRequestOpen={() => { onSectionChange(ChartSettingSection.Axes) }}
          onRequestClose={() => { onSectionChange(ChartSettingSection.None) }}
        >
          <SettingRow flow='wrap'>
            <AxesSetting
              chartType={type}
              rotated={rotated}
              axes={propWebChart?.axes}
              onChange={handleAxesChange}
              verticalAxisLabelsBehavior={verticalAxisLabelsBehavior}
              horizontalAxisLabelsBehavior={horizontalAxisLabelsBehavior}
              onVerticalAxisLabelsBehaviorChange={handleVerticalAxisLabelsBehaviorChange}
              onHorizontalAxisLabelsBehaviorChange={handleHorizontalAxisLabelsBehaviorChange}
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
      <SettingSection>
        <CollapsablePanel
          label={translate('general')}
          aria-label={translate('general')}
          isOpen={section === ChartSettingSection.General}
          onRequestOpen={() => { onSectionChange(ChartSettingSection.General) }}
          onRequestClose={() => { onSectionChange(ChartSettingSection.None) }}
        >
          <SettingRow flow='wrap'>
            <XYGeneralSetting
              rotatable={true}
              messages={messages}
              value={propWebChart}
              legendValid={legendValid}
              onChange={onWebChartChange}
              onMessagesChange={onMessagesChange}
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
      <SettingSection>
        <CollapsablePanel
          label={translate('appearance')}
          aria-label={translate('appearance')}
          isOpen={section === ChartSettingSection.Appearance}
          onRequestOpen={() => { onSectionChange(ChartSettingSection.Appearance) }}
          onRequestClose={() => { onSectionChange(ChartSettingSection.None) }}
        >
          <SettingRow flow='wrap'>
            <AppearanceSetting
              webChart={propWebChart}
              onChange={onWebChartChange}
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
    </>
  )
}

export default SerialSetting
