import type { extensionSpec, IMAppConfig } from 'jimu-core'
import { defaultMessages as jimuUiMessage } from 'jimu-ui'
import type { IMConfig } from '../config'

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'image-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const config = appConfig.widgets[this.widgetId].config as IMConfig
    const { functionConfig } = config
    const keys: extensionSpec.TranslationKey[] = []
    if (functionConfig?.toolTip) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.functionConfig.toolTip`,
        label: {
          key: 'tooltip',
          enLabel: jimuUiMessage.tooltip
        },
        valueType: 'text'
      })
    }
    if (functionConfig?.altText) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.functionConfig.altText`,
        label: {
          key: 'altText',
          enLabel: jimuUiMessage.altText
        },
        valueType: 'text'
      })
    }

    return Promise.resolve(keys)
  }
}