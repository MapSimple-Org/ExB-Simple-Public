import type { DuplicateContext, extensionSpec, IMAppConfig } from 'jimu-core'
import type { CustomizeLayerOption, IMConfig } from '../config'
import { mapViewUtils } from 'jimu-arcgis'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'map-layers-app-config-operation'

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

    let newAppConfig = destAppConfig
    const widgetJson = sourceAppConfig.widgets[sourceWidgetId]
    const config: IMConfig = widgetJson?.config
    const newCustomizeLayerOptions = {}

    for(const jmvId of Object.keys(config.customizeLayerOptions || {})) {
      const customizeLayerOption = config.customizeLayerOptions[jmvId]
      const newJmvId = mapViewUtils.getCopiedJimuMapViewId(contentMap, jmvId)
      const newHiddenJlvIds = customizeLayerOption.hiddenJimuLayerViewIds?.map(jlvId => {
        return mapViewUtils.getCopiedJimuLayerViewId(contentMap, jlvId)
      }).asMutable()
      const newShowJlvIds = customizeLayerOption.showJimuLayerViewIds?.map(jlvId => {
        return mapViewUtils.getCopiedJimuLayerViewId(contentMap, jlvId)
      }).asMutable()

      newCustomizeLayerOptions[newJmvId] = {
        isEnabled: customizeLayerOption.isEnabled,
        showJimuLayerViewIds: newShowJlvIds,
        hiddenJimuLayerViewIds: newHiddenJlvIds
      } as CustomizeLayerOption
    }

    newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'customizeLayerOptions'], newCustomizeLayerOptions)
    return newAppConfig
  }

}