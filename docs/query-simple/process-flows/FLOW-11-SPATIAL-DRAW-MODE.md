# FLOW-11: Spatial Tab Draw Mode

End-to-end flow for JimuDraw integration in the Spatial tab's Draw mode.

## Overview

The Spatial tab provides two modes: Operations (search from accumulated query
results) and Draw (search from user-drawn shapes on the map). Draw mode uses
Esri's JimuDraw component to let users sketch points, polylines, polygons,
rectangles, circles, freehand lines, and freehand polygons directly on the map. Drawn shapes accumulate into a
multi-shape collection that becomes the input geometry for spatial queries.

The mode toggle, smart defaults, geometry accumulation, and post-query cleanup
are all managed within `SpatialTabContent.tsx`.

### Key Files

| File | Purpose |
|------|---------|
| `runtime/tabs/SpatialTabContent.tsx` | Component: mode toggle, JimuDraw rendering, geometry accumulation, smart defaults, post-query cleanup |
| `jimu-ui/advanced/map` (JimuDraw) | Esri drawing widget: sketch tools, continuous creation mode, draw layer management |
| `runtime/managers/use-buffer-preview.ts` | Hook: receives drawn geometries as `inputGeometries`, renders buffer preview on map |
| `runtime/execute-spatial-query.ts` | Receives `inputGeometries` (array, r028.101): the per-type drawn geometries (or `[bufferedGeometry]` when buffered) for spatial query execution |
| `runtime/query-task.tsx` | Parent: threads `jimuMapView` prop down to SpatialTabContent, handles `onExecuteSpatialQuery` callback |
| `runtime/query-task-list.tsx` | Intermediary: passes `jimuMapView` from widget to QueryTask |
| `runtime/widget.tsx` | Root: obtains `jimuMapView` from `JimuMapViewComponent`, stores in state |

---

## 1. Module Lazy Loading

JimuDraw lives in `jimu-ui/advanced/map`, a large module that is lazy-loaded
once on component mount to avoid blocking initial render.

```
SpatialTabContent mounts
  |
  v
useEffectOnce fires
  |
  v
moduleLoader.loadModule('jimu-ui/advanced/map')
  |
  +-- Promise resolves ---------> setMapModule(result)
  |                                  |
  |                                  v
  |                               mapModule.JimuDraw available
  |                                  |
  |                                  v
  |                               Render JimuDraw component
  |
  +-- Promise rejects ----------> debugLogger: 'spatial-draw-module-load-error'
  |                               mapModule stays null
  |
  v
While mapModule === null:
  Render <StatusIndicator Loading />  (spinner placeholder)
```

---

## 2. JimuDraw Configuration

When the module is loaded and `jimuMapView` is available, JimuDraw renders
with a specific configuration for spatial search use:

```
mapModule.JimuDraw
  |
  +-- jimuMapView = {jimuMapView}          <-- Required: map context
  +-- operatorWidgetId = {widgetId}        <-- Scopes draw layer to this widget
  +-- disableSymbolSelector = true         <-- No custom symbology needed
  |
  +-- drawingOptions:
  |     +-- creationMode = Continuous      <-- Multi-shape: stays in draw mode
  |     +-- updateOnGraphicClick = false   <-- Don't re-edit placed shapes
  |     +-- visibleElements:
  |           +-- createTools:
  |           |     point: true
  |           |     polyline: true
  |           |     polygon: true
  |           |     rectangle: true
  |           |     circle: true
  |           |     freehandPolyline: true    (r025.049)
  |           |     freehandPolygon: true     (r025.049)
  |           +-- selectionTools:
  |           |     lasso-selection: false
  |           |     rectangle-selection: true   (r025.050)
  |           +-- settingsMenu: false
  |           +-- undoRedoMenu: false
  |           +-- deleteButton: true
  |
  +-- uiOptions:
  |     +-- isHideBorder = true            <-- Clean integration with tab UI
  |
  +-- defaultSymbols = {drawSymbols}    <-- r025.051: configurable color
  |     (via widgetConfigManager.getDrawColor)
  |
  +-- Callbacks:
        onJimuDrawCreated  --> handleDrawToolCreated
        onDrawingStarted   --> handleDrawStart (no-op for multi-shape)
        onDrawingFinished  --> handleDrawEnd
        onDrawingUpdated   --> handleDrawUpdate (r025.050: rebuild geometries)
        onDrawingCleared   --> handleDrawCleared
```

---

## 3. Geometry Accumulation (Multi-Shape)

Draw mode supports multiple shapes. Each completed sketch appends to an array;
clearing removes all shapes at once.

