# FeedSimple Widget TODOs

---

## Phase 1 — Core (Fetch, Parse, Render)

### 1. XML Feed Fetcher
**Status:** ✅ Complete (r001.003)

- ✅ `fetch` call with error handling (network errors, non-200 responses, malformed XML)
- ✅ Parse XML response using DOMParser
- ✅ Extract items using configured `rootItemElement`
- ✅ Build item objects as key-value pairs from child elements

### 2. Card Renderer
**Status:** ✅ Complete (r001.004)

- ✅ Token substitution engine (`{{fieldName}}` replacement)
- ✅ Markdown-to-HTML rendering per item
- ✅ Status-driven background color from `statusColorMap`
- ✅ Card component with styled output

### 3. CORS Testing
**Status:** ✅ Complete

- ✅ KC feed endpoint works without CORS issues in Dev Edition deployment

---

## Phase 2 — Template Token System

### 4. Filter Pipeline
**Status:** ✅ Complete (r001.012)

- ✅ Date formatting filter (`{{field | "MMM D, YYYY"}}`) — placeholder slot system prevents token collision
- ✅ Autolink filter (`{{field | autolink}}`) — regex URL detection → `<a>` tags
- ✅ External link filter (`{{field | externalLink}}`) — uses `externalLinkTemplate` config
- ✅ `FilterContext` interface for passing config without coupling
- ✅ Processing order fix: token substitution runs before markdown conversion

### 5. Live Template Preview
**Status:** ✅ Complete (r001.009)

- ✅ Settings panel: monospace textarea with field insert buttons
- ✅ Preview renders tokens as styled badges (updated for filter syntax)

---

## Phase 3 — Polling Lifecycle

### 6. Poller Implementation
**Status:** ✅ Complete (r001.014)

- ✅ `setInterval` with configurable interval (min 15s)
- ✅ Visibility awareness via Page Visibility API (pause when hidden, immediate fetch on return)
- ✅ Non-blocking error handling (keep stale data, show warning banner)
- ✅ Change detection by ID (new/changed items via hash comparison)
- ✅ Exponential backoff on consecutive failures (3 → double, 6 → pause with retry banner)

### 7. New Item Animation
**Status:** ✅ Complete (r001.014)

- ✅ Transient CSS "flash" class on new/changed cards (~2s gold fade)
- ✅ Configurable via `highlightNewItems` toggle

---

## Phase 4 — Full Settings Panel

### 8. Complete Settings UI
**Status:** ✅ Complete (r001.013)

- ✅ Feed source (URL, root element)
- ✅ Card template with preview and field insert buttons
- ✅ Status field dropdown + color pickers per value
- ✅ Hover text field picker
- ✅ Polling: refresh interval, show last updated toggle, highlight new items toggle
- ✅ Sorting: sort field, direction, reverse feed order
- ✅ Display limits: maxItems, filterByStatus checkboxes
- ✅ External link template input

---

## Phase 5 — Map Integration

### 9. Settings Configuration
**Status:** ✅ Complete (r001.015–018)

- ✅ DataSourceSelector for FeatureLayer selection (stored in widget useDataSources)
- ✅ Join field dropdowns: layer field + feed field (auto-populated from DS schema)
- ✅ MapWidgetSelector for target map widget
- ✅ Configurable zoom level (points, 1–23) and zoom buffer (lines/polys, min 1.0)
- ✅ Green status banner when fully configured
- ✅ Output DS registration via `onSettingChange` for ExB framework awareness

### 10. Runtime Map Interaction
**Status:** ✅ Complete (r001.019–029)

- ✅ Geometry query via `esriRequest` (auto-attaches AGOL/portal auth tokens)
- ✅ Batched WHERE IN queries (500 IDs per batch, numeric vs string detection)
- ✅ Spatial reference attachment from REST response level
- ✅ Geometry type inference (point/polygon/polyline/multipoint) for JSAPI autocasting
- ✅ Card click → `MapView.goTo()` with configurable zoom/buffer + animated transition
- ✅ Feature identification via JSAPI `Popup.open()` with lazy init workaround for ExB
- ✅ Toggle behavior: click same card to deselect and close popup
- ✅ Selected card visual indicator (blue border)
- ✅ DataSourceComponent for origin DS lifecycle (ensures DS ready before query)
- ✅ Polling optimization: skip geometry re-query when join IDs unchanged

---

## Code Extraction (widget.tsx)
**Status:** ✅ Complete (r001.031)

### Extract `FeedCard` component → `src/runtime/feed-card.tsx` (139 lines)
- ✅ Function component with explicit `FeedCardProps` interface
- ✅ Owns token substitution + markdown conversion (imports moved from widget.tsx)
- ✅ Keyboard accessibility (Enter/Space) handled internally

