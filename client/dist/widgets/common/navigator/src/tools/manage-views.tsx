import { type extensionSpec, appActions, getAppStore, type LayoutContextToolProps, i18n, AppMode, BrowserSizeMode } from 'jimu-core'
import { type IMConfig, ViewType } from '../config'
import { defaultMessages } from 'jimu-ui'
import ManageViews from '../runtime/builder/manage-views'
import { appBuilderSync, builderAppSync } from 'jimu-for-builder'
import manageIconOutlined from 'jimu-icons/svg/outlined/brand/widget-controller.svg'
import manageIconFilled from 'jimu-icons/svg/filled/data/widget.svg'

export default class ManageViewsTool implements extensionSpec.ContextToolExtension {
  index = 2
  id = 'navigator-manage-views'
  widgetId: string
  isOpenInSidePanel: boolean

  getAppState () {
    const state = getAppStore().getState()
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState
  }

  visible (props: LayoutContextToolProps) {
    const widgetId = props.layoutItem.widgetId

    const isAuto = (this.getAppState().appConfig.widgets[widgetId]?.config as IMConfig)?.data?.type === ViewType.Auto
    const isExpressMode = this.getAppState()?.appRuntimeInfo?.appMode === AppMode.Express
    return isAuto && isExpressMode
  }

  getGroupId () {
    return null
  }

  getTitle () {
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'manageViews', defaultMessage: defaultMessages.manageViews }) : 'Manage views'
  }

  checked () {
    const state = this.getAppState()
    const browserSizeMode = state.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      return this.isOpenInSidePanel
    }
  }

  getIcon () {
    return window.jimuConfig.isBuilder ? manageIconFilled : manageIconOutlined
  }

  widgetToolbarStateChange (widgetId: string) {
    if (window.jimuConfig.isBuilder) {
      builderAppSync.publishWidgetToolbarStateChangeToApp(widgetId, ['navigator-manage-views'])
    } else {
      getAppStore().dispatch(appActions.widgetToolbarStateChange(widgetId, ['navigator-manage-views']))
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
        type: 'navigatorManageViews',
        widgetId,
        uri: 'widgets/common/navigator/',
        onClose,
        active: this.isOpenInSidePanel
      })
    }
  }

  getSettingPanel () {
    const browserSizeMode = this.getAppState()?.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      return null
    }
    return ManageViews
  }
}
