import {
  ReactRedux,
  type IMState,
  type IMAppConfig
} from 'jimu-core'
interface Props {
  widgetId: string
  useDataSourceId: string
}

export function useDataSourceExists (props: Props) {
  const { widgetId, useDataSourceId } = props

  const exists: boolean = ReactRedux.useSelector((state: IMState) => {
    let appConfig: IMAppConfig
    if (window.jimuConfig.isBuilder) {
      appConfig = state.appStateInBuilder.appConfig
    } else {
      appConfig = state.appConfig
    }
    const useDataSources = appConfig.widgets[widgetId].useDataSources ?? []
    return useDataSources.some(useDs => useDs.dataSourceId === useDataSourceId)
  })

  return exists
}
