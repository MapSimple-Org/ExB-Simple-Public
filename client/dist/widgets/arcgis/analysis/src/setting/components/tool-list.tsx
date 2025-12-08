/** @jsx jsx */
import { React, jsx, css, type ImmutableArray, type ImmutableObject, hooks, type IMState, ReactRedux } from 'jimu-core'
import { Button, defaultMessages as jimuiDefaultMessages, Tooltip } from 'jimu-ui'
import { List, TreeItemActionType, type TreeItemType, type TreeItemsType } from 'jimu-ui/basic/list-tree'
import { ToolType, type HistoryItemWithDs, type ToolConfig, type CustomToolConfig } from '../../config'
import defaultMessages from '../translations/default'
import { getToolIcon, useGetDisplayedToolName } from '../../utils/util'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { customToolHasUnsupportedParameterType, usePreviousLength, useWidgetHelpLink } from '../utils'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'

const { useState } = React

const listStyle = css`
  .jimu-tree-item__body {
    padding: 0.4375rem 0.5rem 0.4375rem 0;
    color: var(--ref-palette-neutral-1100);
  }
  .jimu-tree-item__title {
    margin-left: 0.25rem;
    line-height: 1.125rem;
  }
  .jimu-tree-item_template .jimu-tree-item__icon {
    padding: 0 !important;
  }
  .button-container .button {
    color: var(--ref-palette-neutral-1100);
  }
  .count-button {
    padding: 0 0.375rem;
    border-radius: 0.5625rem;
  }
`

interface Props {
  editId?: string
  toolList: ImmutableArray<ToolConfig>
  historyListFromMap: HistoryItemWithDs[]
  onSort: (toolList: Array<ImmutableObject<ToolConfig>>) => void
  onDelete: (toolId: string) => void
  onOpenEdit: (toolId: string) => void
  onTriggerRefChange: (ref: HTMLDivElement) => void
}

