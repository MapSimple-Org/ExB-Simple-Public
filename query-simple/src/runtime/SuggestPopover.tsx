/** @jsx jsx */
/**
 * SuggestPopover.tsx — Typeahead suggestion dropdown (r028.070)
 *
 * Dual-path rendering for desktop vs mobile:
 *   Desktop: position:fixed with viewport coords from getBoundingClientRect.
 *   Mobile:  jimu-ui Popper portals to document.body, escaping both
 *            overflow:hidden ancestors and MobilePanel's CSS transform trap.
 *
 * Highlights matching prefix in bold. ARIA listbox pattern for screen readers.
 * Uses Calcite design tokens for consistent styling.
 */
import { React, jsx, css, hooks } from 'jimu-core'
import { Popper } from 'jimu-ui'
import type { SuggestPopoverProps } from './useSuggest'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

// ============================================================================
// Styles
// ============================================================================

/**
 * Desktop style: position fixed with viewport coordinates from getBoundingClientRect.
 * Mobile uses jimu-ui Popper instead (see render section below).
 */
const getDesktopStyle = (rect: DOMRect, maxHeight: number) => css`
  position: fixed;
  z-index: 1000;
  top: ${rect.bottom}px;
  width: ${rect.width}px;
  max-height: ${maxHeight}px;
`

const popoverBaseStyle = css`
  background: var(--sys-color-surface-paper);
  border: 1px solid var(--sys-color-divider-secondary);
  border-radius: 4px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--sys-color-divider-primary);
    border-radius: 3px;
  }

  .suggest-item {
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.8125rem;
    line-height: 1.4;
    color: var(--sys-color-surface-paper-text);
    border-bottom: 1px solid var(--sys-color-divider-tertiary);
    transition: background 0.1s;

    &:last-child {
      border-bottom: none;
    }

    &:hover,
    &.is-active {
      background: var(--sys-color-primary-light);
    }

    &.is-active {
      outline: 2px solid var(--sys-color-primary-main);
      outline-offset: -2px;
    }

    .suggest-item__match {
      font-weight: 600;
    }
  }

  .suggest-loading {
    padding: 8px 12px;
    text-align: center;
    font-size: 0.8125rem;
    color: var(--sys-color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .suggest-no-results {
    padding: 8px 12px;
    text-align: center;
    font-size: 0.8125rem;
    color: var(--sys-color-text-disabled);
    font-style: italic;
  }
`

// ============================================================================
// Helpers
// ============================================================================

/**
 * Highlights the matching portion of the suggestion text.
 * Case-insensitive match — bolds the matched substring.
 */
function highlightMatch (text: string, query: string): React.ReactNode {
  if (!query) return text

  const upperText = text.toUpperCase()
  const upperQuery = query.toUpperCase()
  const matchIndex = upperText.indexOf(upperQuery)

  if (matchIndex === -1) return text

  const before = text.substring(0, matchIndex)
  const match = text.substring(matchIndex, matchIndex + query.length)
  const after = text.substring(matchIndex + query.length)

  return (
    <React.Fragment>
      {before}
      <span className='suggest-item__match'>{match}</span>
      {after}
    </React.Fragment>
  )
}

// ============================================================================
// Component
// ============================================================================

export function SuggestPopover (props: SuggestPopoverProps) {
  const {
    isOpen,
    suggestions,
    isLoading,
    activeIndex,
    onSelect,
    query,
    inputElement
  } = props

  const listRef = React.useRef<HTMLDivElement>(null)
  const isMobile = hooks.useCheckSmallBrowserSizeMode()
  const [inputRect, setInputRect] = React.useState<DOMRect | null>(null)
  const [maxHeight, setMaxHeight] = React.useState(240)

  // Track input position + available space below
  React.useEffect(() => {
    if (!isOpen || !inputElement) {
      setInputRect(null)
      return
    }

    const update = () => {
      const rect = inputElement.getBoundingClientRect()
      const computed = Math.max(60, Math.min(240, window.innerHeight - rect.bottom - 16))

      debugLogger.log('SUGGEST', {
        event: 'popover-position',
        isMobile,
        rectBottom: Math.round(rect.bottom),
        windowInnerHeight: window.innerHeight,
        spaceBelow: Math.round(window.innerHeight - rect.bottom),
        computedMaxHeight: Math.round(computed)
      })
      setInputRect(rect)
      setMaxHeight(computed)
    }
    update()

    window.addEventListener('scroll', update, { capture: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, { capture: true })
      window.removeEventListener('resize', update)
    }
  }, [isOpen, inputElement, isMobile])

  // Scroll active item into view
  React.useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.querySelector(`[data-suggest-index="${activeIndex}"]`)
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  if (!isOpen || !inputElement) return null

  // Shared suggestion content (identical for both render paths)
  const suggestionContent = (
    <React.Fragment>
      {isLoading && suggestions.length === 0 && (
        <div className='suggest-loading' role='status' aria-live='polite'>
          Loading...
        </div>
      )}

      {suggestions.map((item, index) => (
        <div
          key={`${item.value}-${index}`}
          className={`suggest-item${index === activeIndex ? ' is-active' : ''}`}
          data-suggest-index={index}
          role='option'
          aria-selected={index === activeIndex}
          id={`suggest-option-${index}`}
          onMouseDown={(e) => {
            // Use mousedown (not click) to fire before blur
            e.preventDefault()
            onSelect(item)
          }}
        >
          {highlightMatch(item.label || item.value, query)}
        </div>
      ))}

      {!isLoading && suggestions.length === 0 && query.length > 0 && (
        <div className='suggest-no-results' role='status' aria-live='polite'>
          No matches found
        </div>
      )}
    </React.Fragment>
  )

  // Mobile: Popper portals to document.body (escapes overflow:hidden + transform trap)
  if (isMobile) {
    return (
      <Popper
        open
        reference={inputElement}
        placement='bottom-start'
        offsetOptions={[-10, 6]}
        flipOptions={false}
        autoUpdate
        trapFocus={false}
        autoFocus={false}
        style={{ boxShadow: 'none' }}
      >
        <div
          ref={listRef}
          css={popoverBaseStyle}
          style={{ maxHeight, width: inputElement.getBoundingClientRect().width }}
          role='listbox'
          aria-label='Suggestions'
          id='suggest-popover-listbox'
        >
          {suggestionContent}
        </div>
      </Popper>
    )
  }

  // Desktop: position fixed (no transform trap outside MobilePanel)
  if (!inputRect) return null

  return (
    <div
      ref={listRef}
      css={[getDesktopStyle(inputRect, maxHeight), popoverBaseStyle]}
      role='listbox'
      aria-label='Suggestions'
      id='suggest-popover-listbox'
    >
      {suggestionContent}
    </div>
  )
}
