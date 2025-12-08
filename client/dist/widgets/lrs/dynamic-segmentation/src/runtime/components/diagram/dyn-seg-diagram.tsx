/* eslint-disable react-hooks/exhaustive-deps */
/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import type {
  DataSource,
  ImmutableArray,
  ImmutableObject
} from 'jimu-core'
import type { SubtypeLayers, MeasureRange, Track, TrackRecord, DynSegFieldInfo } from '../../../config'
import { Sidebar } from './sidebar/sidebar'
import { Sld } from './sld/sld'
import { useContainerDimensions } from './resizer'
import { SLD_INACTIVE_HEIGHT, SLD_TRACK_HEIGHT } from '../../../constants'
import { Header } from './header/header'
import { Marker } from './sld/marker'
import { isDefined, type MeasureToGeometryResponse, queryRouteId, type LrsLayer, type NetworkInfo } from 'widgets/shared-code/lrs'
import { getMFromX, getXFromM, getZoomFromExtent } from '../../utils/diagram-utils'
import { EditPopup } from './edit-popup/edit-popup'
import { useDynSegRuntimeState } from '../../state'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import { addGraphicsToMap, getGeometryToMeasure, getGeometryToMeasureSingle, zoomToGeometry } from '../../utils/map-utils'
import { geometryUtils, type JimuMapView } from 'jimu-arcgis'
import { debounce, round } from 'lodash-es'
import * as disjointOperator from "esri/geometry/operators/disjointOperator"
import * as clipOperator from "esri/geometry/operators/clipOperator"
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js"
import Graphic from 'esri/Graphic'
import Point from 'esri/geometry/Point'

export interface DynSegDiagramProps {
  widgetId: string
  trackMap: Map<string, Track>
  allowEditing: boolean
  measureRange: MeasureRange
  defaultRange: number
  featureLayer: __esri.FeatureLayer
  subtypeLayers: SubtypeLayers[]
  networkInfo: ImmutableObject<NetworkInfo>
  networkDS: DataSource
  routeId: string
  temporalViewDate: Date
  lrsLayers: ImmutableArray<LrsLayer>
  showEventStatistics: boolean
  jimuMapView: JimuMapView
}

