/**
 * Unit tests for feed-pipeline.ts — FeedSimple processing pipeline.
 *
 * All functions under test are pure (no DOM, no JSAPI, no imports to mock).
 * Pipeline: filter → search → sort → paginate
 */

import {
  applyStatusFilter,
  searchItems,
  sortItems,
  paginateItems,
  runPipeline
} from '../src/utils/feed-pipeline'
import type { FeedItem } from '../src/utils/parsers/interface'

// ── Test Data ───────────────────────────────────────────────────────

const ITEMS: FeedItem[] = [
  { id: '1', title: 'Earthquake in Chile', status: 'Open', mag: '6.2', pubDate: '2026-03-10T10:00:00Z' },
  { id: '2', title: 'Flood Warning Texas', status: 'Closed', mag: '0', pubDate: '2026-03-12T08:00:00Z' },
  { id: '3', title: 'Tornado Watch Kansas', status: 'Open', mag: '0', pubDate: '2026-03-11T14:00:00Z' },
  { id: '4', title: 'Wildfire California', status: 'Active', mag: '0', pubDate: '2026-03-09T06:00:00Z' },
  { id: '5', title: 'Earthquake in Japan', status: 'Open', mag: '7.8', pubDate: '2026-03-13T12:00:00Z' }
]

// ═══════════════════════════════════════════════════════════════════
// applyStatusFilter
// ═══════════════════════════════════════════════════════════════════

describe('applyStatusFilter', () => {
  test('returns all items when no statusField is set', () => {
    expect(applyStatusFilter(ITEMS, '', ['Open'])).toHaveLength(5)
  })

  test('returns all items when filterByStatus is empty', () => {
    expect(applyStatusFilter(ITEMS, 'status', [])).toHaveLength(5)
  })

  test('filters out items matching a single status value', () => {
    const result = applyStatusFilter(ITEMS, 'status', ['Closed'])
    expect(result).toHaveLength(4)
    expect(result.every(i => i.status !== 'Closed')).toBe(true)
  })

  test('filters out items matching multiple status values', () => {
    const result = applyStatusFilter(ITEMS, 'status', ['Closed', 'Active'])
    expect(result).toHaveLength(3)
    expect(result.every(i => i.status === 'Open')).toBe(true)
  })

  test('returns all items when no items match the filter', () => {
    const result = applyStatusFilter(ITEMS, 'status', ['Unknown'])
    expect(result).toHaveLength(5)
  })

  test('handles missing field values gracefully', () => {
    const items: FeedItem[] = [
      { id: '1', title: 'Has status', status: 'Open' },
      { id: '2', title: 'No status field' }
    ]
    // Empty string default should not match 'Open'
    const result = applyStatusFilter(items, 'status', ['Open'])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })
})

// ═══════════════════════════════════════════════════════════════════
// searchItems
// ═══════════════════════════════════════════════════════════════════

