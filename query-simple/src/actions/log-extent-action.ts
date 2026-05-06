// r027.071: Migrated to ExB 1.20 AbstractMessageAction contract.
//   - MessageType.MapViewExtentChange does not exist; the enum value is
//     MessageType.ExtentChange ("EXTENT_CHANGE").
//   - filterMessageType is no longer on the abstract base; replaced by
//     filterMessageDescription(messageDescription: MessageDescription): boolean,
//     which is now a predicate (was previously a label-returning method).
//   - The human-readable label moved to manifest.json
//     ("Log Map Extent to Console"), so the old label-returning override is gone.
//   - Dropped unused extent/viewPoint extractions in onExecute. They were
//     scaffolding for a commented-out debug log; removing them clears the
//     2 TS errors caused by accessing those fields on the base Message type
//     (they live on ExtentChangeMessage, not Message).
import { AbstractMessageAction, MessageType, type Message, type MessageDescription } from 'jimu-core'

export default class LogExtentAction extends AbstractMessageAction {
  filterMessageDescription (messageDescription: MessageDescription): boolean {
    return messageDescription.messageType === MessageType.ExtentChange
  }

  filterMessage (message: Message): boolean {
    return true
  }

  getSettingComponentUri (messageType: MessageType, messageWidgetId?: string): string {
    return null
  }

  onExecute (message: Message, actionConfig?: any): Promise<boolean> | boolean {
    // Debug log intentionally left out; this action is a no-op placeholder.
    // If logging is needed in the future, cast `message as ExtentChangeMessage`
    // before reading `.extent` and `.viewpoint` (note: lowercase 'p' in 1.20).
    return true
  }
}

