/** @jsx jsx */
import { React, type AllWidgetProps, jsx, css, type SerializedStyles } from 'jimu-core'
import { GridLayoutViewer } from 'jimu-layouts/layout-runtime'

export default class Widget extends React.PureComponent<AllWidgetProps<unknown>> {
  getStyle (): SerializedStyles {
    return css`
      overflow: hidden;
    `
  }

  render (): React.JSX.Element {
    const { layouts, builderSupportModules } = this.props
    const LayoutComponent = !window.jimuConfig.isInBuilder
      ? GridLayoutViewer
      : builderSupportModules.widgetModules.GridLayoutBuilder

    if (LayoutComponent == null) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          No layout component!
        </div>
      )
    }
    const layoutName = Object.keys(layouts)[0]

    return (
      <div className='widget-grid-layout w-100 h-100' css={this.getStyle()}>
        <LayoutComponent layouts={layouts[layoutName]}>
        </LayoutComponent>
      </div>
    )
  }
}
