/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis'
//import { Draw, DrawToolClass } from 'jimu-ui/advanced/map'
import { JimuDraw, JimuDrawCreationMode, DrawingElevationMode3D, type JimuDrawCreatedDescriptor, type DrawingUpdatedDescriptor } from 'jimu-ui/advanced/map'
import type { LayersGroup } from './draw-layers-group'
import { DrawingMode } from '../graphic-interaction-manager'
import { GraphicsInfo, DefaultSymbols } from '../../constraints'
import type { LiveviewSettingState } from '../../fly-facade/controllers/common/liveview-setting'
import * as utils from '../../utils/utils'

interface Props {
  jimuMapView: JimuMapView
  widgetId: string

  layersGroup: LayersGroup

  onDrawHelperCreated: (ref: DrawHelper) => void
  onDrawingModeChanged: (drawingMode: DrawingMode) => void

  onDrawStart: () => void
  onDrawEnd: (drawRes: DrawRes) => void
  onDrawFinish: (drawRes: DrawRes) => void
  onDrawCancel: () => void
}
interface States {
  apiLoaded: boolean
}

export interface DrawRes {
  graphicsInfo: GraphicsInfo
  cameraInfo: __esri.Camera
  drawingMode: DrawingMode
}

// inner interface for jslint
interface _LineGeometry3DLike {
  z?: number
  hasZ?: boolean
  paths?: number[][]
}

// let PointType;
export default class DrawHelper extends React.PureComponent<Props, States> {
  Graphic: typeof __esri.Graphic = null
  Geometry: typeof __esri.Geometry = null
  Point: typeof __esri.Point = null
  defaultSymbols: DefaultSymbols

  sceneView: __esri.SceneView
  webMercatorUtils: __esri.webMercatorUtils

  drawingMode: DrawingMode
  jimuDrawToolsRef: JimuDrawCreatedDescriptor

