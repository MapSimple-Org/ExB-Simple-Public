import { BaseVersionManager, type IconResult } from 'jimu-core'
import { utils as uiUtils } from 'jimu-ui'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.0.0',
    description: 'The first release.',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig

      if (newConfig.getIn(['styleConfig', 'name'])) {
        newConfig = newConfig.set('styleConfig', newConfig.styleConfig.without('name'))
      }

      if (newConfig.getIn(['styleConfig', 'customStyle'])) {
        newConfig = newConfig.set('styleConfig', newConfig.styleConfig.without('customStyle'))
      }

      if (newConfig.getIn(['styleConfig', 'themeStyle', 'quickStyleType'])) {
        newConfig = newConfig.setIn(['styleConfig', 'themeStyle'], { quickStyleType: newConfig.styleConfig.themeStyle.quickStyleType })
      }

      newConfig = newConfig.setIn(['styleConfig', 'useCustom'], false)

      return newConfig
    }
  }, {
    version: '1.1.0',
    description: '1.1.0',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig

      if (newConfig.getIn(['styleConfig', 'useCustom']) && newConfig.getIn(['styleConfig', 'customStyle', 'regular', 'border', 'width'])) {
        newConfig = newConfig.setIn(
          ['styleConfig', 'customStyle', 'regular', 'border', 'width'],
          uiUtils.stringOfLinearUnit(newConfig.getIn(['styleConfig', 'customStyle', 'regular', 'border', 'width']))
        )
      }

      if (newConfig.getIn(['styleConfig', 'useCustom']) && newConfig.getIn(['styleConfig', 'customStyle', 'hover', 'border', 'width'])) {
        newConfig = newConfig.setIn(
          ['styleConfig', 'customStyle', 'hover', 'border', 'width'],
          uiUtils.stringOfLinearUnit(newConfig.getIn(['styleConfig', 'customStyle', 'hover', 'border', 'width']))
        )
      }

      return newConfig
    }
  }, {
    version: '1.12.0',
    description: 'fix icon picker config',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig

      if (newConfig.getIn(['functionConfig', 'icon', 'data'])) {
        const iconResult: IconResult = {
          svg: newConfig.getIn(['functionConfig', 'icon', 'data']),
          properties: {
            filename: ''
          }
        }
        newConfig = newConfig.setIn(['functionConfig', 'icon', 'data'], iconResult)
      }

      return newConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
