import type { extensionSpec, IMAppConfig } from 'jimu-core'
import { defaultMessages as jimuUIMessage } from 'jimu-ui'
import type { IMConfig } from '../config'
import { isBasemapFromUrl } from '../utils'

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'basemap-gallery-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const customBasemaps = (appConfig.widgets[this.widgetId].config as IMConfig).customBasemaps
    const keys: extensionSpec.TranslationKey[] = []
    if (customBasemaps?.length > 0) {
      customBasemaps.forEach((basemapInfo, index) => {
        if (isBasemapFromUrl(basemapInfo)) {
          keys.push({
            keyType: 'value',
            key: `widgets.${this.widgetId}.config.customBasemaps[${index}].title`,
            label: {
              key: 'label',
              enLabel: jimuUIMessage.label
            },
            valueType: 'text'
          })
        }
      })
    }

    return Promise.resolve(keys)
  }
}