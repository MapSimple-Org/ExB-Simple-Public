import { DataSourceManager, WidgetVersionManager, type WidgetUpgradeInfo } from 'jimu-core'
import { FilterArrangeType, FilterItemType, FilterTriggerType, type IMConfig } from './config'
import { updateSQLExpressionByVersion } from 'jimu-ui/basic/sql-expression-runtime'
import { getAllUsedFieldsByDataSourceId } from './setting/utils'

const getAllDs = async function (filterItems): Promise<any> {
  const promises = []
  const dsManager = DataSourceManager.getInstance()
  filterItems && filterItems.forEach(item => {
    if (item.sqlExprObj) {
      promises.push(
        dsManager.createDataSourceByUseDataSource(Object.assign({}, item.dataSource, { mainDataSourceId: item.dataSource.dataSourceId }))
      )
    }
  })
  return Promise.all(promises)
}

class VersionManager extends WidgetVersionManager {
  versions = [{
    version: '1.1.0',
    description: '',
    upgrader: async (oldConfig) => {
      return await getAllDs(oldConfig.filterItems).then((dsList) => {
        let newConfig = oldConfig
        newConfig = newConfig.set('arrangeType', FilterArrangeType.Block)
        newConfig = newConfig.set('triggerType', FilterTriggerType.Toggle)
        newConfig = newConfig.set('wrap', false)
        newConfig = newConfig.set('omitInternalStyle', false)

        const newFItems = dsList.map((ds, index) => {
          const fItem = newConfig.filterItems[index]
          return Object.assign({}, fItem, {
            sqlExprObj: fItem.sqlExprObj ? updateSQLExpressionByVersion(fItem.sqlExprObj, '1.1.0', ds) : null,
            icon: fItem.icon.setIn(['properties', 'color'], null),
            useDataSource: Object.assign({}, fItem.dataSource, { mainDataSourceId: fItem.dataSource.dataSourceId })
          })
        })
        newConfig = newConfig.set('filterItems', newFItems)

        return newConfig
      })
    }
  }, {
    version: '1.14.0',
    description: '',
    upgrader: (oldConfig) => {
      const newFItems = oldConfig.filterItems.map(fItem => {
        fItem = fItem
          .set('isGroup', false)
          .set('useDataSources', [fItem.useDataSource])
          .without('useDataSource')
        return fItem
      })
      const newConfig = oldConfig.set('filterItems', newFItems)
      return newConfig
    }
  }, {
    version: '1.16.0',
    description: '',
    upgrader: (oldConfig) => {
      const newFItems = oldConfig.filterItems.map(fItem => {
        return fItem.set('type', fItem.isGroup ? 'GROUP' : 'SINGLE').without('isGroup')
      })
      const newConfig = oldConfig.set('filterItems', newFItems)
      return newConfig
    }
  }, {
    version: '1.17.0',
    description: 'Remove custom and groupByLayer from config, update widget useDss fields from group filter items',
    upgradeFullInfo: true,
    upgrader: (oldInfo: WidgetUpgradeInfo) => {
      const config: IMConfig = oldInfo.widgetJson.config
      const newConfig = config.without('custom' as any).without('groupByLayer' as any)
      let widgetJson = oldInfo.widgetJson.set('config', newConfig)
      // update useDss fields for group items
      if (newConfig.filterItems?.length && newConfig.filterItems.filter(item => item.type === FilterItemType.Group).length) {
        const newWidgetUseDss = oldInfo.widgetJson.useDataSources.asMutable({ deep: true })
        newWidgetUseDss.forEach(useDs => {
          const fields = getAllUsedFieldsByDataSourceId(newConfig.filterItems as any, useDs.dataSourceId)
          useDs.fields = fields
        })
        widgetJson = widgetJson.set('useDataSources', newWidgetUseDss)
      }
      const widgetInfo = { ...oldInfo, widgetJson }
      return widgetInfo
    }
  }]
}

export const versionManager: WidgetVersionManager = new VersionManager()
