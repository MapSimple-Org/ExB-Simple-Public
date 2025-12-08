import { type IMFeatureLayerQueryParams, type ImmutableArray, type ImmutableObject, React, type UseDataSource, hooks } from 'jimu-core'
import { SettingSection } from 'jimu-ui/advanced/setting-components'
import type { ChartComponentOptions, ChartMessages, ChartTools, IWebChart } from '../../../config'
import { CollapsablePanel, defaultMessages } from 'jimu-ui'
import { Tools } from './universal'
import WebChartSetting from './web-chart'
import { ChartSettingSection } from './type'
import type { ChartTypes } from 'jimu-ui/advanced/chart'

export interface ChartSettingProps {
  type: ChartTypes
  widgetId?: string
  tools: ImmutableObject<ChartTools>
  messages: ImmutableObject<ChartMessages>
  webChart: ImmutableObject<IWebChart>
  options: ImmutableObject<ChartComponentOptions>
  useDataSources: ImmutableArray<UseDataSource>
  onOptionsChange: (options: ImmutableObject<ChartComponentOptions>) => void
  onToolsChange: (tools: ImmutableObject<ChartTools>) => void
  onMessagesChange: (messages: ImmutableObject<ChartMessages>) => void
  onWebChartChange: (webChart: ImmutableObject<IWebChart>, query?: IMFeatureLayerQueryParams) => void
}

const ChartSetting = (props: ChartSettingProps) => {
  const {
    type,
    tools,
    options,
    webChart,
    widgetId,
    messages,
    useDataSources,
    onToolsChange,
    onWebChartChange,
    onOptionsChange,
    onMessagesChange
  } = props
  const translate = hooks.useTranslation(defaultMessages)
  const [section, setSection] = React.useState(ChartSettingSection.Data)

  return (
    <>
      <WebChartSetting
        type={type}
        section={section}
        options={options}
        messages={messages}
        widgetId={widgetId}
        webChart={webChart}
        onSectionChange={setSection}
        useDataSources={useDataSources}
        onMessagesChange={onMessagesChange}
        onWebChartChange={onWebChartChange}
        onOptionsChange={onOptionsChange}
      />
     { type !== 'gaugeSeries' && <SettingSection>
        <CollapsablePanel
          label={translate('tools')}
          aria-label={translate('tools')}
          isOpen={section === ChartSettingSection.Tools}
          onRequestOpen={() => { setSection(ChartSettingSection.Tools) }}
          onRequestClose={() => { setSection(ChartSettingSection.None) }}
        >
          <Tools type={type} tools={tools} onChange={onToolsChange} />
        </CollapsablePanel>
      </SettingSection>}
    </>
  )
}

export default ChartSetting
