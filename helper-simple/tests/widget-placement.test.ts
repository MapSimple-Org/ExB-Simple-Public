import { resolveWidgetSectionView, clickSectionViewNavItem } from '../src/runtime/widget-placement'

/**
 * The resolver is a pure config traversal, so these tests feed minimal app-config
 * fixtures and assert what it SHOULD return: the section + view that hold a widget,
 * or null when the widget is not inside a section-driven view.
 */
describe('resolveWidgetSectionView', () => {
  // Mirrors the KC template: QS (widget_127) sits in view_19 with responsive
  // LARGE/MEDIUM/SMALL layouts, inside section_1.
  const kcConfig = {
    layouts: {
      layout_119: { content: { e1: { widgetId: 'widget_127' }, e2: { widgetId: 'widget_99' } } },
      layout_133: { content: { e1: { widgetId: 'widget_127' } } },
      layout_153: { content: { e1: { widgetId: 'widget_127' } } },
      layout_single: { content: { e1: { widgetId: 'widget_single' } } },
      page_layout: { content: { e1: { widgetId: 'widget_map' } } }, // not referenced by any view
      layout_orphan: { content: { e1: { widgetId: 'widget_orphan' } } }
    },
    views: {
      view_1: { layout: 'layout_other' },
      view_19: { layout: { LARGE: 'layout_119', MEDIUM: 'layout_133', SMALL: 'layout_153' } },
      view_single: { layout: 'layout_single' },
      view_orphan: { layout: 'layout_orphan' } // referenced by no section
    },
    sections: {
      section_1: { views: ['view_1', 'view_19'] },
      section_2: { views: ['view_single'] }
    }
  }

  it('resolves a widget in a responsive view to its single section + view', () => {
    expect(resolveWidgetSectionView('widget_127', kcConfig)).toEqual({
      sectionId: 'section_1',
      viewId: 'view_19'
    })
  })

  it('resolves a widget in a view with a plain (non-responsive) layout', () => {
    expect(resolveWidgetSectionView('widget_single', kcConfig)).toEqual({
      sectionId: 'section_2',
      viewId: 'view_single'
    })
  })

  it('returns null for a widget only in a page layout (no view references it)', () => {
    expect(resolveWidgetSectionView('widget_map', kcConfig)).toBeNull()
  })

  it('returns null when a view holds the widget but no section owns that view', () => {
    expect(resolveWidgetSectionView('widget_orphan', kcConfig)).toBeNull()
  })

  it('returns null for a widget that is not present anywhere', () => {
    expect(resolveWidgetSectionView('widget_nope', kcConfig)).toBeNull()
  })

  it('returns null for missing widgetId or appConfig', () => {
    expect(resolveWidgetSectionView('', kcConfig)).toBeNull()
    expect(resolveWidgetSectionView('widget_127', null)).toBeNull()
    expect(resolveWidgetSectionView('widget_127', undefined)).toBeNull()
    expect(resolveWidgetSectionView('widget_127', {})).toBeNull()
  })
})

/**
 * The nav-click helper targets the real Navigator tab ExB renders with
 * aria-controls="${sectionId}_${viewId}" and clicks it. Tests use a jsdom
 * fragment scoped via the `root` arg so they never touch the real document.
 */
describe('clickSectionViewNavItem', () => {
  function makeNav(ariaSelected = 'false'): { root: HTMLElement, tab: HTMLElement } {
    const root = document.createElement('div')
    root.innerHTML =
      `<ul><li title="eSearch"><a role="tab" aria-controls="section_1_view_19" ` +
      `aria-selected="${ariaSelected}">eSearch</a></li></ul>`
    return { root, tab: root.querySelector('a') as HTMLElement }
  }

  it('clicks the matching nav tab and returns "clicked"', () => {
    const { root, tab } = makeNav('false')
    const onClick = jest.fn()
    tab.addEventListener('click', onClick)
    expect(clickSectionViewNavItem('section_1', 'view_19', root)).toBe('clicked')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not click a tab that is already selected', () => {
    const { root, tab } = makeNav('true')
    const onClick = jest.fn()
    tab.addEventListener('click', onClick)
    expect(clickSectionViewNavItem('section_1', 'view_19', root)).toBe('already-selected')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('returns "not-found" when no tab controls that section view', () => {
    const root = document.createElement('div')
    root.innerHTML = '<a aria-controls="section_1_view_99">other</a>'
    expect(clickSectionViewNavItem('section_1', 'view_19', root)).toBe('not-found')
  })

  it('returns "not-found" for missing args', () => {
    const root = document.createElement('div')
    expect(clickSectionViewNavItem('', 'view_19', root)).toBe('not-found')
    expect(clickSectionViewNavItem('section_1', '', root)).toBe('not-found')
  })
})
