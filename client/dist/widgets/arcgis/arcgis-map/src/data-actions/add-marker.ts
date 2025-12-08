import { AbstractDataAction, DataLevel, type FeatureDataRecord, type DataRecordSet, MutableStoreManager, DataSourceStatus, type ArcGISQueriableDataSource, i18n } from 'jimu-core'
import { featureUtils, loadArcGISJSAPIModules, type MarkerGroup, MapViewManager } from 'jimu-arcgis'
import type { IFeature } from '@esri/arcgis-rest-feature-service'
import { type IMAddMarkerConfig, asyncGetFinalAddMarkerSymbolInstance } from '../common/add-marker-common'

export default class AddMarkerDataAction extends AbstractDataAction {
  supportProviderWidget = true

  /**
   * AddMarker data action only supports DataLevel.RECORDS data, doesn't support DataLevel.DATA_SOURCE data.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean> {
    if (dataSets.length === 1) {
      const dataSet = dataSets[0]

      if (dataSet && dataLevel === DataLevel.Records && dataSet.records?.length > 0 && dataSet.dataSource && dataSet.dataSource.getStatus() !== DataSourceStatus.NotReady) {
        const featuresWithGeometry = this.getFeaturesWithGeometry(dataSet.records as FeatureDataRecord[])

        if (featuresWithGeometry.length > 0) {
          return true
        }
      }
    }

    return false
  }

  async onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel, triggerWidgetId: string, actionConfig?: IMAddMarkerConfig): Promise<boolean | React.ReactElement> {
    this.closePopupIfTriggeredFromMapSelf(triggerWidgetId)

    const dataSet = dataSets[0]
    const dataSource = dataSet.dataSource as ArcGISQueriableDataSource
    const layerDefinition = dataSource?.getLayerDefinition && dataSource.getLayerDefinition()
    const displayField = layerDefinition?.displayField
    const recordsObj: { [id: string]: FeatureDataRecord } = {}

    if (dataSet?.records?.length > 0) {
      dataSet.records.forEach(record => {
        const id = record.getId()
        recordsObj[id] = record as FeatureDataRecord
      })
    }

    const intl = i18n.getIntl()

    // featureUtils.convertDataRecordSetToFeatureSet() will clone graphics
    const featureSet = await featureUtils.convertDataRecordSetToFeatureSet(dataSet)
    const features = featureSet?.features || []
    const [Graphic] = await loadArcGISJSAPIModules(['esri/Graphic'])
    const symbol = await asyncGetFinalAddMarkerSymbolInstance(actionConfig)
    const pointGraphics: __esri.Graphic[] = []
    features.forEach(feature => {
      const geometry = feature?.geometry

      if (geometry) {
        let pointGeometry: __esri.Point | __esri.Multipoint = null

        if (geometry.type === 'point' || geometry.type === 'multipoint') {
          pointGeometry = geometry.clone()
        } else if (geometry.type === 'extent') {
          pointGeometry = geometry.center?.clone()
        } else if (geometry.type === 'polygon') {
          pointGeometry = geometry.centroid?.clone()
        } else if (geometry.type === 'polyline') {
          pointGeometry = geometry.extent?.center?.clone()
        }

        if (pointGeometry) {
          let displayFieldValue = ''

          if (feature && displayField) {
            displayFieldValue = feature?.attributes?.[displayField] || ''
            const objectId = feature.getObjectId()
            const record = recordsObj[objectId]

            if (record && record.getFormattedFieldValue) {
              const formatValue = record.getFormattedFieldValue(displayField, this.intl || intl)

              if (formatValue) {
                displayFieldValue = formatValue
              }
            }
          }

          const attributes: any = {
            title: displayFieldValue || ''
          }

          // Don't support attributes.label by AddMarker data action, only support it in URL.

          const graphic = new Graphic({
            geometry: pointGeometry,
            attributes
          })

          pointGraphics.push(graphic)
        }
      }
    })

    if (pointGraphics.length > 0) {
      const mutableStoreManager = MutableStoreManager.getInstance()
      const configSymbolJson = actionConfig?.symbol?.asMutable() || null
      const addMarkerData: MarkerGroup = {
        configSymbolJson,
        symbol,
        graphics: pointGraphics
      }

      mutableStoreManager.updateStateValue(this.widgetId, 'addMarkerData', addMarkerData)
    }

    return true
  }

  closePopupIfTriggeredFromMapSelf(triggerWidgetId: string) {
    const mapWidgetId = this.widgetId

    if (mapWidgetId && mapWidgetId === triggerWidgetId) {
      const mapViewManager = MapViewManager.getInstance()
      const jimuMapViewGroup = mapViewManager.getJimuMapViewGroup(mapWidgetId)

      if (jimuMapViewGroup) {
        const activeJimuMapView = jimuMapViewGroup.getActiveJimuMapView()

        if (activeJimuMapView && activeJimuMapView?.view?.popup?.visible) {
          activeJimuMapView.closePopup()
        }
      }
    }
  }

  getFeaturesWithGeometry(records: FeatureDataRecord[]): Array<IFeature | __esri.Graphic> {
    const features: Array<IFeature | __esri.Graphic> = []

    if (records?.length > 0) {
      records.forEach(record => {
        const feature = record.feature

        if (feature && feature.geometry) {
          features.push(feature)
        }
      })
    }

    return features
  }
}