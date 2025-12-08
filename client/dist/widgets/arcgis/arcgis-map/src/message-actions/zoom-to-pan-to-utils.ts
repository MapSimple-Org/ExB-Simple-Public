import {
  getAppStore, type MessageDescription, MessageType, DataSourceManager, type DataSourceFilterChangeMessage, type SceneLayerDataSource,
  type FeatureLayerDataSource, type BuildingComponentSubLayerDataSource, type ArcGISQueriableDataSource, type DataRecord, AppMode,
  type UseDataSource, Immutable
} from 'jimu-core'
import type { IMConfig as ZoomToIMConfig } from './zoom-to-feature-action-setting'
import type { IMConfig as PanToIMConfig } from './pan-to-action-setting'
import { isExpressMode, getDsByWidgetId, isSpecialCaseOfSearchWidget } from './action-utils'

type ZoomToPanToIMConfig = ZoomToIMConfig | PanToIMConfig

/**
 * Calculate messageAction.useDataSources by messageAction.config for zoomTo/panTo message actions.
 * @param messageActionConfig
 * @returns
 */
export function getMessageActionUseDataSourcesByConfig (messageActionConfig: ZoomToPanToIMConfig): UseDataSource[] {
  const useDataSources: UseDataSource[] = []

  if (messageActionConfig) {
    if (messageActionConfig.useDataSources) {
      messageActionConfig.useDataSources.forEach(useDataSource => {
        if (useDataSource) {
          const clonedUseDataSource = Immutable(useDataSource).asMutable({ deep: true })
          useDataSources.push(clonedUseDataSource)
        }
      })
    }
  }

  return useDataSources
}

// filterMessageDescription is used to filter message types when try to add message action in builder setting page
export function filterMessageDescription (messageDescription: MessageDescription): boolean {
  const appMode = getAppStore().getState().appRuntimeInfo.appMode
  if (messageDescription.messageType === MessageType.ExtentChange) {
    return appMode !== AppMode.Express
  } else if (messageDescription.messageType === MessageType.DataSourcesChange) {
    return true
  } else if (messageDescription.messageType !== MessageType.DataRecordSetChange &&
      messageDescription.messageType !== MessageType.DataRecordsSelectionChange &&
      messageDescription.messageType !== MessageType.DataSourceFilterChange) {
    return false
  } else {
    const dataSourceManager = DataSourceManager.getInstance()
    const messageWidgetUseDataSources = getDsByWidgetId(messageDescription.widgetId, messageDescription.messageType)

    // See the code comment of isSpecialCaseOfSearchWidget() for more details.
    if (messageWidgetUseDataSources.length === 0 && isSpecialCaseOfSearchWidget(messageDescription)) {
      return true
    }

    return messageWidgetUseDataSources.some(useDataSource => {
      const ds = dataSourceManager.getDataSource(useDataSource.dataSourceId)

      // widget1 send message to map widget, ds comes from widget1.useDataSources.

      if (ds) {
        // #16835, ds maybe not ready when the ExB app is opened and add the message action immediately in widget action setting
        if (ds.type === 'WEB_MAP' || ds.type === 'WEB_SCENE') {
          // If ds.type is WEB_MAP or WEB_SCENE, means widget1 is also a map widget.
          return true
        } else {
          // widget1 is not map widget, like list widget uses a layer ds.
          return !!ds.getGeometryType()
        }
      }

      return false
    })
  }
}

export function isUseAnyTriggerData (messageActionConfig?: ZoomToPanToIMConfig): boolean {
  const _isExpressMode = isExpressMode()
  const _useAnyTriggerData = messageActionConfig?.useAnyTriggerData
  const result = _isExpressMode || _useAnyTriggerData
  return result
}

