import { React, ReactRedux, type IMState } from 'jimu-core'
import { isSerialSeries } from '../../../../utils/default'
import SerialSetting, { type SerialSettingProps } from './serial'
import PieSetting from './pie'
import ScatterPlotSetting from './scatter'
import HistogramSetting from './histogram'
import GaugeSetting from './gauge'
interface WebChartSettingProps extends SerialSettingProps {
  widgetId?: string
}

const WebChartSetting = (props: WebChartSettingProps) => {
  const {
    type,
    section,
    webChart,
    options,
    widgetId,
    messages,
    useDataSources,
    onSectionChange,
    onWebChartChange,
    onMessagesChange,
    onOptionsChange
  } = props

  const colorMatchingApplied = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder.widgetsState?.[widgetId]?.colorMatchingApplied)

  return (
    <>
      {isSerialSeries(type) && (
        <SerialSetting
          type={type}
          section={section}
          options={options}
          messages={messages}
          webChart={webChart}
          onMessagesChange={onMessagesChange}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
          onOptionsChange={onOptionsChange}
          colorMatchingApplied={colorMatchingApplied}
        />
      )}
      {type === 'pieSeries' && (
        <PieSetting
          type={type}
          section={section}
          messages={messages}
          webChart={webChart}
          onMessagesChange={onMessagesChange}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
          colorMatchingApplied={colorMatchingApplied}
        />
      )}
      {type === 'scatterSeries' && (
        <ScatterPlotSetting
          section={section}
          messages={messages}
          webChart={webChart}
          onMessagesChange={onMessagesChange}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
          colorMatchingApplied={colorMatchingApplied}
        />
      )}
      {type === 'histogramSeries' && (
        <HistogramSetting
          section={section}
          messages={messages}
          webChart={webChart}
          onMessagesChange={onMessagesChange}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
          colorMatchingApplied={colorMatchingApplied}
        />
      )}
      {type === 'gaugeSeries' && (
        <GaugeSetting
          section={section}
          messages={messages}
          webChart={webChart}
          onMessagesChange={onMessagesChange}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
        />
      )}
    </>
  )
}

export default WebChartSetting
