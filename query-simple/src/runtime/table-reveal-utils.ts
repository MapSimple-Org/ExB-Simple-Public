/**
 * table-reveal-utils (r028.157, TODO #44, docs/specs/TABLE_REVEAL_BRIEF.md)
 *
 * View in Table now REVEALS the Table widget instead of silently loading data into a hidden pane -
 * a bug fix (Adam's ruling: the behavior users always expected), no config toggle.
 *
 * Two parts:
 *  - resolveRevealSteps: PURE. App config in, ordered reveal steps out. No dispatches, no DOM, no
 *    store access - cold-room tested against the real apps/1 and apps/7 configs (the probe's
 *    union-walk logs are the ground-truth baseline; app 7 is the discriminating fixture, P9).
 *  - executeRevealSteps: the side effects. Each leg is the same dispatch the framework's own
 *    controls make (sidebar toggle / controller open / Navigator tab click per r028.140).
 *
 * Logged decision (deviation from the brief's searchUtils lean, reason recorded): the resolver
 * hand-walks the config's widget/section/view layout maps instead of calling
 * jimu-layouts searchUtils. The pure-module contract (plain JSON fixtures in Jest) cannot be met
 * by a framework util bound to Immutable app state; seamless-immutable reads behave like plain
 * objects, so ONE walk serves both the runtime store config and plain JSON. Same effective walk
 * as DataActionManager's, validated against the probe baseline in both apps.
 *
 * The crux (CRR finding P9, probe-confirmed): a sidebar ancestor produces a step ONLY when the
 * table's chain enters through that sidebar's COLLAPSE side. App 7 has three sidebar ancestors
 * whose collapse sides hold the toolbox/nav panes instead - dispatching expand at those would
 * reopen panes the user may have deliberately closed (invisible in the probe only because they
 * default open). Excluded by the side check, pinned by the cold-room tests.
 */

import { getAppStore, appActions } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

export type RevealLeg = 'sidebar-expand' | 'controller-open' | 'section-nav'

export interface RevealStep {
  widgetId: string
  leg: RevealLeg
  sizeModes: string[]
  viewId?: string
}

const SIDEBAR_URI = 'widgets/layout/sidebar/'
const CONTROLLER_URI = 'widgets/common/controller/'

interface ContainerRef {
  kind: 'widget' | 'view'
  id: string
  /** widgets only: which side of the owner the layout is (sidebar FIRST/SECOND, etc.) */
  side?: string
}

/** layoutId -> owning container, for one size mode. Built defensively; bad shapes yield gaps, not throws. */
function buildLayoutOwners (appConfig: any, sizeMode: string): { [layoutId: string]: ContainerRef } {
  const owners: { [layoutId: string]: ContainerRef } = {}
  const widgets = appConfig?.widgets ?? {}
  Object.keys(widgets).forEach(wid => {
    const layouts = widgets[wid]?.layouts
    if (!layouts) return
    Object.keys(layouts).forEach(side => {
      const layoutId = layouts[side]?.[sizeMode]
      if (layoutId) owners[layoutId] = { kind: 'widget', id: wid, side }
    })
  })
  const views = appConfig?.views ?? {}
  Object.keys(views).forEach(vid => {
    const layoutId = views[vid]?.layout?.[sizeMode]
    if (layoutId) owners[layoutId] = { kind: 'view', id: vid }
  })
  return owners
}

/** layoutIds (for one size mode) whose content contains the given widget. */
function layoutsContainingWidget (appConfig: any, widgetId: string): string[] {
  const hits: string[] = []
  const layouts = appConfig?.layouts ?? {}
  Object.keys(layouts).forEach(lid => {
    const content = layouts[lid]?.content ?? {}
    const found = Object.keys(content).some(k => content[k]?.widgetId === widgetId)
    if (found) hits.push(lid)
  })
  return hits
}

/** sectionId owning a view, from appConfig.sections[..].views arrays. */
function sectionOfView (appConfig: any, viewId: string): string | null {
  const sections = appConfig?.sections ?? {}
  const ids = Object.keys(sections)
  for (const sid of ids) {
    const views = sections[sid]?.views ?? []
    for (let i = 0; i < views.length; i++) {
      if (views[i] === viewId) return sid
    }
  }
  return null
}

/**
 * PURE. Walk up from the table per size mode; emit a step per concealing ancestor:
 * sidebar whose collapse side carries the chain, controller, or section view. Unknown or absent
 * placements emit nothing (P4/P8); never throws. Steps ordered outermost-last per mode (the
 * executor's dispatches are order-independent; nav-clicks fire as encountered).
 */
