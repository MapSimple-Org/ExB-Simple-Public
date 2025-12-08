import { dataSourceUtils } from 'jimu-core'
import type { extensionSpec, IMAppConfig, DuplicateContext, UseDataSource } from 'jimu-core'
import type { IMConfig, DataSourceItem } from '../config'
import { mapViewUtils } from 'jimu-arcgis'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'select-app-config-operation'

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

    const destWidgetJson = newAppConfig?.widgets?.[destWidgetId]
    const destWidgetConfig: IMConfig = destWidgetJson?.config

    // update useDataSource, jimuMapViewId and jimuLayerViewId after copied
    if (destWidgetConfig) {
      const destWidgetConfigObj = destWidgetConfig.asMutable({deep: true})

      if (destWidgetConfigObj) {
        const {
          dataAttributeInfo: dataAttributeInfoObj,
          mapInfo: mapInfoObj,
          spatialSelection: spatialSelectionObj
        } = destWidgetConfigObj

        // update config.dataAttributeInfo
        if (dataAttributeInfoObj?.dataSourceItems?.length > 0) {
          dataAttributeInfoObj.dataSourceItems = dataAttributeInfoObj.dataSourceItems.map((dataSourceItemObj) => {
            return getCopiedDataSourceItem(contentMap, dataSourceItemObj)
          })
        }

        // update config.mapInfo
        if (mapInfoObj) {
          const sourceJimuMapViewIds = Object.keys(mapInfoObj)

          if (sourceJimuMapViewIds.length > 0) {
            sourceJimuMapViewIds.forEach(sourceJimuMapViewId => {
              const jimuMapViewConfigInfoObj = mapInfoObj[sourceJimuMapViewId]
              const dstJimuMapViewId = mapViewUtils.getCopiedJimuMapViewId(contentMap, sourceJimuMapViewId)

              // replace sourceJimuMapViewId with dstJimuMapViewId
              if (dstJimuMapViewId && dstJimuMapViewId !== sourceJimuMapViewId) {
                delete mapInfoObj[sourceJimuMapViewId]
                mapInfoObj[dstJimuMapViewId] = jimuMapViewConfigInfoObj
              }

              if (jimuMapViewConfigInfoObj?.dataSourceItems?.length > 0) {
                jimuMapViewConfigInfoObj.dataSourceItems = jimuMapViewConfigInfoObj.dataSourceItems.map(dataSourceItemObj => {
                  return getCopiedDataSourceItem(contentMap, dataSourceItemObj)
                })
              }
            })

          }
        }

        // update config.spatialSelection
        if (spatialSelectionObj) {
          if (spatialSelectionObj.useDataSources?.length > 0) {
            spatialSelectionObj.useDataSources = spatialSelectionObj.useDataSources.map(useDataSource => {
              return getCopiedUseDataSource(contentMap, useDataSource)
            })
          }
        }
      }

      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config'], destWidgetConfigObj)
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

function getCopiedDataSourceItem(contentMap: DuplicateContext, dataSourceItem: DataSourceItem): DataSourceItem {
  if (dataSourceItem) {
    if (dataSourceItem.useDataSource) {
      const newUseDataSource = getCopiedUseDataSource(contentMap, dataSourceItem.useDataSource)

      if (newUseDataSource) {
        dataSourceItem.useDataSource = newUseDataSource
      }
    }

    if (dataSourceItem.jimuLayerViewId) {
      const newJimuLayerViewId = mapViewUtils.getCopiedJimuLayerViewId(contentMap, dataSourceItem.jimuLayerViewId)

      if (newJimuLayerViewId) {
        dataSourceItem.jimuLayerViewId = newJimuLayerViewId
      }
    }
  }

  return dataSourceItem
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
