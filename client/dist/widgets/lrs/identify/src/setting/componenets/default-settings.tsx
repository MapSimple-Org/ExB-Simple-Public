/** @jsx jsx */
import { React, jsx, hooks, type IntlShape, type ImmutableArray, Immutable } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, NumericInput, Select, Switch } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { type AttributeSets, type DefaultInfo, getConfigValue, getDefaultAttributeSet, highlightColor, isDefined, type LrsLayer, updateConfig } from 'widgets/shared-code/lrs'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { ColorPicker } from 'jimu-ui/basic/color-picker'
import type { HighlightStyle, IMConfig } from '../../config'

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

  const lrsLayers = useConfigValue('lrsLayers', []) as ImmutableArray<LrsLayer>
  const networkLayers = useConfigValue('networkLayers', [])
  const eventLayers = useConfigValue('eventLayers', [])
  const highlightStyle = useConfigValue('highlightStyle', { routeColor: highlightColor, width: 3 }) as HighlightStyle
  const defaultPointAttributeSet = useConfigValue('defaultPointAttributeSet', '')
  const defaultLineAttributeSet = useConfigValue('defaultLineAttributeSet', '')
  const attributeSets = useConfigValue('attributeSets', { attributeSet: [] }) as AttributeSets
  const lineEventToggle = useConfigValue('lineEventToggle', false)
  const pointEventToggle = useConfigValue('pointEventToggle', false)
  const defaultNetwork = useConfigValue('defaultNetwork', {}) as DefaultInfo

  const lineAttributes = attributeSets?.attributeSet?.filter((set) => !set.isPoint )
  const pointAttributes = attributeSets?.attributeSet?.filter((set) => set.isPoint )

  const getDefaultLineAttributeSet = () => {
    return getDefaultAttributeSet(Immutable({ attributeSet: lineAttributes }), defaultLineAttributeSet, false)
  }

  const getDefaultPointAttributeSet = () => {
    return getDefaultAttributeSet(Immutable({ attributeSet: pointAttributes }), defaultPointAttributeSet, true)

  }

  const setHighlightStyleChange = (prop: string | number) => {
    const newHighlightStyle = { ...highlightStyle }
    if (typeof prop === 'string') {
      newHighlightStyle.routeColor = prop
    }
    if (typeof prop === 'number') {
      newHighlightStyle.width = prop
    }
    updateConfig(widgetId, config, 'highlightStyle', newHighlightStyle, activeMapViewId, onSettingChange)
  }

  const setLineEventToggleChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    updateConfig(widgetId, config, 'lineEventToggle', checked, activeMapViewId, onSettingChange)
  }

  const setPointEventToggleChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    updateConfig(widgetId, config, 'pointEventToggle', checked, activeMapViewId, onSettingChange)
  }

  const setDefaultNetworkChange = (value: string) => {
    let index = -1
    if (value.length > 0 && lrsLayers.length > 0) {
      index = lrsLayers.findIndex((layer) => layer.name === value)
    }

    const newDefault: DefaultInfo = {
      index: index,
      name: index >= 0 ? lrsLayers[index].name : ''
    }
    updateConfig(widgetId, config, 'defaultNetwork', newDefault, activeMapViewId, onSettingChange)
  }

  const setDefaultLineAttributeSetChanged = (value: string) => {
    updateConfig(widgetId, config, 'defaultLineAttributeSet', value, activeMapViewId, onSettingChange)
  }

  const setDefaultPointAttributeSetChanged = (value: string) => {
    updateConfig(widgetId, config, 'defaultPointAttributeSet', value, activeMapViewId, onSettingChange)
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
          <SettingRow
            flow="wrap"
            label={getI18nMessage('defaultNetwork')}
            aria-label={getI18nMessage('defaultNetwork')}>
            <Select
              value={defaultNetwork.name}
              onChange={(e) => { setDefaultNetworkChange(e.target.value) }}
              aria-label={getI18nMessage('defaultNetwork')}>
                {networkLayers?.map((element, i) => {
                return (
                  <option key={i} value={element}>
                    {element}
                  </option>
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
          label={getI18nMessage('selectionSettings')}
          defaultIsOpen={true}
          disabled={false}
          aria-label={getI18nMessage('selectionSettings')}>
          <SettingRow label={getI18nMessage('selectionHighlight')}>
            <ColorPicker
              color={highlightStyle.routeColor}
              value={highlightStyle.routeColor}
              onChange={setHighlightStyleChange}
              aria-label={getI18nMessage('selectionHighlight')}
            />
          </SettingRow>
          <SettingRow flow="wrap" label={getI18nMessage('graphicWidth')}>
            <NumericInput
              size="sm"
              value={highlightStyle.width}
              precision={1}
              min={0}
              max={15}
              step={0.1}
              onChange={setHighlightStyleChange}
              aria-label={getI18nMessage('graphicWidth')}
              className="w-100"
            />
          </SettingRow>
          {eventLayers && (eventLayers?.length > 0) && (
            <React.Fragment>
              <SettingRow flow="no-wrap" tag='label' label={getI18nMessage('lineAttributeToggle')}>
                <Switch
                  checked={lineEventToggle}
                  onChange={setLineEventToggleChange}
                  />
              </SettingRow>
              {lineEventToggle && isDefined(lineAttributes) && (
                <SettingRow flow="wrap" label={getI18nMessage('lineAttributeSet')}>
                  <Select
                    aria-label={getI18nMessage('lineAttributeSet')}
                    size='sm'
                    value={getDefaultLineAttributeSet()}
                    onChange={(e) => { setDefaultLineAttributeSetChanged(e.target.value) }}
                  >
                    {lineAttributes?.map((element, index) => {
                      return (
                        <option key={index} value={element.title}>{element.title}</option>
                      )
                    })}
                  </Select>
                </SettingRow>
              )}
              <SettingRow flow="no-wrap" tag='label' label={getI18nMessage('pointAttributeToggle')}>
                <Switch
                  checked={pointEventToggle}
                  onChange={setPointEventToggleChange}
                  />
              </SettingRow>
              {pointEventToggle && isDefined(pointAttributes) && (
                <SettingRow flow="wrap" label={getI18nMessage('pointAttributeSet')}>
                  <Select
                    aria-label={getI18nMessage('pointAttributeSet')}
                    size='sm'
                    value={getDefaultPointAttributeSet()}
                    onChange={(e) => { setDefaultPointAttributeSetChanged(e.target.value) }}
                  >
                    {pointAttributes?.map((element, index) => {
                      return (
                        <option key={index} value={element.title}>{element.title}</option>
                      )
                    })}
                  </Select>
                </SettingRow>
              )}
            </React.Fragment>
          )}
        </CollapsablePanel>
      </SettingSection>
    </React.Fragment>
  )
}
