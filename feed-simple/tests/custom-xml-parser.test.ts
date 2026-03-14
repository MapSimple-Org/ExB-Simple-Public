/**
 * Unit tests for custom-xml.ts — FeedSimple universal XML parser.
 *
 * Uses jsdom's built-in DOMParser — no mocking needed.
 */

import { CustomXmlParser } from '../src/utils/parsers/custom-xml'

const parser = new CustomXmlParser()

// ── Flat XML ──────────────────────────────────────────────────────

describe('CustomXmlParser — flat XML', () => {
  const xml = `
    <feed>
      <item>
        <title>Road Closure</title>
        <status>Active</status>
        <location>405 NB at Milepost 25</location>
      </item>
      <item>
        <title>Bridge Work</title>
        <status>Planned</status>
        <location>SR 520 EB</location>
      </item>
    </feed>`

  it('should parse all items', () => {
    const result = parser.parse(xml, 'item')
    expect(result.items.length).toBe(2)
  })

  it('should extract flat field values', () => {
    const result = parser.parse(xml, 'item')
    expect(result.items[0].title).toBe('Road Closure')
    expect(result.items[0].status).toBe('Active')
    expect(result.items[0].location).toBe('405 NB at Milepost 25')
  })

  it('should discover all field names', () => {
    const result = parser.parse(xml, 'item')
    expect(result.fieldNames).toContain('title')
    expect(result.fieldNames).toContain('status')
    expect(result.fieldNames).toContain('location')
  })

  it('should sort flat fields alphabetically', () => {
    const result = parser.parse(xml, 'item')
    const flat = result.fieldNames.filter(f => !f.includes('.'))
    for (let i = 1; i < flat.length; i++) {
      expect(flat[i].localeCompare(flat[i - 1])).toBeGreaterThanOrEqual(0)
    }
  })
})

// ── Nested XML (dot-path flattening) ──────────────────────────────

describe('CustomXmlParser — nested XML', () => {
  const xml = `
    <eventParameters>
      <event>
        <origin>
          <time><value>2025-01-15T08:30:00Z</value></time>
          <latitude><value>47.6062</value></latitude>
          <longitude><value>-122.3321</value></longitude>
        </origin>
        <magnitude>
          <mag><value>3.2</value></mag>
          <type>ml</type>
        </magnitude>
      </event>
    </eventParameters>`

  it('should flatten nested elements to dot-paths', () => {
    const result = parser.parse(xml, 'event')
    expect(result.items.length).toBe(1)
    expect(result.items[0]['origin.time.value']).toBe('2025-01-15T08:30:00Z')
    expect(result.items[0]['origin.latitude.value']).toBe('47.6062')
    expect(result.items[0]['magnitude.mag.value']).toBe('3.2')
    expect(result.items[0]['magnitude.type']).toBe('ml')
  })

  it('should sort shallow fields before deep fields', () => {
    const result = parser.parse(xml, 'event')
    const depths = result.fieldNames.map(f => (f.match(/\./g) || []).length)
    for (let i = 1; i < depths.length; i++) {
      expect(depths[i]).toBeGreaterThanOrEqual(depths[i - 1])
    }
  })
})

// ── XML attributes ────────────────────────────────────────────────

describe('CustomXmlParser — attributes', () => {
  const xml = `
    <feed>
      <entry>
        <link href="https://example.com" rel="alternate"/>
        <title type="text">Test Title</title>
      </entry>
    </feed>`

  it('should extract attributes with @ prefix', () => {
    const result = parser.parse(xml, 'entry')
    expect(result.items[0]['link.@href']).toBe('https://example.com')
    expect(result.items[0]['link.@rel']).toBe('alternate')
    expect(result.items[0]['title.@type']).toBe('text')
  })

  it('should include attribute keys in fieldNames', () => {
    const result = parser.parse(xml, 'entry')
    expect(result.fieldNames).toContain('link.@href')
    expect(result.fieldNames).toContain('link.@rel')
  })
})

// ── Repeated elements (array indexing) ────────────────────────────

describe('CustomXmlParser — repeated elements', () => {
  const xml = `
    <feed>
      <item>
        <category>Earthquake</category>
        <category>Seismic</category>
        <category>Pacific NW</category>
      </item>
    </feed>`

  it('should index repeated siblings with brackets', () => {
    const result = parser.parse(xml, 'item')
    expect(result.items[0]['category[0]']).toBe('Earthquake')
    expect(result.items[0]['category[1]']).toBe('Seismic')
    expect(result.items[0]['category[2]']).toBe('Pacific NW')
  })

  it('should include indexed keys in fieldNames', () => {
    const result = parser.parse(xml, 'item')
    expect(result.fieldNames).toContain('category[0]')
    expect(result.fieldNames).toContain('category[1]')
    expect(result.fieldNames).toContain('category[2]')
  })
})

