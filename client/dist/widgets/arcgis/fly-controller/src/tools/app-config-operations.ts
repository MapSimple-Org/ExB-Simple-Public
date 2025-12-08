import type { ImmutableObject, DuplicateContext, extensionSpec, IMAppConfig } from 'jimu-core'
import { mapViewUtils } from 'jimu-arcgis'

import { type IMConfig, FlyItemMode } from '../config'
import type { RouteConfig } from '../common/fly-facade/plan-routes/routes'
import type { RecordConfig } from '../common/fly-facade/plan-routes/record/record'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'fly-controller-app-config-operation'
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

    // I.isUpdatingFlag: widgetConfig.itemsList.{name:"ROUTE", routes:[]}
    const hasRoutesConfigFlag = widgetConfig.itemsList.filter((item) => {
      return (item.name === FlyItemMode.Route) && (item.routes?.length > 0)
    })

    // II.upgrade
    if (hasRoutesConfigFlag) {
      // 1: widgetConfig.itemsList[]
      const newItemsListConfig = widgetConfig.itemsList.map((item) => {
        // is update
        const isRoutesConfigFlag = ((item.name === FlyItemMode.Route) && (item.routes?.length > 0))
        if (isRoutesConfigFlag) {
          // 2: widgetConfig.itemsList[].routes[]
          const newRoutes = item.routes.map((route: ImmutableObject<RouteConfig>) => {
            // 3: widgetConfig.itemsList[].routes[].records[]
            const newRecords = route.records.map((record: ImmutableObject<RecordConfig>) => {
              const newJimuMapViewId = mapViewUtils.getCopiedJimuMapViewId(contentMap, record.mapViewId)
              return record.setIn(['mapViewId'], newJimuMapViewId)
            })

            return route.setIn(['records'], newRecords) // 2 set each route
          })

          return item.setIn(['routes'], newRoutes) // 1 set each item
        }

        return item // 0 set itemsList
      })

      // update widget config
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'itemsList'], newItemsListConfig)
    }

    return newAppConfig
  }
}