const StandardAnalysisToolSelector = (props: Props): React.ReactElement => {
  const { editId, toolList, historyListFromMap, onSort, onDelete, onOpenEdit, onTriggerRefChange } = props
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)

  const [currentEditToolId, setCurrentEditToolId] = useState('')

  React.useEffect(() => {
    setCurrentEditToolId(editId)
  }, [editId])

  const getDisplayedToolName = useGetDisplayedToolName()

  const helpLink = useWidgetHelpLink()
  const prevToolListLength = usePreviousLength(toolList.length)

  const utilityStates = ReactRedux.useSelector((state: IMState) => {
    return state.appStateInBuilder.appRuntimeInfo?.utilityStates
  })

  return (
    <React.Fragment>
      <List
        css={listStyle}
        className='mt-2'
        itemsJson={toolList.asMutable().map((tool) => ({
          itemStateDetailContent: tool,
          itemKey: tool.id,
          itemStateIcon: { icon: getToolIcon(tool.toolName, tool.type, tool.analysisEngine) },
          itemStateTitle: getDisplayedToolName(tool),
          itemStateChecked: tool.id === currentEditToolId
        }))}
        dndEnabled
        onUpdateItem={(actionData, refComponent) => {
          if (actionData.updateType !== TreeItemActionType.HandleDidDrop) {
            return
          }
          const { itemJsons } = refComponent.props
          const [, parentItemJson] = itemJsons as [TreeItemType, TreeItemsType]
          const sortedToolList = parentItemJson.map(item => {
            return item.itemStateDetailContent as ImmutableObject<ToolConfig>
          })
          if (sortedToolList.map((tool) => tool.id).join(',') !== toolList.map((item) => item.id).join(',')) {
            onSort(sortedToolList)
          }
        }}
        overrideItemBlockInfo={({ itemBlockInfo }) => {
          return {
            name: TreeItemActionType.RenderOverrideItem,
            children: [{
              name: TreeItemActionType.RenderOverrideItemDroppableContainer,
              children: [{
                name: TreeItemActionType.RenderOverrideItemDraggableContainer,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemBody,
                  children: [{
                    name: TreeItemActionType.RenderOverrideItemDragHandle
                  }, {
                    name: TreeItemActionType.RenderOverrideItemIcon
                  }, {
                    name: TreeItemActionType.RenderOverrideItemTitle
                  }, {
                    name: TreeItemActionType.RenderOverrideItemMainLine
                  }]
                }]
              }]
            }]
          }
        }}
        renderOverrideItemMainLine={(actionData, refComponent) => {
          const { itemJsons } = refComponent.props
          const currentItemJson = itemJsons[0]
          const tool = currentItemJson.itemStateDetailContent as ImmutableObject<ToolConfig>
          const toolHistoryCountFromMap = historyListFromMap.filter((history) => history.toolId === tool.id).length
          const hasWarningIcon = tool.type === ToolType.Custom && customToolHasUnsupportedParameterType((tool.config as ImmutableObject<CustomToolConfig>).toolInfo)
          const utilityState = tool.type === ToolType.Custom ? utilityStates?.[(tool.config as ImmutableObject<CustomToolConfig>).utility?.utilityId] : null
          return <div className='button-container' ref={(ref) => {
            // if add a new tool, will open the tool setting side popper automatically without user operation,
            // so need to update the trigger element here for backToFocusNode of side popper
            if (toolList.length - prevToolListLength === 1) {
              const bodyElement = ref?.parentElement as HTMLDivElement
              const isLastTool = toolList[toolList.length - 1].id === tool.id
              if (bodyElement && isLastTool) {
                onTriggerRefChange(bodyElement)
              }
            }
          }}>
            {toolHistoryCountFromMap > 0 && <Tooltip placement='top' title={translate('toolHistoryCount', { count: toolHistoryCountFromMap })}>
              <Button className='border-0 count-button' size='sm' type='primary' >
                {toolHistoryCountFromMap}
              </Button>
            </Tooltip>}
            {utilityState?.success && hasWarningIcon && <Tooltip placement='bottom' showArrow interactive
              css={css`width: 14.375rem; padding: 0.5rem 0.625rem 0.375rem 0.5rem;`}
              title={<span>
                {translate('customToolHasUnsupportedParameterType')}
                &nbsp;<a href={helpLink} target='_blank' rel='noopener noreferrer'>{translate('seeDetails')}</a>
              </span>}>
              <Button className='border-0 count-button' size='sm' type='tertiary' icon >
                <WarningOutlined color='var(--sys-color-warning-dark)' />
              </Button>
            </Tooltip>}
            {tool.type === ToolType.Custom && !utilityState?.success && <Tooltip placement='bottom' showArrow interactive title={translate(utilityState?.isSignInError ? 'signInErrorDefault' : 'utilityNotAvailable')}>
              <Button className='border-0 count-button' size='sm' type='tertiary' icon >
                <WarningOutlined color='var(--sys-color-warning-dark)' />
              </Button>
            </Tooltip>}
            <Button
              className='p-0 border-0 ml-2' size='sm' type='tertiary' icon aria-label={translate('deleteOption')}
              onKeyDown={(e) => { e.stopPropagation() }}
              onClick={ (e) => { e.stopPropagation(); onDelete(tool.id) }}>
              <CloseOutlined size={12} />
            </Button>
          </div>
        }}
        handleClickItemBody={(actionData, refComponent) => {
          const { itemJsons } = refComponent.props
          const currentItemJson = itemJsons[0]

          const utilityInaccessible = currentItemJson.itemStateDisabled
          if (utilityInaccessible) {
            return
          }

          const tool = currentItemJson.itemStateDetailContent as ImmutableObject<ToolConfig>

          setCurrentEditToolId(tool.id)
          onOpenEdit(tool.id)
          const bodyElement = refComponent.dragRef.current.children?.[0] as HTMLDivElement
          onTriggerRefChange(bodyElement)
        }}
      />

    </React.Fragment>
  )
}

export default StandardAnalysisToolSelector