// ── HTML entity sanitization ──────────────────────────────────────

describe('CustomXmlParser — HTML entity sanitization', () => {
  it('should handle &nbsp;', () => {
    const xml = '<feed><item><desc>Hello&nbsp;World</desc></item></feed>'
    const result = parser.parse(xml, 'item')
    // &nbsp; is replaced with &#160; which DOMParser renders as non-breaking space
    expect(result.items[0].desc).toContain('Hello')
    expect(result.items[0].desc).toContain('World')
  })

  it('should handle &mdash;', () => {
    const xml = '<feed><item><desc>A&mdash;B</desc></item></feed>'
    const result = parser.parse(xml, 'item')
    expect(result.items[0].desc).toContain('A')
    expect(result.items[0].desc).toContain('B')
  })

  it('should handle &copy;', () => {
    const xml = '<feed><item><desc>&copy; 2025</desc></item></feed>'
    const result = parser.parse(xml, 'item')
    expect(result.items[0].desc).toContain('2025')
  })

  it('should handle multiple entities in one feed', () => {
    const xml = '<feed><item><desc>A&nbsp;B&mdash;C&bull;D</desc></item></feed>'
    const result = parser.parse(xml, 'item')
    // Should not throw — all entities are converted to numeric references
    expect(result.items.length).toBe(1)
  })
})

// ── CDATA ─────────────────────────────────────────────────────────

describe('CustomXmlParser — CDATA sections', () => {
  it('should unwrap CDATA transparently', () => {
    const xml = `
      <feed>
        <item>
          <description><![CDATA[<b>Bold text</b> and more]]></description>
        </item>
      </feed>`
    const result = parser.parse(xml, 'item')
    expect(result.items[0].description).toBe('<b>Bold text</b> and more')
  })
})

// ── Namespace handling ────────────────────────────────────────────

describe('CustomXmlParser — namespaces', () => {
  it('should strip namespace prefixes (uses localName)', () => {
    const xml = `
      <q:quakeml xmlns:q="http://quakeml.org/xmlns/quakeml/1.2">
        <event>
          <q:origin>
            <q:time><q:value>2025-01-15</q:value></q:time>
          </q:origin>
        </event>
      </q:quakeml>`
    const result = parser.parse(xml, 'event')
    // Should use localName (no q: prefix)
    expect(result.items[0]['origin.time.value']).toBe('2025-01-15')
  })

  it('should filter out xmlns declarations from attributes', () => {
    const xml = `
      <feed xmlns:georss="http://www.georss.org/georss">
        <item>
          <title>Test</title>
        </item>
      </feed>`
    const result = parser.parse(xml, 'item')
    // xmlns attributes should not appear in field names
    const hasXmlns = result.fieldNames.some(f => f.includes('xmlns'))
    expect(hasXmlns).toBe(false)
  })
})

// ── Empty and edge cases ──────────────────────────────────────────

describe('CustomXmlParser — edge cases', () => {
  it('should return empty array for zero matching items', () => {
    const xml = '<feed><entry><title>Test</title></entry></feed>'
    const result = parser.parse(xml, 'item') // looking for <item> but only <entry> exists
    expect(result.items).toEqual([])
    expect(result.fieldNames).toEqual([])
  })

  it('should handle self-closing elements', () => {
    const xml = '<feed><item><title>Test</title><empty/></item></feed>'
    const result = parser.parse(xml, 'item')
    expect(result.items[0].title).toBe('Test')
    expect(result.items[0].empty).toBe('')
  })

  it('should handle whitespace-only text nodes', () => {
    const xml = '<feed><item><title>  </title></item></feed>'
    const result = parser.parse(xml, 'item')
    expect(result.items[0].title).toBe('')
  })

  it('should throw on invalid XML', () => {
    const badXml = '<feed><item><unclosed></item></feed>'
    expect(() => parser.parse(badXml, 'item')).toThrow('XML parse error')
  })
})

// ── Field name ordering ───────────────────────────────────────────

describe('CustomXmlParser — field name ordering', () => {
  it('should sort flat fields before dot-path fields', () => {
    const xml = `
      <feed>
        <item>
          <zebra>Z</zebra>
          <alpha>A</alpha>
          <nested><deep>D</deep></nested>
        </item>
      </feed>`
    const result = parser.parse(xml, 'item')
    const flatIdx = result.fieldNames.indexOf('alpha')
    const nestedIdx = result.fieldNames.indexOf('nested.deep')
    expect(flatIdx).toBeLessThan(nestedIdx)
  })
})
