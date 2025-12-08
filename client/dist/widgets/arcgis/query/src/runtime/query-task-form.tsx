/** @jsx jsx */
import {
  React,
  jsx,
  css,
  classNames,
  type DataSource,
  type ImmutableObject,
  type IMState,
  type IMSqlExpression,
  type FeatureLayerDataSource,
  ReactRedux,
  hooks,
  DataSourceManager,
  type SqlQueryParams
} from 'jimu-core'
import { Button, Tooltip } from 'jimu-ui'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { SqlExpressionRuntime, getShownClauseNumberByExpression } from 'jimu-ui/basic/sql-expression-runtime'
import { type QueryItemType, type SpatialFilterObj, SpatialRelation, type UnitType } from '../config'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import defaultMessage from './translations/default'
import { QueryTaskSpatialForm } from './query-task-spatial-form'
import { useAutoHeight } from './useAutoHeight'
import { QueryTaskContext } from './query-task-context'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

export interface QueryTaskItemProps {
  widgetId: string
  configId: string
  spatialFilterEnabled: boolean
  datasourceReady: boolean
  outputDS?: DataSource
  onFormSubmit: (sqlExprObj: IMSqlExpression, spatialFilter: SpatialFilterObj) => void
  dataActionFilter?: SqlQueryParams
}

