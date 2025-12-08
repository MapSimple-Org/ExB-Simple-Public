import {
  isDefined,
  getNetworkOutFields,
  queryRouteIds
} from 'widgets/shared-code/lrs'

// eslint-disable-next-line max-params
export function areEventsOnSameLineOrRoute (
  isSortNeeded,
  eventFeatures,
  getI18nMessage,
  eventLayer,
  networkLayer,
  networkDS,
  toastMsgType,
  onUpdateToastMsgType,
  onUpdateToastMsg,
  onUpdateToastOpen): Promise<boolean> {
  let errorMsg
  if (eventFeatures.length === 1) {
    errorMsg = getI18nMessage('selectAtLeastTwoEvents')
  } else if (eventFeatures.length > 0) {
    if (eventLayer.eventInfo.canSpanRoutes) {
      // Check if events from different lines
      const routeIds: string[] = []
      for (let i = 0; i < eventFeatures.length; i++) {
        const eventRouteId: string = eventFeatures[i].attributes[eventLayer.eventInfo.routeIdFieldName]
        routeIds.push(eventRouteId)
        const eventToRouteId: string = eventFeatures[i].attributes[eventLayer.eventInfo.toRouteIdFieldName]
        routeIds.push(eventToRouteId)
      }
      const routeIdToLineOrder = {}
      queryRouteIds(routeIds, networkLayer.networkInfo, networkDS)
        .then((results) => {
          if (isDefined(results)) {
            let currentLineId
            const networkFields = getNetworkOutFields(networkLayer.networkInfo)
            for (let i = 0; i < results.features.length; i++) {
              const lineIdValue = results.features[i].attributes[networkFields.lineIdFieldName]
              const lineOrderValue = results.features[i].attributes[networkFields.lineOrderFieldName]
              const routeIdValue = results.features[i].attributes[networkFields.routeIdFieldName]
              routeIdToLineOrder[routeIdValue] = lineOrderValue
              if (!isDefined(currentLineId)) {
                currentLineId = lineIdValue
              } else if (currentLineId !== lineIdValue) {
                errorMsg = getI18nMessage('eventsNotOnSameLine')
                break
              }
            }
            if (isSortNeeded) {
              eventFeatures.forEach(event => {
                event.attributes.fromLineOrder = routeIdToLineOrder[event.attributes[eventLayer.eventInfo.routeIdFieldName]]
                event.attributes.toLineOrder = routeIdToLineOrder[event.attributes[eventLayer.eventInfo.toRouteIdFieldName]]
              })
              eventFeatures.sort((a, b) => a.attributes.fromLineOrder - b.attributes.fromLineOrder ||
                a.attributes.toLineOrder - b.attributes.toLineOrder ||
                a.attributes[eventLayer.eventInfo.fromMeasureFieldName] - b.attributes[eventLayer.eventInfo.fromMeasureFieldName])
            }
          }
        })
    } else {
      // Check if events from different routes
      let currentRouteId
      for (let i = 0; i < eventFeatures.length; i++) {
        const eventRouteId = eventFeatures[i].attributes[eventLayer.eventInfo.routeIdFieldName]
        if (!isDefined(currentRouteId)) {
          currentRouteId = eventRouteId
        } else if (currentRouteId !== eventRouteId) {
          errorMsg = getI18nMessage('eventsNotOnSameRoute')
          break
        }
      }
      if (isSortNeeded) {
        eventFeatures.sort((a, b) => a.attributes[eventLayer.eventInfo.fromMeasureFieldName] - b.attributes[eventLayer.eventInfo.fromMeasureFieldName])
      }
    }
  }

  if (isDefined(errorMsg) && errorMsg.length > 0 &&
    toastMsgType !== 'success') { // prevent error from showing when feature selection changes due to successful merge
    onUpdateToastMsgType('error')
    onUpdateToastMsg(errorMsg)
    onUpdateToastOpen(true)
    setTimeout(() => {
      onUpdateToastOpen(false)
    }, 5000)
    return Promise.resolve(false)
  }
  return Promise.resolve(true)
}
