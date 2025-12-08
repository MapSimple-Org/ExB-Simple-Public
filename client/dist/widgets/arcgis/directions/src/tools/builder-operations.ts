import type { extensionSpec, IMAppConfig } from 'jimu-core'
import { defaultMessages as jimuUIMessage } from 'jimu-ui'
import defaultMessage from '../setting/translations/default'
import type { IMConfig } from '../config'
const messages = Object.assign({}, jimuUIMessage, defaultMessage)

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'directions-builder-operation'
  widgetId: string


  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const keys: extensionSpec.TranslationKey[] = []
    const widgetConfig = appConfig.widgets[this.widgetId].config as IMConfig
    const { searchConfig } = widgetConfig

    if (searchConfig?.generalConfig?.hint) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.searchConfig.generalConfig.hint`,
        label: {
          key: 'hint',
          enLabel: messages.hint
        },
        valueType: 'text'
      })
    }

    return Promise.resolve(keys)
  }
}
