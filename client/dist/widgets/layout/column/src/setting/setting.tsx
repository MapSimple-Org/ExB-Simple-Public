/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { type AllWidgetSettingProps, getAppConfigAction } from 'jimu-for-builder'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type LinearUnit, Select, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { type ColumnLayoutSetting, utils } from 'jimu-layouts/layout-runtime'
import type { IMFlexboxConfig } from '../config'
import { defaultConfig } from '../default-config'
import { Padding, InputUnit } from 'jimu-ui/advanced/style-setting-components'
import defaultMessages from './translations/default'

const messages = Object.assign(
  {},
  defaultMessages,
  jimuUIDefaultMessages
)

const inputStyle = { width: 110 }

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMFlexboxConfig>> {
  handleSpaceChange = (value: LinearUnit): void => {
    const appConfigAction = getAppConfigAction()

    appConfigAction.editWidgetProperty(this.props.id, 'config.space', value)

    this.getLayoutIds().forEach(layoutId => {
      appConfigAction.editLayoutProperty(layoutId, 'setting.space', value.distance)
    })
    appConfigAction.exec()
  }

  handlePaddingChange = (value): void => {
    const appConfigAction = getAppConfigAction()

    appConfigAction.editWidgetProperty(this.props.id, 'config.style.padding', value)

    this.getLayoutIds().forEach(layoutId => {
      appConfigAction.editLayoutProperty(layoutId, 'setting.padding', value)
    })
    appConfigAction.exec()
  }

  handleJustifyContentChange = (e): void => {
    const appConfigAction = getAppConfigAction()

    appConfigAction.editWidgetProperty(this.props.id, 'config.style.justifyContent', e.target.value)

    this.getLayoutIds().forEach(layoutId => {
      appConfigAction.editLayoutProperty(layoutId, 'setting.justifyContent', e.target.value)
    })
    appConfigAction.exec()
  }

  getLayoutIds (): string[] {
    const result = []

    const { layouts } = this.props
    if (layouts != null) {
      const layoutName = Object.keys(layouts)[0]
      const sizemodeLayouts = layouts[layoutName]
      Object.keys(sizemodeLayouts).forEach(sizemode => {
        result.push(sizemodeLayouts[sizemode])
      })
    }
    return result
  }

  getLayoutSetting (): ColumnLayoutSetting {
    const { layouts } = this.props
    if (layouts != null) {
      const layoutName = Object.keys(layouts)[0]
      const sizemodeLayouts = layouts[layoutName]
      const layoutId = sizemodeLayouts[utils.getCurrentSizeMode()]
      const appConfigAction = getAppConfigAction()
      return appConfigAction.appConfig.layouts[layoutId]?.setting
    }
  }

  formatMessage = (id: string): string => {
    return this.props.intl.formatMessage({ id, defaultMessage: messages[id] })
  }

  render (): React.JSX.Element {
    const layoutSetting = this.getLayoutSetting()

    return (
      <div className='flexbox-layout-setting'>
        <SettingSection title={this.formatMessage('layout')} role='group' aria-label={this.formatMessage('layout')}>
          <SettingRow label={this.formatMessage('verticalAlign')}>
            <Select
              aria-label={this.formatMessage('verticalAlign')}
              value={layoutSetting?.justifyContent ?? 'flex-start'}
              size='sm'
              onChange={this.handleJustifyContentChange}
              style={inputStyle}
            >
              <option value='flex-start'>{this.formatMessage('start')}</option>
              <option value='flex-end'>{this.formatMessage('end')}</option>
              <option value='center'>{this.formatMessage('center')}</option>
              <option value='space-around'>{this.formatMessage('spaceAround')}</option>
              <option value='space-between'>{this.formatMessage('spaceBetween')}</option>
              <option value='space-evenly'>{this.formatMessage('spaceEvenly')}</option>
            </Select>
          </SettingRow>
          <SettingRow label={this.formatMessage('gap')}>
            <InputUnit
              aria-label={this.formatMessage('gap')}
              precision={0}
              value={{ distance: layoutSetting?.space >= 0 ? layoutSetting.space : defaultConfig.space, unit: undefined }} min={0}
              onChange={this.handleSpaceChange} style={inputStyle}
            />
          </SettingRow>
          <SettingRow role='group' aria-label={this.formatMessage('padding')} label={this.formatMessage('padding')} flow='wrap'>
            <Padding value={layoutSetting?.padding as any} onChange={this.handlePaddingChange}/>
          </SettingRow>
        </SettingSection>
      </div>
    )
  }
}
