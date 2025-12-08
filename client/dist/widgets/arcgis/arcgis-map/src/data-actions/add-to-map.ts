import {
  type DataRecordSet,
  type ImmutableObject,
  type JimuMapViewInfo,
  type JSAPILayerMixin,
  type DataSource,
  AbstractDataAction,
  getAppStore,
  defaultMessages,
  MutableStoreManager,
  utils,
  i18n,
  DataSourceTypes,
  DataSourceStatus,
  DataLevel,
  CONSTANTS
} from 'jimu-core'
import { MapViewManager, ActionType, DataChangeType, DataChangeStatus, zoomToUtils } from 'jimu-arcgis'

export default class AddToMap extends AbstractDataAction {
  private readonly _viewManager = MapViewManager.getInstance()

  /**
   * AddToMap data action only supports DataLevel.DATA_SOURCE data, doesn't support DataLevel.RECORDS data.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return false
    }
    const dataSet = dataSets[0]
    const dataSource = dataSet?.dataSource as DataSource & JSAPILayerMixin
    const activeViewId = this._getActiveViewId(this.widgetId, getAppStore().getState().jimuMapViewsInfo)
    const jimuMapView = this._viewManager.getJimuMapViewById(activeViewId)
    if (!dataSource || dataSource.getStatus() === DataSourceStatus.NotReady) {
      return false
    }

    if (dataLevel !== DataLevel.DataSource) {
      return false
    }

    if (dataSource.type === DataSourceTypes.ElevationLayer) {
      return false
    }

    // SubtypeSublayer can't add to map directly, it must be a sublayer of SubtypeGrouplayer
    if (dataSource.type === DataSourceTypes.SubtypeSublayer) {
      return false
    }

    const dataSourceTypes3D: DataSourceTypes[] = [
      DataSourceTypes.SceneLayer,
      DataSourceTypes.SceneService,
      DataSourceTypes.BuildingSceneLayer,
      DataSourceTypes.BuildingGroupSubLayer,
      DataSourceTypes.BuildingComponentSubLayer
    ]

    if (dataSourceTypes3D.includes(dataSource.type as DataSourceTypes) && jimuMapView?.view?.type === '2d') {
      // can't add a scene layer to a 2d map
      return false
    }

    // #16797, avoid add multiple layers for the same dataSource
    if (jimuMapView && jimuMapView.view) {
      const addToMapLayers = jimuMapView.view.map.layers.toArray().filter(layer => layer.id && layer.id.includes(CONSTANTS.ADD_TO_MAP_DATA_ID_PREFIX))

      if (addToMapLayers.length > 0) {
        const isDsAlreadAddLayer = addToMapLayers.some((layer) => {
          const jimuLayerView = jimuMapView.getJimuLayerViewByAPILayer(layer)

          if (jimuLayerView && jimuLayerView.getLayerDataSource() === dataSource) {
            return true
          }

          return false
        })

        if (isDsAlreadAddLayer) {
          return false
        }
      }
    }

    const canDsCreateLayer = dataSource.supportSpatialInfo &&
                             dataSource.supportSpatialInfo() &&
                             !!dataSource.createJSAPILayerByDataSource &&
                             !dataSource.isInAppConfig() &&
                             dataSet.records?.length === 0

    return canDsCreateLayer
  }

  async onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    const activeViewId = this._getActiveViewId(this.widgetId, getAppStore().getState().jimuMapViewsInfo)
    const addToMapDatas = MutableStoreManager.getInstance().getStateValue([this.widgetId])?.addToMapDatas || {}
    const intl = i18n.getIntl()
    const dataSet = dataSets[0]
    const dataSetName = dataSet.name || ''
    const name = intl.formatMessage({ id: 'action_addedData', defaultMessage: defaultMessages.action_addedData }, { label: dataSetName })
    // save action data
    const id = `${CONSTANTS.ADD_TO_MAP_DATA_ID_PREFIX}dataAction_${utils.getUUID()}`
    addToMapDatas[id] = {
      mapWidgetId: this.widgetId,
      jimuMapViewId: activeViewId,
      dataSourceId: dataSet.dataSource.id,
      type: ActionType.DataAction,
      dataChangeType: DataChangeType.Create,
      dataChangeStatus: DataChangeStatus.Pending,
      title: name
    }
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'addToMapDatas', addToMapDatas)

    const jimuMapView = this._viewManager.getJimuMapViewById(activeViewId)
    if (jimuMapView) {
      (dataSet.dataSource as unknown as JSAPILayerMixin)?.createJSAPILayerByDataSource().then(layer => {
        zoomToUtils.zoomTo(jimuMapView?.view, layer, {
          padding: {
            left: 50,
            right: 50,
            top: 50,
            bottom: 50
          }
        })
      })
    }
    return await Promise.resolve(true)
  }

  private _getActiveViewId (mapWidgetId: string, infos: ImmutableObject<{ [jimuMapViewId: string]: JimuMapViewInfo }>): string {
    let activeViewId = Object.keys(infos || {}).find(viewId => infos[viewId].mapWidgetId === mapWidgetId && infos[viewId].isActive)
    // using a default map view as active map view if the widget hasn't been loaded.
    if (!activeViewId) {
      activeViewId = Object.keys(infos || {}).find(viewId => infos[viewId].mapWidgetId === mapWidgetId)
    }
    return activeViewId
  }
}
