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
- `query-simple/src/runtime/query-task.tsx` -- `handleExecuteSpatialQuery` orchestration (lines ~1057-1219)
- `query-simple/src/runtime/managers/use-buffer-preview.ts` -- client-side buffer geometry (used when buffer > 0)
- `query-simple/src/runtime/results-management-utils.ts` -- merge/remove/dedup utilities
- `query-simple/src/runtime/query-utils.ts` -- `resolvePopupOutFields` + `combineFields` (shared Field Shredder)
- `query-simple/src/config.ts` -- `QueryItemType.isSpatialResultDefault` flag

---

## Entry Points

| Trigger | Location | Description |
|---------|----------|-------------|
| User clicks "Run spatial query" (Operations mode) | `SpatialTabContent.tsx:823` | Execute button onClick, accumulated records as input |
| User clicks "Run spatial query" (Draw mode) | `SpatialTabContent.tsx:823` | Execute button onClick, drawn geometries as input |

---

## Flow Diagram: Input Geometry Preparation

```
 SpatialTabContent mounts / accumulatedRecords change / drawnGeometries change
      |
      +-- spatialMode?
      |
      +-- 'draw' ──────────────────────────────────────────────┐
      |   drawnGeometries[] passed directly                    |
      |   setAllInputGeometries(drawnGeometries)               |
      |                          <- SpatialTabContent.tsx:275  |
      |                                                        |
      +-- 'operations' ───────────────────────────────────────┐|
          |                                                   ||
          +-- No accumulatedRecords? -> []                    ||
          |                                                   ||
          +-- Extract geometries from accumulatedRecords      ||
          |   records.map(r => r.feature.geometry)            ||
          |   .filter(Boolean)                                ||
          |                          <- SpatialTabContent.tsx:286-288
          |                                                   ||
          +-- Single geometry? -> [geometry]                  ||
          |                                                   ||
          +-- Multiple geometries:                            ||
              |                                               ||
              +-- Group by type (Map<string, Geometry[]>)     ||
              |   point[], polyline[], polygon[]              ||
              |                          <- SpatialTabContent.tsx:309-314
              |                                               ||
              +-- Union within each group                     ||
              |   unionOperator.executeMany(geoms)            ||
              |                          <- SpatialTabContent.tsx:321
              |                                               ||
              +-- setAllInputGeometries(unionedParts[])       ||
                                         <- SpatialTabContent.tsx:325
                                                              ||
      <───────────────────────────────────────────────────────┘|
      |                                                        |
      +-- Derive inputGeometry (highest dimension for warnings)
      |   allInputGeometries.length === 1 -> [0]
      |   multiple -> sort by GEOM_TYPE_DIMENSION descending, take [0]
      |                          <- SpatialTabContent.tsx:263-271
      |
      +-- Buffer preview (real-time on map)
          useBufferPreview({ inputGeometries: allInputGeometries, ... })
                                   <- SpatialTabContent.tsx:354-361
```

---

## Flow Diagram: Execute Button (onClick)

```
 User clicks "Run spatial query"       <- SpatialTabContent.tsx:823
      |
      +-- Guard: !canExecute || isExecuting || !inputGeometry -> exit
      |                                 <- SpatialTabContent.tsx:824
      |
      +-- setIsExecuting(true)          <- SpatialTabContent.tsx:826
      |
      +-- Dismiss previous alerts       <- SpatialTabContent.tsx:828-829
      |
      +-- Buffer decision:
      |   |
      |   +-- parsedBuffer > 0 AND bufferedGeometry exists?
      |   |   |
      |   |   +-- YES: Use client-side bufferedGeometry
      |   |   |   inputGeometry = bufferedGeometry
      |   |   |   bufferDistance = 0 (already applied client-side)
      |   |   |                     <- SpatialTabContent.tsx:838-839
      |   |   |
      |   |   +-- NO: Use raw inputGeometry
      |   |       bufferDistance = parsedBuffer (server-side via query.distance)
      |   |                         <- SpatialTabContent.tsx:841
      |   |
      |   +-- Why client-side preferred:
      |       Server-side query.distance only applies "intersects" logic.
      |       Client-side buffered geometry preserves the selected spatial
      |       relationship (within, crosses, etc.) against the actual
      |       buffered shape.
      |
      +-- await onExecuteSpatialQuery({
      |     inputGeometry, selectedRelationship, selectedLayers,
      |     bufferDistance, bufferUnit, resultsMode
      |   })                            <- SpatialTabContent.tsx:837-844
      |   |
      |   +-- Returns boolean: true = results found, false = zero results
      |
      +-- Post-execution cleanup (on success):
      |   |
      |   +-- hasResults === true?
      |       |
      |       +-- setBufferDistance('')   <- SpatialTabContent.tsx:847
      |       |
      |       +-- Draw mode?
      |           +-- setDrawnGeometries([])
      |           +-- drawLayer.removeAll()
      |                                  <- SpatialTabContent.tsx:849-855
      |
      +-- catch: error already handled via dispatch (buffer preserved)
      |                                  <- SpatialTabContent.tsx:857-858
      |
      +-- finally: setIsExecuting(false) <- SpatialTabContent.tsx:860
```

