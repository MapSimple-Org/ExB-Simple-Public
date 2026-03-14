# FeedSimple Changelog

All notable changes to the FeedSimple widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.19.0-r001.039] - 2026-03-13 - Layer Visibility Auto-Restore

### Added

- **Auto-restore feed layer visibility** (r001.039): When a user interacts with a feed card (click, toolbar zoom, toolbar pan), the feed layer is automatically made visible if it was turned off in the LayerList widget. New `ensureFeedLayerVisible()` helper called from all three interaction paths. Logs `layer-visibility-restored` to `FEED-LAYER` debug channel.

## [1.19.0-r001.038] - 2026-03-13 - Scroll-to-Top Chevron Icon

### Changed

- **Scroll-to-top icon** (r001.038): Replaced the arrow-with-bar SVG with a clean chevron (`^`) icon — simpler and more consistent with standard scroll-to-top affordances.

## [1.19.0-r001.037] - 2026-03-13 - GeoRSS Support, Scroll-to-Top, Pan Icon

### Added

- **GeoRSS `<georss:point>` splitting** (r001.037): Parser detects `point` (or `*.point`) fields containing space-separated `"lat lon"` values and emits two synthetic fields: `point_lat` and `point_lon`. Original `point` value preserved. Enables Feed Map Layer for ATOM/GeoRSS feeds (e.g., USGS earthquake ATOM feed) without any manual coordinate extraction.
- **Scroll-to-top button** (r001.037): Theme-aware FAB (`position: sticky`) appears in the bottom-right of the card list after scrolling past 200px. Uses `--sys-color-primary-main` background (honors ExB app theme). Smooth-scrolls back to top on click. Arrow-up-to-bar icon, 36px rounded-rect, accessible (`aria-label`).
- **i18n key**: `scrollToTop`

### Changed

