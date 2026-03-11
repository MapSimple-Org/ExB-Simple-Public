# Release v1.19.0-r025.057

**Release Date:** 2026-03-11
**Experience Builder Version:** 1.19.0+
**Previous Release:** [v1.19.0-r025.055](RELEASE_v1.19.0-r025.055.md)

## Highlights

This is a patch release focused on **UI consistency** and a **bug fix**. The Spatial and Query tabs now share identical button patterns (Apply + always-visible Reset), and a buffer preview ghost graphic that persisted across widget close/reopen has been resolved.

---

## Button Consistency — Apply + Reset (r025.056)

Unified the button pattern across both tabs for a consistent user experience.

### Changes

| Area | Before | After |
|------|--------|-------|
| **Query tab** — Execute button | "Apply" | "Apply" (unchanged) |
| **Query tab** — Reset button | Always active | Disabled when no filters are dirty |
| **Spatial tab** — Execute button | "Run Spatial Query" | "Apply" |
| **Spatial tab** — Reset button | Did not exist | Always visible, disabled when nothing to reset |

### Spatial Reset Behavior

Clears all spatial inputs back to defaults:
- Buffer distance → 0
- Buffer units → Feet
- Spatial relationship → cleared
- Target layers → cleared
- Drawn geometries → cleared (Draw mode)
- Buffer preview graphic → removed from map

### Query Reset Behavior Update

Reset is now smart — disabled when no filters have been modified from their initial state. Uses pristine check: `attributeFilterSqlExprObj === sqlExprObj`.

---

## Bug Fix — Buffer Preview Ghost (r025.057)

### Problem

After running a spatial query with a buffer, closing and reopening the widget would show the old buffer preview graphic on the map until switching tabs.

### Root Cause

`useBufferPreview` stored the buffer graphic in `GraphicsStateManager` for panel close/reopen restoration, but never cleared it when the buffer was legitimately removed (distance reset to 0 after successful query). `selection-restoration-manager` then restored the stale graphic on widget reopen.

### Fix

Call `graphicsStateManager.deleteLastBufferGraphic(widgetId)` when the buffer is cleared (disabled, distance=0, no geometry) and on component unmount.

**File:** `query-simple/src/runtime/managers/use-buffer-preview.ts`

---

## What Changed

| File | Lines | Change |
|------|-------|--------|
| `SpatialTabContent.tsx` | 995 | Renamed button to "Apply", added Reset with full clear logic |
| `query-task-form.tsx` | 1,377 | Smart disabled state for Reset (pristine check) |
| `use-buffer-preview.ts` | 368 | Clear stored graphic on buffer removal + unmount |
| `default.ts` (translations) | 89 | Updated i18n key from "search" to "apply" |

**Tests:** 259 across 16 suites — all passing

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

- All existing configurations work unchanged
- No migration required

## Debugging

Relevant debug tags:

| Tag | What it tracks |
|-----|----------------|
| `SPATIAL` | Spatial tab query execution, buffer, results |
| `BUFFER` | Buffer preview lifecycle, graphic creation/removal |

Enable via URL: `?debug=SPATIAL,BUFFER`
