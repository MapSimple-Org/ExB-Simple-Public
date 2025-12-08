import type { extensionSpec, IMAppConfig } from 'jimu-core'
import { defaultMessages as jimuUIMessage } from 'jimu-ui'
import type { IMConfig, PrintTemplateProperties } from '../config'
import defaultMessage from '../setting/translations/default'
const messages = Object.assign({}, jimuUIMessage, defaultMessage)
export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'button-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const widgetConfig = appConfig.widgets[this.widgetId].config as IMConfig
    let keys: extensionSpec.TranslationKey[] = []
    if (widgetConfig?.printCustomTemplate) {
      const printCustomTemplate = widgetConfig?.printCustomTemplate?.asMutable({ deep: true })
      keys = getTranslationKeyWithPrintCustomTemplate(printCustomTemplate, this.widgetId, keys)
    }

    return Promise.resolve(keys)
  }
}

function getTranslationKeyWithPrintCustomTemplate(printCustomTemplate: PrintTemplateProperties[], widgetId: string, translationKeys: extensionSpec.TranslationKey[]): extensionSpec.TranslationKey[] {
  printCustomTemplate.forEach((item, index) => {
    if (item?.label) {
      translationKeys.push({
        keyType: 'value',
        key: `widgets.${widgetId}.config.printCustomTemplate.[${index}].label`,
        label: {
          key: 'templateName',
          enLabel: messages.templateName
        },
        valueType: 'text',
        nav: `${messages.configurePrintTemplate}/${messages.printService}/${item.label}/${messages.templateName}`
      })
    }
  })
  return translationKeys
}
