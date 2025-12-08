/** @jsx jsx */
import { React, jsx, hooks, type IntlShape } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, Option, Select } from 'jimu-ui'
import defaultMessages from './translations/default'
import { LrsLayerType, SearchMethod, getConfigValue, isDefined, isLineEvent, updateConfig } from 'widgets/shared-code/lrs'
import { type DefaultInfo, type IMConfig, OperationType } from '../config'
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
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  const useConfigValue = (key: string, fallback: any) => {
    return React.useMemo(() => {
      return getConfigValue(config, key, activeMapViewId) || fallback
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, activeMapViewId])
  }

  const lrsLayers = useConfigValue('lrsLayers', [])
  const networkLayers = useConfigValue('networkLayers', [])
  const eventLayers = useConfigValue('eventLayers', [])
  const attributeSets = useConfigValue('attributeSets', { attributeSet: [] })
  const defaultEvent = useConfigValue('defaultEvent', '')
  const defaultNetwork = useConfigValue('defaultNetwork', '')
  const defaultFromMethod = useConfigValue('defaultFromMethod', SearchMethod.Measure)
  const defaultToMethod = useConfigValue('defaultToMethod', SearchMethod.Measure)
  const defaultType = useConfigValue('defaultType', OperationType.single)
  const defaultAttributeSet = useConfigValue('defaultAttributeSet', attributeSets.attributeSet[0]?.title || '')

  const getDefaultEvent = (): string => {
    if (defaultEvent && defaultEvent.index >= 0) {
      const index = defaultEvent.index
      const name = defaultEvent.name
      if (name === lrsLayers[index]?.name) {
        return name
      }
    } else {
      const firstLineLayer = lrsLayers.find((layer) => isLineEvent(layer))
      return firstLineLayer.name
    }
  }

  const getDefaultNetworkConfig = (): string => {
    if (defaultNetwork && defaultNetwork.index !== -1) {
      const index = defaultNetwork.index
      const name = defaultNetwork.name
      if (name === lrsLayers[index]?.name) {
        return name
      }
    } else {
      const firstNetworkLayer = lrsLayers.find((layer) => layer.layerType === LrsLayerType.Network)
      return firstNetworkLayer.name
    }
  }

  const handleDefaultEventChanged = (value: string) => {
    let index = -1
    if (value.length > 0 && lrsLayers.length > 0) {
      index = lrsLayers.findIndex((layer) => layer.name === value)
    }

    const newDefault: DefaultInfo = {
      index: index,
      name: index >= 0 ? lrsLayers[index].name : ''
    }
    updateConfig(widgetId, config, 'defaultEvent', newDefault, activeMapViewId, onSettingChange)
  }

  const handleDefaultNetworkChanged = (value: string) => {
    let index = -1
    if (value.length > 0 && lrsLayers.length > 0) {
      index = lrsLayers.findIndex((layer) => layer.name === value)
    }

    const newDefault: DefaultInfo = {
      index: index,
      name: lrsLayers[index]?.name
    }
    updateConfig(widgetId, config, 'defaultNetwork', newDefault, activeMapViewId, onSettingChange)
  }

  const handleDefaultFromMethodChanged = (value: SearchMethod) => {
    updateConfig(widgetId, config, 'defaultNetwork', value, activeMapViewId, onSettingChange)
  }

  const handleDefaultToMethodChanged = (value: SearchMethod) => {
    updateConfig(widgetId, config, 'defaultNetwork', value, activeMapViewId, onSettingChange)
  }

  const handleDefaultTypeChanged = (value: string) => {
    updateConfig(widgetId, config, 'defaultType', value, activeMapViewId, onSettingChange)
  }

  const handleDefaultAttributeSetChanged = (value: string) => {
    updateConfig(widgetId, config, 'defaultAttributeSet', value, activeMapViewId, onSettingChange)
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
          aria-label={getI18nMessage('defaultSettings')}
        >
          <SettingRow flow="wrap" label={getI18nMessage('defaultEventSingle')}>
            <Select
              aria-label={getI18nMessage('defaultEventSingle')}
              className="w-100"
              size="sm"
              value={getDefaultEvent()}
              onChange={(e) => {
                handleDefaultEventChanged(e.target.value)
              }}
            >
              {eventLayers.map((element, i) => {
                return (
                  <option key={i} value={element}>
                    {element}
                  </option>
                )
              })}
            </Select>
          </SettingRow>
          <SettingRow flow="wrap" label={getI18nMessage('defaultNetworkMultiple')}>
            <Select
              aria-label={getI18nMessage('defaultNetworkMultiple')}
              className="w-100"
              size="sm"
              value={getDefaultNetworkConfig()}
              onChange={(e) => {
                handleDefaultNetworkChanged(e.target.value)
              }}
            >
              {networkLayers.map((element, i) => {
                return (
                  <option key={i} value={element}>
                    {element}
                  </option>
                )
              })}
            </Select>
          </SettingRow>
          <SettingRow flow="wrap" label={getI18nMessage('defaultFromMethod')}>
            <Select
              aria-label={getI18nMessage('defaultFromMethod')}
              className="w-100"
              size="sm"
              value={defaultFromMethod}
              onChange={(e) => {
                handleDefaultFromMethodChanged(e.target.value)
              }}
            >
              {<option value={SearchMethod.Measure}>{getI18nMessage('methodMeasure')}</option>}
              {/* {
              <option value={SearchMethod.Coordinate}>
                {getI18nMessage('methodCoordinate')}
              </option>
            }
            {
              <option value={SearchMethod.LocationOffset}>
                {getI18nMessage('methodLocationOffset')}
              </option>
            } */}
            </Select>
          </SettingRow>
          <SettingRow flow="wrap" label={getI18nMessage('defaultToMethod')}>
            <Select
              aria-label={getI18nMessage('defaultToMethod')}
              className="w-100"
              size="sm"
              value={defaultToMethod}
              onChange={(e) => {
                handleDefaultToMethodChanged(e.target.value)
              }}
            >
              {<option value={SearchMethod.Measure}>{getI18nMessage('methodMeasure')}</option>}
              {/* {
              <option value={SearchMethod.Coordinate}>
                {getI18nMessage('methodCoordinate')}
              </option>
            }
            {
              <option value={SearchMethod.LocationOffset}>
                {getI18nMessage('methodLocationOffset')}
              </option>
            } */}
            </Select>
          </SettingRow>
          <SettingRow flow="wrap" label={getI18nMessage('defaultType')}>
            <Select
              aria-label={getI18nMessage('defaultType')}
              className="w-100"
              size="sm"
              value={defaultType}
              onChange={(e) => {
                handleDefaultTypeChanged(e.target.value)
              }}
            >
              {<option value={OperationType.single}>{getI18nMessage('operationTypeSingle')}</option>}
              {<option value={OperationType.multiple}>{getI18nMessage('operationTypeMultiple')}</option>}
            </Select>
          </SettingRow>
          {isDefined(attributeSets) && isDefined(attributeSets.attributeSet) && (
            <SettingRow flow="wrap" label={getI18nMessage('defaultAttributeSet')}>
              <Select
                aria-label={getI18nMessage('defaultAttributeSet')}
                className="w-100"
                size="sm"
                value={defaultAttributeSet}
                onChange={(e) => {
                  handleDefaultAttributeSetChanged(e.target.value)
                }}
              >
                {attributeSets.attributeSet.map((element, index) => {
                  return (
                    <Option key={index} value={element.title}>
                      {element.title}
                    </Option>
                  )
                })}
              </Select>
            </SettingRow>
          )}
        </CollapsablePanel>
      </SettingSection>
    </React.Fragment>
  )
}
