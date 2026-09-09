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
const MINOR_VERSION = '024' // r005.024 Test launch config, no runtime change. Adds tests/jest.config.js (same mechanism as query-simple) plus a full feed-simple tests README, because FeedSimple also ships standalone without query-simple. Verified in a FeedSimple-only layout against the stock 1.20 config: 9/9 suites, 298/298 tests. WHY A BUMP: this content was mistakenly published by overwriting r028.159's release zips in place, so that tag briefly served two different artifacts under identical filenames. r028.160 gives this content its own identity and r028.159's assets were restored to exactly what they were at publication (extracted from staging commit 0b3ccb653). PRIOR r005.023: Shared-code consumer bump (no functional change). QuerySimple's r028.136 tab-help Phase 4 added getTabHelpOperationsText + getTabHelpDrawText to shared-code/mapsimple-common/widget-config-manager.ts; FeedSimple is untouched. Bumped per the shared-code consumer rule. PRIOR r005.022: Shared-code consumer bump (no functional change). QuerySimple's r028.135 tab-help Phase 3 added getTabHelpEnabled + getTabHelpBackgroundColor to shared-code/mapsimple-common/widget-config-manager.ts; FeedSimple is untouched. Bumped per the shared-code consumer rule. PRIOR r005.021: Shared-code consumer bump (no functional change). QuerySimple's r028.134 tab-help Phase 2 added getTabHelpQueryText/getTabHelpSpatialText/getTabHelpResultsText to shared-code/mapsimple-common/widget-config-manager.ts; FeedSimple is untouched. Bumped per the shared-code consumer rule. PRIOR r005.020: Shared-code consumer bump (no functional change). QuerySimple's r028.125 hover-highlight Phase 3 added getHoverPinEnabled + getHoverHighlightFeature to shared-code/mapsimple-common/widget-config-manager.ts; FeedSimple is untouched. Bumped per the shared-code consumer rule. PRIOR r005.019: getHoverHighlightColor (Phase 2 consumer bump).

export const WIDGET_VERSION = MINOR_VERSION && Number(MINOR_VERSION) > 0
  ? `${BASE_VERSION}-r${RELEASE_NUMBER}.${MINOR_VERSION}`
  : `${BASE_VERSION}-r${RELEASE_NUMBER}`
