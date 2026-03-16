# FS-FLOW-02: Fetch and Parse Pipeline

## Overview

Describes the end-to-end data flow from HTTP fetch to parsed `FeedItem[]` array.
The pipeline is: URL validation, HTTP fetch, XML sanitization, DOMParser extraction,
change detection, and state update. Items are stored **unsorted** -- sorting now
happens at render time via the processing pipeline in `feed-pipeline.ts` (r002).

**Key files:**
- `feed-simple/src/runtime/widget.tsx` -- `loadFeed()` orchestration (widget.tsx:384-477)
- `feed-simple/src/utils/feed-fetcher.ts` -- HTTP fetch wrapper (33 lines)
- `feed-simple/src/utils/parsers/interface.ts` -- `IFeedParser` contract, `FeedItem` type
- `feed-simple/src/utils/parsers/custom-xml.ts` -- XML parser with entity sanitization (67 lines)
- `feed-simple/src/runtime/feed-pipeline.ts` -- render-time processing pipeline: filter, search, sort, limit (r002)

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
      +-- For each item element:             <- custom-xml.ts:130-156
      |   +-- flattenElement(itemEl, '')     <- custom-xml.ts:52-112
      |   |   Recursive tree walk: dot-path keys, @attrs,
      |   |   bracket arrays, namespace stripping
      |   |
      |   +-- GeoRSS point split            <- custom-xml.ts:140-148
      |   |   For keys matching 'point' or '*.point':
      |   |     Split "lat lon" on whitespace
      |   |     If 2 valid numbers → emit point_lat, point_lon
      |   |     Original 'point' value preserved
      |   |   (r001.037)
      |   |
      |   +-- Collect field names into fieldNameSet
      |
      +-- Return { items, fieldNames }       <- custom-xml.ts:160-161
      |
      v
 Back in loadFeed()                          <- widget.tsx:401
      |
      +-- (sorting removed from fetch path)   (r002)
      |   Items are stored UNSORTED in state.
      |   Sorting now happens at render time via
      |   runPipeline() in feed-pipeline.ts.
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
      |   items: parsed.items (unsorted)
      |   fieldNames: parsed.fieldNames
      |   isLoading: false
      |   error: null, fetchError: null
      |   lastFetchTime: Date.now()
      |   previousItemIds: newItemIds
      |   consecutiveFailures: 0
      |   pollPaused: false
      |
      +-- setState CALLBACK (r002)           <- widget.tsx
      |   Runs after state is committed:
      |   +-- syncFeedLayer / syncFeedLayerWithProcessedItems
      |   |   (ensures layer sync uses committed state, fixing race condition)
      |   +-- (see FS-FLOW-07 for layer sync details)
      |
      +-- Restore normal polling?            <- widget.tsx:443-446
      |   if (wasBackedOff) → startPolling()
      |
      +-- Map integration query              <- widget.tsx:449-453
          if (isMapIntegrationConfigured())
          → runQueryGeometries(items)
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

## Sorting Strategy (r002 -- moved to pipeline)

Sorting was removed from `loadFeed()` in r002. Items are now stored in their
original feed order. Sorting happens at render time inside `runPipeline()`
(`feed-pipeline.ts`), which applies the full processing pipeline:

```
 runPipeline(items, config, state)           <- feed-pipeline.ts
      |
      +-- [1] Filter by status               (if statusField + filterByStatus configured)
      +-- [2] Search filter                  (if state.searchQuery is non-empty)
      +-- [3] Sort                           (config sortField or state.runtimeSortField)
      |       Smart type detection: date → numeric → string
      |       Direction from config or state.runtimeSortDirection
      |       reverseFeedOrder applied when no sort field
      +-- [4] Limit                          (if maxItems > 0 → slice)
      |
      +-- Return { allProcessed, displayed, totalBeforeLimit }
```

The widget calls `getProcessedItems()` which invokes the pipeline with
current state and config, returning the processed results for rendering
and for map layer sync.

---

## Item Identification

The `getItemId()` method (widget.tsx:227-234) generates stable IDs for change detection:

| Config State | ID Strategy |
|-------------|-------------|
| `joinFieldFeed` configured + item has value | `item[joinFieldFeed]` |
| No join field | Hash of all field values: `Object.values(item).join('\|')` |

---

## Display Filtering (r002 -- moved to pipeline)

Display filtering was previously handled by `getDisplayItems()`. In r002, filtering
is now part of the `runPipeline()` processing pipeline in `feed-pipeline.ts`.
The pipeline applies status filtering, text search, sorting, and maxItems limiting
in a single pass. See the Sorting Strategy section above for the pipeline flow.

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

*Last updated: r002.022 (2026-03-14)*
