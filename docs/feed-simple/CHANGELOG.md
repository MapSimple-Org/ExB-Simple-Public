# FeedSimple Changelog

All notable changes to the FeedSimple widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.19.0-r004.002] - 2026-03-19 - Markdown Table Support (Phase 2)

### Added
- **Markdown table rendering**: Card and popup templates now render pipe-delimited markdown tables as styled HTML `<table>` elements with borders, header styling, and text alignment support.
- **Table Builder in settings**: New "Insert table" toggle button in the Card Template section. Opens an inline grid editor (`TableBuilder` from shared-code) to visually build tables — generates pipe-delimited markdown and inserts at cursor position.
- **Tables help section**: Added "Tables" section to the expandable template syntax reference panel showing header row, separator, data rows, and alignment syntax.

---

## [1.19.0-r004.001] - 2026-03-18 - Shared Markdown Engine

### Changed
- **Shared markdown engine**: Extracted `convertTemplateToHtml()` and `applyInlineFormatting()` from `feed-simple/src/utils/markdown-template-utils.ts` to `shared-code/mapsimple-common/markdown-template-utils.ts`. Local file is now a thin wrapper that re-exports the shared converter and keeps FS-specific `renderPreview()` and `extractFieldTokens()` (double-brace `{{field}}` token regex with filter support).
- **First shared-code dependency**: FeedSimple now imports from `shared-code/mapsimple-common` — installation requires copying both `feed-simple/` and `shared-code/` folders.
- **Tests reorganized**: `convertTemplateToHtml` tests moved to `shared-code/mapsimple-common/tests/`. FS test file now covers only `renderPreview` and `extractFieldTokens`.

---

## [1.19.0-r003.010] - 2026-03-16 - Setting Dedup, State Mutation Fix, Cache Key Fix

### Changed

- **Typed generic `setConfigValue`** (r003.010): Replaced 15+ inline `onSettingChange` handlers in setting.tsx with a single type-safe generic method `setConfigValue<K extends keyof FeedSimpleConfig>(key, value)`.
- **`renderFieldCheckboxList` helper** (r003.010): Extracted duplicate checkbox-list rendering for `sortableFields`, `searchFields`, and `exportFields` into a shared helper method — removed ~90 lines of duplication.
- **Hoisted setting CSS** (r003.010): Moved `monoTextareaCss`, `monoTextareaLgCss`, and field checkbox styling to module-level constants — eliminates re-creation per render.
- **Removed `as any` on range break fields** (r003.010): Replaced 3 `as any` casts on `onUpdateRangeBreak` calls for `mapColor`, `size`, and `markerStyle` with properly typed string values.

### Fixed

- **React state mutation** (r003.010): Fixed `componentDidUpdate` enrichment path that mutated `this.state.items` in place via `enrichItemsWithRangeLabels()`. Now clones items before enrichment and uses `setState` to update — correct React immutable state pattern.
- **Pipeline cache key** (r003.010): Fixed `getProcessedItems()` cache invalidation for ImmutableObject arrays (`filterByStatus`, `searchFields`). Previously used `.join('|')` which could produce unreliable `[object Object]` strings. Now uses separate reference equality checks alongside the string cache key.

## [1.19.0-r003.009] - 2026-03-16 - Quick Wins: MOBILE_BREAKPOINT_PX in CSS, onClick Signature, Search Pre-compute

### Changed

- **`MOBILE_BREAKPOINT_PX` in CSS** (r003.009): Replaced 2 hardcoded `@media (max-width: 600px)` strings in feed-card.tsx with `${MOBILE_BREAKPOINT_PX}px` template literals.
- **Widened `onClick` signature** (r003.009): Changed FeedCard's `onClick` prop from `React.MouseEvent` to `React.MouseEvent | React.KeyboardEvent`, eliminating the `as any` cast on keyboard event forwarding.
- **Pre-computed `Object.keys` in search** (r003.009): Moved `Object.keys(items[0])` outside the per-item filter loop in `searchItems()` — avoids redundant key enumeration on every item.

## [1.19.0-r003.008] - 2026-03-16 - Render-Path Allocation Optimization

### Changed

