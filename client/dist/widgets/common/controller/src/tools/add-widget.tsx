import { type extensionSpec, getAppStore, type LayoutContextToolProps, i18n, BrowserSizeMode, type LayoutItemConstructorProps } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import PlusOutlined from 'jimu-icons/svg/outlined/editor/plus.svg'
import PlusFilled from 'jimu-icons/svg/filled/editor/plus.svg'
import { AddWidgetComponent } from './add-widget-component'
import { appBuilderSync } from 'jimu-for-builder'
import { getIsItemAccepted, widgetStatePropChange, widgetToolbarStateChange } from '../runtime/builder/utils'

export default class AddWidget implements extensionSpec.ContextToolExtension {
  index = 4
  id = 'conttroller-add-widget1'
  name = 'conttroller-add-widget2'
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
    return intl ? intl.formatMessage({ id: 'addWidget', defaultMessage: defaultMessages.addWidget }) : 'Add widget'
  }

  getIcon () {
    return window.jimuConfig.isBuilder ? PlusFilled : PlusOutlined
  }

  visible () {
    return true
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
        widgetToolbarStateChange(controllerId, ['controller-add-widget'])
      }
      appBuilderSync.publishSidePanelToApp({
        type: 'widget',
        widgetId: controllerId,
        keepPanel: true,
        active: this.isOpenInSidePanel,
        isItemAccepted: getIsItemAccepted(controllerId),
        onSelect: (item: LayoutItemConstructorProps) => {
          widgetStatePropChange(controllerId, 'itemToAdd', item)
        },
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
    return AddWidgetComponent
  }
}
