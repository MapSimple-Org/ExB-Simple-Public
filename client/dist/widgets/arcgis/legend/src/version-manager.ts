import {
  BaseVersionManager
} from 'jimu-core'
import type { IMConfig } from './config'

class VersionManager extends BaseVersionManager {
  versions = [
    {
      version: '1.17.0',
      description: 'Update respectLayerDefinitionExp option',
      upgrader: (oldConfig: IMConfig) => {
        const newConfig = oldConfig.set('respectLayerDefinitionExp', false)
        return newConfig
      }
    }
  ]
}

export const versionManager: BaseVersionManager = new VersionManager()
