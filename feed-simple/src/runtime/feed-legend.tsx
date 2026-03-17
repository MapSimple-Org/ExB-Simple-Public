/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import { Button } from 'jimu-ui'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { UpOutlined } from 'jimu-icons/outlined/directional/up'
import type { StatusColorMap, RangeColorBreak } from '../config'

interface ColorLegendProps {
  colorMode: 'exact' | 'range'
  statusColorMap?: StatusColorMap
  rangeColorBreaks?: RangeColorBreak[]
}

/**
 * ColorLegend — collapsible color key bar above the card list.
 *
 * Collapsed: inline row of color swatches with labels.
 * Expanded: vertical list with larger swatches + range bounds.
 */
export default function ColorLegend (props: ColorLegendProps): React.ReactElement | null {
  const { colorMode, statusColorMap, rangeColorBreaks } = props
  const [expanded, setExpanded] = React.useState(false)

  // Build legend entries from config
  const entries = React.useMemo(() => {
    if (colorMode === 'range' && rangeColorBreaks?.length > 0) {
      return rangeColorBreaks.map((brk, i) => ({
        key: `range-${i}`,
        color: brk.color,
        label: brk.label || formatRange(brk.min, brk.max),
        detail: brk.label ? formatRange(brk.min, brk.max) : null
      }))
    }
    if (colorMode === 'exact' && statusColorMap && Object.keys(statusColorMap).length > 0) {
      return Object.entries(statusColorMap).map(([value, color]) => ({
        key: `exact-${value}`,
        color,
        label: value,
        detail: null
      }))
    }
    return []
  }, [colorMode, statusColorMap, rangeColorBreaks])

  if (entries.length === 0) return null

  const toggleExpanded = React.useCallback(() => {
    setExpanded(prev => !prev)
  }, [])

  return (
    <div css={containerStyle}>
      {/* Collapsed row — swatches inline */}
      <div css={headerRowStyle}>
        <div css={swatchRowStyle}>
          {entries.map(entry => (
            <div key={entry.key} css={swatchItemStyle}>
              <span css={css`
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 2px;
                background: ${entry.color};
                border: 1px solid rgba(0, 0, 0, 0.2);
                flex-shrink: 0;
              `} />
              <span css={swatchLabelStyle}>{entry.label}</span>
            </div>
          ))}
        </div>
        <Button
          type='tertiary'
          size='sm'
          icon
          onClick={toggleExpanded}
          title={expanded ? 'Collapse' : 'Expand'}
          css={toggleBtnStyle}
        >
          {expanded ? <UpOutlined size={12} /> : <DownOutlined size={12} />}
        </Button>
      </div>

      {/* Expanded detail view */}
      {expanded && (
        <div css={expandedContainerStyle}>
          {entries.map(entry => (
            <div key={entry.key} css={expandedRowStyle}>
              <span css={css`
                display: inline-block;
                width: 16px;
                height: 16px;
                border-radius: 3px;
                background: ${entry.color};
                border: 1px solid rgba(0, 0, 0, 0.2);
                flex-shrink: 0;
              `} />
              <span css={expandedLabelStyle}>
                {entry.label}
                {entry.detail && (
                  <span css={expandedDetailStyle}> ({entry.detail})</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Helpers ---

function formatRange (min: number | null, max: number | null): string {
  if (min == null && max == null) return 'All'
  if (min == null) return `< ${max}`
  if (max == null) return `${min}+`
  return `${min}–${max}`
}

// --- Styles ---

const containerStyle = css`
  padding: 6px 0;
  border-bottom: 1px solid var(--sys-color-divider-secondary, #e0e0e0);
`

const headerRowStyle = css`
  display: flex;
  align-items: center;
  gap: 4px;
`

const swatchRowStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  min-width: 0;
  align-items: center;
`

const swatchItemStyle = css`
  display: flex;
  align-items: center;
  gap: 4px;
`

const swatchLabelStyle = css`
  font-size: 11px;
  color: var(--ref-palette-neutral-1000, #333);
  white-space: nowrap;
  line-height: 1;
`

const toggleBtnStyle = css`
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
  flex-shrink: 0;
`

const expandedContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 0 2px 0;
`

const expandedRowStyle = css`
  display: flex;
  align-items: center;
  gap: 6px;
`

const expandedLabelStyle = css`
  font-size: 12px;
  color: var(--ref-palette-neutral-1000, #333);
  line-height: 1.3;
`

const expandedDetailStyle = css`
  font-size: 11px;
  color: var(--sys-color-text-tertiary, #888);
`
