# FLOW-06: URL Hash & Deep Linking

## Overview

HelperSimple monitors URL hash parameters and automatically opens managed
QuerySimple widgets when matching shortIds are detected. This enables deep
linking: a URL like `#pin=2223059013` opens the widget and executes the query.

**Key files:**
- `helper-simple/src/runtime/widget.tsx` -- hash monitoring, widget opening, event coordination
- `query-simple/src/runtime/widget.tsx` -- OPEN_WIDGET_EVENT handler, URL consumption
- `query-simple/src/runtime/managers/url-consumption-manager.ts` -- UrlConsumptionManager
- `query-simple/src/runtime/hash-utils.ts` -- hash URL read/write utilities

---

## Hash Format

| Format | Example | Description |
|--------|---------|-------------|
| ShortId query | `#pin=2223059013` | Trigger query with shortId "pin" and value |
| Force open | `#qsopen=true` | Open widget without query parameter match |
| Query string | `?pin=2223059013` | Same as hash format, via query string |
| Selection hash | `#data_s=id:widget_12_output_*:451204` | ExB selection tracking (auto-generated) |

---

## Flow Diagram: Hash Detection & Widget Opening

```
 Hash changes (or page load)
      |                               <- helper-simple/widget.tsx:389
      v
 handleHashChange()
      |
      v
 checkUrlParameters()                <- :296
      |
      +-- Guard: no managedWidgetId -> exit           :299
      +-- Guard: no hash && no query -> exit          :317
      |
      +-- Check: qsopen=true?                        :325
      |   +-- YES -> revealManagedWidget(managedWidgetId)  :420
      |   +-- return
      |
      +-- getWidgetShortIds(managedWidgetId)
      |   +-- Read appConfig.widgets[id].config.queryItems
      |   +-- Return array of non-empty shortIds
      |
      +-- For each shortId:
      |   +-- hashParams.get(shortId) || queryParams.get(shortId)
      |   +-- Match found?
      |       +-- currentHash = "${shortId}=${hashValue}"
      |       +-- Already executed (== lastExecutedHash)?
      |       |   +-- YES -> skip (prevent re-execution)
      |       |   +-- NO  -> revealManagedWidget(managedWidgetId)  :459
      |
      v
 revealManagedWidget(widgetId)        <- :243   (r028.140: replaces the old openWidget)
      |
      +-- resolveWidgetSectionView(widgetId, appConfig)   widget-placement.ts
      |   (walks layouts -> views -> sections to find the widget's section + view)
      |
      +-- Section/view resolved? (logged as helpersimple-reveal-strategy)
      |   +-- YES -> revealInSection: clickSectionViewNavItem(sectionId, viewId)   :293
      |   |          clicks the Navigator tab [aria-controls="${sectionId}_${viewId}"]
      |   |          (visible responsive instance; polls ~1.8s; not-found -> BUG warn
      |   |           + controller fallback). ExB runs its own switch incl. opening a
      |   |           wrapping sidebar - what the user's click does.
      |   +-- NO  -> openInController: getAppStore().dispatch(openWidget action)   :330
      |              (the original controller path; controllers fall through here)
      |
      +-- notifyManagedWidget(widgetId)   :343   (ALWAYS, regardless of branch)
      |   +-- loadWidgetClass(widgetId)
      |   +-- setTimeout(500ms) -> dispatch OPEN_WIDGET_EVENT { detail: { widgetId } }
      |
      v
 [QuerySimple receives OPEN_WIDGET_EVENT]
      |                               <- query-simple/widget.tsx:170
      v
 handleOpenWidgetEvent()
      |
      +-- Guard: event.detail.widgetId !== this.props.id -> exit  :192
      |
      +-- setState({ shouldUseInitialQueryValueForSelection: true })  :214
      |
      +-- urlConsumptionManager.checkUrlParameters()   :236
      |   +-- Parse hash/query for matching shortId
      |   +-- onInitialValueFound callback:
      |       +-- setState({ initialQueryValue: { shortId, value } })
      |       +-- Reset results mode to NewSelection if needed
      |
      v
 QueryTaskList receives initialQueryValue via props
      |
      +-- Match shortId to queryItem index
      +-- Pre-fill search field
      +-- Auto-execute query (if shouldUseInitialQueryValueForSelection)
```

