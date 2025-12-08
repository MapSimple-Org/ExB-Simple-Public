import {
  React,
  ReactRedux,
  type ThemeNavType,
  css,
  type ThemePaper,
  type IMPageJson,
  type ImmutableArray,
  type ImmutableObject,
  PageType,
  LinkType,
  type PageJson,
  Immutable,
  type IMState,
  BrowserSizeMode,
  polished,
  type ThemeButtonStylesByState,
  type LinkTarget
} from 'jimu-core'
import { getBoxStyles } from 'jimu-theme'

import {
  type NavigationItem,
  type AnchorDirection,
  type NavigationVariant,
  utils,
  type IconButtonStyles,
  type IconButtonStylesByState
} from 'jimu-ui'
import type { NavArrowColor } from '../config'
const { useState, useEffect, useMemo } = React
const { useSelector } = ReactRedux
const normalIcon = require('jimu-ui/lib/icons/toc-page.svg')
const linkIcon = require('jimu-ui/lib/icons/toc-link.svg')
const folderIcon = require('jimu-ui/lib/icons/toc-folder.svg')

const icons = {
  [PageType.Normal]: normalIcon,
  [PageType.Link]: linkIcon,
  [PageType.Folder]: folderIcon
}

interface PageStructureItem {
  [pageId: string]: string[]
}
type IMPageStructure = ImmutableArray<PageStructureItem>

interface Pages {
  [pageId: string]: PageJson
}
type IMpages = ImmutableObject<Pages>

/**
 * Filter out hidden pages
 * @param pageStructure
 * @param pages
 */
export const filterPageStructure = (
  pageStructure: IMPageStructure,
  pages: IMpages
): IMPageStructure => {
  pageStructure = pageStructure.filter(item => {
    const id = Object.keys(item)[0]
    const info = pages?.[id]
    return info.isVisible
  })

  return pageStructure.map(item => {
    const entries = Object.entries(item)[0]
    const id = entries[0]
    let subs = entries[1]
    subs = subs.filter(id => {
      const info = pages?.[id]
      return info.isVisible
    })
    return item.set(id, subs) as any
  })
}

/**
 * Generate the data of menu navigation
 * @param pageStructure
 * @param pages
 */
export const getMenuNavigationData = (
  pageStructure: IMPageStructure,
  pages: IMpages
): ImmutableArray<ImmutableObject<NavigationItem>> => {
  pageStructure = filterPageStructure(pageStructure, pages)
  return pageStructure.map(item => {
    const entries = Object.entries(item)[0]
    const id = entries[0]
    const subs = entries[1]
    const info = pages[id]
    const navItem = getMenuNavigationItem(info)

    const subNavItems = subs.map(subPageId => {
      const info = pages[subPageId]
      return getMenuNavigationItem(info)
    })
    return navItem.set('subs', subNavItems)
  })
}

const getMenuNavigationItem = (
  page: IMPageJson
): ImmutableObject<NavigationItem> => {
  const linkType = getLinkType(page)
  const value = getLinkValue(page)
  const icon = page.icon || icons[page.type]

  return Immutable({
    linkType,
    value,
    icon:
      Object.prototype.toString.call(icon) === '[object Object]'
        ? icon
        : utils.toIconResult(icon, page.type, 16),
    target: page.openTarget as LinkTarget,
    name: page.label
  })
}

const getLinkType = (page: IMPageJson) => {
  if (page.type === PageType.Link) {
    return LinkType.WebAddress
  } else if (page.type === PageType.Normal) {
    return LinkType.Page
  } else if (page.type === PageType.Folder) {
    return LinkType.None
  }
}

const getLinkValue = (page: IMPageJson) => {
  if (page.type === PageType.Link) {
    return page.linkUrl
  } else if (page.type === PageType.Normal) {
    return page.id
  } else if (page.type === PageType.Folder) {
    return '#'
  }
}

/**
 * Get page id from `NavigationItem`
 * @param item
 */
