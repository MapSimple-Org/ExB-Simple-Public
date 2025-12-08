import {
  type FeatureLayerDataSource,
  type FeatureLayerQueryParams,
  type DataRecord,
  DataRecordSetChangeMessage,
  RecordSetChangeType,
  MessageManager,
  type ImmutableObject,
  JimuFieldType,
  loadArcGISJSAPIModules,
  DataSourceStatus,
  SessionManager,
  type ImmutableArray
}
  from 'jimu-core'
import type { RouteAndMeasureQuery, GeometryToMeasureLocation, MeasureToGeometryResponse, ReferentQuery, CoordinateQuery, GeometryToMeasureResponse, ResultConfig } from '../../config'
import type { IFieldInfo } from '@esri/arcgis-rest-feature-service'
import { round } from 'lodash-es'
import { getPolylineMidPoint, ConvertUnits, isDefined, requestService, getDateWithTZOffset, type LrsLayer, derivedFields, measureFields, distanceField, toRouteField, stationField, networkObjectIdField, LrsLayerType, SpatialReferenceFrom, type DerivedInfo, SearchMeasuresType } from 'widgets/shared-code/lrs'
import type { JimuMapView } from 'jimu-arcgis'
import { getUniqueDates } from './utils'
import { DataSourceManager } from 'jimu-core'
/**
 * Finds the original record that was used to create the current record.
 * @param record The record created in search by route.
 * @param featureDS The original feature layer data source.
 * @param lrsLayer The current lrsLayer item.
 * @returns The original record.
 */
export async function getOriginalNetworkRecords (record: DataRecord, featureDS: FeatureLayerDataSource, lrsLayer: ImmutableObject<LrsLayer>, jimuMapView: JimuMapView): Promise<DataRecord> {
  const routeId = record.getFieldValue(lrsLayer.networkInfo.routeIdFieldSchema.name)
  const whereClause = `${lrsLayer.networkInfo.routeIdFieldSchema.name} = '${routeId}'`

  // If the layer of the input dataSource is available, use the featureQuery over query. This is because
  // of an issue where the query results in pbf format results in incorrect geometry if an output
  // spatial reference is not specified.
  if (isDefined(featureDS && isDefined(featureDS.layer))) {
    const query = featureDS.layer.createQuery()
    query.spatialRelationship = 'intersects'
    query.outSpatialReference = jimuMapView.view.spatialReference
    query.returnGeometry = true
    query.outFields = ['*']
    query.returnM = true
    query.returnZ = true
    query.where = whereClause

    const originalOid = record.getFieldValue(networkObjectIdField.value)
    return featureDS.layer.queryFeatures(query).then((results) => {
      if (results.features?.length > 0) {
        const records = results.features.map((feature) => {
          return featureDS.buildRecord(feature)
        })
        return records.find((result) => {
          return result.getId() === originalOid
        })
      }
      return null
    }).catch((e: any) => {
      return null
    })
  } else {
    const featureQuery: FeatureLayerQueryParams = ({
      returnGeometry: true,
      returnM: true,
      returnZ: true,
      where: whereClause,
      spatialRel: 'esriSpatialRelIntersects'
    })

    const originalOid = record.getFieldValue(networkObjectIdField.value)
    return featureDS.query(featureQuery).then((results) => {
      if (results.records?.length > 0) {
        return results.records.find((result) => {
          return result.getId() === originalOid
        })
      }
      return null
    }).catch((e: any) => {
      return null
    })
  }
}

export async function queryRoutes (
  originDS: FeatureLayerDataSource,
  lrsLayerConfig: ImmutableObject<LrsLayer>,
  routeQuery: RouteAndMeasureQuery,
  jimuMapView: JimuMapView
): Promise<DataRecord[]> {
  const dataRecords: DataRecord[] = []

  let whereClause = ''

  if (routeQuery?.lineName || routeQuery?.lineId) {
    if (routeQuery.lineName?.length > 0) {
      whereClause = `LOWER(${lrsLayerConfig.networkInfo.lineNameFieldSchema.jimuName}) LIKE LOWER('${routeQuery.lineName}')`
    } else if (routeQuery?.lineId?.length > 0) {
      whereClause = `LOWER(${lrsLayerConfig.networkInfo.lineIdFieldSchema.jimuName}) LIKE LOWER('${routeQuery.lineId}')`
    }
    if (routeQuery.routeId.length > 0) {
      whereClause += ` AND LOWER(${lrsLayerConfig.networkInfo.routeIdFieldSchema.jimuName}) LIKE LOWER('${routeQuery.routeId}')`
    } else if (routeQuery.routeName.length > 0) {
      whereClause += ` AND LOWER(${lrsLayerConfig.networkInfo.routeNameFieldSchema.jimuName}) LIKE LOWER('${routeQuery.routeName}')`
    } else {
      routeQuery.routeIdFields.forEach((item, index) => {
        if (item) {
          if (lrsLayerConfig.networkInfo.routeIdFields[index].field.type === JimuFieldType.Number) {
            if (whereClause.length > 0) {
              whereClause += ' AND '
            }
            whereClause += `${lrsLayerConfig.networkInfo.routeIdFields[index].field.name} LIKE ${routeQuery.routeIdFields[index]}`
          } else {
            if (item.length > 0) {
              if (whereClause.length > 0) {
                whereClause += ' AND '
              }
              whereClause += `LOWER(${lrsLayerConfig.networkInfo.routeIdFields[index].field.name}) LIKE LOWER('${routeQuery.routeIdFields[index]}')`
            }
          }
        }
      })
    }
  } else {
    if (routeQuery.routeId.length > 0) {
      whereClause = `LOWER(${lrsLayerConfig.networkInfo.routeIdFieldSchema.jimuName}) LIKE LOWER('${routeQuery.routeId}')`
    } else if (routeQuery.routeName.length > 0) {
      whereClause = `LOWER(${lrsLayerConfig.networkInfo.routeNameFieldSchema.jimuName}) LIKE LOWER('${routeQuery.routeName}')`
    } else {
      routeQuery.routeIdFields.forEach((item, index) => {
        if (item) {
          if (lrsLayerConfig.networkInfo.routeIdFields[index].field.type === JimuFieldType.Number) {
            if (whereClause.length > 0) {
              whereClause += ' AND '
            }
            whereClause += `${lrsLayerConfig.networkInfo.routeIdFields[index].field.name} LIKE ${routeQuery.routeIdFields[index]}`
          } else {
            if (item.length > 0) {
              if (whereClause.length > 0) {
                whereClause += ' AND '
              }
              whereClause += `LOWER(${lrsLayerConfig.networkInfo.routeIdFields[index].field.name}) LIKE LOWER('${routeQuery.routeIdFields[index]}')`
            }
          }
        }
      })
    }
  }
  // If the layer of the input dataSource is available, use the featureQuery over query. This is because
  // of an issue where the query results in pbf format results in incorrect geometry if an output
  // spatial reference is not specified.

  // if no measure, show all the routes (show single shape)
  // if measure, show routes with atleast equal to provided measure (single)
  // if measure, show routes with atleast equal to provided measure multiple times (multiple)
  // if measure, show routes with atleast equal to provided measure (single)

  if (isDefined(originDS && isDefined(originDS.layer))) {
    return await loadArcGISJSAPIModules(['esri/time/TimeExtent']).then(modules => {
      let TimeExtent: typeof __esri.TimeExtent = null
      TimeExtent = modules[0]

      const query = originDS.layer.createQuery()
      query.spatialRelationship = 'intersects'
      query.outSpatialReference = jimuMapView.view.spatialReference
      query.returnGeometry = true
      query.outFields = ['*']
      query.returnM = true
      query.returnZ = true
      query.where = whereClause
      query.orderByFields = []

      const sortOptions = lrsLayerConfig.networkInfo?.sortOptions?.filter(item => isDefined(item.jimuFieldName))
      if (sortOptions?.length > 0) {
        Object.assign(query.orderByFields, lrsLayerConfig.networkInfo.sortOptions.map(item => `${item.jimuFieldName} ${item.order}`))
      }

      const queryParams = originDS.getCurrentQueryParams()
      if (queryParams?.time) {
        query.timeExtent = new TimeExtent({ start: queryParams.time[0], end: queryParams.time[1] })
      }

      return originDS.layer.queryFeatures(query).then((results) => {
        if (results.features?.length > 0) {
          return results.features.map((feature) => {
            return originDS.buildRecord(feature)
          })
        }
        return dataRecords
      }).catch((e: any) => {
        return dataRecords
      })
    })
  } else {
    const queryParams = originDS.getCurrentQueryParams()
    const featureQuery: FeatureLayerQueryParams = ({
      returnGeometry: true,
      returnM: true,
      returnZ: true,
      where: whereClause,
      time: queryParams?.time,
      outFields: ['*'],
      notAddFieldsToClient: true
    })

    const sortOptions = lrsLayerConfig.networkInfo?.sortOptions?.filter(item => isDefined(item.jimuFieldName))
    if (sortOptions?.length > 0) {
      Object.assign(featureQuery, {
        orderByFields: lrsLayerConfig.networkInfo.sortOptions.map(item => `${item.jimuFieldName} ${item.order}`)
      })
    }

    return originDS.query(featureQuery).then((results) => {
      if (results.records?.length > 0) {
        return results.records
      }
      return dataRecords
    }).catch((e: any) => {
      return dataRecords
    })
  }
}