```
User completes a shape on the map
  |
  v
onDrawingFinished(graphic) --> handleDrawEnd
  |
  +-- graphic.geometry exists?
  |     |
  |     +-- No  --> return (skip)
  |     |
  |     +-- Yes --> next = [...drawnGeometriesRef.current, graphic.geometry]
  |                 updateDrawnGeometries(next)          (r028.119)
  |                   |
  |                   +-- drawnGeometriesRef.current = next
  |                   +-- setDrawnGeometries(next)
  |                   |     |
  |                   |     v
  |                   |   hasDrawnGeometry = drawnGeometries.length > 0
  |                   |   operationsEnabled = true (enables Execute button)
  |                   |
  |                   +-- assembleForDraw(next, includeResultsInputRef.current)
  |                         |
  |                         v
  |                       setAllInputGeometries(...)  (group-by-type union)
  |                         |
  |                         v
  |                       useBufferPreview receives updated inputGeometries[]
  |
  v
User clicks delete/clear in JimuDraw toolbar
  |
  v
onDrawingCleared() --> handleDrawCleared
  |
  v
includeResultsInputRef.current = false; setIncludeResultsInput(false)
updateDrawnGeometries([])
  |
  v
drawnGeometries = []
hasDrawnGeometry = false
operationsEnabled = false (disables Execute button)
allInputGeometries = []
```

**Note:** `creationMode: Continuous` keeps the active draw tool selected after
each shape is placed, so the user can draw additional shapes without
re-selecting a tool.

**r028.119 — event-driven assembly.** `allInputGeometries` is rebuilt *imperatively*
from the events that actually change the input (draw end/edit/clear, the include-results
toggle, mode switch, smart-default), not by a `useEffect` watching state. The single
mutation path `updateDrawnGeometries` keeps `drawnGeometries` (state) and
`drawnGeometriesRef` (read synchronously by handlers) in sync and calls `assembleForDraw`.
This replaced a `useEffect` that watched `[drawnGeometries, accumulatedRecords, hasResults,
includeResultsInput, ...]` and re-emitted a new `allInputGeometries` reference whenever
results changed post-query — which redrew the buffer after it was cleared (the r028.118
regression). Draw mode no longer reacts to `accumulatedRecords` at all.

---

## 4. Mode Switching (Operations <-> Draw)

The two-button toggle at the top of the Spatial tab controls which mode is
active. As of r028.100, JimuDraw stays mounted in BOTH modes so its draw
GraphicsLayer and any drawn shapes survive a switch. The Draw panel section is
hidden via CSS in Operations mode (not unmounted), and drawn shapes stay
visible on the map in both modes.

```
User clicks mode toggle button
  |
  v
handleModeChange(newMode)
  |
  +-- userHasChosenModeRef.current = true    <-- Prevents smart default override
  |
  +-- setSpatialMode(newMode)
       (no drawLayer.visible toggle -- r028.100: drawn graphics persist AND
        stay visible in both modes per user preference)

Disarm effect (useEffect on spatialMode):
  |
  +-- spatialMode !== 'draw'?
        |
        +-- Yes --> drawSketchRef.current?.cancel()
        |             Cancels any armed/active Sketch create so a stray map
        |             click cannot draw while in Operations. The Sketch keeps
        |             listening to map clicks even with its toolbar hidden, so
        |             this disarm replaces the old unmount. Also covers the
        |             smart-default path that sets spatialMode without
        |             handleModeChange.
        |
        +-- No  --> no-op (Draw mode keeps the Sketch armed)

Panel rendering:
  |
  +-- Draw section <div> css:
        spatialMode === 'draw' ? sectionStyle
          : [sectionStyle, drawSectionHiddenStyle]   <-- display:none, no unmount

State effects after mode switch:
  |
  +-- Source indicator updates:
  |     Operations: "{count} feature(s)" or "No features"
  |     Draw: "{count} drawn shape(s) ({types})" or "No shape drawn"
  |
  +-- operationsEnabled re-evaluates:
  |     Operations: enabled = hasResults
  |     Draw: enabled = hasDrawnGeometry
  |
  +-- allInputGeometries recomputed for the new mode (r028.119, in handleModeChange):
        Operations: assembleForOperations() -- union of accumulatedRecords geometries
        Draw: assembleForDraw(drawnGeometriesRef.current, includeResultsInputRef.current)
              -- drawn geometries, plus accumulatedRecords geometries when the
              "Also include current results" checkbox is on (r028.118)
```

**r028.118 — "Also include current results" (Draw mode):** A checkbox appears in
Draw mode only once a shape is drawn AND results exist (`spatialMode === 'draw' &&
hasDrawnGeometry && hasResults`), default OFF, and resets to OFF when it hides
(drawing cleared via `handleDrawCleared`, or mode/results change). When ON, the input
assembly concatenates `accumulatedRecords[].feature.geometry` onto the drawn geometries
before the group-by-type union, so a drawn shape and already-selected results
buffer/query together. **r028.119:** the toggle's `onChange` recomputes the input
immediately (`assembleForDraw(drawnGeometriesRef.current, checked)`); the reset-on-hide
is handled in the clear/cleanup events, not a `useEffect`.

