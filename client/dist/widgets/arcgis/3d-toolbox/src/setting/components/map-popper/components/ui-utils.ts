/** @jsx jsx */
import { APP_FRAME_NAME_IN_BUILDER, getAppStore } from 'jimu-core'
import type { SizeObj } from '../map-popper'

export const querySelector = (selector: string): HTMLElement => {
  const appFrame: HTMLIFrameElement = document.querySelector(`iframe[name="${APP_FRAME_NAME_IN_BUILDER}"]`)
  if (appFrame) {
    const appFrameDoc = appFrame.contentDocument ?? appFrame.contentWindow.document
    return appFrameDoc.querySelector(selector)
  }
  return null
}

export const getDefalutSize = (useMapWidgetId: string): any => {
  const layoutElem = querySelector(`div.widget-renderer[data-widgetid="${useMapWidgetId}"]`)
  const maxHeight = document.querySelector('#default') ? document.querySelector('#default').clientHeight - 20 : 1080
  let innerSize: SizeObj = { width: 770, height: 850 }
  let innerMapSize: SizeObj = { width: 770, height: 770 }
  if (layoutElem) {
    const clientRect = layoutElem.getBoundingClientRect()
    let ratio = (clientRect.width / clientRect.height)
    ratio = ratio > 0 ? ratio : 1 // for lint: || 1
    let defaultExpandWidth = clientRect.width * 1.1
    let defaultExpandHeight = clientRect.height * 1.1 + 111
    let defaultMapWidth = clientRect.width * 1.1
    let defaultMapHeight = clientRect.height * 1.1
    // width
    if (defaultExpandWidth < 770) {
      defaultExpandWidth = 770
      defaultExpandHeight = 770 / ratio + 111
      defaultMapWidth = 770
      defaultMapHeight = 770 / ratio
    } else if (defaultExpandWidth > 1080) {
      defaultExpandWidth = 1080
      defaultExpandHeight = 1080 / ratio + 111
      defaultMapWidth = 1080
      defaultMapHeight = 1080 / ratio
    }
    // height
    if (defaultExpandHeight > maxHeight) {
      defaultExpandHeight = maxHeight
      defaultExpandWidth = (maxHeight - 111) * ratio > 770 ? (maxHeight - 111) * ratio : 770
    }
    if (defaultMapHeight > (maxHeight - 111)) {
      defaultMapHeight = maxHeight - 111
      defaultMapWidth = (maxHeight - 111) * ratio
    }
    innerSize = {
      width: defaultExpandWidth,
      height: defaultExpandHeight
    }
    innerMapSize = {
      width: defaultMapWidth - 2,
      height: defaultMapHeight
    }
  }
  return { innerSize, innerMapSize }
}

export const getWidgetPosition = (useMapWidgetId: string): any => {
  const isRTL = getAppStore().getState().appStateInBuilder.appContext.isRTL
  let pos = { x: 500, y: 50 }
  const { innerSize } = getDefalutSize(useMapWidgetId)
  const width = isRTL
    ? 518
    : document.body.clientWidth - innerSize.width - 518
  pos = { x: width, y: 50 }
  return pos
}
