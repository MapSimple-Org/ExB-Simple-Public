/**
 * useSuggest.ts — Custom hook for typeahead/suggest feature (r025.053)
 *
 * Encapsulates ALL suggest logic via a useReducer state machine:
 * - Discovers SqlExpressionRuntime's input via MutationObserver
 * - Captures input events (capture phase) for typed value
 * - Debounces 300ms → fires FeatureLayer.queryFeatures()
 * - Manages keyboard navigation (ArrowUp/Down, Enter, Escape)
 * - Injects selected value via proven DOM manipulation pattern
 *
 * Returns { suggestProps, resetSuggest } for consumption by
 * SuggestPopover and query-task-form.tsx.
 */
import { React } from 'jimu-core'
import type { FeatureLayerDataSource } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import { fetchSuggestions, filterCachedSuggestions, injectValueIntoInput, type SuggestCache, type SuggestItem } from './suggest-utils'

const debugLogger = createQuerySimpleDebugLogger()

// ============================================================================
// Types
// ============================================================================

export interface UseSuggestConfig {
  /** Enable/disable the suggest feature */
  enabled: boolean
  /** Minimum characters before firing suggest query */
  minChars: number
  /** Maximum number of suggestions to display */
  limit: number
  /** Server-side fetch limit for cache (default 50) */
  fetchLimit: number
  /** Debounce delay in milliseconds */
  debounceMs: number
}

export interface UseSuggestOptions {
  /** Ref to the container div wrapping SqlExpressionRuntime */
  containerRef: React.RefObject<HTMLDivElement>
  /** The origin DataSource for the query */
  originDS: FeatureLayerDataSource | null
  /** The field name to query for suggestions */
  fieldName: string | null
  /** The SQL operator from the free-form part (e.g., STRING_OPERATOR_CONTAINS) */
  operator?: string | null
  /** Additional WHERE clause from fixed parts (e.g., "PROPTYPE = 'K'") */
  additionalWhere?: string | null
  /** Suggest configuration */
  config: UseSuggestConfig
  /** Whether this is a free-form text input */
  isFreeFormInput: boolean
  /** Guard: suppress suggest during hash parameter injection */
  isHashInjecting: boolean
  /** Widget/config ID for debug logging */
  configId: string
}

export interface SuggestPopoverProps {
  /** Whether the popover is open/visible */
  isOpen: boolean
  /** Array of suggestion items */
  suggestions: SuggestItem[]
  /** Whether a suggest query is in flight */
  isLoading: boolean
  /** Currently active (highlighted) index for keyboard nav */
  activeIndex: number
  /** Callback when user selects a suggestion */
  onSelect: (item: SuggestItem) => void
  /** The current query string (for highlighting matches) */
  query: string
  /** The discovered input element — used for positioning */
  inputElement: HTMLInputElement | null
}

export interface UseSuggestReturn {
  /** Props to spread onto SuggestPopover */
  suggestProps: SuggestPopoverProps
  /** Call this on form reset to clear suggest state */
  resetSuggest: () => void
}

// ============================================================================
// State Machine (useReducer)
// ============================================================================

type SuggestStatus = 'idle' | 'debouncing' | 'fetching' | 'results' | 'no-results' | 'error'

interface SuggestState {
  status: SuggestStatus
  query: string
  suggestions: SuggestItem[]
  activeIndex: number
  isOpen: boolean
}

const INITIAL_STATE: SuggestState = {
  status: 'idle',
  query: '',
  suggestions: [],
  activeIndex: -1,
  isOpen: false
}

type SuggestAction =
  | { type: 'SET_QUERY'; query: string }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; suggestions: SuggestItem[] }
  | { type: 'FETCH_ERROR' }
  | { type: 'SELECT_ITEM' }
  | { type: 'SET_ACTIVE_INDEX'; index: number }
  | { type: 'CLOSE' }
  | { type: 'RESET' }

