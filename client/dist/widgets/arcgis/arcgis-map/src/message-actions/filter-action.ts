import {
  AbstractMessageAction, MessageType, type Message, lodash, getAppStore, AppMode, type DataRecordsSelectionChangeMessage, DataSourceManager,
  MutableStoreManager, type MessageDescription, type DataSource, MessageActionConnectionType
} from 'jimu-core'
import type { FilterMessageActionConfig, IMConfig } from '../message-actions/filter-action-setting'
import {
  type FlashFilterActionValue, getFlashFilterActionValueForUseAnyTriggerData,
  getWhereSqlByTriggerActionConnectionAndMoreConditions, getMainDataSourceIdsBySelectionChangeMessage
} from './flash-filter-utils'

const FILTER_ACTION_KEY_PREFIX: string = 'filterActionValue-'
const FILTER_MESSAGE_KEY_PREFIX: string = 'filterMessageValue-'

export default class FilterAction extends AbstractMessageAction {
  /**
   * Consider the following cases:
   * 1. There are Map widget, Select widget and List widget in the App.
   * 2. Map has three layers: layer1, layer2 and layer3.
   * 3. Configure map filter message action1 for Select widget, layer1 is the trigger data and layer3 is the action data.
   * 4. Configure map filter message action2 for List widget, layer2 is the trigger data and layer3 is the action data.
   * 5. Firstly, Select widget updates the selection of layer1, map filter message action1 will create SQL1 to update layer3.definitionExpression.
   *    Then, List widget updates the selection of layer2, map filter message action2 will create SQL2, but we should not set SQL2 to layer3.definitionExpression directly, because it will override SQL1.
   *    We should use (SQL1 AND SQL2) to update layer3.definitionExpression. So, we need to save SQL1 and SQL2 in the filter action. That's reason why we need to keep this.filterActions here.
   *    The code logic is implemented in this.getUnionAllFilterQuerySQL() method, this method is used to combine SQL1 and SQL2 together.
   * 6. When we remove map filter message action2 from List widget, we should remove SQL2 from layer3.definitionExpression. That is, we should update layer3.definitionExpression by SQL1.
   *    The code logic is implemented in this.onRemoveListen() method. In this method, we will call this.getUnionAllFilterQuerySQL() method to get the new SQL to update layer3.definitionExpression.
   *
   * See #4487 for more details.
   */
  private readonly filterActions: {
    [filterActionKey: string]: {
      [filterMessageKey: string]: {
        querySQL: string
        messageWidgetId: string
      }
    }
  } = {}

  filterMessageDescription (messageDescription: MessageDescription): boolean {
    const appMode = getAppStore().getState().appRuntimeInfo.appMode
    if (appMode === AppMode.Express) {
      return false
    } else {
      return messageDescription.messageType === MessageType.DataRecordsSelectionChange
    }
  }

  filterMessage (message: Message): boolean {
    return true
  }

  getDefaultMessageActionConfig (message: Message): FilterMessageActionConfig {
    const defaultConfig: FilterMessageActionConfig = {
      useAnyTriggerData: true,
      messageUseDataSource: null,
      actionUseDataSource: null,
      sqlExprObj: null,
      enabledDataRelationShip: true,
      connectionType: MessageActionConnectionType.SetCustomFields
    }

    return defaultConfig
  }

  onRemoveListen (messageType: MessageType, messageWidgetId?: string) {
    Object.keys(this.filterActions || {}).forEach(actionKey => {
      Object.entries(this.filterActions[actionKey] || {}).forEach(entry => {
        const messageKey = entry[0]
        if (entry[1]?.messageWidgetId === messageWidgetId) {
          lodash.setValue(this.filterActions, `${actionKey}.${messageKey}.querySQL`, '')
        }
      })
      const filterActionValue = {
        layerDataSourceId: actionKey.slice(FILTER_ACTION_KEY_PREFIX.length),
        querySQL: this.getUnionAllFilterQuerySQL(actionKey)
      }
      MutableStoreManager.getInstance().updateStateValue(this.widgetId, actionKey, filterActionValue)
    })
  }

