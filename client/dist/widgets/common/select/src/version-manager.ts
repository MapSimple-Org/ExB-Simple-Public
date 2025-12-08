import { WidgetVersionManager, type WidgetUpgradeInfo } from 'jimu-core'
import type { IMConfig, MapInfo } from './config'
import { getUseDataSourcesByConfig } from './setting/utils'

class VersionManager extends WidgetVersionManager {
  versions = [
    {
      version: '1.15.0',
      description: 'remove useless useDataSources from Select widget',
      upgradeFullInfo: true,
      upgrader: (oldWidgetInfo: WidgetUpgradeInfo) => {
        const oldWidgetJson = oldWidgetInfo?.widgetJson

        const oldConfig = oldWidgetJson?.config as IMConfig

        if (!oldConfig) {
          return oldWidgetInfo
        }

        let newConfig = oldConfig

        if (newConfig.useMap) {
          // Interact with a Map widget
          // clear config.dataAttributeInfo.dataSourceItems
          if (newConfig.dataAttributeInfo?.dataSourceItems?.length > 0) {
            newConfig = newConfig.setIn(['dataAttributeInfo', 'dataSourceItems'], [])
          }
        } else {
          // Select by attributes
          const jimuMapViews = newConfig.mapInfo?.jimuMapViews

          // clear config.mapInfo?.jimuMapViews
          if (jimuMapViews && Object.keys(jimuMapViews).length > 0) {
            newConfig = newConfig.setIn(['mapInfo', 'jimuMapViews'], {})
          }
        }

        if (oldConfig === newConfig) {
          // nothing changed
          return oldWidgetInfo
        }

        // config changed
        const useDataSources = getUseDataSourcesByConfig(newConfig)
        const newWidgetJson = oldWidgetJson.set('config', newConfig).set('useDataSources', useDataSources)
        const newWidgetInfo = { ...oldWidgetInfo }
        newWidgetInfo.widgetJson = newWidgetJson

        return newWidgetInfo
      }
    },
    {
      version: '1.16.0',
      description: 'Select widget supports syncWithMap option',
      upgradeFullInfo: true,
      upgrader: (oldWidgetInfo: WidgetUpgradeInfo) => {
        const oldWidgetJson = oldWidgetInfo?.widgetJson

        const oldConfig = oldWidgetJson?.config as IMConfig

        if (!oldConfig) {
          return oldWidgetInfo
        }

        let newConfig = oldConfig

        const oldMapInfo = oldConfig.mapInfo as any

        newConfig = newConfig.set('mapInfo', {})

        if (oldMapInfo && Object.keys(oldMapInfo).length > 0) {
          // Interact with a Map widget, update the format of config.mapInfo
          // old format of config.mapInfo
          // {
          //   allowGenerated: false,
          //   enableAttributeSelection: true,
          //   jimuMapViews: {
          //     jimuLayerViewId1: dataSourceItems1,
          //     jimuLayerViewId2: dataSourceItems2,
          //   }
          // }

          // new format of config.mapInfo
          // {
          //   jimuLayerViewId1: {
          //     syncWithMap: false,
          //     allowGenerated: true,
          //     enableAttributeSelection: true,
          //     dataSourceItems: dataSourceItems1
          //   },
          //   jimuLayerViewId2: {
          //     syncWithMap: true
          //     allowGenerated: true,
          //     enableAttributeSelection: false,
          //     dataSourceItems: undefined
          //   }
          // }

          const allowGenerated = !!oldMapInfo.allowGenerated
          const enableAttributeSelection = !!oldMapInfo.enableAttributeSelection
          const oldJimuMapViews = oldMapInfo.jimuMapViews

          if (oldJimuMapViews) {
            const newMapInfo: MapInfo = {}

            Object.keys(oldJimuMapViews).forEach(jimuMapViewId => {
              const dataSourceItems = oldJimuMapViews[jimuMapViewId] || []
              newMapInfo[jimuMapViewId] = {
                syncWithMap: false, // Select 11.5 always doesn't sync with map, it uses customize mode.
                allowGenerated,
                enableAttributeSelection,
                dataSourceItems
              }
            })

            newConfig = newConfig.set('mapInfo', newMapInfo)
          }
        }

        // config changed
        const useDataSources = getUseDataSourcesByConfig(newConfig)
        let newWidgetJson = oldWidgetJson.set('config', newConfig).set('useDataSources', useDataSources)

        if (!newConfig.useMap) {
          newWidgetJson = newWidgetJson.set('useMapWidgetIds', null)
        }

        const newWidgetInfo = { ...oldWidgetInfo }
        newWidgetInfo.widgetJson = newWidgetJson

        return newWidgetInfo
      }
    }
  ]
}

export const versionManager: WidgetVersionManager = new VersionManager()
