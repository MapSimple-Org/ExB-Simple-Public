import {
  AbstractMessageAction, MessageType, type Message, type DataRecordSetChangeMessage, RecordSetChangeType, getAppStore, type DataRecordsSelectionChangeMessage,
  type FeatureDataRecord, type ExtentChangeMessage, MutableStoreManager, type DataSourceFilterChangeMessage, type MessageDescription, type DataSourcesChangeMessage,
  DataSourcesChangeType, AppMode
} from 'jimu-core'
import { loadArcGISJSAPIModules, type ViewPadding, type ZoomToOptions, type JimuMapView } from 'jimu-arcgis'
import { cloneFeature } from '../runtime/utils'
import type { ZoomToMessageConfig, IMConfig } from './zoom-to-feature-action-setting'
import {
  filterMessageDescription, validateRecordDataSourceForRecordsSelectionChangeMessage,
  getValidChangedDataSourceIdsAndAllUseDataSourceIdsForDataFilteringChangeMessage
} from './zoom-to-pan-to-utils'

export interface BaseZoomToInternalValue {
  zoomToOption: ZoomToOptions
}

export interface ZoomToArrayGraphicsInternalValue extends BaseZoomToInternalValue {
  type: 'zoom-to-array-graphics'
  arrayFeatures: __esri.Graphic[][]
}

export interface ZoomToGraphicsInternalValue extends BaseZoomToInternalValue {
  type: 'zoom-to-graphics'
  features: __esri.Graphic[]
  dataSourceId: string
}

export interface ZoomToExtentInternalValue extends BaseZoomToInternalValue {
  type: 'zoom-to-extent'
  extent: __esri.Extent
  viewpoint: __esri.Viewpoint
  stationary: boolean
  interactive: boolean
  publishTime: number
  publishWidgetId: string
}

export interface ZoomToQueryParamsInternalValue extends BaseZoomToInternalValue {
  type: 'zoom-to-query-params'
  // filter changed dataSourceIds
  filterChangedDataSourceIds: string[]
  // dataSourceIds of messageActionConfig.useDataSources
  useDataSourceIds: string[]
}

export interface ZoomToLayersInternalValue extends BaseZoomToInternalValue {
  type: 'zoom-to-layers'
  dataSourceIds: string[]
}

export interface ZoomToMapInitialExtentValue extends BaseZoomToInternalValue {
  type: 'zoom-to-map-initial-extent'
}

export interface ZoomToFeaturesExtentValue extends BaseZoomToInternalValue {
  type: 'zoom-to-features-extent'
  extent: __esri.Extent | __esri.Graphic | ((jimuMapView: JimuMapView) => Promise<__esri.Extent | __esri.Graphic>)
}

export interface ZoomToFeatureActionValue {
  value: ZoomToArrayGraphicsInternalValue |
         ZoomToGraphicsInternalValue |
         ZoomToExtentInternalValue |
         ZoomToQueryParamsInternalValue |
         ZoomToLayersInternalValue |
         ZoomToMapInitialExtentValue |
         ZoomToFeaturesExtentValue
  relatedWidgets: string[]
}

export default class ZoomToFeatureAction extends AbstractMessageAction {
  NoLockTriggerLayerWidgets = ['Map']

  // filterMessageDescription is used to filter message types when try to add message action in builder setting page
  filterMessageDescription (messageDescription: MessageDescription): boolean {
    return filterMessageDescription(messageDescription)
  }

  // filterMessage is used to filter message at runtime
  filterMessage (message: Message): boolean {
    return true
  }

