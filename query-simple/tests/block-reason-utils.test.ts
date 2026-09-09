import {
  getQueryFormBlockReason,
  getSpatialBlockReason,
  QUERY_FORM_REASON_I18N,
  SPATIAL_REASON_I18N
} from '../src/runtime/block-reason-utils'
import type { SpatialBlockArgs, QueryFormBlockReason, SpatialBlockReason } from '../src/runtime/block-reason-utils'

// Cold-room acceptance tests for the block-reason resolvers.
// Written from the DCE Aug 2026 brief (Items 1 and 5) and the module's declared
// public API only. These resolvers pick the message; they do not decide executability.

const spatialArgs = (overrides: Partial<SpatialBlockArgs> = {}): SpatialBlockArgs => ({
  spatialMode: 'operations',
  hasResults: true,
  hasDrawnGeometry: true,
  hasInputGeometry: true,
  relationshipSelected: true,
  layerCount: 1,
  ...overrides
})

describe('getQueryFormBlockReason', () => {
  it('returns null when the data source is ready and input is valid (P1.6 happy path)', () => {
    expect(getQueryFormBlockReason(true, true)).toBeNull()
  })

  it('returns input-invalid for a ready data source with empty/invalid input (out-of-the-box case)', () => {
    expect(getQueryFormBlockReason(true, false)).toBe('input-invalid')
  })

  it('returns datasource-loading when the data source is not ready, even with valid input', () => {
    expect(getQueryFormBlockReason(false, true)).toBe('datasource-loading')
  })

  it('datasource-loading takes precedence when both blockers are present (more fundamental first)', () => {
    expect(getQueryFormBlockReason(false, false)).toBe('datasource-loading')
  })

  it('is total: every boolean combination resolves to a declared reason or null, never throws', () => {
    const allowed: QueryFormBlockReason[] = ['datasource-loading', 'input-invalid', null]
    for (const ready of [true, false]) {
      for (const valid of [true, false]) {
        let result: QueryFormBlockReason
        expect(() => { result = getQueryFormBlockReason(ready, valid) }).not.toThrow()
        expect(allowed).toContain(result)
      }
    }
  })
})

describe('QUERY_FORM_REASON_I18N', () => {
  it('has exactly one key per non-null query-form reason', () => {
    expect(Object.keys(QUERY_FORM_REASON_I18N).sort()).toEqual(['datasource-loading', 'input-invalid'])
  })

  it('maps each reason to its expected i18n key', () => {
    expect(QUERY_FORM_REASON_I18N['datasource-loading']).toBe('searchBlockedLoading')
    expect(QUERY_FORM_REASON_I18N['input-invalid']).toBe('searchBlockedNoValue')
  })
})

