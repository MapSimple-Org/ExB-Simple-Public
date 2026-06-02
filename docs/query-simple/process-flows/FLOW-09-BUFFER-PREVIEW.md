# FLOW-09: Real-Time Buffer Preview

End-to-end flow for the Spatial tab's real-time geodesic buffer preview.

## Overview

When a user enters a buffer distance on the Spatial tab, a semi-transparent
polygon renders on the map showing the buffered search area. The preview
updates in real-time (debounced 300ms) as distance or unit changes, letting
users visually confirm spatial extent before executing a query.

### Key Files

| File | Purpose |
|------|---------|
| `runtime/managers/use-buffer-preview.ts` | Hook: per-geometry buffering, operator selection, layer creation, unmount cleanup. Accepts `inputGeometries: __esri.Geometry[]` (array). Stores last graphic in singleton. Returns `bufferedGeometry` for spatial query use. |
| `runtime/tabs/SpatialTabContent.tsx` | Consumer: derives input geometries, passes to hook. Draw mode assembles `drawnGeometries[]`, plus the current result geometries (`accumulatedRecords[].feature.geometry`) when the "Also include current results" checkbox is on (r028.118), then groups by type and unions same-type parts into `allInputGeometries`. Uses returned `bufferedGeometry` as query geometry when buffer is active. |
| `runtime/execute-spatial-query.ts` | Receives `inputGeometries` (array, r028.101). The buffered case passes `[bufferedGeometry]` with `bufferDistance: 0`, evaluating spatial relationships against the actual visible buffer shape. |
| `runtime/geometry-from-draw.tsx` | Precedent: three-case buffer operator pattern (`applyBufferEffect`, lines 85-134) |
| `runtime/graphics-cleanup-utils.ts` | Buffer layer destroy on widget unmount; buffer `removeAll()` on explicit clear |
| `runtime/managers/selection-restoration-manager.ts` | Imperative buffer clear on panel close (`clearSelectionFromMap`) and restore on reopen (`addSelectionToMap`) |
| `runtime/graphics-state-manager.ts` | Singleton: stores last buffer graphic per widget for imperative restore |

### Layer Architecture

```
Map Layers (top to bottom):
  ┌─────────────────────────────────────┐
  │ querysimple-hover-{widgetId}        │  ← Hover preview pin (r027.082+)
  │   Red CIM teardrop on card hover    │
  ├─────────────────────────────────────┤
  │ querysimple-buffer-{widgetId}       │  ← Buffer preview (this flow)
  │   Semi-transparent polygon          │
  │   (configurable color, default orange) │
  ├─────────────────────────────────────┤
  │ JimuDraw internal layer             │  ← Temporary drawn geometry
  │   (managed by JimuDraw, Draw mode)  │
  ├─────────────────────────────────────┤
  │ querysimple-highlight-{widgetId}    │  ← Path 1 query result graphics
  │   or querysimple-fl-{widgetId}      │  ← Path 3 GroupLayer (per-geometry FLs)
  └─────────────────────────────────────┘
```

> **r027.082+:** Hover preview pins moved off `mapView.graphics` (the
> map-level shared collection) onto a per-widget `querysimple-hover-{widgetId}`
> GraphicsLayer. The earlier home was vulnerable to cross-widget collisions
> when any QS widget called `mapView.graphics.removeAll()` during clear-results.
> See `docs/bugs/archive/HOVER-PIN-CROSS-WIDGET-BUG.md` for the investigation.

---

## Flow Diagram

