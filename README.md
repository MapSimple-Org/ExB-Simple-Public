# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition (1.19.0+).

| Widget Family | Version | Status |
|--------------|---------|--------|
| **QuerySimple** (+ HelperSimple) | `1.19.0-r025.069` | Updated — Mar 13, 2026 |
| **FeedSimple** | `1.19.0-r001.031` | New — First public release |

---

## What's in This Repo

This repository contains **two independent widget families**. Install only what you need.

### QuerySimple Family

High-performance search and spatial query engine for Experience Builder. Deep-linking, results accumulation, spatial analysis, typeahead, and configurable graphics.

**Requires 3 folders:**
- `query-simple/` — Main search widget
- `helper-simple/` — Background orchestrator (URL monitoring, selection guard)
- `shared-code/` — Common utilities shared between the two

### FeedSimple (Standalone)

XML feed consumer widget that displays live data feeds with configurable card templates, polling, and optional map integration via spatial join.

**Requires 1 folder:**
- `feed-simple/` — Fully standalone, no dependency on QuerySimple or shared-code

---

## Quick Start

### Install QuerySimple + HelperSimple

```bash
# Copy all three folders to your ExB widgets directory
cp -r query-simple helper-simple shared-code /path/to/ExB/client/your-extensions/widgets/
```

### Install FeedSimple

```bash
# Copy just one folder
cp -r feed-simple /path/to/ExB/client/your-extensions/widgets/
```

### Build and Run

```bash
cd /path/to/ExB/client
npm run build
```

Restart Experience Builder and add the widgets to your app.

---

## What's New

### QuerySimple r025.069 (Mar 13, 2026)

**Spatial relationship info popover** — ⓘ icon next to the spatial relationship combobox shows Esri SVG diagrams with descriptions on hover.

**Typeahead suggestions** — Real-time value suggestions for free-form text queries with per-query configuration, multi-clause SQL support, and keyboard navigation.

**Spatial tab** — Full spatial query support with Operations and Draw modes, buffer preview, 7 drawing tools, context-aware relationship warnings, and multi-layer targets.

**Additional improvements** — Configurable zoom expansion factor, point zoom buffer, disable spatial filter per query, clear attribute filter labels, and multiple bug fixes.

### FeedSimple r001.031 (Mar 13, 2026)

First public release featuring XML feed parsing, markdown card templates with token substitution, configurable polling, map integration via spatial join, and status field coloring.

---

## QuerySimple Features

- **93% Latency Reduction**: SQL Optimizer + attribute stripping minimize network payloads
- **Dual-Mode Deep Linking**: Hash fragments (`#shortId=val`) and query strings (`?shortId=val`)
- **Results Accumulation**: New/Add/Remove modes across multiple queries
- **Spatial Tab**: Operations and Draw modes with buffer preview, 7 relationships, multi-layer targets
- **Typeahead Suggestions**: Real-time value suggestions with multi-clause support
- **Custom Templates**: Markdown-based result display with `{fieldName}` tokens
- **LayerList Integration**: Results persist as GroupLayer visible in LayerList and Legend
- **Configurable Graphics**: Custom colors, opacity, sizing, and hover preview pin
- **Multi-Format Export**: CSV, GeoJSON, JSON with field aliases and priority ordering

### URL Parameters (Deep Linking)

| Format | Example | Best Use Case |
| :--- | :--- | :--- |
| **Hash (#)** | `index.html#pin=123` | Interactive UX — no page reload |
| **Query (?)** | `index.html?pin=123` | External linking — CRM/email integrations |

### Debug System

Production-safe debugging via URL parameter: `?debug=FEATURE`

**Available tags:** `all`, `HASH`, `TASK`, `RESULTS-MODE`, `SELECTION`, `RESTORE`, `GRAPHICS-LAYER`, `WIDGET-STATE`, `SPATIAL`, `SUGGEST`, `DIRECT-QUERY`, `CSV`, `BUFFER`

**Example:** `index.html?debug=HASH,TASK`

---

## FeedSimple Features

- **XML Feed Parsing**: Configurable field mapping with custom parser support
- **Markdown Card Templates**: Token substitution (`{fieldName}`) with filter chain
- **Configurable Polling**: Automatic refresh intervals with backoff
- **Map Integration**: Spatial join to FeatureLayer with click-to-zoom and popup
- **Status Field Coloring**: Configurable color mapping for status indicators

### Debug System

**Available tags:** `FEED`, `JOIN`

**Example:** `index.html?debug=FEED,JOIN`

---

## Documentation

Each widget family has its own documentation under `docs/`:

| Doc | QuerySimple | FeedSimple |
|-----|-------------|------------|
| Architecture | `docs/query-simple/ARCHITECTURE.md` | `docs/feed-simple/ARCHITECTURE.md` |
| Changelog | `docs/query-simple/CHANGELOG.md` | `docs/feed-simple/CHANGELOG.md` |
| Process Flows | `docs/query-simple/process-flows/` | `docs/feed-simple/process-flows/` |
| Release Notes | `docs/releases/` (shared) | `docs/releases/` (shared) |

---

## Requirements

- ArcGIS Experience Builder Developer Edition **1.19.0+**
- Node.js (version matching your ExB installation)

---

## Support

- **Issues**: [Report bugs on GitHub](https://github.com/MapSimple-Org/ExB-Simple-Public/issues)
- **License**: MIT — see [LICENSE](LICENSE)

---

(c) 2026 MapSimple Organization.
