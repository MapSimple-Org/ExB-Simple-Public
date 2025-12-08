/** @jsx jsx */
import { React, jsx, css, hooks, type ImmutableArray, Immutable, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { TextInput, Select } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { useDataSourceExists } from '../../runtime/data-source/use-data-source-exist'
import { getConfigValue, lrsDefaultMessages, type LrsLayer, ModeType, type ReferentProperties } from 'widgets/shared-code/lrs'
import type { IMConfig } from '../../config'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { getReferentProperties } from '../../common/utils'

interface Props {
  widgetId: string
  index: number
  config: IMConfig
  activeMapViewId: string
  onSettingChange: SettingChangeFunction
}

export function ReferentItemConfig (props: Props) {
  const { widgetId, index, config, activeMapViewId, onSettingChange } = props

  const useConfigValue = (key: string, fallback: any) => {
    return React.useMemo(() => {
      return getConfigValue(config, key, activeMapViewId) || fallback
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config, activeMapViewId])
  }

  const lrsLayers = useConfigValue('lrsLayers', []) as ImmutableArray<LrsLayer>
  const referentItem = lrsLayers[index]

  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)
  const [itemLabel, setItemLabel] = React.useState(referentItem?.name)
  const dsExist: boolean = useDataSourceExists({ widgetId, useDataSourceId: referentItem?.useDataSource?.dataSourceId })

  const referentProperties = React.useMemo(() => {
    if (referentItem) {
      return getReferentProperties(referentItem)
    }
    return {} as ReferentProperties
  }, [referentItem])

  const [selectedField, setSelectedField] = React.useState(referentProperties?.layerFields[0]?.name)

  React.useEffect(() => {
    // Update if label has changed.
    if (referentItem?.name && itemLabel !== referentItem?.name) {
      setItemLabel(referentItem?.name)
      setSelectedField(referentProperties?.layerFields[0]?.name)
    }
    if (referentItem?.displayField) {
      setSelectedField(referentItem?.displayField)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referentItem?.name])

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
    let newItem
    if (value == null) {
      newItem = referentItem.without(prop as any)
    } else {
      newItem = referentItem.set(prop, value)
    }
    onLayerChanged(index, newItem, dsUpdateRequired)
  }, [onLayerChanged, index, referentItem])

  const handleLabelChange = React.useCallback((e) => {
    setItemLabel(e.target.value)
  }, [])

  const handleLabelAccept = React.useCallback((value) => {
    if (value.trim().length > 0) {
      updateProperty('name', value, true)
    } else {
      setItemLabel(referentItem?.name)
    }
  }, [referentItem?.name, updateProperty])

  const renderFields: () => React.JSX.Element[] = () => {
    const layerFields = referentProperties?.layerFields
    if (layerFields?.length === 0) return []
    const fieldsDiv = []
    layerFields.forEach((field, i) => {
      fieldsDiv.push(<option key={i} value={field.name}>{field.name}</option>)
    })
    return fieldsDiv
  }

  const onPropertyChanged = (value) => {
    setSelectedField(value)
    const newItem = referentItem.set('displayField', value)
    onLayerChanged(index, newItem, false)
  }

  return (
    <div className='h-100'>
      <div css={css`height: 100%; overflow:auto;`}>
        {referentItem && (dsExist || config.mode === ModeType.Map) && (
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
              <SettingSection role='group' aria-label={getI18nMessage('configureFields')}
                title={getI18nMessage('configureFields')}>
                <SettingRow flow='wrap' label={getI18nMessage('defaultStr')}>
                  <Select
                    aria-label={getI18nMessage('defaultStr')}
                    className='w-100'
                    size='sm'
                    value={selectedField}
                    onChange={e => { onPropertyChanged(e.target.value) }}
                  >
                  {renderFields()}
                </Select>
            </SettingRow>
            </SettingSection>
            </React.Fragment>
        )}
        </div>
    </div>
  )
}
