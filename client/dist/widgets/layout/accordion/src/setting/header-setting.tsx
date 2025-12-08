/** @jsx jsx */
import { React, classNames, Immutable, lodash, hooks, jsx, css } from 'jimu-core'
import { getAppConfigAction } from 'jimu-for-builder'
import { Icon, Collapse, DistanceUnits, Select, Switch, Tooltip, type LinearUnit, styleUtils } from 'jimu-ui'
import { Padding, InputUnit, TextStyle, BorderSetting, BorderRadiusSetting } from 'jimu-ui/advanced/style-setting-components'
import { IconPicker } from 'jimu-ui/advanced/resource-selector'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import downOutlinedIcon from 'jimu-icons/svg/outlined/directional/down.svg'
import { useTheme2, withTheme } from 'jimu-theme'
import type { HeaderConfig } from '../config'
import defaultMessages from './translations/default'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'

const style = css`
  height: 80px;
  color: var(--ref-palette-white);
  text-align: center;
  position: relative;
  cursor: pointer;

  .with-bg {
    background: var(--ref-palette-neutral-300);
    border-radius: 4px;
    &:hover {
      background: var(--sys-color-action-selected-hover);
    }
    &.active {
      background: var(--sys-color-action-selected);
    }
    border: 1px solid var(--sys-color-divider-primary);
  }
  .border-setting {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .padding-setting {
    border-style: dashed;
    position: absolute;
    top: 13px;
    left: 13px;
    right: 13px;
    bottom: 13px;
  }
  .content-setting {
    position: absolute;
    top: 24px;
    left: 24px;
    right: 24px;
    bottom: 24px;
    .icon {
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }
    .label {
      width: 64px;
      height: 10px;
    }
    & > div {
      background: var(--sys-color-action-disabled-text);
    }
    &.active {
      border: none;
    }
    &.active  > div {
      background: var(--sys-color-surface-background);
    }
  }
`

