import { type extensionSpec, appActions, getAppStore, type LayoutContextToolProps, i18n, BrowserSizeMode } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import { isInController } from '../runtime/util'
import { QuickStyle } from '../runtime/builder/quick-style'

import BrushOutlined from 'jimu-icons/svg/outlined/editor/brush.svg'
import { appBuilderSync, builderAppSync } from 'jimu-for-builder'

export default class QuickStyleTool implements extensionSpec.ContextToolExtension {
  index = 2
  id = 'accordion-quick-style'
  openWhenAdded = true
  widgetId: string
  isOpenInSidePanel: boolean

  visible (props: LayoutContextToolProps) {
    // hide if it is contained in a controller widget
    const { layoutId } = props
    const appConfig = this.getAppState().appConfig
    return !window.isExpressBuilder && !isInController(layoutId, appConfig)
  }

  getGroupId () {
    return null
  }

  getTitle () {
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'quickStyle', defaultMessage: defaultMessages.quickStyle }) : 'Quick style'
  }

  checked () {
    const state = this.getAppState()
    const browserSizeMode = state.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      return this.isOpenInSidePanel
    }
    return false
  }

  getIcon () {
    return BrushOutlined
  }

  getAppState () {
    const state = getAppStore().getState()
    return window.jimuConfig.isBuilder ? state.appStateInBuilder : state
  }

  widgetToolbarStateChange (controllerId: string) {
    if (window.jimuConfig.isBuilder) {
      builderAppSync.publishWidgetToolbarStateChangeToApp(controllerId, ['accordion-quick-style'])
    } else {
      getAppStore().dispatch(appActions.widgetToolbarStateChange(controllerId, ['accordion-quick-style']))
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
        type: 'accordionQuickStyle',
        widgetId,
        uri: 'widgets/layout/accordion/',
        onClose,
        active: this.isOpenInSidePanel
      })
    }
  }

  getSettingPanel () {
    const state = this.getAppState()
    if (!window.jimuConfig.isInBuilder || state.browserSizeMode === BrowserSizeMode.Small) {
      return null
    }
    return QuickStyle
  }
}
