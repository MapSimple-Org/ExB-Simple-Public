/** @jsx jsx */
import {
  React,
  jsx,
  css,
  type IMThemeVariables,
  classNames,
  type IMSizeModeLayoutJson,
  polished,
  getAppStore,
  appActions,
  type SerializedStyles,
  AppMode
} from 'jimu-core'
import { utils, PageContext, type PageContextProps } from 'jimu-layouts/layout-runtime'
import { styleUtils, Loading } from 'jimu-ui'
import { type IMSidebarConfig, SidebarType, CollapseSides, SidebarControllerPositions } from '../config'
import { SidebarController } from './toggle-button'

interface LayoutItemProps {
  // layoutId: string;
  // layoutItemId: string;
  itemStyle?: any
  innerLayouts: IMSizeModeLayoutJson
  style?: any
  className?: string
}

export interface SidebarProps {
  // layouts: IMSizeModeLayoutJson;
  widgetId: string
  direction: SidebarType
  theme: IMThemeVariables
  config: IMSidebarConfig
  firstLayouts: IMSizeModeLayoutJson
  secondLayouts: IMSizeModeLayoutJson
  sidebarVisible?: boolean
  appMode?: AppMode
}

interface State {
  deltaSize: number
  isResizing: boolean
}

const animation = css`
  transition: all 200ms;
`

export abstract class BaseSidebarLayout extends React.PureComponent<SidebarProps, State> {
  ref: HTMLElement
  splitRef: HTMLElement
  domSize: number
  interactable: Interact.Interactable
  layoutItemComponent: React.ComponentClass<LayoutItemProps & { collapsed?: boolean }>

  constructor (props) {
    super(props)

    this.state = {
      isResizing: false,
      deltaSize: 0
    }
  }

  componentDidMount (): void {
    const { firstLayouts, secondLayouts } = this.props
    if (firstLayouts != null && secondLayouts != null) {
      this.bindSplitHandler()
    }
  }

  componentDidUpdate (prevProps: SidebarProps): void {
    const { firstLayouts, secondLayouts } = this.props
    if (firstLayouts != null && secondLayouts != null && this.interactable == null) {
      this.bindSplitHandler()
    }
    if (this.interactable != null) {
      this.interactable.draggable({
        startAxis: this.props.direction === SidebarType.Horizontal ? 'x' : 'y',
        lockAxis: this.props.direction === SidebarType.Horizontal ? 'x' : 'y'
      })
    }
  }

  componentWillUnmount (): void {
    this.removeSplitHandler()
  }

  abstract bindSplitHandler: () => void

  removeSplitHandler = (): void => {
    if (this.interactable != null) {
      this.interactable.unset()
      this.interactable = null
    }
  }

  handleToggleSidebar (e): void {
    e.stopPropagation()
    getAppStore().dispatch(appActions.widgetStatePropChange(
      this.props.widgetId,
      'collapse',
      !this.props.sidebarVisible
    ))
  }

  calSidebarSize (): number {
    const { config } = this.props
    let size
    if (this.state.deltaSize !== 0) {
      if (utils.isPercentage(config.size)) {
        size = `${(parseFloat(config.size) * this.domSize) / 100 + this.state.deltaSize}px`
      } else {
        size = `${parseFloat(config.size) + this.state.deltaSize}px`
      }
    } else {
      size = config.size
    }
    return size
  }

  createCollapsibleSide (layouts: IMSizeModeLayoutJson, side: CollapseSides): React.JSX.Element {
    const { config, direction } = this.props
    const size = this.calSidebarSize()
    const shouldFlip = this.shouldFlipLeftAndRight()
    let translateSize = `${size}`
    if (utils.isPercentage(size)) {
      translateSize = '100%'
    }
    let sizeCSS
    if (direction === SidebarType.Horizontal) {
      sizeCSS = css`
        width: ${size};
        transform: ${config.overlay && !this.props.sidebarVisible
    ? (config.collapseSide === CollapseSides.First ? `translateX(-${translateSize})` : `translateX(${translateSize})`)
: 'none'};
        top: ${config.overlay ? 0 : 'auto'};
        bottom: ${config.overlay ? 0 : 'auto'};
        left: ${config.overlay && side === CollapseSides.First ? 0 : 'auto'};
        right: ${config.overlay && side === CollapseSides.Second ? 0 : 'auto'};
      `
    } else {
      sizeCSS = css`
        height: ${size};
        transform: ${config.overlay && !this.props.sidebarVisible
    ? (config.collapseSide === CollapseSides.First ? `translateY(-${translateSize})` : `translateY(${translateSize})`)
: 'none'};
        left: ${config.overlay ? 0 : 'auto'};
        right: ${config.overlay ? 0 : 'auto'};
        top: ${config.overlay && side === CollapseSides.First ? 0 : 'auto'};
        bottom: ${config.overlay && side === CollapseSides.Second ? 0 : 'auto'};
      `
    }
    const LayoutItem = this.layoutItemComponent
    return (
      <div
        css={css`
        ${this.state.isResizing ? '' : animation}
        ${sizeCSS}
        position: ${config.overlay ? 'absolute' : 'relative'};
        overflow: visible;
        z-index: 2;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: auto;
      `}
        className={classNames('d-flex side-collapsable', {
          'flex-column': direction === SidebarType.Vertical
        })}
      >
        {config.collapseSide === CollapseSides.Second && this.createController(shouldFlip)}
        <LayoutItem
          // layoutId={this.props.layoutId}
          // layoutItemId={side === CollapseSides.First ? '0' : '1'}
          innerLayouts={layouts}
          itemStyle={side === CollapseSides.First ? config.firstPanelStyle : config.secondPanelStyle}
          collapsed={!this.props.sidebarVisible}
          className={classNames({
            'h-100': direction === SidebarType.Vertical,
            'w-100': direction === SidebarType.Horizontal
          })}
        />
        {config.collapseSide === CollapseSides.First && this.createController(shouldFlip)}
      </div>
    )
  }

