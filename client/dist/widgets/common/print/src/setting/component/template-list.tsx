/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import { List, type TreeItemType, type TreeItemsType, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import { type IMConfig, PrintTemplateType, PrintServiceType, type PrintTemplateProperties } from '../../config'
import TemplateListEditItem from './template-list-edit-item'

const STYLE = css`
  .report-remind-alert {
    .jimu-icon-component {
      color: var(--sys-color-warning-main) !important;
    }
    &.jimu-btn {
      padding: 0 !important;
    }
  }
`
interface SearchOptionsProps {
  id: string
  showNewTemplateItem: boolean
  activeTemplateId: string
  config: IMConfig
  className?: string
  handelActiveTemplateIdChange?: (templateId: string, index?: number) => void
  handelTemplateListChange?: (newTemplate: PrintTemplateProperties[]) => void
  hideSidePopper?: () => void
}

const TemplateList = (props: SearchOptionsProps) => {
  const { className, config, activeTemplateId, showNewTemplateItem, handelActiveTemplateIdChange, handelTemplateListChange } = props

  const AdvancedActionMap = {
    overrideItemBlockInfo: ({ itemBlockInfo }, refComponent) => {
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
  }

  React.useEffect(() => {
    setIsTemplateEditable(config?.printTemplateType === PrintTemplateType.Customize || config?.printServiceType === PrintServiceType.Customize)
    getTemplateList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  const [isTemplateEditable, setIsTemplateEditable] = React.useState(config?.printTemplateType === PrintTemplateType.Customize || config?.printServiceType === PrintServiceType.Customize)
  const [templateList, setTemplateList] = React.useState([] as PrintTemplateProperties[])

  const getTemplateList = () => {
    if (config?.printServiceType === PrintServiceType.Customize || config?.printTemplateType === PrintTemplateType.Customize) {
      setTemplateList(config?.printCustomTemplate?.asMutable({ deep: true }) || [])
    } else {
      setTemplateList(config?.printOrgTemplate?.asMutable({ deep: true }) || [])
    }
  }

  return (
    <div className={`w-100 mt-2 ${className || ''}`} css={STYLE}>
      <List
        className='w-100'
        itemsJson={Array.from(templateList).map((item, index) => ({
          itemStateDetailContent: item,
          itemKey: item?.templateId,
          itemStateChecked: activeTemplateId && item?.templateId === activeTemplateId,
          itemStateTitle: item?.label,
          itemStateIcon: null,
          itemStateCommands: []
        }))}
        dndEnabled={isTemplateEditable}
        renderOverrideItemDetailToggle={(actionData, refComponent) => {
          const { itemJsons } = refComponent.props
          const [currentItemJson] = itemJsons
          const itemStateDetailContent = currentItemJson?.itemStateDetailContent
          const activeTemplateId = currentItemJson?.itemKey
          return <TemplateListEditItem
            activeTemplateId={activeTemplateId}
            itemStateDetailContent={itemStateDetailContent}
            templateList={templateList}
            config={config}
            handelActiveTemplateIdChange={handelActiveTemplateIdChange}
            handelTemplateListChange={handelTemplateListChange}
          />
        } }
        onUpdateItem={(actionData, refComponent) => {
          const { itemJsons } = refComponent.props
          const [, parentItemJson] = itemJsons as [TreeItemType, TreeItemsType]
          if (actionData.updateType === TreeItemActionType.HandleDidDrop) {
            const newTemplate = parentItemJson.map(item => {
              return item.itemStateDetailContent
            })
            handelActiveTemplateIdChange(null)
            handelTemplateListChange(newTemplate)
          }
        }}
        onClickItemBody={(actionData, refComponent) => {
          const { itemJsons } = refComponent.props
          const currentItemJson = itemJsons[0]
          const listItemJsons = itemJsons[1] as any
          handelActiveTemplateIdChange(currentItemJson.itemKey, listItemJsons.indexOf(currentItemJson))
        }}
        {...AdvancedActionMap}
      />

      {showNewTemplateItem && <List
        className='setting-ui-unit-list-new'
        itemsJson={[{
          name: '......'
        }].map((item, x) => ({
          itemStateDetailContent: 'item',
          itemKey: 'index',
          itemStateChecked: true,
          itemStateTitle: '......',
          itemStateCommands: []
        }))}
        dndEnabled={false}
        renderOverrideItemDetailToggle={() => '' }
        {...AdvancedActionMap}
      />}
    </div>
  )
}

export default TemplateList
