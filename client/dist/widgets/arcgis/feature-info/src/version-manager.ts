import { BaseVersionManager, getAppStore, Immutable } from 'jimu-core'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.1.0',
    description: 'added [styleType] and [fontSizeType]',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig

      // update style
      // if(newConfig.getIn(['style', 'fontSize', 'distance']) || newConfig.getIn(['style', 'textColor'])){
      newConfig = newConfig.set('styleType', 'usePopupDefined')
      if (newConfig.getIn(['style', 'fontSize', 'distance']) || newConfig.getIn(['style', 'textColor'])) {
        newConfig = newConfig.setIn(['style', 'fontSizeType'], 'custom')
      } else {
        newConfig = newConfig.setIn(['style', 'fontSizeType'], 'auto')
        newConfig = newConfig.setIn(['style', 'fontSize', 'distance'], 14)
      }

      return newConfig
    }
  }, {
    version: '1.15.0',
    description: 'added [styleType] and [fontSizeType]',
    upgrader: (oldConfig, widgetId) => {
      // update from single DS to multiple DSs
      const widgetConfig = getAppStore().getState()?.appConfig?.widgets[widgetId]
      const useDataSource = widgetConfig?.useDataSources && widgetConfig.useDataSources[0]
      const newConfig = oldConfig.asMutable()
      if (useDataSource) {
        const dsConfig = {
          id: 'default_data_source_config',
          useDataSourceId: useDataSource.dataSourceId,
          contentConfig: {
            title: oldConfig.title,
            fields: oldConfig.fields,
            media: oldConfig.media,
            attachments: oldConfig.attachments,
            lastEditInfo: oldConfig.lastEditInfo
          }
        }
        newConfig.dsConfigs = [dsConfig]
      } else {
        newConfig.dsConfigs = []
      }
      newConfig.dsNavigator = true
      newConfig.featureNavigator = true
      delete newConfig.title
      delete newConfig.fields
      delete newConfig.media
      delete newConfig.attachments
      delete newConfig.lastEditInfo
      return Immutable(newConfig)
    }
  }, {
    version: '1.16.0',
    description: 'set useMapWidget property to false',
    upgrader: (oldConfig, widgetId) => {
      let newConfig = oldConfig
      newConfig = newConfig.set('useMapWidget', false)
      return newConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
