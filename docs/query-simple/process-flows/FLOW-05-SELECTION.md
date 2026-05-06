# FLOW-05: Selection & Highlighting

## Overview

Manages feature selection across origin data sources, output data sources, and
optional graphics layers. Publishes selection change messages so the map and
other widgets react to selections.

**Key files:**
- `query-simple/src/runtime/selection-utils.ts` — selection logic (select, clear, publish)
- `query-simple/src/runtime/graphics-layer-utils.ts` — highlight graphics creation/add (re-exports cleanup functions)
- `query-simple/src/runtime/graphics-cleanup-utils.ts` — highlight graphics clear/cleanup
- `query-simple/src/runtime/hash-utils.ts` — hash URL manipulation (clearDataSFromHash)
- `query-simple/src/runtime/managers/event-manager.ts` — EventManager for widget events

---

## Entry Points

| Trigger | Function | Location |
|---------|----------|----------|
| Query results loaded | `selectRecordsAndPublish()` | selection-utils.ts:493 |
| Result row clicked | `selectRecordsAndPublish()` | Called from query-result.tsx |
| Spatial query results | `selectRecordsAndPublish()` | Called from query-task.tsx `handleExecuteSpatialQuery` with `skipOriginDSSelection = true` |
| Clear results | `clearAllSelectionsForWidget()` | selection-utils.ts:275 |
| Clear selection | `clearSelectionInDataSources()` | selection-utils.ts:239 |
| X button on result | `removeRecordsFromOriginSelections()` | results-management-utils.ts:305 |
| Output DS selection cleared externally | `handleDataSourceInfoChange()` | query-result.tsx:699 |

> **Spatial query note:** Spatial query records come from target layers (e.g.,
> Parcels, Trails), not the widget's configured outputDS origin. Because there is
> no single origin DS that owns these records, `skipOriginDSSelection = true` is
> passed to avoid selecting into an unrelated origin DS.

---

## Flow Diagram: Select Records

```
 selectRecordsAndPublish(widgetId, outputDS, recordIds, records, ...)
      │                                      ← selection-utils.ts:493
      │
      ├── selectRecordsInDataSources(...)     ← :104
      │   │
      │   ├── Guard: !outputDS → exit         :113
      │   │
      │   ├── Get origin DS                   :115
      │   │   └── getOriginDataSource(outputDS)  :68
      │   │       ├── outputDS.getOriginDataSources()[0]
      │   │       └── Fallback: outputDS if has .layer/.type
      │   │
      │   ├── Graphics Layer path             :118-148
      │   │   └── useGraphicsLayer && graphicsLayer?
      │   │       ├── Wait for pendingGraphicsOperation  :120
      │   │       ├── clearGraphicsLayerOrGroupLayer()
      │   │       └── addHighlightGraphics(layer, records, mapView)
      │   │
      │   ├── Origin DS selection             :152-211
      │   │   └── !skipOriginDSSelection?
      │   │       ├── originDS.selectRecordsByIds(ids, records)
      │   │       └── originDS.selectRecordById(id)  (single record)
      │   │
      │   └── Output DS selection             :215-217
      │       └── outputDS.selectRecordsByIds(ids, records)
      │
      └── publishSelectionMessage(...)        ← :450
          │
          ├── Get origin DS                   :458
          ├── Publish to origin DS            :461-463
          │   └── DataRecordsSelectionChangeMessage(widgetId, records, [originDS.id])
          └── alsoPublishToOutputDS?          :471-475
              └── Publish to output DS too
```

---

## Flow Diagram: Clear All Selections

```
 clearAllSelectionsForWidget(options)         ← selection-utils.ts:275
      │
      ├── Multi-source clearing               :309-353
      │   ├── Get all output DS for widget via DataSourceManager
      │   ├── For each output DS:
      │   │   ├── Get origin DS
      │   │   ├── originDS.selectRecordsByIds([], [])
      │   │   └── Publish empty selection message
      │
      ├── Clear graphics layer                :356-375
      │   └── useGraphicsLayer?
      │       ├── clearAnyResultLayerContents(widgetId, mapView)
      │       └── onDestroyGraphicsLayer?.()
      │
      ├── Clear popup if open                 :378
      │   └── mapView.popup.close()
      │
      ├── Clear selection in output DS        :383
      │   └── clearSelectionInDataSources()   ← selection-utils.ts:239
      │
      ├── Dispatch selection event            :386
      │   └── dispatchSelectionEvent(widgetId, [], ..., 0)
      │       └── eventManager.dispatchSelectionEvent()
      │
      └── Destroy output data sources?        :396-423
          └── destroyOutputDataSources option
```

---

## Key Functions

