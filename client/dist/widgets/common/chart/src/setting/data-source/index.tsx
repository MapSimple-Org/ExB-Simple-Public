import { type DataSource, DataSourceComponent, Immutable, type ImmutableObject, React, type UseDataSource, type FeatureLayerDataSource, type SceneLayerDataSource, getAppStore, hooks, type DataSourceJson, type IMDataSourceSchema } from 'jimu-core'
import { defaultMessages as jimuUiMessages } from 'jimu-ui'
import { createInitOutputDataSource, getSchemaOriginFields } from './utils'

interface OutputSourceManagerProps {
  widgetId: string
  dataSourceId: string
  originalUseDataSource: ImmutableObject<UseDataSource>
  onCreate?: (dataSourceJson: DataSourceJson) => void
  onFieldsChange?: (fields: string[]) => void
}

const OutputSourceManager = (props: OutputSourceManagerProps) => {
  const {
    widgetId,
    dataSourceId,
    originalUseDataSource,
    onCreate: propOnCreate,
    onFieldsChange
  } = props

  const translate = hooks.useTranslation(jimuUiMessages)

  const [dataSource, setDataSource] = React.useState<DataSource>(null)

  const onCreate = hooks.useLatest(propOnCreate)

  React.useEffect(() => {
    if (!dataSourceId) {
      const outputId = widgetId + '_output'
      const widgetLabel = getAppStore().getState().appStateInBuilder.appConfig.widgets[widgetId].label
      const label = translate('outputStatistics', { name: widgetLabel })
      //create the corresponding output data source after use data source changes
      const outputDataSource = createInitOutputDataSource(outputId, label, originalUseDataSource?.asMutable({ deep: true }))
      onCreate.current?.(outputDataSource)
    }
  }, [dataSourceId, onCreate, originalUseDataSource, translate, widgetId])

  const useDataSource: ImmutableObject<UseDataSource> = React.useMemo(() => {
    if (dataSourceId) {
      return Immutable({
        dataSourceId: dataSourceId,
        mainDataSourceId: dataSourceId
      })
    }
  }, [dataSourceId])

  const handleSchemaChange = (schema: IMDataSourceSchema) => {
    if (!dataSource) return
    const fields = getSchemaOriginFields(schema)
    onFieldsChange?.(fields)
  }

  const handleCreated = (dataSource: FeatureLayerDataSource | SceneLayerDataSource) => {
    setDataSource(dataSource)
  }

  return <DataSourceComponent
    widgetId={widgetId}
    useDataSource={useDataSource}
    onDataSourceCreated={handleCreated}
    onDataSourceSchemaChange={handleSchemaChange}
  />
}

export default OutputSourceManager
