# FeedSimple Changelog

All notable changes to the FeedSimple widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
