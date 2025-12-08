import type { extensionSpec, IMAppConfig, ImmutableArray, UseDataSource, IMUseDataSource, DuplicateContext } from 'jimu-core'
import { Immutable, dataSourceUtils } from 'jimu-core'
import { type IMConfig, SearchServiceType, SourceType, SearchResultView, type SearchDataConfig, type DataSourceConfigWithMapCentric } from '../config'
import { utils } from 'jimu-ui'
export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'search-app-config-operation'
  widgetId: string

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext
  ): IMAppConfig {
    let newAppConfig = updateOutputDsAfterSearchWidgetCopied(sourceWidgetId, sourceAppConfig, destWidgetId, destAppConfig)
    newAppConfig = updateDsIdInSearchConfigAfterUseDsChange(sourceWidgetId, sourceAppConfig, destWidgetId, newAppConfig, contentMap)
    newAppConfig = updateLinkInSearchConfigAfterUseDsChange(sourceWidgetId, sourceAppConfig, destWidgetId, newAppConfig, contentMap)
    return newAppConfig
  }

  /**
 * Cleanup the widget config when the useDataSource will be removed
 * @returns The updated appConfig
 */
  useDataSourceWillChange (appConfig: IMAppConfig, oldDataSourceId: string): IMAppConfig {
    if (!oldDataSourceId) {
      return appConfig
    }

    let widgetJson = appConfig.widgets[this.widgetId]
    let widgetConfig = widgetJson.config as IMConfig

    const useDsIdsToRemove = widgetJson.useDataSources.filter(useDs => {
      return useDs.dataSourceId === oldDataSourceId || useDs.rootDataSourceId === oldDataSourceId
    })?.map(ds => ds.dataSourceId)

    const newUseDataSources = widgetJson.useDataSources.filter(useDs => {
      return useDs.dataSourceId !== oldDataSourceId || useDs.rootDataSourceId !== oldDataSourceId
    })

    if (useDsIdsToRemove && useDsIdsToRemove?.length > 0) {
      if (widgetConfig.sourceType === SourceType.MapCentric) {
        const dataSourceConfigWithMapCentric = widgetConfig.dataSourceConfigWithMapCentric || {}
        const newDataSourceConfigWithMapCentric = {}

        Object.keys(dataSourceConfigWithMapCentric).forEach(configId => {
          const dataSourceConfigItemWithMapCentric = dataSourceConfigWithMapCentric[configId]?.asMutable({ deep: true })
          if (dataSourceConfigItemWithMapCentric?.synchronizeSettings as any === false && dataSourceConfigItemWithMapCentric?.dataSourceConfig) {
            const newDataSourceConfig = dataSourceConfigItemWithMapCentric?.dataSourceConfig.filter(dataSourceConfigItem => !useDsIdsToRemove.includes(dataSourceConfigItem?.useDataSource?.dataSourceId))
            dataSourceConfigItemWithMapCentric.dataSourceConfig = newDataSourceConfig
          }
          const dsIdInConfigId = configId.split('-')[1]
          if (dsIdInConfigId !== oldDataSourceId) {
            newDataSourceConfigWithMapCentric[configId] = dataSourceConfigItemWithMapCentric
          }
        })

        widgetConfig = widgetConfig.set('dataSourceConfigWithMapCentric', newDataSourceConfigWithMapCentric)
      } else {
        const dataSourceConfig = widgetConfig.datasourceConfig
        const newDataSourceConfig = dataSourceConfig.filter(dataSourceConfigItem => !useDsIdsToRemove.includes(dataSourceConfigItem?.useDataSource?.dataSourceId))
        widgetConfig = widgetConfig.set('datasourceConfig', newDataSourceConfig)
      }
      widgetJson = widgetJson.set('useDataSources', newUseDataSources).set('config', widgetConfig)
      appConfig = appConfig.setIn(['widgets', this.widgetId], widgetJson)
    }
    return appConfig
  }
}

function updateLinkInSearchConfigAfterUseDsChange (
  sourceWidgetId: string,
  sourceAppConfig: IMAppConfig,
  destWidgetId: string,
  destAppConfig: IMAppConfig,
  contentMap?: DuplicateContext
): IMAppConfig {
  let newAppConfig = destAppConfig
  const widgetConfig = newAppConfig.widgets[destWidgetId].config as IMConfig
  if (!contentMap || widgetConfig.searchResultView === SearchResultView.ResultPanel || !widgetConfig?.linkParam) {
    return destAppConfig
  }

  const sourceWidgetJson = sourceAppConfig?.widgets?.[sourceWidgetId]
  const { linkParam, isChanged } = utils.mapLinkParam(contentMap, widgetConfig?.linkParam, sourceWidgetJson)
  if (isChanged && linkParam) {
    newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'linkParam'], linkParam)
  }
  return newAppConfig
}

