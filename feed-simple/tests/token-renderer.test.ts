/**
 * Unit tests for token-renderer.ts — FeedSimple token substitution engine.
 *
 * All functions under test are pure (no DOM, no JSAPI, no imports to mock).
 */

import { substituteTokens } from '../src/utils/token-renderer'
import type { FeedItem } from '../src/utils/parsers/interface'
import type { FilterContext } from '../src/utils/token-renderer'

// ── Basic substitution ────────────────────────────────────────────

describe('substituteTokens — basic substitution', () => {
  const item: FeedItem = {
    title: 'Road Closure',
    status: 'Active',
    location: '405 NB'
  }

  it('should substitute a single token', () => {
    expect(substituteTokens('{{title}}', item)).toBe('Road Closure')
  })

  it('should substitute multiple tokens', () => {
    expect(substituteTokens('{{title}} — {{status}}', item)).toBe('Road Closure — Active')
  })

  it('should replace unknown tokens with empty string', () => {
    expect(substituteTokens('{{missing}}', item)).toBe('')
  })

  it('should handle mixed known and unknown tokens', () => {
    expect(substituteTokens('{{title}} ({{unknown}})', item)).toBe('Road Closure ()')
  })

  it('should preserve surrounding text', () => {
    expect(substituteTokens('Status: {{status}} on {{location}}', item))
      .toBe('Status: Active on 405 NB')
  })

  it('should return empty string for empty template', () => {
    expect(substituteTokens('', item)).toBe('')
  })

  it('should return empty string for null/undefined template', () => {
    expect(substituteTokens(null as any, item)).toBe('')
    expect(substituteTokens(undefined as any, item)).toBe('')
  })

  it('should return plain text unchanged when no tokens present', () => {
    expect(substituteTokens('No tokens here', item)).toBe('No tokens here')
  })

  it('should handle whitespace inside token braces', () => {
    expect(substituteTokens('{{ title }}', item)).toBe('Road Closure')
    expect(substituteTokens('{{  status  }}', item)).toBe('Active')
  })
})

// ── Dot-path substitution ─────────────────────────────────────────

describe('substituteTokens — dot-path keys', () => {
  const item: FeedItem = {
    'origin.time.value': '2025-01-15T08:30:00Z',
    'origin.latitude.value': '47.6062',
    'event.@id': 'evt-123'
  }

  it('should substitute dot-path tokens', () => {
    expect(substituteTokens('{{origin.time.value}}', item)).toBe('2025-01-15T08:30:00Z')
  })

  it('should substitute attribute tokens with @', () => {
    expect(substituteTokens('{{event.@id}}', item)).toBe('evt-123')
  })
})

// ── Array element substitution ────────────────────────────────────

describe('substituteTokens — array keys', () => {
  const item: FeedItem = {
    'category[0]': 'Earthquake',
    'category[1]': 'Seismic'
  }

  it('should substitute array-indexed tokens', () => {
    expect(substituteTokens('{{category[0]}}', item)).toBe('Earthquake')
    expect(substituteTokens('{{category[1]}}', item)).toBe('Seismic')
  })
})

// ── Date filter ───────────────────────────────────────────────────

describe('substituteTokens — date filter', () => {
  // Use a fixed date: January 15, 2025 at 14:30:45 local time
  // Build the ISO string dynamically so it works in any timezone
  const d = new Date(2025, 0, 15, 14, 30, 45) // month is 0-indexed
  const item: FeedItem = {
    pubDate: d.toISOString()
  }

  it('should format date with MMM D, YYYY', () => {
    const result = substituteTokens('{{pubDate | "MMM D, YYYY"}}', item)
    expect(result).toBe('Jan 15, 2025')
  })

  it('should format date with MM/DD/YYYY', () => {
    const result = substituteTokens('{{pubDate | "MM/DD/YYYY"}}', item)
    expect(result).toBe('01/15/2025')
  })

  it('should format date with YYYY-MM-DD', () => {
    const result = substituteTokens('{{pubDate | "YYYY-MM-DD"}}', item)
    expect(result).toBe('2025-01-15')
  })

  it('should format time with h:mm A', () => {
    const result = substituteTokens('{{pubDate | "h:mm A"}}', item)
    expect(result).toBe('2:30 PM')
  })

  it('should format time with hh:mm:ss a', () => {
    const result = substituteTokens('{{pubDate | "hh:mm:ss a"}}', item)
    expect(result).toBe('02:30:45 pm')
  })

  it('should format with YY short year', () => {
    const result = substituteTokens('{{pubDate | "M/D/YY"}}', item)
    expect(result).toBe('1/15/25')
  })

  it('should format DD with zero-padded day', () => {
    const dSingle = new Date(2025, 0, 5, 9, 5, 0) // Jan 5
    const singleItem: FeedItem = { dt: dSingle.toISOString() }
    expect(substituteTokens('{{dt | "DD"}}', singleItem)).toBe('05')
    expect(substituteTokens('{{dt | "D"}}', singleItem)).toBe('5')
  })

  it('should return raw value for unparseable date', () => {
    const badItem: FeedItem = { pubDate: 'not-a-date' }
    expect(substituteTokens('{{pubDate | "MMM D, YYYY"}}', badItem)).toBe('not-a-date')
  })

  it('should return empty string for empty date value', () => {
    const emptyItem: FeedItem = { pubDate: '' }
    expect(substituteTokens('{{pubDate | "MMM D"}}', emptyItem)).toBe('')
  })

  it('should return empty string for missing date field', () => {
    const noFieldItem: FeedItem = {}
    expect(substituteTokens('{{pubDate | "MMM D"}}', noFieldItem)).toBe('')
  })
})

