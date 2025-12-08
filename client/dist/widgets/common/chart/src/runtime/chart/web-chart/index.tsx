import { React, type ImmutableObject, type UseDataSource, type WidgetInitDragCallback } from 'jimu-core'
import { getSeriesType, type SupportedLayer } from 'jimu-ui/advanced/chart'
import type { ChartComponentOptions, ChartMessages, ChartTools, IWebChart, TemplateType } from '../../../config'
import WebChartComponent from './web-chart-component'
import { useChartRuntimeState } from '../../state'
import { getTemplateType, useDataSourceFeatureLayer } from '../../../utils/common'
import { ChartRoot } from '../components'
import Tools from '../tools'
import { useChartRenderState } from './utils'

export interface WebChartProps {
  className?: string
  widgetId: string
  webChart: ImmutableObject<IWebChart>
  tools: ImmutableObject<ChartTools>
  messages: ImmutableObject<ChartMessages>
  options?: ChartComponentOptions
  enableDataAction: boolean
  useDataSource: ImmutableObject<UseDataSource>
  defaultTemplateType: TemplateType
  onInitDragHandler: WidgetInitDragCallback
}

const WebChart = (props: WebChartProps) => {
  const {
    options,
    widgetId,
    webChart,
    messages: propMessages,
    useDataSource,
    tools: propTools,
    enableDataAction = true,
    defaultTemplateType = 'column',
    onInitDragHandler
  } = props

  const { dataSource, outputDataSource, renderStatus } = useChartRuntimeState()
  const dataSourceId = useDataSource?.dataSourceId

  const layer = useDataSourceFeatureLayer<SupportedLayer>(dataSourceId)

  const type = getSeriesType(webChart?.series as any)
  const templateType = getTemplateType(webChart)?.[1] ?? defaultTemplateType
  const showTools = propTools?.cursorEnable || !!propTools?.filter || enableDataAction

  const noDataMessage = propMessages?.noDataMessage ?? ''
  const messages = React.useMemo(() => { return { noDataMessage } }, [noDataMessage])
  const [render, showPlaceholder, loading, message] = useChartRenderState(useDataSource, dataSource, outputDataSource, layer, webChart, renderStatus, messages)

  const tools = showTools
    ? (
      <Tools
        type={type}
        tools={propTools}
        widgetId={widgetId}
        enableDataAction={enableDataAction}
      />
    )
    : null

  return (
    <ChartRoot
      tools={tools}
      render={render}
      message={message}
      messageType='basic'
      showLoading={loading}
      templateType={templateType}
      background={webChart?.background}
      showPlaceholder={showPlaceholder}
    >
      <WebChartComponent
        layer={layer}
        options={options}
        webChart={webChart}
        widgetId={widgetId}
        onInitDragHandler={onInitDragHandler}
        className='web-chart jimu-outline-inside'
      />
    </ChartRoot>
  )
}

export default WebChart
