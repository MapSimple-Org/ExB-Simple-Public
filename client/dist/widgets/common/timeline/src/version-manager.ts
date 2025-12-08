import { BaseVersionManager } from 'jimu-core'
import { TimeSpeed } from './config'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.11.0',
    description: '',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      if (!newConfig.honorTimeSettings) {
        if (newConfig.timeSettings) {
          const { stepLength, dividedCount } = newConfig.timeSettings
          // Update to the nearest integer.
          if (stepLength) {
            newConfig = newConfig.setIn(['timeSettings', 'stepLength', 'val'], Math.round(stepLength.val))
          } else {
            newConfig = newConfig.setIn(['timeSettings', 'dividedCount'], Math.round(dividedCount))
          }
        } else {
          newConfig = newConfig.set('honorTimeSettings', true)
        }
      }
      return newConfig
    }
  }, {
    version: '1.12.0',
    description: '',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      newConfig = newConfig.without('speed')
      if (!newConfig.honorTimeSettings && newConfig.timeSettings) {
        newConfig = newConfig.setIn(['timeSettings', 'speed'], TimeSpeed.Medium)
      }
      return newConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
