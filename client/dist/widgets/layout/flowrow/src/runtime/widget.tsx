/** @jsx jsx */
import { React, type AllWidgetProps, jsx, css, type SerializedStyles } from 'jimu-core'
import { WidgetPlaceholder } from 'jimu-ui'
import { FlexRowLayoutViewer } from 'jimu-layouts/layout-runtime'
import type { IMFlexRowConfig } from '../config'
import defaultMessages from './translations/default'

const IconImage = require('../../icon.svg')

export default class Widget extends React.PureComponent<AllWidgetProps<IMFlexRowConfig>> {
  getStyle (): SerializedStyles {
    return css`
      & > div.flex-row-layout {
        height: 100%;
        overflow: hidden;
        display: flex;

        & > .trail-container {
          height: 100%;
          overflow: hidden;
        }
      }
    `
  }

  render () {
    const { layouts, id, intl, builderSupportModules } = this.props
    const LayoutComponent = !window.jimuConfig.isInBuilder
      ? FlexRowLayoutViewer
      : builderSupportModules.widgetModules.FlexRowLayoutBuilder

    if (LayoutComponent == null) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          No layout component!
        </div>
      )
    }
    const layoutName = Object.keys(layouts)[0]

    return (
      <div className='widget-flex-row-layout w-100 h-100' css={this.getStyle()} style={{ overflow: 'auto' }}>
        <LayoutComponent layouts={layouts[layoutName]}>
          <WidgetPlaceholder
            icon={IconImage} widgetId={id}
            style={{
              border: 'none',
              height: '100%',
              pointerEvents: 'none',
              position: 'absolute'
            }}
            name={intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })}
          />
        </LayoutComponent>
      </div>
    )
  }
}
