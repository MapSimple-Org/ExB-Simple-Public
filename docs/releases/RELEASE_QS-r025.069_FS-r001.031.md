# Release QS-r025.069 + FS-r001.031

**Release Date:** 2026-03-13
**Experience Builder Version:** 1.19.0+
**Previous QS Release:** [v1.19.0-r025.057](RELEASE_v1.19.0-r025.057.md)
**Previous FS Release:** First public release

## What's Included

This is a **joint release** shipping both widget families:

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.19.0-r025.069 | Updated |
| **FeedSimple** | 1.19.0-r001.031 | New — first public release |

---

## QuerySimple Highlights (r025.058 → r025.069)

### Spatial Relationship Info Popover (r025.069)

- **ⓘ icon** next to the spatial relationship combobox shows a hover popover with the Esri SVG diagram and caption for the currently selected relationship
- Five official Esri diagrams included: Contains, Intersects, Overlaps, Within, Touches
- Text-only descriptions for Envelope Intersects and Crosses (no official diagrams available)

### Typeahead / Suggest for Free-Form Queries (r025.058)

- Configurable typeahead suggestions as users type in query fields
- Per-query enable/disable in settings panel
- Debounced search with configurable minimum characters

### Additional Changes (r025.058–r025.068)

- Configurable zoom expansion factor and point zoom buffer distance
- Disable spatial filter toggle and clear attribute filter labels per query item
- Bug fixes: popup GroupLayer inheritance, table field resolution, buffer preview auto-enable
- Mode help text styling improvements
- Tooltips on Operations/Draw toggle buttons

---

## FeedSimple — First Public Release (r001.031)

FeedSimple is a **standalone** XML feed consumer widget. It does **not** depend on QuerySimple, HelperSimple, or shared-code.

### Features

- **XML feed parsing** with configurable field mapping and custom parser support
- **Markdown card templates** with token substitution (`{fieldName}`) and filter chain
- **Configurable polling** with automatic refresh intervals
- **Map integration** — spatial join to FeatureLayer with click-to-zoom and popup
- **Status field coloring** — configurable color mapping for status indicators
- **Debug logging** via `?debug=FEED,JOIN` URL parameters

### Installation

Copy just one folder:
```
your-extensions/widgets/
  feed-simple/
```

No shared-code dependency required.

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
- FeedSimple: New widget — no backward compatibility considerations.

## Documentation

- `docs/query-simple/` — Architecture, changelog, and 11 process flow documents
- `docs/feed-simple/` — Architecture, changelog, and 6 process flow documents
- `docs/releases/` — All release notes
