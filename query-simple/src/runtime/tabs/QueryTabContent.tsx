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
 */
/** @jsx jsx */
import {
  React,
  jsx,
  css,
  type ImmutableObject,
  type ImmutableArray,
  type FeatureLayerDataSource,
  type UseDataSource,
  type FeatureDataRecord,
  hooks
} from 'jimu-core'
import { Button } from 'jimu-ui'
import { type QueryItemType, SelectionType } from '../../config'
import { QueryTaskForm } from '../query-task-form'
import { DataSourceTip, createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import { mergeResultsIntoAccumulated } from '../results-management-utils'
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
  dataSource: any
  effectiveRecords: any
  
  // Form state
  enabled: boolean
  dsExists: boolean
  spatialFilterEnabled?: boolean
  dataActionFilter?: any
  initialInputValue?: string
  
  // Callbacks
  handleFormSubmit: (params: any) => void
  onHashParameterUsed?: (shortId: string) => void
  handleStatusChange?: (status: any) => void
  handleDataSourceCreated?: (ds: any) => void
  
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
  
  // Other props passed to QueryTaskForm
  otherProps?: any
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
    otherProps
  } = props
  
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  
  return (
    <div css={css`
      position: relative;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    `}>
      {/* Results Mode Button Group - Always show, regardless of query count */}
      <div css={css`
        padding: 8px 16px;
        flex-shrink: 0;
      `}>
        <div className="d-flex align-items-center" css={css`
          gap: 0.5rem;
          flex-wrap: nowrap;
        `}>
          {/* Results label */}
          <div className="title2" css={css`
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--sys-color-text-primary);
            white-space: nowrap;
            flex-shrink: 0;
          `}>
            {getI18nMessage('resultsModeLabel')}
          </div>
          
          {/* Mode buttons - segmented control */}
          <div 
            role="radiogroup"
            aria-label={getI18nMessage('resultsMode')}
            css={css`
              display: flex;
              align-items: stretch;
              flex: 1;
              min-width: 0;
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 4px;
              padding: 2px;
              gap: 2px;
            `}
          >
            <Button
              size="sm"
              onClick={() => {
                const newMode = SelectionType.NewSelection
                debugLogger.log('RESULTS-MODE', {
                  event: 'button-mode-changed',
                  widgetId,
                  queryItemConfigId: queryItem.configId,
                  previousMode: resultsMode || SelectionType.NewSelection,
                  newMode,
                  timestamp: new Date().toISOString()
                })
                if (onResultsModeChange) {
                  onResultsModeChange(newMode)
                }
              }}
              aria-pressed={resultsMode === SelectionType.NewSelection}
              aria-label={`${getI18nMessage('createNewResults')}: ${getI18nMessage('resultsModeDesc').split('\n')[1]?.trim() || ''}`}
              title={getI18nMessage('createNewResults')}
              css={css`
                flex: 1;
                font-size: 0.8125rem;
                font-weight: 600;
                padding: 2px 10px;
                min-height: 26px;
                white-space: nowrap;
                overflow: hidden;
                display: inline-flex !important;
                align-items: center;
                justify-content: center;
                gap: 3px;
                border: none !important;
                border-radius: 3px !important;
                background: ${resultsMode === SelectionType.NewSelection
                  ? '#3b82f6' 
                  : 'transparent'} !important;
                color: ${resultsMode === SelectionType.NewSelection 
                  ? '#fff' 
                  : '#64748b'} !important;
                box-shadow: ${resultsMode === SelectionType.NewSelection
                  ? '0 1px 2px rgba(0,0,0,0.1)'
                  : 'none'} !important;
                transition: all 0.15s ease;
                cursor: pointer;
                &:hover {
                  background: ${resultsMode === SelectionType.NewSelection 
                    ? '#2563eb' 
                    : '#e2e8f0'} !important;
                }
              `}
            >
              <span css={css`font-size: 0.6rem;`}>★</span>
              {getI18nMessage('resultsModeNew')}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const newMode = SelectionType.AddToSelection
                const previousMode = resultsMode || SelectionType.NewSelection
                
                debugLogger.log('RESULTS-MODE', {
                  event: 'button-mode-changed',
                  widgetId,
                  queryItemConfigId: queryItem.configId,
                  previousMode,
                  newMode,
                  timestamp: new Date().toISOString()
                })
                
                // If switching FROM "New" TO "Add to" mode and we have current results,
                // merge them with existing accumulated records before changing mode
                //
                // SOURCE OF TRUTH ARCHITECTURE (r018.65):
                // - outputDS.getSelectedRecords() is the SINGLE SOURCE OF TRUTH for current selection
                //   It correctly filters out removed records and stays in sync with user actions
                // - effectiveRecords (from recordsRef.current) contains stale query results that may
                //   include removed records, so it should only be used as a fallback when outputDS
                //   has no selection (e.g., during query execution before selection is applied)
                // - This ensures removed records are never accidentally included in accumulatedRecords
                
                // DEBUG: Log state before capture to verify assumptions
                const effectiveRecordsCount = effectiveRecords?.length || 0
                const outputDSSelectedRecords = outputDS?.getSelectedRecords() as FeatureDataRecord[] || []
                const outputDSSelectedCount = outputDSSelectedRecords.length
                const accumulatedRecordsCount = accumulatedRecords?.length || 0
                
                debugLogger.log('RESULTS-MODE', {
                  event: 'mode-switch-debug-before-capture',
                  widgetId,
                  previousMode,
                  newMode,
                  effectiveRecordsCount,
                  outputDSSelectedCount,
                  accumulatedRecordsCount,
                  outputDSId: outputDS?.id,
                  hasEffectiveRecords: effectiveRecords && effectiveRecords.length > 0,
                  hasOutputDSSelected: outputDSSelectedRecords.length > 0,
                  timestamp: Date.now()
                })
                
                // FIX (r021.112): Priority order for capturing records on mode switch FROM NEW mode:
                // 1. accumulatedRecords - SINGLE SOURCE OF TRUTH when switching from NEW mode
                //    It reflects removals and is always up-to-date (r018.97, r021.110)
                // 2. outputDS.getSelectedRecords() - can be stale after removals in NEW mode
                // 3. effectiveRecords - fallback to original query results (also stale after removals)
                // BUG FIX: outputDS.getSelectedRecords() can return stale data (121 records) when
                // records have been removed in NEW mode. accumulatedRecords is the source of truth.
                const recordsToCapture = (accumulatedRecords && accumulatedRecords.length > 0)
                  ? accumulatedRecords
                  : (outputDSSelectedRecords.length > 0
                      ? outputDSSelectedRecords
                      : (effectiveRecords && effectiveRecords.length > 0 
                          ? (effectiveRecords as FeatureDataRecord[])
                          : []))
                
                // DEBUG: Log which source was used
                debugLogger.log('RESULTS-MODE', {
                  event: 'mode-switch-debug-after-capture',
                  widgetId,
                  recordsToCaptureCount: recordsToCapture.length,
                  source: (accumulatedRecords && accumulatedRecords.length > 0)
                    ? 'accumulatedRecords' 
                    : (outputDSSelectedRecords.length > 0 
                        ? 'outputDS.getSelectedRecords()' 
                        : (effectiveRecords && effectiveRecords.length > 0 ? 'effectiveRecords' : 'none')),
                  effectiveRecordsCount,
                  outputDSSelectedCount,
                  accumulatedRecordsCount,
                  note: 'r021.112: accumulatedRecords is single source of truth when switching from NEW mode',
                  timestamp: Date.now()
                })

                // DIAGNOSTIC: Check each condition individually (r018.78)
                const conditionCheck = {
                  previousModeIsNew: previousMode === SelectionType.NewSelection,
                  newModeIsAdd: newMode === SelectionType.AddToSelection,
                  hasRecordsToCapture: recordsToCapture.length > 0,
                  hasOutputDS: !!outputDS,
                  hasOnAccumulatedRecordsChange: !!onAccumulatedRecordsChange,
                  previousMode: previousMode,
                  newMode: newMode,
                  recordsToCaptureLength: recordsToCapture.length
                }
                
                debugLogger.log('RESULTS-MODE', {
                  event: 'mode-switch-condition-check',
                  widgetId,
                  conditions: conditionCheck,
                  allConditionsMet: conditionCheck.previousModeIsNew && 
                                  conditionCheck.newModeIsAdd && 
                                  conditionCheck.hasRecordsToCapture && 
                                  conditionCheck.hasOutputDS && 
                                  conditionCheck.hasOnAccumulatedRecordsChange,
                  timestamp: Date.now()
                })

                if (previousMode === SelectionType.NewSelection && 
                    newMode === SelectionType.AddToSelection &&
                    recordsToCapture.length > 0 &&
                    outputDS &&
                    onAccumulatedRecordsChange) {
                  const existingAccumulated = accumulatedRecords || []
                  
                  // r021.87: Merge function reads __queryConfigId from record attributes
                  const mergeResult = mergeResultsIntoAccumulated(
                    outputDS as FeatureLayerDataSource,
                    recordsToCapture,
                    existingAccumulated,
                    queryItems
                  )
                  
                  const mergedRecords = mergeResult.mergedRecords
                  const addedIds = mergeResult.addedRecordIds
                  const duplicateIds = mergeResult.duplicateRecordIds
                  
                  const existingIds = existingAccumulated.map(r => r.getId())
                  const capturedIds = recordsToCapture.map(r => r.getId())
                  const mergedIds = mergedRecords.map(r => r.getId())
                  
                  debugLogger.log('RESULTS-MODE', {
                    event: 'capturing-current-results-on-mode-switch',
                    widgetId,
                    previousMode,
                    newMode,
                    capturedRecordsCount: recordsToCapture.length,
                    capturedIds: capturedIds,
                    effectiveRecordsCount,
                    outputDSSelectedCount,
                    existingAccumulatedCount: existingAccumulated.length,
                    existingIds: existingIds,
                    mergedRecordsCount: mergedRecords.length,
                    mergedIds: mergedIds,
                    addedIds: addedIds,
                    duplicateIds: duplicateIds,
                    duplicatesFiltered: duplicateIds.length,
                    sourceUsed: outputDSSelectedRecords.length > 0 
                      ? 'outputDS.getSelectedRecords()' 
                      : (accumulatedRecords && accumulatedRecords.length > 0 
                          ? 'accumulatedRecords' 
                          : (effectiveRecords && effectiveRecords.length > 0 ? 'effectiveRecords' : 'none')),
                    note: 'r021.111: accumulatedRecords prioritized over effectiveRecords to capture removed-record state'
                  })
                  
                  // r023.17: Only stamp queryConfigId on records that don't already have one.
                  // Previously this stamped ALL added records with queryItem.configId (the CURRENT
                  // query dropdown). When switching from New to Add after changing the query dropdown,
                  // records from a prior query (e.g. parcel) got stamped with the new query's configId
                  // (e.g. park), corrupting their popup template lookup.
                  // r023.30: Also stamp originDSId for cross-layer removal support
                  const originDSIdForCapture = outputDS?.getOriginDataSources()?.[0]?.id || outputDS?.id
                  recordsToCapture.forEach(record => {
                    const recordId = record.getId()
                    if (addedIds.includes(recordId) && record.feature?.attributes) {
                      if (!record.feature.attributes.__queryConfigId) {
                        record.feature.attributes.__queryConfigId = queryItem.configId
                      }
                      if (!record.feature.attributes.__originDSId && originDSIdForCapture) {
                        record.feature.attributes.__originDSId = originDSIdForCapture
                      }
                    }
                  })
                  
                  onAccumulatedRecordsChange(mergedRecords)
                } else {
                  debugLogger.log('RESULTS-MODE', {
                    event: 'mode-switch-merge-skipped',
                    widgetId,
                    reason: 'condition-check-failed',
                    conditions: conditionCheck,
                    timestamp: Date.now()
                  })
                }
                
                if (onResultsModeChange) {
                  onResultsModeChange(newMode)
                }
              }}
              aria-pressed={resultsMode === SelectionType.AddToSelection}
              aria-label={`${getI18nMessage('addToCurrentResults')}: ${getI18nMessage('resultsModeDesc').split('\n')[2]?.trim() || ''}`}
              title={getI18nMessage('addToCurrentResults')}
              css={css`
                flex: 1;
                font-size: 0.8125rem;
                font-weight: 600;
                padding: 2px 10px;
                min-height: 26px;
                white-space: nowrap;
                overflow: hidden;
                display: inline-flex !important;
                align-items: center;
                justify-content: center;
                gap: 3px;
                border: none !important;
                border-radius: 3px !important;
                background: ${resultsMode === SelectionType.AddToSelection
                  ? '#059669' 
                  : 'transparent'} !important;
                color: ${resultsMode === SelectionType.AddToSelection 
                  ? '#fff' 
                  : '#64748b'} !important;
                box-shadow: ${resultsMode === SelectionType.AddToSelection
                  ? '0 1px 2px rgba(0,0,0,0.1)'
                  : 'none'} !important;
                transition: all 0.15s ease;
                cursor: pointer;
                &:hover {
                  background: ${resultsMode === SelectionType.AddToSelection 
                    ? '#047857' 
                    : '#e2e8f0'} !important;
                }
              `}
            >
              <span css={css`font-size: 0.7rem;`}>+</span>
              {getI18nMessage('resultsModeAdd')}
            </Button>
            <Button
              size="sm"
              disabled={!accumulatedRecords || accumulatedRecords.length === 0}
              onClick={() => {
                const newMode = SelectionType.RemoveFromSelection
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
                
                // If switching FROM "New" TO "Remove from" mode and we have current results,
                // merge them with existing accumulated records before changing mode
                // (same pattern as "Add to" mode)
                //
                // SOURCE OF TRUTH ARCHITECTURE (r018.65):
                // - outputDS.getSelectedRecords() is the SINGLE SOURCE OF TRUTH for current selection
                //   It correctly filters out removed records and stays in sync with user actions
                // - effectiveRecords (from recordsRef.current) contains stale query results that may
                //   include removed records, so it should only be used as a fallback when outputDS
                //   has no selection (e.g., during query execution before selection is applied)
                // - This ensures removed records are never accidentally included in accumulatedRecords
                
                // DEBUG: Log state before capture to verify assumptions
                const effectiveRecordsCountForRemove = effectiveRecords?.length || 0
                const outputDSSelectedRecordsForRemove = outputDS?.getSelectedRecords() as FeatureDataRecord[] || []
                const outputDSSelectedCountForRemove = outputDSSelectedRecordsForRemove.length
                const accumulatedRecordsCountForRemove = accumulatedRecords?.length || 0
                
                debugLogger.log('RESULTS-MODE', {
                  event: 'mode-switch-debug-before-capture-remove',
                  widgetId,
                  previousMode,
                  newMode,
                  effectiveRecordsCount: effectiveRecordsCountForRemove,
                  outputDSSelectedCount: outputDSSelectedCountForRemove,
                  accumulatedRecordsCount: accumulatedRecordsCountForRemove,
                  outputDSId: outputDS?.id,
                  hasEffectiveRecords: effectiveRecords && effectiveRecords.length > 0,
                  hasOutputDSSelected: outputDSSelectedRecordsForRemove.length > 0,
                  timestamp: Date.now()
                })
                
                // FIX (r021.112): Priority order for capturing records on mode switch FROM NEW mode:
                // 1. accumulatedRecords - SINGLE SOURCE OF TRUTH when switching from NEW mode
                //    It reflects removals and is always up-to-date (r018.97, r021.110)
                // 2. outputDS.getSelectedRecords() - can be stale after removals in NEW mode
                // 3. effectiveRecords - fallback to original query results (also stale after removals)
                // BUG FIX: outputDS.getSelectedRecords() can return stale data when records have been
                // removed in NEW mode. accumulatedRecords is the source of truth.
                const recordsToCaptureForRemove = (accumulatedRecords && accumulatedRecords.length > 0)
                  ? accumulatedRecords
                  : (outputDSSelectedRecordsForRemove.length > 0
                      ? outputDSSelectedRecordsForRemove
                      : (effectiveRecords && effectiveRecords.length > 0 
                          ? (effectiveRecords as FeatureDataRecord[])
                          : []))
                
                // DEBUG: Log which source was used
                debugLogger.log('RESULTS-MODE', {
                  event: 'mode-switch-debug-after-capture-remove',
                  widgetId,
                  recordsToCaptureCount: recordsToCaptureForRemove.length,
                  source: (accumulatedRecords && accumulatedRecords.length > 0)
                    ? 'accumulatedRecords' 
                    : (outputDSSelectedRecordsForRemove.length > 0 
                        ? 'outputDS.getSelectedRecords()' 
                        : (effectiveRecords && effectiveRecords.length > 0 ? 'effectiveRecords' : 'none')),
                  effectiveRecordsCount: effectiveRecordsCountForRemove,
                  outputDSSelectedCount: outputDSSelectedCountForRemove,
                  accumulatedRecordsCount: accumulatedRecordsCountForRemove,
                  note: 'r021.112: accumulatedRecords is single source of truth when switching from NEW mode',
                  timestamp: Date.now()
                })

                // DIAGNOSTIC: Check each condition individually (r018.78)
                const conditionCheckRemove = {
                  previousModeIsNew: previousMode === SelectionType.NewSelection,
                  newModeIsRemove: newMode === SelectionType.RemoveFromSelection,
                  hasRecordsToCapture: recordsToCaptureForRemove.length > 0,
                  hasOutputDS: !!outputDS,
                  hasOnAccumulatedRecordsChange: !!onAccumulatedRecordsChange,
                  previousMode: previousMode,
                  newMode: newMode,
                  recordsToCaptureLength: recordsToCaptureForRemove.length
                }
                
                debugLogger.log('RESULTS-MODE', {
                  event: 'mode-switch-condition-check-remove',
                  widgetId,
                  conditions: conditionCheckRemove,
                  allConditionsMet: conditionCheckRemove.previousModeIsNew && 
                                  conditionCheckRemove.newModeIsRemove && 
                                  conditionCheckRemove.hasRecordsToCapture && 
                                  conditionCheckRemove.hasOutputDS && 
                                  conditionCheckRemove.hasOnAccumulatedRecordsChange,
                  timestamp: Date.now()
                })

                if (previousMode === SelectionType.NewSelection && 
                    newMode === SelectionType.RemoveFromSelection &&
                    recordsToCaptureForRemove.length > 0 &&
                    outputDS &&
                    onAccumulatedRecordsChange) {
                  const existingAccumulated = accumulatedRecords || []
                  
                  // r021.87: Merge function reads __queryConfigId from record attributes
                  const mergeResult = mergeResultsIntoAccumulated(
                    outputDS as FeatureLayerDataSource,
                    recordsToCaptureForRemove,
                    existingAccumulated,
                    queryItems
                  )
                  
                  const mergedRecords = mergeResult.mergedRecords
                  
                  debugLogger.log('RESULTS-MODE', {
                    event: 'capturing-current-results-on-mode-switch-to-remove',
                    widgetId,
                    previousMode,
                    newMode,
                    capturedRecordsCount: recordsToCaptureForRemove.length,
                    effectiveRecordsCount: effectiveRecordsCountForRemove,
                    outputDSSelectedCount: outputDSSelectedCountForRemove,
                    existingAccumulatedCount: existingAccumulated.length,
                    mergedRecordsCount: mergedRecords.length,
                    sourceUsed: (accumulatedRecords && accumulatedRecords.length > 0)
                      ? 'accumulatedRecords' 
                      : (outputDSSelectedRecordsForRemove.length > 0 
                          ? 'outputDS.getSelectedRecords()' 
                          : (effectiveRecords && effectiveRecords.length > 0 ? 'effectiveRecords' : 'none')),
                    note: 'r021.112: accumulatedRecords is single source of truth when switching from NEW mode (reflects removals)'
                  })
                  
                  // r023.17: Only stamp queryConfigId on records that don't already have one.
                  // Same fix as Add mode - preserves existing queryConfigId from prior queries.
                  // r023.30: Also stamp originDSId for cross-layer removal support
                  const addedIdsFromMerge = mergeResult.addedRecordIds
                  const originDSIdForRemoveCapture = outputDS?.getOriginDataSources()?.[0]?.id || outputDS?.id
                  recordsToCaptureForRemove.forEach(record => {
                    const recordId = record.getId()
                    if (addedIdsFromMerge.includes(recordId) && record.feature?.attributes) {
                      if (!record.feature.attributes.__queryConfigId) {
                        record.feature.attributes.__queryConfigId = queryItem.configId
                      }
                      if (!record.feature.attributes.__originDSId && originDSIdForRemoveCapture) {
                        record.feature.attributes.__originDSId = originDSIdForRemoveCapture
                      }
                    }
                  })
                  
                  onAccumulatedRecordsChange(mergedRecords)
                } else {
                  debugLogger.log('RESULTS-MODE', {
                    event: 'mode-switch-merge-skipped-remove',
                    widgetId,
                    reason: 'condition-check-failed',
                    conditions: conditionCheckRemove,
                    timestamp: Date.now()
                  })
                }
                
                if (onResultsModeChange) {
                  onResultsModeChange(newMode)
                }
              }}
              aria-pressed={resultsMode === SelectionType.RemoveFromSelection}
              aria-label={`${getI18nMessage('removeFromCurrentResults')}: ${getI18nMessage('resultsModeDesc').split('\n')[3]?.trim() || ''}`}
              title={(!accumulatedRecords || accumulatedRecords.length === 0) 
                ? getI18nMessage('resultsModeDisabledRemove')
                : getI18nMessage('removeFromCurrentResults')}
              css={css`
                flex: 1;
                font-size: 0.8125rem;
                font-weight: 600;
                padding: 2px 10px;
                min-height: 26px;
                white-space: nowrap;
                overflow: hidden;
                display: inline-flex !important;
                align-items: center;
                justify-content: center;
                gap: 3px;
                border: none !important;
                border-radius: 3px !important;
                background: ${resultsMode === SelectionType.RemoveFromSelection
                  ? '#be123c' 
                  : 'transparent'} !important;
                color: ${resultsMode === SelectionType.RemoveFromSelection 
                  ? '#fff' 
                  : '#64748b'} !important;
                box-shadow: ${resultsMode === SelectionType.RemoveFromSelection
                  ? '0 1px 2px rgba(0,0,0,0.1)'
                  : 'none'} !important;
                transition: all 0.15s ease;
                cursor: pointer;
                &:hover:not(:disabled) {
                  background: ${resultsMode === SelectionType.RemoveFromSelection 
                    ? '#9f1239' 
                    : '#e2e8f0'} !important;
                }
                &:disabled {
                  opacity: 0.4;
                  cursor: not-allowed;
                }
              `}
            >
              <span css={css`font-size: 0.7rem;`}>&minus;</span>
              {getI18nMessage('resultsModeRemove')}
            </Button>
          </div>
        </div>
        {/* Logic summary bar - confirms active mode intent */}
        <div css={css`
          margin-top: 4px;
          padding: 3px 8px;
          border-radius: 3px;
          border-left: 2px solid ${
            resultsMode === SelectionType.NewSelection 
              ? '#3b82f6'
              : resultsMode === SelectionType.AddToSelection
              ? '#059669'
              : '#be123c'
          };
          background: ${
            resultsMode === SelectionType.NewSelection 
              ? 'rgba(59, 130, 246, 0.15)'
              : resultsMode === SelectionType.AddToSelection
              ? 'rgba(5, 150, 105, 0.15)'
              : 'rgba(225, 29, 72, 0.15)'
          };
          color: ${
            resultsMode === SelectionType.NewSelection 
              ? '#1e40af'
              : resultsMode === SelectionType.AddToSelection
              ? '#065f46'
              : '#9f1239'
          };
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          line-height: 1.3;
          transition: all 0.15s ease;
        `}>
          <span css={css`font-weight: 500; letter-spacing: -0.01em; opacity: 0.8;`}>
            {resultsMode === SelectionType.NewSelection && getI18nMessage('resultsModeLogicNew')}
            {resultsMode === SelectionType.AddToSelection && getI18nMessage('resultsModeLogicAdd')}
            {resultsMode === SelectionType.RemoveFromSelection && getI18nMessage('resultsModeLogicRemove')}
          </span>
        </div>
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
    </div>
  )
}
