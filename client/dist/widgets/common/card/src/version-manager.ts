import { BaseVersionManager } from 'jimu-core'
import { CardLayout } from './config'

class VersionManager extends BaseVersionManager {
  versions = [
    {
      version: '1.14.0',
      description: '1.14.0',
      upgrader: (oldConfig, id: string) => {
        let newConfig = oldConfig
        if (!oldConfig?.cardLayout) {
          newConfig = newConfig.set('cardLayout', CardLayout.CUSTOM)
        }
        return newConfig
      }
    }
  ]
}

export const versionManager: BaseVersionManager = new VersionManager()
