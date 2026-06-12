/** @jsx jsx */
// TabHelp — single "?" button + active-tab help popover (TAB_HELP_SPEC Phases 1-4, TODO #36)
// Phase 2 (r028.134): per-tab org-configured markdown via widgetConfigManager, falling
// back to the shipped i18n defaults when unset/blank.
// Phase 3 (r028.135): master enable switch (off removes button + SR descriptions) and
// configurable popover background with auto-contrast text.
// Phase 4 (r028.136): SpatialModeHelp — the same pattern for the Operations/Draw mode
// toggle, replacing the old hardcoded one-line description (r025.061). Master switch
// and background color govern both.
// Polish (r028.137): change-signal halo pulse on context change + mount, and SETTINGS
// debug logging for the config reads.
import { React, css, jsx, focusElementInKeyboardMode } from 'jimu-core'
import { Button } from 'jimu-ui'
import { HelpOutlined } from 'jimu-icons/outlined/suggested/help'
import { convertTemplateToHtml, stripMarkdownToText } from '../markdown-template-utils'
import { createQuerySimpleDebugLogger, widgetConfigManager } from 'widgets/shared-code/mapsimple-common'
import { pickTextColorForBackground } from '../contrast-utils'

const debugLogger = createQuerySimpleDebugLogger()

export type HelpTabId = 'query' | 'spatial' | 'results'
export type SpatialModeId = 'operations' | 'draw'

interface TabHelpProps {
  widgetId: string
  activeTab: HelpTabId
  getI18nMessage: (id: string) => string
  /** Tab strip buttons captured via the jimu Tab innerRef, for aria-describedby wiring */
  tabRefs: Record<HelpTabId, React.RefObject<HTMLButtonElement>>
}

const TAB_TITLE_KEYS: Record<HelpTabId, string> = {
  query: 'queryTab',
  spatial: 'spatialTab',
  results: 'resultsTab'
}

const TAB_HELP_KEYS: Record<HelpTabId, string> = {
  query: 'tabHelpQueryDefault',
  spatial: 'tabHelpSpatialDefault',
  results: 'tabHelpResultsDefault'
}

const CONFIG_TEXT_GETTERS: Record<HelpTabId, (widgetId: string) => string | undefined> = {
  query: (id) => widgetConfigManager.getTabHelpQueryText(id),
  spatial: (id) => widgetConfigManager.getTabHelpSpatialText(id),
  results: (id) => widgetConfigManager.getTabHelpResultsText(id)
}

const MODE_TITLE_KEYS: Record<SpatialModeId, string> = {
  operations: 'spatialModeOperations',
  draw: 'spatialModeDraw'
}

const MODE_HELP_KEYS: Record<SpatialModeId, string> = {
  operations: 'tabHelpOperationsDefault',
  draw: 'tabHelpDrawDefault'
}

const MODE_CONFIG_GETTERS: Record<SpatialModeId, (widgetId: string) => string | undefined> = {
  operations: (id) => widgetConfigManager.getTabHelpOperationsText(id),
  draw: (id) => widgetConfigManager.getTabHelpDrawText(id)
}

const srOnly = css`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`

