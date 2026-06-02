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
| Query results loaded | `selectRecordsAndPublish()` | selection-utils.ts:495 |
| Result row clicked | `selectRecordsAndPublish()` | Called from query-result.tsx |
| Spatial query results | `selectRecordsAndPublish()` | Called from query-task.tsx `handleExecuteSpatialQuery` with `skipOriginDSSelection = true` |
| Clear results | `clearAllSelectionsForWidget()` | selection-utils.ts:278 |
| Clear selection | `clearSelectionInDataSources()` | selection-utils.ts:242 |
| X button on result | `removeRecordsFromOriginSelections()` | results-management-utils.ts:306 |
| Output DS selection cleared externally | `handleDataSourceInfoChange()` | query-result.tsx:781 |

> **Spatial query note:** Spatial query records come from target layers (e.g.,
> Parcels, Trails), not the widget's configured outputDS origin. Because there is
> no single origin DS that owns these records, `skipOriginDSSelection = true` is
> passed to avoid selecting into an unrelated origin DS.

---

## Flow Diagram: Select Records

```
 selectRecordsAndPublish(widgetId, outputDS, recordIds, records, ...)
      │                                      ← selection-utils.ts:495
      │
      ├── selectRecordsInDataSources(...)     ← :107
      │   │
      │   ├── Guard: !outputDS → exit         :116
      │   │
      │   ├── Get origin DS                   :118
      │   │   └── getOriginDataSource(outputDS)  :71
      │   │       ├── outputDS.getOriginDataSources()[0]
      │   │       └── Fallback: outputDS if has .layer/.type
      │   │
      │   ├── Graphics Layer path             :121-148
      │   │   └── useGraphicsLayer && graphicsLayer?
      │   │       ├── Wait for pendingGraphicsOperation  :123
      │   │       ├── clearGraphicsLayerOrGroupLayer()    :145
      │   │       └── addHighlightGraphics(layer, records, mapView)  :147
      │   │
      │   ├── Origin DS selection             :155-214
      │   │   └── !skipOriginDSSelection?
      │   │       └── originDS.selectRecordsByIds(ids, records)
      │   │           (graphics branch :156, layer branch :205)
      │   │
      │   └── Output DS selection             :218-219
      │       └── outputDS.selectRecordsByIds(ids, records)
      │
      └── publishSelectionMessage(...)        ← :452
          │
          ├── Get origin DS                   :460
          ├── Publish to origin DS            :462-465
          │   └── DataRecordsSelectionChangeMessage(widgetId, records, [originDS.id])
          └── alsoPublishToOutputDS?          :466-477
              └── Publish to output DS too
```

### Path 3 (FeatureLayer) Note

The "Graphics Layer path" branch above (lines 52-56) fires only when
`useGraphicsLayer && graphicsLayer` are set, i.e., Path 1 (highlight-only) is active.
**Path 3 does NOT visualize selection through this branch.** The
origin/output DS selection writes still happen for Path 3 (the shared
selection state is path-agnostic), but the on-map visualization is driven
by `widget.tsx:syncResultFeatureLayers` in response to accumulated-records
changes, not by this helper. Path 3's selection halo is handled internally
by the FeatureLayerView, not by writing to a GraphicsLayer. See
FLOW-03 / FLOW-08 for Path 3's visualization flow.

---

## Flow Diagram: Clear All Selections