  splitStyle (): SerializedStyles {
    const { direction, config, appMode } = this.props
    const size = this.calSidebarSize()
    const collapsed = !this.props.sidebarVisible
    const lineStyle =
      config.divider == null || !config.divider.visible || config.divider.lineStyle == null
        ? 'none'
        : styleUtils.toCSSBorder(config.divider.lineStyle)
    if (direction === SidebarType.Horizontal) {
      return css`
        width: 1px;
        touch-action: none;
        user-select: none;
        border-left: ${lineStyle};
        position: ${config.overlay ? 'absolute' : 'relative'};
        left: ${config.overlay && !collapsed && config.collapseSide === CollapseSides.First ? size : 'auto'};
        right: ${config.overlay && !collapsed && config.collapseSide === CollapseSides.Second ? size : 'auto'};
        display: ${collapsed ? 'none' : 'block'};
        height: ${config.overlay ? '100%' : 'auto'};
        &:after {
          display: ${config.resizable || appMode === AppMode.Design ? 'block' : 'none'};
          position: absolute;
          content: '';
          width: 5px;
          top: 0;
          bottom: 0;
          left: -2px;
          cursor: col-resize;
        }
        z-index: 2;
      `
    }
    return css`
      height: 1px;
      touch-action: none;
      user-select: none;
      border-top: ${lineStyle};
      position: ${config.overlay ? 'absolute' : 'relative'};
      top: ${config.overlay && !collapsed && config.collapseSide === CollapseSides.First ? size : 'auto'};
      bottom: ${config.overlay && !collapsed && config.collapseSide === CollapseSides.Second ? size : 'auto'};
      display: ${collapsed ? 'none' : 'block'};
      width: ${config.overlay ? '100%' : 'auto'};
      &:after {
        display: ${config.resizable || appMode === AppMode.Design ? 'block' : 'none'};
        position: absolute;
        content: '';
        height: 5px;
        top: -2px;
        right: 0;
        left: 0;
        cursor: row-resize;
      }
      z-index: 2;
    `
  }

  createController (shouldFlip: boolean): React.JSX.Element {
    const { config, direction } = this.props
    if (config.toggleBtn != null && !config.toggleBtn.visible) {
      // if it's app in builder and in express mode, show the toggle button using another style
      if (!window.jimuConfig.isInBuilder || !window.parent?.isExpressBuilder) {
        return null
      }
    }
    const controllStyle = !this.props.sidebarVisible ? config.toggleBtn.expandStyle : config.toggleBtn.collapseStyle
    let top
    let left
    let offsetX = 0
    let offsetY = 0
    let posCSS
    if (direction === SidebarType.Horizontal) {
      if (config.toggleBtn.position === SidebarControllerPositions.Start) {
        top = 0
      } else if (config.toggleBtn.position === SidebarControllerPositions.Center) {
        top = '50%'
        offsetY = -config.toggleBtn.height / 2
      }
      const isLeftFixed = config.collapseSide === CollapseSides.Second
      posCSS = css`
        top: ${config.toggleBtn.position !== SidebarControllerPositions.End ? top : 'auto'};
        bottom: ${config.toggleBtn.position === SidebarControllerPositions.End ? 0 : 'auto'};
        right: ${isLeftFixed ? 'auto' : 0};
        left: ${isLeftFixed ? 0 : 'auto'};
      `
    } else {
      if (config.toggleBtn.position === SidebarControllerPositions.Start) {
        left = 0
      } else if (config.toggleBtn.position === SidebarControllerPositions.Center) {
        left = '50%'
        offsetX = -config.toggleBtn.width / 2
      }
      posCSS = css`
        left: ${config.toggleBtn.position !== SidebarControllerPositions.End ? left : 'auto'};
        right: ${config.toggleBtn.position === SidebarControllerPositions.End ? 0 : 'auto'};
        bottom: ${config.collapseSide === CollapseSides.First ? 0 : 'auto'};
        top: ${config.collapseSide === CollapseSides.Second ? 0 : 'auto'};
      `
    }

    const { style } = controllStyle
    const { iconSize, width, height, color, icon, border, iconSource } = config.toggleBtn

    return (
      <div
        css={css`
          ${posCSS}
          position: absolute;
          pointer-events: none;
          width: ${width}px;
          height: ${height}px;
          transform: translate(${config.toggleBtn.offsetX + offsetX}px, ${config.toggleBtn.offsetY + offsetY}px);
        `}
      >
        <SidebarController
          widgetId={this.props.widgetId} icon={icon} iconSize={iconSize} expanded={this.props.sidebarVisible}
          width={width} height={height} color={color} style={style} shouldFlip={shouldFlip}
          border={border} iconSource={iconSource}
          showAsExpressTip={window.jimuConfig.isInBuilder && window.parent?.isExpressBuilder && config.toggleBtn != null && !config.toggleBtn.visible}
          onClick={this.handleToggleSidebar.bind(this)}
        />
      </div>
    )
  }