---

## 5. Smart Default on Tab Entry

When the user navigates to the Spatial tab, the component automatically picks
the most useful mode -- unless the user has already made a manual choice.

```
activeTab changes to 'spatial'
  |
  v
useEffect detects: wasNotSpatial && isNowSpatial
  |
  +-- userHasChosenModeRef.current === true?
  |     |
  |     +-- Yes --> skip (user already chose, respect their preference)
  |     |
  |     +-- No  --> evaluate smart default:
  |                   |
  |                   +-- hasResults (accumulatedRecords.length > 0)?
  |                   |     |
  |                   |     +-- Yes --> setSpatialMode('operations')
  |                   |     |          (results exist, user likely wants to
  |                   |     |           search near them)
  |                   |     |
  |                   |     +-- No  --> setSpatialMode('draw')
  |                   |                (no results, user needs to draw)
  |                   |
  |                   v
  |                 debugLogger: 'spatial-smart-default'
  |
  v
prevActiveTabRef.current = activeTab   <-- Track for next transition
```

**Reset condition:** `userHasChosenModeRef` is a ref (not state), so it resets
only when the component unmounts (widget close). Within a session, once the
user clicks a mode toggle, the smart default never overrides again.

---

## 6. Post-Query Cleanup (Draw Mode)

After a spatial query executes, cleanup behavior depends on whether results
were found:

```
User clicks Execute
  |
  v
onExecuteSpatialQuery({...})
  |
  +-- Returns hasResults = true
  |     |
  |     v
  |   setBufferDistance('')                  <-- Reset buffer
  |     |
  |     +-- spatialMode === 'draw'?
  |           |
  |           +-- Yes:
  |           |     setDrawnGeometries([])   <-- Clear geometry array
  |           |     drawLayer.removeAll()    <-- Clear shapes from map
  |           |
  |           +-- No: skip (Operations mode, no drawn shapes to clear)
  |
  +-- Returns hasResults = false
  |     |
  |     v
  |   Preserve drawn shapes                 <-- User can adjust and retry
  |   Preserve buffer distance
  |   noResultsAlert displays via popover
  |
  +-- Throws error
        |
        v
      Preserve drawn shapes                 <-- Error handled by dispatch
      Preserve buffer distance
      queryErrorAlert displays via popover
```

**Rationale:** When a spatial query finds results, the drawn shapes have served
their purpose and are cleared. When zero results return, the shapes are kept so
the user can adjust buffer distance, spatial relationship, or target layers
without redrawing.

---

## 7. Source Indicator (Mode-Aware Display)

The source indicator banner changes content based on the active mode and
current state:

```
Source indicator rendering:
  |
  +-- spatialMode === 'draw'?
  |     |
  |     +-- hasDrawnGeometry?
  |     |     |
  |     |     +-- Yes: "3 drawn shapes (polygon, polyline)"
  |     |     |        (count + unique type list)
  |     |     |
  |     |     +-- No:  "No shape drawn"
  |     |
  |     +-- Style: blue tint when shapes exist, neutral when empty
  |
  +-- spatialMode === 'operations'?
        |
        +-- hasResults?
        |     |
        |     +-- Yes: "{count} feature(s) from previous search"
        |     |
        |     +-- No:  "No features from a previous search"
        |
        +-- Style: blue tint when results exist, neutral when empty
```

---

## 8. jimuMapView Prop Threading

JimuDraw requires a `JimuMapView` instance (not just a raw MapView). This prop
threads through four component layers:

```
widget.tsx (class component)
  |  state.jimuMapView (from JimuMapViewComponent callback)
  |
  v
QueryTaskList (functional component)
  |  props.jimuMapView (pass-through)
  |
  v
QueryTask (class component)
  |  props.jimuMapView (pass-through)
  |
  v
SpatialTabContent (functional component)
  |  props.jimuMapView
  |
  +-- Passed to: <JimuDraw jimuMapView={jimuMapView} />
  |
  +-- Guard: jimuMapView && mapModule?.JimuDraw
        |
        +-- Both truthy --> render JimuDraw
        +-- Either null --> render <StatusIndicator Loading />
```

**Origin:** `widget.tsx` uses `JimuMapViewComponent` with an
`onActiveViewChange` callback. When the map view is ready, the callback stores
the `JimuMapView` instance in component state, which then flows down through
props.

---

## Decision Points

### 1. Module Loading Guard

