import { React, css, type IMState, Immutable, type ImmutableArray, ReactRedux, type IMThemeButtonStylesByState, hooks, BrowserSizeMode } from 'jimu-core'
import { type AllWidgetSettingProps, getAppConfigAction, type AppConfigAction, builderAppSync } from 'jimu-for-builder'
import { SettingSection, SettingRow, DirectionSelector } from 'jimu-ui/advanced/setting-components'
import { defaultMessages as jimuLayoutMessages, searchUtils } from 'jimu-layouts/layout-runtime'
import { type IMConfig, ControllerAlignment, DisplayType, OverflownStyle } from '../config'
import { Switch, Radio, Select, Label, defaultMessages as jimuUiDefaultMessages, MultiSelect, DistanceUnits, CollapsablePanel, CollapsableToggle, MultiSelectItem } from 'jimu-ui'
import defaultMessages from './translations/default'
import { Shapes, ShapeType } from './shapes'
import { InputUnit } from 'jimu-ui/advanced/style-setting-components'
import { BASE_LAYOUT_NAME, DEFAULT_FIXED_LAYOUT_STYLE } from '../common/consts'
import { type BoxStatesType, type BoxStyleKey, SettingAdvanced } from './setting-advanced'
import { LabelTooltip } from './label-tooltip'
import { FixedLayoutStyleSetting } from './fixed-layout-setting'
import SettingSize from './setting-size'

const DEFAULT_OPEN_START = 'none'

type ControlledWidgets = ImmutableArray<{
  label: string
  value: string
}>

const style = css`
    font-size: 13px;
    font-weight: 400;
    .setting-row-item {
      width: 100%;
      display: flex;
      margin-top: 0.5rem;
      > span.jimu-radio {
        flex-shrink: 0;
        margin-top: 0.1rem;
      }
      > label {
        margin-bottom: 0;
      }
    }
    .jimu-multi-select {
      width: 100%;
      > .jimu-dropdown {
        width: 100%;
      }
      > .jimu-menu-item {
        width: 100%;
        height: 26px;
      }
    }
  `

export type ControllerSettingProps = AllWidgetSettingProps<IMConfig>

const getWidgetIdsFromLayout = (layout): string[] => {
  const order = layout?.order?.asMutable?.() ?? []
  let layoutItems = order.map(itemId => layout.content?.[itemId])
  layoutItems = layoutItems.filter(layoutItem => (layoutItem && layoutItem.id && layoutItem.widgetId && !layoutItem.isPending))
  const layoutItem = layoutItems.map(layoutItem => layoutItem.id)
  return layoutItem.map(itemId => layout.content?.[itemId]?.widgetId)
}

export const useControlledWidgets = (id: string, layoutName: string): ControlledWidgets => {
  const layout = ReactRedux.useSelector((state: IMState) => {
    state = state.appStateInBuilder
    const layouts = state.appConfig.widgets?.[id]?.layouts?.[layoutName]
    const browserSizeMode = state.browserSizeMode
    const mainSizeMode = state.appConfig.mainSizeMode
    const layoutId = searchUtils.findLayoutId(layouts, browserSizeMode, mainSizeMode)
    const layout = state.appConfig.layouts?.[layoutId]
    return layout
  })
  const controlledWidgets = getWidgetIdsFromLayout(layout)
  const widgets = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder.appConfig.widgets)
  const imControlledWidgets = Immutable(controlledWidgets || [])
  return imControlledWidgets.map((widgetId) => ({
    label: widgets[widgetId]?.label,
    value: widgetId
  }))
}

const getButtonVariant = (): IMThemeButtonStylesByState => {
  const variant = Immutable({
    default: {},
    active: {},
    hover: {}
  })
  return variant
}

