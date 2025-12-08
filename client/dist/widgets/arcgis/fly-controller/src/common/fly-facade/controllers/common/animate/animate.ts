import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { Constraints } from '../../../../constraints'
import { Ease, EasingMode, type EasingState } from './ease'

export interface AnimateState {
  speed: number
  mode: EasingMode
  progress: number
  amount: number
  interp: {
    time: {
      begin: number
      currentDuration: number
      duration: number // ms
    }
    value: {
      start: number
      end: number
    }
    cache: {
      lastVal: number
      lastStep: number
    }
  }
}

export default class Animate {
  private scheduling: __esri.scheduling
  private animateHandler: __esri.FrameTaskHandle

  state: AnimateState

  async setup (): Promise<Animate> {
    await loadArcGISJSAPIModules([
      'esri/core/scheduling'
    ]).then(modules => {
      [this.scheduling] = modules
    })

    this.state = {
      speed: Constraints.SPEED.DEFAULT_SPEED, // meters-per-second OR degrees-per-second
      mode: EasingMode.NONE,
      progress: 0,
      amount: -1,
      interp: {
        time: {
          begin: 0,
          currentDuration: 0,
          duration: 10 * 1000// 10s
        },
        value: {
          start: 0,
          end: 0
        },
        cache: {
          lastVal: 0,
          lastStep: 0
        }
      }
    }

    this.animateHandler = null

    return this
  }

  getState (): AnimateState {
    return this.state
  }

  setState (state: AnimateState): void {
    this.state = state
  }

  init (mode: EasingMode, start: number, end: number, duration: number): void {
    this.state.mode = mode

    this.state.interp.value.start = start
    this.state.interp.value.end = end
    this.state.interp.time.duration = duration

    // this.state.progress = 0;
  }

  reset (): void {
    this.state.interp.time.begin = 0
    this.state.interp.time.currentDuration = 0
    this.state.progress = 0
  }

  // Duration
  computeDuration (): number {
    return this.state.amount / this.state.speed * 1000
  }

  getDuration (): number {
    return this.state.interp.time.duration
  }

  // amount
  setAmount (num: number): this {
    this.state.amount = num
    // console.log('amount=>' + this.state.amount);
    return this
  }

  getAmount (): number {
    return this.state.amount
  }

  // progress
  getProgress (): number {
    return this.state.progress
  }

  progressForward (): number {
    this.state.progress += 0.0001
    return this.state.progress
  }

  progressBackward (): number {
    return this.state.progress - 0.0001
    // return this.state.progress;
  }

  // interp
  // getInterDuration() {
  //   return this.state.interp.time.currentDuration;
  // }
  private updateCurrentDuration (d: number): number { // sum add
    this.state.interp.time.currentDuration = this.state.interp.time.currentDuration + d
    if (isNaN(this.state.interp.time.currentDuration)) {
      this.state.interp.time.currentDuration = 0
    }
    return this.state.interp.time.currentDuration
  }
  // setBeginTime() {
  //   this.state.interp.beginTime = Date.now();
  // }
  // getBeginTime() {
  //   return this.state.interp.beginTime;
  // }
  // setSumTime(t) {
  //   this.state.interp.sumTime = t + this.state.interp.sumTime;
  //   return this.state.interp.sumTime;
  // }
  // getSumTime() {
  //   return this.state.interp.sumTime;
  // }

  // easing
  easing = (deltaTime, speedFactor): EasingState => {
    switch (this.state.mode) {
      case EasingMode.In: {
        return this.easingIn(deltaTime, speedFactor)
      }
      case EasingMode.InOut: {
        return this.easingInOut(deltaTime, speedFactor)
      }
      case EasingMode.Linear: {
        return this.linear(deltaTime, speedFactor)
      }
      case EasingMode.NONE: {
        return this.uniformSpeed(deltaTime, speedFactor)
      }
      default: {
        break
      }
    }
  }

