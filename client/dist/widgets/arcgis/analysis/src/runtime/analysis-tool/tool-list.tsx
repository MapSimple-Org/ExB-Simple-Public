/** @jsx jsx */
import { React, jsx, type Immutable, css } from 'jimu-core'
import { RightOutlined } from 'jimu-icons/outlined/directional/right'
import { TreeItemActionType, TreeStyle } from 'jimu-ui/basic/list-tree'
import type { ToolConfig } from '../../config'
import { getToolIcon, useGetDisplayedToolName } from '../../utils/util'
import AnalysisList from '../components/list'

interface Props {
  toolList: Immutable.ImmutableArray<ToolConfig>
  backFromToolId: string
  onSelect: (toolId: string) => void
}

const style = css`
  padding: 1rem;
  .jimu-tree-item__title {
    margin-left: 0.25rem;
    line-height: 1.375rem;
  }
  .jimu-tree-item {
    margin-bottom: 0.25rem;
  }
  .jimu-tree-item__body {
    padding: 0.3125rem 0.5rem;
    color: var(--sys-color-surface-paper-text);
    cursor: pointer;
    .open-detail-icon {
      color: var(--sys-color-surface-paper-text);
      cursor: pointer;
    }
  }
`

const ToolList = (props: Props) => {
  const { toolList, backFromToolId, onSelect } = props

  const getDisplayedToolName = useGetDisplayedToolName()

  return <AnalysisList
    className='tool-list' listData={toolList} autoFocusItemId={backFromToolId}
    css={style}
    itemsJson={toolList.asMutable().map((tool) => {
      const toolName = getDisplayedToolName(tool)
      return {
        itemKey: tool.id,
        itemStateIcon: { icon: getToolIcon(tool.toolName, tool.type, tool.analysisEngine) },
        itemStateTitle: toolName
      }
    })}
    size='default'
    treeStyle={TreeStyle.Card}
    overrideItemBlockInfo={({ itemBlockInfo }) => {
      return {
        name: TreeItemActionType.RenderOverrideItem,
        children: [{
          name: TreeItemActionType.RenderOverrideItemBody,
          children: [{
            name: TreeItemActionType.RenderOverrideItemIcon
          }, {
            name: TreeItemActionType.RenderOverrideItemTitle
          }, {
            name: TreeItemActionType.RenderOverrideItemMainLine
          }]
        }]
      }
    }}
    renderOverrideItemMainLine={() => {
      return <RightOutlined className='open-detail-icon flip-icon' />
    }}
    onClickItemBody={(actionData, refComponent) => {
      const { itemJsons } = refComponent.props
      const currentItemJson = itemJsons[0]
      const toolId = currentItemJson.itemKey
      onSelect(toolId)
    }}
  />
}

export default ToolList
