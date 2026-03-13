# FLOW-07: Settings Panel

## Overview

The settings panel provides a multi-stage wizard for configuring query items,
layout options, and results display. Each query item goes through three stages:
data source selection, map mode, and data mode.

**Key files:**
- `query-simple/src/setting/setting.tsx` -- main settings container (492 lines)
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
          |
          +-- Stage 1: QueryItemSettingMapMode
          |   (query-item-map-mode.tsx)
          |   +-- Spatial filter map widget selection
          |
          +-- Stage 2: QueryItemSettingDataMode
              (query-item-data-mode.tsx)
              +-- Spatial relation data sources
              +-- ResultsSetting (results.tsx)
                  +-- FieldsType selector
                  +-- Title/Content expression editors
                  +-- Display fields picker
                  +-- Sort options
                  +-- Export toggle
```

---

## Data Source Update Flow

```
 User changes data source or query item
      |
      v
 updateConfigForOptions(key, value, options)      <- setting.tsx:84
      |
      +-- Update config[key] = value
      |
      +-- options.dsUpdateRequired === true?
      |   +-- YES -> getAllDataSources(queryItems)    :183-255
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
| `hoverPinColor` | `string` | `'#FFC107'` | Hover preview pin color |
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

*Last updated: r024.111 (2026-03-03)*
