# FLOW-14: Typeahead Suggest

End-to-end flow for the typeahead/suggest dropdown that appears as the user
types in a free-form text input field.

## Key Files

| File | Role |
|------|------|
| `query-task-form.tsx` | Integration host: calls `useSuggest`, renders `SuggestPopover` |
| `useSuggest.ts` | Custom hook: state machine, input discovery, keyboard nav, debounce |
| `suggest-utils.ts` | Pure utilities: `fetchSuggestions()`, `injectValueIntoInput()`, cache |
| `SuggestPopover.tsx` | Dropdown UI: dual-path rendering (desktop/mobile), highlight matching |

## Architecture Overview

```
query-task-form.tsx
  |
  +-- useSuggest(options)
  |     |
  |     +-- MutationObserver discovers <input> inside SqlExpressionRuntime
  |     +-- Capture-phase input listener reads typed value
  |     +-- useReducer state machine (idle -> debouncing -> fetching -> results)
  |     +-- Debounce 300ms -> fetchSuggestions() via suggest-utils.ts
  |     +-- Client-side cache narrowing (avoids redundant server calls)
  |     +-- Keyboard handler (ArrowUp/Down, Enter, Escape)
  |     +-- Returns { suggestProps, resetSuggest }
  |
  +-- <SuggestPopover {...suggestProps} />
        |
        +-- Desktop: position:fixed div (viewport coords)
        +-- Mobile:  jimu-ui Popper (portaled to document.body)
```

## Flow Diagram

```
User types in free-form input
  |
  v
[input event captured] -----> useSuggest: dispatch SET_QUERY
  |                                 |
  |                          query.length < minChars?
  |                              yes --> status: idle, popover closed
  |                              no  --> status: debouncing
  |                                         |
  |                                    [300ms debounce]
  |                                         |
  |                                  Cache hit for prefix?
  |                                   yes --> filterCachedSuggestions()
  |                                   no  --> fetchSuggestions()
  |                                              |
  |                                     FeatureLayer.queryFeatures()
  |                                     (UPPER(field) LIKE 'VALUE%')
  |                                              |
  |                                     dispatch FETCH_SUCCESS
  |                                              |
  v                                              v
                                    SuggestPopover renders dropdown
                                              |
                                     +--------+--------+
                                     |                 |
                                  Desktop           Mobile
                                     |                 |
                              position:fixed     jimu-ui Popper
                              getBoundingClientRect  portals to body
                              scroll/resize listeners  autoUpdate
                                     |                 |
                                     +--------+--------+
                                              |
                                     User selects item
                                     (click or Enter)
                                              |
                                     injectValueIntoInput()
                                     (DOM manipulation + React event)
                                              |
                                     dispatch SELECT_ITEM
                                     (popover closes, state resets)
```

## Dual-Path Rendering (r028.067-070)

The SuggestPopover dropdown uses two different positioning strategies depending
on the browser size mode. This is necessary because of conflicting CSS
constraints in the ExB layout hierarchy.

### Why Two Paths?

The DOM hierarchy between MobilePanel and the input has multiple
`overflow: hidden` ancestors (`.query-task__content`, Tabs container) AND
MobilePanel applies a CSS `transform` that creates a new containing block.

- `position: fixed` is trapped by the transform (behaves like `absolute`)
- `position: absolute` is clipped by `overflow: hidden` ancestors

Neither pure-CSS approach works on mobile. Desktop has no transform trap,
so `position: fixed` works fine there.

### Desktop Path

```
SuggestPopover
  |
  +-- div with position:fixed
  +-- top: inputElement.getBoundingClientRect().bottom
  +-- width: inputElement.getBoundingClientRect().width
  +-- maxHeight: max(60, min(240, viewport bottom - input bottom - 16))
  +-- scroll/resize event listeners update position
```

Detection: `hooks.useCheckSmallBrowserSizeMode()` returns `false`.

### Mobile Path

```
SuggestPopover
  |
  +-- jimu-ui Popper (backed by @floating-ui/react)
  +-- reference: inputElement
  +-- placement: bottom-start
  +-- offsetOptions: [-10, 6] (alignment tuning)
  +-- flipOptions: false (prevent upward flip)
  +-- autoUpdate: true (reposition on scroll/resize)
  +-- Portals to document.body (escapes overflow + transform)
  +-- trapFocus: false, autoFocus: false (input keeps focus)
  +-- Popper wrapper: boxShadow: none (clean appearance)
```

Detection: `hooks.useCheckSmallBrowserSizeMode()` returns `true`.

### Shared Between Both Paths

- `popoverBaseStyle`: background, border, scrollbar, `.suggest-item` styles
- `suggestionContent`: loading state, item list with highlight, no-results
- `onMouseDown` with `preventDefault()`: fires before blur to prevent
  the input losing focus before the selection registers
- ARIA: `role="listbox"`, `role="option"`, `aria-selected`, `id` attributes
- `maxHeight` calculation: `max(60, min(240, window.innerHeight - rect.bottom - 16))`

## State Machine (useReducer)

| Status | Meaning |
|--------|---------|
| `idle` | No query or query too short |
| `debouncing` | User is typing, waiting 300ms |
| `fetching` | Server query in flight |
| `results` | Suggestions available, popover open |
| `no-results` | Query returned nothing |
| `error` | Fetch failed |

Actions: `SET_QUERY`, `FETCH_START`, `FETCH_SUCCESS`, `FETCH_ERROR`,
`SELECT_ITEM`, `SET_ACTIVE_INDEX`, `CLOSE`, `RESET`.

## Input Discovery

`useSuggest` uses a `MutationObserver` on the `sqlExprRuntimeContainerRef` div
to find the `<input>` element rendered by `SqlExpressionRuntime`. This is
necessary because `SqlExpressionRuntime` is a framework component that does
not expose a ref to its internal input. The observer watches for `childList`
and `subtree` mutations, then queries for `input[type="text"]`.

## Cache Optimization

`suggest-utils.ts` maintains a per-field cache (`SuggestCache`). When the user
extends a previous query (e.g., "ABC" after "AB"), `filterCachedSuggestions()`
filters the cached results client-side instead of hitting the server again.
Cache is invalidated when the field changes or the query prefix no longer
matches the cached prefix.

## Keyboard Navigation

Handled in `useSuggest` via a capture-phase `keydown` listener on the input:

| Key | Action |
|-----|--------|
| ArrowDown | Move activeIndex forward (wraps to 0) |
| ArrowUp | Move activeIndex backward (wraps to end) |
| Enter | Select active item (if any), otherwise normal form submit |
| Escape | Close popover (refocuses input) |
| Tab | Close popover (lets focus move on normally) |

The Enter key guard in `query-task-form.tsx:708` prevents form submission
when the user is selecting a suggestion with Enter.

## Integration Points

- **query-task-form.tsx:192** -- `useSuggest()` call with config from query item
- **query-task-form.tsx:708** -- Enter key guard for suggest selection
- **query-task-form.tsx:772** -- `resetSuggest()` on `sqlExprObj` change
- **query-task-form.tsx:1349** -- `<SuggestPopover {...suggestProps} />`

## Debug Logging

Activate with `?debug=SUGGEST`. 13 log points across `useSuggest.ts` and
`suggest-utils.ts`. The `popover-position` event in `SuggestPopover.tsx` logs
positioning data (rectBottom, spaceBelow, computedMaxHeight, isMobile).

## Test Coverage

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `suggest-utils.test.ts` | 19 | fetchSuggestions, cache, field validation, injection |

---

*Last updated: r028.118 (2026-06-02) -- accuracy audit: Enter-guard line ref, maxHeight floor, Tab key row*
