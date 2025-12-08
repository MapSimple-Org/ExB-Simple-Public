import type { extensionSpec, IMAppConfig } from 'jimu-core'
import { defaultMessages as jimuUIMessage } from 'jimu-ui'
import defaultMessage from '../setting/translations/default'
const messages = Object.assign({}, jimuUIMessage, defaultMessage)
export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'button-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const functionConfig = appConfig.widgets[this.widgetId].config.functionConfig
    const keys: extensionSpec.TranslationKey[] = []
    keys.push({
      keyType: 'group',
      key: 'asdf',
      label: 'BUTTON Group'
    })
    if (functionConfig.toolTip) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.functionConfig.toolTip`,
        label: {
          key: 'tooltip',
          enLabel: messages.tooltip
        },
        nav:{
          key: 'BUTTON',
          enLabel: 'BUTTON',
          values: {'BUTTON': 'BUTTON NAV' }
        },
        valueType: 'text'
      })
    }
    if (functionConfig.text) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.functionConfig.text`,
        label: {
          key: 'text',
          enLabel: messages.text
        },
        valueType: 'text'
      })
    }

    return Promise.resolve(keys)
  }
}