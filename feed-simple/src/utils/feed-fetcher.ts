/**
 * Fetches raw XML text from a feed URL.
 *
 * Tries esriRequest first (dynamic import) so the request routes through
 * any ArcGIS proxy configured on the portal. This bypasses CORS restrictions
 * on feeds that don't set Access-Control-Allow-Origin headers (e.g. GDACS).
 * Falls back to native fetch if esriRequest is unavailable (e.g. in the
 * settings panel / builder iframe where AMD modules aren't loaded).
 */
import { debugLogger } from './debug-logger'

export interface FetchResult {
  text: string
  status: number
}

export async function fetchFeed (url: string): Promise<FetchResult> {
  if (!url) {
    throw new Error('No feed URL configured')
  }

  debugLogger.log('FETCH', { action: 'fetch-start', url, method: 'determining...' })

  // Try esriRequest first for proxy/CORS support
  try {
    const esriRequest = await loadEsriRequest()
    if (esriRequest) {
      debugLogger.log('FETCH', { action: 'using-esri-request', url })
      const response = await esriRequest(url, {
        responseType: 'text'
      })

      const text = response.data as string
      const status = (response as any).httpStatus || 200

      if (!text || !text.trim()) {
        debugLogger.log('FETCH', { action: 'esri-request-empty', url })
        throw new Error('Feed response was empty')
      }

      debugLogger.log('FETCH', { action: 'esri-request-success', url, status, length: text.length })
      return { text, status }
    }
    debugLogger.log('FETCH', { action: 'esri-request-unavailable', reason: 'loadEsriRequest returned null' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    // esriRequest failed — log and fall through to native fetch
    debugLogger.log('FETCH', { action: 'esri-request-error', url, error: message })
  }

  // Fallback: native fetch (works for CORS-friendly feeds, settings panel discover)
  debugLogger.log('FETCH', { action: 'falling-back-to-native-fetch', url })
  return fetchWithNativeFetch(url)
}

/** Dynamically load esriRequest — returns null if unavailable */
async function loadEsriRequest (): Promise<typeof import('esri/request').default | null> {
  try {
    // Find the AMD loader — could be on this window (runtime) or parent window (settings in builder iframe)
    const amdRequire = getAmdRequire()
    if (!amdRequire) {
      debugLogger.log('FETCH', { action: 'amd-loader-missing', hasWindowRequire: false, hasParentRequire: false })
      return null
    }

    const mod = await new Promise<any>((resolve, reject) => {
      amdRequire(['esri/request'], resolve, reject)
    })
    return mod
  } catch (err) {
    debugLogger.log('FETCH', { action: 'amd-load-failed', error: err instanceof Error ? err.message : 'unknown' })
    return null
  }
}

/** Find the AMD require function — check current window first, then parent (builder iframe) */
function getAmdRequire (): ((modules: string[], resolve: Function, reject: Function) => void) | null {
  if (typeof (window as any).require === 'function') {
    debugLogger.log('FETCH', { action: 'amd-loader-found', source: 'window' })
    return (window as any).require
  }
  try {
    if (window.parent && window.parent !== window && typeof (window.parent as any).require === 'function') {
      debugLogger.log('FETCH', { action: 'amd-loader-found', source: 'window.parent' })
      return (window.parent as any).require
    }
  } catch {
    // Cross-origin parent — can't access
    debugLogger.log('FETCH', { action: 'parent-access-blocked', reason: 'cross-origin' })
  }
  return null
}

/** Fallback for environments where esriRequest is unavailable */
async function fetchWithNativeFetch (url: string): Promise<FetchResult> {
  const response = await fetch(url)

  if (!response.ok) {
    debugLogger.log('FETCH', { action: 'native-fetch-error', url, status: response.status, statusText: response.statusText })
    throw new Error(`Feed fetch failed: HTTP ${response.status} ${response.statusText}`)
  }

  const text = await response.text()

  if (!text.trim()) {
    debugLogger.log('FETCH', { action: 'native-fetch-empty', url })
    throw new Error('Feed response was empty')
  }

  debugLogger.log('FETCH', { action: 'native-fetch-success', url, status: response.status, length: text.length })
  return {
    text,
    status: response.status
  }
}
