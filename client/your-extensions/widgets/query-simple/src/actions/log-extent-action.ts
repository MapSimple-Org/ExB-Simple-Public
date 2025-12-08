import { AbstractMessageAction, MessageType, Message } from 'jimu-core'
import { debugLogger } from '../runtime/debug-logger'

export default class LogExtentAction extends AbstractMessageAction {
  filterMessageType (messageType: MessageType): boolean {
    return messageType === MessageType.MapViewExtentChange
  }

  filterMessage (message: Message): boolean {
    return true
  }

  getSettingComponentUri (messageType: MessageType, messageWidgetId?: string): string {
    return null
  }

  onExecute (message: Message, actionConfig?: any): Promise<boolean> | boolean {
    const extent = message?.extent
    const viewPoint = message?.viewPoint
    
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
    
    return true
  }
}

