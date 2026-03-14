import { highlightConfigManager } from '../highlight-config-manager'

/**
 * HighlightConfigManager tests
 *
 * No mocks required — the module is pure TypeScript with zero runtime
 * dependencies. The only import is a type-only import (IMConfig) which
 * is erased at compile time.
 *
 * Because HighlightConfigManager is a singleton, every test must clean up
 * registered configs in afterEach to avoid cross-test pollution.
 */

// Helper: build a partial config object typed as any (mirrors IMConfig shape)
function makeConfig(overrides: Record<string, unknown> = {}): any {
  return { ...overrides }
}

describe('HighlightConfigManager', () => {
  const WIDGET_A = 'widget-a'
  const WIDGET_B = 'widget-b'

  afterEach(() => {
    // Clean up all known widget registrations to avoid state leakage
    highlightConfigManager.unregisterConfig(WIDGET_A)
    highlightConfigManager.unregisterConfig(WIDGET_B)
  })

  // ---------------------------------------------------------------
  // 1. Singleton pattern
  // ---------------------------------------------------------------
  describe('singleton pattern', () => {
    it('getInstance() returns the same instance every time', () => {
      // The exported constant IS the singleton; re-importing should yield the same ref.
      // We cannot call the private constructor, but we can verify identity:
      const a = highlightConfigManager
      const b = highlightConfigManager
      expect(a).toBe(b)
    })
  })

  // ---------------------------------------------------------------
  // 2. registerConfig / unregisterConfig lifecycle
  // ---------------------------------------------------------------
  describe('registerConfig / unregisterConfig lifecycle', () => {
    it('returns defaults when no config is registered', () => {
      // No registration for WIDGET_A — every getter should return its default
      expect(highlightConfigManager.getFillOpacity(WIDGET_A)).toBe(0.25)
      expect(highlightConfigManager.getOutlineOpacity(WIDGET_A)).toBe(1.0)
    })

    it('returns configured values after registerConfig', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.8
      }))
      expect(highlightConfigManager.getFillOpacity(WIDGET_A)).toBe(0.8)
    })

    it('returns defaults after unregisterConfig', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.8
      }))
      highlightConfigManager.unregisterConfig(WIDGET_A)
      expect(highlightConfigManager.getFillOpacity(WIDGET_A)).toBe(0.25)
    })

    it('supports multiple widgets independently', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.1
      }))
      highlightConfigManager.registerConfig(WIDGET_B, makeConfig({
        highlightFillOpacity: 0.9
      }))
      expect(highlightConfigManager.getFillOpacity(WIDGET_A)).toBe(0.1)
      expect(highlightConfigManager.getFillOpacity(WIDGET_B)).toBe(0.9)
    })

    it('overwrites config when registerConfig is called again for same widgetId', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.1
      }))
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.75
      }))
      expect(highlightConfigManager.getFillOpacity(WIDGET_A)).toBe(0.75)
    })

    it('unregisterConfig is a no-op for unknown widgetId', () => {
      // Should not throw
      expect(() => highlightConfigManager.unregisterConfig('nonexistent')).not.toThrow()
    })
  })

  // ---------------------------------------------------------------
  // 3. getDrawColor (r025.051)
  // ---------------------------------------------------------------
  describe('getDrawColor', () => {
    it('returns lime green [50, 255, 0] by default (#32FF00)', () => {
      expect(highlightConfigManager.getDrawColor(WIDGET_A)).toEqual([50, 255, 0])
    })

    it('returns custom RGB when drawColor is configured', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        drawColor: '#FF0000'
      }))
      expect(highlightConfigManager.getDrawColor(WIDGET_A)).toEqual([255, 0, 0])
    })

    it('falls back to default when drawColor is empty string', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        drawColor: ''
      }))
      expect(highlightConfigManager.getDrawColor(WIDGET_A)).toEqual([50, 255, 0])
    })
  })

  // ---------------------------------------------------------------
  // 4. getBufferColor (r025.051)
  // ---------------------------------------------------------------
  describe('getBufferColor', () => {
    it('returns orange [255, 165, 0] by default (#FFA500)', () => {
      expect(highlightConfigManager.getBufferColor(WIDGET_A)).toEqual([255, 165, 0])
    })

    it('returns custom RGB when bufferColor is configured', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        bufferColor: '#0000FF'
      }))
      expect(highlightConfigManager.getBufferColor(WIDGET_A)).toEqual([0, 0, 255])
    })

    it('falls back to default when bufferColor is empty string', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        bufferColor: ''
      }))
      expect(highlightConfigManager.getBufferColor(WIDGET_A)).toEqual([255, 165, 0])
    })
  })

  // ---------------------------------------------------------------
  // 5. hexToRgb (tested via public methods)
  // ---------------------------------------------------------------
  describe('hexToRgb (via public color getters)', () => {
    it('parses standard 6-digit hex with # prefix', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#1A2B3C'
      }))
      expect(highlightConfigManager.getFillColor(WIDGET_A)).toEqual([26, 43, 60])
    })

    it('parses uppercase hex', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#AABBCC'
      }))
      expect(highlightConfigManager.getFillColor(WIDGET_A)).toEqual([170, 187, 204])
    })

    it('parses lowercase hex', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#aabbcc'
      }))
      expect(highlightConfigManager.getFillColor(WIDGET_A)).toEqual([170, 187, 204])
    })

    it('returns magenta fallback [223, 0, 255] for invalid hex (3-digit shorthand)', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#ABC'
      }))
      expect(highlightConfigManager.getFillColor(WIDGET_A)).toEqual([223, 0, 255])
    })

    it('returns magenta fallback [223, 0, 255] for completely invalid string', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: 'not-a-color'
      }))
      expect(highlightConfigManager.getFillColor(WIDGET_A)).toEqual([223, 0, 255])
    })

    it('parses #000000 correctly (edge case: all zeros)', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#000000'
      }))
      expect(highlightConfigManager.getFillColor(WIDGET_A)).toEqual([0, 0, 0])
    })

    it('parses #FFFFFF correctly (edge case: all max)', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#FFFFFF'
      }))
      expect(highlightConfigManager.getFillColor(WIDGET_A)).toEqual([255, 255, 255])
    })
  })

  // ---------------------------------------------------------------
  // 6. getFillColor / getOutlineColor
  // ---------------------------------------------------------------
  describe('getFillColor', () => {
    it('returns magenta [223, 0, 255] by default (#DF00FF)', () => {
      expect(highlightConfigManager.getFillColor(WIDGET_A)).toEqual([223, 0, 255])
    })

    it('returns custom RGB when highlightFillColor is configured', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillColor: '#336699'
      }))
      expect(highlightConfigManager.getFillColor(WIDGET_A)).toEqual([51, 102, 153])
    })
  })

  describe('getOutlineColor', () => {
    it('returns magenta [223, 0, 255] by default (#DF00FF)', () => {
      expect(highlightConfigManager.getOutlineColor(WIDGET_A)).toEqual([223, 0, 255])
    })

    it('returns custom RGB when highlightOutlineColor is configured', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineColor: '#112233'
      }))
      expect(highlightConfigManager.getOutlineColor(WIDGET_A)).toEqual([17, 34, 51])
    })
  })

  // ---------------------------------------------------------------
  // 7. getFillOpacity / getOutlineOpacity
  // ---------------------------------------------------------------
  describe('getFillOpacity', () => {
    it('returns 0.25 by default', () => {
      expect(highlightConfigManager.getFillOpacity(WIDGET_A)).toBe(0.25)
    })

    it('returns configured value', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0.6
      }))
      expect(highlightConfigManager.getFillOpacity(WIDGET_A)).toBe(0.6)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightFillOpacity: 0
      }))
      expect(highlightConfigManager.getFillOpacity(WIDGET_A)).toBe(0)
    })
  })

  describe('getOutlineOpacity', () => {
    it('returns 1.0 by default', () => {
      expect(highlightConfigManager.getOutlineOpacity(WIDGET_A)).toBe(1.0)
    })

    it('returns configured value', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineOpacity: 0.5
      }))
      expect(highlightConfigManager.getOutlineOpacity(WIDGET_A)).toBe(0.5)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineOpacity: 0
      }))
      expect(highlightConfigManager.getOutlineOpacity(WIDGET_A)).toBe(0)
    })
  })

  // ---------------------------------------------------------------
  // 8. getPointSize / getOutlineWidth / getPointOutlineWidth / getPointStyle
  // ---------------------------------------------------------------
  describe('getPointSize', () => {
    it('returns 12 by default', () => {
      expect(highlightConfigManager.getPointSize(WIDGET_A)).toBe(12)
    })

    it('returns configured value', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointSize: 24
      }))
      expect(highlightConfigManager.getPointSize(WIDGET_A)).toBe(24)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointSize: 0
      }))
      expect(highlightConfigManager.getPointSize(WIDGET_A)).toBe(0)
    })
  })

  describe('getOutlineWidth', () => {
    it('returns 2 by default', () => {
      expect(highlightConfigManager.getOutlineWidth(WIDGET_A)).toBe(2)
    })

    it('returns configured value', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineWidth: 5
      }))
      expect(highlightConfigManager.getOutlineWidth(WIDGET_A)).toBe(5)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightOutlineWidth: 0
      }))
      expect(highlightConfigManager.getOutlineWidth(WIDGET_A)).toBe(0)
    })
  })

  describe('getPointOutlineWidth', () => {
    it('returns 2 by default', () => {
      expect(highlightConfigManager.getPointOutlineWidth(WIDGET_A)).toBe(2)
    })

    it('returns configured value', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointOutlineWidth: 4
      }))
      expect(highlightConfigManager.getPointOutlineWidth(WIDGET_A)).toBe(4)
    })

    it('returns 0 when explicitly set to 0 (nullish coalescing check)', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointOutlineWidth: 0
      }))
      expect(highlightConfigManager.getPointOutlineWidth(WIDGET_A)).toBe(0)
    })
  })

  describe('getPointStyle', () => {
    it('returns "circle" by default', () => {
      expect(highlightConfigManager.getPointStyle(WIDGET_A)).toBe('circle')
    })

    it('returns configured style', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointStyle: 'diamond'
      }))
      expect(highlightConfigManager.getPointStyle(WIDGET_A)).toBe('diamond')
    })

    it('falls back to "circle" when set to empty string', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        highlightPointStyle: ''
      }))
      expect(highlightConfigManager.getPointStyle(WIDGET_A)).toBe('circle')
    })
  })

  // ---------------------------------------------------------------
  // 9. getAddResultsAsMapLayer
  // ---------------------------------------------------------------
  describe('getAddResultsAsMapLayer', () => {
    it('returns false by default', () => {
      expect(highlightConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(false)
    })

    it('returns true when configured as true', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        addResultsAsMapLayer: true
      }))
      expect(highlightConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(true)
    })

    it('returns false when configured as false', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        addResultsAsMapLayer: false
      }))
      expect(highlightConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(false)
    })

    it('returns false for truthy non-boolean values (strict === true check)', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        addResultsAsMapLayer: 'yes' as any
      }))
      expect(highlightConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(false)
    })

    it('returns false when addResultsAsMapLayer is undefined', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({}))
      expect(highlightConfigManager.getAddResultsAsMapLayer(WIDGET_A)).toBe(false)
    })
  })

  // ---------------------------------------------------------------
  // 10. getResultsLayerTitle
  // ---------------------------------------------------------------
  describe('getResultsLayerTitle', () => {
    it('returns "QuerySimple Results" by default', () => {
      expect(highlightConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('QuerySimple Results')
    })

    it('returns configured title', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        resultsLayerTitle: 'My Custom Layer'
      }))
      expect(highlightConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('My Custom Layer')
    })

    it('trims whitespace from configured title', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        resultsLayerTitle: '  Padded Title  '
      }))
      expect(highlightConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('Padded Title')
    })

    it('returns default when title is empty string', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        resultsLayerTitle: ''
      }))
      expect(highlightConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('QuerySimple Results')
    })

    it('returns default when title is whitespace-only', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({
        resultsLayerTitle: '   '
      }))
      expect(highlightConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('QuerySimple Results')
    })

    it('returns default when resultsLayerTitle is undefined', () => {
      highlightConfigManager.registerConfig(WIDGET_A, makeConfig({}))
      expect(highlightConfigManager.getResultsLayerTitle(WIDGET_A)).toBe('QuerySimple Results')
    })
  })
})
