/** @jsx jsx */
import { React, jsx, hooks, type IntlShape, type ImmutableArray } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, Select, Switch, Tooltip } from 'jimu-ui'
import defaultMessages from './translations/default'
import { type LrsLayer, waitTime, type DefaultInfo, lrsDefaultMessages, getConfigValue, updateConfig } from 'widgets/shared-code/lrs'
import type { IMConfig } from '../config'
import type { SettingChangeFunction } from 'jimu-for-builder'

interface Props {
  intl: IntlShape
  widgetId: string
  config: IMConfig
  activeMapViewId: string
  onSettingChange: SettingChangeFunction
}

export function DefaultSettings(props: Props) {
  const { widgetId, config, activeMapViewId, onSettingChange } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages)

  const useConfigValue = (key: string, fallback: any) => {
    return React.useMemo(() => {
      return getConfigValue(config, key, activeMapViewId) || fallback
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, activeMapViewId])
  }

  const lrsLayers = useConfigValue('lrsLayers', []) as ImmutableArray<LrsLayer>
  const eventLayers = useConfigValue('eventLayers', [])
  const defaultEvent = useConfigValue('defaultEvent', { index: -1, name: '' }) as DefaultInfo
  const hideEvent = useConfigValue('hideEvent', false)
  const hideNetwork = useConfigValue('hideNetwork', false)
  const hideDate = useConfigValue('hideDate', false)
  const useRouteStartDate = useConfigValue('useRouteStartDate', false)

  const setDefaultEventChanged = (value: string) => {
    const index = lrsLayers.findIndex((layer) =>
      layer.name === value
    )
    const newDefault: DefaultInfo = {
      index: index,
      name: lrsLayers[index].name
    }
    updateConfig(widgetId, config, 'defaultEvent', newDefault, activeMapViewId, onSettingChange)
  }

  const setHideEventChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideEvent', checked, activeMapViewId, onSettingChange)
  }

  const setHideNetworkChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideNetwork', checked, activeMapViewId, onSettingChange)
  }

  const setHideDateChange = (e: any, checked: boolean) => {
    if (!checked) {
      // If the hideDate is unchecked, then the useRouteStartDate should be unchecked as well.
      if (useRouteStartDate) {
        updateConfig(widgetId, config, 'useRouteStartDate', false, activeMapViewId, onSettingChange)
      }
    }

    // Let the previous update to finish before updating hideDate.
    waitTime(200).then(() => {
      updateConfig(widgetId, config, 'hideDate', checked, activeMapViewId, onSettingChange)
    })
  }

  const setUseRouteStartDatesChange = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'useRouteStartDate', checked, activeMapViewId, onSettingChange)
  }

  return (
    <React.Fragment>
      <SettingSection className="px-4">
        <CollapsablePanel
          role="group"
          level={1}
          type="default"
          wrapperClassName="mt-3"
          label={getI18nMessage('defaultSettings')}
          defaultIsOpen={true}
          disabled={false}
          aria-label={getI18nMessage('defaultSettings')}>
          <SettingRow flow="wrap" label={getI18nMessage('defaultEvent')}>
            <Select
              aria-label={getI18nMessage('defaultEvent')}
              className='w-100'
              size='sm'
              value={defaultEvent.name}
              onChange={(e) => { setDefaultEventChanged(e.target.value) }}>
                {eventLayers.map((element, i) => {
                  return (
                    <option key={i} value={element}>{element}</option>
                  )
                })}
            </Select>
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
      <SettingSection className="px-4">
        <CollapsablePanel
          role="group"
          level={1}
          type="default"
          wrapperClassName="mt-3"
          label={getI18nMessage('displaySettings')}
          defaultIsOpen={true}
          disabled={false}
          aria-label={getI18nMessage('displaySettings')}>
          <SettingRow flow="no-wrap" tag='label' label={getI18nMessage('hideEvent')}>
            <Switch
              checked={hideEvent}
              onChange={setHideEventChange}
            />
          </SettingRow>

          <SettingRow flow="no-wrap" tag='label' label={getI18nMessage('hideNetwork')}>
            <Switch
              checked={hideNetwork}
              onChange={setHideNetworkChange}
            />
          </SettingRow>
          <div style={{ display: 'none' }}>
            <SettingRow tag='label' label="Hide Date">
              <Switch
                checked={hideDate}
                onChange={setHideDateChange}
              />
            </SettingRow>
            {hideDate && (
              <SettingRow tag='label' label="Use Route Start Date">
                <Tooltip title="Route start date will be used for new events. If disabled, the current date will be used.">
                  <Switch
                    checked={useRouteStartDate}
                    onChange={setUseRouteStartDatesChange}
                  />
                </Tooltip>
              </SettingRow>
            )}
          </div>
        </CollapsablePanel>
      </SettingSection>
    </React.Fragment>
  )
}
