/** @jsx jsx */
import { React, type IntlShape, jsx, type IMThemeVariables, css } from 'jimu-core'
import { Button } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import DrawLayersGroup, { type LayersGroup } from './helpers/draw-layers-group'
import DrawHelper, { type DrawRes } from './helpers/draw-helper'
import PickHelper, { type PickRes } from './helpers/pick-helper'
import HighlightHelper from './helpers/highlight-helper'
import PopupHelper from './helpers/popup-helper'
import type QueryHelper from '../fly-facade/helpers/query-helper'
import { FlyItemMode } from '../../config'
import SkeletonBtn from './loadings/skeleton-btn'
import { isDefined } from '../utils/utils'
import nls from '../../runtime/translations/default'
import { GraphicsInfo, type RecordConfig, type LiveviewSettingState } from '../constraints'
// resources
import { PinEsriOutlined } from 'jimu-icons/outlined/gis/pin-esri'
import { PolylineOutlined } from 'jimu-icons/outlined/gis/polyline'
import { ClearOutlined } from 'jimu-icons/outlined/editor/clear'

export enum DrawingMode {
  Null = 'null',
  Point = 'point',
  Line = 'polyline'
}// null means not in drawing
export enum ShowItem {
  Point = 'point',
  Line = 'polyline',
  Pick = 'pick',
  Clear = 'clear'
}

export interface InteractiveMode {
  drawingMode: DrawingMode
}

interface Props {
  // loading
  onRef: (ref: GraphicInteractionManager) => void

  widgetId: string
  intl: IntlShape
  theme: IMThemeVariables

  jimuMapView: JimuMapView
  showItems: ShowItem[]
  isDisabled: boolean

  isPlaying: boolean
  flyStyle: FlyItemMode

  // if focused a graphic, some btns enable/disable
  focusedGraphic?: __esri.Graphic
  onFocusedGraphicChanged: (graphic: __esri.Graphic) => void

  // draw
  onDrawingModeChanged?: (drawingMode: DrawingMode) => void
  onDrawFinish: (res: DrawRes, isPicked: boolean) => void
  onDrawCancel?: () => void
  // pick
  onPickHandler?: (res: PickRes) => void
  // clear
  onClearBtnClick?: () => void
}

interface States {
  apiLoaded: boolean
  // draw
  layersGroup: LayersGroup

  isDrawHelperLoaded: boolean
  drawingMode: DrawingMode// isDrawing: null/point/line
  // pick
  isPicking: boolean// boolean;
  // hight light
  hoveredGraphic: __esri.Graphic
  hoverPickingGraphics: __esri.Graphic[]
  selectedPickingGraphics: __esri.Graphic[]
}

export default class GraphicInteractionManager extends React.PureComponent<Props, States> {
  drawLayersGroup: DrawLayersGroup
  drawHelperRef: DrawHelper
  popupHelperRef: PopupHelper
  queryHelper: QueryHelper

  constructor (props) {
    super(props)

    this.state = {
      apiLoaded: false,

      layersGroup: {
        layerRelativeToGround: null,
        layerOnTheGround: null
      },

      isDrawHelperLoaded: false,
      drawingMode: DrawingMode.Null,

      isPicking: false,
      hoveredGraphic: null,

      hoverPickingGraphics: null,
      selectedPickingGraphics: null
    }
  }

  async componentDidMount (): Promise<void> {
    if (!this.state.apiLoaded) {
      this.drawLayersGroup = await new DrawLayersGroup().setup(this.props.jimuMapView, this.props.widgetId)
      this.setState({ apiLoaded: true })
      this.setState({ layersGroup: this.drawLayersGroup.layersGroup })
    }
  }

  componentWillUnmount (): void {
    this.clearAll()

    if (this.drawLayersGroup) {
      this.drawLayersGroup = null
    }

    this.props.onRef(null)
  }

  componentDidUpdate (prevProps: Props, prevState: States): void {
    if (this.props.jimuMapView !== prevProps.jimuMapView) {
      this.setState({ hoverPickingGraphics: null })
      this.setState({ selectedPickingGraphics: null })

      // highlights not clear after 10.2:
      // so 1.remove highlights, 2.async reset layers
      setTimeout(() => {
        this.drawLayersGroup?.resetJimuMapView(this.props.jimuMapView)
        this.drawLayersGroup?.resetGraphicsLayers()
        if (this.state.apiLoaded) {
          this.setState({ layersGroup: this.drawLayersGroup.layersGroup })
        }
      }, 20)
    }
  }