| Function | Purpose | File |
|----------|---------|------|
| `getOriginDataSource(outputDS)` | Extract origin DS from output DS | selection-utils.ts |
| `selectRecordsInDataSources(...)` | Select in origin + output DS + graphics | selection-utils.ts |
| `publishSelectionMessage(...)` | Publish MessageManager message | selection-utils.ts |
| `selectRecordsAndPublish(...)` | Combined select + publish (most common) | selection-utils.ts |
| `clearSelectionInDataSources(...)` | Clear selection + graphics + hash | selection-utils.ts |
| `clearAllSelectionsForWidget(...)` | Full widget clear (multi-source) | selection-utils.ts |
| `dispatchSelectionEvent(...)` | Custom event to Widget component | selection-utils.ts |
| `clearDataSParameterFromHash()` | Wrapper → delegates to hash-utils | selection-utils.ts |
| `clearDataSFromHash()` | Remove ExB dirty hash param | hash-utils.ts |
| `findClearResultsButton()` | DOM query for programmatic clear | selection-utils.ts |

---

## ExB 1.20: Record ID Type Safety (r027.010)

In ExB 1.20, `DataRecord.getId()` returns `string | number` based on the
original attribute type. Redux `selectedIds` are stored as strings (set by
the initial selection). The card's selection check at
`query-result-item.tsx:413` uses `.includes(String(data.getId()))`.

**Consequence:** If `selectRecordsByIds()` receives number IDs, Redux stores
numbers, and the card's string comparison silently returns `false` — all
selection highlights disappear.

**Rule:** All record IDs passed to `selectRecordsByIds()` MUST be coerced
with `String(record.getId())`. This applies to both the output DS path
(`record-removal-handler.ts:405`) and the origin DS path
(`results-management-utils.ts:446`).

**Related:** `getSelectedRecords()` returns `[]` in ExB 1.20 even when
`getSelectedRecordIds()` returns IDs. Selection removal must use ID-based
filtering, not record-object filtering.

---

## Output DS Selection Recovery (r027.016)

When another widget (e.g., a second QuerySimple instance) clears the shared
origin data source, the output DS `selectedIds` in Redux get wiped. This
causes the pink card borders to disappear even though the records are still
accumulated in the result list.

`handleDataSourceInfoChange` in `query-result.tsx:699` detects this situation
and re-selects from accumulated records:

```
 DataSourceComponent onDataSourceInfoChange
      │                                  ← query-result.tsx:1077
      ▼
 handleDataSourceInfoChange()            ← query-result.tsx:699
      │
      ├── ds = DataSourceManager.getDataSource(outputDS.id)
      ├── selectedIds = ds.getSelectedRecordIds()    :701
      │   (r027.016: uses getSelectedRecordIds — getSelectedRecords
      │    returns [] in ExB 1.20)
      │
      ├── records.length > 0 && selectedIds.length === 0?
      │   │
      │   ├── YES: External clear detected           :721
      │   │   └── ds.selectRecordsByIds(recordIds, records)  :731
      │   │       (re-selects from accumulated records
      │   │        to restore pink card borders)
      │   │
      │   └── NO: Selection still intact → no action
      │
      └── Done
```

**History:** Prior to r027.016, `widget.tsx` had a `restoreOutputDsSelection()`
function that attempted a similar recovery but relied on `getSelectedRecords()`,
which always returns `[]` in ExB 1.20. That function was removed and the logic
was rewritten in `query-result.tsx` using `getSelectedRecordIds()`.

---

## Graphics Layer Mode

When `useGraphicsLayer = true`, selection highlighting uses a dedicated graphics
layer instead of relying on the feature layer's native selection. This enables
highlighting when the source layer is not in the map or is not visible.

**Async safety (r021.93):** A `pendingGraphicsOperation` promise prevents
overlapping graphics operations from corrupting the layer state.

---

## Hash Cleanup

ExB adds `data_s` to the URL hash when selections are made but does not remove
it when cleared. `clearDataSParameterFromHash()` explicitly removes this
parameter to prevent "dirty hash" issues that can interfere with HelperSimple's
URL-based query triggering.

---

## Test Coverage

`tests/selection-utils.test.ts` — 21 tests:
- `QUERYSIMPLE_SELECTION_EVENT`: constant value
- `getOriginDataSource`: null/undefined, with origin DS, empty array, layer fallback, type fallback, no method
- `publishSelectionMessage`: null DS, origin DS, fallback to output DS, both
- `dispatchSelectionEvent`: with/without EventManager
- `findClearResultsButton`: no button, button exists, header preference
- `clearDataSParameterFromHash`: empty hash, remove data_s, data_s only, no data_s

---

*Last updated: r027.017 (2026-04-06) — corrected line numbers, added output DS selection recovery section (r027.016)*
