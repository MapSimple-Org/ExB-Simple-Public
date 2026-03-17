# FeedSimple Code Review — r002 Series

> **Review Date:** 2026-03-16
> **Codebase Version:** 1.19.0-r002.047
> **Reviewers:** 3 automated agents (Code Reuse, Code Quality, Efficiency) + 1 Documentation agent
> **Scope:** All 23 source files in `feed-simple/src/`
> **Purpose:** Pre-public-release quality gate. Findings here define the r003 backlog.

---

## Overview

The codebase is well-structured with good separation of concerns — pipeline, parsers, color resolution, map interaction, and feed layer management are cleanly separated into utility modules. The main issues fall into three categories:

1. **Duplication** — Several significant code blocks are copy-pasted with minor variation (zoom/pan, mobile popup behavior, external link substitution)
2. **Render-path efficiency** — The processing pipeline runs multiple times per render cycle without memoization, and enrichment mutates items in-place during render
3. **Type safety** — Pervasive `as any` casts for config properties that are already defined on the interface

None of these are bugs. The widget works correctly. These are structural improvements for maintainability, performance, and public code quality.

---

## HIGH Priority — Fix in r003

### H-1: Duplicated mobile popup behavior logic

**Files:** `map-interaction.ts` (lines 151-168), `feed-layer-manager.ts` (lines 571-605)

`identifyFeatureOnMap()` manually inlines the same mobile popup dock/collapse/action-bar logic that `applyMobilePopupBehavior()` already encapsulates in `feed-layer-manager.ts`. A behavioral change would need to be made in two places.

**Fix:** Have `map-interaction.ts` import and call `applyMobilePopupBehavior()`.

---

### H-2: zoom/pan functions are ~80% identical

**Files:** `feed-layer-manager.ts` (lines 629-748), `widget.tsx` (lines 1001-1094)

Two pairs of near-duplicate functions:
- `zoomToFeedPoint()` and `panToFeedPoint()` share coordinate parsing, Point construction, popup init, feed layer querying, mobile popup behavior, and popup open. Only the `goTo` call differs.
- `onCardZoom()` and `onCardPan()` in widget.tsx follow the same pattern: check mapView, get itemId, check feed map layer vs spatial join, build graphic, goTo, identify, setState. Only the goTo target differs.

**Fix:** Extract a shared `navigateToFeedPoint(item, mode: 'zoom' | 'pan')` in feed-layer-manager and a shared `handleMapNavigation(item, mode)` in widget.tsx.

---

### H-3: Pervasive `as any` casts for typed config properties

**Files:** `widget.tsx` (30+ locations), `setting.tsx` (throughout)

Properties like `filterNumericMin`, `cardTemplateMobile`, `toolbarPosition`, `mobilePopupCollapsed`, etc. are all defined on `FeedSimpleConfig` but accessed via `(config as any).propertyName`. The `IMConfig` type (ImmutableObject) should already expose these. This suggests properties were added to the interface but usages were never cleaned up from their initial `as any` workaround.

**Fix:** Remove all unnecessary `as any` casts. If `IMConfig` doesn't expose a property, fix the type declaration rather than casting.

---

### H-4: `getProcessedItems()` runs full pipeline every render, multiple times per cycle

**File:** `widget.tsx` (lines 517, 540, 704, 1114)

`render()` calls `getProcessedItems()` which runs filter → search → sort → paginate on every render. Creates new arrays at each step. Additionally called independently by `syncFeedLayerWithProcessedItems`, `syncJoinedLayerFilterEffect`, and `onExportCsv`, re-running the entire pipeline each time.

**Fix:** Memoize the pipeline result keyed on (items, searchQuery, sort, filter state). Compute once per render cycle and pass the result to consumers.

---

### H-5: `enrichItemsWithRangeLabels` mutates items in-place during render

**Files:** `widget.tsx` (line 634), `color-resolver.ts` (lines 100-138)

Called inside `getProcessedItems()` which runs in `render()`. Iterates all items calling `parseFloat()` + `findIndex()` on every item, every render. Mutating state during render is a React anti-pattern. The "for performance" comment is negated by re-running on every render.

