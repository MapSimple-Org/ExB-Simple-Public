/** @jsx jsx */
import { React, css, jsx, AppMode, type SizeModeLayoutJson, type IntlShape, type IMThemeVariables, getAppStore } from 'jimu-core'
import type { ToolConfig, IMToolOptions } from '../../config'
import type { LayoutJson, GroupJson, LayoutItemJson, HiddenElementNames } from './config'
import Group from './base/group'
import type { ActiveToolInfo } from './base/base-tool'
import type { JimuMapView } from 'jimu-arcgis'

interface LayoutProps {
  mapWidgetId: string
  layoutConfig: LayoutJson
  toolConfig: ToolConfig
  toolOptions: IMToolOptions

  jimuMapView: JimuMapView
  isMobile: boolean
  theme: IMThemeVariables

  appMode: AppMode
  layouts: { [name: string]: SizeModeLayoutJson }
  LayoutEntry?: any
  widgetManifestName: string

  widgetHeight?: number
  intl?: IntlShape

  activeToolInfo: ActiveToolInfo
  onActiveToolInfoChange: (activeToolInfo: ActiveToolInfo) => void
  autoControlWidgetId: string

  mapComponentsLoaded: boolean
  mapRootClassName: string

  onMouseOverPopper: () => void
  onMouseOutPopper: () => void
}

interface LayoutState {
  toolsContentInMobileExpandPanel?: React.JSX.Element
  hiddenElementNames: HiddenElementNames
}

export type { ActiveToolInfo }

export default class MapToolLayout extends React.PureComponent<LayoutProps, LayoutState> {
  constructor (props) {
    super(props)

    this.state = {
      toolsContentInMobileExpandPanel: null,
      hiddenElementNames: []
    }
  }

  getStyle () {
    return css`
      z-index: 8;
      pointer-events: none;

      .expand-panel-transition {
        transition: opacity 0.3s, right 0.3s;
      }

      .scale-attribution-xy-group {
        > div:first-of-type:nth-last-of-type(1) {
          width: 100%;
          max-width: 100% !important;
        }
      }

      .exbmap-ui-hidden-element {
        display: none !important;
      }

      .exbmap-ui-pc-expand-maxheight {
        max-height: ${this.getMaxHeightForPcExpand(this.props.widgetHeight)}px;
        overflow: auto
      }
      `
  }

  getMaxHeightForPcExpand = (widgetHeight: number): number => {
    if (!widgetHeight) {
      return null
    } else {
      if (widgetHeight < 65) {
        return null
      } else {
        const resultHeight = widgetHeight - 65
        if (resultHeight < 300) {
          return resultHeight
        } else {
          return 300
        }
      }
    }
  }

  handSetHiddenElementNames = (elementNames: HiddenElementNames) => {
    this.setState({
      hiddenElementNames: elementNames
    })
  }

  getLayoutContent (layoutJson: LayoutJson) {
    if (!layoutJson || !this.props.toolConfig) {
      return null
    } else {
      return (
        <div className='exbmap-ui esri-ui-inner-container map-tool-layout' css={this.getStyle()}>
          {Object.keys(layoutJson.layout).map((key, index) => {
            const elementItem = layoutJson.elements[key] as GroupJson
            const layoutItem: LayoutItemJson = layoutJson.layout[key]

            if (!elementItem || elementItem.type !== 'GROUP' || !layoutItem.isMainGroup) {
              return null
            }

            const appState = getAppStore().getState()

            const isRTL = appState?.appContext?.isRTL || false

            return (
              <Group
                mapWidgetId={this.props.mapWidgetId}
                className={elementItem.className}
                style={elementItem.style}
                isMobile={this.props.isMobile}
                isMainGroup
                key={index}
                layoutConfig={layoutJson}
                toolConfig={this.props.toolConfig}
                toolOptions={this.props.toolOptions}
                activeToolInfo={this.props.activeToolInfo}
                jimuMapView={this.props.jimuMapView}
                groupName={key}
                onActiveToolInfoChange={this.props.onActiveToolInfoChange}
                hiddenElementNames={layoutJson.mobileResponsiveStrategy && this.state.hiddenElementNames} intl={this.props.intl}
                onSetHiddenElementNames={this.handSetHiddenElementNames}
                theme={this.props.theme}
                autoControlWidgetId={this.props.autoControlWidgetId}
                isRTL={isRTL}
                mapComponentsLoaded={this.props.mapComponentsLoaded}
                mapRootClassName={this.props.mapRootClassName}
                onMouseOverPopper={this.props.onMouseOverPopper}
                onMouseOutPopper={this.props.onMouseOutPopper}
              />
            )
          })}
        </div>
      )
    }
  }

  componentDidUpdate (prevProps: LayoutProps) {
    if (prevProps.appMode !== this.props.appMode && this.props.appMode === AppMode.Design) {
      this.props.onActiveToolInfoChange(null)
    }
  }

  render () {
    return this.getLayoutContent(this.props.layoutConfig)
  }
}
