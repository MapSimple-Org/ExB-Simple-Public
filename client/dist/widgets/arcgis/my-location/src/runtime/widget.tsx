/** @jsx jsx */
import { type JimuMapView, JimuMapViewComponent, MapViewManager } from 'jimu-arcgis'
import {
  type AllWidgetProps, type DataSource, type FeatureLayerDataSource,
  DataSourceManager,
  type IMState,
  QueryScope,
  React,
  getAppStore, jsx, utils
} from 'jimu-core'
import { Alert, Button, ConfirmDialog, DataActionList, DataActionListStyle, Icon, Loading, LoadingType, Paper, Tooltip, WidgetPlaceholder } from 'jimu-ui'

import { Arrangement, type IMConfig, TimeUnits, type TrackLine, type TrackLinePoint, type TrackPoint, type TracksWithLine, Types } from '../config'
import { getStyle } from './style'
import defaultMessages from './translations/default'

import TrackOut from './data-source/track-point-output'
import TrackLineOut from './data-source/trackline-output'
import TrackLinePointOut from './data-source/trackline-point-output'

import { VisibleOutlined } from 'jimu-icons/outlined/application/visible'
import { PauseOutlined } from 'jimu-icons/outlined/editor/pause'
import { PlayOutlined } from 'jimu-icons/outlined/editor/play'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { PinEsriOutlined } from 'jimu-icons/outlined/gis/pin-esri'
import { TracePathOutlined } from 'jimu-icons/outlined/gis/trace-path'

import { InvisibleOutlined } from 'jimu-icons/outlined/application/invisible'
import { DEFAULT_ACTIVATION, DEFAULT_ARRANGEMENT, HIGHLIGHT_LOCATION, MANUAL_PATHTRACING, SELECTED_FIELDS, SELECTED_LINE_FIELDS, SHOW_COMPASS_ORIENTATION, SHOW_LOCATION_ACCURACY, STREAMING, SYMBOL_COLOR, TIME_OUT, USE_MAPWIDGET, WATCH_LOCATION, ZOOM_SCALE, ZOOM_TO_LOCATION } from '../constants'
import HighLightLocation from './components/highlight-location'
import TrackView from './components/track'
import TrackLineView from './components/trackline'
import { getHighLightGraphicsLayerId, getLineGraphic, getPointGraphic, Operations, removeLayerFromJimuLayerViews, zoomToGraphics, getWidgetObjectIdKey, getObjectId } from './data-source/utils'
import { clearUselessDB } from './utils/common/db'
import { checkGeolocationPermission, clearWatch, createLine, defaultOptions, getCurrentPosition, updateLine, watchPosition } from './utils/common/geolocate'
import { calculateDistance, calculateTimeDifference, formatNumberWithDecimals, isEmpty } from './utils/common/util'
import { versionManager } from '../version-manager'
export interface WidgetProps extends AllWidgetProps<IMConfig> {
  mapWidgetId: string
}

export interface WidgetState {
  mapViewWidgetId: string
  jimuMapViews: { [viewId: string]: JimuMapView }
  jimuMapView: JimuMapView
  dataSourceWidgetId: string
  dataSourceLabel: string
  dataSources: DataSource[]
  trackSource: DataSource
  lineDataSource: DataSource
  activeTab: string
  isWarning: boolean
  warnType: number // 1: location, 2: path
  tracking: boolean
  showActionBtn: boolean
  operationRecords: TrackLinePoint[] //  operation path point
  track: TrackPoint // operation location
  tracksWithLine: TracksWithLine // operation path
  tracks: TrackPoint[] // point list and source
  trackLines: TrackLine[] //path list and source
  trackLinePoints: TrackLinePoint[] // path point data source
  trackLinePointsList: TrackLinePoint[][] // path point list
  points: TrackLinePoint[] // current watch points
  tempTracksWithLine: TracksWithLine // current temp watch path: create point but not finish status
  watchId: number
  loading: boolean
  operation: Operations
  locationOperation: Operations
  clearRecordsConfirmOpen: boolean
  currentDataSourceId: string
  selectedPointIds: string[]
  selectedLineIds: string[]
  notFilterPointIds: number[]
  notFilterLineIds: number[]
  position: GeolocationCoordinates
  confirmType: string
  deleteLineArgs: { track: TrackLinePoint, line: TrackLine, type: string }
  deleteTrackArgs: { track: TrackPoint }
  isRendered: boolean
  graphicsLayerId: string
  locationLayerVisible: boolean
  pathLayerVisible: boolean
  selectedFields: string[]
  selectedLineFields: string[]
}

export default class Widget extends React.PureComponent<WidgetProps, WidgetState> {
  static mapExtraStateProps = (_state: IMState, ownProps: AllWidgetProps<IMConfig>) => {
    const mapWidgetId = ownProps.useMapWidgetIds && ownProps.useMapWidgetIds.length !== 0
      ? ownProps.useMapWidgetIds[0]
      : undefined
    return {
      mapWidgetId: mapWidgetId
    }
  }

