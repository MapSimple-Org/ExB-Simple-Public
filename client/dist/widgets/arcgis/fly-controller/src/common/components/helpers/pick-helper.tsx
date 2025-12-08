/** @jsx jsx */
import { React, jsx, type IntlShape, utils as jimuUtils } from 'jimu-core'
import * as utils from '../../utils/utils'
import type { JimuMapView } from 'jimu-arcgis'
import { Button } from 'jimu-ui'
import type { DrawingMode } from '../graphic-interaction-manager'
import { GraphicsInfo } from '../../constraints'
import nls from '../../../runtime/translations/default'
// resources
import { SelectClickOutlined } from 'jimu-icons/outlined/editor/select-click'

export interface PickRes {
  graphicsInfo: GraphicsInfo
  cameraInfo: __esri.Camera
  // info for ds query
  hitPointWithZ: __esri.Point
  pickMode: 'point' | 'polyline'
}
interface Props {
  jimuMapView: JimuMapView
  intl: IntlShape

  isDrawHelperLoaded: boolean
  drawingMode: DrawingMode
  isPicking: boolean
  isPlaying: boolean

  onPicked: (res: PickRes) => void
  onPickingStateChanged: (isPicking: boolean) => void
  onHoverPicking: (graphics: __esri.Graphic[]) => void
  hoveredGraphic: __esri.Graphic
}

export default class PickHelper extends React.PureComponent<Props/*, States */> {
  pointerMoveEvent: __esri.Handle
  pointerDownEvent: __esri.Handle

  constructor (props) {
    super(props)
    this.state = {
      isPicking: false
    }

    // events
    this._clearEvents()
    this._resetEvents()
  }

  componentWillUnmount (): void {
    this._clearEvents()
  }

  _clearEvents (): void {
    if (utils.isDefined(this.pointerMoveEvent)) {
      this.pointerMoveEvent.remove()
      this.pointerMoveEvent = null
    }
    if (utils.isDefined(this.pointerDownEvent)) {
      this.pointerDownEvent.remove()
      this.pointerDownEvent = null
    }
  }

  _resetEvents (): void {
    this.pointerMoveEvent = this.props.jimuMapView?.view.on('pointer-move', this.pointerMoveHandler)
    this.pointerDownEvent = this.props.jimuMapView?.view.on('pointer-down', this.pointerClickHandler)
  }

  componentDidUpdate (prevProps: Props/*, prevState: States */): void {
    if (this.props.jimuMapView !== prevProps.jimuMapView) {
      this._clearEvents()
      this._resetEvents()
    }
  }

  render (): React.ReactElement {
    const isDisable = (!this.props.isDrawHelperLoaded) || this.props.isPlaying// || (DrawingMode.Null !== this.props.drawingMode);
    const pickTips = this.props.intl.formatMessage({ id: 'triggerSelectFeature', defaultMessage: nls.triggerSelectFeature })

    return (
      <Button icon onClick={(evt) => { this.onPickBtnClick() }} disabled={isDisable}
        active={this.props.isPicking}
        aria-pressed={this.props.isPicking}

        title={pickTips} aria-label={pickTips}
        className='btns pick-btn'
        variant={this.props.isPicking ? 'contained' : 'text'}
        color={this.props.isPicking ? 'inherit' : 'default'}
      >
        <SelectClickOutlined />
      </Button>
    )
  }

  onPickBtnClick = (): void => {
    this.props.onPickingStateChanged(!this.props.isPicking)
  }

  // insert attributes.jimuDrawId like jimuDraw
  insertAttrId = (graphic: __esri.Graphic): __esri.Graphic => {
    if (utils.isDefined(graphic)) {
      if (!utils.isDefined(graphic.attributes)) {
        graphic.attributes = {}
      }

      if (utils.isDefined(graphic.attributes.id) && !utils.isDefined(graphic.attributes.jimuDrawId)) {
        graphic.attributes.jimuDrawId = graphic.attributes.id // for 10.1 update: have attributes.id & no attributes.jimuDrawId
      } else if (!utils.isDefined(graphic.attributes.jimuDrawId)) {
        graphic.attributes.jimuDrawId = jimuUtils.getUUID()
      }
    }
    return graphic
  }

  // events
  private readonly pointerMoveHandler = (event): void => {
    if (this.props.isPicking) {
      this.props.jimuMapView?.view.hitTest(event).then((response: __esri.SceneViewHitTestResult) => {
        const graphicResults = response.results.filter(r => r.type === 'graphic')
        if (graphicResults?.length > 0) {
          const graphic = graphicResults[0].graphic

          this.props.onHoverPicking([graphic])
        }
      })
    }
  }

  private readonly pointerClickHandler = (event): void => {
    if (this.props.isPicking) {
      this.props.jimuMapView?.view.hitTest(event).then((res: __esri.SceneViewHitTestResult) => { this.clickGraphicsByPick(res, event) })
    }
  }

  private readonly clickGraphicsByPick = (response: __esri.SceneViewHitTestResult, event): void => {
    this.props.onPickingStateChanged(false)// stop hover picking

    const initCameraInfo = (this.props.jimuMapView?.view as __esri.SceneView).camera.clone().toJSON()
    const results = response.results
    if (results?.length > 0) {
      event.stopPropagation()
      const graphicResults = results.filter(r => r.type === 'graphic')
      let graphic = graphicResults[0].graphic
      graphic = this.insertAttrId(graphic)

      const geometry = graphic.geometry
      if (!geometry) {
        return
      }

      if (geometry.type === 'polyline') {
        // if (jimuUtils.isTouchDevice()) {
        this.pickAndClickLine(graphic, initCameraInfo)// mobile
        // } else if (utils.isPolylineEquals((geometry as __esri.Polyline), (this.props.hoveredGraphic?.geometry as __esri.Polyline))) {
        //  this.pickAndClickLine(graphic, initCameraInfo)// desktop
        // }
      } else if (geometry.type === 'point') {
        // const lastHit = utils.getHitPointOnTheGround(response);
        let hitPointWithZ
        if (!geometry.hasZ) {
          hitPointWithZ = utils.queryGeometryElevInfo(geometry, this.props.jimuMapView?.view as __esri.SceneView)
        }

        // if (jimuUtils.isTouchDevice()) {
        this.pickAndClickPoint(graphic, initCameraInfo, hitPointWithZ)// mobile
        // } else if ((geometry as __esri.Point).equals(this.props.hoveredGraphic?.geometry as __esri.Point)) {
        //  this.pickAndClickPoint(graphic, initCameraInfo, hitPointWithZ)// desktop
        // }
      }
    }
  }

  pickAndClickPoint = (graphic: __esri.Graphic, cameraInfo: __esri.Camera, hitPointWithZ: __esri.Point): void => {
    const graphicsInfo = new GraphicsInfo({ graphics: [graphic], isPicked: true })
    this.props.onPicked({ graphicsInfo: graphicsInfo, cameraInfo: cameraInfo, hitPointWithZ: hitPointWithZ, pickMode: 'point' })
  }

  pickAndClickLine = (graphic: __esri.Graphic, cameraInfo: __esri.Camera): void => {
    const graphicsInfo = new GraphicsInfo({ graphics: [graphic], isPicked: true })
    this.props.onPicked({ graphicsInfo: graphicsInfo, cameraInfo: cameraInfo, hitPointWithZ: null, pickMode: 'polyline' })
  }
}
