# FLOW-01: Widget Initialization

## Overview

Describes the startup sequence for both QuerySimple and HelperSimple widgets.
QuerySimple follows a "Manager & Shell" pattern where seven manager classes handle
complex logic while the main widget class manages React lifecycle and rendering.

**Key files:**
- `query-simple/src/runtime/widget.tsx` -- main widget class, manager instantiation, render logic
- `query-simple/src/runtime/query-task-list.tsx` -- conditional query renderer (654 lines)
- `query-simple/src/runtime/query-task.tsx` -- individual query executor (3,013 lines)
- `helper-simple/src/runtime/widget.tsx` -- URL orchestrator (780 lines)

---

## Entry Point

Widget mounts when ExB renders the widget component. Both widgets extend
`React.PureComponent<AllWidgetProps<IMConfig>>`.

---

## QuerySimple Initialization Sequence

```
 Widget Constructor                           <- widget.tsx:97
      |
      +-- widgetConfigManager.registerConfig()  :99
      |   (early registration, before callbacks fire)
      |
      v
 componentDidMount()                         <- widget.tsx:373
      |
      +-- [1] UrlConsumptionManager.setup()    :377-381
      |   (no-op -- HelperSimple orchestrates via OPEN_WIDGET_EVENT)
      |
      +-- [2] WidgetVisibilityManager.setup()  :401-422
      |   +-- IntersectionObserver registration
      |   +-- onVisibilityChange callback -> setState
      |   +-- notifyMount() -> dispatches mount event
      |
      +-- [3] AccumulatedRecordsManager sync   :424-438
      |   +-- handleResultsModeChange()
      |   +-- handleAccumulatedRecordsChange()
      |
      +-- [4] EventManager.setHandlers() + setup()  :477-484
      |   +-- OPEN_WIDGET_EVENT listener
      |   +-- QUERYSIMPLE_SELECTION_EVENT listener
      |   +-- RESTORE_ON_IDENTIFY_CLOSE_EVENT listener
      |
      +-- [5] SelectionRestorationManager.setWidgetId()  :487
      |
      +-- [6] widgetConfigManager.registerConfig()  :491-492
      |
      v
 [DEFERRED] JimuMapViewComponent.onActiveViewChange
      |
      +-- MapViewManager.handleJimuMapViewChanged()
      +-- GraphicsLayerManager.initialize()
          +-- Determine: GroupLayer or GraphicsLayer (r024.2)
          +-- Add layer to mapView.map.layers
      +-- applyMobilePopupBehavior() (r025.072)
      +-- setupMobilePopupWatch() (r025.072)
      +-- mapView.watch('width') → applyMobilePopupBehavior()
```

---

## Manager Pattern

All managers are utility classes (not hooks) instantiated as private members:

| Manager | File | Responsibility |
|---------|------|----------------|
| UrlConsumptionManager | use-url-consumption.ts | Hash/query parameter parsing |
| WidgetVisibilityManager | use-widget-visibility.ts | IntersectionObserver DOM visibility |
| MapViewManager | use-map-view.ts | MapView ref caching |
| GraphicsLayerManager | use-graphics-layer.ts | Layer create/cleanup, GroupLayer vs GraphicsLayer |
| AccumulatedRecordsManager | use-accumulated-records.ts | Results mode + records state |
| EventManager | use-event-handling.ts | Window event listener lifecycle |
| SelectionRestorationManager | use-selection-restoration.ts | Selection state + panel restore |

Instantiation order (widget.tsx:68-93):
```
urlConsumptionManager       = new UrlConsumptionManager()
visibilityManager           = new WidgetVisibilityManager()
mapViewManager              = new MapViewManager(mapViewRef)
graphicsLayerManager        = new GraphicsLayerManager(graphicsLayerRef, mapViewRef)
accumulatedRecordsManager   = new AccumulatedRecordsManager()
eventManager                = new EventManager()
selectionRestorationManager = new SelectionRestorationManager(stateGetter, callbacks)
```

---

## Component Hierarchy

```
Widget (widget.tsx)
  |
  +-- arrangeType === Popper && !controllerWidgetId   :1382-1419
  |   +-- TaskListPopperWrapper
  |       +-- QueryTaskList (isInPopper=true)
  |
  +-- arrangeType === Inline && !controllerWidgetId   :1422-1437
  |   +-- TaskListInline
  |       +-- QueryTaskList
  |
  +-- arrangeType === Block (default)                 :1440-1549
      +-- JimuMapViewComponent (if highlightMapWidgetId)
      +-- QueryWidgetContext.Provider
          +-- QueryTaskList
              +-- QueryTask (one active at a time)
                  +-- QueryTabContent (search inputs)
                  +-- SpatialTabContent (spatial query UI)
                  +-- QueryTaskResult (results list)
```

---

## HelperSimple Initialization Sequence

```
 componentDidMount()                         <- helper-simple/widget.tsx:94
      |
      +-- addEventListener('hashchange', handleHashChange)       :96
      +-- addEventListener(QUERYSIMPLE_SELECTION_EVENT, ...)      :101
      +-- addEventListener(QUERYSIMPLE_WIDGET_STATE_EVENT, ...)   :104
      +-- addEventListener(QUERYSIMPLE_HASH_QUERY_EXECUTED, ...)  :107
      |
      +-- checkUrlParameters()                                    :98
      |   (immediate check on mount for URL hash match)
      |
      +-- parseHashForWidgetSelection() -> previousHashEntry      :111
      +-- startIdentifyPopupWatching() -> MutationObserver        :113
```

---

## Props Flow Through Component Tree

```
Widget State
    |
    v
QueryTaskList Props
    +-- initialQueryValue, shouldUseInitialQueryValueForSelection
    +-- resultsMode, accumulatedRecords, resultsExtent
    +-- graphicsLayer, mapView
    +-- eventManager, onInitializeGraphicsLayer, onClearGraphicsLayer
    +-- activeTab, zoomOnResultClick, hoverPinColor
    |
    v
QueryTask Props
    +-- queryItem (QueryItemType configuration)
    +-- index, total (position in list)
    +-- initialInputValue (from hash if shortId match)
    +-- All handler callbacks for state updates
    |
    v
SpatialTabContent Props
    +-- jimuMapView (ExB wrapper for MapView, from widget state)
    +-- (other spatial query props)
```

> **Note:** `jimuMapView` is stored in widget.tsx state (not just a ref like `mapView`)
> because `JimuDraw` requires the ExB `JimuMapView` wrapper object, not a raw
> `__esri.MapView`. The prop flows: widget.tsx state → QueryTaskList → QueryTask →
> SpatialTabContent.

---

## Test Coverage

- `tests/widget.test.tsx` -- 5 tests: render placeholder, dispatch state event, Block/Inline/Popper arrange, config registration
- `helper-simple/tests/widget.test.tsx` -- 22 tests: DOM detection, hash parsing, lifecycle, getWidgetShortIds, event handlers

---

*Last updated: r025.072 (2026-03-15)*
