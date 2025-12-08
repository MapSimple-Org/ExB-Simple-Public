import { React, type ImmutableArray, type UseDataSource, type ImmutableObject, type IMFeatureLayerQueryParams, hooks } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { IWebChart, WebChartSeries, ChartDataSource, ChartMessages } from '../../../../../config'
import { CollapsablePanel, defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import { defaultMessages as jimuBuilderDefaultMessage } from 'jimu-for-builder'
import type { WebChartAxis, WebChartLabelBehavior, WebChartScatterplotSeries } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../translations/default'
import { ChartSettingSection } from '../../type'
import { ScatterPlotData } from './data'
import { AppearanceSetting } from '../common-sections/appearance'
import { AxesSetting } from '../common-sections/axes'
import { XYGeneralSetting } from '../common-sections/general'
import { getChartTitle } from '../../../../../utils/common'

interface ScatterPlotSettingProps {
  section: ChartSettingSection
  colorMatchingApplied?: boolean
  webChart: ImmutableObject<IWebChart>
  messages: ImmutableObject<ChartMessages>
  useDataSources: ImmutableArray<UseDataSource>
  onSectionChange: (section: ChartSettingSection) => void
  onMessagesChange: (messages: ImmutableObject<ChartMessages>) => void
  onWebChartChange: (webChart: ImmutableObject<IWebChart>, query?: IMFeatureLayerQueryParams) => void
}

const ScatterPlotSetting = (props: ScatterPlotSettingProps): React.ReactElement => {
  const {
    section,
    messages,
    useDataSources,
    colorMatchingApplied,
    webChart: propWebChart,
    onSectionChange,
    onMessagesChange,
    onWebChartChange
  } = props

  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage, jimuBuilderDefaultMessage)
  const colorMatch = propWebChart?.colorMatch ?? false
  const rotated = propWebChart?.rotated ?? false
  const legendValid = (propWebChart?.series?.[0] as ImmutableObject<WebChartScatterplotSeries>)?.overlays?.trendLine.visible ?? false
  const dataSourceId = useDataSources?.[0]?.dataSourceId
  const horizontalAxisLabelsBehavior = propWebChart?.horizontalAxisLabelsBehavior
  const verticalAxisLabelsBehavior = propWebChart?.verticalAxisLabelsBehavior

  const handleSeriesChange = (series: ImmutableArray<WebChartSeries>, chartDataSource?: ImmutableObject<ChartDataSource>, trendLineVisible?: boolean) => {
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
    if (typeof trendLineVisible !== 'undefined') {
      webChart = webChart.setIn(['legend', 'visible'], trendLineVisible)
    }
    const title = getChartTitle(webChart, dataSourceId, translate)
    if (title) {
      webChart = webChart.setIn(['title', 'content', 'text'], title).setIn(['title', 'visible'], true)
    }
    onWebChartChange?.(webChart, query)
  }

  const handleAxesChange = (axes: ImmutableArray<WebChartAxis>): void => {
    onWebChartChange?.(propWebChart.set('axes', axes))
  }

  const handleColorMatchChange = (colorMatch: boolean) => {
    onWebChartChange?.(propWebChart.set('colorMatch', colorMatch))
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
          <ScatterPlotData
            colorMatch={colorMatch}
            chartDataSource={propWebChart?.dataSource}
            useDataSources={useDataSources}
            series={propWebChart?.series}
            onChange={handleSeriesChange}
            colorMatchingApplied={colorMatchingApplied}
            onColorMatchChange={handleColorMatchChange}
          />
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
              chartType='scatterSeries'
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
              rotatable={false}
              value={propWebChart}
              messages={messages}
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

export default ScatterPlotSetting
