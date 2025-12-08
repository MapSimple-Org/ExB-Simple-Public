import {
  getAppConfigAction,
  type AppConfigAction,
  builderAppSync
} from 'jimu-for-builder'
import { type IMAppConfig, LayoutItemType, getAppStore, appActions, type BrowserSizeMode } from 'jimu-core'
import { searchUtils } from 'jimu-layouts/layout-runtime'
import { Status, type IMConfig, type CardSize } from './config'

export function selectSelf (id: string, fromPage?: boolean) {
  const browserSizeMode = getAppStore().getState().browserSizeMode
  const appConfig = getAppConfigAction().appConfig
  const layoutInfos = searchUtils.getContentLayoutInfosInOneSizeMode(
    appConfig,
    id,
    LayoutItemType.Widget,
    browserSizeMode
  )
  if (layoutInfos) {
    if (layoutInfos.length > 1) {
      const widgetId = searchUtils.getWidgetIdThatUseTheLayoutId(
        appConfig,
        layoutInfos[0].layoutId
      )
      if (widgetId) {
        const widgetJson = appConfig.widgets[widgetId]
        if (
          widgetJson &&
          widgetJson.manifest &&
          widgetJson.manifest.name &&
          widgetJson.manifest.name === 'list'
        ) {
          const currentStatus =
            getAppStore().getState().widgetsState &&
            getAppStore().getState().widgetsState[widgetJson.id] &&
            getAppStore().getState().widgetsState[widgetJson.id].builderStatus
          if (currentStatus) {
            const currentLayoutId = searchUtils.findLayoutId(
              widgetJson.layouts[currentStatus],
              browserSizeMode,
              appConfig.mainSizeMode
            )
            const layoutInfo = layoutInfos.find(
              lInfo => lInfo.layoutId === currentLayoutId
            )
            if (fromPage) {
              getAppStore().dispatch(appActions.selectionChanged(layoutInfo))
            } else {
              builderAppSync.publishChangeSelectionToApp(layoutInfo)
            }
          }
        }
      }
    } else if (layoutInfos.length > 0) {
      if (fromPage) {
        getAppStore().dispatch(appActions.selectionChanged(layoutInfos[0]))
      } else {
        builderAppSync.publishChangeSelectionToApp(layoutInfos[0])
      }
    }
  }
}

export interface HandleResizeCardOptions {
  widgetId: string,
  browserSizeMode: BrowserSizeMode,
  newCardSize: CardSize,
  widgetConfig: IMConfig,
  appConfig?: IMAppConfig
}

export function handleResizeCard (option: HandleResizeCardOptions): AppConfigAction {
  const { widgetId, browserSizeMode, newCardSize, widgetConfig } = option
  let appConfig = option?.appConfig
  if (!appConfig) {
    appConfig = getAppConfigAction().appConfig
  }
  const action = getAppConfigAction(appConfig)

  action.editWidgetConfig(
    widgetId,
    widgetConfig
      .setIn(
        ['cardConfigs', Status.Default, 'cardSize', browserSizeMode],
        newCardSize
      )
      .setIn(
        ['cardConfigs', Status.Hover, 'cardSize', browserSizeMode],
        newCardSize
      )
      .setIn(
        ['cardConfigs', Status.Selected, 'cardSize', browserSizeMode],
        newCardSize
      )
  )

  return action
}
