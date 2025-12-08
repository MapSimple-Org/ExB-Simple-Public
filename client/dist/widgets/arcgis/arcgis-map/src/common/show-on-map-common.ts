import { type ImmutableObject, type DataRecordSet, i18n } from 'jimu-core'
import { type SymbolOption, featureUtils, type TitleCountInfo, type ShowOnMapDatas, type ShowOnMapData } from 'jimu-arcgis'
import defaultMessages from '../runtime/translations/default'

export interface ShowOnMapConfig {
  isUseCustomSymbol?: boolean
  symbolOption?: SymbolOption
  isOperationalLayer?: boolean
}

export type IMShowOnMapConfig = ImmutableObject<ShowOnMapConfig>

export function getDefaultSymbolOptionJson (): SymbolOption {
  const symbolOption: SymbolOption = {
    pointSymbol: featureUtils.getDefaultSymbol('point') as any,
    polylineSymbol: featureUtils.getDefaultSymbol('polyline') as any,
    polygonSymbol: featureUtils.getDefaultSymbol('polygon') as any
  }

  return symbolOption
}

export function getDefaultShowOnMapConfig (): ShowOnMapConfig {
  const symbolOption = getDefaultSymbolOptionJson()
  const showOnMapConfig: ShowOnMapConfig = {
    isUseCustomSymbol: true,
    symbolOption,
    isOperationalLayer: true
  }

  return showOnMapConfig
}

export function getUniqueTitleCountInfo (dataSet: DataRecordSet, activeViewId: string, showOnMapDatas: ShowOnMapDatas): TitleCountInfo {
  const intl = i18n.getIntl()
  const rawTitle = dataSet.label || dataSet.name || intl.formatMessage({ id: 'showOnMapData', defaultMessage: defaultMessages.showOnMapData })

  // #16798, If Query widget sends data action with same data source and data records multiple times, we will create multiple layers with same title.
  // To avoid this case, we need to make name unique.
  const existingTitleCounts: number[] = []
  Object.values(showOnMapDatas).forEach((showOnMap: ShowOnMapData) => {
    const titleCountInfo = showOnMap.titleCountInfo

    // showOnMap.type === ActionType.DataAction
    if (showOnMap.jimuMapViewId === activeViewId && titleCountInfo && titleCountInfo.rawTitle === rawTitle && titleCountInfo.count >= 0) {
      existingTitleCounts.push(titleCountInfo.count)
    }
  })

  let titleCountInfo: TitleCountInfo = null

  if (existingTitleCounts.length > 0) {
    const maxCount = Math.max(...existingTitleCounts)
    const count = maxCount + 1
    const finalTitle = `${rawTitle} ${maxCount + 1}`

    titleCountInfo = {
      rawTitle,
      finalTitle,
      count
    }
  } else {
    const count = 1
    const finalTitle = rawTitle

    titleCountInfo = {
      rawTitle,
      finalTitle,
      count
    }
  }

  return titleCountInfo
}