//A widget may generate the output data source. The framework can update the widgetJson.outputDatasourceIds, but if the output data source id is used in the widget config, the widget needs to handle the change.
//Now, most widgets 's output data source id follow this pattern widgetId_output_[...], let's keep use this pattern when duplicate widgets.
function updateDsIdInSearchConfigAfterUseDsChange (
  sourceWidgetId: string,
  sourceAppConfig: IMAppConfig,
  destWidgetId: string,
  destAppConfig: IMAppConfig,
  contentMap?: DuplicateContext
): IMAppConfig {
  if (!contentMap) {
    return destAppConfig
  }

  const DefaultUseDataSource = Immutable([])
  const useDataSources = sourceAppConfig.widgets[sourceWidgetId].useDataSources ?? DefaultUseDataSource
  const hasMapDs = !!useDataSources.find((useDataSource) => contentMap[useDataSource.mainDataSourceId])

  let newAppConfig = destAppConfig
  const widgetConfig = newAppConfig.widgets[destWidgetId].config as IMConfig
  if (!hasMapDs || widgetConfig.sourceType !== SourceType.CustomSearchSources) {
    return destAppConfig
  }
  // update output ds for each custom Feature Service item
  const newDatasourceConfig = widgetConfig.datasourceConfig.map(item => {
    if (item.searchServiceType === SearchServiceType.FeatureService) {
      const useDssInfo = dataSourceUtils.mapUseDataSources(contentMap, Immutable([item.useDataSource?.asMutable({ deep: true })]))
      return useDssInfo.isChanged ? item.set('useDataSource', useDssInfo.useDataSources?.[0]) : item
    } else {
      return item
    }
  })
  newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'datasourceConfig'], newDatasourceConfig)
  return newAppConfig
}

//After Search widget copied, we need update the output ds id, to prevent outputDsId from being duplicated with origin Source search widget
function updateOutputDsAfterSearchWidgetCopied (sourceWidgetId: string, sourceAppConfig: IMAppConfig, destWidgetId: string, destAppConfig: IMAppConfig): IMAppConfig {
  const widgetJsonOfSourceWidget = sourceAppConfig.widgets[sourceWidgetId]
  const widgetJsonOfDestWidget = destAppConfig.widgets[destWidgetId]
  const outputDataSourcesOfSourceWidget = widgetJsonOfSourceWidget?.outputDataSources?.asMutable({ deep: true }) || []
  const outputDataSourcesOfDestWidget = widgetJsonOfDestWidget?.outputDataSources?.asMutable({ deep: true }) || []
  if (outputDataSourcesOfSourceWidget?.length === 0) {
    return destAppConfig
  }

  let newAppConfig = destAppConfig

  //Update output dsId in widget config
  const widgetConfigOfDestWidget = destAppConfig.widgets[destWidgetId].config as IMConfig

  if (widgetConfigOfDestWidget.sourceType === SourceType.MapCentric) {
    const useMapWidgetIdsOfSourceWidget = widgetJsonOfSourceWidget?.useMapWidgetIds?.[0]
    const useMapWidgetIdsOfDestWidget = widgetJsonOfDestWidget?.useMapWidgetIds?.[0]
    const newDataSourceConfigWithMapCentric = getNewDsConfigWithMapCentricAfterSearchWidgetCopied(widgetConfigOfDestWidget, useMapWidgetIdsOfSourceWidget, useMapWidgetIdsOfDestWidget, outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget)
    newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'dataSourceConfigWithMapCentric'], newDataSourceConfigWithMapCentric)
  } else {
    const datasourceConfig = widgetConfigOfDestWidget?.datasourceConfig
    const newDatasourceConfig = getNewDatasourceConfigWhenUpdateOutputDs(datasourceConfig, outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget)
    newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'datasourceConfig'], newDatasourceConfig)
  }

  //Update output dsId in message action config of destWidget
  const messageActionConfig = destAppConfig?.messageConfigs
  if (messageActionConfig) {
    const newMessageActionConfig = {}
    Object.keys(messageActionConfig).forEach(configId => {
      const configItem = messageActionConfig[configId]
      if (configItem?.widgetId !== destWidgetId || !configItem?.actions) {
        newMessageActionConfig[configId] = configItem
      } else {
        const actions = configItem.actions
        const newActions = actions.map(actionItem => {
          //Update useDataSources of action
          if (actionItem?.useDataSources) {
            const useDataSources = actionItem.useDataSources
            const newUseDataSources = getNewUseDataSources(outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget, useDataSources)
            actionItem = actionItem.set('useDataSources', newUseDataSources)
          }

          //Update messageUseDataSource of message action
          const messageUseDataSource = actionItem?.config?.messageUseDataSource
          if (messageUseDataSource && outputDataSourcesOfSourceWidget.includes(messageUseDataSource?.dataSourceId)) {
            //Get new messageUseDataSource
            const newMessageUseDataSource = getNewUseDataSource(outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget, messageUseDataSource)
            actionItem = actionItem.setIn(['config', 'messageUseDataSource'], newMessageUseDataSource)
          }

          //Update useDataSource of message actions
          if (actionItem?.config?.useDataSource && outputDataSourcesOfSourceWidget.includes(actionItem?.config?.useDataSource?.dataSourceId)) {
            //Get new useDataSource
            const preDs = actionItem?.config?.useDataSource
            const newUseDataSource = getNewUseDataSource(outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget, preDs)
            actionItem = actionItem.setIn(['config', 'useDataSource'], newUseDataSource)
          }

          //Update useDataSources of message actions
          if (actionItem?.config?.useDataSources) {
            //Get new useDataSources
            const newUseDataSources = getNewUseDataSources(outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget, actionItem?.config.useDataSources)
            actionItem = actionItem.setIn(['config', 'useDataSources'], newUseDataSources)
          }

          return actionItem
        })

        newMessageActionConfig[configId] = configItem.set('actions', newActions)
      }
    })

    newAppConfig = newAppConfig.set('messageConfigs', newMessageActionConfig)
  }

  return newAppConfig
}

