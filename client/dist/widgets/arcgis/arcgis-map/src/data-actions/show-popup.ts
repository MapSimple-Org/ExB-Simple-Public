import { type DataRecordSet, AbstractDataAction, DataLevel, ExBAddedJSAPIProperties, type ArcGISQueriableDataSource, type ArcGISQueryParams } from 'jimu-core'
import { type JimuMapView, featureUtils } from 'jimu-arcgis'
import { getActiveJimuMapView } from '../runtime/utils'

export default class ShowPopup extends AbstractDataAction {
  // eslint-disable-next-line @typescript-eslint/require-await
  async isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean> {
    // 1. Map popup is enabled Popup enabled in the map widget
    // 2. Layer data source is in the map & visible
    // 3. Layer popupEnabled is not false
    if (dataSets.length !== 1 || dataLevel !== DataLevel.Records) {
      return false
    }

    const dataSet = dataSets[0]
    const dataSourceId = dataSet?.dataSource?.id
    const records = dataSet?.records

    if (!dataSet || !dataSourceId || !records || records.length === 0) {
      return false
    }

    const jimuMapView = this._getActiveJimuMapView()

    if (!jimuMapView || jimuMapView.isDestroyed() || jimuMapView.isCached()) {
      return false
    }

    if (!jimuMapView.view || !jimuMapView.view.popupEnabled) {
      return false
    }

    const jimuLayerView = jimuMapView.getJimuLayerViewByDataSourceId(dataSourceId)

    if (!jimuLayerView || !jimuLayerView.isLayerVisible() || jimuLayerView.layer?.popupEnabled === false) {
      return false
    }

    return true
  }

  async onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean> {
    const dataSet = dataSets[0]
    const dataSource = dataSet?.dataSource as ArcGISQueriableDataSource
    const dataSourceId = dataSource?.id
    const jimuMapView = this._getActiveJimuMapView()
    const apiView = jimuMapView?.view

    if (apiView) {
      const featureSet = await featureUtils.convertDataRecordSetToFeatureSet(dataSet)
      let features = featureSet?.features || []
      features = features.filter(feature => !!feature)

      // If you clicked a 3D feature, popup.selectedFeature.geometry may be empty.
      // We need to make sure features have geometries.
      await this.queryGeometries(dataSource, features)
      features = features.filter(feature => !!feature.geometry)

      if (features.length > 0) {
        features.forEach(feature => {
          feature[ExBAddedJSAPIProperties.EXB_DATA_SOURCE_ID] = dataSourceId
        })

        await this._panTo(apiView, features, dataSource)
        jimuMapView.openPopup(features)
      }
    }

    return true
  }

  private _getActiveJimuMapView(): JimuMapView {
    // this.widgetId is the map widget id
    const jimuMapView = getActiveJimuMapView(this.widgetId, true)
    return jimuMapView
  }

  // make sure features have geometries
  private async queryGeometries(dataSource: ArcGISQueriableDataSource, features: __esri.Graphic[]) {
    const featuresWithoutGeometry = features.filter(feature => !feature.geometry)

    if (dataSource && featuresWithoutGeometry.length > 0) {
      const featuresObj: { [objectId: string]: __esri.Graphic } = {}
      const strObjectIds: string[] = []
      featuresWithoutGeometry.forEach(feature => {
        const objectId = feature.getObjectId()

        if (typeof objectId === 'number') {
          const strObjectId = objectId.toString()
          strObjectIds.push(strObjectId)
          featuresObj[objectId] = feature
        }
      })

      if (strObjectIds.length > 0) {
        const queryParams: ArcGISQueryParams = {
          outFields: [],
          objectIds: strObjectIds,
          returnGeometry: true
        }

        const queryResult = await dataSource.queryAll(queryParams)
        const records = queryResult?.records

        if (records?.length > 0) {
          const featureSet = await featureUtils.convertDataRecordSetToFeatureSet({
            name: '',
            dataSource,
            records
          })

          const featuresWithGeometry = featureSet?.features

          if (featuresWithGeometry?.length > 0) {
            featuresWithGeometry.forEach(featureWithGeometry => {
              if (featureWithGeometry) {
                const objectId = featureWithGeometry.getObjectId()
                const geometry = featureWithGeometry.geometry

                if (typeof objectId === 'number' && geometry) {
                  const featureWithoutGeometry = featuresObj[objectId]

                  if (featureWithoutGeometry) {
                    featureWithoutGeometry.geometry = geometry
                  }
                }
              }
            })
          }
        }
      }
    }
  }

  private async _panTo(mapView: __esri.MapView | __esri.SceneView, features: __esri.Graphic[], dataSource: ArcGISQueriableDataSource) {
    let center: __esri.Point = null
    const feature = features.find(f => f.geometry)
    const geometry = feature?.geometry

    if (geometry) {
      if (geometry.extent) {
        center = geometry.extent.center
      } else if (geometry.declaredClass === 'esri.geometry.Point') {
        center = geometry as __esri.Point
      }
    }

    if (center) {
      await mapView.goTo(center)
    }
  }
}
