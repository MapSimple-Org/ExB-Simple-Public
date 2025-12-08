import * as utils from '../../utils/utils'
import RealPath from './common/path/real-path'
import BaseFlyController,
{ type flyOptions, type CameraGL, type prepareOptions, type stopOptions } from './base-fly-controller'
import { EasingMode } from './common/animate/ease'
import type { LiveViewSettingOptions } from './common/liveview-setting'
import { getGLCamera } from '../../utils/gl-camera-utils'

export default class LineFlyController extends BaseFlyController {
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

  getLiveViewSettingInfo (): LiveViewSettingOptions {
    // let cam = this.sceneView.camera;
    return {
      // heading: cam.heading,
      tilt: null, // this.getFlyTilt(),
      altitude: this.liveviewSetting.getAltitudeFactor(),
      speed: this.liveviewSetting.getSpeedFactor()
    }
  }
  // getCameraAltitude() {
  //   if (this.liveviewSetting.getAltitudeFactor() === 0) {
  //     return this.liveviewSetting.initCamOffset.fixHeight;
  //   } /*else if(this.getAltitudeFactor() < this.setting.initCamOffset.fixHeight){
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

    super.preparing()
    // if (this._isDebug) {
    //   this.auxHelper?.drawLineXY(paths, 'lightgreen');
    // }
    line = this._updateInitCamera(line)

    if (!this.isLiveviewMode) {
      const d = this.animate.computeDuration()
      this.animate.init(EasingMode.Linear, 0, this.animate.getAmount(), this.duration ?? d)
    }

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
    this._cache.paths = new RealPath(this._cache.cachedGeo, this.sceneView, this.vec3, this.vec3d, this.esriMathUtils)
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

  // getSpeedByHight = (hight) => {
  //   // let factor = 1; //0.8; //1;
  //   // //let step = hight / 100 * factor;
  //   // let step = this.sceneView.scale / 2000;
  //   // return Math.ceil(step);
  //   return 1;
  // }

  async _doFly (): Promise<any> {
    super._doFly()

    return await this.updateAnimat((frameInfo) => {
      if (this.isLiveviewMode) {
        // stop there for realtime-setting
      } else {
        this.animate.easing(frameInfo.deltaTime, this.liveviewSetting.getMappingSpeedFactor())
        // console.log("speed==>"+this.liveviewSetting.getMappingSpeedFactor());
      }

      this.updateProgressBar()

      const isStopFly = (this.animate.getProgress() >= 1)
      if (!isStopFly) {
        const task = this.getCameraByProgress()
        const apiCamera = this.getApiCamera(task)
        if (utils.isDefined(apiCamera)) {
          this.sceneView.goTo(apiCamera, { animate: false })
        }
      } else {
        this.animate.reset()
        this.stop()
      }
    })
  }

  getProgress = (): number => {
    return this.animate.getProgress()
  }