//Update output ds id and key of config.dataSourceConfigWithMapCentric after search widget copied
function getNewDsConfigWithMapCentricAfterSearchWidgetCopied(
  widgetConfigOfDestWidget: IMConfig,
  useMapWidgetIdsOfSourceWidget: string,
  useMapWidgetIdsOfDestWidget: string,
  outputDataSourcesOfSourceWidget: string[],
  outputDataSourcesOfDestWidget: string[]): DataSourceConfigWithMapCentric {
  const dataSourceConfigWithMapCentric = widgetConfigOfDestWidget?.dataSourceConfigWithMapCentric?.asMutable({ deep: true })
  Object.keys(dataSourceConfigWithMapCentric).forEach(key => {
    const dataSourceConfigWithMapCentricItem = dataSourceConfigWithMapCentric[key]
    const datasourceConfig = dataSourceConfigWithMapCentricItem?.dataSourceConfig
    const newDatasourceConfig = getNewDatasourceConfigWhenUpdateOutputDs(Immutable(datasourceConfig), outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget)
    let newKey = key
    if (newKey.startsWith(useMapWidgetIdsOfSourceWidget)) {
      newKey = newKey.replace(useMapWidgetIdsOfSourceWidget, useMapWidgetIdsOfDestWidget)
    }
    delete dataSourceConfigWithMapCentric[key]
    dataSourceConfigWithMapCentricItem.dataSourceConfig = newDatasourceConfig as any
    dataSourceConfigWithMapCentric[newKey] = dataSourceConfigWithMapCentricItem
  })
  return dataSourceConfigWithMapCentric
}


function getNewDatasourceConfigWhenUpdateOutputDs (datasourceConfig: ImmutableArray<SearchDataConfig>, outputDataSourcesOfSourceWidget: string[], outputDataSourcesOfDestWidget: string[]): ImmutableArray<SearchDataConfig> {
  return datasourceConfig.map(datasourceConfigItem => {
    if (datasourceConfigItem.searchServiceType === SearchServiceType.FeatureService) {
      return datasourceConfigItem?.asMutable({ deep: true })
    } else {
      const outputDataSourceIdInSourceWidget = datasourceConfigItem.outputDataSourceId
      const outputDsId = getOutputDsIdInDestWidgetConfig(outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget, outputDataSourceIdInSourceWidget)
      const newDatasourceConfigItem = datasourceConfigItem.set('outputDataSourceId', outputDsId)
      return newDatasourceConfigItem?.asMutable({ deep: true })
    }
  })
}


function getNewUseDataSources (outputDataSourcesOfSourceWidget: string[], outputDataSourcesOfDestWidget: string[], useDataSources: ImmutableArray<UseDataSource>) {
  return useDataSources.map(ds => {
    return getNewUseDataSource(outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget, ds)
  })
}

function getNewUseDataSource (outputDataSourcesOfSourceWidget: string[], outputDataSourcesOfDestWidget: string[], ds: IMUseDataSource) {
  if (outputDataSourcesOfSourceWidget.includes(ds?.dataSourceId)) {
    const outputDsId = getOutputDsIdInDestWidgetConfig(outputDataSourcesOfSourceWidget, outputDataSourcesOfDestWidget, ds.dataSourceId)
    return ds.set('dataSourceId', outputDsId).set('mainDataSourceId', outputDsId)
  } else {
    return ds
  }
}

function getOutputDsIdInDestWidgetConfig (outputDataSourcesOfSourceWidget: string[], outputDataSourcesOfDestWidget: string[], dsIdInSourceWidget: string): string {
  const index = outputDataSourcesOfSourceWidget.indexOf(dsIdInSourceWidget)
  if (index > -1) {
    return outputDataSourcesOfDestWidget[index]
  } else {
    return dsIdInSourceWidget
  }
}
