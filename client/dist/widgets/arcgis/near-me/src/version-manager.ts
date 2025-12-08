import { WidgetVersionManager, OrderRule, type WidgetUpgradeInfo, DataSourceManager, loadArcGISJSAPIModules } from 'jimu-core'
import { AnalysisTypeName, type IMConfig } from './config'
import { defaultConfigInfo } from './setting/constants'
import { getAllFieldsNames, getUseDataSourcesForAllDs } from './common/utils'
import { colorUtils, getAppThemeVariables } from 'jimu-theme'

class VersionManager extends WidgetVersionManager {
  versions: any[] = [{
    version: '1.13.0',
    description: 'To avoid crash, reset the previous configuration from beta release',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig = oldConfig
      //Add settings for promptTextMessage which is newly added in configuration
      newConfig = newConfig.setIn(['generalSettings', 'promptTextMessage'], '')
      newConfig = newConfig.setIn(['generalSettings', 'promptTextMsgStyleSettings'], {
        fontFamily: 'Avenir Next',
        fontBold: false,
        fontItalic: false,
        fontUnderline: false,
        fontStrike: false,
        fontColor: 'var(--ref-palette-black)',
        fontSize: '12px'
      })
      //Reset the previous analysis configuration (as those are of beta version and in this first release version we did major changes)
      if (newConfig.configInfo) {
        for (const dsId in newConfig.configInfo) {
          newConfig = newConfig.setIn(['configInfo', dsId], defaultConfigInfo)
        }
      }
      return newConfig
    }
  }, {
    version: '1.14.0',
    description: 'Upgrade search settings and analysis settings config',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig = oldConfig
      //Add the following settings which is newly added in configuration
      if (newConfig.configInfo) {
        for (const dsId in newConfig.configInfo) {
          const oldSearchSettingConfig = oldConfig.configInfo[dsId].searchSettings
          //values depends on previous config
          newConfig = newConfig.setIn(['configInfo', dsId, 'searchSettings', 'showInputAddress'], true)
          newConfig = newConfig.setIn(['configInfo', dsId, 'searchSettings', 'headingLabelStyle'], {
            fontFamily: 'Avenir Next',
            fontBold: false,
            fontItalic: false,
            fontUnderline: false,
            fontStrike: false,
            fontColor: 'var(--ref-palette-black)',
            fontSize: '13px'
          })
          newConfig = newConfig.setIn(['configInfo', dsId, 'searchSettings', 'sketchTools'], {
            showPoint: oldSearchSettingConfig.showSketchTools,
            showPolyline: oldSearchSettingConfig.showSketchTools,
            showPolygon: oldSearchSettingConfig.showSketchTools
          })
          newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'displayMapSymbols'], false)
          newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'showDistFromInputLocation'], oldSearchSettingConfig.showDistFromInputLocation)
          newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'onlyShowLayersResult'], oldSearchSettingConfig.onlyShowLayersResult)
        }
      }
      return newConfig
    }
  }, {
    version: '1.15.0',
    description: 'Upgrade analysis setting config for fieldsToExport, group, sub-group and use data sources with fields',
    upgradeFullInfo: true,
    upgrader: async (oldInfo: WidgetUpgradeInfo) => {
      let newConfig = oldInfo.widgetJson.config
      const defaultSubGroupFeaturesInfo = {
        subGroupFeaturesByField: '',
        subGroupFeaturesOrder: OrderRule.Asc,
        sortSubGroupsByCount: false,
        noValueSubGroupLabel: ''
      }
      //In earlier version functionality, fieldsToExport config parameter was not present in the config
      //In order to get the data source for getting all the fields for fieldsToExport
      //We need to create the data source using the configured use data source
      const defArr: Array<Promise<any>> = []
      const createdDs = []
      if (newConfig.configInfo) {
        const dsManager = DataSourceManager.getInstance()
        for (const dsId in newConfig.configInfo) {
          newConfig.configInfo[dsId].analysisSettings.layersInfo.length > 0 &&
            newConfig.configInfo[dsId].analysisSettings.layersInfo.forEach((layerInfo) => {
              if (layerInfo.useDataSource && !createdDs.includes(layerInfo.useDataSource.dataSourceId)) {
                //create the data source only once as we can configure multiple same analysis layers
                createdDs.push(layerInfo.useDataSource.dataSourceId)
                defArr.push(dsManager.createDataSourceByUseDataSource(layerInfo.useDataSource))
              }
              return false
            })
        }
      }
      //Wait for all the created data sources
      await Promise.allSettled(defArr)
      //Add the following settings which is newly added in configuration
      if (newConfig.configInfo) {
        for (const dsId in newConfig.configInfo) {
          newConfig.configInfo[dsId].analysisSettings.layersInfo.length > 0 &&
            newConfig.configInfo[dsId].analysisSettings.layersInfo.forEach((layerInfo, i) => {
              newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'layersInfo', i, 'analysisInfo', 'fieldsToExport'], getAllFieldsNames(layerInfo.useDataSource.dataSourceId))
              if (layerInfo.analysisInfo.analysisType !== AnalysisTypeName.Summary) {
                newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'layersInfo', i, 'analysisInfo', 'includeApproxDistance'], false)
              }
              if (layerInfo.analysisInfo.analysisType === AnalysisTypeName.Proximity) {
                //values depends on previous config
                const oldSortGroupsByCountConfig = oldInfo.widgetJson.config.configInfo[dsId].analysisSettings.layersInfo[i].analysisInfo.sortGroupsByCount
                newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'layersInfo', i, 'analysisInfo', 'groupFeatures', 'sortGroupsByCount'], oldSortGroupsByCountConfig)
                newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'layersInfo', i, 'analysisInfo', 'groupFeatures', 'noValueGroupLabel'], '')
                //add default subgroup info, as in earlier version functionality of subGroupFeatures was not present
                newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'layersInfo', i, 'analysisInfo', 'subGroupFeatures'], defaultSubGroupFeaturesInfo)
              }
              return false
            })
        }
      }
      let widgetJson = oldInfo.widgetJson.set('config', newConfig)
      widgetJson = widgetJson.set('useDataSources', getUseDataSourcesForAllDs(widgetJson.config.configInfo))
      const updatedInfo = { ...oldInfo, widgetJson }
      return updatedInfo
    }
  }, {
    version: '1.16.0',
    description: 'Upgrade analysis settings config',
    upgrader: async (oldConfig: IMConfig) => {
      let newConfig = oldConfig
      const defArr: Array<Promise<any>> = []
      const createdDs = []
      const dsManager = DataSourceManager.getInstance()
      if (newConfig.configInfo) {
        for (const dsId in newConfig.configInfo) {
          newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'displayAllLayersResult'], false)
          newConfig.configInfo[dsId].analysisSettings.layersInfo.length > 0 &&
            newConfig.configInfo[dsId].analysisSettings.layersInfo.forEach((layerInfo, i) => {
              if (layerInfo.useDataSource && !createdDs.includes(layerInfo.useDataSource.dataSourceId)) {
                //create the data source only once as we can configure multiple same analysis layers
                createdDs.push(layerInfo.useDataSource.dataSourceId)
                defArr.push(dsManager.createDataSourceByUseDataSource(layerInfo.useDataSource))
              }
              return false
            })
        }
      }
      //Wait for all the created data sources
      await Promise.allSettled(defArr)

      //Add the following settings which is newly added in configuration
      if (newConfig.configInfo) {
        for (const dsId in newConfig.configInfo) {
          newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'displayAllLayersResult'], false)
          newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'enableProximitySearch'], false)
          newConfig.configInfo[dsId].analysisSettings.layersInfo.length > 0 &&
            newConfig.configInfo[dsId].analysisSettings.layersInfo.forEach((layerInfo, i) => {
              const layerDs = dsManager.getDataSource(layerInfo.useDataSource.dataSourceId)
              // if the layer's geomtry is polygon then only add the returnIntersectedPolygons property in the analysis info config
              if (layerDs?.getGeometryType() === 'esriGeometryPolygon' && (layerInfo.analysisInfo.analysisType === AnalysisTypeName.Closest || layerInfo.analysisInfo.analysisType === AnalysisTypeName.Proximity)) {
                newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'layersInfo', i, 'analysisInfo', 'returnIntersectedPolygons'], false)
              }
              return false
            })
        }
      }
      return newConfig
    }
  }, {
    version: '1.17.0',
    description: 'Upgrade analysis settings config in results section',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig = oldConfig
      const saveFeatures = {
        saveInputLocation: false,
        pointFeature: {
          enabled: false,
          useDataSource: null
        },
        polylineFeature: {
          enabled: false,
          useDataSource: null
        },
        polygonFeature: {
          enabled: false,
          useDataSource: null
        },
        searchAreaFeature: {
          enabled: false,
          useDataSource: null
        }
      }
      //Add the following settings which is newly added in configuration
      if (newConfig.configInfo) {
        for (const dsId in newConfig.configInfo) {
          newConfig = newConfig.setIn(['configInfo', dsId, 'analysisSettings', 'saveFeatures'], saveFeatures)
        }
      }
      return newConfig
    }
    }, {
      version: '1.18.0',
      description: 'Upgrade general settings config',
      upgrader: async (oldConfig: IMConfig) => {
        let newConfig = oldConfig
        const modules = await loadArcGISJSAPIModules(['esri/Color'])
        const highlightColor = colorUtils.parseThemeVariable(newConfig.generalSettings.highlightColor, getAppThemeVariables())
        const fillColor = new modules[0](highlightColor)
        fillColor.a = 0.3
        const outlineColor = new modules[0](highlightColor)
        outlineColor.a = 1
        const defaultBufferSymbol = {
          "type": "esriSFS",
          "color": fillColor,
          "outline": {
            "type": "esriSLS",
            "color": outlineColor,
            "width": 1.5,
            "style": "esriSLSSolid"
          },
          "style": "esriSFSSolid"
        }
        //Add the following settings which is newly added in configuration
        if (newConfig) {
          newConfig = newConfig.setIn(['generalSettings', 'searchAreaSymbol'], defaultBufferSymbol)
          newConfig = newConfig.setIn(['generalSettings', 'keepResultsWhenClosed'], true)
          if (newConfig.configInfo) {
            for (const dsId in newConfig.configInfo) {
              newConfig = newConfig.setIn(['configInfo', dsId, 'searchSettings', 'activeToolWhenWidgetOpens'], 'none')
            }
          }
        }
        return newConfig
      }
    }, {
      version: '1.19.0',
      description: 'Upgrade displayFeatureCount from analysisSettings to each analysisInfo',
      upgradeFullInfo: true,
      upgrader: (oldInfo: WidgetUpgradeInfo) => {
        let newConfig = oldInfo.widgetJson.config
        //Migrate the displayFeatureCount config from analysisSettings to each analysisInfo of layersInfo
        //#1142 - ENH-000175061 Allow users to select which layers to display feature count in Near Me widget instead of showing feature count for all layers
        if (newConfig.configInfo) {
          for (const dsId in newConfig.configInfo) {
            const analysisSettings = newConfig.configInfo[dsId].analysisSettings
            const oldDisplayFeatureCount = analysisSettings?.displayFeatureCount ?? true
            if (analysisSettings?.layersInfo?.length > 0) {
              analysisSettings.layersInfo.forEach((_, i) => {
                newConfig = newConfig.setIn(
                  ['configInfo', dsId, 'analysisSettings', 'layersInfo', i, 'analysisInfo', 'displayFeatureCount'],
                  oldDisplayFeatureCount
                )
              })
            }
          }
        }

        let widgetJson = oldInfo.widgetJson.set('config', newConfig)
        //Update the use data source to resolve #1173 for backward compatibility
        widgetJson = widgetJson.set('useDataSources', getUseDataSourcesForAllDs(widgetJson.config.configInfo))
        const updatedInfo = { ...oldInfo, widgetJson }
        return updatedInfo
      }
    }]
}

export const versionManager: WidgetVersionManager = new VersionManager()
