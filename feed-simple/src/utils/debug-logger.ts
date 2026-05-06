/**
 * FeedSimple debug logger — thin wrapper around the shared DebugLogger.
 *
 * Usage:
 * - Add ?debug=all to URL to see all debug logs
 * - Add ?debug=FETCH,POLL to see specific feature logs
 * - Add ?debug=false to disable all debug logs
 *
 * Features:
 * - BUG: Known bugs/issues (always logs, even if debug=false)
 * - FETCH: Feed fetch requests and responses
 * - PARSE: XML parsing and item extraction
 * - RENDER: Card rendering and template substitution
 * - POLL: Polling lifecycle (interval, pause, resume, backoff)
 * - JOIN: Feature service spatial join (Mode B)
 * - FEED-LAYER: Feed map layer creation, sync, renderer, popups (Mode C)
 * - TEMPLATE: Token substitution and filter pipeline
 * - SETTINGS: Settings panel field discovery and configuration
 * - EXPORT: CSV export operations
 * - SEARCH: Search bar filtering
 * - SORT: Runtime sort operations
 * - FEATURE-EFFECT: Joined layer dimming during search/filter
 * - DARK-MODE: Theme mode detection and switching (light/dark)
 *
 * The DebugLogger class lives in shared-code/mapsimple-common/debug-logger.ts.
 * This file creates the FeedSimple singleton instance so all FS modules
 * import from the same local path: `import { debugLogger } from '../utils/debug-logger'`
 */
import { createFeedSimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

/**
 * Shared singleton debug logger for the FeedSimple widget.
 * Import this directly instead of creating per-module instances.
 */
export const debugLogger = createFeedSimpleDebugLogger()
