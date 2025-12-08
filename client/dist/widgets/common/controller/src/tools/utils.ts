import {
  type IMLayoutJson, type ImmutableObject, type LayoutItemJson, type WidgetsJson, getAppStore
} from 'jimu-core'
import type { TreeDropItemActionDataType, UpdateTreeActionDataType, TreeItemType, TreeItemsType, TreeCheckDropItemActionDataType } from 'jimu-ui/basic/list-tree'
import { getVisibleOrderFromLayout, getWidgetChildLayoutJson } from '../runtime/common/layout-utils'
import { BASE_LAYOUT_NAME } from '../common/consts'
import { getWidgetItem, groupWidgetsInAccordion, insertWidgetToLayout, removeLayoutItem } from '../runtime/builder/utils'


const getTreeItemLabel = (widgetsJson: ImmutableObject<WidgetsJson>, layoutId: string, layoutItem: ImmutableObject<LayoutItemJson>) => {
  return widgetsJson[layoutItem.widgetId]?.label
}

const getTreeItemKey = (layoutId: string, layoutItem: ImmutableObject<LayoutItemJson>) => {
  // Pass widgetId,layoutId,layoutItemId as itemKey
  return `${layoutItem.widgetId || ''},${layoutId},${layoutItem.id}`
}

export const getWidgetTreeJson = (controllerId: string, controllerLayout: IMLayoutJson) => {
  const state = getAppStore().getState().appStateInBuilder || getAppStore().getState()
  if (!controllerLayout || !state) return
  const widgetsJson = state.appConfig.widgets
  const layoutItemMap = controllerLayout?.content
  const order = getVisibleOrderFromLayout(controllerLayout)
  const layoutItems = order.map(layoutItemId => layoutItemMap[layoutItemId])
  const itemsJson = layoutItems.map(layoutItem => {
    const widgetId = layoutItem.widgetId
    const widgetJson = widgetsJson[widgetId]
    let itemChildren: TreeItemsType
    if (widgetJson?.manifest?.name === 'accordion') {
      const accordionLayout = getWidgetChildLayoutJson(widgetId, 'DEFAULT')
      const order = getVisibleOrderFromLayout(accordionLayout)
      const layoutItemsInAccordion = order.map(layoutItemId => accordionLayout.content?.[layoutItemId])
      itemChildren = layoutItemsInAccordion.map(accordionLayoutItem => {
        return {
          itemKey: getTreeItemKey(accordionLayout.id, accordionLayoutItem),
          itemStateTitle: getTreeItemLabel(widgetsJson, accordionLayout.id, accordionLayoutItem)
        }
      }).filter(v => !!v.itemStateTitle)
    }
    return {
      itemKey: getTreeItemKey(controllerLayout.id, layoutItem),
      itemStateTitle: getTreeItemLabel(widgetsJson, controllerLayout.id, layoutItem),
      itemChildren,
      itemStateExpanded: !!itemChildren
    }
  }).filter(v => !!v.itemStateTitle)
  return { itemKey: controllerId, itemChildren: itemsJson }
}

export const isWidgetDroppable = (actionData: TreeCheckDropItemActionDataType) => {
  const { draggingItemJsons, targetItemJsons, dropType } = actionData
  const state = getAppStore().getState().appStateInBuilder || getAppStore().getState()
  if (!state) return false
  const widgetsJson = state.appConfig.widgets
  const [sourceWidgetId] = draggingItemJsons[0].itemKey.split(',')
  const sourceWidgetJson = widgetsJson[sourceWidgetId]
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [targetParentWidgetId] = targetItemJsons?.[1]?.itemKey?.split?.(',')
  const targetParentWidgetJson = widgetsJson[targetParentWidgetId]
  if (dropType === 'to-inside' && (
    // A group should not be dragged into existed groups or other widgets to create a group
    sourceWidgetJson?.manifest?.name === 'accordion' ||
    // A widget in a group should not be a dragging target to create group
    targetParentWidgetJson?.manifest?.name === 'accordion'
  )) {
    return false
  } else if (['to-top', 'to-bottom'].includes(dropType) &&
    // A group should not be dragged into an existed group
    sourceWidgetJson?.manifest?.name === 'accordion' &&
    targetParentWidgetJson?.manifest?.name === 'accordion'
  ) {
    return false
  } else {
    return true
  }
}

export const sortWidgetInTree = (controllerId: string, actionData: UpdateTreeActionDataType & TreeDropItemActionDataType) => {
  const { dragItemJsons, dragItemIndex, itemJsons, dropType, targetDropItemIndex } = actionData
  const state = getAppStore().getState().appStateInBuilder || getAppStore().getState()
  if (!state) return
  const widgetsJson = state.appConfig.widgets
  const controllerLayout = getWidgetChildLayoutJson(controllerId, BASE_LAYOUT_NAME)
  // Extract layoutId and layoutItemId from itemKey
  const [sourceWidgetId, sourceLayoutId, sourceLayoutItemId] = dragItemJsons[0].itemKey.split(',')
  const sourceLayoutInfo = { layoutId: sourceLayoutId, layoutItemId: sourceLayoutItemId }
  const sourceWidgetJson = widgetsJson[sourceWidgetId]
  const [targetWidgetId, targetlayoutId, targetLayoutItemId] = itemJsons[0].itemKey.split(',')
  const targetLayoutInfo = { layoutId: targetlayoutId, layoutItemId: targetLayoutItemId }
  const targetWidgetJson = widgetsJson[targetWidgetId]
  const sourceItem = getWidgetItem(sourceWidgetJson, sourceLayoutInfo)
  const targetItem = getWidgetItem(targetWidgetJson, targetLayoutInfo)
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [sourceParentWidgetId] = dragItemJsons?.[1]?.itemKey?.split?.(',')
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [targetParentWidgetId] = itemJsons?.[1]?.itemKey?.split?.(',')
  const targetParentWidgetJson = widgetsJson[targetParentWidgetId]
  if (dropType === 'to-inside' && sourceItem && targetItem) {
    const targetIndex = itemJsons?.[1]?.itemChildren.map(item => item.itemKey).indexOf(itemJsons?.[0].itemKey) ?? 0
    if (targetItem.manifest.name === 'accordion') {
      // Drag into an existed accordion
      const accordionLayout = getWidgetChildLayoutJson(targetWidgetId, 'DEFAULT')
      insertWidgetToLayout(accordionLayout, sourceItem, targetIndex)
    } else if (targetItem.manifest.name !== 'accordion') {
      // Drag to create a new accordion
      const isSameLevel = sourceParentWidgetId === targetParentWidgetId
      groupWidgetsInAccordion(controllerLayout, sourceItem, dragItemIndex, targetItem, targetIndex, isSameLevel)
    }
  } else if (['to-top', 'to-bottom'].includes(dropType) && sourceItem) {
    let targetLayout = controllerLayout
    if (targetParentWidgetJson?.manifest?.name === 'accordion') {
      targetLayout = getWidgetChildLayoutJson(targetParentWidgetId, 'DEFAULT')
    }
    insertWidgetToLayout(targetLayout, sourceItem, targetDropItemIndex)
  }
}

export const removeWidgetInTree = (controllerId: string, item: TreeItemType) => {
  const [, layoutId, layoutItemId] = item.itemKey.split(',')
  const layoutInfo = { layoutId, layoutItemId }
  removeLayoutItem(layoutInfo, controllerId)
}
