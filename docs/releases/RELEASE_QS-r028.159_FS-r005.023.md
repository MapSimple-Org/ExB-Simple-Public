# Release QS-r028.159 + FS-r005.023

**Release Date:** 2026-09-09
**Experience Builder Version:** 1.20.0+
**Previous Release:** QS-r028.157 + FS-r005.023 (August 14, 2026)

A maintenance release with one behavior change and one packaging change. Search results now
return geometry at full service precision (the small generalization tolerance is gone), and the
Jest unit tests ship inside the package with instructions, so a downstream team can run the full
suite in their own Experience Builder install. Same Experience Builder 1.20 / JSAPI 5.0.4 stack.
FeedSimple is unchanged and carried forward; shared-code is unchanged this release.

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r028.159 | Full-precision geometry + unit tests in the package |
| **FeedSimple** | 1.20.0-r005.023 | No functional change (carried forward) |
| **shared-code** | Required by both | Unchanged |

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`. You
> must copy both `feed-simple/` and `shared-code/` into your widgets folder.

---

## What's New

### Result geometry at full precision (r028.158)

Display queries no longer ask the service to generalize geometry. Previously every result was
requested with a 0.1 map-unit tolerance (about 7 cm on the ground in Web Mercator at mid
latitudes); results now come back exactly as stored. The change was made to rule the widget out
while investigating a reported print offset. The offset turned out to be unrelated to the widget:
it is a datum transformation difference between the hosted feature service (which applies no
NAD83 to WGS84 shift when reprojecting) and the print service (which does), roughly 1.3 m in the
Pacific Northwest. Generalization is staying off regardless. Spatial-tab queries never used it,
so both query paths now behave the same. The per-call option remains available in code if payload
size ever becomes a measured problem.

### Unit tests ship with the widgets (r028.159)

The package now includes all 39 Jest suites (856 tests) under each widget's `tests/` folder,
plus `query-simple/tests/README.md` with the run instructions:

1. Copy the four widget folders into `client/your-extensions/widgets/` of an Experience Builder
   1.20 Developer Edition install.
2. Add one line to Esri's stock `client/jest.config.js`, inside `moduleNameMapper`:
   `"^widgets/(.*)": "<rootDir>/your-extensions/widgets/$1",`
3. From `client/`: `npx jest your-extensions/widgets`

Expected: 39 suites, 856 tests, all passing. Verified in exactly that layout against the stock
1.20 config. The one suite that previously depended on private application configs now reads two
small structural fixtures shipped in `tests/fixtures/`, so nothing outside the package is needed.
The Playwright end-to-end suite is not included.

### Under the hood

- `?debug=TASK` now reports `geometryGeneralization: 'none'` on each query so the running
  build's posture is visible.
- No runtime code change in r028.159; no shared-code changes; FeedSimple carried forward
  unchanged.