export async function queryRoutesByGeometry (
  originDS: FeatureLayerDataSource,
  lrsLayerConfig: ImmutableObject<LrsLayer>,
  query: CoordinateQuery
): Promise<DataRecord[]> {
  const dataRecords: DataRecord[] = []
  let featureQuery: FeatureLayerQueryParams

  let Point: typeof __esri.Point = null
  let SpatialReference: typeof __esri.SpatialReference = null
  await loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference']).then(modules => {
    [Point, SpatialReference] = modules
  }).then(() => {
    const point = new Point()
    point.x = query.xCoordinate
    point.y = query.yCoordinate

    if (query.zCoordinate) {
      point.z = query.zCoordinate
    } else {
      point.z = 0
    }

    if (lrsLayerConfig.networkInfo.defaultSpatialReferenceFrom === SpatialReferenceFrom.Map) {
      point.spatialReference = new SpatialReference({ wkid: 102100 })
    } else {
      point.spatialReference = new SpatialReference({ wkid: lrsLayerConfig.networkInfo.spatialReferenceInfo.wkid, wkt: lrsLayerConfig.networkInfo.spatialReferenceInfo.wkt })
    }

    let timeExtent = originDS.getTimeInfo()?.timeExtent ?? 0
    const queryParams = originDS.getCurrentQueryParams()
    if (queryParams?.time) {
      timeExtent = [queryParams.time[0], queryParams.time[1]]
    }

    featureQuery = ({
      returnGeometry: true,
      returnM: true,
      returnZ: true,
      geometry: (point as any).toJSON ? (point as any).toJSON() : point,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      time: timeExtent,
      outFields: ['*']
    })

    const sortOptions = lrsLayerConfig.networkInfo?.sortOptions?.filter(item => isDefined(item.jimuFieldName))
    if (sortOptions?.length > 0) {
      Object.assign(featureQuery, {
        orderByFields: lrsLayerConfig.networkInfo.sortOptions.map(item => `${item.jimuFieldName} ${item.order}`)
      })
    }
  })

  return originDS.query(featureQuery).then((results) => {
    if (results.records?.length > 0) {
      return results.records
    }
    return dataRecords
  }).catch((e: any) => {
    return dataRecords
  })
}

export async function queryRoutesByGeometryWithTolerance (
  originDS: FeatureLayerDataSource,
  lrsLayerConfig: ImmutableObject<LrsLayer>,
  query: CoordinateQuery
): Promise<DataRecord[]> {
  const dataRecords: DataRecord[] = []
  let featureQuery: FeatureLayerQueryParams

  let Point: typeof __esri.Point = null
  let SpatialReference: typeof __esri.SpatialReference = null
  await loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference']).then(modules => {
    [Point, SpatialReference] = modules
  }).then(() => {
    const point = new Point()
    point.x = query.xCoordinate
    point.y = query.yCoordinate

    if (query.zCoordinate) {
      point.z = query.zCoordinate
    } else {
      point.z = 0
    }

    if (lrsLayerConfig.networkInfo.defaultSpatialReferenceFrom === SpatialReferenceFrom.Map) {
      point.spatialReference = new SpatialReference({ wkid: 102100 })
    } else {
      point.spatialReference = new SpatialReference({ wkid: lrsLayerConfig.networkInfo.spatialReferenceInfo.wkid, wkt: lrsLayerConfig.networkInfo.spatialReferenceInfo.wkt })
    }

    let timeExtent = originDS.getTimeInfo()?.timeExtent ?? 0
    const queryParams = originDS.getCurrentQueryParams()
    if (queryParams?.time) {
      timeExtent = [queryParams.time[0], queryParams.time[1]]
    }
    const dataSource: any = originDS.getOriginDataSources()[0]

    // Get tolerance by converting search radius from lrsLayer's units of measure to XY units.
    const fromUnits = lrsLayerConfig.networkInfo.unitsOfMeasure
    let toUnits = 'esriMeters'
    if (dataSource?.layerDefinition?.hasGeometryProperties &&
      dataSource?.layerDefinition?.geometryProperties?.units) {
      toUnits = dataSource?.layerDefinition?.geometryProperties?.units // xy-tolerance units
    }
    const searchRadius = ConvertUnits(lrsLayerConfig.networkInfo.searchRadius, fromUnits, toUnits)
    featureQuery = ({
      returnGeometry: true,
      returnM: true,
      returnZ: true,
      geometry: (point as any).toJSON ? (point as any).toJSON() : point,
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      distance: searchRadius,
      units: 'esriSRUnit_Meter',
      time: timeExtent,
      outFields: [lrsLayerConfig.networkInfo.routeIdFieldName, lrsLayerConfig.networkInfo.fromDateFieldName],
      notAddFieldsToClient: true
    })

    const sortOptions = lrsLayerConfig.networkInfo?.sortOptions?.filter(item => isDefined(item.jimuFieldName))
    if (sortOptions?.length > 0) {
      Object.assign(featureQuery, {
        orderByFields: lrsLayerConfig.networkInfo.sortOptions.map(item => `${item.jimuFieldName} ${item.order}`)
      })
    }
  })

  return originDS.query(featureQuery).then((results) => {
    if (results.records?.length > 0) {
      return results.records
    }
    return dataRecords
  }).catch((e: any) => {
    return dataRecords
  })
}
// eslint-disable-next-line max-params
export async function queryRoutesByClosestResults (
  originDS: FeatureLayerDataSource,
  lrsLayerConfig: ImmutableObject<LrsLayer>,
  lrsLayerItems: ImmutableArray<LrsLayer>,
  outputDS: FeatureLayerDataSource,
  closestResults: any[],
  closestRouteIds: string[],
  resultWkid: number,
  widgetId: string,
  labelLayer?: __esri.FeatureLayer,
  jimuMapView?: JimuMapView
): Promise<{ newRecords: any[] }> {
  const originDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  const layerObject = await getLayerObject(originDs)
  const newDataRecords = []
  let TimeExtent: typeof __esri.TimeExtent = null
  let gdbVersion = originDS.getGDBVersion()
  if (!gdbVersion) {
    gdbVersion = ''
  }

  let whereClause = ''
  if (closestRouteIds.length > 0) {
    whereClause = lrsLayerConfig.networkInfo.routeIdFieldSchema.jimuName + ' IN (\'' + closestRouteIds.join('\',\'') + '\')'
  } else {
    return { newRecords: newDataRecords }
  }

  let timeExtent = originDS.getTimeInfo()?.timeExtent ?? 0
  const queryParams = originDS.getCurrentQueryParams()
  if (queryParams?.time) {
    timeExtent = [queryParams.time[0], queryParams.time[1]]
  }

  const featureQuery: FeatureLayerQueryParams = ({
    returnGeometry: true,
    returnM: true,
    returnZ: true,
    where: whereClause,
    time: timeExtent,
    outFields: ['*'],
    notAddFieldsToClient: true
  })

  const sortOptions = lrsLayerConfig.networkInfo?.sortOptions?.filter(item => isDefined(item.jimuFieldName))
  if (sortOptions?.length > 0) {
    Object.assign(featureQuery, {
      orderByFields: lrsLayerConfig.networkInfo.sortOptions.map(item => `${item.jimuFieldName} ${item.order}`)
    })
  }

  const lrsNetworkId = lrsLayerConfig.networkInfo.lrsNetworkId.toString()
  const derivedNetwork = lrsLayerItems.find(item => (item.networkInfo && lrsNetworkId === item.networkInfo.derivedFromNetworkId) && item.networkInfo.isDerived)
  const dsM = DataSourceManager.getInstance()
  const ds = isDefined(derivedNetwork) && dsM.getDataSource(derivedNetwork.useDataSource.dataSourceId)

  return originDS.query(featureQuery).then(async (results) => {
    if (results.records?.length > 0) {
      const routeRecords = results.records

      let Point: typeof __esri.Point = null
      let SpatialReference: typeof __esri.SpatialReference = null
      let Graphic: typeof __esri.Graphic = null
      await loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/Graphic', 'esri/time/TimeExtent']).then(modules => {
        [Point, SpatialReference, Graphic, TimeExtent] = modules
      }).then(async () => {
        await Promise.all(closestResults.map(async (result) => {
          const routeIndex = routeRecords.findIndex(d => d.getFieldValue(lrsLayerConfig.networkInfo.routeIdFieldSchema.jimuName) === result.routeId)
          if (routeIndex > -1) {
            const data = routeRecords[routeIndex].getData()
            const fromDate = routeRecords[routeIndex].getData()[lrsLayerConfig.networkInfo.fromDateFieldName]
            const toDate = routeRecords[routeIndex].getData()[lrsLayerConfig.networkInfo.toDateFieldName]
            const lineIdFieldName = lrsLayerConfig.networkInfo.lineIdFieldName
            let spatialRef
            if (lrsLayerConfig.networkInfo.spatialReferenceInfo.wkid) {
              spatialRef = new SpatialReference({ wkid: lrsLayerConfig.networkInfo.spatialReferenceInfo.wkid })
            } else if (lrsLayerConfig.networkInfo.spatialReferenceInfo.wkt) {
              spatialRef = new SpatialReference({ wkt: lrsLayerConfig.networkInfo.spatialReferenceInfo.wkt })
            }

            if (isDefined(derivedNetwork)) {
              const geometry = new Point(result.geometry)
              geometry.spatialReference = spatialRef
              const derived = await getDerivedRouteDetails(geometry, ds, fromDate, toDate, TimeExtent, routeRecords[routeIndex], derivedNetwork, gdbVersion, lineIdFieldName)
              if (derived) {
                data[derivedFields.at(0).value] = derived.routeName
                data[derivedFields.at(1).value] = derived.routeId
                data[derivedFields.at(2).value] = round(derived.measure, lrsLayerConfig.networkInfo.measurePrecision)
              }
            }

            data[measureFields.at(0).value] = round(result.measure, lrsLayerConfig.networkInfo.measurePrecision)
            data[distanceField.value] = round(result.distance, lrsLayerConfig.networkInfo.measurePrecision)
            data[networkObjectIdField.value] = routeRecords[routeIndex].getId()

            // Convert dates to time set it experience.
            const fromDt = data[lrsLayerConfig.networkInfo.fromDateFieldName]
            const toDt = data[lrsLayerConfig.networkInfo.toDateFieldName]
            if (toDt) {
              data[lrsLayerConfig.networkInfo.toDateFieldName] = getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0])?.valueOf()
            }
            if (fromDt) {
              data[lrsLayerConfig.networkInfo.fromDateFieldName] = getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0])?.valueOf()
            }

            const geometry = new Point(result.geometry)
            geometry.spatialReference = spatialRef
            const feature = new Graphic({
              geometry: geometry,
              attributes: data
            })

            if (isDefined(labelLayer)) {
              labelLayer.applyEdits({
                addFeatures: [feature.clone()]
              })
            }
            const dataRecord = outputDS.buildRecord(feature)
            newDataRecords.push(dataRecord)
          }
        })
        )
      })

      newDataRecords.forEach((record) => {
        const feature = (record).feature
        feature.sourceLayer = (layerObject as any).associatedLayer || layerObject
        feature.layer = feature.sourceLayer
      })
      outputDS.setSourceRecords(newDataRecords)
      outputDS.setStatus(DataSourceStatus.Unloaded)
      outputDS.setCountStatus(DataSourceStatus.Unloaded)
      publishMessage(outputDS, widgetId)
      return { newRecords: newDataRecords }
    }
    return { newRecords: newDataRecords }
  }).catch((e: any) => {
    return { newRecords: newDataRecords }
  })
}

