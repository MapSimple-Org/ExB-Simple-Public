/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { GridLayoutSetting } from 'jimu-layouts/layout-builder'

export default class Setting extends React.PureComponent<AllWidgetSettingProps<unknown>> {
  formatMessage = (id: string): string => {
    return this.props.intl.formatMessage({ id })
  }

  render (): React.JSX.Element {
    const layoutName = Object.keys(this.props.layouts)[0]

    const layouts = this.props.layouts[layoutName]

    return <GridLayoutSetting layouts={layouts} appTheme={this.props.theme2} formatMessage={this.formatMessage} />
  }
}
