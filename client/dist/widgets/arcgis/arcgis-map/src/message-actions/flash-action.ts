import {
  AbstractMessageAction, MessageType, type Message, getAppStore, AppMode, type DataRecordsSelectionChangeMessage, DataSourceManager,
  type ArcGISQueriableDataSource, MutableStoreManager, type MessageDescription, MessageActionConnectionType
} from 'jimu-core'
import type { FlashMessageActionConfig, IMConfig } from '../message-actions/flash-action-setting'
import {
  type FlashFilterActionValue, isUseAnyTriggerData, getFlashFilterActionValueForUseAnyTriggerData,
  getWhereSqlByTriggerActionConnectionAndMoreConditions, getMainDataSourceIdsBySelectionChangeMessage
} from './flash-filter-utils'
import { isExpressMode, getWidgetJson } from './action-utils'

export default class FlashAction extends AbstractMessageAction {
  filterMessageDescription (messageDescription: MessageDescription): boolean {
    const messageWidgetId = messageDescription.widgetId

    // The schema of the Chart output data source is different from the original layer data source, and the features of the output data source don't exist in the map,
    // so the fields of trigger data and action data must be configured to make the flash action work.
    // However, in express mode, the flash action does not display the setting, so this configuration cannot be performed. Therefore, in express mode, Chart cannot configure flash message action.
    if (messageWidgetId && isExpressMode()) {
      const messageWidgetJson = getWidgetJson(messageWidgetId)

      if (messageWidgetJson && messageWidgetJson.uri === 'widgets/common/chart/') {
        return false
      }
    }

    return messageDescription.messageType === MessageType.DataRecordsSelectionChange
  }

  filterMessage (message: Message): boolean {
    return true
  }

  getDefaultMessageActionConfig (message: Message): FlashMessageActionConfig {
    const defaultConfig: FlashMessageActionConfig = {
      useAnyTriggerData: true,
      messageUseDataSource: null,
      actionUseDataSource: null,
      sqlExprObj: null,
      enabledDataRelationShip: true,
      connectionType: MessageActionConnectionType.SetCustomFields
    }

    return defaultConfig
  }

  getSettingComponentUri (messageType: MessageType, messageWidgetId?: string): string {
    const appMode = getAppStore().getState().appRuntimeInfo.appMode
    return appMode === AppMode.Express ? null : 'message-actions/flash-action-setting'
  }

  async onExecute (message: Message, actionConfig?: IMConfig): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (message.type) {
      case MessageType.DataRecordsSelectionChange:
        const selectionChangeMessage = message as DataRecordsSelectionChangeMessage
        const records = selectionChangeMessage.records || []
        // flash message action is valid only when records is not empty
        if (records.length === 0) {
          break
        }

        let flashActionValue: FlashFilterActionValue = null

        if (isUseAnyTriggerData(actionConfig)) {
          // Connection mode: Automatic
          // flash message.records
          flashActionValue = getFlashFilterActionValueForUseAnyTriggerData(records)

          if (flashActionValue && flashActionValue.layerDataSourceId && flashActionValue.querySQL) {
            const actionKey = `flashActionValue-${flashActionValue.layerDataSourceId}`
            MutableStoreManager.getInstance().updateStateValue(this.widgetId, actionKey, flashActionValue)
          }

          break
        }

        if (actionConfig) {
          // Connection mode: Customize
          // actionConfig.messageUseDataSource is the data source that publishes the message
          // actionConfig.actionUseDataSource is the data source that receives the message and takes action
          if (actionConfig.messageUseDataSource && actionConfig.actionUseDataSource) {
            const isValidRecordDataSource = validateRecordDataSourceForSelectionChangeMessage(selectionChangeMessage, actionConfig)

            if (!isValidRecordDataSource) {
              MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'flashActionValue', null)
              break
            }

            // Framework makes sure the following data sources are available before call onExecute() method.
            // messageDataSource is the data source that publishes the message
            // actionDataSource is the data source that receives the message and takes action
            const messageDataSource = DataSourceManager.getInstance().getDataSource(actionConfig.messageUseDataSource.mainDataSourceId)
            const actionDataSource = DataSourceManager.getInstance().getDataSource(actionConfig.actionUseDataSource.mainDataSourceId) as ArcGISQueriableDataSource

            if (messageDataSource && actionDataSource) {
              // when ds instances exist

              // whereSql = (the where of 'Trigger / action connection') && (the where of 'More conditions')
              const whereSql = await getWhereSqlByTriggerActionConnectionAndMoreConditions(message, records, actionConfig, messageDataSource, actionDataSource)

              // finalQuerySQL = whereSql && (the self filter of actionDataSource)
              let finalQuerySQL = ''

              if (whereSql) {
                const query = {
                  outFields: [],
                  where: whereSql,
                  returnGeometry: true
                }

                const realQuery = actionDataSource.getRealQueryParams(query, 'query')
                finalQuerySQL = realQuery && realQuery.where
              }

              if (!finalQuerySQL) {
                finalQuerySQL = ''
              }

              flashActionValue = {
                layerDataSourceId: actionDataSource && actionDataSource.id,
                querySQL: finalQuerySQL
              }
            } else {
              // when ds instances don't exist
              flashActionValue = null
            }
          } else {
            flashActionValue = null
          }
        }

        const actionKey = `flashActionValue-${flashActionValue?.layerDataSourceId}`
        MutableStoreManager.getInstance().updateStateValue(this.widgetId, actionKey, flashActionValue)
        break
    }

    return true
  }
}

function validateRecordDataSourceForSelectionChangeMessage (message: DataRecordsSelectionChangeMessage, messageActionConfig?: IMConfig): boolean {
  // Note, we should check records.length before check isUseAnyTriggerData(), because flash message action is valid only when records is not empty
  const records = message.records || []
  if (records.length === 0) {
    return false
  }

  if (isUseAnyTriggerData()) {
    return true
  }

  const validRecordMainDataSourceIds = getMainDataSourceIdsBySelectionChangeMessage(message)

  // There is one case (case1) that we should not use the following code to just check records[0].dataSource.getMainDataSource().id.
  // records[0].dataSource.getMainDataSource().id !== actionConfig.messageUseDataSource.mainDataSourceId
  const messageUseDataSourceMainId = messageActionConfig?.messageUseDataSource?.mainDataSourceId
  return messageUseDataSourceMainId && validRecordMainDataSourceIds.includes(messageUseDataSourceMainId)
}
