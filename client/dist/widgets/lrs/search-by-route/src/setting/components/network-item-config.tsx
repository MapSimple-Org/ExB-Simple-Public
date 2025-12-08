/** @jsx jsx */
import { React, jsx, css, hooks, type IntlShape, Immutable, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { ImmutableArray, ImmutableObject } from 'seamless-immutable'
import { TextInput } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { NetworkItemMethod } from './network-item-method'
import { NetworkItemIdentifier } from './network-item-indentifier'
import { useDataSourceExists } from '../../runtime/data-source/use-data-source-exist'
import type { IMConfig } from '../../config'
import { ResultsSetting } from './network-item-results'
import { NetworkItemSearchMeasures } from './network-item-search-measures'
import { NetworkItemSpatialReference } from './network-item-spatial-reference'
import { NetworkItemSearchRadius } from './network-item-search-radius'
import { NetworkItemFields } from './network-item-fields'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { getConfigValue, lrsDefaultMessages, type LrsLayer, LrsLayerType, ModeType } from 'widgets/shared-code/lrs'

interface Props {
  intl: IntlShape
  widgetId: string
  index: number
  config: IMConfig
  activeMapViewId: string
  onSettingChange: SettingChangeFunction
}

export function NetworkItemConfig (props: Props) {
  const { intl, widgetId, index, config, activeMapViewId, onSettingChange} = props

  const useConfigValue = (key: string, fallback: any) => {
    return React.useMemo(() => {
      return getConfigValue(config, key, activeMapViewId) || fallback
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, activeMapViewId])
  }

  const lrsLayers = useConfigValue('lrsLayers', []) as ImmutableArray<LrsLayer>

  const lrsLayer = React.useMemo(() => {
    return lrsLayers[index]
  }, [lrsLayers, index])

  const networkInfo = React.useMemo(() => {
    return lrsLayer.layerType === LrsLayerType.Network ? lrsLayer.networkInfo : null
  }, [lrsLayer])

  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)
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
    // Updates a single property on the current network.
    let newItem = lrsLayer
    if (value == null) {
      if (newItem.networkInfo) {
        const networkInfo = newItem.networkInfo.without(prop as any)
        newItem = newItem.set('networkInfo', networkInfo)
      }
    } else {
      if (newItem.networkInfo) {
        const networkInfo = newItem.networkInfo.set(prop, value)
        newItem = newItem.set('networkInfo', networkInfo)
      }
    }
    onLayerChanged(index, newItem, dsUpdateRequired)
  }, [onLayerChanged, index, lrsLayer])

  const updateProperties = React.useCallback((props: string[], values: any[], dsUpdateRequired = false) => {
    // Updates multiple properties on the current network.
    if (props.length !== values.length) {
      return
    }

    let newItem = lrsLayer
    props.forEach((prop, index) => {
      if (values[index] == null) {
        if (newItem.networkInfo) {
          const networkInfo = newItem.networkInfo.without(prop as any)
          newItem = newItem.set('networkInfo', networkInfo)
        }
      } else {
        if (newItem.networkInfo) {
          const networkInfo = newItem.networkInfo.set(prop, values[index])
          newItem = newItem.set('networkInfo', networkInfo)
        }
      }
    })

    onLayerChanged(index, newItem, dsUpdateRequired)
  }, [onLayerChanged, index, lrsLayer])

  const handleLabelChange = React.useCallback((e) => {
    setItemLabel(e.target.value)
  }, [])

  const handleLabelAccept = React.useCallback((value) => {
    if (value.trim().length > 0) {
      updateProperty('name', value, true)
    } else {
      setItemLabel(lrsLayer?.name)
    }
  }, [lrsLayer?.name, updateProperty])

  const updateItem = (newItem: ImmutableObject<LrsLayer>, dsUpdateRequired = false) => {
    onLayerChanged(index, newItem, dsUpdateRequired)
  }

  return (
    <div className='h-100'>
      <div css={css`height: 100%; overflow:auto;`}>
        {lrsLayer && (dsExist || config.mode === ModeType.Map) && (
          <React.Fragment>
            <SettingSection role='group' aria-label={getI18nMessage('networkLabel')} title={getI18nMessage('networkLabel')}>
              <SettingRow>
                <TextInput
                  size='sm'
                  type='text'
                  className='w-100'
                  value={itemLabel}
                  onChange={handleLabelChange}
                  onAcceptValue={handleLabelAccept}
                  aria-label={getI18nMessage('networkLabel')}
                  />
              </SettingRow>
            </SettingSection>
            <NetworkItemMethod
              widgetId={widgetId}
              lrsLayer={lrsLayer}
              onPropertyChanged={updateProperty}
              onPropertiesChanged={updateProperties}
            />
            {(networkInfo.useMeasure || networkInfo.useLineAndMeasure) && (
              <NetworkItemSearchMeasures
                lrsLayer={lrsLayer}
                onPropertyChanged={updateProperty}
              />
            )}
            <NetworkItemIdentifier
              widgetId={widgetId}
              lrsLayer={lrsLayer}
              onPropertyChanged={updateProperty}
            />
            {networkInfo.useCoordinate && (
            <NetworkItemSpatialReference
              lrsLayer={lrsLayer}
              onPropertyChanged={updateProperty}
            />
            )}
            {networkInfo.useCoordinate && (
            <NetworkItemSearchRadius
              intl={intl}
              lrsLayer={lrsLayer}
              onPropertyChanged={updateProperty}
            />
            )}
            <ResultsSetting
              lrsLayer={lrsLayer}
              onPropertyChanged={updateProperty}
              onQueryItemChanged={updateItem}
            />
            <NetworkItemFields
              lrsLayer={lrsLayer}
              lrsLayers={lrsLayers}
              onPropertyChanged={updateProperty}
              onPropertiesChanged={updateProperties}/>
          </React.Fragment>
        )}
      </div>
    </div>
  )
}
