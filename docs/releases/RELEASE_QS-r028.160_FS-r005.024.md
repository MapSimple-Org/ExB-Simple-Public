# Release QS-r028.160 + FS-r005.024

**Release Date:** 2026-09-09
**Experience Builder Version:** 1.20.0+
**Previous Release:** QS-r028.159 + FS-r005.023 (September 9, 2026)

A packaging release. The Jest unit tests that began shipping in r028.159 now come with a launch
config for each family, so running the suite in your own Experience Builder install takes one
command and no edits to any Esri file. No runtime code changed in either widget.

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r028.160 | Test launch config, no runtime change |
| **FeedSimple** | 1.20.0-r005.024 | Test launch config, no runtime change |
| **shared-code** | Required by both | Test-folder changes only |

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`. You
> must copy both `feed-simple/` and `shared-code/` into your widgets folder.

---

## What's New

### One command runs the tests

r028.159 shipped the 39 Jest suites but still asked you to hand-edit Esri's `client/jest.config.js`
to add a module mapping. That step is gone. Each package now carries a launch config:

Full package (QuerySimple + HelperSimple + FeedSimple), from the `client/` folder:

```bash
npx jest --config your-extensions/widgets/query-simple/tests/jest.config.js your-extensions/widgets
```

FeedSimple on its own:

```bash
npx jest --config your-extensions/widgets/feed-simple/tests/jest.config.js your-extensions/widgets
```

The config loads Esri's own `client/jest.config.js` at runtime and adds only the one module mapping
the widgets need. Nothing of Esri's is copied or overridden, so it keeps working across ExB patch
updates. If the widget folders are not where it expects, it stops with a message saying where it
looked rather than a stack trace.

Verified against the stock 1.20 configuration from Esri's official download, widgets copied into
`client/your-extensions/widgets/`: **39 suites, 856 tests** for the full package, and **9 suites,
298 tests** for a FeedSimple-only install. The manual one-line edit is still documented in
`query-simple/tests/README.md` if you prefer a single config.

### Under the hood

- FeedSimple's `tests/README.md` is now a complete guide for a standalone install rather than a
  pointer to QuerySimple's.
- A sample image URL in one shared-code markdown test is a neutral placeholder instead of a live
  third-party address. The test transforms text and makes no network request.

## Note on the r028.159 release assets

The content in this release was briefly published on September 9, 2026 by replacing the zip files
attached to the r028.159 release, rather than by cutting a new version. For a period that day, the
`QS-r028.159-FS-r005.023` tag served two different builds under identical filenames. Those assets
have been restored to exactly what they were when r028.159 was published, and this content now
carries its own version. If you downloaded from r028.159 during that window, the files you have are
functionally the same as this release; updating to r028.160 makes the version you hold match its
label.
