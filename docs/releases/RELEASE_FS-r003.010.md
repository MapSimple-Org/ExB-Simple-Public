# Release FS-r003.010

**Release Date:** 2026-03-16
**Experience Builder Version:** 1.19.0+
**Previous Release:** [QS-r025.072 + FS-r002.047](RELEASE_QS-r025.072_FS-r002.047.md)

## What's Included

This is a **FeedSimple-only release** focused on code quality remediation from a comprehensive 4-agent code review.

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.19.0-r025.072 | Unchanged |
| **FeedSimple** | 1.19.0-r003.010 | Updated |

---

## FeedSimple Highlights (r002.047 → r003.010)

### Major Version Bump (r002 → r003)

FeedSimple moved to release 003 reflecting a comprehensive code quality remediation pass. No new user-facing features — this release is entirely focused on internal code quality, performance, and maintainability.

### Code Review Remediation (r003.001–006)

A 4-agent code review (Code Reuse, Code Quality, Efficiency, Documentation) identified 8 HIGH, 13 MEDIUM, and 15 LOW findings. All were resolved across 5 batches:

- **Type safety**: Removed `(config as any)` casts, extracted `MOBILE_BREAKPOINT_PX` constant, singleton debug logger, `immutable-helpers.ts` convenience wrappers
- **Utility deduplication**: Consolidated 5 duplicated utility functions across files
- **Widget method dedup**: Merged zoom/pan methods, extracted shared helpers, replaced named setting handlers with generic `setConfigValue`
- **Performance**: Pipeline memoization, diff-based feed layer sync, sort column type pre-detection, field mapping caching, reference equality checks
- **Polish**: CSS hoisting to module scope, dead code cleanup, type narrowing, regex pre-compilation

### Post-Review Sweep (r003.007–010)

A second code review pass after the initial remediation identified additional items:

- **Dead code removal** (r003.007): Removed deprecated function shims and unused CSS variables
- **Render-path optimization** (r003.008): Pre-computed array conversions outside per-card loops, hoisted CSS constants
- **Type safety** (r003.009): Replaced hardcoded breakpoint values with constants in CSS, widened event handler signatures
- **Setting dedup** (r003.010): Type-safe generic config setter, shared checkbox list renderer, fixed React state mutation, fixed pipeline cache key for ImmutableObject arrays

### Remaining Deferred Items

7 LOW/MEDIUM items tracked in TODO.md for future improvement (JSAPI type stubs, AbortController, render method extraction). None are blockers.

---

## Installation

### FeedSimple (standalone)

```bash
cp -r feed-simple /path/to/ExB/client/your-extensions/widgets/
```

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Backward Compatibility

- FeedSimple: All existing configurations work unchanged. No migration required. This release contains only internal code improvements — no config schema changes, no new settings, no behavior changes.

## Documentation

- `docs/feed-simple/` — Architecture, changelog, and process flow documents
- `docs/releases/` — All release notes
