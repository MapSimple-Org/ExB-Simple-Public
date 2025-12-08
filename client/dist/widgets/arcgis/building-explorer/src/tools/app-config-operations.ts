import { Immutable, type DuplicateContext, type extensionSpec, type IMAppConfig } from 'jimu-core'
import type { IMConfig } from '../config'
import { mapViewUtils } from 'jimu-arcgis'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'building-explorer-app-config-operation'
  widgetId: string

  afterWidgetCopied(
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
    const widgetConfig: IMConfig = widgetJson?.config

    // config.mapSettings: { dsId: { ...layersOnLoad: [JimuLayerViewId] } }
    if (widgetConfig.mapSettings) {
      let newMapSettingsConfig = Immutable({})

      Object.keys(widgetConfig.mapSettings).forEach(dsIdKey => {
        let mapSettingConfig = widgetConfig.mapSettings.getIn([dsIdKey])
        // get new JimuLayerViewId
        const newLayersOnLoad = mapSettingConfig.layersOnLoad.map((layerViewId) => {
          const newLayerViewId = mapViewUtils.getCopiedJimuLayerViewId(contentMap, layerViewId)
          return newLayerViewId
        })
        // replace
        mapSettingConfig = mapSettingConfig.setIn(['layersOnLoad'], newLayersOnLoad)
        newMapSettingsConfig = newMapSettingsConfig.set(dsIdKey, mapSettingConfig)
      })

      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'mapSettings'], newMapSettingsConfig)
    }

    return newAppConfig
  }
}