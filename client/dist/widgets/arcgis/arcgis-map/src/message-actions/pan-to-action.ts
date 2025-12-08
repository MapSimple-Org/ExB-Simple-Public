import {
  AbstractMessageAction, MessageType, type Message, getAppStore, type DataRecordSetChangeMessage, RecordSetChangeType, type DataSourceFilterChangeMessage,
  type DataRecordsSelectionChangeMessage, type ExtentChangeMessage, type FeatureDataRecord as FeatureQueryDataRecord, MutableStoreManager, type MessageDescription,
  type DataSourcesChangeMessage, DataSourcesChangeType, AppMode, type FeatureDataRecord as FeatureLayerDataRecord
} from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { cloneFeature, isWidgetSendZoomToActionToAnother } from '../runtime/utils'
import type { PanToMessageConfig, IMConfig } from './pan-to-action-setting'
import {
  filterMessageDescription, validateRecordDataSourceForRecordsSelectionChangeMessage,
  getValidChangedDataSourceIdsAndAllUseDataSourceIdsForDataFilteringChangeMessage
} from './zoom-to-pan-to-utils'

export interface PanToGeometriesInternalValue {
  type: 'pan-to-geometries'
  geometries: __esri.Geometry[]
}

export interface PanToExtentInternalValue {
  type: 'pan-to-extent'
  geometries: [__esri.Extent]
  stationary: boolean
  publishTime: number
  publishWidgetId: string
}

export interface PanToQueryParamsInternalValue {
  type: 'pan-to-query-params'
  // filter changed dataSourceIds
  filterChangedDataSourceIds: string[]
  // dataSourceIds of messageActionConfig.useDataSources
  useDataSourceIds: string[]
}

export interface PanToLayerInternalValue {
  type: 'pan-to-layer'
  dataSourceId: string
}

export interface PanToLayersInternalValue {
  type: 'pan-to-layers'
  dataSourceIds: string[]
}

export interface GoToMapInitialExtentInternalValue {
  type: 'pan-to-map-initial-extent'
}

export interface PanToActionValue {
  value: PanToGeometriesInternalValue | PanToExtentInternalValue | PanToQueryParamsInternalValue | PanToLayerInternalValue | PanToLayersInternalValue | GoToMapInitialExtentInternalValue
  relatedWidgets: string[]
}

export default class PanToAction extends AbstractMessageAction {
  NoLockTriggerLayerWidgets = ['Map']

  // filterMessageDescription is used to filter message types when try to add message action in builder setting page
  filterMessageDescription (messageDescription: MessageDescription): boolean {
    return filterMessageDescription(messageDescription)
  }

  filterMessage (message: Message): boolean {
    return true
  }

  getDefaultMessageActionConfig (message: Message): PanToMessageConfig {
    const defaultConfig: PanToMessageConfig = {
      useDataSource: null,
      useDataSources: [],
      goToInitialMapExtentWhenSelectionCleared: false
    }

    if (message.type === MessageType.DataRecordsSelectionChange || message.type === MessageType.DataSourceFilterChange) {
      defaultConfig.useAnyTriggerData = true
    }

    return defaultConfig
  }

  getSettingComponentUri (messageType: MessageType, messageWidgetId?: string): string {
    //const config = getAppStore().getState().appStateInBuilder ? getAppStore().getState().appStateInBuilder.appConfig : getAppStore().getState().appConfig
    //const messageWidgetJson = config.widgets[messageWidgetId]
    const appMode = getAppStore().getState().appRuntimeInfo.appMode
    if (messageType === MessageType.DataRecordsSelectionChange ||
        messageType === MessageType.DataSourceFilterChange) {
      return appMode === AppMode.Express ? null : 'message-actions/pan-to-action-setting'
    } else {
      return null
    }
  }

