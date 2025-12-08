import { BaseVersionManager } from 'jimu-core'
import { LayerHonorModeType, PagingType, ResponsiveType, TableModeType } from './config'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.6.0',
    description: 'Add editable to table fields.',
    upgrader: (oldConfig, id) => {
      let newConfig = oldConfig
      if (newConfig.layersConfig.length === 0) {
        return newConfig
      }
      newConfig.layersConfig.forEach((config, i) => {
        const newTableFields = config.tableFields.map(field => {
          return {
            ...field,
            editAuthority: true
          }
        })
        newConfig = newConfig.setIn(['layersConfig', i, 'tableFields'], newTableFields)
      })
      return newConfig
    }
  }, {
    version: '1.10.0',
    description: 'Add visible to table fields.',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      if (newConfig.layersConfig.length === 0) {
        return newConfig
      }
      newConfig.layersConfig.forEach((config, i) => {
        const newTableFields = config.tableFields.map(field => {
          return {
            ...field,
            visible: true
          }
        })
        newConfig = newConfig.setIn(['layersConfig', i, 'tableFields'], newTableFields)
      })
      return newConfig
    }
  }, {
    version: '1.12.0',
    description: 'Add header setting options.',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      if (newConfig.layersConfig.length === 0) {
        return newConfig
      }
      newConfig.layersConfig.forEach((config, i) => {
        const defaultHeaderFontSetting = {
          backgroundColor: '',
          fontSize: 14,
          bold: false,
          color: ''
        }
        config = config.set('headerFontSetting', defaultHeaderFontSetting)
        newConfig = newConfig.setIn(['layersConfig', i], config)
      })
      return newConfig
    }
  }, {
    version: '1.13.0',
    description: 'Add "showCount" and "updateText" options.',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      if (newConfig.layersConfig.length === 0) {
        return newConfig
      }
      newConfig.layersConfig.forEach((config, i) => {
        config = config.set('showCount', false).set('updateText', true)
        newConfig = newConfig.setIn(['layersConfig', i], config)
        // searchFields update
        if (config?.searchFields && typeof (config?.searchFields) === 'string') {
          const newSearchFields = config.searchFields.split(',') || []
          newConfig = newConfig.setIn(['layersConfig', i, 'searchFields'], newSearchFields)
        } else if (!config?.searchFields) {
          newConfig = newConfig.setIn(['layersConfig', i, 'searchFields'], [])
        }
      })
      return newConfig
    }
  }, {
    version: '1.14.0',
    description: 'Update honor webmap options',

    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      const newLayersConfig = newConfig.layersConfig.map(config => {
        return {
          ...config,
          layerHonorMode: LayerHonorModeType.Custom
        }
      })
      newConfig = newConfig.setIn(['layersConfig'], newLayersConfig)
      return newConfig
    }
  }, {
    version: '1.15.0',
    description: 'Update column setting',

    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      const newLayersConfig = newConfig.layersConfig.map(config => {
        return {
          ...config,
          columnSetting: {
            responsiveType: ResponsiveType.Fixed,
            columnWidth: 200
          }
        }
      })
      newConfig = newConfig.setIn(['layersConfig'], newLayersConfig)
      return newConfig
    }
  }, {
    version: '1.16.0',
    description: 'Modify a property spelling error',

    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      const newLayersConfig = newConfig.layersConfig.map(config => {
        const originAttachmentsOption = config.enableAttachements
        const newConfig = {
          ...config,
          enableAttachments: originAttachmentsOption
        }
        delete newConfig.enableAttachements
        return newConfig
      })
      newConfig = newConfig.setIn(['layersConfig'], newLayersConfig).setIn(['tableMode'], TableModeType.Layer)
      return newConfig
    }
  }, {
    version: '1.19.0',
    description: 'Support new override general settings',

    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      // layersConfig
      const newLayersConfig = newConfig.layersConfig.map(config => {
        const newLayerConfig = {
          ...config,
          overrideGeneralSettings: true,
          enableAttachments: newConfig?.enableAttachments,
          enableMapExtentFilter: newConfig?.enableMapExtentFilter,
          defaultExtentFilterEnabled: newConfig?.defaultExtentFilterEnabled
        }
        return newLayerConfig
      })
      // mapViewsConfig
      const mapViewsConfig = newConfig.mapViewsConfig
      const mapViewsConfigKeys = Object.keys(mapViewsConfig || {})
      if (mapViewsConfigKeys.length > 0) {
        mapViewsConfigKeys.forEach(key => {
          const viewConfig = mapViewsConfig[key]
          if (viewConfig?.layersConfig?.length > 0) {
            const newViewLayersConfig = viewConfig.layersConfig.map(config => {
              const newLayerConfig = {
                ...config,
                overrideGeneralSettings: true,
                enableRelatedRecords: newConfig?.enableRelatedRecords,
                enableAttachments: newConfig?.enableAttachments,
                enableMapExtentFilter: newConfig?.enableMapExtentFilter,
                defaultExtentFilterEnabled: newConfig?.defaultExtentFilterEnabled
              }
              return newLayerConfig
            })
            newConfig = newConfig.setIn(['mapViewsConfig', key, 'layersConfig'], newViewLayersConfig)
          }
        })
      }
      const defaultGeneralSettings = {
        enableRelatedRecords: false,
        enableAttachments: false,
        columnSetting: {
          responsiveType: 'FIXED',
          columnWidth: 200,
          wrapText: false,
          textAlign: 'start'
        },
        headerFontSetting: {
          backgroundColor: '',
          fontSize: 14,
          bold: false,
          color: ''
        },
        enableSelect: true,
        selectMode: 'SINGLE',
        enableRefresh: true,
        enableDelete: false,
        enableShowHideColumn: true,
        showCount: true
      }
      // enableRelatedRecords, enableAttachments
      // These two attributes were global attributes in the old version, so the default override was only used when they did not exist
      const originalOptions = [ 'enableRelatedRecords', 'enableAttachments' ]
      originalOptions.forEach(option => {
        if (option in newConfig) {
          delete defaultGeneralSettings[option]
        }
      })
      newConfig = newConfig.merge(defaultGeneralSettings).set('layersConfig', newLayersConfig).set('pagingStyle', PagingType.Scroll).set('pageSize', 50)
      return newConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
