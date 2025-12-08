import {
  LayoutItemType, type LayoutItemConstructorProps, type IMLayoutJson, type LayoutInfo,
  getAppStore, appActions, type ImmutableObject, type LayoutJson, WidgetType, type IMWidgetJson,
  i18n, type BrowserSizeMode, LayoutParentType, AppMode, LayoutType, type IMAppConfig
} from 'jimu-core'
import { LayoutItemSizeModes, searchUtils, utils } from 'jimu-layouts/layout-runtime'
import { type AppConfigAction, appConfigUtils, builderAppSync, getAppConfigAction } from 'jimu-for-builder'
import { BASE_LAYOUT_NAME } from '../../common/consts'
import type { IMConfig } from '../../config'
import type { Config as AccordionConfig } from 'widgets/layout/accordion/src/config'
import accordionStyle from './accordion-style'

export const getIsInController = (widgetId: string) => {
  const { appConfig, browserSizeMode } = getAppStore().getState().appStateInBuilder || getAppStore().getState()
  const parentWidgetId = searchUtils.getParentWidgetIdOfContent(appConfig, widgetId, LayoutItemType.Widget, browserSizeMode)
  const isInController = appConfig.widgets[parentWidgetId]?.manifest?.name === 'controller'
  return isInController
}

export const getIsItemAccepted = (controllerId: string) => {
  const isInController = getIsInController(controllerId)
  if (isInController) {
    return (item: LayoutItemConstructorProps): boolean =>
      item?.manifest?.name !== 'controller' && isLayoutItemAcceptedForController(item)
  }
  return isLayoutItemAcceptedForController
}

const isLayoutItemAcceptedForController = (item: LayoutItemConstructorProps): boolean => {
  const itemType = item?.itemType
  const name = item?.manifest?.name
  if (itemType === LayoutItemType.Section || ['navigator', 'divider', 'menu'].includes(name)) {
    return false
  }
  const state = getAppStore().getState()
  const appState = state.appStateInBuilder ? state.appStateInBuilder : state
  const isExpressMode = appState.appRuntimeInfo.appMode === AppMode.Express
  const widgetType = item?.manifest?.widgetType
  if (isExpressMode && (['arcgis-map', 'controller'].includes(name) || widgetType === WidgetType.Layout)) {
    return false
  }
  if (utils.isWidgetPlaceholder(utils.getAppConfig(), item)) {
    return false
  }
  return true
}

export const widgetStatePropChange = (controllerId: string, propKey: string, value: any) => {
  if (window.jimuConfig.isBuilder) {
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: controllerId, propKey, value })
  } else {
    getAppStore().dispatch(appActions.widgetStatePropChange(controllerId, propKey, value))
  }
}

export const widgetToolbarStateChange = (controllerId: string, toolNames: string[]) => {
  if (window.jimuConfig.isBuilder) {
    builderAppSync.publishWidgetToolbarStateChangeToApp(controllerId, toolNames)
  } else {
    getAppStore().dispatch(appActions.widgetToolbarStateChange(controllerId, toolNames))
  }
}

export const calInsertPositionForColumn = (boundingRect: Partial<DOMRectReadOnly>,
  childRects: Array<Partial<DOMRectReadOnly> & { id: string }>,
  clientY: number): { insertY: number, refId: string } => {
  let result, refId
  let found = false
  childRects.some((rect, i) => {
    const rectY = rect.top + rect.height / 2
    if (rectY > clientY) {
      if (i === 0) { // insert before the first item
        result = rect.top
      } else { // insert between this and previous one
        const previousItem = childRects[i - 1]
        result = (rect.top + previousItem.top + previousItem.height) / 2
      }
      found = true
      refId = rect.id
    }
    return found
  })
  if (!found) { // insert after the last one
    const lastItem = childRects[childRects.length - 1]
    result = lastItem.top + lastItem.height
  }
  return {
    insertY: result,
    refId
  }
}

