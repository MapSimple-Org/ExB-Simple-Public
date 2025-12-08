import { DataSourceManager, SupportedJSAPILayerTypes, type ImmutableArray, type DataRecordSet } from 'jimu-core'
import { MapViewManager, type JimuLayerView, type JimuLayerViews, type JimuMapView } from 'jimu-arcgis'
import type { IMCustomizeLayerOptions } from './config'

export const getImageryComponentsAssetsPath = (widgetUrl: string): string => {
  return `${widgetUrl}dist/imagery-components-assets/assets`
}

export const isQualifiedLayer = (layer: __esri.Layer): boolean => {
  const isDynamicImageryLayer = layer?.type === SupportedJSAPILayerTypes.ImageryLayer
  if(!isDynamicImageryLayer) {
    return false
  }

  const { capabilities } = (layer as __esri.ImageryLayer).sourceJSON || {}
  return (
    typeof capabilities === "string" &&
    capabilities
      .split(",")
      .map((c) => c.trim())
      .includes("Catalog")
  )
}

export const getActionDataSets = async (layer: __esri.Layer, jimuMapView: JimuMapView): Promise<DataRecordSet[]> => {
  if (!layer || !jimuMapView) return []

  await jimuMapView.view.whenLayerView(layer)
  const jimuLyrView = jimuMapView.getJimuLayerViewByAPILayer(layer)

  if (!jimuLyrView?.layerDataSourceId) return []

  const dataSource = DataSourceManager.getInstance().getDataSource(jimuLyrView.layerDataSourceId)
  if (!dataSource) return []

  const dataSets = [{
    dataSource,
    records: [],
    name: dataSource.getLabel?.() ?? layer.title
  }]
  return dataSets
}

export const isMapWidgetDataSourceEmpty = (mapWidgetId: string): boolean => {
  if (!mapWidgetId) {
    return true
  }
  const mapViews = MapViewManager.getInstance().getJimuMapViewGroup(mapWidgetId)?.jimuMapViews
  if (!mapViews) {
    return true
  }
  const isEmpty = (Object.keys(mapViews).length === 1 && !Object.values(mapViews)?.[0]?.dataSourceId)
  return isEmpty
}

export const getJimuMapViewId = (widgetId: string = '', dataSourceId: string = ''): string => {
  return `${widgetId}-${dataSourceId}`
}

export const getLayerViewIds = async (jimuMapViewId: string, customizeLayersOptions: IMCustomizeLayerOptions): Promise<string[]> => {
  if (!jimuMapViewId) {
    return []
  }
  const isCustomized = isCustomizeLayersEnabled(jimuMapViewId, customizeLayersOptions)
  return isCustomized ? getCustomizedLayerViewIds(jimuMapViewId, customizeLayersOptions) : getQualifiedLayerViewIds(jimuMapViewId)
}

export const shouldHideLayer = (jimuLayerView: JimuLayerView): boolean => {
  return !isQualifiedLayer(jimuLayerView.layer)
}

export const getDataSourceLabel = (dataSourceId: string = ''): string => {
  const dataSource = DataSourceManager.getInstance().getDataSource(dataSourceId)
  return dataSource?.getLabel() ?? dataSource?.getDataSourceJson().sourceLabel ?? dataSourceId
}

export const isCustomizeLayersEnabled = (jimuMapViewId: string, customizeLayersOptions: IMCustomizeLayerOptions): boolean =>
  customizeLayersOptions?.[jimuMapViewId]?.isEnabled || false

export const getInCustomizedLayerViewIds = (jimuMapViewId: string, customizeLayersOptions: IMCustomizeLayerOptions): ImmutableArray<string> =>
  customizeLayersOptions?.[jimuMapViewId]?.selectedLayerViewIds

export const getJimuLayerViews = async (jimuMapViewId: string): Promise<JimuLayerViews> => {
  if (!jimuMapViewId) {
    return {}
  }
  const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapViewId)
  await jimuMapView?.whenJimuMapViewLoaded()
  return jimuMapView?.jimuLayerViews ?? {}
}

export const getCustomizedLayerViewIds = async (jimuMapViewId: string, customizeLayersOptions: IMCustomizeLayerOptions): Promise<string[]> => {
  const configLayerViewIds = getInCustomizedLayerViewIds(jimuMapViewId, customizeLayersOptions)
  const qualifiedLayerViewIds = await getQualifiedLayerViewIds(jimuMapViewId)
  const customizedLayerViewIds = qualifiedLayerViewIds.filter((layerViewId) => configLayerViewIds.includes(layerViewId))
  return customizedLayerViewIds
}

export const getQualifiedLayerViewIds = async (jimuMapViewId: string): Promise<string[]> => {
  const layerViews = await getJimuLayerViews(jimuMapViewId)
  const allLayerViewIds = Object.keys(layerViews)
  await Promise.allSettled(allLayerViewIds.map((layerViewId) => layerViews[layerViewId].layer.load()))
  const qualifiedLayerViewIds = allLayerViewIds.filter((layerViewId) => isQualifiedLayer(layerViews[layerViewId].layer))
  return qualifiedLayerViewIds
}