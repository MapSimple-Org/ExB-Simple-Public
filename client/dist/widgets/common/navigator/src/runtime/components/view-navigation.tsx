/** @jsx jsx */
import { React, classNames, jsx, css, type ThemeSliderVariant, type ImmutableObject, lodash, type ImmutableArray, hooks, type IMThemeVariables } from 'jimu-core'
import {
  NavButtonGroup, PageNumber, Navigation, Slider, type NavigationItem, type NavButtonGroupProps, type NavigationProps,
  type SliderProps, type PageNumberProps, type PaginationProps, type NavigationVariant, type NavIconButtonGroupVariant,
  defaultMessages as jimuUIDefaultMessages
} from 'jimu-ui'
import { getViewId, useAdvanceStyle, useContainerPaddingStyle } from '../utils'
import { isInTabStyle } from '../../utils'
import type { NavArrowColor } from '../../config'
import { getThemeModule, mapping } from 'jimu-theme'

/**
 * This is a composite component, which consists of four other components:
 * Navigation for `nav` type
 * Slider for `slider` type
 * NavButtonGroup for `NavButtonGroup` type
 * Pagination for `pagination` type
 */

// Define the magnification of slider type nav
const MAGNIFICATION = 100

//In the view-navigation, four types are supported:
export type ViewNavigationType = 'nav' | 'pagination' | 'slider' | 'navButtonGroup'

//The component supports the standard props of four sub components
export type ViewNavigationStandard = Partial<NavigationProps>
& Partial<PaginationProps> & Partial<SliderProps> & Partial<NavigationButtonGroupPropsProps> & NavInfoStandard

interface NavInfoStandard {
  step?: number
}

//For the `navButtonGroup` type nav, its type consists of `NavButtonGroupProps` and `PageNumberProps`
export type NavigationButtonGroupPropsProps = NavButtonGroupProps & PageNumberProps & {
  showPageNumber?: boolean
}

//Component supports 4 groups of variables for advanced style
export type ViewNavigationVariant = NavigationVariant | ThemeSliderVariant | NavIconButtonGroupVariant
export type IMViewNavigationVariant = ImmutableObject<ViewNavigationVariant>

export type IMViewNavigationDisplay = ImmutableObject<ViewNavigationDisplay>

export interface ViewNavigationDisplay {
  /**
   * Directions of navigation
   */
  vertical?: boolean
  /**
   * Type of navigation, optional values:  'nav' | 'pagination'(Not yet supported) | 'slider' | 'navButtonGroup'
   */
  type: ViewNavigationType
  /**
   * Subtypes of each type
   * nav: 'default', 'underline', 'pills'
   * pagination: Not yet supported
   * slider: 'default'
   * navButtonGroup: 'primary' | 'tertiary'
   */
  navStyle: string
  /**
   * Configurable parameters for each type: PaginationProps | SliderProps | NavigationButtonGroupPropsProps
   */
  standard?: ViewNavigationStandard
  /**
   * Whether to enable advanced style (override the style provided by the component in the widget)
   */
  advanced?: boolean
  /**
   * Configurable variables in advanced style
   *
   */
  variant?: ImmutableObject<ViewNavigationVariant>
  /**
   * Use to deine pagination color of Arrow1 and Arrow3 style
   *
   */
  paginationFontColor?: string

  /**
   * Configurable arrow color for tab styles in advanced style
   */
  navArrowColor?: ImmutableObject<NavArrowColor>
}

interface ViewNavigationProps extends ViewNavigationDisplay {
  className?: string
  /**
   * The selected view in the current section
   */
  activeView?: string
  /**
   * Data of Navigation component
   */
  data?: ImmutableArray<NavigationItem>
  /**
   * View switching progress
   */
  progress?: number
  /**
   * Callback for switching views
   */
  onChange?: (type: ViewNavigationType, value: boolean | number | string) => void

  theme: IMThemeVariables
}

const style = css`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  .nav-button-group .jimu-page-number .page-span.current-page {
    color: inherit !important;
  }
  .nav-button-group {
    .jimu-page-link-outlined:disabled {
      &, &:hover {
        background-color: var(--sys-color-action-disabled);
        border-color: var(--sys-color-divider-secondary);
      }
    }
  }
`

