import { React, type ImmutableArray, type UseDataSource, type ImmutableObject, type IMFeatureLayerQueryParams, hooks, Immutable } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { IWebChart, WebChartSeries, ChartDataSource, ChartMessages } from '../../../../../config'
import { CollapsablePanel, defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import { defaultMessages as jimuBuilderDefaultMessage } from 'jimu-for-builder'
import type { WebChartAxis } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../translations/default'
import { ChartSettingSection } from '../../type'
import { GaugeData } from './data'
import { XYGeneralSetting } from '../common-sections/general'
import { GaugeFormatSetting } from './gauge'
import { AppearanceSetting } from '../common-sections/appearance'

const ShowGeneralSetting = false

interface GaugeSettingProps {
  section: ChartSettingSection
  webChart: ImmutableObject<IWebChart>
  messages: ImmutableObject<ChartMessages>
  useDataSources: ImmutableArray<UseDataSource>
  onSectionChange: (section: ChartSettingSection) => void
  onMessagesChange: (messages: ImmutableObject<ChartMessages>) => void
  onWebChartChange: (webChart: ImmutableObject<IWebChart>, query?: IMFeatureLayerQueryParams) => void
}

const GaugeSetting = (props: GaugeSettingProps): React.ReactElement => {
  const {
    section,
    messages,
    useDataSources,
    webChart: propWebChart,
    onSectionChange,
    onMessagesChange,
    onWebChartChange
  } = props

  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage, jimuBuilderDefaultMessage)

  const startAngle = propWebChart?.startAngle ?? -200
  const endAngle = propWebChart?.endAngle ?? 20
  const innerRadius = propWebChart?.innerRadius ?? 70

  const handleSeriesChange = (series: ImmutableArray<WebChartSeries>, chartDataSource?: ImmutableObject<ChartDataSource>) => {
    let webChart
    let query
    if (chartDataSource) {
      webChart = propWebChart.set('dataSource', chartDataSource).set('series', series)
      if (chartDataSource.query !== propWebChart?.dataSource?.query) {
        query = chartDataSource?.query
      }
    } else {
      webChart = propWebChart.set('series', series)
    }
    onWebChartChange?.(webChart, query)
  }

  const handleAxesChange = (axes: ImmutableArray<WebChartAxis>): void => {
    onWebChartChange?.(propWebChart.set('axes', axes))
  }

  const handleShapeChange = (shapeValue) => {
    const { startAngle, endAngle, yoffset } = shapeValue
    let webChart = propWebChart.set('startAngle', startAngle).set('endAngle', endAngle)
    const axes = Immutable.setIn(webChart.axes, ['0', 'innerLabel', 'content', 'yoffset'], yoffset)
    webChart = webChart.set('axes', axes)
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
          <GaugeData
            chartDataSource={propWebChart?.dataSource}
            useDataSources={useDataSources}
            axes={propWebChart?.axes}
            series={propWebChart?.series}
            onAxesChange={handleAxesChange}
            onSeriesChange={handleSeriesChange}
          />
        </CollapsablePanel>
      </SettingSection>
      <SettingSection>
        <CollapsablePanel
          label={translate('gauge')}
          aria-label={translate('gauge')}
          isOpen={section === ChartSettingSection.Series}
          onRequestOpen={() => { onSectionChange(ChartSettingSection.Series) }}
          onRequestClose={() => { onSectionChange(ChartSettingSection.None) }}
        >
          <GaugeFormatSetting
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            axes={propWebChart?.axes}
            onAxesChange={handleAxesChange}
            onShapeChange={handleShapeChange}
          />
        </CollapsablePanel>
      </SettingSection>
      {ShowGeneralSetting && <SettingSection>
        <CollapsablePanel
          label={translate('general')}
          aria-label={translate('general')}
          isOpen={section === ChartSettingSection.General}
          onRequestOpen={() => { onSectionChange(ChartSettingSection.General) }}
          onRequestClose={() => { onSectionChange(ChartSettingSection.None) }}
        >
          <SettingRow flow='wrap'>
            <XYGeneralSetting
              rotatable={false}
              messages={messages}
              value={propWebChart}
              legendVisibility={false}
              onMessagesChange={onMessagesChange}
              onChange={onWebChartChange}
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>}
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
              isGauge={true}
              webChart={propWebChart}
              onChange={onWebChartChange}
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
    </>
  )
}

export default GaugeSetting
