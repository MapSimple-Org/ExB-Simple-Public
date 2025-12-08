import {
  React, Immutable, css, type IMFieldSchema, hooks
} from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { defaultMessages as jimuUIMessages, Checkbox, Button, TextArea, Label, Popper, Select } from 'jimu-ui'
import { FieldSelector, dataComponentsUtils } from 'jimu-ui/advanced/data-source-selector'
import {
  Tree, TreeCollapseStyle, TreeItemActionType, type TreeItemType, TreeAlignmentType, type TreeRenderOverrideItemDataType,
  type _TreeItem, type TreeCheckDropItemActionDataType, type UpdateTreeActionDataType
} from 'jimu-ui/basic/list-tree'
import { useTheme } from 'jimu-theme'
import { AddFolderOutlined } from 'jimu-icons/outlined/editor/add-folder'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { type TreeFields, LayerHonorModeType } from '../../config'
import defaultMessages from '../translations/default'
import { getDataSourceById, getEditHiddenFields } from '../../utils'
import type { LayerConfigProps } from './layer-config'

type LayerConfigFieldProps = Pick<LayerConfigProps, 'layerConfig' | 'onChange' | 'layerDefinition' | 'layerEditingEnabled'>

const TREE_ROOT_ITEM = 'root item for tree data entry'

const advancedActionMap = {
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
                  name: TreeItemActionType.RenderOverrideItemCommands
                }, {
                  name: TreeItemActionType.RenderOverrideItemDetailToggle
                }]
              }]
            }, {
              name: TreeItemActionType.RenderOverrideItemDetailLine
            }]
          }]
        }]
      }, {
        name: TreeItemActionType.RenderOverrideItemSubitems
      }]
    }
  }
}

const style = css`
  .fields-list-header {
    background: var(--ref-palette-neutral-300);
    border-bottom: 1px solid var(--ref-palette-neutral-600);
    height: 34px;
    width: 100%;
    flex-wrap: nowrap;
    .jimu-checkbox {
      margin-top: 2px;
    }
    .fields-list-check {
      margin-left: 18px;
    }
  }
  .selected-fields-con{
    margin-top: 0 !important;
    .selected-fields-list {
      flex: 1;
      max-height: 300px;
      overflow-y: auto;
    }
    .jimu-tree-item{
      background: var(--ref-palette-neutral-300);
      border-bottom: 1px solid var(--ref-palette-neutral-400);
      .jimu-tree-item__content{
        div:first-of-type{
          padding-left: 2px;
        }
        .jimu-tree-item__body{
          background: var(--ref-palette-neutral-300);
          .jimu-tree-item__title{
            .jimu-input{
              width: 125px;
            }
          }
          .item-remove-button {
            padding: 0 2px; /** consistent with detail icon from tree. */
          }
          &:hover {
            background: none !important;
          }
        }
      }
    }
  }
`

const detailStyle = css`
  &.jimu-tree-item__detail-toggle {
    display: flex;
    align-items: center;
    cursor: pointer;

    .icon-btn-sizer {
      margin: 0;
      min-width: 0.5rem;
      min-height: 0.5rem;
    }
  }
`

