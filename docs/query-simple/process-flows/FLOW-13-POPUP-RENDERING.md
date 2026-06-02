# FLOW-13: Popup Rendering

## Overview

Popup content rendering for query results across three display contexts:
on-screen map click (Path 3 FeatureLayer), result-list card click, and
Results Panel card. All three contexts route through a single shared
rendering function (`renderPopupContent`) to guarantee consistent output.

**Key files:**
- `query-simple/src/runtime/popup-render-utils.ts` — shared rendering function (r028.043)
- `query-simple/src/runtime/result-feature-layer-popup.ts` — on-screen popup integration (Path 3)
- `query-simple/src/runtime/query-result.tsx` — result-list click popup (`openPopupForRecord`)
- `query-simple/src/runtime/query-result-item.tsx` — Results Panel card rendering

---

## The Problem This Solves

Before r028.043, three separate implementations rendered popup content
independently. Each had its own copy of mode detection, token substitution,
and HTML generation logic. When one was updated, the others could drift.
The on-screen popup (Path 3) had an additional bug: it read `QUERY_CONFIG_ID`
from the lean 4-field graphic, and when that value was empty, it fell through
to a generic field table instead of the configured CustomTemplate.

---

## Rendering Modes

The query config's `resultFieldsType` determines which rendering mode is used:

| Mode | Config Value | Source | Rendering |
|------|-------------|--------|-----------|
| CustomTemplate | `resultFieldsType: 'CustomTemplate'` | `resultContentExpression` | `{{field}}` token substitution + markdown to HTML |
| SelectAttributes | `resultFieldsType: 'SelectAttributes'` | `resultDisplayFields` | Markdown field table: alias labels + formatted values (r028.110) |
| PopupSetting | `resultFieldsType: 'PopupSetting'` | Source layer `popupTemplate` | Rebuilt from web map popup config (fields/text) |
| AllAttributesFallback | (none of the above) | Record attributes | All non-internal fields as markdown table |

**r028.110–112 — field-table unification (Option 3).** SelectAttributes,
PopupSetting, and AllAttributesFallback no longer emit hand-built HTML. They build
a headerless striped **Markdown** table (label + value) and render it through the
same `convertTemplateToHtml` engine CustomTemplate uses, so every mode shares one
renderer. Labels use the field **alias**; values are display-formatted by
`value-formatter.ts` (see below). The result **card** (`query-result-item.tsx`)
and the **card-click popup** (`query-result.tsx`) route SelectAttributes through
this same path too, so card == on-map popup == card-click popup by construction.
PopupSetting / web-map popups (which may carry media, charts, attachments) still
fall through to Esri `FeatureInfo` on the card.

---

## Shared Rendering Function

`popup-render-utils.ts` exports three functions:

| Function | Purpose |
|----------|---------|
| `renderPopupContent(attributes, queryConfig, sourcePopupTemplate?, fieldMeta?)` | Returns `{ title, contentHtml, mode }`. `fieldMeta` (r028.110) supplies alias/type/domain for field-table modes. r028.117: merges `queryConfig.resultFieldAliases` (admin per-field label overrides) into `fieldMeta` at the top, so all three render paths inherit them via `meta.alias ?? name` |
| `resolvePopupTitle(attributes, queryConfig, sourcePopupTemplate?)` | Title-only resolution (same priority chain). Handles BOTH `{{double}}` and `{single}` brace tokens |
| `createPopupContentDiv(html)` | Wraps HTML in a styled DOM div for JSAPI popup display |

**Field-table value formatting (`value-formatter.ts`, r028.109):** for the table
modes, each value is formatted by field type before going into the Markdown cell —
coded-value **domain decode** (code → label), **dates** via Esri's public
`@arcgis/core/intl.formatDate` (takes epoch-ms directly; default
`short-date-short-time`), **numbers** via `intl.formatNumber` (`oid` excluded),
strings raw. `fieldMeta` (name → {alias, type, domain}) is built by
`buildFieldMetaMap` from the loaded layer's `fields`. On the on-map popup it is
captured at `registerRecords` time (the live layer is gone by popup-open); on the
card and card-click popup it is read from the record's stamped `feature.layer.fields`.

**Cell safety (`escapeMarkdownCell`):** `convertTemplateToHtml`'s table parser does
no backslash-escaping and no HTML-escaping, so field values are entity-encoded
(`& < > " | * _ \` [ ]`) before insertion — a raw `|` would split the cell, raw HTML
would inject. Entities render as the literal glyph.

**Why this fixed the `}` title bug:** the result card previously rendered its title
via Esri `FeatureInfo`, which only understands single-brace `{field}`; a configured
double-brace title like `{{ActivityID}}` rendered as a bare `}`. Routing the card
through `resolvePopupTitle` (which runs both brace styles) resolves it correctly.

**Title resolution priority:**
1. `queryConfig.resultTitleExpression` (CustomTemplate or SelectAttributes)
2. `sourcePopupTemplate.title` (PopupSetting)
3. `queryConfig.searchAlias || queryConfig.name || 'Query Result'` (fallback)