  onExecute (message: Message, actionConfig?: IMConfig): Promise<boolean> | boolean {
    // message.widgetId is message sender, this.widgetId is message receiver

    return loadArcGISJSAPIModules(['esri/Graphic']).then(modules => {
      let Graphic: typeof __esri.Graphic = null;
      [Graphic] = modules

      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (message.type) {
        case MessageType.DataRecordSetChange:
          // typical case: Query widget creates records
          // disable panTo if zoomTo configured
          if (isWidgetSendZoomToActionToAnother(message.widgetId, this.widgetId, MessageType.DataRecordSetChange)) {
            // message.widgetId sends both panTo and zoomTo actions to this.widgetId, we should not execute panTo action to avoid conflict with zoomTo action.
            break
          }

          const dataRecordSetChangeMessage = message as DataRecordSetChangeMessage
          if (dataRecordSetChangeMessage.changeType === RecordSetChangeType.CreateUpdate) {
            const geometries: __esri.Geometry[] = []
            dataRecordSetChangeMessage.dataRecordSets.forEach(dataRecordSet => {
              if (dataRecordSet && dataRecordSet.records) {
                for (let i = 0; i < dataRecordSet.records.length; i++) {
                  // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
                  const dataRecordFeature = (dataRecordSet.records[i] as (FeatureQueryDataRecord | FeatureLayerDataRecord)).feature
                  if (dataRecordFeature) {
                    const feature: __esri.Graphic = cloneFeature(dataRecordFeature, Graphic)
                    geometries.push(feature.geometry)
                  }
                }
              }
            })
            const panToValue: PanToGeometriesInternalValue = {
              type: 'pan-to-geometries',
              geometries: geometries
            }
            MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'panToActionValue.value', panToValue)
          }
          break
        case MessageType.DataRecordsSelectionChange:
          // disable panTo if zoomTo configured
          if (isWidgetSendZoomToActionToAnother(message.widgetId, this.widgetId, MessageType.DataRecordsSelectionChange)) {
            // message.widgetId sends both panTo and zoomTo actions to this.widgetId, we should not execute panTo action to avoid conflict with zoomTo action.
            break
          }

          // const config = getAppStore().getState().appConfig
          // const messageWidgetJson = config.widgets[message.widgetId]
          // const messageWidgetLabel = messageWidgetJson.manifest.label
          const dataRecordsSelectionChangeMessage = message as DataRecordsSelectionChangeMessage
          const records = dataRecordsSelectionChangeMessage.records

          const geometries: __esri.Geometry[] = []
          if (records) {
            const firstRecord = records[0]

            if (firstRecord) {
              const isValidRecordDataSource = validateRecordDataSourceForRecordsSelectionChangeMessage(records, actionConfig)

              if (!isValidRecordDataSource) {
                break
              }
            }

            for (let i = 0; i < records.length; i++) {
              // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
              const dataRecordFeature = (records[i] as (FeatureQueryDataRecord | FeatureLayerDataRecord)).feature
              if (dataRecordFeature) {
                const feature: __esri.Graphic = cloneFeature(dataRecordFeature, Graphic)
                geometries.push(feature.geometry)
              }
            }
          }

          if (geometries.length > 0) {
            // selected features are not empty, pan to the center of selected features
            const panToValue: PanToGeometriesInternalValue = {
              type: 'pan-to-geometries',
              geometries: geometries
            }

            MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'panToActionValue.value', panToValue)
          } else {
            // selected features are empty, pan to initial map extent if goToInitialMapExtentWhenSelectionCleared is true
            if (actionConfig?.goToInitialMapExtentWhenSelectionCleared) {
              const panToValue: GoToMapInitialExtentInternalValue = {
                type: 'pan-to-map-initial-extent'
              }

              MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'panToActionValue.value', panToValue)
            }
          }

          break
        case MessageType.ExtentChange:
          // disable panTo if zoomTo configured
          if (isWidgetSendZoomToActionToAnother(message.widgetId, this.widgetId, MessageType.ExtentChange)) {
            // message.widgetId sends both panTo and zoomTo actions to this.widgetId, we should not execute panTo action to avoid conflict with zoomTo action.
            // isWidgetSendZoomToActionToAnother() can only handle simple panTo and zoomTo conflict.
            // To avoid more complicated panTo and zoomTo conflict cases, we do it in handleActionForPanToActionValue of mapbase.
            break
          }

          const extentChangeMessage = message as ExtentChangeMessage
          const relatedWidgetIds = extentChangeMessage.getRelatedWidgetIds()

          if (relatedWidgetIds.includes(this.widgetId)) {
            break
          }

          const extentValue: PanToExtentInternalValue = {
            type: 'pan-to-extent',
            geometries: [extentChangeMessage.extent],
            stationary: extentChangeMessage.stationary,
            publishTime: extentChangeMessage.publishTime,
            publishWidgetId: extentChangeMessage.widgetId
          }

          const panToFeatureActionValue: PanToActionValue = {
            value: extentValue,
            relatedWidgets: relatedWidgetIds
          }
          MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'panToActionValue', panToFeatureActionValue)
          break
        case MessageType.DataSourceFilterChange:
          // typical case: Filter widget changes data source filter
          // disable panTo if zoomTo configured
          if (isWidgetSendZoomToActionToAnother(message.widgetId, this.widgetId, MessageType.DataSourceFilterChange)) {
            // message.widgetId sends both panTo and zoomTo actions to this.widgetId, we should not execute panTo action to avoid conflict with zoomTo action.
            break
          }

          const filterChangeMessage = message as DataSourceFilterChangeMessage

          const {
            validChangedDataSourceIds,
            useDataSourceIds
          } = getValidChangedDataSourceIdsAndAllUseDataSourceIdsForDataFilteringChangeMessage(filterChangeMessage, actionConfig)

          if (validChangedDataSourceIds.length === 0) {
            break
          }

          const filterChangeActionValue: PanToQueryParamsInternalValue = {
            type: 'pan-to-query-params',
            filterChangedDataSourceIds: validChangedDataSourceIds,
            useDataSourceIds
          }

          MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'panToActionValue.value', filterChangeActionValue)
          break
        case MessageType.DataSourcesChange:
          // typical case: AddData widget adds new data source
          // disable panTo if zoomTo configured
          if (isWidgetSendZoomToActionToAnother(message.widgetId, this.widgetId, MessageType.DataSourcesChange)) {
            // message.widgetId sends both panTo and zoomTo actions to this.widgetId, we should not execute panTo action to avoid conflict with zoomTo action.
            break
          }

          const dataSourcesChangeMessage = message as DataSourcesChangeMessage
          if (dataSourcesChangeMessage.changeType === DataSourcesChangeType.Create) {
            const dataSourceIds = []
            dataSourcesChangeMessage.dataSources.forEach(dataSource => {
              dataSourceIds.push(dataSource.id)
            })
            const panToFeatureActionValueForLayers: PanToLayersInternalValue = {
              type: 'pan-to-layers',
              dataSourceIds: dataSourceIds
            }
            MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'panToActionValue.value', panToFeatureActionValueForLayers)
          }
          break
      }
      return true
    })
  }
}
