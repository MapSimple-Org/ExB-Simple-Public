/** @jsx jsx */
import {
  React, LinkType, type AllWidgetProps, ExpressionPartType, ExpressionResolverErrorCode, type LinkResult, classNames,
  type IMExpression, jsx, ExpressionResolverComponent, Immutable, type IMState, AppMode, css, type IMIconProps, type SerializedStyles,
  getAppStore, type IMUrlParameters, type BrowserSizeMode, MessageManager, ButtonClickMessage, type LinkTarget,
  DynamicStyleResolverComponent,
  type IMDynamicStyle,
  type ImmutableObject,
  type DynamicStyle,
  type RepeatedDataSource,
  type DynamicStyleState,
  appActions,
  type DynamicStyleWidgetPreviewRepeatedRecordInfo
} from 'jimu-core'
import { styleUtils, Link, type LinkProps, Icon, DistanceUnits, defaultMessages as jimuUiDefaultMessages, Popper, type ShiftOptions, type FlipOptions } from 'jimu-ui'
import { type IMConfig, IconPosition, type IMWidgetState, type AdvanceStyleSettings, type IconConfig } from '../config'
import { getPoperStyle, getStyle } from './style'
import { versionManager } from '../version-manager'
import { getThemeModule, mapping } from 'jimu-theme'

interface State {
  text: string
  toolTip: string
  url: string
  textExpression: IMExpression
  tipExpression: IMExpression
  urlExpression: IMExpression
  regularDynamicStyles: IMDynamicStyle
  hoverDynamicStyles: IMDynamicStyle
  isHovered: boolean
  tipExpLoading: boolean
  urlExpLoading: boolean
  textExpLoading: boolean
}

interface ExtraProps {
  active: boolean
  appMode: AppMode
  queryObject: IMUrlParameters
  isRTL: boolean
  browserSizeMode: BrowserSizeMode
  uri: string
  dynamicStyleState: DynamicStyleState
  isDynamicActive: boolean
}

const shiftOptions: ShiftOptions = {
  rootBoundary: 'viewport',
  crossAxis: true,
  padding: 4
}

const flipOptions: FlipOptions = {
  boundary: document.body,
  fallbackPlacements: ['right-start', 'left-start', 'top', 'bottom', 'left', 'right', 'top-start', 'bottom-start']
}