export const calInsertPositionForRow = (boundingRect: Partial<DOMRectReadOnly>,
  childRects: Array<Partial<DOMRectReadOnly> & { id: string }>,
  clientX: number): { insertX: number, refId: string } => {
  let result, refId
  let found = false
  childRects.some((rect, i) => {
    const rectX = rect.left + rect.width / 2
    if (rectX > clientX) {
      if (i === 0) { // insert before the first item
        result = rect.left
      } else { // insert between this and previous one
        const previousItem = childRects[i - 1]
        result = (rect.left + previousItem.left + previousItem.width) / 2
      }
      found = true
      refId = rect.id
    }
    return found
  })
  if (!found) { // insert after the last one
    const lastItem = childRects[childRects.length - 1]
    result = lastItem.left + lastItem.width
  }
  return {
    insertX: result,
    refId
  }
}

export const insertWidgetToLayout = async (
  layout: IMLayoutJson,
  itemProps: LayoutItemConstructorProps,
  insertIndex: number
) => {
  const appConfigAction = getAppConfigAction()
  const layoutInfo = await insertWidgetToLayoutAction(appConfigAction, layout, itemProps, insertIndex)
  if (layout.type === LayoutType.AccordionLayout) {
    const accordionWidgetId = layout.parent.id
    updateAccordionConfigAction(appConfigAction, accordionWidgetId, [layoutInfo])
  }
  appConfigAction.exec()
  return layoutInfo
}

export const insertWidgetToLayoutAction = async (
  appConfigAction: AppConfigAction,
  layout: IMLayoutJson,
  item: LayoutItemConstructorProps,
  insertIndex: number
) => {
  const layoutInfo = item.layoutInfo
  let newLayoutInfo: LayoutInfo
  if (layoutInfo && layoutInfo.layoutId && layoutInfo.layoutItemId) {
    const appState = getAppStore().getState().appStateInBuilder || getAppStore().getState()
    if (!appState) return
    const currentSizeMode = appState.browserSizeMode
    let fromSizeMode: BrowserSizeMode
    if (item.isFromCurrentSizeMode) {
      fromSizeMode = currentSizeMode
    } else {
      fromSizeMode = appConfigUtils.getSizeModeOfALayout(appConfigAction.appConfig, item.layoutInfo.layoutId)
    }
    newLayoutInfo = appConfigAction.moveLayoutItem(item.layoutInfo, layout.id, fromSizeMode, currentSizeMode)
  } else if (item.uri) {
    const layoutItemId = await appConfigAction.addNewWidgetToLayout(layout.id, { uri: item.uri, itemId: item.itemId }, true)
    newLayoutInfo = { layoutId: layout.id, layoutItemId }
  }
  appConfigAction.adjustOrderOfItem(newLayoutInfo, insertIndex || 0, true)
  appConfigAction.editLayoutItemProperty(newLayoutInfo, 'bbox', {}, true)
  appConfigAction.editLayoutItemProperty(newLayoutInfo, 'setting', {}, true)
  return newLayoutInfo
}

export const applyChangeToOtherSizeModes = (appConfigAction: AppConfigAction, controllerId: string, otherSizeMode: BrowserSizeMode) => {
  const appConfig = appConfigAction.appConfig
  let sizeModeLayoutJson = appConfig.widgets[controllerId]?.layouts?.[BASE_LAYOUT_NAME]
  const otherLayoutId = sizeModeLayoutJson?.[otherSizeMode]
  if (otherLayoutId) {
    appConfigAction.removeSizeModeLayout(otherLayoutId, otherSizeMode)
    sizeModeLayoutJson = sizeModeLayoutJson.without(otherSizeMode)
    appConfigAction.editWidgetProperty(controllerId, `layouts.${BASE_LAYOUT_NAME}`, sizeModeLayoutJson)
  }
  const mainSizeMode = appConfig.mainSizeMode
  appConfigAction.createLayoutForSizeMode(
    otherSizeMode,
    mainSizeMode,
    sizeModeLayoutJson,
    LayoutParentType.Widget,
    controllerId,
    BASE_LAYOUT_NAME
  )
}

