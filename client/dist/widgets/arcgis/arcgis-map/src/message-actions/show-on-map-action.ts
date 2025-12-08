import {
  AbstractMessageAction, MessageType, type Message, type DataRecordSetChangeMessage, RecordSetChangeType, MutableStoreManager,
  getAppStore, type ImmutableObject, type JimuMapViewInfo, type MessageDescription, DataSourceManager, CONSTANTS
} from 'jimu-core'
import { ActionType, type ShowOnMapDatas, type ShowOnMapData, type SymbolOption, type TitleCountInfo } from 'jimu-arcgis'
import { type ShowOnMapConfig, type IMShowOnMapConfig, getDefaultShowOnMapConfig, getUniqueTitleCountInfo } from '../common/show-on-map-common'
import { getDsByWidgetId, isSpecialCaseOfSearchWidget } from './action-utils'

export default class ShowOnMapAction extends AbstractMessageAction {
  filterMessageDescription (messageDescription: MessageDescription): boolean {
    if (messageDescription.messageType === MessageType.DataRecordSetChange) {
      const dataSourceManager = DataSourceManager.getInstance()
      const messageWidgetUseDataSources = getDsByWidgetId(messageDescription.widgetId, messageDescription.messageType)

      // See the code comment of isSpecialCaseOfSearchWidget() for more details.
      if (messageWidgetUseDataSources.length === 0 && isSpecialCaseOfSearchWidget(messageDescription)) {
        return true
      }

      return messageWidgetUseDataSources.some(useDataSource => {
        const ds = dataSourceManager.getDataSource(useDataSource.dataSourceId)

        // widget1 send message to map widget, ds comes from widget1.useDataSources.

        if (ds) {
          // #16835, ds maybe not ready when the ExB app is opened and add the message action immediately in widget action setting
          return !!ds.getGeometryType()
        }

        return false
      })
    } else {
      return false
    }
  }

  filterMessage (message: Message): boolean {
    return true
  }

  getDefaultMessageActionConfig (message: Message): ShowOnMapConfig {
    const defaultConfig: ShowOnMapConfig = getDefaultShowOnMapConfig()
    return defaultConfig
  }