- **Pan icon** (r001.037): Replaced generic four-arrow move icon with the Esri hand icon (same SVG as `jimu-icons/outlined/editor/hand` used in QuerySimple's results menu). More intuitive "grab and drag" affordance.

## [1.19.0-r001.036] - 2026-03-13 - Card Action Toolbar

### Added

- **Card action toolbar** (r001.036): Per-card toolbar row with icon buttons for Zoom, Pan, and Expand actions
  - **Zoom button**: Shown when `enableZoomOnClick` is `false` — zooms to the feature on the map. Hidden when zoom already happens on card click.
  - **Pan button**: Shown when any map integration is configured — centers the map on the feature without changing zoom level.
  - **Expand button**: Shown when `enableCardExpand` is `true` — toggles display of all raw feed fields below the card template content.
  - Buttons disabled with tooltip when the item has no geometry on the map
  - Toolbar labels are i18n-aware with tooltip text
- **`enableCardExpand` config** (r001.036): New boolean config field enabling the expand/collapse feature on cards
- **`panToFeedPoint` utility** (r001.036): New function in `feed-layer-manager.ts` that centers the map on a feed item's coordinates without changing zoom — mirrors `zoomToFeedPoint` but uses current map scale
- **`buildPanTarget` utility** (r001.036): New function in `map-interaction.ts` that builds a `goTo` target for panning (center only, no zoom change)
- **i18n keys**: `zoomToFeature`, `panToFeature`, `expandCard`, `collapseCard`, `zoomDisabledNoGeometry`
- **Settings i18n keys**: `enableCardExpand`, `enableCardExpandDescription`

### Changed

- **`FeedCard` component** (r001.036): Expanded from ~139 lines to ~300+ lines — now supports toolbar rendering, expand/collapse state, and per-card geometry awareness via new props (`showZoomButton`, `showPanButton`, `showExpandButton`, `hasGeometry`, `onZoom`, `onPan`, `toolbarLabels`)
- **`widget.tsx`** (r001.036): Computes toolbar visibility flags (`showZoomButton`, `showPanButton`, `showExpandButton`) once per render and passes to all cards. Per-card `hasGeometry` check inspects either feed coordinates or spatial join `geometryMap`.

## [1.19.0-r001.035] - 2026-03-13 - No-Geometry Card Click Feedback

### Added

- **Card click feedback** (r001.035): When a card click fails to interact with the map, a temporary info banner appears below the card and auto-dismisses after 3 seconds
  - Spatial join path: "Feature not found on map" — shown when `geometryMap` has no entry for the clicked item's join value
  - Feed Map Layer path: "No valid coordinates for this item" — shown when lat/lon fields are missing or unparseable
  - Light blue info styling (`#e8f0fe`) with fade-in animation, consistent with informational messaging patterns
  - Card still shows blue selection border so user knows which card was clicked
- **`noGeometryMessage` prop on FeedCard** (r001.035): Optional string prop renders an info bar below card content when truthy
- **i18n keys**: `noGeometryOnMap`, `noValidCoordinates`

### Changed

- **`zoomToFeedPoint` return type** (r001.035): Changed from `Promise<void>` to `Promise<boolean>` — returns `false` for missing/invalid coordinates, `true` on success. Enables caller to detect failures and show user feedback.
- **Spatial join no-geometry path** (r001.035): Now selects the card (blue border) and shows info message instead of silently returning with no visual feedback

### Fixed

- **Geometry query respects web map filters** (r001.035): Replaced direct `esriRequest` REST calls in `feature-join.ts` with JSAPI `FeatureLayer.queryFeatures()` via the actual map layer. Queries now automatically include the layer's `definitionExpression` and any web map filters. Previously, features filtered out in the web map were still returned by the geometry query, causing card clicks to zoom to invisible features.
  - `feature-join.ts`: Rewritten — `queryFeatureLayerByIds()` accepts a JSAPI `FeatureLayer` instead of a URL string. Uses `featureLayer.createQuery()` to get the definitionExpression, then ANDs it with the IN clause (not overwrites).
  - `map-interaction.ts`: `queryGeometries()` now finds the actual layer on the map via `mapView.map.allLayers` URL matching (same pattern as `identifyFeatureOnMap`), instead of using the DataSource's separate layer instance which lacks the definitionExpression.
  - Removed `esriRequest` dependency — all feature queries now go through the JSAPI layer

## [1.19.0-r001.034] - 2026-03-13 - Zoom & Click Behavior + Unit Tests

### Added

- **Unit test suite — Phase 1** (r001.034): 100 tests across 3 files covering pure-function utilities
  - `tests/token-renderer.test.ts` (30 tests): Basic substitution, dot-path keys, array keys, date filter (format patterns, edge cases), autolink filter, externalLink filter, unknown filters, whitespace/empty/null handling
  - `tests/custom-xml-parser.test.ts` (20 tests): Flat XML, nested dot-path flattening, XML attributes with `@` prefix, repeated element array indexing, HTML entity sanitization, CDATA sections, namespace stripping, xmlns filtering, self-closing elements, invalid XML error, field name ordering
  - `tests/markdown-template-utils.test.ts` (50 tests): Headings (h3-h6), bold/italic/underscore, links, images, unordered lists, horizontal rules, paragraph breaks, line breaks, leading-space indentation, token passthrough, complex multi-element templates, renderPreview badge rendering, extractFieldTokens
- **Zoom on Card Click toggle** (r001.034): New `enableZoomOnClick` config boolean (defaults to `true`). When disabled, card clicks still open popups and identify features — only the map zoom is suppressed.
- **Zoom & Click Behavior settings section** (r001.034): New settings section appears when either Feed Map Layer or Spatial Join is fully configured with a map widget. Contains:
  - Enable/disable zoom on card click toggle
  - Zoom Level (Points) — no hard max cap, JSAPI clamps to basemap tile scheme
  - Zoom Buffer (Lines/Polygons) — only shown when spatial join is configured (feed map layer only produces points)
- **`zoomToFeedPoint` options parameter** (r001.034): Added `{ skipZoom?: boolean }` option so the function can identify/popup without zooming when zoom is disabled

### Changed

- **Zoom settings relocated** (r001.034): Moved from inside the Map Integration section to the shared "Zoom & Click Behavior" section that appears for either Feed Map Layer or Spatial Join
- **Zoom level uncapped** (r001.034): Removed the `max={23}` constraint on the zoom level input — JSAPI naturally handles basemap-specific limits
- **Spatial join card click** (r001.034): Refactored to always run `identifyFeatureOnMap` regardless of zoom setting — `goTo` is conditional, identify is not

## [1.19.0-r001.033] - 2026-03-13 - Feed Map Layer

### Added

- **Feed Map Layer** (r001.033): Auto-generate a client-side FeatureLayer from feed item coordinates
  - Items with lat/lon fields are plotted as points on the map automatically
  - Layer appears in the standard ExB LayerList widget (`listMode: 'show'`)
  - Full renderer support: configurable marker color, size, and style (circle, square, diamond, cross, x)
  - Popup integration: reuses the card template by default, or a separate popup template if configured
  - Efficient poll-cycle sync via `applyEdits()` (full replace, ~1ms for 200 items, batched in 500s for large feeds)
  - Invalid/missing coordinates silently skipped with debug logging
  - Layer auto-created when mapView + config + items are all ready
  - Layer destroyed on widget unmount or config disable
- **Bidirectional card-map sync** (r001.033): Card click zooms to point + opens popup; map click highlights matching card and scrolls into view
- **Smart coordinate field detection** (r001.033): Settings panel sorts lat/lon dropdown candidates by field name heuristics and sample value range analysis
- **New file**: `src/utils/feed-layer-manager.ts` (~280 lines) — layer creation, sync, destroy, popup building, field name sanitization
- **Config additions**: `enableFeedMapLayer`, `latitudeField`, `longitudeField`, `feedMapLayerTitle`, `feedMapLayerColor`, `feedMapLayerSize`, `feedMapLayerMarkerStyle`, `feedMapLayerPopupTemplate`

### Fixed

- **Card word-wrap** (r001.032→033): Long dot-path field names in raw card view now wrap properly instead of causing horizontal overflow

## [1.19.0-r001.032] - 2026-03-13 - Universal XML Parser

### Changed

- **Recursive XML flattener** (r001.032): Replaced flat single-level child extraction with a recursive tree walk that handles any XML nesting depth
  - Flat feeds (King County): identical output — fully backward compatible
  - Nested feeds (USGS QuakeML, 4-5 levels deep): produces dot-path keys like `origin.latitude.value`, `magnitude.mag.value`
  - Attribute extraction: `@` prefix convention (`link.@href`, `event.@publicID`) — follows XPath standard
  - Array handling: bracket indexing for repeated sibling elements (`category[0]`, `category[1]`)
  - Namespace prefixes stripped (uses `localName`) — prefix changes between feeds don't break templates
  - xmlns declarations filtered out (metadata, not data)
  - Attribute-only/self-closing elements skip empty text key, only emit `@attr` keys
  - CDATA unwrapped transparently by DOMParser — zero special handling needed
  - Field names sorted: flat first, then dot-paths alphabetically
- **Token regex updates** (r001.032): All 5 token-matching regexes updated from `[\w.]+` to `[\w.@\[\]]+` to support attribute (`@`) and array (`[]`) keys in templates
  - `token-renderer.ts`: TOKEN_REGEX and external link filter
  - `markdown-template-utils.ts`: renderPreview and extractFieldTokens
  - `widget.tsx`: external link click handler
- **Settings panel hint** (r001.032): "Nested fields use dot notation" message shown when discovered fields contain dot-paths

### Performance

- 500 items × 46 fields (QuakeML worst case) = ~23K function calls, under 5ms
- DOMParser itself is the bottleneck, not the flattening
- No caching needed — each poll cycle fetches fresh XML

## [1.19.0-r001.031] - 2026-03-13 - Code Extraction

### Changed

- **Extract `FeedCard` component** (r001.031): Moved `renderCard` (~110 lines) from `widget.tsx` into `src/runtime/feed-card.tsx` as a standalone function component
  - Purely presentational with explicit `FeedCardProps` interface — no coupling to widget state
  - Props: item, isHighlighted, isSelected, cardTemplate, statusField, statusColorMap, hoverTextField, filterContext, clickable, highlightDurationMs, onClick
  - Owns token substitution (`substituteTokens`) and markdown conversion (`convertTemplateToHtml`) — both imports removed from widget.tsx
  - Keyboard accessibility (Enter/Space) handled internally
- **Extract map interaction utilities** (r001.031): Moved five map methods (~150 lines) from `widget.tsx` into `src/utils/map-interaction.ts` as pure functions
  - `isMapIntegrationConfigured(useDataSources, config)` — replaces 6 class method call sites
  - `inferGeometryType(restGeom)` — adds JSAPI `type` property to REST geometry JSON
  - `buildGoToTarget(graphic, geometryType, zoomPoint, zoomPoly)` — point zoom vs poly extent.expand
  - `identifyFeatureOnMap({ mapView, dataSourceId, joinField, joinValue })` — feature query + popup with ExB lazy-init workaround
  - `queryGeometries({ items, joinFieldFeed, joinFieldService, dataSourceId, previousJoinIds })` — returns `{ geometryMap, newJoinIds, skipped }` for caller to apply to state
  - Widget retains thin `runQueryGeometries` wrapper that calls utility and applies `setState`
- **widget.tsx**: 989 → 783 lines (−206). Removed imports: `Popup`, `DataSourceManager`, `substituteTokens`, `convertTemplateToHtml`

## [1.19.0-r001.029] - 2026-03-13 - Map Integration

### Added

- **Map Integration settings section** (r001.015–029): Full map integration feature enabling feed-to-map linking
  - `DataSourceSelector` for choosing a FeatureLayer from the map (replaces raw URL input)
  - Join field dropdowns: layer field and feed field, auto-populated from DS schema and feed discovery
  - `MapWidgetSelector` for selecting which Map widget to interact with
  - Configurable **Zoom Level (Points)** (1–23, default 15) and **Zoom Buffer (Lines/Polygons)** (min 1.0, default 1.5)
  - Green status banner when map integration is fully configured
- **Runtime map interaction** (r001.019–029):
  - Geometry query via `esriRequest` with automatic AGOL/portal token authentication
  - Batch WHERE IN queries (500 IDs per batch) with numeric vs. string field detection
  - Spatial reference attachment from REST response level to individual geometries
  - Card click → `MapView.goTo()` with configurable zoom/buffer + animated transition
  - Feature identification via JSAPI `Popup.open()` with lazy initialization workaround for ExB
  - Toggle behavior: click same card to deselect and close popup
  - Selected card visual indicator (blue border)
  - `DataSourceComponent` for origin DS lifecycle management (ensures DS ready before query)
  - Polling optimization: skip geometry re-query when join IDs unchanged between poll cycles
- **Debug tags**: `JOIN` tag covers feature service queries, geometry caching, card selection, zoom, popup

### Fixed

- **Token Required (499)**: Switched from raw `fetch()` to `esriRequest` which auto-attaches auth tokens
- **Numeric WHERE quoting**: Detect all-numeric join values and omit quotes in WHERE clause
- **Geometry projection**: Attach response-level `spatialReference` to each geometry from REST response
- **Geometry type inference**: Add `type` property (point/polygon/polyline/multipoint) for JSAPI autocasting
- **ExB lazy popup**: Create `Popup` instance if ExB hasn't initialized native popup on first use

## [1.19.0-r001.013] - 2026-03-12 - Display Limits & External Link

### Added

- **maxItems** (r001.013): Display limit setting — 0 shows all, N shows first N items after sorting/filtering
- **filterByStatus** (r001.013): Hide items by status value via multi-select checkboxes in settings
- **External link template** (r001.013): URL pattern with `{{token}}` substitution for `externalLink` filter
- **Display Limits** settings section with maxItems input and status value checkboxes
- **External Link** settings section with link template input

## [1.19.0-r001.012] - 2026-03-12 - Token Filter Pipeline

### Added

- **Filter pipeline** (r001.012): Extended `substituteTokens()` to support `{{field | filter}}` and `{{field | "arg"}}` syntax
- **Date filter**: `{{dateField | "MMM D, YYYY"}}` — custom lightweight formatter supporting YYYY, YY, MMM, MM, M, D, DD, h, hh, mm, ss, A/a tokens
- **Autolink filter**: `{{textField | autolink}}` — regex URL detection wrapping plain-text URLs in `<a>` tags
- **External link filter**: `{{idField | externalLink}}` — renders "View" link using `externalLinkTemplate` config
- **`FilterContext`** interface: passes config values (externalLinkTemplate, dateFormatString) to renderer without coupling
- **`####` heading** support: maps to `<h6>` in markdown converter
- **Preview badge updates**: settings preview panel shows filter names in badges (e.g., `effectiveDate | "MMM D, YYYY"`)

### Fixed

- **Processing order**: Token substitution now runs before markdown-to-HTML conversion so pipe `|` and quote `"` characters in filter syntax are not mangled
- **Date token collision**: Used placeholder slot system in date formatter to prevent `MMM` → "Mar" being re-consumed by `M` and `A` passes

## [1.19.0-r001.011] - 2026-03-12 - Status Colors & Hover

### Added

- **Status color coding** (r001.011): Native color pickers in settings for each unique status value
- **Hover tooltip field** (r001.011): Configurable tooltip from any feed field

## [1.19.0-r001.010] - 2026-03-12 - Sorting

### Added

- **Configurable sorting** (r001.010): Sort field dropdown, asc/desc direction, reverse feed order toggle
- Smart comparison: tries date parsing, then numeric, then case-insensitive string

## [1.19.0-r001.009] - 2026-03-12 - Settings Panel

### Added

- **Discover Fields** button: fetches feed directly from settings panel, stores fields in component state
- **Card template** section: monospace textarea, field insert buttons (click to insert `{{field}}` at cursor), live preview
- **Status Colors** section: status field dropdown, color pickers per unique value
- **Hover Text** section: field picker for tooltip
- **Polling** section: refresh interval, show last updated toggle
- **Sorting** section: sort field, direction, reverse feed order

## [1.19.0-r001.004] - 2026-03-12 - Markdown Templates

### Added

- **Markdown template system** (`markdown-template-utils.ts`): Adapted from QuerySimple
  - `convertTemplateToHtml()` — Markdown subset to HTML (bold, italic, headings, lists, rules, links, images, indentation)
  - `renderPreview()` — replaces tokens with styled badges for settings preview
  - `extractFieldTokens()` — regex extraction of field names
- **Card template rendering**: Markdown → HTML → token substitution pipeline
- Double-brace `{{fieldName}}` token syntax (vs QS's single-brace)

## [1.19.0-r001.003] - 2026-03-12 - Polling & Error Handling

### Added

- **Polling lifecycle**: `setInterval` with configurable refresh interval (min 15s)
- **Page Visibility API**: Pause polling when tab hidden, immediate fetch on return
- **Non-blocking error handling**: Keep stale data visible, show warning banner on fetch failure

## [1.19.0-r001] - 2026-03-12 - Initial Scaffold

### Added

- **Widget scaffold** (r001.001): Directory structure, manifest.json, config.json, icon.svg
- **Config interface** (`config.ts`): Full `FeedSimpleConfig` with 15 settings covering feed source, display, polling, spatial join, and external link template
- **Debug logger** (`utils/debug-logger.ts`): Self-contained DebugLogger with features: FETCH, PARSE, RENDER, POLL, JOIN, TEMPLATE
- **Runtime stub** (`widget.tsx`): Placeholder widget showing feed URL status
- **Settings stub** (`setting.tsx`): Feed URL text input wired to config
- **Version management**: Independent versioning at r001, version-manager.ts for config migrations
- **Translations**: Runtime and settings i18n files with placeholder keys
- **Branded footer** (r001.002): "FeedSimple by MapSimple" with RSS icon and version display, matching QuerySimple footer pattern
- **Dev spec** (`docs/specs/FEEDSIMPLE_SPEC.md`): Condensed development specification organized by implementation phase
- **Phase 1: Fetch/Parse/Render** (r001.003):
  - `IFeedParser` interface (`utils/parsers/interface.ts`) — pluggable parser contract for future format support
  - `CustomXmlParser` (`utils/parsers/custom-xml.ts`) — arbitrary XML schema parser via DOMParser with HTML entity sanitization
  - `fetchFeed()` (`utils/feed-fetcher.ts`) — async feed fetcher with error handling
  - `substituteTokens()` (`utils/token-renderer.ts`) — `{{token}}` replacement engine
  - Widget fetches feed on mount, parses XML, renders items as cards
  - Status-driven card background color from `statusColorMap` config
  - Raw field display when no card template is configured
  - Loading and error states in widget UI
  - Auto-refetch when feed URL changes in settings
