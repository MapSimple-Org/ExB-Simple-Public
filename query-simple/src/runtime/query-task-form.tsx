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
import { sanitizeSqlExpression, isQueryInputValid } from './query-utils'
import defaultMessage from './translations/default'
import { QueryTaskSpatialForm } from './query-task-spatial-form'
import { useAutoHeight } from './useAutoHeight'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

import { QueryTaskContext } from './query-task-context'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { clearSelectionInDataSources } from './selection-utils'

/**
 * Event-Driven Hash Parameter Execution Pattern
 * 
 * CRITICAL: This is the ONLY execution path for hash-triggered queries.
 * 
 * Flow:
 * 1. Hash value set in state as STRING (e.g., "5568900000")
 * 2. DOM manipulation triggers SqlExpressionRuntime to process the value
 * 3. SqlExpressionRuntime converts string → array format [{value: "...", label: "..."}]
 * 4. handleSqlExprObjChange detects conversion → dispatches QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT
 * 5. Event listener in query-task.tsx executes query (OR handleSqlExprObjChange calls applyQuery directly)
 * 
 * WHY THIS PATTERN EXISTS:
 * - SqlExpressionRuntime ONLY fires onChange when value is converted to array format
 * - Queries REQUIRE array format - executing with string format returns unfiltered results (1000 records)
 * - We MUST wait for conversion before executing queries
 * 
 * ANTI-PATTERN TO AVOID:
 * - DO NOT add useEffect hooks that execute queries based on string values
 * - DO NOT execute queries before QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT is dispatched
 * - DO NOT circumvent the event-driven flow with early execution checks
 * 
 * If you need to execute a query, wait for the conversion event or call applyQuery()
 * AFTER handleSqlExprObjChange has detected the conversion and dispatched the event.
 */
const QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT = 'querysimple-hash-value-converted'

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
  activeTab?: 'query' | 'results'
  onTabChange?: (tab: 'query' | 'results') => void
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
      margin-top: 0 !important;
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
      padding-top: 4px;
    }
  `
}

export function QueryTaskForm (props: QueryTaskItemProps) {
  const { widgetId, configId, outputDS, spatialFilterEnabled, datasourceReady, onFormSubmit, dataActionFilter, initialInputValue, onHashParameterUsed, queryItemShortId, activeTab, onTabChange } = props
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
  // Ref to track current SQL expression for synchronous access in applyQuery
  // This ensures hash values are immediately available when Apply is clicked
  const attributeFilterSqlExprObjRef = React.useRef<IMSqlExpression>(sqlExprObj)
  const spatialFilterObjRef = React.useRef<SpatialFilterObj>(null)
  const spatialRelationRef = React.useRef<SpatialRelation>(SpatialRelation.Intersect)
  const bufferRef = React.useRef<{ distance: number, unit: UnitType }>(null)
  const applyButtonRef = React.useRef<HTMLButtonElement>(null)
  const formContentRef = React.useRef<HTMLDivElement>(null)
  const sqlExprRuntimeContainerRef = React.useRef<HTMLDivElement>(null) // Container for SqlExpressionRuntime DOM manipulation
  const isAutoHeight = useAutoHeight()
  const showClauseNumber = React.useRef(getShownClauseNumberByExpression(sqlExprObj))
  const initialValueSetRef = React.useRef<string | null>(null) // Track which configId we've set the value for
  const lastValueSetRef = React.useRef<string | null>(null) // Track the last value that was set
  const hashTriggeredRef = React.useRef<boolean>(false) // Track if query was triggered via hash parameter
  const previousConfigIdRef = React.useRef<string | null>(null) // Track previous configId to detect query switches
  const [isTypingValid, setIsTypingValid] = React.useState<boolean>(false)

  // Monitor focus and input events within the query form
  React.useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT') {
        const val = (target as HTMLInputElement).value
        setIsTypingValid(isQueryInputValid(val))
        debugLogger.log('FORM', {
          event: 'input-focused',
          configId,
          tagName: target.tagName,
          type: (target as HTMLInputElement).type,
          value: val
        })
      }
    }

    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT') {
        const val = (target as HTMLInputElement).value
        const isValid = isQueryInputValid(val)
        setIsTypingValid(isValid)
        debugLogger.log('FORM', {
          event: 'input-typing',
          configId,
          value: val,
          isTypingValid: isValid
        })
      }
    }

    const handleFocusOut = (e: FocusEvent) => {
      // Small delay to allow state to catch up
      setTimeout(() => {
        setIsTypingValid(false)
      }, 50)
    }

    const container = formContentRef.current
    if (container) {
      container.addEventListener('focusin', handleFocus)
      container.addEventListener('input', handleInput)
      container.addEventListener('focusout', handleFocusOut)
    }

    return () => {
      if (container) {
        container.removeEventListener('focusin', handleFocus)
        container.removeEventListener('input', handleInput)
        container.removeEventListener('focusout', handleFocusOut)
      }
    }
  }, [configId])

  // Check if any attribute filter input is valid
  const isInputValid = React.useMemo(() => {
    // If the user is currently typing something valid, the form is valid
    if (isTypingValid) {
      debugLogger.log('FORM', {
        event: 'validation-check-instant',
        configId,
        isValid: true
      })
      return true
    }

    if (!attributeFilterSqlExprObj?.parts || attributeFilterSqlExprObj.parts.length === 0) {
      return true // If no parts, we assume it's valid (e.g. spatial-only query)
    }
    
    // Check if at least one SINGLE part has a valid value
    const hasValidValue = attributeFilterSqlExprObj.parts.some(part => {
      // Accessing Immutable structures requires care. If dot notation fails, 
      // the framework components might be using .get() or other methods.
      // We'll be inclusive here: if it's not a SINGLE part, we treat it as valid.
      if (part.type === 'SINGLE') {
        const val = part.valueOptions?.value
        const source = part.valueOptions?.source
        
        // If the source is NOT 'USER_INPUT', it's likely a list/dropdown (UNIQUE_VALUES, FIELD_VALUE)
        // We also check for part.dataSource which is common for list-based selections
        // We treat these as "List" types which are exempted from the empty-string rule.
        const isList = (source && source !== 'USER_INPUT') || (part.dataSource?.source)
        
        const isValid = isQueryInputValid(val, !!isList)
        
        debugLogger.log('FORM', {
          event: 'validation-check-detail',
          configId,
          partType: part.type,
          source,
          hasDataSource: !!part.dataSource,
          dataSourceSource: part.dataSource?.source,
          isList: !!isList,
          value: val,
          isValid
        })
        
        debugLogger.log('FORM', {
          event: 'validation-check',
          configId,
          partType: part.type,
          source,
          isList,
          value: val,
          valueType: typeof val,
          isValid
        })
        
        return isValid
      }
      return true 
    })

    return hasValidValue
  }, [attributeFilterSqlExprObj, configId, isTypingValid])

  const originDS = outputDS?.getOriginDataSources()[0]

  // Track configId changes (query switches)
  React.useEffect(() => {
    debugLogger.log('FORM', {
      event: 'configId-changed',
      configId,
      previousConfigId: initialValueSetRef.current,
      initialInputValue,
      timestamp: Date.now()
    })
  }, [configId, initialInputValue, datasourceReady, outputDS, widgetId, hashTriggeredRef])

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
    debugLogger.log('FORM', {
      event: 'initialInputValue-prop-received',
      configId,
      initialInputValue,
      datasourceReady,
      hasSqlExprObj: !!sqlExprObj,
      sqlExprObjPartsLength: sqlExprObj?.parts?.length,
      initialValueSetRef: initialValueSetRef.current,
      willProcess: datasourceReady && initialInputValue && sqlExprObj?.parts?.length > 0,
      timestamp: Date.now()
    })
    
    debugLogger.log('HASH-FIRST-LOAD', {
      event: 'form-initialInputValue-received',
      configId,
      initialInputValue,
      datasourceReady,
      hasOutputDS: !!outputDS,
      hasSqlExprObj: !!sqlExprObj,
      sqlExprObjPartsLength: sqlExprObj?.parts?.length,
      initialValueSetRef: initialValueSetRef.current,
      lastValueSetRef: lastValueSetRef.current,
      hashTriggeredRef: hashTriggeredRef.current,
      currentStateValue: attributeFilterSqlExprObj?.parts?.[0]?.valueOptions?.value,
      willProcess: datasourceReady && outputDS && initialInputValue && sqlExprObj?.parts?.length > 0,
      timestamp: Date.now()
    })
    
    // Reset flag if configId changed (switched to different query)
    if (initialValueSetRef.current !== null && initialValueSetRef.current !== configId) {
      initialValueSetRef.current = null
      lastValueSetRef.current = null
      hashTriggeredRef.current = false // Reset hash trigger flag when switching queries
      debugLogger.log('FORM', {
        event: 'hashTriggeredRef-reset',
        configId,
        reason: 'switching-queries',
        timestamp: Date.now()
      })
      setIsTypingValid(false) // Reset typing validation
    }
    
    // Check if value has changed for the same configId
    const valueChanged = lastValueSetRef.current !== null && 
                         lastValueSetRef.current !== initialInputValue &&
                         initialValueSetRef.current === configId
    
    // DIAGNOSTIC (r018.112): Prove hypothesis about shouldSetValue logic
    debugLogger.log('HASH-EXEC', {
      event: 'form-shouldSetValue-calculation',
      configId,
      initialInputValue,
      CONDITIONS: {
        datasourceReady,
        hasOutputDS: !!outputDS,
        hasInitialInputValue: !!initialInputValue,
        hasSqlExprObjParts: !!(sqlExprObj?.parts?.length > 0)
      },
      REFS: {
        initialValueSetRef: initialValueSetRef.current,
        lastValueSetRef: lastValueSetRef.current,
        previousConfigIdRef: previousConfigIdRef.current
      },
      LOGIC_BREAKDOWN: {
        'initialValueSetRef !== configId': initialValueSetRef.current !== configId,
        'lastValueSetRef !== null': lastValueSetRef.current !== null,
        'lastValueSetRef !== initialInputValue': lastValueSetRef.current !== initialInputValue,
        'initialValueSetRef === configId': initialValueSetRef.current === configId,
        'valueChanged (all 3 above AND)': valueChanged,
        'FINAL: configId-mismatch OR valueChanged': (initialValueSetRef.current !== configId || valueChanged)
      },
      BREAKDOWN_BASE_CONDITIONS: {
        datasourceReady,
        'has-initialInputValue': !!initialInputValue,
        'has-sqlExprObj-parts': !!(sqlExprObj?.parts?.length > 0),
        'ref-check': (initialValueSetRef.current !== configId || valueChanged),
        'baseConditions (all 4 AND)': (datasourceReady && initialInputValue && (sqlExprObj?.parts?.length > 0) && (initialValueSetRef.current !== configId || valueChanged))
      },
      timestamp: Date.now()
    })
    
    // Set the value if:
    // - We haven't set it for this configId yet, OR
    // - The value has changed for the same configId (hash parameter updated)
    // FIX (r018.112): Differentiate first load from mid-session hash changes
    // First load: Require outputDS to avoid race condition (r018.109)
    // Mid-session: Use old logic that worked before r018.109
    const isFirstLoad = initialValueSetRef.current === null
    const baseConditions = datasourceReady && 
                          initialInputValue && 
                          sqlExprObj?.parts?.length > 0 &&
                          (initialValueSetRef.current !== configId || valueChanged)
    
    const shouldSetValue = isFirstLoad 
      ? (baseConditions && !!outputDS)  // First load: strict check (prevents race), !! forces boolean
      : baseConditions                   // Mid-session: old logic (works fine)
    
    // DIAGNOSTIC (r018.112): Log final result
    debugLogger.log('HASH-EXEC', {
      event: 'form-shouldSetValue-result',
      configId,
      initialInputValue,
      isFirstLoad,
      shouldSetValue,
      reason: !shouldSetValue ? 
        (!datasourceReady ? 'datasourceReady-false' :
         !outputDS && isFirstLoad ? 'outputDS-null-on-first-load' :
         !initialInputValue ? 'initialInputValue-null' :
         !(sqlExprObj?.parts?.length > 0) ? 'no-sqlExprObj-parts' :
         'ref-conditions-not-met') : 'all-conditions-met',
      timestamp: Date.now()
    })
    
    if (shouldSetValue) {
      // FIX (r018.113): Remove tab switch logic - SqlExpressionRuntime works regardless of active tab
      // Setting value in React state is sufficient; onChange will fire when component processes it
      
      debugLogger.log('FORM', {
        event: 'hash-value-setting-start',
        configId,
        initialInputValue,
        initialValueSetRef: initialValueSetRef.current,
        valueChanged,
        hashTriggeredRefBefore: hashTriggeredRef.current,
        sqlExprObjPartsLength: sqlExprObj?.parts?.length,
        activeTab,
        timestamp: Date.now()
      })
      
      debugLogger.log('HASH-FIRST-LOAD', {
        event: 'form-hash-value-setting-start',
        configId,
        initialInputValue,
        initialValueSetRef: initialValueSetRef.current,
        lastValueSetRef: lastValueSetRef.current,
        valueChanged,
        hashTriggeredRefBefore: hashTriggeredRef.current,
        datasourceReady,
        hasOutputDS: !!outputDS,
        sqlExprObjPartsLength: sqlExprObj?.parts?.length,
        activeTab,
        timestamp: Date.now()
      })
      
      // Set hashTriggeredRef IMMEDIATELY when setting hash value
      // This ensures handleSqlExprObjChange can detect hash-triggered conversions
      hashTriggeredRef.current = true
      debugLogger.log('FORM', {
        event: 'hashTriggeredRef-set-true',
        configId,
        initialInputValue,
        timestamp: Date.now()
      })
      
      debugLogger.log('HASH-FIRST-LOAD', {
        event: 'form-hashTriggeredRef-set-true',
        configId,
        initialInputValue,
        hashTriggeredRefAfter: hashTriggeredRef.current,
        timestamp: Date.now()
      })
      
      const firstPart = sqlExprObj.parts[0]
      // Check if the first part is a SINGLE clause (not a SqlClauseSet)
      if (firstPart && 'type' in firstPart && firstPart.type === 'SINGLE' && 'valueOptions' in firstPart) {
        // Update the expression object with the initial value
        const updated = sqlExprObj.setIn(['parts', '0', 'valueOptions', 'value'], initialInputValue)
        
        debugLogger.log('FORM', {
          event: 'hash-value-setting-react-state',
          configId,
          initialInputValue,
          previousStateValue: attributeFilterSqlExprObj?.parts?.[0]?.valueOptions?.value,
          newStateValue: updated?.parts?.[0]?.valueOptions?.value,
          willCallSetState: true,
          note: 'Setting value in React state - SqlExpressionRuntime should receive via expression prop'
        })
        
        setAttributeFilterSqlExprObj(updated)
        // Update ref immediately for synchronous access in applyQuery
        attributeFilterSqlExprObjRef.current = updated
        
        debugLogger.log('FORM', {
          event: 'hash-value-ref-updated',
          configId,
          initialInputValue,
          refValueAfterUpdate: attributeFilterSqlExprObjRef.current?.parts?.[0]?.valueOptions?.value,
          timestamp: Date.now()
        })
        // Update clause number for the updated expression
        showClauseNumber.current = getShownClauseNumberByExpression(updated)
        
        // FIX (r018.113): Set tracking refs immediately after setting React state
        // These refs prevent re-setting the same value and track what we've processed
        initialValueSetRef.current = configId
        lastValueSetRef.current = initialInputValue
        
        // FIX (r018.123): MutationObserver will watch for input field and populate it using focus/blur cycle
        // The flow is: setState → SqlExpressionRuntime remounts → MutationObserver detects input[type="text"] → 
        // focus → set value → dispatch events → blur → SqlExpressionRuntime.onChange fires naturally →
        // handleSqlExprObjChange detects string→array conversion → fires QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT →
        // query-task.tsx event listener executes query (event-driven pattern from r018.108)
        debugLogger.log('FORM', {
          event: 'hash-value-state-set-awaiting-dom-population',
          configId,
          initialInputValue,
          hashTriggeredRef: hashTriggeredRef.current,
          note: 'Value set in React state - MutationObserver will populate input[type="text"] using focus/blur cycle',
          timestamp: Date.now()
        })
      }
    }
    
    // The sqlExprObj.parts may change but the displaySQL is the same
    if (!sqlExprObj) {
      showClauseNumber.current = 0
      setAttributeFilterSqlExprObj(null)
      attributeFilterSqlExprObjRef.current = null
      
      debugLogger.log('FORM', {
        event: 'sqlExprObj-cleared',
        configId,
        timestamp: Date.now()
      })
    } else {
      showClauseNumber.current = getShownClauseNumberByExpression(sqlExprObj)
      
      // Check if we already have a value set (from user input or hash)
      const currentValue = attributeFilterSqlExprObj?.parts?.[0]?.valueOptions?.value
      const refValue = attributeFilterSqlExprObjRef.current?.parts?.[0]?.valueOptions?.value
      const baseValue = sqlExprObj?.parts?.[0]?.valueOptions?.value
      const hasValueSet = currentValue !== undefined && currentValue !== null && currentValue !== ''
      const hasRefValue = refValue !== undefined && refValue !== null && refValue !== ''
      const configIdChanged = previousConfigIdRef.current !== null && previousConfigIdRef.current !== configId
      const hashWasProcessed = initialValueSetRef.current === configId
      
      // FIX (r018.115): Preserve hash-set values even after cleanup clears initialInputValue
      // Check both state AND ref for value presence (ref updates before state in same render)
      // Only update if:
      // 1. We haven't set a value yet (no value in current state OR ref), AND
      // 2. We haven't already processed a hash for this configId, OR
      // 3. configId changed (switching queries - reset to base sqlExprObj)
      // Otherwise, preserve the existing value as a visual record
      if ((!hasValueSet && !hasRefValue && !hashWasProcessed) || configIdChanged) {
        setAttributeFilterSqlExprObj(sqlExprObj)
        attributeFilterSqlExprObjRef.current = sqlExprObj
        
        debugLogger.log('FORM', {
          event: 'sqlExprObj-updated-ref',
          configId,
          previousConfigId: previousConfigIdRef.current,
          initialInputValue,
          initialValueSetRef: initialValueSetRef.current,
          hasValueSet,
          hasRefValue,
          hashWasProcessed,
          configIdChanged,
          previousValue: currentValue,
          refValue: refValue,
          newValue: baseValue,
          reason: configIdChanged ? 'configId-changed-resetting' : 'no-value-set-initializing',
          timestamp: Date.now()
        })
      } else {
        debugLogger.log('FORM', {
          event: 'sqlExprObj-skipped-ref-update',
          configId,
          previousConfigId: previousConfigIdRef.current,
          initialInputValue,
          initialValueSetRef: initialValueSetRef.current,
          hasValueSet,
          hasRefValue,
          hashWasProcessed,
          currentValue,
          refValue,
          baseValue,
          reason: hashWasProcessed ? 'hash-value-already-processed-preserving' : 
                  hasRefValue ? 'ref-value-already-set-preserving' :
                  'value-already-set-preserving-as-visual-record',
          note: 'Skipping update to preserve user-entered or hash-set value as visual record',
          timestamp: Date.now()
        })
      }
      
      // Update previousConfigIdRef for next comparison
      previousConfigIdRef.current = configId
    }
  }, [sqlExprObj, initialInputValue, datasourceReady, outputDS, configId, widgetId, onHashParameterUsed, queryItemShortId, activeTab, onTabChange])
  
  // Keep ref in sync with state changes (for SqlExpressionRuntime updates)
  React.useEffect(() => {
    attributeFilterSqlExprObjRef.current = attributeFilterSqlExprObj
    
    // Log when state changes - this is what SqlExpressionRuntime receives via expression prop
    debugLogger.log('FORM', {
      event: 'attributeFilterSqlExprObj-state-changed',
      configId,
      stateValue: attributeFilterSqlExprObj?.parts?.[0]?.valueOptions?.value,
      stateValueType: typeof attributeFilterSqlExprObj?.parts?.[0]?.valueOptions?.value,
      isArray: Array.isArray(attributeFilterSqlExprObj?.parts?.[0]?.valueOptions?.value),
      hashTriggeredRef: hashTriggeredRef.current,
      initialInputValue,
      note: 'React state changed - SqlExpressionRuntime should receive this via expression prop'
    })
  }, [attributeFilterSqlExprObj, configId, initialInputValue])

  const applyQuery = React.useCallback(() => {
    debugLogger.log('HASH-FIRST-LOAD', {
      event: 'form-applyQuery-EXECUTING',
      configId,
      initialInputValue,
      hashTriggeredRef: hashTriggeredRef.current,
      runtimeZoomToSelected,
      willZoom: hashTriggeredRef.current ? true : runtimeZoomToSelected,
      currentValue: attributeFilterSqlExprObjRef.current?.parts?.[0]?.valueOptions?.value,
      timestamp: Date.now()
    })
    
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

    // Sanitize user input before submission
    // Read from ref to get the latest value synchronously (including hash values)
    const currentSqlExprObj = attributeFilterSqlExprObjRef.current
    const currentRefValue = currentSqlExprObj?.parts?.[0]?.valueOptions?.value
    
    debugLogger.log('FORM', {
      event: 'applyQuery-executing',
      configId,
      initialInputValue,
      currentRefValue,
      refHasValue: !!currentRefValue,
      hashTriggered: hashTriggeredRef.current,
      timestamp: Date.now()
    })
    
    const sanitizedSqlExprObj = sanitizeSqlExpression(currentSqlExprObj)
    
    // Log the sanitized expression to see if value was preserved
    const sanitizedValue = sanitizedSqlExprObj?.parts?.[0]?.valueOptions?.value
    debugLogger.log('FORM', {
      event: 'applyQuery-after-sanitize',
      configId,
      currentRefValue,
      sanitizedValue,
      valuesMatch: currentRefValue === sanitizedValue,
      sanitizedValueType: typeof sanitizedValue,
      currentRefValueType: typeof currentRefValue,
      isArrayCurrent: Array.isArray(currentRefValue),
      isArraySanitized: Array.isArray(sanitizedValue),
      timestamp: Date.now()
    })

    let rel = spatialRelationRef.current
    if (spatialFilterObjRef.current?.geometry && rel == null) {
      rel = SpatialRelation.Intersect
    }
    debugLogger.log('HASH-FIRST-LOAD', {
      event: 'form-about-to-call-onFormSubmit',
      configId,
      initialInputValue,
      sanitizedValue,
      hasSpatialGeometryArray: Array.isArray(spatialFilterObjRef.current?.geometry),
      spatialGeometryCount: Array.isArray(spatialFilterObjRef.current?.geometry) ? spatialFilterObjRef.current.geometry.length : 0,
      zoomToUse,
      timestamp: Date.now()
    })
    
    if (Array.isArray(spatialFilterObjRef.current?.geometry)) {
      if (spatialFilterObjRef.current.geometry.length === 1) {
        debugLogger.log('HASH-FIRST-LOAD', {
          event: 'form-calling-onFormSubmit-single-geometry',
          configId,
          timestamp: Date.now()
        })
        onFormSubmit(sanitizedSqlExprObj, { ...spatialFilterObjRef.current, geometry: spatialFilterObjRef.current.geometry[0], relation: rel, buffer: bufferRef.current }, zoomToUse)
      } else {
        debugLogger.log('HASH-FIRST-LOAD', {
          event: 'form-calling-onFormSubmit-multiple-geometry-union',
          configId,
          timestamp: Date.now()
        })
        loadArcGISJSAPIModules([
          'esri/geometry/operators/unionOperator'
        ]).then(modules => {
          const operator: (typeof __esri.unionOperator) = modules[0]
          const geometry = operator.executeMany(spatialFilterObjRef.current.geometry)
          onFormSubmit(sanitizedSqlExprObj, { ...spatialFilterObjRef.current, geometry, relation: rel, buffer: bufferRef.current }, zoomToUse)
        })
      }
    } else {
      debugLogger.log('HASH-FIRST-LOAD', {
        event: 'form-calling-onFormSubmit-no-spatial-geometry',
        configId,
        timestamp: Date.now()
      })
      onFormSubmit(sanitizedSqlExprObj, { ...spatialFilterObjRef.current, relation: rel, buffer: bufferRef.current }, zoomToUse)
    }
    
    // Reset hashTriggeredRef after use
    hashTriggeredRef.current = false
    debugLogger.log('FORM', {
      event: 'hashTriggeredRef-reset-after-apply',
      configId,
      timestamp: Date.now()
    })
  }, [onFormSubmit, outputDS, runtimeZoomToSelected])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && datasourceReady && isInputValid) {
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
  }, [datasourceReady, applyQuery, isInputValid])

  React.useEffect(() => {
    if (!dataActionFilter) return
    if (dataActionFilter.where !== preDataActionFilter?.where) {
      // Log state when dataActionFilter changes (query switch)
      const currentRefValue = attributeFilterSqlExprObjRef.current?.parts?.[0]?.valueOptions?.value
      const hasPendingHashValue = initialInputValue && 
                                  (initialValueSetRef.current !== configId || 
                                   currentRefValue !== initialInputValue)
      
      debugLogger.log('FORM', {
        event: 'dataActionFilter-changed-auto-trigger',
        configId,
        previousWhere: preDataActionFilter?.where,
        newWhere: dataActionFilter.where,
        initialInputValue,
        initialValueSetRef: initialValueSetRef.current,
        currentRefValue,
        hasPendingHashValue,
        willCallApplyQuery: !hasPendingHashValue,
        timestamp: Date.now()
      })
      
      applyQuery()
    }
  }, [dataActionFilter, preDataActionFilter?.where, applyQuery, initialInputValue, configId])

  const resetQuery = React.useCallback(() => {
    // 1. reset attribute filter
    showClauseNumber.current = getShownClauseNumberByExpression(sqlExprObj)
    setAttributeFilterSqlExprObj(sqlExprObj)
    // 2. reset spatial filter
    setResetSymbol(Symbol())
  }, [sqlExprObj])

  const handleSqlExprObjChange = React.useCallback((sqlObj: IMSqlExpression) => {
    // LOG AT THE VERY START
    const sqlObjValue = sqlObj?.parts?.[0]?.valueOptions?.value
    const previousRefValue = attributeFilterSqlExprObjRef.current?.parts?.[0]?.valueOptions?.value
    const previousStateValue = attributeFilterSqlExprObj?.parts?.[0]?.valueOptions?.value
    
    // Check if this is from user typing or prop change
    const isFromUserTyping = typeof previousRefValue === 'string' && 
                             typeof sqlObjValue === 'object' && 
                             Array.isArray(sqlObjValue) &&
                             sqlObjValue[0]?.value === previousRefValue
    const isFromPropChange = JSON.stringify(previousStateValue) === JSON.stringify(sqlObjValue)
    
    debugLogger.log('FORM', {
      event: 'handleSqlExprObjChange-called',
      configId,
      sqlObjExists: !!sqlObj,
      initialInputValue,
      hashTriggeredRef: hashTriggeredRef.current,
      sqlObjValue,
      sqlObjValueType: typeof sqlObjValue,
      sqlObjIsArray: Array.isArray(sqlObjValue),
      previousRefValue,
      previousStateValue,
      isFromUserTyping,
      isFromPropChange,
      triggerSource: isFromUserTyping ? 'user-typing' : (isFromPropChange ? 'prop-change' : 'unknown'),
      timestamp: Date.now()
    })
    
    debugLogger.log('HASH-FIRST-LOAD', {
      event: 'form-handleSqlExprObjChange-CALLED',
      configId,
      initialInputValue,
      hashTriggeredRef: hashTriggeredRef.current,
      datasourceReady,
      hasOutputDS: !!outputDS,
      sqlObjValue,
      sqlObjValueType: typeof sqlObjValue,
      isArray: Array.isArray(sqlObjValue),
      previousRefValue,
      previousRefValueType: typeof previousRefValue,
      valueChangedFromStringToArray: typeof previousRefValue === 'string' && Array.isArray(sqlObjValue),
      timestamp: Date.now()
    })
    
    const firstPart = sqlObj?.parts?.[0]
    const value = firstPart?.type === 'SINGLE' ? (firstPart as any).valueOptions?.value : 'not-single'
    
    debugLogger.log('FORM', {
      event: 'sql-expression-changed',
      configId,
      partsCount: sqlObj?.parts?.length || 0,
      firstPartValue: value,
      hashTriggeredRefValue: hashTriggeredRef.current,
      initialInputValue: initialInputValue,
      isArrayFormat: Array.isArray(value),
      timestamp: Date.now()
    })
    
    showClauseNumber.current = getShownClauseNumberByExpression(sqlObj)
    setAttributeFilterSqlExprObj(sqlObj)
    
    // Check if this is a hash-triggered conversion (string -> array)
    // When hash value changes for same configId, SqlExpressionRuntime converts string to array format
    if (firstPart?.type === 'SINGLE' && firstPart?.valueOptions?.value) {
      const value = firstPart.valueOptions.value
      const isArrayFormat = Array.isArray(value)
      const hasInitialValue = initialInputValue && hashTriggeredRef.current
      
      debugLogger.log('FORM', {
        event: 'sql-expression-changed-conversion-check',
        configId,
        isArrayFormat,
        hasInitialValue,
        hashTriggeredRefValue: hashTriggeredRef.current,
        initialInputValue,
        valueType: typeof value,
        value: Array.isArray(value) ? value : value,
        timestamp: Date.now()
      })
      
      debugLogger.log('HASH-FIRST-LOAD', {
        event: 'form-conversion-check',
        configId,
        isArrayFormat,
        hasInitialValue,
        hashTriggeredRef: hashTriggeredRef.current,
        initialInputValue,
        valueType: typeof value,
        isArray: Array.isArray(value),
        arrayLength: Array.isArray(value) ? value.length : 'n/a',
        firstItem: Array.isArray(value) && value.length > 0 ? value[0] : 'n/a',
        willCheckMatch: isArrayFormat && hasInitialValue && initialInputValue,
        timestamp: Date.now()
      })
      
      // If value converted to array format AND this was hash-triggered, fire event
      if (isArrayFormat && hasInitialValue && initialInputValue) {
        const matchesHashValue = value.length > 0 && value[0]?.value === initialInputValue
        
        debugLogger.log('FORM', {
          event: 'sql-expression-changed-matches-check',
          configId,
          matchesHashValue,
          initialInputValue,
          convertedValueFirstItem: value[0]?.value,
          timestamp: Date.now()
        })
        
        if (matchesHashValue) {
          debugLogger.log('FORM', {
            event: 'hash-value-converted-to-array',
            configId,
            initialInputValue,
            convertedValue: value,
            timestamp: Date.now()
          })
          
          // Fire custom event for query execution to wait on
          const event = new CustomEvent(QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT, {
            detail: {
              configId,
              widgetId,
              initialInputValue,
              convertedValue: value
            },
            bubbles: true
          })
          document.dispatchEvent(event)
          
          debugLogger.log('FORM', {
            event: 'hash-value-converted-event-dispatched',
            configId,
            widgetId,
            timestamp: Date.now()
          })
          
          // EXECUTION POINT: Query execution happens HERE after conversion is confirmed
          // This is the ONLY place where hash-triggered queries should execute
          // The event QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT has been dispatched above
          // This direct call handles the case where conversion happens synchronously
          // The event listener in query-task.tsx handles the async case
          
          debugLogger.log('HASH-FIRST-LOAD', {
            event: 'form-execution-decision-point',
            configId,
            initialInputValue,
            conditionCheck: {
              hashTriggeredRef: hashTriggeredRef.current,
              datasourceReady,
              hasOutputDS: !!outputDS,
              allConditionsMet: !!(hashTriggeredRef.current && datasourceReady && outputDS)
            },
            willExecute: !!(hashTriggeredRef.current && datasourceReady && outputDS),
            timestamp: Date.now()
          })
          
          if (hashTriggeredRef.current && datasourceReady && outputDS) {
            debugLogger.log('FORM', {
              event: 'hash-value-converted-executing-query-directly',
              configId,
              initialInputValue,
              note: 'Conversion complete - executing query directly via applyQuery (event-driven pattern)',
              timestamp: Date.now()
            })
            
            debugLogger.log('HASH-FIRST-LOAD', {
              event: 'form-WILL-EXECUTE-applyQuery',
              configId,
              initialInputValue,
              note: 'All conditions met - calling applyQuery after setTimeout(0)',
              timestamp: Date.now()
            })
            
            // Use setTimeout to ensure this happens after the current event loop
            setTimeout(() => {
              debugLogger.log('HASH-FIRST-LOAD', {
                event: 'form-applyQuery-CALLED',
                configId,
                initialInputValue,
                timestamp: Date.now()
              })
              applyQuery()
            }, 0)
          } else {
            debugLogger.log('HASH-FIRST-LOAD', {
              event: 'form-execution-SKIPPED',
              configId,
              initialInputValue,
              reason: !hashTriggeredRef.current ? 'hashTriggeredRef is false' :
                      !datasourceReady ? 'datasourceReady is false' :
                      !outputDS ? 'outputDS is null/undefined' :
                      'unknown',
              conditionStates: {
                hashTriggeredRef: hashTriggeredRef.current,
                datasourceReady,
                hasOutputDS: !!outputDS
              },
              timestamp: Date.now()
            })
          }
          
          // FIX (r018.125): Reset flag after conversion detection completes
          // This allows the next hash change to trigger a new conversion cycle
          hashTriggeredRef.current = false
          
          debugLogger.log('FORM', {
            event: 'hash-triggered-ref-reset-after-conversion',
            configId,
            initialInputValue,
            note: 'hashTriggeredRef reset to false after conversion detection complete',
            timestamp: Date.now()
          })
        }
      }
    }
  }, [configId, initialInputValue, widgetId, datasourceReady, outputDS, applyQuery])

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

  // Log when SqlExpressionRuntime key changes (component remounts) OR expression prop changes
  React.useEffect(() => {
    const expressionValue = attributeFilterSqlExprObj?.parts?.[0]?.valueOptions?.value
    const sqlExprRuntimeKey = `${configId}-${expressionValue || 'empty'}`
    
    debugLogger.log('FORM', {
      event: 'SqlExpressionRuntime-props-changed',
      configId,
      initialInputValue,
      sqlExprRuntimeKey,
      expressionValue,
      expressionValueType: typeof expressionValue,
      isArray: Array.isArray(expressionValue),
      hashTriggeredRef: hashTriggeredRef.current,
      originDSExists: !!originDS,
      note: 'FIX (r018.123): Key uses configId + expressionValue to remount when value changes, not when initialInputValue clears',
      timestamp: Date.now()
    })
  }, [configId, initialInputValue, attributeFilterSqlExprObj, originDS])

  // ============================================================================
  // DOM MANIPULATION FOR SqlExpressionRuntime (r018.122-128)
  // ============================================================================
  // 
  // ⚠️ CRITICAL: DO NOT REMOVE THIS WORKAROUND ⚠️
  // 
  // WHY THIS IS NECESSARY:
  // 
  // SqlExpressionRuntime is a "black-box" ExB component that does NOT support
  // programmatic value population via its `expression` prop. This was discovered
  // through extensive testing (r018.108-128):
  // 
  // 1. Setting `expression` prop → Component does NOT populate its text field
  // 2. Changing `expression` prop → Component does NOT fire onChange event
  // 3. Using `key` prop to remount → Component still doesn't populate field
  // 
  // The component ONLY responds to actual DOM user interactions (focus, input, blur).
  // 
  // WHAT WE NEED TO ACHIEVE:
  // 
  // When a hash parameter arrives (e.g., #pin=2223059013), we need to:
  // 1. Populate the SqlExpressionRuntime text field with "2223059013"
  // 2. Trigger SqlExpressionRuntime's onChange handler
  // 3. Allow it to convert string → array format internally
  // 4. Execute the query with the correctly formatted value
  // 
  // THE SOLUTION:
  // 
  // Simulate user interaction by directly manipulating the DOM input field:
  // 
  // 1. MutationObserver watches for input[type="text"] to appear in DOM
  // 2. Double requestAnimationFrame ensures React has attached event handlers
  // 3. focus() → set value → dispatch events → blur()
  // 4. SqlExpressionRuntime.onChange fires naturally
  // 5. Internal string→array conversion happens
  // 6. Query executes with correct array format
  // 
  // ALTERNATIVES ATTEMPTED (ALL FAILED):
  // 
  // - ❌ Direct applyQuery() call → Wrong format (string instead of array)
  // - ❌ Updating expression prop → Component ignores it
  // - ❌ Key-based remount → Component doesn't populate from prop
  // - ❌ Calling onChange manually → No access to internal state
  // 
  // TIMING REQUIREMENTS:
  // 
  // - MutationObserver: Event-driven detection when input appears
  // - Double RAF: Ensures React commit phase completes (handlers attached)
  // - focus/blur cycle: Triggers SqlExpressionRuntime's internal logic
  // 
  // MAINTENANCE NOTES:
  // 
  // - This workaround is REQUIRED for hash parameter execution
  // - If Esri updates SqlExpressionRuntime to support programmatic population, 
  //   this can be removed
  // - Tested extensively in r018.108-128 (see CURRENT_WORK.md)
  // - Debug switch: FORM (query-task-form events)
  // 
  // See: SQLEXPRESSION_RUNTIME_DOM_WORKAROUND.md for full details
  // 
  // ============================================================================
  React.useEffect(() => {
    if (!sqlExprRuntimeContainerRef.current || !originDS) return
    
    // FIX (r018.124): Simplify - use initialInputValue (the hash parameter) directly
    // The old working code checked against initialInputValue, not expressionValue
    // This useEffect now depends on initialInputValue, so it re-runs for each hash change
    if (initialInputValue && hashTriggeredRef.current) {
      const container = sqlExprRuntimeContainerRef.current
      
      debugLogger.log('FORM', {
        event: 'hash-dom-population-attempt',
        configId,
        initialInputValue,
        hasContainer: !!container,
        hashTriggeredRef: hashTriggeredRef.current,
        timestamp: Date.now()
      })
      
      // Function to populate the input field when found
      const populateInputField = (inputField: HTMLInputElement) => {
        const currentValue = inputField.value
        
        // FIX (r018.124): Use old working logic - update if empty OR different from initialInputValue
        const shouldUpdate = !currentValue || 
                            currentValue.trim() === '' || 
                            currentValue !== initialInputValue
        
        debugLogger.log('FORM', {
          event: 'hash-dom-input-found',
          configId,
          currentValue,
          targetValue: initialInputValue,
          shouldUpdate,
          hashTriggeredRef: hashTriggeredRef.current,
          inputType: inputField.type,
          timestamp: Date.now()
        })
        
        if (shouldUpdate) {
          // FIX (r018.125): Use double RAF to ensure SqlExpressionRuntime is fully initialized
          // When MutationObserver finds the input, React may not have finished attaching event handlers
          // Double RAF waits for browser paint + React commit phase to complete (event-driven, no setTimeout)
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              debugLogger.log('FORM', {
                event: 'hash-dom-starting-manipulation-after-raf',
                configId,
                value: initialInputValue,
                note: 'Double RAF complete - SqlExpressionRuntime should be fully initialized',
                timestamp: Date.now()
              })
              
              // Focus the input first (critical for React synthetic events)
              inputField.focus()
              
              debugLogger.log('FORM', {
                event: 'hash-dom-input-focused',
                configId,
                value: initialInputValue,
                isFocused: document.activeElement === inputField,
                timestamp: Date.now()
              })
              
              // Set the value
              inputField.value = String(initialInputValue)
              
              debugLogger.log('FORM', {
                event: 'hash-dom-value-set',
                configId,
                value: initialInputValue,
                inputFieldValueAfter: inputField.value,
                timestamp: Date.now()
              })
              
              // Dispatch input event with proper properties
              const inputEvent = new Event('input', { bubbles: true, cancelable: true })
              Object.defineProperty(inputEvent, 'target', { value: inputField, enumerable: true })
              inputField.dispatchEvent(inputEvent)
              
              // Dispatch change event
              const changeEvent = new Event('change', { bubbles: true, cancelable: true })
              Object.defineProperty(changeEvent, 'target', { value: inputField, enumerable: true })
              inputField.dispatchEvent(changeEvent)
              
              // Also use React's native value setter approach
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
              if (nativeInputValueSetter) {
                nativeInputValueSetter.call(inputField, String(initialInputValue))
                const reactEvent = new Event('input', { bubbles: true })
                inputField.dispatchEvent(reactEvent)
              }
              
              debugLogger.log('FORM', {
                event: 'hash-dom-events-dispatched',
                configId,
                value: initialInputValue,
                inputEventDispatched: true,
                changeEventDispatched: true,
                reactEventDispatched: !!nativeInputValueSetter,
                timestamp: Date.now()
              })
              
              // Blur to trigger any validation or state updates (critical for SqlExpressionRuntime.onChange)
              inputField.blur()
              
              debugLogger.log('FORM', {
                event: 'hash-dom-value-populated',
                configId,
                value: initialInputValue,
                note: 'DOM manipulation complete - SqlExpressionRuntime.onChange should fire and detect conversion',
                timestamp: Date.now()
              })
              
              // FIX (r018.125): Don't reset flag here - blur() is async and triggers onChange
              // The flag will be reset in handleSqlExprObjChange after conversion is detected
              // Resetting it here causes onChange to see false and skip the conversion event
            })
          })
        }
      }
      
      // Try to find input field immediately (it might already exist)
      // SqlExpressionRuntime uses input[type="text"], not textarea
      const inputField = container.querySelector('input[type="text"]') as HTMLInputElement
      
      if (inputField) {
        // Found it immediately - populate it
        debugLogger.log('FORM', {
          event: 'hash-dom-input-found-immediately',
          configId,
          timestamp: Date.now()
        })
        populateInputField(inputField)
      } else {
        // Not found yet - use MutationObserver to watch for it (event-driven, no timers)
        debugLogger.log('FORM', {
          event: 'hash-dom-input-not-found-watching',
          configId,
          note: 'Setting up MutationObserver to watch for input[type="text"] appearance',
          timestamp: Date.now()
        })
        
        const observer = new MutationObserver(() => {
          const inputField = container.querySelector('input[type="text"]') as HTMLInputElement
          if (inputField) {
            debugLogger.log('FORM', {
              event: 'hash-dom-input-appeared',
              configId,
              note: 'MutationObserver detected input[type="text"] in DOM',
              timestamp: Date.now()
            })
            
            populateInputField(inputField)
            observer.disconnect() // Stop watching once we've found and populated it
            
            debugLogger.log('FORM', {
              event: 'hash-dom-observer-disconnected',
              configId,
              timestamp: Date.now()
            })
          }
        })
        
        // Watch for any child elements being added to the container
        observer.observe(container, {
          childList: true,  // Watch for children being added/removed
          subtree: true     // Watch the entire subtree
        })
        
        debugLogger.log('FORM', {
          event: 'hash-dom-observer-started',
          configId,
          timestamp: Date.now()
        })
        
        // Cleanup: stop watching when component unmounts or dependencies change
        return () => {
          observer.disconnect()
          debugLogger.log('FORM', {
            event: 'hash-dom-observer-cleanup',
            configId,
            timestamp: Date.now()
          })
        }
      }
    }
  }, [attributeFilterSqlExprObj, originDS, configId, initialInputValue])

  return (
    <QueryTaskContext.Provider value={{ resetSymbol }}>
      <div className='query-form' css={getFormStyle(isAutoHeight)}>
        <div ref={formContentRef} className='query-form__content' onKeyDown={handleKeyDown}>
          {showAttributeFilter && (
            <div 
              role='group' 
              className='px-4' 
              css={css`padding-top: 2px;`}
              aria-label={attributeFilterLabel}
            >
              <div className={classNames('form-title d-flex align-items-center', { 'd-none': !attributeFilterLabel && !attributeFilterDesc })} css={css`
                margin-top: 0;
                margin-bottom: 4px;
              `}>
                {attributeFilterLabel && <div className='mr-2 title2'>{attributeFilterLabel}</div>}
                {attributeFilterDesc && (
                  <Tooltip placement='bottom' css={css`white-space: pre-line;`} title={attributeFilterDesc}>
                    <Button size='sm' icon type='tertiary'><InfoOutlined color='var(--sys-color-primary-main)' size='s'/></Button>
                  </Tooltip>
                )}
              </div>
              {originDS && (
                <div ref={sqlExprRuntimeContainerRef} css={css`margin: -10px 0px;`}>
                  <SqlExpressionRuntime
                    key={`${configId}-${attributeFilterSqlExprObj?.parts?.[0]?.valueOptions?.value || 'empty'}`}
                    widgetId={widgetId}
                    dataSource={originDS}
                    expression={attributeFilterSqlExprObj}
                    onChange={handleSqlExprObjChange}
                  />
                </div>
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
          <Button ref={applyButtonRef} color='primary' className='ml-auto' disabled={!datasourceReady || !isInputValid} onClick={applyQuery}>
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
