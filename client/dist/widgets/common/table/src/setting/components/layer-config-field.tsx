/** @jsx jsx */
import {
  React, jsx, Immutable, css, type IMFieldSchema, hooks, type IMThemeVariables
} from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { defaultMessages as jimuUIMessages, Checkbox, Button, Label, Select, Switch, Radio } from 'jimu-ui'
import { FieldSelector, dataComponentsUtils } from 'jimu-ui/advanced/data-source-selector'
import {
  Tree, TreeItemActionType, type TreeItemType, TreeAlignmentType, type TreeRenderOverrideItemDataType,
  type _TreeItem, type TreeCheckDropItemActionDataType, type UpdateTreeActionDataType
} from 'jimu-ui/basic/list-tree'
import { type TableFieldsSchema, LayerHonorModeType, LocationType } from '../../config'
import defaultMessages from '../translations/default'
import { getDataSourceById, getHonorWebmapUsedFields } from '../../utils'
import { useTheme } from 'jimu-theme'
import { advancedActionMap, getDsCapabilities } from './utils'
import type { LayerConfigProps } from './layer-config'
import { VisibleOutlined } from 'jimu-icons/outlined/application/visible'
import { InvisibleOutlined } from 'jimu-icons/outlined/application/invisible'

type LayerConfigFieldProps = Pick<LayerConfigProps, 'layerConfig' | 'onChange' | 'layerDefinition' | 'isEditableDs'>

const TREE_ROOT_ITEM = 'root item for tree data entry'

