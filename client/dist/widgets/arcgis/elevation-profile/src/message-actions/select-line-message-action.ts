import {
  AbstractMessageAction, AllDataSourceTypes, type DataRecordsSelectionChangeMessage, DataSourceManager,
  getAppStore, Immutable, type ImmutableArray, type MessageDescription, MessageType, MutableStoreManager, type UseDataSource
} from 'jimu-core'

export default class SelectLineMessageAction extends AbstractMessageAction {
  filterMessageDescription (messageDescription: MessageDescription): boolean {
    if (messageDescription.messageType === MessageType.DataRecordsSelectionChange) {
      const dataSourceManager = DataSourceManager.getInstance()
      const messageWidgetUseDataSources = getDsByWidgetId(messageDescription.widgetId, messageDescription.messageType)
      return messageWidgetUseDataSources?.some(useDataSource => {
        const ds: any = dataSourceManager.getDataSource(useDataSource.dataSourceId)
        //check ds for map widget (webmap or webscene) or for other widgets like table, list for the configured layer (line layer)
        if (ds && (ds.type === 'WEB_MAP' || ds.type === 'WEB_SCENE' ||
          ((ds.type === AllDataSourceTypes.FeatureLayer || ds.type === AllDataSourceTypes.SubtypeSublayer) &&
            ds.getGeometryType() === 'esriGeometryPolyline'))) {
          return true
        } else {
          return false
        }
      })
    }
  }

  filterMessageType (messageType: MessageType): boolean {
    return messageType === MessageType.DataRecordsSelectionChange
  }

  filterMessage (message: any): boolean {
    //only if the selected feature is of type polyline execute the action else filter the out the msg
    if (message?.records?.length > 0) {
      const polylineRecords = message?.records.filter((record) => record?.feature?.geometry?.type === 'polyline')
      return polylineRecords.length > 0
    }
    return false
  }

  //on selection of the features in map widget get the data record set by execute method
  onExecute (message: DataRecordsSelectionChangeMessage): boolean {
    const dataRecordsSelectionChangeMessage = message
    //get the map selected features records
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedFeatureRecords', dataRecordsSelectionChangeMessage.records)
    return true
  }

  getSettingComponentUri (messageType: MessageType, messageWidgetId?: string): string {
    return null
  }
}

//get datasource using other widget id (list, table)
export function getDsByWidgetId (wId: string, messageType: MessageType): ImmutableArray<UseDataSource> {
  const appConfig = getAppConfig()
  const widgetJson = appConfig?.widgets?.[wId]
  const useDataSources = widgetJson?.useDataSources || Immutable([])
  //get all the use datasources from the map widget
  const mapUseDataSources = getMapUseDataSourcesByUseMapWidgetIds(wId)
  const useDs = useDataSources.length > 0 ? useDataSources : mapUseDataSources
  return useDs
}

function getMapUseDataSourcesByUseMapWidgetIds (widgetId: string): ImmutableArray<UseDataSource> {
  const useDataSources: UseDataSource[] = []
  const appConfig = getAppConfig()
  const widgetJson = appConfig?.widgets?.[widgetId]
  const useMapWidgetIds = widgetJson?.useMapWidgetIds
  const dataSourceIdsObj: { [dataSourceId: string]: boolean } = {}

  if (useMapWidgetIds?.length > 0) {
    useMapWidgetIds.forEach(mapWidgetId => {
      if (mapWidgetId) {
        const appConfig = getAppConfig()
        const mapWidgetJson = appConfig?.widgets?.[mapWidgetId]
        const mapWidgetUseDataSources = mapWidgetJson?.useDataSources

        if (mapWidgetUseDataSources) {
          mapWidgetUseDataSources.forEach(mapWidgetUseDataSource => {
            const mapWidgetUseDataSourceObj = mapWidgetUseDataSource?.asMutable?.({ deep: true }) as unknown as UseDataSource
            if (mapWidgetUseDataSourceObj && mapWidgetUseDataSourceObj.dataSourceId && !dataSourceIdsObj[mapWidgetUseDataSourceObj.dataSourceId]) {
              dataSourceIdsObj[mapWidgetUseDataSourceObj.dataSourceId] = true
              useDataSources.push(mapWidgetUseDataSourceObj)
            }
          })
        }
      }
    })
  }

  return Immutable(useDataSources)
}

function getAppConfig () {
  return window.jimuConfig.isBuilder ? getAppStore().getState()?.appStateInBuilder?.appConfig : getAppStore().getState()?.appConfig
}
