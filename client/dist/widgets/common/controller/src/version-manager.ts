import { BaseVersionManager, type ThemeButtonType, type IMThemeButtonStylesByState, type IMThemeButtonVariants } from 'jimu-core'
import type { ControllerButtonStylesByState, IMConfig } from './config'
import type { BoxShadowStyle } from 'jimu-ui'

export const DEFAULT_CONFIG = {
  behavior: {
    onlyOpenOne: true,
    openStarts: [],
    displayType: 'STACK',
    vertical: false,
    size: {}
  },
  appearance: {
    space: 0,
    advanced: false,
    card: {
      showLabel: false,
      labelGrowth: 10,
      showTooltip: true,
      showIndicator: false,
      avatar: {
        type: 'primary',
        size: 'default',
        shape: 'circle'
      }
    }
  }
}

const mapOldConfigSize = (oldSize: string) => {
  if (oldSize === 'SMALL') return 'sm'
  if (oldSize === 'MEDIUM') return 'default'
  if (oldSize === 'LARGE') return 'lg'
  return oldSize
}

const getThemeButtonVariant = (variants: IMThemeButtonVariants, type: ThemeButtonType = 'primary'): IMThemeButtonStylesByState => {
  return variants?.[type]
}

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.0.0',
    description: 'Version manager for release 1.0.0',
    upgrader: (oldConfig) => {
      if (!oldConfig) return DEFAULT_CONFIG

      if (!oldConfig.behavior || !oldConfig.appearance) {
        let newConfig: IMConfig = oldConfig

        if (!oldConfig.behavior) {
          newConfig = newConfig.setIn(['behavior', 'openStarts'], [])
          newConfig = newConfig.setIn(['behavior', 'onlyOpenOne'], oldConfig.onlyOpenOne)
          newConfig = newConfig.setIn(['behavior', 'displayType'], oldConfig.displayType)
          newConfig = newConfig.setIn(['behavior', 'vertical'], oldConfig.vertical)
          newConfig = newConfig.setIn(['behavior', 'size'], oldConfig.size)
          newConfig = (newConfig as any).without(['onlyOpenOne', 'displayType', 'size'])
        }
        if (!oldConfig.appearance) {
          newConfig = newConfig.setIn(['appearance', 'advanced'], false)

          if (!oldConfig.vertical) {
            newConfig = newConfig.setIn(['appearance', 'space'], 0)
            newConfig = newConfig.setIn(['appearance', 'card', 'labelGrowth'], oldConfig.space)
          } else {
            newConfig = newConfig.setIn(['appearance', 'space'], oldConfig.space)
          }

          newConfig = newConfig.setIn(['appearance', 'card', 'showLabel'], oldConfig.showLabel)
          newConfig = newConfig.setIn(['appearance', 'card', 'avatar', 'size'], mapOldConfigSize(oldConfig.iconSize))
          newConfig = newConfig.setIn(['appearance', 'card', 'avatar', 'shape'], oldConfig.iconStyle)
          newConfig = newConfig.setIn(['appearance', 'card', 'avatar', 'type'], 'primary')
          newConfig = (newConfig as any).without(['space', 'showLabel', 'iconSize', 'iconStyle', 'vertical'])
        }
        return newConfig
      } else {
        return oldConfig
      }
    }
  }, {
    version: '1.1.0',
    description: 'Version manager for release 1.1.0',
    upgrader: (oldConfig) => {
      if (!oldConfig) return DEFAULT_CONFIG
      let card = oldConfig?.appearance?.card
      const variants = card?.variants
      const type = card?.avatar?.type
      let newConfig: IMConfig = oldConfig
      if (variants) {
        const variant = getThemeButtonVariant(variants, type)
        card = card?.set('variant', variant).without('variants')
        newConfig = newConfig.setIn(['appearance', 'card'], card)
      }
      return newConfig
    }
  }, {
    version: '1.6.0',
    description: 'Version manager for release 1.6.0',
    upgrader: (oldConfig) => {
      if (!oldConfig) return DEFAULT_CONFIG
      let card = oldConfig?.appearance?.card
      let newConfig: IMConfig = oldConfig
      if (card) {
        card = card.set('showTooltip', true)
        newConfig = newConfig.setIn(['appearance', 'card'], card)
      }
      return newConfig
    }
  }, {
    version: '1.14.0',
    description: 'Version manager for release 1.14.0',
    upgrader: (oldConfig) => {
      if (!oldConfig) return DEFAULT_CONFIG
      let card = oldConfig?.appearance?.card
      let newConfig: IMConfig = oldConfig
      if (card) {
        card = card.set('showIndicator', false)
        newConfig = newConfig.setIn(['appearance', 'card'], card)
      }
      return newConfig
    }
  }, {
    /**
     * Box shadow consists of five parts: color, offsetX, offsetY, blur, and spread.
     * `box-shadow: rgba(5, 5, 5, 0.23) 5px 5px 2px 1px`.
     *
     * Due to [a previously existing bug](https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/27792#issuecomment-5694958),
     * if the first few numeric parameters are not set, the later ones will shift forward to take their place.
     * For example, offsetX and offsetY are not set, blur 5px and spread 5px are set, and the final result is
     * `box-shadow: rgba(5, 5, 5, 0.23) 5px 5px`, with two 5px being used as offsetX and offsetY.
     *
     * In version 1.19.0, we fixed this bug. Therefore, when upgrading from an old version to 1.19.0,
     * we need to check the box shadow values and correct them if necessary.
     */
    version: '1.19.0',
    description: 'Version manager for release 1.19.0',
    upgrader: (oldConfig) => {
      if (!oldConfig) return DEFAULT_CONFIG
      const isIncompleteBoxShadow = (boxShadow: BoxShadowStyle) => {
        const { color, offsetX, offsetY, blur, spread } = boxShadow || {}
        return color && (!offsetX || !offsetY || !blur) && (offsetY || blur || spread)
      }
      const updateBoxShadow = (boxShadow: BoxShadowStyle) => {
        const { color, offsetX, offsetY, blur, spread } = boxShadow || {}
        const effectiveParams = [offsetX, offsetY, blur, spread].filter(param => !!param)
        const newBoxShadow = {
          color,
          offsetX: effectiveParams[0],
          offsetY: effectiveParams[1],
          blur: effectiveParams[2],
          spread: effectiveParams[3],
        }
        return newBoxShadow
      }
      let newConfig: IMConfig = oldConfig
      const buttonStates: Array<keyof ControllerButtonStylesByState> = ['default', 'hover', 'active']
      buttonStates.forEach(state => {
        const boxShadow = newConfig?.appearance?.card?.variant?.[state]?.boxShadow
        if (isIncompleteBoxShadow(boxShadow)) {
          const newBoxShadow = updateBoxShadow(boxShadow)
          newConfig = newConfig.setIn(['appearance', 'card', 'variant', state, 'boxShadow'], newBoxShadow)
        }
      })
      return newConfig
    }
  }]
}

export const versionManager:BaseVersionManager = new VersionManager()
