# FLOW-07: Settings Panel

## Overview

The settings panel provides a multi-stage wizard for configuring query items,
layout options, and results display. Each query item goes through three stages:
data source selection, map mode, and data mode.

**Key files:**
- `query-simple/src/setting/setting.tsx` -- main settings container (773 lines)
- `query-simple/src/setting/query-item-list.tsx` -- drag/drop query list UI
- `query-simple/src/setting/query-item-setting.tsx` -- three-stage wizard controller
- `query-simple/src/setting/query-item-main-mode.tsx` -- Stage 0: data source selection
- `query-simple/src/setting/query-item-map-mode.tsx` -- Stage 1: map selection
- `query-simple/src/setting/query-item-data-mode.tsx` -- Stage 2: spatial relations
- `query-simple/src/setting/results.tsx` -- results display configuration
- `query-simple/src/config.ts` -- all type definitions and enums

---

## Settings Component Hierarchy

```
 Setting (setting.tsx)
      |
      +-- Arrangement (arrangement.tsx)
      |   +-- Block / Inline / Popper selector
      |   +-- Wrap toggle (Inline mode)
      |
      +-- QueryItemList (query-item-list.tsx)
      |   +-- Add / Duplicate / Remove / Reorder
      |   +-- Drag/drop via tree-based list UI
      |
      +-- QueryItemSetting (query-item-setting.tsx)       <- active edit
          |
          +-- Stage 0: QueryItemSettingMain
          |   (query-item-main-mode.tsx)
          |   +-- DataSourceSelector
          |   +-- Name, shortId, searchAlias fields
          |   +-- Group assignment
          |   +-- ResultsSetting (results.tsx)      <- mounted here (main-mode.tsx:415)
          |       +-- FieldsType selector
          |       +-- Title/Content expression editors
          |       +-- Display fields picker
          |       +-- Sort options
          |       +-- Export toggle
          |
          +-- Stage 1: QueryItemSettingMapMode
          |   (query-item-map-mode.tsx)
          |   +-- Spatial filter map widget selection
          |
          +-- Stage 2: QueryItemSettingDataMode
              (query-item-data-mode.tsx)
              +-- Spatial relation data sources
              +-- Spatial relationship rules
```

---

## Data Source Update Flow

```
 User changes data source or query item
      |
      v
 updateConfigForOptions(key, value, options)      <- setting.tsx:95
      |
      +-- Update config[key] = value
      |
      +-- options.dsUpdateRequired === true?
      |   +-- YES -> getAllDataSources(queryItems)    :233-306
      |   |   +-- Aggregate useDataSource from all queryItems
      |   |   +-- Generate output data sources
      |   |   +-- Call onSettingChange() with config + outputDataSources
      |   +-- NO -> Call onSettingChange() with config only
      |
      v
 ExB builder updates widget configuration
```

---

## Widget-Level Configuration

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `queryItems` | `ImmutableArray<QueryItemType>` | `[]` | All configured queries |
| `arrangeType` | `QueryArrangeType` | `Block` | Layout: Block, Inline, Popper |
| `arrangeWrap` | `boolean` | `false` | Wrap items in Inline mode |
| `highlightMapWidgetId` | `string` | -- | Map widget for result highlighting |
| `addResultsAsMapLayer` | `boolean` | `false` | Show results in LayerList |
| `resultsLayerTitle` | `string` | `'QuerySimple Results'` | Layer name in LayerList |
| `highlightFillColor` | `string` | `'#DF00FF'` | Polygon fill color |
| `highlightFillOpacity` | `number` | `0.25` | Polygon fill opacity |
| `highlightOutlineColor` | `string` | `'#DF00FF'` | Polygon outline color |
| `highlightOutlineWidth` | `number` | `2` | Polygon outline width (px) |
| `highlightPointSize` | `number` | `12` | Point marker size |
| `highlightPointStyle` | `string` | `'circle'` | Point style |
| `hoverPinColor` | `string` | `'#EA4335'` | Hover preview pin color |
| `zoomOnResultClick` | `boolean` | `false` | Auto-zoom on result click |

---

## Per-Query Configuration

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `useDataSource` | `UseDataSource` | -- | Input feature layer |
| `outputDataSourceId` | `string` | auto | Generated: `{widgetId}_output_{configId}` |
| `configId` | `string` | auto | Unique query identifier |
| `name` | `string` | -- | Display name |
| `shortId` | `string` | -- | URL hash parameter key |
| `searchAlias` | `string` | -- | Friendly name for exports |
| `groupId` | `string` | -- | Query group assignment |
| `order` | `number` | -- | Display order |
| `useAttributeFilter` | `boolean` | `true` | Enable attribute search |
| `useSpatialFilter` | `boolean` | `true` | Enable spatial search |
| `resultFieldsType` | `FieldsType` | `PopupSetting` | Field display mode |
| `resultTitleExpression` | `string` | -- | Title template with `{FIELD}` tokens |
| `resultContentExpression` | `string` | -- | Content template (CustomTemplate) |
| `resultDisplayFields` | `string[]` | -- | Fields for SelectAttributes mode |
| `resultFieldAliases` | `{ [fieldName: string]: string }` | -- | Per-field display-label overrides for SelectAttributes mode (r028.117); sibling map keyed by field name |
| `allowExport` | `boolean` | `false` | Enable CSV/GeoJSON/JSON export |
| `zoomToSelected` | `boolean` | `true` | Auto-zoom after query |
| `sortOptions` | `OrderByOption[]` | `[]` | Result sort configuration |

---

## FieldsType Modes

