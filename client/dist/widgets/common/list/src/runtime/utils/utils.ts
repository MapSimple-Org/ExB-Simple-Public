import { Status, PageStyle, DS_TOOL_H, BOTTOM_TOOL_H, SelectionModeType, ListLayoutType, LIST_CARD_MIN_SIZE, SCROLL_BAR_WIDTH } from '../../config'
import type { ElementSize, ElementSizeUnit, CardSize, SortSettingOption, IMCardBackgroundStyle, IMConfig } from '../../config'
import { getAppStore, Immutable, AppMode, PageMode, LayoutType, LayoutItemType } from 'jimu-core'
import type { UseDataSource, IMThemeVariables, LayoutItemConstructorProps, BrowserSizeMode, DataSource, RepeatedDataSource, BoundingBox, QueriableDataSource, IMState, AllWidgetProps, IMDynamicStyle } from 'jimu-core'
import { type LinearUnit, type BackgroundStyle, DistanceUnits, styleUtils, utils as jimuUtils } from 'jimu-ui'
import type { AppConfigAction } from 'jimu-for-builder'
import { LayoutItemSizeModes, searchUtils } from 'jimu-layouts/layout-runtime'
import { getThemeModule, mapping } from 'jimu-theme'

export function hasScrollToStartItem (
  listDiv: HTMLDivElement,
  lastScrollOffset: number
): boolean {
  if (!listDiv) return true
  const scrollTop = lastScrollOffset
  const isStart = scrollTop < 2
  return isStart
}

export function isEqualCardSizeByListLayout (
  cardSize1: ElementSize,
  cardSize2: ElementSize,
  layoutType: ListLayoutType
): boolean {
  if (layoutType === ListLayoutType.Column) {
    return isEqualNumber(cardSize1.width, cardSize2.width)
  } else if (layoutType === ListLayoutType.Row) {
    return isEqualNumber(cardSize1.height, cardSize2.height)
  } else {
    return isEqualNumber(cardSize1.width, cardSize2.width) && isEqualNumber(cardSize1.height, cardSize2.height)
  }
}

export function isEqualNumber (num1: number, num2: number): boolean {
  if (Math.abs(num1 - num2) < 0.0001) {
    return true
  } else {
    return false
  }
}
export function checkIsLastPage (ds: QueriableDataSource, page: number, pageSize: number, recordsLength: number) {
  if (!page || !pageSize || !ds) return false
  const haveMorePages = ds?.haveMorePages(page, pageSize)
  const isLastPage = !haveMorePages
  let isCurrentPageLastPage = false
  if (haveMorePages === 'unknown') {
    const count = ds?.count
    isCurrentPageLastPage = recordsLength >= count
  } else {
    isCurrentPageLastPage = isLastPage
  }
  return isCurrentPageLastPage
}

export function getCardSizeNumberInConfig (config: IMConfig, builderStatus: Status, browserSizeMode: BrowserSizeMode, widgetRect: ElementSize): ElementSize {
  const cardSizeInConfig = getCardSizeConfig(config, builderStatus, browserSizeMode)
  const widthLinearUnit = jimuUtils.toLinearUnit(cardSizeInConfig.width)
  let width = initCardSize(jimuUtils.toLinearUnit(cardSizeInConfig.width), widgetRect.width + config.horizontalSpace - SCROLL_BAR_WIDTH)
  //The width in percentage includes space, the width in px does not include
  if (widthLinearUnit.unit === DistanceUnits.PERCENTAGE) {
    width = (width - config.horizontalSpace) > 0 ? width - config.horizontalSpace : LIST_CARD_MIN_SIZE
  }

  let height = initCardSize(jimuUtils.toLinearUnit(cardSizeInConfig.height), widgetRect.height)
  if (config.keepAspectRatio && config?.layoutType === ListLayoutType.GRID && config?.gridItemSizeRatio) {
    height = width * config?.gridItemSizeRatio
  }
  const cardSize = {
    width: width,
    height: height
  }
  return cardSize
}

export function getCardSizeConfig (config: IMConfig, builderStatus: Status, browserSizeMode: BrowserSizeMode): CardSize {
  let cardConfigs = config?.asMutable({ deep: true }).cardConfigs[builderStatus]
  if (!cardConfigs || !cardConfigs.cardSize) {
    cardConfigs = config?.asMutable({ deep: true }).cardConfigs[Status.Default]
  }
  let cardSizeInConfig = cardConfigs?.cardSize?.[browserSizeMode]
  if (!cardSizeInConfig) {
    cardSizeInConfig = cardConfigs.cardSize[Object.keys(cardConfigs.cardSize)[0]]
  }
  return cardSizeInConfig
}

