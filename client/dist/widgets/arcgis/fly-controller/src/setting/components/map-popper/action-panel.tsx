// 1.handle draw
// 2.build tmpRecord
// 3.draw back all graphics in Records

/** @jsx jsx */
import { React, jsx, type IntlShape, type IMThemeVariables, lodash, uuidv1 } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { RotateDirection, PathDirection, PathStyle, type RotateItemConfig, type PathItemConfig } from '../../../config'
import { NewFeatureMode } from '../../setting'
// fly
import type { FlyIds } from '../../../common/fly-facade/fly-manager'
import { ControllerMode } from '../../../common/fly-facade/controllers/base-fly-controller'
import type Record from '../../../common/fly-facade/plan-routes/record/record'
import type { RecordConfig, RotateRecordConfig, PathRecordConfig } from '../../../common/fly-facade/plan-routes/record/record'
import type { GraphicsInfo, RouteConfig } from '../../../common/constraints'
import { isDefined } from '../../../common/utils/utils'
import * as utils from '../../../common/utils/utils'
import nls from '../../translations/default'
// graphics
import GraphicInteractionManager, { DrawingMode, ShowItem } from '../../../common/components/graphic-interaction-manager'
import type { DrawRes } from '../../../common/components/helpers/draw-helper'

interface Props {
  specifiedJimuMapId: string
  intl: IntlShape
  theme: IMThemeVariables
  jimuMapView: JimuMapView
  getPopperJimuMapId: () => string

  onRefGraphicInteractionManager: (ref: GraphicInteractionManager) => void
  isTerrainLoaded: boolean

  newFeatureMode: NewFeatureMode
  onNewFeatureModeChange: (mode: NewFeatureMode) => void

  isDisableDraw: boolean
  onDrawFinish?: (record: Record) => void
  buildTemporaryRecordConfig: (graphicsInfo: GraphicsInfo, cameraInfo: __esri.Camera, jimuMapView: JimuMapView) => RecordConfig
  buildDefaultRecord: (recordConfig: RecordConfig, graphicsInfoRef: GraphicsInfo) => Promise<Record>
  activedRouteConfig: RouteConfig

  // playing info
  playingInfo: FlyIds
  isPreviewRouteBtnPlaying: boolean

  stopFly: () => void
}

interface State {
  isLoaded: boolean
}

export default class ActionPanel extends React.PureComponent<Props, State> {
  jimuMapView: JimuMapView
  graphicInteractionManagerRef: GraphicInteractionManager

  constructor (props) {
    super(props)
    this.state = {
      isLoaded: false
    }

    this._init(this.props.jimuMapView)
  }

  _init (jimuMapView: JimuMapView): void {
    if (isDefined(jimuMapView)) {
      this.jimuMapView = jimuMapView
      this._redrawAllRecordGraphics(this.props.activedRouteConfig)// init drawn
    }
  }
  // componentDidMount() {
  // this.props.onRef(this);
  // this._redrawAllRecordGraphics(this.props.activedRouteConfig);
  // }

  componentDidUpdate (prevProps: Props, prevState: State): void {
    if (this.props.jimuMapView !== prevProps.jimuMapView) {
      this._init(this.props.jimuMapView)
    }

    // update NewFeatureMode from L2
    if ((this.props.newFeatureMode !== prevProps.newFeatureMode)) {
      if (this.props.newFeatureMode === NewFeatureMode.Point) {
        this.graphicInteractionManagerRef?.onRenderStateChange({ drawingMode: DrawingMode.Point })
      } else if (this.props.newFeatureMode === NewFeatureMode.Path) {
        this.graphicInteractionManagerRef?.onRenderStateChange({ drawingMode: DrawingMode.Line })
      } else if (this.props.newFeatureMode === NewFeatureMode.Empty) {
        this.graphicInteractionManagerRef?.onRenderStateChange({ drawingMode: DrawingMode.Null })
      }
    }

    // update draw all RecordConfig Graphics
    if (isDefined(this.props.jimuMapView) && !this._isRecordsIdEqual(this.props.activedRouteConfig, prevProps.activedRouteConfig)) {
      this._redrawAllRecordGraphics(this.props.activedRouteConfig)
    }
  }

  componentWillUnmount () {
    this.props.onRefGraphicInteractionManager(null)
  }

  _isRecordsIdEqual = (propsRecords, prevPropsRecords): boolean => {
    const propsRecordsIds = propsRecords.records.map((record) => {
      return record.idx
    })
    const prevPropsRecordsIds = prevPropsRecords.records.map((record) => {
      return record.idx
    })

    return lodash.isDeepEqual(propsRecordsIds, prevPropsRecordsIds)
  }

  // draw graphics back
  _redrawAllRecordGraphics = (routeConfig: RouteConfig): void => {
    if (isDefined(this.graphicInteractionManagerRef)) {
      // console.log('_redrawAllRecordGraphics' + routeConfig);
      this.graphicInteractionManagerRef.removeAllGraphics()
      routeConfig.records.forEach((record: RecordConfig) => {
        // draw back graphics in this mapView
        if (record.mapViewId === this.props.getPopperJimuMapId()) {
          // TODO update 'graphicsInfo' into flyManager const graphicsInfo =
          this.graphicInteractionManagerRef.drawOrUpdateGraphics(record/* record.state */)
        }
      })
    }
  }

