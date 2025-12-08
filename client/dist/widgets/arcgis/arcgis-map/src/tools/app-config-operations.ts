import { dataSourceUtils } from 'jimu-core'
import type { extensionSpec, IMAppConfig, DuplicateContext, UseDataSource } from 'jimu-core'
import type { IMConfig } from '../config'
import type { ZoomToMessageConfig } from '../message-actions/zoom-to-feature-action-setting'
import type { PanToMessageConfig } from '../message-actions/pan-to-action-setting'
import type { FilterMessageActionConfig } from '../message-actions/filter-action-setting'
import type { FlashMessageActionConfig } from '../message-actions/flash-action-setting'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'map-app-config-operation'

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

    let newAppConfig = destAppConfig

    // handle map widget
    const sourceWidgetJson = sourceAppConfig.widgets[sourceWidgetId]
    const sourceWidgetConfig: IMConfig = sourceWidgetJson?.config

    const destWidgetJson = newAppConfig.widgets[destWidgetId]
    const destWidgetConfig: IMConfig = destWidgetJson?.config

    if (sourceWidgetConfig && destWidgetConfig && sourceWidgetConfig.clientQueryDataSourceIds?.length > 0) {
      // client query should be enabled by only one map widget for one webmap data source
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'clientQueryDataSourceIds'], [])
    }

    // handle map message actions
    if (newAppConfig.messageConfigs) {
      // the below code will update messageConfigsObj (not update newAppConfig directly) for performance reason
      const newMessageConfigsObj = newAppConfig.messageConfigs.asMutable({ deep: true })
      const messageConfigIds = Object.keys(newMessageConfigsObj)

      messageConfigIds.forEach(messageConfigId => {
        const messageJson = newMessageConfigsObj[messageConfigId]

        if (messageJson?.actions?.length > 0) {
          messageJson.actions.forEach(messageActionJson => {
            if (messageActionJson && messageActionJson?.widgetId === destWidgetId && messageActionJson?.config) {
              const mapMessageActionConfig = messageActionJson.config
              const actionName = messageActionJson?.actionName

              if (actionName === 'zoomToFeature' || actionName === 'panTo') {
                const zoomToPanToConfig = mapMessageActionConfig as (ZoomToMessageConfig | PanToMessageConfig)

                if (zoomToPanToConfig.useDataSource) {
                  const newUseDataSource = getCopiedUseDataSource(contentMap, zoomToPanToConfig.useDataSource)

                  if (newUseDataSource) {
                    zoomToPanToConfig.useDataSource = newUseDataSource
                  }
                }

                if (zoomToPanToConfig?.useDataSources?.length > 0) {
                  zoomToPanToConfig.useDataSources = zoomToPanToConfig.useDataSources.map(useDataSource => {
                    const newUseDataSource = getCopiedUseDataSource(contentMap, useDataSource)
                    return newUseDataSource || useDataSource
                  })
                }
              } else if (actionName === 'filter' || actionName === 'flash') {
                const filterFlashConfig = mapMessageActionConfig as (FilterMessageActionConfig | FlashMessageActionConfig)

                if (filterFlashConfig.messageUseDataSource) {
                  const newUseDataSource = getCopiedUseDataSource(contentMap, filterFlashConfig.messageUseDataSource)

                  if (newUseDataSource) {
                    filterFlashConfig.messageUseDataSource = newUseDataSource
                  }
                }

                if (filterFlashConfig.actionUseDataSource) {
                  const newUseDataSource = getCopiedUseDataSource(contentMap, filterFlashConfig.actionUseDataSource)

                  if (newUseDataSource) {
                    filterFlashConfig.actionUseDataSource = newUseDataSource
                  }
                }
              }
            }
          })
        }
      })

      newAppConfig = newAppConfig.set('messageConfigs', newMessageConfigsObj)
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

function getCopiedUseDataSource(contentMap: DuplicateContext, useDataSource: UseDataSource): UseDataSource {
  let result: UseDataSource = useDataSource

  if (useDataSource) {
    const mappingInfo = dataSourceUtils.mapUseDataSource(contentMap, useDataSource)
    result = mappingInfo?.useDataSource
  }

  if (!result) {
    result = useDataSource
  }

  return result
}
