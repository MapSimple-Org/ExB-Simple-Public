# Changelog

All notable changes to MapSimple Experience Builder widgets will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Archive**: For releases r001-r021, see [CHANGELOG_ARCHIVE_r001-r021.md](docs/archive/CHANGELOG_ARCHIVE_r001-r021.md)

## [1.19.0-r026.018–024] - 2026-03-24 - Data Source Rebinding Tool

### Added
- **Data Source Rebinding Tool** (`rebind-tool.tsx`, `rebind-utils.ts`): New "Data Source Management" section in the settings panel. Lets users rebind query items to a replacement data source when a layer is swapped in the web map.
- **Auto-heal mode**: When the replacement DS has identical field names, one-click "Apply" swaps all references — no field mapping needed.
- **Field mapping mode**: When field names differ, an interactive mapping table lets users remap each field. Auto-matches identical names, highlights unmatched fields with dropdowns. "Leave unmapped fields as-is" option for partial rebinding.
- **Comprehensive field remapping**: Updates `useDataSource`, `sqlExprObj` (recursive for nested AND/OR), `resultTitleExpression` ({{field}} and legacy {field} tokens), `resultContentExpression` (preserves filter chains), `resultDisplayFields`, `sortOptions`, and `resultTitleFields`.
- **Automatic orphan cleanup**: After rebinding, the old DS is automatically removed from the widget's `useDataSources` via the existing `getAllDataSources()` rebuild pipeline (triggered by `dsUpdateRequired: true`).
- **Broken DS banner** (`query-item-list.tsx`): When ExB's `DataSourceTip` reports inaccessible data sources on query items, a yellow banner appears directing the user to the Data Source Management tool.
- **Debug logging**: Rebind apply and cleanup actions logged via `debugLogger` for troubleshooting.
- **48 unit tests**: Full coverage of `extractFieldReferences()`, `analyzeRebinding()`, `applyRebinding()`, `replaceFieldTokensInTemplate()`, and `remapSqlExpression()`.

### Fixed
- **r026.024**: Fixed tab lock-up when expanding Data Source Management on a widget with broken data sources. Root cause: `DataSourceTip.onStatusChange` fired on mount → `setBrokenDsIndices()` created new Set → re-render → re-mount → infinite loop. Fixed by using a ref for the set and only updating state when the count changes.
- **r026.024**: Wrapped `DataSourceManager.getDataSource()` in try/catch in the rebind tool — broken DS IDs can throw instead of returning null.
- **r026.023**: Removed unreliable green/red status dots from the rebind tool. DS resolution checks were inconsistent between widgets (child DS instances load lazily). Status indicators now deferred entirely to ExB's built-in `DataSourceTip` on query items.

---

## [1.19.0-r026.014] - 2026-03-19 - Markdown Table Support (Phase 2)

### Added
- **Markdown table parsing**: `convertTemplateToHtml()` in shared-code now parses pipe-delimited markdown tables into styled HTML `<table>` elements with borders, header styling, and text alignment (`:---` left, `:---:` center, `---:` right).
- **Table Builder component**: New `TableBuilder` component in shared-code — inline grid editor that generates pipe-delimited markdown. Configurable columns (2–6) and data rows (1–10).
- **Table Builder in settings**: "Insert table" toggle button added alongside "Template syntax reference" in the content template section. Inserts generated table markdown at cursor position.
- **Tables help section**: Added "Tables" section to the expandable template syntax reference showing header row, separator, data rows, and alignment syntax.

---

## [1.19.0-r026.009–010] - 2026-03-18 - Per-Result Pan To (TODO #13)

### Added
- **Per-result Pan To**: New "Pan to" button on each result card (hand icon, matching Results Menu). Centers the map on the feature without changing zoom level.
- **`panOnResultClick` config setting**: When enabled, clicking a result pans instead of zooming. Mutually exclusive with `zoomOnResultClick` — enabling one disables the other (same pattern as FeedSimple).
- **`panToRecords()` utility**: New function in `zoom-utils.ts` that reuses `calculateRecordsExtent()` and calls `goTo({ center })`. No code duplication with zoom.
- **`usePanToRecords()` hook**: Mirrors `useZoomToRecords()` pattern in `managers/use-zoom-to-records.ts`.
- **Pan button visibility**: Follows FeedSimple's inverted-visibility pattern — pan button shows on the toolbar when `panOnResultClick` is OFF (user needs the explicit button). Hidden when pan is the default click behavior.
- **Pan in collapsed menu**: When result is collapsed, pan appears as a dropdown menu item alongside zoom and remove.
- **Settings toggle**: "Pan to record when clicked" toggle in Result Click Behavior section with mutual exclusion logic.

### Changed
- **Click handler**: `toggleSelection` in `query-result.tsx` now supports three modes: `zoom`, `pan`, or `popup-only`. Pan mode calls `panToRecordsHook()` then opens popup.
- **Collapsed menu logic**: Menu now shows when either zoom OR pan buttons need to be visible (previously only checked zoom).

---

## [1.19.0-r026.002–008] - 2026-03-18 - Unified {{field}} Template Engine (Phase 1.5)

### Added
- **`{{field | filter}}` token syntax in QS**: QuerySimple now uses the same double-brace token syntax as FeedSimple, with full pipe filter support (date, math, string, link — 16 filters total).
- **CustomContent popup rendering**: CustomTemplate queries now render popups via Esri `CustomContent` (same pattern as FeedSimple) instead of delegating to the Esri Feature widget. Card click popup uses inline resolved HTML.
- **Card-level markdown rendering**: CustomTemplate result cards bypass the Esri Feature widget entirely, rendering via `substituteTokens() → convertTemplateToHtml() → dangerouslySetInnerHTML`. Matches FeatureInfo's DOM structure (expand/collapse arrow, border, padding).
- **Template migration button**: Settings panel detects old `{field}` syntax and offers one-click conversion to `{{field}}` with before/after preview.
- **Markdown syntax help panel**: Expandable reference panel in QS settings (ported from FeedSimple pattern) replacing the old tooltip-based help.
- **`substituteTokens()` in shared-code**: Extracted from FeedSimple's `token-renderer.ts` to `shared-code/src/token-renderer.ts`. Both QS and FS now import from the shared module.

### Changed
- **Settings panel**: Field insertion now emits `{{FIELD}}` instead of `{FIELD}}`. Placeholder text and help content updated throughout.
- **`query-utils.ts`**: CustomTemplate mode uses `CustomContent` with `substituteTokens()` for map popups. `rawTemplate` stored in cache for card renderer.
- **`query-result.tsx`**: Card click opens popup with resolved HTML for CustomTemplate queries instead of passing raw feature to Esri's default popup.
- **`query-result-item.tsx`**: CustomTemplate cards render via shared pipeline with CSS parity to FeatureInfo (border, padding, expand/collapse, italic labels, heading styles).
- **`simple-list.tsx`**: Popup template cache extended with `rawTemplate` and `isCustomTemplate` fields.

### Fixed
- **Card styling parity**: Matched FeatureInfo's exact DOM structure, font sizes, padding, and expand/collapse arrow for CustomTemplate cards. Body text `0.875rem`, padding `3px 4px`, p margin 0.

---

## [1.19.0-r026.001] - 2026-03-18 - Shared Markdown Engine (Major)

### Changed
- **Shared markdown engine**: Extracted `convertTemplateToHtml()` and `applyInlineFormatting()` from `query-simple/src/runtime/markdown-template-utils.ts` to `shared-code/mapsimple-common/markdown-template-utils.ts`. Local file is now a thin wrapper that re-exports the shared converter and keeps QS-specific `renderPreview()` and `extractFieldTokens()` (single-brace `{field}` token regex).
- **`#### h6` heading support**: Shared engine includes h6 heading level (`#### Tiny`) that QS previously lacked.
- **Smarter italic regex**: Shared engine uses token-agnostic italic regex that protects both `{SOME_FIELD}` and `{{some_field}}` from false italic matching — fixes a latent bug in QS where `{FIELD_NAME}` could be partially italicized.
- **Major version bump**: `r025` → `r026` reflecting the architectural change (shared dependency).

---

## [1.19.0-r025.073] - 2026-03-17 - Spatial Tab Fix, TODO Updates

### Fixed
- **Spatial tab rendering bug**: Unclosed flex `<div>` in `SpatialTabContent.tsx` caused stray `) }` text to render at the bottom of the Spatial tab. Added missing `</div>` to close the combobox + info icon flex container (line 875).

### Changed
- **TODO #12** (Public-Share README): Marked as ✅ DONE — completed during FS-r003.010 public release.
- **TODO #13** (Per-Result Pan To): Added new TODO for porting FeedSimple's per-result Pan To feature to QuerySimple, with implementation approach and shared-code design notes.

---

## [1.19.0-r025] - 2026-03-09 → 2026-03-15 - Spatial Tab Development

### Added

- **Spatial tab component** (`SpatialTabContent.tsx`): Two-mode toggle (Operations / Draw)
  with smart default based on accumulated results
- **Source indicator**: Shows "{count} feature(s) from Results" or "No features loaded"
  with blue/neutral styling based on state
- **Buffer preview**: Real-time geodesic buffer rendering on map via `useBufferPreview` hook
  with SR-aware operator selection (geodesicBufferOperator vs bufferOperator)
- **Calcite combobox for spatial relationships**: Searchable dropdown (filters by label +
  description) replaces 7-item radio list — uses `<calcite-combobox>` web component with
  `overlayPositioning='fixed'` to escape scroll containers
- **Real target layers from widget config**: Derives unique layers from `queryItems` via
  `DataSourceManager`, deduplicates by `mainDataSourceId`, resolves actual layer titles
  from JSAPI `FeatureLayer.title`
- **Operations panel layout**: Source → Buffer → Mode → Relationship → Target → Execute
- **Results mode segmented control**: New (blue) / Add (green) / Remove (red) with
  logic summary bar matching Query tab pattern
- **ResultsModeControl shared component** (`components/ResultsModeControl.tsx`): Extracted
  from duplicated code in QueryTabContent and SpatialTabContent. Data-driven color config
  map eliminates repeated ternaries. Accepts `value`, `onChange`, `removeDisabled`, `getI18nMessage`
- **Buffer preview lifecycle**: Imperative clear/restore on panel close/open via
  `selection-restoration-manager`; singleton stores last graphic per widget
- **Spatial query execution engine** (`execute-spatial-query.ts`, 222 lines): Multi-layer
  spatial query with per-layer error handling, lazy DataSource creation for group layer
  children (uses `rootDataSourceId` from full `useDataSource` config), shared
  `resolvePopupOutFields()` for consistent field resolution
- **Full spatial query → Results pipeline** in `query-task.tsx`: `handleExecuteSpatialQuery`
  orchestrates mode logic (New/Add/Remove), graphics rendering, state dispatch, zoom,
  auto-tab-switch. Returns `Promise<boolean>` for buffer reset control
- **`lastQueryOriginTabRef`** for Results tab back-button navigation: tracks `'query'` |
  `'spatial'` so "Back" returns to whichever tab initiated the query
- **Client-side buffer geometry for spatial queries**: `useBufferPreview` now returns
  `bufferedGeometry` state. When buffer is active, the computed polygon is sent as
  `query.geometry` (with `bufferDistance: 0`) instead of server-side `query.distance`/`query.units`.
  Ensures spatial relationships evaluate against the actual visible buffer shape
- **No-results popover** on Spatial tab: calcite-popover with amber styling, anchored to
  Execute button (`placement="top"`), matching Query tab pattern
- **Error popover** on Spatial tab: calcite-popover with red styling for query errors,
  same pattern as Query tab (`placement="top"`)
- **Shared `resolvePopupOutFields()`** utility in `query-utils.ts`: Extracts popup field
  names from `FeatureLayer.popupTemplate`, used by both `direct-query.ts` and
  `execute-spatial-query.ts` for consistent field resolution
- **Enhanced `getRecordKey()`** in `results-management-utils.ts`: Prefers `__originDSId`
  stamps for cross-layer deduplication in multi-layer spatial queries
- **SPATIAL debug tag** registered in `debug-logger.ts` for spatial query logging
- **Context-aware spatial relationship warnings** (r025.037–r025.040):
  - Within + point/line without buffer → "no area" warning with suggestion
  - Touches + buffer → "overlap not touch" warning
  - Touches + point → "must land exactly on boundary" warning
  - Crosses + point → "cannot cross" warning
  - Crosses + point/line with buffer → "same type can't cross" warning
  - Buffer-aware dimension checks: suppresses false Overlaps/Crosses warnings when buffer
    converts source to polygon
- **Spatial relationships reference doc** (`docs/features/SPATIAL_RELATIONSHIPS_REFERENCE.md`):
  Full reference for all 7 relationships with geometry/buffer compatibility matrices,
  warning conditions, JSAPI label mapping, and Esri predicate cross-reference
- **i18n strings**: `spatialSourceFeatures`, `spatialSourceNoFeatures`
- **FLOW-09 process flow doc**: Buffer preview end-to-end flow documentation
- **Watch List in TODO.md**: Legacy JSAPI widget deprecation tracking
  (`esri/widgets/Feature` in popup-render-pool.ts)
- **TODO #22**: Typeahead / suggest for free-form queries
- **TODO #23**: Create custom spatial relationship diagrams for help guide
- **TODO #24**: Complete spatial relationships reference documentation
- **JimuDraw integration for Spatial Draw mode** (r025.041): Lazy-loaded `jimu-ui/advanced/map`
  module, JimuDraw component mounted in Draw mode with point/polyline/polygon/rectangle/circle
  tools. Geometry captured via `onDrawingFinished` callback. Draw layer visibility toggled on
  mode switch (Operations ↔ Draw)
- **Multi-shape draw mode** (r025.044): Changed from `JimuDrawCreationMode.Single` to
  `Continuous`. Drawn geometries accumulate in `drawnGeometries[]` array. Source indicator
  shows count + types (e.g., "3 drawn shapes (polygon, point)")
- **Mixed geometry type buffer support** (r025.041): `useBufferPreview` changed from single
  `inputGeometry` to `inputGeometries: __esri.Geometry[]`. Buffers each geometry individually
  via `bufferSingle()`, unions resulting polygons. Input geometry preparation groups by type
  and unions within each group (prevents `unionOperator.executeMany` crash on mixed types)
- **FLOW-10 process flow doc**: Spatial query execution end-to-end flow
- **FLOW-11 process flow doc**: Spatial draw mode lifecycle flow
- **Spatial result default template** (r025.048): Per-layer config flag (`isSpatialResultDefault`)
  designates one query as the rendering template for spatial query results on that layer.
  Settings toggle in Results section with per-layer uniqueness enforcement, auto-default on
  first query creation, and reassignment on deletion. Spatial query engine now stamps real
  `configId` (instead of fixed `'spatial'`) so SimpleList's template resolution pipeline
  works automatically. Smart outFields via shared `combineFields()` — same 3-branch pattern
  as Query tab's `direct-query.ts` (PopupSetting / SelectAttributes / CustomTemplate).
  Config: `isSpatialResultDefault?: boolean` on `QueryItemType`. Seven files modified, zero
  downstream changes needed (simple-list.tsx, query-result.tsx, query-utils.ts unchanged)
- **Freehand draw tools** (r025.049): Added `freehandPolyline` and `freehandPolygon` to
  JimuDraw `createTools` config. Draw toolbar now offers 7 tools: point, polyline, polygon,
  rectangle, circle, freehand line, freehand polygon
- **Rectangle-selection tool** (r025.050): Enabled `rectangle-selection` in JimuDraw
  selectionTools. Users can select drawn shapes to move, resize, or edit vertices.
  Added `onDrawingUpdated` callback to rebuild `drawnGeometries` from draw layer on
  any move/edit/delete — keeps buffer preview in sync with shape changes
- **Configurable draw & buffer colors** (r025.051): Two color pickers in settings
  ("Spatial draw colors" section) for draw symbol color and buffer preview color.
  Uses `HighlightConfigManager` singleton (same pattern as highlight colors). Defaults:
  lime green (`#32FF00`) for draw, orange (`#FFA500`) for buffer
- **Spatial tab Remove mode parity** (r025.052): Brought Spatial tab Remove mode to
  full parity with Query tab. Remove button disabled when no accumulated records.
  Popup auto-close on Remove execute. Early return for empty existing records. All-records-
  removed cleanup: `clearSelectionInDataSources` clears graphics/selection, resets
  `hasSelectedRecordsRef`. Distinguishes "0 matched" from "no records to remove from".
  Auto-reset to "New" mode when accumulated records are cleared while on "Remove" —
  matches Query tab behavior (useEffect watches accumulatedRecords + resultsMode)
- **Typeahead/suggest for free-form text queries** (r025.053): Real-time value suggestions
  for free-form text inputs (PIN, address, name). Companion `useSuggest` hook attaches
  to SqlExpressionRuntime's container via capture-phase event listeners, intercepts typing,
  debounces 300ms, fires lightweight `FeatureLayer.queryFeatures()` with starts-with LIKE
  pattern. `SuggestPopover` renders absolutely positioned dropdown with prefix highlighting,
  ARIA listbox pattern, and keyboard navigation (ArrowUp/Down, Enter, Escape). Selected
  value injected into SqlExpressionRuntime via proven DOM manipulation pattern (same as
  hash parameters). Config: `enableSuggest`, `suggestMinChars` (default 2), `suggestLimit`
  (default 10) on `QueryItemType`. New files: `suggest-utils.ts`, `useSuggest.ts`,
  `SuggestPopover.tsx`. Integration: ~28 lines in `query-task-form.tsx`
- **Suggest settings UI** (r025.054): Builder settings panel for typeahead suggestions.
  Switch toggle for enable/disable, `NumericInput` for minimum characters (1–10, default 2)
  and max suggestions (1–50, default 10). Settings appear in Attribute Filter section under
  a collapsible panel. Translation strings: `enableSuggest`, `suggestMinChars`, `suggestLimit`