describe('searchItems', () => {
  test('returns all items when query is empty', () => {
    expect(searchItems(ITEMS, '', [])).toHaveLength(5)
  })

  test('returns all items when query is whitespace', () => {
    expect(searchItems(ITEMS, '   ', [])).toHaveLength(5)
  })

  test('searches all fields when searchFields is empty', () => {
    const result = searchItems(ITEMS, 'earthquake', [])
    expect(result).toHaveLength(2)
    expect(result.map(i => i.id)).toEqual(['1', '5'])
  })

  test('is case-insensitive', () => {
    const result = searchItems(ITEMS, 'EARTHQUAKE', [])
    expect(result).toHaveLength(2)
  })

  test('searches only specified fields', () => {
    const result = searchItems(ITEMS, 'Open', ['title'])
    expect(result).toHaveLength(0) // 'Open' is in status, not title
  })

  test('matches partial strings', () => {
    const result = searchItems(ITEMS, 'quake', [])
    expect(result).toHaveLength(2)
  })

  test('returns empty array when nothing matches', () => {
    const result = searchItems(ITEMS, 'hurricane', [])
    expect(result).toHaveLength(0)
  })

  test('handles items with null/undefined field values', () => {
    const items: FeedItem[] = [
      { id: '1', title: 'Test' },
      { id: '2' } // no title
    ]
    const result = searchItems(items, 'Test', ['title'])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  test('trims query whitespace', () => {
    const result = searchItems(ITEMS, '  earthquake  ', [])
    expect(result).toHaveLength(2)
  })
})

// ═══════════════════════════════════════════════════════════════════
// sortItems
// ═══════════════════════════════════════════════════════════════════

describe('sortItems', () => {
  test('returns items in original order when no sortField', () => {
    const result = sortItems(ITEMS, '', 'asc')
    expect(result.map(i => i.id)).toEqual(['1', '2', '3', '4', '5'])
  })

  test('reverses items when reverseFeedOrder is true and no sortField', () => {
    const result = sortItems(ITEMS, '', 'asc', true)
    expect(result.map(i => i.id)).toEqual(['5', '4', '3', '2', '1'])
  })

  test('sorts by string field ascending', () => {
    const result = sortItems(ITEMS, 'title', 'asc')
    expect(result[0].title).toBe('Earthquake in Chile')
    expect(result[result.length - 1].title).toBe('Wildfire California')
  })

  test('sorts by string field descending', () => {
    const result = sortItems(ITEMS, 'title', 'desc')
    expect(result[0].title).toBe('Wildfire California')
    expect(result[result.length - 1].title).toBe('Earthquake in Chile')
  })

  test('sorts by numeric field ascending', () => {
    const items: FeedItem[] = [
      { id: '1', mag: '6.2' },
      { id: '2', mag: '3.1' },
      { id: '3', mag: '7.8' }
    ]
    const result = sortItems(items, 'mag', 'asc')
    expect(result.map(i => i.mag)).toEqual(['3.1', '6.2', '7.8'])
  })

  test('sorts by numeric field descending', () => {
    const items: FeedItem[] = [
      { id: '1', mag: '6.2' },
      { id: '2', mag: '3.1' },
      { id: '3', mag: '7.8' }
    ]
    const result = sortItems(items, 'mag', 'desc')
    expect(result.map(i => i.mag)).toEqual(['7.8', '6.2', '3.1'])
  })

  test('sorts by date field ascending', () => {
    const result = sortItems(ITEMS, 'pubDate', 'asc')
    expect(result[0].id).toBe('4') // 2026-03-09
    expect(result[result.length - 1].id).toBe('5') // 2026-03-13
  })

  test('sorts by date field descending', () => {
    const result = sortItems(ITEMS, 'pubDate', 'desc')
    expect(result[0].id).toBe('5') // 2026-03-13
    expect(result[result.length - 1].id).toBe('4') // 2026-03-09
  })

  test('does not mutate original array', () => {
    const original = [...ITEMS]
    sortItems(ITEMS, 'title', 'asc')
    expect(ITEMS.map(i => i.id)).toEqual(original.map(i => i.id))
  })

  test('handles missing field values', () => {
    const items: FeedItem[] = [
      { id: '1', title: 'B' },
      { id: '2' }, // no title
      { id: '3', title: 'A' }
    ]
    const result = sortItems(items, 'title', 'asc')
    // Empty string sorts before 'A'
    expect(result[0].id).toBe('2')
    expect(result[1].title).toBe('A')
    expect(result[2].title).toBe('B')
  })
})

// ═══════════════════════════════════════════════════════════════════
// paginateItems
// ═══════════════════════════════════════════════════════════════════

describe('paginateItems', () => {
  test('returns all items when pageSize is 0', () => {
    expect(paginateItems(ITEMS, 0, 2)).toHaveLength(5)
  })

  test('returns all items when pageSize is negative', () => {
    expect(paginateItems(ITEMS, -1, 2)).toHaveLength(5)
  })

  test('slices to visibleCount', () => {
    const result = paginateItems(ITEMS, 2, 2)
    expect(result).toHaveLength(2)
    expect(result.map(i => i.id)).toEqual(['1', '2'])
  })

  test('returns all items when visibleCount exceeds length', () => {
    const result = paginateItems(ITEMS, 2, 100)
    expect(result).toHaveLength(5)
  })

  test('returns empty when visibleCount is 0', () => {
    const result = paginateItems(ITEMS, 2, 0)
    expect(result).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════════════════════════
// runPipeline (integration)
// ═══════════════════════════════════════════════════════════════════

describe('runPipeline', () => {
  // r005.011: PipelineOptions added required filterNumericMin/Max fields
  // (number | null | undefined) for the numeric range filter step. Test
  // fixtures need them; null = "no filter applied".
  const DEFAULT_OPTIONS = {
    statusField: '',
    filterByStatus: [],
    filterNumericMin: null,
    filterNumericMax: null,
    searchQuery: '',
    searchFields: [],
    sortField: '',
    sortDirection: 'asc' as const,
    reverseFeedOrder: false,
    maxItems: 0,
    visibleCount: 0
  }

  test('returns all items with default options', () => {
    const result = runPipeline(ITEMS, DEFAULT_OPTIONS)
    expect(result.allProcessed).toHaveLength(5)
    expect(result.visible).toHaveLength(5)
    expect(result.totalCount).toBe(5)
  })

  test('filter + search combined', () => {
    const result = runPipeline(ITEMS, {
      ...DEFAULT_OPTIONS,
      statusField: 'status',
      filterByStatus: ['Closed'],
      searchQuery: 'earthquake'
    })
    // Filter removes Closed (1 item), search for earthquake matches 2 of remaining 4
    expect(result.allProcessed).toHaveLength(2)
    expect(result.visible).toHaveLength(2)
  })

  test('filter + sort combined', () => {
    const result = runPipeline(ITEMS, {
      ...DEFAULT_OPTIONS,
      statusField: 'status',
      filterByStatus: ['Closed', 'Active'],
      sortField: 'title',
      sortDirection: 'asc'
    })
    expect(result.allProcessed).toHaveLength(3) // Only Open items
    expect(result.allProcessed[0].title).toBe('Earthquake in Chile')
  })

  test('pagination limits visible but not allProcessed', () => {
    const result = runPipeline(ITEMS, {
      ...DEFAULT_OPTIONS,
      maxItems: 2,
      visibleCount: 2
    })
    expect(result.allProcessed).toHaveLength(5)
    expect(result.visible).toHaveLength(2)
    expect(result.totalCount).toBe(5)
    expect(result.visibleCount).toBe(2)
  })

  test('full pipeline: filter + search + sort + paginate', () => {
    const result = runPipeline(ITEMS, {
      statusField: 'status',
      filterByStatus: ['Closed'],
      filterNumericMin: null,
      filterNumericMax: null,
      searchQuery: '',
      searchFields: [],
      sortField: 'pubDate',
      sortDirection: 'desc',
      reverseFeedOrder: false,
      maxItems: 2,
      visibleCount: 2
    })
    // 4 items after filter, sorted by date desc, first 2 visible
    expect(result.allProcessed).toHaveLength(4)
    expect(result.visible).toHaveLength(2)
    expect(result.visible[0].id).toBe('5') // Most recent
    expect(result.visible[1].id).toBe('3') // Second most recent
  })

  test('reverse feed order with pipeline', () => {
    const result = runPipeline(ITEMS, {
      ...DEFAULT_OPTIONS,
      reverseFeedOrder: true
    })
    expect(result.allProcessed[0].id).toBe('5')
    expect(result.allProcessed[result.allProcessed.length - 1].id).toBe('1')
  })

  test('empty items array', () => {
    const result = runPipeline([], DEFAULT_OPTIONS)
    expect(result.allProcessed).toHaveLength(0)
    expect(result.visible).toHaveLength(0)
    expect(result.totalCount).toBe(0)
    expect(result.visibleCount).toBe(0)
  })
})
