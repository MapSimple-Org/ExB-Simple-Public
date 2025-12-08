import { React, type ImmutableObject, type UseDataSource, hooks, getAppStore, DataSourceStatus, lodash, type IMDataSourceSchema, type DataSource } from 'jimu-core'
import OriginDataSourceManager from './original'
import OutputSourceManager from './output'
import type { IWebChart } from '../../../config'
import { updateDataSourceJson, useMemoizedQuery } from './utils'
import { getSeriesType, getSplitByField } from 'jimu-ui/advanced/chart'
import { useChartRuntimeDispatch, useChartRuntimeState } from '../../state'
import { getDataSourceSchema, getDataSourceSchemaForSplitBy, isDataSourceReady, isDataSourceValid } from '../../../utils/common'

interface FeatureLayerDataSourceManagerProps {
  widgetId: string
  webChart: ImmutableObject<IWebChart>
  outputDataSourceId: string
  useDataSource: ImmutableObject<UseDataSource>
  splitByValues?: { [field: string]: Array<string | number> }
  onSchemaChange?: (schema: IMDataSourceSchema) => void
}

const FeatureLayerDataSourceManager = (props: FeatureLayerDataSourceManagerProps) => {
  const {
    widgetId,
    useDataSource,
    outputDataSourceId,
    webChart,
    splitByValues,
    onSchemaChange
  } = props

  const dispatch = useChartRuntimeDispatch()
  const { dataSource, outputDataSource } = useChartRuntimeState()
  const dataSourceId = useDataSource?.dataSourceId
  const splitByField = getSplitByField(webChart?.dataSource?.query?.where, true)
  const seriesCount = webChart?.series?.length
  const seriesRef = hooks.useLatest(webChart?.series)
  const query = useMemoizedQuery(webChart?.dataSource?.query)

  React.useEffect(() => {
    if (isDataSourceReady(dataSource) && outputDataSource) {
      const dataSourceId = dataSource.id
      const outputDataSourceId = outputDataSource.id
      let dsJson = getAppStore().getState()?.appConfig.dataSources?.[outputDataSourceId]
      if (!dsJson) {
        console.error(`The output data source of ${outputDataSourceId} does not exist`)
        return null
      }
      let schema = null
      if (splitByField) {
        if (splitByValues?.[splitByField]) {
          schema = getDataSourceSchemaForSplitBy(outputDataSource, dataSourceId, query, seriesRef.current, splitByValues[splitByField])
        }
      } else {
        const seriesType = getSeriesType(seriesRef.current as any)
        schema = getDataSourceSchema(outputDataSource, dataSourceId, query, seriesType)
      }
      if (!schema) return
      if (lodash.isDeepEqual(schema, dsJson.schema.asMutable({ deep: true }))) return
      dsJson = dsJson.set('schema', schema)
      updateDataSourceJson(outputDataSourceId, dsJson)
    }
  }, [dataSource, outputDataSource, query, seriesCount, seriesRef, splitByField, splitByValues])

  const handleDataSourceStatusChange = (status: DataSourceStatus, preStatus?: DataSourceStatus) => {
    if (isDataSourceValid(outputDataSource)) {
      if (status === DataSourceStatus.NotReady && status !== preStatus) {
        outputDataSource.setStatus(DataSourceStatus.NotReady)
        outputDataSource.setCountStatus(DataSourceStatus.NotReady)
        dispatch({ type: 'SET_RECORDS', value: undefined })
      }
    }
  }

  const handleOutDataSourceCreated = (dataSource: DataSource) => {
    const schema = dataSource.getSchema()
    onSchemaChange?.(schema)
  }

  return (
    <>
      <OriginDataSourceManager
        widgetId={widgetId}
        useDataSource={useDataSource}
        onDataSourceStatusChange={handleDataSourceStatusChange}
      />
      <OutputSourceManager
        widgetId={widgetId}
        dataSourceId={outputDataSourceId}
        originalDataSourceId={dataSourceId}
        onCreated={handleOutDataSourceCreated}
        onSchemaChange={onSchemaChange}
      />
    </>
  )
}

export default FeatureLayerDataSourceManager
