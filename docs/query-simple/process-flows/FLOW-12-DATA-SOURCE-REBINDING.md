# FLOW-12: Data Source Rebinding

## Overview

When a user replaces a layer in their web map (e.g., swaps an AGS service
endpoint for a hosted feature layer), all query items referencing the old
data source break. The settings panel cannot load the layer's schema, filters
fail to resolve, and the query items become unusable. Without this tool, the
only fix is manual JSON editing of the widget config to update every
`useDataSource`, `sqlExprObj`, template expression, and field reference.

The rebind tool provides a guided UI for selecting a replacement data source,
analyzing field compatibility, and applying the rebinding across all affected
query items in one operation.

**Key files:**
- `query-simple/src/setting/rebind-tool.tsx` -- rebinding UI component (517 lines)
- `query-simple/src/setting/rebind-utils.ts` -- pure functions for analysis and remapping (341 lines)
- `query-simple/src/setting/query-item-list.tsx` -- broken DS detection and banner (lines 49-66, 159-171)
- `query-simple/src/setting/setting.tsx` -- `updateConfigForOptions` / `getAllDataSources` host
- `query-simple/src/config.ts` -- QueryItemType definition

---

## End-to-End Flow

```
 [User replaces layer in web map]
      |
      v
 DataSourceTip fires onStatusChange(false)       <- query-item-list.tsx:54
      |
      v
 brokenDsRef tracks broken indices (ref, not state)
      |
      v
 Yellow banner: "X queries have an inaccessible   <- query-item-list.tsx:161-170
   data source. Use Data Source Management below
   to rebind."
      |
      v
 User expands "Data Source Management" section     <- rebind-tool.tsx:290-314
      |
      v
 Deduplicated DS list built via useMemo            <- rebind-tool.tsx:141-183
      |
      v
 User clicks "Rebind" on a DS entry
      |
      v
 DataSourceSelector opens for target selection     <- rebind-tool.tsx:370-378
      |
      v
 handleNewDsSelected reads schema fields           <- rebind-tool.tsx:188-216
      |
      v
 analyzeRebinding() compares old vs new fields     <- rebind-utils.ts:137-167
      |
      +-- All fields match -----> Auto-heal mode (one-click Apply)
      |
      +-- Fields differ --------> Field mapping table (manual or skip)
      |
      v
 applyRebinding() deep clones + remaps items       <- rebind-utils.ts:267-328
      |
      v
 updateConfigForOptions(['queryItems', ...,         <- rebind-tool.tsx:259
   { dsUpdateRequired: true }])
      |
      v
 getAllDataSources() rebuilds useDataSources         <- setting.tsx
   from current query items only
      |
      v
 Old DS excluded -- no query items reference it
```

---

## 1. Discovery: Broken Data Source Detection

When the settings panel renders, each query item mounts a `DataSourceTip`
component. If the underlying layer is missing or inaccessible,
`DataSourceTip` fires `onStatusChange(false)`.

**query-item-list.tsx:49-66** -- Broken DS tracking:

```
 DataSourceTip.onStatusChange(false)
      |
      v
 handleDsStatusChange(index, enabled=false)
      |
      +-- brokenDsRef.current.add(index)          <- ref, NOT state
      +-- setBrokenDsCount(prev.size)              <- batched state for banner
      |
      v
 hasBrokenDs === true  -->  yellow banner renders
```

The `brokenDsRef` (a `React.useRef<Set<number>>`) is critical here.
`DataSourceTip` fires `onStatusChange` on mount, so if the broken set were
tracked via `useState` directly, each status change would trigger a re-render,
which would remount `DataSourceTip`, which would fire again -- creating an
infinite re-render loop. The ref accumulates broken indices without triggering
renders, and `setBrokenDsCount` is called only when the set actually changes.

**Banner text (query-item-list.tsx:168-169):**

> "{N} queries have an inaccessible data source. Use **Data Source Management**
> below to rebind."

---

## 2. Rebind Tool UI (rebind-tool.tsx)

The `RebindTool` component renders inside the settings panel as a collapsible
`SettingSection` titled "Data Source Management".

### 2a. Building the DS Entry List

`dsEntries` is computed via `useMemo` from the current `queryItems` prop
(rebind-tool.tsx:141-183):