export const removeLayoutItem = (layoutInfo: LayoutInfo, controllerId?: string) => {
  const appConfigAction = getAppConfigAction()
  appConfigAction.removeLayoutItem(layoutInfo, true, true)
  const { layoutId, layoutItemId } = layoutInfo
  if (controllerId) {
    const config = appConfigAction.appConfig.widgets[controllerId]?.config as IMConfig
    const widgetId = appConfigAction.appConfig.layouts[layoutId]?.content?.[layoutItemId]?.widgetId
    if (Array.isArray(config?.behavior?.openStarts) && config.behavior.openStarts.includes(widgetId)) {
      const newConfig = config.setIn(['behavior', 'openStarts'], config.behavior.openStarts.filter(id => id !== widgetId))
      appConfigAction.editWidgetConfig(controllerId, newConfig)
    }
  }
  appConfigAction.exec()
  const state = getAppStore().getState().appStateInBuilder || getAppStore().getState()
  if (!state) return
  const selection = state.appRuntimeInfo.selection
  if (!selection || (selection?.layoutId === layoutInfo.layoutId && selection?.layoutItemId === layoutInfo.layoutItemId)) {
    const controllerLayoutInfo = state.appConfig.widgets[controllerId]?.parent?.[state.browserSizeMode]?.[0]
    getAppStore().dispatch(appActions.selectionChanged(controllerLayoutInfo))
  }
}

export const getWidgetItem = (widgetJson: IMWidgetJson, layoutInfo: LayoutInfo) => {
  if (!widgetJson || !layoutInfo) return null
  const widgetItem: LayoutItemConstructorProps = {
    id: widgetJson.id,
    layoutInfo: layoutInfo,
    itemType: LayoutItemType.Widget,
    manifest: widgetJson.manifest?.asMutable({ deep: true }),
    icon: typeof widgetJson.icon === 'string' ? widgetJson.icon : widgetJson.icon?.asMutable({ deep: true }),
    label: widgetJson.label
  }
  return widgetItem
}

export const groupWidgetsInAccordionAction = async (
  appConfigAction: AppConfigAction,
  controllerLayout: ImmutableObject<LayoutJson>,
  sourceItem: LayoutItemConstructorProps,
  targetItem: LayoutItemConstructorProps,
  insertIndex: number
) => {
  // Add a new Accorion widget to the target's place
  const acccordionItem = {
    name: 'accordion',
    label: 'Group',
    uri: 'widgets/layout/accordion/',
    icon: null,
    itemType: LayoutItemType.Widget,
    manifest: {
      widgetType: WidgetType.Layout,
      properties: {}
    }
  } as LayoutItemConstructorProps
  const accordionLayoutInfo = await insertWidgetToLayoutAction(appConfigAction, controllerLayout, acccordionItem, insertIndex)
  const accordionWidgetId = appConfigAction.appConfig.layouts[controllerLayout.id]?.content?.[accordionLayoutInfo.layoutItemId]?.widgetId
  const groupLabels = getGroupLabels(appConfigAction.appConfig, controllerLayout)
  const intl = i18n.getIntl()
  const groupString = intl ? intl.formatMessage({ id: 'groupLabel', defaultMessage: 'Group' }) : 'Group'
  appConfigAction.editWidgetProperty(accordionWidgetId, 'label', getNextGroupLabel(groupLabels, groupString))
  appConfigAction.adjustOrderOfItem(accordionLayoutInfo, insertIndex, true)
  // Move the target and the source into the accordion
  const appState = getAppStore().getState().appStateInBuilder || getAppStore().getState()
  if (!appState) return
  const browserSizeMode = appState.browserSizeMode
  const accordionLayoutId = appConfigAction.appConfig.widgets?.[accordionWidgetId]?.layouts?.DEFAULT?.[browserSizeMode]
  const accordionLayout = appConfigAction.appConfig.layouts[accordionLayoutId]
  const targetLayoutInfo = await insertWidgetToLayoutAction(appConfigAction, accordionLayout, targetItem, 0)
  const sourceLayoutInfo = await insertWidgetToLayoutAction(appConfigAction, accordionLayout, sourceItem, 1)
  updateAccordionConfigAction(appConfigAction, accordionWidgetId, [targetLayoutInfo, sourceLayoutInfo])
}