const Setting = (props: ControllerSettingProps) => {
  const { id, config, controllerWidgetId, onSettingChange } = props
  const mobile = ReactRedux.useSelector((state: IMState) => state.appStateInBuilder?.browserSizeMode === BrowserSizeMode.Small)
  const onlyOpenOne = config?.behavior?.onlyOpenOne
  const displayType = config?.behavior?.displayType
  const arrangement = config?.behavior?.arrangement ?? 'floating'
  const vertical = config?.behavior?.vertical
  const openStarts = config?.behavior?.openStarts
  const space = config?.appearance?.space
  const advanced = config?.appearance?.advanced
  const showLabel = config?.appearance.card?.showLabel
  const showIndicator = config?.appearance.card?.showIndicator ?? true
  const showTooltip = config?.appearance.card?.showTooltip ?? true
  const labelGrowth = config?.appearance.card?.labelGrowth ?? 0
  const shape = config?.appearance.card?.avatar?.shape

  const openStart = openStarts?.[0] ?? DEFAULT_OPEN_START
  const iconInterval = vertical ? space : labelGrowth

  const isInController = !!controllerWidgetId

  const controlledWidgets = useControlledWidgets(id, BASE_LAYOUT_NAME)

  const translate = hooks.useTranslation(jimuUiDefaultMessages, jimuLayoutMessages, defaultMessages)

  const isExpressMode = window.isExpressBuilder

  const variant = advanced ? config?.appearance?.card.variant : getButtonVariant()

  const onSettingConfigChange = (key: string | string[], value: any) => {
    let newConfig = null
    if (Array.isArray(key)) {
      newConfig = config.setIn(key, value)
    } else {
      newConfig = config.set(key, value)
    }
    onSettingChange({
      id: id,
      config: newConfig
    })
  }

  const handleOpenTypeChange = (e: React.ChangeEvent<HTMLInputElement>, key: string, value: any) => {
    const checked = e.currentTarget.checked
    if (!checked) {
      return
    }
    let newConfig = null
    const appConfigAction = getAppConfigAction()
    if (key === 'onlyOpenOne') {
      newConfig = config.setIn(['behavior', 'openStarts'], Immutable([])).setIn(['behavior', key], value)
      if (!value) {
        newConfig = newConfig.setIn(['behavior', 'arrangement'], 'floating')
      }
      toggleControllerPanel(appConfigAction, 'floating')
    } else if (key === 'displayType') {
      value = value ? DisplayType.Stack : DisplayType.SideBySide
      newConfig = config.setIn(['behavior', key], value)
    }
    appConfigAction.editWidget({
      id,
      config: newConfig
    }).exec()
  }

  const toggleControllerPanel = (appConfigAction: AppConfigAction, arrangement: 'floating' | 'fixed') => {
    if (arrangement === 'floating') {
      return appConfigAction.removeControllerPanel(id)
    } else if (arrangement === 'fixed') {
      return appConfigAction.editControllerPanel(id, DEFAULT_FIXED_LAYOUT_STYLE)
    }
  }

  const handleArrangementChange = (e: React.ChangeEvent<HTMLInputElement>, value: 'floating' | 'fixed') => {
    const checked = e.currentTarget.checked
    if (!checked) {
      return
    }
    const newConfig = config.setIn(['behavior', 'arrangement'], value)
    const appConfigAction = getAppConfigAction()
    toggleControllerPanel(appConfigAction, value)
    appConfigAction.editWidget({
      id,
      config: newConfig
    }).exec()
  }

  const openStartsInSizeMode = openStarts ? openStarts.filter(value => controlledWidgets.map(w => w.value).includes(value)) : []
  const handleOpenStartMultipleChange = (value: string, selectedValues: string[]) => {
    const values = onlyOpenOne ? (selectedValues.length ? [value] : []) : selectedValues
    const openStartsInOtherSizeMode = openStarts ? openStarts.filter(value => !openStartsInSizeMode.includes(value)) : []
    onSettingConfigChange(['behavior', 'openStarts'], openStartsInOtherSizeMode.concat(values))
  }

  const handleOpenStartSingleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const value = evt.target.value
    let openStarts = []
    if (value !== DEFAULT_OPEN_START) {
      openStarts = [value]
    }
    onSettingConfigChange(['behavior', 'openStarts'], openStarts)
  }

  const renderMultiSelectText = (values: string[]) => {
    if (onlyOpenOne && values.length) {
      const widget = controlledWidgets.find(w => w.value === values[0])
      return widget?.label
    } else {
      const widgetNumber = values?.length || 0
      return translate('widgetsSelected', { widgetNumber })
    }
  }

  const handleIconIntervalChanged = (value: number) => {
    value = +value
    if (isNaN(value)) {
      value = 0
    }

    let newConfig = config
    if (newConfig.behavior.vertical) {
      newConfig = newConfig.setIn(['appearance', 'space'], value).setIn(['appearance', 'card', 'labelGrowth'], 0)
    } else {
      newConfig = newConfig.setIn(['appearance', 'card', 'labelGrowth'], value).setIn(['appearance', 'space'], 0)
    }
    onSettingChange({
      id,
      config: newConfig
    })
  }

  const handleAdvancedToggle = (advanced?: boolean) => {
    let newConfig = config.setIn(['appearance', 'advanced'], advanced)
    if (advanced) {
      const variant = getButtonVariant()
      newConfig = newConfig.setIn(['appearance', 'card', 'variant'], variant)
    } else {
      newConfig = newConfig.setIn(['appearance', 'card', 'variant'], undefined)
    }

    onSettingChange({
      id,
      config: newConfig
    })
  }

  const handleDirectionChange = (vertical: boolean) => {
    if (config.behavior.vertical === vertical) return
    let newConfig = config.setIn(['behavior', 'vertical'], vertical)
    if (vertical) {
      newConfig = newConfig.setIn(['appearance', 'card', 'labelGrowth'], 0).setIn(['appearance', 'space'], labelGrowth)
    } else {
      newConfig = newConfig.setIn(['appearance', 'space'], 0).setIn(['appearance', 'card', 'labelGrowth'], space)
    }
    getAppConfigAction().editWidget({
      id,
      config: newConfig
    }).exchangeWidthAndHeight().exec()
  }

  const handleAdvancedChange = (state: string, key: string, value: any) => {
    onSettingConfigChange(['appearance', 'card', 'variant', state, key], value)
  }

  const alignment = config?.behavior.alignment || 'center'
  const handleAlignmentChange = (evt) => {
    onSettingConfigChange(['behavior', 'alignment'], evt.target.value)
  }

  const overflownStyle = config?.behavior.overflownStyle || OverflownStyle.Arrows
  const handleOverflownStyleChange = (evt) => {
    onSettingConfigChange(['behavior', 'overflownStyle'], evt.target.value)
    builderAppSync.publishWidgetToolbarStateChangeToApp(id, ['controller-previous', 'controller-next'])
  }

  const handleAdvancedReset = (state: BoxStatesType, keys: BoxStyleKey[]) => {
    let newConfig = config
    for (const key of keys) {
      const stateStyle = newConfig?.appearance?.card?.variant?.[state]
      newConfig = newConfig.setIn(['appearance', 'card', 'variant', state], stateStyle.without(key))
    }
    onSettingChange({
      id: id,
      config: newConfig
    })
  }

  return (
    <div className='widget-setting-controller jimu-widget-setting' css={style}>
      {!isExpressMode && <SettingSection>
        <SettingRow flow='no-wrap' label={translate('direction')} truncateLabel>
          <DirectionSelector
            aria-label={translate('direction')}
            size='sm'
            vertical={vertical}
            onChange={handleDirectionChange}
          ></DirectionSelector>
        </SettingRow>
        {!isInController && <SettingRow flow='no-wrap' label={translate('alignment')} truncateLabel>
          <Select
            size='sm'
            aria-label={translate('alignment')}
            value={alignment}
            onChange={handleAlignmentChange}
            className='w-50'
          >
            <option value={ControllerAlignment.Center}>{translate('center')}</option>
            <option value={ControllerAlignment.Start}>{vertical ? translate('top') : translate('left')}</option>
            <option value={ControllerAlignment.End}>{vertical ? translate('bottom') : translate('right')}</option>
          </Select>
        </SettingRow>}
      </SettingSection>}
      <SettingSection
        title={translate('behavior')}
        role='group'
        aria-label={translate('behavior')}
      >
        <SettingRow flow='wrap' label={translate('openWidget')}>
          <div
            role='radiogroup'
            className='setting-row-item'
            aria-label={translate('openWidget')}
          >
            <Radio
              id='only-open-one'
              style={{ cursor: 'pointer' }}
              name='only-open-one'
              onChange={(e) => { handleOpenTypeChange(e, 'onlyOpenOne', true) }}
              checked={onlyOpenOne}
            />
            <Label
              style={{ cursor: 'pointer' }}
              for='only-open-one'
              className='ml-2'
            >
              {translate('single')}
            </Label>
          </div>
          <div className='setting-row-item'>
            <Radio
              id='open-multiple'
              style={{ cursor: 'pointer' }}
              name='only-open-one'
              onChange={(e) => { handleOpenTypeChange(e, 'onlyOpenOne', false) }}
              checked={!onlyOpenOne}
            />
            <Label
              style={{ cursor: 'pointer' }}
              for='open-multiple'
              className='ml-2'
            >
              {translate('multiple')}
            </Label>
          </div>
        </SettingRow>

        {!isInController && <SettingRow flow='wrap' label={translate('openStart')}>
          {!onlyOpenOne && (
            <MultiSelect
            size='sm'
            a11y-description={translate('openStart')}
            values={openStartsInSizeMode}
            onChange={handleOpenStartMultipleChange}
            displayByValues={renderMultiSelectText}
          >
            {controlledWidgets.map((widget) => {
              return (<MultiSelectItem key={widget.value} value={widget.value} label={widget.label}/>)
            })}
          </MultiSelect>
          )}
          {onlyOpenOne && (
            <Select
              a11y-description={translate('openStart')}
              value={openStart}
              size='sm'
              onChange={handleOpenStartSingleChange}
              className='w-100'
            >
              <option value={DEFAULT_OPEN_START}>{translate('none')}</option>
              {controlledWidgets?.map((item) => {
                return (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                )
              })}
            </Select>
          )}
        </SettingRow>}
        {!onlyOpenOne && (
          <SettingRow flow='wrap' label={translate('displayType')}>
            <div
              role='radiogroup'
              className='setting-row-item'
              aria-label={translate('displayType')}
            >
              <Radio
                id='display-stack'
                style={{ cursor: 'pointer' }}
                name='display-type'
                onChange={(e) => { handleOpenTypeChange(e, 'displayType', true) }}
                checked={displayType === DisplayType.Stack}
              />
              <Label
                style={{ cursor: 'pointer' }}
                for='display-stack'
                className='ml-2'
              >
                {translate('stack')}
              </Label>
            </div>
            <div className='setting-row-item'>
              <Radio
                id='display-side-by-side'
                style={{ cursor: 'pointer' }}
                name='display-type'
                onChange={(e) => { handleOpenTypeChange(e, 'displayType', false) }}
                checked={displayType === DisplayType.SideBySide}
              />
              <Label
                style={{ cursor: 'pointer' }}
                for='display-side-by-side'
                className='ml-2'
              >
                {translate('sideBySide')}
              </Label>
            </div>
          </SettingRow>
        )}
      </SettingSection>

      {(!mobile && onlyOpenOne) && <SettingSection>
        <CollapsablePanel defaultIsOpen={true} label={translate('widgetPanelArrangment')}>
          <SettingRow flow='wrap' role='group' aria-label={translate('widgetPanelArrangment')}>
            <div
              role='radiogroup'
              className='setting-row-item'
              aria-label={translate('widgetPanelArrangment')}
            >
              <Radio
                id='panel-floating'
                style={{ cursor: 'pointer' }}
                name='panel-arrangment'
                onChange={(e) => { handleArrangementChange(e, 'floating') }}
                checked={arrangement === 'floating'}
              />
              <Label
                style={{ cursor: 'pointer' }}
                for='panel-floating'
                className='ml-2'
              >
                {translate('panelFloating')}
              </Label>
            </div>
            <div className='setting-row-item'>
              <Radio
                id='panel-fixed'
                style={{ cursor: 'pointer' }}
                name='panel-arrangment'
                onChange={(e) => { handleArrangementChange(e, 'fixed') }}
                checked={arrangement === 'fixed'}
              />
              <Label
                style={{ cursor: 'pointer' }}
                for='panel-fixed'
                className='ml-2'
              >
                {translate('fixed')}
              </Label>
            </div>
          </SettingRow>
          {
            arrangement === 'fixed' && <SettingRow flow='wrap' label={translate('positionAndSize')}>
              <FixedLayoutStyleSetting id={id}/>
            </SettingRow>
          }
        </CollapsablePanel>
      </SettingSection>
      }
      <SettingSection>
        <CollapsablePanel
          defaultIsOpen={true}
          label={
            <LabelTooltip
              label={translate('appearance')}
              tooltip={isExpressMode ? translate('appearanceTipExpress') : translate('appearanceTip')}
            />
          }>
          {!isExpressMode && <SettingRow flow='wrap' label={translate('iconStyle')} className='mt-4'>
            <div role='group' className='d-flex' aria-label={translate('iconStyle')}>
              <Shapes
                type={ShapeType.Circle}
                title={translate('circle', true)}
                className='mr-2'
                active={shape === 'circle'}
                onClick={() => {
                  onSettingConfigChange(
                    ['appearance', 'card', 'avatar', 'shape'],
                    'circle'
                  )
                }
                }
              />
              <Shapes
                type={ShapeType.Rectangle}
                title={translate('rectangle')}
                active={shape === 'rectangle'}
                onClick={() => {
                  onSettingConfigChange(
                    ['appearance', 'card', 'avatar', 'shape'],
                    'rectangle'
                  )
                }
                }
              />
            </div>
          </SettingRow>}
          {!isExpressMode && <SettingRow tag='label' label={translate('showIconLabel')}>
            <Switch
              checked={showLabel}
              onChange={(evt) => {
                onSettingConfigChange(
                  ['appearance', 'card', 'showLabel'],
                  evt.target.checked
                )
              }
              }
            ></Switch>
          </SettingRow>}
          <SettingRow tag='label' label={translate('indicator')} className='mt-4'>
            <Switch
              checked={showIndicator}
              onChange={(evt) => {
                onSettingConfigChange(
                  ['appearance', 'card', 'showIndicator'],
                  evt.target.checked
                )
              }
              }
            ></Switch>
          </SettingRow>
          <SettingRow tag='label' label={translate('tooltip')}>
            <Switch
              checked={showTooltip}
              onChange={(evt) => {
                onSettingConfigChange(
                  ['appearance', 'card', 'showTooltip'],
                  evt.target.checked
                )
              }
              }
            ></Switch>
          </SettingRow>
          {!isExpressMode && <SettingSize
            id={id}
            config={config}
            onSettingChange={onSettingChange}
          />}
          <SettingRow flow='no-wrap' label={translate('iconInterval')} truncateLabel>
            <InputUnit
              className='w-50'
              min={0}
              max={999}
              aria-label={translate('iconInterval')}
              value={{ distance: iconInterval, unit: DistanceUnits.PIXEL }}
              onChange={({ distance }) => { handleIconIntervalChanged(distance) }}
            />
          </SettingRow>
          {!isInController && <SettingRow flow='wrap' label={translate('overflownStyle')}>
            <Select
              size='sm'
              aria-label={translate('overflownStyle')}
              value={overflownStyle}
              onChange={handleOverflownStyleChange}
            >
              <option value={OverflownStyle.Arrows}>{translate('iconGroup_arrows')}</option>
              <option value={OverflownStyle.PopupWindow}>{translate('popupWindow')}</option>
            </Select>
          </SettingRow>}
        </CollapsablePanel>
      </SettingSection>

      {!isExpressMode && <SettingSection>
        <CollapsableToggle
          label={translate('advance')}
          isOpen={advanced}
          onRequestOpen={() => { handleAdvancedToggle(true) }}
          onRequestClose={() => { handleAdvancedToggle(false) }}
        >
          <SettingAdvanced
            className='mt-4'
            variant={variant}
            showLabel={showLabel}
            onChange={handleAdvancedChange}
            onReset={handleAdvancedReset}
          />
        </CollapsableToggle>
      </SettingSection>}
    </div>
  )
}

export default Setting
