# FeedSimple Process Flow Documentation

End-to-end reference for the 9 major functions of the FeedSimple widget. Each
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
| 08 | [FS-FLOW-08-COLOR-RESOLUTION](FS-FLOW-08-COLOR-RESOLUTION.md) | Exact/range card color coding, range label enrichment, search/sort by range labels |
| 09 | [FS-FLOW-09-RESPONSIVE-RENDERING](FS-FLOW-09-RESPONSIVE-RENDERING.md) | Mobile card template, mobile toolbar position, mobile popup template, CSS media query pattern |

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
  config.ts                     Config interface (FeedSimpleConfig, 67 fields)
  constants.ts                  Shared constants (magic strings, thresholds)
  version.ts                    Version constants
  version-manager.ts            Config migration
  runtime/
    widget.tsx                  Main widget (~1623 lines)
    feed-card.tsx               FeedCard component + responsive toolbar (~550 lines)
    feed-controls.tsx           Search bar, sort controls, range label sort option (~224 lines)
    feed-legend.tsx             Collapsible color legend bar (~185 lines)
    translations/default.ts     i18n strings
  setting/
    setting.tsx                 Builder settings panel (~2115 lines)
    translations/default.ts     Settings i18n strings
  utils/
    debug-logger.ts             Debug logging (?debug=FETCH,POLL,JOIN,FEED-LAYER,...)
    feed-fetcher.ts             HTTP fetch wrapper — esriRequest + native fallback (~115 lines)
    token-renderer.ts           Thin wrapper — re-exports substituteTokens from shared-code
    markdown-template-utils.ts  Thin wrapper — re-exports convertTemplateToHtml from shared-code
    color-resolver.ts           Exact/range card color resolution + range label enrichment (~133 lines)
    map-interaction.ts          Spatial join + pan + FeatureEffect utilities (~347 lines)
    feed-pipeline.ts            Processing pipeline: filter, search, sort, limit (~249 lines)
    feed-csv-export.ts          CSV export utility (~151 lines)
    feed-layer-manager.ts       Feed Map Layer — FeatureLayer, sync, popups, zoom, pan (~817 lines)
    feature-join.ts             JSAPI FeatureLayer queries (~142 lines)
    data-source-builder.ts      Output DS JSON generation (~66 lines)
    immutable-helpers.ts        Immutable.js convenience wrappers (~49 lines)
    parsers/
      interface.ts              IFeedParser contract, FeedItem type
      custom-xml.ts             Recursive XML parser + GeoRSS point split (~176 lines)

shared-code/mapsimple-common/        (required dependency — copy alongside feed-simple/)
  markdown-template-utils.ts         Shared Markdown-to-HTML converter
  token-renderer.ts                  Shared {{field | filter}} token engine + 16 pipe filters
  template-preview-utils.ts          renderPreview() and extractFieldTokens() with parameterized regex
  debug-logger.ts                    Tagged debug logger factory
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

*Last updated: r003.010 (2026-03-16)*
