//import { isDefined/*, degToRad, radToDeg, geoCoordToRenderCoord*/ } from '../../utils/utils'
import BaseFlyController, { FlyState, type prepareOptions, type flyOptions } from './base-fly-controller'
import type { LiveViewSettingOptions } from './common/liveview-setting'

export default class TrackballController extends BaseFlyController {
  // init
  async prepare (opts?: prepareOptions): Promise<boolean> {
    await super.preparing()
    return await new Promise((resolve) => { resolve(true) })
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fly = async (opts: flyOptions): Promise<any> => {
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async resume (animate?: boolean): Promise<any> {
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

  async handleMapInteractionStart (): Promise<any> {
    this.eventHandlers.push(this.sceneView.on('drag', (event) => {
      /// ///////////////////////////////////////////////////////////////////////////
      // test map mouse move
      //       let dx=0, dy=0;
      //       event.stopPropagation();//to stop map pan
      //       if ('start' === event.action) {
      //         this._cache.mouse.x = event.x;
      //         this._cache.mouse.y = event.y;
      //       }
      //       if('update' === event.action ) {
      //         let dx = event.x - this._cache.mouse.x;
      //         let dy = event.y - this._cache.mouse.y;

      //         console.log('delta.xy==> ' + dx + '  _  ' + dy);//mouse moved

      //         this._cache.mouse.x = event.x;
      //         this._cache.mouse.y = event.y;
      //       }
      // //
      // let speed = 1;
      // freefly
      // let newCam = this.sceneView.camera.clone();
      // newCam.tilt = newCam.tilt - dy*speed;
      // newCam.heading  = newCam.heading - dx*speed;
      // this.sceneView.camera = newCam;

      // just look at groud
      // let newCam = this.sceneView.camera.clone();
      // let tilt = newCam.tilt - dy*speed,
      //   heading = newCam.heading - dx*speed;

      // this.sceneView.goTo({
      //               tilt:tilt,
      //               heading: heading
      //             } , { animate: false })

      /*
//trackball
      //let r = 0;//eye - lookAt
      let _camera = this.sceneView.state.camera;
      let eyeDir = _camera.viewForward;//_camera.eye - _camera.center
      // let tmpVec = this.vec3d.create();
      // this.vec3.subtract(tmpVec, _camera.eye, _camera.center);
      // let vecNor = this.vec3d.create();
      // this.vec3.normalize(vecNor, tmpVec);
      let upDir = _camera.viewUp;
      let sideDir = _camera.viewRight;

      // let up = this.vec3d.create();
      // this.vec3.scale(up, upDir, dy);
      // let side = this.vec3d.create();
      // this.vec3.scale(side, sideDir, dx);
      // let move = this.vec3d.create();
      // this.vec3.add(move, up, side);

      // let axis = this.vec3d.create();
      // this.vec3.cross(axis, move, eyeDir);

      // let axisNor = this.vec3d.create();
      // this.vec3.normalize(axisNor, axis);

      // let quat = this.quatd.create();
      // this.quat.setAxisAngle(quat, axisNor, 1/60);

      // //eye pos
      // let newEye = this.vec3d.create();
      // this.vec3.set(newEye, _camera.eye[0], _camera.eye[1], _camera.eye[2]);
      // let newEyePos = this.vec3d.create();
      // this.vec3.transformQuat(newEyePos, newEye, quat);

      // //up dir
      // let newUp = this.vec3d.create();
      // this.vec3.set(newUp, _camera.up[0], _camera.up[1], _camera.up[2]);
      // let newUpDir = this.vec3d.create();
      // this.vec3.transformQuat(newUpDir, newUp, quat);

      // let glCamera = getGLCamera(newEyePos, _camera.center, newUpDir); //camPos, lookAt, up
      // let apiCamera = this.apiWebGLUtils.fromRenderCamera(this.sceneView, glCamera);
      // this.sceneView.camera = apiCamera

      dx = dx;
      dy = dy;

      let yMatrix = this.mat4d.create();
      let xMatrix = this.mat4d.create();
      let moveMatrix = this.mat4d.create();

      let newEyePos = this.vec3d.create();
      let newUpDir = this.vec3d.create();
      let newUpDirNor = this.vec3d.create();

      //let yAxis = this.vec3d.create();
      let subPos = this.vec3d.create();
      //let tmpUp = this.vec3d.create();

      if (dy != 0) {
        if (_camera.center) {
          this.vec3.subtract(subPos, _camera.eye, _camera.center);
        }
        this.mat4.rotate(yMatrix, yMatrix, utils.degToRad(dy), sideDir);

        let tmp = this.vec3d.create();
        this.vec3.transformMat4(tmp, subPos, yMatrix);

        this.vec3.add(newEyePos, tmp, _camera.center);

        this.vec3.transformMat4(newUpDir, _camera.up, yMatrix);
        this.vec3.normalize(newUpDirNor, newUpDir);
      }
      // if (dx != 0) {
      //   this.mat4.rotate(xMatrix, xMatrix, utils.degToRad(dx), upDir);
      // }

      if (dy != 0 ) {//|| dx != 0
        // this.vec3.transformMat4(newEyePos, tmpPos, yMatrix);
        // this.vec3.add(tmpPos, tmpPos, _camera.center);

        // this.vec3.transformMat4(newUpDir, _camera.up, yMatrix);
        // this.vec3.normalize(newUpDirNor, newUpDir);

        // this.mat4.multiply(moveMatrix, yMatrix, xMatrix);
        // this.vec3.transformMat4(newEyePos, _camera.eye, moveMatrix);
        // this.vec3.transformMat4(newUpDir, _camera.up, moveMatrix);
        // this.vec3.normalize(newUpDirNor, newUpDir);

        let glCamera = getGLCamera(newEyePos, _camera.center, newUpDirNor); //camPos, lookAt, up
        let apiCamera = this.apiWebGLUtils.fromRenderCamera(this.sceneView, glCamera);
        //this.sceneView.camera = apiCamera
        this.sceneView.goTo(apiCamera, { animate: false });
      }
*/
      /// ///////////////////////////////////////////////////////////////////////////
      if (this.flyState <= FlyState.RUNNING/* || FlyState.PREPARING === this.flyState */) { // in flying
        if (event.action === 'start') {
          //this.pause()
          this.handleMapInteractionStart()
        } else {
          // event.stopPropagation();
        }
      }
    })
    )
    this.eventHandlers.push(this.sceneView.on('mouse-wheel', (event) => {
      if (this.flyState <= FlyState.RUNNING/* || FlyState.PREPARING === this.flyState */) {
        //this.pause()
        this.handleMapInteractionStart()
      }
    })
    )

    await this.pause()
  }

  async handleMapInteractionEnd (): Promise<any> {
    //this.pause()
  }
}