const getFormStyle = (isAutoHeight: boolean) => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    .form-title {
      color: var(--sys-color-surface-paper-text);
      font-weight: 500;
      font-size: 0.8125rem;
      line-height: 1.5;
    }
    .query-form__content {
      flex: 1 1 ${isAutoHeight ? 'auto' : 0};
      max-height: ${isAutoHeight ? '61.8vh' : 'none'};
      overflow: auto;
    }
  `
}

export function QueryTaskForm (props: QueryTaskItemProps) {
  const { widgetId, configId, outputDS, spatialFilterEnabled, datasourceReady, onFormSubmit, dataActionFilter } = props
  const preDataActionFilter = hooks.usePrevious(dataActionFilter)
  const queryItem: ImmutableObject<QueryItemType> = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.queryItems.find(item => item.configId === configId)
  })
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const [resetSymbol, setResetSymbol] = React.useState<symbol>(null)

  // const [dataSource, setDataSource] = React.useState<DataSource>(null)
  const {
    useAttributeFilter,
    useSpatialFilter,
    spatialFilterTypes,
    sqlExprObj,
    spatialMapWidgetIds,
    spatialInteractiveCreateToolTypes,
    spatialRelationUseDataSources,
    spatialIncludeRuntimeData,
    spatialRelations,
    spatialRelationEnableBuffer,
    spatialRelationBufferDistance,
    spatialRelationBufferUnit,
    spatialInteractiveEnableBuffer,
    spatialInteractiveBufferDistance,
    spatialInteractiveBufferUnit,
    attributeFilterLabel = getI18nMessage('attributeFilter'),
    spatialFilterLabel = getI18nMessage('spatialFilter'),
    attributeFilterDesc,
    spatialFilterDesc
  } = currentItem
  const [attributeFilterSqlExprObj, setAttributeFilterSqlExprObj] = React.useState<IMSqlExpression>(sqlExprObj)
  const spatialFilterObjRef = React.useRef<SpatialFilterObj>(null)
  const spatialRelationRef = React.useRef<SpatialRelation>(SpatialRelation.Intersect)
  const bufferRef = React.useRef<{ distance: number, unit: UnitType }>(null)
  const isAutoHeight = useAutoHeight()
  const showClauseNumber = React.useRef(getShownClauseNumberByExpression(sqlExprObj))

  const originDS = outputDS?.getOriginDataSources()[0]

  React.useEffect(() => {
    // The sqlExprObj.parts may changes but the displaySQL is the same
    if (!sqlExprObj) {
      showClauseNumber.current = 0
      setAttributeFilterSqlExprObj(null)
    } else {
      showClauseNumber.current = getShownClauseNumberByExpression(sqlExprObj)
      setAttributeFilterSqlExprObj(sqlExprObj)
    }
  }, [sqlExprObj])

  const applyQuery = React.useCallback(() => {
    // When the ‘apply’ button is clicked, it should clear the selection from the previous result list
    outputDS?.selectRecordsByIds?.([])

    if (outputDS) {
      const originDs: FeatureLayerDataSource = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
      if (originDs) {
        const dataViewConfig = originDs.getDataViewConfig()
        const maximum = dataViewConfig?.maximum
        if (maximum != null && maximum > 0) {
          DataSourceManager.getInstance().updateDataSourceByDataSourceJson(
            outputDS,
            outputDS.getDataSourceJson().setIn(['query', 'maximum'], maximum)
          )
        }
      }
    }

    let rel = spatialRelationRef.current
    if (spatialFilterObjRef.current?.geometry && rel == null) {
      rel = SpatialRelation.Intersect
    }
    if (Array.isArray(spatialFilterObjRef.current?.geometry)) {
      if (spatialFilterObjRef.current.geometry.length === 1) {
        onFormSubmit(attributeFilterSqlExprObj, { ...spatialFilterObjRef.current, geometry: spatialFilterObjRef.current.geometry[0], relation: rel, buffer: bufferRef.current })
      } else {
        loadArcGISJSAPIModules([
          'esri/geometry/operators/unionOperator'
        ]).then(modules => {
          const operator: (typeof __esri.unionOperator) = modules[0]
          const geometry = operator.executeMany(spatialFilterObjRef.current.geometry)
          onFormSubmit(attributeFilterSqlExprObj, { ...spatialFilterObjRef.current, geometry, relation: rel, buffer: bufferRef.current })
        })
      }
    } else {
      onFormSubmit(attributeFilterSqlExprObj, { ...spatialFilterObjRef.current, relation: rel, buffer: bufferRef.current })
    }
  }, [onFormSubmit, outputDS, attributeFilterSqlExprObj])

  React.useEffect(() => {
    if (!dataActionFilter) return
    if (dataActionFilter.where !== preDataActionFilter?.where) {
      applyQuery()
    }
  }, [dataActionFilter, preDataActionFilter?.where, applyQuery])

  const resetQuery = React.useCallback(() => {
    // 1. reset attribute filter
    showClauseNumber.current = getShownClauseNumberByExpression(sqlExprObj)
    setAttributeFilterSqlExprObj(sqlExprObj)
    // 2. reset spatial filter
    setResetSymbol(Symbol())
  }, [sqlExprObj])

  const handleSqlExprObjChange = React.useCallback((sqlObj: IMSqlExpression) => {
    showClauseNumber.current = getShownClauseNumberByExpression(sqlObj)
    setAttributeFilterSqlExprObj(sqlObj)
  }, [])

  const handleSpatialFilterChange = React.useCallback((filter: SpatialFilterObj) => {
    spatialFilterObjRef.current = filter
  }, [])

  const handleRelationChange = React.useCallback((rel: SpatialRelation) => {
    spatialRelationRef.current = rel
  }, [])

  const handleBufferChange = React.useCallback((distance: number, unit: UnitType) => {
    bufferRef.current = { distance, unit }
  }, [])

  const showAttributeFilter = useAttributeFilter && sqlExprObj != null
  const showSpatialFilter = spatialFilterEnabled && useSpatialFilter && (spatialFilterTypes.length > 0 || spatialIncludeRuntimeData || spatialRelationUseDataSources?.length > 0)

  return (
    <QueryTaskContext.Provider value={{ resetSymbol }}>
      <div className='query-form' css={getFormStyle(isAutoHeight)}>
        <div className='query-form__content'>
          {showAttributeFilter && (
            <div role='group' className='px-4' aria-label={attributeFilterLabel}>
              <div className={classNames('form-title my-2 d-flex align-items-center', { 'd-none': !attributeFilterLabel && !attributeFilterDesc })}>
                {attributeFilterLabel && <div className='mr-2 title2'>{attributeFilterLabel}</div>}
                {attributeFilterDesc && (
                  <Tooltip placement='bottom' css={css`white-space: pre-line;`} title={attributeFilterDesc}>
                    <Button size='sm' icon type='tertiary'><InfoOutlined color='var(--sys-color-primary-main)' size='s'/></Button>
                  </Tooltip>
                )}
              </div>
              {originDS && (
                <SqlExpressionRuntime
                  widgetId={widgetId}
                  dataSource={originDS}
                  expression={attributeFilterSqlExprObj}
                  onChange={handleSqlExprObjChange}
                />
              )}
            </div>
          )}
          {showAttributeFilter && showSpatialFilter && (
            <hr className='m-4' css={css`border: none; height: 1px; background-color: var(--sys-color-divider-secondary);`}/>
          )}
          {showSpatialFilter && (
            <QueryTaskSpatialForm
              widgetId={widgetId}
              label={spatialFilterLabel}
              desc={spatialFilterDesc}
              filterTypes={spatialFilterTypes}
              mapWidgetIds={spatialMapWidgetIds}
              createToolTypes={spatialInteractiveCreateToolTypes}
              onFilterChange={handleSpatialFilterChange}
              onRelationChange={handleRelationChange}
              onBufferChange={handleBufferChange}
              spatialRelations={spatialRelations}
              dsEnableBuffer={spatialRelationEnableBuffer}
              dsBufferDistance={spatialRelationBufferDistance}
              dsBufferUnit={spatialRelationBufferUnit}
              drawEnableBuffer={spatialInteractiveEnableBuffer}
              drawBufferDistance={spatialInteractiveBufferDistance}
              drawBufferUnit={spatialInteractiveBufferUnit}
              useDataSources={spatialRelationUseDataSources}
              useRuntimeData={spatialIncludeRuntimeData}
            />
          )}
        </div>
        <div className='query-form__actions px-4 d-flex align-items-center'>
          <Button color='primary' className='ml-auto' disabled={!datasourceReady} onClick={applyQuery}>
            {getI18nMessage('apply')}
          </Button>
          {(showClauseNumber.current > 0 || showSpatialFilter) && (
            <Button className='ml-2' onClick={resetQuery}>{getI18nMessage('reset')}</Button>
          )}
        </div>
      </div>
    </QueryTaskContext.Provider>
  )
}
