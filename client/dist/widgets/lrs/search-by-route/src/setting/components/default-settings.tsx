/** @jsx jsx */
import { React, jsx, hooks, type IntlShape, type ImmutableArray, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, NumericInput, Select, Switch } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { colorBlack, colorCyan, getConfigValue, GetEsriUnits, lrsDefaultMessages, type LrsLayer, LrsLayerType, updateConfig } from 'widgets/shared-code/lrs'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { ColorPicker } from 'jimu-ui/basic/color-picker'
import { Fragment } from 'react'
import type { IMConfig, ResultConfig, Style } from '../../config'

interface Props {
  intl: IntlShape
  widgetId: string
  config: IMConfig
  activeMapViewId: string
  onSettingChange: SettingChangeFunction
}

export function DefaultSettings(props: Props) {
  const { intl, widgetId, config, activeMapViewId, onSettingChange } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)

  const useConfigValue = (key: string, fallback: any) => {
    return React.useMemo(() => {
      return getConfigValue(config, key, activeMapViewId) || fallback
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, activeMapViewId])
  }

  const units: string[] = [
    getI18nMessage('inches'),
    getI18nMessage('points'),
    getI18nMessage('feet'),
    getI18nMessage('yards'),
    getI18nMessage('miles'),
    getI18nMessage('nauticalMiles'),
    getI18nMessage('millimeters'),
    getI18nMessage('centimeters'),
    getI18nMessage('meters'),
    getI18nMessage('kilometers'),
    getI18nMessage('decimalDegrees'),
    getI18nMessage('decimeters'),
    getI18nMessage('intFeet'),
    getI18nMessage('intMiles')
  ]

  const getUnit = (unit?: string) => {
    if (unit) {
      return GetEsriUnits(units[unit], intl)
    }
    return GetEsriUnits(units[0], intl)
  }

  const lrsLayers = useConfigValue('lrsLayers', []) as ImmutableArray<LrsLayer>
  const highlightStyle = useConfigValue('highlightStyle', { color: colorCyan, size: 3}) as Style
  const labelStyle = useConfigValue('labelStyle', { color: colorBlack, size: 12}) as Style
  const resultConfig = useConfigValue('resultConfig', { pageSize: 25, defaultReferentLayer: null, defaultOffsetUnit: getUnit() }) as ResultConfig
  const defaultNetwork = useConfigValue('defaultNetwork', '')
  const hideMethod = useConfigValue('hideMethod', false)
  const hideNetwork = useConfigValue('hideNetwork', false)
  const hideRoute = useConfigValue('hideRoute', false)

  const supportsLines = lrsLayers.some(layer =>
    layer.name === defaultNetwork &&
    layer.layerType === LrsLayerType.Network &&
    layer.networkInfo.supportsLines
  )

  const setHighlightColor = (value: string) => {
    const newStyle = {...highlightStyle, color: value}
    updateConfig(widgetId, config, 'highlightStyle', newStyle, activeMapViewId, onSettingChange)
  }

  const setHighlightSize = (value: number) => {
    const newStyle = {...highlightStyle, size: value}
    updateConfig(widgetId, config, 'highlightStyle', newStyle, activeMapViewId, onSettingChange)
  }

  const setLabelColor = (value: string) => {
    const newStyle = {...labelStyle, color: value}
    updateConfig(widgetId, config, 'labelStyle', newStyle, activeMapViewId, onSettingChange)
  }

  const setLabelSize = (value: number) => {
    const newStyle = {...labelStyle, size: value}
    updateConfig(widgetId, config, 'labelStyle', newStyle, activeMapViewId, onSettingChange)
  }

  const setDefaultOffsetUnitChange = (event) => {
    const offsetUnit = event?.target?.value
    const newResults = {...resultConfig, defaultOffsetUnit: offsetUnit}
    updateConfig(widgetId, config, 'resultConfig', newResults, activeMapViewId, onSettingChange)
  }

  const setDefaultNetwork = (value: string) => {
    updateConfig(widgetId, config, 'defaultNetwork', value, activeMapViewId, onSettingChange)
  }

  const setDefaultReferentChange = (event) => {
    const referentItemLayerId = event?.target?.value
    const referentItem = lrsLayers.find((item) => item.id === referentItemLayerId)
    const newResults = {...resultConfig, defaultReferentLayer: referentItem}
    updateConfig(widgetId, config, 'resultConfig', newResults, activeMapViewId, onSettingChange)
  }

  const setPageSize = (value: number) => {
    const newResults = {...resultConfig, pageSize: value}
    updateConfig(widgetId, config, 'resultConfig', newResults, activeMapViewId, onSettingChange)
  }

  const setHideMethod = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideMethod', checked, activeMapViewId, onSettingChange)
  }

  const setHideNetwork = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideNetwork', checked, activeMapViewId, onSettingChange)
  }

  const setHideRouteSearchByLine = (e: any, checked: boolean) => {
    updateConfig(widgetId, config, 'hideRoute', checked, activeMapViewId, onSettingChange)
  }

  return (
    <React.Fragment>
      <SettingSection className="px-4">
        <CollapsablePanel
          role="group"
          level={1}
          type="default"
          wrapperClassName="mt-3"
          label={getI18nMessage('selectionSettings')}
          defaultIsOpen={true}
          disabled={false}
          aria-label={getI18nMessage('selectionSettings')}>
          <SettingRow label={getI18nMessage('selectionHighlight')}>
            <ColorPicker
              color={highlightStyle.color}
              value={highlightStyle.color}
              onChange={setHighlightColor}
              aria-label={getI18nMessage('selectionHighlight')}
            />
          </SettingRow>
          <SettingRow flow="wrap" label={getI18nMessage('graphicWidth')}>
            <NumericInput
              size="sm"
              value={highlightStyle.size}
              precision={1}
              min={0}
              max={15}
              step={0.1}
              onChange={setHighlightSize}
              aria-label={getI18nMessage('graphicWidth')}
              className="w-100"
            />
          </SettingRow>
          <SettingRow label={getI18nMessage('labelColor')}>
            <ColorPicker
              color={props.config.labelStyle.color ? props.config.labelStyle.color : colorBlack}
              value={labelStyle.color}
              onChange={setLabelColor}
              aria-label={getI18nMessage('labelColor')}
            />
          </SettingRow>
          <SettingRow flow="wrap" label={getI18nMessage('labelSize')}>
            <NumericInput
              size="sm"
              value={labelStyle.size}
              precision={1}
              min={0}
              max={30}
              step={0.1}
              onChange={setLabelSize}
              aria-label={getI18nMessage('labelSize')}
              className="w-100"
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
      <SettingSection className="px-4">
        <CollapsablePanel
          role="group"
          level={1}
          type="default"
          wrapperClassName="mt-3"
          label={getI18nMessage('resultSettings')}
          defaultIsOpen={true}
          disabled={false}
          aria-label={getI18nMessage('resultSettings')}>
          <SettingRow flow="wrap" label={getI18nMessage('resultsPageSize')}>
            <NumericInput
              size="sm"
              value={resultConfig.pageSize || 25}
              precision={0}
              min={5}
              max={500}
              onChange={setPageSize}
              aria-label={getI18nMessage('resultsPageSize')}
              className="w-100"
            />
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
          <SettingRow tag='label' label={getI18nMessage('hideMethod')}>
            <Switch
              checked={hideMethod}
              onChange={setHideMethod}
            />
          </SettingRow>
          <SettingRow tag='label' label={getI18nMessage('hideNetwork')}>
            <Switch
              checked={hideNetwork}
              onChange={setHideNetwork}
            />
          </SettingRow>
          {supportsLines && (
            <SettingRow tag='label' label={getI18nMessage('hideRoute')}>
              <Switch
                checked={hideRoute}
                onChange={setHideRouteSearchByLine}
              />
            </SettingRow>
          )}
          <SettingRow flow='wrap' label={getI18nMessage('defaultNetwork')}>
            <Select
              aria-label={getI18nMessage('defaultNetwork')}
              className='w-100'
              size='sm'
              value={defaultNetwork}
              disabled={lrsLayers.length === 1}
              onChange={(e) => { setDefaultNetwork(e.target.value) }}
            >
              {lrsLayers.filter(item => !item.isReferent).map((element, i) => {
                return (
                  <option key={i} value={element.name}>{element.name}</option>
                )
              })}
            </Select>
          </SettingRow>
          {lrsLayers && lrsLayers.filter(item => item.isReferent)?.length > 0 && (
            <Fragment>
              <SettingRow flow="wrap" label={getI18nMessage('defaultReferent')}>
                <Select
                    aria-label={getI18nMessage('defaultReferent')}
                    value={resultConfig?.defaultReferentLayer?.id}
                    onChange={setDefaultReferentChange}
                  >
                    {lrsLayers.filter(item => item.isReferent)?.map((item, i) => {
                      return <option key={i} value={item.id}>{item.name}</option>
                    })}
                </Select>
            </SettingRow>
              <SettingRow flow="wrap" label={getI18nMessage('defaultOffsetUnit')}>
                <Select
                    aria-label={getI18nMessage('defaultOffsetUnit')}
                    value={resultConfig.defaultOffsetUnit || getUnit()}
                    onChange={setDefaultOffsetUnitChange}
                  >
                  {units.map((unit, i) => {
                    return <option key={i} value={GetEsriUnits(unit, intl)}>{unit}</option>
                  })}
                </Select>
              </SettingRow>
            </Fragment>
          )}
        </CollapsablePanel>
      </SettingSection>
    </React.Fragment>
  )
}
