/** @jsx jsx */
/**
 * SuggestPopover.tsx — Typeahead suggestion dropdown (r025.053)
 *
 * Renders an absolutely positioned dropdown below SqlExpressionRuntime's input.
 * Highlights matching prefix in bold. ARIA listbox pattern for screen readers.
 * Uses Calcite design tokens for consistent styling.
 */
import { React, jsx, css } from 'jimu-core'
import type { SuggestPopoverProps } from './useSuggest'

// ============================================================================
// Styles
// ============================================================================

const getPopoverStyle = (rect: DOMRect | null) => css`
  position: fixed;
  z-index: 1000;
  ${rect ? `
    top: ${rect.bottom + 2}px;
    width: ${rect.width}px;
  ` : `
    display: none;
  `}

  background: var(--sys-color-surface-paper);
  border: 1px solid var(--sys-color-divider-secondary);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 240px;
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
  const [inputRect, setInputRect] = React.useState<DOMRect | null>(null)

  // Track input element position (updates on open and scroll)
  React.useEffect(() => {
    if (!isOpen || !inputElement) {
      setInputRect(null)
      return
    }

    const updateRect = () => {
      setInputRect(inputElement.getBoundingClientRect())
    }
    updateRect()

    // Re-position on scroll/resize (parent panels may scroll)
    window.addEventListener('scroll', updateRect, { capture: true })
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('scroll', updateRect, { capture: true })
      window.removeEventListener('resize', updateRect)
    }
  }, [isOpen, inputElement])

  // Scroll active item into view
  React.useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.querySelector(`[data-suggest-index="${activeIndex}"]`)
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  if (!isOpen || !inputRect) return null

  return (
    <div
      ref={listRef}
      css={getPopoverStyle(inputRect)}
      role='listbox'
      aria-label='Suggestions'
      id='suggest-popover-listbox'
    >
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
    </div>
  )
}
