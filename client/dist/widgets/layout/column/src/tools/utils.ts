import {
  LayoutItemType,
  type LayoutItemConstructorProps,
  getAppStore,
  appActions,
  WidgetType,
  AppMode,
  type IMState
} from 'jimu-core'
import { addItemToLayout } from 'jimu-layouts/layout-builder'
import { builderAppSync, getAppConfigAction } from 'jimu-for-builder'
import { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime'

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

export const addItemToColumn = async (widgetId: string, item: LayoutItemConstructorProps) => {
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
    const { width, height, autoHeight } = item.manifest.defaultSize
    if (autoHeight) {
      appConfigAction.editLayoutItemProperty(layoutInfo, 'setting.autoProps.height', LayoutItemSizeModes.Auto)
    }
    if (height) {
      appConfigAction.editLayoutItemProperty(layoutInfo, 'bbox.height', `${height}px`, true)
    }
    if (width) {
      appConfigAction.editLayoutItemProperty(layoutInfo, 'bbox.width', `${width}px`, true)
    }
    if (!width && !height) {
      appConfigAction.editLayoutItemProperty(layoutInfo, 'bbox', { }, true)
    }
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
