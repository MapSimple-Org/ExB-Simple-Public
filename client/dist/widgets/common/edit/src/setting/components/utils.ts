import type { JimuLayerView } from 'jimu-arcgis'
import { SUPPORTED_JIMU_LAYER_TYPES } from '../../utils'
import { JSAPILayerTypes } from 'jimu-core'
import { TreeItemActionType } from 'jimu-ui/basic/list-tree'

export function isSupportedJimuLayerView (jimuLayerView: JimuLayerView): boolean {
  if (!jimuLayerView || !jimuLayerView.type) {
    return false
  }
  const viewType = jimuLayerView.layer.type
  // Some BuildingComponentSublayer doesn't have layer view, so need to check jimuLayerView.view here.
  const isViewPass = viewType !== JSAPILayerTypes.BuildingComponentSublayer || jimuLayerView.view
  const isSupported = SUPPORTED_JIMU_LAYER_TYPES.includes(viewType)
  const hasUrl = !!jimuLayerView.layer?.url
  return isViewPass && isSupported && hasUrl
}

export const overrideItemBlockInfo = ({ itemBlockInfo }, refComponent) => {
  return {
    name: TreeItemActionType.RenderOverrideItem,
    children: [{
      name: TreeItemActionType.RenderOverrideItemDroppableContainer,
      children: [{
        name: TreeItemActionType.RenderOverrideItemDraggableContainer,
        children: [{
          name: TreeItemActionType.RenderOverrideItemBody,
          children: [{
            name: TreeItemActionType.RenderOverrideItemMainLine,
            children: [{
              name: TreeItemActionType.RenderOverrideItemDragHandle
            }, {
              name: TreeItemActionType.RenderOverrideItemIcon,
              autoCollapsed: true
            }, {
              name: TreeItemActionType.RenderOverrideItemTitle
            }, {
              name: TreeItemActionType.RenderOverrideItemDetailToggle
            }, {
              name: TreeItemActionType.RenderOverrideItemCommands
            }]
          }]
        }]
      }]
    }]
  }
}