import { Immutable, expressionUtils, dataSourceUtils, type Expression, type DuplicateContext, type extensionSpec, type IMAppConfig, type IMWidgetJson } from 'jimu-core'
import type { IMConfig } from '../config'
import { richTextUtils } from 'jimu-ui'

const DefaultUseDataSource = Immutable([])

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'embed-app-config-operation'
  widgetId: string

  afterWidgetCopied(
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
    const needToMapDs = useDataSources.filter((useDataSource) => !!contentMap[useDataSource.mainDataSourceId])

    const widgetJson = sourceAppConfig.widgets[sourceWidgetId]
    const config: IMConfig = widgetJson.config
    let expression = config.expression
    expression = (needToMapDs && needToMapDs?.length > 0) ? mapExpression(expression, contentMap, widgetJson) : expression
    const newAppConfig = destAppConfig.setIn(['widgets', destWidgetId, 'config', 'expression'], expression)

    return newAppConfig
  }

  widgetWillRemove(appConfig: IMAppConfig): IMAppConfig {
    return appConfig
  }

  useDataSourceWillChange (appConfig: IMAppConfig, dataSourceId: string, newDataSourceId?: string): IMAppConfig {
    let newAppConfig = appConfig
    if(dataSourceId || newDataSourceId) {
      const widgetJson = appConfig.widgets[this.widgetId]
      const config: IMConfig = widgetJson?.config
      let expression = config.expression
      expression = replaceExpressionDataSource(expression, dataSourceId, newDataSourceId, this.widgetId, appConfig)
      newAppConfig = appConfig.setIn(['widgets', this.widgetId, 'config', 'expression'], expression)
    }
    return newAppConfig
  }
}

export const replaceExpressionDataSource = (html: string, dataSourceId: string, newDataSourceId: string, widgetId: string, appConfig: IMAppConfig) => {
  if (!html) return html
  return html.replace(richTextUtils.EXP_TAG_REGEXP, (exp) => {
    exp = mapHtmlDataDsId(exp, dataSourceId, newDataSourceId)
    return exp.replace(richTextUtils.DATA_EXPRESSION_REGEXP, (match, encoded) => {
      const info = richTextUtils.convertEncodeObject(encoded) as Expression
      const expression = expressionUtils.replaceDataSourceId(Immutable(info), dataSourceId, newDataSourceId, widgetId, appConfig)
      const expressionStr = richTextUtils.convertEncodedString(expression)
      return `data-expression="${expressionStr}"`
    })
  })
}

export const mapHtmlDataDsId = (tag: string, dataSourceId, newDataSourceId) => {
  if (!tag) return tag
  return tag.replace(richTextUtils.DATA_DS_ID_REGEXP, (match, ret) => {
    if(!ret) return match
    if (dataSourceUtils.areDerivedFromSameMain(dataSourceId, newDataSourceId)) {
      return `data-dsid="${newDataSourceId}"`
    } else {
      return match
    }
  })
}

export const mapExpression = (html: string, contentMap: DuplicateContext, sourceWidgetJson: IMWidgetJson) => {
  if (!html) return html
  return html.replace(richTextUtils.EXP_TAG_REGEXP, (exp) => {
    const uniqueid = richTextUtils.getUniqueId(exp)
    if (!uniqueid) return exp
    exp = mapExpDataDsId(exp, contentMap)
    return exp.replace(richTextUtils.DATA_EXPRESSION_REGEXP, (match, encoded) => {
      const info = richTextUtils.convertEncodeObject(encoded) as Expression
      const { isChanged, expression } = expressionUtils.mapExpression(contentMap, Immutable(info), sourceWidgetJson)
      if (isChanged) {
        const expressionStr = richTextUtils.convertEncodedString(expression)
        return `data-expression="${expressionStr}"`
      } else {
        return match
      }
    })
  })
}

export const mapExpDataDsId = (tag: string, dsIdMap: { [dsId: string]: string }) => {
  if (!tag) return tag
  return tag.replace(richTextUtils.DATA_DS_ID_REGEXP, (match, ret) => {
    if(!ret) return match
    const dsIds = ret.split(',')
    let dsStr = ''
    dsIds.forEach((dsId) => {
      const oldMainDsId = Object.keys(dsIdMap).find(k => dataSourceUtils.areDerivedFromSameMain(dsId, k))
      const newMainDsId = dsIdMap[oldMainDsId]
      const newDsId = (oldMainDsId && newMainDsId) ? dsId.replace(oldMainDsId, newMainDsId) : dsId
      dsStr += `${dsStr ? ',' : ''}${newDsId}`
    })
    return dsStr ? `data-dsid="${dsStr}"` : match
  })
}