  // show items
  _isInCludeShowItem = (item: ShowItem): boolean => {
    return this.props.showItems.includes(item)
  }

  render (): React.ReactElement {
    let content = null
    content = (
      <div css={this.getBtnStyleForBuilder()}>
        <React.Fragment>
          {(!this.state.apiLoaded || !this.state.isDrawHelperLoaded) &&
            <React.Fragment>
              {this._isInCludeShowItem(ShowItem.Point) && <SkeletonBtn theme={this.props.theme} className='draw-btn' />}
              {this._isInCludeShowItem(ShowItem.Pick) && <SkeletonBtn theme={this.props.theme} className='pick-btn' />}
              {this._isInCludeShowItem(ShowItem.Line) && <SkeletonBtn theme={this.props.theme} className='clear-btn' />}
            </React.Fragment>}
          {(this.state.apiLoaded && this.state.isDrawHelperLoaded) &&
            <React.Fragment>
              {this.getDrawBtnContent()}
              {this._isInCludeShowItem(ShowItem.Pick) && this.getPickBtnContent()}
              {this._isInCludeShowItem(ShowItem.Clear) && this.getClearBtnContent()}
            </React.Fragment>}

          {/* hidden tools */}
          <DrawHelper
            jimuMapView={this.props.jimuMapView}
            widgetId={this.props.widgetId}
            onDrawHelperCreated={this.handleDrawHelperCreated}
            onDrawingModeChanged={this.handleDrawingModeChanged}
            onDrawStart={this.handleDrawStart}
            onDrawEnd={this.handleDrawEnd}
            onDrawFinish={this.handleDrawFinish}
            onDrawCancel={this.handleDrawCancel}
            //
            layersGroup={this.state.layersGroup}
          />
          <HighlightHelper
            jimuMapView={this.props.jimuMapView}
            flyStyle={this.props.flyStyle}
            hoverPickingGraphics={this.state.hoverPickingGraphics}
            selectedPickingGraphics={this.state.selectedPickingGraphics}
          />
          <PopupHelper
            jimuMapView={this.props.jimuMapView}
            onPopupHelperCreated={this.handlePopupHelperCreated}
          />
        </React.Fragment>
      </div>
    )

    return content
  }

  // 1. Draw
  handleDrawHelperCreated = (drawHelperRef: DrawHelper): void => {
    this.drawHelperRef = drawHelperRef
    this.setState({ isDrawHelperLoaded: true })
    this.props.onRef(this)
  }

  handleDrawingModeChanged = (drawingMode: DrawingMode): void => {
    if (DrawingMode.Null !== drawingMode) {
      this.setState({ isPicking: false })
    }
    this.setState({ drawingMode: drawingMode })

    if (typeof this.props.onDrawingModeChanged === 'function') {
      this.props.onDrawingModeChanged(drawingMode)
    }
  }

  getBtnStyleForBuilder () {
    return css`
      .btns.active {
        background-color: var(--sys-color-action-selected) !important;
      }
    `
  }

  getDrawBtnContent = (): React.ReactElement => {
    const isShowPointBtn = this._isInCludeShowItem(ShowItem.Point)
    const isShowLineBtn = this._isInCludeShowItem(ShowItem.Line)

    const isDisable = this.props.isDisabled ? true : (this.props.isPlaying || !this.state.isDrawHelperLoaded)

    const pointTips = this.props.intl.formatMessage({ id: 'triggerDrawPoint', defaultMessage: nls.triggerDrawPoint })
    const lineTips = this.props.intl.formatMessage({ id: 'triggerDrawPath', defaultMessage: nls.triggerDrawPath })

    const flyStyle = this.props.flyStyle
    return (
      <React.Fragment>{
        (isShowPointBtn && (flyStyle === FlyItemMode.Rotate || flyStyle === null)) &&
          <Button
            icon className='operation-btns btns draw-btn' type='tertiary'
            onClick={() => { this.onDrawBtnClick(DrawingMode.Point, { isTriggerCancel: true }) }}
            disabled={isDisable}
            title={pointTips} aria-label={pointTips}

            active={DrawingMode.Point === this.state.drawingMode}
            aria-pressed={DrawingMode.Point === this.state.drawingMode}
          >
            <PinEsriOutlined />
          </Button>
      }{
        (isShowLineBtn && (flyStyle === FlyItemMode.Path || flyStyle === null)) &&
          <Button
            icon className='operation-btns btns draw-btn' type='tertiary'
            onClick={() => { this.onDrawBtnClick(DrawingMode.Line, { isTriggerCancel: true }) }}
            disabled={isDisable}
            title={lineTips} aria-label={lineTips}

            active={DrawingMode.Line === this.state.drawingMode}
            aria-pressed={DrawingMode.Line === this.state.drawingMode}
          >
            <PolylineOutlined />
          </Button>
      }
      </React.Fragment>
    )
  }

