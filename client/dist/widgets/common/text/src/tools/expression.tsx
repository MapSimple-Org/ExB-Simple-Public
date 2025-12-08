import { type extensionSpec, type React, appActions, getAppStore, type LayoutContextToolProps, Immutable, i18n } from 'jimu-core'
import type { IMWidgetState } from '../config'
import { defaultMessages } from 'jimu-ui'
import dataOutlined from 'jimu-icons/svg/outlined/data/data.svg'
import dataFilled from 'jimu-icons/svg/filled/data/data.svg'
import { builderAppSync } from 'jimu-for-builder'

const getAppState = () => {
  const state = getAppStore().getState()
  const appState = state.appStateInBuilder ? state.appStateInBuilder : state
  return appState
}

const isExpressionEnabled = (props: LayoutContextToolProps): boolean => {
  const widgetId = props.layoutItem.widgetId
  const widgetJson = getAppState().appConfig?.widgets?.[widgetId]
  const expressionEnabled = (widgetJson?.useDataSources != null && widgetJson?.useDataSources?.length > 0) && widgetJson?.useDataSourcesEnabled
  return expressionEnabled
}

export default class TextTool implements extensionSpec.ContextToolExtension {
  index = 1
  id = 'text-expression'
  widgetId: string

  disabled (props: LayoutContextToolProps): boolean {
    const disabled = !isExpressionEnabled(props)
    return disabled
  }

  getGroupId (): string {
    return null
  }

  getTitle (props: LayoutContextToolProps): string {
    const expressionEnabled = isExpressionEnabled(props)
    const translation = expressionEnabled ? 'dynamicContent' : 'dynamicContentTip'
    const intl = i18n.getIntl('_jimu')
    if (!intl) return translation
    return intl.formatMessage({ id: translation, defaultMessage: defaultMessages[translation] })
  }

  checked (props: LayoutContextToolProps): boolean {
    const widgetId = props.layoutItem.widgetId
    const widgetState: IMWidgetState = getAppState().widgetsState[widgetId] ?? Immutable({})
    return !!widgetState.showExpression
  }

  getIcon (): any {
    return window.jimuConfig.isBuilder ? dataFilled : dataOutlined
  }

  onClick (props: LayoutContextToolProps): void {
    const widgetId = props.layoutItem.widgetId
    const appState = getAppState()
    const widgetState: IMWidgetState = appState.widgetsState[widgetId] ?? Immutable({})
    const showExpression = !widgetState.showExpression

    const isShowExpression = showExpression && !appState.widgetsRuntimeInfo[widgetId].isInlineEditing
    if (window.jimuConfig.isBuilder) {
      if (isShowExpression) {
        builderAppSync.publishSetWidgetIsInlineEditingStateToApp(widgetId, true)
      }
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'showArcade', value: false })
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'showExpression', value: showExpression })
      builderAppSync.publishWidgetToolbarStateChangeToApp(widgetId, ['text-inline-editing', 'text-expression'])
    } else {
      if (isShowExpression) {
        getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, true))
      }
      getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showArcade', false))
      getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showExpression', showExpression))
      getAppStore().dispatch(appActions.widgetToolbarStateChange(widgetId, ['text-inline-editing', 'text-expression']))
    }
  }

  getSettingPanel (): React.ComponentClass<unknown> {
    return null
  }
}
