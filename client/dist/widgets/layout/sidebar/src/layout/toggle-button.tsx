/** @jsx jsx */
import { React, jsx, css, i18n, moduleLoader, type SerializedStyles, Immutable, getAppStore, type IMAppConfig, type IMState } from 'jimu-core'
import { Icon, Button, type BorderStyle, styleUtils } from 'jimu-ui'
import { ThemeSwitchComponent } from 'jimu-theme'
import type * as jimuForBuilder from 'jimu-for-builder'
import { type ToggleBtnColor, CollapseSides, ICON_TYPE, SidebarType } from '../config'
import { findSyncedSidebar } from './util'
import leftIcon from 'jimu-icons/svg/outlined/directional/left.svg'
import rightIcon from 'jimu-icons/svg/outlined/directional/right.svg'
import upIcon from 'jimu-icons/svg/outlined/directional/up.svg'
import downIcon from 'jimu-icons/svg/outlined/directional/down.svg'
import arrowLeftIcon from 'jimu-icons/svg/outlined/directional/left-double.svg'
import arrowRightIcon from 'jimu-icons/svg/outlined/directional/right-double.svg'
import arrowUpIcon from 'jimu-icons/svg/outlined/directional/up-double.svg'
import arrowDownIcon from 'jimu-icons/svg/outlined/directional/down-double.svg'
import fillLeftIcon from 'jimu-icons/svg/filled/directional/left.svg'
import fillRightIcon from 'jimu-icons/svg/filled/directional/right.svg'
import fillUpIcon from 'jimu-icons/svg/filled/directional/up.svg'
import fillDownIcon from 'jimu-icons/svg/filled/directional/down.svg'
import { VisibleOutlined } from 'jimu-icons/outlined/application/visible'
import { InvisibleOutlined } from 'jimu-icons/outlined/application/invisible'

const ICONS = {}
ICONS[ICON_TYPE.Left] = leftIcon
ICONS[ICON_TYPE.Right] = rightIcon
ICONS[ICON_TYPE.Up] = upIcon
ICONS[ICON_TYPE.Down] = downIcon

const ARROW_ICONS = {}
ARROW_ICONS[ICON_TYPE.Left] = arrowLeftIcon
ARROW_ICONS[ICON_TYPE.Right] = arrowRightIcon
ARROW_ICONS[ICON_TYPE.Up] = arrowUpIcon
ARROW_ICONS[ICON_TYPE.Down] = arrowDownIcon

const FILL_ICONS = {}
FILL_ICONS[ICON_TYPE.Left] = fillLeftIcon
FILL_ICONS[ICON_TYPE.Right] = fillRightIcon
FILL_ICONS[ICON_TYPE.Up] = fillUpIcon
FILL_ICONS[ICON_TYPE.Down] = fillDownIcon

function getIcon (icon: ICON_TYPE, iconSource: number) {
  if (iconSource === 1) {
    return ARROW_ICONS[icon]
  }
  if (iconSource === 2) {
    return FILL_ICONS[icon]
  }
  return ICONS[icon]
}

export interface SidebarControllerProps {
  expanded: boolean
  icon: ICON_TYPE
  iconSource: number
  iconSize: number
  border: BorderStyle
  color: ToggleBtnColor
  shouldFlip: boolean
  width: number
  height: number
  style: any
  widgetId: string
  showAsExpressTip?: boolean
  onClick: (e) => void
}

export class SidebarController extends React.PureComponent<SidebarControllerProps> {
  ref: HTMLDivElement

  getStyle (isExpressMode: boolean): SerializedStyles {
    const { width, height, color, border, showAsExpressTip, widgetId } = this.props

    const appConfig = getAppStore().getState().appConfig
    const widgetJson = appConfig.widgets[widgetId]
    const direction = widgetJson.config.direction
    const collapseSide = widgetJson.config.collapseSide
    let transform: string
    let toggleBtnTransform: string

    if (direction === SidebarType.Vertical) {
      transform = 'none'
      toggleBtnTransform = collapseSide === CollapseSides.First ? `translate(-8px, ${height - 8}px)` : `translate(-8px, -${height - 8}px)`
    } else {
      transform = 'translateY(-24px)'
      toggleBtnTransform = collapseSide === CollapseSides.First ? `translate(${width - 8}px, 8px)` : `translate(-${width - 8}px, 8px)`
    }

    return css`
      display: flex;
      justify-content: flex-start;
      flex-direction: ${direction === SidebarType.Vertical ? 'row' : 'column-reverse'};
      align-items: ${collapseSide === CollapseSides.Second ? 'end' : 'start'};
      width: ${width + 24}px;
      height: ${height + 24}px;
      transform: ${transform};
      pointer-events: none;
      position: absolute;
      right: ${direction === SidebarType.Horizontal && collapseSide === CollapseSides.Second ? 0 : 'auto'};
      bottom: ${direction === SidebarType.Vertical && collapseSide === CollapseSides.Second ? 0 : 'auto'};

      .sidebar-controller {
        padding: 0;
        width: ${width}px;
        height: ${height}px;
        overflow: ${isExpressMode ? 'visible' : 'hidden'};

        background-color: ${showAsExpressTip ? 'var(--sys-color-primary)' : color.normal.bg.color} !important;
        opacity: ${showAsExpressTip ? 0.5 : 1};
        &:hover {
          background-color: ${showAsExpressTip ? 'var(--sys-color-primary)' : color.hover.bg.color} !important;
          opacity: ${showAsExpressTip ? 0.8 : 1};
        }

        border: ${showAsExpressTip ? '2px dashed var(--ref-palette-primary-700)' : (styleUtils.toCSSBorder(border) ?? 'none')} !important;

        .jimu-icon {
          margin: 0;
        }
      }

      .toggle-visible-btn {
        width: 24px;
        height: 24px;
        display: none;
        transform: ${toggleBtnTransform};
        opacity: 0.75;
        border: 1px solid var(--sys-color-divider-secondary);
        background-color: var(--sys-color-surface-overlay);
        cursor: pointer;
      }

      &.active {
        pointer-events: auto;
        .toggle-visible-btn {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    `
  }

