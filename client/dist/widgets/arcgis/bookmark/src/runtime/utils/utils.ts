import { loadArcGISJSAPIModules, utils } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { DistanceUnits, type LinearUnit, utils as jimuUtils } from 'jimu-ui'
import { type IMConfig, TemplateType, type ElementSize } from '../../config'
import { DEFAULT_CARD_ITEM_SPACE, SCROLL_BAR_WIDTH } from '../../constants'

const localAppKey = utils.getLocalStorageAppKey()

export const getOldKey = (widgetId, mapWidgetId) => {
  return `${localAppKey}-${widgetId}-${mapWidgetId || 'default'}-RtBmArray`
}

export const getKey = (widgetId, mapWidgetId) => {
  return `${localAppKey}-bookmark-${widgetId}-bookmarks-${mapWidgetId || 'default'}`
}

export const getBookmarkListFromCache = (widgetId, mapWidgetId): string[] => {
  const oldKey = getOldKey(widgetId, mapWidgetId)
  const newKey = getKey(widgetId, mapWidgetId)
  return JSON.parse(utils.readLocalStorage(newKey) || utils.readLocalStorage(oldKey)) || []
}

export const applyTimeExtent = (jimuMapView: JimuMapView, timeExtent: __esri.TimeExtentProperties) => {
  const jimuLayerViews = jimuMapView.getAllJimuLayerViews()
  loadArcGISJSAPIModules([
    'esri/layers/support/FeatureFilter',
    'esri/TimeExtent'
  ]).then(modules => {
    const FeatureFilter: typeof __esri.FeatureFilter = modules[0]
    const TimeExtent: typeof __esri.TimeExtent = modules[1]
    jimuLayerViews.forEach(async jimuLayerView => {
      await jimuMapView.whenJimuLayerViewLoaded(jimuLayerView.id)
      const featureLayerView = jimuLayerView.view as __esri.FeatureLayerView
      if (featureLayerView) {
        if (featureLayerView.filter) {
          const filter = featureLayerView.filter.clone()
          filter.timeExtent = new TimeExtent({ start: timeExtent[0], end: timeExtent[1] })
          featureLayerView.filter = filter
        } else {
          const filter = new FeatureFilter({ })
          filter.timeExtent = new TimeExtent({ start: timeExtent[0], end: timeExtent[1] })
          featureLayerView.filter = filter
        }
      }
    })
  })
}

export const getScrollParam = (buttonType: string, isHorizontal: boolean, isRTL: boolean, scrollWidth: number, scrollHeight: number, space: number) => {
  let topValue: number, leftValue: number
  const scrollStep = scrollWidth + space
  if (buttonType === 'next') {
    topValue = isHorizontal ? 0 : scrollHeight
    leftValue = isHorizontal ? (isRTL ? -scrollStep : scrollStep) : 0
  } else if (buttonType === 'previous') {
    topValue = isHorizontal ? 0 : -scrollHeight
    leftValue = isHorizontal ? (isRTL ? scrollStep : -scrollStep) : 0
  }

  return {
    top: topValue,
    left: leftValue,
    behavior: 'smooth' as ScrollBehavior
  }
}

//Convert card template size config to number
export function getCardSizeNumberInConfig (cardItemWidth: number | string, cardItemHeight: number | string, keepAspectRatio: boolean, cardItemSizeRatio: number, widgetRect: ElementSize): ElementSize {
  const widthLinearUnit = jimuUtils.toLinearUnit(cardItemWidth)
  let width = initCardSize(jimuUtils.toLinearUnit(cardItemWidth), widgetRect.width - SCROLL_BAR_WIDTH * 2)
  //The width in percentage includes space, the width in px does not include
  if (widthLinearUnit.unit === DistanceUnits.PERCENTAGE) {
    width = width - DEFAULT_CARD_ITEM_SPACE
  }

  let height = initCardSize(jimuUtils.toLinearUnit(cardItemHeight), widgetRect.height)
  if (keepAspectRatio) {
    height = width * cardItemSizeRatio
  }
  const cardSize = {
    width: width,
    height: height
  }
  return cardSize
}

function initCardSize (sizeUnit: LinearUnit, contentSize: number): number {
  if (sizeUnit.unit === DistanceUnits.PERCENTAGE) {
    return (sizeUnit.distance / 100) * contentSize
  } else {
    return sizeUnit.distance
  }
}

//Get the left and right padding of card template, in order to align items center.
export function getPaddingOfCardTemplate (cardWidth: number, widgetRectWidth: number, configBookmarkNum: number, runtimeBookmarkNum: number) {
  const cardItemCount = getCardItemColumnCount(cardWidth, widgetRectWidth, configBookmarkNum, runtimeBookmarkNum)
  const rowWidth = cardItemCount * (cardWidth + DEFAULT_CARD_ITEM_SPACE)
  const padding = (widgetRectWidth - rowWidth - SCROLL_BAR_WIDTH * 2) / 2
  return padding
}

function getCardItemColumnCount (cardWidth: number, widgetRectWidth: number, configBookmarkNum: number, runtimeBookmarkNum: number) {
  const containerWidth = widgetRectWidth - SCROLL_BAR_WIDTH * 2
  const itemWidth = cardWidth + DEFAULT_CARD_ITEM_SPACE
  const count = Math.floor(containerWidth / itemWidth) || 1

  //The bookmark example case and it has 3 default images
  if (configBookmarkNum === 0 && runtimeBookmarkNum === 0) {
    return Math.min(count, 3)
  } else {
    const num = Math.max(configBookmarkNum, runtimeBookmarkNum)
    return Math.min(count, num)
  }
}

//Get the total bookmarks from map bookmarks and the exb config bookmarks.
//Note: The advanced template don't support display bookmarks from web map because they may have the different display layout.
export const getTotalBookmarks = (config: IMConfig, mapBookmarks: any[]) => {
  const advancedTemplates = [TemplateType.Custom1, TemplateType.Custom2]
  const bookmarks = !advancedTemplates.includes(config.templateType) && config.displayFromWeb
    ? config.bookmarks.concat(mapBookmarks)
    : config.bookmarks
  return bookmarks
}