---

## Flow Diagram: handleExecuteSpatialQuery (Orchestration)

```
 handleExecuteSpatialQuery(params)     <- query-task.tsx:1057
      |
      +-- Track origin tab: lastQueryOriginTabRef = 'spatial'
      |                                 <- query-task.tsx:1066
      |
      +-- dispatch(SET_STAGE, 2) -> show "Retrieving..."
      |                                 <- query-task.tsx:1069
      |
      +-- Build targetLayerIds from selectedLayers
      |   params.selectedLayers.map(l => String(l.value))
      |                                 <- query-task.tsx:1071
      |
      +-- Build targetUseDataSources map for lazy DS creation
      |   queryItems.forEach -> match dsId to targetLayerIds
      |                                 <- query-task.tsx:1074-1080
      |
      +-- Build layerDefaultConfigs + layerDefaultConfigIds (r025.048)
      |   queryItems.forEach -> find isSpatialResultDefault per layer
      |   layerDefaultConfigs[dsId] = queryItem (for outField resolution)
      |   layerDefaultConfigIds[dsId] = configId (for record stamping)
      |                                 <- query-task.tsx:~1082-1092
      |
      +-- 1. executeSpatialQuery({..., layerDefaultConfigs})
      |                                 <- execute-spatial-query.ts:56
      |   |   (see "executeSpatialQuery" flow below)
      |   |
      |   +-- Returns SpatialQueryResult:
      |       { layerResults[], totalFeatureCount, totalTimeMs, errors[] }
      |
      +-- All layers failed?            <- query-task.tsx:1113
      |   (layerResults.length === 0 && errors.length > 0)
      |   |
      |   +-- YES: dispatch(SET_STAGE, 1)
      |   |        dispatch(SET_QUERY_ERROR_ALERT)
      |   |        throw Error('spatial-query-failed')
      |   |        (throw ensures SpatialTabContent catch runs -> buffer preserved)
      |   |                              <- query-task.tsx:1114-1120
      |   |
      |   +-- NO: continue
      |
      +-- 2. convertSpatialResultsToRecords(result, widgetId, layerDefaultConfigIds)
      |   |                              <- query-task.tsx:~1128
      |   |                              <- execute-spatial-query.ts:169
      |   |
      |   +-- For each layerResult with featureCount > 0:
      |       +-- Get DataSource for layerId
      |       +-- Set sourceLayer on each graphic (matches direct-query.ts pattern)
      |       +-- ds.buildRecord(graphic) -> FeatureDataRecord
      |       +-- Stamp __queryConfigId = layerDefaultConfigIds[layerId] || 'spatial'
      |       |   (r025.048: real configId enables SimpleList template resolution)
      |       +-- Stamp __originDSId = ds.id
      |       +-- Stamp __spatialLayerTitle = layerResult.layerTitle
      |
      +-- 3. Zero results?              <- query-task.tsx:1127
      |   |
      |   +-- YES: dispatch(SET_NO_RESULTS_ALERT)
      |   |        dispatch(SET_STAGE, 1)
      |   |        return false (buffer preserved, draw preserved)
      |   |                              <- query-task.tsx:1128-1131
      |   |
      |   +-- NO: continue
      |
      +-- 4. Apply ResultsMode          <- query-task.tsx:1133-1168
      |   |
      |   +-- NewSelection:
      |   |   +-- clearResult() if existing records
      |   |   +-- recordsToDisplay = newRecords
      |   |                              <- query-task.tsx:1143-1148
      |   |
      |   +-- AddToSelection:
      |   |   +-- mergeResultsIntoAccumulated(outputDS, newRecords, existing)
      |   |   +-- { mergedRecords, duplicateRecordIds }
      |   |   +-- All duplicates? -> SET_ALL_DUPLICATES_ALERT
      |   |                              <- query-task.tsx:1149-1158
      |   |
      |   +-- RemoveFromSelection:          <- query-task.tsx:1174-1189
      |       +-- existingRecords empty? -> recordsToDisplay = []
      |       +-- else: removeResultsFromAccumulated(outputDS, newRecords, existing)
      |       +-- No records removed? -> SET_NO_REMOVAL_ALERT
      |       +-- Close popup if visible (r025.052)
      |
      +-- 5. Update parent state
      |   onAccumulatedRecordsChange(recordsToDisplay)
      |   recordsRef.current = recordsToDisplay
      |                                  <- query-task.tsx:1194-1196
      |
      +-- 6. Graphics on map             <- query-task.tsx:1198-1222
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
      +-- 7. Update outputDS selection   <- query-task.tsx:1224-1228
      |   outputDS.selectRecordsByIds(recordIds, recordsToDisplay)
      |
      +-- 8. Dispatch state updates      <- query-task.tsx:1230-1235
      |   queryExecutionKeyRef += 1
      |   SET_RESULT_COUNT = recordsToDisplay.length
      |   SET_STAGE = 1 (show results)
      |   SET_QUERY_EXECUTED = true
      |
      +-- 9. Zoom to results            <- query-task.tsx:1237-1240
      |   zoomToRecords(recordsToDisplay)
      |   -> See FLOW-04-ZOOM.md
      |
      +-- return true
```

