# FS-FLOW-06: Settings Panel Configuration

## Overview

Describes the settings panel used by builders to configure the FeedSimple widget.
The panel is organized into seven sections and follows a "discover then configure"
pattern where feed fields are fetched before template and filter options are available.

**Key files:**
- `feed-simple/src/setting/setting.tsx` -- settings panel (862 lines)
- `feed-simple/src/utils/data-source-builder.ts` -- output DS registration (54 lines)
- `feed-simple/src/utils/feed-fetcher.ts` -- feed fetch for Discover (33 lines)
- `feed-simple/src/utils/parsers/custom-xml.ts` -- parser used by Discover (67 lines)
- `feed-simple/src/utils/markdown-template-utils.ts` -- template preview renderer

---

## Settings Panel Sections

```
 SettingPanel                                <- setting.tsx:339
      |
      +-- [1] Feed Source                    :351-385
      |   Feed URL, Discover Fields button
      |
      +-- [2] Card Template                  :388-472
      |   Template editor, field token buttons, live preview
      |
      +-- [3] Card Colors                     :475-539+
      |   Status field, color mode, exact pickers / range break editor
      |
      +-- [4] Hover Text                     :542-567
      |   Tooltip field dropdown
      |
      +-- [5] Polling                        :570-597
      |   Refresh interval, show last updated, highlight toggle
      |
      +-- [6] Sorting                        :600-642
      |   Sort field, sort direction, reverse feed order
      |
      +-- [7] Display Limits                 :645-695
      |   Max items, filter by status checkboxes
      |
      +-- [8] External Link                  :698-711
      |   Link template URL
      |
      +-- [9] Map Integration                :714-858
          DataSourceSelector, join fields, MapWidgetSelector, zoom settings
```

---

## Discover Fields Flow

The "Discover Fields" button fetches the feed and extracts field names, populating
dropdowns and token insertion buttons throughout the settings panel.

```
 onDiscoverFields()                          <- setting.tsx:63
      |
      +-- Guard: no feedUrl?                 :65-67
      |   → set discoverError, return
      |
      +-- setState({ isDiscovering: true })  :70
      |
      +-- fetchFeed(feedUrl)                 :73
      |   (same fetcher used by runtime)
      |
      +-- parser.parse(text, rootItemElement) :74
      |
      +-- setState({                         :75-80
      |     discoveredFields: parsed.fieldNames,
      |     discoveredItems: parsed.items,
      |     isDiscovering: false
      |   })
      |
      +-- catch → setState({ discoverError }) :81-87
```

### Settings State

| State Field | Type | Purpose |
|-------------|------|---------|
| `discoveredFields` | `string[]` | Field names from last Discover |
| `discoveredItems` | `FeedItem[]` | Full items (for extracting unique status values) |
| `isDiscovering` | `boolean` | Loading indicator for Discover button |
| `discoverError` | `string | null` | Error message from failed Discover |
| `spatialJoinFields` | `string[]` | Fields from the selected Map Integration layer |

---

## Card Template Editor

The template section provides a Markdown editor with:

1. **Textarea** with monospace font (setting.tsx:391-412)
   - `ref={templateTextareaRef}` for cursor position tracking
2. **Field token buttons** (setting.tsx:419-448)
   - Only shown after Discover
   - Click inserts `{{fieldName}}` at cursor position
3. **Live preview** (setting.tsx:450-471)
   - Only shown when template is non-empty
   - Uses `renderPreview()` which shows tokens as styled badges

### Token Insertion Flow

```
 onInsertFieldToken(fieldName)               <- setting.tsx:119
      |
      +-- Build token string: {{fieldName}}  :121
      |
      +-- Has textarea ref?                  :124
      |   +-- YES → insert at cursor position :125-127
      |   |   substring(0, start) + token + substring(end)
      |   |   requestAnimationFrame → focus + set cursor :134-139
      |   |
      |   +-- NO  → append to end of template :142-144
      |
      +-- onSettingChange({ cardTemplate })  :129-131 or :142-144
```

---

## Card Colors Configuration (r002.027)

