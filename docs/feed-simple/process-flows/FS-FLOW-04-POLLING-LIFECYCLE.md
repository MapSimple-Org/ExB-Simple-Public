# FS-FLOW-04: Polling Lifecycle

## Overview

Describes the interval-based polling system including timer management, Page Visibility
API integration, change detection with highlight animation, exponential backoff on
failure, and manual retry after polling pause.

**Key files:**
- `feed-simple/src/runtime/widget.tsx` -- polling methods (widget.tsx:144-281)

---

## Polling State Machine

```
                   ┌──────────────────┐
                   │    DISABLED      │
                   │ (interval = 0)   │
                   └──────────────────┘
                          ↑
                   interval is 0
                          |
 ┌─────────┐    startPolling()    ┌──────────┐
 │  MOUNT   │ ───────────────────>│  ACTIVE   │
 └─────────┘                      │ (polling) │
                                  └──────────┘
                                   |       ↑
                          fetch    |       | fetch
                          fails    |       | succeeds
                          3x       |       | (resets)
                                   v       |
                              ┌──────────┐ |
                              │ BACKOFF  │─┘
                              │ (2x int) │
                              └──────────┘
                                   |
                          fetch    |
                          fails    |
                          6x       |
                                   v
                              ┌──────────┐
                              │  PAUSED  │
                              │ (manual) │
                              └──────────┘
                                   |
                          user     |
                          clicks   |
                          retry    |
                                   v
                              ┌──────────┐
                              │  ACTIVE  │
                              └──────────┘
```

---

## Timer Management

### startPolling()

```
 startPolling()                              <- widget.tsx:152
      |
      +-- stopPolling()                      :153
      |   (clear any existing timer)
      |
      +-- Guard: pollPaused?                 :155-158
      |   → return (don't start if paused)
      |
      +-- Guard: interval <= 0?              :160-164
      |   → return (polling disabled)
      |
      +-- Calculate effective interval       :166
      |   Math.max(intervalSec, MIN_POLL_INTERVAL)
      |   (minimum 15 seconds)
      |
      +-- Apply backoff?                     :169-173
      |   if (consecutiveFailures >= BACKOFF_THRESHOLD)
      |   → effectiveInterval *= 2
      |
      +-- setInterval(loadFeed, intervalMs)  :178-181
          Store timer ID in this.pollTimerId
```

### stopPolling()

```
 stopPolling()                               <- widget.tsx:185
      |
      +-- Guard: pollTimerId !== null?       :186
      |   → clearInterval(pollTimerId)
      |   → pollTimerId = null
```

---

## Page Visibility API

Pauses polling when the browser tab is hidden, resumes with an immediate fetch when
the tab becomes visible again.

### Setup

```
 setupVisibilityListener()                   <- widget.tsx:196
      |
      +-- Create bound handler               :197-209
      |   document.hidden?
      |   +-- YES → stopPolling()
      |   +-- NO  → loadFeed() + startPolling()
      |             (immediate fetch on return)
      |
      +-- document.addEventListener(         :210
          'visibilitychange', handler)
```

### Teardown

```
 teardownVisibilityListener()                <- widget.tsx:214
      |
      +-- document.removeEventListener(...)  :216
      +-- handleVisibilityChange = null      :217
```

### Visibility Flow

```
 Tab Hidden                                  Polling Timer
      |                                           |
      +-- visibilitychange event ──────>  stopPolling()
                                                  |
                                            (timer cleared)

 Tab Visible Again
      |
      +-- visibilitychange event ──────>  loadFeed()
                                          startPolling()
                                                  |
                                         (immediate data + new timer)
```

---

## Change Detection

Compares item IDs between fetch cycles to identify new or changed items.

### getItemId()

```
 getItemId(item)                             <- widget.tsx:227
      |
      +-- joinFieldFeed configured?          :229-230
      |   +-- YES + item has value → item[joinFieldFeed]
      |   +-- NO  → Object.values(item).join('|')
      |             (hash all values as fallback)
```

### detectChanges()

