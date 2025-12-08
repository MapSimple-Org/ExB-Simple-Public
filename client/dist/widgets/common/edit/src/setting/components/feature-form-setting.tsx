import {
  React, type UseDataSource, type ImmutableArray, type IMDataSourceJson, type ImmutableObject,
  Immutable, css, hooks, type FeatureLayerDataSource, type SubtypeSublayerDataSource,
  dataSourceUtils, SupportedServerTypes, ServiceManager, DataSourceManager, type DataSourceTypes
} from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow, SidePopper } from 'jimu-ui/advanced/setting-components'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import type { ILayerDefinition } from '@esri/arcgis-rest-feature-service'
import type { IMConfig, LayersConfig } from '../../config'
import defaultMessages from '../translations/default'
import FeatureFormList from './feature-form-list'
import LayerConfig from './layer-config'
import FeatureFormDs from './feature-form-ds'
import { getDataSourceById, getDsPrivileges, getEditDataSource, supportedDsTypes, type SupportedDataSource } from '../../utils'

interface FeatureFormSettingProps {
  widgetId: string
  config: IMConfig
  useDataSources: ImmutableArray<UseDataSource>
  onSettingChange: SettingChangeFunction
}

const tipsStyle = css`
  .edit-tips{
    font-style: italic;
    font-size: 12px;
    color: var(--ref-palette-neutral-1000);
  }
`

const newLayerConfigId = 'NEW_LAYER_CONFIG_ID'

export interface LayerInfo {
  id: string
  dataSource: FeatureLayerDataSource | SubtypeSublayerDataSource
  layer: __esri.FeatureLayer | __esri.SubtypeSublayer
  layerDefinition: ILayerDefinition
  layerEditingEnabled: boolean
}

