/** @jsx jsx */
import { jsx, React, css, AppMode, classNames, BrowserSizeMode, getTransition, motion, LinkType, TransitionType, TransitionDirection } from 'jimu-core'
import type { ImmutableObject, UrlParameters, IMLinkParam, IMThemeVariables } from 'jimu-core'
import { styleUtils } from 'jimu-ui'
import { LayoutEntry as LayoutRuntimeEntry } from 'jimu-layouts/layout-runtime'
import { Status, type IMTransitionInfo, type IMConfig, CardLayout } from '../../config'
import { LinkContainer } from 'jimu-ui/advanced/link-container'
import { initBackgroundStyle, getBorderRadius as getBorderRadiusUtils } from '../utils/utils'

const { useState, useRef, useEffect } = React

interface Props {
  /**
   * one or more expressions
   */
  linkParam?: IMLinkParam
  queryObject: ImmutableObject<UrlParameters>
  cardConfigs: IMConfig
  layouts: any
  appMode: AppMode
  browserSizeMode: BrowserSizeMode
  cardLayout: CardLayout
  LayoutEntry: any
  theme?: IMThemeVariables
}

// If not set transition, we should use Fade as default transition, and duration is 0,
//otherwise, the hover will not be able to switch
const DEFAULT_DURATION = 0.5
const TRANSITION = { type: 'tween', duration: DEFAULT_DURATION, ease: 'easeOut' }
const DEFAULT_TRANSITION = {
  transition:{
    type: TransitionType.Fade,
    direction: TransitionDirection.Horizontal
  },
  oneByOneEffect:null,
  previewId: 1
}
const DEFAULT_MOTION_STYLE = css`
  & {
    left: 0;
    top: 0
  }
`