Renamed from "Status Colors" to "Card Colors" to reflect broader color coding.

```
 Status Field dropdown                       <- setting.tsx
      |
      +-- Populated from discoveredFields
      +-- Includes "(None)" option
      +-- onChange → onStatusFieldChange
      |   Resets statusColorMap to {}
      |
      v
 Color Mode dropdown                         <- setting.tsx
      |
      +-- "Exact match" (default)
      +-- "Numeric range"
      +-- onChange → onColorModeChange
      |
      v
 [If colorMode === 'exact']
      |
      +-- Color pickers per status value
      |   getUniqueValuesForField(statusField)
      |   Scans discoveredItems for unique values
      |   Returns sorted array
      |   For each value: <input type="color">
      |   onChange → onStatusColorChange(val, color)
      |
 [If colorMode === 'range']
      |
      +-- Range break editor
      |   For each break in rangeColorBreaks:
      |     - Color picker
      |     - Min NumericInput (null = unbounded)
      |     - Max NumericInput (null = unbounded)
      |     - Label TextInput
      |     - Remove button
      |   onUpdateRangeBreak(index, field, value)
      |   onRemoveRangeBreak(index)
      |
      +-- "+ Add Range" button
          onAddRangeBreak() → appends { min: null, max: null, color: '#cccccc', label: '' }
```

### RangeColorBreak Type

```typescript
interface RangeColorBreak {
  min: number | null    // Lower bound (inclusive). null = no lower bound.
  max: number | null    // Upper bound (exclusive). null = no upper bound.
  color: string         // Background hex color
  label: string         // Display label (e.g., "Low", "Moderate", "Severe")
}
```

### Template Syntax Help Panel (r002.026)

An expandable help panel replaces the outdated hint text below the card template
editor. Toggled by `templateHelpOpen` state.

```
 Help panel toggle button                    <- setting.tsx
      |
      +-- "Template Syntax Help" ▸ / ▾
      |   onClick → toggles templateHelpOpen state
      |
      +-- [If open] Renders sections:
          - Tokens: {{fieldName}}, {{field.nested.path}}
          - Markdown: headings, bold, italic, links, lists
          - Filters: autolink, externalLink
          - Math: /N, *N, +N, -N, round:N, prefix:, suffix:
          - Date: YYYY, MM, DD, HH, hh, mm, ss, A, Z
          - Example: chained pipe filters
```

Dark theme compatible: uses `color: inherit` and `rgba(255,255,255,0.08)` code
backgrounds instead of hardcoded dark colors.

---

## Map Integration Configuration

The Map Integration section follows a progressive disclosure pattern -- each
subsection only appears when its prerequisites are met.

```
 [Always visible]
      |
      +-- DataSourceSelector                 <- setting.tsx:716-728
      |   types: [FeatureLayer]
      |   isMultiple: false
      |   onChange → onSpatialJoinDsChange()
      |
      v
 [Visible when layer selected]
      |
      +-- Join Field (Layer) dropdown        <- setting.tsx:731-755
      |   Populated from spatialJoinFields
      |   (loaded from DS schema on selection)
      |   onChange → onJoinFieldServiceChange()
      |
      +-- Join Field (Feed) dropdown         <- setting.tsx:757-782
      |   Populated from discoveredFields
      |   (requires Discover to be run first)
      |   onChange → onJoinFieldFeedChange()
      |
      v
 [Visible when both join fields filled]
      |
      +-- MapWidgetSelector                  <- setting.tsx:785-802
      |   Selects which map widget for zoom/popup
      |
      v
 [Visible when map widget selected]
      |
      +-- Zoom Level (Points) NumericInput   <- setting.tsx:806-824
      |   min: 1, max: 23, default: 15
      |
      +-- Zoom Buffer (Lines/Polys) Numeric  <- setting.tsx:826-844
      |   min: 1.0, step: 0.1, default: 1.5
      |
      +-- "Map integration active" banner    <- setting.tsx:846-856
```

### Data Source Selection Flow

