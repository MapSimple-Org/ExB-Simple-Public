/** @jsx jsx */
import { React, jsx, css, type ImmutableObject, hooks, type ImmutableArray, Immutable } from 'jimu-core'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { Option, Select } from 'jimu-ui'
import defaultMessages from './translations/default'
import { useDataSourceExists } from '../common/use-data-source-exist'
import { type AttributeSets, getConfigValue, isDefined, type LrsLayer, LrsLayerType, ModeType } from 'widgets/shared-code/lrs'
import type { IMConfig } from '../config'
import type { SettingChangeFunction } from 'jimu-for-builder'

interface Props {
  widgetId: string
  index: number
  config: IMConfig
  activeMapViewId: string
  onSettingChange: SettingChangeFunction
}

export function LayerConfig (props: Props) {
  const { widgetId, index, config, activeMapViewId, onSettingChange } = props

  const useConfigValue = (key: string, fallback: any) => {
    return React.useMemo(() => {
      return getConfigValue(config, key, activeMapViewId) || fallback
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, activeMapViewId])
  }

  const lrsLayers = useConfigValue('lrsLayers', [])
  const lrsLayer = lrsLayers[index] as ImmutableObject<LrsLayer>
  const isNetwork = React.useMemo(() => lrsLayer?.layerType === LrsLayerType.Network, [lrsLayer])
  const isEvent = React.useMemo(() => lrsLayer?.layerType === LrsLayerType.Event, [lrsLayer])

  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const [itemLabel, setItemLabel] = React.useState(lrsLayer?.name)
  const dsExist: boolean = useDataSourceExists({ widgetId, useDataSourceId: lrsLayer?.useDataSource?.dataSourceId })

  React.useEffect(() => {
    // Update if label has changed.
    if (lrsLayer?.name && itemLabel !== lrsLayer?.name) {
      setItemLabel(lrsLayer?.name)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lrsLayer?.name])

  const onLayerChanged = React.useCallback((index: number, updatedLayerItems, dsUpdateRequired = false) => {
    let layers: ImmutableArray<LrsLayer> = lrsLayers ?? Immutable([])
    layers = Immutable.set(layers, index, updatedLayerItems)

    // Update widget json
    if (config.mode === ModeType.Map) {
      const mapViewId = activeMapViewId
      const mapViewConfig = config.mapViewsConfig?.[mapViewId]
      const updatedMapViewsConfig = mapViewConfig.set('lrsLayers', layers)
      const updatedConfig = config.setIn(['mapViewsConfig', mapViewId], updatedMapViewsConfig)
      onSettingChange({
        id: widgetId,
        config: updatedConfig,
      })
    } else {
      onSettingChange({
        id: widgetId,
        config: config.set('lrsLayers', layers),
      })
    }
  }, [lrsLayers, config, activeMapViewId, onSettingChange, widgetId])

  const updateProperty = React.useCallback((prop: string, value: any, dsUpdateRequired = false) => {
    // Updates a single property on the current layer.
    let newItem
    if (value == null) {
      newItem = lrsLayer.without(prop as any)
    } else {
      newItem = lrsLayer.set(prop, value)
    }
    onLayerChanged(index, newItem, dsUpdateRequired)
  }, [onLayerChanged, index, lrsLayer])

  const getAttributeFields = (): string[] => {
    const selectedAttributeSet = lrsLayer.eventInfo?.isPointEvent ?
      getConfigValue(config, 'defaultPointAttributeSet',activeMapViewId, '') :
      getConfigValue(config, 'defaultLineAttributeSet',activeMapViewId, '')
    const attributeSets = getConfigValue(config, 'attributeSets', activeMapViewId, {}) as AttributeSets
    const attributeSet = attributeSets.attributeSet.find((element) => element.title === selectedAttributeSet)
    const attributeSetLayer = attributeSet?.layers.find(l => l.layerId === lrsLayer.serviceId)
    if (!attributeSetLayer) {
      return [lrsLayer.eventInfo.eventIdFieldName]
    }
    const fieldMap = attributeSetLayer.fields.map(f => f.name)
    const fieldMapWithEventId = [...fieldMap, lrsLayer.eventInfo.eventIdFieldName]
    return fieldMapWithEventId
  }

  const setDisplayField = (evt: any, value?: string | number) => {
    updateProperty('displayField', value)
  }

  const getDisplayField = () => {
    const fields = getAttributeFields()
    if (fields.includes(lrsLayer?.displayField)) {
      return lrsLayer?.displayField
    } else {
      setDisplayField(null, fields[0])
      return fields[0]
    }
  }

  const getRouteIdentifiers = () => {
    const identifiers = [lrsLayer?.networkInfo?.routeIdFieldSchema.alias]
    if (lrsLayer?.networkInfo?.routeNameFieldSchema?.alias) {
      identifiers.push(lrsLayer?.networkInfo?.routeNameFieldSchema.alias)
    }
    return identifiers
  }

  const getRouteIdentifier = () => {
    const useRouteName = lrsLayer?.networkInfo?.useRouteName && isDefined(lrsLayer?.networkInfo?.routeNameFieldSchema)
    return useRouteName ? lrsLayer?.networkInfo?.routeNameFieldSchema.alias : lrsLayer?.networkInfo?.routeIdFieldSchema.alias
  }

  const setIdentifier = (evt: any, value?: string | number) => {
    if (value === lrsLayer?.networkInfo?.routeIdFieldSchema.alias) {
      const updatedNetworkInfo = lrsLayer.networkInfo.set('useRouteName', false).set('useRouteId', true)
      updateProperty('networkInfo', updatedNetworkInfo)
    } else {
      const updatedNetworkInfo = lrsLayer.networkInfo.set('useRouteName', true).set('useRouteId', false)
      updateProperty('networkInfo', updatedNetworkInfo)
    }
  }

  const renderOptions = (options: string[]) =>
    options.map((element, index) => (
      <Option key={index} value={element}>{element}</Option>
  ))

  return (
    <div className='h-100'>
      <div css={css`height: 100%; overflow:auto;`}>
        {lrsLayer && (dsExist || config.mode === ModeType.Map) && isEvent && (
          <SettingSection role='group' aria-label={getI18nMessage('eventLabel')} title={getI18nMessage('eventLabel')}>
            {lrsLayer.name}
            <SettingRow flow="wrap" label={getI18nMessage('displayFieldLabel')}>
              <Select
                aria-label={getI18nMessage('displayFieldLabel')}
                className='w-100'
                size='sm'
                value={getDisplayField()}
                onChange={setDisplayField}>
                  {renderOptions(getAttributeFields())}
              </Select>
            </SettingRow>
          </SettingSection>
        )}
        {lrsLayer && (dsExist || config.mode === ModeType.Map) && isNetwork && (
          <SettingSection role='group' aria-label={getI18nMessage('networkLabel')} title={getI18nMessage('networkLabel')}>
            {lrsLayer.name}
            <SettingRow flow="wrap" label={getI18nMessage('routeIdentifierLabel')}>
              <Select
                aria-label={getI18nMessage('routeIdentifierLabel')}
                className='w-100'
                size='sm'
                value={getRouteIdentifier()}
                disabled={!getRouteIdentifiers().length || getRouteIdentifiers().length === 1}
                onChange={setIdentifier}>
                  {renderOptions(getRouteIdentifiers())}
              </Select>
            </SettingRow>
          </SettingSection>
        )}
        </div>
    </div>
  )
}