export async function executeGeometryToMeasureWithTolerance (
  routeRecord: DataRecord,
  outputDS: FeatureLayerDataSource,
  lrsLayerItem: ImmutableObject<LrsLayer>,
  routeQuery: CoordinateQuery
): Promise<{ resultLocations: GeometryToMeasureLocation[], resultWkid: number }> {
  const dataSource: any = outputDS.getOriginDataSources()[0]
  const originDs: FeatureLayerDataSource = dataSource as FeatureLayerDataSource
  let gdbVersion = originDs.getGDBVersion()
  if (!gdbVersion) {
    gdbVersion = ''
  }
  // Get tolerance by converting search radius from lrsLayer's units of measure to XY units.
  const fromUnits = lrsLayerItem.networkInfo.unitsOfMeasure
  let toUnits = lrsLayerItem.networkInfo.unitsOfMeasure
  if (dataSource?.layerDefinition?.hasGeometryProperties &&
    dataSource?.layerDefinition?.geometryProperties?.units) {
    toUnits = dataSource?.layerDefinition?.geometryProperties?.units // xy-tolerance units
  }
  const searchRadius = ConvertUnits(lrsLayerItem.networkInfo.searchRadius, fromUnits, toUnits)

  // Extract the route ids from the records and populate the REST request.
  const locations = []
  let Point: typeof __esri.Point = null
  let SpatialReference: typeof __esri.SpatialReference = null
  await loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference']).then(modules => {
    [Point, SpatialReference] = modules
  }).then(() => {
    const point = new Point()
    point.x = routeQuery.xCoordinate
    point.y = routeQuery.yCoordinate

    if (routeQuery.zCoordinate) {
      point.z = routeQuery.zCoordinate
    } else {
      point.z = 0
    }
    if (lrsLayerItem.networkInfo.defaultSpatialReferenceFrom === SpatialReferenceFrom.Map) {
      point.spatialReference = new SpatialReference({ wkid: 102100 })
    } else {
      point.spatialReference = new SpatialReference({ wkid: lrsLayerItem.networkInfo.spatialReferenceInfo.wkid, wkt: lrsLayerItem.networkInfo.spatialReferenceInfo.wkt })
    }
    locations.push({
      routeId: routeRecord.getFieldValue(lrsLayerItem.networkInfo.routeIdFieldName),
      geometry: (point as any).toJSON ? (point as any).toJSON() : point
    })
  })

  const url = lrsLayerItem.networkInfo.networkUrl
  const token = await SessionManager.getInstance().getSessionByUrl(url).getToken(url)

  const params = {
    f: 'json',
    token: token,
    locations: locations,
    inSR: (lrsLayerItem.networkInfo.defaultSpatialReferenceFrom === SpatialReferenceFrom.Map) ? 102100 : null,
    gdbVersion: gdbVersion,
    tolerance: searchRadius,
    temporalViewDate: routeRecord.getFieldValue(lrsLayerItem.networkInfo.fromDateFieldName)
  }

  // Get LRS server endpoint.
  const REST = `${url}/geometryToMeasure`

  // Perform measure to geometry REST request.
  return requestService({ method: 'POST', url: REST, params: params })

    .then((results: GeometryToMeasureResponse) => {
      if (!results || !results.locations) {
        return { resultLocations: [], resultWkid: NaN }
      }
      return { resultLocations: results.locations, resultWkid: results.spatialReference.wkid }
    })
}
// eslint-disable-next-line max-params
export async function executeGeometryToMeasure (
  widgetId: string,
  outputDS: FeatureLayerDataSource,
  lrsLayerItem: ImmutableObject<LrsLayer>,
  routeRecords: DataRecord[],
  routeQuery: CoordinateQuery,
  labelLayer?: __esri.FeatureLayer,
  lrsLayerItems?: ImmutableArray<LrsLayer>,
  jimuMapView?: JimuMapView
): Promise<DataRecord[]> {
  // Get LRS server endpoint.
  const url = lrsLayerItem.networkInfo.networkUrl
  const REST = `${url}/geometryToMeasure`
  const token = await SessionManager.getInstance().getSessionByUrl(url).getToken(url)

  // Extract the route ids from the records and populate the REST request.
  const routeIds: string[] = []
  const location = []
  let Point: typeof __esri.Point = null
  await loadArcGISJSAPIModules(['esri/geometry/Point']).then(modules => {
    [Point] = modules
  }).then(() => {
    const point = new Point()
    point.x = routeQuery.xCoordinate
    point.y = routeQuery.yCoordinate

    if (routeQuery.zCoordinate) {
      point.z = routeQuery.zCoordinate
    } else {
      point.z = 0
    }

    routeRecords.forEach((record) => {
      const routeId = record.getFieldValue(lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName)
      routeIds.push(routeId)
      location.push({
        routeId: routeId,
        geometry: (point as any).toJSON ? (point as any).toJSON() : point
      })
    })
  })

  const originDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  const layerObject = await getLayerObject(originDs)
  let gdbVersion = originDs.getGDBVersion()
  if (!gdbVersion) {
    gdbVersion = ''
  }

  const queryParams = originDs.getCurrentQueryParams()
  let tvd = null
  if (queryParams?.time) {
    tvd = queryParams?.time[0]
  }

  const params = {
    f: 'json',
    token: token,
    locations: location,
    inSR: (lrsLayerItem.networkInfo.defaultSpatialReferenceFrom === SpatialReferenceFrom.Map) ? 102100 : null,
    gdbVersion: gdbVersion,
    temporalViewDate: !isDefined(tvd) || tvd.valueOf() === 0 ? '' : tvd
  }

  // Perform measure to geometry REST request.
  const newDataRecords = []
  return requestService({ method: 'POST', url: REST, params: params })
    .then(async (results: GeometryToMeasureResponse) => {
      if (!results || !results.locations) {
        return newDataRecords
      }

      let Point: typeof __esri.Point = null
      let SpatialReference: typeof __esri.SpatialReference = null
      let Graphic: typeof __esri.Graphic = null
      let TimeExtent: typeof __esri.TimeExtent = null

      await loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/Graphic', 'esri/time/TimeExtent']).then(modules => {
        [Point, SpatialReference, Graphic, TimeExtent] = modules
      }).then(async () => {
        const point = new Point()
        point.x = routeQuery.xCoordinate
        point.y = routeQuery.yCoordinate

        if (routeQuery.zCoordinate) {
          point.z = routeQuery.zCoordinate
        } else {
          point.z = 0
        }

        const lrsNetworkId = lrsLayerItem.networkInfo.lrsNetworkId.toString()
        const derivedNetwork = lrsLayerItems.find(item => (item.networkInfo && lrsNetworkId === item.networkInfo.derivedFromNetworkId) && item.networkInfo.isDerived)
        const dsM = DataSourceManager.getInstance()
        const ds = isDefined(derivedNetwork) && dsM.getDataSource(derivedNetwork.useDataSource.dataSourceId)

        await Promise.all(results.locations.map(async (location, index) => {
          if (location) {
            await Promise.all(location.results.map(async (result, index) => {
              if (result) {
                const routeIndex = routeRecords.findIndex(d => d.getFieldValue(lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName) === result.routeId)
                const fromDate = routeRecords[routeIndex].getData()[lrsLayerItem.networkInfo.fromDateFieldName]
                const toDate = routeRecords[routeIndex].getData()[lrsLayerItem.networkInfo.toDateFieldName]
                const data = routeRecords[routeIndex].getData()
                const lineIdFieldName = lrsLayerItem.networkInfo.lineIdFieldName
                data[measureFields.at(0).value] = round(result.measure, lrsLayerItem.networkInfo.measurePrecision)
                data[distanceField.value] = round(result.distance, lrsLayerItem.networkInfo.measurePrecision)
                data[networkObjectIdField.value] = routeRecords[routeIndex].getId()

                if (isDefined(derivedNetwork)) {
                  let spatialReference
                  if (results.spatialReference.wkid) {
                    spatialReference = new SpatialReference({ wkid: results.spatialReference.wkid })
                  } else if (results.spatialReference.wkt) {
                    spatialReference = new SpatialReference({ wkt: results.spatialReference.wkt })
                  }
                  const geometry = new Point(result.geometry)
                  geometry.spatialReference = spatialReference
                  const derived = await getDerivedRouteDetails(geometry, ds, fromDate, toDate, TimeExtent, routeRecords[routeIndex], derivedNetwork, gdbVersion, lineIdFieldName)
                  if (derived) {
                    data[derivedFields.at(0).value] = derived.routeName
                    data[derivedFields.at(1).value] = derived.routeId
                    data[derivedFields.at(2).value] = round(derived.measure, lrsLayerItem.networkInfo.measurePrecision)
                  }
                }

                // Convert dates to time set it experience.
                const fromDt = data[lrsLayerItem.networkInfo.fromDateFieldName]
                const toDt = data[lrsLayerItem.networkInfo.toDateFieldName]
                if (toDt) {
                  data[lrsLayerItem.networkInfo.toDateFieldName] = getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0])?.valueOf()
                }
                if (fromDt) {
                  data[lrsLayerItem.networkInfo.fromDateFieldName] = getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0])?.valueOf()
                }

                let spatialReference
                if (results.spatialReference.wkid) {
                  spatialReference = new SpatialReference({ wkid: results.spatialReference.wkid })
                } else if (results.spatialReference.wkt) {
                  spatialReference = new SpatialReference({ wkt: results.spatialReference.wkt })
                }
                const geometry = new Point(result.geometry)
                geometry.spatialReference = spatialReference
                const feature = new Graphic({
                  geometry: geometry,
                  attributes: data
                })

                if (isDefined(labelLayer)) {
                  labelLayer.applyEdits({
                    addFeatures: [feature.clone()]
                  })
                }

                const dataRecord = outputDS.buildRecord(feature)
                newDataRecords.push(dataRecord)
              }
            })
            )
          }
        })
        )
        newDataRecords.forEach((record) => {
          const feature = (record).feature
          feature.sourceLayer = (layerObject as any).associatedLayer || layerObject
          feature.layer = feature.sourceLayer
        })

        outputDS.setSourceRecords(newDataRecords)
        outputDS.setStatus(DataSourceStatus.Unloaded)
        outputDS.setCountStatus(DataSourceStatus.Unloaded)
        publishMessage(outputDS, widgetId)
      })

      return newDataRecords
    })
}

