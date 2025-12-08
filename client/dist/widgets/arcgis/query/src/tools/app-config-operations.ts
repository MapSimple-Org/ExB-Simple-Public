import { dataSourceUtils, type DuplicateContext, type extensionSpec, type IMAppConfig } from 'jimu-core'
import type { IMConfig } from '../config'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'query-app-config-operation'

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext
  ): IMAppConfig {
    if (!contentMap) { // no need to change widget linkage if it is not performed during a page copying
      return destAppConfig
    }

    const widgetJson = sourceAppConfig.widgets[sourceWidgetId]
    const config: IMConfig = widgetJson?.config
    let newAppConfig = destAppConfig

    config.queryItems?.forEach((queryItem, index) => {
      if (queryItem.spatialMapWidgetIds?.length > 0) {
        const newWidgetIds = queryItem.spatialMapWidgetIds.map(wId => contentMap[wId])
        newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'queryItems', `${index}`, 'spatialMapWidgetIds'], newWidgetIds)
      }
      if (queryItem.outputDataSourceId && contentMap[queryItem.outputDataSourceId]) {
        newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'queryItems', `${index}`, 'outputDataSourceId'], contentMap[queryItem.outputDataSourceId])
      }
      if (queryItem.useDataSource) {
        const { isChanged, useDataSource: newUseDataSource } = dataSourceUtils.mapUseDataSource(contentMap, queryItem.useDataSource)
        if (isChanged) {
          newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'queryItems', `${index}`, 'useDataSource'], newUseDataSource)
        }
      }
      if (queryItem.spatialMapWidgetIds?.length > 0) {
        const newList = []
        queryItem.spatialMapWidgetIds.forEach((mapId) => {
          if (contentMap[mapId]) {
            newList.push(contentMap[mapId])
          } else {
            newList.push(mapId)
          }
        })
        newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'queryItems', `${index}`, 'spatialMapWidgetIds'], newList)
      }
    })

    return newAppConfig
  }

  /**
   * Do some cleanup operations before current widget is removed.
   * @returns The updated appConfig
   */
  widgetWillRemove (appConfig: IMAppConfig): IMAppConfig {
    return appConfig
  }
}
