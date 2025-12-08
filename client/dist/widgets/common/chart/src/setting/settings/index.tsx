import { DataSourceStatus, type ImmutableObject, type IMState, React, hooks, ReactRedux } from 'jimu-core'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import type { IWebChart } from '../../config'
import ChartSetting, { type ChartSettingProps } from './chart'
import defaultMessages from '../translations/default'
import ChartTypeSelector from './chart-type-selector'
import { Placeholder } from './components'

interface ChartSettingsProps extends ChartSettingProps {
  template: string
  onTemplateChange: (templateId: string, webChart: ImmutableObject<IWebChart>) => void
}

export const ChartSettings = (props: ChartSettingsProps) => {
  const {
    type,
    widgetId,
    template,
    tools,
    webChart,
    options,
    messages,
    useDataSources,
    onTemplateChange,
    onToolsChange,
    onMessagesChange,
    onWebChartChange,
    onOptionsChange
  } = props

  const translate = hooks.useTranslation(defaultMessages)
  const sourceStatus = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder?.dataSourcesInfo?.[useDataSources?.[0]?.dataSourceId]?.instanceStatus)
  const hasDataSource = !!useDataSources?.[0]?.dataSourceId

  return (
    <>
      {sourceStatus === DataSourceStatus.Created && <>
        <SettingSection>
          <SettingRow label={translate('chartType')} flow='wrap' level={1}>
            <ChartTypeSelector
              templateId={template}
              useDataSources={useDataSources}
              webChart={webChart}
              onChange={onTemplateChange}
            />
          </SettingRow>
        </SettingSection>
        {webChart && (
          <ChartSetting
            type={type}
            tools={tools}
            messages={messages}
            webChart={webChart}
            options={options}
            widgetId={widgetId}
            useDataSources={useDataSources}
            onToolsChange={onToolsChange}
            onMessagesChange={onMessagesChange}
            onWebChartChange={onWebChartChange}
            onOptionsChange={onOptionsChange}
          />
        )}
      </>}
      {!hasDataSource && <Placeholder messageId='chart-blank-msg' placeholder={translate('selectDataPlaceholder')} />}
    </>
  )
}