- **Pre-computed `toArray()` calls** (r003.008): Restructured widget.tsx render IIFE to call `toArray()` for `rangeColorBreaks` and `sortableFields` once before the card `.map()` loop — eliminates N array allocations per render.
- **Hoisted raw-field CSS** (r003.008): Moved 6 inline CSS objects for raw field rendering in feed-card.tsx (`rawFieldsContainerCss`, `rawFieldItemCss`, `rawFieldKeyCss`, `rawFieldValueCss`, `rawFieldKeySmallCss`, `expandedFieldItemCss`) to module-level constants.

## [1.19.0-r003.007] - 2026-03-16 - Dead Code Removal

### Removed

- **Deprecated shims** (r003.007): Removed `zoomToFeedPoint()` and `panToFeedPoint()` deprecated wrapper functions from feed-layer-manager.ts (17 lines) — superseded by `navigateToFeedPoint(mode)` in r003.004.
- **Deprecated factory** (r003.007): Removed `createFeedSimpleDebugLogger()` factory function from debug-logger.ts — superseded by singleton `debugLogger` export in r003.001.
- **Unused CSS variables** (r003.007): Removed 3 unused module-level CSS variables (`responsiveDesktopCss`, `responsiveMobileCss`, `responsiveMobileFlexCss`) from feed-card.tsx — orphaned after responsive rendering refactor.

## [1.19.0-r003.006] - 2026-03-16 - Polish: CSS Hoisting, Dead Code Cleanup

### Changed

- **CSS hoisting** (r003.006): Moved inline style objects to module-level constants across widget, feed-card, and feed-legend components — eliminates re-creation on every render.
- **Type narrowing** (r003.006): Replaced broad type annotations with precise narrowed types throughout utility functions.
- **Regex pre-compilation** (r003.006): Moved regex literals used in hot paths to module-level compiled constants.

### Removed

- **Dead code cleanup** (r003.006): Removed unreachable branches, unused variables, and obsolete commented-out code across multiple files.

## [1.19.0-r003.005] - 2026-03-16 - Performance: Pipeline Memoization, Diff-Based Sync

### Changed

- **Pipeline memoization** (r003.005): Memoized `runPipeline` results to avoid redundant processing when inputs haven't changed.
- **Diff-based feed layer sync** (r003.005): Feed layer sync now computes a diff of added/removed/updated features instead of full replace — reduces `applyEdits` overhead on large feeds.
- **Sort optimization** (r003.005): Optimized sort comparator to reduce redundant type coercions during array sorting.

## [1.19.0-r003.004] - 2026-03-16 - Widget Method Dedup, Setting Handler Cleanup

### Changed

- **Widget method deduplication** (r003.004): Consolidated duplicated logic in widget.tsx lifecycle and event handler methods.
- **Setting handler cleanup** (r003.004): Extracted repeated setting update patterns into reusable handler functions in setting.tsx.

## [1.19.0-r003.003] - 2026-03-16 - Utility Deduplication

### Changed

- **Utility deduplication** (r003.003): Identified and consolidated duplicated helper functions across utility files (token-renderer, feed-pipeline, map-interaction).

## [1.19.0-r003.002] - 2026-03-16 - Type Safety, Immutable Helpers

### Added

- **`immutable-helpers.ts`** (r003.002): New utility module with convenience wrappers for Immutable.js config updates in settings — reduces boilerplate and improves type safety.

### Changed

- **Type safety improvements** (r003.002): Added explicit type annotations and narrowed generic types across utility and settings files.

## [1.19.0-r003.001] - 2026-03-16 - Type Safety, Constants, Singleton Debug Logger

### Added

- **`constants.ts`** (r003.001): New shared constants file extracting magic strings, numeric thresholds, and sentinel values from widget and utility code.
- **Singleton debug logger** (r003.001): Converted DebugLogger to a singleton pattern — all modules share one instance, eliminating duplicate URL parsing and ensuring consistent debug tag state.

### Changed

- **Type safety sweep** (r003.001): Added strict type annotations to function parameters and return types across widget, settings, and utility files.

## [1.19.0-r002.047] - 2026-03-16 - Color Legend

### Added

- **Collapsible color legend** (r002.047): New `ColorLegend` component (`feed-legend.tsx`) renders a thin color key bar between FeedControls and the card list. Shows color swatches with labels for both exact-match and range color modes. Collapsed by default (inline swatches); click chevron to expand for detail view with range bounds. Admin-togglable via `showColorLegend` config field (defaults to on when `statusField` is set).

## [1.19.0-r002.046] - 2026-03-15 - iOS Auto-Zoom Breakpoint Update

