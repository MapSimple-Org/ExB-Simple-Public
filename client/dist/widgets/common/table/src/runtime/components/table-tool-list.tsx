import { React, css, hooks, classNames, type ClauseValuePair, type QueriableDataSource, type DataRecord, type FeatureLayerDataSource, CONSTANTS } from 'jimu-core'
import {
  AdvancedSelect, Button, DataActionList, DataActionListStyle, Dropdown, DropdownButton, DropdownItem, DropdownMenu,
  defaultMessages as jimuUIDefaultMessages
} from 'jimu-ui'
import defaultMessages from '../translations/default'
import { LayerHonorModeType, LocationType, TableArrangeType, type LayersConfig } from '../../config'
import { Fragment } from 'react'
import { FilterByMapOutlined } from 'jimu-icons/outlined/gis/filter-by-map'
import { MenuOutlined } from 'jimu-icons/outlined/editor/menu'
import { ShowSelectionOutlined } from 'jimu-icons/outlined/editor/show-selection'
import { ClearSelectionGeneralOutlined } from 'jimu-icons/outlined/editor/clear-selection-general'
import { RefreshOutlined } from 'jimu-icons/outlined/editor/refresh'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { ListVisibleOutlined } from 'jimu-icons/outlined/editor/list-visible'
import { MoreHorizontalOutlined } from 'jimu-icons/outlined/application/more-horizontal'
import { getFilteredUseFields } from '../../utils'

interface UsedState {
  activeTabId: string
  selectQueryFlag: boolean
  tableShowColumns: ClauseValuePair[]
  mobileFlag: boolean
  emptyTable: boolean
  tableLoaded: boolean
  tableSelected: number
  allowDel: boolean
  mapFilterEnabled: boolean
  allLayersConfig: LayersConfig[]
  columns: any
  enableRelatedRecords: boolean
  enableAttachments: boolean
  setTableShowColumns: (columns: ClauseValuePair[]) => void
}

export interface TableToolListProps {
  usedState: UsedState
  curLayerConfig: LayersConfig
  usedConfig: any
  dataSource: QueriableDataSource
  dsSelection: DataRecord[]
  isMapMode: boolean
  arrangeType: TableArrangeType
  enableMapExtentFilter: boolean
  widgetId: string
  enableDataAction: boolean
  getInitFields: () => ClauseValuePair[]
  onShowSelection: () => void
  resetTable: () => void
  onTableRefresh: () => void
  onDeleteSelection: () => void
  onValueChangeFromRuntime: (valuePairs: ClauseValuePair[]) => void
  toggleMapFilter: () => void
}

const getButtonListStyles = (searchOn: boolean, horizontalTab: boolean, mobileFlag: boolean) => {
  return css`
    &.top-button-list{
      ${!searchOn && !horizontalTab && `
        position: absolute;
        right: 16px;
      `}
      ${mobileFlag ? 'display: none' : 'display: flex'};
      .top-button{
        display: inline-flex;
        button{
          width: 32px;
          height: 32px;
        }
        .map-extent-filter {
          &.active {
            color: var(--sys-color-action-selected-text);
            background-color: var(--sys-color-action-selected);
          }
        }
      }
    }
  `
}

const getDropdownListStyles = (searchOn: boolean, horizontalTab: boolean, mobileFlag: boolean) => {
  return css`
    &.dropdown-list-container{
      ${!searchOn && !horizontalTab && `
        position: absolute;
        right: 17px;
      `}
      .dropdown-list{
        ${!mobileFlag && 'display: none;'}
        width: 32px;
        height: 32px;
      }
      .horizontal-action-dropdown{
        button{
          width: 32px;
          height: 32px;
        }
      }
    }
  `
}

