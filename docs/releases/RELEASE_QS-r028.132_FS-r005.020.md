# Release QS-r028.132 + FS-r005.020

**Release Date:** 2026-06-09
**Experience Builder Version:** 1.20.0+
**Previous Release:** QS-r028.127 + FS-r005.020 (June 4, 2026)

A QuerySimple-focused release: a new settings tool to copy a query between widgets, a smarter
default for newly added widgets, and a set of end-user reference docs that now ship with the
distribution. Same Experience Builder 1.20 / JSAPI 5.0.4 stack as the previous release.
FeedSimple is unchanged and carried forward.

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r028.132 | Feature + docs |
| **FeedSimple** | 1.20.0-r005.020 | Unchanged (carried forward) |
| **shared-code** | Required by both | Unchanged |

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`. You
> must copy both `feed-simple/` and `shared-code/` into your widgets folder.

---

## What's New

### Copy a query to another widget

QuerySimple settings now include a **Copy to widget** action on each query. Pick another
QuerySimple widget on the page and the query is copied into it, with a fresh internal ID and the
output data source and source layer wired up automatically, inserted at the same position it held
in the source. Previously, moving a configured query between widgets meant hand-editing the app
config and untangling colliding IDs. Now it is one action in the settings panel.

### New widgets default to results in the LayerList

A freshly added QuerySimple widget now defaults to showing its results as a real map layer in the
LayerList, with native popups and a toggleable layer that persists when the widget closes. The
previous default placed results as non-interactive highlight graphics. This affects **newly added
widgets only**: every existing widget keeps whatever it was set to, so saved apps are untouched.

### New end-user documentation

Three references now ship with the distribution:

- **Settings at a Glance** (`docs/user-guide/SETTINGS_AT_A_GLANCE.md`): every QuerySimple and
  HelperSimple setting in one scannable table, with its panel label, default, and where to find it.
- **DebugLogger guide** (`docs/user-guide/DEBUG_LOGGER_GUIDE.md`): how to use the `?debug=` URL
  flags, plus a portable drop-in logger you can copy into any custom widget.
- **Spatial Relationships reference** (`docs/user-guide/SPATIAL_RELATIONSHIPS_REFERENCE.md`): what
  each spatial relationship does and how geometry types and buffer distances interact.

---

## FeedSimple

No changes. FeedSimple is carried forward at r005.020, identical to the previous release.
shared-code is also unchanged this release.

---

## Known Bugs

| Bug ID | Severity | Description |
|--------|----------|-------------|
| (none open) | n/a | No open blocking issues for this release. |

---

## Installation

### QuerySimple + HelperSimple

```bash
cp -r query-simple helper-simple shared-code /path/to/ExB-1.20/client/your-extensions/widgets/
```

### FeedSimple

```bash
# shared-code is required (since r004)
cp -r feed-simple shared-code /path/to/ExB-1.20/client/your-extensions/widgets/
```

> **Note:** If you are installing both QS and FS, you only need one copy of `shared-code/`.

## Compatibility

- **ArcGIS Experience Builder 1.20.0** or later
- **ArcGIS Maps SDK for JavaScript 5.0.4** (Calcite 5.0)
- Tested with ArcGIS Online and ArcGIS Enterprise
- **Not compatible with ExB 1.19** (use the previous 1.19 release)

## Test Results

- **Unit tests:** 762/762 passing (Jest)
- **TypeScript errors:** 0 (`tsc --noEmit` clean across query-simple, helper-simple, feed-simple, shared-code)

## Documentation

- `docs/user-guide/` — End-user guides: Settings at a Glance, QuerySimple Configuration Guide, DebugLogger guide, Spatial Relationships reference
- `docs/query-simple/` — Architecture, changelog, settings reference, and process-flow documents
- `docs/feed-simple/` — Architecture, changelog, and configuration guide
- `docs/releases/` — All release notes
