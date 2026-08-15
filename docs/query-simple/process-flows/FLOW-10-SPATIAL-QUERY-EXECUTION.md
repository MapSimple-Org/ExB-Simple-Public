# FLOW-10: Spatial Query Execution

## Overview

Executes spatial queries against target FeatureLayers using input geometries from
two sources: **Operations mode** (accumulated query results) or **Draw mode**
(user-drawn shapes on the map). The pipeline unions input geometries, optionally
applies a client-side buffer, queries each target layer via JSAPI, converts
results to FeatureDataRecords, and merges them using the standard results mode
logic (New/Add/Remove).

**Key files:**
- `query-simple/src/runtime/tabs/SpatialTabContent.tsx` -- UI, input geometry preparation, mode switching, Execute button
- `query-simple/src/runtime/execute-spatial-query.ts` -- JSAPI query execution per target layer, record conversion
- `query-simple/src/runtime/query-task.tsx` -- `handleExecuteSpatialQuery` orchestration (lines ~1067-1282)
- `query-simple/src/runtime/managers/use-buffer-preview.ts` -- client-side buffer geometry (used when buffer > 0)
- `query-simple/src/runtime/results-management-utils.ts` -- merge/remove/dedup utilities
- `query-simple/src/runtime/query-utils.ts` -- `resolvePopupOutFields` + `combineFields` (shared Field Shredder)
- `query-simple/src/config.ts` -- `QueryItemType.isSpatialResultDefault` flag

---

## Entry Points

| Trigger | Location | Description |
|---------|----------|-------------|
| User clicks "Run spatial query" (Operations mode) | `SpatialTabContent.tsx:1104` | Execute button onClick, accumulated records as input |
| User clicks "Run spatial query" (Draw mode) | `SpatialTabContent.tsx:1104` | Execute button onClick, drawn geometries as input |

---

## Flow Diagram: Input Geometry Preparation (r028.119: event-driven)

`allInputGeometries` is rebuilt only when a real input event fires — a shape is
drawn/edited/cleared, the include-results toggle flips, the mode changes, or (operations
mode) the results prop changes. It is NOT a `useEffect` watching `[drawnGeometries,
accumulatedRecords, ...]` (that prior design re-emitted a new array reference on a
post-query results change and redrew the buffer after it was cleared — the r028.118
regression). Draw mode no longer reacts to `accumulatedRecords`.

```
 INPUT EVENTS (each recomputes allInputGeometries):
   - draw end/edit/clear  -> updateDrawnGeometries(next)  -> assembleForDraw(next, toggle)
                                       <- SpatialTabContent.tsx:501 (updateDrawnGeometries)
   - "include results" toggle onChange -> assembleForDraw(drawnGeometriesRef.current, checked)
   - handleModeChange(mode) -> mode==='draw' ? assembleForDraw(...) : assembleForOperations()
   - smart-default (tab entry) -> assembleForDraw(...) or assembleForOperations()
   - accumulatedRecords prop change (prop-sync useEffect, operations mode + draw-toggle-on)
                                       <- SpatialTabContent.tsx:507
      |
      +-- assembleForDraw(drawList, includeResults)        <- SpatialTabContent.tsx:480
      |     raw = drawList
      |     + accumulatedRecords[].feature.geometry when includeResults (r028.118)
      |
      +-- assembleForOperations()                          <- SpatialTabContent.tsx:492
      |     raw = accumulatedRecords[].feature.geometry
      |
      v
   assembleInputGeometries(rawGeometries)                  <- SpatialTabContent.tsx:421
      |   (seq guard drops out-of-order async union results)
      |
      +-- length 0 -> setAllInputGeometries([])
      +-- length 1 -> setAllInputGeometries(rawGeometries)
      +-- multiple:
            +-- Group by type (Map<string, Geometry[]>)     <- SpatialTabContent.tsx:442
            +-- Union within each group: unionOperator.executeMany(geoms)
            |                                               <- SpatialTabContent.tsx:452
            +-- setAllInputGeometries(unionedParts[])       <- SpatialTabContent.tsx:456

 CONSUMERS of allInputGeometries:
   - inputGeometry (highest-dimension, for warnings)        <- SpatialTabContent.tsx:398
   - useBufferPreview({ inputGeometries: allInputGeometries }) <- SpatialTabContent.tsx:523
```

---

