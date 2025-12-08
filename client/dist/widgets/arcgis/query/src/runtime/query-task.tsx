/** @jsx jsx */
import {
  React,
  jsx,
  css,
  type ImmutableObject,
  type IMSqlExpression,
  DataSourceComponent,
  type DataSource,
  type UseDataSource,
  Immutable,
  type FeatureLayerDataSource,
  classNames,
  CONSTANTS,
  type DataRecord,
  type QueryParams,
  DataSourceStatus,
  DataRecordSetChangeMessage,
  DataRecordsSelectionChangeMessage,
  RecordSetChangeType,
  MessageManager,
  type QueriableDataSource,
  type FeatureLayerQueryParams,
  hooks,
  lodash,
  DataSourceManager,
  focusElementInKeyboardMode,
  ReactRedux,
  type IMState
} from 'jimu-core'
import { Button, Tooltip, FOCUSABLE_CONTAINER_CLASS } from 'jimu-ui'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { PagingType, type QueryItemType, type SpatialFilterObj } from '../config'
import { QueryTaskForm } from './query-task-form'
import { QueryTaskResult } from './query-result'
import { DataSourceTip } from '../common/data-source-tip'
import { QueryTaskLabel } from './query-task-label'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { generateQueryParams, executeQuery, executeCountQuery } from './query-utils'
import { MenuOutlined } from 'jimu-icons/outlined/editor/menu'
import defaultMessage from './translations/default'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { useDataSourceExists } from '../common/use-ds-exists'
import { LoadingResult } from './loading-result'

export interface QueryTaskProps {
  widgetId: string
  index: number
  total: number
  queryItem: ImmutableObject<QueryItemType>
  defaultPageSize?: number
  wrappedInPopper?: boolean
  className?: string
  isInPopper?: boolean
  onNavBack?: () => void
}

const style = css`
  &.wrapped .query-form {
    height: 100%;
  }
  .query-task__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 8px;
    &:has(> .query-form__header > div:not(.d-none)), &:has(> .query-result) {
      padding-top: 16px;
    }
  }
  .query-form__header {
    display: flex;
    &.has-content {
      border-bottom: 1px solid var(--sys-color-divider-secondary);
      margin-bottom: 6px;
      padding-bottom: 8px;
    }
    .nav-action {
      flex: 1 1 0;
      overflow: hidden;
      display: flex;
      .jimu-btn {
        min-width: 26px;
      }
    }
    .result-menu {
      display: flex;
    }
  }
`

