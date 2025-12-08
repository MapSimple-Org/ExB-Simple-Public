import {
  AbstractMessageAction, type Message, type MessageDescription, getAppStore, appActions, type ImmutableObject,
  type RuntimeInfos, MessageType
  } from 'jimu-core'
import type { IMConfig, IMActionConfig } from '../config'
import { isWidgetOpening } from '../runtime/common/layout-utils'

export default class ToggleWidgetsAction extends AbstractMessageAction {
  private readonly supportedMessageTypes = [
    MessageType.ButtonClick
  ]

  filterMessageDescription (messageDescription: MessageDescription): boolean {
    return this.supportedMessageTypes.includes(messageDescription.messageType)
  }

  filterMessage (message: Message): boolean {
    return true
  }

  getDefaultMessageActionConfig = (message: Message) => {
    return {
      widgetIds: []
    }
  }

  onExecute (message: Message, actionConfig?: IMActionConfig): Promise<boolean> | boolean {
    if (!actionConfig) return Promise.resolve(true)
    const widgetIds = actionConfig?.widgetIds.asMutable()

    if (!widgetIds || widgetIds.length === 0) return Promise.resolve(true)
    const controllerId = this.widgetId
    const state = getAppStore().getState()
    const widgetConfig = state.appConfig.widgets[controllerId].config as IMConfig
    const isSingle = widgetConfig?.behavior?.onlyOpenOne
    const widgetsRuntimeInfo = state.widgetsRuntimeInfo ?? {} as ImmutableObject<RuntimeInfos>
    const openingWidgets = Object.keys(widgetsRuntimeInfo).filter(widgetId => {
      const runtimeInfo = widgetsRuntimeInfo[widgetId]
      return runtimeInfo.controllerWidgetId === controllerId && isWidgetOpening(runtimeInfo)
    })
    if (isSingle) {
      getAppStore().dispatch(appActions.closeWidgets(openingWidgets))
      if (!openingWidgets.includes(widgetIds[0])) {
        getAppStore().dispatch(appActions.openWidgets(widgetIds))
      }
    } else {
      const allOpen = widgetIds.every(id => openingWidgets.includes(id))
      if (allOpen) {
        getAppStore().dispatch(appActions.closeWidgets(widgetIds))
      } else {
        getAppStore().dispatch(appActions.openWidgets(widgetIds))
      }
    }
    return Promise.resolve(true)
  }
}
