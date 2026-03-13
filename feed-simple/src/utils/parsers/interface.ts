/**
 * Common interface for feed parsers.
 * v1 ships with CustomXmlParser only.
 * Future parsers (RSS 2.0, Atom, GeoRSS, JSON Feed) implement this same contract.
 */

/** A single feed item as key-value pairs extracted from the feed */
export interface FeedItem {
  /** Raw field values keyed by element/field name */
  [fieldName: string]: string
}

/** Result of parsing a feed response */
export interface ParseResult {
  /** Parsed items */
  items: FeedItem[]
  /** Field names discovered in the feed (from first item) */
  fieldNames: string[]
}

/** Parser contract — all feed format parsers implement this */
export interface IFeedParser {
  /**
   * Parse a raw feed response string into structured items.
   * @param rawText - The raw response body (XML, JSON, etc.)
   * @param rootItemElement - The element name that wraps each item (e.g., "item", "entry")
   * @returns Parsed items and discovered field names
   */
  parse(rawText: string, rootItemElement: string): ParseResult
}