// ── Autolink filter ───────────────────────────────────────────────

describe('substituteTokens — autolink filter', () => {
  it('should wrap https URL in an anchor tag', () => {
    const item: FeedItem = { link: 'https://example.com/page' }
    const result = substituteTokens('{{link | autolink}}', item)
    expect(result).toBe('<a href="https://example.com/page" target="_blank" rel="noopener">https://example.com/page</a>')
  })

  it('should wrap http URL in an anchor tag', () => {
    const item: FeedItem = { link: 'http://example.com' }
    const result = substituteTokens('{{link | autolink}}', item)
    expect(result).toContain('href="http://example.com"')
  })

  it('should prepend https:// for www. URLs', () => {
    const item: FeedItem = { link: 'www.example.com/page' }
    const result = substituteTokens('{{link | autolink}}', item)
    expect(result).toContain('href="https://www.example.com/page"')
    expect(result).toContain('>www.example.com/page</a>')
  })

  it('should return empty string for empty value', () => {
    const item: FeedItem = { link: '' }
    expect(substituteTokens('{{link | autolink}}', item)).toBe('')
  })

  it('should return empty string for missing field', () => {
    const item: FeedItem = {}
    expect(substituteTokens('{{link | autolink}}', item)).toBe('')
  })

  it('should handle text mixed with a URL', () => {
    const item: FeedItem = { desc: 'Visit https://example.com for more info' }
    const result = substituteTokens('{{desc | autolink}}', item)
    expect(result).toContain('Visit ')
    expect(result).toContain('<a href="https://example.com"')
    expect(result).toContain(' for more info')
  })
})

// ── ExternalLink filter ───────────────────────────────────────────

describe('substituteTokens — externalLink filter', () => {
  it('should render a link using the template', () => {
    const item: FeedItem = { id: '123', type: 'alert' }
    const ctx: FilterContext = {
      externalLinkTemplate: 'https://example.com/detail/{{id}}'
    }
    const result = substituteTokens('{{id | externalLink}}', item, ctx)
    expect(result).toBe('<a href="https://example.com/detail/123" target="_blank" rel="noopener">View ↗</a>')
  })

  it('should substitute multiple tokens in the URL template', () => {
    const item: FeedItem = { id: '456', type: 'incident' }
    const ctx: FilterContext = {
      externalLinkTemplate: 'https://example.com/{{type}}/{{id}}'
    }
    const result = substituteTokens('{{id | externalLink}}', item, ctx)
    expect(result).toContain('href="https://example.com/incident/456"')
  })

  it('should return raw value when no template configured', () => {
    const item: FeedItem = { id: '789' }
    const result = substituteTokens('{{id | externalLink}}', item, {})
    expect(result).toBe('789')
  })

  it('should return raw value when template is undefined', () => {
    const item: FeedItem = { id: '789' }
    const result = substituteTokens('{{id | externalLink}}', item)
    expect(result).toBe('789')
  })
})

// ── Unknown filter ────────────────────────────────────────────────

describe('substituteTokens — unknown filter', () => {
  it('should return the raw value for an unknown filter name', () => {
    const item: FeedItem = { title: 'Test' }
    expect(substituteTokens('{{title | bogusFilter}}', item)).toBe('Test')
  })
})

// ── Edge cases ────────────────────────────────────────────────────

describe('substituteTokens — edge cases', () => {
  it('should handle consecutive tokens without separator', () => {
    const item: FeedItem = { a: 'Hello', b: 'World' }
    expect(substituteTokens('{{a}}{{b}}', item)).toBe('HelloWorld')
  })

  it('should not trip on partial braces', () => {
    const item: FeedItem = { x: '1' }
    expect(substituteTokens('{x} and {{x}}', item)).toBe('{x} and 1')
  })

  it('should handle item values containing braces', () => {
    const item: FeedItem = { data: 'value with {{braces}}' }
    // The inner {{braces}} in the value shouldn't cause issues since
    // substituteTokens only processes the template, not the replaced values
    // (regex replaces left-to-right, and the outer {{data}} is consumed first)
    const result = substituteTokens('{{data}}', item)
    expect(result).toBe('value with {{braces}}')
  })
})
