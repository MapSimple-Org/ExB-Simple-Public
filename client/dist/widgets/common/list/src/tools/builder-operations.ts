import type { extensionSpec, IMAppConfig, SqlClause, ImmutableArray, SqlClauseSet, IMSqlClauseSet } from 'jimu-core'
import { defaultMessages as jimuUIMessage } from 'jimu-ui'
import type { IMConfig } from '../config'
import defaultMessage from '../setting/translations/default'
const messages = Object.assign({}, jimuUIMessage, defaultMessage)
export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'button-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const widgetConfig = appConfig.widgets[this.widgetId].config as IMConfig
    let keys: extensionSpec.TranslationKey[] = []
    if (widgetConfig.noDataMessage) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.noDataMessage`,
        label: {
          key: 'noDataMessage',
          enLabel: messages.noDataMessage
        },
        valueType: 'text'
      })
    }
    if (widgetConfig.searchHint) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.searchHint`,
        label: {
          key: 'hint',
          enLabel: messages.hint
        },
        nav: `${messages.tools}/${messages.SearchLabel}/${messages.hint}`,
        valueType: 'text'
      })
    }
    if (widgetConfig.sorts && widgetConfig.sorts?.length > 0) {
      widgetConfig.sorts.forEach((sort, index) => {
        keys.push({
          keyType: 'value',
          key: `widgets.${this.widgetId}.config.sorts[${index}].ruleOptionName`,
          label: {
            key: 'sortOptionName',
            enLabel: messages.sortOptionName
          },
          nav: `${messages.tools}/${messages.sort}/${sort.ruleOptionName}/${messages.sortOptionName}`,
          valueType: 'text'
        })
      })
    }

    if (widgetConfig?.filter?.parts && widgetConfig?.filter?.parts?.length > 0) {
      keys = processParts(
        widgetConfig.filter.parts,
        keys,
        `${messages.tools}/${messages.filter}`,
        `widgets.${this.widgetId}.config.filter.parts`
      )
    }

    return Promise.resolve(keys)
  }
}

function processParts(
  parts: ImmutableArray<SqlClause | SqlClauseSet>,
  keys: extensionSpec.TranslationKey[],
  navString: string,
  key: string
) {
  parts.forEach((part, index) => {
    const askForValueOptions = (part as unknown as SqlClause)?.askForValueOptions
    if ((part as unknown as SqlClause).displayLabel) {
      keys.push({
        keyType: 'value',
        key: `${key}[${index}].displayLabel`,
        label: {
          key: 'displayLabel',
          enLabel: messages.displayLabel
        },
        valueType: 'text',
        nav: `${navString}/${index}/${messages.moreInputSettings}/${messages.displayLabel}`
      })
    }
    if (askForValueOptions) {
      if (askForValueOptions?.hint) {
        keys.push({
          keyType: 'value',
          key: `${key}[${index}].askForValueOptions.hint`,
          label: {
            key: 'hint',
            enLabel: messages.hint
          },
          valueType: 'text',
          nav: `${navString}/${index}/${messages.moreInputSettings}/${messages.hint}`
        })
      }
      if (askForValueOptions?.label) {
        keys.push({
          keyType: 'value',
          key: `${key}[${index}].askForValueOptions.label`,
          label: {
            key: 'label',
            enLabel: messages.label
          },
          valueType: 'text',
          nav: `${navString}/${index}/${messages.moreInputSettings}/${messages.label}`
        })
      }
    }

    const subPart = part as unknown as IMSqlClauseSet
    if (subPart.parts && Array.isArray(subPart.parts) && subPart.parts.length > 0) {
      keys = processParts(subPart.parts, keys, `${navString}/${index}`, `${key}[${index}].parts`)
    }
  })
  return keys
}
