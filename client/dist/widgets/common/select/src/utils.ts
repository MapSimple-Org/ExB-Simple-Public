import { type ImmutableArray, type UseDataSource, DataSourceTypes, Immutable, getAppStore, type ImmutableObject, type WidgetJson, type IMState, AppMode, JSAPILayerTypes } from 'jimu-core'
import type { JimuMapView, JimuLayerView } from 'jimu-arcgis'
import type { DataSourceItem, IMConfig } from './config'

export const SUPPORTED_DATA_SOURCE_TYPES: DataSourceTypes[] = [
  DataSourceTypes.FeatureLayer,
  DataSourceTypes.SceneLayer,
  DataSourceTypes.BuildingComponentSubLayer,
  DataSourceTypes.OrientedImageryLayer,
  DataSourceTypes.ImageryLayer,
  DataSourceTypes.SubtypeGroupLayer,
  DataSourceTypes.SubtypeSublayer
]

export const IM_SUPPORTED_DATA_SOURCE_TYPES = Immutable(SUPPORTED_DATA_SOURCE_TYPES)

export function isSupportedDataSourceType (dsType: string): boolean {
  return SUPPORTED_DATA_SOURCE_TYPES.includes(dsType as DataSourceTypes)
}

export const SUPPORTED_JIMU_LAYERVIEW_TYPES: string[] = [
  JSAPILayerTypes.FeatureLayer,
  JSAPILayerTypes.SceneLayer,
  JSAPILayerTypes.BuildingComponentSublayer,
  JSAPILayerTypes.OrientedImageryLayer,
  JSAPILayerTypes.ImageryLayer,
  JSAPILayerTypes.SubtypeGroupLayer,
  JSAPILayerTypes.SubtypeSublayer
]

export function isSupportedJimuLayerView (jimuLayerView: JimuLayerView): boolean {
  if (!jimuLayerView || !jimuLayerView.type) {
    return false
  }

  const viewType = jimuLayerView.type

  // Some BuildingComponentSublayer doesn't have layer view, so need to check jimuLayerView.view here.
  // Note, we only check jimuLayerView for BuildingComponentSublayer and don't need to check jimuLayerView.view if layer is not BuildingComponentSublayer because sub feature layer doesn't have layer view.
  const isViewPass = (viewType !== JSAPILayerTypes.BuildingComponentSublayer) || (viewType === JSAPILayerTypes.BuildingComponentSublayer && jimuLayerView.view)
  const isValid = SUPPORTED_JIMU_LAYERVIEW_TYPES.includes(viewType) && isViewPass
  return !!isValid
}

export function getConfigWithValidDataSourceItems (config: IMConfig, useDataSources: ImmutableArray<UseDataSource>): IMConfig {
  if (config) {
    // filter config.dataAttributeInfo?.dataSourceItems by useDataSourceIds
    if (!config.useMap && config.dataAttributeInfo?.dataSourceItems?.length > 0) {
      const originalDataSourceItems = config.dataAttributeInfo?.dataSourceItems
      const validDataSourceItems = getValidDataSourceItems(originalDataSourceItems, useDataSources)

      if (validDataSourceItems && validDataSourceItems !== originalDataSourceItems) {
        config = config.setIn(['dataAttributeInfo', 'dataSourceItems'], validDataSourceItems)
      }
    }
  }

  return config
}

export function getValidDataSourceItems (dataSourceItems: ImmutableArray<DataSourceItem>, useDataSources: ImmutableArray<UseDataSource>): ImmutableArray<DataSourceItem> {
  let validDataSourceItems: ImmutableArray<DataSourceItem> = dataSourceItems

  // dataSourceItems maybe null
  if (dataSourceItems && dataSourceItems.length > 0) {
    // get useDataSourceIds by useDataSources
    const useDataSourceIds: string[] = []

    if (useDataSources && useDataSources.length > 0) {
      useDataSources.forEach(imUseDataSource => {
        const dataSourceId = imUseDataSource?.dataSourceId

        if (dataSourceId) {
          useDataSourceIds.push(dataSourceId)
        }
      })
    }

    // filter dataSourceItems by useDataSourceIds
    let isNewDataSourceItemsChanged = false

    const newDataSourceItems: ImmutableArray<DataSourceItem> = dataSourceItems.filter(imDataSourceItem => {
      const useDataSource = imDataSourceItem?.useDataSource
      const dataSourceId = useDataSource?.dataSourceId
      const isValid = dataSourceId && useDataSourceIds.includes(dataSourceId)

      if (!isValid) {
        isNewDataSourceItemsChanged = true
      }

      return isValid
    })

    if (isNewDataSourceItemsChanged) {
      validDataSourceItems = newDataSourceItems
    } else {
      validDataSourceItems = dataSourceItems
    }
  }

  if (!validDataSourceItems) {
    validDataSourceItems = dataSourceItems
  }

  return validDataSourceItems
}

