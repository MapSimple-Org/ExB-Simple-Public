# QuerySimple Settings Reference

Complete catalog of configurable widget settings. All settings are defined in `query-simple/src/config.ts` (`SettingConfig` interface) and read at runtime through the `widgetConfigManager` singleton (`shared-code/mapsimple-common/widget-config-manager.ts`).

**End-user counterpart:** For a non-technical, scan-friendly version (panel labels, defaults, and where to find each setting), see [`SETTINGS_AT_A_GLANCE.md`](../user-guide/SETTINGS_AT_A_GLANCE.md). Keep the two in sync when settings change.

**Debug:** Append `?debug=SETTINGS` to the app URL to trace singleton reads in the browser console.

**Rule:** All runtime config reads go through `widgetConfigManager` (see CLAUDE.md, "The Singleton Rule"). Never use Redux selectors for widget config in runtime modules.

---

## Widget Display

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `showHeader` | `boolean` | `true` | `getShowHeader()` | Show/hide the widget header label (e.g., "Enhanced Search"). |
| `arrangeType` | `QueryArrangeType` | -- | -- | Layout arrangement: `Block`, `Inline`, or `Popper`. Set in builder, not runtime-configurable. |
| `arrangeWrap` | `boolean` | -- | -- | Whether inline arrangement wraps query items. |

---

## Result Display

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `resultListDirection` | `ListDirection` | `'Vertical'` | `getResultListDirection()` | Result card layout direction: `Vertical` or `Horizontal`. |
| `resultPagingStyle` | `PagingType` | `'Simple'` | `getResultPagingStyle()` | Paging mode: `MultiPage`, `LazyLoad`, or `Simple` (render all). |
| `defaultPageSize` | `number` | `10` | `getDefaultPageSize()` | Number of records per page in query task lists. |
| `lazyLoadInitialPageSize` | `number` | `20` | `getLazyLoadInitialPageSize()` | Records loaded initially in LazyLoad/single-page mode. |

---

## Result Click Behavior

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `zoomOnResultClick` | `boolean` | `false` | `getZoomOnResultClick()` | Zoom to feature when a result card is clicked. |
| `panOnResultClick` | `boolean` | `false` | `getPanOnResultClick()` | Pan (center) to feature without zoom change. Mutually exclusive with `zoomOnResultClick`. |
| `pointZoomBufferFeet` | `number` | `300` | `getPointZoomBufferFeet()` | Buffer distance in feet around point features when zooming (prevents over-zoom on single points). |
| `zoomExpansionFactor` | `number` | `1.2` | `getZoomExpansionFactor()` | Expansion factor for zoom extent. `1.0` = tight fit, `2.0` = double size. Applied to lines, polygons, and multi-record extents. |

---

## Graphics Layer Symbology

Controls the visual appearance of query result highlights on the map (Path 1 highlight GraphicsLayer).

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `highlightFillColor` | `string` (hex) | `'#DF00FF'` | `getFillColor()` | Fill color for polygon/extent highlights. Returns `[r,g,b]` array. |
| `highlightFillOpacity` | `number` | `0.25` | `getFillOpacity()` | Fill opacity (0-1). |
| `highlightOutlineColor` | `string` (hex) | `'#DF00FF'` | `getOutlineColor()` | Outline color. Returns `[r,g,b]` array. |
| `highlightOutlineOpacity` | `number` | `1.0` | `getOutlineOpacity()` | Outline opacity (0-1). |
| `highlightOutlineWidth` | `number` | `2` | `getOutlineWidth()` | Outline width in pixels. |
| `highlightPointSize` | `number` | `12` | `getPointSize()` | Point marker size in pixels. |
| `highlightPointOutlineWidth` | `number` | `2` | `getPointOutlineWidth()` | Point marker outline width (separate from polygon outline). |
| `highlightPointStyle` | `string` | `'circle'` | `getPointStyle()` | Point marker style: `circle`, `square`, `cross`, `x`, or `diamond`. |

---

## Hover Preview

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `hoverPinColor` | `string` (hex) | `'#EA4335'` | `getHoverPinColor()` | Color of the hover pin that appears when hovering over a result card. |
| `hoverHighlightColor` | `string` (hex) | `'#EA4335'` | `getHoverHighlightColor()` | Color of the feature highlight drawn on the map when hovering a result card. |
| `hoverPinEnabled` | `boolean` | `true` | `getHoverPinEnabled()` | Whether the hover preview pin is shown. |
| `hoverHighlightFeature` | `boolean` | `true` | `getHoverHighlightFeature()` | Whether the hover feature highlight is shown. |

---

## Tab Help

