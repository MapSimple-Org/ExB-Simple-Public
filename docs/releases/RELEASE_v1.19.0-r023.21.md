# Release Notes: v1.19.0-r023.21

**Release Date**: February 12, 2026  
**Type**: Memory Leak Fix + New Feature + Bug Fixes

---

## Overview

This release fixes a significant memory leak in the FeatureInfo component, adds a new Custom Template result display mode, and resolves two bugs related to record management and popup template rendering in accumulation mode.

---

## Changes

### FeatureInfo Detached DOM Leak Fix (r023.19-21)

**Fixed a memory leak that orphaned Esri Feature widget DOM nodes on every result clear, query switch, or record removal.**

The `FeatureInfo` component (originally from Esri's stock query widget) was missing two cleanup paths:

1. **Leak Path A (unmount):** No `componentWillUnmount` lifecycle method. The Esri Feature widget and its container div were never destroyed when React unmounted the component.
2. **Leak Path B (prop updates):** Incomplete `destroyFeature()` only called `this.feature.destroy()` without removing the container div or nulling the reference. Each prop update appended a new container while the old one was orphaned.

**Fix progression:**
- r023.19: Upgraded `destroyFeature()` to null the feature ref and clear all child DOM from container
- r023.20: Fixed call order in `createFeature()` (destroy before appending new container, not after)
- r023.21: Added `componentWillUnmount` lifecycle method that calls `destroyFeature()`

**Heap snapshot results:**

| Metric | Before | After | Reduction |
|---|---|---|---|
| Detached `<div>` per cycle | 6,641 | 1,183 | 82% |
| Detached `<button>` per cycle | 1,142 | Eliminated | 100% |

Remaining detached DOM (calcite-loader, ShadowRoot, SVG elements) is internal to the Esri SDK and not addressable from application code.

**Note:** Esri's stock `dist/widgets/arcgis/query/` feature-info.tsx has the same bug. This fix is our improvement on top of their code.

---

### Custom Template Mode (r023.18)

**New "Custom Template" result display option** alongside "Popup setting" and "Select attributes" in the Results configuration. Authors write a Markdown template with `{fieldName}` tokens that gets converted to styled HTML at runtime via Esri PopupTemplate text content.

**Settings UI:**
- "Custom template" option in the result fields dropdown
- Monospace content editor with field picker button (same ExpressionBuilder pattern as title)
- `(?)` InfoOutlined hover tooltip with full syntax cheat sheet
- Live preview panel with badge-styled field tokens

**Supported Markdown syntax:**
- `**bold**` / `__bold__` and `*italic*` / `_italic_`
- `#` Heading (h3), `##` Subheading (h4), `###` Small heading (h5)
- `- item` unordered list items
- `---` horizontal rule
- `[text](url)` clickable links (opens in new tab)
- Leading spaces for visual indentation (2 spaces = 1em)
- Single Enter = line break, blank line = paragraph break

**Architecture:**
- Zero-dependency lightweight Markdown parser (`markdown-template-utils.ts`)
- Runs through the existing PopupTemplate pipeline (text content type)
- `extractFieldTokens()` ensures query fetches all referenced fields
- `combineFields()` extended to parse `resultContentExpression`

---

### Bug Fix: Zombie Records (r023.14-16)

**Records removed via the X-button would reappear when switching from Add mode to New mode.**

**Root cause:** `recordsRef.current` in `query-task.tsx` was set from `accumulatedRecords` during query switches but was never updated when individual records were removed via the X-button. The `effectiveRecords` fallback read stale data from `recordsRef.current`.

**Fix progression:**
- r023.14: Improved `outputDS` selection filtering in `removeRecord` callback
- r023.15: Attempted `effectiveRecords` change (overcorrection, caused regression)
- r023.16: Reverted r023.15. Added `useEffect` that syncs `recordsRef.current` with `accumulatedRecords` when removals are detected (length decreases)

---

### Bug Fix: Cross-Query Popup Template (r023.17)

**Parcel records lost their formatting when accumulated with park records in Add mode.**

**Root cause:** The `__queryConfigId` stamping logic was blindly applying the current query's `configId` to all "added" records, even if they already had a `__queryConfigId` from a prior query. This caused `getPopupTemplate` to resolve the wrong origin data source.

**Fix (3 files):**
- `QueryTabContent.tsx`: Conditional stamping, only if `__queryConfigId` not already set
- `query-utils.ts`: `getPopupTemplate` accepts optional `originDSOverride` parameter
- `simple-list.tsx`: Resolves correct `originDSForConfig` per record via `DataSourceManager`

---

## Files Modified

### New Files
- `query-simple/src/runtime/markdown-template-utils.ts`

### Modified Files
- `query-simple/src/config.ts`
- `query-simple/src/default-query-item.ts`
- `query-simple/src/runtime/components/feature-info.tsx`
- `query-simple/src/runtime/query-result.tsx`
- `query-simple/src/runtime/query-task.tsx`
- `query-simple/src/runtime/query-utils.ts`
- `query-simple/src/runtime/simple-list.tsx`
- `query-simple/src/runtime/tabs/QueryTabContent.tsx`
- `query-simple/src/setting/results.tsx`
- `query-simple/src/setting/translations/default.ts`
- `query-simple/src/version.ts`

---

## Upgrade Notes

- No configuration changes required. Existing widget configurations will work without modification.
- The new "Custom template" option appears automatically in the Results configuration dropdown. Existing queries set to "Popup setting" or "Select attributes" are unaffected.
- The FeatureInfo memory leak fix is automatic. No user action needed.
- If you have custom code referencing `FieldsType` enum values, note the addition of `CustomTemplate`.
