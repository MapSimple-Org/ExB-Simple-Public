/**
 * Query Tab Content Component
 * 
 * Extracted from query-task.tsx in r022.0 to prevent "god component" (3456+ lines).
 * Contains all Query tab-specific UI and logic while keeping shared elements
 * (Search Layer dropdown, Clear button) in parent query-task.tsx.
 * 
 * Architecture (r022.0):
 * - query-task.tsx: Orchestration + shared UI (header, Search Layer dropdown, tab bar)
 * - QueryTabContent.tsx: Query tab UI (Results Mode buttons, form, DataSourceTip)
 * - query-result.tsx: Results tab UI (separate file, already extracted)
 * 
 * Contains:
 * - Results Mode button group (New/Add/Remove selection modes) with mode-switch logic
 * - Form wrapper containing QueryTaskForm
 * - DataSourceTip for data source status messages
 * 
 * Design Philosophy:
 * - Minimal relocation approach (no new hooks, kept logic consolidated)
 * - Props-based communication with parent
 * - No over-normalization (Query tab logic stays together)
 * 
 * Future:
 * - Prepares for Graphics tab addition without exceeding 4000+ lines
 * - query-task.tsx remains manageable orchestrator (<3000 lines)
 * 
 * Related:
 * - Implementation plan: docs/development/TAB_EXTRACTION_IMPLEMENTATION_PLAN.md
 * - TODO.md: Section 2b - Tab extraction
 * 
 * @version r022.0 - Initial extraction
 * @version r025.008 - Swap to shared ResultsModeControl component
 */
