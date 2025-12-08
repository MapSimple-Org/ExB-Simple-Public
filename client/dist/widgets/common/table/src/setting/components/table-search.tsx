/** @jsx jsx */
import { React, jsx, hooks, Immutable, type IMFieldSchema, JimuFieldType } from 'jimu-core'
import { Checkbox, defaultMessages as jimuUIMessages, Label, Switch, TextInput } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuLayoutsMessages } from 'jimu-layouts/layout-runtime'
import type { LayerConfigProps } from './layer-config'
import { builderAppSync } from 'jimu-for-builder'
import { FieldSelectorWithFullTextIndex } from 'jimu-ui/advanced/data-source-selector'

const { useState } = React
type TableOptionsProps = Pick<LayerConfigProps, 'widgetId' | 'layerConfig' | 'onChange'>

const TableSearch = (props: TableOptionsProps) => {
  const { widgetId, layerConfig, onChange } = props
  const { enableSearch, searchFields, searchExact, searchHint, useDataSource } = layerConfig
  const [hint, setHint] = useState<string>(searchHint)
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages, jimuLayoutsMessages)

  const handleChooseSearchingFieldsChange = React.useCallback((allSelectedFields: IMFieldSchema[]) => {
    // if (allSelectedFields.length === 0) {
    //   builderAppSync.publishChangeWidgetStatePropToApp({ widgetId, propKey: 'optionChangeSuggestion', value: true })
    // }
    onChange(layerConfig.set('searchFields', allSelectedFields.map(fieldSchema => fieldSchema.name)))
  }, [layerConfig, onChange])

  const onHintChange = (event) => {
    const value = event.target.value
    setHint(value)
  }

  const onHintAccept = (value) => {
    if (value !== hint) {
      setHint(value)
    }
    onChange(layerConfig.set('searchHint', value))
  }

  return <SettingSection>
    <SettingRow tag='label' label={translate('enableSearch')} truncateLabel>
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
      <React.Fragment>
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
            value={hint || ''}
            onChange={onHintChange}
            onAcceptValue={onHintAccept}
            aria-label={translate('searchHint')}
          />
        </SettingRow>
      </React.Fragment>
    )}
  </SettingSection>
}

export default TableSearch