```
 detectChanges(newItems)                     <- widget.tsx:240
      |
      +-- previousItemIds empty?             :242
      |   → return empty Set (first load, no comparison)
      |
      +-- For each new item:                 :245-251
          id = getItemId(item)
          if (!previousItemIds.has(id))
          → add to changed Set
      |
      +-- Return Set<string> of changed IDs
```

---

## Highlight Animation

New/changed items get a transient gold flash animation (2 seconds).

### applyHighlights()

```
 applyHighlights(ids)                        <- widget.tsx:265
      |
      +-- Guard: ids.size === 0 → return    :266
      |
      +-- clearHighlightTimer()             :268
      |   (cancel any pending auto-dismiss)
      |
      +-- setState({ highlightedIds: ids }) :269
      |
      +-- setTimeout(2000ms)                :277-280
          → setState({ highlightedIds: Set() })
          → highlightTimerId = null
```

### Visual Effect (in FeedCard)

```
 FeedCard render (isHighlighted=true)        <- feed-card.tsx:126-135
      |
      +-- Overlay <div>:
          position: absolute, inset: 0
          background: #ffd700 (gold)
          pointer-events: none
          animation: feedSimpleHighlight {duration}ms ease-out
            0%:   opacity 0.45
            100%: opacity 0
```

---

## Exponential Backoff

### Failure Handling in loadFeed()

```
 loadFeed() catch                            <- widget.tsx:454
      |
      +-- failures = consecutiveFailures + 1 :456
      |
      +-- failures >= PAUSE_THRESHOLD (6)?   :468-471
      |   → stopPolling()
      |   → setState({ pollPaused: true })
      |
      +-- failures >= BACKOFF_THRESHOLD (3)? :472-474
          → startPolling()
            (startPolling reads consecutiveFailures
             and doubles the interval)
```

### Success Recovery

```
 loadFeed() success                          <- widget.tsx:429-446
      |
      +-- wasBackedOff = (failures >= 3)     :429
      |
      +-- setState({ consecutiveFailures: 0 }) :439
      |
      +-- if (wasBackedOff)                  :443-446
          → startPolling()
            (restores normal interval)
```

### Backoff Timeline Example

| Failure # | State | Interval (30s base) |
|-----------|-------|---------------------|
| 0 | Normal | 30s |
| 1 | Normal | 30s |
| 2 | Normal | 30s |
| 3 | Backoff | 60s (doubled) |
| 4 | Backoff | 60s |
| 5 | Backoff | 60s |
| 6 | Paused | Stopped — manual retry only |

---

## Manual Retry (Poll Paused State)

When polling is paused (6+ failures), the widget shows a clickable banner:

```
 "Feed unavailable — click to retry"        <- widget.tsx:620-653
      |
      +-- onClick / onKeyDown (Enter/Space)  :624-636
          setState({
            pollPaused: false,
            consecutiveFailures: 0
          }, () => {
            loadFeed()
            startPolling()
          })
```

---

## Non-Blocking Error Banner

When a fetch fails but the widget has existing data, a yellow warning banner is shown
instead of replacing the data with an error state:

```
 fetchError && !pollPaused?                  <- widget.tsx:656-675
      |
      +-- Yellow warning banner:
          "Feed temporarily unavailable — showing last available data"
          Includes lastUpdatedStr timestamp if available
```

---

## Lifecycle Summary

| Event | Action |
|-------|--------|
| `componentDidMount` | Start polling + setup visibility listener |
| Feed URL changed | Reload + restart polling |
| Interval changed | Restart polling with new interval |
| Tab hidden | Stop polling |
| Tab visible | Immediate fetch + restart polling |
| Fetch success | Reset failure counter; restore normal interval if backed off |
| 3 consecutive failures | Double polling interval |
| 6 consecutive failures | Pause polling, show retry banner |
| User clicks retry | Reset counters, fetch + restart polling |
| `componentWillUnmount` | Stop polling + clear timers + remove listener |

---

*Last updated: r001.031 (2026-03-13)*
