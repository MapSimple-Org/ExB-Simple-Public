import {
  AbstractDataAction,
  type DataRecordSet,
  getAppStore,
  appActions,
  DataSourceStatus,
  DataLevel,
  Immutable
} from 'jimu-core'
import { EditModeType, type IMConfig } from '../config'
import { MapViewManager } from 'jimu-arcgis'

export default class Edit extends AbstractDataAction {
  isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean> {
    let isActionSupported = false
    let editHaveThisDs = false
    const dataSet = dataSets[0]
    const { dataSource, records } = dataSet
    const appState = getAppStore().getState()
    const appConfig = appState?.appConfig
    const isWidgetInController = appState?.widgetsRuntimeInfo[this.widgetId]?.controllerWidgetId
    const targetEditWidget = appConfig?.widgets[this.widgetId]
    if (!targetEditWidget) return
    const useMapWidgetIds = targetEditWidget.useMapWidgetIds || Immutable([])
    const { layersConfig, mapViewsConfig, editMode } = targetEditWidget.config as IMConfig
    if (editMode === EditModeType.Geometry) {
      if (useMapWidgetIds.length === 1) {
        const jimuMapViews = MapViewManager.getInstance().getJimuMapViewGroup(useMapWidgetIds[0])?.getAllJimuMapViews() || []
        for (const jimuMapView of jimuMapViews) {
          const mapViewConfig = mapViewsConfig?.[jimuMapView.id]
          if (mapViewConfig) {
            const layerConfig = mapViewConfig.layersConfig.find(l => l.id === dataSource.id)
            if (layerConfig) {
              editHaveThisDs = true
            }
          } else {
            const jimuLayerViews = jimuMapView.getAllJimuLayerViews()
            const dsIds = jimuLayerViews.map(v => v.layerDataSourceId)
            if (dsIds.includes(dataSource.id)) {
              editHaveThisDs = true
            }
          }
        }
      }
    } else {
      editHaveThisDs = !!layersConfig.find(item => item.useDataSource.dataSourceId === dataSource.id)
    }
    if (editHaveThisDs && dataLevel === DataLevel.Records && records?.length > 0 && isWidgetInController) {
      isActionSupported = true
    }
    return Promise.resolve(isActionSupported && dataSource.getStatus() !== DataSourceStatus.NotReady)
  }

  onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string) {
    getAppStore().dispatch(
      appActions.openWidgets([this.widgetId])
    )
    return Promise.resolve(true)
  }
}
