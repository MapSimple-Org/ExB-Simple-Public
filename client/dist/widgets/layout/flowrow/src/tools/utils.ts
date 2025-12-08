import {
  LayoutItemType,
  type LayoutItemConstructorProps,
  type LayoutInfo,
  getAppStore,
  appActions,
  WidgetType,
  AppMode,
  type IMState
} from 'jimu-core'
import { addItemToLayout } from 'jimu-layouts/layout-builder'
import { builderAppSync, getAppConfigAction } from 'jimu-for-builder'

export const isLayoutItemAccepted = (item: LayoutItemConstructorProps): boolean => {
  const state = getAppStore().getState()
  const appState = state.appStateInBuilder ? state.appStateInBuilder : state
  const itemType = item?.itemType
  const widgetType = item?.manifest?.widgetType
  const isExpressMode = appState.appRuntimeInfo.appMode === AppMode.Express
  if (isExpressMode && (itemType === LayoutItemType.Section || widgetType === WidgetType.Layout)) {
    return false
  }
  return true
}

export const addItemToFlowRow = async (widgetId: string, item: LayoutItemConstructorProps) => {
  let appState: IMState
  if (window.jimuConfig.isBuilder) {
    appState = getAppStore().getState().appStateInBuilder
  } else {
    appState = getAppStore().getState()
  }
  const appConfig = appState.appConfig
  const widgetJson = appConfig.widgets[widgetId]
  const layoutId = widgetJson.layouts.DEFAULT[appState.browserSizeMode]
  const { layoutInfo, updatedAppConfig } = await addItemToLayout(appConfig, item, layoutId)
  const appConfigAction = getAppConfigAction(updatedAppConfig)
  if (item.manifest?.defaultSize) {
    const { width, height } = item.manifest.defaultSize
    appConfigAction.editLayoutItemProperty(layoutInfo, 'bbox', { width: `${width}px`, height: `${height}px` }, true)
  }
  appConfigAction.adjustOrderOfItem(layoutInfo, null, true).exec()
}

export const widgetToolbarStateChange = (controllerId: string, toolNames: string[]) => {
  if (window.jimuConfig.isBuilder) {
    builderAppSync.publishWidgetToolbarStateChangeToApp(controllerId, toolNames)
  } else {
    getAppStore().dispatch(appActions.widgetToolbarStateChange(controllerId, toolNames))
  }
}

export const removeLayoutItem = (layoutInfo: LayoutInfo, widgetId: string) => {
  const appConfigAction = getAppConfigAction()
  appConfigAction.removeLayoutItem(layoutInfo, true, true)
  appConfigAction.exec()

  const state = getAppStore().getState()
  const { layoutId, layoutItemId } = layoutInfo
  const selection = state.appRuntimeInfo.selection
  if (!selection || (selection?.layoutId === layoutId && selection?.layoutItemId === layoutItemId)) {
    const controllerLayoutInfo = state.appConfig.widgets[widgetId]?.parent?.[state.browserSizeMode]?.[0]
    getAppStore().dispatch(appActions.selectionChanged(controllerLayoutInfo))
  }
}
