/** @jsx jsx */
import { React, jsx, hooks, type IMFieldSchema, JimuFieldType, Immutable } from 'jimu-core'
import { Checkbox, defaultMessages as jimuUIMessages, Label, Select, Switch, TextInput } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuLayoutsMessages } from 'jimu-layouts/layout-runtime'
import { LayerHonorModeType, SelectionModeType } from '../../config'
import type { LayerConfigProps } from './layer-config'
import { builderAppSync } from 'jimu-for-builder'
import { Fragment } from 'react'
import { FieldSelectorWithFullTextIndex } from 'jimu-ui/advanced/data-source-selector'
import { getDsCapabilities } from './utils'

type TableOptionsProps = Pick<LayerConfigProps, 'widgetId' | 'layerConfig' | 'layerDefinition' | 'isEditableDs' | 'onChange'>

const TableTools = (props: TableOptionsProps) => {
  const { widgetId, layerConfig, layerDefinition, isEditableDs, onChange } = props
  const { layerHonorMode, enableEdit, enableSelect, enableSearch, searchFields, searchExact, searchHint, selectMode, enableDelete, enableShowHideColumn, useDataSource } = layerConfig
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages, jimuLayoutsMessages)
  const optionsArray = ['enableSelect', 'showCount', 'enableRefresh']

  // Can't edit Feature collection(dataSource.url is undefined) and output ds
  // const editableDs = dataSource?.url && dataSource?.dataViewId !== OUTPUT_DATA_VIEW_ID
  const capabilities = layerDefinition?.capabilities
  const deletable = getDsCapabilities(capabilities, 'delete') && isEditableDs
  const isCustom = layerHonorMode === LayerHonorModeType.Custom
  const showDelete = isCustom ? (enableEdit && deletable) : deletable

  const handleChooseSearchingFieldsChange = React.useCallback((allSelectedFields: IMFieldSchema[]) => {
    // if (allSelectedFields.length === 0) {
    //   builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'optionChangeSuggestion', value: true })
    // }
    onChange(layerConfig.set('searchFields', allSelectedFields.map(fieldSchema => fieldSchema.name)))
  }, [layerConfig, onChange])

  const onSearchPlaceholderChange = React.useCallback((e) => {
    const newSearchHint = e.target.value
    if (searchHint === newSearchHint) return
    onChange(layerConfig.set('searchHint', newSearchHint))
  }, [searchHint, layerConfig, onChange])

  const getSelectModeOptions = React.useCallback((): React.JSX.Element[] => {
    return [
      <option key={SelectionModeType.Single} value={SelectionModeType.Single}>
        {translate('single')}
      </option>,
      <option
        key={SelectionModeType.Multiple}
        value={SelectionModeType.Multiple}
      >
        {translate('multiple')}
      </option>
    ]
  }, [translate])

  return <SettingSection
    role='group'
    className='last-setting-section'
    title={translate('tools')}
    aria-label={translate('tools')}
  >
    <SettingRow tag='label' label={translate('enableSearch')}>
      <Switch
        className='can-x-switch'
        checked={enableSearch || false}
        onChange={evt => {
          const checked = evt.target.checked
          builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'optionChangeSuggestion', value: true })
          onChange(layerConfig.set('enableSearch', checked))
        }}
        aria-label={translate('enableSearch')}
      />
    </SettingRow>
    {enableSearch && (
      <Fragment>
        <SettingRow flow='wrap' label={translate('searchFields')}>
          <div
            className='w-100 search-container'
            style={{ zIndex: 3 }}
          >
            <FieldSelectorWithFullTextIndex
              useDataSources={useDataSource ? Immutable([useDataSource]) : Immutable([]) }
              onChange={handleChooseSearchingFieldsChange}
              selectedFields={searchFields ? Immutable(searchFields) : Immutable([])}
              isMultiple
              isDataSourceDropDownHidden
              useDropdown
              useMultiDropdownBottomTools
              widgetId={widgetId} //id
              types={Immutable([JimuFieldType.Number, JimuFieldType.String])}
              aria-label={translate('searchFields')}
            />
          </div>
        </SettingRow>
        <SettingRow className='w-100 d-flex justify-content-between'>
          <Label>
            <Checkbox
              style={{ cursor: 'pointer' }}
              checked={searchExact}
              aria-label={translate('fullMatch')}
              onChange={(evt, checked: boolean) => { onChange(layerConfig.set('searchExact', checked)) }}
            />
            <div className='m-0 ml-2 flex-grow-1 omit-label'>
              {translate('fullMatch')}
            </div>
          </Label>
        </SettingRow>
        <SettingRow flow='wrap' label={translate('searchHint')}>
          <TextInput
            size='sm'
            className='search-placeholder w-100'
            placeholder={translate('search')}
            value={searchHint || ''}
            onChange={onSearchPlaceholderChange}
            aria-label={translate('searchHint')}
          />
        </SettingRow>
      </Fragment>
    )}
    {optionsArray.map((key, index) => {
      const isChecked = layerConfig[key] || false
      return (
        <Fragment key={index}>
          <SettingRow tag='label' label={translate(key)}>
            <Switch
              className='can-x-switch'
              checked={isChecked}
              onChange={evt => { onChange(layerConfig.set(key, evt.target.checked)) }}
              aria-label={translate(key)}
            />
          </SettingRow>
          {key === 'enableSelect' && enableSelect && (
            <SettingRow
              flow='wrap'
              label={translate('selectMode')}
              className='select-option'
            >
              <Select
                size='sm'
                value={selectMode || SelectionModeType.Multiple}
                onChange={evt => { onChange(layerConfig.set('selectMode', evt.target.value)) }}
                aria-label={translate('selectMode')}
              >
                {getSelectModeOptions()}
              </Select>
            </SettingRow>
          )}
        </Fragment>
      )
    })}
    {showDelete &&
      <SettingRow tag='label' label={translate('deleteRecords')}>
        <Switch
          className='can-x-switch'
          checked={enableDelete || false}
          onChange={evt => { onChange(layerConfig.set('enableDelete', evt.target.checked)) }}
          aria-label={translate('deleteRecords')}
        />
      </SettingRow>
    }
    <SettingRow tag='label' label={translate('enableShowHideColumn')}>
      <Switch
        className='can-x-switch'
        checked={enableShowHideColumn === undefined ? true : enableShowHideColumn}
        onChange={evt => { onChange(layerConfig.set('enableShowHideColumn', evt.target.checked)) }}
        aria-label={translate('enableShowHideColumn')}
      />
    </SettingRow>
  </SettingSection>
}

export default TableTools
