/** @jsx jsx */
import { React, jsx, type IntlShape, type IMIconProps, Immutable, defaultMessages as jimuCoreMessages, type ImmutableObject, type IMThemeVariables } from 'jimu-core'
import { CollapsableResetPanel, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type StyleSettings, type TextFontStyle, defaultMessages as jimuUiMessages } from 'jimu-ui'

import type { IMAdvanceStyleSettings } from '../../../config'

import CommonStyleSetting from './components/common-style-setting'
import IconStyleSetting from './components/icon-style-setting'
import FontStyleSetting from './components/font-style-setting'

interface Props {
  onChange: (style: IMAdvanceStyleSettings) => void
  style: IMAdvanceStyleSettings
  intl: IntlShape
  appTheme: IMThemeVariables
  isTextSettingOpen: boolean
  isIconSettingOpen: boolean
  disableBorderRadius?: boolean
}

export const isObjectEmpty = (obj: { [key: string]: any }) => {
  if (!obj) return true
  const notEmpty = Object.keys(obj).some(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
  return !notEmpty
}

export default class AdvanceStyleSetting extends React.PureComponent<Props> {
  onTextChange = (text: TextFontStyle) => {
    const mergedStyle = this.getStyleFromCustom()
    const style = mergedStyle.set('text', text)
    this.props.onChange(style)
  }

  onIconChange = (iconProps: IMIconProps) => {
    const mergedStyle = this.getStyleFromCustom()
    const style = mergedStyle.set('iconProps', iconProps)
    this.props.onChange(style)
  }

  onCommonChange = (style: ImmutableObject<StyleSettings>) => {
    this.props.onChange(Immutable(style))
  }

  getStyleFromCustom = (): IMAdvanceStyleSettings => {
    return this.props.style || Immutable({})
  }

  render () {
    const style = this.getStyleFromCustom()
    const { isTextSettingOpen, isIconSettingOpen, intl, appTheme, disableBorderRadius } = this.props

    const textString = intl.formatMessage({ id: 'text', defaultMessage: jimuUiMessages.text })
    const IconString = intl.formatMessage({ id: 'icon', defaultMessage: jimuCoreMessages.icon })

    return (
      <div className="advance-style-setting mt-4">
        {isTextSettingOpen &&
          <SettingRow>
            <CollapsableResetPanel label={textString} isEmpty={isObjectEmpty(style.text)} bottomLine onReset={() => { this.onTextChange(null) }}>
              <FontStyleSetting appTheme={appTheme} text={style.text} onChange={this.onTextChange} />
            </CollapsableResetPanel>
          </SettingRow>
        }
        {isIconSettingOpen &&
          <SettingRow>
            <CollapsableResetPanel label={IconString} isEmpty={isObjectEmpty(style.iconProps)} bottomLine onReset={() => { this.onIconChange(null) }}>
              <IconStyleSetting appTheme={appTheme} intl={intl} iconProps={style.iconProps} onChange={this.onIconChange} />
            </CollapsableResetPanel>
          </SettingRow>
        }
        <CommonStyleSetting intl={intl} style={style as ImmutableObject<StyleSettings>} onChange={this.onCommonChange} disableBorderRadius={disableBorderRadius}/>
      </div>
    )
  }
}