  async onExecute (message: Message, actionConfig?: IMConfig): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (message.type) {
      case MessageType.DataRecordsSelectionChange:
        const selectionChangeMessage = message as DataRecordsSelectionChangeMessage
        const records = selectionChangeMessage.records || []

        let filterActionValue: FlashFilterActionValue = null
        let messageDataSource: DataSource
        let actionDataSource: DataSource

        if (actionConfig?.useAnyTriggerData) {
          // Connection mode: Automatic

          if (records.length > 0) {
            // filter by message.records
            filterActionValue = getFlashFilterActionValueForUseAnyTriggerData(records)

            if (filterActionValue) {
              if (filterActionValue.layerDataSourceId) {
                messageDataSource = DataSourceManager.getInstance().getDataSource(filterActionValue.layerDataSourceId)
                actionDataSource = messageDataSource
              }
            }
          } else {
            // clear filter
            const recordMainDataSourceIds = getMainDataSourceIdsBySelectionChangeMessage(selectionChangeMessage)

            if (recordMainDataSourceIds.length > 0 && recordMainDataSourceIds[0]) {
              const messageMainDataSourceId = recordMainDataSourceIds[0]

              filterActionValue = {
                layerDataSourceId: messageMainDataSourceId,
                querySQL: ''
              }

              messageDataSource = DataSourceManager.getInstance().getDataSource(messageMainDataSourceId)
              actionDataSource = messageDataSource
            }
          }
        } else if (actionConfig) {
          // Connection mode: Customize
          // actionConfig.messageUseDataSource is the data source that publishes the message
          // actionConfig.actionUseDataSource is the data source that receives the message and takes action
          if (actionConfig.messageUseDataSource && actionConfig.actionUseDataSource) {
            const isValidRecordDataSource = validateRecordDataSourceForSelectionChangeMessage(selectionChangeMessage, actionConfig)

            if (!isValidRecordDataSource) {
              // TODO: maybe we should not call updateStateValue() here if filterActionValue is null
              MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'filterActionValue', null)
              break
            }

            // Framework makes sure the following data sources are available before call onExecute() method.
            // messageDataSource is the data source that publishes the message
            // actionDataSource is the data source that receives the message and takes action
            // both messageDataSource and actionDataSource are main data sources
            messageDataSource = DataSourceManager.getInstance().getDataSource(actionConfig.messageUseDataSource.mainDataSourceId)
            actionDataSource = DataSourceManager.getInstance().getDataSource(actionConfig.actionUseDataSource.mainDataSourceId)

            if (messageDataSource && actionDataSource) {
              if (records.length === 0) {
                // clear filter
                filterActionValue = {
                  layerDataSourceId: actionDataSource && actionDataSource.id,
                  querySQL: ''
                }
              } else {
                // The "Trigger / action connection" option is unchecked.
                // whereSql = (the where of 'Trigger / action connection') && (the where of 'More conditions')
                const whereSql = await getWhereSqlByTriggerActionConnectionAndMoreConditions(message, records, actionConfig, messageDataSource, actionDataSource)

                filterActionValue = {
                  layerDataSourceId: actionDataSource && actionDataSource.id,
                  querySQL: whereSql
                }
              }
            } else {
              // when ds instances don't exist
              filterActionValue = null
            }
          } else {
            filterActionValue = null
          }
        }

        const messageKey = getFilterMessageKey(message.widgetId, messageDataSource?.id)
        const actionKey = getFilterActionKey(filterActionValue?.layerDataSourceId)

        if (filterActionValue) {
          lodash.setValue(this.filterActions, `${actionKey}.${messageKey}`, {
            querySQL: filterActionValue?.querySQL,
            messageWidgetId: message.widgetId
          })
          filterActionValue.querySQL = this.getUnionAllFilterQuerySQL(actionKey)
        }
        // TODO: maybe we should not call updateStateValue() here if filterActionValue is null
        MutableStoreManager.getInstance().updateStateValue(this.widgetId, actionKey, filterActionValue)
        break
    }

    return true
  }

  getUnionAllFilterQuerySQL (actionKey) {
    let unionQuerySQL = ''
    Object.entries(this.filterActions[actionKey] || {}).forEach(entry => {
      //const filterMessageKey = entry[0]
      const querySQL = entry[1]?.querySQL
      if (unionQuerySQL && querySQL) {
        unionQuerySQL = ` ${unionQuerySQL} AND ${querySQL} `
      } else {
        unionQuerySQL = querySQL || unionQuerySQL
      }
    })
    return unionQuerySQL
  }
}

function getFilterActionKey (actionLayerDataSourceId: string): string {
  const actionKey = `${FILTER_ACTION_KEY_PREFIX}${actionLayerDataSourceId}`
  return actionKey
}

function getFilterMessageKey (messageWidgetId: string, messageLayerDataSourceId: string): string {
  const messageKey = `${FILTER_MESSAGE_KEY_PREFIX}${messageWidgetId}-${messageLayerDataSourceId}`
  return messageKey
}

function validateRecordDataSourceForSelectionChangeMessage (message: DataRecordsSelectionChangeMessage, messageActionConfig?: IMConfig): boolean {
  // Don't check records.length because empty records is a valid case when message.dataSourceIds is not empty.
  // const records = message.records || []
  // if (records.length === 0) {
  //   return false
  // }

  if (messageActionConfig?.useAnyTriggerData) {
    return true
  }

  const validRecordMainDataSourceIds = getMainDataSourceIdsBySelectionChangeMessage(message)

  // There is one case (case1) that we should not use the following code to just check records[0].dataSource.getMainDataSource().id.
  // records[0].dataSource.getMainDataSource().id !== actionConfig.messageUseDataSource.mainDataSourceId
  const messageUseDataSourceMainId = messageActionConfig?.messageUseDataSource?.mainDataSourceId
  return messageUseDataSourceMainId && validRecordMainDataSourceIds.includes(messageUseDataSourceMainId)
}
