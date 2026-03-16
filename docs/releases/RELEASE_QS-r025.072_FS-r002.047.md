# Release QS-r025.072 + FS-r002.047

**Release Date:** 2026-03-16
**Experience Builder Version:** 1.19.0+
**Previous Release:** [QS-r025.071 + FS-r001.039](RELEASE_QS-r025.071_FS-r001.039.md)

## What's Included

This is a **joint release** shipping both widget families:

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.19.0-r025.072 | Updated |
| **FeedSimple** | 1.19.0-r002.047 | Updated |

---

## QuerySimple Highlights (r025.071 → r025.072)

### iOS Auto-Zoom Prevention

- Inputs and selects in the spatial tab now enforce `font-size: 16px` at viewports 1024px and below
- Prevents iOS Safari from auto-zooming when users tap form fields on iPhones and iPads
- Applied to buffer distance input, spatial relationship select, and target layer combobox

### Mobile Popup Behavior

- **4 new config fields**: `mobilePopupCollapsed`, `mobilePopupDockPosition`, `mobilePopupHideDockButton`, `mobilePopupHideActionBar`
- **Reactive architecture**: Uses `mapView.watch('popup.visible')` to apply settings when popups open, avoiding the JSAPI lazy-initialization issue where `mapView.popup` doesn't exist until the first popup opens
- **Settings UI**: New "Mobile Popup Behavior" section with toggle switches and dock position dropdown
- Settings only take effect at viewports 600px and below

---

## FeedSimple Highlights (r001.039 → r002.047)

### Major Version Bump (r001 → r002)

FeedSimple moved to release 002 reflecting significant feature additions since the initial release.

### Color Legend

- **Collapsible color key bar** above the card list showing what each color means
- Supports both exact mode (status value list) and range mode (numeric bounds with labels)
- Collapsed view shows inline swatches; expanded view shows full detail
- Admin toggle in settings, defaults to on when color coding is configured

### Field Chip UX Improvements

- **High-contrast field chips**: Changed from low-contrast overlay colors to `neutral-200` background with `neutral-1000` text for legibility in the dark settings panel
- **Scrollable field panels**: Insert Field, Sortable Fields, and Search Fields sections now have `max-height: 200px` with overflow scroll to prevent the settings panel from stretching endlessly with feeds that have many fields

### iOS Auto-Zoom Prevention (Breakpoint Update)

- Widened the mobile auto-zoom fix breakpoint from 600px to 1024px to cover iPadOS tablets

### Settings Panel Fix

- Removed extra closing bracket after Search Fields section that was breaking the settings panel render

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

- QuerySimple: All existing configurations work unchanged. New mobile popup fields default to off/empty.
- FeedSimple: All existing configurations work unchanged. Color legend defaults to on when color coding is configured. No migration required.

## Documentation

- `docs/query-simple/` — Architecture, changelog, and process flow documents
- `docs/feed-simple/` — Architecture, changelog, and process flow documents
- `docs/releases/` — All release notes