  static versionManager = versionManager
  dsManager: DataSourceManager = DataSourceManager.getInstance()
  mvManager: MapViewManager = MapViewManager.getInstance()
  constructor(props) {
    super(props)
    this.state = {
      mapViewWidgetId: null,
      jimuMapViews: null,
      jimuMapView: null,
      dataSources: [],
      dataSourceWidgetId: null,
      dataSourceLabel: '',
      activeTab: 'track',
      isWarning: false,
      warnType: 1,
      trackSource: null,
      lineDataSource: null,
      track: null,
      tracking: false,
      showActionBtn: false,
      tracks: [],
      trackLines: [],
      trackLinePointsList: [],
      operationRecords: [],
      trackLinePoints: [],
      tracksWithLine: null,
      points: [],
      tempTracksWithLine: null,
      watchId: null,
      loading: false,
      operation: Operations.CREATE,
      locationOperation: Operations.CREATE,
      clearRecordsConfirmOpen: false,
      currentDataSourceId: null,
      selectedPointIds: [],
      selectedLineIds: [],
      notFilterPointIds: [],
      notFilterLineIds: [],
      position: null,
      confirmType: null,
      deleteLineArgs: { track: null, line: null, type: null },
      deleteTrackArgs: { track: null },
      isRendered: false,
      graphicsLayerId: getHighLightGraphicsLayerId(this.props.id),
      locationLayerVisible: true,
      pathLayerVisible: true,
      selectedFields: props.config.selectedFields?.asMutable() ?? SELECTED_FIELDS,
      selectedLineFields: props.config.selectedLineFields?.asMutable() ?? SELECTED_LINE_FIELDS
    }
  }

