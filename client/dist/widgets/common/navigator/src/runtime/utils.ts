import {
  React, ReactRedux, type IMState, type ImmutableArray, css, polished, appActions, type SectionNavInfo,
  Immutable, type ThemeSliderVariant, LinkType, lodash, getIndexFromProgress, getAppStore, LayoutItemType, hooks, jimuHistory,
  type ThemeButtonStylesByState,
  type ThemeNavType,
  type ThemeNavButtonGroupVariant,
  type IMAppConfig,
  AppMode,
  type ImmutableObject,
  BrowserSizeMode,
  i18n
} from 'jimu-core'
import { type NavArrowColor, ViewType } from '../config'
import type { ViewNavigationType, ViewNavigationDisplay, IMViewNavigationDisplay, ViewNavigationVariant } from './components/view-navigation'
import {
  type NavigationItem, type NavigationVariant, type NavIconButtonGroupVariant,
  type IconPosition, utils, TextAlignValue, defaultMessages as jimuDefaultMessage,
  type IconButtonStyles,
  type IconButtonStylesByState
} from 'jimu-ui'
import { searchUtils } from 'jimu-layouts/layout-runtime'
import widgetSectionViewOutlinedIcon from 'jimu-icons/svg/outlined/brand/widget-section-view.svg'
import { isInSymbolStyle } from '../utils'
import { getBoxStyles } from 'jimu-theme'
import type { AppConfigAction } from 'jimu-for-builder'
import defaultMessages from './translations/default'
const { useEffect, useMemo, useCallback } = React
const { useSelector, useDispatch } = ReactRedux
const dotIcon = require('jimu-ui/lib/icons/navigation/dot.svg')
const leftArrowIcon = require('jimu-icons/svg/outlined/directional/left.svg')
const rightArrowIcon = require('jimu-icons/svg/outlined/directional/right.svg')
const MIN_SIZE = 16

const addFloatNumber = (base: number, increase: number): number => {
  const magnification = 100
  const baseInt = base * magnification
  const increaseInt = increase * magnification
  return (baseInt + increaseInt) / magnification
}

export const useWidgetStyle = (vertical: boolean) => {
  return useMemo(() => {
    return css`
      overflow: hidden;
      min-height: ${vertical ? polished.rem(MIN_SIZE) : 'unset'};
      min-width: ${!vertical ? polished.rem(MIN_SIZE) : 'unset'};
      max-width: 100vw;
      max-height: 100vh;
    `
  }, [vertical])
}

