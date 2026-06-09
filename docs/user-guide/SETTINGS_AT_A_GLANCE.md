# Settings at a Glance — QuerySimple & HelperSimple

A scan-in-30-seconds reference for every setting: what it is called in the panel,
where to find it, its default, and what it does. For step-by-step walkthroughs and
screenshots, see the full **QuerySimple Configuration Guide** (`QUERYSIMPLE_CONFIGURATION_GUIDE.md`)
in this folder.

## How to read this

- **Default** = what a freshly added widget starts with. Older widgets keep whatever
  they were already set to (see the note on "Show results in LayerList" below).
- Settings live in two places:
  - **Widget settings** — open the QuerySimple widget itself (not a query). These apply
    to every query in the widget.
  - **Query settings** — open an individual query in the query list. These apply to that
    one query only.
- HelperSimple has a single setting, covered at the bottom.

---

## Widget settings (apply to the whole widget)

Open the QuerySimple widget in the builder. These sections appear in the widget's
settings panel.

### Display & layout

| Setting (panel label) | Default | What it does |
|---|---|---|
| Show header | On | Show or hide the widget's header label (e.g., "Enhanced Search"). |
| Arrangement style | Vertical | Query tab layout: Vertical, Horizontal, or Icon. |
| Wrap | Off | When Horizontal arrangement is selected, whether query tabs wrap to a new line. |
| List direction | Vertical | Result card layout: Vertical or Horizontal. |

> **Paging:** Results render all at once. The lazy-load and multi-page options were
> retired, so there is no paging-style or page-size control in the panel.

### Result click behavior

| Setting (panel label) | Default | What it does |
|---|---|---|
| Zoom to record when clicked | Off | Clicking a result card zooms the map to that feature. The popup opens either way. |
| Pan to record when clicked | Off | Clicking a result card pans (re-centers) without changing zoom. Cannot be on at the same time as Zoom. |
| Point zoom distance (ft) | 300 | Buffer around a single point when zooming, so the map doesn't over-zoom. Points only. |
| Zoom expansion factor | 1.2 | How much breathing room around the zoom extent. 1.0 = tight fit, 2.0 = double. |

### Show results in LayerList (Path 3)

| Setting (panel label) | Default | What it does |
|---|---|---|
| Show results in LayerList | **On (new widgets)** | Results become a map layer that shows in the LayerList and persists after the widget closes. See note. |
| Layer title | QuerySimple Results | Name of that results layer in the LayerList panel. |
| Flash result on map click | On | When a result feature is clicked on the map, scroll its card into view and flash it. Only active when "Show results in LayerList" is on. |

> **Note on the default:** As of **r028.131**, a newly added QuerySimple widget defaults
> to "Show results in LayerList" **on** (Path 3). Widgets created before r028.131 are
> untouched and keep whatever they were set to (off = the older highlight-graphics behavior).
> Requires a map widget connected to QuerySimple.

### Graphics symbology (result highlights)

Controls how results are highlighted on the map. Per widget instance, so two QuerySimple
widgets on one page can use different colors.

| Setting (panel label) | Default | What it does |
|---|---|---|
| Fill color | #DF00FF (magenta) | Fill color for polygon/point highlights. |
| Fill opacity | 0.25 | Fill transparency (0–1). |
| Outline color | #DF00FF (magenta) | Outline/border color. |
| Outline opacity | 1.0 | Outline transparency (0–1). |
| Outline width | 2px | Border thickness (1–10px). |
| Point marker size | 12px | Diameter of point markers (8–32px). |
| Point outline width | 2px | Border width on point markers (1–6px). |
| Point marker style | Circle | Marker shape: circle, square, diamond, cross, or x. |

### Hover preview

Two independent cues when a user hovers a result card. Both on by default.

| Setting (panel label) | Default | What it does |
|---|---|---|
| Show pin on hover | On | Drops a pin on the map at the hovered feature. |
| Pin color | #EA4335 (red) | Color of the hover pin. |
| Show highlight on hover | On | Outlines the hovered feature's geometry (great for lines/polygons). |
| Highlight color | #EA4335 (red) | Color of the hover feature highlight. |

### Spatial tab colors

| Setting (panel label) | Default | What it does |
|---|---|---|
| Draw color | #32FF00 (lime green) | Color for shapes drawn on the map (point, line, polygon, rectangle, circle). |
| Buffer color | #FFA500 (orange) | Color for the buffer preview overlay. |
| Allowed relationships | All shown | Which spatial relationships (intersects, contains, within, etc.) appear in the Spatial tab dropdown. Empty = all. |