export const groupWidgetsInAccordion = async (
  controllerLayout: ImmutableObject<LayoutJson>,
  sourceItem: LayoutItemConstructorProps,
  sourceIndex: number,
  targetItem: LayoutItemConstructorProps,
  targetIndex: number,
  sameLevel: boolean = true
) => {
  const appConfigAction = getAppConfigAction()
  const insertIndex = sameLevel && sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
  await groupWidgetsInAccordionAction(appConfigAction, controllerLayout, sourceItem, targetItem, insertIndex)
  appConfigAction.exec()
  const groupedWidgetIds = sourceItem.id ? [sourceItem.id, targetItem.id] : [targetItem.id]
  getAppStore().dispatch(appActions.closeWidgets(groupedWidgetIds))
  const state = getAppStore().getState().appStateInBuilder || getAppStore().getState()
  if (!state) return
  const selection = state.appRuntimeInfo.selection
  if (
    !selection ||
    (selection?.layoutId === controllerLayout.id &&
    [sourceItem.layoutInfo?.layoutItemId, targetItem.layoutInfo?.layoutItemId].includes(selection?.layoutItemId))
  ) {
    const controllerId = controllerLayout.parent?.id
    const controllerLayoutInfo = state.appConfig.widgets[controllerId]?.parent?.[state.browserSizeMode]?.[0]
    getAppStore().dispatch(appActions.selectionChanged(controllerLayoutInfo))
  }
}

export function getGroupLabels (appConfig: IMAppConfig, controllerLayout: IMLayoutJson) {
  const widgetIds = Object.values(controllerLayout?.content || {}).map(layoutItemJson => layoutItemJson.widgetId)
  const widgets = appConfig?.widgets
  const groupWidgets = Object.values(widgets || {}).filter(w => widgetIds.includes(w.id) && w.uri === 'widgets/layout/accordion/')
  const groupLabels = groupWidgets.map(g => g.label)
  return groupLabels
}

export function getNextGroupLabel (groupLabels: string[], groupString: string = 'Group') {
  const groupRegExp = new RegExp(`${groupString}\x20[0-9]+`)
  const groupLabelsWithNumber = groupLabels.filter(label => groupRegExp.test(label))
  const numberRegExp = /\d+/
  const numbers = groupLabelsWithNumber.map(label => parseInt(numberRegExp.exec(label)?.[0]))
  const maxNumber = numbers.sort((a, b) => b - a)[0] || 0
  return `${groupString} ${maxNumber + 1}`
}

function updateAccordionConfigAction (
  appConfigAction: AppConfigAction,
  accordionWidgetId: string,
  layoutInfos: LayoutInfo[]
) {
  const appConfig = appConfigAction.appConfig
  const accordionConfig = (appConfig.widgets[accordionWidgetId].config?.asMutable?.({ deep: true }) || {}) as AccordionConfig
  let updatedAccordionConfig = accordionConfig
  // Use the plain style
  if (accordionConfig.useQuickStyle !== 3) {
    updatedAccordionConfig = accordionStyle
  }
  const expandedItems = accordionConfig.expandedItems || []
  const widgetIds: string[] = []
  // Adjust height for newly added widgets
  for (const layoutInfo of layoutInfos) {
    const { layoutId, layoutItemId } = layoutInfo
    const widgetId = appConfig.layouts[layoutId]?.content?.[layoutItemId]?.widgetId
    const widgetJson = appConfig.widgets[widgetId]
    if (widgetId) widgetIds.push(widgetId)
    if (widgetJson.manifest.properties?.supportAutoSize) {
      appConfigAction.editLayoutItemProperty(layoutInfo, 'setting.autoProps.height', LayoutItemSizeModes.Auto, true)
    } else if (widgetJson.manifest.defaultSize?.height) {
      appConfigAction.editLayoutItemProperty(layoutInfo, 'bbox', { height: widgetJson.manifest.defaultSize.height + 'px' }, true)
    } else {
      appConfigAction.editLayoutItemProperty(layoutInfo, 'bbox', { height: 300 + 'px' }, true)
    }
  }
  // Make sure widgets inside are expanded by default
  updatedAccordionConfig.expandedItems = expandedItems.concat(widgetIds)
  appConfigAction.editWidgetConfig(accordionWidgetId, updatedAccordionConfig)
}
