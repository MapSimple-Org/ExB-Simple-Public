/** @jsx jsx */
import {
  React,
  jsx,
  css,
  ReactRedux,
  type IMState,
  type DataSource,
  type ImmutableObject,
  type DataRecord,
  type QueryParams,
  DataSourceComponent,
  DataSourceManager,
  Immutable,
  hooks,
  MessageManager,
  DataRecordsSelectionChangeMessage,
  type FeatureDataRecord,
  type DataRecordSet,
  type FeatureLayerDataSource,
  focusElementInKeyboardMode,
  DataActionManager,
  DataLevel,
  useIntl
} from 'jimu-core'
import { Button, Icon, Tooltip, DataActionList, DataActionListStyle } from 'jimu-ui'
import { getWidgetRuntimeDataMap } from './widget-config'
import { type QueryItemType, FieldsType, PagingType, ListDirection, ResultSelectMode } from '../config'
import defaultMessage from './translations/default'
import { LazyList } from './lazy-list'
import { PagingList } from './paging-list'
import { combineFields } from './query-utils'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { ExpandAllOutlined } from 'jimu-icons/outlined/directional/expand-all'
import { CollapseAllOutlined } from 'jimu-icons/outlined/directional/collapse-all'
import { getExtraActions } from '../data-actions'
import { 
  selectRecordsInDataSources, 
  clearSelectionInDataSources, 
  selectRecordsAndPublish,
  publishSelectionMessage 
} from './selection-utils'
import { debugLogger } from './debug-logger'
import { ErrorMessage } from 'widgets/shared-code/common'
const { iconMap } = getWidgetRuntimeDataMap()

export interface QueryTasResultProps {
  widgetId: string
  resultCount: number
  maxPerPage: number
  queryParams: QueryParams
  outputDS: DataSource
  queryItem: ImmutableObject<QueryItemType>
  defaultPageSize: number
  records: DataRecord[]
  runtimeZoomToSelected?: boolean
  onNavBack: (clearResults?: boolean) => void
}

const resultStyle = css`
  display: flex;
  flex-direction: column;

  .query-result__header {
    color: var(--sys-color-surface-paper-text);
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5;
    border-bottom: 1px solid var(--sys-color-divider-secondary);
    margin-bottom: 6px;
    padding-bottom: 8px;
  }

  .query-result-container {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    overflow: auto;
    min-height: 0;
  }

  .query-result-info {
    height: 18px;
  }
`

