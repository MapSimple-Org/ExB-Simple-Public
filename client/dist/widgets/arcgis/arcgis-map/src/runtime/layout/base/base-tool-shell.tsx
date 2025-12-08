/** @jsx jsx */
import { jsx, classNames, type IntlShape } from 'jimu-core'
import { UIComponent, type UIComponentProps } from './ui-component'
import type { ToolConfig, IMToolOptions } from '../../../config'
import type { ActiveToolInfo } from './base-tool'
import type { LayoutJson, ToolJson } from '../config'
import ToolModules from '../tool-modules'
export interface ToolShellProps extends UIComponentProps {
  mapWidgetId: string
  layoutConfig: LayoutJson
  toolConfig: ToolConfig
  toolOptions: IMToolOptions
  toolName: string
  isMobile?: boolean
  isHidden?: boolean
  intl?: IntlShape
  isLastElement?: boolean

  className?: string
  activeToolInfo: ActiveToolInfo
  onActiveToolInfoChange: (activeToolInfo: ActiveToolInfo) => void
  autoControlWidgetId: string

  isRTL: boolean
  mapComponentsLoaded: boolean
  mapRootClassName: string

  onMouseOverPopper: () => void
  onMouseOutPopper: () => void
}

export default class BaseToolShell extends UIComponent<ToolShellProps, unknown> {
  render () {
    const ToolClass = ToolModules[this.props.toolName]

    let isAvailable = true

    if (ToolClass) {
      if ((ToolClass as any).isAvailable) {
        isAvailable = (ToolClass as any).isAvailable(this.props)
      } else {
        isAvailable = true
      }
    } else {
      isAvailable = false
    }

    if (isAvailable) {
      const toolName = this.props.toolName
      const className = `exbmap-ui exbmap-ui-tool-shell divitem exbmap-ui-tool-shell-${toolName}`
      const toolJson = this.props.layoutConfig.elements[toolName] as ToolJson
      const styleObj = toolJson.style || {}
      const selfToolOptions = (this.props.toolOptions && this.props.toolOptions[toolName]) || null

      return (
        <div
          className={classNames(this.props.className, className, toolJson.className,
            {
              'exbmap-ui-hidden-element': this.props.isHidden,
              'rounded-pill': ['Compass'].includes(toolName)
            })}
          style={styleObj}
        >
          <ToolClass
            mapWidgetId={this.props.mapWidgetId}
            toolJson={toolJson}
            toolName={toolName}
            selfToolOptions={selfToolOptions}
            isMobile={this.props.isMobile}
            jimuMapView={this.props.jimuMapView}
            activeToolInfo={this.props.activeToolInfo}
            onActiveToolInfoChange={this.props.onActiveToolInfoChange}
            intl={this.props.intl}
            theme={this.props.theme}
            autoControlWidgetId={this.props.autoControlWidgetId}
            isRTL={this.props.isRTL}
            mapComponentsLoaded={this.props.mapComponentsLoaded}
            mapRootClassName={this.props.mapRootClassName}
            onMouseOverPopper={this.props.onMouseOverPopper}
            onMouseOutPopper={this.props.onMouseOutPopper}
          />
        </div>
      )
    } else {
      if (this.props.isMobile) {
        return <span />
      } else {
        return null
      }
    }
  }
}
