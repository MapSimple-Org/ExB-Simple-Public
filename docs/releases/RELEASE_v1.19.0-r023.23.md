# Release Notes: v1.19.0-r023.23

**Release Date**: February 12, 2026  
**Type**: UX Overhaul + Memory Leak Fix + New Feature + Bug Fixes

---

## Overview

This release redesigns the Results Mode selector so users understand it controls a mode rather than triggering an action. It also fixes a significant memory leak in the FeatureInfo component, adds a Custom Template result display mode, and resolves bugs in record management and popup template rendering.

---

## Changes

### Results Mode UX Overhaul (r023.22-23)

**The New/Add/Remove mode selector has been completely restyled.** Users were confusing "Remove" for an action button rather than a mode selector.

**Visual changes:**
- **Segmented control**: Buttons sit inside a unified tray with a subtle background, replacing three separate floating buttons
- **Per-mode color identity**: New (blue #3b82f6), Add (green #059669), Remove (muted red #be123c)
- **Per-mode icons**: Star (★), plus (+), and minus (−) for visual differentiation
- **Logic summary bar**: A colored banner below the buttons with a left-border accent confirms the active mode in plain language
- **"Results Mode" label**: Replaces the ambiguous "Results:" label
- **Theme-proof colors**: All mode colors are hardcoded so they maintain semantic meaning regardless of ExB theme configuration. The color identity IS the feature.

**Logic summary bar messages:**

| Mode | Color | Message |
|---|---|---|
| New | Blue | Each query replaces previous results. |
| Add | Green | New results are added to existing results. |
| Remove | Red | Matching results are removed from existing results. |

**r023.23 polish:**
- Hardcoded all colors to prevent ExB theme overrides
- Removed "LOGIC:" prefix label to prevent line wrapping
- Font size tuned to 0.8rem for readability
- Muted red default (#be123c) with deeper hover (#9f1239)

---

### FeatureInfo Detached DOM Leak Fix (r023.19-21)

**Fixed a memory leak that orphaned Esri Feature widget DOM nodes on every result clear, query switch, or record removal.**

**Root cause:** The `FeatureInfo` component (originally from Esri's stock query widget) was missing two cleanup paths:
1. No `componentWillUnmount` lifecycle method
2. Incomplete `destroyFeature()` that left orphaned container elements

**Heap snapshot results:**

| Metric | Before | After | Reduction |
|---|---|---|---|
| Detached `<div>` per cycle | 6,641 | 1,183 | 82% |
| Detached `<button>` per cycle | 1,142 | Eliminated | 100% |

---

### Custom Template Mode (r023.18)

**New "Custom Template" result display option** alongside "Popup setting" and "Select attributes." Authors write a Markdown template with `{fieldName}` tokens that gets converted to styled HTML at runtime.

**Supported syntax:** Bold, italic, headings, lists, horizontal rules, links, indentation, line breaks, and paragraph spacing.

**Settings UI:** Monospace editor with field picker, hover tooltip cheat sheet, and live preview panel.

---

### Bug Fix: Zombie Records (r023.14-16)

Records removed via the X-button would reappear when switching from Add mode to New mode. Fixed by syncing `recordsRef` with `accumulatedRecords` when removals are detected.

---

### Bug Fix: Cross-Query Popup Template (r023.17)

Parcel records lost their formatting when accumulated with park records in Add mode. Fixed by adding conditional `__queryConfigId` stamping and per-record origin data source resolution.

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
- `query-simple/src/runtime/translations/default.ts`
- `query-simple/src/version.ts`

---

## Upgrade Notes

- No configuration changes required. Existing widget configurations will work without modification.
- The Results Mode buttons now have fixed colors that do not follow the ExB theme. This is intentional to preserve the semantic meaning of each mode.
- The new "Custom template" option appears automatically in the Results configuration dropdown. Existing queries are unaffected.
- The FeatureInfo memory leak fix is automatic. No user action needed.