const FeatureFormSetting = (props: FeatureFormSettingProps) => {
  const { widgetId, config, useDataSources, onSettingChange } = props
  const { layersConfig, batchEditing } = config
  const [activeId, setActiveId] = React.useState<string>(null)
  const [showLayerPanel, setShowLayerPanel] = React.useState(false)
  const [failedDataSourceIds, setFailedDataSourceIds] = React.useState<string[]>([])
  const [layersInfo, setLayersInfo] = React.useState<{ [dsId: string]: LayerInfo }>({})

  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const newEditString = translate('newEdit')

  const sidePopperTrigger = React.useRef<HTMLDivElement>(null)
  const popperFocusNode = React.useRef<HTMLElement>(null)

  const activeIndex = React.useMemo(() => {
    if (activeId === newLayerConfigId) {
      return layersConfig.length
    } else {
      return layersConfig.findIndex(l => l.id === activeId)
    }
  }, [activeId, layersConfig])
  const activeLayerConfig = React.useMemo(() => {
    const layerConfig = layersConfig.find(l => l.id === activeId)
    return Immutable(layerConfig)
  }, [activeId, layersConfig])
  const activeLayerInfo = React.useMemo(() => layersInfo[activeId], [activeId, layersInfo])

  const onShowLayerPanel = React.useCallback((dsId: string, newAdded?: boolean) => {
    const index = layersConfig.findIndex(l => l.id === dsId)
    let node: HTMLElement
    if (newAdded) {
      node = sidePopperTrigger.current.getElementsByClassName('add-edit-btn')[0] as HTMLElement
    } else {
      node = sidePopperTrigger.current.getElementsByClassName('jimu-tree-item__body')[index] as HTMLElement
    }
    popperFocusNode.current = node
    if (dsId === activeId && !newAdded) {
      setShowLayerPanel(false)
      setActiveId(null)
    } else {
      setShowLayerPanel(true)
      setActiveId(dsId)
    }
  }, [activeId, layersConfig])

  const handleClickNew = React.useCallback(async () => {
    // Before opening "Select data" panel, fetch all supported data's server info.
    const dataSources = DataSourceManager.getInstance().getDataSourcesAsArray()
    const supportedDss = dataSources.filter(ds => supportedDsTypes.includes(ds.type as DataSourceTypes) && !ds.isDataView) as SupportedDataSource[]
    const serviceManager = ServiceManager.getInstance()
    const promises = supportedDss.map(ds => serviceManager.fetchArcGISServerInfo(ds.url))
    await Promise.allSettled(promises)
    onShowLayerPanel(newLayerConfigId, true)
    const dsManager = DataSourceManager.getInstance()
    dsManager.createAllDataSources().then(()=>{
        if (props.useDataSources.length >= 1) {
            for (let i = 0; i < props.useDataSources.length; i++) {
                const dsSource = props.useDataSources[i]
                const ogds = dsManager.getDataSource(dsSource.dataSourceId)
                const ogJson = ogds.getDataSourceJson()

                //New ID
                const newid = dsSource.dataSourceId + '_copy_' + Date.now()

                //Create New Datasource
                dsManager.createDataSource({
                    id: newid,
                    dataSourceJson: ogJson
                })
            }
        }
    })
  }, [onShowLayerPanel, props.useDataSources])

  const onCloseLayerPanel = React.useCallback(() => {
    setShowLayerPanel(false)
    setActiveId(null)
  }, [])

  const removeLayer = React.useCallback((dsId: string) => {
    const newLayersConfig = config.layersConfig.filter(l => l.id !== dsId)
    let newConfig = config.set('layersConfig', newLayersConfig)
    // remove description
    if (newLayersConfig.length === 0) {
      newConfig = newConfig.set('description', '')
    }
    const oldUseDataSource = useDataSources ? useDataSources.asMutable({ deep: true }) : []
    onSettingChange({
      id: widgetId,
      config: newConfig,
      useDataSources: oldUseDataSource.filter(useDs => useDs.dataSourceId !== dsId)
    })
    if (dsId === activeId) {
      onCloseLayerPanel()
    }
  }, [activeId, config, onCloseLayerPanel, onSettingChange, useDataSources, widgetId])

  const sortLayer = React.useCallback((dsIds: string[]) => {
    const newLayerConfigs = dsIds.map(dsId => layersConfig.find(l => l.id === dsId))
    onSettingChange({
      id: widgetId,
      config: config.set('layersConfig', newLayerConfigs)
    })
  }, [config, layersConfig, onSettingChange, widgetId])

  const onFilterDs = React.useCallback((dsJson: IMDataSourceJson): boolean => {
    if (!dsJson?.url || dsJson?.isOutputFromWidget) return true
    const alreadySelectIds = layersConfig.map(item => item.id)
    const isFromMapService = (dataSourceUtils.getFullArcGISServiceUrl(dsJson.url, false) || '').toLowerCase().endsWith(SupportedServerTypes.MapService.toLowerCase())
    // If a service is non-hosted and uneditable, it should not be listed
    const ds = getDataSourceById(dsJson.id)
    const layerDefinition = ds?.getLayerDefinition()
    const {create, update, deletable} = getDsPrivileges(layerDefinition)
    const serverInfo = ServiceManager.getInstance().getServerInfoByServiceUrl(dsJson.url)
    const isHosted = !serverInfo || serverInfo.owningSystemUrl
    const isUneditableNonHosted = !isHosted && !create && !update && !deletable
    return alreadySelectIds.includes(dsJson.id) || isFromMapService || isUneditableNonHosted
  }, [layersConfig])

  const handleLayerConfigChange = React.useCallback((newLayerConfig: ImmutableObject<LayersConfig>) => {
    const index = activeIndex > -1 ? activeIndex : layersConfig.length
    let newUseDataSources = useDataSources || Immutable([])
    if (activeLayerConfig?.id !== newLayerConfig.id) {
      newUseDataSources = newUseDataSources.filter(useDs => useDs.dataSourceId !== activeLayerConfig?.id)
      newUseDataSources = newUseDataSources.concat(newLayerConfig.useDataSource)
    }
    onSettingChange({
      id: widgetId,
      config: config.setIn(['layersConfig', `${index}`], newLayerConfig),
      useDataSources: newUseDataSources.asMutable()
    })
    setActiveId(newLayerConfig.id)
  }, [activeIndex, activeLayerConfig?.id, config, layersConfig.length, onSettingChange, useDataSources, widgetId])


  const onDataSourceCreatedOrFailed = React.useCallback(async (dataSourceId: string, ds: SupportedDataSource) => {
    const dsIdsInConfig = layersConfig.map(l => l.id)
    if (!ds) {
      setFailedDataSourceIds((old) => [...old, dataSourceId].filter(dsId => dsIdsInConfig.includes(dsId)))
    } else {
      const dataSource = getEditDataSource(ds)
      const layer = await dataSource.createJSAPILayerByDataSource() as __esri.FeatureLayer | __esri.SubtypeSublayer
      const newLayerInfo = {
        id: dataSourceId,
        dataSource,
        layer,
        layerDefinition: dataSource?.getLayerDefinition(),
        layerEditingEnabled: layer.editingEnabled,
      }
      setLayersInfo(old => {
        const newLayersInfo = {}
        for (const l of layersConfig) {
          if (l.id === dataSourceId) {
            newLayersInfo[l.id] = newLayerInfo
          } else if (old[l.id]) {
            newLayersInfo[l.id] = old[l.id]
          }
        }
        return newLayersInfo
      })
    }
  }, [layersConfig])

  return <React.Fragment>
    {layersConfig.map((l) =>
      <FeatureFormDs
        key={l.useDataSource.dataSourceId}
        useDataSource={l.useDataSource}
        onDataSourceCreatedOrFailed={onDataSourceCreatedOrFailed}
      />
    )}
    <div className='mt-4' ref={sidePopperTrigger}>
      <SettingRow>
        <Button
          className='w-100 add-edit-btn'
          type='primary'
          onClick={handleClickNew}
          title={newEditString}
          aria-label={newEditString}
          aria-describedby={'edit-blank-msg'}
        >
          <div className='w-100 px-2 text-truncate'>
            <PlusOutlined className='mr-1 mb-1'/>
            {newEditString}
          </div>
        </Button>
      </SettingRow>
      <SettingRow css={tipsStyle}>
        <div className='text-break edit-tips'>
          {translate('newEditTips')}
        </div>
      </SettingRow>
      {layersConfig.length > 0 &&
        <FeatureFormList
          layersConfig={layersConfig}
          activeIndex={activeIndex}
          failedDataSourceIds={failedDataSourceIds}
          onRemove={removeLayer}
          onSort={sortLayer}
          onClick={onShowLayerPanel}
        />
      }
    </div>
    <SidePopper
      position='right'
      isOpen={showLayerPanel}
      toggle={onCloseLayerPanel}
      trigger={sidePopperTrigger?.current}
      backToFocusNode={popperFocusNode.current}
    >
      <LayerConfig
        layerConfig={activeLayerConfig}
        isGeoMode={false}
        layerDefinition={activeLayerInfo?.layerDefinition}
        layerEditingEnabled={activeLayerInfo?.layerEditingEnabled}
        filterDs={onFilterDs}
        batchEditing={batchEditing}
        onChange={handleLayerConfigChange}
        onClose={onCloseLayerPanel}
      />
    </SidePopper>
  </React.Fragment>
}

export default FeatureFormSetting
