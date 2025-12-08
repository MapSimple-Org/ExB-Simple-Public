import { React, hooks, css, classNames, LayoutItemType, defaultMessages as jimuCoreMessages, LayoutType } from 'jimu-core'
import { getAppConfigAction, type AllWidgetSettingProps } from 'jimu-for-builder'
import { defaultMessages as jimuUIMessages, Label, Checkbox, Select, Button, Icon, Alert, Switch } from 'jimu-ui'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import { type IMConfig, MeasurementArrangement, measurementSystemList, lengthUnitList, areaUnitList } from '../config'
import defaultMessages from './translations/default'
import { LayoutItemSizeModes, searchUtils } from 'jimu-layouts/layout-runtime'

type SettingProps = AllWidgetSettingProps<IMConfig>

const style = css`
.placeholder-container {
  height: calc(100% - 100px);
  font-weight: 500;
  color: var(--sys-color-surface-paper-hint);
  .placeholder-hint {
    font-size: 14px;
    max-width: 160px;
  }
}
.arrangement {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sys-spacing-3);
  .arrangement-item {
    min-width: 0;
    .arrangement-btn {
      padding: 0;
      overflow: visible;
      min-width: 0;
      margin-bottom: var(--sys-spacing-2);
      .arrangement-img {
        width: 100%;
        height: auto;
        margin-right: 0;
        background: var(--sys-color-action-pressed);
      }
      .arrangement-img.active {
        outline: 2px solid var(--sys-color-primary-main);
      }
    }
  }
}
`

