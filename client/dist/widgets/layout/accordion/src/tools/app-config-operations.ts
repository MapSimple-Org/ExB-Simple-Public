import type { DuplicateContext, extensionSpec, IMAppConfig } from 'jimu-core'
import type { Config } from '../config'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'accordion-app-config-operation'

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
    const config: Config = widgetJson?.config
    let newAppConfig = destAppConfig

    if (config.expandedItems?.length > 0) {
      const expandedItems = config.expandedItems.map((expandWidgetId) => contentMap[expandWidgetId])
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'expandedItems'], expandedItems)
    }

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