export const useContainerSections = (id: string): string[] => {
  const layouts = ReactRedux.useSelector((state: IMState) => state?.appConfig?.layouts)

  const sections = ReactRedux.useSelector((state: IMState) => state?.appConfig?.sections)

  const sizeMode = ReactRedux.useSelector((state: IMState) => state?.browserSizeMode)

  const mainSizeMode = ReactRedux.useSelector((state: IMState) => state?.appConfig.mainSizeMode)

  return React.useMemo(() => {
    const appConfig = getAppStore().getState().appConfig
    const containerSectionsInsizeMode = searchUtils.getContentsInTheSameContainer(appConfig, id, LayoutItemType.Widget, LayoutItemType.Section, sizeMode)
    if (containerSectionsInsizeMode && containerSectionsInsizeMode.length > 0) {
      return containerSectionsInsizeMode
    }
    const containerSectionsInMainSizeMode = searchUtils.getContentsInTheSameContainer(appConfig, id, LayoutItemType.Widget, LayoutItemType.Section, mainSizeMode)
    return containerSectionsInMainSizeMode || []
    // We listen for changes in appConfig.sections and appConfig.layouts instead of appConfig, which can reduce the number of times we re render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sizeMode, sections, layouts])
}

/**
 * Get currentPageId from appRuntimeInfo or get defaultPageId from appConfig.pages
 * @param pages
 */
const useCurrentPageId = () => {
  return useSelector((state: IMState) => {
    const pages = state.appConfig.pages
    const defaultPageId = Object.keys(pages).find(pId => pages?.[pId]?.isDefault)
    const currentPageId = state.appRuntimeInfo.currentPageId
    return currentPageId || defaultPageId
  })
}
/**
 * Get view id from NavigationItem
 * @param item
 */
export const getViewId = (item: NavigationItem): string => {
  if (!item?.value) return ''
  const splits = item.value.split(',')
  return splits?.length ? splits[1] : ''
}

/**
 * When the views of specified section changed, trigger a callback function
 * @param section
 * @param callback
 */
export const useSectionViewsChange = (section: string, callback: (views?: ImmutableArray<string>) => void) => {
  const views = useSelector((state: IMState) => state?.appConfig?.sections?.[section]?.views)
  const { current: isInBuilder } = React.useRef(getAppStore().getState().appContext.isInBuilder)
  const callbackRef = hooks.useLatest(callback)
  useEffect(() => {
    isInBuilder && callbackRef.current?.(views)
  }, [views, callbackRef, isInBuilder])
}

/**
 * When widget container sections changed, trigger a callback function
 * @param id Widget id
 * @param callback
 */
export const useContainerSectionChange = (id: string, callback: (sections: string[]) => void) => {
  const sections = useContainerSections(id)
  const callbackRef = hooks.useLatest(callback)
  const { current: isInBuilder } = React.useRef(getAppStore().getState().appContext.isInBuilder)
  //When the sections are changed, check whether the current section is in the sections.
  //If not, set the sections[0] as config.data.section
  useEffect(() => {
    isInBuilder && callbackRef.current?.(sections)
  }, [sections, isInBuilder, callbackRef])
}

/**
 * Get next(previous) `SectionNavInfo`
 * @param section
 * @param nextViewId
 */
const getNextNavInfo = (previous: boolean, currentViewId: string, visibleViews: ImmutableArray<string>, views: ImmutableArray<string> = Immutable([])): SectionNavInfo => {
  let currentIndex = views.indexOf(currentViewId)
  currentIndex = currentIndex === -1 ? 0 : currentIndex
  const nextIndex = previous ? Math.max(0, currentIndex - 1) : Math.min(views.length - 1, currentIndex + 1)
  const nextViewId = views[nextIndex]

  return Immutable({ visibleViews }).set('previousViewId', currentViewId)
    .set('currentViewId', nextViewId)
    .set('useProgress', false)
    .set('progress', views.indexOf(nextViewId) / (views.length - 1)) as any
}

/**
 * Return a function to change `SectionNavInfo` with previous or next view id(when step is 1) or progress (when step is 0 - 1)
 * @param section
 */
export const useSwitchView = (section: string) => {
  const dispatch = useDispatch()
  return useCallback((previous: boolean, step: number) => {
    const state = getAppStore()?.getState()
    const views = state.appConfig.sections?.[section]?.views
    const sectionNavInfo = state?.appRuntimeInfo?.sectionNavInfos?.[section]
    const currentViewId = sectionNavInfo?.currentViewId || views[0]
    const visibleViews = sectionNavInfo?.visibleViews || views
    const progress = sectionNavInfo?.progress ?? 0

    let nextNavInfo: SectionNavInfo = null

    if (!state.appConfig?.sections?.[section]?.transition || state.appConfig?.sections?.[section]?.transition?.type === 'None') {
      step = Math.ceil(step)
    }
    if (step === 1) {
      nextNavInfo = getNextNavInfo(previous, currentViewId, views, visibleViews)
    } else {
      const nextProgress = previous ? Math.max(addFloatNumber(progress, -(step / (views.length - 1))), 0) : Math.min(addFloatNumber(progress, step / (views.length - 1)), 1)
      nextNavInfo = getProgressNavInfo(nextProgress, views, visibleViews)
    }
    dispatch(appActions.sectionNavInfoChanged(section, nextNavInfo))
    jimuHistory.changeViewBySectionNavInfo(section, nextNavInfo)
    return nextNavInfo
  }, [dispatch, section])
}

/**
 * Get `SectionNavInfo` by new progress
 * @param section
 * @param progress
 */
export const getProgressNavInfo = (progress: number, visibleViews: ImmutableArray<string>, views: ImmutableArray<string> = Immutable([])): SectionNavInfo => {
  const result = getIndexFromProgress(progress, views.length)

  return Immutable({ visibleViews }).set('previousViewId', views[result.previousIndex])
    .set('currentViewId', views[result.currentIndex])
    .set('useProgress', true)
    .set('progress', progress) as any
}

/**
 * Return a function to change `SectionNavInfo` by new progress
 * @param section
 */
export const useUpdateProgress = (section: string) => {
  const dispatch = useDispatch()
  return useCallback((progress: number) => {
    const state = getAppStore()?.getState()
    const views = state.appConfig.sections?.[section]?.views
    const visibleViews = state.appRuntimeInfo?.sectionNavInfos?.[section]?.visibleViews
    const nevInfo = getProgressNavInfo(progress, views, visibleViews)
    dispatch(appActions.sectionNavInfoChanged(section, nevInfo))
    return nevInfo
  }, [dispatch, section])
}

/**
 * Generate component styles to override the default
 * @param type
 * @param navStyle
 * @param advanced
 * @param variant
 * @param vertical
 */
// eslint-disable-next-line max-params
export const useAdvanceStyle = (type: ViewNavigationType, navStyle: string, advanced: boolean, variant: ImmutableObject<ViewNavigationVariant>, vertical?: boolean, hideThumb?: boolean, navArrowColor?: ImmutableObject<NavArrowColor>) => {
  return useMemo(() => {
    const isRTL = getAppStore()?.getState()?.appContext?.isRTL
    if (type === 'slider') return sliderAdvanceStyle(variant as ImmutableObject<ThemeSliderVariant>, hideThumb, isRTL)

    if (!advanced) return null

    if (type === 'nav') return navAdvanceStyle(navStyle, variant as ImmutableObject<NavigationVariant>, vertical, navArrowColor)
    if (type === 'navButtonGroup') return navButtonGroupAdvanceStyle(variant as ImmutableObject<NavIconButtonGroupVariant>)
    return null
  }, [advanced, variant, type, navStyle, vertical, navArrowColor, hideThumb])
}

export const useContainerPaddingStyle = (type: ViewNavigationType) => {
  return useMemo(() => {
    return css`
      ${type === 'slider' && 'padding: 0.625rem 0.25rem;'}
      .nav-button-group >.direction-button {
        &:focus,
        &:focus-visible {
          outline-offset: -2px;
        }
      }
    `
  }, [type])
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
        &:not(:hover):not(.active):not(:disabled):not(.disabled) {
          ${getBoxStyles(defaultVars)}
          ${getSideBorderStyle(defaultVars)}
        }
      `};
      ${hoverVars && css`
        &:hover:not(.active),
        &[aria-expanded="true"] {
          ${getBoxStyles(hoverVars)};
          ${getSideBorderStyle(hoverVars)}
        }
      `}
      ${activeVars && css`
        &:not(:disabled):not(.disabled).active {
          ${getBoxStyles(activeVars)}
          ${getSideBorderStyle(activeVars)}
        }
      `}
    }
  `
}

const getStylesForNavStyle = (navType: ThemeNavType, isVertical: boolean) => {
  const sideWithWidth = isVertical ? 'right' : 'bottom'
  const borderWidth = ['top', 'bottom', 'left', 'right'].map(side => {
    return sideWithWidth === side ? '' : `border-${side}-width: 0 !important;`
  }).join('')
  return css`
    ${navType === 'underline' && `
      &.nav-underline {
        ${borderWidth}
        .nav-link {
          ${borderWidth}
        }
        ${isVertical && `
          .nav-item {
            margin-right: -1px;
          }
          .nav-link {
            ${borderWidth}
          }
        `
      }
    `}
  `
}

export const getIconAndFontSizeStyle = (state: IconButtonStyles, useForNavLink?: boolean) => {
  const className = useForNavLink ? '.jimu-nav-link-wrapper' : '&.direction-button'
  return `
    font-size: ${state?.size ? `${polished.rem(state.size)}!important` : ''};
    ${state.icon && `${className} > .jimu-icon, .jimu-icon-img {
      ${state?.icon?.size && `
        width: ${polished.rem(state.icon.size)};
        height: ${polished.rem(state.icon.size)};
      `};
      ${state?.icon?.color && `color: ${state.icon.color}`};
    }`}
 `
}

const getButtonStyleByState = (variant: ImmutableObject<NavigationVariant>, useForNavLink?: boolean) => {
  if (!variant) {
    return
  }
  const regular = variant?.item?.default
  const hover = regular?.merge(variant?.item?.hover || {}, { deep: true }) || variant?.item?.hover
  const active = regular?.merge(variant?.item?.active || {}, { deep: true }) || variant?.item?.active
  const disabled = variant?.item?.disabled
  return css`
    .jimu-button {
      ${regular && `&:not(:hover):not(.active):not(:disabled):not(.disabled) {
        ${getIconAndFontSizeStyle(regular, useForNavLink)}
      }`}
      ${hover && `&:not(:disabled):not(.disabled):hover {
        ${getIconAndFontSizeStyle(hover, useForNavLink)}
      }`}
      ${active && `
        &:not(:disabled):not(.disabled).active,
        &[aria-expanded="true"] {
          ${getIconAndFontSizeStyle(active, useForNavLink)}
        }
        &:not(:disabled):not(.disabled) {
          cursor: pointer;
        }
      `}
      ${disabled && `
        &.disabled,
        &:disabled {
          ${getIconAndFontSizeStyle(disabled, useForNavLink)}
        }
      `}
    }
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

const navAdvanceStyle = (navStyle: string, variant: ImmutableObject<NavigationVariant>, vertical?: boolean, navArrowColor?: ImmutableObject<NavArrowColor>) => {
  return css`
    .jimu-nav{
      ${variant?.root?.bg && `background-color: ${variant.root.bg};`}
      border-radius: ${variant?.root?.borderRadius || '0px'};
      ${getNavLinkVariantStyles(variant)}
      ${getStylesForNavStyle(navStyle as ThemeNavType, vertical)}
      ${getButtonStyleByState(variant, true)}
      ${getNavArrowColorStyles(navArrowColor)}
    }
`
}

const getNavButtonGroupVariantStyles = (variant: ImmutableObject<ThemeNavButtonGroupVariant>) => {
  if (!variant?.item) {
    return null
  }
  const {
    default: defaultVars,
    hover,
    disabled: disabledVars
  } = variant.item as ImmutableObject<ThemeButtonStylesByState & IconButtonStylesByState>

  const hoverVars = defaultVars?.merge(hover || {}, { deep: true }) || hover

  return css`
    ${defaultVars && css`
      &:not(:hover):not(:disabled):not(.disabled) {
        ${getBoxStyles(defaultVars)}
        ${getSideBorderStyle(defaultVars)}
      }
    `};
    ${hoverVars && css`
      &:hover:not(:disabled):not(.disabled),
      &[aria-expanded="true"] {
        ${getBoxStyles(hoverVars)};
        ${getSideBorderStyle(hoverVars)}
      }
    `}
    ${disabledVars && css`
      &.disabled,
      &:disabled {
        &,
        &:hover {
          ${getBoxStyles(disabledVars)}
          ${getSideBorderStyle(disabledVars)}
        }
      }`
    }
  `
}

const navButtonGroupAdvanceStyle = (variant: ImmutableObject<NavIconButtonGroupVariant>) => {
  return css`
    .nav-button-group {
      ${variant?.root?.bg && `background-color: ${variant.root.bg};`}
      .jimu-button {
        &.previous,
        &.next {
          ${variant?.item && getNavButtonGroupVariantStyles(variant as unknown as ImmutableObject<ThemeNavButtonGroupVariant>)}
        }
      }
      ${getButtonStyleByState(variant, false)}
    }
 `
}

const sliderAdvanceStyle = (variant: ImmutableObject<ThemeSliderVariant>, hideThumb: boolean, isRTL?: boolean) => {
  const { track, thumb, progress } = variant || {}
  const trackBg = track?.bg || 'var(--sys-color-divider-secondary)'
  const thumbBg = thumb?.default?.bg || 'var(--sys-color-primary-text)'
  const thumbBorderColor = thumb?.default?.border?.color || 'var(--sys-color-action-selected)'
  const progressBg = progress?.default?.bg || 'var(--sys-color-action-selected)'
  const thumbStyle = `
    visibility: ${hideThumb ? 'hidden' : 'visible'};
    background-color: ${thumbBg};
    border-width: 2px;
    border-style: solid;
    border-color: ${thumbBorderColor};
    box-sizing: border-box;
    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out; /* $btn-transition */
    &:hover {
      border-color: ${progressBg};
    }
  `
  return css`
    ${variant?.root?.bg && `background-color: ${variant.root.bg};`}
    .jimu-slider {
      display: block;
      width: 100%;
      -webkit-appearance: none;
      -moz-appearance: none;
      &:focus,
      &:active {
        outline: none;
      }
      &::-moz-focus-outer {
        border: none;
        outline: none;
      }
      padding: 0;
      cursor: pointer;
      &.rtl {
        transform: rotate(180deg);
      }

      &[type="range"] {
      /* thumb - webkit */
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        ${thumbStyle}
      }
      /* thumb - moz */
      &::-moz-range-thumb {
        -moz-appearance: none;
        ${thumbStyle}
      }
      /* thumb - ms */
      &::-ms-thumb {
        margin-top: 0;
        ${thumbStyle}
      }
      /* track - webkit */
      &::-webkit-slider-runnable-track {
        border-radius: 50rem;
        background: linear-gradient(to ${isRTL ? 'left' : 'right'}, ${progressBg}, ${progressBg}) ${trackBg} no-repeat left;
        background-size: 50% 100%, 100% 100%;
      }
      /* track - moz */
      &::-moz-range-track {
        border-radius: 50rem;
        background-color: ${trackBg};
      }
      /* track - ms */
      &::-ms-track {
        border-radius: 50rem;
        background-color: ${trackBg};
      }
      /* fill - moz */
      &::-moz-range-progress {
        border-radius: 50rem;
        background-color: ${progressBg};
      }
      /* fill - ms */
      &::-ms-fill-lower {
        border-radius: 50rem;
        background-color: ${progressBg};
      }
      &::-ms-fill-upper {
        display: none;
      }
      /* tooltip - ms */
      &::-ms-tooltip {
        display: none;
      }
      &:focus {
        &::-webkit-slider-thumb {
          box-shadow: 0 0 0 2px ${thumbBg}, 0 0 0 3px ${thumbBorderColor};
        }
        &::-moz-range-thumb {
          box-shadow: 0 0 0 2px ${thumbBg}, 0 0 0 3px ${thumbBorderColor};
        }
      }
    }
  }
 `
}
/**
 * When the container sections are changed, check whether the current section is in the sections,
 * if not, set the sections[0] as  config.data.section
 * @param id
 * @param config
 * @param getAppConfigAction
 */
export const useHandleSectionsChange = (id: string, getAppConfigAction: (appConfig?: IMAppConfig) => AppConfigAction) => {
  return useCallback((sections: string[]) => {
    const config = getAppStore().getState().appConfig.widgets[id].config
    const section = config?.data?.section
    if (!sections?.includes(section)) {
      if (!section && !sections?.[0]) return
      getAppConfigAction().editWidgetProperty(id, 'config', config.setIn(['data', 'section'], sections?.[0])).exec(false)
    }
  }, [getAppConfigAction, id])
}

/**
 * When views changed, if `ViewType` is `auto`, set all views to config
 * if `custom` and `config.views` is in current views, keep them, otherwise, clear config.views
 * @param id
 * @param config
 * @param getAppConfigAction
 */
export const useHandleViewsChange = (id: string, getAppConfigAction: (appConfig?: IMAppConfig) => AppConfigAction) => {
  return useCallback((views: string[] | ImmutableArray<string>) => {
    const config = getAppStore().getState().appConfig.widgets[id].config
    const viewType = config?.data?.type
    if (viewType === ViewType.Auto) {
      return
    }
    const vs = config?.data?.views?.filter(view => views?.includes(view))
    if (!vs?.length && !config?.data?.views?.length) return
    if (!lodash.isDeepEqual(vs, config?.data?.views)) {
      getAppConfigAction().editWidgetProperty(id, 'config', config.setIn(['data', 'views'], vs)).exec(false)
    }
  }, [getAppConfigAction, id])
}

/**
 * Generate navigation data by view ids
 * @param views
 */
export const useNavigationLinks = (views: ImmutableArray<string>, display: IMViewNavigationDisplay): ImmutableArray<NavigationItem> => {
  const viewJsons = useSelector((state: IMState) => state.appConfig.views)
  const pageId = useCurrentPageId()

  return React.useMemo(() => {
    return views?.map((view: string) => {
      const label = viewJsons?.[view]?.label
      const icon = viewJsons?.[view]?.icon || utils.toIconResult(widgetSectionViewOutlinedIcon, '', 16)
      return {
        name: label,
        linkType: LinkType.View,
        value: `${pageId},${view}`,
        // symbol style do not need icon
        icon: isInSymbolStyle(display) ? undefined : icon,
        navLinkAriaControls: `${viewJsons?.[view]?.parent}_${view}`
      } as NavigationItem
    }) ?? Immutable([])
  }, [display, pageId, viewJsons, views])
}

/**
 * When the type is `ViewType.Auto`, we use the latest section views. Otherwise, we use the views of config
 * @param section
 * @param configViews
 * @param type
 */
export const useNavigationViews = (section: string, configViews: ImmutableArray<string>, type: ViewType): ImmutableArray<string> => {
  const views = useSelector((state: IMState) => {
    if (state?.appStateInBuilder) {
      return state?.appStateInBuilder?.appConfig?.sections?.[section]?.views
    }
    return state?.appConfig?.sections?.[section]?.views
  })
  return React.useMemo(() => {
    const _Views = ((type === ViewType.Custom ? configViews : views) || Immutable([])).asMutable()
    _Views.sort((a, b) => {
      return views?.indexOf(a) - views?.indexOf(b)
    })
    return Immutable(_Views)
  }, [configViews, views, type])
}

export const useViewsWithLabel = (views: ImmutableArray<string>) => {
  const allViews = useSelector((state: IMState) => {
    if (state?.appStateInBuilder) {
      return state?.appStateInBuilder?.appConfig?.views
    }
    return state?.appConfig?.views
  })
  return React.useMemo(() => {
    return views.asMutable({ deep: true }).map((view) => {
      return {
        id: view,
        label: allViews[view]?.label
      }
    })
  }, [views, allViews])
}

/**
 * Generate a key for a view navigation config
 * @param display
 */
export const generateDisplayKey = (display: Partial<ViewNavigationDisplay>) => {
  const { type, navStyle } = display || {}
  const { showIcon, showText, alternateIcon, showPageNumber } = display?.standard ?? {}

  if (type === 'nav') {
    const { filename } = alternateIcon?.properties ?? {}
    return `${type}-${navStyle}-${showIcon ? 'showIcon' : 'hideIcon'}-${showText ? 'showText' : 'hideText'}-icon-${filename}`
  } else if (type === 'navButtonGroup') {
    return `${type}-${navStyle}-${showPageNumber ? 'showPageNumber' : ''}`
  }
}

export type NavTemplate = Partial<ViewNavigationDisplay> & {
  label: string
}

/**
 * Generate view navigation display array for quick-style
 */
export const useNavTemplates = (widgetId: string): NavTemplate[] => {
  const intl = i18n.getIntl(widgetId, 'runtime')
  const translate = React.useCallback((id) => {
    return intl.formatMessage({ id, defaultMessage: jimuDefaultMessage[id] || defaultMessages[id] })
  }, [intl])
  const leftArrowCustomIcon = utils.toIconResult(leftArrowIcon, translate('arrowLeft'), 16)
  leftArrowCustomIcon.properties.originalName = 'outlined/directional/left.svg'

  const rightArrowCustomIcon = utils.toIconResult(rightArrowIcon, translate('arrowRight'), 16)
  rightArrowCustomIcon.properties.originalName = 'outlined/directional/right.svg'

  const dotCustomIcon = utils.toIconResult(dotIcon, translate('drawToolDot'), 8)
  return useMemo(() => {
    return [{
      label: translate('tabDefault'),
      type: 'nav',
      navStyle: 'default',
      standard: {
        gap: '0px',
        scrollable: true,
        showIcon: false,
        showText: true,
        iconPosition: 'start' as IconPosition,
        textAlign: TextAlignValue.CENTER
      }
    }, {
      label: translate('tabUnderline'),
      type: 'nav',
      navStyle: 'underline',
      standard: {
        gap: '0px',
        scrollable: true,
        showIcon: false,
        showText: true,
        iconPosition: 'start' as IconPosition,
        textAlign: TextAlignValue.CENTER
      }
    }, {
      label: translate('tabPills'),
      type: 'nav',
      navStyle: 'pills',
      standard: {
        gap: '0px',
        scrollable: true,
        showIcon: false,
        showText: true,
        iconPosition: 'start' as IconPosition,
        textAlign: TextAlignValue.CENTER
      }
    }, {
      label: translate('symbol'),
      type: 'nav',
      navStyle: 'default',
      standard: {
        scrollable: false,
        gap: '10px',
        showIcon: true,
        alternateIcon: dotCustomIcon,
        activedIcon: dotCustomIcon,
        showText: false,
        iconPosition: 'start' as IconPosition,
        textAlign: TextAlignValue.CENTER
      }
    }, {
      label: translate('slider'),
      type: 'slider',
      navStyle: 'default'

    }, {
      label: translate('arrow1'),
      type: 'navButtonGroup',
      navStyle: 'default',
      standard: {
        showPageNumber: true,
        previousText: '',
        previousIcon: leftArrowCustomIcon,
        nextText: '',
        nextIcon: rightArrowCustomIcon
      }
    }, {
      label: translate('arrow2'),
      type: 'navButtonGroup',
      navStyle: 'tertiary',
      standard: {
        previousText: translate('prev'),
        previousIcon: leftArrowCustomIcon,
        nextText: translate('next'),
        nextIcon: rightArrowCustomIcon
      }
    }, {
      label: translate('arrow3'),
      type: 'navButtonGroup',
      navStyle: 'tertiary',
      standard: {
        showPageNumber: true,
        previousText: '',
        previousIcon: leftArrowCustomIcon,
        nextText: '',
        nextIcon: rightArrowCustomIcon
      }
    }]
  }, [translate, dotCustomIcon, leftArrowCustomIcon, rightArrowCustomIcon])
}

export const useHandleViewsLayoutChangeInExpressMode = (section: string, getAppConfigAction: (appConfig?: IMAppConfig) => AppConfigAction) => {
  const layouts = useSelector((state: IMState) => state?.appConfig?.layouts)
  const sectionViewIds = useSelector((state: IMState) => state?.appConfig?.sections?.[section]?.views)
  const allViews = useSelector((state: IMState) => state?.appConfig?.views)
  const allWidgets = useSelector((state: IMState) => state?.appConfig?.widgets)

  const isExpressMode = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode === AppMode.Express)

  const viewsNeedUpdate = React.useMemo(() => {
    if (!isExpressMode) {
      return []
    }
    const sectionViews = sectionViewIds.map((id) => allViews[id])
    return sectionViews.filter((viewJson) => {
      const { layout, label: viewLabel } = viewJson
      const [largeLayoutHasWidget, mediumLayoutHasWidget, smallLayoutHasWidget] = [BrowserSizeMode.Large, BrowserSizeMode.Medium, BrowserSizeMode.Small].map((sizeMode) => {
        const layoutItems = Object.values(layouts[layout[sizeMode]]?.content || {})
        if (!layoutItems.length) {
          return false
        }
        return layoutItems.every((item) => item.type === LayoutItemType.Widget && item.widgetId)
      })
      if (largeLayoutHasWidget && mediumLayoutHasWidget && smallLayoutHasWidget) {
        // no icon means newly added widget, need update the view icon and label
        if (!viewJson.icon) {
          return true
        }
        const viewLayoutsIds = Object.values(layout || {})
        // if view label not match with widget label, need update the view label
        let labelNotMatch = false
        viewLayoutsIds.forEach((layoutId) => {
          const layoutItems = Object.values(layouts[layoutId]?.content || {})
          layoutItems.filter((item) => item.widgetId).forEach((layoutItem) => {
            const widgetLabel = allWidgets[layoutItem.widgetId]?.label
            // no icon means newly added widget, no need to update here
            if (viewLabel && widgetLabel && viewJson.icon && viewLabel !== widgetLabel) {
              labelNotMatch = true
            }
          })
        })
        return labelNotMatch
      }
      return false
    })
  }, [allViews, allWidgets, isExpressMode, layouts, sectionViewIds])

  React.useEffect(() => {
    if (!viewsNeedUpdate.length) {
      return
    }
    const appConfigAction = getAppConfigAction()
    let needUpdate = false
    viewsNeedUpdate.forEach((viewJson) => {
      const { layout, id: viewId, icon: viewIcon } = viewJson
      const firstLayoutContent = layouts[layout[Object.keys(layout)[0]]]?.content
      if (firstLayoutContent) {
        const firstLayoutItemId = Object.values(firstLayoutContent)?.[0]?.id
        const widgetId = layouts[layout[Object.keys(layout)[0]]]?.content?.[firstLayoutItemId]?.widgetId
        const { label, icon } = getAppStore().getState().appConfig.widgets?.[widgetId] || {}
        needUpdate = true
        if (!viewIcon) {
          appConfigAction
            .editViewProperty(viewId, 'icon', { svg: icon as any, properties: { filename: label } })
            .editViewProperty(viewId, 'label', label)
        } else {
          appConfigAction.editViewProperty(viewId, 'label', label)
        }
      }
    })
    if (needUpdate) {
      appConfigAction.exec()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewsNeedUpdate])
}