export function getFinalAllowGeneratedForMap (syncWithMap: boolean, allowGenerated: boolean): boolean {
  // If syncWithMap is true, allowGenerated must be true.
  if (syncWithMap) {
    return true
  } else {
    return allowGenerated
  }
}

export function getFinalEnableAttributeSelectionForMap (syncWithMap: boolean, enableAttributeSelection: boolean): boolean {
  // If syncWithMap is true, enableAttributeSelection must be false.
  if (syncWithMap) {
    return false
  } else {
    return enableAttributeSelection
  }
}

/**
 * Sort DataSourceItems by layers order.
 * @param jimuMapView
 * @param dataSourceItems
 * @returns
 */
export function sortDataSourceItemsByLayersOrder (jimuMapView: JimuMapView, dataSourceItems: DataSourceItem[]): DataSourceItem[] {
  const sortedDataSourceItems = dataSourceItems.slice()

  if (jimuMapView) {
    sortedDataSourceItems.sort((dataSourceItem1, dataSourceItem2) => {
      const hierarchyLevel1 = getJimuLayerViewHierarchyLevelByDataSourceItem(jimuMapView, dataSourceItem1)
      const hierarchyLevel2 = getJimuLayerViewHierarchyLevelByDataSourceItem(jimuMapView, dataSourceItem2)

      if (hierarchyLevel1 && hierarchyLevel2) {
        return compareVersion(hierarchyLevel1, hierarchyLevel2)
      }

      return 0
    })
  }

  return sortedDataSourceItems
}

function getJimuLayerViewHierarchyLevelByDataSourceItem (jimuMapView: JimuMapView, dataSourceItem: DataSourceItem): string {
  let jimuLayerViewLevel = ''

  if (jimuMapView && dataSourceItem) {
    const jimuLayerViewId = dataSourceItem.jimuLayerViewId

    if (jimuLayerViewId) {
      const jimuLayerView = jimuMapView.jimuLayerViews[jimuLayerViewId]

      if (jimuLayerView) {
        jimuLayerViewLevel = jimuLayerView.hierarchyLevel
      }
    }
  }

  return jimuLayerViewLevel
}

/**
 * If version1 < version2, return -1.
 * If version1 > version2, return 1.
 * If version1 == version2, return 0.
 * @param version1 like '0.3.4'
 * @param version2 like '1.4.5.3'
 * @returns
 */
function compareVersion (version1: string, version2: string) {
  const nums1 = version1.split('.').map(item => parseInt(item))
  const nums2 = version2.split('.').map(item => parseInt(item))

  while (nums1.length > 0 && nums2.length > 0) {
    const num1 = nums1.shift()
    const num2 = nums2.shift()

    if (num1 < num2) {
      return -1
    } else if (num1 > num2) {
      return 1
    }
  }

  if (nums1.length > 0) {
    return 1
  }

  if (nums2.length > 0) {
    return -1
  }

  return 0
}

export function getNeverRejectPromise (promise: Promise<any>): Promise<any> {
  return new Promise((resolve) => {
    promise.then((result) => {
      resolve(result)
    }).catch(() => {
      resolve(null)
    })
  })
}

export function getAppConfig () {
  return window.jimuConfig.isBuilder ? getAppStore().getState()?.appStateInBuilder?.appConfig : getAppStore().getState()?.appConfig
}

export function getWidgetJson (widgetId: string): ImmutableObject<WidgetJson> {
  if (!widgetId) {
    return null
  }

  const appConfig = getAppConfig()
  return appConfig?.widgets?.[widgetId]
}

export function getRuntimeState (): IMState {
  return window.jimuConfig?.isBuilder ? getAppStore().getState().appStateInBuilder : getAppStore().getState()
}

export function isExpressMode (): boolean {
  const runtimeState = getRuntimeState()
  const isExpressMode = runtimeState?.appRuntimeInfo?.appMode === AppMode.Express
  return isExpressMode
}