| Condition | Result |
|-----------|--------|
| `mapModule === null` | Show loading spinner |
| `mapModule.JimuDraw` exists AND `jimuMapView` exists | Render JimuDraw |
| `mapModule` loaded but `jimuMapView` missing | Show loading spinner |

### 2. Smart Default Mode Selection

| Condition | Default Mode |
|-----------|-------------|
| `hasResults && !userHasChosenModeRef` | `operations` |
| `!hasResults && !userHasChosenModeRef` | `draw` |
| `userHasChosenModeRef === true` | No change (user's choice preserved) |

### 3. Operations Enabled State

| Mode | Condition | `operationsEnabled` |
|------|-----------|-------------------|
| Operations | `hasResults` | `true` if accumulated records exist |
| Operations | `!hasResults` | `false` |
| Draw | `hasDrawnGeometry` | `true` if drawn shapes exist |
| Draw | `!hasDrawnGeometry` | `false` |

### 4. Execute Button Enablement

All four conditions must be true:

| Condition | Source |
|-----------|--------|
| `operationsEnabled` | Mode-dependent (see above) |
| `selectedRelationship` | User selected a spatial relationship |
| `selectedLayers.length > 0` | At least one target layer selected |
| `inputGeometry` exists | Derived from drawn shapes or accumulated records |

### 5. Post-Query Cleanup (Draw Mode)

| Query Result | Buffer | Drawn Shapes | Draw Layer |
|-------------|--------|-------------|------------|
| Results found | Reset to empty | Clear array | `removeAll()` |
| Zero results | Preserve | Preserve | Preserve |
| Error thrown | Preserve | Preserve | Preserve |

### 6. Input Geometry Assembly by Mode (r028.119: event-driven)

`allInputGeometries` is recomputed only on real input events (draw end/edit/clear,
toggle, mode change, smart-default) via `assembleForDraw` / `assembleForOperations` —
not by a `useEffect` watching state. Draw mode does NOT depend on `accumulatedRecords`.

| Mode | `allInputGeometries` Source | Triggered by | Processing |
|------|---------------------------|--------------|------------|
| Draw | `drawnGeometries[]`, plus `accumulatedRecords[].feature.geometry` when "Also include current results" is on (r028.118) | `handleDrawEnd/Update/Cleared`, toggle `onChange`, `handleModeChange`, smart-default | Group by type, union within each group via `unionOperator.executeMany` |
| Operations | `accumulatedRecords[].feature.geometry` | `handleModeChange`, smart-default, and a prop-sync `useEffect` on `accumulatedRecords` (results ARE the input here) | Group by type, union within each group via `unionOperator.executeMany` |

---

## Test Coverage

### Manual Test Steps

1. Open Spatial tab with no prior results
2. **Verify:** mode defaults to Draw, loading spinner shows briefly, then JimuDraw toolbar appears
3. Select polygon tool, draw a shape on the map
4. **Verify:** source indicator updates to "1 drawn shape (polygon)"
5. Draw a second shape (circle) without re-selecting a tool (continuous mode)
6. **Verify:** source indicator updates to "2 drawn shapes (polygon, polygon)"
7. Select a spatial relationship and target layer, click Execute
8. **Verify:** query runs, results appear, drawn shapes are cleared from map
9. Switch to Operations mode, then back to Draw
10. **Verify:** mode toggles correctly; drawn shapes stay visible on the map in BOTH modes (r028.100 — no visibility toggle); the Sketch is disarmed in Operations so a stray map click can't draw
11. Draw a shape, run query that returns 0 results
12. **Verify:** drawn shapes are preserved on map, no-results alert shows
13. Close widget, reopen, navigate to Spatial tab
14. **Verify:** smart default re-evaluates (Draw if no results, Operations if results exist)
15. Toggle to Operations manually, switch tabs, come back to Spatial
16. **Verify:** mode stays on Operations (userHasChosenModeRef prevents override)

### Automated Tests

*None yet -- JimuDraw integration is visual and requires map context. Consider
adding unit tests for geometry accumulation logic and smart default behavior
if extracted to a custom hook.*

---

*Last updated: r028.119 (2026-06-02) -- input-geometry assembly is now event-driven: allInputGeometries is rebuilt only on real input events (draw end/edit/clear via updateDrawnGeometries, toggle onChange, handleModeChange, smart-default), not a useEffect watching state. Fixes the r028.118 regression where a post-query accumulatedRecords change re-emitted a new array reference and redrew the buffer after it was cleared. Draw mode no longer depends on accumulatedRecords; one prop-sync useEffect remains for Operations mode. Prior r028.118: "Also include current results" checkbox. Prior r028.100: mode switch no longer unmounts JimuDraw or toggles drawLayer.visible; a Sketch-cancel disarm fires on leaving Draw mode.*
