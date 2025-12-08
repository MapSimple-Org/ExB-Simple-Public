/** @jsx jsx */
import {
  React,
  jsx,
  css,
  hooks,
  classNames,
  type DataRecord,
  type ImmutableObject,
  type DataSource,
  DataSourceStatus,
  MessageManager,
  DataRecordSetChangeMessage,
  RecordSetChangeType,
  loadArcGISJSAPIModules,
  type FeatureLayerDataSource,
  type QueriableDataSource,
  type IntlShape,
  Immutable,
  type ImmutableArray,
  type FeatureDataRecord
} from 'jimu-core'
import {
  type LrsLayer,
  LrsLayerType,
  SearchMethod,
  SpatialReferenceFrom,
  createLabelLayer,
  isDefined,
  removeLabelLayer,
  isWithinTolerance
} from 'widgets/shared-code/lrs'
import { Alert, Button, FOCUSABLE_CONTAINER_CLASS, Label, Tooltip } from 'jimu-ui'
import { SearchMethodForm } from './search-by-route-method-form'
import { SearchMeasureForm } from './search-by-route-measure-form'
import { SearchReferentForm } from './search-by-referent-form'
import { SearchCoordinatesForm } from './search-by-coordinates-form'
import { SearchTaskResult } from './search-by-route-results'
import { executeMeasureToGeometry, queryRoutes, executeReferentToGeometry, executeGeometryToMeasure, queryRoutesByGeometry, queryRoutesByGeometryWithTolerance, queryRoutesByClosestResults, executeGeometryToMeasureWithTolerance, executeMeasureToGeometryLine, getAliasRecord } from '../utils/service-utils'
import defaultMessages from '../translations/default'
import type { JimuMapView } from 'jimu-arcgis'
import { DataSourceManager } from '../data-source/data-source-manager'
import { useDataSourceExists } from '../data-source/use-data-source-exist'
import { createLabelExpression, getLabelFields } from '../utils/utils'
import type { AlertType } from 'jimu-ui/lib/components/alert/type'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { SearchLineMeasureForm } from './search-by-line-measure-form'
import type { CoordinateQuery, ReferentQuery, ResultConfig, RouteAndMeasureQuery, Style } from '../../config'
import { getTheme } from 'jimu-theme'

