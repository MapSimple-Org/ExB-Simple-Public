/** @jsx jsx */
import {
  React,
  css,
  jsx,
  type IconResult,
  useIntl,
  hooks,
  Immutable,
  polished,
  type ImmutableObject
} from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, MenuType } from '../config'
import {
  Select,
  Radio,
  Label,
  Switch,
  type LinearUnit,
  defaultMessages as jimuiDefaultMessage,
  styleUtils,
  type NavigationVariant,
  type IconButtonStyles,
  CollapsablePanel
} from 'jimu-ui'
import type { MenuNavigationStandard } from '../runtime/menu-navigation'
import { IconPicker } from 'jimu-ui/advanced/resource-selector'
import {
  InputUnit,
  NavStyleSettingByState,
  TextAlignment,
  BorderRadiusSetting,
  type ComponentState
} from 'jimu-ui/advanced/style-setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { changeAutoSizeAndDefaultSize } from './utils'
import defaultMessage from './translations/default'
import { useTheme2 } from 'jimu-theme'
import { getDefaultIconForIconMenu, getDefaultValueForStandardContent, getEssentialDefaultWidgetConfigByType, useMenuType, useFullConfig } from '../utils'

type SettingProps = AllWidgetSettingProps<IMConfig>

const style = css`
  .radio-container {
    display: flex;
    width: 100%;
    margin-top: 0.5rem;
    > span.jimu-radio {
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    > label {
      margin-bottom: 0;
    }
  }
  .nav-arrow-color-collapse {
    .collapse-header {
      color: var(--sys-color-surface-background-hint) !important;
    }
  }
`