function HeaderSettingComponent (props: HeaderConfig & { widgetId: string }) {
  const translate = hooks.useTranslation(defaultMessages)
  const [activePart, setActivePart] = React.useState('content')
  const ref = React.useRef<HTMLDivElement>(undefined)
  const theme2 = useTheme2()

  const handleConfigChange = (prop: string, value: any) => {
    const appConfigAction = getAppConfigAction()

    appConfigAction.editWidgetProperty(props.widgetId, prop, value).exec()
  }

  const handleBorderChange = (value) => {
    const appConfigAction = getAppConfigAction()
    const widgetJson = appConfigAction.appConfig.widgets[props.widgetId]
    const headerConfig = widgetJson?.config?.header ?? Immutable({})

    appConfigAction.editWidgetProperty(
      props.widgetId,
      'config.header',
      headerConfig.set('border', value).without('borderLeft').without('borderRight').without('borderTop').without('borderBottom')
    ).exec()
  }

  const handleBorderSideChange = (side, value) => {
    const appConfigAction = getAppConfigAction()
    const widgetJson = appConfigAction.appConfig.widgets[props.widgetId]
    const headerConfig = widgetJson?.config?.header ?? Immutable({})

    appConfigAction.editWidgetProperty(
      props.widgetId,
      'config.header',
      headerConfig.set(lodash.camelCase(`border-${side}`), value).without('border')
    ).exec()
  }

  const wrapKeyDown = (e, part: string) => {
    e.stopPropagation()
    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
      setActivePart(part)
    }
  }

  return (
    <div className='w-100'>
      <div className='header-setting w-100 mt-2' css={style} ref={ref}>
        <Tooltip title={translate('bgAndBorder')}>
          <div
            role='button'
            aria-pressed={activePart === 'border'}
            tabIndex={0}
            onKeyDown={(e) => { wrapKeyDown(e, 'border') }}
            className={classNames('border-setting with-bg', { active: activePart === 'border' })}
            onClick={() => { setActivePart('border') }}
          />
        </Tooltip>
        <Tooltip title={translate('padding')}>
          <div
            role='button'
            aria-pressed={activePart === 'padding'}
            tabIndex={0}
            onKeyDown={(e) => { wrapKeyDown(e, 'padding') }}
            className={classNames('padding-setting with-bg', { active: activePart === 'padding' })}
            onClick={() => { setActivePart('padding') }}
          />
        </Tooltip>
        <Tooltip title={translate('content')}>
          <div
            role='button'
            aria-pressed={activePart === 'content'}
            tabIndex={0}
            onKeyDown={(e) => { wrapKeyDown(e, 'content') }}
            className={classNames('content-setting with-bg d-flex justify-content-center align-items-center', { active: activePart === 'content' })}
            onClick={() => { setActivePart('content') }}
          >
            <div className='ml-2 icon' />
            <div className='ml-2 label' />
            <Icon
              className='ml-auto mr-2'
              color={activePart !== 'content' ? 'var(--sys-color-action-disabled-text)' : 'var(--sys-color-surface-background)'}
              icon={downOutlinedIcon}
              size={16}
            />
          </div>
        </Tooltip>
      </div>
      {activePart === 'border' && (
        <React.Fragment>
          <SettingSection title={translate('background')} className='p-0 mt-4 border-bottom-0'>
            <SettingRow label={translate('collapse')}>
              <ThemeColorPicker
                value={props.collapsedColor}
                specificTheme={theme2}
                onChange={(value) => { handleConfigChange('config.header.collapsedColor', value) }}
              />
            </SettingRow>
            <SettingRow label={translate('expand')}>
              <ThemeColorPicker
                value={props.expandedColor}
                specificTheme={theme2}
                onChange={(value) => { handleConfigChange('config.header.expandedColor', value) }}
              />
            </SettingRow>
          </SettingSection>
          <SettingSection title={translate('border')} className='px-0 pt-3 pb-0 border-bottom-0'>
            <SettingRow flow='wrap'>
              <BorderSetting
                value={props.border}
                top={props.borderTop}
                left={props.borderLeft}
                right={props.borderRight}
                bottom={props.borderBottom}
                onChange={handleBorderChange}
                onSideChange={handleBorderSideChange}
              />
            </SettingRow>
            <SettingRow flow='wrap' label={translate('borderRadius')}>
              <BorderRadiusSetting value={props.borderRadius} onChange={(value) => { handleConfigChange('config.header.borderRadius', value) }} />
            </SettingRow>
          </SettingSection>
        </React.Fragment>
      )}
      {activePart === 'padding' && (
        <SettingRow
          className='mt-4'
          role='group'
          aria-label={translate('padding')}
          label={translate('padding')}
          flow='wrap'
        >
          <Padding
            value={props.padding as any}
            units={[DistanceUnits.PIXEL]}
            min={0}
            onChange={(value) => {
              handleConfigChange('config.header.padding', {
                number: styleUtils.expandStyleArray(value.number),
                unit: value.unit
              })
            }}
          />
        </SettingRow>
      )}
      {activePart === 'content' && (
        <React.Fragment>
          <SettingRow tag='label' label={translate('icon')} className='mt-4'>
            <Switch
              checked={props.showWidgetIcon}
              onChange={(e, checked: boolean) => { handleConfigChange('config.header.showWidgetIcon', checked) }}
            />
          </SettingRow>
          <Collapse isOpen={props.showWidgetIcon}>
            <SettingRow className='mt-2'>
              <InputUnit
                precision={0}
                value={`${props.widgetIconSize ?? 16}px`}
                min={8}
                max={64}
                required
                onChange={(value: LinearUnit) => { handleConfigChange('config.header.widgetIconSize', value.distance) }}
              />
              <ThemeColorPicker
                className='ml-1'
                value={props.widgetIconColor}
                specificTheme={theme2}
                onChange={(value) => { handleConfigChange('config.header.widgetIconColor', value) }}
              />
            </SettingRow>
          </Collapse>
          <SettingRow label={translate('text')} flow='wrap' className='pt-3'>
            <TextStyle {...props.textStyle} onChange={(key: string, value: any) => { handleConfigChange(`config.header.textStyle.${key}`, value) }} />
          </SettingRow>
          <SettingRow label={translate('expandButton')}>
            <IconPicker
              icon={props.expandIcon}
              configurableOption='all'
              setButtonUseColor={false}
              previewOptions={{ size: false, color: true }}
              customLabel={translate('expandButton')}
              onChange={(value) => { handleConfigChange('config.header.expandIcon', value) }}
            />
          </SettingRow>
          <SettingRow label={translate('collapseButton')}>
            <IconPicker
              icon={props.collapseIcon}
              configurableOption='all'
              setButtonUseColor={false}
              previewOptions={{ size: false, color: true }}
              customLabel={translate('collapseButton')}
              onChange={(value) => { handleConfigChange('config.header.collapseIcon', value) }}
            />
          </SettingRow>
          <SettingRow flow='wrap' label={translate('togglePosition')}>
            <Select
              size='sm'
              className='w-100'
              aria-label={translate('togglePosition')}
              value={props.togglePosition ?? 'right'}
              onChange={(e) => { handleConfigChange('config.header.togglePosition', e.target.value) }}
            >
              <option value='left'>{translate('start')}</option>
              <option value='right'>{translate('end')}</option>
            </Select>
          </SettingRow>
        </React.Fragment>
      )}
    </div>
  )
}

export default withTheme(HeaderSettingComponent)
