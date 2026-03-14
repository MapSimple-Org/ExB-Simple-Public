# FeedSimple Status

**Version:** 1.19.0-r001.039
**Date:** 2026-03-13
**Branch:** `feature/feed-simple` (off `develop`)

---

## Current State

| Area | Status |
|------|--------|
| Build | Compiles, functional |
| Phase 1 (Fetch/Parse/Render) | Complete — XML fetch, parse, card rendering, status colors, hover tooltips |
| Phase 2 (Token System) | Complete — `{{token}}` substitution + filter pipeline (date, autolink, externalLink) |
| Phase 3 (Polling) | Complete — interval polling, Page Visibility API, non-blocking errors, exponential backoff, change detection with highlight animation |
| Phase 4 (Full Settings) | Complete — feed source, card template with preview, status colors, hover text, polling, sorting, display limits (maxItems, filterByStatus), external link template |
| Phase 5 (Map Integration) | Complete — DataSourceSelector, join field config, MapWidgetSelector, zoom/buffer settings, runtime geometry query, card click → zoom + popup |
| Phase 6 (Universal XML) | Complete — recursive flattener handles all XML formats: flat XML, nested (QuakeML), RSS 2.0, ATOM, GeoRSS. Dot-path keys, @attributes, bracket arrays, namespace stripping, GeoRSS point splitting. |
| Phase 7 (Feed Map Layer) | Complete — client-side FeatureLayer from feed coordinates, LayerList integration, bidirectional card-map sync, CustomContent popups |
| Phase 8 (Zoom & Click) | Complete — zoom on click toggle, shared zoom settings section, identify-without-zoom support |
| Code Structure | Refactored — FeedCard component + map interaction + feed layer manager extracted from widget.tsx |
| Unit Tests | 100 tests across 3 files — token renderer, XML parser, markdown utils |

**Latest work (r001.036–039):**
- **Card action toolbar** (r001.036): Per-card toolbar with Zoom, Pan, and Expand buttons — visibility driven by config (zoom shown when `enableZoomOnClick` is off, pan always shown when map configured, expand opt-in via `enableCardExpand`). Disabled state + tooltip on cards without geometry.
- **Pan icon updated** (r001.037): Replaced generic arrow icon with Esri hand icon (matches QuerySimple)
- **GeoRSS `<georss:point>` support** (r001.037): Parser splits `"lat lon"` values into synthetic `point_lat` / `point_lon` fields at parse time — enables Feed Map Layer for ATOM/GeoRSS feeds (e.g., USGS earthquake ATOM)
- **Scroll-to-top button** (r001.037): Theme-aware FAB appears after scrolling 200px in the card list. Uses `--sys-color-primary-main` for background. Smooth-scroll back to top on click.
- **Scroll-to-top chevron** (r001.038): Replaced arrow-with-bar icon with clean chevron
- **`enableCardExpand` config** (r001.036): New boolean config field for opt-in expand/collapse of raw fields on cards
- **Auto-restore layer visibility** (r001.039): Feed layer automatically made visible when user clicks a card, toolbar zoom, or toolbar pan — ensures the layer shows in the LayerList when the user wants to see something on the map

---

## Key Files

| File | Purpose |
|------|---------|
| `src/config.ts` | Config interface (FeedSimpleConfig) — 31 fields across 7 groups |
| `src/runtime/widget.tsx` | Main widget — lifecycle, polling, fetch orchestration, card click routing, feed layer management |
| `src/runtime/feed-card.tsx` | FeedCard presentational component — token substitution, markdown rendering, status colors, highlight animation |
| `src/setting/setting.tsx` | Builder settings — discover fields, template editor, map integration, feed map layer, zoom behavior config |
| `src/utils/feed-layer-manager.ts` | Feed Map Layer — FeatureLayer creation, sync via applyEdits, CustomContent popups, field sanitization, zoom/identify |
| `src/utils/map-interaction.ts` | Map integration utilities — config check, geometry type inference, zoom target, popup identify, geometry query |
| `src/utils/debug-logger.ts` | Debug logging utility (`?debug=JOIN,FETCH,POLL,FEED-LAYER,...`) |
| `src/utils/feed-fetcher.ts` | Async feed fetcher |
| `src/utils/feature-join.ts` | JSAPI FeatureLayer query utility — batched WHERE IN via queryFeatures (respects definitionExpression) |
| `src/utils/data-source-builder.ts` | Output DS JSON generation for settings registration |
| `src/utils/parsers/interface.ts` | IFeedParser contract, FeedItem type |
| `src/utils/parsers/custom-xml.ts` | Recursive XML parser — dot-path keys, @attributes, bracket arrays, namespace stripping |
| `src/utils/token-renderer.ts` | Token substitution + filter pipeline (date, autolink, externalLink) |
| `src/utils/markdown-template-utils.ts` | Markdown-to-HTML converter, preview renderer, field extractor |
| `src/version.ts` | Version constants |
| `tests/token-renderer.test.ts` | Token substitution tests (30 tests) — basic, dot-path, array, date/autolink/externalLink filters |
| `tests/custom-xml-parser.test.ts` | XML parser tests (20 tests) — flat, nested, attributes, arrays, entities, CDATA, namespaces |
| `tests/markdown-template-utils.test.ts` | Markdown converter tests (50 tests) — headings, inline, links, images, lists, paragraphs, preview, extract |
| `manifest.json` | Widget manifest — declares `jimu-arcgis` dependency, publishMessages |
| `docs/specs/FEEDSIMPLE_SPEC.md` | Full development specification |

## Key Docs

| Doc | Location |
|-----|----------|
| Design Spec (original) | `~/Dropbox/MapSimple/feedsimple-spec.docx` |
| Dev Spec (condensed) | `docs/specs/FEEDSIMPLE_SPEC.md` |
| TODO | `feed-simple/TODO.md` |
| Changelog | `docs/feed-simple/CHANGELOG.md` |
| Architecture | `docs/feed-simple/ARCHITECTURE.md` |
| Process Flows | `docs/feed-simple/process-flows/README.md` |
