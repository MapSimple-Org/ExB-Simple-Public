/** @jsx jsx */
import { React, hooks, jsx, type ImmutableObject, type ImmutableArray, Immutable, DataSourceManager, type UseDataSource, ServiceManager, CONSTANTS } from 'jimu-core'
import type { JimuMapView, JimuLayerView, JimuTable } from 'jimu-arcgis'
import { defaultMessages as jimuUIMessages, Alert } from 'jimu-ui'
import { SettingRow, LayerSetting } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { LayerHonorModeType, type MapViewsConfig, type LayersConfig, type MapViewConfig, type IMConfig } from '../../config'
import { constructConfig, getDataSourceById, getTableDataSource, isSupportedJimuLayerView, type SupportedDataSource } from '../../utils'
import type { TreeItemsType } from 'jimu-ui/basic/list-tree'
import LayerConfig from './layer-config'
import { builderAppSync } from 'jimu-for-builder'

interface TableMapProps {
  widgetId: string
  config: IMConfig
  useMapWidgetIds: ImmutableArray<string>
  mapEmpty: boolean
  jimuMapViews: JimuMapView[]
  mapViewsConfig: ImmutableObject<MapViewsConfig>
  useDataSources: ImmutableArray<UseDataSource>
  onChange: (mapViewId: string, mapViewConfig: ImmutableObject<MapViewConfig>, useDs?: UseDataSource[]) => void
}

