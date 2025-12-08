/** @jsx jsx */
import { jsx, React, hooks, AppMode, Immutable, focusElementInKeyboardMode } from 'jimu-core'
import type { SizeModeLayoutJson, IMAppConfig, ImmutableArray, UseDataSource, BrowserSizeMode } from 'jimu-core'
import { searchUtils, defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { builderAppSync, getAppConfigAction } from 'jimu-for-builder'
import { SettingRow, SettingSection, CardLayoutSetting, setLayoutAuto as setLayoutAutoUtil, type SwitchCardLayoutOption } from 'jimu-ui/advanced/setting-components'
import { Select, Button, Switch, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import type { IMConfig } from '../../config'
import { SelectionModeType, Status, ListLayout } from '../../config'
import defaultMessages from '../translations/default'
import CardBackgroundSetting from './style-setting/card-background-setting'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'

interface Props {
  id: string
  config: IMConfig
  appConfig: IMAppConfig
  showCardSetting: Status
  browserSizeMode: BrowserSizeMode
  useDataSources: ImmutableArray<UseDataSource>
  appMode: AppMode
  layouts: { [name: string]: SizeModeLayoutJson }
  toHoverSettingButtonRef: HTMLButtonElement
  toSelectedSettingButtonRef: HTMLButtonElement
  onSettingChange: SettingChangeFunction
  changeCardSettingAndBuilderStatus: (status: Status) => void
  onSettingChangeAndUpdateUsedFieldsOfDs: (config?: IMConfig) => void
}

const SelectAndHoverSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const { appMode, layouts, id, appConfig, browserSizeMode, useDataSources, config, showCardSetting, toSelectedSettingButtonRef, toHoverSettingButtonRef } = props
  const { onSettingChange, changeCardSettingAndBuilderStatus, onSettingChangeAndUpdateUsedFieldsOfDs } = props

  const statusIntl: { [key: string]: string } = {}
  statusIntl[Status.Hover] = nls('hover')
  statusIntl[Status.Selected] = nls('selected')
  statusIntl[Status.Default] = nls('regular')

  const onHoverLayoutOpenChange = hooks.useEventCallback(evt => {
    const listLayout = config?.cardConfigs?.[Status.Hover]?.listLayout || ListLayout.CUSTOM
    const value = evt.target.checked
    if (config.cardConfigs[Status.Hover].enable === value) return
    let action = getAppConfigAction()
    let newConfig = config.setIn(['cardConfigs', Status.Hover, 'enable'], value)
    newConfig = newConfig.setIn(['cardConfigs', Status.Hover, 'listLayout'], ListLayout.AUTO)
    if (config.cardConfigs[Status.Hover].enable && !value) {
      if (listLayout === ListLayout.CUSTOM) {
        // remove hover layout
        const desLayoutId = searchUtils.findLayoutId(
          Immutable(layouts[Status.Hover]),
          browserSizeMode,
          appConfig.mainSizeMode
        )
        action = action.clearLayoutContent(desLayoutId)
      }
      changeBuilderStatus(Status.Default)
      action.editWidgetConfig(id, newConfig).exec()
    } else if (!config.cardConfigs[Status.Hover].enable && value) {
      setLayoutAuto(Status.Hover, newConfig)
      changeBuilderStatus(Status.Hover)
    }
  })

  const changeBuilderStatus = (status: Status) => {
    builderAppSync.publishChangeWidgetStatePropToApp({
      widgetId: id,
      propKey: 'builderStatus',
      value: status
    })
  }

  const setLayoutAuto = hooks.useEventCallback((status: Status, newConfig: IMConfig) => {
    const option: SwitchCardLayoutOption = {
      layout: ListLayout.AUTO as any,
      config: newConfig,
      widgetId: id,
      appConfig: appConfig,
      status: status,
      layouts: layouts,
      mainSizeMode: appConfig.mainSizeMode
    }
    setLayoutAutoUtil(option)
  })

  const onSelectionSwitch = evt => {
    const selected = evt.target.checked
    if (selected) {
      changeSelectionMode(SelectionModeType.Single)
    } else {
      changeSelectionMode(SelectionModeType.None)
    }
  }

  const onSelectionModeChange = evt => {
    const value = evt.target.value
    changeSelectionMode(value)
  }

  const changeSelectionMode = hooks.useEventCallback((value: SelectionModeType) => {
    let newConfig = config
    const selectionMode = newConfig.cardConfigs[Status.Selected].selectionMode
    const listLayout = newConfig.cardConfigs[Status.Selected].listLayout || ListLayout.CUSTOM
    if (selectionMode === value) {
      return
    }
    let action = getAppConfigAction()
    newConfig = newConfig.setIn(['cardConfigs', Status.Selected, 'selectionMode'], value)
    if (selectionMode !== SelectionModeType.None && value === SelectionModeType.None) {
      if (listLayout === ListLayout.CUSTOM) {
        // remove selected layout
        const desLayoutId = searchUtils.findLayoutId(
          Immutable(layouts[Status.Selected]),
          browserSizeMode,
          appConfig.mainSizeMode
        )
        action = action.clearLayoutContent(desLayoutId)
      }
      action.editWidgetConfig(id, newConfig).exec()
      changeBuilderStatus(Status.Default)
    } else if (selectionMode === SelectionModeType.None && value !== SelectionModeType.None) {
      setLayoutAuto(Status.Selected, newConfig)
      changeBuilderStatus(Status.Selected)
    } else if (selectionMode !== SelectionModeType.None && value !== SelectionModeType.None) {
      action.editWidgetConfig(id, newConfig).exec()
    }
  })

  const getSelectModeOptions = (): React.JSX.Element[] => {
    return [
      <option key={SelectionModeType.Single} value={SelectionModeType.Single}>
        {nls('single')}
      </option>,
      <option
        key={SelectionModeType.Multiple}
        value={SelectionModeType.Multiple}
      >
        {nls('multiple')}
      </option>
    ]
  }

  const onCardSettingReturnBackClick = evt => {
    changeCardSettingAndBuilderStatus(Status.Default)
    setTimeout(() => {
      if (showCardSetting === Status.Hover) {
        focusElementInKeyboardMode(toHoverSettingButtonRef)
      }
      if (showCardSetting === Status.Selected) {
        focusElementInKeyboardMode(toSelectedSettingButtonRef)
      }
    }, 100)
  }

  return (
    <div className='list-card-setting'>
      <SettingSection>
        <SettingRow
          label={
            <Button
              className='d-flex text-truncate align-items-center card-setting-return'
              onClick={onCardSettingReturnBackClick}
              type='tertiary'
              size='sm'
              title={nls('back')}
              aria-label={nls('back')}
            >
              <ArrowLeftOutlined className='mr-1' autoFlip/>
              {statusIntl[showCardSetting]}
            </Button>
          }
        />
        <SettingRow
          tag='label'
          label={nls('enableStatus', {
            status: statusIntl[showCardSetting].toLocaleLowerCase()
          })}
          aria-label={nls('enableStatus', { status: statusIntl[showCardSetting].toLocaleLowerCase() })}
        >
          <Switch
            checked={
              showCardSetting === Status.Hover
                ? config.cardConfigs[Status.Hover].enable
                : config.cardConfigs[Status.Selected].selectionMode !==
                  SelectionModeType.None
            }
            onChange={
              showCardSetting === Status.Hover
                ? onHoverLayoutOpenChange
                : onSelectionSwitch
            }
            title={nls('enableStatus', { status: statusIntl[showCardSetting].toLocaleLowerCase() })}
            aria-label={nls('enableStatus', { status: statusIntl[showCardSetting].toLocaleLowerCase() })}
          />
        </SettingRow>
      </SettingSection>

      {((showCardSetting === Status.Selected &&
        config.cardConfigs[Status.Selected].selectionMode !==
          SelectionModeType.None) ||
        (showCardSetting === Status.Hover &&
          config.cardConfigs[Status.Hover].enable)) && (
        <SettingSection className='card-setting-con'>
          {showCardSetting === Status.Selected && (<SettingSection className='clear-padding'>
            <SettingRow
              flow='wrap'
              label={nls('selectMode')}
              role='group'
              aria-label={nls('selectMode')}
            >
              <Select
                value={config.cardConfigs[Status.Selected].selectionMode}
                onChange={onSelectionModeChange}
                aria-label={nls('selectMode')}
              >
                {getSelectModeOptions()}
              </Select>
            </SettingRow>
          </SettingSection>)}
          <CardBackgroundSetting
            id={id}
            config={config}
            isClearBorder={false}
            showCardSetting={showCardSetting}
            useDataSources={useDataSources}
            onSettingChange={onSettingChange}
            onSettingChangeAndUpdateUsedFieldsOfDs={onSettingChangeAndUpdateUsedFieldsOfDs}
          />
          {appMode !== AppMode.Express && <CardLayoutSetting
            id={id}
            onSettingChange={onSettingChange}
            cardLayout={config.cardConfigs[showCardSetting]?.listLayout as any}
            status={showCardSetting}
            browserSizeMode={browserSizeMode}
            mainSizeMode={appConfig.mainSizeMode}
            layouts={layouts}
            config={config}
            appConfig={appConfig}
          />}
        </SettingSection>
      )}
    </div>
  )
}
export default SelectAndHoverSetting