import {
  AbstractMessageAction, MessageType, type Message, type DataSourcesChangeMessage, DataSourcesChangeType, MutableStoreManager, CONSTANTS,
  getAppStore, type ImmutableObject, type JimuMapViewInfo, type MessageDescription, type DataSource, DataSourceTypes, type JSAPILayerMixin
} from 'jimu-core'
import { ActionType, type AddToMapDatas, DataChangeType, DataChangeStatus, MapViewManager } from 'jimu-arcgis'

export default class AddToMapAction extends AbstractMessageAction {
  filterMessageDescription (messageDescription: MessageDescription): boolean {
    if (messageDescription.messageType === MessageType.DataSourcesChange) {
      return true
    } else {
      return false
    }
  }

  filterMessage (message: Message): boolean {
    return true
  }

  onRemoveListen (messageType: MessageType, messageWidgetId?: string) {
    const addToMapDatas: AddToMapDatas = MutableStoreManager.getInstance().getStateValue([this.widgetId])?.addToMapDatas || {}
    const newAddToMapDatas = {}
    Object.entries(addToMapDatas).forEach(entry => {
      if (entry[1]?.messageWidgetId !== messageWidgetId) {
        newAddToMapDatas[entry[0]] = entry[1] //*********
      }
    })
    // save action data
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'addToMapDatas', newAddToMapDatas)
  }

  onExecute (message: DataSourcesChangeMessage, actionConfig?: any): Promise<boolean> | boolean {
    const activeViewId = this._getActiveViewId(this.widgetId, getAppStore().getState().jimuMapViewsInfo)
    const defaultViewId = this._getDefaultViewId(this.widgetId, getAppStore().getState().jimuMapViewsInfo)
    const jimuMapViewId = activeViewId || defaultViewId
    const addToMapDatas = MutableStoreManager.getInstance().getStateValue([this.widgetId])?.addToMapDatas || {}

    message.dataSources.forEach(dataSourceParam => {
      const dataSource = dataSourceParam as DataSource & JSAPILayerMixin
      if (!dataSource.supportSpatialInfo || !dataSource.supportSpatialInfo()) {
        return
      }

      if (dataSource.type === DataSourceTypes.ElevationLayer) {
        return
      }

      // SubtypeSublayer can't add to map directly, it must be a sublayer of SubtypeGrouplayer
      if (dataSource.type === DataSourceTypes.SubtypeSublayer) {
        return false
      }

      const jimuMapView = activeViewId && MapViewManager.getInstance().getJimuMapViewById(activeViewId)
      const dataSourceTypes3D: DataSourceTypes[] = [
        DataSourceTypes.SceneLayer,
        DataSourceTypes.SceneService,
        DataSourceTypes.BuildingSceneLayer,
        DataSourceTypes.BuildingGroupSubLayer,
        DataSourceTypes.BuildingComponentSubLayer
      ]

      if (dataSourceTypes3D.includes(dataSource.type as DataSourceTypes) && jimuMapView?.view?.type === '2d') {
        // can't add a scene layer to a 2d map
        return
      }
      const idBase = `${CONSTANTS.ADD_TO_MAP_DATA_ID_PREFIX}messageAction_${this.widgetId}_${dataSource.id}_`
      const idTemporary = `${idBase}???`
      const id = activeViewId ? `${idBase}${activeViewId}` : idTemporary

      if (defaultViewId && defaultViewId === activeViewId) {
        // allow to add data using a temporary id, temporary id data will be deleted if can get activeViewId
        if (addToMapDatas[idTemporary]) {
          MutableStoreManager.getInstance().updateStateValue(this.widgetId, `addToMapDatas.${idTemporary}.dataChangeType`, DataChangeType.Remove)
        }
      }

      addToMapDatas[id] = {
        mapWidgetId: this.widgetId,
        messageWidgetId: message.widgetId,
        // Set jimuMapViewId to null means the data will be shared between all jimuMapViews of one mapWidget
        jimuMapViewId: jimuMapViewId, // activeViewId,
        dataSourceId: dataSource.id,
        type: ActionType.MessageAction,
        dataChangeType: message.changeType === DataSourcesChangeType.Remove ? DataChangeType.Remove : DataChangeType.Create,
        dataChangeStatus: message.changeType === DataSourcesChangeType.Remove ? DataChangeStatus.Fulfilled : DataChangeStatus.Pending,
        title: id // 'add to map message ...'
      }
    })

    // save action data
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'addToMapDatas', addToMapDatas)
    return Promise.resolve(true)
  }

  private _getActiveViewId (mapWidgetId: string, infos: ImmutableObject<{ [jimuMapViewId: string]: JimuMapViewInfo }>): string {
    return Object.keys(infos || {}).find(viewId => infos[viewId].mapWidgetId === mapWidgetId && infos[viewId].isActive)
  }

  private _getDefaultViewId (mapWidgetId: string, infos: ImmutableObject<{ [jimuMapViewId: string]: JimuMapViewInfo }>): string {
    return Object.keys(infos || {}).find(viewId => infos[viewId].mapWidgetId === mapWidgetId)
  }
}
