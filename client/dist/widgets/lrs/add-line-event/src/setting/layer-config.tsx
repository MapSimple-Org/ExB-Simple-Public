/** @jsx jsx */
import { React, jsx, css, type ImmutableObject, hooks, defaultMessages as jimuUIDefaultMessages, type ImmutableArray, Immutable } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Checkbox, Switch, TextInput } from 'jimu-ui'
import defaultMessages from './translations/default'
import { type LrsLayer, type AttributeFieldSettings, advancedActionMap, lrsDefaultMessages, ModeType, getConfigValue, isLineEvent } from 'widgets/shared-code/lrs'
import { useDataSourceExists } from '../common/use-data-source-exist'
import { type CommandActionDataType, List, type TreeItemsType, type TreeItemType } from 'jimu-ui/basic/list-tree'
import type { IMConfig } from '../config'
import type { SettingChangeFunction } from 'jimu-for-builder'
const IconLock = require('jimu-icons/svg/outlined/editor/lock.svg')
const IconUnlock = require('jimu-icons/svg/outlined/editor/unlock.svg')

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
    // Updates a single property on the current network.
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
  }

  const getCheckedState = (index: number) => {
    return lrsLayer.eventInfo.attributeFields[index].enabled
  }

  const setCheckState = (index: number) => {
    const updatedFields = lrsLayer.eventInfo.attributeFields.asMutable({ deep: true })
    updatedFields[index].enabled = !updatedFields[index].enabled
    updateEventInfoProperty('attributeFields', updatedFields, true)
  }

  const setEditableState = (index: number) => {
    const updatedFields = lrsLayer.eventInfo.attributeFields.asMutable({ deep: true })
    updatedFields[index].editable = !updatedFields[index].editable
    updateEventInfoProperty('attributeFields', updatedFields, true)
  }

  const onOrderChanged = (updatedFields: AttributeFieldSettings[]) => {
    updateEventInfoProperty('attributeFields', updatedFields, true)
  }

  return (
    <div className='h-100'>
      <div css={css`height: 100%; overflow:auto;`}>
        {lrsLayer && (dsExist || config.mode === ModeType.Map) && (
          <React.Fragment>
            <SettingSection role='group' aria-label={getI18nMessage('label')} title={getI18nMessage('label')}>
              <SettingRow>
                <TextInput
                  size='sm'
                  type='text'
                  className='w-100'
                  value={itemLabel}
                  onChange={handleLabelChange}
                  onAcceptValue={handleLabelAccept}
                  aria-label={getI18nMessage('label')}
                  />
                </SettingRow>
                {isLineEvent(lrsLayer) && (
                  <SettingRow tag='label' flow="no-wrap" label={getI18nMessage('useFieldAlias')} >
                  <Switch
                    checked={lrsLayer.useFieldAlias}
                    onChange={handleAliasChange}
                    />
                  </SettingRow>
                )}
              </SettingSection>
                {isLineEvent(lrsLayer) && (
                <SettingSection role='group'>
                  <SettingRow flow="wrap" label={getI18nMessage('configureFields')} >
                    <List
                      className='list-routeid-fields pt-2 w-100'
                      itemsJson={Array.from(lrsLayer.eventInfo.attributeFields).map(
                        (item, index) => ({
                          itemStateDetailContent: item,
                          itemKey: `${index}`,
                          itemStateChecked: getCheckedState(index),
                          itemStateTitle: lrsLayer.useFieldAlias ? item.field.alias : item.field.name,
                          itemStateCommands: [
                            {
                              label: item.editable ? getI18nMessage('attributeEditable') : getI18nMessage('attributeNotEditable'),
                              iconProps: () => ({ icon: item.editable ? IconUnlock : IconLock, size: 12 }),
                              action: ({ data }: CommandActionDataType) => {
                                const { itemJsons: [currentItemJson] } = data
                                const index = +currentItemJson.itemKey
                                setEditableState(index)
                              }
                            }
                          ]
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
                                    checked={lrsLayer.eventInfo.attributeFields[index].enabled}
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
              )}
            </React.Fragment>
        )}
        </div>
    </div>
  )
}