  getCameraByProgress = (progress?): CameraGL => {
    let move0, move1
    if (this.animate.getProgress() === 0) {
      move0 = this.animate.getAmount() * 0
      this.animate.progressForward()
      move1 = this.animate.getAmount() * this.animate.getProgress()
    } else {
      move0 = this.animate.getAmount() * this.animate.progressBackward()
      move1 = this.animate.getAmount() * this.animate.getProgress()
    }
    const point0 = this._cache.paths.getPoint(0, move0)
    const point1 = this._cache.paths.getPoint(0, move1)

    const cameraPosGL = [0, 0, 0]
    const lookAtPosGL = [0, 0, 0]
    const worldUpVec = this.vec3d.create()

    if (point0.type === 'line') {
      const start = point0.point
      const end = point1.point

      const startPosGL = start// utils.geoCoordToRenderCoord([start[0], start[1], start[2] + elevOffest], null, this.sceneView);

      let camPosGL = this.getCameraPosition(start, end)
      if (!utils.isDefined(camPosGL)) {
        camPosGL = this._cache.cameraGL.pos
      }

      this.sceneView.renderCoordsHelper.worldUpAtPosition(camPosGL, worldUpVec) // up-aux-line

      cameraPosGL[0] = camPosGL[0]
      cameraPosGL[1] = camPosGL[1]
      cameraPosGL[2] = camPosGL[2]

      lookAtPosGL[0] = startPosGL[0]
      lookAtPosGL[1] = startPosGL[1]
      lookAtPosGL[2] = startPosGL[2]
    } else if (point0.type === 'rotate') {
      const prePosGL = point0.points.pre// utils.geoCoordToRenderCoord([prePos[0], prePos[1], prePos[2]], null, this.sceneView);
      const basePosGL = point0.points.base// utils.geoCoordToRenderCoord([basePos[0], basePos[1], basePos[2]], null, this.sceneView);
      const nextPosGL = point0.points.next// utils.geoCoordToRenderCoord([nextPos[0], nextPos[1], nextPos[2]], null, this.sceneView);

      const lastVec = this.vec3d.create()
      this.vec3.subtract(lastVec, basePosGL, prePosGL)
      const nextVec = this.vec3d.create()
      this.vec3.subtract(nextVec, nextPosGL, basePosGL)

      const lastLineLen = point0.lastLineLen
      const start = this._cache.paths.getPoint(0, lastLineLen - 0.02)
      const end = this._cache.paths.getPoint(0, lastLineLen - 0.01)
      let camPosGL = this.getCameraPosition(start.point, end.point)

      // let auxUpVec = this.vec3d.create();
      this.sceneView.renderCoordsHelper.worldUpAtPosition(basePosGL, worldUpVec) // up-aux-line
      const angle = point0.angle// utils.radToDeg(this.esriMathUtils.angle(lastVec, nextVec, auxUpVec));

      // TODO Quaternion
      //  let rotatedAngle = (angle / factor) * step;
      camPosGL = this.rotateBySceneMode(camPosGL, worldUpVec, angle, basePosGL)

      cameraPosGL[0] = camPosGL[0]
      cameraPosGL[1] = camPosGL[1]
      cameraPosGL[2] = camPosGL[2]

      lookAtPosGL[0] = basePosGL[0]
      lookAtPosGL[1] = basePosGL[1]
      lookAtPosGL[2] = basePosGL[2]
    }

    // cache
    this._cache.cameraGL.pos = cameraPosGL
    this._cache.cameraGL.upDir = worldUpVec
    this._cache.lookAtTargetGL.pos = lookAtPosGL
    this._cache.lookAtTargetGL.upAxis = null// this.vec3d.create();
    this._cache.lookAtTargetGL.baseAlt = null// lastHit.mapPoint.z;

    return {
      lookAt: lookAtPosGL,
      camPos: cameraPosGL,
      up: worldUpVec,
      type: point0.type
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
    initPos.z = parseFloat(initPos.z) + this.liveviewSetting.getAltitudeFactor()// fix Altitude
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

    if (this._isDebug) {
      this.auxHelper?.drawLineGL([pos, lookAt], this.sceneView, 'yellow')
    }

    const glCamera = getGLCamera(this.sceneView, { eye: pos, center: lookAt, up: up })
    const apiCamera = this.apiWebGLUtils.fromRenderCamera(this.sceneView, glCamera)

    // fix heading&tilt , moveto base-class
    // if(1){
    // apiCamera.heading = apiCamera.heading + this.getHeadingFactor();
    // apiCamera.tilt = apiCamera.tilt + this.getTiltFactor();
    // apiCamera.position.z = apiCamera.position.z + this.getAltitudeFactor();
    // }
    return apiCamera
  }

  private getCameraPosition (basePos, nextPos): number[] {
    if (basePos[0] === nextPos[0] && basePos[1] === nextPos[1] && basePos[2] === nextPos[2]) {
      return null
    }

    const cameraHeight = this.liveviewSetting.getCamOffsetHeight() ?? 100 // metre
    const fixDistance = this.liveviewSetting.getCamOffsetDistance() ?? 100 // metre

    // 1.init Pos
    const point1GL = basePos// utils.geoCoordToRenderCoord([basePos[0], basePos[1], basePos[2]], null, this.sceneView);
    const point2GL = nextPos// utils.geoCoordToRenderCoord([nextPos[0], nextPos[1], nextPos[2]], null, this.sceneView);

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
      this.auxHelper?.drawPoint(initPos, 'red')
    }

    const fixedCamPosGL = utils.geoCoordToRenderCoord([initPos.x, initPos.y, initPos.z], null, this.sceneView)

    // 5. move camera
    // let glCamera = getGLCamera({ eye: fixedCamPosGL, center: point1GL, up: worldUpVec}); //camPos, lookAtPos, up-direction
    // let apiCamera = this.apiWebGLUtils.fromRenderCamera(this.sceneView, glCamera);
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
}