```
User types buffer distance or changes unit
  │
  ▼
SpatialTabContent state update
  │  bufferDistance, bufferUnit
  │
  ▼
useBufferPreview hook receives new props
  │  inputGeometries: __esri.Geometry[]    ← array of geometries (r025.044)
  │
  ├── enabled = false? ──────────────────► Clear layer, return
  │   (distance=0 or no mapView or
  │    not on spatial tab)
  │
  ▼
lodash.debounce (300ms)
  │
  ▼
computeBuffer(geometries[], distance, unit)
  │
  ├── No inputGeometries or empty? ──────► Clear layer, return
  │
  ▼
For each geometry: bufferSingle(geom, distance, unit)
  │
  ├── Detect spatial reference per geometry
  │   │
  │   ├── SR is WGS84 or WebMercator?
  │   │     ▼
  │   │   geodesicBufferOperator.execute()     ← use-buffer-preview.ts
  │   │     (lazy-loaded, cached in ref)
  │   │
  │   ├── SR is geographic (non-WGS84)?
  │   │     ▼
  │   │   geometryService.buffer()             ← Server-side fallback
  │   │     (via utils.getGeometryService())
  │   │
  │   └── Other projection?
  │         ▼
  │       bufferOperator.execute()             ← Planar buffer
  │         (lazy-loaded, cached in ref)
  │
  ▼
Collect individual buffer polygons
  │
  ▼
Union all buffer polygons into single polygon  ← unionOperator
  │
  ▼
Remove previous buffer graphic
  │
  ▼
Add new Graphic to buffer layer
  │  Symbol: configurable color (default orange #FFA500)
  │  fill 0.25 opacity, same-color outline 0.8 opacity 1.5px
  │  (buildBufferSymbol via widgetConfigManager.getBufferColor)
  │
  ▼
Store bufferedGeometry in state              ← r025.035
  │  setBufferedGeometry(bufferGeometry)
  │
  ▼
Buffer polygon visible on map
  │
  ▼
Return bufferedGeometry to SpatialTabContent  ← r025.035
  │
  └── On Execute: if buffer active, send bufferedGeometry
      as query.geometry with bufferDistance=0
      (spatial relationships evaluate against visible shape)
```

---

## Decision Points

### 1. Spatial Reference Branching

Same three-case logic as `geometry-from-draw.tsx:85-134`:

| Condition | Operator | Load Method |
|-----------|----------|-------------|
| `sr.isWGS84 \|\| sr.isWebMercator` | `geodesicBufferOperator` | `loadArcGISJSAPIModule` (client-side) |
| `sr.isGeographic && !sr.isWGS84` | `geometryService.buffer()` | `loadArcGISJSAPIModules` (server-side) |
| Other | `bufferOperator` | `loadArcGISJSAPIModule` (client-side) |

### 2. Early Exit Conditions

Buffer calculation skips (clears layer) when:
- `enabled = false` (distance is 0, mapView missing, or not on Spatial tab)
- `inputGeometry` is null (no results in Operations, no drawn shape in Draw)

### 3. Input Geometry Source

| Spatial Mode | Input Geometry |
|-------------|----------------|
| **Operations** | Union of all accumulated record geometries (via `unionOperator.executeMany`) |
| **Draw** | `drawnGeometries[]`, plus the current result geometries (`accumulatedRecords[].feature.geometry`) when the "Also include current results" checkbox is on (r028.118); same-type parts are grouped and unioned into `allInputGeometries` (r025.041+) |

**r028.119 — `allInputGeometries` is assembled event-driven.** It is rebuilt only on real
input events (a shape drawn/edited/cleared, the toggle, a mode change, smart-default, and
an operations-mode prop-sync), not by a `useEffect` watching `[drawnGeometries,
accumulatedRecords, ...]`. This is why the buffer no longer redraws after it is cleared:
under the old reactive assembly, a post-query `accumulatedRecords` change re-emitted a new
`allInputGeometries` reference, and this hook (which keys on `inputGeometries` by reference)
treated it as a real change and re-buffered. Draw mode no longer reacts to results at all.

---

## Per-Geometry Buffering (r025.044)

The hook accepts `inputGeometries: __esri.Geometry[]` and buffers each geometry
individually via `bufferSingle()`. This handles the case where Draw mode produces
multiple geometries or Operations mode provides a union of accumulated results.

### Mixed Geometry Type Handling

When the input array contains mixed geometry types (e.g., points and polygons),
geometries are grouped by type and unioned within each group before buffering.
This prevents `unionOperator` errors that occur when attempting to union
incompatible geometry types (e.g., a point with a polygon).

