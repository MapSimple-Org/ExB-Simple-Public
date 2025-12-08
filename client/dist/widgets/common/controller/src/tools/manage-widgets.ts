import { type extensionSpec, getAppStore, type LayoutContextToolProps, i18n, BrowserSizeMode } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import WidgetControllerOutlined from 'jimu-icons/svg/outlined/brand/widget-controller.svg'
import WidgetControllerFilled from 'jimu-icons/svg/filled/data/widget.svg'
import { ManageWidgetsComponent } from './manage-widgets-component'
import { appBuilderSync } from 'jimu-for-builder'
import { BASE_LAYOUT_NAME } from '../common/consts'
import { getIsInController, widgetToolbarStateChange } from '../runtime/builder/utils'


export default class ManageWidgets implements extensionSpec.ContextToolExtension {
  index = 3
  id = 'conttroller-manage-widgets1'
  name = 'conttroller-manage-widgets2'
  widgetId: string
  isOpenInSidePanel: boolean

  getAppState () {
    const state = getAppStore().getState()
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState
  }
  getGroupId () {
    return 'controller-tools'
  }
  getTitle () {
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'manageWidgets', defaultMessage: defaultMessages.manageWidgets }) : 'Manage widgets'
  }
  getIcon () {
    return window.jimuConfig.isBuilder ? WidgetControllerFilled : WidgetControllerOutlined
  }
  visible (props: LayoutContextToolProps) {
    return !getIsInController(props.layoutItem.widgetId)
  }
  disabled (props: LayoutContextToolProps) {
    const state = this.getAppState()
    const { appConfig, browserSizeMode } = state
    const controllerId = props.layoutItem.widgetId
    const widgetJson = appConfig.widgets[controllerId]
    const layoutId = widgetJson.layouts[BASE_LAYOUT_NAME]?.[browserSizeMode] || widgetJson.layouts[BASE_LAYOUT_NAME]?.[appConfig.mainSizeMode]
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
    const controllerId = props.layoutItem.widgetId
    const state = this.getAppState()
    const browserSizeMode = state.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      this.isOpenInSidePanel = !this.isOpenInSidePanel
      const onClose = () => {
        this.isOpenInSidePanel = false
        widgetToolbarStateChange(controllerId, ['controller-manage-widgets'])
      }
      appBuilderSync.publishSidePanelToApp({
        type: 'manageWidgets',
        uri: 'widgets/common/controller/',
        widgetId: controllerId,
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