### Changed

- **iOS auto-zoom breakpoint** (r002.046): Widened `@media (max-width: 600px)` to `@media (max-width: 1024px)` in `feed-controls.tsx` for both search input and sort select. Covers iPadOS tablets which have the same Safari auto-zoom behavior as phones.

## [1.19.0-r002.042] - 2026-03-14 - Mobile Popup Behavior

### Added

- **Mobile popup collapsed** (r002.042): New `mobilePopupCollapsed` config toggle. When enabled, popups open showing only the title bar on mobile viewports (≤ 600px). Users tap to expand. Uses JSAPI `popup.open({ collapsed: true })`.
- **Mobile popup dock position** (r002.042): New `mobilePopupDockPosition` config field. Pins the popup to `top-center` or `bottom-center` on mobile. When set, `dockEnabled` is forced to `true` and `dockOptions.position` is applied. Desktop behavior unchanged (JSAPI defaults restored at > 600px).
- **Hide dock button on mobile** (r002.042): New `mobilePopupHideDockButton` config toggle. When enabled alongside a dock position, removes the dock/undock toggle from the popup header on mobile so end users can't reposition it. Only shown in settings when dock position is explicitly set.
- **`applyMobilePopupBehavior` helper** (r002.042): Reusable function in `feed-layer-manager.ts` that sets dock state before `popup.open()` and restores JSAPI defaults on desktop-width viewports. Applied in `zoomToFeedPoint()`, `panToFeedPoint()`, and `identifyFeatureOnMap()`.

## [1.19.0-r002.041] - 2026-03-14 - Responsive Mobile Support, Kebab Menu

### Added

- **Mobile popup template** (r002.039): New `feedMapLayerPopupTemplateMobile` config field. When set, both desktop and mobile popup content are rendered and toggled via CSS `@media (max-width: 600px)` query. No JS viewport detection needed — browser handles switching dynamically on resize. Falls back to desktop popup template when empty.
- **Popup change detection** (r002.039): `feedMapLayerPopupTemplate`, `feedMapLayerPopupTemplateMobile`, and `feedMapLayerPopupTitle` now trigger feed layer recreation in `componentDidUpdate`. Previously, changing popup config required another config change (e.g., marker color) to take effect.
- **Mobile card template** (r002.041): New `cardTemplateMobile` config field. Renders both desktop and mobile card content within each `FeedCard`, toggled via CSS media query at 600px. Same `{{token}}` syntax. Falls back to desktop card template when empty.
- **Mobile toolbar position** (r002.041): New `toolbarPositionMobile` config field. Overrides card toolbar layout at ≤ 600px (Bottom / Right / Menu). When set, both desktop and mobile toolbar variants are rendered with CSS media query toggle. Empty = use desktop setting.
- **Popup mobile template cascade** (r002.041): When no explicit mobile popup template is set, popup falls back to `cardTemplateMobile` before the desktop popup template. Cascade: `feedMapLayerPopupTemplateMobile → cardTemplateMobile → desktop popup`.

### Changed

- **Hamburger → Kebab menu** (r002.040): Card toolbar "Menu" mode now uses a kebab icon (⋮ three vertical dots) instead of hamburger (☰). Industry standard per Material Design and Apple HIG — hamburger is for app-level navigation, kebab is for item-level actions.
- **jimu-ui Dropdown for menu toolbar** (r002.040): Replaced custom absolute-positioned dropdown with jimu-ui `Dropdown`/`DropdownButton`/`DropdownMenu`/`DropdownItem` components. Portal-based rendering (`appendToBody` default) eliminates clipping in scrollable card containers. Removed manual click-outside `useEffect` handler and `menuRef`.
- **Feed-card refactored for responsive rendering** (r002.041): Extracted `renderButtonToolbar()`, `renderKebabMenu()`, `renderToolbarForPosition()`, and `renderCardLayout()` helper functions. `renderCardLayout()` handles both simple (no mobile overrides) and responsive (dual-render with CSS media queries) paths.
- **Settings label update** (r002.040): Toolbar position "Menu" option renamed to "Menu (⋮)" with description updated to "kebab dropdown."

## [1.19.0-r002.036] - 2026-03-15 - ClassBreaksRenderer, UX Polish, Settings Overhaul

### Added

