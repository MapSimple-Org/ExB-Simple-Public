/**
 * contrast-utils tests (r028.135, TAB_HELP_SPEC Phase 3)
 *
 * The tab-help popover background is org-configurable; the text color is
 * auto-computed (YIQ) so an admin can never configure unreadable help.
 */
import { parseHexColor, pickTextColorForBackground } from '../src/runtime/contrast-utils'

describe('parseHexColor', () => {
  it('parses 6-digit hex with or without #', () => {
    expect(parseHexColor('#EA4335')).toEqual([234, 67, 53])
    expect(parseHexColor('EA4335')).toEqual([234, 67, 53])
  })

  it('parses 3-digit shorthand', () => {
    expect(parseHexColor('#fff')).toEqual([255, 255, 255])
    expect(parseHexColor('#000')).toEqual([0, 0, 0])
  })

  it('returns null for unparseable input', () => {
    expect(parseHexColor('')).toBeNull()
    expect(parseHexColor('not-a-color')).toBeNull()
    expect(parseHexColor('#12345')).toBeNull()
    expect(parseHexColor(undefined as unknown as string)).toBeNull()
  })
})

describe('pickTextColorForBackground', () => {
  it('picks dark text on light backgrounds', () => {
    expect(pickTextColorForBackground('#ffffff')).toBe('#1a1a1a')
    expect(pickTextColorForBackground('#FFF9C4')).toBe('#1a1a1a') // pale help-yellow
  })

  it('picks light text on dark backgrounds', () => {
    expect(pickTextColorForBackground('#000000')).toBe('#ffffff')
    expect(pickTextColorForBackground('#042C53')).toBe('#ffffff') // navy
  })

  it('falls back to dark text for unparseable input (safe on the light theme surface)', () => {
    expect(pickTextColorForBackground('garbage')).toBe('#1a1a1a')
    expect(pickTextColorForBackground('')).toBe('#1a1a1a')
  })
})
