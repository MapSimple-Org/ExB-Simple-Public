import type { extensionSpec, IMAppConfig, DuplicateContext } from 'jimu-core'
import type { IMConfig } from '../config'
export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'search-by-route-app-config-operation'

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext // The key is the content id in the original app config, and the value is the content id in the new app config.
  ): IMAppConfig {
    if (!contentMap) { // no need to change widget linkage if it is not performed during a page copying
          return destAppConfig
        }

        const widgetJson = sourceAppConfig.widgets[sourceWidgetId]
        const config: IMConfig = widgetJson?.config
        let newAppConfig = destAppConfig

        config.lrsLayers?.forEach((networkItem, index) => {
          if (networkItem.networkInfo.outputLineDsId && contentMap[networkItem.networkInfo.outputLineDsId]) {
            newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'lrsLayers', `${index}`, 'networkInfo', 'outputLineDsId'], contentMap[networkItem.networkInfo.outputLineDsId])
          }
          if (networkItem.networkInfo.outputPointDsId && contentMap[networkItem.networkInfo.outputPointDsId]) {
            newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'lrsLayers', `${index}`, 'networkInfo', 'outputPointDsId'], contentMap[networkItem.networkInfo.outputPointDsId])
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
