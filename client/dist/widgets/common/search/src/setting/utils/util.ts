import { AppMessageManager, getAppConfigAction } from 'jimu-for-builder'
import { MessageType, getAppStore, Immutable, type MessageJson } from 'jimu-core'
import { messageActionUtils } from 'jimu-ui/advanced/builder-components'
const SHOW_ON_MAP_ACTION_NAME = 'showOnMap'
const ZOOM_TO_ACTION_NAME = 'zoomToFeature'
const ACTION_KEY_OF_MAP_CENTRIC = 'for_search_map_centric'

export function addShowOnMapAndZoomToActionWithMapCentric (widgetId: string, useMapWidgetId: string) {
  setShowOnMapAction(widgetId, useMapWidgetId)
  setRecordsSelectionChangeZoomToMapAction(widgetId, useMapWidgetId)
}

export function removeShowOnMapAndZoomToActionWithMapCentric (widgetId: string, useMapWidgetId: string) {
  removeShowOnMapActionWithMapCentric(widgetId, useMapWidgetId)
  removeRecordsSelectionChangeZoomToWithMapCentric(widgetId, useMapWidgetId)
}

function setShowOnMapAction (widgetId: string, useMapWidgetId: string) {
  setNewMapActionForMapCentric(widgetId, useMapWidgetId, MessageType.DataRecordSetChange, SHOW_ON_MAP_ACTION_NAME)
}

function removeShowOnMapActionWithMapCentric (widgetId: string, useMapWidgetId: string) {
  removeActionWithMapCentric(widgetId, useMapWidgetId, MessageType.DataRecordSetChange, SHOW_ON_MAP_ACTION_NAME)
}

function setRecordsSelectionChangeZoomToMapAction (widgetId: string, useMapWidgetId: string) {
  setNewMapActionForMapCentric(widgetId, useMapWidgetId, MessageType.DataRecordsSelectionChange, ZOOM_TO_ACTION_NAME)
}

function removeRecordsSelectionChangeZoomToWithMapCentric (widgetId: string, useMapWidgetId: string) {
  removeActionWithMapCentric(widgetId, useMapWidgetId, MessageType.DataRecordsSelectionChange, ZOOM_TO_ACTION_NAME)
}

function setNewMapActionForMapCentric (widgetId: string, useMapWidgetId: string, messageType: MessageType, actionName: string) {
  if (!useMapWidgetId || !widgetId) return
  const hasShowOnMapAction = checkIsHasShowOnMapAction(widgetId, useMapWidgetId, messageType, actionName)
  if (hasShowOnMapAction) return

  const action = AppMessageManager.getInstance().getAction(useMapWidgetId, actionName)
  if (!action) return

  const mapWidgets = getAppStore().getState().appStateInBuilder.appConfig.widgets?.[useMapWidgetId]
  const newActionItem = messageActionUtils.getNewActionItem(mapWidgets, action, widgetId, messageType)
  newActionItem.actionId = `${newActionItem.actionId}_${ACTION_KEY_OF_MAP_CENTRIC}`

  const message = getMessage(widgetId, messageType)
  const newActions = message?.actions?.filter(actions => !actions?.actionId?.includes(ACTION_KEY_OF_MAP_CENTRIC)) || []
  newActions.push(newActionItem)
  message.actions = newActions
  getAppConfigAction().editMessage(Immutable(message)).exec()
}

function removeActionWithMapCentric (widgetId: string, useMapWidgetId: string, messageType: MessageType, actionName: string) {
  const hasMapActionForMapCentric = checkIsHasShowOnMapAction(widgetId, useMapWidgetId, messageType, actionName)
  if (hasMapActionForMapCentric) {
    const message = getMessage(widgetId, messageType)
    const actionObj = AppMessageManager.getInstance().getAction(useMapWidgetId, actionName)
    if (actionObj) {
      actionObj.onRemoveListen(message.messageType, message.widgetId)
    }

    const newActions = message?.actions?.filter(actions => !actions?.actionId?.includes(ACTION_KEY_OF_MAP_CENTRIC)) || []
    if (newActions.length === 0) {
      getAppConfigAction().removeMessage(Immutable(message)).exec()
    } else {
      message.actions = newActions
      getAppConfigAction().editMessage(Immutable(message)).exec()
    }
  }
}

function getMessage (id: string, messageType: MessageType): MessageJson {
  let message
  const messageActionConfig = getAppStore().getState().appStateInBuilder.appConfig.messageConfigs?.asMutable({ deep: true })
  for (const messageId in messageActionConfig) {
    const messageActionConfigItem = messageActionConfig[messageId]
    if (messageActionConfigItem?.widgetId === id && messageActionConfigItem?.messageType === messageType) {
      message = messageActionConfigItem
    }
  }
  return message || messageActionUtils.getNewMessage(messageType, id)
}

function checkIsHasShowOnMapAction (widgetId: string, useMapWidgetId: string, messageType: MessageType, actionName: string) {
  const messageActionConfig = getAppStore().getState().appStateInBuilder.appConfig.messageConfigs
  let hasShowOnMapAction = false
  for (const id in messageActionConfig) {
    const messageActionConfigItem = messageActionConfig[id]
    if (messageActionConfigItem?.widgetId === widgetId && messageActionConfigItem?.messageType === messageType) {
      const actions = messageActionConfigItem?.actions
      actions.forEach(item => {
        if (item?.widgetId === useMapWidgetId && item?.actionName === actionName && item?.actionId?.includes(ACTION_KEY_OF_MAP_CENTRIC)) {
          hasShowOnMapAction = true
        }
      })
    }
  }
  return hasShowOnMapAction
}
