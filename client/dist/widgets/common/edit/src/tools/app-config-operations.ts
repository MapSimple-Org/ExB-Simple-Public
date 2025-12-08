import { type IMUseDataSource, Immutable, type DuplicateContext, type extensionSpec, type IMAppConfig } from 'jimu-core'
import type { IMConfig } from '../config'
import { mapViewUtils } from 'jimu-arcgis'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'edit-app-config-operation'
  widgetId: string

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

    if (config.mapViewsConfig) {
      let newMapViewsConfig = Immutable({})
      for (const [jimuMapViewId, mapViewConfig] of Object.entries(config.mapViewsConfig)) {
        const customJimuLayerViewIds = mapViewConfig.customJimuLayerViewIds || Immutable([])
        const newCustomJimuLayerViewIds= customJimuLayerViewIds.map(jimuLayerViewId => mapViewUtils.getCopiedJimuLayerViewId(contentMap, jimuLayerViewId))
        const newMapViewConfig = mapViewConfig.set('customJimuLayerViewIds', newCustomJimuLayerViewIds)
        const newJimuMapViewId = mapViewUtils.getCopiedJimuMapViewId(contentMap, jimuMapViewId)
        newMapViewsConfig = newMapViewsConfig.set(newJimuMapViewId, newMapViewConfig)
      }
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'mapViewsConfig'], newMapViewsConfig)
    }

    return newAppConfig
  }

  /**
   * Cleanup the widget config when the useDataSource will be removed
   * @returns The updated appConfig
   */
  useDataSourceWillChange (appConfig: IMAppConfig, dataSourceId: string): IMAppConfig {
    const widgetJson = appConfig.widgets[this.widgetId]

    let updatedAppConfig = appConfig

    let newWidgetJson = widgetJson

    const widgetConfig = widgetJson.config as IMConfig
    const layersConfig = widgetConfig.layersConfig
    const newLayersConfig = layersConfig.filter(l => isUseDsWillRemove(l.useDataSource, dataSourceId))
    if (layersConfig.length !== newLayersConfig.length) {
      newWidgetJson = newWidgetJson.setIn(['config', 'layersConfig'], newLayersConfig)
    }

    for (const [jimuMapViewId, mapViewConfig] of Object.entries(widgetConfig.mapViewsConfig || {})) {
      const mapViewLayersConfig = mapViewConfig.layersConfig
      const newMapViewLayersConfig = mapViewLayersConfig.filter(l => isUseDsWillRemove(l.useDataSource, dataSourceId))
      if (mapViewLayersConfig.length !== newMapViewLayersConfig.length) {
        newWidgetJson = newWidgetJson.setIn(['config', 'mapViewsConfig', jimuMapViewId, 'layersConfig'], newMapViewLayersConfig)
      }
    }

    if (newWidgetJson !== widgetJson) {
      updatedAppConfig = updatedAppConfig.setIn(['widgets', this.widgetId], newWidgetJson)
    }

    return updatedAppConfig
  }
}

const isUseDsWillRemove = (useDs: IMUseDataSource, dsIdToRemove: string) => {
  return ![useDs?.dataSourceId, useDs?.rootDataSourceId].includes(dsIdToRemove)
}