```
 clearAllSelectionsForWidget(options)         ← selection-utils.ts:278
      │
      ├── Multi-source clearing               :310-356
      │   ├── Get all output DS for widget via DataSourceManager
      │   ├── For each unique origin DS:
      │   │   └── originDS.selectRecordsByIds([])   :339
      │   │   (empty selection message is published later at :395)
      │
      ├── Clear graphics layer                :358-377
      │   └── useGraphicsLayer && mapView?
      │       ├── clearAnyResultLayerContents(widgetId, mapView)  :361
      │       └── onDestroyGraphicsLayer?.()                      :369
      │
      ├── Clear popup if open                 :380
      │   └── mapView.popup.close()           :381
      │
      ├── Clear selection in output DS        :385
      │   └── clearSelectionInDataSources()   ← selection-utils.ts:242
      │
      ├── Dispatch selection event            :388-389
      │   └── dispatchSelectionEvent(widgetId, [], ..., 0)
      │       └── eventManager.dispatchSelectionEvent()
      │
      └── Destroy output data sources?        :398-425
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
`query-result-item.tsx:466` uses `.includes(String(data.getId()))`.

**Consequence:** If `selectRecordsByIds()` receives number IDs, Redux stores
numbers, and the card's string comparison silently returns `false` — all
selection highlights disappear.

**Rule:** All record IDs passed to `selectRecordsByIds()` MUST be coerced
with `String(record.getId())`. This applies to both the output DS path
(`record-removal-handler.ts:411`) and the origin DS path
(`results-management-utils.ts:444`).

**Related:** `getSelectedRecords()` returns `[]` in ExB 1.20 even when
`getSelectedRecordIds()` returns IDs. Selection removal must use ID-based
filtering, not record-object filtering.

---

## Output DS Selection Recovery (r027.016)

When another widget (e.g., a second QuerySimple instance) clears the shared
origin data source, the output DS `selectedIds` in Redux get wiped. This
causes the pink card borders to disappear even though the records are still
accumulated in the result list.

`handleDataSourceInfoChange` in `query-result.tsx:781` detects this situation
and re-selects from accumulated records:

```
 DataSourceComponent onDataSourceInfoChange
      │                                  ← query-result.tsx:1152
      ▼
 handleDataSourceInfoChange()            ← query-result.tsx:781
      │
      ├── ds = DataSourceManager.getDataSource(outputDS.id)  :783
      │   └── Guard: !ds → skip (r027.019)               :788
      ├── selectedIds = ds.getSelectedRecordIds()    :798
      │   (r027.016: uses getSelectedRecordIds — getSelectedRecords
      │    returns [] in ExB 1.20)
      │
      ├── records.length > 0 && selectedIds.length === 0?
      │   │                                              :806
      │   ├── YES: External clear detected
      │   │   └── ds.selectRecordsByIds(recordIds, records)  :808
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

## Map-to-Card Flash (r028.033)

When a user clicks a Path 3 result feature on the map, JSAPI opens the popup
natively. The PopupTemplate's CustomContent creator dispatches an event to
scroll the matching result card into view and flash it briefly. This is a
visual beacon, not a selection change.

```
 JSAPI popup opens for our feature
      │
      ▼
 PopupTemplate CustomContent creator fires
      │                                  ← result-feature-layer-popup.ts:~203
      ├── Resolve compositeKey from graphic attributes
      │
      ├── window.dispatchEvent(
      │     'querysimple-popup-feature-identified',
      │     { widgetId, compositeKey }
      │   )
      │
      ▼
 query-result.tsx useEffect listener
      │                                  ← query-result.tsx:~235
      ├── Filter by widgetId (multi-widget safe)
      │
      ├── querySelector('[data-composite-key="..."]')
      │   (data attribute set on each card in query-result-item.tsx)
      │
      ├── scrollIntoView({ behavior: 'smooth', block: 'start' })
      │
      ├── IntersectionObserver waits for card to be visible
      │   (scrollIntoView is async with no callback)
      │
      ├── classList.add('map-identified-flash')
      │   (CSS @keyframes: hover purple tint, 1.2s fade)
      │
      └── animationend → classList.remove('map-identified-flash')
```

**Key files:**
- `result-feature-layer-popup.ts` — dispatches the event from the creator
- `query-result.tsx` — useEffect listener, scroll + flash logic
- `query-result-item.tsx` — `data-composite-key` attribute, `@keyframes mapIdentifiedFlash` CSS
- `simple-list.tsx` — builds factory-format composite key, passes as `factoryCompositeKey` prop
- `managers/event-manager.ts` — `QUERYSIMPLE_POPUP_FEATURE_IDENTIFIED` constant

**Not affected:** Card selection state (pink outline), hover preview pins, popup formatting.

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

*Last updated: r028.118 (2026-06-02) — re-synced selection-utils.ts, query-result.tsx, query-result-item.tsx, record-removal-handler.ts and results-management-utils.ts line refs; removed nonexistent selectRecordById() step from the select diagram*
