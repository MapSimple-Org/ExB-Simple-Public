# Release v1.19.0-r024.110

**Release Date:** 2026-03-01  
**Experience Builder Version:** 1.19.0+

## Highlights

This release adds multi-format export capabilities (CSV, GeoJSON, JSON), major View in Table improvements including proper tab naming and field visibility, a smarter settings UX that detects Helper-Simple configuration, and image support in Custom Template mode.

---

## Custom Template Image Support (r024.110)

**Display images from your data directly in query results.**

### What's New

Custom Template mode now supports standard Markdown image syntax:

```markdown
![Alt text]({PHOTO_URL})
```

If your feature layer has a field containing an image URL (e.g. `PHOTO_URL`), it renders inline in the result card — responsive, max-width 100%.

### Example Template

```markdown
**{SITENAME}**
**Site type:** {SITETYPE}

![Photo]({PHOTO_URL})
```

### Inline Help Updated

The `(?)` tooltip in the Custom Template settings panel now includes image syntax in its cheat sheet.

---

## Multi-Format Export (r024.105-108)

**Export your query results to CSV, GeoJSON, or JSON with complete attribute data.**

### What's New

The ResultsMenu now has an "Export" submenu with three format options:

| Format | Includes Geometry | Use Case |
| :--- | :---: | :--- |
| **CSV** | No | Spreadsheets, data analysis |
| **GeoJSON** | Yes | GIS tools, web mapping |
| **JSON** | No | APIs, programmatic access |

### Features

- **Field aliases**: Column headers/property names use configured aliases, not raw field names
- **Priority ordering**: Visible fields appear first, maintaining your configured display order
- **Whitespace trimming**: String values are automatically trimmed (no trailing spaces)
- **Multi-source packaging**: Single source downloads a file; multiple sources download a zip

**Filenames:**
- Single: `Query-{SearchAlias}.csv` / `.geojson` / `.json`
- Multiple: `Query-Results-CSV.zip` / `Query-Results-GeoJSON.zip` / `Query-Results-JSON.zip`

### Technical Details

Export re-queries the original data source with full attributes (same pattern as View in Table). The code is consolidated into `export-utils.ts` making it easy to add new formats.

---

## View in Table Improvements (r024.82-104)

**Smarter tab naming, field visibility, and memory management.**

### Tab Naming (r024.82-83)

Table tabs now show meaningful names like "Query-Parcels" instead of generic "Output_xxxxx":

- Uses `searchAlias` from query config (falls back to layer name)
- Format: `Query-{SearchAlias}` with spaces removed
- Consistent naming across View in Table, Export files, and all UI

### Field Visibility (r024.87)

Table columns now respect your configured field visibility:

- Extracts visible fields from popup template configuration
- Visible fields appear first in display order
- Works with all three display modes: Popup setting, Select attributes, Custom template

### Memory Optimization (r024.100-104)

Aligned View in Table implementation with Esri's patterns:

- Removed manual data source destruction (let ExB framework handle cleanup)
- Simplified tab management to match Esri's `view-in-table.ts`
- Added "priming tab" technique to ensure proper rendering on first open

---

## Smart Settings UX (r024.109)

**Context-aware Helper-Simple requirement note.**

The shortId configuration field now displays a warning note only when needed:

- Note appears if no Helper-Simple widget is configured to manage this QuerySimple widget
- Note is hidden if a Helper-Simple widget is properly configured
- Scans app config in real-time to check `managedWidgetId`

---

## Installation

Copy the widget folders to your Experience Builder installation:

```
your-extensions/widgets/
  query-simple/
  helper-simple/
  shared-code/
```

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Backward Compatibility

- All changes are backward compatible
- No migration required
- Export submenu replaces single "Export CSV" option (same location, more choices)

## Documentation

- [README](../README.md) - Installation and configuration
- [CHANGELOG](../CHANGELOG.md) - Full change history