```
 onSpatialJoinDsChange(useDataSources)       <- setting.tsx:270
      |
      +-- No DS selected? (cleared)          :273-283
      |   → reset joinFieldService/Feed to ''
      |   → onSettingChange({ useDataSources: [] }, [])
      |   → clear spatialJoinFields
      |   → deregister output DS
      |
      +-- DS selected:                       :287-297
          loadSpatialJoinFields(dsId)         :287
          reset joinFieldService to ''        :290
          onSettingChange({ useDataSources })  :293
```

### Output Data Source Registration

When all Map Integration fields are filled, the widget registers an output DS
with ExB's framework:

```
 saveConfigWithOutputDs(newConfig)            <- setting.tsx:314
      |
      +-- All filled? (DS + joinFieldService + joinFieldFeed)  :318
      |   |
      |   +-- YES → buildOutputDataSourceJson()               :323
      |   |   ← data-source-builder.ts:37
      |   |   id: {widgetId}_output
      |   |   label: 'FeedSimple Output'
      |   |   type, geometryType, url from origin DS
      |   |   originDataSources: [originUseDataSource]
      |   |   → onSettingChange(config, [outputDsJson])        :324-327
      |   |
      |   +-- NO  → onSettingChange(config, [])                :333-336
      |       (deregister output DS)
```

### Spatial Join Field Loading

```
 loadSpatialJoinFields(dsId)                 <- setting.tsx:250
      |
      +-- DataSourceManager.getDataSource(dsId) :252
      |
      +-- Guard: DS null?                    :253-255
      |   → setState({ spatialJoinFields: [] })
      |
      +-- ds.getSchema()                     :257
      +-- Object.keys(schema.fields).sort()  :258
      +-- setState({ spatialJoinFields })    :259
```

---

## Config Change Handlers Summary

| Handler | Config Field | Notes |
|---------|-------------|-------|
| `onFeedUrlChange` | `feedUrl` | Text input |
| `onCardTemplateChange` | `cardTemplate` | Textarea onChange |
| `onStatusFieldChange` | `statusField`, `statusColorMap` | Resets color map when field changes |
| `onStatusColorChange` | `statusColorMap` | Updates single key in map |
| `onHoverTextFieldChange` | `hoverTextField` | Dropdown |
| `onRefreshIntervalChange` | `refreshInterval` | Clamped: min 15 (unless 0), max 3600 |
| `onShowLastUpdatedChange` | `showLastUpdated` | Toggle switch |
| `onHighlightNewItemsChange` | `highlightNewItems` | Toggle switch |
| `onSortFieldChange` | `sortField` | Dropdown |
| `onSortDirectionChange` | `sortDirection` | 'asc' or 'desc' |
| `onReverseFeedOrderChange` | `reverseFeedOrder` | Toggle (only when no sortField) |
| `onMaxItemsChange` | `maxItems` | Clamped: min 0 (0 = show all), max 500 |
| `onFilterByStatusToggle` | `filterByStatus` | Array toggle (add/remove status value) |
| `onExternalLinkTemplateChange` | `externalLinkTemplate` | Text input |
| `onSpatialJoinDsChange` | `useDataSources`, join fields | DS selector + output DS registration |
| `onJoinFieldServiceChange` | `joinFieldService` | Triggers output DS re-registration |
| `onJoinFieldFeedChange` | `joinFieldFeed` | Triggers output DS re-registration |
| `onColorModeChange` | `colorMode` | 'exact' or 'range' (r002.027) |
| `onAddRangeBreak` | `rangeColorBreaks` | Appends default break (r002.027) |
| `onUpdateRangeBreak` | `rangeColorBreaks` | Updates single break field by index (r002.027) |
| `onRemoveRangeBreak` | `rangeColorBreaks` | Removes break by index (r002.027) |

---

## componentDidMount — Restore State

```
 componentDidMount()                         <- setting.tsx:49
      |
      +-- Load spatial join fields if DS already configured  :51-54
          (handles settings panel being reopened after initial config)
          if (useDataSources[0])
          → loadSpatialJoinFields(dsId)
```

---

*Last updated: r002.030 (2026-03-14)*
