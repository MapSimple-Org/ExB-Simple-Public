import { BaseVersionManager } from 'jimu-core'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.0.0',
    description: 'The first version.',
    upgrader: (oldConfig) => {
      return oldConfig
    }
  }]
}

export const versionManager = new VersionManager()



