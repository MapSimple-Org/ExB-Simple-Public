# Release QS-r025.071 + FS-r001.039

**Release Date:** 2026-03-13
**Experience Builder Version:** 1.19.0+
**Previous Release:** [QS-r025.069 + FS-r001.031](RELEASE_QS-r025.069_FS-r001.031.md)

## What's Included

This is a **joint release** shipping both widget families:

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.19.0-r025.071 | Updated |
| **FeedSimple** | 1.19.0-r001.039 | Updated |

---

## QuerySimple Highlights (r025.069 → r025.071)

### Scroll-to-Top Button (r025.070)

- **Theme-aware chevron button** appears in the bottom-right of the results list after scrolling past 200 px
- Uses ExB theme CSS variable `--sys-color-primary-main` for background color (honors any app theme)
- Smooth-scrolls back to top on click with accessible `aria-label`
- Sticky positioning within the scrollable container

### Layout Fix (r025.071)

- Fixed scroll-to-top button being squished in flex layout (`flex-shrink: 0`, `min-height: 36px`)

---

## FeedSimple Highlights (r001.031 → r001.039)

### Card Action Toolbar (r001.036)

- **Per-card toolbar** with Zoom, Pan, and Expand icon buttons
- **Zoom button**: Shown when `enableZoomOnClick` is `false` — zooms to the feature on the map
- **Pan button**: Centers the map on the feature without changing zoom level (Esri hand icon)
- **Expand button**: Opt-in toggle (`enableCardExpand`) to show all raw feed fields below the card template
- Buttons disabled with tooltip when the item has no geometry

### GeoRSS Support (r001.037)

- **`<georss:point>` auto-splitting**: Parser detects `point` fields containing space-separated `"lat lon"` values and emits synthetic `point_lat` / `point_lon` fields
- Enables Feed Map Layer for ATOM/GeoRSS feeds (e.g., USGS earthquake ATOM) without manual coordinate extraction

### Scroll-to-Top Button (r001.037–038)

- **Theme-aware chevron button** matching QuerySimple's implementation
- Uses ExB theme CSS variables for consistent look across widgets

### Supported XML Feed Formats

CustomXmlParser now handles all major XML feed formats with a single parser:

| Format | Status | Notes |
|--------|--------|-------|
| Flat XML | Tested | Direct element-to-field mapping |
| Nested XML (QuakeML) | Tested | Dot-path keys for deep nesting |
| RSS 2.0 | Tested | `<channel><item>` auto-detected |
| ATOM | Tested | Standard entry extraction |
| ATOM + GeoRSS | Tested | Auto-splits `<georss:point>` |

### Auto-Restore Layer Visibility (r001.039)

- When a user turns off the feed layer in the LayerList and then clicks a card (or uses toolbar zoom/pan), the layer is **automatically made visible** so the result appears on the map
- No more "I clicked but nothing happened" confusion

### No-Geometry Card Feedback (r001.035)

- Cards without geometry show an inline "No geometry available" message when clicked
- Toolbar buttons disabled with tooltip explaining why

---

## Installation

### QuerySimple + HelperSimple

```bash
cp -r query-simple /path/to/ExB/client/your-extensions/widgets/
cp -r helper-simple /path/to/ExB/client/your-extensions/widgets/
cp -r shared-code /path/to/ExB/client/your-extensions/widgets/
```

### FeedSimple (standalone)

```bash
cp -r feed-simple /path/to/ExB/client/your-extensions/widgets/
```

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Backward Compatibility

- QuerySimple: All existing configurations work unchanged. No migration required.
- FeedSimple: All existing configurations work unchanged. No migration required.

## Documentation

- `docs/query-simple/` — Architecture, changelog, and process flow documents
- `docs/feed-simple/` — Architecture, changelog, and 7 process flow documents
- `docs/releases/` — All release notes