### Extract map interaction utilities → `src/utils/map-interaction.ts` (209 lines)
- ✅ `isMapIntegrationConfigured` — pure config check, replaced 6 class method call sites
- ✅ `inferGeometryType` — adds JSAPI `type` property to REST geometry
- ✅ `buildGoToTarget` — point zoom vs poly extent.expand
- ✅ `identifyFeatureOnMap` — feature query + popup with ExB lazy-init workaround
- ✅ `queryGeometries` — returns `{ geometryMap, newJoinIds, skipped }` for caller to apply to state
- ✅ Widget retains thin `runQueryGeometries` wrapper for state management

### NOT extracting (too small)
- Sorting (~30 lines), Filtering (~25 lines), Change Detection (~60 lines), Polling (~75 lines)

widget.tsx: 989 → 783 lines (−206)

---

## Future — Additional Feed Types

### Current architecture
The parser layer is already pluggable: `IFeedParser` interface in `parsers/interface.ts` (30 lines), with `CustomXmlParser` in `parsers/custom-xml.ts` (67 lines). `feed-fetcher.ts` (33 lines) handles the HTTP fetch. Total feed consumption code: ~130 lines across 3 files. Each new parser is a ~50–70 line file implementing `IFeedParser.parse(rawText, rootItemElement) → ParseResult`.

All parsers produce the same output: `FeedItem[]` (flat key-value pairs) + `fieldNames[]`. The widget, card renderer, token system, sorting, filtering, and map integration are all format-agnostic — they only see `FeedItem` objects.

### Feed types to support