export async function executeGeometryToMeasureDerived (
  locations: ReferentQuery,
  lrsLayerItem: ImmutableObject<LrsLayer>,
  gdbVersion: string,
  wkid: number,
  temporalViewDate?: number
) {
  const url = lrsLayerItem.networkInfo.networkUrl
  const token = await SessionManager.getInstance().getSessionByUrl(url).getToken(url)
  const params = {
    f: 'json',
    token: token,
    locations: locations,
    inSR: wkid,
    gdbVersion: gdbVersion,
    temporalViewDate: !isDefined(temporalViewDate) || temporalViewDate.valueOf() === 0 ? '' : temporalViewDate
  }

  if (gdbVersion) params.gdbVersion = gdbVersion
  if (temporalViewDate) params.temporalViewDate = temporalViewDate

  const REST = `${url}/geometryToMeasure`
  const response = await requestService({ method: 'POST', url: REST, params: params })
  return response
}
// eslint-disable-next-line max-params
export async function getDerivedRouteDetails (geometry, ds, fromDt, toDt, TimeExtent, record, lrsLayerItem, gdbVersion, lineIdFieldName?): Promise<DerivedInfo> {
  return new Promise((resolve, reject) => {
    try {
      const routeIdFieldName = lrsLayerItem.routeIdFieldName
      const routeNameFieldName = lrsLayerItem.routeNameFieldName
      const routeFromDateFieldName = lrsLayerItem.fromDateFieldName
      const routeIdName = []
      if (!ds || !ds.layer) {
        resolve(null)
        return
      }
      const query = ds.layer.createQuery()
      query.geometry = geometry
      query.units = 'meters'
      query.spatialRelationship = 'intersects'
      query.outFields = [routeIdFieldName, routeNameFieldName, routeFromDateFieldName]
      query.timeExtent = new TimeExtent({ start: fromDt, end: toDt })
      let lastFromDate = 0
      ds.layer.queryFeatures(query).then(async (derivedRoutes) => {
        const routeIds = []
        const locations = []
        derivedRoutes.features.forEach((result) => {
          const routeId = result.attributes[routeIdFieldName]
          const routeName = result.attributes[routeNameFieldName]
          const lineIdRecord = record.getData()[lineIdFieldName]
          const fromDate = result.attributes[routeFromDateFieldName]
          if (!routeIds.includes(routeId) && (lineIdRecord === routeId)) {
            if (fromDate > lastFromDate) {
              lastFromDate = fromDate
            }
            routeIdName[routeId] = routeName
            routeIds.push(routeId)
            locations.push({
              routeId: routeId,
              geometry: geometry
            })
          }
        })
        const wkid = geometry.spatialReference.wkid
        if (!locations || locations.length === 0) {
          resolve(null)
          return
        }
        //@ts-expect-error
        const result = await executeGeometryToMeasureDerived(locations, lrsLayerItem, gdbVersion, wkid, lastFromDate)
        const locationsRes = result.locations
        if (!locationsRes || locationsRes.length === 0) resolve(null)
        locationsRes.forEach((location) => {
          const status = location.status
          if (status === 'esriLocatingOK' || status === 'esriLocatingMultipleLocation') {
            const results = location.results
            results.forEach((result) => {
              const derivedRouteInfo = {
                routeId: result.routeId,
                routeName: routeIdName[result.routeId],
                measure: result.measure
              }
              resolve(derivedRouteInfo)
              return derivedRouteInfo
            })
          }
        })
        resolve(null)
      })
    } catch (error) {
      console.error(error)
    }
  })
}

export async function executeReferentToGeometryQuery (
  locations: ReferentQuery,
  lrsLayerItem: ImmutableObject<LrsLayer>,
  offsetUnit: string,
  gdbVersion: string,
  temporalViewDate?: number
) {
  const url = lrsLayerItem.networkInfo.networkUrl
  const token = await SessionManager.getInstance().getSessionByUrl(url).getToken(url)
  const params = {
    f: 'json',
    token: token,
    locations: locations,
    offsetUnit: offsetUnit
  }
  //@ts-expect-error
  if (gdbVersion) params.gdbVersion = gdbVersion
  //@ts-expect-error
  if (temporalViewDate) params.temporalViewDate = temporalViewDate
  const REST = `${url}/referentToGeometry`

  const response = await requestService({ method: 'POST', url: REST, params: params })
  return response
}