```
 queryItems
      |
      v
 forEach: extract dsId from useDataSource.dataSourceId
   or useDataSource.mainDataSourceId
      |
      v
 Deduplicate into Map<dsId, DataSourceEntry>
      |
      +-- For each unique dsId:
      |     try { DataSourceManager.getDataSource(dsId) }
      |     catch { log error, ds = null }
      |
      +-- Label resolution:
      |     1. ds.getLabel() or ds.getDataSourceJson().label
      |     2. First query item name referencing this DS
      |     3. Raw dsId (last resort)
      |
      v
 DataSourceEntry[] -- each with dsId, label, queryCount, queryIndices
```

`DataSourceManager.getInstance().getDataSource()` is wrapped in a try/catch
(rebind-tool.tsx:152-156) because it **throws** on broken/removed DS IDs
rather than returning null. Without the try/catch, the entire settings tab
locks up (r026.024 fix).

### 2b. Rebind Activation

Each DS entry row shows a "Rebind" button. Clicking it:
1. Sets `rebindState.activeDsId` to that entry's `dsId`
2. Expands the rebind panel below that entry, containing a `DataSourceSelector`
3. `DataSourceSelector` is configured for single-selection with layer types
   (FeatureLayer, SceneLayer, BuildingComponentSubLayer,
   OrientedImageryLayer, ImageryLayer, SubtypeSublayer)

---

## 3. Analysis Flow (rebind-utils.ts)

### 3a. Schema Field Read

When the user selects a new target DS via `DataSourceSelector`,
`handleNewDsSelected` (rebind-tool.tsx:188-216) fires:

1. Resolves the new DS via `DataSourceManager.getDataSource(newDs.dataSourceId)`
2. Reads `ds.getSchema().fields` to get field names
3. Calls `analyzeRebinding(oldDsId, newFieldSet, queryItems)`

### 3b. analyzeRebinding (rebind-utils.ts:137-167)

```
 analyzeRebinding(oldDsId, newFieldNames, queryItems)
      |
      v
 For each query item where useDataSource.dataSourceId === oldDsId:
      +-- Record index in affectedIndices
      +-- extractFieldReferences(item) --> union into allOldFields
      |
      v
 Compare old fields to new field set:
      +-- matchedFields:   old fields present in new DS
      +-- unmatchedFields: old fields NOT in new DS
      +-- autoHealEligible: unmatchedFields.length === 0
      |
      v
 AnalysisResult { affectedIndices, oldFieldNames,
   matchedFields, unmatchedFields, autoHealEligible }
```

**Two outcomes:**

- `autoHealEligible === true`: Green banner, one-click "Apply" button.
  All field names match; the DS reference swap is safe.

- `autoHealEligible === false`: Yellow banner with field mapping table.
  Each unmatched old field gets a dropdown to select the corresponding new
  field. A "Leave unmapped fields as-is" checkbox allows skipping.

### 3c. extractFieldReferences (rebind-utils.ts:45-88)

Walks all field reference locations in a single query item:

| Source                       | How fields are found                              |
|------------------------------|---------------------------------------------------|
| `useDataSource.fields`       | Direct array iteration                            |
| `sqlExprObj`                 | Recursive `walkSqlParts()` -- extracts `jimuFieldName` from each `SqlClause` |
| `resultTitleExpression`      | Regex: `{{fieldName}}` and `{{fieldName \| filter}}` via `RE_NEW_TOKEN`, plus legacy `{fieldName}` via `RE_LEGACY_TOKEN` |
| `resultContentExpression`    | Same token extraction as above                    |
| `resultDisplayFields`        | Direct array iteration                            |
| `sortOptions`                | `opt.jimuFieldName` from each sort option         |
| `resultTitleFields` (legacy) | Direct array iteration                            |

All extracted field names are collected into a `Set<string>` for deduplication.

---

## 4. Apply Flow (rebind-utils.ts:267-328)

`applyRebinding()` processes each query item in the config array. Items whose
`useDataSource.dataSourceId` does not match `oldDsId` pass through unchanged.
Affected items are deep-cloned via `JSON.parse(JSON.stringify(...))` and
remapped:

