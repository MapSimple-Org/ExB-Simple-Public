/** @jsx jsx */
import { jsx, React, hooks, Immutable, JimuFieldType } from 'jimu-core'
import type { DataSource, ImmutableArray, UseDataSource, IMSqlExpression, IMFieldSchema } from 'jimu-core'
import { defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import { FieldSelectorWithFullTextIndex } from 'jimu-ui/advanced/data-source-selector'
import { SqlExpressionBuilderPopup } from 'jimu-ui/advanced/sql-expression-builder'
import { SettingRow, SettingSection, SortSetting, type SortSettingOption } from 'jimu-ui/advanced/setting-components'
import { CollapsablePanel, Switch, Button, Checkbox, TextInput, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import type { IMConfig } from '../../../config'
import { SelectionModeType, Status, SettingCollapseType } from '../../../config'
import defaultMessages from '../../translations/default'
const { useState, Fragment } = React

interface Props {
  id: string
  config: IMConfig
  settingCollapse: SettingCollapseType
  useDataSources: ImmutableArray<UseDataSource>
  datasource: DataSource
  openSettingCollapse: (settingCollapse: SettingCollapseType) => void
  closeSettingCollapse: () => void
  handleFormChange: (evt) => void
  onPropertyChange: (name, value) => void
  handleCheckboxChange: (dataField: string) => void
}

const ToolSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const { id, config, datasource, useDataSources, settingCollapse } = props
  const { onPropertyChange, handleFormChange, handleCheckboxChange, openSettingCollapse, closeSettingCollapse } = props

  const [isSqlExprShow, setIsSqlExprShow] = useState(false)
  const showSqlExprPopup = () => {
    setIsSqlExprShow(true)
  }

  const toggleSqlExprPopup = hooks.useEventCallback(() => {
    setIsSqlExprShow(!isSqlExprShow)
  })

  const onSqlExprBuilderChange = (sqlExprObj: IMSqlExpression) => {
    onPropertyChange('filter', sqlExprObj)
  }

  const handleChooseSearchingFieldsChange = (allSelectedFields: IMFieldSchema[]) => {
    // if (!allSelectedFields || allSelectedFields?.length === 0) return false
    onPropertyChange('searchFields', allSelectedFields.map(fieldSchema => fieldSchema.name))
  }

  const onSearchPlaceholderChange = hooks.useEventCallback((e) => {
    const searchHint = e.target.value
    const preSearchHint = config?.searchHint
    if (preSearchHint === searchHint) return
    onPropertyChange('searchHint', searchHint)
  })

  const onSettingSortChange = (sortData: SortSettingOption[], index?: number) => {
    onPropertyChange('sorts', sortData)
  }

  return (
    <SettingSection>
      <CollapsablePanel
        label={nls('tools')}
        isOpen={settingCollapse === SettingCollapseType.Tools}
        onRequestOpen={() => { openSettingCollapse(SettingCollapseType.Tools) }}
        onRequestClose={closeSettingCollapse}
      >
        <SettingRow className="mt-2" tag='label' label={nls('search')} aria-label={nls('search')}>
          <div className='d-flex'>
            <Switch
              checked={config.searchOpen}
              data-field='searchOpen'
              onChange={handleFormChange}
              title={nls('search')}
            />
          </div>
        </SettingRow>
        {config.searchOpen && (
          <SettingRow
            flow='wrap'
            label={nls('chooseSearchingFields')}
            role='group'
            aria-label={nls('chooseSearchingFields')}
          >
            <div
              className='w-100 search-container'
              style={{ zIndex: 3 }}
            >
              <FieldSelectorWithFullTextIndex
                useDataSources={ useDataSources || Immutable([]) }
                onChange={handleChooseSearchingFieldsChange}
                selectedFields={config?.searchFields || Immutable([])}
                isMultiple
                isDataSourceDropDownHidden
                useDropdown
                useMultiDropdownBottomTools
                widgetId={id}
                types={Immutable([JimuFieldType.Number, JimuFieldType.String])}
              />
            </div>
            <div title={nls('exactMatch')} aria-label={nls('exactMatch')} className='d-flex align-items-center cursor-pointer' style={{ marginTop: '10px', paddingLeft: 0, paddingRight: 0 }} onClick={() => { handleCheckboxChange('searchExact') }}>
              <Checkbox
                data-field='searchExact'
                checked={config.searchExact || false}
                aria-label={nls('exactMatch')}
              />
              <div className='text-truncate lock-item-ratio-label'>
                {nls('exactMatch')}
              </div>
            </div>
          </SettingRow>
        )}
        {config.searchOpen && (
          <SettingRow flow='wrap' label={nls('searchHint')} role='group' aria-label={nls('searchHint')}>
            <TextInput
              size='sm'
              className='search-placeholder w-100'
              placeholder={nls('search')}
              value={config?.searchHint || ''}
              onChange={onSearchPlaceholderChange}
            />
          </SettingRow>
        )}
        <SettingRow tag='label' label={nls('sort')} aria-label={nls('sort')}>
          <div className='d-flex'>
            <Switch
              checked={config.sortOpen}
              data-field='sortOpen'
              onChange={handleFormChange}
              title={nls('sort')}
            />
          </div>
        </SettingRow>
        {config.sortOpen && (
          <SettingRow flow='wrap'>
            <SortSetting
              onChange={onSettingSortChange}
              useDataSource={useDataSources && useDataSources[0]}
              value={config.sorts || Immutable([])}
            />
          </SettingRow>
        )}
        <SettingRow tag='label' label={nls('filter')} aria-label={nls('filter')}>
          <div className='d-flex'>
            <Switch
              checked={config.filterOpen}
              data-field='filterOpen'
              onChange={handleFormChange}
              title={nls('filter')}
            />
          </div>
        </SettingRow>
        {config.filterOpen && (
          <Fragment>
            <SettingRow>
              <div className='d-flex justify-content-between w-100 align-items-center'>
                <Button
                  className='w-100 text-default set-link-btn'
                  color={!datasource ? 'secondary' : 'primary'}
                  disabled={!datasource}
                  onClick={showSqlExprPopup}
                  title={nls('setFilters')}
                >
                  {nls('setFilters')}
                </Button>
              </div>
            </SettingRow>
            <SettingRow flow='wrap'>
              <SqlExpressionBuilderPopup
                dataSource={datasource}
                isOpen={isSqlExprShow}
                toggle={toggleSqlExprPopup}
                expression={config.filter}
                onChange={onSqlExprBuilderChange}
              />
            </SettingRow>
          </Fragment>
        )}
        <SettingRow tag='label' label={nls('refresh')} aria-label={nls('refresh')}>
          <Switch
            checked={config?.showRefresh}
            data-field='showRefresh'
            onChange={handleFormChange}
            title={nls('refresh')}
          />
        </SettingRow>
        {config.cardConfigs[Status.Selected].selectionMode !==
          SelectionModeType.None && (
          <Fragment>
            <SettingRow tag='label' label={nls('showSelection')} aria-label={nls('showSelection')}>
              <Switch
                checked={config.showSelectedOnlyOpen}
                data-field='showSelectedOnlyOpen'
                onChange={handleFormChange}
                title={nls('showSelection')}
              />
            </SettingRow>
            <SettingRow tag='label' label={nls('clearSelection')} aria-label={nls('clearSelection')}>
              <Switch
                checked={config.showClearSelected}
                data-field='showClearSelected'
                onChange={handleFormChange}
                title={nls('clearSelection')}
              />
            </SettingRow>
          </Fragment>
        )}
        <SettingRow tag='label' label={nls('showRecordCount')} aria-label={nls('showRecordCount')}>
          <Switch
            checked={config?.showRecordCount}
            data-field='showRecordCount'
            onChange={handleFormChange}
            title={nls('showRecordCount')}
          />
        </SettingRow>
      </CollapsablePanel>
    </SettingSection>
  )
}
export default ToolSetting