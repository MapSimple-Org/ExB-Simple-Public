/** @jsx jsx */
import {
  React,
  jsx,
  type DataSource,
  type ImmutableArray,
  type IntlShape,
  type FeatureLayerQueryParams,
  css,
  type FeatureLayerDataSource,
  loadArcGISJSAPIModule
} from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import type { LocationInfo } from '../../config'
import type Graphic from 'esri/Graphic'
import type Polyline from 'esri/geometry/Polyline'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import TimeExtent from 'esri/time/TimeExtent'
import { GetUnits, isDefined, getRouteFromEndMeasures, type RouteInfo, getHoverGraphic, getSimplePointGraphic, QueryRouteMeasures, LrsLayerType, type LrsLayer, type AttributeSets } from 'widgets/shared-code/lrs'
import { round } from 'lodash-es'
import { Button, Icon } from 'jimu-ui'
import identifyIcon from '../../../icon.svg'

export interface RoutePickerProps {
  intl: IntlShape
  active: boolean
  isReady: boolean
  allDataSources: DataSource[]
  lrsLayers: ImmutableArray<LrsLayer>
  jimuMapView: JimuMapView
  symbolColor: string
  hoverGraphic: GraphicsLayer
  onActiveChange: () => void
  handleShowPp: (val: boolean) => void
  onRouteInfoUpdated: (updatedRouteInfo: RouteInfo, flash?: boolean) => void
  clearFlashGraphic: () => void
  clearPickedGraphic: () => void
  setSelectedPoint: (selectedPoint: __esri.Point) => void
  setRouteDetails: (routeInfo: any[]) => void
  setEventDetails: (eventDetails: any) => void
  eventDataRecords: any[]
  defaultPointAttributeSet: string
  defaultLineAttributeSet: string
  attributeSets: AttributeSets
}

const style = css`
    .route-picker-btn {
      background-color: var(--sys-color-primary-main);
      color: var(--sys-color-surface-overlay);
      width: 32px;
      height: 32px;
      border-radius: 0px;

      &:hover {
        color: var(--sys-color-surface-paper);
      }
    }
    .route-picker-btn-disabled {
      color: var(--sys-color-surface-paperText);
      background-color: var(--sys-color-surface-overlay);
      width: 32px;
      height: 32px;
      border-radius: 0px;

      &:hover {
        color: var(--sys-color-primary-main);
      }
    }
  `