  onDrawBtnClick = (mode: DrawingMode, opts: { isTriggerCancel: boolean }): void => {
    if (opts?.isTriggerCancel) { // for ,#6554
      this.drawHelperRef?.cancelDrawing()
    }

    const stateMode = this.state.drawingMode
    if ((mode !== stateMode) && (DrawingMode.Point === mode || DrawingMode.Line === mode)) {
      this.drawHelperRef?.startDrawing(mode)
    }
  }

  handleDrawStart = (): void => {
    this.beforInteract()
  }

  handleDrawEnd = (/* drawRes: DrawRes */): void => null

  handleDrawFinish = (drawRes: DrawRes): void => {
    const _graphics = drawRes.graphicsInfo.getGraphics()
    if (this.state.selectedPickingGraphics !== null) {
      this.drawHelperRef?.removePickedLineStartEndPoints(this.state.selectedPickingGraphics[0])
    }

    this.props.onDrawFinish(drawRes, false)
    this.highlightGraphics(_graphics)
    this.focusGraphics(_graphics)
    // this.focusAndHighlightGraphic(drawRes.graphicsInfo.graphics);
    this.afterInteract()
  }

  handleDrawCancel = (): void => {
    this.afterInteract()

    if (typeof this.props.onDrawCancel === 'function') {
      this.props.onDrawCancel()
    }
  }

  // 2. Pick
  getPickBtnContent = (): React.ReactElement => {
    return (
      <PickHelper
        jimuMapView={this.props.jimuMapView}
        intl={this.props.intl}
        isPlaying={this.props.isPlaying}
        // draw
        isDrawHelperLoaded={this.state.isDrawHelperLoaded}
        drawingMode={this.state.drawingMode}
        // pick
        isPicking={this.state.isPicking}
        onPicked={this.handlePicked}
        onPickingStateChanged={this.handlePickingStateCahnged}
        // hover
        onHoverPicking={this.handleHoverPicking}
        hoveredGraphic={this.state.hoveredGraphic}
      />
    )
  }

  // pick-helper cb
  handleHoverPicking = (graphics: __esri.Graphic[]): void => {
    this.setState({ hoverPickingGraphics: graphics })
  }

  handlePickingStateCahnged = (isPicking: boolean): void => {
    if (isPicking) {
      this.drawHelperRef.cancelDrawing()
    } else if (!isPicking) {
      this.setState({ hoverPickingGraphics: null })// clear hoverPicking highlight
    }

    this.setState({ isPicking: isPicking })
  }

  handlePicked = (res: PickRes): void => {
    if (!this.validPickingByType(res)) {
      return
    }
    this.clearAll()

    let mainGraphics = res.graphicsInfo.getGraphics()
    const pickedGraphic = mainGraphics[0]
    setTimeout(() => {
      if (pickedGraphic.geometry.type === 'polyline') {
        const graphics = this.drawHelperRef.drawPickedLineStartEndPoints(pickedGraphic)
        mainGraphics = [pickedGraphic, graphics[1], graphics[2]]
      }

      this.highlightGraphics(mainGraphics)// only highlight&focus mainGraphic
      this.focusGraphics(mainGraphics)

      this.props.onPickHandler(res)
    }, 10)
  }

  private readonly validPickingByType = (res: PickRes): boolean => {
    let isValid = false
    if (this.props.flyStyle === FlyItemMode.Rotate && (res.pickMode === 'point')) {
      isValid = true
    } else if (this.props.flyStyle === FlyItemMode.Path && (res.pickMode === 'polyline')) {
      isValid = true
    }

    return isValid
  }

  // 3. highlight
  highlight = (graphics: __esri.Graphic[]): void => {
    if (graphics === null) {
      this.clearHighlightGraphics()
    } else {
      // this.focusAndHighlightGraphic(graphics);
      this.highlightGraphics(graphics)
      this.focusGraphics(graphics)
    }
  }