export function QueryTask (props: QueryTaskProps) {
  const { queryItem, onNavBack, total, isInPopper = false, defaultPageSize = CONSTANTS.DEFAULT_QUERY_PAGE_SIZE, wrappedInPopper = false, className = '', index, ...otherProps } = props
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const [stage, setStage] = React.useState(0)
  const [enabled, setEnabled] = React.useState(true)
  const [resultCount, setResultCount] = React.useState(0)
  const queryParamRef = React.useRef<QueryParams>(null)
  const recordsRef = React.useRef<DataRecord[]>(null)
  const [outputDS, setOutputDS] = React.useState<DataSource>(null)
  const [dataSource, setDataSource] = React.useState<DataSource>(null)
  const [spatialFilterEnabled, setSpatialFilterEnabled] = React.useState(true)
  const attributeFilterSqlExprObj = React.useRef<IMSqlExpression>(queryItem.sqlExprObj)
  const spatialFilterObj = React.useRef(null)
  const backBtnRef = React.useRef<HTMLButtonElement>(undefined)
  const [dataActionFilter, setDataActionFilter] = React.useState(null)

  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const { icon, name, displayLabel } = currentItem
  const dsExists: boolean = useDataSourceExists({ widgetId: props.widgetId, useDataSourceId: currentItem.useDataSource?.dataSourceId })

  hooks.useEffectOnce(() => {
    // focus the back button when it is rendered
    focusElementInKeyboardMode(backBtnRef.current)
  })

  const pagingTypeInConfig = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[props.widgetId]
    return widgetJson.config.resultPagingStyle
  })

  React.useEffect(() => {
    if (queryItem.useDataSource?.dataSourceId) {
      DataSourceManager.getInstance().destroyDataSource(queryItem.outputDataSourceId)
    }
  }, [queryItem.useDataSource?.dataSourceId, queryItem.outputDataSourceId])

  const useOutputDs: ImmutableObject<UseDataSource> = React.useMemo(
    () =>
      Immutable({
        dataSourceId: queryItem.outputDataSourceId,
        mainDataSourceId: queryItem.outputDataSourceId
      }),
    [queryItem.outputDataSourceId]
  )

  const updateDataSource = React.useCallback((ds?: DataSource) => {
    const currentDs = ds ?? dataSource
    // should disable spatial filter if the dataSource is an output ds and it already has spatial filter
    if (currentDs?.getDataSourceJson()?.isOutputFromWidget) {
      const qDs: QueriableDataSource = currentDs as QueriableDataSource
      const qParams = qDs.getCurrentQueryParams?.() as FeatureLayerQueryParams
      if (qParams.geometry != null) {
        setSpatialFilterEnabled(false)
      } else {
        setSpatialFilterEnabled(true)
      }
    }
  }, [dataSource])

  const handleStatusChange = React.useCallback((enabled: boolean) => {
    setEnabled(enabled)
    updateDataSource()
  }, [updateDataSource])

  const handleOutputDataSourceInfoChange = React.useCallback((info, preInfo) => {
    const outputId = queryItem.outputDataSourceId
    const filter = info?.widgetQueries ? info.widgetQueries[`setFilter-${outputId}`] : null
    if (filter == null) { // filter is null means there are incomplete queries, ignore this change
      return
    }
    const preFilter = preInfo?.widgetQueries ? preInfo.widgetQueries[`setFilter-${outputId}`] : null
    if (filter?.where !== preFilter?.where) {
      setDataActionFilter(filter)
    }
  }, [queryItem.outputDataSourceId])

  const publishDataClearedMsg = React.useCallback(async () => {
    if (!outputDS) return
    const dataRecordSetChangeMessage = new DataRecordSetChangeMessage(props.widgetId, RecordSetChangeType.Remove, [outputDS.id])
    MessageManager.getInstance().publishMessage(dataRecordSetChangeMessage)
    await MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(props.widgetId, [], [outputDS.id]))
  }, [props.widgetId, outputDS])

  const clearResult = React.useCallback(() => {
    recordsRef.current = null
    outputDS?.setStatus(DataSourceStatus.NotReady)
    setResultCount(0)
    publishDataClearedMsg()
  }, [outputDS, publishDataClearedMsg])

  const handleDataSourceCreated = React.useCallback((ds: DataSource) => {
    clearResult()
    setDataSource(ds)
    updateDataSource(ds)
    setStage(0)
  }, [updateDataSource, clearResult])

  const handleOutputDataSourceCreated = React.useCallback((ds: DataSource) => {
    setOutputDS(ds)
  }, [])

  const navToForm = React.useCallback((clearResults = false) => {
    if (clearResults) {
      recordsRef.current = null
      outputDS?.setStatus(DataSourceStatus.NotReady)
      setResultCount(0)
      publishDataClearedMsg()
    }
    setStage(0)
    lodash.defer(() => {
      focusElementInKeyboardMode(backBtnRef.current)
    })
  }, [outputDS, publishDataClearedMsg])

  const navToResult = React.useCallback(() => {
    setStage(1)
  }, [])

  const handleFormSubmit = React.useCallback(async (sqlExpr: IMSqlExpression, spatialFilter: SpatialFilterObj) => {
    attributeFilterSqlExprObj.current = sqlExpr
    spatialFilterObj.current = spatialFilter
    // Load the first page
    const featureDS = outputDS as FeatureLayerDataSource
    setStage(2)
    await publishDataClearedMsg()
    let pageSize = defaultPageSize
    if (pagingTypeInConfig === PagingType.LazyLoad) {
      pageSize = CONSTANTS.DEFAULT_QUERY_PAGE_SIZE
    }
    const queryParams = generateQueryParams(featureDS, sqlExpr, spatialFilter, currentItem, 1, pageSize)
    queryParamRef.current = queryParams
    // Change output ds status to unloaded before use it to load count/records.
    featureDS.setStatus(DataSourceStatus.Unloaded)
    featureDS.setCountStatus(DataSourceStatus.Unloaded)
    executeCountQuery(props.widgetId, featureDS, queryParams)
      .then((count) => {
        setResultCount(count)
        // update ds in order to execute query
        featureDS.updateQueryParams(queryParamRef.current, props.widgetId)
        return executeQuery(props.widgetId, queryItem, featureDS, queryParamRef.current)
      })
      .then((result) => {
        recordsRef.current = result.records
      })
      .finally(() => {
        if (spatialFilter?.layer && spatialFilter?.clearAfterApply) {
          spatialFilter.layer.removeAll()
        }
        setStage(1)
      })
  }, [currentItem, queryItem, props.widgetId, outputDS, defaultPageSize, pagingTypeInConfig, publishDataClearedMsg])

  const { useAttributeFilter, sqlExprObj, useSpatialFilter, spatialFilterTypes, spatialIncludeRuntimeData, spatialRelationUseDataSources} = currentItem
  const showAttributeFilter = useAttributeFilter && sqlExprObj != null
  const showSpatialFilter = spatialFilterEnabled && useSpatialFilter && (spatialFilterTypes.length > 0 || spatialIncludeRuntimeData || spatialRelationUseDataSources?.length > 0)

  return (
    <div className={classNames('query-task h-100 d-flex', className, { wrapped: wrappedInPopper })} css={style}>
      <div className={classNames('query-task__content', {
        'd-none': stage !== 0,
        [FOCUSABLE_CONTAINER_CLASS]: stage !== 1 && isInPopper
      })}>
        <DataSourceComponent useDataSource={useOutputDs} onDataSourceCreated={handleOutputDataSourceCreated} onDataSourceInfoChange={handleOutputDataSourceInfoChange}/>
        <div className={classNames('query-form__header mx-4 align-items-center', { 'in-popper': isInPopper, 'has-content': showAttributeFilter || showSpatialFilter })}>
          <div className={classNames('nav-action align-items-center', { 'd-none': wrappedInPopper })}>
            <Button
              className={classNames('p-0 mr-2', { 'd-none': total === 1 })}
              size='sm'
              type='tertiary'
              icon
              onClick={onNavBack}
              aria-label={getI18nMessage('back')}
              ref={backBtnRef}
            >
              <ArrowLeftOutlined autoFlip/>
            </Button>
            <QueryTaskLabel icon={icon} name={displayLabel ? name : ''} />
          </div>
          <div className={classNames('result-menu ml-auto align-items-center', { 'd-none': resultCount === 0 })}>
            <Tooltip title={getI18nMessage('checkResult')} placement='bottom'>
              <Button
                size='sm'
                type='tertiary'
                aria-label={getI18nMessage('checkResult')}
                icon
                className='py-0'
                onClick={navToResult}
              >
                <MenuOutlined />
              </Button>
            </Tooltip>
            <div css={css`width: 1px; height: 16px; background-color: var(--sys-color-divider-input);`}></div>
            <Tooltip title={getI18nMessage('clearResult')} placement='bottom'>
              <Button
                size='sm'
                type='tertiary'
                aria-label={getI18nMessage('clearResult')}
                icon
                className='py-0'
                onClick={clearResult}
              >
                <TrashOutlined />
              </Button>
            </Tooltip>
          </div>
        </div>
        {enabled && dsExists && (
          <QueryTaskForm
            {...otherProps}
            configId={queryItem.configId}
            outputDS={outputDS}
            datasourceReady={dataSource != null}
            spatialFilterEnabled={spatialFilterEnabled}
            dataActionFilter = {dataActionFilter}
            onFormSubmit={handleFormSubmit}
          />
        )}
        <DataSourceTip
          widgetId={props.widgetId}
          useDataSource={queryItem.useDataSource}
          showMessage={true}
          onStatusChange={handleStatusChange}
          onDataSourceCreated={handleDataSourceCreated}
        />
      </div>
      <div className={classNames('query-task__content', {
        'd-none': stage !== 1,
        [FOCUSABLE_CONTAINER_CLASS]: stage === 1 && isInPopper
      })}>
        <QueryTaskResult
          key={queryItem.configId}
          widgetId={props.widgetId}
          queryItem={queryItem}
          queryParams={queryParamRef.current}
          resultCount={resultCount}
          maxPerPage={(dataSource as QueriableDataSource)?.getMaxRecordCount?.()}
          records={recordsRef.current}
          defaultPageSize={defaultPageSize}
          outputDS={outputDS}
          onNavBack={navToForm}
        />
      </div>
      {stage === 2 && <LoadingResult />}
    </div>
  )
}