## Flow Diagram: Execute Button (onClick)

```
 User clicks "Search" (aria-disabled pattern, r028.143 - the button is ALWAYS clickable)
      |
      +-- isExecuting -> silent exit (double-click protection)
      |
      +-- !canExecute -> REFUSAL, then exit  <- r028.143 DCE items 1+5
      |     getSpatialBlockReason picks the FIRST unmet requirement in form order
      |     (no-drawing / no-results -> no-relationship -> no-layers; actionable
      |     reasons win over the transient assembly-in-flight state), shows the
      |     amber refusal popover on spatial-feedback-anchor-{widgetId}, announces
      |     politely (r028.138 live region), logs TASK search-refused.
      |     Christie's case: geometry drawn, no relationship -> "Select a spatial
      |     relationship". Required markers also sit on the Relationship and
      |     Target layers headers while unmet (block-reason-utils.ts).
      |
      +-- Inner safety guard: !inputGeometry || !relIsValid
      |          || !onExecuteSpatialQuery -> silent exit (r028.108, kept)
      |
      +-- setIsExecuting(true)          <- SpatialTabContent.tsx:1110
      |
      +-- Dismiss previous alerts       <- SpatialTabContent.tsx:1112-1113
      |
      +-- Buffer decision (r028.101: passes an ARRAY of input geometries):
      |   |
      |   +-- parsedBuffer > 0 AND bufferedGeometry exists?
      |   |   |
      |   |   +-- YES: Use client-side bufferedGeometry
      |   |   |   inputGeometries = [bufferedGeometry]
      |   |   |   (one unioned polygon already covering every part)
      |   |   |   bufferDistance = 0 (already applied client-side)
      |   |   |
      |   |   +-- NO: Use the per-type array
      |   |       inputGeometries = allInputGeometries
      |   |       (one geometry per type, so mixed types are not dropped)
      |   |       bufferDistance = parsedBuffer (server-side via query.distance)
      |   |
      |   +-- Why client-side preferred:
      |       Server-side query.distance only applies "intersects" logic.
      |       Client-side buffered geometry preserves the selected spatial
      |       relationship (within, crosses, etc.) against the actual
      |       buffered shape.
      |
      +-- await onExecuteSpatialQuery({
      |     inputGeometries, selectedRelationship, selectedLayers,
      |     bufferDistance, bufferUnit, resultsMode
      |   })
      |   |
      |   +-- Returns boolean: true = results found, false = zero results
      |
      +-- Post-execution cleanup (on success):
      |   |
      |   +-- queryFoundResults === true?
      |       |
      |       +-- setBufferDistance('')   <- SpatialTabContent.tsx:1136
      |       |
      |       +-- Draw mode?
      |           +-- setDrawnGeometries([])
      |           +-- drawLayer.removeAll()
      |                                  <- SpatialTabContent.tsx:1138-1144
      |
      +-- catch: error already handled via dispatch (buffer preserved)
      |                                  <- SpatialTabContent.tsx:1146-1147
      |
      +-- finally: setIsExecuting(false) <- SpatialTabContent.tsx:1148-1149
```

---

## Flow Diagram: handleExecuteSpatialQuery (Orchestration)

