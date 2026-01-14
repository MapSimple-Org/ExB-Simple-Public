import type { extensionSpec, IMAppConfig, ImmutableObject } from 'jimu-core'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import type { IMConfig, QueryItemType } from '../config'
import defaultMessages from '../setting/translations/default'

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'query-simple-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const config = appConfig.widgets[this.widgetId].config as IMConfig
    const keys: extensionSpec.TranslationKey[] = []
    const queryItems = config?.queryItems || []
    queryItems.forEach((queryItem: ImmutableObject<QueryItemType>) => {
      const prefix = `widgets.${this.widgetId}.${queryItem.configId}`
      if (queryItem.name) {
        keys.push({
          keyType: 'value',
          key: `${prefix}.name`,
          label: {
            key: 'label',
            enLabel: jimuUIMessages.label
          },
          valueType: "text",
        })
      }
      if (queryItem.attributeFilterLabel) {
        keys.push({
          keyType: 'value',
          key: `${prefix}.attributeFilterLabel`,
          label: {
            key: 'attributeFilter',
            enLabel: defaultMessages.attributeFilter
          },
          valueType: 'text'
        })
      }
      if (queryItem.attributeFilterDesc) {
        keys.push({
          keyType: 'value',
          key: `${prefix}.attributeFilterDesc`,
          label: {
            key: 'description',
            enLabel: jimuUIMessages.description
          },
          valueType: 'textarea'
        })
      }
      if (queryItem.spatialFilterLabel) {
        keys.push({
          keyType: 'value',
          key: `${prefix}.spatialFilterLabel`,
          label: {
            key: 'spatialFilter',
            enLabel: defaultMessages.spatialFilter
          },
          valueType: 'text'
        })
      }
      if (queryItem.spatialFilterDesc) {
        keys.push({
          keyType: 'value',
          key: `${prefix}.spatialFilterDesc`,
          label: {
            key: 'description',
            enLabel: jimuUIMessages.description
          },
          valueType: 'textarea'
        })
      }
      if (queryItem.resultsLabel) {
        keys.push({
          keyType: 'value',
          key: `${prefix}.resultsLabel`,
          label: {
            key: 'results',
            enLabel: defaultMessages.results
          },
          valueType: 'text'
        })
      }
      if (queryItem.resultTitleExpression) {
        keys.push({
          keyType: 'value',
          key: `${prefix}.resultTitleExpression`,
          label: {
            key: 'configTitle',
            enLabel: defaultMessages.configTitle
          },
          valueType: 'textarea'
        })
      }
    })
    return Promise.resolve(keys)
  }
}



