/**
 * Widget version number.
 * Base version matches Experience Builder version (1.19.0).
 * Release number increments on major changes (001, 002, 003, ...).
 * Minor version increments on smaller fixes between major releases (r001.1, r001.2, ...).
 *
 * To increment:
 * - Major change: Update RELEASE_NUMBER (e.g., 001 -> 002) and reset MINOR_VERSION to 0
 * - Minor fix: Increment MINOR_VERSION (e.g., 1 -> 2) while keeping same RELEASE_NUMBER
 */
const BASE_VERSION = '1.20.0'
const RELEASE_NUMBER = '005' // Increment on major changes (001, 002, 003, ...)
const MINOR_VERSION = '020' // r005.020: Shared-code consumer bump (no functional change). QuerySimple's r028.125 hover-highlight Phase 3 added getHoverPinEnabled + getHoverHighlightFeature to shared-code/mapsimple-common/widget-config-manager.ts; FeedSimple is untouched. Bumped per the shared-code consumer rule. PRIOR r005.019: getHoverHighlightColor (Phase 2 consumer bump).

export const WIDGET_VERSION = MINOR_VERSION && Number(MINOR_VERSION) > 0
  ? `${BASE_VERSION}-r${RELEASE_NUMBER}.${MINOR_VERSION}`
  : `${BASE_VERSION}-r${RELEASE_NUMBER}`
