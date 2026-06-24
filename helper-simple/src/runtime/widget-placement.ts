/**
 * widget-placement.ts
 *
 * Resolves where a widget lives in the app layout so HelperSimple can reveal it
 * regardless of placement. A widget dropped directly into a Section's view (the
 * KC template pattern, no Controller) is opened by switching the section to that
 * view, not by `appActions.openWidget` (which only acts on controller-held widgets).
 *
 * Pure config traversal so it is unit-testable. Works on a plain object or on a
 * jimu-core Immutable app config (seamless-immutable values are plain frozen
 * objects, so Object.keys / property access behave identically).
 */

export interface WidgetPlacement {
  sectionId: string
  viewId: string
}

/** Minimal slice of the app config this resolver reads. */
interface PlacementAppConfig {
  layouts?: { [layoutId: string]: { content?: { [entryId: string]: { widgetId?: string } } } }
  views?: { [viewId: string]: { layout?: string | { [breakpoint: string]: string } } }
  sections?: { [sectionId: string]: { views?: string[] } }
}

/**
 * Find the section + view that hold `widgetId`.
 *
 * Returns null when the widget is not inside a section-driven view (e.g. it sits
 * in a page layout, a controller, or a plain always-visible panel) - the caller
 * falls back to the controller open path in that case.
 */
export function resolveWidgetSectionView(
  widgetId: string,
  appConfig: PlacementAppConfig | null | undefined
): WidgetPlacement | null {
  if (!widgetId || !appConfig) return null

  const layouts = appConfig.layouts || {}
  const views = appConfig.views || {}
  const sections = appConfig.sections || {}

  // 1. Which layouts contain the widget.
  const layoutIds = new Set<string>()
  for (const layoutId of Object.keys(layouts)) {
    const content = layouts[layoutId]?.content || {}
    for (const entryId of Object.keys(content)) {
      if (content[entryId]?.widgetId === widgetId) {
        layoutIds.add(layoutId)
        break
      }
    }
  }
  if (layoutIds.size === 0) return null

  // 2. The view referencing one of those layouts. A view's layout is either a
  //    single layoutId or a responsive map { LARGE, MEDIUM, SMALL } -> layoutId;
  //    all breakpoints of one view resolve to that single view.
  let viewId: string | null = null
  for (const candidateViewId of Object.keys(views)) {
    const layout = views[candidateViewId]?.layout
    if (!layout) continue
    const ids = typeof layout === 'string' ? [layout] : Object.values(layout)
    if (ids.some(id => layoutIds.has(id))) {
      viewId = candidateViewId
      break
    }
  }
  if (!viewId) return null

  // 3. The section that owns that view.
  for (const sectionId of Object.keys(sections)) {
    const sectionViews = sections[sectionId]?.views || []
    if (sectionViews.includes(viewId)) {
      return { sectionId, viewId }
    }
  }
  return null
}

export type NavClickResult = 'clicked' | 'already-selected' | 'not-found'

function isNavItemVisible(el: Element): boolean {
  const he = el as HTMLElement & { checkVisibility?: () => boolean }
  if (typeof he.checkVisibility === 'function') {
    try {
      return he.checkVisibility()
    } catch {
      // fall through to layout-based check
    }
  }
  return !!(he.offsetParent || (he.getClientRects && he.getClientRects().length))
}

/**
 * Click the Navigator tab that controls a section view - the same control the
 * user clicks to switch the section. ExB renders that tab with
 * `aria-controls="${sectionId}_${viewId}"`, so we target it directly and click
 * it, which lets ExB run its real switch (including opening a wrapping sidebar)
 * rather than us fighting the section/sidebar state by hand.
 *
 * Responsive sidebars render the same tab more than once; we click the visible
 * instance. Returns what happened so the caller can log / decide to retry.
 */
export function clickSectionViewNavItem(
  sectionId: string,
  viewId: string,
  root: ParentNode = document
): NavClickResult {
  if (!sectionId || !viewId || !root) return 'not-found'

  const candidates = Array.from(
    root.querySelectorAll(`[aria-controls="${sectionId}_${viewId}"]`)
  ) as HTMLElement[]
  if (candidates.length === 0) return 'not-found'

  const target = candidates.find(isNavItemVisible) || candidates[0]
  if (target.getAttribute('aria-selected') === 'true') return 'already-selected'

  target.click()
  return 'clicked'
}
