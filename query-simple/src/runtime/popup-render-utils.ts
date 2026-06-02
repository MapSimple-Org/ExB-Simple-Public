/**
 * Shared popup rendering utilities for QuerySimple.
 *
 * Single source of truth for rendering popup content across all display
 * contexts: on-screen map click popups (Path 3 FeatureLayer), result-list
 * click popups, and Results Panel cards. All paths route through
 * renderPopupContent() to guarantee consistent output.
 *
 * Returns HTML strings so callers can use them in both DOM (innerHTML)
 * and React (dangerouslySetInnerHTML) contexts. Container styling is
 * the caller's responsibility; this module handles content only.
 *
 * r028.043
 */

import {
  substituteTokens,
  substituteLegacyTokens,
  convertTemplateToHtml
} from 'widgets/shared-code/mapsimple-common'
import { formatFieldValue, type FieldMeta } from './value-formatter'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PopupRenderMode =
  | 'CustomTemplate'
  | 'SelectAttributes'
  | 'PopupSetting'
  | 'AllAttributesFallback'

export interface PopupRenderResult {
  /** Resolved title string (tokens substituted, plain text). */
  title: string
  /** Rendered content as an HTML string. */
  contentHtml: string
  /** Which rendering mode was used (for logging/debugging). */
  mode: PopupRenderMode
}

// ---------------------------------------------------------------------------
// CSS constant for popup content containers
// ---------------------------------------------------------------------------

/**
 * Shared CSS rules injected into popup content divs. Covers markdown
 * output (paragraphs, links, headings, emphasis) in a compact style
 * that matches Esri's popup sizing.
 */
export const POPUP_CONTENT_CSS =
  'p{margin:0 0 4px}' +
  'a{color:var(--sys-color-primary-main, #0079c1);text-decoration:none}' +
  'a:hover{text-decoration:underline}' +
  'strong{font-weight:700}' +
  'em{font-style:italic}' +
  'h3,h4,h5,h6{font-style:normal;font-weight:600;margin:0 0 4px}'

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Render popup content for a query result record.
 *
 * Given a record's full attributes, its query configuration, and optionally
 * the source layer's popupTemplate, determines the correct rendering mode
 * and produces title + content HTML.
 *
 * @param attributes          Full attributes from the original FeatureDataRecord
 * @param queryConfig         Query configuration object (may be undefined)
 * @param sourcePopupTemplate Source layer's popupTemplate (for PopupSetting mode)
 * @param fieldMeta           r028.110: name -> {alias,type,domain} from the layer
 *                            schema. Drives alias labels + value formatting in the
 *                            field-table modes (SelectAttributes / PopupSetting /
 *                            AllAttributesFallback). Optional — falls back to field
 *                            name + raw value when absent.
 */
export function renderPopupContent (
  attributes: Record<string, any>,
  queryConfig: any | undefined,
  sourcePopupTemplate?: any,
  fieldMeta?: Record<string, FieldMeta>
): PopupRenderResult {
  const fieldsType = queryConfig?.resultFieldsType

  // r028.117 (Phase 2.1): apply admin-configured per-field alias overrides on top
  // of the schema-derived fieldMeta. Done once here so all three render paths
  // (on-map popup, result card, card-click popup) inherit it — the field-table
  // builders already resolve labels via meta.alias ?? name, so a merged alias just
  // works. Non-empty config aliases win; absent/blank fall back to the schema alias.
  const aliasOverrides = queryConfig?.resultFieldAliases as Record<string, string> | undefined
  if (aliasOverrides && Object.keys(aliasOverrides).length > 0) {
    // Merge over the UNION of existing meta keys and alias keys, and don't require
    // fieldMeta to exist: the card-click path can arrive with thin/empty fieldMeta
    // (layer.fields not populated), but the config still carries the overrides — so
    // an alias must apply even for a field with no schema meta entry. Blank/whitespace
    // overrides are ignored (fall back to schema alias / field name downstream).
    const merged: Record<string, FieldMeta> = { ...(fieldMeta || {}) }
    for (const key of Object.keys(aliasOverrides)) {
      const override = aliasOverrides[key]?.trim()
      if (override) {
        merged[key] = { ...(merged[key] || { name: key }), alias: override }
      }
    }
    fieldMeta = merged
  }

  // CustomTemplate: widget-configured markdown template with {{field}} tokens
  if (fieldsType === 'CustomTemplate') {
    const contentTemplate = queryConfig.resultContentExpression || ''
    if (contentTemplate) {
      return {
        title: resolvePopupTitle(attributes, queryConfig, sourcePopupTemplate),
        contentHtml: renderCustomTemplateHtml(contentTemplate, attributes),
        mode: 'CustomTemplate'
      }
    }
  }

  // SelectAttributes: explicit field list from widget settings
  if (fieldsType === 'SelectAttributes' && queryConfig?.resultDisplayFields) {
    const fieldsToShow = queryConfig.resultDisplayFields
      .map((f: any) => typeof f === 'string' ? f : f.jimuName || f.name)
      .filter(Boolean)
    return {
      title: resolvePopupTitle(attributes, queryConfig, sourcePopupTemplate),
      contentHtml: renderFieldTableHtml(attributes, fieldsToShow, fieldMeta),
      mode: 'SelectAttributes'
    }
  }

  // PopupSetting: use the source web map layer's configured popupTemplate
  if (sourcePopupTemplate) {
    return {
      title: resolvePopupTitle(attributes, queryConfig, sourcePopupTemplate),
      contentHtml: renderSourceTemplateHtml(sourcePopupTemplate, attributes, fieldMeta),
      mode: 'PopupSetting'
    }
  }

  // AllAttributesFallback: show all non-internal fields
  const allFields = Object.keys(attributes).filter(k =>
    !k.startsWith('__') && k !== 'OBJECTID' && k !== 'Shape'
  )
  return {
    title: resolvePopupTitle(attributes, queryConfig, sourcePopupTemplate),
    contentHtml: renderFieldTableHtml(attributes, allFields, fieldMeta),
    mode: 'AllAttributesFallback'
  }
}

