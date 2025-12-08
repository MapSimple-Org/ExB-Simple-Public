import type { extensionSpec, IMAppConfig } from 'jimu-core'
import { defaultMessages as jimuUIMessage } from 'jimu-ui'
import { SourceType, type SearchDataConfig, type IMConfig } from '../config'
import defaultMessage from '../setting/translations/default'
const messages = Object.assign({}, jimuUIMessage, defaultMessage)
export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'button-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const widgetConfig = appConfig.widgets[this.widgetId].config as IMConfig
    let keys: extensionSpec.TranslationKey[] = []
    if (widgetConfig.hint) {
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.hint`,
        label: {
          key: 'multiSearchHint',
          enLabel: messages.multiSearchHint
        },
        valueType: 'text'
      })
    }
    if (widgetConfig.sourceType === SourceType.CustomSearchSources && widgetConfig.datasourceConfig?.length > 0) {
      keys = getTranslationKeyWithDatasourceConfig({
        datasourceConfig: widgetConfig.datasourceConfig?.asMutable({ deep: true }),
        translationKeys: keys,
        datasourceConfigPath: 'datasourceConfig',
        baseNavString: messages.source,
        widgetId: this.widgetId
      })
    } else if (widgetConfig.sourceType === SourceType.MapCentric) {
      const dataSourceConfigWithMapCentric = widgetConfig?.dataSourceConfigWithMapCentric
      Object.keys(dataSourceConfigWithMapCentric).forEach(viewId => {
        const dataSourceConfigItemWithMapCentric = dataSourceConfigWithMapCentric[viewId]
        if (dataSourceConfigItemWithMapCentric?.synchronizeSettings as any === false) {
          const datasourceConfig = dataSourceConfigItemWithMapCentric.dataSourceConfig?.asMutable({ deep: true })
          keys = getTranslationKeyWithDatasourceConfig({
            datasourceConfig: datasourceConfig,
            translationKeys: keys,
            datasourceConfigPath: `dataSourceConfigWithMapCentric['${viewId}'].dataSourceConfig`,
            baseNavString: `${messages.source}/${viewId}`,
            widgetId: this.widgetId
          })
        }
      })
    }

    return Promise.resolve(keys)
  }
}

interface Options {
  datasourceConfigPath: string
  datasourceConfig: SearchDataConfig[]
  translationKeys: extensionSpec.TranslationKey[]
  baseNavString: string,
  widgetId: string
}
function getTranslationKeyWithDatasourceConfig(option: Options): extensionSpec.TranslationKey[] {
  const { datasourceConfigPath, datasourceConfig, translationKeys, baseNavString, widgetId } = option
  datasourceConfig.forEach((item, index) => {
    if (item?.label) {
      translationKeys.push({
        keyType: 'value',
        key: `widgets.${widgetId}.config.${datasourceConfigPath}[${index}].label`,
        label: {
          key: 'label',
          enLabel: messages.label
        },
        valueType: 'text',
        nav: `${baseNavString}/${item.label}/${messages.label}`
      })
    }
    if (item?.hint) {
      translationKeys.push({
        keyType: 'value',
        key: `widgets.${widgetId}.config.${datasourceConfigPath}[${index}].hint`,
        label: {
          key: 'multiSearchHint',
          enLabel: messages.multiSearchHint
        },
        valueType: 'text',
        nav: `${baseNavString}/${item.label}/${messages.multiSearchHint}`
      })
    }
  })
  return translationKeys
}
