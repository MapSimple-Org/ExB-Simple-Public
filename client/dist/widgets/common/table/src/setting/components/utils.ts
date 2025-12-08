import { TreeItemActionType } from 'jimu-ui/basic/list-tree'
import type { IMUseDataSource } from 'jimu-core'

export const advancedActionMap = {
  overrideItemBlockInfo: ({ itemBlockInfo }, refComponent) => {
    return {
      name: TreeItemActionType.RenderOverrideItem,
      children: [{
        name: TreeItemActionType.RenderOverrideItemDroppableContainer,
        children: [{
          name: TreeItemActionType.RenderOverrideItemContent,
          children: [{
            name: TreeItemActionType.RenderOverrideItemBody,
            children: [{
              name: TreeItemActionType.RenderOverrideItemMainLine,
              children: [{
                name: TreeItemActionType.RenderOverrideItemDraggableContainer,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemDragHandle
                }, {
                  name: TreeItemActionType.RenderOverrideItemChildrenToggle
                }, {
                  name: TreeItemActionType.RenderOverrideItemIcon
                }, {
                  name: TreeItemActionType.RenderOverrideItemTitle
                }, {
                  name: TreeItemActionType.RenderOverrideItemDetailToggle
                }, {
                  name: TreeItemActionType.RenderOverrideItemCommands
                }]
              }]
            }, {
              name: TreeItemActionType.RenderOverrideItemDetailLine
            }]
          }]
        }]
      }]
    }
  }
}

export const getDsCapabilities = (capabilities: string, capType: string) => {
  if (capabilities) {
    return Array.isArray(capabilities)
      ? capabilities?.join().toLowerCase().includes(capType)
      : capabilities?.toLowerCase().includes(capType)
  } else {
    return false
  }
}

export const mergeOneUseDataSource = (u1: IMUseDataSource, u2: IMUseDataSource): IMUseDataSource => {
  if (!u1 || !u2) {
    return u1 || u2
  }

  if (u1.dataSourceId && u2.dataSourceId && u1.dataSourceId !== u2.dataSourceId) {
    return null
  }

  if (!u1.dataSourceId && !u2.dataSourceId) {
    return u1
  }

  if (u1.fields && u2.fields) {
    const fields = Array.from(new Set(u1.fields.asMutable().concat(u2.fields.asMutable())))
    return u1.merge(u2.asMutable({ deep: true })).set('fields', fields)
  } else {
    return u1.merge(u2.asMutable({ deep: true }))
  }
}
