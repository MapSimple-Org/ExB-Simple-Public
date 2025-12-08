import { type extensionSpec, appActions, type UnknownAction, getAppStore, WidgetState } from 'jimu-core'
import { EditModeType, type IMConfig } from '../config'

export default class ReduxActionInterceptorExtensionImpl implements extensionSpec.ReduxActionInterceptorExtension {
  id = 'redux-action-interceptor-extension'
  widgetId: string
  formChange: boolean
  confirmClose: boolean
  showWarningBeforeClose: (isHiddenAction: boolean) => void

  intercept (action: UnknownAction): UnknownAction {
    const isCloseAction = action.type === appActions.ActionKeys.CloseWidget && action.widgetId === this.widgetId
    const isHiddenAction = action.type === appActions.ActionKeys.WidgetRuntimeInfoChange && action.widgetId === this.widgetId
      && action.prop === 'state' && action.value === WidgetState.Hidden
    if (isCloseAction || isHiddenAction) {
      const state = getAppStore().getState()
      const widgetConfig = state.appConfig.widgets?.[this.widgetId]?.config as IMConfig
      const isGeometryMode = widgetConfig?.editMode === EditModeType.Geometry
      if (isGeometryMode && !this.confirmClose && this.formChange) {
        this.showWarningBeforeClose?.(isHiddenAction)
        return
      }
    }
    if (this.confirmClose) {
      this.confirmClose = false
    }
    return action
  }
}