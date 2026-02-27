# Release v1.19.0-r024.79

**Release Date:** 2026-02-27  
**Experience Builder Version:** 1.19.0+

## Highlights

This release adds Export CSV functionality to the ResultsMenu, performance optimizations for zoom/pan operations, and fixes for multi-source data handling.

---

## Export CSV with Full Attributes (r024.78-79)

**Export your query results to CSV with complete attribute data.**

### What's New

The ResultsMenu now includes an "Export CSV" option that downloads all result attributes, not just the fields displayed in the widget.

- **Single source:** Downloads a `.csv` file named after the data source
- **Multiple sources:** Downloads a `QueryResults.zip` containing one CSV per source

### Technical Details

The export re-queries the original data source with `outFields: ['*']` to fetch all attributes, matching the behavior of "View in Table." This ensures the CSV contains every field available in the layer, not just the configured display fields.

**Implementation notes:**
- Custom `recordsToCSV` function (jimu-core's toCSV is internal/non-exportable)
- Uses actual OBJECTID from feature attributes for multi-source support
- Properly escapes CSV values (commas, quotes, newlines)
- Excludes internal tracking fields (`__queryConfigId`, `__originDSId`)
- Falls back to client-side attributes if re-query fails

---

## Cached Results Extent (r024.74-75)

**Zoom and Pan operations are now faster and more consistent.**

### The Problem

Previously, clicking "Zoom to Selected" or "Pan to" recalculated the combined extent of all results on every click. With large result sets, this caused noticeable delay.

### Solution

The combined extent is now calculated once when results change and cached in widget state. Both Zoom and Pan use this pre-calculated extent.

**Performance improvement:** Eliminates redundant `geometryEngine.union()` calls on every user interaction.

**Architecture:**
```
Records change → calculateRecordsExtent() → resultsExtent state
                                                  ↓
                          QueryTaskList → QueryTask → QueryTaskResult
                                                            ↓
                                            Zoom button: uses cached extent
                                            ResultsMenu Pan: uses cached extent
```

---

## Multi-Source View in Table Fix (r024.76)

**View in Table now correctly shows all data sources as separate tabs.**

### The Problem

When accumulating records from different feature layers (using Add mode), "View in Table" was only showing the last queried layer in the Table widget.

### Root Cause

The `actionDataSets` grouping logic used `record.getDataSource()` which returns the shared output data source after accumulation, losing the original source identity.

### Solution

Records are now grouped by their stamped `__originDSId` attribute, which is set during accumulation. The DataSourceManager looks up the actual origin data source for proper grouping.

---

## ResultsMenu Cleanup (r024.77)

**Removed duplicate "Pan to" from the menu.**

### The Problem

The ResultsMenu was using Esri's `DataActionList` component for export functionality, but it also rendered Esri's default "Pan to" action, duplicating our custom Pan to.

### Solution

Removed `DataActionList` entirely. The ResultsMenu now contains only our custom actions:
- Pan to (centers on all results)
- View in table (opens Table widget with all sources)
- Export CSV (downloads full attributes)
- Select on map (adds to native selection)

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
- Default behaviors unchanged unless explicitly configured

## Documentation

- [README](../README.md) - Installation and configuration
- [CHANGELOG](../CHANGELOG.md) - Full change history
