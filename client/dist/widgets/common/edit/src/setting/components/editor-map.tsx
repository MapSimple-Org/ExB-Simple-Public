import { React, type ImmutableObject, type ImmutableArray, Immutable, ServiceManager, hooks } from 'jimu-core'
import type { JimuLayerView, JimuMapView } from 'jimu-arcgis'
import { Alert, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { LayerSetting, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { TreeItemsType } from 'jimu-ui/basic/list-tree'
import type { LayersConfig, MapViewConfig, MapViewsConfig } from '../../config'
import { constructConfig, getDataSourceById, getDsPrivileges, getEditDataSource, type SupportedDataSource } from '../../utils'
import { isSupportedJimuLayerView } from './utils'
import LayerConfig from './layer-config'

interface EditorMapProps {
  useMapWidgetIds: ImmutableArray<string>
  mapEmpty: boolean
  jimuMapViews: JimuMapView[]
  mapViewsConfig: ImmutableObject<MapViewsConfig>
  batchEditing: boolean
  onChange: (mapViewId: string, mapViewConfig: ImmutableObject<MapViewConfig>) => void
}

const EditorMap = (props: EditorMapProps) => {
  const { useMapWidgetIds, mapEmpty, jimuMapViews, mapViewsConfig, batchEditing, onChange } = props

  const [activeMapViewId, setActiveMapViewId] = React.useState<string>(null)
  const [activeLayerView, setActiveLayerView] = React.useState<JimuLayerView>(null)
  const [activeMapLayerViews, setActiveMapLayerViews] = React.useState<JimuLayerView[]>([])
  const [layerViewLoading, setLayerViewLoading] = React.useState<boolean>(false)

  const translate = hooks.useTranslation(jimuUIMessages)

  //#region Map items
  const mapWidgetId = useMapWidgetIds?.[0]
  const handleMapItemClick = React.useCallback(async (dsId: string) => {
    const mapViewId = `${mapWidgetId}-${dsId}`
    setActiveMapViewId(mapViewId)
    setLayerViewLoading(true)
    const jimuMapView = jimuMapViews.find(jmv => jmv.id === mapViewId)
    const layerViews = jimuMapView.getAllJimuLayerViews()
    let activeMapLayerViews = Object.values(layerViews).filter(layerView => {
      return !layerView.fromRuntime && isSupportedJimuLayerView(layerView)
    })
    const serviceManager = ServiceManager.getInstance()
    const promises = activeMapLayerViews.map(async (layerView) => {
      const ds = await layerView.createLayerDataSource()
      await serviceManager.fetchArcGISServerInfo(layerView.layer.url)
      return ds ? layerView : null
    })
    try {
      activeMapLayerViews = (await Promise.all(promises)).filter(v => !!v)
    } catch (e) {
      // some SceneLayer can't create data source, it is as expected, just log it
      console.log(e)
    }
    // https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/17175
    if (!jimuMapView.isActive) {
      await waitTime(500)
    }

    activeMapLayerViews = activeMapLayerViews.filter(layerView => {
      const layerDs = layerView.getLayerDataSource() as SupportedDataSource
      const layerDefinition = layerDs?.getLayerDefinition?.()
      const {create, update, deletable} = getDsPrivileges(layerDefinition)
      const serverInfo = serviceManager.getServerInfoByServiceUrl(layerView.layer.url)
      const isHosted = !serverInfo || serverInfo.owningSystemUrl
      return !(!isHosted && !create && !update && !deletable)
    })
    setActiveMapLayerViews(activeMapLayerViews)
    setLayerViewLoading(false)
  }, [jimuMapViews, mapWidgetId])
  //#endregion

  //#region Layer custom
  const isCustomizeEnabled = !!mapViewsConfig[activeMapViewId]?.customizeLayers

  const selectedLayerViewIds = React.useMemo(() => {
    const layerIds = {}
    for (const [mapViewId, config] of Object.entries(mapViewsConfig || {})) {
      if (config.customizeLayers) {
        layerIds[mapViewId] = config.customJimuLayerViewIds || []
      }
    }
    return layerIds
  }, [mapViewsConfig])

  const allAvailableLayerViewIds = React.useMemo(() => {
    const layerViewIds: string[] = []
    activeMapLayerViews.forEach(layerView => {
      layerViewIds.push(layerView.id)
      const ancestorLayerViews = layerView.getAllAncestorJimuLayerViews()
      ancestorLayerViews.forEach(ancestorLayerView => {
        layerViewIds.push(ancestorLayerView.id)
      })
    })
    return layerViewIds
  }, [activeMapLayerViews])

  const handleToggleCustomize = React.useCallback((checked: boolean) => {
    const mapViewConfig: ImmutableObject<MapViewConfig> = mapViewsConfig[activeMapViewId] || Immutable({customizeLayers: false})
    if (checked) {
      const customJimuLayerViewIds = []
      const layersConfig = [] as LayersConfig[]
      for (const layerView of activeMapLayerViews) {
        const layerDs = layerView.getLayerDataSource() as SupportedDataSource
        if (!layerDs) continue
        const layerConfig = constructConfig(layerDs, layerView.layer)
        layersConfig.push(layerConfig)
        customJimuLayerViewIds.push(layerView.id)
      }
      onChange(activeMapViewId, mapViewConfig.set('customizeLayers', true).set('customJimuLayerViewIds', customJimuLayerViewIds).set('layersConfig', layersConfig))
    } else {
      onChange(activeMapViewId, mapViewConfig.set('customizeLayers', false).set('customJimuLayerViewIds', []).set('layersConfig', []))
    }
  }, [mapViewsConfig, activeMapViewId, activeMapLayerViews, onChange])

  const hideLayers = React.useCallback((jimuLayerView: JimuLayerView) => {
    return !allAvailableLayerViewIds.includes(jimuLayerView.id)
  }, [allAvailableLayerViewIds])

  const disableLayers = React.useCallback((jimuLayerView: JimuLayerView) => {
    return !activeMapLayerViews.includes(jimuLayerView)
  }, [activeMapLayerViews])

  const handleSelectedLayerIdChange = React.useCallback((layerViewIds: string[]) => {
    const mapViewConfig = mapViewsConfig[activeMapViewId]
    const layersConfig = mapViewConfig.layersConfig
    const dsIds = layerViewIds.map(layerViewId => activeMapLayerViews.find(v => v.id === layerViewId)?.layerDataSourceId)
    let newLayersConfig = layersConfig.filter(l => dsIds.includes(l.id))
    const oldDsIds = layersConfig.map(c => c.id)
    for (const layerViewId of layerViewIds) {
      try {
        const layerView = activeMapLayerViews.find(v => v.id === layerViewId)
        if (!layerView || oldDsIds.includes(layerView.layerDataSourceId)) continue
        const layerDs = layerView.getLayerDataSource() as SupportedDataSource
        if (!layerDs) continue
        newLayersConfig = newLayersConfig.concat(constructConfig(layerDs, layerView.layer))
      } catch {
        continue
      }
    }
    onChange(activeMapViewId, mapViewConfig.set('customJimuLayerViewIds', layerViewIds).set('layersConfig', newLayersConfig))
  }, [mapViewsConfig, activeMapViewId, onChange, activeMapLayerViews])
  //#endregion

  //#region Layer order & config
  const handleLayerItemClick = React.useCallback((jlvId: string) => {
    for (const jimuMapView of jimuMapViews) {
      const jimuLayerViews = jimuMapView.getAllJimuLayerViews()
      const activeLayerView = jimuLayerViews.find(v => v.id === jlvId)
      if (activeLayerView) {
        setActiveLayerView(activeLayerView)
        break
      }
    }
  }, [jimuMapViews])

  const handleLayerReorder = React.useCallback((jmvId: string, itemsJson: TreeItemsType) => {
    const jimuMapView = jimuMapViews.find(jmv => jmv.id === jmvId)
    const newCustomJimuLayerViewIds = itemsJson.map(item => jimuMapView.jimuLayerViews?.[item.itemKey]?.id)
    const dsIds = itemsJson.map(item => jimuMapView.jimuLayerViews?.[item.itemKey]?.layerDataSourceId)
    const newLayersConfig = mapViewsConfig[jmvId].layersConfig.asMutable({ deep: true })
    newLayersConfig.sort((a, b) => dsIds.indexOf(a.id) - dsIds.indexOf(b.id))
    const newMapViewConfig = mapViewsConfig[jmvId].set('layersConfig', newLayersConfig)
      .set('customJimuLayerViewIds', newCustomJimuLayerViewIds)
    onChange(jmvId, newMapViewConfig)
  }, [onChange, jimuMapViews, mapViewsConfig])

  let mapViewId: string
  let activeLayerConfig: ImmutableObject<LayersConfig>
  const activeLayerDsId = activeLayerView?.layerDataSourceId
  const ds = getDataSourceById(activeLayerDsId)
  const dataSource = getEditDataSource(ds)
  if (activeLayerView && dataSource) {
    for (const [id, mapViewConfig] of Object.entries(mapViewsConfig)) {
      if (mapViewConfig.customizeLayers && mapViewConfig.customJimuLayerViewIds?.includes(activeLayerView?.id)) {
        const layerConfig = mapViewConfig?.layersConfig?.filter(l => l.id === activeLayerDsId)?.[0] ||
          Immutable(constructConfig(dataSource, activeLayerView?.layer))
        mapViewId = id
        activeLayerConfig = layerConfig
        break
      }
    }
  }
  const layerDefinition = dataSource?.getLayerDefinition()
  const layerEditingEnabled = dataSource?.layer?.editingEnabled

  const handleLayerConfigChange = React.useCallback((layerConfig: ImmutableObject<LayersConfig>) => {
    const layersConfig = mapViewsConfig[mapViewId].layersConfig
    const activeIndex = layersConfig.findIndex(l => l.id === activeLayerDsId)
    const newLayersConfig = Immutable.set(layersConfig, activeIndex, layerConfig)
    const newMapViewConfig = mapViewsConfig[mapViewId].set('layersConfig', newLayersConfig)
    onChange(mapViewId, newMapViewConfig)
  }, [mapViewsConfig, mapViewId, onChange, activeLayerDsId])
  //#endregion

  return <SettingRow>
    {!mapEmpty && <LayerSetting
      // Map items
      mapWidgetId={mapWidgetId}
      mapViewId={activeMapViewId}
      keepLastTimeMap={true}
      isJlvLoading={layerViewLoading}
      onMapItemClick={handleMapItemClick}
      // Layer custom
      isCustomizeEnabled={isCustomizeEnabled}
      selectedValues={selectedLayerViewIds}
      hideLayers={hideLayers}
      disableLayers={disableLayers}
      isShowRuntimeAddedLayerEnabled={false}
      showRuntimeAddedLayerOption={false}
      showTable={false}
      onToggleCustomize={handleToggleCustomize}
      onSelectedLayerIdChange={handleSelectedLayerIdChange}
      // Layer order & config
      showSelectedLayers={true}
      dndEnabled={true}
      onLayerItemClick={handleLayerItemClick}
      onLayerReorder={handleLayerReorder}
    >
      <LayerConfig
        layerConfig={activeLayerConfig}
        isGeoMode={true}
        layerDefinition={layerDefinition}
        layerEditingEnabled={layerEditingEnabled}
        batchEditing={batchEditing}
        onChange={handleLayerConfigChange}
      />
    </LayerSetting>}
    {mapEmpty &&
      <Alert tabIndex={0} type='warning' fullWidth open text={translate('noWebMapWebSceneTip')} />
    }
  </SettingRow>
}

export default EditorMap

function waitTime (ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
