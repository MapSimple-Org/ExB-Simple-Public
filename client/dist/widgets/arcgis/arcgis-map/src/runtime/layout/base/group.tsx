/** @jsx jsx */
import { css, jsx, React, classNames, ReactResizeDetector, type IntlShape } from 'jimu-core'
import { UIComponent, type UIComponentProps } from './ui-component'
import type { ToolConfig, IMToolOptions } from '../../../config'
import type { LayoutJson, GroupJson, HiddenElementNames, ToolJson } from '../config'
import BaseToolShell from './base-tool-shell'
import type { ActiveToolInfo } from './base-tool'
import ToolModules from '../tool-modules'
import { MobilePanel } from 'jimu-ui'
import { MultiSourceMapContext } from '../../components/multisourcemap-context'

interface GroupProps extends UIComponentProps {
  mapWidgetId: string
  layoutConfig: LayoutJson
  toolConfig: ToolConfig
  toolOptions: IMToolOptions
  groupName: string
  className: string
  style: React.CSSProperties
  isMobile?: boolean
  isMainGroup?: boolean
  // checkResponsive() will check height and use props.onSetHiddenElementNames() to set element names that need to hide
  hiddenElementNames?: HiddenElementNames
  // true means we should hide the Group div with class .exbmap-ui-hidden-element because checkResponsive() method think the height is small.
  isHidden?: boolean
  isThumbMap?: boolean
  intl?: IntlShape
  isRTL: boolean
  mapComponentsLoaded: boolean
  mapRootClassName: string

  activeToolInfo: ActiveToolInfo
  onActiveToolInfoChange: (activeToolInfo: ActiveToolInfo) => void
  onSetHiddenElementNames?: (hiddenElementNames: HiddenElementNames) => void
  autoControlWidgetId: string

  onMouseOverPopper: () => void
  onMouseOutPopper: () => void
}

interface GroupStates {
  bottomPanelHeight?: number
  widgetWidth?: number
  widgetHeight?: number
  isThumbMap?: boolean
}

export default class Group extends UIComponent<GroupProps, GroupStates> {
  reactResizeDetectorRef = React.createRef<HTMLDivElement>()
  groupConRef = React.createRef<HTMLDivElement>()
  getStyle () {
    const groupJson = this.props.layoutConfig.elements[this.props.groupName] as GroupJson
    const direction = groupJson.direction
    const isRTL = this.props.isRTL
    const isVertical = direction === 'vertical'

    let flexFlow = ''

    if (isVertical) {
      flexFlow = 'column'
    } else {
      if (isRTL) {
        flexFlow = 'row-reverse'
      } else {
        flexFlow = 'row'
      }
    }

    let alignItems = 'flex-start'

    if (isVertical) {
      if (groupJson.isVerticalRrlAlignItemsStart) {
        if (isRTL) {
          alignItems = 'flex-end'
        } else {
          alignItems = 'flex-start'
        }
      }

      if (groupJson.isVerticalRrlAlignItemsEnd) {
        if (isRTL) {
          alignItems = 'flex-start'
        } else {
          alignItems = 'flex-end'
        }
      }
    }

    return css`

      display: flex;
      flex-flow: ${flexFlow};
      align-items: ${alignItems};

      .exbmap-ui-group-expand-icon {
        fill: black;
        left: 8px;
        top: 8px;
        position: absolute;
        display: block;
      }

      .expand-mobile-panel {
        box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 2px;
        border-radius: 10px 10px 0px 0px;
      }

      .expand-mobile-panel-transition {
        transition: height 0.3s;
      }

      .expand-mobile-panel-touch-container {
        top: 0;
        position: absolute;
        width: 100%;
        height: 31px;
      }

      .expand-mobile-panel-bar {
        width: 36px;
        height: 4px;
        background-color: #434343;
        border-radius: 2px;
      }
      `
  }