- **Multi-clause suggest support** (r025.054): `detectFreeFormInput()` now scans ALL SQL
  expression parts (not just single-clause). Returns the first free-form USER_INPUT clause
  as the suggest target and extracts fixed clauses as `additionalWhere` filter (e.g.,
  `PROPTYPE = 'K'`). New `partToWhereClause()` converts fixed parts to SQL fragments,
  handling Esri's `[{value, label}]` array value format
- **Operator-aware suggest LIKE patterns** (r025.054): `fetchSuggestions()` matches the
  SQL operator from the free-form part: `STRING_OPERATOR_CONTAINS` → `%VALUE%`,
  `STRING_OPERATOR_STARTS_WITH` → `VALUE%`, `STRING_OPERATOR_ENDS_WITH` → `%VALUE%`.
  Threaded through `detectFreeFormInput` → `useSuggest` → `fetchSuggestions`
- **SUGGEST debug logging** (r025.054): Registered `SUGGEST` as a debug feature in
  `debug-logger.ts`. Enable via `?debug=SUGGEST` to see detection, fetch queries, and
  inject events in the browser console
- **Suggest client-side narrowing** (r025.058): Fetch 50 results from server (configurable
  via `suggestFetchLimit`), display 10. When user types more characters, filter cached
  results locally instead of re-querying server. Only applies to starts-with/is operators
  (CONTAINS/ENDS_WITH always query server). Safety guarantee: any cache miss falls through
  to existing server query path. New `SuggestCache` interface and `filterCachedSuggestions()`
  pure function in `suggest-utils.ts`. Debug events: `cache-store`, `cache-hit`
- **Spatial-only layers** (r025.060): New `spatialOnly` flag on `QueryItemType` with builder
  toggle. When enabled, the layer participates in Spatial tab queries (intersect/buffer) but
  is hidden from the Query tab search layer dropdown. Settings panel conditionally hides
  irrelevant sections: Attribute Filter, Spatial Filter, Short ID, Group ID, Search alias,
  and Display order. Retains: data source, label, icon, toggle with description text,
  and Results config (template, fields, spatial result default). Enables adding reference
  layers (e.g., School Districts, Zoning) that enrich spatial query results without
  cluttering the query interface. Five files modified, zero runtime regressions
- **Spatial tab mode help text** (r025.061–062): Contextual description below the
  Operations/Draw toggle. Operations: "Select features using spatial geometry operations,
  e.g., intersects, overlaps." Draw: "Select features using graphics drawn on the map."
  Styled with surface background, text-secondary color, primary-main left border accent,
  0.8rem font. Short tooltips on toggle buttons — "Spatial operations" / "Draw graphics"
- **Spatial popover centered anchor** (r025.063): Replaced `spatial-execute-btn` reference
  with a zero-height full-width `spatial-feedback-anchor` div for centered popover alignment,
  matching Query tab's existing `query-feedback-anchor` pattern
- **Result card expanded min-height** (r025.063): Added `min-height: 4.5rem` to
  `feature-info-component` when expanded, so short-content items (e.g., School Districts)
  don't expose the bottom border below the stacked action buttons. Only applies when
  expanded — collapsed items retain natural height
