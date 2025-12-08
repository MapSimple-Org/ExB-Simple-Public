/** @jsx jsx */
import { React, jsx, type IntlShape, type IMIconProps, Immutable, type IMThemeVariables } from 'jimu-core'
import { DistanceUnits, type LinearUnit } from 'jimu-ui'
import { InputUnit } from 'jimu-ui/advanced/style-setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
interface Props {
  iconProps: IMIconProps
  intl: IntlShape
  appTheme: IMThemeVariables
  onChange: (iconProps: IMIconProps) => void
}

export default class IconStyleSetting extends React.PureComponent<Props> {
  units = [DistanceUnits.PIXEL]

  onSizeChange = (size: LinearUnit) => {
    this.changeIcon('size', size.distance)
  }

  onColorChange = (color: string) => {
    this.changeIcon('color', color)
  }

  changeIcon = (k: string, v: any) => {
    const properties: IMIconProps = this.props.iconProps ? this.props.iconProps.set(k, v) : (Immutable({ [k]: v }) as IMIconProps)
    this.props.onChange(properties)
  }

  render () {
    const properties = this.props.iconProps || ({} as IMIconProps)
    const size = isNaN(properties.size) ? undefined : properties.size + 'px'

    return (
      <div className="w-100 d-flex justify-content-between icon-size-font-style-setting">
        <InputUnit className='pr-1' units={this.units} value={size} applyDefaultValue={false} placeholder='##' onChange={this.onSizeChange}/>
        <ThemeColorPicker specificTheme={this.props.appTheme} value={properties.color} onChange={this.onColorChange}/>
      </div>
    )
  }
}