export function validateRecordDataSourceForRecordsSelectionChangeMessage (records: DataRecord[], actionConfig?: ZoomToPanToIMConfig): boolean {
  const _isUseAnyTriggerData = isUseAnyTriggerData(actionConfig)

  if (_isUseAnyTriggerData) {
    return true
  }

  // _isUseAnyTriggerData is false

  // the whole following section check if the record data source is in actionConfig.useDataSources of not
  if (records.length === 0) {
    if (actionConfig?.goToInitialMapExtentWhenSelectionCleared) {
      // empty records is a valid case if goToInitialMapExtentWhenSelectionCleared is true
      return true
    }

    return false
  }

  // records.length > 0

  const validRecordDsIds: string[] = []
  const firstRecord = records[0]
  const recordMainDs = firstRecord?.dataSource?.getMainDataSource() as ArcGISQueriableDataSource

  if (recordMainDs) {
    validRecordDsIds.push(recordMainDs.id)

    // case1: 3D features, associated data source
    // When clicking/selecting the 3D features on the SceneLayer/BuildingComponentSublayer, recordMainDs is FeatureLayerDataSource, recordAssociatedDs is SceneLayerDataSource,
    // but actionConfig.messageUseDataSource.mainDataSourceId is the id of SceneLayerDataSource, so we also need to check recordAssociatedDs.id.
    type HasAssociatedDataSource = SceneLayerDataSource | FeatureLayerDataSource | BuildingComponentSubLayerDataSource
    const recordAssociatedDs = (recordMainDs as HasAssociatedDataSource).getAssociatedDataSource && (recordMainDs as HasAssociatedDataSource).getAssociatedDataSource()

    if (recordAssociatedDs) {
      validRecordDsIds.push(recordAssociatedDs.id)
    }

    // case2: SubtypeGrouplayerDataSource and SubtypeSublayerDataSource
    // consider the following case:
    // There are two map widgets: Map widget1 and Map widget2. The two map widgets use same webmap and the webmap contains SubtypeGrouplayer.
    // Configure a message action: Map widget1 Records selection change => Map widget2 zoom to, the trigger data is SubtypeGrouplayer.
    // useDataSource in the message action config is SubtypeGrouplayerDataSource infos. useDataSource.id is like 'dataSource_1-1906d103683-layer-2-1906d105d10-layer-3'.
    // When clicking feature in Map widget1, we receive DataRecordsSelectionChange message here.
    // But records[0].dataSource (recordMainDs) is SubtypeSublayerDataSource, not SubtypeGrouplayerDataSource. recordMainDs.id is like 'dataSource_1-1906d103683-layer-2-1906d105d10-layer-3-1906d105e79-subtype-sublayer-0'.
    // The reason why records[0].dataSource is not SubtypeGrouplayerDataSource is that records[0] is the selected records, which is shared by both SubtypeGrouplayerDataSource and SubtypeSublayerDataSource.
    // So we also need to put subtypeGroupLayerMainDs.id into validRecordDsIds.
    // if (recordMainDs.type === DataSourceTypes.SubtypeSublayer) {
    //   const subtypeGrouplayerDs = (recordMainDs as SubtypeSublayerDataSource).parentDataSource

    //   if (subtypeGrouplayerDs) {
    //     const subtypeGroupLayerMainDs = subtypeGrouplayerDs.getMainDataSource()
    //     validRecordDsIds.push(subtypeGroupLayerMainDs.id)
    //   }
    // }
  }

  if (validRecordDsIds.length === 0) {
    return false
  }

  const isMatchDataSource = actionConfig?.useDataSources?.some(useDataSource => {
    // There are two cases (case1 and case2) that we should not use the following code to just check records[0].dataSource.getMainDataSource().id.
    // return useDataSource?.mainDataSourceId === recordMainDs.id
    return useDataSource?.mainDataSourceId && validRecordDsIds.includes(useDataSource?.mainDataSourceId)
  })

  return isMatchDataSource
}

export interface ChangedDataSourceIdsAndAllUseDataSourceIds {
  // filter changed dataSourceIds
  validChangedDataSourceIds: string[]
  // dataSourceIds of messageActionConfig.useDataSources
  useDataSourceIds: string[]
}

export function getValidChangedDataSourceIdsAndAllUseDataSourceIdsForDataFilteringChangeMessage (filterChangeMessage: DataSourceFilterChangeMessage, actionConfig?: ZoomToPanToIMConfig): ChangedDataSourceIdsAndAllUseDataSourceIds {
  let validChangedDataSourceIds: string[] = []
  let useDataSourceIds: string[] = []

  const dataSourceIdsOfMessage = filterChangeMessage.dataSourceIds || []
  const _isUseAnyTriggerData = isUseAnyTriggerData(actionConfig)

  if (_isUseAnyTriggerData) {
    validChangedDataSourceIds = dataSourceIdsOfMessage.slice()
    useDataSourceIds = dataSourceIdsOfMessage.slice()
  } else {
    if (actionConfig?.useDataSources?.length > 0) {
      actionConfig?.useDataSources?.forEach(useDataSource => {
        const dataSourceId = useDataSource?.dataSourceId

        if (dataSourceId) {
          useDataSourceIds.push(dataSourceId)
        }
      })
    }

    // need to get the final valid data source ids by filtering filterChangeMessage.dataSourceIds by useDataSourceIds
    validChangedDataSourceIds = dataSourceIdsOfMessage.filter(dataSourceId => {
      return useDataSourceIds.includes(dataSourceId)
    })
  }

  return {
    validChangedDataSourceIds,
    useDataSourceIds
  }
}
