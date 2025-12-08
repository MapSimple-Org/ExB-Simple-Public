import type { AllWidgetSettingProps } from 'jimu-for-builder'
import type { DataSourceItem, IMConfig } from '../config'
import { getAppStore, type IMAppConfig, type UseDataSource, DataSourceTypes, DataSourceManager, type ImmutableArray } from 'jimu-core'

export type RootSettingProps = AllWidgetSettingProps<IMConfig>

export function getUseDataSourcesByConfig (config: IMConfig): UseDataSource[] {
  // tempUseDataSources maybe has repeated data sources
  const tempUseDataSources: UseDataSource[] = []

  if (config.dataAttributeInfo && config.dataAttributeInfo.dataSourceItems && config.dataAttributeInfo.dataSourceItems.length > 0) {
    config.dataAttributeInfo.dataSourceItems.forEach(item => {
      const useDataSource = item.useDataSource.asMutable() as unknown as UseDataSource
      tempUseDataSources.push(useDataSource)
    })
  }

  // Saving config.mapInfo.[jimuMapViewId] useDataSources into widgetJson.useDataSources doesn't cause performance issues
  // because JimuLayerView doesn't automatically create dataSource and Select widget only creates data sources on-demand.
  if (config.mapInfo) {
    Object.values(config.mapInfo).forEach(jimuMapViewConfigInfo => {
      const dataSourceItems = jimuMapViewConfigInfo?.dataSourceItems

      // jimuMapViewConfigInfo.dataSourceItems is undefined if jimuMapViewConfigInfo.syncWithMap is true, so we need to check dataSourceItems is empty or not here.
      if (dataSourceItems && dataSourceItems.length > 0) {
        dataSourceItems.forEach(item => {
          if (item?.useDataSource) {
            const useDataSource = item.useDataSource.asMutable() as unknown as UseDataSource
            tempUseDataSources.push(useDataSource)
          }
        })
      }
    })
  }

  if (config.spatialSelection && config.spatialSelection.useDataSources && config.spatialSelection.useDataSources.length > 0) {
    config.spatialSelection.useDataSources.forEach(item => {
      const useDataSource = item.asMutable() as unknown as UseDataSource
      tempUseDataSources.push(useDataSource)
    })
  }

  // remove repeated data sources
  const finalDataSourceIds: string[] = []
  const finalUseDataSources: UseDataSource[] = []
  tempUseDataSources.forEach(useDataSource => {
    const dataSourceId = useDataSource.dataSourceId

    if (!finalDataSourceIds.includes(dataSourceId)) {
      finalDataSourceIds.push(dataSourceId)
      finalUseDataSources.push(useDataSource)
    }
  })

  if (finalUseDataSources.length === 0 && config.useMap) {
    // follow this rule - https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/21494#issuecomment-5028453
    return undefined
  }

  return finalUseDataSources
}

export function getRuntimeAppConfig (): IMAppConfig {
  return window.jimuConfig.isBuilder ? getAppStore().getState().appStateInBuilder?.appConfig : getAppStore().getState().appConfig
}

/**
 * There are some rules for valid config.dataAttributeInfo.dataSourceItems.
 * 1. config.dataAttributeInfo.dataSourceItems should not have duplicate items.
 * 2. SubtypeGrouplayer and SubtypeSublayer are mutually exclusive.
 * @param dataSourceItems
 * @param newUseDataSource
 * @returns
 */
export function checkIsValidNewUseDataSourceForDataAttributeInfo (dataSourceItems: ImmutableArray<DataSourceItem>, newUseDataSource: UseDataSource): boolean {
  if (!newUseDataSource) {
    return false
  }

  const configDataSourceItems = dataSourceItems.filter(dataSourceItem => !!dataSourceItem?.useDataSource)

  if (configDataSourceItems.length === 0) {
    return true
  }

  const existingDataSourceItem = configDataSourceItems.find((dataSourceItem) => {
    // We check both dataSourceId and mainDataSourceId to make sure to exclude views.
    return dataSourceItem.useDataSource.dataSourceId === newUseDataSource.dataSourceId || dataSourceItem.useDataSource.mainDataSourceId === newUseDataSource.mainDataSourceId
  })

  if (existingDataSourceItem) {
    return false
  }

  const dsManager = DataSourceManager.getInstance()
  const newMainDs = dsManager.getDataSource(newUseDataSource.mainDataSourceId)

  // SubtypeGrouplayer and SubtypeSublayer are mutually exclusive.
  if (newMainDs) {
    if (newMainDs.type === DataSourceTypes.SubtypeGroupLayer) {
      // If newMainDs is SubtypeGroupLayer, we should make sure there are no child SubtypeSublayers of newMainDs in config.dataAttributeInfo.dataSourceItems.
      const hasSubtypeChild = configDataSourceItems.some(dataSourceItem => {
        const configMainDs = dsManager.getDataSource(dataSourceItem.useDataSource.mainDataSourceId)

        // Note, when we compare ds1.parentDataSource === ds2, we should make sure both ds1 and ds2 are main data sources.
        if (configMainDs && configMainDs.type === DataSourceTypes.SubtypeSublayer && configMainDs.parentDataSource === newMainDs) {
          return true
        }

        return false
      })

      if (hasSubtypeChild) {
        return false
      }
    } else if (newMainDs.type === DataSourceTypes.SubtypeSublayer) {
      // If newMainDs is SubtypeSublayer, we should make sure there is no parent SubtypeGroupLayer of newMainDs in config.dataAttributeInfo.dataSourceItems.
      const hasSubtypeParent = configDataSourceItems.some(dataSourceItem => {
        const configMainDs = dsManager.getDataSource(dataSourceItem.useDataSource.mainDataSourceId)

        // Note, when we compare ds1.parentDataSource === ds2, we should make sure both ds1 and ds2 are main data sources.
        if (configMainDs && configMainDs.type === DataSourceTypes.SubtypeGroupLayer && newMainDs.parentDataSource === configMainDs) {
          return true
        }

        return false
      })

      if (hasSubtypeParent) {
        return false
      }
    }
  }

  return true
}
