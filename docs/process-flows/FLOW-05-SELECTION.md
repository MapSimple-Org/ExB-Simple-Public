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
| Query results loaded | `selectRecordsAndPublish()` | selection-utils.ts:511 |
| Result row clicked | `selectRecordsAndPublish()` | Called from query-result.tsx |
| Clear results | `clearAllSelectionsForWidget()` | selection-utils.ts:293 |
| Clear selection | `clearSelectionInDataSources()` | selection-utils.ts:257 |
| X button on result | `removeRecordsFromOriginSelections()` | results-management-utils.ts:299 |

---

## Flow Diagram: Select Records

```
 selectRecordsAndPublish(widgetId, outputDS, recordIds, records, ...)
      │                                      ← selection-utils.ts:511
      │
      ├── selectRecordsInDataSources(...)     ← :99
      │   │
      │   ├── Guard: !outputDS → exit         :102
      │   │
      │   ├── Get origin DS                   :108
      │   │   └── getOriginDataSource(outputDS)  :63
      │   │       ├── outputDS.getOriginDataSources()[0]
      │   │       └── Fallback: outputDS if has .layer/.type
      │   │
      │   ├── Graphics Layer path             :130-170
      │   │   └── useGraphicsLayer && graphicsLayer?
      │   │       ├── Wait for pendingGraphicsOperation  :135
      │   │       ├── clearGraphicsLayerOrGroupLayer()
      │   │       └── addHighlightGraphics(layer, records, mapView)
      │   │
      │   ├── Origin DS selection             :175-195
      │   │   └── !skipOriginDSSelection?
      │   │       ├── originDS.selectRecordsByIds(ids, records)
      │   │       └── originDS.selectRecordById(id)  (single record)
      │   │
      │   └── Output DS selection             :198-208
      │       └── outputDS.selectRecordsByIds(ids, records)
      │
      └── publishSelectionMessage(...)        ← :468
          │
          ├── Get origin DS                   :476
          ├── Publish to origin DS            :479-481
          │   └── DataRecordsSelectionChangeMessage(widgetId, records, [originDS.id])
          └── alsoPublishToOutputDS?          :489-492
              └── Publish to output DS too
```

---

## Flow Diagram: Clear All Selections

```
 clearAllSelectionsForWidget(options)         ← selection-utils.ts:293
      │
      ├── Multi-source clearing               :310-380
      │   ├── Get all output DS for widget via DataSourceManager
      │   ├── For each output DS:
      │   │   ├── Get origin DS
      │   │   ├── originDS.selectRecordsByIds([], [])
      │   │   └── Publish empty selection message
      │   └── Clear popup if open             :385
      │       └── mapView.popup.close()
      │
      ├── Clear graphics layer                :390-410
      │   └── useGraphicsLayer?
      │       ├── cleanupGraphicsLayer(layer)
      │       └── onDestroyGraphicsLayer?.()
      │
      ├── Clear data_s from URL hash          :415
      │   └── clearDataSParameterFromHash()   ← selection-utils.ts:222
      │       └── clearDataSFromHash()        ← hash-utils.ts
      │           ├── Parse hash as URLSearchParams
      │           ├── Delete 'data_s' param
      │           └── history.replaceState(newHash)
      │
      ├── Dispatch selection event            :420
      │   └── dispatchSelectionEvent(widgetId, [], ..., 0)
      │       └── eventManager.dispatchSelectionEvent()
      │
      └── Destroy output data sources?        :430-450
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

*Last updated: r024.131 (2026-03-05) — corrected removeRecordsFromOriginSelections line reference*
