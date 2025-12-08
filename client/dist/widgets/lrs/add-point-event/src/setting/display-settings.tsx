/** @jsx jsx */
import { React, jsx, type IntlShape } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, Switch, Tooltip } from 'jimu-ui'
import { formatMessage, getConfigValue, updateConfig, waitTime } from 'widgets/shared-code/lrs'
import type { IMConfig } from '../config'
import type { SettingChangeFunction } from 'jimu-for-builder'

interface Props {
  intl: IntlShape
  widgetId: string
  config: IMConfig
  activeMapViewId: string
  onSettingChange: SettingChangeFunction
}

export function DisplaySettings(props: Props) {
  const { intl, widgetId, config, activeMapViewId, onSettingChange } = props

  const useConfigValue = (key: string, fallback: any) => {
    return React.useMemo(() => {
      return getConfigValue(config, key, activeMapViewId) || fallback
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, activeMapViewId])
  }

  const hideMethod = useConfigValue('hideMethod', false)
  const hideEvent = useConfigValue('hideEvent', false)
  const hideNetwork = useConfigValue('hideNetwork', false)
  const hideType = useConfigValue('hideType', false)
  const hideAttributeSet = useConfigValue('hideAttributeSet', false)
  const hideDates = useConfigValue('hideDates', false)
  const useRouteStartEndDate = useConfigValue('useRouteStartEndDate', false)

  const handleHideMethodChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideMethod', checked, activeMapViewId, onSettingChange)
  }

  const handleHideEventChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideEvent', checked, activeMapViewId, onSettingChange)
  }

  const handleHideNetworkChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideNetwork', checked, activeMapViewId, onSettingChange)
  }

  const handleHideTypeChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideType', checked, activeMapViewId, onSettingChange)
  }

  const handleHideAttributeSetChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideAttributeSet', checked, activeMapViewId, onSettingChange)
  }

  const handleHideDatesChange = (e: any, checked: boolean) => {
    if (!checked) {
      // If the hideDates is unchecked, then the useRouteStartEndDate should be unchecked as well.
      if (useRouteStartEndDate) {
        updateConfig(widgetId, config, 'useRouteStartEndDate', checked, activeMapViewId, onSettingChange)
      }
    }

    // Let the previous update to finish before updating hideDates.
    waitTime(200).then(() => {
      updateConfig(widgetId, config, 'hideDates', checked, activeMapViewId, onSettingChange)
    })
  }

  const handleUseRouteStartEndDatesChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'useRouteStartEndDate', checked, activeMapViewId, onSettingChange)
  }

  return (
    <React.Fragment>
      <SettingSection className='px-4 '>
        <CollapsablePanel
          role='group'
          level={1}
          type='default'
          wrapperClassName='mt-3'
          label={formatMessage(intl, 'displaySettings')}
          defaultIsOpen={true}
          disabled={false}
          aria-label={formatMessage(intl, 'displaySettings')}>
          <SettingRow tag='label' label={formatMessage(intl, 'hideType')}>
            <Switch checked={hideType} onChange={handleHideTypeChange} />
          </SettingRow>
          <SettingRow tag='label' label={formatMessage(intl, 'hideEvent')}>
            <Switch checked={hideEvent} onChange={handleHideEventChange} />
          </SettingRow>
          <SettingRow tag='label' label={formatMessage(intl, 'hideNetwork')}>
            <Switch checked={hideNetwork} onChange={handleHideNetworkChange} />
          </SettingRow>
          <SettingRow tag='label' label={formatMessage(intl, 'hideMethod')}>
            <Switch checked={hideMethod} onChange={handleHideMethodChange} />
          </SettingRow>
          <SettingRow tag='label' label={formatMessage(intl, 'hideAttributeSet')}>
            <Switch checked={hideAttributeSet} onChange={handleHideAttributeSetChange} />
          </SettingRow>
          <div style={{ display: 'none' }}>
            <SettingRow tag='label' label={formatMessage(intl, 'hideDates')}>
              <Switch checked={hideDates} onChange={handleHideDatesChange} />
            </SettingRow>
            {hideDates && (
              <SettingRow tag='label' label={formatMessage(intl, 'useRoutesStartEndDates')}>
                <Tooltip title={formatMessage(intl, 'useRoutesStartEndDatesTooltip')}>
                  <Switch checked={useRouteStartEndDate} onChange={handleUseRouteStartEndDatesChange} />
                </Tooltip>
              </SettingRow>
            )}
          </div>
        </CollapsablePanel>
      </SettingSection>
    </React.Fragment>
  )
}
