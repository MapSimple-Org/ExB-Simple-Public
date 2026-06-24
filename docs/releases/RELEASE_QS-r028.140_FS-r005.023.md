# Release QS-r028.140 + FS-r005.023

**Release Date:** 2026-06-24
**Experience Builder Version:** 1.20.0+
**Previous Release:** QS-r028.139 + FS-r005.023 (June 15, 2026)

A HelperSimple fix: deep links now open QuerySimple in **Section / Sidebar** layouts, not just
when it sits inside a Controller. Same Experience Builder 1.20 / JSAPI 5.0.4 stack as the previous
release. FeedSimple is unchanged and carried forward; shared-code is unchanged this release.

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r028.140 | HelperSimple deep-link fix |
| **FeedSimple** | 1.20.0-r005.023 | No functional change (carried forward) |
| **shared-code** | Required by both | Unchanged |

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`. You
> must copy both `feed-simple/` and `shared-code/` into your widgets folder.

---

## What's New

### Deep links now open QuerySimple in Section / Sidebar layouts

HelperSimple opens the QuerySimple widget when a URL parameter matches a configured Short ID (for
example a `#pin=2223059013` deep link). Until now that only worked when QuerySimple was placed
inside a **Controller** widget. In layouts where QuerySimple lives directly in a **Section view** -
for instance a toolbox sidebar that switches between Basemap, Layers, Search, and so on - the deep
link was detected and the search ran, but the search panel never came forward, so it looked like
nothing happened.

HelperSimple now works out where the widget actually lives and reveals it the right way for that
layout:

- **In a Section or Sidebar:** it activates the view that holds the widget by triggering the same
  control a user would click, so the panel (and any wrapping sidebar) opens just as expected.
- **In a Controller:** unchanged - the original open behavior still applies.

So if you deep-link into a QuerySimple that sits in a section-based layout (the common pattern in
large toolbox-style apps), the search panel now opens and runs the query end to end. There is
nothing to configure; HelperSimple picks the right behavior automatically based on your layout.

If you ever need to diagnose an open, HelperSimple logs which path it took under the existing
`?debug=HASH,HASH-EXEC` parameter (`helpersimple-reveal-strategy`).

---

## FeedSimple

No functional changes this release. FeedSimple remains at r005.023; this QuerySimple/HelperSimple
release does not touch shared-code, so there is no new FeedSimple version. Continue to update
`shared-code/` together with the widgets as usual.
