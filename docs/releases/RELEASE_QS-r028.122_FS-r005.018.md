# Release QS-r028.122 + FS-r005.018

**Release Date:** 2026-06-02
**Experience Builder Version:** 1.20.0+
**Previous Release:** QS-r027.099 + FS-r005.016 (May 7, 2026)

This is the r028 release line. It continues on Experience Builder 1.20 / ArcGIS Maps
SDK for JavaScript 5.0.4 (no framework version change since r027) and is built around a
single big idea: query results now live in real client-side FeatureLayers. That one
shift unlocks native map popups, map-to-card identify, a unified field-table renderer
shared by the card and the popup, and a simpler internal architecture (the old dual
rendering path is gone).

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.20.0-r028.122 | Major update |
| **FeedSimple** | 1.20.0-r005.018 | Maintenance (shared-code alignment) |
| **shared-code** | Required by both | Updated |

> **No ExB version break:** This release targets the same **Experience Builder 1.20.0**
> with **ArcGIS Maps SDK for JavaScript 5.0.4 (Calcite 5.0)** as r027. If you are still on
> ExB 1.19, use the last 1.19 release ([QS-r026.025 + FS-r004.005](RELEASE_QS-r026.025_FS-r004.005.md)).

> **Reminder (FeedSimple Installation):** Since r004, FeedSimple requires `shared-code/`.
> You must copy both `feed-simple/` and `shared-code/` into your widgets folder.

---

## What's New

### Native Map Popups & Map-to-Card Identify (r028.001–048)

The headline of r028. Query results are now stored as real features in per-geometry-type
client-side FeatureLayers (grouped under one GroupLayer), instead of plain graphics. Storing
results as features is what makes the rest of this release possible:

- **Native popups & identify:** Clicking a result feature on the map opens a real ArcGIS
  popup using the configured template — no custom click plumbing.
- **Map-to-card flash:** Clicking a feature on the map scrolls the matching result card
  into view and flashes it, so map and list stay in sync. New **`flashOnMapIdentify`**
  setting (default on) lets admins turn this off; it only appears when FeatureLayer results
  are enabled.
- **Native legend & LayerList integration:** Results participate in the map's legend and
  layer list like any other layer.
- **Leaner memory:** The popup registry now keeps only the attributes and template it needs
  (`SlimPopupRecord`) instead of pinning full graphics, and PopupSetting queries fetch only
  the fields the popup actually references. Polygon-heavy datasets shed megabytes of retained
  geometry.

### Unified Field-Table Renderer — Card == Popup (r028.109–112, 117)

Previously the result card and the on-map popup ran on two different renderers, so they
could disagree (raw epoch dates in the popup but formatted in the card, a different title,
fields in a different order). All three surfaces — **result card**, **map-feature popup**,
and **card-click popup** — now render through one shared engine:

- **Consistent everywhere:** Alias labels, formatted dates and numbers, decoded coded-value
  domains, and the same striped table, identical across card and popup.
- **Per-field display labels (r028.117):** A new per-field label override in settings lets
  admins rename any field for SelectAttributes mode without touching the underlying schema.
  Labels survive a layer rebind.
- **Title fixes:** Double-brace `{{Field}}` titles render correctly on the card (they used to
  collapse to a stray `}`), and both single- and double-brace token styles resolve the same way.

### Spatial Tab Overhaul (r028.100, 101, 108, 113, 118)

A round of fixes and one new option for spatial queries:

- **Mixed-geometry queries (r028.101):** A spatial query with mixed input shapes (e.g. a drawn
  polygon plus a line) used to silently keep only the highest-dimension shape and drop the rest.
  Now every input geometry is queried and the matches are combined and de-duplicated.
- **Drawn shapes persist across mode switch (r028.100):** Toggling between Draw and Operations
  no longer makes a drawn line vanish and leave a phantom buffer behind.
- **"Also include current results" opt-in (r028.118):** A new Draw-mode checkbox folds the
  current result set into the draw input, so a drawn shape and already-selected results can
  buffer and query together. It appears only once a shape is drawn and results exist; default off.
- **Deterministic target-layer labels (r028.113):** The Target-layers picker now shows the
  admin-configured label instead of whatever the live service happens to advertise, so the same
  layer reads the same way across widgets.
- **Single-select relationship hardening (r028.108):** The spatial relationship dropdown can no
  longer desync into a multi-selected state.

### Result-Set Truncation Alert (r028.114, 119, 121, 122)

Queries fetch up to the layer's max transfer count (commonly 1000/2000). A query that returned
exactly that many records used to look identical whether it was complete or cut off. Now:

- **Amber warning popover** on the Results panel when a query is truncated, following the same
  pattern as the no-results and query-error alerts.
- **Names the real total (r028.122):** When the service flags truncation, the widget runs a
  cheap count-only query and the alert reports the actual number of matching records
  ("matched N records but only M are shown"), not just the limit.
- **Guards against false alarms (r028.121):** Some older ArcGIS Server layers set the
  truncation flag on multipart query geometries even when nothing was dropped. The widget now
  verifies with the count query and suppresses the alert when the true total equals what was
  returned.

### Internal Architecture (r028.058, 091–107)

Not user-facing, but worth noting for anyone maintaining a fork:

- **Single rendering path (Path 2 Removal, r028.091–107):** The older dual GraphicsLayer
  rendering path was confirmed unused once FeatureLayer results became the default, and was
  removed end to end (chunked deletion, dead-state cleanup, doc scrub). The result rendering
  pipeline is now one path, not two.
- **Singleton config migration (r028.058):** Runtime reads of widget config now go through the
  `widgetConfigManager` singleton instead of Redux selectors and prop-drilling chains. Four
  prop chains and all runtime config Redux selectors were eliminated.
- **Doc and file organization cleanup (r028.072–074):** Six months of accumulated investigation
  files were consolidated and archived; the bug index was reconciled against the code.

---

## Removed

### Select on Map (r028.080)

The "Select on map" item in the result More-actions menu has been retired. Its blue-outline
highlight relied on a framework path that could not be made reliable for map-image sublayers
under ExB 1.20 (BUG-SELECT-MAP-IMAGE-001); multiple fix attempts across r028.075–079 all failed.
Rather than carry broken behavior forward, the feature was removed. Zoom To, Pan To, View in
Table, and Export are unaffected.

---

## FeedSimple Changes (r005.016 → r005.018)

No user-facing changes this release. FeedSimple moves with the suite for shared-code alignment:

- **r005.017 — Mobile popup behavior to shared-code:** `applyMobilePopupBehavior()` was lifted
  into `shared-code/` so QuerySimple and FeedSimple share one implementation. Internal refactor,
  no behavior change.
- **r005.018 — Shared-code version alignment:** A passthrough version bump. QuerySimple's Path 2
  removal stripped an unused debug flag from the shared logger; FeedSimple's logger factory is
  untouched and there is no functional change.

---

## Known Bugs

| Bug ID | Severity | Description |
|--------|----------|-------------|
| (none open) | — | BUG-SELECT-MAP-IMAGE-001 was closed by removing the Select on Map feature (r028.080). |

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

- **Unit tests:** 739/739 passing (Jest)
- **TypeScript errors:** 0 (`tsc --noEmit` clean across query-simple, helper-simple, feed-simple, shared-code)

## Documentation

- `docs/query-simple/` — Architecture, changelog, and process-flow documents
- `docs/feed-simple/` — Architecture, changelog, and configuration guide
- `docs/development/DEVELOPMENT_GUIDE.md` — Compatibility matrix and common errors
- `docs/releases/` — All release notes
