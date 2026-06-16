# Release QS-r028.139 + FS-r005.023

**Release Date:** 2026-06-15
**Experience Builder Version:** 1.20.0+
**Previous Release:** QS-r028.137 + FS-r005.023 (June 12, 2026)

An accessibility release for QuerySimple: screen-reader users now hear the context changes that
used to happen silently, most importantly when a search returns results. Same Experience Builder
1.20 / JSAPI 5.0.4 stack as the previous release. FeedSimple is unchanged and carried forward;
shared-code is unchanged this release.

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r028.139 | Accessibility release |
| **FeedSimple** | 1.20.0-r005.023 | No functional change (carried forward) |
| **shared-code** | Required by both | Unchanged |

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`. You
> must copy both `feed-simple/` and `shared-code/` into your widgets folder.

---

## What's New

### Screen-reader announcements for context changes

QuerySimple now speaks the context changes that a sighted user sees but a screen-reader user
previously could not. When the widget moves you somewhere without your keyboard focus moving with
it, a screen reader announces it:

- **Results arriving.** Run a search and the widget switches to the Results tab; a screen reader
  now hears, for example, "Results tab, 23 items." Previously this was the most common action in
  the widget and it was completely silent.
- **Returning to the search.** Clear your results and the widget takes you back to the Query or
  Spatial tab; that move is announced.
- **Switching Spatial modes.** Toggling the Spatial tab between Operations and Draw announces the
  new mode and that the on-screen help updated.

This is additive and quiet by design:

- **No change for sighted users.** The announcements live in a visually hidden region; nothing on
  screen changes.
- **No double-speaking.** When *you* click or arrow to a tab yourself, that was already announced
  by the tab's description, so the new announcements deliberately stay silent there.
- **Rapid changes are smoothed** so a screen reader is never spammed or made to lag.

The visual help "?" affordance and its motion (added in the previous release) are unchanged, and
all motion continues to respect the operating system's reduced-motion setting.

---

## FeedSimple

No functional changes this release. FeedSimple remains at r005.023; this QuerySimple release does
not touch shared-code, so there is no new FeedSimple version. Continue to update `shared-code/`
together with the widgets as usual.
