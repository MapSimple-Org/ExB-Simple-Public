import { lodash } from 'jimu-core'
import { isDefined } from '../../utils/utils'
import BaseFlyController, { type prepareOptions, type flyOptions, FlyState } from './base-fly-controller'
import { RotateDirection } from '../../../config'
import type { LiveViewSettingOptions } from './common/liveview-setting'

export default class AroundMapCenterController extends BaseFlyController {
  // speed
  rotateSpeed: number

  // wait time
  pauseTime: number //ms
  WAIT_TIME = {
    DEFAULT: 2000
  }

  waitingTimer: NodeJS.Timeout

  constructor () {
    super()
    this.pauseTime = this.WAIT_TIME.DEFAULT
  }

  // init
  async prepare (opts?: prepareOptions): Promise<boolean> {
    await super.preparing()
    this.pauseTime = opts.aroundMapCenterConfig.rotationPauseTime * 1000 // second => ms

    return true
  }

  async _doFly (): Promise<any> {
    super._doFly()

    return await this.updateAnimat((frameInfo) => {
      const interp = this.animate.easing(frameInfo.deltaTime, this.liveviewSetting.getMappingSpeedFactor())
      let rotateSpeed = interp.step
      //const progress = interp.progress

      if (isDefined(this.direction) && this.direction === RotateDirection.CW) {
        rotateSpeed = -rotateSpeed // CCW default
      }

      // 5. move camera
      const center = this.sceneView.center
      this.sceneView.goTo({
        heading: this.sceneView.camera.heading - (rotateSpeed),
        center
      }, { animate: false }).catch(function (error) {
        if (error.name === 'AbortError') {
          console.log('sceneView.goTo() Aborted')
        } else {
          throw new Error(error)
        }
      })
    })
  }

  async resume (animate?: boolean): Promise<any> {
    super.resume()
    return await this._resume(true)
  }

  /// /////////////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////
  async setIsLiveview (isPreview: boolean): Promise<boolean> {
    return Promise.resolve(true)
  }

  async setLiveviewSettingInfo (paramObj: LiveViewSettingOptions): Promise<boolean> {
    return Promise.resolve(true)
  }

  getLiveViewSettingInfo (): LiveViewSettingOptions {
    return {
      tilt: null,
      altitude: null,
      speed: null
    }
  }

  getProgress (): number {
    return 0
  }

  /// /////////////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////
  initTimer (isImmediately: boolean, opts: flyOptions) {
    const time = (isImmediately ? 0 : this.pauseTime)
    this.waitingTimer = setTimeout(() => {
      this.doFly(opts)
    }, time)
  }

  clearTimer = () => {
    clearTimeout(this.waitingTimer)
    this.waitingTimer = null
  }

  fly = async (opts: flyOptions): Promise<any> => {
    await new Promise((resolve) => {
      this.initTimer(true, opts)
      resolve(null)
    })
  }

  doFly = async (opts: flyOptions): Promise<any> => {
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
    } else if (this.waitingTimer && this.flyState === FlyState.RUNNING) {
      return await this.resume()
    }
  }

  async pause (): Promise<boolean> {
    await super.pause()

    this.clearTimer()
    return true
  }

  stop = () => {
    super.stop()
    super.clear()/* await*/
  }

  async clear (): Promise<any> {
    this.clearTimer()
    await super.clear()
  }

  // Map interactions
  handleMapInteractionStart = async (event): Promise<any> => {
    if (this._isDebug) {
      console.log('handleMapInteraction-Start')
    }
    //keep flying instead of this.pause(), to keep runtime-Btn active
    this.stopAnimat()
    this.clearTimer()

    // keep going when trigger Mouse wheel event, #14462
    if (event?.type === 'mouse-wheel') {
      this._debounceOnMouseWheel()
    }

    return await new Promise((resolve) => { resolve(null) })
  }

  handleMapInteractionEnd = async (): Promise<any> => {
    if (this._isDebug) {
      console.log('handleMapInteraction-End')
    }

    this.clearTimer()

    if (this.flyState === FlyState.RUNNING) {
      this.initTimer(false, null) // call this.resume(), to continue auto-rotation
    }
    //else // just stop fly here, because the runtime-btn is no longer active
    return await new Promise((resolve) => { resolve(null) })
  }

  private readonly _debounceOnMouseWheel = lodash.debounce(() => {
    this.handleMapInteractionEnd()
  }, 500)
}
