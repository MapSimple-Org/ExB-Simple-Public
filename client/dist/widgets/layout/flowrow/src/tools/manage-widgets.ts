import { type extensionSpec, getAppStore, type LayoutContextToolProps, i18n, BrowserSizeMode, AppMode } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import WidgetControllerOutlined from 'jimu-icons/svg/outlined/brand/widget-controller.svg'
import WidgetControllerFilled from 'jimu-icons/svg/filled/data/widget.svg'
import { ManageWidgetsComponent } from './manage-widgets-component'
import { appBuilderSync } from 'jimu-for-builder'
import { widgetToolbarStateChange } from './utils'

export default class ManageWidgets implements extensionSpec.ContextToolExtension {
  index = 3
  id = 'flowrow-manage-widgets'
  name = 'flowrow-manage-widgets'
  widgetId: string
  isOpenInSidePanel: boolean

  getAppState () {
    const state = getAppStore().getState()
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState
  }

  getGroupId () {
    return 'flowrow-tools'
  }

  getTitle () {
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'manageWidgets', defaultMessage: defaultMessages.manageWidgets }) : 'Manage widgets'
  }

  getIcon () {
    return window.jimuConfig.isBuilder ? WidgetControllerFilled : WidgetControllerOutlined
  }

  visible () {
    const state = this.getAppState()
    const isLockLayout = state.appConfig?.forBuilderAttributes?.lockLayout ?? false
    return state.appRuntimeInfo.appMode === AppMode.Design && !isLockLayout
  }

  disabled (props: LayoutContextToolProps) {
    const state = this.getAppState()
    const { appConfig, browserSizeMode } = state
    const widgetId = props.layoutItem.widgetId
    const widgetJson = appConfig.widgets[widgetId]
    const layoutName = Object.keys(widgetJson.layouts)[0]
    const layoutId = widgetJson.layouts[layoutName]?.[browserSizeMode] || widgetJson.layouts[layoutName]?.[appConfig.mainSizeMode]
    const widgetCount = appConfig.layouts[layoutId]?.order?.length ?? 0
    return widgetCount === 0
  }

  checked () {
    const state = this.getAppState()
    const browserSizeMode = state.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      return this.isOpenInSidePanel
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
        widgetToolbarStateChange(widgetId, ['flowrow-manage-widgets'])
      }
      appBuilderSync.publishSidePanelToApp({
        type: 'manageWidgets',
        uri: 'widgets/layout/flowrow/',
        widgetId: widgetId,
        keepPanel: true,
        active: this.isOpenInSidePanel,
        onClose
      })
    }
  }

  getSettingPanel (props: LayoutContextToolProps) {
    const state = this.getAppState()
    const browserSizeMode = state.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      return null
    }
    return ManageWidgetsComponent
  }
}
