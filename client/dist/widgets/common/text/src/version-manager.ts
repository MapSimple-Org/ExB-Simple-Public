import { BaseVersionManager } from 'jimu-core'
import type { IMConfig } from './config'
import defaultConfig from '../config.json'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.13.0',
    description: 'Remove useless line-height: normal;',
    upgrader: (oldConfig: IMConfig) => {
      let html = oldConfig.text ?? ''
      if (html.includes('line-height: normal;')) {
        html = html.replace(/line-height: normal;/gm, 'line-height: 1.2;')
        return oldConfig.set('text', html)
      } else {
        return oldConfig
      }
    }
  }, {
    version: '1.17.0',
    description: 'Complete the default config',
    upgrader: (oldConfig: IMConfig) => {
      let config = oldConfig
      if(!config.text) {
        config = config.set('text', defaultConfig.text)
      }
      if(!config.placeholder) {
        config = config.set('placeholder', defaultConfig.placeholder)
      }
      if(!config.style) {
        config = config.set('style', defaultConfig.style)
      }
      return config
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
