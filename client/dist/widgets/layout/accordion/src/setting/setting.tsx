/** @jsx jsx */
import { React, jsx, css, Immutable, lodash } from 'jimu-core'
import { type AllWidgetSettingProps, getAppConfigAction } from 'jimu-for-builder'
import { DistanceUnits, type FourSidesUnit, CollapsablePanel, type LinearUnit, styleUtils, Label, Radio, Checkbox } from 'jimu-ui'
import { Padding, InputUnit, BorderSetting, BorderRadiusSetting } from 'jimu-ui/advanced/style-setting-components'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { UppercaseOutlined } from 'jimu-icons/outlined/editor/uppercase'
import type { Config } from '../config'
import defaultMessages from './translations/default'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { getTheme2, colorUtils } from 'jimu-theme'
import HeaderSetting from './header-setting'
import { ExpandedItems } from './expanded-items'

export default class Setting extends React.PureComponent<AllWidgetSettingProps<Config>> {
  formatMessage = (id: string): string => {
    return this.props.intl.formatMessage({ id, defaultMessage: defaultMessages[id] })
  }

  handlePaddingChange = (value: FourSidesUnit): void => {
    const paddingNumbers: number[] = styleUtils.expandStyleArray(value.number)
    const appConfigAction = getAppConfigAction()

    appConfigAction.editWidgetProperty(this.props.id, 'config.padding', {
      number: paddingNumbers,
      unit: value.unit
    }).exec()
  }

  useSingleMode = (): void => {
    const appConfigAction = getAppConfigAction()

    appConfigAction.editWidgetProperty(this.props.id, 'config.singleMode', true)
      .editWidgetProperty(this.props.id, 'config.expandedItems', [])
      .exec()
  }

  useMultipleMode = (): void => {
    const appConfigAction = getAppConfigAction()

    appConfigAction.editWidgetProperty(this.props.id, 'config.singleMode', false)
      .editWidgetProperty(this.props.id, 'config.expandedItems', [])
      .exec()
  }

  handleConfigChange = (prop: string, value: any) => {
    const appConfigAction = getAppConfigAction()

    if (prop === 'config.panel.backgroundColor') {
      // also change the text color for better UX
      const fg = colorUtils.getReadableThemeColor(value, getTheme2())
      appConfigAction.editWidgetProperty(this.props.id, 'config.panel.textColor', fg)
    }

    appConfigAction.editWidgetProperty(this.props.id, prop, value).exec()
  }

  handlePanelPaddingChange = (value: FourSidesUnit): void => {
    const paddingNumbers: number[] = styleUtils.expandStyleArray(value.number)
    const appConfigAction = getAppConfigAction()

    appConfigAction.editWidgetProperty(this.props.id, 'config.panel.padding', {
      number: paddingNumbers,
      unit: value.unit
    }).exec()
  }

  handlePanelBorderChange = (value) => {
    const appConfigAction = getAppConfigAction()
    const widgetJson = appConfigAction.appConfig.widgets[this.props.id]
    const panelConfig = widgetJson?.config?.panel ?? Immutable({})

    appConfigAction.editWidgetProperty(
      this.props.id,
      'config.panel',
      panelConfig.set('border', value).without('borderLeft').without('borderRight').without('borderTop').without('borderBottom')
    ).exec()
  }

  handlePanelBorderSideChange = (side, value) => {
    const appConfigAction = getAppConfigAction()
    const widgetJson = appConfigAction.appConfig.widgets[this.props.id]
    const panelConfig = widgetJson?.config?.panel ?? Immutable({})

    appConfigAction.editWidgetProperty(
      this.props.id,
      'config.panel',
      panelConfig.set(lodash.camelCase(`border-${side}`), value).without('border')
    ).exec()
  }

