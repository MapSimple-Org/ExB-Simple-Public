import {
  React, Immutable, css, type IMDataSourceJson, hooks, type ImmutableObject, type UseDataSource, type ImmutableArray,
  DataSourceManager
} from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { TextInput, defaultMessages as jimuUIMessages, PanelHeader, LoadingType, Loading } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import type { ILayerDefinition } from '@esri/arcgis-rest-feature-service'
import type { LayersConfig } from '../../config'
import defaultMessages from '../translations/default'
import { constructConfig, getEditDataSource, type SupportedDataSource, supportedDsTypes } from '../../utils'
import LayerConfigCapability from './layer-config-capability'
import LayerConfigField from './layer-config-field'

export interface LayerConfigProps {
  layerConfig: ImmutableObject<LayersConfig>
  isGeoMode: boolean
  layerDefinition: ILayerDefinition
  layerEditingEnabled: boolean
  batchEditing?: boolean
  filterDs?: (dsJson: IMDataSourceJson) => boolean
  onChange: (layerConfig: ImmutableObject<LayersConfig>) => void
  onClose?: () => void
}

const style = css`
  .layer-config-panel {
    .panel-inner {
      .title {
        max-width: 70%;
      }
    }
    .setting-container {
      height: calc(100% - 58px);
      overflow: auto;
    }
  }
`

const LayerConfig = (props: LayerConfigProps) => {
  const { layerConfig, isGeoMode, layerDefinition, layerEditingEnabled, batchEditing = false, filterDs, onChange, onClose } = props
  const [itemLabel, setItemLabel] = React.useState('')
  const [tempUseDs, setTempUseDs] = React.useState<ImmutableArray<UseDataSource>>(null)

  React.useEffect(() => {
    setItemLabel(layerConfig?.name || '')
  }, [layerConfig?.name])

  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const layerUseDs = layerConfig?.useDataSource ? Immutable([layerConfig.useDataSource]) : Immutable([])

  const handleDsChange = React.useCallback(async (useDss: UseDataSource[]) => {
    const useDs = useDss?.[0]
    if (!useDs) return
    try {
      setTempUseDs(Immutable(useDss))
      const ds = await DataSourceManager.getInstance().createDataSourceByUseDataSource(useDs) as SupportedDataSource
      const dataSource = getEditDataSource(ds)
      const layer = (await dataSource.createJSAPILayerByDataSource()) as __esri.FeatureLayer | __esri.SubtypeSublayer
      const newLayerConfig = constructConfig(dataSource, layer)
      onChange(Immutable(newLayerConfig))
    } catch (err) {
      console.error(err)
    } finally {
      setTempUseDs(null)
    }
  }, [onChange])

  const nameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setItemLabel(value)
  }, [])

  const nameAccept = React.useCallback((value: string) => {
    value = value?.trim()
    value = value === '' ? layerConfig?.name : value
    if (value !== itemLabel) {
      setItemLabel(value)
    }
    onChange(layerConfig.set('name', value))
  }, [itemLabel, layerConfig, onChange])

  return (
    <div className='w-100 h-100' css={style}>
      {tempUseDs && <Loading type={LoadingType.Secondary} />}
      <div className='w-100 h-100 layer-config-panel'>
        {!isGeoMode && <div className="w-100 d-flex px-4 py-0">
          <PanelHeader
            level={1}
            className='px-0 py-4 panel-inner'
            showClose={!!onClose}
            onClose={onClose}
            title={translate('layerConfig')}>
          </PanelHeader>
        </div>}
        <div className='setting-container'>
          <SettingSection title={translate('data')} className="pt-0">
            <SettingRow>
              <DataSourceSelector
                types={supportedDsTypes}
                disableRemove={() => true}
                disableDataSourceList={isGeoMode}
                hideDataView
                useDataSources={ tempUseDs || layerUseDs}
                mustUseDataSource
                onChange={handleDsChange}
                closeDataSourceListOnChange
                hideDs={filterDs}
                hideTabs={Immutable(['OUTPUT'])}
              />
            </SettingRow>
          </SettingSection>

          {layerConfig &&
            <React.Fragment>
              {!isGeoMode && <SettingSection title={translate('label')}>
                <SettingRow>
                  <TextInput
                    size='sm'
                    type='text'
                    className='w-100'
                    value={itemLabel}
                    onChange={nameChange}
                    onAcceptValue={nameAccept}
                    aria-label={translate('label')}
                  />
                </SettingRow>
              </SettingSection>}

              <LayerConfigCapability
                layerConfig={layerConfig}
                isGeoMode={isGeoMode}
                layerDefinition={layerDefinition}
                layerEditingEnabled={layerEditingEnabled}
                onChange={onChange}
              />

              {!batchEditing && <LayerConfigField
                layerConfig={layerConfig}
                layerDefinition={layerDefinition}
                layerEditingEnabled={layerEditingEnabled}
                onChange={onChange}
              />}
            </React.Fragment>
          }
        </div>
      </div>
    </div>
  )
}

export default LayerConfig
