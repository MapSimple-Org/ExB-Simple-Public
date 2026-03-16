import type { FeedItem } from './parsers/interface'

/**
 * Feed processing pipeline utilities.
 *
 * Pipeline order: filter → search → sort → paginate
 * Each function is pure and returns a new array.
 */

// ── Step 1: Status Filter ─────────────────────────────────────────

/**
 * Remove items whose status field value is in the hide list.
 * Returns all items if no statusField or filterByStatus is configured.
 */
export function applyStatusFilter (
  items: FeedItem[],
  statusField: string,
  filterByStatus: string[]
): FeedItem[] {
  if (!statusField || !filterByStatus || filterByStatus.length === 0) {
    return items
  }
  return items.filter(item => !filterByStatus.includes(item[statusField] ?? ''))
}

// ── Step 1b: Numeric Range Filter ────────────────────────────────

/**
 * Remove items whose numeric status field value falls outside
 * the configured min/max bounds. Used when colorMode is 'range'.
 * Returns all items if no bounds are set or field is missing.
 */
export function applyNumericFilter (
  items: FeedItem[],
  statusField: string,
  filterMin: number | null | undefined,
  filterMax: number | null | undefined
): FeedItem[] {
  if (!statusField) return items
  const hasMin = filterMin !== null && filterMin !== undefined && !isNaN(filterMin)
  const hasMax = filterMax !== null && filterMax !== undefined && !isNaN(filterMax)
  if (!hasMin && !hasMax) return items

  return items.filter(item => {
    const raw = item[statusField]
    if (raw == null || raw === '') return false
    const num = parseFloat(raw)
    if (isNaN(num)) return false
    if (hasMin && num < filterMin) return false
    if (hasMax && num > filterMax) return false
    return true
  })
}

// ── Step 2: Text Search ───────────────────────────────────────────

/**
 * Filter items by case-insensitive substring match across specified fields.
 * If searchFields is empty, searches all fields on each item.
 * Returns all items if query is empty.
 */
export function searchItems (
  items: FeedItem[],
  query: string,
  searchFields: string[]
): FeedItem[] {
  if (!query || query.trim() === '') return items

  const lowerQuery = query.toLowerCase().trim()

  return items.filter(item => {
    const fields = searchFields.length > 0 ? searchFields : Object.keys(item)
    return fields.some(field => {
      const val = item[field]
      return val != null && val.toLowerCase().includes(lowerQuery)
    })
  })
}

// ── Step 3: Sort ──────────────────────────────────────────────────

/**
 * Sort items by a field with automatic type detection.
 * Tries date parsing first, then numeric, then falls back to string.
 *
 * @param reverseFeedOrder - When true and no sortField, reverses the feed's natural order
 */
export function sortItems (
  items: FeedItem[],
  sortField: string,
  sortDirection: 'asc' | 'desc',
  reverseFeedOrder?: boolean
): FeedItem[] {
  if (!sortField) {
    return reverseFeedOrder ? [...items].reverse() : items
  }

  const dir = sortDirection === 'desc' ? -1 : 1

  return [...items].sort((a, b) => {
    const valA = a[sortField] ?? ''
    const valB = b[sortField] ?? ''

    // Try date parsing first
    const dateA = Date.parse(valA)
    const dateB = Date.parse(valB)
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return (dateA - dateB) * dir
    }

    // Try numeric comparison
    const numA = Number(valA)
    const numB = Number(valB)
    if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
      return (numA - numB) * dir
    }

    // Fall back to case-insensitive string comparison
    return valA.localeCompare(valB, undefined, { sensitivity: 'base' }) * dir
  })
}

// ── Step 4: Paginate ──────────────────────────────────────────────

/**
 * Slice items for show-more pagination.
 *
 * @param pageSize - Number of items per page (0 = show all, no pagination)
 * @param visibleCount - How many items are currently visible (grows on "Show more")
 * @returns The first `visibleCount` items (or all if pageSize is 0)
 */
export function paginateItems (
  items: FeedItem[],
  pageSize: number,
  visibleCount: number
): FeedItem[] {
  if (!pageSize || pageSize <= 0) return items
  return items.slice(0, visibleCount)
}

// ── Full Pipeline ─────────────────────────────────────────────────

export interface PipelineOptions {
  // Step 1: Filter
  statusField: string
  filterByStatus: string[]
  // Step 1b: Numeric range filter
  filterNumericMin: number | null | undefined
  filterNumericMax: number | null | undefined
  // Step 2: Search
  searchQuery: string
  searchFields: string[]
  // Step 3: Sort
  sortField: string
  sortDirection: 'asc' | 'desc'
  reverseFeedOrder: boolean
  // Step 4: Paginate
  maxItems: number
  visibleCount: number
}

export interface PipelineResult {
  /** Items after filter + search + sort (before pagination) — used for counts and CSV export */
  allProcessed: FeedItem[]
  /** Items after full pipeline (visible set for rendering) */
  visible: FeedItem[]
  /** Total count after filter + search + sort */
  totalCount: number
  /** Count of currently visible items */
  visibleCount: number
}

/**
 * Run the full processing pipeline: filter → search → sort → paginate.
 * Returns both the full processed set (for counts/export) and the visible subset.
 */
export function runPipeline (items: FeedItem[], options: PipelineOptions): PipelineResult {
  // Step 1: Status filter (exact mode)
  let processed = applyStatusFilter(items, options.statusField, options.filterByStatus)

  // Step 1b: Numeric range filter (range mode)
  processed = applyNumericFilter(processed, options.statusField, options.filterNumericMin, options.filterNumericMax)

  // Step 2: Text search
  processed = searchItems(processed, options.searchQuery, options.searchFields)

  // Step 3: Sort
  processed = sortItems(processed, options.sortField, options.sortDirection, options.reverseFeedOrder)

  // Step 4: Paginate
  const visible = paginateItems(processed, options.maxItems, options.visibleCount)

  return {
    allProcessed: processed,
    visible,
    totalCount: processed.length,
    visibleCount: visible.length
  }
}
