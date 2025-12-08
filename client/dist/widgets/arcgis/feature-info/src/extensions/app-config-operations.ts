import { dataSourceUtils } from 'jimu-core'
import type { DuplicateContext, extensionSpec, IMAppConfig } from 'jimu-core'
import type { IMConfig } from '../config'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'feature-info-app-config-operation'

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
    const widgetConfig: IMConfig = widgetJson?.config
    const newAppConfig = destAppConfig

    const newDSConfigs = widgetConfig.dsConfigs.map(dsConfig => {
      const useDataSource = widgetJson.useDataSources.find(useDataSource => useDataSource.dataSourceId === dsConfig.useDataSourceId)
      const mappingInfo = dataSourceUtils.mapUseDataSource(contentMap, useDataSource)
      let newDSConfig = dsConfig
      if (mappingInfo.isChanged && mappingInfo.useDataSource) {
        newDSConfig = dsConfig.set('useDataSourceId', mappingInfo.useDataSource.dataSourceId)
      }
      return newDSConfig
    })

    return newAppConfig.setIn(['widgets', destWidgetId, 'config', 'dsConfigs'], newDSConfigs)
  }

  /**
   * Do some cleanup operations before current widget is removed.
   * @returns The updated appConfig
   */
  widgetWillRemove (appConfig: IMAppConfig): IMAppConfig {
    return appConfig
  }
}
