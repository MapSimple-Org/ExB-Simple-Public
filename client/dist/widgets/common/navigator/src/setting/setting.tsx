/** @jsx jsx */
import { React, css, jsx, Immutable, polished, type IMThemeSliderVariant, type IMThemeVariables, hooks, type ImmutableObject } from 'jimu-core'
import { builderAppSync, getAppConfigAction, type AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingSection, SettingRow, DirectionSelector } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, ViewType, type IMViewNavigationData } from '../config'
import { type NavigationVariant, MultiSelect, Select, Radio, Label, Option, Switch, TextInput, NumericInput, Tooltip, Button, defaultMessages as jimuiDefaultMessage, styleUtils, type NavIconButtonGroupVariant, type IconButtonStyles, MultiSelectItem, CollapsablePanel } from 'jimu-ui'

import { getSectionLabel, getViewSelectItems, useContainerSections, useSectionViews, useIconNLSNames } from './utils'
import { SliderStyleSetting } from './slider-style-setting'
import type { IMViewNavigationDisplay } from '../runtime/components/view-navigation'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { IconPicker } from 'jimu-ui/advanced/resource-selector'
import { type ComponentState, NavStyleSettingByState, NavIconPicker, InputUnit, TextAlignment, BorderRadiusSetting } from 'jimu-ui/advanced/style-setting-components'
import defaultMessages from './translations/default'
import { useTheme2 } from 'jimu-theme'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { isInSymbolStyle, isInTabStyle, setWidgetSize } from '../utils'
import { UppercaseOutlined } from 'jimu-icons/outlined/editor/uppercase'

type SettingProps = AllWidgetSettingProps<IMConfig>

