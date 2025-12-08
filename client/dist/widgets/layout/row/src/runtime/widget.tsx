/** @jsx jsx */
import { React, type AllWidgetProps, jsx, css } from 'jimu-core'
import defaultMessages from './translations/default'
import { WidgetPlaceholder } from 'jimu-ui'
import { RowLayoutViewer } from 'jimu-layouts/layout-runtime'

const IconImage = require('../../icon.svg')

export default class Widget extends React.PureComponent<AllWidgetProps<null>> {
  render (): React.JSX.Element {
    // otherProps may come from Flow Layout
    const { layouts, id, intl, builderSupportModules, ...otherProps } = this.props
    const LayoutComponent = !window.jimuConfig.isInBuilder
      ? RowLayoutViewer
      : builderSupportModules.widgetModules.RowLayoutBuilder

    if (LayoutComponent == null) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No layout component!</div>
      )
    }
    const layoutName = Object.keys(layouts)[0]

    return (
      <div
        className='widget-row-layout d-flex justify-content-center d-flex w-100' css={
          css`height: 100%;`
        }
      >
        <LayoutComponent
          layouts={layouts[layoutName]} widgetId={id} {...otherProps}
        >
          <WidgetPlaceholder
            icon={IconImage}
            widgetId={id}
            style={{
              border: 'none',
              pointerEvents: 'none'
            }}
            name={intl.formatMessage({ id: 'tips', defaultMessage: defaultMessages.tips })}
          />
        </LayoutComponent>
      </div>
    )
  }
}
