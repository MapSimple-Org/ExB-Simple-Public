import type { extensionSpec, IMAppConfig, DuplicateContext } from 'jimu-core'
import type { IMConfig } from '../config'
import { utils } from 'jimu-ui'
export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'card-app-config-operation'
  widgetId: string

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext
  ): IMAppConfig {
    let newAppConfig = destAppConfig
    const widgetConfig = newAppConfig.widgets[destWidgetId].config as IMConfig
    if (!contentMap || !widgetConfig?.linkParam) {
      return destAppConfig
    }

    const sourceWidgetJson = sourceAppConfig?.widgets?.[sourceWidgetId]
    const { linkParam, isChanged } = utils.mapLinkParam(contentMap, widgetConfig?.linkParam, sourceWidgetJson)
    if (isChanged && linkParam) {
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'linkParam'], linkParam)
    }
    return newAppConfig
  }
}