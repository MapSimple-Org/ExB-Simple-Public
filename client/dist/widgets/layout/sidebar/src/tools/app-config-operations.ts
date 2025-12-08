import { type ImmutableObject, type extensionSpec, type IMAppConfig, type DuplicateContext, dataSourceUtils } from 'jimu-core'
import type { ActionConfig } from '../message-actions/types'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'sidebar-app-config-operation'
  widgetId: string

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext
  ): IMAppConfig {
    let newMessageConfigs = destAppConfig.messageConfigs
    for (const [messageId, messageConfig] of Object.entries(newMessageConfigs || {})) {
      for (let i = 0; i < messageConfig.actions.length; i++) {
        const action = messageConfig.actions[i]
        if (action.actionName === 'openSidebar' && action.widgetId === destWidgetId) {
          const actionConfig = action.config as ImmutableObject<ActionConfig>
          if (actionConfig?.useDataSources) {
            const newUseDataSources = actionConfig.useDataSources.map(useDataSource => dataSourceUtils.mapUseDataSource(contentMap, useDataSource).useDataSource)
            newMessageConfigs = newMessageConfigs.setIn([messageId, 'actions', i, 'config', 'useDataSources'], newUseDataSources)
          }
        }
      }
    }

    return destAppConfig.set('messageConfigs', newMessageConfigs)
  }
}
