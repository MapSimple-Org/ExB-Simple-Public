/** @jsx jsx */
import { type extensionSpec, appActions, getAppStore, type LayoutContextToolProps, i18n, Immutable } from 'jimu-core'
import defaultMessages from '../runtime/translations/default'
import ExchangeOutlined from 'jimu-icons/svg/outlined/directional/exchange.svg'
import { builderAppSync } from 'jimu-for-builder'
import type { IMWidgetState } from '../config'

export default class ModeSwitch implements extensionSpec.ContextToolExtension {
  index = 1
  id = 'login-mode-switch'
  widgetId: string
  isOpenInSidePanel: boolean
  openWhenAdded = false

  visible (props: LayoutContextToolProps) {
    return true
  }

  getAppState () {
    const state = getAppStore().getState()
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState
  }

  getGroupId () {
    return null
  }

  getTitle () {
    const intl = i18n.getIntl(this.widgetId)
    return intl ? intl.formatMessage({ id: 'toggleSignInPreview', defaultMessage: defaultMessages.toggleSignInPreview}) : defaultMessages.toggleSignInPreview
    //if (this.isLogoutMode()) {
    //  return intl ? intl.formatMessage({ id: 'switchToLogout', defaultMessage: defaultMessages.switchToLogout}) : defaultMessages.switchToLogout
    //} else {
    //  return intl ? intl.formatMessage({ id: 'switchToLogin', defaultMessage: defaultMessages.switchToLogin}) : defaultMessages.switchToLogin
    //}
  }

  getIcon () {
    return ExchangeOutlined
  }

  isLogoutMode () {
    const appState = this.getAppState()
    const widgetState: IMWidgetState = appState.widgetsState[this.widgetId] || Immutable({})
    return widgetState?.isLogoutMode
  }

  checked () {
    return this.isLogoutMode()
  }

  onClick (props: LayoutContextToolProps) {
    const mode = !this.isLogoutMode()
    if (window.jimuConfig.isBuilder) {
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.widgetId, propKey: 'isLogoutMode', value: mode})
    } else {
      getAppStore().dispatch(appActions.widgetStatePropChange(this.widgetId, 'isLogoutMode', mode))
    }
  }

  getSettingPanel (props: LayoutContextToolProps) {
    return null
  }
}
