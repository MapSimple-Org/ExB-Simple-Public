/**
 * Color resolution for feed items.
 *
 * Supports two modes:
 * - 'exact': Maps exact string values to colors (e.g., "Closed" → red)
 * - 'range': Maps numeric ranges to colors (e.g., 2.5–5.0 → orange)
 *
 * @module color-resolver
 */

import type { StatusColorMap, RangeColorBreak } from '../config'
import type { FeedItem } from './parsers/interface'

export interface ColorResolverConfig {
  /** Which field to read the value from */
  statusField: string
  /** Color mode: 'exact' (string match) or 'range' (numeric ranges) */
  colorMode: 'exact' | 'range'
  /** Exact-match color map (used when colorMode = 'exact') */
  statusColorMap?: StatusColorMap
  /** Numeric range breaks (used when colorMode = 'range') */
  rangeColorBreaks?: RangeColorBreak[]
}

/**
 * Resolve the background color for a feed item.
 * Returns a hex color string or 'transparent' if no match.
 */
export function resolveCardColor (item: FeedItem, config: ColorResolverConfig): string {
  const { statusField, colorMode } = config
  if (!statusField || !item[statusField]) return 'transparent'

  const rawValue = item[statusField]

  if (colorMode === 'range') {
    return resolveRangeColor(rawValue, config.rangeColorBreaks) || 'transparent'
  }

  // Default: exact match
  return resolveExactColor(rawValue, config.statusColorMap) || 'transparent'
}

/**
 * Exact string match against the StatusColorMap.
 */
function resolveExactColor (value: string, colorMap?: StatusColorMap): string | null {
  if (!colorMap) return null
  const mapped = (colorMap as any)[value]
  if (!mapped) return null
  return mapped.startsWith('#') ? mapped : `#${mapped}`
}

/**
 * Numeric range match against RangeColorBreak[].
 * Matches the FIRST break where min <= value < max.
 * null bounds are treated as unbounded (-∞ or +∞).
 */
function resolveRangeColor (value: string, breaks?: RangeColorBreak[]): string | null {
  const match = findMatchingBreak(value, breaks)
  return match ? (match.color.startsWith('#') ? match.color : `#${match.color}`) : null
}

/**
 * Find the matching RangeColorBreak for a numeric value.
 * Returns the break object (with label, index, etc.) or null.
 */
function findMatchingBreak (value: string, breaks?: RangeColorBreak[]): RangeColorBreak | null {
  if (!breaks || breaks.length === 0) return null

  const num = parseFloat(value)
  if (isNaN(num)) return null

  for (const brk of breaks) {
    const aboveMin = brk.min === null || brk.min === undefined || num >= brk.min
    const belowMax = brk.max === null || brk.max === undefined || num < brk.max
    if (aboveMin && belowMax) {
      return brk
    }
  }

  return null
}

// ── Virtual Field Name ──────────────────────────────────────────

/** The virtual field name injected into items for range label search/sort */
export const RANGE_LABEL_FIELD = '__colorRangeLabel'

/** The virtual field for sort-order (numeric index of the break, for natural ordering) */
export const RANGE_ORDER_FIELD = '__colorRangeOrder'

/**
 * Enrich feed items with virtual range label fields.
 * Adds `__colorRangeLabel` (the label text) and `__colorRangeOrder`
 * (the break index as a string, for sort ordering).
 *
 * Returns the same items array with fields added in-place for performance.
 * Only modifies items when colorMode is 'range' and breaks have labels.
 */
export function enrichItemsWithRangeLabels (
  items: FeedItem[],
  config: ColorResolverConfig
): FeedItem[] {
  if (config.colorMode !== 'range' || !config.rangeColorBreaks || config.rangeColorBreaks.length === 0) {
    return items
  }

  const breaks = config.rangeColorBreaks
  const hasLabels = breaks.some(b => b.label && b.label.trim())
  if (!hasLabels) return items

  for (const item of items) {
    const rawValue = item[config.statusField]
    if (!rawValue) {
      item[RANGE_LABEL_FIELD] = ''
      item[RANGE_ORDER_FIELD] = String(breaks.length) // unmatched → last
      continue
    }

    const matchIdx = breaks.findIndex(brk => {
      const num = parseFloat(rawValue)
      if (isNaN(num)) return false
      const aboveMin = brk.min === null || brk.min === undefined || num >= brk.min
      const belowMax = brk.max === null || brk.max === undefined || num < brk.max
      return aboveMin && belowMax
    })

    if (matchIdx >= 0) {
      item[RANGE_LABEL_FIELD] = breaks[matchIdx].label || ''
      item[RANGE_ORDER_FIELD] = String(matchIdx)
    } else {
      item[RANGE_LABEL_FIELD] = ''
      item[RANGE_ORDER_FIELD] = String(breaks.length)
    }
  }

  return items
}