```
 handleExecuteSpatialQuery(params)     <- query-task.tsx:1067
      |
      +-- Track origin tab: lastQueryOriginTabRef = 'spatial'
      |                                 <- query-task.tsx:1076
      |
      +-- dispatch(SET_STAGE, 2) -> show "Retrieving..."
      |                                 <- query-task.tsx:1079
      |
      +-- Build targetLayerIds from selectedLayers
      |   params.selectedLayers.map(l => String(l.value))
      |                                 <- query-task.tsx:1081
      |
      +-- Build targetUseDataSources map for lazy DS creation
      |   queryItems.forEach -> match dsId to targetLayerIds
      |                                 <- query-task.tsx:1084-1090
      |
      +-- Build layerDefaultConfigs + layerDefaultConfigIds (r025.048)
      |   queryItems.forEach -> find isSpatialResultDefault per layer
      |   layerDefaultConfigs[dsId] = queryItem (for outField resolution)
      |   layerDefaultConfigIds[dsId] = configId (for record stamping)
      |                                 <- query-task.tsx:1093-1103
      |
      +-- 1. executeSpatialQuery({..., layerDefaultConfigs})
      |                                 <- query-task.tsx:1106 / execute-spatial-query.ts:69
      |   |   (see "executeSpatialQuery" flow below)
      |   |
      |   +-- Returns SpatialQueryResult:
      |       { layerResults[], totalFeatureCount, totalTimeMs, errors[] }
      |
      +-- All layers failed?            <- query-task.tsx:1137
      |   (layerResults.length === 0 && errors.length > 0)
      |   |
      |   +-- YES: dispatch(SET_STAGE, 1)
      |   |        dispatch(SET_QUERY_ERROR_ALERT)
      |   |        throw Error('spatial-query-failed')
      |   |        (throw ensures SpatialTabContent catch runs -> buffer preserved)
      |   |                              <- query-task.tsx:1138-1145
      |   |
      |   +-- NO: continue
      |
      +-- 2. convertSpatialResultsToRecords(result, widgetId, layerDefaultConfigIds)
      |   |                              <- query-task.tsx:1149
      |   |                              <- execute-spatial-query.ts:230
      |   |
      |   +-- For each layerResult with featureCount > 0:
      |       +-- Get DataSource for layerId
      |       +-- Stamp graphic.layer = featureLayer (r027.030 — JSAPI 5.0 removed sourceLayer/associatedLayer)
      |       +-- ds.buildRecord(graphic) -> FeatureDataRecord
      |       +-- Stamp __queryConfigId = layerDefaultConfigIds[layerId] || 'spatial'
      |       |   (r025.048: real configId enables SimpleList template resolution)
      |       +-- Stamp __originDSId = ds.id
      |       +-- Stamp __spatialLayerTitle = layerResult.layerTitle
      |
      +-- 3. Zero results?              <- query-task.tsx:1152
      |   |
      |   +-- YES: dispatch(SET_NO_RESULTS_ALERT)
      |   |        dispatch(SET_STAGE, 1)
      |   |        return false (buffer preserved, draw preserved)
      |   |                              <- query-task.tsx:1153-1155
      |   |
      |   +-- NO: continue
      |
      +-- 4. Apply ResultsMode          <- query-task.tsx:1158-1202
      |   |
      |   +-- NewSelection:
      |   |   +-- clearResult() if existing records
      |   |   +-- recordsToDisplay = newRecords
      |   |                              <- query-task.tsx:1168-1173
      |   |
      |   +-- AddToSelection:
      |   |   +-- mergeResultsIntoAccumulated(outputDS, newRecords, existing)
      |   |   +-- { mergedRecords, duplicateRecordIds }
      |   |   +-- All duplicates? -> SET_ALL_DUPLICATES_ALERT
      |   |                              <- query-task.tsx:1174-1183
      |   |
      |   +-- RemoveFromSelection:          <- query-task.tsx:1184-1199
      |       +-- existingRecords empty? -> recordsToDisplay = []
      |       +-- else: removeResultsFromAccumulated(outputDS, newRecords, existing)
      |       +-- No records removed? -> SET_NO_REMOVAL_ALERT
      |       +-- Close popup if visible (r025.052)
      |
      +-- 5. Update parent state
      |   onAccumulatedRecordsChange(recordsToDisplay)
      |   recordsRef.current = recordsToDisplay
      |                                  <- query-task.tsx:1205-1206
      |
      +-- 6. Graphics on map             <- query-task.tsx:1208-1235
      |   |
      |   +-- recordsToDisplay.length > 0?
      |   |     selectRecordsAndPublish(
      |   |       widgetId, outputDS, recordIds, recordsToDisplay,
      |   |       alsoPublishToOutputDS=false,
      |   |       useGraphicsLayer=true,
      |   |       graphicsLayer, mapView,
      |   |       skipOriginDSSelection=true
      |   |     )
      |   |     hasSelectedRecordsRef = true
      |   |
      |   +-- isRemoveMode && length === 0?  (r025.052)
      |         clearSelectionInDataSources(widgetId, outputDS, true, graphicsLayer)
      |         hasSelectedRecordsRef = false
      |
      +-- 7. Update outputDS selection   <- query-task.tsx:1237-1241
      |   outputDS.selectRecordsByIds(recordIds, recordsToDisplay)
      |
      +-- 8. Dispatch state updates      <- query-task.tsx:1243-1248
      |   queryExecutionKeyRef += 1
      |   SET_RESULT_COUNT = recordsToDisplay.length
      |   SET_STAGE = 1 (show results)
      |   SET_QUERY_EXECUTED = true
      |
      +-- (r028.114 truncation alert dispatched LAST, see note below)
      |                                  <- query-task.tsx:1256-1265
      |
      +-- 9. Zoom to results            <- query-task.tsx:1267-1270
      |   zoomToRecords(recordsToDisplay)
      |   -> See FLOW-04-ZOOM.md
      |
      +-- return true
```