/** @jsx jsx */
import {
  React,
  jsx,
  css,
  type DataSource,
  type ImmutableObject,
  type ImmutableArray,
  type IMSqlExpression,
  type FeatureLayerDataSource,
  type SqlQueryParams,
  type UseDataSource,
  type FeatureDataRecord,
  hooks
} from 'jimu-core'
import { type QueryItemType, type SpatialFilterObj, SelectionType } from '../../config'
import { QueryTaskForm } from '../query-task-form'
import { DataSourceTip, createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import { mergeResultsIntoAccumulated } from '../results-management-utils'
import { ResultsModeControl, type ResultsModeValue } from '../components/ResultsModeControl'
import defaultMessage from '../translations/default'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Props interface for QueryTabContent component
 * 
 * Receives all necessary state and callbacks from parent query-task.tsx
 * to render Query tab independently while maintaining proper data flow.
 */
export interface QueryTabContentProps {
  // Widget identification
  widgetId: string
  
  // Query configuration
  queryItem: ImmutableObject<QueryItemType>
  queryItems?: ImmutableArray<QueryItemType>
  
  // Results mode
  resultsMode?: SelectionType
  onResultsModeChange?: (mode: SelectionType) => void
  
  // Accumulated records (for Add/Remove modes)
  accumulatedRecords?: FeatureDataRecord[]
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
  
  // Data sources
  outputDS: FeatureLayerDataSource | null
  dataSource: DataSource | null
  effectiveRecords: FeatureDataRecord[]
  
  // Form state
  enabled: boolean
  dsExists: boolean
  spatialFilterEnabled?: boolean
  dataActionFilter?: SqlQueryParams
  initialInputValue?: string
  
  // Callbacks
  handleFormSubmit: (sqlExpr: IMSqlExpression, spatialFilter: SpatialFilterObj, runtimeZoomToSelected?: boolean) => void
  onHashParameterUsed?: (shortId: string) => void
  handleStatusChange?: (enabled: boolean) => void
  handleDataSourceCreated?: (ds: DataSource) => void
  
  // Tab state
  activeTab: 'query' | 'results'
  setActiveTab: (tab: 'query' | 'results') => void
  
  // Alert state (r022.3)
  noResultsAlert?: {
    show: boolean
    recordsRequested: number
    queryValue: string
  } | null
  onDismissNoResultsAlert?: () => void
  
  // r024.62: Query error alert (service down, network failure)
  queryErrorAlert?: {
    show: boolean
    errorMessage: string
    timestamp?: number
  } | null
  onDismissQueryErrorAlert?: () => void
  
  // Other props passed to QueryTaskForm
  otherProps?: Record<string, unknown>
}

/**
 * Query Tab Content Component
 * 
 * Renders the Query tab UI including Results Mode buttons, query form, and data source tips.
 * Extracted from query-task.tsx in r022.0 to enable Graphics tab addition without
 * creating an unmaintainable 4000+ line file.
 * 
 * @param props - All state and callbacks needed to render Query tab independently
 * @returns React component for Query tab content
 */
export function QueryTabContent(props: QueryTabContentProps) {
  const {
    widgetId,
    queryItem,
    queryItems,
    resultsMode,
    onResultsModeChange,
    accumulatedRecords,
    onAccumulatedRecordsChange,
    outputDS,
    dataSource,
    effectiveRecords,
    enabled,
    dsExists,
    spatialFilterEnabled,
    dataActionFilter,
    initialInputValue,
    handleFormSubmit,
    onHashParameterUsed,
    handleStatusChange,
    handleDataSourceCreated,
    activeTab,
    setActiveTab,
    noResultsAlert,
    onDismissNoResultsAlert,
    queryErrorAlert,
    onDismissQueryErrorAlert,
    otherProps
  } = props
  
  const getI18nMessage = hooks.useTranslation(defaultMessage)

  // ─── Results Mode mapping (r025.008) ──────────────────────────────
  // Map between shared component's ResultsModeValue and config's SelectionType
  const SELECTION_MAP: Record<ResultsModeValue, SelectionType> = React.useMemo(() => ({
    new: SelectionType.NewSelection,
    add: SelectionType.AddToSelection,
    remove: SelectionType.RemoveFromSelection
  }), [])

  const VALUE_MAP: Record<string, ResultsModeValue> = React.useMemo(() => ({
    [SelectionType.NewSelection]: 'new',
    [SelectionType.AddToSelection]: 'add',
    [SelectionType.RemoveFromSelection]: 'remove'
  }), [])

  // ─── Results Mode change handler ─────────────────────────────────
  // Consolidates Add/Remove merge logic (previously duplicated inline in each button).
  // When switching FROM New TO Add/Remove, captures current results into accumulated records
  // before changing mode.
  //
  // SOURCE OF TRUTH ARCHITECTURE (r018.65):
  // - accumulatedRecords is the SINGLE SOURCE OF TRUTH when switching from NEW mode
  //   It reflects removals and is always up-to-date (r018.97, r021.110)
  // - outputDS.getSelectedRecords() can be stale after removals in NEW mode
  // - effectiveRecords is a fallback to original query results (also stale after removals)
  const handleResultsModeChange = React.useCallback((mode: ResultsModeValue) => {
    const newMode = SELECTION_MAP[mode]
    const previousMode = resultsMode || SelectionType.NewSelection

    debugLogger.log('RESULTS-MODE', {
      event: 'button-mode-changed',
      widgetId,
      queryItemConfigId: queryItem.configId,
      previousMode,
      newMode,
      accumulatedRecordsCount: accumulatedRecords?.length || 0,
      timestamp: new Date().toISOString()
    })

    // When switching FROM New TO Add/Remove, merge current results into accumulated
    if (mode !== 'new' && previousMode === SelectionType.NewSelection) {
      const outputDSSelectedRecords = outputDS?.getSelectedRecords() as FeatureDataRecord[] || []

      debugLogger.log('RESULTS-MODE', {
        event: 'mode-switch-debug-before-capture',
        widgetId,
        previousMode,
        newMode,
        effectiveRecordsCount: effectiveRecords?.length || 0,
        outputDSSelectedCount: outputDSSelectedRecords.length,
        accumulatedRecordsCount: accumulatedRecords?.length || 0,
        outputDSId: outputDS?.id,
        timestamp: Date.now()
      })

      // FIX (r021.112): Priority order for capturing records on mode switch FROM NEW mode:
      // 1. accumulatedRecords - reflects removals, always up-to-date
      // 2. outputDS.getSelectedRecords() - can be stale after removals
      // 3. effectiveRecords - fallback to original query results
      const recordsToCapture = (accumulatedRecords && accumulatedRecords.length > 0)
        ? accumulatedRecords
        : (outputDSSelectedRecords.length > 0
            ? outputDSSelectedRecords
            : (effectiveRecords && effectiveRecords.length > 0
                ? (effectiveRecords as FeatureDataRecord[])
                : []))

      const captureSource = (accumulatedRecords && accumulatedRecords.length > 0)
        ? 'accumulatedRecords'
        : (outputDSSelectedRecords.length > 0
            ? 'outputDS.getSelectedRecords()'
            : (effectiveRecords && effectiveRecords.length > 0 ? 'effectiveRecords' : 'none'))

      debugLogger.log('RESULTS-MODE', {
        event: 'mode-switch-debug-after-capture',
        widgetId,
        recordsToCaptureCount: recordsToCapture.length,
        source: captureSource,
        note: 'r021.112: accumulatedRecords is single source of truth when switching from NEW mode',
        timestamp: Date.now()
      })

      if (recordsToCapture.length > 0 && outputDS && onAccumulatedRecordsChange) {
        const existingAccumulated = accumulatedRecords || []

        // r021.87: Merge function reads __queryConfigId from record attributes
        const mergeResult = mergeResultsIntoAccumulated(
          outputDS as FeatureLayerDataSource,
          recordsToCapture,
          existingAccumulated,
          queryItems
        )

        debugLogger.log('RESULTS-MODE', {
          event: 'capturing-current-results-on-mode-switch',
          widgetId,
          previousMode,
          newMode,
          capturedRecordsCount: recordsToCapture.length,
          existingAccumulatedCount: existingAccumulated.length,
          mergedRecordsCount: mergeResult.mergedRecords.length,
          addedIds: mergeResult.addedRecordIds,
          duplicatesFiltered: mergeResult.duplicateRecordIds.length,
          sourceUsed: captureSource,
          note: 'r021.111: accumulatedRecords prioritized over effectiveRecords to capture removed-record state'
        })

        // r023.17: Only stamp queryConfigId on records that don't already have one.
        // Preserves existing queryConfigId from prior queries to avoid corrupting popup template lookup.
        // r023.30: Also stamp originDSId for cross-layer removal support
        const originDSId = outputDS?.getOriginDataSources()?.[0]?.id || outputDS?.id
        recordsToCapture.forEach(record => {
          const recordId = record.getId()
          if (mergeResult.addedRecordIds.includes(recordId) && record.feature?.attributes) {
            if (!record.feature.attributes.__queryConfigId) {
              record.feature.attributes.__queryConfigId = queryItem.configId
            }
            if (!record.feature.attributes.__originDSId && originDSId) {
              record.feature.attributes.__originDSId = originDSId
            }
          }
        })

        onAccumulatedRecordsChange(mergeResult.mergedRecords)
      } else {
        debugLogger.log('RESULTS-MODE', {
          event: 'mode-switch-merge-skipped',
          widgetId,
          reason: 'conditions-not-met',
          hasRecords: recordsToCapture.length > 0,
          hasOutputDS: !!outputDS,
          hasCallback: !!onAccumulatedRecordsChange,
          timestamp: Date.now()
        })
      }
    }

    if (onResultsModeChange) {
      onResultsModeChange(newMode)
    }
  }, [resultsMode, accumulatedRecords, effectiveRecords, outputDS, onAccumulatedRecordsChange,
      onResultsModeChange, widgetId, queryItem.configId, queryItems, SELECTION_MAP])

  return (
    <div css={css`
      position: relative;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    `}>
      {/* Results Mode — shared component (r025.008) */}
      <div css={css`
        padding: 8px 16px;
        flex-shrink: 0;
      `}>
        <div css={css`
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--sys-color-text-primary);
          margin-bottom: 4px;
        `}>
          {getI18nMessage('resultsModeLabel')}
        </div>
        <ResultsModeControl
          value={VALUE_MAP[resultsMode || SelectionType.NewSelection] || 'new'}
          onChange={handleResultsModeChange}
          removeDisabled={!accumulatedRecords || accumulatedRecords.length === 0}
          getI18nMessage={getI18nMessage}
        />
        <div
          id={`results-mode-description-${widgetId}`}
          className="sr-only"
          aria-live="polite"
          role="status"
        >
          {resultsMode === SelectionType.NewSelection
            ? getI18nMessage('createNewResults')
            : resultsMode === SelectionType.AddToSelection
            ? getI18nMessage('addToCurrentResults')
            : getI18nMessage('removeFromCurrentResults')
          }
        </div>
      </div>
      
      {/* Form wrapper and QueryTaskForm */}
      <div 
        id="query-form-wrapper"
        css={css`
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        `}
      >
        {enabled && dsExists && (
          <div css={css`
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            overflow: hidden;
          `}>
            <QueryTaskForm
              key={queryItem.configId}
              {...otherProps}
              configId={queryItem.configId}
              outputDS={outputDS}
              datasourceReady={dataSource != null}
              spatialFilterEnabled={spatialFilterEnabled}
              dataActionFilter={dataActionFilter}
              onFormSubmit={handleFormSubmit}
              initialInputValue={initialInputValue}
              onHashParameterUsed={onHashParameterUsed}
              queryItemShortId={queryItem.shortId}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        )}
        
        <DataSourceTip
          widgetId={widgetId}
          useDataSource={queryItem.useDataSource}
          showMessage={true}
          onStatusChange={handleStatusChange}
          onDataSourceCreated={handleDataSourceCreated}
        />
      </div>
      
      {/* r022.13: Anchor for popover - minimal height, no spacing */}
      <div 
        id="query-feedback-anchor"
        css={css`
          height: 1px;
          width: 100%;
          position: relative;
          padding: 0;
          pointer-events: none;
        `}
      />
      
      {/* r022.8: Calcite Popover for query feedback (zero results, etc.) */}
      {noResultsAlert?.show && (
        <calcite-popover 
          key={`no-results-${noResultsAlert.timestamp}`}
          referenceElement="query-feedback-anchor"
          placement="bottom"
          flipDisabled={true}
          overlayPositioning="fixed"
          triggerDisabled={true}
          autoClose
          closable
          label={getI18nMessage('noResultsAlertLabel')}
          open={noResultsAlert.show}
          onCalcitePopoverClose={() => {
            if (onDismissNoResultsAlert) {
              onDismissNoResultsAlert()
            }
          }}
          style={{
            '--calcite-popover-max-size-x': '320px',
            maxWidth: '320px',
            width: '100%',
            '--calcite-color-foreground-1': 'lightyellow'
          } as React.CSSProperties}
        >
          <div style={{ padding: '12px', maxWidth: '320px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: '#151515' }}>
              {getI18nMessage('noResultsAlertTitle')}
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#2b2b2b' }}>
              {getI18nMessage('noResultsAlertMessage')}
            </div>
          </div>
        </calcite-popover>
      )}
      
      {/* r024.62: Calcite Popover for query execution failure (service down, network error) */}
      {queryErrorAlert?.show && (
        <calcite-popover 
          key={`query-error-${queryErrorAlert.timestamp}`}
          referenceElement="query-feedback-anchor"
          placement="bottom"
          flipDisabled={true}
          overlayPositioning="fixed"
          triggerDisabled={true}
          autoClose
          closable
          label={getI18nMessage('queryErrorAlertLabel')}
          open={queryErrorAlert.show}
          onCalcitePopoverClose={() => {
            if (onDismissQueryErrorAlert) {
              onDismissQueryErrorAlert()
            }
          }}
          style={{
            '--calcite-popover-max-size-x': '320px',
            maxWidth: '320px',
            width: '100%',
            '--calcite-color-foreground-1': '#fef2f2'
          } as React.CSSProperties}
        >
          <div style={{ padding: '12px', maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '8px', fontSize: '14px', color: '#991b1b' }}>
              <calcite-icon icon="exclamation-mark-triangle" scale="s" style={{ color: '#dc2626' }} />
              {getI18nMessage('queryErrorAlertTitle')}
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#2b2b2b' }}>
              {getI18nMessage('queryErrorAlertMessage')}
            </div>
          </div>
        </calcite-popover>
      )}
    </div>
  )
}