  constructor (props) {
    super(props)

    this.state = {
      bottomPanelHeight: 0,
      isThumbMap: !!this.props.isMobile
    }
  }

  componentDidMount (): void {
    this.checkResponsive()
  }

  checkIsHiddenElement = (elementName) => {
    if (this.props.hiddenElementNames) {
      if (this.props.hiddenElementNames.includes(elementName)) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  /**
   * Hide some tools if widget hegith is too small.
   * This method only hide child element names if current group is main group and in mobile size.
   * @returns
   */
  checkResponsive = () => {
    if (!this.props.onSetHiddenElementNames) {
      return
    }

    if (!this.props.isMainGroup || !this.props.isMobile) {
      this.props.onSetHiddenElementNames([])
      return
    }

    const mobileResponsiveStrategy = this.props.layoutConfig.mobileResponsiveStrategy
    const aboveHeight = this.state.widgetHeight

    // see issue #2862 for more details
    let hiddenElementNames: string[] = []

    if (aboveHeight >= 465) {
      hiddenElementNames = []
    } else if (aboveHeight >= 400 && aboveHeight < 465) {
      hiddenElementNames = mobileResponsiveStrategy?.stage1 || []
    } else if (aboveHeight >= 320 && aboveHeight < 400) {
      hiddenElementNames = mobileResponsiveStrategy?.stage2 || []
    } else if (aboveHeight >= 250 && aboveHeight < 320) {
      hiddenElementNames = mobileResponsiveStrategy?.stage3 || []
    } else if (aboveHeight >= 160 && aboveHeight < 250) {
      hiddenElementNames = mobileResponsiveStrategy?.stage4 || []
    } else if (aboveHeight >= 54 && aboveHeight < 160) {
      hiddenElementNames = mobileResponsiveStrategy?.stage5 || []
    } else if (aboveHeight < 54) {
      hiddenElementNames = mobileResponsiveStrategy?.stage6 || []
    }

    this.props.onSetHiddenElementNames(hiddenElementNames)
  }

  onResize = ({ width, height }) => {
    if (!width || !height) {
      return
    }

    this.setState({
      widgetWidth: width,
      widgetHeight: height
      // isThumbMap: false
    }, () => {
      this.checkResponsive()
    })
  }

  returnNullNode = (key?) => {
    if (this.props.isMobile) {
      return <span key={key} />
    } else {
      return null
    }
  }

  checkIsLastElement = (parentGroupJson: GroupJson, toolJson: ToolJson) => {
    const toolName = toolJson.toolName
    const layoutJson = this.props.layoutConfig
    const children = layoutJson.layout[parentGroupJson.groupName].children
    const index = children.indexOf(toolName)
    if (index === children.length - 1) {
      return true
    }

    if (index < children.length - 1) {
      let isLastElement: boolean = true
      for (let i = (index + 1); i < children.length; i++) {
        const elementName = children[i]
        if (layoutJson.elements[children[i]].type === 'GROUP') {
          continue

        // @ts-expect-error
        } else if ((!ToolModules[elementName].getIsNeedSetting() || (this.props.toolConfig && this.props.toolConfig[`can${elementName}`]) ||
          (layoutJson.lockToolNames && layoutJson.lockToolNames.includes(elementName)))) {
          isLastElement = false
          break
        } else {
          continue
        }
      }
      return isLastElement
    }
  }

  handleToggleMobilePanel = () => {
    this.props.onActiveToolInfoChange(null)
  }

  handlePanelHeightChange = ({ width, height }) => {
    this.setState({ bottomPanelHeight: height }, () => {
      this.checkResponsive()
    })
  }

  getMobilePanelInContext = () => {
    return (
      <MultiSourceMapContext.Consumer>
        {({ mobilePanelContainer, mapWidgetId }) => (
          <MobilePanel
            className={`map-tool-mobile-panel ${this.props.mapRootClassName}`}
            mapWidgetId={mapWidgetId} title={this.props.activeToolInfo && this.props.activeToolInfo.activeToolTitle}
            open={!!this.props.activeToolInfo} onClose={() => { this.handleToggleMobilePanel() }}
          >
            <div className='w-100 h-100' ref={(container) => { if (mobilePanelContainer && container) { container.appendChild(mobilePanelContainer) } }} />
          </MobilePanel>
        )}
      </MultiSourceMapContext.Consumer>
    )
  }

  getGroupContent = (layoutJson: LayoutJson) => {
    if (!layoutJson) {
      return this.returnNullNode()
    } else {
      const children = layoutJson.layout[this.props.groupName] && layoutJson.layout[this.props.groupName].children
      if (this.checkIsShowGroup(layoutJson, children)) {
        const groupClassName = classNames(
          `exbmap-ui exbmap-ui-group exbmap-ui-group-${this.props.groupName}`,
          this.props.className,
          { 'exbmap-ui-hidden-element': this.props.isHidden }
        )

        const styleObj = this.props.layoutConfig.elements[this.props.groupName].style || {}

        return (
          <div
            id={(this.props.isMainGroup ? this.props.mapWidgetId : undefined)}
            css={this.getStyle()} className={groupClassName} style={styleObj}
            ref={this.groupConRef}
          >
            {children.map((key, index) => {
              if (!layoutJson.elements[key]) {
                return this.returnNullNode(index)
              }

              if (layoutJson.elements[key].type === 'GROUP') {
                return (
                  <Group
                    mapWidgetId={this.props.mapWidgetId}
                    isHidden={this.checkIsHiddenElement(key)}
                    className={(layoutJson.elements[key] as unknown as GroupJson).className}
                    style={layoutJson.elements[key].style}
                    key={index} layoutConfig={layoutJson}
                    toolConfig={this.props.toolConfig}
                    toolOptions={this.props.toolOptions}
                    isMobile={this.props.isMobile}
                    intl={this.props.intl}
                    jimuMapView={this.props.jimuMapView}
                    groupName={key}
                    activeToolInfo={this.props.activeToolInfo}
                    hiddenElementNames={this.props.hiddenElementNames}
                    onActiveToolInfoChange={this.props.onActiveToolInfoChange}
                    theme={this.props.theme}
                    isThumbMap={this.props.isMainGroup ? this.state.isThumbMap : this.props.isThumbMap}
                    autoControlWidgetId={this.props.autoControlWidgetId}
                    isRTL={this.props.isRTL}
                    mapComponentsLoaded={this.props.mapComponentsLoaded}
                    mapRootClassName={this.props.mapRootClassName}
                    onMouseOverPopper={this.props.onMouseOverPopper}
                    onMouseOutPopper={this.props.onMouseOutPopper}
                  />
                )
              } else if (layoutJson.elements[key].type === 'TOOL') {
                const toolName = (layoutJson.elements[key] as unknown as ToolJson).toolName
                const viewType = this.props.jimuMapView?.view?.type

                // Navigation is not available for 2D MapView.
                if ((toolName === 'Navigation' && viewType === '2d') || (toolName === 'ScaleBar' && viewType === '3d')) {
                  return this.returnNullNode(index)
                }

                // @ts-expect-error
                if (!ToolModules[key].getIsNeedSetting() || (this.props.toolConfig && this.props.toolConfig[`can${key}`]) || (layoutJson.lockToolNames && layoutJson.lockToolNames.includes(key))) {
                  return (
                    <BaseToolShell
                      mapWidgetId={this.props.mapWidgetId}
                      isHidden={this.checkIsHiddenElement(key)}
                      key={index}
                      layoutConfig={layoutJson}
                      activeToolInfo={this.props.activeToolInfo}
                      toolConfig={this.props.toolConfig}
                      toolOptions={this.props.toolOptions}
                      jimuMapView={this.props.jimuMapView}
                      toolName={key}
                      theme={this.props.theme}
                      onActiveToolInfoChange={this.props.onActiveToolInfoChange}
                      intl={this.props.intl}
                      isMobile={this.props.isMobile}
                      isLastElement={this.checkIsLastElement(layoutJson.elements[this.props.groupName] as GroupJson, layoutJson.elements[key] as unknown as ToolJson)}
                      autoControlWidgetId={this.props.autoControlWidgetId}
                      isRTL={this.props.isRTL}
                      mapComponentsLoaded={this.props.mapComponentsLoaded}
                      mapRootClassName={this.props.mapRootClassName}
                      onMouseOverPopper={this.props.onMouseOverPopper}
                      onMouseOutPopper={this.props.onMouseOutPopper}
                    />
                  )
                } else {
                  return this.returnNullNode(index)
                }
              } else {
                return this.returnNullNode(index)
              }
            })}
            {this.props.isMainGroup && this.props.isMobile && <ReactResizeDetector targetRef={this.groupConRef} handleWidth handleHeight onResize={this.onResize} />}
            {this.props.isMainGroup && this.props.isMobile && this.props.activeToolInfo && this.props.activeToolInfo.activeToolName !== 'Select' && this.getMobilePanelInContext()}
            {this.props.isMainGroup && <div
              className='exbmap-ui w-100'
              style={{
                position: 'relative',
                pointerEvents: 'auto',
                overflow: 'hidden',
                touchAction: 'none',
                display: this.props.isMobile && !(this.state.isThumbMap || this.props.isThumbMap) ? 'block' : 'none'
              }}
            >
              <div
                className={`${this.props.mapWidgetId}-bottom-panel exbmap-ui w-100 expand-mobile-panel`}
                style={{ overflow: 'hidden', pointerEvents: 'auto', position: 'relative', touchAction: 'none' }}
              >
                <div className='w-100 h-100' ref={this.reactResizeDetectorRef}>
                  <ReactResizeDetector targetRef={this.reactResizeDetectorRef} handleHeight onResize={this.handlePanelHeightChange} />
                </div>
              </div>
            </div>}
          </div>
        )
      } else {
        return this.returnNullNode()
      }
    }
  }

  checkIsShowGroup = (layoutJson: LayoutJson, children: string[]) => {
    if (!children || children.length === 0) {
      return false
    } else {
      const toolNames = []
      this.findAllToolNames(layoutJson, children, toolNames)
      let isShowGroup = false
      for (let i = 0; i < toolNames.length; i++) {
        // @ts-expect-error
        if (this.props.toolConfig[`can${toolNames[i]}`] || !ToolModules[toolNames[i]].getIsNeedSetting() ||
          (layoutJson.lockToolNames && layoutJson.lockToolNames.includes(toolNames[i]))) {
          isShowGroup = true
          break
        }
      }
      return isShowGroup
    }
  }

  findAllToolNames = (layoutJson: LayoutJson, children: string[], toolNames: string[]) => {
    if (!children || children.length === 0) {
      return
    }
    for (let i = 0; i < children.length; i++) {
      const childName = children[i]
      const elementInfo = layoutJson.elements[childName]

      if (elementInfo.type === 'GROUP') {
        const groupName = elementInfo.groupName
        this.findAllToolNames(layoutJson, layoutJson.layout[groupName] && layoutJson.layout[groupName].children, toolNames)
      } else {
        toolNames.push(children[i])
      }
    }
  }

  render () {
    if (this.props.isMainGroup && this.props.isMobile && this.props.toolConfig && this.props.toolConfig.canSelect) {
      return (
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
          <div id={`${this.props.mapWidgetId}-with-select-container`} style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
            <div className='w-100 h-100' style={{ position: 'relative' }}>
              {this.getGroupContent(this.props.layoutConfig)}
            </div>
          </div>
        </div>
      )
    } else {
      return this.getGroupContent(this.props.layoutConfig)
    }
  }
}