  private readonly uniformSpeed = (deltaTime, speedFactor): EasingState => {
    this.updateCurrentDuration(deltaTime * speedFactor)
    const speed = this.getMovementByFrame(deltaTime) * speedFactor
    this.state.progress = 0
    return {
      interp: 0,
      step: speed,
      progress: this.state.progress
    }
  }

  // setTimeScale = (timeScale: number) => {
  //   this.state.interp.time.currentDuration *= timeScale;
  //   this.state.interp.time.duration *= timeScale;
  // }
  private readonly linear = (deltaTime, speedFactor): EasingState => {
    const sum = this.updateCurrentDuration(deltaTime * speedFactor)
    let val = 0; let step = 0

    if (sum < this.state.interp.time.duration) {
      val = Ease.linear(sum, this.state.interp.value.start, this.state.interp.value.end, this.state.interp.time.duration)
      step = val - this.state.interp.cache.lastVal
      this.state.interp.cache.lastVal = val

      this.state.progress = val / this.state.interp.value.end
    } else {
      this.state.progress = 1
    }

    return {
      interp: val,
      step: step,
      progress: this.state.progress
    }
  }

  private readonly easingIn = (deltaTime, speedFactor): EasingState => {
    const sum = this.updateCurrentDuration(deltaTime * speedFactor)
    let val = 0; let step = 0

    if (sum < this.state.interp.time.duration) {
      val = Ease.easeIn(sum, this.state.interp.value.start, this.state.interp.value.end, this.state.interp.time.duration)
      step = val - this.state.interp.cache.lastVal
      this.state.interp.cache.lastVal = val

      this.state.interp.cache.lastStep = step
    } else {
      step = this.state.interp.cache.lastStep * speedFactor
    }

    this.state.progress = -1

    return {
      interp: val,
      step: step,
      progress: this.state.progress
    }
  }

  // TODO if timeScale changed, duration should change by the progress
  private readonly easingInOut = (deltaTime, speedFactor): EasingState => {
    const sum = this.updateCurrentDuration(deltaTime * speedFactor)
    let val = 0; let step = 0

    if (sum < this.state.interp.time.duration) {
      val = Ease.easeInOut(sum, this.state.interp.value.start, this.state.interp.value.end, this.state.interp.time.duration)
      step = val - this.state.interp.cache.lastVal
      this.state.interp.cache.lastVal = val

      this.state.progress = val / this.state.interp.value.end
    } else {
      this.state.progress = 1
    }

    return {
      interp: val,
      step: step,
      progress: this.state.progress
    }
  }

  // speed
  getSpeed (): number {
    return this.state.speed
  }

  setSpeed (s: number): void {
    this.state.speed = s
  }

  // setSpeedByLimitTime (limit: number): void {
  //   let speed
  //   if (typeof limit === "undefined" || limit ===0 ) {
  //     speed = Constraints.SPEED.DEFAULT_SPEED
  //   } else {
  //     speed = this.state.amount / limit
  //   }
  //   this.setSpeed(speed)
  // }

  // speed
  getMovementByFrame = (deltaTime): number => {
    const movementPerSecond = this.getSpeed() // m/second
    const frameRate = 1000 / deltaTime
    // if (frameRate > 60) {
    //   frameRate = 60;
    // }
    return movementPerSecond / frameRate
  }

  // runtime fly
  update (fun): Promise<any> {
    if (this.animateHandler !== null) {
      return
    }

    this.animateHandler = this.scheduling.addFrameTask({
      // prepare: fun
      // render: fun
      update: (frameInfo) => { fun(frameInfo) }
    })
  }

  stop (): void {
    if (this.animateHandler !== null) {
      this.animateHandler.pause()
      this.animateHandler.remove()
      this.animateHandler = null
    }
  }

  // for setting without playing
  insertAnExtraFrame (fun): void {
    this.scheduling?.schedule((frameInfo) => {
      fun(frameInfo)
    })
  }
}