export function isEqual (obj1, obj2) {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  return keys1.every(key => obj1[key] === obj2[key])
}
// eslint-disable-next-line max-params
export async function executeReferentToGeometry (
  widgetId: string,
  originDS: FeatureLayerDataSource,
  locations: ReferentQuery,
  lrsLayerItem: ImmutableObject<LrsLayer>,
  referentItem: ImmutableObject<LrsLayer>,
  outputDS: FeatureLayerDataSource,
  count: number,
  objectIdFromDt: any[],
  lrsLayerItems: ImmutableArray<LrsLayer>,
  resultConfig: ImmutableObject<ResultConfig>,
  labelLayer?: __esri.FeatureLayer,
  jimuMapView?: JimuMapView,
): Promise<DataRecord[]> {
  const routeIds = []
  const finalDataRecords = []
  const offsetUnit = resultConfig?.defaultOffsetUnit
  const lineIdFieldName = lrsLayerItem.networkInfo.lineIdFieldName
  let index = 0

  let Point: typeof __esri.Point = null
  let SpatialReference: typeof __esri.SpatialReference = null
  let Graphic: typeof __esri.Graphic = null
  let TimeExtent: typeof __esri.TimeExtent = null
  let gdbVersion = originDS.getGDBVersion()
  if (!gdbVersion) {
    gdbVersion = ''
  }

  await loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/Graphic', 'esri/time/TimeExtent'])
    .then(modules => {
      [Point, SpatialReference, Graphic, TimeExtent] = modules
    })

  const response = await executeReferentToGeometryQuery(locations, lrsLayerItem, offsetUnit, gdbVersion, null)
  if (!response || !response?.locations || response?.locations.length === 0) return []

  response.locations.forEach(item => {
    const results = item.results
    if (item?.status === 'esriLocatingMultipleLocation') {
      results.forEach(result => {
        const routeId = result.routeId
        if (!routeIds.includes(routeId)) routeIds.push(routeId)
      })
    } else if (item?.status === 'esriLocatingOK') {
      const result = item.results[0]
      const routeId = result.routeId
      if (!routeIds.includes(routeId)) routeIds.push(routeId)
    }
  })

  if (!routeIds || routeIds.length === 0) return []

  const buildRecord = (data, geometry) => {
    const feature = new Graphic({
      geometry: geometry,
      attributes: data
    })
    const newRecord = outputDS.buildRecord(feature)
    finalDataRecords.push(newRecord)
    count++
  }

  const createDataRecords = async (locationItem, record: DataRecord, uniqueLocations) => {
    const layerDefinition = originDS.getLayerDefinition()
    const results = locationItem?.results
    const spatialReference = new SpatialReference({ wkid: response.spatialReference.wkid, wkt: response.spatialReference.wkt })
    const lrsNetworkId = lrsLayerItem.networkInfo.lrsNetworkId.toString()
    const derivedNetwork = lrsLayerItems.find(item => (item.networkInfo && lrsNetworkId === item.networkInfo.derivedFromNetworkId) && item.networkInfo.isDerived)
    const dsM = DataSourceManager.getInstance()
    const ds = isDefined(derivedNetwork) && dsM.getDataSource(derivedNetwork.useDataSource.dataSourceId)
    const fromDate = record.getData()[lrsLayerItem.networkInfo.fromDateFieldName]
    const toDate = record.getData()[lrsLayerItem.networkInfo.toDateFieldName]

    if (locationItem?.status === 'esriLocatingMultipleLocation') {
      for (const result of results) {
        const data = record?.getData()
        if (!data) return

        if (result?.routeId !== data[lrsLayerItem.networkInfo.routeIdFieldName]) {
          // do not push
        } else {
          uniqueLocations.push(result)
          let measure = result?.measure
          let geometry = null
          if (result?.geometryType === 'esriGeometryPoint') {
            geometry = new Point(result.geometry)
            geometry.spatialReference = response.spatialReference
          }
          if (isDefined(derivedNetwork)) {
            const derived = await getDerivedRouteDetails(geometry, ds, fromDate, toDate, TimeExtent, record, derivedNetwork, gdbVersion, lineIdFieldName)
            if (derived) {
              data[derivedFields.at(0).value] = derived.routeName
              data[derivedFields.at(1).value] = derived.routeId
              data[derivedFields.at(2).value] = round(derived.measure, lrsLayerItem.networkInfo.measurePrecision)
            }
          }
          if (measure < 0) measure = 0
          else measure = round(measure, lrsLayerItem.networkInfo.measurePrecision)
          data[measureFields.at(0).value] = measure
          data[layerDefinition.objectIdField] = count
          data[networkObjectIdField.value] = record.getId()

          const fromDt = data[lrsLayerItem.networkInfo.fromDateFieldName]
          const toDt = data[lrsLayerItem.networkInfo.toDateFieldName]

          if (fromDt || toDt) {
            const fromDate = isDefined(fromDt) ? getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0])?.valueOf() : null
            const toDate = isDefined(toDt) ? getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0])?.valueOf() : null
            data[lrsLayerItem.networkInfo.fromDateFieldName] = fromDate
            data[lrsLayerItem.networkInfo.toDateFieldName] = toDate

            if (isDefined(labelLayer)) {
              const feature = new Graphic({
                geometry: geometry,
                attributes: data
              })

              await labelLayer.applyEdits({
                addFeatures: [feature.clone()]
              })
            }
            buildRecord(data, geometry)
          } else {
            if (isDefined(labelLayer)) {
              const feature = new Graphic({
                geometry: geometry,
                attributes: data
              })

              await labelLayer.applyEdits({
                addFeatures: [feature.clone()]
              })
            }
            buildRecord(data, geometry)
          }
        }
      }
    } else if (locationItem?.status === 'esriLocatingOK') {
      const result = locationItem.results[0]

      let measure = result.measure
      const data = record.getData()
      let geometry = null

      const includesObject = uniqueLocations.some(obj => JSON.stringify(obj) === JSON.stringify(result))
      if (!includesObject && result?.routeId === data[lrsLayerItem.networkInfo.routeIdFieldName]) {
        uniqueLocations.push(result)
        if (result.geometryType === 'esriGeometryPoint') {
          geometry = new Point(result.geometry)
          geometry.spatialReference = spatialReference
        }

        if (isDefined(derivedNetwork)) {
          const derived = await getDerivedRouteDetails(geometry, ds, fromDate, toDate, TimeExtent, record, derivedNetwork, gdbVersion, lineIdFieldName)
          if (derived) {
            data[derivedFields.at(0).value] = derived.routeName
            data[derivedFields.at(1).value] = derived.routeId
            data[derivedFields.at(2).value] = round(derived.measure, lrsLayerItem.networkInfo.measurePrecision)
          }
        }

        if (measure < 0) measure = 0
        else measure = round(measure, lrsLayerItem.networkInfo.measurePrecision)
        data[measureFields.at(0).value] = measure
        data[layerDefinition.objectIdField] = count
        data[networkObjectIdField.value] = record.getId()

        const fromDt = data[lrsLayerItem.networkInfo.fromDateFieldName]
        const toDt = data[lrsLayerItem.networkInfo.toDateFieldName]

        if (fromDt || toDt) {
          const fromDate = isDefined(fromDt) ? getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0])?.valueOf() : null
          const toDate = isDefined(toDt) ? getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0])?.valueOf() : null
          data[lrsLayerItem.networkInfo.fromDateFieldName] = fromDate
          data[lrsLayerItem.networkInfo.toDateFieldName] = toDate

          if (isDefined(labelLayer)) {
            const feature = new Graphic({
              geometry: geometry,
              attributes: data
            })

            await labelLayer.applyEdits({
              addFeatures: [feature.clone()]
            })
          }
          buildRecord(data, geometry)
        } else {
          if (isDefined(labelLayer)) {
            const feature = new Graphic({
              geometry: geometry,
              attributes: data
            })

            await labelLayer.applyEdits({
              addFeatures: [feature.clone()]
            })
          }
          buildRecord(data, geometry)
        }
      }
    }
  }

  const queryRoutes = async () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const routeIdFieldName = lrsLayerItem.networkInfo?.routeIdFieldName
      const promises = []
      const records = []
      let whereClause = ''
      if (routeIds.length > 0) {
        whereClause = routeIdFieldName + ' IN (\'' + routeIds.join('\',\'') + '\')'
      }
      const featureQuery: FeatureLayerQueryParams = ({
        where: whereClause,
        outFields: ['*']
      })
      const results = await originDS.query(featureQuery)
      if (results?.records?.length === 0) return []
      results.records.forEach(record => {
        records.push(record)
        const recordFromDt = record.getData()[referentItem?.eventInfo?.fromDateFieldName]
        //@ts-expect-error
        locations?.forEach(location => {
          const objectId = location.objectId
          let fromDate = objectIdFromDt[objectId]
          if (referentItem?.layerType !== LrsLayerType.Event) fromDate = recordFromDt
          promises.push(executeReferentToGeometryQuery(locations, lrsLayerItem, offsetUnit, gdbVersion, fromDate))
        })
      })
      const response = await Promise.all(promises)

      const uniqueLocations = []
      await Promise.all(response.map(async (response, index) => {
        const locationItems = response?.locations
        if (locationItems?.length > 0) {
          const record = records[index]
          for (const location of locationItems) {
            await createDataRecords(location, record, uniqueLocations)
          }
        }
      }))
      resolve('finish')
    })
  }

  await queryRoutes()
  outputDS.setSourceRecords(finalDataRecords)
  outputDS.setStatus(DataSourceStatus.Unloaded)
  outputDS.setCountStatus(DataSourceStatus.Unloaded)
  publishMessage(outputDS, widgetId)
  const layerObject = await getLayerObject(originDS)
  const layerDefinition = originDS.getLayerDefinition()
  finalDataRecords.forEach(record => {
    const feature = (record).feature
    feature.attributes[layerDefinition.objectIdField] = index++
    feature.sourceLayer = (layerObject as any).associatedLayer || layerObject
    feature.layer = feature.sourceLayer
  })
  return finalDataRecords
}
// eslint-disable-next-line max-params
export async function executeMeasureToGeometryLine (
  widgetId: string,
  outputDS: FeatureLayerDataSource,
  lrsLayerItem: ImmutableObject<LrsLayer>,
  lrsLayerItems: ImmutableArray<LrsLayer>,
  routeRecords: any,
  query: RouteAndMeasureQuery,
  labelLayer?: __esri.FeatureLayer,
  jimuMapView?: JimuMapView,
  timeExtent?: any,
  Point?: any
): Promise<DataRecord[]> {
  const lrsNetworkId = lrsLayerItem.networkInfo.lrsNetworkId.toString()
  const derivedNetwork = lrsLayerItems.find(item => (item.networkInfo && lrsNetworkId === item.networkInfo.derivedFromNetworkId) && item.networkInfo.isDerived)
  const dsM = DataSourceManager.getInstance()
  const ds = isDefined(derivedNetwork) && dsM.getDataSource(derivedNetwork.useDataSource.dataSourceId)

  const originDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  const layerObject = await getLayerObject(originDs)
  let gdbVersion = originDs.getGDBVersion()
  if (!gdbVersion) {
    gdbVersion = ''
  }

  if (!query.isMeasureToGeometryOperation) {
    return updateRouteMeasures(widgetId, lrsLayerItem, routeRecords, outputDS, lrsLayerItem.networkInfo.measurePrecision, labelLayer, jimuMapView,
      timeExtent, derivedNetwork, ds as FeatureLayerDataSource, gdbVersion, Point)
  }

  // Get LRS server endpoint.
  const url = lrsLayerItem.networkInfo.networkUrl
  const REST = `${url}/measureToGeometry`
  const token = await SessionManager.getInstance().getSessionByUrl(url).getToken(url)

  const times: Date[] = []
  // sort records on line order
  routeRecords = routeRecords.sort((a, b) => a.getData()[lrsLayerItem.networkInfo.lineOrderFieldName] - b.getData()[lrsLayerItem.networkInfo.lineOrderFieldName])
  for (const record of routeRecords) {
    const fromDateEpoch = record.getData()[lrsLayerItem.networkInfo.fromDateFieldName]
    const fromDate = isDefined(fromDateEpoch) ? new Date(fromDateEpoch) : new Date(0)
    times.push(fromDate)
  }

  const intervals = getUniqueDates(times)
  let index = 0
  const newDataRecords = []
  const routeIdNameDict = []
  const routeIdDate = []
  const partialMatches = []
  const finalMatches = []
  const spanningRoutes = []

  await Promise.all(intervals.map(async (interval) => {
  // Extract the route ids from the records and populate the REST request.
    const routeIds: string[] = []
    const location = []

    if (query.searchMeasureBy === SearchMeasuresType.Range) {
      const inputs = routeRecords
      const uniqueRouteIds = []
      for (let i = 0; i < inputs.length; i++) {
        const fromDateEpoch = inputs[i].getData()[lrsLayerItem.networkInfo.fromDateFieldName]
        const fromDate = isDefined(fromDateEpoch) ? new Date(fromDateEpoch) : new Date(0)
        const toDateEpoch = inputs[i].getData()[lrsLayerItem.networkInfo.toDateFieldName]
        const toDate = isDefined(toDateEpoch) ? new Date(toDateEpoch) : new Date(8640000000000000)
        if ((fromDate.valueOf() <= interval.valueOf()) && (interval.valueOf() <= toDate.valueOf())) {
          const routeId = inputs[i].getFieldValue(lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName)
          routeIds.push(routeId)
          for (let j = i; j < inputs.length; j++) {
            const fromDateEpochJ = inputs[j].getData()[lrsLayerItem.networkInfo.fromDateFieldName]
            const fromDateJ = isDefined(fromDateEpochJ) ? new Date(fromDateEpochJ) : new Date(0)
            const toDateEpochJ = inputs[j].getData()[lrsLayerItem.networkInfo.toDateFieldName]
            const toDateJ = isDefined(toDateEpochJ) ? new Date(toDateEpochJ) : new Date(8640000000000000)

            if ((fromDateJ.valueOf() <= interval.valueOf()) && (interval.valueOf() <= toDateJ.valueOf())) {
              const fromRoute = inputs[i]?.feature?.attributes
              const toRoute = inputs[j]?.feature?.attributes
              if (!routeIdNameDict[toRoute[lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName]]) {
                const routeId = toRoute[lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName]
                routeIdNameDict[routeId] = toRoute
              }
              if (isNaN(query.toMeasure)) {
                if (!uniqueRouteIds.includes(fromRoute[lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName])) {
                  uniqueRouteIds.push(fromRoute[lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName])
                  location.push({
                    routeId: fromRoute[lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName],
                    measure: round(query.fromMeasure, lrsLayerItem.networkInfo.measurePrecision)
                  })
                }
              } else {
                location.push({
                  routeId: fromRoute[lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName],
                  toRouteId: toRoute[lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName],
                  fromMeasure: round(query.fromMeasure, lrsLayerItem.networkInfo.measurePrecision),
                  toMeasure: round(query.toMeasure, lrsLayerItem.networkInfo.measurePrecision)
                })
              }
            }
          }
        }
      }
    } else {
      routeRecords.forEach((record) => {
        const fromDateEpoch = record.getData()[lrsLayerItem.networkInfo.fromDateFieldName]
        const fromDate = isDefined(fromDateEpoch) ? new Date(fromDateEpoch) : new Date(0)

        if (interval.valueOf() === fromDate.valueOf()) {
          const routeId = record.getFieldValue(lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName)
          routeIds.push(routeId)
          if (query.searchMeasureBy === SearchMeasuresType.Single) {
            location.push({
              routeId: routeId,
              measure: round(query.measure, lrsLayerItem.networkInfo.measurePrecision),
              station: query.station
            })
          } else if (query.searchMeasureBy === SearchMeasuresType.Multiple) {
            query.measures.forEach((m, index) => {
              location.push({
                routeId: routeId,
                measure: round(m, lrsLayerItem.networkInfo.measurePrecision),
                station: query.stations.at(index)
              })
            })
          } else {
            if (isNaN(query.toMeasure)) {
              location.push({
                routeId: routeId,
                measure: round(query.fromMeasure, lrsLayerItem.networkInfo.measurePrecision),
                station: query.fromStation
              })
            } else {
              location.push({
                routeId: routeId,
                fromMeasure: round(query.fromMeasure, lrsLayerItem.networkInfo.measurePrecision),
                toMeasure: round(query.toMeasure, lrsLayerItem.networkInfo.measurePrecision),
                fromStation: query.fromStation,
                toStation: query.toStation
              })
            }
          }
        }
      })
    }

    const params = {
      f: 'json',
      token: token,
      locations: location,
      gdbVersion: gdbVersion,
      temporalViewDate: !isDefined(interval) || interval.valueOf() === 0 ? '' : interval
    }

    // Perform measure to geometry REST request.
    await requestService({ method: 'POST', url: REST, params: params })
      .then(async (results: MeasureToGeometryResponse) => {
        if (!results || !results.locations) {
          return newDataRecords
        }
        let Point: typeof __esri.Point = null
        let Polyline: typeof __esri.Polyline = null
        let SpatialReference: typeof __esri.SpatialReference = null
        let Graphic: typeof __esri.Graphic = null
        let TimeExtent: typeof __esri.TimeExtent = null
        await loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/Polyline', 'esri/geometry/SpatialReference', 'esri/Graphic', 'esri/time/TimeExtent']).then(modules => {
          [Point, Polyline, SpatialReference, Graphic, TimeExtent] = modules
        }).then(async () => {
          await Promise.all(results.locations.map(async (location, i) => {
            // create a dictionary with routeId and status
            const routeIdStatus = {}
            const locations = results.locations
            locations.forEach((location) => {
              const status = location.status
              const routeId = location.routeId
              if (routeId in routeIdStatus) {
                const existingVal = routeIdStatus[routeId]
                if (existingVal !== 'esriLocatingOK') {
                  routeIdStatus[routeId] = status
                }
              } else {
                routeIdStatus[routeId] = status
              }
            })
            if (location && location.geometry && (location.status === 'esriLocatingOK' ||
                location.status === 'esriLocatingToPartialMatch' || location.status === 'esriLocatingFromPartialMatch')) {
              const dataIndex = routeRecords.findIndex((record) => {
                return record.getFieldValue(lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName) === location.routeId
              })
              if (!routeRecords[dataIndex]) return
              const data = routeRecords[dataIndex].clone(true).getData()
              let key = location.routeId
              if (location.toRouteId) key += location.toRouteId
              if (routeIdDate[key]) {
                const dateInfo = routeIdDate[key]
                // eliminate duplicate records
                const mValue = (location.geometry as any).m !== undefined ? (location.geometry as any).m : null
                if (dateInfo.fromDate === data[lrsLayerItem.networkInfo.fromDateFieldName] &&
                  (dateInfo.toDate === data[lrsLayerItem.networkInfo.toDateFieldName]) &&
                  dateInfo.measure === mValue) {
                  return
                }
              }
              routeIdDate[key] = {
                fromDate: data[lrsLayerItem.networkInfo.fromDateFieldName],
                toDate: data[lrsLayerItem.networkInfo.toDateFieldName],
                measure: (location.geometry as any).m !== undefined ? (location.geometry as any).m : null
              }
              let spatialReference
              if (results.spatialReference.wkid) {
                spatialReference = new SpatialReference({ wkid: results.spatialReference.wkid})
              } else if (results.spatialReference.wkt) {
                spatialReference = new SpatialReference({ wkt: results.spatialReference.wkt})
              }

              // search by line and measure
              if (location.toRouteId && location.status === 'esriLocatingOK') {
                data[toRouteField.at(0).value] = location.toRouteId
                if (lrsLayerItem.networkInfo.useRouteName) data[toRouteField.at(1).value] = routeIdNameDict[location.toRouteId][lrsLayerItem.networkInfo.routeNameFieldSchema.jimuName]
                data[toRouteField.at(2).value] = routeIdNameDict[location.toRouteId][lrsLayerItem.networkInfo.lineOrderFieldName]
                const fromDt = routeIdNameDict[location.toRouteId][lrsLayerItem.networkInfo.fromDateFieldName]
                const toDt = routeIdNameDict[location.toRouteId][lrsLayerItem.networkInfo.toDateFieldName]
                data[toRouteField.at(3).value] = isDefined(fromDt) ? getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0]).toLocaleString(undefined, {month: "numeric",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true }) : null
                data[toRouteField.at(4).value] = isDefined(toDt) ? getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0]).toLocaleString(undefined, {month: "numeric",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true }) : null
              }
              const lineIdFieldName = lrsLayerItem.networkInfo.lineIdFieldName

              if (location.geometryType === 'esriGeometryPoint') {
                const geometry = new Point(location.geometry)
                geometry.spatialReference = spatialReference
                data[measureFields.at(0).value] = round(geometry.m, lrsLayerItem.networkInfo.measurePrecision)
                data[networkObjectIdField.value] = routeRecords[dataIndex].getId()

                const fromDt = data[lrsLayerItem.networkInfo.fromDateFieldName]
                const toDt = data[lrsLayerItem.networkInfo.toDateFieldName]

                if (isDefined(derivedNetwork)) {
                  const derived = await getDerivedRouteDetails(geometry, ds, interval, toDt, TimeExtent, routeRecords[dataIndex], derivedNetwork, gdbVersion, lineIdFieldName)
                  if (derived) {
                    data[derivedFields.at(0).value] = derived.routeName
                    data[derivedFields.at(1).value] = derived.routeId
                    data[derivedFields.at(2).value] = round(derived.measure, lrsLayerItem.networkInfo.measurePrecision)
                  }
                }

                if (toDt) {
                  data[lrsLayerItem.networkInfo.toDateFieldName] = getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0])?.valueOf()
                }
                if (fromDt) {
                  data[lrsLayerItem.networkInfo.fromDateFieldName] = getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0])?.valueOf()
                }

                if (params.locations[i].station) {
                  data[stationField.at(0).value] = params.locations[i].station
                }

                const feature = new Graphic({
                  geometry: geometry,
                  attributes: data
                })

                if (isDefined(labelLayer)) {
                  await labelLayer.applyEdits({
                    addFeatures: [feature.clone()]
                  })
                }

                const dataRecord = outputDS.buildRecord(feature)
                if (location.status === 'esriLocatingOK' && !location.toRouteId) {
                  finalMatches.push(dataRecord)
                } else if (location.status === 'esriLocatingOK' && location.toRouteId) {
                  const isIntersect = intersects(dataRecord, lrsLayerItem)
                  if (isIntersect) spanningRoutes.push(dataRecord)
                } else {
                  partialMatches.push(dataRecord)
                }
                newDataRecords.push(dataRecord)
              } else {
                const geometry = new Polyline(location.geometry)
                geometry.spatialReference = spatialReference

                if (geometry.paths?.length > 0) {
                  const firstPoint = geometry.getPoint(0, 0)
                  const lastIdx = geometry.paths[geometry.paths.length - 1].length - 1
                  const lastPoint = geometry.getPoint(geometry.paths.length - 1, lastIdx)
                  data[measureFields.at(0).value] = round(firstPoint.m, lrsLayerItem.networkInfo.measurePrecision)
                  data[measureFields.at(1).value] = round(lastPoint.m, lrsLayerItem.networkInfo.measurePrecision)
                  data[networkObjectIdField.value] = routeRecords[dataIndex].getId()

                  const fromDt = data[lrsLayerItem.networkInfo.fromDateFieldName]
                  const toDt = data[lrsLayerItem.networkInfo.toDateFieldName]

                  if (isDefined(derivedNetwork)) {
                    const derived = await getDerivedRouteDetails(firstPoint, ds, interval, toDt, TimeExtent, routeRecords[dataIndex], derivedNetwork, gdbVersion, lineIdFieldName)
                    const derivedTo = await getDerivedRouteDetails(lastPoint, ds, interval, toDt, TimeExtent, routeRecords[dataIndex], derivedNetwork, gdbVersion, lineIdFieldName)

                    if (derived) {
                      data[derivedFields.at(0).value] = derived.routeName
                      data[derivedFields.at(1).value] = derived.routeId
                      data[derivedFields.at(2).value] = round(derived.measure, lrsLayerItem.networkInfo.measurePrecision)
                    }
                    if (derivedTo) data[derivedFields.at(3).value] = round(derivedTo.measure, lrsLayerItem.networkInfo.measurePrecision)
                  }

                  if (toDt) {
                    data[lrsLayerItem.networkInfo.toDateFieldName] = getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0])?.valueOf()
                  }
                  if (fromDt) {
                    data[lrsLayerItem.networkInfo.fromDateFieldName] = getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0])?.valueOf()
                  }

                  if (params.locations[i].fromStation) {
                    data[stationField.at(1).value] = params.locations[i].fromStation
                  }
                  if (params.locations[i].toStation) {
                    data[stationField.at(2).value] = params.locations[i].toStation
                  }
                }

                const feature = new Graphic({
                  geometry: geometry,
                  attributes: data
                })

                if (isDefined(labelLayer)) {
                  const midPoint = await getPolylineMidPoint(geometry)
                  if (midPoint && spatialReference) midPoint.spatialReference = spatialReference
                  const labelGraphic = new Graphic({
                    geometry: midPoint,
                    attributes: data
                  })

                  await labelLayer.applyEdits({
                    addFeatures: [labelGraphic.clone()]
                  })
                }

                const dataRecord = outputDS.buildRecord(feature)
                if (location.status === 'esriLocatingOK' && !location.toRouteId) {
                  finalMatches.push(dataRecord)
                } else if (location.status === 'esriLocatingOK' && location.toRouteId) {
                  const isIntersect = intersects(dataRecord, lrsLayerItem)
                  if (isIntersect) spanningRoutes.push(dataRecord)
                } else {
                  partialMatches.push(dataRecord)
                }
                newDataRecords.push(dataRecord)
              }
            }
          }))
        })
      })
  }))

  const exactMatchSpanning = {}
  const nonSpanningRouteIds = []
  finalMatches.forEach((match) => {
    const routeId = match.feature.attributes[lrsLayerItem.networkInfo.routeIdFieldName]
    const toRouteId = match?.feature?.attributes[toRouteField.at(0).value]
    exactMatchSpanning[routeId] = toRouteId
  })

  partialMatches.forEach((match) => {
    const routeId = match.feature.attributes[lrsLayerItem.networkInfo.routeIdFieldName]
    if (routeId in exactMatchSpanning) {
      if (exactMatchSpanning[routeId]) {
        finalMatches.push(match)
      }
      nonSpanningRouteIds.push(routeId)
    } else if (!nonSpanningRouteIds.includes(routeId)) {
      finalMatches.push(match)
      nonSpanningRouteIds.push(routeId)
    }
  })

  spanningRoutes.forEach((route) => {
    finalMatches.push(route)
  })

  const layerDefinition = originDs.getLayerDefinition()
  finalMatches.forEach((record) => {
    const feature = (record).feature
    feature.attributes[layerDefinition.objectIdField] = index++
    feature.sourceLayer = (layerObject as any).associatedLayer || layerObject
    feature.layer = feature.sourceLayer
  })
  outputDS.setSourceRecords(finalMatches)
  outputDS.setStatus(DataSourceStatus.Unloaded)
  outputDS.setCountStatus(DataSourceStatus.Unloaded)
  publishMessage(outputDS, widgetId)

  if (intervals.length > 1) {
    // If there were multiple timeslices, we lost the sort order. Query the output datasource to re-sort the records.
    return await sortRecords(outputDS, finalMatches, lrsLayerItem)
  } else {
    return finalMatches
  }
}

