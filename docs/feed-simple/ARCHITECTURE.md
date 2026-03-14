# FeedSimple Widget Architecture

This guide documents the architecture, data flow, and conventions for the FeedSimple Experience Builder widget.

**Version:** 1.19.0-r001.039
**Last Updated:** 2026-03-13

---

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Parser Layer](#parser-layer)
5. [Supported Feed Formats](#supported-feed-formats)
6. [Token Renderer](#token-renderer)
7. [Markdown Template System](#markdown-template-system)
8. [Polling Lifecycle](#polling-lifecycle)
9. [Map Integration (Spatial Join)](#map-integration-spatial-join)
10. [Feed Map Layer](#feed-map-layer)
11. [Zoom & Click Behavior](#zoom--click-behavior)
12. [Data Source Builder](#data-source-builder)
13. [Settings Panel](#settings-panel)
14. [Debug Logging](#debug-logging)
15. [File Inventory](#file-inventory)
16. [Key Interfaces and Types](#key-interfaces-and-types)

---

## Overview

FeedSimple is an ArcGIS Experience Builder Developer Edition widget that consumes XML-based feeds and renders items as styled cards. It is fully configurable — no feed URLs, field names, or status values are hardcoded. The widget is designed for government and public-sector XML feeds (road closures, alerts, incidents) but works with any XML feed.

### Three Modes

| Mode | Description | Requirements |
|------|-------------|--------------|
| **A — Visual Display** | Fetch, parse, and render feed items as Markdown-templated cards with status color coding, sorting, filtering, and external links | Feed URL only |
| **B — Spatial Join** | Runtime join between feed items and a feature service via shared ID field, enabling card click to zoom and identify on the map | Feed URL + FeatureLayer with matching ID field |
| **C — Feed Map Layer** | Auto-generate a client-side FeatureLayer from feed item coordinates (lat/lon fields), with bidirectional card-map click sync | Feed URL + lat/lon fields in feed data |

Modes can be enabled independently or in combination. B and C both add map interaction on top of A, and both can be active simultaneously on the same map widget.

### Independence from Other Widgets

FeedSimple is a standalone widget. It does not import from `shared-code/` or depend on QuerySimple or HelperSimple. It has its own debug logger, version management, and utility modules.

---

## Component Architecture

FeedSimple uses the Esri Hook and Shell pattern with React class components.

### Widget (Shell) — `widget.tsx`

The main runtime component is a `React.PureComponent` class. It manages:

- Feed fetching and parsing orchestration
- Polling lifecycle (start, stop, backoff, visibility awareness)
- Change detection and highlight animation scheduling
- Map integration state (geometry cache, selected card, MapView reference)
- Feed Map Layer lifecycle (create, sync, destroy via `feed-layer-manager.ts`)
- Sorting, filtering, and display limit application
- Card click routing (feed map layer zoom → spatial join zoom → external link)

The widget does not perform token substitution or HTML rendering — those responsibilities are delegated to `FeedCard` and the utility modules.

### FeedCard (Presentational) — `feed-card.tsx`

A function component responsible for rendering a single feed item card. It receives all data via props and has no coupling to widget state. Manages its own expand/collapse toggle via `useState`.

Responsibilities:
- Token substitution via `substituteTokens()`
- Markdown-to-HTML conversion via `convertTemplateToHtml()`
- Status-driven background color application
- Highlight animation overlay (gold flash, 2-second fade)
- Selected card indicator (blue border for map-synced selection)
- Keyboard accessibility (Enter/Space on clickable cards)
- Fallback raw field display when no template is configured
- **Card action toolbar** (r001.036): Zoom, Pan, and Expand icon buttons with disabled state + tooltips for items without geometry
- **No-geometry info banner** (r001.035): Temporary message below card when map interaction fails

### Setting (Hook) — `setting.tsx`

The builder-time configuration panel is a `React.PureComponent` class. It persists all settings to widget config JSON via `onSettingChange()`.

Key capabilities:
- **Discover Fields**: Fetches the feed and parses it to populate field dropdowns
- **Template editor**: Monospace textarea with click-to-insert field token buttons
- **Live preview**: Markdown-rendered preview with styled token badges
- **Status colors**: Native color pickers per unique status value
- **Map integration**: DataSourceSelector, join field dropdowns, MapWidgetSelector
- **Output DS registration**: Registers/deregisters the output DataSource when map integration config changes

---

## Data Flow

The end-to-end pipeline from XML feed to rendered cards:

```
1. FETCH           widget.tsx: loadFeed()
   |               Calls fetchFeed() → browser fetch API → raw XML text
   v
2. PARSE           widget.tsx: loadFeed()
   |               Calls CustomXmlParser.parse() → FeedItem[] + fieldNames[]
   v
3. SORT            widget.tsx: sortItems()
   |               Date → numeric → string comparison with configurable direction
   v
4. CHANGE DETECT   widget.tsx: detectChanges()
   |               Compare item IDs against previous cycle → highlight set
   v
5. FILTER          widget.tsx: getDisplayItems()
   |               filterByStatus exclusion → maxItems slice (applied in render)
   v
6. RENDER          feed-card.tsx: FeedCard component
   |               substituteTokens() → convertTemplateToHtml() → dangerouslySetInnerHTML
   v
7. MAP JOIN        widget.tsx: runQueryGeometries() [Mode B only]
                   Queries feature service → builds geometryMap for card clicks
```

### Error Handling Strategy

The widget uses a two-tier error model:

- **Full error** (`error` state): Shown when the first fetch fails and no data exists. Displays a red error panel.
- **Non-blocking error** (`fetchError` state): Shown when a subsequent fetch fails but previous data is available. Displays a yellow warning banner while keeping stale data visible.

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

All values are strings. Type coercion (date parsing, numeric comparison) happens at the point of use (sorting, date filters).

### CustomXmlParser (Universal XML)

The parser (`parsers/custom-xml.ts`) handles arbitrary XML schemas using a recursive tree walk with the browser's native `DOMParser`. It:

1. **Sanitizes HTML entities**: Replaces common entities (`&nbsp;`, `&mdash;`, `&rsquo;`, etc.) with numeric equivalents. Government and legacy feeds frequently use these without declaring them in a DTD.
2. **Parses XML**: Uses `DOMParser.parseFromString()` with `text/xml` content type.
3. **Extracts items**: Finds all elements matching `rootItemElement` (configurable, defaults to `"item"`).
4. **Recursive flattening**: Walks the full element tree to arbitrary depth, producing:
   - **Dot-path keys** for nested elements: `origin.latitude.value`
   - **`@` prefix** for attributes: `link.@href`, `event.@publicID`
   - **Bracket indexing** for repeated siblings: `category[0]`, `category[1]`
   - **Namespace stripping** via `localName` — prefix changes between feeds don't break templates
   - **xmlns filtering** — metadata declarations are excluded

Flat feeds (King County style) produce identical output to the original flat extractor — the recursive parser is fully backward compatible.

### GeoRSS Point Splitting (r001.037)

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
| **Flat XML** | Varies (e.g., `item`) | King County road closures | Simple child elements: `status`, `title`, `description` | ✅ |
| **Nested XML** | Varies (e.g., `event`) | USGS QuakeML | Dot-path keys: `origin.latitude.value`, `magnitude.mag.value` | ✅ |
| **RSS 2.0** | `item` | Standard RSS feeds | `title`, `link`, `description`, `pubDate`, `guid` | ✅ |
| **ATOM** | `entry` | USGS earthquake ATOM | `title`, `id`, `updated`, `link.@href`, `summary` | ✅ |
| **GeoRSS (ATOM)** | `entry` | USGS earthquake ATOM | `point_lat`, `point_lon` (synthetic from `<georss:point>`) | ✅ |

### How Each Format Works

**Flat XML / RSS 2.0** — Items contain simple single-depth child elements. The parser produces clean keys (`title`, `link`, `pubDate`). RSS 2.0 items live under `<channel><item>`, but `getElementsByTagName('item')` finds them regardless of nesting depth.

**Nested XML (QuakeML)** — Deep element trees are flattened into dot-path keys. A 4-level path like `<origin><latitude><value>` becomes `origin.latitude.value`. Namespace prefixes are stripped via `localName`, so `q:quakeml` and `quakeml` both produce the same keys.

**ATOM** — Uses `entry` as the root element. The `<link>` element is typically attribute-only (`<link href="..." rel="alternate"/>`), which the parser extracts as `link.@href` and `link.@rel`. The `<summary>` element may contain CDATA-wrapped HTML, which DOMParser unwraps transparently.

**GeoRSS** — An extension of ATOM/RSS. The `<georss:point>` element contains `"lat lon"` as a space-separated string. After namespace stripping, this becomes the `point` key. The parser's GeoRSS point splitting (r001.037) automatically emits `point_lat` and `point_lon` as separate fields. The user maps these to the Feed Map Layer lat/lon config.

### Not Yet Supported (Requires New Parsers)

| Format | Blocker | Effort |
|--------|---------|--------|
| **JSON Feed** | Needs `response.json()` in fetcher + JSON flattener | ~40 lines |
| **REST/JSON** | Same as JSON Feed, plus configurable items-array key | ~50 lines |

These are the only formats requiring new `IFeedParser` implementations. Everything downstream of `FeedItem[]` (tokens, cards, sorting, filtering, polling, map integration) is format-agnostic.

---

## Token Renderer

The token renderer (`token-renderer.ts`) handles `{{token}}` substitution with an optional filter pipeline.

### Token Syntax

| Syntax | Behavior |
|--------|----------|
| `{{fieldName}}` | Direct value substitution |
| `{{fieldName \| "MMM D, YYYY"}}` | Date formatting with quoted format string |
| `{{fieldName \| autolink}}` | Convert plain-text URLs to clickable `<a>` tags |
| `{{fieldName \| externalLink}}` | Render "View" link using `externalLinkTemplate` from config |

### Token Regex

A single regex matches all three forms:

```
\{\{(\s*[\w.@\[\]]+\s*)(?:\|\s*(?:"([^"]+)"|(\w+))\s*)?\}\}
```

- Group 1: field name
- Group 2: quoted argument (date format string)
- Group 3: named filter (autolink, externalLink)

### Date Filter

The date formatter supports these tokens: `YYYY`, `YY`, `MMM`, `MM`, `M`, `DD`, `D`, `hh`, `h`, `mm`, `ss`, `A`, `a`.

It uses a placeholder slot system to prevent token collision — for example, `MMM` produces "Mar", and without protection the subsequent `M` pass would consume the "M" in "Mar". Each replacement is stored in a numbered slot (`\x00N\x00`) and swapped back after all passes complete.

### FilterContext

The `FilterContext` interface decouples the renderer from widget config:

```typescript
interface FilterContext {
  externalLinkTemplate?: string
  dateFormatString?: string
}
```

The widget constructs this object in `render()` and passes it through `FeedCard` props to `substituteTokens()`.

---

## Markdown Template System

The markdown template system (`markdown-template-utils.ts`) converts a subset of Markdown to HTML for card rendering. It is adapted from QuerySimple's template utilities but uses double-brace `{{token}}` syntax.

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

1. **`convertTemplateToHtml(markdown)`** — Full markdown-to-HTML conversion for runtime rendering. Tokens pass through untouched for `substituteTokens()` to handle.
2. **`renderPreview(markdown)`** — Settings panel preview. Converts markdown to HTML, then replaces `{{token}}` references with styled badge `<span>` elements showing the field name and any filter.
3. **`extractFieldTokens(template)`** — Returns an array of field names referenced in a template string. Used by the settings panel for field dependency analysis.

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
4. Queries via JSAPI `FeatureLayer.queryFeatures()` — respects `definitionExpression` and web map filters (r001.035)
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
3. **Identify** (always): Queries the FeatureLayer for the matching feature and opens the native popup. When zoom is enabled, identify runs after the `goTo` animation completes. When zoom is disabled, identify runs immediately via the `doIdentify()` helper.

### ExB Lazy Popup Workaround

Experience Builder lazily initializes the MapView's popup. On first use, `mapView.popup` may exist but lack the `open()` method. Both `identifyFeatureOnMap` (spatial join) and `zoomToFeedPoint` (feed map layer) detect this condition and create a new `Popup` instance attached to the MapView.

### Fallback (Mode A Only)

When neither map integration mode is configured but `externalLinkTemplate` is set, card clicks substitute tokens into the URL template and open the result in a new browser tab.

### Map Integration Utilities

Six pure functions extracted into `map-interaction.ts`:

| Function | Purpose |
|----------|---------|
| `isMapIntegrationConfigured()` | Check if DS + both join fields are set |
| `inferGeometryType()` | Add JSAPI `type` property to REST geometry JSON |
| `buildGoToTarget()` | Compute goTo target (zoom level or expanded extent) |
| `buildPanTarget()` | Compute goTo target for panning (center only, no zoom change) |
| `identifyFeatureOnMap()` | Query feature + open popup with lazy-init workaround |
| `queryGeometries()` | Full geometry query pipeline with skip optimization |

The widget retains a thin wrapper (`runQueryGeometries`) that calls the pure function and applies results to component state via `setState`.

---

## Feed Map Layer

The Feed Map Layer (Mode C) auto-generates a client-side FeatureLayer from feed item coordinates (lat/lon fields). All logic lives in `feed-layer-manager.ts`.

### Layer Lifecycle

1. **Creation**: When `mapView`, config, and parsed items are all available, the widget calls `createFeedFeatureLayer()` which builds a `FeatureLayer` with `source: []`, adds it to the map, and registers a click handler for bidirectional sync.
2. **Sync**: On each poll cycle, `syncFeedItemsToLayer()` performs a full-replace via `applyEdits()` — delete all existing features, add new ones. Batched in groups of 500 for large feeds.
3. **Destruction**: `destroyFeedFeatureLayer()` removes the layer from the map on widget unmount, config disable, or map view change.

### Field Name Sanitization

JSAPI FeatureLayer field names cannot contain dots, `@`, or brackets. The flattener produces keys like `origin.latitude.value` and `link.@href`. The `buildFieldMapping()` function creates a bidirectional map:
- **Forward** (original → sanitized): `origin.latitude.value` → `origin_latitude_value`
- **Reverse** (sanitized → original): Used when reconstructing FeedItem from feature attributes for popup rendering

### CustomContent Popups

Popups use JSAPI's `CustomContent` mechanism rather than string-based popup templates. This ensures reliable HTML rendering from both:
- Programmatic `popup.open()` calls (card click → zoom to point)
- Native map click events (hitTest on the feed layer)

The popup content function reconstructs the original FeedItem from sanitized field attributes, then runs it through `substituteTokens()` and `convertTemplateToHtml()`.

### Bidirectional Click Sync

| Action | Behavior |
|--------|----------|
| **Card click** | Ensure layer visible → zoom to point (if enabled) + open popup on map via `zoomToFeedPoint()` |
| **Toolbar zoom** | Ensure layer visible → zoom to point + open popup via `zoomToFeedPoint()` |
| **Toolbar pan** | Ensure layer visible → center map (no zoom change) via `panToFeedPoint()` |
| **Map click** | `hitTest` on feed layer → highlight matching card + `scrollIntoView` via `data-feed-item-id` attributes |
| **Re-click same card** | Toggle off: close popup, deselect card |

### Auto-Restore Layer Visibility (r001.039)

When a user turns off the feed layer in the LayerList and then interacts with a card (click, toolbar zoom, toolbar pan), the `ensureFeedLayerVisible()` helper automatically sets `feedFeatureLayer.visible = true`. This ensures the user can always see the result of their interaction on the map. Logs `layer-visibility-restored` to the `FEED-LAYER` debug channel.

### Configuration

| Config Field | Default | Purpose |
|--------------|---------|---------|
| `enableFeedMapLayer` | `false` | Master toggle |
| `latitudeField` | (none) | Dot-path field name for latitude |
| `longitudeField` | (none) | Dot-path field name for longitude |
| `feedMapLayerTitle` | `'Feed Items'` | Layer name in LayerList |
| `feedMapLayerColor` | `'#FF4500'` | Marker color |
| `feedMapLayerSize` | `8` | Marker size in points |
| `feedMapLayerMarkerStyle` | `'circle'` | circle, square, diamond, cross, x |
| `feedMapLayerPopupTemplate` | (empty) | Popup template — falls back to `cardTemplate` |

---

## Zoom & Click Behavior

Zoom behavior is controlled by `enableZoomOnClick` (defaults to `true` via `!== false` pattern for backward compatibility). This setting affects both the Feed Map Layer and Spatial Join paths.

### Key Design Decision

**Zoom and identify are independent.** Disabling zoom does NOT disable popups or feature identification. The user may want popups without map animation. This is implemented as:

- **Feed Map Layer path**: `zoomToFeedPoint()` accepts `{ skipZoom?: boolean }` — the `goTo` call is inside a conditional, but the popup query + open always runs.
- **Spatial Join path**: A `doIdentify()` helper function is called either after `goTo` completes (zoom enabled) or immediately (zoom disabled).

### Shared Settings Section

The "Zoom & Click Behavior" settings section appears when `mapWidgetId` is set AND either Feed Map Layer or Spatial Join is fully configured. It contains:

| Setting | Condition | Default |
|---------|-----------|---------|
| Enable zoom on card click | Always shown | `true` |
| Zoom Level (Points) | Shown when zoom enabled | `15` |
| Zoom Buffer (Lines/Polygons) | Shown when zoom enabled AND spatial join configured | `1.5` |

The zoom level has no artificial max cap — JSAPI naturally clamps to the basemap's tile scheme limits.

---

## Data Source Builder

The data source builder (`data-source-builder.ts`) handles output DataSource registration for the ExB framework.

### Purpose

When map integration is fully configured (FeatureLayer selected + both join fields set), the settings panel registers an output DataSource with ExB. This allows other ExB widgets (Table, List, Feature Info) to connect to FeedSimple's data output.

### Two Public Functions

1. **`getOutputDataSourceId(widgetId)`** — Generates a deterministic output DS ID using the pattern `{widgetId}_output`
2. **`buildOutputDataSourceJson(widgetId, originDs, originUseDataSource)`** — Constructs the output DS JSON for `onSettingChange()`, deriving type, geometry, URL, and portal metadata from the origin DataSource

### Registration Lifecycle

- **Register**: Called from `saveConfigWithOutputDs()` in settings when all map integration fields are filled in
- **Deregister**: Called when the user clears the DataSource selection or removes a join field — passes an empty array to `onSettingChange()`

---

## Settings Panel

The settings panel is organized into eleven sections:

### 1. Feed Source

- **Feed URL**: Text input for the XML feed endpoint
- **Discover Fields**: Button that fetches the feed, parses it, and populates field dropdowns throughout the panel. Stores both field names and parsed items (for extracting unique status values)
- **Root Item Element**: XML element name for each item (e.g., `"item"`, `"event"`)

### 2. Card Template

- **Template textarea**: Monospace editor with placeholder hint
- **Insert Field buttons**: Click-to-insert `{{fieldName}}` at cursor position (uses `textarea.selectionStart` for precise insertion)
- **Live preview**: Rendered markdown with token badges replacing `{{field}}` references
- **Dot-path hint**: Shown when discovered fields contain nested dot-path keys

### 3. Status Colors

- **Status field dropdown**: Populated from discovered fields
- **Color pickers**: One native `<input type="color">` per unique status value. Changing the status field resets the color map.

### 4. Hover Text

- **Tooltip field dropdown**: Select which field value appears as the card hover tooltip

### 5. Polling

- **Refresh interval**: Numeric input (0 = manual only, minimum 15 seconds)
- **Show last updated**: Toggle for the timestamp display in the widget footer
- **Highlight new items**: Toggle for the gold flash animation on changed cards

### 6. Sorting

- **Sort field dropdown**: Populated from discovered fields. Empty = preserve feed order.
- **Sort direction**: Ascending or descending (shown only when a sort field is selected)
- **Reverse feed order**: Toggle to reverse the native feed order (shown only when no sort field is set)

### 7. Display Limits

- **Max items**: Numeric input (0 = show all)
- **Hide status values**: Multi-select checkboxes to exclude items by status value (shown only when status field is configured and fields are discovered)

### 8. External Link

- **Link template**: URL pattern with `{{token}}` substitution for the `externalLink` filter

### 9. Map Integration (Spatial Join)

- **Feature Layer**: `DataSourceSelector` for choosing a FeatureLayer
- **Join Field (Layer)**: Dropdown populated from the selected DS schema
- **Join Field (Feed)**: Dropdown populated from discovered feed fields
- **Map Widget**: `MapWidgetSelector` for selecting which Map widget to interact with
- **Status banner**: Green confirmation banner when map integration is fully configured

### 10. Feed Map Layer

- **Enable toggle**: Master on/off for client-side FeatureLayer generation
- **Latitude/Longitude field dropdowns**: Smart candidate detection with coordinate scoring heuristics
- **Layer title**: Name shown in LayerList
- **Marker color**: Color picker for point symbols
- **Marker size**: Numeric input (default 8)
- **Marker style**: Dropdown (circle, square, diamond, cross, x)
- **Popup template**: Optional — falls back to card template if empty
- **Map Widget**: MapWidgetSelector (shared ID with Map Integration)
- **Status banner**: Green confirmation banner when fully configured

### 11. Zoom & Click Behavior

Conditionally shown when `mapWidgetId` is set AND either Feed Map Layer or Spatial Join is fully configured.

- **Enable zoom on card click**: Toggle (default on). Popups still open regardless.
- **Zoom Level (Points)**: Numeric input (default 15, no hard max)
- **Zoom Buffer (Lines/Polygons)**: Numeric input (default 1.5, only shown when spatial join is configured)

---

## Debug Logging

FeedSimple uses a self-contained `DebugLogger` class (not shared with QuerySimple).

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
| `FEED-LAYER` | Feed Map Layer creation, sync, destroy, card click, map click |
| `TEMPLATE` | Token substitution and filter pipeline |
| `BUG` | Known bugs/issues (always enabled, logged as `console.warn`) |

### Output Format

All log entries are JSON-formatted with a `feature` tag, ISO timestamp, and action-specific data:

```
[FEEDSIMPLE-FETCH] {"feature":"FETCH","timestamp":"...","action":"fetch-start","url":"..."}
```

---

## File Inventory

### Source Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/config.ts` | `FeedSimpleConfig` interface and `IMConfig` type alias | 99 |
| `src/version.ts` | Version constants (`BASE_VERSION`, `RELEASE_NUMBER`, `MINOR_VERSION`) | 17 |
| `src/version-manager.ts` | ExB config migration manager (BaseVersionManager subclass) | 13 |
| `src/runtime/widget.tsx` | Main widget — lifecycle, polling, fetch, sort, filter, card click routing, map integration, feed layer, scroll-to-top, layer visibility auto-restore | 1217 |
| `src/runtime/feed-card.tsx` | FeedCard component — token substitution, markdown rendering, status colors, highlight animation, card toolbar (zoom/pan/expand) | 330 |
| `src/runtime/translations/default.ts` | Runtime i18n strings (17 keys) | 18 |
| `src/setting/setting.tsx` | Builder settings — field discovery, template editor, status colors, map integration, feed map layer, zoom config | 1187 |
| `src/setting/translations/default.ts` | Settings i18n strings (31 keys) | 31 |
| `src/utils/feed-fetcher.ts` | Async feed fetcher with error handling | 32 |
| `src/utils/token-renderer.ts` | Token substitution engine with date, autolink, and externalLink filters | 165 |
| `src/utils/markdown-template-utils.ts` | Markdown-to-HTML converter, preview renderer, field extractor | 200 |
| `src/utils/map-interaction.ts` | Spatial join + pan utilities — config check, geometry type, zoom/pan target, popup, geometry query | 253 |
| `src/utils/feed-layer-manager.ts` | Feed Map Layer — FeatureLayer creation, sync via applyEdits, CustomContent popups, field sanitization, zoom/pan/identify | 482 |
| `src/utils/feature-join.ts` | JSAPI FeatureLayer query with batched WHERE IN via queryFeatures (respects definitionExpression) | 145 |
| `src/utils/data-source-builder.ts` | Output DataSource JSON generation for settings registration | 54 |
| `src/utils/debug-logger.ts` | Self-contained DebugLogger class with URL-driven activation | 145 |
| `src/utils/parsers/interface.ts` | `IFeedParser` interface, `FeedItem` type, `ParseResult` type | 30 |
| `src/utils/parsers/custom-xml.ts` | Universal XML parser — recursive flattener, GeoRSS point splitting, namespace stripping | 168 |

**Total source lines: ~4,586**

### Non-Source Files

| File | Purpose |
|------|---------|
| `manifest.json` | Widget manifest — declares `jimu-arcgis` dependency, publishMessages |
| `config.json` | Default widget configuration values |
| `icon.svg` | Widget icon for the builder panel |
| `src/runtime/assets/icons/.gitkeep` | Placeholder for future icon assets |

---

## Key Interfaces and Types

### FeedSimpleConfig

The central configuration interface with 33 fields organized into eight groups:

| Group | Fields |
|-------|--------|
| Feed Source | `feedUrl`, `rootItemElement` |
| Display | `cardTemplate`, `statusField`, `statusColorMap`, `hoverTextField`, `dateFormatString`, `maxItems`, `filterByStatus` |
| Sorting | `sortField`, `sortDirection`, `reverseFeedOrder` |
| Polling | `refreshInterval`, `showLastUpdated`, `highlightNewItems` |
| Map Integration | `joinFieldService`, `joinFieldFeed`, `mapWidgetId`, `zoomFactorPoint`, `zoomFactorPoly` |
| External Link | `externalLinkTemplate` |
| Feed Map Layer | `enableFeedMapLayer`, `latitudeField`, `longitudeField`, `feedMapLayerTitle`, `feedMapLayerColor`, `feedMapLayerSize`, `feedMapLayerMarkerStyle`, `feedMapLayerPopupTemplate` |
| Zoom & Click | `enableZoomOnClick`, `enableCardExpand` |

### Widget State

| Field | Type | Purpose |
|-------|------|---------|
| `items` | `FeedItem[]` | Current parsed and sorted feed items |
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
| `noGeometryItemId` | `string \| null` | Card showing "no geometry" info message (auto-clears after 3s) |
| `showScrollTop` | `boolean` | Whether scroll-to-top button is visible |

### FeedCardProps

Explicit props interface for the FeedCard component:

| Prop | Type | Purpose |
|------|------|---------|
| `item` | `FeedItem` | The feed item data |
| `isHighlighted` | `boolean` | New/changed animation state |
| `isSelected` | `boolean` | Map-synced selection state |
| `cardTemplate` | `string` | Markdown/token template |
| `statusField` | `string` | Field driving background color |
| `statusColorMap` | `StatusColorMap` | Status value to color mapping |
| `hoverTextField` | `string` | Field for tooltip |
| `filterContext` | `FilterContext` | Config values for token filters |
| `clickable` | `boolean` | Whether the card is interactive |
| `highlightDurationMs` | `number` | Animation duration |
| `onClick` | `(item, evt) => void` | Click handler (optional) |
| `noGeometryMessage` | `string \| undefined` | Temporary info banner text (auto-clears after 3s) |
| `showZoomButton` | `boolean` | Show zoom button in toolbar |
| `showPanButton` | `boolean` | Show pan button in toolbar |
| `showExpandButton` | `boolean` | Show expand/collapse button in toolbar |
| `hasGeometry` | `boolean` | Whether this item has geometry (disables zoom/pan when false) |
| `onZoom` | `(item) => void` | Zoom toolbar button handler |
| `onPan` | `(item) => void` | Pan toolbar button handler |
| `toolbarLabels` | `object \| undefined` | i18n labels for toolbar tooltips |

### RestGeometry

Geometry object from the ArcGIS REST API:

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

Decouples token renderer from widget config:

```typescript
interface FilterContext {
  externalLinkTemplate?: string
  dateFormatString?: string
}
```

---

## Dependencies

| Import Source | Used By | Purpose |
|--------------|---------|---------|
| `jimu-core` | widget, setting, feed-card, data-source-builder | React, jsx, css, DataSourceComponent, DataSourceManager, Immutable |
| `jimu-arcgis` | widget | JimuMapViewComponent, JimuMapView |
| `jimu-for-builder` | setting | AllWidgetSettingProps |
| `jimu-ui` | setting | TextInput, NumericInput, Switch, Select, Option, Button |
| `jimu-ui/advanced/setting-components` | setting | SettingSection, SettingRow, MapWidgetSelector |
| `jimu-ui/advanced/data-source-selector` | setting | DataSourceSelector |
| `esri/Graphic` | widget, feed-layer-manager | Constructing graphics for MapView.goTo() and layer source |
| `esri/layers/FeatureLayer` | feed-layer-manager | Client-side FeatureLayer from feed coordinates |
| `esri/geometry/Point` | feed-layer-manager | Point geometry construction for feed items |
| `esri/PopupTemplate` | feed-layer-manager | Popup template for feed layer features |
| `esri/popup/content/CustomContent` | feed-layer-manager | Custom HTML popups with token rendering |
| `esri/widgets/Popup` | map-interaction, feed-layer-manager | Lazy popup initialization workaround |
| (no `esri/request`) | — | Removed in r001.035 — all queries now go through JSAPI `FeatureLayer.queryFeatures()` |
