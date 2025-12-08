import { getAppStore, type IMState, LayoutType, type IMAppConfig } from 'jimu-core'
import type { AppConfigAction } from 'jimu-for-builder'
import { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime'
import type { IMViewNavigationDisplay, ViewNavigationDisplay } from './runtime/components/view-navigation'

export const isInTabStyle = (display: Partial<ViewNavigationDisplay> | IMViewNavigationDisplay) => {
  return display?.type === 'nav' && !display?.standard?.alternateIcon && !display?.standard?.activedIcon
}

export const isInSymbolStyle = (display: Partial<ViewNavigationDisplay> | IMViewNavigationDisplay) => {
  return !!(display?.type === 'nav' && display?.standard?.alternateIcon && display?.standard?.activedIcon)
}

export const setWidgetSize = (display: Partial<ViewNavigationDisplay> | IMViewNavigationDisplay, getAppConfigAction: (appConfig?: IMAppConfig) => AppConfigAction) => {
  if (!getAppConfigAction) {
    return
  }

  let runtimeState: IMState
  const state = getAppStore().getState()
  if (window.jimuConfig.isBuilder) {
    runtimeState = state?.appStateInBuilder
  } else {
    runtimeState = state
  }

  const layoutInfo = runtimeState?.appRuntimeInfo?.selection

  const layout = runtimeState.appConfig.layouts?.[layoutInfo?.layoutId]

  if (!layout) {
    return
  }

  if (layout?.type === LayoutType.FixedLayout) {
    /**
     * change auto size and default size after quick style or direction changed
     * For tab style: auto width and auto height
     * For symbol, slide and arrow style: auto height
     * For all styles: if change to custom, default size of horizontal will be: width: 380, height: 60, default size of vertical will be width: 60, height: 380
     */

    const isTabStyle = isInTabStyle(display)
    const isVertical = display?.vertical

    getAppConfigAction().editLayoutItemSize(layoutInfo, isVertical ? 60 : 380, isVertical ? 380 : 60).exec()

    getAppConfigAction().editLayoutItemProperty(
      layoutInfo,
      'setting.autoProps',
      {
        width: isTabStyle || isVertical ? LayoutItemSizeModes.Auto : LayoutItemSizeModes.Custom,
        height: isTabStyle || !isVertical ? LayoutItemSizeModes.Auto : LayoutItemSizeModes.Custom
      }
    ).exec()
  }
}