  trackLabel = this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })
  locationDataSourceKey = getWidgetObjectIdKey(this.props.id, 'location')
  pathDataSourceKey = getWidgetObjectIdKey(this.props.id, 'path')

  clearDataSources(jimuMapView: JimuMapView, destroy = false) {
    if (jimuMapView) {
      this.state.dataSources.forEach(ds => {
        removeLayerFromJimuLayerViews(jimuMapView, ds.id)
      })
      if (destroy) {
        this.state.dataSources.forEach(ds => {
          this.dsManager.destroyDataSource(ds.id)
        })
        this.setState({
          showActionBtn: false,
          tracks: [],
          track: null,
          trackLines: [],
          tracksWithLine: null,
          tempTracksWithLine: null,
          operationRecords: [],
          points: [],
          trackLinePointsList: [],
          trackLinePoints: [],
          operation: null,
          dataSources: [],
          trackSource: null,
          lineDataSource: null
        })
        // reset
        this.resetObjectKeys()
      }
    }
  }

  clearGraphicsLayer(jimuMapView: JimuMapView) {
    if (jimuMapView) {
      const layer = jimuMapView?.view?.map?.findLayerById(this.state.graphicsLayerId)
      if (layer) {
        jimuMapView.view.map.remove(layer)
      }
    }
    this.setState({ position: null })
  }

  defaultActivate() {
    if (!window.jimuConfig.isInBuilder && !this.state.isRendered) {
      const { jimuMapView, dataSources } = this.state
      if (jimuMapView && dataSources.length > 0) {
        const watchLocation = (this.props.config.watchLocation ?? WATCH_LOCATION)
        const defaultActivation = (this.props.config.defaultActivation ?? DEFAULT_ACTIVATION)
        if (defaultActivation) {
          if (!watchLocation) {
            this.getLocation()
          } else if (!this.state.tracking) {
            this.handleTracking(true)
          }
          this.setState({ isRendered: true })
        }
      }
    }
  }

  componentDidMount() {
    this.setState({ loading: true })
    clearUselessDB(this.props.manifest.name)
    window.addEventListener('beforeunload', this.resetObjectKeys)
  }

  componentWillUnmount() {
    this.clearWidget()
    window.removeEventListener('beforeunload', this.resetObjectKeys)
  }

  componentDidUpdate(prevProps: WidgetProps, prevState: WidgetState) {
    const { mapWidgetId } = this.props
    const { jimuMapView } = this.state
    if (prevProps.config.selectedFields !== this.props.config.selectedFields) {
      this.setState({
        selectedFields: this.props.config.selectedFields?.asMutable() ?? SELECTED_FIELDS
      })
    }
    if (prevProps.config.watchLocation !== this.props.config.watchLocation) {
      this.clearStores()
      this.clearWidget()
    }
    if (!this.state.isRendered) {
      this.defaultActivate()
    }
    if (prevState.jimuMapView !== jimuMapView) {
      if (this.state.tracking) {
        this.handleTracking(false, true)
      }
    }
    if (prevProps.mapWidgetId !== mapWidgetId) {
      if (this.state.tracking) {
        this.handleTracking(false, true)
      }
      this.clearGraphicsLayer(jimuMapView)
      if (prevState.jimuMapView && !mapWidgetId) {
        this.clearDataSources(prevState.jimuMapView, false)
        this.setState({
          jimuMapView: null,
          jimuMapViews: null,
          currentDataSourceId: null
        })
      }
    }
  }

  resetObjectKeys = () => {
    // reset
    utils.setLocalStorage(this.locationDataSourceKey, '0')
    utils.setLocalStorage(this.pathDataSourceKey, '0')
  }

  clearWidget() {
    const { jimuMapView } = this.state
    // remove highlight layer
    this.clearGraphicsLayer(jimuMapView)
    // remove all layers
    this.clearDataSources(jimuMapView, true)
    // stop tracking
    if (this.state.watchId) {
      clearWatch(this.state.watchId)
    }
    this.setState({
      tracking: false,
      watchId: null,
      position: null
    })
  }

  onTrackDataSourceCreated = (dataSource: DataSource) => {
    this.setState({ trackSource: dataSource })
    if (dataSource) {
      this.setState(prevState => ({
        dataSources: prevState.dataSources.concat(dataSource)
      }))
      this.setState({ currentDataSourceId: dataSource.id })
    }
  }

  onLineDataSourceCreated = (dataSource: DataSource) => {
    this.setState({ lineDataSource: dataSource })
    if (dataSource) {
      this.setState(prevState => ({
        dataSources: prevState.dataSources.concat(dataSource)
      }))
    }
  }

  onLinesChanges = (lines: TrackLine[], count: number = 0) => {
    this.setState({ trackLines: lines })
    if (this.state.currentDataSourceId === this.state.lineDataSource.id) {
      this.setState({ showActionBtn: count > 0 })
    }
  }

  onLinePointsRecordsChanges = (records: TrackLinePoint[], count: number) => {
    this.setState({ trackLinePoints: records })
    const lineIds = Array.from(new Set(records.map(record => record.LineID))).sort((a, b) => b - a)
    const groupTracks = lineIds.map(id => {
      return records.filter(track => track.LineID === id).sort((a, b) => b.OBJECTID - a.OBJECTID)
    })
    this.setState({ trackLinePointsList: groupTracks })
    if (this.state.currentDataSourceId === this.state.trackSource.id) {
      this.setState({ showActionBtn: count > 0 })
    }
  }

  onTracksChange = (points: TrackPoint[], count: number = 0) => {
    this.setState({ tracks: points, showActionBtn: count > 0 })
  }

  handleTabsChange = (id: string) => {
    this.setState({ activeTab: id })
  }

  async getLocation() {
    this.setState({ loading: true })
    const hasPermission = await checkGeolocationPermission()
    if (!hasPermission) {
      this.handleWarning()
      this.setState({ loading: false })
      return
    }
    let timeoutId = setTimeout(() => { this.handleWarning() }, (this.props.config.timeOut ?? TIME_OUT) * 1000)
    getCurrentPosition({ ...defaultOptions, timeout: (this.props.config.timeOut ?? TIME_OUT) * 1000 }).then((position: GeolocationPosition) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      const coords = position?.coords
      const lon = formatNumberWithDecimals(coords.longitude, 6)
      const lat = formatNumberWithDecimals(coords.latitude, 6)
      const transCoords: GeolocationCoordinates = {
        ...coords,
        accuracy: coords.accuracy,
        heading: coords.heading,
        longitude: lon,
        latitude: lat
      }
      const track: TrackPoint = {
        location_timestamp: Date.now(),
        Longitude: lon,
        Latitude: lat,
        altitude: !isEmpty(coords.altitude) ? formatNumberWithDecimals(coords.altitude, 2) : null,
        Orientation: !isEmpty(coords.heading) ? formatNumberWithDecimals(coords.heading, 2) : null,
        speed: !isEmpty(coords.speed) ? formatNumberWithDecimals(coords.speed, 2) : null,
        Accuracy: coords.accuracy ? formatNumberWithDecimals(coords.accuracy, 2) : null,
        OBJECTID: getObjectId(this.locationDataSourceKey)
      }
      this.setState({ track: track, operation: Operations.ADD })
      this.setState({ position: this.props.config.highlightLocation ?? HIGHLIGHT_LOCATION ? transCoords : null })
      this.setState({ loading: false })
      zoomToGraphics(this.state.jimuMapView, [getPointGraphic(track)], this.props.config.zoomScale ?? ZOOM_SCALE, this.props.config.zoomToLocation ?? ZOOM_TO_LOCATION)
    }).catch(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      this.handleWarning()
      this.setState({ loading: false })
      this.setState({ position: null })
    })
  }

  handleTrackPath = () => {
    if (this.state.points.length === 0) {
      this.handleWarning(2)
      return
    }
    // create new line from last finished
    const newPoint = Object.assign({}, this.state.points[this.state.points.length - 1])
    newPoint.OBJECTID = getObjectId(this.locationDataSourceKey)
    newPoint.LineID = getObjectId(this.pathDataSourceKey, this.state.trackLines.length === 0)
    const lineObj = createLine(newPoint)
    this.setState({
      points: [newPoint],
      operationRecords: [newPoint],
      locationOperation: Operations.ADD,
      tracksWithLine: this.state.tempTracksWithLine,
      operation: Operations.ADD,
      tempTracksWithLine: lineObj
    })
  }

  // stop watching
  handleWatchingFinished = (isForceStop: boolean) => {
    if (isForceStop) {
      if (this.state.tempTracksWithLine && this.state.tempTracksWithLine.line && this.state.tempTracksWithLine.tracks && this.state.tempTracksWithLine.tracks.length > 0) {
        const lines = this.state.trackLines.concat([this.state.tempTracksWithLine.line])
        this.onLinesChanges(lines)
      }
    }
    if (this.state.points.length === 0) {
      this.handleWarning(2)
      // reset
      // reset path id
      if (this.state.tempTracksWithLine && this.state.tempTracksWithLine.line) {
        const lastLineId = this.state.tempTracksWithLine.line.OBJECTID > 0 ? (this.state.tempTracksWithLine.line.OBJECTID - 1) : 0
        utils.setLocalStorage(this.pathDataSourceKey, lastLineId.toString())
      }
      this.setState({
        operationRecords: [],
        locationOperation: Operations.CREATE,
        operation: Operations.CREATE,
        tempTracksWithLine: null,
        tracksWithLine: null,
        points: [],
        position: null
      })

    } else {
      this.setState({
        operationRecords: [],
        locationOperation: Operations.CREATE,
        tempTracksWithLine: null,
        points: [],
        position: null,
        operation: Operations.ADD,
        tracksWithLine: this.state.tempTracksWithLine
      })
    }
  }

  updateTrackLine(track: TrackLinePoint, isCreate: boolean) {
    let lineObj
    if (isCreate) {
      lineObj = createLine(track)
      this.setState({
        operationRecords: [track],
        locationOperation: Operations.ADD,
        tempTracksWithLine: lineObj
      })
    } else {
      lineObj = updateLine(track, this.state.tempTracksWithLine)
      this.setState({
        operationRecords: [track],
        locationOperation: Operations.ADD,
        tempTracksWithLine: lineObj
      })
    }
    zoomToGraphics(this.state.jimuMapView, [getLineGraphic(lineObj.line, lineObj.tracks)], this.props.config.zoomScale ?? ZOOM_SCALE, this.props.config.zoomToLocation ?? ZOOM_TO_LOCATION)
  }

  keepPoint(position: GeolocationPosition): boolean {
    if (this.state.points.length === 0) return true
    const preCoord = this.state.points[this.state.points.length - 1]

    if (position.timestamp - preCoord.location_timestamp < 1000) return false
    // remove duplicate points
    if (preCoord.Longitude === position.coords.longitude && preCoord.Latitude === position.coords.latitude) return false
    const watchLocationSettings = this.props.config.watchLocationSettings ?? { manualPathTracing: MANUAL_PATHTRACING, streaming: { type: STREAMING.TYPE, unit: STREAMING.UNIT, interval: STREAMING.INTERVAL } }
    if (watchLocationSettings.streaming.type === Types.Distance) {
      const distance = calculateDistance(position.coords.longitude, position.coords.latitude, preCoord.Longitude, preCoord.Latitude, watchLocationSettings.streaming.unit)
      return distance > watchLocationSettings.streaming.interval
    } else if (watchLocationSettings.streaming.type === Types.Time) {
      if (watchLocationSettings.streaming.unit === TimeUnits.sec) {
        const time = calculateTimeDifference(Date.now(), preCoord.location_timestamp)
        return time > watchLocationSettings.streaming.interval
      }
    }
  }

  async handleTracking(tracking: boolean, isForceStop: boolean = false) {
    this.setState({ tracking: tracking })
    let timeoutId
    const timeOut = (this.props.config.timeOut ?? TIME_OUT) * 1000
    const executeTimeoutFunction = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      if (!this.state.tracking) {
        return
      }
      timeoutId = setTimeout(() => {
        if (!this.state.tracking) {
          return
        }
        this.handleWarning()
        executeTimeoutFunction()
      }, timeOut)
    }

    if (tracking) {
      this.setState({ loading: true })
      const hasPermission = await checkGeolocationPermission()
      this.setState({ loading: false })
      if (!hasPermission) {
        this.handleWarning()
        return
      }
      executeTimeoutFunction()
      const wId = watchPosition((position: GeolocationPosition) => {
        if (!this.keepPoint(position)) return
        executeTimeoutFunction()
        const coords = position?.coords
        const lon = formatNumberWithDecimals(coords.longitude, 6)
        const lat = formatNumberWithDecimals(coords.latitude, 6)
        const transCoords: GeolocationCoordinates = {
          ...coords,
          accuracy: coords.accuracy,
          heading: coords.heading,
          longitude: lon,
          latitude: lat
        }
        const track: TrackLinePoint = {
          location_timestamp: Date.now(),
          Longitude: lon,
          Latitude: lat,
          altitude: !isEmpty(coords.altitude) ? formatNumberWithDecimals(coords.altitude, 2) : null,
          Orientation: !isEmpty(coords.heading) ? formatNumberWithDecimals(coords.heading, 2) : null,
          speed: !isEmpty(coords.speed) ? formatNumberWithDecimals(coords.speed, 2) : null,
          Accuracy: coords.accuracy ? formatNumberWithDecimals(coords.accuracy, 2) : null,
          OBJECTID: getObjectId(this.locationDataSourceKey),
          LineID: null
        }
        if (this.state.tempTracksWithLine) {
          track.LineID = this.state.tempTracksWithLine.line.OBJECTID
          this.updateTrackLine(track, false)
          this.setState({
            points: this.state.points.concat([track])
          })
        } else {
          track.LineID = getObjectId(this.pathDataSourceKey, this.state.trackLines.length === 0)
          this.updateTrackLine(track, true)
          this.setState({
            points: [track]
          })
        }
        zoomToGraphics(this.state.jimuMapView, [getPointGraphic(track)], this.props.config.zoomScale ?? ZOOM_SCALE, this.props.config.zoomToLocation ?? ZOOM_TO_LOCATION)
        this.setState({ position: this.props.config.highlightLocation ?? HIGHLIGHT_LOCATION ? transCoords : null })
        executeTimeoutFunction()
      }, () => {
        executeTimeoutFunction()
        this.handleWarning()
      }, { ...defaultOptions, timeout: timeOut })
      this.setState({ watchId: wId })
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      // stop watch
      clearWatch(this.state.watchId)
      this.setState({ watchId: null })
      this.handleWatchingFinished(isForceStop)
    }
  }

  /**
 * Change visibility of the layer Created by DataSourceId
 * @param dataSourceIds DataSourceIds []
 * @param visible Boolean
 * @param type 1:LocationLayerVisible 2:PathLayerVisible 3:LocationLayerVisible and PathLayerVisible
 */
  handleLayerVisibleChange(dataSourceIds: string[], visible: boolean, type: number) {
    // show or hide layer
    if (this.state.jimuMapView) {
      dataSourceIds.forEach(dataSourceId => {
        if (dataSourceId) {
          const layerView = this.state.jimuMapView.getJimuLayerViewByDataSourceId(dataSourceId)
          if (layerView) {
            layerView.layer.visible = visible
          }
          if (type === 1) {
            this.setState({ locationLayerVisible: visible })
          } else if (type === 2) {
            this.setState({ pathLayerVisible: visible })
          } else if (type === 3) {
            this.setState({ locationLayerVisible: visible })
            this.setState({ pathLayerVisible: visible })
          }
        }
      })
    }
  }

  handleClear() {
    this.setState({ confirmType: 'clear', clearRecordsConfirmOpen: true })
  }

  clearStores = async (): Promise<void> => {
    this.setState({
      operation: Operations.CLEAR,
      locationOperation: Operations.CLEAR,
      position: null,
      tracks: [],
      track: null,
      trackLines: [],
      trackLinePointsList: [],
      operationRecords: [],
      trackLinePoints: [],
      tracksWithLine: null,
      points: [],
      tempTracksWithLine: null,
      showActionBtn: false,
      locationLayerVisible: true,
      pathLayerVisible: true
    })
    return Promise.resolve()
  }

  handleDelete(args: { track: TrackPoint }) {
    const { track } = args
    if (this.state.tracks.length > 0 && this.state.tracks[0].OBJECTID === track.OBJECTID) {
      this.setState({ position: null })
    }
    this.setState({ operation: Operations.DELETE, track: track })
  }

  handleConfirmOk = () => {
    switch (this.state.confirmType) {
      case 'point':
        this.handleDelete(this.state.deleteTrackArgs)
        break
      case 'line':
        this.onHandleLineDelete(this.state.deleteLineArgs)
        break
      case 'clear':
        this.clearStores()
        break

      default:
        break
    }
    this.setState({ clearRecordsConfirmOpen: false })
  }

  onHandleLineDelete(args: { track: TrackLinePoint, line: TrackLine, type: string }) {
    const { track, line, type } = args
    const tracksWithLine: TracksWithLine = { tracks: [], line: null }
    if (type === 'point') {
      tracksWithLine.line = this.state.trackLines.find(line => line.OBJECTID === track.LineID)
      const tracks: TrackLinePoint[] = this.state.trackLinePointsList.find(m => m.some(n => n.OBJECTID === track.OBJECTID))
      // get other points
      const otherPoints = tracks.filter(point => point.OBJECTID !== track.OBJECTID)
      if (this.state.tempTracksWithLine && this.state.tempTracksWithLine.line && this.state.tempTracksWithLine.line.OBJECTID === track.LineID) {
        tracksWithLine.line = this.state.tempTracksWithLine.line
        if (otherPoints.length === 0) {
          // delete line and points
          tracksWithLine.tracks = []
          this.setState({
            position: null,
            operationRecords: tracks,
            locationOperation: Operations.DELETE,
            tracksWithLine: null,
            points: [],
            tempTracksWithLine: tracksWithLine
          })
        } else {
          tracksWithLine.tracks = otherPoints
          this.setState({
            operationRecords: [track],
            locationOperation: Operations.DELETE,
            tempTracksWithLine: tracksWithLine
          })
        }
      } else {
        // if the line has two points, delete the line
        const isDeleteLine = tracks.length < 3
        tracksWithLine.tracks = isDeleteLine ? tracks : otherPoints
        this.setState({
          operationRecords: isDeleteLine ? tracks : [track],
          locationOperation: Operations.DELETE,
          operation: isDeleteLine ? Operations.DELETE : Operations.UPDATE,
          tracksWithLine: tracksWithLine
        })
      }
    } else if (type === 'line') {
      tracksWithLine.tracks = this.state.trackLinePointsList.find(m => m.some(n => n.LineID === line.OBJECTID))
      tracksWithLine.line = line
      this.setState({
        operationRecords: tracksWithLine.tracks,
        locationOperation: Operations.DELETE,
        operation: Operations.DELETE,
        tracksWithLine: tracksWithLine
      })
    }
  }

  handleSelection = (ids: string[], type: string) => {
    if (type === 'point') {
      this.setState({ selectedPointIds: ids })
    } else if (type === 'line') {
      this.setState({ selectedLineIds: ids })
    }
  }

  handleFilter = (ids: number[], type: string) => {
    if (type === 'point') {
      this.setState({ notFilterPointIds: ids })
    } else if (type === 'line') {
      this.setState({ notFilterLineIds: ids })
    }
  }

  handleWarning(warnType: number = 1) {
    this.setState({ isWarning: true, warnType: warnType })
    setTimeout(() => {
      this.setState({ isWarning: false })
    }, 3000)
  }

  renderDataActionList(index: number, condition: boolean) {
    if (!condition) return null
    const dataSource = this.state.dataSources?.[index]
    const fields = index === 0 ? this.state.selectedFields : this.state.selectedLineFields
    return (
      <DataActionList
        widgetId={this.props.id}
        dataSets={[{ dataSource, type: 'selected', records: dataSource?.getSelectedRecords(), name: dataSource?.getLabel(), fields: fields }]}
        listStyle={DataActionListStyle.Dropdown}
        buttonType='tertiary'
      />
    )
  }

  onActiveViewChange = async (activeJimuMapView: JimuMapView) => {
    if (!(activeJimuMapView && activeJimuMapView.view)) {
      return
    }
    await activeJimuMapView.whenJimuMapViewLoaded().finally(() => {
      this.setState({ loading: false })
    })
    this.setState({ loading: false })
    this.setState({ jimuMapView: activeJimuMapView })
  }

  handleCurrentDataSource = async (id: string) => {
    const dataSource = this.dsManager.getDataSource(id)
    const queryResult = await (dataSource as FeatureLayerDataSource)?.queryCount({ where: '1=1', returnGeometry: false }, { scope: QueryScope.InRemoteConfigView })
    this.setState({ currentDataSourceId: id, showActionBtn: queryResult?.count > 0 })
  }

  render() {
    const icon = typeof (this.props.icon) === 'string' ? this.props.icon : this.props.icon.svg
    const watchLocation = (this.props.config.watchLocation ?? WATCH_LOCATION)
    const arrangement = this.props.config.arrangement ?? DEFAULT_ARRANGEMENT
    const manualPathTracing = (this.props.config.watchLocationSettings?.manualPathTracing) ?? MANUAL_PATHTRACING
    const symbolColor = this.props.config.highlightInfo?.symbolColor ?? SYMBOL_COLOR
    const highlightLocation = this.props.config.highlightLocation ?? HIGHLIGHT_LOCATION
    const showCompassOrientation = this.props.config.highlightInfo?.showCompassOrientation ?? SHOW_COMPASS_ORIENTATION
    const showLocationAccuracy = this.props.config.highlightInfo?.showLocationAccuracy ?? SHOW_LOCATION_ACCURACY
    const scale = this.props.config.zoomScale ?? ZOOM_SCALE
    const useMapWidget = this.props.useMapWidgetIds &&
      this.props.useMapWidgetIds[0]
    const showRuntimeLayers = this.props.config.showRuntimeLayers ?? true
    let highlightLocationContent = null
    let jimuMapViewContent = null
    if (this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 1) {
      jimuMapViewContent = <JimuMapViewComponent
        useMapWidgetId={this.props.useMapWidgetIds?.[0]}
        onActiveViewChange={this.onActiveViewChange}
        onViewsCreate={(views) => {
          this.setState({
            jimuMapViews: views
          })
        }}
      />
    }
    const enableDataAction = this.props.enableDataAction === undefined ? true : this.props.enableDataAction
    let content = null
    let dsContent = null
    // must select a Map
    if ((this.props.config.useMapWidget ?? USE_MAPWIDGET) ? !useMapWidget : true) {
      const message = arrangement === Arrangement.Panel ? this.trackLabel : null
      content = (
        <div className={arrangement === Arrangement.Toolbar ? 'widget-track-panel' : 'widget-track'} >
          <WidgetPlaceholder icon={require('./assets/icon.svg')} name={message} />
        </div>
      )
    } else {
      // trackOutput DataSource
      let trackDs = null
      let lineTrackDs = null
      let trackLineDs = null

      if (this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 1 && this.props.outputDataSources?.length > 0 && !watchLocation && this.state.jimuMapView) {
        trackDs = (
          <TrackOut
            widgetId={this.props.widgetId}
            layerVisible={this.state.locationLayerVisible}
            highlightLocation={highlightLocation}
            symbolColor={symbolColor}
            track={this.state.track}
            tracks={this.state.tracks}
            operation={this.state.operation}
            showRuntimeLayers={showRuntimeLayers}
            selectedFields={this.state.selectedFields}
            onCreate={this.onTrackDataSourceCreated}
            onTracksChange={this.onTracksChange}
            onHandleSelection={this.handleSelection}
            onHandleFilter={this.handleFilter}
            handleLayerVisibleChange={(ids: string[], visible: boolean) => {
              this.handleLayerVisibleChange(ids, visible, 1)
            }}
            dataSourceId={this.props.outputDataSources?.[0]}
            jimuMapView={this.state.jimuMapView}
          />
        )
      } else {
        trackDs = null
      }
      if (this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 1 && this.props.outputDataSources?.length > 1 && watchLocation && this.state.jimuMapView) {
        lineTrackDs = (
          <TrackLinePointOut
            widgetId={this.props.widgetId}
            layerVisible={this.state.locationLayerVisible}
            highlightLocation={highlightLocation}
            symbolColor={symbolColor}
            tracks={this.state.trackLinePoints}
            operationRecords={this.state.operationRecords}
            operation={this.state.locationOperation}
            dataSourceId={this.props.outputDataSources?.[0]}
            jimuMapView={this.state.jimuMapView}
            showRuntimeLayers={showRuntimeLayers}
            selectedFields={this.state.selectedFields}
            onCreate={this.onTrackDataSourceCreated}
            onLinePointsRecordsChanges={this.onLinePointsRecordsChanges}
            onHandleSelection={this.handleSelection}
            onHandleFilter={this.handleFilter}
            handleLayerVisibleChange={(dataSourceIds: string[], visible: boolean, type: number) => {
              this.handleLayerVisibleChange(dataSourceIds, visible, type)
            }}
          />
        )
        trackLineDs = (
          <TrackLineOut
            widgetId={this.props.widgetId}
            widgetLabel={this.props.manifest.name}
            layerVisible={this.state.pathLayerVisible}
            highlightLocation={highlightLocation}
            symbolColor={symbolColor}
            tracksWithLine={this.state.tracksWithLine}
            tempTracksWithLine={this.state.tempTracksWithLine}
            trackLines={this.state.trackLines}
            trackLinePoints={this.state.trackLinePointsList}
            operation={this.state.operation}
            dataSourceId={this.props.outputDataSources?.[1]}
            jimuMapView={this.state.jimuMapView}
            onLinesChanges={this.onLinesChanges}
            onHandleFilter={this.handleFilter}
            showRuntimeLayers={showRuntimeLayers}
            onCreate={this.onLineDataSourceCreated}
            onHandleSelection={this.handleSelection}
            handleLayerVisibleChange={(dataSourceIds: string[], visible: boolean, type: number) => {
              this.handleLayerVisibleChange(dataSourceIds, visible, type)
            }}
          />
        )
      } else {
        lineTrackDs = null
        trackLineDs = null
      }
      const warningMessage = this.state.warnType === 2 ? this.props.intl.formatMessage({ id: 'trackLineError', defaultMessage: defaultMessages.trackLineError }) : this.props.intl.formatMessage({ id: 'locationError', defaultMessage: defaultMessages.locationError })

      if (arrangement === Arrangement.Toolbar) {
        // bar style
        const visibleTitle = this.state.locationLayerVisible ? this.props.intl.formatMessage({ id: 'hideOnMap', defaultMessage: defaultMessages.hideOnMap }) : this.props.intl.formatMessage({ id: 'showOnMap', defaultMessage: defaultMessages.showOnMap })
        const trackPathTitle = this.props.intl.formatMessage({ id: 'trackPath', defaultMessage: defaultMessages.trackPath })
        const btnTitle = this.state.tracking ? this.props.intl.formatMessage({ id: 'endTracking', defaultMessage: defaultMessages.endTracking }) : this.props.intl.formatMessage({ id: 'startTracking', defaultMessage: defaultMessages.startTracking })
        const pinTitle = this.props.intl.formatMessage({ id: 'getLocation', defaultMessage: defaultMessages.getLocation })
        const visibleIcon = !watchLocation ? this.state.locationLayerVisible : this.state.locationLayerVisible || this.state.pathLayerVisible
        content = (
          <div className='widget-track-panel p-2' >

            {jimuMapViewContent}
            <div className='header-section'>
              {this.state.loading && <Loading type={LoadingType.Secondary} />}
              <div className='left'>
                <Icon className='track-icon' icon={icon} size="m" color={this.props.theme.sys.color.surface.paperText} />
                <div className='track-name'>{this.props.label}</div>
                {this.state.isWarning && <Alert
                  aria-live="polite"
                  buttonType='tertiary'
                  form="tooltip"
                  placement="bottom"
                  size="small"
                  type='warning'
                  withIcon
                  leaveDelay={700}
                >{warningMessage}</Alert>
                }
              </div>
              <div className='right'>
                {manualPathTracing && this.state.tracking &&
                  <Tooltip title={trackPathTitle} placement='bottom'>
                    <Button className='ml-auto' color='inherit' icon size='sm' variant='text' onClick={() => { this.handleTrackPath() }} aria-label={visibleTitle}>
                      <TracePathOutlined />
                    </Button>
                  </Tooltip>
                }
                <Tooltip title={visibleTitle} placement='bottom'>
                  <Button className='ml-auto' color='inherit' icon size='sm' variant='text' onClick={() => { this.handleLayerVisibleChange(Array.from(this.props.outputDataSources), !visibleIcon, 3) }} aria-label={visibleTitle}>
                    {visibleIcon ? <VisibleOutlined /> : <InvisibleOutlined />}
                  </Button>
                </Tooltip>
                {this.state.showActionBtn && !this.state.tracking && <Tooltip title={this.props.intl.formatMessage({ id: 'clearResult', defaultMessage: defaultMessages.clearResult })} placement='bottom'>
                  <Button className='ml-auto' color='inherit' icon size='sm' variant='text' onClick={() => { this.handleClear() }} aria-label={this.props.intl.formatMessage({ id: 'clearResult', defaultMessage: defaultMessages.clearResult })}>
                    <TrashOutlined />
                  </Button>
                </Tooltip>}
                {this.state.showActionBtn && (<span className='tool-dividing-line'></span>)}
                {!watchLocation &&
                  <Tooltip title={pinTitle} placement='bottom'>
                    <Button className='ml-auto' color='inherit' icon size='sm' variant='text' onClick={() => { this.getLocation() }} aria-label={visibleTitle}>
                      <PinEsriOutlined />
                    </Button>
                  </Tooltip>}
                {watchLocation && !this.state.tracking &&
                  (<Tooltip title={btnTitle} placement='bottom'>
                    <Button className='ml-auto' color='inherit' icon size='sm' variant='text' onClick={() => { this.handleTracking(true) }} aria-label={visibleTitle}>
                      <PlayOutlined />
                    </Button>
                  </Tooltip>)}
                {watchLocation && this.state.tracking && (<Tooltip title={btnTitle} placement='bottom'>
                  <Button className='ml-auto' color='inherit' icon size='sm' variant='text' onClick={() => { this.handleTracking(false) }} aria-label={visibleTitle}>
                    <PauseOutlined />
                  </Button>
                </Tooltip>)}
              </div>

            </div>
          </div>
        )
      } else {
        // head
        let headerContent = null
        headerContent = (
          <div className='header-section'>
            <Alert
              className='warning-inaccessible'
              type='warning'
              open={this.state.isWarning}
              closable
              withIcon
              text={warningMessage}
              onClose={() => { this.setState({ isWarning: false }) }}
            />
            <div className='left'>
              <Icon className='track-icon' icon={icon} size="m" color={this.props.theme.sys.color.surface.paperText} />
              <div className='track-name'>{this.props.label}</div>
            </div>
            {this.state.showActionBtn && <div className='right'>
              <Tooltip title={this.props.intl.formatMessage({ id: 'clearResult', defaultMessage: defaultMessages.clearResult })} placement='bottom'>
                <span>
                  <Button className='ml-auto' color='inherit' icon size='sm' variant='text' disabled={this.state.tracking} onClick={() => { this.handleClear() }} aria-label={this.props.intl.formatMessage({ id: 'clearResult', defaultMessage: defaultMessages.clearResult })}>
                    <TrashOutlined />
                  </Button>
                </span>
              </Tooltip>
              {enableDataAction && <span className='tool-dividing-line'></span>}

              {enableDataAction && (
                <React.Fragment>
                  {this.renderDataActionList(0, !watchLocation || (watchLocation && this.state.currentDataSourceId === this.state.dataSources?.[0]?.id))}
                  {watchLocation && this.renderDataActionList(1, this.state.currentDataSourceId === this.state.dataSources?.[1]?.id)}
                </React.Fragment>
              )}
            </div>
            }

          </div>
        )

        let trackContent = null
        let btnContent = null
        if (!watchLocation) {
          const btnTitle = this.props.intl.formatMessage({ id: 'getLocation', defaultMessage: defaultMessages.getLocation })
          btnContent = (
            <div className='btn-content'>
              <Tooltip title={btnTitle} placement='bottom'>
                <span>
                  <Button type='primary' className='btn' disabled={this.state.loading} aria-label={btnTitle} onClick={() => { this.getLocation() }}>{btnTitle}
                    {this.state.loading && <Loading type={LoadingType.Secondary} />}
                  </Button>
                </span>
              </Tooltip>
            </div>)
          trackContent = (
            <TrackView
              theme={this.props.theme}
              dataSource={this.state.trackSource}
              dataSourceId={this.props.outputDataSources?.[0]}
              layerVisible={this.state.locationLayerVisible}
              tracks={this.state.tracks}
              selectedFields={this.state.selectedFields}
              selectedIds={this.state.selectedPointIds}
              notFilterPointIds={this.state.notFilterPointIds}
              jimuMapView={this.state.jimuMapView}
              onHandleDelete={(track: TrackPoint) => {
                this.setState({
                  deleteTrackArgs: { track: track },
                  clearRecordsConfirmOpen: true,
                  confirmType: 'point'
                })
              }}
              handleLayerVisibleChange={(dataSourceIds: string[], visible: boolean, type: number) => {
                this.handleLayerVisibleChange(dataSourceIds, visible, type)
              }}
              scale={scale}
              loading={this.state.loading}
            />
          )
        } else {
          trackContent = (
            <TrackLineView
              theme={this.props.theme}
              dataSourceId={this.props.outputDataSources?.[0]}
              dataSource={this.state.trackSource}
              lineDataSource={this.state.lineDataSource}
              lineDataSourceId={this.props.outputDataSources?.[1]}
              jimuMapView={this.state.jimuMapView}
              tracks={this.state.trackLinePointsList}
              trackLines={this.state.trackLines}
              tempTracksWithLine={this.state.tempTracksWithLine}
              scale={scale}
              loading={this.state.loading}
              locationLayerVisible={this.state.locationLayerVisible}
              pathLayerVisible={this.state.pathLayerVisible}
              selectedFields={this.state.selectedFields}
              selectedPointIds={this.state.selectedPointIds}
              selectedLineIds={this.state.selectedLineIds}
              notFilterPointIds={this.state.notFilterPointIds}
              notFilterLineIds={this.state.notFilterLineIds}
              onHandleLineDelete={(track, line, type) => {
                this.setState({
                  deleteLineArgs: { track, line, type },
                  clearRecordsConfirmOpen: true,
                  confirmType: 'line'
                })
              }}
              handleCurrentDataSource={(id) => { this.handleCurrentDataSource(id) }}
              handleLayerVisibleChange={(dataSourceIds, visible, type) => {
                this.handleLayerVisibleChange(dataSourceIds, visible, type)
              }}
            />
          )
          const btnTitle = this.state.tracking
            ? this.props.intl.formatMessage({ id: 'endTracking', defaultMessage: defaultMessages.endTracking })
            : this.props.intl.formatMessage({ id: 'startTracking', defaultMessage: defaultMessages.startTracking })
          const trackPathTitle = this.props.intl.formatMessage({ id: 'trackPath', defaultMessage: defaultMessages.trackPath })

          btnContent =
            (<div className='btn-content-trace'>
              {manualPathTracing &&
                <Tooltip title={trackPathTitle} placement='bottom'>
                  <span className='btn-span' >
                    <Button className='btn-trace' color='inherit' disabled={!this.state.tracking} icon size='sm' variant='text' onClick={(e) => { e.stopPropagation(); if (this.state.tracking) { this.handleTrackPath() } }} aria-label={trackPathTitle}>
                      <TracePathOutlined />
                    </Button>
                  </span>
                </Tooltip>
              }
              <Tooltip title={btnTitle} placement='bottom'>
                <span>
                  <Button type='primary' className='btn-auto' disabled={this.state.loading} aria-label={btnTitle} onClick={() => { this.handleTracking(!this.state.tracking) }}>{btnTitle}
                    {this.state.loading && <Loading type={LoadingType.Secondary} />}
                  </Button>
                </span>
              </Tooltip>
            </div>)
        }

        content = (
          <div className='widget-track  px-4 pt-2 pb-4'>
            {headerContent}
            {trackContent}
            {btnContent}
            {jimuMapViewContent}
          </div>
        )
      }
      dsContent = (
        <React.Fragment>
          {trackDs}
          {lineTrackDs}
          {trackLineDs}
        </React.Fragment>
      )
    }

    highlightLocationContent = (
      <HighLightLocation
        jimuMapView={this.state.jimuMapView}
        graphicsLayerId={this.state.graphicsLayerId}
        highlightLocation={highlightLocation}
        position={this.state.position}
        showCompassOrientation={showCompassOrientation}
        showLocationAccuracy={showLocationAccuracy}
        watchLocation={watchLocation}
        layerVisible={this.state.locationLayerVisible}
      />
    )
    return (
      <Paper shape='none' css={getStyle(this.props.theme, getAppStore().getState()?.appContext?.isRTL, this.props.autoWidth, this.props.autoHeight)} className="jimu-widget">
        {content}
        {dsContent}
        {highlightLocationContent}
        {
          this.state.clearRecordsConfirmOpen &&
          <ConfirmDialog
            level='warning'
            title={this.props.intl.formatMessage({ id: 'clearRecordsConfirm', defaultMessage: defaultMessages.clearRecordsConfirm })}
            hasNotShowAgainOption={false}
            content={''}
            onConfirm={this.handleConfirmOk}
            onClose={() => { this.setState({ clearRecordsConfirmOpen: false }) }}
          />
        }
      </Paper>
    )
  }
}
