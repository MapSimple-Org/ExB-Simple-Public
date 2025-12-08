import {
  type DataRecordSet,
  type ImmutableObject,
  type JimuMapViewInfo,
  AbstractDataAction,
  getAppStore,
  DataSourceStatus,
  MutableStoreManager,
  utils,
  DataLevel,
  CONSTANTS
} from 'jimu-core'
import { MapViewManager, ActionType, type ShowOnMapDatas, type ShowOnMapData, type SymbolOption } from 'jimu-arcgis'
import { type IMShowOnMapConfig, getUniqueTitleCountInfo } from '../common/show-on-map-common'

export default class ShowOnMap extends AbstractDataAction {
  private readonly _viewManager = MapViewManager.getInstance()

  /**
   * ShowOnMap data action only supports DataLevel.RECORDS data, doesn't support DataLevel.DATA_SOURCE data.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return false
    }
    const dataSet = dataSets[0]
    const { records, dataSource } = dataSet
    if (!dataSource || dataSource.getStatus() === DataSourceStatus.NotReady) {
      return false
    }
    // @ts-expect-error
    return dataLevel === DataLevel.Records && records?.length > 0 && records.some(record => record.feature?.geometry)
  }

  async onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string, actionConfig?: IMShowOnMapConfig): Promise<boolean> {
    const activeViewId = this._getActiveViewId(this.widgetId, getAppStore().getState().jimuMapViewsInfo)
    const showOnMapDatas: ShowOnMapDatas = MutableStoreManager.getInstance().getStateValue([this.widgetId])?.showOnMapDatas || {}

    const dataSet = dataSets[0]
    const titleCountInfo = getUniqueTitleCountInfo(dataSet, activeViewId, showOnMapDatas)

    // save action data
    const id = `${CONSTANTS.SHOW_ON_MAP_DATA_ID_PREFIX}dataAction_${utils.getUUID()}`

    // use code to maintain 'symbolOption' compatibility here
    // For app was created before online10.1 (include 10.1), actionConfig is undefined, the final 'symbolOption' is undefined.
    // For app was created or saved after online10.1, actionConfig is a object,
    //  if actionConfig.isUseCustomSymbol is true, means check 'Use custom symbols' option, the final 'symbolOption' is actionConfig.symbolOption
    //  if actionConfig.isUseCustomSymbol is false, means uncheck 'Use layer-defined symbols' option, the final 'symbolOption' is null

    // Summary:
    // for 'symbolOption', the difference between the values 'undefined' and 'null':
    //   undefined: app was created before online10.1 (include 10.1), use default symbol;
    //   null: app was created or saved after online10.1, use default renderer of layer.
    // symbolOption: actionConfig?.isUseCustomSymbol ? actionConfig.symbolOption : (actionConfig?.isUseCustomSymbol === false ? null : undefined),
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

    const newShowOnMapData: ShowOnMapData = {
      mapWidgetId: this.widgetId,
      // messageWidgetId is only available for message action, so keep it empty for data action
      messageWidgetId: undefined,
      jimuMapViewId: activeViewId,
      dataSet,
      title: titleCountInfo.finalTitle,
      type: ActionType.DataAction,
      symbolOption,
      isOperationalLayer,
      titleCountInfo
    }

    showOnMapDatas[id] = newShowOnMapData
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'showOnMapDatas', showOnMapDatas)

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
