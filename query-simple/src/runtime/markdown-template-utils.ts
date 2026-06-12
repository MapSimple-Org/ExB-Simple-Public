/**
 * QuerySimple-specific template utilities.
 *
 * The core Markdown-to-HTML converter and token substitution engine live in
 * shared-code/mapsimple-common. This file re-exports them and provides
 * QS-specific preview/extraction functions using {{fieldName}} token syntax.
 *
 * r026.001: Core converter extracted to shared-code
 * r026.002: Switched from {field} to {{field}} syntax, added pipe filter support
 */

import { convertTemplateToHtml } from '../../../shared-code/mapsimple-common'

// Re-export so existing QS imports don't break
export { convertTemplateToHtml }

// ── QS-specific regex (now matches {{field}} with optional filters) ──

const RE_PREVIEW_TOKEN = /\{\{(\s*[\w.@[\]]+\s*)(?:\|\s*(?:"([^"]+)"|(\w+))\s*)?\}\}/g
const RE_EXTRACT_TOKEN = /\{\{(\s*[\w.@[\]]+\s*)(?:\|[^}]*)?\}\}/g

/**
 * Render a Markdown template as HTML for the settings preview panel.
 * Replaces {{fieldName}} and {{fieldName | filter}} tokens with styled badge
 * spans instead of leaving them for runtime substitution.
 */
export function renderPreview (markdown: string): string {
  if (!markdown) return '<p style="color: var(--ref-palette-neutral-700); font-style: italic;">Enter a template above to see a preview</p>'

  // First convert Markdown to HTML
  const html = convertTemplateToHtml(markdown)

  // Replace {{fieldName}} and {{fieldName | filter}} tokens with styled badges
  return html.replace(
    RE_PREVIEW_TOKEN,
    (_match, fieldName: string, quotedArg?: string, filterName?: string) => {
      const name = fieldName.trim()
      const filter = quotedArg ? `| "${quotedArg}"` : filterName ? `| ${filterName}` : ''
      const label = filter ? `${name} ${filter}` : name
      return `<span style="display: inline-block; padding: 1px 6px; margin: 0 2px; border-radius: 3px; background-color: var(--sys-color-primary-light); color: var(--sys-color-primary-dark); font-family: monospace; font-size: 0.85em;">${label}</span>`
    }
  )
}

/**
 * Extract field names referenced in a template string via {{fieldName}} tokens.
 * Strips any pipe filters — returns only the field name portion.
 * Used by combineFields to ensure the query requests all needed fields.
 */
export function extractFieldTokens (template: string): string[] {
  if (!template) return []
  const regex = new RegExp(RE_EXTRACT_TOKEN.source, RE_EXTRACT_TOKEN.flags)
  const fields: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    fields.push(match[1].trim())
  }
  return fields
}

/**
 * r028.134: Flatten markdown to plain text for screen-reader descriptions
 * (TAB_HELP_SPEC Phase 2). Converts through the real engine and strips the
 * tags, so the SR text always tracks exactly what the popover renders.
 */
export function stripMarkdownToText (markdown: string): string {
  if (!markdown) return ''
  return convertTemplateToHtml(markdown)
    // Block boundaries become spaces so adjacent blocks don't fuse words;
    // inline tags (<strong>, <em>, ...) are deleted outright so no stray
    // space lands before punctuation.
    .replace(/<\/(p|li|ul|ol|h[1-6]|tr|td|th|table|div)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
