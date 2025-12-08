import type { extensionSpec, IMAppConfig } from 'jimu-core'
import { defaultMessages as jimuUIMessage } from 'jimu-ui'
import defaultMessage from '../setting/translations/default'
import type { IMConfig } from '../config'
import { getItemCategoryI18nKey } from '../utils'
const messages = Object.assign({}, jimuUIMessage, defaultMessage)

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'add-data-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const widgetConfig = appConfig.widgets[this.widgetId].config as IMConfig
    const { itemCategoriesInfo, placeholderText } = widgetConfig
    const keys: extensionSpec.TranslationKey[] = []
    if (itemCategoriesInfo?.length > 0) {
      itemCategoriesInfo.forEach((item, index) => {
        if (item.customLabel) {
          const labelI18nKey = getItemCategoryI18nKey(item.type)
          keys.push({
            keyType: 'value',
            key: `widgets.${this.widgetId}.config.itemCategoriesInfo[${index}].customLabel`,
            label: {
              key: labelI18nKey,
              enLabel: messages[labelI18nKey]
            },
            valueType: 'text'
          })
        }
      })
    }
    if (placeholderText) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.placeholderText`,
        label: {
          key: 'emptyListMessage',
          enLabel: messages.emptyListMessage
        },
        valueType: 'text'
      })
    }

    return Promise.resolve(keys)
  }
}