  handleGraphicsUpdate = async (res: DrawRes): Promise<any> => {
    let record
    const uuid = uuidv1()// set uuid
    const { graphicsInfo, cameraInfo, drawingMode } = res

    const options = this.getDefaultOptions(drawingMode)
    if (res.drawingMode === DrawingMode.Point) {
      // 1.Point
      // const point = (graphics[0].geometry as __esri.Point)
      record = await this.addPointRecord(uuid, options, graphicsInfo, cameraInfo)
    } else if (res.drawingMode === DrawingMode.Line) {
      // 2. Line
      // const line = graphics[0].geometry
      record = await this.addPathRecord(uuid, options, graphicsInfo, cameraInfo)
    }

    this.props.onNewFeatureModeChange(NewFeatureMode.Empty)

    if (typeof this.props.onDrawFinish === 'function') {
      this.props.onDrawFinish(record)
    }
  }

  handleDrawCancel = (): void => {
    this.props.onNewFeatureModeChange(NewFeatureMode.Empty)
  }

  getDefaultOptions = (drawingMode: DrawingMode): RotateItemConfig | PathItemConfig => {
    let options
    switch (drawingMode) {
      case DrawingMode.Point: {
        options = {
          direction: RotateDirection.CCW
        }
        break
      }
      case DrawingMode.Line: {
        options = {
          direction: PathDirection.Forward,
          style: PathStyle.Smoothed
        }
        break
      }
      default: {
        console.error('action-panel::getDefaultOptions')
      }
    }

    return options
  }

  addPointRecord = async (uuid: string, options: RotateItemConfig | PathItemConfig, graphicsInfo: GraphicsInfo, cameraInfo: __esri.Camera): Promise<Record> => {
    const autoNamingTmpl = this.props.intl.formatMessage({ id: 'pointStyle', defaultMessage: nls.pointStyle })
    const name = utils.getIncreasedNameByConfig(this.props.activedRouteConfig.records, autoNamingTmpl)

    let rotateRecord = this.props.buildTemporaryRecordConfig(graphicsInfo, cameraInfo, this.props.jimuMapView)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    rotateRecord as RotateRecordConfig
    rotateRecord = Object.assign(rotateRecord, {
      idx: uuid,
      type: ControllerMode.Rotate,
      displayName: name,

      duration: 10, // default rotate time is 10s
      startDelay: 0,
      endDelay: 0,
      angle: 360,
      // controllerConfig:
      direction: options.direction,
      mapViewId: this.props.getPopperJimuMapId()
    })

    return await this.props.buildDefaultRecord(rotateRecord, graphicsInfo)
  }

  addPathRecord = async (uuid: string, options: RotateItemConfig | PathItemConfig, graphicsInfo: GraphicsInfo, cameraInfo: __esri.Camera): Promise<Record> => {
    const autoNamingTmpl = this.props.intl.formatMessage({ id: 'pathStyle', defaultMessage: nls.pathStyle })
    const name = utils.getIncreasedNameByConfig(this.props.activedRouteConfig.records, autoNamingTmpl)

    let pathRecord = this.props.buildTemporaryRecordConfig(graphicsInfo, cameraInfo, this.props.jimuMapView)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    pathRecord as PathRecordConfig
    pathRecord = Object.assign(pathRecord, {
      idx: uuid,
      type: ControllerMode.Smoothed, // ControllerMode.RealPath
      displayName: name,
      // altitude: 100,
      duration: -1, // calculate the init fly time of a single record based on the feature
      startDelay: 0,
      endDelay: 0,

      direction: options.direction,
      mapViewId: this.props.getPopperJimuMapId()
    })

    return await this.props.buildDefaultRecord(pathRecord, graphicsInfo)
  }

  // 2.2 picking
  handlePickHandler = (res: DrawRes): void => {
    this.handleGraphicsUpdate(res)
  }

  handleRefGraphicInteractionManager = (ref: GraphicInteractionManager): void => {
    this.graphicInteractionManagerRef = ref

    if (ref !== null) {
      this.setState({ isLoaded: true })
    } else {
      this.setState({ isLoaded: false })
    }

    this._redrawAllRecordGraphics(this.props.activedRouteConfig)// init

    this.props.onRefGraphicInteractionManager(ref)
  }

  handleFocusedGraphicChanged = (graphic: __esri.Graphic): void => {
    // console.log("setting onFocusedGraphicChanged()" + graphic)
  }

  handleDrawingModeChanged = (drawingMode: DrawingMode): void => {
    // console.log("onDrawingModeChanged==> " + drawingMode);
    this.props.stopFly()
  }

  render (): React.ReactElement {
    return (
      <div className='d-flex align-items-center justify-content-center'>
        {isDefined(this.props.jimuMapView) &&
          <GraphicInteractionManager
            onRef={this.handleRefGraphicInteractionManager}
            widgetId={this.props.specifiedJimuMapId}
            intl={this.props.intl}
            theme={this.props.theme}
            jimuMapView={this.props.jimuMapView}
            showItems={[ShowItem.Point, ShowItem.Line]}
            isDisabled={this.props.isDisableDraw || !this.props.isTerrainLoaded}
            //
            flyStyle={null}
            isPlaying={false}
            //
            onFocusedGraphicChanged={this.handleFocusedGraphicChanged}
            onDrawingModeChanged={this.handleDrawingModeChanged}
            onDrawFinish={this.handleGraphicsUpdate}
            onDrawCancel={this.handleDrawCancel}
          />}
      </div>
    )
  }
}
