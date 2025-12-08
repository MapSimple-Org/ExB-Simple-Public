import { DataLevel, getAppStore, type DataRecordSet, dataSourceUtils } from 'jimu-core'

export async function isRecordValid (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
  if (dataSets.length > 1 || dataLevel === DataLevel.DataSource || !isDirectionsReady(this.widgetId)) {
    return false
  }
  const dataSet = dataSets[0]
  if (dataSet.records.length >= 1) {
    for (const record of dataSet.records) {
      const feature = await dataSourceUtils.changeToJSAPIGraphic((record as any)?.feature)
      // We only support point feature that connected to the same map point feature now
      if (!feature.geometry || feature.geometry.type !== 'point') {
        return false
      }
    }
    return true
  }
}

function isDirectionsReady (widgetId) {
  const state = getAppStore().getState().appStateInBuilder || getAppStore().getState()
  const { routeConfig, searchConfig } = state.appConfig.widgets[widgetId].config
  const useMapWidgetId = state.appConfig.widgets[widgetId].useMapWidgetIds?.[0]
  if (useMapWidgetId && routeConfig?.useUtility && searchConfig?.dataConfig?.[0]?.useUtility) {
    const utilities = state.appConfig?.utilities
    return !!(utilities && utilities[routeConfig.useUtility.utilityId] && utilities[searchConfig.dataConfig[0].useUtility.utilityId])
  } else {
    return false
  }
}
