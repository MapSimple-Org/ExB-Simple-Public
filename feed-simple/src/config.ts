import type { ImmutableObject } from 'jimu-core'

/**
 * Status color map: maps status field values to background hex colors.
 * Example: { "Closed": "#F4CCCC", "Open": "#D9EAD3" }
 */
export interface StatusColorMap {
  [statusValue: string]: string
}

/**
 * FeedSimple widget configuration.
 *
 * All feed-specific values (URL, field names, status values) are user-configured.
 * No defaults are tied to any particular feed source.
 */
export interface FeedSimpleConfig {
  // --- Feed Source ---
  /** URL of the XML feed endpoint */
  feedUrl: string
  /** XML element name for each item (e.g., "item", "entry") */
  rootItemElement: string

  // --- Display ---
  /** Markdown template with {{token}} syntax for rendering each feed item */
  cardTemplate: string
  /** Which XML field drives status-based color coding (empty = no color coding) */
  statusField: string
  /** Map of status values to background hex colors */
  statusColorMap: StatusColorMap
  /** Field whose value appears as hover tooltip on each card */
  hoverTextField: string
  /** Global date format string applied to date token filters */
  dateFormatString: string
  /** Limit rendered items (0 = show all) */
  maxItems: number
  /** Hide items matching these status values */
  filterByStatus: string[]

  // --- Sorting ---
  /** Field name to sort items by (empty = preserve feed order) */
  sortField: string
  /** Sort direction: 'asc' or 'desc' (default 'asc') */
  sortDirection: 'asc' | 'desc'
  /** Reverse the native feed order (applies when no sort field is set) */
  reverseFeedOrder: boolean

  // --- Polling ---
  /** Polling interval in seconds (minimum 15, 0 = manual only) */
  refreshInterval: number
  /** Display a "Last updated: X ago" timestamp in the widget header */
  showLastUpdated: boolean
  /** Briefly animate cards that are new or changed after a refresh cycle */
  highlightNewItems: boolean

  // --- Map Integration (optional) ---
  // The map integration layer is selected via DataSourceSelector and stored
  // in the widget's useDataSources array (not in config).
  /** Field name on the map integration layer to match against */
  joinFieldService: string
  /** XML element name on the feed to join with */
  joinFieldFeed: string
  /** Map widget ID to zoom/identify features on card click */
  mapWidgetId: string
  /** Zoom level for point features (e.g., 15 = street level). Default 15. */
  zoomFactorPoint: number
  /** Buffer factor for line/polygon extent zoom (1.0 = tight, 2.0 = double padding). Default 1.5. */
  zoomFactorPoly: number

  // --- External Link ---
  /** URL template with {{token}} substitution for "open in external app" links */
  externalLinkTemplate: string
}

export type IMConfig = ImmutableObject<FeedSimpleConfig>
