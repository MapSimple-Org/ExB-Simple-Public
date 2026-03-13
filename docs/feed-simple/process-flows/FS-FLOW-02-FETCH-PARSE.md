# FS-FLOW-02: Fetch and Parse Pipeline

## Overview

Describes the end-to-end data flow from HTTP fetch to parsed `FeedItem[]` array.
The pipeline is: URL validation, HTTP fetch, XML sanitization, DOMParser extraction,
sorting, change detection, and state update.

**Key files:**
- `feed-simple/src/runtime/widget.tsx` -- `loadFeed()` orchestration (widget.tsx:384-477)
- `feed-simple/src/utils/feed-fetcher.ts` -- HTTP fetch wrapper (33 lines)
- `feed-simple/src/utils/parsers/interface.ts` -- `IFeedParser` contract, `FeedItem` type
- `feed-simple/src/utils/parsers/custom-xml.ts` -- XML parser with entity sanitization (67 lines)

---

## Flow Diagram

```
 loadFeed()                                  <- widget.tsx:384
      |
      +-- Determine loading mode              :386-393
      |   hasExistingData?
      |   +-- YES → clear fetchError only (non-blocking refresh)
      |   +-- NO  → set isLoading=true, clear errors
      |
      +-- debugLogger.log('FETCH', ...)       :395
      |
      v
 fetchFeed(feedUrl)                          <- feed-fetcher.ts:11
      |
      +-- Guard: url empty?                   :12-14
      |   → throw 'No feed URL configured'
      |
      +-- fetch(url)                          :16
      |   (browser Fetch API, subject to CORS)
      |
      +-- Guard: !response.ok?               :18-20
      |   → throw 'Feed fetch failed: HTTP {status} {statusText}'
      |
      +-- response.text()                    :22
      |
      +-- Guard: empty response?             :24-26
      |   → throw 'Feed response was empty'
      |
      +-- Return { text, status }            :28-31
      |
      v
 parser.parse(result.text, rootItemElement)  <- widget.tsx:401
      |                                      <- custom-xml.ts:31
      |
      +-- sanitizeXml(rawText)               <- custom-xml.ts:14-28
      |   Replace HTML entities invalid in XML:
      |   &nbsp;  → &#160;
      |   &mdash; → &#8212;
      |   &ndash; → &#8211;
      |   &lsquo; → &#8216;
      |   &rsquo; → &#8217;
      |   &ldquo; → &#8220;
      |   &rdquo; → &#8221;
      |   &bull;  → &#8226;
      |   &hellip;→ &#8230;
      |   &copy;  → &#169;
      |   &reg;   → &#174;
      |   &trade; → &#8482;
      |
      +-- DOMParser.parseFromString()        <- custom-xml.ts:33-34
      |   (mode: 'text/xml')
      |
      +-- Check for <parsererror>            <- custom-xml.ts:37-39
      |   → throw 'XML parse error: {detail}'
      |
      +-- getElementsByTagName(rootItemElement)  <- custom-xml.ts:42
      |
      +-- For each item element:             <- custom-xml.ts:46-59
      |   For each direct child element:
      |     item[child.localName] = child.textContent
      |     fieldNameSet.add(child.localName)
      |
      +-- Return { items, fieldNames }       <- custom-xml.ts:62-65
      |
      v
 Back in loadFeed()                          <- widget.tsx:401
      |
      +-- sortItems(parsed.items)            <- widget.tsx:408
      |   (see Sorting section below)
      |
      +-- Change detection                   <- widget.tsx:418-423
      |   if (config.highlightNewItems)
      |     detectChanges(sortedItems)
      |     → applyHighlights(changedIds)
      |   (see FS-FLOW-04 for highlight details)
      |
      +-- Build new ID set                   <- widget.tsx:426
      |   newItemIds = Set(items.map(getItemId))
      |
      +-- Check backoff recovery             <- widget.tsx:429
      |   wasBackedOff = (consecutiveFailures >= BACKOFF_THRESHOLD)
      |
      +-- setState (success)                 <- widget.tsx:431-441
      |   items: sortedItems
      |   fieldNames: parsed.fieldNames
      |   isLoading: false
      |   error: null, fetchError: null
      |   lastFetchTime: Date.now()
      |   previousItemIds: newItemIds
      |   consecutiveFailures: 0
      |   pollPaused: false
      |
      +-- Restore normal polling?            <- widget.tsx:443-446
      |   if (wasBackedOff) → startPolling()
      |
      +-- Map integration query              <- widget.tsx:449-453
          if (isMapIntegrationConfigured())
          → runQueryGeometries(sortedItems)
          (see FS-FLOW-05)
```

---

## Error Handling

```
 loadFeed() catch block                      <- widget.tsx:454
      |
      +-- Increment failure counter          :456
      |   failures = consecutiveFailures + 1
      |
      +-- Has existing data?                 :459-464
      |   +-- YES → setState({ fetchError })
      |   |   (keep last good data visible, show warning banner)
      |   +-- NO  → setState({ error })
      |       (show full error state, no data)
      |
      +-- failures >= PAUSE_THRESHOLD (6)?   :468-471
      |   → stopPolling(), setState({ pollPaused: true })
      |
      +-- failures >= BACKOFF_THRESHOLD (3)? :472-474
          → startPolling() (with doubled interval)
          (see FS-FLOW-04 for backoff logic)
```

---

## Sorting Strategy

The `sortItems()` method (widget.tsx:355-382) applies sorting with smart type detection:

```
 sortItems(items)                            <- widget.tsx:355
      |
      +-- No sortField configured?           :357
      |   +-- reverseFeedOrder? → [...items].reverse()
      |   +-- Otherwise → items (original order)
      |
      +-- Sort with type detection:          :361-381
          For each pair (a, b):
            1. Try date parsing first         :366-369
               Date.parse(valA) vs Date.parse(valB)
            2. Try numeric comparison         :372-376
               Number(valA) vs Number(valB)
            3. Fall back to string comparison :379-380
               localeCompare (case-insensitive)

          Direction: sortDirection === 'desc' ? -1 : 1
```

---

## Item Identification

The `getItemId()` method (widget.tsx:227-234) generates stable IDs for change detection:

| Config State | ID Strategy |
|-------------|-------------|
| `joinFieldFeed` configured + item has value | `item[joinFieldFeed]` |
| No join field | Hash of all field values: `Object.values(item).join('\|')` |

---

## Display Filtering

`getDisplayItems()` (widget.tsx:328-346) applies config-driven filters at render time
(not during fetch, so config changes take effect without re-fetching):

```
 getDisplayItems()                           <- widget.tsx:328
      |
      +-- Filter by status                   :333-338
      |   if statusField + filterByStatus.length > 0
      |   → exclude items whose status is in the hide list
      |
      +-- Limit count                        :341-343
          if maxItems > 0
          → slice(0, maxItems)
```

---

## Pluggable Parser Architecture

The `IFeedParser` interface (parsers/interface.ts) enables future format support:

```
interface IFeedParser {
  parse(rawText: string, rootItemElement: string): ParseResult
}

interface ParseResult {
  items: FeedItem[]
  fieldNames: string[]
}

interface FeedItem {
  [fieldName: string]: string  // flat key-value pairs
}
```

Currently shipped: `CustomXmlParser` (v1). Future candidates: RSS 2.0, Atom, GeoRSS, JSON Feed.

The parser is instantiated as a module-level singleton (widget.tsx:30):
```
const parser = new CustomXmlParser()
```

---

*Last updated: r001.031 (2026-03-13)*
