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
  type SqlQueryParams,
  Immutable
} from 'jimu-core'
import { Button, Tooltip, Checkbox } from 'jimu-ui'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { SqlExpressionRuntime, getShownClauseNumberByExpression } from 'jimu-ui/basic/sql-expression-runtime'
import { type QueryItemType, type SpatialFilterObj, SpatialRelation, type UnitType } from '../config'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import defaultMessage from './translations/default'
import { QueryTaskSpatialForm } from './query-task-spatial-form'
import { useAutoHeight } from './useAutoHeight'
import { debugLogger } from './debug-logger'
import { QueryTaskContext } from './query-task-context'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { clearSelectionInDataSources } from './selection-utils'

export interface QueryTaskItemProps {
  widgetId: string
  configId: string
  spatialFilterEnabled: boolean
  datasourceReady: boolean
  outputDS?: DataSource
  onFormSubmit: (sqlExprObj: IMSqlExpression, spatialFilter: SpatialFilterObj, zoomToSelected?: boolean) => void
  dataActionFilter?: SqlQueryParams
  initialInputValue?: string
  onHashParameterUsed?: (shortId: string) => void
  queryItemShortId?: string
}

const getFormStyle = (isAutoHeight: boolean) => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
    .form-title {
      color: var(--sys-color-surface-paper-text);
      font-weight: 500;
      font-size: 0.8125rem;
      line-height: 1.5;
    }
    .query-form__content {
      flex: 1 1 ${isAutoHeight ? 'auto' : 'auto'};
      max-height: ${isAutoHeight ? '61.8vh' : 'none'};
      overflow: auto;
      padding-bottom: 0;
    }
    .query-form__actions {
      flex-shrink: 0;
      margin-top: 0;
      padding-top: 8px;
      padding-bottom: 12px;
    }
  `
}

export function QueryTaskForm (props: QueryTaskItemProps) {
  const { widgetId, configId, outputDS, spatialFilterEnabled, datasourceReady, onFormSubmit, dataActionFilter, initialInputValue, onHashParameterUsed, queryItemShortId } = props
  const preDataActionFilter = hooks.usePrevious(dataActionFilter)
  const queryItem: ImmutableObject<QueryItemType> = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.queryItems.find(item => item.configId === configId)
  })
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const [resetSymbol, setResetSymbol] = React.useState<symbol>(null)
  // Runtime zoom preference - initialized with config value, can be overridden by user
  const [runtimeZoomToSelected, setRuntimeZoomToSelected] = React.useState<boolean>(
    queryItem?.zoomToSelected ?? true
  )

  // Sync runtime zoom preference when query item changes (e.g., switching between queries)
  React.useEffect(() => {
    setRuntimeZoomToSelected(queryItem?.zoomToSelected ?? true)
  }, [queryItem?.zoomToSelected, queryItem?.configId])

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
  const applyButtonRef = React.useRef<HTMLButtonElement>(null)
  const isAutoHeight = useAutoHeight()
  const showClauseNumber = React.useRef(getShownClauseNumberByExpression(sqlExprObj))
  const initialValueSetRef = React.useRef<string | null>(null) // Track which configId we've set the value for
  const lastValueSetRef = React.useRef<string | null>(null) // Track the last value that was set
  const hashTriggeredRef = React.useRef<boolean>(false) // Track if query was triggered via hash parameter

  const originDS = outputDS?.getOriginDataSources()[0]

  /**
   * Sets the input value from URL hash parameters when:
   * 1. Datasource is ready
   * 2. We have an initialInputValue from URL hash
   * 3. We haven't already set it for this configId, OR the value has changed
   * 
   * Uses both React state updates and DOM manipulation to ensure the value
   * is properly set in SqlExpressionRuntime's internal state.
   */
  React.useEffect(() => {
    // Reset flag if configId changed (switched to different query)
    if (initialValueSetRef.current !== null && initialValueSetRef.current !== configId) {
      initialValueSetRef.current = null
      lastValueSetRef.current = null
      hashTriggeredRef.current = false // Reset hash trigger flag when switching queries
    }
    
    // Check if value has changed for the same configId
    const valueChanged = lastValueSetRef.current !== null && 
                         lastValueSetRef.current !== initialInputValue &&
                         initialValueSetRef.current === configId
    
    // Set the value if:
    // - We haven't set it for this configId yet, OR
    // - The value has changed for the same configId (hash parameter updated)
    const shouldSetValue = datasourceReady && 
                          initialInputValue && 
                          sqlExprObj?.parts?.length > 0 &&
                          (initialValueSetRef.current !== configId || valueChanged)
    
    if (shouldSetValue) {
      const firstPart = sqlExprObj.parts[0]
      // Check if the first part is a SINGLE clause (not a SqlClauseSet)
      if (firstPart && 'type' in firstPart && firstPart.type === 'SINGLE' && 'valueOptions' in firstPart) {
        // Update the expression object with the initial value
        const updated = sqlExprObj.setIn(['parts', '0', 'valueOptions', 'value'], initialInputValue)
        setAttributeFilterSqlExprObj(updated)
        // Update clause number for the updated expression
        showClauseNumber.current = getShownClauseNumberByExpression(updated)
        initialValueSetRef.current = configId
        lastValueSetRef.current = initialInputValue
        
        // Also set the value directly on the input element after a delay to ensure component is rendered
        // This is necessary because SqlExpressionRuntime may not sync from the expression prop alone
        const timeoutId = setTimeout(() => {
          // Find the input element within SqlExpressionRuntime
          const formElement = document.querySelector(`[data-widget-id="${widgetId}"]`)?.closest('.query-form') || 
                             document.querySelector('.query-form')
          
          if (formElement) {
            // Look for text input elements
            const textInputs = formElement.querySelectorAll('input[type="text"]')
            
            textInputs.forEach((input: HTMLInputElement) => {
              // Update the value if input is empty OR if the value has changed (hash parameter updated)
              const shouldUpdate = !input.value || 
                                  input.value.trim() === '' || 
                                  input.value !== initialInputValue
              
              if (shouldUpdate) {
                // Focus the input first
                input.focus()
                
                // Set the value
                input.value = initialInputValue
                
                // Create and dispatch input event with proper properties
                const inputEvent = new Event('input', { bubbles: true, cancelable: true })
                Object.defineProperty(inputEvent, 'target', { value: input, enumerable: true })
                input.dispatchEvent(inputEvent)
                
                // Create and dispatch change event
                const changeEvent = new Event('change', { bubbles: true, cancelable: true })
                Object.defineProperty(changeEvent, 'target', { value: input, enumerable: true })
                input.dispatchEvent(changeEvent)
                
                // Also try React's synthetic event approach using native value setter
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
                if (nativeInputValueSetter) {
                  nativeInputValueSetter.call(input, initialInputValue)
                  const reactEvent = new Event('input', { bubbles: true })
                  input.dispatchEvent(reactEvent)
                }
                
                // Blur to trigger any validation or state updates
                input.blur()
              }
            })
            
            // After setting values and blurring, remove hash parameter and trigger Apply button
            setTimeout(() => {
              if (applyButtonRef.current && !applyButtonRef.current.disabled && datasourceReady) {
                // Set hashTriggeredRef to force zoom for hash-triggered queries
                hashTriggeredRef.current = true
                
                // Remove hash parameter from URL before Apply is triggered to prevent re-execution
                if (onHashParameterUsed && queryItemShortId) {
                  onHashParameterUsed(queryItemShortId)
                }

                // Auto-trigger Apply button to execute the query with the populated value
                applyButtonRef.current.click()
              }
            }, 200) // Small delay after blur to ensure state is synced
          }
        }, 500) // Longer delay to ensure component is fully rendered
        
        return () => clearTimeout(timeoutId)
      }
    }
    
    // The sqlExprObj.parts may change but the displaySQL is the same
    if (!sqlExprObj) {
      showClauseNumber.current = 0
      setAttributeFilterSqlExprObj(null)
    } else {
      showClauseNumber.current = getShownClauseNumberByExpression(sqlExprObj)
      // Only update if we haven't set the initial value for this configId yet, or if we don't have an initial value
      if (initialValueSetRef.current !== configId || !initialInputValue) {
        setAttributeFilterSqlExprObj(sqlExprObj)
      }
    }
  }, [sqlExprObj, initialInputValue, datasourceReady, configId, widgetId, onHashParameterUsed, queryItemShortId])

  const applyQuery = React.useCallback(() => {
    // When the 'apply' button is clicked, it should clear the selection from the previous result list
    clearSelectionInDataSources(outputDS)

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

    // Force zoom for hash-triggered queries, otherwise use runtime preference
    const zoomToUse = hashTriggeredRef.current ? true : runtimeZoomToSelected

    let rel = spatialRelationRef.current
    if (spatialFilterObjRef.current?.geometry && rel == null) {
      rel = SpatialRelation.Intersect
    }
    if (Array.isArray(spatialFilterObjRef.current?.geometry)) {
      if (spatialFilterObjRef.current.geometry.length === 1) {
        onFormSubmit(attributeFilterSqlExprObj, { ...spatialFilterObjRef.current, geometry: spatialFilterObjRef.current.geometry[0], relation: rel, buffer: bufferRef.current }, zoomToUse)
      } else {
        loadArcGISJSAPIModules([
          'esri/geometry/operators/unionOperator'
        ]).then(modules => {
          const operator: (typeof __esri.unionOperator) = modules[0]
          const geometry = operator.executeMany(spatialFilterObjRef.current.geometry)
          onFormSubmit(attributeFilterSqlExprObj, { ...spatialFilterObjRef.current, geometry, relation: rel, buffer: bufferRef.current }, zoomToUse)
        })
      }
    } else {
      onFormSubmit(attributeFilterSqlExprObj, { ...spatialFilterObjRef.current, relation: rel, buffer: bufferRef.current }, zoomToUse)
    }
    
    // Reset hashTriggeredRef after use
    hashTriggeredRef.current = false
  }, [onFormSubmit, outputDS, attributeFilterSqlExprObj, runtimeZoomToSelected])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && datasourceReady) {
      event.preventDefault()
      
      // Find the active input field
      const activeElement = document.activeElement as HTMLInputElement
      if (activeElement && activeElement.tagName === 'INPUT' && activeElement.type === 'text') {
        // Force blur to trigger SqlExpressionRuntime's input processing
        activeElement.blur()
        
        // Wait for blur processing, then click the Apply button
        // This uses the exact same code path as clicking the button manually
        setTimeout(() => {
          if (applyButtonRef.current && !applyButtonRef.current.disabled) {
            applyButtonRef.current.click()
          } else {
            applyQuery()
          }
        }, 200)
      } else {
        // Not in an input field, safe to apply immediately
        if (applyButtonRef.current && !applyButtonRef.current.disabled) {
          applyButtonRef.current.click()
        } else {
          applyQuery()
        }
      }
    }
  }, [datasourceReady, applyQuery])

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

  // Debug logging for form rendering
  React.useEffect(() => {
    debugLogger.log('FORM', {
      event: 'form-render-check',
      configId,
      datasourceReady,
      useAttributeFilter,
      sqlExprObj: sqlExprObj ? 'exists' : 'null',
      sqlExprObjParts: sqlExprObj?.parts?.length || 0,
      showAttributeFilter,
      originDS: originDS ? 'exists' : 'null',
      originDSId: originDS?.id || 'none',
      showSpatialFilter,
      isAutoHeight,
      outputDS: outputDS ? 'exists' : 'null'
    })
  }, [configId, datasourceReady, useAttributeFilter, sqlExprObj, showAttributeFilter, originDS, showSpatialFilter, isAutoHeight, outputDS])

  // Log when form content should render
  React.useEffect(() => {
    if (showAttributeFilter && originDS) {
      debugLogger.log('FORM', {
        event: 'attribute-filter-ready',
        configId,
        originDSId: originDS.id,
        sqlExprObjParts: sqlExprObj?.parts?.length || 0,
        attributeFilterLabel,
        note: 'Input field should be visible'
      })
    } else {
      debugLogger.log('FORM', {
        event: 'attribute-filter-not-ready',
        configId,
        showAttributeFilter,
        originDS: originDS ? 'exists' : 'null',
        useAttributeFilter,
        sqlExprObj: sqlExprObj ? 'exists' : 'null',
        reason: !showAttributeFilter ? 'showAttributeFilter is false' : 'originDS is null'
      })
    }
  }, [showAttributeFilter, originDS, configId, sqlExprObj, useAttributeFilter, attributeFilterLabel])

  // Check DOM visibility after render
  const formContentRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (formContentRef.current) {
      const computedStyle = window.getComputedStyle(formContentRef.current)
      const rect = formContentRef.current.getBoundingClientRect()
      debugLogger.log('FORM', {
        event: 'form-content-dom-check',
        configId,
        exists: !!formContentRef.current,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        height: computedStyle.height,
        maxHeight: computedStyle.maxHeight,
        flex: computedStyle.flex,
        flexBasis: computedStyle.flexBasis,
        rectHeight: rect.height,
        rectWidth: rect.width,
        isVisible: rect.height > 0 && rect.width > 0,
        parentHeight: formContentRef.current.parentElement?.clientHeight || 0
      })
    }
  }, [configId, showAttributeFilter, originDS])

  return (
    <QueryTaskContext.Provider value={{ resetSymbol }}>
      <div className='query-form' css={getFormStyle(isAutoHeight)}>
        <div ref={formContentRef} className='query-form__content' onKeyDown={handleKeyDown}>
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
                  key={`${configId}-${initialInputValue || 'default'}`}
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
          <Checkbox
            checked={runtimeZoomToSelected}
            onChange={(_, checked) => setRuntimeZoomToSelected(checked)}
            className='mr-2'
          />
          <span className='mr-auto' css={css`font-size: 0.875rem; color: var(--sys-color-text-primary);`}>
            {getI18nMessage('zoomToSelected')}
          </span>
          <Button ref={applyButtonRef} color='primary' className='ml-auto' disabled={!datasourceReady} onClick={applyQuery}>
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
