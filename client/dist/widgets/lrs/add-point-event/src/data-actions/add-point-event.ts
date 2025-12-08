import type Polyline from 'esri/geometry/Polyline'
import { round } from 'lodash-es'
import { AbstractDataAction, type DataRecordSet, MutableStoreManager, DataLevel, getAppStore, DataSourceStatus, type ImmutableObject, loadArcGISJSAPIModules, DataSourceTypes, type FeatureLayerDataSource } from 'jimu-core'
import { type RouteInfo, type EventInfo, isDefined, getRouteFromEndMeasures, QueryRouteMeasures, type NetworkInfo, queryRouteIdOrName, getDateWithTZOffset, findNetworkInfoFromMapViewsConfig, findEventInfoFromMapViewsConfig } from 'widgets/shared-code/lrs'

export default class ExportJson extends AbstractDataAction {
  isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return Promise.resolve(false)
    }

    const dataSet = dataSets[0]
    const record = dataSet.records[0]
    if (!isDefined(record)) {
      return Promise.resolve(false)
    }
    const data = record.getData()
    const dataAttributes = JSON.parse(JSON.stringify(data))
    const { dataSource, records } = dataSet
    const typeIsLayer = dataSource.type === DataSourceTypes.FeatureLayer || dataSource.type === DataSourceTypes.SceneLayer
    const isDataSourceSet = dataSource.isDataSourceSet()
    const notRecordLevel = dataLevel !== DataLevel.Records
    const recordIsEmpty = dataLevel === DataLevel.Records && records?.length === 0
    const notInConfigAndNotLayer = !dataSource.isInAppConfig() && !typeIsLayer
    if (isDataSourceSet || notRecordLevel || recordIsEmpty || notInConfigAndNotLayer) {
      return Promise.resolve(false)
    }

    // get the network datasource
    let networkDS = dataSource
    if (dataSource.id.includes('output_point') || dataSource.id.includes('output_line')) {
      networkDS = dataSource.getOriginDataSources()[0] as FeatureLayerDataSource
    }

    if (!isDefined(networkDS)) {
      return Promise.resolve(false)
    }

    const appConfig = getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]

    // check if the network datasource is registered as a datasouce in addPointEvent widget
    let networkInfo: ImmutableObject<NetworkInfo>
    widgetJson.config.lrsLayers.forEach((lrsLayer: any) => {
      if ((isDefined(networkDS) && lrsLayer.id === networkDS.id)) {
        networkInfo = lrsLayer.networkInfo
      }
    })

    if (!isDefined(networkInfo)) {
      const mapViewsConfig = widgetJson.config.mapViewsConfig
      networkInfo = findNetworkInfoFromMapViewsConfig(mapViewsConfig, networkDS)
    }

    if (!networkInfo) {
      return Promise.resolve(false)
    }

    // if networkInfo has no events associated with it, don't show the data action
    if (!isDefined(networkInfo.eventLayers) || networkInfo.eventLayers.length === 0) {
      return Promise.resolve(false)
    }

    let eventInfo: ImmutableObject<EventInfo>
    const eventLayers = networkInfo.eventLayers
    widgetJson.config.lrsLayers.forEach((lrsLayer: any) => {
      eventLayers.forEach((eventLayer: string) => {
        if (String(lrsLayer.originName) === eventLayer) {
          eventInfo = lrsLayer.eventInfo
        }
      })
    })

    if (!isDefined(eventInfo)) {
      const mapViewsConfig = widgetJson.config.mapViewsConfig
      eventInfo = findEventInfoFromMapViewsConfig(mapViewsConfig, networkInfo)
    }

    // event is not registered for this network
    if (!eventInfo) {
      return Promise.resolve(false)
    }

    const routeIdField = Object.keys(dataAttributes).find(key => key === networkInfo.routeIdFieldSchema.name)

    // all LRS records have a routeId
    if (!isDefined(routeIdField) || !isDefined(dataAttributes[routeIdField])) {
      return Promise.resolve(false)
    }

    // don't show data action if more than one record is selected
    if (dataSet.records.length > 1) {
      return Promise.resolve(false)
    }

    // determine if the datasource is from an LRS widget (Search By Route or Identify)
    let fromLRSWidget = false
    const dataSourceId = dataSource.id
    // does dataSourceId include 'output_line' in the id
    if (dataSourceId.includes('output_point') || dataSourceId.includes('output_line')) {
      fromLRSWidget = true
    }

    // came from Search By Route or Identify
    if (fromLRSWidget && dataSet.records.length !== 1) {
      return Promise.resolve(false)
    }

    //Don't support if dataSource is not valid or notReady
    if (!dataSource || dataSource.getStatus() === DataSourceStatus.NotReady) {
      return Promise.resolve(false)
    }

    return Promise.resolve(true)
  }

  async onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    const dataSet = dataSets[0]
    const { records, dataSource } = dataSet
    const appConfig = getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]

    // get the network datasource
    let networkDS = dataSource
    if (dataSource.id.includes('output_point') || dataSource.id.includes('output_line')) {
      networkDS = dataSource.getOriginDataSources()[0] as FeatureLayerDataSource
    }

    if (!isDefined(networkDS)) {
      return Promise.resolve(false)
    }

    let networkInfo: ImmutableObject<NetworkInfo>
    widgetJson.config.lrsLayers.forEach((lrsLayer: any) => {
      if ((isDefined(networkDS) && lrsLayer.id === networkDS.id)) {
        networkInfo = lrsLayer.networkInfo
      }
    })

    if (!isDefined(networkInfo)) {
      const mapViewsConfig = widgetJson.config.mapViewsConfig
      networkInfo = findNetworkInfoFromMapViewsConfig(mapViewsConfig, networkDS)
    }

    const record = records[0]
    const data = record.getData()
    const dataAttributes = JSON.parse(JSON.stringify(data))
    const dataAttributesNoCase = Object.fromEntries(Object.entries(dataAttributes).map(([key, val]) => [key.toLowerCase(), val]))

    const rteInfo: RouteInfo = {
      routeId: '',
      routeName: '',
      fromMeasure: NaN,
      toMeasure: NaN,
      fromDate: undefined,
      toDate: undefined,
      selectedMeasure: NaN,
      selectedFromDate: undefined,
      selectedToDate: undefined
    }

    // network fields
    const routeIdField = Object.keys(dataAttributes).find(key => key === networkInfo.routeIdFieldSchema.name)
    const routeNameField = Object.keys(dataAttributes).find(key => key === networkInfo.routeNameFieldSchema?.name)
    const fromDateField = Object.keys(dataAttributes).find(key => key === networkInfo.fromDateFieldSchema.name)
    const toDateField = Object.keys(dataAttributes).find(key => key === networkInfo.toDateFieldSchema.name)
    const lineIdField = Object.keys(dataAttributes).find(key => key === networkInfo.lineIdFieldSchema?.name)
    const lineOrderField = Object.keys(dataAttributes).find(key => key === networkInfo.lineOrderFieldSchema?.name)

    const fromDate = isDefined(dataAttributes[fromDateField]) ? getDateWithTZOffset(dataAttributes[fromDateField], networkDS) : null
    const toDate = isDefined(dataAttributes[toDateField]) ? getDateWithTZOffset(dataAttributes[toDateField], networkDS) : null

    rteInfo.fromDate = fromDate
    rteInfo.selectedFromDate = new Date(Date.now())
    rteInfo.toDate = toDate
    rteInfo.selectedToDate = null
    rteInfo.routeId = isDefined(dataAttributes[routeIdField]) ? String(dataAttributes[routeIdField]) : null
    rteInfo.routeName = isDefined(routeNameField) && isDefined(dataAttributes[routeNameField]) ? String(dataAttributes[routeNameField]) : null
    rteInfo.lineId = isDefined(lineIdField) && isDefined(dataAttributes[lineIdField]) ? String(dataAttributes[lineIdField]) : null
    rteInfo.routeLineOrder = isDefined(lineOrderField) && isDefined(dataAttributes[lineOrderField]) ? Number(dataAttributes[lineOrderField]) : null

    rteInfo.fromMeasure = isDefined(dataAttributesNoCase.measure) ? Number(dataAttributesNoCase.measure) : NaN
    rteInfo.selectedMeasure = isDefined(dataAttributesNoCase.measure) ? Number(dataAttributesNoCase.measure) : NaN
    rteInfo.validRoute = true

    // set the point from the feature
    if (isDefined(dataAttributes.Measure)) {
      let Point: typeof __esri.Point = null
      let Polyline: typeof __esri.Polyline = null
      await loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/Polyline']).then(modules => {
        [Point, Polyline] = modules
      }).then(() => {
        // Input could come from Point or Polyline feature.
        const geometry = record.getRawGeometry() as __esri.Geometry
        if (geometry.type === 'point') {
          const point = new Point(geometry)
          rteInfo.selectedPoint = point
        } else if (geometry.type === 'polyline') {
          // Always use the first point in the polyline.
          const polyline = new Polyline(geometry)
          const point = polyline.getPoint(0, 0)
          rteInfo.selectedPoint = point
        }
      })
    }

    let routePolyline = null
    // get the route polyline for the specified route.  The feature that comes across in the record is only a polyline from the start/end measure
    if (isDefined(networkInfo)) {
      const routeIdOrName = networkInfo.useRouteName ? rteInfo.routeName : rteInfo.routeId
      await queryRouteIdOrName(routeIdOrName, networkInfo, networkDS, false, true, '', rteInfo.fromDate)
        .then(async (results) => {
          if (isDefined(results)) {

            await Promise.all(results.features.map((feature) => {
              routePolyline = feature.geometry as Polyline
              return feature
            }))

            // get the endpoints of the route polyline
            if (isDefined(routePolyline)) {
              rteInfo.selectedPolyline = routePolyline
              const routeEndPoints = getRouteFromEndMeasures(routePolyline)

              // query for the from and to measures for the route
              if (isDefined(routeEndPoints)) {
                const measures = await QueryRouteMeasures(networkDS, networkInfo, routeEndPoints, rteInfo.fromDate, rteInfo.routeId)
                const minMeasure = Math.min(...measures)
                const maxMeasure = Math.max(...measures)

                rteInfo.fromMeasure = round(minMeasure, networkInfo.measurePrecision)
                rteInfo.toMeasure = round(maxMeasure, networkInfo.measurePrecision)
              }
            }
          }
        })
    }

    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedNetworkDataSource', networkDS)
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedRouteInfo', rteInfo)

    return Promise.resolve(true)
  }
}

//get the whole app config
function getAppConfig () {
  return window.jimuConfig.isBuilder ? getAppStore().getState()?.appStateInBuilder?.appConfig : getAppStore().getState()?.appConfig
}
