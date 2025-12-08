import { React, type ImmutableArray, type UseDataSource, type ImmutableObject, type IMFeatureLayerQueryParams, hooks } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { ChartMessages, IWebChart, WebChartSeries } from '../../../../../config'
import { defaultMessages as jimUiDefaultMessage, CollapsablePanel } from 'jimu-ui'
import { defaultMessages as jimuBuilderDefaultMessage } from 'jimu-for-builder'
import defaultMessages from '../../../../translations/default'
import { ChartSettingSection } from '../../type'
import { AppearanceSetting } from '../common-sections/appearance'
import { PieGeneralSetting } from '../common-sections/general'
import { PieSeriesSetting } from '../common-sections/series'
import { StatisticsDataSetting } from '../common-sections/data'
import type { ChartTypes } from 'jimu-ui/advanced/chart'
import type { SeriesRelatedProps } from '../common-sections/data'
import { getChartTitle } from '../../../../../utils/common'

interface PieSettingProps {
  type: ChartTypes
  widgetId?: string
  colorMatchingApplied?: boolean
  section: ChartSettingSection
  messages: ImmutableObject<ChartMessages>
  webChart: ImmutableObject<IWebChart>
  useDataSources: ImmutableArray<UseDataSource>
  onSectionChange: (section: ChartSettingSection) => void
  onMessagesChange: (messages: ImmutableObject<ChartMessages>) => void
  onWebChartChange: (webChart: ImmutableObject<IWebChart>, query?: IMFeatureLayerQueryParams) => void
}

const PieSetting = (props: PieSettingProps): React.ReactElement => {
  const {
    type,
    section,
    messages,
    useDataSources,
    colorMatchingApplied,
    webChart: propWebChart,
    onSectionChange,
    onWebChartChange,
    onMessagesChange
  } = props

  const colorMatch = propWebChart?.colorMatch ?? false
  const orderByFields = propWebChart?.orderOptions?.orderByFields
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage, jimuBuilderDefaultMessage)
  const orderOptions = propWebChart?.orderOptions
  const dataSourceId = useDataSources?.[0]?.dataSourceId

  const handleSeriesStatisticsChange = (series: ImmutableArray<WebChartSeries>, seriesRelatedProps: SeriesRelatedProps) => {
    const chartDataSource = seriesRelatedProps.chartDataSource
    const orderOptions = seriesRelatedProps.orderOptions
    const query = seriesRelatedProps.query
    let webChart = propWebChart.set('series', series).set('dataSource', chartDataSource)
    if (orderOptions) {
      webChart = webChart.set('orderOptions', orderOptions)
    }
    const title = getChartTitle(webChart, dataSourceId, translate)
    if (title) {
      webChart = webChart.setIn(['title', 'content', 'text'], title).setIn(['title', 'visible'], true)
    }
    onWebChartChange?.(webChart, query)
  }

  const handleSeiseChange = (series: ImmutableArray<WebChartSeries>, seriesRelatedProps?: { colorMatch?: boolean }) => {
    const colorMatch = seriesRelatedProps?.colorMatch
    let webChart = propWebChart.set('series', series)
    if (colorMatch != null) {
      webChart = webChart.set('colorMatch', colorMatch)
    }
    onWebChartChange?.(webChart)
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
          label={translate('slices')}
          aria-label={translate('slices')}
          isOpen={section === ChartSettingSection.Series}
          onRequestOpen={() => { onSectionChange(ChartSettingSection.Series) }}
          onRequestClose={() => { onSectionChange(ChartSettingSection.None) }}
        >
          <SettingRow flow='wrap'>
            <PieSeriesSetting
              colorMatch={colorMatch}
              orderByFields={orderByFields}
              onChange={handleSeiseChange}
              series={propWebChart?.series}
              useDataSources={useDataSources}
              chartDataSource={propWebChart.dataSource}
              colorMatchingApplied={colorMatchingApplied}
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
            <PieGeneralSetting
              value={propWebChart}
              messages={messages}
              onMessagesChange={onMessagesChange}
              onChange={onWebChartChange}
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

export default PieSetting
