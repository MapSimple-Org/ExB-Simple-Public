import {
  type DataRecordSet,
  type FeatureDataRecord,
  type DataSource,
  type JSAPILayerMixin,
  type DataRecord,
  AbstractDataAction,
  DataSourceStatus,
  MutableStoreManager,
  DataLevel
} from 'jimu-core'
import { loadArcGISJSAPIModules, type ZoomToOptions } from 'jimu-arcgis'
import { cloneFeature } from '../runtime/utils'
import type { ZoomToGraphicsInternalValue, ZoomToArrayGraphicsInternalValue } from '../message-actions/zoom-to-feature-action'

export default class ZoomTo extends AbstractDataAction {
  /**
   * ZoomTo data action supports both DataSource data level and Records data level.
   * supported cases:
   * case1: dataSets.length === 1 and dataLevel is DATA_SOURCE
   * case2: dataSets.length === 1 and dataLevel is RECORDS
   * case3: dataSets.length >= 2 and dataLevel is RECORDS
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    const supportedDataSets = this.getSupportedDataSets(dataSets, dataLevel)

    if (supportedDataSets.length === 1) {
      // case1, case2
      return true
    } else if (supportedDataSets.length >= 2) {
      // case3
      return dataLevel === DataLevel.Records
    }

    return false
  }

  private getSupportedDataSets (dataSets: DataRecordSet[], dataLevel: DataLevel): DataRecordSet[] {
    const supportedDataSets = dataSets.filter(dataSet => {
      const dataSource = dataSet.dataSource as DataSource & JSAPILayerMixin

      if (!dataSource || dataSource.getStatus() === DataSourceStatus.NotReady) {
        return false
      }

      // records maybe come from a table, so we need to check if the dataSource has geometry or not
      const supportSpatialInfo = dataSource?.supportSpatialInfo && dataSource?.supportSpatialInfo()

      if (!supportSpatialInfo) {
        return false
      }

      if (dataLevel === DataLevel.Records) {
        // zoom to graphics
        const records = this.getRecords(dataSet, dataLevel)
        return records.length > 0
      } else if (dataLevel === DataLevel.DataSource) {
        // zoom to layer
        return !!dataSource?.createJSAPILayerByDataSource
      }

      return false
    })

    return supportedDataSets
  }

  private getRecords (dataSet: DataRecordSet, dataLevel: DataLevel): DataRecord[] {
    let result: DataRecord[] = []

    if (dataLevel === DataLevel.DataSource) {
      result = []
    } else if (dataLevel === DataLevel.Records && dataSet.records?.length > 0) {
      result = dataSet.records
    }

    return result
  }

  private getClonedFeatures (dataSet: DataRecordSet, dataLevel: DataLevel, Graphic: typeof __esri.Graphic): __esri.Graphic[] {
    const records = this.getRecords(dataSet, dataLevel)
    const clonedFeatures = records.map(record => cloneFeature((record as FeatureDataRecord).feature, Graphic))
    return clonedFeatures
  }

  async onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    const modules = await loadArcGISJSAPIModules(['esri/Graphic'])
    const [Graphic] = modules as [typeof __esri.Graphic]
    const supportedDataSets = this.getSupportedDataSets(dataSets, dataLevel)
    const zoomToOption: ZoomToOptions = {
      padding: {
        left: 50,
        right: 50,
        top: 50,
        bottom: 50
      }
    }

    if (supportedDataSets.length === 1) {
      // case1, case2
      const dataSet = supportedDataSets[0]
      const clonedFeatures = this.getClonedFeatures(dataSet, dataLevel, Graphic)

      const featureActionValue: ZoomToGraphicsInternalValue = {
        type: 'zoom-to-graphics',
        features: clonedFeatures,
        dataSourceId: dataSet.dataSource?.id || null,
        zoomToOption
      }

      MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue.value', featureActionValue)
    } else if (supportedDataSets.length >= 2) {
      // case3
      const arrayFeatures: __esri.Graphic[][] = []

      supportedDataSets.forEach(dataSet => {
        const clonedFeatures = this.getClonedFeatures(dataSet, dataLevel, Graphic)
        arrayFeatures.push(clonedFeatures)
      })

      const featureActionValue: ZoomToArrayGraphicsInternalValue = {
        type: 'zoom-to-array-graphics',
        arrayFeatures,
        zoomToOption
      }

      MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'zoomToFeatureActionValue.value', featureActionValue)
    }

    return true
  }
}