  clearHighlightGraphics = (): void => {
    this.setState({ selectedPickingGraphics: null })
    this.setState({ hoverPickingGraphics: null })
  }

  highlightGraphics = (graphics: __esri.Graphic[]): void => {
    this.setState({ selectedPickingGraphics: graphics })
    // this.props.onFocusedGraphicChanged(mainGraphic);
  }

  // 4. clear
  getClearBtnContent = (): React.ReactElement => {
    const clearTips = this.props.intl.formatMessage({ id: 'triggerClear', defaultMessage: nls.triggerClear })
    const isDisable = this.props.isPlaying || (this.props.focusedGraphic === null)
    return (
      <Button icon onClick={this.handleClearBtnClick} disabled={isDisable}
        title={clearTips} aria-label={clearTips}
        className='btns clear-btn' type='tertiary'>
        <ClearOutlined />
      </Button>
    )
  }

  // 5. focus for panel
  focusGraphics = (graphics: __esri.Graphic[]): void => {
    this.props.onFocusedGraphicChanged(null)

    const mainGraphic = (graphics === null) ? null : graphics[0]// main graphics
    this.props.onFocusedGraphicChanged(mainGraphic)
  }

  // 6. popup
  handlePopupHelperCreated = (ref: PopupHelper): void => {
    this.popupHelperRef = ref
  }

  // cache Popup&Highlight state
  private readonly beforInteract = (): void => {
    this.popupHelperRef?.cacheMapPopupHighlightState()
    this.popupHelperRef?.disablePopupAndHighlight()// disable map default HighLight&Popup
  }

  // restore Popup&Highlight state
  private readonly afterInteract = (): void => {
    setTimeout(() => {
      this.restoreMapPopupHighlightState()
    }, 10)
  }

  restoreMapPopupHighlightState = (): void => {
    this.popupHelperRef?.restoreMapPopupHighlightState()
  }

  handleClearBtnClick = (): void => {
    this.clearAll()
    this.focusGraphics(null)
    this.props.onClearBtnClick()
  }

  clearAll = (): void => {
    // highlight
    this.highlight(null)
    // this.focusGraphics(null);
    this.popupHelperRef?.restoreMapPopupHighlightState()

    // draw
    this.drawHelperRef?.removeAll()
  }

  // 5. live view

  // for ref cb
  onRenderStateChange = (opts: { drawingMode?: DrawingMode, isPicking?: false }): void => {
    if (typeof opts?.drawingMode !== 'undefined') {
      this.handleDrawingModeChanged(opts.drawingMode)
      this.onDrawBtnClick(opts.drawingMode, { isTriggerCancel: false })
    }
    // eslint-disable-next-line no-empty
    if (typeof opts?.isPicking !== 'undefined') {

    }
  }

  // draw Graphics into map, return GraphicsInfo
  // 1. onDrawGraphics
  // 2. updateLineByAltitude
  drawOrUpdateGraphics = (recordConfig: RecordConfig): GraphicsInfo => {
    const cachedGraphics = recordConfig.storedGraphicsInfo.rawData
    const mainGraphic = cachedGraphics.graphics[0]// main graphics
    const isPicked = cachedGraphics.isPicked
    const settingState: LiveviewSettingState = recordConfig.controllerConfig?.liveviewSettingState

    let drawnGraphics
    if (!isPicked) {
      // draw
      drawnGraphics = this.drawHelperRef.createOrUpdateGraphic(mainGraphic, settingState, isPicked)
    } else {
      // pick
      const pickedGraphic = mainGraphic
      // line need redraw, point just highlight
      if (pickedGraphic.geometry.type === 'polyline' || isDefined((pickedGraphic.geometry as unknown as __esri.Polyline).paths)) {
        // picked line
        drawnGraphics = this.drawHelperRef.createOrUpdateGraphic(pickedGraphic, settingState, isPicked)
      } else {
        // picked point
        drawnGraphics = cachedGraphics.graphics
      }
    }

    return new GraphicsInfo({ graphics: drawnGraphics, isPicked: isPicked })
  }

  removeGraphics = (graphics): void => {
    this.drawHelperRef?.removeGraphics(graphics)
  }

  removeAllGraphics = (): void => {
    this.drawLayersGroup?.removeAllGraphics()
  }

  // test query
  query = /* async */(/* dsId:string, objId:string */): void => {
    return null// await this.queryHelper._testQuery()
  }
}
