# FLOW-04: Zoom to Records

## Overview

Zooms the map to the extent of query result records with configurable expansion.
Handles point, polygon, polyline, and multipoint geometries. Single points
receive a fixed-distance buffer before the expansion factor is applied.

**Key files:**
- `query-simple/src/runtime/zoom-utils.ts` — core zoom logic
- `query-simple/src/runtime/managers/use-zoom-to-records.ts` — React hook wrapper
- `query-simple/src/runtime/query-execution-handler.ts` — auto-zoom after query (r024.128, extracted from query-task.tsx)
- `query-simple/src/runtime/query-result.tsx` — zoom on row click
- `query-simple/src/data-actions/zoom-to-action.tsx` — data action entry point

---

## Entry Points

| Trigger | Location | Description |
|---------|----------|-------------|
| Auto-zoom after query | `query-execution-handler.ts:948` | Calls `zoomToRecords(recordsForZoom)` after results load |
| Click result row | `query-result.tsx:989` | Zooms to single record on click |
| Zoom-to button | `query-result.tsx:1022` | Manual zoom button on result item |
| Zoom data action | `zoom-to-action.tsx:136` | ExB data action for external consumers |
| Cached extent zoom | `query-result.tsx:602` | Uses pre-cached extent via `expandExtentByFactor()` |

---

## Flow Diagram

```
 Entry Point (query-task / query-result / data-action)
      │
      ▼
 useZoomToRecords(mapView)          ← managers/use-zoom-to-records.ts:16
      │  React.useCallback wrapper
      │  Returns async (records, options?) => void
      │
      ▼
 zoomToRecords(mapView, records, options?)   ← zoom-utils.ts:366
      │
      ├── Guard: !mapView || !records → early exit   :371
      │
      ├── Extract extents from records               :400-420
      │   ├── record.getJSAPIGeometry()
      │   ├── Point without .extent?
      │   │   └── YES → new Extent({ x, x, y, y, sr })   :408-414
      │   └── Other type → geom.extent                    :418
      │
      ├── Filter null extents                        :420
      │   └── No extents? → early exit               :429-436
      │
      ├── Single vs Multi extent                     :440-478
      │   ├── Single → use directly                  :442
      │   └── Multiple → union loop                  :460-463
      │       extent = extents[0].clone()
      │       for i in 1..n: extent = extent.union(extents[i])
      │
      ├── Zero-area check                            :486
      │   └── width === 0 || height === 0?
      │       └── YES + has SR →
      │           ├── isMetricSpatialReference(sr)    :256
      │           │   ├── 3857/102100 → metric (meters)
      │           │   ├── 4326 → metric
      │           │   └── 2225-2284 → feet (State Plane)
      │           ├── bufferDist = feet × 0.3048 (metric)
      │           │              or feet directly (feet SR)
      │           └── expandZeroAreaExtent(extent, bufferDist)   :297
      │               center ± bufferDist in all directions
      │
      ├── Apply expansion factor                     :533-548
      │   centerX = (xmin + xmax) / 2
      │   centerY = (ymin + ymax) / 2
      │   halfW = width / 2 × factor
      │   halfH = height / 2 × factor
      │   extent = { center - halfW, center + halfW, ... }
      │
      └── mapView.goTo(extent)                       :611
          └── Store original extent on window        :642-646
              for calibration tool
```

---

## Pre-cached Extent Path

For accumulated results, extent is calculated once when records change, then
reused on subsequent zoom/pan actions:

```
 Records change (query-task.tsx / widget.tsx)
      │
      ▼
 calculateRecordsExtent(records)             ← zoom-utils.ts:107
      │
      ├── Guard: !records || empty → null    :108
      ├── Extract extents (same as above)    :123-143
      ├── Filter nulls                       :143
      ├── SR Validation Guard                :156-168
      │   └── extents.length > 1?
      │       └── Check all WKIDs match
      │           └── Mismatch → log WARNING (BUG-EXTENT-CACHE-001)
      ├── Union loop                         :172-176
      └── Return raw extent                  :193
           │
           ▼
      Stored as cachedResultsExtent (widget.tsx:1239)
           │
           ▼
      On zoom request:
      expandExtentByFactor(cachedExtent, factor, sr, bufferFt)
                                             ← zoom-utils.ts:208
           │
           ├── Clone extent                  :214
           ├── Zero-area buffer (if needed)  :219-226
           ├── Apply expansion factor        :228-241
           └── Return expanded extent
                │
                ▼
           mapView.goTo(expandedExtent)      ← query-result.tsx:628
```

---

## Spatial Reference Safety

**Assumption:** All records share the map's spatial reference. Enforced upstream
by `direct-query.ts` setting `query.outSpatialReference = mapView.spatialReference`
(added in r024.111 to fix BUG-EXTENT-CACHE-001).

**Runtime guard:** `calculateRecordsExtent()` checks all extent WKIDs before
union (zoom-utils.ts:156-168). Mismatches are logged but do not block the operation.

**Unit conversion:** Zero-area buffer converts feet to the SR's native unit:
- Web Mercator (3857): 300 ft × 0.3048 = 91.44 m
- State Plane feet (2225-2284): 300 ft used directly

---

## Constants

| Constant | Value | Location | Description |
|----------|-------|----------|-------------|
| `DEFAULT_EXTENT_EXPANSION_FACTOR` | `1.2` | zoom-utils.ts:61 | 20% expansion (10% each side) |
| `DEFAULT_ZERO_AREA_BUFFER_FEET` | `300` | zoom-utils.ts:70 | 600 ft × 600 ft around points |
| `FEET_TO_METERS` | `0.3048` | zoom-utils.ts:73 | Conversion factor |

---

## Debug Logging

Filter console by `[QUERYSIMPLE-ZOOM]` to trace the complete zoom operation.

| Event | When |
|-------|------|
| `zoom-start` | Entry with config summary |
| `extents-extracted` | After geometry → extent mapping |
| `extent-calculated-single` / `-union` | After extent calculation |
| `zero-area-check` | Before buffer decision |
| `zero-area-extent-expanded` | After point buffer applied |
| `extent-expanded-by-factor` | After expansion factor applied |
| `calling-mapView-goTo` | Final extent before goTo |
| `extent-coordinates-after-zoom` | Map extent after goTo completes |
| `calculateRecordsExtent-SR-MISMATCH-WARNING` | Mixed SRs detected |

---

## Calibration Tool

After any auto-zoom, run in browser console:
```js
window.__querySimpleCaptureAdjustedExtent()
```
Manually adjust the map, then run again to calculate the optimal expansion factor.
Defined at zoom-utils.ts:682.

---

## Test Coverage

`tests/zoom-utils.test.ts` — 18 tests covering:
- `calculateRecordsExtent`: null/empty inputs, point records, polygon records, mixed types, null geometry filtering, logging, SR mismatch warning
- `expandExtentByFactor`: default factor, custom factor, zero-area with metric SR, zero-area with feet SR, no SR provided, factor after buffer

---

*Last updated: r027.017 (2026-04-06) — corrected query-result.tsx and query-execution-handler.ts line numbers*
