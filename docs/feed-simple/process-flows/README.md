# FeedSimple Process Flow Documentation

End-to-end reference for the 7 major functions of the FeedSimple widget. Each
document includes ASCII flow diagrams, file:line references, decision points,
and configuration options.

## Flow Index

| Flow | Document | Summary |
|------|----------|---------|
| 01 | [FS-FLOW-01-INITIALIZATION](FS-FLOW-01-INITIALIZATION.md) | Widget mount, state initialization, config change handling, cleanup |
| 02 | [FS-FLOW-02-FETCH-PARSE](FS-FLOW-02-FETCH-PARSE.md) | HTTP fetch, XML sanitization, DOMParser extraction, sorting, error handling |
| 03 | [FS-FLOW-03-TOKEN-FILTERS](FS-FLOW-03-TOKEN-FILTERS.md) | Template token substitution, filter chain (date, autolink, externalLink), Markdown-to-HTML |
| 04 | [FS-FLOW-04-POLLING-LIFECYCLE](FS-FLOW-04-POLLING-LIFECYCLE.md) | Timer management, Page Visibility API, change detection, exponential backoff |
| 05 | [FS-FLOW-05-MAP-INTEGRATION](FS-FLOW-05-MAP-INTEGRATION.md) | Spatial join via JSAPI layer (respects definitionExpression), zoom/popup, no-geometry feedback |
| 06 | [FS-FLOW-06-SETTINGS](FS-FLOW-06-SETTINGS.md) | Settings panel sections, Discover Fields, Map Integration config, output DS |
| 07 | [FS-FLOW-07-FEED-MAP-LAYER](FS-FLOW-07-FEED-MAP-LAYER.md) | Client-side FeatureLayer from feed coordinates, sync, bidirectional click, popups |

## Key Architectural Patterns

- **Class Component**: Widget extends `React.PureComponent` (not hooks) for ExB compatibility
- **Pluggable Parser**: `IFeedParser` interface with `CustomXmlParser` v1 implementation
- **Non-Blocking Errors**: Failed refreshes preserve last good data with a warning banner
- **Exponential Backoff**: 3 failures double the interval; 6 failures pause polling entirely
- **ID-Based Skip**: Geometry queries are skipped when feed join IDs are unchanged
- **Extracted Utilities**: Pure functions in `map-interaction.ts` and `feed-layer-manager.ts` keep widget.tsx focused on state
- **Zoom/Identify Separation**: `enableZoomOnClick` controls zoom only — popups always open

## Three Operating Modes

| Mode | Description | Requirements |
|------|-------------|--------------|
| **A -- Visual Display** | Fetch, parse, render feed items as Markdown-templated cards | Feed URL only |
| **B -- Spatial Join** | Runtime join between feed items and feature service | Feed URL + feature service + join fields |
| **C -- Feed Map Layer** | Client-side FeatureLayer from feed coordinates | Feed URL + lat/lon fields in feed data |

Modes can be enabled independently or in combination. B and C both add map
interaction on top of A.

## File Structure

```
feed-simple/src/
  config.ts                     Config interface (FeedSimpleConfig, 33 fields)
  version.ts                    Version constants
  version-manager.ts            Config migration
  runtime/
    widget.tsx                  Main widget (1217 lines)
    feed-card.tsx               FeedCard component + card toolbar (330 lines)
    translations/default.ts     i18n strings
  setting/
    setting.tsx                 Builder settings panel (1187 lines)
    translations/default.ts     Settings i18n strings
  utils/
    debug-logger.ts             Debug logging (?debug=FETCH,POLL,JOIN,FEED-LAYER,...)
    feed-fetcher.ts             HTTP fetch wrapper (32 lines)
    token-renderer.ts           Token substitution + filter pipeline (165 lines)
    markdown-template-utils.ts  Markdown-to-HTML converter (200 lines)
    map-interaction.ts          Spatial join + pan utilities (253 lines)
    feed-layer-manager.ts       Feed Map Layer — FeatureLayer, sync, popups, zoom, pan (482 lines)
    feature-join.ts             JSAPI FeatureLayer queries (145 lines)
    data-source-builder.ts      Output DS JSON generation (54 lines)
    parsers/
      interface.ts              IFeedParser contract, FeedItem type
      custom-xml.ts             Recursive XML parser + GeoRSS point split (168 lines)
```

## Maintenance Rules

These flow documents are **living documentation**. They MUST be kept in sync with the code.

### When to Update Existing Flows

- **Code changes**: If a change affects any documented flow, update the corresponding
  FS-FLOW-XX document. This includes new logic, removed logic, renamed functions, or
  changed file locations.
- **Line number shifts**: After refactors that move code, update file:line references
  in the affected flow doc so they stay accurate.

### When to Create New Flows

If a new feature introduces a distinct end-to-end flow that doesn't fit into an
existing document, create a new FS-FLOW-XX document following this format:

1. **Overview** with key files list
2. **Flow diagram** using ASCII art with file:line references
3. **Decision points** and configuration options
4. **Last updated** footer with version and date

Add the new flow to the Flow Index table above.

### Document Format Convention

- Use `file.ts:LINE` format for line references (e.g., `widget.tsx:384`)
- Use ASCII flow diagrams with `|`, `+--`, `v`, and `-->` connectors
- Keep diagrams readable at 80 columns
- Include the version tag (`rXXX.YYY`) when referencing when behavior was introduced

---

*Last updated: r001.039 (2026-03-13)*
