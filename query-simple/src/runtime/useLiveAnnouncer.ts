/**
 * useLiveAnnouncer (TODO #38, r028.138)
 *
 * Drives the text of a single visually-hidden `role="status"` / `aria-live="polite"`
 * region for screen-reader announcements of programmatic context changes.
 *
 * Two behaviors the raw setState would miss:
 * - Debounce: rapid `announce()` calls (fast tab/mode toggling) collapse to the last
 *   message after a quiet window, so the screen reader is not spammed or made to lag.
 * - Same-message re-announce: aria-live only fires when the text actually changes, so
 *   announcing the identical string twice would be silent. When that happens the region
 *   is cleared first and the text re-set on the next tick, forcing a fresh announcement.
 *
 * Render `message` as the live region's text; call `announce(text)` on a context change.
 */
import { React } from 'jimu-core'

export interface LiveAnnouncer {
  message: string
  announce: (message: string) => void
}

export function useLiveAnnouncer (debounceMs = 150): LiveAnnouncer {
  const [message, setMessage] = React.useState('')
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const announce = React.useCallback((next: string) => {
    if (!next) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setMessage(current => {
        if (current === next) {
          // Identical text would not re-trigger aria-live; clear now, re-set next tick.
          if (resetRef.current) clearTimeout(resetRef.current)
          resetRef.current = setTimeout(() => { setMessage(next) }, 50)
          return ''
        }
        return next
      })
    }, debounceMs)
  }, [debounceMs])

  React.useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (resetRef.current) clearTimeout(resetRef.current)
  }, [])

  return { message, announce }
}
