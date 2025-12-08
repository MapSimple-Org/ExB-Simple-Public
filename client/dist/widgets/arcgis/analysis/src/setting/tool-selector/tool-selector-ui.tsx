/** @jsx jsx */
import { React, jsx, hooks, css, type ImmutableArray } from 'jimu-core'
import { CollapsablePanel, defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { SidePopper } from 'jimu-ui/advanced/setting-components'
import { List, TreeItemActionType, TreeStyle } from 'jimu-ui/basic/list-tree'
import { getToolIcon, getToolTypeByAnalysisType } from '../../utils/util'
import { type ToolConfig, ToolType } from '../../config'
import type { AnalysisEngine, AnalysisToolItem } from '@arcgis/analysis-ui-schema'
import StandardToolSearch from './standard-tool-search'
import ToolSelectorButton from './tool-selector-button'

const style = css`
  margin-bottom: 0.75rem;
`

const popperStyle = css`
  .setting-collapse {
    line-height: 1.9375rem;
  }
  .jimu-tree {
    padding: 0.5rem 0;
    overflow-y: visible !important;
  }
  .jimu-tree-item [data-dndzone-droppable=true] {
    border: none !important;
  }
  .jimu-tree-item.jimu-tree-item_disabled-true .jimu-tree-item__body {
    opacity: 0.7;
    cursor: not-allowed;
    pointer-events: none;
  }
  .jimu-tree-item__body {
    padding: 0.5rem 0.5rem 0.5rem 0.375rem;
    cursor: pointer;
  }
  .jimu-tree-item_template {
    padding-top: 0.5rem !important;
    &:first-of-type {
      padding-top: 0 !important;
    }
  }
  .jimu-tree-item__main-line {
    cursor: pointer;
  }
`
interface Props {
  disabled?: boolean
  buttonDisabled?: boolean
  buttonDisabledWarningText?: React.ReactNode
  buttonTitle: string
  sidePopperTitle: string
  toolsArray: AnalysisToolItem[]
  categories: string[]
  toolList: ImmutableArray<ToolConfig>
  icon: string
  onSelectTool: (toolName: string, analysisEngine: AnalysisEngine) => void
  onDisabledStateClick: () => void
}

const ToolSelectorUI = (props: Props): React.ReactElement => {
  const { disabled, buttonDisabled, buttonDisabledWarningText, buttonTitle, sidePopperTitle, toolsArray, categories, toolList, icon, onSelectTool, onDisabledStateClick } = props
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessage)
  const [openPopper, setOpenPopper] = React.useState(false)

  const selectButtonRef = React.useRef<HTMLButtonElement>(null)

  const onAddToolButtonClick = () => {
    if (disabled) {
      onDisabledStateClick()
      return
    }
    setOpenPopper(v => !v)
  }

  const disableTool = (toolName: string, analysisEngine: AnalysisEngine) => {
    return !!toolList?.find((tool) => tool.type !== ToolType.Custom && tool.toolName === toolName && tool.analysisEngine === analysisEngine)
  }

  const [toolItems, setToolItems] = React.useState<AnalysisToolItem[]>([])

  const toolsClassified = React.useMemo(() => {
    if (!toolsArray?.length) {
      return []
    }
    return categories.map((c) => {
      const tools = toolsArray.filter((t) => t.categoryName === c)
      return {
        categoryName: c,
        categoryTitle: tools[0]?.categoryTitle || c,
        tools
      }
    })
  }, [categories, toolsArray])

  const [searchIsActive, setSearchIsActive] = React.useState(false)
  const handleSearchUpdate = (tools: AnalysisToolItem[], searchValue: string) => {
    setSearchIsActive(searchValue?.length > 0)
    setToolItems(tools)
  }
  React.useEffect(() => {
    if (!openPopper && searchIsActive) {
      setSearchIsActive(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPopper])

  const renderToolList = (list: AnalysisToolItem[]) => {
    return list?.length
      ? <List
        itemsJson={list.map((tool) => {
          return {
            itemKey: tool.toolName,
            itemStateDisabled: disableTool(tool.toolName, tool.analysisEngine),
            itemStateIcon: { icon: getToolIcon(tool.toolName, getToolTypeByAnalysisType(tool.analysisType), tool.analysisEngine) },
            itemStateTitle: tool.title,
            itemStateDetailContent: tool
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
              }]
            }]
          }
        }}
        onClickItemBody={(actionData, refComponent) => {
          const { itemJsons } = refComponent.props
          const currentItemJson = itemJsons[0]
          const toolInfo = currentItemJson.itemStateDetailContent as AnalysisToolItem
          if (disableTool(toolInfo.toolName, toolInfo.analysisEngine)) {
            return
          }
          onSelectTool(toolInfo.toolName, toolInfo.analysisEngine)
          setOpenPopper(false)
        }}
      />
      : <div className='tool-list-placeholder d-flex justify-content-center align-items-center'>
        <div className='ml-2'>{translate('noResultsFound')}</div>
      </div>
  }

  return (
    <div className="analysis-tool-selector w-100" css={style}>
      <ToolSelectorButton
        iconSvg={icon}
        text={buttonTitle}
        ref={selectButtonRef}
        type='primary'
        disabled={buttonDisabled}
        disabledWarningText={buttonDisabledWarningText}
        className='w-100'
        css={css`font-size: 0.875rem`}
        onClick={onAddToolButtonClick}
      />
      <SidePopper css={popperStyle} isOpen={openPopper} position="right" toggle={() => { setOpenPopper(false) }} trigger={selectButtonRef?.current} backToFocusNode={selectButtonRef?.current} title={sidePopperTitle}>
        <StandardToolSearch toolsArray={toolsArray} onSearchUpdate={handleSearchUpdate} />
        <div className='px-4 pb-4'>
          {searchIsActive && renderToolList(toolItems)}
          {!searchIsActive && toolsClassified.map((item) => {
            const { categoryName, categoryTitle, tools } = item
            if (!tools?.length) {
              return null
            }
            return (
              <CollapsablePanel className='mb-1' key={categoryName} label={categoryTitle} type="default" defaultIsOpen={false} aria-label={categoryTitle}>
                {renderToolList(tools)}
              </CollapsablePanel>
            )
          })}
        </div>
      </SidePopper>
    </div>
  )
}

export default ToolSelectorUI