// r028.137: one-shot halo pulse signalling that the help content changed with the
// active tab/mode. Fires only on a real context change (never on mount, never while
// the popover is open) and honors prefers-reduced-motion.
const flashHaloStyle = css`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--sys-color-primary-main);
  opacity: 0;
  pointer-events: none;
  animation: tab-help-flash 750ms ease-out;

  @keyframes tab-help-flash {
    0% {
      opacity: 0.35;
      transform: scale(0.85);
    }
    100% {
      opacity: 0;
      transform: scale(1.4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

/** Shared "?" button + calcite-popover pair. Placement css comes from the caller. */
interface HelpPopoverButtonProps {
  buttonId: string
  heading: string
  helpMarkdown: string
  ariaLabel: string
  /** Identifies what the help describes (active tab/mode). A change pulses the button. */
  contextId: string
  bgColor?: string
  textColor?: string
  buttonCss?: ReturnType<typeof css>
}

function HelpPopoverButton (props: HelpPopoverButtonProps) {
  const { buttonId, heading, helpMarkdown, ariaLabel, contextId, bgColor, textColor, buttonCss } = props
  const [open, setOpen] = React.useState(false)
  // Starts at 1 so the pulse also fires on mount (user call 2026-06-12: the help is
  // new and useful, draw the eye to it on load). Note this means every widget
  // panel reopen pulses once too, not just first page load.
  const [flashCount, setFlashCount] = React.useState(1)
  const prevContextRef = React.useRef(contextId)
  const helpHtml = convertTemplateToHtml(helpMarkdown)

  // Pulse on every real context change. If the popover was open, the tab click
  // just light-dismissed it (autoClose), so the pulse is the only signal left.
  React.useEffect(() => {
    if (prevContextRef.current !== contextId) {
      prevContextRef.current = contextId
      setFlashCount(count => count + 1)
    }
  }, [contextId])

  return (
    <React.Fragment>
      <Button
        id={buttonId}
        size='sm'
        icon
        type='tertiary'
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup='dialog'
        onClick={() => setOpen(prev => !prev)}
        css={[css`position: relative;`, buttonCss]}
      >
        <HelpOutlined color='var(--sys-color-primary-main)' size='m' />
        {flashCount > 0 && (
          <span key={flashCount} aria-hidden='true' css={flashHaloStyle} />
        )}
      </Button>
      {open && (
        <calcite-popover
          referenceElement={buttonId}
          placement='bottom-end'
          overlayPositioning='fixed'
          triggerDisabled={true}
          autoClose
          closable
          label={ariaLabel}
          open={open}
          oncalcitePopoverClose={() => {
            setOpen(false)
            focusElementInKeyboardMode(document.getElementById(buttonId))
          }}
          style={{
            '--calcite-popover-max-size-x': '320px',
            maxWidth: '320px',
            width: '100%',
            ...(bgColor
              ? {
                  '--calcite-color-foreground-1': bgColor,
                  '--calcite-color-text-1': textColor
                }
              : {})
          } as React.CSSProperties}
        >
          <div css={css`padding: 12px; max-width: 320px;`} style={textColor ? { color: textColor } : undefined}>
            <h5 css={css`margin: 0 0 6px; font-size: 0.875rem; font-weight: 600;`}>
              {heading}
            </h5>
            <div
              css={css`
                font-size: 0.8125rem;
                line-height: 1.5;
                p { margin: 0 0 8px; }
                p:last-child { margin-bottom: 0; }
              `}
              dangerouslySetInnerHTML={{ __html: helpHtml }}
            />
          </div>
        </calcite-popover>
      )}
    </React.Fragment>
  )
}

export function TabHelp (props: TabHelpProps) {
  const { widgetId, activeTab, getI18nMessage, tabRefs } = props

  // Phase 3: master switch + configurable background with auto-contrast text
  const enabled = widgetConfigManager.getTabHelpEnabled(widgetId)
  const bgColor = widgetConfigManager.getTabHelpBackgroundColor(widgetId)
  const textColor = bgColor ? pickTextColorForBackground(bgColor) : undefined

  // r028.137: SETTINGS log for tab help config (mirrors the singletonConfigRead sites)
  debugLogger.log('SETTINGS', {
    event: 'singletonConfigRead',
    source: 'tab-help',
    widgetId,
    activeTab,
    tabHelpEnabled: enabled,
    tabHelpBackgroundColor: bgColor ?? '(theme default)',
    autoContrastTextColor: textColor ?? '(theme default)',
    queryTextSource: CONFIG_TEXT_GETTERS.query(widgetId) !== undefined ? 'config' : 'default',
    spatialTextSource: CONFIG_TEXT_GETTERS.spatial(widgetId) !== undefined ? 'config' : 'default',
    resultsTextSource: CONFIG_TEXT_GETTERS.results(widgetId) !== undefined ? 'config' : 'default'
  })

  // jimu's Tab forwards no aria props (TabProps is title/id/disabled only), so the
  // per-tab descriptions are stamped onto the tab buttons after render via innerRef.
  // Re-runs every render: cheap (3 setAttribute), survives jimu re-renders. The
  // cleanup keeps the buttons attribute-free when disabled or unmounted, so no
  // aria-describedby is left pointing at description spans that no longer exist.
  React.useEffect(() => {
    (Object.keys(tabRefs) as HelpTabId[]).forEach((tab) => {
      const btn = tabRefs[tab].current
      if (!btn) return
      if (enabled) {
        btn.setAttribute('aria-describedby', `${widgetId}-tab-help-desc-${tab}`)
      } else {
        btn.removeAttribute('aria-describedby')
      }
    })
    return () => {
      (Object.keys(tabRefs) as HelpTabId[]).forEach((tab) => {
        tabRefs[tab].current?.removeAttribute('aria-describedby')
      })
    }
  })

  // Phase 2: configured org text wins; blank/unset falls back to the shipped default
  const resolveHelpText = (tab: HelpTabId): string =>
    CONFIG_TEXT_GETTERS[tab](widgetId) ?? getI18nMessage(TAB_HELP_KEYS[tab])

  if (!enabled) return null

  return (
    <React.Fragment>
      {(Object.keys(TAB_HELP_KEYS) as HelpTabId[]).map((tab) => (
        <span key={tab} id={`${widgetId}-tab-help-desc-${tab}`} css={srOnly}>
          {stripMarkdownToText(resolveHelpText(tab as HelpTabId))}
        </span>
      ))}
      <HelpPopoverButton
        buttonId={`tab-help-btn-${widgetId}`}
        heading={getI18nMessage(TAB_TITLE_KEYS[activeTab])}
        helpMarkdown={resolveHelpText(activeTab)}
        ariaLabel={getI18nMessage('tabHelpButtonLabel')}
        contextId={activeTab}
        bgColor={bgColor}
        textColor={textColor}
        buttonCss={css`
          position: absolute;
          top: 5px;
          right: 8px;
          z-index: 2;
        `}
      />
    </React.Fragment>
  )
}

interface SpatialModeHelpProps {
  widgetId: string
  spatialMode: SpatialModeId
  getI18nMessage: (id: string) => string
}

/**
 * Phase 4 (r028.136): the "?" for the Operations/Draw mode toggle. Same resolve
 * semantics as the main tabs (configured markdown wins, shipped default fallback),
 * same master switch, same background + auto-contrast. The SR description spans
 * here pair with aria-describedby set directly on the mode toggle buttons in
 * SpatialTabContent (our own buttons, no innerRef indirection needed).
 */
export function SpatialModeHelp (props: SpatialModeHelpProps) {
  const { widgetId, spatialMode, getI18nMessage } = props

  const enabled = widgetConfigManager.getTabHelpEnabled(widgetId)
  const bgColor = widgetConfigManager.getTabHelpBackgroundColor(widgetId)
  const textColor = bgColor ? pickTextColorForBackground(bgColor) : undefined

  // r028.137: SETTINGS log for the Operations/Draw mode help config
  debugLogger.log('SETTINGS', {
    event: 'singletonConfigRead',
    source: 'tab-help-mode',
    widgetId,
    spatialMode,
    tabHelpEnabled: enabled,
    tabHelpBackgroundColor: bgColor ?? '(theme default)',
    operationsTextSource: MODE_CONFIG_GETTERS.operations(widgetId) !== undefined ? 'config' : 'default',
    drawTextSource: MODE_CONFIG_GETTERS.draw(widgetId) !== undefined ? 'config' : 'default'
  })

  const resolveModeText = (mode: SpatialModeId): string =>
    MODE_CONFIG_GETTERS[mode](widgetId) ?? getI18nMessage(MODE_HELP_KEYS[mode])

  if (!enabled) return null

  return (
    <React.Fragment>
      {(Object.keys(MODE_HELP_KEYS) as SpatialModeId[]).map((mode) => (
        <span key={mode} id={`${widgetId}-tab-help-desc-${mode}`} css={srOnly}>
          {stripMarkdownToText(resolveModeText(mode))}
        </span>
      ))}
      <HelpPopoverButton
        buttonId={`tab-help-mode-btn-${widgetId}`}
        heading={getI18nMessage(MODE_TITLE_KEYS[spatialMode])}
        helpMarkdown={resolveModeText(spatialMode)}
        ariaLabel={getI18nMessage('tabHelpModeButtonLabel')}
        contextId={spatialMode}
        bgColor={bgColor}
        textColor={textColor}
        buttonCss={css`flex-shrink: 0;`}
      />
    </React.Fragment>
  )
}
