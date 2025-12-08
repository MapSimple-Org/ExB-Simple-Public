/** @jsx jsx */
import {
  React, jsx, type UseDataSource, type ImmutableArray, type IMDataSourceJson, type ImmutableObject,
  Immutable, hooks, type FeatureLayerDataSource, type SubtypeSublayerDataSource, CONSTANTS, DataSourceManager
} from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow, SidePopper } from 'jimu-ui/advanced/setting-components'
import { builderAppSync, type SettingChangeFunction } from 'jimu-for-builder'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import type { ILayerDefinition } from '@esri/arcgis-rest-feature-service'
import type { IMConfig, LayersConfig } from '../../config'
import defaultMessages from '../translations/default'
import LayerList from './layer-list'
import LayerConfig from './layer-config'
import LayerConfigDataSource from './layer-config-ds'
import { batchDsTypes, getArrayMaxId, getTableDataSource, supportedDsTypes, type SupportedDataSource } from '../../utils'
import { mergeOneUseDataSource } from './utils'

interface FeatureFormSettingProps {
  widgetId: string
  config: IMConfig
  useDataSources: ImmutableArray<UseDataSource>
  onSettingChange: SettingChangeFunction
}

const newLayerConfigId = 'NEW_LAYER_CONFIG_ID'

export interface LayerInfo {
  id: string
  dataSource: FeatureLayerDataSource | SubtypeSublayerDataSource
  layer: __esri.FeatureLayer | __esri.SubtypeSublayer
  layerDefinition: ILayerDefinition
  layerEditingEnabled: boolean
  isDsAutoRefresh: boolean
  isEditableDs: boolean
}

