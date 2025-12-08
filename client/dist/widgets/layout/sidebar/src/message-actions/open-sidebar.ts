import {
  AbstractMessageAction,
  getAppStore,
  appActions,
  MessageType,
  AppMode,
  type MessageDescription,
  type Message,
  type DataRecordsSelectionChangeMessage
} from 'jimu-core'
import type { ActionConfig } from './types'

export default class OpenSidebarAction extends AbstractMessageAction {
  getDefaultMessageActionConfig () {
    return {}
  }

  filterMessageDescription (messageDescription: MessageDescription): boolean {
    const appMode = getAppStore().getState().appRuntimeInfo.appMode
    if (appMode === AppMode.Express) {
      return messageDescription.messageType === MessageType.ButtonClick ||
      messageDescription.messageType === MessageType.ViewChange
    } else {
      return messageDescription.messageType === MessageType.ButtonClick ||
        messageDescription.messageType === MessageType.ViewChange ||
        messageDescription.messageType === MessageType.DataRecordsSelectionChange
    }
  }

  filterMessage (): boolean {
    return true
  }

  getSettingComponentUri (messageType: MessageType): string {
    const appMode = getAppStore().getState().appRuntimeInfo.appMode
    if (messageType === MessageType.DataRecordsSelectionChange) {
      return appMode === AppMode.Express ? null : 'message-actions/open-sidebar-setting'
    } else {
      return null
    }
  }

  onExecute (message: Message, actionConfig?: ActionConfig): Promise<boolean> | boolean {
    if (message.type === MessageType.DataRecordsSelectionChange) {
      const dsMsg = message as DataRecordsSelectionChangeMessage
      if (!dsMsg.records || dsMsg.records.length === 0) {
        return true
      }
      if (actionConfig?.useDataSources?.length > 0) {
        const dsId = dsMsg.records[0].dataSource.id

        const isMatchDataSource = actionConfig.useDataSources.some(useDataSource => {
          return useDataSource.dataSourceId === dsId || useDataSource.mainDataSourceId === dsId
        })

        if (!isMatchDataSource) {
          return true
        }
      }
    }
    getAppStore().dispatch(appActions.widgetStatePropChange(this.widgetId, 'collapse', true))
    return true
  }
}