export const getPageId = (item: NavigationItem): string => {
  if (!item?.value) return ''
  const splits = item.value.split(',')
  return splits?.length ? splits[0] : ''
}

/**
 * Return a function to check navigation item is active or not
 */
export const useActivePage = () => {
  const currentPageId = useSelector(
    (state: IMState) => state?.appRuntimeInfo?.currentPageId
  )
  return React.useCallback(
    (item: NavigationItem) => {
      return getPageId(item) === currentPageId
    },
    [currentPageId]
  )
}

/**
 * Listen page info and update menu navigation data
 */
export const useNavigationData = (): NavigationItem[] => {
  const [data, setData] = useState<NavigationItem[]>([])
  const pages = useSelector((state: IMState) => state?.appConfig?.pages)
  const pageStructure = useSelector(
    (state: IMState) => state?.appConfig?.pageStructure
  )

  useEffect(() => {
    const data = getMenuNavigationData(pageStructure, pages)
    setData(data as any)
  }, [pages, pageStructure])

  return data
}

/**
 * When run in small device, set anchor as 'full'
 * @param anchor
 */
export const useAnchor = (anchor: AnchorDirection): AnchorDirection => {
  return useSelector((state: IMState) =>
    state?.browserSizeMode === BrowserSizeMode.Small ? 'full' : anchor
  )
}

const getSideBorderStyle = (state: IconButtonStyles) => {
  const { borderTop, borderBottom, borderLeft, borderRight } = state
  return css`
    ${borderTop && `
      border-top-width: ${borderTop.width};
      ${borderTop.width && `border-top-style: ${borderTop?.type ?? 'solid'};`}
      border-top-color: ${borderTop.color};
    `}
    ${borderBottom && `
      border-bottom-width: ${borderBottom.width};
      ${borderBottom.width && `border-bottom-style: ${borderBottom?.type ?? 'solid'};`}
      border-bottom-color: ${borderBottom.color};
    `}
    ${borderLeft && `
      border-left-width: ${borderLeft.width};
      ${borderLeft.width && `border-left-style: ${borderLeft?.type ?? 'solid'};`}
      border-left-color: ${borderLeft.color};
    `}
    ${borderRight && `
      border-right-width: ${borderRight.width};
      ${borderRight.width && `border-right-style: ${borderRight?.type ?? 'solid'};`}
      border-right-color: ${borderRight.color};
    `}
  `
}

const getNavLinkVariantStyles = (variant: ImmutableObject<NavigationVariant>) => {
  if (!variant?.item) {
    return null
  }
  const {
    default: defaultVars,
    hover,
    active
  } = variant.item as unknown as ImmutableObject<ThemeButtonStylesByState & IconButtonStylesByState>

  const hoverVars = defaultVars?.merge(hover || {}, { deep: true }) || hover
  const activeVars = defaultVars?.merge(active || {}, { deep: true }) || active
  return css`
    .nav-item>.nav-link {
      ${defaultVars && css`
        &:not(:hover):not(.active) {
          ${getBoxStyles(defaultVars)}
          ${getSideBorderStyle(defaultVars)}
          ${getIconAndFontSizeStyles(defaultVars)}
        }
      `}
      ${hoverVars && css`
        &:hover:not(.active) {
          ${getBoxStyles(hoverVars)}
          ${getSideBorderStyle(hoverVars)}
          ${getIconAndFontSizeStyles(hoverVars)}
        }
      `}
      ${activeVars && css`
        &:not(:disabled):not(.disabled).active {
          ${getBoxStyles(activeVars)}
          ${getSideBorderStyle(activeVars)}
          ${getIconAndFontSizeStyles(activeVars)}
        }
      `}
    }
  `
}

const getStylesForMenuStyle = (menuStyle: ThemeNavType, isVertical: boolean) => {
  const sideWithWidth = isVertical ? 'left' : 'bottom'
  const borderWidth = ['top', 'bottom', 'left', 'right'].map(side => {
    return sideWithWidth === side ? '' : `border-${side}-width: 0 !important;`
  }).join('')
  return menuStyle === 'underline' && css`
    &.nav-underline {
      ${borderWidth}
      .nav-link {
        ${borderWidth}
      }
      ${isVertical && `
        .nav-item {
          margin-left: -1px;
        }
      `
    }
  `
}