function intersects (record, lrsLayerItem) {
  const data = record.getData()
  const fromDate = data[lrsLayerItem.fromDateFieldName]
  const toDate = data[lrsLayerItem.toDateFieldName] || null
  const fromDateToRoute = new Date(data[toRouteField.at(3).value])?.getTime() || null
  const toDateToRoute = new Date(data[toRouteField.at(4).value])?.getTime() || null
  return (fromDate <= fromDateToRoute && (fromDateToRoute < toDate || toDate === null)) || ((fromDateToRoute <= fromDate && (fromDate < toDateToRoute || toDateToRoute === null)))
}
// eslint-disable-next-line max-params
export async function executeMeasureToGeometry (
  widgetId: string,
  outputDS: FeatureLayerDataSource,
  lrsLayerItem: ImmutableObject<LrsLayer>,
  routeRecords: DataRecord[],
  query: RouteAndMeasureQuery,
  labelLayer?: __esri.FeatureLayer,
  jimuMapView?: JimuMapView,
  lrsLayers?: ImmutableArray<LrsLayer>,
  timeExtent?: any,
  Point?: any
): Promise<DataRecord[]> {
  const lrsNetworkId = lrsLayerItem.networkInfo.lrsNetworkId.toString()
  const derivedNetwork = lrsLayers.find(item => (item.networkInfo && lrsNetworkId === item.networkInfo.derivedFromNetworkId) && item.networkInfo.isDerived)
  const dsM = DataSourceManager.getInstance()
  const ds = isDefined(derivedNetwork) && dsM.getDataSource(derivedNetwork.useDataSource.dataSourceId)

  const originDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  const layerObject = await getLayerObject(originDs)
  let gdbVersion = originDs.getGDBVersion()
  if (!gdbVersion) {
    gdbVersion = ''
  }

  // If no measures were provided, return the route records with their measures populated.
  if (!query.isMeasureToGeometryOperation) {
    return updateRouteMeasures(widgetId, lrsLayerItem, routeRecords, outputDS, lrsLayerItem.networkInfo.measurePrecision, labelLayer, jimuMapView,
      timeExtent, derivedNetwork, ds as FeatureLayerDataSource, gdbVersion, Point
    )
  }

  // Get LRS server endpoint.
  const url = lrsLayerItem.networkInfo.networkUrl
  const REST = `${url}/measureToGeometry`
  const token = await SessionManager.getInstance().getSessionByUrl(url).getToken(url)

  const times: Date[] = []
  for (const record of routeRecords) {
    const fromDateEpoch = record.getData()[lrsLayerItem.networkInfo.fromDateFieldName]
    const fromDate = isDefined(fromDateEpoch) ? new Date(fromDateEpoch) : new Date(0)
    times.push(fromDate)
  }

  const intervals = getUniqueDates(times)
  let index = 0
  const newDataRecords = []
  await Promise.all(intervals.map(async (interval) => {
  // Extract the route ids from the records and populate the REST request.
    const routeIds: string[] = []
    const location = []
    routeRecords.forEach((record) => {
      const fromDateEpoch = record.getData()[lrsLayerItem.networkInfo.fromDateFieldName]
      const fromDate = isDefined(fromDateEpoch) ? new Date(fromDateEpoch) : new Date(0)

      if (interval.valueOf() === fromDate.valueOf()) {
        const routeId = record.getFieldValue(lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName)
        routeIds.push(routeId)
        if (query.searchMeasureBy === SearchMeasuresType.Single) {
          location.push({
            routeId: routeId,
            measure: round(query.measure, lrsLayerItem.networkInfo.measurePrecision),
            station: query.station
          })
        } else if (query.searchMeasureBy === SearchMeasuresType.Multiple) {
          query.measures.forEach((m, index) => {
            location.push({
              routeId: routeId,
              measure: round(m, lrsLayerItem.networkInfo.measurePrecision),
              station: query.stations.at(index)
            })
          })
        } else {
          if (isNaN(query.toMeasure)) {
            location.push({
              routeId: routeId,
              measure: round(query.fromMeasure, lrsLayerItem.networkInfo.measurePrecision),
              station: query.fromStation
            })
          } else {
            location.push({
              routeId: routeId,
              fromMeasure: round(query.fromMeasure, lrsLayerItem.networkInfo.measurePrecision),
              toMeasure: round(query.toMeasure, lrsLayerItem.networkInfo.measurePrecision),
              fromStation: query.fromStation,
              toStation: query.toStation
            })
          }
        }
      }
    })

    const params = {
      f: 'json',
      token: token,
      locations: location,
      gdbVersion: gdbVersion,
      temporalViewDate: !isDefined(interval) || interval.valueOf() === 0 ? '' : interval
    }

    // Perform measure to geometry REST request.
    await requestService({ method: 'POST', url: REST, params: params })
      .then(async (results: MeasureToGeometryResponse) => {
        if (!results || !results.locations) {
          return newDataRecords
        }

        let Point: typeof __esri.Point = null
        let Polyline: typeof __esri.Polyline = null
        let SpatialReference: typeof __esri.SpatialReference = null
        let Graphic: typeof __esri.Graphic = null
        let TimeExtent: typeof __esri.TimeExtent = null

        await loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/Polyline', 'esri/geometry/SpatialReference', 'esri/Graphic', 'esri/time/TimeExtent']).then(modules => {
          [Point, Polyline, SpatialReference, Graphic, TimeExtent] = modules
        }).then(async () => {
          await Promise.all(results.locations.map(async (location, i) => {
            if (location && location.geometry) {
              const dataIndex = routeRecords.findIndex((record) => {
                return record.getFieldValue(lrsLayerItem.networkInfo.routeIdFieldSchema.jimuName) === location.routeId &&
                  record.getFieldValue(lrsLayerItem.networkInfo.fromDateFieldName) === params.temporalViewDate.valueOf()
              })
              const data = routeRecords[dataIndex].clone(true).getData()
              const spatialReference = new SpatialReference({ wkid: results.spatialReference.wkid, wkt: results.spatialReference.wkt })
              const lineIdFieldName = lrsLayerItem.networkInfo.lineIdFieldName

              if (location.geometryType === 'esriGeometryPoint') {
                const geometry = new Point(location.geometry)
                geometry.spatialReference = spatialReference
                data[measureFields.at(0).value] = round(geometry.m, lrsLayerItem.networkInfo.measurePrecision)
                data[networkObjectIdField.value] = routeRecords[dataIndex].getId()

                const fromDt = data[lrsLayerItem.networkInfo.fromDateFieldName]
                const toDt = data[lrsLayerItem.networkInfo.toDateFieldName]

                if (isDefined(derivedNetwork)) {
                  const derived = await getDerivedRouteDetails(geometry, ds, interval, toDt, TimeExtent, routeRecords[dataIndex], derivedNetwork, gdbVersion, lineIdFieldName)
                  if (derived) {
                    data[derivedFields.at(0).value] = derived.routeName
                    data[derivedFields.at(1).value] = derived.routeId
                    data[derivedFields.at(2).value] = round(derived.measure, lrsLayerItem.networkInfo.measurePrecision)
                  }
                }

                if (toDt) {
                  data[lrsLayerItem.networkInfo.toDateFieldName] = getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0])?.valueOf()
                }
                if (fromDt) {
                  data[lrsLayerItem.networkInfo.fromDateFieldName] = getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0])?.valueOf()
                }

                if (params.locations[i].station) {
                  data[stationField.at(0).value] = params.locations[i].station
                }

                const feature = new Graphic({
                  geometry: geometry,
                  attributes: data
                })

                if (isDefined(labelLayer)) {
                  await labelLayer.applyEdits({
                    addFeatures: [feature.clone()]
                  })
                }

                const dataRecord = outputDS.buildRecord(feature)
                newDataRecords.push(dataRecord)
              } else {
                const geometry = new Polyline(location.geometry)
                geometry.spatialReference = spatialReference

                if (geometry.paths?.length > 0) {
                  const firstPoint = geometry.getPoint(0, 0)
                  const lastIdx = geometry.paths[geometry.paths.length - 1].length - 1
                  const lastPoint = geometry.getPoint(geometry.paths.length - 1, lastIdx)
                  data[measureFields.at(0).value] = round(firstPoint.m, lrsLayerItem.networkInfo.measurePrecision)
                  data[measureFields.at(1).value] = round(lastPoint.m, lrsLayerItem.networkInfo.measurePrecision)
                  data[networkObjectIdField.value] = routeRecords[dataIndex].getId()

                  const fromDt = data[lrsLayerItem.networkInfo.fromDateFieldName]
                  const toDt = data[lrsLayerItem.networkInfo.toDateFieldName]

                  if (isDefined(derivedNetwork)) {
                    const derived = await getDerivedRouteDetails(firstPoint, ds, interval, toDt, TimeExtent, routeRecords[dataIndex], derivedNetwork, gdbVersion, lineIdFieldName)
                    const derivedTo = await getDerivedRouteDetails(lastPoint, ds, interval, toDt, TimeExtent, routeRecords[dataIndex], derivedNetwork, gdbVersion, lineIdFieldName)

                    if (derived) {
                      data[derivedFields.at(0).value] = derived.routeName
                      data[derivedFields.at(1).value] = derived.routeId
                      data[derivedFields.at(2).value] = round(derived.measure, lrsLayerItem.networkInfo.measurePrecision)
                    }
                    if (derivedTo) data[derivedFields.at(3).value] = round(derivedTo.measure, lrsLayerItem.networkInfo.measurePrecision)
                  }

                  if (toDt) {
                    data[lrsLayerItem.networkInfo.toDateFieldName] = getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0])?.valueOf()
                  }
                  if (fromDt) {
                    data[lrsLayerItem.networkInfo.fromDateFieldName] = getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0])?.valueOf()
                  }

                  if (params.locations[i].fromStation) {
                    data[stationField.at(1).value] = params.locations[i].fromStation
                  }
                  if (params.locations[i].toStation) {
                    data[stationField.at(2).value] = params.locations[i].toStation
                  }
                }

                const feature = new Graphic({
                  geometry: geometry,
                  attributes: data
                })

                if (isDefined(labelLayer)) {
                  const midPoint = await getPolylineMidPoint(geometry)
                  if (midPoint && spatialReference) midPoint.spatialReference = spatialReference
                  const labelGraphic = new Graphic({
                    geometry: midPoint,
                    attributes: data
                  })

                  await labelLayer.applyEdits({
                    addFeatures: [labelGraphic.clone()]
                  })
                }

                const dataRecord = outputDS.buildRecord(feature)
                newDataRecords.push(dataRecord)
              }
            }
          }))
        })
      })
  }))

  const layerDefinition = originDs.getLayerDefinition()
  newDataRecords.forEach((record) => {
    const feature = (record).feature
    feature.attributes[layerDefinition.objectIdField] = index++
    feature.sourceLayer = (layerObject as any).associatedLayer || layerObject
    feature.layer = feature.sourceLayer
  })

  outputDS.setSourceRecords(newDataRecords)
  outputDS.setStatus(DataSourceStatus.Unloaded)
  outputDS.setCountStatus(DataSourceStatus.Unloaded)
  publishMessage(outputDS, widgetId)

  if (intervals.length > 1) {
    // If there were multiple timeslices, we lost the sort order. Query the output datasource to re-sort the records.
    return await sortRecords(outputDS, newDataRecords, lrsLayerItem)
  } else {
    return newDataRecords
  }
}
// eslint-disable-next-line max-params
export async function updateRouteMeasures (
  widgetId: string,
  lrsLayerItem: ImmutableObject<LrsLayer>,
  routeRecords: DataRecord[],
  outputDS: FeatureLayerDataSource,
  precision: number,
  labelLayer?: __esri.FeatureLayer,
  jimuMapView?: JimuMapView,
  timeExtent?: any,
  derivedNetwork?: LrsLayer,
  ds?: FeatureLayerDataSource,
  gdbVersion?: string,
  Point?: any
): Promise<DataRecord[]> {
  const newDataRecords = []

  const originDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  const layerObject = await getLayerObject(originDs)

  let Polyline: typeof __esri.Polyline = null
  let Graphic: typeof __esri.Graphic = null
  return loadArcGISJSAPIModules(['esri/geometry/Polyline', 'esri/Graphic']).then(modules => {
    [Polyline, Graphic] = modules
  }).then(async () => {
    await Promise.all(routeRecords.map(async (record, index) => {
      const data = record.getData()
      const geometry = record.getGeometry()
      const polyline = new Polyline(geometry)
      const firstPoint = polyline.getPoint(0, 0)
      const lastIdx = polyline.paths[polyline.paths.length - 1].length - 1
      const lastPoint = polyline.getPoint(polyline.paths.length - 1, lastIdx)
      data[measureFields.at(0).value] = round(firstPoint.m, precision)
      data[measureFields.at(1).value] = round(lastPoint.m, precision)
      data[networkObjectIdField.value] = record.getId()
      data.OBJECTID = index + 1

      const fromDt = data[lrsLayerItem.networkInfo.fromDateFieldName]
      const toDt = data[lrsLayerItem.networkInfo.toDateFieldName]
      const lineIdFieldName = lrsLayerItem.networkInfo.lineIdFieldName

      if (isDefined(derivedNetwork)) {
        const derived = await getDerivedRouteDetails(firstPoint, ds, fromDt, toDt, timeExtent, record, derivedNetwork, gdbVersion, lineIdFieldName)
        const derivedTo = await getDerivedRouteDetails(lastPoint, ds, fromDt, toDt, timeExtent, record, derivedNetwork, gdbVersion, lineIdFieldName)
        if (derived) {
          data[derivedFields.at(0).value] = derived.routeName
          data[derivedFields.at(1).value] = derived.routeId
          data[derivedFields.at(2).value] = round(derived.measure, precision)
        }
        if (derivedTo) data[derivedFields.at(3).value] = round(derivedTo.measure, precision)
      }
      if (toDt) {
        data[lrsLayerItem.networkInfo.toDateFieldName] = getDateWithTZOffset(toDt, outputDS.getOriginDataSources()[0])?.valueOf()
      }
      if (fromDt) {
        data[lrsLayerItem.networkInfo.fromDateFieldName] = getDateWithTZOffset(fromDt, outputDS.getOriginDataSources()[0])?.valueOf()
      }

      const feature = new Graphic({
        geometry: polyline,
        attributes: data
      })

      if (isDefined(labelLayer)) {
        const midPoint = await getPolylineMidPoint(polyline)
        const labelGraphic = new Graphic({
          geometry: midPoint,
          attributes: data
        })

        await labelLayer.applyEdits({
          addFeatures: [labelGraphic.clone()]
        })
      }

      const dataRecord = outputDS.buildRecord(feature)
      newDataRecords.push(dataRecord)
    }))

    newDataRecords.forEach((record) => {
      const feature = (record).feature
      feature.sourceLayer = (layerObject as any).associatedLayer || layerObject
      feature.layer = feature.sourceLayer
    })

    outputDS.setSourceRecords(newDataRecords)
    outputDS.setStatus(DataSourceStatus.Unloaded)
    outputDS.setCountStatus(DataSourceStatus.Unloaded)
    publishMessage(outputDS, widgetId)

    return await sortRecords(outputDS, newDataRecords, lrsLayerItem)
  })
}