  flipStyle (style: { borderRadius?: string }): React.CSSProperties {
    if (!this.props.shouldFlip) {
      return style
    }
    let result = Immutable(style)
    if (style.borderRadius != null) {
      const fourSides = style.borderRadius.split(' ')
      result = result.set('borderRadius', `${fourSides[1]} ${fourSides[0]} ${fourSides[3]} ${fourSides[2]}`)
    }
    return result.asMutable()
  }

  isMainSizeMode () {
    let appConfig: IMAppConfig
    let appState: IMState
    if (window.jimuConfig.isBuilder) {
      appState = getAppStore().getState().appStateInBuilder
      appConfig = appState?.appConfig
    } else {
      appState = getAppStore().getState()
      appConfig = appState.appConfig
    }
    if (appConfig) {
      const sizeMode = appState.browserSizeMode
      return sizeMode === appConfig.mainSizeMode
    }
    return false
  }

  toggleVisible = (e) => {
    e.stopPropagation()
    const { widgetId, showAsExpressTip } = this.props
    moduleLoader.loadModule<typeof jimuForBuilder>('jimu-for-builder').then((module) => {
      const { getAppConfigAction } = module
      const appConfigAction = getAppConfigAction()
      const widgetJson = appConfigAction.appConfig.widgets[widgetId]
      const config = widgetJson.config.setIn(['toggleBtn', 'visible'], showAsExpressTip)
      appConfigAction.editWidgetConfig(widgetId, config)

      // sync other sidebars
      const syncedSidebarIds = findSyncedSidebar(appConfigAction.appConfig, widgetId)
      syncedSidebarIds.forEach((id) => {
        const widgetJson = appConfigAction.appConfig.widgets[id]
        const config = widgetJson.config.setIn(['toggleBtn', 'visible'], showAsExpressTip)
        appConfigAction.editWidgetConfig(id, config)
      })

      appConfigAction.exec()
    }).catch(err => {
      console.error(err)
    })
  }

  render (): React.JSX.Element {
    const { icon, iconSize, iconSource, style, expanded, shouldFlip, color, showAsExpressTip, onClick } = this.props
    const rotate = shouldFlip ? 180 : 0
    const title = i18n.getIntl().formatMessage({ id: expanded ? 'collapse' : 'expand' })
    const isExpressMode = window.jimuConfig.isInBuilder && window.parent.isExpressBuilder
    return (
      <ThemeSwitchComponent useTheme2={showAsExpressTip}>
        <div ref={(elem) => { this.ref = elem }} css={this.getStyle(isExpressMode)} onMouseLeave={() => { this.ref.classList.remove('active') }}>
          <Button
            className='sidebar-controller d-flex justify-content-center align-items-center'
            style={this.flipStyle(style)} onClick={onClick}
            aria-expanded={expanded} aria-label={title} title={title}
            onMouseEnter={() => { this.ref.classList.add('active') }}
          >
            <Icon
              className='icon' rotate={expanded ? 0 + rotate : 180 + rotate}
              icon={getIcon(icon, iconSource)} size={iconSize} color={showAsExpressTip ? '#000' : color.normal.icon.color}
            />
          </Button>
          {isExpressMode && this.isMainSizeMode() && (
            <ThemeSwitchComponent useTheme2={window.jimuConfig.isInBuilder}>
              <div className='toggle-visible-btn rounded-circle' title={i18n.getIntl().formatMessage({ id: showAsExpressTip ? 'clickToShow' : 'clickToHide' })} onClick={this.toggleVisible}>
                {showAsExpressTip ? <InvisibleOutlined color='var(--sys-color-action-text)'/> : <VisibleOutlined color='var(--sys-color-action-text)'/>}
              </div>
            </ThemeSwitchComponent>
          )}
        </div>
      </ThemeSwitchComponent>
    )
  }
}