  onRemoveListen (messageType: MessageType, messageWidgetId?: string) {
    const showOnMapDatas: ShowOnMapDatas = MutableStoreManager.getInstance().getStateValue([this.widgetId])?.showOnMapDatas || {}
    const newShowOnMapDatas = {}
    Object.entries(showOnMapDatas).forEach(entry => {
      if (entry[1]?.messageWidgetId !== messageWidgetId) {
        newShowOnMapDatas[entry[0]] = entry[1]
      }
    })
    // save action data
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'showOnMapDatas', newShowOnMapDatas)
  }

  getSettingComponentUri (messageType: MessageType, messageWidgetId?: string): string {
    // display show-on-map setting for both full mode and express mode
    return 'message-actions/show-on-map-action-setting'
  }

  onExecute (message: DataRecordSetChangeMessage, actionConfig?: IMShowOnMapConfig): Promise<boolean> | boolean {
    if (message.type !== MessageType.DataRecordSetChange) {
      return
    }

    const activeViewId = this._getActiveViewId(this.widgetId, getAppStore().getState().jimuMapViewsInfo)
    const defaultViewId = this._getDefaultViewId(this.widgetId, getAppStore().getState().jimuMapViewsInfo)
    const jimuMapViewId = activeViewId || defaultViewId
    let showOnMapDatas: ShowOnMapDatas = MutableStoreManager.getInstance().getStateValue([this.widgetId])?.showOnMapDatas || {}

    if (message.changeType === RecordSetChangeType.CreateUpdate) {
      message.dataRecordSets?.forEach(dataRecordSet => {
        const idBase = this._getIdBase(dataRecordSet.name)
        const idTemporary = `${idBase}???`
        // id is used as layerId
        const id = activeViewId ? `${idBase}${activeViewId}` : idTemporary

        if (defaultViewId && defaultViewId === activeViewId) {
          // allow to add data using a temporary id, temporary id data will be deleted if can get activeViewId
          // handle situation:
          //   if the map widget has not been loaded in another page and the map widget has two views (view1 and view2),
          //   the view id is unknown at this time, so ues a temporary view id to add data first, until the page is
          //   loaded and add data again, delete the data corresponding to this temporary view id and use current
          //   active view id to add data.
          delete showOnMapDatas[idTemporary]
        }

        // use code to maintain compatibility here
        // for 'symbolOption', the difference between the values 'undefined' and 'null':
        //   undefined: app was created before online10.1 (include 10.1), use default symbol;
        //   null: app was created or saved after online10.1, use default renderer of layer.
        // const symbolOption: SymbolOption = actionConfig?.isUseCustomSymbol ? actionConfig.symbolOption : (actionConfig?.isUseCustomSymbol === false ? null : undefined)

        let symbolOption: SymbolOption

        if (actionConfig) {
          // > online 10.1
          if (actionConfig.isUseCustomSymbol) {
            // 'Use custom symbols' option
            symbolOption = actionConfig.symbolOption as unknown as SymbolOption
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
          } else if (actionConfig.isUseCustomSymbol === false) {
            // 'Use layer-defined symbols' option
            symbolOption = null
          } else {
            // should not goes here
            symbolOption = undefined
          }
        } else {
          // <= online 10.1
          // use featureUtils.getDefaultSymbol() to create default 2D symbol
          symbolOption = undefined
        }

        const isOperationalLayer = actionConfig?.isOperationalLayer

        let titleCountInfo: TitleCountInfo = null
        const oldShowOnMapData = showOnMapDatas[id]

        if (oldShowOnMapData) {
          // If showOnMapDatas[id] is not empty, it means this is an update operation.
          // For update operation, we don't need to create a new title, just reuse the old one.
          titleCountInfo = oldShowOnMapData.titleCountInfo
        } else {
          // If showOnMapDatas[id] is empty, it means this is a create operation.
          // Fore create operation, we need to create a new title.
          titleCountInfo = getUniqueTitleCountInfo(dataRecordSet, activeViewId, showOnMapDatas)
        }

        const showOnMapData: ShowOnMapData = {
          mapWidgetId: this.widgetId,
          messageWidgetId: message.widgetId,
          // Set jimuMapViewId to null means the data will be shared between all jimuMapViews of one mapWidget
          jimuMapViewId: jimuMapViewId, // activeViewId,
          dataSet: dataRecordSet,
          // title: id, // 'Show on map message ...'
          title: titleCountInfo.finalTitle,
          type: ActionType.MessageAction,
          symbolOption,
          isOperationalLayer,
          titleCountInfo
        }

        showOnMapDatas[id] = showOnMapData
      })
    } else if (message.changeType === RecordSetChangeType.Remove) {
      message.dataRecordSetNames.forEach(dataRecordSetName => {
        const idBase = this._getIdBase(dataRecordSetName)

        // delete showOnMapDatas[id]
        const newShowOnMapDatas = {}
        Object.entries(showOnMapDatas).forEach(entry => {
          if (entry[0].indexOf(idBase) !== 0) {
            newShowOnMapDatas[entry[0]] = entry[1]
          }
        })
        showOnMapDatas = newShowOnMapDatas
      })
    }

    // save action data
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'showOnMapDatas', showOnMapDatas)
    return Promise.resolve(true)
  }

  private _getIdBase (dataRecordSetName: string): string {
    return `${CONSTANTS.SHOW_ON_MAP_DATA_ID_PREFIX}messageAction_${this.widgetId}_${dataRecordSetName}_`
  }

  private _getActiveViewId (mapWidgetId: string, infos: ImmutableObject<{ [jimuMapViewId: string]: JimuMapViewInfo }>): string {
    return Object.keys(infos || {}).find(viewId => infos[viewId].mapWidgetId === mapWidgetId && infos[viewId].isActive)
  }

  private _getDefaultViewId (mapWidgetId: string, infos: ImmutableObject<{ [jimuMapViewId: string]: JimuMapViewInfo }>): string {
    return Object.keys(infos || {}).find(viewId => infos[viewId].mapWidgetId === mapWidgetId)
  }
}
