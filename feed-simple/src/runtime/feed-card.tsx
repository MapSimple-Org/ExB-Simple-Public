/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui'
import type { FeedItem } from '../utils/parsers/interface'
import type { StatusColorMap, RangeColorBreak } from '../config'
import { substituteTokens, type FilterContext } from '../utils/token-renderer'
import { convertTemplateToHtml } from '../utils/markdown-template-utils'
import { resolveCardColor } from '../utils/color-resolver'
import { MOBILE_BREAKPOINT_PX } from '../constants'

// ── Static CSS (hoisted to module scope — no per-render allocation) ──

const templateCss = css`
  p { margin: 0 0 4px 0; }
  h3, h4, h5, h6 { margin: 0 0 4px 0; }
  hr { margin: 6px 0; border: none; border-top: 1px solid #ddd; }
  ul { margin: 0; padding-left: 20px; }
  li { margin-bottom: 2px; }
  a { color: #0079c1; text-decoration: none; &:hover { text-decoration: underline; } }
`
const rawFieldsContainerCss = css`overflow-wrap: break-word; word-break: break-word;`
const rawFieldItemCss = css`margin-bottom: 2px;`
const rawFieldKeyCss = css`color: #555; font-size: 0.7rem; text-transform: uppercase; overflow-wrap: break-word;`
const rawFieldValueCss = css`font-size: 0.85rem;`
const rawFieldKeySmallCss = css`color: #555; font-size: 0.65rem; text-transform: uppercase;`
const expandedFieldItemCss = css`margin-bottom: 2px;`

export interface FeedCardProps {
  /** The feed item data (key-value pairs) */
  item: FeedItem
  /** Whether this card is currently highlighted (new/changed animation) */
  isHighlighted: boolean
  /** Whether this card is currently selected (blue border, map sync) */
  isSelected: boolean
  /** Markdown/token template for card body; if falsy, raw fields are displayed */
  cardTemplate: string
  /** Which field drives status-based background coloring */
  statusField: string
  /** Map of status values to background hex colors */
  statusColorMap: StatusColorMap
  /** Color mode: 'exact' (string match) or 'range' (numeric ranges). Default 'exact'. */
  colorMode?: 'exact' | 'range'
  /** Numeric range breaks for range-based color coding */
  rangeColorBreaks?: RangeColorBreak[]
  /** Field whose value appears as hover tooltip */
  hoverTextField: string
  /** Filter context for token substitution (externalLinkTemplate + dateFormatString) */
  filterContext: FilterContext
  /** Whether the card should be interactive (pointer cursor, hover effect, role=button) */
  clickable: boolean
  /** Duration of the highlight flash animation in milliseconds */
  highlightDurationMs: number
  /** Callback when the card is clicked or activated via keyboard */
  onClick?: (item: FeedItem, evt: React.MouseEvent | React.KeyboardEvent) => void
  /** Temporary info message shown below card when map interaction fails */
  noGeometryMessage?: string
  // ── Toolbar props ──
  /** Whether to show the Zoom button */
  showZoomButton?: boolean
  /** Whether to show the Pan button */
  showPanButton?: boolean
  /** Whether to show the Expand button (admin toggle) */
  showExpandButton?: boolean
  /** Whether this item has valid geometry/coordinates for zoom/pan */
  hasGeometry?: boolean
  /** Callback for Zoom button click */
  onZoom?: (item: FeedItem) => void
  /** Callback for Pan button click */
  onPan?: (item: FeedItem) => void
  /** URL to open when the link button is clicked (resolved from linkField) */
  linkUrl?: string
  /** Toolbar position: 'bottom' (horizontal), 'right' (vertical strip), or 'menu' (kebab dropdown) */
  toolbarPosition?: 'bottom' | 'right' | 'menu'
  /** Mobile card template — shown at viewport widths ≤ MOBILE_BREAKPOINT_PX. Falls back to desktop cardTemplate if empty. */
  cardTemplateMobile?: string
  /** Mobile toolbar position override — applied at viewport widths ≤ MOBILE_BREAKPOINT_PX. Empty = use desktop setting. */
  toolbarPositionMobile?: '' | 'bottom' | 'right' | 'menu'
  /** i18n labels for toolbar buttons */
  toolbarLabels?: {
    zoom: string
    pan: string
    expand: string
    collapse: string
    noGeometry: string
    link: string
  }
}

// ── Inline SVG icons (self-contained, no external dependencies) ──

const ZoomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 1a5.5 5.5 0 0 1 4.383 8.823l3.896 3.9a.75.75 0 0 1-1.06 1.06l-3.9-3.896A5.5 5.5 0 1 1 6.5 1zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6.5 4a.5.5 0 0 1 .5.5V6h1.5a.5.5 0 0 1 0 1H7v1.5a.5.5 0 0 1-1 0V7H4.5a.5.5 0 0 1 0-1H6V4.5a.5.5 0 0 1 .5-.5z"/>
  </svg>
)

const PanIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.16895 5.30918V3.04763C3.16895 2.55598 3.36425 2.08446 3.71191 1.73681C4.05956 1.38916 4.53107 1.19385 5.02273 1.19385C5.51132 1.19385 5.97869 1.36508 6.32193 1.67293C6.36032 1.62515 6.40094 1.57952 6.44366 1.53611C6.79682 1.1773 7.26611 1 7.73074 1C8.19536 1 8.66465 1.1773 9.01781 1.53611C9.12056 1.6405 9.21108 1.75775 9.28791 1.8868C9.62092 1.61172 10.0316 1.47559 10.4387 1.47559C10.9034 1.47559 11.3727 1.65289 11.7258 2.01169C11.8902 2.17872 12.0233 2.37867 12.1191 2.60724C12.4273 2.39497 12.7879 2.28979 13.1458 2.28979C13.6104 2.28979 14.0797 2.4671 14.4328 2.8259C14.7857 3.18442 14.9944 3.69459 14.9995 4.31399C14.9998 4.32175 15 4.32956 15 4.3374V10.8899C15 12.1273 14.6015 13.1671 13.8576 13.8978C13.1151 14.627 12.0777 15 10.8899 15H6.71936C6.07313 15 5.45739 14.7293 5.02137 14.253L1.60633 10.5275C1.24288 10.1312 1.02932 9.6202 1.00281 9.08312C0.976287 8.54601 1.1384 8.01652 1.46109 7.58632L3.16895 5.30918ZM7.15636 2.23758C7.00596 2.39039 6.87695 2.64565 6.87695 3.04737V4.85242C6.87695 5.03696 6.77697 5.19816 6.62822 5.28479C6.55429 5.32795 6.46829 5.35267 6.37651 5.35267C6.10037 5.35267 5.87651 5.12881 5.87651 4.85267V2.94294C5.87651 2.52273 5.54873 2.19385 5.02273 2.19385C4.79629 2.19385 4.57913 2.2838 4.41901 2.44391C4.2589 2.60403 4.16895 2.82119 4.16895 3.04763V5.44636C4.17005 5.46551 4.17005 5.48475 4.16895 5.50396V8.18228C4.16895 8.45842 3.94509 8.68228 3.66895 8.68228C3.3928 8.68228 3.16895 8.45842 3.16895 8.18228V6.97585L2.26109 8.18632C2.07839 8.42989 1.98657 8.7297 2.00159 9.03381C2.0166 9.33792 2.13748 9.6272 2.34329 9.85159L5.75853 13.5773C6.0048 13.8464 6.35309 14 6.71936 14H10.8899C11.8682 14 12.6358 13.6961 13.1569 13.1843C13.6765 12.674 14 11.9089 14 10.8899V4.35842C13.9997 4.35137 13.9996 4.34429 13.9996 4.33717C13.9996 3.93545 13.8706 3.68018 13.7202 3.52737C13.5656 3.37039 13.358 3.28979 13.1458 3.28979C12.9335 3.28979 12.7259 3.37039 12.5714 3.52737C12.4266 3.67448 12.3016 3.91654 12.2925 4.29281V4.8522C12.2925 5.08586 12.1323 5.28225 11.9156 5.3371C11.8761 5.34716 11.8347 5.35251 11.792 5.35251C11.5159 5.35251 11.292 5.12865 11.292 4.85251V4.33717C11.292 4.31879 11.2922 4.30052 11.2925 4.28233V3.52369C11.2925 3.12197 11.1635 2.8667 11.0131 2.7139C10.9194 2.61872 10.8063 2.55163 10.6843 2.51354C10.6052 2.48881 10.5223 2.47632 10.4387 2.47632C10.2265 2.47632 10.0189 2.55691 9.86437 2.7139C9.79462 2.78476 9.72948 2.87765 9.67967 2.99696C9.62206 3.13494 9.58496 3.30825 9.58496 3.52369V4.8522C9.58496 5.11224 9.38645 5.32609 9.13271 5.35012C9.11685 5.35164 9.10077 5.35242 9.08452 5.35242C8.80838 5.35242 8.58452 5.12856 8.58452 4.85242V3.04737C8.58452 2.64565 8.45551 2.39039 8.30511 2.23758C8.1506 2.08059 7.943 2 7.73074 2C7.51847 2 7.31087 2.08059 7.15636 2.23758Z"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
  </svg>
)

const KebabIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="3" r="1.5"/>
    <circle cx="8" cy="8" r="1.5"/>
    <circle cx="8" cy="13" r="1.5"/>
  </svg>
)

const LinkExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
    <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
  </svg>
)

// ── Toolbar button styles ────────────────────────────────────────

const toolbarBtnCss = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #555;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  &:hover {
    background: rgba(0, 0, 0, 0.06);
    border-color: #ccc;
    color: #333;
  }
  &:focus-visible {
    outline: 2px solid #0079c1;
    outline-offset: 1px;
  }
`

const toolbarBtnDisabledCss = css`
  ${toolbarBtnCss};
  opacity: 0.35;
  pointer-events: none;
  cursor: default;
`

const dropdownItemIconCss = css`
  display: flex;
  align-items: center;
  gap: 8px;
`

export default function FeedCard (props: FeedCardProps): React.ReactElement {
  const {
    item, isHighlighted, isSelected,
    cardTemplate, cardTemplateMobile, statusField, statusColorMap, colorMode, rangeColorBreaks, hoverTextField,
    filterContext, clickable, highlightDurationMs, onClick,
    noGeometryMessage,
    showZoomButton, showPanButton, showExpandButton,
    hasGeometry, onZoom, onPan, linkUrl, toolbarPosition, toolbarPositionMobile, toolbarLabels
  } = props

  // Desktop toolbar mode
  const desktopPos = toolbarPosition || 'bottom'
  const isRightToolbar = desktopPos === 'right' || desktopPos === 'menu'
  const isMenuMode = desktopPos === 'menu'
  const hasToolbar = !!(showZoomButton || showPanButton || linkUrl || (showExpandButton && cardTemplate))

  // Mobile toolbar mode (falls back to desktop when not set)
  const mobilePos = toolbarPositionMobile || desktopPos
  const hasMobileToolbarOverride = hasToolbar && mobilePos !== desktopPos
  const isMobileRight = mobilePos === 'right' || mobilePos === 'menu'
  const isMobileMenu = mobilePos === 'menu'

  // Responsive content: separate mobile card template
  const hasMobileContent = !!(cardTemplateMobile && cardTemplateMobile !== cardTemplate)

  // Expand state (local to this card)
  const [isExpanded, setIsExpanded] = React.useState(false)
  // Menu open state (for kebab menu mode — managed by jimu-ui Dropdown)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  // Determine background color from status field (supports exact match and range modes)
  const bgColor = resolveCardColor(item, {
    statusField,
    colorMode: colorMode || 'exact',
    statusColorMap,
    rangeColorBreaks: rangeColorBreaks as RangeColorBreak[] | undefined
  })

  // Hover tooltip text
  const hoverText = hoverTextField && item[hoverTextField] ? item[hoverTextField] : undefined

  // ── Content rendering helper ──
  const renderTemplateContent = (tmpl: string): React.ReactElement => {
    const substituted = substituteTokens(tmpl, item, filterContext)
    const rendered = convertTemplateToHtml(substituted)
    return <div css={templateCss} dangerouslySetInnerHTML={{ __html: rendered }} />
  }

  const renderRawFields = (): React.ReactElement => (
    <div css={rawFieldsContainerCss}>
      {Object.entries(item).map(([key, value]) => (
        <div key={key} css={rawFieldItemCss}>
          <strong css={rawFieldKeyCss}>{key}:</strong>{' '}
          <span css={rawFieldValueCss}>{value}</span>
        </div>
      ))}
    </div>
  )

  // Render card content (desktop)
  const content = cardTemplate ? renderTemplateContent(cardTemplate) : renderRawFields()
  // Render mobile content (only when a different mobile template is set)
  const mobileContent = hasMobileContent ? renderTemplateContent(cardTemplateMobile) : null

  // ── Toolbar rendering helpers ──

  /** Render button-style toolbar (used for 'bottom' and 'right' positions) */
  const renderButtonToolbar = (isVertical: boolean): React.ReactElement => (
    <div css={css`
      display: flex;
      flex-direction: ${isVertical ? 'column' : 'row'};
      align-items: center;
      gap: 4px;
      ${isVertical
        ? `
          padding-left: 6px;
          border-left: 1px solid rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        `
        : `
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        `}
    `}>
      {showZoomButton && (
        <button
          css={hasGeometry !== false ? toolbarBtnCss : toolbarBtnDisabledCss}
          title={hasGeometry !== false
            ? (toolbarLabels?.zoom || 'Zoom to feature')
            : (toolbarLabels?.noGeometry || 'No geometry available')}
          onClick={(evt) => {
            evt.stopPropagation()
            if (hasGeometry !== false && onZoom) onZoom(item)
          }}
        >
          <ZoomIcon />
        </button>
      )}
      {showPanButton && (
        <button
          css={hasGeometry !== false ? toolbarBtnCss : toolbarBtnDisabledCss}
          title={hasGeometry !== false
            ? (toolbarLabels?.pan || 'Pan to feature')
            : (toolbarLabels?.noGeometry || 'No geometry available')}
          onClick={(evt) => {
            evt.stopPropagation()
            if (hasGeometry !== false && onPan) onPan(item)
          }}
        >
          <PanIcon />
        </button>
      )}
      {linkUrl && (
        <button
          css={toolbarBtnCss}
          title={toolbarLabels?.link || 'Open link'}
          onClick={(evt) => {
            evt.stopPropagation()
            window.open(linkUrl, '_blank', 'noopener,noreferrer')
          }}
        >
          <LinkExternalIcon />
        </button>
      )}
      {showExpandButton && cardTemplate && (
        <button
          css={toolbarBtnCss}
          title={isExpanded
            ? (toolbarLabels?.collapse || 'Hide fields')
            : (toolbarLabels?.expand || 'Show all fields')}
          onClick={(evt) => {
            evt.stopPropagation()
            setIsExpanded(prev => !prev)
          }}
        >
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      )}
    </div>
  )

  /** Render kebab dropdown toolbar (used for 'menu' position) */
  const renderKebabMenu = (): React.ReactElement => (
    <div css={css`
      padding-left: 6px;
      border-left: 1px solid rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
    `}>
      <Dropdown
        isOpen={isMenuOpen}
        toggle={(evt) => {
          if (evt) evt.stopPropagation()
          setIsMenuOpen(prev => !prev)
        }}
        direction='down'
      >
        <DropdownButton
          size='sm'
          type='tertiary'
          icon
          arrow={false}
          aria-label='Actions menu'
          title='Actions'
          css={toolbarBtnCss}
        >
          <KebabIcon />
        </DropdownButton>
        <DropdownMenu css={css`min-width: 160px;`}>
          {showZoomButton && (
            <DropdownItem
              disabled={hasGeometry === false}
              onClick={() => { if (hasGeometry !== false && onZoom) onZoom(item) }}
            >
              <span css={dropdownItemIconCss}><ZoomIcon /> {toolbarLabels?.zoom || 'Zoom to feature'}</span>
            </DropdownItem>
          )}
          {showPanButton && (
            <DropdownItem
              disabled={hasGeometry === false}
              onClick={() => { if (hasGeometry !== false && onPan) onPan(item) }}
            >
              <span css={dropdownItemIconCss}><PanIcon /> {toolbarLabels?.pan || 'Pan to feature'}</span>
            </DropdownItem>
          )}
          {linkUrl && (
            <DropdownItem
              onClick={() => { window.open(linkUrl, '_blank', 'noopener,noreferrer') }}
            >
              <span css={dropdownItemIconCss}><LinkExternalIcon /> {toolbarLabels?.link || 'Open link'}</span>
            </DropdownItem>
          )}
          {showExpandButton && cardTemplate && (
            <DropdownItem
              onClick={() => { setIsExpanded(prev => !prev) }}
            >
              <span css={dropdownItemIconCss}>
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                {isExpanded
                  ? (toolbarLabels?.collapse || 'Hide fields')
                  : (toolbarLabels?.expand || 'Show all fields')}
              </span>
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  )

  /** Render the toolbar for a given position */
  const renderToolbarForPosition = (pos: string): React.ReactElement | null => {
    if (!hasToolbar) return null
    if (pos === 'menu') return renderKebabMenu()
    if (pos === 'right') return renderButtonToolbar(true)
    return renderButtonToolbar(false) // 'bottom'
  }

  /** Whether a position uses a side (right) layout */
  const isSideLayout = (pos: string): boolean => pos === 'right' || pos === 'menu'

  /**
   * Render the full card layout: content + toolbar.
   * When mobile overrides are active, renders both desktop and mobile variants
   * with CSS media queries toggling visibility at MOBILE_BREAKPOINT_PX.
   */
  const renderCardLayout = (): React.ReactElement => {
    const needsResponsive = hasMobileContent || hasMobileToolbarOverride

    if (!needsResponsive) {
      // Simple path: no responsive variants needed
      return (
        <div css={css`
          display: flex;
          flex-direction: ${isRightToolbar && hasToolbar ? 'row' : 'column'};
          gap: ${isRightToolbar && hasToolbar ? '8px' : '0'};
        `}>
          <div css={css`flex: 1; min-width: 0;`}>{content}</div>
          {renderToolbarForPosition(desktopPos)}
        </div>
      )
    }

    // Responsive path: render desktop and mobile layouts, toggle with media queries
    const desktopSide = isSideLayout(desktopPos)
    const mobileSide = isSideLayout(mobilePos)
    const desktopContent = content
    const mobileContentEl = mobileContent || content

    return (
      <React.Fragment>
        {/* Desktop layout — hidden at ≤ MOBILE_BREAKPOINT_PX */}
        <div css={css`
          display: flex;
          flex-direction: ${desktopSide && hasToolbar ? 'row' : 'column'};
          gap: ${desktopSide && hasToolbar ? '8px' : '0'};
          @media (max-width: ${MOBILE_BREAKPOINT_PX}px) { display: none !important; }
        `}>
          <div css={css`flex: 1; min-width: 0;`}>{desktopContent}</div>
          {renderToolbarForPosition(desktopPos)}
        </div>
        {/* Mobile layout — hidden at > MOBILE_BREAKPOINT_PX */}
        <div css={css`
          display: none;
          flex-direction: ${mobileSide && hasToolbar ? 'row' : 'column'};
          gap: ${mobileSide && hasToolbar ? '8px' : '0'};
          @media (max-width: ${MOBILE_BREAKPOINT_PX}px) { display: flex !important; }
        `}>
          <div css={css`flex: 1; min-width: 0;`}>{mobileContentEl}</div>
          {renderToolbarForPosition(mobilePos)}
        </div>
      </React.Fragment>
    )
  }

  return (
    <div
      title={hoverText}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable && onClick ? (evt) => { onClick(item, evt) } : undefined}
      onKeyDown={clickable && onClick
        ? (evt) => {
            if (evt.key === 'Enter' || evt.key === ' ') {
              onClick(item, evt)
            }
          }
        : undefined}
      css={css`
        position: relative;
        background-color: ${bgColor};
        border: ${isSelected ? '2px solid #0079c1' : '1px solid var(--sys-color-divider-secondary)'};
        border-radius: 6px;
        padding: 10px 12px;
        margin-bottom: 8px;
        font-size: 0.85rem;
        line-height: 1.4;
        color: #333;
        ${clickable
          ? `
            cursor: pointer;
            transition: box-shadow 0.15s ease, filter 0.15s ease;
            &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); filter: brightness(0.95); }
          `
          : hoverText ? 'cursor: default;' : ''}
        ${isHighlighted
          ? `
            @keyframes feedSimpleHighlight {
              0% { opacity: 0.45; }
              100% { opacity: 0; }
            }
          `
          : ''}
      `}
    >
      {isHighlighted && (
        <div css={css`
          position: absolute;
          inset: 0;
          border-radius: 6px;
          background-color: #ffd700;
          pointer-events: none;
          animation: feedSimpleHighlight ${highlightDurationMs}ms ease-out forwards;
        `} />
      )}
      {/* ── Card layout: content + toolbar ── */}
      {renderCardLayout()}
      {/* ── Expanded Raw Fields ── */}
      {isExpanded && (
        <div css={css`
          margin-top: 6px;
          padding: 8px 10px;
          background: rgba(0, 0, 0, 0.025);
          border-radius: 4px;
          max-height: 300px;
          overflow-y: auto;
          font-size: 0.75rem;
          line-height: 1.5;
          overflow-wrap: break-word;
          word-break: break-word;
          @keyframes feedSimpleExpandIn {
            from { opacity: 0; max-height: 0; }
            to { opacity: 1; max-height: 300px; }
          }
          animation: feedSimpleExpandIn 0.2s ease-out;
        `}>
          {Object.entries(item).map(([key, value]) => (
            <div key={key} css={expandedFieldItemCss}>
              <strong css={rawFieldKeySmallCss}>{key}:</strong>{' '}
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}
      {noGeometryMessage && (
        <div css={css`
          margin-top: 6px;
          padding: 5px 10px;
          background: #e8f0fe;
          color: #1a73e8;
          font-size: 0.75rem;
          border-top: 1px solid #d2e3fc;
          border-radius: 0 0 4px 4px;
          display: flex;
          align-items: center;
          gap: 6px;
          @keyframes feedSimpleInfoFadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          animation: feedSimpleInfoFadeIn 0.2s ease-out;
        `}>
          <span css={css`font-size: 13px; flex-shrink: 0;`}>ℹ</span>
          {noGeometryMessage}
        </div>
      )}
    </div>
  )
}