**Fix:** Run enrichment once after fetch (in `loadFeed`'s setState callback) or when rangeColorBreaks config changes. Store results on the items rather than recalculating each render.

---

### H-6: `syncFeedItemsToLayer` does full delete-then-add on every poll

**File:** `feed-layer-manager.ts` (lines 277-444)

Every sync cycle: query all features (`where: '1=1'`), delete all, re-add all, then run a verification query. That's 3-4 round-trips to the client-side layer per poll. For 500 items at 30-second polling, thousands of graphics are created and destroyed per minute.

**Fix:** Diff item IDs to determine adds/updates/deletes, then use targeted `applyEdits`. Gate the verification query behind the debug flag.

---

### H-7: External link template substitution implemented 3 times

**Files:** `widget.tsx` (lines 942-944, 990-993), `token-renderer.ts` (line 316)

`onCardClick`, `resolveLinkUrl`, and `applyExternalLinkFilter` all perform the same `template.replace(...)` token substitution with slightly different regexes.

**Fix:** Extract a single `resolveExternalLinkUrl(template, item)` utility and use it in all three locations.

---

### H-8: JSON.stringify comparison in componentDidUpdate hot path

**File:** `widget.tsx` (line 206)

`JSON.stringify(prevProps.config.rangeColorBreaks) !== JSON.stringify(this.props.config.rangeColorBreaks)` runs on every prop change. Since config comes from ImmutableObject, reference equality (`!==`) should suffice — Immutable creates new references only on change.

**Fix:** Replace with `prevProps.config.rangeColorBreaks !== this.props.config.rangeColorBreaks`.

---

## MEDIUM Priority — Fix in r003

### M-1: Magic number `600` for mobile breakpoint

**Files:** `feed-card.tsx`, `feed-controls.tsx`, `feed-layer-manager.ts` (5+ locations)

Hardcoded `600` appears throughout. Should be a named constant `MOBILE_BREAKPOINT_PX`.

---

### M-2: Multiple debugLogger instances

**Files:** 7 files each call `createFeedSimpleDebugLogger()` independently.

Each instance parses URL params and maintains its own `enabledFeatures` Set. Should export a singleton.

---

### M-3: Unregistered debug features

**Files:** `debug-logger.ts`, `widget.tsx`, `map-interaction.ts`, `feed-csv-export.ts`

Features `EXPORT`, `SEARCH`, `SORT`, and `FEATURE-EFFECT` are used but not registered in `createFeedSimpleDebugLogger`. The `?debug=EXPORT` flag won't work.

---

### M-4: FeedCardProps parameter sprawl (24 properties)

**File:** `feed-card.tsx` (lines 10-68)

Multiple optional toolbar-related props could be grouped into a `toolbarConfig` object.

---

### M-5: CSS-in-JS computed inside FeedCard render body

**File:** `feed-card.tsx` (lines 193-213)

`responsiveDesktopCss`, `responsiveMobileCss`, etc. are computed via `css` tagged template inside the function body on every render of every card. These have no dynamic values and should be hoisted to module scope.

---

### M-6: `Date.parse()` called O(2N log N) times during sort

**File:** `feed-pipeline.ts` (lines 101-121)

Sort comparator calls `Date.parse()` twice per comparison. For 500 items, ~9000 calls. Should pre-detect column type and pre-compute parsed values.

---

### M-7: Duplicate range-matching + parseFloat in color-resolver.ts

**File:** `color-resolver.ts` (lines 67-82 and 120-126)

`findMatchingBreak()` and the inline `findIndex` in `enrichItemsWithRangeLabels()` duplicate the same range check. Enrichment should call `findMatchingBreak()`.

---

### M-8: `mobilePopupParams` constructed 3x identically

**File:** `widget.tsx` (lines 890-895, 1031-1035, 1078-1082)

The same object is built in `onCardClick`, `onCardZoom`, and `onCardPan`. Extract to a helper method.

---

### M-9: Setting handlers could use existing `setConfigValue`

**File:** `setting.tsx`

~10 named handler methods wrap the same 3-line `onSettingChange({id, config: config.set(key, value)})` pattern. The existing `setConfigValue` method already does this generically.

---

### M-10: WHERE clause duplication

**Files:** `feature-join.ts` (lines 34-41), `map-interaction.ts` (lines 353-362)

`applyFilterEffect()` builds its own WHERE IN clause instead of importing `buildWhereClause()`.

---

### M-11: `buildFieldMapping()` rebuilds Maps every poll cycle

**File:** `feed-layer-manager.ts` (line 284)

Field names don't change between polls. Cache the mapping and invalidate only when fields change.

---

### M-12: `findJoinedFeatureLayer` exists but underused

**File:** `map-interaction.ts`

The helper was extracted but `identifyFeatureOnMap()` and `queryGeometries()` still inline the same DS URL lookup pattern.

---

### M-13: `getItemId()` hashes all field values via string concat, 3-5N times per cycle

**File:** `widget.tsx` (lines 331-338)

When `joinFieldFeed` is not configured, `Object.values(item).join('|')` runs for every item, multiple times per render cycle. Cache IDs after fetch.

---

## LOW Priority — Polish

| # | Finding | File |
|---|---------|------|
| L-1 | Unused `hooks` import and `getI18nMessage` in feed-legend.tsx | feed-legend.tsx |
| L-2 | Missing i18n key for toolbar "link" label | widget.tsx |
| L-3 | `toolbarLabels?.link` fallback bypasses i18n | feed-card.tsx |
| L-4 | Array index used as React key instead of `getItemId()` | widget.tsx line 1305 |
| L-5 | `feedMapLayerMarkerStyle` typed as `string` instead of union | config.ts line 130 |
| L-6 | `onUpdateRangeBreak` accepts `value: any` | setting.tsx line 276 |
| L-7 | `buildOutputDataSourceJson` returns `any` | data-source-builder.ts line 41 |
| L-8 | Stale JSDoc comments (orphaned blocks) | widget.tsx lines 507-510, 621-624 |
| L-9 | Inconsistent monospace font-family in setting.tsx textareas | setting.tsx |
| L-10 | `sanitizeXml` runs 13 sequential regex replacements | custom-xml.ts lines 21-35 |
| L-11 | `flattenElement` creates intermediate objects instead of accumulator | custom-xml.ts |
| L-12 | `applyDateFilter` compiles 14 regex patterns per token hit | token-renderer.ts |
| L-13 | No AbortController on fetch — stale responses can't be cancelled | feed-fetcher.ts |
| L-14 | FeedCard creates new inline functions on every render | feed-card.tsx |
| L-15 | Hardcoded `800ms` animation duration for map goTo | widget.tsx, feed-layer-manager.ts |

---

## Documentation Findings

These are tracked separately. Key items:

| # | Severity | Finding |
|---|----------|---------|
| D-1 | HIGH | `feedMapLayerPopupTitleMobile` not documented anywhere |
| D-2 | HIGH | FEEDSIMPLE_SPEC.md references non-existent `poller.ts`, missing Mode C |
| D-3 | HIGH | Process flow README: `feed-controls.tsx` in wrong directory, `feed-legend.tsx` missing |
| D-4 | HIGH | FLOW-01 line counts completely outdated |
| D-5 | MEDIUM | ARCHITECTURE claims 63 config fields, actual is 67 |
| D-6 | MEDIUM | CHANGELOG dates: r002.047 shows 03-15, should be 03-16 |
| D-7 | MEDIUM | CONFIGURATION_GUIDE missing `feedMapLayerPopupTitleMobile` and `enableSortControls` |
| D-8 | MEDIUM | CURRENT_STATUS missing `feed-legend.tsx` from key files |
| D-9 | MEDIUM | Process flow README line counts stale for 6 files |

**Recommendation:** Mark FEEDSIMPLE_SPEC.md as a historical design document. It reflects pre-implementation plans and would require a near-complete rewrite to match the current codebase.

---

## r003 Planning

The r003 series should focus on resolving these findings in priority order:

1. **H-1 through H-8** — Structural and performance fixes
2. **M-1 through M-13** — Code hygiene and minor performance
3. **L-1 through L-15** — Polish
4. **D-1 through D-9** — Documentation sync

Estimated scope: H items are ~8 focused tasks. M items are ~13 smaller tasks. Many M and L items can be batched (e.g., "remove all unnecessary `as any` casts" covers H-3 and several L items).
