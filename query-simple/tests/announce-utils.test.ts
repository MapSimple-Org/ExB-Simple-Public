/**
 * buildAnnouncement tests (TODO #38, r028.138)
 *
 * Pure string builder for the screen-reader live region. The i18n getter is
 * stubbed with the real default-message templates so the {token} substitution
 * is exercised exactly as it runs.
 */
import { buildAnnouncement } from '../src/runtime/announce-utils'

// Mirror of the relevant default.ts entries (templates, pre-substitution).
const MESSAGES: Record<string, string> = {
  queryTab: 'Query',
  spatialTab: 'Spatial',
  resultsTab: 'Results',
  spatialModeOperations: 'Operations',
  spatialModeDraw: 'Draw',
  tabSwitchAnnouncement: '{tab} tab.',
  tabSwitchAnnouncementResults: '{tab} tab, {count} items.',
  tabHelpModeAnnouncement: '{mode} mode. Help updated.'
}
const t = (id: string): string => MESSAGES[id] ?? id

describe('buildAnnouncement', () => {
  describe('tab switches', () => {
    it('announces a plain tab switch with the tab label', () => {
      expect(buildAnnouncement({ type: 'tab', tab: 'query' }, t)).toBe('Query tab.')
      expect(buildAnnouncement({ type: 'tab', tab: 'spatial' }, t)).toBe('Spatial tab.')
    })

    it('announces Results with the count when records exist', () => {
      expect(buildAnnouncement({ type: 'tab', tab: 'results', resultCount: 23 }, t))
        .toBe('Results tab, 23 items.')
    })

    it('falls back to the plain form for Results when count is 0 or missing', () => {
      expect(buildAnnouncement({ type: 'tab', tab: 'results', resultCount: 0 }, t)).toBe('Results tab.')
      expect(buildAnnouncement({ type: 'tab', tab: 'results' }, t)).toBe('Results tab.')
    })
  })

  describe('mode toggles', () => {
    it('announces the new Spatial mode and that help updated', () => {
      expect(buildAnnouncement({ type: 'mode', mode: 'operations' }, t)).toBe('Operations mode. Help updated.')
      expect(buildAnnouncement({ type: 'mode', mode: 'draw' }, t)).toBe('Draw mode. Help updated.')
    })
  })

  it('substitutes every placeholder (no literal {token} leaks through)', () => {
    const all = [
      buildAnnouncement({ type: 'tab', tab: 'query' }, t),
      buildAnnouncement({ type: 'tab', tab: 'results', resultCount: 5 }, t),
      buildAnnouncement({ type: 'mode', mode: 'draw' }, t)
    ]
    all.forEach(s => expect(s).not.toMatch(/\{[a-z]+\}/))
  })
})