export function QueryTaskResult (props: QueryTasResultProps) {
  const { queryItem, queryParams, resultCount, maxPerPage, records, defaultPageSize, widgetId, outputDS, runtimeZoomToSelected, onNavBack } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const intl = useIntl()
  const [queryData, setQueryData] = React.useState(null)
  const [selectedRecords, setSelectedRecords] = React.useState<DataRecord[]>([])
  const [removedRecordIds, setRemovedRecordIds] = React.useState<Set<string>>(new Set())
  
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const [expandAll, setExpandAll] = React.useState(currentItem.resultExpandByDefault ?? false)
  const backBtnRef = React.useRef<HTMLButtonElement>(undefined)
  // Track if we've already selected these records to prevent re-selection when switching tabs
  const hasSelectedRef = React.useRef(false)
  // Track the last records we selected to detect when new records come in
  const lastSelectedRecordsRef = React.useRef<string[]>([])
  // Error state for user-facing errors
  const [selectionError, setSelectionError] = React.useState<string>(null)

  const extraActions = React.useMemo(() => {
    return getExtraActions(widgetId, outputDS, intl, queryItem, runtimeZoomToSelected)
  }, [widgetId, outputDS, intl, queryItem, runtimeZoomToSelected])

  const enableDataAction = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.enableDataAction ?? true
  })

  const pagingTypeInConfig = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.resultPagingStyle
  })
  const directionTypeInConfig = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.resultListDirection
  })
  const pagingType = pagingTypeInConfig ?? PagingType.MultiPage
  const direction = directionTypeInConfig ?? ListDirection.Vertical

  const actionDataSet: DataRecordSet = React.useMemo(() => {
    const dataSet: DataRecordSet = {
      dataSource: outputDS,
      type: selectedRecords?.length > 0 ? 'selected' : 'loaded',
      records: selectedRecords?.length > 0 ? selectedRecords : (queryData?.records || []),
      name: outputDS?.id,
      label: outputDS?.getLabel()
    }
    if (currentItem.resultFieldsType === FieldsType.SelectAttributes && currentItem.resultDisplayFields != null) {
      dataSet.fields = combineFields(currentItem.resultDisplayFields, currentItem.resultTitleExpression)
    } else if (outputDS && 'getPopupInfo' in outputDS) {
      // use fields in popup template
      const popupInfo = (outputDS as FeatureLayerDataSource).getPopupInfo()
      if (popupInfo?.fieldInfos) {
        dataSet.fields = popupInfo.fieldInfos.filter((fieldInfo) => fieldInfo.visible).map((fieldInfo) => fieldInfo.fieldName)
      }
    }
    return dataSet
  }, [selectedRecords, outputDS, queryData, currentItem])

  hooks.useEffectOnce(() => {
    // focus the back button when it is rendered
    focusElementInKeyboardMode(backBtnRef.current)
  })

  /**
   * Effect hook that runs when new query results arrive.
   * Resets removed records, expand state, and query data for the new results.
   * Also handles auto-selection of records when they first arrive.
   */
  React.useEffect(() => {
    // Reset removed records when new query results come in
    setRemovedRecordIds(new Set())
    // Reset expand all to queryItem's resultExpandByDefault setting
    setExpandAll(currentItem.resultExpandByDefault ?? false)
    setQueryData({
      records,
      pageSize: defaultPageSize,
      page: 1
    })
    
    // Check if these are new records (different from what we last selected)
    const currentRecordIds = records?.map(record => record.getId()) || []
    const recordsChanged = currentRecordIds.length !== lastSelectedRecordsRef.current.length ||
      currentRecordIds.some((id, index) => id !== lastSelectedRecordsRef.current[index])
    
    // Only auto-select records if:
    // 1. We have records and outputDS
    // 2. We haven't already selected these records (hasSelectedRef is false)
    // 3. OR the records have actually changed (new query results)
    if (records && records.length > 0 && outputDS && (!hasSelectedRef.current || recordsChanged)) {
      const recordIds = records.map(record => record.getId())
      const fdr = records as FeatureDataRecord[]
      
      // Select records and publish selection message using utility function
      try {
        setSelectionError(null) // Clear previous errors
        selectRecordsAndPublish(widgetId, outputDS, recordIds, fdr)
        hasSelectedRef.current = true // Mark as selected
        lastSelectedRecordsRef.current = recordIds // Store the IDs we selected
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to select query results'
        setSelectionError(errorMessage)
        debugLogger.log('TASK', {
          event: 'selection-failed-query-result',
          error: errorMessage,
          errorStack: error instanceof Error ? error.stack : undefined,
          recordCount: recordIds.length
        })
        console.error('Error publishing selection message from query-result', error)
      }
    } else if (recordsChanged && records && records.length === 0) {
      // If records were cleared, reset the selection flag
      hasSelectedRef.current = false
      lastSelectedRecordsRef.current = []
      setSelectionError(null) // Clear errors when clearing records
    }
  }, [records, defaultPageSize, outputDS, widgetId, queryItem.configId, queryItem.resultExpandByDefault])

  React.useEffect(() => {
    // clear selection when resultSelectMode changed
    if (outputDS) {
      clearSelectionInDataSources(outputDS)
      publishSelectionMessage(widgetId, [], outputDS, true)
    }
  }, [queryItem.resultSelectMode, outputDS, widgetId])

  // Update expandAll when queryItem changes (e.g., switching between queries)
  React.useEffect(() => {
    setExpandAll(currentItem.resultExpandByDefault ?? false)
  }, [queryItem.configId, queryItem.resultExpandByDefault])

  /**
   * Clears all results. Resets local state and delegates to parent's clearResult method.
   */
  const clearResults = () => {
    // Reset local selection flags
    hasSelectedRef.current = false
    lastSelectedRecordsRef.current = []
    // Reset local query data state
    setQueryData(null)
    setRemovedRecordIds(new Set())
    // Clear error state when clearing results
    setSelectionError(null)
    // Delegate to parent's clearResult method (via onNavBack) which handles
    // clearing selection from map, publishing messages, etc.
    onNavBack(true)
  }

  const handleRenderDone = React.useCallback(({ dataItems, pageSize, page }) => {
    // Filter out removed records - check if dataItems exists first
    const filteredItems = dataItems?.filter(item => !removedRecordIds.has(item.getId())) || []
    
    setQueryData({
      records: filteredItems,
      pageSize,
      page
    })
    
    // Ensure all loaded records remain selected (for lazy loading)
    // This keeps records selected as they're loaded incrementally
    if (filteredItems && filteredItems.length > 0 && outputDS) {
      const recordIds = filteredItems.map(record => record.getId())
      const fdr = filteredItems as FeatureDataRecord[]
      
      // Select all records and publish selection message using utility function
      try {
        setSelectionError(null) // Clear previous errors
        selectRecordsAndPublish(widgetId, outputDS, recordIds, fdr)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to select query results'
        setSelectionError(errorMessage)
        debugLogger.log('TASK', {
          event: 'selection-failed-handleRenderDone',
          error: errorMessage,
          errorStack: error instanceof Error ? error.stack : undefined,
          recordCount: recordIds.length
        })
        console.error('Error publishing selection message from handleRenderDone', error)
      }
    }
  }, [outputDS, widgetId, removedRecordIds])

  const handleDataSourceInfoChange = React.useCallback(() => {
    const ds = DataSourceManager.getInstance().getDataSource(outputDS?.id)
    const records = ds?.getSelectedRecords()
    const selectedIds = ds?.getSelectedRecordIds() ?? []
    let shouldUpdate = false
    if (selectedIds.length !== selectedRecords?.length) {
      shouldUpdate = true
    } else { // equal length
      shouldUpdate = selectedIds.some(id => {
        const target = selectedRecords.find((item) => item.getId() === id)
        return target == null
      })
    }
    if (shouldUpdate) {
      setSelectedRecords(records)
    }
  }, [outputDS?.id, selectedRecords])

  /**
   * Generates the tip message showing how many features are displayed.
   * Filters out removed records to show accurate counts.
   * 
   * @returns Formatted string like "Features displayed: 118 / 121"
   */
  const getTipMessage = () => {
    if (queryData && queryData.records) {
      // Filter out removed records for display count
      const displayedRecords = queryData.records.filter((record: DataRecord) => !removedRecordIds.has(record.getId()))
      const displayedCount = displayedRecords.length
      
      if (pagingType === PagingType.LazyLoad) {
        return `${getI18nMessage('featuresDisplayed')}: ${displayedCount} / ${resultCount}`
      }
      const { page = 1, pageSize = defaultPageSize } = queryData
      const from = (page - 1) * pageSize + 1
      const to = from + pageSize - 1
      if (resultCount > 0) {
        return `${getI18nMessage('featuresDisplayed')}: ${from} - ${Math.min(to, displayedCount)} / ${resultCount}`
      }
      return `${getI18nMessage('featuresDisplayed')}: 0 - 0 / 0`
    }
    return ''
  }

  /**
   * Toggles expand/collapse state for all result items.
   * When toggled, all result items will be expanded or collapsed together.
   */
  const toggleExpandAll = React.useCallback(() => {
    setExpandAll(prev => !prev)
  }, [])

  const resultUseOutputDataSource = React.useMemo(() => {
    return Immutable({
      dataSourceId: queryItem.outputDataSourceId,
      mainDataSourceId: queryItem.outputDataSourceId
    })
  }, [queryItem?.outputDataSourceId])

  const handleEscape = React.useCallback(() => {
    focusElementInKeyboardMode(backBtnRef.current)
  }, [])

  // Keep records selected and zoom to clicked record
  // Records remain selected as long as they're in the results
  // Clicking a record always zooms to it on the map (this behavior is always enabled)
  const toggleSelection = React.useCallback((data: FeatureDataRecord) => {
    // Ensure the clicked record is selected (it should already be, but ensure it)
    const selectedDatas = outputDS.getSelectedRecords() ?? []
    const selectedIds = outputDS.getSelectedRecordIds() ?? []
    const dataId = data.getId()
    
    // If this record isn't already selected, add it to the selection
    if (!selectedIds.includes(dataId)) {
      const updatedSelectedDatas = [...selectedDatas, data]
      const recordIds = updatedSelectedDatas.map(record => record.getId())
      
      // Select records and publish selection message using utility function
      selectRecordsAndPublish(widgetId, outputDS, recordIds, updatedSelectedDatas as FeatureDataRecord[], true)
    }
    
    // Zoom to the clicked record using data actions (always enabled - user wants to keep this behavior)
    const dataSet: DataRecordSet = {
      dataSource: outputDS,
      records: [data],
      type: 'selected',
      name: outputDS.getLabel()
    }
    
    // Get available data actions and find the zoomToFeature action
    DataActionManager.getInstance().getSupportedActions(widgetId, [dataSet], DataLevel.Records)
      .then(actionCategories => {
        // Look for zoomToFeature action in any category
        let zoomAction: any = null
        for (const category in actionCategories) {
          const actions = actionCategories[category]
          zoomAction = actions.find((action: any) => action.name === 'zoomToFeature' || action.id === 'zoomToFeature')
          if (zoomAction) break
        }

        if (zoomAction) {
          // Execute the zoom action
          return DataActionManager.getInstance().executeDataAction(zoomAction, [dataSet], DataLevel.Records, widgetId)
        }
      })
      .catch(error => {
        // Silently handle errors
      })
  }, [outputDS, widgetId])

  /**
   * Removes a record from the results and selection.
   * If removing the last record, automatically clears all results
   * by calling the trash can logic (same as clicking Clear button).
   * This ensures the UI doesn't show "Features displayed: 0 / 1" when all results are removed.
   * 
   * @param data - The feature data record to remove
   */
  const removeRecord = React.useCallback((data: FeatureDataRecord) => {
    const dataId = data.getId()
    
    // Add to removed records set
    setRemovedRecordIds(prev => {
      const newSet = new Set(prev).add(dataId)
      
      // If all records are now removed, clear everything by calling trash can logic
      // Check: if the new set size equals the total result count, all records are removed
      if (newSet.size === resultCount) {
        // All records removed - clear everything (same as clicking trash can button)
        onNavBack(true)
        return newSet
      }
      
      return newSet
    })
    
    // Update queryData to filter out the removed record
    setQueryData(prevData => {
      if (!prevData) return prevData
      const filteredRecords = prevData.records.filter((record: DataRecord) => record.getId() !== dataId)
      return {
        ...prevData,
        records: filteredRecords
      }
    })
    
    const selectedDatas = outputDS.getSelectedRecords() ?? []
    const selectedIds = outputDS.getSelectedRecordIds() ?? []
    
    // Remove the record from selection
    const updatedSelectedDatas = selectedDatas.filter(record => record.getId() !== dataId)
    const recordIds = updatedSelectedDatas.map(record => record.getId())
    
    // Update selection on the origin layer and publish message using utility function
    selectRecordsAndPublish(widgetId, outputDS, recordIds, updatedSelectedDatas as FeatureDataRecord[], true)
  }, [outputDS, widgetId, resultCount, onNavBack])

  return (
    <div className='query-result h-100' css={resultStyle} role='listbox' aria-label={getI18nMessage('results')}>
      <DataSourceComponent useDataSource={resultUseOutputDataSource} onDataSourceInfoChange={handleDataSourceInfoChange} />
      
      {/* Error Message */}
      {selectionError && (
        <div css={css`padding: 0 16px; margin-top: 8px;`}>
          <ErrorMessage 
            error={selectionError} 
            onDismiss={() => setSelectionError(null)}
          />
        </div>
      )}
      
      <div className='query-result__header d-flex align-items-center mx-4'>
        <Button aria-label={getI18nMessage('back')} ref={backBtnRef} className='p-0 mr-2' size='sm' variant='text' color='inherit' icon onClick={() => { onNavBack() }}>
          <ArrowLeftOutlined autoFlip/>
        </Button>
        {currentItem.resultsLabel ?? getI18nMessage('results')}
        {(
          <React.Fragment>
            <Tooltip title={getI18nMessage('clearResult')} placement='bottom'>
              <Button className='ml-auto' icon size='sm' variant='text' color='inherit' onClick={clearResults} aria-label={getI18nMessage('clearResult')}>
                <Icon icon={iconMap.toolDelete} />
              </Button>
            </Tooltip>
            {/* Data actions filtered via manifest.json excludeDataActions - Show on Map, Select Loaded, and Clear Selection are excluded.
                Custom "Add to Map" action is provided via extraActions and uses QuerySimple's selection process. */}
            {enableDataAction && outputDS && (
              <React.Fragment>
                <div css={css`width: 1px; height: 16px; background-color: var(--sys-color-divider-input);`}></div>
                <DataActionList
                  widgetId={widgetId}
                  dataSets={[actionDataSet]}
                  listStyle={DataActionListStyle.Dropdown}
                  buttonSize='sm'
                  buttonType='tertiary'
                  extraActions={extraActions}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </div>
      <div className='query-result-container mt-1'>
        <div className='query-result-info mb-2 px-4 d-flex align-items-center justify-content-between' role='alert' aria-live='polite'>
          <span>{getTipMessage()}</span>
          <Tooltip title={expandAll ? getI18nMessage('collapseAll') : getI18nMessage('expandAll')} placement='top'>
            <Button
              size='sm'
              type='tertiary'
              icon
              onClick={toggleExpandAll}
              aria-label={expandAll ? getI18nMessage('collapseAll') : getI18nMessage('expandAll')}
            >
              {expandAll ? <CollapseAllOutlined /> : <ExpandAllOutlined />}
            </Button>
          </Tooltip>
        </div>
        {pagingType === PagingType.LazyLoad && resultCount > 0 && (
          <LazyList
            key={`lazy-${expandAll}`}
            widgetId={widgetId}
            queryItem={queryItem}
            outputDS={outputDS as any}
            queryParams={queryParams}
            resultCount={resultCount}
            records={queryData?.records?.filter((record: DataRecord) => !removedRecordIds.has(record.getId())) || (records?.filter(record => !removedRecordIds.has(record.getId())) || [])}
            direction={direction}
            onRenderDone={handleRenderDone}
            onEscape={handleEscape}
            onSelectChange={toggleSelection}
            onRemove={removeRecord}
            expandByDefault={expandAll}
          />
        )}
        {pagingType === PagingType.MultiPage && resultCount > 0 && (
          <PagingList
            key={`paging-${expandAll}`}
            widgetId={widgetId}
            queryItem={queryItem}
            outputDS={outputDS as any}
            queryParams={queryParams}
            resultCount={resultCount}
            maxPerPage={maxPerPage}
            records={queryData?.records?.filter((record: DataRecord) => !removedRecordIds.has(record.getId())) || (records?.filter(record => !removedRecordIds.has(record.getId())) || [])}
            direction={direction}
            onRenderDone={handleRenderDone}
            onEscape={handleEscape}
            defaultPageSize={defaultPageSize}
            onSelectChange={toggleSelection}
            onRemove={removeRecord}
            expandByDefault={expandAll}
          />
        )}
      </div>
    </div>
  )
}