  getDefaultMessageActionConfig (message: Message): ZoomToMessageConfig {
    const defaultConfig: ZoomToMessageConfig = {
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
    const appMode = getAppStore().getState().appRuntimeInfo.appMode
    if (messageType === MessageType.DataRecordsSelectionChange ||
        messageType === MessageType.DataRecordSetChange ||
        messageType === MessageType.DataSourceFilterChange) {
      return appMode === AppMode.Express ? null : 'message-actions/zoom-to-feature-action-setting'
    } else {
      return null
    }
  }

  onExecute (message: Message, actionConfig?: IMConfig): Promise<boolean> | boolean {
    return loadArcGISJSAPIModules(['esri/Graphic']).then(modules => {
      let Graphic: typeof __esri.Graphic = null;
      [Graphic] = modules

      let zoomToOption: ZoomToOptions = null
      const viewPadding: ViewPadding = {
        left: 50,
        right: 50,
        top: 50,
        bottom: 50
      }

      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (message.type) {
        case MessageType.DataRecordSetChange:
          // typical case: Query widget creates records
          const dataRecordSetChangeMessage = message as DataRecordSetChangeMessage
          if (dataRecordSetChangeMessage.changeType === RecordSetChangeType.CreateUpdate) {
            zoomToOption = getZoomToOptions(actionConfig, viewPadding)

            // priority: message.extent > message.records
            if (dataRecordSetChangeMessage.extent) {
              const zoomToValue: ZoomToFeaturesExtentValue = {
                type: 'zoom-to-features-extent',
                extent: dataRecordSetChangeMessage.extent,
                zoomToOption
              }

              MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue.value', zoomToValue)
            } else {
              const arrayFeatures: __esri.Graphic[][] = []
              dataRecordSetChangeMessage.dataRecordSets.forEach(dataRecordSet => {
                if (dataRecordSet && dataRecordSet.records) {
                  const features: __esri.Graphic[] = []
                  for (let i = 0; i < dataRecordSet.records.length; i++) {
                    if ((dataRecordSet.records[i] as FeatureDataRecord).feature) {
                      const feature: __esri.Graphic = cloneFeature((dataRecordSet.records[i] as FeatureDataRecord).feature, Graphic)
                      features.push(feature)
                    }
                  }
                  if (features.length > 0) {
                    arrayFeatures.push(features)
                  }
                }
              })

              const zoomToValue: ZoomToArrayGraphicsInternalValue = {
                type: 'zoom-to-array-graphics',
                arrayFeatures: arrayFeatures,
                zoomToOption: zoomToOption
              }

              MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue.value', zoomToValue)
            }
          }
          break
        case MessageType.DataRecordsSelectionChange:
          // const config = getAppStore().getState().appConfig
          // const messageWidgetJson = config.widgets[message.widgetId]
          // const messageWidgetLabel = messageWidgetJson.manifest.label
          const dataRecordsSelectionChangeMessage = message as DataRecordsSelectionChangeMessage
          const records = dataRecordsSelectionChangeMessage.records
          const selectFeatures: __esri.Graphic[] = []
          let dataSourceId: string = null

          if (records) {
            const firstRecord = records[0]

            if (firstRecord) {
              if (firstRecord.dataSource) {
                dataSourceId = firstRecord.dataSource.id
              }

              const isValidRecordDataSource = validateRecordDataSourceForRecordsSelectionChangeMessage(records, actionConfig)

              if (!isValidRecordDataSource) {
                break
              }
            }

            for (let i = 0; i < records.length; i++) {
              if ((records[i] as FeatureDataRecord).feature) {
                const feature = cloneFeature((records[i] as FeatureDataRecord).feature, Graphic)
                selectFeatures.push(feature)
              }
            }
          }

          const isNotEmptyFeatures = selectFeatures && selectFeatures.length > 0

          zoomToOption = getZoomToOptions(actionConfig, viewPadding)

          // priority: message.extent > message.records
          if (dataRecordsSelectionChangeMessage.extent) {
            const zoomToFeaturesExtentValue: ZoomToFeaturesExtentValue = {
              type: 'zoom-to-features-extent',
              extent: dataRecordsSelectionChangeMessage.extent,
              zoomToOption
            }

            MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue.value', zoomToFeaturesExtentValue)
          } else if (isNotEmptyFeatures) {
            // selectFeatures is not empty, zoom to selected features
            if (dataSourceId) {
              const zoomToGraphicsInternalValue: ZoomToGraphicsInternalValue = {
                type: 'zoom-to-graphics',
                features: selectFeatures,
                dataSourceId: dataSourceId,
                zoomToOption: zoomToOption
              }

              MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue.value', zoomToGraphicsInternalValue)
            }
          } else {
            // selected features are empty, zoom to map initial extent if goToInitialMapExtentWhenSelectionCleared is true
            // Note, actionConfig?.goToInitialMapExtentWhenSelectionCleared is always false in express mode
            if (actionConfig?.goToInitialMapExtentWhenSelectionCleared) {
              const zoomToMapInitialExtentValue: ZoomToMapInitialExtentValue = {
                type: 'zoom-to-map-initial-extent',
                zoomToOption: undefined
              }

              MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue.value', zoomToMapInitialExtentValue)
            }
          }

          break
        case MessageType.ExtentChange:
          const extentChangeMessage = message as ExtentChangeMessage
          const relatedWidgetIds = extentChangeMessage.getRelatedWidgetIds()

          if (relatedWidgetIds.includes(this.widgetId)) {
            break
          }

          const extentValue: ZoomToExtentInternalValue = {
            type: 'zoom-to-extent',
            extent: extentChangeMessage.extent,
            viewpoint: extentChangeMessage.viewpoint,
            stationary: extentChangeMessage.stationary,
            interactive: extentChangeMessage.interactive,
            zoomToOption: undefined,
            publishTime: extentChangeMessage.publishTime,
            publishWidgetId: extentChangeMessage.widgetId
          }

          const zoomToFeatureActionValue: ZoomToFeatureActionValue = {
            value: extentValue,
            relatedWidgets: relatedWidgetIds
          }
          MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue', zoomToFeatureActionValue)
          break
        case MessageType.DataSourceFilterChange:
          // typical case: Filter widget changes data source filter
          const filterChangeMessage = message as DataSourceFilterChangeMessage
          const {
            validChangedDataSourceIds,
            useDataSourceIds
          } = getValidChangedDataSourceIdsAndAllUseDataSourceIdsForDataFilteringChangeMessage(filterChangeMessage, actionConfig)

          if (validChangedDataSourceIds.length === 0) {
            break
          }

          zoomToOption = getZoomToOptions(actionConfig, viewPadding)

          const filterChangeActionValue: ZoomToQueryParamsInternalValue = {
            type: 'zoom-to-query-params',
            filterChangedDataSourceIds: validChangedDataSourceIds,
            useDataSourceIds,
            zoomToOption
          }

          MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue.value', filterChangeActionValue)
          break
        case MessageType.DataSourcesChange:
          // typical case: AddData widget adds new data source
          const dataSourcesChangeMessage = message as DataSourcesChangeMessage

          if (dataSourcesChangeMessage.changeType === DataSourcesChangeType.Create) {
            const dataSourceIds = []
            dataSourcesChangeMessage.dataSources.forEach(dataSource => {
              dataSourceIds.push(dataSource.id)
            })

            if (dataSourceIds.length === 0) {
              break
            }

            zoomToOption = getZoomToOptions(actionConfig, viewPadding)

            const zoomToFeatureActionValueForLayers: ZoomToLayersInternalValue = {
              type: 'zoom-to-layers',
              dataSourceIds: dataSourceIds,
              zoomToOption: zoomToOption
            }

            MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue.value', zoomToFeatureActionValueForLayers)
          }

          break
      }

      return true
    })
  }
}

function getZoomToOptions (actionConfig: IMConfig, padding: ViewPadding): ZoomToOptions {
  let zoomToOptions: ZoomToOptions = {}

  if (actionConfig && actionConfig.isUseCustomZoomToOption && typeof actionConfig.zoomToOption.scale === 'number') {
    zoomToOptions.scale = actionConfig.zoomToOption.scale
  }

  if (padding) {
    zoomToOptions.padding = padding
  }

  if (Object.keys(zoomToOptions).length === 0) {
    zoomToOptions = null
  }

  return zoomToOptions
}
