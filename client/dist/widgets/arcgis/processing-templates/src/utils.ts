import { DataSourceManager, SupportedJSAPILayerTypes, urlUtils, type DataRecordSet, type ImmutableArray } from 'jimu-core'
import { MapViewManager, type JimuMapView, type JimuLayerViews, type JimuLayerView } from 'jimu-arcgis'
import type { QualifiedLayer, IMCustomizeLayerOptions } from './config'

export const getImageryComponentsAssetsPath = (): string => {
  const rootPath = `${window.location.protocol}//${window.location.host}${urlUtils.getFixedRootPath()}`
  const widgetUrl = `${rootPath}widgets/arcgis/processing-templates/`
  return `${widgetUrl}dist/imagery-components-assets/assets`
}

export const isQualifiedLayer = (layer: __esri.Layer): boolean => {
  const { type } = layer
  const isDynamicImageryLayer = type === SupportedJSAPILayerTypes.ImageryLayer
  const isImageryTileLayer = type === SupportedJSAPILayerTypes.ImageryTileLayer
  // @ts-expect-error
  const isRasterFunctionAllowed = !!layer?.sourceJSON?.allowRasterFunction
  return (isDynamicImageryLayer && isRasterFunctionAllowed) || isImageryTileLayer
}

export const getActionDataSets = async (layer: __esri.Layer, jimuMapView: JimuMapView): Promise<DataRecordSet[]> => {
  if (!layer || !jimuMapView) {
    return []
  }
  await jimuMapView.view.whenLayerView(layer)
  const jimuLyrView = jimuMapView.getJimuLayerViewByAPILayer(layer)
  if (!jimuLyrView?.layerDataSourceId) {
    return []
  }

  const dataSource = DataSourceManager.getInstance().getDataSource(jimuLyrView.layerDataSourceId)
  if (!dataSource) {
    return []
  }

  const dataSets = [{
    dataSource,
    records: [],
    name: dataSource.getLabel?.() ?? layer.title
  }]
  return dataSets
}

export const getJimuLayerViews = async (jimuMapViewId: string): Promise<JimuLayerViews> => {
  if (!jimuMapViewId) {
    return {}
  }
  const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapViewId)
  await jimuMapView?.whenJimuMapViewLoaded()
  return jimuMapView?.jimuLayerViews ?? {}
}

export const getLayerList = async (jimuMapViewId: string, customizeLayersOptions: IMCustomizeLayerOptions): Promise<QualifiedLayer[]> => {
  if (!jimuMapViewId) {
    return []
  }
  const isCustomized = isCustomizeLayersEnabled(jimuMapViewId, customizeLayersOptions)
  return isCustomized ? getCustomizedLayerList(jimuMapViewId, customizeLayersOptions) : getQualifiedLayerList(jimuMapViewId)
}

export const getLayerViewIds = async (jimuMapViewId: string, customizeLayersOptions: IMCustomizeLayerOptions): Promise<string[]> => {
  if (!jimuMapViewId) {
    return []
  }
  const isCustomized = isCustomizeLayersEnabled(jimuMapViewId, customizeLayersOptions)
  return isCustomized ? getCustomizedLayerViewIds(jimuMapViewId, customizeLayersOptions) : getQualifiedLayerViewIds(jimuMapViewId)
}

export const getCustomizedLayerList = async (jimuMapViewId: string, customizeLayersOptions: IMCustomizeLayerOptions): Promise<QualifiedLayer[]> => {
  const layerViews = await getJimuLayerViews(jimuMapViewId)
  const customizedLayerViewIds = await getCustomizedLayerViewIds(jimuMapViewId, customizeLayersOptions)
  const customizedLayerList = customizedLayerViewIds.map((layerViewId) => layerViews[layerViewId].layer)
  return customizedLayerList
}

export const getQualifiedLayerList = async (jimuMapViewId: string): Promise<QualifiedLayer[]> => {
  const layerViews = await getJimuLayerViews(jimuMapViewId)
  const qalifiedLayerViewIds = await getQualifiedLayerViewIds(jimuMapViewId)
  const qalifiedLayers = qalifiedLayerViewIds.map((layerViewId) => layerViews[layerViewId].layer)
  return qalifiedLayers
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

export const shouldHideLayer = (jimuLayerView: JimuLayerView): boolean => {
  return !isQualifiedLayer(jimuLayerView.layer)
}

export const getDataSourceLabel = (dataSourceId: string = ''): string => {
  const dataSource = DataSourceManager.getInstance().getDataSource(dataSourceId)
  return dataSource?.getLabel() ?? dataSource?.getDataSourceJson().sourceLabel ?? dataSourceId
}

export const isCustomizeLayersEnabled = (jimuMapViewId: string, customizeLayersOptions: IMCustomizeLayerOptions): boolean =>
  customizeLayersOptions?.[jimuMapViewId]?.isEnabled ?? false

export const getInCustomizedLayerViewIds = (jimuMapViewId: string, customizeLayersOptions: IMCustomizeLayerOptions): ImmutableArray<string> =>
  customizeLayersOptions?.[jimuMapViewId]?.selectedLayerViewIds

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