  render (): React.JSX.Element {
    const { config } = this.props
    const { gap = 4, padding, singleMode = false, showToggleAll = false, header = {}, panel = {} } = config
    const appTheme = getTheme2()
    const isExpressMode = window.isExpressBuilder
    const bgAriaLabel = this.formatMessage('backgroundColor')
    const fgAriaLabel = this.formatMessage('foregroundColor')
    return (
      <div>
        {!isExpressMode && <SettingSection title={this.formatMessage('layout')} role='group' aria-label={this.formatMessage('layout')}>
          <SettingRow role='group' label={this.formatMessage('gap')}>
            <InputUnit
              aria-label={this.formatMessage('gap')}
              precision={0}
              value={{ distance: gap, unit: undefined }}
              min={0}
              css={css`width: 120px;`}
              onChange={(value: LinearUnit) => { this.handleConfigChange('config.gap', value.distance) }}
            />
          </SettingRow>
          <SettingRow
            role='group'
            aria-label={this.formatMessage('padding')}
            label={this.formatMessage('padding')}
            flow='wrap'
          >
            <Padding value={padding as any} units={[DistanceUnits.PIXEL]} min={0} onChange={this.handlePaddingChange} />
          </SettingRow>
        </SettingSection>}
        <SettingSection role='group' aria-label={this.formatMessage('generalSettigns')} title={this.formatMessage('generalSettigns')}>
          <SettingRow flow='wrap' label={this.formatMessage('numOfExpandedItems')}>
            <div className='d-block' role='radiogroup' aria-label={this.formatMessage('numOfExpandedItems')}>
              <div className='d-flex align-items-center mb-2'>
                <Label className='d-flex align-items-center'>
                  <Radio name='openAtStartMode' aria-label={this.formatMessage('single')} className='mr-2' checked={singleMode} onClick={this.useSingleMode} />
                  <span className='ml-2'>{this.formatMessage('single')}</span>
                </Label>
              </div>
              <div className='d-flex align-items-center'>
                <Label className='d-flex align-items-center'>
                  <Radio name='openAtStartMode' aria-label={this.formatMessage(('multiple'))} className='mr-2' checked={!singleMode} onClick={this.useMultipleMode} />
                  <span className='ml-2'>{this.formatMessage('multiple')}</span>
                </Label>
              </div>
            </div>
          </SettingRow>
          <SettingRow label={this.formatMessage('expandOnLoading')} flow='wrap'>
            <ExpandedItems widgetId={this.props.id} tooltip={this.formatMessage('expandOnLoading')} />
          </SettingRow>
          {!singleMode && (
            <SettingRow>
              <Label className='d-flex align-items-center'>
                <Checkbox checked={showToggleAll} onChange={(_, checked) => { this.handleConfigChange('config.showToggleAll', checked) }}/>
                <span className='ml-2'>{this.formatMessage('showToggleAllButton')}</span>
              </Label>
            </SettingRow>
          )}
        </SettingSection>
        {!isExpressMode && <SettingSection>
          <CollapsablePanel role='group' aria-label={this.formatMessage('variableHeader')} label={this.formatMessage('variableHeader')} type='default' defaultIsOpen>
            <HeaderSetting widgetId={this.props.id} {...header} />
          </CollapsablePanel>
        </SettingSection>}
        {!isExpressMode && <SettingSection>
          <CollapsablePanel role='group' aria-label={this.formatMessage('panel')} label={this.formatMessage('panel')} type='default' className='pb-2' defaultIsOpen={false}>
            <SettingRow
              className='mt-2'
              role='group'
              aria-label={this.formatMessage('padding')}
              label={this.formatMessage('padding')}
              flow='wrap'
            >
              <Padding
                value={panel.padding as any}
                units={[DistanceUnits.PIXEL]}
                min={0}
                onChange={this.handlePanelPaddingChange}
              />
            </SettingRow>
            <SettingRow role='group' label={this.formatMessage('fill')} aria-label={this.formatMessage('fill')}>
              <ThemeColorPicker
                title={bgAriaLabel}
                aria-label={bgAriaLabel}
                value={panel.backgroundColor}
                specificTheme={appTheme}
                onChange={(value: string) => { this.handleConfigChange('config.panel.backgroundColor', value) }}
              />
              <ThemeColorPicker
                title={fgAriaLabel}
                aria-label={fgAriaLabel}
                className='ml-1'
                type='with-icon'
                icon={<UppercaseOutlined size='s' />}
                specificTheme={appTheme}
                value={panel.textColor}
                onChange={(value: string) => { this.handleConfigChange('config.panel.textColor', value) }}
              />
            </SettingRow>
            <SettingSection title={this.formatMessage('border')} className='px-0 py-3 border-bottom-0'>
              <SettingRow flow='wrap' role='group' label={this.formatMessage('border')} aria-label={this.formatMessage('border')}>
                <BorderSetting
                  value={panel.border}
                  top={panel.borderTop}
                  left={panel.borderLeft}
                  right={panel.borderRight}
                  bottom={panel.borderBottom}
                  onChange={this.handlePanelBorderChange}
                  onSideChange={this.handlePanelBorderSideChange}
                />
              </SettingRow>
              <SettingRow role='group' flow='wrap' aria-label={this.formatMessage('borderRadius')} label={this.formatMessage('borderRadius')}>
                <BorderRadiusSetting value={panel.borderRadius} onChange={(value) => { this.handleConfigChange('config.panel.borderRadius', value) }} />
              </SettingRow>
            </SettingSection>
          </CollapsablePanel>
        </SettingSection>}
      </div>
    )
  }
}
