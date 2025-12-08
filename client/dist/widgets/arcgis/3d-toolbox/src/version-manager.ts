import { BaseVersionManager } from 'jimu-core'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.11.0',
    description: 'support version manager for Slice ,#12467',
    upgrader: (oldConfig) => {
      const DEFAULT_SLICE_CONFIG = { // default config for 1.11
        id: 'slice',
        enable: false, // hidden for config update
        activedOnLoad: false,
        config: {
          tiltEnabled: false,
          excludeGroundSurface: true,
          analyses: []
        }
      }

      const toolsConfig = oldConfig.tools.concat([DEFAULT_SLICE_CONFIG]) // add default slice config
      oldConfig = oldConfig.setIn(['tools'], toolsConfig)

      return oldConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