export function getDefaultMinListSize (config: IMConfig, builderStatus: Status, browserSizeMode: BrowserSizeMode): ElementSize {
  const cardSizeInConfig = getCardSizeConfig(config, builderStatus, browserSizeMode)
  const listMinSize = {
    width: LIST_CARD_MIN_SIZE,
    height: LIST_CARD_MIN_SIZE
  }
  const cardSizeUnit = {
    width: jimuUtils.toLinearUnit(cardSizeInConfig.width),
    height: jimuUtils.toLinearUnit(cardSizeInConfig.height)
  }
  if (cardSizeUnit.width.unit === DistanceUnits.PERCENTAGE) {
    listMinSize.width = (LIST_CARD_MIN_SIZE + 30) / cardSizeUnit.width.distance * 100
  }
  if (cardSizeUnit.height.unit === DistanceUnits.PERCENTAGE) {
    listMinSize.height = (LIST_CARD_MIN_SIZE + 30) / cardSizeUnit.height.distance * 100
  }
  return listMinSize
}

export function getCardSizeWidthUnitInConfig (config: IMConfig, builderStatus: Status, browserSizeMode: BrowserSizeMode): ElementSizeUnit {
  const cardSizeInConfig = getCardSizeConfig(config, builderStatus, browserSizeMode)
  const width = jimuUtils.toLinearUnit(cardSizeInConfig.width)

  if (width.unit === DistanceUnits.PERCENTAGE) {
    width.distance = (width.distance - config.horizontalSpace) > 0 ? width.distance - config.horizontalSpace : LIST_CARD_MIN_SIZE
  }

  const cardSizeWidthUnit = {
    width: width,
    height: jimuUtils.toLinearUnit(cardSizeInConfig.height)
  }
  return cardSizeWidthUnit
}

export function initCardSize (sizeUnit: LinearUnit, widgetSize: number): number {
  if (sizeUnit.unit === DistanceUnits.PERCENTAGE) {
    return (sizeUnit.distance / 100) * widgetSize
  } else {
    return sizeUnit.distance
  }
}

interface GetPageSizeOption {
  widgetRect: ElementSize
  listHeight: number
  columnCount: number
  config: IMConfig
  isHeightAuto: boolean
  isWidthAuto: boolean
  builderStatus: Status
  browserSizeMode: BrowserSizeMode
}

export function getPageSize (
  option: GetPageSizeOption
): number {
  const { widgetRect, columnCount, config, isHeightAuto, isWidthAuto, builderStatus, browserSizeMode } = option
  let { listHeight } = option
  const cardSize = getCardSizeNumberInConfig(config, builderStatus, browserSizeMode, widgetRect)
  let pageSize
  if (config.pageStyle === PageStyle.Scroll) {
    if (!widgetRect) {
      return 0
    }
    switch (config?.layoutType) {
      case ListLayoutType.Row:
        if (widgetRect.height === 0) return 0
        if (isHeightAuto) {
          listHeight = document.body.scrollHeight
        }
        pageSize = Math.ceil((listHeight + config.space) / (cardSize.height + config.space)) + 1
        break
      case ListLayoutType.Column:
        if (widgetRect.width === 0) return 0
        let listWidth = widgetRect.width
        if (isWidthAuto) {
          listWidth = document.body.scrollWidth
        }
        pageSize = Math.ceil((listWidth + config.space) / (cardSize.width + config.space)) + 1
        break
      case ListLayoutType.GRID:
        if (widgetRect.height === 0) return 0
        if (isHeightAuto) {
          listHeight = document.body.scrollHeight
        }
        pageSize = Math.ceil((listHeight + config?.verticalSpace) / (cardSize.height + config.space)) * columnCount
        break
    }
    if (config.navigatorOpen) {
      pageSize = Math.max(pageSize, config.scrollStep)
    }
  } else {
    pageSize = config.itemsPerPage
  }
  return pageSize
}

export function getBottomToolH (
  paginatorDiv: HTMLDivElement,
  showBottomTools: boolean
): number {
  let bottomToolH = BOTTOM_TOOL_H
  if (paginatorDiv) {
    bottomToolH = paginatorDiv.clientHeight
  }
  bottomToolH = showBottomTools ? bottomToolH : 0
  return bottomToolH
}

