/**
 * Screen-reader announcement strings for programmatic context changes
 * (TODO #38, r028.138).
 *
 * Pure string-building, no React and no jimu binding: the i18n getter is
 * passed in, and `{token}` placeholders are substituted here (matching the
 * house `.replace('{token}', …)` style) so this is unit-testable with a plain
 * label-lookup stub.
 *
 * Used by the single root-level live region (query-task.tsx) to announce
 * context changes that the user's focus does NOT already carry: the
 * programmatic tab switches (auto-to-Results, clear-back, query-switch,
 * results back-button) and the Spatial Operations/Draw mode toggle. User-driven
 * tablist navigation is intentionally NOT announced here; the tabs' focus-read
 * descriptions already cover it.
 */

export type HelpTabId = 'query' | 'spatial' | 'results'
export type SpatialModeId = 'operations' | 'draw'

export type AnnouncementKind =
  | { type: 'tab', tab: HelpTabId, resultCount?: number }
  | { type: 'mode', mode: SpatialModeId }

type MessageGetter = (id: string) => string

const TAB_LABEL_KEYS: Record<HelpTabId, string> = {
  query: 'queryTab',
  spatial: 'spatialTab',
  results: 'resultsTab'
}

const MODE_LABEL_KEYS: Record<SpatialModeId, string> = {
  operations: 'spatialModeOperations',
  draw: 'spatialModeDraw'
}

/**
 * Build the announcement string for a context change. Returns '' for an
 * unrecognized kind so the caller can skip announcing.
 */
export function buildAnnouncement (kind: AnnouncementKind, getI18nMessage: MessageGetter): string {
  if (kind.type === 'mode') {
    const modeLabel = getI18nMessage(MODE_LABEL_KEYS[kind.mode])
    return getI18nMessage('tabHelpModeAnnouncement').replace('{mode}', modeLabel)
  }

  if (kind.type === 'tab') {
    const tabLabel = getI18nMessage(TAB_LABEL_KEYS[kind.tab])
    // Results carries a count when there are records, so a SR user hears that
    // results arrived and how many, not just "Results tab".
    if (kind.tab === 'results' && typeof kind.resultCount === 'number' && kind.resultCount > 0) {
      return getI18nMessage('tabSwitchAnnouncementResults')
        .replace('{tab}', tabLabel)
        .replace('{count}', String(kind.resultCount))
    }
    return getI18nMessage('tabSwitchAnnouncement').replace('{tab}', tabLabel)
  }

  return ''
}
