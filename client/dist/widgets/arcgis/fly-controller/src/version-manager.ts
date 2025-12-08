import { Immutable, BaseVersionManager } from 'jimu-core'
import { type IMConfig, type ItemsType, FlyItemMode, DefaultSpeedOptions, RotateTargetMode } from './config'
// import { isDefined } from './common/utils/utils'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.2.0',
    description: 'rename RECORD.records to RECORD.routes',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig: IMConfig = oldConfig
      const $newItemsList = newConfig.getIn(['itemsList'])
      const newItemsList = $newItemsList.asMutable({ deep: true }) as any

      newItemsList.map((flyModeConfig, index) => {
        if (flyModeConfig.name === 'RECORD') {
          if (typeof flyModeConfig.records !== 'undefined') {
            delete (flyModeConfig.records)
          }
          flyModeConfig.routes = []// rename records to routes
        } else {
          // no need to update
        }

        return Object.assign({}, flyModeConfig)
      })
      newConfig = newConfig.set('itemsList', newItemsList)

      return newConfig
    }
  }, {
    version: '1.5.0',
    description: 'config upgrade for 9.2',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig: IMConfig = oldConfig
      const $newItemsList = newConfig.getIn(['itemsList'])
      const newItemsList = $newItemsList.asMutable({ deep: true }) as any

      // 1. add Route-config(version < 2019.Nov)
      if (newItemsList.length === 2) {
        const defaultRouteConfig = {
          uuid: '2',
          name: FlyItemMode.Route,
          isInUse: false,
          routes: []
        }
        newItemsList.push(defaultRouteConfig)
      }

      newItemsList.map((flyModeConfig: ItemsType, index) => {
        // 2. add uuid (version < 9.2)
        if (typeof flyModeConfig.uuid === 'undefined') {
          flyModeConfig.uuid = index.toString()
        }

        // 3. change old name (version 2020.Oct)
        if ((flyModeConfig.name as unknown) === 'RECORD') {
          flyModeConfig.name = FlyItemMode.Route
        }

        if (FlyItemMode.Route === flyModeConfig.name) {
          // 4. rename records to routes
          if (typeof (flyModeConfig as any).records !== 'undefined') {
            delete (flyModeConfig as any).records
          }
          flyModeConfig.routes = []

          // 5. set default isInUse to false
          flyModeConfig.isInUse = false
        }

        return Object.assign({}, flyModeConfig)
      })
      newConfig = newConfig.set('itemsList', newItemsList)

      return newConfig
    }
  }, {
    version: '1.12.0',
    description: 'support default speed in setting ,#9630',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig: IMConfig = oldConfig
      const $newItemsList = newConfig.getIn(['itemsList'])
      const newItemsList = $newItemsList.asMutable({ deep: true }) as any

      newItemsList.map((flyModeConfig, index) => {
        if ((flyModeConfig.name === FlyItemMode.Rotate) || (flyModeConfig.name === FlyItemMode.Path)) {
          flyModeConfig.defaultSpeed = DefaultSpeedOptions.DEFAULT
        } else {
          // no need to update
        }

        return Object.assign({}, flyModeConfig)
      })
      newConfig = newConfig.set('itemsList', newItemsList)

      return newConfig
    }
  }, {
    version: '1.13.0',
    description: 'support Fly around map center ,#14462',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig: IMConfig = oldConfig
      const $newItemsList = newConfig.getIn(['itemsList'])
      const newItemsList = $newItemsList.asMutable({ deep: true }) as any

      newItemsList.map((flyModeConfig, index) => {
        if ((flyModeConfig.name === FlyItemMode.Rotate)) {
          // 1. add targetMode
          if (!flyModeConfig.targetMode) {
            flyModeConfig.targetMode = RotateTargetMode.Point // "targetMode": "POINT",
          }
          // 2. add rotationPauseTime
          if (!flyModeConfig.rotationPauseTime) {
            flyModeConfig.rotationPauseTime = '2.0' // "rotationPauseTime": "2.0"
          }
        } else {
          // no need to update
        }

        return Object.assign({}, flyModeConfig)
      })
      newConfig = newConfig.set('itemsList', newItemsList)

      return newConfig
    }
  }, {
    version: '1.15.0',
    description: 'remove default useMapWidgetIds[] for auto-select map ,#19299',
    upgrader: (oldConfig: IMConfig) => {
      let newConfig: IMConfig = oldConfig

      const $useMapWidgetIds = newConfig.getIn(['useMapWidgetIds'])
      // remove useMapWidgetIds[]
      if ($useMapWidgetIds && ($useMapWidgetIds.length !== 'undefined') && ($useMapWidgetIds.length === 0)) {
        newConfig = Immutable.without((newConfig as any), 'useMapWidgetIds')
      }

      return newConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
