import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import type { RotateDirection, PathDirection, AroundMapCenterItemConfig } from '../../../config'
import AuxHelper from '../helpers/aux-lines-helper'
import Animate from './common/animate/animate'
import AbortSignalHandler from './common/animate/abort-signal-handler'
import LiveviewSetting, { type LiveViewSettingOptions, type LiveviewSettingState } from './common/liveview-setting'
import * as utils from '../../utils/utils'

export enum ControllerMode {
  // ViewSnapshot = 'VIEW',
  Rotate = 'ROTATE', // config.FlyItemMode.Rotate,
  Smoothed = 'CURVED', // config.PathStyle.Smoothed,
  RealPath = 'LINE', // config.PathStyle.RealPath
  AroundMapCenter = 'AROUND_MAP_CENTER'
}

export interface ControllerConfig {
  cameraInfo?: __esri.Camera
  liveviewSettingState?: LiveviewSettingState
}

export interface InitParams {
  id?: string// uuid
  type: ControllerMode
  geometry: __esri.Geometry
  direction: RotateDirection | PathDirection

  config: ControllerConfig

  sceneView: __esri.SceneView
  flyCallbacks: FlyStateChangeCallbacks
}

export interface prepareOptions {
  animate?: boolean
  angleLimit?: number
  duration?: number
  waitingForTerrain?: boolean
  // AroundMapCenter
  // pauseTime: number
  aroundMapCenterConfig?: AroundMapCenterItemConfig
}
export interface flyOptions {
  animate?: boolean
  speedFactor?: number
  // reset the view to the starting point once flying is done ,#957
  resetCameraWhenFinished?: boolean
}
export interface stopOptions {
  ignoreResetCameraWhenFinished?: boolean
}

export interface CameraGL {
  lookAt: number[]
  camPos: number[]
  up: any
  type?: any
}

export interface FlyStateChangeCallbacks {
  // onLoading?: (() => void)
  onPreparing?: () => void
  onFly?: () => void// running fly
  onPause?: () => void
  onFinish?: () => void// finish

  onUpdateProgress?: (number) => void
}

export enum FlyState {
  // init
  INITED = -1,
  // before fly
  PREPARING = 0, // flying to init cam pos
  PREPARED, // inited cam after draw
  // flying
  // READY = 'ready',
  RUNNING,
  // PAUSED = 'paused',
  // INTERRUPTED = 'interrupted',
  // RESUME = 'resume',
  // stop
  STOPPED,
  // continue to slow down
  // DAMPING
}

// export interface HitTestRes {
//   z: number
//   dis: number
// }

export default abstract class BaseFlyController {
  libVec3f64: any; libVec3: any; vec3: any; vec3d: any
  libMat4f64: any; libMat4: any; mat4: any; mat4d: any
  libQuatf64: any; libQuat: any; quat: any; quatd: any
  //externalRenderers: __esri.externalRenderers
  //cameraUtils: any
  apiWebGLUtils: any
  Point: any // __esri.Point;
  esriMathUtils: any
  Camera: typeof __esri.Camera = null
  reactiveUtils: __esri.reactiveUtils

  id?: string
  type: ControllerMode
  geometry: __esri.Geometry
  direction: RotateDirection | PathDirection
  cameraInfo?: __esri.Camera

  sceneView: __esri.SceneView
  flyCallbacks: FlyStateChangeCallbacks

  // elements
  auxHelper?: AuxHelper
  // animate
  animate: Animate
  // liveviewSetting
  liveviewSetting: LiveviewSetting

  // state
  flyState?: FlyState
  isLiveviewMode?: boolean // is in setting mode
  shownProgress?: number
  // animatState?: AnimateState
  // 2 cache
  _cache?: {
    // path
    paths?: any
    // cache
    cachedGeo: any
    cameraGL?: {
      pos: any
      upDir: any
    }
    lookAtTargetGL?: {
      pos: any
      upAxis: any
      baseAlt: any
    }
  }

  // 3 tmp flags
  resetCameraWhenFinishedFlag: boolean // reset to position when finish draw/select line ,#957

  eventHandlers: __esri.Handle[]
  abortSignalHandler: AbortSignalHandler

  _isDebug: boolean
  DEBUG: {
    planTime: number
    startTime: number
    endTime: number
  }

