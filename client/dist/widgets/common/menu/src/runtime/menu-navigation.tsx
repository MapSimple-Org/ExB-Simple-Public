/** @jsx jsx */
import { React, jsx, type ThemeNavType, css, type ThemePaper, type ImmutableObject, hooks, type IMThemeVariables } from 'jimu-core'
import { Navigation, type NavigationVariant } from 'jimu-ui'
import { type DrawerMenuProps, DrawerMenu } from './drawer-menu'
import {
  useActivePage,
  useNavigationData,
  useAnchor,
  useNavAdvanceStyle
} from './utils'
import defaultMessage from './translations/default'
import type { NavArrowColor } from '../config'
import { getThemeModule, mapping } from 'jimu-theme'
const { useMemo } = React

export type MenuNavigationType = 'nav' | 'drawer'

export type MenuNavigationStandard = Omit<
DrawerMenuProps,
'advanced' | 'variant' | 'paper' | 'data'
> & {
  subMenu?: MenuNavigationStandard
}

export interface MenuNavigationProps {
  /**
   * Directions of navigation
   */
  vertical?: boolean
  /**
   * Type of navigation, optional values:  'nav' | 'drawer';
   */
  type: MenuNavigationType
  /**
   * Subtypes of each type
   * nav: 'default', 'underline', 'pills'
   * drawer: 'default'
   */
  menuStyle: ThemeNavType
  /**
   * Configurable parameters for `Navigation` and `DrawerMenu`
   */
  standard?: ImmutableObject<MenuNavigationStandard>
  /**
   * Whether to enable advanced style (override the style provided by the component in the widget)
   */
  advanced?: boolean

  paper?: ImmutableObject<ThemePaper>
  /**
   * Configurable variables in advanced style
   *
   */
  variant?: ImmutableObject<NavigationVariant>
  /**
   * Configurable arrow color for horizontal and vertical styles in advanced style
   */
  navArrowColor?: ImmutableObject<NavArrowColor>

  theme: IMThemeVariables
}

const useStyle = (vertical: boolean, isNewTheme: boolean, navVar: string, tertiaryButtonVar: string) => {
  return useMemo(() => {
    return css`
      width: 100%;
      height: 100%;
      max-width: 100vw;
      max-height: 100vh;
      ${isNewTheme ? '' : `
        ${navVar ? '' : `.nav-link:not(:hover):not(.active) {
          color: var(--sys-color-action-text);
        }`}
        .direction-button:not(:hover):not(.active):not(:disabled) {
          color: var(--sys-color-action-text);
        }
        .drawer-menu-button-container .jimu-btn {
          ${tertiaryButtonVar ? `color: ${tertiaryButtonVar};` : `color: var(--sys-color-action-text);`}
        }
      `}
      .nav-item {
        ${!vertical && `
          .nav-link:hover {
            position: relative;
            &::before {
              content: "";
              position: absolute;
              left: 0;
              right: 0;
              top: -1000px;
              bottom: 100%;
            }
            &::after {
              content: "";
              position: absolute;
              left: 0;
              right: 0;
              top: 100%;
              bottom: -1000px;
            }
          }
        `}
      }
    `
  }, [isNewTheme, navVar, tertiaryButtonVar, vertical])
}

export const MenuNavigation = (props: MenuNavigationProps) => {
  const {
    type,
    menuStyle,
    vertical,
    standard,
    advanced,
    paper,
    variant,
    navArrowColor,
    theme
  } = props

  const data = useNavigationData()
  const isActive = useActivePage()

  const { icon, anchor: _anchor, ...others } = standard.asMutable({ deep: true })
  const anchor = useAnchor(_anchor)

  const themeInfo = React.useMemo(() => {
    const themeModule = getThemeModule(theme?.uri)
    const isNewTheme = mapping.whetherIsNewTheme(themeModule)
    return {
      isNewTheme,
      navVar: type !== 'drawer' && !isNewTheme ? (themeModule?.variables as any)?.components?.nav?.variants?.[menuStyle]?.item?.default?.color as string || '' : '',
      tertiaryButtonVar: type === 'drawer' && !isNewTheme ? (themeModule?.variables as any)?.components?.button?.variants?.tertiary?.default?.color as string || '' : ''
    }
  }, [menuStyle, theme?.uri, type])

  const style = useStyle(vertical, themeInfo.isNewTheme, themeInfo.navVar, themeInfo.tertiaryButtonVar)

  const navStyle = useNavAdvanceStyle(advanced, menuStyle, variant, vertical, navArrowColor)

  const translate = hooks.useTranslation(defaultMessage)

  return (
    <div className='menu-navigation' css={[style, navStyle]}>
      {type === 'nav' && (
        <Navigation
          role={vertical ? 'menu' : 'menubar'}
          data={data}
          vertical={vertical}
          isActive={isActive}
          showTitle={true}
          isUseNativeTitle={true}
          scrollable
          right={true}
          {...others}
          type={menuStyle}
          aria-label={translate('_widgetLabel')}
        />
      )}
      {type === 'drawer' && (
        <DrawerMenu
          data={data}
          advanced={advanced}
          variant={variant}
          paper={paper}
          type={menuStyle}
          vertical={vertical}
          isActive={isActive}
          scrollable={false}
          icon={icon}
          anchor={anchor}
          {...others}
        />
      )}
    </div>
  )
}
