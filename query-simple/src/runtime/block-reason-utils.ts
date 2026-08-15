/**
 * block-reason-utils - pure resolvers for WHY a Search action is blocked (r028.143, DCE batch
 * items 1+5, docs/specs/DCE_FEEDBACK_AUG2026_BRIEF.md).
 *
 * The buttons moved from native disabled to aria-disabled so they stay focusable and can explain
 * themselves (DCE a11y review; Christie's spatial report). These functions pick the message; they
 * do NOT decide executability - the callers' existing blocked expressions do that, and the
 * hash/dataAction automation paths never come through here (brief P1.9: guard lives in the
 * user-activation wrapper only).
 *
 * Kept pure (no React, no config reads) for cold-room testability.
 */

/** Query-form block reasons, most fundamental first. */
export type QueryFormBlockReason = 'datasource-loading' | 'input-invalid' | null

export function getQueryFormBlockReason (datasourceReady: boolean, isInputValid: boolean): QueryFormBlockReason {
  if (!datasourceReady) return 'datasource-loading'
  if (!isInputValid) return 'input-invalid'
  return null
}

/** i18n key per query-form reason. */
export const QUERY_FORM_REASON_I18N: Record<Exclude<QueryFormBlockReason, null>, string> = {
  'datasource-loading': 'searchBlockedLoading',
  'input-invalid': 'searchBlockedNoValue'
}

export interface SpatialBlockArgs {
  spatialMode: 'operations' | 'draw'
  hasResults: boolean
  hasDrawnGeometry: boolean
  /** The assembled input geometry exists. Assembly is async, so this can lag the flags above. */
  hasInputGeometry: boolean
  relationshipSelected: boolean
  layerCount: number
}

/**
 * Spatial block reasons in form order: geometry (mode input) -> relationship -> layers.
 * One user-actionable reason at a time (brief P5.2). The transient assembly-in-flight state
 * (mode input present, assembled geometry not yet) reports the mode's geometry reason - it
 * self-resolves and has no distinct user action (CRR U1).
 */
export type SpatialBlockReason = 'no-drawing' | 'no-results' | 'no-relationship' | 'no-layers' | null

export function getSpatialBlockReason (args: SpatialBlockArgs): SpatialBlockReason {
  const { spatialMode, hasResults, hasDrawnGeometry, hasInputGeometry, relationshipSelected, layerCount } = args
  if (spatialMode === 'draw' && !hasDrawnGeometry) return 'no-drawing'
  if (spatialMode === 'operations' && !hasResults) return 'no-results'
  if (!relationshipSelected) return 'no-relationship'
  if (layerCount <= 0) return 'no-layers'
  if (!hasInputGeometry) return spatialMode === 'draw' ? 'no-drawing' : 'no-results'
  return null
}

/** i18n key per spatial reason. */
export const SPATIAL_REASON_I18N: Record<Exclude<SpatialBlockReason, null>, string> = {
  'no-drawing': 'spatialBlockedNoDrawing',
  'no-results': 'spatialBlockedNoResults',
  'no-relationship': 'spatialBlockedNoRelationship',
  'no-layers': 'spatialBlockedNoLayers'
}
