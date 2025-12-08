import type { extensionSpec, IMAppConfig, DuplicateContext } from 'jimu-core'
import { dataSourceUtils, Immutable } from 'jimu-core'
import type { IMConfig } from '../config'
import { Status } from '../config'
import { utils } from 'jimu-ui'
import { updateDynamicStyleConfig, updateDynamicStyleConfigAfterWidgetCopied } from '../utils/util'
export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'list-app-config-operation'
  widgetId: string
  /**
 * Cleanup the widget config when the useDataSource will be removed
 * @returns The updated appConfig
 */
  useDataSourceWillChange (appConfig: IMAppConfig, oldDataSourceId: string, newDataSourceId: string): IMAppConfig {
    if (!oldDataSourceId) {
      return appConfig
    }

    let widgetJson = appConfig.widgets[this.widgetId]
    let widgetConfig = widgetJson.config as IMConfig

    if (oldDataSourceId || newDataSourceId) {
      //Update dynamic style setting when ds change
      const preUseDataSources = oldDataSourceId ? dataSourceUtils.getUseDataSourceByDataSourceId(oldDataSourceId) : null
      const newUseDataSources = newDataSourceId ? dataSourceUtils.getUseDataSourceByDataSourceId(newDataSourceId) : null
      widgetConfig = updateDynamicStyleConfig(widgetConfig, this.widgetId, Immutable([preUseDataSources]), Immutable([newUseDataSources]))
      widgetJson = widgetJson.set('config', widgetConfig)
      appConfig = appConfig.setIn(['widgets', this.widgetId], widgetJson)
    }
    return appConfig
  }

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext
  ): IMAppConfig {
    let newAppConfig = destAppConfig
    const widgetConfig = newAppConfig.widgets[destWidgetId].config as IMConfig
    const cardConfigs = widgetConfig.cardConfigs
    const sourceWidgetJson = sourceAppConfig?.widgets?.[sourceWidgetId]

    if (!contentMap) {
      return newAppConfig
    }

    if (cardConfigs?.[Status.Default]?.dynamicStyleConfig || cardConfigs?.[Status.Hover]?.dynamicStyleConfig || cardConfigs?.[Status.Selected]?.dynamicStyleConfig) {
      const newWidgetConfig = updateDynamicStyleConfigAfterWidgetCopied(widgetConfig, contentMap, sourceWidgetJson)
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config'], newWidgetConfig)
    }

    if (widgetConfig?.linkParam) {
      const { linkParam, isChanged } = utils.mapLinkParam(contentMap, widgetConfig?.linkParam, sourceWidgetJson)
      if (isChanged && linkParam) {
        newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'linkParam'], linkParam)
      }
    }

    return newAppConfig
  }
}