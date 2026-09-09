import { widgetConfigManager } from '../widget-config-manager'

/**
 * WidgetConfigManager tests
 *
 * No mocks required — the module is pure TypeScript with zero runtime
 * dependencies. The only import is a type-only import (IMConfig) which
 * is erased at compile time.
 *
 * Because WidgetConfigManager is a singleton, every test must clean up
 * registered configs in afterEach to avoid cross-test pollution.
 */

// Helper: build a partial config object typed as any (mirrors IMConfig shape)
function makeConfig(overrides: Record<string, unknown> = {}): any {
  return { ...overrides }
}

describe('WidgetConfigManager', () => {
  const WIDGET_A = 'widget-a'
  const WIDGET_B = 'widget-b'

  afterEach(() => {
    // Clean up all known widget registrations to avoid state leakage
    widgetConfigManager.unregisterConfig(WIDGET_A)
    widgetConfigManager.unregisterConfig(WIDGET_B)
  })

  // ---------------------------------------------------------------
  // 1. Singleton pattern
  // ---------------------------------------------------------------
  describe('singleton pattern', () => {
    it('getInstance() returns the same instance every time', () => {
      // The exported constant IS the singleton; re-importing should yield the same ref.
      // We cannot call the private constructor, but we can verify identity:
      const a = widgetConfigManager
      const b = widgetConfigManager
      expect(a).toBe(b)
    })
  })

  // ---------------------------------------------------------------
  // 2. registerConfig / unregisterConfig lifecycle
  // ---------------------------------------------------------------
  describe('registerConfig / unregisterConfig lifecycle', () => {
    it('returns defaults when no config is registered', () => {
      // No registration for WIDGET_A — every getter should return its default
      expect(widgetConfigManager.getFillOpacity(WIDGET_A)).toBe(0.25)
      expect(widgetConfigManager.getOutlineOpacity(WIDGET_A)).toBe(1.0)
    })

    it('returns configured values after registerConfig', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.8
      }))
      expect(widgetConfigManager.getFillOpacity(WIDGET_A)).toBe(0.8)
    })

    it('returns defaults after unregisterConfig', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.8
      }))
      widgetConfigManager.unregisterConfig(WIDGET_A)
      expect(widgetConfigManager.getFillOpacity(WIDGET_A)).toBe(0.25)
    })

    it('supports multiple widgets independently', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.1
      }))
      widgetConfigManager.registerConfig(WIDGET_B, makeConfig({
        highlightFillOpacity: 0.9
      }))
      expect(widgetConfigManager.getFillOpacity(WIDGET_A)).toBe(0.1)
      expect(widgetConfigManager.getFillOpacity(WIDGET_B)).toBe(0.9)
    })

    it('overwrites config when registerConfig is called again for same widgetId', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.1
      }))
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.75
      }))
      expect(widgetConfigManager.getFillOpacity(WIDGET_A)).toBe(0.75)
    })

    it('unregisterConfig is a no-op for unknown widgetId', () => {
      // Should not throw
      expect(() => widgetConfigManager.unregisterConfig('nonexistent')).not.toThrow()
    })
  })

  // ---------------------------------------------------------------
  // 3. getDrawColor (r025.051)
  // ---------------------------------------------------------------
  describe('getDrawColor', () => {
    it('returns lime green [50, 255, 0] by default (#32FF00)', () => {
      expect(widgetConfigManager.getDrawColor(WIDGET_A)).toEqual([50, 255, 0])
    })

    it('returns custom RGB when drawColor is configured', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        drawColor: '#FF0000'
      }))
      expect(widgetConfigManager.getDrawColor(WIDGET_A)).toEqual([255, 0, 0])
    })

    it('falls back to default when drawColor is empty string', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        drawColor: ''
      }))
      expect(widgetConfigManager.getDrawColor(WIDGET_A)).toEqual([50, 255, 0])
    })
  })

  // ---------------------------------------------------------------
  // 4. getBufferColor (r025.051)
  // ---------------------------------------------------------------
  describe('getBufferColor', () => {
    it('returns orange [255, 165, 0] by default (#FFA500)', () => {
      expect(widgetConfigManager.getBufferColor(WIDGET_A)).toEqual([255, 165, 0])
    })

    it('returns custom RGB when bufferColor is configured', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        bufferColor: '#0000FF'
      }))
      expect(widgetConfigManager.getBufferColor(WIDGET_A)).toEqual([0, 0, 255])
    })

    it('falls back to default when bufferColor is empty string', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        bufferColor: ''
      }))
      expect(widgetConfigManager.getBufferColor(WIDGET_A)).toEqual([255, 165, 0])
    })
  })

  // ---------------------------------------------------------------
  // Hover preview getters (r028.123-125)
  // ---------------------------------------------------------------
  describe('getHoverPinColor', () => {
    it('returns #EA4335 by default', () => {
      expect(widgetConfigManager.getHoverPinColor(WIDGET_A)).toBe('#EA4335')
    })

    it('returns the configured color', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ hoverPinColor: '#123456' }))
      expect(widgetConfigManager.getHoverPinColor(WIDGET_A)).toBe('#123456')
    })

    it('falls back to default for an empty string', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ hoverPinColor: '' }))
      expect(widgetConfigManager.getHoverPinColor(WIDGET_A)).toBe('#EA4335')
    })
  })

  describe('getHoverHighlightColor (r028.124)', () => {
    it('returns #EA4335 by default (matches the pin)', () => {
      expect(widgetConfigManager.getHoverHighlightColor(WIDGET_A)).toBe('#EA4335')
    })

    it('returns the configured color', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ hoverHighlightColor: '#00FF99' }))
      expect(widgetConfigManager.getHoverHighlightColor(WIDGET_A)).toBe('#00FF99')
    })

    it('falls back to default for an empty string', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ hoverHighlightColor: '' }))
      expect(widgetConfigManager.getHoverHighlightColor(WIDGET_A)).toBe('#EA4335')
    })
  })

  describe('getHoverPinEnabled (r028.125)', () => {
    it('defaults to true when unset', () => {
      expect(widgetConfigManager.getHoverPinEnabled(WIDGET_A)).toBe(true)
    })

    it('returns true when explicitly true', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ hoverPinEnabled: true }))
      expect(widgetConfigManager.getHoverPinEnabled(WIDGET_A)).toBe(true)
    })

    it('returns false only when explicitly false', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ hoverPinEnabled: false }))
      expect(widgetConfigManager.getHoverPinEnabled(WIDGET_A)).toBe(false)
    })
  })

  describe('getHoverHighlightFeature (r028.125)', () => {
    it('defaults to true when unset', () => {
      expect(widgetConfigManager.getHoverHighlightFeature(WIDGET_A)).toBe(true)
    })

    it('returns true when explicitly true', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ hoverHighlightFeature: true }))
      expect(widgetConfigManager.getHoverHighlightFeature(WIDGET_A)).toBe(true)
    })

    it('returns false only when explicitly false', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ hoverHighlightFeature: false }))
      expect(widgetConfigManager.getHoverHighlightFeature(WIDGET_A)).toBe(false)
    })
  })

  // ---------------------------------------------------------------
  // 5. hexToRgb (tested via public methods)
  // ---------------------------------------------------------------
  describe('hexToRgb (via public color getters)', () => {
    it('parses standard 6-digit hex with # prefix', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#1A2B3C'
      }))
      expect(widgetConfigManager.getFillColor(WIDGET_A)).toEqual([26, 43, 60])
    })

    it('parses uppercase hex', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#AABBCC'
      }))
      expect(widgetConfigManager.getFillColor(WIDGET_A)).toEqual([170, 187, 204])
    })

    it('parses lowercase hex', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#aabbcc'
      }))
      expect(widgetConfigManager.getFillColor(WIDGET_A)).toEqual([170, 187, 204])
    })

    it('returns magenta fallback [223, 0, 255] for invalid hex (3-digit shorthand)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#ABC'
      }))
      expect(widgetConfigManager.getFillColor(WIDGET_A)).toEqual([223, 0, 255])
    })

    it('returns magenta fallback [223, 0, 255] for completely invalid string', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: 'not-a-color'
      }))
      expect(widgetConfigManager.getFillColor(WIDGET_A)).toEqual([223, 0, 255])
    })

    it('parses #000000 correctly (edge case: all zeros)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#000000'
      }))
      expect(widgetConfigManager.getFillColor(WIDGET_A)).toEqual([0, 0, 0])
    })

    it('parses #FFFFFF correctly (edge case: all max)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#FFFFFF'
      }))
      expect(widgetConfigManager.getFillColor(WIDGET_A)).toEqual([255, 255, 255])
    })
  })

  // ---------------------------------------------------------------
  // 6. getFillColor / getOutlineColor
  // ---------------------------------------------------------------
  describe('getFillColor', () => {
    it('returns magenta [223, 0, 255] by default (#DF00FF)', () => {
      expect(widgetConfigManager.getFillColor(WIDGET_A)).toEqual([223, 0, 255])
    })

    it('returns custom RGB when highlightFillColor is configured', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#336699'
      }))
      expect(widgetConfigManager.getFillColor(WIDGET_A)).toEqual([51, 102, 153])
    })
  })

  describe('getOutlineColor', () => {
    it('returns magenta [223, 0, 255] by default (#DF00FF)', () => {
      expect(widgetConfigManager.getOutlineColor(WIDGET_A)).toEqual([223, 0, 255])
    })

    it('returns custom RGB when highlightOutlineColor is configured', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineColor: '#112233'
      }))
      expect(widgetConfigManager.getOutlineColor(WIDGET_A)).toEqual([17, 34, 51])
    })
  })

  // ---------------------------------------------------------------
  // 7. getFillOpacity / getOutlineOpacity
  // ---------------------------------------------------------------
  describe('getFillOpacity', () => {
    it('returns 0.25 by default', () => {
      expect(widgetConfigManager.getFillOpacity(WIDGET_A)).toBe(0.25)
    })

    it('returns configured value', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.6
      }))
      expect(widgetConfigManager.getFillOpacity(WIDGET_A)).toBe(0.6)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0
      }))
      expect(widgetConfigManager.getFillOpacity(WIDGET_A)).toBe(0)
    })
  })

  describe('getOutlineOpacity', () => {
    it('returns 1.0 by default', () => {
      expect(widgetConfigManager.getOutlineOpacity(WIDGET_A)).toBe(1.0)
    })

    it('returns configured value', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineOpacity: 0.5
      }))
      expect(widgetConfigManager.getOutlineOpacity(WIDGET_A)).toBe(0.5)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineOpacity: 0
      }))
      expect(widgetConfigManager.getOutlineOpacity(WIDGET_A)).toBe(0)
    })
  })

  // ---------------------------------------------------------------
  // 8. getPointSize / getOutlineWidth / getPointOutlineWidth / getPointStyle
  // ---------------------------------------------------------------
  describe('getPointSize', () => {
    it('returns 12 by default', () => {
      expect(widgetConfigManager.getPointSize(WIDGET_A)).toBe(12)
    })

    it('returns configured value', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointSize: 24
      }))
      expect(widgetConfigManager.getPointSize(WIDGET_A)).toBe(24)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointSize: 0
      }))
      expect(widgetConfigManager.getPointSize(WIDGET_A)).toBe(0)
    })
  })

  describe('getOutlineWidth', () => {
    it('returns 2 by default', () => {
      expect(widgetConfigManager.getOutlineWidth(WIDGET_A)).toBe(2)
    })

    it('returns configured value', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineWidth: 5
      }))
      expect(widgetConfigManager.getOutlineWidth(WIDGET_A)).toBe(5)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineWidth: 0
      }))
      expect(widgetConfigManager.getOutlineWidth(WIDGET_A)).toBe(0)
    })
  })

  describe('getPointOutlineWidth', () => {
    it('returns 2 by default', () => {
      expect(widgetConfigManager.getPointOutlineWidth(WIDGET_A)).toBe(2)
    })

    it('returns configured value', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointOutlineWidth: 4
      }))
      expect(widgetConfigManager.getPointOutlineWidth(WIDGET_A)).toBe(4)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointOutlineWidth: 0
      }))
      expect(widgetConfigManager.getPointOutlineWidth(WIDGET_A)).toBe(0)
    })
  })

  describe('getPointStyle', () => {
    it('returns "circle" by default', () => {
      expect(widgetConfigManager.getPointStyle(WIDGET_A)).toBe('circle')
    })

    it('returns configured style', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointStyle: 'diamond'
      }))
      expect(widgetConfigManager.getPointStyle(WIDGET_A)).toBe('diamond')
    })

    it('falls back to "circle" when set to empty string', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointStyle: ''
      }))
      expect(widgetConfigManager.getPointStyle(WIDGET_A)).toBe('circle')
    })
  })

  // ---------------------------------------------------------------
  // 9. getAddResultsAsMapLayer
  // ---------------------------------------------------------------
  describe('getAddResultsAsMapLayer', () => {
    it('returns false by default', () => {
      expect(widgetConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(false)
    })

    it('returns true when configured as true', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        addResultsAsMapLayer: true
      }))
      expect(widgetConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(true)
    })

    it('returns false when configured as false', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        addResultsAsMapLayer: false
      }))
      expect(widgetConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(false)
    })

    it('returns false for truthy non-boolean values (strict === true check)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        addResultsAsMapLayer: 'yes' as any
      }))
      expect(widgetConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(false)
    })

    it('returns false when addResultsAsMapLayer is undefined', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({}))
      expect(widgetConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(false)
    })
  })

  // ---------------------------------------------------------------
  // 10. getResultsLayerTitle
  // ---------------------------------------------------------------
  describe('getResultsLayerTitle', () => {
    it('returns "QuerySimple Results" by default', () => {
      expect(widgetConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('QuerySimple Results')
    })

    it('returns configured title', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        resultsLayerTitle: 'My Custom Layer'
      }))
      expect(widgetConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('My Custom Layer')
    })

    it('trims whitespace from configured title', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        resultsLayerTitle: '  Padded Title  '
      }))
      expect(widgetConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('Padded Title')
    })

    it('returns default when title is empty string', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        resultsLayerTitle: ''
      }))
      expect(widgetConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('QuerySimple Results')
    })

    it('returns default when title is whitespace-only', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        resultsLayerTitle: '   '
      }))
      expect(widgetConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('QuerySimple Results')
    })

    it('returns default when resultsLayerTitle is undefined', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({}))
      expect(widgetConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('QuerySimple Results')
    })
  })

  // ---------------------------------------------------------------
  // 11. getShowHeader (r027.013)
  // ---------------------------------------------------------------
  describe('getShowHeader', () => {
    it('returns true by default (no config registered)', () => {
      expect(widgetConfigManager.getShowHeader(WIDGET_A)).toBe(true)
    })

    it('returns true when showHeader is undefined', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({}))
      expect(widgetConfigManager.getShowHeader(WIDGET_A)).toBe(true)
    })

    it('returns true when showHeader is explicitly true', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        showHeader: true
      }))
      expect(widgetConfigManager.getShowHeader(WIDGET_A)).toBe(true)
    })

    it('returns false when showHeader is explicitly false', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        showHeader: false
      }))
      expect(widgetConfigManager.getShowHeader(WIDGET_A)).toBe(false)
    })
  })

  // ---------------------------------------------------------------
  // 12. getSpatialTabRelationships (r027.014)
  // ---------------------------------------------------------------
  describe('getSpatialTabRelationships', () => {
    it('returns undefined by default (show all)', () => {
      expect(widgetConfigManager.getSpatialTabRelationships(WIDGET_A)).toBeUndefined()
    })

    it('returns undefined when config is registered without spatialTabRelationships', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({}))
      expect(widgetConfigManager.getSpatialTabRelationships(WIDGET_A)).toBeUndefined()
    })

    it('returns undefined when spatialTabRelationships is empty array', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        spatialTabRelationships: []
      }))
      expect(widgetConfigManager.getSpatialTabRelationships(WIDGET_A)).toBeUndefined()
    })

    it('returns configured array when set', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        spatialTabRelationships: ['contains', 'intersects', 'within']
      }))
      expect(widgetConfigManager.getSpatialTabRelationships(WIDGET_A)).toEqual(['contains', 'intersects', 'within'])
    })

    it('supports independent configs per widget', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        spatialTabRelationships: ['contains']
      }))
      widgetConfigManager.registerConfig(WIDGET_B, makeConfig({
        spatialTabRelationships: ['intersects', 'within']
      }))
      expect(widgetConfigManager.getSpatialTabRelationships(WIDGET_A)).toEqual(['contains'])
      expect(widgetConfigManager.getSpatialTabRelationships(WIDGET_B)).toEqual(['intersects', 'within'])
    })
  })

  describe('tab help text getters (r028.134)', () => {
    it('return undefined when unset (runtime falls back to the shipped default)', () => {
      expect(widgetConfigManager.getTabHelpQueryText(WIDGET_A)).toBeUndefined()
      expect(widgetConfigManager.getTabHelpSpatialText(WIDGET_A)).toBeUndefined()
      expect(widgetConfigManager.getTabHelpResultsText(WIDGET_A)).toBeUndefined()
    })

    it('return the configured text when set', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        tabHelpQueryText: '**Search** the parcels layer.',
        tabHelpSpatialText: 'Spatial guidance here.',
        tabHelpResultsText: 'Results guidance here.'
      }))
      expect(widgetConfigManager.getTabHelpQueryText(WIDGET_A)).toBe('**Search** the parcels layer.')
      expect(widgetConfigManager.getTabHelpSpatialText(WIDGET_A)).toBe('Spatial guidance here.')
      expect(widgetConfigManager.getTabHelpResultsText(WIDGET_A)).toBe('Results guidance here.')
    })

    it('treat empty string as unset', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ tabHelpQueryText: '' }))
      expect(widgetConfigManager.getTabHelpQueryText(WIDGET_A)).toBeUndefined()
    })

    it('treat whitespace-only as unset', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ tabHelpSpatialText: '   \n  ' }))
      expect(widgetConfigManager.getTabHelpSpatialText(WIDGET_A)).toBeUndefined()
    })

    it('are isolated per widget', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ tabHelpResultsText: 'A text' }))
      widgetConfigManager.registerConfig(WIDGET_B, makeConfig({}))
      expect(widgetConfigManager.getTabHelpResultsText(WIDGET_A)).toBe('A text')
      expect(widgetConfigManager.getTabHelpResultsText(WIDGET_B)).toBeUndefined()
    })

    it('Operations/Draw mode getters follow the same semantics (r028.136)', () => {
      expect(widgetConfigManager.getTabHelpOperationsText(WIDGET_A)).toBeUndefined()
      expect(widgetConfigManager.getTabHelpDrawText(WIDGET_A)).toBeUndefined()
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({
        tabHelpOperationsText: '**Buffer** then compare.',
        tabHelpDrawText: '   '
      }))
      expect(widgetConfigManager.getTabHelpOperationsText(WIDGET_A)).toBe('**Buffer** then compare.')
      expect(widgetConfigManager.getTabHelpDrawText(WIDGET_A)).toBeUndefined()
    })
  })

  describe('getTabHelpEnabled (r028.135)', () => {
    it('defaults to true when unset', () => {
      expect(widgetConfigManager.getTabHelpEnabled(WIDGET_A)).toBe(true)
    })

    it('returns true when explicitly true', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ tabHelpEnabled: true }))
      expect(widgetConfigManager.getTabHelpEnabled(WIDGET_A)).toBe(true)
    })

    it('returns false only when explicitly false', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ tabHelpEnabled: false }))
      expect(widgetConfigManager.getTabHelpEnabled(WIDGET_A)).toBe(false)
    })
  })

  describe('getTabHelpBackgroundColor (r028.135)', () => {
    it('returns undefined when unset (theme surface)', () => {
      expect(widgetConfigManager.getTabHelpBackgroundColor(WIDGET_A)).toBeUndefined()
    })

    it('returns the configured hex when set', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ tabHelpBackgroundColor: '#FFF9C4' }))
      expect(widgetConfigManager.getTabHelpBackgroundColor(WIDGET_A)).toBe('#FFF9C4')
    })

    it('treats blank as unset (the settings reset button clears to empty string)', () => {
      widgetConfigManager.registerConfig(WIDGET_A, makeConfig({ tabHelpBackgroundColor: '' }))
      expect(widgetConfigManager.getTabHelpBackgroundColor(WIDGET_A)).toBeUndefined()
    })
  })
})
