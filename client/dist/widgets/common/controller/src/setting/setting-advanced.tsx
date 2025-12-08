import { type ImmutableObject, hooks, classNames } from 'jimu-core'
import { CollapsableResetPanel, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Tabs, Tab, defaultMessages as jimuUiDefaultMessages, type BoxShadowStyle } from 'jimu-ui'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import defaultMessages from './translations/default'
import { useTheme2 } from 'jimu-theme'
import { FontSetting } from './font-setting'
import { BoxShadowSetting } from 'jimu-ui/advanced/style-setting-components'
import type { ControllerButtonStyle, ControllerButtonStylesByState } from '../config'

interface AdvancedSettingProps {
  className?: string
  variant: ControllerButtonStylesByState
  showLabel: boolean
  onChange: (state: string, key: string, value: any) => void
  onReset: (state: BoxStatesType, keys: Array<keyof ControllerButtonStyle>) => void
}

export type BoxStatesType = keyof ControllerButtonStylesByState
export const BoxStates: BoxStatesType[] = ['default', 'active', 'hover']
export type BoxStyleKey = keyof ControllerButtonStyle

const textKeys: BoxStyleKey[] = ['bold', 'italic', 'underline', 'strike', 'color']
const iconKeys: BoxStyleKey[] = ['iconColor', 'bg']

const isEmpty = (style: ImmutableObject<ControllerButtonStyle>, keys: string[]) => {
  if (!style) return true
  const notEmpty = keys.some(key => style[key] !== null && style[key] !== undefined && style[key] !== '')
  return !notEmpty
}

const shadowKeys: Array<keyof BoxShadowStyle> = ['offsetX', 'offsetY', 'blur', 'spread', 'color']
const isShadowEmpty = (style: ImmutableObject<BoxShadowStyle>) => {
  if (!style) return true
  const notEmpty = shadowKeys.some(key => style[key] !== null && style[key] !== undefined && style[key] !== '')
  return !notEmpty
}

export const SettingAdvanced = (props: AdvancedSettingProps) => {
  const { className, variant, showLabel, onChange, onReset } = props

  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessages)
  const theme = useTheme2()

  const handleReset = (state: BoxStatesType, keys: BoxStyleKey[]) => {
    onReset(state, keys)
  }

  return (
    <SettingRow className='sw-controller__advanced-setting' role='group' aria-label={translate('advance')} flow='wrap'>
      <Tabs type='pills' className={classNames('flex-grow-1 w-100 h-100', className)} fill defaultValue={BoxStates[0]}>
        {
          BoxStates.map((state) => {
            const themeBoxStyles = variant?.[state] as ImmutableObject<ControllerButtonStyle>
            return (
              <Tab key={state} id={state} className='tab-title-item' title={translate(state === 'active' ? 'selected' : state)}>
                {showLabel && <SettingRow className='mt-4'>
                  <CollapsableResetPanel defaultIsOpen={false} label={translate('text')} isEmpty={isEmpty(themeBoxStyles, textKeys)} bottomLine onReset={() => { handleReset(state, textKeys) }}>
                    <FontSetting
                      aria-label={translate('text')}
                      bold={themeBoxStyles?.bold as boolean}
                      italic={themeBoxStyles?.italic as boolean}
                      underline={themeBoxStyles?.underline as boolean}
                      strike={themeBoxStyles?.strike as boolean}
                      color={themeBoxStyles?.color}
                      onChange={(key, value) => { onChange(state, key, value) }}
                    />
                  </CollapsableResetPanel>
                </SettingRow>}
                <SettingRow className={!showLabel ? 'mt-4' : ''}>
                  <CollapsableResetPanel defaultIsOpen={false} label={translate('advancedIconStyle')} isEmpty={isEmpty(themeBoxStyles, iconKeys)} bottomLine onReset={() => { handleReset(state, iconKeys) }}>
                    <SettingRow label={translate('advancedIconColor')} flow='no-wrap' truncateLabel>
                      <ThemeColorPicker
                        className='jimu-outline-inside'
                        aria-label={translate('advancedIconColor')}
                        specificTheme={theme}
                        value={themeBoxStyles?.iconColor}
                        onChange={(value) => { onChange(state, 'iconColor', value) }}
                      />
                    </SettingRow>
                    <SettingRow label={translate('backgroundColor')} flow='no-wrap' truncateLabel>
                      <ThemeColorPicker
                        className='jimu-outline-inside'
                        aria-label={translate('backgroundColor')}
                        specificTheme={theme}
                        value={themeBoxStyles?.bg}
                        onChange={(value) => { onChange(state, 'bg', value) }}
                      />
                    </SettingRow>
                  </CollapsableResetPanel>
                </SettingRow>
                <SettingRow>
                  <CollapsableResetPanel defaultIsOpen={false} label={translate('shadow')} isEmpty={isShadowEmpty(themeBoxStyles.boxShadow)} onReset={() => { handleReset(state, ['boxShadow']) }}>
                    <BoxShadowSetting
                      value={themeBoxStyles?.boxShadow}
                      applyDefaultValue={false}
                      onChange={value => { onChange(state, 'boxShadow', value) }
                      }
                    />
                  </CollapsableResetPanel>
                </SettingRow>
              </Tab>
            )
          })
        }
      </Tabs>
    </SettingRow>
  )
}