**Content pipeline (CustomTemplate):**
```
resultContentExpression
      |
      v
substituteTokens(template, attributes)      <- shared-code/token-renderer.ts
      |
      v
substituteLegacyTokens(substituted, attrs)  <- shared-code/token-renderer.ts
      |
      v
convertTemplateToHtml(substituted)           <- shared-code/markdown-template-utils.ts
      |
      v
HTML string
```

---

## Flow Diagram: Three Popup Contexts

```
                    +---------------------------+
                    |  Query result record with  |
                    |  full attributes +         |
                    |  __queryConfigId            |
                    +---------------------------+
                               |
              +----------------+----------------+
              |                |                |
              v                v                v
     ON-SCREEN CLICK    CARD CLICK       RESULTS PANEL
     (Path 3 only)      (all paths)      (all paths)
              |                |                |
              v                v                v
  result-feature-      query-result.tsx   query-result-item.tsx
  layer-popup.ts       openPopupForRecord  dangerouslySetInnerHTML
              |                |                |
              |   +------------+                |
              |   |                             |
              v   v                             |
  +-----------+-----------+                     |
  | Look up queryConfig   |                     |
  | by configId           |                     |
  +-----------+-----------+                     |
              |                                 |
              v                                 |
  +-----------+-----------+     +---------------+
  |  renderPopupContent() |     | (uses rawTemplate
  |  popup-render-utils.ts|     |  from cached
  +-----+---------+-------+     |  getPopupTemplate)
        |         |             |
        v         v             |
    { title,   { contentHtml,   |
      mode }     mode }         |
        |         |             |
        v         v             v
  +-----+---------+-------+  +-+---------------+
  | createPopupContentDiv |  | React render via |
  | (DOM div + style tag) |  | dangerouslySet-  |
  +-----------+-----------+  | InnerHTML        |
              |              +--------+---------+
              v                       |
  mapView.openPopup({          Panel card display
    title, content,            (same HTML output)
    location, ...
  })
```

---

## On-Screen Click Detail (Path 3)

The on-screen popup uses JSAPI's native popup routing. The FeatureLayer
has a `PopupTemplate` with a `CustomContent` creator that fires when
JSAPI renders the popup.

```
 User clicks Path 3 feature on map
      |
      v
 JSAPI popup routing invokes PopupTemplate
      |
      +-- titleFn(feature)            <- result-feature-layer-popup.ts
      |   |
      |   +-- Read COMPOSITE_KEY + QUERY_CONFIG_ID from lean graphic
      |   +-- Join back to record via _recordsByWidget registry
      |   +-- Get full attributes from record
      |   +-- effectiveConfigId = graphicConfigId     (r028.043)
      |   |                    || attributes.__queryConfigId
      |   |                    || ''
      |   +-- Find queryConfig by effectiveConfigId
      |   +-- resolvePopupTitle(attrs, queryConfig, sourcePopupTemplate)
      |   +-- Return title string
      |
      +-- CustomContent.creator(event)
          |
          +-- Read COMPOSITE_KEY + QUERY_CONFIG_ID from lean graphic
          +-- Join back to record via _recordsByWidget registry
          |   (record not found? -> "Record no longer available")
          +-- Dispatch QUERYSIMPLE_POPUP_FEATURE_IDENTIFIED event
          |   (triggers card scroll/flash in Results Panel)
          +-- Get full attributes from record
          +-- effectiveConfigId = graphicConfigId     (r028.043)
          |                    || attributes.__queryConfigId
          |                    || ''
          +-- Find queryConfig by effectiveConfigId
          +-- Get sourcePopupTemplate from record's source layer
          +-- renderPopupContent(attrs, queryConfig, sourcePopupTemplate)
          +-- createPopupContentDiv(result.contentHtml)
          +-- Return styled div to JSAPI
```

### ConfigId Fallback (r028.043)

The lean 4-field graphic carries `QUERY_CONFIG_ID`, which is set from
`record.feature.attributes.__queryConfigId` at add time. If `__queryConfigId`
was not stamped on the record during query execution, the graphic's
`QUERY_CONFIG_ID` will be empty.

Before r028.043, an empty `QUERY_CONFIG_ID` caused the config lookup to
fail, bypassing CustomTemplate/SelectAttributes and falling through to
the generic field table. The fix: after joining back to the full record,
use `attributes.__queryConfigId` as a fallback.

```
effectiveConfigId = graphic.QUERY_CONFIG_ID    // lean graphic field
                 || attributes.__queryConfigId  // full record attribute
                 || ''                          // final fallback
```

### Stamping Order (r028.046)

`__queryConfigId` and `__originDSId` are stamped on each record's
feature attributes by `query-execution-handler.ts` during Add and New
mode execution. Before r028.046, the stamping loop ran AFTER
`onAccumulatedRecordsChange()`, so the first sync cycle in
`syncResultFeatureLayers` would read empty `__queryConfigId` values
and produce malformed composite keys (e.g. `||12345` instead of
`configA||12345`). This broke flash/scroll for alternate data sources
because the popup-feature-identified event dispatched a key that did
not match any card's `data-composite-key`.

