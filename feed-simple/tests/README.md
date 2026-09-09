# Running the Unit Tests (FeedSimple)

Jest unit tests for FeedSimple and the shared-code it depends on. They cover the deterministic
logic (feed parsing, token rendering, markdown templates, the feed pipeline) and run inside the
Experience Builder client, using Esri's own Jest setup, because the widgets import framework
modules that only resolve there.

If you installed the full MapSimple package (QuerySimple + HelperSimple + FeedSimple), the
instructions in `query-simple/tests/README.md` cover everything, including these suites. This
file is for a **FeedSimple-only** install (`feed-simple/` + `shared-code/`).

## Prerequisites

- ArcGIS Experience Builder 1.20 Developer Edition, downloaded and unzipped.
- `npm ci` completed in its `client/` folder.
- Node 20 or newer.

## Steps

1. **Copy the widget folders into the client**, as real copies (not symlinks):

   ```
   client/your-extensions/widgets/feed-simple/
   client/your-extensions/widgets/shared-code/
   ```

   Keep the `tests/` folders. They are part of the package.

2. **Run the tests from the `client/` folder** using the launch config in this folder:

   ```bash
   npx jest --config your-extensions/widgets/feed-simple/tests/jest.config.js your-extensions/widgets
   ```

   The config loads Esri's own `client/jest.config.js` at runtime and adds the one module mapping
   the widgets need (`widgets/...` -> `your-extensions/widgets/...`). No Esri file is edited. It
   refuses to run, with a message saying where it expected to be, if the folders are not in the
   location above. Expected result for a FeedSimple-only install on ExB 1.20: **9 suites, 298
   tests, all passing** (verified in exactly this layout, 2026-09-09).

**Alternative (no second config):** add one line inside the `moduleNameMapper: { ... }` block of
`client/jest.config.js`, then run plain `npx jest your-extensions/widgets`:

```js
"^widgets/(.*)": "<rootDir>/your-extensions/widgets/$1",
```

## Troubleshooting

| Symptom | Cause |
|---|---|
| `Cannot find module 'widgets/shared-code/mapsimple-common'` | Jest was run without `--config .../tests/jest.config.js` and without the manual mapper line. |
| `No tests found` or only Esri's own sample test runs | The widgets were symlinked rather than copied. Jest does not follow symlinks by default. |
| Hook errors mentioning two copies of React | Only happens with symlinked widgets. Copying the widgets in avoids it. |

The Playwright end-to-end suite is not part of this package.
