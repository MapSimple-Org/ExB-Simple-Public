import {
  type DataRecordSet,
  type FeatureDataRecord,
  type JSAPILayerMixin,
  type DataSource,
  type DataRecord,
  AbstractDataAction,
  DataSourceStatus,
  MutableStoreManager,
  DataLevel
} from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { cloneFeature } from '../runtime/utils'
import type { PanToGeometriesInternalValue, PanToLayerInternalValue } from '../message-actions/pan-to-action'

export default class PanTo extends AbstractDataAction {
  /**
   * PanTo data action supports both DataSource data level and Records data level.
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
        // pan to graphics
        const records = this.getRecords(dataSet, dataLevel)
        return records.length > 0
      } else if (dataLevel === DataLevel.DataSource) {
        // pan to layer
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
      result = dataSet.records.filter((record: FeatureDataRecord) => !!record.feature?.geometry)
    }

    return result
  }

  private getClonedGeometries (dataSet: DataRecordSet, dataLevel: DataLevel, Graphic: typeof __esri.Graphic): __esri.Geometry[] {
    const clonedGeometries: __esri.Geometry[] = []
    const records = this.getRecords(dataSet, dataLevel)

    records.forEach(record => {
      const feature = cloneFeature((record as FeatureDataRecord).feature, Graphic)

      if (feature && feature.geometry) {
        clonedGeometries.push(feature.geometry)
      }
    })

    return clonedGeometries
  }

  async onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    const modules = await loadArcGISJSAPIModules(['esri/Graphic'])
    const [Graphic] = modules as [typeof __esri.Graphic]
    const supportedDataSets = this.getSupportedDataSets(dataSets, dataLevel)

    if (supportedDataSets.length === 1) {
      // case1, case2
      const dataSet = dataSets[0]
      let panToActionValue: PanToGeometriesInternalValue | PanToLayerInternalValue = null
      const geometries = this.getClonedGeometries(dataSet, dataLevel, Graphic)

      if (geometries.length > 0) {
        // case2
        panToActionValue = {
          type: 'pan-to-geometries',
          geometries
        }
      } else {
        // case1
        panToActionValue = {
          type: 'pan-to-layer',
          dataSourceId: dataSet.dataSource?.id || null
        }
      }

      MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'panToActionValue.value', panToActionValue)
    } else if (supportedDataSets.length >= 2) {
      // case3
      const allGeometries: __esri.Geometry[] = []

      supportedDataSets.forEach(dataSet => {
        const geometries = this.getClonedGeometries(dataSet, dataLevel, Graphic)
        allGeometries.push(...geometries)
      })

      if (allGeometries.length > 0) {
        const panToActionValue: PanToGeometriesInternalValue = {
          type: 'pan-to-geometries',
          geometries: allGeometries
        }

        MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'panToActionValue.value', panToActionValue)
      }
    }

    return true
  }
}
