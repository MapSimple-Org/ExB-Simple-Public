/** @jsx jsx */
/**
 * rebind-tool.tsx — Data Source Rebinding UI component.
 *
 * r026.018: Initial implementation — settings panel tool that lets users rebind
 *   query items to a new data source when a layer is replaced in the web map.
 * r026.020: Added debug logging and orphan DS cleanup confirmation messaging.
 * r026.023: Removed unreliable green/red status dots (DS resolution check was
 *   inconsistent between widgets). Status indicators now deferred to ExB's
 *   built-in DataSourceTip on individual query items.
 * r026.024: Wrapped getDataSource() in try/catch to prevent tab lock-up when
 *   broken DS IDs throw instead of returning null.
 *
 * Two modes:
 *   - Auto-heal: all field names match between old and new DS → one-click apply.
 *   - Field mapping: field names differ → interactive mapping table where user
 *     maps old fields to new fields, with option to skip unmapped ones.
 *
 * Cleanup: After rebinding, the old data source reference is automatically
 * removed from the widget's useDataSources via the `dsUpdateRequired` flag,
 * which triggers `getAllDataSources()` to rebuild from current query items only.
 *
 * Placed in the settings panel via query-item-list.tsx.
 */

import {
  React,
  jsx,
  css,
  Immutable,
  type ImmutableArray,
  type UseDataSource,
  DataSourceManager,
  AllDataSourceTypes,
  hooks
} from 'jimu-core'
import { Button, Select, Option } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { SettingSection } from 'jimu-ui/advanced/setting-components'
import type { QueryItemType } from '../config'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import type { ValueManSetByKeyType } from './setting-config'
import {
  analyzeRebinding,
  applyRebinding,
  buildIdentityFieldMap,
  type AnalysisResult
} from './rebind-utils'
import defaultMessages from './translations/default'

const debugLogger = createQuerySimpleDebugLogger()

// ── Constants ────────────────────────────────────────────────────

/** Data source types allowed for rebinding target selection */
const dsTypes = Immutable([
  AllDataSourceTypes.FeatureLayer,
  AllDataSourceTypes.SceneLayer,
  AllDataSourceTypes.BuildingComponentSubLayer,
  AllDataSourceTypes.OrientedImageryLayer,
  AllDataSourceTypes.ImageryLayer,
  AllDataSourceTypes.SubtypeSublayer
])

// ── Interfaces ───────────────────────────────────────────────────

interface Props {
  /** Widget ID — passed to DataSourceSelector for context */
  widgetId: string
  /** All query items in the widget config — used to find DS references */
  queryItems: ImmutableArray<QueryItemType>
  /** Config setter from parent settings — triggers getAllDataSources() when dsUpdateRequired */
  updateConfigForOptions: (...args: ValueManSetByKeyType[]) => void
}

/**
 * Deduplicated data source entry built from query items.
 * Multiple query items can reference the same data source.
 */
interface DataSourceEntry {
  /** Full data source ID (e.g., "dataSource_1-19ae1ed5667-layer-2-2") */
  dsId: string
  /** Friendly label — resolved from DS or fallback to query item name */
  label: string
  /** Number of query items referencing this data source */
  queryCount: number
  /** Indices of query items referencing this data source */
  queryIndices: number[]
}

/**
 * State for an in-progress rebinding operation.
 * Tracks the selected target DS, field analysis, and user mapping choices.
 */
interface RebindState {
  /** Which DS ID is being rebound (null = no rebind in progress) */
  activeDsId: string | null
  /** The new UseDataSource selected via DataSourceSelector */
  newUseDataSource: UseDataSource | null
  /** Field names available in the new data source (from schema) */
  newFieldNames: string[]
  /** Analysis comparing old field references to new DS fields */
  analysis: AnalysisResult | null
  /** User's field mapping choices for unmatched fields (old name → new name) */
  fieldMapping: Record<string, string>
  /** When true, unmatched fields are left as-is instead of blocking apply */
  skipUnmapped: boolean
  /** Success message displayed after a completed rebinding */
  successMessage: string | null
}

const initialRebindState: RebindState = {
  activeDsId: null,
  newUseDataSource: null,
  newFieldNames: [],
  analysis: null,
  fieldMapping: {},
  skipUnmapped: false,
  successMessage: null
}

/**
 * RebindTool — Data Source Management panel in the settings sidebar.
 *
 * Displays a collapsible list of unique data sources referenced by query items.
 * Each entry has a "Rebind" button that opens a target DS selector.
 * After selection, runs field analysis (auto-heal or manual mapping), then
 * applies the rebinding via `applyRebinding()` from rebind-utils.ts.
 *
 * Cleanup of orphaned DS references is automatic — the `dsUpdateRequired` flag
 * triggers `getAllDataSources()` which only includes DS IDs still in use.
 */