const Setting = (props: SettingProps): React.ReactElement => {
  const {
    id,
    onSettingChange,
    config,
    useMapWidgetIds
  } = props

  const {
    enableDistance = true,
    defaultDistanceUnit = 'metric',
    enableArea = true,
    defaultAreaUnit = 'metric',
    disableSnapping = false,
    arrangement = MeasurementArrangement.Classic
  } = config

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    onSettingChange({ id, useMapWidgetIds })
  }
  const useMap = useMapWidgetIds?.length > 0

  const onChangeEnableDistance = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onSettingChange({ id, config: config.set('enableDistance', checked) })
  }
  const lengthUnitOptions = [...measurementSystemList, ...lengthUnitList]
  const onChangeDefaultDistanceUnit = (evt: any) => {
    onSettingChange({ id, config: config.set('defaultDistanceUnit', evt?.target?.value) })
  }

  const onChangeEnableArea = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onSettingChange({ id, config: config.set('enableArea', checked) })
  }
  const areaUnitOptions = [...measurementSystemList, ...areaUnitList]
  const onChangeDefaultAreaUnit = (evt: any) => {
    onSettingChange({ id, config: config.set('defaultAreaUnit', evt?.target?.value) })
  }

  const onChangeEnableSnapping = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onSettingChange({ id, config: config.set('disableSnapping', checked) })
  }

  const arrangementList = [{ key: 'classic', value: MeasurementArrangement.Classic }, { key: 'toolbar', value: MeasurementArrangement.Toolbar }]
  const onChangeArrangement = (value: MeasurementArrangement) => {
    const appConfigAction = getAppConfigAction()
    appConfigAction.editWidget({ id, config: config.set('arrangement', value) })
    const layoutInfos = searchUtils.getLayoutInfosHoldContent(appConfigAction.appConfig, LayoutItemType.Widget, id)
    layoutInfos.forEach(layoutInfo => {
      const layoutType = appConfigAction.appConfig.layouts[layoutInfo.layoutId].type
      if (layoutType !== LayoutType.FixedLayout) {
        appConfigAction.exec()
        return
      }
      if (value === MeasurementArrangement.Toolbar) {
        appConfigAction
          .editLayoutItemProperty(layoutInfo, 'setting.autoProps.width', LayoutItemSizeModes.Auto)
          .editLayoutItemProperty(layoutInfo, 'setting.autoProps.height', LayoutItemSizeModes.Auto)
          .editWidgetProperty(id, 'offPanel', true)
          .exec()
      } else if (value === MeasurementArrangement.Classic) {
        appConfigAction
          .editLayoutItemProperty(layoutInfo, 'setting.autoProps.width', LayoutItemSizeModes.Custom)
          .editLayoutItemProperty(layoutInfo, 'setting.autoProps.height', LayoutItemSizeModes.Custom)
          .editLayoutItemProperty(layoutInfo, 'bbox.width', '300px')
          .editLayoutItemProperty(layoutInfo, 'bbox.height', '420px')
          .editWidgetProperty(id, 'offPanel', false)
          .exec()
      }
    })
  }

  const translate = hooks.useTranslation(jimuUIMessages, jimuCoreMessages, defaultMessages)

  return (
    <div className='widget-setting-measurement w-100 h-100' css={style}>
      <SettingSection title={translate('selectMapWidget')}>
        <SettingRow>
          <MapWidgetSelector
            onSelect={onMapWidgetSelected}
            useMapWidgetIds={useMapWidgetIds}
            aria-describedby={'measurement-blank-msg'}
          />
        </SettingRow>
      </SettingSection>

      {!useMap &&
        <div className='d-flex justify-content-center align-items-center placeholder-container'>
          <div className='text-center'>
            <ClickOutlined size={48} className='d-inline-block placeholder-icon mb-2' />
            <p id="measurement-blank-msg" className='placeholder-hint'>{translate('selectMapHint')}</p>
          </div>
        </div>
      }

      {useMap &&
        <React.Fragment>
          <SettingSection
            title={translate('tools')}
            role='group'
            aria-label={translate('tools')}
          >
            <SettingRow>
              <Label>
                <Checkbox className='mr-2' checked={enableDistance} onChange={onChangeEnableDistance} />
                {translate('distance')}
              </Label>
            </SettingRow>
            {enableDistance && <SettingRow label={translate('defaultUnit')} truncateLabel>
              <Select size='sm' value={defaultDistanceUnit}
                className='w-50'
                onChange={onChangeDefaultDistanceUnit}
                aria-label={translate('distance') + ' ' + translate('defaultUnit')}
              >
                {
                  lengthUnitOptions.map((lengthUnit) => (
                    <option key={lengthUnit.key} value={lengthUnit.value}>{translate(lengthUnit.key)}</option>
                  ))
                }
              </Select>
            </SettingRow>}
            <SettingRow>
              <Label>
                <Checkbox className='mr-2' checked={enableArea} onChange={onChangeEnableArea} />
                {translate('area')}
              </Label>
            </SettingRow>
            {enableArea && <SettingRow label={translate('defaultUnit')} truncateLabel>
              <Select size='sm' value={defaultAreaUnit}
                className='w-50'
                onChange={onChangeDefaultAreaUnit}
                aria-label={translate('area') + ' ' + translate('defaultUnit')}
              >
                {
                  areaUnitOptions.map((areaUnit) => (
                    <option key={areaUnit.key} value={areaUnit.value}>{translate(areaUnit.key)}</option>
                  ))
                }
              </Select>
            </SettingRow>}
            {(enableArea || enableDistance) && <SettingRow tag='label' label={translate('disableSnapping')} truncateLabel>
              <Switch checked={disableSnapping} aria-label={translate('disableSnapping')} onChange={onChangeEnableSnapping} />
            </SettingRow>}
            {!enableDistance && !enableArea && <SettingRow>
              <Alert
                form="basic"
                type="warning"
                className="w-100"
                open={true}
                text={translate('atLeastOne')}
              ></Alert>
            </SettingRow>}
          </SettingSection>
          <SettingSection
            title={translate('arrangement')}
            role='radiogroup'
            aria-label={translate('arrangement')}
          >
            <SettingRow className='arrangement'>
              {arrangementList.map((arrangementItem) => <div className='arrangement-item' key={arrangementItem.value}>
                <Button
                  type='tertiary'
                  disableRipple
                  title={translate(arrangementItem.key)}
                  className='arrangement-btn'
                  role='radio'
                  aria-checked={arrangement === arrangementItem.value}
                  onClick={() => { onChangeArrangement(arrangementItem.value) }}
                >
                  <Icon
                    autoFlip
                    icon={require(`./assets/${arrangementItem.key}.png`)}
                    className={classNames('arrangement-img', { active: arrangement === arrangementItem.value })}
                  />
                </Button>
                <div className='text-truncate text-center' title={translate(arrangementItem.key)}>
                  {translate(arrangementItem.key)}
                </div>
              </div>)}
            </SettingRow>
          </SettingSection>
        </React.Fragment>
      }
    </div>
  )
}

export default Setting