export function getListHeight (
  widgetRect,
  bottomToolH: number,
  showTopTool: boolean
): number {
  const dsToolH = showTopTool ? DS_TOOL_H : 0
  if (!widgetRect) return 0
  const height = widgetRect.height - dsToolH - bottomToolH
  return height < 0 ? 0 : height
}

export function showBottomTools (config: IMConfig, dataSource: DataSource): boolean {
  return (!!dataSource && !(config.pageStyle === PageStyle.Scroll && !config.navigatorOpen))
}

export function showTopTools (id: string, config: IMConfig, useDataSources: UseDataSource[]): boolean {
  return (
    checkIsShowListToolsOnly(config) || checkIsShowDataAction(id, config, useDataSources)
  )
}

export function checkIsShowListToolsOnly (config: IMConfig): boolean {
  return (
    showSort(config) ||
    showDisplaySelectedOnly(config) ||
    showClearSelected(config) ||
    showFilter(config) ||
    showSearch(config) ||
    config?.showRefresh
  )
}

export function isDsConfigured (useDataSources: UseDataSource[]): boolean {
  return !!useDataSources && !!useDataSources[0]
}

export function checkIsShowDataAction (id: string, config: IMConfig, useDataSources: UseDataSource[]): boolean {
  const appConfig = getAppStore()?.getState()?.appConfig
  const widgetJson = appConfig?.widgets?.[id]
  const enableDataAction = widgetJson?.enableDataAction === undefined ? true : widgetJson?.enableDataAction
  return enableDataAction && isDsConfigured(useDataSources) && config.isItemStyleConfirm
}

export function showSort (config: IMConfig): boolean {
  if (!config.sortOpen || !config.sorts || config.sorts.length < 1) return false
  const sorts = config.sorts
  let isValid = false
  sorts.some((sort: SortSettingOption) => {
    sort.rule &&
      sort.rule.some(sortData => {
        if (sortData && !!sortData.jimuFieldName) {
          isValid = true
        }
        return isValid
      })
    return isValid
  })
  return isValid
}

export function showSearch (config: IMConfig): boolean {
  return config.searchOpen && !!config.searchFields
}

export function showFilter (config: IMConfig): boolean {
  return config.filterOpen && !!config.filter
}

export function showDisplaySelectedOnly (config: IMConfig): boolean {
  return (
    config.showSelectedOnlyOpen &&
    config.cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None
  )
}

export function showClearSelected (config: IMConfig): boolean {
  return (
    config.showClearSelected &&
    config.cardConfigs[Status.Selected].selectionMode !== SelectionModeType.None
  )
}

export function intersectionObserver (
  ref: HTMLElement,
  rootElement: HTMLElement,
  onChange?: (isIn: boolean) => void,
  options?: IntersectionObserverInit
) {
  const option: any = options || { root: rootElement }
  const callback = function (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) {
    onChange(entries[0].isIntersecting)
  }
  const observer = new IntersectionObserver(callback, option)
  observer.observe(ref)
  return observer
}

