import { AbstractMessageAction, MessageType, Message } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

export default class LogExtentAction extends AbstractMessageAction {
  filterMessageType (messageType: MessageType): boolean {
    return messageType === MessageType.MapViewExtentChange
  }

  filterMessage (message: Message): boolean {
    return true
  }

  filterMessageDescription (messageType: MessageType): string {
    // This action only works with EXTENT_CHANGE messages
    if (messageType === MessageType.MapViewExtentChange) {
      return 'Log Map Extent to Console'
    }
    // Return null for unsupported message types (like DATA_RECORDS_SELECTION_CHANGE)
    return null
  }

  getSettingComponentUri (messageType: MessageType, messageWidgetId?: string): string {
    return null
  }

  onExecute (message: Message, actionConfig?: any): Promise<boolean> | boolean {
    const extent = message?.extent
    const viewPoint = message?.viewPoint
    
    /* 
    debugLogger.log('MAP-EXTENT', {
      extent: extent ? {
        xmin: extent.xmin,
        ymin: extent.ymin,
        xmax: extent.xmax,
        ymax: extent.ymax,
        spatialReference: extent.spatialReference
      } : null,
      viewPoint: viewPoint ? {
        scale: viewPoint.scale,
        rotation: viewPoint.rotation,
        targetGeometry: viewPoint.targetGeometry
      } : null,
      widgetId: this.widgetId
    })
    */
    
    return true
  }
}

