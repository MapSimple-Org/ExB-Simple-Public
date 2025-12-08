import type Polyline from 'esri/geometry/Polyline'
import { round } from 'lodash-es'
import { AbstractDataAction, type DataRecordSet, MutableStoreManager, DataLevel, getAppStore, DataSourceStatus, type ImmutableObject, loadArcGISJSAPIModules, DataSourceTypes, type FeatureLayerDataSource } from 'jimu-core'
import { type RouteInfo, type EventInfo, isDefined, getRouteFromEndMeasures, QueryRouteMeasures, type NetworkInfo, queryRouteIdOrName, getDateWithTZOffset, findNetworkInfoFromMapViewsConfig, findEventInfoFromMapViewsConfig } from 'widgets/shared-code/lrs'

export default class ExportJson extends AbstractDataAction {
  async isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return false
    }

    const dataSet = dataSets[0]
    const record = dataSet.records[0]
    if (!isDefined(record)) {
      return false
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
      return false
    }

    // get the network datasource
    let networkDS = dataSource
    if (dataSource.id.includes('output_point') || dataSource.id.includes('output_line')) {
      networkDS = dataSource.getOriginDataSources()[0] as FeatureLayerDataSource
    }

    if (!isDefined(networkDS)) {
      return false
    }

    const appConfig = getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]

    // check if the network datasource is registered as a datasouce in addLineEvent widget
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

    const routeIdField = Object.keys(dataAttributes).find(key => key === networkInfo.routeIdFieldSchema.name)
    const fromDateField = Object.keys(dataAttributes).find(key => key === networkInfo.fromDateFieldSchema.name)
    const toDateField = Object.keys(dataAttributes).find(key => key === networkInfo.toDateFieldSchema.name)
    const lineIdField = Object.keys(dataAttributes).find(key => key === networkInfo.lineIdFieldSchema?.name)

    // all LRS records have a routeId
    if (!isDefined(routeIdField)) {
      return false
    }

    // don't show data action if more than two records are selected
    if (dataSet.records.length > 2) {
      return false
    }

    // data action only supports polyline features
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

    if (isPoint) {
      return false
    }

    // determine if the datasource is from an LRS widget
    let fromLRSWidget = false
    const dataSourceId = dataSource.id
    // does dataSourceId include 'output_line' in the id
    if (dataSourceId.includes('output_line')) {
      fromLRSWidget = true
    }

    // came from Search By Route or Identify
    if (fromLRSWidget && dataSet.records.length !== 1) {
      return false
    }

    //Don't support if dataSource is not valid or notReady
    if (!dataSource || dataSource.getStatus() === DataSourceStatus.NotReady) {
      return false
    }

    // if two records are selected from a table, it must be a line network
    if (!fromLRSWidget && dataSet.records.length === 2) {
      if (!isDefined(lineIdField)) {
        return false
      }
    }

    if (!fromLRSWidget && dataSet.records.length === 2) {
      const record1 = dataSet.records[0]
      const record2 = dataSet.records[1]
      const data1 = record1.getData()
      const data2 = record2.getData()
      const dataAttributes1 = JSON.parse(JSON.stringify(data1))
      const dataAttributes2 = JSON.parse(JSON.stringify(data2))

      // if two records are selected from a table, they must be from the same line
      if (String(dataAttributes1[lineIdField]) !== String(dataAttributes2[lineIdField])) {
        return false
      }

      // if two records are selected from a table with the same routeId, they must have the same date range
      if (String(dataAttributes1[routeIdField]) === String(dataAttributes2[routeIdField]) && Number(dataAttributes1[fromDateField]) !== Number(dataAttributes2[fromDateField]) && Number(dataAttributes1[toDateField]) !== Number(dataAttributes2[toDateField])) {
        return false
      }
    }

    return true
  }

  async onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    const dataSet = dataSets[0]
    const { records, dataSource } = dataSet
    const appConfig = getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]
    const hideMeasures = widgetJson.config.hideMeasures

    // get the network datasource
    let networkDS = dataSource
    if (dataSource.id.includes('output_point') || dataSource.id.includes('output_line')) {
      networkDS = dataSource.getOriginDataSources()[0] as FeatureLayerDataSource
    }

    if (!isDefined(networkDS)) {
      return false
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
    let dataAttributes = JSON.parse(JSON.stringify(data))

    const lineOrderField = Object.keys(dataAttributes).find(key => key === networkInfo.lineOrderFieldSchema?.name)

    let record2 = null
    let twoRouteRecords = false
    if (dataSet.records.length > 1) {
      record2 = records[1]
      twoRouteRecords = true
    }

    let dataAttributes2 = null
    if (isDefined(record2)) {
      const data2 = record2.getData()
      dataAttributes2 = JSON.parse(JSON.stringify(data2))
      const record1LineOrder = dataAttributes[lineOrderField]
      const record2LineOrder = dataAttributes2[lineOrderField]
      // verify the line order of the records
      if (isDefined(record1LineOrder) && isDefined(record2LineOrder) && Number(record1LineOrder) > Number(record2LineOrder)) {
        const temp = dataAttributes
        dataAttributes = dataAttributes2
        dataAttributes2 = temp
      }
    }

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

    const fromDate = isDefined(dataAttributes[fromDateField]) ? getDateWithTZOffset(dataAttributes[fromDateField], networkDS) : null
    const fromDate2 = isDefined(dataAttributes2) && isDefined(dataAttributes2[fromDateField]) ? getDateWithTZOffset(dataAttributes2[fromDateField], networkDS) : null
    const toDate = isDefined(dataAttributes[toDateField]) ? getDateWithTZOffset(dataAttributes[toDateField], networkDS) : null
    const toDate2 = isDefined(dataAttributes2) && isDefined(dataAttributes2[toDateField]) ? getDateWithTZOffset(dataAttributes2[toDateField], networkDS) : null

    rteInfo.fromDate = fromDate
    rteInfo.toRouteFromDate = !twoRouteRecords ? fromDate : fromDate2
    rteInfo.selectedFromDate = new Date(Date.now())
    rteInfo.toDate = toDate
    rteInfo.toRouteToDate = !twoRouteRecords ? toDate : toDate2
    rteInfo.selectedToDate = null
    rteInfo.routeId = isDefined(dataAttributes[routeIdField]) ? String(dataAttributes[routeIdField]) : null
    rteInfo.toRouteId = !twoRouteRecords ? isDefined(dataAttributes[routeIdField]) ? String(dataAttributes[routeIdField]) : null : isDefined(dataAttributes2[routeIdField]) ? String(dataAttributes2[routeIdField]) : null
    rteInfo.routeName = isDefined(routeNameField) && isDefined(dataAttributes[routeNameField]) ? String(dataAttributes[routeNameField]) : null
    rteInfo.toRouteName = !twoRouteRecords ? isDefined(routeNameField) && isDefined(dataAttributes[routeNameField]) ? String(dataAttributes[routeNameField]) : null : isDefined(dataAttributes2[routeNameField]) ? String(dataAttributes2[routeNameField]) : null
    rteInfo.lineId = isDefined(lineIdField) && isDefined(dataAttributes[lineIdField]) ? String(dataAttributes[lineIdField]) : null
    rteInfo.toLineId = isDefined(lineIdField) && isDefined(dataAttributes[lineIdField]) ? String(dataAttributes[lineIdField]) : null
    rteInfo.routeLineOrder = isDefined(lineOrderField) && isDefined(dataAttributes[lineOrderField]) ? Number(dataAttributes[lineOrderField]) : null
    rteInfo.toRouteLineOrder = !twoRouteRecords ? isDefined(lineOrderField) && isDefined(dataAttributes[lineOrderField]) ? Number(dataAttributes[lineOrderField]) : null : isDefined(dataAttributes2[lineOrderField]) ? Number(dataAttributes2[lineOrderField]) : null
    rteInfo.lineName = isDefined(lineNameField) && isDefined(dataAttributes[lineNameField]) ? String(dataAttributes[lineNameField]) : null
    rteInfo.toLineName = isDefined(lineNameField) && isDefined(dataAttributes[lineNameField]) ? String(dataAttributes[lineNameField]) : null

    // if there are two records, it's coming froma a network table so we won't have measures
    const dataAttributesNoCase = Object.fromEntries(Object.entries(dataAttributes).map(([key, val]) => [key.toLowerCase(), val]))
    rteInfo.fromMeasure = isDefined(dataAttributesNoCase.measure) ? Number(dataAttributesNoCase.measure) : NaN
    rteInfo.toRouteFromMeasure = isDefined(dataAttributesNoCase.measure) ? Number(dataAttributesNoCase.measure) : NaN
    rteInfo.selectedMeasure = isDefined(dataAttributesNoCase.measure) ? Number(dataAttributesNoCase.measure) : NaN
    rteInfo.toMeasure = isDefined(dataAttributesNoCase.tomeasure) ? Number(dataAttributesNoCase.tomeasure) : NaN
    rteInfo.toRouteToMeasure = isDefined(dataAttributesNoCase.tomeasure) ? Number(dataAttributesNoCase.tomeasure) : NaN
    rteInfo.selectedToMeasure = isDefined(dataAttributesNoCase.tomeasure) ? Number(dataAttributesNoCase.tomeasure) : NaN
    rteInfo.validRoute = true
    rteInfo.validToRoute = true

    // set the from and to points from the feature
    // this came from search by route or identify since measure is defined
    if (!hideMeasures) {
      if (isDefined(dataAttributes.Measure)) {
        let Poly: typeof __esri.Polyline = null
        await loadArcGISJSAPIModules(['esri/geometry/Polyline']).then(modules => {
          [Poly] = modules
        }).then(() => {
          const geometry = record.getGeometry()
          const poly = new Poly(geometry)
          if (poly.paths.length > 0) {
            const firstPoint = poly.getPoint(0, 0)
            const lastIdx = poly.paths[poly.paths.length - 1].length - 1
            const lastPoint = poly.getPoint(poly.paths.length - 1, lastIdx)
            rteInfo.selectedPoint = firstPoint
            rteInfo.selectedToPoint = lastPoint
          }
        })
      }
    }

    let routePolyline = null
    let toRoutePolyline = null
    // get the route polyline for the specified route.  The feature that comes across in the record is only a polyline from the start/end measure
    if (isDefined(networkInfo)) {
      const routeIdOrName = networkInfo.useRouteName ? rteInfo.routeName : rteInfo.routeId
      await queryRouteIdOrName(routeIdOrName, networkInfo, networkDS, false, true, '', rteInfo.fromDate)
        .then(async (results) => {
          if (isDefined(results)) {

            await Promise.all(results.features.map((feature) => {
              const fromDate = feature.attributes[networkInfo.fromDateFieldSchema.name]
              const toDate = feature.attributes[networkInfo.toDateFieldSchema.name]
              if (((rteInfo.fromDate instanceof Date && fromDate === rteInfo.fromDate.getTime()) || fromDate === rteInfo.fromDate) &&
                  ((rteInfo.toDate instanceof Date && toDate === rteInfo.toDate.getTime()) || toDate === rteInfo.toDate)) {
                routePolyline = feature.geometry as Polyline
              }
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
                rteInfo.selectedMeasure = round(minMeasure, networkInfo.measurePrecision)
                rteInfo.selectedToMeasure = rteInfo.toMeasure
              }

              // Set the selected from/to points when measures are hidden
              if (hideMeasures && routePolyline.paths.length > 0) {
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
        })

      if (twoRouteRecords) {
        const routeIdOrName = networkInfo.useRouteName ? rteInfo.toRouteName : rteInfo.toRouteId
        await queryRouteIdOrName(routeIdOrName.trim(), networkInfo, networkDS, false, true, '', rteInfo.toRouteFromDate)
          .then(async (results) => {
            if (isDefined(results)) {

              await Promise.all(results.features.map(feature => {
                toRoutePolyline = feature.geometry as Polyline
                return feature
              }))

              // get the endpoints of the route polyline
              if (isDefined(toRoutePolyline)) {
                const routeEndPoints = getRouteFromEndMeasures(toRoutePolyline)

                // query for the from and to measures for the route
                if (isDefined(routeEndPoints)) {
                  const measures = await QueryRouteMeasures(networkDS, networkInfo, routeEndPoints, rteInfo.toRouteFromDate, rteInfo.toRouteId)
                  const minMeasure = Math.min(...measures)
                  const maxMeasure = Math.max(...measures)

                  rteInfo.toRouteFromMeasure = round(minMeasure, networkInfo.measurePrecision)
                  rteInfo.toRouteToMeasure = round(maxMeasure, networkInfo.measurePrecision)
                }

                // Set the selected to point when measures are hidden
                if (hideMeasures && toRoutePolyline.paths.length > 0) {
                  const lastIdx = toRoutePolyline.paths[toRoutePolyline.paths.length - 1].length - 1
                  const lastPoint = toRoutePolyline.getPoint(toRoutePolyline.paths.length - 1, lastIdx)
                  rteInfo.selectedToPoint = lastPoint
                  rteInfo.selectedToMeasure = rteInfo.toRouteToMeasure
                }
              }
            }
          })
      }
    }

    rteInfo.selectedPolyline = isDefined(routePolyline) ? routePolyline : null
    rteInfo.selectedToPolyline = isDefined(routePolyline) ? routePolyline : null
    if (twoRouteRecords) {
      rteInfo.selectedToPolyline = isDefined(toRoutePolyline) ? toRoutePolyline : null
    }

    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedNetworkDataSource', networkDS)
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedRouteInfo', rteInfo)

    return true
  }
}

//get the whole app config
function getAppConfig () {
  return window.jimuConfig.isBuilder ? getAppStore().getState()?.appStateInBuilder?.appConfig : getAppStore().getState()?.appConfig
}
