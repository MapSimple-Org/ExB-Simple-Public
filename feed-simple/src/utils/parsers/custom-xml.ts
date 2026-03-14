/**
 * Universal XML parser for arbitrary XML feed schemas.
 *
 * Handles everything from flat government feeds (King County road closures)
 * to deeply nested scientific formats (USGS QuakeML) by recursively
 * flattening the XML tree into dot-path key-value pairs.
 *
 * Flat XML:   <item><status>Closed</status></item>        → { status: "Closed" }
 * Nested XML: <event><origin><time><value>...</value>     → { "origin.time.value": "..." }
 * Attributes: <link href="..." rel="alternate"/>          → { "link.@href": "...", "link.@rel": "..." }
 * Arrays:     <category>A</category><category>B</category> → { "category[0]": "A", "category[1]": "B" }
 */

import type { IFeedParser, FeedItem, ParseResult } from './interface'

/**
 * Replace common HTML entities that are invalid in XML.
 * Government/legacy feeds frequently use &nbsp;, &mdash;, etc.
 * without declaring them in a DTD.
 */
function sanitizeXml (raw: string): string {
  return raw
    .replace(/&nbsp;/g, '&#160;')
    .replace(/&mdash;/g, '&#8212;')
    .replace(/&ndash;/g, '&#8211;')
    .replace(/&lsquo;/g, '&#8216;')
    .replace(/&rsquo;/g, '&#8217;')
    .replace(/&ldquo;/g, '&#8220;')
    .replace(/&rdquo;/g, '&#8221;')
    .replace(/&bull;/g, '&#8226;')
    .replace(/&hellip;/g, '&#8230;')
    .replace(/&copy;/g, '&#169;')
    .replace(/&reg;/g, '&#174;')
    .replace(/&trade;/g, '&#8482;')
}

/** XML namespace URI for xmlns declarations — filter these out of attributes */
const XMLNS_NS = 'http://www.w3.org/2000/xmlns/'

/**
 * Recursively flatten an XML element into dot-path key-value pairs.
 *
 * Design decisions:
 * - Namespace prefixes are stripped (uses localName). Users shouldn't need to
 *   know about q:quakeml vs quakeml — and prefixes can change between feeds.
 * - Attributes use @ prefix convention (XPath standard): link.@href, event.@id
 * - xmlns declarations are filtered out (they're metadata, not data)
 * - Repeated sibling elements get bracket indices: category[0], category[1]
 * - CDATA is handled transparently by DOMParser (textContent unwraps it)
 * - Empty/self-closing elements emit empty string values for consistency
 */
function flattenElement (element: Element, prefix: string): Record<string, string> {
  const result: Record<string, string> = {}

  // Step 1: Extract attributes (skip xmlns declarations)
  for (let a = 0; a < element.attributes.length; a++) {
    const attr = element.attributes[a]
    // Filter out namespace declarations (xmlns:foo, xmlns)
    if (attr.namespaceURI === XMLNS_NS) continue
    const attrKey = prefix ? `${prefix}.@${attr.localName}` : `@${attr.localName}`
    result[attrKey] = attr.value
  }

  // Step 2: Group child elements by localName for array detection
  const childCounts: Record<string, number> = {}
  for (let c = 0; c < element.children.length; c++) {
    const name = element.children[c].localName
    childCounts[name] = (childCounts[name] || 0) + 1
  }

  // Step 3: Track occurrence index for repeated elements
  const childIndices: Record<string, number> = {}

  // Step 4: Walk children recursively
  for (let c = 0; c < element.children.length; c++) {
    const child = element.children[c]
    const childName = child.localName
    const isArray = childCounts[childName] > 1

    // Build the key/prefix for this child
    let childKey: string
    if (isArray) {
      const idx = childIndices[childName] || 0
      childIndices[childName] = idx + 1
      childKey = prefix ? `${prefix}.${childName}[${idx}]` : `${childName}[${idx}]`
    } else {
      childKey = prefix ? `${prefix}.${childName}` : childName
    }

    if (child.children.length === 0) {
      // Leaf node — extract text content (CDATA unwrapped by DOMParser)
      // Skip emitting bare key for attribute-only elements (e.g., <link href="..."/>)
      const text = (child.textContent || '').trim()
      if (text || child.attributes.length === 0) {
        result[childKey] = text
      }
    } else {
      // Branch node — recurse
      const nested = flattenElement(child, childKey)
      Object.assign(result, nested)
    }

    // Also extract attributes on this child element
    for (let a = 0; a < child.attributes.length; a++) {
      const attr = child.attributes[a]
      if (attr.namespaceURI === XMLNS_NS) continue
      result[`${childKey}.@${attr.localName}`] = attr.value
    }
  }

  return result
}

export class CustomXmlParser implements IFeedParser {
  parse (rawText: string, rootItemElement: string): ParseResult {
    const sanitized = sanitizeXml(rawText)
    const parser = new DOMParser()
    const doc = parser.parseFromString(sanitized, 'text/xml')

    // Check for parse errors
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      throw new Error(`XML parse error: ${parseError.textContent}`)
    }

    const itemElements = doc.getElementsByTagName(rootItemElement)
    const items: FeedItem[] = []
    const fieldNameSet = new Set<string>()

    for (let i = 0; i < itemElements.length; i++) {
      const itemEl = itemElements[i]
      const item = flattenElement(itemEl, '')

      // GeoRSS: split "lat lon" point values into synthetic lat/lon fields.
      // <georss:point>18.263 -66.273</georss:point> becomes:
      //   point = "18.263 -66.273"  (original preserved)
      //   point_lat = "18.263"
      //   point_lon = "-66.273"
      // Also handles nested paths like "where.point".
      for (const key of Object.keys(item)) {
        if (key === 'point' || key.endsWith('.point')) {
          const parts = item[key].trim().split(/\s+/)
          if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
            item[`${key}_lat`] = parts[0]
            item[`${key}_lon`] = parts[1]
          }
        }
      }

      // Collect all discovered field names
      for (const key of Object.keys(item)) {
        fieldNameSet.add(key)
      }

      items.push(item)
    }

    // Sort field names: flat fields first, then dot-path fields alphabetically
    const fieldNames = Array.from(fieldNameSet).sort((a, b) => {
      const aDepth = (a.match(/\./g) || []).length
      const bDepth = (b.match(/\./g) || []).length
      if (aDepth !== bDepth) return aDepth - bDepth
      return a.localeCompare(b)
    })

    return { items, fieldNames }
  }
}
