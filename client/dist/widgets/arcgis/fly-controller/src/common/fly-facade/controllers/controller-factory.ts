import { type InitParams, ControllerMode } from './base-fly-controller'
import RotatingFlyController from './rotating-fly-controller'
import CurveFlyController from './curve-fly-controller'
import LineFlyController from './line-fly-controller'
import AroundMapCenterController from './around-map-center-controller'

export type FlyControllerImp = (RotatingFlyController | AroundMapCenterController | CurveFlyController | LineFlyController)

export default class ControllerFactory {
  className: 'ControllerFactory'

  static async make (initParams: InitParams): Promise<FlyControllerImp> {
    let controller
    const type = initParams.type
    switch (type) {
      case ControllerMode.Rotate: {
        controller = await new RotatingFlyController().setup(initParams)
        break
      }
      case ControllerMode.AroundMapCenter: {
        controller = await new AroundMapCenterController().setup(initParams)
        break
      }
      case ControllerMode.RealPath: {
        controller = await new LineFlyController().setup(initParams)
        break
      }
      case ControllerMode.Smoothed: {
        controller = await new CurveFlyController().setup(initParams)
        break
      }

      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default: {
        console.error('ControllerFactory error type:', type)
      }
    }

    return controller
  }
}
