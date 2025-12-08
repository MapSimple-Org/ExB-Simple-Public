import { DataSourceManager, type extensionSpec, type IMAppConfig } from 'jimu-core'
import type { IMConfig } from '../config'
import defaultMessages from '../setting/translations/default'
import { getKeysInSqlExprBuilder } from 'jimu-ui/basic/sql-expression-runtime'

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'filter-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const keys: extensionSpec.TranslationKey[] = []
    const config = appConfig.widgets[this.widgetId].config as IMConfig
    const dsManager = DataSourceManager.getInstance()
    config.filterItems?.forEach((filterItem, filterIndex) => {
      const layerNames = getLayerNames(dsManager, filterItem.useDataSources)
      keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.filterItems[${filterIndex}].name`,
        label: {
          key: 'i18nFilterItemLabel',
          enLabel: defaultMessages.i18nFilterItemLabel // Item label
        },
        nav: layerNames, // ds names splited by &.
        valueType: 'text'
      })
      // add keys from sql expression builder
      if (filterItem.sqlExprObj) {
        const sqlKeys = getKeysInSqlExprBuilder(filterItem.sqlExprObj, `widgets.${this.widgetId}.config.filterItems[${filterIndex}].sqlExprObj`)
        sqlKeys.length > 0 && keys.push(...sqlKeys)
      }
    })
    return Promise.resolve(keys)
  }
}

function getLayerNames (dsManager, useDataSources): string {
  const layerNames = []
  useDataSources.forEach(uds => {
    const label = dsManager.getDataSource(uds.dataSourceId)?.getLabel()
    label && layerNames.push(label)
  })
  return layerNames.join(' & ')
}
