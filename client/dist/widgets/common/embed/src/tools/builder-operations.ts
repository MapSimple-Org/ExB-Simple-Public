import type { extensionSpec, IMAppConfig } from 'jimu-core'
import { defaultMessages as jimuUiMessage } from 'jimu-ui'
import defaultMessages from '../setting/translations/default'
import type { IMConfig } from '../config'

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'embed-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const config = appConfig.widgets[this.widgetId].config as IMConfig
    const { enableLabel, label, enableBlankMessage, blankMessage } = config
    const keys: extensionSpec.TranslationKey[] = []
    if (enableLabel && label) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.label`,
        label: {
          key: 'label',
          enLabel: jimuUiMessage.label
        },
        valueType: 'text'
      })
    }
    if (enableBlankMessage && blankMessage) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.blankMessage`,
        label: {
          key: 'blankMessage',
          enLabel: defaultMessages.blankMessage
        },
        valueType: 'text'
      })
    }

    return Promise.resolve(keys)
  }
}