import type { DuplicateContext, extensionSpec, IMAppConfig } from 'jimu-core'
import type { IMConfig, LayersOption } from '../config'
import { mapViewUtils } from 'jimu-arcgis'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'swipe-app-config-operation'

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

    const newSwipeMapViewList: { [mapViewId: string]: LayersOption } = {}

    for (const mapViewId of Object.keys(config.swipeMapViewList || {})) {
      const newMapViewId = mapViewUtils.getCopiedJimuMapViewId(contentMap, mapViewId)
      const leadingLayerList = config.swipeMapViewList[mapViewId].leadingLayersId
      const newLeadingLayerList = leadingLayerList.map(layerId => {
        return mapViewUtils.getCopiedJimuLayerViewId(contentMap, layerId)
      }).asMutable()
      const trailingLayerList = config.swipeMapViewList[mapViewId].trailingLayersId
      const newTrailingLayerList = trailingLayerList.map(layerId => {
        return mapViewUtils.getCopiedJimuLayerViewId(contentMap, layerId)
      }).asMutable()
      newSwipeMapViewList[newMapViewId] = {
        leadingLayersId: newLeadingLayerList,
        trailingLayersId: newTrailingLayerList
      }
    }

    const newScrollMapViewList: { [mapViewId: string]: string[] } = {}

    for (const mapViewId of Object.keys(config.scrollMapViewList || {})) {
      const newMapViewId = mapViewUtils.getCopiedJimuMapViewId(contentMap, mapViewId)
      const layerList = config.scrollMapViewList[mapViewId]
      const newLayerList = layerList.map(layerId => {
        return mapViewUtils.getCopiedJimuLayerViewId(contentMap, layerId)
      }).asMutable()
      newScrollMapViewList[newMapViewId] = newLayerList
    }

    newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'swipeMapViewList'], newSwipeMapViewList).setIn(['widgets', destWidgetId, 'config', 'scrollMapViewList'], newScrollMapViewList)

    return newAppConfig
  }
}