  async setup (param: InitParams): Promise<BaseFlyController> {
    await loadArcGISJSAPIModules([
      'esri/core/libs/gl-matrix-2/vec3f64',
      'esri/core/libs/gl-matrix-2/mat4f64',
      'esri/core/libs/gl-matrix-2/vec3',
      'esri/core/libs/gl-matrix-2/mat4',
      'esri/core/libs/gl-matrix-2/quatf64',
      'esri/core/libs/gl-matrix-2/quat',
      //'esri/views/3d/externalRenderers',
      'esri/views/3d/webgl',
      'esri/geometry/Point',
      'esri/views/3d/support/mathUtils',
      'esri/core/reactiveUtils',
      'esri/Camera'
    ]).then(async (modules) => {
      [
        this.libVec3f64, this.libMat4f64, this.libVec3, this.libMat4, this.libQuatf64, this.libQuat,
        /*this.externalRenderers,*/ this.apiWebGLUtils,
        this.Point, this.esriMathUtils, this.reactiveUtils, this.Camera
      ] = modules
      this.vec3 = this.libVec3.vec3; this.vec3d = this.libVec3f64.vec3f64
      this.mat4 = this.libMat4.mat4; this.mat4d = this.libMat4f64.mat4f64
      this.quat = this.libQuat.quat; this.quatd = this.libQuatf64.quatf64

      await this.clear()
      const { id, type, geometry, direction, config, sceneView, flyCallbacks } = param
      this.id = id
      this.type = type
      this.geometry = geometry
      this.direction = direction

      this.cameraInfo = config.cameraInfo
      if (utils.isDefined(config.liveviewSettingState)) {
        this.liveviewSetting.setState(config.liveviewSettingState)
      }

      this.sceneView = sceneView
      this.flyCallbacks = flyCallbacks

      // debug
      this._isDebug = false
      if (this._isDebug) {
        this.auxHelper = new AuxHelper({ sceneView: this.sceneView })
      }
      this.DEBUG = {
        planTime: 0,
        startTime: 0,
        endTime: 0
      }
      // events
      // this.sceneView.on('key-down', ((event) => {
      //   if (FlyState.RUNNING === this.flyState) {
      //     let keyPressed = event.key;
      //     if (keyPressed.slice(0, 5) === 'Arrow') {
      //       event.stopPropagation(); // prevents panning with the arrow keys
      //     }
      //   }
      // }));
      // this.sceneView.on('drag', ((event) => {
      //   if (FlyState.RUNNING === this.flyState) {
      //     if ('start' === event.action) {
      //       this.pause();
      //     } else {
      //       event.stopPropagation(); //update===event.action
      //     }
      //   } else if (FlyState.PAUSED === this.flyState) {
      //     if ('end' === event.action) {
      //       //event.stopPropagation();
      //     }
      //   }
      // }));
      // this._cache.mouse = {};
      this.eventHandlers.push(this.sceneView.on('drag', (event) => {
        if (this.flyState <= FlyState.RUNNING/* || FlyState.PREPARING === this.flyState */) { // in flying
          if (event.action === 'start') {
            //this.pause()
            this.handleMapInteractionStart()
          } else {
            // event.stopPropagation()
          }
        }

        if (event.action === 'end') {
          this.handleMapInteractionEnd()
        }
      })
      )
      this.eventHandlers.push(this.sceneView.on('mouse-wheel', (event) => {
        if (this.flyState <= FlyState.RUNNING/* || FlyState.PREPARING === this.flyState */) {
          //this.pause()
          this.handleMapInteractionStart(event)
        }
      })
      )
      // return Promise.resolve(this);
    })
    return this
  }

  destructor (): void {
    this.onStop()
    this.clear()
  }

  // states check
  isInited (): boolean {
    return (this.flyState >= FlyState.INITED)
  }

  isEnableToFly (): boolean {
    const state = this.flyState
    if (state === FlyState.PREPARED || state === FlyState.STOPPED || state === FlyState.PREPARING) {
      return true
    } else {
      return false//, RUNNING,
    }
  }

  isEnableToPause (): boolean {
    const state = this.flyState
    if (state >= FlyState.PREPARING) { // flying | going to init pos
      return true
    } else {
      return false
    }
  }

  // fly lifecycle
  init (/* opts: InitOptions */): void {
    this.flyState = FlyState.INITED
    this.animate.reset()
  }

