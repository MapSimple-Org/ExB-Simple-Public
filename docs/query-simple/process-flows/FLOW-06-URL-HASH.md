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
      |                               <- helper-simple/widget.tsx:397
      v
 handleHashChange()
      |
      v
 checkUrlParameters()                <- :304
      |
      +-- Guard: no managedWidgetId -> exit           :307
      +-- Guard: no hash && no query -> exit          :325
      |
      +-- Check: qsopen=true?                        :333
      |   +-- YES -> openWidget(managedWidgetId)      :339
      |   +-- return
      |
      +-- getWidgetShortIds(managedWidgetId)           :344
      |   +-- Read appConfig.widgets[id].config.queryItems
      |   +-- Return array of non-empty shortIds
      |
      +-- For each shortId:                            :351
      |   +-- hashParams.get(shortId) || queryParams.get(shortId)
      |   +-- Match found?
      |       +-- currentHash = "${shortId}=${hashValue}"
      |       +-- Already executed (== lastExecutedHash)?
      |       |   +-- YES -> skip (prevent re-execution)   :379
      |       |   +-- NO  -> openWidget(managedWidgetId)    :378
      |
      v
 openWidget(widgetId)                 <- :240
      |
      +-- loadWidgetClass(widgetId)    :249
      |   +-- WidgetManager.loadWidgetClass() if not loaded
      |
      +-- getAppStore().dispatch(openWidget action)  :251
      |
      +-- setTimeout(500ms)                          :260
      |   +-- Dispatch OPEN_WIDGET_EVENT
      |       { detail: { widgetId } }
      |
      v
 [QuerySimple receives OPEN_WIDGET_EVENT]
      |                               <- query-simple/widget.tsx:166
      v
 handleOpenWidgetEvent()
      |
      +-- Guard: event.detail.widgetId !== this.props.id -> exit  :188
      |
      +-- setState({ shouldUseInitialQueryValueForSelection: true })  :210
      |
      +-- urlConsumptionManager.checkUrlParameters()   :244
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
 handleHashQueryExecuted event       <- helper-simple/widget.tsx:482
      |
      +-- Guard: widgetId !== managedWidgetId -> ignore
      |
      +-- lastExecutedHash = hashParam    :509
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
 MutationObserver fires              <- helper-simple/widget.tsx:664
      |
      +-- isIdentifyPopupOpen()       <- :37-64
      |   +-- Check: .esri-popup[role="dialog"] exists?
      |   +-- Check: aria-hidden !== "true"?
      |   +-- Check: computed style visible?
      |   +-- Check: .esri-features child exists?
      |
      +-- Popup just closed?
          +-- Dispatch 'querysimple-restore-on-identify-close' event  :705
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
| `QUERYSIMPLE_WIDGET_STATE_EVENT` | `querysimple-widget-state-changed` | QuerySimple -> HelperSimple |
| `QUERYSIMPLE_HASH_QUERY_EXECUTED_EVENT` | `querysimple-hash-query-executed` | QuerySimple -> HelperSimple |
| `RESTORE_ON_IDENTIFY_CLOSE_EVENT` | `querysimple-restore-on-identify-close` | HelperSimple -> QuerySimple |

---

## Test Coverage

`helper-simple/tests/widget.test.tsx` -- 22 tests covering:
- `isIdentifyPopupOpen`: DOM detection (4 tests)
- `parseHashForWidgetSelection`: format parsing (7 tests)
- `getWidgetShortIds`: config extraction (4 tests)
- `handleHashQueryExecuted`: re-execution prevention (2 tests)
- Widget lifecycle: event listener setup/cleanup (3 tests)
- `handleQuerySimpleWidgetStateChange`: state tracking (2 tests)

---

*Last updated: r024.118 (2026-03-03)*