---

## Flow Diagram: executeSpatialQuery (Per-Layer Execution)

```
 executeSpatialQuery(params)           <- execute-spatial-query.ts:56
      |
      +-- For each targetLayerId (sequential — avoid overwhelming server):
      |   |                             <- execute-spatial-query.ts:80
      |   |
      |   +-- Resolve DataSource
      |   |   |
      |   |   +-- ds = DataSourceManager.getDataSource(layerId)
      |   |   |                          <- execute-spatial-query.ts:84
      |   |   |
      |   |   +-- ds is null AND targetUseDataSources has config?
      |   |   |   +-- createDataSourceByUseDataSource(Immutable(useDS))
      |   |   |   |   (lazy creation for group layer children)
      |   |   |   |                      <- execute-spatial-query.ts:90-91
      |   |   |   |
      |   |   |   +-- Creation failed? -> errors.push, continue
      |   |   |                          <- execute-spatial-query.ts:93-96
      |   |   |
      |   |   +-- Still no ds? -> errors.push, continue
      |   |                              <- execute-spatial-query.ts:98-101
      |   |
      |   +-- Get FeatureLayer
      |   |   ds.layer || ds.createJSAPILayerByDataSource()
      |   |   featureLayer.load()
      |   |                              <- execute-spatial-query.ts:103-104
      |   |
      |   +-- Build JSAPI Query
      |   |   query = featureLayer.createQuery()
      |   |   query.geometry = inputGeometry
      |   |   query.spatialRelationship = selectedRelationship
      |   |   query.returnGeometry = true
      |   |                              <- execute-spatial-query.ts:107-110
      |   |
      |   +-- Field Shredder (smart resolution, r025.048)
      |   |   |
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
      |   |   |   |
      |   |   |   +-- NO: resolvePopupOutFields(ds, featureLayer)
      |   |   |       (fallback — same as pre-r025.048 behavior)
      |   |   |                              <- execute-spatial-query.ts:~113
      |   |   |                              <- query-utils.ts:21 (combineFields)
      |   |   |                              <- query-utils.ts:48 (resolvePopupOutFields)
      |   |
      |   +-- Buffer (server-side fallback)
      |   |   bufferDistance > 0?
      |   |   +-- query.distance = bufferDistance
      |   |   +-- query.units = bufferUnit
      |   |                              <- execute-spatial-query.ts:116-119
      |   |
      |   +-- featureLayer.queryFeatures(query)
      |   |                              <- execute-spatial-query.ts:121
      |   |
      |   +-- Build SpatialQueryLayerResult
      |   |   { layerId, layerTitle, featureCount, featureSet,
      |   |     queryTimeMs, exceededTransferLimit }
      |   |                              <- execute-spatial-query.ts:124-131
      |   |
      |   +-- catch -> errors.push({ layerId, error })
      |                                  <- execute-spatial-query.ts:144-153
      |
      +-- Return SpatialQueryResult
          { layerResults, totalFeatureCount, totalTimeMs, errors }
                                         <- execute-spatial-query.ts:159
```