async function getLayerObject (dataSource: FeatureLayerDataSource) {
  if (dataSource?.layer) {
    await dataSource.layer.load()
    return dataSource.layer
  } else {
    const layerObject = await dataSource.createJSAPILayerByDataSource() as __esri.Layer
    await layerObject.load()
    return layerObject
  }
}

function publishMessage (outputDS: FeatureLayerDataSource, widgetId: string) {
  if (!outputDS) { return }
  const originDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  const popupInfo = originDs.getPopupInfo()
  const layerDefinition = originDs.getLayerDefinition()
  const getDefaultFieldInfos = () =>
    [
      { fieldName: layerDefinition?.objectIdField ?? 'objectid', label: 'OBJECTID', tooltip: '', visible: true }
    ] as IFieldInfo[]
  const fieldInfos = ((fieldInfos) => (fieldInfos.length ? fieldInfos : getDefaultFieldInfos()))(
    (popupInfo?.fieldInfos || []).filter((i) => i.visible)
  )

  const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(widgetId, RecordSetChangeType.CreateUpdate, [{
    records: outputDS.getRecords(),
    fields: fieldInfos.map((fieldInfo) => fieldInfo.fieldName),
    dataSource: outputDS,
    name: outputDS.id
  }])

  MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
}

const sortRecords = async (outputDS: FeatureLayerDataSource, inputRecords: DataRecord[], lrsLayerItem: ImmutableObject<LrsLayer>): Promise<DataRecord[]> => {
  const featureQuery: FeatureLayerQueryParams = ({
    returnGeometry: true,
    where: '1=1',
    outFields: ['*'],
    notAddFieldsToClient: true
  })

  const sortOptions = lrsLayerItem.networkInfo?.sortOptions?.filter(item => isDefined(item.jimuFieldName))
  if (sortOptions?.length > 0) {
    Object.assign(featureQuery, {
      orderByFields: lrsLayerItem.networkInfo.sortOptions.map(item => `${item.jimuFieldName} ${item.order}`)
    })
  } else {
    // no sort option, return in the order of the input records
    return inputRecords
  }

  return await outputDS.query(featureQuery).then((results) => {
    if (results.records?.length > 0) {
      return results.records
    }
    return inputRecords
  }).catch((e: any) => {
    return inputRecords
  })
}

export function getAliasRecord (data, lrsLayerItem) {
  const fieldAlias = {}
  const allFieldsDetails = lrsLayerItem.allFieldsDetails
  allFieldsDetails.forEach((field) => {
    fieldAlias[field.jimuName] = field.alias
  })
  const keys = Object.keys(data)
  keys.forEach((key) => {
    const newKey = fieldAlias[key]
    data[newKey] = data[key]
    delete data.key
  })
  return data
}