- **ClassBreaksRenderer for feed map layer** (r002.031): Range-based map symbology using JSAPI `ClassBreaksRenderer`. Each range break can have independent color, size, and marker style on the map. Status field declared as `type: 'double'` with `parseFloat` conversion in sync. Plain autocast objects for symbols (JSAPI `ClassBreakInfo` rejects pre-constructed instances).
- **Map symbol color override** (r002.031): `mapColor` field on `RangeColorBreak` — independent of card color for when card backgrounds need subtlety but map symbols need punch. Card color and map color stay synced until the user explicitly sets a different map color, then they become independent.
- **Global marker outline config** (r002.031): `feedMapLayerOutlineColor` and `feedMapLayerOutlineWidth` settings. Width 0 = no outline (`outline: null`). Applies to all markers (default, simple, and every class break).
- **Range break drag-and-drop reorder** (r002.032): Drag handle on each range break row for reordering via native HTML5 drag-and-drop. Replaces up/down arrow buttons.
- **Center on Card Click** (r002.033): New `enableCenterOnClick` toggle — pans map to feature without changing zoom level. Mutually exclusive with Zoom on Card Click (validation enforced in settings). Zoom toolbar button hidden only when Zoom on Click is enabled.
- **Numeric min/max filter** (r002.034): New `filterNumericMin` / `filterNumericMax` config for range color mode. Replaces checkbox-per-value with a numeric range filter. Items outside the configured bounds are excluded from cards and map. `applyNumericFilter()` added to pipeline between status filter and search.
- **Source attribution footer** (r002.034): Optional `sourceLabel` and `sourceUrl` config — renders a small footer below the card list with credit and link to the original data source.
- **Auto-discover fields on panel mount** (r002.035): Settings panel automatically runs field discovery when `feedUrl` is set and no fields are cached. Eliminates the broken-looking panel on reopen. Manual "Discover Fields" button remains as fallback.
- **Template syntax help on Popup Template** (r002.035): Same expandable help reference panel added below the popup template textarea.
- **Dynamic popup title** (r002.036): New `feedMapLayerPopupTitle` config with `{{token}}` substitution. Uses JSAPI function-based `PopupTemplate.title` to resolve per feature. Falls back to static layer title if empty.

### Changed

- **External Link → Card Options** (r002.033): Merged "External Link" section into "Card Options". External link template now appears as an option in the Link Field dropdown when configured, eliminating the separate section.
- **Card Options section** (r002.033): "Enable Card Expand" and "Link Field" moved out of "Zoom & Click Behavior" into new "Card Options" section — visible without map integration.
- **Popup template → textarea** (r002.035): Replaced single-line `TextInput` with multi-line `textarea` for popup templates.
- **Search controls progressive disclosure** (r002.035): Search placeholder and field list hidden when "Enable Search Bar" is off.
- **Pagination labels progressive disclosure** (r002.035): "Show More" label and "Show All" toggle hidden when `maxItems` is 0.
- **"Display Limits" → "Display Limits" with numeric filter** (r002.034): Range mode shows min/max numeric inputs instead of status value checkboxes.

### Fixed

- **Dark mode colors** (r002.032): Replaced 8+ hardcoded light-mode colors (`#c00`, `#fff`, `#333`, `#d4edda`, `#155724`, `#6c757d`) with ExB theme CSS variables (`--sys-color-danger-main`, `--sys-color-surface-overlay`, `--sys-color-text-primary`, `--sys-color-success-main`, `--sys-color-success-container`, `--sys-color-text-tertiary`).
- **Template help panel overflow** (r002.035): Added `overflow-x: auto` and `max-width: 100%` to prevent help content from overflowing the settings panel width.
- **HTML entity in section title** (r002.032): Fixed `'Zoom &amp; Click Behavior'` rendering literally as `&amp;`.
- **Accessibility** (r002.032): Added `aria-label` to all 5 color inputs, 3 reorder/remove buttons, card template textarea, and field token buttons. Added `aria-expanded` to template help toggle.
- **console.log → debugLogger** (r002.032): Replaced 5 `console.log`/`console.error` calls in settings with `debugLogger.log('SETTINGS', ...)`. Registered `SETTINGS` debug tag.
- **NumericInput consistency** (r002.032): Changed Marker Size, Zoom Level, and Zoom Buffer from `onChange` (fires per keystroke) to `onAcceptValue` (fires on commit). Added `max={23}` to Zoom Level.
- **Helper text consistency** (r002.032): Standardized all helper text to `font-size: 11px`. Replaced `opacity: 0.5/0.6` with `color: var(--sys-color-text-tertiary)`.

