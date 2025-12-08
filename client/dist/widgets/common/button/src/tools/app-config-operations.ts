import { dataSourceUtils, type DuplicateContext, dynamicStyleUtils, expressionUtils, type extensionSpec, type IMAppConfig, Immutable } from 'jimu-core'
import type { IMConfig } from '../config'
import { utils } from 'jimu-ui'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'button-app-config-operation'
  widgetId: string

  /**
   * Cleanup the widget config when the useDataSource will be removed
   * @returns The updated appConfig
   */
  useDataSourceWillChange(appConfig: IMAppConfig, oldDataSourceId: string, newDataSourceId: string): IMAppConfig {
    const widgetJson = appConfig.widgets[this.widgetId]
    const config: IMConfig = widgetJson.config
    const functionConfig = config.functionConfig
    const styleConfig = config.styleConfig
    if (!functionConfig || !styleConfig || !oldDataSourceId || !newDataSourceId) {
      return appConfig
    }
    const oldUseDataSources = widgetJson.useDataSources
    const newUseDataSources = widgetJson.useDataSources.filter(useDs => useDs.dataSourceId !== oldDataSourceId).concat(dataSourceUtils.getUseDataSourceByDataSourceId(newDataSourceId))

    let newFunctionConfig: IMConfig['functionConfig']
    let newStyleConfig: IMConfig['styleConfig']
    // If the new data source is derived from the same main data source with the old data source, replace the data source id in the expressions.
    if (dataSourceUtils.areDerivedFromSameMain(oldDataSourceId, newDataSourceId)) {
      newFunctionConfig = functionConfig
        .set('textExpression', expressionUtils.replaceDataSourceId(functionConfig.textExpression, oldDataSourceId, newDataSourceId, this.widgetId, appConfig))
        .set('toolTipExpression', expressionUtils.replaceDataSourceId(functionConfig.toolTipExpression, oldDataSourceId, newDataSourceId, this.widgetId, appConfig))
        .setIn(['linkParam', 'expression'], expressionUtils.replaceDataSourceId(functionConfig.linkParam?.expression, oldDataSourceId, newDataSourceId, this.widgetId, appConfig))
    } else { // If the new data source is not derived from the same main data source with the old data source, remove the expressions that use the old data source.
      const useDataSourceToRemove = widgetJson.useDataSources.find(useDs => useDs.dataSourceId === oldDataSourceId)
      if (useDataSourceToRemove) {
        newFunctionConfig = functionConfig.without('textExpression').without('toolTipExpression').set('linkParam', functionConfig.linkParam?.without('expression'))
      }
    }
    // If change dataview or main ds, should update or reset dynamic style settings.
    if (config?.styleConfig?.useCustom && config.styleConfig.customStyle && (config.styleConfig.customStyle.regular?.enableDynamicStyle || config.styleConfig.customStyle.hover?.enableDynamicStyle)) {
      const styleStates = ['regular', 'hover']
      newStyleConfig = styleConfig
      styleStates.forEach(state => {
        const customStyle = dynamicStyleUtils.updateDynamicStyleWhenUseDataSourcesChange(
          this.id,
          Immutable(oldUseDataSources),
          Immutable(newUseDataSources),
          Immutable(config.styleConfig.customStyle[state].dynamicStyleConfig),
        )
        if (customStyle) {
          newStyleConfig = newStyleConfig.setIn(['customStyle', state, 'dynamicStyleConfig'], customStyle)
        } else {
          newStyleConfig = newStyleConfig.setIn(['customStyle', state, 'enableDynamicStyle'], false)
          newStyleConfig = newStyleConfig.setIn(['customStyle', state], newStyleConfig.customStyle[state].without('dynamicStyleConfig'))
        }
      })
    }
    let newAppConfig
    if (newFunctionConfig) {
      newAppConfig = appConfig.setIn(['widgets', this.widgetId, 'config', 'functionConfig'], newFunctionConfig)
    }
    if (newStyleConfig) {
      newAppConfig = newAppConfig.setIn(['widgets', this.widgetId, 'config', 'styleConfig'], newStyleConfig)
    }
    if (newAppConfig) {
      return newAppConfig
    } else {
      return appConfig
    }
  }
  /**
   * Update the button linkParam value when widget is copied
   * @returns The updated appConfig
   */
  afterWidgetCopied(
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
    const originlinkParam = config.functionConfig.linkParam
    const { linkParam, isChanged } = utils.mapLinkParam(contentMap, originlinkParam, widgetJson)
    if (isChanged) {
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'functionConfig', 'linkParam'], linkParam)
    }

    const textExpression = config.functionConfig.textExpression
    const checkTextExpressionResult = expressionUtils.mapExpression(contentMap, textExpression, widgetJson)
    newAppConfig = checkTextExpressionResult.isChanged ? newAppConfig.setIn(['widgets', destWidgetId, 'config', 'functionConfig', 'textExpression'], checkTextExpressionResult.expression) : newAppConfig

    const toolTipExpression = config.functionConfig.toolTipExpression
    const checkToolTipExpressionResult = expressionUtils.mapExpression(contentMap, toolTipExpression, widgetJson)
    newAppConfig = checkToolTipExpressionResult.isChanged ? newAppConfig.setIn(['widgets', destWidgetId, 'config', 'functionConfig', 'toolTipExpression'], checkToolTipExpressionResult.expression) : newAppConfig

    const advanceDynamicStyleConfig = config.styleConfig?.customStyle?.regular?.dynamicStyleConfig
    if (advanceDynamicStyleConfig) {
      const newDynamicStyleConfig = dynamicStyleUtils.getCopiedDynamicStyleConfig(contentMap, widgetJson, advanceDynamicStyleConfig)
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'styleConfig', 'customStyle', 'regular', 'dynamicStyleConfig'], newDynamicStyleConfig)
    }
    const hoverDynamicStyleConfig = config.styleConfig?.customStyle?.hover?.dynamicStyleConfig
    if (hoverDynamicStyleConfig) {
      const newHoverDynamicStyleConfig = dynamicStyleUtils.getCopiedDynamicStyleConfig(contentMap, widgetJson, hoverDynamicStyleConfig)
      newAppConfig = newAppConfig.setIn(['widgets', destWidgetId, 'config', 'styleConfig', 'customStyle', 'hover', 'dynamicStyleConfig'], newHoverDynamicStyleConfig)
    }
    return newAppConfig
  }

}
