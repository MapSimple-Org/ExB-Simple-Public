import type { extensionSpec, IMAppConfig } from 'jimu-core'
import { defaultMessages as jimuUIMessage } from 'jimu-ui'
import defaultMessage from '../setting/translations/default'
const messages = Object.assign({}, jimuUIMessage, defaultMessage)
export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'button-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const widgetConfig = appConfig.widgets[this.widgetId].config
    const keys: extensionSpec.TranslationKey[] = []
    if (widgetConfig.emailContent?.content) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.emailContent.content`,
        label: {
          key: 'emailContent',
          enLabel: messages.emailContent
        },
        valueType: 'textarea'
      })
    }
    if (widgetConfig.popup?.tooltip) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.popup.tooltip`,
        label: {
          key: 'tooltip',
          enLabel: messages.tooltip
        },
        valueType: 'text'
      })
    }
    return Promise.resolve(keys)
  }
}