const getStyle = (theme: IMThemeVariables) => {
  return css`
    .fields-list-header {
      background: ${theme.ref.palette.neutral[300]};
      border-bottom: 1px solid ${theme.ref.palette.neutral[600]};
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
        .jimu-tree-item_disabled-true .jimu-tree-item__droppable {
          background: unset;
        }
      }
      .jimu-tree-item{
        background: ${theme.ref.palette.neutral[300]};
        border-bottom: 1px solid ${theme.ref.palette.neutral[400]};
        .jimu-tree-item__content{
          div:first-of-type{
            padding-left: 2px;
          }
          .jimu-tree-item__body{
            background: ${theme.ref.palette.neutral[300]};
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
}

const LayerConfigField = (props: LayerConfigFieldProps) => {
  const { layerConfig, layerDefinition, isEditableDs, onChange } = props
  const {
    enableEdit, useDataSource, searchFields, tableFields: imTableFields, allFields: imAllFields,
    layerHonorMode, isFreezeFields = false, frozenFields, freezeLocation
  } = layerConfig
  const [rootItemJson, setRootItemJson] = React.useState<TreeItemType>(null)
  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const editableDs = isEditableDs
  const capabilities = layerDefinition?.capabilities
  const updatable = getDsCapabilities(capabilities, 'update') && editableDs

  const tableFields = React.useMemo(() => imTableFields.asMutable({ deep: true }), [imTableFields])
  const editCount = React.useMemo(() => {
    let count = 0
    tableFields?.forEach(field => {
      if (field?.editAuthority) count++
    })
    return count
  }, [tableFields])
  const selectorFields = React.useMemo(() => tableFields.map(f => f.jimuName), [tableFields])
  const hasUncheck = React.useMemo(() => {
    if (!tableFields) return false
    return tableFields.some(item => !item.editAuthority && item.editable)
  }, [tableFields])
  const indeterminate = React.useMemo(() => {
    if (!tableFields) return false
    const hasCheck = tableFields.some(item => item.editAuthority && item.editable)
    const hasUncheck = tableFields.some(item => !item.editAuthority && item.editable)
    return hasCheck && hasUncheck
  }, [tableFields])

  const getFieldEditable = React.useCallback((layerDefinition, jimuName: string) => {
    const fieldsConfig = layerDefinition?.fields || []
    const orgField = fieldsConfig.find(config => config.name === jimuName)
    const fieldEditable = orgField ? orgField?.editable : true
    return fieldEditable
  }, [])

  const constructTreeItem = React.useCallback((tableFields: TableFieldsSchema[]) => {
    const selectedDs = getDataSourceById(useDataSource?.dataSourceId)
    const allFieldsSchema = selectedDs?.getSchema()
    const allFields = allFieldsSchema?.fields ? Object.values(allFieldsSchema?.fields) : []
    const mutableTableFields = tableFields
    const showFieldsToTreeItem = (mutableGroupedFields: TableFieldsSchema[]) => {
      const freezeItemIndex = isFreezeFields && frozenFields && frozenFields.length > 0
        ? mutableGroupedFields.findIndex(item => frozenFields.includes(item.jimuName))
        : -1
      const treeItemArr = []
      let itemToMove = undefined
      mutableGroupedFields.forEach((item, index) => {
        if (index === freezeItemIndex) {
          itemToMove = {
            itemKey: item.jimuName,
            itemStateChecked: enableEdit ? item?.editAuthority : false,
            itemStateTitle: item.alias || item.jimuName || item.name,
            itemStateIcon: dataComponentsUtils.getIconFromFieldType(item.type, theme),
            itemStateDetailContent: item,
            itemStateDisabled: true,
            itemStateCommands: [],
            isCheckboxDisabled: !getFieldEditable(layerDefinition, item.jimuName)
          }
        } else {
          treeItemArr.push({
            itemKey: item.jimuName,
            itemStateChecked: enableEdit ? item?.editAuthority : false,
            itemStateTitle: item.alias || item.jimuName || item.name,
            itemStateIcon: dataComponentsUtils.getIconFromFieldType(item.type, theme),
            itemStateDetailContent: item,
            itemStateDisabled: !checkFieldsExist(allFields, item),
            itemStateCommands: [],
            isCheckboxDisabled: !getFieldEditable(layerDefinition, item.jimuName)
          })
        }
      })
      if (itemToMove) {
        const isBeginning = !freezeLocation || freezeLocation === LocationType.Beginning
        isBeginning ? treeItemArr.unshift(itemToMove) : treeItemArr.push(itemToMove)
      }
      return treeItemArr
    }
    const treeItem = showFieldsToTreeItem(mutableTableFields)
    const treeItemJson = {
      itemKey: TREE_ROOT_ITEM,
      itemStateTitle: TREE_ROOT_ITEM,
      itemChildren: treeItem
    }
    setRootItemJson(treeItemJson)
  }, [enableEdit, theme, useDataSource?.dataSourceId, getFieldEditable, layerDefinition, isFreezeFields, frozenFields, freezeLocation])

  // const rootItemJsonRef = hooks.useLatest(rootItemJson)
  React.useEffect(() => {
    // if (!rootItemJsonRef.current && tableFields) {
    //   constructTreeItem(tableFields)
    // }
    if (tableFields) {
      constructTreeItem(tableFields)
    }
  }, [constructTreeItem, tableFields]) //, rootItemJsonRef

  const handleHonorModeChang = React.useCallback((e) => {
    onChange(layerConfig.set('layerHonorMode', e.target.value))
  }, [layerConfig, onChange])

  const filterSearchFields = React.useCallback((newTableFields) => {
    const tableFieldsNames = newTableFields.map(item => item.jimuName)
    const filteredSearchFields = searchFields.filter(field => tableFieldsNames.includes(field))
    return filteredSearchFields
  }, [searchFields])

  const filterFreezeFields = React.useCallback((newTableFields) => {
    const tableFieldsNames = newTableFields.map(item => item.jimuName)
    const filteredFreezeFields = frozenFields?.filter(field => tableFieldsNames.includes(field)) || Immutable([])
    return filteredFreezeFields
  }, [frozenFields])

  const onFieldChange = React.useCallback((allSelectedFields: IMFieldSchema[]) => {
    if (!allSelectedFields) return
    const newShowFields = allSelectedFields.filter(item => item)
    let newTableFields = tableFields
    const addFields = newShowFields.filter(nf => !tableFields.find(f => f.jimuName === nf.jimuName))
    for (const addField of addFields) {
      const fieldsConfig = layerDefinition?.fields || []
      const orgField = fieldsConfig.find(field => field.name === addField.jimuName)
      const defaultAuthority = orgField?.editable
      newTableFields.push({
        ...addField.asMutable({ deep: true }),
        editAuthority: defaultAuthority,
        editable: defaultAuthority,
        visible: true
      } as unknown as TableFieldsSchema)
    }
    const removeFields = tableFields.filter(f => !newShowFields.find(nf => nf.jimuName === f.jimuName))
    const removeFieldNames = removeFields.map(f => f.jimuName)
    newTableFields = newTableFields.filter(f => !removeFieldNames.includes(f.jimuName))
    // update searchFields, tableFields，freezeField and the fields used
    const filteredSearchFields = filterSearchFields(newTableFields)
    const filteredFreezeFields = filterFreezeFields(newTableFields)
    const usedFields = allSelectedFields.map(f => f.jimuName)
    const mewUseDs = layerConfig?.useDataSource?.set('fields', usedFields)
    onChange(layerConfig.set('searchFields', filteredSearchFields).set('frozenFields', filteredFreezeFields).set('tableFields', newTableFields).set('useDataSource', mewUseDs))
    constructTreeItem(newTableFields)
  }, [constructTreeItem, filterSearchFields, filterFreezeFields, tableFields, layerConfig, layerDefinition?.fields, onChange])

  const handleTreeBoxAll = React.useCallback(() => {
    const newTableFields = tableFields
    newTableFields.forEach(field => {
      if (field.editable) {
        field.editAuthority = hasUncheck
      }
    })
    onChange(layerConfig.set('tableFields', newTableFields))
    constructTreeItem(newTableFields)
  }, [constructTreeItem, tableFields, hasUncheck, layerConfig, onChange])

  const handleEnableEditChange = React.useCallback(evt => {
    const checked = evt.target.checked
    const newTableFields = tableFields.map(item => {
      return {
        ...item,
        editAuthority: item.editable
      }
    })
    onChange(layerConfig.set('enableEdit', checked).set('tableFields', newTableFields))
  }, [layerConfig, tableFields, onChange])

  const toggleFieldVisible = React.useCallback((jimuName: string) => {
    const curIndex = tableFields.findIndex(item => item.jimuName === jimuName)
    const visible = tableFields[curIndex].visible
    tableFields[curIndex].visible = !visible
    onChange(layerConfig.set('tableFields', tableFields))
  }, [tableFields, layerConfig, onChange])

  const onKeyUp = React.useCallback((evt, jimuName) => {
    if (!evt) return
    if (evt.key === 'Enter') {
      toggleFieldVisible(jimuName)
    }
  }, [toggleFieldVisible])

  const renderVisibleButton = React.useCallback((actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => {
    const { itemJsons, itemJsons: [{ itemStateDetailContent }] } = refComponent.props
    const [currentItemJson] = itemJsons
    const { jimuName } = currentItemJson?.itemStateDetailContent || {}
    const curField = tableFields.find(item => item.jimuName === jimuName)
    const isFieldVisible = curField?.visible
    const visibleLabel = translate('visible')
    const invisibleLabel = translate('invisible')
    const getStyle = () => {
      return css`
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
    }

    return (
      itemStateDetailContent
        ? <Button
          icon
          type='tertiary'
          title={isFieldVisible ? visibleLabel : invisibleLabel}
          aria-label={isFieldVisible ? visibleLabel : invisibleLabel}
          className='jimu-tree-item__detail-toggle'
          onClick={(evt) => {
            evt.stopPropagation()
            toggleFieldVisible(jimuName)
          }}
          onKeyUp={(e) => { onKeyUp(e, jimuName) }}
          css={getStyle}
        >
          {isFieldVisible ? <VisibleOutlined /> : <InvisibleOutlined />}
        </Button>
        : null
    )
  }, [translate, toggleFieldVisible, onKeyUp, tableFields])

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

  const handleUpdateItem = React.useCallback((actionData: UpdateTreeActionDataType, refComponent: _TreeItem) => {
    const { itemJsons, updateType } = actionData
    if (enableEdit || updateType === TreeItemActionType.HandleDidDrop) {
      const parentItemJson = itemJsons[itemJsons.length - 1]
      setRootItemJson(parentItemJson)
      const newTableFields = parentItemJson.itemChildren?.map(item => {
        return {
          ...item.itemStateDetailContent,
          editAuthority: item.itemStateChecked
        }
      })
      onChange(layerConfig.set('tableFields', newTableFields))
    }
  }, [enableEdit, layerConfig, onChange])

  const hiddenFields = React.useMemo(() => {
    const isHonorWebmap = layerHonorMode === LayerHonorModeType.Webmap
    if (isHonorWebmap) {
      const dataSource = getDataSourceById(useDataSource?.dataSourceId)
      const { honorHiddenFields } = getHonorWebmapUsedFields(dataSource)
      return honorHiddenFields || []
    } else {
      const customHiddenFields = []
      imAllFields.forEach(field => {
        const curFieldInfo = imTableFields.find(item => item.jimuName === field.jimuName)
        const notInUsed = !curFieldInfo
        if (notInUsed) customHiddenFields.push(field.jimuName)
      })
      return customHiddenFields
    }
  }, [useDataSource?.dataSourceId, imAllFields, imTableFields, layerHonorMode])

  const onFrozenFieldChange = React.useCallback((allSelectedFields: IMFieldSchema[]) => {
    const newFrozenFields = allSelectedFields?.map(item => item.jimuName || item.name)
    onChange(layerConfig.set('frozenFields', newFrozenFields))
    if (rootItemJson) {
      const newItemChildren = rootItemJson.itemChildren || []
      // Currently, there can only be one freeze field, but multiple fields may be supported in the future
      const freezeItemIndex = newItemChildren.findIndex(item => newFrozenFields.includes(item.itemKey))
      // reset disabled state
      newItemChildren.forEach(item => {
        item.itemStateDisabled = false
      })
      if (freezeItemIndex > -1) {
        const itemToMove = newItemChildren.splice(freezeItemIndex, 1)[0]
        itemToMove.itemStateDisabled = true
        const isBeginning = !freezeLocation || freezeLocation === LocationType.Beginning
        isBeginning ? newItemChildren.unshift(itemToMove) : newItemChildren.push(itemToMove)
      }
      setRootItemJson(rootItemJson)
    }
  }, [layerConfig, onChange, rootItemJson, freezeLocation])


  return <SettingSection title={translate('configFields')} css={getStyle(theme)}>
    <SettingRow>
      <Select size='sm' className='w-100' value={layerHonorMode} onChange={handleHonorModeChang}>
        <option value={LayerHonorModeType.Webmap}>{translate('layerHonorSetting')}</option>
        <option value={LayerHonorModeType.Custom}>{translate('layerCustomize')}</option>
      </Select>
    </SettingRow>
    {layerHonorMode === LayerHonorModeType.Custom &&
      <React.Fragment>
        <SettingRow flow='wrap' label={translate('configTips')}>
          <FieldSelector
            useDataSources={ useDataSource ? Immutable([useDataSource]) : Immutable([]) }
            selectedFields={Immutable(selectorFields)}
            isMultiple
            isDataSourceDropDownHidden
            useDropdown
            useMultiDropdownBottomTools
            onChange={onFieldChange}
          />
        </SettingRow>

        <SettingRow flow='wrap' label={enableEdit && translate('editableCount', { count: editCount })}>
          <div className='fields-list-header form-inline'>
            <div className='d-flex w-100 fields-list-check'>
              {enableEdit &&
                <Checkbox
                  id='editAllField'
                  data-field='editAllField'
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
                for='editAllField'
                style={{ cursor: 'pointer' }}
                className='ml-2'
                title={translate('field')}
              >
                {translate('field')}
              </Label>
            </div>
          </div>
        </SettingRow>

        <SettingRow className='selected-fields-con'>
          <Tree
            className='selected-fields-list'
            rootItemJson={rootItemJson}
            treeAlignmentType={TreeAlignmentType.Intact}
            dndEnabled
            isMultiSelection={enableEdit}
            renderOverrideItemDetailToggle={renderVisibleButton}
            isItemDroppable={isItemDroppable}
            onUpdateItem={handleUpdateItem}
            {...advancedActionMap}
          />
        </SettingRow>

        {updatable && (
          <SettingRow>
            <div className='d-flex w-100'>
              <Checkbox
                id='editable-cb'
                data-field='enableEdit'
                onClick={handleEnableEditChange}
                checked={enableEdit}
              />
              <Label
                for='editable-cb'
                style={{ cursor: 'pointer' }}
                className='ml-2'
                title={translate('enableEdit')}
              >
                {translate('enableEdit')}
              </Label>
            </div>
          </SettingRow>
        )}
      </React.Fragment>
    }
    <SettingRow tag='label' label={<strong>{translate('freezeFields')}</strong>}>
      <Switch
        className='can-x-switch'
        checked={isFreezeFields}
        onChange={evt => { onChange(layerConfig.set('isFreezeFields', evt.target.checked)) }}
        aria-label={translate('freezeFields')}
      />
    </SettingRow>
    {isFreezeFields &&
      <React.Fragment>
        <SettingRow>
          <FieldSelector
            useDataSources={ useDataSource ? Immutable([useDataSource]) : Immutable([]) }
            selectedFields={frozenFields}
            hiddenFields={Immutable(hiddenFields)}
            isDataSourceDropDownHidden
            useDropdown
            isSearchInputHidden
            noSelectionItem={{ name: 'None' }}
            onChange={onFrozenFieldChange}
          />
        </SettingRow>
        <SettingRow label={translate('freezeLocation')} flow='wrap' role='group' aria-label={translate('freezeLocation')}>
          <div className='jimu-builder--background-setting'>
            <div role='radiogroup'>
              <Label className='d-flex align-items-center'>
                <Radio
                  style={{ cursor: 'pointer' }}
                  name='responsiveType'
                  className='mr-2'
                  checked={!freezeLocation || freezeLocation === LocationType.Beginning}
                  onChange={() => { onChange(layerConfig.set('freezeLocation', LocationType.Beginning)) }}
                />
                {translate('beginning')}
              </Label>
              <Label className='d-flex align-items-center'>
                <Radio
                  style={{ cursor: 'pointer' }}
                  name='displayOrderType'
                  className='mr-2'
                  checked={freezeLocation === LocationType.End}
                  onChange={() => { onChange(layerConfig.set('freezeLocation', LocationType.End)) }}
                />
                {translate('end')}
              </Label>
            </div>
          </div>
        </SettingRow>
      </React.Fragment>
    }
  </SettingSection>
}

const checkFieldsExist = (allFields: IMFieldSchema[], tableField: TableFieldsSchema) => {
  let exist = false
  for (const item of allFields) {
    if (item.jimuName === tableField.jimuName) {
      exist = true
      break
    }
  }
  return exist
}

export default LayerConfigField