---

## Buffer Decision: Client-Side vs Server-Side

When a buffer distance is configured, the pipeline must decide whether to expand
the input geometry on the client or let the server apply `query.distance`.

| Scenario | Geometry Sent | query.distance | Reason |
|----------|--------------|----------------|--------|
| No buffer (distance = 0) | Raw inputGeometry | 0 | No expansion needed |
| Buffer active, bufferedGeometry available | Client-side buffered polygon | 0 | Preserves selected spatial relationship against actual buffered shape |
| Buffer active, bufferedGeometry unavailable | Raw inputGeometry | parsedBuffer | Fallback to server-side; limited to intersects-like behavior |

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
| Single layer fails | `catch` in per-layer loop (execute-spatial-query.ts:144) | Partial results returned; error logged | N/A (query continues) |
| All layers fail | `layerResults.length === 0 && errors.length > 0` (query-task.tsx:1113) | `SET_QUERY_ERROR_ALERT` popover with concatenated error messages | Preserved (throw triggers catch in SpatialTabContent) |
| Zero results across all layers | `newRecords.length === 0` (query-task.tsx:1127) | `SET_NO_RESULTS_ALERT` popover | Preserved (returns false) |
| All results are duplicates (Add mode) | `duplicateRecordIds.length === newRecords.length` (query-task.tsx:1156) | `SET_ALL_DUPLICATES_ALERT` | Reset (returns true) |
| No records removed (Remove mode) | `recordsToDisplay.length === existingRecords.length` (query-task.tsx:1181) | `SET_NO_REMOVAL_ALERT` | Reset (returns true) |
| All records removed (Remove mode) | `isRemoveMode && recordsToDisplay.length === 0` (query-task.tsx:1213) | `clearSelectionInDataSources`, `hasSelectedRecordsRef = false` | Reset (returns true) |
| DataSource not available | `!ds` after creation attempt (execute-spatial-query.ts:98) | Skipped with error logged; other layers proceed | N/A |

---

## Decision Points

| Decision | Location | Options | Default |
|----------|----------|---------|---------|
| Input mode | SpatialTabContent toggle | Operations (accumulated records) / Draw (hand-drawn shapes) | Smart default: Operations if results exist, Draw if not |
| Spatial relationship | Calcite combobox | contains, intersects, envelope-intersects, overlaps, within, touches, crosses | None (must select) |
| Buffer distance | TextInput + unit Select | 0 (disabled) or positive number with unit (feet/miles/meters/km) | 0 (no buffer) |
| Results mode | ResultsModeControl | New / Add / Remove | New |
| Target layers | AdvancedSelect multi-select | Layers from widget config (queryItems), including `spatialOnly` layers that are hidden from Query tab | None (must select) |
| Client vs server buffer | SpatialTabContent onClick | Client-side bufferedGeometry (when available) / server-side query.distance (fallback) | Client-side |
| Sequential layer execution | execute-spatial-query.ts:80 | Sequential (current) | Sequential (avoid overwhelming shared ArcGIS Server) |

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
- **PopupSetting** → `resolvePopupOutFields(ds, featureLayer)` (unchanged)

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

*Last updated: r025.052 (2026-03-11)*
