import { getAppStore, type IMState, LayoutType, APP_FRAME_NAME_IN_BUILDER } from 'jimu-core'
import { getAppConfigAction } from 'jimu-for-builder'
import { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime'
import { MenuType } from '../config'

const getDefaultSizeByMenuType = (menuType: MenuType) => {
  switch (menuType) {
    case MenuType.Icon:
      return {
        width: 50,
        height: 50
      }
    case MenuType.Vertical:
      return {
        width: 300,
        height: 300
      }
    default:
      return {
        width: 300,
        height: 50
      }
  }
}

const querySelector = (selector: string): HTMLElement => {
  const appFrame: HTMLIFrameElement = document.querySelector(`iframe[name="${APP_FRAME_NAME_IN_BUILDER}"]`)
  if (appFrame) {
    const appFrameDoc = appFrame.contentDocument ?? appFrame.contentWindow.document
    return appFrameDoc.querySelector(selector)
  }
  return null
}

export const changeAutoSizeAndDefaultSize = (menuType: MenuType) => {
  let runtimeState: IMState
  const state = getAppStore().getState()
  if (window.jimuConfig.isBuilder) {
    runtimeState = state?.appStateInBuilder
  } else {
    runtimeState = state
  }

  const layoutInfo = runtimeState?.appRuntimeInfo?.selection

  const layout = runtimeState.appConfig.layouts?.[layoutInfo?.layoutId]
  const layoutItem = layout?.content?.[layoutInfo?.layoutItemId]

  if (!layout || !layoutItem) {
    return
  }

  if (layout?.type === LayoutType.FixedLayout) {
    /**
     * change auto size and default size after type changed
     * Icon: auto width and auto height, if change to custom, default size will be: width: 50, height: 50
     * Horizontal: auto height, if change to custom, default size will be: width: 300, height: 50
     * Vertical: auto width, if change to custom, default size will be: width: 300, height: 300
     */
    const isVertical = menuType === MenuType.Vertical
    const isHorizontal = menuType === MenuType.Horizontal

    const { width, height } = getDefaultSizeByMenuType(menuType)

    const selector = `div.layout[data-layoutid=${layoutInfo.layoutId}]`
    const parentElement = querySelector(selector)
    const { clientWidth = 100, clientHeight = 100 } = parentElement || {}

    const ratioWidth = `${width * 100 / clientWidth}%`
    const ratioHeight = `${height * 100 / clientHeight}%`

    getAppConfigAction()
      .editLayoutItemProperty(
        layoutInfo,
        'setting.autoProps',
        {
          width: isHorizontal ? LayoutItemSizeModes.Custom : LayoutItemSizeModes.Auto,
          height: isVertical ? LayoutItemSizeModes.Custom : LayoutItemSizeModes.Auto
        }
      )
      .editLayoutItemProperty(layoutInfo, 'bbox', layoutItem.bbox.set('width', ratioWidth).set('height', ratioHeight))
      .exec()
  }
}
