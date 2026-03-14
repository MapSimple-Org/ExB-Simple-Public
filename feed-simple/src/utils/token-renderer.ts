/**
 * Token substitution engine for feed item templates.
 *
 * Supports:
 *   {{fieldName}}                — basic substitution
 *   {{field.nested.path}}        — dot-path substitution for nested XML
 *   {{field.@attr}}              — XML attribute substitution
 *   {{field[0]}}                 — array element substitution
 *   {{fieldName | "MMM D, YYYY"}} — date formatting filter
 *   {{fieldName | autolink}}     — convert plain-text URLs to <a> tags
 *   {{fieldName | externalLink}} — render link using externalLinkTemplate
 */

import type { FeedItem } from './parsers/interface'

/**
 * Context values passed from widget config so the renderer stays pure
 * (no config imports).
 */
export interface FilterContext {
  /** URL template with {{token}} substitution for external links */
  externalLinkTemplate?: string
  /** Global date format string (fallback when no inline format is given) */
  dateFormatString?: string
}

// ── Regex ────────────────────────────────────────────────────────

/**
 * Matches tokens with optional filter:
 *   {{field}}               — group 1 = field
 *   {{field.nested.path}}   — group 1 = field (dot paths supported)
 *   {{field.@attr}}         — group 1 = field (@ for XML attributes)
 *   {{field[0]}}            — group 1 = field ([] for array indices)
 *   {{field | "format"}}    — group 1 = field, group 2 = quoted arg
 *   {{field | filterName}}  — group 1 = field, group 3 = filter name
 */
const TOKEN_REGEX = /\{\{(\s*[\w.@\[\]]+\s*)(?:\|\s*(?:"([^"]+)"|(\w+))\s*)?\}\}/g

// ── Public API ───────────────────────────────────────────────────

/**
 * Substitute {{token}} placeholders in a template string with values from a
 * feed item. Optionally applies filters when the pipe syntax is used.
 * Unresolved tokens are replaced with an empty string.
 */
export function substituteTokens (
  template: string,
  item: FeedItem,
  ctx: FilterContext = {}
): string {
  if (!template) return ''

  return template.replace(TOKEN_REGEX, (_match, rawField: string, quotedArg: string | undefined, filterName: string | undefined) => {
    const key = rawField.trim()
    const value = item[key] ?? ''

    // No filter — plain substitution
    if (!quotedArg && !filterName) return value

    // Quoted argument → date format filter
    if (quotedArg) {
      return applyDateFilter(value, quotedArg)
    }

    // Named filter
    switch (filterName) {
      case 'autolink':
        return applyAutolinkFilter(value)
      case 'externalLink':
        return applyExternalLinkFilter(value, item, ctx.externalLinkTemplate)
      default:
        // Unknown filter — return raw value
        return value
    }
  })
}

// ── Filter implementations ───────────────────────────────────────

/**
 * Format a date string using a simple format pattern.
 * Supports: YYYY, YY, MMM, MM, M, D, DD, h, hh, mm, ss, A/a
 *
 * Falls back to the raw value if the date cannot be parsed.
 */
function applyDateFilter (value: string, formatString: string): string {
  if (!value) return ''
  const ts = Date.parse(value)
  if (isNaN(ts)) return value

  const d = new Date(ts)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const hours24 = d.getHours()
  const hours12 = hours24 % 12 || 12
  const ampm = hours24 < 12 ? 'AM' : 'PM'

  // Use placeholder tokens (\x00N\x00) so that replaced text doesn't get
  // consumed by subsequent regex passes (e.g. MMM → "Mar" then M eats the "M").
  const slots: string[] = []
  function slot (val: string): string {
    const idx = slots.length
    slots.push(val)
    return `\x00${idx}\x00`
  }

  let result = formatString
  result = result.replace(/YYYY/g, () => slot(String(d.getFullYear())))
  result = result.replace(/YY/g, () => slot(String(d.getFullYear()).slice(-2)))
  result = result.replace(/MMM/g, () => slot(monthNames[d.getMonth()]))
  result = result.replace(/MM/g, () => slot(String(d.getMonth() + 1).padStart(2, '0')))
  result = result.replace(/(?<!M)M(?!M)/g, () => slot(String(d.getMonth() + 1)))
  result = result.replace(/DD/g, () => slot(String(d.getDate()).padStart(2, '0')))
  result = result.replace(/(?<!D)D(?!D)/g, () => slot(String(d.getDate())))
  result = result.replace(/hh/g, () => slot(String(hours12).padStart(2, '0')))
  result = result.replace(/(?<!h)h(?!h)/g, () => slot(String(hours12)))
  result = result.replace(/mm/g, () => slot(String(d.getMinutes()).padStart(2, '0')))
  result = result.replace(/ss/g, () => slot(String(d.getSeconds()).padStart(2, '0')))
  result = result.replace(/A/g, () => slot(ampm))
  result = result.replace(/a/g, () => slot(ampm.toLowerCase()))

  // Swap placeholders back to actual values
  result = result.replace(/\x00(\d+)\x00/g, (_m, idx) => slots[Number(idx)])

  return result
}

/**
 * Convert plain-text URLs in a string to clickable <a> tags.
 * Handles http, https, and www. prefixed URLs.
 */
function applyAutolinkFilter (value: string): string {
  if (!value) return ''
  // Match URLs starting with http(s):// or www.
  return value.replace(
    /(?:https?:\/\/|www\.)[^\s<>"']+/gi,
    (url) => {
      const href = url.startsWith('www.') ? `https://${url}` : url
      return `<a href="${href}" target="_blank" rel="noopener">${url}</a>`
    }
  )
}

/**
 * Render a link using the externalLinkTemplate from config.
 * Substitutes all {{token}} references in the template with item values,
 * then wraps in an <a> tag.
 */
function applyExternalLinkFilter (
  _value: string,
  item: FeedItem,
  externalLinkTemplate: string | undefined
): string {
  if (!externalLinkTemplate) return _value

  // Substitute tokens in the URL template (plain substitution, no filters)
  const url = externalLinkTemplate.replace(
    /\{\{(\s*[\w.@\[\]]+\s*)\}\}/g,
    (_m, name: string) => item[name.trim()] ?? ''
  )

  return `<a href="${url}" target="_blank" rel="noopener">View ↗</a>`
}
