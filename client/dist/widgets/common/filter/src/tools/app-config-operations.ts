import { dataSourceUtils, Immutable, type DuplicateContext, type extensionSpec, type IMAppConfig } from 'jimu-core'
import { FilterItemType } from '../config'

const DefaultUseDataSource = Immutable([])

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'filter-app-config-operation'
  widgetId: string
  /**
   * Update the following items when widget is copied
   * @returns The updated appConfig
   */
  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext
  ): IMAppConfig {
    if (!contentMap) {
      return destAppConfig
    }

    const useDataSources = sourceAppConfig.widgets[sourceWidgetId].useDataSources ?? DefaultUseDataSource
    const hasMapDs = !!useDataSources.find((useDataSource) => contentMap[useDataSource.mainDataSourceId])

    if (!hasMapDs) {
      return destAppConfig
    }
    let newAppConfig = destAppConfig
    // update output ds for each single filter.
    const newFilterItems = newAppConfig.widgets[destWidgetId].config.filterItems.map(item => {
      if (item.type === FilterItemType.Single) {
        const useDssInfo = dataSourceUtils.mapUseDataSources(contentMap, item.useDataSources)
        return useDssInfo.isChanged ? item.set('useDataSources', useDssInfo.useDataSources) : item
      } else {
        return item
      }
    })
    newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'filterItems'], newFilterItems)
    return newAppConfig
  }

}
