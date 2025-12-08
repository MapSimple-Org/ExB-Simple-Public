import type { JimuLayerViews, JimuLayerView } from 'jimu-arcgis'
import { DataSourceManager, JSAPILayerTypes, DataSourceTypes } from 'jimu-core'

/**
 * Determines whether two arrays have the same values, but not necessarily in the same order.
 * Note: This method is suitable only for small arrays.
 * @param a The first array.
 * @param b The second array.
 * @returns Returns true if the values in both arrays are equal, otherwise returns false.
 */
export const arraysEqual = (a, b): boolean => {
  if (a?.length !== b?.length) {
    return false
  }
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) {
      return false
    }
  }
  return true
}

/**
 * Get jimuMapViewId using mapWidgetId and dataSourceId.
 * Note: This rule refers to createJimuMapView method in MapViewManager.
 */
export const getJimuMapViewId = (mapWidgetId: string, dataSourceId: string): string => {
  return mapWidgetId + '-' + dataSourceId
}

/**
 * Determine whether the layer is need to be disabled in jimuLayerViewSelector.
 * Note: Swipe API does not support for group layer.
 */
export const isLayersDisabled = (jimuLayerView: JimuLayerView): boolean => {
  return jimuLayerView.type === JSAPILayerTypes.GroupLayer
}

/**
 * Determine whether the layer is need to be hidden in jimuLayerViewSelector.
 * Note: Swipe API does not support for below layer types:
 *    1. subLayers that don't have view: subLayers of Map service Layer(MapImageLayer, TileLayer, WMSLayer), subLayers of KMLLayer.
 *    2. subtype-sublayer
 */
export const isLayersHidden = (jimuLayerView: JimuLayerView, jimuLayerViews: JimuLayerViews): boolean => {
  return jimuLayerView.type === JSAPILayerTypes.SubtypeSublayer || subLayersHaveNoView(jimuLayerView, jimuLayerViews)
}

const subLayersHaveNoView = (jimuLayerView: JimuLayerView, jimuLayerViews: JimuLayerViews) => {
  if (jimuLayerView.parentJimuLayerViewId) {
    return isSubLayerOfSomeTypeLayer(jimuLayerView, jimuLayerViews)
  } else {
    return false
  }
}

const isSubLayerOfSomeTypeLayer = (jimuLayerView: JimuLayerView, jimuLayerViews: JimuLayerViews) => {
  if (jimuLayerView.parentJimuLayerViewId) {
    return isSubLayerOfSomeTypeLayer(jimuLayerViews[jimuLayerView.parentJimuLayerViewId], jimuLayerViews)
  } else {
    const isSomeTypeLayer = jimuLayerView.type === JSAPILayerTypes.MapImageLayer || jimuLayerView.type === JSAPILayerTypes.TileLayer || jimuLayerView.type === JSAPILayerTypes.WMSLayer || jimuLayerView.type === JSAPILayerTypes.KMLLayer
    return isSomeTypeLayer
  }
}

/**
 * Determine whether the data source is a webMap or a webScene.
 * @param dataSourceId
 * @returns boolean
 */
export const isWebMap = (dataSourceId: string) => {
  return DataSourceManager.getInstance().getDataSource(dataSourceId)?.type === DataSourceTypes.WebMap
}

/**
 * Get the name of the data source.
 * @param dataSourceId
 * @returns string
 */
export const getDataSourceLabel = (dataSourceId: string): string => {
  if (!dataSourceId) {
    return ''
  }
  const dsObj = DataSourceManager.getInstance().getDataSource(dataSourceId)
  const label = dsObj?.getLabel()
  return label || dsObj?.getDataSourceJson().sourceLabel || dataSourceId
}
