import { BaseVersionManager, type ThemeNavType, Immutable, type IMThemeNavVariant } from 'jimu-core'
import type { IMConfig } from './config'
import type { IMViewNavigationDisplay } from './runtime/components/view-navigation'
import type { NavigationVariant } from 'jimu-ui'

export const DEFAULT_CONFIG = {
  data: {
    type: 'AUTO',
    section: '',
    views: []
  },
  display: {
    advanced: false,
    vertical: false,
    navType: 'default',
    alignment: 'center',
    showText: true,
    showIcon: false,
    iconPosition: 'start'
  }
}

const upgradeThemeNavVariant = (variants, type: ThemeNavType): IMThemeNavVariant => {
  if (!variants) return
  const _variant = variants?.[type]
  if (!_variant) return
  let variant = _variant as IMThemeNavVariant
  if (_variant.bg) {
    variant = variant.setIn(['root', 'bg'], _variant.bg)
    variant = (variant as any).without('bg')
  }
  return variant
}

const upgradeOnePointOne = (oldConfig): IMConfig => {
  const config = oldConfig
  if (!oldConfig) return

  const _display = config.display
  if (!_display) return oldConfig

  let display = Immutable({}) as IMViewNavigationDisplay
  const variant = upgradeThemeNavVariant(_display.variants, _display.navType)
  display = display.set('type', 'nav')
    .set('vertical', _display.vertical)
    .set('advanced', _display.advanced)
    .set('navStyle', _display.navType)
    .set('standard', {
      scrollable: true,
      textAlign: _display.alignment,
      showText: _display.showText,
      showIcon: _display.showIcon,
      iconPosition: _display.iconPosition
    })
    .set('variant', variant)

  return config.set('display', display)
}

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.0.0',
    description: 'Version manager for release 1.0.0',
    upgrader: (oldConfig: IMConfig) => {
      if (!oldConfig) return DEFAULT_CONFIG

      let newConfig = oldConfig

      if ((oldConfig?.display as any)?.variants) {
        newConfig = newConfig.setIn(['display', 'advanced'], true)
      }

      return newConfig
    }
  }, {
    version: '1.1.0',
    description: 'Version manager for release 1.1.0',
    upgrader: (oldConfig: IMConfig) => {
      return upgradeOnePointOne(oldConfig || DEFAULT_CONFIG)
    }
  }, {
    version: '1.13.0',
    description: 'Change borderRadius from 50rem to 6.25rem in pills style',
    upgrader: (oldConfig: IMConfig) => {
      if (oldConfig?.display?.navStyle !== 'pills' || !oldConfig?.display?.advanced) return oldConfig

      let newConfig = oldConfig
      Object.keys((newConfig?.display?.variant as Immutable.ImmutableObject<NavigationVariant>)?.item || {}).forEach((key) => {
        if ((newConfig?.display?.variant as Immutable.ImmutableObject<NavigationVariant>)?.item?.[key]?.borderRadius === '50rem') {
          newConfig = newConfig.setIn(['display', 'variant', 'item', key, 'borderRadius'], '6.25rem')
        }
      })

      return newConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