export function DynSegDiagram (props: DynSegDiagramProps) {
  const { jimuMapView, widgetId, allowEditing, trackMap, measureRange, defaultRange, featureLayer, subtypeLayers, networkInfo,
    networkDS, lrsLayers, showEventStatistics, routeId, temporalViewDate } = props
  const [sidebarWidth, setSidebarWidth] = React.useState(200)
  const [isResizing, setIsResizing] = React.useState(false)
  const [isScrolling, setIsScrolling] = React.useState(false)
  const [zoom, setZoom] = React.useState(0)
  const [scrollPos, setScrollPos] = React.useState(0)
  const ref = React.useRef(null)
  const sldRef = React.useRef(null)
  const sidebarRef = React.useRef(null)
  const { refWidth } = useContainerDimensions(ref)
  const mouseCoords = React.useRef({ startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 })
  const [currentTrackMap, setCurrentTrackMap] = React.useState(trackMap)
  const [rulerX, setRulerX] = React.useState(0)
  const [rulerM, setRulerM] = React.useState(NaN)
  const [snapTolearnce, setSnapTolerance] = React.useState<number>(0)
  const [showRulerPopup, setShowRulerPopup] = React.useState(false)
  const [showRulerHover, setShowRulerHover] = React.useState(false)
  const [trackToEdit, setTrackToEdit] = React.useState<Track>(null)
  const [trackRecordToEdit, setTrackRecordToEdit] = React.useState<TrackRecord>(null)
  const [trackFieldInfos, setTrackFieldInfos] = React.useState<DynSegFieldInfo[]>([])
  const { syncToMap } = useDynSegRuntimeState()
  const routeGeometryRef = React.useRef<any>(null)
  const [fromExtent, setExtentFrom] = React.useState<number>(NaN)
  const [toExtent, setExtentTo] = React.useState<number>(NaN)
  const refWidthWatch = React.useRef<number>(0)
  const refZoomWatch = React.useRef<number>(0)
  const isInitialLoad = React.useRef<boolean>(false)
  const triggerSource = React.useRef<'extent' | 'range' | 'ignore' | null>(null)

  React.useEffect(() => {
    setCurrentTrackMap(trackMap)
  }, [trackMap])

  React.useEffect(() => {
    const rangeDiff = measureRange.to - measureRange.from
    const displayRatio = rangeDiff / defaultRange
    if (displayRatio < 1) {
      setZoom(1)
    } else {
      setZoom(displayRatio)
    }
  }, [defaultRange, measureRange])

  //#region sidebar events
  const handleResizeMouseDown = (event) => {
    setIsResizing(true)
    event.preventDefault()
  }

  const handleZoomChange = React.useCallback((zoom: number) => {
    if (!triggerSource.current) triggerSource.current = 'range'
    setZoom(zoom)
  },[])

  const handleOnNavForwardOrBack = (forward: boolean) => {
    if (!sldRef.current) return
    if (!triggerSource.current) triggerSource.current = 'range'
    const slider = sldRef.current
    const scrollLeft = slider.scrollLeft
    const clientWidth = slider.clientWidth
    const scrollStep = clientWidth
    if (forward) {
      slider.scrollLeft = scrollLeft + scrollStep
    } else {
      slider.scrollLeft = scrollLeft - scrollStep
    }
  }

  const handleOnNavStartOrEnd = (end: boolean) => {
    if (!sldRef.current) return
    if (!triggerSource.current) triggerSource.current = 'range'
    const slider = sldRef.current
    if (end) {
      slider.scrollLeft = slider.scrollWidth
    } else {
      slider.scrollLeft = 0
    }
  }

  const handleTrackMapChanged = (trackMap: Map<string, Track>) => {
    setCurrentTrackMap(trackMap)
  }
  //#endregion

  //#region sld events
  const handleSldMouseDown = (event) => {
    if (!sldRef.current) return
    const horizontalSlider = sldRef.current
    const verticalSlider = sidebarRef.current
    const startX = event.pageX - horizontalSlider.offsetLeft
    const startY = event.pageY - verticalSlider.offsetTop
    const scrollLeft = horizontalSlider.scrollLeft
    const scrollTop = verticalSlider.scrollTop
    mouseCoords.current = { startX, startY, scrollLeft, scrollTop }
    setIsScrolling(true)
    document.body.style.cursor = 'grabbing'
  }

  const handleMouseUp = (event) => {
    setIsResizing(false)
    if (isScrolling) {
      setIsScrolling(false)
      if (!sldRef.current) return
      document.body.style.cursor = 'default'
    }
  }

  const handleMouseMove = (event) => {
    if (isResizing && !isScrolling) {
      if (event.pageX < 140) return
      setSidebarWidth(event.pageX)
    }
    if (!isResizing && isScrolling && sldRef.current) {
      event.preventDefault()
      const horizontalSlider = sldRef.current
      const verticalSlider = sidebarRef.current
      const x = event.pageX - horizontalSlider.offsetLeft
      const y = event.pageY - verticalSlider.offsetTop
      const walkX = (x - mouseCoords.current.startX) * 1.5
      const walkY = (y - mouseCoords.current.startY) * 1.5
      horizontalSlider.scrollLeft = mouseCoords.current.scrollLeft - walkX
      verticalSlider.scrollTop = mouseCoords.current.scrollTop - walkY
    }
  }

  const handleSideBarScroll = (e) => {
    if (sldRef.current) {
      sldRef.current.scrollTop = e.target.scrollTop
    }
  }

  const handleSldScroll = (e) => {
    if (!triggerSource.current) triggerSource.current = 'range'
    setScrollPos(e.target.scrollLeft)
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = e.target.scrollTop
    }
    if (sldRef.current) {
      sldRef.current.scrollTop = e.target.scrollTop
    }
    setRulerM(getRulerM(rulerX))
  }

  //#endregion

  //#region ruler events
  const handleOnRulerClickOrHovered = (e, clicked: boolean, hover: boolean) => {
    const rulerX = getRulerX(e)
    const rulerM = getRulerM(rulerX)
    const snap = getRulerM(rulerX + 10)
    if (!isNaN(rulerX)) setRulerX(rulerX)
    if (!isNaN(rulerM)) setRulerM(rulerM)
    if (snap && rulerM) setSnapTolerance(snap - rulerM)
    setShowRulerPopup(clicked)
    setShowRulerHover(hover)
  }

  const handleOnRulerDoubleClick = async (e) => {
    if (!triggerSource.current) triggerSource.current = 'ignore'
    const rulerX = getRulerX(e)
    const m = getRulerM(rulerX)
    const results = await getGeometryToMeasureSingle(m, networkDS, networkInfo, routeId, temporalViewDate)
    const { locations, spatialReference } = results
    const geometry = locations[0].geometry
    geometry.spatialReference = spatialReference
    const point = new Point(geometry)
    return geometryUtils.projectToSpatialReference([point], jimuMapView.view.spatialReference)
    .then((geometryInSR) => {
      const graphicInSR = new Graphic({
        geometry: geometryInSR[0]
      })
      jimuMapView?.view.goTo({ center: graphicInSR })
    })
    .catch((error) => {
      console.log('error', error)
    })
  }

  const getRulerM = (x: number, newScrollPos?: number): number => {
    if (isNaN(x)) return NaN
    let currentScrollPos = scrollPos
    if (isDefined(newScrollPos)) {
      currentScrollPos = newScrollPos
    }
    let xOffset = currentScrollPos + (x - sidebarWidth)
    if (xOffset < 0) {
      // Should never be less than 0
      xOffset = 0
    }
    return getMFromX(xOffset, measureRange, getSldContentWidth)
  }

  const getRulerX = (e: any): number => {
    if (!e || !e.currentTarget) return NaN
    const target = e.currentTarget
    const bounds = target.getBoundingClientRect()
    return (e.clientX - bounds.left) + sidebarWidth
  }

  const getMaxPopupHeight = (): number => {
    if (!ref.current) return 0
    return ref.current.clientHeight - (ref.current.clientHeight * 0.3)
  }
  //#endregion

  const handleEditItem = (trackRecord: TrackRecord, track: Track, fieldInfos: DynSegFieldInfo[]) => {
    setTrackToEdit(track)
    setTrackRecordToEdit(trackRecord)
    setTrackFieldInfos(fieldInfos)
    setShowRulerPopup(false)
    setShowRulerHover(false)
  }

  const handleEditItemDone = () => {
    setTrackToEdit(null)
    setTrackRecordToEdit(null)
    setTrackFieldInfos(null)
  }

  const handleApplyEdit = (track: Track) => {
    const updatedTrackMap = new Map(currentTrackMap)
    updatedTrackMap.set(track.layerName, track)
    setCurrentTrackMap(updatedTrackMap)
  }

  const getScrollbarWidth = React.useMemo(() => {
    const el = document.createElement('div')
    el.style.cssText = 'overflow:scroll; visibility:hidden; position:absolute;'
    document.body.appendChild(el)
    const width = el.offsetWidth - el.clientWidth
    el.remove()
    return width
  }, [])

  const getSidebarDisplayHeight = React.useMemo(() => {
    let height = 0
    currentTrackMap.forEach((track) => {
      if (track.isActive) {
        height += SLD_TRACK_HEIGHT
      } else {
        height += SLD_INACTIVE_HEIGHT
      }
    })
    return height + getScrollbarWidth
  }, [getScrollbarWidth, currentTrackMap])

  const getSldDisplayHeight = React.useMemo(() => {
    let height = 0
    currentTrackMap.forEach((track) => {
      if (track.isActive) {
        height += SLD_TRACK_HEIGHT
      } else {
        height += SLD_INACTIVE_HEIGHT
      }
    })
    return height
  }, [currentTrackMap])

  const getSldWidth = React.useMemo((): number => {
    return refWidth - sidebarWidth - getScrollbarWidth
  }, [getScrollbarWidth, refWidth, sidebarWidth])

  const getSldContentWidth = React.useMemo((): number => {
    return (refWidth - sidebarWidth - getScrollbarWidth) * zoom
  }, [getScrollbarWidth, refWidth, sidebarWidth, zoom])

  //#region sld map interact
  React.useEffect(() => {
    refWidthWatch.current = refWidth
  }, [refWidth])

  React.useEffect(() => {
    refZoomWatch.current = zoom
  }, [zoom])


  React.useEffect(()=> {

    const extentHandle = reactiveUtils.watch(
      () => [jimuMapView.view.stationary, jimuMapView.view.extent],
      ([stationary, extent]) => {
        if (syncToMap && stationary) {
          if (!triggerSource.current && isInitialLoad.current) {
            triggerSource.current = 'extent'
            handleExtentChange(extent)
          } else {
            triggerSource.current = null
          }
        }
      }
    )

    return () => {
      extentHandle.remove()
    }
  }, [jimuMapView.view, syncToMap, measureRange])


  React.useEffect(() => {
    if (!isDefined(props.routeId) || !isDefined(props.networkDS)) return
    const spatialReference = props.jimuMapView.view?.spatialReference
    queryRouteId(props.routeId, networkInfo, props.networkDS, spatialReference)
    .then((routeDetails)=> {
      const geometry = routeDetails?.features[0]?.geometry
      routeGeometryRef.current = geometry
    })
    .catch((error)=> {
      console.error(error)
    })
  }, [props.routeId, props.networkDS, networkInfo])

  const debouncedRangeChange = React.useCallback (
    debounce(async (startRange: number, endRange: number) => {
      const results: MeasureToGeometryResponse = await getGeometryToMeasure(
        startRange,
        endRange,
        props.networkDS,
        networkInfo,
        props.routeId,
        props.temporalViewDate
      )
      if (results.locations.length === 0) return
      let graphicsLayer = jimuMapView.view.map.findLayerById('highlight-layer') as GraphicsLayer
      if (!graphicsLayer) {
        graphicsLayer = createGraphicLayer()
      } else {
        graphicsLayer.removeAll()
      }
      const geometry = results.locations[0].geometry
      if (geometry) {
        geometry.spatialReference = results?.spatialReference
        zoomToGeometry(results, jimuMapView, graphicsLayer, startRange, endRange)
      }
    }, 1000), [props.networkDS, networkInfo, props.routeId, props.temporalViewDate, jimuMapView])

  const createGraphicLayer = () => {
    removeGraphicLayer()
    const newGraphicLayer = new GraphicsLayer({ id: 'highlight-layer', listMode: 'hide' })
    jimuMapView.view.map.add(newGraphicLayer)
    return newGraphicLayer
  }

  const removeGraphicLayer = () => {
    const layer = props.jimuMapView.view.map.findLayerById('highlight-layer') as GraphicsLayer
    if (layer) {
      layer.removeAll()
      jimuMapView.view.map.remove(layer)
    }
  }

  const onExtentChange = React.useCallback((fromM: number, toM: number) => {
    // zoom, sidebarWidth, getScrollbarWidth, measureRange
    let newZoom = getZoomFromExtent(measureRange.from, measureRange.to, toM - fromM)
    if (newZoom < refZoomWatch.current) {
      if (newZoom < 1) {
        setZoom(1)
        newZoom = 1
      }
      else {
        setZoom(newZoom)
      }
    } else {
      setZoom(newZoom)
    }
    const sldContentWidth = (refWidthWatch.current - sidebarWidth - getScrollbarWidth) * newZoom
    const sldWidth = refWidthWatch.current - sidebarWidth - getScrollbarWidth

    let newScrollPos = getXFromM(fromM, measureRange, sldContentWidth)

    if (newScrollPos > (sldContentWidth-sldWidth)) {
      newScrollPos = sldContentWidth-sldWidth
    }

    sldRef.current.scrollLeft = newScrollPos
    setScrollPos(newScrollPos)
  }, [measureRange, refWidthWatch, sidebarWidth, getScrollbarWidth])

  const handleExtentChange = (extent) => {
    try {
      if (props.jimuMapView.view.stationary) {
        if (routeGeometryRef.current) {
          const isDisjointed = disjointOperator.execute(routeGeometryRef.current, extent)
          if (!isDisjointed) {
            const expandExtent = extent.expand(0.75)
            const polyline = clipOperator.execute(routeGeometryRef.current, expandExtent) as __esri.Polyline
            if (polyline) {
              const firstPoint = polyline.getPoint(0, 0)
              const lastIdx = polyline.paths[polyline.paths.length - 1].length - 1
              const lastPoint = polyline.getPoint(polyline.paths.length - 1, lastIdx)
              let highlightLayer = props.jimuMapView.view.map.findLayerById('highlight-layer') as GraphicsLayer
              if (!highlightLayer) highlightLayer = createGraphicLayer()
              highlightLayer.removeAll()
              const fromM = round(firstPoint.m, networkInfo.measurePrecision)
              const toM = round(lastPoint.m, networkInfo.measurePrecision)
              addGraphicsToMap(round(firstPoint.m, 3), round(lastPoint.m, 3), firstPoint, lastPoint, highlightLayer)
              onExtentChange(fromM, toM)
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  React.useEffect(() => {
    return () => {
      removeGraphicLayer()
    }
  }, [])

  React.useEffect(()=> {
    if (!syncToMap) {
      removeGraphicLayer()
      isInitialLoad.current = false
      triggerSource.current = null
      return
    }
    if (!isInitialLoad.current) {
      isInitialLoad.current = true
      debouncedRangeChange(fromExtent, toExtent)
      triggerSource.current = 'range'
    } else if (triggerSource.current === 'range') {
      debouncedRangeChange(fromExtent, toExtent)
    } else if (triggerSource.current === 'extent') {
      setTimeout(() => {
        triggerSource.current = null
      }, 0)
    } else if (triggerSource.current === 'ignore') {
      triggerSource.current = 'range'
    }
  }, [syncToMap, fromExtent, toExtent])

  React.useEffect(()=> {
    const xPos = scrollPos
    const fromM = getMFromX(xPos, measureRange, getSldContentWidth)
    const toM = getMFromX(xPos + getSldWidth, measureRange, getSldContentWidth)
    setExtentFrom(fromM)
    setExtentTo(toM)
  }, [getSldWidth, getSldContentWidth, measureRange, scrollPos])

  //#endregion
  return (
   <div ref={ref}
    className="dyn-seg-diagram-container h-100 w-100 d-flex"
    style={{ flexDirection: 'column' }}
    onMouseUp={handleMouseUp}
    onMouseMove={handleMouseMove}
    >
    <EditPopup
      widgetId={widgetId}
      track={trackToEdit}
      allowEditing={allowEditing}
      trackRecord={trackRecordToEdit}
      trackFieldInfos={trackFieldInfos}
      lrsLayers={lrsLayers}
      subtypeLayers={subtypeLayers}
      networkInfo={networkInfo}
      showEventStatistics={showEventStatistics}
      featureLayer={featureLayer}
      onApply={handleApplyEdit}
      onClose={handleEditItemDone}
    />
    <Marker
      x={rulerX}
      m={rulerM}
      snapTolerance={snapTolearnce}
      isPopupActive={showRulerPopup}
      isHoverActive={showRulerHover}
      trackMap={currentTrackMap}
      featureLayer={featureLayer}
      subtypeLayers={subtypeLayers}
      maxHeight={getMaxPopupHeight()}
      networkInfo={networkInfo}
      measureRange={measureRange}
      contentWidth={getSldContentWidth}
      sidebarWidth={sidebarWidth}
      scrollPos={scrollPos}
      networkDS={props.networkDS}
      routeId={props.routeId}
      temporalViewDate={props.temporalViewDate}
    />
    <Header
      sidebarWidth={sidebarWidth}
      bodyWidth={getSldWidth}
      contentWidth={getSldContentWidth}
      measureRange={measureRange}
      zoom={zoom}
      scrollPosition={scrollPos}
      onZoomChange={handleZoomChange}
      onNavForwardOrBack={handleOnNavForwardOrBack}
      onNavStartOrEnd={handleOnNavStartOrEnd}
      onClickOrHover={handleOnRulerClickOrHovered}
      onDoubleClick={handleOnRulerDoubleClick}
    />
    <div className='diagram-container h-100 w-100 d-flex' >
      <div
        ref={sidebarRef}
        className='sidebar-container h-100 d-flex'
        onScroll={handleSideBarScroll}>
        <Sidebar
          trackMap={currentTrackMap}
          width={sidebarWidth}
          height={getSidebarDisplayHeight}
          onTrackChanged={handleTrackMapChanged}/>
        <div
          className="sidebar-resizer d-flex"
          style={{ height: getSidebarDisplayHeight }}
          onMouseDown={handleResizeMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />
      </div>
      <div ref={sldRef}
        className='sld-container h-100'
        onScroll={handleSldScroll}
        onMouseDown={handleSldMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}>
        <Sld
          trackMap={currentTrackMap}
          containerWidth={getSldWidth}
          height={getSldDisplayHeight}
          contentWidth={getSldContentWidth}
          measureRange={measureRange}
          featureLayer={featureLayer}
          subtypeLayers={subtypeLayers}
          onItemClick={handleEditItem}/>
      </div>
    </div>
  </div>
  )
}