  // material
  materials: {
    markerColor: string | any[]
    outlineColor: string | any[]
    markerSize: number
    startPtMarker: __esri.PointSymbol3D
    endPtMarker: __esri.PointSymbol3D
    lineColor: string | any[]
    lineSymbol: any
  }

  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false
    }

    this.drawingMode = DrawingMode.Null
  }

  componentDidMount (): void {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules([
        'esri/Graphic',
        'esri/geometry/Geometry',
        'esri/geometry/Point',
        'esri/geometry/support/webMercatorUtils'
        // 'esri/symbols/support/jsonUtils'
      ]).then(async modules => {
        [this.Graphic, this.Geometry, this.Point, this.webMercatorUtils] = modules

        this.defaultSymbols = await new DefaultSymbols().setup()

        this.materials = {
          markerColor: [13, 137, 255], // blue
          markerSize: 10,
          outlineColor: '[128, 128, 128, 0.8]',
          startPtMarker: this.defaultSymbols.getDefaultPointSymbol([54, 213, 22]/* { color: [54,213,22], vOffset: 10 } */), // green
          endPtMarker: this.defaultSymbols.getDefaultPointSymbol([255, 65, 89]/* { color: [255,65,89], vOffset: 10 } */), // red
          lineColor: [13, 137, 255, 0.5],
          lineSymbol: this.defaultSymbols.getDefaultLineSymbol([13, 137, 255])
        }

        this.setState({ apiLoaded: true })
      })
    }

    this.sceneView = this.props.jimuMapView?.view as __esri.SceneView // 3d scene
  }

  componentDidUpdate (prevProps: Props, prevState: States): void {
    if (this.props.jimuMapView !== prevProps.jimuMapView) {
      this.removeAll()
      this.sceneView = this.props.jimuMapView?.view as __esri.SceneView
    }
  }

  render (): React.ReactElement {
    return this.state.apiLoaded && this.props.jimuMapView &&
      this.props.layersGroup.layerOnTheGround && this.props.layersGroup.layerRelativeToGround &&

      <div style={{ display: 'none' }}>
        <JimuDraw
          jimuMapView={this.props.jimuMapView}
          operatorWidgetId={this.props.widgetId}
          onJimuDrawCreated={this.handleDrawToolCreated}
          onToolsActivated={this.handleDrawToolsActivated}
          onDrawingStarted={this.handleDrawStart}
          onDrawingFinished={this.handleDrawEnd}
          onDrawingCanceled={this.handleDrawCancel}
          onDrawingUpdated={this.handleDrawFinish}
          // visibleElements
          // layer={this.props.layersGroup.layerRelativeToGround}
          drawingOptions={{
            creationMode: JimuDrawCreationMode.Update,
            updateOnGraphicClick: false,
            defaultCreateOptions: { hasZ: true },
            defaultUpdateOptions: { enableZ: false },
            drawingElevationMode3D: DrawingElevationMode3D.RelativeToGround
          }}
          //isActive={false}
          disableSymbolSelector
          // default symbols for API-4.21
          defaultSymbols={{
            pointSymbol: this.materials.startPtMarker,
            polylineSymbol: this.materials.lineSymbol
          }}
        />
      </div>
  }

  handleDrawToolCreated = async (jimuDrawToolsRef: JimuDrawCreatedDescriptor): Promise<any> => {
    this.jimuDrawToolsRef = jimuDrawToolsRef

    await this.jimuDrawToolsRef.completeOperation()
    this.props.onDrawHelperCreated(this)
  }

  handleDrawToolsActivated = (drawingMode: DrawingMode): void => {
    if (drawingMode !== null) {
      this._drawingModeChange(drawingMode)
    } // if null, will call onDrawCancel()
  }

  handleDrawCancel = (): void => {
    this._drawingModeChange(DrawingMode.Null)
    this.props.onDrawCancel()
  }

  _drawingModeChange = (drawingMode: DrawingMode): void => {
    this.drawingMode = drawingMode
    this.props.onDrawingModeChanged(drawingMode)
  }

  handleDrawStart = (): void => {
    if (typeof this.props.onDrawStart === 'function') {
      this.props.onDrawStart()
    }
  }

  // timeing: after draw, before edit
  handleDrawEnd = (graphic: __esri.Graphic): void => {
    // this._drawingModeChange(null);
  }

  // return jsObjects
  handleDrawFinish = ({ type, graphics }: DrawingUpdatedDescriptor): void => {
    if (type === 'deleted' || type === 'modified') {
      return // continue the workflow
    }

    // clean drawing-layer
    if (this.jimuDrawToolsRef.sketch.layer && (typeof (this.jimuDrawToolsRef.sketch.layer as __esri.GraphicsLayer).removeAll === 'function')) {
      (this.jimuDrawToolsRef.sketch.layer as __esri.GraphicsLayer).removeAll()
    }

    if (type === 'aborted') {
      this.handleDrawCancel(); return // aborted editing (after drawn)
    }

    const initCameraInfo = this.sceneView?.camera?.clone().toJSON()
    const graphic = graphics && graphics[0]
    const graphicsInfo = new GraphicsInfo({ graphics: null, isPicked: false })

    if (this.drawingMode === DrawingMode.Point) {
      // for hittest buildings with elevations, such as bridges: #6433
      if ((graphic.geometry as _LineGeometry3DLike).z) {
        (graphic.geometry as _LineGeometry3DLike).z = 0// the point on the ground
      }

      graphicsInfo.setGraphics(this.doDrawPoint(graphic))
      this.props.onDrawFinish({ graphicsInfo: graphicsInfo, cameraInfo: initCameraInfo, drawingMode: this.drawingMode })// just on the ground
      this._drawingModeChange(DrawingMode.Null)
    } if (this.drawingMode === DrawingMode.Line) {
      graphicsInfo.setGraphics(this.doDrawLine(graphic))
      this.props.onDrawFinish({ graphicsInfo: graphicsInfo, cameraInfo: initCameraInfo, drawingMode: this.drawingMode })
      this._drawingModeChange(DrawingMode.Null)
    }
  }

  getGraphicsByAttrId = (attrId: string): __esri.Graphic[] => {
    let res = []
    const mainGraphic = this.props.layersGroup.layerOnTheGround.graphics.toArray().filter(graphics => (graphics.attributes.jimuDrawId === attrId))
    if (mainGraphic.length > 0) {
      // 1. clamp ground mode
      res.push(mainGraphic[0])
      res = res.concat(this.props.layersGroup.layerRelativeToGround.graphics.toArray().filter(graphics => (graphics.attributes.jimuDrawId === attrId)))
      return res
    } else {
      // 2. on the ground mode
      return this.props.layersGroup.layerRelativeToGround.graphics.toArray().filter(graphics => (graphics.attributes.jimuDrawId === attrId))
    }
  }

  // redraw because jsapi NOT support change geometry
  // (if the graphic has already been added to the map, this change is not reflected in the map)
  _removeGraphicsByAttrId = (rawGraphic: __esri.Graphic): void => {
    let duplicatedGraphics = this.props.layersGroup.layerRelativeToGround.graphics.toArray().filter(graphics => (graphics.attributes.jimuDrawId === rawGraphic.attributes.jimuDrawId))
    if (duplicatedGraphics.length > 0) {
      this.props.layersGroup.layerRelativeToGround.removeMany(duplicatedGraphics)
    }

    duplicatedGraphics = this.props.layersGroup.layerOnTheGround.graphics.toArray().filter(graphics => (graphics.attributes.jimuDrawId === rawGraphic.attributes.jimuDrawId))
    if (duplicatedGraphics.length > 0) {
      this.props.layersGroup.layerOnTheGround.removeMany(duplicatedGraphics)
    }
  }

  private readonly setGeoZ = (graphic: __esri.Graphic, alt: number): void => {
    // let z = (graphic.geometry as _LineGeometry3DLike).z;
    // if (false === graphic.geometry.hasZ) {
    //   z = 0;
    // }
    (graphic.geometry as _LineGeometry3DLike).z = alt// z + alt;
  }

  // update for JimuDraw: 10.2
  private readonly _updateIds = (graphic: __esri.Graphic): __esri.Graphic => {
    if ((typeof graphic.attributes?.id !== 'undefined') && (typeof graphic.attributes.jimuDrawId === 'undefined')) { // records before 10.1
      graphic.attributes.jimuDrawId = graphic.attributes?.id // finally use jimuDrawId
    }

    return graphic
  }

  // point
  private readonly doDrawPoint = (graphic: __esri.Graphic): __esri.Graphic[] => {
    const copyedGraphic = graphic.clone()
    this._removeGraphicsByAttrId(graphic)

    this._updateIds(copyedGraphic)

    copyedGraphic.layer = this.props.layersGroup.layerRelativeToGround
    this.props.layersGroup.layerRelativeToGround.addMany([copyedGraphic])
    return [copyedGraphic]
  }

  // line
  private readonly doDrawLine = (graphic: __esri.Graphic): __esri.Graphic[] => {
    const copyedLineGraphic = graphic.clone()
    this._removeGraphicsByAttrId(graphic)

    this._updateIds(copyedLineGraphic)

    // 1.line
    copyedLineGraphic.layer = this.props.layersGroup.layerOnTheGround
    this.props.layersGroup.layerOnTheGround.addMany([copyedLineGraphic])
    // 2.start/end point
    const startEndPoints = this.genStartEndPoint(copyedLineGraphic)
    this.props.layersGroup.layerRelativeToGround.addMany(startEndPoints)

    let res = []
    res.push(copyedLineGraphic)
    res = res.concat(startEndPoints)
    return res
  }

  private readonly genStartEndPoint = (graphic: __esri.Graphic): __esri.Graphic[] => {
    const path = (graphic.geometry as __esri.Polyline).paths[0]
    const startPt = this.genExtraPoint(path[0], graphic, this.materials.startPtMarker)
    const endPt = this.genExtraPoint(path[path.length - 1], graphic, this.materials.endPtMarker)

    return [startPt, endPt]
  }

  private readonly genExtraPoint = (p, graphic: __esri.Graphic, symbol: __esri.PointSymbol3D): __esri.Graphic => {
    let pt = p
    if (this.sceneView.viewingMode === 'local') {
      pt = new this.Point({ x: pt[0], y: pt[1], z: 0/* pt[2] */, spatialReference: this.sceneView.spatialReference }) // z=0 means on the ground: #6433
    } else {
      // pt = utils._xyToLngLat(pt[0], pt[1]);
      pt = this.webMercatorUtils.xyToLngLat(pt[0], pt[1])
      pt = new this.Point({ x: pt[0], y: pt[1], z: pt[2] })
      // pt = this.queryGeometryElevInfo(pt);
    }

    pt = new this.Graphic({
      geometry: pt,
      symbol: symbol,
      layer: this.props.layersGroup.layerRelativeToGround,
      attributes: {
        jimuDrawId: graphic.attributes.jimuDrawId// same jimuDrawId as graphic
      }
    })
    return pt
  }

  // updateLine altitude
  private readonly updateLineByAltitude = (graphic: __esri.Graphic, alt: number): __esri.Graphic[] => {
    const isClampGroundMode = (alt === 0)

    const graphics = this.getGraphicsByAttrId(graphic.attributes.jimuDrawId)
    const lineGraphic = graphics[0].clone()
    const startPtGraphic = graphics[1].clone()
    const endPtGraphic = graphics[2].clone()
    // set layer prop
    // lineGraphic.layer = graphics[0].layer
    // startPtGraphic.layer = graphics[0].layer
    // endPtGraphic.layer = graphics[0].layer

    // 0. remove
    this._removeGraphicsByAttrId(lineGraphic)

    // 1. main line
    if (isClampGroundMode) {
      lineGraphic.layer = this.props.layersGroup.layerOnTheGround
      this.props.layersGroup.layerOnTheGround.addMany([lineGraphic])
    } else {
      lineGraphic.layer = this.props.layersGroup.layerRelativeToGround
      const lineGeometry = lineGraphic.geometry as _LineGeometry3DLike
      lineGeometry.hasZ = true
      if (utils.isDefined(lineGeometry.paths?.length)) {
        lineGeometry.paths.forEach((path) => {
          path.forEach((data) => {
            data[2] = alt// for relative-to-ground mode
            // p[2] = p[2] + alt;
          })
        })
        // update wall, graphics-info.updateWallSymbolByAlt() ,#6159
        this.props.layersGroup.layerRelativeToGround.addMany([lineGraphic])
      }
    }

    // 2. start/end points
    startPtGraphic.layer = this.props.layersGroup.layerRelativeToGround
    endPtGraphic.layer = this.props.layersGroup.layerRelativeToGround
    this.setGeoZ(startPtGraphic, alt)
    this.setGeoZ(endPtGraphic, alt)
    this.props.layersGroup.layerRelativeToGround.addMany([startPtGraphic, endPtGraphic])

    return [lineGraphic, startPtGraphic, endPtGraphic]
  }

  // for trigger
  startDrawing = (mode: DrawingMode): void => {
    if (typeof this.jimuDrawToolsRef?.sketch.cancel === 'function') {
      this.jimuDrawToolsRef?.sketch.cancel()
    }

    if (DrawingMode.Point === mode) {
      this.jimuDrawToolsRef.sketch.viewModel.pointSymbol = this.defaultSymbols.getDefaultPointSymbol([54, 213, 22]/* { color: '#36D516', vOffset: 5 } */)
      this.jimuDrawToolsRef?.sketch.create(mode)
    }
    if (DrawingMode.Line === mode) {
      this.jimuDrawToolsRef.sketch.viewModel.polylineSymbol = this.defaultSymbols.getDefaultLineSymbol([13, 137, 255])
      this.jimuDrawToolsRef?.sketch.create(mode)
    }
  }

  cancelDrawing = (): void => {
    this.handleDrawCancel()
    if (typeof this.jimuDrawToolsRef?.sketch.cancel === 'function' && utils.isDefined(this.jimuDrawToolsRef?.sketch.viewModel)) {
      this.jimuDrawToolsRef?.sketch.cancel()
    }
  }

  // for cb
  createOrUpdateGraphic = (graphic: __esri.Graphic, settingState: LiveviewSettingState, isPicked: boolean): __esri.Graphic[] => {
    if (!(graphic.geometry as any).paths) {
      graphic.symbol = this.materials.startPtMarker.toJSON()
    } else {
      graphic.symbol = this.materials.lineSymbol.toJSON()
    }

    const _graphic = (typeof graphic.clone === 'function') ? graphic.clone() : this.Graphic.fromJSON(graphic)

    if (_graphic.geometry.type === 'point') {
      return this.doDrawPoint(_graphic)// only one point
    } else if (_graphic.geometry.type === 'polyline') {
      // line
      if (isPicked) {
        if (_graphic.layer?.id !== this.props.layersGroup.layerRelativeToGround.id || _graphic.layer?.id !== this.props.layersGroup.layerOnTheGround.id) { // for others elevationInfo
          _graphic.geometry = utils.queryGeometryElevInfo(_graphic.geometry as __esri.Polyline, this.sceneView)
        }
      }

      let res = this.doDrawLine(_graphic)
      if (utils.isDefined(settingState?.fixAltitude) && !isNaN(settingState?.fixAltitude)) {
        res = this.updateLineByAltitude(_graphic, settingState?.fixAltitude)
      }
      return res
    }
  }

  removeGraphics = (graphics: __esri.Graphic[]): void => {
    if (utils.isDefined(graphics)) {
      this.props.layersGroup.layerRelativeToGround.removeMany(graphics)
      this.props.layersGroup.layerOnTheGround.removeMany(graphics)
    }
  }

  removeAll = (): void => {
    // console.log('draw-tools removeAll()')
    this.props.layersGroup.layerRelativeToGround?.removeAll()
    this.props.layersGroup.layerOnTheGround?.removeAll()
  }

  // for picked line
  drawPickedLineStartEndPoints = (graphic: __esri.Graphic): __esri.Graphic[] => {
    return this.doDrawLine(graphic)
  }

  removePickedLineStartEndPoints = (graphic: __esri.Graphic): void => {
    this._removeGraphicsByAttrId(graphic)
  }
}