// ---------------------------------------------------------------------------
// Title resolution
// ---------------------------------------------------------------------------

/**
 * Resolve the popup title from the best available source.
 * Priority: queryConfig title expression > source template title > fallback name.
 */
export function resolvePopupTitle (
  attributes: Record<string, any>,
  queryConfig: any | undefined,
  sourcePopupTemplate?: any
): string {
  // CustomTemplate or SelectAttributes with a title expression
  const titleTemplate = queryConfig?.resultTitleExpression
  if (titleTemplate) {
    let resolved = substituteTokens(titleTemplate, attributes)
    resolved = substituteLegacyTokens(resolved, attributes)
    return resolved
  }

  // PopupSetting: pull title from source layer's popupTemplate
  if (sourcePopupTemplate) {
    const sourceTitle = sourcePopupTemplate.title
    if (typeof sourceTitle === 'string' && sourceTitle.trim()) {
      let resolved = substituteTokens(sourceTitle, attributes)
      resolved = substituteLegacyTokens(resolved, attributes)
      return resolved
    }
  }

  // Fallback to query name
  return queryConfig?.searchAlias || queryConfig?.name || 'Query Result'
}

// ---------------------------------------------------------------------------
// DOM helper
// ---------------------------------------------------------------------------

/**
 * Wrap rendered HTML in a styled div element for JSAPI popup display.
 * Both on-screen and result-list popups use this to build the content
 * DOM node that gets passed to mapView.openPopup().
 */
export function createPopupContentDiv (html: string): HTMLDivElement {
  const div = document.createElement('div')
  div.style.fontSize = '0.875rem'
  div.style.lineHeight = '1.4'
  div.style.color = 'var(--sys-color-surface-paper-text, #333)'
  const style = document.createElement('style')
  style.textContent = POPUP_CONTENT_CSS
  div.appendChild(style)
  div.innerHTML += html
  return div
}

// ---------------------------------------------------------------------------
// Content renderers (return HTML strings)
// ---------------------------------------------------------------------------

/**
 * Render CustomTemplate content: token substitution + markdown to HTML.
 */
function renderCustomTemplateHtml (
  contentTemplate: string,
  attributes: Record<string, any>
): string {
  let substituted = substituteTokens(contentTemplate, attributes)
  substituted = substituteLegacyTokens(substituted, attributes)
  return convertTemplateToHtml(substituted)
}

/**
 * Render a field name/value table as an HTML string.
 *
 * r028.110: Builds a striped Markdown table (label | value) and renders it via
 * the shared convertTemplateToHtml engine, so the popup table looks and renders
 * exactly like the result card (Option 3 unification). Labels use the field's
 * alias (from fieldMeta) and values are display-formatted (dates, numbers,
 * coded domains) by value-formatter. Field values are treated as inert data —
 * escapeMarkdownCell neutralizes HTML, pipes, and Markdown emphasis so a value
 * can neither break the table nor inject markup.
 */
function renderFieldTableHtml (
  attributes: Record<string, any>,
  fields: string[],
  fieldMeta?: Record<string, FieldMeta>
): string {
  const rows = fields
    .filter(field => attributes[field] != null)
    .map(field => {
      const meta = fieldMeta?.[field]
      return {
        label: meta?.alias || field,
        value: formatFieldValue(attributes[field], meta)
      }
    })

  if (rows.length === 0) {
    return '<span style="color:#999;font-style:italic">No fields to display</span>'
  }

  return convertTemplateToHtml(buildFieldTableMarkdown(rows))
}

/**
 * Render content from a source popupTemplate against attributes.
 * Handles common content types: fields, text, top-level string.
 * Other types (media, attachments, expression) are noted but skipped.
 */