| Type | Format | `rootItemElement` meaning | Parser size | Notes |
|------|--------|--------------------------|-------------|-------|
| **Custom XML** | XML | XML element name wrapping each item (e.g., `"item"`) | 168 lines | ✅ Shipped — handles government/legacy feeds with arbitrary schemas |
| **RSS 2.0** | XML | User sets root to `item` | No new parser | ✅ Covered by CustomXmlParser — flat child elements produce clean keys (title, link, pubDate, etc.) |
| **Atom** | XML | User sets root to `entry` | No new parser | ✅ Covered by CustomXmlParser — attributes via `link.@href`, GeoRSS point split for coordinates (r001.037). Tested with USGS earthquake ATOM feed. |
| **JSON Feed** | JSON | Fixed: `items` array per [jsonfeed.org](https://jsonfeed.org) spec | ~40 lines | Fields: title, url, content_html. Niche but simple |
| **REST/JSON** | JSON | JSON key holding the items array (e.g., `"features"`, `"results"`) | ~50 lines | Generic — user configures the array path. Handles any JSON API |
| **GeoRSS** | XML | RSS/Atom + `<georss:point>`, `<georss:polygon>` | ~80 lines | ✅ Partial — `<georss:point>` splitting handled at parse time (r001.037). Full GeoRSS polygon/line support TBD |

### Settings changes needed (JSON parsers only)
- RSS 2.0 and Atom are fully handled by CustomXmlParser — no new parsers or settings needed (user sets root element to `item` or `entry`)
- **Feed Type dropdown** would only be needed if adding JSON parsers: JSON Feed, REST/JSON
- REST/JSON → `rootItemElement` label changes to "Items array key" (e.g., `features`)
- JSON formats → `feed-fetcher.ts` needs `response.json()` path (currently only does `response.text()`)
- REST/JSON may need auth headers — small fetcher enhancement, not a new architecture

### Test feeds for development
- **USGS Earthquakes** — https://earthquake.usgs.gov/earthquakes/feed/v1.0/quakeml.php
  - Offers QuakeML (XML), GeoJSON, Atom, CSV, and KML formats for the same data
  - GeoJSON feed has lat/lon per feature — great test case for feed-as-layer mode
  - Atom feed is a real-world Atom 1.0 test target
  - Multiple time windows (past hour, day, week, month) and magnitude filters
  - Public, no auth, CORS-friendly, actively updated

### What does NOT change
Token system, card templates, sorting, filtering, polling, change detection, map integration, settings (except the feed type dropdown and conditional root element label). Everything downstream of `FeedItem[]` is format-agnostic.

---

## Phase 6 — Universal XML Parser
**Status:** ✅ Complete (r001.032)

### Recursive XML Flattener
- ✅ Recursive tree walk handles any XML nesting depth
- ✅ Dot-path keys (e.g., `origin.latitude.value`)
- ✅ Attribute extraction with `@` prefix (`link.@href`, `event.@publicID`)
- ✅ Array handling with bracket indexing (`category[0]`, `category[1]`)
- ✅ Namespace stripping via `localName`
- ✅ xmlns declarations filtered out
- ✅ Backward compatible with flat KC XML feeds
- ✅ Token regexes updated to support `@` and `[]` in field names

---

## Phase 7 — Feed Map Layer (Client-Side FeatureLayer)
**Status:** ✅ Complete (r001.033)

### 11. Feed Map Layer Settings
- ✅ Enable/disable toggle for Feed Map Layer
- ✅ Latitude and longitude field dropdowns (smart coordinate detection with scoring)
- ✅ Layer title, marker color, marker size, marker style (circle/square/diamond/cross/x)
- ✅ Popup template (reuses card template if empty)
- ✅ Map widget selector (shared with Map Integration)
- ✅ Green status banner when fully configured

### 12. Feed Map Layer Runtime
- ✅ Client-side FeatureLayer with `source: []` + `applyEdits()` sync
- ✅ Layer appears in LayerList (`listMode: 'show'`)
- ✅ Configurable SimpleRenderer (color, size, style)
- ✅ CustomContent popups with reconstructed FeedItem from sanitized attributes
- ✅ Field name sanitization: `origin.latitude.value` → `origin_latitude_value` with bidirectional mapping
- ✅ Full-replace sync on each poll cycle, batched in 500s for large feeds
- ✅ Invalid/missing coordinates silently skipped with debug logging
- ✅ Layer auto-created when mapView + config + items are ready
- ✅ Layer destroyed on unmount, config disable, or map view change
- ✅ Style config changes → layer recreation with new renderer

### 13. Bidirectional Card-Map Sync
- ✅ Card click → zoom to point + open popup (via `zoomToFeedPoint`)
- ✅ Map click → `hitTest` on feed layer → highlight matching card + `scrollIntoView`
- ✅ Toggle behavior: click same card to deselect and close popup
- ✅ `data-feed-item-id` attributes on card wrappers for scroll targeting

---

## Phase 8 — Zoom & Click Behavior
**Status:** ✅ Complete (r001.034)

### 14. Zoom on Click Toggle
- ✅ `enableZoomOnClick` config boolean (defaults to `true`)
- ✅ When disabled: card clicks still open popups/identify features, only zoom is suppressed
- ✅ Works for both Feed Map Layer and Spatial Join paths
- ✅ `zoomToFeedPoint` accepts `{ skipZoom }` option
- ✅ Spatial join path: `doIdentify()` called immediately when zoom is disabled

### 15. Shared Zoom Settings Section
- ✅ "Zoom & Click Behavior" settings section — appears when either integration is configured
- ✅ Zoom level for points: no hard max (JSAPI handles basemap limits)
- ✅ Zoom buffer for lines/polygons: only shown when spatial join is configured
- ✅ Settings description clarifies popups still open regardless of zoom toggle

---

## Future — Other Enhancements

| Topic | Detail | Priority |
|-------|--------|----------|
| Multiple feed sources | Merge items from multiple URLs | Medium |
| Card click → selection message | Publish `DATA_RECORDS_SELECTION_CHANGE` for inter-widget communication | Low |
| HelperSimple URL hash integration | Customer may want to pass a custom URL parameter (e.g., `#feedfilter=value`) to FeedSimple, similar to how HelperSimple listens for URL hashes and relays them to QuerySimple. Would need HelperSimple awareness of FeedSimple as a target widget, plus a config option in FeedSimple for which feed field to filter on. Approach TBD — could be HelperSimple relay, direct hash listening, or ExB message action. | TBD |

---

## Documentation

### Public-Share Docs (Complete)
- [x] Architecture doc: `docs/feed-simple/ARCHITECTURE.md`
- [x] Process flows: `docs/feed-simple/process-flows/` (6 flows + README)
- [x] Changelog moved to: `docs/feed-simple/CHANGELOG.md`

### Unit Tests
- [x] Phase 1 tests: `token-renderer.test.ts` (30 tests), `custom-xml-parser.test.ts` (20 tests), `markdown-template-utils.test.ts` (50 tests)
- [ ] Phase 2 tests: feed-layer pure utils (`sanitizeFieldName`, `buildFieldMapping`, `isFeedMapLayerConfigured`)
- [ ] Phase 2 tests: map-interaction pure utils (`isMapIntegrationConfigured`, `inferGeometryType`)
- [ ] Phase 3 tests: `feed-fetcher.ts` (uses jest-fetch-mock)

### Pending
- [ ] Review generated ARCHITECTURE.md and process flows for accuracy
- [ ] Public README update (coordinated with QS — TODO #12 in QS TODO)

---

## Resolved Questions

| Topic | Detail | Resolution |
|-------|--------|------------|
| CORS on feed endpoints | KC feed works in Dev Edition | Works natively |
| Feature service auth | Target endpoints require AGOL tokens | Solved via `esriRequest` auto-auth |
| Parser format scope | v1 = custom XML only; RSS 2.0 is v2 | CustomXmlParser handles all XML variants — flat, nested (QuakeML), RSS 2.0, Atom, GeoRSS. Only JSON formats need new parsers. |
| ExB popup initialization | `popup.open` not a function on first use | Create `Popup` instance if not initialized |