const LayerModeSetting = (props: FeatureFormSettingProps) => {
  const { widgetId, config, useDataSources, onSettingChange } = props
  const { layersConfig } = config
  const [activeId, setActiveId] = React.useState<string>(null)
  const [showLayerPanel, setShowLayerPanel] = React.useState<boolean>(false)
  const [isNewAdd, setIsNewAdd] = React.useState<boolean>(false)
  const [failedDataSourceIds, setFailedDataSourceIds] = React.useState<string[]>([])
  const [layersInfo, setLayersInfo] = React.useState<{ [dsId: string]: LayerInfo }>({})
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const newTableString = translate('newSheet')
  const { OUTPUT_DATA_VIEW_ID } = CONSTANTS

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
    setIsNewAdd(newAdded)
  }, [activeId, layersConfig])

  const handleClickNew = React.useCallback(() => {
    onShowLayerPanel(newLayerConfigId, true)
  }, [onShowLayerPanel])

  const handleClickUpdate = React.useCallback((dsId: string) => {
    onShowLayerPanel(dsId, false)
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'activeTabId', value: dsId })
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'settingChangeTab', value: true })
  }, [onShowLayerPanel, widgetId])

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
    const newUseDataSources = newLayersConfig.map(config => config.useDataSource?.asMutable({ deep: true }))
    onSettingChange({
      id: widgetId,
      config: newConfig,
      useDataSources: newUseDataSources?.asMutable({ deep: true })
    })
    if (dsId === activeId) {
      onCloseLayerPanel()
    }
  }, [activeId, config, onCloseLayerPanel, onSettingChange, widgetId])

  const sortLayer = React.useCallback((dsIds: string[]) => {
    const newLayerConfigs = dsIds.map(dsId => layersConfig.find(l => l.id === dsId))
    onSettingChange({
      id: widgetId,
      config: config.set('layersConfig', newLayerConfigs)
    })
  }, [config, layersConfig, onSettingChange, widgetId])

  const onFilterDs = (dsJson: IMDataSourceJson): boolean => {
    let hideDsFlag = false
    const isBatchDs = batchDsTypes.includes(dsJson.type as any)
    if (isBatchDs) {
      const dataSource = DataSourceManager.getInstance().getDataSource(dsJson.id)
      const allChildDs = dataSource.isDataSourceSet() ? dataSource.getAllChildDataSources() : []
      const allSupChildDs = allChildDs.filter(item => supportedDsTypes.includes(item.type as any))
      if (allSupChildDs?.length === 0) {
        hideDsFlag = true
      }
    }
    return hideDsFlag
  }

  const handleLayerConfigChange = React.useCallback((newLayerConfig: ImmutableObject<LayersConfig>) => {
    const index = activeIndex > -1 ? activeIndex : layersConfig.length
    const newConfig = config.setIn(['layersConfig', `${index}`], newLayerConfig)
    const newUseDataSources: UseDataSource[] = []
    newConfig.layersConfig.forEach(item => {
      const originIndex = newUseDataSources.findIndex(useDs => useDs.dataSourceId === item.useDataSource.dataSourceId)
      const haveThisDs = originIndex > -1
      if (haveThisDs) {
        const originUseDs = newUseDataSources[originIndex]
        const mergedUseDataSource = mergeOneUseDataSource(newLayerConfig.useDataSource, Immutable(originUseDs))
        const mutableUseDss = mergedUseDataSource.asMutable({ deep: true })
        newUseDataSources.splice(originIndex, 1, mutableUseDss)
      } else {
        newUseDataSources.push(item.useDataSource.asMutable({ deep: true }))
      }
    })
    onSettingChange({
      id: widgetId,
      config: newConfig,
      useDataSources: newUseDataSources
    })
    setActiveId(newLayerConfig.id)
  }, [activeIndex, config, layersConfig.length, onSettingChange, widgetId])

  const handleBatchAdd = React.useCallback((newConfigs: ImmutableArray<LayersConfig>) => {
    let newUseDataSources = useDataSources || Immutable([])
    for (const config of newConfigs) {
      newUseDataSources = newUseDataSources.concat(config.useDataSource)
    }
    const newLayersConfig = layersConfig.concat(newConfigs)
    onSettingChange({
      id: widgetId,
      config: config.set('layersConfig', newLayersConfig),
      useDataSources: newUseDataSources.asMutable()
    })
    setActiveId(newConfigs[0].id)
  }, [useDataSources, config, layersConfig, widgetId, onSettingChange])

  const handleConfigSaved = React.useCallback(() => {
    setIsNewAdd(false)
  }, [setIsNewAdd])

  const getLayerModeConfigId = React.useCallback((dsId: string): string => {
    const index = layersConfig.length > 0
      ? getArrayMaxId(layersConfig)
      : 0
    return `${dsId}-${index + 1}`
  }, [layersConfig])

  const onDataSourceCreatedOrFailed = React.useCallback(async (dataSourceId: string, ds: SupportedDataSource) => {
    const dsIdsInConfig = layersConfig.map(l => l.id)
    if (!ds) {
      setFailedDataSourceIds((old) => [...old, dataSourceId].filter(dsId => dsIdsInConfig.includes(dsId)))
    } else {
      const dataSource = getTableDataSource(ds)
      const layer = await dataSource.createJSAPILayerByDataSource() as __esri.FeatureLayer | __esri.SubtypeSublayer
      const newLayerInfo = {
        id: dataSourceId,
        dataSource,
        layer,
        layerDefinition: dataSource?.getLayerDefinition(),
        layerEditingEnabled: layer.editingEnabled,
        isDsAutoRefresh: dataSource?.getAutoRefreshInterval() > 0,
        isEditableDs: dataSource?.url && dataSource?.dataViewId !== OUTPUT_DATA_VIEW_ID
      }
      setLayersInfo(old => {
        const newLayersInfo = {}
        for (const config of layersConfig) {
          if (config?.useDataSource?.dataSourceId === dataSourceId) {
            newLayersInfo[config.id] = newLayerInfo
          } else if (old[config.id]) {
            newLayersInfo[config.id] = old[config.id]
          }
        }
        return newLayersInfo
      })
    }
  }, [layersConfig, OUTPUT_DATA_VIEW_ID])

  return <React.Fragment>
    {layersConfig.map(config =>
      <LayerConfigDataSource
        key={config.id}
        useDataSource={config.useDataSource}
        onDataSourceCreatedOrFailed={onDataSourceCreatedOrFailed}
      />
    )}
    <div className='mt-4' ref={sidePopperTrigger}>
      <SettingRow>
        <Button
          className='w-100 add-edit-btn'
          type='primary'
          onClick={handleClickNew}
          title={newTableString}
          aria-label={newTableString}
          aria-describedby={'edit-blank-msg'}
        >
          <div className='w-100 px-2 text-truncate'>
            <PlusOutlined className='mr-1 mb-1'/>
            {newTableString}
          </div>
        </Button>
      </SettingRow>
      {layersConfig.length > 0 &&
        <LayerList
          layersConfig={layersConfig}
          activeIndex={activeIndex}
          failedDataSourceIds={failedDataSourceIds}
          onRemove={removeLayer}
          onSort={sortLayer}
          onClick={handleClickUpdate}
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
        widgetId={widgetId}
        config={config}
        layerConfig={activeLayerConfig}
        isMapMode={false}
        layerDefinition={activeLayerInfo?.layerDefinition}
        layerEditingEnabled={activeLayerInfo?.layerEditingEnabled}
        isDsAutoRefresh={activeLayerInfo?.isDsAutoRefresh}
        isEditableDs={activeLayerInfo?.isEditableDs}
        isNewAdd={isNewAdd}
        handleBatchAdd={handleBatchAdd}
        onConfigSaved={handleConfigSaved}
        getLayerModeConfigId={getLayerModeConfigId}
        filterDs={onFilterDs}
        onChange={handleLayerConfigChange}
        onClose={onCloseLayerPanel}
      />
    </SidePopper>
  </React.Fragment>
}

export default LayerModeSetting
