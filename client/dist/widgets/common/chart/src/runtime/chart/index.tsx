import { React, hooks, type IMDataSourceSchema, Immutable, type QueriableDataSource } from 'jimu-core'
import { createRuntimeSplitBySeries, getFieldType, isDataSourceReady, normalizeRuntimeSplitBySeries, queryFieldUniqueValues } from '../../utils/common'
import WebChart, { type WebChartProps } from './web-chart'
import { getSplitByField } from 'jimu-ui/advanced/chart'
import FeatureLayerDataSourceManager from './data-source'
import { useChartRuntimeState } from '../state'

interface Props extends WebChartProps {
  outputDataSourceId: string
}

const Chart = (props: Props) => {
  const {
    tools,
    options,
    widgetId,
    messages,
    useDataSource,
    outputDataSourceId,
    defaultTemplateType,
    enableDataAction = true,
    webChart: propWebChart,
    onInitDragHandler
  } = props

  const { chart, dataSource, queryVersion } = useChartRuntimeState()
  const dataSourceId = useDataSource?.dataSourceId
  const splitByField = getSplitByField(propWebChart?.dataSource?.query?.where, true)
  const query = propWebChart?.dataSource?.query

  const [splitByValues, setSplitByValues] = React.useState<{ [field: string]: Array<string | number> }>()

  const splitByFieldRef = hooks.useLatest(splitByField)

  React.useEffect(() => {
    if (splitByField && isDataSourceReady(dataSource)) {
      queryFieldUniqueValues(dataSource as QueriableDataSource, splitByField).then((values) => {
        setSplitByValues({ [splitByField]: values })
      })
    }
  }, [splitByField, queryVersion, dataSource])

  const series = React.useMemo(() => {
    if (splitByFieldRef.current && splitByValues?.[splitByFieldRef.current]) {
      const splitByFieldType = getFieldType(splitByFieldRef.current, dataSourceId)
      const seriesValues = createRuntimeSplitBySeries(propWebChart.series, query, splitByFieldType, splitByValues[splitByFieldRef.current])
      return Immutable(seriesValues)
    } else {
      const seriesValues = normalizeRuntimeSplitBySeries(propWebChart?.series)
      return seriesValues
    }
  }, [dataSourceId, splitByFieldRef, splitByValues, propWebChart?.series, query])

  const handleSchemaChange = (schema: IMDataSourceSchema) => {
    if (!schema) return
    chart?.refresh({ updateData: false, resetAxesBounds: false })
  }

  const webChart = React.useMemo(() => propWebChart?.set('series', series), [propWebChart, series])

  return (<>
    <FeatureLayerDataSourceManager
      widgetId={widgetId}
      webChart={webChart}
      outputDataSourceId={outputDataSourceId}
      useDataSource={useDataSource}
      splitByValues={splitByValues}
      onSchemaChange={handleSchemaChange}
    />
    <WebChart
      widgetId={widgetId}
      tools={tools}
      options={options}
      messages={messages}
      webChart={webChart}
      useDataSource={useDataSource}
      enableDataAction={enableDataAction}
      onInitDragHandler={onInitDragHandler}
      defaultTemplateType={defaultTemplateType}
    />
  </>)
}

export default Chart
