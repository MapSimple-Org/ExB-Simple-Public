import * as fs from 'fs'
import * as path from 'path'
import { resolveRevealSteps } from '../src/runtime/table-reveal-utils'
import type { RevealStep } from '../src/runtime/table-reveal-utils'

// Cold-room acceptance tests for the View-in-Table reveal resolver (TODO #44).
// Written from docs/specs/TABLE_REVEAL_BRIEF.md (Promises P4, P6, P8, P9) and the
// declared public surface only. The resolver is pure: appConfig in, ordered reveal
// steps out. Dispatches, DOM, and debug logging are out of scope here (brief V4).
//
// Fixtures are structural projections of two real production app configs (widgets,
// layouts, views, sections: only the keys the resolver reads), shipped under
// ./fixtures/table-reveal/ so the suite runs anywhere the widgets are copied.
// r028.159: previously read the full configs from ../../../apps/<id>/config.json,
// which exist only in the private repo and made this suite fail for anyone else
// (the public unit-test package). Assertions are unchanged; only the input source
// moved. Loaded as plain parsed JSON via fs.readFileSync (no resolveJsonModule
// dependency). The brief does not specify whether the resolver expects an
// Immutable-wrapped appConfig; these tests pass plain JSON per the cold-room
// packet's instruction, recorded as an assumption.

const loadAppConfig = (appId: string): unknown =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, `./fixtures/table-reveal/app${appId}-layout.json`), 'utf8'))

const app1Config = loadAppConfig('1')
const app7Config = loadAppConfig('7')

const idsOf = (steps: RevealStep[]): string[] => steps.map(s => s.widgetId)

const stepFor = (steps: RevealStep[], widgetId: string): RevealStep => {
  const matches = steps.filter(s => s.widgetId === widgetId)
  // sizeModes are documented as deduped per step, so one widget+leg pair
  // must not appear as two separate steps.
  expect(matches).toHaveLength(1)
  return matches[0]
}

// ---------------------------------------------------------------------------
// Synthetic minimal configs (mirroring the real ExB config shape: pages ->
// per-size-mode page layout, layouts.<id>.content items, widgets.<id>.layouts
// mapping FIRST/SECOND/DEFAULT per size mode, sidebar config.collapseSide).
// ---------------------------------------------------------------------------

/** A table sitting directly in the page layout for all three size modes: no concealing ancestor. */
const configTableUnconcealed = {
  mainSizeMode: 'LARGE',
  pages: {
    page_0: { id: 'page_0', layout: { LARGE: 'layout_L', MEDIUM: 'layout_M', SMALL: 'layout_S' } }
  },
  layouts: {
    layout_L: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_table' } } },
    layout_M: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_table' } } },
    layout_S: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_table' } } }
  },
  widgets: {
    widget_table: { id: 'widget_table', uri: 'widgets/common/table/', label: 'Table' }
  }
}

/**
 * P9 in minimal synthetic form: the table rides the sidebar's NON-collapse side.
 * collapseSide is FIRST; the table chain lives in SECOND. Expanding this sidebar
 * would be a wrong action, so the resolver must produce no step.
 */
const configTableOnNonCollapseSide = {
  mainSizeMode: 'LARGE',
  pages: {
    page_0: { id: 'page_0', layout: { LARGE: 'layout_root' } }
  },
  layouts: {
    layout_root: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_sidebar' } } },
    layout_first: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_other' } } },
    layout_second: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_table' } } }
  },
  widgets: {
    widget_sidebar: {
      id: 'widget_sidebar',
      uri: 'widgets/layout/sidebar/',
      label: 'Sidebar',
      layouts: { FIRST: { LARGE: 'layout_first' }, SECOND: { LARGE: 'layout_second' } },
      config: { direction: 'HORIZONTAL', collapseSide: 'FIRST', defaultState: 0 }
    },
    widget_other: { id: 'widget_other', uri: 'widgets/common/text/', label: 'Text' },
    widget_table: { id: 'widget_table', uri: 'widgets/common/table/', label: 'Table' }
  }
}

/**
 * sizeModes union/dedupe: ONE sidebar instance conceals the table in BOTH the
 * LARGE and MEDIUM chains (its FIRST/SECOND layout maps carry both modes); in
 * SMALL the table sits unconcealed in the page layout. Expected: exactly one
 * step for the sidebar carrying both producing modes, and no SMALL step.
 */
