# Release v1.19.0-r024.111

**Release Date:** 2026-03-02
**Experience Builder Version:** 1.19.0+

## Highlights

This release fixes a spatial reference mismatch bug that caused "Zoom to All Results" and "Pan to Results" to navigate to incorrect locations when accumulating results from different data sources in Add mode.

---

## Multi-Source Extent Cache Fix (r024.111)

**BUG-EXTENT-CACHE-001: Zoom/pan broken when accumulating results from different data sources.**

### The Problem

When using Add mode to accumulate results from different feature layers (e.g., Parcels + Parks), the "Zoom to All Results" button would zoom out to show half the earth instead of focusing on the actual results.

**Root cause:** Each feature layer returns geometries in its native spatial reference. The Parcels layer returns Web Mercator (WKID 102100) while the Parks layer returns Washington State Plane (feet). The extent union performed raw min/max coordinate math without projecting to a common spatial reference, producing an extent spanning ~14.9 million meters.

### The Fix

Direct query execution now sets `query.outSpatialReference = mapView.spatialReference`, instructing the ArcGIS REST API to project all geometries to the map's spatial reference before returning results. This is a server-side operation with zero client-side overhead.

### What Changed

- `direct-query.ts`: Added `outSpatialReference` option, set on query object
- `query-task.tsx`: Passes `mapView.spatialReference` when calling `executeDirectQuery()`

### Debug Verification

Use `?debug=ZOOM,RESULTS-MODE,WIDGET-STATE,DIRECT-QUERY` to verify the fix. After multi-source accumulation, the `calculateRecordsExtent-complete` log should show reasonable `width`/`height` values (hundreds of meters, not millions) with a consistent `spatialReference`.

---

## Installation

Copy the widget folders to your Experience Builder installation:

```
your-extensions/widgets/
  query-simple/
  helper-simple/
  shared-code/
```

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Backward Compatibility

- All changes are backward compatible
- No migration required
- Layers that already return geometries in the map's SR are unaffected

## Documentation

- [README](../README.md) - Installation and configuration
- [CHANGELOG](../CHANGELOG.md) - Full change history
