import type Polyline from 'esri/geometry/Polyline'
import type Point from 'esri/geometry/Point'
import { round } from 'lodash-es'
import { AbstractDataAction, type DataRecordSet, MutableStoreManager, DataLevel, getAppStore, DataSourceStatus, type ImmutableObject, loadArcGISJSAPIModules, DataSourceTypes } from 'jimu-core'
import { type RouteInfo, type EventInfo, isDefined, getRouteFromEndMeasures, QueryRouteMeasures, type NetworkInfo, queryRouteIdOrName, getDateWithTZOffset, findNetworkInfoFromMapViewsConfig, findEventInfoFromMapViewsConfig } from 'widgets/shared-code/lrs'

export default class ExportJson extends AbstractDataAction {
  async isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return false
    }

    const dataSet = dataSets[0]
    if (dataSet.records.length !== 1) {
      return false
    }

    const record = dataSet.records[0]
    const data = record.getData()
    const dataAttributes = JSON.parse(JSON.stringify(data))
    const dataAttributesNoCase = Object.fromEntries(Object.entries(dataAttributes).map(([key, val]) => [key.toLowerCase(), val]))

    let Poly: typeof __esri.Polyline = null
    let isPoint = false
    await loadArcGISJSAPIModules(['esri/geometry/Polyline']).then(modules => {
      [Poly] = modules
    }).then(() => {
      const geometry = record.getGeometry()
      const poly = new Poly(geometry)
      if (poly.paths.length === 0) {
        isPoint = true
      }
    })

    if (!isPoint) {
      return false
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    if (String(dataAttributesNoCase.measure) === '') {
      return false
    }

    const { dataSource, records } = dataSet
    const typeIsLayer = dataSource.type === DataSourceTypes.FeatureLayer || dataSource.type === DataSourceTypes.SceneLayer
    const isDataSourceSet = dataSource.isDataSourceSet()
    const notRecordLevel = dataLevel !== DataLevel.Records
    const recordIsEmpty = dataLevel === DataLevel.Records && records?.length === 0
    const notInConfigAndNotLayer = !dataSource.isInAppConfig() && !typeIsLayer
    if (isDataSourceSet || notRecordLevel || recordIsEmpty || notInConfigAndNotLayer) {
      return false
    }

    //Don't support if dataSource is not valid or notReady
    if (!dataSource || dataSource.getStatus() === DataSourceStatus.NotReady) {
      return false
    }

    // check if the network datasource is registered as a datasouce in addLineEvent widget
    const networkDS = dataSource.getOriginDataSources()[0]
    const appConfig = getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]

    if (!isDefined(networkDS)) {
      return false
    }

    let networkInfo: ImmutableObject<NetworkInfo>
    widgetJson.config.lrsLayers.forEach((lrsLayer: any) => {
      if (lrsLayer.id === networkDS.id) {
        networkInfo = lrsLayer.networkInfo
      }
    })

    if (!isDefined(networkInfo)) {
      const mapViewsConfig = widgetJson.config.mapViewsConfig
      networkInfo = findNetworkInfoFromMapViewsConfig(mapViewsConfig, networkDS)
    }

    if (!networkInfo) {
      return false
    }

    // if networkInfo has no events associated with it, don't show the data action
    if (!isDefined(networkInfo.eventLayers) || networkInfo.eventLayers.length === 0) {
      return false
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
      return false
    }

    return true
  }

  async onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    const dataSet = dataSets[0]
    const { records, dataSource } = dataSet
    const networkDS = dataSource.getOriginDataSources()[0]

    if (dataLevel === DataLevel.DataSource) {
      MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedNetworkDataSource', dataSource)
    } else {
      const appConfig = getAppConfig()
      const widgetJson = appConfig?.widgets?.[this.widgetId]

      let networkInfo: ImmutableObject<NetworkInfo>
      widgetJson.config.lrsLayers.forEach((lrsLayer: any) => {
        if (lrsLayer.id === networkDS.id) {
          networkInfo = lrsLayer.networkInfo
        }
      })

      if (!isDefined(networkInfo)) {
        const mapViewsConfig = widgetJson.config.mapViewsConfig
        networkInfo = findNetworkInfoFromMapViewsConfig(mapViewsConfig, networkDS)
      }

      const hideMeasures = widgetJson.config.hideMeasures
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
      const lineNameField = Object.keys(dataAttributes).find(key => key === networkInfo.lineNameFieldSchema?.name)
      const lineOrderField = Object.keys(dataAttributes).find(key => key === networkInfo.lineOrderFieldSchema?.name)

      const fromDate = isDefined(dataAttributes[fromDateField]) ? getDateWithTZOffset(dataAttributes[fromDateField], networkDS) : null
      const toDate = isDefined(dataAttributes[toDateField]) ? getDateWithTZOffset(dataAttributes[toDateField], networkDS) : null

      rteInfo.fromDate = fromDate
      rteInfo.toRouteFromDate = fromDate
      rteInfo.selectedFromDate = new Date(Date.now())
      rteInfo.toDate = toDate
      rteInfo.toRouteToDate = toDate
      rteInfo.selectedToDate = null
      rteInfo.routeId = isDefined(dataAttributes[routeIdField]) ? String(dataAttributes[routeIdField]) : null
      rteInfo.toRouteId = isDefined(dataAttributes[routeIdField]) ? String(dataAttributes[routeIdField]) : null
      rteInfo.routeName = isDefined(routeNameField) && isDefined(dataAttributes[routeNameField]) ? String(dataAttributes[routeNameField]) : null
      rteInfo.toRouteName = isDefined(routeNameField) && isDefined(dataAttributes[routeNameField]) ? String(dataAttributes[routeNameField]) : null
      rteInfo.lineId = isDefined(lineIdField) && isDefined(dataAttributes[lineIdField]) ? String(dataAttributes[lineIdField]) : null
      rteInfo.toLineId = isDefined(lineIdField) && isDefined(dataAttributes[lineIdField]) ? String(dataAttributes[lineIdField]) : null
      rteInfo.routeLineOrder = isDefined(lineOrderField) && isDefined(dataAttributes[lineOrderField]) ? Number(dataAttributes[lineOrderField]) : null
      rteInfo.toRouteLineOrder = isDefined(lineOrderField) && isDefined(dataAttributes[lineOrderField]) ? Number(dataAttributes[lineOrderField]) : null
      rteInfo.lineName = isDefined(lineNameField) && isDefined(dataAttributes[lineNameField]) ? String(dataAttributes[lineNameField]) : null
      rteInfo.toLineName = isDefined(lineNameField) && isDefined(dataAttributes[lineNameField]) ? String(dataAttributes[lineNameField]) : null

      rteInfo.fromMeasure = isDefined(dataAttributesNoCase.measure) ? Number(dataAttributesNoCase.measure) : NaN
      rteInfo.toRouteFromMeasure = isDefined(dataAttributesNoCase.measure) ? Number(dataAttributesNoCase.measure) : NaN
      rteInfo.selectedMeasure = isDefined(dataAttributesNoCase.measure) ? Number(dataAttributesNoCase.measure) : NaN
      rteInfo.toMeasure = isDefined(dataAttributesNoCase.tomeasure) ? Number(dataAttributesNoCase.tomeasure) : NaN
      rteInfo.toRouteToMeasure = isDefined(dataAttributesNoCase.tomeasure) ? Number(dataAttributesNoCase.tomeasure) : NaN
      rteInfo.validRoute = true
      rteInfo.validToRoute = true

      // set the from point from the feature
      if (!hideMeasures) {
        const geometry = record.getGeometry()
        rteInfo.selectedPoint = geometry as Point
        rteInfo.selectedToPoint = null
      }

      let routePolyline = null
      // get the route polyline for the specified route.  The feature that comes across in the record is only a polyline from the start/end measure
      if (isDefined(networkInfo)) {
        const routeIdOrName = networkInfo.useRouteName ? rteInfo.routeName : rteInfo.routeId
        await queryRouteIdOrName(routeIdOrName, networkInfo, networkDS, false, true, '', rteInfo.fromDate)
          .then(async (results) => {
            if (isDefined(results)) {

              await Promise.all(results.features.map(feature => {
                routePolyline = feature.geometry as Polyline
                return feature
              }))

              // get the endpoints of the route polyline
              if (isDefined(routePolyline)) {
                const routeEndPoints = getRouteFromEndMeasures(routePolyline)

                // query for the from and to measures for the route
                if (isDefined(routeEndPoints)) {
                  const measures = await QueryRouteMeasures(networkDS, networkInfo, routeEndPoints, rteInfo.fromDate, rteInfo.routeId)
                  const minMeasure = Math.min(...measures)
                  const maxMeasure = Math.max(...measures)

                  rteInfo.fromMeasure = round(minMeasure, networkInfo.measurePrecision)
                  rteInfo.toRouteFromMeasure = round(minMeasure, networkInfo.measurePrecision)
                  rteInfo.toMeasure = round(maxMeasure, networkInfo.measurePrecision)
                  rteInfo.toRouteToMeasure = rteInfo.toMeasure

                  if (hideMeasures) {
                    const firstPoint = routePolyline.getPoint(0, 0)
                    const lastIdx = routePolyline.paths[routePolyline.paths.length - 1].length - 1
                    const lastPoint = routePolyline.getPoint(routePolyline.paths.length - 1, lastIdx)
                    rteInfo.selectedPoint = firstPoint
                    rteInfo.selectedToPoint = lastPoint
                    rteInfo.selectedMeasure = rteInfo.fromMeasure
                    rteInfo.selectedToMeasure = rteInfo.toRouteToMeasure
                  }
                }
              }
            }
          })
      }

      rteInfo.selectedPolyline = isDefined(routePolyline) ? routePolyline : null
      rteInfo.selectedToPolyline = isDefined(routePolyline) ? routePolyline : null

      MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedNetworkDataSource', networkDS)
      MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedRouteInfo', rteInfo)
    }
    return true
  }
}

//get the whole app config
function getAppConfig () {
  return window.jimuConfig.isBuilder ? getAppStore().getState()?.appStateInBuilder?.appConfig : getAppStore().getState()?.appConfig
}
