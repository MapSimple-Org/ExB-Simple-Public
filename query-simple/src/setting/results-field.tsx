/** @jsx jsx */
import { React, jsx, css, Immutable, DataSourceManager, type IMFieldSchema, type UseDataSource, type IMThemeVariables, type FeatureLayerDataSource } from 'jimu-core'
import {
  FieldSelector,
  dataComponentsUtils
} from 'jimu-ui/advanced/data-source-selector'
import { withTheme } from 'jimu-theme'
import { List, TreeItemActionType, type TreeItemsType, type TreeItemType } from 'jimu-ui/basic/list-tree'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { TextInput, Label } from 'jimu-ui'
import { getFieldInfosInPopupContent } from 'widgets/shared-code/mapsimple-common'

interface Props {
  useDataSource: UseDataSource
  label: string
  selectedFields: string[]
  theme?: IMThemeVariables
  onFieldsChanged: (fields: string[]) => void
  // r028.117 (Phase 2.1): per-field alias overrides (name -> alias) + label for the
  // alias section. Optional so the component is backward compatible if a caller
  // doesn't wire aliases.
  fieldAliases?: { [fieldName: string]: string }
  aliasLabel?: string
  aliasPlaceholder?: string
  onFieldAliasesChanged?: (aliases: { [fieldName: string]: string }) => void
}

const advancedActionMap = {
  overrideItemBlockInfo: () => {
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
                name: TreeItemActionType.RenderOverrideItemCommands
              }]
            }]
          }]
        }]
      }]
    }
  }
}

function ResultsFieldSettingComponent (props: Props) {
  const { useDataSource, selectedFields, label, theme, onFieldsChanged, fieldAliases, aliasLabel, aliasPlaceholder, onFieldAliasesChanged } = props

  // r028.117 (Phase 2.1): update a single field's alias override in the map.
  // Empty/whitespace removes the override (falls back to schema alias at render).
  const handleAliasChange = (fieldName: string, value: string) => {
    if (!onFieldAliasesChanged) return
    const next = { ...(fieldAliases || {}) }
    const trimmed = value.trim()
    if (trimmed) {
      next[fieldName] = value
    } else {
      delete next[fieldName]
    }
    onFieldAliasesChanged(next)
  }

  const useDataSources = React.useMemo(() => Immutable([useDataSource]), [useDataSource])
  const allFields = React.useMemo(() => {
    const selectedDs = DataSourceManager.getInstance().getDataSource(useDataSource?.dataSourceId)
    if (!selectedDs) {
      return []
    }
    const allFieldsSchema = selectedDs?.getSchema()
    return allFieldsSchema?.fields ? Object.values(allFieldsSchema.fields) : []
  }, [useDataSource])

  const popupFields = React.useMemo(() => {
    const selectedDs = DataSourceManager.getInstance().getDataSource(useDataSource?.dataSourceId)
    if (selectedDs) {
      const featureLayerDataSource = selectedDs as FeatureLayerDataSource
      let fieldInfos = featureLayerDataSource.layer?.popupTemplate?.fieldInfos ?? []
      const fieldsInContent = getFieldInfosInPopupContent(featureLayerDataSource.getPopupInfo())
      if (fieldsInContent.length > 0) {
        fieldInfos = fieldsInContent
      }
      // remove duplicate fields
      const popupFieldNames = new Set(fieldInfos.map(ele => ele.fieldName))
      const fields = allFields.filter(
        item => popupFieldNames.has(item.name)
      )
      return fields
    }
    return []
  }, [useDataSource, allFields])

  const fieldsSchema = React.useMemo(() => {
    if (selectedFields != null) {
      return selectedFields.map(name => {
        return allFields.find(item => item.jimuName === name)
      })
    }
    return popupFields
  }, [popupFields, allFields, selectedFields])

  const handleFieldsChange = (allSelectedFields: IMFieldSchema[]) => {
    if (allSelectedFields) {
      const fieldNames = allSelectedFields.filter(item => item).map(item => item.jimuName)
      // 1. remove the field that is not in allSelectedFields
      const filterSelected = selectedFields != null ? selectedFields.filter(item => fieldNames.includes(item)) : fieldNames
      // 2. remove the field that is already in selectedFields
      const extraFields = selectedFields != null ? fieldNames.filter(item => !selectedFields.includes(item)) : []

      onFieldsChanged(filterSelected.concat(extraFields))
    }
  }

  const currentFields = selectedFields != null ? selectedFields : popupFields.map(field => field.jimuName)

  return (
    <React.Fragment>
      <SettingRow flow='wrap' label={label}>
        <FieldSelector
          useDataSources={useDataSources}
          onChange={handleFieldsChange}
          selectedFields={Immutable(currentFields)}
          isMultiple
          isDataSourceDropDownHidden
          useDropdown
          useMultiDropdownBottomTools
        />
      </SettingRow>
      {currentFields.length > 1 && (
        <SettingRow>
          <List
            className='selected-fields-list w-100'
            css={css`max-height: 300px;`}
            itemsJson={Array.from(fieldsSchema).map((item, index) => ({
              itemStateDetailContent: item,
              itemKey: `${index}`,
              itemStateIcon: dataComponentsUtils.getIconFromFieldType(item.type, theme),
              itemStateTitle: item.alias || item.jimuName || item.name,
              itemStateCommands: []
            }))}
            dndEnabled
            onUpdateItem={(actionData, refComponent) => {
              const { itemJsons } = refComponent.props
              const [, parentItemJson] = itemJsons as [TreeItemType, TreeItemsType]
              const newTableFields: IMFieldSchema[] = parentItemJson.map(item => {
                return item.itemStateDetailContent
              })
              onFieldsChanged(newTableFields.map(item => item.jimuName))
            }}
            {...advancedActionMap}
          />
        </SettingRow>
      )}
      {/* r028.117 (Phase 2.1): per-field alias overrides. One text input per selected
          field; empty falls back to the schema alias at render time. Only shown when
          the caller wires onFieldAliasesChanged. */}
      {onFieldAliasesChanged && currentFields.length > 0 && (
        <SettingRow flow='wrap' label={aliasLabel}>
          <div className='w-100'>
            {currentFields.map((fieldName) => {
              const schema = allFields.find(f => f.jimuName === fieldName || f.name === fieldName)
              const schemaLabel = (schema as any)?.alias || (schema as any)?.name || fieldName
              return (
                <div key={fieldName} css={css`display:flex; align-items:center; gap:8px; margin-bottom:6px;`}>
                  <Label className='text-truncate' css={css`flex:0 0 40%; font-size:12px; margin:0;`} title={schemaLabel}>
                    {schemaLabel}
                  </Label>
                  <TextInput
                    className='flex-grow-1'
                    size='sm'
                    value={fieldAliases?.[fieldName] ?? ''}
                    placeholder={aliasPlaceholder}
                    onChange={(e) => { handleAliasChange(fieldName, e.target.value) }}
                  />
                </div>
              )
            })}
          </div>
        </SettingRow>
      )}
    </React.Fragment>
  )
}

export const ResultsFieldSetting = withTheme(ResultsFieldSettingComponent)
