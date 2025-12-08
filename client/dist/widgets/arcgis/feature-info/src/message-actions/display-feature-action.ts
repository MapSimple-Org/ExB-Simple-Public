import {
  AbstractMessageAction, MessageType, type Message,
  type DataRecordsSelectionChangeMessage,
  MutableStoreManager,
  type MessageDescription
} from 'jimu-core'

export default class ZoomToFeatureAction extends AbstractMessageAction {
  filterMessageDescription (messageDescription: MessageDescription): boolean {
    return messageDescription.messageType === MessageType.DataRecordsSelectionChange
  }

  filterMessage (message: Message): boolean {
    return true
  }

  onExecute (message: Message): Promise<boolean> | boolean {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (message.type) {
      case MessageType.DataRecordsSelectionChange:
        const dataRecordsSelectionChangeMessage = message as DataRecordsSelectionChangeMessage
        const record = dataRecordsSelectionChangeMessage.records && dataRecordsSelectionChangeMessage.records[0]
        MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'displayFeatureActionValue.record', record)
        break
    }

    return Promise.resolve(true)
  }
}
