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
      |   +-- YES -> openWidget(managedWidgetId)      :331
      |   +-- return
      |
      +-- getWidgetShortIds(managedWidgetId)           :336
      |   +-- Read appConfig.widgets[id].config.queryItems
      |   +-- Return array of non-empty shortIds
      |
      +-- For each shortId:                            :343
      |   +-- hashParams.get(shortId) || queryParams.get(shortId)
      |   +-- Match found?
      |       +-- currentHash = "${shortId}=${hashValue}"
      |       +-- Already executed (== lastExecutedHash)?      :361
      |       |   +-- YES -> skip (prevent re-execution)   :372
      |       |   +-- NO  -> openWidget(managedWidgetId)    :370
      |
      v
 openWidget(widgetId)                 <- :232
      |
      +-- loadWidgetClass(widgetId)    :241
      |   +-- WidgetManager.loadWidgetClass() if not loaded
      |
      +-- getAppStore().dispatch(openWidget action)  :243
      |
      +-- setTimeout(500ms)                          :252
      |   +-- Dispatch OPEN_WIDGET_EVENT
      |       { detail: { widgetId } }
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

*Last updated: r028.118 (2026-06-02) -- accuracy audit: corrected drifted line refs, test count (22->20), widget-state event note*
