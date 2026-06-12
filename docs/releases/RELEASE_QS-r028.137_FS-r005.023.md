# Release QS-r028.137 + FS-r005.023

**Release Date:** 2026-06-12
**Experience Builder Version:** 1.20.0+
**Previous Release:** QS-r028.132 + FS-r005.020 (June 9, 2026)

A QuerySimple-focused release adding **configurable tab help**: a "?" button that explains each
tab of the widget, with text every organization can customize. Driven by a deployment team that
had to squeeze all of their guidance into a single tooltip; now each tab and each Spatial mode
explains itself. Same Experience Builder 1.20 / JSAPI 5.0.4 stack as the previous release.
FeedSimple has no functional changes (version bumps track shared-code updates).

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r028.137 | Feature release |
| **FeedSimple** | 1.20.0-r005.023 | No functional change (shared-code consumer bumps) |
| **shared-code** | Required by both | Updated (new config getters) |

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`. You
> must copy both `feed-simple/` and `shared-code/` into your widgets folder.

---

## What's New

### Tab help: every tab explains itself

A "?" button now sits at the right end of the Query / Spatial / Results tab strip. Click it and
a popover describes whichever tab is active — what it does and how to use it. Every tab ships
with a sensible standard description, so this works with zero configuration.

The Spatial tab's Operations/Draw mode toggle gets the same treatment: its own "?" describing
the active mode, replacing the old fixed one-line description that could not be customized.

### Customize the text per organization

All five help texts (three tabs plus the two Spatial modes) are editable in the widget settings
under **Tab Help**. The fields accept the same markdown as Custom Templates — bold, italics,
lists, paragraphs, links — and the standard text appears as each field's placeholder so you can
see what you are replacing. Leave a field blank to keep the standard description.

### Match your site's help scheme

The help popup background color is configurable (for example, a pale yellow to match an existing
help system). The text color adjusts automatically for readability on whatever background you
pick, so the help can never be configured into an unreadable state. A "Use theme default" reset
returns it to the native surface. Prefer no help affordance at all? A master **Show tab help**
switch removes it entirely.

### Designed to be noticed, politely

The "?" gives a single, subtle pulse when the widget loads and whenever its content changes
(switching tabs or modes), so users learn that the help follows them around. The pulse follows
your theme's primary color and is automatically disabled for users whose system requests
reduced motion.

### Screen reader support throughout

Each tab carries a hidden description, so screen reader users hear what a tab does the moment it
receives focus — no need to find the button. The popover itself is keyboard-accessible: Enter to
open, Esc to dismiss, focus returned to the button.

### Diagnostics

Tab help configuration reads are logged under the existing `SETTINGS` debug flag
(`?debug=SETTINGS`), including whether each text resolved from your configuration or the shipped
default — the first thing to check if a customized text is not appearing.

---

## FeedSimple

No functional changes. FeedSimple's version advanced r005.020 → r005.023 tracking the shared-code
updates above (new configuration getters used by QuerySimple). Update `shared-code/` together
with the widgets as usual.