export function initBackgroundStyle (cardBackgroundStyle: IMCardBackgroundStyle, dynamicStyleOfCard?: IMDynamicStyle, theme?: IMThemeVariables) {
  if (dynamicStyleOfCard?.background) {
    //Mixin background with dynamic style
    const background = cardBackgroundStyle?.background?.asMutable({deep: true}) || {} as BackgroundStyle
    const backgroundOfDynamicStyle = dynamicStyleOfCard?.background?.asMutable({deep: true}) || {} as BackgroundStyle
    backgroundOfDynamicStyle?.color && (background.color = backgroundOfDynamicStyle?.color)
    backgroundOfDynamicStyle?.fillType && (background.fillType = backgroundOfDynamicStyle?.fillType)
    backgroundOfDynamicStyle?.image && (background.image = backgroundOfDynamicStyle?.image)
    cardBackgroundStyle = cardBackgroundStyle.set('background', background)
  }

  const DEFAULT_TEXT_COLOR = 'var(--sys-color-surface-paper-text)'
  if (!cardBackgroundStyle?.textColor) {
    cardBackgroundStyle = cardBackgroundStyle.set('textColor', DEFAULT_TEXT_COLOR)
  }

  if (dynamicStyleOfCard?.borderRadius) {
    const borderRadius = styleUtils.mixinBorderRadiusWithDynamicStyle(dynamicStyleOfCard?.borderRadius?.asMutable({deep: true}), cardBackgroundStyle?.borderRadius?.asMutable({deep: true}))
    cardBackgroundStyle = cardBackgroundStyle.set('borderRadius', borderRadius)
  }

  if (checkIsNoBorderRadius(cardBackgroundStyle)) {
    const defaultBorderRadius = getDefaultBorderRadius(theme)
    cardBackgroundStyle = cardBackgroundStyle.set('borderRadius', defaultBorderRadius)
  }

  if (dynamicStyleOfCard?.border) {
    const borderOfCardBackgroundStyle = (cardBackgroundStyle?.border as any)?.color ? {border:  cardBackgroundStyle?.border?.asMutable({deep: true})} : cardBackgroundStyle?.border?.asMutable({deep: true})
    const newBorder = styleUtils.mixinBorderWithDynamicStyle(dynamicStyleOfCard?.border?.asMutable({deep: true}) as any, borderOfCardBackgroundStyle as any)
    cardBackgroundStyle = Immutable({
      ...cardBackgroundStyle,
      ...newBorder
    }) as any
  }

  if (cardBackgroundStyle?.border) {
    const DEFAULT_BORDER_COLOR = 'var(--sys-color-divider-secondary)'
    const borderType = ['border', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom']
    if (Object.keys(cardBackgroundStyle?.border).some(item => borderType.includes(item))) {
      cardBackgroundStyle = Immutable({
        ...cardBackgroundStyle,
        ...cardBackgroundStyle.border
      }) as any
    }

    if (Object.keys(cardBackgroundStyle).some(item => borderType.includes(item))) {
      Object.keys(cardBackgroundStyle)?.forEach(key => {
        if (borderType.includes(key) ) {
          const borderItem = cardBackgroundStyle[key]
          if (!borderItem?.color) {
            cardBackgroundStyle = cardBackgroundStyle.setIn([key, 'color'], DEFAULT_BORDER_COLOR)
          }
        }
      })
    }
  }
  return cardBackgroundStyle
}

function checkIsNoBorderRadius (cardBackgroundStyle: IMCardBackgroundStyle): boolean {
  const borderRadius = cardBackgroundStyle?.borderRadius
  if (!borderRadius) {
     return true
  } else {
    const number = borderRadius?.number
    return !number?.some(num => num || num === 0)
  }
}

export function getDefaultBorderRadius(theme: IMThemeVariables) {
  const themeModule = getThemeModule(theme?.uri)
  const isNewTheme = mapping.whetherIsNewTheme(themeModule)
  const shape2 = theme.sys.shape?.shape2
  const shape2Size = isNewTheme ? shape2?.split('px')[0] : 0
  return {number: [shape2Size, shape2Size, shape2Size, shape2Size], unit: 'px'}
}

export function isItemAccept (
  item: LayoutItemConstructorProps,
  isPlaceholder: boolean,
  isEditing: boolean,
  widgetId: string,
  builderSupportModules: any
): boolean {
  if (!item) return false
  const supportRepeat = item.manifest?.properties?.supportRepeat
  const action: AppConfigAction = builderSupportModules.jimuForBuilderLib.getAppConfigAction()
  const appConfig = action.appConfig
  const selectionInList = builderSupportModules.widgetModules.selectionInList
  return (
    isEditing &&
    supportRepeat &&
    (!item.layoutInfo ||
      (item.layoutInfo &&
        selectionInList(item.layoutInfo, widgetId, appConfig, false)))
  )
}

export const checkIsEditing = (appMode: AppMode, config: IMConfig, selectionIsSelf: boolean, selectionIsInSelf: boolean): boolean => {
  // const { appMode, config, selectionIsSelf, selectionIsInSelf } = this.props
  if (!window.jimuConfig.isInBuilder) return false
  const notRunTimeMode = appMode === AppMode.Design
  const haveBeenSelection = selectionIsSelf || selectionIsInSelf
  return (haveBeenSelection && window.jimuConfig.isInBuilder && notRunTimeMode && config.isItemStyleConfirm)
}

interface GetListMaxSizeOptionType {
  boundingBox: BoundingBox
  heightLayoutItemSizeModes: LayoutItemSizeModes
  layoutId: string
  appMode: AppMode
  pageMode: PageMode
  browserSizeMode: BrowserSizeMode
}

export const getListMaxSize = (option: GetListMaxSizeOptionType) => {
  const { boundingBox, heightLayoutItemSizeModes, layoutId, appMode, pageMode, browserSizeMode } = option
  const bodySize = getBodySize()
  const isListHeightCustom = heightLayoutItemSizeModes === LayoutItemSizeModes.Custom && boundingBox?.height
  const setting = getContentLayoutSetting(layoutId, browserSizeMode)
  const isContentWidthAuto =
    setting?.autoProps?.width?.toLowerCase() === 'auto' || setting?.widthMode?.toLowerCase() === 'auto'
  const isContentHeightAuto =
    (setting?.autoProps?.height?.toLowerCase && setting?.autoProps?.height?.toLowerCase() === 'auto') || setting?.heightMode?.toLowerCase() === 'auto' || !setting
  // const isUse600 = (pageMode === PageMode.AutoScroll && (isContentHeightAuto || !setting?.autoProps?.width))
  const DESIGN_SIZE = (pageMode === PageMode.AutoScroll && isContentHeightAuto) ? 600 : bodySize.clientHeight
  const bodyHeight = appMode === AppMode.Design ? DESIGN_SIZE : bodySize.clientHeight
  const maxHeight = isListHeightCustom ? boundingBox?.height : bodyHeight
  const isListHeightCustomUnitPX = isListHeightCustom && !(boundingBox?.height?.includes && boundingBox?.height?.includes('%'))
  let maxSize = Immutable({
    maxWidth: bodySize.scrollWidth,
    maxHeight: maxHeight,
    maxSizeIsBodySize: false
  })
  const appConfig = getAppStore().getState().appConfig
  const { layouts } = appConfig
  const type = layouts[layoutId]?.type
  if (type === LayoutType.ColumnLayout && isContentWidthAuto) {
    maxSize = maxSize.set('maxWidth', bodySize.clientWidth).set('maxSizeIsBodySize', true)
  }
  if ((type as any) === 'ROW' && isContentHeightAuto && !isListHeightCustomUnitPX) {
    const maxHeight = appMode === AppMode.Design ? DESIGN_SIZE : bodySize.clientHeight
    const maxSizeIsBodySize = appMode !== AppMode.Design
    maxSize = maxSize.set('maxHeight', maxHeight).set('maxSizeIsBodySize', maxSizeIsBodySize)
  }
  maxSize = maxSize.set('maxHeight', initElementSize(maxSize.maxHeight))
  maxSize = maxSize.set('maxWidth', initElementSize(maxSize.maxWidth))
  return maxSize
}

export function getTotalPage(totalCount: number, itemsPerPage: number): number {
  const total = totalCount
  const totalPage = Math.floor(total / itemsPerPage)
  const mode = total % itemsPerPage
  return mode === 0 ? totalPage : totalPage + 1
}

export function checkIsQueryCount(config: IMConfig) {
  if (config?.showRecordCount) {
    return config?.showRecordCount
  }
  if (config?.pageStyle === PageStyle.MultiPage) {
    return config?.hidePageTotal as any === false
  } else {
    return false
  }
}

interface GetSizeOfListWidgetOption {
  id: string
  config: IMConfig
  useDataSources: UseDataSource[]
  datasource: DataSource
  paginatorDiv: any
  widgetRect: ElementSize
}

export function getSizeOfListWidget(option: GetSizeOfListWidgetOption): ElementSize {
  const { id, config, useDataSources, datasource, paginatorDiv, widgetRect } = option
  const isShowTopTools = showTopTools(id, config, useDataSources)
  //get list tool`s show status
  const showBottomTool = showBottomTools(config, datasource)
  //get list bottom tool`s height
  const bottomToolH = getBottomToolH(paginatorDiv, showBottomTool)
  //get list size
  const listHeight = getListHeight(widgetRect, bottomToolH, isShowTopTools) || 1
  const listWidth = (widgetRect && widgetRect.width) || LIST_CARD_MIN_SIZE
  return {
    width: listWidth,
    height: listHeight
  }
}

export function getExtraStateProps(state: IMState , props: AllWidgetProps<IMConfig>) {
  const appConfig = state?.appConfig
  const { layouts, layoutId, layoutItemId, builderSupportModules, id } = props
  const browserSizeMode = state?.browserSizeMode
  const builderStatus = (state?.widgetsState?.[props.id]?.builderStatus) || Status.Default
  let subLayoutType
  if (appConfig) {
    const subLayout =
      appConfig &&
      state.appConfig.layouts &&
      state.appConfig.layouts[searchUtils.findLayoutId(Immutable(layouts[builderStatus]), browserSizeMode, appConfig.mainSizeMode)]
    subLayoutType = subLayout && subLayout.type
  }

  const layout = appConfig.layouts?.[layoutId]
  const layoutSetting = layout?.content?.[layoutItemId]?.setting
  const isHeightAuto = layoutSetting?.autoProps?.height === LayoutItemSizeModes.Auto || layoutSetting?.autoProps?.height === true
  const isWidthAuto = layoutSetting?.autoProps?.width === LayoutItemSizeModes.Auto || layoutSetting?.autoProps?.width === true

  let widgetPosition
  if (window.jimuConfig.isInBuilder) {
    const bbox = appConfig.layouts?.[layoutId]?.content?.[layoutItemId]?.bbox
    widgetPosition = bbox && {
      left: bbox.left,
      top: bbox.top
    }
  }

  const selection = state && state.appRuntimeInfo && state.appRuntimeInfo.selection
  const selectionIsInSelf = selection && builderSupportModules?.widgetModules?.selectionInList(selection, id, appConfig, false)
  let selectionStatus
  if (selectionIsInSelf) {
    selectionStatus = Object.keys(layouts).find(status => searchUtils.findLayoutId(Immutable(layouts[status]), browserSizeMode, appConfig.mainSizeMode) === selection.layoutId)
  }
  const selectionIsSelf = !!(
    selection &&
    selection.layoutId === layoutId &&
    selection.layoutItemId === layoutItemId
  )

  const currentPageId = state?.appRuntimeInfo?.currentPageId
  const pageMode = state?.appConfig?.pages?.[currentPageId]?.mode

  return {
    selectionIsSelf: selectionIsSelf,
    selectionIsInSelf: !!selectionIsInSelf,
    selectionStatus,
    appMode: state?.appRuntimeInfo?.appMode,
    browserSizeMode: state && state.browserSizeMode,
    builderStatus: state.widgetsState?.[props.id]?.builderStatus || Status.Default,
    showLoadingWhenConfirmSelectTemplate: state?.widgetsState?.[props.id]?.showLoading,//Show loading when confirm select template
    activeSort: state?.widgetsState?.[props.id]?.activeSort,
    isRTL: state && state.appContext && state.appContext.isRTL,
    subLayoutType,
    left: widgetPosition && widgetPosition.left,
    top: widgetPosition && widgetPosition.top,
    isHeightAuto,
    isWidthAuto,
    queryObject: state.queryObject,
    boundingBox: layout?.content?.[layoutItemId]?.bbox,
    heightLayoutItemSizeModes: layoutSetting?.autoProps?.height,
    parentSize: state.widgetsState[props.id]?.parentSize || null,
    pageMode: pageMode
  }
}

export function isProviderEqual (providerData: RepeatedDataSource, oldProviderData: RepeatedDataSource): boolean {
  let isEqual = true
  if (providerData) {
    Object.keys(providerData).some(key => {
      if (!oldProviderData) {
        isEqual = false
        return true
      }
      const data = providerData[key]
      const oldData = oldProviderData[key]
      if (data !== oldData) {
        isEqual = false
        return true
      }
      return false
    })
  } else if (oldProviderData) {
    return false
  }

  return isEqual
}

const getContentLayoutSetting = (layoutId: string, browserSizeMode: BrowserSizeMode) => {
  const appConfig = getAppStore().getState().appConfig
  const { layouts } = appConfig
  const contentLayoutsInfo = getContentLayout(layoutId, browserSizeMode)
  const contentLayoutId = contentLayoutsInfo?.[0]?.layoutId
  const contentLayoutItemId = contentLayoutsInfo?.[0]?.layoutItemId
  const setting = layouts?.[contentLayoutId]?.content?.[contentLayoutItemId]?.setting
  return setting
}

const initElementSize = (size) => {
  if (Number(size)) {
    return `${size}px`
  } else if (typeof (size) === 'string') {
    if (size?.includes('px') || size?.includes('rem')) {
      return size
    } else if (size?.includes('%')) {
      return '100%'
    }
  } else {
    return size
  }
}

const getContentLayout = (layoutId: string, browserSizeMode: BrowserSizeMode) => {
  const appConfig = getAppStore().getState().appConfig
  const contentWidgetId = searchUtils.getWidgetIdThatUseTheLayoutId(
    appConfig,
    layoutId
  )
  const contentLayoutsInfo = searchUtils.getContentLayoutInfosInOneSizeMode(
    appConfig,
    contentWidgetId,
    LayoutItemType.Widget,
    browserSizeMode
  )
  return contentLayoutsInfo
}

const getBodySize = () => {
  return {
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    clientWidth: document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight
  }
}
