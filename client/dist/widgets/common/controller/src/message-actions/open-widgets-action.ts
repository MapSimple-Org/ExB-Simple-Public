import {
  AbstractMessageAction, type Message, type MessageDescription, getAppStore, appActions, type ImmutableObject,
  type RuntimeInfos, MessageType, type DataRecordsSelectionChangeMessage, type SceneLayerDataSource,
  type FeatureLayerDataSource, type BuildingComponentSubLayerDataSource, AppMode
} from 'jimu-core'
import type { IMConfig, IMActionConfig } from '../config'
import { isWidgetOpening } from '../runtime/common/layout-utils'

export default class OpenWidgetsAction extends AbstractMessageAction {
  private readonly supportedMessageTypes = [
    MessageType.ButtonClick,
    MessageType.DataRecordsSelectionChange
  ]

  private readonly supportedMessageTypesInExpressMode = [
    MessageType.ButtonClick
  ]

  filterMessageDescription (messageDescription: MessageDescription): boolean {
    const appMode = getAppStore().getState().appRuntimeInfo.appMode
    if (appMode === AppMode.Express) {
      return this.supportedMessageTypesInExpressMode.includes(messageDescription.messageType)
    } else {
      return this.supportedMessageTypes.includes(messageDescription.messageType)
    }
  }

  filterMessage (message: Message): boolean {
    return true
  }

  getDefaultMessageActionConfig = (message: Message) => {
      return {
        widgetIds: [],
        useDataSources: []
      }
    }

  onExecute (message: Message, actionConfig?: IMActionConfig): Promise<boolean> | boolean {
    let widgetIds = actionConfig?.widgetIds?.asMutable?.()
    if (!widgetIds || widgetIds.length === 0) return Promise.resolve(true)
    let isSelectionEmpty = false
    let notTriggerData = false
    if (message.type === MessageType.DataRecordsSelectionChange) {
      const selectionMessage = message as DataRecordsSelectionChangeMessage
      if ((selectionMessage.records || []).length === 0) {
        isSelectionEmpty = true
      } else {
        const ds = selectionMessage.records[0].dataSource
        const dsId = ds.id
        const mainDsId = ds.getMainDataSource()?.id
        const rootDsId = ds.getRootDataSource()?.id
        const associatedDsId = (ds as SceneLayerDataSource | FeatureLayerDataSource | BuildingComponentSubLayerDataSource)?.getAssociatedDataSource?.()?.id
        // If there's no trigger data, selecting all use data sources will trigger this action.
        // When there's one or more trigger data, only selecting these data can trigger this action.
        if (actionConfig.useDataSources && actionConfig.useDataSources.length > 0) {
          const isTriggerData = actionConfig.useDataSources.some(useDs => [dsId, mainDsId, rootDsId, associatedDsId].includes(useDs.mainDataSourceId))
          if (!isTriggerData) notTriggerData = true
        }
      }
    }
    if (!actionConfig || isSelectionEmpty || notTriggerData) return Promise.resolve(true)
    const controllerId = this.widgetId
    const state = getAppStore().getState()
    const widgetConfig = state.appConfig.widgets[controllerId].config as IMConfig
    const isSingle = widgetConfig?.behavior?.onlyOpenOne
    if (isSingle) {
      const widgetsRuntimeInfo = state.widgetsRuntimeInfo ?? {} as ImmutableObject<RuntimeInfos>
      const openingWidgets = Object.keys(widgetsRuntimeInfo).filter(widgetId => {
        const runtimeInfo = widgetsRuntimeInfo[widgetId]
        return runtimeInfo.controllerWidgetId === controllerId && isWidgetOpening(runtimeInfo)
      })
      if (openingWidgets.length > 0) {
        getAppStore().dispatch(appActions.closeWidgets(openingWidgets))
      }
      if (widgetIds.length > 1) {
        widgetIds = widgetIds.slice(0, 1)
      }
    }
    getAppStore().dispatch(appActions.openWidgets(widgetIds))
    return Promise.resolve(true)
  }
}
