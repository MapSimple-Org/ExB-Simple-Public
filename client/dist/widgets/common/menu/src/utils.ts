import { Immutable } from 'jimu-core'
import { MenuType, type IMConfig } from './config'
import React from 'react'
import type { MenuNavigationStandard } from './runtime/menu-navigation'

export function getDefaultIconForIconMenu (translate: (id: string, values?: any) => string) {
  return {
    svg: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" class="css-1i7frhi jimu-icon"><path d="M2 1a1 1 0 100 2h12a1 1 0 100-2H2zm0-1h12a2 2 0 010 4H2a2 2 0 010-4zm0 7a1 1 0 100 2h12a1 1 0 100-2H2zm0-1h12a2 2 0 010 4H2a2 2 0 010-4zm0 7a1 1 0 100 2h12a1 1 0 100-2H2zm0-1h12a2 2 0 010 4H2a2 2 0 010-4z" fill="currentColor" fill-rule="nonzero"></path></svg>',
    properties: {
      color: 'inherit',
      size: 20,
      inlineSvg: true,
      filename: translate('menu')
    }
  }
}

export function getEssentialDefaultWidgetConfigByType (menuType: MenuType = MenuType.Horizontal) {
  switch (menuType) {
    case MenuType.Horizontal:
      return {
        type: 'nav',
        vertical: false
      }
    case MenuType.Vertical:
      return {
        type: 'nav',
        vertical: true
      }
    case MenuType.Icon:
      return {
        type: 'drawer'
      }
  }
}

export function getDefaultValueForStandardContent (key: keyof MenuNavigationStandard) {
  switch (key) {
    case 'anchor':
      return 'left'
    case 'textAlign':
      return 'center'
    case 'showIcon':
      return false
    case 'gap':
      return '0px'
    case 'submenuMode':
      return 'foldable'
    default:
      return null
  }
}

export function getFullDefaultWidgetConfigByType (menuType: MenuType = MenuType.Horizontal, translate: (id: string, values?: any) => string) {
  switch (menuType) {
    case MenuType.Horizontal:
      return Immutable({
        type: 'nav',
        menuStyle: 'default',
        vertical: false,
        advanced: false,
        standard: {
          gap: getDefaultValueForStandardContent('gap'),
          textAlign: getDefaultValueForStandardContent('textAlign')
        }
      }) as IMConfig
    case MenuType.Vertical:
      return Immutable({
        type: 'nav',
        menuStyle: 'default',
        vertical: true,
        advanced: false,
        standard: {
          submenuMode: getDefaultValueForStandardContent('submenuMode'),
          gap: getDefaultValueForStandardContent('gap'),
          textAlign: getDefaultValueForStandardContent('textAlign')
        }
      }) as IMConfig
    case MenuType.Icon:
      return Immutable({
        type: 'drawer',
        menuStyle: 'default',
        vertical: true,
        advanced: false,
        standard: {
          anchor: getDefaultValueForStandardContent('anchor'),
          submenuMode: getDefaultValueForStandardContent('submenuMode'),
          icon: getDefaultIconForIconMenu(translate),
          gap: getDefaultValueForStandardContent('gap'),
          textAlign: getDefaultValueForStandardContent('textAlign')
        }
      }) as IMConfig
  }
}

export const useFullConfig = (config: IMConfig, menuType: MenuType, translate: (id: string, values?: any) => string) => {
  return React.useMemo(() => {
    return getFullDefaultWidgetConfigByType(menuType, translate).merge(config, { deep: true })
  }, [config, menuType, translate])
}

export const useMenuType = (config: IMConfig) => {
  return React.useMemo(() => {
    return config.type === 'drawer'
      ? MenuType.Icon
      : config.vertical
        ? MenuType.Vertical
        : MenuType.Horizontal
  }, [config.type, config.vertical])
}