  createNormalSide (layouts: IMSizeModeLayoutJson, side: CollapseSides): React.JSX.Element {
    const LayoutItem = this.layoutItemComponent
    const { config } = this.props
    return (
      <div
        css={this.state.isResizing ? '' : animation}
        className='flex-shrink-0 flex-grow-1 d-flex side-normal'
        style={{ zIndex: 0, flexBasis: !this.props.sidebarVisible ? '100%' : '0', overflow: 'auto' }}
      >
        <LayoutItem
          // layoutId={this.props.layoutId}
          // layoutItemId={side === CollapseSides.First ? '0' : '1'}
          itemStyle={side === CollapseSides.First ? config.firstPanelStyle : config.secondPanelStyle}
          innerLayouts={layouts}
          className='w-100'
        />
      </div>
    )
  }

  private shouldFlipLeftAndRight (): boolean {
    const { direction } = this.props
    if (direction === SidebarType.Horizontal) {
      const isRTL = getAppStore().getState().appContext.isRTL
      return isRTL // TODO need to update the logic
    }
    return false
  }

  createContent () {
    const { config, firstLayouts, secondLayouts } = this.props

    if (config.overlay) {
      // overlay should make sure the normal side' dom is before the collapsed side
      if (config.collapseSide === CollapseSides.First) {
        return (
          <React.Fragment>
            { this.createNormalSide(secondLayouts, CollapseSides.Second) }
            <div css={this.splitStyle()} ref={el => { this.splitRef = el }} />
            { this.createCollapsibleSide(firstLayouts, CollapseSides.First) }
          </React.Fragment>
        )
      }
      return (
        <React.Fragment>
          { this.createNormalSide(firstLayouts, CollapseSides.First) }
          <div css={this.splitStyle()} ref={el => { this.splitRef = el }} />
          { this.createCollapsibleSide(secondLayouts, CollapseSides.Second) }
        </React.Fragment>
      )
    }
    if (config.collapseSide === CollapseSides.First) {
      return (
        <React.Fragment>
          { this.createCollapsibleSide(firstLayouts, CollapseSides.First) }
          <div css={this.splitStyle()} ref={el => { this.splitRef = el }} />
          { this.createNormalSide(secondLayouts, CollapseSides.Second) }
        </React.Fragment>
      )
    }
    return (
      <React.Fragment>
        { this.createNormalSide(firstLayouts, CollapseSides.First) }
        <div css={this.splitStyle()} ref={el => { this.splitRef = el }} />
        { this.createCollapsibleSide(secondLayouts, CollapseSides.Second) }
      </React.Fragment>
    )
  }

  render (): React.JSX.Element {
    const { config, firstLayouts, secondLayouts, direction } = this.props
    if (firstLayouts == null || secondLayouts == null) {
      return (
        <Loading />
      )
    }

    return (
      <PageContext.Consumer>
        {(pageContext: PageContextProps) => {
          const builderTheme = pageContext.builderTheme
          return (
            <div
              className={classNames('d-flex w-100', {
                'flex-column': direction === SidebarType.Vertical
              })}
              ref={el => { this.ref = el }}
              css={css`
                border: 1px dashed ${builderTheme != null ? polished.rgba(builderTheme.ref.palette.neutral[900], 0.3) : ''};
                position: relative;
                overflow: hidden;
                user-select: ${this.state.isResizing ? 'none' : 'auto'};
                justify-content: ${config.collapseSide === CollapseSides.First ? 'flex-end' : 'flex-start'};
                body:not(.design-mode) & {
                  border: none;
                }
              `}
            >
              {this.createContent()}
            </div>
          )
        }}
      </PageContext.Consumer>
    )
  }
}
