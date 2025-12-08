import { type extensionSpec, getAppStore, type LayoutContextToolProps, i18n, BrowserSizeMode, type LayoutItemConstructorProps } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import PlusOutlined from 'jimu-icons/svg/outlined/editor/plus.svg'
import PlusFilled from 'jimu-icons/svg/filled/editor/plus.svg'
import { AddWidgetComponent } from './add-widget-component'
import { appBuilderSync } from 'jimu-for-builder'
import { isLayoutItemAccepted, addItemToColumn, widgetToolbarStateChange } from './utils'

export default class AddWidget implements extensionSpec.ContextToolExtension {
  index = 4
  id = 'column-add-widget'
  name = 'column-add-widget'
  widgetId: string
  isOpenInSidePanel: boolean

  getAppState () {
    const state = getAppStore().getState()
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState
  }

  getGroupId () {
    return 'column-tools'
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
    const { widgetId } = props.layoutItem
    const state = this.getAppState()
    const browserSizeMode = state.browserSizeMode
    if (browserSizeMode === BrowserSizeMode.Small) {
      this.isOpenInSidePanel = !this.isOpenInSidePanel
      const onClose = () => {
        this.isOpenInSidePanel = false
        widgetToolbarStateChange(widgetId, ['column-add-widget'])
      }
      appBuilderSync.publishSidePanelToApp({
        type: 'widget',
        uri: 'widgets/layout/column/',
        widgetId: widgetId,
        keepPanel: true,
        active: this.isOpenInSidePanel,
        isItemAccepted: isLayoutItemAccepted,
        onSelect: (item: LayoutItemConstructorProps) => {
          addItemToColumn(widgetId, item)
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
