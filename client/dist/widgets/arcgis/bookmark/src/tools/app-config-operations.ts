import { MapViewManager } from 'jimu-arcgis'
import type { extensionSpec, IMAppConfig } from 'jimu-core'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'bookmark-app-config-operation'
  widgetId: string

  widgetWillRemove(appConfig: IMAppConfig): IMAppConfig {
    // Handle the situation where the bookmark is directly deleted with controller when it is within the controller
    try {
      const widgetJson = appConfig.widgets[this.widgetId]
      if (widgetJson) {
        const useMapWidgetId = widgetJson.useMapWidgetIds?.[0]
        const mvManager = MapViewManager.getInstance()
        const mapViewGroups = mvManager.getJimuMapViewGroup(useMapWidgetId)
        const jimuMapViews = mapViewGroups?.jimuMapViews || {}
        for (const id in jimuMapViews) {
          const bookmarkLayer = jimuMapViews[id].view?.map?.allLayers?.find(
            layer => layer.id.includes(`bookmark-layer-${this.widgetId}`)
          ) as __esri.GraphicsLayer
          if (bookmarkLayer) bookmarkLayer.removeAll()
        }
      }
    } catch (err) {
      console.error(err)
    }
    return appConfig
  }
}
