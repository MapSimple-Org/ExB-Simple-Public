import { BaseVersionManager, Immutable } from 'jimu-core'
import type { IMConfig } from './config'
class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.10.0',
    description: '1.10.0',
    upgrader: (oldConfig) => {
      let newConfig
      if (oldConfig.toolConifg) {
        // fix typo for 'toolConifg'
        newConfig = Immutable.without(oldConfig, 'toolConifg')
        newConfig = newConfig.set('toolConfig', oldConfig.toolConifg)
      }

      if (!newConfig) {
        newConfig = oldConfig
      }

      return newConfig
    }
  }, {
    version: '1.16.0',
    description: 'update config.popupDockPosition to "auto" if value is "top-right" for Map widget',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig: IMConfig = oldConfig

      if (oldConfig.popupDockPosition === 'top-right') {
        newConfig = oldConfig.set('popupDockPosition', 'auto')
      }

      if (!newConfig) {
        newConfig = oldConfig
      }

      return newConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
