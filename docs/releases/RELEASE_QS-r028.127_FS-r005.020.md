# Release QS-r028.127 + FS-r005.020

**Release Date:** 2026-06-04
**Experience Builder Version:** 1.20.0+
**Previous Release:** QS-r028.122 + FS-r005.018 (June 2, 2026)

A focused follow-up to r028.122: one new feature (hover feature highlight), a small label
rename, and an honest fix for a regression we introduced ourselves. Same Experience Builder
1.20 / JSAPI 5.0.4 stack as the previous release.

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r028.127 | Feature + fix |
| **FeedSimple** | 1.20.0-r005.020 | Maintenance (shared-code alignment) |
| **shared-code** | Required by both | Updated |

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`. You
> must copy both `feed-simple/` and `shared-code/` into your widgets folder.

---

## What's New

### Hover Feature Highlight

QuerySimple already drops a preview pin when you hover a result. Now it can also highlight the
feature's geometry on the map, so the hovered feature stands out from its neighbors. This is the
ArcIMS query-tool behavior some of you have asked for, and it is especially useful for lines and
polygons where a pin alone does not tell you which feature you are on.

- **Pin and highlight, side by side.** Both run on hover. Each has its own on/off toggle, so you
  can use the pin only, the highlight only, or both.
- **Configurable highlight color** (defaults to the same red as the pin).
- **Defaults to on**, so existing apps get the highlight with no config change.

Thanks to **James Kellough** in the Esri Community for the request and the use case that shaped it.

### "Search alias" renamed to "Search by"

On grouped queries, the label that read "Search alias" (both in the runtime dropdown and in
settings) now reads "Search by". Cosmetic, no behavior change.

---

## Fixes

### Results layer was removable from the map's LayerList

We want to be upfront about this one: **we introduced the regression ourselves.** When we
refactored result rendering (the Path 2 to Path 3 change in the r028 line), the flag that hides
the LayerList "Remove" button on our results layer started being set one step too early, before
the layer was added to the map. Experience Builder re-stamps that flag during the add, so our
value was overwritten and the Remove button reappeared, letting a user delete the results layer.

The fix sets the flag immediately after the layer is added, which is where it was originally and
where Experience Builder leaves it alone. The results layer is no longer user-removable.

---

## FeedSimple Changes (r005.018 to r005.020)

No user-facing changes. FeedSimple moves with the suite for shared-code alignment: the
hover-highlight feature added new getters to `shared-code/`, which bumps FeedSimple as a consumer
(r005.019 and r005.020). FeedSimple behavior is unchanged.

---

## Known Bugs

| Bug ID | Severity | Description |
|--------|----------|-------------|
| (none open) | — | The LayerList removable-results regression above is resolved in this release. |

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

- **Unit tests:** 751/751 passing (Jest)
- **TypeScript errors:** 0 (`tsc --noEmit` clean across query-simple, helper-simple, feed-simple, shared-code)

## Documentation

- `docs/query-simple/` — Architecture, changelog, and process-flow documents (now includes FLOW-15, Hover Preview)
- `docs/feed-simple/` — Architecture, changelog, and configuration guide
- `docs/releases/` — All release notes