### Mobile popup behavior (viewport ≤ 600px)

| Setting (panel label) | Default | What it does |
|---|---|---|
| Open popup collapsed | Off | On phones, open the popup showing only the title. |
| Dock position | Auto | Where the popup docks on mobile: Auto, Top, or Bottom. |
| Hide dock button | Off | Remove the undock button so users can't move the popup. |
| Hide action bar | Off | Hide the popup action bar (zoom-to, etc.) on mobile. |

---

## Query settings (apply to one query)

Open an individual query in the query list. These appear inside that query's
configuration.

### Identity & ordering

| Setting (panel label) | Default | What it does |
|---|---|---|
| Label | Layer name | Display name on the query tab (e.g., "Parcel Number"). |
| Icon | None | Optional icon shown next to the label. |
| Short ID | Blank | Lets a URL trigger this query: `#shortid=VALUE` or `?shortid=VALUE`. Case-sensitive — the URL key must match the configured value exactly. Must be unique. |
| Group ID | Blank | Groups queries that share a heading in the tab list. Case-sensitive. |
| Search by | Blank | Plain-language label used as the query's display name in the runtime dropdown and as the popup/result title. Overrides the layer/field name. (Config key: `searchAlias`.) |
| Display order | None | Whole number ordering queries *within a group* (lower first). Only appears once a Group ID is set; clearing the Group ID clears it. |

### Results display

| Setting (panel label) | Default | What it does |
|---|---|---|
| Result display mode | Use webmap settings | How each result renders: Use webmap settings, Customize (pick fields + title), or Custom template (Markdown). |
| Title expression | Blank | (Customize / Custom template) Builds the result title from fields, e.g. `{OWNER} - {PIN}`. |
| Fields | All | (Customize) Which attribute fields show in the result body. Supports per-field alias overrides. |
| Content template | Blank | (Custom template) Markdown layout with `{FIELD}` tokens and a live preview. |
| Expand by default | Off | Result cards load expanded instead of collapsed. Best for small result sets. |
| Zoom to selected | On | Shows the "Zoom to selected" button in the results toolbar. Turn off for non-spatial tables. |

### Filters & suggestions

| Setting (panel label) | Default | What it does |
|---|---|---|
| Attribute filter | — | The SQL/field search for this query (same as Esri's Query widget). |
| Spatial filter | — | The spatial search options (same as Esri's Query widget). |
| Typeahead suggestions | Off | Real-time value suggestions as the user types in a free-form input. Per query. |
| Minimum characters | 2 | (Typeahead) Characters typed before suggestions appear (1–10). |
| Max suggestions | 10 | (Typeahead) Most suggestions shown in the dropdown (1–50). |
| Spatial only | Off | Hides this query from the Query tab; it only participates in Spatial tab queries (reference layers like Zoning, Wetlands). |

---

## HelperSimple settings

HelperSimple watches the URL so `#shortid=VALUE` parameters trigger QuerySimple queries.
It has no visible UI — place it anywhere on the page. Open its settings panel:

| Setting (panel label) | Default | What it does |
|---|---|---|
| Select widget | None | The QuerySimple widget this helper manages. Only QuerySimple widgets that have queries with Short IDs appear here. |

**One HelperSimple per QuerySimple.** If a page has multiple QuerySimple widgets that
need URL-driven search, add a separate HelperSimple for each.

---

## Runtime behaviors (not panel settings)

These are controlled by the user at runtime, not configured in the settings panel.
Listed here so the picture is complete.

| Feature | Where | What it does |
|---|---|---|
| Results mode (New / Add / Remove) | Top of the Query tab | New replaces results (default), Add accumulates, Remove subtracts. |
| Export (CSV / GeoJSON / JSON) | Results toolbar three-dot menu | Download current results (enabled whenever there are records). CSV/JSON are attributes only; GeoJSON includes geometry. |
| Duplicate query | Query list, in settings | Clones a query with all its settings. |

---

## Troubleshooting (admin power-user)

Append these to the app URL to trace behavior in the browser console:

| Parameter | Traces |
|---|---|
| `?debug=SETTINGS` | Which config values the widget reads at runtime. |
| `?debug=SUGGEST` | Typeahead detection, query WHERE clauses, and result counts. |

---

*Companion to `QUERYSIMPLE_CONFIGURATION_GUIDE.md`. Defaults reflect r028.131.*
