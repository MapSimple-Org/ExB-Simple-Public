/** @jsx jsx */
import { React, type AllWidgetProps, jsx, type IMState } from 'jimu-core'
import { SidebarLayout } from '../layout/runtime/layout'
import type { IMSidebarConfig } from '../config'
import { versionManager } from '../version-manager'

interface ExtraProps {
  sidebarVisible: boolean
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMSidebarConfig> & ExtraProps> {
  static mapExtraStateProps = (state: IMState, props: AllWidgetProps<IMSidebarConfig>): ExtraProps => {
    const defaultCollapse = props.config.defaultState !== 0
    return {
      sidebarVisible: state?.widgetsState?.[props.id]?.collapse ?? defaultCollapse
    }
  }

  static versionManager = versionManager

  render (): React.JSX.Element {
    const { layouts, theme, builderSupportModules } = this.props
    const LayoutComponent = !window.jimuConfig.isInBuilder
      ? SidebarLayout
      : builderSupportModules.widgetModules.SidebarLayoutBuilder

    if (LayoutComponent == null) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No layout component!</div>
      )
    }

    return (
      <div className='widget-sidebar-layout d-flex w-100 h-100'>
        <LayoutComponent
          theme={theme}
          widgetId={this.props.id}
          direction={this.props.config.direction}
          firstLayouts={layouts.FIRST}
          secondLayouts={layouts.SECOND}
          config={this.props.config}
          sidebarVisible={this.props.sidebarVisible}
        />
      </div>
    )
  }
}