export const getIconAndFontSizeStyles = (state: IconButtonStyles) => {
  return css`
    font-size: ${state?.size ? `${polished.rem(state.size)}!important` : ''};
    ${state.icon && `.jimu-nav-link-wrapper > .jimu-icon, .jimu-icon-img {
      ${state?.icon?.size && `
        width: ${polished.rem(state.icon.size)};
        height: ${polished.rem(state.icon.size)};
      `};
      ${state?.icon?.color && `color: ${state.icon.color}`};
    }`}
 `
}

const getNavArrowColorStyles = (navArrowColor: ImmutableObject<NavArrowColor>) => {
  if (!navArrowColor) {
    return null
  }
  const { default: defaultColor, hover: hoverColor, disabled: disabledColor } = navArrowColor
  return css`
    .jimu-nav-button-group {
      .jimu-page-item {
        .direction-button {
          ${defaultColor && `&:not(:hover):not(:disabled) {
            color: ${defaultColor};
          }`}
          ${hoverColor && `&:hover {
            color: ${hoverColor};
          }`}
          ${disabledColor && `&:disabled {
            color: ${disabledColor};
          }`}
        }
      }
    }
  `
}

/**
 * Generate style to override the default style of navigation component
 * @param menuStyle
 * @param variant
 * @param vertical
 */
export const useNavAdvanceStyle = (
  advanced: boolean,
  menuStyle: ThemeNavType,
  variant: ImmutableObject<NavigationVariant>,
  vertical?: boolean,
  navArrowColor?: ImmutableObject<NavArrowColor>
) => {
  return useMemo(() => {
    if (!advanced) return null
    return css`
      &.menu-navigation {
        .jimu-nav,
        &.jimu-nav {
          ${variant?.root?.bg && `background-color: ${variant.root.bg};`}
          border-radius: ${variant?.root?.borderRadius || '0px'};
          ${getNavLinkVariantStyles(variant)}
          ${getStylesForMenuStyle(menuStyle, vertical)}
          ${getNavArrowColorStyles(navArrowColor)}
        }
      }
    `
  }, [advanced, menuStyle, navArrowColor, variant, vertical])
}

/**
 * Generate style to override the default style of drawer component
 * @param advanced
 * @param variant
 * @param paper
 */
export const useDrawerAdvanceStyle = (
  variant: ImmutableObject<NavigationVariant>,
  paper: ThemePaper
) => {
  const bg = paper?.bg
  const color = variant?.item?.default?.color

  return useMemo(() => {
    return css`
      .jimu-drawer-paper {
        background: ${bg || 'var(--sys-color-surface-overlay)'};
        .header {
          color: ${color || 'var(--sys-color-surface-overlay-text)'};
          padding: ${polished.rem(8)};
        }
        .nav-link:not(:hover):not(.active) {
          color: var(--sys-color-surface-overlay-text);
        }
      }
    `
  }, [bg, color])
}

/**
 * Set the style of nav under different devices for drawer menu
 * @param isInSmallDevice
 */
export const useNavigationStyleForDrawerMenu = (
  isInSmallDevice: boolean
) => {
  return useMemo(() => {
    const commonStyle = css`
      .jimu-nav-link-wrapper {
        text-overflow: ellipsis !important;
        overflow: hidden !important;
        white-space: nowrap;
      }
      .nav-link {
        text-decoration: none;
        &:hover {
          text-decoration: none;
        }
      }
    `
    if (!isInSmallDevice) {
      return css`
        &{
          min-width: ${polished.rem(240)};
          max-width: ${polished.rem(320)};
        }
        ${commonStyle}
      `
    }
    return commonStyle
  }, [isInSmallDevice])
}
