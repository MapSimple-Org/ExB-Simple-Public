# FeedSimple Widget Architecture

This guide documents the architecture, data flow, and conventions for the FeedSimple Experience Builder widget.

**Version:** 1.19.0-r004.002
**Last Updated:** 2026-03-18

---

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Processing Pipeline](#processing-pipeline)
5. [Parser Layer](#parser-layer)
6. [Supported Feed Formats](#supported-feed-formats)
7. [Token Renderer](#token-renderer)
8. [Markdown Template System](#markdown-template-system)
9. [Color Resolution System](#color-resolution-system)
10. [Color Legend](#color-legend)
11. [Polling Lifecycle](#polling-lifecycle)
12. [Map Integration (Spatial Join)](#map-integration-spatial-join)
13. [Feed Map Layer](#feed-map-layer)
14. [Zoom & Click Behavior](#zoom--click-behavior)
15. [Responsive Rendering](#responsive-rendering)
16. [Mobile Popup Behavior](#mobile-popup-behavior)
17. [Search, Sort & Pagination](#search-sort--pagination)
18. [CSV Export](#csv-export)
19. [FeatureEffect on Joined Layers](#featureeffect-on-joined-layers)
20. [Data Source Builder](#data-source-builder)
21. [Settings Panel](#settings-panel)
22. [Debug Logging](#debug-logging)
23. [Test Suite](#test-suite)
24. [File Inventory](#file-inventory)
25. [Key Interfaces and Types](#key-interfaces-and-types)
26. [Dependencies](#dependencies)

---

## Overview

FeedSimple is an ArcGIS Experience Builder Developer Edition widget that consumes XML-based feeds and renders items as styled cards. It is fully configurable — no feed URLs, field names, or status values are hardcoded. The widget is designed for government and public-sector XML feeds (road closures, alerts, incidents) but works with any XML feed.

### Three Modes

| Mode | Description | Requirements |
|------|-------------|--------------|
| **A — Visual Display** | Fetch, parse, and render feed items as Markdown-templated cards with status color coding, sorting, filtering, search, pagination, and external links | Feed URL only |
| **B — Spatial Join** | Runtime join between feed items and a feature service via shared ID field, enabling card click to zoom and identify on the map. FeatureEffect dims non-matching features during search/filter. | Feed URL + FeatureLayer with matching ID field |
| **C — Feed Map Layer** | Auto-generate a client-side FeatureLayer from feed item coordinates (lat/lon fields), with bidirectional card-map click sync. Supports ClassBreaksRenderer for range-based symbology. | Feed URL + lat/lon fields in feed data |

Modes can be enabled independently or in combination. B and C both add map interaction on top of A, and both can be active simultaneously on the same map widget.

### Dependencies

FeedSimple does not depend on QuerySimple or HelperSimple. As of r004.001, it imports shared utilities from `shared-code/mapsimple-common`:

- **`convertTemplateToHtml()`** — Markdown-to-HTML conversion (shared with QS)
- **`applyInlineFormatting()`** — Inline formatting (bold, italic, links)
- **`substituteTokens()`** — `{{field | filter}}` token engine (shared with QS)
- **`createFeedSimpleDebugLogger()`** — Tagged debug logger

**Installation:** Copy both `feed-simple/` and `shared-code/` to `client/your-extensions/widgets/`. Previous standalone releases (r003.010 and earlier) do not require `shared-code/`.

---

## Component Architecture

FeedSimple uses the Esri Hook and Shell pattern with a React class component as the shell and function components for presentational pieces.

```
widget.tsx (Shell — class component)
├── FeedControls (search bar + sort controls)
├── ColorLegend (collapsible color key bar)
├── FeedCard[] (card rendering, toolbar, responsive templates)
├── JimuMapViewComponent (map integration)
└── DataSourceComponent (spatial join DS lifecycle)
```

### Widget (Shell) — `widget.tsx`

The main runtime component is a `React.PureComponent` class (~1,623 lines). It manages:

- Feed fetching and parsing orchestration
- Polling lifecycle (start, stop, backoff, visibility awareness)
- Processing pipeline invocation (filter, search, sort, paginate via `runPipeline()`)
- Range label enrichment via `enrichItemsWithRangeLabels()`
- Change detection and highlight animation scheduling
- Map integration state (geometry cache, selected card, MapView reference)
- Feed Map Layer lifecycle (create, sync, destroy via `feed-layer-manager.ts`)
- ClassBreaksRenderer sync when range color breaks are configured
- FeatureEffect management for search/filter dimming on joined layers
- Card click routing (feed map layer zoom → spatial join zoom → center-on-click → external link)
- Scroll-to-top button visibility
- Show-more pagination state (`visibleCount`)
- Runtime sort field/direction overrides
- CSV export trigger

### FeedCard (Presentational) — `feed-card.tsx`

A function component (~550 lines) responsible for rendering a single feed item card. It receives all data via props and has no coupling to widget state. Manages its own expand/collapse toggle via `useState`.

Responsibilities:
- Token substitution via `substituteTokens()`
- Markdown-to-HTML conversion via `convertTemplateToHtml()`
- Color resolution via `resolveCardColor()` (supports both exact and range modes)
- Highlight animation overlay (gold flash, 2-second fade)
- Selected card indicator (blue border for map-synced selection)
- Keyboard accessibility (Enter/Space on clickable cards)
- Fallback raw field display when no template is configured
- **Card action toolbar**: Zoom, Pan, Link, and Expand icon buttons with disabled state + tooltips for items without geometry
- **Toolbar positions**: Bottom (horizontal), Right (vertical strip), or Menu (kebab dropdown using jimu-ui `Dropdown`)
- **Responsive card rendering**: Dual-renders desktop and mobile card templates toggled via CSS `@media (max-width: 600px)` query
- **Responsive toolbar rendering**: Dual-renders desktop and mobile toolbar positions via CSS media query when `toolbarPositionMobile` is set
- **No-geometry info banner**: Temporary message below card when map interaction fails (auto-clears after 3s)

Helper functions extracted within the component:
- `renderButtonToolbar()` — renders horizontal or vertical button toolbar
- `renderKebabMenu()` — renders kebab (three dots) dropdown menu via jimu-ui portal-based `Dropdown`
- `renderToolbarForPosition()` — dispatches to button or kebab based on position setting
- `renderCardLayout()` — handles simple (no mobile overrides) and responsive (dual-render with CSS media queries) paths

### FeedControls — `feed-controls.tsx`

A function component (~224 lines) rendering the search and sort toolbar above the card list.

- **Search input**: Borderless `TextInput` with 200ms debounced callback via `hooks.useDebounceCallback`. iOS auto-zoom prevention via `font-size: 16px` at widths <= 1024px.
- **Sort dropdown**: `Select` with feed order, reverse feed order (`__reverse__` sentinel), range label (`__rangeLabel__` sentinel when range mode is active), and configurable field options.
- **Direction toggle**: Ascending/descending arrow button using `SortAscendingArrowOutlined` / `SortDescendingArrowOutlined` icons. Hidden when no field-based sort is active.
- **Results label**: "X of Y items" shown when search is active.
- Hidden entirely when `enableSearchBar` is `false`.

### ColorLegend — `feed-legend.tsx`

A function component (~187 lines) rendering a collapsible color key bar between FeedControls and the card list.

- **Collapsed view**: Inline row of color swatches with labels. Wrap-capable for many entries.
- **Expanded view**: Vertical list with larger swatches plus range bounds detail (e.g., "Moderate (2.5–5.0)").
- Supports both exact-match mode (status value labels) and range mode (range labels with min/max bounds).
- Chevron toggle button (Down/Up outlined icons) to expand/collapse.
- Admin-togglable via `showColorLegend` config field (defaults to on when `statusField` is set).
- Returns `null` when no color entries are configured.

### Setting (Hook) — `setting.tsx`

The builder-time configuration panel is a `React.PureComponent` class (~2,271 lines). It persists all settings to widget config JSON via `onSettingChange()`.

Key capabilities:
- **Auto-discover fields**: Automatically runs field discovery when `feedUrl` is set and no fields are cached on panel mount
- **Discover Fields button**: Manual fallback to fetch the feed and populate field dropdowns
- **Template editor**: Monospace textarea with click-to-insert field token buttons
- **Template syntax help panel**: Expandable reference panel covering tokens, markdown, filters, math operations, date tokens, and usage examples
- **Live preview**: Markdown-rendered preview with styled token badges
- **Card Colors**: Color mode selector (exact/range), color pickers per status value (exact mode), range break editor with color pickers, min/max inputs, labels, drag-and-drop reorder, and map color overrides (range mode)
- **Map integration**: DataSourceSelector, join field dropdowns, MapWidgetSelector
- **Feed Map Layer**: Enable toggle, lat/lon field selection with smart coordinate detection, marker styling, outline config, popup templates (desktop + mobile)
- **Mobile settings**: Mobile card template, mobile toolbar position, mobile popup collapsed/dock/hide-dock toggles
- **Output DS registration**: Registers/deregisters the output DataSource when map integration config changes

---

## Data Flow

The end-to-end pipeline from XML feed to rendered cards:

```
1. FETCH              widget.tsx: loadFeed()
   |                  Calls fetchFeed() → esriRequest (dynamic import) or native fetch fallback → raw XML text
   v
2. PARSE              widget.tsx: loadFeed()
   |                  Calls CustomXmlParser.parse() → FeedItem[] + fieldNames[]
   v
3. ENRICH             widget.tsx: loadFeed()
   |                  enrichItemsWithRangeLabels() → inject __colorRangeLabel + __colorRangeOrder virtual fields
   v
4. CHANGE DETECT      widget.tsx: detectChanges()
   |                  Compare item IDs against previous cycle → highlight set
   v
5. PIPELINE           widget.tsx: render() → runPipeline()
   |                  filter → numericFilter → search → sort → paginate
   |                  Returns { allProcessed, visible, totalCount, visibleCount }
   v
6. RENDER             FeedControls → ColorLegend → FeedCard[]
   |                  FeedControls: search bar + sort controls
   |                  ColorLegend: color key swatches
   |                  FeedCard: resolveCardColor() → substituteTokens() → convertTemplateToHtml() → dangerouslySetInnerHTML
   v
7. MAP SYNC           widget.tsx: runQueryGeometries() [Mode B] / syncFeedLayer() [Mode C]
   |                  Mode B: Queries feature service → builds geometryMap. applyFilterEffect() dims non-matching features.
   |                  Mode C: applyEdits() syncs client-side FeatureLayer. ClassBreaksRenderer if range mode.
   v
8. EXPORT             feed-csv-export.ts: exportFeedItemsToCsv() [on demand]
                      Exports allProcessed pipeline results to CSV download
```

### Error Handling Strategy

The widget uses a two-tier error model:

- **Full error** (`error` state): Shown when the first fetch fails and no data exists. Displays a red error panel.
- **Non-blocking error** (`fetchError` state): Shown when a subsequent fetch fails but previous data is available. Displays a yellow warning banner while keeping stale data visible.

---

## Processing Pipeline

The processing pipeline (`feed-pipeline.ts`, ~200 lines) replaces the earlier inline `getDisplayItems()` + `sortItems()` approach. It runs in `render()` on every update and returns both the full processed set (for counts and CSV export) and the visible subset.

### Pipeline Stages

```
items[]
  │
  ├─ Step 1:  applyStatusFilter()     — exclude items by exact status value (exact mode)
  │
  ├─ Step 1b: applyNumericFilter()    — exclude items outside min/max bounds (range mode)
  │
  ├─ Step 2:  searchItems()           — case-insensitive substring match across configured fields
  │
  ├─ Step 3:  sortItems()             — date → numeric → string comparison with configurable direction
  │                                     reverseFeedOrder via [...items].reverse() when no sort field
  │
  └─ Step 4:  paginateItems()         — slice to visibleCount for show-more pagination
```

### PipelineResult

```typescript
interface PipelineResult {
  allProcessed: FeedItem[]  // After filter + search + sort (before pagination) — for counts, CSV, map sync
  visible: FeedItem[]       // After full pipeline — visible cards for rendering
  totalCount: number        // Count after filter + search + sort
  visibleCount: number      // Count of currently visible items
}
```

Each pipeline function is pure, takes an array, and returns a new array. The full `runPipeline()` orchestrator chains them in order.

### Pipeline Memoization (r003.005)

The widget caches the last `PipelineResult` keyed on a composite string of all pipeline inputs (items reference, search query, sort field/direction, visible count, filter state). ImmutableObject arrays (`filterByStatus`, `searchFields`) use separate reference equality checks rather than string coercion, since `ImmutableObject.toString()` can produce unreliable `[object Object]` values. When `getProcessedItems()` is called with unchanged inputs — which happens frequently during re-renders, map sync, and CSV export — the cached result is returned immediately without re-running the pipeline.

---

## Parser Layer

### IFeedParser Interface

All feed parsers implement the `IFeedParser` contract defined in `parsers/interface.ts`:

```typescript
interface IFeedParser {
  parse(rawText: string, rootItemElement: string): ParseResult
}
```

This pluggable design enables future format support (JSON Feed, REST/JSON) without modifying widget or render code. All XML-based formats (RSS 2.0, Atom, GeoRSS) are already handled by `CustomXmlParser`.

### FeedItem Type

A single feed item is a flat key-value map where XML element names become keys:

```typescript
interface FeedItem {
  [fieldName: string]: string
}
```

All values are strings. Type coercion (date parsing, numeric comparison) happens at the point of use (sorting, date filters, range color resolution).

### CustomXmlParser (Universal XML)

The parser (`parsers/custom-xml.ts`) handles arbitrary XML schemas using a recursive tree walk with the browser's native `DOMParser`. It:

1. **Sanitizes HTML entities**: Replaces 12 common entities (`&nbsp;`, `&mdash;`, `&rsquo;`, etc.) with numeric equivalents via a single pre-compiled regex + replacement map (r003.006). Government and legacy feeds frequently use these without declaring them in a DTD.
2. **Parses XML**: Uses `DOMParser.parseFromString()` with `text/xml` content type.
3. **Extracts items**: Finds all elements matching `rootItemElement` (configurable, defaults to `"item"`).
4. **Recursive flattening**: Walks the full element tree to arbitrary depth, producing:
   - **Dot-path keys** for nested elements: `origin.latitude.value`
   - **`@` prefix** for attributes: `link.@href`, `event.@publicID`
   - **Bracket indexing** for repeated siblings: `category[0]`, `category[1]`
   - **Namespace stripping** via `localName` — prefix changes between feeds don't break templates
   - **xmlns filtering** — metadata declarations are excluded

### GeoRSS Point Splitting

After flattening each item, the parser detects `point` (or `*.point`) fields whose value contains two space-separated numbers (GeoRSS `"lat lon"` format). It emits two synthetic fields:

- `point_lat` — the latitude component
- `point_lon` — the longitude component

The original `point` value is preserved. This enables the Feed Map Layer to consume ATOM/GeoRSS feeds (e.g., USGS earthquake ATOM) by simply mapping `point_lat` and `point_lon` to the latitude/longitude config fields.

---

## Supported Feed Formats

`CustomXmlParser` is a universal XML parser — it handles all major XML-based feed formats with a single implementation. The user only needs to set the correct **Root Item Element** in settings.

### Tested and Supported

| Format | Root Element | Example Source | Key Fields | Tested |
|--------|-------------|----------------|------------|--------|
| **Flat XML** | Varies (e.g., `item`) | King County road closures | Simple child elements: `status`, `title`, `description` | Yes |
| **Nested XML** | Varies (e.g., `event`) | USGS QuakeML | Dot-path keys: `origin.latitude.value`, `magnitude.mag.value` | Yes |
| **RSS 2.0** | `item` | Standard RSS feeds | `title`, `link`, `description`, `pubDate`, `guid` | Yes |
| **ATOM** | `entry` | USGS earthquake ATOM | `title`, `id`, `updated`, `link.@href`, `summary` | Yes |
| **GeoRSS (ATOM)** | `entry` | USGS earthquake ATOM | `point_lat`, `point_lon` (synthetic from `<georss:point>`) | Yes |

### Not Yet Supported (Requires New Parsers)

| Format | Blocker | Effort |
|--------|---------|--------|
| **JSON Feed** | Needs `response.json()` in fetcher + JSON flattener | ~40 lines |
| **REST/JSON** | Same as JSON Feed, plus configurable items-array key | ~50 lines |

These are the only formats requiring new `IFeedParser` implementations. Everything downstream of `FeedItem[]` (tokens, cards, sorting, filtering, polling, map integration) is format-agnostic.

---

## Token Renderer

The token renderer (`token-renderer.ts`, ~358 lines) handles `{{token}}` substitution with a chainable left-to-right pipe filter pipeline. All 21 regex patterns used in token matching and date formatting are pre-compiled at module scope (r003.006), eliminating per-call regex construction.

### Token Syntax

| Syntax | Behavior |
|--------|----------|
| `{{fieldName}}` | Direct value substitution |
| `{{fieldName \| "MMM D, YYYY"}}` | Date formatting with quoted format string |
| `{{fieldName \| autolink}}` | Convert plain-text URLs to clickable `<a>` tags |
| `{{fieldName \| externalLink}}` | Render "View" link using `externalLinkTemplate` from config |
| `{{fieldName \| /1000 \| round:1 \| suffix: km}}` | Chainable math + formatting filters |

### Chainable Pipe Filters

Pipes are split by `|` respecting quoted strings and evaluated left to right. Available filters:

| Category | Filters |
|----------|---------|
| **Math** | `/N` (divide), `*N` (multiply), `+N` (add), `-N` (subtract), `abs`, `round:N`, `toFixed:N` |
| **Text** | `prefix:text`, `suffix:text`, `upper`, `lower` |
| **Date** | Quoted format string: `"MMM D, YYYY HH:mm Z"` |
| **Link** | `autolink`, `externalLink` |

### Date Tokens

`YYYY`, `YY`, `MMM`, `MM`, `M`, `DD`, `D`, `HH` (24h padded), `H` (24h unpadded), `hh`, `h`, `mm`, `ss`, `A`, `a`, `Z` (timezone offset like `-07:00`).

Uses a placeholder slot system to prevent token collision — for example, `MMM` produces "Mar", and without protection the subsequent `M` pass would consume the "M" in "Mar". Each replacement is stored in a numbered slot (`\x00N\x00`) and swapped back after all passes complete.

### FilterContext

Decouples the renderer from widget config:

```typescript
interface FilterContext {
  externalLinkTemplate?: string
  dateFormatString?: string
}
```

---

## Markdown Template System

The markdown template system (`markdown-template-utils.ts`, ~214 lines) converts a subset of Markdown to HTML for card rendering. All 11 regex patterns are pre-compiled at module scope (r003.006). Adapted from QuerySimple's template utilities but uses double-brace `{{token}}` syntax.

### Supported Markdown Subset

| Syntax | Output |
|--------|--------|
| `**bold**` or `__bold__` | `<strong>` |
| `*italic*` or `_italic_` | `<em>` |
| `# Heading` | `<h3>` |
| `## Subheading` | `<h4>` |
| `### Small` | `<h5>` |
| `#### Tiny` | `<h6>` |
| `- item` | `<li>` within `<ul>` |
| `---` | `<hr/>` |
| `[text](url)` | `<a>` (opens in new tab) |
| `![alt](url)` | `<img>` (responsive) |
| Blank line | New `<p>` |
| Single line break | `<br/>` within same `<p>` |
| Leading spaces | Indentation via `padding-left` (2 spaces = 1em) |

### Processing Order

Token substitution runs **before** markdown-to-HTML conversion. This is critical because the pipe `|` and quote `"` characters in filter syntax (e.g., `{{date | "MMM D"}}`) would be mangled by the markdown converter if it ran first.

### Three Public Functions

1. **`convertTemplateToHtml(markdown)`** — Full markdown-to-HTML conversion for runtime rendering.
2. **`renderPreview(markdown)`** — Settings panel preview. Converts markdown to HTML, then replaces `{{token}}` references with styled badge `<span>` elements.
3. **`extractFieldTokens(template)`** — Returns an array of field names referenced in a template string.

---

## Color Resolution System

The color resolution system (`color-resolver.ts`, ~138 lines) supports two modes for mapping feed item values to card background colors and map symbology.

### Exact Mode (`colorMode: 'exact'`)

Maps exact string values to hex colors via `StatusColorMap`. A status field value of `"Closed"` maps directly to a color like `#F4CCCC`. Simple string equality comparison.

### Range Mode (`colorMode: 'range'`)

Maps numeric ranges to colors via `RangeColorBreak[]`. Each break defines:

| Field | Purpose |
|-------|---------|
| `min` | Lower bound (inclusive). `null` = unbounded. |
| `max` | Upper bound (exclusive). `null` = unbounded. |
| `color` | Card background hex color |
| `label` | Display label (e.g., "Moderate") |
| `mapColor` | Optional map symbol color override (independent of card color) |
| `size` | Optional marker size override for map layer |
| `markerStyle` | Optional marker style override for map layer |

Matching rule: first break where `min <= value < max`. `parseFloat()` conversion from string value.

### Map Symbol Independence

Card color and map color are tracked independently. `mapColor` on each break allows subtle card backgrounds with punchy map symbols. Card and map colors stay synced until the user explicitly sets a different `mapColor`.

### ClassBreaksRenderer Integration

When range mode is active and a Feed Map Layer is configured, `feed-layer-manager.ts` builds a JSAPI `ClassBreaksRenderer` from the range breaks. Each break becomes a `ClassBreakInfo` with its own symbol (color, size, marker style). The status field is declared as `type: 'double'` with `parseFloat` conversion during sync. Plain autocast objects are used for symbols (JSAPI `ClassBreakInfo` rejects pre-constructed instances).

### Virtual Field Enrichment

`enrichItemsWithRangeLabels()` injects two virtual fields into each item when range mode has labeled breaks:

- `__colorRangeLabel` — the break label text (e.g., "Moderate")
- `__colorRangeOrder` — the break index as a string (e.g., "1")

These enable:
- **Search**: Range labels are automatically searchable (e.g., typing "Severe" filters to that range)
- **Sort**: "Range label" option in the sort dropdown sorts by break index for natural ordering (Low → Moderate → Severe)

### Public API

```typescript
resolveCardColor(item: FeedItem, config: ColorResolverConfig): string
// Returns hex color or 'transparent'

enrichItemsWithRangeLabels(items: FeedItem[], config: ColorResolverConfig): FeedItem[]
// Returns items with virtual fields added in-place
```

---

## Color Legend

The `ColorLegend` component (`feed-legend.tsx`, ~187 lines) renders a thin collapsible color key bar positioned between `FeedControls` and the card list.

### Behavior

- **Collapsed** (default): Inline row of 12px color swatches with labels. Wraps on overflow.
- **Expanded**: Vertical list with 16px swatches plus range bounds detail (e.g., "Moderate (2.5-5.0)").
- **Toggle**: Chevron button (Down/Up outlined icons).

### Mode Support

| Mode | Label Source | Detail |
|------|-------------|--------|
| Exact | Status value string (e.g., "Closed") | None |
| Range | Break label or formatted range (e.g., "< 2.5") | Range bounds when label exists |

### Configuration

Controlled by `showColorLegend` config field. Defaults to `true` when `statusField` is set. Returns `null` when no color entries are configured (no statusColorMap entries or no rangeColorBreaks).

---

## Polling Lifecycle

### Timer Management

Polling is managed through `setInterval` with the following behavior:

- **Configurable interval**: Default 30 seconds, minimum 15 seconds, 0 disables automatic polling
- **Timer storage**: The interval ID is stored as a class instance property (`pollTimerId`), not in React state, to avoid re-render side effects
- **Start/restart**: `startPolling()` clears any existing timer before creating a new one
- **Stop**: `stopPolling()` clears the interval via `clearInterval()`

### Page Visibility API

The widget listens for `visibilitychange` events on the document:

- **Tab hidden**: Polling timer is cleared immediately
- **Tab visible**: An immediate fetch fires, then the polling timer is restarted

The listener is attached in `componentDidMount` and removed in `componentWillUnmount`.

### Exponential Backoff

Consecutive fetch failures trigger progressive degradation:

| Failures | Behavior |
|----------|----------|
| 0 | Normal polling interval |
| 3+ (`BACKOFF_THRESHOLD`) | Double the polling interval |
| 6+ (`PAUSE_THRESHOLD`) | Pause polling entirely; show "Feed unavailable -- click to retry" banner |

A successful fetch resets the failure counter to 0 and restores the normal polling interval.

### Change Detection

On each successful fetch, the widget compares item IDs against the previous cycle:

1. Generate a stable ID for each item using `joinFieldFeed` (if configured) or a hash of all field values
2. Compare new IDs against `previousItemIds` set
3. New IDs (not in previous set) are added to `highlightedIds`
4. Highlighted cards receive a gold flash animation that fades over `HIGHLIGHT_DURATION_MS` (2 seconds)
5. A `setTimeout` auto-clears the highlight set after the animation completes

### Manual Refresh

When polling is paused (after `PAUSE_THRESHOLD` failures), the widget displays a clickable banner. Clicking it resets the failure counter, fires an immediate fetch, and restarts the polling timer.

---

## Map Integration (Spatial Join)

Map integration via spatial join (Mode B) enables feed items to be linked to features on a map via a shared ID field.

### Geometry Query Pipeline

1. After each successful feed parse, the widget checks if map integration is configured
2. Collects join field values from all feed items
3. Finds the actual map layer via `mapView.map.allLayers` URL matching (not the DataSource's separate layer instance)
4. Queries via JSAPI `FeatureLayer.queryFeatures()` — respects `definitionExpression` and web map filters
5. Uses `featureLayer.createQuery()` which pre-populates the WHERE clause with the definitionExpression, then ANDs it with the IN clause
6. Batches large ID sets into groups of 500 to stay within query limits
7. Builds a `geometryMap`: `Map<joinValue, RestGeometry>`
8. Optimization: Skips re-query if the set of join IDs has not changed since the last poll cycle

### Card Click Behavior (Spatial Join Path)

When a card is clicked and spatial join is configured:

1. **Toggle**: Clicking the same card again deselects it and closes the popup
2. **Zoom** (if `enableZoomOnClick !== false`): Calls `MapView.goTo()` with an animated transition
   - Point features: Zoom to a configurable zoom level (default 15)
   - Line/polygon features: Expand the geometry extent by a configurable buffer factor (default 1.5)
3. **Center** (if `enableCenterOnClick`): Pans map to feature without changing zoom level. Mutually exclusive with zoom.
4. **Identify** (always): Queries the FeatureLayer for the matching feature and opens the native popup. When zoom is enabled, identify runs after the `goTo` animation completes. When zoom is disabled, identify runs immediately via the `doIdentify()` helper.

### ExB Lazy Popup Workaround

Experience Builder lazily initializes the MapView's popup. On first use, `mapView.popup` may exist but lack the `open()` method. Both `identifyFeatureOnMap` (spatial join) and `zoomToFeedPoint` (feed map layer) detect this condition and create a new `Popup` instance attached to the MapView.

### Fallback (Mode A Only)

When neither map integration mode is configured but `externalLinkTemplate` is set, card clicks substitute tokens into the URL template and open the result in a new browser tab.

### Map Integration Utilities

Pure functions extracted into `map-interaction.ts` (~397 lines):

| Function | Purpose |
|----------|---------|
| `isMapIntegrationConfigured()` | Check if DS + both join fields are set |
| `inferGeometryType()` | Add JSAPI `type` property to REST geometry JSON |
| `buildGoToTarget()` | Compute goTo target (zoom level or expanded extent) |
| `buildPanTarget()` | Compute goTo target for panning (center only, no zoom change) |
| `identifyFeatureOnMap()` | Query feature + open popup with lazy-init workaround |
| `queryGeometries()` | Full geometry query pipeline with skip optimization |
| `applyFilterEffect()` | Set FeatureEffect to dim non-matching features during search/filter |
| `clearFilterEffect()` | Remove FeatureEffect on clear/unmount |

---

## Feed Map Layer

The Feed Map Layer (Mode C) auto-generates a client-side FeatureLayer from feed item coordinates (lat/lon fields). All logic lives in `feed-layer-manager.ts` (~745 lines).

### Layer Lifecycle

1. **Creation**: When `mapView`, config, and parsed items are all available, the widget calls `createFeedFeatureLayer()` which builds a `FeatureLayer` with `source: []`, adds it to the map, and registers a click handler for bidirectional sync.
2. **Sync**: On each poll cycle, `syncFeedItemsToLayer()` performs a diff-based sync (r003.005) — compares `FEED_ITEM_ID` values between existing layer features and incoming items to compute targeted adds, updates, and deletes. Each operation is batched in groups of 500 for large feeds. This replaces the earlier delete-all/add-all approach which caused visible flicker and unnecessary OBJECTID churn.
3. **Destruction**: `destroyFeedFeatureLayer()` removes the layer from the map on widget unmount, config disable, or map view change.
4. **Recreation triggers**: Changes to `feedMapLayerPopupTemplate`, `feedMapLayerPopupTemplateMobile`, or `feedMapLayerPopupTitle` in `componentDidUpdate` destroy and recreate the layer.

### Field Name Sanitization

JSAPI FeatureLayer field names cannot contain dots, `@`, or brackets. The flattener produces keys like `origin.latitude.value` and `link.@href`. The `buildFieldMapping()` function creates a bidirectional map:
- **Forward** (original → sanitized): `origin.latitude.value` → `origin_latitude_value`
- **Reverse** (sanitized → original): Used when reconstructing FeedItem from feature attributes for popup rendering

The mapping is cached at module scope (r003.005) — rebuilds only when the `fieldNames` array reference changes, avoiding 2 Map allocations + n iterations on every poll cycle.

### Renderer Modes

| Config State | Renderer |
|--------------|----------|
| No range breaks / exact mode | `SimpleRenderer` with configured marker color, size, style |
| Range mode with breaks | `ClassBreaksRenderer` — each break gets its own symbol (color, size, style) |

Both renderer modes respect global outline config (`feedMapLayerOutlineColor`, `feedMapLayerOutlineWidth`). Width 0 = no outline (`outline: null`).

### CustomContent Popups

Popups use JSAPI's `CustomContent` mechanism rather than string-based popup templates. This ensures reliable HTML rendering from both:
- Programmatic `popup.open()` calls (card click → zoom to point)
- Native map click events (hitTest on the feed layer)

The popup content function reconstructs the original FeedItem from sanitized field attributes, then runs it through `substituteTokens()` and `convertTemplateToHtml()`.

### Dynamic Popup Title

`feedMapLayerPopupTitle` supports `{{token}}` substitution. Uses a JSAPI function-based `PopupTemplate.title` to resolve per feature (e.g., "M{{mag}} - {{place}}"). Falls back to static layer title if empty.

### Bidirectional Click Sync

| Action | Behavior |
|--------|----------|
| **Card click** | Ensure layer visible → zoom to point (if enabled) + open popup on map via `zoomToFeedPoint()` |
| **Toolbar zoom** | Ensure layer visible → zoom to point + open popup via `zoomToFeedPoint()` |
| **Toolbar pan** | Ensure layer visible → center map (no zoom change) via `panToFeedPoint()` |
| **Map click** | `hitTest` on feed layer → highlight matching card + `scrollIntoView` via `data-feed-item-id` attributes |
| **Re-click same card** | Toggle off: close popup, deselect card |

### Auto-Restore Layer Visibility

When a user turns off the feed layer in the LayerList and then interacts with a card (click, toolbar zoom, toolbar pan), the `ensureFeedLayerVisible()` helper automatically sets `feedFeatureLayer.visible = true`.

### Configuration

| Config Field | Default | Purpose |
|--------------|---------|---------|
| `enableFeedMapLayer` | `false` | Master toggle |
| `latitudeField` | (none) | Dot-path field name for latitude |
| `longitudeField` | (none) | Dot-path field name for longitude |
| `feedMapLayerTitle` | `'Feed Items'` | Layer name in LayerList |
| `feedMapLayerColor` | `'#FF4500'` | Marker color |
| `feedMapLayerSize` | `8` | Marker size in points |
| `feedMapLayerMarkerStyle` | `'circle'` | `'circle' \| 'square' \| 'diamond' \| 'cross' \| 'x'` |
| `feedMapLayerOutlineColor` | (empty) | Outline color (empty = no outline) |
| `feedMapLayerOutlineWidth` | `1` | Outline width (0 = no outline) |
| `feedMapLayerPopupTitle` | (empty) | Dynamic title with `{{token}}` substitution |
| `feedMapLayerPopupTemplate` | (empty) | Popup template — falls back to `cardTemplate` |
| `feedMapLayerPopupTemplateMobile` | (empty) | Mobile popup template — falls back to cascade |

---

## Zoom & Click Behavior

### Zoom on Click

Controlled by `enableZoomOnClick` (defaults to `true`). Affects both Feed Map Layer and Spatial Join paths. Disabling zoom does NOT disable popups or feature identification.

### Center on Click

Controlled by `enableCenterOnClick` (defaults to `false`). Pans the map to the feature without changing zoom level. Mutually exclusive with Zoom on Click — validation enforced in settings.

### Toolbar Interactions

The card toolbar provides Zoom and Pan buttons that operate independently of the card-click behavior:
- **Zoom button**: Hidden when `enableZoomOnClick` is enabled (redundant with card click). Shown otherwise.
- **Pan button**: Always shown when map integration is configured.
- **Link button**: Shown when `linkField` is configured and the item has a URL value. Opens in new tab.
- **Expand button**: Shown when `enableCardExpand` is enabled. Toggles raw field:value display.

### Settings

| Setting | Condition | Default |
|---------|-----------|---------|
| Enable zoom on card click | Always shown | `true` |
| Enable center on card click | Always shown | `false` |
| Zoom Level (Points) | Shown when zoom enabled | `15` |
| Zoom Buffer (Lines/Polygons) | Shown when spatial join configured | `1.5` |

---

## Responsive Rendering

FeedSimple supports responsive rendering for cards, toolbars, and popups using CSS media queries at the 600px breakpoint. No JavaScript viewport detection is used — the browser handles switching dynamically on resize.

### Mobile Card Template

`cardTemplateMobile` config field provides an alternate card template for viewports <= 600px. When set, both desktop and mobile card content are rendered inside each `FeedCard`, toggled via CSS `@media (max-width: 600px)` query:

```
<div class="desktop-only">...desktop template...</div>
<div class="mobile-only">...mobile template...</div>
```

Falls back to desktop `cardTemplate` when empty.

### Mobile Toolbar Position

`toolbarPositionMobile` overrides the card toolbar layout at <= 600px. Options: Bottom, Right, Menu (kebab). When set, both desktop and mobile toolbar variants are rendered with CSS media query toggle. Empty = use desktop setting.

### Mobile Popup Template Cascade

When resolving which popup template to use on mobile:

```
feedMapLayerPopupTemplateMobile
  → cardTemplateMobile
    → feedMapLayerPopupTemplate
      → cardTemplate
```

### iOS Auto-Zoom Prevention

Search input and sort select apply `font-size: 16px` at `@media (max-width: 1024px)` to prevent Safari auto-zoom on focus. The 1024px breakpoint covers iPadOS tablets which have the same behavior as phones.

---

## Mobile Popup Behavior

Configurable popup presentation on mobile viewports (<= 600px). Managed by `applyMobilePopupBehavior()` helper in `feed-layer-manager.ts`.

| Config Field | Purpose | Default |
|--------------|---------|---------|
| `mobilePopupCollapsed` | Open popup showing only title bar; user taps to expand | `false` |
| `mobilePopupDockPosition` | Pin popup to `top-center` or `bottom-center` on mobile | `''` (auto) |
| `mobilePopupHideDockButton` | Remove dock/undock toggle from popup header on mobile | `false` |
| `mobilePopupHideActionBar` | Hide the popup action bar (zoom-to, etc.) on mobile | `false` |

Applied in `zoomToFeedPoint()`, `panToFeedPoint()`, and `identifyFeatureOnMap()`. Desktop behavior unchanged — JSAPI defaults restored at > 600px viewports.

---

## Search, Sort & Pagination

### Client-Side Text Search

- Case-insensitive substring match with 200ms debounce
- Configurable `searchFields` array (empty = search all fields, including virtual `__colorRangeLabel`)
- Results count label shown during active search
- Map layer automatically syncs with active search filter (re-runs `syncFeedLayer`)
- FeatureEffect dims non-matching features on joined layers during search

### Runtime Sort Controls

- Sort field dropdown with options: Feed order, Reverse feed order, Range label (when applicable), and configurable field list
- Direction toggle (ascending/descending arrow icons)
- Config-driven defaults via `sortField`/`sortDirection`
- `sortableFields` restricts which fields appear in the runtime dropdown
- Smart type pre-detection (r003.005): samples first 5 non-empty values to classify the sort column as `date`, `numeric`, or `string`, then uses a specialized comparator. Date sorts pre-compute `Date.parse()` values into a `Map` to avoid O(n log n) repeated parsing.

### Show-More Pagination

- "Show More" button appends the next batch of cards (not page-flip)
- Configurable `showMoreLabel` with `{n}` remaining-count token
- Optional "Show All" button alongside "Show More"
- `itemLabelSingular`/`itemLabelPlural` config for count display (e.g., "15 earthquakes")
- Scroll-to-top button appears after scrolling past 200px (theme-aware, `position: sticky`)

---

## CSV Export

CSV export (`feed-csv-export.ts`, ~153 lines) generates a client-side CSV download from the `allProcessed` pipeline results (post filter/search/sort, pre-pagination).

- Configurable `exportFields` (empty = all fields), `columnHeaderLabels`, and `exportFilenameTemplate` (supports `{date}` token)
- BOM prefix (`\uFEFF`) for proper Excel UTF-8 handling
- Value escaping for commas, quotes, and newlines
- Currently hidden from settings (wrapped in `{false && ...}`) — feature not ready for production. Default `enableCsvExport` remains `false`. Code intact for future re-enablement.

---

## FeatureEffect on Joined Layers

When search or filter is active on the card list, non-matching features on the spatial-join map layer are visually dimmed using JSAPI `FeatureEffect`.

- `applyFilterEffect()` in `map-interaction.ts` sets `featureEffect` with `grayscale(100%) opacity(30%)` on excluded features
- `clearFilterEffect()` removes the effect on search clear, filter clear, or unmount
- Effect syncs with search changes, filter changes, and map view changes
- Only applies to Mode B (spatial join) layers

---

## Data Source Builder

The data source builder (`data-source-builder.ts`, ~66 lines) handles output DataSource registration for the ExB framework. Returns a typed `OutputDataSourceJson` interface (r003.006) instead of an untyped object.

### Purpose

When map integration is fully configured (FeatureLayer selected + both join fields set), the settings panel registers an output DataSource with ExB. This allows other ExB widgets (Table, List, Feature Info) to connect to FeedSimple's data output.

### Two Public Functions

1. **`getOutputDataSourceId(widgetId)`** — Generates a deterministic output DS ID using the pattern `{widgetId}_output`
2. **`buildOutputDataSourceJson(widgetId, originDs, originUseDataSource)`** — Constructs the output DS JSON for `onSettingChange()`

### Registration Lifecycle

- **Register**: Called from `saveConfigWithOutputDs()` in settings when all map integration fields are filled in
- **Deregister**: Called when the user clears the DataSource selection or removes a join field — passes an empty array to `onSettingChange()`

---

## Settings Panel

The settings panel (~2,115 lines) is organized into sections with progressive disclosure — sections and sub-options show/hide based on prerequisite configuration.

### Architecture Patterns

- **`setConfigValue<K>(key, value)`**: Type-safe generic method that replaces 15+ individual `onSettingChange` handler methods. Uses `K extends keyof FeedSimpleConfig` for compile-time key/value type checking.
- **`renderFieldCheckboxList(configKey, fields, helpText)`**: Shared helper method for rendering checkbox lists (sortable fields, search fields, export fields). Replaced 3 duplicate ~30-line blocks.
- **Hoisted CSS constants**: Module-level `monoTextareaCss`, `monoTextareaLgCss`, and field checkbox CSS avoid re-creation per render.

### 1. Feed Source

- **Feed URL**: Text input for the XML feed endpoint
- **Discover Fields**: Button that fetches the feed, parses it, and populates field dropdowns throughout the panel. Auto-runs on panel mount when `feedUrl` is set and no fields are cached.
- **Root Item Element**: XML element name for each item (e.g., `"item"`, `"entry"`)

### 2. Card Template

- **Template textarea**: Monospace editor with placeholder hint
- **Insert Field buttons**: Click-to-insert `{{fieldName}}` at cursor position (uses `textarea.selectionStart`)
- **Template syntax help panel**: Expandable reference covering tokens, markdown, filters, math operations, date tokens, and examples. Dark theme compatible.
- **Live preview**: Rendered markdown with token badges replacing `{{field}}` references
- **Dot-path hint**: Shown when discovered fields contain nested dot-path keys

### 3. Card Colors

- **Color mode dropdown**: Exact match or Numeric range
- **Exact mode**: Status field dropdown + one native `<input type="color">` per unique status value
- **Range mode**: Range break editor with:
  - Color picker, min/max numeric inputs, label text input per break
  - Map color override (independent of card color)
  - Optional marker size and style overrides per break
  - Drag-and-drop reorder via native HTML5 drag events
  - Add/remove break buttons

### 4. Color Legend

- **Show color legend toggle**: Defaults to on when status field is set

### 5. Hover Text

- **Tooltip field dropdown**: Select which field value appears as the card hover tooltip

### 6. Polling

- **Refresh interval**: Numeric input (0 = manual only, minimum 15 seconds)
- **Show last updated**: Toggle for the timestamp display in the widget footer
- **Highlight new items**: Toggle for the gold flash animation on changed cards

### 7. Sorting

- **Sort field dropdown**: Populated from discovered fields. Empty = preserve feed order.
- **Sort direction**: Ascending or descending (shown only when a sort field is selected)
- **Reverse feed order**: Toggle to reverse the native feed order (shown only when no sort field is set)

### 8. Display Limits

- **Max items**: Numeric input (0 = show all)
- **Show More label**: Template with `{n}` remaining-count token. Hidden when maxItems is 0.
- **Show All toggle**: Hidden when maxItems is 0.
- **Exact mode**: Hide status values via multi-select checkboxes
- **Range mode**: Numeric min/max filter inputs

### 9. Search & Sort Controls

- **Enable Search Bar**: Toggle (default on)
- **Search placeholder**: Text input (hidden when search is off)
- **Search fields**: Multi-select field list (hidden when search is off)
- **Sortable fields**: Multi-select list of fields for runtime sort dropdown

### 10. Card Options

- **Enable Card Expand**: Toggle for expand/collapse on cards
- **Link Field**: Dropdown for selecting a feed field containing URLs. Link icon button shown on toolbar.
- **External Link template**: URL pattern with `{{token}}` substitution (merged from former standalone section)
- **Toolbar position**: Bottom / Right / Menu (kebab)
- **Mobile toolbar position**: Override for <= 600px viewports

### 11. Source Attribution

- **Source label**: Text shown in footer below cards (e.g., "USGS Earthquake Hazards Program")
- **Source URL**: Optional URL to make the label clickable

### 12. Map Integration (Spatial Join)

- **Feature Layer**: `DataSourceSelector` for choosing a FeatureLayer
- **Join Field (Layer)**: Dropdown populated from the selected DS schema
- **Join Field (Feed)**: Dropdown populated from discovered feed fields
- **Map Widget**: `MapWidgetSelector` for selecting which Map widget to interact with
- **Status banner**: Green confirmation banner when fully configured

### 13. Feed Map Layer

- **Enable toggle**: Master on/off for client-side FeatureLayer generation
- **Latitude/Longitude field dropdowns**: Smart candidate detection with coordinate scoring heuristics
- **Layer title**: Name shown in LayerList
- **Marker color, size, style**: Default renderer config
- **Outline color, width**: Global outline for all markers (width 0 = no outline)
- **Popup title**: Dynamic title with `{{token}}` substitution
- **Popup template**: Multi-line textarea with syntax help panel
- **Mobile popup template**: Separate template for <= 600px viewports
- **Map Widget**: MapWidgetSelector (shared ID with Map Integration section)
- **Status banner**: Green confirmation banner when fully configured

### 14. Zoom & Click Behavior

Conditionally shown when `mapWidgetId` is set AND either Feed Map Layer or Spatial Join is fully configured.

- **Enable zoom on card click**: Toggle (default on). Popups still open regardless.
- **Enable center on card click**: Toggle (default off). Mutually exclusive with zoom.
- **Zoom Level (Points)**: Numeric input (default 15, max 23)
- **Zoom Buffer (Lines/Polygons)**: Numeric input (default 1.5, only shown when spatial join is configured)

### 15. Mobile Popup Behavior

Conditionally shown when map integration is configured.

- **Open collapsed on mobile**: Toggle
- **Dock position on mobile**: Dropdown (Auto / Top / Bottom)
- **Hide dock button**: Toggle (shown when dock position is set)
- **Hide action bar**: Toggle

### 16. Mobile Card Template

- **Mobile card template**: Multi-line textarea with syntax help panel (same as desktop)

---

## Debug Logging

FeedSimple uses a self-contained `DebugLogger` singleton (~158 lines, not shared with QuerySimple). All modules import the same singleton instance (r003.001), eliminating duplicate URL parsing and ensuring consistent debug tag state.

### Activation

Add `?debug=` to the URL:

| Parameter | Effect |
|-----------|--------|
| `?debug=all` | Enable all debug tags |
| `?debug=FETCH,POLL` | Enable specific tags |
| `?debug=false` | Disable all debug output |

The logger checks both the current window and parent window (for ExB iframe context).

### Debug Tags

| Tag | Coverage |
|-----|----------|
| `FETCH` | Feed fetch requests, responses, errors |
| `PARSE` | XML parsing, item counts, field discovery, sort application |
| `RENDER` | Card rendering, highlight animations, external link clicks |
| `POLL` | Timer start/stop, visibility pause/resume, backoff, pause threshold |
| `JOIN` | Feature service queries, geometry caching, card selection, zoom, popup |
| `FEED-LAYER` | Feed Map Layer creation, sync, destroy, card click, map click, layer visibility |
| `TEMPLATE` | Token substitution and filter pipeline |
| `SETTINGS` | Settings panel operations, field discovery, config changes |
| `EXPORT` | CSV export triggering, field selection, file generation |
| `SEARCH` | Search query matching, field restriction, result counts |
| `SORT` | Sort field selection, column type detection, comparator behavior |
| `FEATURE-EFFECT` | FeatureEffect apply/clear on joined layers during search/filter |
| `BUG` | Known bugs/issues (always enabled, logged as `console.warn`) |

### Output Format

All log entries are JSON-formatted with a `feature` tag, ISO timestamp, and action-specific data:

```
[FEEDSIMPLE-FETCH] {"feature":"FETCH","timestamp":"...","action":"fetch-start","url":"..."}
```

---

## Test Suite

FeedSimple has 137 unit tests across 4 test files (~1,158 total test lines), covering pure-function utilities.

| File | Tests | Coverage |
|------|-------|----------|
| `tests/token-renderer.test.ts` | 30 | Basic substitution, dot-path keys, array keys, date filter, autolink, externalLink, unknown filters, whitespace/empty/null handling |
| `tests/custom-xml-parser.test.ts` | 20 | Flat XML, nested dot-path, attributes, repeated elements, HTML entities, CDATA, namespaces, xmlns filtering, self-closing, invalid XML |
| `tests/markdown-template-utils.test.ts` | 50 | Headings, bold/italic, links, images, lists, rules, paragraphs, line breaks, indentation, token passthrough, renderPreview, extractFieldTokens |
| `tests/feed-pipeline.test.ts` | 37 | applyStatusFilter, applyNumericFilter, searchItems, sortItems, paginateItems, full runPipeline integration |

---

## File Inventory

### Runtime Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/runtime/widget.tsx` | Main widget — lifecycle, polling, fetch, pipeline, card click routing, map integration, feed layer, scroll-to-top, FeatureEffect, pagination, search/sort state | 1,623 |
| `src/runtime/feed-card.tsx` | FeedCard component — color resolution, token substitution, markdown rendering, highlight animation, toolbar (3 positions), responsive card/toolbar rendering, kebab menu | 550 |
| `src/runtime/feed-controls.tsx` | FeedControls component — search input (debounced), sort dropdown, direction toggle, results count label, iOS auto-zoom prevention | 224 |
| `src/runtime/feed-legend.tsx` | ColorLegend component — collapsible color key bar, exact and range mode entries, inline swatches, expanded detail view | 185 |
| `src/runtime/translations/default.ts` | Runtime i18n strings | 19 |

### Settings Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/setting/setting.tsx` | Builder settings — field discovery (auto + manual), template editor, syntax help, card colors (exact + range), map integration, feed map layer, mobile settings, zoom config, source attribution | 2,115 |
| `src/setting/translations/default.ts` | Settings i18n strings | 32 |

### Utility Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/utils/feed-layer-manager.ts` | Feed Map Layer — FeatureLayer creation, sync via applyEdits, ClassBreaksRenderer, CustomContent popups, dynamic popup title, field sanitization, zoom/pan/identify, mobile popup behavior, layer visibility auto-restore | 817 |
| `src/utils/map-interaction.ts` | Spatial join + pan utilities — config check, geometry type, zoom/pan target, popup, geometry query, FeatureEffect apply/clear | 347 |
| `src/utils/token-renderer.ts` | Chainable token substitution engine with date, autolink, externalLink, math, text formatting filters | 358 |
| `src/utils/feed-pipeline.ts` | Processing pipeline — status filter, numeric filter, search, sort, paginate, runPipeline orchestrator | 249 |
| `src/utils/markdown-template-utils.ts` | Markdown-to-HTML converter, preview renderer, field extractor | 214 |
| `src/utils/feed-csv-export.ts` | CSV export — blob builder, filename resolver, field resolver, download trigger | 151 |
| `src/utils/debug-logger.ts` | Self-contained DebugLogger class with URL-driven activation | 151 |
| `src/utils/feature-join.ts` | JSAPI FeatureLayer query with batched WHERE IN via queryFeatures | 142 |
| `src/utils/color-resolver.ts` | Color resolution — exact match, numeric range, virtual field enrichment for search/sort | 133 |
| `src/utils/feed-fetcher.ts` | Async feed fetcher — esriRequest (dynamic import) with native fetch fallback, CORS proxy support | 115 |
| `src/utils/data-source-builder.ts` | Output DataSource JSON generation for settings registration | 66 |
| `src/utils/immutable-helpers.ts` | Immutable.js convenience wrappers for settings config updates | 49 |
| `src/utils/parsers/interface.ts` | `IFeedParser` interface, `FeedItem` type, `ParseResult` type | 30 |
| `src/utils/parsers/custom-xml.ts` | Universal XML parser — recursive flattener, GeoRSS point splitting, namespace stripping | 176 |

### Config & Version Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/config.ts` | `FeedSimpleConfig` interface (67 fields), `StatusColorMap`, `RangeColorBreak`, `IMConfig` | 203 |
| `src/constants.ts` | Shared constants — magic strings, numeric thresholds, sentinel values | 9 |
| `src/version.ts` | Version constants (`BASE_VERSION`, `RELEASE_NUMBER`, `MINOR_VERSION`) | 17 |
| `src/version-manager.ts` | ExB config migration manager (BaseVersionManager subclass) | 13 |

### Test Files

| File | Purpose | Lines |
|------|---------|-------|
| `tests/token-renderer.test.ts` | Token substitution tests (30 tests) | 260 |
| `tests/custom-xml-parser.test.ts` | XML parser tests (20 tests) | 268 |
| `tests/markdown-template-utils.test.ts` | Markdown converter tests (50 tests) | 302 |
| `tests/feed-pipeline.test.ts` | Pipeline tests (37 tests) | 328 |

### Non-Source Files

| File | Purpose |
|------|---------|
| `manifest.json` | Widget manifest — declares `jimu-arcgis` dependency, publishMessages |
| `config.json` | Default widget configuration values |
| `icon.svg` | Widget icon for the builder panel |
| `src/runtime/assets/icons/.gitkeep` | Placeholder for future icon assets |

### Summary

| Category | Files | Lines |
|----------|-------|-------|
| Runtime components | 5 | 2,597 |
| Settings | 2 | 2,147 |
| Utilities | 14 | 2,982 |
| Config & version | 4 | 242 |
| Tests | 4 | 1,158 |
| **Total** | **29** | **~9,126** |

---

## Key Interfaces and Types

### FeedSimpleConfig

The central configuration interface with 67 fields organized into groups:

| Group | Fields |
|-------|--------|
| Feed Source | `feedUrl`, `rootItemElement` |
| Display | `cardTemplate`, `cardTemplateMobile`, `statusField`, `statusColorMap`, `colorMode`, `rangeColorBreaks`, `showColorLegend`, `hoverTextField`, `dateFormatString`, `maxItems`, `filterByStatus`, `filterNumericMin`, `filterNumericMax` |
| Sorting | `sortField`, `sortDirection`, `reverseFeedOrder` |
| Polling | `refreshInterval`, `showLastUpdated`, `highlightNewItems` |
| Map Integration | `joinFieldService`, `joinFieldFeed`, `mapWidgetId`, `zoomFactorPoint`, `zoomFactorPoly` |
| External Link & Card Options | `externalLinkTemplate`, `linkField`, `enableCardExpand`, `toolbarPosition`, `toolbarPositionMobile` |
| Source Attribution | `sourceLabel`, `sourceUrl` |
| Feed Map Layer | `enableFeedMapLayer`, `latitudeField`, `longitudeField`, `feedMapLayerTitle`, `feedMapLayerColor`, `feedMapLayerSize`, `feedMapLayerMarkerStyle`, `feedMapLayerOutlineColor`, `feedMapLayerOutlineWidth`, `feedMapLayerPopupTitle`, `feedMapLayerPopupTemplate`, `feedMapLayerPopupTitleMobile`, `feedMapLayerPopupTemplateMobile` |
| Mobile Popup | `mobilePopupCollapsed`, `mobilePopupDockPosition`, `mobilePopupHideDockButton`, `mobilePopupHideActionBar` |
| Zoom & Click | `enableZoomOnClick`, `enableCenterOnClick` |
| Search & Sort | `enableSearchBar`, `searchPlaceholder`, `searchFields`, `enableSortControls`, `sortableFields` |
| Pagination | `showMoreLabel`, `showShowAllButton`, `itemLabelSingular`, `itemLabelPlural` |
| CSV Export | `enableCsvExport`, `exportButtonLabel`, `exportFields`, `columnHeaderLabels`, `exportFilenameTemplate`, `requireExportConfirmation` |

### RangeColorBreak

```typescript
interface RangeColorBreak {
  min: number | null       // Lower bound (inclusive), null = unbounded
  max: number | null       // Upper bound (exclusive), null = unbounded
  color: string            // Card background hex color
  label: string            // Display label (e.g., "Moderate")
  mapColor?: string        // Map symbol color override
  size?: number            // Map marker size override
  markerStyle?: 'circle' | 'square' | 'diamond' | 'cross' | 'x'  // Map marker style override
}
```

### Widget State

| Field | Type | Purpose |
|-------|------|---------|
| `items` | `FeedItem[]` | Current parsed feed items (unsorted — pipeline handles sort) |
| `fieldNames` | `string[]` | Field names discovered from the feed |
| `isLoading` | `boolean` | Initial load indicator |
| `error` | `string \| null` | Fatal error (no data available) |
| `fetchError` | `string \| null` | Non-blocking error (stale data shown) |
| `lastFetchTime` | `number \| null` | Timestamp of last successful fetch |
| `previousItemIds` | `Set<string>` | IDs from previous cycle for change detection |
| `highlightedIds` | `Set<string>` | Currently highlighted (new/changed) item IDs |
| `consecutiveFailures` | `number` | Failure counter for backoff logic |
| `pollPaused` | `boolean` | Whether polling is paused due to repeated failures |
| `geometryMap` | `Map<string, RestGeometry>` | Cached geometries keyed by join field value |
| `selectedItemId` | `string \| null` | Currently selected card ID (map sync) |
| `noGeometryItemId` | `string \| null` | Card showing "no geometry" info message (auto-clears) |
| `showScrollTop` | `boolean` | Whether scroll-to-top button is visible |
| `searchQuery` | `string` | Current search query text |
| `runtimeSortField` | `string` | User-selected sort field at runtime |
| `runtimeSortDirection` | `'asc' \| 'desc'` | User-selected sort direction at runtime |
| `visibleCount` | `number` | Number of items visible for show-more pagination |

### FeedCardProps

Explicit props interface for the FeedCard component (25 props):

| Prop | Type | Purpose |
|------|------|---------|
| `item` | `FeedItem` | The feed item data |
| `isHighlighted` | `boolean` | New/changed animation state |
| `isSelected` | `boolean` | Map-synced selection state |
| `cardTemplate` | `string` | Markdown/token template |
| `statusField` | `string` | Field driving background color |
| `statusColorMap` | `StatusColorMap` | Status value to color mapping |
| `colorMode` | `'exact' \| 'range'` | Color resolution mode |
| `rangeColorBreaks` | `RangeColorBreak[]` | Range breaks for range mode |
| `hoverTextField` | `string` | Field for tooltip |
| `filterContext` | `FilterContext` | Config values for token filters |
| `clickable` | `boolean` | Whether the card is interactive |
| `highlightDurationMs` | `number` | Animation duration |
| `onClick` | `(item, evt) => void` | Click handler |
| `noGeometryMessage` | `string` | Temporary info banner text |
| `showZoomButton` | `boolean` | Show zoom button in toolbar |
| `showPanButton` | `boolean` | Show pan button in toolbar |
| `showExpandButton` | `boolean` | Show expand/collapse button |
| `hasGeometry` | `boolean` | Whether this item has geometry |
| `onZoom` | `(item) => void` | Zoom toolbar button handler |
| `onPan` | `(item) => void` | Pan toolbar button handler |
| `linkUrl` | `string` | URL for link toolbar button |
| `toolbarPosition` | `'bottom' \| 'right' \| 'menu'` | Toolbar layout mode |
| `cardTemplateMobile` | `string` | Mobile card template |
| `toolbarPositionMobile` | `'' \| 'bottom' \| 'right' \| 'menu'` | Mobile toolbar override |
| `toolbarLabels` | `object` | i18n labels for toolbar tooltips |

### RestGeometry

```typescript
interface RestGeometry {
  x?: number          // Point
  y?: number          // Point
  rings?: number[][][] // Polygon
  paths?: number[][][] // Polyline
  spatialReference?: { wkid: number; latestWkid?: number }
  [key: string]: any
}
```

### FilterContext

```typescript
interface FilterContext {
  externalLinkTemplate?: string
  dateFormatString?: string
}
```

### PipelineOptions / PipelineResult

```typescript
interface PipelineOptions {
  statusField: string
  filterByStatus: string[]
  filterNumericMin: number | null
  filterNumericMax: number | null
  searchQuery: string
  searchFields: string[]
  sortField: string
  sortDirection: 'asc' | 'desc'
  reverseFeedOrder: boolean
  maxItems: number
  visibleCount: number
}

interface PipelineResult {
  allProcessed: FeedItem[]  // For counts, CSV export, map sync
  visible: FeedItem[]       // For rendering
  totalCount: number
  visibleCount: number
}
```

---

## Dependencies

| Import Source | Used By | Purpose |
|--------------|---------|---------|
| `jimu-core` | widget, setting, feed-card, feed-controls, feed-legend, data-source-builder | React, jsx, css, hooks, DataSourceComponent, DataSourceManager, Immutable |
| `jimu-arcgis` | widget | JimuMapViewComponent, JimuMapView |
| `jimu-for-builder` | setting | AllWidgetSettingProps |
| `jimu-ui` | widget, setting, feed-card, feed-controls, feed-legend | TextInput, NumericInput, Switch, Select, Option, Button, Dropdown, DropdownButton, DropdownMenu, DropdownItem |
| `jimu-ui/advanced/setting-components` | setting | SettingSection, SettingRow, MapWidgetSelector |
| `jimu-ui/advanced/data-source-selector` | setting | DataSourceSelector |
| `jimu-icons/outlined/directional/` | feed-controls, feed-legend | SortAscendingArrowOutlined, SortDescendingArrowOutlined, DownOutlined, UpOutlined |
| `esri/Graphic` | widget, feed-layer-manager | Constructing graphics for MapView.goTo() and layer source |
| `esri/layers/FeatureLayer` | feed-layer-manager | Client-side FeatureLayer from feed coordinates |
| `esri/geometry/Point` | feed-layer-manager | Point geometry construction for feed items |
| `esri/PopupTemplate` | feed-layer-manager | Popup template for feed layer features |
| `esri/popup/content/CustomContent` | feed-layer-manager | Custom HTML popups with token rendering |
| `esri/widgets/Popup` | map-interaction, feed-layer-manager | Lazy popup initialization workaround |
| (no `esri/request`) | — | Removed in r001.035 — all feature queries go through JSAPI `FeatureLayer.queryFeatures()` |