---

## Flow Diagram: executeSpatialQuery (Per-Layer Execution)

```
 executeSpatialQuery(params)           <- execute-spatial-query.ts:69
      |
      +-- For each targetLayerId (sequential — avoid overwhelming server):
      |   |                             <- execute-spatial-query.ts:93-94
      |   |
      |   +-- Resolve DataSource
      |   |   |
      |   |   +-- ds = DataSourceManager.getDataSource(layerId)
      |   |   |                          <- execute-spatial-query.ts:98
      |   |   |
      |   |   +-- ds is null AND targetUseDataSources has config?
      |   |   |   +-- createDataSourceByUseDataSource(Immutable(useDS))
      |   |   |   |   (lazy creation for group layer children)
      |   |   |   |                      <- execute-spatial-query.ts:104-106
      |   |   |   |
      |   |   |   +-- Creation failed? -> errors.push, continue
      |   |   |                          <- execute-spatial-query.ts:107-110
      |   |   |
      |   |   +-- Still no ds? -> errors.push, continue
      |   |                              <- execute-spatial-query.ts:112-115
      |   |
      |   +-- Get FeatureLayer
      |   |   ds.layer || ds.createJSAPILayerByDataSource()
      |   |   featureLayer.load()
      |   |                              <- execute-spatial-query.ts:117-118
      |   |
      |   +-- Resolve outFields ONCE per layer (Field Shredder, r025.048)
      |   |   |                          <- execute-spatial-query.ts:120-137
      |   |   +-- Has layerDefaultConfig for this layer?
      |   |   |   |
      |   |   |   +-- YES: Use designated query's field settings
      |   |   |   |   |
      |   |   |   |   +-- CustomTemplate?
      |   |   |   |   |   combineFields(null, titleExpr, objectIdField, contentExpr)
      |   |   |   |   |
      |   |   |   |   +-- SelectAttributes?
      |   |   |   |   |   combineFields(displayFields, titleExpr, objectIdField)
      |   |   |   |   |
      |   |   |   |   +-- PopupSetting?
      |   |   |   |       resolvePopupOutFields(ds, featureLayer)
      |   |   |   |       (r028.037: visible fieldInfos, then text
      |   |   |   |        {FIELD} token parsing, then all-fields fallback)
      |   |   |   |
      |   |   |   +-- NO: resolvePopupOutFields(ds, featureLayer)
      |   |   |       (fallback — same resolution chain as above)
      |   |
      |   +-- r028.101: For EACH input geometry (one per type):
      |   |   |                          <- execute-spatial-query.ts:148
      |   |   +-- query = featureLayer.createQuery()
      |   |   |   query.geometry = geom
      |   |   |   query.spatialRelationship = selectedRelationship
      |   |   |   query.returnGeometry = true
      |   |   |   query.outFields = outFields
      |   |   |
      |   |   +-- Buffer (server-side fallback): bufferDistance > 0?
      |   |   |   query.distance = bufferDistance; query.units = bufferUnit
      |   |   |                          <- execute-spatial-query.ts:156-159
      |   |   |
      |   |   +-- featureLayer.queryFeatures(query)
      |   |   |
      |   |   +-- Dedupe each returned feature into Map<objectId, Graphic>
      |   |       (a feature hit by more than one type is counted once)
      |   |                              <- execute-spatial-query.ts:165-171
      |   |
      |   +-- Build SpatialQueryLayerResult from the deduped Map
      |   |   { layerId, layerTitle, featureCount, featureSet (combined),
      |   |     queryTimeMs, exceededTransferLimit (ACTUAL truncation, r028.121),
      |   |     trueMatchCount (largest per-sub-query true total, r028.122) }
      |   |                              <- execute-spatial-query.ts:181-191
      |   |
      |   +-- catch -> errors.push({ layerId, error })
      |                                  <- execute-spatial-query.ts:205-214
      |
      +-- Return SpatialQueryResult
          { layerResults, totalFeatureCount, totalTimeMs, errors }
                                         <- execute-spatial-query.ts:220
```

