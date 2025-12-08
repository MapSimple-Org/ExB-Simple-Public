
import type { BrowserSizeMode, ImmutableArray, UseDataSource, ImmutableObject } from 'jimu-core'
import { expressionUtils, dynamicStyleUtils, Immutable } from 'jimu-core'
import { utils as uiUtils, type LinearUnit, DistanceUnits } from 'jimu-ui'
import { Status, SCROLL_BAR_WIDTH, type IMConfig, type ElementSize, type ElementSizeUnit, type CardConfig } from '../../config'
import { getJimuFieldNamesBySqlExpression } from 'jimu-ui/basic/sql-expression-runtime'

interface GetCardSizeUnitPropsType {
  config: IMConfig
  builderStatus: Status
  browserSizeMode: BrowserSizeMode
}

export function getCardSizeUnit(props: GetCardSizeUnitPropsType): ElementSizeUnit {
    const { config, builderStatus, browserSizeMode } = props
    let cardConfigs = config.cardConfigs[builderStatus]
    if (!cardConfigs || !cardConfigs.cardSize) {
      cardConfigs = config.cardConfigs[Status.Default]
    }
    let cardSize = cardConfigs.cardSize[browserSizeMode]
    if (!cardSize) {
      cardSize = cardConfigs.cardSize[Object.keys(cardConfigs.cardSize)[0]]
    }
    return {
      width: uiUtils.toLinearUnit(cardSize.width),
      height: uiUtils.toLinearUnit(cardSize.height)
    }
  }

export function getListActualContentPxWidth(horizontalSpace: number, widgetRect: ElementSize): number {
  return (widgetRect?.width + horizontalSpace - SCROLL_BAR_WIDTH) || 0
}

interface CheckIsDistanceUnitsChangeOption {
  config: IMConfig
  builderStatus: Status
  browserSizeMode: BrowserSizeMode
  valueInt: LinearUnit
  isHeight: boolean
}
export function checkIsDistanceUnitsChange(options: CheckIsDistanceUnitsChangeOption): boolean {
  const { valueInt, isHeight, config, builderStatus, browserSizeMode } = options
  const oldCardSizeUnit = getCardSizeUnit({config, builderStatus, browserSizeMode})
  const size = isHeight ? oldCardSizeUnit?.height : oldCardSizeUnit?.width
  if (valueInt.unit === size.unit) {
    return false
  } else if (!size.unit && valueInt.unit === DistanceUnits.PIXEL) {
    return false
  } else {
    return true
  }
}

interface CardPxWidthFormCardSizeType {
  config: IMConfig
  builderStatus: Status
  browserSizeMode: BrowserSizeMode
  widgetRect: ElementSize
}

export function getCardPxWidthFormCardSize(option: CardPxWidthFormCardSizeType): number {
  const { config, builderStatus, browserSizeMode, widgetRect } = option
  const cardSize = getCardSizeUnit({ config, builderStatus, browserSizeMode })
  if (cardSize.width.unit === DistanceUnits.PERCENTAGE) {
    const listContentWidth = getListActualContentPxWidth(config?.horizontalSpace, widgetRect)
    //The space in the last column should be removed
    return cardSize.width.distance * listContentWidth / 100 - config?.horizontalSpace
  } else {
    return cardSize.width.distance
  }
}

export function getNewUseDatasourcesByWidgetConfig (config: IMConfig, useDataSources: ImmutableArray<UseDataSource>): UseDataSource[] {
  if (!useDataSources || useDataSources.length === 0 || !config) return []
  const useDS = useDataSources[0].asMutable({ deep: true })
  useDS.fields = getAllUsedFieldsOfTools(config, useDataSources)
  return getUseDsWithDynamicStyle(config, [useDS])
}

export function getAllUsedFieldsOfTools(config: IMConfig, useDataSources: ImmutableArray<UseDataSource>): string[] {
  const useDS = useDataSources && useDataSources[0]
  if (!useDS) return []

  const usedFields = {}
  if (config?.sortOpen && config?.sorts) {
    config.sorts.forEach(sort => {
      sort.rule.forEach(sortData => {
        sortData.jimuFieldName && (usedFields[sortData.jimuFieldName] = 0)
      })
    })
  }

  if (config?.filter) {
    ;(getJimuFieldNamesBySqlExpression(config.filter) || []).forEach(
      field => (usedFields[field] = 0)
    )
  }

  if (config?.searchOpen && config.searchFields) {
    ;(config.searchFields || []).forEach(
      fieldName => (usedFields[fieldName] = 0)
    )
  }

  if (config?.linkParam?.expression) {
    const linkSettingDss = expressionUtils.generateFieldsForUseDataSourcesByExpressionParts(
      config.linkParam.expression?.parts,
      useDataSources
    )
    linkSettingDss?.[0]?.fields?.forEach(field => (usedFields[field] = 0))
  }
  return (usedFields && Object.keys(usedFields)) || []
}

function getUseDsWithDynamicStyle (config: IMConfig, useDataSources: UseDataSource[]): UseDataSource[] {
  const dynamicStyleUseDataSources = getDynamicStyleUseDataSources(config?.cardConfigs, useDataSources)
  return mergeUseDataSourcesByDss(dynamicStyleUseDataSources, useDataSources)
}

export function mergeUseDataSourcesByDss(dynamicStyleUseDataSources: Array<ImmutableArray<UseDataSource>>, useDataSources: UseDataSource[]): UseDataSource[] {
  let mergedUseDss = useDataSources
  if (dynamicStyleUseDataSources && dynamicStyleUseDataSources.length > 0) {
    mergedUseDss = dynamicStyleUseDataSources.reduce((acc, cur) => {
      return expressionUtils.mergeUseDataSources(Immutable(acc), cur) as any
    }, mergedUseDss)
  }
  return mergedUseDss
}

export function getDynamicStyleUseDataSources (cardConfigs: ImmutableObject<CardConfig>, useDataSources: UseDataSource[]): Array<ImmutableArray<UseDataSource>> {
  const dynamicUseDataSources: Array<ImmutableArray<UseDataSource>> = []
  if (!useDataSources || useDataSources.length === 0) {
    return dynamicUseDataSources
  }
  Object.keys(cardConfigs).forEach((status) => {
    const cardConfig = cardConfigs[status]
    if (cardConfig?.dynamicStyleConfig) {
      dynamicUseDataSources.push(dynamicStyleUtils.generateFieldsForUseDataSourcesByDynamicStyle(cardConfig?.dynamicStyleConfig, Immutable(useDataSources)))
    }
  })
  return dynamicUseDataSources
}
