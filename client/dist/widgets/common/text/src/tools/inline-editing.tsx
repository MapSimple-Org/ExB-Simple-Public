import { type extensionSpec, type React, getAppStore, appActions, type LayoutContextToolProps, i18n } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import editOutlined from 'jimu-icons/svg/outlined/editor/edit.svg'
import editFilled from 'jimu-icons/svg/filled/editor/edit.svg'
import { builderAppSync } from 'jimu-for-builder'

const getAppState = () => {
  const state = getAppStore().getState()
  const appState = state.appStateInBuilder ? state.appStateInBuilder : state
  return appState
}

export default class TextTool implements extensionSpec.ContextToolExtension {
  index = 0
  id = 'inline-editing'
  widgetId: string

  getGroupId (): string {
    return null
  }

  getTitle (): string {
    const intl = i18n.getIntl('_jimu')
    return intl != null ? intl.formatMessage({ id: 'edit', defaultMessage: defaultMessages.edit }) : 'Edit'
  }

  getIcon (): any {
    return window.jimuConfig.isBuilder ? editFilled : editOutlined
  }

  checked (props: LayoutContextToolProps): boolean {
    const widgetId = props.layoutItem.widgetId
    const widgetsRuntimeInfo = getAppState().widgetsRuntimeInfo
    const checked = widgetsRuntimeInfo[widgetId]?.isInlineEditing
    return !!checked
  }

  onClick (props: LayoutContextToolProps): void {
    const widgetId = props.layoutItem.widgetId
    const widgetsRuntimeInfo = getAppState().widgetsRuntimeInfo
    const isInlineEditing = widgetsRuntimeInfo[widgetId]?.isInlineEditing
    if (window.jimuConfig.isBuilder) {
      builderAppSync.publishSetWidgetIsInlineEditingStateToApp(widgetId, !isInlineEditing)
      if (isInlineEditing) {
        builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'showExpression', value: false })
        builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'showArcade', value: false })
      }
      builderAppSync.publishWidgetToolbarStateChangeToApp(widgetId, ['text-inline-editing', 'text-expression'])
    } else {
      getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, !isInlineEditing))
      if (isInlineEditing) {
        getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showExpression', false))
        getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showArcade', false))
      }
      getAppStore().dispatch(appActions.widgetToolbarStateChange(widgetId, ['text-inline-editing', 'text-expression']))
    }
  }

  getSettingPanel (): React.ComponentClass<unknown> {
    return null
  }
}
