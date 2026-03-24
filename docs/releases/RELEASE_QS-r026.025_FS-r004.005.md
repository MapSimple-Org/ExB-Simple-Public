# Release QS-r026.025 + FS-r004.005

**Release Date:** 2026-03-24
**Experience Builder Version:** 1.19.0+
**Previous Release:** [QS-r025.073 + FS-r003.010](RELEASE_QS-r025.073_FS-r003.010.md)

## What's Included

| Family | Version | Status |
|--------|---------|--------|
| **QuerySimple + HelperSimple** | 1.19.0-r026.025 | Major update |
| **FeedSimple** | 1.19.0-r004.005 | Major update |
| **shared-code** | Required by both | New shared dependency |

> **Breaking Change (Installation):** FeedSimple now depends on `shared-code/`. Previous releases allowed installing FS as a single standalone folder. Starting with r004, you must copy both `feed-simple/` and `shared-code/` into your widgets folder. Previous standalone releases remain available on the [Releases](https://github.com/MapSimple-Org/ExB-Simple-Public/releases) page for users who don't need the new features.

---

## QuerySimple Highlights (r025.073 -> r026.025)

This is a **major architectural release**. QuerySimple moves to a shared markdown engine, gains a unified template syntax with pipe filters, and adds a data source rebinding tool.

### Unified Template Engine (r026.001-008)

QuerySimple now uses the same `{{field | filter}}` template syntax as FeedSimple, powered by a shared markdown engine in `shared-code/`.

- **16 pipe filters**: Date formatting, math operations (divide, multiply, round, abs), string transforms (upper, lower, prefix, suffix), and link helpers (autolink, externalLink)
- **CustomContent popups**: CustomTemplate queries render popups via our own engine instead of delegating to the Esri Feature widget, giving full control over markdown rendering
- **Card-level markdown**: Result cards render via `substituteTokens() -> convertTemplateToHtml() -> dangerouslySetInnerHTML`, matching FeatureInfo DOM structure
- **Template migration button**: Settings panel detects old `{field}` syntax and offers one-click conversion to `{{field}}` with before/after preview
- **Legacy fallback**: Old `{field}` syntax still works at runtime via fallback regex. No existing configs will break.

### Markdown Table Support (r026.014)

- **Table parsing**: Pipe-delimited markdown tables render as styled HTML with borders, header styling, and column alignment (`:---` left, `:---:` center, `---:` right)
- **Table Builder**: Inline grid editor in the settings panel generates pipe-delimited markdown. Configurable columns (2-6) and rows (1-10), optional header row, style options (striped/plain)
- **Headerless tables**: Start with the separator row to create tables without a header

### Per-Result Pan To (r026.009-013)

- **Pan button**: New hand icon on each result card centers the map on the feature without changing zoom level
- **Click behavior**: `panOnResultClick` setting makes clicking a result card pan instead of zoom. Mutually exclusive with zoom-on-click.
- **Toolbar visibility**: Pan button shows on the toolbar when pan-on-click is OFF (user needs the explicit button). Hidden when pan is the default click behavior.

### Data Source Rebinding Tool (r026.018-025)

When a layer is replaced in the web map (e.g., swapping an AGS service endpoint for a hosted feature layer), all query items referencing the old data source break. Previously required manual JSON editing. Now handled in the settings panel.

- **Data Source Management section**: Lists all unique data sources with query counts
- **Auto-heal mode**: When the replacement DS has identical field names, one-click apply swaps all references
- **Field mapping mode**: When field names differ, an interactive mapping table lets you remap each field with auto-match and dropdowns
- **Automatic cleanup**: Old data source reference removed from the widget config after rebinding
- **Broken DS banner**: Yellow warning appears when ExB reports inaccessible data sources, directing you to the rebind tool

---

## FeedSimple Highlights (r003.010 -> r004.005)

### Shared Markdown Engine (r004.001)

FeedSimple's markdown converter has been extracted to `shared-code/mapsimple-common/` and is now shared with QuerySimple. No behavioral changes for existing FS users -- same rendering, same token syntax, same filters.

### Markdown Table Support (r004.002-005)

- **Table rendering**: Pipe-delimited markdown tables in card and popup templates render as styled HTML with borders, alternating row colors, and alignment support
- **Table Builder**: New "Insert table" toggle in the Card Template settings. Opens an inline grid editor to visually build tables without writing pipe syntax by hand.
- **Tables help section**: Added to the expandable template syntax reference panel
- **Style options**: Striped or plain rows, optional header row

---

## Installation

### QuerySimple + HelperSimple

```bash
cp -r query-simple helper-simple shared-code /path/to/ExB/client/your-extensions/widgets/
```

### FeedSimple

```bash
# IMPORTANT: shared-code is now required (new in r004)
cp -r feed-simple shared-code /path/to/ExB/client/your-extensions/widgets/
```

> **Note:** If you are installing both QS and FS, you only need one copy of `shared-code/`.

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Backward Compatibility

- **QuerySimple**: The `{{field | filter}}` syntax is new, but the old `{field}` syntax continues to work via a legacy fallback regex. Existing configs do not need to be updated. A migration button in settings offers one-click conversion when you're ready.
- **FeedSimple**: No template syntax changes. The only breaking change is the new `shared-code/` dependency for installation.

## Documentation

- `docs/query-simple/` -- Architecture, changelog, and process flow documents (12 flows)
- `docs/feed-simple/` -- Architecture, changelog, and configuration guide (updated with table syntax)
- `docs/releases/` -- All release notes
