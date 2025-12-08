/** @jsx jsx */
import { type extensionSpec, appActions, getAppStore, type LayoutContextToolProps, i18n, BrowserSizeMode } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import BrushOutlined from 'jimu-icons/svg/outlined/editor/brush.svg'
import { appBuilderSync, builderAppSync } from 'jimu-for-builder'
import { QuickStyle as QuickStyleComponent } from '../runtime/builder/quick-style'

export default class QuickStyle implements extensionSpec.ContextToolExtension {
  index = 2
  id = 'button-quick-style'
  widgetId: string
  isOpenInSidePanel: boolean
  openWhenAdded = true

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
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'quickStyle', defaultMessage: defaultMessages.quickStyle }) : 'Quick style'
  }

  getIcon () {
    return BrushOutlined
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
      builderAppSync.publishWidgetToolbarStateChangeToApp(controllerId, ['button-quick-style'])
    } else {
      getAppStore().dispatch(appActions.widgetToolbarStateChange(controllerId, ['button-quick-style']))
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
        type: 'buttonQuickStyle',
        widgetId,
        uri: 'widgets/common/button/',
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