```
inputGeometries = [Point, Point, Polygon, Polyline]
  │
  ▼
Group by geometry type:
  points:    [Point, Point]    → union → single Point/MultiPoint
  polygons:  [Polygon]         → pass through
  polylines: [Polyline]        → pass through
  │
  ▼
Buffer each group result individually
  │
  ▼
Union all buffer polygons → single preview polygon
```

---

## Layer Lifecycle

### Creation

The buffer preview layer is created lazily by the `useBufferPreview` hook when `enabled` becomes true for the first time. The parent is chosen based on which result-rendering path is active (r028.083, r028.096). When Path 3's GroupLayer exists the buffer is parented to it (so it inherits visibility); otherwise (Path 1) the buffer becomes a standalone top-level layer. The Path 2 GroupLayer fallback was removed with Path 2 (TODO #24).

```
enabled = true (mapView + distance ≠ 0 + spatial tab + panel visible)
  │
  ▼
loadArcGISJSAPIModules(['esri/layers/GraphicsLayer', 'esri/Graphic'])
  │
  ▼
Create GraphicsLayer (id: querysimple-buffer-{widgetId}, listMode: 'hide')
  │
  ├── Path 3 GroupLayer exists (querysimple-fl-{widgetId})?
  │     │
  │     ▼
  │   path3Group.add(bufferLayer)      ← INSIDE Path 3 group, inherits visibility
  │
  └── No GroupLayer (Path 1)?
        │
        ▼
      mapView.map.add(bufferLayer)     ← standalone on map; destroyed via hook unmount
```

### Cleanup & Visibility — Three Scenarios

#### Scenario 1: Widget close (full unmount)

Two cleanup paths run in parallel for defense-in-depth:

**Path A: Hook unmount cleanup** (r025.015) — The hook's unmount-only effect
removes and destroys the buffer layer via `layer.parent.remove()` + `layer.destroy()`.
Guards against double-destroy with a `destroyed` check.

**Path B: Cleanup utilities** — `componentWillUnmount` → `GraphicsLayerManager.cleanup()`:
- GroupLayer mode: `cleanupGroupLayer()` destroys the GroupLayer and all its children,
  including the buffer layer (no explicit buffer cleanup needed)
- GraphicsLayer mode: `cleanupGraphicsLayer()` explicitly finds and destroys the buffer
  layer by ID since it's standalone on the map

```
componentWillUnmount
  │
  ├── Hook unmount effect fires:
  │     bufferLayer.removeAll() → parent.remove() → destroy()
  │     (if not already destroyed)
  │
  └── graphicsLayerManager.cleanup(widgetId):
        │
        ├── cleanupGroupLayer():
        │     groupLayer.destroy()  ← buffer auto-destroyed as child
        │
        └── cleanupGraphicsLayer():
              Find querysimple-buffer-{widgetId} → removeAll → remove → destroy
```

#### Scenario 2: LayerList toggle (GroupLayer mode)

The buffer layer is a child of the GroupLayer with `visibilityMode: 'inherited'`. When the user toggles the GroupLayer on/off in the LayerList, all children (including the buffer) automatically inherit the visibility state. No external watcher needed.

```
User toggles GroupLayer off in LayerList
  │
  ▼
groupLayer.visible = false
  │
  ▼
All children inherit visible=false (visibilityMode: 'inherited')
  │
  ▼
Buffer layer hidden automatically  ← no watcher needed

User toggles GroupLayer on
  │
  ▼
Buffer layer visible again automatically
```

Note: Toggling individual sub-layers (e.g., just polygons) does NOT affect the buffer — only the parent GroupLayer. Each child's own `visible` property is independent when the parent is visible.

#### Scenario 3: Panel close/reopen (no unmount, non-LayerList mode)

Handled imperatively via `selection-restoration-manager`, symmetric with how
highlight graphics are cleared on close and restored on open. React effects proved
unreliable for panel close/reopen because `isPanelVisible` state changes don't
consistently trigger effect re-runs before ExB hides the panel.

