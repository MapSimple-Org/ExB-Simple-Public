import { type extensionSpec, type React, getAppStore, type LayoutContextToolProps, i18n } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import rightOutlined from 'jimu-icons/svg/outlined/directional/right.svg'
import leftOutlined from 'jimu-icons/svg/outlined/directional/left.svg'
import rightFilled from 'jimu-icons/svg/filled/directional/right.svg'
import leftFilled from 'jimu-icons/svg/filled/directional/left.svg'
import { OverflownStyle } from '../config'

export default class Previous implements extensionSpec.ContextToolExtension {
  index = 1
  id = 'controller-roll-list-previous'
  widgetId: string
  scroll: (previous: boolean) => void

  classes: { [widgetId: string]: React.ComponentClass<unknown> } = {}

  getAppState () {
    const state = getAppStore().getState()
    const appState = state.appStateInBuilder ? state.appStateInBuilder : state
    return appState
  }

  visible (props: LayoutContextToolProps) {
    const state = this.getAppState()
    const widgetId = props.layoutItem.widgetId
    const overflownStyle = state.appConfig.widgets[widgetId]?.config?.behavior?.overflownStyle
    const hideArrow = state.widgetsState[widgetId]?.hideArrow ?? true
    return !hideArrow && overflownStyle !== OverflownStyle.PopupWindow
  }

  disabled (props: LayoutContextToolProps) {
    const widgetState = this.getAppState().widgetsState[props.layoutItem.widgetId]
    return widgetState?.disablePrevious
  }

  getGroupId () {
    return 'controller-tools'
  }

  getTitle () {
    const intl = i18n.getIntl('_jimu')
    return intl ? intl.formatMessage({ id: 'previous', defaultMessage: defaultMessages.previous }) : 'Previous'
  }

  getIcon () {
    const left = window.jimuConfig.isBuilder ? leftFilled : leftOutlined
    const right = window.jimuConfig.isBuilder ? rightFilled : rightOutlined
    const isRTL = this.getAppState().appContext?.isRTL
    return !isRTL ? left : right
  }

  onClick (props: LayoutContextToolProps) {
    this.scroll && this.scroll(true)
  }

  getSettingPanel (props: LayoutContextToolProps): React.ComponentClass<unknown> {
    return null
  }
}
