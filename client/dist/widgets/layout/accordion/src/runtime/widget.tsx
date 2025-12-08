/** @jsx jsx */
import { React, type AllWidgetProps, jsx } from 'jimu-core'
import { AccordionLayoutViewer } from 'jimu-layouts/layout-runtime'
import { Paper, WidgetPlaceholder } from 'jimu-ui'
import defaultMessages from './translations/default'
import type { Config } from '../config'
import IconImage from '../../icon.svg'

export default class Widget extends React.PureComponent<AllWidgetProps<Config>> {
  render (): React.JSX.Element {
    const { layouts, id, intl, builderSupportModules } = this.props
    const LayoutComponent = !window.jimuConfig.isInBuilder
      ? AccordionLayoutViewer
      : builderSupportModules.widgetModules.AccordionLayoutBuilder

    if (LayoutComponent == null) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          No layout component!
        </div>
      )
    }
    const layoutName = Object.keys(layouts)[0]

    return (
      <Paper variant='flat' transparent className='widget-foldable-layout d-flex w-100 h-100'>
        <LayoutComponent
          layouts={layouts[layoutName]} isInWidget style={{
            overflow: 'auto',
            minHeight: 'none'
          }}
        >
          <WidgetPlaceholder
            icon={IconImage} widgetId={id}
            style={{
              border: 'none',
              height: '100%',
              pointerEvents: 'none',
              position: 'absolute'
            }}
            name={intl.formatMessage({ id: 'tips', defaultMessage: defaultMessages.tips })}
          />
        </LayoutComponent>
      </Paper>
    )
  }
}
