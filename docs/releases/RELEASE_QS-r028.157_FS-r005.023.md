# Release QS-r028.157 + FS-r005.023

**Release Date:** 2026-08-14
**Experience Builder Version:** 1.20.0+
**Previous Release:** QS-r028.140 + FS-r005.023 (June 24, 2026)

An accessibility and usability release driven by an external accessibility review and user
testing. Search and Reset buttons now explain themselves instead of sitting silently disabled,
required fields are marked, and "View in Table" finally opens the table panel. Same Experience
Builder 1.20 / JSAPI 5.0.4 stack. FeedSimple is unchanged and carried forward; shared-code is
unchanged this release.

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r028.157 | Accessibility batch + View-in-Table reveal |
| **FeedSimple** | 1.20.0-r005.023 | No functional change (carried forward) |
| **shared-code** | Required by both | Unchanged |

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`. You
> must copy both `feed-simple/` and `shared-code/` into your widgets folder.

---

## What's New

### Buttons that explain themselves (accessibility review)

The Search and Reset buttons (both the Query and Spatial tabs) are no longer natively disabled
when their requirements aren't met. They stay focusable and readable (the label now meets WCAG
contrast even in the inactive state), and activating a blocked Search - by click **or** Enter -
shows a message naming exactly what's missing: "Enter a value to search," "Select a spatial
relationship," "Select at least one target layer," and so on. One actionable reason at a time.
Screen readers hear the same message via a polite live region.

URL/deep-link automation is deliberately untouched: parameter-driven searches never pass through
the new guard.

### "Apply" is now "Search"

The action button reads **Search** on both tabs - the accessibility review found "Apply" didn't
convey "launch search." User-guide docs follow.

### Required fields are marked

The Spatial tab's **Spatial relationship** and **Target layers** headers show a REQUIRED marker
until satisfied, and the Query tab's input label shows the same marker while empty (clears on the
first character). The spatial relationship selector is also no longer disabled before you draw or
search - you can set it up in any order; the search itself still waits for all requirements.

### View in Table now opens the table

Clicking **View in Table** used to load results into the Table widget even when its panel was
collapsed - users saw nothing happen. It now reveals the table's panel: the widget walks the
layout, expands exactly the collapsed container(s) hiding the table (and only those - unrelated
panels you've closed stay closed), and works on repeat clicks. No configuration needed; this is
simply how it should have always worked. Placements in controllers and section views are covered
too.

### Result-list fixes

- Result cards now grow to fit the three-icon action toolbar - the icons no longer bleed onto the
  card below (reported twice, from two teams).
- The per-card "..." action menu no longer paints underneath neighboring cards.
- The Results-mode control (New / Add / Remove) text and star icon are larger and easier to read.
- The "Zoom to selected" checkbox is properly labeled - clicking the text toggles it, and screen
  readers announce it by name.

### Under the hood

- 52 new unit tests (refusal logic and the table-reveal walker), authored via the project's
  cold-room process; full suite 856/856.
- New debug events: `search-refused` (`?debug=FORM` / `?debug=TASK`) and `table-reveal`
  (`?debug=VIEW-TABLE`) trace every refusal and reveal decision.
- No shared-code changes; FeedSimple carried forward unchanged.
