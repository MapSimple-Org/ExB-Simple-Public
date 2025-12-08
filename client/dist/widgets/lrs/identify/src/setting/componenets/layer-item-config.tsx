/** @jsx jsx */
import { React, jsx, css, hooks, type ImmutableArray, Immutable, type ImmutableObject } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Checkbox, Switch, TextInput } from 'jimu-ui'
import { useDataSourceExists } from '../../runtime/data-source/use-data-source-exist'
import { List, type TreeItemsType, type TreeItemType } from 'jimu-ui/basic/list-tree'
import defaultMessages from './../translations/default'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { advancedActionMap, type AttributeFieldSettings, getConfigValue, type LrsLayer, LrsLayerType, ModeType } from 'widgets/shared-code/lrs'
import type { IMConfig } from '../../config'

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

  const lrsLayers = useConfigValue('lrsLayers', []) as ImmutableArray<LrsLayer>
  const lrsLayer = lrsLayers[index] as ImmutableObject<LrsLayer>

  const [itemLabel, setItemLabel] = React.useState(lrsLayer?.name)
  const dsExist = useDataSourceExists({ widgetId, useDataSourceId: lrsLayer?.useDataSource?.dataSourceId })
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  React.useEffect(() => {
    // Update if label has changed.
    if (lrsLayer?.name && itemLabel !== lrsLayer?.name) {
      setItemLabel(lrsLayer?.name)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lrsLayer?.name])

  const onLayerChanged = React.useCallback(
    (index: number, updatedLayerItems, dsUpdateRequired = false) => {
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
    },
    [lrsLayers, config, activeMapViewId, onSettingChange, widgetId]
  )

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

  const updateEventInfoProperty = React.useCallback((prop: string, value: any, dsUpdateRequired = false) => {
    const eventInfo = lrsLayer.eventInfo
    const newEventInfo = eventInfo.set(prop, value)
    const newItem = lrsLayer.set('eventInfo', newEventInfo)
    onLayerChanged(index, newItem, dsUpdateRequired)
  }, [onLayerChanged, index, lrsLayer])

  const updateNetworkInfoProperty = React.useCallback((prop: string, value: any, dsUpdateRequired = false) => {
    const networkInfo = lrsLayer.networkInfo
    const newNetworkInfo = networkInfo.set(prop, value)
    const newItem = lrsLayer.set('networkInfo', newNetworkInfo)
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

  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    updateProperty('useFieldAlias', checked, false)
    if (lrsLayer.layerType === LrsLayerType.Network) {
      updateNetworkInfoProperty('useFieldAlias', checked)
    }
  }

  const getCheckedState = (index: number) => {
    if (lrsLayer.layerType === LrsLayerType.Network) return lrsLayer.networkInfo.attributeFields[index].enabled
    else if (lrsLayer.layerType === LrsLayerType.Event) return lrsLayer.eventInfo.attributeFields[index].enabled
  }

  const setCheckState = (index: number) => {
    if (lrsLayer.layerType === LrsLayerType.Event) {
      const updatedFields = lrsLayer.eventInfo.attributeFields.asMutable({ deep: true })
      updatedFields[index].enabled = !updatedFields[index].enabled
      updateEventInfoProperty('attributeFields', updatedFields, true)
    } else if (lrsLayer.layerType === LrsLayerType.Network) {
      const updatedFields = lrsLayer.networkInfo.attributeFields.asMutable({ deep: true })
      updatedFields[index].enabled = !updatedFields[index].enabled
      updateNetworkInfoProperty('attributeFields', updatedFields, true)
    }
  }

  const onOrderChanged = (updatedFields: AttributeFieldSettings[]) => {
    if (lrsLayer.layerType === LrsLayerType.Event) {
      updateEventInfoProperty('attributeFields', updatedFields, true)
    } else if (lrsLayer.layerType === LrsLayerType.Network) {
      updateNetworkInfoProperty('attributeFields', updatedFields, true)
    }
  }

  const renderLayerConfig = () => {
    return (
      <div css={css`height: 100%; overflow:auto;`}>
        {lrsLayer && (dsExist || config.mode === ModeType.Map) && (
        <React.Fragment>
          <SettingSection role='group'
          >
            {/* networkLabel === Label */}
            <SettingRow flow='wrap' label={getI18nMessage('networkLabel')}>
              <TextInput
                aria-label={getI18nMessage('networkLabel')}
                size='sm'
                type='text'
                className='w-100'
                value={itemLabel}
                onChange={handleLabelChange}
                onAcceptValue={handleLabelAccept}
                />
            </SettingRow>
            </SettingSection>
          </React.Fragment>
        )}
      </div>
    )
  }

  const renderNetworkLayerConfig = () => {
    return (
      <div css={css`height: 100%; overflow:auto;`}>
        {lrsLayer && (dsExist || config.mode === ModeType.Map) && (
        <React.Fragment>
          <SettingSection role='group'
          >
            <SettingRow flow='wrap' label={getI18nMessage('networkLabel')}>
              <TextInput
                aria-label={getI18nMessage('networkLabel')}
                size='sm'
                type='text'
                className='w-100'
                value={itemLabel}
                onChange={handleLabelChange}
                onAcceptValue={handleLabelAccept}
                />
            </SettingRow>
            <SettingRow flow="no-wrap" tag='label' label={getI18nMessage('useFieldAlias')}>
              <Switch
                checked={lrsLayer.networkInfo?.useFieldAlias}
                onChange={handleAliasChange}
                />
            </SettingRow>
            </SettingSection>
              <SettingSection role='group'>
                <SettingRow flow="wrap" label={getI18nMessage('configureFields')} >
                  <List
                    className='list-routeid-fields pt-2 w-100'
                    itemsJson={Array.from(lrsLayer.networkInfo.attributeFields).map(
                      (item, index) => ({
                        itemStateDetailContent: item,
                        itemKey: `${index}`,
                        itemStateChecked: getCheckedState(index),
                        itemStateTitle: lrsLayer.useFieldAlias ? item.field.alias : item.field.name
                      })
                    )}
                    renderOverrideItemDetailToggle={((actionData, refComponent) => {
                      const { itemJsons, itemJsons: [{ itemStateDetailVisible, itemStateDetailContent }] } = refComponent.props
                      const [currentItemJson] = itemJsons
                      const index = +currentItemJson.itemKey

                      return (
                        itemStateDetailContent
                          ? <Checkbox
                                  aria-expanded={!!itemStateDetailVisible}
                                  className='jimu-tree-item__detail-toggle mr-2'
                                  checked={lrsLayer.networkInfo.attributeFields[index].enabled}
                                  onClick={(evt) => { setCheckState(index) }}
                                />
                          : null
                      )
                    })}
                    dndEnabled
                    onUpdateItem={(actionData, refComponent) => {
                      const { itemJsons } = refComponent.props
                      const [, parentItemJson] = itemJsons as [
                        TreeItemType,
                        TreeItemsType
                      ]
                      onOrderChanged(
                        parentItemJson.map((i) => i.itemStateDetailContent)
                      )
                    }}
                    onClickItemBody={(actionData, refComponent) => {
                      const { itemJsons: [currentItemJson] } = refComponent.props
                      setCheckState(+currentItemJson.itemKey)
                    }}
                    {...advancedActionMap}
                  />
                </SettingRow>
              </SettingSection>
          </React.Fragment>
        )}
      </div>
    )
  }

  if (lrsLayer.layerType === LrsLayerType.Network) {
    return (
      <div className='h-100'>
        {renderNetworkLayerConfig()}
      </div>
    )
  } else {
    return (
      <div className='h-100'>
        {renderLayerConfig()}
      </div>
    )
  }
}
