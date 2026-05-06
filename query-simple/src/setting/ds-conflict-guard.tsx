/** @jsx jsx */
/**
 * ds-conflict-guard.tsx — Output Data Source Conflict Detection (warnings + fix)
 *
 * r027.018: Single-direction detection (offending widget only) — initial cut.
 * r027.022: Bidirectional detection — also alerts the "victim" widget when
 *   another QS widget is referencing this widget's output DS prefix.
 * r027.023: One-click fix button on the red banner — regenerates
 *   outputDataSourceIds using the widget's own prefix while preserving
 *   existing configIds. The amber banner stays informational; the fix
 *   belongs on the offending widget's side.
 *
 * Both directions detected in a single pass.
 */

import {
  React,
  jsx,
  css,
  type ImmutableArray
} from 'jimu-core'
import { getAppConfigAction } from 'jimu-for-builder'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { SuccessOutlined } from 'jimu-icons/outlined/suggested/success'
import type { QueryItemType } from '../config'
import type { ValueManSetByKeyType } from './setting-config'

interface Props {
  widgetId: string
  queryItems: ImmutableArray<QueryItemType>
  updateConfigForOptions: (...pairs: ValueManSetByKeyType[]) => void
}

type DetectionResult =
  | { type: 'own-conflict', foreignWidgetId: string, foreignLabel: string, count: number, total: number }
  | { type: 'poached', poacherId: string, poacherLabel: string, count: number }
  | null

function detectConflict (
  widgetId: string,
  queryItems: ImmutableArray<QueryItemType>
): DetectionResult {
  if (!queryItems || queryItems.length === 0) return null

  const myPrefix = `${widgetId}_output_`

  // Direction 1: am I using another widget's output DS prefix?
  const bad = queryItems.filter(qi => {
    const ods = qi.outputDataSourceId || ''
    return ods.length > 0 && !ods.startsWith(myPrefix)
  })

  if (bad.length > 0) {
    const match = bad[0].outputDataSourceId.match(/^(widget_\d+)_output_/)
    if (match) {
      const foreignWidgetId = match[1]
      let foreignLabel = foreignWidgetId
      try {
        const w = getAppConfigAction().appConfig?.widgets?.[foreignWidgetId]
        if (w?.label) foreignLabel = w.label
      } catch (_e) { /* fallback to ID */ }
      return { type: 'own-conflict', foreignWidgetId, foreignLabel, count: bad.length, total: queryItems.length }
    }
  }

  // Direction 2: is another QS widget using my prefix?
  try {
    const widgets = getAppConfigAction().appConfig?.widgets
    if (widgets) {
      for (const [wid, wdata] of Object.entries(widgets as Record<string, any>)) {
        if (wid === widgetId) continue
        if (!wdata || wdata.uri !== 'widgets/query-simple/') continue
        const items = wdata.config?.queryItems ?? []
        const stolen = items.filter((qi: any) => (qi.outputDataSourceId || '').startsWith(myPrefix))
        if (stolen.length > 0) {
          return {
            type: 'poached',
            poacherId: wid,
            poacherLabel: wdata.label || wid,
            count: stolen.length
          }
        }
      }
    }
  } catch (_e) { /* app config unavailable */ }

  return null
}

const redBanner = css`
  margin: 8px 16px 4px;
  padding: 10px 12px;
  border: 1px solid #f5a3a3;
  border-radius: 4px;
  background: #fef2f2;
  font-size: 12px;
  line-height: 1.5;
`

const redTitle = css`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #b91c1c;
  margin-bottom: 6px;
`

const redIcon = css`
  color: #b91c1c;
  flex-shrink: 0;
`

const redBody = css`
  color: #3a0a0a;
  margin-bottom: 8px;
`

const fixButton = css`
  padding: 5px 12px;
  border: 1px solid #b91c1c;
  border-radius: 3px;
  background: #b91c1c;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: #991919;
    border-color: #991919;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const amberBanner = css`
  margin: 8px 16px 4px;
  padding: 10px 12px;
  border: 1px solid #fbbf24;
  border-radius: 4px;
  background: #fef9c3;
  font-size: 12px;
  line-height: 1.5;
`

const amberTitle = css`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 6px;
`

const amberIcon = css`
  color: #92400e;
  flex-shrink: 0;
`

const amberBody = css`
  color: #4a2c0a;
`

const successBanner = css`
  margin: 8px 16px 4px;
  padding: 10px 12px;
  border: 1px solid #86efac;
  border-radius: 4px;
  background: #f0fdf4;
  font-size: 12px;
  line-height: 1.5;
`

const successTitle = css`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 4px;
`

const successIcon = css`
  color: #166534;
  flex-shrink: 0;
`

const successBody = css`
  color: #14532d;
`

export function DsConflictGuard (props: Props) {
  const { widgetId, queryItems, updateConfigForOptions } = props
  const [fixed, setFixed] = React.useState(false)

  const result = React.useMemo(
    () => (fixed ? null : detectConflict(widgetId, queryItems)),
    [widgetId, queryItems, fixed]
  )

  const handleFix = React.useCallback(() => {
    const myPrefix = `${widgetId}_output_`
    const fixedItems = queryItems.asMutable({ deep: true }).map(qi => {
      const correctId = `${myPrefix}${qi.configId}`
      if (qi.outputDataSourceId !== correctId) {
        qi.outputDataSourceId = correctId
      }
      return qi
    })
    updateConfigForOptions(['queryItems', fixedItems, { dsUpdateRequired: true }])
    setFixed(true)
  }, [widgetId, queryItems, updateConfigForOptions])

  if (fixed) {
    return (
      <div css={successBanner}>
        <div css={successTitle}>
          <SuccessOutlined size={14} css={successIcon} />
          IDs Regenerated
        </div>
        <div css={successBody}>
          Output data source IDs rebuilt using {widgetId}'s prefix.
          Save the app to persist this change. If the warning returns after
          reload, the framework dropped the change on save and a manual
          config edit is needed.
        </div>
      </div>
    )
  }

  if (result?.type === 'own-conflict') {
    return (
      <div css={redBanner}>
        <div css={redTitle}>
          <WarningOutlined size={14} css={redIcon} />
          Output Data Source Conflict
        </div>
        <div css={redBody}>
          {result.count} of {result.total} query items reference
          output IDs owned by <strong>{result.foreignLabel}</strong> ({result.foreignWidgetId}).
          This causes crashes when both widgets are active. This typically happens
          when a widget config is copy-pasted without regenerating IDs.
        </div>
        <button
          type='button'
          css={fixButton}
          onClick={handleFix}
          title={`Regenerate all outputDataSourceIds to use ${widgetId} prefix`}
        >
          Fix: Regenerate IDs for {widgetId}
        </button>
      </div>
    )
  }

  if (result?.type === 'poached') {
    return (
      <div css={amberBanner}>
        <div css={amberTitle}>
          <WarningOutlined size={14} css={amberIcon} />
          Another Widget Is Reusing Your IDs
        </div>
        <div css={amberBody}>
          <strong>{result.poacherLabel}</strong> ({result.poacherId}) has {result.count} query
          {result.count === 1 ? ' item' : ' items'} referencing this
          widget's output data source IDs. Open {result.poacherLabel}'s settings
          to fix the conflict there.
        </div>
      </div>
    )
  }

  return null
}
