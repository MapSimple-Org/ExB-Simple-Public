import { type WidgetUpgradeInfo, WidgetVersionManager } from 'jimu-core'
import { getUniqueElevationLayersId, getUseDataSourcesForAllDs } from './common/utils'
import type { Statistics, IMConfig } from './config'
import { epStatistics, SelectionMode } from './setting/constants'
import ElevationLayer from 'esri/layers/ElevationLayer'

class VersionManager extends WidgetVersionManager {
  versions: any[] = [{
    version: '1.15.0',
    description: 'Upgrade output data source json and use data sources',
    upgradeFullInfo: true,
    upgrader: (oldInfo: WidgetUpgradeInfo) => {
      const oldOutputDsJson = oldInfo.outputDataSourceJsons
      //update the old config use data sources
      const configInfo = oldInfo.widgetJson.config.configInfo
      const widgetJson = oldInfo.widgetJson.set('useDataSources', getUseDataSourcesForAllDs(configInfo))
      const updatedInfo = { ...oldInfo, widgetJson }
      let outputInfo = updatedInfo
      //update the geometry for output data source
      updatedInfo.widgetJson.outputDataSources?.forEach((outputDsId: string) => {
        let dsJson = oldOutputDsJson[outputDsId]
        dsJson = dsJson.set('geometryType', 'esriGeometryPolyline')
        const outputDataSourceJsons = oldOutputDsJson.set(outputDsId, dsJson)
        outputInfo = { ...updatedInfo, outputDataSourceJsons }
      })
      return outputInfo
    }
  },
  {
    version: '1.16.0',
    description: 'Upgrade Elevation layers settings and profile settings',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig = oldConfig
      //Add the following settings which is newly added in configuration
      if (newConfig.configInfo) {
        for (const dsId in newConfig.configInfo) {
          const oldConfigInfo = oldConfig.configInfo[dsId]
          const oldProfileChartSettings = oldConfigInfo.profileChartSettings
          const elevLyr = new ElevationLayer({
            // Custom elevation service
            url: oldProfileChartSettings.elevationLayerURL
          })

          //updated elevation layers settings
          const elevationLayers = {
            id: getUniqueElevationLayersId(),
            useDataSource: null,
            label: elevLyr.title,
            elevationLayerUrl: oldProfileChartSettings.elevationLayerURL,
            style: {
              lineType: 'solid-line',
              lineColor: oldProfileChartSettings.groundColor,
              lineThickness: 2
            },
            displayStatistics: oldProfileChartSettings.displayStatistics,
            selectedStatistics: oldProfileChartSettings.selectedStatistics
          }

          //updated next possible selection settings
          const nextPossibleOptions = {
            displayNextSelectableLine: true,
            style: {
              lineType: 'dotted-line',
              lineColor: '#fcfc03',
              lineThickness: 3
            }
          }

          //updated volumetric objects settings
          const availableStatistics: any[] = epStatistics
          const allAvailableStats: Statistics[] = []
          //all available statistics present in JS API widget
          availableStatistics.forEach((stat) => {
            const supportedStats: Statistics = {
              name: stat.value,
              label: stat.label,
              enabled: true
            }
            allAvailableStats.push(supportedStats)
          })
          allAvailableStats.sort((a, b) => a.label.localeCompare(b.label))
          const volumetricObjOptions = {
            id: getUniqueElevationLayersId(),
            style: {
              lineType: 'solid-line',
              lineColor: oldProfileChartSettings.volumetricObjLineColor,
              lineThickness: 2
            },
            volumetricObjLabel: oldProfileChartSettings.volumetricObjLabel,
            displayStatistics: false,
            selectedStatistics: allAvailableStats
          }
          newConfig = newConfig.setIn(['configInfo', dsId, 'elevationLayersSettings', 'addedElevationLayers'], [elevationLayers])
          newConfig = newConfig.setIn(['configInfo', dsId, 'elevationLayersSettings', 'groundLayerId'], elevationLayers.id)
          newConfig = newConfig.setIn(['configInfo', dsId, 'elevationLayersSettings', 'linearUnit'], oldProfileChartSettings.linearUnit)
          newConfig = newConfig.setIn(['configInfo', dsId, 'elevationLayersSettings', 'elevationUnit'], oldProfileChartSettings.elevationUnit)
          newConfig = newConfig.setIn(['configInfo', dsId, 'elevationLayersSettings', 'showVolumetricObjLineInGraph'], oldProfileChartSettings.showVolumetricObjLineInGraph)
          newConfig = newConfig.setIn(['configInfo', dsId, 'elevationLayersSettings', 'volumetricObjSettingsOptions'], volumetricObjOptions)
          newConfig = newConfig.setIn(['configInfo', dsId, 'profileSettings', 'graphicsHighlightColor'], oldProfileChartSettings.graphicsHighlightColor)
          newConfig = newConfig.setIn(['configInfo', dsId, 'profileSettings', 'nextSelectableLineOptions'], nextPossibleOptions)
          newConfig = newConfig.setIn(['configInfo', dsId, 'profileSettings', 'supportAddedLayers'], false)
        }
      }
      return newConfig
    }
  },
  {
    version: '1.17.0',
    description: 'Upgrade Selection mode options settings in profile settings',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig = oldConfig
      //Add the following settings which is newly added in configuration
      if (newConfig.configInfo) {
        for (const dsId in newConfig.configInfo) {
          const oldConfigInfo = oldConfig.configInfo[dsId]
          const oldProfileSettings = oldConfigInfo.profileSettings

          //updated selection mode settings
          const selectionModeOptions = {
            selectionMode: oldProfileSettings.nextSelectableLineOptions.displayNextSelectableLine ? SelectionMode.Multiple : SelectionMode.Single,
            style: {
              lineType: oldProfileSettings.nextSelectableLineOptions.style.lineType,
              lineColor: oldProfileSettings.nextSelectableLineOptions.style.lineColor,
              lineThickness: oldProfileSettings.nextSelectableLineOptions.style.lineThickness
            }
          }
          newConfig = newConfig.setIn(['configInfo', dsId, 'profileSettings', 'selectionModeOptions'], selectionModeOptions)
        }
      }
      return newConfig
    }
    },
    {
      version: '1.18.0',
      description: 'Upgrade Widget Controller Item settings',
      upgrader: (oldConfig: IMConfig) => {
        let newConfig = oldConfig
        //Add the following settings which is newly added in configuration
        newConfig = newConfig.setIn(['generalSettings', 'keepResultsWhenClosed'], true)
        return newConfig
      }
    }]
}

export const versionManager: WidgetVersionManager = new VersionManager()