## [1.19.0-r002.030] - 2026-03-14 - Chainable Filters, Range Colors, Map FeatureEffect

### Added

- **Chainable pipe filters in card templates** (r002.023–024): Full rewrite of token substitution engine to support left-to-right chained pipes. New filters: math operators (`/N`, `*N`, `+N`, `-N`), `round:N`, `prefix:text`, `suffix:text`, `abs`, `toFixed:N`, `upper`, `lower`. Pipes split by `|` respecting quoted strings. Example: `{{field | /1000 | round:1 | suffix: km}}` converts 2400m → "2.4 km". All existing filters (date, autolink, externalLink) remain backward compatible.
- **24-hour time and timezone offset in date filter** (r002.025): New date tokens `HH` (24-hour padded), `H` (24-hour unpadded), `Z` (timezone offset like `-07:00`). Enables `{{field | "YYYY-MM-DD HH:mm:ss (UTCZ)"}}` for ISO-style local timestamps.
- **Template syntax help panel** (r002.026): Expandable help panel in settings replaces outdated hint text. Covers tokens, markdown, filters, math operations, date tokens, and usage examples. Dark theme compatible with `color: inherit` and translucent code backgrounds.
- **Range-based card color coding** (r002.027–029): New `colorMode` config (`'exact'` | `'range'`). Range mode uses `RangeColorBreak[]` with `min` (inclusive), `max` (exclusive), `color`, and `label`. Settings panel includes color mode dropdown, range break editor with color pickers, min/max numeric inputs, label fields, and add/remove buttons. New `color-resolver.ts` utility with `resolveCardColor()` routing to exact or range resolution.
- **Range label search and sort** (r002.029–030): Virtual fields `__colorRangeLabel` (label text) and `__colorRangeOrder` (break index) injected into items via `enrichItemsWithRangeLabels()`. Search automatically picks up range labels. "Range label" option in sort dropdown (shown when range mode has labeled breaks) sorts by break index for natural ordering (e.g., Low → Moderate → Severe).
- **FeatureEffect on joined map layers** (r002.027): When search/filter is active, non-matching features on the joined map layer are dimmed via `FeatureEffect` with `grayscale(100%) opacity(30%)`. New `applyFilterEffect()` and `clearFilterEffect()` in `map-interaction.ts`. Effect syncs with search changes, filter changes, and clears on unmount/view change.

### Changed

- **Sort icon** (r002.023): Replaced custom SVG triangle with `SortAscendingArrowOutlined` / `SortDescendingArrowOutlined` from `jimu-icons/outlined/directional/`.
- **"Status Colors" → "Card Colors"** (r002.027): Settings section renamed to reflect broader color coding capabilities.
- **FeedCard color resolution** (r002.028): Replaced inline color lookup with `resolveCardColor()` from `color-resolver.ts`, supporting both exact and range modes.

### New Files

- `src/utils/color-resolver.ts` — Color resolution utility (exact match + numeric range), virtual field enrichment for range labels

## [1.19.0-r002.022] - 2026-03-14 - CSV Export Hidden, Pipeline Tests

### Changed

- **CSV Export hidden from settings** (r002.022): CSV Export section wrapped in `{false && ...}` — feature not ready for production. Default `enableCsvExport` remains `false`. Code intact for future re-enablement.
- **Controls padding** (r002.021): Changed `feed-controls.tsx` container padding from `8px 10px` to `8px 0px` — stretches to edge.

### Added

- **Pipeline unit tests** (r002.022): 37 new tests in `feed-pipeline.test.ts` — covers `applyStatusFilter`, `searchItems`, `sortItems`, `paginateItems`, and full `runPipeline` integration. Total test count: 137 across 4 files.

## [1.19.0-r002.021] - 2026-03-14 - Search/Filter Block Padding

### Changed

- **Controls container padding** (r002.021): Changed `feed-controls.tsx` container padding from `8px 10px` to `8px 0px` — stretches search and sort controls flush to the container edge for a cleaner full-width appearance.

## [1.19.0-r002.020] - 2026-03-14 - Feed Map Layer Race Condition Fix

### Fixed