---

## Re-execution Prevention

HelperSimple tracks `lastExecutedHash` to prevent the same hash from triggering
multiple widget opens:

```
 handleHashQueryExecuted event       <- helper-simple/widget.tsx:452
      |
      +-- Guard: widgetId !== managedWidgetId -> ignore
      |
      +-- lastExecutedHash = hashParam    :479
      |   (format: "shortId=value")
      |
      v
 Next hashchange:
      +-- currentHash === lastExecutedHash?
          +-- YES -> skip
          +-- NO  -> open widget
```

---

## Identify Popup Interaction

When an identify popup opens (map click), it can clear QuerySimple's selection.
HelperSimple detects popup state via MutationObserver and dispatches a restore
event when the popup closes.

```
 MutationObserver fires              <- helper-simple/widget.tsx:634
      |
      +-- isIdentifyPopupOpen()       <- :35-62
      |   +-- Check: .esri-popup[role="dialog"] exists?
      |   +-- Check: aria-hidden !== "true"?
      |   +-- Check: computed style visible?
      |   +-- Check: .esri-features child exists?
      |
      +-- Popup just closed?
          +-- Dispatch 'querysimple-restore-on-identify-close' event  :683
          +-- QuerySimple handles restoration via SelectionRestorationManager
```

---

## data_s Hash Parsing

`parseHashForWidgetSelection()` extracts widget selection state from ExB's
auto-generated `data_s` hash parameter:

```
 Input:  #data_s=id:widget_12_output_28628683957324497:451204%2B451205
 Output: { outputDsId: "widget_12_output_28628683957324497",
           recordIds: ["451204", "451205"] }
```

Supports two formats:
- **Direct:** `id:widget_XX_output_*:recordIds`
- **Compound:** `id:dataSource_*~widget_XX_output_*:recordIds`

---

## Event Constants

| Constant | Value | Direction |
|----------|-------|-----------|
| `OPEN_WIDGET_EVENT` | `helpersimple-open-widget` | HelperSimple -> QuerySimple |
| `QUERYSIMPLE_SELECTION_EVENT` | `querysimple-selection-changed` | QuerySimple -> HelperSimple |
| `QUERYSIMPLE_WIDGET_STATE_EVENT` * | `querysimple-widget-state-changed` | QuerySimple -> HelperSimple |
| `QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT` | `querysimple-hash-query-executed` | QuerySimple -> HelperSimple |
| `RESTORE_ON_IDENTIFY_CLOSE_EVENT` | `querysimple-restore-on-identify-close` | HelperSimple -> QuerySimple |

\* QuerySimple still emits `querysimple-widget-state-changed` (widget-visibility-manager.ts),
but HelperSimple no longer listens for it — the `handleQuerySimpleWidgetStateChange`
handler was removed in r024.112 (see helper-simple/widget.tsx:445-446). Retained here
for reference since the event remains part of the codebase. **Re-evaluation pending —
see TODO #32** (the removal was made without sign-off; HelperSimple consuming QS
open/close state may be brought back).

---

## Test Coverage

`helper-simple/tests/widget.test.tsx` -- 20 tests covering:
- `isIdentifyPopupOpen`: DOM detection (4 tests)
- `parseHashForWidgetSelection`: format parsing (7 tests)
- `getWidgetShortIds`: config extraction (4 tests)
- `handleHashQueryExecuted`: re-execution prevention (2 tests)
- Widget lifecycle: event listener setup/cleanup (3 tests)

---

*Last updated: r028.140 (2026-06-24) -- open mechanism rewritten: openWidget -> placement-aware revealManagedWidget (section nav-tab click via widget-placement.ts vs the original controller open). Refs in the reveal block corrected (243/293/330/343/420/459); upstream refs (checkUrlParameters/qsopen/getWidgetShortIds/shortId loop) drifted ~+89 lines from the reveal-method insertion and still need a full ref re-audit.*