const TableMapLayers = (props: TableMapProps) => {
  const { widgetId, config, useMapWidgetIds, mapEmpty, jimuMapViews, mapViewsConfig, useDataSources: propUseDataSources = Immutable([]), onChange } = props
  const [activeMapViewId, setActiveMapViewId] = React.useState<string>(null)
  const [activeLayerView, setActiveLayerView] = React.useState<JimuLayerView | JimuTable>(null)
  const [activeMapLayerViews, setActiveMapLayerViews] = React.useState<JimuLayerView[]>([])
  const [activeMapTables, setActiveMapTables] = React.useState<JimuTable[]>([])

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)
  const { OUTPUT_DATA_VIEW_ID } = CONSTANTS

  //#region Map items
  const mapWidgetId = useMapWidgetIds?.[0]
  const handleMapItemClick = React.useCallback(async (dsId: string) => {
    const mapViewId = `${mapWidgetId}-${dsId}`
    setActiveMapViewId(mapViewId)
    const jimuMapView = jimuMapViews.find(jmv => jmv.id === mapViewId)
    const layerViews = jimuMapView.getAllJimuLayerViews()
    const jimuTables = jimuMapView.getJimuTables().filter(jimuTable => jimuTable.table?.visible)
    let mapLayerViews = Object.values(layerViews).filter(layerView => {
      return !layerView.fromRuntime && isSupportedJimuLayerView(layerView)
    })
    const serviceManager = ServiceManager.getInstance()
    const promises = mapLayerViews.map(async (layerView) => {
      const ds = await layerView.createLayerDataSource()
      await serviceManager.fetchArcGISServerInfo(layerView.layer.url)
      return ds ? layerView : null
    })
    try {
      mapLayerViews = (await Promise.all(promises)).filter(v => !!v)
    } catch (e) {
      // some SceneLayer can't create data source, it is as expected, just log it
      console.log(e)
    }
    // https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/17175
    if (!jimuMapView.isActive) {
      await waitTime(500)
    }

    mapLayerViews = mapLayerViews.filter(jimuLayerView => !!jimuLayerView.getLayerDataSource())
    setActiveMapLayerViews(mapLayerViews)
    setActiveMapTables(jimuTables)
  }, [jimuMapViews, mapWidgetId])
  //#endregion

  //#region Layer custom
  const isCustomizeEnabled = !!mapViewsConfig[activeMapViewId]?.customizeLayers
  const displayRuntimeLayers = mapViewsConfig[activeMapViewId]?.displayRuntimeLayers === undefined ? true : mapViewsConfig[activeMapViewId]?.displayRuntimeLayers

  const onDisplayRuntimeLayers = React.useCallback((enable: boolean) => {
    const mapViewConfig: ImmutableObject<MapViewConfig> = mapViewsConfig[activeMapViewId] || Immutable({customizeLayers: false})
    const updatedUseDataSources = propUseDataSources.asMutable({ deep: true })
    onChange(activeMapViewId, mapViewConfig.set('displayRuntimeLayers', enable), updatedUseDataSources)
  }, [activeMapViewId, mapViewsConfig, propUseDataSources, onChange])

  const selectedLayerViewIds = React.useMemo(() => {
    const layerIds = {}
    for (const [mapViewId, config] of Object.entries(mapViewsConfig || {})) {
      if (config.customizeLayers) {
        layerIds[mapViewId] = config.customJimuLayerViewIds || Immutable([])
      }
    }
    return layerIds
  }, [mapViewsConfig])

  // all JimuLayerViews that can show in JimuLayerViewSelector, include FeatureJimuLayerView/SceneJimuLayerView and their ancestor JimuLayerViews
  const allAvailableLayerViewIds = React.useMemo(() => {
    const layerViewIds: string[] = []
    activeMapLayerViews.forEach(layerView => {
      // imagery layer with no field information
      const isImagery = layerView.type === 'imagery'
      const layerDs = layerView?.getLayerDataSource()
      const allFieldsSchema = layerDs?.getSchema()
      const isImageryWithoutField = isImagery && !allFieldsSchema?.fields
      if (!isImageryWithoutField) {
        layerViewIds.push(layerView.id)
      }
      const ancestorLayerViews = layerView.getAllAncestorJimuLayerViews()
      ancestorLayerViews.forEach(ancestorLayerView => {
        const isImagery = ancestorLayerView.type === 'imagery'
        const ancestorLayerDs = ancestorLayerView?.getLayerDataSource()
        const allFieldsSchema = ancestorLayerDs?.getSchema()
        const isImageryWithoutField = isImagery && !allFieldsSchema?.fields
        if (!isImageryWithoutField) {
          layerViewIds.push(ancestorLayerView.id)
        }
      })
    })
    const jimuMapView = jimuMapViews.find(jmv => jmv.id === activeMapViewId)
    activeMapTables.forEach(async jimuTable => {
      const oriTable = jimuTable.table
      const layerDataSourceId = jimuMapView.getDataSourceIdByAPILayer(oriTable)
      const tableDs = DataSourceManager.getInstance().getDataSource(layerDataSourceId)
      const mapDs = jimuMapView.getMapDataSource()
      let layerDs = tableDs
      if (!tableDs && mapDs) {
        try {
          layerDs = await mapDs.createDataSourceByLayer(oriTable)
        } catch (error) {
          console.log(error)
        }
      }
      if (layerDs) layerViewIds.push(jimuTable.jimuTableId)
    })
    return layerViewIds
  }, [activeMapLayerViews, activeMapTables, activeMapViewId, jimuMapViews])

  const handleToggleCustomize = React.useCallback(async (checked: boolean) => {
    let updatedUseDataSources = propUseDataSources.asMutable({ deep: true })
    const jimuMapView = jimuMapViews.find(jmv => jmv.id === activeMapViewId)
    const mapViewConfig: ImmutableObject<MapViewConfig> = mapViewsConfig[activeMapViewId] || Immutable({customizeLayers: false})
    if (checked) {
      const filteredMapLayerViews = activeMapLayerViews.filter(layerView => layerView?.isLayerVisible())
      const allLayerViewIds = filteredMapLayerViews.map(layerView => layerView.id)
      const allTableIds = activeMapTables.map(jimuTable => jimuTable.jimuTableId)
      const customJimuLayerViewIds = allLayerViewIds.concat(allTableIds)
      const newLayersConfig = [] as LayersConfig[]
      for (const layerView of filteredMapLayerViews) {
        const isFromRunTime = layerView?.fromRuntime
        if (isFromRunTime) continue
        let layerDs
        try {
          layerDs = (await layerView.getOrCreateLayerDataSource()) as SupportedDataSource
        } catch (error) {
          continue
        }
        if (!layerDs) continue
        const layerConfig = constructConfig(layerDs, true)
        // imagery layer with no field information
        const isImagery = layerView.type === 'imagery'
        const allFieldsSchema = layerDs?.getSchema()
        const isImageryWithoutField = isImagery && !allFieldsSchema?.fields
        if (isImageryWithoutField) continue
        newLayersConfig.push(layerConfig)
        const useDataSource = getUseDs(layerDs, true)
        updatedUseDataSources = getUpdatedUseDataSources(updatedUseDataSources, 'add', useDataSource)
      }
      for (const jimuTable of activeMapTables) {
        const oriTable = jimuTable.table
        const layerDataSourceId = jimuMapView.getDataSourceIdByAPILayer(oriTable)
        const tableDs = DataSourceManager.getInstance().getDataSource(layerDataSourceId)
        const mapDs = jimuMapView.getMapDataSource()
        let layerDs = tableDs
        if (!tableDs && mapDs) {
          try {
            layerDs = await mapDs.createDataSourceByLayer(oriTable)
          } catch (error) {
            continue
          }
        }
        if (!layerDs) continue
        const layerConfig = constructConfig(layerDs, true)
        newLayersConfig.push(layerConfig)
        const useDataSource = getUseDs(layerDs, true)
        updatedUseDataSources = getUpdatedUseDataSources(updatedUseDataSources, 'add', useDataSource)
      }
      onChange(activeMapViewId, mapViewConfig.set('customizeLayers', true).set('customJimuLayerViewIds', customJimuLayerViewIds).set('layersConfig', newLayersConfig), updatedUseDataSources)
    } else {
      for (const layerView of activeMapLayerViews) {
        let layerDs
        try {
          layerDs = (await layerView.getOrCreateLayerDataSource()) as SupportedDataSource
        } catch (error) {
          continue
        }
        if (!layerDs) continue
        // imagery layer with no field information
        const isImagery = layerView.type === 'imagery'
        const allFieldsSchema = layerDs?.getSchema()
        const isImageryWithoutField = isImagery && !allFieldsSchema?.fields
        if (isImageryWithoutField) continue
        const useDataSource = getUseDs(layerDs, true)
        updatedUseDataSources = getUpdatedUseDataSources(updatedUseDataSources, 'remove', useDataSource)
      }
      for (const jimuTable of activeMapTables) {
        const oriTable = jimuTable.table
        const layerDataSourceId = jimuMapView.getDataSourceIdByAPILayer(oriTable)
        const tableDs = DataSourceManager.getInstance().getDataSource(layerDataSourceId)
        const mapDs = jimuMapView.getMapDataSource()
        let layerDs = tableDs
        if (!tableDs && mapDs) {
          try {
            layerDs = await mapDs.createDataSourceByLayer(oriTable)
          } catch (error) {
            continue
          }
        }
        if (!layerDs) continue
        const useDataSource = getUseDs(layerDs, true)
        updatedUseDataSources = getUpdatedUseDataSources(updatedUseDataSources, 'remove', useDataSource)
      }
      if (updatedUseDataSources && updatedUseDataSources.length === 0) updatedUseDataSources = undefined
      onChange(activeMapViewId, mapViewConfig.set('customizeLayers', false).set('customJimuLayerViewIds', []).set('displayRuntimeLayers', true).set('layersConfig', []), updatedUseDataSources)
    }
  }, [propUseDataSources, activeMapLayerViews, activeMapTables, activeMapViewId, jimuMapViews, mapViewsConfig, onChange])

  const hideLayers = React.useCallback((jimuLayerView: JimuLayerView) => {
    return !allAvailableLayerViewIds.includes(jimuLayerView.id)
  }, [allAvailableLayerViewIds])

  const disableLayers = React.useCallback((jimuLayerView: JimuLayerView) => {
    return !activeMapLayerViews.includes(jimuLayerView)
  }, [activeMapLayerViews])

  const diffViewSelectorArray = (originalArray: string[], newArray: string[]) => {
    const add = []
    const remove = []
    originalArray.forEach(item => {
      if (!newArray.includes(item)) {
        remove.push(item)
      }
    })
    newArray.forEach(item => {
      if (!originalArray.includes(item)) {
        add.push(item)
      }
    })
    return { add, remove, diff: add.concat(remove) }
  }

  const getUseDs = (ds, customInit?: boolean) => {
    if (!ds) return null
    return {
      dataSourceId: ds.id,
      mainDataSourceId: ds.getMainDataSource().id,
      dataViewId: ds.dataViewId,
      rootDataSourceId: ds.getRootDataSource()?.id,
      ...(customInit ? { useFieldsInPopupInfo: true } : {})
    }
  }

  const handleSelectedLayerIdChange = React.useCallback(async (newSelectedViewIds: string[]) => {
    const mapViewConfig = mapViewsConfig[activeMapViewId]
    const layersConfig = mapViewConfig.layersConfig
    const jimuMapView = jimuMapViews.find(jmv => jmv.id === activeMapViewId)
    // update layersConfig
    const dsIds = newSelectedViewIds.map(layerViewId => {
      const curDsId = activeMapLayerViews.find(lv => lv.id === layerViewId)?.layerDataSourceId
        || jimuMapView.getDataSourceIdByAPILayer(activeMapTables.find(mt => mt.jimuTableId === layerViewId)?.table)
      return curDsId
    })
    let newLayersConfig = layersConfig.filter(l => dsIds.includes(l.id))
    const addLayerViewIds = newSelectedViewIds.filter(layerViewId => {
      const curDsId = activeMapLayerViews.find(lv => lv.id === layerViewId)?.layerDataSourceId
        || jimuMapView.getDataSourceIdByAPILayer(activeMapTables.find(mt => mt.jimuTableId === layerViewId)?.table)
      return curDsId && !layersConfig.find(l => l.id === curDsId)
    })
    const addLayersConfig: LayersConfig[] = []
    for (const layerViewId of addLayerViewIds) {
      const layerView = activeMapLayerViews.find(lv => lv.id === layerViewId)
      const tableView = activeMapTables.find(mt => mt.jimuTableId === layerViewId)
      let layerDs
      if (layerView) {
        try {
          layerDs = (await layerView.getOrCreateLayerDataSource()) as SupportedDataSource
        } catch (error) {
          console.log(error)
        }
      } else if (tableView) {
        const layerDataSourceId = jimuMapView.getDataSourceIdByAPILayer(tableView.table)
        const tableDs = DataSourceManager.getInstance().getDataSource(layerDataSourceId)
        const mapDs = jimuMapView.getMapDataSource()
        layerDs = tableDs
        if (!tableDs && mapDs) {
          try {
            layerDs = await mapDs.createDataSourceByLayer(tableView.table)
          } catch (error) {
            console.log(error)
          }
        }
      }
      if(layerDs) addLayersConfig.push(constructConfig(layerDs, true))
    }
    newLayersConfig = newLayersConfig.concat(addLayersConfig)
    // update useDataSources
    const originalViewIds = mapViewConfig?.customJimuLayerViewIds?.asMutable({ deep: true })
    const { add, remove, diff: diffIds } = diffViewSelectorArray(originalViewIds, newSelectedViewIds)
    let updatedUseDataSources = propUseDataSources.asMutable({ deep: true })
    for (const diffId of diffIds) {
      const jimuLayerView = activeMapLayerViews.find(lv => lv.id === diffId)
      const jimuTable = activeMapTables.find(mt => mt.jimuTableId === diffId)
      let newDS
      if (jimuLayerView) {
        newDS = jimuLayerView.getLayerDataSource()
      } else if (jimuTable) {
        const layerDataSourceId = jimuMapView.getDataSourceIdByAPILayer(jimuTable.table)
        const tableDs = DataSourceManager.getInstance().getDataSource(layerDataSourceId)
        const mapDs = jimuMapView.getMapDataSource()
        newDS = tableDs
        if (!tableDs && mapDs) {
          newDS = await mapDs.createDataSourceByLayer(jimuTable.table)
        }
      }
      const useDataSource = getUseDs(newDS, true)
      if (add.includes(diffId)) {
        updatedUseDataSources = getUpdatedUseDataSources(updatedUseDataSources, 'add', useDataSource)
      } else if (remove.includes(diffId)) {
        updatedUseDataSources = getUpdatedUseDataSources(updatedUseDataSources, 'remove', useDataSource)
      }
    }
    onChange(activeMapViewId, mapViewConfig.set('customJimuLayerViewIds', newSelectedViewIds).set('layersConfig', newLayersConfig), updatedUseDataSources)
  }, [activeMapViewId, jimuMapViews, activeMapLayerViews, activeMapTables, propUseDataSources, mapViewsConfig, onChange])
  //#endregion

  //#region Layer order & config
  const informRuntime = React.useCallback((activeLayer: JimuLayerView | JimuTable, type: 'layerView' | 'table', jimuMapView?: JimuMapView) => {
    if (type === 'layerView') {
      const activeView = activeLayer as JimuLayerView
      const mapViewId = activeView.jimuMapViewId
      const layersConfig = mapViewsConfig[mapViewId].layersConfig
      const activeLayerDsId = activeView?.layerDataSourceId
      const layerConfig = layersConfig.find(l => l.id === activeLayerDsId)
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'activeTabId', value: layerConfig.id })
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'settingChangeTab', value: true })
    } else if (type === 'table') {
      const activeTable = activeLayer as JimuTable
      const jimuTableId = activeTable.jimuTableId
      const oriTable = activeTable.table
      const tableId = oriTable.id
      const mapViewId = jimuTableId.substring(0, jimuTableId.indexOf(tableId) - 1)
      const layersConfig = mapViewsConfig[mapViewId].layersConfig
      const activeTableDsId = jimuMapView.getDataSourceIdByAPILayer(oriTable)
      const layerConfig = layersConfig.find(l => l.id === activeTableDsId)
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'activeTabId', value: layerConfig.id })
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'settingChangeTab', value: true })
    }
  }, [mapViewsConfig, widgetId])

  // TODO table
  const handleLayerItemClick = React.useCallback((jlvId: string) => {
    for (const jimuMapView of jimuMapViews) {
      const jimuLayerViews = jimuMapView.getAllJimuLayerViews()
      const jimuTables = jimuMapView.getJimuTables()
      const activeView = jimuLayerViews.find(v => v.id === jlvId)
      const activeTable = jimuTables.find(t => t.jimuTableId === jlvId)
      if (activeView) {
        setActiveLayerView(activeView)
        informRuntime(activeView, 'layerView')
        break
      }
      if (activeTable) {
        setActiveLayerView(activeTable)
        informRuntime(activeTable, 'table', jimuMapView)
        break
      }
    }
  }, [jimuMapViews, informRuntime])

  const handleLayerReorder = React.useCallback((jmvId: string, itemsJson: TreeItemsType) => {
    const updatedUseDataSources = propUseDataSources.asMutable({ deep: true })
    const jimuMapView = jimuMapViews.find(jmv => jmv.id === jmvId)
    const jimuLayerViews = jimuMapView.jimuLayerViews
    const jimuTables = jimuMapView.jimuTables
    const newCustomJimuLayerViewIds = itemsJson.map(item => jimuLayerViews?.[item.itemKey]?.id || item.itemKey)
    const dsIds = itemsJson.map(item => {
      return jimuLayerViews?.[item.itemKey]?.layerDataSourceId || jimuMapView.getDataSourceIdByAPILayer(jimuTables?.[item.itemKey])
    })
    const newLayersConfig = mapViewsConfig[jmvId].layersConfig.asMutable({ deep: true })
    newLayersConfig.sort((a, b) => dsIds.indexOf(a.id) - dsIds.indexOf(b.id))
    const newMapViewConfig = mapViewsConfig[jmvId].set('layersConfig', newLayersConfig)
      .set('customJimuLayerViewIds', newCustomJimuLayerViewIds)
    onChange(jmvId, newMapViewConfig, updatedUseDataSources)
  }, [propUseDataSources, jimuMapViews, mapViewsConfig, onChange])

  // Due to the design of the layer-setting, clicking on the layer of another map does not trigger the change of activeMapView.
  // Therefore, the current mapViewId needs to be obtained separately here
  let mapViewId: string
  let activeLayerConfig: ImmutableObject<LayersConfig>
  const jimuMapView = jimuMapViews.find(jmv => (activeLayerView as JimuTable)?.jimuTableId?.includes(jmv.id))
  const activeLayerDsId = (activeLayerView as JimuLayerView)?.layerDataSourceId || jimuMapView?.getDataSourceIdByAPILayer((activeLayerView as JimuTable)?.table)
  const ds = getDataSourceById(activeLayerDsId)
  const dataSource = getTableDataSource(ds)
  if (activeLayerView && dataSource) {
    for (const [id, mapViewConfig] of Object.entries(mapViewsConfig)) {
      if (mapViewConfig.customizeLayers && mapViewConfig.customJimuLayerViewIds?.includes((activeLayerView as JimuLayerView)?.id || (activeLayerView as JimuTable)?.jimuTableId)) {
        const layerConfig = mapViewConfig?.layersConfig?.filter(l => l.id === activeLayerDsId)?.[0] ||
          Immutable(constructConfig(dataSource, true))
        mapViewId = id
        activeLayerConfig = layerConfig
        break
      }
    }
  }
  const isDsAutoRefresh = dataSource?.getAutoRefreshInterval() > 0
  const isEditableDs = dataSource?.url && dataSource?.dataViewId !== OUTPUT_DATA_VIEW_ID
  const layerDefinition = dataSource?.getLayerDefinition()
  const layerEditingEnabled = dataSource?.layer?.editingEnabled

  const handleLayerConfigChange = React.useCallback((layerConfig: ImmutableObject<LayersConfig>) => {
    let updatedUseDataSources = propUseDataSources.asMutable({ deep: true })
    const updateIndex = updatedUseDataSources.findIndex(useDs => useDs.dataSourceId === layerConfig.useDataSource?.dataSourceId)
    if (layerConfig.layerHonorMode === LayerHonorModeType.Custom) {
      const usedFields = layerConfig.tableFields.map(f => f.jimuName)
      updatedUseDataSources[updateIndex].fields = usedFields
      updatedUseDataSources[updateIndex].useFieldsInPopupInfo = false
    } else {
      updatedUseDataSources[updateIndex].fields = []
      updatedUseDataSources[updateIndex].useFieldsInPopupInfo = true
    }
    updatedUseDataSources = getUpdatedUseDataSources(updatedUseDataSources, 'update')
    const layersConfig = mapViewsConfig[mapViewId].layersConfig
    const activeIndex = layersConfig.findIndex(l => l.id === activeLayerDsId)
    const newLayersConfig = Immutable.set(layersConfig, activeIndex, layerConfig)
    const newMapViewConfig = mapViewsConfig[mapViewId].set('layersConfig', newLayersConfig)
    onChange(mapViewId, newMapViewConfig, updatedUseDataSources)
  }, [mapViewsConfig, mapViewId, activeLayerDsId, propUseDataSources, onChange])
  //#endregion

  return <SettingRow>
    <LayerSetting
      // Map items
      mapWidgetId={mapWidgetId}
      mapViewId={activeMapViewId}
      keepLastTimeMap={true}
      onMapItemClick={handleMapItemClick}
      // Layer custom
      isCustomizeEnabled={isCustomizeEnabled}
      showRuntimeAddedLayerOption={true}
      isShowRuntimeAddedLayerEnabled={displayRuntimeLayers}
      onShowRuntimeAddedLayersChange={onDisplayRuntimeLayers}
      selectedValues={selectedLayerViewIds}
      hideLayers={hideLayers}
      disableLayers={disableLayers}
      showTable={true}
      onToggleCustomize={handleToggleCustomize}
      onSelectedLayerIdChange={handleSelectedLayerIdChange}
      // Layer order & config
      showSelectedLayers={true}
      dndEnabled={true}
      onLayerItemClick={handleLayerItemClick}
      onLayerReorder={handleLayerReorder}
    >
      <LayerConfig
        widgetId={widgetId}
        config={config}
        layerConfig={activeLayerConfig}
        isMapMode={true}
        layerDefinition={layerDefinition}
        layerEditingEnabled={layerEditingEnabled}
        isDsAutoRefresh={isDsAutoRefresh}
        isEditableDs={isEditableDs}
        onChange={handleLayerConfigChange}
      />
    </LayerSetting>
    {mapEmpty &&
      <Alert tabIndex={0} type='warning' fullWidth open text={translate('noWebMapWebSceneTip')} />
    }
  </SettingRow>
}

export default TableMapLayers

function waitTime (ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

const getUpdatedUseDataSources = (useDataSources: UseDataSource[], type: 'add' | 'update' | 'remove', useDataSource?: UseDataSource) => {
  let updatedUseDataSources = useDataSources || []
  if (type === 'remove') {
    updatedUseDataSources = updatedUseDataSources.filter(item => item.dataSourceId !== useDataSource.dataSourceId)
  } else if (type === 'add' && useDataSource && !updatedUseDataSources.find(item => item.dataSourceId === useDataSource.dataSourceId)) {
    updatedUseDataSources = updatedUseDataSources.concat([useDataSource])
  } else if (type === 'update') {
    updatedUseDataSources = useDataSources
  }
  const empty = type === 'remove' ? [] : undefined
  return updatedUseDataSources.length > 0 ? updatedUseDataSources : empty
}