export function RoutePicker (props: RoutePickerProps) {
  const {
    intl, isReady, active, jimuMapView, hoverGraphic, allDataSources, lrsLayers,
    defaultPointAttributeSet, defaultLineAttributeSet, attributeSets,
    onActiveChange, clearFlashGraphic, clearPickedGraphic, handleShowPp
  } = props
  let { eventDataRecords } = props
  const pointerMoveEvent = React.useRef<__esri.Handle>(null)
  const pointerDownEvent = React.useRef<__esri.Handle>(null)
  const isProccessingHover = React.useRef(false)
  const isProccessingPick = React.useRef(false)
  const [toggleOn, setToggle] = React.useState<boolean>(false)
  const proximityOperator = React.useRef<__esri.proximityOperator>(null)

  // update listeners
  React.useEffect(() => {
    if (active) {
      setListeners()
    } else {
      clearListeners()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // hover and click listeners
  const setListeners = () => {
    if (isReady) {
      pointerMoveEvent.current = jimuMapView?.view.on('pointer-move', pointerMoveHandler)
      pointerDownEvent.current = jimuMapView?.view.on('pointer-down', pointerClickHandler)
    }
  }

  const clearListeners = () => {
    if (isDefined(pointerMoveEvent.current)) {
      pointerMoveEvent.current.remove()
      pointerMoveEvent.current = null
    }
    if (isDefined(pointerDownEvent.current)) {
      pointerDownEvent.current.remove()
      pointerDownEvent.current = null
    }
    if (isProccessingPick.current) {
      isProccessingPick.current = false
    }
    if (isProccessingHover.current) {
      isProccessingHover.current = false
    }
  }

  // Graphics
  const clearHoverGraphics = (): void => {
    if (isDefined(hoverGraphic)) {
      hoverGraphic.removeAll()
    }
  }

  const updateHoverGraphic = (graphic: Graphic) => {
    clearHoverGraphics()
    if (isDefined(graphic)) {
      hoverGraphic.add(graphic)
    }
  }

  const getLayerFromDs = (activeFeatureLayer) => {
    const info = {
      routeIdFieldName: null,
      routeNameFieldName: null,
      layer: null
    }
    for (let i = 0; i < lrsLayers.length; i++) {
      const layer = lrsLayers[i]
      if (layer?.serviceId === activeFeatureLayer?.layerId) {
        if (layer?.layerType === LrsLayerType.Event) {
          const eventInfo = layer?.eventInfo
          info.routeIdFieldName = eventInfo.routeIdFieldName
          info.routeNameFieldName = eventInfo?.routeNameFieldName
          info.layer = layer
        } else if (layer?.layerType === LrsLayerType.Network) {
          const networkInfo = layer?.networkInfo
          const routeIdFieldSchema = networkInfo?.routeIdFieldSchema
          info.routeIdFieldName = routeIdFieldSchema?.jimuName
          info.layer = layer
        }
        break
      }
    }
    return info
  }

  const getProximityOperator = async () => {
    if (proximityOperator.current === null) {
      proximityOperator.current = await loadArcGISJSAPIModule('esri/geometry/operators/proximityOperator')
    }
    return proximityOperator.current
  }

  // Handlers
  const pointerMoveHandler = async (event): Promise<void> => {
    if (isProccessingHover.current) { return }
    if (!allDataSources || allDataSources.length === 0) { return }

    await Promise.all(allDataSources.map(async (ds) => {
      const proximityOperator = await getProximityOperator()
      const featureDS = ds as FeatureLayerDataSource
      const activeFeatureLayer = featureDS?.layer

      const lrsLayer = lrsLayers.find(layer => layer.serviceId === activeFeatureLayer.layerId)
      if (isDefined(lrsLayer) && lrsLayer.layerType === LrsLayerType.Network) {
        if (isDefined(activeFeatureLayer)) {
          isProccessingHover.current = true
          const sp = activeFeatureLayer.spatialReference
          const query = activeFeatureLayer.createQuery()
          const mapPoint = jimuMapView?.view.toMap(event)
          const distanceUnits = sp.unit === 'degrees' ? 4 : Math.max(sp.metersPerUnit * 3, 3)
          query.geometry = mapPoint
          query.units = 'meters'
          query.returnM = true
          query.distance = jimuMapView?.view.resolution * distanceUnits
          query.spatialRelationship = 'intersects'
          query.returnGeometry = true
          const queryParams = featureDS.getCurrentQueryParams()
          if (queryParams?.time) {
            query.timeExtent = new TimeExtent({ start: queryParams.time[0], end: queryParams.time[1] })
          }
          query.gdbVersion = queryParams.gdbVersion

          // Accept query on any feature
          query.outFields = ['*']

          activeFeatureLayer.queryFeatures(query)
            .then(async (response) => {
              if (response && response.features.length > 0 && isProccessingHover.current) {
                const geometry = response.features[0].geometry
                const nearestPoint = proximityOperator.getNearestCoordinate(geometry as __esri.geometryGeometry, mapPoint)
                const nearestVertex = proximityOperator.getNearestVertex(geometry as __esri.geometryGeometry, mapPoint)
                if (nearestVertex.distance < (query.distance * 3)) {
                  nearestPoint.coordinate = nearestVertex.coordinate
                }
                updateHoverGraphic(await getHoverGraphic(await getSimplePointGraphic(nearestPoint.coordinate)))
                isProccessingHover.current = false
              } else {
                updateHoverGraphic(null)
                isProccessingHover.current = false
              }
            })
        }
      }
    }))
  }

  const getLineOrders = (originDS, attributes, layerDetails) => {
    if (!originDS) return
    return new Promise((resolve, reject) => {
      const featureDS = originDS as FeatureLayerDataSource
      const queryParams = featureDS.getCurrentQueryParams()

      if (layerDetails?.layer?.networkInfo?.supportsLines) {
        const lineIdName = layerDetails?.layer?.networkInfo?.lineIdFieldName
        const lineOrderName = layerDetails?.layer?.networkInfo?.lineOrderFieldName
        const networkLineId = attributes[lineIdName]
        const whereClause = `${lineIdName} LIKE '%${networkLineId}'`
        const featureQuery: FeatureLayerQueryParams = ({
          where: whereClause,
          outFields: ['*'],
          orderByFields: [lineOrderName]
        })
        if (queryParams?.time) {
          featureQuery.time = [queryParams.time[0], queryParams.time[1]]
        }
        featureQuery.gdbVersion = queryParams.gdbVersion
        originDS.query(featureQuery).then((res) => {
          resolve(res)
          return res
        })
      } else {
        resolve([])
        return []
      }
    })
  }

  const pointerClickHandler = async (event): Promise<void> => {
    event.stopPropagation()
    if (isProccessingPick.current) return
    if (!allDataSources || allDataSources.length === 0) { return }

    const ids = []
    const dataRecords = []
    let point
    eventDataRecords = []
    await Promise.all(allDataSources.map(async (ds) => {
      const proximityOperator = await getProximityOperator()
      const featureDS = ds as FeatureLayerDataSource
      const activeFeatureLayer = featureDS?.layer
      const layerDetails = getLayerFromDs(activeFeatureLayer)
      if (isDefined(activeFeatureLayer)) {
        const isPopupEnabled = activeFeatureLayer.popupEnabled
        activeFeatureLayer.popupEnabled = false
        isProccessingPick.current = true
        const sp = activeFeatureLayer.spatialReference
        const query = activeFeatureLayer.createQuery()
        const mapPoint = jimuMapView?.view.toMap(event)
        const distanceUnits = sp.unit === 'degrees' ? 4 : Math.max(sp.metersPerUnit * 3, 3)
        query.geometry = mapPoint
        query.units = 'meters'
        query.distance = jimuMapView?.view.resolution * distanceUnits
        query.spatialRelationship = 'intersects'
        query.returnGeometry = true
        query.returnM = true
        query.returnZ = true
        query.outFields = ['*']

        const queryParams = featureDS.getCurrentQueryParams()
        if (queryParams?.time) {
          query.timeExtent = new TimeExtent({ start: queryParams.time[0], end: queryParams.time[1] })
        }
        query.gdbVersion = queryParams.gdbVersion
        const routeInfoArray: LocationInfo[] = []
        await activeFeatureLayer.queryFeatures(query)
          .then(async (response) => {
            await Promise.all(response?.features?.map(async (feature) => {
              const routeEndPoints = getRouteFromEndMeasures(feature.geometry as Polyline)
              const geometry = feature.geometry
              const nearestPoint = proximityOperator.getNearestCoordinate(geometry as __esri.geometryGeometry, mapPoint)
              const nearestVertex = proximityOperator.getNearestVertex(geometry as __esri.geometryGeometry, mapPoint)
              if (nearestVertex.distance < (query.distance * 3)) {
                nearestPoint.coordinate = nearestVertex.coordinate
              }
              if (!point) {
                point = nearestPoint.coordinate
                point.hasZ = true
              }

              const attributes = feature?.attributes
              if (layerDetails?.layer?.layerType === LrsLayerType.Network) {
                const networkInfo = layerDetails?.layer?.networkInfo
                await getLineOrders(featureDS, attributes, layerDetails)
                  .then(async (records) => {
                    await QueryRouteMeasures(featureDS, networkInfo, routeEndPoints,
                      attributes[layerDetails?.layer?.networkInfo?.fromDateFieldSchema?.name],
                      attributes[layerDetails?.layer?.networkInfo?.routeIdFieldSchema?.name])
                      .then(async (endpointMeasures) => {
                        const minMeasure = Math.min(...endpointMeasures)
                        const maxMeasure = Math.max(...endpointMeasures)
                        await QueryRouteMeasures(featureDS, networkInfo, [nearestPoint.coordinate],
                          attributes[layerDetails?.layer?.networkInfo?.fromDateFieldSchema?.name],
                          attributes[layerDetails?.layer?.networkInfo?.routeIdFieldSchema?.name])
                          .then((measures) => {
                            const roundedMeasures = []
                            measures.forEach((measure) => {
                              roundedMeasures.push(round(measure, layerDetails?.layer?.networkInfo?.measurePrecision))
                            })

                            const routeInfo: LocationInfo = {
                              objectIdFieldName: layerDetails?.layer?.networkInfo?.objectIdFieldName,
                              ds: ds,
                              records: records,
                              featureDS: featureDS,
                              supportsLines: layerDetails?.layer?.networkInfo?.supportsLines,
                              routeId: attributes[layerDetails?.layer?.networkInfo?.routeIdFieldSchema?.name],
                              routeIdFieldName: layerDetails?.layer?.networkInfo?.routeIdFieldSchema?.name,
                              routeName: attributes[layerDetails?.layer?.networkInfo?.routeNameFieldSchema?.name],
                              routeNameFieldName: layerDetails?.layer?.networkInfo?.routeNameFieldSchema?.name,
                              lineOrderFieldName: layerDetails?.layer?.networkInfo?.lineOrderFieldName,
                              fromDate: attributes[layerDetails?.layer?.networkInfo?.fromDateFieldSchema?.name],
                              toDate: attributes[layerDetails?.layer?.networkInfo?.toDateFieldSchema?.name],
                              selectedPoint: point,
                              selectedPolyline: feature.geometry as Polyline,
                              validRoute: true,
                              measureUnit: GetUnits(layerDetails?.layer?.networkInfo?.unitsOfMeasure, intl),
                              timeDependedInfo: [{
                                objectId: attributes[layerDetails?.layer?.networkInfo?.objectIdFieldName],
                                fromDate: attributes[layerDetails?.layer?.networkInfo?.fromDateFieldSchema?.name],
                                toDate: attributes[layerDetails?.layer?.networkInfo?.toDateFieldSchema?.name],
                                fromMeasure: round(minMeasure, layerDetails?.layer?.networkInfo?.measurePrecision),
                                toMeasure: round(maxMeasure, layerDetails?.layer?.networkInfo?.measurePrecision),
                                selectedMeasures: roundedMeasures, // change type, rename to measures
                                attributes: attributes
                              }],
                              fieldInfos: activeFeatureLayer?.fields
                            }

                            // check if network ids are same
                            if (ids?.includes(layerDetails?.layer?.serviceId)) {
                            // get record with same network id
                              const matchingRecord = dataRecords.find(obj => obj.id === layerDetails?.layer?.serviceId)
                              const routes = matchingRecord?.routes
                              let flag = false
                              routes.forEach((route) => {
                                if (route?.routeId === attributes[layerDetails?.routeIdFieldName]) {
                                  flag = true
                                  const matchRouteInfos = route
                                  // if matching route-id on the same network exists; push details to the timeInfo
                                  matchRouteInfos.timeDependedInfo.push({
                                    objectId: attributes[layerDetails?.layer?.networkInfo?.objectIdFieldName],
                                    measureUnit: GetUnits(layerDetails?.layer?.networkInfo?.unitsOfMeasure, intl),
                                    fromMeasure: round(minMeasure, layerDetails?.layer?.networkInfo?.measurePrecision),
                                    toMeasure: round(maxMeasure, layerDetails?.layer?.networkInfo?.measurePrecision),
                                    selectedMeasures: roundedMeasures,
                                    fromDate: attributes[layerDetails?.layer?.networkInfo?.fromDateFieldSchema?.name],
                                    toDate: attributes[layerDetails?.layer?.networkInfo?.toDateFieldSchema?.name],
                                    attributes: attributes
                                  })
                                  matchRouteInfos.timeDependedInfo.sort((a, b) => {
                                    const dateA = a.fromDate
                                    const dateB = b.fromDate
                                    return dateA - dateB
                                  })
                                }
                              })
                              if (!flag) {
                              // record with same route-id does not exist; push routeInfo
                                matchingRecord?.routes?.push(routeInfo)
                              }
                            } else {
                              const dataRecord = {
                                id: layerDetails?.layer?.serviceId,
                                networkId: layerDetails?.layer?.networkInfo?.lrsNetworkId,
                                layerName: layerDetails?.layer?.name,
                                configFields: layerDetails?.layer?.networkInfo?.attributeFields,
                                useFieldAlias: layerDetails?.layer?.networkInfo?.useFieldAlias,
                                routes: [routeInfo]
                              }
                              dataRecords.push(dataRecord)
                              ids.push(layerDetails?.layer?.serviceId)
                            }
                            routeInfoArray.push(routeInfo)
                          })
                      })
                  })
              } else if (layerDetails?.layer?.layerType === LrsLayerType.Event) {
                eventDataRecords.push({
                  parentNetworkId: layerDetails?.layer?.eventInfo?.parentNetworkId,
                  attributes: attributes,
                  attributeSets: attributeSets,
                  defaultLineAttributeSet: defaultLineAttributeSet,
                  defaultPointAttributeSet: defaultPointAttributeSet,
                  eventLayerId: layerDetails?.layer?.serviceId,
                  fromDate: layerDetails?.layer?.eventInfo?.fromDateFieldName,
                  toDate: layerDetails?.layer?.eventInfo?.toDateFieldName,
                  fieldInfos: activeFeatureLayer?.fields,
                  routeIdFieldName: layerDetails?.layer?.eventInfo?.routeIdFieldName,
                  toRouteIdFieldName: layerDetails?.layer?.eventInfo?.toRouteIdFieldName,
                  canSpanRoutes: layerDetails?.layer?.eventInfo?.canSpanRoutes
                })
              }
            }))
          })
          .finally(() => {
            if (isPopupEnabled) {
              activeFeatureLayer.popupEnabled = false
            }
            isProccessingPick.current = false
          })
          .catch((e) => {
            console.error(e)
          })
      }
    }))
      .then(() => {
        props.setSelectedPoint(point)
        props.setRouteDetails(dataRecords)
        props.setEventDetails(eventDataRecords)
      })
  }

  const onPickBtnClick = (): void => {
    onActiveChange()
    clearPickedGraphic()
    clearFlashGraphic()
    clearHoverGraphics()
    handleShowPp(!toggleOn)
    setToggle(!toggleOn)
    if (!toggleOn) {
      props.setRouteDetails([])
      props.setEventDetails([])
    }
  }

  return (
    <div css={style}>
      <Button
        className={active ? 'route-picker-btn' : 'route-picker-btn-disabled'}
        size='sm'
        tabIndex={-1}
        type='tertiary'
        icon
        disabled={!isReady}
        onClick={onPickBtnClick}>
        <Icon size='m' icon={identifyIcon} className='border-0'/>
      </Button>
    </div>
  )
}
