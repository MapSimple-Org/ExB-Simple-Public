import { type DataSource, DataSourceManager, type FeatureLayerDataSource, Immutable, type ImmutableArray, type JSAPILayerMixin, SupportedLayerServiceTypes, type WidgetUpgradeInfo, WidgetVersionManager } from 'jimu-core'
import { EditModeType, type IMConfig, LayerHonorModeType, type MapViewConfig, SnapSettingMode } from './config'
import { INVISIBLE_FIELD } from './utils'

class VersionManager extends WidgetVersionManager {
  versions = [{
    version: '1.7.0',
    description: 'Add layerHonorMode to config for support smart form.',
    upgrader: async (oldConfig) => {
      let newConfig = oldConfig
      const decoupleNested = (groupSubItems, fieldsConfig) => {
        const unNestedFields = []
        const recursion = (subItems) => {
          subItems.forEach(item => {
            if (item.groupKey) {
              recursion(item.children)
            } else {
              const subOrgField = fieldsConfig.find(config => config.name === item.jimuName)
              if (!INVISIBLE_FIELD.includes(item.jimuName)) {
                unNestedFields.push({
                  ...item,
                  editable: subOrgField?.editable,
                  editAuthority: subOrgField?.editable ? item?.editAuthority : false
                })
              }
            }
          })
          return unNestedFields
        }
        return recursion(groupSubItems)
      }
      return await Promise.all(
        newConfig.layersConfig.map(layerConfig => {
          return new Promise(resolve => {
            DataSourceManager.getInstance().createDataSourceByUseDataSource(layerConfig.useDataSource).then(currentDs => {
              const layerDefinition = (currentDs as FeatureLayerDataSource)?.getLayerDefinition()
              const fieldsConfig = layerDefinition?.fields || []
              const newGroupedFields = layerConfig.groupedFields.map(field => {
                const orgField = fieldsConfig.find(config => config.name === field.jimuName)
                if (field.groupKey) {
                  return {
                    ...field,
                    editable: true,
                    editAuthority: !field?.children?.some(item => item.editAuthority === false),
                    children: decoupleNested(field?.children, fieldsConfig)
                  }
                }
                return {
                  ...field,
                  editable: orgField?.editable,
                  editAuthority: orgField?.editable ? field?.editAuthority : false
                }
              }).filter(
                item => !INVISIBLE_FIELD.includes(item.jimuName)
              )
              resolve(newGroupedFields)
            }).catch(() => {
              resolve([])
            })
          })
        })
      ).then(res => {
        res.forEach((resItem: ImmutableArray<any>, i) => {
          const selectedFields = newConfig.layersConfig[i].showFields.filter(
            item => !INVISIBLE_FIELD.includes(item.jimuName)
          )
          let unGroupedFields = []
          const resGroupedFields = resItem.asMutable({ deep: true })
          resItem.forEach(item => {
            if (item.groupKey) {
              unGroupedFields = unGroupedFields.concat(item.children)
            } else {
              unGroupedFields.push(item)
            }
          })
          selectedFields.forEach(ele => {
            if (!unGroupedFields.find(field => field.jimuName === ele.jimuName)) {
              resGroupedFields.push(ele)
            }
          })
          newConfig = newConfig.setIn(['layersConfig', i, 'groupedFields'], Immutable(resGroupedFields))
          newConfig = newConfig.setIn(['layersConfig', i, 'layerHonorMode'], LayerHonorModeType.Custom)
        })
        return Promise.resolve(newConfig)
      }).catch(() => {
        return Promise.resolve(newConfig)
      })
    }
  }, {
    version: '1.10.0',
    description: 'Set old app default snapping to true',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      newConfig = newConfig.set('selfSnapping', true).set('featureSnapping', true)
      return newConfig
    }
  }, {
    version: '1.12.0',
    description: 'Set "undefined" option to "false", and remove not editable layer',
    upgrader: async (oldConfig) => {
      let newConfig = oldConfig
      const isGeometryMode = newConfig.editMode === EditModeType.Geometry
      const dsManager = DataSourceManager.getInstance()
      const newLayersConfig = []
      for (const config of newConfig.layersConfig) {
        let dataSource
        try {
          dataSource = await dsManager.createDataSourceByUseDataSource(config?.useDataSource)
        } catch (error) {
          console.error(error)
        }
        if (!dataSource) {
          newLayersConfig.push(config)
          continue
        }
        const layerDefinition = dataSource?.getLayerDefinition()
        const isTable = dataSource?.layer?.isTable || layerDefinition?.type === SupportedLayerServiceTypes.Table
        if (isGeometryMode && isTable) continue
        const allowGeometryUpdates = layerDefinition?.allowGeometryUpdates
        const layerEditingEnabled = dataSource?.layer?.editingEnabled ?? true
        if (layerEditingEnabled) {
          let newLayerConfig
          if (config.updateGeometries) {
            newLayerConfig = {
              ...config,
              updateRecords: true,
              updateAttributes: true,
              updateGeometries: allowGeometryUpdates && true
            }
          } else {
            newLayerConfig = {
              ...config,
              updateRecords: false,
              updateAttributes: false,
              updateGeometries: false

            }
          }
          newLayersConfig.push(newLayerConfig)
        }
      }
      newConfig = newConfig.setIn(['layersConfig'], newLayersConfig)
      return newConfig
    }
  }, {
    version: '1.13.0',
    description: 'Update snap options',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      if (newConfig.selfSnapping) {
        newConfig = newConfig.set('defaultSelfEnabled', true)
      }
      if (newConfig.featureSnapping) {
        newConfig = newConfig.set('defaultFeatureEnabled', true)
      }
      return newConfig
    }
  }, {
    version: '1.14.0',
    description: 'Add predefine snapping options',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      newConfig = newConfig.set('snapSettingMode', SnapSettingMode.Flexible)
      return newConfig
    }
  }, {
    version: '1.15.0',
    description: 'Add general setting options',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      newConfig = newConfig.set('tooltip', true).set('templateFilter', true).set('relatedRecords', true)
      return newConfig
    }
  }, {
    version: '1.16.0',
    description: 'Update map mode config',
    upgradeFullInfo: true,
    upgrader: async (oldInfo: WidgetUpgradeInfo) => {
      const oldWidgetJson = oldInfo.widgetJson
      const oldConfig = oldWidgetJson.config as IMConfig
      if (!oldConfig) return oldInfo
      let newConfig = oldConfig
      const { editMode, layersConfig } = oldConfig
      const isEditMode = editMode === EditModeType.Geometry
      const newMapViewsConfig: { [jimuMapViewId: string]: MapViewConfig } = {}

      const getJimuLayerViewIdByLayerDsId = async (layerDsId: string, mapDsId: string, jimuMapViewId: string) => {
        try {
          const layerDs = await DataSourceManager.getInstance().createDataSourceByUseDataSource(Immutable({
            dataSourceId: layerDsId,
            mainDataSourceId: layerDsId,
            rootDataSourceId: mapDsId
          }))
          if (!layerDs) {
            console.error('Cannot create layer data source.', layerDsId)
            return null
          }
          const jimuLayerViewId = `${jimuMapViewId}-${(layerDs as JSAPILayerMixin & DataSource).jimuLayerId}`
          return jimuLayerViewId
        } catch (error) {
          console.error('Cannot create layer data source.', error)
          return null
        }
      }

      if (isEditMode) {
        const useMapWidgetId = oldWidgetJson.useMapWidgetIds[0]
        for (const config of layersConfig) {
          const layerDsId = config.id
          const i = layerDsId.indexOf('-')
          const mapDsId = config.id.substring(0, i)
          const jimuMapView = `${useMapWidgetId}-${mapDsId}` // like 'widget_1-dataSource_1'
          const jimuLayerViewId = await getJimuLayerViewIdByLayerDsId(layerDsId, mapDsId, jimuMapView)
          if (!jimuLayerViewId) continue
          const mutableConfig = (config as any).asMutable({ deep: true })
          if (newMapViewsConfig[jimuMapView]) {
            newMapViewsConfig[jimuMapView].customJimuLayerViewIds.push(jimuLayerViewId)
            const orgLayersConfig = newMapViewsConfig[jimuMapView].layersConfig
            const newLayersConfig = orgLayersConfig
            newLayersConfig.push(mutableConfig)
            newMapViewsConfig[jimuMapView].layersConfig = newLayersConfig
          } else {
            const newViewConfig: MapViewConfig = {
              customizeLayers: true,
              customJimuLayerViewIds: [jimuLayerViewId],
              layersConfig: [mutableConfig]
            }
            newMapViewsConfig[jimuMapView] = newViewConfig
          }
        }
        newConfig = newConfig.set('mapViewsConfig', newMapViewsConfig)
      }
      const widgetJson = oldWidgetJson.set('config', Immutable(newConfig))
      const widgetInfo = { ...oldInfo, widgetJson }
      return widgetInfo
    }
  }]
}

export const versionManager: WidgetVersionManager = new VersionManager()
