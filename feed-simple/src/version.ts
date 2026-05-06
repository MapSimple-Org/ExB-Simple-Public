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
const MINOR_VERSION = '016' // r005.016: Security: isDangerousUrl() blocks dangerous schemes in markdown links/images + resolveExternalLinkUrl. 26 security tests added.

export const WIDGET_VERSION = MINOR_VERSION && Number(MINOR_VERSION) > 0
  ? `${BASE_VERSION}-r${RELEASE_NUMBER}.${MINOR_VERSION}`
  : `${BASE_VERSION}-r${RELEASE_NUMBER}`