describe('getSpatialBlockReason', () => {
  describe('unblocked', () => {
    it('returns null in operations mode when results, geometry, relationship, and layers are all present (P5.3)', () => {
      expect(getSpatialBlockReason(spatialArgs())).toBeNull()
    })

    it('returns null in draw mode when drawing, geometry, relationship, and layers are all present (P5.3)', () => {
      expect(getSpatialBlockReason(spatialArgs({ spatialMode: 'draw' }))).toBeNull()
    })
  })

  describe('single missing dependency (absence cases, honest reasons)', () => {
    it('operations mode with no results reports no-results', () => {
      expect(getSpatialBlockReason(spatialArgs({ hasResults: false, hasInputGeometry: false }))).toBe('no-results')
    })

    it('draw mode with nothing drawn reports no-drawing', () => {
      expect(getSpatialBlockReason(spatialArgs({
        spatialMode: 'draw', hasDrawnGeometry: false, hasInputGeometry: false
      }))).toBe('no-drawing')
    })

    it('no relationship selected reports no-relationship (operations mode)', () => {
      expect(getSpatialBlockReason(spatialArgs({ relationshipSelected: false }))).toBe('no-relationship')
    })

    it('no relationship selected reports no-relationship (draw mode)', () => {
      expect(getSpatialBlockReason(spatialArgs({ spatialMode: 'draw', relationshipSelected: false }))).toBe('no-relationship')
    })

    it('zero layers reports no-layers (operations mode)', () => {
      expect(getSpatialBlockReason(spatialArgs({ layerCount: 0 }))).toBe('no-layers')
    })

    it('zero layers reports no-layers (draw mode)', () => {
      expect(getSpatialBlockReason(spatialArgs({ spatialMode: 'draw', layerCount: 0 }))).toBe('no-layers')
    })
  })

  describe("Christie's case (Item 5 symptom)", () => {
    it('draw mode, line drawn and assembled, layers selected, NO relationship -> no-relationship', () => {
      expect(getSpatialBlockReason({
        spatialMode: 'draw',
        hasResults: false,
        hasDrawnGeometry: true,
        hasInputGeometry: true,
        relationshipSelected: false,
        layerCount: 2
      })).toBe('no-relationship')
    })
  })

  describe('U1 transient: mode input present, assembled geometry lagging', () => {
    it('operations mode: results present but hasInputGeometry false -> no-results', () => {
      expect(getSpatialBlockReason(spatialArgs({ hasInputGeometry: false }))).toBe('no-results')
    })

    it('draw mode: drawing present but hasInputGeometry false -> no-drawing', () => {
      expect(getSpatialBlockReason(spatialArgs({ spatialMode: 'draw', hasInputGeometry: false }))).toBe('no-drawing')
    })

    // ADAPTED WITH RECORDED REASON (cold-room protocol, r028.143): the cold author flagged this
    // exact case as ambiguity #3 in its report ("a spec question, not a settled fact") and chose
    // the literal form-order reading: transient wins the geometry slot over a missing
    // relationship. Ruling: ACTIONABLE reasons win. The transient self-resolves in milliseconds;
    // reporting "run a search first" to a user who already did (while their real blocker is the
    // unselected relationship) reproduces the Christie-class confusion this feature exists to
    // kill. Brief P5.2 clarified in the same change. Original assertions inverted, not removed.
    it('a missing relationship (actionable) wins over the self-resolving transient', () => {
      expect(getSpatialBlockReason(spatialArgs({
        hasInputGeometry: false, relationshipSelected: false
      }))).toBe('no-relationship')
      expect(getSpatialBlockReason(spatialArgs({
        spatialMode: 'draw', hasInputGeometry: false, relationshipSelected: false
      }))).toBe('no-relationship')
    })
  })

  describe('form-order precedence: one reason at a time (P5.2), pairwise', () => {
    it('operations: geometry missing + relationship missing -> no-results', () => {
      expect(getSpatialBlockReason(spatialArgs({
        hasResults: false, hasInputGeometry: false, relationshipSelected: false
      }))).toBe('no-results')
    })

    it('operations: geometry missing + zero layers -> no-results', () => {
      expect(getSpatialBlockReason(spatialArgs({
        hasResults: false, hasInputGeometry: false, layerCount: 0
      }))).toBe('no-results')
    })

    it('draw: geometry missing + relationship missing -> no-drawing', () => {
      expect(getSpatialBlockReason(spatialArgs({
        spatialMode: 'draw', hasDrawnGeometry: false, hasInputGeometry: false, relationshipSelected: false
      }))).toBe('no-drawing')
    })

    it('draw: geometry missing + zero layers -> no-drawing', () => {
      expect(getSpatialBlockReason(spatialArgs({
        spatialMode: 'draw', hasDrawnGeometry: false, hasInputGeometry: false, layerCount: 0
      }))).toBe('no-drawing')
    })

    it('relationship missing + zero layers -> no-relationship (both modes)', () => {
      expect(getSpatialBlockReason(spatialArgs({
        relationshipSelected: false, layerCount: 0
      }))).toBe('no-relationship')
      expect(getSpatialBlockReason(spatialArgs({
        spatialMode: 'draw', relationshipSelected: false, layerCount: 0
      }))).toBe('no-relationship')
    })

    it('everything missing -> the geometry reason still wins (adding blockers never reorders)', () => {
      expect(getSpatialBlockReason({
        spatialMode: 'operations',
        hasResults: false,
        hasDrawnGeometry: false,
        hasInputGeometry: false,
        relationshipSelected: false,
        layerCount: 0
      })).toBe('no-results')
      expect(getSpatialBlockReason({
        spatialMode: 'draw',
        hasResults: false,
        hasDrawnGeometry: false,
        hasInputGeometry: false,
        relationshipSelected: false,
        layerCount: 0
      })).toBe('no-drawing')
    })
  })

  describe('mode-specific geometry input', () => {
    it('operations mode ignores the draw flag: no drawing but results assembled -> null', () => {
      expect(getSpatialBlockReason(spatialArgs({ hasDrawnGeometry: false }))).toBeNull()
    })

    it('draw mode ignores the results flag: no results but drawing assembled -> null', () => {
      expect(getSpatialBlockReason(spatialArgs({ spatialMode: 'draw', hasResults: false }))).toBeNull()
    })

    it('operations mode: results absent reports no-results even if a stale assembled geometry exists', () => {
      expect(getSpatialBlockReason(spatialArgs({ hasResults: false }))).toBe('no-results')
    })

    it('draw mode: drawing absent reports no-drawing even if a stale assembled geometry exists', () => {
      expect(getSpatialBlockReason(spatialArgs({ spatialMode: 'draw', hasDrawnGeometry: false }))).toBe('no-drawing')
    })
  })

  describe('totality', () => {
    it('never throws and always returns a declared reason or null, over the full flag cross-product', () => {
      const allowed: SpatialBlockReason[] = ['no-drawing', 'no-results', 'no-relationship', 'no-layers', null]
      const bools = [true, false]
      for (const spatialMode of ['operations', 'draw'] as const) {
        for (const hasResults of bools) {
          for (const hasDrawnGeometry of bools) {
            for (const hasInputGeometry of bools) {
              for (const relationshipSelected of bools) {
                for (const layerCount of [0, 1, 5]) {
                  const args: SpatialBlockArgs = {
                    spatialMode, hasResults, hasDrawnGeometry, hasInputGeometry, relationshipSelected, layerCount
                  }
                  let result: SpatialBlockReason
                  expect(() => { result = getSpatialBlockReason(args) }).not.toThrow()
                  expect(allowed).toContain(result)
                }
              }
            }
          }
        }
      }
    })
  })
})

describe('SPATIAL_REASON_I18N', () => {
  it('has exactly one key per non-null spatial reason', () => {
    expect(Object.keys(SPATIAL_REASON_I18N).sort()).toEqual(
      ['no-drawing', 'no-layers', 'no-relationship', 'no-results']
    )
  })

  it('maps each reason to its expected i18n key', () => {
    expect(SPATIAL_REASON_I18N['no-drawing']).toBe('spatialBlockedNoDrawing')
    expect(SPATIAL_REASON_I18N['no-results']).toBe('spatialBlockedNoResults')
    expect(SPATIAL_REASON_I18N['no-relationship']).toBe('spatialBlockedNoRelationship')
    expect(SPATIAL_REASON_I18N['no-layers']).toBe('spatialBlockedNoLayers')
  })
})