const isWidgetDynamicActive = (
  isDynamicActive: boolean,
  repeatedDataSource: RepeatedDataSource,
  dynamicStyleState: DynamicStyleState
): boolean => {
  if (isDynamicActive && repeatedDataSource) {
    const { widgetId, recordIndex } = repeatedDataSource
    if (widgetId && recordIndex !== undefined) {
      const previewIndex = dynamicStyleState?.previewRepeatedRecordInfo?.[widgetId]?.recordIndex
      if (previewIndex !== recordIndex) {
        return false
      }
    }
  }
  return isDynamicActive
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig> & ExtraProps, State> {
  domNode: React.RefObject<HTMLDivElement>

  constructor(props) {
    super(props)
    this.state = {
      text: this.getTextFromProps(),
      toolTip: this.props.config?.functionConfig?.toolTip || '',
      url: this.props.config?.functionConfig?.linkParam?.value || '',
      textExpression: this.props.useDataSourcesEnabled && this.getTextExpression(),
      tipExpression: this.props.useDataSourcesEnabled && this.getTipExpression(),
      urlExpression: this.props.useDataSourcesEnabled && this.getUrlExpression(),
      regularDynamicStyles: null,
      hoverDynamicStyles: null,
      isHovered: false,
      tipExpLoading: false,
      urlExpLoading: false,
      textExpLoading: false,
    }
    this.domNode = React.createRef()
  }

  static mapExtraStateProps = (state: IMState, ownProps: AllWidgetProps<IMConfig>): ExtraProps => {
    let selected = false
    const selection = state.appRuntimeInfo.selection
    if (selection && state.appConfig.layouts[selection.layoutId]) {
      const layoutItem = state.appConfig.layouts[selection.layoutId].content[selection.layoutItemId]
      selected = layoutItem && layoutItem.widgetId === ownProps.id
    }
    const isInBuilder = state.appContext.isInBuilder
    const active = isInBuilder && selected
    const isDynamicActive = typeof state.dynamicStyleState?.previewConditionInfo?.[ownProps.id]?.conditionId === 'number'
    return {
      active,
      appMode: state.appRuntimeInfo.appMode,
      queryObject: state.queryObject,
      isRTL: state.appContext.isRTL,
      browserSizeMode: state.browserSizeMode,
      uri: state.appConfig.widgets[ownProps.id]?.uri,
      dynamicStyleState: state.dynamicStyleState,
      isDynamicActive,
    }
  }

  static versionManager = versionManager

  componentDidUpdate(prevProps: AllWidgetProps<IMConfig> & ExtraProps, prevState: State) {
    if (!this.props.useDataSourcesEnabled &&
      (
        this.props.config !== prevProps.config || prevProps.useDataSourcesEnabled
      )
    ) {
      this.setState({
        text: this.getTextFromProps(),
        toolTip: this.props.config && this.props.config.functionConfig && this.props.config.functionConfig.toolTip,
        url: this.props.config && this.props.config.functionConfig && this.props.config.functionConfig.linkParam && this.props.config.functionConfig.linkParam.value
      })
    }

    if (this.props.useDataSourcesEnabled &&
      (
        this.props.config !== prevProps.config || !prevProps.useDataSourcesEnabled
      )
    ) {
      this.setState({
        textExpression: this.getTextExpression(),
        tipExpression: this.getTipExpression(),
        urlExpression: this.getUrlExpression()
      })
    }
    // If the dynamic style is active and button is in the List, we need to tell the List to update the record index
    if (this.props.isDynamicActive !== prevProps.isDynamicActive && this.props.isDynamicActive) {
      if (this.props.repeatedDataSource) {
        const ds = this.props.repeatedDataSource as RepeatedDataSource
        const prevRepeatedRecordInfo = this.props.dynamicStyleState?.previewRepeatedRecordInfo?.[ds.widgetId] || {}
        this.props.dispatch(appActions.changeDynamicStylePreviewRepeatedRecordInfo(ds.widgetId, { ...prevRepeatedRecordInfo, needUpdateRecordIndex: true } as DynamicStyleWidgetPreviewRepeatedRecordInfo))
      }
    }
  }

  getTextFromProps = (): string => {
    return typeof this.props.config?.functionConfig?.text === 'string'
      ? this.props.config?.functionConfig?.text
      : this.props.intl.formatMessage({ id: 'variableButton', defaultMessage: jimuUiDefaultMessages.variableButton })
  }

  getTipExpression = (): IMExpression => {
    return (this.props.config && this.props.config.functionConfig && this.props.config.functionConfig.toolTipExpression &&
      this.props.config.functionConfig.toolTipExpression) ||
      Immutable({
        name: '',
        parts: [{ type: ExpressionPartType.String, exp: `"${this.props.config?.functionConfig?.toolTip || ''}"` }]
      })
  }

  getTextExpression = (): IMExpression => {
    return (this.props.config && this.props.config.functionConfig && this.props.config.functionConfig.textExpression &&
      this.props.config.functionConfig.textExpression) ||
      Immutable({
        name: '',
        parts: [{ type: ExpressionPartType.String, exp: `"${this.props.config?.functionConfig?.text || this.getTextFromProps()}"` }]
      })
  }

  getUrlExpression = (): IMExpression => {
    const expression = this.props.config && this.props.config.functionConfig && this.props.config.functionConfig.linkParam &&
      this.props.config.functionConfig.linkParam && this.props.config.functionConfig.linkParam.expression

    return expression || null
  }

  onTextExpResolveChange = result => {
    if (result.isSuccessful) {
      this.setState({ text: result.value })
    } else {
      let res: string = ''
      const errorCode = result.value
      if (errorCode === ExpressionResolverErrorCode.Failed) {
        res = this.state.textExpression && this.state.textExpression.name
      }

      this.setState({ text: res })
    }
  }

  onTipExpResolveChange = result => {
    if (result.isSuccessful) {
      this.setState({ toolTip: result.value })
    } else {
      this.setState({ toolTip: '' })
    }
  }

  onUrlExpResolveChange = result => {
    if (result.isSuccessful) {
      this.setState({ url: result.value })
    } else {
      let res: string = ''
      const errorCode = result.value
      if (errorCode === ExpressionResolverErrorCode.Failed) {
        res = this.state.urlExpression && this.state.urlExpression.name
      }

      this.setState({ url: res })
    }
  }

  getWhetherUseQuickStyle = (config: IMConfig): boolean => {
    return !!(config && config.styleConfig && config.styleConfig.themeStyle && config.styleConfig.themeStyle.quickStyleType)
  }

  getIconStyle = (regularIconProps: IMIconProps, hoverIconProps: IMIconProps): SerializedStyles => {
    const r = regularIconProps || ({} as IMIconProps)
    const h = hoverIconProps || ({} as IMIconProps)

    return css`
      & img, & svg{
        color: ${r.color};
        fill: ${r.color};
        width: ${r.size}${DistanceUnits.PIXEL};
        height: ${r.size}${DistanceUnits.PIXEL};
      }
      &:hover{
        img, svg{
          color: ${h.color};
          fill: ${h.color};
          width: ${h.size}${DistanceUnits.PIXEL};
          height: ${h.size}${DistanceUnits.PIXEL};
        }
      }
    `
  }

  getMixinStyleSettings = (dynamicStyleConfig: ImmutableObject<DynamicStyle>, advanceStyle: ImmutableObject<AdvanceStyleSettings>): AdvanceStyleSettings => {
    const advanceStyleWithoutIcon: AdvanceStyleSettings = advanceStyle?.without('iconProps').without('dynamicStyleConfig').without('enableDynamicStyle').asMutable({ deep: true }) || {}
    const dynamicStyle = dynamicStyleConfig?.without('icon').asMutable({ deep: true })

    if (dynamicStyle?.border) {
      dynamicStyle.border = styleUtils.mixinBorderWithDynamicStyle(dynamicStyle?.border, advanceStyleWithoutIcon)
      Object.assign(dynamicStyle, dynamicStyle.border)
      const borderProps = ['border', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom']
      borderProps.forEach(prop => delete advanceStyleWithoutIcon[prop])
    }
    if (dynamicStyle?.borderRadius) {
      dynamicStyle.borderRadius = styleUtils.mixinBorderRadiusWithDynamicStyle(dynamicStyle?.borderRadius, advanceStyleWithoutIcon.borderRadius)
      delete advanceStyleWithoutIcon.borderRadius
    }
    let mixinStyleSettings: AdvanceStyleSettings = null
    if (dynamicStyle) {
      mixinStyleSettings = Immutable(advanceStyleWithoutIcon).merge(Immutable(dynamicStyle), { deep: true }).asMutable({ deep: true })
    }
    return mixinStyleSettings
  }

  removeUndefinedStyle = (style: React.CSSProperties): React.CSSProperties => {
    if (!style) {
      return style
    }
    const removedUndefinedStyle = {}
    Object.keys(style).forEach(styleName => {
      if ((typeof style[styleName] === 'string' && !style[styleName].includes('undefined')) ||
        typeof style[styleName] === 'number') {
        removedUndefinedStyle[styleName] = style[styleName]
      }
    })
    return removedUndefinedStyle
  }

  updateIconWithDynamicStyle = (baseIcon, dynamicIconStyle) => {
    if (!dynamicIconStyle) return baseIcon

    const cleanedStyle = dynamicIconStyle.without('color').without('size') as unknown as IconConfig

    return baseIcon
      ? Immutable({ ...baseIcon.asMutable({ deep: true }), ...cleanedStyle })
      : Immutable(dynamicIconStyle as unknown as IconConfig)
  }
  getLinkComponent = (isNewTheme: boolean) => {
    const config = this.props.config
    const linkParam = config.functionConfig.linkParam
    const text = this.state.text
    const title = this.state.toolTip
    const disabled = this.state.textExpLoading || this.state.urlExpLoading || this.state.tipExpLoading
    const useQuickStyle = this.getWhetherUseQuickStyle(config)
    let customStyle, iconStyle, style, iconProps, hoverIconProps, hoverStyle
    let icon = config.functionConfig?.icon
    if (config.styleConfig && config.styleConfig.useCustom && config.styleConfig.customStyle) {
      let regular = config.styleConfig.customStyle.regular
      const hover = config.styleConfig.customStyle.hover
      // set borderRadius number to 0 if it is null
      if (regular.borderRadius) {
        const radiusNum = regular.borderRadius.number.map((num) => num === null ? 0 : num) as unknown as [number, number, number, number]
        regular = regular.setIn(['borderRadius', 'number'], radiusNum)
      }
      const enableRegularDynamicStyle = regular.enableDynamicStyle
      const regularDynamicStyle = this.state.regularDynamicStyles
      const regularMixinStyleSettings = enableRegularDynamicStyle && this.getMixinStyleSettings(regularDynamicStyle, regular)

      const enableHoverDynamicStyle = this.props.config?.styleConfig?.customStyle?.hover?.enableDynamicStyle
      const hoverDynamicStyle = this.state.hoverDynamicStyles
      const hoverMixinStyleSettings = enableHoverDynamicStyle && this.getMixinStyleSettings(hoverDynamicStyle, hover)

      if (enableRegularDynamicStyle && regularDynamicStyle) {
        style = styleUtils.toCSSStyle(regularMixinStyleSettings, true) as React.CSSProperties
        iconProps = { ...regular?.iconProps, ...regularDynamicStyle?.icon }
      } else {
        style = styleUtils.toCSSStyle(regular && regular.without('iconProps').asMutable({ deep: true }), true) as React.CSSProperties
        iconProps = regular?.iconProps
      }

      if (enableHoverDynamicStyle && hoverDynamicStyle) {
        hoverStyle = styleUtils.toCSSStyle(hoverMixinStyleSettings, true) as React.CSSProperties
        hoverIconProps = { ...hover?.iconProps, ...hoverDynamicStyle?.icon }
      } else {
        hoverStyle = styleUtils.toCSSStyle(hover && hover.without('iconProps').asMutable({ deep: true }), true) as React.CSSProperties
        hoverIconProps = hover?.iconProps
      }

      hoverStyle = { ...style, ...hoverStyle }
      hoverIconProps = { ...iconProps, ...hoverIconProps }

      if (useQuickStyle && config.styleConfig.themeStyle?.quickStyleType === 'link') {
        if (!isNewTheme) {
          // If set the underline: false in classic theme link quick style, need to override the textDecoration here
          if (regular?.text && Object.prototype.hasOwnProperty.call(regular.text, 'underline') && !regular.text.underline) {
            style.textDecoration = `${style?.textDecoration || 'none'} !important`
          } else {
            // classic theme link quick style default is underline
            style.textDecoration = this.getMergedTextDecoration(style?.textDecoration, 'underline')+' !important'
          }
          if (hover?.text && Object.prototype.hasOwnProperty.call(hover.text, 'underline') && !hover.text.underline) {
            hoverStyle.textDecoration = `${hoverStyle?.textDecoration || 'none'} !important`
          } else {
            hoverStyle.textDecoration = this.getMergedTextDecoration(hoverStyle?.textDecoration, 'underline')+' !important'
          }
        } else {
          // Because new theme can modify the link style, button linkQuickStyle should same as theme link style default,
          // If we also have custom style, need to mixin textDecoration with custom style, it has two parts: decoration and decorationStyle
          const themeTextDecoration = this.props.theme?.comp?.Link?.root?.vars?.decoration
          const themeDecorationStyle = this.props.theme?.comp?.Link?.root?.vars?.decorationStyle
          const themeHoverTextDecoration = this.props.theme?.comp?.Link?.root?.vars?.hover?.decoration
          const themeHoverDecorationStyle = this.props.theme?.comp?.Link?.root?.vars?.hover?.decorationStyle

          let textDecoration = style?.textDecoration ?? ''
          textDecoration = this.getMergedTextDecoration(textDecoration, themeTextDecoration)
          let hoverTextDecoration = hoverStyle?.textDecoration ?? ''
          hoverTextDecoration = this.getMergedTextDecoration(hoverTextDecoration, themeHoverTextDecoration)
          // If set the underline: false, need to remove underline string from textDecoration
          if (regular?.text && Object.prototype.hasOwnProperty.call(regular.text, 'underline') && !regular.text.underline) {
            textDecoration = textDecoration.replace('underline', '').trim()
          }
          style.textDecorationLine = `${textDecoration || 'none'} !important`
          style.textDecorationStyle= themeDecorationStyle || 'initial'

          if (hover?.text && Object.prototype.hasOwnProperty.call(hover.text, 'underline') && !hover.text.underline) {
            hoverTextDecoration = hoverTextDecoration.replace('underline', '').trim()
          }
          hoverStyle.textDecorationLine = `${hoverTextDecoration || 'none'} !important`
          hoverStyle.textDecorationStyle= themeHoverDecorationStyle || 'initial'
        }
      }

      if (this.props.active && this.props.appMode !== AppMode.Run) {
        const widgetState: IMWidgetState = getAppStore().getState().widgetsState[this.props.id] || Immutable({})
        customStyle = {
          style: widgetState.isConfiguringHover
            ? { ...this.removeUndefinedStyle(style), ...this.removeUndefinedStyle(hoverStyle) }
            : style,
          hoverStyle
        }
        iconStyle = this.getIconStyle(
          widgetState.isConfiguringHover ? hoverIconProps : iconProps,
          hoverIconProps
        )
      } else {
        customStyle = {
          style,
          hoverStyle
        }
        iconStyle = this.getIconStyle(iconProps, hover && hoverIconProps)
      }

      // update icon with dynamic style
      if (regularDynamicStyle?.icon) {
        icon = this.updateIconWithDynamicStyle(icon, regularDynamicStyle.icon)
      }

      if (this.state.isHovered && hoverDynamicStyle?.icon) {
        icon = this.updateIconWithDynamicStyle(icon, hoverDynamicStyle.icon)
      }
    }

    const themeStyle: LinkProps = useQuickStyle
      ? {
        type: config.styleConfig.themeStyle.quickStyleType
      }
      : {
        type: 'default'
      }

    const basicClassNames = 'widget-button-link text-truncate w-100 h-100 p-0 d-flex align-items-center justify-content-center'

    let queryObject
    let target: LinkTarget
    let linkTo: LinkResult
    if (linkParam && linkParam.linkType) {
      target = linkParam.openType
      linkTo = {
        linkType: linkParam.linkType
      } as LinkResult

      if (linkParam.linkType === LinkType.WebAddress) {
        linkTo.value = this.state.url
      } else {
        linkTo.value = linkParam.value
        queryObject = this.props.queryObject
      }
    }


    const iconProperty = icon?.data?.properties
    const iconName = iconProperty?.isUploaded ? iconProperty?.originalName : iconProperty?.filename
    // remove the extension of icon name
    const iconNameWithoutExt = iconName?.replace(/\.[^/.]+$/, '')
    let accessibilityLabel = this.state.toolTip || text || iconNameWithoutExt


    const isRTL = this.props.isRTL
    const hasIcon = icon?.data?.svg

    const leftIcon = hasIcon && (!icon.position || icon.position === IconPosition.Left) &&
      <Icon
        icon={icon.data.svg}
        className={classNames({
          'mr-2 ml-0': !!text && !isRTL,
          'ml-2 mr-0': !!text && isRTL,
          'mx-0': !text
        })}
        aria-hidden={true}
      />

    const rightIcon = hasIcon && icon.position === IconPosition.Right &&
      <Icon
        icon={icon.data.svg}
        className={classNames({
          'ml-2 mr-0': !!text && !isRTL,
          'mr-2 ml-0': !!text && isRTL,
          'mx-0': !text
        })}
        aria-hidden={true}
      />

    if (target === '_blank') {
      accessibilityLabel = `${accessibilityLabel}, ${this.props.intl.formatMessage({ id: 'openInNewWindow' })}`
    }

    const autoSize = this.props.autoWidth && this.props.autoHeight
    const isIcon = icon && !text
    const textColor = isNewTheme && useQuickStyle && config.styleConfig.themeStyle?.quickStyleType === 'tertiary' ? 'inherit' : null
    return <Link to={linkTo} target={target} queryObject={queryObject}
      title={title} className={basicClassNames} role='button'
      color={textColor}
      customStyle={customStyle} {...themeStyle} css={iconStyle}
      aria-label={accessibilityLabel}
      disabled={disabled}
      onMouseEnter={() => { this.setState({ isHovered: true }) }}
      onMouseLeave={() => { this.setState({ isHovered: false }) }}
    >
      <span className={classNames('widget-button-text d-flex align-items-center justify-content-center', { 'auto-size-icon': autoSize && isIcon })} >
        {
          isRTL ? rightIcon : leftIcon
        }
        <span className='text-truncate'>{text}</span>
        {
          isRTL ? leftIcon : rightIcon
        }
      </span>
    </Link>
  }

  getMergedTextDecoration = (d1: string, d2: string) => {
    const decorations = new Set<string>()
    if (d1) {
      d1.split(' ').forEach(decoration => {
        decorations.add(decoration)
      })
    }
    if (d2) {
      d2.split(' ').forEach(decoration => {
        decorations.add(decoration)
      })
    }
    // if has both 'none' and other decorations, remove 'none'
    if (decorations.has('none') && decorations.size > 1) {
      decorations.delete('none')
    }
    return Array.from(decorations).join(' ')
  }

  onClick = e => {
    e.exbEventType = 'linkClick'
    MessageManager.getInstance().publishMessage(
      new ButtonClickMessage(this.props.id)
    )
  }

  onRegularDynamicStyleChange = (style: IMDynamicStyle) => {
    this.setState({ regularDynamicStyles: style })
  }
  onHoverDynamicStyleChange = (style: IMDynamicStyle) => {
    this.setState({ hoverDynamicStyles: style })
  }

  getDynamicActive = (): boolean => {
    return isWidgetDynamicActive(
      this.props.isDynamicActive,
      this.props.repeatedDataSource as RepeatedDataSource,
      this.props.dynamicStyleState
    )
  }

  onArcadeLoadingChange = (type: string, loading: boolean = true) => {
    if (type === 'text') {
      this.setState({ textExpLoading: loading })
    } else if (type === 'tip') {
      this.setState({ tipExpLoading: loading })
    } else if (type === 'url') {
      this.setState({ urlExpLoading: loading })
    }
  }

  render() {
    const isDataSourceUsed = this.props.useDataSourcesEnabled
    const isNewTheme = mapping.whetherIsNewTheme(getThemeModule(this.props.theme?.uri))
    const LinkComponent = this.getLinkComponent(isNewTheme)
    return (
      <div
        className={`jimu-widget widget-button w-100 h-100 ${this.state.textExpLoading || this.state.urlExpLoading || this.state.tipExpLoading ? '' : ''}`}
        css={getStyle(this.props.theme, isNewTheme)} ref={this.domNode}
        onClick={this.onClick}
        onKeyUp={evt => {
          if (evt.key === ' ' || evt.key === 'Enter') {
            this.onClick(evt)
          }
        }}
      >
        {LinkComponent}
        <Popper open={this.getDynamicActive()} offsetOptions={[0, 4]} css={getPoperStyle()} autoUpdate shiftOptions={shiftOptions}
          flipOptions={flipOptions} reference={this.domNode} placement="right-start" >
          <div className='pl-2 pr-2 pt-1 pb-1'>
            {this.props.intl.formatMessage({ id: 'conditionalStylePreview', defaultMessage: jimuUiDefaultMessages.conditionalStylePreview })}
          </div>
        </Popper>
        <div style={{ display: 'none' }}>
          {
            isDataSourceUsed &&
            <div>
              <ExpressionResolverComponent useDataSources={this.props.useDataSources} expression={this.state.textExpression}
                onChange={this.onTextExpResolveChange} widgetId={this.props.id}
                onLoading={() => { this.onArcadeLoadingChange('text') }}
                onLoaded={() => { this.onArcadeLoadingChange('text', false) }}
              />
              <ExpressionResolverComponent useDataSources={this.props.useDataSources} expression={this.state.tipExpression}
                onChange={this.onTipExpResolveChange} widgetId={this.props.id}
                onLoading={() => { this.onArcadeLoadingChange('tip') }}
                onLoaded={() => { this.onArcadeLoadingChange('tip', false) }}
              />
              <ExpressionResolverComponent useDataSources={this.props.useDataSources} expression={this.state.urlExpression}
                onChange={this.onUrlExpResolveChange} widgetId={this.props.id}
                onLoading={() => { this.onArcadeLoadingChange('url') }}
                onLoaded={() => { this.onArcadeLoadingChange('url', false) }}
              />
            </div>
          }
        </div>
        <DynamicStyleResolverComponent
          widgetId={this.props.widgetId}
          useDataSources={this.props.useDataSources}
          dynamicStyleConfig={this.props.config?.styleConfig?.customStyle?.regular?.dynamicStyleConfig}
          onChange={this.onRegularDynamicStyleChange}
        />
        <DynamicStyleResolverComponent
          widgetId={this.props.widgetId}
          useDataSources={this.props.useDataSources}
          dynamicStyleConfig={this.props.config?.styleConfig?.customStyle?.hover?.dynamicStyleConfig}
          onChange={this.onHoverDynamicStyleChange}
        />
      </div>
    )
  }
}