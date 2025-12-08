import { type extensionSpec, type IMAppConfig, type ImmutableArray, DataSourceManager } from 'jimu-core'
import type { IMConfig, DataSourceItem, IMDataSourceItem } from '../config'
import defaultMessage from '../setting/translations/default'
import { getKeysInSqlExprBuilder } from 'jimu-ui/basic/sql-expression-runtime'

interface DataSourceItemWithIndex {
  dataSourceItem: IMDataSourceItem;
  itemIndex: number;
}

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'select-builder-operation'
  widgetId: string

  async getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const result: extensionSpec.TranslationKey[] = []

    const widgetConfig = appConfig?.widgets?.[this.widgetId]?.config as IMConfig
    const dataAttributeInfo = widgetConfig?.dataAttributeInfo
    const mapInfo = widgetConfig?.mapInfo

    if (dataAttributeInfo) {
      const dataSourceItems = dataAttributeInfo.dataSourceItems

      if (dataSourceItems?.length > 0) {
        const keyPrefix = `widgets.${this.widgetId}.config.dataAttributeInfo`
        const keys = await getKeysOfDataSourceItems(keyPrefix, dataSourceItems)

        if (keys?.length > 0) {
          result.push(...keys)
        }
      }
    }

    if (mapInfo) {
      const jimuMapViewIds = Object.keys(mapInfo)

      const promises = jimuMapViewIds.map(async (jimuMapViewId) => {
        const jimuMapViewInfo = mapInfo[jimuMapViewId]

        if (jimuMapViewInfo) {
          const {
            enableAttributeSelection,
            dataSourceItems
          } = jimuMapViewInfo

          if (enableAttributeSelection && dataSourceItems?.length > 0) {
            const keyPrefix = `widgets.${this.widgetId}.config.mapInfo.${jimuMapViewId}`
            const keys = await getKeysOfDataSourceItems(keyPrefix, dataSourceItems)

            if (keys?.length > 0) {
              result.push(...keys)
            }
          }
        }
      })

      await Promise.all(promises)
    }

    return result
  }
}

async function getKeysOfDataSourceItems(keyPrefix: string, imDataSourceItems: ImmutableArray<DataSourceItem>): Promise<extensionSpec.TranslationKey[]> {
  const keys: extensionSpec.TranslationKey[] = []
  const dsManager = DataSourceManager.getInstance()
  const dataSourceItemWithIndexArray: DataSourceItemWithIndex[] = []

  if (imDataSourceItems?.length > 0) {
    imDataSourceItems.forEach((imDataSourceItem, itemIndex) => {
      if (imDataSourceItem.sqlExpression?.parts?.length > 0) {
        const dataSourceItemWithIndex: DataSourceItemWithIndex = {
          dataSourceItem: imDataSourceItem,
          itemIndex
        }

        dataSourceItemWithIndexArray.push(dataSourceItemWithIndex)
      }
    })

    if (dataSourceItemWithIndexArray.length > 0) {
      const dataSourceItems = dataSourceItemWithIndexArray.map(item => item.dataSourceItem)
      await createDataSources(dataSourceItems)

      dataSourceItemWithIndexArray.forEach((dataSourceItemWithIndex) => {
        const {
          dataSourceItem,
          itemIndex
        } = dataSourceItemWithIndex

        const ds = dsManager.getDataSource(dataSourceItem?.useDataSource?.dataSourceId)
        const dsLabel = ds?.getLabel() || ''

        if (dataSourceItem.sqlHint) {
          keys.push({
            keyType: 'value',
            key: `${keyPrefix}.dataSourceItems[${itemIndex}].sqlHint`,
            label: {
              key: 'labelForAttribution',
              enLabel: defaultMessage.labelForAttribution
            },
            nav: dsLabel,
            valueType: 'text'
          })
        }

        if (dataSourceItem.sqlExpression) {
          const sqlKeys = getKeysInSqlExprBuilder(dataSourceItem.sqlExpression, `${keyPrefix}.dataSourceItems[${itemIndex}].sqlExpression`)

          if (sqlKeys?.length > 0) {
            keys.push(...sqlKeys)
          }
        }
      })
    }
  }

  return keys
}

async function createDataSources (dataSourceItems: IMDataSourceItem[]) {
  if (dataSourceItems?.length > 0) {
    const dsManager = DataSourceManager.getInstance()
    const promises = dataSourceItems.map(async (dataSourceItem) => {
      try {
        await dsManager.createDataSourceByUseDataSource(dataSourceItem.useDataSource)
      } catch {
      }
    })
    await Promise.all(promises)
  }
}
