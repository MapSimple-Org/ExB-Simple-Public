/** @jsx jsx */
import { React, jsx, type IntlShape, type IMIconProps, Immutable, defaultMessages as jimuCoreMessages, type ImmutableObject, type IMThemeVariables, type UseDataSource, type ImmutableArray, type Expression, type IMDynamicStyleTypes, DynamicStyleType } from 'jimu-core'
import { CollapsableResetPanel, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type StyleSettings, type TextFontStyle, defaultMessages as jimuUiMessages } from 'jimu-ui'
import { DynamicStyleBuilderSwitch } from 'jimu-ui/advanced/dynamic-style-builder'
import defaultMessages from '../../translations/default'
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
  widgetId: string
  useDataSourcesEnabled: boolean
  useDataSources: ImmutableArray<UseDataSource>
  expressions: Expression[] | ImmutableArray<Expression>

}

export const isObjectEmpty = (obj: { [key: string]: any }) => {
  if (!obj) return true
  const notEmpty = Object.keys(obj).some(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
  return !notEmpty
}

const BUTTON_CONDITION_DYNAMIC_STYLE_OPTIONS: IMDynamicStyleTypes = Immutable([
  DynamicStyleType.Text,
  DynamicStyleType.Background,
  DynamicStyleType.Border,
  DynamicStyleType.Icon
])

const BUTTON_ARCADE_DYNAMIC_STYLE_OPTIONS: IMDynamicStyleTypes = Immutable([
  DynamicStyleType.Text,
  DynamicStyleType.Background,
  DynamicStyleType.Border,
  DynamicStyleType.Icon,
  DynamicStyleType.BorderRadius
])

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

  onDynamicStyleSwitchChange = (_event, isChecked: boolean) => {
    const mergedStyle = this.getStyleFromCustom()
    let style = mergedStyle.set('enableDynamicStyle', isChecked)
    if (!isChecked) {
      style = style.without('dynamicStyleConfig')
    }
    this.props.onChange(style)
  }

  onDynamicStyleBuilderConfigChange = (config: IMAdvanceStyleSettings['dynamicStyleConfig']) => {
    const mergedStyle = this.getStyleFromCustom()
    const style = mergedStyle.set('dynamicStyleConfig', config)
    this.props.onChange(style)
  }

  getStyleFromCustom = (): IMAdvanceStyleSettings => {
    return this.props.style || Immutable({})
  }

  render() {
    const style = this.getStyleFromCustom()
    const { isTextSettingOpen, isIconSettingOpen, intl, appTheme, widgetId, useDataSources, expressions } = this.props

    const textString = intl.formatMessage({ id: 'text', defaultMessage: jimuUiMessages.text })
    const IconString = intl.formatMessage({ id: 'icon', defaultMessage: jimuCoreMessages.icon })
    const configuredExpressionsLabel = intl.formatMessage({ id: 'dynamicStyleExpressionsLabel', defaultMessage: defaultMessages.dynamicStyleExpressionsLabel })
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
        <CommonStyleSetting intl={intl} style={style as ImmutableObject<StyleSettings>} onChange={this.onCommonChange} />

        {this.props.useDataSourcesEnabled && this.props.useDataSources && this.props.useDataSources.length > 0 &&
          <SettingRow>
            <DynamicStyleBuilderSwitch
              widgetId={widgetId}
              useDataSources={useDataSources}
              expressions={expressions}
              widgetDynamicContentCapability='single'
              configuredExpressionsLabel={configuredExpressionsLabel}
              useIconsForArcade={true}
              config={this.props.style.dynamicStyleConfig}
              conditionStyleTypes={BUTTON_CONDITION_DYNAMIC_STYLE_OPTIONS}
              arcacdeStyleTypes={BUTTON_ARCADE_DYNAMIC_STYLE_OPTIONS}
              switchChecked={this.props.style.enableDynamicStyle}
              onChange={this.onDynamicStyleBuilderConfigChange}
              onSwitchChange={this.onDynamicStyleSwitchChange}
            />
          </SettingRow>
        }
      </div>
    )
  }
}