- **Disabled hint callout styling** (r025.064): Spatial tab hint text ("Run a query first…")
  restyled from subtle italic gray to a firebrick red (#b22222) callout box with left border
  accent, surface background, and 0.8rem font — consistent with mode help text pattern but
  visually prominent to explain why controls are disabled
- **Group layer popup inheritance** (r025.065–066): New `resolvePopupInfoWithInheritance()`
  utility walks the `parentDataSource` chain so child layers inside Group Layers pick up
  popup templates configured at the GL level. Fixes result cards falling back to a generic
  all-fields template when the web map stores popupInfo on the group, not the child.
  `getPopupTemplate()` now returns `layerObject.popupTemplate` (configured popup) first,
  with `defaultPopupTemplate` as absolute last resort. Table/export field resolution
  combines template fields AND visible fieldInfos (previously either/or, which missed
  fields when a title template existed). Four call sites in `query-utils.ts` updated,
  plus `query-result.tsx` action dataSets field resolution. Field fetching (outFields)
  intentionally uses direct `getPopupInfo()` — inheritance only applies to popup rendering
  and table/export field display
- **Buffer preview auto-enable GroupLayer** (r025.067): When a buffer graphic is drawn
  and the parent GroupLayer is hidden (e.g., user toggled it off in LayerList), the
  GroupLayer is automatically re-enabled so the buffer is visible. Matches the existing
  `addHighlightGraphics` auto-enable pattern in `graphics-layer-utils.ts`
- **Configurable zoom expansion factor** (r025.068): New `zoomExpansionFactor` widget-level
  setting controls how much extra space surrounds features when zooming. 1.0 = tight fit,
  1.2 = 20% padding (default), no upper limit. Follows the same singleton injection pattern
  as `pointZoomBufferFeet` — config → HighlightConfigManager → useZoomToRecords hook →
  zoomToRecords(). Six files: config.ts, setting.tsx, translations, highlight-config-manager,
  use-zoom-to-records, version
- **Spatial relationship info popover** (r025.069): ⓘ icon next to the spatial relationship
  combobox shows a hover popover with the Esri SVG diagram and plain-language caption for the
  currently selected relationship. Covers 5 of 7 relationships (Contains/Within, Intersects,
  Overlaps, Within/Encloses, Touches) using official Esri SVGs from the ArcGIS Spatial
  Relationship documentation. Envelope Intersects and Crosses use text-only descriptions
  pending custom diagrams. Popover appears on mouseEnter/mouseLeave (no click toggle),
  styled to match Query tab info tooltips (10px 12px padding, drop shadow, fixed overlay
  positioning). SVG assets stored in `query-simple/src/runtime/assets/spatial/`
- **Spatial relationships reference doc updated** (r025.069): Accuracy fixes across all 7
  relationship tables — softened warnings, corrected geometry pair compatibility. Added Esri
  SVG image references for 5 relationships. TODO placeholders for Envelope Intersects and
  Crosses custom diagrams
- **Button consistency across tabs** (r025.056): Renamed Spatial tab "Run Spatial Query"
  to "Apply" matching Query tab. Added "Reset" button to Spatial tab. Changed Query tab
  Reset to always-visible/disabled-when-clean pattern matching Spatial tab
- **`jimu-arcgis` manifest dependency**: Added `"dependency": "jimu-arcgis"` to
  `query-simple/manifest.json` per Esri best practice — ensures ArcGIS Maps SDK loads
  before widget initialization

#### r025.070

- **Scroll-to-top chevron button** (r025.070): Added a chevron button in the results list
  that scrolls back to the top of the results panel

#### r025.071

- **Scroll-to-top button flex layout fix** (r025.071): Fixed scroll-to-top button being
  squished in flex layout — added `flex-shrink` and `min-height` constraints

### Fixed

- **Buffer preview ghost on widget close/reopen** (r025.057): After a successful spatial
  query, closing and reopening the widget would show the old buffer preview graphic until
  switching tabs. Root cause: `useBufferPreview` stored the graphic in `GraphicsStateManager`
  for panel close/reopen restoration but never cleared it when the buffer was legitimately
  removed (distance reset to 0 after query success). `selection-restoration-manager` then
  restored the stale graphic on widget reopen. Fixed by calling
  `graphicsStateManager.deleteLastBufferGraphic()` when buffer is cleared and on unmount
- **Multi-point draw only uses first point** (r025.051): Drawing multiple points without
  buffer only used the first point for the spatial query. Root cause: Draw mode bypassed
  the group-by-type union step, so `inputGeometry` memo picked only the first geometry.
  Fixed by sharing the same union path for both Draw and Operations modes — multiple
  points are now unioned into a multipoint geometry

- **Widget stuck in loading state on spatial error**: `SET_STAGE: 2` dispatched but never
  reset when all target layers failed. Now dispatches `SET_STAGE: 1` before throwing
- **Buffer cleared on spatial query failure**: Error path changed from `throw` to `return`,
  allowing `setBufferDistance('')` to execute. Fixed by keeping `throw` + empty `catch`
- **Buffer cleared on zero results**: `handleExecuteSpatialQuery` now returns `boolean`;
  buffer only resets when `hasResults === true`
- **Parks DataSource not found**: Group layer children need `rootDataSourceId` for lazy
  creation. Fixed by passing full `useDataSource` config objects via `targetUseDataSources`
  map to `executeSpatialQuery`
- **ResultsMode value mismatch**: Spatial tab sends `'add'`/`'remove'`/`'new'` but handler
  compared against `SelectionType` enum values (`'ADD_TO_CURRENT_SELECTION'` etc). Fixed
  with dual-format boolean checks (`isNewMode`, `isAddMode`, `isRemoveMode`)
- **"Within" returning 0 results**: JSAPI `within` means query geometry inside target — the
  inverse of user expectation. Remapped: user-facing "Within" label now sends JSAPI `contains`
- **Null crash on layer deselect**: `AdvancedSelect` passes `null` when all items cleared;
  added defensive `|| []` in onChange + `?.length ?? 0` on canExecute check
- **Parks/Trails config**: Updated data sources for new group layer IDs in app 1 and app 2
  (both `config.json` and `resources/config/config.json`)
- **Mixed geometry buffer silently fails** (r025.041): `unionOperator.executeMany()` requires
  same-type geometries; mixed types (e.g., points + polygons) crashed silently with no `.catch()`.
  Fixed by grouping geometries by type, unioning within each group
- **JimuMapView not reaching SpatialTabContent** (r025.042): Non-popper render path in
  `widget.tsx` was missing `jimuMapView` prop on second `<QueryTaskList>` instance. Draw mode
  showed infinite loading spinner
- **Debounce type signature mismatch** (r025.042): `debouncedComputeBuffer` wrapper had stale
  single-geometry type `(geometry: Geometry, ...)` instead of `(geometries: Geometry[], ...)`
- **Drawn features not cleared on success** (r025.043): After successful spatial query in Draw
  mode, drawn shapes now clear from map (same pattern as buffer distance reset). Preserved on
  zero results so user can adjust and retry
- **Code cleanup** (r025.045): Removed dead `drawPlaceholderStyle`. Fixed `hasResults` variable
  shadowing in Execute onClick. Proper `JimuMapView | null` typing (was `any`). Fixed React
  import rule violation in `map-view-manager.ts`. Removed stale r018.96 comments. Updated
  header comments

### Changed

- **Spatial relationship labels**: User-friendly remapping — "Within" → JSAPI `contains`,
  "Encloses search area" → JSAPI `within`. Cleaned up passive voice labels ("Intersected by"
  → "Intersects", "Overlapped by" → "Overlaps", etc.)
- **`useBufferPreview` return value**: Changed from `void` to `__esri.Geometry | null`,
  exposing `bufferedGeometry` state for spatial query use
- **Spatial relationship UI**: Radio list (47 lines, 7 items) → Calcite combobox (~17 lines)
  with `selectionMode='single'`, `scale='m'`, and native description support
- **Target layers**: Hardcoded mock data → dynamic from widget-configured query items;
  uses `dataSourceId` (not `mainDataSourceId`) for `targetLayerOptions`
- **Auto-tab-switch**: Condition updated to include `activeTab === 'spatial'`
- **Import cleanup**: Removed `Label` from jimu-ui imports (only used in old radio list)
- **Removed 4 unused styles**: `relationshipListStyle`, `relationshipItemStyle`,
  `relationshipActiveStyle`, `relationshipDisabledStyle`
- **Results Mode refactor**: Both tabs now use shared `ResultsModeControl` component.
  QueryTabContent's Add/Remove merge logic consolidated from ~360 duplicated inline lines
  into single `handleResultsModeChange` callback (~100 lines). Removed `Button` import
  from QueryTabContent (no longer needed). ⚠️ Lightly tested — needs full regression testing
- **Button consistency across tabs** (r025.056): Renamed execute button from "Search" to
  "Apply" on both tabs (i18n key `apply`). Added Reset button to Spatial tab (clears buffer,
  drawn geometries, relationship, and target layers). Both tabs now show Reset always visible
  but disabled when nothing is dirty — Query tab uses `attributeFilterSqlExprObj === sqlExprObj`
  pristine check, Spatial tab checks buffer/drawn/relationship/layers state

#### r025.072

- **iOS auto-zoom fix** (r025.072): Prevent iOS Safari from zooming when tapping
  inputs/selects with computed font-size < 16px. Added `@media (max-width: 1024px)`
  media query with `font-size: 16px !important` to all form inputs in SpatialTabContent
  (buffer distance, buffer unit, spatial relationship combobox, target layers),
  buffer-input.tsx (draw mode distance/unit), and query-task-spatial-form.tsx (filter type).
  1024px breakpoint covers both phones and iPadOS tablets
- **Mobile popup behavior** (r025.072): 4 config fields for controlling JSAPI popup
  behavior on mobile viewports (≤ 600px via `mapView.width`):
  - `mobilePopupCollapsed` — opens popup showing only title bar, user taps to expand
  - `mobilePopupDockPosition` — pin popup to top-center or bottom-center
  - `mobilePopupHideDockButton` — remove dock/undock toggle
  - `mobilePopupHideActionBar` — hide zoom-to and other action buttons
  Uses `popup.watch('visible')` to apply collapsed state reactively (QS never calls
  `popup.open()` directly — ExB's Map widget opens popups via data source selection).
  Separate from HelperSimple's MutationObserver popup detection (which handles selection
  restoration on popup close). Settings UI in "Mobile Popup Behavior" section with
  progressive disclosure for hide dock button

### Removed

- `draw-advanced/` widget source (sample widget, not ours)
- `client/dist-download/` and `client/dist-report/` from git tracking (build artifacts)

---

## [1.19.0-r024.132] - 2026-03-05 - Sentence case labels, Display Order guard

### Changed

- **Sentence case labels**: "Search Layer" → "Search layer", "Search Alias" → "Search alias",
  "Display Order" → "Display order" — applied to both runtime widget and settings panel
- **Display Order hidden when no Group ID**: The Display Order setting section is no longer
  visible when Group ID is empty, preventing users from entering a value that breaks the widget
- **Auto-clear Display Order on Group ID removal**: If a user clears Group ID after setting
  a Display Order value, the order property is automatically nulled out

### Fixed

- Hardcoded "Search Alias" label in runtime query-task.tsx now uses sentence case
- Hardcoded "Search Alias" labels in settings query-item-main-mode.tsx now use sentence case

---

## [1.19.0-r024.131] - 2026-03-05 - Extract removeRecord (Priority 5 complete)

### Added

- Created `record-removal-handler.ts` (567 lines) with `RemoveRecordContext` interface
  (14 fields) and `executeRemoveRecord` function — X-button removal flow, composite-key
  matching, origin DS deselection, graphics sync, outputDS selection update,
  accumulatedRecords sync

### Changed

- `query-result.tsx` reduced from ~1,741 → ~1,253 lines (−28%)
- `removeRecord` is now a 10-line thin wrapper that builds context and delegates
- Removed 3 import lines (results-management-utils partial, graphics-layer-utils partial,
  hash-utils) — now imported in record-removal-handler.ts

---

## [1.19.0-r024.130] - 2026-03-04 - Extract handleFormSubmit (Priority 4 complete)

### Added

- Created `query-submit-handler.ts` (348 lines) with `SubmitContext` interface
  (20 fields) and `executeFormSubmit` function — DS destroy/recreate memory workflow,
  hash value conversion wait pattern, retry-after-clear guard

### Changed

- `query-task.tsx` reduced from ~1,836 → ~1,620 lines (−12%)
- `handleFormSubmit` is now a 12-line thin wrapper that builds context and delegates
- `handleFormSubmitInternal` passed as callback in `SubmitContext` (not imported directly)

---

## [1.19.0-r024.129] - 2026-03-04 - Extract clearResult (Priority 3 complete)

### Added

- Created `query-clear-handler.ts` (328 lines) with `ClearResultContext` interface
  (16 fields) and `executeClearResult` function — Sovereign Reset, graphics cleanup,
  DS destruction, rAF yield pattern

### Changed

- `query-task.tsx` reduced from ~2,060 → ~1,836 lines (−11%)
- `clearResult` is now a 12-line thin wrapper that builds context and delegates

---

## [1.19.0-r024.128] - 2026-03-04 - Extract handleFormSubmitInternal (Priority 2 complete)

### Added

- Created `query-execution-handler.ts` (1,044 lines) with `QueryExecutionContext` interface
  (26 fields) and `executeQueryInternal` function — the full query execution pipeline
- Moved `USE_DIRECT_QUERY` constant and `QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT` to new file

### Changed

- `query-task.tsx` reduced from ~2,950 → ~2,060 lines (−30%)
- `handleFormSubmitInternal` is now a 12-line thin wrapper that builds context and delegates
- Removed 5 import lines from query-task.tsx (executeDirectQuery, generateQueryParams,
  executeQuery, executeCountQuery, mergeResultsIntoAccumulated, removeResultsFromAccumulated,
  removeRecordsFromOriginSelections, removeHighlightGraphics)

---

## [1.19.0-r024.127] - 2026-03-04 - Consolidate useState → useReducer (Priority 1 complete)

### Added

**useReducer consolidation — query-task-reducer.ts (r024.124–r024.127):**
- Created `query-task-reducer.ts` (197 lines) with `QueryTaskState` interface (12 fields),
  4 alert type interfaces, 14 action types, and reducer function
- Includes atomic composite actions: `RESET_FOR_CLEAR` (resets 10 fields in one dispatch),
  `QUERY_COMPLETE` (sets stage + resultCount + queryJustExecuted atomically)

### Changed

**Step A2a — Migrate error/alert state (r024.125):**
- Migrated 6 useState variables to useReducer dispatch: `selectionError`, `zoomError`,
  `queryErrorAlert`, `noResultsAlert`, `allDuplicatesAlert`, `noRemovalAlert`

**Step A2b — Migrate execution state (r024.126):**
- Migrated 3 useState variables to useReducer dispatch: `stage`, `resultCount`,
  `queryJustExecuted`
- 9 `setStage`, 4 `setResultCount`, 2 `setQueryJustExecuted` calls replaced

**Step A2c — Migrate clearing/DS state (r024.127):**
- Migrated 3 useState variables to useReducer dispatch: `isClearing`, `dsRecreationKey`,
  `outputDS`
- 2 `setIsClearing`, 2 `setOutputDS`, 2 `setDsRecreationKey` calls replaced

**Combined impact:** 12 closure variables → 2 (`state` + `dispatch`). All 12 useState
declarations consolidated into single `useReducer`. Completes Priority 1 of the
useReducer extraction plan (SINGLETON_EXTRACTION_RESEARCH.md).

**Files modified/created:**
- `query-simple/src/runtime/query-task-reducer.ts` — NEW (197 lines)
- `query-simple/src/runtime/query-task.tsx` — 12 useState removed, dispatch calls added
- `query-simple/src/version.ts` — Increment to r024.127

---

## [1.19.0-r024.123] - 2026-03-04 - Type QueryTabContent props

### Changed

**Type safety — QueryTabContent props (r024.123):**
- Replaced 7 `any`-typed props in `QueryTabContentProps` interface with proper types:
  `DataSource | null`, `FeatureDataRecord[]`, `SqlQueryParams`, full `handleFormSubmit`
  signature (`IMSqlExpression`, `SpatialFilterObj`, `runtimeZoomToSelected?`),
  `(enabled: boolean) => void`, `(ds: DataSource) => void`, `Record<string, unknown>`
- Total `any` count reduced from 168 → 161 (avoidable: 36 → 29)

**Files modified:**
- `query-simple/src/runtime/tabs/QueryTabContent.tsx` — Add type imports, replace 7 `any` types
- `query-simple/src/version.ts` — Increment to r024.123

---

## [1.19.0-r024.121] - 2026-03-03 - Phase 7: Extract graphics-cleanup-utils.ts with GraphicsStateManager

### Added

**Simplification Phase 7 — Extract cleanup functions with singleton state manager (r024.120–r024.121):**
- Created `GraphicsStateManager` singleton (`graphics-state-manager.ts`, 149 lines) following the
  established `HighlightConfigManager` pattern — centralizes 6 module-level Maps/variables that
  were shared between create/add and cleanup functions
- Created `graphics-cleanup-utils.ts` (429 lines) with 7 extracted cleanup functions:
  `clearGraphicsLayer`, `clearGraphicsLayerOrGroupLayer`, `cleanupGraphicsLayer`,
  `clearGroupLayerContents`, `cleanupGroupLayer`, `clearAnyResultLayerContents`,
  `cleanupAnyResultLayer`
- Re-exports in `graphics-layer-utils.ts` maintain backward compatibility — zero consumer
  import changes required

### Removed
- Deleted dead `destroyAndRecreateGroupLayer()` (~36 lines) — exported but never imported
- Removed 6 module-level mutable state variables from `graphics-layer-utils.ts` (replaced by
  singleton accessor methods)

### Changed
- `graphics-layer-utils.ts` reduced from ~1,458 → 1,032 lines (-426 lines)
- All shared state access now goes through `graphicsStateManager.*()` accessor methods
- Exported `getLegendLayerId()` and `getGraphicsSublayer()` as public helpers for cross-file use

**Files modified/created:**
- `query-simple/src/runtime/graphics-state-manager.ts` — NEW (149 lines)
- `query-simple/src/runtime/graphics-cleanup-utils.ts` — NEW (429 lines)
- `query-simple/src/runtime/graphics-layer-utils.ts` — State migrated, 7 functions extracted, 1 dead function deleted, re-exports added
- `query-simple/src/version.ts` — Increment to r024.121

---

## [1.19.0-r024.119] - 2026-03-03 - Phase 6: Delete dead getMapViewFromDataSource

### Removed

**Simplification Phase 6 — Delete dead `getMapViewFromDataSource()` (r024.119):**
- Deleted `getMapViewFromDataSource()` (283 lines) from `graphics-layer-utils.ts` — exported
  but never imported or called anywhere in the codebase
- Removed unused imports: `DataSourceManager` (from jimu-core), `FeatureLayerDataSource` (type)
- `graphics-layer-utils.ts` reduced from 1,741 → 1,458 lines

**Files modified:**
- `query-simple/src/runtime/graphics-layer-utils.ts` — Removed dead function + unused imports
- `query-simple/src/version.ts` — Increment to r024.119

---

## [1.19.0-r024.118] - 2026-03-03 - Phase 5: Extract hash-utils.ts

### Changed

**Simplification Phase 5 — Extract `hash-utils.ts` (r024.118):**
- Created `query-simple/src/runtime/hash-utils.ts` consolidating all hash URL manipulation
  into 4 functions: `removeHashParam`, `removeRecordIdFromHashParams`,
  `removeRecordIdFromDataS`, `clearDataSFromHash`
- Extracted 157 lines of surgical hash modification from `removeRecord()` in
  `query-result.tsx` → reduced to 2 function calls
- Eliminated duplicate `removeHashParameter` implementations in `widget.tsx` and
  `url-consumption-manager.ts` — both now call `removeHashParam()`
- Replaced `clearDataSParameterFromHash()` body in `selection-utils.ts` with delegation
  to `clearDataSFromHash()`

**Files modified:**
- `query-simple/src/runtime/hash-utils.ts` — NEW (~200 lines)
- `query-simple/src/runtime/query-result.tsx` — removeRecord() shrunk by ~130 lines
- `query-simple/src/runtime/widget.tsx` — removeHashParameter() shrunk
- `query-simple/src/runtime/managers/url-consumption-manager.ts` — removeHashParameter() shrunk
- `query-simple/src/runtime/selection-utils.ts` — clearDataSParameterFromHash() delegated
- `query-simple/src/version.ts` — Increment to r024.118

---

## [1.19.0-r024.117] - 2026-03-03 - Phase 3: Rename hooks/ → managers/

### Changed

**Simplification Phase 3 — Rename `hooks/` directory to `managers/` (r024.117):**
- Renamed `query-simple/src/runtime/hooks/` → `query-simple/src/runtime/managers/`
- 7 of 8 files were utility classes (not React hooks) — filenames now reflect their nature
- File renames: `use-graphics-layer.ts` → `graphics-layer-manager.ts`,
  `use-url-consumption.ts` → `url-consumption-manager.ts`,
  `use-selection-restoration.ts` → `selection-restoration-manager.ts`,
  `use-widget-visibility.ts` → `widget-visibility-manager.ts`,
  `use-accumulated-records.ts` → `accumulated-records-manager.ts`,
  `use-event-handling.ts` → `event-manager.ts`,
  `use-map-view.ts` → `map-view-manager.ts`
- `use-zoom-to-records.ts` kept its `use-` prefix (actual React hook)
- Updated 12 import paths across 8 consumer files (widget.tsx, query-result.tsx,
  query-task.tsx, query-task-list.tsx, selection-utils.ts, and test files)
- Cleaned up verbose chunk comments in widget.tsx imports

---

## [1.19.0-r024.116] - 2026-03-03 - Default Hover Pin Color → Google Red

### Changed

- Changed default hover preview pin color from yellow/amber (`#FFC107`) to Google Maps
  red (`#EA4335`) for better visibility and contrast on the map
- Updated default in config type definition, settings panel color picker fallback,
  CIM symbol base color, and JSDoc examples
- Existing widget instances with a custom pin color configured are unaffected — only
  changes the default for new or unconfigured widgets

**Files modified:**
- `query-simple/src/config.ts` — Default comment updated
- `query-simple/src/setting/setting.tsx` — Color picker fallback
- `query-simple/src/runtime/query-result-item.tsx` — CIM symbol base color + JSDoc
- `query-simple/src/version.ts` — Increment to r024.116

---

## [1.19.0-r024.115] - 2026-03-03 - Phase 2: Prune Excessive Logging

### Changed

**Simplification Phase 2 — Prune excessive debugLogger.log() calls (r024.115):**
- Removed ~61 routine/verbose log calls across 8 files, keeping all error paths,
  state transitions, decision points, and user action logs
- Categories removed: per-keystroke form input tracking, per-record iteration logs,
  routine entry/exit pairs, verbose field-level dumps, intermediate progress checkpoints
- Categories kept: guard conditions (early returns), state transitions (mode changes,
  layer creation), decision points (fallback paths, hash detection), error paths
- Merged redundant log pairs (BEFORE/AFTER → single post-operation log) in widget.tsx,
  view-in-table-action.tsx, results-management-utils.ts, graphics-layer-utils.ts
- Consolidated actionDataSets chain in query-result.tsx from 7 intermediate logs to
  1 summary log with per-dataSet origin and field counts

**Files modified:**
- `query-simple/src/runtime/hooks/use-url-consumption.ts` — 7 removals (15→8)
- `query-simple/src/runtime/widget.tsx` — 7 removals + 1 merge (48→39)
- `query-simple/src/data-actions/view-in-table-action.tsx` — 4 removals + 2 merges (23→17)
- `query-simple/src/runtime/query-result.tsx` — 6 removals + consolidation (64→58)
- `query-simple/src/runtime/query-task-form.tsx` — 8 removals (63→55)
- `query-simple/src/runtime/results-management-utils.ts` — 14 removals + 3 merges (41→23)
- `query-simple/src/runtime/query-task-list.tsx` — 3 removals + 2 merges (31→27)
- `query-simple/src/runtime/graphics-layer-utils.ts` — 3 removals (58→55)
- `query-simple/src/version.ts` — Increment to r024.115

---

## [1.19.0-r024.114] - 2026-03-03 - Duplicate Tab Reuse for View in Table

### Changed

**View in Table: Skip recreation when data unchanged (r024.114):**
- When clicking "View in Table" on the same results, existing tabs are now reused instead
  of being destroyed and recreated — eliminates the memory leak from unnecessary data
  source and FeatureLayer allocation
- New `canReuseTab()` compares incoming record ObjectIDs and display fields against
  existing tab data; if both match, the tab is simply activated
- If data has changed (different records or different field config), falls back to the
  existing delete+recreate behavior
- Integrates with the r024.113 tab-switch approach: reusable tabs count as "existing tabs"
  for scenario determination

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Duplicate reuse logic
- `query-simple/src/version.ts` - Increment to r024.114

---

## [1.19.0-r024.113] - 2026-03-03 - Tab-Switch Approach for View in Table

### Changed

**View in Table: Tab-switch approach replaces two-phase render hack (r024.113):**
- Replaced the priming-tab workaround with a tab-switch approach that avoids creating
  temporary tabs (and their associated memory leaks) in most scenarios
- Three scenarios based on Table widget state:
  - **Scenario 1** (existing tabs): Add new tabs in bulk, pivot to existing tab and back —
    no priming tab, no leak
  - **Scenario 2** (no existing tabs, single new tab): Use priming hack — unavoidable,
    one minimal leak
  - **Scenario 3** (no existing tabs, multiple new tabs): Add all tabs in bulk, pivot to
    first new tab and back — no priming tab, no leak
- Tab switching uses `settingChangeTab` dispatch to trigger the Table widget's
  `onTabClick` → `destroyTable()` → fresh FeatureTable initialization
- Scenarios 1 and 3 share the same code path, differing only in pivot tab selection

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - 3-scenario refactor
- `query-simple/src/version.ts` - Increment to r024.113

---

## [1.19.0-r024.111] - 2026-03-02 - Fix Multi-Source Extent Cache SR Mismatch

### Fixed

**BUG-EXTENT-CACHE-001: Zoom/pan broken when accumulating results from different data sources (r024.111):**
- Direct query bypass now sets `query.outSpatialReference = mapView.spatialReference` so the server projects all geometries to the map's SR before returning
- Previously, each layer returned geometries in its native SR (e.g., Parcels in Web Mercator 102100, Parks in WA State Plane feet)
- `calculateRecordsExtent()` unions extents using raw min/max math, producing nonsensical extents when SRs differ (~14.9M meter width instead of ~400m)
- Root cause confirmed via live debug logs: `?debug=ZOOM,RESULTS-MODE,WIDGET-STATE,DIRECT-QUERY`

**Files modified:**
- `query-simple/src/runtime/direct-query.ts` - Add `outSpatialReference` to options, set on query
- `query-simple/src/runtime/query-task.tsx` - Pass `mapView.spatialReference` when calling `executeDirectQuery()`
- `query-simple/src/version.ts` - Increment to r024.111

---

## [1.19.0-r024.110] - 2026-03-01 - Custom Template Image Support

### Added

**Image syntax support in Custom Template mode (r024.110):**
- Added `![alt](url)` Markdown image syntax to the template parser
- Images render with responsive styling (max-width: 100%, height: auto)
- Supports field tokens: `![Photo]({PHOTO_URL})` renders images from attribute fields
- Processed before links to avoid syntax conflicts (`![]()` vs `[]()`)

**Files modified:**
- `query-simple/src/runtime/markdown-template-utils.ts` - Add image regex and HTML conversion
- `query-simple/src/version.ts` - Increment to r024.110

---

## [1.19.0-r024.109] - 2026-02-22 - Smart ShortId Helper Note

### Added

**Context-aware Helper-Simple requirement note (r024.109):**
- Added note below shortId description informing users that URL parameter monitoring requires a Helper-Simple widget
- Note only appears when no Helper-Simple widget is configured to manage THIS specific QuerySimple widget
- Scans app config for Helper-Simple widgets and checks their `managedWidgetId` against current widget
- If properly configured → note hidden; if not configured → note shown

**Files modified:**
- `query-simple/src/setting/translations/default.ts` - Add shortIdHelperNote translation
- `query-simple/src/setting/query-item-main-mode.tsx` - Add isManagedByHelper check, conditionally display note
- `query-simple/src/version.ts` - Increment to r024.109

---

## [1.19.0-r024.108] - 2026-02-22 - Trim Whitespace in Exports

### Fixed

**Trim trailing/leading whitespace from string values (r024.108):**
- Added `trimValue()` helper that trims whitespace from string fields only
- Dates, numbers, and other types pass through unchanged
- Applied to all three export formats (CSV, GeoJSON, JSON)

**Files modified:**
- `query-simple/src/utils/export-utils.ts` - Add trimValue() and apply in converters
- `query-simple/src/version.ts` - Increment to r024.108

---

## [1.19.0-r024.107] - 2026-02-22 - Export Code Refactor

### Changed

**Refactored export functionality into shared utilities (r024.107):**
- Created `query-simple/src/utils/export-utils.ts` with all export logic
- Shared utilities: `fetchFullRecords()`, `getOrderedFieldsWithAliases()`, `handleExportFormat()`
- Format converters: `convertToCSV()`, `convertToGeoJSON()`, `convertToJSON()`
- `EXPORT_FORMATS` config object makes adding new formats trivial
- `results-menu.tsx` reduced from 940 to 230 lines

**Benefits:**
- Adding new export format = ~20 lines (just the converter)
- Single place to fix fetch/field logic bugs
- Cleaner separation of concerns

**Files modified:**
- `query-simple/src/utils/export-utils.ts` - NEW - All export utilities
- `query-simple/src/runtime/results-menu.tsx` - Slimmed down to use shared utilities
- `query-simple/src/version.ts` - Increment to r024.107

---

## [1.19.0-r024.106] - 2026-02-22 - Add JSON Export

### Added

**JSON export format (r024.106):**
- Added JSON to Export submenu (attributes only, no geometry)
- Uses field aliases and priority ordering (same as CSV/GeoJSON)
- Single source: downloads `Query-{name}.json`
- Multiple sources: downloads `Query-Results-JSON.zip`

**Files modified:**
- `query-simple/src/runtime/results-menu.tsx` - Add JSON converter and handler
- `query-simple/src/version.ts` - Increment to r024.106

---

## [1.19.0-r024.105] - 2026-02-22 - Export Submenu with GeoJSON

### Added

**Export submenu with GeoJSON support (r024.105):**
- Results menu now has "Export" submenu with flyout (using Esri's `isSubMenuItem` pattern)
- Added GeoJSON export format alongside existing CSV
- GeoJSON converter handles Point, Polyline, Polygon, MultiPoint geometries
- Fetches full attributes before export (same pattern as CSV)
- Uses field aliases for property names (matches CSV behavior)
- Priority field ordering (visible fields first)
- Single source: downloads `Query-{name}.geojson`
- Multiple sources: downloads `Query-Results-GeoJSON.zip`
- CSV multi-source now downloads `Query-Results-CSV.zip` (prevents overwrite)

**Files modified:**
- `query-simple/src/runtime/results-menu.tsx` - Export submenu, GeoJSON converter and handler
- `query-simple/src/version.ts` - Increment to r024.105

---

## [1.19.0-r024.100] - 2026-03-01 - Align with Esri Patterns

### Changed

**Simplified View in Table to match Esri's implementation (r024.100):**
- Removed `tabDataSources` tracking map
- Removed `openTabsByDataSource` tracking map
- Removed all `destroyDataSource()` calls
- Removed garbage collection code
- Tab removal now uses simple `delete` like Esri's `onCloseTab` function
- Tab replacement matches Esri's `viewInSameSheet` pattern

**Rationale:** After analyzing Esri's `view-in-table.ts` and Table widget's `widget.tsx`, found that Esri does NOT call `destroyDataSource` anywhere. They simply `delete` tab entries from `viewInTableObj` and let the ExB framework handle cleanup. Our explicit destruction may have been circumventing ExB's internal cleanup mechanisms.

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Simplified to match Esri patterns
- `query-simple/src/version.ts` - Increment to r024.100

---

## [1.19.0-r024.99] - 2026-02-22 - Garbage Collection for Manually Closed Tabs

### Fixed

**Clean up orphaned data sources when user manually closes table tabs (r024.99):**
- r024.98 only cleaned up data sources when duplicate tabs were *replaced* via View in Table
- But when user closes a tab via the X button, Table widget removes it from state and our `tabDataSources` map retained the orphaned reference - causing memory leak to persist
- Fix: Added garbage collection pass at start of `handleViewInTable` that:
  1. Compares `tabDataSources` entries against current Table widget state
  2. Destroys any data sources whose tabs no longer exist
  3. Cleans up tracking maps (`tabDataSources`, `openTabsByDataSource`)
- New debug logs: `viewInTable-garbageCollect`, `viewInTable-garbageCollectSummary`
- Memory should now be reclaimed when View in Table is clicked after tabs were closed manually

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Add garbage collection pass
- `query-simple/src/version.ts` - Increment to r024.99

---

## [1.19.0-r024.98] - 2026-02-22 - Memory Cleanup for View in Table

### Fixed

**Prevent memory leak from accumulating data sources (r024.98):**
- Added `tabDataSources` Map to track created data sources by tab ID
- When duplicate tabs are removed by name, their data sources are destroyed via `DataSourceManager.destroyDataSource()`
- When tabs are removed by dataSourceId (belt-and-suspenders), their data sources are also destroyed
- For the "delete and recreate" trick, the data source is preserved but tracking is transferred to the new tab ID
- Added `createdDataSourceId` to log output for traceability
- New debug logs: `viewInTable-destroyingDataSource`, `viewInTable-transferDataSourceTracking`

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Add data source tracking and cleanup
- `query-simple/src/version.ts` - Increment to r024.98

---

## [1.19.0-r024.97] - 2026-02-22 - Scale Wait Time with Tab Count

### Fixed

**Priming wait time now scales with number of existing tabs (r024.97):**
- Fixed 4+ table rendering issue where the active tab was blank
- Root cause: Fixed 100ms wait wasn't enough when Table widget had 3+ tabs already loaded
- Fix: Wait time is now `100ms + (50ms × existing tab count)`
  - 1 table: 100ms (no existing tabs)
  - 2 tables: 150ms (1 existing tab)
  - 3 tables: 200ms (2 existing tabs)
  - 4 tables: 250ms (3 existing tabs)
- Logs now show `primingWaitMs` to track the calculated wait time

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Dynamic wait time calculation
- `query-simple/src/version.ts` - Increment to r024.97

---

## [1.19.0-r024.96] - 2026-02-22 - Fix 3+ Table Rendering

### Fixed

**Fixed blank table when opening 3+ tables via View in Table (r024.96):**
- When opening 3+ tables, the active tab would render blank until user switched away and back
- Root cause: Adding multiple tabs simultaneously (e.g., Tab 1 + Tab 2) didn't give the Table widget enough time to initialize before running the "delete and recreate" trick on the last tab
- Fix: Now adds tabs one at a time with 50ms pause between each, ensuring each is fully initialized before adding the next

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Sequential tab addition with pauses
- `query-simple/src/version.ts` - Increment to r024.96

---

## [1.19.0-r024.95] - 2026-02-22 - Fix Duplicate Tabs Root Cause

### Fixed

**Fixed duplicate tabs by using cleaned state as foundation (r024.95):**
- Root cause: In single-tab case, Phase B was re-reading Table state AFTER duplicate removal happened on a local copy, bypassing the cleanup
- Fix: Phase B now uses `baseTableObj` (which has duplicates already removed) instead of re-reading from Table widget state
- The duplicate removal from `workingTableObj` is now actually applied to the Table
- Added debug log `viewInTable-baseTableObj` to verify duplicates are removed before two-phase hack begins

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Use baseTableObj as foundation for two-phase hack
- `query-simple/src/version.ts` - Increment to r024.95

---

## [1.19.0-r024.94] - 2026-02-22 - Clean Up Stale Map Entries

### Fixed

**Clean up stale openTabsByDataSource entries when removing tabs by name (r024.94):**
- When removing a tab by name, also remove its entry from the `openTabsByDataSource` map
- Prevents stale map entries from causing duplicate tabs or incorrect tracking
- Fixes issue where removed tabs left orphaned entries in the tracking map

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Clean up map entries on tab removal
- `query-simple/src/version.ts` - Increment to r024.94

---

## [1.19.0-r024.93] - 2026-02-22 - Fix Duplicate Tabs by Name

### Fixed

**Duplicate tab prevention now checks by tab name, not just dataSourceId (r024.93):**
- When opening View in Table, existing tabs with the same name (e.g., "Query-Parcels") are removed
- This prevents duplicate tabs when re-running the same query
- Fixes issue where dataSourceId changed between queries, bypassing the duplicate check
- Belt-and-suspenders approach: checks both by name AND by dataSourceId

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Check for duplicates by tab name
- `query-simple/src/version.ts` - Increment to r024.93

---

## [1.19.0-r024.92] - 2026-02-22 - Sequential Multi-Table State Updates

### Fixed

**Multi-table render hack now uses sequential state updates (r024.92):**
- Separated non-last tabs addition from the two-phase hack into distinct phases
- Phase A: Add non-last tabs with separate state update, wait 50ms for Table widget to stabilize
- Phase B1: Add priming version of last tab (re-reads current state)
- Phase B2: Delete priming tab and add fresh-ID version (re-reads state again)
- Explicit cleanup: Priming tab entry is now explicitly deleted before adding fresh-ID version
- Prevents initialization conflicts when multiple tabs are opened simultaneously

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Sequential state updates
- `query-simple/src/version.ts` - Increment to r024.92

---

## [1.19.0-r024.91] - 2026-03-01 - Two-Phase Hack Only For Last Tab

### Fixed

**Two-phase render hack now only applies to the last tab (r024.91):**
- Non-last tabs are added directly without any hack (they refresh when user switches to them)
- Only the last/active tab goes through the prime → delay → recreate dance
- This prevents rendering issues when opening multiple tables at once
- Cleaner separation: Step 1 adds non-last tabs, Step 2 does two-phase for last tab only

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Refactored two-phase hack
- `query-simple/src/version.ts` - Increment to r024.91

---

## [1.19.0-r024.90] - 2026-02-28 - Multi-Table Render Fix

### Fixed

**Multi-table two-phase hack now activates last tab (r024.90):**
- Fixed issue where last table tab showed zero records when opening multiple tables
- The two-phase render hack now activates the LAST tab instead of first
- Other tabs refresh naturally when user switches to them
- Only the active tab needs the hack; switching tabs triggers re-initialization

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Activate last tab in two-phase hack
- `query-simple/src/version.ts` - Increment to r024.90

---

## [1.19.0-r024.89] - 2026-02-28 - CSV Export Field Ordering

### Changed

**CSV export now orders fields with visible/configured fields first (r024.89):**
- Configured display fields appear first in the CSV, in their configured order
- All remaining fields are appended after the priority fields
- Matches user expectation: important fields are immediately visible when opening the CSV

**Files modified:**
- `query-simple/src/runtime/results-menu.tsx` - Updated `recordsToCSV` to support priority field ordering
- `query-simple/src/version.ts` - Increment to r024.89

---

## [1.19.0-r024.88] - 2026-02-28 - CSV Export Naming Consistency

### Changed

**CSV export filenames now match Table tab naming (r024.88):**
- Single source exports: `Query-{searchAlias}.csv` or `Query-{queryName}.csv`
- Multi-source zip entries: Same naming pattern for each CSV inside the zip
- Zip file renamed from `QueryResults.zip` to `Query-Results.zip`
- Uses same naming priority as Table tabs: searchAlias > queryName > layerLabel

**Files modified:**
- `query-simple/src/runtime/results-menu.tsx` - Add `getQueryExportName()` helper
- `query-simple/src/version.ts` - Increment to r024.88

---

## [1.19.0-r024.87] - 2026-02-28 - Popup Template Field Extraction

### Fixed

**PopupSetting mode field visibility for "View in Table" (r024.87):**
- Discovered that `popupInfo.fieldInfos.visible` flags don't accurately reflect what's actually displayed in the popup
- When a layer uses custom HTML in `popupDescription`, only a subset of fields are shown even though all `fieldInfos` report `visible: true`
- Fixed by extracting `{FIELDNAME}` tokens directly from `popupTitle` and `popupDescription`
- Uses regex pattern `/\{(\w+)\}/g` (same pattern as `combineFields()`)
- Falls back to `fieldInfos.filter(visible)` only if no template fields are found

**Files modified:**
- `query-simple/src/runtime/query-result.tsx` - Extract fields from popup template
- `query-simple/src/version.ts` - Increment to r024.87
- `docs/bugs/VIEW_IN_TABLE_NAMING_VISIBILITY.md` - Document the fix

---

## [1.19.0-r024.83] - 2026-02-28 - Table Tab Naming

### Changed

**Table tabs now named using original query config (r024.83):**
- Tab names follow format `Query-{searchAlias}` or `Query-{queryName}`
- Uses `__queryConfigId` stamped on records to look up original query config
- Each data source group gets correct naming from the query that produced it
- Prevents incorrect naming when user switches queries before opening table

**Naming priority:**
1. `Query-{searchAlias}` - if query has searchAlias configured
2. `Query-{queryName}` - if no searchAlias but query has a name
3. `Query-{layerLabel}` - fallback to data source label

**Files modified:**
- `query-simple/src/runtime/query-result.tsx` - Look up query config in actionDataSets useMemo
- `query-simple/src/data-actions/view-in-table-action.tsx` - Apply naming logic
- `query-simple/src/version.ts` - Increment to r024.83

---

## [1.19.0-r024.82] - 2026-02-28 - View in Table Improvements

### Changed

**Two-phase table render hack (r024.81):**
- The Table widget has a bug where it doesn't properly render on first load
- Implemented two-phase update: add priming tabs, wait 100ms, recreate with fresh IDs
- This forces `destroyTable()` to be called, triggering proper initialization
- Inline documentation explains the workaround for future reference

**Duplicate tab prevention with data refresh (r024.82):**
- Opening "View in Table" for the same data source now removes the existing tab first
- Fresh tab is created to ensure data is always up to date
- Tracks open tabs by data source ID using module-level Map
- Prevents accumulation of duplicate tabs in the Table widget

**Debug logging:**
- `VIEW-TABLE` tag tracks phase 1/2 of render hack and tab management

**Files modified:**
- `query-simple/src/data-actions/view-in-table-action.tsx` - Two-phase hack, duplicate tab prevention
- `query-simple/src/version.ts` - Increment to r024.82

---

## [1.19.0-r024.79] - 2026-02-27 - Export CSV with Full Attributes

### Added

**Export CSV now fetches complete attribute data (r024.78-79):**
- Added "Export CSV" menu item to ResultsMenu
- Single source: Downloads `.csv` file directly
- Multiple sources: Downloads `QueryResults.zip` with one CSV per source
- Re-queries data source with `outFields: ['*']` to get all attributes (not just display fields)
- Matches the pattern used by View in Table action
- Falls back to client-side attributes if re-query fails

**Technical details:**
- Custom `recordsToCSV` function generates CSV (jimu-core's toCSV is internal)
- Uses actual OBJECTID from feature attributes (not `getId()` internal IDs) for multi-source support
- Properly escapes CSV values (commas, quotes, newlines)
- Excludes internal fields (`__queryConfigId`, `__originDSId`)

**Files modified:**
- `query-simple/src/runtime/results-menu.tsx` - Added Export CSV handler and menu item
- `query-simple/src/runtime/translations/default.ts` - Added `exportCSV` i18n string
- `query-simple/src/version.ts` - Increment to r024.79

---

## [1.19.0-r024.77] - 2026-02-22 - Clean Up ResultsMenu

### Changed

**Removed DataActionList from ResultsMenu (r024.77):**
- DataActionList was duplicating the "Pan to" action already provided by our custom menu
- ResultsMenu now contains only three custom actions: Pan to, View in table, Select on map
- Cleaner, more focused menu without Esri's default actions cluttering the UI

**Files modified:**
- `query-simple/src/runtime/results-menu.tsx` - Removed DataActionList, updated imports and styles
- `query-simple/src/version.ts` - Increment to r024.77

---

## [1.19.0-r024.76] - 2026-02-22 - Fix Multi-Source View in Table

### Fixed

**View in Table now correctly handles multiple data sources (r024.76):**
- When records from different feature layers are accumulated (Add mode), "View in table" was only showing the last source
- Root cause: `actionDataSets` grouping used `record.getDataSource()` which returns the shared outputDS after accumulation
- Fix: Now reads the stamped `__originDSId` attribute from record attributes first, uses DataSourceManager to look up the actual origin data source
- Records from different layers now correctly appear as separate tabs in the Table widget

**Files modified:**
- `query-simple/src/runtime/query-result.tsx` - Updated `actionDataSets` useMemo to prioritize `__originDSId`
- `query-simple/src/version.ts` - Increment to r024.76

---

## [1.19.0-r024.75] - 2026-02-22 - Cache Results Extent for Pan Action

### Changed

**Pan to action now uses cached resultsExtent (r024.75):**
- Phase 2 of extent caching optimization
- ResultsMenu's "Pan to" action now uses pre-calculated `resultsExtent` from props
- Centers on ALL results, not just the last record
- Deprecated `panToRecords` and `handlePanTo` in `pan-to-action.tsx`

**Files modified:**
- `query-simple/src/runtime/results-menu.tsx` - Uses cached resultsExtent for Pan to
- `query-simple/src/runtime/query-result.tsx` - Passes resultsExtent to ResultsMenu
- `query-simple/src/data-actions/pan-to-action.tsx` - Marked as deprecated
- `query-simple/src/version.ts` - Increment to r024.75

---

## [1.19.0-r024.74] - 2026-02-22 - Cache Results Extent for Zoom

### Changed

**Zoom to All Results now uses cached extent (r024.74):**
- Phase 1 of extent caching optimization
- Combined extent of all results is now calculated once when `accumulatedRecords` changes
- Stored as `resultsExtent` in widget state and passed through component chain
- "Zoom to Selected" button uses pre-calculated extent instead of recalculating on each click
- Improves performance and ensures consistent behavior
- **Memory optimization:** Eliminates repeated `geometryEngine.union()` and `Extent` object allocations on each button click, reducing GC pressure with large result sets

**Files modified:**
- `query-simple/src/runtime/zoom-utils.ts` - New `calculateRecordsExtent()` function, exported `expandExtentByFactor()`
- `query-simple/src/runtime/widget.tsx` - Added `resultsExtent` state, calculated in `handleAccumulatedRecordsChange`
- `query-simple/src/runtime/query-task-list.tsx` - Pass through `resultsExtent` prop
- `query-simple/src/runtime/query-task.tsx` - Pass through `resultsExtent` prop
- `query-simple/src/runtime/query-result.tsx` - Use cached extent for zoom button
- `query-simple/src/version.ts` - Increment to r024.74
- `CONTEXT.md` - Added architecture notes for cached extent pattern

---

## [1.19.0-r024.62] - 2026-02-19 - Show Error Feedback on Service Outage

### Fixed

**Query failures from service outages now surface a user-facing message (r024.62):**
- When the backing ArcGIS map service is down or returns an unexpected response, the query chain fails silently: the spinner disappears and the form returns with zero feedback
- The ArcGIS JS API's PBF parser throws when the service returns an error page or empty body instead of valid PBF data
- Added `queryErrorAlert` state in `query-task.tsx` (same pattern as `noResultsAlert` from r022.3)
- On query chain failure, a red-themed `calcite-popover` now appears anchored below the form with: "Search could not be completed. The map service may be temporarily unavailable."
- Popover is closable, auto-closes, and clears on the next query execution
- i18n strings added: `queryErrorAlertLabel`, `queryErrorAlertTitle`, `queryErrorAlertMessage`

**Files modified:**
- `query-simple/src/runtime/query-task.tsx` - `queryErrorAlert` state, set in `.catch`, cleared in `clearResult`, passed to `QueryTabContent`
- `query-simple/src/runtime/tabs/QueryTabContent.tsx` - New props, red popover with warning icon
- `query-simple/src/runtime/translations/default.ts` - Three new i18n strings
- `query-simple/src/version.ts` - Increment to r024.62

---

## [1.19.0-r024.61] - 2026-02-19 - Fix Clear-All Graphics Race Condition

### Fixed

**Clear-all now properly removes graphics on first query in non-LL mode (r024.61):**
- "Remove all" (trash button) left graphics on the map when widget_66 was the first widget to run a query
- If the LL widget (widget_63) ran a query first, clear-all worked correctly on widget_66
- Root cause: `createOrGetGraphicsLayer` had no concurrency guard. During widget init, two concurrent calls (from `handleDataSourceCreated` and `initializeGraphicsLayerFromOutputDS`) both passed the "does it exist?" check before either added to the map, creating two `GraphicsLayer` objects with the same ID but different UIDs
- The map kept one layer, the widget ref held the other. Graphics were added to the ref's layer, but `clearAnyResultLayerContents` found the map's layer (empty) by ID lookup
- Fix: Added `graphicsLayerCreationInProgress` lock (same pattern as `createOrGetResultGroupLayer` from r024.17). The second concurrent caller now awaits the first caller's promise. Also added a double-check after the async module load
- When widget_63 ran first, it consumed enough time that widget_66's two calls no longer raced, masking the bug

**Files modified:**
- `query-simple/src/runtime/graphics-layer-utils.ts` - Creation lock, internal factory function, lock cleanup in `cleanupGraphicsLayer`, UID tracking on layer create/find/add
- `query-simple/src/version.ts` - Increment to r024.61

---

## [1.19.0-r024.59] - 2026-02-19 - Close Popup on Layer Toggle-Off in Layer List

### Fixed

**Popup closes when layer toggled off in Layer List (r024.59):**
- In LL mode, when the user toggles the result layer OFF via the Layer List, the graphics disappear but the popup was staying open pointing at nothing
- Added a module-level `mapViewCache` in `graphics-layer-utils.ts` to cache the mapView per widgetId
- Cache is set in `addHighlightGraphics()` (which already receives mapView) and cleared in `cleanupGraphicsLayer()`
- The existing legend-layer visibility watcher now closes the popup when `visible` flips to `false`
- Complements r024.58 which correctly skips `popup.close()` on panel close (graphics persist in LL mode)

**Files modified:**
- `query-simple/src/runtime/graphics-layer-utils.ts` - mapView cache, popup close in watcher, cache cleanup
- `query-simple/src/version.ts` - Increment to r024.59

---

## [1.19.0-r024.58] - 2026-02-12 - Skip Popup Close on LL Path

### Fixed

**Popup no longer force-closed on panel close in Layer List mode (r024.58):**
- In LL mode, graphics persist on the map after the widget panel closes, so popup content remains valid
- Added `isLayerListMode` check: only close popup on panel close in non-LL (graphics layer) mode
- Previously, closing the panel would always close the popup, even when the underlying graphics were still visible

**Files modified:**
- `query-simple/src/runtime/widget.tsx` - Conditional popup close in `handleVisibilityChange`
- `query-simple/src/version.ts` - Increment to r024.58

---

## [1.19.0-r024.57] - 2026-02-12 - Re-enable Direct Query Bypass with buildRecord()

### Changed

**Direct query bypass re-enabled (r024.57):**
- `USE_DIRECT_QUERY` toggle set to `true` in `query-task.tsx`
- Replaced the `DirectQueryRecord` minimal adapter with `outputDS.buildRecord()`
- `buildRecord()` is ExB's own method: "Builds a data record only -- does not add the record into data source"
- Returns real `FeatureDataRecord` objects with full coded domain formatting, `getFormattedFieldValue()`, `clone()`, attachment support, and complete inter-widget compatibility
- Bypasses `outputDS.load()` (the primary memory leak source) while keeping all record formatting
- Confirmed impact: +12 MB steady-state for 160 records (matches r024.54 baseline of +14 MB)

**Debug logging for query path verification:**
- Added `QUERY-PATH` debug feature: logs which fork is taken (DIRECT vs EXB legacy) on every query
- Added `DIRECT-QUERY` debug feature: logs execution details (timing, record count, geometry, exceededTransferLimit)
- Both features registered in `shared-code/mapsimple-common/debug-logger.ts`
- Enable via `?debug=QUERY-PATH,DIRECT-QUERY` or `?debug=all`

### Removed
- `DirectQueryRecord` class deleted from `direct-query.ts` (replaced by `buildRecord()`)
- All 5 known adapter gaps resolved (coded domains, inter-widget messaging, setData, etc.)

### Known Gaps
- **Coded domain formatting**: Not yet tested. Current test data has flattened domains (code + label fields). Need a layer with active coded value domains to verify `getFormattedFieldValue()` works correctly through `buildRecord()`. Theoretically resolved since `buildRecord()` returns real `FeatureDataRecord` objects.

### Files Modified
- `query-simple/src/runtime/direct-query.ts`: Deleted DirectQueryRecord, rewrote executeDirectQuery to use buildRecord()
- `query-simple/src/runtime/query-task.tsx`: Flipped toggle to true, simplified branch, removed DirectQueryRecord import, added QUERY-PATH debug logging at fork point
- `query-simple/src/runtime/query-utils.ts`: Added QUERY-PATH debug logging for legacy path identification
- `query-simple/src/version.ts`: 56 -> 57
- `shared-code/mapsimple-common/debug-logger.ts`: Registered QUERY-PATH and DIRECT-QUERY debug features
- `docs/development/DIRECT_QUERY_BYPASS.md`: Updated status to ENABLED, documented buildRecord() approach, added Debugging section, added Testing Status table
- `docs/development/DEVELOPMENT_GUIDE.md`: Added QUERY-PATH and DIRECT-QUERY to Available Debug Features list
- `docs/bugs/MEMORY_LEAK_INVESTIGATION.md`: Added r024.57 test results, domain caveat, test protocol step 10

---

## [1.19.0-r024.56] - 2026-02-12 - Disable LayerList Remove Action

### Changed

**Remove action disabled at the source (r024.56):**
- After `mapView.map.add(groupLayer)`, the ExB-stamped `__exb_layer_from_runtime` flag is set to `false`
- ExB's map-layers widget only shows the Remove (trash) button for layers where this flag is truthy (see `dist/widgets/arcgis/map-layers/src/runtime/actions/remove.tsx`)
- Eliminates the entire `setupRemovalProtection` / `removeRemovalProtection` watcher system (~75 lines deleted)
- Removes one persistent `after-remove` listener per widget instance
- Removes two module-level tracking Maps (`removalListenerHandles`, `removalListenerHandleIds`)
- Makes the +58 MB destroy/recreate cycle from user-triggered removal impossible
- Legend FeatureLayers unaffected (ExB only stamps the flag on top-level layers added to `map.layers`, not GroupLayer sublayers)

### Verified
- Remove button does NOT appear for the GroupLayer in the map-layers widget
- Legend still displays point, line, and polygon symbology for query results
- Visibility toggle still works in the LayerList

### Files Modified
- `query-simple/src/runtime/graphics-layer-utils.ts`: Deleted removal protection system, added `__exb_layer_from_runtime = false` after `map.add()`
- `query-simple/src/version.ts`: 55 -> 56
- `docs/bugs/MEMORY_LEAK_INVESTIGATION.md`: Next Steps item 3 marked DONE, test protocol updated

---

## [1.19.0-r024.55] - 2026-02-17 - Memory Leak Investigation & Persistent Layer Architecture

### Changed

**Memory leak investigation (r024.48-r024.55).** Identified and addressed the per-query memory leak through a series of targeted experiments. Full findings in `docs/bugs/MEMORY_LEAK_INVESTIGATION.md`.

**Direct Feature import (r024.48/51, permanent):**
- `feature-info.tsx` now imports `Feature` directly from `@arcgis/core/widgets/Feature` instead of the `jimu-arcgis` wrapper
- Allows ESRI's core to delete its own ObservationHandles between queries (50K+ deleted per cycle vs ~0 through the wrapper)
- Low-risk module swap with no behavior change

**Persistent GroupLayer (r024.52-53):**
- Consolidated 3 visible GraphicsLayer sublayers into 1 hidden GraphicsLayer (reduces reactive watcher overhead)
- `clearGroupLayerContents()` now preserves the GroupLayer on the map instead of destroying and recreating it
- `cleanupGroupLayer()` reserved exclusively for widget unmount
- Saved ~32 MB on first-query initialization cost

**Persistent Legend FeatureLayers (r024.54):**
- `ensureLegendFeatureLayer()` reuses existing Legend FLs instead of creating new ones (re-enables via `legendEnabled = true`)
- `clearGroupLayerContents()` hides Legend FLs via `legendEnabled = false` instead of removing and destroying them
- `removeEmptyLegendFeatureLayers()` hides instead of destroys
- Result: LayerList path stabilizes at +1 MB/query after a 2-query warm-up (down from ~62 MB/query steady state)

**Direct query bypass (r024.50, disabled r024.55):**
- Proved that ExB's `outputDS.load()` is the primary source of the memory leak
- `USE_DIRECT_QUERY` toggle in `query-task.tsx` set to `false` for production safety
- `direct-query.ts` and `DirectQueryRecord` adapter remain in codebase, fully documented, for future hardening
- See `docs/development/DIRECT_QUERY_BYPASS.md` for full story, test results, and hardening roadmap

### Performance Results (r024.54, LayerList path)

| Query | Memory | Growth | Records |
|---|---|---|---|
| Base | 175 MB | -- | -- |
| Q1 + clear | 257 MB | +82 MB | 1 |
| Q2 + clear | 319 MB | +62 MB | 1 |
| Q3 + clear | 320 MB | **+1 MB** | 1 |
| Q4 + clear | 321 MB | **+1 MB** | 1 |
| Q5 + clear | 335 MB | **+14 MB** | 160 |

99% reduction (single record) and 89% reduction (160 records) vs r024.39 baseline of 127 MB/query.

### Added

- `docs/development/DIRECT_QUERY_BYPASS.md` - Architecture, test results, known gaps, and hardening roadmap for the direct query bypass

### Files Modified
- `query-simple/src/runtime/query-task.tsx`: USE_DIRECT_QUERY toggle (false), documentation
- `query-simple/src/runtime/direct-query.ts`: Thorough inline documentation of gaps and hardening roadmap
- `query-simple/src/runtime/components/feature-info.tsx`: Direct @arcgis/core Feature import with explanation
- `query-simple/src/runtime/graphics-layer-utils.ts`: Persistent GroupLayer, persistent Legend FeatureLayers
- `query-simple/src/runtime/selection-utils.ts`: Lightweight clear integration
- `query-simple/src/version.ts`: r024.43 -> r024.55
- `docs/bugs/MEMORY_LEAK_INVESTIGATION.md`: Full investigation results through r024.55
- `docs/development/DIRECT_QUERY_BYPASS.md`: New document

---

## [1.19.0-r024.18] - 2026-02-14 - LayerList Persistent Results (Complete)

### Added
**LayerList integration with persistent result layers.** Query results can now be displayed as a `GroupLayer` visible in the LayerList and Legend widgets, persisting when the widget closes.

**Settings:**
- "Show results in LayerList" toggle in widget settings (Graphics section)
- Optional custom layer title (defaults to "Enhanced Search")

**Core Functionality (r024.0-r024.11):**
- Results render into a `GroupLayer` with 3 geometry-based sublayers (Points, Lines, Polygons)
- LayerList shows collapsible group with geometry-type sublayers
- Toggle layer or sublayers in LayerList to control visibility
- Graphics persist on map when widget closes (no clear/restore cycle)
- Multiple widgets each get their own GroupLayer (no conflicts)

**Legend Support (r024.12-r024.15):**
- Dynamic companion FeatureLayers show symbology in Legend widget
- Legend entries automatically appear when graphics of that geometry type are added
- Legend entries automatically removed when last graphic of that type is cleared
- Toggling in Legend controls visibility of actual graphics
- Legend FeatureLayers hidden from LayerList to avoid clutter

### Fixed

**r024.4** - Toggle change detection: Switching toggle after initialization now recreates layer with correct type

**r024.5** - Config registration timing: Moved to constructor to prevent race conditions

**r024.9** - Architecture: Restored 3-sublayer architecture with `visibilityMode: 'inherited'` for reliable LayerList integration

**r024.10** - Clear/Recreate: Fixed `clearGraphicsLayerRefs` to recreate correct layer type (GroupLayer vs GraphicsLayer)

**r024.11** - Clear All: Fixed to work with both layer types using `clearGraphicsLayerOrGroupLayer`

**r024.16** - Removal Protection: GroupLayer automatically re-adds itself if user tries to remove via LayerList "Remove" action

**r024.17** - Race Condition: Hash query loads no longer create duplicate GroupLayers (promise-based creation lock)

**r024.18** - Auto-Enable Visibility: Layer automatically turns on when graphics are added if it was toggled off

### Files Modified
- `query-simple/src/config.ts`: addResultsAsMapLayer, resultsLayerTitle
- `query-simple/src/setting/setting.tsx`: toggle and title input UI
- `query-simple/src/setting/translations/default.ts`: i18n strings
- `query-simple/src/runtime/graphics-layer-utils.ts`: GroupLayer creation, Legend FeatureLayers, lifecycle
- `query-simple/src/runtime/widget.tsx`: conditional close/open behavior, toggle change detection
- `query-simple/src/runtime/hooks/use-selection-restoration.ts`: conditional restoration skip
- `query-simple/src/runtime/query-task.tsx`: clearResult GroupLayer handling
- `query-simple/src/version.ts`: r024.0 -> r024.18

---

## [1.19.0-r024.0] - 2026-02-12 - LayerList Integration Phase 1

### Added
**Config and Settings UI for LayerList persistent results (Phase 1).** No behavior change yet.
- `addResultsAsMapLayer` config toggle (default: false) - "Show results in LayerList"
- `resultsLayerTitle` optional config - custom layer title when enabled (default: "QuerySimple Results")
- Settings UI: toggle switch and optional title input in Graphics Layer Symbology section
- i18n strings for new settings

Phase 2 will implement GroupLayer creation and graphics routing.

---

## [1.19.0-r023.34] - 2026-02-14 - Expanded result item height fix

### Fixed
**Expanded result items clipped at bottom.** When expanded, stacked Zoom/Remove icons (64px) plus attribute content exceeded the 2rem min-height. Added `result-item-expanded` class with `min-height: 4.5rem` so the container accommodates all content.

---

## [1.19.0-r023.31-33] - 2026-02-14 - Result actions and zoom defaults

### Changed (r023.31)
**Default zoomOnResultClick to false.** Clicking a result no longer zooms by default. Users zoom explicitly via "Zoom to" in the result actions menu or inline icon. Enables explicit zoom workflow.

### Added (r023.32)
**Three-dot menu per result row.** Replaced inline trash button with a menu containing:
- **Zoom to** – zooms map to that record (when map available)
- **Remove** – removes record from results

Saves space when collapsed; uses same icons as before (zoom-to.svg, trash).

### Changed (r023.33)
**Adaptive result actions.** When expanded, shows inline Zoom to and Remove icons stacked vertically. When collapsed, shows three-dot menu. Horizontal layout always shows inline icons. FeatureInfo exposes `onExpandChange` callback so QueryResultItem can track expand state.

### Files Modified
- `query-simple/src/config.ts`: zoomOnResultClick default and JSDoc
- `query-simple/src/runtime/query-result.tsx`: handleZoomToRecord, zoomOnResultClick logic
- `query-simple/src/runtime/query-result-item.tsx`: Menu, inline icons, expand-state logic
- `query-simple/src/runtime/components/feature-info.tsx`: onExpandChange callback
- `query-simple/src/runtime/simple-list.tsx`: onZoomTo prop
- `query-simple/src/setting/setting.tsx`: zoomOnResultClick checkbox logic
- `query-simple/src/version.ts`: Incremented through r023.33

---

## [1.19.0-r023.28-30] - 2026-02-13 - Cross-layer selection removal fixes

### Fixed (r023.28)
**Native selection not clearing on single-item removal.** When removing a record via the X button after using "Select on Map", the blue outline persisted. The `removeRecordsFromOriginSelections` function used composite keys (`recordId__queryConfigId`) for matching, but origin DS records from "Select on Map" don't have `__queryConfigId`. Now falls back to simple `recordId` matching when composite key matching removes nothing.

### Fixed (r023.29)
**Expand/collapse state resetting on mode switches.** When switching between New/Add/Remove modes, all expanded result items collapsed back to default. The `QueryTaskResult` component had a `key` prop that changed based on `resultsMode`, forcing React to remount and reset local state. Now uses a stable key that only changes on new query execution.

### Fixed (r023.30)
**Cross-layer removal failing for accumulated results.** When accumulating results from multiple layers (e.g., Regional Trails + Address Points) and removing a record, the native selection for records from "non-current" layers wasn't cleared. The origin DS lookup fell back to `outputDS.getOriginDataSources()[0]` which only returned one layer.

**Solution:** Records now get stamped with `__originDSId` attribute (alongside existing `__queryConfigId`) when added to results. The removal function looks up the correct origin DS via `DataSourceManager.getInstance().getDataSource(originDSId)`, enabling proper cross-layer removal.

### Removed (r023.28)
**Dead `useEffect` in query-result.tsx.** A `useEffect` that cleared selection when `resultSelectMode` changed was removed. It was dead code since r023.5-12 (we only use graphics layer now), had incorrect arguments, and was causing URL hash flashing on mode switches.

### Files Modified
- `query-simple/src/runtime/results-management-utils.ts`: Cross-layer origin DS lookup via `__originDSId`, recordId fallback
- `query-simple/src/runtime/query-task.tsx`: Stamp `__originDSId` on records, stable component key
- `query-simple/src/runtime/query-result.tsx`: Removed dead `useEffect`
- `query-simple/src/runtime/tabs/QueryTabContent.tsx`: Stamp `__originDSId` on mode switch captures
- `query-simple/src/version.ts`: Incremented through r023.30

---

## [1.19.0-r023.22-26] - 2026-02-12 - Results Mode UX overhaul and polish

### Changed (r023.22-23)
**Results Mode selector redesigned.** The New/Add/Remove mode buttons were restyled to make it clear these are modes, not action buttons. Users were confusing "Remove" for an action that should do something immediately.

- **Segmented control**: Buttons sit inside a unified tray with subtle background
- **Per-mode colors**: New (blue), Add (green), Remove (muted red), hardcoded so ExB theme cannot override
- **Per-mode icons**: Star, plus, minus for visual differentiation
- **Logic summary bar**: Colored banner below buttons confirms active mode in plain language
- **"Results Mode" label**: Replaces ambiguous "Results:" label
- **r023.23 polish**: Removed "LOGIC:" prefix, font size 0.8rem, opacity tuning

### Changed (r023.24)
- Results Mode button font size: 0.75rem → 0.8125rem

### Changed (r023.25)
- Removed Results Mode info (i) hover button; logic bar below provides the same guidance
- Button horizontal padding: 8px → 10px for more width

### Changed (r023.26)
- Reverted button height to original (padding 2px vertical, min-height 26px); kept width increase

### Files Modified
- `query-simple/src/runtime/tabs/QueryTabContent.tsx`: Results Mode UI overhaul, removed Tooltip/InfoOutlined
- `query-simple/src/runtime/translations/default.ts`: Added resultsModeLogicNew, resultsModeLogicAdd, resultsModeLogicRemove
- `query-simple/src/version.ts`: Incremented through r023.26

---

## [1.19.0-r023.19-21] - 2026-02-12 - FeatureInfo detached DOM leak fix

### Fixed
**Detached DOM accumulation from FeatureInfo component.** Each `FeatureInfo` unmount (clear results, query switch, record removal) orphaned the manually-created Esri Feature widget, its container div, and all internal calcite-loader/SVG elements as detached DOM nodes. Heap snapshots showed +6,641 detached divs per heavy cycle before the fix.

**Root cause:** `feature-info.tsx` (originally copied from Esri's stock query widget) had two missing cleanup paths:
1. No `componentWillUnmount` lifecycle method (Leak Path A: unmount). Esri Feature widget and container div were never cleaned up when React unmounted the component.
2. Incomplete `destroyFeature()` (Leak Path B: prop updates). Only called `this.feature.destroy()` without removing the container div or nulling the reference. On each `componentDidUpdate` prop change, a new container was appended while the old one was orphaned.

**Fix progression:**
- r023.19: Upgraded `destroyFeature()` to null the feature ref and clear all child DOM from container
- r023.20: Fixed call order in `createFeature()` (must destroy before appending new container, not after)
- r023.21: Added `componentWillUnmount` lifecycle method that calls `destroyFeature()`

**Results (heap snapshot comparison):**
- Detached `<div>`: +6,641/cycle reduced to +1,183/cycle (82% reduction)
- Detached `<button>`: +1,142/cycle eliminated from top entries
- Remaining detached DOM (calcite-loader, ShadowRoot, SVG elements) is Esri SDK internal and not addressable from application code

**Note:** Esri's stock `dist/widgets/arcgis/query/` feature-info.tsx has the same bug. This fix is our improvement on top of their code.

### Files Modified
- `query-simple/src/runtime/components/feature-info.tsx`: Added `componentWillUnmount`, upgraded `destroyFeature()`, reordered cleanup in `createFeature()`
- `query-simple/src/version.ts`: Incremented through r023.21

---

## [1.19.0-r023.18] - 2026-02-12 - Custom Template mode with Markdown editor

### Added
**Custom Template result display mode.** A third option alongside "Popup setting" and "Select attributes" in the Results configuration. Users author a Markdown template with `{fieldName}` tokens that gets converted to styled HTML at runtime via Esri PopupTemplate text content.

**Settings UI:**
- "Custom template" option in the result fields dropdown
- Monospace content editor with field picker button (same ExpressionBuilder pattern as title)
- `(?)` InfoOutlined hover tooltip with full syntax cheat sheet
- Live preview panel with badge-styled field tokens
- Title expression editor shared between SelectAttributes and CustomTemplate modes

**Supported Markdown syntax:**
- `**bold**` / `__bold__` and `*italic*` / `_italic_`
- `#` Heading (h3), `##` Subheading (h4), `###` Small heading (h5)
- `- item` unordered list items
- `---` horizontal rule
- `[text](url)` clickable links (opens in new tab)
- Leading spaces for visual indentation (2 spaces = 1em)
- Single Enter = `<br/>` (line break within paragraph)
- Blank line (double Enter) = new `<p>` (paragraph break)

**Architecture:**
- Zero-dependency lightweight Markdown parser (`markdown-template-utils.ts`)
- Runs through the existing PopupTemplate pipeline (text content type)
- `extractFieldTokens()` ensures query fetches all referenced fields
- `combineFields()` extended to parse `resultContentExpression`
- Paragraph buffer pattern groups consecutive plain lines into single `<p>` with `<br/>` separators

### Files Added
- `query-simple/src/runtime/markdown-template-utils.ts`: `convertTemplateToHtml`, `renderPreview`, `extractFieldTokens`

### Files Modified
- `query-simple/src/config.ts`: Added `CustomTemplate` to `FieldsType` enum, `resultContentExpression` to `QueryItemType`
- `query-simple/src/default-query-item.ts`: Default empty string for `resultContentExpression`
- `query-simple/src/runtime/query-utils.ts`: CustomTemplate branch in `getPopupTemplate`, extended `combineFields`
- `query-simple/src/runtime/query-result.tsx`: CustomTemplate branch in field extraction for action data sets
- `query-simple/src/setting/results.tsx`: Full Custom Template settings UI with editor, field picker, tooltip, and preview
- `query-simple/src/setting/translations/default.ts`: `field_CustomTemplate`, `contentTemplate`, `contentTemplateTip`, `templatePreview`
- `query-simple/src/version.ts`: Incremented to r023.18

---

## [1.19.0-r023.14-17] - 2026-02-12 - Zombie records, cross-query popup template fixes

### Bug Fixed (r023.14-16): Zombie records reappearing after X-button removal
**Records removed via the X-button would reappear when switching from Add mode to New mode.**

**Root cause:** `recordsRef.current` in `query-task.tsx` was set from `accumulatedRecords` during query switches but was never updated when individual records were removed via the X-button. The `effectiveRecords` fallback would read stale data from `recordsRef.current`.

**Fix progression:**
- r023.14: Improved `outputDS` selection filtering in `query-result.tsx` `removeRecord` callback to correctly deselect records even when `__queryConfigId` was inconsistent
- r023.15: Attempted `effectiveRecords` change (overcorrection, caused regression: premature clearing of results panel on mode switch)
- r023.16: Reverted r023.15. Added `useEffect` to `query-task.tsx` that syncs `recordsRef.current` with `accumulatedRecords` when removals are detected (length decreases)

### Bug Fixed (r023.17): Cross-query popup template using wrong origin DS
**Parcel record lost its formatting when accumulated with a park record in Add mode.**

**Root cause:** The `__queryConfigId` stamping logic in `QueryTabContent.tsx` was blindly applying the current query's `configId` to all "added" records, even if they already had a `__queryConfigId` from a prior query. This caused `getPopupTemplate` to resolve the wrong origin data source.

**Fix (3 files):**
- `QueryTabContent.tsx`: Conditional stamping, only if `__queryConfigId` not already set
- `query-utils.ts`: `getPopupTemplate` accepts optional `originDSOverride` parameter
- `simple-list.tsx`: Resolves correct `originDSForConfig` per record via `DataSourceManager`

### Files Modified
- `query-simple/src/runtime/query-task.tsx`: r023.16 `useEffect` for `recordsRef` sync
- `query-simple/src/runtime/query-result.tsx`: r023.14 improved `outputDS` selection filter
- `query-simple/src/runtime/tabs/QueryTabContent.tsx`: r023.17 conditional `__queryConfigId` stamping
- `query-simple/src/runtime/query-utils.ts`: r023.17 `originDSOverride` parameter
- `query-simple/src/runtime/simple-list.tsx`: r023.17 resolve correct origin DS per config
- `query-simple/src/version.ts`: Incremented through r023.17
- `docs/testing/EDGE-CASE-TEST-PLAN.md`: Added Sections J (Zombie Records) and K (Cross-Query Popup Template)

---

## [1.19.0-r023.13] - 2026-01-25 - Settings: Map widget required warning

### Changed
**Map widget selection now shows a validation warning.** When no map widget is selected under Highlight Options, a red warning message appears below the selector: "A map widget is required. Query results will not display on the map without one." The warning disappears once a map widget is selected.

### Files Modified
- `query-simple/src/setting/setting.tsx`: Added conditional warning below `MapWidgetSelector`
- `query-simple/src/setting/translations/default.ts`: Added `mapWidgetRequired` translation string
- `query-simple/src/version.ts`: Incremented to r023.13

---

## [1.19.0-r023.12] - 2026-02-11 - FIX: Clean data_s hash on panel close

### Bug Fixed
**Dirty hash persisting after widget panel close.** When `clearAccumulatedRecords` was removed from panel close (r023.11) to preserve explicit "Select on Map" blue outlines, the `clearDataSParameterFromHash()` call was also lost as a side effect. Experience Builder adds `data_s` to the URL hash when selections are made but never removes it, leaving stale selection state in the URL after closing the widget.

### Fix
Added a direct `clearDataSParameterFromHash()` call to `clearSelectionFromMap`, independent of origin DS clearing. The hash is cleaned without touching the origin DS selection.

### Selection Audit (r023.5-12 Complete)

All automatic origin DS selection paths are now blocked. Only explicit user actions trigger blue outlines:

| Path | Status |
|---|---|
| Query execution (auto-select) | Blocked (r023.5) |
| Query switch reselection | Output DS only (r023.9) |
| Cross-layer grouping loops | Removed (r023.5) |
| Panel reopen restoration | Origin DS loop removed (r023.10) |
| Popup close restoration | Same fix (r023.10) |
| Panel close clearing | Origin DS clear removed (r023.11) |
| Record click (user action) | Intentional, kept |
| Remove X (user action) | Intentional, kept |
| Clear All (user action) | Intentional, kept |
| "Select on Map" (user action) | Intentional, kept |

**Files Modified:**
- `query-simple/src/runtime/hooks/use-selection-restoration.ts`: Added `clearDataSParameterFromHash()` import and call
- `query-simple/src/version.ts`: Incremented to r023.12

---

## [1.19.0-r023.11] - 2026-02-11 - BUGFIX: Blue outlines on panel close/reopen and popup close

### Bug Fixed
**Blue outlines appearing on widget panel reopen and identify popup close.** The `restoreAccumulatedRecords` method in `use-selection-restoration.ts` passed `originDS` as the `outputDS` parameter to `selectRecordsAndPublish`. Even with `skipOriginDSSelection: true` (added in r023.5), two leak paths remained:

1. `outputDS.selectRecordsByIds()` (line 210 in `selectRecordsInDataSources`) was actually calling `originDS.selectRecordsByIds()` since the origin DS was passed as the output DS parameter
2. `publishSelectionMessage()` published a `DataRecordsSelectionChangeMessage` for the origin DS, which the framework reacted to by creating blue outlines

### Changes

**r023.10: Remove origin DS selection from restoration path**
- Removed the origin DS loop from `restoreAccumulatedRecords` (lines 411-442)
- Graphics are already restored separately (lines 362-409)
- Output DS selection is handled by `handleOutputDataSourceCreated` on widget re-render
- Removed unused `selectRecordsAndPublish` dynamic import

**r023.11: Preserve explicit "Select on Map" blue outlines through panel close**
- Removed `clearAccumulatedRecords()` call from `clearSelectionFromMap`
- Previously, closing the widget panel cleared origin DS selection (blue outlines from "Select on Map")
- Since r023.10 removed origin DS restoration on reopen, this meant explicit user selections were permanently destroyed on panel close
- Now only (X) remove and Clear All clear origin DS selection (explicit user actions only)

**Files Modified:**
- `query-simple/src/runtime/hooks/use-selection-restoration.ts`: Restoration and clearing paths
- `query-simple/src/version.ts`: Incremented to r023.11

### Known Issues
- **Intermittent hash query non-execution:** Value populates in textbox but `SqlExpressionRuntime.onChange` never fires. Appears to be a timing race unrelated to r023.5-11 selection changes. Under investigation.

---

## [1.19.0-r023.9] - 2026-02-11 - ARCHITECTURE: Simplify Reselection Block (Step 3/3)

### Architectural Changes
**Simplified 372-line reselection block to ~30 lines (query-task.tsx):** The reselection block that ran during query switches in Add/Remove mode was massively over-engineered. With automatic blue outlines removed (r023.5-7) and the destructive sync block removed (r023.8), most of this code was dead weight.

**What was removed (~340 lines):**
- Graphics layer clearing (already neutered in r022.29, just logged)
- Origin layer filtering of accumulated records (not needed for output DS, which is widget-owned)
- `selectRecordsAndPublish` call (with both `skipOriginDSSelection` and `useGraphicsLayer` false, it was just a wrapper around `selectRecordsByIds`)
- URL hash `data_s` duplicate cleanup (~120 lines of hash parsing)
- Verbose diagnostic/verification logging (6+ log calls)
- Verification setTimeout that polled DS state after 200ms
- rootDataSource map inspection diagnostic block (~60 lines)

**What remains (the essential core):**
1. `isQuerySwitchInProgressRef.current = true` (set early, before block)
2. `featureDS.selectRecordsByIds(allRecordIds, accumulatedRecords)` - updates new output DS
3. `recordsRef.current = accumulatedRecords` - updates Results tab records
4. `setResultCount(accumulatedRecords.length)` - updates count display
5. `isQuerySwitchInProgressRef.current = false` - clears flag
6. One diagnostic log summarizing the update

**Why this is safe:**
- Output DS update is now a direct `selectRecordsByIds` call (same end result as the `selectRecordsAndPublish` wrapper)
- Origin layer filtering was only needed for origin DS selection (now disabled)
- URL hash cleanup addressed a side effect of `publishSelectionMessage` which is no longer called here
- All removed logging was diagnostic, not behavioral

**Files Modified:**
- `query-simple/src/runtime/query-task.tsx`: Lines 836-882 replace lines 836-1302
- `query-simple/src/version.ts`: Incremented to `r023.9`

---

## [1.19.0-r023.8] - 2026-02-11 - CLEANUP: Remove Destructive Sync Block (Step 2/3)

### Code Cleanup
**Removed dead code block (query-task.tsx lines 1379-1442):** This block was neutered in r022.29 to fix query switch purging. It computed `syncedRecords` by filtering `accumulatedRecords` against `outputDS.getSelectedRecords()`, logged diagnostic info, but never called `onAccumulatedRecordsChange(syncedRecords)` to actually sync. With automatic selection removed, this entire block is dead code.

**What was removed:**
- Condition check: `if (actuallySelectedRecords.length > 0 && actuallySelectedRecords.length < accumulatedRecords.length)`
- Set construction for fast lookup
- Filter operation to compute `syncedRecords`
- Two diagnostic log calls with computed values
- Else branch that logged "already-in-sync"

**What was kept:**
- `preserving-accumulated-records-on-query-switch` log (line 1445)
- `previousConfigIdRef.current` update (line 1456)
- Surrounding accumulation mode guards

**Why this is safe:** The sync call was already removed in r022.29. This block only computed values and logged them. No functionality depends on these logs. Removal has zero behavioral impact.

**Test Result (2026-02-11):** Query switching in Add mode verified. All accumulated records remain in Results tab with blue borders. Graphics persist through switches. No behavioral change from r023.7.

**Files Modified:**
- `query-simple/src/runtime/query-task.tsx`: Lines 1379-1442 removed
- `query-simple/src/version.ts`: Incremented to `r023.8`

---

## [1.19.0-r023.7] - 2026-02-11 - BUGFIX + UI: Layer-selection branch skip flag + "Select on map" rename

### Bug Fixed
**Blue outlines still appearing on query switch (r023.6):** The `selectRecordsInDataSources` function in `selection-utils.ts` has two branches: a graphics-layer branch and a layer-selection (else) branch. The `skipOriginDSSelection` flag was only checked in the graphics-layer branch. Query switch calls used `useGraphicsLayer: false`, falling into the else branch which called `originDS.selectRecordsByIds()` unconditionally.

**Fix:** Added `!skipOriginDSSelection &&` guard to the layer-selection branch (line 177), matching the graphics-layer branch pattern. Also added `skipOriginDSSelection` to the diagnostic log and a skip-event log for traceability.

### UI Change
**Renamed "Add to map" action to "Select on map":** The action label now better reflects its purpose since automatic selection has been removed. Users explicitly choose to select features on the map.

**Files Modified:**
- `query-simple/src/runtime/selection-utils.ts`: Line 177 (skip guard in else branch)
- `query-simple/src/runtime/translations/default.ts`: `addToMap` label
- `query-simple/src/data-actions/add-to-map-action.tsx`: Default label
- `query-simple/src/version.ts`: Incremented to `r023.7`

### Known Issues / Future Work
- **Map Identify popup path:** Closing an Identify popup still triggers native selection (blue outlines). This is a separate code path not yet addressed.
- **Dead code: layer-selection else branch:** With selection disabled, `useGraphicsLayer` is effectively always `true`. The else branch in `selectRecordsInDataSources` is dead code and should be considered for removal as a cleanup task.
- **Config remnant:** The `useGraphicsLayer` toggle may have been removed from the settings UI, but the code branch persists. Should be cleaned up to avoid confusion.

---

## [1.19.0-r023.5] - 2026-02-11 - ARCHITECTURE: Remove Automatic Blue Map Outlines (Step 1/3 COMPLETE)

### 🏗️ Architectural Changes
**Remove automatic blue map outlines from query execution**: Query results no longer create blue selection outlines on the map automatically. Purple graphics (highlights) still render. Blue outlines only appear when user explicitly uses "Add to Map" action.

**Initial implementation (query-result.tsx line 470) only covered one of four paths. Full implementation addresses all automatic selection paths:**

**Path 1 - Automatic selection useEffect (query-result.tsx line 470):**
- Changed `alreadySelected` to `true`
- Skips origin DS selection in `selectRecordsAndPublish`

**Path 2 - Cross-layer grouping (query-task.tsx lines 2157-2178):**
- REMOVED two loops that called `originDS.selectRecordsByIds()` directly
- These loops cleared then re-selected each origin DS during query result processing
- Output DS selection retained (line 2182) for Results tab borders

**Path 3 - Query switch reselection (query-task.tsx line 1067):**
- Added `skipOriginDSSelection: true` (9th parameter) to `selectRecordsAndPublish`
- Prevents blue outlines when switching between queries in Add/Remove modes

**Path 4 - Panel reopen restoration (use-selection-restoration.ts line 424):**
- Added `skipOriginDSSelection: true` to `selectRecordsAndPublish`
- Prevents blue outlines when reopening widget panel

**What this achieves:**
- Query execution → Purple graphics YES, blue map outlines NO
- Query switching → Purple graphics YES, blue map outlines NO
- Panel reopen → Purple graphics YES, blue map outlines NO
- Results tab blue borders → YES (via output DS)
- "Add to Map" action → YES (explicitly calls origin DS selection)

**Why this is safe:**
- Purple graphics provide visual feedback during query
- Results tab provides selection state
- User retains full control via "Add to Map" for blue outlines
- No loss of functionality, just shift from automatic to explicit

**Testing priorities:**
1. Query execution shows purple graphics, no blue outlines
2. Results tab blue borders render correctly
3. "Add to Map" creates blue outlines as expected
4. Query switching preserves graphics and Results tab state
5. Panel close/reopen preserves graphics, no blue outlines

**Files Modified:**
- `query-simple/src/runtime/query-result.tsx`: Line 470
- `query-simple/src/runtime/query-task.tsx`: Lines 1067, 2157-2178
- `query-simple/src/runtime/hooks/use-selection-restoration.ts`: Line 424
- `query-simple/src/version.ts`: Incremented to `r023.5`

**Next Steps:** Step 2 (remove destructive sync block), Step 3 (remove reselection block)

---

## [1.19.0-r023.4] - 2026-02-11 - BUGFIX: Query Switch Results Tab Deselection

### 🐛 Bug Fixed
**Results Tab Losing Blue Borders on Query Switch**: When switching queries in Add mode, results from other layers would lose their blue border highlighting in the Results tab.

**Root Cause:**
- Query switch reselection block (query-task.tsx lines 997-1022) filtered accumulated records to only the current query's layer
- Passed filtered subset to `selectRecordsAndPublish` (line 1055-1064)
- Output DS selection updated with partial set (e.g., 1 of 2 records)
- `handleDataSourceInfoChange` reads partial selection, updates `selectedRecords` state
- Cross-layer results lose blue border in Results tab

**The Fix:**
- Line 1037: Changed `recordsToReselect.map(...)` to `accumulatedRecords.map(...)`
- Line 1059: Changed `recordsToReselect` to `accumulatedRecords`
- Output DS now gets ALL accumulated records selected (not filtered subset)
- Results tab blue borders persist across query switches

**Why this is safe:** The output DS is widget-owned and can hold records from any layer. Only origin DS selection (blue map outlines) needs layer filtering, which is handled separately.

**Test Result:** Query parcel + park in Add mode. Switch between queries. Both keep blue border in Results tab.

**Files Modified:**
- `query-simple/src/runtime/query-task.tsx`: Lines 1037, 1059
- `query-simple/src/version.ts`: Incremented to `r023.4`

---

## [1.19.0-r023.3] - 2026-02-11 - ARCHITECTURE: Isolate Add to Map Selection (Phase 1)

### 🏗️ Architectural Changes
- **Isolated Add to Map selection logic** from shared selection utilities
- Created dedicated `selectRecordsForAddToMap` function with multi-layer support
- Add to Map now interrogates graphics layer to determine record-to-layer mapping
- Preparation for removing all automatic selection logic in Phase 2

### ✨ Enhanced
- **Multi-layer selection via graphics interrogation**:
  - Graphics layer stores `queryConfigId` in attributes
  - Function maps `queryConfigId` → query config → data source → origin layer
  - Groups records by origin layer
  - Selects records in each layer independently
  - Supports unlimited layers in accumulation mode

### 🔧 Technical Details
**Implementation:**
- `add-to-map-action.tsx`: Added dedicated `selectRecordsForAddToMap` function (isolated, self-contained)
- `index.tsx`: Pass `graphicsLayer` and `queries` through action creation chain
- `query-result.tsx`: Pass `graphicsLayer` and `queries` to `getExtraActions`
- Graphics interrogation:
  1. Read `recordId` and `queryConfigId` from graphic attributes
  2. Map `queryConfigId` to data source via query configs
  3. Get origin data source from data source manager
  4. Group records by origin layer
  5. Call `selectRecordsByIds` on each layer

**Files Modified:**
- `query-simple/src/data-actions/add-to-map-action.tsx`: Created dedicated selection function
- `query-simple/src/data-actions/index.tsx`: Updated action creation signature
- `query-simple/src/runtime/query-result.tsx`: Pass graphics and queries to actions
- `query-simple/src/version.ts`: Incremented to `r023.3`

**Why This Matters:**
- Add to Map is now independent of automatic selection logic
- When we remove automatic selection in Phase 2, Add to Map will continue working
- Multi-layer selection properly supported via graphics layer interrogation

**Phase 1 Complete** ✅
- Add to Map isolated and tested
- Multi-layer selection working
- Ready for Phase 2: Remove all automatic selection logic

---

## [1.19.0-r022.109] - 2026-01-25 - ENHANCEMENT: Adjust Spring Drop Animation Timing

### Changed
- **Spring Drop Starting Position**: Adjusted initial Y position from `-2.0` to `-1.2` for snappier animation
  - Shorter drop distance creates quicker, more responsive feel
  - Maintains same physics (stiffness: 0.15, damping: 0.8)
  - Final resting position unchanged at `-0.5`

### Technical Details
**Implementation:**
- Updated `initialY` constant in both animation paths (create and reuse)
- Updated initial `anchorPoint.y` on CIM symbol creation
- Animation duration naturally shorter due to reduced travel distance

**Files Modified:**
- `query-simple/src/runtime/query-result-item.tsx`: Updated `initialY` from `-2.0` to `-1.2` in both animation loops
- `query-simple/src/version.ts`: Incremented to `r022.109`

---

## [1.19.0-r022.108] - 2026-01-25 - FEATURE: Animated Spring Drop for Hover Preview Pin

### Added
- **Google Maps-Style Drop Animation**: Hover preview pin now animates with spring physics when appearing
  - **Starting Position**: Pin suspended at `y: -2.0` (relative anchor point)
  - **Final Position**: Settles at `y: -0.5` (current resting tip position)
  - **Physics**: Spring simulation with stiffness `0.15` and damping `0.8`
  - **Animation**: Smooth bounce effect using `requestAnimationFrame`

### Technical Details
**Implementation:**
- Added `animationRef` useRef to track `requestAnimationFrame` ID for proper cleanup
- Created spring physics loop with force and velocity calculations
- Animation updates CIM symbol's `anchorPoint.y` property each frame
- Proper lifecycle management:
  - Animation cancelled on mouse leave
  - Animation cancelled on result item click
  - Animation cancelled on component unmount
  - Animation restarts when hovering different results (graphic reused)

**Code Structure:**
```typescript
// Spring physics loop
let currentY = initialY
let velocity = 0

const animate = (timestamp: number) => {
  // Spring physics calculation
  const force = (targetY - currentY) * 0.15  // Stiffness
  velocity = (velocity + force) * 0.8         // Damping
  currentY += velocity
  
  // Update graphic symbol anchor
  const newSymbol = currentSymbol.clone()
  newSymbol.data.symbol.symbolLayers[0].anchorPoint = { x: 0, y: currentY }
  hoverGraphicRef.current.symbol = newSymbol
  
  // Continue until settled
  if (Math.abs(velocity) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
    animationRef.current = requestAnimationFrame(animate)
  }
}
```

**Safety:**
- `cancelAnimationFrame()` called in:
  - `handleMouseLeave` (hide pin)
  - `handleClickResultItem` (hide pin on click)
  - `useEffect` cleanup (component unmount)
- Animation ID stored in `animationRef.current` for all cancellation points

**Files Modified:**
- `query-simple/src/runtime/query-result-item.tsx`: Added animation logic, refs, and cleanup
- `query-simple/src/version.ts`: Incremented to `r022.108`

**Debug Logging:**
- `HOVER-PREVIEW` events: `animation-complete`, `animation-update-error`
- Logs final Y position when animation settles

---

## [1.19.0-r022.107] - 2026-02-10 - FEATURE: Configurable Hover Preview Pin Color

### Added
- **Configurable Hover Pin Color**: Widget setting to customize the color of the hover preview pin
  - **New Setting**: "Hover Preview Pin" section with color picker in widget settings
  - **Default**: Yellow (#FFC107) - matches Google Maps style
  - **Feature**: Pin appears on map when hovering over result items in the list
  - **Auto-Generated Lighter Center**: Inner circle automatically rendered 20% lighter than selected color
  - **Config Property**: `hoverPinColor?: string`

### Changed
- **Settings UI Improvements**: Enhanced readability of description text
  - Removed low-contrast `text-secondary` class
  - Applied `opacity: 0.8` for better visibility while maintaining visual hierarchy
  - Fixed negative margin (`-8px` → `4px`) that caused text to clash with controls above

### Technical Details
**Implementation:**
- Added `hoverPinColor` config property with hex color string
- Created `hexToRgb()` helper function to convert hex to RGBA array for CIM symbols
- Threaded color prop through component hierarchy: `widget.tsx` → `QueryTaskList` → `QueryTask` → `QueryTaskResult` → `SimpleList` → `QueryResultItem`
- CIM symbol dynamically applies configured color:
  - **Base color**: Used for outer teardrop pin shape
  - **Lighter variant**: Calculated by multiplying RGB values by 1.2 (capped at 255)
- Updated debug logging to include actual color values used

**Code Structure:**
```typescript
// Convert hex to RGB for CIM symbol
function hexToRgb(hex: string, alpha: number = 230): [number, number, number, number] {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return [r, g, b, alpha]
}

// In handleMouseEnter callback
const baseColor = hexToRgb(hoverPinColor || '#FFC107', 230)
const lighterColor = [
  Math.min(255, Math.round(baseColor[0] * 1.2)),
  Math.min(255, Math.round(baseColor[1] * 1.2)),
  Math.min(255, Math.round(baseColor[2] * 1.2)),
  255
]
```

**Files Changed:**
- `config.ts`: Added `hoverPinColor?: string` property
- `setting/setting.tsx`: Added "Hover Preview Pin" section with ThemeColorPicker, improved text contrast
- `setting/translations/default.ts`: Added i18n strings for hover pin color
- `query-result-item.tsx`: Added `hexToRgb()` helper, dynamic color application in CIM symbol
- `simple-list.tsx`: Added `hoverPinColor` prop
- `query-result.tsx`: Added `hoverPinColor` prop
- `query-task.tsx`: Added `hoverPinColor` prop
- `query-task-list.tsx`: Added `hoverPinColor` prop
- `widget.tsx`: Passed `config.hoverPinColor` to QueryTaskList components
- `version.ts`: Incremented to r022.107

**Testing:**
1. Open widget settings → "Hover Preview Pin" section
2. Select different colors (red, blue, green, etc.)
3. Hover over result items to see pin in new color
4. Verify center circle is lighter shade of selected color
5. Verify description text is readable with proper spacing

**Memory Safety:**
- Single Graphic object per result item (reused across hovers) ✅
- Point geometry objects properly replaced and garbage collected ✅
- No object accumulation ✅

## [1.19.0-r022.105] - 2026-02-09 - FEATURE: Configurable Zoom on Result Click

### Added
- **Configurable Zoom Behavior**: Widget setting to control zoom behavior when clicking results in the panel
  - **New Setting**: "Zoom to record when clicked" toggle in "Result Click Behavior" section
  - **Default**: Enabled (maintains current behavior)
  - **When Enabled**: Click result → Zoom to record → Open popup
  - **When Disabled**: Click result → Open popup only (no zoom)
  - **Use Case**: Allows users to disable zoom for workflows where automatic zooming is disruptive
  - **Config Property**: `zoomOnResultClick?: boolean`

### Technical Details
**Implementation:**
- Added `zoomOnResultClick` config property (defaults to `true` for backward compatibility)
- New settings UI section: "Result Click Behavior" with Switch control
- Extracted `openPopupForRecord()` helper function to eliminate code duplication
- Conditional zoom logic in `toggleSelection()` callback
- Props threading: `widget.tsx` → `QueryTaskList` → `QueryTask` → `QueryTaskResult`

**Code Structure:**
```typescript
// In query-result.tsx
const openPopupForRecord = React.useCallback((data: FeatureDataRecord) => {
  // Calculate popup location using labelPointOperator
  // Open popup at calculated location
}, [mapView])

const toggleSelection = React.useCallback((data: FeatureDataRecord) => {
  const shouldZoom = zoomOnResultClick !== false
  
  if (shouldZoom) {
    zoomToRecords([data]).then(() => openPopupForRecord(data))
  } else {
    openPopupForRecord(data) // Popup only, no zoom
  }
}, [zoomOnResultClick, openPopupForRecord])
```

**Files Changed:**
- `config.ts`: Added `zoomOnResultClick?: boolean` property
- `setting/setting.tsx`: Added "Result Click Behavior" section with Switch
- `setting/translations/default.ts`: Added i18n strings
- `query-result.tsx`: Extracted helper, conditional zoom logic
- `query-task.tsx`: Pass prop through
- `query-task-list.tsx`: Pass prop through
- `widget.tsx`: Pass `config.zoomOnResultClick` to components
- `version.ts`: Incremented to r022.105

**Benefits:**
- ✅ Backward compatible (defaults to current behavior)
- ✅ User choice for different workflow needs
- ✅ Popup always opens regardless of zoom setting
- ✅ Clean separation of zoom and popup logic
- ✅ Reuses labelPoint calculation for popup location

### Changed
- Refactored popup opening logic into dedicated `openPopupForRecord()` helper function

## [1.19.0-r022.104] - 2026-02-08 - FIX: Un-Minimize Triggering Open Logic

### Fixed
- **Un-Minimize Triggering Restoration**: Fixed widget un-minimize triggering open/restoration logic unnecessarily
  - **Bug**: Un-minimizing widget ran restoration logic via DOM visibility detection, even though widget was already open (`props.state` stayed `'OPENED'`)
  - **Manifestation**: Visible as duplicate restoration events and unnecessary re-execution of open logic
  - **Root Cause**: IntersectionObserver detected DOM visibility change (minimize → un-minimize) and fired `onVisibilityStateChange(true)`
  - **Solution**: Track first open with `hasOpenedOnce` flag - use DOM detection only for first open, rely on `props.state` thereafter

### Technical Details
**Widget Open Detection Strategy (r022.104):**

**Problem:**
- r022.77 fixed minimize/close distinction using `props.state`
- But DOM visibility detection (IntersectionObserver) was still firing on un-minimize
- Un-minimize makes widget DOM visible again → triggers open logic → unnecessary restoration

**Solution - Hybrid Approach:**
1. **First Open**: Use DOM visibility detection (IntersectionObserver/periodic check)
   - Reason: ExB doesn't immediately populate `props.state` on initial mount
   - Reliable detection of initial widget open
2. **After First Open**: Use only `props.state` transitions in `componentDidUpdate`
   - Minimize: `props.state` stays `'OPENED'` → no action
   - Un-minimize: `props.state` stays `'OPENED'` → no action (DOM visibility change ignored)
   - Close then re-open: `props.state` changes `'CLOSED'` → `'OPENED'` → restoration

**Implementation:**
```typescript
// In WidgetVisibilityManager
private hasOpenedOnce: boolean = false

// In IntersectionObserver callback
if (isVisible) {
  if (!this.hasOpenedOnce) {
    // First open - use DOM detection
    this.hasOpenedOnce = true
    this.logVisibilityChange(isVisible, 'IntersectionObserver', id, callbacks)
    onVisibilityStateChange(isVisible)
  } else {
    // Already opened once - ignore DOM visibility (un-minimize)
    // Log but don't trigger open logic
  }
}
```

**Logic Flow:**
```
First widget open (CLOSED → DOM visible):
  ↓
  hasOpenedOnce = false → Use DOM detection ✅
  ↓ Trigger restoration
  ↓ Set hasOpenedOnce = true

User minimizes:
  ↓ props.state stays 'OPENED' → No action ✅

User un-minimizes:
  ↓ DOM becomes visible → hasOpenedOnce = true → Ignore DOM ✅
  ↓ props.state still 'OPENED' → No action ✅

User closes then re-opens:
  ↓ props.state: 'CLOSED' → 'OPENED'
  ↓ componentDidUpdate detects transition ✅
  ↓ Trigger restoration
```

**Enhanced Logging:**
- `first-open-detected` - Initial widget open via DOM detection
- `panel-visible-ignored` - Un-minimize ignored (already opened once)

**Impact:**
- ✅ First open: DOM detection works correctly (ExB state not yet available)
- ✅ Minimize: No action (props.state stays `'OPENED'`)
- ✅ Un-minimize: No action (DOM visibility ignored after first open)
- ✅ Close then re-open: `props.state` transition handles correctly
- ✅ No duplicate restoration on un-minimize
- ✅ Cleaner logs (no spurious open events)

**Files Modified:**
- `query-simple/src/runtime/hooks/use-widget-visibility.ts` - Add `hasOpenedOnce` flag, conditional DOM detection
- `query-simple/src/version.ts` - r022.103 → r022.104

**Testing:**
- ✅ First widget open triggers restoration (DOM detection)
- ✅ Minimize → Un-minimize: No duplicate restoration
- ✅ Close → Re-open: Restoration triggered correctly (props.state)
- ✅ Multiple minimize/un-minimize cycles: No spurious events

---

## [1.19.0-r022.87] - 2026-02-07 - Infrastructure: Namespace Migration Complete

### Changed
- **Shared Code Namespace Migration**: Renamed `shared-code/common` to `shared-code/mapsimple-common` to prevent module conflicts in multi-vendor deployments
  - **Why**: Generic `common` namespace risked collision with other custom widgets in shared ExB runtime
  - **Strategy**: Incremental side-by-side migration - both old and new paths coexisted during transition
  - **Result**: 47 files migrated across 8 groups with zero regressions detected

### Technical Details
**Migration Approach:**
- Phase 1 (r022.78): Created `shared-code/mapsimple-common/` alongside existing `common/`, dual barrel exports
- Phase 2 (r022.79-86): Migrated imports incrementally - core runtime → forms → hooks → settings → data actions
- Phase 3 (r022.87): Removed old `shared-code/common/` folder after all references migrated

**Files Updated:**
- All query-simple imports (35 files)
- All helper-simple imports (1 file)
- Preserved chunks (2 files)
- Unit tests included in distribution

**Impact:**
- ✅ Collision-proof namespace ensures safe deployment in any environment
- ✅ No breaking changes for existing implementations (handled internally)
- ✅ Foundation established for public distribution and multi-vendor compatibility
- ✅ Full test coverage maintained throughout 10-commit migration process

**Files Modified:**
- `shared-code/mapsimple-common/` - New namespace directory (all modules)
- `shared-code/mapsimple-common.ts` - New barrel export file
- `query-simple/src/**/*.tsx` - Updated imports (35 files)
- `helper-simple/src/runtime/widget.tsx` - Updated imports
- `preserved/r018-chunks/**/*.ts` - Updated imports

**Testing:**
- User tested after each group (8 test cycles)
- Zero regressions detected
- Clean compilation verified after each commit

---

## [1.19.0-r022.77] - 2026-02-05 - CRITICAL FIX: Widget Minimize vs Close Detection

### Fixed
- **Widget Minimize Incorrectly Clearing Selections**: Fixed widget minimize triggering close logic which cleared selections from map
  - **Bug**: Minimizing widget cleared selections; users expected minimize to preserve selections (visual collapse)
  - **Root Cause**: DOM visibility detection (IntersectionObserver) couldn't distinguish minimize from close
  - **Solution**: Now uses Experience Builder's `props.state` property (`'OPENED'` vs `'CLOSED'`)

- **Cross-Layer Selection Count**: Fixed high-priority bug where adding records from multiple layers showed incorrect selection counts
  - **Bug**: Selection counts wrong when accumulating from different layers (e.g., 6 selected instead of 4)
  - **Root Cause**: All record IDs selected on current query's single origin data source, causing cross-layer pollution
  - **Solution**: Records grouped by `__queryConfigId` and selected on correct origin data sources

### Technical Details
**Minimize/Close Detection (r022.77):**
- **Old Behavior**: IntersectionObserver detected both minimize and close as "hidden" → triggered clear
- **New Behavior**: 
  - Close detection: `props.state` transitions from `'OPENED'` to `'CLOSED'`
  - Minimize: `props.state` stays `'OPENED'` → no state change → selections preserved
  - Open detection: IntersectionObserver still handles correctly

**Cross-Layer Selection (r022.71-74):**
- Intelligent Selection Check: useEffect detects when records already correctly selected
- Cross-Layer Grouping: Records grouped by `__queryConfigId`, selected on correct origin DS
- Remove Mode Fix: Composite key matching looks up `__queryConfigId` from accumulated records

**Impact:**
- ✅ Minimize preserves selections (bug fixed)
- ✅ Maximize shows selections still there
- ✅ Close still clears selections correctly
- ✅ Open still restores selections correctly
- ✅ HelperSimple receives accurate widget state events
- ✅ Selection counts accurate across all layer combinations
- ✅ Graphics display correctly in all modes
- ✅ Remove mode works properly (via query execution or X button)

**Files Modified:**
- `query-simple/src/runtime/hooks/use-widget-visibility.ts` - Added `props.state` detection
- `query-simple/src/runtime/query-result.tsx` - Cross-layer selection logic
- `query-simple/src/runtime/selection-utils.ts` - Grouped selection by configId
- `query-simple/src/version.ts` - r022.76 → r022.77

---

## [1.19.0-r022.35] - 2026-02-03 - FIX: Graphics Fill Missing (Outline Only)

### Fixed
- **Graphics Rendering Independence**: Hardcoded widget-specific symbology to prevent external widgets from affecting graphics rendering
  - **Bug**: Advanced Draw widget sets `mapView.highlightOptions.fillOpacity = 0`, causing QuerySimple graphics to render without fill (outline only)
  - **Reproduction**: Select item → Close widget → Open Draw widget → Reopen QuerySimple → Graphics have no fill
  - **Solution**: Replaced runtime `highlightOptions` lookup with hardcoded constants

### Technical Details
**Root Cause:**
- `getDefaultHighlightSymbol()` was reading `mapView.highlightOptions.fillOpacity` at runtime
- Advanced Draw widget modifies `fillOpacity` to `0` for its sketch graphics
- QuerySimple graphics created after Draw opens inherit `fillOpacity = 0`
- Result: Fill color becomes `[0, 255, 255, 0]` (fully transparent)

**Fix (r022.35):**
Added `QUERYSIMPLE_HIGHLIGHT_SYMBOLOGY` constants:
```typescript
const QUERYSIMPLE_HIGHLIGHT_SYMBOLOGY = {
  color: [0, 255, 255],      // Cyan
  fillOpacity: 0.25,         // 25% transparent fill
  outlineOpacity: 1.0,       // 100% opaque outline
  lineOpacity: 1.0,          // 100% opaque lines
  outlineWidth: 2,
  lineWidth: 4,
  markerSize: 12
}
```

Modified `getDefaultHighlightSymbol()` to use constants instead of `mapView.highlightOptions`.

**Impact:**
- ✅ Graphics always render with fill regardless of external widget state
- ✅ Widget independence - no external dependencies
- ✅ Consistent symbology across all operations
- ✅ Future-ready - constants can be exposed as widget settings

**Files Modified:**
- `query-simple/src/runtime/graphics-layer-utils.ts` - Hardcoded symbology constants
- `query-simple/src/version.ts` - r022.34 → r022.35

**Investigation:**
- r022.34: Added diagnostic logging to capture `highlightOptions` values
- User confirmed reproduction: Advanced Draw widget was the culprit

**Documentation:**
- Complete bug report: `docs/bugs/BUG-GRAPHICS-FILL-MISSING.md`

---

## [1.19.0-r022.33] - 2026-02-03 - FIX: Cross-Layer X Button Removal

### Fixed
- **CRITICAL: Cross-Layer Record Removal**: Fixed bug where removing a record via X button failed to clear the selection from its origin data source when the record was added from a different query layer
  - **Bug Scenario**: Hash query (Parcels) → Add mode → Switch to Parks query → Add Park record → Remove original Parcel record
  - **Symptom**: Record removed from UI and graphics, but selection remained in Parcels layer (invisible desync)
  - **Root Cause**: Removal utility used `record.getDataSource()` method which returns `null` for accumulated records, falling back to current query's origin DS (Parks instead of Parcels)
  - **Fix**: Changed to use `record.dataSource` property which persists correctly through accumulation

### Technical Details
**Investigation:**
- r022.31: Enhanced diagnostic logging added (6 new log events)
- r022.32: Fixed undefined variable in diagnostic logging
- r022.33: Implemented 1-line fix using `.dataSource` property

**File Changed:**
- `results-management-utils.ts` (line 442): `record.getDataSource?.()` → `(record as any).dataSource`

**Why It Works:**
- `.getDataSource()` method returns `null` for records in accumulated state
- `.dataSource` property persists on record object through merging/state updates
- Pattern already proven in X button handler (`query-result.tsx`)

**Impact:**
- ✅ Cross-layer removals now clear selection from correct origin layer
- ✅ No more "ghost selections" on widget close/reopen
- ✅ Simple fix (1 line) vs. complex stamping approach (multi-file changes)
- ✅ Uses existing proven pattern
- ✅ Diagnostic logging preserved for future debugging

**Documentation:**
- Complete bug report: `docs/bugs/BUG-CROSS-LAYER-X-BUTTON-REMOVAL.md`
- Root cause analysis, fix implementation, testing protocol documented

---

## [1.19.0-r022.30] - 2026-02-01 - FIX: Graphics Flash on Query Switch

### Fixed
- **CRITICAL: Graphics Layer Flash in Add/Remove Mode**: When switching queries in Add or Remove mode with accumulated results visible, graphics would briefly disappear and reappear, causing visual flash

---

## [1.19.0-r022.27] - 2026-02-01 - Orphaned Code Cleanup

### Removed
- **Dead Code Cleanup (87 lines)**: Removed all `useGraphicsLayerForHighlight` references
  - Config property was disabled in earlier version but code paths remained
  - 63 references across 10 files checking a config option users couldn't set
  - Surgical removal on dedicated feature branch

### Implementation Details
**Branch:** `feature/remove-graphics-layer-orphaned-code`

**Files Modified (10):**
1. `config.ts` - Removed property from interface
2. `setting/setting.tsx` - Removed UI labels
3. `setting/translations/default.ts` - Removed i18n strings
4. `runtime/widget.tsx` - Removed conditionals, prop passing, logging
5. `runtime/query-task.tsx` - Removed from props and conditionals
6. `runtime/query-result.tsx` - Removed from props and selection calls
7. `runtime/query-task-list.tsx` - Removed from props
8. `data-actions/zoom-to-action.tsx` - Removed bug logging
9. `runtime/hooks/use-selection-restoration.ts` - Removed from dependencies
10. `runtime/hooks/use-graphics-layer.ts` - Removed from initialization

**Impact:**
- ✅ 63 orphaned references removed
- ✅ 87 net lines deleted
- ✅ Cleaner architecture
- ✅ No dead code paths to maintain
- ✅ Build successful, all functionality working

### Related
- TODO Section 3a: Remove Non-Graphics Layer Implementation (Complete)

### Root Cause
During query switches in Add/Remove mode, three unnecessary operations were occurring:
1. Graphics layer was being cleared via `onClearGraphicsLayer()`
2. Graphics were being cleared and re-added via `selectRecordsAndPublish(useGraphicsLayer: true)`
3. Accumulated records sync logic was incorrectly purging records

These operations were unnecessary because:
- Graphics already correctly reflected `accumulatedRecords` 
- Only output DS selection needed updating for Results panel
- Sync logic is only for manual deletions (X buttons), not query switches

### Solution (r022.30)
Three surgical fixes in `query-task.tsx`:

1. **Skip clearing graphics layer** (line 957)
   - Removed `onClearGraphicsLayer()` call in Add/Remove mode during query switch
   - Graphics already match `accumulatedRecords` - no need to clear

2. **Update output DS without touching graphics** (line 1044)
   - Changed `selectRecordsAndPublish(useGraphicsLayer: true)` → `useGraphicsLayer: false`
   - Updates output DS selection (fixes Results panel)
   - Skips all graphics operations (eliminates flash)

3. **Skip sync logic during query switches** (line 1374)
   - Commented out `onAccumulatedRecordsChange(syncedRecords)` during query switches
   - Sync only needed for manual deletions (X button clicks)
   - Prevents incorrect purging of accumulated records

### Impact
- ✅ Zero graphics flash when switching queries in Add/Remove mode
- ✅ Results panel stays perfectly in sync with accumulated records
- ✅ Manual deletions (X buttons) continue working correctly
- ✅ Performance improvement (eliminated unnecessary clear/re-add cycles)

### Testing
Verified across multiple scenarios:
- Query switches between 3 different queries with 2-122 accumulated records
- Add mode: Smooth transitions, no flash, correct counts
- Remove mode: Smooth transitions, no flash, correct counts
- Manual deletions: Graphics removed correctly, counts update properly
- Results panel: Always shows correct accumulated records

### Files Modified
- `query-simple/src/runtime/query-task.tsx` (3 surgical fixes)
- `query-simple/src/version.ts` (r022.28 → r022.30)

### Investigation Path
- r022.28: Surgically commented out `onClearGraphicsLayer()` and `selectRecordsAndPublish()` → graphics fixed, Results broken
- r022.29: Changed approach to call `selectRecordsAndPublish(useGraphicsLayer: false)` → both fixed
- r022.30: Cleaned up test comments, production-ready code

---

## [1.19.0-r022.14] - 2026-01-30 - No-Results Popover Complete

### Added
- **UX Enhancement**: Calcite Popover appears when query returns zero results
- **User Feedback**: Clear messaging for empty query results with dismissible popover
- **Smart Detection**: Automatically triggers on zero-result queries and reappears on each occurrence

### Implementation Summary (r022.3-r022.14)
**Iterative refinement for optimal placement and behavior:**

- **r022.3-r022.8**: Initial Alert → Popover switch, width/positioning iterations, timestamp-based re-triggering
- **r022.9**: Added `key={timestamp}` to force React remount on each zero-result query
- **r022.10-r022.12**: Anchor height experiments (80px → 1px) with `flipDisabled` for control
- **r022.13**: Added `overlayPositioning="fixed"` for stable viewport-relative positioning
- **r022.14**: Removed anchor margin for tighter placement

**Final Configuration:**
```tsx
<calcite-popover 
  key={`no-results-${noResultsAlert.timestamp}`}  // Force remount
  referenceElement="query-feedback-anchor"         // Minimal 1px anchor
  placement="bottom"                                // Below content
  flipDisabled={true}                               // No auto-flip
  overlayPositioning="fixed"                        // Viewport-relative
  autoClose                                         // Dismissible
  closable                                          // X button
  open={noResultsAlert.show}
/>
```

**User Experience:**
- Query with no results → Popover appears immediately below form
- Displays record count requested and query value
- Dismissible via X button or click outside
- Reappears on each new zero-result query (not sticky)
- 320px max width, constrains to panel width

### Technical Details
- State management: `noResultsAlert` with `timestamp` for unique keys
- Detection: Query execution callback checks `queryResultCount === 0`
- i18n strings: `noResultsAlertLabel`, `noResultsAlertTitle`, `noResultsAlertMessage`
- Component: Integrated into `QueryTabContent.tsx`

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Detection logic, state management
- `query-simple/src/runtime/tabs/QueryTabContent.tsx` - Popover component integration
- `query-simple/src/runtime/translations/default.ts` - i18n strings
- `query-simple/src/version.ts` - Bumped to r022.14

### Related
- TODO Section 2c: UX Enhancements - Results Mode Feedback (Complete)
- 12 iterations (r022.3-r022.14) to refine placement and behavior

---

## [1.19.0-r022.2] - 2026-01-30 - Complete lastSelection Removal

### Removed
- **Dead Code Cleanup (126+ lines)**: Completed r021.110 intent by removing all unused lastSelection code
  - Removed `restoreLastSelection()` method (~70 lines)
  - Removed `clearLastSelection()` method (~60 lines)
  - Removed `lastSelection` from `SelectionRestorationState` interface
  - Removed `lastSelection` assignment in `handleSelectionChange`
  - Removed `lastSelection` from all logs and fallback conditions
  - Updated JSDoc comments to reflect r022.2 cleanup

### Why Safe to Remove
- r022.1 made `accumulatedRecords` the universal restoration source for ALL modes
- `restoreLastSelection()` and `clearLastSelection()` methods never called after r022.1
- `lastSelection` state was never updated when records removed (source of r021.108 bug)
- All functionality now uses `accumulatedRecords` (reflects removals correctly)

### Impact
- ✅ 180 lines of dead/risky fallback code removed
- ✅ Simpler architecture - one source of truth (`accumulatedRecords`)
- ✅ Widget bundle size reduced: 2.31 MiB → 2.29 MiB
- ✅ Zero functional changes (r022.1 already fixed behavior)

### Files Modified
- `query-simple/src/runtime/hooks/use-selection-restoration.ts` - Removed lastSelection state, methods, logs
- `query-simple/src/runtime/hooks/use-event-handling.ts` - Updated JSDoc comments
- `query-simple/src/version.ts` - Bumped to r022.2

### Related
- r022.1: Functional fix (restoration priority)
- r021.110: Original cleanup intent (never implemented in source)

---

## [1.19.0-r022.1] - 2026-01-30 - FIX: Zombie Graphics on Widget Reopen

### Fixed
- **CRITICAL: Removed Records Reappear After Close/Reopen**: In NEW mode, when records were removed and the widget was closed/reopened, the removed records would reappear as graphics on the map (but correctly excluded from Results panel).

### Root Cause
- Restoration logic used `lastSelection` (stale, 121 records) for NEW mode instead of `accumulatedRecords` (current, 118 records)
- `lastSelection` was never updated when records removed via X button
- `accumulatedRecords` correctly reflected removals (121 → 118)
- Result: Close/reopen restored all 121 graphics, including 3 removed "zombies"

### Log Evidence
```json
"panel-closed-cleared-origin-ds" recordCount: 118 ✅
"panel-opened-restoring-lastSelection" recordIdsCount: 121 ❌
"addHighlightGraphics-complete" addedCount: 121 ❌ (should be 118)
```

### Solution
- Changed restoration condition from `isAccumulationMode && accumulatedRecords` to just `accumulatedRecords`
- Now uses `accumulatedRecords` for **ALL modes** (New/Add/Remove), not just Add/Remove
- `lastSelection` only as emergency fallback (should never happen)
- `accumulatedRecords` is universal source of truth (reflects removals in NEW mode)

### Why This Was Missed
- r021.110 documented `lastSelection` removal in CHANGELOG
- Fix was implemented, built (r021.128.js), deployed, and tested by team
- But source code change (.ts files) never committed to git
- Bug rediscovered during r022.0 edge case testing

### Impact
- ✅ Removed records stay removed after close/reopen
- ✅ Works correctly in all modes (NEW, ADD, REMOVE)
- ✅ Closes r021.108 functional gap that was documented but not in source

### Files Modified
- `query-simple/src/runtime/hooks/use-selection-restoration.ts` - Changed restoration condition (line 274), added r022.1 comment and fallback warning log
- `query-simple/src/version.ts` - Bumped to r022.1

### Testing
Reproduce bug scenario:
1. Query 121 records (NEW mode)
2. Remove 3 records → 118 in panel ✅
3. Close widget → Graphics clear ✅
4. Open widget → Should restore 118, NOT 121 ✅

---

## [1.19.0-r022.0] - 2026-01-30 - Tab Extraction: Query Tab → QueryTabContent.tsx

### Changed
- **Architectural Refactor**: Extracted Query tab content into separate component to prepare for Graphics tab addition
  - Created `query-simple/src/runtime/tabs/QueryTabContent.tsx` (598 lines)
  - Reduced `query-simple/src/runtime/query-task.tsx` from 3456 → 2982 lines (474 lines removed, 13.7% reduction)
  - Positioned for Graphics tab addition without creating 4000+ line "god component"

### What Moved to QueryTabContent.tsx
- Results Mode button group (New/Add/Remove selection modes)
- Form wrapper and QueryTaskForm component
- DataSourceTip component
- All Query tab-specific UI and logic

### What Stayed in query-task.tsx (Shared by All Tabs)
- Header (back button, query label, hash info, Clear Results button)
- Search Layer dropdown (+ Search Alias when grouped)
- Tab bar and orchestration
- Query execution logic

### Architecture
```
query-task.tsx (2982 lines - orchestration + shared UI)
├─ tabs/QueryTabContent.tsx (598 lines - Query tab)
├─ tabs/ResultsTabContent.tsx (query-result.tsx - Results tab)
└─ tabs/GraphicsTabContent.tsx (FUTURE)
```

### Approach
- **Pure code relocation** - No behavior changes, no new hooks
- **Minimal approach** - Kept Query tab logic consolidated in one component (no over-normalization)
- **Props-based** - QueryTabContent receives all needed state/callbacks from parent

### Impact
- ✅ `query-task.tsx` manageable size (under 3000 lines)
- ✅ Ready for Graphics tab addition
- ✅ Each tab independently readable
- ✅ Zero functional changes (pure relocation)
- ✅ Build successful, no linter errors

### Files Modified
- `query-simple/src/runtime/tabs/QueryTabContent.tsx` (NEW) - 598 lines
- `query-simple/src/runtime/query-task.tsx` - Reduced 474 lines, imports QueryTabContent
- `query-simple/src/version.ts` - Bumped to r022.0

### Documentation
- Implementation plan: `docs/development/TAB_EXTRACTION_IMPLEMENTATION_PLAN.md`
- TODO updated: Section 2b marked Phase 1 complete

---

