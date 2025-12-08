import {
  BaseVersionManager
} from 'jimu-core'
import type { IMConfig } from './config'
import { getDefaultItemCategoriesInfo } from './utils'

class VersionManager extends BaseVersionManager {
  versions = [
    {
      version: '1.12.0',
      description: 'Allow to configure curated filter',
      upgrader: (oldConfig: IMConfig) => {
        if (!oldConfig.disableAddBySearch && !oldConfig.itemCategoriesInfo) {
          return oldConfig.set('itemCategoriesInfo', getDefaultItemCategoriesInfo())
        }
        return oldConfig
      }
    }
  ]
}

export const versionManager: BaseVersionManager = new VersionManager()