const useStyle = (theme: IMThemeVariables) => {
  const dark600 = theme?.ref.palette.neutral[1000]
  return React.useMemo(() => {
    return css`
        .jimu-multi-select {
          width: 100%;
          > .jimu-dropdown {
            width: 100%;
          }
          > .jimu-menu-item {
            width: 100%;
            height: ${polished.rem(26)};
          }
        }
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
        .list-guide-tip-button {
          svg {
            margin-top: ${polished.rem(-2)};
          }
        }
        .title-1 {
          > label {
            font-size: ${polished.rem(14)} !important;
            color: ${dark600} !important;
          }
        }
        .nav-button-icon-picker {
          width: ${polished.rem(100)};
          .jimu-dropdown-button:not(.icon-btn) {
            max-width: ${polished.rem(100)};
          }
        }
        .pagination-style-setting-row.jimu-widget-setting--row> label {
          margin-bottom: 0.75rem;
        }
        .color-drak-600> label {
          color: var(--ref-palette-neutral-1000) !important;
        }
        .color-drak-500> label {
          color: var(--ref-palette-neutral-1000) !important;
        }
        .nav-arrow-color-collapse {
          .collapse-header {
            color: var(--sys-color-surface-background-hint) !important;
          }
        }
      `
  }, [dark600])
}
const Setting = (props: SettingProps) => {
  const appTheme = useTheme2()
  const translate = hooks.useTranslation(jimuiDefaultMessage, defaultMessages)
  const { config, id, onSettingChange, theme } = props
  const data = config?.data ?? Immutable({}) as IMViewNavigationData
  const display = config?.display ?? Immutable({}) as IMViewNavigationDisplay
  const { section, type: viewType, views: cfView } = data
  const { vertical, type, navStyle, variant, advanced, standard, paginationFontColor, navArrowColor } = display
  const { showIcon, showText, showTitle, previousText, nextText, hideThumb, step = 1, textAlign, gap, showPageNumber } = standard || {}
  const background = variant?.root?.bg
  const sections = useContainerSections(id)
  const views = useSectionViews(section)
  const style = useStyle(theme)

  const [newPreviousText, setNewPreviousText] = React.useState(previousText)
  const [newNextText, setNewNextText] = React.useState(nextText)

  // tabDefault, tabUnderline and tabPills
  const isTabStyle = React.useMemo(() => isInTabStyle(display), [display])

  const isSymbolStyle = React.useMemo(() => isInSymbolStyle(display), [display])

  // tabDefault, tabUnderline, tabPills and symbol
  const isNavType = React.useMemo(() => type === 'nav', [type])

  const [alternateIconWithNLSName, activedIconWithNLSName, previousIconWithNLSName, nextIconWithNLSName] = useIconNLSNames(standard)

  React.useEffect(() => {
    newPreviousText !== previousText && setNewPreviousText(previousText)
    newNextText !== nextText && setNewNextText(nextText)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousText, nextText])

  const onSettingConfigChange = (key: string | string[], value: any) => {
    onSettingChange({
      id,
      config: Array.isArray(key) ? config.setIn(key, value) : config.set(key, value)
    })
  }

  const onRootStyleChange = (key: 'borderRadius' | 'bg', value: string) => {
    if (value == null) {
      if (!variant?.root?.[key]) {
        return
      }
      const newRoot = (variant.root as ImmutableObject<IconButtonStyles>).without(key)
      if (!Object.keys(newRoot).length) {
        const newVariant = (variant as ImmutableObject<NavigationVariant> | ImmutableObject<NavIconButtonGroupVariant>).without('root')
        if (!Object.keys(newVariant).length) {
          onSettingConfigChange('display', display.without('variant'))
        } else {
          onSettingConfigChange(['display', 'variant'], newVariant)
        }
      } else {
        onSettingConfigChange(['display', 'variant', 'root'], newRoot)
      }
    } else {
      onSettingConfigChange(['display', 'variant', 'root', key], value)
    }
  }

  const renderSelectText = (values: string[]) => {
    const viewNumber = values ? values.length : 0
    return translate('viewsSelected', { viewNumber })
  }

  const handleViewsSelectChange = (_, vs: string[]) => {
    //sort views by section.views
    vs.sort((a, b) => {
      return views?.indexOf(a) - views?.indexOf(b)
    })
    onSettingConfigChange(['data', 'views'], vs)
  }

  const onAdvancedChange = () => {
    const advanced = !config?.display.advanced

    let display = config.display.set('advanced', advanced)
    if (!advanced) {
      display = display.without('variant').without('navArrowColor')
    }

    onSettingConfigChange('display', display)
  }

  const handleVariantItemChange = (state: ComponentState, key: keyof IconButtonStyles, value: any) => {
    const stateValue = (variant as Immutable.ImmutableObject<NavigationVariant> | Immutable.ImmutableObject<NavIconButtonGroupVariant>)?.item?.[state] as ImmutableObject<IconButtonStyles>
    if (value == null || value === '') {
      if (stateValue?.[key] != null) {
        onSettingConfigChange(['display', 'variant', 'item', state], stateValue.without(key))
      }
      return
    }
    if (key === 'border' && stateValue) {
      onSettingConfigChange(['display', 'variant', 'item', state], stateValue.without('borderLeft').without('borderRight').without('borderTop').without('borderBottom').set(key, value))
    } else if (key.includes('border') && key !== 'borderRadius' && stateValue) {
      onSettingConfigChange(['display', 'variant', 'item', state], stateValue.without('border').set(key, value))
    } else {
      onSettingConfigChange(['display', 'variant', 'item', state, key], value)
    }
  }

  const handleVariantChange = (newVariant: ImmutableObject<NavigationVariant> | IMThemeSliderVariant) => {
    if (newVariant) {
      onSettingConfigChange(['display', 'variant'], newVariant)
    } else {
      onSettingConfigChange(['display'], config.display.without('variant'))
    }
  }

  const handlePreviousTextChange = (e) => {
    const value = e.target.value
    setNewPreviousText(value)
  }

  const handleNextTextChange = (e) => {
    const value = e.target.value
    setNewNextText(value)
  }

  const handleDirectionChange = (vertical: boolean) => {
    onSettingConfigChange(['display', 'vertical'], vertical)
    setWidgetSize(Immutable(display).merge({
      vertical
    }), getAppConfigAction)
  }

  const viewSelectItems = React.useMemo(() => getViewSelectItems(views), [views])
  const viewSelectItemLabels = React.useMemo(() => viewSelectItems.asMutable().map((item) => item.label).join(','), [viewSelectItems])

  const AdvancedSettingContainerTagName = React.useMemo(() => isTabStyle || type === 'navButtonGroup' ? SettingRow : React.Fragment, [isTabStyle, type])
  const advancedSettingContainerProps = React.useMemo(() => {
    return isTabStyle || type === 'navButtonGroup'
      ? {
          flow: 'wrap',
          label: isTabStyle ? translate('tabStyle') : translate('navBtnStyle'),
          'aria-label': isTabStyle ? translate('tabStyle') : translate('navBtnStyle'),
          role: 'group',
          className: 'color-drak-600'
        }
      : {}
  }, [isTabStyle, translate, type])

  const rootBorderRadiusValue = React.useMemo(() => {
    if (!variant?.root?.borderRadius) {
      return null
    }
    const radius = polished.getValueAndUnit(variant?.root?.borderRadius === 'none' ? '0px' : styleUtils.remToPixel(variant?.root?.borderRadius || '0rem'))
    return Immutable({ number: [radius?.[0]] as any, unit: radius?.[1] })
  }, [variant?.root?.borderRadius])

  const isExpressMode = window.isExpressBuilder
  React.useEffect(() => {
    if (!isExpressMode) {
      return
    }
    builderAppSync.publishWidgetToolbarStateChangeToApp(id, ['navigator-add-view', 'navigator-manage-views'])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewType])

  const handleNavArrowColorChange = (key: 'default' | 'hover' | 'disabled', value: string) => {
    if (!value) {
      if (Object.keys(navArrowColor || {}).filter((k) => k !== key).some((k) => navArrowColor?.[k])) {
        onSettingConfigChange(['display', 'navArrowColor'], navArrowColor.without(key))
      } else {
        onSettingConfigChange('display', display.without('navArrowColor'))
      }
    } else {
      onSettingConfigChange(['display', 'navArrowColor', key], value)
    }
  }

  return <div className="widget-setting-navigator jimu-widget-setting" css={style}>
    <SettingSection>
      {!isExpressMode && <SettingRow flow="wrap" label={translate('linkTo')} role='group' aria-label={translate('linkTo')}>
        <Select size='sm' value={section || ''} onChange={e => { onSettingConfigChange(['data', 'section'], e.target.value) }}>
          <Option value={''}>{translate('none')}</Option>
          {sections.length && <Option divider></Option>}
          {sections.map((sid) => <Option key={sid} value={sid}>{getSectionLabel(sid)}</Option>)}
        </Select>
      </SettingRow>}

      {section && <React.Fragment>

        {isNavType && <SettingRow label={translate('views')} role='group' aria-label={translate('views')} flow="wrap">
          <div className="radio-container">
            <Radio id="view-type-auto" style={{ cursor: 'pointer' }} aria-label={translate('auto')}
              name="view-type" onChange={e => { onSettingConfigChange(['data', 'type'], ViewType.Auto) }} checked={viewType === ViewType.Auto} />
            <Label style={{ cursor: 'pointer' }} for="view-type-auto" className="ml-2">{translate('auto')}</Label>
          </div>

          <div className="radio-container">
            <Radio id="view-type-custom" style={{ cursor: 'pointer' }} aria-label={translate('custom')}
              name="view-type" onChange={e => { onSettingConfigChange(['data', 'type'], ViewType.Custom) }} checked={viewType === ViewType.Custom} />
            <Label style={{ cursor: 'pointer' }} for="view-type-custom" className="ml-2">{translate('custom')}</Label>
          </div>
        </SettingRow>}

        {viewType === ViewType.Custom && <SettingRow flow="wrap">
          <MultiSelect aria-label={viewSelectItemLabels} values={cfView} onChange={handleViewsSelectChange} displayByValues={renderSelectText} >
            {
              viewSelectItems.map((item) => {
                return <MultiSelectItem key={item.value} value={item.value} label={item.label} />
              })
            }
          </MultiSelect>
        </SettingRow>}

        {!isExpressMode && type !== 'slider' && <SettingRow flow="no-wrap" label={translate('direction')} aria-label={translate('direction')} role='group'>
          <DirectionSelector vertical={vertical} onChange={handleDirectionChange}/>
        </SettingRow>}

        {isNavType && <SettingRow label={translate('space')} aria-label={translate('space')} flow="no-wrap">
          <InputUnit className="w-50" min={0} value={gap} onChange={(value) => { onSettingConfigChange(['display', 'standard', 'gap'], `${value.distance}${value.unit}`) }} />
        </SettingRow>}

        {!isExpressMode && isNavType && <SettingRow flow="no-wrap" label={translate('alignment')} aria-label={translate('alignment')} role='group'>
          <TextAlignment textAlign={textAlign} onChange={(value) => { onSettingConfigChange(['display', 'standard', 'textAlign'], value) }} />
        </SettingRow>}

        {!isExpressMode && isTabStyle && <SettingRow flow='no-wrap' tag='label' label={translate('showIcon')}>
          <Switch
            checked={showIcon}
            disabled={showIcon && !showText}
            onChange={(_, value) => { onSettingConfigChange(['display', 'standard', 'showIcon'], value) }
            }
          />
        </SettingRow>}
        {!isExpressMode && isTabStyle && <SettingRow flow='no-wrap' tag='label' label={translate('showText')}>
          <Switch
            checked={showText}
            disabled={showText && !showIcon}
            onChange={(_, value) => { onSettingConfigChange(['display', 'standard', 'showText'], value) }
            }
          />
        </SettingRow>}

        {
          isSymbolStyle && <SettingRow flow="no-wrap" tag='label' label={translate('tooltip')} aria-label={translate('tooltip')}>
            <Switch checked={showTitle} onChange={() => { onSettingConfigChange(['display', 'standard', 'showTitle'], !showTitle) }}></Switch>
          </SettingRow>
        }

        {isSymbolStyle && <React.Fragment>
          <SettingRow flow="no-wrap" label={translate('symbol')} aria-label={translate('symbol')} className="title-1" ></SettingRow>
          <SettingRow flow="no-wrap" label={translate('currentView')} aria-label={translate('currentView')}>
            <NavIconPicker configurableOption={'none'} hideRemove theme2={theme} size={8} icon={activedIconWithNLSName as any} customLabel={activedIconWithNLSName?.properties?.filename} onChange={(icon) => { onSettingConfigChange(['display', 'standard', 'activedIcon'], icon) }}></NavIconPicker>
          </SettingRow>
          <SettingRow flow="no-wrap" label={translate('others')} aria-label={translate('others')}>
            <NavIconPicker configurableOption={'none'} hideRemove theme2={theme} size={8} icon={alternateIconWithNLSName as any} customLabel={alternateIconWithNLSName?.properties?.filename} onChange={(icon) => { onSettingConfigChange(['display', 'standard', 'alternateIcon'], icon) }}></NavIconPicker>
          </SettingRow>
        </React.Fragment>
        }

        {
          type === 'navButtonGroup' && <SettingRow flow="no-wrap" role='group' aria-label={translate('step')} label={(<div>
            {translate('step')}
            <Tooltip title={translate('stepTips')} showArrow={false} placement='bottom'>
              <Button className='list-guide-tip-button' type='tertiary' aria-label={translate('stepTips')}>
                <InfoOutlined size='s'/>
              </Button>
            </Tooltip>
          </div>)} >
            <NumericInput size="sm" aria-label={`${step}`} value={step} style={{ width: '27%' }} showHandlers={false}
              min={0.1} max={1} onAcceptValue={value => { onSettingConfigChange(['display', 'standard', 'step'], +value) }} />
          </SettingRow>
        }

        {
          type === 'navButtonGroup' && <React.Fragment>
            <SettingRow flow="wrap" label={translate('previous')} role='group' aria-label={translate('previous')} className="justify-content-between color-drak-600">
              <TextInput size="sm" style={{ width: polished.rem(120) }} aria-label={newPreviousText} value={newPreviousText} onChange={handlePreviousTextChange} onAcceptValue={(value) => { onSettingConfigChange(['display', 'standard', 'previousText'], value) }} />
              <IconPicker className='nav-button-icon-picker' configurableOption={'none'} icon={previousIconWithNLSName as any} customLabel={previousIconWithNLSName?.properties?.filename} onChange={(icon) => { onSettingConfigChange(['display', 'standard', 'previousIcon'], icon) }} setButtonUseColor={false}></IconPicker>
            </SettingRow>

            <SettingRow flow="wrap" label={translate('next')} role='group' aria-label={translate('next')} className="justify-content-between color-drak-600">
              <TextInput size="sm" style={{ width: polished.rem(120) }} aria-label={newNextText} value={newNextText} onChange={handleNextTextChange} onAcceptValue={(value) => { onSettingConfigChange(['display', 'standard', 'nextText'], value) }} />
              <IconPicker className='nav-button-icon-picker' configurableOption={'none'} icon={nextIconWithNLSName as any} customLabel={nextIconWithNLSName?.properties?.filename} onChange={(icon) => { onSettingConfigChange(['display', 'standard', 'nextIcon'], icon) }} setButtonUseColor={false}></IconPicker>
            </SettingRow>

          </React.Fragment>
        }

        {type === 'slider' && <SettingRow tag='label' label={translate('thumbHandle')} aria-label={translate('thumbHandle')} flow="no-wrap">
          <Switch checked={!hideThumb} onChange={() => { onSettingConfigChange(['display', 'standard', 'hideThumb'], !hideThumb) }}></Switch>
        </SettingRow>}

      </React.Fragment>}

    </SettingSection>

    {section && <SettingSection>
      <SettingRow flow="no-wrap" tag='label' label={translate('advance')} aria-label={translate('advance')} role='group' className='color-drak-600'>
        <Switch checked={advanced} onChange={onAdvancedChange}></Switch>
      </SettingRow>
      {advanced && <React.Fragment>
        {isTabStyle && <CollapsablePanel label={translate('navArrowColor')} defaultIsOpen={false} className='my-4 nav-arrow-color-collapse' wrapperClassName='pl-2'>
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
        </CollapsablePanel>}

        <SettingRow label={translate('background')} aria-label={translate('background')} flow="no-wrap" role='group'>
          <ThemeColorPicker specificTheme={appTheme} value={background} onChange={(value) => { onRootStyleChange('bg', value || null) }} />
        </SettingRow>

        {!isExpressMode && isNavType && <SettingRow label={translate('borderRadius')} flow='no-wrap'>
          <BorderRadiusSetting
            style={{ width: '30%' }}
            separated={false} value={rootBorderRadiusValue} placeholder=''
            onChange={(value) => { onRootStyleChange('borderRadius', value.number?.[0] ? `${value.number?.[0]}${value?.unit}` : null) }}
          />
        </SettingRow>}

        {showPageNumber && <SettingRow label={translate('paginationStyle')} aria-label={translate('paginationStyle')} flow="wrap" role='group' className='pagination-style-setting-row color-drak-600'>
          <SettingRow label={translate('fontColor')} role='group' aria-label={translate('fontColor')} flow='no-wrap' css={css`flex: 1;`} className="color-drak-500">
            <ThemeColorPicker
              aria-label={translate('fontColor')} icon={<UppercaseOutlined />} type='with-icon'
              specificTheme={appTheme} value={paginationFontColor}
              onChange={(value) => { onSettingConfigChange(['display', 'paginationFontColor'], value) }} />
          </SettingRow>
        </SettingRow>}

        <AdvancedSettingContainerTagName {...advancedSettingContainerProps as any}>
          {isNavType && <NavStyleSettingByState
            variant={variant as ImmutableObject<NavigationVariant>}
            onlyBorderColor={navStyle === 'underline'}
            text={isTabStyle}
            hideTextStyle={isTabStyle && !showText}
            icon={showIcon && !isTabStyle}
            iconInText={showIcon && isTabStyle}
            onChange={handleVariantItemChange}
            onWholeVariantChange={handleVariantChange} />}
          {type === 'slider' && <SliderStyleSetting hideThumb={hideThumb} variant={variant as IMThemeSliderVariant || undefined} onChange={handleVariantChange} />}
          {type === 'navButtonGroup' && <NavStyleSettingByState
            variant={variant as ImmutableObject<NavigationVariant>}
            states={['default', 'hover', 'disabled']}
            onlyBorderColor={false}
            text={true}
            icon={false}
            iconInText={true}
            onChange={handleVariantItemChange}
            onWholeVariantChange={handleVariantChange} />}
          </AdvancedSettingContainerTagName>
      </React.Fragment>}
    </SettingSection>}

  </div >
}

export default Setting
