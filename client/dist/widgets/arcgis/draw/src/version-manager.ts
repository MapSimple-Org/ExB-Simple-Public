import { BaseVersionManager } from 'jimu-core'
import { LayerListMode } from './config'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.12.0',
    description: 'support decimal places in measurements #13051',
    upgrader: (oldConfig) => {
      // inline
      oldConfig = oldConfig.setIn(['measurementsInfo'], {
        decimalPlaces: {
          point: 5,
          line: 3,
          area: 3
        }
      })

      return oldConfig
    }
  }, {
    version: '1.16.0',
    description: 'support text #14881',
    upgrader: (oldConfig) => {
      // display layer information as group ,main-repo#21204
      oldConfig = oldConfig.setIn(['layerListMode'], LayerListMode.Hide)

      return oldConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
