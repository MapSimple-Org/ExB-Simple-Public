/** @jsx jsx */
import {
  jsx,
  css,
  React,
  type DataRecord,
  type ImmutableObject,
  type UrlParameters,
  getNextAnimationId,
  type IMLinkParam
} from 'jimu-core'
import { styleUtils } from 'jimu-ui'
import { Status } from '../../config'
import Card, { type CardProps, type CardStates } from './card-base'
import CardContent from './card-content'
import { getBorderRadius } from '../utils/utils'

interface ListCardViewerProps extends CardProps {
  /**
   * one or more expressions
   */
  linkParam?: IMLinkParam
  queryObject: ImmutableObject<UrlParameters>
  LayoutEntry?: any
}

interface ListCardViewerStates extends CardStates {
  url: string
  currenStatus: Status
}

export default class CardViewer extends Card<
ListCardViewerProps,
ListCardViewerStates
> {
  regularLayoutRef: any
  hoverLayoutRef: any
  linkRef: React.RefObject<HTMLButtonElement>
  expressionRecords: { [key: string]: DataRecord }
  didMount: boolean
  constructor (props) {
    super(props)

    this.state = {
      url: '',
      currenStatus: Status.Default
    }

    this.regularLayoutRef = React.createRef()
    this.hoverLayoutRef = React.createRef()
    this.linkRef = React.createRef<HTMLButtonElement>()
    this.didMount = false
  }

  componentDidMount () {
    this.didMount = true
  }

  componentDidUpdate (prevProps) {
    const oldCardConfig = this.props.cardConfigs
    const { cardConfigs } = prevProps
    const isPreviewIdChange =
      oldCardConfig?.transitionInfo?.previewId ===
      cardConfigs?.transitionInfo?.previewId
    if (!isPreviewIdChange) {
      this.setState({
        hoverPlayId: getNextAnimationId(),
        regularPlayId: getNextAnimationId()
      })
    }
  }

  getCardShadowStyle = () => {
    const { cardConfigs, theme } = this.props
    //Border radius of card item container with out border
    const borderRadiusOfDefaultStatus = getBorderRadius(cardConfigs[Status.Default].backgroundStyle, theme)
    const borderRadiusOfDefaultHover = getBorderRadius(cardConfigs[Status.Hover].backgroundStyle, theme)
    const defaultStyle = css`
      box-shadow: ${styleUtils.toCSSBoxshadow(cardConfigs[Status.Default].backgroundStyle?.boxShadow)};
      border-radius: ${styleUtils.toCSSBorderRadius(borderRadiusOfDefaultStatus as any)};
    `
    if (cardConfigs[Status.Hover].enable) {
      return css`
        ${defaultStyle}
        &:hover {
          box-shadow: ${styleUtils.toCSSBoxshadow(cardConfigs[Status.Hover].backgroundStyle?.boxShadow)};
          border-radius: ${styleUtils.toCSSBorderRadius(borderRadiusOfDefaultHover as any)};
        }
      `
    }

    return defaultStyle
  }

  onMouse = (evt, isHover = false) => {
    const { cardConfigs } = this.props
    const { currenStatus } = this.state
    const isHoverEnable = cardConfigs?.HOVER?.enable
    let newCurrenStatus = currenStatus
    if (isHoverEnable && isHover) {
      newCurrenStatus = Status.Hover
    } else {
      newCurrenStatus = Status.Default
    }
    if (newCurrenStatus !== currenStatus) {
      this.setState({
        currenStatus: newCurrenStatus
      })
    }
  }

  render () {
    const { widgetId, cardConfigs, linkParam, queryObject, layouts, appMode, browserSizeMode, cardLayout, LayoutEntry, theme } = this.props
    const { currenStatus } = this.state
    const cardViewerClass = `card-${widgetId}`
    return (
      <div
        css={css`${this.getStyle(currenStatus)} ${this.getCardShadowStyle()}`}
        className={cardViewerClass}
        onMouseLeave={e => {
          this.onMouse(e, false)
        }}
        onMouseEnter={e => {
          this.onMouse(e, true)
        }}
      >
        <CardContent
          linkParam={linkParam}
          queryObject={queryObject}
          cardConfigs={cardConfigs}
          layouts={layouts}
          appMode={appMode}
          browserSizeMode={browserSizeMode}
          cardLayout={cardLayout}
          LayoutEntry={LayoutEntry}
          theme={theme}
        />
      </div>
    )
  }
}