const configSharedTwinTwoModes = {
  mainSizeMode: 'LARGE',
  pages: {
    page_0: { id: 'page_0', layout: { LARGE: 'layout_rootL', MEDIUM: 'layout_rootM', SMALL: 'layout_rootS' } }
  },
  layouts: {
    layout_rootL: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_sidebar' } } },
    layout_rootM: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_sidebar' } } },
    layout_rootS: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_table' } } },
    layout_firstL: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_other' } } },
    layout_firstM: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_other' } } },
    layout_secondL: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_table' } } },
    layout_secondM: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_table' } } }
  },
  widgets: {
    widget_sidebar: {
      id: 'widget_sidebar',
      uri: 'widgets/layout/sidebar/',
      label: 'Sidebar',
      layouts: {
        FIRST: { LARGE: 'layout_firstL', MEDIUM: 'layout_firstM' },
        SECOND: { LARGE: 'layout_secondL', MEDIUM: 'layout_secondM' }
      },
      config: { direction: 'VERTICAL', collapseSide: 'SECOND', defaultState: 0 }
    },
    widget_other: { id: 'widget_other', uri: 'widgets/common/text/', label: 'Text' },
    widget_table: { id: 'widget_table', uri: 'widgets/common/table/', label: 'Table' }
  }
}

/** A config with widgets and layouts but NO table widget anywhere. */
const configNoTable = {
  mainSizeMode: 'LARGE',
  pages: {
    page_0: { id: 'page_0', layout: { LARGE: 'layout_root' } }
  },
  layouts: {
    layout_root: { type: 'FIXED', order: ['0'], content: { 0: { type: 'WIDGET', widgetId: 'widget_other' } } }
  },
  widgets: {
    widget_other: { id: 'widget_other', uri: 'widgets/common/text/', label: 'Text' }
  }
}

// ---------------------------------------------------------------------------
// App 1: table widget_13 under one concealing sidebar twin per size mode.
// Chain baseline (probe union-walk, brief Status block):
//   LARGE:  widget_13 -> layout_17  = widget_12.SECOND.LARGE,  collapseSide SECOND
//   MEDIUM: widget_13 -> layout_86  = widget_58.SECOND.MEDIUM, collapseSide SECOND
//   SMALL:  widget_13 -> layout_95  = widget_61.SECOND.SMALL,  collapseSide SECOND
// ---------------------------------------------------------------------------

describe('resolveRevealSteps - app 1 (all sidebar ancestors conceal)', () => {
  const steps = resolveRevealSteps(app1Config, 'widget_13')

  it('produces exactly the three concealing sidebar twins, and nothing else', () => {
    expect(idsOf(steps).sort()).toEqual(['widget_12', 'widget_58', 'widget_61'])
  })

  it('every step is a sidebar-expand leg', () => {
    expect(steps.length).toBeGreaterThan(0)
    for (const step of steps) {
      expect(step.leg).toBe('sidebar-expand')
    }
  })

  it('each twin carries the single size mode whose chain produced it (P6)', () => {
    expect(stepFor(steps, 'widget_12').sizeModes).toEqual(['LARGE'])
    expect(stepFor(steps, 'widget_58').sizeModes).toEqual(['MEDIUM'])
    expect(stepFor(steps, 'widget_61').sizeModes).toEqual(['SMALL'])
  })

  it('sidebar-expand steps carry no viewId (section-nav only per the declared surface)', () => {
    for (const step of steps) {
      expect(step.viewId).toBeUndefined()
    }
  })
})

// ---------------------------------------------------------------------------
// App 7: the DISCRIMINATING fixture (P9). Per size mode the table chain climbs
// through THREE sidebar ancestors, but only the innermost conceals it:
//   LARGE:  widget_22 -> widget_19(column) -> widget_17 (SECOND=chain, collapseSide SECOND: CONCEALS)
//           -> widget_26 (chain rides SECOND, collapseSide FIRST: toolbox pane, NOT concealing)
//           -> widget_15 (chain rides SECOND, collapseSide FIRST: nav-labels pane, NOT concealing)
//   MEDIUM: widget_22 -> widget_140 -> widget_139 (CONCEALS) -> widget_136 (no) -> widget_135 (no)
//   SMALL:  widget_22 -> widget_147 -> widget_146 (CONCEALS) -> widget_143 (no) -> widget_142 (no)
// ---------------------------------------------------------------------------

describe('resolveRevealSteps - app 7 (P9: collapse-side discrimination)', () => {
  const steps = resolveRevealSteps(app7Config, 'widget_22')

  it('includes each concealing sidebar twin', () => {
    const ids = idsOf(steps)
    expect(ids).toContain('widget_17')
    expect(ids).toContain('widget_139')
    expect(ids).toContain('widget_146')
  })

  it('excludes ALL six non-concealing sidebar ancestors, each asserted by id (P9)', () => {
    const ids = idsOf(steps)
    // sdbSidebarPlusMap family: collapse side holds the toolbox pane, not the table.
    expect(ids).not.toContain('widget_26')
    expect(ids).not.toContain('widget_136')
    expect(ids).not.toContain('widget_143')
    // sdbMainSidebar family: collapse side holds the nav-labels pane, not the table.
    expect(ids).not.toContain('widget_15')
    expect(ids).not.toContain('widget_135')
    expect(ids).not.toContain('widget_142')
  })

  it('produces no step for sidebars outside the table chain (MobileSidebar widget_149)', () => {
    expect(idsOf(steps)).not.toContain('widget_149')
  })

  it('produces exactly the three concealing twins and nothing else', () => {
    expect(idsOf(steps).sort()).toEqual(['widget_139', 'widget_146', 'widget_17'])
  })

  it('every step is a sidebar-expand leg with no viewId', () => {
    for (const step of steps) {
      expect(step.leg).toBe('sidebar-expand')
      expect(step.viewId).toBeUndefined()
    }
  })

  it('each twin carries the single size mode whose chain produced it (P6)', () => {
    expect(stepFor(steps, 'widget_17').sizeModes).toEqual(['LARGE'])
    expect(stepFor(steps, 'widget_139').sizeModes).toEqual(['MEDIUM'])
    expect(stepFor(steps, 'widget_146').sizeModes).toEqual(['SMALL'])
  })
})

