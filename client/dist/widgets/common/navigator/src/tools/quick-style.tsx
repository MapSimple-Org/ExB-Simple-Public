import { type extensionSpec, appActions, getAppStore, type LayoutContextToolProps, i18n, BrowserSizeMode, AppMode } from 'jimu-core'
import { appBuilderSync, builderAppSync } from 'jimu-for-builder'
import { defaultMessages } from 'jimu-ui'
import QuickStyleComponent from '../runtime/builder/quick-style'

export default class TextTool implements extensionSpec.ContextToolExtension {
  index = 0
  id = 'navigator-quick-style'
  widgetId: string
  isOpenInSidePanel: boolean
  openWhenAdded = true

  visible () {
    return this.getAppState()?.appRuntimeInfo?.appMode !== AppMode.Express
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
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'quickStyle', defaultMessage: defaultMessages.quickStyle }) : 'Quick style'
  }

  getIcon () {
    return require('jimu-ui/lib/icons/design.svg')
  }

  checked () {
    const state = this.getAppState()
    const browserSizeMode = state.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      return this.isOpenInSidePanel
    }
  }

  widgetToolbarStateChange (controllerId: string) {
    if (window.jimuConfig.isBuilder) {
      builderAppSync.publishWidgetToolbarStateChangeToApp(controllerId, ['navigator-quick-style'])
    } else {
      getAppStore().dispatch(appActions.widgetToolbarStateChange(controllerId, ['navigator-quick-style']))
    }
  }

  onClick (props: LayoutContextToolProps) {
    const widgetId = props.layoutItem.widgetId
    const state = this.getAppState()
    const browserSizeMode = state.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      this.isOpenInSidePanel = !this.isOpenInSidePanel
      const onClose = () => {
        this.isOpenInSidePanel = false
        this.widgetToolbarStateChange(widgetId)
      }
      appBuilderSync.publishSidePanelToApp({
        type: 'navigatorQuickStyle',
        widgetId,
        uri: 'widgets/common/navigator/',
        onClose,
        active: this.isOpenInSidePanel
      })
    }
  }

  getSettingPanel (props: LayoutContextToolProps) {
    const state = this.getAppState()
    const browserSizeMode = state.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      return null
    }
    return QuickStyleComponent
  }
}
