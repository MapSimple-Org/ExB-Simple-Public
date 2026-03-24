/**
 * Shared token substitution engine for MapSimple widget templates.
 * Used by QuerySimple, FeedSimple, and future widgets.
 *
 * Supports:
 *   {{fieldName}}                    — basic substitution
 *   {{fieldName | "MMM D, YYYY"}}    — date formatting filter (local timezone)
 *   {{fieldName | "YYYY-MM-DD HH:mm:ss (UTCZ)"}} — 24-hour local time with offset
 *   {{fieldName | autolink}}         — convert plain-text URLs to <a> tags
 *   {{fieldName | externalLink}}     — render link using externalLinkTemplate
 *
 * Math & formatting filters (chainable):
 *   {{field | /1000}}                — divide by 1000
 *   {{field | *0.001}}               — multiply by 0.001
 *   {{field | +10}}                  — add 10
 *   {{field | -5}}                   — subtract 5
 *   {{field | round:1}}             — round to 1 decimal place
 *   {{field | round}}               — round to integer (0 decimals)
 *   {{field | prefix:$}}            — prepend text
 *   {{field | suffix: km}}          — append text (leading space preserved)
 *   {{field | /1000 | round:1 | suffix: km}}  — chained: 2400m → "2.4 km"
 *
 * r026.002: Extracted from FeedSimple into shared-code for use by all widgets
 */

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

// ── Regex (hoisted to module scope for performance) ──────────────

/** Matches {{...}} tokens with pipe-based parsing */
const TOKEN_REGEX = /\{\{((?:(?!\}\}).)+)\}\}/g