// ---------------------------------------------------------------------------
// sizeModes union/dedupe on a synthetic shared twin (the real apps never share
// one sidebar instance across modes, so this promise needs a synthetic).
// ---------------------------------------------------------------------------

describe('resolveRevealSteps - sizeModes union and dedupe', () => {
  it('one sidebar concealing the table in two modes yields ONE step carrying both modes', () => {
    const steps = resolveRevealSteps(configSharedTwinTwoModes, 'widget_table')
    expect(idsOf(steps)).toEqual(['widget_sidebar'])
    const step = stepFor(steps, 'widget_sidebar')
    expect(step.leg).toBe('sidebar-expand')
    expect([...step.sizeModes].sort()).toEqual(['LARGE', 'MEDIUM'])
  })
})

// ---------------------------------------------------------------------------
// Absence cases (P4 / P8): contained, honest, never a throw.
// ---------------------------------------------------------------------------

describe('resolveRevealSteps - absence cases (P4/P8)', () => {
  it('unknown tableWidgetId against a real config resolves to no steps', () => {
    expect(resolveRevealSteps(app1Config, 'widget_9999')).toEqual([])
  })

  it('a config that has no table widget at all resolves to no steps', () => {
    expect(resolveRevealSteps(configNoTable, 'widget_13')).toEqual([])
  })

  it('a table with NO concealing ancestor is an honest no-op: no steps', () => {
    expect(resolveRevealSteps(configTableUnconcealed, 'widget_table')).toEqual([])
  })

  it('a table riding the sidebar\'s NON-collapse side gets NO step (P9, minimal synthetic)', () => {
    expect(resolveRevealSteps(configTableOnNonCollapseSide, 'widget_table')).toEqual([])
  })

  it('degenerate appConfigs resolve to [] and never throw', () => {
    const degenerates: unknown[] = [
      {},
      { widgets: {} },
      { layouts: {} },
      { widgets: {}, layouts: {} },
      { mainSizeMode: 'LARGE', pages: {}, widgets: {}, layouts: {} }
    ]
    for (const config of degenerates) {
      let result: RevealStep[] = []
      expect(() => { result = resolveRevealSteps(config, 'widget_13') }).not.toThrow()
      expect(result).toEqual([])
    }
  })
})

// ---------------------------------------------------------------------------
// Determinism and totality.
// ---------------------------------------------------------------------------

describe('resolveRevealSteps - determinism and totality', () => {
  it('same input twice produces deep-equal output (app 1)', () => {
    expect(resolveRevealSteps(app1Config, 'widget_13'))
      .toEqual(resolveRevealSteps(app1Config, 'widget_13'))
  })

  it('same input twice produces deep-equal output (app 7)', () => {
    expect(resolveRevealSteps(app7Config, 'widget_22'))
      .toEqual(resolveRevealSteps(app7Config, 'widget_22'))
  })

  it('never throws for any fixture in this suite', () => {
    expect(() => resolveRevealSteps(app1Config, 'widget_13')).not.toThrow()
    expect(() => resolveRevealSteps(app7Config, 'widget_22')).not.toThrow()
    expect(() => resolveRevealSteps(configTableUnconcealed, 'widget_table')).not.toThrow()
    expect(() => resolveRevealSteps(configTableOnNonCollapseSide, 'widget_table')).not.toThrow()
    expect(() => resolveRevealSteps(configSharedTwinTwoModes, 'widget_table')).not.toThrow()
    expect(() => resolveRevealSteps(configNoTable, 'widget_13')).not.toThrow()
  })

  it('every produced step is structurally well-formed', () => {
    const allSteps = [
      ...resolveRevealSteps(app1Config, 'widget_13'),
      ...resolveRevealSteps(app7Config, 'widget_22')
    ]
    const legs = ['sidebar-expand', 'controller-open', 'section-nav']
    for (const step of allSteps) {
      expect(typeof step.widgetId).toBe('string')
      expect(step.widgetId.length).toBeGreaterThan(0)
      expect(legs).toContain(step.leg)
      expect(Array.isArray(step.sizeModes)).toBe(true)
      expect(step.sizeModes.length).toBeGreaterThan(0)
      // deduped, per the declared surface
      expect(new Set(step.sizeModes).size).toBe(step.sizeModes.length)
    }
  })
})