export const ViewNavigation = (props: ViewNavigationProps) => {
  const {
    className,
    data,
    progress = 0,
    type,
    navStyle,
    vertical,
    advanced,
    variant,
    onChange,
    activeView,
    standard,
    paginationFontColor,
    navArrowColor,
    theme,
    ...others
  } = props

  const {
    current,
    totalPage,
    showPageNumber,
    scrollable,
    disablePrevious,
    disableNext,
    previousText,
    previousIcon,
    nextText,
    nextIcon,
    showIcon,
    gap,
    alternateIcon,
    activedIcon,
    showText,
    showTitle,
    iconPosition,
    textAlign,
    hideThumb
  } = standard || {} as ViewNavigationStandard

  const handleArrowChange = (previous: boolean) => {
    onChange?.('navButtonGroup', previous)
  }

  const handleSliderChangeRef = React.useRef<any>(() => 0)

  React.useEffect(() => {
    handleSliderChangeRef.current = lodash.throttle((evt) => {
      let value = +evt.target.value
      value = Number((value / MAGNIFICATION).toFixed(2))
      onChange?.('slider', value)
    }, 100)

    return () => {
      handleSliderChangeRef.current.cancel()
    }
  }, [onChange])

  const handleSliderChange = (evt) => {
    evt.persist?.()
    handleSliderChangeRef.current(evt)
  }

  const isActive = React.useCallback((item: NavigationItem) => {
    return activeView === getViewId(item)
  }, [activeView])

  //Generate component styles to override the default
  const advanceStyle = useAdvanceStyle(type, navStyle, advanced, variant, vertical, hideThumb, navArrowColor)

  const oldThemeStyle = React.useMemo(() => {
    const themeModule = getThemeModule(theme?.uri)
    const isNewTheme = mapping.whetherIsNewTheme(themeModule)
    if (isNewTheme) {
      return null
    }
    const navVar = (themeModule?.variables as any)?.components?.nav?.variants?.[navStyle]?.item?.default?.color as string || ''

    return css`
      ${navVar ? '' : `.nav-link:not(:hover):not(.active) {
        color: var(--sys-color-action-text);
      }`}
      .direction-button:not(:hover):not(.active):not(:disabled) {
        color: var(--sys-color-action-text);
      }
      ${paginationFontColor ? '' : `.jimu-page-number {
        color: var(--sys-color-action-text);
      }`}
    `
  }, [navStyle, paginationFontColor, theme?.uri])

  const containerPaddingStyle = useContainerPaddingStyle(type)

  const handleNavLinkClick = (to: NavigationItem) => {
    const newViewId = getViewId(to)
    onChange?.('nav', newViewId)
  }

  const translate = hooks.useTranslation(jimuUIDefaultMessages)
  const sliderFormatter = (value: number) => {
    const activeViewLabel = data?.find(item => getViewId(item) === activeView)?.name || ''
    return `${translate('percentage')} ${Math.round(+value)}. ${activeViewLabel}`
  }

  return <div className={classNames('navigation', className)} css={[style, advanceStyle, containerPaddingStyle, oldThemeStyle]} {...others}>
    {type === 'nav' && <Navigation
      keepPaddingWhenOnlyIcon={isInTabStyle(props)}
      onLinkClick={handleNavLinkClick}
      role="tablist"
      vertical={vertical}
      isActive={isActive}
      scrollable={scrollable}
      data={data}
      gap={gap}
      type={navStyle as any}
      showIcon={showIcon}
      alternateIcon={alternateIcon}
      activedIcon={activedIcon}
      showText={showText}
      showTitle={showTitle || showText || (isInTabStyle(props) && !showText && showIcon)}
      isUseNativeTitle={true}
      iconPosition={iconPosition}
      textAlign={textAlign} />}
    {type === 'slider' && <Slider className="h-100" value={progress * MAGNIFICATION} hideThumb={hideThumb} onChange={handleSliderChange} formatter={sliderFormatter}></Slider>}
    {type === 'navButtonGroup' &&
      <NavButtonGroup
        variant={navStyle === 'tertiary' ? 'text' : 'outlined'}
        previousText={previousText}
        previousIcon={previousIcon}
        nextText={nextText}
        nextIcon={nextIcon}
        vertical={vertical}
        disablePrevious={disablePrevious}
        disableNext={disableNext}
        onChange={handleArrowChange}>
        {showPageNumber && <PageNumber current={current} totalPage={totalPage} css={css`color: ${paginationFontColor}`}></PageNumber>}
      </NavButtonGroup>}
  </div>
}
