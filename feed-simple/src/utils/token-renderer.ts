/**
 * FeedSimple token renderer — thin wrapper around shared-code.
 *
 * Re-exports the shared substituteTokens engine so existing FS imports
 * continue to work unchanged.
 *
 * r004.001: Core engine extracted to shared-code/mapsimple-common/token-renderer.ts
 */

export {
  substituteTokens,
  resolveExternalLinkUrl
} from '../../../shared-code/mapsimple-common'

export type {
  FilterContext
} from '../../../shared-code/mapsimple-common'