const Setting = (props: SettingProps) => {
  const translate = hooks.useTranslation(defaultMessage, jimuiDefaultMessage)
  const appTheme = useTheme2()

  const { config: _config, id, onSettingChange } = props

  const menuType = useMenuType(_config)

  const fullConfig = useFullConfig(_config, menuType, translate)

  const {
    vertical,
    type,
    menuStyle,
    variant,
    advanced,
    navArrowColor,
    standard
  } = fullConfig
  const { anchor, textAlign, icon, submenuMode, gap, showIcon } =
    standard || ({} as MenuNavigationStandard)

  const paper = advanced ? fullConfig?.paper : undefined

  const intl = useIntl()
  const iconCustomLabel = React.useMemo(() => {
    if (!icon?.properties?.filename) {
      return
    }
    const id = icon.properties.filename
    return intl.formatMessage({ id, defaultMessage: defaultMessage[id] || jimuiDefaultMessage[id] || id })
  }, [icon?.properties?.filename, intl])

  const generateNavTypes = () => {
    return [
      { label: translate('default'), value: 'default' },
      { label: translate('underline'), value: 'underline' },
      { label: translate('pills'), value: 'pills' }
    ]
  }

  const onSettingConfigChange = (key: string | string[], value: any) => {
    onSettingChange({
      id,
      config: Array.isArray(key)
        ? _config.setIn(key, value)
        : _config.set(key, value)
    })
  }

  const onRootStyleChange = (key: 'borderRadius' | 'bg', value: string) => {
    if (value == null) {
      if (!variant?.root?.[key]) {
        return
      }
      const newRoot = _config.variant.root.without(key)
      if (!Object.keys(newRoot).length) {
        const newVariant = _config.variant.without('root')
        if (!Object.keys(newVariant).length) {
          onSettingChange({ id, config: _config.without('variant') })
        } else {
          onSettingConfigChange('variant', newVariant)
        }
      } else {
        onSettingConfigChange(['variant', 'root'], newRoot)
      }
    } else {
      onSettingConfigChange(['variant', 'root', key], value)
    }
  }

  const onStandardContentChange = (key: keyof MenuNavigationStandard, value: any) => {
    let standard = _config.standard || Immutable({} as any)
    if (value === getDefaultValueForStandardContent(key)) {
      standard = standard.without(key)
    } else {
      standard = standard.set(key, value)
    }

    onSettingChange({
      id,
      config: Object.keys(standard).length
        ? _config.set('standard', standard)
        : _config.without('standard')
    })
  }

  const onAdvancedChange = () => {
    const advanced = !fullConfig?.advanced

    let config: IMConfig
    if (advanced) {
      config = _config.set('advanced', true)
    } else {
      config = _config.without('advanced').without('variant').without('paper').without('navArrowColor')
    }

    onSettingChange({ id, config })
  }

  const onTypeChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const menuType = evt.target.value as MenuType
    const newConfig = getEssentialDefaultWidgetConfigByType(menuType)

    onSettingChange({ id, config: newConfig })

    changeAutoSizeAndDefaultSize(menuType)
  }

  const onNavTypeRadioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    const checked = e.currentTarget.checked
    if (!checked) {
      return
    }
    let config = value === 'default' ? _config.without('menuStyle') : _config.set('menuStyle', value)
    config = config
      .without('advanced')
      .without('variant')
      .without('paper')

    onSettingChange({ id, config })
  }

  const handleVariantItemChange = (
    state: ComponentState,
    key: keyof IconButtonStyles,
    value: any
  ) => {
    const stateValue = variant?.item?.[state] as ImmutableObject<IconButtonStyles>
    if (value == null || value === '') {
      if (stateValue?.[key] != null) {
        onSettingConfigChange(['variant', 'item', state], stateValue.without(key))
      }
      return
    }
    if (key === 'border' && stateValue) {
      onSettingConfigChange(['variant', 'item', state], stateValue.without('borderLeft').without('borderRight').without('borderTop').without('borderBottom').set(key, value))
    } else if (key.includes('border') && key !== 'borderRadius' && stateValue) {
      onSettingConfigChange(['variant', 'item', state], stateValue.without('border').set(key, value))
    } else {
      onSettingConfigChange(['variant', 'item', state, key], value)
    }
  }

  const handleVariantChange = (newVariant: ImmutableObject<NavigationVariant>) => {
    if (newVariant) {
      onSettingConfigChange(['variant'], newVariant)
    } else {
      onSettingChange({ id, config: _config.without('variant') })
    }
  }

  const rootBorderRadiusValue = React.useMemo(() => {
    if (!variant?.root?.borderRadius) {
      return null
    }
    const radius = polished.getValueAndUnit(variant?.root?.borderRadius === 'none' ? '0px' : styleUtils.remToPixel(variant?.root?.borderRadius || '0rem'))
    return Immutable({ number: [radius?.[0]] as any, unit: radius?.[1] })
  }, [variant?.root?.borderRadius])

  const handleNavArrowColorChange = (key: 'default' | 'hover' | 'disabled', value: string) => {
    if (!value) {
      if (Object.keys(navArrowColor || {}).filter((k) => k !== key).some((k) => navArrowColor?.[k])) {
        onSettingChange({ id, config: _config.set('navArrowColor', navArrowColor.without(key)) })
      } else {
        onSettingChange({ id, config: _config.without('navArrowColor') })
      }
    } else {
      onSettingChange({ id, config: _config.setIn(['navArrowColor', key], value) })
    }
  }

  return (
    <div css={style} className='widget-setting-menu jimu-widget-setting'>
      <SettingSection>
        <SettingRow label={translate('type')}>
          <Select
            aria-label={translate('type')}
            size='sm'
            value={menuType}
            onChange={onTypeChange}
            style={{ width: '50%' }}
          >
            <option value={MenuType.Icon}>{translate('icon')}</option>
            <option value={MenuType.Vertical}>{translate('vertical')}</option>
            <option value={MenuType.Horizontal}>
              {translate('horizontal')}
            </option>
          </Select>
        </SettingRow>

        {type === 'drawer' && (
          <SettingRow label={translate('location')} flow='no-wrap'>
            <Select
              aria-label={translate('location')}
              size='sm'
              style={{ width: '50%' }}
              value={anchor}
              onChange={evt => { onStandardContentChange('anchor', evt.target.value) }}
            >
              <option value='left'>{translate('left')}</option>
              <option value='right'>{translate('right')}</option>
            </Select>
          </SettingRow>
        )}

        {vertical && (
          <SettingRow label={translate('subMenuExpandMode')} flow='wrap'>
            <Select
              aria-label={translate('subMenuExpandMode')}
              size='sm'
              value={submenuMode}
              onChange={evt => {
                onStandardContentChange('submenuMode', evt.target.value)
              }}
            >
              <option value='foldable'>{translate('foldable')}</option>
              <option value='static'>{translate('expand')}</option>
            </Select>
          </SettingRow>
        )}

        {type === 'drawer' && (
          <React.Fragment>
            <SettingRow label={translate('icon')} flow='no-wrap' role="group" aria-label={translate('icon')}>
              <IconPicker
                hideRemove
                icon={icon as IconResult}
                customIcons={[getDefaultIconForIconMenu(translate)]}
                customLabel={iconCustomLabel}
                previewOptions={{ color: true, size: false }}
                onChange={icon => { onSettingConfigChange(['standard', 'icon'], icon) }
                }
                setButtonUseColor={false}
              />
            </SettingRow>
            <SettingRow label={translate('iconSize')} flow='no-wrap'>
              <InputUnit
                aria-label={translate('iconSize')}
                className="w-50"
                value={`${icon?.properties?.size ?? 0}px`}
                onChange={(value: LinearUnit) => {
                  onSettingConfigChange(
                    ['standard', 'icon', 'properties', 'size'],
                    value.distance
                  )
                }
                }
              />
            </SettingRow>
          </React.Fragment>
        )}
      </SettingSection>

      <SettingSection title={translate('appearance')} role="group" aria-label={translate('appearance')}>
        <SettingRow label={translate('style')} flow='wrap' role="radiogroup" aria-label={translate('style')}>
          {generateNavTypes().map((item, index) => (
            <div className='radio-container' key={index}>
              <Radio
                id={'nav-style-type' + index}
                style={{ cursor: 'pointer' }}
                name='style-type'
                onChange={e => { onNavTypeRadioChange(e, item.value) }}
                checked={menuStyle === item.value}
              />
              <Label
                style={{ cursor: 'pointer' }}
                for={'nav-style-type' + index}
                className='ml-2 text-break'
              >
                {item.label}
              </Label>
            </div>
          ))}
        </SettingRow>

        <SettingRow label={translate('space')} flow='no-wrap'>
          <InputUnit
            aria-label={translate('space')}
            className='w-50'
            min={0}
            value={gap}
            onChange={value => {
              onStandardContentChange('gap', `${value.distance}${value.unit}`)
            }
            }
          />
        </SettingRow>

        <SettingRow flow='no-wrap' label={translate('alignment')}>
          <TextAlignment
            aria-label={translate('alignment')}
            textAlign={textAlign}
            onChange={value => { onStandardContentChange('textAlign', value) }
            }
          />
        </SettingRow>

        <SettingRow flow='no-wrap' tag='label' label={translate('showIcon')}>
          <Switch
            checked={showIcon}
            onChange={(_, value) => { onStandardContentChange('showIcon', value) }
            }
          />
        </SettingRow>
      </SettingSection>

      <SettingSection>
        <SettingRow flow='no-wrap' tag='label' label={translate('advance')}>
          <Switch checked={advanced} onChange={onAdvancedChange} />
        </SettingRow>
        {advanced && (
          <React.Fragment>
            {type !== 'drawer' && <React.Fragment>
              <CollapsablePanel label={translate('navArrowColor')} defaultIsOpen={false} className='my-4 nav-arrow-color-collapse' wrapperClassName='pl-2'>
                <SettingRow label={translate('default')} flow='no-wrap' className='my-2'>
                  <ThemeColorPicker
                    aria-label={translate('default')}
                    specificTheme={appTheme}
                    value={navArrowColor?.default}
                    onChange={value => { handleNavArrowColorChange('default', value || null) }
                    }
                  />
                </SettingRow>
                <SettingRow label={translate('hover')} flow='no-wrap' className='my-2'>
                  <ThemeColorPicker
                    aria-label={translate('hover')}
                    specificTheme={appTheme}
                    value={navArrowColor?.hover}
                    onChange={value => { handleNavArrowColorChange('hover', value || null) }
                    }
                  />
                </SettingRow>
                <SettingRow label={translate('disabled')} flow='no-wrap' className='my-2'>
                  <ThemeColorPicker
                    aria-label={translate('disabled')}
                    specificTheme={appTheme}
                    value={navArrowColor?.disabled}
                    onChange={value => { handleNavArrowColorChange('disabled', value || null) }
                    }
                  />
                </SettingRow>
              </CollapsablePanel>
              <SettingRow label={translate('background')} flow='no-wrap'>
                <ThemeColorPicker
                  aria-label={translate('background')}
                  specificTheme={appTheme}
                  value={variant?.root?.bg}
                  onChange={value => { onRootStyleChange('bg', value || null) }
                  }
                />
              </SettingRow>
              <SettingRow label={translate('borderRadius')} flow='no-wrap'>
                <BorderRadiusSetting
                  style={{ width: '30%' }}
                  separated={false} value={rootBorderRadiusValue} placeholder=''
                  onChange={(value) => { onRootStyleChange('borderRadius', value.number?.[0] ? `${value.number?.[0]}${value?.unit}` : null) }}
                />
              </SettingRow>
            </React.Fragment>}

            {type === 'drawer' && (
              <SettingRow label={translate('background')} flow='no-wrap'>
                <ThemeColorPicker
                  aria-label={translate('background')}
                  specificTheme={appTheme}
                  value={paper?.bg}
                  onChange={value => { onSettingConfigChange(['paper', 'bg'], value) }
                  }
                />
              </SettingRow>
            )}

            <NavStyleSettingByState
              variant={variant}
              onlyBorderColor={menuStyle === 'underline'}
              text
              icon={false}
              iconInText={showIcon}
              onChange={handleVariantItemChange}
              onWholeVariantChange={handleVariantChange}
            />
          </React.Fragment>
        )}
      </SettingSection>
    </div>
  )
}

export default Setting