export interface SearchByRouteTaskProps {
  widgetId: string
  jimuMapView: JimuMapView
  lrsLayers: ImmutableArray<LrsLayer>
  highlightStyle: Style
  labelStyle: Style
  resultConfig: ImmutableObject<ResultConfig>
  defaultNetwork: string
  hideMethod: boolean
  hideNetwork: boolean
  hideRoute: boolean
  intl: IntlShape
  hideTitle: boolean
  coordinateGraphic: GraphicsLayer
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    &.wrapped .search-by-route-form {
      height: 100%;
    }
    .search-by-route-task__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .toast-container {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.7);
      height: 100%;
    }
    .toast {
      position: relative;
      top: 4%;
    }
    .search-by-route-footer {
      display: flex;
      height: auto;
      padding: 12px;
    }
  `
}

export function SearchByRouteTask (props: SearchByRouteTaskProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { widgetId, jimuMapView, lrsLayers, highlightStyle, labelStyle, resultConfig, defaultNetwork, hideMethod, hideNetwork, hideRoute , intl, hideTitle, coordinateGraphic } = props
  const [selectedNetwork, setSelectedNetwork] = React.useState<ImmutableObject<LrsLayer>>(Immutable(lrsLayers?.find(item => !item?.isReferent)))
  const [selectedReferent, setSelectedReferent] = React.useState<ImmutableObject<LrsLayer>>(Immutable(lrsLayers?.find(item => item?.isReferent)) || null)
  const [selectedMethod, setSelectedMethod] = React.useState<SearchMethod>(SearchMethod.Measure)
  const [resultCount, setResultCount] = React.useState(0)
  const [section, setSection] = React.useState(0)
  const [outputLineDS, setLineOutputDS] = React.useState<DataSource>(null)
  const [outputPointDS, setPointOutputDS] = React.useState<DataSource>(null)
  const [isOutputPoint, setIsOutputPoint] = React.useState<boolean>(false)
  const [dataSource, setDataSource] = React.useState<DataSource>(null)
  const [isDsEnabled, setIsDsEnabled] = React.useState(false)
  const [isNoResults, setNoResults] = React.useState<boolean>(false)
  const [toastOpen, setToastOpen] = React.useState<boolean>(false)
  const [toastMsgType, setToastMsgType] = React.useState<AlertType>()
  const [toastMsg, setToastMsg] = React.useState<string>('')
  const [reset, setReset] = React.useState<boolean>(false)
  const [measureType, setMeasureType] = React.useState(null)
  const [defNetwork, setDefNetwork] = React.useState(defaultNetwork)
  const recordsRef = React.useRef<DataRecord[]>(null)
  const routeRecordsRef = React.useRef<DataRecord[]>(null)
  const dataStoreExists = useDataSourceExists({ widgetId: props.widgetId, useDataSourceId: selectedNetwork?.useDataSource?.dataSourceId })
  const labelFeatureId = 'search-by-route-layer-'
  const [isValidInput, setIsValidInput] = React.useState<boolean>(true)
  const measureRef = React.useRef(null)
  const referentRef = React.useRef(null)
  const coordinatesRef = React.useRef(null)
  const lineMeasureRef = React.useRef(null)

  React.useEffect(() => {
    if (lrsLayers?.length > 0) {
      const defaultReferentLayerId = resultConfig?.defaultReferentLayer?.id
      const referentItem = lrsLayers.find((item) => item?.id === defaultReferentLayerId)
      setSelectedReferent(Immutable(referentItem))
      for (let i = 0; i < lrsLayers.length; i++) {
        const item = lrsLayers[i]
        if (!item?.isReferent) {
          setSelectedNetwork(item)
          break
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (lrsLayers) {
      // Set the default network if it is not defined.
      const network = lrsLayers.find(item => item.layerType === LrsLayerType.Network && !item.networkInfo.isDerived)
      if (network) {
        setDefNetwork(network.name)
      } else {
        setDefNetwork('')
      }
      // Set the default referent if it is not defined.
      const referent = lrsLayers.find(item => item.isReferent)
      if (referent) {
        setSelectedReferent(Immutable(referent))
      } else {
        setSelectedReferent(null)
      }
    }
  }, [lrsLayers])

  React.useEffect(() => {
    const isDefaultNetworkValid = lrsLayers.find(item => item.name === defNetwork)

    if (!isDefaultNetworkValid) {
      const network = lrsLayers.find(item => item.layerType === LrsLayerType.Network && !item.networkInfo.isDerived)
      setDefNetwork(network?.name)
    }
  }, [defNetwork, lrsLayers])

  React.useEffect(() => {
    if (isNoResults) {
      setToastMsgType('error')
      setToastMsg(toastMsg)
      setToastOpen(true)
      setTimeout(() => {
        setToastOpen(false)
        setNoResults(false)
      }, 5000)
    }
  }, [isNoResults, getI18nMessage, toastMsg])

  React.useEffect(() => {
    const item = lrsLayers.find(item => item?.name === defNetwork && !item?.isReferent)
    if (isDefined(item) && item?.networkInfo?.defaultMethod) {
      setSelectedNetwork(Immutable(item))
      if (item.networkInfo.defaultMethod === SearchMethod.Referent && !lrsLayers.some(layer => layer.isReferent)) {
        // No Referents in the map. Attempt other active methods first before falling back to Referent.
        if (item.networkInfo.useMeasure) {
          setSelectedMethod(SearchMethod.Measure)
        } else if (item.networkInfo.useCoordinate) {
          setSelectedMethod(SearchMethod.Coordinate)
        } else {
          setSelectedMethod(SearchMethod.Referent)
        }
      } else {
        setSelectedMethod(item.networkInfo.defaultMethod)
      }
    }
  }, [defNetwork, lrsLayers])

  React.useEffect(() => {
    if (isDefined(resultConfig.defaultReferentLayer)) {
      const item = lrsLayers.find(prop => prop.name === resultConfig.defaultReferentLayer.name)
      if (isDefined(item)) {
        setSelectedReferent(Immutable(item))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultConfig.defaultReferentLayer])

  const handleDataSourceReady = (isReady: boolean) => {
    setIsDsEnabled(isReady)
  }

  const handleDataSourceCreated = (ds: DataSource) => {
    setDataSource(ds)
  }

  const handleLineDsCreated = (ds: DataSource) => {
    setLineOutputDS(ds)
  }

  const handlePointDsCreated = (ds: DataSource) => {
    setPointOutputDS(ds)
  }

  const handleMethodChanged = (selectedMethod: SearchMethod) => {
    setSelectedMethod(selectedMethod)
    clearGraphics()
  }

  const handleNetworkChanged = (selectedNetwork: ImmutableObject<LrsLayer>) => {
    setIsDsEnabled(false)
    setSelectedNetwork(selectedNetwork)
    clearGraphics()
  }

  const handleReferentChanged = (selectedReferent: any) => {
    setIsDsEnabled(false)
    setSelectedReferent(selectedReferent)
  }

  const clearGraphics = (): void => {
    if (isDefined(coordinateGraphic)) {
      coordinateGraphic.removeAll()
    }
  }

  const publishDataClearedMsg = React.useCallback(() => {
    if (outputLineDS && outputPointDS) {
      const id = isOutputPoint ? outputPointDS.id : outputLineDS.id
      const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(widgetId, RecordSetChangeType.Remove, [id])
      MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
    }
  }, [outputLineDS, outputPointDS, isOutputPoint, widgetId])

  const handleMeasureFormSubmit = React.useCallback(async (routeQuery: RouteAndMeasureQuery) => {
    let TimeExtent: typeof __esri.TimeExtent = null
    let Point: typeof __esri.Point = null
    const originDS = dataSource as FeatureLayerDataSource
    let featureDS: FeatureLayerDataSource

    // Get datasoure for point or line.
    if (routeQuery.isPoint) {
      setIsOutputPoint(true)
      featureDS = outputPointDS as FeatureLayerDataSource
    } else {
      setIsOutputPoint(false)
      featureDS = outputLineDS as FeatureLayerDataSource
    }

    // Create label layer
    let labelLayer: __esri.FeatureLayer
    if (labelStyle.size > 0) {
      // Get the fields from the original layer.
      const layer = originDS?.layer || (await originDS.createJSAPILayerByDataSource()) as __esri.FeatureLayer
      const fields = getLabelFields(layer.fields)
      const labelExpression = createLabelExpression(selectedNetwork, routeQuery.isPoint)
      labelLayer = await createLabelLayer(fields, jimuMapView, labelExpression, labelFeatureId, labelStyle.color, labelStyle.size)
    }

    // Clear previous data.
    publishDataClearedMsg()
    recordsRef.current = null

    // Perform query on route identifier.
    await loadArcGISJSAPIModules(['esri/time/TimeExtent', 'esri/geometry/Point']).then(modules => {
      [TimeExtent, Point] = modules

    }).then(() => {
      queryRoutes(originDS, selectedNetwork, routeQuery, jimuMapView)
        .then((routeRecords) => {
          // Execute measure to geometry if measure was provided. If no measures were provided,
          // just the input records are returned as results.
          executeMeasureToGeometry(widgetId, featureDS, selectedNetwork, routeRecords, routeQuery, labelLayer, jimuMapView, lrsLayers, TimeExtent, Point)
            .then((newRecords) => {
              if (newRecords?.length > 0) {
                newRecords.forEach((result) => {
                  const record = result.getData()
                  getAliasRecord(record, selectedNetwork.networkInfo)
                })
                featureDS.setRecords(newRecords as FeatureDataRecord[])
                setResultCount(newRecords?.length)
                recordsRef.current = featureDS.getRecordsByPage(1, resultConfig.pageSize)
                setNoResults(false)
                setSection(1)
              } else {
                setNoResults(true)
                setToastMsg(routeQuery.isMeasureToGeometryOperation ? getI18nMessage('noResultsMeasure') : getI18nMessage('noResults'))
              }
            })
            .finally(() => null)
        })
    })
  }, [dataSource, labelStyle, publishDataClearedMsg, outputPointDS, outputLineDS, selectedNetwork, jimuMapView, widgetId, lrsLayers, resultConfig, getI18nMessage])

  const handleLineMeasureFormSubmit = React.useCallback(async (routeQuery: RouteAndMeasureQuery) => {
    const originDS = dataSource as FeatureLayerDataSource
    let featureDS: FeatureLayerDataSource
    let TimeExtent: typeof __esri.TimeExtent = null
    let Point: typeof __esri.Point = null

    // Get datasoure for point or line.
    if (routeQuery.isPoint) {
      setIsOutputPoint(true)
      featureDS = outputPointDS as FeatureLayerDataSource
    } else {
      setIsOutputPoint(false)
      featureDS = outputLineDS as FeatureLayerDataSource
    }

    // Create label layer
    let labelLayer: __esri.FeatureLayer
    if (labelStyle.size > 0) {
      // Get the fields from the original layer.
      const layer = originDS?.layer || (await originDS.createJSAPILayerByDataSource()) as __esri.FeatureLayer
      const fields = getLabelFields(layer.fields)
      const labelExpression = createLabelExpression(selectedNetwork, routeQuery.isPoint)
      labelLayer = await createLabelLayer(fields, jimuMapView, labelExpression, labelFeatureId, labelStyle.color, labelStyle.size)
    }

    // Clear previous data.
    publishDataClearedMsg()
    recordsRef.current = null

    // Perform query on route identifier.
    await loadArcGISJSAPIModules(['esri/time/TimeExtent', 'esri/geometry/Point']).then(modules => {
      [TimeExtent, Point] = modules

    }).then(() => {
      queryRoutes(originDS, selectedNetwork, routeQuery, jimuMapView)
        .then((routeRecords) => {
          // Execute measure to geometry if measure was provided. If no measures were provided,
          // just the input records are returned as results.
          executeMeasureToGeometryLine(widgetId, featureDS, selectedNetwork, lrsLayers, routeRecords, routeQuery, labelLayer, jimuMapView, TimeExtent, Point)
            .then((newRecords) => {
              if (newRecords?.length > 0) {
                newRecords.forEach((result) => {
                  const record = result.getData()
                  getAliasRecord(record, selectedNetwork.networkInfo)
                })
                featureDS.setRecords(newRecords as FeatureDataRecord[])
                setResultCount(newRecords?.length)
                recordsRef.current = featureDS.getRecordsByPage(1, resultConfig.pageSize)
                setNoResults(false)
                setSection(1)
              } else {
                setNoResults(true)
                setToastMsg(routeQuery.isMeasureToGeometryOperation ? getI18nMessage('noResultsMeasure') : getI18nMessage('noResults'))
              }
              setMeasureType(routeQuery.searchMeasureBy)
            })
            .finally(() => null)
        })
    })
  }, [dataSource, labelStyle, publishDataClearedMsg, outputPointDS, outputLineDS, selectedNetwork, jimuMapView, widgetId, lrsLayers, resultConfig, getI18nMessage])

  const handleReferentFormSubmit = async (queryParams: ReferentQuery, objectIdFromDt: any[]) => {
    const originDS = dataSource as FeatureLayerDataSource
    const featureDS = outputPointDS as FeatureLayerDataSource
    const count = 1

    // Create label layer
    let labelLayer: __esri.FeatureLayer
    if (labelStyle.size > 0) {
      // Get the fields from the original layer.
      const layer = originDS?.layer || (await originDS.createJSAPILayerByDataSource()) as __esri.FeatureLayer
      const fields = getLabelFields(layer.fields)
      const labelExpression = createLabelExpression(selectedNetwork, true)
      labelLayer = await createLabelLayer(fields, jimuMapView, labelExpression, labelFeatureId, labelStyle.color, labelStyle.size)
    }

    setIsOutputPoint(true)
    // Clear previous data.
    publishDataClearedMsg()
    recordsRef.current = null

    await executeReferentToGeometry(widgetId, originDS, queryParams, selectedNetwork, selectedReferent,
      featureDS, count, objectIdFromDt, lrsLayers, resultConfig, labelLayer, jimuMapView)
      .then((newRecords) => {
        if (newRecords?.length > 0) {
          newRecords.forEach((result) => {
            const record = result.getData()
            getAliasRecord(record, selectedNetwork.networkInfo)
          })
          featureDS.setSourceRecords(newRecords as FeatureDataRecord[])
          featureDS.setRecords(newRecords as FeatureDataRecord[])
          setResultCount(newRecords?.length)
          recordsRef.current = featureDS.getRecordsByPage(1, resultConfig.pageSize)
          setSection(1)
          setNoResults(false)
        } else {
          setNoResults(true)
          setToastMsg(getI18nMessage('noResultReferent'))
        }
      })
      .finally(() => null)
  }

  const handleCoordinatesFormSubmit = React.useCallback(async (query: CoordinateQuery) => {
    const originDS = dataSource as FeatureLayerDataSource

    // Get datasoure for point or line.
    setIsOutputPoint(true)
    const featureDS = outputPointDS as FeatureLayerDataSource

    // Create label layer
    let labelLayer: __esri.FeatureLayer
    if (labelStyle.size > 0) {
      // Get the fields from the original layer.
      const layer = originDS?.layer || (await originDS.createJSAPILayerByDataSource()) as __esri.FeatureLayer
      const fields = getLabelFields(layer.fields)
      const labelExpression = createLabelExpression(selectedNetwork, true)
      labelLayer = await createLabelLayer(fields, jimuMapView, labelExpression, labelFeatureId, labelStyle.color, labelStyle.size)
    }

    // Clear previous data.
    publishDataClearedMsg()
    recordsRef.current = null

    // Perform spatial query based on coordinates without tolerance.
    queryRoutesByGeometry(originDS, selectedNetwork, query)
      .then(async (routeRecords) => {
        if (routeRecords.length > 0) {
          // Find the measure and distance for the routes.
          executeGeometryToMeasure(widgetId, featureDS, selectedNetwork, routeRecords, query, labelLayer, lrsLayers, jimuMapView)
            .then((newRecords) => {
              featureDS.setRecords(newRecords as FeatureDataRecord[])
              setResultCount(newRecords?.length)
            })
            .finally(() => {
              recordsRef.current = featureDS.getRecordsByPage(1, resultConfig.pageSize)
              setSection(1)
            })
        } else {
          await queryRoutesByGeometryWithTolerance(originDS, selectedNetwork, query)
            .then(async (rteRecords) => {
              if (rteRecords.length > 0) {
                // Query with tolerance since cannot locate route at the exact coordinates.
                // Perform geometry to measure first so we don't hit the limit of Maximum Number of Records Returned by Server.
                let allResultLocations: any[] = []
                let allResultWkid
                await Promise.all(rteRecords.map(async (rteRecord) => {
                  await executeGeometryToMeasureWithTolerance(rteRecord, featureDS, selectedNetwork, query)
                    .then(({ resultLocations, resultWkid }) => {
                      allResultLocations = allResultLocations.concat(resultLocations)
                      allResultWkid = resultWkid
                    })
                }))

                let Point: typeof __esri.Point = null
                let SpatialReference: typeof __esri.SpatialReference = null
                let proximityOperator: typeof __esri.proximityOperator = null
                loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/geometry/operators/proximityOperator']).then(modules => {
                  [Point, SpatialReference, proximityOperator] = modules
                }).then(() => {
                  // Find the results that are closest to the input coordinates.
                  let closestDistance = -1
                  const point = new Point()
                  point.x = query.xCoordinate
                  point.y = query.yCoordinate
                  if (query.zCoordinate) {
                    point.z = query.zCoordinate
                  } else {
                    point.z = 0
                  }
                  if (selectedNetwork.networkInfo.defaultSpatialReferenceFrom === SpatialReferenceFrom.Map) {
                    point.spatialReference = new SpatialReference({ wkid: 102100 })
                  } else {
                    if (selectedNetwork.networkInfo.spatialReferenceInfo.wkid) {
                      point.spatialReference = new SpatialReference({ wkid: selectedNetwork.networkInfo.spatialReferenceInfo.wkid })
                    } else if (selectedNetwork.networkInfo.spatialReferenceInfo.wkt) {
                      point.spatialReference = new SpatialReference({ wkt: selectedNetwork.networkInfo.spatialReferenceInfo.wkt })
                    }
                  }

                  let closestResults = []
                  let closestRouteIds = []
                  allResultLocations.forEach((location) => {
                    if (location) {
                      location.results.forEach((result) => {
                        if (result) {
                          const distance = proximityOperator.getNearestCoordinate(new Point(result.geometry), point).distance
                          if (closestDistance === -1 || isWithinTolerance(distance, closestDistance, selectedNetwork.networkInfo.xyTolerance) || distance < closestDistance) {
                            if (closestDistance === -1 || (!isWithinTolerance(distance, closestDistance, selectedNetwork.networkInfo.xyTolerance) && distance < closestDistance)) {
                              closestResults = []
                              closestRouteIds = []
                              closestDistance = distance
                            }
                            closestResults.push(result)
                            closestRouteIds.push(result.routeId)
                          }
                        }
                      })
                    }
                  })
                  queryRoutesByClosestResults(originDS, selectedNetwork, lrsLayers, featureDS, closestResults, closestRouteIds, allResultWkid, widgetId, labelLayer, jimuMapView)
                    .then(({ newRecords }) => {
                      featureDS.setRecords(newRecords)
                      setResultCount(newRecords?.length)
                      if (newRecords?.length > 0) {
                        newRecords.forEach((result) => {
                          const record = result.getData()
                          getAliasRecord(record, selectedNetwork.networkInfo)
                        })
                        recordsRef.current = featureDS.getRecordsByPage(1, resultConfig.pageSize)
                        setSection(1)
                        setNoResults(false)
                      } else {
                        setNoResults(true)
                        setToastMsg(getI18nMessage('searchRadiusResultsError'))
                      }
                    })
                })
              } else {
                setNoResults(true)
                setToastMsg(getI18nMessage('searchRadiusResultsError'))
              }
            })
        }
      })
  }, [dataSource, outputPointDS, labelStyle, publishDataClearedMsg, selectedNetwork, jimuMapView, widgetId, lrsLayers, resultConfig, getI18nMessage])

  const onNavBack = React.useCallback(() => {
    // Clear preivous results.
    recordsRef.current = null
    if (isOutputPoint) {
      outputPointDS?.clearSelection()
      outputPointDS?.clearRecords()
      outputPointDS?.setCountStatus(DataSourceStatus.NotReady)
      outputPointDS?.setStatus(DataSourceStatus.NotReady)
    } else {
      outputLineDS?.clearSelection()
      outputLineDS?.clearRecords()
      outputLineDS?.setCountStatus(DataSourceStatus.NotReady)
      outputLineDS?.setStatus(DataSourceStatus.NotReady)
    }
    removeLabelLayer(jimuMapView, labelFeatureId)
    setResultCount(0)
    publishDataClearedMsg()
    setSection(0)
  }, [jimuMapView, isOutputPoint, outputLineDS, outputPointDS, publishDataClearedMsg])

  React.useEffect(() => {
    onNavBack()
  }, [lrsLayers, onNavBack])

  const submitForm = React.useCallback(() => {
    if (selectedMethod === SearchMethod.Measure) {
      measureRef.current?.submitForm()
    } else if (selectedMethod === SearchMethod.Referent) {
      referentRef.current?.submitForm()
    } else if (selectedMethod === SearchMethod.Coordinate) {
      coordinatesRef.current?.submitForm()
    } else if (selectedMethod === SearchMethod.LineAndMeasure) {
      lineMeasureRef.current?.submitForm()
    }
  }, [selectedMethod])

  const handleValidationChanged = React.useCallback((isValid: boolean) => {
    setIsValidInput(isValid)
  }, [])

  const getTooltipMessage = React.useMemo(() => {
    if (selectedMethod === SearchMethod.Measure) {
      return !isValidInput ? getI18nMessage('searchDisabled') : getI18nMessage('search')
    } else if (selectedMethod === SearchMethod.Referent) {
      return !isValidInput ? getI18nMessage('searchReferentTooltip') : getI18nMessage('search')
    } else if (selectedMethod === SearchMethod.Coordinate) {
      return !isValidInput ? getI18nMessage('coordinateSearchDisabled') : getI18nMessage('search')
    } else if (selectedMethod === SearchMethod.LineAndMeasure) {
      return !isValidInput ? getI18nMessage('lineMeasureSearchDisabled') : getI18nMessage('search')
    }
  }, [getI18nMessage, isValidInput, selectedMethod])

  const handleReset = () => {
    setReset(!reset)
  }

  return (
    <div className="search-by-route-task h-100 d-flex" css={getFormStyle()}>
      <div className={classNames('search-by-route-form__header px-3 pt-3 align-items-center', {
        'd-none': section === 1,
        [FOCUSABLE_CONTAINER_CLASS]: section !== 1
      })}>
      {!hideTitle && (
        <div className='search-by-route_title d-flex align-items-center text-truncate' css={css`font-weight: 500; font-size: 14px;`}>
            <div className='text-truncate'>
              {getI18nMessage('_widgetLabel')}
            </div>
          </div>
      )}
      </div>
      <div className={classNames('search-by-route-task__content', {
        'd-none': section === 1,
        [FOCUSABLE_CONTAINER_CLASS]: section !== 1
      })}>
        <DataSourceManager
          lrsLayer={selectedNetwork}
          dataSourceReady={handleDataSourceReady}
          onCreateDs={handleDataSourceCreated}
          onCreateLineDs={handleLineDsCreated}
          onCreatePointDs={handlePointDsCreated}/>
        <SearchMethodForm
          lrsLayers={lrsLayers}
          defaultReferent={selectedReferent}
          defaultNetwork={defNetwork}
          resultConfig={resultConfig}
          hideMethod={hideMethod}
          hideNetwork={hideNetwork}
          onMethodChanged={handleMethodChanged}
          onNetworkChanged={handleNetworkChanged}
          onReferentChanged={handleReferentChanged}/>
        {isDsEnabled && dataStoreExists && selectedMethod === SearchMethod.Measure && (
          <SearchMeasureForm
            ref={measureRef}
            intl={intl}
            widgetId={widgetId}
            lrsLayer={selectedNetwork}
            dataSource={dataSource}
            isDataSourceReady={dataSource != null}
            hideRoute={hideRoute}
            reset={reset}
            onSubmit={handleMeasureFormSubmit}
            onValidationChanged={handleValidationChanged}
        />
        )}
        {isDsEnabled && dataStoreExists && selectedMethod === SearchMethod.LineAndMeasure && (
          <SearchLineMeasureForm
            ref={lineMeasureRef}
            intl={intl}
            widgetId={widgetId}
            lrsLayer={selectedNetwork}
            dataSource={dataSource}
            isDataSourceReady={dataSource != null}
            hideRoute={hideRoute}
            onSubmit={handleLineMeasureFormSubmit}
            onValidationChanged={handleValidationChanged}
            reset={reset}
        />
        )}
        {selectedMethod === SearchMethod.Coordinate && (
        <SearchCoordinatesForm
          ref={coordinatesRef}
          lrsLayer={selectedNetwork}
          dataSource={dataSource}
          isDataSourceReady={dataSource != null}
          onSubmit={handleCoordinatesFormSubmit}
          onValidationChanged={handleValidationChanged}
          coordinateGraphic={coordinateGraphic}
          reset={reset}
        />
        )}
        {selectedMethod === SearchMethod.Referent && (
          <SearchReferentForm
            ref={referentRef}
            referentItem={selectedReferent}
            dataSource={dataSource}
            isDataSourceReady={dataSource != null}
            resultConfig={resultConfig}
            onSubmit={handleReferentFormSubmit}
            lrsLayers={lrsLayers}
            id={widgetId}
            intl={intl}
            widgetId={widgetId}
            onValidationChanged={handleValidationChanged}
            reset={reset}
          />
        )}
        {toastOpen && (
        <div className='toast-container px-3 w-100'>
          <Alert
            className='toast w-100'
            type={toastMsgType}
            text={toastMsg}
            closable={true}
            withIcon={true}
            open={toastOpen}
            onClose={() => { setToastOpen(false); setNoResults(false) }}
          />
        </div>
        )}
      </div>

      <div className={classNames('search-by-route-footer_action w-100', {
        'd-none': section === 1,
        [FOCUSABLE_CONTAINER_CLASS]: section !== 1
      })}>
        <div className='search-by-route-footer d-flex' >
        <Label
          size='sm'
          className=' mt-auto mr-auto title3'
          centric
          style={{ color: getTheme()?.sys.color.primary.main }}
          onClick={handleReset}
        >
          {getI18nMessage('resetLabel')}
        </Label>
          <Tooltip
            title={getTooltipMessage}>
              <div className='mt-auto ml-auto'>
                <Button
                  type='primary'
                  className='active'
                  aria-label={getI18nMessage('searchLabel')}
                  size='sm'
                  disabled={!isValidInput}
                  onClick={submitForm}>
                    {getI18nMessage('searchLabel')}
                </Button>
              </div>
          </Tooltip>
        </div>
      </div>
      <div className={classNames('search-by-route-task__content', {
        'd-none': section !== 1,
        [FOCUSABLE_CONTAINER_CLASS]: section === 1
      })}>
        <SearchTaskResult
        lrsLayers={lrsLayers}
        widgetId={widgetId}
        lrsLayer={selectedNetwork}
        selectedMethod={selectedMethod}
        isPoint={isOutputPoint}
        resultCount={resultCount}
        maxPerPage={(dataSource as QueriableDataSource)?.getMaxRecordCount?.()}
        records={recordsRef.current}
        routeRecords={routeRecordsRef.current}
        defaultPageSize={resultConfig.pageSize}
        outputDS={isOutputPoint ? outputPointDS : outputLineDS}
        inputDS={dataSource}
        jimuMapView={jimuMapView}
        highlightStyle={highlightStyle}
        onNavBack={onNavBack}
        intl={intl}
        measureType={measureType}
        />
      </div>
    </div>
  )
}
