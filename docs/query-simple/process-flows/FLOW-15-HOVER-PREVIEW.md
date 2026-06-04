# FLOW-15: Hover Preview (Pin + Feature Highlight)

## Overview

When the cursor enters a result row, QuerySimple draws two map cues for that
record and holds them for as long as the pointer stays on the card:

1. **Hover preview pin** -- an animated CIM teardrop that drops onto the
   record's label point (existing feature, `hoverPinColor`).
2. **Hover feature highlight** -- the record's own geometry drawn as an overlay
   so the feature stands out from its neighbors (r028.123+, `hoverHighlightColor`).

Both cues are `Graphic`s on `mapView.graphics`, the map-level overlay that
always renders above all layers. Each has its own on/off toggle, so a deployer
can run pin only, highlight only, or both. Both default ON. The highlight is
**path-independent** (works in Path 1 and Path 3) because it draws the record's
already-resolved geometry rather than highlighting a results layer.

**Key files:**
- `query-simple/src/runtime/query-result-item.tsx` -- `handleMouseEnter` (debounce, geometry, highlight + pin), `handleMouseLeave`, `handleClickResultItem`, unmount cleanup, `buildHoverHighlightSymbol`, `createCIMPinSymbolData`, config reads
- `query-simple/src/runtime/simple-list.tsx` -- `hideHoverPins` (bulk-hide on pointerleave/scroll), passes `mapView` to each item
- `shared-code/mapsimple-common/widget-config-manager.ts` -- `getHoverPinColor` / `getHoverHighlightColor` / `getHoverPinEnabled` / `getHoverHighlightFeature`
- `query-simple/src/config.ts` -- `hoverPinColor` / `hoverPinEnabled` / `hoverHighlightColor` / `hoverHighlightFeature`

**Related:** the geometry-overlay decision and rollout are in
`docs/specs/HOVER_HIGHLIGHT_SPEC.md` (TODO #34).

---

## Entry Points

| Trigger | Location | Description |
|---------|----------|-------------|
| Pointer enters a result card | `query-result-item.tsx:624` | `handleMouseEnter` -- 100ms debounce, then draw highlight + pin |
| Pointer leaves a result card | `query-result-item.tsx:886` | `handleMouseLeave` -- cancel animation/timeout, hide both cues |
| Card clicked | `query-result-item.tsx:503` | `handleClickResultItem` -- hide both cues before firing `onClick` |
| Pointer leaves the list / list scrolls | `simple-list.tsx:281` / `:280` | `onPointerLeave` / `onScroll` → `hideHoverPins` bulk-hides this widget's cues |
| Item unmounts | `query-result-item.tsx:566` | cleanup effect removes both graphics from `mapView.graphics` |

---

## Config Gating and Colors

Each cue has an independent enable toggle and an independent color. All four are
read through the `widgetConfigManager` singleton (per the runtime config rule),
not Redux. The enable toggles default ON via `config?.x !== false`, so an unset
or pre-Phase-3 config gets both cues.

| Config field | Getter | Default | Effect |
|--------------|--------|---------|--------|
| `hoverPinEnabled` | `getHoverPinEnabled(widgetId)` | `true` | Show the teardrop pin (Phase 3, r028.125) |
| `hoverPinColor` | `getHoverPinColor(widgetId)` | `#EA4335` | Pin fill color |
| `hoverHighlightFeature` | `getHoverHighlightFeature(widgetId)` | `true` | Show the geometry highlight (Phase 3, r028.125) |
| `hoverHighlightColor` | `getHoverHighlightColor(widgetId)` | `#EA4335` | Highlight line/outline/ring color (Phase 2, r028.124) |

The default highlight color matches the pin (`#EA4335`) so the two cues read as
one signal, and stays clear of the magenta selection highlight (`#DF00FF`) on
both hue and treatment. The Settings panel exposes a Switch for each enable
toggle and a color picker for each color, in the same Display / Graphics area.

The colors are read into memoized RGB. `hoverHighlightRgb` (`query-result-item.tsx:472`)
feeds `buildHoverHighlightSymbol`; the pin's `memoizedSymbolData`
(`query-result-item.tsx:460`) rebuilds the CIM JSON only when `hoverPinColor`
changes. The highlight symbol is **re-applied on every show**, so a configured
color change takes effect on the next hover with no refresh.

---

## Highlight Symbol by Geometry Type

`buildHoverHighlightSymbol(geometryType, rgb)` (`query-result-item.tsx:31`)
returns plain symbol JSON (no new imports), keyed on the geometry type:

| Geometry | Symbol |
|----------|--------|
| `polyline` | `simple-line`, 4px, full-opacity color |
| `polygon` / `extent` | `simple-fill`, faint fill (alpha 0.15) + 3px outline |
| `point` / `multipoint` (default) | `simple-marker` circle, transparent fill + 3px ring, size 16 |

---

## Flow Diagram

```
 Pointer enters result card
      |
      v
 handleMouseEnter()                              <- query-result-item.tsx:624
      |
      +-- mapView missing? --> return (no-op)
      |
      +-- clear pending hover timeout
      |
      +-- setTimeout(100ms debounce) -----------------+
                                                       |
                                                       v
                            geometry = data.getJSAPIGeometry()
                                                       |
                            no geometry? --> log + return
                                                       |
              +----------------------------------------+
              |                                        |
   hoverHighlightEnabled?                    hoverPinEnabled?
   (getHoverHighlightFeature)               (getHoverPinEnabled)
              |                                        |
   YES                                       NO --> return (skip pin)
              |                                        |
   first hover?                              YES
   +-- new Graphic(geometry,                          |
   |     buildHoverHighlightSymbol(type,rgb),   labelPoint =
   |     {__hoverHighlight:true,__widgetId})    labelPointOperator.execute(geometry)
   |   mapView.graphics.add(...)                       |
   +-- reuse: re-apply symbol, visible = true   no labelPoint? --> return
              |                                        |
              v                                first hover?
   highlight overlay on map                    +-- deep-copy memoizedSymbolData
   (added BEFORE the pin, so                    |   new Graphic(labelPoint, cimSymbol,
    the pin renders on top)                     |     {__hoverPin:true,__widgetId})
                                                 |   mapView.graphics.add(...)
                                                 |   requestAnimationFrame spring drop
                                                 +-- reuse: geometry = labelPoint,
                                                     visible = true, restart spring drop
                                                          |
                                                          v
                                                 animated teardrop on map
```

```
 Pointer leaves card        Card clicked            List leave / scroll        Item unmounts
      |                          |                        |                          |
      v                          v                        v                          v
 handleMouseLeave()       handleClickResultItem()   hideHoverPins()           cleanup effect
 cancel animation         cancel animation          (simple-list.tsx:261)     (query-result-item.tsx:566)
 clear timeout            hide pin (visible=false)  forEach mapView.graphics: cancel animation + timeout
 hide pin (visible=false) hide highlight (false)      __widgetId === widgetId   mapView.graphics.remove(pin)
 hide highlight (false)   onClick(data)               && visible                mapView.graphics.remove(highlight)
                                                       && (__hoverPin ||         refs nulled
                                                           __hoverHighlight)
                                                     --> visible = false
```

---

## Lifecycle: Reuse, Hide, Remove

Each item owns two refs: `hoverGraphicRef` (pin) and `hoverHighlightRef`
(highlight). A record's geometry is constant, so each graphic is created **once**
(lazily, on first hover) and thereafter **toggled** via `visible`. The handlers
never destroy and recreate on every hover.

- **Show** (`handleMouseEnter`, after the 100ms debounce): create-or-reuse. On
  reuse, the highlight re-applies its symbol (color may have changed) and sets
  `visible = true`; the pin updates its label-point geometry and restarts the
  spring-drop animation.
- **Hide** (`handleMouseLeave`, `handleClickResultItem`, `hideHoverPins`): set
  `visible = false`. The graphics stay on `mapView.graphics` for reuse.
- **Remove** (unmount cleanup effect): `mapView.graphics.remove(...)` for each
  ref, then null the refs. Scoped to this item's own graphics -- never `removeAll()`.

The pin's drop is a `requestAnimationFrame` spring (anchor point eased from
`y = -1.2` to `y = -0.5`); `handleMouseLeave`, `handleClickResultItem`, and the
unmount cleanup all `cancelAnimationFrame` before hiding so no frame loop leaks.

