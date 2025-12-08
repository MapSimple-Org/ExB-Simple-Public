import { React, type DataSource, DataSourceComponent, type ImmutableObject, type UseDataSource, type DataSourceStatus } from 'jimu-core'
import { useChartRuntimeDispatch, useChartRuntimeState } from '../../state'

interface OriginDataSourceManagerProps {
  widgetId: string
  useDataSource: ImmutableObject<UseDataSource>
  onQueryRequired?: () => void
  onDataSourceStatusChange?: (status: DataSourceStatus, preStatus?: DataSourceStatus) => void
}

const OriginDataSourceManager = (props: OriginDataSourceManagerProps) => {
  const { widgetId, useDataSource, onQueryRequired, onDataSourceStatusChange } = props
  const { queryVersion } = useChartRuntimeState()
  const dispatch = useChartRuntimeDispatch()

  const handleCreated = (dataSouce: DataSource) => {
    dispatch({ type: 'SET_DATA_SOURCE', value: dataSouce })
  }

  const handleQueryRequired = () => {
    dispatch({ type: 'SET_QUERY_VERSION', value: queryVersion + 1 })
    onQueryRequired?.()
  }

  return <DataSourceComponent
    widgetId={widgetId}
    useDataSource={useDataSource}
    onDataSourceCreated={handleCreated}
    onQueryRequired={handleQueryRequired}
    onDataSourceStatusChange={onDataSourceStatusChange}
  />
}

export default OriginDataSourceManager