export function resolveRevealSteps (appConfig: unknown, tableWidgetId: string): RevealStep[] {
  const steps: RevealStep[] = []
  try {
    const cfg: any = appConfig
    if (!cfg?.widgets?.[tableWidgetId]) return []
    const sizeModes = ['LARGE', 'MEDIUM', 'SMALL']

    sizeModes.forEach(mode => {
      const owners = buildLayoutOwners(cfg, mode)
      const seen = new Set<string>()
      let frontier = [tableWidgetId]
      // Multi-parent safe (a widget can appear in several layouts of one mode); loop-guarded.
      while (frontier.length > 0) {
        const next: string[] = []
        frontier.forEach(id => {
          layoutsContainingWidget(cfg, id).forEach(lid => {
            const owner = owners[lid]
            if (!owner || seen.has(`${owner.kind}:${owner.id}`)) return
            seen.add(`${owner.kind}:${owner.id}`)
            if (owner.kind === 'widget') {
              const w = cfg.widgets?.[owner.id]
              const uri = String(w?.uri ?? '')
              if (uri === SIDEBAR_URI) {
                // P9: only the collapse side conceals; the other side is always visible.
                const collapseSide = w?.config?.collapseSide
                if (collapseSide && owner.side === collapseSide) {
                  addStep(steps, { widgetId: owner.id, leg: 'sidebar-expand', sizeModes: [mode] })
                }
              } else if (uri === CONTROLLER_URI) {
                addStep(steps, { widgetId: owner.id, leg: 'controller-open', sizeModes: [mode] })
              }
              next.push(owner.id)
            } else {
              // View boundary: reveal = activate this view in its section (r028.140 nav-click).
              const sid = sectionOfView(cfg, owner.id)
              if (sid) {
                addStep(steps, { widgetId: sid, leg: 'section-nav', sizeModes: [mode], viewId: owner.id })
              }
              // Sections sit inside layouts too - keep walking from the section id.
              if (sid) next.push(sid)
            }
          })
          // Sections appear in layout content as sectionId items; cover walking past them.
          layoutsContainingSection(cfg, id).forEach(lid => {
            const owner = owners[lid]
            if (owner && !seen.has(`${owner.kind}:${owner.id}`)) {
              seen.add(`${owner.kind}:${owner.id}`)
              if (owner.kind === 'widget') next.push(owner.id)
            }
          })
        })
        frontier = next
      }
    })
  } catch {
    // P4: honest empty result over a cascade. The executor logs the no-op.
    return steps
  }
  return steps
}

/** layoutIds whose content contains the given SECTION id (sections are layout items too). */
function layoutsContainingSection (appConfig: any, sectionId: string): string[] {
  const hits: string[] = []
  const layouts = appConfig?.layouts ?? {}
  Object.keys(layouts).forEach(lid => {
    const content = layouts[lid]?.content ?? {}
    const found = Object.keys(content).some(k => content[k]?.sectionId === sectionId)
    if (found) hits.push(lid)
  })
  return hits
}

function addStep (steps: RevealStep[], step: RevealStep): void {
  const existing = steps.find(s => s.widgetId === step.widgetId && s.leg === step.leg && s.viewId === step.viewId)
  if (existing) {
    step.sizeModes.forEach(m => { if (!existing.sizeModes.includes(m)) existing.sizeModes.push(m) })
  } else {
    steps.push(step)
  }
}

/**
 * Side effects: run the steps. Sidebar/controller legs are store dispatches (the same ones the
 * framework's own toggle/controller make); section-nav clicks the real Navigator tab so ExB runs
 * its own view switch (r028.140 - a raw state dispatch desyncs selector and content). All wrapped:
 * a reveal failure must never break the data path (P3).
 */
export function executeRevealSteps (steps: RevealStep[], tableWidgetId: string): void {
  const outcomes: Array<{ widgetId: string, leg: RevealLeg, outcome: string }> = []
  try {
    const store = getAppStore()
    steps.forEach(step => {
      try {
        if (step.leg === 'sidebar-expand') {
          store.dispatch(appActions.widgetStatePropChange(step.widgetId, 'collapse', true))
          outcomes.push({ widgetId: step.widgetId, leg: step.leg, outcome: 'dispatched' })
        } else if (step.leg === 'controller-open') {
          store.dispatch(appActions.openWidget(step.widgetId))
          outcomes.push({ widgetId: step.widgetId, leg: step.leg, outcome: 'dispatched' })
        } else {
          // section-nav: click the visible Navigator tab for section_view (skip if already selected)
          const selector = `[aria-controls="${step.widgetId}_${step.viewId}"]`
          const candidates = Array.from(document.querySelectorAll<HTMLElement>(selector))
          const visible = candidates.find(el => el.offsetParent !== null)
          if (!visible) {
            outcomes.push({ widgetId: step.widgetId, leg: step.leg, outcome: 'nav-tab-not-found' })
          } else if (visible.getAttribute('aria-selected') === 'true') {
            outcomes.push({ widgetId: step.widgetId, leg: step.leg, outcome: 'already-selected' })
          } else {
            visible.click()
            outcomes.push({ widgetId: step.widgetId, leg: step.leg, outcome: 'clicked' })
          }
        }
      } catch (e) {
        outcomes.push({ widgetId: step.widgetId, leg: step.leg, outcome: `error: ${e instanceof Error ? e.message : String(e)}` })
      }
    })
  } catch (e) {
    debugLogger.log('VIEW-TABLE', { action: 'table-reveal', tableWidgetId, result: 'store-error', error: e instanceof Error ? e.message : String(e) })
    return
  }
  debugLogger.log('VIEW-TABLE', {
    action: 'table-reveal',
    tableWidgetId,
    steps,
    outcomes,
    result: steps.length > 0 ? 'executed' : 'no-op-nothing-conceals-the-table'
  })
}

/** Convenience: resolve + execute + log, from the app store's current config. */
export function revealTableWidget (tableWidgetId: string): void {
  try {
    const appConfig = getAppStore().getState()?.appConfig
    const steps = resolveRevealSteps(appConfig, tableWidgetId)
    executeRevealSteps(steps, tableWidgetId)
  } catch (e) {
    debugLogger.log('VIEW-TABLE', { action: 'table-reveal', tableWidgetId, result: 'error', error: e instanceof Error ? e.message : String(e) })
  }
}
