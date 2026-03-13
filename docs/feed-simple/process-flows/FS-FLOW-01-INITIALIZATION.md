# FS-FLOW-01: Widget Initialization

## Overview

Describes the startup sequence for the FeedSimple widget. The widget extends
`React.PureComponent` and orchestrates feed fetching, polling, page visibility
awareness, and optional map integration on mount.

**Key files:**
- `feed-simple/src/runtime/widget.tsx` -- main widget class (783 lines)
- `feed-simple/src/runtime/feed-card.tsx` -- presentational card component (139 lines)
- `feed-simple/src/config.ts` -- FeedSimpleConfig interface
- `feed-simple/src/version-manager.ts` -- config migration between versions

---

## Entry Point

Widget mounts when ExB renders the widget component. The widget class extends
`React.PureComponent<AllWidgetProps<IMConfig>, State>`.

---

## Initialization Sequence

```
 Widget Constructor                           <- widget.tsx:76
      |
      +-- Initialize state                    :78-91
      |   items: []
      |   fieldNames: []
      |   isLoading: false
      |   error: null
      |   fetchError: null
      |   lastFetchTime: null
      |   previousItemIds: Set<string>
      |   highlightedIds: Set<string>
      |   consecutiveFailures: 0
      |   pollPaused: false
      |   geometryMap: Map()
      |   selectedItemId: null
      |
      +-- Initialize private members          :68-74
      |   pollTimerId: null
      |   highlightTimerId: null
      |   handleVisibilityChange: null
      |   previousJoinIds: Set<string>
      |   mapView: null
      |
      v
 componentDidMount()                         <- widget.tsx:98
      |
      +-- [1] Log mount event                 :99
      |   debugLogger.log('FETCH', { action: 'widget-mounted' })
      |
      +-- [2] Conditional initial fetch       :100-103
      |   if (config.feedUrl) → this.loadFeed()
      |   (see FS-FLOW-02 for full fetch/parse pipeline)
      |
      +-- [3] Start polling timer             :104
      |   this.startPolling()
      |   (see FS-FLOW-04 for polling lifecycle)
      |
      +-- [4] Setup Page Visibility API       :105
      |   this.setupVisibilityListener()
      |   (see FS-FLOW-04 for visibility details)
      |
      v
 [DEFERRED] JimuMapViewComponent callback
      |
      +-- onActiveViewChange()                <- widget.tsx:286
      |   this.mapView = jimuMapView?.view
      |   (only fires if config.mapWidgetId is set)
      |
      v
 [DEFERRED] DataSourceComponent callback
      |
      +-- onOriginDsCreated()                 <- widget.tsx:292
          if items loaded + map integration configured
          → this.runQueryGeometries(items)
          (see FS-FLOW-05 for map integration)
```

---

## State Shape

| State Field | Type | Purpose |
|-------------|------|---------|
| `items` | `FeedItem[]` | Parsed feed items (current cycle) |
| `fieldNames` | `string[]` | Discovered XML element names |
| `isLoading` | `boolean` | Full loading spinner (first load only) |
| `error` | `string | null` | Blocking error (first load failed) |
| `fetchError` | `string | null` | Non-blocking error (stale data shown) |
| `lastFetchTime` | `number | null` | Timestamp of last successful fetch |
| `previousItemIds` | `Set<string>` | IDs from last cycle (change detection) |
| `highlightedIds` | `Set<string>` | Currently highlighted new/changed items |
| `consecutiveFailures` | `number` | Failure count for backoff logic |
| `pollPaused` | `boolean` | Polling paused after PAUSE_THRESHOLD |
| `geometryMap` | `Map<string, RestGeometry>` | Cached geometries from feature service |
| `selectedItemId` | `string | null` | Currently selected card (toggle behavior) |

---

## Private Members (Instance Variables)

| Member | Type | Purpose |
|--------|------|---------|
| `pollTimerId` | `ReturnType<typeof setInterval>` | Active polling timer reference |
| `highlightTimerId` | `ReturnType<typeof setTimeout>` | Highlight auto-dismiss timer |
| `handleVisibilityChange` | `(() => void) | null` | Bound visibility listener for cleanup |
| `previousJoinIds` | `Set<string>` | Cached join IDs for skip optimization |
| `mapView` | `MapView | SceneView | null` | JSAPI map view for goTo/popup |

---

## componentDidUpdate — Config Change Handling

```
 componentDidUpdate(prevProps)                <- widget.tsx:108
      |
      +-- Feed URL changed?                   :115-118
      |   if (prevUrl !== currUrl && currUrl)
      |   → loadFeed() + startPolling()
      |
      +-- Refresh interval changed?           :121-123
      |   if (prevInterval !== currInterval)
      |   → startPolling()
      |
      +-- Spatial join DS changed?            :126-134
          if (prevDsId !== currDsId)
          → reset previousJoinIds, geometryMap, selectedItemId
          → if items exist + map configured → runQueryGeometries()
```

---

## componentWillUnmount — Cleanup

```
 componentWillUnmount()                      <- widget.tsx:137
      |
      +-- stopPolling()                       :138
      |   (clears setInterval timer)
      |
      +-- clearHighlightTimer()               :139
      |   (clears setTimeout for highlight auto-dismiss)
      |
      +-- teardownVisibilityListener()        :140
      |   (removes 'visibilitychange' event listener)
      |
      +-- Log unmount                         :141
```

---

## Component Hierarchy (Render Tree)

```
Widget (widget.tsx)
  |
  +-- No feedUrl configured?                  :589-597
  |   "Configure a feed URL in settings"
  |
  +-- isLoading?                              :599-603
  |   "Loading..."
  |
  +-- error? (first load failed)              :606-617
  |   Red error box
  |
  +-- pollPaused?                             :620-653
  |   "Feed unavailable — click to retry"
  |   (role=button, onClick resets + retries)
  |
  +-- fetchError? (non-blocking)              :656-675
  |   Yellow warning banner, shows stale data age
  |
  +-- Items rendering                         :677-706
  |   getDisplayItems() → filtered/limited items
  |   items.map() → FeedCard components
  |
  +-- DataSourceComponent                     :709-714
  |   (only if map integration configured)
  |   onDataSourceCreated → onOriginDsCreated
  |
  +-- JimuMapViewComponent                    :716-721
  |   (only if config.mapWidgetId set)
  |   onActiveViewChange → stores mapView ref
  |
  +-- Footer                                  :724-779
      RSS icon + "FeedSimple by MapSimple"
      Version display
      "Last updated: TIME" (if showLastUpdated)
```

---

## Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `MIN_POLL_INTERVAL` | 15 | Minimum polling interval in seconds |
| `HIGHLIGHT_DURATION_MS` | 2000 | Duration of new/changed card flash animation |
| `BACKOFF_THRESHOLD` | 3 | Consecutive failures before doubling interval |
| `PAUSE_THRESHOLD` | 6 | Consecutive failures before pausing polling |

---

*Last updated: r001.031 (2026-03-13)*
