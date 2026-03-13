/**
 * Custom XML parser for arbitrary XML feed schemas.
 * Handles non-standard feeds (government, legacy) that don't follow RSS/Atom conventions.
 * Extracts child elements of each item as flat key-value pairs.
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
      const item: FeedItem = {}

      // Extract direct child elements as key-value pairs
      for (let j = 0; j < itemEl.children.length; j++) {
        const child = itemEl.children[j]
        const fieldName = child.localName
        const value = child.textContent || ''
        item[fieldName] = value
        fieldNameSet.add(fieldName)
      }

      items.push(item)
    }

    return {
      items,
      fieldNames: Array.from(fieldNameSet)
    }
  }
}
