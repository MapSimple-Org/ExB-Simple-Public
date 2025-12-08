/** @jsx jsx */
import { React, jsx, Immutable, type IMThemeVariables } from 'jimu-core'
import type { IMTextFontStyle, FontStyleKeys } from 'jimu-ui'
import { TextStyle, type TextStyleProps } from 'jimu-ui/advanced/style-setting-components'

interface Props {
  text: IMTextFontStyle
  appTheme: IMThemeVariables
  onChange: (text: IMTextFontStyle) => void
}

export default class FontStyleSetting extends React.PureComponent<Props> {
  changeText = (k: Partial<FontStyleKeys>, v: any) => {
    const text = this.props.text ? this.props.text.set(k, v) : (Immutable({ [k]: v }) as IMTextFontStyle)
    this.props.onChange(text)
  }

  render () {
    return <TextStyle {...this.props.text as TextStyleProps} applyDefaultValue={false} onChange={this.changeText} />
  }
}
