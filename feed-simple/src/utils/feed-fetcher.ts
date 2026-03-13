/**
 * Fetches raw XML text from a feed URL.
 * Returns the response text on success, throws on failure.
 */

export interface FetchResult {
  text: string
  status: number
}

export async function fetchFeed (url: string): Promise<FetchResult> {
  if (!url) {
    throw new Error('No feed URL configured')
  }

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Feed fetch failed: HTTP ${response.status} ${response.statusText}`)
  }

  const text = await response.text()

  if (!text.trim()) {
    throw new Error('Feed response was empty')
  }

  return {
    text,
    status: response.status
  }
}
