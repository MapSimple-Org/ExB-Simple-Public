import { Constraints } from '../../../constraints'
import { isDefined, speedMapping } from '../../../utils/utils'

export interface LiveViewSettingOptions {
  tilt?: number
  altitude?: number
  // heading?: number;
  speed?: number
}

export interface LiveviewSettingState {
  speedFactor: number
  fixHeading: number
  fixTilt: number
  fixAltitude: number
  initCamOffset: {
    height: number
    distance: number
  }
}

export default class LiveviewSetting {
  DEFAULT_SPEED: number
  state: LiveviewSettingState

  constructor () {
    this.DEFAULT_SPEED = (Constraints.SPEED.MIN + Constraints.SPEED.MAX) / 2
    this.state = LiveviewSetting._getDefualtLiveviewSetting()
  }

  static _getDefualtLiveviewSetting (): LiveviewSettingState {
    return {
      speedFactor: 0.5,
      fixHeading: NaN,
      fixTilt: NaN,
      fixAltitude: 0,
      // init them for line fly:
      initCamOffset: {
        height: 60, // m
        distance: 90 // m
      }
    }
  }

  getState (): LiveviewSettingState {
    return this.state
  }

  setState (state: LiveviewSettingState): void {
    this.state = state
  }

  getCamOffsetHeight (): number {
    return this.state.initCamOffset.height
  }

  getCamOffsetDistance (): number {
    return this.state.initCamOffset.distance
  }
  // liveview-setting
  // setSettingModeFlag = (isSettingMode) => {
  //   this.settingMode = isSettingMode;
  // }
  // settingPreview = (isPreview: boolean) => {
  //   this.settingMode = isPreview;
  //   if (true === isPreview) {
  //     this.fly({animate: false});
  //   } else {
  //     this.pause();
  //   }
  // }
  // setRuntimeSetting(settingParamObj: SettingParam, updateFun) {
  //   if (false===this.settingMode || !settingParamObj) {
  //     return;
  //   }

  //   if (settingParamObj) {
  //     let shouldSet = false;
  //     let altitude = settingParamObj.altitude;
  //     if ('undefined' !== typeof altitude) {
  //       shouldSet = true;
  //       this.setAltitudeFactor(altitude);
  //     }
  //     let heading = settingParamObj.heading;
  //     if ('undefined' !== typeof heading) {
  //       shouldSet = true;
  //       this.setHeadingFactor(heading);
  //     }
  //     let tilt = settingParamObj.tilt;
  //     if ('undefined' !== typeof tilt) {
  //       shouldSet = true;
  //       this.setTiltFactor(tilt);
  //     }

  //     if (shouldSet && this.animate) {
  //       // this.scheduling.schedule((frameInfo) => {
  //       //   updateFun(frameInfo);
  //       // });
  //       this.animate.insertAnExtraFrame((frameInfo) => { updateFun(frameInfo); });
  //     }
  //   }
  // }
  // updateCurrentCamera = (fun?) => {
  //   // this.scheduling.schedule(() => {
  //   //   let camera = this.sceneView.camera.clone();
  //   //   //camera.heading += this.getHeadingFactor();
  //   //   camera.tilt = this.getTiltFactor();
  //   //   console.log("camera.tilt==>" + camera.tilt )
  //   //   //camera.position.z = this.getAltitudeFactor();
  //   //   this.sceneView.goTo(camera, { animate: false });
  //   // });
  // }
  // speed
  setSpeedFactor (speed?: number): void {
    let speedFactor
    if (typeof speed === 'undefined') {
      speedFactor = this.DEFAULT_SPEED
    } else {
      speedFactor = speed
    }

    this.state.speedFactor = parseFloat(speedFactor)
  }

  getSpeedFactor (): number {
    if (typeof this.state.speedFactor === 'undefined') {
      return 0.5
    } else {
      return this.state.speedFactor
    }
  }

  getMappingSpeedFactor (): number {
    if (typeof this.state.speedFactor === 'undefined') {
      return this.DEFAULT_SPEED
    } else {
      const speed = speedMapping(this.state.speedFactor)
      return speed
    }
  }

  setHeadingFactor (heading?: number): void {
    let fixHeading = 0
    if (typeof heading !== 'undefined') {
      fixHeading = heading
    }
    this.state.fixHeading = fixHeading
    // this.updateCurrentCamera();
  }

  getHeadingFactor (): number {
    return isDefined(this.state.fixHeading) ? this.state.fixHeading : 0
  }

  setTiltFactor (tilt?: number): void {
    let fixTilt = 0
    if (typeof tilt !== 'undefined') {
      fixTilt = tilt
    }
    this.state.fixTilt = fixTilt
    // this.updateCurrentCamera();
  }

  getTiltFactor (rawVal?: boolean): number {
    if (rawVal) {
      return this.state.fixTilt
    } else {
      return isDefined(this.state.fixTilt) ? this.state.fixTilt : 0
    }
  }

  setAltitudeFactor (altitude?: number): void {
    let fixAltitude = 0
    if (typeof altitude !== 'undefined') {
      fixAltitude = altitude
    }
    this.state.fixAltitude = fixAltitude
    // this.updateCurrentCamera();
  }

  getAltitudeFactor (rawVal?: boolean): number {
    if (rawVal) {
      return this.state.fixAltitude
    } else {
      return isDefined(this.state.fixAltitude) ? this.state.fixAltitude : 0
    }
  }

  // getLiveViewSettingInfo():LiveViewSettingOptions {
  //   /*let cam = this.sceneView.camera;*/
  //   return {
  //     heading: this.getHeadingFactor(),
  //     tilt: this.getTiltFactor(),
  //     altitude: this.getAltitudeFactor()
  //   }
  // }
}
