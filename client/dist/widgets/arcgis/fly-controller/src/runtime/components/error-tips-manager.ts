import * as utils from '../../common/utils/utils'
import { defaultMessages as jimuUiNls } from 'jimu-ui'
import nls from '../translations/default'

interface Options {
  widget: any
}

export enum ErrorTypes {
  Choose3DMap,
  ConfigError
}

export default class ErrorTipsManager {
  widget: any
  sceneView: __esri.SceneView

  // tips
  chooseMapTip
  configErrorTip

  constructor (options: Options) {
    this.widget = options.widget

    this.chooseMapTip = this.widget.props.intl.formatMessage({ id: 'select3DMapHint', defaultMessage: jimuUiNls.select3DMapHint })
    this.configErrorTip = this.widget.props.intl.formatMessage({ id: 'configErrorTip', defaultMessage: nls.configErrorTip })
  }

  getDefaultError = (): string => {
    return this.chooseMapTip
  }

  isError = (): boolean => {
    return (this.isNoMapId() || this.isNoScene() || this.isNoModeInSetting())
  }

  setError = (tip: string): void => {
    if (tip !== this.widget.state.errorTip) {
      this.widget.setState({ errorTip: tip })
    }
  }

  setErrorByType = (type: ErrorTypes): void => {
    if (type === ErrorTypes.Choose3DMap) {
      this.setError(this.chooseMapTip)
    }
  }

  private readonly isNoScene = (): boolean => {
    return !utils.isDefined(this.widget.state.jimuMapView)
  }

  private readonly isNoModeInSetting = (): boolean => {
    return utils.getEnabledItemNum(this.widget.props.config.itemsList) < 1
  }

  private readonly isNoMapId = (): boolean => {
    return !utils.isDefined(this.widget.props.useMapWidgetIds) || !utils.isDefined(this.widget.props.useMapWidgetIds[0])
  }

  checkErrorInConfig = (): void => {
    const choseSceneInSetting = this.isNoScene() || this.isNoMapId()// for change map
    if (choseSceneInSetting) {
      this.setError(this.chooseMapTip) // no 3d map
      return
    }
    if (this.isNoModeInSetting()) {
      this.setError(this.configErrorTip) // no item in config
      return
    }

    if (utils.isDefined(this.widget.jimuMapView)) {
      this.setError('') // ok
    }
  }

  // TODO change to .tsx , render props.children
}