const CardContent = function (props: Props) {
  const { cardConfigs, browserSizeMode, layouts, appMode, linkParam, cardLayout, queryObject, LayoutEntry, theme } = props

  const [animate, setAnimate] = useState('default')
  const isUseDefaultTransition = !cardConfigs?.transitionInfo || cardConfigs?.transitionInfo?.transition?.type === TransitionType.None
  const transitionInfo = isUseDefaultTransition ? DEFAULT_TRANSITION : cardConfigs?.transitionInfo as IMTransitionInfo
  const isHoverEnable = cardConfigs?.HOVER?.enable || false
  const isInBuilder = window.jimuConfig?.isInBuilder || false
  const transition = getTransition(transitionInfo?.transition?.type, transitionInfo?.transition?.direction)
  const hasHoverAnimation = isHoverEnable && transition != null
  const previewIdRef = useRef(transitionInfo?.previewId)

  useEffect(() => {
    // preview the animation
    if (transitionInfo?.previewId > 0 && transitionInfo.previewId !== previewIdRef.current) {
      previewIdRef.current = transitionInfo.previewId
      setAnimate('ready')
    }
  }, [transitionInfo?.previewId])

  const renderLayoutEntry = React.useCallback((layouts) => {
    const useBuilderLayoutEntry = isInBuilder && appMode === AppMode.Express
    if (useBuilderLayoutEntry) {
      return (<LayoutEntry layouts={layouts} isInWidget />)
    } else {
      return (<LayoutRuntimeEntry layouts={layouts} />)
    }
  }, [isInBuilder, appMode, LayoutEntry])

  const mobile = React.useMemo(() => {
    return browserSizeMode === BrowserSizeMode.Small
  }, [browserSizeMode])

  const getBackgroundStyle = React.useCallback((status: Status) => {
    const backgroundStyle = cardConfigs[status].backgroundStyle
    return initBackgroundStyle(backgroundStyle, theme)
  }, [cardConfigs, theme])

  const getBorderRadius = React.useCallback((status: Status) => {
    const backgroundStyle = cardConfigs[status].backgroundStyle
    const borderRadius = getBorderRadiusUtils(backgroundStyle, theme)
    return { borderRadius: borderRadius }
  }, [cardConfigs, theme])

  const getDefaultTransition = React.useCallback(() => {
    if (isUseDefaultTransition) {
      TRANSITION.duration = 0
    } else {
      TRANSITION.duration = DEFAULT_DURATION
    }
    return TRANSITION
  }, [isUseDefaultTransition])

  const getCardContent = React.useCallback((cardConfigs: IMConfig) => {
    const cardContent = []
    let regularLayout, regularBgStyle, hoverLayout, hoverBgStyle, regularBorderRadius, hoverBorderRadius
    if (isInBuilder && appMode === AppMode.Design) {
      regularBgStyle = getBackgroundStyle(Status.Default)
      //Border radius of card item container with border
      regularBorderRadius = getBorderRadius(Status.Default)
      regularLayout = layouts[Status.Default]
      if (isHoverEnable) {
        hoverBgStyle = getBackgroundStyle(Status.Hover)
        hoverBorderRadius = getBorderRadius(Status.Hover)

        hoverLayout = cardLayout === CardLayout.AUTO ? regularLayout : layouts[Status.Hover]
      }
    } else {
      regularLayout = layouts[Status.Default]
      regularBgStyle = getBackgroundStyle(Status.Default)
      regularBorderRadius = getBorderRadius(Status.Default)

      if (isHoverEnable) {
        hoverLayout = cardLayout === CardLayout.AUTO ? regularLayout : layouts[Status.Hover]
        hoverBgStyle = getBackgroundStyle(Status.Hover)
        hoverBorderRadius = getBorderRadius(Status.Hover)
      }
    }

    const mergedStyle: any = {
      ...styleUtils.toCSSStyle(regularBgStyle || ({} as any))
    }

    if (regularBorderRadius) {
      //This is done to deal with UI issues https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/20110
      regularBorderRadius = {
        ...styleUtils.toCSSStyle(regularBorderRadius || ({} as any))
      }
    }

    if (hoverBorderRadius) {
      //This is done to deal with UI issues https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/20110
      hoverBorderRadius = {
        ...styleUtils.toCSSStyle(hoverBorderRadius || ({} as any))
      }
    }

    const variants = transition?.getVariants()
    const isShowLink = linkParam?.linkType && linkParam?.linkType !== LinkType.None

    const TRANSITION = getDefaultTransition()
    const regularElement = (
      <motion.div
        className={classNames(
          'card-content d-flex card-viewer-con position-absolute',
          isShowLink ? 'card-link' : ''
        )}
        key={Status.Default}
        variants={hasHoverAnimation ? {
          default: { ...variants.fromPrevious, x: 0, y: 0, rotateX: 0, rotateY: 0, opacity: 1, transition: TRANSITION },
          hover: { ...variants.toPrevious, opacity: 0, transition: TRANSITION },
          ready: { opacity: 1, transition: { type: 'tween', duration: 0 } },
          go: { ...variants.toPrevious, opacity: 0, transition: TRANSITION }
        } : undefined}
      >
        <div className='w-100 animation-list' style={mergedStyle}>
          <div
            className='d-flex w-100 h-100'
            key={Status.Default}
            style={regularBorderRadius}
          >
            {renderLayoutEntry(regularLayout)}
          </div>
        </div>
      </motion.div>
    )
    cardContent.push(regularElement)

    if (isHoverEnable) {
      const hoverMergedStyle: any = {
        ...styleUtils.toCSSStyle(hoverBgStyle || ({} as any))
      }
      const hoverElement = (
        <motion.div
          className={classNames(
            'card-content hover-content d-flex card-surface w-100 h-100 position-absolute',
            isShowLink ? 'card-link' : ''
          )}
          css={DEFAULT_MOTION_STYLE}
          key={Status.Hover}
          variants={hasHoverAnimation ? {
            default: { ...variants.toNext, opacity: 0, transition: TRANSITION },
            hover: { ...variants.fromNext, opacity: 1, transition: TRANSITION },
            ready: { ...variants.toNext, opacity: 0, transition: { type: 'tween', duration: 0 } },
            go: { ...variants.fromNext, opacity: 1, transition: TRANSITION }
          } : undefined}
        >
          <div className='w-100 h-100 animation-list' style={hoverMergedStyle}>
            <div
              className='d-flex w-100 h-100'
              style={hoverBorderRadius}
              key={Status.Hover}
            >
              {renderLayoutEntry(hoverLayout)}
            </div>
          </div>
        </motion.div>
      )
      cardContent.push(hoverElement)
    }

    return cardContent
  }, [isInBuilder, appMode, transition, linkParam?.linkType, isHoverEnable, hasHoverAnimation, getDefaultTransition, renderLayoutEntry, getBackgroundStyle, getBorderRadius, layouts, cardLayout])


  const handleAnimationEnd = (value: string) => {
    if (value === 'ready') {
      setAnimate('go')
    } else if (value === 'go') {
      setAnimate('default')
    }
  }

  const handleMotionConOnMouse = React.useCallback((mouseLeave?: boolean) => {
    //To fix the issue of Motion's 'whileHover' not working on mobile devices
    //https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/29891
    if (!mobile || !isHoverEnable) return
    if (mouseLeave) {
      setAnimate('default')
    } else {
      setAnimate('hover')
    }
  }, [mobile, isHoverEnable])

  return (
    <LinkContainer
      linkParam={linkParam}
      appMode={appMode}
      queryObject={queryObject}
    >
      <div
        className='w-100 h-100'
        onMouseLeave={e => { handleMotionConOnMouse(true) }}
        onMouseEnter={e => { handleMotionConOnMouse() }}
      >
        <motion.div
          className='w-100 h-100 position-relative'
          initial={hasHoverAnimation ? 'default': undefined}
          animate={hasHoverAnimation ? animate: undefined}
          whileHover={hasHoverAnimation ? 'hover' : undefined}
          onAnimationComplete={handleAnimationEnd}
          variants={hasHoverAnimation ? { default: { opacity: 1 }, hover: { opacity: 1 }, ready: { opacity: 1 }, go: { opacity: 1 } } : undefined}
        >
          {getCardContent(cardConfigs)}
        </motion.div>
      </div>
    </LinkContainer>
  )
}

export default CardContent
