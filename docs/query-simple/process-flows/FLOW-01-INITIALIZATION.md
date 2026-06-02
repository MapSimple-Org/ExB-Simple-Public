# FLOW-01: Widget Initialization

## Overview

Describes the startup sequence for both QuerySimple and HelperSimple widgets.
QuerySimple follows a "Manager & Shell" pattern where seven manager classes handle
complex logic while the main widget class manages React lifecycle and rendering.

**Key files:**
- `query-simple/src/runtime/widget.tsx` -- main widget class, manager instantiation, render logic
- `query-simple/src/runtime/query-task-list.tsx` -- conditional query renderer (610 lines)
- `query-simple/src/runtime/query-task.tsx` -- individual query executor (1,915 lines)
- `helper-simple/src/runtime/widget.tsx` -- URL orchestrator (749 lines)

---

## Entry Point

Widget mounts when ExB renders the widget component. Both widgets extend
`React.PureComponent<AllWidgetProps<IMConfig>>`.

---

## QuerySimple Initialization Sequence

```
 Widget Constructor                           <- widget.tsx:118
      |
      +-- widgetConfigManager.registerConfig()  :120
      |   (early registration, before callbacks fire)
      |
      v
 componentDidMount()                         <- widget.tsx:350
      |
      +-- [1] WidgetVisibilityManager.setup()  :369-385
      |   +-- IntersectionObserver registration
      |   +-- onVisibilityChange callback -> setState
      |   +-- notifyMount() -> dispatches mount event  :388
      |
      +-- [2] AccumulatedRecordsManager sync   :394-405
      |   +-- handleResultsModeChange()
      |   +-- handleAccumulatedRecordsChange()
      |   +-- setCallbacks()                    :411-425
      |
      +-- [3] EventManager.setHandlers() + setup()  :428-435
      |   +-- OPEN_WIDGET_EVENT listener
      |   +-- QUERYSIMPLE_SELECTION_EVENT listener
      |   +-- RESTORE_ON_IDENTIFY_CLOSE_EVENT listener
      |
      +-- [4] SelectionRestorationManager.setWidgetId()  :438
      |
      +-- [5] widgetConfigManager.registerConfig()  :443
      |
      v
 [DEFERRED] JimuMapViewComponent.onActiveViewChange
      |
      +-- handleJimuMapViewChanged()           <- widget.tsx:878
      +-- MapViewManager.handleJimuMapViewChanged()
      +-- Path 1 (addResultsAsMapLayer !== true):  :898-908
      |   +-- GraphicsLayerManager.initialize() -> plain GraphicsLayer (r028.096)
      |   +-- Add layer to mapView.map.layers
      +-- Path 3 (addResultsAsMapLayer === true):   :911-913
      |   +-- initResultFeatureLayers() -> GroupLayer (r028.092)
      +-- Mobile popup behavior applied at popup open time in query-result.tsx (r028.001)
          via applyMobilePopupBehavior() from shared-code
```

---

## Manager Pattern

All managers are utility classes (not hooks) instantiated as private members:

All manager files live in `query-simple/src/runtime/managers/`.

| Manager | File | Responsibility |
|---------|------|----------------|
| UrlConsumptionManager | url-consumption-manager.ts | Hash/query parameter parsing |
| WidgetVisibilityManager | widget-visibility-manager.ts | IntersectionObserver DOM visibility |
| MapViewManager | map-view-manager.ts | MapView ref caching |
| GraphicsLayerManager | graphics-layer-manager.ts | Path 1 GraphicsLayer create/cleanup (r028.096) |
| AccumulatedRecordsManager | accumulated-records-manager.ts | Results mode + records state |
| EventManager | event-manager.ts | Window event listener lifecycle |
| SelectionRestorationManager | selection-restoration-manager.ts | Selection state + panel restore |

Instantiation order (widget.tsx:81-114):
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
  +-- arrangeType === Popper && !controllerWidgetId   :1547-1583
  |   +-- TaskListPopperWrapper
  |       +-- QueryTaskList (isInPopper=true)
  |
  +-- arrangeType === Inline && !controllerWidgetId   :1586-1601
  |   +-- TaskListInline
  |       +-- QueryTaskList
  |
  +-- arrangeType === Block (default)                 :1603-1716
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
 componentDidMount()                         <- helper-simple/widget.tsx:90
      |
      +-- addEventListener('hashchange', handleHashChange)       :92
      +-- addEventListener(QUERYSIMPLE_SELECTION_EVENT, ...)      :97
      +-- addEventListener(QUERYSIMPLE_HASH_QUERY_EXECUTED, ...)  :100
      |   (QUERYSIMPLE_WIDGET_STATE_EVENT listener removed -- see :446)
      |
      +-- checkUrlParameters()                                    :94
      |   (immediate check on mount for URL hash match)
      |
      +-- parseHashForWidgetSelection() -> previousHashEntry      :104
      +-- startIdentifyPopupWatching() -> MutationObserver        :106
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
    +-- graphicsLayer, mapView, jimuMapView
    +-- eventManager, onInitializeGraphicsLayer, onClearGraphicsLayer, onDestroyGraphicsLayer
    +-- activeTab, onTabChange, isPanelVisible
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

- `tests/widget.test.tsx` -- 5 tests: render placeholder, dispatch state event, Block arrange, Inline arrange, config registration
- `helper-simple/tests/widget.test.tsx` -- 20 tests: DOM detection (isIdentifyPopupOpen), hash parsing (parseHashForWidgetSelection), lifecycle, getWidgetShortIds, handleHashQueryExecuted

---

*Last updated: r028.118 (2026-06-02) — line-ref accuracy audit*
