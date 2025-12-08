/** @jsx jsx */
import { React, jsx, hooks, type IntlShape, type ImmutableArray, Immutable } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, Select, Switch } from 'jimu-ui'
import defaultMessages from './translations/default'
import { lrsDefaultMessages, type LrsLayer, type DefaultInfo, getConfigValue, updateConfig } from 'widgets/shared-code/lrs'
import type { DisplayConfig, IMConfig } from '../config'
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

  const lrsLayers = useConfigValue('lrsLayers', Immutable([])) as ImmutableArray<LrsLayer>
  const eventLayers = useConfigValue('eventLayers', [])
  const defaultEvent = useConfigValue('defaultEvent', { index: -1, name: '' }) as DefaultInfo
  const displayConfig = useConfigValue('displayConfig', { hideEvent: false }) as DisplayConfig

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

  const setDisplayChange = () => {
    const newDisplay = { ...displayConfig }
    newDisplay.hideEvent = !newDisplay.hideEvent
    updateConfig(widgetId, config, 'displayConfig', newDisplay, activeMapViewId, onSettingChange)
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
                checked={displayConfig.hideEvent}
                onChange={() => { setDisplayChange() }}
              />
            </SettingRow>
        </CollapsablePanel>
      </SettingSection>
    </React.Fragment>
  )
}
