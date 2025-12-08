import { dataSourceUtils, expressionUtils, type DuplicateContext, type extensionSpec, type IMAppConfig } from 'jimu-core'
import type { IMConfig } from '../config'
import { utils } from 'jimu-ui'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'image-app-config-operation'
  widgetId: string

  /**
   * Cleanup the widget config when the useDataSource will be removed
   * @returns The updated appConfig
   */
  useDataSourceWillChange (appConfig: IMAppConfig, oldDataSourceId: string, newDataSourceId: string): IMAppConfig {
    const widgetJson = appConfig.widgets[this.widgetId]
    const config: IMConfig = widgetJson.config
    const functionConfig = config.functionConfig

    if (!functionConfig || !oldDataSourceId) {
      return appConfig
    }

    let newFunctionConfig: IMConfig['functionConfig']
    // If the new data source is derived from the same main data source with the old data source, replace the data source id in the expressions.
    if (dataSourceUtils.areDerivedFromSameMain(oldDataSourceId, newDataSourceId)) {
      newFunctionConfig = functionConfig
        .set('srcExpression', expressionUtils.replaceDataSourceId(functionConfig.srcExpression, oldDataSourceId, newDataSourceId, this.widgetId, appConfig))
        .set('altTextExpression', expressionUtils.replaceDataSourceId(functionConfig.altTextExpression, oldDataSourceId, newDataSourceId, this.widgetId, appConfig))
        .set('toolTipExpression', expressionUtils.replaceDataSourceId(functionConfig.toolTipExpression, oldDataSourceId, newDataSourceId, this.widgetId, appConfig))
        .setIn(['linkParam', 'expression'], expressionUtils.replaceDataSourceId(functionConfig.linkParam?.expression, oldDataSourceId, newDataSourceId, this.widgetId, appConfig))
    } else { // If the new data source is not derived from the same main data source with the old data source, remove the expressions that use the old data source.
      const useDataSourceToRemove = widgetJson.useDataSources.find(useDs => useDs.dataSourceId === oldDataSourceId)
      if (useDataSourceToRemove) {
        newFunctionConfig = functionConfig.without('srcExpression')
          .without('altTextExpression')
          .without('toolTipExpression')
          .set('linkParam', functionConfig.linkParam?.without('expression'))
          .set('dynamicUrlType', null)
          .set('altTextWithAttachmentName', null)
          .set('toolTipWithAttachmentName', null)
          .set('isSelectedFromRepeatedDataSourceContext', null)
          .set('useDataSourceForMainDataAndViewSelector', null)
      }
    }

    if (newFunctionConfig) {
      const newAppConfig = appConfig.setIn(['widgets', this.widgetId, 'config', 'functionConfig'], newFunctionConfig)
      return newAppConfig
    } else {
      return appConfig
    }
  }

  afterWidgetCopied (
    sourceWidgetId: string,
    sourceAppConfig: IMAppConfig,
    destWidgetId: string,
    destAppConfig: IMAppConfig,
    contentMap?: DuplicateContext
  ): IMAppConfig {
    if (!contentMap) { // no need to change widget linkage if it is not performed during a page copying
      return destAppConfig
    }

    let newAppConfig = destAppConfig
    const widgetJson = sourceAppConfig.widgets[sourceWidgetId]
    const config: IMConfig = widgetJson?.config

    const { linkParam, isChanged } = utils.mapLinkParam(contentMap, config.functionConfig.linkParam, widgetJson)
    if (isChanged) {
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'functionConfig', 'linkParam'], linkParam)
    }

    const useDss = widgetJson.useDataSources
    const checkUseDssResult = dataSourceUtils.mapUseDataSources(contentMap, useDss)
    newAppConfig = checkUseDssResult.isChanged ? newAppConfig.setIn(['widgets', destWidgetId, 'useDataSources'], checkUseDssResult.useDataSources) : newAppConfig

    const srcExpression = config.functionConfig.srcExpression
    const checkSrcExpressionResult = expressionUtils.mapExpression(contentMap, srcExpression, widgetJson)
    newAppConfig = checkSrcExpressionResult.isChanged ? newAppConfig.setIn(['widgets', destWidgetId, 'config', 'functionConfig', 'srcExpression'], checkSrcExpressionResult.expression) : newAppConfig

    const altTextExpression = config.functionConfig.altTextExpression
    const checkAltExpressionResult = expressionUtils.mapExpression(contentMap, altTextExpression, widgetJson)
    newAppConfig = checkAltExpressionResult.isChanged ? newAppConfig.setIn(['widgets', destWidgetId, 'config', 'functionConfig', 'altTextExpression'], checkAltExpressionResult.expression) : newAppConfig

    const toolTipExpression = config.functionConfig.toolTipExpression
    const checkTooltipExpressionResult = expressionUtils.mapExpression(contentMap, toolTipExpression, widgetJson)
    newAppConfig = checkTooltipExpressionResult.isChanged ? newAppConfig.setIn(['widgets', destWidgetId, 'config', 'functionConfig', 'toolTipExpression'], checkTooltipExpressionResult.expression) : newAppConfig

    const useDataSourceForMainDataAndViewSelector = config.functionConfig.useDataSourceForMainDataAndViewSelector
    const checkUseDsForMainDataAndViewSelector = dataSourceUtils.mapUseDataSource(contentMap, useDataSourceForMainDataAndViewSelector)
    newAppConfig = checkUseDsForMainDataAndViewSelector.isChanged ? newAppConfig.setIn(['widgets', destWidgetId, 'config', 'functionConfig', 'useDataSourceForMainDataAndViewSelector'], checkUseDsForMainDataAndViewSelector.useDataSource) : newAppConfig

    return newAppConfig
  }
}