- **Map layer timing bug** (r002.020): Fixed race condition where mapView arrived before items, causing `initFeedLayer` to be skipped entirely. When items arrive after mapView, now calls `syncFeedLayer` (which creates the layer if needed) instead of `syncFeedLayerWithProcessedItems` (which assumed the layer already existed). This was the root cause of "hit and miss" point rendering on the map.

## [1.19.0-r002.019] - 2026-03-14 - Layer Sync Diagnostic Logging

### Added

- **Layer sync diagnostics** (r002.019): Added coordinate sample logging, `applyEdits` result checking, and post-sync verification to the feed map layer sync pipeline for easier debugging of point rendering issues.

## [1.19.0-r002.018] - 2026-03-14 - Link Field Toolbar Icon

### Added

- **Link field on card toolbar** (r002.018): New `linkField` config property specifying a feed field that contains a URL. Cards with a link value display a `LinkExternalIcon` SVG button on the toolbar that opens the URL in a new tab (`noopener,noreferrer`). Toolbar visibility check updated to include `linkUrl`.

## [1.19.0-r002.016] - 2026-03-14 - CORS Proxy Support via esriRequest

### Changed

- **Feed fetcher rewrite** (r002.016): Rewrote `feed-fetcher.ts` to use dynamically imported `esriRequest` with a native `fetch` fallback. New `loadEsriRequest()` helper checks `window.require` and `window.parent.require` for the AMD loader. Feeds that require a CORS proxy (e.g., GDACS via `feed-proxy.php`) now work at runtime through the `esriRequest` → portal proxy chain. Comprehensive `debugLogger` logging added throughout the fetch chain.

## [1.19.0-r002.011] - 2026-03-14 - Sort & Search Styling Refinements

### Changed

- **Sort arrow styling** (r002.011–015): Wider solid triangle icon, 32px uniform height for all controls, alignment fixes across sort and search bar.
- **Search input styling** (r002.011–015): Borderless styling for a cleaner appearance.
- **Sort placeholder text** (r002.011–015): "Sort" shown as placeholder when no field is selected.
- **Sort + search packaging** (r002.011–015): Sort controls hidden when `enableSearchBar=false`. Direction arrow hidden when no field-based sort is active (`isFieldSort` check).
- **"Reverse feed order" dropdown option** (r002.011–015): Added as a dedicated dropdown entry using `__reverse__` sentinel value — replaces the previous complex arrow-click-to-reverse behavior.

## [1.19.0-r002.010] - 2026-03-14 - Zoom Settings Gating Fix

### Fixed

- **Zoom settings visibility** (r002.010): Zoom options (zoom level, zoom buffer) are now available even without "zoom on click" enabled, since those settings are also used by toolbar zoom-to functionality.

## [1.19.0-r002.001] - 2026-03-14 - 2.0 Features: Pagination, Search, Sort, CSV Export

### Added

- **Expand-style pagination** (r002.001–009): "Show More" button appends the next batch of cards (not page-flip). Configurable `showMoreLabel` with `{n}` remaining-count token, optional "Show All" button, and `itemLabelSingular`/`itemLabelPlural` config for count display.
- **Client-side text search** (r002.001–009): Case-insensitive substring search with 200ms debounce. Configurable `searchFields` array (empty = search all fields). New `FeedControls` component (`feed-controls.tsx`) containing the search input and sort controls. Results label and no-results message. Map layer automatically syncs with the active search filter.
- **Runtime sort controls** (r002.001–009): Sort field dropdown and direction toggle button packaged alongside the search bar in `FeedControls`. Config-driven defaults via `sortField`/`sortDirection`. `sortableFields` restricts which fields appear in the dropdown. "Feed order" and "Reverse feed order" (`__reverse__` sentinel) options in dropdown. Direction arrow hidden when no field sort is active. Sort controls hidden when `enableSearchBar=false`.
- **CSV Export** (r002.001–009): Client-side CSV generation from `allProcessed` pipeline results. Configurable `exportFields`, `columnHeaderLabels`, and `exportFilenameTemplate` (supports `{date}` token). BOM prefix for Excel compatibility. New `feed-csv-export.ts` utility.

### Changed

- **Processing pipeline refactor** (r002.001–009): Replaced inline `getDisplayItems()` + `sortItems()` with a centralized `runPipeline()` function in new `feed-pipeline.ts`. Pipeline stages: filter → search → sort → paginate. Items stored unsorted — the pipeline handles sort at render time.

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