const TableToolList = (props: TableToolListProps) => {
  const {
    usedState, curLayerConfig, usedConfig, dataSource, dsSelection, isMapMode, arrangeType, widgetId, enableDataAction, enableMapExtentFilter,
    onShowSelection, resetTable, onTableRefresh, onDeleteSelection, onValueChangeFromRuntime, toggleMapFilter
  } = props
  const {
    activeTabId, selectQueryFlag, tableShowColumns, mobileFlag, emptyTable, tableLoaded,
    tableSelected, allowDel, mapFilterEnabled, allLayersConfig, columns, enableRelatedRecords, enableAttachments, setTableShowColumns
  } = usedState
  const { enableSelect, enableRefresh, enableShowHideColumn = true } = usedConfig
  const { enableSearch = false, searchFields = [], isFreezeFields, frozenFields, freezeLocation } = curLayerConfig
  const [tableColumnsAllFields, setTableColumnsAllFields] = React.useState<ClauseValuePair[]>()
  const [tableColumnsVisibleFields, setTableColumnsVisibleFields] = React.useState<ClauseValuePair[]>()
  const translate = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages)

  const searchOn = enableSearch && searchFields?.length !== 0
  const horizontalTab = arrangeType === TableArrangeType.Tabs
  const hasSelected = tableSelected > 0
  const showMapFilter = isMapMode && enableMapExtentFilter
  const dataSourceLabel = dataSource?.getLabel()
  const dataName = translate('tableDataActionLabel', { layer: dataSourceLabel || '' })
  const isSelectionView = dataSource?.dataViewId === CONSTANTS.SELECTION_DATA_VIEW_ID

  // use for dataActionList, need to filter out related records and attachment columns
  const actionUsedFields = React.useMemo(() => {
    const tableColumns = tableShowColumns || tableColumnsVisibleFields
    if (!tableColumns) return []
    const withoutSpecial = tableColumns.filter(item => {
      const notAttachment = item.value !== 'EsriFeatureTableAttachmentsColumn'
      const notRelationShip = item.value.toString().indexOf('EsriFeatureTableRelationshipColumn') !== 0
      return notAttachment && notRelationShip
    })
    if (isFreezeFields && frozenFields && frozenFields.length > 0) {
      const freezeItemIndex = withoutSpecial.findIndex(item => frozenFields.includes(item.value?.toString()))
      if (freezeItemIndex > -1) {
        const itemToMove = withoutSpecial.splice(freezeItemIndex, 1)[0]
        freezeLocation === LocationType.End ? withoutSpecial.push(itemToMove) : withoutSpecial.unshift(itemToMove)
      }
    }
    return withoutSpecial?.map(item => item.value?.toString())
  }, [tableShowColumns, tableColumnsVisibleFields, isFreezeFields, frozenFields, freezeLocation])

  // construct allFields and visibleFields
  // only use usedColumns to get special columns: related records and attachments
  const usedColumns = columns?.toArray()
  const usedColumnsRef = hooks.useLatest(usedColumns)
  React.useEffect(() => {
    if (!curLayerConfig?.layerHonorMode || !tableLoaded) return
    const specialColumns = []
    usedColumnsRef.current?.forEach(item => {
      const columnValue = item.name || item.fieldName
      const columnLabel = item.effectiveLabel || item.alias || item.fieldName
      const isAttachment = columnValue === 'EsriFeatureTableAttachmentsColumn'
      const isRelationShip = columnValue?.toString()?.indexOf('EsriFeatureTableRelationshipColumn') === 0
      if (isAttachment || isRelationShip) {
        specialColumns.push({
          value: columnValue,
          label: columnLabel,
          hidden: item.hidden,
          type: isAttachment ? 'attachment' : 'relationship'
        })
      }
    })
    // construct allFields and visibleFields
    const configAllFields = []
    const configVisibleFields = []
    const isHonorWebmap = curLayerConfig.layerHonorMode === LayerHonorModeType.Webmap
    if (isHonorWebmap) {
      const popupInfo = (dataSource as FeatureLayerDataSource)?.getPopupInfo?.()
      const popupAllFieldInfos = popupInfo?.fieldInfos || []
      const layerDefinition = (dataSource as FeatureLayerDataSource)?.getLayerDefinition()
      const allFieldsSchema = dataSource?.getSchema()
      const allFields = allFieldsSchema?.fields ? Object.values(allFieldsSchema?.fields) : []
      // use schemaFields to filter used fields, some field is special and invisible in schema
      const schemaFieldsKeys = Object.keys(allFieldsSchema?.fields || {})
      const filteredPopupFieldInfos = popupAllFieldInfos.filter(item => {
        return schemaFieldsKeys.includes(item.fieldName)
      })
      const useFields = layerDefinition?.fields?.length > 0 ? layerDefinition.fields : allFields
      const filteredUseFields = getFilteredUseFields(allFieldsSchema?.fields, useFields)
      if (popupAllFieldInfos?.length > 0) {
        for (const item of filteredPopupFieldInfos) {
          const colInfo = { value: item.fieldName, label: item.label }
          configAllFields.push(colInfo)
          if (item.visible) configVisibleFields.push(colInfo)
        }
      } else {
        // if popupInfo is null, use 'allFields' instead
        for (const item of filteredUseFields) {
          const colInfo = { value: item.name, label: item.alias }
          configAllFields.push(colInfo)
          configVisibleFields.push(colInfo)
        }
      }
    } else {
      for (const item of curLayerConfig.tableFields) {
        const colInfo = { value: item.name, label: item.alias }
        configAllFields.push(colInfo)
        if (item.visible) configVisibleFields.push(colInfo)
      }
    }
    specialColumns.forEach(item => {
      if (item.type === 'attachment' && enableAttachments) {
        configAllFields.push({ value: item.value, label: item.label })
        if (!item.hidden) configVisibleFields.push(item)
      } else if (item.type === 'relationship' && enableRelatedRecords) {
        configAllFields.push({ value: item.value, label: item.label })
        if (!item.hidden) configVisibleFields.push(item)
      }
    })
    setTableColumnsAllFields(configAllFields)
    setTableColumnsVisibleFields(configVisibleFields)
    setTableShowColumns(configVisibleFields)
  }, [tableLoaded, dataSource, usedColumnsRef, enableRelatedRecords, enableAttachments,
    curLayerConfig?.layerHonorMode, curLayerConfig?.tableFields, setTableShowColumns
  ])

  const customShowHideButton = () => {
    return <ListVisibleOutlined />
  }

  const customShowHideDropdownButton = () => {
    return <Fragment>
      <ListVisibleOutlined className='mr-1'/>
      {translate('showHideCols')}
    </Fragment>
  }

  const dropdownToolList = <div className='d-flex ml-2 dropdown-list-container' css={getDropdownListStyles(searchOn, horizontalTab, mobileFlag)}>
    <Dropdown size='sm' className='d-inline-flex dropdown-list'>
      <DropdownButton
        arrow={false}
        icon
        size='sm'
        title={translate('options')}
      >
        <MoreHorizontalOutlined />
      </DropdownButton>
      <DropdownMenu>
        {!isSelectionView &&
          <DropdownItem key='showSelection' onClick={onShowSelection} disabled={!tableLoaded || emptyTable || !hasSelected}>
            {selectQueryFlag ? <MenuOutlined className='mr-1'/> : <ShowSelectionOutlined className='mr-1' autoFlip/>}
            {selectQueryFlag
              ? translate('showAll')
              : translate('showSelection')
            }
          </DropdownItem>
        }
        {enableSelect &&
          <DropdownItem key='clearSelection' onClick={resetTable} disabled={!tableLoaded || emptyTable || !hasSelected}>
            <ClearSelectionGeneralOutlined className='mr-1'/>
            {translate('clearSelection')}
          </DropdownItem>
        }
        {enableRefresh &&
          <DropdownItem key='refresh' onClick={onTableRefresh} disabled={!tableLoaded || emptyTable}>
            <RefreshOutlined className='mr-1'/>
            {translate('refresh')}
          </DropdownItem>
        }
        {allowDel &&
          <DropdownItem key='delete' onClick={onDeleteSelection} disabled={!tableLoaded || emptyTable || !hasSelected}>
            <TrashOutlined className='mr-1'/>
            {translate('deleteRecords')}
          </DropdownItem>
        }
        {tableColumnsAllFields && enableShowHideColumn &&
          <AdvancedSelect
            size='sm'
            className='table-dropdown-column'
            title={translate('showHideCols')}
            arrow={false}
            isSubMenuItem={true}
            staticValues={tableColumnsAllFields}
            sortList={false}
            isMultiple
            selectedValues={tableShowColumns || tableColumnsVisibleFields}
            isEmptyOptionHidden={false}
            disabled={!tableLoaded || emptyTable}
            onChange={onValueChangeFromRuntime}
            customDropdownButtonContent={customShowHideDropdownButton}
            variant='contained'
            color='primary'
          />
        }
      </DropdownMenu>
    </Dropdown>
    {dataSource && mobileFlag &&
      <Fragment>
        {showMapFilter &&
          <Fragment>
            <span className='tool-dividing-line'></span>
            <div className={`mobile-map-button ${enableDataAction ? 'mr-2': ''}`}>
              <Button
                icon
                size='sm'
                onClick={toggleMapFilter}
                variant={'contained'}
                title={translate('enableMapExtentFilter')}
                aria-label={translate('enableMapExtentFilter')}
                disabled={!tableLoaded || emptyTable}
                aria-pressed={mapFilterEnabled}
              >
                <FilterByMapOutlined />
              </Button>
            </div>
          </Fragment>
        }
        {enableDataAction &&
          <Fragment>
            {
              allLayersConfig.map(item => {
                const isCurrentDataSource = item.id === activeTabId
                const dataActionDropdown = isCurrentDataSource && !emptyTable
                  ? <Fragment key={item.id}>
                    {!showMapFilter && <span className='tool-dividing-line'></span>}
                    <div className='horizontal-action-dropdown'>
                      <DataActionList
                        widgetId={widgetId}
                        listStyle={DataActionListStyle.Dropdown}
                        dataSets={[{ dataSource, type: 'selected', records: dsSelection, fields: actionUsedFields, name: dataName }]}
                      />
                    </div>
                  </Fragment>
                  : ''
                return dataActionDropdown
              })
            }
          </Fragment>
        }
      </Fragment>
    }
  </div>

  const buttonToolList = <div className='top-button-list' css={getButtonListStyles(searchOn, horizontalTab, mobileFlag)}>
    {!isSelectionView &&
      <div className='top-button ml-2'>
        <Button
          size='sm'
          onClick={onShowSelection}
          icon
          title={
            selectQueryFlag
              ? translate('showAll')
              : translate('showSelection')
          }
          aria-label={
            selectQueryFlag
              ? translate('showAll')
              : translate('showSelection')
          }
          disabled={!tableLoaded || emptyTable || !hasSelected}
        >
          {selectQueryFlag ? <MenuOutlined /> : <ShowSelectionOutlined autoFlip/>}
        </Button>
      </div>
    }
    {enableSelect &&
      <div className='top-button ml-2'>
        <Button
          size='sm'
          onClick={resetTable}
          icon
          title={translate('clearSelection')}
          aria-label={translate('clearSelection')}
          disabled={!tableLoaded || emptyTable || !hasSelected}
        >
          <ClearSelectionGeneralOutlined />
        </Button>
      </div>
    }
    {enableRefresh &&
      <div className='top-button ml-2'>
        <Button
          size='sm'
          onClick={onTableRefresh}
          icon
          title={translate('refresh')}
          aria-label={translate('refresh')}
          disabled={!tableLoaded || emptyTable}
        >
          <RefreshOutlined />
        </Button>
      </div>
    }
    {allowDel &&
      <div className='top-button ml-2'>
        <Button
          size='sm'
          onClick={onDeleteSelection}
          icon
          title={translate('deleteRecords')}
          aria-label={translate('deleteRecords')}
          disabled={!tableLoaded || emptyTable || !hasSelected}
        >
          <TrashOutlined />
        </Button>
      </div>
    }
    {tableColumnsAllFields && enableShowHideColumn &&
      <div className='top-button ml-2'>
        <AdvancedSelect
          size='sm'
          title={translate('showHideCols')}
          aria-label={translate('showHideCols')}
          icon={true}
          arrow={false}
          disabled={!tableLoaded || emptyTable}
          staticValues={tableColumnsAllFields}
          sortList={false}
          isMultiple
          selectedValues={tableShowColumns || tableColumnsVisibleFields}
          isEmptyOptionHidden={false}
          onChange={onValueChangeFromRuntime}
          customDropdownButtonContent={customShowHideButton}
        />
      </div>
    }
    {showMapFilter &&
      <Fragment>
        <span className='tool-dividing-line'></span>
        <div className={`top-button ${enableDataAction ? 'mr-2': ''}`}>
          <Button
            icon
            size='sm'
            onClick={toggleMapFilter}
            variant={'contained'}
            className={classNames('map-extent-filter', { active: mapFilterEnabled })}
            title={translate('enableMapExtentFilter')}
            aria-label={translate('enableMapExtentFilter')}
            disabled={!tableLoaded || emptyTable}
            aria-pressed={mapFilterEnabled}
          >
            <FilterByMapOutlined />
          </Button>
        </div>
      </Fragment>
    }
    {dataSource && !mobileFlag && enableDataAction &&
      // To deal with the set filter turning off when switching tabs
      <Fragment>
        {
          allLayersConfig.map(item => {
            const isCurrentDataSource = item.id === activeTabId
            const dataActionDropdown = isCurrentDataSource && !emptyTable
              ? <Fragment key={item.id}>
                {!showMapFilter && <span className='tool-dividing-line'></span>}
                <div className='top-button data-action-btn'>
                  <DataActionList
                    widgetId={widgetId}
                    listStyle={DataActionListStyle.Dropdown}
                    dataSets={[{ dataSource, type: 'selected', records: dsSelection, fields: actionUsedFields, name: dataName }]}
                  />
                </div>
              </Fragment>
              : ''
            return dataActionDropdown
          })
        }
      </Fragment>
    }
  </div>

  return mobileFlag ? dropdownToolList : buttonToolList
}

export default TableToolList
