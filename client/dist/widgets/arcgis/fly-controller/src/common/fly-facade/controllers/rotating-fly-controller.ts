import { isDefined, degToRad, radToDeg, geoCoordToRenderCoord } from '../../utils/utils'
import BaseFlyController, { type prepareOptions, type flyOptions } from './base-fly-controller'
import { RotateDirection } from '../../../config'
import { EasingMode } from './common/animate/ease'
import type { LiveViewSettingOptions } from './common/liveview-setting'
import { getGLCamera } from '../../utils/gl-camera-utils'

export default class RotatingFlyController extends BaseFlyController {
  direction: RotateDirection

  duration: number
  optionsAngleLimit: number// record raw data

  angleLimitCounter: number// angle counter

  /// /////////////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////
  async setIsLiveview (isPreview: boolean): Promise<boolean> {
    await super.setIsLiveview(isPreview)
    return await this.setLiveviewSettingInfo(this.getLiveViewSettingInfo())
  }

  async setLiveviewSettingInfo (paramObj: LiveViewSettingOptions): Promise<boolean> {
    return await super.setLiveviewSettingInfo(paramObj, async () => {
      if (isDefined(paramObj) && isDefined(paramObj.tilt) && isDefined(this._cache.lookAtTargetGL.pos)) {
        if (paramObj.tilt >= 0) {
          this._updateCameraGlByTilt(paramObj.tilt, { isUpdateCameraConfig: true })

          try {
            await this.sceneView.goTo(this.getApiCamera(), { animate: false, signal: this.abortSignalHandler.update() })
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
          // this._getAndUpdateCurrentTilt();
        }
      }

      return false
    })
  }

  _updateCameraGlByTilt = (tilt: number, opts?: { isUpdateCameraConfig: boolean }): void => {
    if (!isDefined(this._cache.lookAtTargetGL.pos)) {
      return null
    }

    // clip 1-89
    if (tilt < 1) {
      tilt = 1
    } else if (tilt > 89) {
      tilt = 89
    }

    // if (tilt) {
    // 1 basePoint in the upAxis
    // get radius len
    const cam2Target = this.vec3d.create()
    this.vec3.subtract(cam2Target, this._cache.cameraGL.pos, this._cache.lookAtTargetGL.pos)
    const radiusLen = this.vec3.length(cam2Target)
    // normalize lookAtTargetGL.upAxis direction
    const upDirNor = this.vec3d.create()
    this.vec3.normalize(upDirNor, this._cache.lookAtTargetGL.upAxis)
    // scale upAxis direction to radius len
    const radiusVec = this.vec3d.create()
    this.vec3.scale(radiusVec, upDirNor, radiusLen)
    // radius len in lookAtTarget's upAxis
    const basePoint = this.vec3d.create()
    this.vec3.add(basePoint, this._cache.lookAtTargetGL.pos, radiusVec)

    // 2 move basePoint depend on tilt
    const rotateAux = this.vec3d.create()// glCamera.viewRight;
    this.vec3.cross(rotateAux, upDirNor, cam2Target)

    let wantedCamPos = this.vec3d.create()
    wantedCamPos = this.rotateBySceneMode(basePoint, rotateAux, tilt, this._cache.lookAtTargetGL.pos)

    const tiltMatrix = this.mat4d.create()
    this.mat4.rotate(tiltMatrix, tiltMatrix, (degToRad(tilt)), rotateAux)

    const newRay = this.vec3d.create()
    this.vec3.subtract(newRay, wantedCamPos, this._cache.lookAtTargetGL.pos)
    const wantedCamUp = this.vec3d.create()
    this.vec3.cross(wantedCamUp, newRay, rotateAux)
    this.vec3.normalize(wantedCamUp, wantedCamUp)

    // update
    this._cache.cameraGL.pos = wantedCamPos
    this._cache.cameraGL.upDir = wantedCamUp

    // update config, such as triggered by L3
    if (opts?.isUpdateCameraConfig) {
      const glCamera = getGLCamera(this.sceneView, {
        eye: this._cache.cameraGL.pos,
        center: this._cache.lookAtTargetGL.pos,
        up: this._cache.cameraGL.upDir
      })
      this.cameraInfo = this.apiWebGLUtils.fromRenderCamera(this.sceneView, glCamera)
      this.cameraInfo = this.cameraInfo.toJSON() // jsonify
    }
  }

  _computeCurrentTilt = (): number => {
    const cam2Target = this.vec3d.create()
    this.vec3.subtract(cam2Target, this._cache.cameraGL.pos, this._cache.lookAtTargetGL.pos)

    const upDirNor = this.vec3d.create()
    this.vec3.normalize(upDirNor, this._cache.lookAtTargetGL.upAxis)

    const angle = radToDeg(this.vec3.angle(cam2Target, upDirNor))
    // console.log("tilt angle==>"+angle.toFixed());
    // let intAngle = Math.round(angle);//precision
    // this.liveviewSetting.setTiltFactor(intAngle);
    return angle
  }
  // getFlyTilt = () => {
  //   //this.liveviewSetting.setTiltFactor(this.computeFlyTilt());
  //   return this.liveviewSetting.getTiltFactor();
  // }
  // computeFlyTilt = () => {
  //   if (!this._cache.lookAtTargetGL.pos) {
  //     return
  //   }

  //   let cam2Target = this.vec3d.create();
  //   this.vec3.subtract(cam2Target, this._cache.cameraGL.pos, this._cache.lookAtTargetGL.pos);

  //   let angle = this.vec3.angle(this._cache.lookAtTargetGL.upAxis, cam2Target);
  //   angle = (90 - radToDeg(angle));
  //   //console.log('angle==>' + angle);
  //   return angle;
  // }
  // setFlyTilt = (tilt) => {
  //   let camera = this.sceneView.camera.clone();
  //   tilt = utils.clampTilt(tilt);

  //   let oldTileAngle = this.getFlyTilt();
  //   oldTileAngle = degToRad(oldTileAngle);
  //   let S = (camera.position.z - this._cache.lookAtTargetGL.baseAlt) / Math.tan(oldTileAngle);

  //   let h = S * Math.tan(degToRad(tilt)); //new cam pos.z
  //   return h;
  // }

  _getTilt (): number {
    let tilt = this.liveviewSetting.getTiltFactor(true)
    if (tilt === null || typeof tilt === 'undefined' || isNaN(tilt)) {
      // init tilt
      tilt = this._computeCurrentTilt()
      this.liveviewSetting.setTiltFactor(tilt)
    }
    return tilt
  }

  getLiveViewSettingInfo (): LiveViewSettingOptions {
    return {
      tilt: this._getTilt(), // this.liveviewSetting.getTiltFactor(),
      altitude: null, // cam.position.z,
      speed: this.liveviewSetting.getSpeedFactor()
    }
  }

  /// /////////////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////

  // init
  async prepare (opts?: prepareOptions): Promise<boolean> {
    const mapPoint = this.geometry as __esri.Point

    if (isDefined(opts)) {
      if (isDefined(opts.angleLimit)) {
        this.optionsAngleLimit = opts.angleLimit
        this.angleLimitCounter = opts.angleLimit
      } else if (isDefined(this.optionsAngleLimit)) {
        // nothing to do, keep current this.optionsAngleLimit
      } else {
        // this.optionsAngleLimit = null;//no limit
      }
      if (isDefined(opts.duration)) {
        this.duration = opts.duration
      }
    }

    super.preparing()

    /* mapPoint = */this._updateInitCamera(mapPoint, { isUpdateTilt: false })

    if (isDefined(this.duration)) {
      this.animate.init(EasingMode.Linear, 0, (this.optionsAngleLimit ?? 360), this.duration)
    } else {
      this.animate.init(EasingMode.NONE, 0, 0, this.duration)
    }

    // goto init cam-pos
    // 1.fly to point without terrain-info
    try {
      await this.sceneView.goTo(this.getApiCamera(), this.getPrepareGoToOptionsBeforeTerrainLoaded(opts))
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('sceneView.goTo() Aborted')
      } else {
        console.error(error)
      }
      return false
    }

    if (opts?.waitingForTerrain) {
      // update camera when terrain loaded
      await this.reactiveUtils.whenOnce(() => !this.sceneView.groundView.updating)
      this._updateInitCamera(this.geometry as __esri.Point, { isUpdateTilt: true })

      // 2. fly to point with terrain-info
      try {
        await this.sceneView.goTo(this.getApiCamera(), this.getPrepareGoToOptionsAfterTerrainLoaded(opts))
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('sceneView.goTo() Aborted')
        }
        return false
      }

      await this.reactiveUtils.whenOnce(() => !this.sceneView.groundView.updating)
    }
    // 3. ok, update fly-state
    await super.prepared()
    return true
  }

  _updateInitCamera = (point: __esri.Point, opts: { isUpdateTilt: boolean }): __esri.Point => {
    let mapPoint = point
    // cache lookAt pos
    if (this._isDebug) {
      this.auxHelper?.drawPoint(mapPoint)
    }

    mapPoint = this.queryGeometryElevInfo(mapPoint) as __esri.Point
    this._cache.lookAtTargetGL.pos = geoCoordToRenderCoord([mapPoint.x, mapPoint.y, mapPoint.z], null, this.sceneView)
    this._cache.lookAtTargetGL.upAxis = this.vec3d.create()
    this._cache.lookAtTargetGL.baseAlt = mapPoint.z
    this.sceneView.renderCoordsHelper.worldUpAtPosition(this._cache.lookAtTargetGL.pos, this._cache.lookAtTargetGL.upAxis)
    // if (isDefined(this.direction)) {
    //   this.direction = options.direction
    // }
    let camera
    if (isDefined(this.cameraInfo)) {
      camera = this.Camera.fromJSON(this.cameraInfo)
    } else {
      camera = this.sceneView.camera.clone()// for pick
    }

    const cameraFixedGL = this.apiWebGLUtils.toRenderCamera(this.sceneView, camera)
    this._cache.cameraGL.pos = cameraFixedGL.eye
    this._cache.cameraGL.upDir = cameraFixedGL.up

    // init&update camPos by liveviewSetting
    if (opts?.isUpdateTilt) {
      this._updateCameraGlByTilt(this._getTilt())
    }

    return mapPoint
  }

  fly = async (opts: flyOptions): Promise<any> => {
    if (isDefined(opts?.speedFactor)) {
      this.liveviewSetting.setSpeedFactor(opts.speedFactor)
    }

    if (!this.isInited()) {
      // have not inited
      await this.prepare()
      await this.resume()
      return true
    } else if (this.isEnableToFly()) {
      return await this.resume(opts?.animate)
    } else {
      return await Promise.reject(new Error('isEnableToFly() === false'))
    }
    // this.watchUtils.whenOnce(this.state, 'flyState', () => {
    //   this.stopAnimat();
    // });
  }

  async _doFly (): Promise<any> {
    super._doFly()

    return await this.updateAnimat((frameInfo) => {
      const interp = this.animate.easing(frameInfo.deltaTime, this.liveviewSetting.getMappingSpeedFactor())
      let rotateSpeed = interp.step
      const progress = interp.progress

      if (isDefined(this.direction) && this.direction === RotateDirection.CW) {
        rotateSpeed = -rotateSpeed // CCW default
      }

      if (this.isLiveviewMode) {
        // stop there for setting
      } else {
        if (this.optionsAngleLimit === null || isNaN(this.optionsAngleLimit)) {
          this._rotateCam(rotateSpeed)
        } else {
          if (progress >= 1) {
            rotateSpeed = this.angleLimitCounter// remaining angle
            // this.optionsAngleLimit = 0;
          }

          const angle = Math.min(Math.abs(rotateSpeed), this.angleLimitCounter)
          this.angleLimitCounter -= angle

          if (this.angleLimitCounter > 0) {
            this._rotateCam(rotateSpeed)
          } else/* if (this.optionsAngleLimit <= 0) */ {
            this.stop() // resolve();//finish
          }
        }
      }

      if (this._isDebug) {
        this.auxHelper?.drawPointGL(this._cache.cameraGL.pos, 'red')
      }

      // 5. move camera
      const apiCamera = this.getApiCamera()
      this.sceneView.goTo(apiCamera, { animate: false /*, signal: this.abortSignalHandler.signal */ }).catch(function (error) {
        if (error.name === 'AbortError') {
          console.log('sceneView.goTo() Aborted')
        } else {
          throw new Error(error)
        }
      })
    })
    // })
    // this.watchUtils.whenOnce(this.sceneView, 'interacting', () => {
    //   this.stopAnimat();
    // });
  }

  private _rotateCam (rotateSpeed: number): void {
    // update cam pos
    const rotateAux = this._cache.lookAtTargetGL.upAxis
    let wantedCamPos = this.vec3d.create()
    wantedCamPos = this.rotateBySceneMode(this._cache.cameraGL.pos, rotateAux, rotateSpeed, this._cache.lookAtTargetGL.pos)
    this._cache.cameraGL.pos = wantedCamPos
    // update UP dir
    const rotateMatrix = this.mat4d.create()
    this.mat4.rotate(rotateMatrix, rotateMatrix, (degToRad(rotateSpeed)), rotateAux)
    const wantedUpDir = this._cache.cameraGL.upDir
    this.vec3.transformMat4(wantedUpDir, wantedUpDir, rotateMatrix)
    this.vec3.normalize(wantedUpDir, wantedUpDir)
    this._cache.cameraGL.upDir = wantedUpDir
  }

  private readonly getApiCamera = (): __esri.Camera => {
    // camPos, lookAt, up
    const glCamera = getGLCamera(this.sceneView, {
      eye: this._cache.cameraGL.pos,
      center: this._cache.lookAtTargetGL.pos,
      up: this._cache.cameraGL.upDir
    })
    const apiCamera = this.apiWebGLUtils.fromRenderCamera(this.sceneView, glCamera)

    if (apiCamera.position.z < 0) { // up-on the ground
      apiCamera.position.z = 0
    }

    return apiCamera
  }

  resumeCamera = async (animate?: boolean): Promise<boolean> => {
    const useAnimate = animate
    try {
      await this.sceneView.goTo(this.getApiCamera(), { animate: useAnimate, signal: this.abortSignalHandler.update() })
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

  async clear (): Promise<any> {
    await super.clear()
    this._cache.lookAtTargetGL.pos = null
  }

  getProgress = (): number => {
    return 0
  }

  async handleMapInteractionStart (): Promise<any> {
    await this.pause()
  }

  async handleMapInteractionEnd (): Promise<any> {
    //this.pause()
  }
}
