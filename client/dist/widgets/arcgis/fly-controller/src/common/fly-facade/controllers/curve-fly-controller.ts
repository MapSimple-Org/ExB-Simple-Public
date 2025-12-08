import * as utils from '../../utils/utils'
import BaseFlyController,
{ type flyOptions, type CameraGL, type prepareOptions, type stopOptions } from './base-fly-controller'
import CurvePath from './common/path/curve-path'
import { EasingMode } from './common/animate/ease'
import type { LiveViewSettingOptions } from './common/liveview-setting'
import { getGLCamera } from '../../utils/gl-camera-utils'

export default class CurveFlyController extends BaseFlyController {
  esriMathUtils: any

  worldUpVec: any
  upVec: any

  duration: number

  /// /////////////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////
  async setLiveviewSettingInfo (paramObj: LiveViewSettingOptions): Promise<boolean> {
    return await super.setLiveviewSettingInfo(paramObj, async () => {
      const apiCam = this.getApiCamera(this.getCameraByProgress())

      try {
        await this.sceneView.goTo(apiCam, { animate: false, signal: this.abortSignalHandler.update() })
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('sceneView.goTo() Aborted')
          return false
        } else {
          //throw error
          return false
        }
      }

      return true
    })
  }

  /*
  getFlyTilt = () => {
    // let camGL = this.frameTasks[this._frameIdx];
    // let pos = camGL.cameraGL.pos;
    // let lookAt = camGL.cameraGL.lookAt;
    // let up = camGL.cameraGL.up;

    // let cam2Target = this.vec3d.create();
    // this.vec3.subtract(cam2Target, pos, lookAt);

    // let angle = this.vec3.angle(up, cam2Target);
    // angle = (90 - utils.radToDeg(angle));
    // console.log('angle==>' + angle);

    let task = this.frameTasks[this._frameIdx];
    let pos = task.cameraGL.pos;
    let lookAt = task.cameraGL.lookAt;
    let up = task.cameraGL.up;
////////////////////////////////////////
    let tmp = utils.renderCoordToGeoCoord(lookAt, 1, this.sceneView);
    let initPos = new this.Point({
      x: tmp[0], y: tmp[1], z: tmp[2], type: 'point',
      spatialReference: this.sceneView.spatialReference
    });
    initPos.z = initPos.z + this.getAltitudeFactor();//rawPos + liveview-setting altitude
    lookAt = utils.geoCoordToRenderCoord([initPos.x, initPos.y, initPos.z], null, this.sceneView);

    tmp = utils.renderCoordToGeoCoord(pos, 1, this.sceneView);
    initPos = new this.Point({
      x: tmp[0], y: tmp[1], z: tmp[2], type: 'point',
      spatialReference: this.sceneView.spatialReference
    });
    initPos.z = this.getCameraAltitude();//initPos.z - this.setting.initCamOffset.fixHeight + this.runtimeAltitudeHeight + this.tiltChangedHeight;
    pos = utils.geoCoordToRenderCoord([initPos.x, initPos.y, initPos.z], null, this.sceneView);
////////////////////////////////////////

    let cam2Target = this.vec3d.create();
    this.vec3.subtract(cam2Target, pos, lookAt);

    let angle = this.vec3.angle(up, cam2Target);
    angle = (90 - utils.radToDeg(angle));
    console.log('angle==>' + angle);

    return angle;
  }
  setFlyTilt = (tilt) => {
    let task = this.frameTasks[this._frameIdx];
    let pos = task.cameraGL.pos;
    let lookAt = task.cameraGL.lookAt;
    let up = task.cameraGL.up;
    let tmp = utils.renderCoordToGeoCoord(pos, 1, this.sceneView);
    let initPos = new this.Point({
      x: tmp[0], y: tmp[1], z: tmp[2], type: 'point',
      spatialReference: this.sceneView.spatialReference
    });
    // if(0 == this.runtimeAltitudeHeight){
    //   this.getAltitudeFactor();
    // }
    initPos.z = initPos.z - this.setting.initCamOffset.fixHeight + this.runtimeAltitudeHeight + this.tiltChangedHeight;
    //pos = utils.geoCoordToRenderCoord([initPos.x, initPos.y, initPos.z], null, this.sceneView);
    /////////////////

    tilt = utils.clampTilt(tilt);

    let oldTileAngle = this.getFlyTilt();
    oldTileAngle = utils.degToRad(oldTileAngle);
    let S = initPos.z / Math.tan(oldTileAngle);

    let h = S * Math.tan(utils.degToRad(tilt)); //new cam pos.z
    return h ;
  } */
  getLiveViewSettingInfo (): LiveViewSettingOptions {
    return {
      // heading: camera.heading,
      tilt: null, // this.getFlyTilt(),
      altitude: this.liveviewSetting.getAltitudeFactor(),
      speed: this.liveviewSetting.getSpeedFactor()
    }
  }
  // getCameraAltitude() {
  //   if (this.liveviewSetting.getAltitudeFactor() === 0) {
  //     return this.liveviewSetting.initCamOffset.fixHeight;
  //   }/* else if(this.getAltitudeFactor() < this.setting.initCamOffset.fixHeight){
  //     return this.getAltitudeFactor();
  //   } */else {
  //     return this.liveviewSetting.getAltitudeFactor();
  //   }
  // }
  /// /////////////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////

  async prepare (opts?: prepareOptions): Promise<boolean> {
    let line = this.geometry as __esri.Polyline
    if (line?.type !== 'polyline') {
      // eslint-disable-next-line no-alert
      alert('Wrong geo type!')
      return false
    }

    if (utils.isDefined(opts?.duration)) {
      this.duration = opts.duration
    }

    // if (opts.resetCameraWhenFinished === true) {
    //   this._cache.initCameraPos =
    // }

    super.preparing()

    line = this._updateInitCamera(line)

    if (!this.isLiveviewMode) {
      const d = this.animate.computeDuration()
      this.animate.init(EasingMode.Linear, 0, this.animate.getAmount(), this.duration ?? d)
    }

    if (this._isDebug) {
      this.auxHelper?.drawLineXY(this._cache.paths, 'lightgreen')
    }
    // back fly ?

    // goto init cam-pos
    // 1.fly to point without terrain-info
    try {
      await this.sceneView.goTo(this.getApiCamera(this.getCameraByProgress()), this.getPrepareGoToOptionsBeforeTerrainLoaded(opts))
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('sceneView.goTo() Aborted')
      }
      return false
    }

    if (opts?.waitingForTerrain) {
      // update camera when terrain loaded
      await this.reactiveUtils.whenOnce(() => !this.sceneView.groundView.updating)
      line = this._updateInitCamera(line)

      // 2. fly to point with terrain-info
      try {
        await this.sceneView.goTo(this.getApiCamera(this.getCameraByProgress()), this.getPrepareGoToOptionsAfterTerrainLoaded(opts))
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('sceneView.goTo() Aborted')
        }
        return false
      }

      await this.reactiveUtils.whenOnce(() => !this.sceneView.groundView.updating)
    }
    // console.log("updating==> " + arg)
    // 3. ok, update fly-state
    await super.prepared()
    return true
  }

  _updateInitCamera = (line: __esri.Polyline): __esri.Polyline => {
    line = this.queryGeometryElevInfo(line) as __esri.Polyline
    this._cache.cachedGeo = this.concatGeoPaths(line)
    this._cache.paths = new CurvePath(this._cache.cachedGeo, this.sceneView, this.vec3, this.vec3d, this.esriMathUtils)
    const len = this._cache.paths.getLength()
    this.animate.setAmount(len)
    return line
  }

  async fly (opts?: flyOptions): Promise<any> {
    if (utils.isDefined(opts?.speedFactor)) {
      this.liveviewSetting.setSpeedFactor(opts.speedFactor)
    }

    if (utils.isDefined(opts?.resetCameraWhenFinished)) {
      this.resetCameraWhenFinishedFlag = true
    }

    if (super.isEnableToFly()) {
      return await this.resume(opts.animate)
    } else {
      return await Promise.reject(new Error(null))
    }
  }

  //= >
  // "cameraOfFlyElevation/100*factor"(factor=1) as default speed per frame,
  // eg. factor=2 is double-speed to default, 0.5 is half-speed to default
  // getSpeedByHight = (hight) => {
  //   // let factor = 1; //0.8; //1;
  //   // //let step = hight / 100 * factor;
  //   // let step = this.sceneView.scale / 2000;

  //   // return Math.ceil(step);
  //   return 1;
  // }

  _doFly (): void {
    super._doFly()

    this.updateAnimat((frameInfo) => {
      if (this.isLiveviewMode) {
        // stop there for realtime-setting
      } else {
        this.animate.easing(frameInfo.deltaTime, this.liveviewSetting.getMappingSpeedFactor())
        // console.log("speed==>"+this.liveviewSetting.getMappingSpeedFactor());
      }

      this.updateProgressBar()

      const isStopFly = (this.getProgress() >= 1)
      if (!isStopFly) {
        const task = this.getCameraByProgress()
        const apiCamera = this.getApiCamera(task)
        if (utils.isDefined(apiCamera)) {
          this.sceneView.goTo(apiCamera, { animate: false })
        }
      } else {
        this.animate.reset()
        // TODO goto getProgress ==> 1, after fast fly
        this.stop()
      }
    })
  }

  getProgress = (): number => {
    return this.animate.getProgress()
  }

  getCameraByProgress = (): CameraGL => {
    let move0, move1
    if (this.animate.getProgress() === 0) {
      move0 = this.animate.getAmount() * 0
      this.animate.progressForward()
      move1 = this.animate.getAmount() * this.animate.getProgress()
    } else {
      move0 = this.animate.getAmount() * this.animate.progressBackward()
      if (move0 < 0) {
        move0 = 0
        this.animate.progressForward()
      }
      move1 = this.animate.getAmount() * this.animate.getProgress()
    }

    let point0 = this._cache.paths.getUtoTmapping(0, move0)
    point0 = this._cache.paths.getPoint(point0)
    point0 = this._coordToGeo(point0)

    let point1 = this._cache.paths.getUtoTmapping(0, move1)
    point1 = this._cache.paths.getPoint(point1)
    point1 = this._coordToGeo(point1)

    const elevOffest = parseFloat(point0[2]) + 0
    const startPosGL = utils.geoCoordToRenderCoord([point0[0], point0[1], elevOffest], null, this.sceneView)

    let camPosGL = this.getCameraPosition(point0, point1)
    if (!utils.isDefined(camPosGL)) {
      camPosGL = this._cache.cameraGL.pos
    }

    const worldUpVec = this.vec3d.create()
    this.sceneView.renderCoordsHelper.worldUpAtPosition(camPosGL, worldUpVec) // up-aux-line

    const cameraPosGL = [0, 0, 0]
    cameraPosGL[0] = camPosGL[0]
    cameraPosGL[1] = camPosGL[1]
    cameraPosGL[2] = camPosGL[2]
    const lookAtPosGL = [0, 0, 0]
    lookAtPosGL[0] = startPosGL[0]
    lookAtPosGL[1] = startPosGL[1]
    lookAtPosGL[2] = startPosGL[2]

    // cache
    this._cache.cameraGL.pos = cameraPosGL
    this._cache.cameraGL.upDir = worldUpVec
    this._cache.lookAtTargetGL.pos = lookAtPosGL
    this._cache.lookAtTargetGL.upAxis = null// this.vec3d.create();
    this._cache.lookAtTargetGL.baseAlt = null// lastHit.mapPoint.z;

    return {
      lookAt: lookAtPosGL,
      camPos: cameraPosGL,
      up: worldUpVec
    }
  }

  getApiCamera = (cam): __esri.Camera => {
    let pos = cam.camPos
    let lookAt = cam.lookAt
    const up = cam.up
    if (!utils.isDefined(pos) || !utils.isDefined(lookAt) || !utils.isDefined(up)) {
      return null
    }

    let baseAlt = 0

    // lookAt
    let tmp = utils.renderCoordToGeoCoord(lookAt, 1, this.sceneView)
    let initPos = new this.Point({
      x: tmp[0],
      y: tmp[1],
      z: tmp[2],
      type: 'point',
      spatialReference: this.sceneView.spatialReference
    })
    baseAlt = initPos.z
    initPos.z = parseFloat(initPos.z) + this.liveviewSetting.getAltitudeFactor()// rawPos + liveview-setting altitude
    if (initPos.z < 0) {
      initPos.z = 0
    }
    lookAt = utils.geoCoordToRenderCoord([initPos.x, initPos.y, initPos.z], null, this.sceneView)

    // pos
    tmp = utils.renderCoordToGeoCoord(pos, 1, this.sceneView)
    initPos = new this.Point({
      x: tmp[0],
      y: tmp[1],
      z: tmp[2],
      type: 'point',
      spatialReference: this.sceneView.spatialReference
    })
    initPos.z = baseAlt + this.liveviewSetting.getAltitudeFactor() + this.liveviewSetting.getCamOffsetHeight()
    pos = utils.geoCoordToRenderCoord([initPos.x, initPos.y, initPos.z], null, this.sceneView)

    const glCamera = getGLCamera(this.sceneView, { eye: pos, center: lookAt, up: up })
    const apiCamera = this.apiWebGLUtils.fromRenderCamera(this.sceneView, glCamera)

    return apiCamera
  }

  // test route on the sky
  // private getCameraRoutes = (line) => {
  //   let cameraRoutes = [];
  //   for (let i = 0, len = line.length - 1; i < len; i++) {
  //     let p1 = line[i];
  //     let p2;
  //     if (i === len - 1) {
  //       p2 = p1;
  //     } else {
  //       p2 = line[i + 1];
  //     }

  //     let cp = this.getCameraPosition(p1, p2);
  //     if (cp) {
  //       cameraRoutes.push(cp);
  //     }
  //   }
  //   if (this._isDebug) {
  //     this.auxHelper?.drawLineGL(cameraRoutes, this.sceneView, 'yellow');
  //   }
  //   return cameraRoutes;
  // }

  getCameraPosition = (basePos, nextPos): number[] => {
    if (basePos[0] === nextPos[0] && basePos[1] === nextPos[1] && basePos[2] === nextPos[2]) {
      return null
    }

    const cameraHeight = this.liveviewSetting.getCamOffsetHeight() ?? 100 // metre
    const fixDistance = this.liveviewSetting.getCamOffsetDistance() ?? 100 // metre
    // let fixDistance = fixHeight / Math.tan(utils.degToRad(90 - this.fixTilt));
    // worldUpVec
    // let innerGLCamera_copy = this.sceneView.state.camera.clone();
    // let cameraPos = innerGLCamera_copy.eye;
    // let worldUpVec = this.vec3d.create();
    // this.sceneView.renderCoordsHelper.worldUpAtPosition(cameraPos, worldUpVec); //up-aux-line
    // this.worldUpVec = worldUpVec;

    // 1.init Pos
    const point1GL = utils.geoCoordToRenderCoord([basePos[0], basePos[1], basePos[2]], null, this.sceneView)
    const point2GL = utils.geoCoordToRenderCoord([nextPos[0], nextPos[1], nextPos[2]], null, this.sceneView)

    const vecDir = this.vec3d.create()
    this.vec3.subtract(vecDir, point1GL, point2GL) // dir: 2->1
    const vecLen: number = this.vec3.length(vecDir)

    const vecNor = this.vec3d.create()
    this.vec3.normalize(vecNor, vecDir)

    const tarLen = vecLen + fixDistance // fix distance
    const tmp = this.vec3d.create()
    this.vec3.scale(tmp, vecNor, tarLen)

    const pointTarget = this.vec3d.create()
    this.vec3.add(pointTarget, point2GL, tmp)

    const pMovePos = utils.renderCoordToGeoCoord(pointTarget, 1, this.sceneView)
    const initPos = new this.Point({
      x: pMovePos[0],
      y: pMovePos[1],
      z: pMovePos[2],
      type: 'point',
      spatialReference: this.sceneView.spatialReference
    })
    if (initPos.z < cameraHeight) {
      initPos.z = cameraHeight
    }
    if (initPos.z < 0) { // for under the ground
      initPos.z = 0
    }
    if (this._isDebug) {
      this.auxHelper?.drawPoint(initPos)
    }

    const fixedCamPosGL = utils.geoCoordToRenderCoord([initPos.x, initPos.y, initPos.z], null, this.sceneView)
    // 5 for test
    // let glCamera = getGLCamera({ eye: fixedCamPosGL, center: point1GL, up: worldUpVec }); //camPos, lookAtPos, up-direction
    // let apiCamera = this.apiWebGLUtils.fromRenderCamera(this.sceneView, glCamera);
    // this.sceneView.goTo(apiCamera/*,{animate:false}*/).then(lang.hitch(this, function () {
    //   return def.resolve();
    // }));
    return fixedCamPosGL
  }

  resumeCamera = async (animate?: boolean): Promise<boolean> => {
    const useAnimate = animate
    try {
      await this.sceneView.goTo(this.getApiCamera(this.getCameraByProgress()), { animate: useAnimate, signal: this.abortSignalHandler.update() })
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('sceneView.goTo() Aborted')
        return false
      } else {
        //throw error
        return false
      }
    }

    return true
  }

  async resume (animate?: boolean): Promise<any> {
    super.resume()
    return await this._resume(this.resumeCamera(animate))
  }

  stop = (opts?: stopOptions) => {
    super.stop()

    const ignoreResetFlag = (opts && opts.ignoreResetCameraWhenFinished)// for cancel reset cmd, e.g. switch fly mode
    if (this.resetCameraWhenFinishedFlag && !ignoreResetFlag) {
      this.sceneView.goTo(this.cameraInfo)
      this.resetCameraWhenFinishedFlag = false
    }
  }

  async clear (): Promise<any> {
    await super.clear()
  }

  async handleMapInteractionStart (): Promise<any> {
    await this.pause()
  }

  async handleMapInteractionEnd (): Promise<any> {
    //this.pause()
  }

  // catmull-rom only
  _coordToGeo = (coord): number[] => {
    if (utils.isDefined(coord)) {
      return this.vec3d.fromValues(coord.x, coord.y, coord.z)
    } else {
      return null
    }
  }
}
