/**
 * Contrast utilities for the tab-help popover (r028.135, TAB_HELP_SPEC Phase 3).
 *
 * The popup background is org-configurable; the text color is auto-computed
 * so an admin can never configure unreadable help. YIQ luminance: >= 128
 * reads as a light background (dark text), below as dark (light text).
 *
 * widgetConfigManager has a hexToRgb but it is private to the singleton;
 * this local parse keeps shared-code's public API unchanged for a QS-only need.
 */

const DARK_TEXT = '#1a1a1a'
const LIGHT_TEXT = '#ffffff'

/** Parse #RGB or #RRGGBB to [r, g, b]. Returns null for anything unparseable. */
export function parseHexColor (hex: string): [number, number, number] | null {
  if (typeof hex !== 'string') return null
  const value = hex.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return [
      parseInt(value[0] + value[0], 16),
      parseInt(value[1] + value[1], 16),
      parseInt(value[2] + value[2], 16)
    ]
  }
  if (/^[0-9a-f]{6}$/i.test(value)) {
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16)
    ]
  }
  return null
}

/**
 * Pick a readable text color for the given hex background.
 * Unparseable input falls back to dark text (safe on the light theme surface).
 */
export function pickTextColorForBackground (backgroundHex: string): string {
  const rgb = parseHexColor(backgroundHex)
  if (!rgb) return DARK_TEXT
  const [r, g, b] = rgb
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? DARK_TEXT : LIGHT_TEXT
}
