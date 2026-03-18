# Release QS-r025.073 + FS-r003.010

**Release Date:** 2026-03-17
**Experience Builder Version:** 1.19.0+
**Previous Release:** [FS-r003.010](RELEASE_FS-r003.010.md)

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.19.0-r025.073 | Updated |
| **FeedSimple** | 1.19.0-r003.010 | Unchanged |

---

## QuerySimple Highlights (r025.072 → r025.073)

### Bug Fix: Stray Text on Spatial Tab

An unclosed `<div>` in the Spatial tab's combobox + info icon flex container caused `) }` to render as visible text at the bottom of the tab. The issue appeared immediately on tab load, regardless of user interaction.

**Root Cause:** Missing `</div>` closing tag for the flex wrapper around the spatial relationship combobox and its info icon (line 875 of `SpatialTabContent.tsx`). The JSX conditional closing braces `)}` leaked out of the expression context and rendered as plain text.

**Fix:** Added the missing `</div>` to properly close the flex container before the popover section.

**Files Changed:**
- `query-simple/src/runtime/tabs/SpatialTabContent.tsx` — Added missing `</div>`
- `query-simple/src/version.ts` — Version bump to r025.073

---

## Installation

### QuerySimple + HelperSimple

```bash
cp -r query-simple helper-simple shared-code /path/to/ExB/client/your-extensions/widgets/
```

### FeedSimple (standalone)

```bash
cp -r feed-simple /path/to/ExB/client/your-extensions/widgets/
```

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Backward Compatibility

- QuerySimple: No config changes. Drop-in replacement for r025.072.
- FeedSimple: Unchanged from previous release.

## Documentation

- `docs/query-simple/` — Architecture, changelog, and process flow documents
- `docs/feed-simple/` — Architecture, changelog, and process flow documents
- `docs/releases/` — All release notes