| Mode | Config Key | Fields Requested |
|------|-----------|-----------------|
| `PopupSetting` | Popup fieldInfos | Visible popup fields + objectId |
| `SelectAttributes` | `resultDisplayFields` | Selected fields + title tokens + objectId |
| `CustomTemplate` | `resultTitleExpression` + `resultContentExpression` | All expression tokens + objectId |

See FLOW-02-QUERY-EXECUTION.md for the "Field Shredder" optimization that limits
service requests to only the required fields.

---

## Field-Table ("Customize") Display Configuration

The `resultFieldsType` selector (the "How to display" dropdown in
`results.tsx:252-266`) picks one of three display modes. The dropdown labels
come from i18n keys, not the enum values:

| `FieldsType` value | UI label (i18n key)             | What the admin configures              |
|--------------------|---------------------------------|----------------------------------------|
| `PopupSetting`     | "Use webmap settings" (`field_PopupSetting`)   | Nothing extra; reuses the layer's popup field infos |
| `SelectAttributes` | "Customize" (`field_SelectAttributes`)         | Field picker + per-field labels (the field-table path) |
| `CustomTemplate`   | "Custom template" (`field_CustomTemplate`)     | Markdown title + content templates (`{{field}}` tokens) |

Only `SelectAttributes` renders the field picker. `results.tsx:360-371` mounts
`ResultsFieldSetting` (`results-field.tsx`) only when
`resultFieldsType === FieldsType.SelectAttributes`.

### SelectAttributes: field picker + per-field aliases (r028.117)

`ResultsFieldSetting` (`results-field.tsx`) renders two config controls for the
"Customize" path:

1. **Field picker** — a framework `FieldSelector`
   (`results-field.tsx:130-138`, label i18n key `configFields` = "Display
   fields") plus a drag/drop reorder `List` shown once more than one field is
   selected (`results-field.tsx:140-164`). It writes `resultDisplayFields:
   string[]` back through `onPropertyChanged('resultDisplayFields', ...)`
   (`results.tsx:365`). Field order in the array is the display order in the
   field table.

2. **Per-field alias overrides** (r028.117) — one `TextInput` per selected field
   (`results-field.tsx:168-191`, section label i18n key `fieldAliases` = "Field
   labels (optional)", input placeholder i18n key `fieldAliasPlaceholder` =
   "Custom label"). Each row shows the schema label (schema alias, else field
   name) as a static `Label` and a text input for the override. These write a
   sibling map `resultFieldAliases: { [fieldName: string]: string }` through
   `onPropertyChanged('resultFieldAliases', ...)` (`results.tsx:369`). The alias
   inputs only render when the caller wires `onFieldAliasesChanged`, which
   `results.tsx` always does for SelectAttributes.

**Empty/whitespace fallback.** `handleAliasChange` (`results-field.tsx:63-73`)
trims the input: a non-empty value sets `next[fieldName] = value`; an
empty/whitespace value `delete`s the key. So a blank alias removes the override
entirely, and at render time that field falls back to the layer schema alias,
then the field name (`meta.alias ?? name` — see FLOW-13).

**Why a sibling map, not objects.** `resultDisplayFields` stays a `string[]`;
the aliases live in a separate `resultFieldAliases` map keyed by field name
(`config.ts:159-165`). Reshaping `resultDisplayFields` into objects was rejected
because ~15 consumers plus the framework `FieldSelector` already emit and expect
plain field-name strings; a sibling map is additive and backward compatible (a
config with no `resultFieldAliases` behaves exactly as before).

### Config -> render flow

```
 Admin (Customize mode) in results-field.tsx
   |
   +-- FieldSelector + reorder List
   |     -> onPropertyChanged('resultDisplayFields', string[])
   |
   +-- per-field alias TextInputs (r028.117)
         -> onPropertyChanged('resultFieldAliases', { field: alias })
   |
   v
 Query item config
   resultFieldsType = SelectAttributes
   resultDisplayFields: string[]        (which fields + order)
   resultFieldAliases:  { name: alias } (admin label overrides)
   |
   v
 Renderer (runtime)
   renderPopupContent() merges resultFieldAliases into fieldMeta,
   builds the markdown field table; blank/missing alias -> schema
   alias -> field name (meta.alias ?? name).
   -> see FLOW-13-POPUP-RENDERING.md for the render half.
```

On a layer rebind, `rebind-utils.ts:309-317` remaps the `resultFieldAliases`
keys through the same old-name -> new-name `fieldMap` it uses for
`resultDisplayFields`, so per-field labels survive a rebind. See
[FLOW-12: Data Source Rebinding](FLOW-12-DATA-SOURCE-REBINDING.md).

---

## Related Flows

**Data Source Rebinding:** When a layer is replaced in the web map and query items show "Data is inaccessible", see [FLOW-12: Data Source Rebinding](FLOW-12-DATA-SOURCE-REBINDING.md) for the rebind tool workflow that remaps query items to a new data source.

---

*Last updated: r028.118 (2026-06-02) -- added field-table "Customize" display configuration (SelectAttributes field picker + per-field aliases, r028.117); cross-links FLOW-13 (render) and FLOW-12 (rebind). Accuracy pass: corrected setting.tsx line count (492->773) and drifted refs (updateConfigForOptions :84->:95, getAllDataSources :183-255->:233-306); moved ResultsSetting in the hierarchy diagram from Stage 2 (data-mode) to Stage 0 (main-mode), where it is actually mounted (query-item-main-mode.tsx:415); fixed hoverPinColor default (#FFC107->#EA4335).*