export function RebindTool (props: Props): React.ReactElement {
  const { widgetId, queryItems, updateConfigForOptions } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const [rebindState, setRebindState] = React.useState<RebindState>(initialRebindState)
  const [isCollapsed, setIsCollapsed] = React.useState(true)

  // Build deduplicated data source entries from query items.
  // Groups by dsId so each unique DS shows once with a count of how many queries use it.
  const dsEntries = React.useMemo((): DataSourceEntry[] => {
    const map = new Map<string, DataSourceEntry>()
    const items = Immutable(queryItems).asMutable({ deep: true }) as QueryItemType[]

    items.forEach((item, idx) => {
      const dsId = item.useDataSource?.dataSourceId || item.useDataSource?.mainDataSourceId
      if (!dsId) return

      if (!map.has(dsId)) {
        // Wrap in try/catch — getDataSource() can throw on broken/removed layers
        let ds: any = null
        try {
          ds = DataSourceManager.getInstance().getDataSource(dsId)
        } catch (e) {
          debugLogger.log('REBIND', { action: 'ds-resolve-error', dsId, error: String(e) })
        }

        // Build a friendly label: direct DS label → query item name(s) → raw ID
        let label = ds?.getLabel?.() || ds?.getDataSourceJson?.()?.label || ''
        if (!label) {
          // Gather query item names that reference this DS as a fallback label
          const names = items
            .filter(qi => (qi.useDataSource?.dataSourceId || qi.useDataSource?.mainDataSourceId) === dsId)
            .map(qi => qi.name)
            .filter(Boolean)
          const uniqueNames = [...new Set(names)]
          label = uniqueNames.length > 0 ? uniqueNames[0] : dsId
        }

        map.set(dsId, {
          dsId,
          label,
          queryCount: 0,
          queryIndices: []
        })
      }
      const entry = map.get(dsId)
      entry.queryCount++
      entry.queryIndices.push(idx)
    })

    return Array.from(map.values())
  }, [queryItems])

  // Handle new data source selection from DataSourceSelector.
  // Reads the new DS's schema fields, then runs analyzeRebinding() to determine
  // whether auto-heal is possible or manual field mapping is needed.
  const handleNewDsSelected = React.useCallback((useDataSources: UseDataSource[]) => {
    const newDs = useDataSources?.[0]
    if (!newDs) return

    // Get schema fields from the new data source
    const ds = DataSourceManager.getInstance().getDataSource(newDs.dataSourceId)
    const schema = ds?.getSchema?.()
    const fieldNames = schema?.fields ? Object.keys(schema.fields) : []
    const newFieldSet = new Set(fieldNames)

    // Run analysis
    const items = Immutable(queryItems).asMutable({ deep: true }) as QueryItemType[]
    const analysis = analyzeRebinding(rebindState.activeDsId, newFieldSet, items)

    // Pre-populate field mapping with auto-matches
    const mapping: Record<string, string> = {}
    for (const f of analysis.matchedFields) {
      mapping[f] = f
    }

    setRebindState(prev => ({
      ...prev,
      newUseDataSource: newDs,
      newFieldNames: fieldNames,
      analysis,
      fieldMapping: mapping,
      successMessage: null
    }))
  }, [queryItems, rebindState.activeDsId])

  // Handle individual field mapping change in the manual mapping table.
  // Called when user selects a new field from the dropdown for an unmatched old field.
  const handleFieldMapChange = React.useCallback((oldField: string, newField: string) => {
    setRebindState(prev => ({
      ...prev,
      fieldMapping: { ...prev.fieldMapping, [oldField]: newField }
    }))
  }, [])

  // Apply the rebinding
  const handleApply = React.useCallback(() => {
    if (!rebindState.activeDsId || !rebindState.newUseDataSource || !rebindState.analysis) return

    const items = Immutable(queryItems).asMutable({ deep: true }) as QueryItemType[]
    const fieldMap = rebindState.analysis.autoHealEligible
      ? buildIdentityFieldMap(rebindState.analysis.oldFieldNames)
      : rebindState.fieldMapping

    const updatedItems = applyRebinding(
      rebindState.activeDsId,
      rebindState.newUseDataSource,
      items,
      fieldMap
    )

    const affectedCount = rebindState.analysis.affectedIndices.length
    const oldDsId = rebindState.activeDsId
    const newDsId = rebindState.newUseDataSource.dataSourceId

    debugLogger.log('REBIND', {
      action: 'apply',
      oldDsId,
      newDsId,
      affectedQueryItems: affectedCount,
      autoHeal: rebindState.analysis.autoHealEligible,
      fieldMap
    })

    // Update config — dsUpdateRequired triggers getAllDataSources() rebuild,
    // which reconstructs useDataSources from current query items only.
    // The old data source is excluded because no query items reference it anymore.
    updateConfigForOptions(['queryItems', updatedItems, { dsUpdateRequired: true }])

    debugLogger.log('REBIND', {
      action: 'cleanup-complete',
      removedDsId: oldDsId,
      note: 'Old DS removed from widget useDataSources via getAllDataSources() rebuild'
    })

    setRebindState({
      ...initialRebindState,
      successMessage: `Rebound ${affectedCount} query item(s) to new data source. Old data source reference removed.`
    })
  }, [queryItems, rebindState, updateConfigForOptions])

  // Cancel rebinding
  const handleCancel = React.useCallback(() => {
    setRebindState(initialRebindState)
  }, [])

  // Determine if the Apply button should be enabled.
  // Auto-heal: always allowed (all fields match).
  // Manual mapping: allowed when every unmatched field has a mapping OR skipUnmapped is checked.
  const canApply = React.useMemo(() => {
    if (!rebindState.analysis) return false
    if (rebindState.analysis.autoHealEligible) return true
    if (rebindState.skipUnmapped) return true
    return rebindState.analysis.unmatchedFields.every(f => !!rebindState.fieldMapping[f])
  }, [rebindState])

  if (dsEntries.length === 0) return null

  return (
    <SettingSection
      role='group'
      aria-label={getI18nMessage('rebindDataSourceMgmt')}
      title={
        <div css={css`display: flex; align-items: center; gap: 6px; width: 100%;`}>
          <button
            type='button'
            onClick={() => setIsCollapsed(!isCollapsed)}
            css={css`
              display: flex; align-items: center; gap: 4px;
              background: none; border: none; padding: 0; cursor: pointer;
              font-size: 13px; font-weight: 500;
              color: inherit;
            `}
          >
            <span css={css`
              display: inline-block; transition: transform 0.15s;
              transform: ${isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)'};
              font-size: 10px;
            `}>▶</span>
            {getI18nMessage('rebindDataSourceMgmt')}
          </button>
        </div>
      }
    >
      {!isCollapsed && (
        <div>
          {/* Success message */}
          {rebindState.successMessage && (
            <div css={css`
              padding: 6px 8px; margin-bottom: 8px;
              background: var(--ref-palette-green-100, #d4edda);
              color: var(--ref-palette-green-900, #155724);
              border-radius: 4px; font-size: 12px;
            `}>
              {rebindState.successMessage}
            </div>
          )}

          {/* Data source list */}
          {dsEntries.map(entry => (
            <div key={entry.dsId} css={css`
              margin-bottom: 8px; padding: 6px 8px;
              border: 1px solid var(--sys-color-divider-secondary, #e0e0e0);
              border-radius: 4px;
              background: var(--sys-color-surface-paper, #fff);
            `}>
              {/* DS row */}
              <div css={css`display: flex; align-items: center; gap: 6px; justify-content: space-between;`}>
                <div css={css`display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;`}>
                  <span css={css`font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`}>
                    {entry.label}
                  </span>
                  <span css={css`font-size: 11px; color: var(--sys-color-text-tertiary); flex-shrink: 0;`}>
                    ({entry.queryCount} {entry.queryCount === 1 ? 'query' : 'queries'})
                  </span>
                </div>
                <Button
                  size='sm'
                  type='default'
                  onClick={() => {
                    if (rebindState.activeDsId === entry.dsId) {
                      handleCancel()
                    } else {
                      setRebindState({ ...initialRebindState, activeDsId: entry.dsId })
                    }
                  }}
                  css={css`flex-shrink: 0;`}
                >
                  {rebindState.activeDsId === entry.dsId ? getI18nMessage('rebindCancel') : getI18nMessage('rebindButton')}
                </Button>
              </div>

              {/* Rebind panel (expanded when this DS is active) */}
              {rebindState.activeDsId === entry.dsId && (
                <div css={css`margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--sys-color-divider-secondary, #e0e0e0);`}>
                  <div css={css`font-size: 11px; color: var(--sys-color-text-secondary); margin-bottom: 6px;`}>
                    {getI18nMessage('rebindNewSource')}
                  </div>
                  <DataSourceSelector
                    widgetId={widgetId}
                    mustUseDataSource
                    closeDataSourceListOnChange
                    types={dsTypes}
                    isMultiple={false}
                    useDataSources={rebindState.newUseDataSource ? Immutable([rebindState.newUseDataSource]) as any : undefined}
                    onChange={handleNewDsSelected}
                  />

                  {/* Analysis result */}
                  {rebindState.analysis && (
                    <div css={css`margin-top: 8px;`}>
                      {rebindState.analysis.autoHealEligible ? (
                        /* Auto-heal mode */
                        <div>
                          <div css={css`
                            padding: 6px 8px; margin-bottom: 8px;
                            background: var(--ref-palette-green-100, #d4edda);
                            color: var(--ref-palette-green-900, #155724);
                            border-radius: 4px; font-size: 12px;
                          `}>
                            {getI18nMessage('rebindAllFieldsMatch').replace('{count}', String(rebindState.analysis.matchedFields.length))}
                          </div>
                          <div css={css`display: flex; gap: 8px; justify-content: flex-end;`}>
                            <Button size='sm' type='default' onClick={handleCancel}>
                              {getI18nMessage('rebindCancel')}
                            </Button>
                            <Button size='sm' type='primary' onClick={handleApply}>
                              {getI18nMessage('rebindApply')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Field mapping mode */
                        <div>
                          <div css={css`
                            padding: 6px 8px; margin-bottom: 8px;
                            background: var(--ref-palette-yellow-100, #fff3cd);
                            color: var(--ref-palette-yellow-900, #856404);
                            border-radius: 4px; font-size: 12px;
                          `}>
                            {getI18nMessage('rebindFieldsMismatch')
                              .replace('{unmatched}', String(rebindState.analysis.unmatchedFields.length))
                              .replace('{total}', String(rebindState.analysis.oldFieldNames.length))}
                          </div>

                          {/* Mapping table */}
                          <div css={css`
                            font-size: 12px;
                            border: 1px solid var(--sys-color-divider-secondary, #e0e0e0);
                            border-radius: 4px;
                            overflow: hidden;
                          `}>
                            {/* Header */}
                            <div css={css`
                              display: flex; padding: 4px 8px;
                              background: var(--ref-palette-neutral-300, #f0f0f0);
                              font-weight: 600; font-size: 11px;
                              border-bottom: 1px solid var(--sys-color-divider-secondary, #e0e0e0);
                            `}>
                              <span css={css`flex: 1;`}>{getI18nMessage('rebindOldField')}</span>
                              <span css={css`flex: 1;`}>{getI18nMessage('rebindNewField')}</span>
                            </div>

                            {/* Field rows */}
                            {rebindState.analysis.oldFieldNames.map(oldField => {
                              const isMatched = rebindState.analysis.matchedFields.includes(oldField)
                              const currentMapping = rebindState.fieldMapping[oldField]
                              return (
                                <div key={oldField} css={css`
                                  display: flex; align-items: center; padding: 3px 8px;
                                  border-bottom: 1px solid var(--sys-color-divider-tertiary, #f0f0f0);
                                  &:last-child { border-bottom: none; }
                                `}>
                                  <div css={css`flex: 1; display: flex; align-items: center; gap: 4px;`}>
                                    <span css={css`
                                      font-family: 'SFMono-Regular', Consolas, monospace;
                                      font-size: 11px;
                                    `}>
                                      {oldField}
                                    </span>
                                    {isMatched
                                      ? <span css={css`color: var(--ref-palette-green-600, #28a745); font-size: 10px;`}>✓</span>
                                      : <span css={css`color: var(--ref-palette-red-600, #dc3545); font-size: 10px;`}>⚠</span>
                                    }
                                  </div>
                                  <div css={css`flex: 1;`}>
                                    {isMatched ? (
                                      <span css={css`font-size: 11px; color: var(--sys-color-text-tertiary);`}>
                                        {oldField} (matched)
                                      </span>
                                    ) : (
                                      <Select
                                        size='sm'
                                        value={currentMapping || ''}
                                        onChange={(e) => handleFieldMapChange(oldField, (e.target as HTMLSelectElement).value)}
                                        css={css`font-size: 11px;`}
                                      >
                                        <Option value=''>(select field)</Option>
                                        {rebindState.newFieldNames.map(nf => (
                                          <Option key={nf} value={nf}>{nf}</Option>
                                        ))}
                                      </Select>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Skip unmapped checkbox */}
                          <label css={css`
                            display: flex; align-items: center; gap: 6px;
                            margin-top: 8px; font-size: 11px; cursor: pointer;
                            color: var(--sys-color-text-secondary);
                          `}>
                            <input
                              type='checkbox'
                              checked={rebindState.skipUnmapped}
                              onChange={(e) => setRebindState(prev => ({ ...prev, skipUnmapped: e.target.checked }))}
                            />
                            {getI18nMessage('rebindLeaveUnmapped')}
                          </label>

                          {/* Action buttons */}
                          <div css={css`display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;`}>
                            <Button size='sm' type='default' onClick={handleCancel}>
                              {getI18nMessage('rebindCancel')}
                            </Button>
                            <Button size='sm' type='primary' onClick={handleApply} disabled={!canApply}>
                              {getI18nMessage('rebindApply')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SettingSection>
  )
}
