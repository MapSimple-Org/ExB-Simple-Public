import { BaseVersionManager } from 'jimu-core'
import type { IMConfig } from './config'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.5.0',
    description: '1.5.0',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig = oldConfig

      oldConfig.queryItems?.forEach((queryItem, index) => {
        if (queryItem.useAttributeFilter == null) {
          newConfig = newConfig.setIn(['queryItems', index, 'useAttributeFilter'], true)
        }
        if (queryItem.useSpatialFilter == null) {
          newConfig = newConfig.setIn(['queryItems', index, 'useSpatialFilter'], true)
        }
      })

      return newConfig
    }
  }, {
    version: '1.6.0',
    description: '1.6.0',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig = oldConfig

      if (oldConfig.queryItems?.length > 0) {
        const firstItem = oldConfig.queryItems[0]
        newConfig = newConfig.set('resultListDirection', firstItem.resultListDirection)
        newConfig = newConfig.set('resultPagingStyle', firstItem.resultPagingStyle)
      }

      return newConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
