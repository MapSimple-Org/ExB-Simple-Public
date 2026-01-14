/** @jsx jsx */
import { React, jsx, css, type ImmutableArray, lodash, loadArcGISJSAPIModule, utils, hooks } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView, loadArcGISJSAPIModules } from 'jimu-arcgis'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import type { CreateToolType, UnitType } from '../config'
import { InteractiveDraw } from './interactive-draw-tool'
import { BufferInput } from './buffer-input'
import defaultMessage from './translations/default'
import { QueryTaskContext } from './query-task-context'

export interface Props {
  mapWidgetIds: ImmutableArray<string>
  widgetId: string
  createToolTypes: ImmutableArray<CreateToolType>
  enableBuffer: boolean
  bufferDistance: number
  bufferUnit: UnitType
  onBufferChange: (distance: number, unit: UnitType) => void
  onGeometryChange: (geom: __esri.Geometry, layer?: __esri.GraphicsLayer, graphic?: __esri.Graphic, clearAfterApply?: boolean) => void
}

export function GeometryFromDraw (props: Props) {
  const { onGeometryChange, createToolTypes, mapWidgetIds, enableBuffer, bufferDistance, bufferUnit, onBufferChange, widgetId } = props
  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView>(null)
  const getI18nMessage = hooks.useTranslation(jimuUIMessages, defaultMessage)
  const queryTaskContext = React.useContext(QueryTaskContext)
  const resetSymbolRef = React.useRef(queryTaskContext.resetSymbol)
  const getLayerFunRef = React.useRef<() => __esri.GraphicsLayer>(null)
  const bufferOperatorRef = React.useRef<__esri.bufferOperator>(null)
  const geodesicBufferOperatorRef = React.useRef<__esri.geodesicBufferOperator>(null)
  const geometryServiceRef = React.useRef<{ geometryService: __esri.geometryService, bufferParameters: typeof __esri.BufferParameters }>(null)
  const geometryRef = React.useRef<__esri.Geometry>(null)
  const bufferDistanceRef = React.useRef(bufferDistance)
  const bufferUnitRef = React.useRef(bufferUnit)
  const bufferedGraphicRef = React.useRef<__esri.Graphic>(null)

  hooks.useEffectOnce(() => {
    if (enableBuffer) {
      // Parent component query-task-spatial-form will reset buffer parameter when filter type changes,
      // so defer the init buffer option in order not to be override by its parent.
      lodash.defer(() => {
        onBufferChange(bufferDistance, bufferUnit)
      })
    }
    loadArcGISJSAPIModules([
      'esri/Graphic'
    ]).then((modules) => {
      const Graphic = modules[0]
      bufferedGraphicRef.current = new Graphic({
        symbol: {
          type: 'simple-fill',
          color: [51, 51, 204, 0.5],
          style: 'solid',
          outline: {
            color: [51, 51, 204, 0.8],
            width: 1
          }
        }
      })
    })
  })

  const applyBufferEffect = React.useCallback(async () => {
    if (!geometryRef.current || !enableBuffer || bufferDistanceRef.current === 0) {
      bufferedGraphicRef.current.geometry = null
      return
    }

    // If the end user uses a point or line query geometry, then the negative buffer will not work (same effect as there is no buffer)
    const isPointNegativeBuffer = (geometryRef.current?.type === 'point' || geometryRef.current?.type === 'multipoint') && bufferDistanceRef.current < 0
    const isLineNegativeBuffer = geometryRef.current?.type === 'polyline' && bufferDistanceRef.current < 0
    if (isPointNegativeBuffer || isLineNegativeBuffer) {
      bufferedGraphicRef.current.geometry = null
      return
    }

    const geometry = geometryRef.current
    // https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-geometryEngine.html#buffer
    if (geometry.spatialReference?.isGeographic && !geometry.spatialReference.isWGS84) {
      const serviceUrl = utils.getGeometryService()
      if (!geometryServiceRef.current) {
        const modules = await loadArcGISJSAPIModules([
          'esri/rest/geometryService',
          'esri/rest/support/BufferParameters'
        ])
        geometryServiceRef.current = {
          geometryService: modules[0],
          bufferParameters: modules[1]
        }
      }
      const { geometryService, bufferParameters: BufferParameters } = geometryServiceRef.current
      const polygons = await geometryService.buffer(serviceUrl, new BufferParameters({
        distances: [bufferDistanceRef.current],
        unit: lodash.kebabCase(bufferUnitRef.current) as any,
        geodesic: true,
        bufferSpatialReference: geometry.spatialReference,
        outSpatialReference: geometry.spatialReference,
        geometries: [geometry]
      }))
      bufferedGraphicRef.current.geometry = polygons[0]
    } else {
      if (geometry.spatialReference?.isWGS84 || geometry.spatialReference?.isWebMercator) {
        if (!geodesicBufferOperatorRef.current) {
          geodesicBufferOperatorRef.current = await loadArcGISJSAPIModule('esri/geometry/operators/geodesicBufferOperator')
        }
        if (!geodesicBufferOperatorRef.current.isLoaded()) {
          await geodesicBufferOperatorRef.current.load()
        }
        bufferedGraphicRef.current.geometry = geodesicBufferOperatorRef.current.execute(
          geometry as __esri.GeometryUnion,
          bufferDistanceRef.current,
          {
            unit: lodash.kebabCase(bufferUnitRef.current) as any
          }
        )
      } else {
        if (!bufferOperatorRef.current) {
          bufferOperatorRef.current = await loadArcGISJSAPIModule('esri/geometry/operators/bufferOperator')
        }
        bufferedGraphicRef.current.geometry = bufferOperatorRef.current.execute(
          geometry as __esri.GeometryUnion,
          bufferDistanceRef.current,
          {
            unit: lodash.kebabCase(bufferUnitRef.current) as any
          }
        )
      }
    }
  }, [enableBuffer])

  React.useEffect(() => {
    if (queryTaskContext.resetSymbol && queryTaskContext.resetSymbol !== resetSymbolRef.current) {
      resetSymbolRef.current = queryTaskContext.resetSymbol
      getLayerFunRef.current && getLayerFunRef.current().removeAll()
      onGeometryChange(null)
    }
  }, [queryTaskContext.resetSymbol, onGeometryChange])

  const handleJimuMapViewChanged = React.useCallback((jimuMapView: JimuMapView) => {
    // clear drawing graphics before switching map view
    const layer = getLayerFunRef.current && getLayerFunRef.current()
    if (layer) {
      layer.removeAll()
      onGeometryChange(null)
    }
    setJimuMapView(jimuMapView?.view != null ? jimuMapView : null)
  }, [onGeometryChange])

  const handleBufferChange = React.useCallback((distance, unit) => {
    bufferDistanceRef.current = distance
    bufferUnitRef.current = unit
    applyBufferEffect()
    onBufferChange(distance, unit)
  }, [onBufferChange, applyBufferEffect])

  const handleDrawEnd = React.useCallback((graphic, getLayerFun, clearAfterApply) => {
    getLayerFunRef.current = getLayerFun
    const layer = getLayerFunRef.current && getLayerFunRef.current()
    // it's possible that the geometry is the same as the previous one, only the clearAfterApply is changed.
    if (geometryRef.current !== graphic?.geometry) {
      geometryRef.current = graphic?.geometry
      applyBufferEffect().then(() => {
        if (bufferedGraphicRef.current.geometry) {
          layer?.add(bufferedGraphicRef.current)
        }
      })
    }
    onGeometryChange(graphic?.geometry, layer, graphic, clearAfterApply)
  }, [onGeometryChange, applyBufferEffect])

  return (
    <React.Fragment>
      {
        mapWidgetIds?.map((mapWidgetId, x) => (
          <JimuMapViewComponent
            key={x} useMapWidgetId={mapWidgetId} onActiveViewChange={handleJimuMapViewChanged}
          />
        ))
      }
      {jimuMapView?.view && (
        <React.Fragment>
          <InteractiveDraw
            jimuMapView={jimuMapView}
            widgetId={widgetId}
            toolTypes={createToolTypes}
            onDrawEnd={handleDrawEnd}
          />
          {enableBuffer && (
            <div role='group' className='title3' aria-label={getI18nMessage('theBufferDistance')} css={css`margin-top: 0.75rem;`}>
              <div className='text-truncate'>{getI18nMessage('theBufferDistance')}</div>
              <div className='d-flex mt-1'>
                <BufferInput distance={bufferDistance} unit={bufferUnit} onBufferChange={handleBufferChange}/>
              </div>
            </div>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
