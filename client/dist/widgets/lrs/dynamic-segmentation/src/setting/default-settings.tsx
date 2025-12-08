/** @jsx jsx */
import { React, jsx, hooks, type IntlShape, Immutable } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, NumericInput, Option, Select, Switch } from 'jimu-ui'
import defaultMessages from './translations/default'
import { type AttributeSets, getConfigValue, getDefaultAttributeSet, isDefined, type LrsLayer, LrsLayerType, updateConfig } from 'widgets/shared-code/lrs'
import { AttributeInputType, DisplayType, type IMConfig } from '../config'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { ColorPicker } from 'jimu-ui/basic/color-picker'

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
      const value = getConfigValue(config, key, activeMapViewId)
      return value !== undefined ? value : fallback
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, activeMapViewId])
  }

  const lrsLayers = useConfigValue('lrsLayers', [])
  const defaultNetwork = useConfigValue('defaultNetwork', '')
  const defaultDisplayType = useConfigValue('defaultDisplayType', DisplayType.Table)
  const attributeInputType = useConfigValue('attributeInputType', AttributeInputType.LineOnly)
  const attributeSets = useConfigValue('attributeSets', { attributeSet: [] }) as AttributeSets
  const defaultPointAttributeSet = useConfigValue('defaultPointAttributeSet', '')
  const defaultLineAttributeSet = useConfigValue('defaultLineAttributeSet', '')
  const mapHighlightColor = useConfigValue('mapHighlightColor', '#65adff')
  const tableHighlightColor = useConfigValue('tableHighlightColor', '#65adff')
  const defaultDiagramScale = useConfigValue('defaultDiagramScale', 3)
  const allowMerge = useConfigValue('allowMerge', false)
  const allowEditing = useConfigValue('allowEditing', true)
  const showEventStatistics = useConfigValue('showEventStatistics', false)

  const lineAttributes = attributeSets?.attributeSet?.filter((set) => !set.isPoint )
  const pointAttributes = attributeSets?.attributeSet?.filter((set) => set.isPoint )

  const getDefaultPointOrLineAttributeSet = (isPoint: boolean): string =>{
    if (isPoint) {
      return getDefaultAttributeSet(Immutable(attributeSets), defaultPointAttributeSet, isPoint)
    } else {
      return getDefaultAttributeSet(Immutable(attributeSets), defaultLineAttributeSet, isPoint)
    }
  }

  const setDisplayType = (value: DisplayType) => {
    updateConfig(widgetId, config, 'defaultDisplayType', value, activeMapViewId, onSettingChange)
  }

  const setAttributeInputType = (value: AttributeInputType) => {
    updateConfig(widgetId, config, 'attributeInputType', value, activeMapViewId, onSettingChange)
  }

  const setDefaultAttributeSet = (value: string, isPoint: boolean) => {
    if (isPoint) {
      updateConfig(widgetId, config, 'defaultPointAttributeSet', value, activeMapViewId, onSettingChange)
    } else {
      updateConfig(widgetId, config, 'defaultLineAttributeSet', value, activeMapViewId, onSettingChange)
    }
  }

  const setTableHighlight = (value: string) => {
    updateConfig(widgetId, config, 'tableHighlightColor', value, activeMapViewId, onSettingChange)
  }

  const setAllowMerge = (e) => {
    updateConfig(widgetId, config, 'allowMerge', e.target.checked, activeMapViewId, onSettingChange)
  }

  const setAllowEditing = (e) => {
    updateConfig(widgetId, config, 'allowEditing', e.target.checked, activeMapViewId, onSettingChange)
  }

  const setMapHighlightColor = (value: string) => {
    updateConfig(widgetId, config, 'mapHighlightColor', value, activeMapViewId, onSettingChange)
  }

  const setDefaultScale = (value: number) => {
    // default value to 1 for invalid inputs
    if (value === null || value === undefined || value <= 0) {
      value = 1
    }
    updateConfig(widgetId, config, 'defaultDiagramScale', value, activeMapViewId, onSettingChange)
  }

  const setShowStatistics = (value: boolean) => {
    updateConfig(widgetId, config, 'showEventStatistics', value, activeMapViewId, onSettingChange)
  }

  const getNetworkLayers = React.useMemo((): LrsLayer[] => {
    return lrsLayers.filter(layer => layer.layerType === LrsLayerType.Network)
  }, [lrsLayers])

  const setDefaultNetwork = (value: string) => {
    updateConfig(widgetId, config, 'defaultNetwork', value, activeMapViewId, onSettingChange)
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
          <SettingRow flow="wrap" label={getI18nMessage('defaultDynSegResult')}>
            <Select
              aria-label={getI18nMessage('defaultDynSegResult')}
              className='w-100'
              size='sm'
              value={defaultDisplayType}
              onChange={(e) => { setDisplayType(e.target.value) }}>
                <Option value={DisplayType.Table}>{getI18nMessage('tableLabel')}</Option>
                <Option value={DisplayType.Diagram}>{getI18nMessage('diagramLabel')}</Option>
            </Select>
          </SettingRow>

          <SettingRow flow="wrap" label={getI18nMessage('defaultNetworkLabel')}>
            <Select
              aria-label={getI18nMessage('defaultNetworkLabel')}
              className='w-100'
              size='sm'
              value={defaultNetwork}
              onChange={(e) => { setDefaultNetwork(e.target.value) }}>
                {getNetworkLayers.map((network) => (
                  <Option key={network.id} value={network.name}>{network.name}</Option>
                ))}
            </Select>
          </SettingRow>

          <SettingRow flow="wrap" label={getI18nMessage('defaultAttributeSetType')}>
            <Select
              aria-label={getI18nMessage('defaultAttributeSetType')}
              className='w-100'
              size='sm'
              value={attributeInputType}
              onChange={(e) => { setAttributeInputType(e.target.value) }}>
                <Option value={AttributeInputType.LineOnly}>{getI18nMessage('lineOnlyLabel')}</Option>
                <Option value={AttributeInputType.LineAndPoint}>{getI18nMessage('lineAndPointLabel')}</Option>
            </Select>
          </SettingRow>

          {isDefined(lineAttributes) && lineAttributes.length > 0 && (
            <SettingRow flow="wrap" label={getI18nMessage('lineAttributeSet')}>
              <Select
                aria-label={getI18nMessage('lineAttributeSet')}
                className='w-100'
                size='sm'
                value={getDefaultPointOrLineAttributeSet(false)}
                onChange={(e) => { setDefaultAttributeSet(e.target.value, false) }}>
                  {lineAttributes.map((element, index) => {
                    return (
                      <Option key={index} value={element.title}>{element.title}</Option>
                    )
                  })}
              </Select>
            </SettingRow>
          )}
          {attributeInputType === AttributeInputType.LineAndPoint &&
            isDefined(pointAttributes) && pointAttributes.length > 0 && (
            <SettingRow flow="wrap" label={getI18nMessage('pointAttributeSet')}>
              <Select
                aria-label={getI18nMessage('pointAttributeSet')}
                className='w-100'
                size='sm'
                value={getDefaultPointOrLineAttributeSet(true)}
                onChange={(e) => { setDefaultAttributeSet(e.target.value, true) }}>
                  {pointAttributes.map((element, index) => {
                    return (
                      <Option key={index} value={element.title}>{element.title}</Option>
                    )
                  })}
              </Select>
            </SettingRow>
          )}
          <SettingRow tag='label' label={getI18nMessage('allowEditing')}>
            <Switch
              checked={allowEditing}
              onChange={setAllowEditing}
              title={getI18nMessage('allowEditing')} />
          </SettingRow>
          {isDefined(lineAttributes) && lineAttributes.length > 0 && (
            <SettingRow tag='label' label={getI18nMessage('mergeEvents')}>
              <Switch checked={allowMerge}
                onChange={setAllowMerge}
                title={getI18nMessage('mergeEvents')} />
            </SettingRow>
          )}
          <SettingRow label={getI18nMessage('tableHighlightColor')}>
            <ColorPicker
              color={tableHighlightColor}
              value={tableHighlightColor}
              onChange={setTableHighlight}
              aria-label={getI18nMessage('tableHighlightColor')}
            />
          </SettingRow>

          <SettingRow label={getI18nMessage('mapHighlightColor')}>
            <ColorPicker
              color={mapHighlightColor}
              value={mapHighlightColor}
              onChange={setMapHighlightColor}
              aria-label={getI18nMessage('mapHighlightColor')}
            />
          </SettingRow>

          <SettingRow flow="wrap" label={getI18nMessage('diagramScale')}>
            <NumericInput
              className='w-100'
              min={1}
              value={defaultDiagramScale}
              defaultValue={defaultDiagramScale}
              onChange={setDefaultScale}
              aria-label={getI18nMessage('diagramScale')}
            />
          </SettingRow>
          <SettingRow flow="no-wrap" tag='label' label={getI18nMessage('showStatistics')}>
            <Switch
              checked={showEventStatistics}
              onChange={(e) => { setShowStatistics(e.target.checked) }}
            />
          </SettingRow>
        </CollapsablePanel>
      </SettingSection>
    </React.Fragment>
  )
}