function suggestReducer (state: SuggestState, action: SuggestAction): SuggestState {
  switch (action.type) {
    case 'SET_QUERY':
      if (action.query === state.query) return state
      return {
        ...state,
        query: action.query,
        status: action.query.length > 0 ? 'debouncing' : 'idle',
        activeIndex: -1,
        isOpen: action.query.length > 0,
        // Keep previous suggestions visible while debouncing (avoid flash)
        suggestions: action.query.length > 0 ? state.suggestions : []
      }

    case 'FETCH_START':
      return { ...state, status: 'fetching' }

    case 'FETCH_SUCCESS':
      return {
        ...state,
        status: action.suggestions.length > 0 ? 'results' : 'no-results',
        suggestions: action.suggestions,
        activeIndex: -1,
        isOpen: true
      }

    case 'FETCH_ERROR':
      return {
        ...state,
        status: 'error',
        suggestions: [],
        isOpen: false
      }

    case 'SELECT_ITEM':
      return { ...INITIAL_STATE }

    case 'SET_ACTIVE_INDEX':
      return { ...state, activeIndex: action.index }

    case 'CLOSE':
      return { ...state, isOpen: false, activeIndex: -1 }

    case 'RESET':
      return { ...INITIAL_STATE }

    default:
      return state
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSuggest (options: UseSuggestOptions): UseSuggestReturn {
  const {
    containerRef,
    originDS,
    fieldName,
    operator,
    additionalWhere,
    config,
    isFreeFormInput,
    isHashInjecting,
    configId
  } = options

  const [state, dispatch] = React.useReducer(suggestReducer, INITIAL_STATE)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = React.useRef<AbortController | null>(null)
  const isSelectingRef = React.useRef<boolean>(false)
  // Ref to track hash injection state for event handlers (avoids stale closures)
  const isHashInjectingRef = React.useRef<boolean>(isHashInjecting)
  isHashInjectingRef.current = isHashInjecting
  // Client-side narrowing cache — stores last server fetch for prefix filtering (r025.058)
  const suggestCacheRef = React.useRef<SuggestCache | null>(null)

  // Determine if suggest is fully active
  const isActive = config.enabled && isFreeFormInput && !!originDS && !!fieldName

  // ------------------------------------------------------------------
  // 1. Discover the input element within SqlExpressionRuntime's DOM
  // ------------------------------------------------------------------
  React.useEffect(() => {
    if (!isActive || !containerRef.current) {
      inputRef.current = null
      return
    }

    const discoverInput = () => {
      const input = containerRef.current?.querySelector('input[type="text"]') as HTMLInputElement
      if (input && input !== inputRef.current) {
        inputRef.current = input
        debugLogger.log('SUGGEST', {
          event: 'input-discovered',
          configId
        })
      }
    }

    // Try immediately
    discoverInput()

    // Also watch for late-rendered inputs (SqlExpressionRuntime may mount async)
    const observer = new MutationObserver(() => {
      discoverInput()
    })

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
    }
  }, [isActive, containerRef, configId])

  // ------------------------------------------------------------------
  // 2. Intercept input events via capturing listener on container
  // ------------------------------------------------------------------
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const handleInputEvent = (e: Event) => {
      // Guard: suppress during hash injection
      if (isHashInjectingRef.current) return

      // Guard: suppress during our own value injection
      if (isSelectingRef.current) return

      const target = e.target as HTMLInputElement
      if (target.tagName !== 'INPUT' || target.type !== 'text') return

      // Capture the ref if not already discovered
      if (!inputRef.current) {
        inputRef.current = target
      }

      const typedValue = target.value

      if (typedValue.length < config.minChars) {
        dispatch({ type: 'SET_QUERY', query: '' })
        return
      }

      dispatch({ type: 'SET_QUERY', query: typedValue })
    }

    const container = containerRef.current
    // Use capture phase to intercept before SqlExpressionRuntime's own handlers
    container.addEventListener('input', handleInputEvent, { capture: true })

    return () => {
      container.removeEventListener('input', handleInputEvent, { capture: true })
    }
  }, [isActive, containerRef, config.minChars])

  // ------------------------------------------------------------------
  // 3. Debounce + fetch when query changes
  // ------------------------------------------------------------------
  React.useEffect(() => {
    if (state.status !== 'debouncing' || !state.query || !originDS || !fieldName) {
      return
    }

    // Clear previous debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Cancel in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    debounceTimerRef.current = setTimeout(async () => {
      // --- Client-side narrowing: try cache before server query (r025.058) ---
      const cached = filterCachedSuggestions(
        suggestCacheRef.current, state.query, operator, additionalWhere, config.limit
      )
      if (cached !== null) {
        debugLogger.log('SUGGEST', {
          event: 'cache-hit',
          configId,
          query: state.query,
          cachedPrefix: suggestCacheRef.current?.query,
          filteredCount: cached.length
        })
        dispatch({ type: 'FETCH_SUCCESS', suggestions: cached })
        return
      }

      // --- Cache miss: fetch from server with larger limit for caching ---
      dispatch({ type: 'FETCH_START' })

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const results = await fetchSuggestions({
          originDS,
          fieldName,
          operator,
          query: state.query,
          limit: config.fetchLimit,
          signal: controller.signal,
          additionalWhere
        })

        // Check if aborted
        if (controller.signal.aborted) return

        // Populate cache for future narrowing
        suggestCacheRef.current = {
          query: state.query,
          results,
          isComplete: results.length < config.fetchLimit,
          operator: operator ?? null,
          additionalWhere: additionalWhere ?? null
        }

        debugLogger.log('SUGGEST', {
          event: 'cache-store',
          configId,
          query: state.query,
          serverCount: results.length,
          isComplete: results.length < config.fetchLimit,
          displayCount: Math.min(results.length, config.limit)
        })

        dispatch({ type: 'FETCH_SUCCESS', suggestions: results.slice(0, config.limit) })
      } catch (err) {
        if (controller.signal.aborted) return

        debugLogger.log('SUGGEST', {
          event: 'fetch-error',
          configId,
          error: err?.message || String(err)
        })

        dispatch({ type: 'FETCH_ERROR' })
      }
    }, config.debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [state.status, state.query, originDS, fieldName, operator, additionalWhere, config.limit, config.fetchLimit, config.debounceMs, configId])

  // ------------------------------------------------------------------
  // 4. Cleanup on unmount
  // ------------------------------------------------------------------
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
      suggestCacheRef.current = null
    }
  }, [])

  // ------------------------------------------------------------------
  // 5. Handle suggestion selection (inject value into DOM)
  // ------------------------------------------------------------------
  const handleSelect = React.useCallback((item: SuggestItem) => {
    if (!inputRef.current) {
      debugLogger.log('SUGGEST', {
        event: 'select-failed-no-input',
        configId,
        value: item.value
      })
      return
    }

    debugLogger.log('SUGGEST', {
      event: 'select-start',
      configId,
      value: item.value
    })

    isSelectingRef.current = true

    // Inject value into SqlExpressionRuntime's input via DOM manipulation
    injectValueIntoInput(inputRef.current, item.value)

    // Close popover
    dispatch({ type: 'SELECT_ITEM' })

    // Reset guard after DOM manipulation settles
    requestAnimationFrame(() => {
      isSelectingRef.current = false
    })
  }, [configId])

  // ------------------------------------------------------------------
  // 6. Keyboard navigation handler
  // ------------------------------------------------------------------
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (!state.isOpen || state.suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        e.stopPropagation()
        const nextIndex = state.activeIndex < state.suggestions.length - 1
          ? state.activeIndex + 1
          : 0
        dispatch({ type: 'SET_ACTIVE_INDEX', index: nextIndex })
        break
      }

      case 'ArrowUp': {
        e.preventDefault()
        e.stopPropagation()
        const prevIndex = state.activeIndex > 0
          ? state.activeIndex - 1
          : state.suggestions.length - 1
        dispatch({ type: 'SET_ACTIVE_INDEX', index: prevIndex })
        break
      }

      case 'Enter': {
        if (state.activeIndex >= 0 && state.activeIndex < state.suggestions.length) {
          e.preventDefault()
          e.stopPropagation()
          handleSelect(state.suggestions[state.activeIndex])
        }
        // If no suggestion is highlighted, let Enter propagate to form's handleKeyDown
        break
      }

      case 'Escape': {
        e.preventDefault()
        e.stopPropagation()
        dispatch({ type: 'CLOSE' })
        inputRef.current?.focus()
        break
      }

      case 'Tab': {
        dispatch({ type: 'CLOSE' })
        break
      }
    }
  }, [state.isOpen, state.suggestions, state.activeIndex, handleSelect])

  // ------------------------------------------------------------------
  // 7. Attach keyboard listener to container
  // ------------------------------------------------------------------
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    container.addEventListener('keydown', handleKeyDown, { capture: true })

    return () => {
      container.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [isActive, containerRef, handleKeyDown])

  // ------------------------------------------------------------------
  // 8. Click-outside listener to close popover
  // ------------------------------------------------------------------
  React.useEffect(() => {
    if (!state.isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      if (!container.contains(e.target as Node)) {
        dispatch({ type: 'CLOSE' })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [state.isOpen, containerRef])

  // ------------------------------------------------------------------
  // 9. Set ARIA attributes on discovered input
  // ------------------------------------------------------------------
  React.useEffect(() => {
    if (!inputRef.current) return

    if (state.isOpen) {
      inputRef.current.setAttribute('role', 'combobox')
      inputRef.current.setAttribute('aria-expanded', 'true')
      inputRef.current.setAttribute('aria-controls', 'suggest-popover-listbox')
      inputRef.current.setAttribute('aria-autocomplete', 'list')
      if (state.activeIndex >= 0) {
        inputRef.current.setAttribute('aria-activedescendant', `suggest-option-${state.activeIndex}`)
      } else {
        inputRef.current.removeAttribute('aria-activedescendant')
      }
    } else {
      inputRef.current.removeAttribute('role')
      inputRef.current.removeAttribute('aria-expanded')
      inputRef.current.removeAttribute('aria-controls')
      inputRef.current.removeAttribute('aria-activedescendant')
      inputRef.current.removeAttribute('aria-autocomplete')
    }
  }, [state.isOpen, state.activeIndex])

  // ------------------------------------------------------------------
  // 10. Reset function (called from form reset)
  // ------------------------------------------------------------------
  const resetSuggest = React.useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    if (abortControllerRef.current) abortControllerRef.current.abort()
    suggestCacheRef.current = null
    dispatch({ type: 'RESET' })
  }, [])

  // ------------------------------------------------------------------
  // Return
  // ------------------------------------------------------------------
  return {
    suggestProps: {
      isOpen: state.isOpen && isActive,
      suggestions: state.suggestions,
      isLoading: state.status === 'fetching' || state.status === 'debouncing',
      activeIndex: state.activeIndex,
      onSelect: handleSelect,
      query: state.query,
      inputElement: inputRef.current
    },
    resetSuggest
  }
}