**r028.114 — truncation alert:** after the pipeline returns, `query-task.tsx`
checks `layerResults.some(r => r.exceededTransferLimit)` and, if true, dispatches
`SET_TRUNCATION_ALERT` so the Results panel shows a "partial result set" popover
(`query-task.tsx:1256+`). This dispatch happens **last** (after ResultsMode
handling) because New mode's `clearResult` wipes alert state — an earlier dispatch
was set then immediately cleared before the Results panel rendered.

**r028.121 — spurious-flag guard:** `exceededTransferLimit` per layer is now driven by
*actual* truncation, not the raw service flag. When a sub-query is flagged, a count-only
query (`queryFeatureCount`, returnCountOnly) fetches the true matching count; the layer is
only truncated if `trueCount > returnedCount`. This suppresses spurious flags (e.g. an older
MapServer setting the flag on a multipart/multipoint query that returned every match). On a
count-query error, fall back to trusting the flag. Per-sub-query detail is logged as
`spatial-subquery-complete` (SPATIAL tag). Count-only runs only on flagged sub-queries.

**r028.122 — actual count in the alert:** each layer carries `trueMatchCount` (largest
per-sub-query true total — exact for one input geometry, a lower bound for several).
`query-task.tsx` sums the true total across all target layers (truncated -> true, complete ->
returned) and passes `totalMatchCount` + `totalMatchCountIsLowerBound` to the alert, so the
popover reads "matched {total}" / "matched at least {total}" (falling back to the generic
"{limit}-record limit" wording when the count couldn't be fetched). Recovering the missing
records remains TODO #28 (background pagination).

---

## Buffer Decision: Client-Side vs Server-Side

When a buffer distance is configured, the pipeline must decide whether to expand
the input geometry on the client or let the server apply `query.distance`.

| Scenario | Geometry Sent | query.distance | Reason |
|----------|--------------|----------------|--------|
| No buffer (distance = 0) | Per-type input geometries (one query each) | 0 | No expansion needed; each type queried and combined |
| Buffer active, bufferedGeometry available | Client-side buffered polygon | 0 | Preserves selected spatial relationship against actual buffered shape |
| Buffer active, bufferedGeometry unavailable | Per-type input geometries | parsedBuffer | Fallback to server-side per geometry; limited to intersects-like behavior |

**Why client-side is preferred:** Server-side `query.distance` internally applies an
intersects-style expansion regardless of the selected spatial relationship. By sending
the already-buffered polygon with `distance=0`, relationships like "within" and "crosses"
evaluate correctly against the expanded shape.

---

## Post-Execution Cleanup

| Condition | Buffer Reset | Draw Clear | Rationale |
|-----------|-------------|------------|-----------|
| Results found (return true) | `setBufferDistance('')` | `setDrawnGeometries([])` + `drawLayer.removeAll()` | Clean slate for next query |
| Zero results (return false) | Preserved | Preserved | User can adjust parameters and re-execute |
| All layers failed (throw) | Preserved (catch block) | Preserved (catch block) | User can fix issues and retry |

---

## Error Handling

| Error Scenario | Detection | User Feedback | Buffer/Draw State |
|----------------|-----------|---------------|-------------------|
| Single layer fails | `catch` in per-layer loop (execute-spatial-query.ts:205) | Partial results returned; error logged | N/A (query continues) |
| All layers fail | `layerResults.length === 0 && errors.length > 0` (query-task.tsx:1137) | `SET_QUERY_ERROR_ALERT` popover with concatenated error messages | Preserved (throw triggers catch in SpatialTabContent) |
| Zero results across all layers | `newRecords.length === 0` (query-task.tsx:1152) | `SET_NO_RESULTS_ALERT` popover | Preserved (returns false) |
| All results are duplicates (Add mode) | `duplicateRecordIds.length === newRecords.length` (query-task.tsx:1181) | `SET_ALL_DUPLICATES_ALERT` | Reset (returns true) |
| No records removed (Remove mode) | `recordsToDisplay.length === existingRecords.length` (query-task.tsx:1191) | `SET_NO_REMOVAL_ALERT` | Reset (returns true) |
| All records removed (Remove mode) | `isRemoveMode && recordsToDisplay.length === 0` (query-task.tsx:1226) | `clearSelectionInDataSources`, `hasSelectedRecordsRef = false` | Reset (returns true) |
| DataSource not available | `!ds` after creation attempt (execute-spatial-query.ts:112) | Skipped with error logged; other layers proceed | N/A |

---

## Decision Points

| Decision | Location | Options | Default |
|----------|----------|---------|---------|
| Input mode | SpatialTabContent toggle | Operations (accumulated records) / Draw (hand-drawn shapes, optionally folding in the current result geometries when the "Also include current results" checkbox is on, r028.118) | Smart default: Operations if results exist, Draw if not |
| Spatial relationship | Calcite combobox | contains, intersects, envelope-intersects, overlaps, within, touches, crosses | None (must select) |
| Buffer distance | TextInput + unit Select | 0 (disabled) or positive number with unit (feet/miles/meters/km) | 0 (no buffer) |
| Results mode | ResultsModeControl | New / Add / Remove | New |
| Target layers | AdvancedSelect multi-select | Layers from widget config (queryItems), including `spatialOnly` layers that are hidden from Query tab | None (must select) |
| Client vs server buffer | SpatialTabContent onClick | Client-side bufferedGeometry (when available) / server-side query.distance (fallback) | Client-side |
| Sequential layer execution | execute-spatial-query.ts:93-94 | Sequential (current) | Sequential (avoid overwhelming shared ArcGIS Server) |

---

## Compatibility Warnings

The UI provides two categories of warnings before execution:

**Geometry dimension compatibility** (r025.030): Certain spatial relationships
require same-dimension or different-dimension geometry pairs. The `compatibilityWarning`
memo checks source vs target geometry types against the selected relationship's
`dimensionConstraint` and warns when results will be empty.

**Relationship + geometry + buffer combinations** (r025.040): The `relationshipWarning`
memo provides context-aware guidance (e.g., "Within requires an area -- add a buffer"
for point sources without buffer, "Touches with buffer will likely return 0 results").

---

## Spatial Result Default Template (r025.048)

Each layer can have one query designated as the **spatial result default** via
`isSpatialResultDefault: true` in the query config. This enables two behaviors:

**1. Smart outFields:** Instead of always using `resolvePopupOutFields()` (which reads
popup template fields), the spatial query engine checks the designated query's
`resultFieldsType` and uses the same 3-branch pattern as `direct-query.ts`:
- **CustomTemplate** → `combineFields(null, titleExpr, objectIdField, contentExpr)`
- **SelectAttributes** → `combineFields(displayFields, titleExpr, objectIdField)`
- **PopupSetting** → `resolvePopupOutFields(ds, featureLayer)` (r028.037: now parses text content for `{FIELD}` tokens when fieldInfos visible yields nothing)

**2. Real configId stamping:** Records are stamped with the designated query's `configId`
(e.g., `'q_abc123'`) instead of the fixed string `'spatial'`. This allows SimpleList's
existing template resolution pipeline (`queries.find(q => q.configId === configId)` →
`getPopupTemplate()`) to work automatically — no changes needed to `simple-list.tsx`,
`query-result.tsx`, or `query-utils.ts`.

**Settings enforcement:**
- Per-layer uniqueness: only one query per layer can be the default
- Auto-default: first query added for a layer is automatically set
- Deletion reassignment: if the default query is deleted, first remaining query for
  that layer becomes the new default

---

*Last updated: r028.143 (2026-08-14) — Execute flow now starts with the aria-disabled refusal guard (isExecuting silent, !canExecute names the first unmet requirement); r028.151 removed the combobox's native disabled gating. Prior: r028.119 (2026-06-02) -- Input Geometry Preparation is now EVENT-DRIVEN: allInputGeometries is rebuilt only on real input events (draw end/edit/clear, toggle, mode change, smart-default, and an operations-mode prop-sync), via assembleForDraw/assembleForOperations/assembleInputGeometries — not a useEffect watching state. Fixes the r028.118 buffer-redraw-after-clear regression. NOTE: the r028.119 refactor added ~35 lines above the Apply/executeSpatialQuery sections, so SpatialTabContent.tsx refs below the assembly (Execute onClick, handleExecuteSpatialQuery) have shifted from the values in the r028.118 audit — re-verify if consulting those exact lines. Prior r028.118: "Also include current results" checkbox folds result geometries into the draw input.*
