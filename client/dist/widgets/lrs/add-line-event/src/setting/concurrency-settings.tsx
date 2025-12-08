/** @jsx jsx */
import { React, jsx, type IntlShape } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, Switch } from 'jimu-ui'
import { formatMessage, getConfigValue, updateConfig } from 'widgets/shared-code/lrs'
import type { IMConfig } from '../config'
import type { SettingChangeFunction } from 'jimu-for-builder'

interface Props {
  intl: IntlShape
  widgetId: string
  config: IMConfig
  activeMapViewId: string
  onSettingChange: SettingChangeFunction
}

export function ConcurrencySettings(props: Props) {
  const { intl, widgetId, config, activeMapViewId, onSettingChange } = props

  const useConfigValue = (key: string, fallback: any) => {
    return React.useMemo(() => {
      return getConfigValue(config, key, activeMapViewId) || fallback
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, activeMapViewId])
  }

  const hideAddToDominantRouteOption = useConfigValue('hideAddToDominantRouteOption', false)
  const enableAddToDominantRouteOption = useConfigValue('enableAddToDominantRouteOption', false)
  const notAllowOverrideEventReplacement = useConfigValue('notAllowOverrideEventReplacement', false)

  const handleHideAddToDominantRouteOptionChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideAddToDominantRouteOption', checked, activeMapViewId, onSettingChange)
  }

  const handleEnableAddToDominantRouteOptionChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'enableAddToDominantRouteOption', checked, activeMapViewId, onSettingChange)
  }

  const handleNotAllowOverrideEventReplacementChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'notAllowOverrideEventReplacement', checked, activeMapViewId, onSettingChange)
  }

  return (
    <React.Fragment>
      <SettingSection className='px-4 '>
        <CollapsablePanel
          role='group'
          level={1}
          type='default'
          wrapperClassName='mt-3'
          label={formatMessage(intl, 'concurrencySettings')}
          defaultIsOpen={true}
          disabled={false}
          aria-label={formatMessage(intl, 'concurrencySettings')}>
          <SettingRow tag='label' label={formatMessage(intl, 'hideAddToDominantRouteOption')}>
            <Switch checked={hideAddToDominantRouteOption} onChange={handleHideAddToDominantRouteOptionChange} />
          </SettingRow>
          <SettingRow tag='label' label={formatMessage(intl, 'enableAddToDominantRouteOption')}>
            <Switch checked={enableAddToDominantRouteOption} onChange={handleEnableAddToDominantRouteOptionChange} />
          </SettingRow>
          <SettingRow tag='label' label={formatMessage(intl, 'notAllowOverrideEventReplacement')}>
            <Switch checked={notAllowOverrideEventReplacement} onChange={handleNotAllowOverrideEventReplacementChange} />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
    </React.Fragment>
  )
}