/** Quoted filter argument: "MMM D, YYYY" */
const RE_QUOTED_FILTER = /^"([^"]+)"$/
/** Math operator filter: /N, *N, +N, -N */
const RE_MATH_FILTER = /^([/*+-])\s*(-?\d+(?:\.\d+)?)$/
/** Autolink: URLs starting with http(s):// or www. */
const RE_AUTOLINK = /(?:https?:\/\/|www\.)[^\s<>"']+/gi
/** External link token substitution */
const RE_EXTERNAL_LINK_TOKEN = /\{\{(\s*[\w.@[\]]+\s*)\}\}/g
/** Date format placeholder swap-back */
const RE_SLOT_PLACEHOLDER = /\x00(\d+)\x00/g

// Date format token patterns (order matters: longest prefix first)
const RE_DATE_YYYY = /YYYY/g
const RE_DATE_YY = /YY/g
const RE_DATE_MMM = /MMM/g
const RE_DATE_MM = /MM/g
const RE_DATE_M = /(?<!M)M(?!M)/g
const RE_DATE_DD = /DD/g
const RE_DATE_D = /(?<!D)D(?!D)/g
const RE_DATE_HH = /HH/g
const RE_DATE_H = /(?<!H)H(?!H)/g
const RE_DATE_hh = /hh/g
const RE_DATE_h = /(?<!h)h(?!h)/g
const RE_DATE_mm = /mm/g
const RE_DATE_ss = /ss/g
const RE_DATE_A = /A/g
const RE_DATE_a = /a/g
const RE_DATE_Z = /Z/g

// ── Public API ───────────────────────────────────────────────────

/**
 * Substitute {{token}} placeholders in a template string with values from an
 * item/record. Supports chained pipe filters for math, formatting, and text.
 * Unresolved tokens are replaced with an empty string.
 *
 * The item parameter accepts any Record<string, any> — values are coerced
 * to strings via String(value ?? '').
 */
export function substituteTokens (
  template: string,
  item: Record<string, any>,
  ctx: FilterContext = {}
): string {
  if (!template) return ''

  return template.replace(TOKEN_REGEX, (_match, inner: string) => {
    // Split by pipe, respecting quoted strings
    const segments = splitPipes(inner)
    if (segments.length === 0) return ''

    // First segment is the field name
    const key = segments[0].trim()
    const rawValue = item[key]
    let value: string = rawValue != null ? String(rawValue) : ''

    // No filters — plain substitution
    if (segments.length === 1) return value

    // Apply each filter in order
    for (let i = 1; i < segments.length; i++) {
      const filter = segments[i].trim()
      value = applyFilter(value, filter, item, ctx)
    }

    return value
  })
}

// ── Pipe Splitting ──────────────────────────────────────────────

/**
 * Split a token's inner content by `|` delimiters, but respect quoted strings.
 * `field | "MMM D, YYYY" | round:1` → ['field', '"MMM D, YYYY"', 'round:1']
 */
function splitPipes (inner: string): string[] {
  const segments: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      current += ch
    } else if (ch === '|' && !inQuotes) {
      segments.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  segments.push(current)
  return segments
}

// ── Filter Router ───────────────────────────────────────────────

/**
 * Route a single filter segment to the correct handler.
 * Supports: math operators, round, prefix, suffix, date, autolink, externalLink.
 */
function applyFilter (
  value: string,
  filter: string,
  item: Record<string, any>,
  ctx: FilterContext
): string {
  // Quoted argument → date format filter (legacy syntax)
  const quotedMatch = filter.match(RE_QUOTED_FILTER)
  if (quotedMatch) {
    return applyDateFilter(value, quotedMatch[1])
  }

  // Math operators: /N, *N, +N, -N
  const mathMatch = filter.match(RE_MATH_FILTER)
  if (mathMatch) {
    return applyMathOp(value, mathMatch[1], parseFloat(mathMatch[2]))
  }

  // Parameterized filters: name:arg
  const colonIdx = filter.indexOf(':')
  if (colonIdx > 0) {
    const name = filter.substring(0, colonIdx).trim()
    const arg = filter.substring(colonIdx + 1) // preserve leading space for suffix
    return applyNamedFilter(value, name, arg, item, ctx)
  }

  // Simple named filters (no arg)
  return applyNamedFilter(value, filter, undefined, item, ctx)
}

/**
 * Apply a named filter with an optional argument.
 */
function applyNamedFilter (
  value: string,
  name: string,
  arg: string | undefined,
  item: Record<string, any>,
  ctx: FilterContext
): string {
  switch (name) {
    case 'autolink':
      return applyAutolinkFilter(value)
    case 'externalLink':
      return applyExternalLinkFilter(value, item, ctx.externalLinkTemplate)
    case 'round':
      return applyRound(value, arg)
    case 'prefix':
      return (arg ?? '') + value
    case 'suffix':
      return value + (arg ?? '')
    case 'abs':
      return applyAbs(value)
    case 'toFixed':
      return applyRound(value, arg) // alias for round
    case 'upper':
      return value.toUpperCase()
    case 'lower':
      return value.toLowerCase()
    default:
      // Unknown filter — return value unchanged
      return value
  }
}

// ── Math Operations ─────────────────────────────────────────────

/**
 * Apply an arithmetic operator to a numeric value.
 * Returns the raw value if it's not a valid number.
 */
function applyMathOp (value: string, op: string, operand: number): string {
  const num = parseFloat(value)
  if (isNaN(num)) return value

  switch (op) {
    case '/': return operand !== 0 ? String(num / operand) : value
    case '*': return String(num * operand)
    case '+': return String(num + operand)
    case '-': return String(num - operand)
    default: return value
  }
}

/**
 * Round a numeric value to N decimal places.
 * Default: 0 decimals (integer).
 */
function applyRound (value: string, arg: string | undefined): string {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  const decimals = arg !== undefined ? parseInt(arg.trim(), 10) : 0
  if (isNaN(decimals) || decimals < 0) return value
  return num.toFixed(decimals)
}

/**
 * Return the absolute value.
 */
function applyAbs (value: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  return String(Math.abs(num))
}

// ── Filter implementations ───────────────────────────────────────

/**
 * Format a date string using a simple format pattern.
 * Supports: YYYY, YY, MMM, MM, M, D, DD, HH, H, hh, h, mm, ss, A/a, Z
 *
 * HH/H = 24-hour time (00–23 / 0–23)
 * hh/h = 12-hour time (01–12 / 1–12)
 * Z    = timezone offset (e.g. -07:00, +05:30)
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

  // Build timezone offset string: -07:00, +05:30, +00:00
  const tzOffset = d.getTimezoneOffset() // minutes, positive = west of UTC
  const tzSign = tzOffset <= 0 ? '+' : '-'
  const tzAbsMinutes = Math.abs(tzOffset)
  const tzHours = String(Math.floor(tzAbsMinutes / 60)).padStart(2, '0')
  const tzMins = String(tzAbsMinutes % 60).padStart(2, '0')
  const tzString = `${tzSign}${tzHours}:${tzMins}`

  // Use placeholder tokens (\x00N\x00) so that replaced text doesn't get
  // consumed by subsequent regex passes (e.g. MMM → "Mar" then M eats the "M").
  const slots: string[] = []
  function slot (val: string): string {
    const idx = slots.length
    slots.push(val)
    return `\x00${idx}\x00`
  }

  let result = formatString
  result = result.replace(RE_DATE_YYYY, () => slot(String(d.getFullYear())))
  result = result.replace(RE_DATE_YY, () => slot(String(d.getFullYear()).slice(-2)))
  result = result.replace(RE_DATE_MMM, () => slot(monthNames[d.getMonth()]))
  result = result.replace(RE_DATE_MM, () => slot(String(d.getMonth() + 1).padStart(2, '0')))
  result = result.replace(RE_DATE_M, () => slot(String(d.getMonth() + 1)))
  result = result.replace(RE_DATE_DD, () => slot(String(d.getDate()).padStart(2, '0')))
  result = result.replace(RE_DATE_D, () => slot(String(d.getDate())))
  result = result.replace(RE_DATE_HH, () => slot(String(hours24).padStart(2, '0')))
  result = result.replace(RE_DATE_H, () => slot(String(hours24)))
  result = result.replace(RE_DATE_hh, () => slot(String(hours12).padStart(2, '0')))
  result = result.replace(RE_DATE_h, () => slot(String(hours12)))
  result = result.replace(RE_DATE_mm, () => slot(String(d.getMinutes()).padStart(2, '0')))
  result = result.replace(RE_DATE_ss, () => slot(String(d.getSeconds()).padStart(2, '0')))
  result = result.replace(RE_DATE_A, () => slot(ampm))
  result = result.replace(RE_DATE_a, () => slot(ampm.toLowerCase()))
  result = result.replace(RE_DATE_Z, () => slot(tzString))

  // Swap placeholders back to actual values
  result = result.replace(RE_SLOT_PLACEHOLDER, (_m, idx) => slots[Number(idx)])

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
    RE_AUTOLINK,
    (url) => {
      const href = url.startsWith('www.') ? `https://${url}` : url
      return `<a href="${href}" target="_blank" rel="noopener">${url}</a>`
    }
  )
}

/**
 * Substitute {{token}} references in a URL template with item field values.
 * Used for external link URLs, both inline (card toolbar) and in templates.
 * Returns the resolved URL string, or undefined if template is empty.
 */
export function resolveExternalLinkUrl (
  template: string | undefined,
  item: Record<string, any>
): string | undefined {
  if (!template) return undefined
  return template.replace(
    RE_EXTERNAL_LINK_TOKEN,
    (_m, name: string) => {
      const val = item[name.trim()]
      return val != null ? String(val) : ''
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
  item: Record<string, any>,
  externalLinkTemplate: string | undefined
): string {
  const url = resolveExternalLinkUrl(externalLinkTemplate, item)
  if (!url) return _value
  return `<a href="${url}" target="_blank" rel="noopener">View ↗</a>`
}
