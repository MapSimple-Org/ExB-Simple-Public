# FeedSimple Widget Architecture

This guide documents the architecture, data flow, and conventions for the FeedSimple Experience Builder widget.

**Version:** 1.19.0-r001.031
**Last Updated:** 2026-03-13

---

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Parser Layer](#parser-layer)
5. [Token Renderer](#token-renderer)
6. [Markdown Template System](#markdown-template-system)
7. [Polling Lifecycle](#polling-lifecycle)
8. [Map Integration](#map-integration)
9. [Data Source Builder](#data-source-builder)
10. [Settings Panel](#settings-panel)
11. [Debug Logging](#debug-logging)
12. [File Inventory](#file-inventory)
13. [Key Interfaces and Types](#key-interfaces-and-types)

---

## Overview

FeedSimple is an ArcGIS Experience Builder Developer Edition widget that consumes XML-based feeds and renders items as styled cards. It is fully configurable — no feed URLs, field names, or status values are hardcoded. The widget is designed for government and public-sector XML feeds (road closures, alerts, incidents) but works with any XML feed.

### Two Modes

| Mode | Description | Requirements |
|------|-------------|--------------|
| **A — Visual Display** | Fetch, parse, and render feed items as Markdown-templated cards with status color coding, sorting, filtering, and external links | Feed URL only |
| **B — Spatial Data Source** | Runtime join between feed items and a feature service via shared ID field, enabling card click to zoom and identify on the map | Feed URL + FeatureLayer with matching ID field |

Modes can be enabled independently or together. Mode B adds map integration on top of Mode A.

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
- Sorting, filtering, and display limit application
- Card click routing (map zoom or external link)

The widget does not perform token substitution or HTML rendering — those responsibilities are delegated to `FeedCard` and the utility modules.

### FeedCard (Presentational) — `feed-card.tsx`

A stateless function component responsible for rendering a single feed item card. It receives all data via props and has no coupling to widget state.

Responsibilities:
- Token substitution via `substituteTokens()`
- Markdown-to-HTML conversion via `convertTemplateToHtml()`
- Status-driven background color application
- Highlight animation overlay (gold flash, 2-second fade)
- Selected card indicator (blue border for map-synced selection)
- Keyboard accessibility (Enter/Space on clickable cards)
- Fallback raw field display when no template is configured

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

This pluggable design enables future format support (RSS 2.0, Atom, GeoRSS, JSON Feed) without modifying widget or render code.

### FeedItem Type

A single feed item is a flat key-value map where XML element names become keys:

```typescript
interface FeedItem {
  [fieldName: string]: string
}
```

All values are strings. Type coercion (date parsing, numeric comparison) happens at the point of use (sorting, date filters).

### CustomXmlParser

The v1 parser (`parsers/custom-xml.ts`) handles arbitrary XML schemas using the browser's native `DOMParser`. It:

1. **Sanitizes HTML entities**: Replaces common entities (`&nbsp;`, `&mdash;`, `&rsquo;`, etc.) with numeric equivalents. Government and legacy feeds frequently use these without declaring them in a DTD.
2. **Parses XML**: Uses `DOMParser.parseFromString()` with `text/xml` content type.
3. **Extracts items**: Finds all elements matching `rootItemElement` (configurable, defaults to `"item"`).
4. **Flattens fields**: Extracts direct child elements of each item as key-value pairs using `localName` and `textContent`.

The parser does not handle nested elements, attributes, or namespaces — values are extracted from leaf element text content only.

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
\{\{(\s*[\w.]+\s*)(?:\|\s*(?:"([^"]+)"|(\w+))\s*)?\}\}
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

## Map Integration

Map integration (Mode B) enables feed items to be linked to features on a map via a shared ID field.

### Geometry Query Pipeline

1. After each successful feed parse, the widget checks if map integration is configured
2. Collects join field values from all feed items
3. Queries the feature service REST endpoint via `esriRequest` (which auto-attaches portal/AGOL auth tokens)
4. Batches large ID sets into groups of 500 to stay within URL/query limits
5. Builds a `geometryMap`: `Map<joinValue, RestGeometry>`
6. Optimization: Skips re-query if the set of join IDs has not changed since the last poll cycle

### Card Click Behavior

When a card is clicked and map integration is configured:

1. **Toggle**: Clicking the same card again deselects it and closes the popup
2. **Zoom**: Calls `MapView.goTo()` with an animated transition
   - Point features: Zoom to a configurable zoom level (default 15)
   - Line/polygon features: Expand the geometry extent by a configurable buffer factor (default 1.5)
3. **Popup**: Queries the FeatureLayer for the matching feature and opens the native popup with the layer's configured popup template

### ExB Lazy Popup Workaround

Experience Builder lazily initializes the MapView's popup. On first use, `mapView.popup` may exist but lack the `open()` method. The `identifyFeatureOnMap` utility detects this condition and creates a new `Popup` instance attached to the MapView.

### Fallback (Mode A Only)

When map integration is not configured but `externalLinkTemplate` is set, card clicks substitute tokens into the URL template and open the result in a new browser tab.

### Map Integration Utilities

Five pure functions extracted into `map-interaction.ts`:

| Function | Purpose |
|----------|---------|
| `isMapIntegrationConfigured()` | Check if DS + both join fields are set |
| `inferGeometryType()` | Add JSAPI `type` property to REST geometry JSON |
| `buildGoToTarget()` | Compute goTo target (zoom level or expanded extent) |
| `identifyFeatureOnMap()` | Query feature + open popup with lazy-init workaround |
| `queryGeometries()` | Full geometry query pipeline with skip optimization |

The widget retains a thin wrapper (`runQueryGeometries`) that calls the pure function and applies results to component state via `setState`.

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

The settings panel is organized into seven collapsible sections:

### 1. Feed Source

- **Feed URL**: Text input for the XML feed endpoint
- **Discover Fields**: Button that fetches the feed, parses it, and populates field dropdowns throughout the panel. Stores both field names and parsed items (for extracting unique status values)

### 2. Card Template

- **Template textarea**: Monospace editor with placeholder hint
- **Insert Field buttons**: Click-to-insert `{{fieldName}}` at cursor position (uses `textarea.selectionStart` for precise insertion)
- **Live preview**: Rendered markdown with token badges replacing `{{field}}` references

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

### 9. Map Integration

- **Feature Layer**: `DataSourceSelector` for choosing a FeatureLayer
- **Join Field (Layer)**: Dropdown populated from the selected DS schema
- **Join Field (Feed)**: Dropdown populated from discovered feed fields
- **Map Widget**: `MapWidgetSelector` for selecting which Map widget to interact with
- **Zoom Level (Points)**: Numeric input (1-23, default 15)
- **Zoom Buffer (Lines/Polygons)**: Numeric input (min 1.0, default 1.5)
- **Status banner**: Green confirmation banner when map integration is fully configured

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
| `src/config.ts` | `FeedSimpleConfig` interface and `IMConfig` type alias | 76 |
| `src/version.ts` | Version constants (`BASE_VERSION`, `RELEASE_NUMBER`, `MINOR_VERSION`) | 18 |
| `src/version-manager.ts` | ExB config migration manager (BaseVersionManager subclass) | 13 |
| `src/runtime/widget.tsx` | Main widget — lifecycle, polling, fetch, sort, filter, card click routing, map integration state | 783 |
| `src/runtime/feed-card.tsx` | FeedCard presentational component — token substitution, markdown rendering, status colors, highlight animation | 140 |
| `src/runtime/translations/default.ts` | Runtime i18n strings (9 keys) | 10 |
| `src/setting/setting.tsx` | Builder settings — field discovery, template editor, status colors, map integration config | 862 |
| `src/setting/translations/default.ts` | Settings i18n strings (29 keys) | 30 |
| `src/utils/feed-fetcher.ts` | Async feed fetcher with error handling | 33 |
| `src/utils/token-renderer.ts` | Token substitution engine with date, autolink, and externalLink filters | 160 |
| `src/utils/markdown-template-utils.ts` | Markdown-to-HTML converter, preview renderer, field extractor | 201 |
| `src/utils/map-interaction.ts` | Map integration utilities — config check, geometry type, zoom target, popup, geometry query | 209 |
| `src/utils/feature-join.ts` | Feature service REST query with batched WHERE IN via esriRequest | 158 |
| `src/utils/data-source-builder.ts` | Output DataSource JSON generation for settings registration | 55 |
| `src/utils/debug-logger.ts` | Self-contained DebugLogger class with URL-driven activation | 145 |
| `src/utils/parsers/interface.ts` | `IFeedParser` interface, `FeedItem` type, `ParseResult` type | 31 |
| `src/utils/parsers/custom-xml.ts` | XML parser via DOMParser with HTML entity sanitization | 67 |

**Total source lines: ~2,990**

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

The central configuration interface with 22 fields organized into six groups:

| Group | Fields |
|-------|--------|
| Feed Source | `feedUrl`, `rootItemElement` |
| Display | `cardTemplate`, `statusField`, `statusColorMap`, `hoverTextField`, `dateFormatString`, `maxItems`, `filterByStatus` |
| Sorting | `sortField`, `sortDirection`, `reverseFeedOrder` |
| Polling | `refreshInterval`, `showLastUpdated`, `highlightNewItems` |
| Map Integration | `joinFieldService`, `joinFieldFeed`, `mapWidgetId`, `zoomFactorPoint`, `zoomFactorPoly` |
| External Link | `externalLinkTemplate` |

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

### FeedCardProps

Explicit props interface for the presentational FeedCard component:

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
| `esri/Graphic` | widget | Constructing graphics for MapView.goTo() |
| `esri/widgets/Popup` | map-interaction | Lazy popup initialization workaround |
| `esri/request` | feature-join | Authenticated REST queries with auto-token attachment |
