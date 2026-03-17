import type { ImmutableObject } from 'jimu-core'

/**
 * Status color map: maps status field values to background hex colors.
 * Example: { "Closed": "#F4CCCC", "Open": "#D9EAD3" }
 */
export interface StatusColorMap {
  [statusValue: string]: string
}

/**
 * A single range break for numeric range-based color coding.
 * Matches when: min <= value < max (lower-inclusive, upper-exclusive).
 * Use null for min/max to represent unbounded (e.g., "5 and above").
 */
export interface RangeColorBreak {
  /** Lower bound (inclusive). null = no lower bound. */
  min: number | null
  /** Upper bound (exclusive). null = no upper bound. */
  max: number | null
  /** Background hex color for this range */
  color: string
  /** Optional label for display in settings (e.g., "Low", "Moderate", "Severe") */
  label: string
  /** Optional map symbol color override (falls back to card color). Use when card bg needs subtlety but map needs punch. */
  mapColor?: string
  /** Optional marker size override for map layer (falls back to global feedMapLayerSize) */
  size?: number
  /** Optional marker style override for map layer (falls back to global feedMapLayerMarkerStyle) */
  markerStyle?: 'circle' | 'square' | 'diamond' | 'cross' | 'x'
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
  /** Mobile card template — shown at viewport widths ≤ 600px. Falls back to desktop cardTemplate if empty. */
  cardTemplateMobile: string
  /** Which XML field drives status-based color coding (empty = no color coding) */
  statusField: string
  /** Map of status values to background hex colors (used when colorMode = 'exact') */
  statusColorMap: StatusColorMap
  /** Color mode: 'exact' matches exact string values, 'range' uses numeric range breaks */
  colorMode: 'exact' | 'range'
  /** Numeric range breaks for range-based color coding (used when colorMode = 'range') */
  rangeColorBreaks: RangeColorBreak[]
  /** Show a collapsible color key bar above the card list (default true when statusField is set) */
  showColorLegend?: boolean
  /** Field whose value appears as hover tooltip on each card */
  hoverTextField: string
  /** Global date format string applied to date token filters */
  dateFormatString: string
  /** Limit rendered items (0 = show all) */
  maxItems: number
  /** Hide items matching these status values (exact mode) */
  filterByStatus: string[]
  /** Numeric filter: hide items where status field value is below this (range mode) */
  filterNumericMin: number | null
  /** Numeric filter: hide items where status field value is above this (range mode) */
  filterNumericMax: number | null

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
  /** Feed field containing a URL to show as a link icon on the card toolbar (empty = no link button) */
  linkField: string

  // --- Source Attribution ---
  /** Optional source label shown as a footer below the card list (e.g., "USGS Earthquake Hazards Program") */
  sourceLabel: string
  /** Optional URL for the source label — renders it as a clickable link */
  sourceUrl: string

  // --- Feed Map Layer (auto-generated from coordinates) ---
  /** Whether to create a client-side FeatureLayer from feed coordinates */
  enableFeedMapLayer: boolean
  /** Dot-path field name containing latitude values */
  latitudeField: string
  /** Dot-path field name containing longitude values */
  longitudeField: string
  /** Title shown in LayerList for the generated layer */
  feedMapLayerTitle: string
  /** Marker color as hex string (e.g., "#FF4500") */
  feedMapLayerColor: string
  /** Marker size in points (default 8) */
  feedMapLayerSize: number
  /** Marker style (default 'circle') */
  feedMapLayerMarkerStyle: 'circle' | 'square' | 'diamond' | 'cross' | 'x'
  /** Marker outline color as hex string (e.g., "#FFFFFF"). Empty string = no outline. */
  feedMapLayerOutlineColor: string
  /** Marker outline width in points (default 1, 0 = no outline) */
  feedMapLayerOutlineWidth: number
  /** Popup title template with {{token}} substitution — rendered per feature (e.g., "M{{mag}} - {{place}}"). Falls back to layer title if empty. */
  feedMapLayerPopupTitle: string
  /** Popup template for map points — reuses cardTemplate if empty */
  feedMapLayerPopupTemplate: string
  /** Mobile popup title template — more descriptive title for mobile when popup content is collapsed. Falls back to desktop title if empty. */
  feedMapLayerPopupTitleMobile: string
  /** Mobile popup template — shown at viewport widths ≤ 600px. Falls back to desktop template if empty. */
  feedMapLayerPopupTemplateMobile: string

  // --- Mobile Popup Behavior ---
  /** Open popup collapsed (title only) on mobile viewports ≤ 600px (default false) */
  mobilePopupCollapsed: boolean
  /** Dock position on mobile: '' (auto/JSAPI default), 'top-center', 'bottom-center' */
  mobilePopupDockPosition: '' | 'top-center' | 'bottom-center'
  /** Hide the dock toggle button on mobile so users can't undock (default false) */
  mobilePopupHideDockButton: boolean
  /** Hide the popup action bar (zoom-to, etc.) on mobile viewports ≤ 600px (default false) */
  mobilePopupHideActionBar: boolean

  // --- Zoom & Click Behavior ---
  /** Whether clicking a card zooms the map to the feature/point (default true) */
  enableZoomOnClick: boolean
  /** Whether clicking a card centers (pans) the map to the feature/point without zooming (default false) */
  enableCenterOnClick: boolean
  /** Whether to show an expand button on cards to reveal all raw field:value pairs (default false) */
  enableCardExpand: boolean
  /** Toolbar position on cards: 'bottom' (horizontal), 'right' (vertical strip), or 'menu' (kebab dropdown) */
  toolbarPosition: 'bottom' | 'right' | 'menu'
  /** Mobile toolbar position override — applied at viewport widths ≤ 600px. Empty = use desktop setting. */
  toolbarPositionMobile: '' | 'bottom' | 'right' | 'menu'

  // --- Search, Sort & Export (2.0) ---

  /** Show a search bar above the card list (default true) */
  enableSearchBar: boolean
  /** Placeholder text for the search input (default 'Search...') */
  searchPlaceholder: string
  /** Fields to search — empty array means all fields (default []) */
  searchFields: string[]

  /** Show sort controls at runtime (default true) */
  enableSortControls: boolean
  /** Fields available in the sort dropdown — empty array means all fields (default []) */
  sortableFields: string[]

  /** Label for the "Show more" button — supports {n} token for remaining count */
  showMoreLabel: string
  /** Show a "Show all" button alongside "Show more" (default false) */
  showShowAllButton: boolean
  /** Singular noun for items in count labels (default 'item') */
  itemLabelSingular: string
  /** Plural noun for items in count labels (default 'items') */
  itemLabelPlural: string

  /** Show a CSV export button (default false) */
  enableCsvExport: boolean
  /** Label for the export button (default 'Export CSV') */
  exportButtonLabel: string
  /** Fields to include in CSV — empty array means all fields (default []) */
  exportFields: string[]
  /** Map of field name → display label for CSV column headers */
  columnHeaderLabels: { [field: string]: string }
  /** Filename template — supports {date} token (default 'feedsimple-export-{date}') */
  exportFilenameTemplate: string
  /** Show a confirmation dialog before downloading CSV (default false) */
  requireExportConfirmation: boolean
}

export type IMConfig = ImmutableObject<FeedSimpleConfig>