```
 applyRebinding(oldDsId, newUseDataSource, queryItems, fieldMap)
      |
      v
 For each affected query item (deep clone):
      |
      +-- 1. Swap useDataSource
      |       new DS reference + fields remapped via fieldMap
      |
      +-- 2. Remap sqlExprObj
      |       remapSqlExpression() -- recursive walk of parts,
      |       replaces jimuFieldName per fieldMap,
      |       clears sql + displaySQL (framework regenerates)
      |
      +-- 3. Remap resultTitleExpression
      |       replaceFieldTokensInTemplate() -- handles
      |       {{field | filter}} and legacy {field} syntax,
      |       preserves filter chains
      |
      +-- 4. Remap resultContentExpression
      |       Same template replacement as above
      |
      +-- 5. Remap resultDisplayFields
      |       Array map: fieldMap[f] ?? f
      |
      +-- 6. Remap sortOptions
      |       Each opt.jimuFieldName replaced via fieldMap
      |
      +-- 7. Remap resultTitleFields (legacy)
      |       Array map: fieldMap[f] ?? f
      |
      +-- 8. Preserve outputDataSourceId (unchanged)
      |
      v
 Return updated QueryItemType[]
```

For auto-heal mode, `buildIdentityFieldMap()` creates a map where each field
maps to itself (rebind-utils.ts:334-340). This ensures `applyRebinding()`
still runs the full DS swap logic while leaving field names unchanged.

---

## 5. Cleanup Flow

After `applyRebinding()` returns the updated query items, the rebind tool
triggers cleanup via the config update mechanism:

```
 updateConfigForOptions(['queryItems', updatedItems,
   { dsUpdateRequired: true }])                        <- rebind-tool.tsx:259
      |
      v
 setting.tsx receives dsUpdateRequired flag
      |
      v
 getAllDataSources() called
      +-- Iterates current queryItems
      +-- Builds useDataSourceMap from item.useDataSource references
      +-- Only DS IDs still referenced by a query item are included
      |
      v
 Old DS naturally excluded -- zero query items reference it
      |
      v
 updateWidgetJson() passes new useDataSources
   + outputDataSources to onSettingChange
      |
      v
 Framework updates widget config, old DS reference removed
```

The `dsUpdateRequired` flag is the sole mechanism for orphan DS cleanup.
Without it, `getAllDataSources()` would not re-run and the old DS ID would
remain in the widget's `useDataSources`, causing framework warnings.

---

## 6. Key Patterns and Gotchas

### DataSourceTip.onStatusChange fires on mount
`DataSourceTip` calls `onStatusChange` immediately when it mounts, not just
when status actually changes. If broken DS indices were tracked in state
(`useState`), each callback would trigger a re-render, remounting the tip,
firing again -- infinite loop. The fix (r026.023) uses a `useRef<Set>` to
accumulate indices silently, then calls `setBrokenDsCount` only when the set
size actually changes (query-item-list.tsx:49-66).

### DataSourceManager.getDataSource() throws on broken IDs
Unlike many DataSourceManager methods that return null/undefined for missing
data, `getDataSource()` can **throw** when the DS ID references a removed
layer. All calls in the rebind tool are wrapped in try/catch to prevent the
settings panel from locking up (rebind-tool.tsx:152-156, r026.024).

### DS resolution is unreliable in settings context
During initial settings load, child data sources may not be fully hydrated
(lazy loading). An earlier implementation (pre-r026.023) showed green/red
status dots next to each DS entry, but these were removed because
`getDataSource()` could return a valid object for a DS that was actually
broken. Status indication is now deferred entirely to ExB's built-in
`DataSourceTip` on individual query items.

### dsUpdateRequired is the orphan cleanup trigger
The `dsUpdateRequired: true` option passed in the config update is what
causes `getAllDataSources()` to rebuild the widget's data source list from
scratch. This is the only mechanism that removes the old DS reference from
`useDataSources`. Forgetting this flag leaves an orphan DS in the widget
config.

### Template token replacement preserves filter chains
`replaceFieldTokensInTemplate()` (rebind-utils.ts:180-213) matches the full
`{{field | filter}}` syntax but only replaces the field name portion. Filter
chains (e.g., `| uppercase`, `| dateFormat`) and whitespace around the field
name are preserved in the output.

### outputDataSourceId is intentionally preserved
Each query item's `outputDataSourceId` is not changed during rebinding.
The `getAllDataSources()` rebuild handles updating the output DS metadata
(URL, geometry type, etc.) from the new source data source automatically.