**Close:** `clearSelectionFromMap()` clears both highlight and buffer graphics.
The buffer graphic remains stored in `GraphicsStateManager` for restore.

**Open:** `addSelectionToMap()` restores highlight graphics from `accumulatedRecords`
and re-adds the stored buffer graphic from the singleton.

```
Panel closes → handleVisibilityChange(false) → clearSelectionFromMap():
  │
  ├── graphicsLayerManager.clearGraphics()        ← clears highlight graphics
  │
  └── bufferLayer = findLayerById(buffer-{id})
        bufferLayer.removeAll()                   ← clears buffer graphics
        (graphic still stored in GraphicsStateManager)

Panel reopens → handleVisibilityChange(true) → addSelectionToMap():
  │
  ├── restoreAccumulatedRecords()                 ← restores highlight graphics
  │
  └── lastGraphic = graphicsStateManager.getLastBufferGraphic(widgetId)
        bufferLayer.add(lastGraphic)              ← restores buffer graphic
```

State (buffer distance, unit, geometry) is preserved across close/reopen since
the component is not unmounted. If the user changes the buffer distance after
reopen, the hook's trigger effect recomputes normally.

---

## Spatial Query Integration (r025.035)

The buffer preview geometry is reused for spatial query execution. Instead of
sending `query.distance` / `query.units` to the server (which may not evaluate
all spatial relationships correctly), the client-side buffered geometry is sent
directly as `query.geometry`.

```
User clicks Execute (buffer distance > 0)
  │
  ▼
SpatialTabContent checks: parsedBuffer > 0 && bufferedGeometry?
  │
  ├── Yes: send [bufferedGeometry] as inputGeometries, bufferDistance=0
  │         (one unioned polygon covering every part, clean spatial evaluation)
  │
  └── No buffer: send allInputGeometries (one geometry per type) as-is
  │
  ▼
execute-spatial-query.ts receives inputGeometries[] (r028.101)
  │
  ▼
For each input geometry: query.geometry = geom
query.spatialRelationship = selectedRelationship
query.distance = 0  (no server-side buffer)
matches deduped by objectId per layer, then combined
  │
  ▼
featureLayer.queryFeatures(query)
```

**Why client-side?** Server-side `query.distance` + `query.units` may not work
correctly with all spatial relationships (e.g., "within" with server-side buffer
returned 0 results even when parcels were visually inside the buffer). Using
the actual computed polygon ensures the spatial relationship evaluates against
the exact shape the user sees on the map.

---

## Test Coverage

### Manual Test Steps

1. Run a query to get results in the Results tab
2. Switch to Spatial tab (should default to Operations mode)
3. Enter buffer distance (e.g., 1000) with unit Feet
4. **Verify:** yellow/orange buffer polygon appears on map around result geometry
5. Change distance → buffer updates after ~300ms
6. Change unit dropdown → buffer updates
7. Clear distance (empty or 0) → buffer polygon disappears
8. **Negative buffer:** Enter -500 → buffer shrinks inward (polygons only)
9. **Widget close:** Close the widget panel → buffer graphic gone from map
10. **Panel close/reopen:** Close panel, reopen, navigate to Spatial tab → buffer reappears
11. **LayerList toggle:** Toggle results GroupLayer off → buffer hides; toggle on → reappears
12. **Sub-layer toggle:** Toggle just one geometry type off → buffer stays visible
13. Results layer graphics remain unaffected throughout

### Automated Tests

*None yet — buffer preview is visual. Consider snapshot tests if layer
creation patterns warrant it.*

---

*Last updated: r028.119 (2026-06-02) -- allInputGeometries is now assembled event-driven (not a useEffect watching state), which fixes the buffer redrawing itself after being cleared on a spatial query: the old reactive assembly re-emitted a new inputGeometries reference on a post-query accumulatedRecords change, and this hook re-buffered on the reference change. Draw mode no longer reacts to results. Prior r028.118: Draw mode folds result geometries into the buffer input via the "Also include current results" checkbox; same-type parts unioned before buffering.*
