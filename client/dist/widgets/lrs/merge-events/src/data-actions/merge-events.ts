import {
  AbstractDataAction,
  type DataRecordSet,
  MutableStoreManager,
  DataLevel,
  getAppStore,
  DataSourceStatus,
  DataSourceTypes,
  Immutable,
  type FeatureLayerDataSource
} from 'jimu-core'
import { isDefined, LrsLayerType } from 'widgets/shared-code/lrs'

export default class ExportJson extends AbstractDataAction {

  isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return Promise.resolve(false)
    }

    // Don't show data action if less than two records are selected
    const dataSet = dataSets[0]
    if (dataSet.records.length < 2) {
      return Promise.resolve(false)
    }

    const { dataSource, records } = dataSet
    const typeIsLayer = dataSource.type === DataSourceTypes.FeatureLayer || dataSource.type === DataSourceTypes.SceneLayer
    const isDataSourceSet = dataSource.isDataSourceSet()
    const notRecordLevel = dataLevel !== DataLevel.Records
    const recordIsEmpty = dataLevel === DataLevel.Records && records?.length === 0
    const notInConfigAndNotLayer = !dataSource.isInAppConfig() && !typeIsLayer
    if (isDataSourceSet || notRecordLevel || recordIsEmpty || notInConfigAndNotLayer) {
      return Promise.resolve(false)
    }

    //Don't support if dataSource is not valid or notReady
    if (!dataSource || dataSource.getStatus() === DataSourceStatus.NotReady) {
      return Promise.resolve(false)
    }

    const ds = dataSource as FeatureLayerDataSource
    if (!isDefined(ds)) {
      return Promise.resolve(false)
    }

    const appConfig = getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]

    // check if the datasource is registered as a datasouce in addLineEvent widget
    let selectedLrsLayer
    widgetJson.config.lrsLayers.forEach((lrsLayer: any) => {
      if (lrsLayer.id === ds.id) {
        selectedLrsLayer = lrsLayer
      }
    })

    if (!isDefined(selectedLrsLayer)) {
      const mapViewsConfig = widgetJson.config.mapViewsConfig
      for (const mapId in mapViewsConfig) {
        if (mapViewsConfig[mapId].lrsLayers) {
          for (const lrsLayer of mapViewsConfig[mapId].lrsLayers) {
            if (lrsLayer.id === ds.id) {
              selectedLrsLayer = lrsLayer
            }
          }
        }
      }
    }

    if (!isDefined(selectedLrsLayer) || selectedLrsLayer.layerType !== LrsLayerType.Event) {
      return Promise.resolve(false)
    }
    return Promise.resolve(true)
  }


  onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    const dataSet = dataSets[0]
    const ds = dataSet.dataSource as FeatureLayerDataSource
    const appConfig = getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]

    // check if data action's datasource is registered as a datasouce in the associated widget
    let selectedLrsLayer
    widgetJson.config.lrsLayers.forEach((lrsLayer: any) => {
      if (lrsLayer.id === ds.id) {
        selectedLrsLayer = lrsLayer
      }
    })
    setTimeout(() => {
      MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedEventLyr', Immutable(selectedLrsLayer))
    }, 1000)
    return Promise.resolve(true)
  }
}

//get the whole app config
function getAppConfig () {
  return window.jimuConfig.isBuilder ? getAppStore().getState()?.appStateInBuilder?.appConfig : getAppStore().getState()?.appConfig
}