const LayerConfigField = (props: LayerConfigFieldProps) => {
  const { layerConfig, layerDefinition, layerEditingEnabled, onChange } = props
  const { useDataSource, showFields, groupedFields: imGroupedFields, layerHonorMode } = layerConfig
  const [rootItemJson, setRootItemJson] = React.useState<TreeItemType>(null)
  const [isOpenDetailPopper, setIsOpenDetailPopper] = React.useState(false)
  const [curEditField, setCurEditField] = React.useState<TreeFields>(null)
  const [groupUpdating, setGroupUpdating] = React.useState(false)

  const popperRef = React.useRef<HTMLElement>(null)
  const popperTextRef = React.useRef<HTMLInputElement>(null)

  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const groupedFields = React.useMemo(() => imGroupedFields.asMutable({ deep: true }), [imGroupedFields])

  const editCount = React.useMemo(() => {
    let count = 0
    groupedFields?.forEach(field => {
      if (field?.children) {
        field.children.forEach(child => {
          if (child.editAuthority) count++
        })
      } else {
        if (field.editAuthority) count++
      }
    })
    return count
  }, [groupedFields])

  const selectorFields = React.useMemo(() => showFields.map(f => f.jimuName), [showFields])

  const hiddenFields = React.useMemo(() => Immutable(getEditHiddenFields(layerDefinition) || []), [layerDefinition])

  const hasUncheck = React.useMemo(() => {
    if (!groupedFields) return false
    return groupedFields.some(item => !item.editAuthority && item.editable)
  }, [groupedFields])

  const indeterminate = React.useMemo(() => {
    if (!groupedFields) return false
    const hasCheck = groupedFields.some(item => item.editAuthority && item.editable)
    const hasUncheck = groupedFields.some(item => !item.editAuthority && item.editable)
    return hasCheck && hasUncheck
  }, [groupedFields])

  const constructTreeItem = React.useCallback((groupedFields: TreeFields[]) => {
    const selectedDs = getDataSourceById(useDataSource?.dataSourceId)
    const allFieldsSchema = selectedDs?.getSchema()
    const allFields = allFieldsSchema?.fields ? Object.values(allFieldsSchema?.fields) : []
    const mutableGroupedFields = groupedFields
    const showFieldsToTreeItem = (mutableGroupedFields: TreeFields[]) => {
      return mutableGroupedFields.filter(f => !hiddenFields.includes(f.jimuName)).map((item) => ({
        itemKey: item.jimuName,
        itemStateChecked: layerEditingEnabled ? item?.editAuthority : false,
        itemStateTitle: item.alias || item.jimuName || item.name,
        itemStateIcon: dataComponentsUtils.getIconFromFieldType(item.type, theme),
        itemStateDetailContent: item,
        itemStateDisabled: item?.groupKey ? false : !checkFieldsExist(allFields, item),
        itemStateCommands: [],
        isCheckboxDisabled: layerEditingEnabled ? !item.editable : true,
        ...(item.children ? { itemChildren: showFieldsToTreeItem(item.children) } : {})
      }))
    }
    const treeItem = showFieldsToTreeItem(mutableGroupedFields)
    const treeItemJson = {
      itemKey: TREE_ROOT_ITEM,
      itemStateTitle: TREE_ROOT_ITEM,
      itemChildren: treeItem
    }
    setRootItemJson(treeItemJson)
  }, [hiddenFields, layerEditingEnabled, theme, useDataSource?.dataSourceId])

  const rootItemJsonRef = hooks.useLatest(rootItemJson)
  const lastLayerConfigId = hooks.usePrevious(layerConfig.id)
  React.useEffect(() => {
    if ((!rootItemJsonRef.current && groupedFields) || lastLayerConfigId !==layerConfig.id) {
      constructTreeItem(groupedFields)
    }
  }, [constructTreeItem, groupedFields, lastLayerConfigId, layerConfig.id, rootItemJsonRef])

  const handleHonorModeChange = React.useCallback((e: any, hornorMode: string) => {
    onChange(layerConfig.set('layerHonorMode', hornorMode))
  }, [layerConfig, onChange])

  const onFieldChange = React.useCallback((allSelectedFields: IMFieldSchema[]) => {
    if (!allSelectedFields) return
    const newShowFields = allSelectedFields.filter(item => item)
    let newGroupedFields = groupedFields
    const addFields = newShowFields.filter(nf => !showFields.find(f => f.jimuName === nf.jimuName))
    for (const addField of addFields) {
      const fieldsConfig = layerDefinition?.fields || []
      const orgField = fieldsConfig.find(field => field.name === addField.jimuName)
      const defaultAuthority = orgField?.editable
      newGroupedFields.push({
        ...addField.asMutable({ deep: true }),
        editAuthority: defaultAuthority,
        subDescription: addField?.description || '',
        editable: defaultAuthority
      })
    }
    const removeFields = showFields.filter(f => !newShowFields.find(nf => nf.jimuName === f.jimuName))
    const removeFieldNames = removeFields.map(f => f.jimuName)
    newGroupedFields = newGroupedFields.filter(f => !removeFieldNames.includes(f.jimuName))
    for (let i = 0; i < newGroupedFields.length; i++) {
      const field = newGroupedFields[i]
      if (field.children) {
        field.children = field.children.filter(f => !removeFieldNames.includes(f.jimuName))
      }
    }
    onChange(layerConfig.set('showFields', newShowFields).set('groupedFields', newGroupedFields))
    constructTreeItem(newGroupedFields)
  }, [constructTreeItem, groupedFields, layerConfig, layerDefinition?.fields, onChange, showFields])

  const handleTreeBoxAll = React.useCallback(() => {
    const newGroupedFields = groupedFields
    newGroupedFields.forEach(field => {
      if (field.editable) {
        field.editAuthority = hasUncheck
      }
      if (field.children) {
        field.children.forEach(childField => {
          childField.editAuthority = hasUncheck
        })
      }
    })
    onChange(layerConfig.set('groupedFields', newGroupedFields))
    constructTreeItem(newGroupedFields)
  }, [constructTreeItem, groupedFields, hasUncheck, layerConfig, onChange])

  const addGroupForFields = React.useCallback(() => {
    setGroupUpdating(() => {
      setTimeout(() => {
        setGroupUpdating(false)
      }, 1000)
      return true
    })
    const newGroupId = getGroupMaxId(groupedFields) + 1
    const newGroupField = {
      jimuName: `${translate('group')}-${newGroupId}`,
      name: `${translate('group')}-${newGroupId}`,
      alias: `${translate('group')}-${newGroupId}`,
      subDescription: '',
      editAuthority: false,
      editable: true,
      children: [],
      groupKey: newGroupId
    } as TreeFields
    const newGroupedFields = [newGroupField, ...groupedFields]
    onChange(layerConfig.set('groupedFields', newGroupedFields))
    constructTreeItem(newGroupedFields)
  }, [constructTreeItem, groupedFields, layerConfig, onChange, translate])

  const removeGroup = React.useCallback((jimuName: string) => {
    let newGroupedFields = []
    for (const field of groupedFields) {
      if (field.jimuName === jimuName) {
        newGroupedFields = newGroupedFields.concat(field.children)
      } else {
        newGroupedFields = newGroupedFields.concat(field)
      }
    }
    onChange(layerConfig.set('groupedFields', newGroupedFields))
    if (curEditField?.jimuName === jimuName) {
      setIsOpenDetailPopper(false)
    }
    constructTreeItem(newGroupedFields)
  }, [constructTreeItem, curEditField?.jimuName, groupedFields, layerConfig, onChange])

  const renderRemoveGroup = React.useCallback((actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => {
    const { itemJsons } = refComponent.props
    const [currentItemJson] = itemJsons
    const { groupKey, jimuName } = currentItemJson?.itemStateDetailContent || {}
    return groupKey
      ? <Button
          icon
          size='sm'
          type='tertiary'
          disableHoverEffect
          disableRipple
          className='item-remove-button'
          onClick={(evt) => {
            evt?.stopPropagation()
            removeGroup(jimuName)
          }}
          onKeyUp={(evt) => {
            if (evt.key === ' ' || evt.key === 'Enter') {
              removeGroup(jimuName)
            }
          }}
          title={translate('remove')}
          aria-label={translate('remove')}
        >
        <TrashOutlined />
      </Button>
      : ''
  }, [removeGroup, translate])

  const showDetailPopper = React.useCallback((ref: React.RefObject<HTMLDivElement>, curField: TreeFields) => {
    popperRef.current = ref.current
    setCurEditField(curField)
    setIsOpenDetailPopper(old => !old)
  }, [])

  const renderDetail = React.useCallback((actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => {
    const { itemJsons, itemJsons: [{ itemStateDetailVisible, itemStateDetailContent, itemStateDisabled }] } = refComponent.props
    const [currentItemJson] = itemJsons
    const curField = currentItemJson?.itemStateDetailContent
    return itemStateDetailContent
      ? <Button
          icon
          type='tertiary'
          size='sm'
          title={translate('description')}
          aria-label={translate('description')}
          disabled={!!itemStateDisabled}
          disableHoverEffect
          disableRipple
          aria-expanded={!!itemStateDetailVisible}
          className='jimu-tree-item__detail-toggle'
          onClick={(evt) => {
            evt.stopPropagation()
            showDetailPopper(refComponent.dragRef, curField)
          }}
          onKeyUp={(evt) => {
            if (evt.key === ' ' || evt.key === 'Enter') {
              evt.stopPropagation()
              showDetailPopper(refComponent.dragRef, curField)
            }
          }}
          css={detailStyle}
        >
          <InfoOutlined autoFlip={!itemStateDetailVisible} />
        </Button>
      : null
  }, [showDetailPopper, translate])

  const isItemDroppable = React.useCallback((actionData: TreeCheckDropItemActionDataType, refComponent: _TreeItem) => {
    const { draggingItemJsons, targetItemJsons, dropType } = actionData
    const isTargetGroup = targetItemJsons[0]?.itemChildren
    const isTargetParentGroup = targetItemJsons[Math.min(1, targetItemJsons.length - 2)]?.itemChildren // skip the tree root
    const isSourceGroup = draggingItemJsons[0]?.itemChildren
    let droppable = true
    if (dropType === 'to-inside' && (!isTargetGroup || isSourceGroup)) {
      droppable = false
    }
    if (dropType !== 'to-inside' && isTargetParentGroup && isSourceGroup) {
      droppable = false
    }
    return droppable
  }, [])

  const isFolder = React.useCallback((actionData: TreeCheckDropItemActionDataType, refComponent: _TreeItem) => {
    const { targetItemJsons } = actionData
    const [currentItemJson] = targetItemJsons
    const { groupKey } = currentItemJson?.itemStateDetailContent || {}
    return !!groupKey
  }, [])

  const handleUpdateItem = React.useCallback((actionData: UpdateTreeActionDataType, refComponent: _TreeItem) => {
    const { itemJsons, updateType } = actionData
    const currentItemJson = itemJsons[0] as TreeItemType
    const curField = currentItemJson?.itemStateDetailContent as TreeFields
    if (!curField?.groupKey && updateType === TreeItemActionType.HandleStartEditing) return
    const parentItemJson = itemJsons[itemJsons.length - 1] as TreeItemType
    setRootItemJson(parentItemJson)
    const newGroupedFields = parentItemJson.itemChildren?.map((item, index) => {
      const newField = item.itemStateDetailContent as TreeFields
      if (item.itemChildren) {
        if (!item.itemStateTitle) {
          item.itemStateTitle = item.itemStateDetailContent?.jimuName
        }
        newField.name = item.itemStateTitle
        newField.alias = item.itemStateTitle
        const newEditAuthority = item.itemChildren.length > 0
          ? !item.itemChildren.some(item => {
              return !item.isCheckboxDisabled && !item.itemStateChecked
            })
          : false
        newField.editAuthority = newEditAuthority
        const newChildren = item.itemChildren.map(child => {
          child.itemStateDetailContent.editAuthority = child.itemStateChecked
          return child.itemStateDetailContent
        }) as TreeFields[]
        newField.children = newChildren
      } else {
        newField.editAuthority = item.itemStateChecked
      }
      return newField
    })
    onChange(layerConfig.set('groupedFields', newGroupedFields))
  }, [layerConfig, onChange])

  const findEditingIndex = React.useCallback((targetId: string) => {
    let editingIndex: number[]
    groupedFields.forEach((field, index) => {
      if (field.jimuName === targetId) {
        editingIndex = [index]
      } else if (field?.children) {
        const subIndex = field.children.findIndex(item => item.jimuName === targetId)
        if (subIndex > -1) {
          editingIndex = [index, subIndex]
        }
      }
    })
    return editingIndex
  }, [groupedFields])

  const handleTreeDescChange = React.useCallback(() => {
    const newGroupedFields = groupedFields
    const editingIndex = findEditingIndex(curEditField?.jimuName)
    const newValue = popperTextRef.current?.value || ''
    // edit description
    if (editingIndex.length === 2) {
      const [index, subIndex] = editingIndex
      const field = newGroupedFields[index].children[subIndex]
      if (field) {
        field.subDescription = newValue
      }
    } else if (editingIndex.length === 1) {
      const [index] = editingIndex
      const field = newGroupedFields[index]
      field.subDescription = newValue
    }
    onChange(layerConfig.set('groupedFields', newGroupedFields))
    setIsOpenDetailPopper(false)
    constructTreeItem(newGroupedFields)
  }, [constructTreeItem, curEditField?.jimuName, findEditingIndex, groupedFields, layerConfig, onChange])

  return <SettingSection title={translate('configFields')} css={style}>
    <SettingRow>
      <Select size='sm' className='w-100' value={layerHonorMode} onChange={handleHonorModeChange}>
        <option value={LayerHonorModeType.Webmap}>{translate('layerHonorSetting')}</option>
        <option value={LayerHonorModeType.Custom}>{translate('layerCustomize')}</option>
      </Select>
    </SettingRow>
    {layerHonorMode === LayerHonorModeType.Custom &&
      <React.Fragment>
        <SettingRow flow='wrap' label={translate('configFieldsTip')}>
          <FieldSelector
            useDataSources={ useDataSource ? Immutable([useDataSource]) : Immutable([]) }
            selectedFields={Immutable(selectorFields)}
            isMultiple
            isDataSourceDropDownHidden
            useDropdown
            useMultiDropdownBottomTools
            hiddenFields={hiddenFields}
            onChange={onFieldChange}
          />
        </SettingRow>

        <SettingRow flow='wrap' label={layerEditingEnabled && translate('editableCount', { count: editCount })}>
          <div className='fields-list-header form-inline'>
            <div className='d-flex w-100 fields-list-check'>
              {layerEditingEnabled &&
                <Checkbox
                  id='editAll'
                  data-field='editAll'
                  onClick={handleTreeBoxAll}
                  checked={!hasUncheck}
                  indeterminate={indeterminate}
                  title={hasUncheck
                    ? `${translate('editable')} (${translate('checkAll')})`
                    : `${translate('editable')} (${translate('uncheckAll')})`
                  }
                />
              }
              <Label
                for='editAll'
                style={{ cursor: 'pointer' }}
                className='ml-2'
                title={translate('field')}
              >
                {translate('field')}
              </Label>
            </div>
            <Button
              icon
              size='sm'
              type='tertiary'
              disableHoverEffect
              disableRipple
              onClick={addGroupForFields}
              title={translate('addGroup')}
              aria-label={translate('addGroup')}
              disabled={groupUpdating}
            >
              <AddFolderOutlined />
            </Button>
          </div>
        </SettingRow>

        <SettingRow className='selected-fields-con'>
          <Tree
            className='selected-fields-list'
            rootItemJson={rootItemJson}
            treeAlignmentType={TreeAlignmentType.Intact}
            dndEnabled
            checkboxLinkage={layerEditingEnabled}
            collapseStyle={TreeCollapseStyle.Arrow}
            renderOverrideItemCommands={renderRemoveGroup}
            renderOverrideItemDetailToggle={renderDetail}
            isItemDroppable={isItemDroppable}
            isFolder={isFolder}
            onUpdateItem={handleUpdateItem}
            {...advancedActionMap}
          />
          {curEditField && <Popper
            placement='bottom-start'
            reference={popperRef}
            offsetOptions={[-27, 3]}
            open={isOpenDetailPopper}
            arrowOptions={false}
            toggle={() => { setIsOpenDetailPopper(false) }}
          >
            <div style={{ width: 228 }} className='p-4'>
              <TextArea
                ref={popperTextRef}
                id={curEditField?.jimuName}
                className='w-100'
                height={60}
                placeholder={translate('editFieldDescription')}
                defaultValue={curEditField?.subDescription || curEditField?.description}
              />
              <div className='d-flex justify-content-end mt-4'>
                <Button size='sm' type='primary' onClick={handleTreeDescChange}>
                  {translate('commonModalOk')}
                </Button>
                <Button size='sm' className='ml-1' onClick={() => { setIsOpenDetailPopper(false) }}>
                  {translate('commonModalCancel')}
                </Button>
              </div>
            </div>
          </Popper>}
        </SettingRow>
      </React.Fragment>
    }
  </SettingSection>
}

const checkFieldsExist = (allFields: IMFieldSchema[], tableField: TreeFields) => {
  let exist = false
  for (const item of allFields) {
    if (item.jimuName === tableField.jimuName) {
      exist = true
      break
    }
  }
  return exist
}

const getGroupMaxId = (arr: TreeFields[]): number => {
  const numbers = []
  arr.forEach(item => {
    if (item?.groupKey) {
      numbers.push(item?.groupKey)
    }
  })
  return numbers.length > 0 ? Math.max.apply(null, numbers) : 0
}

export default LayerConfigField