function renderSourceTemplateHtml (
  sourceTemplate: any,
  attributes: Record<string, any>,
  fieldMeta?: Record<string, FieldMeta>
): string {
  const content = sourceTemplate?.content
  const fieldInfos = sourceTemplate?.fieldInfos

  // Top-level string content
  if (typeof content === 'string') {
    let substituted = substituteTokens(content, attributes)
    substituted = substituteLegacyTokens(substituted, attributes)
    return convertTemplateToHtml(substituted)
  }

  // Non-array (function or unknown): fall back to fieldInfos
  if (!Array.isArray(content)) {
    if (Array.isArray(fieldInfos) && fieldInfos.length > 0) {
      return renderFieldInfosTableHtml(fieldInfos, attributes, fieldMeta)
    }
    return '<span style="color:#999;font-style:italic">(unsupported popup content type)</span>'
  }

  // Array of content elements
  const parts: string[] = []
  for (const item of content) {
    const type = item?.type
    if (type === 'fields') {
      const infos = item.fieldInfos || fieldInfos
      if (Array.isArray(infos) && infos.length > 0) {
        parts.push(renderFieldInfosTableHtml(infos, attributes, fieldMeta))
      }
    } else if (type === 'text') {
      const text = item?.text || ''
      let substituted = substituteTokens(text, attributes)
      substituted = substituteLegacyTokens(substituted, attributes)
      parts.push(convertTemplateToHtml(substituted))
    } else if (type) {
      parts.push(`<div style="color:#999;font-style:italic">(${escapeHtml(type)} content not rendered)</div>`)
    }
  }

  return parts.join('')
}

/**
 * Build a fields table from popupTemplate.fieldInfos, honoring visibility flags
 * and label overrides.
 *
 * r028.110: Renders via the shared Markdown table engine (same as the card).
 * The fieldInfo's own label wins (it is the web map author's chosen label);
 * otherwise the schema alias, then the field name. Values are display-formatted
 * via value-formatter (fieldMeta supplies type/domain).
 */
function renderFieldInfosTableHtml (
  fieldInfos: any[],
  attributes: Record<string, any>,
  fieldMeta?: Record<string, FieldMeta>
): string {
  const rows = fieldInfos
    .filter(info => info?.visible !== false && info?.fieldName)
    .filter(info => attributes[info.fieldName] != null)
    .map(info => {
      const meta = fieldMeta?.[info.fieldName]
      return {
        label: info.label || meta?.alias || info.fieldName,
        value: formatFieldValue(attributes[info.fieldName], meta)
      }
    })

  if (rows.length === 0) {
    return '<span style="color:#999;font-style:italic">No fields to display</span>'
  }

  return convertTemplateToHtml(buildFieldTableMarkdown(rows))
}

// ---------------------------------------------------------------------------
// Field-table Markdown builder
// ---------------------------------------------------------------------------

/**
 * Build a headerless 2-column Markdown table (label | value) for the shared
 * convertTemplateToHtml engine. Headerless = separator row first, so no <thead>;
 * the engine applies its default striped styling (matches the result card and
 * the SR-799 reference).
 *
 * Cells are sanitized with escapeMarkdownCell: field values are inert data, so
 * we neutralize the pipe (would split the cell / break the table) and Markdown
 * emphasis/link characters (would render data as markup). Labels get the same
 * treatment for safety.
 */
function buildFieldTableMarkdown (rows: Array<{ label: string, value: string }>): string {
  const lines = ['| --- | --- |']
  for (const { label, value } of rows) {
    lines.push(`| ${escapeMarkdownCell(label)} | ${escapeMarkdownCell(value)} |`)
  }
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Neutralize a value for safe use inside a Markdown table cell.
 *
 * convertTemplateToHtml's table parser splits cells on a raw `|` (no
 * backslash-escape support) and its inline formatter does NOT HTML-escape, so
 * a value reaches innerHTML as-is. We therefore HTML-entity-encode every
 * character that could either break the table or be reinterpreted as markup:
 *   - `& < > "`   → XSS-significant HTML
 *   - `|`         → would split the cell / break the row
 *   - `* _ \` [ ]` → Markdown emphasis / code / link/image syntax
 * Entities pass through the engine untouched and render as the literal glyph.
 * Newlines collapse to spaces (a literal newline ends the table block).
 */
const MD_CELL_ENTITIES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  '|': '&#124;', '*': '&#42;', _: '&#95;', '`': '&#96;', '[': '&#91;', ']': '&#93;'
}
function escapeMarkdownCell (str: string): string {
  return String(str)
    .replace(/\r?\n/g, ' ')
    .replace(/[&<>"|*_`[\]]/g, ch => MD_CELL_ENTITIES[ch])
}

/** Escape HTML special characters to prevent XSS in generated markup. */
function escapeHtml (str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
