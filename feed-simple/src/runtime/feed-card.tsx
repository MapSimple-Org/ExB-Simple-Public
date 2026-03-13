/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import type { FeedItem } from '../utils/parsers/interface'
import type { StatusColorMap } from '../config'
import { substituteTokens, type FilterContext } from '../utils/token-renderer'
import { convertTemplateToHtml } from '../utils/markdown-template-utils'

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
  /** Field whose value appears as hover tooltip */
  hoverTextField: string
  /** Filter context for token substitution (externalLinkTemplate + dateFormatString) */
  filterContext: FilterContext
  /** Whether the card should be interactive (pointer cursor, hover effect, role=button) */
  clickable: boolean
  /** Duration of the highlight flash animation in milliseconds */
  highlightDurationMs: number
  /** Callback when the card is clicked; receives the item and the mouse event */
  onClick?: (item: FeedItem, evt: React.MouseEvent) => void
}

export default function FeedCard (props: FeedCardProps): React.ReactElement {
  const {
    item, isHighlighted, isSelected,
    cardTemplate, statusField, statusColorMap, hoverTextField,
    filterContext, clickable, highlightDurationMs, onClick
  } = props

  // Determine background color from status field
  let bgColor = 'transparent'
  if (statusField && item[statusField] && statusColorMap) {
    const statusValue = item[statusField]
    const mappedColor = (statusColorMap as any)[statusValue]
    if (mappedColor) {
      bgColor = mappedColor.startsWith('#') ? mappedColor : `#${mappedColor}`
    }
  }

  // Hover tooltip text
  const hoverText = hoverTextField && item[hoverTextField] ? item[hoverTextField] : undefined

  // Render card content
  let content: React.ReactElement
  if (cardTemplate) {
    // Substitute {{tokens}} first (before markdown conversion mangles | and " chars)
    const substituted = substituteTokens(cardTemplate, item, filterContext)
    const rendered = convertTemplateToHtml(substituted)
    content = (
      <div
        css={css`
          p { margin: 0 0 4px 0; }
          h3, h4, h5, h6 { margin: 0 0 4px 0; }
          hr { margin: 6px 0; border: none; border-top: 1px solid #ddd; }
          ul { margin: 0; padding-left: 20px; }
          li { margin-bottom: 2px; }
          a { color: #0079c1; text-decoration: none; &:hover { text-decoration: underline; } }
        `}
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    )
  } else {
    // No template — show raw fields
    content = (
      <div>
        {Object.entries(item).map(([key, value]) => (
          <div key={key} css={css`margin-bottom: 2px;`}>
            <strong css={css`color: #555; font-size: 0.75rem; text-transform: uppercase;`}>{key}:</strong>{' '}
            <span css={css`font-size: 0.85rem;`}>{value}</span>
          </div>
        ))}
      </div>
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
              onClick(item, evt as any)
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
      {content}
    </div>
  )
}
