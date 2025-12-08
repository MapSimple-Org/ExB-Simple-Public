import { type extensionSpec, type React, appActions, getAppStore, type LayoutContextToolProps, Immutable, i18n } from 'jimu-core'
import type { IMWidgetState } from '../config'
import { defaultMessages } from 'jimu-ui'
import dataOutlined from 'jimu-icons/svg/outlined/data/code.svg'
import dataFilled from 'jimu-icons/svg/filled/data/code.svg'
import { builderAppSync } from 'jimu-for-builder'

const getAppState = () => {
  const state = getAppStore().getState()
  const appState = state.appStateInBuilder ? state.appStateInBuilder : state
  return appState
}

const isArcadeEnabled = (props: LayoutContextToolProps): boolean => {
  const widgetId = props.layoutItem.widgetId
  const widgetJson = getAppState().appConfig?.widgets?.[widgetId]
  const arcadeEnabled = (widgetJson?.useDataSources != null && widgetJson?.useDataSources?.length > 0) && widgetJson?.useDataSourcesEnabled
  return arcadeEnabled
}

const canAddArcadeContent = (props: LayoutContextToolProps): boolean => {
  const widgetId = props.layoutItem.widgetId
  const widgetState: IMWidgetState = getAppState().widgetsState[widgetId] ?? Immutable({})
  return widgetState.canAddArcadeContent
}

export default class TextTool implements extensionSpec.ContextToolExtension {
  index = 2
  id = 'text-arcade'
  widgetId: string

  disabled(props: LayoutContextToolProps): boolean {
    const disabled = !isArcadeEnabled(props) || !canAddArcadeContent(props)
    return disabled
  }

  getGroupId (): string {
    return null
  }

  getTitle (props: LayoutContextToolProps): string {
    const arcadeEnabled = isArcadeEnabled(props)
    let translation = arcadeEnabled ? 'arcade' : 'arcadeTip'
    if (arcadeEnabled && !canAddArcadeContent(props)) {
      translation = 'dataSourcesArcadeContentCountLimit'
    }
    const intl = i18n.getIntl('_jimu')
    if (!intl) return translation
    return intl.formatMessage({ id: translation, defaultMessage: defaultMessages[translation] })
  }

  checked (props: LayoutContextToolProps): boolean {
    const widgetId = props.layoutItem.widgetId
    const widgetState: IMWidgetState = getAppState().widgetsState[widgetId] ?? Immutable({})
    return !!widgetState.showArcade
  }

  getIcon (): any {
    return window.jimuConfig.isBuilder ? dataFilled : dataOutlined
  }

  onClick (props: LayoutContextToolProps): void {
    const widgetId = props.layoutItem.widgetId
    const appState = getAppState()
    const widgetState: IMWidgetState = appState.widgetsState[widgetId] ?? Immutable({})
    const showArcade = !widgetState.showArcade

    const isShowArcade = showArcade && !appState.widgetsRuntimeInfo[widgetId].isInlineEditing
    if (window.jimuConfig.isBuilder) {
      if (isShowArcade) {
        builderAppSync.publishSetWidgetIsInlineEditingStateToApp(widgetId, true)
      }
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'showExpression', value: false })
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'showArcade', value: showArcade })
      builderAppSync.publishWidgetToolbarStateChangeToApp(widgetId, ['text-inline-editing', 'text-arcade'])
    } else {
      if (isShowArcade) {
        getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, true))
      }
      getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showExpression', false))
      getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showArcade', showArcade))
      getAppStore().dispatch(appActions.widgetToolbarStateChange(widgetId, ['text-inline-editing', 'text-arcade']))
    }
  }

  getSettingPanel (): React.ComponentClass<unknown> {
    return null
  }
}