---

## Tagging and Widget Scoping

Both graphics carry attributes that scope all bulk operations to the owning widget:

| Attribute | On | Purpose |
|-----------|----|---------|
| `__hoverPin: true` | pin graphic | Identifies the pin for `hideHoverPins` |
| `__hoverHighlight: true` | highlight graphic | Identifies the highlight for `hideHoverPins` |
| `__widgetId` | both | Scopes bulk-hide to this widget -- no cross-widget cue clearing |

`hideHoverPins` (`simple-list.tsx:261`) walks `mapView.graphics` and hides any
graphic whose `__widgetId` matches **and** is visible **and** is tagged
`__hoverPin` or `__hoverHighlight`. It runs on `onPointerLeave` and `onScroll`
of the results container -- the two cases where a per-card `mouseleave` does not
fire (pointer jumps straight from the list to the map, or a card scrolls out
from under a still pointer).

---

## Why mapView.graphics (not layerView.highlight)

The spec originally assumed `layerView.highlight()` on the Path 3 results layer.
That turned out to cost a synchronous-to-async conversion: `direct-query.ts`
stamps the **origin** layer on the record (not the Path 3 child), and the Path 3
layer reassigns a fresh `OBJECTID` per synced feature, so a record maps back only
by `COMPOSITE_KEY` with no synchronous key-to-objectId map. Highlighting would
need a `queryFeatures` per hover.

Drawing the record's own geometry on `mapView.graphics` instead is:

- **Synchronous** -- the geometry is already resolved at hover time via
  `data.getJSAPIGeometry()`; no query, no per-hover latency.
- **Path-independent** -- works in Path 1 too, so there is no Path 3 gate.
- **Self-contained** -- reuses the proven pin overlay (same `mapView.graphics`,
  same `__widgetId` tagging, same bulk-hide on pointerleave/scroll).

This also stays consistent with the Select on Map removal lesson (#22, r028.080):
we never touch an origin layer, we draw our own overlay graphic. See
`docs/specs/HOVER_HIGHLIGHT_SPEC.md` for the full decision record.

---

## Test Coverage

No automated tests cover this flow today; it is verified by manual smoke test
(see the Test plan in `docs/specs/HOVER_HIGHLIGHT_SPEC.md`):

- Hover a point, a line, and a polygon result -- the correct feature highlights
  and clears on hover-out.
- Rapid row-to-row hover swaps both cues cleanly with no handle buildup.
- Pin toggle off → no pin; highlight toggle off → no highlight; both on → both.
- Path 1 active → highlight still appears (the overlay is path-independent).

The four `widgetConfigManager` getters are candidates for unit coverage in
`shared-code/mapsimple-common/tests/widget-config-manager.test.ts` (not yet added).

---

*Last updated: r028.125 (2026-06-04) -- new flow for the hover preview pin + feature highlight (TODO #34, Phases 1-3, r028.123-125).*