r028.133-134 (TODO #36, `docs/specs/TAB_HELP_SPEC.md`). A "?" button at the right end of the tab strip opens a popover describing the active tab. Each text is markdown rendered through the shared engine; `{{field}}` tokens are NOT substituted (no record context). Blank/unset = the shipped i18n default (`tabHelpQueryDefault` / `tabHelpSpatialDefault` / `tabHelpResultsDefault` in runtime translations). The same resolved text, flattened by `stripMarkdownToText()`, feeds the hidden per-tab screen-reader descriptions.

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `tabHelpEnabled` | `boolean` | `true` | `getTabHelpEnabled()` | Master switch (r028.135). `false` removes the "?" button AND the per-tab SR descriptions. |
| `tabHelpBackgroundColor` | `string` (hex) | unset (theme surface) | `getTabHelpBackgroundColor()` | Popover background (r028.135). Blank/unset = theme surface. Text color is auto-computed (YIQ, `contrast-utils.ts`) — never configurable, so help can't be made unreadable. |
| `tabHelpQueryText` | `string` (markdown) | unset (shipped default) | `getTabHelpQueryText()` | Help popover text for the Query tab. Getter returns `undefined` for blank/whitespace so the runtime falls back to the default. |
| `tabHelpSpatialText` | `string` (markdown) | unset (shipped default) | `getTabHelpSpatialText()` | Help popover text for the Spatial tab. Same blank-is-unset semantics. |
| `tabHelpResultsText` | `string` (markdown) | unset (shipped default) | `getTabHelpResultsText()` | Help popover text for the Results tab. Same blank-is-unset semantics. |
| `tabHelpOperationsText` | `string` (markdown) | unset (shipped default) | `getTabHelpOperationsText()` | Help popover text for the Spatial Operations mode "?" (r028.136, replaces the old hardcoded description line). |
| `tabHelpDrawText` | `string` (markdown) | unset (shipped default) | `getTabHelpDrawText()` | Help popover text for the Spatial Draw mode "?" (r028.136). |

---

## Spatial Tab

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `drawColor` | `string` (hex) | `'#32FF00'` | `getDrawColor()` | Draw symbol color for Spatial tab sketch tools. Returns `[r,g,b]` array. |
| `bufferColor` | `string` (hex) | `'#FFA500'` | `getBufferColor()` | Buffer preview color for Spatial tab. Returns `[r,g,b]` array. |
| `spatialTabRelationships` | `string[]` | `undefined` (show all) | `getSpatialTabRelationships()` | Allowed relationship IDs in the Spatial tab combobox. When empty/undefined, all relationships shown. |
| `highlightMapWidgetId` | `string` | -- | -- | Map widget ID used for graphics layer highlighting. Set in builder. |

---

## LayerList Integration

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `addResultsAsMapLayer` | `boolean` | `false` | `getAddResultsAsMapLayer()` | Render results as a GroupLayer visible in LayerList. Layer persists when widget closes. |
| `resultsLayerTitle` | `string` | `'QuerySimple Results'` | `getResultsLayerTitle()` | Custom title for the results GroupLayer in LayerList. |

---

## Path 3 (FeatureLayer Results)

Path 3 (FeatureLayer results in the LayerList) is selected by `addResultsAsMapLayer`
(see LayerList Integration above). The legacy `useFeatureLayerResults` toggle was removed
in r028.102 (Path 2 Removal, TODO #24).

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `flashOnMapIdentify` | `boolean` | `true` | `getFlashOnMapIdentify()` | When a Path 3 feature is clicked on the map, scroll the matching result card into view and flash it. Only active in Path 3 (`addResultsAsMapLayer === true`). |

---

## Mobile Popup Behavior

Settings apply when the map viewport is 600px or narrower.

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `mobilePopupCollapsed` | `boolean` | `false` | `getMobilePopupCollapsed()` | Open popup in collapsed state (title only) on mobile. |
| `mobilePopupDockPosition` | `string` | `''` (auto) | `getMobilePopupDockPosition()` | Dock position on mobile: `''` (JSAPI auto), `'top-center'`, or `'bottom-center'`. |
| `mobilePopupHideDockButton` | `boolean` | `false` | `getMobilePopupHideDockButton()` | Hide the dock toggle button so users cannot undock the popup on mobile. |
| `mobilePopupHideActionBar` | `boolean` | `false` | `getMobilePopupHideActionBar()` | Hide the popup action bar (zoom-to, etc.) on mobile. |

---

## Query Items

Per-query configuration. Each query item is an entry in the `queryItems` array.

| Property | Type | Default | Singleton Getter | Description |
|----------|------|---------|------------------|-------------|
| `queryItems` | `QueryItemType[]` | `[]` | `getQueryItems()` | Full array of configured query items. |
| *(by configId)* | `QueryItemType` | `undefined` | `getQueryItemByConfigId()` | Look up a single query item by its `configId`. |

### QueryItemType Properties

See `config.ts` `QueryItemType` interface for the full list. Key properties:

| Property | Type | Description |
|----------|------|-------------|
| `configId` | `string` | Unique identifier for this query configuration. |
| `name` | `string` | Display name shown in the query selector. |
| `shortId` | `string` | Short alias for URL parameter consumption (`?query=shortId`). |
| `useDataSource` | `UseDataSource` | Data source binding for this query. |
| `resultFieldsType` | `FieldsType` | Result display mode: `PopupSetting`, `SelectAttributes`, or `CustomTemplate`. |
| `resultExpandByDefault` | `boolean` | Whether result cards start expanded. |
| `zoomToSelected` | `boolean` | Zoom to results after query execution. |
| `spatialOnly` | `boolean` | Layer only participates in Spatial tab queries, hidden from Query tab. |
| `enableSuggest` | `boolean` | Enable typeahead suggestions for free-form text inputs. |

---

## Config Access Pattern

```typescript
// Runtime code (components, hooks, managers, popup creators)
import { widgetConfigManager } from 'widgets/shared-code/mapsimple-common'

const fillColor = widgetConfigManager.getFillColor(widgetId)
const pagingStyle = widgetConfigManager.getResultPagingStyle(widgetId)
const queryItem = widgetConfigManager.getQueryItemByConfigId(widgetId, configId)
```

The singleton is registered in `widget.tsx` on mount and config changes:
```typescript
widgetConfigManager.registerConfig(widgetId, config)
```

And unregistered on unmount:
```typescript
widgetConfigManager.unregisterConfig(widgetId)
```

---

*Created: r028.054 (2026-05-15)*