  abstract prepare (opts?: prepareOptions): Promise<boolean>
  abstract fly (opts?: flyOptions): Promise<any>
  /* imp this handler by controllers (e,g: pause, reset timer... ) */
  abstract handleMapInteractionStart (event?): void
  abstract handleMapInteractionEnd (opts?: flyOptions): Promise<any>

  async preparing (): Promise<any> {
    this.flyState = FlyState.PREPARING

    if (typeof this.flyCallbacks?.onPreparing === 'function') {
      this.flyCallbacks.onPreparing()
    }

    return await new Promise((resolve) => { resolve(null) })
  }

  async prepared (): Promise<any> {
    this.flyState = FlyState.PREPARED

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(null)
      }, 50)
  })
  }

  _doFly (): void {
    if (!this.isLiveviewMode) {
      this.onStart()
    }
  }

  // config
  setConfig (controllerConfig: ControllerConfig): void {
    this.cameraInfo = controllerConfig.cameraInfo
    this.liveviewSetting.setState(controllerConfig.liveviewSettingState)
  }

  getConfig (): ControllerConfig {
    return {
      cameraInfo: this.cameraInfo,
      liveviewSettingState: this.liveviewSetting.getState()
    }
  }

  async pause (): Promise<boolean> {
    if (!this.isEnableToPause()) {
      return false// await Promise.resolve()
    }
    // console.log('async pause () -------')
    this.stopAnimat()
    this.onPause()

    return await new Promise((resolve) => { resolve(true) })
  }

  async resume (animate?: boolean): Promise<any> {
    // this.flyState = FlyState.RESUME;
  }

  _resume = async (fun): Promise<boolean> => {
    // try {
    await this.preparing()
    // goBack to pause point, then go on flying
    const isContinue = await fun
    if (!isContinue) {
      return false
    }

    await this.prepared()
    // if (this.state._debugTime) {
    //   this._debugTimeStart();
    // }
    this._doFly()

    return true
    // } catch (error) {
    //   console.log('rejected:', error)
    //   throw error
    // }
  }

  stop (opts?: stopOptions): void {
    // if (this.state?._debugTime) {
    //   this._debugTimeEnd();
    //   this._debugDeltaTime();
    // }
    this.stopAnimat()
    // this.clear();
    this.onStop()
  }

  async clear (): Promise<any> {
    // clean events
    if (utils.isDefined(this.eventHandlers)) {
      this.eventHandlers.forEach((handler) => {
        handler.remove()
      })
    }
    this.eventHandlers = null
    this.eventHandlers = []

    if (this.abortSignalHandler) {
      this.abortSignalHandler.abort()
    }
    this.abortSignalHandler = null
    this.abortSignalHandler = new AbortSignalHandler()

    if (this._isDebug) {
      this.auxHelper?.clearAll()
    }
    if (utils.isDefined(this._cache?.paths)) {
      this._cache?.paths.destructor()
    }

    this.id = null
    this.type = null
    this.geometry = null
    this.direction = null
    this.cameraInfo = null

    this.sceneView = null
    this.flyCallbacks = null

    // elements
    // param: ControllerState;
    // flyStyle: FlyItemMode;
    this.auxHelper = null
    // animate
    this.animate?.stop()
    this.animate = null
    this.animate = await new Animate().setup()
    // liveviewSetting
    this.liveviewSetting = null
    this.liveviewSetting = new LiveviewSetting()

    // state
    this.flyState = null
    this.isLiveviewMode = false
    this.shownProgress = 0
    // animatState?: AnimateState
    // 2 cache
    this._cache = {
      // path
      paths: null,
      // cache
      cachedGeo: null,
      // graphics?: GraphicsInfo// drawing on map//(__esri.Graphic)[], [0] is main graphic
      cameraGL: {
        pos: null,
        upDir: null
      },
      lookAtTargetGL: {
        pos: null,
        upAxis: null,
        baseAlt: null
      }
    }

    this.resetCameraWhenFinishedFlag = false

    this._isDebug = false
    this.DEBUG = {
      planTime: null,
      startTime: null,
      endTime: null
    }
  }

  // animate
  async updateAnimat (fun): Promise<any> {
    // this.onStart();
    return await this.animate.update((frameInfo) => { fun(frameInfo) })
  }

  /*private*/
  protected stopAnimat (): void {
    this.animate?.stop()
    this.updateProgressBar()
    // this.flyState = FlyState.STOPPED;
  }

  // liveview setting
  async setIsLiveview (isPreview: boolean): Promise<boolean> {
    this.isLiveviewMode = isPreview
    if (isPreview) {
      return await this.fly({ animate: false })
    } else {
      return await this.pause()
    }
  }

  async setLiveviewSettingInfo (settingParamObj: LiveViewSettingOptions, updateFun): Promise<boolean> {
    if (!utils.isDefined(settingParamObj)) { /* false===this.isLiveviewMode */
      return false
    }

    let shouldSet = false
    const altitude = settingParamObj.altitude
    if (typeof altitude !== 'undefined') {
      shouldSet = true
      this.liveviewSetting.setAltitudeFactor(altitude)
    }

    const tilt = settingParamObj.tilt
    if (typeof tilt !== 'undefined') {
      shouldSet = true
      this.liveviewSetting.setTiltFactor(tilt)
    }

    if (shouldSet && utils.isDefined(this.animate) && this.isLiveviewMode) {
      this.animate.insertAnExtraFrame(async (frameInfo) => {
        await updateFun(frameInfo)
      })
    }

    return await new Promise((resolve) => { resolve(true) })
  }

  abstract getLiveViewSettingInfo (): LiveViewSettingOptions

  // get default duration time
  getDefaultDuration (): number {
    if (this.flyState >= FlyState.PREPARED) {
      return this.animate.getDuration()
    } else {
      return null
    }
  }

  // events
  onStart (): void {
    this.flyState = FlyState.RUNNING

    if (this._isDebug) {
      this.DEBUG.planTime = this.animate.state.interp.time.duration
      this.DEBUG.startTime = new Date().getTime()
    }

    // getAppStore().dispatch(appActions.widgetStatePropChange(this.widgetId, 'flyStart', t));
    if (typeof this.flyCallbacks?.onFly === 'function') {
      this.flyCallbacks.onFly()
    }
  }

  onPause (): void {
    this.abortSignalHandler.abort()

    this.flyState = FlyState.STOPPED// FlyState.PAUSED; //only STOPPED rightnow
    if (typeof this.flyCallbacks?.onPause === 'function') {
      this.flyCallbacks.onPause()
    }
  }

  // onFinish
  onStop (): void {
    this.abortSignalHandler.abort()

    this.flyState = FlyState.STOPPED

    if (this._isDebug) {
      this.DEBUG.endTime = new Date().getTime()
      const constTime = (this.DEBUG.endTime - this.DEBUG.startTime) / 1000
      const panlTime = (this.DEBUG.planTime) / 1000
      console.log('DEBUG 1.fly sum time ==> ' + constTime.toFixed(2) + ' s')
      console.log('DEBUG 2.plan time ==> ' + panlTime.toFixed(2) + ' s')
      const mistake = ((constTime - panlTime) / panlTime) * 100
      console.log('DEBUG 3.mistake ==> ' + mistake.toFixed(5) + ' %')
      // alert('DEBUG: mistake ==> ' + mistake.toFixed(5) + ' % (panlTime: ' + panlTime+' constTime: '+constTime+')');
    }

    // getAppStore().dispatch(appActions.widgetStatePropChange(this.widgetId, 'flyStop', t));
    if (typeof this.flyCallbacks?.onFinish === 'function') {
      this.flyCallbacks.onFinish()
    }
  }

  // progress
  abstract getProgress (): number
  updateProgressBar (): void {
    if (typeof this.flyCallbacks?.onUpdateProgress === 'function') {
      // frequency reduction
      const p = Math.ceil(this.getProgress() * 100)
      let isUpdate = false
      if (p <= 1 || p >= 99) {
        isUpdate = true
      } else if (Math.abs(p - this.shownProgress) >= 1) {
        isUpdate = true
      }

      if (isUpdate) {
        this.shownProgress = p
      }

      if (isUpdate) {
        this.flyCallbacks?.onUpdateProgress(this.shownProgress)
      }
    }
  }

  // debug fly time
  // _debugTimeStart() {
  //   this.state._debug.startTime = new Date().getTime();
  // }
  // _debugTimeEnd() {
  //   this.state._debug.endTime = new Date().getTime();
  // }
  // _debugDeltaTime(): number {
  //   if (this.state._debug.endTime > 0 && this.state._debug.startTime > 0) {
  //     let delta = this.state._debug.endTime - this.state._debug.startTime;
  //     console.log('debug_DeltaTime__' + delta / 1000 + '_s');
  //     alert('debug_DeltaTime__' + delta / 1000 + '_s');
  //     return delta;
  //   } else {
  //     return -1;
  //   }
  // }

  // rotate
  // 3D: scene mode / local mode
  rotateBySceneMode = (cameraPosGL, upVec, rotateSpeed, offsetGL?): number[] => {
    const tmpPos = this.vec3d.fromValues(cameraPosGL[0], cameraPosGL[1], cameraPosGL[2])
    const offsetToOrigin = this.vec3d.create()

    if (utils.isDefined(offsetGL)) {
      this.vec3.negate(offsetToOrigin, offsetGL) // origin - offsetGL
      this.vec3.add(tmpPos, tmpPos, offsetToOrigin)
    }

    const rMatrix = this.mat4d.create()
    this.mat4.rotate(rMatrix, rMatrix, utils.degToRad(rotateSpeed), upVec)
    this.vec3.transformMat4(tmpPos, tmpPos, rMatrix)

    if (utils.isDefined(offsetGL)) {
      this.vec3.subtract(tmpPos, tmpPos, offsetToOrigin)
    }
    return tmpPos
  }

  concatGeoPaths (geo: __esri.Polyline): any[] {
    let paths = []
    for (let i = 0; i < geo.paths.length; i++) {
      paths = paths.concat(geo.paths[i])
    }

    return paths
  }

  // Simplification
  geoCoordToRenderCoord (cachedGeo): any[] {
    const glGeos = []
    for (let i = 0, l = cachedGeo.length; i < l; i++) {
      let p = cachedGeo[i]
      p = utils.geoCoordToRenderCoord([p[0], p[1], p[2]], null, this.sceneView)
      glGeos.push(p)
    }

    return glGeos
  }

  // Elev
  queryGeometryElevInfo = (geometry: __esri.Polyline | __esri.Point): __esri.Geometry => {
    if (utils.isDefined(this.sceneView.groundView?.elevationSampler)) {
      return utils._fixApiElevNoData(this.sceneView.groundView.elevationSampler.queryElevation(geometry), this.sceneView)
    } else if (geometry.hasZ) {
      return geometry
    }
  }
  // getIncreaseSetp = () => {
  //   let step = this.sceneView.scale / 2000;
  //   return step;
  // }
  // hit-test
  // getHitTestInfo = (graphic) => {
  //   //'polyline' === graphic.geometry.type
  //   let paths = graphic.geometry.paths[0];
  //   let point = paths[0];
  //   this._getPointHitTestRes(point[0], point[1], this.sceneView).then((res: HitTestRes) => {
  //     this.setting.initCamPos.fixHeight = 100;//res.z;
  //     this.setting.initCamPos.fixDistance = 100;//res.dis;
  //   })
  // }

  _coordsToGeoArray = (coords): any[] => {
    const geos = []
    let g
    for (let i = 0, len = coords.length; i < len; i++) {
      g = this.vec3d.fromValues(coords[i].x, coords[i].y, coords[i].z)
      geos.push(g)
    }

    return geos
  }

  // GoToOptions
  getPrepareGoToOptionsBeforeTerrainLoaded = (opts: prepareOptions): __esri.GoToOptions3D => {
    const goToParam: __esri.GoToOptions3D = {
      animate: true,
      maxDuration: 4000,
      easing: 'out-expo',
      signal: this.abortSignalHandler.update()
    }
    if (opts && !opts.animate) {
      goToParam.animate = false
      delete goToParam.maxDuration
      delete goToParam.easing
    }

    return goToParam
  }

  getPrepareGoToOptionsAfterTerrainLoaded = (opts: prepareOptions): __esri.GoToOptions3D => {
    const goToParam: __esri.GoToOptions3D = {
      animate: true,
      maxDuration: 1000,
      easing: 'out-expo',
      signal: this.abortSignalHandler.update()
    }
    if (opts && !opts.animate) {
      goToParam.animate = false
      delete goToParam.maxDuration
      delete goToParam.easing
    }

    return goToParam
  }
}