The fix reorders the stamping to run BEFORE `onAccumulatedRecordsChange()`.
No new logic; pure reorder of existing code blocks in both Add and New
mode branches.

---

## Result-List Click Detail

When the user clicks a result card, `openPopupForRecord()` in
`query-result.tsx` opens a popup at the feature's location.

```
 User clicks result card
      |
      v
 openPopupForRecord(record)         <- query-result.tsx
      |
      +-- Get feature + geometry from record
      +-- Calculate popup location (labelPointOperator)
      +-- Apply mobile popup behavior
      +-- Read __queryConfigId from feature attributes
      +-- Find queryConfig by configId
      |
      +-- CustomTemplate?
      |   |
      |   +-- YES:
      |   |   renderPopupContent(attributes, recordConfig)
      |   |   createPopupContentDiv(result.contentHtml)
      |   |   mapView.openPopup({ title, content: div })
      |   |
      |   +-- NO:
      |       mapView.openPopup({ features: [clickedFeature] })
      |       (JSAPI renders with layer's native PopupTemplate)
      |
      v
 Popup displayed on map
```

**Why the split?** For non-CustomTemplate modes, the original feature
carries the source layer's full `PopupTemplate`. Passing it directly to
JSAPI via `features: [...]` gives richer rendering (field formatting,
coded value domains, media) than our field table. For CustomTemplate,
JSAPI has no knowledge of our markdown pipeline, so we must render it.

---

## Results Panel Card Detail

The Results Panel card in `query-result-item.tsx` uses a cached popup
template from `getPopupTemplate()` (via `simple-list.tsx`). CustomTemplate and
SelectAttributes both render inline with `dangerouslySetInnerHTML`; PopupSetting /
web-map popups fall through to Esri `FeatureInfo`:

```
 simple-list.tsx caches popup templates per __queryConfigId
      |
      +-- getPopupTemplate(outputDS, queryConfig, originDSOverride)
      |   Returns { popupTemplate, isCustomTemplate, rawTemplate, isSelectAttributes }
      |
      v
 query-result-item.tsx receives props
      |
      +-- isCustomTemplate && rawTemplate?
      |   |
      |   +-- YES: substituteTokens → substituteLegacyTokens → convertTemplateToHtml
      |           <div dangerouslySetInnerHTML={{ __html: html }} />
      |
      +-- isSelectAttributes? (r028.111)
      |   |
      |   +-- YES: renderPopupContent(attributes, {SelectAttributes, displayFields,
      |           title}, undefined, fieldMeta)  — SAME fn as the on-map popup.
      |           fieldMeta from data.feature.layer.fields. <div dangerouslySetInnerHTML />
      |
      +-- NO (PopupSetting / web-map popup):
              <FeatureInfo graphic={...} popupTemplate={...} />
              (Esri Feature widget handles rendering — media/charts/attachments)
```

**r028.111:** The card now calls `renderPopupContent()` directly for
SelectAttributes (and the all-fields fallback), so card == on-map popup. Only the
CustomTemplate branch still substitutes inline (it predates the shared fn and the
DOM/Emotion wrapper differs). PopupSetting stays on `FeatureInfo` by design.

---

## Two Registries (Module-Level)

The on-screen popup creator operates outside the React tree, so it
reads from two module-level registries that stay current via explicit
register/unregister calls from the sync module:

| Registry | Key | Value | Updated by |
|----------|-----|-------|------------|
| `_recordsByWidget` | `widgetId -> (compositeKey -> SlimPopupRecord)` | Slim record: `attributes` + `sourcePopupTemplate` + `fieldMeta` (r028.047 slimmed; r028.110 added fieldMeta) | `registerRecords()` / `unregisterRecords()` / `clearRecordRegistry()` |
| `_queryConfigsByWidget` | `widgetId -> queryConfig[]` | Query configs for mode detection | `setQueryConfigs()` from React component |

---

## Test Coverage

| Test File | Tests | Covers |
|-----------|-------|--------|
| `result-feature-layer-popup.test.ts` | 40 | Creator routing, title resolution, field tables, registries, alias/formatting/escaping (r028.110) |
| `popup-render-utils.test.ts` | 11 | `renderPopupContent`/`resolvePopupTitle` direct: brace-style titles, aliases, formatting, escaping (r028.111), per-field alias override (r028.117) |
| `value-formatter.test.ts` | 22 | Domain decode, date/number via Esri intl, oid exclusion, meta mapping (r028.109) |
| `query-result.test.tsx` | 1 | Sticky expansion (popup covered by popup.test.ts) |

---

## CSS Constant

The popup content CSS is defined once in `popup-render-utils.ts` as
`POPUP_CONTENT_CSS` and used by `createPopupContentDiv()`. This covers
paragraph spacing, link colors, heading styles, and emphasis rendering
for markdown output in the JSAPI popup container.

---

*Last updated: r028.118 (2026-06-02) -- field-table render backend current through the r028.117 per-field alias override; no render change in r028.118 (that was the Spatial Draw include-results feature, see FLOW-09/10/11).*
