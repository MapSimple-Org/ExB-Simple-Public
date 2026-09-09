# Running the Unit Tests

These are Jest unit tests for the MapSimple widgets. They cover the deterministic logic: SQL
building, URL and hash parsing, selection and zoom utilities, the template engine, config
resolution, and the pure helpers behind the runtime. Layout and visual behavior are not covered
here; those are checked manually in a running app.

Test folders in this package:

| Folder | Suites |
|---|---|
| `query-simple/tests/` | 28 |
| `helper-simple/tests/` | 2 |
| `feed-simple/tests/` | 4 |
| `shared-code/mapsimple-common/tests/` | 5 |

Expected result on ArcGIS Experience Builder 1.20 Developer Edition: **39 suites, 856 tests, all
passing.** The tests run inside the Experience Builder client, using Esri's own Jest setup, because
the widgets import framework modules (`jimu-core`, `jimu-ui`, `jimu-arcgis`) that only resolve
there.

## Prerequisites

- ArcGIS Experience Builder 1.20 Developer Edition, downloaded and unzipped.
- `npm ci` completed in its `client/` folder (this installs Jest and the framework).
- Node 20 or newer (the 1.20 requirement).

## Steps

1. **Copy the widget folders into the client.** All four, as real copies (not symlinks):

   ```
   client/your-extensions/widgets/query-simple/
   client/your-extensions/widgets/helper-simple/
   client/your-extensions/widgets/feed-simple/
   client/your-extensions/widgets/shared-code/
   ```

   Keep the `tests/` folders and their `fixtures/` subfolders. They are part of the package.

2. **Run the tests from the `client/` folder** using the launch config that ships in this folder:

   ```bash
   npx jest --config your-extensions/widgets/query-simple/tests/jest.config.js your-extensions/widgets
   ```

   That config loads Esri's own `client/jest.config.js` at runtime and adds the one module
   mapping the widgets need (`widgets/...` -> `your-extensions/widgets/...`). Nothing in Esri's
   files is edited. It refuses to run, with a message saying where it expected to be, if the
   folders are not in the location above.

   To run a single widget or suite, narrow the last argument:

   ```bash
   npx jest --config your-extensions/widgets/query-simple/tests/jest.config.js your-extensions/widgets/query-simple
   npx jest --config your-extensions/widgets/query-simple/tests/jest.config.js your-extensions/widgets/query-simple/tests/selection-utils
   ```

**FeedSimple-only installs:** the same launch config ships at `feed-simple/tests/jest.config.js`; see
`feed-simple/tests/README.md`.

**Alternative (no second config):** add one line inside the `moduleNameMapper: { ... }` block of
`client/jest.config.js`, then run plain `npx jest your-extensions/widgets`:

```js
"^widgets/(.*)": "<rootDir>/your-extensions/widgets/$1",
```

## Fixtures

`query-simple/tests/fixtures/table-reveal/` holds two JSON files used by
`table-reveal-utils.test.ts`. They are structural projections of two real application configs,
reduced to only the keys the code under test reads: for each widget its `uri`, `layouts`, and
`config.collapseSide`; for each layout its `content` items' `widgetId` or `sectionId`; each view's
`layout` map; each section's `views` list. All labels, data sources, URLs, item ids, and theme
settings were removed. The test's assertions about which sidebars conceal the table depend on this
layout structure, so the two files are needed for those 20 tests to pass. They ship with the
package and need no regeneration.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `Cannot find module 'widgets/shared-code/mapsimple-common'` | Jest was run without `--config .../tests/jest.config.js` and without the manual mapper line. |
| `No tests found` or only Esri's own sample test runs | The widgets were symlinked rather than copied. Jest does not follow symlinks by default. Copy them, or add `haste: { enableSymlinks: true }` and `watchman: false` to the config. |
| `ENOENT ... fixtures/table-reveal/app1-layout.json` | The `tests/fixtures/` folder was not copied along with the tests. |
| Hook errors mentioning two copies of React | Only happens with symlinked widgets whose parent folder has its own `node_modules`. Copying the widgets in avoids it. |

## What is not included

The Playwright end-to-end suite is not part of this package. It depends on fixtures and a running
application that live outside the widget folders.

Verified on Experience Builder 1.20 in exactly this layout (copied widgets, stock Esri config, the
shipped launch config), 2026-09-09.
